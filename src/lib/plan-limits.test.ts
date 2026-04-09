import { describe, it, expect } from 'vitest'
import { canPublishAnother, upgradeCtaForCap } from './plan-limits'

describe('canPublishAnother', () => {
  it('free plan allows 1 published page', () => {
    expect(canPublishAnother('free', 0).ok).toBe(true)
    expect(canPublishAnother('free', 1).ok).toBe(false)
  })

  it('pro plan allows 1 published page (single venue)', () => {
    expect(canPublishAnother('pro', 0).ok).toBe(true)
    expect(canPublishAnother('pro', 1).ok).toBe(false)
  })

  it('locations plan allows up to 5 published pages', () => {
    expect(canPublishAnother('locations', 0).ok).toBe(true)
    expect(canPublishAnother('locations', 4).ok).toBe(true)
    expect(canPublishAnother('locations', 5).ok).toBe(false)
  })

  it('bundle plan allows 1 published page (matches Pro)', () => {
    expect(canPublishAnother('bundle', 0).ok).toBe(true)
    expect(canPublishAnother('bundle', 1).ok).toBe(false)
  })

  it('past_due users keep their privileges (Stripe handles dunning)', () => {
    expect(canPublishAnother('past_due', 100).ok).toBe(true)
  })

  it('returns reason and counts when blocked', () => {
    const result = canPublishAnother('locations', 5)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.cap).toBe(5)
      expect(result.current).toBe(5)
      expect(result.reason).toContain('5')
    }
  })
})

describe('upgradeCtaForCap', () => {
  it('free plan suggests Pro and Locations', () => {
    const cta = upgradeCtaForCap('free')
    expect(cta.title).toContain('Upgrade')
    expect(cta.body).toContain('$14')
    expect(cta.body).toContain('$24')
    expect(cta.href).toBe('/pricing')
  })

  it('pro plan suggests Locations upgrade', () => {
    const cta = upgradeCtaForCap('pro')
    expect(cta.body).toContain('Locations')
    expect(cta.body).toContain('$24')
    expect(cta.href).toContain('plan=locations')
  })

  it('locations plan suggests contact for 6+', () => {
    const cta = upgradeCtaForCap('locations')
    expect(cta.title).toContain('cap')
    expect(cta.href).toContain('mailto')
  })
})
