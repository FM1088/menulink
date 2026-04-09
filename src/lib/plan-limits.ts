import type { PlanKey } from '@/lib/stripe'
import { PLANS } from '@/lib/stripe'

/**
 * Plan-cap enforcement helpers.
 *
 * The DB doesn't enforce these (would require a complex trigger or a check
 * constraint that joins). Application-side enforcement is simpler and the
 * blast radius is contained: worst case, a user briefly has more published
 * pages than their plan allows (e.g. just downgraded), and we silently let
 * them continue until next publish/edit.
 */

export type PlanCheckResult =
  | { ok: true }
  | { ok: false; reason: string; cap: number; current: number }

/**
 * Check whether a user can publish another page given their current plan
 * and the count of pages they already have published.
 */
export function canPublishAnother(
  plan: PlanKey | 'past_due',
  currentPublishedCount: number,
): PlanCheckResult {
  // past_due users keep their previous plan's privileges; we don't enforce
  // here because Stripe handles dunning. Just allow until plan flips to free.
  if (plan === 'past_due') return { ok: true }

  const def = PLANS[plan]
  if (!def) {
    return { ok: false, reason: 'unknown plan', cap: 0, current: currentPublishedCount }
  }
  if (def.publishedPageCap === -1) return { ok: true }
  if (currentPublishedCount < def.publishedPageCap) return { ok: true }
  return {
    ok: false,
    reason: `${def.name} plan allows up to ${def.publishedPageCap} published page${def.publishedPageCap === 1 ? '' : 's'}`,
    cap: def.publishedPageCap,
    current: currentPublishedCount,
  }
}

/**
 * Friendly upgrade-CTA copy for the editor when a user hits their cap.
 */
export function upgradeCtaForCap(plan: PlanKey | 'past_due'): {
  title: string
  body: string
  cta: string
  href: string
} {
  if (plan === 'free') {
    return {
      title: 'Upgrade to publish more pages',
      body: 'Free plan includes 1 page. Pro is $14/mo for one venue, or Locations is $24/mo for up to 5.',
      cta: 'See plans',
      href: '/pricing',
    }
  }
  if (plan === 'pro') {
    return {
      title: "You're on Pro (1 page)",
      body: 'Upgrade to Locations ($24/mo) to publish up to 5 pages — perfect for restaurant groups and chains.',
      cta: 'Upgrade to Locations',
      href: '/auth?plan=locations',
    }
  }
  if (plan === 'locations') {
    return {
      title: "You're at the Locations cap (5 pages)",
      body: 'Need more? Email hello@menulink.page — we have custom plans for groups with 6+ venues.',
      cta: 'Contact us',
      href: 'mailto:hello@menulink.page?subject=Need%20more%20than%205%20locations',
    }
  }
  return {
    title: 'Upgrade required',
    body: 'Pick a plan to continue publishing.',
    cta: 'See plans',
    href: '/pricing',
  }
}
