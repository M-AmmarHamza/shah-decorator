import "./supabase-client.js";
import { mountDemoExpiryGuard, temporaryDemoSession } from "./demo-session.js";
import { DEMO_PRODUCT_LIMIT } from "./store-config.js";
import "./admin-integrations.css";
import "./admin-themes.css";

const db = window.PakMarketDB;
const isLocalPreview = ["localhost", "127.0.0.1", "::1"].includes(
  location.hostname,
);
let session = null;
if (db.configured) {
  const authSession = await db.session();
  if (authSession) {
    try {
      const profile = await db.profile();
      if (
        profile?.approval === "approved" &&
        [
          "content_editor",
          "product_manager",
          "order_manager",
          "seo_manager",
          "admin",
          "super_admin",
        ].includes(profile.role)
      )
        session = {
          userId: profile.id,
          role: profile.role,
          name: profile.full_name,
          email: authSession.user.email,
        };
    } catch {}
  }
} else if (isLocalPreview || temporaryDemoSession()) {
  try {
    session = JSON.parse(localStorage.getItem("pakmarket_session_v1"));
  } catch {}
}
if (!session) {
  location.replace("auth.html?next=admin");
  throw new Error("Admin authentication required");
}
window.PAKMARKET_SESSION = session;
const demoSession = mountDemoExpiryGuard();
if (demoSession) {
  document.body.dataset.demoAdmin = "true";
  const banner = document.createElement("div");
  banner.className = "admin-demo-banner";
  banner.innerHTML = `<strong>Temporary demo</strong><span data-demo-countdown></span><small>Maximum ${DEMO_PRODUCT_LIMIT} products · data deletes automatically</small>`;
  document.body.appendChild(banner);
  const countdown = banner.querySelector("[data-demo-countdown]");
  const updateCountdown = () => {
    const remaining = Math.max(0, demoSession.expiresAt - Date.now());
    const hours = Math.floor(remaining / 3_600_000);
    const minutes = Math.floor((remaining % 3_600_000) / 60_000);
    const seconds = Math.floor((remaining % 60_000) / 1000);
    countdown.textContent = `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")} remaining`;
  };
  updateCountdown();
  window.setInterval(updateCountdown, 1000);
}
await import("./admin-safe-delete.js");
await import("./admin-blog-editor.js");
await import("./admin-categories.js");
await import("./admin-image-studio.js");
await import("./admin-blog-cover.js");
await import("./admin.js");
await import("./admin-pages.js");
await import("./admin-content.js");
await import("./admin-pro.js");
await import("./admin-integrations.js");
