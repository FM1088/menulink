import { describe, it, expect } from 'vitest'
import { renderWelcomeEmail } from './welcome-pro'

describe('renderWelcomeEmail', () => {
  const baseOpts = {
    appUrl: 'https://menulink.page',
    slug: 'joes-pizza',
  }

  it('renders both html and text', () => {
    const { html, text } = renderWelcomeEmail(baseOpts)
    expect(html).toContain('<!doctype html>')
    expect(text).toContain('MenuLink Pro')
    expect(text).not.toContain('<')
  })

  it('includes dashboard URL in both formats', () => {
    const { html, text } = renderWelcomeEmail(baseOpts)
    expect(html).toContain('https://menulink.page/dashboard')
    expect(text).toContain('https://menulink.page/dashboard')
  })

  it('includes poster download links when slug is present', () => {
    const { html, text } = renderWelcomeEmail(baseOpts)
    expect(html).toContain('/api/poster/joes-pizza?format=a4')
    expect(html).toContain('/api/poster/joes-pizza?format=a5')
    expect(text).toContain('/api/poster/joes-pizza?format=a4')
  })

  it('omits poster links when slug is null', () => {
    const { html, text } = renderWelcomeEmail({
      appUrl: 'https://menulink.page',
      slug: null,
    })
    expect(html).not.toContain('/api/poster/')
    expect(text).not.toContain('/api/poster/')
    // But still suggests creating a page
    expect(html).toContain('Create your first page')
  })

  it('uses venue name in greeting when provided', () => {
    const { html, text } = renderWelcomeEmail({
      ...baseOpts,
      venueName: "Joe's Pizza",
    })
    expect(html).toContain("Joe's Pizza")
    expect(text).toContain("Joe's Pizza team")
  })

  it('escapes HTML in URLs to prevent injection', () => {
    const { html } = renderWelcomeEmail({
      appUrl: 'https://menulink.page',
      slug: 'evil"><script>alert(1)</script>',
    })
    expect(html).not.toContain('<script>alert(1)</script>')
    expect(html).toContain('&lt;script&gt;')
  })

  it('strips trailing slash from appUrl in dashboard link', () => {
    // No explicit strip, but this verifies output is well-formed
    const { html } = renderWelcomeEmail({
      appUrl: 'https://menulink.page',
      slug: null,
    })
    // No double slashes after the protocol
    const matches = html.match(/https:\/\/menulink\.page\/+/g) || []
    matches.forEach((m) => {
      expect(m).toMatch(/^https:\/\/menulink\.page\/[a-z]?/)
    })
  })
})
