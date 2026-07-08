const WHATSAPP_NUMBER = "923161013991";

function whatsappUrl(message) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function showToast(message) {
  let toast = document.querySelector(".toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 2400);
}

document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.dataset.page || "";

  document.querySelectorAll("[data-page-link]").forEach((link) => {
    if (link.dataset.pageLink === page) link.classList.add("active");
  });

  document.querySelectorAll("[data-whatsapp]").forEach((link) => {
    const item = link.dataset.item || "PakMarket products";
    link.setAttribute("href", whatsappUrl(`Assalam o Alaikum, I want to order ${item}. Please share details.`));
    link.setAttribute("target", "_blank");
    link.setAttribute("rel", "noreferrer");
  });

  const menuButton = document.querySelector("[data-menu-button]");
  const mobilePanel = document.querySelector("[data-mobile-panel]");
  if (menuButton && mobilePanel) {
    menuButton.addEventListener("click", () => {
      const isOpen = mobilePanel.classList.toggle("open");
      document.body.classList.toggle("menu-open", isOpen);
      menuButton.setAttribute("aria-expanded", String(isOpen));
      menuButton.querySelector(".material-symbols-outlined").textContent = isOpen ? "close" : "menu";
    });
  }

  document.querySelectorAll("[data-accordion-trigger]").forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const item = trigger.closest("[data-accordion-item]");
      item.classList.toggle("open");
      const icon = trigger.querySelector(".material-symbols-outlined");
      if (icon) icon.textContent = item.classList.contains("open") ? "expand_less" : "expand_more";
    });
  });

  document.querySelectorAll("[data-faq-trigger]").forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const item = trigger.closest(".faq-item");
      item.classList.toggle("open");
      const icon = trigger.querySelector(".material-symbols-outlined");
      if (icon) icon.textContent = item.classList.contains("open") ? "remove" : "add";
    });
  });

  document.querySelectorAll("[data-gallery-thumb]").forEach((thumb) => {
    thumb.addEventListener("click", () => {
      const main = document.querySelector("[data-gallery-main]");
      const image = thumb.querySelector("img");
      if (!main || !image) return;
      main.src = image.src;
      main.alt = image.alt;
      document.querySelectorAll("[data-gallery-thumb]").forEach((item) => item.classList.remove("active"));
      thumb.classList.add("active");
    });
  });

  const filterButtons = document.querySelectorAll("[data-filter]");
  const products = document.querySelectorAll("[data-product-card]");
  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      filterButtons.forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      const filter = button.dataset.filter;
      products.forEach((card) => {
        const categories = (card.dataset.category || "").split(" ");
        card.style.display = filter === "all" || categories.includes(filter) ? "" : "none";
      });
    });
  });

  document.querySelectorAll("[data-search-products]").forEach((input) => {
    input.addEventListener("input", () => {
      const term = input.value.trim().toLowerCase();
      products.forEach((card) => {
        const text = card.textContent.toLowerCase();
        card.style.display = text.includes(term) ? "" : "none";
      });
    });
  });

  document.querySelectorAll("[data-subscribe-form]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      form.reset();
      showToast("Thanks. You are on the PakMarket updates list.");
    });
  });
});
