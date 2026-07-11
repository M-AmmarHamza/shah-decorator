import "./supabase-client.js";

const db = window.PakMarketDB;
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
} else {
  try {
    session = JSON.parse(localStorage.getItem("pakmarket_session_v1"));
  } catch {}
}
if (!session) {
  location.replace("auth.html?next=admin");
  throw new Error("Admin authentication required");
}
window.PAKMARKET_SESSION = session;
await import("./admin-safe-delete.js");
await import("./admin-blog-editor.js");
await import("./admin-categories.js");
await import("./admin.js");
await import("./admin-pages.js");
await import("./admin-content.js");
await import("./admin-pro.js");
