import "./supabase-client.js";
import "./floating-actions.js";
import { startTemporaryDemo, temporaryDemoSession } from "./demo-session.js";
import { demoDurationLabel } from "./store-config.js";
await import("./auth.js");

const demoButton = document.querySelector("[data-start-temporary-demo]");
demoButton?.addEventListener("click", () => {
  const session = startTemporaryDemo();
  demoButton.disabled = true;
  demoButton.querySelector("span:last-child").textContent = "Opening demo…";
  location.href = `/admin?demo=${encodeURIComponent(session.demoId)}`;
});

const demoStatus = new URLSearchParams(location.search).get("demo");
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
