import "./admin-image-studio.css";

const slugify = (value) =>
  String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

async function resizeSquare(file) {
  if (!file?.type.startsWith("image/")) throw new Error("Choose image files only.");
  if (file.size > 12 * 1024 * 1024)
    throw new Error("Each source image must be smaller than 12MB.");
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1080;
  const context = canvas.getContext("2d");
  const sourceSize = Math.min(bitmap.width, bitmap.height);
  const sourceX = (bitmap.width - sourceSize) / 2;
  const sourceY = (bitmap.height - sourceSize) / 2;
  context.fillStyle = "#fff";
  context.fillRect(0, 0, 1080, 1080);
  context.drawImage(
    bitmap,
    sourceX,
    sourceY,
    sourceSize,
    sourceSize,
    0,
    0,
    1080,
    1080,
  );
  bitmap.close();
  const blob = await new Promise((resolve) =>
    canvas.toBlob(resolve, "image/webp", 0.86),
  );
  return new File([blob], `${slugify(file.name.replace(/\.[^.]+$/, ""))}.webp`, {
    type: "image/webp",
  });
}

async function storeImage(file, folder) {
  const resized = await resizeSquare(file);
  if (!window.PakMarketDB?.configured) return fileToDataUrl(resized);
  const path = `${folder}/${crypto.randomUUID()}-${resized.name}`;
  await window.PakMarketDB.upload("product-media", resized, path);
  return window.PakMarketDB.publicUrl("product-media", path);
}

function ensureHidden(form, name) {
  let input = form.elements[name];
  if (!input) {
    input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    form.append(input);
  }
  return input;
}

function studioMarkup(multiple) {
  return `<section class="image-studio" data-image-studio>
    <div class="image-studio-head"><div><strong>${multiple ? "Product Image Gallery" : "Upcoming Image"}</strong><small>Every upload is automatically cropped and optimized to 1080 × 1080px WebP.</small></div><label class="admin-btn primary"><span class="material-symbols-outlined">add_photo_alternate</span>${multiple ? "Upload images" : "Upload image"}<input type="file" accept="image/*" ${multiple ? "multiple" : ""} data-studio-upload></label></div>
    <div class="image-studio-list" data-studio-list></div>
    <p class="image-studio-empty" data-studio-empty>Upload ${multiple ? "one or more product images" : "an upcoming image"}. Alt text and image slug are required.</p>
  </section>`;
}

function mount(form, initialItems, { multiple, folder }) {
  form.querySelector("[data-image-studio]")?.remove();
  const imageInput = form.elements.image;
  imageInput.required = false;
  const imageAltInput = ensureHidden(form, "imageAlt");
  const imageSlugInput = ensureHidden(form, "imageSlug");
  const galleryInput = multiple ? form.elements.gallery : null;
  const galleryMetaInput = multiple ? ensureHidden(form, "galleryMeta") : null;
  imageInput.closest("label")?.setAttribute("hidden", "");
  galleryInput?.closest("label")?.setAttribute("hidden", "");
  const visibleAlt = form.querySelector('label:has([name="imageAlt"])');
  visibleAlt?.setAttribute("hidden", "");

  const anchor = multiple
    ? form.querySelector('[data-form-panel="details"] .product-advanced')
    : imageInput.closest("label");
  anchor.insertAdjacentHTML("beforebegin", studioMarkup(multiple));
  const studio = anchor.previousElementSibling;
  const list = studio.querySelector("[data-studio-list]");
  let items = initialItems.filter((item) => item?.url);

  const sync = () => {
    const primary = items.find((item) => item.primary) || items[0];
    if (items.length && !items.some((item) => item.primary)) items[0].primary = true;
    imageInput.value = primary?.url || "";
    imageAltInput.value = primary?.alt || "";
    imageSlugInput.value = primary?.slug || "";
    if (galleryInput)
      galleryInput.value = items
        .filter((item) => item !== primary)
        .map((item) => item.url)
        .join("\n");
    if (galleryMetaInput) galleryMetaInput.value = JSON.stringify(items);
  };

  const render = () => {
    studio.querySelector("[data-studio-empty]").hidden = items.length > 0;
    list.innerHTML = items
      .map(
        (item, index) => `<article class="image-studio-card" data-studio-index="${index}">
          <img src="${item.url}" alt="${item.alt || "Image preview"}">
          <div class="image-studio-fields">
            <label>Alt text<input type="text" value="${String(item.alt || "").replaceAll('"', "&quot;")}" data-image-alt required maxlength="125" placeholder="Describe the image for accessibility"></label>
            <label>Image slug<input type="text" value="${String(item.slug || "").replaceAll('"', "&quot;")}" data-image-slug required maxlength="100" placeholder="product-front-view"></label>
          </div>
          <div class="image-studio-actions">${multiple ? `<label><input type="radio" name="studioPrimary" ${item.primary ? "checked" : ""} data-image-primary>Primary</label>` : '<span class="image-size-badge">1080 × 1080</span>'}<button type="button" data-image-remove title="Remove image"><span class="material-symbols-outlined">delete</span></button></div>
        </article>`,
      )
      .join("");
    sync();
  };

  list.addEventListener("input", (event) => {
    const index = Number(event.target.closest("[data-studio-index]")?.dataset.studioIndex);
    if (!Number.isInteger(index)) return;
    if (event.target.matches("[data-image-alt]")) items[index].alt = event.target.value;
    if (event.target.matches("[data-image-slug]"))
      items[index].slug = slugify(event.target.value);
    if (event.target.matches("[data-image-primary]"))
      items.forEach((item, itemIndex) => (item.primary = itemIndex === index));
    sync();
  });
  list.addEventListener("click", (event) => {
    const remove = event.target.closest("[data-image-remove]");
    if (!remove) return;
    const index = Number(remove.closest("[data-studio-index]").dataset.studioIndex);
    items.splice(index, 1);
    if (items.length && !items.some((item) => item.primary)) items[0].primary = true;
    render();
  });
  studio.querySelector("[data-studio-upload]").addEventListener("change", async (event) => {
    const files = [...event.target.files];
    if (!files.length) return;
    try {
      window.toast?.(`Optimizing ${files.length} image${files.length > 1 ? "s" : ""}…`);
      const uploaded = [];
      for (const file of multiple ? files : files.slice(0, 1)) {
        const baseSlug = slugify(file.name.replace(/\.[^.]+$/, ""));
        uploaded.push({
          url: await storeImage(file, folder),
          alt: "",
          slug: baseSlug,
          primary: !items.length && !uploaded.length,
          width: 1080,
          height: 1080,
        });
      }
      items = multiple ? [...items, ...uploaded] : uploaded;
      render();
      window.toast?.("1080 × 1080 image ready. Add alt text before saving.");
    } catch (error) {
      window.toast?.(error.message);
    }
    event.target.value = "";
  });
  render();
}

function productItems(product) {
  try {
    const metadata = JSON.parse(product?.galleryMeta || "[]");
    if (metadata.length) return metadata;
  } catch {}
  return [
    product?.image && {
      url: product.image,
      alt: product.imageAlt || product.name,
      slug: product.imageSlug || `${product.slug || slugify(product.name)}-main`,
      primary: true,
      width: 1080,
      height: 1080,
    },
    ...String(product?.gallery || "")
      .split(/\r?\n/)
      .filter(Boolean)
      .map((url, index) => ({
        url,
        alt: `${product.name} image ${index + 2}`,
        slug: `${product.slug || slugify(product.name)}-${index + 2}`,
        primary: false,
        width: 1080,
        height: 1080,
      })),
  ].filter(Boolean);
}

window.PakMarketImageStudio = {
  mountProduct(form, product) {
    mount(form, productItems(product), {
      multiple: true,
      folder: `products/${product?.id || "drafts"}`,
    });
  },
  mountUpcoming(form, item) {
    mount(
      form,
      item?.image
        ? [
            {
              url: item.image,
              alt: item.imageAlt || item.name,
              slug: item.imageSlug || slugify(item.name),
              primary: true,
              width: 1080,
              height: 1080,
            },
          ]
        : [],
      { multiple: false, folder: "upcoming" },
    );
  },
};
