-- Profiles table extends auth.users
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'estudiante',
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  rut TEXT,
  phone TEXT,
  avatar_url TEXT,
  grade_level grade_level,
  parent_id UUID REFERENCES profiles(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_profiles_parent ON profiles(parent_id) WHERE parent_id IS NOT NULL;
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE UNIQUE INDEX idx_profiles_rut ON profiles(rut) WHERE rut IS NOT NULL;

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_profiles_updated
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
