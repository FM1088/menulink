# MenuLink.page

Beautiful bio link pages for restaurants. Like Linktree, but built specifically for the food industry.

## Features

- **3 Templates**: Minimal, Photo Hero, Elegant -- each designed for different restaurant vibes
- **8 Link Types**: Menu, Booking, Delivery, Social, Maps, Phone, Email, Custom
- **Visual Editor**: Live preview, color themes, image uploads, link reordering
- **QR Code Generator**: PNG QR codes for table tents, menus, and receipts
- **Printable QR Poster (Pro)**: Auto-generated A4 + A5 PDF posters with venue name, scan CTA, full Unicode (Vietnamese, Thai, CJK)
- **Analytics Dashboard**: Track page views, link clicks, CTR, and 7-day trends
- **Mobile-First**: Responsive pages optimized for the 90%+ mobile traffic restaurants see
- **SEO Ready**: Open Graph meta tags, Twitter cards, JSON-LD Product+Offer schema, server-side rendering
- **Stripe Billing**: Free tier + Pro subscription + customer portal + payment failure handling
- **Welcome Emails (Resend)**: Branded HTML+text email with poster download links on Pro signup
- **Bundle with ReviewReply**: +$5/mo bolt-on via cross-product provisioning API

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) + TypeScript |
| UI | Tailwind CSS + shadcn/ui (Radix) |
| Auth & DB | Supabase (Auth + PostgreSQL + Storage) |
| Payments | Stripe (Checkout + Webhooks) |
| State | Zustand |
| Charts | Recharts |
| QR Codes | qrcode.react |
| Drag & Drop | @dnd-kit |

## Quick Start

### 1. Clone and install

```bash
git clone https://github.com/FM1088/menulink.git
cd menulink
npm install
```

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the schema file:
   - `supabase/schema.sql` (creates profiles, pages tables, RLS policies, triggers)
   - `supabase/migrations/20260206_page_analytics.sql` (creates analytics table and RPC functions)
3. Go to **Storage** and create a public bucket named `uploads`
4. Copy your project URL and keys from **Settings > API**

### 3. Set up Stripe (optional, for billing)

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Create a Product with a recurring price ($9/month)
3. Copy the Price ID and API keys
4. Set up a webhook endpoint pointing to `/api/stripe/webhook`
   - Events to listen for: `checkout.session.completed`, `customer.subscription.deleted`

### 4. Configure environment variables

Copy `.env.local` and fill in your values:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_PRICE_ID=price_...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the landing page.

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page with hero, features, pricing |
| `/auth` | Sign in / Sign up |
| `/dashboard` | Manage your restaurant pages |
| `/editor/[id]` | Visual page editor with live preview |
| `/analytics/[id]` | Analytics dashboard with charts |
| `/pricing` | Plan comparison |
| `/[slug]` | Public restaurant page (SSR, what visitors see) |

## API Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/analytics` | POST | Record page view or link click |
| `/api/analytics` | GET | Fetch analytics summary by day |
| `/api/poster/[slug]` | GET | Generate + stream QR poster PDF (`?format=a4\|a5`) |
| `/api/stripe/checkout` | POST | Create Stripe checkout session |
| `/api/stripe/webhook` | POST | Handle Stripe subscription events |
| `/api/stripe/portal` | POST | Create Stripe billing portal session |
| `/api/bundle/provision` | POST | Cross-product bundle activation (called by ReviewReply) |

## Database Schema

```
profiles
  id (UUID, FK -> auth.users)
  email, plan (free/pro)
  stripe_customer_id, stripe_subscription_id

pages
  id (UUID), user_id (FK -> profiles)
  slug (unique), name, description
  logo_url, hero_url, template
  theme (JSONB), links (JSONB), hours (JSONB), gallery (JSONB)
  published, views, clicks

page_analytics
  id (UUID), page_id (FK -> pages)
  event_type (view/click), link_id, referrer, user_agent
```

## Pricing

- **Free**: 1 page, Minimal template, all link types, QR code
- **Pro** ($9/mo): Unlimited pages, all 3 templates, analytics, custom domain, priority support

## Project Structure

```
src/
  app/
    [slug]/          # Public restaurant pages (SSR)
    analytics/[id]/  # Analytics dashboard
    api/             # API routes (analytics, stripe)
    auth/            # Sign in / Sign up
    dashboard/       # User's pages
    editor/[id]/     # Visual page editor
    pricing/         # Pricing page
    layout.tsx       # Root layout
    page.tsx         # Landing page
  components/
    ui/              # shadcn/ui components
  lib/
    supabase.ts      # Server-side Supabase client
    supabase-browser.ts  # Client-side Supabase client
    stripe.ts        # Stripe config
    store.ts         # Zustand state
    types.ts         # TypeScript types
    utils.ts         # Tailwind merge utility
supabase/
  schema.sql         # Database schema
  migrations/        # SQL migrations
```

## Tests

```bash
npm test            # one-shot
npm run test:watch  # watch mode
npm run test:coverage
```

30 tests covering poster generator (Unicode handling), email rendering, Stripe webhook event routing.

## Deployment

Live preview: https://menulink-zeta.vercel.app

Setting up your own:
```bash
npx vercel link
npx vercel env add NEXT_PUBLIC_SUPABASE_URL production
# ... repeat for all vars in .env.example
npx vercel --prod
```

See `BLOCKERS.md` for unfinished items requiring out-of-band setup.

## License

MIT
