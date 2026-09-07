-- Real auth for both portals: students, admins, sessions, and the
-- one-time-code tables that back email verification, password reset,
-- and admin TOTP recovery. Replaces the cookie-only demo auth.

CREATE TABLE students (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  country TEXT,
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  onboarding_step TEXT NOT NULL DEFAULT 'level',
  suspended BOOLEAN NOT NULL DEFAULT FALSE,
  failed_login_attempts INT NOT NULL DEFAULT 0,
  locked_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE admin_users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  totp_secret TEXT,
  totp_enrolled_at TIMESTAMPTZ,
  failed_login_attempts INT NOT NULL DEFAULT 0,
  locked_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE admin_recovery_codes (
  id SERIAL PRIMARY KEY,
  admin_id INT NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  code_hash TEXT NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_admin_recovery_codes_admin_id ON admin_recovery_codes(admin_id);

-- Instructor invitations (D11: one owner, invited onto a separate
-- admin credential). token_hash lets us look up by the raw token from
-- the email link without storing it in plaintext.
CREATE TABLE admin_invites (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  token_hash TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- One table for both portals' sessions. two_factor_verified only
-- matters for kind='admin' — a student row is always effectively true.
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL CHECK (kind IN ('student', 'admin')),
  subject_id INT NOT NULL,
  two_factor_verified BOOLEAN NOT NULL DEFAULT FALSE,
  user_agent TEXT,
  last_used_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_sessions_kind_subject ON sessions(kind, subject_id);

CREATE TABLE email_verification_codes (
  id SERIAL PRIMARY KEY,
  student_id INT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  code_hash TEXT NOT NULL,
  attempts INT NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_email_verification_codes_student_id ON email_verification_codes(student_id);

CREATE TABLE password_reset_tokens (
  id SERIAL PRIMARY KEY,
  kind TEXT NOT NULL CHECK (kind IN ('student', 'admin')),
  subject_id INT NOT NULL,
  token_hash TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Bootstrap: the one owner/instructor account (D11), carried over from
-- the old hardcoded demo credential (admin@lisaan.app / admin1234) so
-- sign-in works immediately. No totp_secret yet — first sign-in routes
-- to real 2FA enrollment, since 2FA is mandatory, not optional.
INSERT INTO admin_users (email, password_hash)
VALUES ('admin@lisaan.app', 'scrypt:6a7e4acc7f9b8e8d31fb2a8ecc86c15d:7cbce6bac917ff11105f0ec693c71407f72c4a07d41c8b2f8282820c5d593ec3fe5cd746ccd9facd4dc8ddcf081f15fc377d009d8452751def620f4ea090bf1c');

-- A second, ready-to-use instructor invite for exercising /admin/invite
-- end to end. Raw token: "lisaan-owner-invite" (sha256 hashed below).
-- Regenerate a real one from a real invite flow before using this in production.
INSERT INTO admin_invites (email, token_hash, expires_at)
VALUES ('owner@lisaan.app', '0881b497009e234a89f95798d46f7a1098ba174a478094c9b560a711f2c533ce', NOW() + INTERVAL '7 days');
