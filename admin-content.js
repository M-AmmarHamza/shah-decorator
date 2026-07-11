(() => {
  const KEYS = {
    events: "pakmarket_events_v1",
    coming: "pakmarket_coming_v1",
    blogs: "pakmarket_blogs_v1",
  };
  const read = (key) => {
    try {
      return JSON.parse(localStorage.getItem(key)) || [];
    } catch {
      return [];
    }
  };
  const write = (key, value) =>
    localStorage.setItem(key, JSON.stringify(value));
  const esc = (value) =>
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
  const slugify = (value) =>
    String(value || "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const toDatabaseContent = (type, item) => type === "events" ? {id:item.id,name:item.title,message:item.message,secondary_message:item.secondary||null,discount_code:item.code||null,starts_at:item.start,ends_at:item.end,enabled:item.enabled} : type === "coming" ? {id:item.id,name:item.name,image_url:item.image,description:item.description,starts_at:item.start,launches_at:item.end,enabled:item.enabled} : {id:item.id,title:item.title,slug:item.slug,category:item.category,author_name:item.author,cover_url:item.image,excerpt:item.excerpt,content:item.content,status:item.enabled?"published":"draft",featured:item.featured,published_at:item.publishDate?`${item.publishDate}T00:00:00+05:00`:null,seo_index:item.seoIndex,seo_title:item.seoTitle,meta_description:item.metaDescription,keywords:String(item.keywords||"").split(",").map(value=>value.trim()).filter(Boolean)};
  const nav = document.querySelector(".admin-sidebar nav"),
    requestNav = nav.querySelector('[data-admin-view="requests"]');
  [
    { view: "events", icon: "campaign", label: "Events & Offers" },
    { view: "coming", icon: "event_upcoming", label: "Coming Soon" },
    { view: "blogs", icon: "edit_note", label: "Blog Management" },
  ].forEach((item) => {
    const button = document.createElement("button");
    button.dataset.adminView = item.view;
    button.innerHTML = `<span class="material-symbols-outlined">${item.icon}</span>${item.label}`;
    nav.insertBefore(button, requestNav);
  });
  const main = document.querySelector(".admin-content"),
    requests = document.querySelector('[data-view="requests"]');
  const section = (view, title, copy, button) => {
    const element = document.createElement("section");
    element.className = "admin-view";
    element.dataset.view = view;
    element.innerHTML = `<div class="content-toolbar"><div><h2>${title}</h2><p>${copy}</p></div><button class="admin-btn primary" type="button" data-add-content="${view}"><span class="material-symbols-outlined">add</span>${button}</button></div><div class="content-summary" data-${view}-summary></div><div class="content-management-list" data-${view}-list></div>`;
    main.insertBefore(element, requests);
    return element;
  };
  section(
    "events",
    "Events & Special Offers",
    "Schedule announcement-bar campaigns that activate and expire automatically.",
    "New event",
  );
  section(
    "coming",
    "Coming Soon Products",
    "Plan upcoming launches and automatically remove expired announcements.",
    "Add upcoming product",
  );
  section(
    "blogs",
    "Blog Management",
    "Create, publish, feature and optimize PakMarket stories.",
    "Create blog",
  );
  const dialog = document.createElement("dialog");
  dialog.className = "content-dialog";
  dialog.dataset.contentDialog = "";
  dialog.innerHTML =
    '<form data-content-form><header><div><small data-content-kicker>Content manager</small><h2 data-content-title>Edit</h2></div><button type="button" data-close-content aria-label="Close"><span class="material-symbols-outlined">close</span></button></header><div class="content-form-body" data-content-fields></div><footer><button class="admin-btn secondary" type="button" data-close-content>Cancel</button><button class="admin-btn primary" type="submit">Save</button></footer></form>';
  document.body.append(dialog);
  let events = read(KEYS.events),
    coming = read(KEYS.coming),
    blogs = read(KEYS.blogs),
    editing = null;
  const statusFor = (item) => {
    if (!item.enabled) return ["Disabled", "off"];
    const now = Date.now(),
      start = item.start ? new Date(item.start).getTime() : 0,
      end = item.end ? new Date(item.end).getTime() : Infinity;
    if (now < start) return ["Scheduled", "scheduled"];
    if (now > end) return ["Expired", "expired"];
    return ["Live", "live"];
  };
  const dateText = (value) =>
    value
      ? new Intl.DateTimeFormat("en-PK", {
          dateStyle: "medium",
          timeStyle: "short",
        }).format(new Date(value))
      : "Not set";
  function render() {
    const eventList = document.querySelector("[data-events-list]");
    eventList.innerHTML = events.length
      ? events
          .map((item) => {
            const status = statusFor(item);
            return `<article class="manage-row"><div class="manage-icon"><span class="material-symbols-outlined">campaign</span></div><div class="manage-copy"><div><h3>${esc(item.title)}</h3><span class="manage-status ${status[1]}">${status[0]}</span></div><p>${esc(item.message)} ${item.code ? `<b>Code: ${esc(item.code)}</b>` : ""}</p><small>${dateText(item.start)} → ${dateText(item.end)}</small></div><div class="manage-actions"><button data-edit-content="events" data-id="${item.id}" title="Edit"><span class="material-symbols-outlined">edit</span></button><button data-toggle-content="events" data-id="${item.id}" title="Enable or disable"><span class="material-symbols-outlined">${item.enabled ? "toggle_on" : "toggle_off"}</span></button><button data-remove-content="events" data-id="${item.id}" title="Delete"><span class="material-symbols-outlined">delete</span></button></div></article>`;
          })
          .join("")
      : '<div class="content-empty">No managed events yet. The existing website announcement remains as fallback.</div>';
    document.querySelector("[data-events-summary]").innerHTML = summary(
      events,
      "campaign",
      "events",
    );
    const comingList = document.querySelector("[data-coming-list]");
    comingList.innerHTML = coming.length
      ? coming
          .map((item) => {
            const status = statusFor(item);
            return `<article class="manage-row"><img class="manage-thumb" src="${esc(item.image)}" alt=""><div class="manage-copy"><div><h3>${esc(item.name)}</h3><span class="manage-status ${status[1]}">${status[0]}</span></div><p>${esc(item.description)}</p><small>Display: ${dateText(item.start)} → Launch: ${dateText(item.end)}</small></div><div class="manage-actions"><button data-edit-content="coming" data-id="${item.id}"><span class="material-symbols-outlined">edit</span></button><button data-toggle-content="coming" data-id="${item.id}"><span class="material-symbols-outlined">${item.enabled ? "toggle_on" : "toggle_off"}</span></button><button data-remove-content="coming" data-id="${item.id}"><span class="material-symbols-outlined">delete</span></button></div></article>`;
          })
          .join("")
      : '<div class="content-empty">No managed upcoming products. Homepage cards remain unchanged until one is added.</div>';
    document.querySelector("[data-coming-summary]").innerHTML = summary(
      coming,
      "event_upcoming",
      "launches",
    );
    const blogList = document.querySelector("[data-blogs-list]");
    blogList.innerHTML = blogs.length
      ? blogs
          .map(
            (item) =>
              `<article class="manage-row"><img class="manage-thumb" src="${esc(item.image)}" alt=""><div class="manage-copy"><div><h3>${esc(item.title)}</h3><span class="manage-status ${item.enabled ? "live" : "off"}">${item.enabled ? "Published" : "Draft"}</span>${item.featured ? '<span class="manage-status featured">Featured</span>' : ""}</div><p>${esc(item.excerpt)}</p><small>${esc(item.category)} · ${esc(item.author)} · ${item.readTime || 5} min read · SEO ${item.seoIndex ? "Index" : "Noindex"}</small></div><div class="manage-actions"><a href="blog-detail.html?blog=${encodeURIComponent(item.slug)}&preview=1" target="_blank"><span class="material-symbols-outlined">visibility</span></a><button data-edit-content="blogs" data-id="${item.id}"><span class="material-symbols-outlined">edit</span></button><button data-toggle-content="blogs" data-id="${item.id}"><span class="material-symbols-outlined">${item.enabled ? "toggle_on" : "toggle_off"}</span></button><button data-remove-content="blogs" data-id="${item.id}"><span class="material-symbols-outlined">delete</span></button></div></article>`,
          )
          .join("")
      : '<div class="content-empty">No managed blogs yet. Create the first story to replace the static blog listing.</div>';
    document.querySelector("[data-blogs-summary]").innerHTML = summary(
      blogs,
      "article",
      "blogs",
    );
  }
  function summary(items, icon, label) {
    const live = items.filter((item) => statusFor(item)[1] === "live").length,
      scheduled = items.filter(
        (item) => statusFor(item)[1] === "scheduled",
      ).length;
    return `<span class="material-symbols-outlined">${icon}</span><div><strong>${items.length}</strong><small>Total ${label}</small></div><div><strong>${live}</strong><small>Live / published</small></div><div><strong>${scheduled}</strong><small>Scheduled</small></div>`;
  }
  const input = (label, name, type = "text", extra = "") =>
    `<label>${label}<input type="${type}" name="${name}" ${extra}></label>`;
  const check = (label, name, copy) =>
    `<label class="content-check"><input type="checkbox" name="${name}"><span><b>${label}</b><small>${copy}</small></span></label>`;
  function fieldsFor(type) {
    if (type === "events")
      return `<input type="hidden" name="id"><div class="content-form-row">${input("Event name", "title", "text", "required maxlength=80")}${input("Discount code", "code", "text", "maxlength=30")}</div>${input("Main announcement", "message", "text", "required maxlength=140")}${input("Secondary message", "secondary", "text", "maxlength=100 placeholder='e.g. Free delivery above Rs. 3,000'")}<div class="content-form-row">${input("Start date & time", "start", "datetime-local", "required")}${input("End date & time", "end", "datetime-local", "required")}</div>${check("Enabled", "enabled", "Campaign can run during its scheduled window.")}`;
    if (type === "coming")
      return `<input type="hidden" name="id">${input("Product / collection name", "name", "text", "required maxlength=80")}${input("Image URL", "image", "url", "required")}<label>Description<textarea name="description" rows="4" required maxlength="240"></textarea></label><div class="content-form-row">${input("Start showing", "start", "datetime-local", "required")}${input("Launch / stop showing", "end", "datetime-local", "required")}</div>${check("Enabled", "enabled", "Show automatically between the selected dates.")}`;
    return `<input type="hidden" name="id"><div class="content-form-row">${input("Blog title", "title", "text", "required maxlength=100")}${input("URL slug", "slug", "text", "required maxlength=100")}</div><div class="content-form-row">${input("Category", "category", "text", "required maxlength=40")}${input("Author", "author", "text", "required maxlength=60")}</div>${input("Cover image URL", "image", "url", "required")}<label>Short excerpt<textarea name="excerpt" rows="3" required maxlength="260"></textarea></label><label>Article content<textarea name="content" rows="8" required maxlength="10000" placeholder="Write the complete article here..."></textarea></label><div class="content-form-row">${input("Reading time (minutes)", "readTime", "number", "required min=1 max=60")}${input("Publish date", "publishDate", "date", "required")}</div><div class="content-check-grid">${check("Published", "enabled", "Visible on the public blog.")}${check("Featured", "featured", "Use as the main featured story.")}${check("SEO Index", "seoIndex", "Allow search-engine indexing.")}</div><div class="content-form-row">${input("SEO title", "seoTitle", "text", "required maxlength=60")}${input("Focus keywords", "keywords", "text", "maxlength=160")}</div><label>Meta description<textarea name="metaDescription" rows="3" required maxlength="160"></textarea></label>`;
  }
  function openEditor(type, id) {
    const source = { events, coming, blogs }[type],
      item = source.find((entry) => entry.id === id) || {
        enabled: true,
        seoIndex: true,
        readTime: 5,
        publishDate: new Date().toISOString().slice(0, 10),
      };
    editing = { type, id };
    document.querySelector("[data-content-title]").textContent = id
      ? `Edit ${type === "blogs" ? "blog" : type === "events" ? "event" : "upcoming product"}`
      : `Add ${type === "blogs" ? "blog" : type === "events" ? "event" : "upcoming product"}`;
    const fields = document.querySelector("[data-content-fields]");
    fields.innerHTML = fieldsFor(type);
    const form = document.querySelector("[data-content-form]");
    Object.entries(item).forEach(([key, value]) => {
      const element = form.elements[key];
      if (!element) return;
      if (element.type === "checkbox") element.checked = Boolean(value);
      else element.value = value ?? "";
    });
    dialog.showModal();
  }
  document.addEventListener("click", (event) => {
    const target = event.target.closest("button,a");
    if (!target) return;
    if (target.dataset.addContent) openEditor(target.dataset.addContent);
    if (target.dataset.editContent)
      openEditor(target.dataset.editContent, target.dataset.id);
    if (target.hasAttribute("data-close-content")) dialog.close();
    if (target.dataset.toggleContent) {
      const type = target.dataset.toggleContent,
        list = { events, coming, blogs }[type],
        item = list.find((entry) => entry.id === target.dataset.id);
      if (item) {
        item.enabled = !item.enabled;
        write(KEYS[type], list);
        if (window.PakMarketDB?.configured)
          window.PakMarketDB.update(type, item.id, type === "blogs" ? {status:item.enabled?"published":"draft"} : {enabled:item.enabled}).catch(error=>toast(error.message));
        render();
        toast(`${type} status updated.`);
      }
    }
    if (target.dataset.removeContent) {
      const type = target.dataset.removeContent,
        list = { events, coming, blogs }[type],
        item = list.find((entry) => entry.id === target.dataset.id);
      if (item && confirm(`Delete “${item.title || item.name}”?`)) {
        const next = list.filter((entry) => entry.id !== item.id);
        if (type === "events") events = next;
        if (type === "coming") coming = next;
        if (type === "blogs") blogs = next;
        write(KEYS[type], next);
        if (window.PakMarketDB?.configured)
          window.PakMarketDB.remove(type, item.id).catch(error=>toast(error.message));
        render();
        toast("Item deleted.");
      }
    }
  });
  document
    .querySelector("[data-content-form]")
    .addEventListener("input", (event) => {
      if (
        event.target.name === "title" &&
        !event.target.form.elements.id.value &&
        editing?.type === "blogs"
      )
        event.target.form.elements.slug.value = slugify(event.target.value);
    });
  document
    .querySelector("[data-content-form]")
    .addEventListener("submit", (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      if (!form.reportValidity()) return;
      const data = Object.fromEntries(new FormData(form).entries()),
        type = editing.type;
      ["enabled", "featured", "seoIndex"].forEach((key) => {
        if (form.elements[key]) data[key] = form.elements[key].checked;
      });
      if (
        (type === "events" || type === "coming") &&
        new Date(data.end) <= new Date(data.start)
      ) {
        toast("End date must be after the start date.");
        return;
      }
      data.id = data.id || crypto.randomUUID();
      if (type === "blogs") {
        data.slug = slugify(data.slug);
        data.readTime = Number(data.readTime);
      }
      let current = { events, coming, blogs }[type];
      if (type === "blogs" && data.featured)
        current = current.map((item) => ({ ...item, featured: false }));
      const next = current.some((item) => item.id === data.id)
        ? current.map((item) => (item.id === data.id ? data : item))
        : [data, ...current];
      if (type === "events") events = next;
      if (type === "coming") coming = next;
      if (type === "blogs") blogs = next;
      write(KEYS[type], next);
      if (window.PakMarketDB?.configured)
        window.PakMarketDB.save(type, toDatabaseContent(type, data)).catch(error=>toast(`Database sync failed: ${error.message}`));
      dialog.close();
      render();
      toast("Content saved successfully.");
    });
  render();
  setInterval(render, 60000);
})();
