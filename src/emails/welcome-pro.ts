/**
 * Welcome email template (HTML + plain-text) for new MenuLink Pro subscribers.
 *
 * No React Email runtime — just template strings, keeps the dependency
 * footprint small and works in serverless without bundling React.
 */

export interface WelcomeEmailData {
  slug: string | null
  appUrl: string
  venueName?: string
}

export interface RenderedEmail {
  html: string
  text: string
}

export function renderWelcomeEmail(data: WelcomeEmailData): RenderedEmail {
  const { slug, appUrl, venueName } = data
  const dashboardUrl = `${appUrl}/dashboard`
  const pageUrl = slug ? `${appUrl}/${slug}` : null
  const posterA4Url = slug ? `${appUrl}/api/poster/${slug}?format=a4` : null
  const posterA5Url = slug ? `${appUrl}/api/poster/${slug}?format=a5` : null
  const greeting = venueName ? `Hey ${venueName} team` : 'Hey there'

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Welcome to MenuLink Pro</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#ffffff;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0a0a0a;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:#111;border:1px solid #222;border-radius:12px;overflow:hidden;">
          <tr>
            <td style="background:linear-gradient(135deg,#f97316,#fbbf24);padding:24px;text-align:center;">
              <h1 style="margin:0;font-size:24px;color:#0a0a0a;font-weight:800;">MenuLink<span style="color:#7c2d12;">.page</span></h1>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 32px 16px;">
              <h2 style="margin:0 0 16px;font-size:22px;color:#fff;">${greeting} 👋</h2>
              <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#d4d4d8;">
                You're officially on <strong style="color:#fb923c;">MenuLink Pro</strong>. Thanks for backing us — every subscription helps us build better tools for restaurants.
              </p>
              <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#d4d4d8;">
                Here's everything you've unlocked:
              </p>
              <ul style="margin:0 0 24px;padding-left:20px;font-size:14px;line-height:1.8;color:#d4d4d8;">
                <li>Unlimited restaurant pages</li>
                <li>All 3 templates (Minimal, Photo Hero, Elegant)</li>
                <li>Analytics dashboard with click tracking</li>
                <li>Custom domain support</li>
                <li>Printable QR poster PDFs (A4 + A5)</li>
                <li>No MenuLink branding on your pages</li>
              </ul>
              ${
                pageUrl
                  ? `<p style="margin:0 0 12px;font-size:15px;color:#fb923c;font-weight:600;">Your live page:</p>
              <p style="margin:0 0 24px;"><a href="${escapeHtml(pageUrl)}" style="color:#fbbf24;text-decoration:none;font-size:15px;">${escapeHtml(pageUrl)}</a></p>`
                  : ''
              }
              ${
                posterA4Url
                  ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0;">
                <tr>
                  <td style="padding-right:12px;">
                    <a href="${escapeHtml(posterA4Url)}" style="display:inline-block;background:#f97316;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">📄 Download A4 Poster</a>
                  </td>
                  <td>
                    <a href="${escapeHtml(posterA5Url || '')}" style="display:inline-block;background:#27272a;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;border:1px solid #3f3f46;">📄 A5 Version</a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 24px;font-size:13px;line-height:1.6;color:#a1a1aa;">
                Print it, stick it on your tables, windows, and receipts. Customers scan the QR → see your menu, bookings, and links instantly.
              </p>`
                  : `<p style="margin:0 0 24px;font-size:14px;color:#a1a1aa;">
                <em>Tip:</em> Create your first page and publish it to unlock the QR poster PDF generator.
              </p>`
              }
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0;">
                <tr>
                  <td>
                    <a href="${escapeHtml(dashboardUrl)}" style="display:inline-block;background:#fb923c;color:#0a0a0a;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;">Go to Dashboard →</a>
                  </td>
                </tr>
              </table>
              <p style="margin:24px 0 0;font-size:13px;line-height:1.6;color:#a1a1aa;">
                Questions? Just reply to this email — it goes straight to a human, not a ticketing system.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px;background:#0a0a0a;border-top:1px solid #222;text-align:center;">
              <p style="margin:0;font-size:12px;color:#71717a;">
                MenuLink.page · Made for restaurants · <a href="${escapeHtml(appUrl)}" style="color:#fb923c;text-decoration:none;">menulink.page</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

  const text = [
    `${greeting},`,
    '',
    "You're officially on MenuLink Pro. Thanks for backing us!",
    '',
    "Here's everything you've unlocked:",
    '  • Unlimited restaurant pages',
    '  • All 3 templates (Minimal, Photo Hero, Elegant)',
    '  • Analytics dashboard with click tracking',
    '  • Custom domain support',
    '  • Printable QR poster PDFs (A4 + A5)',
    '  • No MenuLink branding',
    '',
    pageUrl ? `Your live page: ${pageUrl}` : '',
    posterA4Url ? `Download A4 poster: ${posterA4Url}` : '',
    posterA5Url ? `Download A5 poster: ${posterA5Url}` : '',
    '',
    `Go to dashboard: ${dashboardUrl}`,
    '',
    'Questions? Just reply to this email.',
    '',
    '— MenuLink.page',
  ]
    .filter(Boolean)
    .join('\n')

  return { html, text }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
