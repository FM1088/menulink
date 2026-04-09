import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import { sendWelcomeEmail } from '@/lib/email'
import { routeStripeEvent, type RouterOps } from '@/lib/webhook-router'

export const dynamic = 'force-dynamic'

const getSupabase = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') || 'http://localhost:3000'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature' }, { status: 400 })
  }

  let event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!,
    )
  } catch (err) {
    console.error('[stripe webhook] invalid signature', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = getSupabase()

  const ops: RouterOps = {
    setPlanByUserId: async (userId, patch) => {
      await supabase.from('profiles').update(patch).eq('id', userId)
    },
    setPlanBySubId: async (subId, patch) => {
      await supabase
        .from('profiles')
        .update(patch)
        .eq('stripe_subscription_id', subId)
    },
    reactivateIfPastDue: async (subId) => {
      await supabase
        .from('profiles')
        .update({ plan: 'pro' })
        .eq('stripe_subscription_id', subId)
        .eq('plan', 'past_due')
    },
    fetchEmail: async (userId) => {
      const { data } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', userId)
        .maybeSingle()
      return data?.email ?? null
    },
    fetchFirstSlug: async (userId) => {
      const { data } = await supabase
        .from('pages')
        .select('slug')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle()
      return data?.slug ?? null
    },
    sendWelcome: async (email, slug) => {
      await sendWelcomeEmail({ to: email, slug, appUrl: APP_URL }).catch((e) =>
        console.error('[stripe webhook] welcome email failed', e),
      )
    },
  }

  try {
    const result = await routeStripeEvent(event, ops)
    console.log(`[stripe webhook] ${event.type} → ${result}`)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error('[stripe webhook] handler error', err)
    return NextResponse.json(
      { error: err?.message || 'webhook handler failed' },
      { status: 500 },
    )
  }

  return NextResponse.json({ ok: true })
}
