import type { Locale } from "@/i18n/locales";

const copy = {
  shop: { en: "Shop", ar: "المتجر" },
  shopIntro: {
    en: "Printed in Ghubairah. Request a quote — there is no cart.",
    ar: "طباعة في غبيرة. اطلب عرض سعر — لا توجد سلة.",
  },
  productCategories: { en: "Product categories", ar: "تصنيفات المنتجات" },
  productTags: { en: "Product tags", ar: "وسوم المنتجات" },
  recentProducts: { en: "Products", ar: "المنتجات" },
  searchProductsPlaceholder: { en: "Search products…", ar: "ابحث في المنتجات…" },
  gridView: { en: "Grid view", ar: "عرض شبكي" },
  listView: { en: "List view", ar: "عرض قائمة" },
  filter: { en: "Filter", ar: "تصفية" },
  allCategories: { en: "All categories", ar: "كل التصنيفات" },
  sort: { en: "Sort", ar: "ترتيب" },
  sortFeatured: { en: "Default sorting", ar: "الترتيب الافتراضي" },
  sortNewest: { en: "Newest", ar: "الأحدث" },
  sortOldest: { en: "Oldest", ar: "الأقدم" },
  sortNameAsc: { en: "Name A–Z", ar: "الاسم أ–ي" },
  sortNameDesc: { en: "Name Z–A", ar: "الاسم ي–أ" },
  sortPriceAsc: { en: "Price: low to high", ar: "السعر: من الأقل" },
  sortPriceDesc: { en: "Price: high to low", ar: "السعر: من الأعلى" },
  searchProducts: { en: "Search products", ar: "ابحث في المنتجات" },
  apply: { en: "Apply", ar: "تطبيق" },
  emptyProducts: { en: "No products match these filters.", ar: "لا توجد منتجات لهذه التصفية." },
  related: { en: "Related products", ar: "منتجات ذات صلة" },
  relatedPosts: { en: "Related articles", ar: "مقالات ذات صلة" },
  faqs: { en: "Frequently asked questions", ar: "الأسئلة الشائعة" },
  description: { en: "Description", ar: "الوصف" },
  reviews: { en: "Reviews", ar: "التقييمات" },
  noReviews: {
    en: "No reviews yet. We quote in writing — Request a Quote or WhatsApp with the size and date.",
    ar: "لا توجد تقييمات بعد. نكتب العرض — اطلبوا عرض سعر أو واتساب مع المقاس والموعد.",
  },
  specs: { en: "Specifications", ar: "المواصفات" },
  options: { en: "Options", ar: "الخيارات" },
  priceTiers: { en: "Quantity pricing", ar: "أسعار الكميات" },
  qty: { en: "Quantity", ar: "الكمية" },
  unitPrice: { en: "Unit price", ar: "سعر الوحدة" },
  materials: { en: "Materials", ar: "المواد" },
  details: { en: "Details", ar: "التفاصيل" },
  services: { en: "Services", ar: "الخدمات" },
  servicesIntro: {
    en: "Offset, digital, large format, and finishing — quoted before we print.",
    ar: "أوفست ورقمي وعرض كبير وتشطيب — نعرض السعر قبل الطباعة.",
  },
  benefits: { en: "Benefits", ar: "المزايا" },
  process: { en: "How it works", ar: "كيف نعمل" },
  blogs: { en: "Print notes", ar: "ملاحظات الطباعة" },
  blogsIntro: {
    en: "Paper, capacity, and campaign timing from the Ghubairah floor.",
    ar: "ورق وطاقة المطبعة ومواعيد الحملات من غبيرة.",
  },
  portfolio: { en: "Portfolio", ar: "أعمالنا" },
  portfolioIntro: {
    en: "Work we printed in Riyadh for teams who needed a date they could hold.",
    ar: "أعمال طبعناها في الرياض لفرق احتاجت موعداً ثابتاً.",
  },
  quote: { en: "Request a quote", ar: "اطلب عرض سعر" },
  quoteIntro: {
    en: "Tell us the piece, quantity, and date. We reply from Ghubairah.",
    ar: "أخبرونا بالمنتج والكمية والموعد. نرد من غبيرة.",
  },
  contact: { en: "Contact", ar: "تواصل" },
  contactIntro: {
    en: "Visit the Ghubairah workshop or send a brief. Quote first.",
    ar: "زوروا مطبعة غبيرة أو أرسلوا الموجز. عرض سعر أولاً.",
  },
  hours: { en: "Business hours", ar: "ساعات العمل" },
  loadMap: { en: "Load map", ar: "تحميل الخريطة" },
  mapLabel: { en: "Workshop map", ar: "خريطة المعرض" },
  searchTitle: { en: "Search", ar: "بحث" },
  searchIntro: { en: "Products, services, pages, and articles.", ar: "منتجات وخدمات وصفحات ومقالات." },
  minChars: { en: "Type at least two characters.", ar: "اكتب حرفين على الأقل." },
  notFound: { en: "Page not found", ar: "الصفحة غير موجودة" },
  notFoundIntro: {
    en: "That URL is not on this site. Search, or message us on WhatsApp.",
    ar: "هذا الرابط غير موجود. ابحثوا أو راسلونا على واتساب.",
  },
  popularCategories: { en: "Popular categories", ar: "تصنيفات شائعة" },
  errorTitle: { en: "Something went wrong", ar: "حدث خطأ" },
  tryAgain: { en: "Try again", ar: "إعادة المحاولة" },
  toc: { en: "On this page", ar: "في هذه الصفحة" },
  minRead: { en: "min read", ar: "دقيقة قراءة" },
  challenge: { en: "Challenge", ar: "التحدي" },
  solution: { en: "Solution", ar: "الحل" },
  result: { en: "Result", ar: "النتيجة" },
  jumpTo: { en: "Jump to", ar: "انتقل إلى" },
  searchFaqs: { en: "Search questions", ar: "ابحث في الأسئلة" },
  closed: { en: "Closed", ar: "مغلق" },
  subcategories: { en: "Subcategories", ar: "التصنيفات الفرعية" },
  emptyPosts: { en: "No articles in this section yet.", ar: "لا توجد مقالات في هذا القسم بعد." },
  emptyProjects: { en: "No projects to show yet.", ar: "لا توجد أعمال للعرض بعد." },
  emptySearch: { en: "No matches for that search.", ar: "لا توجد نتائج لهذا البحث." },
  generalGroup: { en: "General", ar: "عام" },
  quoteThis: { en: "Request a quote for this product", ar: "اطلب عرض سعر لهذا المنتج" },
  browseShop: { en: "Browse products", ar: "تصفح المنتجات" },
} as const;

export type PageCopyKey = keyof typeof copy;

export function pageText(locale: Locale, key: PageCopyKey): string {
  return copy[key][locale];
}

export function showingResults(
  locale: Locale,
  from: number,
  to: number,
  total: number,
): string {
  if (locale === "ar") {
    return `عرض ${from}–${to} من ${total}`;
  }
  return `Showing ${from}–${to} of ${total} results`;
}
