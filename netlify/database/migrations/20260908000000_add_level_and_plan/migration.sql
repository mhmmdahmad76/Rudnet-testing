-- Real CEFR level + subscription plan state, and a record of placement
-- test attempts. Previously "level" only ever lived in browser
-- localStorage (lib/onboarding-store.ts) and payment was mandatory —
-- neither was backed by the database.

ALTER TABLE students
  ADD COLUMN level TEXT,
  ADD COLUMN level_source TEXT CHECK (level_source IN ('self', 'test')),
  ADD COLUMN plan_status TEXT NOT NULL DEFAULT 'free' CHECK (plan_status IN ('free', 'premium'));

CREATE TABLE placement_test_attempts (
  id SERIAL PRIMARY KEY,
  student_id INT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  score INT NOT NULL,
  total INT NOT NULL,
  result_level TEXT NOT NULL,
  answers JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_placement_test_attempts_student_id ON placement_test_attempts(student_id);
