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

export const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    pages: 1,
    templates: ['minimal'],
    analytics: false,
    customDomain: false,
  },
  pro: {
    name: 'Pro',
    price: 9,
    get priceId() {
      return process.env.STRIPE_PRO_PRICE_ID
    },
    pages: -1, // unlimited
    templates: ['minimal', 'photo-hero', 'elegant'],
    analytics: true,
    customDomain: true,
  },
  bundle: {
    name: 'Bundle (with ReviewReply)',
    price: 5,
    get priceId() {
      return process.env.STRIPE_BUNDLE_PRICE_ID
    },
    pages: -1,
    templates: ['minimal', 'photo-hero', 'elegant'],
    analytics: true,
    customDomain: true,
  },
} as const
