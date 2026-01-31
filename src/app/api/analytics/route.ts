import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { pageId, type } = await req.json()
    if (!pageId || !type) return NextResponse.json({ error: 'Missing params' }, { status: 400 })

    if (type === 'click') {
      await supabase.rpc('increment_clicks', { page_id: pageId })
    } else if (type === 'view') {
      await supabase.rpc('increment_views', { page_id: pageId })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
