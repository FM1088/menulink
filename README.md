# MenuLink.page 🍽️

Beautiful bio link pages for restaurants. Like Linktree, but built specifically for the food industry.

## Features

- **3 Templates**: Minimal, Photo Hero, Elegant
- **8 Link Types**: Menu, Booking, Delivery, Social, Maps, Phone, Email, Custom
- **Visual Editor**: Drag-and-drop links, color themes, image uploads
- **QR Code Generator**: Print for table tents and menus
- **Analytics**: Track views and clicks
- **Mobile-First**: 90% of traffic is mobile — pages are optimized for it
- **SEO**: OG images, meta tags, fast loading

## Tech Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS + shadcn/ui
- Supabase (Auth + PostgreSQL + Storage)
- Stripe (Billing)
- Zustand (State)

## Setup

1. Clone and install:
```bash
npm install
```

2. Create a Supabase project and run `supabase/schema.sql` in the SQL editor

3. Create a storage bucket called `uploads` (public)

4. Copy `.env.local` and fill in your keys:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRO_PRICE_ID=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

5. Run dev server:
```bash
npm run dev
```

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page with hero, features, pricing |
| `/auth` | Sign in / Sign up |
| `/dashboard` | User's pages, analytics, create new |
| `/editor/[id]` | Visual page editor |
| `/pricing` | Plan comparison |
| `/[slug]` | Public restaurant page (what visitors see) |

## Pricing

- **Free**: 1 page, minimal template, all link types, QR code
- **Pro** ($9/mo): Unlimited pages, all templates, analytics, custom domain

---

## 🔗 Role in Curateria Ecosystem

**MenuLink is the Traffic Capture Layer.**

```
ECOSYSTEM POSITION: Tier 2 — Tools 🛠️
```

### What It Does
- Bio link pages optimised for restaurants
- QR code generation for table tents/menus
- Click tracking and analytics
- Links to menu, booking, delivery, socials

### How It Connects
```
FoodiePost content → goes viral
     ↓
Bio link in profile → "link in bio"
     ↓
MenuLink page → captures traffic
     ↓
├── Menu link → Curateria listing
├── Booking link → reservation
├── Delivery link → order
└── Analytics → track what works
```

### Value to Ecosystem
1. **Traffic attribution** — Know which content drives visits
2. **Physical presence** — QR codes at tables link back to Curateria
3. **Conversion tracking** — See full funnel from post to visit
4. **Partner retention** — Essential tool, free with Curateria

See: `/home/ernando_atsuda/projects/ECOSYSTEM.md` for full strategy.
