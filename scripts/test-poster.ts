/**
 * Local visual QA for poster generator.
 *
 * Usage: npx tsx scripts/test-poster.ts
 * Outputs PDFs to ./tmp/posters/
 */
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { generatePosterPdf } from '../src/lib/poster-generator'

async function main() {
  const outDir = join(process.cwd(), 'tmp', 'posters')
  await mkdir(outDir, { recursive: true })

  const cases = [
    { name: "Joe's Pizza", slug: 'joes-pizza', plan: 'free' as const, format: 'a4' as const },
    { name: "Joe's Pizza", slug: 'joes-pizza', plan: 'pro' as const, format: 'a4' as const },
    { name: 'The Local Bistro & Wine Bar', slug: 'local-bistro', plan: 'pro' as const, format: 'a4' as const },
    { name: 'Sushi Hana', slug: 'sushi-hana', plan: 'free' as const, format: 'a5' as const },
    { name: 'Bún Bò Huế Saigon Express', slug: 'bun-bo-hue', plan: 'pro' as const, format: 'a5' as const },
  ]

  for (const c of cases) {
    const pdf = await generatePosterPdf({
      venueName: c.name,
      url: `https://menulink.page/${c.slug}`,
      format: c.format,
      plan: c.plan,
    })
    const filename = `${c.slug}-${c.plan}-${c.format}.pdf`
    await writeFile(join(outDir, filename), pdf)
    console.log(`✓ ${filename} (${pdf.length} bytes)`)
  }

  console.log(`\nWrote ${cases.length} test posters to ${outDir}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
