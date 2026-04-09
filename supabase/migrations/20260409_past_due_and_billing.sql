-- Add 'past_due' plan state for failed payments + index for portal lookups
-- Created: 2026-04-09 (24h sprint)

-- Drop the old check constraint and replace with one that allows past_due
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_plan_check;
ALTER TABLE profiles
  ADD CONSTRAINT profiles_plan_check
  CHECK (plan IN ('free', 'pro', 'past_due'));

-- Index on stripe_customer_id for fast portal session lookups
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer
  ON profiles(stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;

-- Index on stripe_subscription_id for webhook updates
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_subscription
  ON profiles(stripe_subscription_id)
  WHERE stripe_subscription_id IS NOT NULL;
