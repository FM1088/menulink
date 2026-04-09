-- Locations plan support
-- Created: 2026-04-09 (Phase C of post-benchmark sprint)
--
-- Adds 'locations' to the plan check constraint so users on the $24/mo
-- Locations plan can have up to 5 published pages.

ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_plan_check;
ALTER TABLE profiles
  ADD CONSTRAINT profiles_plan_check
  CHECK (plan IN ('free', 'pro', 'locations', 'past_due'));
