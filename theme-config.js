export const STORE_THEMES = Object.freeze([
  { id: "gold", name: "Royal Gold", primary: "#966E2D", bright: "#B8863A", soft: "#FAF3E6", secondary: "#6B4C18" },
  { id: "emerald", name: "Emerald", primary: "#007A55", bright: "#07986D", soft: "#DDF7EC", secondary: "#075B42" },
  { id: "royal", name: "Royal Blue", primary: "#3157A6", bright: "#426FC8", soft: "#E5ECFA", secondary: "#263F7B" },
  { id: "ocean", name: "Ocean", primary: "#086C8C", bright: "#0B89AF", soft: "#DDF3FA", secondary: "#07536C" },
  { id: "indigo", name: "Indigo", primary: "#5A48B5", bright: "#735FD1", soft: "#ECE8FA", secondary: "#403484" },
  { id: "berry", name: "Berry", primary: "#9A3C65", bright: "#B7517B", soft: "#F8E5ED", secondary: "#712C4A" },
  { id: "terracotta", name: "Terracotta", primary: "#A94F31", bright: "#C56746", soft: "#F9E7E0", secondary: "#783923" },
  { id: "charcoal", name: "Charcoal", primary: "#334155", bright: "#4B5D73", soft: "#E8ECF1", secondary: "#1F2937" },
]);

const normalizeHex = (value) => /^#[0-9a-f]{6}$/i.test(value || "") ? value.toUpperCase() : null;
const mix = (hex, target, amount) => {
  const source = hex.slice(1).match(/../g).map((part) => parseInt(part, 16));
  const destination = target.slice(1).match(/../g).map((part) => parseInt(part, 16));
  return `#${source.map((channel, index) => Math.round(channel + (destination[index] - channel) * amount).toString(16).padStart(2, "0")).join("")}`;
};

export function getStoreTheme(id, customPrimary) {
  const preset = STORE_THEMES.find((theme) => theme.id === id);
  if (preset) return preset;
  const primary = normalizeHex(customPrimary) || STORE_THEMES[0].primary;
  return { id: "custom", name: "Custom", primary, bright: mix(primary, "#FFFFFF", .14), soft: mix(primary, "#FFFFFF", .84), secondary: mix(primary, "#000000", .26) };
}

export function applyStoreTheme(id, customPrimary) {
  const theme = getStoreTheme(id, customPrimary);
  const root = document.documentElement;
  root.style.setProperty("--primary", theme.primary);
  root.style.setProperty("--primary-bright", theme.bright);
  root.style.setProperty("--primary-soft", theme.soft);
  root.style.setProperty("--secondary", theme.secondary);
  root.style.setProperty("--admin-accent", theme.primary);
  root.dataset.storeTheme = theme.id;
  return theme;
}
