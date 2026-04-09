-- Structured menu items + sections
-- Created: 2026-04-09 (Phase B of post-benchmark sprint)
--
-- This is THE moat. Per the competitive benchmark, structured menu items
-- (with prices, allergens, dietary flags) are what separates a "link-in-bio
-- with restaurant skin" from an actual menu product. None of Linktree,
-- Beacons, Carrd, Bento ship this. MustHaveMenus does, at $49/mo.
--
-- Sections + items are stored as a flat tree on the page (one query loads
-- both). Sections give the menu structure (Starters, Mains, Drinks, Desserts).

CREATE TABLE IF NOT EXISTS menu_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_menu_sections_page ON menu_sections(page_id, sort_order);

CREATE TABLE IF NOT EXISTS menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  section_id UUID REFERENCES menu_sections(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  -- Price stored as integer cents to avoid float drift
  price_cents INTEGER,
  currency TEXT NOT NULL DEFAULT 'AUD',
  -- Dietary flags (vegan, vegetarian, gluten-free, dairy-free, halal, kosher, keto, nut-free, spicy)
  dietary TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  -- Allergens (gluten, dairy, nuts, eggs, soy, shellfish, fish, sesame)
  allergens TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  photo_url TEXT,
  available BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_menu_items_page ON menu_items(page_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_menu_items_section ON menu_items(section_id, sort_order);

-- RLS: only page owner can mutate
ALTER TABLE menu_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

-- Public read for published pages
CREATE POLICY "menu_sections_public_read" ON menu_sections
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM pages WHERE pages.id = menu_sections.page_id AND pages.published = TRUE)
  );

CREATE POLICY "menu_items_public_read" ON menu_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM pages WHERE pages.id = menu_items.page_id AND pages.published = TRUE)
  );

-- Owner write
CREATE POLICY "menu_sections_owner_write" ON menu_sections
  FOR ALL USING (
    EXISTS (SELECT 1 FROM pages WHERE pages.id = menu_sections.page_id AND pages.user_id = auth.uid())
  );

CREATE POLICY "menu_items_owner_write" ON menu_items
  FOR ALL USING (
    EXISTS (SELECT 1 FROM pages WHERE pages.id = menu_items.page_id AND pages.user_id = auth.uid())
  );

-- Owner read (so editor can load drafts)
CREATE POLICY "menu_sections_owner_read" ON menu_sections
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM pages WHERE pages.id = menu_sections.page_id AND pages.user_id = auth.uid())
  );

CREATE POLICY "menu_items_owner_read" ON menu_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM pages WHERE pages.id = menu_items.page_id AND pages.user_id = auth.uid())
  );

-- updated_at auto-bump
CREATE OR REPLACE FUNCTION touch_menu_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS menu_sections_touch ON menu_sections;
CREATE TRIGGER menu_sections_touch
  BEFORE UPDATE ON menu_sections
  FOR EACH ROW EXECUTE FUNCTION touch_menu_updated_at();

DROP TRIGGER IF EXISTS menu_items_touch ON menu_items;
CREATE TRIGGER menu_items_touch
  BEFORE UPDATE ON menu_items
  FOR EACH ROW EXECUTE FUNCTION touch_menu_updated_at();
