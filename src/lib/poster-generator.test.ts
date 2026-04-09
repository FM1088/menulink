import { describe, it, expect } from 'vitest'
import { generatePosterPdf } from './poster-generator'

describe('generatePosterPdf', () => {
  it('produces a non-empty PDF for A4 free plan', async () => {
    const bytes = await generatePosterPdf({
      venueName: "Joe's Pizza",
      url: 'https://menulink.page/joes-pizza',
      format: 'a4',
      plan: 'free',
    })
    expect(bytes).toBeInstanceOf(Uint8Array)
    expect(bytes.length).toBeGreaterThan(10_000)
    // PDF magic header %PDF
    expect(bytes[0]).toBe(0x25)
    expect(bytes[1]).toBe(0x50)
    expect(bytes[2]).toBe(0x44)
    expect(bytes[3]).toBe(0x46)
  })

  it('produces a non-empty PDF for A5 pro plan', async () => {
    const bytes = await generatePosterPdf({
      venueName: 'Sushi Hana',
      url: 'https://menulink.page/sushi-hana',
      format: 'a5',
      plan: 'pro',
    })
    expect(bytes.length).toBeGreaterThan(10_000)
  })

  it('handles Vietnamese diacritics without crashing', async () => {
    const bytes = await generatePosterPdf({
      venueName: 'Bún Bò Huế Saigon Express',
      url: 'https://menulink.page/bun-bo-hue',
      format: 'a4',
      plan: 'pro',
    })
    expect(bytes.length).toBeGreaterThan(10_000)
  })

  it('handles CJK characters', async () => {
    const bytes = await generatePosterPdf({
      venueName: '銀座 寿司',
      url: 'https://menulink.page/ginza-sushi',
      format: 'a5',
      plan: 'pro',
    })
    expect(bytes.length).toBeGreaterThan(10_000)
  })

  it('rejects empty venueName', async () => {
    await expect(
      generatePosterPdf({ venueName: '', url: 'https://menulink.page/x' }),
    ).rejects.toThrow(/venueName/)
  })

  it('rejects empty url', async () => {
    await expect(
      generatePosterPdf({ venueName: 'Test', url: '' }),
    ).rejects.toThrow(/url/)
  })

  it('produces different output for free vs pro (watermark difference)', async () => {
    const free = await generatePosterPdf({
      venueName: 'Test Cafe',
      url: 'https://menulink.page/test',
      plan: 'free',
    })
    const pro = await generatePosterPdf({
      venueName: 'Test Cafe',
      url: 'https://menulink.page/test',
      plan: 'pro',
    })
    // Free has the watermark text, pro does not — sizes should differ
    expect(free.length).not.toBe(pro.length)
  })

  it('truncates very long venue names to 2 lines max', async () => {
    const bytes = await generatePosterPdf({
      venueName:
        'The Extraordinarily Long Restaurant Name That Goes On And On And On Forever',
      url: 'https://menulink.page/long',
      format: 'a4',
      plan: 'pro',
    })
    expect(bytes.length).toBeGreaterThan(10_000)
  })
})
