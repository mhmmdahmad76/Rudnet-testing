"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Award, BookOpen, Sparkles, Target, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { StatTile } from "@/components/lisaan/stat-tile";
import { LessonRow } from "@/components/lisaan/lesson-row";
import { CefrLadder, LEVELS, type CefrLevel } from "@/components/lisaan/cefr-ladder";
import { Banner } from "@/components/lisaan/banner";
import { EmptyState } from "@/components/lisaan/empty-state";
import { DEFAULT_LOCALE, type Locale } from "@/lib/locale";
import { getDictionary } from "@/lib/i18n";

export interface DashboardCourseItem {
  id: string;
  title: string;
  kind: "Video" | "Reading" | "Quiz";
  duration: string;
  status: "complete" | "current" | "locked";
  href: string;
}

export interface DashboardCourse {
  title: string;
  meta: string;
  progressPct: number;
  resumeHref: string | null;
  upNext: DashboardCourseItem[];
}

export interface DashboardStats {
  quizzesPassed: number;
  dayStreak: number;
}

export interface DashboardClientProps {
  name: string;
  level: string | null;
  levelSource: "self" | "test" | "admin" | null;
  locale?: Locale;
  course: DashboardCourse | null;
  stats: DashboardStats;
}

function isCefrLevel(value: string | null): value is CefrLevel {
  return value !== null && (LEVELS as readonly string[]).includes(value);
}

/** ?state= lets you preview the documented dashboard states without
 * waiting for real data to reach them: loading | lapsed | failing | error.
 * (The empty state now happens for real — see `!course` below.) */
export default function DashboardClient({
  name,
  level,
  levelSource,
  locale = DEFAULT_LOCALE,
  course,
  stats,
}: DashboardClientProps) {
  const state = useSearchParams().get("state");
  const t = getDictionary(locale).dashboard;

  if (state === "loading") return <DashboardSkeleton />;
  if (!course) return <DashboardEmpty />;

  const firstName = name.split(" ")[0] || name;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="t-h2 text-fg-primary">{t.greeting(firstName)}</h1>
        <p className="t-body-sm text-fg-tertiary">{t.subtitle}</p>
      </div>

      {state === "lapsed" && (
        <Banner
          tone="warning"
          title="Your subscription lapsed"
          body="Lessons you've already unlocked stay available; quizzes and new lessons are paused."
          action={{ label: "Renew", onClick: () => {} }}
        />
      )}
      {state === "failing" && (
        <Banner
          tone="warning"
          title="We couldn't charge your card"
          body="3 days of access remaining before lessons pause. Update your payment method to keep going."
          action={{ label: "Update payment", onClick: () => {} }}
        />
      )}
      {state === "error" && (
        <Banner
          tone="danger"
          title="Failed to load your latest progress"
          body="Showing your last cached progress below."
          action={{ label: "Reload", onClick: () => window.location.reload() }}
        />
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile icon={BookOpen} tone="brand" value={`${course.progressPct}%`} label={t.courseProgress} />
        <StatTile icon={Zap} tone="warning" value={String(stats.dayStreak)} label={t.dayStreak} />
        <StatTile icon={Target} tone="success" value={String(stats.quizzesPassed)} label={t.quizzesPassed} />
        <StatTile icon={Award} tone="achievement" value={level ?? "—"} label={t.currentLevel} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-4 rounded-2xl border border-stroke-default bg-bg-surface p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="t-h4 text-fg-primary">{course.title}</p>
              <p className="t-body-xs text-fg-tertiary">{course.meta}</p>
            </div>
            {course.resumeHref && (
              <Button asChild>
                <Link href={course.resumeHref}>{t.resume}</Link>
              </Button>
            )}
          </div>
          <Progress value={course.progressPct} />
          <div className="flex flex-col gap-1">
            {course.upNext.map((item) => (
              <LessonRow
                key={item.id}
                status={item.status}
                title={item.title}
                kind={item.kind}
                duration={item.duration}
                href={item.href}
                lockedReason="Unlocks after you finish the lesson before it"
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-stroke-default bg-bg-surface p-5">
            <p className="t-label-md mb-3 text-fg-primary">{t.cefrProgress}</p>
            {isCefrLevel(level) ? (
              <CefrLadder current={level} hrefFor={(lvl) => `/courses?level=${lvl}`} />
            ) : (
              <p className="t-body-sm text-fg-tertiary">{t.cefrEmpty}</p>
            )}
          </div>

          {levelSource !== "test" && (
            <div className="flex flex-col gap-2 rounded-2xl border border-stroke-brand bg-bg-brand-subtle p-5">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-fg-brand" aria-hidden />
                <p className="t-label-md text-fg-brand">
                  {level ? t.placementTitleUnsure : t.placementTitleUnknown}
                </p>
              </div>
              <p className="t-body-sm text-fg-secondary">{t.placementBody}</p>
              <Button asChild size="sm" className="mt-1 self-start">
                <Link href="/placement-test">{t.placementCta}</Link>
              </Button>
            </div>
          )}

          <Alert tone="info" title={t.instructorNoteTitle} body={t.instructorNoteBody} />
        </div>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      <Skeleton className="h-8 w-64" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-80 rounded-2xl" />
    </div>
  );
}

function DashboardEmpty() {
  const router = useRouter();
  return (
    <div className="rounded-2xl border border-stroke-default bg-bg-surface">
      <EmptyState
        icon={BookOpen}
        title="No courses yet"
        body="There's nothing published for you to take right now — check back soon."
        action={{ label: "Browse courses", onClick: () => router.push("/courses") }}
      />
    </div>
  );
}
