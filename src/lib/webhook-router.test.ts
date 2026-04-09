import { describe, it, expect, vi, beforeEach } from 'vitest'
import { planFromStatus, routeStripeEvent, type RouterOps } from './webhook-router'

function createMockOps(): RouterOps & {
  calls: { method: string; args: unknown[] }[]
} {
  const calls: { method: string; args: unknown[] }[] = []
  return {
    calls,
    setPlanByUserId: vi.fn(async (...args) => {
      calls.push({ method: 'setPlanByUserId', args })
    }),
    setPlanBySubId: vi.fn(async (...args) => {
      calls.push({ method: 'setPlanBySubId', args })
    }),
    reactivateIfPastDue: vi.fn(async (...args) => {
      calls.push({ method: 'reactivateIfPastDue', args })
    }),
    fetchEmail: vi.fn(async () => 'test@example.com'),
    fetchFirstSlug: vi.fn(async () => 'test-slug'),
    sendWelcome: vi.fn(async (...args) => {
      calls.push({ method: 'sendWelcome', args })
    }),
  }
}

describe('planFromStatus', () => {
  it('maps active → pro', () => {
    expect(planFromStatus('active')).toBe('pro')
  })
  it('maps trialing → pro', () => {
    expect(planFromStatus('trialing')).toBe('pro')
  })
  it('maps past_due → past_due', () => {
    expect(planFromStatus('past_due')).toBe('past_due')
  })
  it('maps unpaid → past_due', () => {
    expect(planFromStatus('unpaid')).toBe('past_due')
  })
  it('maps canceled → free', () => {
    expect(planFromStatus('canceled')).toBe('free')
  })
  it('maps incomplete → free', () => {
    expect(planFromStatus('incomplete')).toBe('free')
  })
})

describe('routeStripeEvent', () => {
  let ops: ReturnType<typeof createMockOps>

  beforeEach(() => {
    ops = createMockOps()
  })

  it('checkout.session.completed → provisions Pro and sends welcome', async () => {
    const event = {
      type: 'checkout.session.completed',
      data: {
        object: {
          metadata: { userId: 'user-123' },
          subscription: 'sub_456',
          customer: 'cus_789',
        },
      },
    }
    const result = await routeStripeEvent(event, ops)
    expect(result).toBe('provisioned')
    expect(ops.setPlanByUserId).toHaveBeenCalledWith('user-123', {
      plan: 'pro',
      stripe_subscription_id: 'sub_456',
      stripe_customer_id: 'cus_789',
    })
    expect(ops.sendWelcome).toHaveBeenCalledWith('test@example.com', 'test-slug')
  })

  it('checkout.session.completed without userId is noop', async () => {
    const event = {
      type: 'checkout.session.completed',
      data: { object: { metadata: {} } },
    }
    const result = await routeStripeEvent(event, ops)
    expect(result).toBe('noop:no-user')
    expect(ops.setPlanByUserId).not.toHaveBeenCalled()
  })

  it('customer.subscription.updated active → pro', async () => {
    const event = {
      type: 'customer.subscription.updated',
      data: { object: { id: 'sub_1', status: 'active' } },
    }
    const result = await routeStripeEvent(event, ops)
    expect(result).toBe('updated:pro')
    expect(ops.setPlanBySubId).toHaveBeenCalledWith('sub_1', { plan: 'pro' })
  })

  it('customer.subscription.updated past_due → past_due', async () => {
    const event = {
      type: 'customer.subscription.updated',
      data: { object: { id: 'sub_1', status: 'past_due' } },
    }
    const result = await routeStripeEvent(event, ops)
    expect(result).toBe('updated:past_due')
  })

  it('customer.subscription.deleted → free + null sub', async () => {
    const event = {
      type: 'customer.subscription.deleted',
      data: { object: { id: 'sub_999' } },
    }
    const result = await routeStripeEvent(event, ops)
    expect(result).toBe('cancelled')
    expect(ops.setPlanBySubId).toHaveBeenCalledWith('sub_999', {
      plan: 'free',
      stripe_subscription_id: null,
    })
  })

  it('invoice.payment_failed → past_due', async () => {
    const event = {
      type: 'invoice.payment_failed',
      data: { object: { subscription: 'sub_pf' } },
    }
    const result = await routeStripeEvent(event, ops)
    expect(result).toBe('past_due')
    expect(ops.setPlanBySubId).toHaveBeenCalledWith('sub_pf', { plan: 'past_due' })
  })

  it('invoice.payment_failed without subscription is silent', async () => {
    const event = {
      type: 'invoice.payment_failed',
      data: { object: {} },
    }
    const result = await routeStripeEvent(event, ops)
    expect(result).toBe('past_due')
    expect(ops.setPlanBySubId).not.toHaveBeenCalled()
  })

  it('invoice.paid → reactivate (only if past_due)', async () => {
    const event = {
      type: 'invoice.paid',
      data: { object: { subscription: 'sub_paid' } },
    }
    const result = await routeStripeEvent(event, ops)
    expect(result).toBe('reactivated')
    expect(ops.reactivateIfPastDue).toHaveBeenCalledWith('sub_paid')
  })

  it('unhandled event type returns marker', async () => {
    const event = { type: 'product.created', data: { object: {} } }
    const result = await routeStripeEvent(event, ops)
    expect(result).toBe('unhandled:product.created')
  })
})
