CREATE TABLE quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  passing_score INT NOT NULL DEFAULT 60,
  time_limit_seconds INT,
  max_attempts INT NOT NULL DEFAULT 3,
  shuffle_questions BOOLEAN NOT NULL DEFAULT true,
  shuffle_options BOOLEAN NOT NULL DEFAULT true,
  show_correct_after BOOLEAN NOT NULL DEFAULT true,
  is_published BOOLEAN NOT NULL DEFAULT false,
  total_questions INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(lesson_id)
);

CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  question_type question_type NOT NULL DEFAULT 'opcion_multiple',
  question_text TEXT NOT NULL,
  question_image_url TEXT,
  display_order INT NOT NULL,
  points INT NOT NULL DEFAULT 1,
  difficulty_level INT NOT NULL DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 5),
  topic_tag TEXT,
  options JSONB NOT NULL,
  correct_answer JSONB NOT NULL,
  feedback_correct TEXT NOT NULL,
  feedback_incorrect TEXT NOT NULL,
  feedback_hint TEXT,
  feedback_per_option JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_questions_quiz ON questions(quiz_id);
CREATE INDEX idx_questions_topic ON questions(topic_tag) WHERE topic_tag IS NOT NULL;

CREATE TRIGGER tr_quizzes_updated BEFORE UPDATE ON quizzes FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_questions_updated BEFORE UPDATE ON questions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
