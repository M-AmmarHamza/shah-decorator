const AUTH_USERS_KEY = "pakmarket_users_v1",
  AUTH_SESSION_KEY = "pakmarket_session_v1";
const SUPER_ADMIN = {
  id: "super-admin-001",
  name: "Muhammad Ammar",
  email: "ammarshami979@gmail.com",
  phone: "03161013991",
  role: "super_admin",
  status: "approved",
  salt: "32c828a5100f7c0146c1351f0524a7c8",
  passwordHash:
    "d7a55375c36a53501a25d33e68f970ed8f8ab23f5403aae1b83c4d3fcd860e0b",
  createdAt: "2026-07-11T00:00:00.000Z",
};
const $ = (s, r = document) => r.querySelector(s),
  $$ = (s, r = document) => [...r.querySelectorAll(s)];
function users() {
  try {
    const data = JSON.parse(localStorage.getItem(AUTH_USERS_KEY));
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}
function saveUsers(data) {
  localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(data));
}
function seedSuperAdmin() {
  const list = users();
  if (!list.some((u) => u.email.toLowerCase() === SUPER_ADMIN.email))
    saveUsers([SUPER_ADMIN, ...list]);
}
function bytesToHex(bytes) {
  return [...new Uint8Array(bytes)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
function hexToBytes(hex) {
  return new Uint8Array(hex.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)));
}
async function passwordHash(password, salt) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  return bytesToHex(
    await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt: hexToBytes(salt),
        iterations: 210000,
        hash: "SHA-256",
      },
      key,
      256,
    ),
  );
}
function randomSalt() {
  const salt = new Uint8Array(16);
  crypto.getRandomValues(salt);
  return bytesToHex(salt);
}
function message(text, type = "error") {
  const box = $("[data-auth-message]");
  box.textContent = text;
  box.className = `auth-message ${type}`;
  box.hidden = false;
}
function setBusy(form, busy) {
  const button = form.querySelector("[type=submit]");
  button.disabled = busy;
  button.firstChild.textContent = busy
    ? "Please wait "
    : form.dataset.authForm === "signin"
      ? "Sign in "
      : "Create account ";
}
seedSuperAdmin();
$$("[data-auth-tab]").forEach((button) =>
  button.addEventListener("click", () => {
    $$("[data-auth-tab]").forEach((b) =>
      b.classList.toggle("active", b === button),
    );
    $$("[data-auth-form]").forEach((f) =>
      f.classList.toggle(
        "active",
        f.dataset.authForm === button.dataset.authTab,
      ),
    );
    $("[data-auth-message]").hidden = true;
  }),
);
$$("[data-toggle-password]").forEach((button) =>
  button.addEventListener("click", () => {
    const input = button.parentElement.querySelector("input"),
      show = input.type === "password";
    input.type = show ? "text" : "password";
    button.querySelector("span").textContent = show
      ? "visibility_off"
      : "visibility";
  }),
);
$("[data-auth-form=signin]").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget,
    data = new FormData(form),
    email = String(data.get("email")).trim().toLowerCase(),
    password = String(data.get("password"));
  setBusy(form, true);
  try {
    if (window.PakMarketDB?.configured) {
      await window.PakMarketDB.signIn(email, password);
      const profile = await window.PakMarketDB.profile();
      if (profile.approval !== "approved") {
        await window.PakMarketDB.signOut();
        message(profile.approval === "pending" ? "Your Admin request is awaiting Super Admin approval." : "This account request was not approved.", profile.approval === "pending" ? "pending" : "");
        return;
      }
      message("Signed in successfully. Redirecting…", "success");
      setTimeout(() => location.href = profile.role === "customer" ? "profile.html" : "admin.html", 450);
      return;
    }
    const user = users().find((u) => u.email.toLowerCase() === email);
    if (
      !user ||
      (await passwordHash(password, user.salt)) !== user.passwordHash
    ) {
      message("Email or password is incorrect.");
      return;
    }
    if (user.role === "admin" && user.status === "pending") {
      message(
        "Your Admin request is awaiting Super Admin approval.",
        "pending",
      );
      return;
    }
    if (user.status === "rejected") {
      message(
        "This account request was not approved. Contact PakMarket support.",
      );
      return;
    }
    localStorage.setItem(
      AUTH_SESSION_KEY,
      JSON.stringify({
        userId: user.id,
        role: user.role,
        name: user.name,
        email: user.email,
        createdAt: new Date().toISOString(),
      }),
    );
    message("Signed in successfully. Redirecting…", "success");
    setTimeout(
      () =>
        (location.href =
          user.role === "customer" ? "index.html" : "admin.html"),
      450,
    );
  } catch (error) {
    message(error.message || "Unable to sign in.");
  } finally {
    setBusy(form, false);
  }
});
$("[data-auth-form=signup]").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget,
    data = new FormData(form),
    email = String(data.get("email")).trim().toLowerCase(),
    password = String(data.get("password")),
    role = String(data.get("role"));
  if (!/^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/.test(password)) {
    message("Password must contain a letter, number and symbol.");
    return;
  }
  setBusy(form, true);
  try {
    const name = String(data.get("name")).trim(), phone = String(data.get("phone")).trim();
    if (window.PakMarketDB?.configured) {
      await window.PakMarketDB.signUp({ email, password, fullName: name, phone, requestedRole: role });
      form.reset();
      message(role === "admin" ? "Admin request submitted. Sign in after approval." : "Account created. Check your email to verify it.", role === "admin" ? "pending" : "success");
      return;
    }
    if (users().some((u) => u.email.toLowerCase() === email)) {
      message("An account with this email already exists.");
      return;
    }
    const salt = randomSalt(),
      newUser = {
        id: `user-${Date.now()}`,
        name,
        email,
        phone,
        role,
        status: role === "admin" ? "pending" : "approved",
        salt,
        passwordHash: await passwordHash(password, salt),
        createdAt: new Date().toISOString(),
      };
    saveUsers([...users(), newUser]);
    form.reset();
    if (role === "admin")
      message(
        "Admin request submitted. You can sign in after Super Admin approval.",
        "pending",
      );
    else
      message(
        "Customer account created. Select Sign in to continue.",
        "success",
      );
  } catch (error) {
    message(error.message || "Unable to create account.");
  } finally {
    setBusy(form, false);
  }
});
