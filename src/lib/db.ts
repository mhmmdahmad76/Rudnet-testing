import "server-only";
import { getDatabase } from "@netlify/database";

// A real Postgres database — auto-provisioned by Netlify on deploy (or
// `netlify dev` locally). See netlify/database/migrations for the schema.
export function db() {
  return getDatabase();
}
