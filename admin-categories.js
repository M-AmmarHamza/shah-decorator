const STORAGE_KEY = "pakmarket_categories_v1";

const escapeHtml = (value) =>
  String(value ?? "").replace(
    /[&<>'"]/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[
        character
      ],
  );

const read = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch {
    return [];
  }
};

const inferredNames = () => {
  const names = new Set();
  read("pakmarket_inventory_v1").forEach(
    (item) => item.category && names.add(item.category),
  );
  read("pakmarket_blogs_v1").forEach(
    (item) => item.category && names.add(item.category),
  );
  read("pakmarket_coming_v1").forEach(
    (item) => item.category && names.add(item.category),
  );
  return [...names];
};

const DEFAULT_CATEGORIES = [
  { id: "cat-bouquets", name: "Custom Bouquets", slug: "custom-bouquets", enabled: true },
  { id: "cat-party", name: "Party & Balloons", slug: "party-supplies", enabled: true },
  { id: "cat-mehndi", name: "Mayon & Mehndi Essentials", slug: "mayon-mehndi-items", enabled: true },
  { id: "cat-room", name: "Room Decor Services", slug: "room-decor", enabled: true },
  { id: "cat-event", name: "Event & Stage Decor", slug: "event-decor", enabled: true },
];

let categories = read(STORAGE_KEY);
if (!categories.length) {
  categories = DEFAULT_CATEGORIES;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
}

function normalize(items) {
  const seen = new Set();
  return (items || [])
    .filter((item) => item?.name && item.enabled !== false)
    .filter((item) => {
      const key = item.name.trim().toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

function set(items) {
  const next = normalize(items);
  if (JSON.stringify(next) === JSON.stringify(categories)) return;
  categories = next;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
  document.dispatchEvent(new CustomEvent("pakmarket:categories-updated"));
}

function options(selected = "") {
  const current = String(selected || "");
  const list = [...categories];
  if (current && !list.some((item) => item.name === current))
    list.push({ name: current });
  return `<option value="">Select category</option>${list
    .map(
      (item) =>
        `<option value="${escapeHtml(item.name)}" ${item.name === current ? "selected" : ""}>${escapeHtml(item.name)}</option>`,
    )
    .join("")}`;
}

function populate(select, selected = select?.value || "") {
  if (!select) return;
  select.innerHTML = options(selected);
  select.value = selected;
}

window.PakMarketCategories = {
  getAll: () => [...categories],
  set,
  options,
  populate,
};

document.addEventListener("pakmarket:categories-updated", () =>
  document
    .querySelectorAll("select[data-managed-category]")
    .forEach((select) => populate(select)),
);

if (window.PakMarketDB?.configured)
  window.PakMarketDB.list("categories", {
    order: { column: "sort_order", ascending: true },
  })
    .then(set)
    .catch(() => {});
