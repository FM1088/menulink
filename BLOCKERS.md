# MenuLink — Open Blockers

These items require human action (credentials, accounts, decisions) and cannot
be unblocked autonomously. Each is sized in time-to-unblock and prioritised.

## 🔴 Critical — blocks first revenue

### B1. Real Supabase project credentials
- **Status:** `.env.local` is 100% placeholder values; production env has placeholder values too.
- **Why blocked:** Need to either provision a new Supabase project OR point at an existing shared one (recommended: same as ReviewReply for SSO).
- **Action:** FM creates/identifies the Supabase project, runs `supabase/schema.sql` + the 2 migrations in `supabase/migrations/`, then sets `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` in Vercel + local `.env.local`.
- **Time to unblock:** 30 min

### B2. Real Stripe test-mode credentials + Pro Price ID
- **Status:** Stripe placeholder keys.
- **Why blocked:** Need a real Stripe account with a Pro product ($9/mo) created.
- **Action:**
  1. Sign in to Stripe (or create), Test mode
  2. Create Product "MenuLink Pro" with recurring $9/mo price
  3. Create webhook endpoint pointing at `https://menulink.vercel.app/api/stripe/webhook` (events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`, `invoice.paid`)
  4. Set in Vercel: `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRO_PRICE_ID`
- **Time to unblock:** 20 min

### B3. Apply DB migrations to live Supabase
- **Status:** SQL files exist, no live DB to apply against.
- **Files:**
  - `supabase/schema.sql`
  - `supabase/migrations/20260206_page_analytics.sql`
  - `supabase/migrations/20260409_past_due_and_billing.sql`
  - `supabase/migrations/20260409_bundle_provisioning.sql`
- **Action:** Once B1 done, paste each SQL file into Supabase SQL Editor (in order), or use `supabase db push`.
- **Time to unblock:** 10 min after B1
- **Depends on:** B1

## 🟡 Important — blocks bundle launch

### B4. ReviewReply branch implementation
- **Status:** Spec written, no code yet on the ReviewReply side.
- **Spec:** `~/clawd/specs/2026-04-09-reviewreply-bundle-contract.md`
- **Action:** Hand the spec to a ReviewReply branch worker. Section 7 of the spec lists 7 concrete TODOs.
- **Time to unblock:** ~6 hr of focused work
- **Depends on:** B5

### B5. Stripe Bundle Price ID (in ReviewReply's Stripe account)
- **Status:** Not created.
- **Action:** In ReviewReply's Stripe account (separate from MenuLink's), create product "MenuLink Pro Bundle" at $5/mo. Set `STRIPE_BUNDLE_PRICE_ID` in ReviewReply's env. Optionally also set in MenuLink env if MenuLink-side bundle checkout is needed.
- **Time to unblock:** 5 min

### B6. BUNDLE_SHARED_SECRET set on both apps
- **Status:** Placeholder slot in `.env.example`. Not set in Vercel.
- **Action:** Generate a long random string (e.g., `openssl rand -hex 32`), set as `BUNDLE_SHARED_SECRET` in BOTH MenuLink and ReviewReply Vercel env. Must match exactly.
- **Time to unblock:** 2 min
- **Depends on:** B4 (no point until ReviewReply side ready)

## 🟢 Nice-to-have — quality + scale

### B7. Resend account + verified domain
- **Status:** Placeholder env. Welcome emails skipped silently.
- **Action:**
  1. Sign up at https://resend.com (free tier 3000/month)
  2. Add `menulink.page` domain (DNS verification: SPF + DKIM records)
  3. Get API key, set `RESEND_API_KEY` + `EMAIL_FROM` in Vercel
- **Time to unblock:** 1 hour (DNS propagation)

### B8. Custom domain `menulink.page`
- **Status:** Project lives at `menulink.vercel.app`. The `.page` TLD requires DNSSEC.
- **Action:**
  1. Confirm domain registered (per memory it's intended)
  2. Add to Vercel project: `vercel domains add menulink.page`
  3. Configure DNS at registrar (A record or CNAME per Vercel instructions)
  4. Update `NEXT_PUBLIC_APP_URL` env to `https://menulink.page`
- **Time to unblock:** 30 min

### B9. npm audit — 9 vulnerabilities
- **Status:** 2 moderate, 7 high. Not addressed in sprint to avoid breaking-change risk during autonomous run.
- **Action:** `npm audit` to inspect, then `npm audit fix` (non-breaking) and re-test. Anything `--force` requires manual review.
- **Time to unblock:** 1 hour (depends on what comes back)

### B10. Bundle webhook on ReviewReply for refunds
- **Status:** Section 11 of bundle contract spec — refund handling not implemented.
- **Action:** Add `charge.refunded` handler in ReviewReply that calls `/api/bundle/provision` with `action=downgrade`.
- **Time to unblock:** 1 hour (after B4)

### B11. Image optimisation warnings
- **Status:** 7 ESLint warnings about `<img>` instead of `next/image`. Non-blocking but hurts Lighthouse.
- **Action:** Convert hero/dashboard images to `next/image` with proper width/height.
- **Time to unblock:** 1 hour

## 🔵 Future / out of scope for sprint

- Custom domain implementation (the Pro feature). Currently just a marketing claim — no actual subdomain routing or cert automation.
- More than 3 templates
- Marketplace / plugins / AI page builder (per spec section 7 "Do Not Do")
- Standalone marketing acquisition (it's a bolt-on, per spec)

---

**Summary:** B1 + B2 + B3 (~1 hr work) is the entire critical path to first revenue.
The deployment pipeline, all code, all UI, all tests, and the bundle contract are
already in place — only credentials are missing.

---

## Update — 2026-04-09 post-benchmark sprint additions

### B12. Stripe Locations Price ID
- **Status:** New tier shipped, env slot present.
- **Action:** Create Stripe Product "MenuLink Locations" at $24/mo, set `STRIPE_LOCATIONS_PRICE_ID` in Vercel.
- **Time:** 5 min after B2

### B13. Stripe trial period configured at the price level (optional)
- **Status:** `subscription_data.trial_period_days = 14` is hardcoded in checkout route. Works without dashboard config.
- **Action:** None required unless you want trials configured at the Stripe Product level instead of API call.

### B14. Pro price RAISED from $9 to $14 — existing customers
- **Status:** `STRIPE_PRO_PRICE_ID` env var still references whatever Stripe price ID is set. Stripe handles version retention — old subscribers keep their old price.
- **Action:** When creating the new $14 product in Stripe, copy the new Price ID to `STRIPE_PRO_PRICE_ID`. Existing subscribers continue at $9 until manually migrated. Optional: send a "we raised prices but you're grandfathered" email.

### B15. Run new SQL migrations
- **Status:** Two new migrations added in this sprint:
  - `supabase/migrations/20260409_menu_items.sql` (sections + items + RLS)
  - `supabase/migrations/20260409_locations_plan.sql` (plan check constraint)
- **Action:** Apply after B1, in addition to the original B3 migrations. Order: schema.sql → 20260206_page_analytics → 20260409_past_due → 20260409_bundle_provisioning → 20260409_menu_items → 20260409_locations_plan
