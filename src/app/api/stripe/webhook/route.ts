import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import { sendWelcomeEmail } from '@/lib/email'

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

  try {
    switch (event.type) {
      // ─── Initial Pro purchase ───────────────────────────────
      case 'checkout.session.completed': {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const session = event.data.object as any
        const userId = session.metadata?.userId
        if (!userId) break

        const { data: updated } = await supabase
          .from('profiles')
          .update({
            plan: 'pro',
            stripe_subscription_id: session.subscription,
            stripe_customer_id: session.customer,
          })
          .eq('id', userId)
          .select('email')
          .single()

        // Fire welcome email — also fetches first published page slug if any
        if (updated?.email) {
          const { data: firstPage } = await supabase
            .from('pages')
            .select('slug')
            .eq('user_id', userId)
            .order('created_at', { ascending: true })
            .limit(1)
            .maybeSingle()

          await sendWelcomeEmail({
            to: updated.email,
            slug: firstPage?.slug ?? null,
            appUrl: APP_URL,
          }).catch((e) =>
            console.error('[stripe webhook] welcome email failed', e),
          )
        }
        break
      }

      // ─── Subscription state changed (renewal, plan change, manual edit) ──
      case 'customer.subscription.updated': {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sub = event.data.object as any
        const status = sub.status as string
        const newPlan =
          status === 'active' || status === 'trialing'
            ? 'pro'
            : status === 'past_due' || status === 'unpaid'
              ? 'past_due'
              : 'free'

        await supabase
          .from('profiles')
          .update({ plan: newPlan })
          .eq('stripe_subscription_id', sub.id)
        break
      }

      // ─── Cancellation ───────────────────────────────────────
      case 'customer.subscription.deleted': {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sub = event.data.object as any
        await supabase
          .from('profiles')
          .update({ plan: 'free', stripe_subscription_id: null })
          .eq('stripe_subscription_id', sub.id)
        break
      }

      // ─── Payment failed (downgrade to past_due, do not strip access yet) ─
      case 'invoice.payment_failed': {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const invoice = event.data.object as any
        const subId = invoice.subscription
        if (subId) {
          await supabase
            .from('profiles')
            .update({ plan: 'past_due' })
            .eq('stripe_subscription_id', subId)
        }
        break
      }

      // ─── Payment succeeded after past_due → reactivate ──────
      case 'invoice.paid': {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const invoice = event.data.object as any
        const subId = invoice.subscription
        if (subId) {
          await supabase
            .from('profiles')
            .update({ plan: 'pro' })
            .eq('stripe_subscription_id', subId)
            .eq('plan', 'past_due')
        }
        break
      }

      default:
        // Unhandled event types are intentional no-ops
        break
    }
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
