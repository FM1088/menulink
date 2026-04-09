import { PDFDocument, PDFFont, rgb, PageSizes } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'
import QRCode from 'qrcode'
import { readFile } from 'fs/promises'
import { join } from 'path'

export type PosterFormat = 'a4' | 'a5'
export type PosterPlan = 'free' | 'pro' | 'past_due'

export interface PosterOptions {
  venueName: string
  url: string
  format?: PosterFormat
  plan?: PosterPlan
  tagline?: string
}

const PAGE_SIZES: Record<PosterFormat, [number, number]> = {
  a4: PageSizes.A4, // 595.28 x 841.89 pt
  a5: PageSizes.A5, // 419.53 x 595.28 pt
}

// Cache fonts in module scope so we read from disk only once per process
let _regularFontBytes: Uint8Array | null = null
let _boldFontBytes: Uint8Array | null = null

async function loadFontBytes(file: string): Promise<Uint8Array> {
  // src/assets/fonts is bundled with the route via Next's file tracing.
  // Path is resolved relative to project root at runtime.
  const path = join(process.cwd(), 'src', 'assets', 'fonts', file)
  const buf = await readFile(path)
  return new Uint8Array(buf)
}

async function getFonts(): Promise<{ regular: Uint8Array; bold: Uint8Array }> {
  if (!_regularFontBytes) {
    _regularFontBytes = await loadFontBytes('NotoSans-Regular.ttf')
  }
  if (!_boldFontBytes) {
    _boldFontBytes = await loadFontBytes('NotoSans-Bold.ttf')
  }
  return { regular: _regularFontBytes, bold: _boldFontBytes }
}

/**
 * Generate a printable QR poster PDF for a restaurant page.
 *
 * Free plan: includes "Powered by MenuLink.page" footer watermark.
 * Pro plan: no watermark, clean branding.
 */
export async function generatePosterPdf(opts: PosterOptions): Promise<Uint8Array> {
  const {
    venueName,
    url,
    format = 'a4',
    plan = 'free',
    tagline = 'Scan for menu, bookings & more',
  } = opts

  if (!venueName?.trim()) throw new Error('venueName is required')
  if (!url?.trim()) throw new Error('url is required')

  const showWatermark = plan === 'free'

  // Render QR code as PNG buffer (high contrast, large)
  const qrPngDataUrl = await QRCode.toDataURL(url, {
    errorCorrectionLevel: 'H',
    type: 'image/png',
    margin: 1,
    width: 1024,
    color: { dark: '#000000', light: '#ffffff' },
  })
  const qrPngBytes = Uint8Array.from(
    Buffer.from(qrPngDataUrl.split(',')[1], 'base64'),
  )

  const pdf = await PDFDocument.create()
  pdf.registerFontkit(fontkit)
  pdf.setTitle(`${venueName} — MenuLink Poster`)
  pdf.setAuthor('MenuLink.page')
  pdf.setCreator('MenuLink Poster Generator')
  pdf.setProducer('MenuLink.page')

  const [pageWidth, pageHeight] = PAGE_SIZES[format]
  const page = pdf.addPage([pageWidth, pageHeight])

  // Embed Noto Sans for full Unicode coverage (Vietnamese, Thai, CJK, etc.)
  const { regular, bold } = await getFonts()
  const helv: PDFFont = await pdf.embedFont(regular, { subset: true })
  const helvBold: PDFFont = await pdf.embedFont(bold, { subset: true })
  const qrImage = await pdf.embedPng(qrPngBytes)

  // Layout constants (proportional to page width)
  const margin = pageWidth * 0.08
  const innerWidth = pageWidth - margin * 2

  const orange = rgb(0.976, 0.451, 0.086) // #f97316
  const black = rgb(0, 0, 0)
  const grey = rgb(0.42, 0.42, 0.42)

  // Header strip — orange band top
  page.drawRectangle({
    x: 0,
    y: pageHeight - pageHeight * 0.045,
    width: pageWidth,
    height: pageHeight * 0.045,
    color: orange,
  })

  // Venue name (large, bold, centered)
  const venueFontSize = format === 'a4' ? 38 : 28
  const wrappedVenue = wrapText(venueName, helvBold, venueFontSize, innerWidth)
  let venueY = pageHeight - margin - venueFontSize - 8
  for (const line of wrappedVenue) {
    const lineWidth = helvBold.widthOfTextAtSize(line, venueFontSize)
    page.drawText(line, {
      x: (pageWidth - lineWidth) / 2,
      y: venueY,
      size: venueFontSize,
      font: helvBold,
      color: black,
    })
    venueY -= venueFontSize * 1.15
  }

  // Tagline below venue
  const taglineSize = format === 'a4' ? 16 : 13
  const taglineWidth = helv.widthOfTextAtSize(tagline, taglineSize)
  page.drawText(tagline, {
    x: (pageWidth - taglineWidth) / 2,
    y: venueY - 8,
    size: taglineSize,
    font: helv,
    color: grey,
  })

  // QR code — large, centered
  const qrSize = Math.min(innerWidth * 0.75, pageHeight * 0.5)
  const qrX = (pageWidth - qrSize) / 2
  const qrY = (pageHeight - qrSize) / 2 - pageHeight * 0.03

  // White background card with subtle border around QR
  const cardPadding = 16
  page.drawRectangle({
    x: qrX - cardPadding,
    y: qrY - cardPadding,
    width: qrSize + cardPadding * 2,
    height: qrSize + cardPadding * 2,
    color: rgb(1, 1, 1),
    borderColor: rgb(0.9, 0.9, 0.9),
    borderWidth: 1,
  })

  page.drawImage(qrImage, {
    x: qrX,
    y: qrY,
    width: qrSize,
    height: qrSize,
  })

  // CTA below QR
  const ctaText = 'SCAN ME'
  const ctaSize = format === 'a4' ? 22 : 18
  const ctaWidth = helvBold.widthOfTextAtSize(ctaText, ctaSize)
  page.drawText(ctaText, {
    x: (pageWidth - ctaWidth) / 2,
    y: qrY - 36,
    size: ctaSize,
    font: helvBold,
    color: orange,
  })

  // URL display under CTA
  const displayUrl = url.replace(/^https?:\/\//, '').replace(/\/$/, '')
  const urlSize = format === 'a4' ? 11 : 9
  const urlWidth = helv.widthOfTextAtSize(displayUrl, urlSize)
  page.drawText(displayUrl, {
    x: (pageWidth - urlWidth) / 2,
    y: qrY - 56,
    size: urlSize,
    font: helv,
    color: grey,
  })

  // Footer — watermark for free plan, clean for pro
  if (showWatermark) {
    const footer = 'Powered by MenuLink.page — get yours free'
    const footerSize = format === 'a4' ? 10 : 8
    const footerWidth = helv.widthOfTextAtSize(footer, footerSize)
    page.drawText(footer, {
      x: (pageWidth - footerWidth) / 2,
      y: margin / 2,
      size: footerSize,
      font: helv,
      color: grey,
    })
  }

  // Bottom orange strip
  page.drawRectangle({
    x: 0,
    y: 0,
    width: pageWidth,
    height: pageHeight * 0.012,
    color: orange,
  })

  return pdf.save()
}

/**
 * Naive word-wrap for venue names that exceed page width.
 * Returns up to 2 lines max.
 */
function wrapText(
  text: string,
  font: PDFFont,
  size: number,
  maxWidth: number,
): string[] {
  const f = font as { widthOfTextAtSize: (t: string, s: number) => number }
  if (f.widthOfTextAtSize(text, size) <= maxWidth) return [text]
  const words = text.split(/\s+/)
  const lines: string[] = []
  let current = ''
  for (const w of words) {
    const candidate = current ? `${current} ${w}` : w
    if (f.widthOfTextAtSize(candidate, size) <= maxWidth) {
      current = candidate
    } else {
      if (current) lines.push(current)
      current = w
      if (lines.length >= 1) break
    }
  }
  if (current) lines.push(current)
  return lines.slice(0, 2)
}
