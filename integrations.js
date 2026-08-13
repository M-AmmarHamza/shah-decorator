const KEY = "pakmarket_integrations_v1";
const CONSENT_KEY = "pakmarket_consent_v1";
const read = (key, fallback = {}) => { try { return JSON.parse(localStorage.getItem(key) || "null") ?? fallback; } catch { return fallback; } };
const config = read(KEY), consent = read(CONSENT_KEY, null);
const inject = (id, src) => { if (document.getElementById(id)) return; const script = document.createElement("script"); script.id = id; script.async = true; script.src = src; document.head.appendChild(script); };

function activateAnalytics() {
  if (!consent?.analytics) return;
  if (config.gtm?.enabled && /^GTM-[A-Z0-9]+$/i.test(config.gtm.id || "")) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
    inject("pakmarket-gtm", `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(config.gtm.id)}`);
    return;
  }
  if (config.ga4?.enabled && /^G-[A-Z0-9]+$/i.test(config.ga4.id || "")) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = (...args) => window.dataLayer.push(args);
    window.gtag("js", new Date()); window.gtag("config", config.ga4.id, { anonymize_ip: true });
    inject("pakmarket-ga4", `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(config.ga4.id)}`);
  }
  if (config.clarity?.enabled && /^[a-z0-9]+$/i.test(config.clarity.id || "")) {
    window.clarity = window.clarity || function () { (window.clarity.q = window.clarity.q || []).push(arguments); };
    inject("pakmarket-clarity", `https://www.clarity.ms/tag/${encodeURIComponent(config.clarity.id)}`);
  }
}
function captureAttribution() {
  const params = new URLSearchParams(location.search);
  const touch = Object.fromEntries(["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"].filter((key) => params.has(key)).map((key) => [key, params.get(key)]));
  if (!Object.keys(touch).length) return;
  const existing = read("pakmarket_attribution_v1", {});
  localStorage.setItem("pakmarket_attribution_v1", JSON.stringify({ first: existing.first || touch, last: touch }));
}
function mountConsent() {
  if (consent || document.body.dataset.page === "admin") return;
  const banner = document.createElement("aside"); banner.className = "consent-banner"; banner.setAttribute("aria-label", "Privacy choices");
  banner.innerHTML = '<div><strong>Privacy choices</strong><p>Essential storage se website chalti hai. Analytics sirf aap ki permission ke baad load hogi.</p></div><div><button type="button" data-consent-essential>Essential only</button><button type="button" data-consent-accept>Allow analytics</button></div>';
  document.body.appendChild(banner);
  banner.addEventListener("click", (event) => { const accepted = event.target.closest("[data-consent-accept]"); const essential = event.target.closest("[data-consent-essential]"); if (!accepted && !essential) return; localStorage.setItem(CONSENT_KEY, JSON.stringify({ essential: true, analytics: Boolean(accepted), updatedAt: new Date().toISOString() })); banner.remove(); if (accepted) location.reload(); });
}
window.PakMarketIntegrations = Object.freeze({ track(eventName, properties = {}) { const eventId = crypto.randomUUID(); if (consent?.analytics) { window.dataLayer?.push({ event: eventName, event_id: eventId, ...properties }); window.gtag?.("event", eventName, { event_id: eventId, ...properties }); } return eventId; } });
captureAttribution(); activateAnalytics(); document.addEventListener("DOMContentLoaded", mountConsent);
