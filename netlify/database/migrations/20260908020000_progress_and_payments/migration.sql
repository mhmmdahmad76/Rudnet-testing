-- Real progress tracking (lesson completion, quiz attempts — previously
-- hardcoded numbers on the dashboard) and a real bank-transfer approval
-- pipeline (previously the onboarding "transfer" step just navigated to a
-- static screen with nothing for an admin to act on).

CREATE TABLE lesson_progress (
  id SERIAL PRIMARY KEY,
  student_id INT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL REFERENCES unit_items(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (student_id, item_id)
);
CREATE INDEX idx_lesson_progress_student_id ON lesson_progress(student_id);

CREATE TABLE quiz_attempts (
  id SERIAL PRIMARY KEY,
  student_id INT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL REFERENCES unit_items(id) ON DELETE CASCADE,
  score INT NOT NULL,
  total INT NOT NULL,
  passed BOOLEAN NOT NULL,
  answers JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_quiz_attempts_student_item ON quiz_attempts(student_id, item_id);

CREATE TABLE payment_requests (
  id SERIAL PRIMARY KEY,
  student_id INT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  method TEXT NOT NULL CHECK (method IN ('card', 'transfer')),
  plan_id TEXT NOT NULL CHECK (plan_id IN ('monthly', 'annual')),
  amount NUMERIC(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  resolved_by INT REFERENCES admin_users(id)
);
CREATE INDEX idx_payment_requests_student_id ON payment_requests(student_id);
CREATE INDEX idx_payment_requests_status ON payment_requests(status);

-- Admin-driven level changes ("Change level" in the students table) are a
-- distinct source from the student's own onboarding answer or the
-- placement test.
ALTER TABLE students DROP CONSTRAINT students_level_source_check;
ALTER TABLE students ADD CONSTRAINT students_level_source_check
  CHECK (level_source IN ('self', 'test', 'admin'));

-- Which plan a premium student is actually on — the billing page used to
-- always claim "Annual plan · $390/year" regardless of what was chosen.
ALTER TABLE students ADD COLUMN plan_id TEXT CHECK (plan_id IN ('monthly', 'annual'));
