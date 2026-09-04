// Demo data standing in for a backend — shapes follow BUILD.md §6.

export type Level = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export interface Student {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  level: Level;
  progressPct: number;
  status: "active" | "trial" | "pending" | "lapsed";
  joinedAt: string;
  paymentMethod: "card" | "transfer" | null;
  paymentState: "ok" | "retrying" | "failed" | null;
}

export type LessonKind = "Video" | "Reading" | "Quiz";
export type LessonStatus = "complete" | "current" | "locked";

export interface DemoLesson {
  id: string;
  kind: "lesson";
  title: string;
  lessonKind: LessonKind;
  duration: string;
  status: LessonStatus;
}

export interface DemoQuestion {
  id: string;
  prompt: string;
  hint?: string;
  options: { marker: string; text: string; correct?: boolean }[];
}

export interface DemoQuiz {
  id: string;
  kind: "quiz";
  title: string;
  status: LessonStatus;
  duration: string;
  passMark: number;
  attemptsAllowed: number;
  questions: DemoQuestion[];
}

export interface DemoUnit {
  id: string;
  title: string;
  items: (DemoLesson | DemoQuiz)[];
}

export interface DemoCourse {
  slug: string;
  title: string;
  level: Level;
  meta: string;
  units: DemoUnit[];
}

export const DEMO_COURSE: DemoCourse = {
  slug: "business-english",
  title: "Business English Essentials",
  level: "B1",
  meta: "18 lessons · 5h 20m",
  units: [
    {
      id: "unit-1",
      title: "Getting started",
      items: [
        {
          id: "greetings",
          kind: "lesson",
          title: "Greetings and introductions",
          lessonKind: "Video",
          duration: "8 min",
          status: "complete",
        },
        {
          id: "cafe-order",
          kind: "lesson",
          title: "Ordering at a café",
          lessonKind: "Video",
          duration: "11 min",
          status: "current",
        },
        {
          id: "unit-1-check",
          kind: "quiz",
          title: "Unit 1 check",
          status: "locked",
          duration: "6 min",
          passMark: 60,
          attemptsAllowed: 3,
          questions: [
            {
              id: "q1",
              prompt: "Choose the correct sentence.",
              hint: "Think about the simple past tense.",
              options: [
                { marker: "A", text: "I have went to the store." },
                { marker: "B", text: "I have gone to the store." },
                { marker: "C", text: "I went to the store.", correct: true },
                { marker: "D", text: "I go to the store yesterday." },
              ],
            },
            {
              id: "q2",
              prompt: "“Could you pass the salt, please?” is an example of:",
              options: [
                { marker: "A", text: "A command" },
                { marker: "B", text: "A polite request", correct: true },
                { marker: "C", text: "A question about ability" },
                { marker: "D", text: "An apology" },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "unit-2",
      title: "Past and present",
      items: [
        {
          id: "past-simple",
          kind: "lesson",
          title: "Past simple tense",
          lessonKind: "Video",
          duration: "9 min",
          status: "locked",
        },
        {
          id: "routines",
          kind: "lesson",
          title: "Talking about routines",
          lessonKind: "Reading",
          duration: "6 min",
          status: "locked",
        },
        {
          id: "unit-2-check",
          kind: "quiz",
          title: "Unit 2 check",
          status: "locked",
          duration: "6 min",
          passMark: 60,
          attemptsAllowed: 3,
          questions: [],
        },
      ],
    },
    {
      id: "unit-3",
      title: "At work",
      items: [
        {
          id: "meetings",
          kind: "lesson",
          title: "Scheduling a meeting",
          lessonKind: "Video",
          duration: "10 min",
          status: "locked",
        },
      ],
    },
  ],
};

export function findLesson(courseSlug: string, lessonId: string) {
  if (courseSlug !== DEMO_COURSE.slug) return null;
  for (const unit of DEMO_COURSE.units) {
    const item = unit.items.find((entry) => entry.id === lessonId && entry.kind === "lesson");
    if (item) return { unit, lesson: item as DemoLesson };
  }
  return null;
}

export function findQuiz(courseSlug: string, quizId: string) {
  if (courseSlug !== DEMO_COURSE.slug) return null;
  for (const unit of DEMO_COURSE.units) {
    const item = unit.items.find((entry) => entry.id === quizId && entry.kind === "quiz");
    if (item) return { unit, quiz: item as DemoQuiz };
  }
  return null;
}

export function flattenItems() {
  return DEMO_COURSE.units.flatMap((unit) => unit.items.map((item) => ({ unit, item })));
}

export interface DemoPlan {
  id: "monthly" | "annual";
  label: string;
  price: number;
  currency: string;
  cadence: string;
  badge?: string;
}

export const DEMO_PLANS: DemoPlan[] = [
  { id: "monthly", label: "Monthly", price: 39, currency: "USD", cadence: "/ month" },
  {
    id: "annual",
    label: "Annual",
    price: 390,
    currency: "USD",
    cadence: "/ year",
    badge: "Two months free",
  },
];

export const DEMO_STUDENTS: Student[] = [
  {
    id: "s1",
    name: "Amal Al-Farsi",
    email: "amal@example.com",
    level: "B1",
    progressPct: 62,
    status: "active",
    joinedAt: "2025-02-14",
    paymentMethod: "card",
    paymentState: "ok",
  },
  {
    id: "s2",
    name: "Yousef Nasser",
    email: "yousef@example.com",
    level: "A2",
    progressPct: 18,
    status: "trial",
    joinedAt: "2025-08-01",
    paymentMethod: null,
    paymentState: null,
  },
  {
    id: "s3",
    name: "Rania Haddad",
    email: "rania@example.com",
    level: "C1",
    progressPct: 91,
    status: "active",
    joinedAt: "2024-11-30",
    paymentMethod: "transfer",
    paymentState: "ok",
  },
  {
    id: "s4",
    name: "Omar Saleh",
    email: "omar@example.com",
    level: "A2",
    progressPct: 34,
    status: "pending",
    joinedAt: "2025-07-20",
    paymentMethod: "transfer",
    paymentState: "retrying",
  },
  {
    id: "s5",
    name: "Huda Khalil",
    email: "huda@example.com",
    level: "B2",
    progressPct: 5,
    status: "lapsed",
    joinedAt: "2024-05-02",
    paymentMethod: "card",
    paymentState: "failed",
  },
];
