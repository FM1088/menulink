-- Bundle provisioning tables
-- Created: 2026-04-09 (24h sprint, Phase 6)
--
-- Supports cross-product bundle activation from ReviewReply.

-- Track which Pro users came from a bundle (so cancellation routes correctly)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS bundle_source TEXT,
  ADD COLUMN IF NOT EXISTS bundle_external_sub_id TEXT;

ALTER TABLE profiles
  ADD CONSTRAINT IF NOT EXISTS profiles_bundle_source_check
  CHECK (bundle_source IS NULL OR bundle_source IN ('reviewreply'));

CREATE INDEX IF NOT EXISTS idx_profiles_bundle_source
  ON profiles(bundle_source)
  WHERE bundle_source IS NOT NULL;

-- Queue table for users who buy bundle on ReviewReply BEFORE they have a
-- MenuLink account. On signup, the auto-profile trigger checks this table
-- and grants Pro automatically.
CREATE TABLE IF NOT EXISTS pending_bundle_grants (
  email TEXT PRIMARY KEY,
  stripe_customer_id TEXT,
  reviewreply_sub_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Update the auto-profile trigger to drain pending grants on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  pending RECORD;
BEGIN
  -- Check for a pending bundle grant matching this email
  SELECT * INTO pending
  FROM pending_bundle_grants
  WHERE email = LOWER(NEW.email);

  IF FOUND THEN
    INSERT INTO profiles (id, email, plan, bundle_source, bundle_external_sub_id, stripe_customer_id)
    VALUES (
      NEW.id,
      NEW.email,
      'pro',
      'reviewreply',
      pending.reviewreply_sub_id,
      pending.stripe_customer_id
    );
    DELETE FROM pending_bundle_grants WHERE email = LOWER(NEW.email);
  ELSE
    INSERT INTO profiles (id, email) VALUES (NEW.id, NEW.email);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
