import "server-only";

import { db } from "@/lib/db";

// Real course content and per-student progress — replaces the single
// hardcoded course in lib/demo-data.ts. Quiz `correct` answers are only
// ever read here, never returned to a client component; see
// getPublicQuiz / submitQuizAttempt.

// The product only has one course right now — the student app has no
// course-discovery UI yet, so every page that used to reach for
// DEMO_COURSE.slug reaches for this instead.
export const MAIN_COURSE_SLUG = "business-english";

export type ItemKind = "lesson" | "quiz";
export type ItemStatus = "complete" | "current" | "locked";
export type LessonKind = "Video" | "Reading";

interface UnitRow {
  id: string;
  title: string;
  position: number;
  is_free_preview: boolean;
}

interface ItemRow {
  id: string;
  unit_id: string;
  position: number;
  kind: ItemKind;
  title: string;
  lesson_kind: LessonKind | null;
  duration_minutes: number;
  pass_mark: number | null;
  attempts_allowed: number | null;
}

export interface CourseItemSummary {
  id: string;
  unitId: string;
  kind: ItemKind;
  title: string;
  lessonKind: LessonKind | null;
  durationMinutes: number;
  passMark: number | null;
  attemptsAllowed: number | null;
  status: ItemStatus;
  /** True when this item sits outside the free-preview unit and the
   * student isn't premium — independent of progression status. */
  requiresPremium: boolean;
}

export interface CourseUnitSummary {
  id: string;
  title: string;
  isFreePreview: boolean;
  items: CourseItemSummary[];
}

export interface CourseSummary {
  slug: string;
  title: string;
  level: string;
  units: CourseUnitSummary[];
  totalItems: number;
  completedItems: number;
  progressPct: number;
}

async function loadCourseItems(
  slug: string,
  studentId: number,
): Promise<{ course: { title: string; level: string }; units: UnitRow[]; items: ItemRow[]; completedIds: Set<string> } | null> {
  const courseRows = await db().sql`
    SELECT title, level FROM courses WHERE id = ${slug} AND published = TRUE
  `;
  const course = courseRows[0] as { title: string; level: string } | undefined;
  if (!course) return null;

  const units = (await db().sql`
    SELECT id, title, position, is_free_preview FROM course_units
    WHERE course_id = ${slug} ORDER BY position
  `) as unknown as UnitRow[];

  const items = (await db().sql`
    SELECT ui.id, ui.unit_id, ui.position, ui.kind, ui.title, ui.lesson_kind,
           ui.duration_minutes, ui.pass_mark, ui.attempts_allowed
    FROM unit_items ui
    JOIN course_units cu ON cu.id = ui.unit_id
    WHERE cu.course_id = ${slug}
    ORDER BY cu.position, ui.position
  `) as unknown as ItemRow[];

  const itemIds = items.map((i) => i.id);
  const completedIds = new Set<string>();
  if (itemIds.length > 0) {
    const lessonDone = await db().sql`
      SELECT item_id FROM lesson_progress WHERE student_id = ${studentId} AND item_id = ANY(${itemIds})
    `;
    for (const row of lessonDone as unknown as { item_id: string }[]) completedIds.add(row.item_id);

    const quizDone = await db().sql`
      SELECT DISTINCT item_id FROM quiz_attempts
      WHERE student_id = ${studentId} AND item_id = ANY(${itemIds}) AND passed = TRUE
    `;
    for (const row of quizDone as unknown as { item_id: string }[]) completedIds.add(row.item_id);
  }

  return { course, units, items, completedIds };
}

export async function getCourseForStudent(
  slug: string,
  studentId: number,
  isPremium: boolean,
): Promise<CourseSummary | null> {
  const loaded = await loadCourseItems(slug, studentId);
  if (!loaded) return null;
  const { course, units, items, completedIds } = loaded;

  const freePreviewUnitIds = new Set(units.filter((u) => u.is_free_preview).map((u) => u.id));

  let reachedCurrent = false;
  const summaries: CourseItemSummary[] = items.map((item) => {
    const completed = completedIds.has(item.id);
    let status: ItemStatus;
    if (completed) {
      status = "complete";
    } else if (!reachedCurrent) {
      status = "current";
      reachedCurrent = true;
    } else {
      status = "locked";
    }
    return {
      id: item.id,
      unitId: item.unit_id,
      kind: item.kind,
      title: item.title,
      lessonKind: item.lesson_kind,
      durationMinutes: item.duration_minutes,
      passMark: item.pass_mark,
      attemptsAllowed: item.attempts_allowed,
      status,
      requiresPremium: !freePreviewUnitIds.has(item.unit_id) && !isPremium,
    };
  });

  const unitSummaries: CourseUnitSummary[] = units.map((unit) => ({
    id: unit.id,
    title: unit.title,
    isFreePreview: unit.is_free_preview,
    items: summaries.filter((i) => i.unitId === unit.id),
  }));

  const completedItems = summaries.filter((i) => i.status === "complete").length;

  return {
    slug,
    title: course.title,
    level: course.level,
    units: unitSummaries,
    totalItems: summaries.length,
    completedItems,
    progressPct: summaries.length > 0 ? Math.round((completedItems / summaries.length) * 100) : 0,
  };
}

export function flattenCourseItems(course: CourseSummary): { unit: CourseUnitSummary; item: CourseItemSummary }[] {
  return course.units.flatMap((unit) => unit.items.map((item) => ({ unit, item })));
}

export function itemHref(courseSlug: string, item: Pick<CourseItemSummary, "id" | "kind">): string {
  return item.kind === "lesson"
    ? `/courses/${courseSlug}/lessons/${item.id}`
    : `/courses/${courseSlug}/quiz/${item.id}`;
}

/** Where "Resume"/"Continue" should take a student: the first non-complete
 * item, or the very first item if the course is already finished. */
export function resumeHref(courseSlug: string, course: CourseSummary): string | null {
  const flat = flattenCourseItems(course);
  const target = flat.find(({ item }) => item.status !== "complete") ?? flat[0];
  return target ? itemHref(courseSlug, target.item) : null;
}

export function formatDuration(minutes: number): string {
  return `${minutes} min`;
}

export function formatCourseMeta(course: CourseSummary): string {
  const lessons = flattenCourseItems(course).filter(({ item }) => item.kind === "lesson");
  const totalMinutes = lessons.reduce((sum, { item }) => sum + item.durationMinutes, 0);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const durationLabel = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  return `${lessons.length} lesson${lessons.length === 1 ? "" : "s"} · ${durationLabel}`;
}

export async function findLessonForStudent(courseSlug: string, lessonId: string, studentId: number, isPremium: boolean) {
  const course = await getCourseForStudent(courseSlug, studentId, isPremium);
  if (!course) return null;
  for (const unit of course.units) {
    const item = unit.items.find((i) => i.id === lessonId && i.kind === "lesson");
    if (item) return { course, unit, item };
  }
  return null;
}

export interface PublicQuizQuestion {
  id: string;
  prompt: string;
  hint?: string;
  options: string[];
}

export async function findQuizForStudent(courseSlug: string, quizId: string, studentId: number, isPremium: boolean) {
  const course = await getCourseForStudent(courseSlug, studentId, isPremium);
  if (!course) return null;
  let match: { unit: CourseUnitSummary; item: CourseItemSummary } | null = null;
  for (const unit of course.units) {
    const item = unit.items.find((i) => i.id === quizId && i.kind === "quiz");
    if (item) {
      match = { unit, item };
      break;
    }
  }
  if (!match) return null;

  const rows = await db().sql`SELECT questions FROM unit_items WHERE id = ${quizId}`;
  const row = rows[0] as { questions: { id: string; prompt: string; hint?: string; options: { marker: string; text: string; correct?: boolean }[] }[] } | undefined;
  const questions: PublicQuizQuestion[] = (row?.questions ?? []).map((q) => ({
    id: q.id,
    prompt: q.prompt,
    hint: q.hint,
    options: q.options.map((o) => o.text),
  }));

  const attemptRows = await db().sql`
    SELECT COUNT(*)::int AS count FROM quiz_attempts WHERE student_id = ${studentId} AND item_id = ${quizId}
  `;
  const attemptsUsed = (attemptRows[0] as { count: number } | undefined)?.count ?? 0;

  return { course, unit: match.unit, item: match.item, questions, attemptsUsed };
}

export async function markLessonComplete(studentId: number, itemId: string) {
  await db().sql`
    INSERT INTO lesson_progress (student_id, item_id) VALUES (${studentId}, ${itemId})
    ON CONFLICT (student_id, item_id) DO NOTHING
  `;
}

export interface QuizSubmitResult {
  ok: true;
  score: number;
  total: number;
  passed: boolean;
  passMark: number;
}

export async function submitQuizAttempt(
  studentId: number,
  itemId: string,
  answers: Record<string, number>,
): Promise<QuizSubmitResult | { ok: false; reason: "no-attempts-left" }> {
  const rows = await db().sql`
    SELECT questions, pass_mark, attempts_allowed FROM unit_items WHERE id = ${itemId} AND kind = 'quiz'
  `;
  const row = rows[0] as
    | { questions: { id: string; options: { marker: string; correct?: boolean }[] }[]; pass_mark: number; attempts_allowed: number }
    | undefined;
  if (!row) throw new Error(`Quiz not found: ${itemId}`);

  const attemptRows = await db().sql`
    SELECT COUNT(*)::int AS count FROM quiz_attempts WHERE student_id = ${studentId} AND item_id = ${itemId}
  `;
  const attemptsUsed = (attemptRows[0] as { count: number } | undefined)?.count ?? 0;
  if (attemptsUsed >= row.attempts_allowed) return { ok: false, reason: "no-attempts-left" };

  let correctCount = 0;
  for (const question of row.questions) {
    const selectedIndex = answers[question.id];
    const correctIndex = question.options.findIndex((o) => o.correct);
    if (selectedIndex === correctIndex) correctCount += 1;
  }
  const total = row.questions.length;
  const score = total > 0 ? Math.round((correctCount / total) * 100) : 0;
  const passed = score >= row.pass_mark;

  await db().sql`
    INSERT INTO quiz_attempts (student_id, item_id, score, total, passed, answers)
    VALUES (${studentId}, ${itemId}, ${score}, ${total}, ${passed}, ${JSON.stringify(answers)})
  `;

  return { ok: true, score, total, passed, passMark: row.pass_mark };
}

export async function getDashboardStats(studentId: number) {
  const quizzesPassedRows = await db().sql`
    SELECT COUNT(DISTINCT item_id)::int AS count FROM quiz_attempts
    WHERE student_id = ${studentId} AND passed = TRUE
  `;
  const quizzesPassed = (quizzesPassedRows[0] as { count: number } | undefined)?.count ?? 0;

  const activityRows = await db().sql`
    SELECT DISTINCT day FROM (
      SELECT date_trunc('day', completed_at) AS day FROM lesson_progress WHERE student_id = ${studentId}
      UNION
      SELECT date_trunc('day', created_at) AS day FROM quiz_attempts WHERE student_id = ${studentId}
    ) AS days
    ORDER BY day DESC
  `;
  const activityDays = (activityRows as unknown as { day: string }[]).map((r) => new Date(r.day));

  const dayStreak = computeStreak(activityDays);

  return { quizzesPassed, dayStreak };
}

function computeStreak(sortedDescendingDays: Date[]): number {
  if (sortedDescendingDays.length === 0) return 0;
  const dayMs = 24 * 60 * 60 * 1000;
  const today = startOfUtcDay(new Date());
  const mostRecent = startOfUtcDay(sortedDescendingDays[0]!);

  // Streak is only "alive" if the student was active today or yesterday.
  if (today.getTime() - mostRecent.getTime() > dayMs) return 0;

  let streak = 1;
  let cursor = mostRecent;
  for (let i = 1; i < sortedDescendingDays.length; i++) {
    const day = startOfUtcDay(sortedDescendingDays[i]!);
    if (cursor.getTime() - day.getTime() === dayMs) {
      streak += 1;
      cursor = day;
    } else if (cursor.getTime() - day.getTime() > dayMs) {
      break;
    }
  }
  return streak;
}

function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}
