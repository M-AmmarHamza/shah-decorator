import "./admin-blog-editor.css";

const commandIcons = [
  ["undo", "undo", "Undo"],
  ["redo", "redo", "Redo"],
  ["bold", "format_bold", "Bold"],
  ["italic", "format_italic", "Italic"],
  ["underline", "format_underlined", "Underline"],
  ["justifyLeft", "format_align_left", "Align left"],
  ["justifyCenter", "format_align_center", "Align center"],
  ["justifyRight", "format_align_right", "Align right"],
  ["justifyFull", "format_align_justify", "Justify"],
  ["insertUnorderedList", "format_list_bulleted", "Bullet list"],
  ["insertOrderedList", "format_list_numbered", "Numbered list"],
  ["outdent", "format_indent_decrease", "Decrease indent"],
  ["indent", "format_indent_increase", "Increase indent"],
];

const button = ([command, icon, title]) =>
  `<button type="button" data-editor-command="${command}" title="${title}" aria-label="${title}"><span class="material-symbols-outlined">${icon}</span></button>`;

function editorMarkup(options = {}) {
  const contextClass = options.context === "product" ? " product-description-editor" : "";
  const placeholder = options.placeholder || "Start writing your article...";
  return `<section class="blog-editor-shell${contextClass}" data-blog-editor>
    <div class="blog-editor-menu">
      <button type="button" data-editor-action="new">File</button>
      <button type="button" data-editor-command="undo">Edit</button>
      <button type="button" data-editor-action="preview">View</button>
      <button type="button" data-editor-action="link">Insert</button>
      <button type="button" data-editor-command="removeFormat">Format</button>
      <button type="button" data-editor-action="wordcount">Tools</button>
    </div>
    <div class="blog-editor-toolbar">
      ${commandIcons.slice(0, 2).map(button).join("")}
      <select data-editor-block aria-label="Text style"><option value="p">Paragraph</option><option value="h2">Heading 2</option><option value="h3">Heading 3</option><option value="h4">Heading 4</option><option value="blockquote">Quote</option></select>
      <select data-editor-font aria-label="Font family"><option value="Arial">Arial</option><option value="Georgia">Georgia</option><option value="Tahoma">Tahoma</option><option value="'Noto Nastaliq Urdu'">Nastaliq Urdu</option></select>
      <select data-editor-size aria-label="Font size"><option value="3">16px</option><option value="4">18px</option><option value="5">24px</option></select>
      ${commandIcons.slice(2).map(button).join("")}
    </div>
    <div class="blog-editor-insertbar">
      <button type="button" data-editor-action="link" title="Insert link"><span class="material-symbols-outlined">link</span><span>Link</span></button>
      <label title="Upload from desktop or mobile gallery"><span class="material-symbols-outlined">image</span><span>Upload image</span><input type="file" accept="image/*" data-editor-image></label>
      <label title="Take a photo on mobile"><span class="material-symbols-outlined">photo_camera</span><span>Mobile camera</span><input type="file" accept="image/*" capture="environment" data-editor-camera></label>
      <button type="button" data-editor-command="insertHorizontalRule" title="Divider"><span class="material-symbols-outlined">horizontal_rule</span></button>
      <button type="button" data-editor-action="preview" title="Preview"><span class="material-symbols-outlined">visibility</span></button>
      <button type="button" data-editor-action="code" title="HTML code"><span class="material-symbols-outlined">code</span></button>
      <span data-editor-count>0 words</span>
    </div>
    <div class="blog-editor-canvas" contenteditable="true" data-editor-canvas data-placeholder="${placeholder.replace(/["<>]/g, "")}"></div>
  </section>`;
}

const readFile = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

async function uploadImage(file, bucket = "blog-media") {
  if (!file?.type.startsWith("image/")) throw new Error("Choose an image file.");
  if (file.size > 8 * 1024 * 1024)
    throw new Error("Image must be smaller than 8MB.");
  if (!window.PakMarketDB?.configured) return readFile(file);
  const safeName = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-");
  const path = `${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}-${safeName}`;
  await window.PakMarketDB.upload(bucket, file, path);
  return window.PakMarketDB.publicUrl(bucket, path);
}

function mount(textarea, options = {}) {
  if (!textarea) return;
  if (textarea.dataset.richMounted) {
    const existingShell = textarea.previousElementSibling;
    const existingCanvas = existingShell?.querySelector("[data-editor-canvas]");
    const existingCounter = existingShell?.querySelector("[data-editor-count]");
    if (existingCanvas) existingCanvas.innerHTML = textarea.value || "";
    if (existingCounter && existingCanvas) {
      const words = (existingCanvas.innerText.match(/\S+/g) || []).length;
      existingCounter.textContent = `${words} word${words === 1 ? "" : "s"}`;
    }
    return;
  }
  textarea.dataset.richMounted = "true";
  textarea.required = false;
  textarea.hidden = true;
  textarea.insertAdjacentHTML("beforebegin", editorMarkup(options));
  const shell = textarea.previousElementSibling;
  const canvas = shell.querySelector("[data-editor-canvas]");
  const counter = shell.querySelector("[data-editor-count]");
  canvas.innerHTML = textarea.value || "";
  let savedRange = null;

  const sync = () => {
    textarea.value = canvas.innerHTML.trim();
    const words = (canvas.innerText.match(/\S+/g) || []).length;
    counter.textContent = `${words} word${words === 1 ? "" : "s"}`;
  };
  const saveRange = () => {
    const selection = getSelection();
    if (selection?.rangeCount && canvas.contains(selection.anchorNode))
      savedRange = selection.getRangeAt(0).cloneRange();
  };
  const restoreRange = () => {
    canvas.focus();
    if (!savedRange) return;
    const selection = getSelection();
    selection.removeAllRanges();
    selection.addRange(savedRange);
  };
  const run = (command, value = null) => {
    restoreRange();
    document.execCommand(command, false, value);
    sync();
    saveRange();
  };

  canvas.addEventListener("input", sync);
  canvas.addEventListener("keyup", saveRange);
  canvas.addEventListener("mouseup", saveRange);
  shell.addEventListener("mousedown", (event) => {
    if (event.target.closest("button,label,select")) saveRange();
  });
  shell.addEventListener("click", (event) => {
    const command = event.target.closest("[data-editor-command]")?.dataset
      .editorCommand;
    if (command) run(command);
    const action = event.target.closest("[data-editor-action]")?.dataset
      .editorAction;
    if (action === "link") {
      const url = prompt("Enter the complete link URL:", "https://");
      if (url && /^https?:\/\//i.test(url)) run("createLink", url);
    }
    if (action === "preview") shell.classList.toggle("preview-mode");
    if (action === "code") {
      const coding = shell.classList.toggle("code-mode");
      if (coding) canvas.textContent = textarea.value;
      else canvas.innerHTML = canvas.textContent;
      sync();
    }
    if (action === "new" && !canvas.innerText.trim()) canvas.focus();
    if (action === "wordcount")
      window.toast?.(`${counter.textContent} in this article.`);
  });
  shell.querySelector("[data-editor-block]").addEventListener("change", (event) =>
    run("formatBlock", event.target.value),
  );
  shell.querySelector("[data-editor-font]").addEventListener("change", (event) =>
    run("fontName", event.target.value),
  );
  shell.querySelector("[data-editor-size]").addEventListener("change", (event) =>
    run("fontSize", event.target.value),
  );
  shell.querySelectorAll("[data-editor-image],[data-editor-camera]").forEach((picker) =>
    picker.addEventListener("change", async () => {
      const file = picker.files?.[0];
      if (!file) return;
      try {
        window.toast?.("Uploading image...");
        const url = await uploadImage(file, options.bucket || "blog-media");
        restoreRange();
        document.execCommand(
          "insertHTML",
          false,
          `<figure><img src="${url}" alt="${file.name.replace(/[\"<>]/g, "")}"><figcaption>Write image caption</figcaption></figure><p><br></p>`,
        );
        sync();
        window.toast?.("Image inserted.");
      } catch (error) {
        window.toast?.(error.message);
      }
      picker.value = "";
    }),
  );
  sync();
}

window.PakMarketBlogEditor = { mount };
