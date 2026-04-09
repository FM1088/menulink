/**
 * Email sending via Resend.
 *
 * Designed to fail gracefully: if RESEND_API_KEY is missing OR Resend errors,
 * the webhook should NOT crash. Email is a nice-to-have, not a hard requirement
 * for billing state to update.
 *
 * To enable in production:
 *   1. Sign up at https://resend.com (free tier: 3000 emails/month)
 *   2. Verify the menulink.page domain (DNS records)
 *   3. Set RESEND_API_KEY in env
 *   4. Optional: set EMAIL_FROM (defaults to "MenuLink <hello@menulink.page>")
 */
import { Resend } from 'resend'
import { renderWelcomeEmail } from '@/emails/welcome-pro'

export interface WelcomeEmailOptions {
  to: string
  slug: string | null
  appUrl: string
  venueName?: string
}

const FROM = process.env.EMAIL_FROM || 'MenuLink <hello@menulink.page>'

let _resend: Resend | null = null
function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY
  if (!key) return null
  if (!_resend) _resend = new Resend(key)
  return _resend
}

export async function sendWelcomeEmail(opts: WelcomeEmailOptions): Promise<void> {
  const resend = getResend()
  if (!resend) {
    console.log(
      '[email] RESEND_API_KEY not set, skipping welcome email to',
      opts.to,
    )
    return
  }

  try {
    const { html, text } = renderWelcomeEmail({
      slug: opts.slug,
      appUrl: opts.appUrl,
      venueName: opts.venueName,
    })

    await resend.emails.send({
      from: FROM,
      to: opts.to,
      subject: '🍽️ Welcome to MenuLink Pro — your QR poster is ready',
      html,
      text,
    })

    console.log('[email] welcome email sent to', opts.to)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    // Never throw — billing state must update even if email fails
    console.error('[email] welcome email failed:', err?.message || err)
  }
}
