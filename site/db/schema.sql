-- ═══════════════════════════════════════════════════════
--  The Scholarly Editorial — Supabase Database Schema
--  Run this in your Supabase SQL Editor (supabase.com)
-- ═══════════════════════════════════════════════════════

-- 1. Student profiles
CREATE TABLE students (
  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  student_id    TEXT UNIQUE NOT NULL,
  name          TEXT NOT NULL,
  email         TEXT,
  avatar_url    TEXT,
  major         TEXT,
  year          TEXT,
  gpa           TEXT,
  credits_completed INT DEFAULT 0,
  credits_required  INT DEFAULT 120,
  semesters_remaining INT DEFAULT 8,
  enrollment_date DATE,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- 2. Fee records
CREATE TABLE fees (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  student_id  TEXT REFERENCES students(student_id),
  type        TEXT NOT NULL,
  amount      NUMERIC(10,2) NOT NULL,
  due_date    DATE,
  status      TEXT DEFAULT 'pending' CHECK (status IN ('pending','overdue','paid')),
  paid_date   TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- 3. Internship listings
CREATE TABLE internships (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title       TEXT NOT NULL,
  company     TEXT NOT NULL,
  location    TEXT,
  icon        TEXT,
  subtitle    TEXT,
  deadline    DATE,
  description TEXT,
  type        TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- 4. Contact / admissions inquiries
CREATE TABLE inquiries (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  first_name  TEXT NOT NULL,
  last_name   TEXT NOT NULL,
  major       TEXT,
  message     TEXT NOT NULL,
  status      TEXT DEFAULT 'new',
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- 5. Internship applications
CREATE TABLE applications (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  full_name   TEXT NOT NULL,
  student_id  TEXT,
  email       TEXT NOT NULL,
  major       TEXT,
  gpa         TEXT,
  graduation  TEXT,
  portfolio   TEXT,
  statement   TEXT,
  resume_name TEXT,
  position    TEXT,
  company     TEXT,
  status      TEXT DEFAULT 'submitted',
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- 6. Notifications
CREATE TABLE notifications (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  student_id  TEXT,
  title       TEXT NOT NULL,
  body        TEXT,
  time_label  TEXT,
  icon        TEXT,
  read        BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- 7. Form drafts
CREATE TABLE drafts (
  id          TEXT PRIMARY KEY DEFAULT 'internship-app',
  data        JSONB NOT NULL DEFAULT '{}',
  saved_at    TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════════════════
--  Row Level Security (RLS) — Allow public read/write
--  For a production app you'd restrict these policies,
--  but for a demo site this keeps things simple.
-- ═══════════════════════════════════════════════════════

ALTER TABLE students      ENABLE ROW LEVEL SECURITY;
ALTER TABLE fees           ENABLE ROW LEVEL SECURITY;
ALTER TABLE internships    ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries      ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications   ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications  ENABLE ROW LEVEL SECURITY;
ALTER TABLE drafts         ENABLE ROW LEVEL SECURITY;

-- Public read/write policies for demo
CREATE POLICY "Public access" ON students      FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON fees          FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON internships   FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON inquiries     FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON applications  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON notifications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON drafts        FOR ALL USING (true) WITH CHECK (true);

-- ═══════════════════════════════════════════════════════
--  Seed Data
-- ═══════════════════════════════════════════════════════

INSERT INTO students (student_id, name, email, major, year, gpa, credits_completed, credits_required, semesters_remaining, enrollment_date) VALUES
  ('2024-8842', 'Julian Thorne', 'j.thorne@scholarly.edu', 'Computer Science & Mathematics', 'Senior', '3.95', 102, 120, 2, '2020-09-01');

INSERT INTO fees (student_id, type, amount, due_date, status) VALUES
  ('2024-8842', 'Tuition',      850.00, '2024-04-15', 'pending'),
  ('2024-8842', 'Housing',      375.00, '2024-05-01', 'pending'),
  ('2024-8842', 'Library Fine',  15.00, '2024-03-01', 'overdue');

INSERT INTO internships (title, company, location, icon, deadline, description, type) VALUES
  ('Junior Editorial Fellow',        'London Literary Gazette', 'Remote',  'history_edu',      '2024-04-01', 'Join one of the world''s leading literary publications as an editorial fellow.', 'Humanities'),
  ('Archival Research Assistant',     'The National Archive',    'On-site', 'data_exploration',  '2024-04-15', 'Assist in digitizing and cataloging 18th-century manuscripts.', 'Research'),
  ('Historical Restoration Liaison',  'Cambridge Heritage Trust','Hybrid',  'architecture',      '2024-05-01', 'Bridge heritage conservation and modern architectural design.', 'Arts'),
  ('Junior Software Engineer',        'Google',                  'Remote',  'engineering',       '2024-03-15', 'Work with Google Engineering on cutting-edge infrastructure projects.', 'STEM');

INSERT INTO notifications (student_id, title, body, time_label, icon, read) VALUES
  ('2024-8842', 'Tuition payment due April 15',  'Your Spring semester tuition of $850.00 is due in 3 weeks.', '2 hours ago', 'payments',  false),
  ('2024-8842', 'New internship posted',          'Google has posted a Junior Software Engineer position.',     '1 day ago',   'work',      false),
  ('2024-8842', 'Library fine overdue',            'You have an outstanding library fine of $15.00.',            '3 days ago',  'menu_book', true),
  ('2024-8842', 'Course registration opens',       'Fall 2024 registration opens on April 20.',                 '1 week ago',  'school',    true);
