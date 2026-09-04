"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Award, Clock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert } from "@/components/ui/alert";
import { IconChip } from "@/components/lisaan/icon-chip";
import { findQuiz } from "@/lib/demo-data";

export default function QuizResultPage() {
  const params = useParams<{ course: string; quiz: string }>();
  const searchParams = useSearchParams();
  const demoState = searchParams.get("state");
  const score = Number(searchParams.get("score") ?? "80");

  const found = findQuiz(params.course, params.quiz);
  if (!found) return null;
  const { quiz } = found;

  if (demoState === "awaiting") {
    return (
      <div className="mx-auto flex max-w-xl flex-col gap-6">
        <Alert
          tone="info"
          title="AI-graded — may be revised by your teacher"
          body="One or more answers need written feedback. You'll see the final score once your instructor has reviewed it."
        />
        <div className="rounded-2xl border border-stroke-default bg-bg-surface p-6">
          <p className="t-label-md mb-3 text-fg-primary">Your submission</p>
          <div className="flex flex-col gap-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
        <Button asChild variant="secondary">
          <Link href="/dashboard">Back to dashboard</Link>
        </Button>
      </div>
    );
  }

  const passed = score >= quiz.passMark;

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-6 text-center">
      <div className="relative flex size-28 items-center justify-center rounded-full border-4 border-stroke-default">
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `conic-gradient(var(--bg-brand) ${score * 3.6}deg, transparent 0deg)`,
            mask: "radial-gradient(farthest-side, transparent calc(100% - 6px), black calc(100% - 6px))",
            WebkitMask: "radial-gradient(farthest-side, transparent calc(100% - 6px), black calc(100% - 6px))",
          }}
          aria-hidden
        />
        <span className="t-h2 text-fg-primary">{score}%</span>
      </div>

      {passed ? (
        <>
          <IconChip icon={Award} tone="achievement" />
          <h1 className="t-h2 text-fg-primary">You passed</h1>
          <p className="t-body-sm max-w-sm text-fg-secondary">
            The pass mark was {quiz.passMark}%. Two answers were worth a second look — the past
            simple negative form, and polite requests with “could”.
          </p>
          <div className="flex gap-3">
            <Button>Continue to the next unit</Button>
            <Button variant="secondary" asChild>
              <Link href={`/courses/${params.course}/lessons/${quiz.id}`}>Review my answers</Link>
            </Button>
          </div>
        </>
      ) : (
        <>
          <IconChip icon={Clock} tone="warning" />
          <h1 className="t-h2 text-fg-primary">Not quite — {score}%, the pass mark is {quiz.passMark}%</h1>
          <p className="t-body-sm max-w-sm text-fg-secondary">
            Review “Past simple tense” (4:12) before your next attempt — that's where most of the
            missed points came from. You have 2 attempts left.
          </p>
          <div className="flex gap-3">
            <Button asChild>
              <Link href={`/courses/${params.course}/lessons/${quiz.id}`}>Review the lesson</Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link href={`/courses/${params.course}/quiz/${params.quiz}`}>Try again</Link>
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
