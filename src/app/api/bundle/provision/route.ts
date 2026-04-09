/**
 * POST /api/bundle/provision
 *
 * Cross-product provisioning endpoint called by the ReviewReply backend
 * after a successful bundle checkout.
 *
 * ReviewReply's webhook handler will call this when:
 *   - A user purchases ReviewReply Pro WITH the MenuLink bundle, OR
 *   - An existing ReviewReply Pro user adds the MenuLink bundle later, OR
 *   - A ReviewReply Pro+Bundle user cancels the bundle (action='downgrade')
 *
 * Auth: Bearer token matching BUNDLE_SHARED_SECRET env var.
 * Request:
 *   {
 *     action: 'provision' | 'downgrade',
 *     userId?: string,           // Supabase auth user ID if shared between apps
 *     email: string,             // Always provided as fallback identifier
 *     stripeCustomerId?: string, // ReviewReply's Stripe customer ID
 *     reviewReplySubId?: string, // ReviewReply's subscription ID for traceability
 *   }
 * Response:
 *   { ok: true, action: 'provisioned' | 'downgraded' | 'noop', userId: string }
 *
 * Idempotency: Calling provision twice is a no-op. Calling downgrade on a
 * non-bundle user is a no-op.
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const getSupabase = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

interface ProvisionRequest {
  action: 'provision' | 'downgrade'
  userId?: string
  email: string
  stripeCustomerId?: string
  reviewReplySubId?: string
}

export async function POST(req: NextRequest) {
  // Auth: shared secret (rotate via env var)
  const authHeader = req.headers.get('authorization') || ''
  const sharedSecret = process.env.BUNDLE_SHARED_SECRET
  if (!sharedSecret) {
    return NextResponse.json(
      { error: 'BUNDLE_SHARED_SECRET not configured' },
      { status: 503 },
    )
  }
  const providedToken = authHeader.replace(/^Bearer\s+/i, '')
  if (providedToken !== sharedSecret) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  let body: ProvisionRequest
  try {
    body = (await req.json()) as ProvisionRequest
  } catch {
    return NextResponse.json({ error: 'invalid JSON' }, { status: 400 })
  }

  const { action, userId, email, stripeCustomerId, reviewReplySubId } = body

  if (!action || !email) {
    return NextResponse.json(
      { error: 'action and email are required' },
      { status: 400 },
    )
  }
  if (action !== 'provision' && action !== 'downgrade') {
    return NextResponse.json(
      { error: 'action must be provision or downgrade' },
      { status: 400 },
    )
  }

  const supabase = getSupabase()

  // Resolve user: prefer userId (if shared Supabase project), fall back to email lookup
  let resolvedId: string | null = null
  if (userId) {
    const { data } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle()
    if (data) resolvedId = data.id
  }
  if (!resolvedId) {
    const { data } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle()
    if (data) resolvedId = data.id
  }

  if (!resolvedId) {
    // No matching MenuLink profile yet — this is fine for provision; the user
    // will get auto-provisioned when they sign up with the same email.
    // We log the pending bundle so signup hook can pick it up.
    if (action === 'provision') {
      await supabase.from('pending_bundle_grants').upsert(
        {
          email: email.toLowerCase(),
          stripe_customer_id: stripeCustomerId ?? null,
          reviewreply_sub_id: reviewReplySubId ?? null,
          created_at: new Date().toISOString(),
        },
        { onConflict: 'email' },
      )
      return NextResponse.json({
        ok: true,
        action: 'queued',
        message: 'no MenuLink profile yet — will provision on signup',
      })
    }
    return NextResponse.json({
      ok: true,
      action: 'noop',
      message: 'no MenuLink profile to downgrade',
    })
  }

  if (action === 'provision') {
    await supabase
      .from('profiles')
      .update({
        plan: 'pro',
        bundle_source: 'reviewreply',
        bundle_external_sub_id: reviewReplySubId ?? null,
        stripe_customer_id: stripeCustomerId ?? undefined,
      })
      .eq('id', resolvedId)
    return NextResponse.json({
      ok: true,
      action: 'provisioned',
      userId: resolvedId,
    })
  }

  // downgrade
  await supabase
    .from('profiles')
    .update({
      plan: 'free',
      bundle_source: null,
      bundle_external_sub_id: null,
    })
    .eq('id', resolvedId)
    .eq('bundle_source', 'reviewreply')
  return NextResponse.json({
    ok: true,
    action: 'downgraded',
    userId: resolvedId,
  })
}
