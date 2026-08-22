export type SeoValues = {
  metaTitle: string;
  metaDescription: string;
  ogTitle: string;
  ogDescription: string;
  ogImageUrl?: string;
  canonicalUrl: string;
  noIndex: boolean;
  noFollow: boolean;
  focusKeyword: string;
  pageTitle: string;
  pageUrl: string;
};

export type SeoWarning = {
  id: string;
  message: string;
};

export function seoCounterTone(length: number, min: number, max: number): string {
  if (length >= min && length <= max) {
    return "text-success";
  }
  if (length >= min - 10 && length <= max + 20) {
    return "text-warning";
  }
  return "text-destructive";
}

export function computeSeoScore(values: SeoValues): {
  score: number;
  warnings: SeoWarning[];
} {
  const warnings: SeoWarning[] = [];
  let score = 0;
  const title = values.metaTitle || values.pageTitle;
  const description = values.metaDescription;
  const keyword = values.focusKeyword.trim().toLowerCase();

  if (title.length >= 50 && title.length <= 60) {
    score += 20;
  } else {
    warnings.push({ id: "title-length", message: "Meta title should be 50–60 characters." });
  }
  if (description.length >= 140 && description.length <= 160) {
    score += 20;
  } else {
    warnings.push({
      id: "desc-length",
      message: "Meta description should be 140–160 characters.",
    });
  }
  if (keyword && title.toLowerCase().includes(keyword)) {
    score += 15;
  } else if (keyword) {
    warnings.push({ id: "kw-title", message: "Include the focus keyword in the title." });
  }
  if (keyword && description.toLowerCase().includes(keyword)) {
    score += 15;
  } else if (keyword) {
    warnings.push({
      id: "kw-desc",
      message: "Include the focus keyword in the meta description.",
    });
  }
  if (!keyword) {
    warnings.push({ id: "kw", message: "Add a focus keyword." });
  }
  if (values.ogTitle || values.ogDescription || values.ogImageUrl) {
    score += 10;
  } else {
    warnings.push({ id: "og", message: "Add Open Graph title, description, or image." });
  }
  if (!values.noIndex) {
    score += 10;
  } else {
    warnings.push({ id: "noindex", message: "This URL is set to noindex." });
  }
  if (values.canonicalUrl || values.pageUrl) {
    score += 10;
  }
  return { score, warnings };
}
