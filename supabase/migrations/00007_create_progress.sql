CREATE TABLE course_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  completed_lessons INT NOT NULL DEFAULT 0,
  total_lessons INT NOT NULL DEFAULT 0,
  completion_percent DECIMAL(5,2) NOT NULL DEFAULT 0,
  last_accessed_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(student_id, course_id)
);

CREATE INDEX idx_course_progress_student ON course_progress(student_id);

CREATE TABLE lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  video_watched BOOLEAN NOT NULL DEFAULT false,
  video_watch_percent DECIMAL(5,2) NOT NULL DEFAULT 0,
  content_read BOOLEAN NOT NULL DEFAULT false,
  quiz_completed BOOLEAN NOT NULL DEFAULT false,
  quiz_best_score DECIMAL(5,2),
  assigned_path adaptive_path,
  reinforcement_completed BOOLEAN NOT NULL DEFAULT false,
  challenge_completed BOOLEAN NOT NULL DEFAULT false,
  time_spent_seconds INT NOT NULL DEFAULT 0,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(student_id, lesson_id)
);

CREATE INDEX idx_lesson_progress_student ON lesson_progress(student_id);
CREATE INDEX idx_lesson_progress_lesson ON lesson_progress(lesson_id);

CREATE TABLE quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  attempt_number INT NOT NULL,
  score_earned INT NOT NULL,
  score_total INT NOT NULL,
  score_percent DECIMAL(5,2) NOT NULL,
  time_spent_seconds INT NOT NULL DEFAULT 0,
  assigned_path adaptive_path NOT NULL,
  answers JSONB NOT NULL DEFAULT '[]',
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_quiz_attempts_student ON quiz_attempts(student_id);
CREATE INDEX idx_quiz_attempts_quiz ON quiz_attempts(quiz_id);
CREATE INDEX idx_quiz_attempts_student_quiz ON quiz_attempts(student_id, quiz_id);

CREATE TABLE daily_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  activity_date DATE NOT NULL,
  lessons_completed INT NOT NULL DEFAULT 0,
  quizzes_completed INT NOT NULL DEFAULT 0,
  xp_earned INT NOT NULL DEFAULT 0,
  time_spent_seconds INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(student_id, activity_date)
);

CREATE INDEX idx_daily_activity_student_date ON daily_activity(student_id, activity_date DESC);

CREATE TRIGGER tr_course_progress_updated BEFORE UPDATE ON course_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_lesson_progress_updated BEFORE UPDATE ON lesson_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_daily_activity_updated BEFORE UPDATE ON daily_activity FOR EACH ROW EXECUTE FUNCTION update_updated_at();
