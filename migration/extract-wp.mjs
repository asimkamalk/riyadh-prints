#!/usr/bin/env node
/**
 * Pull the live WordPress/WooCommerce catalogue from riyadhprints.com into
 * normalised JSON + a local media mirror.
 *
 *   node migration/extract-wp.mjs
 *   node migration/extract-wp.mjs --dry-run
 *
 * Optional env: WC_CONSUMER_KEY, WC_CONSUMER_SECRET (Woo REST).
 * Site uses Polylang (`lang`, `translations`) and AIOSEO (`aioseo_head_json`).
 * Yoast (`yoast_head_json`) and Rank Math fields are captured when present.
 */

import { createWriteStream, readFileSync } from "node:fs";
import {
  access,
  mkdir,
  readFile,
  rename,
  stat,
  writeFile,
} from "node:fs/promises";
import { basename, dirname, join } from "node:path";
import { pipeline } from "node:stream/promises";
import { fileURLToPath } from "node:url";
import { fetch } from "undici";

const SITE = "https://riyadhprints.com";
const PER_PAGE = 100;
const LANGUAGES = ["en", "ar"];
const MAX_RETRIES = 6;
const BASE_DELAY_MS = 1000;
const PAGE_DELAY_MS = 150;
const MEDIA_CONCURRENCY = 4;
const USER_AGENT =
  "Mozilla/5.0 (compatible; RiyadhPrintsMigration/1.0; +https://riyadhprints.com)";

const CORE_REST = new Set([
  "posts",
  "pages",
  "media",
  "categories",
  "tags",
  "users",
]);

const SKIP_TYPE_SLUGS = new Set(["attachment"]);

const ROOT = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(ROOT, "data");
const MEDIA_DIR = join(ROOT, "media");
const MANIFEST_PATH = join(DATA_DIR, "media-manifest.json");

const args = new Set(process.argv.slice(2));
const dryRun = args.has("--dry-run");

const state = {
  types: {},
  taxonomies: {},
  languages: LANGUAGES,
  itemsByType: new Map(),
  mediaById: new Map(),
  usersById: new Map(),
  termsByTaxonomy: new Map(),
  allUrls: [],
  sitemapImages: [],
  mediaManifest: [],
};

await main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

async function main() {
  loadDotEnv(join(ROOT, "..", ".env"));

  if (dryRun) {
    console.log("Dry run: fetch + summarise only. No files will be written.\n");
  }

  await loadExistingManifest();

  console.log("Fetching /wp-json/wp/v2/types …");
  state.types = await fetchJson(`${SITE}/wp-json/wp/v2/types`);
  printTypes(state.types);
  await writeJson(join(DATA_DIR, "types.json"), state.types);

  try {
    const pll = await fetchJson(`${SITE}/wp-json/pll/v1/languages`);
    if (Array.isArray(pll) && pll.length > 0) {
      state.languages = pll.map((lang) => lang.slug).filter(Boolean);
      console.log(`Polylang languages: ${state.languages.join(", ")}`);
    }
  } catch (error) {
    console.warn(`Polylang languages unavailable (${error.message}); using en, ar.`);
  }

  state.taxonomies = await fetchJson(`${SITE}/wp-json/wp/v2/taxonomies`);
  await writeJson(join(DATA_DIR, "taxonomies.json"), state.taxonomies);

  await fetchCoreCollections();
  await fetchDiscoveredTypes();
  await fetchTaxonomyTerms();
  await fetchWooOrScrapeProducts();
  await fetchSitemaps();

  const normalised = normaliseAll();
  for (const [type, items] of Object.entries(normalised)) {
    if (items.length === 0) {
      continue;
    }
    await writeJson(join(DATA_DIR, `${safeFileName(type)}.json`), items);
  }

  await writeJson(join(DATA_DIR, "all-urls.json"), {
    source: `${SITE}/sitemap_index.xml`,
    fetchedAt: new Date().toISOString(),
    count: state.allUrls.length,
    urls: state.allUrls,
  });

  const mediaStats = await downloadAllMedia(normalised);
  printSummary(normalised, mediaStats);
}

async function fetchCoreCollections() {
  const specs = [
    ["pages", "/wp-json/wp/v2/pages", { perLang: true }],
    ["posts", "/wp-json/wp/v2/posts", { perLang: true }],
    ["categories", "/wp-json/wp/v2/categories", { perLang: true }],
    ["tags", "/wp-json/wp/v2/tags", { perLang: true }],
    ["media", "/wp-json/wp/v2/media", { perLang: false }],
    ["users", "/wp-json/wp/v2/users", { perLang: false }],
  ];

  for (const [type, path, options] of specs) {
    const items = await fetchCollection(type, path, options);
    rememberCollection(type, items);
    if (type === "media") {
      for (const item of items) {
        state.mediaById.set(item.id, item);
      }
    }
    if (type === "users") {
      for (const item of items) {
        state.usersById.set(item.id, item);
      }
    }
  }
}

async function fetchDiscoveredTypes() {
  for (const [slug, type] of Object.entries(state.types)) {
    if (SKIP_TYPE_SLUGS.has(slug)) {
      continue;
    }
    const restBase = type.rest_base;
    if (!restBase || restBase.includes("(") || CORE_REST.has(restBase)) {
      continue;
    }
    const path = `/wp-json/${type.rest_namespace || "wp/v2"}/${restBase}`;
    try {
      const items = await fetchCollection(slug, path, { perLang: true });
      rememberCollection(slug, items);
    } catch (error) {
      console.warn(`Skipping type "${slug}" (${path}): ${error.message}`);
    }
  }
}

async function fetchTaxonomyTerms() {
  for (const [slug, taxonomy] of Object.entries(state.taxonomies)) {
    const restBase = taxonomy.rest_base;
    if (!restBase || CORE_REST.has(restBase)) {
      continue;
    }
    const path = `/wp-json/${taxonomy.rest_namespace || "wp/v2"}/${restBase}`;
    try {
      const items = await fetchCollection(slug, path, { perLang: true });
      rememberCollection(slug, items);
      state.termsByTaxonomy.set(slug, items);
    } catch (error) {
      console.warn(`Skipping taxonomy "${slug}": ${error.message}`);
    }
  }

  for (const core of ["category", "post_tag"]) {
    const typeName = core === "category" ? "categories" : "tags";
    const items = state.itemsByType.get(typeName) ?? [];
    state.termsByTaxonomy.set(core, items);
  }
}

async function fetchWooOrScrapeProducts() {
  const key = process.env.WC_CONSUMER_KEY;
  const secret = process.env.WC_CONSUMER_SECRET;

  if (key && secret) {
    const auth = Buffer.from(`${key}:${secret}`).toString("base64");
    const headers = { Authorization: `Basic ${auth}` };
    try {
      const products = await fetchPaginated(
        "/wp-json/wc/v3/products",
        { headers, label: "wc:products" },
      );
      const categories = await fetchPaginated(
        "/wp-json/wc/v3/products/categories",
        { headers, label: "wc:product-categories" },
      );
      rememberCollection("wc-products", products);
      rememberCollection("wc-product-categories", categories);
      console.log(
        `Woo REST: ${products.length} products, ${categories.length} categories.`,
      );
      return;
    } catch (error) {
      console.warn(`Woo REST failed (${error.message}); falling back to sitemap scrape.`);
    }
  } else {
    console.log("No Woo REST keys; will scrape product URLs from the sitemap if needed.");
  }

  // Public /wp/v2/product is already fetched as a discovered type.
  // Sitemap scrape fills gaps and captures product-category landing pages.
}

async function fetchSitemaps() {
  const indexCandidates = [`${SITE}/sitemap_index.xml`, `${SITE}/sitemap.xml`];
  const childSitemaps = new Set();
  let loadedAny = false;

  for (const url of indexCandidates) {
    try {
      const xml = await fetchText(url);
      const parsed = parseSitemapXml(xml, url);
      loadedAny = true;
      if (parsed.kind === "index") {
        console.log(`Sitemap index ${url}: ${parsed.locs.length} child sitemaps.`);
        for (const loc of parsed.locs) {
          childSitemaps.add(loc);
        }
      } else {
        ingestUrlset(parsed, url);
        console.log(`Sitemap ${url}: ${parsed.urls.length} URLs (flat urlset).`);
      }
    } catch (error) {
      console.warn(`Could not load ${url}: ${error.message}`);
    }
  }

  for (const child of childSitemaps) {
    try {
      const xml = await fetchText(child);
      ingestUrlset(parseSitemapXml(xml, child), child);
    } catch (error) {
      console.warn(`Child sitemap ${child}: ${error.message}`);
    }
  }

  if (!loadedAny) {
    console.warn("No sitemap could be loaded. all-urls.json will be built from REST permalinks.");
  }

  const restUrls = collectRestPermalinkUrls();
  const seen = new Set(state.allUrls.map((entry) => entry.loc));
  for (const loc of restUrls) {
    if (!seen.has(loc)) {
      seen.add(loc);
      state.allUrls.push({
        loc,
        path: permalinkPath(loc),
        lastmod: null,
        images: [],
        source: "wp-rest",
      });
    }
  }

  await scrapeMissingProducts();
}

function ingestUrlset(parsed, source) {
  const seen = new Set(state.allUrls.map((entry) => entry.loc));
  for (const entry of parsed.urls) {
    if (seen.has(entry.loc)) {
      continue;
    }
    seen.add(entry.loc);
    state.allUrls.push({ ...entry, source });
    for (const image of entry.images) {
      state.sitemapImages.push(image);
    }
  }
}

function collectRestPermalinkUrls() {
  const urls = [];
  for (const items of state.itemsByType.values()) {
    for (const item of items) {
      if (typeof item.link === "string" && item.link) {
        urls.push(item.link);
      }
    }
  }
  return urls;
}

async function scrapeMissingProducts() {
  const knownPaths = new Set();
  for (const type of ["product", "product_cat", "wc-products", "wc-product-categories"]) {
    for (const item of state.itemsByType.get(type) ?? []) {
      if (item.link) {
        knownPaths.add(permalinkPath(item.link));
      }
    }
  }

  const productUrls = state.allUrls.filter((entry) => {
    const path = entry.path || permalinkPath(entry.loc);
    return isProductPath(path) && !knownPaths.has(path);
  });

  if (productUrls.length === 0) {
    console.log("No extra product/product-category URLs to scrape from the sitemap.");
    return;
  }

  console.log(`Scraping ${productUrls.length} sitemap product URLs not present in REST.`);
  const scraped = [];
  for (const entry of productUrls) {
    try {
      const html = await fetchText(entry.loc);
      scraped.push(scrapeHtmlItem(html, entry.loc));
      await sleep(PAGE_DELAY_MS);
    } catch (error) {
      console.warn(`Scrape failed ${entry.loc}: ${error.message}`);
    }
  }
  rememberCollection("scraped-products", scraped);
}

function isProductPath(path) {
  return (
    /\/product\/[^/]+\/?$/.test(path) ||
    /\/product-category\//.test(path) ||
    /\/ar\/product\//.test(path) ||
    /\/ar\/product-category\//.test(path)
  );
}

function scrapeHtmlItem(html, url) {
  const path = permalinkPath(url);
  const isCategory = path.includes("/product-category/");
  const title =
    metaContent(html, "og:title") ||
    textBetween(html, "<title>", "</title>") ||
    "";
  const description =
    metaContent(html, "og:description") ||
    metaContent(html, "description") ||
    "";
  const canonical = metaContent(html, "canonical") || linkRel(html, "canonical") || url;
  const ogImage = metaContent(html, "og:image");
  const robots = metaContent(html, "robots");
  const contentMatch = html.match(
    /<(?:div|section)[^>]*(?:entry-content|woocommerce-Tabs-panel--description|product-details)[^>]*>([\s\S]*?)<\/(?:div|section)>/i,
  );

  return {
    id: path,
    slug: path.split("/").filter(Boolean).at(-1) ?? "",
    type: isCategory ? "product_category" : "product",
    link: url,
    status: "publish",
    lang: path.startsWith("/ar/") ? "ar" : "en",
    title: { rendered: decodeHtml(title) },
    excerpt: { rendered: decodeHtml(description) },
    content: { rendered: contentMatch ? contentMatch[1] : "" },
    featured_media: 0,
    parent: 0,
    menu_order: 0,
    author: 0,
    date: null,
    modified: null,
    yoast_head_json: {
      title: decodeHtml(title),
      description: decodeHtml(description),
      canonical,
      og_image: ogImage ? [{ url: ogImage }] : [],
      robots,
    },
    _scraped: true,
  };
}

function rememberCollection(type, items) {
  const existing = state.itemsByType.get(type) ?? [];
  const byId = new Map(existing.map((item) => [item.id, item]));
  for (const item of items) {
    const previous = byId.get(item.id);
    if (!previous) {
      byId.set(item.id, item);
      continue;
    }
    byId.set(item.id, {
      ...previous,
      ...item,
      lang: item.lang || previous.lang,
      translations: item.translations ?? previous.translations,
    });
  }
  state.itemsByType.set(type, [...byId.values()]);
}

async function fetchCollection(label, path, { perLang }) {
  if (!perLang) {
    return fetchPaginated(path, { label });
  }

  const all = [];
  for (const lang of state.languages) {
    const items = await fetchPaginated(path, { label: `${label}:${lang}`, lang });
    all.push(...items);
  }
  return all;
}

async function fetchPaginated(path, { label, lang, headers } = {}) {
  const items = [];
  let page = 1;
  let totalPages = 1;

  do {
    const url = new URL(path, SITE);
    url.searchParams.set("per_page", String(PER_PAGE));
    url.searchParams.set("page", String(page));
    if (lang) {
      url.searchParams.set("lang", lang);
    }

    const { json, responseHeaders, status } = await requestJson(url, { headers });
    if (status === 401 || status === 403) {
      throw new Error(`HTTP ${status}`);
    }
    if (status === 400 && page > 1) {
      break;
    }
    if (!Array.isArray(json)) {
      throw new Error(`Expected array from ${url}, got ${typeof json}`);
    }

    items.push(...json);
    totalPages = Number(
      responseHeaders.get("x-wp-totalpages") ??
        responseHeaders.get("X-WP-TotalPages") ??
        (json.length < PER_PAGE ? page : page + 1),
    );
    const total = responseHeaders.get("x-wp-total") ?? responseHeaders.get("X-WP-Total");
    console.log(
      `[${label}] page ${page}/${totalPages || "?"} (${json.length} items${total ? `, ${total} total` : ""})`,
    );

    page += 1;
    if (json.length === 0) {
      break;
    }
    await sleep(PAGE_DELAY_MS);
  } while (page <= totalPages);

  return items;
}

function normaliseAll() {
  const out = {};
  for (const [type, items] of state.itemsByType) {
    out[type] = items.map((item) => normaliseItem(item, type));
  }
  return out;
}

function normaliseItem(item, fallbackType) {
  const type = item.type || fallbackType;
  const title = rendered(item.title) || item.name || "";
  const excerpt = rendered(item.excerpt) || item.description || "";
  const contentHtml = rendered(item.content);
  const language = inferLang(item);
  const translations = item.translations ?? null;
  const featuredImageUrl = resolveFeaturedImage(item);
  const inlineImageUrls = extractImageUrls(contentHtml);

  return {
    id: item.id,
    type,
    slug: item.slug ?? "",
    permalinkPath: item.link ? permalinkPath(item.link) : `/${item.slug ?? ""}`,
    permalink: item.link ?? null,
    parent: item.parent ?? 0,
    language,
    translationGroupId: translationGroupId(translations, item.id),
    translations,
    title,
    excerpt,
    contentHtml,
    featuredImageUrl,
    inlineImageUrls,
    date: item.date ?? item.date_gmt ?? null,
    modified: item.modified ?? item.modified_gmt ?? null,
    author: resolveAuthor(item.author),
    taxonomyTerms: resolveTaxonomyTerms(item),
    menuOrder: item.menu_order ?? 0,
    seo: extractSeo(item),
  };
}

function inferLang(item) {
  if (item.lang === "ar" || item.lang === "en") {
    return item.lang;
  }
  if (typeof item.link === "string") {
    const path = permalinkPath(item.link);
    if (path === "/ar" || path.startsWith("/ar/")) {
      return "ar";
    }
  }
  return "en";
}

function translationGroupId(translations, id) {
  if (!translations || typeof translations !== "object") {
    return id ?? null;
  }
  const ids = Object.values(translations)
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value) && value > 0)
    .sort((a, b) => a - b);
  return ids[0] ?? id ?? null;
}

function resolveFeaturedImage(item) {
  const id = item.featured_media;
  if (id && state.mediaById.has(id)) {
    return state.mediaById.get(id).source_url ?? null;
  }
  const embedded = item._embedded?.["wp:featuredmedia"]?.[0];
  if (embedded?.source_url) {
    return embedded.source_url;
  }
  return null;
}

function resolveAuthor(author) {
  if (author && typeof author === "object") {
    return {
      id: author.id ?? null,
      name: author.name ?? null,
      slug: author.slug ?? null,
    };
  }
  const user = state.usersById.get(author);
  if (user) {
    return { id: user.id, name: user.name, slug: user.slug };
  }
  if (!author) {
    return null;
  }
  return { id: author, name: null, slug: null };
}

function resolveTaxonomyTerms(item) {
  const result = {};
  for (const [taxSlug, taxonomy] of Object.entries(state.taxonomies)) {
    const restBase = taxonomy.rest_base;
    const ids = item[taxSlug] ?? item[restBase];
    if (!Array.isArray(ids) || ids.length === 0 || typeof ids[0] === "object") {
      continue;
    }
    const terms = state.termsByTaxonomy.get(taxSlug) ?? [];
    const byId = new Map(terms.map((term) => [term.id, term]));
    result[taxSlug] = ids.map((id) => {
      const term = byId.get(id);
      return term
        ? { id: term.id, slug: term.slug, name: decodeHtml(term.name ?? "") }
        : { id, slug: null, name: null };
    });
  }
  return result;
}

function extractSeo(item) {
  const yoast = item.yoast_head_json ?? {};
  const rankMath = item.rank_math ?? {};
  const aio = item.aioseo_head_json ?? {};
  const aioMeta = item.aioseo_meta_data ?? {};

  const yoastImage = Array.isArray(yoast.og_image)
    ? yoast.og_image[0]?.url
    : yoast.og_image;
  const rankImage = rankMath.og_image || rankMath.facebook_image;

  const robots = firstString(
    formatYoastRobots(yoast.robots),
    rankMath.robots,
    aio.robots,
    formatAioRobots(aioMeta),
  );

  return {
    title: firstString(yoast.title, rankMath.title, aio.title, aioMeta.title),
    description: firstString(
      yoast.description,
      rankMath.description,
      aio.description,
      aioMeta.description,
    ),
    canonical: firstString(
      yoast.canonical,
      rankMath.canonical_url,
      aio.canonical_url,
      aioMeta.canonical_url,
    ),
    ogImage: firstString(
      yoastImage,
      rankImage,
      aio["og:image"],
      aio["og:image:secure_url"],
      aioMeta.og_image_url,
    ),
    robots,
    source: yoast.title || yoast.description
      ? "yoast"
      : aio.title || aio.description
        ? "aioseo"
        : rankMath.title
          ? "rankmath"
          : null,
  };
}

function formatYoastRobots(robots) {
  if (!robots) {
    return "";
  }
  if (typeof robots === "string") {
    return robots;
  }
  return Object.entries(robots)
    .filter(([, value]) => value && value !== "no")
    .map(([key, value]) => (value === "yes" || value === true ? key : String(value)))
    .join(", ");
}

function formatAioRobots(meta) {
  if (!meta || typeof meta !== "object") {
    return "";
  }
  const flags = [];
  if (meta.robots_noindex) flags.push("noindex");
  if (meta.robots_nofollow) flags.push("nofollow");
  if (meta.robots_noarchive) flags.push("noarchive");
  if (meta.robots_nosnippet) flags.push("nosnippet");
  if (meta.robots_noimageindex) flags.push("noimageindex");
  return flags.join(", ") || (meta.robots_default ? "index, follow" : "");
}

async function downloadAllMedia(normalised) {
  const urls = new Map();

  function add(url, extra = {}) {
    if (!url || typeof url !== "string") {
      return;
    }
    const absolute = absolutize(url);
    if (!absolute || !/^https?:/i.test(absolute)) {
      return;
    }
    if (!urls.has(absolute)) {
      urls.set(absolute, { originalUrl: absolute, ...extra });
    }
  }

  for (const media of state.mediaById.values()) {
    add(media.source_url, {
      altText: media.alt_text ?? "",
      width: media.media_details?.width ?? null,
      height: media.media_details?.height ?? null,
    });
  }

  for (const items of Object.values(normalised)) {
    for (const item of items) {
      add(item.featuredImageUrl);
      add(item.seo?.ogImage);
      for (const url of item.inlineImageUrls ?? []) {
        add(url);
      }
    }
  }

  for (const url of state.sitemapImages) {
    add(url);
  }

  const list = [...urls.values()];
  console.log(`Media URLs collected: ${list.length}`);

  const stats = { downloaded: 0, skipped: 0, failed: 0, planned: list.length };
  const manifestByUrl = new Map(
    state.mediaManifest.map((entry) => [entry.originalUrl, entry]),
  );

  if (dryRun) {
    console.log(`Dry run: would download ${list.length} media files.`);
    return stats;
  }

  await mkdir(MEDIA_DIR, { recursive: true });

  await mapPool(list, MEDIA_CONCURRENCY, async (entry, index) => {
    const relative = uploadsRelativePath(entry.originalUrl);
    const localPath = join(MEDIA_DIR, relative);
    const record = {
      originalUrl: entry.originalUrl,
      localPath: relative.replaceAll("\\", "/"),
      altText: entry.altText ?? "",
      width: entry.width ?? null,
      height: entry.height ?? null,
    };

    try {
      if (await fileExists(localPath)) {
        const info = await stat(localPath);
        if (info.size > 0) {
          stats.skipped += 1;
          manifestByUrl.set(entry.originalUrl, record);
          logMediaProgress(index, list.length, stats);
          return;
        }
      }
      await mkdir(dirname(localPath), { recursive: true });
      await downloadFile(entry.originalUrl, localPath);
      stats.downloaded += 1;
      manifestByUrl.set(entry.originalUrl, record);
    } catch (error) {
      stats.failed += 1;
      console.warn(`Media failed ${entry.originalUrl}: ${error.message}`);
    }
    logMediaProgress(index, list.length, stats);
  });

  state.mediaManifest = [...manifestByUrl.values()];
  await writeJson(MANIFEST_PATH, state.mediaManifest);
  return stats;
}

function logMediaProgress(index, total, stats) {
  if ((index + 1) % 25 === 0 || index + 1 === total) {
    console.log(
      `[media] ${index + 1}/${total} (downloaded ${stats.downloaded}, skipped ${stats.skipped}, failed ${stats.failed})`,
    );
  }
}

async function downloadFile(url, dest) {
  const tmp = `${dest}.part`;
  const response = await fetchWithRetry(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  if (!response.body) {
    throw new Error("Empty body");
  }
  await pipeline(response.body, createWriteStream(tmp));
  await rename(tmp, dest);
}

function printTypes(types) {
  const rows = Object.entries(types).map(([slug, type]) => ({
    slug,
    name: type.name,
    rest_base: type.rest_base,
    namespace: type.rest_namespace,
    taxonomies: (type.taxonomies ?? []).join(", "),
  }));
  console.log("\nDiscovered post types:");
  console.table(rows);
}

function printSummary(normalised, mediaStats) {
  const rows = [];
  for (const [type, items] of Object.entries(normalised).sort(([a], [b]) =>
    a.localeCompare(b),
  )) {
    const en = items.filter((item) => item.language === "en").length;
    const ar = items.filter((item) => item.language === "ar").length;
    if (items.length === 0) {
      continue;
    }
    rows.push({ type, en, ar, total: items.length });
  }
  console.log("\nExtraction summary (counts per type per language):");
  console.table(rows);
  console.log(
    `Media: ${mediaStats.planned} URLs, ${mediaStats.downloaded} downloaded, ${mediaStats.skipped} skipped, ${mediaStats.failed} failed.`,
  );
  if (dryRun) {
    console.log("Dry run complete. Re-run without --dry-run to write JSON and media.");
  } else {
    console.log(`Wrote JSON to ${DATA_DIR}`);
    console.log(`Wrote media to ${MEDIA_DIR}`);
  }
}

async function requestJson(url, { headers } = {}) {
  const response = await fetchWithRetry(url, {
    headers: { Accept: "application/json", ...headers },
  });
  const text = await response.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    throw new Error(`Invalid JSON from ${url} (HTTP ${response.status})`);
  }
  if (!response.ok && response.status !== 400 && response.status !== 401 && response.status !== 403) {
    const message = json?.message || `HTTP ${response.status}`;
    throw new Error(message);
  }
  return {
    json,
    status: response.status,
    responseHeaders: response.headers,
  };
}

async function fetchJson(url) {
  const { json, status } = await requestJson(url);
  if (status >= 400) {
    throw new Error(`HTTP ${status} for ${url}`);
  }
  return json;
}

async function fetchText(url) {
  const response = await fetchWithRetry(url, {
    headers: { Accept: "text/xml, application/xml, text/html, */*" },
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return response.text();
}

async function fetchWithRetry(url, options = {}) {
  let lastError;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt += 1) {
    try {
      const response = await fetch(String(url), {
        ...options,
        redirect: "follow",
        headers: {
          "User-Agent": USER_AGENT,
          ...options.headers,
        },
      });
      if (response.status === 429 || response.status >= 500) {
        const retryAfter = response.headers.get("retry-after");
        const delay = retryAfter
          ? Number(retryAfter) * 1000
          : BASE_DELAY_MS * 2 ** attempt;
        await response.arrayBuffer().catch(() => undefined);
        console.warn(
          `Retry ${attempt + 1}/${MAX_RETRIES} for ${url} (HTTP ${response.status}) in ${delay}ms`,
        );
        await sleep(Math.min(delay, 30_000));
        continue;
      }
      return response;
    } catch (error) {
      lastError = error;
      const delay = BASE_DELAY_MS * 2 ** attempt;
      console.warn(
        `Retry ${attempt + 1}/${MAX_RETRIES} for ${url} (${error.message}) in ${delay}ms`,
      );
      await sleep(Math.min(delay, 30_000));
    }
  }
  throw lastError ?? new Error(`Exhausted retries for ${url}`);
}

function parseSitemapXml(xml, source) {
  const locs = [...xml.matchAll(/<loc>\s*(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?\s*<\/loc>/gi)].map(
    (match) => decodeXml(match[1].trim()),
  );

  if (/<sitemapindex[\s>]/i.test(xml)) {
    return { kind: "index", locs, urls: [], source };
  }

  const urls = [];
  const blocks = xml.split(/<url[\s>]/i).slice(1);
  if (blocks.length === 0) {
    urls.push(
      ...locs.map((loc) => ({
        loc,
        path: permalinkPath(loc),
        lastmod: null,
        images: [],
      })),
    );
    return { kind: "urlset", locs, urls, source };
  }

  for (const block of blocks) {
    const loc = decodeXml(
      block.match(/<loc>\s*(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?\s*<\/loc>/i)?.[1]?.trim() ?? "",
    );
    if (!loc) {
      continue;
    }
    const lastmod = decodeXml(
      block.match(/<lastmod>\s*(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?\s*<\/lastmod>/i)?.[1]?.trim() ??
        "",
    );
    const images = [
      ...block.matchAll(
        /<image:loc>\s*(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?\s*<\/image:loc>/gi,
      ),
    ].map((match) => decodeXml(match[1].trim()));
    urls.push({
      loc,
      path: permalinkPath(loc),
      lastmod: lastmod || null,
      images,
    });
  }

  return { kind: "urlset", locs, urls, source };
}

function extractImageUrls(html) {
  if (!html) {
    return [];
  }
  const urls = new Set();
  for (const match of html.matchAll(/<img\b[^>]*\bsrc=["']([^"']+)["']/gi)) {
    urls.add(absolutize(match[1]));
  }
  for (const match of html.matchAll(/\bsrcset=["']([^"']+)["']/gi)) {
    for (const part of match[1].split(",")) {
      const url = part.trim().split(/\s+/)[0];
      if (url) {
        urls.add(absolutize(url));
      }
    }
  }
  for (const match of html.matchAll(/url\((['"]?)(https?:\/\/[^'")]+)\1\)/gi)) {
    urls.add(match[2]);
  }
  return [...urls].filter(Boolean);
}

function uploadsRelativePath(urlString) {
  try {
    const url = new URL(urlString);
    const marker = "/wp-content/uploads/";
    const index = url.pathname.indexOf(marker);
    if (index !== -1) {
      return decodeURIComponent(url.pathname.slice(index + marker.length));
    }
    const base = basename(url.pathname) || "file";
    return join("_external", base);
  } catch {
    return join("_external", "file");
  }
}

function permalinkPath(urlString) {
  try {
    return new URL(urlString).pathname;
  } catch {
    return urlString;
  }
}

function absolutize(url) {
  if (!url) {
    return "";
  }
  try {
    return new URL(url, SITE).href;
  } catch {
    return url;
  }
}

function rendered(value) {
  if (!value) {
    return "";
  }
  if (typeof value === "string") {
    return decodeHtml(value);
  }
  if (typeof value.rendered === "string") {
    return decodeHtml(value.rendered);
  }
  return "";
}

function decodeHtml(value) {
  return String(value)
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, num) => String.fromCharCode(Number(num)))
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .trim();
}

function decodeXml(value) {
  return decodeHtml(value);
}

function firstString(...values) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return "";
}

function metaContent(html, name) {
  const patterns = [
    new RegExp(
      `<meta[^>]+(?:property|name|itemprop)=["']${escapeRegExp(name)}["'][^>]*content=["']([^"']*)["']`,
      "i",
    ),
    new RegExp(
      `<meta[^>]+content=["']([^"']*)["'][^>]*(?:property|name|itemprop)=["']${escapeRegExp(name)}["']`,
      "i",
    ),
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) {
      return decodeHtml(match[1]);
    }
  }
  return "";
}

function linkRel(html, rel) {
  const match = html.match(
    new RegExp(`<link[^>]+rel=["']${escapeRegExp(rel)}["'][^>]*href=["']([^"']+)["']`, "i"),
  );
  return match?.[1] ? decodeHtml(match[1]) : "";
}

function textBetween(html, start, end) {
  const index = html.toLowerCase().indexOf(start.toLowerCase());
  if (index === -1) {
    return "";
  }
  const from = index + start.length;
  const close = html.toLowerCase().indexOf(end.toLowerCase(), from);
  if (close === -1) {
    return "";
  }
  return decodeHtml(html.slice(from, close));
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function safeFileName(type) {
  return String(type).replace(/[^a-z0-9._-]+/gi, "-");
}

async function mapPool(items, limit, fn) {
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const index = next;
      next += 1;
      await fn(items[index], index);
    }
  }
  const workers = Array.from({ length: Math.min(limit, items.length) }, () => worker());
  await Promise.all(workers);
}

async function writeJson(path, data) {
  if (dryRun) {
    return;
  }
  await mkdir(dirname(path), { recursive: true });
  const tmp = `${path}.tmp`;
  await writeFile(tmp, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  try {
    await rename(tmp, path);
  } catch {
    await writeFile(path, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  }
}

async function loadExistingManifest() {
  try {
    const raw = await readFile(MANIFEST_PATH, "utf8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      state.mediaManifest = parsed;
      console.log(`Resuming with ${parsed.length} existing media-manifest entries.`);
    }
  } catch {
    state.mediaManifest = [];
  }
}

async function fileExists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

function loadDotEnv(path) {
  try {
    const text = readFileSync(path, "utf8");
    for (const line of text.split(/\r?\n/)) {
      if (!line || line.startsWith("#")) {
        continue;
      }
      const index = line.indexOf("=");
      if (index === -1) {
        continue;
      }
      const key = line.slice(0, index).trim();
      let value = line.slice(index + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (key && process.env[key] === undefined) {
        process.env[key] = value;
      }
    }
  } catch {
    // Optional .env
  }
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
