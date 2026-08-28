const DEFAULT_SITE_URL = "https://shahdecorator.pk";
const DEFAULT_WHATSAPP = "923138136846";

const envSiteUrl =
  (typeof process !== "undefined" && process.env?.VITE_SITE_URL) ||
  import.meta.env?.VITE_SITE_URL ||
  DEFAULT_SITE_URL;

const envWhatsApp =
  (typeof process !== "undefined" && process.env?.VITE_WHATSAPP_NUMBER) ||
  import.meta.env?.VITE_WHATSAPP_NUMBER ||
  "";

export const normalizeSiteUrl = (value = DEFAULT_SITE_URL) =>
  String(value).trim().replace(/\/+$/, "");

export const SITE_CONFIG = Object.freeze({
  name: "Shah Decorator",
  url: normalizeSiteUrl(envSiteUrl),
  locale: "en_PK",
  language: "en-PK",
  currency: "PKR",
  phone: `+${String(envWhatsApp || DEFAULT_WHATSAPP).replace(/\D/g, "")}`,
  whatsapp: String(envWhatsApp || DEFAULT_WHATSAPP).replace(/\D/g, ""),
  socials: Object.freeze({
    facebook: "https://www.facebook.com/ShahDecorator/",
    instagram: "https://www.instagram.com/shahdecorator/",
    youtube: "https://www.youtube.com/@ShahDecorator",
  }),
  defaultImage:
    "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
});

export const PAGE_SEO = Object.freeze({
  index: {
    path: "/",
    title: "Shah Decorator | Party Supplies, Custom Bouquets & Event Decor",
    description:
      "Shop handcrafted chocolate bouquets, currency bouquets, party balloons, and book on-location Mayon, Mehndi, Birthday & Room Decor across Karachi on WhatsApp.",
    type: "website",
    schemaType: "WebSite",
  },
  products: {
    path: "/products",
    title: "Party Supplies, Custom Bouquets & Event Decor in Karachi | Shah Decorator",
    description:
      "Browse custom Ferrero Rocher & currency bouquets, DIY balloon arch kits, Mehndi essentials, and luxury room & stage decor packages across Karachi.",
    type: "website",
    schemaType: "CollectionPage",
  },
  product: {
    path: "/product",
    title: "Service Details | Shah Decorator",
    description: "View setup details and book your decoration package directly through WhatsApp.",
    robots: "noindex, follow",
    type: "product",
    schemaType: "WebPage",
  },
  blog: {
    path: "/blog",
    title: "Shah Decorator Blog | Decor Ideas, Trends & Event Inspiration",
    description:
      "Explore wedding decoration trends, birthday theme ideas, lighting guides, and event styling inspiration from Shah Decorator.",
    type: "website",
    schemaType: "CollectionPage",
  },
  "blog-detail": {
    path: "/blog-detail",
    title: "Shah Decorator Blog Article",
    description: "Read event styling tips and decor guides from Shah Decorator.",
    robots: "noindex, follow",
    type: "article",
    schemaType: "WebPage",
  },
  about: {
    path: "/about",
    title: "About Us | Shah Decorator - Crafting Unforgettable Events",
    description:
      "Learn about Shah Decorator's passion for bespoke wedding design, corporate setups, celebratory themes, and event decor excellence.",
    type: "website",
    schemaType: "AboutPage",
  },
  contact: {
    path: "/contact",
    title: "Contact Shah Decorator | Booking & Event Inquiries",
    description:
      "Get in touch with Shah Decorator for event consultations, custom quote requests, package bookings, and event planning support.",
    type: "website",
    schemaType: "ContactPage",
  },
  payment: {
    path: "/payment",
    title: "Payment & Booking Terms | Shah Decorator",
    description:
      "View Shah Decorator accepted payment methods including Bank Transfer, JazzCash, Easypaisa, and booking advance payment details.",
    type: "website",
    schemaType: "WebPage",
  },
  "return-policy": {
    path: "/return-policy",
    title: "Cancellation & Refund Policy | Shah Decorator",
    description:
      "Read Shah Decorator policies on event booking modifications, cancellations, and advance security deposit terms.",
    type: "website",
    schemaType: "WebPage",
  },
  "privacy-policy": {
    path: "/privacy-policy",
    title: "Privacy Policy | Shah Decorator",
    description:
      "Learn how Shah Decorator protects and respects your personal details and event booking information.",
    type: "website",
    schemaType: "WebPage",
  },
  terms: {
    path: "/terms",
    title: "Terms and Conditions | Shah Decorator",
    description:
      "Review the terms governing Shah Decorator event bookings, venue access, setup timings, and client responsibilities.",
    type: "website",
    schemaType: "WebPage",
  },
  "shipping-policy": {
    path: "/shipping-policy",
    title: "Karachi Delivery & Setup Logistics | Shah Decorator",
    description:
      "Learn about our Karachi event setup zones, delivery timelines, transport logistics, and venue coordination.",
    type: "website",
    schemaType: "WebPage",
  },
  auth: {
    path: "/auth",
    title: "Client Portal | Shah Decorator",
    description: "Access your Shah Decorator account.",
    robots: "noindex, nofollow",
    type: "website",
    schemaType: "WebPage",
  },
  profile: {
    path: "/profile",
    title: "My Bookings & Account | Shah Decorator",
    description: "Manage your Shah Decorator bookings and profile.",
    robots: "noindex, nofollow",
    type: "website",
    schemaType: "ProfilePage",
  },
  admin: {
    path: "/admin",
    title: "Shah Decorator Admin",
    description: "Shah Decorator administration and event manager area.",
    robots: "noindex, nofollow, noarchive",
    type: "website",
    schemaType: "WebPage",
  },
  "404": {
    path: "/404",
    title: "Page Not Found | Shah Decorator",
    description: "The requested Shah Decorator page could not be found.",
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
    "product.html": "/product",
    "blog-detail.html": "/blog",
  };
  return Object.entries(replacements).reduce(
    (output, [from, to]) => output.replaceAll(`href="${from}`, `href="${to}`),
    html,
  );
}
