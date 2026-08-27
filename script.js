import "./supabase-client.js";
import "./social-normalize.css";
import "./promotions.css";
import "./product-gallery.css";
import "./floating-actions.js";
import "./integrations.js";
import "./consent.css";
import "./demo-session.js";
import { DEFAULT_PRODUCTS } from "./catalog.js";
import { DEFAULT_BLOGS } from "./blog-catalog.js";
import { SITE_CONFIG, absoluteUrl } from "./seo.config.js";
import { applyStoreTheme } from "./theme-config.js";
import {
  buildOrderMessage,
  calculateOrder,
  configuredWhatsApp,
  createOrderId,
  money,
  productOptions,
  validateOrder,
} from "./order-engine.js";

function whatsappUrl(message) {
  let settings={};try{settings=JSON.parse(localStorage.getItem("pakmarket_global_settings_v1")||"{}")}catch{}
  const number=configuredWhatsApp(settings,SITE_CONFIG.whatsapp);
  if(!number) return "#whatsapp-not-configured";
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

function showToast(message) {
  let toast = document.querySelector(".toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 2400);
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".site-footer").forEach((footer) => {
    if (footer.querySelector("[data-footer-demo-link]")) return;
    const quickLinks = footer.querySelector(".footer-links");
    if (!quickLinks) return;
    const demoLink = document.createElement("a");
    demoLink.href = "/auth?demo=start";
    demoLink.dataset.footerDemoLink = "";
    demoLink.className = "footer-demo-link";
    demoLink.textContent = "Add Products — 3-Hour Demo";
    demoLink.title = "Temporary demo products and settings are deleted automatically after 3 hours.";
    quickLinks.appendChild(demoLink);
  });

  const page = document.body.dataset.page || "";
  const pathParts = window.location.pathname.split("/").filter(Boolean);
  const isPrettyProduct =
    pathParts[0]?.toLowerCase() === "products" && Boolean(pathParts[1]);
  const isPrettyBlog =
    pathParts[0]?.toLowerCase() === "blog" && Boolean(pathParts[1]);
  const routeName =
    (isPrettyProduct
      ? "product"
      : isPrettyBlog
        ? "blog-detail"
        : pathParts.at(-1) || "index")
      .replace(/\.html$/i, "")
      .toLowerCase();
  const isRoute = (name) => routeName === name;
  const productSlug =
    isPrettyProduct
      ? decodeURIComponent(pathParts[1])
      : new URLSearchParams(window.location.search).get("product");
  const productUrl = (slug) => `/products/${encodeURIComponent(slug)}`;
  const blogSlug = isPrettyBlog
    ? decodeURIComponent(pathParts[1])
    : new URLSearchParams(window.location.search).get("blog");
  const blogUrl = (slug) => `/blog/${encodeURIComponent(slug)}`;
  const isLocalPreview = ["localhost", "127.0.0.1", "::1"].includes(
    location.hostname,
  );
  const managedInventory = (() => {
    try {
      const stored = JSON.parse(
        localStorage.getItem("pakmarket_inventory_v1") || "[]",
      );
      if (!Array.isArray(stored)) return DEFAULT_PRODUCTS;
      const storedSettings = JSON.parse(
        localStorage.getItem("pakmarket_global_settings_v1") || "{}",
      );
      if (storedSettings.demoMode) return stored;
      const defaultsById = new Map(DEFAULT_PRODUCTS.map((item) => [item.id, item]));
      const mergedStored = stored.map((item) => ({ ...(defaultsById.get(item.id) || {}), ...item }));
      const storedIds = new Set(mergedStored.map((item) => item.id));
      return [
        ...mergedStored,
        ...DEFAULT_PRODUCTS.filter((item) => !storedIds.has(item.id)),
      ];
    } catch {
      return DEFAULT_PRODUCTS;
    }
  })();
  const globalSettings=(()=>{try{return JSON.parse(localStorage.getItem("pakmarket_global_settings_v1")||"{}")}catch{return{}}})();
  const demoRequested = new URLSearchParams(location.search).get("demo") === "1";
  const demoActive = Boolean(globalSettings.demoMode || demoRequested);
  const demoExpired = demoActive && globalSettings.demoExpiresAt && Date.now() > new Date(globalSettings.demoExpiresAt).getTime();
  applyStoreTheme(globalSettings.theme, globalSettings.primaryColor);
  if (globalSettings.businessName) {
    const storeName = globalSettings.businessName;
    document.querySelectorAll(".logo, .brand, .footer-grid h3:first-child").forEach((node) => node.textContent = storeName);
    document.querySelectorAll(".footer-bottom span").forEach((node) => { node.textContent = node.textContent.replace(/PakMarket/g, storeName); });
    if (demoActive) {
      document.title = `${storeName} | WhatsApp Store Demo`;
      const description = globalSettings.tagline || `${storeName} ka WhatsApp order store demo.`;
      document.querySelectorAll('meta[name="description"], meta[property="og:description"], meta[name="twitter:description"]').forEach((meta) => meta.content = description);
      document.querySelectorAll('meta[property="og:title"], meta[name="twitter:title"]').forEach((meta) => meta.content = document.title);
    }
  }
  if (demoActive) {
    let robots = document.querySelector('meta[name="robots"]');
    if (!robots) { robots = document.createElement("meta"); robots.name = "robots"; document.head.appendChild(robots); }
    robots.content = "noindex, nofollow, noarchive";
    const watermark = document.createElement("div");
    watermark.className = "demo-watermark";
    watermark.textContent = demoExpired ? "Demo expired" : "Demo preview";
    document.body.appendChild(watermark);
    document.querySelectorAll(".home-testimonials-section").forEach((section) => section.hidden = true);
    const pageHeading = document.querySelector("main h1");
    if (pageHeading?.nextElementSibling?.matches("p")) pageHeading.nextElementSibling.textContent = globalSettings.tagline || "Your products and WhatsApp orders in one store.";
    const footerIntro = document.querySelector(".footer-grid > div:first-child > p");
    if (footerIntro) footerIntro.textContent = globalSettings.tagline || "Your dedicated WhatsApp order store.";
    const trustCards = [...document.querySelectorAll(".trust-item, .trust-card, .value-band > div")];
    trustCards.forEach((card) => {
      const heading = card.querySelector("h3, strong"), copy = card.querySelector("p");
      if (/verified|vetted|seller/i.test(card.textContent)) {
        if (heading) heading.textContent = "Clear Order Details";
        if (copy) copy.textContent = "Customers review complete order details before submitting on WhatsApp.";
      }
    });
    document.querySelectorAll(".footer-bottom span").forEach((node) => {
      if (/empowering|brands/i.test(node.textContent)) node.textContent = `© ${new Date().getFullYear()} ${globalSettings.businessName || "Demo Store"}. WhatsApp order store.`;
    });
    if (demoExpired) document.querySelectorAll("[data-whatsapp], [data-submit-whatsapp-order]").forEach((control) => { control.setAttribute("aria-disabled", "true"); control.addEventListener("click", (event) => { event.preventDefault(); showToast("This demo has expired. Contact PakMarket to activate it."); }, true); });
  }
  const deliveryCard = [...document.querySelectorAll(".info-card h4")].find((heading) => /delivery/i.test(heading.textContent))?.closest(".info-card");
  if (deliveryCard) {
    const heading = deliveryCard.querySelector("h4"), copy = deliveryCard.querySelector("p");
    const mode = globalSettings.deliveryMode || "owner_confirm";
    heading.textContent = mode === "free" ? "Free Delivery" : mode === "included" ? "Delivery Included" : mode === "separate" ? "Delivery Charges" : "Delivery Confirmation";
    copy.textContent = mode === "free" ? "Free delivery on this product." : mode === "included" ? "Delivery is included in the product price." : mode === "separate" && Number(globalSettings.deliveryFee) >= 0 ? `Delivery charges: Rs. ${Number(globalSettings.deliveryFee).toLocaleString("en-PK")}.` : "Exact delivery charges will be confirmed by the store owner based on your city and address.";
  }
  document.querySelectorAll(".footer-links").forEach(group=>{if(!group.querySelector('a[href="/privacy-policy"]')&&!group.querySelector('a[href="privacy-policy.html"]')&&/return|payment|contact/i.test(group.textContent+group.parentElement?.textContent))group.insertAdjacentHTML("beforeend",'<a href="/privacy-policy">Privacy Policy</a><a href="/terms">Terms & Conditions</a><a href="/shipping-policy">Shipping Policy</a>')});
  const socialMap = {
    Facebook: globalSettings.facebook || SITE_CONFIG.socials.facebook,
    Instagram: globalSettings.instagram || SITE_CONFIG.socials.instagram,
    YouTube: globalSettings.youtube || SITE_CONFIG.socials.youtube,
    TikTok: globalSettings.tiktok,
  };
  Object.entries(socialMap).forEach(([name, url]) => {
    document
      .querySelectorAll(`.socials a[aria-label="${name}"]`)
      .forEach((link) => {
        if (url) {
          link.href = url;
          return;
        }
        link.removeAttribute("href");
        link.removeAttribute("target");
        link.setAttribute("aria-disabled", "true");
        link.title = `${name} profile coming soon`;
      });
  });
  if (!document.querySelector(".skip-link")) {
    const skipLink = document.createElement("a");
    skipLink.className = "skip-link";
    skipLink.href = "#main-content";
    skipLink.textContent = "Skip to main content";
    document.body.prepend(skipLink);
  }
  const main = document.querySelector("main");
  if (main && !main.id) main.id = "main-content";
  document.querySelectorAll('.search input[type="search"]').forEach((input) => {
    if (!input.getAttribute("aria-label"))
      input.setAttribute("aria-label", "Search products");
  });
  document.querySelectorAll("img").forEach((image) => {
    image.decoding = "async";
    if (image.getAttribute("fetchpriority") !== "high") image.loading = "lazy";
  });
  document.querySelectorAll(".footer-bottom span").forEach((item) => {
    item.textContent = item.textContent.replace(
      /\(c\)\s*20\d{2}/i,
      `\u00A9 ${new Date().getFullYear()}`,
    );
  });
const contentEscape = (value) =>
    String(value ?? "").replace(
      /[&<>'"]/g,
      (character) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          "'": "&#39;",
          '"': "&quot;",
        })[character],
    );

function sanitizeRichHtml(value) {
  const template = document.createElement("template");
  template.innerHTML = String(value || "");
  template.content
    .querySelectorAll("script,style,iframe,object,embed,form")
    .forEach((node) => node.remove());
  template.content.querySelectorAll("*").forEach((node) => {
    [...node.attributes].forEach((attribute) => {
      const name = attribute.name.toLowerCase();
      const content = attribute.value.trim().toLowerCase();
      if (
        name.startsWith("on") ||
        ((name === "href" || name === "src") &&
          content.startsWith("javascript:"))
      )
        node.removeAttribute(attribute.name);
    });
  });
  return template.innerHTML;
}
function richTextToPlain(value) {
  const template = document.createElement("template");
  template.innerHTML = sanitizeRichHtml(value);
  return (template.content.textContent || "").replace(/\s+/g, " ").trim();
}
  const scheduledIsLive = (item) =>
    item.enabled &&
    (!item.start || Date.now() >= new Date(item.start).getTime()) &&
    (!item.end || Date.now() <= new Date(item.end).getTime());
  const promotionEvents = (() => {
    try {
      return (JSON.parse(localStorage.getItem("pakmarket_events_v1")) || []).filter(
        scheduledIsLive,
      );
    } catch {
      return [];
    }
  })();
  const productOffer = (product) =>
    promotionEvents
      .filter((offer) => {
        const scope = offer.productScope || "all";
        if (scope === "all") return true;
        if (scope === "category") return offer.targetCategory === product.category;
        return (offer.productIds || []).some((id) =>
          [product.id, product.sku, product.slug].includes(id),
        );
      })
      .filter((offer) => Number(product.price || 0) >= Number(offer.minimumOrder || 0))
      .sort((a, b) => Number(b.discountValue || 0) - Number(a.discountValue || 0))[0];
  const offerDetails = (product) => {
    const offer = productOffer(product);
    const price = Number(product.price || 0);
    const discount = !offer
      ? 0
      : offer.discountType === "fixed"
        ? Math.min(price, Number(offer.discountValue || 0))
        : Math.min(price, (price * Number(offer.discountValue || 0)) / 100);
    const settingsMode = globalSettings.deliveryMode || "separate";
    const mode = offer?.deliveryMode && offer.deliveryMode !== "default"
      ? offer.deliveryMode
      : settingsMode;
    const deliveryFee = mode === "separate"
      ? Number(offer?.deliveryFee || globalSettings.deliveryFee || 0)
      : 0;
    return { offer, price, discount, finalPrice: Math.max(0, price - discount), mode, deliveryFee };
  };
  const orderMessage = (product) => {
    const details = offerDetails(product);
    const delivery = details.mode === "free"
      ? "Free delivery"
      : details.mode === "included"
        ? "Delivery included in price"
        : `Delivery charged separately${details.deliveryFee ? `: Rs. ${details.deliveryFee.toLocaleString("en-PK")}` : " (to be confirmed by owner)"}`;
    return `Assalam o Alaikum, I want to order ${product.name}.\nProduct price: Rs. ${details.price.toLocaleString("en-PK")}${details.offer ? `\nOffer: ${details.offer.title}${details.offer.code ? ` (${details.offer.code})` : ""}\nDiscount: Rs. ${Math.round(details.discount).toLocaleString("en-PK")}\nPrice after discount: Rs. ${Math.round(details.finalPrice).toLocaleString("en-PK")}` : ""}\nDelivery: ${delivery}\nPlease confirm the final order total.`;
  };

  try {
    const storedEvents = localStorage.getItem("pakmarket_events_v1");
    if (storedEvents !== null) {
      const activeEvent = (JSON.parse(storedEvents) || [])
        .filter(scheduledIsLive)
        .sort((a, b) => new Date(b.start) - new Date(a.start))[0];
      document.querySelectorAll(".announcement-bar").forEach((bar) => {
        if (!activeEvent) {
          bar.hidden = true;
          return;
        }
        bar.hidden = false;
        const track = bar.querySelector(".announcement-track");
        if (track) {
          const group = `<span><span class="material-symbols-outlined">celebration</span>${contentEscape(activeEvent.message)}</span>${activeEvent.code ? `<b>Use code: ${contentEscape(activeEvent.code)}</b>` : ""}${activeEvent.secondary ? `<span>${contentEscape(activeEvent.secondary)}</span>` : ""}`;
          track.innerHTML =
            group +
            group
              .replaceAll("<span", '<span aria-hidden="true"')
              .replaceAll("<b", '<b aria-hidden="true"');
        }
      });
    }
  } catch {}

  try {
    const storedComing = localStorage.getItem("pakmarket_coming_v1"),
      comingSection = document.querySelector(".coming-section");
    if (storedComing !== null && comingSection) {
      const items = (JSON.parse(storedComing) || []).filter(scheduledIsLive),
        grid = comingSection.querySelector(".coming-grid");
      if (!items.length) comingSection.hidden = true;
      else if (grid)
        grid.innerHTML = items
          .map(
            (item) =>
              `<article class="coming-card"><img src="${contentEscape(item.image)}" alt="${contentEscape(item.name)}"><div><span>Coming Soon</span><h3>${contentEscape(item.name)}</h3><p>${contentEscape(item.description)}</p><a href="#" data-whatsapp data-item="${contentEscape(item.name)} launch notification">Notify Me</a></div></article>`,
          )
          .join("");
    }
  } catch {}

  const gallerySection = document.querySelector("[data-product-gallery]");
  if (gallerySection) {
    gallerySection.id = "product-gallery";
    const homeFaq = document.querySelector(".home-faq-section");
    if (homeFaq) homeFaq.after(gallerySection);
    const grid = gallerySection.querySelector("[data-gallery-grid]");
    const empty = gallerySection.querySelector("[data-gallery-empty]");
    const previous = gallerySection.querySelector("[data-gallery-prev]");
    const next = gallerySection.querySelector("[data-gallery-next]");
    const pageLabel = gallerySection.querySelector("[data-gallery-page]");
    const safeJson = (value, fallback = []) => {
      try {
        return JSON.parse(value) || fallback;
      } catch {
        return fallback;
      }
    };
    const inventory = safeJson(
      localStorage.getItem("pakmarket_inventory_v1"),
      [],
    ).filter((product) => product.enabled ?? product.status === "active");
    let galleryImages = inventory.flatMap((product) => {
      const metadata = Array.isArray(product.galleryMeta)
        ? product.galleryMeta
        : safeJson(product.galleryMeta, []);
      const images = metadata.length
        ? metadata
        : [
            product.image && {
              url: product.image,
              alt: product.imageAlt || product.name,
              slug: product.imageSlug || `${product.slug}-main`,
            },
            ...String(product.gallery || "")
              .split(/\r?\n/)
              .filter(Boolean)
              .map((url, index) => ({
                url,
                alt: `${product.name} image ${index + 2}`,
                slug: `${product.slug}-${index + 2}`,
              })),
          ].filter(Boolean);
      return images.map((image) => ({
        ...image,
        productName: product.name,
        productSlug: product.slug || product.id,
      }));
    });
    if (!galleryImages.length)
      galleryImages = [
        ...document.querySelectorAll(".product-card .image-link img"),
      ].map((image, index) => ({
        url: image.currentSrc || image.src,
        alt: image.alt,
        slug: `catalog-image-${index + 1}`,
        productName:
          image.closest(".product-card")?.querySelector("h3")?.textContent ||
          "PakMarket product",
        productSlug: "",
      }));
    const seen = new Set();
    galleryImages = galleryImages.filter((image) => {
      if (!image.url || seen.has(image.url)) return false;
      seen.add(image.url);
      return true;
    });
    let galleryPage = 0;
    const pageSize = () => (innerWidth <= 700 ? 6 : innerWidth <= 1050 ? 6 : 8);
    const renderGallery = () => {
      const size = pageSize();
      const pages = Math.max(1, Math.ceil(galleryImages.length / size));
      galleryPage = Math.min(galleryPage, pages - 1);
      const items = galleryImages.slice(galleryPage * size, (galleryPage + 1) * size);
      grid.innerHTML = items
        .map(
          (image) => `<a class="product-gallery-item" href="${image.productSlug ? productUrl(image.productSlug) : "products.html"}" data-image-slug="${contentEscape(image.slug || "")}"><img src="${contentEscape(image.url)}" alt="${contentEscape(image.alt || image.productName)}" loading="lazy"><span>${contentEscape(image.productName)}</span></a>`,
        )
        .join("");
      empty.hidden = galleryImages.length > 0;
      grid.hidden = !galleryImages.length;
      pageLabel.textContent = `${galleryPage + 1} / ${pages}`;
      previous.disabled = galleryPage === 0;
      next.disabled = galleryPage >= pages - 1;
      gallerySection.classList.toggle("single-page", pages === 1);
    };
    previous.addEventListener("click", () => {
      galleryPage = Math.max(0, galleryPage - 1);
      renderGallery();
    });
    next.addEventListener("click", () => {
      const pages = Math.max(1, Math.ceil(galleryImages.length / pageSize()));
      galleryPage = Math.min(pages - 1, galleryPage + 1);
      renderGallery();
    });
    let galleryResizeTimer;
    addEventListener("resize", () => {
      clearTimeout(galleryResizeTimer);
      galleryResizeTimer = setTimeout(renderGallery, 120);
    });
    renderGallery();
  }

  try {
    const storedBlogs = localStorage.getItem("pakmarket_blogs_v1"),
      isBlogList = isRoute("blog"),
      isBlogDetail = isRoute("blog-detail");
    if (isBlogList || isBlogDetail) {
      const savedBlogs = JSON.parse(storedBlogs || "[]") || [],
        allBlogs = Array.isArray(savedBlogs) && savedBlogs.length
          ? savedBlogs
          : DEFAULT_BLOGS,
        session = JSON.parse(
          localStorage.getItem("pakmarket_session_v1") || "null",
        ),
        canPreview =
          new URLSearchParams(location.search).get("preview") === "1" &&
          ["admin", "super_admin"].includes(session?.role);
      if (isBlogList) {
        const published = allBlogs.filter((item) => item.enabled);
        if (published.length) {
          const featured =
              published.find((item) => item.featured) || published[0],
            others = published.filter((item) => item.id !== featured.id),
            lead = document.querySelector(".blog-lead"),
            top = document.querySelector(".blog-top-row"),
            grid = document.querySelector(".editorial-grid");
          if (lead) {
            lead.href = blogUrl(featured.slug);
            lead.innerHTML = `<div class="blog-lead-image"><img src="${contentEscape(featured.image)}" alt="${contentEscape(featured.coverAlt || featured.title)}" data-image-slug="${contentEscape(featured.coverSlug || "")}" fetchpriority="high" decoding="async"></div><div class="blog-lead-copy"><span>Featured story</span><h2>${contentEscape(featured.title)}</h2><p>${contentEscape(featured.excerpt)}</p><small>By ${contentEscape(featured.author)} · ${Number(featured.readTime) || 5} min read</small></div>`;
          }
          if (top)
            top.innerHTML = others
              .slice(0, 3)
              .map(
                (item) =>
                  `<a href="${blogUrl(item.slug)}"><img src="${contentEscape(item.image)}" alt="${contentEscape(item.coverAlt || item.title)}" data-image-slug="${contentEscape(item.coverSlug || "")}" loading="lazy" decoding="async"><h3>${contentEscape(item.title)}</h3><small>${contentEscape(item.category)} · ${Number(item.readTime) || 5} min read</small></a>`,
              )
              .join("");
          if (grid)
            grid.innerHTML = published
              .map(
                (item) =>
                  `<article class="blog-card"><a href="${blogUrl(item.slug)}"><div class="blog-media"><img src="${contentEscape(item.image)}" alt="${contentEscape(item.coverAlt || item.title)}" data-image-slug="${contentEscape(item.coverSlug || "")}" loading="lazy" decoding="async"><span class="badge-light">${contentEscape(item.category)}</span></div><div class="blog-body"><h3>${contentEscape(item.title)}</h3><p>${contentEscape(item.excerpt)}</p><span class="blog-meta">${Number(item.readTime) || 5} min read</span><span class="inline-link">Read More <span class="material-symbols-outlined">arrow_forward</span></span></div></a></article>`,
              )
              .join("");
        }
      }
      if (isBlogDetail) {
        const slug = blogSlug,
          item = allBlogs.find(
            (blog) => blog.slug === slug && (blog.enabled || canPreview),
          );
        if (!item && slug) {
          location.replace("/blog");
          return;
        }
        if (item) {
          if (!isPrettyBlog) history.replaceState({}, "", blogUrl(item.slug));
          document.title = item.seoTitle || `${item.title} | PakMarket`;
          const setMeta = (name, value) => {
            let meta = document.querySelector(`meta[name="${name}"]`);
            if (!meta) {
              meta = document.createElement("meta");
              meta.name = name;
              document.head.append(meta);
            }
            meta.content = value || "";
          };
          setMeta("description", item.metaDescription);
          setMeta("keywords", item.keywords);
          setMeta(
            "robots",
            item.seoIndex && item.enabled
              ? "index, follow, max-image-preview:large"
              : "noindex, nofollow",
          );
          setMeta("author", item.author);
          const setPropertyMeta = (property, value) => {
            let meta = document.querySelector(`meta[property="${property}"]`);
            if (!meta) {
              meta = document.createElement("meta");
              meta.setAttribute("property", property);
              document.head.append(meta);
            }
            meta.content = value || "";
          };
          const canonicalUrl = absoluteUrl(blogUrl(item.slug));
          setPropertyMeta("og:title", item.title);
          setPropertyMeta("og:description", item.metaDescription);
          setPropertyMeta("og:url", canonicalUrl);
          setPropertyMeta("og:image", item.image);
          setMeta("twitter:title", item.title);
          setMeta("twitter:description", item.metaDescription);
          setMeta("twitter:image", item.image);
          let canonical = document.querySelector('link[rel="canonical"]');
          if (!canonical) {
            canonical = document.createElement("link");
            canonical.rel = "canonical";
            document.head.append(canonical);
          }
          canonical.href = canonicalUrl;
          const heading = document.querySelector(".article-heading");
          heading.querySelector("h1").textContent = item.title;
          heading.querySelector(".article-intro").textContent = item.excerpt;
          heading.querySelector(".eyebrow").textContent = item.category;
          const breadcrumbCurrent = heading.querySelector(
            ".breadcrumb span:last-child",
          );
          if (breadcrumbCurrent) breadcrumbCurrent.textContent = item.category;
          const strong = heading.querySelector(".article-meta strong");
          if (strong) strong.textContent = item.author;
          const initials = heading.querySelector(".author-avatar");
          if (initials)
            initials.textContent = item.author
              .split(/\s+/)
              .map((part) => part[0])
              .join("")
              .slice(0, 2)
              .toUpperCase();
          const time = heading.querySelector("time");
          if (time) {
            time.dateTime = item.publishDate;
            time.innerHTML = `<span class="material-symbols-outlined">calendar_today</span>${new Date(item.publishDate + "T00:00:00").toLocaleDateString("en-PK", { dateStyle: "long" })}`;
          }
          const read = heading.querySelector(".article-meta>span:last-child");
          if (read)
            read.innerHTML = `<span class="material-symbols-outlined">schedule</span>${Number(item.readTime) || 5} min read`;
          const image = document.querySelector(".article-media img");
          if (image) {
            image.src = item.image;
            image.alt = item.coverAlt || item.title;
            image.dataset.imageSlug = item.coverSlug || "";
          }
          const article = document.querySelector(".article-content");
          if (article) {
            const content = String(item.content || "");
            article.innerHTML = /<[a-z][\s\S]*>/i.test(content)
              ? sanitizeRichHtml(content)
              : content
                  .split(/\n{2,}/)
                  .filter(Boolean)
                  .map(
                    (paragraph, index) =>
                      `<p${index === 0 ? ' class="article-lead"' : ""}>${contentEscape(paragraph).replaceAll("\n", "<br>")}</p>`,
                  )
                  .join("");
          }
          document
            .querySelectorAll("[data-share-title]")
            .forEach((box) => (box.dataset.shareTitle = item.title));
          const related = document.querySelector(".related-articles");
          if (related)
            related.innerHTML = allBlogs
              .filter((blog) => blog.enabled && blog.id !== item.id)
              .slice(0, 3)
              .map(
                (blog) =>
                  `<a class="related-story" href="${blogUrl(blog.slug)}"><span class="material-symbols-outlined">menu_book</span><div><small>${contentEscape(blog.category)} · ${Number(blog.readTime) || 5} min read</small><h3>${contentEscape(blog.title)}</h3></div></a>`,
              )
              .join("");
          const schema = document.querySelector(
            'script[type="application/ld+json"]',
          );
          if (schema)
            schema.textContent = JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "BlogPosting",
                  headline: item.title,
                  description: item.metaDescription,
                  image: [item.image],
                  datePublished: item.publishDate,
                  dateModified: item.publishDate,
                  author: { "@type": "Person", name: item.author },
                  mainEntityOfPage: canonicalUrl,
                  publisher: {
                    "@type": "Organization",
                    name: SITE_CONFIG.name,
                    url: SITE_CONFIG.url,
                  },
                },
                {
                  "@type": "BreadcrumbList",
                  itemListElement: [
                    {
                      "@type": "ListItem",
                      position: 1,
                      name: "Home",
                      item: `${SITE_CONFIG.url}/`,
                    },
                    {
                      "@type": "ListItem",
                      position: 2,
                      name: "Blog",
                      item: absoluteUrl("/blog"),
                    },
                    { "@type": "ListItem", position: 3, name: item.title },
                  ],
                },
              ],
            });
        }
      }
    }
  } catch {}

  try {
    const filename = (
      window.location.pathname.split("/").filter(Boolean).pop() || "index"
    )
      .replace(/\.html$/i, "")
      .toLowerCase();
    const pageKey = {
      index: "home",
      products: "products",
      product: "product",
      blog: "blog",
      "blog-detail": "blog-detail",
      about: "about",
      contact: "contact",
      payment: "payment",
      "return-policy": "return-policy",
    }[filename];
    const pageSettings = (
      JSON.parse(localStorage.getItem("pakmarket_pages_v1")) || []
    ).find((item) => item.key === pageKey);
    if (pageSettings) {
      document.title = pageSettings.metaTitle || document.title;
      const setMeta = (name, content) => {
        let meta = document.querySelector(`meta[name="${name}"]`);
        if (!meta) {
          meta = document.createElement("meta");
          meta.name = name;
          document.head.appendChild(meta);
        }
        meta.content = content || "";
      };
      setMeta("description", pageSettings.metaDescription);
      setMeta("keywords", pageSettings.keywords);
      setMeta(
        "robots",
        pageSettings.seoIndex && pageSettings.enabled
          ? "index, follow, max-image-preview:large"
          : "noindex, nofollow",
      );
      let canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement("link");
        canonical.rel = "canonical";
        document.head.appendChild(canonical);
      }
      const configuredCanonical = pageSettings.canonical || location.pathname;
      canonical.href = absoluteUrl(
        new URL(configuredCanonical, `${SITE_CONFIG.url}/`).pathname,
      );
      const selectors = {
        home: [".hero-content h1", ".hero-content > p"],
        products: [".page-hero h1", ".page-hero p"],
        product: [".detail-copy h1", ".product-rich-description"],
        blog: [".page-hero h1", ".page-hero p"],
        "blog-detail": [".article-heading h1", ".article-intro"],
        about: [".about-hero h1", ".about-hero p"],
        contact: [".page-hero h1", ".page-hero p"],
        payment: [".page-hero h1", ".page-hero p"],
        "return-policy": [".page-hero h1", ".page-hero p"],
      };
      const replaceHeadingLevel = (element, level) => {
        const safeLevel = ["h1", "h2", "h3"].includes(
          (level || "").toLowerCase(),
        )
          ? level.toLowerCase()
          : element.tagName.toLowerCase();
        if (element.tagName.toLowerCase() === safeLevel) return element;
        const replacement = document.createElement(safeLevel);
        [...element.attributes].forEach((attribute) =>
          replacement.setAttribute(attribute.name, attribute.value),
        );
        replacement.innerHTML = element.innerHTML;
        element.replaceWith(replacement);
        return replacement;
      };
      const [headingSelector, paragraphSelector] = selectors[pageKey] || [];
      let heading = headingSelector && document.querySelector(headingSelector);
      const paragraph =
        paragraphSelector && document.querySelector(paragraphSelector);
      if (heading)
        heading = replaceHeadingLevel(
          heading,
          pageSettings.headingLevel || "h1",
        );
      if (heading && pageSettings.heading)
        heading.textContent = pageSettings.heading;
      if (paragraph && pageSettings.paragraph)
        paragraph.textContent = pageSettings.paragraph;
      if (pageKey === "home") {
        document
          .querySelectorAll("[data-home-heading]")
          .forEach((originalElement) => {
            const key = originalElement.dataset.homeHeading;
            const element = replaceHeadingLevel(
              originalElement,
              pageSettings[`${key}Level`] || "h2",
            );
            const value = pageSettings[key];
            if (value) element.textContent = value;
          });
      }
      const session = JSON.parse(
        localStorage.getItem("pakmarket_session_v1") || "null",
      );
      const canPreview =
        new URLSearchParams(location.search).get("preview") === "1" &&
        ["admin", "super_admin"].includes(session?.role);
      if (!pageSettings.enabled && !canPreview) {
        const main = document.querySelector("main");
        if (main)
          main.innerHTML =
            '<section class="page-unavailable"><span class="material-symbols-outlined">construction</span><h1>Page temporarily unavailable</h1><p>This page is currently disabled. Please return to the homepage.</p><a class="btn btn-primary" href="index.html">Back to Home</a></section>';
      }
    }
  } catch {}

  const managedSlug = productSlug;
  if (managedSlug && isRoute("product")) {
    try {
      const managedProduct = managedInventory.find(
        (item) => item.slug === managedSlug || item.id === managedSlug,
      );
      if (!managedProduct && demoActive) {
        const main = document.querySelector("main");
        if (main) main.innerHTML = '<section class="page-unavailable"><span class="material-symbols-outlined">inventory_2</span><h1>Product not available in demo</h1><p>The store owner has not added this product yet.</p><a class="btn btn-primary" href="products.html">Browse demo products</a></section>';
      }
      if (managedProduct) {
        const cleanProductPath = productUrl(managedProduct.slug);
        if (location.pathname !== cleanProductPath)
          history.replaceState({}, "", cleanProductPath);
        document.title =
          managedProduct.seoTitle || `${managedProduct.name} | PakMarket`;
        let description = document.querySelector('meta[name="description"]');
        if (!description) {
          description = document.createElement("meta");
          description.name = "description";
          document.head.appendChild(description);
        }
        description.content =
          managedProduct.metaDescription ||
          richTextToPlain(managedProduct.description) ||
          "";
        let robots = document.querySelector('meta[name="robots"]');
        if (!robots) {
          robots = document.createElement("meta");
          robots.name = "robots";
          document.head.appendChild(robots);
        }
        robots.content =
          managedProduct.seoIndex && managedProduct.enabled
            ? "index, follow, max-image-preview:large"
            : "noindex, nofollow";
        let canonical = document.querySelector('link[rel="canonical"]');
        if (!canonical) {
          canonical = document.createElement("link");
          canonical.rel = "canonical";
          document.head.appendChild(canonical);
        }
        const canonicalUrl = absoluteUrl(productUrl(managedProduct.slug));
        canonical.href = canonicalUrl;
        const setPropertyMeta = (property, content) => {
          let meta = document.querySelector(`meta[property="${property}"]`);
          if (!meta) {
            meta = document.createElement("meta");
            meta.setAttribute("property", property);
            document.head.appendChild(meta);
          }
          meta.content = content || "";
        };
        const setNamedMeta = (name, content) => {
          let meta = document.querySelector(`meta[name="${name}"]`);
          if (!meta) {
            meta = document.createElement("meta");
            meta.name = name;
            document.head.appendChild(meta);
          }
          meta.content = content || "";
        };
        setPropertyMeta("og:type", "product");
        setPropertyMeta("og:title", managedProduct.name);
        setPropertyMeta("og:description", description.content);
        setPropertyMeta("og:url", canonicalUrl);
        setPropertyMeta("og:image", managedProduct.image);
        setPropertyMeta(
          "og:image:alt",
          managedProduct.imageAlt || managedProduct.name,
        );
        setNamedMeta("twitter:card", "summary_large_image");
        setNamedMeta("twitter:title", managedProduct.name);
        setNamedMeta("twitter:description", description.content);
        setNamedMeta("twitter:image", managedProduct.image);
        const breadcrumb = document.querySelector(".breadcrumb");
        const breadcrumbLinks = breadcrumb?.querySelectorAll("a");
        const breadcrumbCurrent = breadcrumb?.querySelector(":scope > span:last-child");
        if (breadcrumbLinks?.[1]) {
          breadcrumbLinks[1].textContent = "Products";
          breadcrumbLinks[1].href = "products.html";
        }
        if (breadcrumbCurrent) breadcrumbCurrent.textContent = managedProduct.name;

        const productHeading = document.querySelector(".detail-copy h1");
        const productPrice = document.querySelector(".detail-price .price");
        const comparePrice = document.querySelector(".detail-price .old-price");
        const discountBadge = document.querySelector(".detail-price .badge-light");
        if (productHeading) productHeading.textContent = managedProduct.name;
        if (productPrice)
          productPrice.textContent = `Rs. ${Number(managedProduct.price || 0).toLocaleString("en-PK")}`;
        const hasDiscount =
          Number(managedProduct.comparePrice) > Number(managedProduct.price);
        if (comparePrice) {
          comparePrice.hidden = !hasDiscount;
          comparePrice.textContent = hasDiscount
            ? `Rs. ${Number(managedProduct.comparePrice).toLocaleString("en-PK")}`
            : "";
        }
        if (discountBadge) {
          discountBadge.hidden = !hasDiscount;
          discountBadge.textContent = hasDiscount
            ? `-${Math.round((1 - Number(managedProduct.price) / Number(managedProduct.comparePrice)) * 100)}% Off`
            : "";
        }

        const stockCard = document.querySelector(".stock-card");
        const stock = Number(managedProduct.stock || 0);
        if (stockCard) {
          stockCard.classList.toggle("out-of-stock", stock <= 0);
          const stockIcon = stockCard.querySelector(".material-symbols-outlined");
          const stockTitle = stockCard.querySelector("strong");
          const stockCopy = stockCard.querySelector(":scope > div > span");
          if (stockIcon) stockIcon.textContent = stock > 0 ? "check_circle" : "cancel";
          if (stockTitle) stockTitle.textContent = stock > 0 ? "In Stock" : "Out of Stock";
          if (stockCopy)
            stockCopy.textContent = stock > 0
              ? `${stock} item${stock === 1 ? "" : "s"} available · Ready to order`
              : "Please contact us for restock information";
        }

        document
          .querySelectorAll(
            ".site-header [data-whatsapp], .detail-primary-actions [data-whatsapp], .detail-mobile-bar [data-whatsapp]",
          )
          .forEach((link) => (link.dataset.item = managedProduct.name));
        document.querySelectorAll("[data-share-title]").forEach((element) => {
          element.dataset.shareTitle = managedProduct.name;
        });
        const detailsPanel = document.querySelector(".accordion-item:first-child .accordion-panel");
        if (detailsPanel) {
          const richDescription = String(managedProduct.description || "");
          detailsPanel.innerHTML = /<[a-z][\s\S]*>/i.test(richDescription)
            ? sanitizeRichHtml(richDescription)
            : `<p>${contentEscape(richDescription || "Product details will be added soon.").replaceAll("\n", "<br>")}</p>`;
        }
        const recommendationCopy = document.querySelector(".recommend-row")
          ?.closest("section")
          ?.querySelector(".section-heading p");
        if (recommendationCopy)
          recommendationCopy.textContent = `More products from ${managedProduct.category || "PakMarket"}`;
        const galleryItems = Array.isArray(managedProduct.galleryMeta)
          ? managedProduct.galleryMeta
          : (() => {
              try {
                return JSON.parse(managedProduct.galleryMeta || "[]");
              } catch {
                return [];
              }
            })();
        const images = galleryItems.length
          ? galleryItems
          : [
              {
                url: managedProduct.image,
                alt: managedProduct.imageAlt || managedProduct.name,
                slug: managedProduct.imageSlug || `${managedProduct.slug}-main`,
              },
              ...String(managedProduct.gallery || "")
                .split(/\r?\n/)
                .filter(Boolean)
                .map((url, index) => ({
                  url,
                  alt: `${managedProduct.name} image ${index + 2}`,
                  slug: `${managedProduct.slug}-${index + 2}`,
                })),
            ];
        const mainImage = document.querySelector("[data-gallery-main]");
        const thumbs = document.querySelector(".thumb-row");
        if (mainImage && images[0]) {
          mainImage.src = images[0].url;
          mainImage.alt = images[0].alt;
        }
        if (thumbs && images.length) {
          thumbs.innerHTML = images
            .map(
              (image, index) =>
                `<button class="thumb ${index ? "" : "active"}" type="button" data-gallery-thumb data-image-slug="${contentEscape(image.slug || "")}"><img src="${contentEscape(image.url)}" alt="${contentEscape(image.alt || managedProduct.name)}"></button>`,
            )
            .join("");
          thumbs.hidden = images.length < 2;
        }
        const swatches = document.querySelector(".swatches");
        if (swatches && !managedProduct.colors?.length) swatches.hidden = true;
        const favorite = document.querySelector(".favorite");
        if (favorite) {
          if (!window.PakMarketDB?.configured) {
            favorite.remove();
          } else {
          favorite.dataset.wishlist = managedProduct.id;
          favorite.addEventListener("click", async () => {
            const session = await window.PakMarketDB.session();
            if (!session) {
              location.href = "/auth?next=product";
              return;
            }
            const { error } = await window.PakMarketDB.client
              .from("wishlists")
              .upsert({ user_id: session.user.id, product_id: managedProduct.id });
            showToast(error ? error.message : "Saved to your wishlist.");
          });
          }
        }
      }
    } catch {}
  }

  const storefrontGrid = document.querySelector("[data-storefront-grid]");
  if (storefrontGrid) {
    try {
      const itemsToRender = Array.isArray(managedInventory) && managedInventory.length > 0 ? managedInventory : DEFAULT_PRODUCTS;
      const safe = (value = "") =>
        String(value).replace(
          /[&<>'"]/g,
          (char) =>
            ({
              "&": "&amp;",
              "<": "&lt;",
              ">": "&gt;",
              "'": "&#39;",
              '"': "&quot;",
            })[char],
        );
      const visible = itemsToRender
        .filter((product) => product.enabled ?? product.status === "active" ?? true)
        .slice(0, 8);
      storefrontGrid.innerHTML = visible
        .map((product) => {
          const catName = String(product.category || "product").toLowerCase();
          const isService = /service|room|stage|event|decor/i.test(catName) || /service|room|stage|event|decor/i.test(product.slug || "");
          const slugCategory = catName.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
          const categoryAttr = `all ${isService ? "services service" : "products product"} ${slugCategory} ${catName.replace(/[^a-z0-9]+/g, " ")}${product.featured ? " best" : ""}`;
          return `<article class="product-card featured-gallery-card" data-product-card data-category="${safe(categoryAttr)}">
          <a class="image-link" href="${productUrl(product.slug || product.id)}"><img src="${safe(product.image)}" alt="${safe(product.imageAlt || product.name)}" loading="lazy"></a>
          <span class="badge-light product-badge">${isService ? "Karachi Service" : "Karachi Delivery"}</span>
          <div class="product-body" style="padding: 14px 16px 18px; text-align: center;">
            <h3 style="margin: 0; font-size: 16px;"><a href="${productUrl(product.slug || product.id)}" style="color: inherit; text-decoration: none;">${safe(product.name)}</a></h3>
          </div>
        </article>`;
        })
        .join("");

      // Support home gallery filter buttons if present (max 8 per tab)
      document.querySelectorAll("[data-home-filter]").forEach((btn) => {
        btn.addEventListener("click", () => {
          document.querySelectorAll("[data-home-filter]").forEach((b) => b.classList.remove("active"));
          btn.classList.add("active");
          const targetFilter = btn.getAttribute("data-home-filter");
          let count = 0;
          storefrontGrid.querySelectorAll(".product-card").forEach((card) => {
            const cat = card.getAttribute("data-category") || "";
            if ((targetFilter === "all" || cat.includes(targetFilter)) && count < 8) {
              card.style.display = "";
              count++;
            } else {
              card.style.display = "none";
            }
          });
        });
      });
    } catch (error) {
      console.warn("Could not load managed inventory", error);
    }
  }

  document.querySelectorAll(".product-card").forEach((card) => {
    const title = card.querySelector("h3")?.textContent.trim();
    const productLink = card.querySelector(".image-link");
    if (!title || !productLink) return;
    const managed = managedInventory.find(
      (item) => item.name?.trim().toLowerCase() === title.toLowerCase(),
    );
    const slug =
      managed?.slug ||
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
    productLink.href = productUrl(slug);
    card.querySelectorAll(".quick-chat").forEach((button) => button.remove());
    const cardButton = card.querySelector(".card-button");
    if (cardButton) {
      cardButton.removeAttribute("data-whatsapp");
      cardButton.removeAttribute("data-item");
      cardButton.removeAttribute("target");
      cardButton.removeAttribute("rel");
      cardButton.href = productUrl(slug);
      const unavailable = /unavailable|notify|out of stock/i.test(cardButton.textContent);
      cardButton.innerHTML = `<span class="material-symbols-outlined">tune</span>${unavailable ? "Check Availability" : "Select Options & Order"}`;
    }
  });

  document.querySelectorAll("[data-page-link]").forEach((link) => {
    if (link.dataset.pageLink === page) link.classList.add("active");
  });

  let currentSession = null;
  try {
    currentSession = JSON.parse(localStorage.getItem("pakmarket_session_v1"));
  } catch {}
  const accountHref =
    currentSession && ["admin", "super_admin"].includes(currentSession.role)
      ? "/admin"
      : "/auth";
  const navActions = document.querySelector(".nav-actions");
  if (navActions && !navActions.querySelector("[data-account-link]")) {
    const accountLink = document.createElement("a");
    accountLink.className = "account-link";
    accountLink.dataset.accountLink = "";
    accountLink.href = accountHref;
    accountLink.setAttribute(
      "aria-label",
      currentSession ? "Open account" : "Sign in or create account",
    );
    accountLink.innerHTML = `<span class="material-symbols-outlined">${currentSession ? "account_circle" : "login"}</span>`;
    navActions.appendChild(accountLink);
  }
  const mobileNav = document.querySelector("[data-mobile-panel] nav");
  if (mobileNav && !mobileNav.querySelector("[data-account-link]")) {
    const mobileAccount = document.createElement("a");
    mobileAccount.dataset.accountLink = "";
    mobileAccount.href = accountHref;
    mobileAccount.textContent =
      currentSession && ["admin", "super_admin"].includes(currentSession.role)
        ? "Admin Dashboard"
        : currentSession
          ? "My Account"
          : "Sign in / Create account";
    mobileNav.insertBefore(mobileAccount, mobileNav.lastElementChild);
  }

  document.querySelectorAll("[data-whatsapp]").forEach((link) => {
    const item = link.dataset.item || "PakMarket products";
    const customMessage = link.dataset.whatsappMessage;
    link.setAttribute(
      "href",
      whatsappUrl(
        customMessage || `Assalam o Alaikum, I want to order ${item}. Please share details.`,
      ),
    );
    link.setAttribute("target", "_blank");
    link.setAttribute("rel", "noreferrer");
  });

  document.querySelectorAll(".site-header [data-whatsapp], .mobile-panel [data-whatsapp]").forEach((link) => {
    link.dataset.item = "Shah Decorator booking";
    link.href = whatsappUrl("Hello, I would like to consult regarding Shah Decorator packages.");
    const textNode = [...link.childNodes].find((node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim());
    if (textNode) textNode.textContent = " WhatsApp Booking";
    else link.append("WhatsApp Booking");
  });


  const menuButton = document.querySelector("[data-menu-button]");
  const mobilePanel = document.querySelector("[data-mobile-panel]");
  if (menuButton && mobilePanel) {
    const setMenuOpen = (isOpen) => {
      mobilePanel.classList.toggle("open", isOpen);
      document.body.classList.toggle("menu-open", isOpen);
      menuButton.setAttribute("aria-expanded", String(isOpen));
      menuButton.querySelector(".material-symbols-outlined").textContent =
        isOpen ? "close" : "menu";
    };
    const closeButton = document.createElement("button");
    closeButton.className = "mobile-panel-close";
    closeButton.type = "button";
    closeButton.setAttribute("aria-label", "Close menu");
    closeButton.innerHTML =
      '<span class="material-symbols-outlined">close</span>';
    mobilePanel.prepend(closeButton);
    menuButton.addEventListener("click", () =>
      setMenuOpen(!mobilePanel.classList.contains("open")),
    );
    closeButton.addEventListener("click", () => setMenuOpen(false));
    mobilePanel
      .querySelectorAll("a")
      .forEach((link) =>
        link.addEventListener("click", () => setMenuOpen(false)),
      );
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && mobilePanel.classList.contains("open")) {
        setMenuOpen(false);
        menuButton.focus();
      }
    });
  }

  document.querySelectorAll("[data-accordion-trigger]").forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const item = trigger.closest("[data-accordion-item]");
      item.classList.toggle("open");
      const icon = trigger.querySelector(".material-symbols-outlined");
      if (icon)
        icon.textContent = item.classList.contains("open")
          ? "expand_less"
          : "expand_more";
    });
  });

  document.querySelectorAll("[data-faq-trigger]").forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const item = trigger.closest(".faq-item");
      item.classList.toggle("open");
      const icon = trigger.querySelector(".material-symbols-outlined");
      if (icon)
        icon.textContent = item.classList.contains("open") ? "remove" : "add";
    });
  });

  document.querySelectorAll("[data-gallery-thumb]").forEach((thumb) => {
    thumb.addEventListener("click", () => {
      const main = document.querySelector("[data-gallery-main]");
      const image = thumb.querySelector("img");
      if (!main || !image) return;
      main.src = image.src;
      main.alt = image.alt;
      document
        .querySelectorAll("[data-gallery-thumb]")
        .forEach((item) => item.classList.remove("active"));
      thumb.classList.add("active");
    });
  });

  const filterButtons = document.querySelectorAll("[data-filter]");
  const products = [...document.querySelectorAll("[data-product-card]")];
  const loadMoreButton = document.querySelector("[data-load-more]");
  const pageSize =
    window.innerWidth <= 680 ? 6 : window.innerWidth <= 1020 ? 8 : 10;
  const initialSize =
    window.innerWidth <= 680 ? 10 : window.innerWidth <= 1020 ? 12 : 20;
  let visibleLimit = initialSize;
  let activeFilter = "all";
  let searchTerm = "";

  const urlFilterParam =
    new URLSearchParams(window.location.search).get("type") ||
    new URLSearchParams(window.location.search).get("filter") ||
    new URLSearchParams(window.location.search).get("category") ||
    (window.location.hash ? window.location.hash.replace("#", "") : "");
  if (urlFilterParam) {
    const targetFilter = urlFilterParam.toLowerCase();
    const matchingButton = [...filterButtons].find(
      (b) =>
        b.dataset.filter === targetFilter ||
        b.dataset.filter === targetFilter.replace(/s$/, "") ||
        b.dataset.filter.includes(targetFilter),
    );
    if (matchingButton) {
      filterButtons.forEach((item) => item.classList.remove("active"));
      matchingButton.classList.add("active");
      activeFilter = matchingButton.dataset.filter;
    } else {
      activeFilter = targetFilter;
    }
  }

  const updateProductVisibility = () => {
    const matches = products.filter((card) => {
      const categories = (card.dataset.category || "").split(" ");
      const title = card.querySelector("h3")?.textContent.toLowerCase() || "";
      const badge = card.querySelector(".product-badge")?.textContent.toLowerCase() || "";
      const matchesSearch =
        !searchTerm ||
        title.includes(searchTerm) ||
        categories.some((cat) => cat.includes(searchTerm)) ||
        badge.includes(searchTerm);
      return (
        (activeFilter === "all" || categories.includes(activeFilter)) &&
        matchesSearch
      );
    });
    products.forEach((card) => {
      card.style.display = "none";
    });
    matches.slice(0, visibleLimit).forEach((card) => {
      card.style.display = "";
    });
    if (loadMoreButton) {
      const remaining = Math.max(0, matches.length - visibleLimit);
      loadMoreButton.parentElement.style.display = remaining ? "flex" : "none";
      loadMoreButton.firstChild.textContent = remaining
        ? `Load ${Math.min(pageSize, remaining)} More Products `
        : "All Products Loaded ";
    }
  };

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      filterButtons.forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      activeFilter = button.dataset.filter;
      visibleLimit = initialSize;
      updateProductVisibility();
    });
  });

  document.querySelectorAll("[data-search-products]").forEach((input) => {
    input.addEventListener("input", () => {
      searchTerm = input.value.trim().toLowerCase();
      visibleLimit = initialSize;
      updateProductVisibility();
    });
  });

  loadMoreButton?.addEventListener("click", () => {
    visibleLimit += pageSize;
    updateProductVisibility();
  });
  if (products.length) updateProductVisibility();

  document.querySelectorAll("[data-subscribe-form]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const email = new FormData(form).get("email");
      window.open(
        whatsappUrl(
          `Assalam o Alaikum, please add ${email} to PakMarket updates.`,
        ),
        "_blank",
        "noopener,noreferrer",
      );
      form.reset();
      showToast("WhatsApp opened to confirm your updates request.");
    });
  });

  document.querySelectorAll("[data-contact-form]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const data = new FormData(form);
      const message = [
        "Assalam o Alaikum, I am contacting PakMarket.",
        `Name: ${data.get("name")}`,
        `Phone: ${data.get("phone")}`,
        `Email: ${data.get("email") || "Not provided"}`,
        `Topic: ${data.get("topic")}`,
        `Message: ${data.get("message")}`,
      ].join("\n");
      window.open(whatsappUrl(message), "_blank", "noopener,noreferrer");
      showToast("Your message is ready in WhatsApp.");
    });
  });

  document.querySelectorAll("[data-copy-link]").forEach((button) => {
    button.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(window.location.href);
        showToast("Article link copied.");
      } catch {
        showToast("Copy the link from your browser address bar.");
      }
    });
  });

  document.querySelectorAll("[data-share-platform]").forEach((button) => {
    button.addEventListener("click", async () => {
      const platform = button.dataset.sharePlatform;
      const container = button.closest("[data-share-title]");
      const title = container?.dataset.shareTitle || document.title;
      const url = window.location.href;
      const encodedUrl = encodeURIComponent(url);
      const encodedText = encodeURIComponent(`${title} — ${url}`);
      if (platform === "facebook") {
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
          "_blank",
          "noopener,noreferrer,width=720,height=560",
        );
      } else if (platform === "whatsapp") {
        window.open(
          `https://wa.me/?text=${encodedText}`,
          "_blank",
          "noopener,noreferrer",
        );
      } else if (platform === "instagram") {
        try {
          await navigator.clipboard.writeText(url);
          showToast(
            "Link copied. Paste it into your Instagram story or message.",
          );
        } catch {
          showToast("Copy this page link and share it on Instagram.");
        }
        window.open(
          "https://www.instagram.com/",
          "_blank",
          "noopener,noreferrer",
        );
      } else if (platform === "native" && navigator.share) {
        try {
          await navigator.share({ title, text: title, url });
        } catch (error) {
          if (error.name !== "AbortError")
            showToast("Sharing is not available in this browser.");
        }
      } else {
        try {
          await navigator.clipboard.writeText(url);
          showToast("Link copied.");
        } catch {
          showToast("Copy the link from your browser address bar.");
        }
      }
    });
  });

  document.querySelectorAll("[data-share-menu]").forEach((menu) => {
    const toggle = menu.querySelector("[data-share-toggle]");
    const popover = menu.querySelector("[data-share-popover]");
    if (!toggle || !popover) return;
    toggle.addEventListener("click", (event) => {
      event.stopPropagation();
      const willOpen = popover.hidden;
      document.querySelectorAll("[data-share-popover]").forEach((item) => {
        item.hidden = true;
      });
      document
        .querySelectorAll("[data-share-toggle]")
        .forEach((item) => item.setAttribute("aria-expanded", "false"));
      popover.hidden = !willOpen;
      toggle.setAttribute("aria-expanded", String(willOpen));
    });
    popover.addEventListener("click", (event) => event.stopPropagation());
  });
  document.addEventListener("click", () => {
    document.querySelectorAll("[data-share-popover]").forEach((item) => {
      item.hidden = true;
    });
    document
      .querySelectorAll("[data-share-toggle]")
      .forEach((item) => item.setAttribute("aria-expanded", "false"));
  });

  document.querySelectorAll("[data-hero-slider]").forEach((slider) => {
    const slides = [...slider.querySelectorAll(".hero-slide")];
    const dots = [...slider.querySelectorAll("[data-hero-dot]")];
    if (slides.length < 2) return;
    let current = slides.findIndex((slide) => slide.classList.contains("active"));
    if (current < 0) current = 0;
    let timer = null;
    let paused = false;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const showSlide = (index) => {
      current = (index + slides.length) % slides.length;
      slides.forEach((slide, position) =>
        slide.classList.toggle("active", position === current),
      );
      dots.forEach((dot, position) =>
        dot.classList.toggle("active", position === current),
      );
      dots.forEach((dot, position) =>
        dot.setAttribute("aria-current", position === current ? "true" : "false"),
      );
    };
    const stop = () => {
      window.clearTimeout(timer);
      timer = null;
    };
    const schedule = () => {
      stop();
      if (paused || reduceMotion.matches || document.hidden) return;
      timer = window.setTimeout(() => {
        showSlide(current + 1);
        schedule();
      }, 4500);
    };
    dots.forEach((dot, index) =>
      dot.addEventListener("click", () => {
        showSlide(index);
        schedule();
      }),
    );
    slider.addEventListener("mouseenter", () => {
      paused = true;
      stop();
    });
    slider.addEventListener("mouseleave", () => {
      paused = false;
      schedule();
    });
    slider.addEventListener("focusin", () => {
      paused = true;
      stop();
    });
    slider.addEventListener("focusout", () => {
      paused = false;
      schedule();
    });
    document.addEventListener("visibilitychange", schedule);
    reduceMotion.addEventListener?.("change", schedule);
    showSlide(current);
    schedule();
  });

  document.querySelectorAll("[data-featured-slider]").forEach((slider) => {
    const cards = [...slider.querySelectorAll(".product-card")];
    if (cards.length < 2) return;
    let timer;
    const next = () => {
      const card = cards[0];
      const gap = parseFloat(getComputedStyle(slider).gap) || 0;
      const step = card.getBoundingClientRect().width + gap;
      const atEnd =
        slider.scrollLeft + slider.clientWidth >= slider.scrollWidth - step / 2;
      slider.scrollTo({
        left: atEnd ? 0 : slider.scrollLeft + step,
        behavior: "smooth",
      });
    };
    const start = () => {
      if (window.innerWidth <= 680) return;
      window.clearInterval(timer);
      timer = window.setInterval(next, 4800);
    };
    slider.addEventListener("mouseenter", () => window.clearInterval(timer));
    slider.addEventListener("mouseleave", start);
    slider.addEventListener("touchstart", () => window.clearInterval(timer), {
      passive: true,
    });
    slider.addEventListener("touchend", start, { passive: true });
    start();
  });

  document.querySelectorAll("[data-copy]").forEach((button) => {
    button.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(button.dataset.copy);
        showToast("Payment detail copied.");
      } catch {
        showToast("Please select and copy this detail manually.");
      }
    });
  });

  document.querySelectorAll("[data-payment-slip]").forEach((form) => {
    const input = form.querySelector("[data-slip-file]");
    const name = form.querySelector("[data-slip-name]");
    input?.addEventListener("change", () => {
      const file = input.files?.[0];
      name.textContent = file ? file.name : "No file selected";
    });
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const data = new FormData(form);
      const file = input.files?.[0];
      if (!file) return;
      if (file.size > 10 * 1024 * 1024) {
        showToast("Please select a file smaller than 10 MB.");
        return;
      }
      const message = `PakMarket payment slip\nCustomer: ${data.get("customer")}\nAmount: Rs. ${data.get("amount")}\nMethod: ${data.get("method")}`;
      if(window.PakMarketDB?.configured){try{const session=await window.PakMarketDB.session();if(session){const path=`${session.user.id}/${crypto.randomUUID()}-${file.name.replace(/[^a-z0-9.]+/gi,"-")}`;await window.PakMarketDB.upload("payment-slips",file,path);await window.PakMarketDB.save("payment_confirmations",{customer_id:session.user.id,customer_name:data.get("customer"),amount:Number(data.get("amount")),method:data.get("method"),slip_path:path,status:"pending_verification"});showToast("Payment slip securely submitted for verification.");form.reset();name.textContent="No file selected";return}}catch(error){showToast(error.message||"Secure upload failed; opening WhatsApp instead.")}}
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({
            title: "PakMarket Payment Slip",
            text: message,
            files: [file],
          });
          showToast("Payment slip shared.");
          return;
        } catch (error) {
          if (error.name === "AbortError") return;
        }
      }
      window.open(
        whatsappUrl(
          `${message}\nI will attach the selected payment slip here.`,
        ),
        "_blank",
        "noopener,noreferrer",
      );
      showToast(
        "WhatsApp opened — please attach your payment slip before sending.",
      );
    });
  });
  document.addEventListener("click",event=>{const whatsapp=event.target.closest("[data-whatsapp]"),share=event.target.closest("[data-share-platform]");if(whatsapp)window.PakMarketDB?.track("whatsapp_order_click",{label:whatsapp.dataset.item||whatsapp.textContent.trim()},"page",location.pathname).catch(()=>{});if(share)window.PakMarketDB?.track("share_click",{platform:share.dataset.sharePlatform},"page",location.pathname).catch(()=>{})});
  if(isRoute("product")){
    const product=(()=>{try{return managedInventory.find(item=>item.slug===productSlug||item.id===productSlug)||null}catch{return null}})();
    if(product){const actions=document.querySelector(".detail-primary-actions");if(window.PakMarketDB?.configured&&actions&&!document.querySelector("[data-wishlist]")){const button=document.createElement("button");button.type="button";button.className="btn wishlist-button";button.dataset.wishlist=product.id;button.innerHTML='<span class="material-symbols-outlined">favorite</span><span>Save</span>';actions.append(button);button.addEventListener("click",async()=>{const session=await window.PakMarketDB.session();if(!session){location.href=`auth.html?next=product&product=${encodeURIComponent(product.slug || product.id)}`;return}const {error}=await window.PakMarketDB.client.from("wishlists").upsert({user_id:session.user.id,product_id:product.id});showToast(error?error.message:"Saved to your wishlist.")})}if(window.PakMarketDB?.configured){const reviewSection=document.createElement("section");reviewSection.className="container section product-reviews";reviewSection.innerHTML='<div><span class="eyebrow">Customer feedback</span><h2>Product Reviews</h2></div><div data-review-list><p>Loading reviews…</p></div><form data-review-form><div class="form-row"><label>Rating<select class="field" name="rating"><option value="5">5 — Excellent</option><option value="4">4 — Good</option><option value="3">3 — Average</option><option value="2">2 — Fair</option><option value="1">1 — Poor</option></select></label><label>Review title<input class="field" name="title" maxlength="80"></label></div><label>Your review<textarea class="field" name="body" rows="4" required maxlength="600"></textarea></label><button class="btn btn-primary">Submit review</button><small>Reviews appear after approval.</small></form>';document.querySelector(".product-detail")?.after(reviewSection);window.PakMarketDB.client.from("product_reviews").select("*").eq("product_id",product.id).eq("approved",true).then(({data})=>{reviewSection.querySelector("[data-review-list]").innerHTML=data?.length?data.map(review=>`<article class="review-item"><strong>${"★".repeat(review.rating)} ${contentEscape(review.title||"")}</strong><p>${contentEscape(review.body||"")}</p></article>`).join(""):"<p>No approved reviews yet.</p>"});reviewSection.querySelector("[data-review-form]").addEventListener("submit",async event=>{event.preventDefault();const session=await window.PakMarketDB.session();if(!session){location.href=`auth.html?next=product&product=${encodeURIComponent(product.slug || product.id)}`;return}const values=new FormData(event.currentTarget),{error}=await window.PakMarketDB.client.from("product_reviews").upsert({product_id:product.id,user_id:session.user.id,rating:Number(values.get("rating")),title:values.get("title"),body:values.get("body"),approved:false});showToast(error?error.message:"Review submitted for approval.");if(!error)event.currentTarget.reset()})}const schema={"@context":"https://schema.org","@type":"Product",name:product.name,image:[product.image],description:richTextToPlain(product.description),sku:product.sku,offers:{"@type":"Offer",priceCurrency:"PKR",price:product.price,availability:product.stock>0?"https://schema.org/InStock":"https://schema.org/OutOfStock",url:location.href}};const node=document.createElement("script");node.type="application/ld+json";node.textContent=JSON.stringify(schema);document.head.append(node)}
    if (product) {
      const orderForm = document.querySelector("[data-structured-order]");
      if (orderForm) {
        const optionsHost = orderForm.querySelector("[data-order-options]");
        const quantityInput = orderForm.elements.quantity;
        const submitButton = orderForm.querySelector("[data-submit-whatsapp-order]");
        const copyFallback = orderForm.querySelector("[data-copy-order]");
        const statusNode = orderForm.querySelector("[data-order-status]");
        const selected = {};
        let lastMessage = "";
        const options = productOptions(product);
        optionsHost.innerHTML = options.map((option) => `
          <fieldset class="order-option" data-option-name="${contentEscape(option.name)}">
            <legend>${contentEscape(option.name)}${option.required ? " *" : ""}</legend>
            <div>${option.values.map((value) => `<button type="button" aria-pressed="false" data-option-value="${contentEscape(value)}">${contentEscape(value)}</button>`).join("")}</div>
            <small data-option-error></small>
          </fieldset>`).join("");
        orderForm.querySelector("[data-stock-limit]").textContent = `${Math.max(0, Number(product.stock || 0))} available`;
        quantityInput.max = String(Math.max(1, Number(product.stock || 1)));
        submitButton.disabled = Number(product.stock || 0) < 1;

        const customer = () => ({
          name: orderForm.elements.name.value,
          mobile: orderForm.elements.mobile.value,
          city: orderForm.elements.city.value,
          address: orderForm.elements.address.value,
          note: orderForm.elements.note.value,
          payment: orderForm.elements.payment.value,
        });
        const currentQuote = () => calculateOrder({
          product,
          quantity: Number(quantityInput.value || 1),
          selections: selected,
          city: customer().city,
          settings: globalSettings,
          offer: productOffer(product),
        });
        const renderQuote = () => {
          const quote = currentQuote();
          quantityInput.value = String(quote.quantity);
          orderForm.querySelector("[data-order-subtotal]").textContent = money(quote.subtotal);
          const discountRow = orderForm.querySelector("[data-discount-row]");
          discountRow.hidden = !quote.discount;
          orderForm.querySelector("[data-order-discount]").textContent = `-${money(quote.discount)}`;
          orderForm.querySelector("[data-order-delivery]").textContent = quote.delivery.known ? money(quote.delivery.amount) : quote.delivery.label;
          orderForm.querySelector("[data-order-total]").textContent = quote.payable === null ? "Owner will confirm" : money(quote.payable);
        };
        const clearErrors = () => {
          orderForm.querySelectorAll("[data-error], [data-option-error]").forEach((node) => node.textContent = "");
          orderForm.querySelectorAll(".has-error").forEach((node) => node.classList.remove("has-error"));
          statusNode.textContent = "";
        };
        const showErrors = (errors) => {
          clearErrors();
          Object.entries(errors).forEach(([key, message]) => {
            if (key.startsWith("option:")) {
              const name = key.slice(7);
              const fieldset = [...orderForm.querySelectorAll("[data-option-name]")].find((node) => node.dataset.optionName === name);
              if (fieldset) { fieldset.classList.add("has-error"); fieldset.querySelector("[data-option-error]").textContent = message; }
            } else {
              const field = orderForm.elements[key];
              if (field) field.classList.add("has-error");
              const error = orderForm.querySelector(`[data-error="${key}"]`);
              if (error) error.textContent = message;
            }
          });
          statusNode.textContent = "Please complete the highlighted order details.";
          orderForm.querySelector(".has-error, [data-error]:not(:empty)")?.scrollIntoView({ behavior: "smooth", block: "center" });
          window.PakMarketDB?.track("form_validation_error", { fields: Object.keys(errors) }, "product", product.id).catch(() => {});
        };

        optionsHost.addEventListener("click", (event) => {
          const button = event.target.closest("[data-option-value]");
          if (!button) return;
          const fieldset = button.closest("[data-option-name]");
          fieldset.querySelectorAll("[data-option-value]").forEach((choice) => choice.setAttribute("aria-pressed", String(choice === button)));
          selected[fieldset.dataset.optionName] = button.dataset.optionValue;
          fieldset.classList.remove("has-error");
          fieldset.querySelector("[data-option-error]").textContent = "";
          window.PakMarketDB?.track("select_variant", { product_id: product.id, option: fieldset.dataset.optionName }, "product", product.id).catch(() => {});
          renderQuote();
        });
        orderForm.querySelector("[data-quantity-minus]").addEventListener("click", () => { quantityInput.value = String(Math.max(1, Number(quantityInput.value || 1) - 1)); renderQuote(); });
        orderForm.querySelector("[data-quantity-plus]").addEventListener("click", () => { quantityInput.value = String(Math.min(Number(product.stock || 1), Number(quantityInput.value || 1) + 1)); renderQuote(); });
        quantityInput.addEventListener("change", renderQuote);
        orderForm.elements.city.addEventListener("input", renderQuote);
        document.querySelector("[data-mobile-order]")?.addEventListener("click", () => orderForm.scrollIntoView({ behavior: "smooth", block: "start" }));
        orderForm.addEventListener("submit", (event) => {
          event.preventDefault();
          const values = customer();
          const errors = validateOrder({ product, quantity: Number(quantityInput.value), selections: selected, customer: values });
          if (Object.keys(errors).length) { showErrors(errors); return; }
          clearErrors();
          const number = configuredWhatsApp(globalSettings, SITE_CONFIG.whatsapp);
          if (!number) { statusNode.textContent = "Store WhatsApp number is not configured yet."; return; }
          const quote = currentQuote();
          const id = createOrderId();
          lastMessage = buildOrderMessage({ id, quote, customer: values, productUrl: absoluteUrl(productUrl(product.slug)) });
          window.PakMarketDB?.track("open_whatsapp_order", { product_id: product.id, quantity: quote.quantity, order_id: id, delivery_known: quote.delivery.known }, "product", product.id).catch(() => {});
          const opened = window.open(`https://wa.me/${number}?text=${encodeURIComponent(lastMessage)}`, "_blank", "noopener,noreferrer");
          if (!opened) {
            copyFallback.hidden = false;
            statusNode.textContent = "WhatsApp could not open. Copy the order details and send them manually.";
          } else {
            statusNode.textContent = `Order ${id} prepared. Complete it in WhatsApp.`;
          }
        });
        copyFallback.addEventListener("click", async () => {
          if (!lastMessage) return;
          try { await navigator.clipboard.writeText(lastMessage); showToast("Order details copied."); }
          catch { statusNode.textContent = "Select and copy the order details manually."; }
        });
        renderQuote();
      }
      const canonicalUrl = absoluteUrl(productUrl(product.slug));
      const schemaNodes = [
        ...document.querySelectorAll('script[type="application/ld+json"]'),
      ];
      const schemaNode =
        document.querySelector("[data-seo-schema]") || schemaNodes[0];
      schemaNodes
        .filter((node) => node !== schemaNode)
        .forEach((node) => node.remove());
      if (schemaNode) {
        schemaNode.dataset.seoSchema = "product";
        schemaNode.textContent = JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Product",
              name: product.name,
              image: [product.image],
              description: richTextToPlain(product.description),
              sku: product.sku,
              category: product.category,
              offers: {
                "@type": "Offer",
                priceCurrency: SITE_CONFIG.currency,
                price: Number(product.price),
                availability:
                  Number(product.stock) > 0
                    ? "https://schema.org/InStock"
                    : "https://schema.org/OutOfStock",
                itemCondition: "https://schema.org/NewCondition",
                url: canonicalUrl,
                seller: {
                  "@type": "Organization",
                  name: SITE_CONFIG.name,
                  url: SITE_CONFIG.url,
                },
              },
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: "Home",
                  item: `${SITE_CONFIG.url}/`,
                },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: "Products",
                  item: absoluteUrl("/products"),
                },
                { "@type": "ListItem", position: 3, name: product.name },
              ],
            },
          ],
        });
      }
      const details = offerDetails(product);
      document.querySelectorAll('.detail-primary-actions a[href*="wa.me"]').forEach(
        (link) => (link.href = whatsappUrl(orderMessage(product))),
      );
      const priceNode = document.querySelector(".detail-copy .price");
      if (priceNode && details.discount)
        priceNode.innerHTML = `Rs. ${Math.round(details.finalPrice).toLocaleString("en-PK")} <del>Rs. ${details.price.toLocaleString("en-PK")}</del>`;
      if (details.offer && !document.querySelector(".managed-offer-card")) {
        const offerCard = document.createElement("div");
        offerCard.className = "managed-offer-card";
        offerCard.innerHTML = `<strong>${contentEscape(details.offer.title)}</strong><span>${details.offer.code ? `Use code ${contentEscape(details.offer.code)} · ` : ""}${details.mode === "free" ? "Free delivery" : details.mode === "included" ? "Delivery included" : "Delivery charged separately"}</span>`;
        document.querySelector(".detail-primary-actions")?.before(offerCard);
      }
      if (isLocalPreview && !window.PakMarketDB?.configured && !document.querySelector(".product-reviews")) {
        const reviewSection = document.createElement("section");
        reviewSection.className = "container section product-reviews";
        const key = `pakmarket_local_reviews_${product.id}`;
        const reviews = JSON.parse(localStorage.getItem(key) || "[]");
        reviewSection.innerHTML = `<div><span class="eyebrow">Customer feedback</span><h2>Rate This Product</h2></div><div data-review-list>${reviews.length ? reviews.map((review) => `<article class="review-item"><strong>${"★".repeat(review.rating)} ${contentEscape(review.title || "")}</strong><p>${contentEscape(review.body)}</p><small>Pending owner verification</small></article>`).join("") : "<p>No customer ratings yet.</p>"}</div><form data-local-review-form><div class="form-row"><label>Rating<select class="field" name="rating"><option value="5">5 — Excellent</option><option value="4">4 — Good</option><option value="3">3 — Average</option><option value="2">2 — Fair</option><option value="1">1 — Poor</option></select></label><label>Review title<input class="field" name="title" maxlength="80"></label></div><label>Your review<textarea class="field" name="body" rows="4" required maxlength="600"></textarea></label><button class="btn btn-primary">Submit rating</button><small>Owner approval is required before public publishing.</small></form>`;
        document.querySelector(".product-detail")?.after(reviewSection);
        reviewSection.querySelector("[data-local-review-form]").addEventListener("submit", (event) => {
          event.preventDefault();
          const values = new FormData(event.currentTarget);
          reviews.push({ id: crypto.randomUUID(), rating: Number(values.get("rating")), title: values.get("title"), body: values.get("body"), approved: false });
          localStorage.setItem(key, JSON.stringify(reviews));
          const queue = JSON.parse(localStorage.getItem("pakmarket_reviews_v1") || "[]");
          queue.push({ ...reviews.at(-1), product_id: product.id, product_name: product.name });
          localStorage.setItem("pakmarket_reviews_v1", JSON.stringify(queue));
          showToast("Rating submitted for owner approval.");
          event.currentTarget.reset();
        });
      }
    }
  }
});
