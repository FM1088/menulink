/**
 * Pure event-routing logic for the Stripe webhook, extracted for testing.
 *
 * The route handler (api/stripe/webhook/route.ts) handles signature
 * verification + Supabase client creation, then delegates here.
 */

export type SubscriptionStatus =
  | 'active'
  | 'trialing'
  | 'past_due'
  | 'unpaid'
  | 'canceled'
  | 'incomplete'
  | 'incomplete_expired'

export type PlanState = 'free' | 'pro' | 'past_due'

export function planFromStatus(status: SubscriptionStatus): PlanState {
  if (status === 'active' || status === 'trialing') return 'pro'
  if (status === 'past_due' || status === 'unpaid') return 'past_due'
  return 'free'
}

export interface RouterOps {
  setPlanByUserId: (userId: string, patch: Record<string, unknown>) => Promise<void>
  setPlanBySubId: (subId: string, patch: Record<string, unknown>) => Promise<void>
  reactivateIfPastDue: (subId: string) => Promise<void>
  fetchEmail: (userId: string) => Promise<string | null>
  fetchFirstSlug: (userId: string) => Promise<string | null>
  sendWelcome: (email: string, slug: string | null) => Promise<void>
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function routeStripeEvent(event: any, ops: RouterOps): Promise<string> {
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object
      const userId = session.metadata?.userId
      if (!userId) return 'noop:no-user'
      await ops.setPlanByUserId(userId, {
        plan: 'pro',
        stripe_subscription_id: session.subscription,
        stripe_customer_id: session.customer,
      })
      const email = await ops.fetchEmail(userId)
      if (email) {
        const slug = await ops.fetchFirstSlug(userId)
        await ops.sendWelcome(email, slug)
      }
      return 'provisioned'
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object
      const newPlan = planFromStatus(sub.status as SubscriptionStatus)
      await ops.setPlanBySubId(sub.id, { plan: newPlan })
      return `updated:${newPlan}`
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object
      await ops.setPlanBySubId(sub.id, {
        plan: 'free',
        stripe_subscription_id: null,
      })
      return 'cancelled'
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object
      if (invoice.subscription) {
        await ops.setPlanBySubId(invoice.subscription, { plan: 'past_due' })
      }
      return 'past_due'
    }

    case 'invoice.paid': {
      const invoice = event.data.object
      if (invoice.subscription) {
        await ops.reactivateIfPastDue(invoice.subscription)
      }
      return 'reactivated'
    }

    default:
      return `unhandled:${event.type}`
  }
}
