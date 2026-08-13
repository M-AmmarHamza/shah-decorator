import { DEMO_DURATION_MS, DEMO_PRODUCT_LIMIT } from "./store-config.js";

const SESSION_KEY = "pakmarket_session_v1";
const USERS_KEY = "pakmarket_users_v1";
const DEMO_KEY = "pakmarket_temporary_demo_v1";
const WORKSPACE_KEYS = [
  "pakmarket_inventory_v1",
  "pakmarket_global_settings_v1",
  "pakmarket_categories_v1",
  "pakmarket_blogs_v1",
  "pakmarket_events_v1",
  "pakmarket_coming_v1",
  "pakmarket_pages_v1",
  "pakmarket_integrations_v1",
];

const readJson = (key, fallback = null) => {
  try { return JSON.parse(localStorage.getItem(key) || "null") ?? fallback; }
  catch { return fallback; }
};

const restoreWorkspace = (record) => {
  Object.entries(record?.backup || {}).forEach(([key, value]) => {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  });
};

export function clearTemporaryDemo() {
  const record = readJson(DEMO_KEY);
  if (!record) return false;
  restoreWorkspace(record);
  const users = readJson(USERS_KEY, []).filter((user) => user.id !== record.userId);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  const session = readJson(SESSION_KEY);
  if (session?.demoId === record.id) localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(DEMO_KEY);
  return true;
}

export function temporaryDemoSession() {
  const record = readJson(DEMO_KEY);
  if (!record) return null;
  if (Date.now() >= Number(record.expiresAt || 0)) {
    clearTemporaryDemo();
    return null;
  }
  const session = readJson(SESSION_KEY);
  return session?.demoId === record.id ? { ...session, remainingMs: record.expiresAt - Date.now() } : null;
}

export function startTemporaryDemo() {
  clearTemporaryDemo();
  const id = crypto.randomUUID();
  const userId = `demo-${id}`;
  const now = Date.now();
  const expiresAt = now + DEMO_DURATION_MS;
  const backup = Object.fromEntries(WORKSPACE_KEYS.map((key) => [key, localStorage.getItem(key)]));
  const record = { id, userId, createdAt: now, expiresAt, backup };
  localStorage.setItem(DEMO_KEY, JSON.stringify(record));

  localStorage.setItem("pakmarket_inventory_v1", "[]");
  localStorage.setItem("pakmarket_global_settings_v1", JSON.stringify({
    businessName: "My Demo Store",
    tagline: "Aap ka temporary WhatsApp store preview",
    primaryColor: "#007a55",
    theme: "emerald",
    demoMode: true,
    demoExpiresAt: new Date(expiresAt).toISOString(),
    deliveryMode: "owner_confirm",
    deliveryFee: "",
    demoProductLimit: DEMO_PRODUCT_LIMIT,
  }));
  const users = readJson(USERS_KEY, []);
  users.push({ id: userId, name: "Demo Owner", role: "admin", status: "approved", demo: true, expiresAt });
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  const session = {
    userId,
    role: "admin",
    name: "Demo Owner",
    email: "Temporary demo account",
    demo: true,
    demoId: id,
    createdAt: new Date(now).toISOString(),
    expiresAt,
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export function mountDemoExpiryGuard({ redirect = "/auth" } = {}) {
  const session = temporaryDemoSession();
  if (!session) return null;
  const remaining = Math.max(0, session.expiresAt - Date.now());
  window.setTimeout(() => {
    clearTemporaryDemo();
    location.replace(`${redirect}?demo=expired`);
  }, Math.min(remaining, 2_147_000_000));
  return session;
}

// Every page visit removes an expired demo before other modules read its data.
temporaryDemoSession();

window.PakMarketDemo = Object.freeze({
  clear: clearTemporaryDemo,
  current: temporaryDemoSession,
  start: startTemporaryDemo,
});
