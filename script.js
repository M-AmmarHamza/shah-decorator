import "./supabase-client.js";
import "./social-normalize.css";
import "./promotions.css";
import "./product-gallery.css";
import { DEFAULT_PRODUCTS } from "./catalog.js";

const WHATSAPP_NUMBER = "923161013991";

function whatsappUrl(message) {
  let number=WHATSAPP_NUMBER;try{number=JSON.parse(localStorage.getItem("pakmarket_global_settings_v1")||"{}").whatsapp||number}catch{}
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
  const page = document.body.dataset.page || "";
  const pathParts = window.location.pathname.split("/").filter(Boolean);
  const routeName =
    (pathParts[0]?.toLowerCase() === "products" && pathParts[1]
      ? "product"
      : pathParts.pop() || "index")
      .replace(/\.html$/i, "")
      .toLowerCase();
  const isRoute = (name) => routeName === name;
  const productSlug =
    pathParts[0]?.toLowerCase() === "products" && pathParts[1]
      ? decodeURIComponent(pathParts[1])
      : new URLSearchParams(window.location.search).get("product");
  const productUrl = (slug) => `/products/${encodeURIComponent(slug)}`;
  const managedInventory = (() => {
    try {
      const stored = JSON.parse(
        localStorage.getItem("pakmarket_inventory_v1") || "[]",
      );
      if (!Array.isArray(stored)) return DEFAULT_PRODUCTS;
      const storedIds = new Set(stored.map((item) => item.id));
      return [
        ...stored,
        ...DEFAULT_PRODUCTS.filter((item) => !storedIds.has(item.id)),
      ];
    } catch {
      return DEFAULT_PRODUCTS;
    }
  })();
  const globalSettings=(()=>{try{return JSON.parse(localStorage.getItem("pakmarket_global_settings_v1")||"{}")}catch{return{}}})();
  document.querySelectorAll(".footer-links").forEach(group=>{if(!group.querySelector('a[href="privacy-policy.html"]')&&/return|payment|contact/i.test(group.textContent+group.parentElement?.textContent))group.insertAdjacentHTML("beforeend",'<a href="privacy-policy.html">Privacy Policy</a><a href="terms.html">Terms & Conditions</a><a href="shipping-policy.html">Shipping Policy</a>')});
  const socialMap={facebook:globalSettings.facebook,instagram:globalSettings.instagram};Object.entries(socialMap).forEach(([name,url])=>{if(url)document.querySelectorAll(`.socials a[aria-label="${name[0].toUpperCase()+name.slice(1)}"]`).forEach(link=>link.href=url)});
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
          (image) => `<a class="product-gallery-item" href="${image.productSlug ? productUrl(image.productSlug) : "/products"}" data-image-slug="${contentEscape(image.slug || "")}"><img src="${contentEscape(image.url)}" alt="${contentEscape(image.alt || image.productName)}" loading="lazy"><span>${contentEscape(image.productName)}</span></a>`,
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
    if (storedBlogs !== null && (isBlogList || isBlogDetail)) {
      const allBlogs = JSON.parse(storedBlogs) || [],
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
            lead.href = `blog-detail.html?blog=${encodeURIComponent(featured.slug)}`;
            lead.innerHTML = `<div class="blog-lead-image"><img src="${contentEscape(featured.image)}" alt="${contentEscape(featured.coverAlt || featured.title)}" data-image-slug="${contentEscape(featured.coverSlug || "")}"></div><div class="blog-lead-copy"><span>Featured story</span><h2>${contentEscape(featured.title)}</h2><p>${contentEscape(featured.excerpt)}</p><small>By ${contentEscape(featured.author)} · ${Number(featured.readTime) || 5} min read</small></div>`;
          }
          if (top)
            top.innerHTML = others
              .slice(0, 3)
              .map(
                (item) =>
                  `<a href="blog-detail.html?blog=${encodeURIComponent(item.slug)}"><img src="${contentEscape(item.image)}" alt="${contentEscape(item.coverAlt || item.title)}" data-image-slug="${contentEscape(item.coverSlug || "")}"><h3>${contentEscape(item.title)}</h3><small>${contentEscape(item.category)} · ${Number(item.readTime) || 5} min read</small></a>`,
              )
              .join("");
          if (grid)
            grid.innerHTML = published
              .map(
                (item) =>
                  `<article class="blog-card"><a href="blog-detail.html?blog=${encodeURIComponent(item.slug)}"><div class="blog-media"><img src="${contentEscape(item.image)}" alt="${contentEscape(item.coverAlt || item.title)}" data-image-slug="${contentEscape(item.coverSlug || "")}"><span class="badge-light">${contentEscape(item.category)}</span></div><div class="blog-body"><h3>${contentEscape(item.title)}</h3><p>${contentEscape(item.excerpt)}</p><span class="blog-meta">${Number(item.readTime) || 5} min read</span><span class="inline-link">Read More <span class="material-symbols-outlined">arrow_forward</span></span></div></a></article>`,
              )
              .join("");
        }
      }
      if (isBlogDetail) {
        const slug = new URLSearchParams(location.search).get("blog"),
          item = allBlogs.find(
            (blog) => blog.slug === slug && (blog.enabled || canPreview),
          );
        if (item) {
          document.title = item.seoTitle || item.title;
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
              ? "index, follow"
              : "noindex, nofollow",
          );
          const heading = document.querySelector(".article-heading");
          heading.querySelector("h1").textContent = item.title;
          heading.querySelector(".article-intro").textContent = item.excerpt;
          heading.querySelector(".eyebrow").textContent = item.category;
          const strong = heading.querySelector(".article-meta strong");
          if (strong) strong.textContent = item.author;
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
        }
      }
    }
  } catch {}

  try {
    const filename = (
      window.location.pathname.split("/").pop() || "index.html"
    ).toLowerCase();
    const pageKey = {
      "index.html": "home",
      "products.html": "products",
      "product.html": "product",
      "blog.html": "blog",
      "blog-detail.html": "blog-detail",
      "about.html": "about",
      "contact.html": "contact",
      "payment.html": "payment",
      "return-policy.html": "return-policy",
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
      canonical.href = pageSettings.canonical;
      const selectors = {
        home: [".hero-content h1", ".hero-content > p"],
        products: [".page-hero h1", ".page-hero p"],
        product: [".detail-copy h1", ".detail-description"],
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
          managedProduct.metaDescription || managedProduct.description || "";
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
        canonical.href = new URL(productUrl(managedProduct.slug), location.origin).href;
        const breadcrumb = document.querySelector(".breadcrumb");
        const breadcrumbLinks = breadcrumb?.querySelectorAll("a");
        const breadcrumbCurrent = breadcrumb?.querySelector(":scope > span:last-child");
        if (breadcrumbLinks?.[1]) {
          breadcrumbLinks[1].textContent = "Products";
          breadcrumbLinks[1].href = "products.html";
        }
        if (breadcrumbCurrent) breadcrumbCurrent.textContent = managedProduct.name;

        const productHeading = document.querySelector(".detail-copy h1");
        const productDescription = document.querySelector(".detail-description");
        const productPrice = document.querySelector(".detail-price .price");
        const comparePrice = document.querySelector(".detail-price .old-price");
        const discountBadge = document.querySelector(".detail-price .badge-light");
        if (productHeading) productHeading.textContent = managedProduct.name;
        if (productDescription)
          productDescription.textContent = managedProduct.description || "Product details will be added soon.";
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
          const stockCopy = stockCard.querySelector("div span");
          if (stockIcon) stockIcon.textContent = stock > 0 ? "check_circle" : "cancel";
          if (stockTitle) stockTitle.textContent = stock > 0 ? "Available in Stock" : "Out of Stock";
          if (stockCopy)
            stockCopy.textContent = stock > 0
              ? `${stock} item${stock === 1 ? "" : "s"} currently available`
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
        if (detailsPanel)
          detailsPanel.innerHTML = `<p>${contentEscape(managedProduct.description || "Product details will be added soon.")}</p>`;
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
          favorite.dataset.wishlist = managedProduct.id;
          favorite.addEventListener("click", async () => {
            if (!window.PakMarketDB?.configured) {
              showToast("Wishlist will be available after the live account system is connected.");
              return;
            }
            const session = await window.PakMarketDB.session();
            if (!session) {
              location.href = "auth.html?next=product";
              return;
            }
            const { error } = await window.PakMarketDB.client
              .from("wishlists")
              .upsert({ user_id: session.user.id, product_id: managedProduct.id });
            showToast(error ? error.message : "Saved to your wishlist.");
          });
        }
      }
    } catch {}
  }

  const storefrontGrid = document.querySelector("[data-storefront-grid]");
  if (storefrontGrid) {
    try {
      const managed = JSON.parse(
        localStorage.getItem("pakmarket_inventory_v1"),
      );
      if (Array.isArray(managed)) {
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
        const visible = managed.filter(
          (product) => product.enabled ?? product.status === "active",
        );
        storefrontGrid.innerHTML = visible
          .map((product) => {
            const out = Number(product.stock) <= 0;
            const category = `${String(product.category || "product")
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, " ")
              .trim()}${product.featured ? " best" : ""}`;
            const promotion = offerDetails(product);
            return `<article class="product-card" data-product-card data-category="all ${safe(category)}">
            <a class="image-link" href="${productUrl(product.slug || product.id)}"><img src="${safe(product.image)}" alt="${safe(product.imageAlt || product.name)}"></a>
            <span class="badge-light product-badge">${out ? "Out of Stock" : promotion.offer ? safe(promotion.offer.title) : `${Number(product.stock)} in stock`}</span>
            <div class="product-body"><h3>${safe(product.name)}</h3><div class="price-row"><span class="price">Rs. ${Math.round(promotion.finalPrice).toLocaleString("en-PK")}</span>${promotion.discount ? `<span class="old-price">Rs. ${Number(product.price).toLocaleString("en-PK")}</span>` : Number(product.comparePrice) > Number(product.price) ? `<span class="old-price">Rs. ${Number(product.comparePrice).toLocaleString("en-PK")}</span>` : ""}</div>${promotion.offer ? `<small class="offer-note">${safe(promotion.offer.code ? `Use ${promotion.offer.code}` : "Offer automatically applied")} · ${promotion.mode === "free" ? "Free delivery" : promotion.mode === "included" ? "Delivery included" : "Delivery separate"}</small>` : ""}${out ? '<span class="btn btn-soft card-button">Currently unavailable</span>' : `<a class="btn btn-whatsapp card-button" href="${whatsappUrl(orderMessage(product))}" target="_blank" rel="noreferrer"><span class="material-symbols-outlined">chat</span>Order on WhatsApp</a>`}</div>
          </article>`;
          })
          .join("");
      }
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
      ? "admin.html"
      : "auth.html";
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
    link.setAttribute(
      "href",
      whatsappUrl(
        `Assalam o Alaikum, I want to order ${item}. Please share details.`,
      ),
    );
    link.setAttribute("target", "_blank");
    link.setAttribute("rel", "noreferrer");
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

  const updateProductVisibility = () => {
    const matches = products.filter((card) => {
      const categories = (card.dataset.category || "").split(" ");
      return (
        (activeFilter === "all" || categories.includes(activeFilter)) &&
        card.textContent.toLowerCase().includes(searchTerm)
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
      form.reset();
      showToast("Thanks. You are on the PakMarket updates list.");
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
      timer = window.setInterval(next, 3200);
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
        "WhatsApp opened—please attach your selected slip before sending.",
      );
    });
  });
  document.addEventListener("click",event=>{const whatsapp=event.target.closest("[data-whatsapp]"),share=event.target.closest("[data-share-platform]");if(whatsapp)window.PakMarketDB?.track("whatsapp_order_click",{label:whatsapp.dataset.item||whatsapp.textContent.trim()},"page",location.pathname).catch(()=>{});if(share)window.PakMarketDB?.track("share_click",{platform:share.dataset.sharePlatform},"page",location.pathname).catch(()=>{})});
  if(isRoute("product")){
    const product=(()=>{try{return managedInventory.find(item=>item.slug===productSlug||item.id===productSlug)||null}catch{return null}})();
    if(product){const actions=document.querySelector(".detail-primary-actions");if(actions&&!actions.querySelector("[data-wishlist]")){const button=document.createElement("button");button.type="button";button.className="btn wishlist-button";button.dataset.wishlist=product.id;button.innerHTML='<span class="material-symbols-outlined">favorite</span><span>Save</span>';actions.append(button);button.addEventListener("click",async()=>{if(!window.PakMarketDB?.configured){showToast("Wishlist will be available after the live account system is connected.");return}const session=await window.PakMarketDB.session();if(!session){location.href="auth.html?next=product";return}const {error}=await window.PakMarketDB.client.from("wishlists").upsert({user_id:session.user.id,product_id:product.id});showToast(error?error.message:"Saved to your wishlist.")})}if(window.PakMarketDB?.configured){const reviewSection=document.createElement("section");reviewSection.className="container section product-reviews";reviewSection.innerHTML='<div><span class="eyebrow">Customer feedback</span><h2>Product Reviews</h2></div><div data-review-list><p>Loading reviews…</p></div><form data-review-form><div class="form-row"><label>Rating<select class="field" name="rating"><option value="5">5 — Excellent</option><option value="4">4 — Good</option><option value="3">3 — Average</option><option value="2">2 — Fair</option><option value="1">1 — Poor</option></select></label><label>Review title<input class="field" name="title" maxlength="80"></label></div><label>Your review<textarea class="field" name="body" rows="4" required maxlength="600"></textarea></label><button class="btn btn-primary">Submit review</button><small>Reviews appear after approval.</small></form>';document.querySelector(".product-detail")?.after(reviewSection);window.PakMarketDB.client.from("product_reviews").select("*").eq("product_id",product.id).eq("approved",true).then(({data})=>{reviewSection.querySelector("[data-review-list]").innerHTML=data?.length?data.map(review=>`<article class="review-item"><strong>${"★".repeat(review.rating)} ${contentEscape(review.title||"")}</strong><p>${contentEscape(review.body||"")}</p></article>`).join(""):"<p>No approved reviews yet.</p>"});reviewSection.querySelector("[data-review-form]").addEventListener("submit",async event=>{event.preventDefault();const session=await window.PakMarketDB.session();if(!session){location.href="auth.html?next=product";return}const values=new FormData(event.currentTarget),{error}=await window.PakMarketDB.client.from("product_reviews").upsert({product_id:product.id,user_id:session.user.id,rating:Number(values.get("rating")),title:values.get("title"),body:values.get("body"),approved:false});showToast(error?error.message:"Review submitted for approval.");if(!error)event.currentTarget.reset()})}const schema={"@context":"https://schema.org","@type":"Product",name:product.name,image:[product.image],description:product.description,sku:product.sku,offers:{"@type":"Offer",priceCurrency:"PKR",price:product.price,availability:product.stock>0?"https://schema.org/InStock":"https://schema.org/OutOfStock",url:location.href}};const node=document.createElement("script");node.type="application/ld+json";node.textContent=JSON.stringify(schema);document.head.append(node)}
    if (product) {
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
      if (!window.PakMarketDB?.configured && !document.querySelector(".product-reviews")) {
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
