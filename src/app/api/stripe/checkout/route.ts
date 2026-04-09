import { NextRequest, NextResponse } from 'next/server'
import { stripe, planPriceId, type PlanKey } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const getSupabase = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') || 'http://localhost:3000'

const VALID_PLANS: PlanKey[] = ['pro', 'locations']

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, email } = body
    const planParam: PlanKey = (body.plan as PlanKey) || 'pro'

    if (!VALID_PLANS.includes(planParam)) {
      return NextResponse.json(
        { error: `plan must be one of ${VALID_PLANS.join(', ')}` },
        { status: 400 },
      )
    }

    const priceId = planPriceId(planParam)
    if (!priceId) {
      return NextResponse.json(
        { error: `${planParam} price ID not configured` },
        { status: 503 },
      )
    }

    const supabase = getSupabase()

    // Get or create Stripe customer
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single()

    let customerId = profile?.stripe_customer_id

    if (!customerId) {
      const customer = await stripe.customers.create({
        email,
        metadata: { userId },
      })
      customerId = customer.id
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', userId)
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${APP_URL}/dashboard?upgraded=${planParam}`,
      cancel_url: `${APP_URL}/pricing`,
      metadata: { userId, plan: planParam },
      // 14-day free trial — replaces the free-forever tier per benchmark recs
      subscription_data: {
        trial_period_days: 14,
        metadata: { userId, plan: planParam },
      },
    })

    return NextResponse.json({ url: session.url })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error('[stripe checkout] failed', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
