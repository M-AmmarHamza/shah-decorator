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
    const isService = product.itemType === "service" || /service|room|stage|event|decor/i.test(product.category || "") || /service|room|stage|event|decor/i.test(product.slug || "");
    const availability =
      Number(product.stock) > 0
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock";
    const schema = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": isService ? "Service" : "Product",
          "@id": `${canonical}#${isService ? "service" : "product"}`,
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
              name: isService ? "Services" : "Products",
              item: absoluteUrl(isService ? "/products.html?type=services" : "/products.html?type=products", siteUrl),
            },
            { "@type": "ListItem", position: 3, name: product.name },
          ],
        },
      ],
    };
    const page = {
      path,
      title: product.seoTitle || `${product.name} | Shah Decorator`,
      description: product.metaDescription || product.description,
      image: product.image,
      imageAlt: product.imageAlt || product.name,
      type: "product",
      schema,
    };
    let html = replaceSeoHead(template, page, siteUrl)
      .replaceAll("Handcrafted Leather Tote", escapeHtml(product.name))
      .replaceAll("Luxury Wedding Stage &amp; Floral Backdrop", escapeHtml(product.name))
      .replaceAll("Luxury Wedding Stage & Floral Backdrop", escapeHtml(product.name))
      .replace(
        /<nav class="breadcrumb" aria-label="Breadcrumb">[\s\S]*?<\/nav>/i,
        `<nav class="breadcrumb" aria-label="Breadcrumb"><a href="index.html">Home</a><span class="material-symbols-outlined">chevron_right</span><a href="products.html?type=${isService ? "services" : "products"}">${isService ? "Services" : "Products"}</a><span class="material-symbols-outlined">chevron_right</span><span>${escapeHtml(product.name)}</span></nav>`,
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
        /<span class="old-price">[\s\S]*?<\/span>/i,
        product.comparePrice ? `<span class="old-price">Rs. ${Number(product.comparePrice).toLocaleString("en-PK")}</span>` : `<span class="old-price" style="display:none"></span>`,
      )
      .replace(
        /<p class="detail-description">[\s\S]*?<\/p>/i,
        `<p class="detail-description">${escapeHtml(product.description)}</p>`,
      );

    if (isService) {
      html = html
        .replace(/<span class="material-symbols-outlined" data-stock-icon>[\s\S]*?<\/span>/i, `<span class="material-symbols-outlined" data-stock-icon>event_available</span>`)
        .replace(/<strong data-stock-title>[\s\S]*?<\/strong>/i, `<strong data-stock-title>Dates Available For Booking</strong>`)
        .replace(/<span data-stock-desc>[\s\S]*?<\/span>/i, `<span data-stock-desc>On-ground setup &amp; supervision included in Karachi</span>`)
        .replace(/<strong data-qty-title>[\s\S]*?<\/strong>/i, `<strong data-qty-title>Number of Stages / Rooms</strong>`)
        .replace(/<legend data-form-legend>[\s\S]*?<\/legend>/i, `<legend data-form-legend>Event &amp; Venue Details</legend>`)
        .replace(/<span data-city-label>[\s\S]*?<\/span>/i, `<span data-city-label>Event Area / Town</span>`)
        .replace(/placeholder="e\.g\.\s*Nazimabad,\s*Gulshan,\s*DHA\s*Karachi"/i, `placeholder="e.g. Gulshan, DHA, Nazimabad, Karachi"`)
        .replace(/<span data-address-label>[\s\S]*?<\/span>/i, `<span data-address-label>Event Date &amp; Venue Address</span>`)
        .replace(/placeholder="e\.g\.\s*House\s*#,\s*Street\s*#,\s*Sector\s*\/\s*Block,\s*Area,\s*Karachi"/i, `placeholder="e.g. Date: 25 Dec 2026, Venue: Banquet / Lawn, Karachi"`)
        .replace(/<span data-note-label>[\s\S]*?<\/span>/i, `<span data-note-label>Special Customization Requests</span>`)
        .replace(/placeholder="e\.g\.\s*Custom\s*greeting\s*card\s*message,\s*ribbon\s*color\s*preference\.\.\."/i, `placeholder="e.g. Stage size, dress color matching, extra fairy lights..."`)
        .replace(/<span data-summary-subtotal-label>[\s\S]*?<\/span>/i, `<span data-summary-subtotal-label>Setup Estimate</span>`)
        .replace(/<span data-summary-delivery-label>[\s\S]*?<\/span>/i, `<span data-summary-delivery-label>On-Site Logistics</span>`)
        .replace(/<span data-summary-total-label>[\s\S]*?<\/span>/i, `<span data-summary-total-label>Total Estimate</span>`)
        .replace(/<span data-submit-btn-text>[\s\S]*?<\/span>/i, `<span data-submit-btn-text>Book on WhatsApp</span>`)
        .replace(/<span>\(50\+\s*Events\s*Done\)<\/span>/i, `<span>(50+ Events Setup in Karachi)</span>`);
    } else {
      html = html
        .replace(/<span class="material-symbols-outlined" data-stock-icon>[\s\S]*?<\/span>/i, `<span class="material-symbols-outlined" data-stock-icon>local_shipping</span>`)
        .replace(/<strong data-stock-title>[\s\S]*?<\/strong>/i, `<strong data-stock-title>In Stock - Karachi Delivery</strong>`)
        .replace(/<span data-stock-desc>[\s\S]*?<\/span>/i, `<span data-stock-desc>Dispatched safely in protective gift packaging</span>`)
        .replace(/<strong data-qty-title>[\s\S]*?<\/strong>/i, `<strong data-qty-title>Quantity</strong>`)
        .replace(/<legend data-form-legend>[\s\S]*?<\/legend>/i, `<legend data-form-legend>Delivery &amp; Contact Details</legend>`)
        .replace(/<span data-city-label>[\s\S]*?<\/span>/i, `<span data-city-label>Delivery Area / Town</span>`)
        .replace(/<span data-address-label>[\s\S]*?<\/span>/i, `<span data-address-label>Complete Delivery Address</span>`)
        .replace(/<span data-note-label>[\s\S]*?<\/span>/i, `<span data-note-label>Special Instructions / Card Note</span>`)
        .replace(/<span data-summary-subtotal-label>[\s\S]*?<\/span>/i, `<span data-summary-subtotal-label>Product Subtotal</span>`)
        .replace(/<span data-summary-delivery-label>[\s\S]*?<\/span>/i, `<span data-summary-delivery-label>Karachi Delivery</span>`)
        .replace(/<span data-summary-total-label>[\s\S]*?<\/span>/i, `<span data-summary-total-label>Total Amount</span>`)
        .replace(/<span data-submit-btn-text>[\s\S]*?<\/span>/i, `<span data-submit-btn-text>Order on WhatsApp</span>`)
        .replace(/<span>\(50\+\s*Events\s*Done\)<\/span>/i, `<span>(Karachi Delivery Available)</span>`);
    }

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
