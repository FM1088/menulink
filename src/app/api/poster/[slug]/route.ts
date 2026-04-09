import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { generatePosterPdf, type PosterFormat } from '@/lib/poster-generator'

export const dynamic = 'force-dynamic'

const getSupabase = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') || 'http://localhost:3000'

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } },
) {
  try {
    const { slug } = params
    if (!slug) {
      return NextResponse.json({ error: 'slug required' }, { status: 400 })
    }

    const formatParam = req.nextUrl.searchParams.get('format') ?? 'a4'
    const format: PosterFormat = formatParam === 'a5' ? 'a5' : 'a4'

    const supabase = getSupabase()

    // Lookup page + owner plan in one shot
    const { data: page, error } = await supabase
      .from('pages')
      .select('id, name, slug, published, user_id, profiles!inner(plan)')
      .eq('slug', slug)
      .single()

    if (error || !page) {
      return NextResponse.json({ error: 'page not found' }, { status: 404 })
    }

    if (!page.published) {
      return NextResponse.json(
        { error: 'page is unpublished — publish it to download a poster' },
        { status: 403 },
      )
    }

    // Supabase returns nested as object or array depending on relationship; handle both
    const profile = Array.isArray(page.profiles) ? page.profiles[0] : page.profiles
    const plan = (profile?.plan ?? 'free') as 'free' | 'pro' | 'past_due'

    const pdfBytes = await generatePosterPdf({
      venueName: page.name || 'My Restaurant',
      url: `${APP_URL}/${page.slug}`,
      format,
      plan,
    })

    const filename = `menulink-poster-${page.slug}-${format}.pdf`

    return new NextResponse(pdfBytes as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'private, no-store',
      },
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error('[poster] generation failed', err)
    return NextResponse.json(
      { error: err?.message || 'poster generation failed' },
      { status: 500 },
    )
  }
}
