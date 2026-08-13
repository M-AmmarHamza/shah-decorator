const STORAGE_KEY = "pakmarket_inventory_v1";
const AUTH_USERS_KEY = "pakmarket_users_v1",
  AUTH_SESSION_KEY = "pakmarket_session_v1";
const adminSession =
  window.PAKMARKET_SESSION ||
  JSON.parse(localStorage.getItem(AUTH_SESSION_KEY) || "null");
const seedProducts = [
  {
    id: "p1",
    name: "Hand-Painted Blue Pottery",
    sku: "PM-DEC-001",
    category: "Traditional Crafts",
    price: 3200,
    comparePrice: 0,
    stock: 14,
    status: "active",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCVUqhdvP9hb7V5HfcU_Lg8z0B1QmYNk3a_ihBXM3vi8GOdNUmuN3mGrIImboj7C3hvds6vagJWQcesDxXEZdP0ZFudeyYVxvT7txC4_nkakXu_FChQy9snR44svK19TmEJMcJ0Pqa_z0XHoZzjHyh7c62jddeR3jrD2-w1WLJAgzTVFNl3pKajTZvx6ppPH43btNkqUW-lorSu_Ml9oX9LQLMFg7f44_Gm1TA_zx0yYjYvzOSayKFSu7zLKFZ9FKcXrdss-WLrPRo",
    description:
      "Hand-painted blue pottery created by skilled Pakistani artisans.",
    slug: "hand-painted-blue-pottery",
    seoTitle: "Hand-Painted Blue Pottery | PakMarket",
    metaDescription:
      "Shop authentic hand-painted blue pottery crafted by Pakistani artisans. Order securely through PakMarket with nationwide delivery.",
    keywords: "blue pottery, Pakistani craft, handmade decor",
    imageAlt: "Hand-painted blue Pakistani pottery vase",
  },
  {
    id: "p2",
    name: "Premium Almond Biscotti",
    sku: "PM-FOD-002",
    category: "Food",
    price: 1250,
    comparePrice: 0,
    stock: 5,
    status: "active",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDPriF7OxgDh9P1lww92VI5_52o9lt5okLM2-VzwOcXq126uJyEm2wshXS2CFYbNDjyxmD6j9xwM9LikrIuCpJBuFJrG4R0BBEAXJgzC-hyW68ICbA-6kNl51jtuPnhLwohPlXD9Cqrfr0l_eh_8vD94eDS2B077mQzSOeA7c6SIP91JFNGA9dGNMxRAJlhPhb9EtdcQEqbEwMA-itTsd_ZfJMibs1oDCxPOYXo6KaUZRNhNBYFxnxeKTCjlaJ75DcncKetN0f4qrA",
    description:
      "Crisp, small-batch almond biscotti baked by a local home bakery.",
    slug: "premium-almond-biscotti",
    seoTitle: "Premium Almond Biscotti in Pakistan | PakMarket",
    metaDescription:
      "Order premium almond biscotti from a trusted Pakistani home bakery. Fresh, crisp and perfect for gifting or tea time.",
    keywords: "almond biscotti, cookies Pakistan, local bakery",
    imageAlt: "Premium almond biscotti cookies in a glass jar",
  },
  {
    id: "p3",
    name: "Hand-Embroidered Kurta",
    sku: "PM-FAS-003",
    category: "Fashion",
    price: 4800,
    comparePrice: 5500,
    stock: 9,
    status: "active",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBUlWgQk76WXv_5_8XFGGKzpmz5gv4ajaYvRF_HIEmbacOYQJ6Hy_AE3nZZEJAz49JUtc4Cl1M8AcedCkTfuAWmKqc0qz4VKEpxTVWAWhgNr9UqGORmFDJpwfFEgig1Z7jT4LzGouCkn7ihiOSCGGk7DS8GfwJxLPAvt0-PwuP0rrH5JtYfN7Ed35sdjRieuSoFYwGmjIAebqZh3AZQ38pk45r_qux4vYPPOE8cT-7J8fgpHVanfS26_rW6J04xJwDuFNkCNbxS6U8",
    description:
      "A contemporary kurta finished with traditional hand embroidery.",
    slug: "hand-embroidered-kurta",
    seoTitle: "Hand-Embroidered Pakistani Kurta | PakMarket",
    metaDescription:
      "Discover a modern Pakistani kurta with beautiful hand embroidery. Shop local fashion and order directly on WhatsApp.",
    keywords: "embroidered kurta, Pakistani fashion, handmade clothing",
    imageAlt: "Hand-embroidered Pakistani kurta on a hanger",
  },
  {
    id: "p4",
    name: "Organic Soy Wax Candle",
    sku: "PM-HOM-004",
    category: "Home Decor",
    price: 1850,
    comparePrice: 0,
    stock: 3,
    status: "active",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDnt484UTtaCPybNOiC9RcQz7hcdBIdo9kAfmH6JGIenwNVO4O08ScYu7NHnusSsI-N_OirWfxOt4Z8ZRCk23einHK7n1A-TwF8oy3qVNGWQgwt1TmJDNfK3oZazwkTj8O2NLRIt019TEE_3pw2c3H7G2Q0PwYKolOs2OKN2qwC9eAZky6eGgj1d9W0yCdCk-xLsDjJl8DM0d9Z--l0TdYigSdO0t8cNPrDlQCi8z4418mvpC1kmrO3pn2VS5_C8Rty39E-EnBjX_8",
    description:
      "A clean-burning soy candle with a calming botanical fragrance.",
    slug: "organic-soy-wax-candle",
    seoTitle: "Organic Soy Wax Candle Pakistan | PakMarket",
    metaDescription:
      "Shop a clean-burning organic soy wax candle made by a local Pakistani brand. A thoughtful choice for home and gifting.",
    keywords: "soy candle, organic candle, home fragrance",
    imageAlt: "Organic soy wax candle on a styled shelf",
  },
  {
    id: "p5",
    name: "Genuine Leather Wallet",
    sku: "PM-LEA-005",
    category: "Leather",
    price: 2400,
    comparePrice: 0,
    stock: 0,
    status: "active",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAsLD4Fq6OiUN5TM_GlEPXoSH2X9jpMvMQ9xlM3aQE1OJp6Dt17qubFE_v47nnS3rE8fTr-bPfqm1dwBuEQqF53g9WTAgk9tCvjVY-lFWg9lHoknSA4_UdgxNtgT8Bbbew-B_q-DUpCnvfrS5L6t9vvQONfziwceB45Ra4H3wQ_Oui7CcCIWr2J0jxTLpna3MeiCQnH85gHCeiSNy9D23LOGrnl95LHuYyI2w1ge91B2OjH2mp1pAExpaWpi-s59Yc8AJNWQ9sOP4g",
    description: "A slim wallet handcrafted from genuine Pakistani leather.",
    slug: "genuine-leather-wallet",
    seoTitle: "Genuine Leather Wallet Pakistan | PakMarket",
    metaDescription:
      "Buy a handcrafted genuine leather wallet from a trusted Pakistani maker. Durable, practical and made for everyday use.",
    keywords: "leather wallet, handmade wallet, Pakistani leather",
    imageAlt: "Genuine leather wallet with visible stitching",
  },
  {
    id: "p6",
    name: "Pure Organic Sidr Honey",
    sku: "PM-ORG-006",
    category: "Organic",
    price: 3500,
    comparePrice: 0,
    stock: 18,
    status: "draft",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAOK-RqPQhvR2zujHkgUq4-hnaB6f1OAa43QEQLnPv9Q6tc4JwYO-9dmE3PVcSTS7pr6kGYnsOTJarPpWM7vA9JTaAHEnO_OTFiC87O1lc5wUuKe6qwIjjB8Epqbwa7ZGzKNxg_0elr8kNkFhH_OCoG2ZzoryKI_zx8BG39V0kui3IAUj6WD0qW1TvohZX21pRROU2MFXBvFHFR2hAK7kLJ3viJ93a0abFX7wJnFsVuKcaeNlb7p75UPEbHUP8G7wJfpL8gNSRfe8Q",
    description:
      "Pure Sidr honey sourced in small batches from trusted local beekeepers.",
    slug: "pure-organic-sidr-honey",
    seoTitle: "Pure Organic Sidr Honey in Pakistan",
    metaDescription: "",
    keywords: "sidr honey",
    imageAlt: "Organic Sidr honey jar",
  },
];
let products = loadProducts();
localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
const managedCategoryNames = new Set(
  window.PakMarketCategories.getAll().map((category) => category.name),
);
products.forEach((product) => product.category && managedCategoryNames.add(product.category));
window.PakMarketCategories.set(
  [...managedCategoryNames].map((name) => ({
    id:
      window.PakMarketCategories
        .getAll()
        .find((category) => category.name === name)?.id || crypto.randomUUID(),
    name,
    slug: String(name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, ""),
    enabled: true,
  })),
);
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
function normalizeProduct(p) {
  return {
    ...p,
    enabled: p.enabled ?? p.status !== "draft",
    seoIndex: p.seoIndex ?? true,
    featured: p.featured ?? false,
    newArrival: p.newArrival ?? false,
  };
}
function loadProducts() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return (Array.isArray(saved) ? saved : structuredClone(seedProducts)).map(
      normalizeProduct,
    );
  } catch {
    return structuredClone(seedProducts).map(normalizeProduct);
  }
}
function saveProducts() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  if (window.PakMarketDB?.configured)
    Promise.all(products.map((product) => window.PakMarketDB.save("products", toDatabaseProduct(product)))).catch((error) => toast(`Database sync failed: ${error.message}`));
  const state = $("[data-save-state]");
  state.textContent = "Saved just now";
  setTimeout(() => (state.textContent = "All changes saved"), 1600);
  renderAll();
}
function toDatabaseProduct(product) {
  return {id:product.id,name:product.name,slug:product.slug,sku:product.sku,brand:product.brand||null,category_name:product.category||null,image_url:product.image||null,image_slug:product.imageSlug||null,description:product.description||"",price:Number(product.price||0),compare_price:Number(product.comparePrice||0),stock:Number(product.stock||0),low_stock_threshold:Number(product.lowStockThreshold||5),status:product.enabled?"published":"draft",featured:Boolean(product.featured),new_arrival:Boolean(product.newArrival),sale_starts_at:product.saleStartsAt||null,sale_ends_at:product.saleEndsAt||null,seo_index:Boolean(product.seoIndex),seo_title:product.seoTitle||null,meta_description:product.metaDescription||null,keywords:String(product.keywords||"").split(",").map(item=>item.trim()).filter(Boolean),image_alt:product.imageAlt||null,variants:{sizes:String(product.sizes||"").split(",").map(item=>item.trim()).filter(Boolean),colors:String(product.colors||"").split(",").map(item=>item.trim()).filter(Boolean),gallery:String(product.gallery||"").split(/\r?\n/).filter(Boolean),galleryMeta:JSON.parse(product.galleryMeta||"[]")}};
}
function fromDatabaseProduct(product) {
  return normalizeProduct({id:product.id,name:product.name,slug:product.slug,sku:product.sku,brand:product.brand,category:product.category_name||"Uncategorized",image:product.image_url,imageSlug:product.image_slug||"",description:product.description,price:Number(product.price),comparePrice:Number(product.compare_price||0),stock:Number(product.stock),lowStockThreshold:Number(product.low_stock_threshold||5),enabled:product.status==="published",status:product.status==="published"?"active":"draft",featured:product.featured,newArrival:product.new_arrival,saleStartsAt:product.sale_starts_at||"",saleEndsAt:product.sale_ends_at||"",seoIndex:product.seo_index,seoTitle:product.seo_title||"",metaDescription:product.meta_description||"",keywords:(product.keywords||[]).join(", "),imageAlt:product.image_alt||"",sizes:(product.variants?.sizes||[]).join(", "),colors:(product.variants?.colors||[]).join(", "),gallery:(product.variants?.gallery||[]).join("\n"),galleryMeta:JSON.stringify(product.variants?.galleryMeta||[])});
}
function esc(value = "") {
  return String(value).replace(
    /[&<>'"]/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[
        char
      ],
  );
}
function seoScore(p) {
  let score = 0;
  if (p.slug && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p.slug)) score += 15;
  if (p.seoTitle?.length >= 30 && p.seoTitle.length <= 60) score += 25;
  if (p.metaDescription?.length >= 120 && p.metaDescription.length <= 160)
    score += 25;
  if (p.keywords?.split(",").filter(Boolean).length >= 2) score += 15;
  if (p.imageAlt?.length >= 10) score += 10;
  if (p.description?.length >= 50) score += 10;
  return score;
}
function seoClass(score) {
  return score >= 80 ? "good" : score >= 50 ? "fair" : "poor";
}
function statusFor(p) {
  return Number(p.stock) === 0 ? "out" : p.enabled ? "enabled" : "disabled";
}
function formatPrice(value) {
  return `Rs. ${Number(value || 0).toLocaleString("en-PK")}`;
}
function toast(message) {
  const el = $("[data-admin-toast]");
  el.textContent = message;
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 2200);
}
window.toast = toast;
function setView(view) {
  if (view === "requests" && adminSession.role !== "super_admin") return;
  $$("[data-admin-view]").forEach((b) =>
    b.classList.toggle("active", b.dataset.adminView === view),
  );
  $$("[data-view]").forEach((v) =>
    v.classList.toggle("active", v.dataset.view === view),
  );
  const productAction = $("[data-product-action]");
  if (productAction) productAction.hidden = view !== "inventory";
  $("[data-view-title]").textContent = {
    dashboard: "Dashboard",
    inventory: "Inventory",
    seo: "SEO Manager",
    pages: "Pages Control",
    events: "Events & Offers",
    coming: "Coming Soon",
    blogs: "Blog Management",
    business: "Business Center",
    requests: "Admin Requests",
  }[view];
  document.querySelector(".admin-sidebar").classList.remove("open");
}
function authUsers() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_USERS_KEY)) || [];
  } catch {
    return [];
  }
}
function saveAuthUsers(list) {
  localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(list));
}
function renderRequests() {
  if (adminSession.role !== "super_admin") return;
  const pending = authUsers().filter(
    (u) => u.role === "admin" && u.status === "pending",
  );
  $("[data-request-count]").textContent = pending.length;
  $("[data-request-list]").innerHTML = pending.length
    ? pending
        .map(
          (user) =>
            `<article class="request-card"><span class="request-avatar">${esc(
              user.name
                .split(/\s+/)
                .map((n) => n[0])
                .join("")
                .slice(0, 2),
            )}</span><div><strong>${esc(user.name)}</strong><p>${esc(user.email)} · ${esc(user.phone)}</p><small>Requested ${new Date(user.createdAt).toLocaleDateString("en-PK")}</small></div><div><button class="admin-btn danger" data-reject-admin="${user.id}">Reject</button><button class="admin-btn primary" data-approve-admin="${user.id}">Approve</button></div></article>`,
        )
        .join("")
    : '<div class="admin-card request-empty"><span class="material-symbols-outlined">verified_user</span><h3>No pending requests</h3><p>New Admin signup requests will appear here.</p></div>';
}
function renderMetrics() {
  const active = products.filter(
      (p) => p.status === "active" && Number(p.stock) > 0,
    ).length,
    low = products.filter(
      (p) => Number(p.stock) > 0 && Number(p.stock) <= 5,
    ).length,
    out = products.filter((p) => Number(p.stock) === 0).length;
  $("[data-metric-total]").textContent = products.length;
  $("[data-metric-active]").textContent = active;
  $("[data-metric-low]").textContent = low;
  $("[data-metric-out]").textContent = out;
  const scores = products.map(seoScore),
    avg = scores.length
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;
  $("[data-seo-average]").textContent = avg;
  $("[data-seo-ring]").style.setProperty("--score", `${avg}%`);
  $("[data-seo-good]").textContent =
    `${scores.filter((s) => s >= 80).length} products optimized`;
  const attention = products
    .filter((p) => Number(p.stock) <= 5)
    .sort((a, b) => a.stock - b.stock);
  $("[data-attention-list]").innerHTML = attention.length
    ? attention
        .slice(0, 5)
        .map(
          (p) =>
            `<div class="attention-item"><img src="${esc(p.image)}" alt=""><div><strong>${esc(p.name)}</strong><small>${esc(p.sku)}</small></div><span class="stock-alert ${Number(p.stock) === 0 ? "out" : ""}">${Number(p.stock) === 0 ? "Out of stock" : `${p.stock} left`}</span></div>`,
        )
        .join("")
    : '<div class="admin-empty show"><p>All products have healthy stock levels.</p></div>';
}
function populateCategories() {
  const select = $("[data-category-filter]"),
    current = select.value,
    cats = [...new Set(products.map((p) => p.category).filter(Boolean))].sort();
  select.innerHTML =
    '<option value="all">All categories</option>' +
    cats.map((c) => `<option value="${esc(c)}">${esc(c)}</option>`).join("");
  select.value = cats.includes(current) ? current : "all";
}
function filteredProducts() {
  const term = $("[data-admin-search]").value.toLowerCase(),
    status = $("[data-status-filter]").value,
    category = $("[data-category-filter]").value;
  return products.filter(
    (p) =>
      (!term ||
        `${p.name} ${p.sku} ${p.category}`.toLowerCase().includes(term)) &&
      (status === "all" || statusFor(p) === status) &&
      (category === "all" || p.category === category),
  );
}
function switchButton(p, field, label) {
  return `<button class="table-switch ${p[field] ? "on" : ""}" type="button" data-toggle-field="${field}" data-product-id="${p.id}" role="switch" aria-checked="${p[field]}" aria-label="Toggle ${label}"><i></i></button>`;
}
function renderInventory() {
  const rows = filteredProducts();
  $("[data-inventory-body]").innerHTML = rows
    .map((p) => {
      const score = seoScore(p);
      return `<tr><td><div class="table-product"><img src="${esc(p.image)}" alt=""><div><strong>${esc(p.name)}</strong><small>${esc(p.category)} · ${esc(p.description)}</small></div></div></td><td>${esc(p.sku)}</td><td><strong>${formatPrice(p.price)}</strong><small class="stock-line">${p.stock} in stock</small></td><td>${switchButton(p, "enabled", "enabled")}</td><td>${switchButton(p, "seoIndex", "SEO indexing")}</td><td>${switchButton(p, "featured", "featured")}</td><td><span class="seo-badge ${seoClass(score)}">${score}/100</span></td><td><div class="row-actions"><button data-preview="${p.id}" title="Preview"><span class="material-symbols-outlined">visibility</span></button><button data-edit="${p.id}" title="Edit"><span class="material-symbols-outlined">edit</span></button><button data-delete="${p.id}" class="delete-row" title="Delete"><span class="material-symbols-outlined">delete</span></button></div></td></tr>`;
    })
    .join("");
  $("[data-empty-state]").classList.toggle("show", !rows.length);
  if (!rows.length && products.length === 0) {
    const empty = $("[data-empty-state]");
    empty.querySelector("h3").textContent = "Apna pehla product add karein";
    empty.querySelector("p").textContent = "Demo mein aap 3 products tak image, price, stock, variants aur SEO ke sath add kar sakte hain.";
  }
}
function renderSeo() {
  $("[data-seo-list]").innerHTML = products
    .map((p) => {
      const s = seoScore(p);
      return `<article class="seo-item"><div><strong>${esc(p.name)}</strong><p>/${esc(p.slug || "missing-slug")}</p></div><span class="seo-badge ${seoClass(s)}">${s}/100</span><div class="seo-progress"><i style="width:${s}%"></i></div><button data-edit="${p.id}" data-open-seo>Edit SEO</button></article>`;
    })
    .join("");
}
function renderAll() {
  populateCategories();
  renderMetrics();
  renderInventory();
  renderSeo();
  renderRequests();
}
const dialog = $("[data-product-dialog]"),
  form = $("[data-product-form]");
function openProduct(id = null, seoTab = false) {
  const p = id ? products.find((item) => item.id === id) : null;
  if (!p) {
    let settings = {};
    try { settings = JSON.parse(localStorage.getItem("pakmarket_global_settings_v1") || "{}"); } catch {}
    if (settings.demoMode && products.length >= 3) {
      toast("Demo limit 3 products hai. Kisi existing product ko edit/delete karke replace karein, ya store activate karein.");
      return;
    }
  }
  form.reset();
  window.PakMarketCategories.populate(form.elements.category, p?.category || "");
  for (const el of form.elements) {
    if (!el.name || !p || !(el.name in p)) continue;
    if (el.type === "checkbox") el.checked = Boolean(p[el.name]);
    else el.value = p[el.name] ?? "";
  }
  window.PakMarketImageStudio.mountProduct(form, p);
  form.elements.id.value = p?.id || "";
  $("[data-dialog-title]").textContent = p ? "Edit Product" : "Add Product";
  $("[data-delete-product]").style.visibility = p ? "visible" : "hidden";
  setFormTab(seoTab ? "seo" : "details");
  updateFormPreview();
  dialog.showModal();
}
function setFormTab(tab) {
  $$("[data-form-tab]").forEach((b) =>
    b.classList.toggle("active", b.dataset.formTab === tab),
  );
  $$("[data-form-panel]").forEach((p) =>
    p.classList.toggle("active", p.dataset.formPanel === tab),
  );
}
function formData() {
  return Object.fromEntries(new FormData(form).entries());
}
function updateFormPreview() {
  const p = formData();
  p.price = Number(p.price);
  p.stock = Number(p.stock);
  const score = seoScore(p);
  $("[data-form-seo-score]").textContent = `${score}/100`;
  $("[data-preview-title]").textContent =
    p.seoTitle || p.name || "Product title";
  $("[data-preview-slug]").textContent = p.slug || "product-slug";
  $("[data-preview-description]").textContent =
    p.metaDescription || "Meta description preview will appear here.";
  $("[data-title-count]").textContent = `${(p.seoTitle || "").length}/60`;
  $("[data-meta-count]").textContent =
    `${(p.metaDescription || "").length}/160`;
  $("[data-desc-count]").textContent = `${(p.description || "").length}/300`;
}
const previewDialog = $("[data-preview-dialog]"),
  deleteDialog = $("[data-delete-dialog]");
let pendingDeleteId = null;
function showProductPreview(product) {
  if (!product) return;
  $("[data-preview-content]").innerHTML =
    `<div class="admin-product-preview"><div class="preview-media"><img src="${esc(product.image)}" alt="${esc(product.imageAlt || product.name)}"><span>${product.enabled ? "Public preview" : "Private preview"}</span></div><div><small>${esc(product.category || "Product")}</small><h2>${esc(product.name || "Untitled product")}</h2><p>${esc(product.description || "No description added.")}</p><strong>${formatPrice(product.price)}</strong>${Number(product.comparePrice) > Number(product.price) ? `<del>${formatPrice(product.comparePrice)}</del>` : ""}<ul><li>${product.enabled ? "Enabled" : "Disabled"}</li><li>${product.featured ? "Featured" : "Standard listing"}</li><li>${product.seoIndex ? "SEO index allowed" : "SEO noindex"}</li></ul></div></div>`;
  previewDialog.showModal();
}
function requestDelete(id) {
  const product = products.find((p) => p.id === id);
  if (!product) return;
  pendingDeleteId = id;
  $("[data-delete-name]").textContent = product.name;
  $("[data-delete-confirm]").value = "";
  $("[data-confirm-delete]").disabled = true;
  deleteDialog.showModal();
}
form.addEventListener("input", (event) => {
  if (
    event.target.name === "name" &&
    !form.elements.id.value &&
    !form.elements.slug.value
  )
    form.elements.slug.value = event.target.value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  updateFormPreview();
});
form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const data = formData();
  if (!data.image) {
    toast("Upload at least one 1080 × 1080 product image.");
    return;
  }
  data.price = Number(data.price);
  data.comparePrice = Number(data.comparePrice || 0);
  data.stock = Number(data.stock);
  ["enabled", "seoIndex", "featured", "newArrival"].forEach(
    (field) => (data[field] = form.elements[field].checked),
  );
  data.status = data.enabled ? "active" : "draft";
  if (data.id) {
    products = products.map((p) => (p.id === data.id ? data : p));
  } else {
    data.id = crypto.randomUUID();
    products.unshift(data);
  }
  saveProducts();
  dialog.close();
  toast("Product settings saved.");
});
document.addEventListener(
  "click",
  (event) => {
    const button = event.target.closest("button");
    if (!button) return;
    if (button.dataset.toggleField) {
      const product = products.find((p) => p.id === button.dataset.productId);
      if (product) {
        product[button.dataset.toggleField] =
          !product[button.dataset.toggleField];
        product.status = product.enabled ? "active" : "draft";
        saveProducts();
        toast(`${button.dataset.toggleField} updated.`);
      }
      return;
    }
    if (button.dataset.preview) {
      showProductPreview(products.find((p) => p.id === button.dataset.preview));
      return;
    }
    if (button.hasAttribute("data-preview-current")) {
      const data = formData();
      ["enabled", "seoIndex", "featured", "newArrival"].forEach(
        (field) => (data[field] = form.elements[field].checked),
      );
      showProductPreview(data);
      return;
    }
    if (button.hasAttribute("data-close-preview")) {
      previewDialog.close();
      return;
    }
    if (button.dataset.delete) {
      requestDelete(button.dataset.delete);
      return;
    }
    if (button.hasAttribute("data-delete-product")) {
      event.stopImmediatePropagation();
      requestDelete(form.elements.id.value);
      return;
    }
    if (button.hasAttribute("data-cancel-delete")) {
      deleteDialog.close();
      return;
    }
  },
  true,
);
document.addEventListener("click", async (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  if (button.dataset.adminView) setView(button.dataset.adminView);
  if (button.hasAttribute("data-add-product")) openProduct();
  if (button.dataset.edit)
    openProduct(button.dataset.edit, button.hasAttribute("data-open-seo"));
  if (button.dataset.duplicate) {
    const source = products.find((p) => p.id === button.dataset.duplicate);
    products.unshift({
      ...source,
      id: crypto.randomUUID(),
      name: `${source.name} Copy`,
      sku: `${source.sku}-COPY`,
      slug: `${source.slug}-copy`,
      status: "draft",
    });
    saveProducts();
    toast("Product duplicated as draft.");
  }
  if (button.dataset.formTab) setFormTab(button.dataset.formTab);
  if (button.hasAttribute("data-close-dialog")) dialog.close();
  if (button.hasAttribute("data-go-inventory")) setView("inventory");
  if (button.hasAttribute("data-go-seo")) setView("seo");
  if (button.hasAttribute("data-admin-menu"))
    document.querySelector(".admin-sidebar").classList.toggle("open");
  if (button.hasAttribute("data-export")) {
    const blob = new Blob([JSON.stringify(products, null, 2)], {
        type: "application/json",
      }),
      a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "pakmarket-inventory.json";
    a.click();
    URL.revokeObjectURL(a.href);
    toast("Inventory exported.");
  }
});
$$("[data-admin-search],[data-status-filter],[data-category-filter]").forEach(
  (el) =>
    el.addEventListener(
      el.tagName === "INPUT" ? "input" : "change",
      renderInventory,
    ),
);
$("[data-delete-confirm]").addEventListener("input", (event) => {
  const product = products.find((p) => p.id === pendingDeleteId);
  $("[data-confirm-delete]").disabled =
    !product || event.target.value !== product.name;
});
$("[data-delete-form]").addEventListener("submit", (event) => {
  event.preventDefault();
  const product = products.find((p) => p.id === pendingDeleteId);
  if (!product || $("[data-delete-confirm]").value !== product.name) return;
  products = products.filter((p) => p.id !== pendingDeleteId);
  window.PakMarketDB?.remove("products", pendingDeleteId).catch(()=>{});
  saveProducts();
  pendingDeleteId = null;
  deleteDialog.close();
  if (dialog.open) dialog.close();
  toast("Product permanently deleted.");
});
$("[data-import]").addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    if (!Array.isArray(data)) throw new Error();
    products = data;
    saveProducts();
    toast("Inventory imported successfully.");
  } catch {
    toast("That JSON inventory file is invalid.");
  }
  event.target.value = "";
});
if (adminSession) {
  $("[data-admin-name]").textContent = adminSession.name;
  $("[data-admin-initials]").textContent = adminSession.name
    .split(/\s+/)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  $("[data-admin-role-label]").textContent =
    adminSession.role === "super_admin" ? "Super Admin" : "Administrator";
  $("[data-admin-role]").textContent =
    adminSession.role === "super_admin"
      ? "Super Admin workspace"
      : "Admin workspace";
}
if (adminSession?.role !== "super_admin")
  $$("[data-super-only]").forEach((el) => el.remove());
document.addEventListener("click", async (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  if (button.hasAttribute("data-logout")) {
    if (adminSession?.demo) {
      window.PakMarketDemo?.clear();
      location.replace("auth.html?demo=ended");
      return;
    }
    if (window.PakMarketDB?.configured) {
      await window.PakMarketDB.signOut();
    }
    localStorage.removeItem(AUTH_SESSION_KEY);
    location.replace("auth.html");
    return;
  }
  const id = button.dataset.approveAdmin || button.dataset.rejectAdmin;
  if (id && adminSession.role === "super_admin") {
    const approved = button.hasAttribute("data-approve-admin");
    const list = authUsers().map((user) =>
      user.id === id
        ? {
            ...user,
            status: approved ? "approved" : "rejected",
            reviewedBy: adminSession.email,
            reviewedAt: new Date().toISOString(),
          }
        : user,
    );
    saveAuthUsers(list);
    renderRequests();
    toast(approved ? "Admin request approved." : "Admin request rejected.");
  }
});
renderAll();
setView("dashboard");
if(window.PakMarketDB?.configured)window.PakMarketDB.list("products",{order:{column:"created_at",ascending:false}}).then(rows=>{products=(rows||[]).map(fromDatabaseProduct);localStorage.setItem(STORAGE_KEY,JSON.stringify(products));renderAll()}).catch(error=>toast(`Could not load shared inventory: ${error.message}`));
