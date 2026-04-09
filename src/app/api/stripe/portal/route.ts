import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const getSupabase = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') || 'http://localhost:3000'

/**
 * Create a Stripe customer billing portal session.
 *
 * Body: { userId: string }
 * Returns: { url: string }
 *
 * The user is redirected to Stripe-hosted UI where they can:
 *  - Update payment method
 *  - Cancel subscription
 *  - View invoices
 *  - Switch plans (if multiple prices configured)
 *
 * Returns to /dashboard?portal=closed when done.
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json()
    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 })
    }

    const supabase = getSupabase()
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('stripe_customer_id, plan')
      .eq('id', userId)
      .single()

    if (error || !profile) {
      return NextResponse.json({ error: 'profile not found' }, { status: 404 })
    }

    if (!profile.stripe_customer_id) {
      return NextResponse.json(
        { error: 'no Stripe customer — subscribe first' },
        { status: 400 },
      )
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${APP_URL}/dashboard?portal=closed`,
    })

    return NextResponse.json({ url: session.url })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error('[stripe portal] failed', err)
    return NextResponse.json(
      { error: err?.message || 'portal session failed' },
      { status: 500 },
    )
  }
}
