CREATE TABLE review_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  stability DECIMAL(10,4) NOT NULL DEFAULT 0,
  difficulty DECIMAL(10,4) NOT NULL DEFAULT 0,
  elapsed_days INT NOT NULL DEFAULT 0,
  scheduled_days INT NOT NULL DEFAULT 0,
  reps INT NOT NULL DEFAULT 0,
  lapses INT NOT NULL DEFAULT 0,
  state INT NOT NULL DEFAULT 0,
  due_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(student_id, question_id)
);

CREATE INDEX idx_review_cards_due ON review_cards(student_id, due_at) WHERE state IN (0, 1, 2, 3);

CREATE TABLE review_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID NOT NULL REFERENCES review_cards(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating review_rating NOT NULL,
  state_before INT NOT NULL,
  stability_before DECIMAL(10,4) NOT NULL,
  difficulty_before DECIMAL(10,4) NOT NULL,
  scheduled_days INT NOT NULL,
  elapsed_days INT NOT NULL,
  reviewed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_review_logs_card ON review_logs(card_id);

CREATE TRIGGER tr_review_cards_updated BEFORE UPDATE ON review_cards FOR EACH ROW EXECUTE FUNCTION update_updated_at();
