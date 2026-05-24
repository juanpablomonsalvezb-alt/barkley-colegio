CREATE TABLE adaptive_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  min_score_percent INT NOT NULL,
  max_score_percent INT NOT NULL,
  path adaptive_path NOT NULL,
  next_action JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(lesson_id, path)
);

CREATE INDEX idx_adaptive_rules_lesson ON adaptive_rules(lesson_id);

CREATE TABLE reinforcement_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  question_type question_type NOT NULL DEFAULT 'opcion_multiple',
  question_text TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer JSONB NOT NULL,
  feedback_correct TEXT NOT NULL,
  feedback_incorrect TEXT NOT NULL,
  difficulty_level INT NOT NULL DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 3),
  display_order INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_reinforcement_questions_lesson ON reinforcement_questions(lesson_id);
