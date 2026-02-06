import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const getSupabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { pageId, type, linkId } = await req.json()
    if (!pageId || !type) return NextResponse.json({ error: 'Missing params' }, { status: 400 })
    if (!['view', 'click'].includes(type)) return NextResponse.json({ error: 'Invalid type' }, { status: 400 })

    const referrer = req.headers.get('referer') || null
    const userAgent = req.headers.get('user-agent') || null

    const supabase = getSupabase()
    
    // Record analytics event
    const { error } = await supabase.rpc('record_analytics', {
      p_page_id: pageId,
      p_event_type: type,
      p_link_id: linkId || null,
      p_referrer: referrer,
      p_user_agent: userAgent
    })

    if (error) {
      console.error('Analytics error:', error)
      return NextResponse.json({ error: 'Failed to record' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('Analytics exception:', e)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

// GET endpoint for fetching analytics summary
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const pageId = searchParams.get('pageId')
    const days = parseInt(searchParams.get('days') || '30')

    if (!pageId) return NextResponse.json({ error: 'Missing pageId' }, { status: 400 })

    const supabase = getSupabase()
    
    const { data, error } = await supabase.rpc('get_analytics_summary', {
      p_page_id: pageId,
      p_days: days
    })

    if (error) {
      console.error('Analytics fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (e) {
    console.error('Analytics exception:', e)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
