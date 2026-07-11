import {defineConfig} from "vite";
import {resolve} from "node:path";

const pages=["index","products","product","blog","blog-detail","about","contact","payment","return-policy","auth","admin","privacy-policy","terms","shipping-policy","profile"];
export default defineConfig({
  build:{rollupOptions:{input:Object.fromEntries(pages.map(page=>[page,resolve(import.meta.dirname,`${page}.html`)]))}},
  server:{port:4173,host:"127.0.0.1"}
});
