import { defineConfig, loadEnv } from "vite";
import { resolve } from "node:path";
import {
  PAGE_SEO,
  cleanInternalLinks,
  normalizeSiteUrl,
  replaceSeoHead,
} from "./seo.config.js";

const pages = [
  "index",
  "products",
  "services",
  "product",
  "blog",
  "blog-detail",
  "about",
  "contact",
  "payment",
  "return-policy",
  "auth",
  "admin",
  "privacy-policy",
  "terms",
  "shipping-policy",
  "profile",
  "404",
];

const pageKeyFromPath = (path = "") => {
  const filename = path.split("/").filter(Boolean).at(-1) || "index.html";
  return filename.replace(/\.html$/i, "") || "index";
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const siteUrl = normalizeSiteUrl(
    env.VITE_SITE_URL || process.env.VITE_SITE_URL || "https://pakmarket.pk",
  );

  return {
    plugins: [
      {
        name: "pakmarket-seo",
        transformIndexHtml: {
          order: "pre",
          handler(html, context) {
            const key = pageKeyFromPath(context.path);
            const page = PAGE_SEO[key];
            return cleanInternalLinks(
              page ? replaceSeoHead(html, page, siteUrl) : html,
            );
          },
        },
      },
    ],
    build: {
      rollupOptions: {
        input: Object.fromEntries(
          pages.map((page) => [page, resolve(import.meta.dirname, `${page}.html`)]),
        ),
      },
    },
    server: { port: 4173, host: "127.0.0.1" },
  };
});
