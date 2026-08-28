import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { DEFAULT_PRODUCTS } from "../catalog.js";
import { DEFAULT_BLOGS } from "../blog-catalog.js";
import {
  PAGE_SEO,
  SITE_CONFIG,
  absoluteUrl,
  cleanInternalLinks,
  normalizeSiteUrl,
  replaceSeoHead,
} from "../seo.config.js";

const outputDirectory = join(import.meta.dirname, "..", "dist");
const siteUrl = normalizeSiteUrl(
  process.env.VITE_SITE_URL || SITE_CONFIG.url,
);

const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const escapeXml = escapeHtml;

const merchantReturnPolicy = {
  "@type": "MerchantReturnPolicy",
  applicableCountry: "PK",
  returnPolicyCategory:
    "https://schema.org/MerchantReturnFiniteReturnWindow",
  merchantReturnDays: 7,
  returnMethod: "https://schema.org/ReturnByMail",
  returnFees: "https://schema.org/ReturnShippingFees",
  merchantReturnLink: absoluteUrl("/return-policy", siteUrl),
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: SITE_CONFIG.name,
      url: siteUrl,
      contactPoint: {
        "@type": "ContactPoint",
        telephone: SITE_CONFIG.phone,
        contactType: "customer service",
        areaServed: "PK",
        availableLanguage: ["en", "ur"],
      },
      hasMerchantReturnPolicy: merchantReturnPolicy,
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      name: SITE_CONFIG.name,
      url: siteUrl,
      inLanguage: SITE_CONFIG.language,
      publisher: { "@id": `${siteUrl}/#organization` },
    },
  ],
};

async function improveHomepageSchema() {
  const filename = join(outputDirectory, "index.html");
  const html = await readFile(filename, "utf8");
  await writeFile(
    filename,
    cleanInternalLinks(
      replaceSeoHead(
        html,
        { ...PAGE_SEO.index, schema: organizationSchema },
        siteUrl,
      ),
    ),
  );
}

async function generateProductPages() {
  const template = await readFile(join(outputDirectory, "product.html"), "utf8");
  const directory = join(outputDirectory, "product");
  const legacyDirectory = join(outputDirectory, "products");
  await mkdir(directory, { recursive: true });
  await mkdir(legacyDirectory, { recursive: true });

  for (const product of DEFAULT_PRODUCTS.filter(
    (item) => item.enabled && item.seoIndex,
  )) {
    const path = `/product/${product.slug}`;
    const canonical = absoluteUrl(path, siteUrl);
    const isService = /service|room|stage|event|decor/i.test(product.category || "") || /service|room|stage|event|decor/i.test(product.slug || "");
    const availability =
      Number(product.stock) > 0
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock";
    const schema = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Product",
          "@id": `${canonical}#product`,
          name: product.name,
          description: product.description,
          image: [product.image],
          sku: product.sku,
          category: product.category,
          offers: {
            "@type": "Offer",
            url: canonical,
            priceCurrency: SITE_CONFIG.currency,
            price: Number(product.price),
            availability,
            itemCondition: "https://schema.org/NewCondition",
            seller: { "@id": `${siteUrl}/#organization` },
            hasMerchantReturnPolicy: merchantReturnPolicy,
          },
        },
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Home",
              item: `${siteUrl}/`,
            },
            {
              "@type": "ListItem",
              position: 2,
              name: isService ? "Service" : "Product",
              item: absoluteUrl(isService ? "/products.html?type=services" : "/products.html?type=products", siteUrl),
            },
            { "@type": "ListItem", position: 3, name: product.name },
          ],
        },
      ],
    };
    const page = {
      path,
      title: product.seoTitle || `${product.name} | PakMarket`,
      description: product.metaDescription || product.description,
      image: product.image,
      imageAlt: product.imageAlt || product.name,
      type: "product",
      schema,
    };
    let html = replaceSeoHead(template, page, siteUrl)
      .replaceAll("Handcrafted Leather Tote", escapeHtml(product.name))
      .replace(
        /<nav class="breadcrumb" aria-label="Breadcrumb">[\s\S]*?<\/nav>/i,
        `<nav class="breadcrumb" aria-label="Breadcrumb"><a href="index.html">Home</a><span class="material-symbols-outlined">chevron_right</span><a href="products.html?type=${isService ? "services" : "products"}">${isService ? "Service" : "Product"}</a><span class="material-symbols-outlined">chevron_right</span><span>${escapeHtml(product.name)}</span></nav>`,
      )
      .replace(
        /<img\s+data-gallery-main[^>]*>/i,
        `<img data-gallery-main src="${escapeHtml(product.image)}" alt="${escapeHtml(product.imageAlt || product.name)}" width="1080" height="1080" fetchpriority="high">`,
      )
      .replace(
        /<span class="price">[\s\S]*?<\/span>/i,
        `<span class="price">Rs. ${Number(product.price).toLocaleString("en-PK")}</span>`,
      )
      .replace(
        /<p class="detail-description">[\s\S]*?<\/p>/i,
        `<p class="detail-description">${escapeHtml(product.description)}</p>`,
      );
    html = cleanInternalLinks(html);
    await writeFile(join(directory, `${product.slug}.html`), html);
    await writeFile(join(legacyDirectory, `${product.slug}.html`), html);
  }
}

async function generateBlogPages() {
  const template = await readFile(
    join(outputDirectory, "blog-detail.html"),
    "utf8",
  );
  const directory = join(outputDirectory, "blog");
  await mkdir(directory, { recursive: true });

  for (const article of DEFAULT_BLOGS.filter(
    (item) => item.enabled && item.seoIndex,
  )) {
    const path = `/blog/${article.slug}`;
    const canonical = absoluteUrl(path, siteUrl);
    const schema = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "BlogPosting",
          "@id": `${canonical}#article`,
          headline: article.title,
          description: article.metaDescription,
          image: [article.image],
          datePublished: article.publishDate,
          dateModified: article.publishDate,
          author: { "@type": "Person", name: article.author },
          publisher: { "@id": `${siteUrl}/#organization` },
          mainEntityOfPage: canonical,
          inLanguage: SITE_CONFIG.language,
        },
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Home",
              item: `${siteUrl}/`,
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "Blog",
              item: absoluteUrl("/blog", siteUrl),
            },
            { "@type": "ListItem", position: 3, name: article.title },
          ],
        },
      ],
    };
    const page = {
      path,
      title: article.seoTitle || `${article.title} | PakMarket`,
      description: article.metaDescription || article.excerpt,
      image: article.image,
      imageAlt: article.coverAlt || article.title,
      type: "article",
      schema,
    };
    const initials = article.author
      .split(/\s+/)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
    const formattedDate = new Intl.DateTimeFormat("en-PK", {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "UTC",
    }).format(new Date(`${article.publishDate}T00:00:00Z`));
    let html = replaceSeoHead(template, page, siteUrl)
      .replace(
        /<span class="eyebrow">[\s\S]*?<\/span>/i,
        `<span class="eyebrow">${escapeHtml(article.category)}</span>`,
      )
      .replace(/<h1>[\s\S]*?<\/h1>/i, `<h1>${escapeHtml(article.title)}</h1>`)
      .replace(
        /<p class="article-intro">[\s\S]*?<\/p>/i,
        `<p class="article-intro">${escapeHtml(article.excerpt)}</p>`,
      )
      .replace(
        /<div class="author-avatar">[\s\S]*?<\/div>/i,
        `<div class="author-avatar">${escapeHtml(initials)}</div>`,
      )
      .replace(
        /<div>\s*<strong>[\s\S]*?<\/strong><span>PakMarket Editorial<\/span>\s*<\/div>/i,
        `<div><strong>${escapeHtml(article.author)}</strong><span>PakMarket Editorial</span></div>`,
      )
      .replace(
        /<time\s+datetime="[^"]*">[\s\S]*?<\/time>/i,
        `<time datetime="${escapeHtml(article.publishDate)}"><span class="material-symbols-outlined">calendar_today</span>${escapeHtml(formattedDate)}</time>`,
      )
      .replace(
        /<section class="container article-media">[\s\S]*?<\/section>/i,
        `<section class="container article-media"><img src="${escapeHtml(article.image)}" alt="${escapeHtml(article.coverAlt || article.title)}" width="1200" height="630" fetchpriority="high"></section>`,
      )
      .replace(
        /<article class="article-content">[\s\S]*?<\/article>/i,
        `<article class="article-content">${article.content}</article>`,
      );
    html = cleanInternalLinks(html);
    await writeFile(join(directory, `${article.slug}.html`), html);
  }
}

async function generateCrawlerFiles() {
  const staticPages = Object.values(PAGE_SEO).filter(
    (page) =>
      !page.robots?.includes("noindex") &&
      !["/product", "/blog-detail"].includes(page.path),
  );
  const urls = [
    ...staticPages.map((page) => ({ path: page.path })),
    ...DEFAULT_PRODUCTS.filter((item) => item.enabled && item.seoIndex).map(
      (item) => ({ path: `/product/${item.slug}` }),
    ),
    ...DEFAULT_BLOGS.filter((item) => item.enabled && item.seoIndex).map(
      (item) => ({ path: `/blog/${item.slug}`, lastmod: item.publishDate }),
    ),
  ];
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map(
      ({ path, lastmod }) =>
        `  <url>\n    <loc>${escapeXml(absoluteUrl(path, siteUrl))}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ""}\n  </url>`,
    )
    .join("\n")}\n</urlset>\n`;
  const robots = `User-agent: *\nAllow: /\n\nSitemap: ${absoluteUrl("/sitemap.xml", siteUrl)}\n`;
  await Promise.all([
    writeFile(join(outputDirectory, "sitemap.xml"), sitemap),
    writeFile(join(outputDirectory, "robots.txt"), robots),
  ]);
}

await improveHomepageSchema();
await generateProductPages();
await generateBlogPages();
await generateCrawlerFiles();

console.log(
  `SEO files generated for ${siteUrl}: ${DEFAULT_PRODUCTS.filter((item) => item.enabled && item.seoIndex).length} products and ${DEFAULT_BLOGS.filter((item) => item.enabled && item.seoIndex).length} articles.`,
);
