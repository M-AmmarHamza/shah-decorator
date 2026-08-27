# Shah Decorator

Shah Decorator is a responsive, modern event decoration and wedding styling website with instant WhatsApp booking, tailored catalog showcase, and an integrated management dashboard.

## Pages & Structure

- `index.html` - Luxury storefront home page with hero section, wedding season offer banner, featured decor setups, craftsmanship story, customer reviews, and FAQs.
- `products.html` - Decor catalog with setup category filters (Wedding Decor, Lighting & Ambience, Parties & Birthdays, Table & Aisle, Outdoor Canopies) and search.
- `product.html` - Detailed event setup view with multi-angle photo gallery, package inclusions, date & venue booking form, and direct WhatsApp quote action.
- `blog.html` - Event styling guides, wedding trends, lighting tips, and decor inspiration.
- `blog-detail.html` - Rich article view with advice, social sharing, and related guides.
- `about.html` - Craftsmanship story, team values, event statistics, and consultation CTAs.
- `contact.html` - Booking inquiry form, service coverage area, and direct WhatsApp chat links.
- `payment.html` - Advance booking deposit options (Easypaisa, JazzCash, MCB Bank Transfer, Cash on Setup) with receipt slip upload.
- `return-policy.html` - Event cancellation and date rescheduling terms.
- `shipping-policy.html` - Service cities, logistics timelines, and venue installation policies.
- `terms.html` & `privacy-policy.html` - Terms of service and privacy protection.
- `admin.html` - Event catalog and booking workspace.

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```
2. Build for production:
   ```bash
   npm run build
   ```
3. Start local development preview server:
   ```bash
   npm run dev
   ```

## WhatsApp & Site Configuration

Edit `.env` or `seo.config.js` to customize:
- `VITE_WHATSAPP_NUMBER`: 923161013991 (International format without `+`)
- `VITE_SITE_URL`: `https://shahdecorator.pk`
- `catalog.js`: Decoration packages, prices, and photo assets
- `theme-config.js`: Palette presets including "Royal Gold" (#966E2D)
