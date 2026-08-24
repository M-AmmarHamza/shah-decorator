import "./supabase-client.js";
import "./floating-actions.js";
import "./auth-demo.css";
import { startTemporaryDemo, temporaryDemoSession } from "./demo-session.js";
import { demoDurationLabel, demoDurationText } from "./store-config.js";
import { applyStoreTheme } from "./theme-config.js";
try {
  const settings = JSON.parse(localStorage.getItem("pakmarket_global_settings_v1") || "{}");
  applyStoreTheme(settings.theme, settings.primaryColor);
} catch {
  applyStoreTheme("emerald");
}
await import("./auth.js");

const demoButton = document.querySelector("[data-start-temporary-demo]");
demoButton?.addEventListener("click", () => {
  const session = startTemporaryDemo();
  demoButton.disabled = true;
  demoButton.querySelector("span:last-child").textContent = "Opening demo…";
  location.href = `/admin?demo=${encodeURIComponent(session.demoId)}`;
});

const demoStatus = new URLSearchParams(location.search).get("demo");
const demoCard = document.querySelector("[data-temporary-demo]");
if (demoStatus === "start" || temporaryDemoSession()) {
  demoCard?.removeAttribute("hidden");
}
if (["expired", "ended"].includes(demoStatus)) {
  const message = document.querySelector("[data-auth-message]");
  message.hidden = false;
  message.className = "auth-message pending";
  message.textContent = demoStatus === "expired"
    ? `Your ${demoDurationLabel} demo expired and its temporary data was deleted.`
    : "The temporary demo ended and its data was deleted.";
} else if (temporaryDemoSession()) {
  document.querySelector("[data-demo-active]")?.removeAttribute("hidden");
}

document.querySelectorAll("[data-demo-duration]").forEach((node) => {
  node.textContent = demoDurationLabel;
});
document.querySelectorAll("[data-demo-duration-text]").forEach((node) => {
  node.textContent = demoDurationText;
});
