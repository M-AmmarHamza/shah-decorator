import { SITE_CONFIG } from "./seo.config.js";

const mountFloatingActions = () => {
  document.querySelectorAll(".sticky-whatsapp").forEach((item) => item.remove());
  if (document.querySelector(".floating-actions")) return;

  let whatsappNumber = SITE_CONFIG.whatsapp;
  try {
    whatsappNumber =
      JSON.parse(localStorage.getItem("pakmarket_global_settings_v1") || "{}").whatsapp ||
      whatsappNumber;
  } catch {}

  const actions = document.createElement("div");
  actions.className = "floating-actions";
  actions.setAttribute("aria-label", "Quick actions");
  actions.innerHTML = `
    <a class="floating-action floating-whatsapp" href="https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Hello PakMarket, I need some help.")}" target="_blank" rel="noreferrer" aria-label="Contact PakMarket on WhatsApp">
      <svg viewBox="0 0 32 32" aria-hidden="true"><path fill="currentColor" d="M16.04 4.5A11.3 11.3 0 0 0 6.3 21.52L4.8 27l5.61-1.47A11.3 11.3 0 1 0 16.04 4.5Zm0 20.53c-1.9 0-3.76-.52-5.37-1.51l-.39-.23-3.33.87.89-3.24-.25-.4a9.23 9.23 0 1 1 8.45 4.51Zm5.06-6.92c-.28-.14-1.64-.81-1.89-.9-.26-.09-.44-.14-.63.14-.18.28-.71.9-.87 1.09-.16.18-.32.21-.6.07-.27-.14-1.17-.43-2.22-1.37a8.34 8.34 0 0 1-1.54-1.91c-.16-.28-.02-.43.12-.57.13-.12.28-.32.42-.48.14-.16.18-.28.28-.46.09-.19.04-.35-.03-.49-.07-.14-.62-1.51-.85-2.07-.23-.54-.46-.47-.63-.48h-.53c-.18 0-.48.07-.73.35-.25.28-.96.94-.96 2.29 0 1.34.98 2.64 1.12 2.83.14.18 1.93 2.94 4.67 4.12.65.28 1.16.45 1.56.58.65.21 1.25.18 1.72.11.52-.08 1.63-.67 1.86-1.31.23-.65.23-1.21.16-1.32-.07-.12-.25-.19-.53-.33Z"/></svg>
    </a>
    <button class="floating-action floating-top" type="button" aria-label="Back to top">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.4" d="m7 14 5-5 5 5"/></svg>
    </button>`;
  document.body.appendChild(actions);
  if (!whatsappNumber) actions.querySelector(".floating-whatsapp")?.remove();

  const topButton = actions.querySelector(".floating-top");
  const updateTopButton = () =>
    topButton.classList.toggle("show", window.scrollY > 320);
  window.addEventListener("scroll", updateTopButton, { passive: true });
  topButton.addEventListener("click", () =>
    window.scrollTo({ top: 0, behavior: "smooth" }),
  );
  updateTopButton();
};

if (document.readyState === "loading")
  document.addEventListener("DOMContentLoaded", mountFloatingActions, { once: true });
else mountFloatingActions();
