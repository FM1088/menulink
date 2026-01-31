-- MenuLink.page Database Schema

-- Profiles (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Restaurant Pages
CREATE TABLE IF NOT EXISTS pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL DEFAULT 'My Restaurant',
  description TEXT DEFAULT '',
  logo_url TEXT,
  hero_url TEXT,
  template TEXT NOT NULL DEFAULT 'minimal' CHECK (template IN ('minimal', 'photo-hero', 'elegant')),
  theme JSONB NOT NULL DEFAULT '{"primaryColor":"#f97316","backgroundColor":"#0a0a0a","textColor":"#ffffff","accentColor":"#fb923c","fontFamily":"Inter"}',
  links JSONB NOT NULL DEFAULT '[]',
  hours JSONB NOT NULL DEFAULT '[]',
  gallery JSONB NOT NULL DEFAULT '[]',
  published BOOLEAN NOT NULL DEFAULT false,
  views INTEGER NOT NULL DEFAULT 0,
  clicks INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_pages_user_id ON pages(user_id);
CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);
CREATE INDEX IF NOT EXISTS idx_pages_published ON pages(published);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email) VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Analytics RPC functions
CREATE OR REPLACE FUNCTION increment_views(page_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE pages SET views = views + 1 WHERE id = page_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_clicks(page_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE pages SET clicks = clicks + 1 WHERE id = page_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read/update their own
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Pages: users can CRUD their own, anyone can read published
CREATE POLICY "Users can CRUD own pages" ON pages
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Anyone can read published pages" ON pages
  FOR SELECT USING (published = true);

-- Storage bucket for uploads
-- Run in Supabase dashboard:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('uploads', 'uploads', true);
