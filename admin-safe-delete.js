const dialog = document.createElement("dialog");
dialog.className = "safe-delete-dialog";
dialog.innerHTML = `
  <form method="dialog" data-safe-delete-form>
    <span class="safe-delete-icon material-symbols-outlined">delete_forever</span>
    <div>
      <small>Danger zone</small>
      <h2>Delete <span data-safe-delete-subject>item</span> permanently?</h2>
    </div>
    <p>This action cannot be undone. To continue, type the exact name below:</p>
    <strong data-safe-delete-name></strong>
    <input type="text" data-safe-delete-input autocomplete="off" spellcheck="false" />
    <div class="safe-delete-actions">
      <button class="admin-btn secondary" type="button" data-safe-delete-cancel>Cancel</button>
      <button class="admin-btn danger" type="submit" data-safe-delete-confirm disabled>Delete permanently</button>
    </div>
  </form>`;
document.body.append(dialog);

const form = dialog.querySelector("[data-safe-delete-form]");
const input = dialog.querySelector("[data-safe-delete-input]");
const confirmButton = dialog.querySelector("[data-safe-delete-confirm]");
let expectedName = "";
let resolver = null;

function finish(result) {
  if (!dialog.open) return;
  dialog.close();
  resolver?.(result);
  resolver = null;
}

window.requestAdminDelete = ({ name, subject = "item" }) =>
  new Promise((resolve) => {
    expectedName = String(name || "").trim();
    resolver = resolve;
    dialog.querySelector("[data-safe-delete-name]").textContent = expectedName;
    dialog.querySelector("[data-safe-delete-subject]").textContent = subject;
    input.value = "";
    confirmButton.disabled = true;
    dialog.showModal();
    requestAnimationFrame(() => input.focus());
  });

input.addEventListener("input", () => {
  confirmButton.disabled = input.value !== expectedName;
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (input.value === expectedName) finish(true);
});

dialog.querySelector("[data-safe-delete-cancel]").addEventListener("click", () =>
  finish(false),
);
dialog.addEventListener("cancel", (event) => {
  event.preventDefault();
  finish(false);
});
