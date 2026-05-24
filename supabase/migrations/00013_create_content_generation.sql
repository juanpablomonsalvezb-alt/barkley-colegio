CREATE TABLE content_generation_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requested_by UUID NOT NULL REFERENCES profiles(id),
  target_type TEXT NOT NULL,
  target_lesson_id UUID REFERENCES lessons(id),
  target_course_id UUID REFERENCES courses(id),
  input_params JSONB NOT NULL,
  status content_gen_status NOT NULL DEFAULT 'pendiente',
  output_content JSONB,
  error_message TEXT,
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  model_used TEXT,
  tokens_used INT,
  generation_time_ms INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_content_gen_status ON content_generation_jobs(status);

CREATE TRIGGER tr_content_gen_updated BEFORE UPDATE ON content_generation_jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at();
