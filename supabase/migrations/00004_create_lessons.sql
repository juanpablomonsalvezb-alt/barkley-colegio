CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  lesson_type lesson_type NOT NULL DEFAULT 'mixto',
  display_order INT NOT NULL,
  is_published BOOLEAN NOT NULL DEFAULT false,
  video_url TEXT,
  video_duration_seconds INT,
  content_html TEXT,
  summary_pdf_url TEXT,
  difficulty_level INT NOT NULL DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 5),
  estimated_minutes INT NOT NULL DEFAULT 15,
  prerequisites JSONB DEFAULT '[]',
  reinforcement_content_html TEXT,
  reinforcement_video_url TEXT,
  challenge_content_html TEXT,
  challenge_project_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(unit_id, display_order)
);

CREATE INDEX idx_lessons_unit ON lessons(unit_id);

CREATE TABLE lesson_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  url TEXT NOT NULL,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_lesson_resources_lesson ON lesson_resources(lesson_id);

CREATE TRIGGER tr_lessons_updated BEFORE UPDATE ON lessons FOR EACH ROW EXECUTE FUNCTION update_updated_at();
