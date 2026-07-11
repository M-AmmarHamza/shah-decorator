import "./admin-blog-cover.css";

const slugify = (value) =>
  String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const toDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

async function optimizeCover(file) {
  if (!file?.type.startsWith("image/")) throw new Error("Choose an image file.");
  if (file.size > 12 * 1024 * 1024)
    throw new Error("Source image must be smaller than 12MB.");
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 630;
  const context = canvas.getContext("2d");
  const targetRatio = 1200 / 630;
  const sourceRatio = bitmap.width / bitmap.height;
  let sx = 0,
    sy = 0,
    sw = bitmap.width,
    sh = bitmap.height;
  if (sourceRatio > targetRatio) {
    sw = bitmap.height * targetRatio;
    sx = (bitmap.width - sw) / 2;
  } else {
    sh = bitmap.width / targetRatio;
    sy = (bitmap.height - sh) / 2;
  }
  context.drawImage(bitmap, sx, sy, sw, sh, 0, 0, 1200, 630);
  bitmap.close();
  const blob = await new Promise((resolve) =>
    canvas.toBlob(resolve, "image/webp", 0.86),
  );
  return new File([blob], `${slugify(file.name.replace(/\.[^.]+$/, ""))}.webp`, {
    type: "image/webp",
  });
}

async function store(file) {
  const optimized = await optimizeCover(file);
  if (!window.PakMarketDB?.configured) return toDataUrl(optimized);
  const path = `featured/${crypto.randomUUID()}-${optimized.name}`;
  await window.PakMarketDB.upload("blog-media", optimized, path);
  return window.PakMarketDB.publicUrl("blog-media", path);
}

function hidden(form, name, value = "") {
  let input = form.elements[name];
  if (!input) {
    input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    form.append(input);
  }
  input.value = value || "";
  return input;
}

function mount(form, item = {}) {
  form.querySelector("[data-blog-cover]")?.remove();
  const image = form.elements.image;
  image.required = false;
  const originalLabel = image.closest("label");
  originalLabel.hidden = true;
  const alt = hidden(form, "coverAlt", item.coverAlt || "");
  const slug = hidden(form, "coverSlug", item.coverSlug || "");
  originalLabel.insertAdjacentHTML(
    "afterend",
    `<section class="blog-cover-studio" data-blog-cover>
      <div class="blog-cover-head"><div><strong>Featured Image</strong><small>Standard: 1200 × 630px WebP · optimized for blog cards and social sharing.</small></div><label class="admin-btn primary"><span class="material-symbols-outlined">add_photo_alternate</span>Upload featured image<input type="file" accept="image/*" data-blog-cover-upload></label></div>
      <div class="blog-cover-body">
        <div class="blog-cover-preview" data-blog-cover-preview>${image.value ? `<img src="${image.value}" alt="${alt.value || item.title || "Blog featured image"}">` : '<span class="material-symbols-outlined">panorama</span><small>No featured image uploaded</small>'}</div>
        <div class="blog-cover-fields"><label>Image alt text<input type="text" data-blog-cover-alt required maxlength="125" value="${String(alt.value).replaceAll('"', "&quot;")}" placeholder="Describe the image clearly"></label><label>Image slug<input type="text" data-blog-cover-slug required maxlength="100" value="${String(slug.value).replaceAll('"', "&quot;")}" placeholder="blog-featured-image"></label><span>Center crop is used. Keep the important subject away from the extreme edges.</span></div>
      </div>
    </section>`,
  );
  const studio = originalLabel.nextElementSibling;
  const preview = studio.querySelector("[data-blog-cover-preview]");
  studio.querySelector("[data-blog-cover-alt]").addEventListener("input", (event) => {
    alt.value = event.target.value;
    const previewImage = preview.querySelector("img");
    if (previewImage) previewImage.alt = event.target.value;
  });
  studio.querySelector("[data-blog-cover-slug]").addEventListener("input", (event) => {
    event.target.value = slugify(event.target.value);
    slug.value = event.target.value;
  });
  studio.querySelector("[data-blog-cover-upload]").addEventListener("change", async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      window.toast?.("Optimizing featured image to 1200 × 630px…");
      image.value = await store(file);
      if (!slug.value) slug.value = slugify(file.name.replace(/\.[^.]+$/, ""));
      studio.querySelector("[data-blog-cover-slug]").value = slug.value;
      preview.innerHTML = `<img src="${image.value}" alt="${alt.value || "Blog featured image"}">`;
      window.toast?.("Featured image ready. Add alt text before saving.");
    } catch (error) {
      window.toast?.(error.message);
    }
    event.target.value = "";
  });
}

window.PakMarketBlogCover = { mount };
