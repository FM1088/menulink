import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // @ts-expect-error - Stripe types may lag behind API versions
  apiVersion: '2023-10-16',
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
    priceId: process.env.STRIPE_PRO_PRICE_ID,
    pages: -1, // unlimited
    templates: ['minimal', 'photo-hero', 'elegant'],
    analytics: true,
    customDomain: true,
  },
} as const
