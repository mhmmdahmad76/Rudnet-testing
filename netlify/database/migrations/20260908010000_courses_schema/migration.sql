-- Real course content. Previously every course/lesson/quiz page read from
-- a single hardcoded object in src/lib/demo-data.ts — this replaces that
-- with real tables and seeds them with the same content so nothing
-- regresses visually. Quiz `questions` carries each option's `correct`
-- flag — that JSON is only ever read server-side (see lib/courses.ts),
-- never sent to the client.

CREATE TABLE courses (
  id TEXT PRIMARY KEY, -- the slug itself, e.g. 'business-english'
  title TEXT NOT NULL,
  level TEXT NOT NULL,
  published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE course_units (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  position INT NOT NULL,
  title TEXT NOT NULL,
  is_free_preview BOOLEAN NOT NULL DEFAULT FALSE
);
CREATE INDEX idx_course_units_course_id ON course_units(course_id);

CREATE TABLE unit_items (
  id TEXT PRIMARY KEY,
  unit_id TEXT NOT NULL REFERENCES course_units(id) ON DELETE CASCADE,
  position INT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('lesson', 'quiz')),
  title TEXT NOT NULL,
  lesson_kind TEXT CHECK (lesson_kind IN ('Video', 'Reading')),
  duration_minutes INT NOT NULL,
  pass_mark INT,
  attempts_allowed INT,
  questions JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_unit_items_unit_id ON unit_items(unit_id);

INSERT INTO courses (id, title, level) VALUES
  ('business-english', 'Business English Essentials', 'B1');

INSERT INTO course_units (id, course_id, position, title, is_free_preview) VALUES
  ('unit-1', 'business-english', 1, 'Getting started', TRUE),
  ('unit-2', 'business-english', 2, 'Past and present', FALSE),
  ('unit-3', 'business-english', 3, 'At work', FALSE);

INSERT INTO unit_items (id, unit_id, position, kind, title, lesson_kind, duration_minutes) VALUES
  ('greetings', 'unit-1', 1, 'lesson', 'Greetings and introductions', 'Video', 8),
  ('cafe-order', 'unit-1', 2, 'lesson', 'Ordering at a café', 'Video', 11),
  ('past-simple', 'unit-2', 1, 'lesson', 'Past simple tense', 'Video', 9),
  ('routines', 'unit-2', 2, 'lesson', 'Talking about routines', 'Reading', 6),
  ('meetings', 'unit-3', 1, 'lesson', 'Scheduling a meeting', 'Video', 10);

INSERT INTO unit_items (id, unit_id, position, kind, title, duration_minutes, pass_mark, attempts_allowed, questions) VALUES
  (
    'unit-1-check', 'unit-1', 3, 'quiz', 'Unit 1 check', 6, 60, 3,
    '[
      {
        "id": "q1",
        "prompt": "Choose the correct sentence.",
        "hint": "Think about the simple past tense.",
        "options": [
          {"marker": "A", "text": "I have went to the store."},
          {"marker": "B", "text": "I have gone to the store."},
          {"marker": "C", "text": "I went to the store.", "correct": true},
          {"marker": "D", "text": "I go to the store yesterday."}
        ]
      },
      {
        "id": "q2",
        "prompt": "“Could you pass the salt, please?” is an example of:",
        "options": [
          {"marker": "A", "text": "A command"},
          {"marker": "B", "text": "A polite request", "correct": true},
          {"marker": "C", "text": "A question about ability"},
          {"marker": "D", "text": "An apology"}
        ]
      }
    ]'::jsonb
  ),
  ('unit-2-check', 'unit-2', 3, 'quiz', 'Unit 2 check', 6, 60, 3, '[]'::jsonb);
