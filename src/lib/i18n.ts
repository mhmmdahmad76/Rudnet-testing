import type { Locale } from "@/lib/locale";

/** Student app shell + dashboard copy, in both locales. Everything else
 * (course/lesson/quiz content, marketing pages, the admin panel) stays
 * English-only for now — see AGENTS notes on scope. */
export interface Dictionary {
  nav: {
    dashboard: string;
    courses: string;
    resources: string;
    quizzes: string;
    certificates: string;
    billing: string;
  };
  search: {
    placeholder: string;
  };
  notifications: string;
  accountMenu: {
    account: string;
    billing: string;
    language: string;
    signOut: string;
  };
  premiumBanner: {
    title: string;
    body: string;
    cta: string;
  };
  dashboard: {
    greeting: (name: string) => string;
    subtitle: string;
    courseProgress: string;
    dayStreak: string;
    quizzesPassed: string;
    currentLevel: string;
    resume: string;
    cefrProgress: string;
    cefrEmpty: string;
    placementTitleUnsure: string;
    placementTitleUnknown: string;
    placementBody: string;
    placementCta: string;
    instructorNoteTitle: string;
    instructorNoteBody: string;
  };
}

const en: Dictionary = {
  nav: {
    dashboard: "Dashboard",
    courses: "My courses",
    resources: "Resources",
    quizzes: "Quizzes",
    certificates: "Certificates",
    billing: "Billing",
  },
  search: {
    placeholder: "Search lessons, resources…",
  },
  notifications: "Notifications",
  accountMenu: {
    account: "Account",
    billing: "Billing",
    language: "Language",
    signOut: "Sign out",
  },
  premiumBanner: {
    title: "Go Premium",
    body: "Unlock every lesson and quiz — right now you can only browse the catalogue.",
    cta: "Upgrade",
  },
  dashboard: {
    greeting: (name) => `Good to see you, ${name}`,
    subtitle: "Here's where you left off.",
    courseProgress: "Course progress",
    dayStreak: "Day streak",
    quizzesPassed: "Quizzes passed",
    currentLevel: "Current level",
    resume: "Resume",
    cefrProgress: "CEFR progress",
    cefrEmpty: "Take the placement test to see your level here.",
    placementTitleUnsure: "Not sure that's right?",
    placementTitleUnknown: "What's your English level?",
    placementBody:
      "Take our 5-minute placement test for a level based on what you actually know, not a guess.",
    placementCta: "Take the placement test",
    instructorNoteTitle: "A note from your instructor",
    instructorNoteBody:
      "Focus on the past-simple unit this week — it's the one most students revisit before the quiz.",
  },
};

const ar: Dictionary = {
  nav: {
    dashboard: "لوحة التحكم",
    courses: "دوراتي",
    resources: "المصادر",
    quizzes: "الاختبارات القصيرة",
    certificates: "الشهادات",
    billing: "الفوترة",
  },
  search: {
    placeholder: "ابحث في الدروس والمصادر…",
  },
  notifications: "الإشعارات",
  accountMenu: {
    account: "الحساب",
    billing: "الفوترة",
    language: "اللغة",
    signOut: "تسجيل الخروج",
  },
  premiumBanner: {
    title: "الترقية إلى بريميوم",
    body: "افتح كل درس واختبار — حاليًا يمكنك فقط تصفح الدورات.",
    cta: "ترقية",
  },
  dashboard: {
    greeting: (name) => `سعدنا برؤيتك، ${name}`,
    subtitle: "هذا مكان توقفك آخر مرة.",
    courseProgress: "تقدم الدورة",
    dayStreak: "أيام متتالية",
    quizzesPassed: "اختبارات ناجحة",
    currentLevel: "المستوى الحالي",
    resume: "متابعة",
    cefrProgress: "تقدم CEFR",
    cefrEmpty: "أجرِ اختبار تحديد المستوى لترى مستواك هنا.",
    placementTitleUnsure: "لست متأكدًا أن هذا صحيح؟",
    placementTitleUnknown: "ما هو مستواك في الإنجليزية؟",
    placementBody: "أجرِ اختبار تحديد المستوى (5 دقائق) لمستوى مبني على ما تعرفه فعلًا، لا تخمين.",
    placementCta: "ابدأ اختبار تحديد المستوى",
    instructorNoteTitle: "ملاحظة من معلمك",
    instructorNoteBody:
      "ركّز على وحدة الماضي البسيط هذا الأسبوع — إنها الوحدة التي يعود إليها معظم الطلاب قبل الاختبار.",
  },
};

const DICTIONARIES: Record<Locale, Dictionary> = { en, ar };

export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale];
}
