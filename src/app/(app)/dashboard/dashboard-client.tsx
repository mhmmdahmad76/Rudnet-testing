"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
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
import { DEMO_COURSE, flattenItems, type LessonStatus } from "@/lib/demo-data";
import { DEFAULT_LOCALE, type Locale } from "@/lib/locale";
import { getDictionary } from "@/lib/i18n";

export interface DashboardClientProps {
  name: string;
  level: string | null;
  levelSource: "self" | "test" | null;
  locale?: Locale;
}

function isCefrLevel(value: string | null): value is CefrLevel {
  return value !== null && (LEVELS as readonly string[]).includes(value);
}

/** ?state= lets you preview the documented dashboard states without a
 * backend: empty | loading | lapsed | failing | error. Default is the
 * happy path. */
export default function DashboardClient({
  name,
  level,
  levelSource,
  locale = DEFAULT_LOCALE,
}: DashboardClientProps) {
  const state = useSearchParams().get("state");
  const t = getDictionary(locale).dashboard;

  if (state === "loading") return <DashboardSkeleton />;
  if (state === "empty") return <DashboardEmpty />;

  const items = flattenItems().slice(0, 3);
  const currentItem = flattenItems().find(({ item }) => item.status === "current");
  const courseProgress = 22;
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
        <StatTile icon={BookOpen} tone="brand" value={`${courseProgress}%`} label={t.courseProgress} />
        <StatTile icon={Zap} tone="warning" value="6" label={t.dayStreak} />
        <StatTile icon={Target} tone="success" value="3" label={t.quizzesPassed} />
        <StatTile icon={Award} tone="achievement" value={level ?? "—"} label={t.currentLevel} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-4 rounded-2xl border border-stroke-default bg-bg-surface p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="t-h4 text-fg-primary">{DEMO_COURSE.title}</p>
              <p className="t-body-xs text-fg-tertiary">{DEMO_COURSE.meta}</p>
            </div>
            {currentItem && (
              <Button asChild>
                <Link href={`/courses/${DEMO_COURSE.slug}/lessons/${currentItem.item.id}`}>
                  {t.resume}
                </Link>
              </Button>
            )}
          </div>
          <Progress value={courseProgress} />
          <div className="flex flex-col gap-1">
            {items.map(({ item }) => (
              <LessonRow
                key={item.id}
                status={item.status as LessonStatus}
                title={item.title}
                kind={item.kind === "quiz" ? "Quiz" : item.lessonKind}
                duration={item.duration}
                href={
                  item.kind === "lesson"
                    ? `/courses/${DEMO_COURSE.slug}/lessons/${item.id}`
                    : `/courses/${DEMO_COURSE.slug}/quiz/${item.id}`
                }
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
  return (
    <div className="rounded-2xl border border-stroke-default bg-bg-surface">
      <EmptyState
        icon={BookOpen}
        title="Start your first lesson"
        body="You haven't started a course yet — pick up “Greetings and introductions” to get going."
        action={{ label: "Start the first lesson", onClick: () => {} }}
      />
    </div>
  );
}
