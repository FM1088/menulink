import Stripe from 'stripe'

/**
 * Lazy-initialised Stripe client.
 *
 * Why lazy: at build time on Vercel, env vars are not always present when the
 * route module is imported for static analysis. Constructing `new Stripe(undefined!)`
 * throws "Neither apiKey nor config.authenticator provided" and breaks the build.
 *
 * The proxy defers construction until the first method access, by which time
 * runtime env vars are populated.
 */
let _stripe: Stripe | null = null

function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) {
      throw new Error(
        'STRIPE_SECRET_KEY env var is not set. Cannot make Stripe API calls.',
      )
    }
    _stripe = new Stripe(key, {
      // @ts-expect-error - Stripe types may lag behind API versions
      apiVersion: '2023-10-16',
    })
  }
  return _stripe
}

export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    const client = getStripe()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const value = (client as any)[prop]
    return typeof value === 'function' ? value.bind(client) : value
  },
})

/**
 * Plans — pricing reflects the 2026-04-09 competitive benchmark.
 *
 * Pro raised from $9 → $14: positions above the horizontal floor (Linktree $8,
 * Beacons $10) and well below the vertical floor (MustHaveMenus $49). Existing
 * customers grandfather at $9 via Stripe price-version retention — webhook
 * does not migrate them.
 *
 * Bundle add-on raised from $5 → $9 so the stack reads "$23 total" (RR $14
 * + bundle $9), matching the agent's recommendation of stacking pricing.
 *
 * Locations tier is new: $24/mo for up to 5 published pages. Knife-fight
 * price vs MustHaveMenus ($49 per location) and Popmenu ($300 per location).
 */
export type PlanKey = 'free' | 'pro' | 'locations' | 'bundle'

export interface PlanDef {
  key: PlanKey
  name: string
  price: number
  publishedPageCap: number // -1 = unlimited
  templates: readonly string[]
  analytics: boolean
  customDomain: boolean
  posterPdf: boolean
  removeBranding: boolean
  menuItems: boolean
  priceIdEnvVar?: string
}

export const PLANS: Record<PlanKey, PlanDef> = {
  free: {
    key: 'free',
    name: 'Free',
    price: 0,
    publishedPageCap: 1,
    templates: ['minimal'],
    analytics: false,
    customDomain: false,
    posterPdf: false,
    removeBranding: false,
    menuItems: false,
  },
  pro: {
    key: 'pro',
    name: 'Pro',
    price: 14,
    publishedPageCap: 1,
    templates: ['minimal', 'photo-hero', 'elegant'],
    analytics: true,
    customDomain: true,
    posterPdf: true,
    removeBranding: true,
    menuItems: true,
    priceIdEnvVar: 'STRIPE_PRO_PRICE_ID',
  },
  locations: {
    key: 'locations',
    name: 'Locations',
    price: 24,
    publishedPageCap: 5,
    templates: ['minimal', 'photo-hero', 'elegant'],
    analytics: true,
    customDomain: true,
    posterPdf: true,
    removeBranding: true,
    menuItems: true,
    priceIdEnvVar: 'STRIPE_LOCATIONS_PRICE_ID',
  },
  bundle: {
    key: 'bundle',
    name: 'Bundle (with ReviewReply)',
    price: 9, // add-on price; $14 RR + $9 bundle = $23 stack
    publishedPageCap: 1,
    templates: ['minimal', 'photo-hero', 'elegant'],
    analytics: true,
    customDomain: true,
    posterPdf: true,
    removeBranding: true,
    menuItems: true,
    priceIdEnvVar: 'STRIPE_BUNDLE_PRICE_ID',
  },
} as const

export function getPlan(key: PlanKey): PlanDef {
  return PLANS[key]
}

export function planPriceId(key: PlanKey): string | undefined {
  const plan = PLANS[key]
  if (!plan.priceIdEnvVar) return undefined
  return process.env[plan.priceIdEnvVar]
}
