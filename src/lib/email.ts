/**
 * Email sending — currently no-op stub. Real Resend impl lands in Phase 4.
 *
 * Designed to fail gracefully: if RESEND_API_KEY is missing OR Resend errors,
 * the webhook should NOT crash. Email is a nice-to-have, not a hard requirement
 * for billing state to update.
 */

export interface WelcomeEmailOptions {
  to: string
  slug: string | null
  appUrl: string
}

export async function sendWelcomeEmail(opts: WelcomeEmailOptions): Promise<void> {
  // Phase 4 will replace this with Resend integration. For now, log only.
  if (!process.env.RESEND_API_KEY) {
    console.log('[email] RESEND_API_KEY not set, skipping welcome email to', opts.to)
    return
  }
  // Resend impl arrives in Phase 4
  console.log('[email] welcome email queued for', opts.to, 'slug=', opts.slug)
}
