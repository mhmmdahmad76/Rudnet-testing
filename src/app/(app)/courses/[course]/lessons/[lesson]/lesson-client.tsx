"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Lock, Play, RefreshCw, Video as VideoIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Banner } from "@/components/lisaan/banner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LessonRow } from "@/components/lisaan/lesson-row";
import { IconChip } from "@/components/lisaan/icon-chip";
import {
  DEMO_COURSE,
  findLesson,
  flattenItems,
  FREE_PREVIEW_UNIT_ID,
  type LessonStatus,
} from "@/lib/demo-data";

export interface LessonClientProps {
  course: string;
  lessonId: string;
  isPremium: boolean;
}

export function LessonClient({ course, lessonId, isPremium }: LessonClientProps) {
  const router = useRouter();
  const demoState = useSearchParams().get("state");

  const found = findLesson(course, lessonId);
  const [playing, setPlaying] = React.useState(false);
  const [captions, setCaptions] = React.useState<"en" | "ar">("en");

  if (!found) {
    return (
      <div className="mx-auto max-w-3xl py-16 text-center">
        <p className="t-h4 text-fg-primary">Lesson not found</p>
        <Button asChild variant="secondary" className="mt-4">
          <Link href="/dashboard">Back to dashboard</Link>
        </Button>
      </div>
    );
  }

  const { unit, lesson } = found;
  const allItems = flattenItems();
  const index = allItems.findIndex(({ item }) => item.id === lesson.id);
  const previous = index > 0 ? allItems[index - 1] : null;
  const next = index < allItems.length - 1 ? allItems[index + 1] : null;
  const rail = allItems.slice(0, 5);

  // Free preview unit is always open; everything else needs a premium plan,
  // regardless of the demo course's own progression-locked status.
  const requiresPremium = unit.id !== FREE_PREVIEW_UNIT_ID && !isPremium;

  if (requiresPremium) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-4 py-16 text-center">
        <IconChip icon={Lock} tone="neutral" size="lg" />
        <h1 className="t-h2 text-fg-primary">Unlock this lesson</h1>
        <p className="t-body-sm text-fg-secondary">
          Your free preview is done. Upgrade to unlock “{lesson.title}” and the rest of{" "}
          {DEMO_COURSE.title}.
        </p>
        <div className="flex gap-3">
          <Button asChild>
            <Link href="/onboarding/plan">Upgrade</Link>
          </Button>
          <Button variant="secondary" asChild>
            <Link href={`/courses/${course}`}>See what&rsquo;s included</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" icon={<ArrowLeft />} asChild>
          <Link href="/dashboard">Back</Link>
        </Button>
        <p className="t-body-sm text-fg-tertiary">
          {DEMO_COURSE.title} · {unit.title} · Lesson {index + 1} of {allItems.length}
        </p>
      </div>

      {demoState === "archived" && (
        <Banner
          tone="info"
          title="This course has been archived"
          body="You keep your access and everything still works — it's just hidden from the catalogue and no new lessons will be added."
        />
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-6">
          {demoState === "failed" ? (
            <div className="flex aspect-video flex-col items-center justify-center gap-3 rounded-2xl bg-bg-inverse p-8 text-center">
              <VideoIcon className="size-8 text-fg-inverse/60" aria-hidden />
              <p className="t-body-sm-strong text-fg-inverse">The video failed to load</p>
              <p className="t-body-sm max-w-sm text-fg-inverse/70">
                This looks like something on our side — not your connection.
              </p>
              <div className="flex gap-2">
                <Button size="sm" icon={<RefreshCw />}>
                  Try again
                </Button>
                <Button size="sm" variant="secondary">
                  Read the transcript instead
                </Button>
              </div>
            </div>
          ) : demoState === "audio" ? (
            <div className="flex h-24 items-center gap-4 rounded-2xl bg-bg-inverse px-6">
              <Button size="sm" icon={<Play />} onClick={() => setPlaying(true)}>
                Play
              </Button>
              <div className="h-8 flex-1 rounded bg-fg-inverse/10" aria-hidden />
              <span className="t-label-sm rounded-full bg-fg-inverse/10 px-2 py-1 text-fg-inverse">
                Audio only
              </span>
            </div>
          ) : (
            <div className="relative flex aspect-video items-center justify-center rounded-2xl bg-bg-inverse">
              {!playing ? (
                <button
                  type="button"
                  onClick={() => setPlaying(true)}
                  className="flex size-16 items-center justify-center rounded-full bg-fg-inverse/10 text-fg-inverse outline-none transition-colors hover:bg-fg-inverse/20 focus-visible:shadow-(--elev-focus)"
                >
                  <Play className="size-7" aria-hidden />
                </button>
              ) : (
                <p className="t-body-sm text-fg-inverse/70">Playing “{lesson.title}”…</p>
              )}
              <div className="absolute bottom-3 end-3 flex gap-1">
                {(["en", "ar"] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setCaptions(lang)}
                    className={
                      captions === lang
                        ? "t-label-sm rounded-full bg-fg-inverse/20 px-2 py-1 text-fg-inverse"
                        : "t-label-sm rounded-full px-2 py-1 text-fg-inverse/60 hover:text-fg-inverse"
                    }
                  >
                    CC {lang.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          )}

          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="lessons">Lessons</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
              <TabsTrigger value="discussion">Discussion</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="t-body-sm flex flex-col gap-3 pt-4 text-fg-secondary">
              <p>
                In this lesson you&rsquo;ll practice the phrases that come up most often when ordering
                food and drinks, plus the polite requests that go with them.
              </p>
              <p className="t-label-sm text-fg-primary">Transcript</p>
              <p>
                Waiter: Good afternoon — are you ready to order? Customer: Yes, could I have the
                grilled chicken, please, and a sparkling water…
              </p>
            </TabsContent>
            <TabsContent value="lessons" className="pt-4">
              <div className="flex flex-col gap-1">
                {unit.items.map((item) => (
                  <LessonRow
                    key={item.id}
                    status={item.status as LessonStatus}
                    title={item.title}
                    kind={item.kind === "quiz" ? "Quiz" : item.lessonKind}
                    duration={item.duration}
                    href={
                      item.kind === "lesson"
                        ? `/courses/${course}/lessons/${item.id}`
                        : `/courses/${course}/quiz/${item.id}`
                    }
                  />
                ))}
              </div>
            </TabsContent>
            <TabsContent value="resources" className="t-body-sm pt-4 text-fg-tertiary">
              No downloadable resources for this lesson yet.
            </TabsContent>
            <TabsContent value="discussion" className="t-body-sm pt-4 text-fg-tertiary">
              Discussion is coming in a future release.
            </TabsContent>
          </Tabs>

          <div className="flex items-center justify-between border-t border-stroke-default pt-4">
            <Button
              variant="secondary"
              disabled={!previous}
              onClick={() =>
                previous &&
                router.push(
                  previous.item.kind === "lesson"
                    ? `/courses/${course}/lessons/${previous.item.id}`
                    : `/courses/${course}/quiz/${previous.item.id}`,
                )
              }
            >
              Previous
            </Button>
            <Button
              onClick={() =>
                next &&
                router.push(
                  next.item.kind === "lesson"
                    ? `/courses/${course}/lessons/${next.item.id}`
                    : `/courses/${course}/quiz/${next.item.id}`,
                )
              }
            >
              Mark complete and continue
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-stroke-default bg-bg-surface p-5">
            <p className="t-label-md mb-2 text-fg-primary">{unit.title}</p>
            <Progress value={40} size="xs" className="mb-4" />
            <div className="flex flex-col gap-1">
              {rail.map(({ item }) => (
                <LessonRow
                  key={item.id}
                  status={item.status as LessonStatus}
                  title={item.title}
                  kind={item.kind === "quiz" ? "Quiz" : item.lessonKind}
                  duration={item.duration}
                  href={
                    item.kind === "lesson"
                      ? `/courses/${course}/lessons/${item.id}`
                      : `/courses/${course}/quiz/${item.id}`
                  }
                  lockedReason="Unlocks after the lesson before it"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
