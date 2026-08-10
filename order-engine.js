const clean = (value, max = 240) =>
  String(value ?? "")
    .replace(/[<>\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);

export const money = (value) =>
  `Rs. ${Math.round(Number(value || 0)).toLocaleString("en-PK")}`;

export function productOptions(product) {
  const configured = Array.isArray(product?.options) ? product.options : [];
  return configured
    .map((option) => ({
      name: clean(option.name, 40),
      required: option.required !== false,
      values: [...new Set((option.values || []).map((value) => clean(value, 50)).filter(Boolean))],
    }))
    .filter((option) => option.name && option.values.length);
}

export function deliveryQuote(city, settings = {}) {
  const normalized = clean(city, 80).toLowerCase();
  const rules = Array.isArray(settings.deliveryRules) ? settings.deliveryRules : [];
  const matched = rules.find((rule) =>
    (rule.cities || []).some((entry) => clean(entry, 80).toLowerCase() === normalized),
  );
  if (matched) return { known: true, amount: Math.max(0, Number(matched.fee || 0)), label: matched.label || "Delivery" };
  if ((settings.deliveryMode || "separate") === "free")
    return { known: true, amount: 0, label: "Free delivery" };
  if (settings.deliveryMode === "included")
    return { known: true, amount: 0, label: "Delivery included" };
  if (normalized && Number(settings.deliveryFee) > 0)
    return { known: true, amount: Number(settings.deliveryFee), label: "Delivery" };
  return { known: false, amount: 0, label: "Owner will confirm" };
}

export function calculateOrder({ product, quantity = 1, selections = {}, city = "", settings = {}, offer = null }) {
  const qty = Math.max(1, Math.min(Number(product?.stock || 1), Number(quantity || 1)));
  const unitPrice = Math.max(0, Number(product?.price || 0));
  const subtotal = unitPrice * qty;
  const rawDiscount = !offer
    ? 0
    : offer.discountType === "fixed"
      ? Number(offer.discountValue || 0)
      : subtotal * (Number(offer.discountValue || 0) / 100);
  const discount = Math.max(0, Math.min(subtotal, rawDiscount));
  const delivery = deliveryQuote(city, settings);
  const payable = delivery.known ? subtotal - discount + delivery.amount : null;
  return { product, quantity: qty, selections, unitPrice, subtotal, discount, delivery, payable, offer };
}

export function validateOrder({ product, quantity, selections, customer }) {
  const errors = {};
  productOptions(product).forEach((option) => {
    if (option.required && !selections?.[option.name]) errors[`option:${option.name}`] = `Select ${option.name}.`;
  });
  if (Number(product?.stock || 0) < 1) errors.stock = "This product is currently out of stock.";
  if (Number(quantity) < 1 || Number(quantity) > Number(product?.stock || 0)) errors.quantity = "Choose a quantity within available stock.";
  if (clean(customer?.name, 80).length < 2) errors.name = "Enter your full name.";
  const phone = clean(customer?.mobile, 30).replace(/[\s()-]/g, "");
  if (!/^\+?\d{10,15}$/.test(phone)) errors.mobile = "Enter a valid mobile number.";
  if (!clean(customer?.city, 80)) errors.city = "Enter your city.";
  if (clean(customer?.address, 300).length < 5) errors.address = "Enter your delivery address.";
  if (!clean(customer?.payment, 50)) errors.payment = "Select a payment method.";
  return errors;
}

export function createOrderId() {
  const time = Date.now().toString(36).slice(-5).toUpperCase();
  const random = crypto.getRandomValues(new Uint16Array(1))[0].toString(36).padStart(3, "0").slice(-3).toUpperCase();
  return `PK-${time}${random}`;
}

export function buildOrderMessage({ id, quote, customer, productUrl }) {
  const optionLines = Object.entries(quote.selections || {})
    .map(([name, value]) => `${clean(name, 40)}: ${clean(value, 60)}`)
    .join("\n");
  const deliveryLine = quote.delivery.known ? money(quote.delivery.amount) : "Owner will confirm";
  const totalLine = quote.payable === null ? "Owner will confirm after delivery charge" : money(quote.payable);
  return [
    `Naya Order #${clean(id, 30)}`,
    `Product: ${clean(quote.product.name, 120)}`,
    `SKU: ${clean(quote.product.sku || "N/A", 50)}`,
    optionLines,
    `Quantity: ${quote.quantity}`,
    `Unit Price: ${money(quote.unitPrice)}`,
    `Product Total: ${money(quote.subtotal)}`,
    quote.discount ? `Discount: -${money(quote.discount)}` : "",
    `Delivery: ${deliveryLine}`,
    `Grand Total: ${totalLine}`,
    "",
    `Customer: ${clean(customer.name, 80)}`,
    `Mobile: ${clean(customer.mobile, 30)}`,
    `City: ${clean(customer.city, 80)}`,
    `Address: ${clean(customer.address, 300)}`,
    customer.note ? `Note: ${clean(customer.note, 300)}` : "",
    `Payment: ${clean(customer.payment, 50)}`,
    `Product Link: ${clean(productUrl, 300)}`,
  ].filter(Boolean).join("\n");
}

export function configuredWhatsApp(settings = {}, fallback = "") {
  return clean(settings.whatsapp || fallback, 30).replace(/\D/g, "");
}
