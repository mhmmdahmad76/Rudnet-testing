"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Lock, Play, RefreshCw, Video as VideoIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Banner } from "@/components/lisaan/banner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LessonRow, type LessonRowProps } from "@/components/lisaan/lesson-row";
import { IconChip } from "@/components/lisaan/icon-chip";

export interface CourseItemView {
  id: string;
  kind: "lesson" | "quiz";
  title: string;
  lessonKind: "Video" | "Reading" | null;
  duration: string;
  status: LessonRowProps["status"];
  href: string;
}

export interface LessonClientProps {
  courseSlug: string;
  requiresPremium: boolean;
  lesson: { id: string; title: string; lessonKind: "Video" | "Reading"; duration: string };
  unit: { title: string; items: CourseItemView[] };
  index: number;
  totalItems: number;
  previousHref: string | null;
  nextHref: string | null;
  rail: CourseItemView[];
  markCompleteAction: (itemId: string) => Promise<unknown>;
}

export function LessonClient({
  courseSlug,
  requiresPremium,
  lesson,
  unit,
  index,
  totalItems,
  previousHref,
  nextHref,
  rail,
  markCompleteAction,
}: LessonClientProps) {
  const router = useRouter();
  const demoState = useSearchParams().get("state");

  const [playing, setPlaying] = React.useState(false);
  const [captions, setCaptions] = React.useState<"en" | "ar">("en");
  const [completing, setCompleting] = React.useState(false);

  if (requiresPremium) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-4 py-16 text-center">
        <IconChip icon={Lock} tone="neutral" size="lg" />
        <h1 className="t-h2 text-fg-primary">Unlock this lesson</h1>
        <p className="t-body-sm text-fg-secondary">
          Your free preview is done. Upgrade to unlock “{lesson.title}”.
        </p>
        <div className="flex gap-3">
          <Button asChild>
            <Link href="/onboarding/plan">Upgrade</Link>
          </Button>
          <Button variant="secondary" asChild>
            <Link href={`/courses/${courseSlug}`}>See what&rsquo;s included</Link>
          </Button>
        </div>
      </div>
    );
  }

  const unitCompleted = unit.items.filter((i) => i.status === "complete").length;
  const unitProgress = unit.items.length > 0 ? Math.round((unitCompleted / unit.items.length) * 100) : 0;

  async function completeAndContinue() {
    setCompleting(true);
    await markCompleteAction(lesson.id);
    router.refresh();
    if (nextHref) router.push(nextHref);
    setCompleting(false);
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" icon={<ArrowLeft />} asChild>
          <Link href="/dashboard">Back</Link>
        </Button>
        <p className="t-body-sm text-fg-tertiary">
          {unit.title} · Lesson {index + 1} of {totalItems}
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
                    status={item.status}
                    title={item.title}
                    kind={item.kind === "quiz" ? "Quiz" : item.lessonKind!}
                    duration={item.duration}
                    href={item.href}
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
            <Button variant="secondary" disabled={!previousHref} onClick={() => previousHref && router.push(previousHref)}>
              Previous
            </Button>
            <Button onClick={completeAndContinue} loading={completing}>
              Mark complete and continue
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-stroke-default bg-bg-surface p-5">
            <p className="t-label-md mb-2 text-fg-primary">{unit.title}</p>
            <Progress value={unitProgress} size="xs" className="mb-4" />
            <div className="flex flex-col gap-1">
              {rail.map((item) => (
                <LessonRow
                  key={item.id}
                  status={item.status}
                  title={item.title}
                  kind={item.kind === "quiz" ? "Quiz" : item.lessonKind!}
                  duration={item.duration}
                  href={item.href}
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
