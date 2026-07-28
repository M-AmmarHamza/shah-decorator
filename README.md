# PakMarket

PakMarket is a responsive mini-commerce storefront and an easy-to-use admin system for Pakistani local brands. Orders remain WhatsApp-first, while Supabase adds secure authentication, inventory, editorial content, payments, reviews, roles, and analytics.

## Pages

- `index.html` - home page with hero, trust badges, featured products, ordering steps, testimonials, and FAQ
- `products.html` - product listing with category filters and search
- `product.html` - product detail page with gallery, product information, payment/delivery cards, and sticky mobile WhatsApp CTA
- `blog.html` - merchant stories/blog grid with newsletter signup
- `blog-detail.html` - long-form article page with author details, sharing, and related stories
- `about.html` - brand story, mission, values, impact, and seller call-to-action
- `contact.html` - support details and a WhatsApp-powered enquiry form
- `return-policy.html` - customer-friendly seven-day returns and refunds policy
- `payment.html` - wallet and bank details with payment-slip sharing

## Local development

1. Install Node.js 20 or 22.
2. Run `npm install`.
3. Copy `.env.example` to `.env` and add the new PakMarket Supabase URL and publishable key.
4. Run `npm run dev`.

Without Supabase environment variables, browser-storage data is available only on localhost for previewing. Production account and admin access remain disabled.

## Admin

Open `admin.html` to manage products, stock, SEO, pages, blogs, events, coming-soon products, orders, payment confirmations, reviews, categories, administrators, media, global settings, and analytics. Destructive and SEO-sensitive controls require confirmation, and administrator accounts require super-admin approval.

## Supabase production setup

1. Create a dedicated Supabase project for PakMarket.
2. Apply `supabase/migrations/20260711175425_pakmarket_production_schema.sql`.
3. Create the public buckets `product-media` and `blog-media`, plus the private bucket `payment-slips`.
4. Add the Supabase URL and publishable key to Vercel environment variables.
5. Create the first account through `auth.html`, then promote only that trusted profile to the `super_admin` role and set its approval to `approved` from a protected SQL/admin session.
6. Run Supabase security and performance advisors before launch.

Never commit `.env`, database passwords, service-role keys, or user passwords.

## Production checks

- `npm run build`
- Confirm email redirects and allowed origins in Supabase Auth.
- Confirm RLS remains enabled on every exposed table.
- Test administrator approval, inventory updates, checkout/WhatsApp messages, private payment slips, and mobile navigation.
- Replace placeholder social URLs and review the legal text before public launch.

## Domain and SEO configuration

All canonical URLs, Open Graph URLs, `robots.txt`, the XML sitemap and
pre-rendered product/blog pages use one environment variable:

```bash
VITE_SITE_URL=https://pakmarket.pk
```

Copy `.env.example` to `.env` for local builds. When moving to the permanent
domain, change `VITE_SITE_URL` in the hosting environment and redeploy. Do not
include a trailing slash.

`npm run build` automatically:

- adds page-specific titles, descriptions, canonical URLs and social metadata;
- adds Organization, Website, Product, Article and Breadcrumb structured data;
- creates crawlable HTML files for the default product and blog detail URLs;
- regenerates `dist/sitemap.xml` and `dist/robots.txt` for the configured domain.

Do not manually edit generated files inside `dist/`.
