import { cookies } from "next/headers";
import Link from "next/link";
import { Award, BookOpen, Target } from "lucide-react";

import { Button } from "@/components/ui/button";
import { IconChip } from "@/components/lisaan/icon-chip";
import { STUDENT_COOKIE } from "@/lib/session";
import { DEMO_PLANS } from "@/lib/demo-data";
import { LandingCourses } from "./landing-courses";

const HOW_IT_WORKS = [
  {
    icon: BookOpen,
    title: "Lessons mapped to your level",
    body: "Every lesson is tagged to a CEFR level, from A1 to C2, so you always know exactly where you stand.",
  },
  {
    icon: Target,
    title: "Practice that sticks",
    body: "Auto-graded quizzes after every unit — instant feedback, not just a video you half-watched.",
  },
  {
    icon: Award,
    title: "One instructor, real feedback",
    body: "Essays get an AI-assisted score, with the instructor able to override it. No anonymous crowd grading.",
  },
];

export default async function LandingPage() {
  const cookieStore = await cookies();
  const signedIn = cookieStore.has(STUDENT_COOKIE);

  return (
    <div className="flex flex-col">
      <section className="mx-auto flex w-full max-w-(--breakpoint-lg) flex-col items-center gap-6 px-5 py-20 text-center lg:px-16 lg:py-28">
        <h1 className="t-display-lg lg:t-display-2xl max-w-3xl text-fg-primary">
          Fluent English,{" "}
          <span className="relative inline-block">
            <span
              className="absolute inset-x-0 bottom-1 z-0 h-2.5 rounded-full bg-bg-accent"
              aria-hidden
            />
            <span className="relative z-10">taught in Arabic</span>
          </span>
        </h1>
        <p className="t-body-lg max-w-xl text-fg-secondary">
          Recorded lessons mapped to CEFR levels, auto-graded quizzes, and one instructor who
          actually reads your work — built for Arabic speakers in the Gulf.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg">
            <Link href={signedIn ? "/dashboard" : "/sign-up"}>Start the first lesson</Link>
          </Button>
          <Button asChild variant="secondary" size="lg">
            <Link href="#courses">See the courses</Link>
          </Button>
        </div>
      </section>

      <section className="border-t border-stroke-default bg-bg-surface py-16">
        <div className="mx-auto grid w-full max-w-(--breakpoint-lg) gap-8 px-5 sm:grid-cols-3 lg:px-16">
          {HOW_IT_WORKS.map((item) => (
            <div key={item.title} className="flex flex-col items-start gap-3">
              <IconChip icon={item.icon} tone="brand" />
              <p className="t-h5 text-fg-primary">{item.title}</p>
              <p className="t-body-sm text-fg-tertiary">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="courses" className="scroll-mt-20 py-20">
        <div className="mx-auto flex w-full max-w-(--breakpoint-lg) flex-col gap-8 px-5 lg:px-16">
          <div className="flex flex-col gap-2">
            <p className="t-overline text-fg-brand">Courses</p>
            <h2 className="t-h2 text-fg-primary">Find your level</h2>
          </div>
          <LandingCourses />
        </div>
      </section>

      <section id="pricing" className="scroll-mt-20 border-t border-stroke-default bg-bg-surface py-20">
        <div className="mx-auto flex w-full max-w-(--breakpoint-lg) flex-col gap-8 px-5 lg:px-16">
          <div className="flex flex-col gap-2 text-center">
            <p className="t-overline text-fg-brand">Pricing</p>
            <h2 className="t-h2 text-fg-primary">One plan, two ways to pay for it</h2>
          </div>
          <div className="mx-auto grid w-full max-w-2xl gap-5 sm:grid-cols-2">
            {DEMO_PLANS.map((plan) => (
              <div
                key={plan.id}
                className="flex flex-col gap-4 rounded-2xl border border-stroke-default bg-bg-canvas p-6"
              >
                <div className="flex items-center justify-between">
                  <p className="t-h4 text-fg-primary">{plan.label}</p>
                  {plan.badge && <span className="t-label-sm text-fg-accent">{plan.badge}</span>}
                </div>
                <p className="t-numeric-lg text-fg-primary">
                  ${plan.price}
                  <span className="t-body-sm text-fg-tertiary"> {plan.cadence}</span>
                </p>
                <Button asChild>
                  <Link
                    href={
                      signedIn
                        ? `/onboarding/plan?plan=${plan.id}`
                        : `/sign-up?plan=${plan.id}`
                    }
                  >
                    Choose {plan.label.toLowerCase()}
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="blog" className="scroll-mt-20 py-20">
        <div className="mx-auto flex w-full max-w-(--breakpoint-lg) flex-col gap-8 px-5 lg:px-16">
          <div className="flex flex-col gap-2">
            <p className="t-overline text-fg-brand">From the blog</p>
            <h2 className="t-h2 text-fg-primary">Notes on learning English</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            {[
              "Why “since” and “for” trip up every Arabic speaker",
              "The five phrases that unlock most business calls",
              "How to actually remember new vocabulary",
            ].map((title) => (
              <div key={title} className="rounded-xl border border-stroke-default bg-bg-surface p-5">
                <p className="t-h6 text-fg-primary">{title}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
