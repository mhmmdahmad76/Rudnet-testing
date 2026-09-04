"use client";

import * as React from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { QuizOption } from "@/components/lisaan/quiz-option";
import { Modal } from "@/components/lisaan/modal";
import { Banner } from "@/components/lisaan/banner";
import { findQuiz } from "@/lib/demo-data";

export default function QuizPage() {
  const params = useParams<{ course: string; quiz: string }>();
  const router = useRouter();
  const demoState = useSearchParams().get("state");

  const found = findQuiz(params.course, params.quiz);
  const [index, setIndex] = React.useState(0);
  const [answers, setAnswers] = React.useState<Record<string, string>>({});
  const [exitOpen, setExitOpen] = React.useState(false);
  const [elapsed, setElapsed] = React.useState(0);
  const [justSaved, setJustSaved] = React.useState(false);
  const offline = demoState === "offline";

  React.useEffect(() => {
    if (offline) return;
    const timer = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, [offline]);

  if (!found || found.quiz.questions.length === 0) {
    return (
      <div className="mx-auto max-w-xl py-16 text-center">
        <p className="t-h4 text-fg-primary">Quiz not found</p>
      </div>
    );
  }

  if (demoState === "no-attempts") {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-4 py-16 text-center">
        <h1 className="t-h2 text-fg-primary">No attempts left</h1>
        <p className="t-body-sm text-fg-secondary">
          Your best score was 52% against a 60% pass mark — you&rsquo;ve used all 3 attempts.
        </p>
        <div className="flex gap-3">
          <Button variant="secondary">Review the unit</Button>
          <Button>Ask my teacher for another attempt</Button>
        </div>
      </div>
    );
  }

  const { quiz } = found;
  const question = quiz.questions[index]!;
  const selected = answers[question.id];
  const isLast = index === quiz.questions.length - 1;

  function select(marker: string) {
    setAnswers((current) => ({ ...current, [question.id]: marker }));
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 1500);
  }

  function submit() {
    const correctCount = quiz.questions.filter(
      (q) => answers[q.id] === q.options.find((o) => o.correct)?.marker,
    ).length;
    const score = Math.round((correctCount / quiz.questions.length) * 100);
    router.push(`/courses/${params.course}/quiz/${params.quiz}/result?score=${score}`);
  }

  const format = (seconds: number) =>
    `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setExitOpen(true)}
          className="flex size-9 items-center justify-center rounded-full text-fg-tertiary outline-none hover:bg-bg-hover focus-visible:shadow-(--elev-focus)"
          aria-label="Exit quiz"
        >
          <X aria-hidden />
        </button>
        <div className="text-center">
          <p className="t-label-md text-fg-primary">{quiz.title}</p>
          <p className="t-body-xs text-fg-tertiary">
            {quiz.questions.length} questions · no time limit · you may retake it
          </p>
        </div>
        <span className="t-numeric-sm text-fg-tertiary">{format(elapsed)}</span>
      </div>

      {offline && (
        <Banner
          tone="warning"
          title="Connection lost"
          body={`Answers 1–${index + 1} saved offline · timer paused`}
        />
      )}
      {demoState === "submit-failed" && (
        <Banner
          tone="danger"
          title="Submission failed"
          body="This attempt wasn't counted — try submitting again, or save and finish later. Attempt ID: 8841-A."
        />
      )}

      <Progress value={((index + 1) / quiz.questions.length) * 100} />

      <div className="flex flex-col gap-4 rounded-2xl border border-stroke-default bg-bg-surface p-6">
        <p className="t-overline text-fg-brand">Question {index + 1} of {quiz.questions.length}</p>
        <p className="t-h4 text-fg-primary">{question.prompt}</p>
        {question.hint && <p className="t-body-sm text-fg-tertiary">{question.hint}</p>}

        <div className="flex flex-col gap-2">
          {question.options.map((option) => (
            <QuizOption
              key={option.marker}
              marker={option.marker}
              answer={selected === option.marker ? "selected" : "default"}
              onClick={() => select(option.marker)}
            >
              {option.text}
            </QuizOption>
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-stroke-subtle pt-4">
          <p className="t-body-xs text-fg-tertiary" aria-live="polite">
            {justSaved ? "Saved" : "Autosaves as you go"}
          </p>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={index === 0}
              onClick={() => setIndex((i) => i - 1)}
            >
              Previous
            </Button>
            {isLast ? (
              <Button size="sm" disabled={!selected || offline} onClick={submit}>
                Submit
              </Button>
            ) : (
              <Button
                size="sm"
                disabled={!selected || offline}
                onClick={() => setIndex((i) => i + 1)}
              >
                Next question
              </Button>
            )}
          </div>
        </div>
      </div>

      <Modal
        open={exitOpen}
        onOpenChange={setExitOpen}
        tone="neutral"
        title="Leave the quiz?"
        body="Your answers are saved — you can pick up right where you left off."
        cancel={{ label: "Stay", onClick: () => setExitOpen(false) }}
        confirm={{
          label: "Leave",
          onClick: () => router.push(`/courses/${params.course}/lessons/${quiz.id}`),
        }}
      />
    </div>
  );
}
