import "./floating-actions.js";

const waitForDB = () =>
  window.PakMarketDB
    ? Promise.resolve(window.PakMarketDB)
    : new Promise((resolve) =>
        window.addEventListener(
          "pakmarket:db-ready",
          (event) => resolve(event.detail),
          { once: true },
        ),
      );
const db = await waitForDB(),
  session = await db.session();
if (!session) {
  location.replace("/auth?next=profile");
  throw new Error("Authentication required");
}
const profile = await db.profile();
document.querySelector("[data-account-name]").textContent =
  `Welcome, ${profile.full_name || session.user.email}`;
const form = document.querySelector("[data-account-form]");
form.elements.fullName.value = profile.full_name || "";
form.elements.phone.value = profile.phone || "";
form.elements.avatarUrl.value = profile.avatar_url || "";
document.querySelectorAll("[data-account-tab]").forEach((button) =>
  button.addEventListener("click", () => {
    document
      .querySelectorAll("[data-account-tab]")
      .forEach((item) => item.classList.toggle("active", item === button));
    document
      .querySelectorAll("[data-account-panel]")
      .forEach((panel) =>
        panel.classList.toggle(
          "active",
          panel.dataset.accountPanel === button.dataset.accountTab,
        ),
      );
  }),
);
document
  .querySelector("[data-account-logout]")
  .addEventListener("click", async () => {
    await db.signOut();
    location.replace("/");
  });
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const values = new FormData(form);
  const { error } = await db.client.rpc("update_my_profile", {
    p_full_name: values.get("fullName"),
    p_phone: values.get("phone"),
    p_avatar_url: values.get("avatarUrl"),
  });
  if (error) alert(error.message);
  else alert("Profile updated.");
});
const orders = await db.list("orders", {
  eq: { customer_id: session.user.id },
  order: { column: "created_at", ascending: false },
});
document.querySelector("[data-account-orders]").innerHTML = orders?.length
  ? orders
      .map(
        (order) =>
          `<article class="account-item"><div><strong>Order #${order.order_number}</strong><small>${new Date(order.created_at).toLocaleDateString("en-PK")} · ${order.status}</small></div><b>Rs. ${Number(order.total).toLocaleString("en-PK")}</b></article>`,
      )
      .join("")
  : "<p>No orders recorded yet.</p>";
const wishlist = await db.client
  .from("wishlists")
  .select("created_at,products(name,slug,price)")
  .eq("user_id", session.user.id);
document.querySelector("[data-account-wishlist]").innerHTML = wishlist.data
  ?.length
  ? wishlist.data
      .map(
        (item) =>
          `<a class="account-item" href="/products/${encodeURIComponent(item.products.slug)}"><strong>${item.products.name}</strong><b>Rs. ${Number(item.products.price).toLocaleString("en-PK")}</b></a>`,
      )
      .join("")
  : "<p>Your wishlist is empty.</p>";
