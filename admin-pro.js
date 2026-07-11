(() => {
  const db = window.PakMarketDB,
    esc = (value) =>
      String(value ?? "").replace(
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
  const nav = document.querySelector(".admin-sidebar nav"),
    requestButton = nav.querySelector('[data-admin-view="requests"]'),
    button = document.createElement("button");
  button.dataset.adminView = "business";
  button.innerHTML =
    '<span class="material-symbols-outlined">business_center</span>Business Center';
  nav.insertBefore(button, requestButton);
  const view = document.createElement("section");
  view.className = "admin-view";
  view.dataset.view = "business";
  view.innerHTML =
    '<div class="content-toolbar"><div><h2>Business Center</h2><p>Orders, payments and website operations in one simple workspace.</p></div><button class="admin-btn secondary" data-pro-backup><span class="material-symbols-outlined">download</span>Full backup</button></div><div class="pro-tabs"></div><div class="pro-panels"></div>';
  document
    .querySelector(".admin-content")
    .insertBefore(view, document.querySelector('[data-view="requests"]'));
  const modules = [
    ["orders", "receipt_long", "Orders"],
    ["payments", "payments", "Payments"],
    ["reviews", "reviews", "Reviews"],
    ["categories", "category", "Categories"],
    ["team", "group", "Team"],
    ["settings", "tune", "Settings"],
    ["media", "perm_media", "Media"],
    ["analytics", "monitoring", "Analytics"],
  ];
  const tabs = view.querySelector(".pro-tabs"),
    panels = view.querySelector(".pro-panels");
  modules.forEach(([key, icon, label], index) => {
    tabs.insertAdjacentHTML(
      "beforeend",
      `<button class="${index ? "" : "active"}" data-pro-tab="${key}"><span class="material-symbols-outlined">${icon}</span>${label}</button>`,
    );
    panels.insertAdjacentHTML(
      "beforeend",
      `<section class="pro-panel ${index ? "" : "active"}" data-pro-panel="${key}"><div class="content-empty">Loading ${label.toLowerCase()}…</div></section>`,
    );
  });
  tabs.addEventListener("click", (event) => {
    const tab = event.target.closest("[data-pro-tab]");
    if (!tab) return;
    tabs
      .querySelectorAll("button")
      .forEach((item) => item.classList.toggle("active", item === tab));
    panels
      .querySelectorAll(".pro-panel")
      .forEach((panel) =>
        panel.classList.toggle(
          "active",
          panel.dataset.proPanel === tab.dataset.proTab,
        ),
      );
  });
  const local = (key) => {
      try {
        return JSON.parse(localStorage.getItem(key)) || [];
      } catch {
        return [];
      }
    },
    saveLocal = (key, data) => localStorage.setItem(key, JSON.stringify(data));
  let state = {
    orders: [],
    payments: [],
    reviews: [],
    categories: [],
    team: [],
    analytics: [],
  };
  async function load() {
    if (db?.configured) {
      const resources = [
        "orders",
        "payment_confirmations",
        "product_reviews",
        "categories",
        "profiles",
        "analytics_events",
      ];
      const results = await Promise.all(
        resources.map((resource) => db.list(resource).catch(() => [])),
      );
      [
        state.orders,
        state.payments,
        state.reviews,
        state.categories,
        state.team,
        state.analytics,
      ] = results;
    } else {
      state.orders = local("pakmarket_orders_v1");
      state.payments = local("pakmarket_payments_v1");
      state.reviews = local("pakmarket_reviews_v1");
      state.categories = local("pakmarket_categories_v1").length
        ? local("pakmarket_categories_v1")
        : window.PakMarketCategories.getAll();
      state.team = local("pakmarket_users_v1");
      state.analytics = local("pakmarket_analytics_v1");
    }
    render();
  }
  const statusSelect = (item, resource, values) =>
    `<select data-pro-status="${resource}" data-id="${item.id}">${values.map((value) => `<option ${item.status === value ? "selected" : ""}>${value}</option>`).join("")}</select>`;
  function render() {
    window.PakMarketCategories.set(state.categories);
    panel(
      "orders",
      state.orders.length
        ? state.orders
            .map((order) =>
              row(
                "receipt_long",
                `Order #${order.order_number || order.id}`,
                `${esc(order.customer_name)} · ${esc(order.phone)} · Rs. ${Number(order.total || 0).toLocaleString("en-PK")}${order.offer_code ? ` · Offer ${esc(order.offer_code)}` : ""}${order.delivery_included ? " · Delivery included" : ` · Delivery Rs. ${Number(order.delivery_fee || 0).toLocaleString("en-PK")}`}`,
                statusSelect(order, "orders", [
                  "pending",
                  "confirmed",
                  "processing",
                  "shipped",
                  "delivered",
                  "cancelled",
                  "returned",
                ]),
              ),
            )
            .join("")
        : empty("No orders recorded yet."),
    );
    panel(
      "payments",
      state.payments.length
        ? state.payments
            .map((payment) =>
              row(
                "payments",
                `${esc(payment.customer_name)} · Rs. ${Number(payment.amount).toLocaleString("en-PK")}`,
                `${esc(payment.method)} · ${new Date(payment.created_at).toLocaleDateString("en-PK")}`,
                statusSelect(payment, "payment_confirmations", [
                  "pending_verification",
                  "paid",
                  "rejected",
                  "refunded",
                ]),
              ),
            )
            .join("")
        : empty("No payment slips awaiting verification."),
    );
    panel(
      "reviews",
      state.reviews.length
        ? state.reviews
            .map((review) =>
              row(
                "star",
                `${review.rating}/5 · ${esc(review.title || "Product review")}`,
                esc(review.body),
                `<button class="admin-btn ${review.approved ? "secondary" : "primary"}" data-review-approve="${review.id}">${review.approved ? "Approved" : "Approve"}</button>`,
              ),
            )
            .join("")
        : empty("No customer reviews yet."),
    );
    panel(
      "categories",
      `<div class="category-manager-intro"><span class="material-symbols-outlined">account_tree</span><div><strong>Shared Category Manager</strong><small>One category list for Products, Blogs and Upcoming.</small></div></div><form class="pro-inline-form" data-category-form><input class="field" name="name" required placeholder="New shared category name"><button class="admin-btn primary">Add category</button></form>${state.categories.map((category) => row("category", esc(category.name), `Products · Blogs · Upcoming · /${esc(category.slug)}`, `<button data-category-delete="${category.id}" class="icon-action" title="Delete category"><span class="material-symbols-outlined">delete</span></button>`)).join("") || empty("No managed categories yet. Add one category to use it everywhere.")}`,
    );
    panel(
      "team",
      state.team.length
        ? state.team
            .map((member) =>
              row(
                "person",
                esc(member.full_name || member.name),
                `${esc(member.role)} · ${esc(member.approval || member.status)}`,
                member.approval === "pending"
                  ? `<button class="admin-btn primary" data-team-approve="${member.id}">Approve</button>`
                  : "",
              ),
            )
            .join("")
        : empty("No team accounts available."),
    );
    const settings = JSON.parse(
      localStorage.getItem("pakmarket_global_settings_v1") || "{}",
    );
    panel(
      "settings",
      `<form class="pro-settings" data-settings-form><div class="content-form-row"><label>WhatsApp number<input class="field" name="whatsapp" value="${esc(settings.whatsapp || "923161013991")}"></label><label>Support email<input class="field" type="email" name="email" value="${esc(settings.email || "")}"></label></div><div class="content-form-row"><label>Default delivery treatment<select class="field" name="deliveryMode"><option value="separate" ${settings.deliveryMode==="separate"?"selected":""}>Charge separately</option><option value="included" ${settings.deliveryMode==="included"?"selected":""}>Included in product price</option><option value="free" ${settings.deliveryMode==="free"?"selected":""}>Free delivery</option></select></label><label>Default delivery charge (Rs.)<input class="field" type="number" min="0" name="deliveryFee" value="${esc(settings.deliveryFee || "0")}"></label></div><div class="content-form-row"><label>Facebook URL<input class="field" type="url" name="facebook" value="${esc(settings.facebook || "")}"></label><label>Instagram URL<input class="field" type="url" name="instagram" value="${esc(settings.instagram || "")}"></label></div><details><summary>Payment and advanced settings</summary><div class="content-form-row"><label>Easypaisa/JazzCash<input class="field" name="wallet" value="${esc(settings.wallet || "03161013991")}"></label><label>Account title<input class="field" name="accountTitle" value="${esc(settings.accountTitle || "Muhammad Ammar")}"></label></div></details><button class="admin-btn primary">Save settings</button></form>`,
    );
    panel(
      "media",
      `<form class="media-upload" data-media-form><label>Media type<select class="field" name="bucket"><option value="product-media">Product image</option><option value="blog-media">Blog image</option></select></label><label>Choose image<input class="field" type="file" name="file" accept="image/jpeg,image/png,image/webp" required></label><button class="admin-btn primary">Upload image</button><p data-media-result></p></form>`,
    );
    const counts = Object.entries(
      state.analytics.reduce(
        (map, item) => (
          (map[item.event_name] = (map[item.event_name] || 0) + 1),
          map
        ),
        {},
      ),
    ).sort((a, b) => b[1] - a[1]);
    panel(
      "analytics",
      counts.length
        ? `<div class="analytics-grid">${counts.map(([name, count]) => `<article><strong>${count}</strong><span>${esc(name.replaceAll("_", " "))}</span></article>`).join("")}</div>`
        : empty("Analytics will appear after the live site receives activity."),
    );
  }
  const panel = (key, html) =>
      (panels.querySelector(`[data-pro-panel="${key}"]`).innerHTML = html),
    empty = (text) => `<div class="content-empty">${text}</div>`,
    row = (icon, title, copy, action = "") =>
      `<article class="pro-row"><span class="material-symbols-outlined">${icon}</span><div><strong>${title}</strong><small>${copy}</small></div><div>${action}</div></article>`;
  view.addEventListener("change", async (event) => {
    if (!event.target.dataset.proStatus) return;
    const resource = event.target.dataset.proStatus,
      id = event.target.dataset.id;
    try {
      if (db?.configured)
        await db.update(resource, id, { status: event.target.value });
      toast("Status updated.");
    } catch (error) {
      toast(error.message);
    }
  });
  view.addEventListener("click", async (event) => {
    const approve = event.target.closest("[data-review-approve]"),
      team = event.target.closest("[data-team-approve]"),
      remove = event.target.closest("[data-category-delete]");
    if (approve) {
      await db?.update("product_reviews", approve.dataset.reviewApprove, {
        approved: true,
      });
      await load();
    }
    if (team) {
      await db?.update("profiles", team.dataset.teamApprove, {
        approval: "approved",
      });
      await load();
    }
    if (remove) {
      const category = state.categories.find(
        (item) => item.id === remove.dataset.categoryDelete,
      );
      if (
        !category ||
        !(await window.requestAdminDelete({
          name: category.name,
          subject: "category",
        }))
      )
        return;
      if (db?.configured)
        await db.remove("categories", remove.dataset.categoryDelete);
      else {
        state.categories = state.categories.filter(
          (item) => item.id !== remove.dataset.categoryDelete,
        );
        saveLocal("pakmarket_categories_v1", state.categories);
      }
      render();
      toast("Category permanently deleted.");
    }
  });
  view.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (event.target.matches("[data-category-form]")) {
      const name = new FormData(event.target).get("name"),
        category = {
          id: crypto.randomUUID(),
          name,
          slug: String(name)
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, ""),
          enabled: true,
        };
      if (
        state.categories.some(
          (item) => item.name.trim().toLowerCase() === name.trim().toLowerCase(),
        )
      ) {
        toast("This category already exists.");
        return;
      }
      if (db?.configured) await db.save("categories", category);
      else {
        state.categories.push(category);
        saveLocal("pakmarket_categories_v1", state.categories);
      }
      event.target.reset();
      await load();
    }
    if (event.target.matches("[data-settings-form]")) {
      const values = Object.fromEntries(new FormData(event.target));
      localStorage.setItem(
        "pakmarket_global_settings_v1",
        JSON.stringify(values),
      );
      if (db?.configured)
        await db.save("settings", {
          key: "global",
          value: values,
          is_public: true,
        });
      toast("Website settings saved.");
    }
    if (event.target.matches("[data-media-form]")) {
      const data = new FormData(event.target),
        file = data.get("file"),
        bucket = data.get("bucket");
      if (!db?.configured) {
        toast("Connect Supabase before uploading media.");
        return;
      }
      const path = `${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}-${file.name.replace(/[^a-z0-9.]+/gi, "-")}`;
      await db.upload(bucket, file, path);
      event.target.querySelector("[data-media-result]").textContent =
        await db.publicUrl(bucket, path);
      toast("Image uploaded.");
    }
  });
  document
    .querySelector("[data-pro-backup]")
    .addEventListener("click", async () => {
      const backup = {
        version: 1,
        createdAt: new Date().toISOString(),
        localStorage: Object.fromEntries(
          Object.keys(localStorage)
            .filter((key) => key.startsWith("pakmarket_"))
            .map((key) => [
              key,
              JSON.parse(localStorage.getItem(key) || "null"),
            ]),
        ),
      };
      if (db?.configured)
        for (const resource of [
          "products",
          "categories",
          "pages",
          "blogs",
          "events",
          "coming_soon",
          "orders",
          "payment_confirmations",
          "site_settings",
        ])
          backup[resource] = await db.list(resource).catch(() => []);
      const blob = new Blob([JSON.stringify(backup, null, 2)], {
          type: "application/json",
        }),
        link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `pakmarket-backup-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(link.href);
    });
  load().catch((error) => {
    console.error(error);
    toast("Business data could not be loaded.");
  });
})();
