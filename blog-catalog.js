const IMAGES = {
  embroidery:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuATy9GXpwsUTg01J7YyA-Bcok4KxTVWzwtC1zUh1nnOfxUzHJS9rPkSH9s9v8hGLym1zOirMK_uuE0YPb-4p5oEnUtrwrqQY20JBCDb8-jiyCoHl2bX_DO_ucB58tKO2Kg_SjH5UhFd6lyqptRUPQIGZtsUv2rHZcAZmgy3984_IOdQmWJQMxSyQ1CVpUOTTMhpmRszVtlWO-DWALU3c3XczX1jwpN24okINkYx8txNVhPd_apHcaRU3bMpc_BBt0EVqpnTRFM-GZM",
  skincare:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDwnOieY28bBenRbF32VXaElfxZo2UZnyg1TmVIhsB79foEcHqYhW4XSYnh5EQ0zxxUj2iLuu60H6MGvBzMr51ELKiqn6tv8LCpu2ZYrH6mS9nmLiGngOzyXZQ6f71UOb_KDvomAekYMlwwXqt-UYnSEJDZW1hTwZhPiW4VVxaG7J9ndbBH15pFAWEO1Fp99BlheYqE2Y5Jdu3fdS4eKRygSIudVkDmEHJyfZPKT2KWk1Ra-B2uL7Quazk7ByeNj9JzHahN7sVMtrI",
  business:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAa2k_PsvTRGoTflbQHPqaKn1BKnlNjtHAJ1epWVlALSEj96BLcyBGOLIQRCjkw5PCg_mAarwoGr7s9ojeDHui4IeAXqgGyjTActnYkxkgvBgQJtsYFBJXdNCavLQjbRwze_gTGGM6Mk0KRljar0DQtZfoP7XUfkRMZ_UDemgYiU4l5ZLy41BHDpTPR-6NCPJ6ktOc10awmqKxu_r8pwcbflNMNAohWB3KhsMGhUMoLJJIlnG0i1UO7X0w6c8UvA9le6E4MSbN4x00",
  decor:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCIvMqIBNOcBoTANsI-CUTv6A085fbWW2bCSopedElrNC9PuORwEjvWNKddyky87ugemoOTus5Hy2-rXA5-Mq0QNpYbnCwIFOsqJshcyPM_waQ1SDjmu2-bASQl-VgNrDxV5XZM9z7ECWHoEj_y71kb60DLjXpYGv4A2OOE3l1wuOYqUkNIrh4k4btfci61yarv1Fa-kF2hDgjkUVrxV7e-5W9tIgWfIdalMTyHNzGgHb3C3sL95qt4uLcTT6tPPEF5CoO1s7kia5E",
  spices:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCL9t1xJOz6dDc_9jvtbEc9SBLErRUK0Ip0lQHCCDL7AjcHcyMYUx-Pir7M7Uyv-G5VXgvu1aUH4lV-ykedFRVX6h_07c8aJPaS8-rs7E_cJ8LQ4vYYNbQHHEm5ZwMT8WjoY-KaBd94u6KxPRejUIrdq4-i1I40srtS6LxPIn-wYTZblQuvDHzEVAp2EDTAECpDa5FuvsPNyewzpg5FBiITRUBJTBzIJ-HfcEPo8q3OgPhUQa6ejTW13CHTnQeYYmMcTnDBcxNTa7c",
  safety:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBbU2yYSwktrFoCFttftawn5URsNVaaFycSmZGtXzFRr8wAh1raunj5CmW5lbn9f9L9vwE7aKOFhJko6mG0r3wmAW9ZHb_ZY94LWxds8XpzTZn6CEuX9JJq3_thxhXRb2Wgm-6aqbMHjfcIHPjzeuZ1ZgavsHdysBt3b4EfJFRyHrPs2UuzaUqe6w8texH1paR01FOfEub3NOcnSkdCZyevzwiUR4HZLSOfcaoL4GQoicWA7KUbdS4gmI3MkAF4UxnM13v65MPxko0",
};

export const DEFAULT_BLOGS = [
  {
    id: "blog-embroidery",
    slug: "hand-embroidery-modern-apparel",
    title: "The Art of Hand Embroidery in Modern Apparel",
    category: "Craftsmanship",
    author: "Sarah Ahmed",
    image: IMAGES.embroidery,
    coverAlt: "Pakistani artisan creating detailed hand embroidery",
    excerpt:
      "Meet the local artisans preserving centuries-old techniques while creating contemporary pieces for a new generation.",
    content: `<p class="article-lead">Across Pakistan, embroidery is more than decoration. It carries the identity of a region, the skill of its maker and stories passed between generations.</p><h2>Tradition meets a modern wardrobe</h2><p>Contemporary brands are choosing lighter fabrics, simpler silhouettes and carefully placed motifs. This balance helps handcrafted pieces feel natural at work, at casual gatherings and during festive occasions.</p><h2>What makes hand embroidery valuable?</h2><ul><li><strong>Every piece is unique:</strong> small variations show the hand of the maker.</li><li><strong>Skills stay alive:</strong> fair demand gives artisans a reason to teach the next generation.</li><li><strong>Local purchases create impact:</strong> more value remains with makers and their communities.</li></ul><h2>How to choose an authentic piece</h2><p>Ask who made the item, check the fabric and look closely at the reverse side of the embroidery. Subtle differences between repeated motifs are a sign of craftsmanship, not a flaw.</p><p>When modern design respects traditional skill, artisans gain sustainable work and shoppers receive clothing with genuine meaning behind it.</p>`,
    enabled: true,
    featured: true,
    publishDate: "2026-07-08",
    readTime: 5,
    seoIndex: true,
    seoTitle: "The Art of Hand Embroidery in Modern Apparel | PakMarket",
    metaDescription:
      "Discover how Pakistani artisans preserve regional hand-embroidery traditions while creating modern apparel.",
    keywords: "Pakistani embroidery, local artisans, handmade fashion",
  },
  {
    id: "blog-skincare",
    slug: "local-organic-skincare-guide",
    title: "Switching to Local Organic Skincare: A Guide",
    category: "Wellness",
    author: "Mariam Ali",
    image: IMAGES.skincare,
    coverAlt: "Locally made organic skincare products",
    excerpt:
      "A practical guide to reading labels, testing products and choosing responsible local skincare brands.",
    content: `<p class="article-lead">Local skincare can offer fresh formulations, transparent sourcing and products designed for Pakistan's climate. The key is to judge every product by its ingredients and evidence, not by the word natural alone.</p><h2>Start with your skin, not a trend</h2><p>Identify whether your skin is dry, oily, combination or sensitive. Introduce one product at a time and patch-test it for at least 24 hours before applying it widely.</p><h2>Read the complete label</h2><p>Look for a full ingredient list, batch information, expiry guidance and clear contact details. Avoid products that make medical claims without appropriate evidence.</p><h2>Choose responsible local brands</h2><p>Good brands explain how to store and use a product, answer questions honestly and use packaging that protects the formula. Begin with a gentle cleanser, moisturiser or lip treatment before building a longer routine.</p>`,
    enabled: true,
    featured: false,
    publishDate: "2026-07-05",
    readTime: 4,
    seoIndex: true,
    seoTitle: "Local Organic Skincare Guide | PakMarket",
    metaDescription:
      "Learn how to choose safe, transparent and suitable organic skincare from Pakistani local brands.",
    keywords: "organic skincare Pakistan, local skincare brands, skincare guide",
  },
  {
    id: "blog-home-brand",
    slug: "start-local-brand-from-home",
    title: "Starting Your Own Brand from Home",
    category: "Business",
    author: "PakMarket Editorial",
    image: IMAGES.business,
    coverAlt: "Pakistani entrepreneur managing a small brand from home",
    excerpt:
      "From product validation to the first WhatsApp order, here is how to start small and build with confidence.",
    content: `<p class="article-lead">A home-based brand does not need a huge catalogue. It needs one clear customer problem, a dependable product and a simple way to fulfil orders well.</p><h2>Validate before investing heavily</h2><p>Speak with potential customers, prepare a small sample batch and record honest feedback on quality, packaging and price. Improve the product before spending heavily on promotion.</p><h2>Build a repeatable order process</h2><p>Keep product names, prices, stock and delivery charges clear. Use a consistent WhatsApp order template so every customer receives the same confirmation and payment information.</p><h2>Measure what matters</h2><p>Track enquiries, confirmed orders, delivery failures, repeat customers and profit after packaging and courier costs. These numbers show whether the business is genuinely growing.</p>`,
    enabled: true,
    featured: false,
    publishDate: "2026-07-02",
    readTime: 8,
    seoIndex: true,
    seoTitle: "How to Start a Local Brand from Home | PakMarket",
    metaDescription:
      "A practical guide to launching and managing a Pakistani home-based product brand.",
    keywords: "home business Pakistan, start local brand, WhatsApp selling",
  },
  {
    id: "blog-decor",
    slug: "minimalist-home-decor-desi-way",
    title: "Minimalist Home Decor: The Desi Way",
    category: "Lifestyle",
    author: "Ayesha Khan",
    image: IMAGES.decor,
    coverAlt: "Minimal Pakistani living room with handcrafted decor",
    excerpt:
      "Blend traditional Pakistani craft with a calm, modern home without losing warmth or personality.",
    content: `<p class="article-lead">Minimalism does not mean removing culture from a room. It means choosing fewer objects and giving meaningful pieces enough space to be noticed.</p><h2>Begin with a quiet foundation</h2><p>Use a neutral base for large surfaces, then introduce colour through cushions, pottery, woven baskets or a single textile with regional character.</p><h2>Choose craft with purpose</h2><p>A carved tray can organise daily essentials, a handmade bowl can hold fruit and a woven throw can add comfort. Useful objects make a room feel intentional rather than staged.</p><h2>Leave room to breathe</h2><p>Group related objects, keep walkways clear and rotate seasonal pieces instead of displaying everything at once. The result feels calm while remaining distinctly personal.</p>`,
    enabled: true,
    featured: false,
    publishDate: "2026-06-28",
    readTime: 6,
    seoIndex: true,
    seoTitle: "Minimalist Pakistani Home Decor Ideas | PakMarket",
    metaDescription:
      "Simple ways to combine Pakistani handmade decor with a modern minimalist home.",
    keywords: "Pakistani home decor, minimalist decor, handmade decor",
  },
  {
    id: "blog-spices",
    slug: "sourcing-ethical-local-spices",
    title: "Sourcing Ethical Spices: Supporting Local Farms",
    category: "Gastronomy",
    author: "PakMarket Editorial",
    image: IMAGES.spices,
    coverAlt: "Pakistani spices and food served outdoors",
    excerpt:
      "Understand how transparent sourcing can improve freshness while supporting growers and small processors.",
    content: `<p class="article-lead">The quality of a spice depends on where it was grown, how it was dried and how long it has been stored. Transparent sourcing helps customers ask better questions about all three.</p><h2>Freshness begins at harvest</h2><p>Responsible suppliers identify the growing region, harvest season and processing method. Whole spices usually retain flavour longer and can be ground in smaller batches.</p><h2>Fair purchasing strengthens quality</h2><p>Stable relationships with growers encourage careful harvesting and reduce pressure to cut corners. Buyers should look for honest origin information rather than vague premium labels.</p><h2>Store spices correctly</h2><p>Keep them sealed, dry and away from direct sunlight. Buy quantities that match normal household use so flavour is enjoyed before it fades.</p>`,
    enabled: true,
    featured: false,
    publishDate: "2026-06-24",
    readTime: 5,
    seoIndex: true,
    seoTitle: "Ethical Local Spice Sourcing in Pakistan | PakMarket",
    metaDescription:
      "Learn how ethical spice sourcing supports Pakistani growers and improves freshness and traceability.",
    keywords: "Pakistani spices, ethical sourcing, local farms",
  },
  {
    id: "blog-shopping-safety",
    slug: "safe-online-shopping-marketplace-tips",
    title: "Safe Online Shopping Tips for Marketplace Users",
    category: "Shopping Guide",
    author: "PakMarket Editorial",
    image: IMAGES.safety,
    coverAlt: "Secure online shopping and mobile payment concept",
    excerpt:
      "A simple checklist for verifying products, sellers, delivery terms and payment details before ordering.",
    content: `<p class="article-lead">A few quick checks before payment can prevent most marketplace problems. Keep product, price, delivery and return information in one written conversation.</p><h2>Verify the complete offer</h2><p>Confirm the exact product, selected size or colour, final price, delivery charge and expected dispatch date. Save the order confirmation until the return period ends.</p><h2>Use published payment details</h2><p>Pay only to the account shown on the store's official payment page. Never share an OTP, PIN or password with a seller or support representative.</p><h2>Inspect the delivery</h2><p>Check the package label and condition before opening where possible. If something is wrong, take clear photos and contact support promptly with the order details.</p>`,
    enabled: true,
    featured: false,
    publishDate: "2026-06-20",
    readTime: 7,
    seoIndex: true,
    seoTitle: "Safe Online Shopping Tips in Pakistan | PakMarket",
    metaDescription:
      "Use this checklist to verify sellers, payments, deliveries and returns when shopping online in Pakistan.",
    keywords: "safe online shopping Pakistan, marketplace safety, payment safety",
  },
];
