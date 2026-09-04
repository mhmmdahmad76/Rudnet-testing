"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Award, BookOpen, Target, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { StatTile } from "@/components/lisaan/stat-tile";
import { LessonRow } from "@/components/lisaan/lesson-row";
import { CefrLadder } from "@/components/lisaan/cefr-ladder";
import { Banner } from "@/components/lisaan/banner";
import { EmptyState } from "@/components/lisaan/empty-state";
import { DEMO_COURSE, flattenItems, type LessonStatus } from "@/lib/demo-data";

/** ?state= lets you preview the documented dashboard states without a
 * backend: empty | loading | lapsed | failing | error. Default is the
 * happy path. */
export default function DashboardPage() {
  const state = useSearchParams().get("state");

  if (state === "loading") return <DashboardSkeleton />;
  if (state === "empty") return <DashboardEmpty />;

  const items = flattenItems().slice(0, 3);
  const currentItem = flattenItems().find(({ item }) => item.status === "current");
  const courseProgress = 22;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="t-h2 text-fg-primary">Good to see you, Amal</h1>
        <p className="t-body-sm text-fg-tertiary">Here&rsquo;s where you left off.</p>
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
        <StatTile icon={BookOpen} tone="brand" value={`${courseProgress}%`} label="Course progress" />
        <StatTile icon={Zap} tone="warning" value="6" label="Day streak" />
        <StatTile icon={Target} tone="success" value="3" label="Quizzes passed" />
        <StatTile icon={Award} tone="achievement" value="B1" label="Current level" />
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
                  Resume
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
            <p className="t-label-md mb-3 text-fg-primary">CEFR progress</p>
            <CefrLadder current="B1" hrefFor={(level) => `/courses?level=${level}`} />
          </div>
          <Alert
            tone="info"
            title="A note from your instructor"
            body="Focus on the past-simple unit this week — it's the one most students revisit before the quiz."
          />
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
