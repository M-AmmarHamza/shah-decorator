const DEFAULT_SITE_URL = "https://pakmarket.pk";

const envSiteUrl =
  (typeof process !== "undefined" && process.env?.VITE_SITE_URL) ||
  import.meta.env?.VITE_SITE_URL ||
  DEFAULT_SITE_URL;

export const normalizeSiteUrl = (value = DEFAULT_SITE_URL) =>
  String(value).trim().replace(/\/+$/, "");

export const SITE_CONFIG = Object.freeze({
  name: "PakMarket",
  url: normalizeSiteUrl(envSiteUrl),
  locale: "en_PK",
  language: "en-PK",
  currency: "PKR",
  phone: "+923161013991",
  defaultImage:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDEnJcw27yqpwlpvv0CQrU-eh2amN6a_STX9AuW9cgXJq-2eUdIFlH11x2GF28_1SJx-VlCy0CQdjtwlSrrOlkXOKQSy_p3-HJ6JYC0uPwvPdO-WnQHNQsCnaUvGuVMp2jW_WtC7h2GdsnUEKhCLZ2a93apKwCK_CAtXh0KApDteHht0WtdcSIwDn8vaLc4H_a7tRjAi1R_CihbpUUlcO_T23p06vocmxpHhQqibFSGuYf3lcP4V6oWkgPulKdXpssFUXX3vFp-4DU",
});

export const PAGE_SEO = Object.freeze({
  index: {
    path: "/",
    title: "PakMarket | Premium Pakistani Local Products",
    description:
      "Discover quality products from Pakistani local brands and place your order directly through WhatsApp with nationwide delivery.",
    type: "website",
    schemaType: "WebSite",
  },
  products: {
    path: "/products",
    title: "Pakistani Local Products Online | PakMarket",
    description:
      "Browse fashion, food, home decor and handmade products from trusted Pakistani local brands. Order conveniently through WhatsApp.",
    type: "website",
    schemaType: "CollectionPage",
  },
  product: {
    path: "/product",
    title: "Product Details | PakMarket",
    description: "View product details and order from PakMarket through WhatsApp.",
    robots: "noindex, follow",
    type: "product",
    schemaType: "WebPage",
  },
  blog: {
    path: "/blog",
    title: "PakMarket Blog | Local Brands, Craft and Shopping Guides",
    description:
      "Read useful stories and guides about Pakistani craftsmanship, local brands, responsible shopping and small businesses.",
    type: "website",
    schemaType: "CollectionPage",
  },
  "blog-detail": {
    path: "/blog-detail",
    title: "PakMarket Blog Article",
    description: "Read stories and practical guides from PakMarket.",
    robots: "noindex, follow",
    type: "article",
    schemaType: "WebPage",
  },
  about: {
    path: "/about",
    title: "About PakMarket | Supporting Pakistani Local Brands",
    description:
      "Learn how PakMarket connects quality-conscious shoppers with Pakistani makers, artisans and home-based brands.",
    type: "website",
    schemaType: "AboutPage",
  },
  contact: {
    path: "/contact",
    title: "Contact PakMarket | Order and Seller Support",
    description:
      "Contact PakMarket for WhatsApp order support, local-brand partnerships, delivery questions and general enquiries.",
    type: "website",
    schemaType: "ContactPage",
  },
  payment: {
    path: "/payment",
    title: "Payment Methods | PakMarket",
    description:
      "View PakMarket payment methods including Easypaisa, JazzCash, MCB bank transfer and Cash on Delivery information.",
    type: "website",
    schemaType: "WebPage",
  },
  "return-policy": {
    path: "/return-policy",
    title: "7-Day Return Policy | PakMarket",
    description:
      "Read PakMarket's seven-day return conditions, eligibility requirements and return request process.",
    type: "website",
    schemaType: "WebPage",
  },
  "privacy-policy": {
    path: "/privacy-policy",
    title: "Privacy Policy | PakMarket",
    description:
      "Learn how PakMarket collects, uses and protects information shared through the website and WhatsApp ordering process.",
    type: "website",
    schemaType: "WebPage",
  },
  terms: {
    path: "/terms",
    title: "Terms and Conditions | PakMarket",
    description:
      "Read the terms governing PakMarket product information, WhatsApp orders, payments, delivery and customer responsibilities.",
    type: "website",
    schemaType: "WebPage",
  },
  "shipping-policy": {
    path: "/shipping-policy",
    title: "Shipping Policy | PakMarket",
    description:
      "Review PakMarket delivery areas, expected timelines, shipping charges and order confirmation process.",
    type: "website",
    schemaType: "WebPage",
  },
  auth: {
    path: "/auth",
    title: "Sign In or Create Account | PakMarket",
    description: "Access your PakMarket account.",
    robots: "noindex, nofollow",
    type: "website",
    schemaType: "WebPage",
  },
  profile: {
    path: "/profile",
    title: "My Account | PakMarket",
    description: "Manage your PakMarket account.",
    robots: "noindex, nofollow",
    type: "website",
    schemaType: "ProfilePage",
  },
  admin: {
    path: "/admin",
    title: "PakMarket Admin",
    description: "PakMarket administration area.",
    robots: "noindex, nofollow, noarchive",
    type: "website",
    schemaType: "WebPage",
  },
  "404": {
    path: "/404",
    title: "Page Not Found | PakMarket",
    description: "The requested PakMarket page could not be found.",
    robots: "noindex, follow",
    type: "website",
    schemaType: "WebPage",
  },
});

export const absoluteUrl = (path = "/", siteUrl = SITE_CONFIG.url) =>
  new URL(path, `${normalizeSiteUrl(siteUrl)}/`).href;

const escapeAttribute = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

export function seoHeadMarkup(page, siteUrl = SITE_CONFIG.url) {
  const canonical = absoluteUrl(page.path, siteUrl);
  const image = page.image || SITE_CONFIG.defaultImage;
  const robots = page.robots || "index, follow, max-image-preview:large";
  const schema =
    page.schema ||
    {
      "@context": "https://schema.org",
      "@type": page.schemaType || "WebPage",
      name: page.title,
      description: page.description,
      url: canonical,
      isPartOf: {
        "@type": "WebSite",
        name: SITE_CONFIG.name,
        url: normalizeSiteUrl(siteUrl),
      },
    };

  return [
    `<title>${escapeAttribute(page.title)}</title>`,
    `<meta name="description" content="${escapeAttribute(page.description)}">`,
    `<meta name="robots" content="${escapeAttribute(robots)}">`,
    `<link rel="canonical" href="${escapeAttribute(canonical)}">`,
    `<meta property="og:type" content="${escapeAttribute(page.type || "website")}">`,
    `<meta property="og:site_name" content="${SITE_CONFIG.name}">`,
    `<meta property="og:locale" content="${SITE_CONFIG.locale}">`,
    `<meta property="og:title" content="${escapeAttribute(page.title)}">`,
    `<meta property="og:description" content="${escapeAttribute(page.description)}">`,
    `<meta property="og:url" content="${escapeAttribute(canonical)}">`,
    `<meta property="og:image" content="${escapeAttribute(image)}">`,
    `<meta property="og:image:alt" content="${escapeAttribute(page.imageAlt || page.title)}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${escapeAttribute(page.title)}">`,
    `<meta name="twitter:description" content="${escapeAttribute(page.description)}">`,
    `<meta name="twitter:image" content="${escapeAttribute(image)}">`,
    `<meta name="theme-color" content="#007a55">`,
    `<link rel="icon" href="/favicon.svg" type="image/svg+xml">`,
    `<script type="application/ld+json" data-seo-schema>${JSON.stringify(schema).replaceAll("<", "\\u003c")}</script>`,
  ].join("\n    ");
}

export function replaceSeoHead(html, page, siteUrl = SITE_CONFIG.url) {
  let output = html
    .replace(/<title>[\s\S]*?<\/title>/gi, "")
    .replace(/<meta\s+[^>]*(?:name=["'](?:description|robots|twitter:[^"']+)["']|property=["']og:[^"']+["'])[^>]*>\s*/gi, "")
    .replace(/<link\s+[^>]*rel=["']canonical["'][^>]*>\s*/gi, "")
    .replace(/<link\s+[^>]*rel=["']icon["'][^>]*>\s*/gi, "")
    .replace(/<script\s+type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>\s*/gi, "");
  output = output.replace(/<html\s+lang=["'][^"']+["']/i, `<html lang="${SITE_CONFIG.language}"`);
  return output.replace("</head>", `    ${seoHeadMarkup(page, siteUrl)}\n  </head>`);
}

export function cleanInternalLinks(html) {
  const replacements = {
    "index.html": "/",
    "products.html": "/products",
    "blog.html": "/blog",
    "about.html": "/about",
    "contact.html": "/contact",
    "payment.html": "/payment",
    "return-policy.html": "/return-policy",
    "privacy-policy.html": "/privacy-policy",
    "terms.html": "/terms",
    "shipping-policy.html": "/shipping-policy",
    "auth.html": "/auth",
    "profile.html": "/profile",
    "product.html": "/products",
    "blog-detail.html": "/blog",
  };
  return Object.entries(replacements).reduce(
    (output, [from, to]) => output.replaceAll(`href="${from}`, `href="${to}`),
    html,
  );
}
