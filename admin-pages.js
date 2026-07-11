const PAGES_KEY = "pakmarket_pages_v1";
const pageSeeds = [
  {
    key: "home",
    label: "Home",
    file: "index.html",
    icon: "home",
    heading: "Shop Your Favorites & Order via WhatsApp",
    headingLevel: "h1",
    paragraph:
      "Quality products from Pakistan's finest home-based brands delivered to your doorstep. Cash on Delivery available Pakistan-wide.",
    featuredHeading: "Featured Products",
    featuredHeadingLevel: "h2",
    arrivalsHeading: "New Arrivals",
    arrivalsHeadingLevel: "h2",
    comingHeading: "Coming Soon to PakMarket",
    comingHeadingLevel: "h2",
    whyHeading: "Why Choose PakMarket?",
    whyHeadingLevel: "h2",
    stepsHeading: "Simple 3-Step Ordering",
    stepsHeadingLevel: "h2",
    testimonialsHeading: "Customer Love",
    testimonialsHeadingLevel: "h2",
    faqHeading: "FAQs",
    faqHeadingLevel: "h2",
    metaTitle: "PakMarket | Premium Local Shopping",
    metaDescription:
      "Shop premium Pakistani home-based brands and order directly on WhatsApp.",
    canonical: "https://pakmarket.pk/",
    keywords: "Pakistani products, local brands, WhatsApp shopping",
    enabled: true,
    seoIndex: true,
  },
  {
    key: "products",
    label: "Products",
    file: "products.html",
    icon: "inventory_2",
    heading: "Explore Our Collection",
    paragraph:
      "Discover the finest selection of local craftsmanship, sustainable fashion and premium Pakistani products.",
    metaTitle: "Products | PakMarket",
    metaDescription:
      "Browse premium products from trusted Pakistani local brands.",
    canonical: "https://pakmarket.pk/products",
    keywords: "Pakistani products, local marketplace",
    enabled: true,
    seoIndex: true,
  },
  {
    key: "product",
    label: "Product Detail",
    file: "product.html",
    icon: "shopping_bag",
    heading: "Handcrafted Leather Tote",
    paragraph:
      "A signature handcrafted product made by skilled Pakistani artisans.",
    metaTitle: "Product Details | PakMarket",
    metaDescription:
      "View product details and order directly through PakMarket WhatsApp support.",
    canonical: "https://pakmarket.pk/product",
    keywords: "Pakistani handmade product",
    enabled: true,
    seoIndex: true,
  },
  {
    key: "blog",
    label: "Blog",
    file: "blog.html",
    icon: "article",
    heading: "Our Blog",
    paragraph:
      "Tips and stories from local brands, artisans and modern Pakistani lifestyles.",
    metaTitle: "Blog | PakMarket",
    metaDescription:
      "Read PakMarket stories about Pakistani craftsmanship, local brands and shopping.",
    canonical: "https://pakmarket.pk/blog",
    keywords: "Pakistani brands blog, craftsmanship",
    enabled: true,
    seoIndex: true,
  },
  {
    key: "blog-detail",
    label: "Blog Detail",
    file: "blog-detail.html",
    icon: "menu_book",
    heading: "The Art of Hand Embroidery in Modern Apparel",
    paragraph:
      "How local artisans preserve traditional techniques while creating contemporary pieces.",
    metaTitle: "Hand Embroidery in Modern Apparel | PakMarket",
    metaDescription:
      "Discover how Pakistani artisans preserve hand-embroidery traditions in modern apparel.",
    canonical: "https://pakmarket.pk/blog/hand-embroidery-modern-apparel",
    keywords: "Pakistani embroidery, local artisans",
    enabled: true,
    seoIndex: true,
  },
  {
    key: "about",
    label: "About",
    file: "about.html",
    icon: "storefront",
    heading: "Pakistan's local talent deserves a bigger stage.",
    paragraph:
      "PakMarket brings trusted home-based brands, skilled artisans and shoppers together.",
    metaTitle: "About Us | PakMarket",
    metaDescription:
      "Learn how PakMarket connects Pakistani makers and local brands with shoppers nationwide.",
    canonical: "https://pakmarket.pk/about",
    keywords: "about PakMarket, Pakistani local brands",
    enabled: true,
    seoIndex: true,
  },
  {
    key: "contact",
    label: "Contact",
    file: "contact.html",
    icon: "support_agent",
    heading: "Let's start a conversation",
    paragraph:
      "Need order support, want to list your brand, or have a question? Reach our team.",
    metaTitle: "Contact Us | PakMarket",
    metaDescription:
      "Contact PakMarket for order support, seller partnerships and general questions.",
    canonical: "https://pakmarket.pk/contact",
    keywords: "contact PakMarket, order support",
    enabled: true,
    seoIndex: true,
  },
  {
    key: "payment",
    label: "Payment",
    file: "payment.html",
    icon: "payments",
    heading: "Pay Your Way",
    paragraph: "Use Easypaisa, JazzCash, bank transfer or Cash on Delivery.",
    metaTitle: "Payment Details | PakMarket",
    metaDescription:
      "View PakMarket Easypaisa, JazzCash, bank transfer and Cash on Delivery details.",
    canonical: "https://pakmarket.pk/payment",
    keywords: "PakMarket payment, Easypaisa, JazzCash",
    enabled: true,
    seoIndex: false,
  },
  {
    key: "return-policy",
    label: "Return Policy",
    file: "return-policy.html",
    icon: "assignment_return",
    heading: "7-Day Return Policy",
    paragraph:
      "Contact us within seven days of delivery if something is not right with your order.",
    metaTitle: "7-Day Return Policy | PakMarket",
    metaDescription:
      "Read PakMarket's simple seven-day return and refund policy.",
    canonical: "https://pakmarket.pk/return-policy",
    keywords: "PakMarket returns, refund policy",
    enabled: true,
    seoIndex: true,
  },
];
const pageDialog = document.querySelector("[data-page-dialog]"),
  pageForm = document.querySelector("[data-page-form]"),
  seoConfirmDialog = document.querySelector("[data-seo-confirm-dialog]"),
  seoConfirmForm = document.querySelector("[data-seo-confirm-form]");
let pendingSeoChange = null;
const headingLevelOptions =
  '<option value="h1">H1 — Primary</option><option value="h2">H2 — Section</option><option value="h3">H3 — Subsection</option>';
const mainHeadingInput = pageForm.elements.heading,
  mainHeadingLabel = mainHeadingInput.closest("label"),
  mainHeadingLevel = document.createElement("select");
mainHeadingLevel.name = "headingLevel";
mainHeadingLevel.className = "heading-level-select";
mainHeadingLevel.setAttribute("aria-label", "Main heading level");
mainHeadingLevel.innerHTML = headingLevelOptions;
mainHeadingLabel.append(mainHeadingLevel);
const homeSectionFields = document.createElement("fieldset");
homeSectionFields.className = "home-section-fields";
homeSectionFields.dataset.homeSectionFields = "";
homeSectionFields.hidden = true;
homeSectionFields.innerHTML =
  '<legend>Home section headings</legend><p>Edit each heading and choose its semantic HTML level.</p><div class="home-heading-grid"><label>Featured products<div><input type="text" name="featuredHeading" maxlength="70"><select name="featuredHeadingLevel">' +
  headingLevelOptions +
  '</select></div></label><label>New arrivals<div><input type="text" name="arrivalsHeading" maxlength="70"><select name="arrivalsHeadingLevel">' +
  headingLevelOptions +
  '</select></div></label><label>Coming soon<div><input type="text" name="comingHeading" maxlength="70"><select name="comingHeadingLevel">' +
  headingLevelOptions +
  '</select></div></label><label>Why choose us<div><input type="text" name="whyHeading" maxlength="70"><select name="whyHeadingLevel">' +
  headingLevelOptions +
  '</select></div></label><label>Ordering steps<div><input type="text" name="stepsHeading" maxlength="70"><select name="stepsHeadingLevel">' +
  headingLevelOptions +
  '</select></div></label><label>Testimonials<div><input type="text" name="testimonialsHeading" maxlength="70"><select name="testimonialsHeadingLevel">' +
  headingLevelOptions +
  '</select></div></label><label>FAQs<div><input type="text" name="faqHeading" maxlength="70"><select name="faqHeadingLevel">' +
  headingLevelOptions +
  "</select></div></label></div>";
pageForm.querySelector(".page-form-row").before(homeSectionFields);
function loadPages() {
  try {
    const saved = JSON.parse(localStorage.getItem(PAGES_KEY));
    if (Array.isArray(saved))
      return pageSeeds.map((seed) => ({
        headingLevel: "h1",
        ...seed,
        ...saved.find((p) => p.key === seed.key),
      }));
  } catch {}
  return structuredClone(pageSeeds).map((page) => ({
    headingLevel: "h1",
    ...page,
  }));
}
let managedPages = loadPages();
function savePages() {
  localStorage.setItem(PAGES_KEY, JSON.stringify(managedPages));
  if (window.PakMarketDB?.configured)
    Promise.all(managedPages.map(page => window.PakMarketDB.save("pages", {page_key:page.key,title:page.label,enabled:page.enabled,seo_index:page.seoIndex,content:{heading:page.heading,paragraph:page.paragraph,headingLevel:page.headingLevel,featuredHeading:page.featuredHeading,featuredHeadingLevel:page.featuredHeadingLevel,arrivalsHeading:page.arrivalsHeading,arrivalsHeadingLevel:page.arrivalsHeadingLevel,comingHeading:page.comingHeading,comingHeadingLevel:page.comingHeadingLevel,whyHeading:page.whyHeading,whyHeadingLevel:page.whyHeadingLevel,stepsHeading:page.stepsHeading,stepsHeadingLevel:page.stepsHeadingLevel,testimonialsHeading:page.testimonialsHeading,testimonialsHeadingLevel:page.testimonialsHeadingLevel,faqHeading:page.faqHeading,faqHeadingLevel:page.faqHeadingLevel},meta_title:page.metaTitle,meta_description:page.metaDescription,keywords:String(page.keywords||"").split(",").map(item=>item.trim()).filter(Boolean),canonical_url:page.canonical}))).catch(error=>toast(`Page database sync failed: ${error.message}`));
  renderPages();
  if (typeof toast === "function") toast("Page settings saved.");
}
function renderPages() {
  document.querySelector("[data-pages-grid]").innerHTML = managedPages
    .map(
      (page) =>
        `<article class="page-card"><div class="page-card-head"><span class="page-icon"><span class="material-symbols-outlined">${page.icon}</span></span><span class="page-state ${page.enabled ? "" : "disabled"}">${page.enabled ? "Enabled" : "Disabled"}</span></div><div><h3>${page.label}</h3><p>${page.heading}</p></div><div class="page-card-meta"><span>${page.seoIndex ? "Index" : "Noindex"}</span><span>${page.metaTitle.length}/60 title</span><span>${page.metaDescription.length}/160 meta</span></div><div class="page-card-actions"><button type="button" data-edit-page="${page.key}"><span class="material-symbols-outlined">edit</span>Edit</button><a href="${page.file}?preview=1" target="_blank"><span class="material-symbols-outlined">visibility</span></a></div></article>`,
    )
    .join("");
}
function updatePagePreview() {
  const data = Object.fromEntries(new FormData(pageForm).entries());
  document.querySelector("[data-page-heading-count]").textContent =
    `${(data.heading || "").length}/100`;
  document.querySelector("[data-page-paragraph-count]").textContent =
    `${(data.paragraph || "").length}/400`;
  document.querySelector("[data-page-title-count]").textContent =
    `${(data.metaTitle || "").length}/60`;
  document.querySelector("[data-page-meta-count]").textContent =
    `${(data.metaDescription || "").length}/160`;
  document.querySelector("[data-page-preview-title]").textContent =
    data.metaTitle || "Page title";
  document.querySelector("[data-page-preview-url]").textContent =
    data.canonical || "https://pakmarket.pk/page";
  document.querySelector("[data-page-preview-description]").textContent =
    data.metaDescription || "Meta description preview";
}
function openPageEditor(key) {
  const page = managedPages.find((p) => p.key === key);
  if (!page) return;
  pageForm.reset();
  for (const element of pageForm.elements) {
    if (!element.name || !(element.name in page)) continue;
    if (element.type === "checkbox")
      element.checked = Boolean(page[element.name]);
    else element.value = page[element.name] ?? "";
  }
  document.querySelector("[data-home-section-fields]").hidden = key !== "home";
  document.querySelector("[data-page-dialog-title]").textContent =
    `Edit ${page.label}`;
  document.querySelector("[data-view-page]").href = `${page.file}?preview=1`;
  updatePagePreview();
  pageDialog.showModal();
}
function requestSeoChange(desired) {
  const page = managedPages.find((p) => p.key === pageForm.elements.key.value);
  if (!page) return;
  pendingSeoChange = { desired, page };
  const action = desired ? "INDEX" : "NOINDEX",
    phrase = `${action} ${page.label}`;
  document.querySelector("[data-seo-confirm-title]").textContent = desired
    ? `Index ${page.label}?`
    : `Set ${page.label} to noindex?`;
  document.querySelector("[data-seo-confirm-message]").textContent = desired
    ? "This page may become eligible to appear in Google and other search results after search engines crawl it."
    : "This page will ask search engines not to show it in search results.";
  document.querySelector("[data-seo-confirm-impact]").textContent = desired
    ? "Only enable indexing when the page content, title, description and canonical URL are ready."
    : "Removing a page from search results can take time and may reduce organic traffic.";
  document.querySelector("[data-seo-confirm-phrase]").textContent = phrase;
  const input = document.querySelector("[data-seo-confirm-input]");
  input.value = "";
  input.dataset.phrase = phrase;
  document.querySelector("[data-approve-seo-confirm]").disabled = true;
  seoConfirmDialog.showModal();
  setTimeout(() => input.focus(), 0);
}
pageForm.elements.seoIndex.addEventListener("change", (event) => {
  const desired = event.target.checked;
  event.target.checked = !desired;
  requestSeoChange(desired);
});
document
  .querySelector("[data-seo-confirm-input]")
  .addEventListener("input", (event) => {
    document.querySelector("[data-approve-seo-confirm]").disabled =
      event.target.value.trim() !== event.target.dataset.phrase;
  });
seoConfirmForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const input = document.querySelector("[data-seo-confirm-input]");
  if (!pendingSeoChange || input.value.trim() !== input.dataset.phrase) return;
  pageForm.elements.seoIndex.checked = pendingSeoChange.desired;
  pendingSeoChange = null;
  seoConfirmDialog.close();
  if (typeof toast === "function")
    toast("SEO indexing choice confirmed. Save the page to apply it.");
});
document.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  if (button.dataset.editPage) openPageEditor(button.dataset.editPage);
  if (button.hasAttribute("data-close-page")) pageDialog.close();
  if (button.hasAttribute("data-cancel-seo-confirm")) {
    pendingSeoChange = null;
    seoConfirmDialog.close();
  }
});
pageForm.addEventListener("input", updatePagePreview);
pageForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!pageForm.reportValidity()) return;
  const data = Object.fromEntries(new FormData(pageForm).entries()),
    key = data.key;
  data.enabled = pageForm.elements.enabled.checked;
  data.seoIndex = pageForm.elements.seoIndex.checked;
  managedPages = managedPages.map((page) =>
    page.key === key ? { ...page, ...data } : page,
  );
  savePages();
  pageDialog.close();
});
renderPages();
