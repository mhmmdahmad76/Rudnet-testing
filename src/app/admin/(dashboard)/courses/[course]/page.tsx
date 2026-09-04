"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import {
  ChevronDown,
  ChevronUp,
  Copy,
  MoreVertical,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Field } from "@/components/lisaan/field";
import { FileUpload } from "@/components/lisaan/file-upload";
import { Modal } from "@/components/lisaan/modal";
import { Alert } from "@/components/ui/alert";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DEMO_COURSE } from "@/lib/demo-data";

type VideoState = "none" | "uploading" | "ready" | "failed";

interface BuilderLesson {
  id: string;
  kind: "lesson";
  title: string;
  lessonKind: "Video" | "Reading" | "Quiz";
  duration: string;
  videoState: VideoState;
  uploadProgress?: number;
  transcript?: string;
}

interface BuilderQuestion {
  id: string;
  prompt: string;
  options: string[];
}

interface BuilderQuiz {
  id: string;
  kind: "quiz";
  title: string;
  passMark: number;
  attemptsAllowed: number;
  questions: BuilderQuestion[];
}

type BuilderItem = BuilderLesson | BuilderQuiz;

interface BuilderUnit {
  id: string;
  title: string;
  items: BuilderItem[];
}

function seedUnits(): BuilderUnit[] {
  return DEMO_COURSE.units.map((unit) => ({
    id: unit.id,
    title: unit.title,
    items: unit.items.map((item) =>
      item.kind === "lesson"
        ? {
            id: item.id,
            kind: "lesson" as const,
            title: item.title,
            lessonKind: item.lessonKind,
            duration: item.duration,
            // Seeded mid-upload so "Publish changes" is blocked out of the box.
            videoState: item.id === "cafe-order" ? "uploading" : "ready",
            uploadProgress: item.id === "cafe-order" ? 62 : undefined,
            transcript: "",
          }
        : {
            id: item.id,
            kind: "quiz" as const,
            title: item.title,
            passMark: item.passMark,
            attemptsAllowed: item.attemptsAllowed,
            questions: item.questions.map((q) => ({
              id: q.id,
              prompt: q.prompt,
              options: q.options.map((o) => o.text),
            })),
          },
    ),
  }));
}

export default function CourseBuilderPage() {
  const params = useParams<{ course: string }>();
  const [units, setUnits] = React.useState<BuilderUnit[]>(seedUnits);
  const [selected, setSelected] = React.useState<{ unitId: string; itemId: string }>({
    unitId: units[0]!.id,
    itemId: units[0]!.items[0]!.id,
  });
  const [deleteTarget, setDeleteTarget] = React.useState<BuilderUnit | null>(null);
  const [conflictOpen, setConflictOpen] = React.useState(false);

  const unit = units.find((u) => u.id === selected.unitId)!;
  const item = unit.items.find((i) => i.id === selected.itemId)!;

  const blockers = units
    .flatMap((u) => u.items)
    .filter((i): i is BuilderLesson => i.kind === "lesson" && i.videoState !== "ready");

  function updateItem(patch: Partial<BuilderLesson> | Partial<BuilderQuiz>) {
    setUnits((current) =>
      current.map((u) =>
        u.id !== selected.unitId
          ? u
          : {
              ...u,
              items: u.items.map((i) =>
                i.id === selected.itemId ? ({ ...i, ...patch } as BuilderItem) : i,
              ),
            },
      ),
    );
  }

  function moveItem(unitId: string, itemId: string, direction: -1 | 1) {
    setUnits((current) =>
      current.map((u) => {
        if (u.id !== unitId) return u;
        const index = u.items.findIndex((i) => i.id === itemId);
        const target = index + direction;
        if (target < 0 || target >= u.items.length) return u;
        const items = [...u.items];
        [items[index], items[target]] = [items[target]!, items[index]!];
        return { ...u, items };
      }),
    );
  }

  function duplicateItem(unitId: string, itemId: string) {
    setUnits((current) =>
      current.map((u) => {
        if (u.id !== unitId) return u;
        const source = u.items.find((i) => i.id === itemId);
        if (!source) return u;
        const newId = `${source.id}-copy-${Date.now()}`;
        const copy: BuilderItem =
          source.kind === "lesson"
            ? { ...source, id: newId, title: `${source.title} (copy)` }
            : { ...source, id: newId, title: `${source.title} (copy)` };
        return { ...u, items: [...u.items, copy] };
      }),
    );
    toast("Duplicated");
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    setUnits((current) => current.filter((u) => u.id !== deleteTarget.id));
    if (selected.unitId === deleteTarget.id) {
      const remaining = units.filter((u) => u.id !== deleteTarget.id);
      if (remaining[0]) setSelected({ unitId: remaining[0].id, itemId: remaining[0].items[0]?.id ?? "" });
    }
    toast(`"${deleteTarget.title}" deleted`);
    setDeleteTarget(null);
  }

  function publish() {
    if (blockers.length > 0) {
      toast.error("Publish blocked — fix the blockers first");
      return;
    }
    setConflictOpen(true);
  }

  const lessonCount = deleteTarget?.items.filter((i) => i.kind === "lesson").length ?? 0;
  const quizCount = deleteTarget?.items.filter((i) => i.kind === "quiz").length ?? 0;

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="t-h3 text-fg-primary">{DEMO_COURSE.title}</p>
          <p className="t-body-xs text-fg-tertiary">{DEMO_COURSE.level} · {params.course}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() =>
              window.open(`/courses/${DEMO_COURSE.slug}/lessons/${units[0]!.items[0]!.id}`, "_blank")
            }
          >
            Preview as student
          </Button>
          <Button onClick={publish}>Publish changes</Button>
        </div>
      </div>

      {blockers.length > 0 && (
        <Alert
          tone="warning"
          title={`${blockers.length} thing${blockers.length === 1 ? "" : "s"} blocking publish`}
        >
          <ul className="mt-1 flex flex-col gap-1">
            {blockers.map((b) => (
              <li key={b.id} className="t-body-sm flex items-center justify-between text-fg-secondary">
                <span>{b.title} — video still uploading</span>
                <button
                  type="button"
                  onClick={() => {
                    setUnits((current) =>
                      current.map((u) => ({
                        ...u,
                        items: u.items.map((i) =>
                          i.id === b.id ? { ...i, videoState: "ready" as const } : i,
                        ),
                      })),
                    );
                  }}
                  className="t-label-sm text-fg-link hover:text-fg-link-hover"
                >
                  Fix
                </button>
              </li>
            ))}
          </ul>
        </Alert>
      )}

      <div className="grid flex-1 gap-4 lg:grid-cols-[320px_1fr]">
        <div className="flex flex-col gap-3 rounded-2xl border border-stroke-default bg-bg-surface p-3">
          {units.map((u) => (
            <div key={u.id} className="flex flex-col gap-1">
              <p className="t-overline px-2 pt-2 text-fg-tertiary">{u.title}</p>
              {u.items.map((i, index) => (
                <div
                  key={i.id}
                  className={
                    i.id === selected.itemId
                      ? "flex items-center gap-1 rounded-lg bg-bg-selected px-2 py-1.5"
                      : "flex items-center gap-1 rounded-lg px-2 py-1.5 hover:bg-bg-hover"
                  }
                >
                  <button
                    type="button"
                    onClick={() => setSelected({ unitId: u.id, itemId: i.id })}
                    className="flex flex-1 items-center gap-2 text-start outline-none"
                  >
                    <span
                      className={
                        i.id === selected.itemId
                          ? "t-body-sm-strong truncate text-fg-brand"
                          : "t-body-sm truncate text-fg-primary"
                      }
                    >
                      {i.title}
                    </span>
                    {i.kind === "lesson" && i.videoState !== "ready" && (
                      <Badge tone="warning" dot={false}>
                        Not publishable yet
                      </Badge>
                    )}
                  </button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        aria-label={`Actions for ${i.title}`}
                        className="flex size-7 shrink-0 items-center justify-center rounded-md text-fg-tertiary outline-none hover:bg-bg-hover"
                      >
                        <MoreVertical className="size-3.5" aria-hidden />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => moveItem(u.id, i.id, -1)} disabled={index === 0}>
                        <ChevronUp className="size-4" aria-hidden /> Move up
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => moveItem(u.id, i.id, 1)}
                        disabled={index === u.items.length - 1}
                      >
                        <ChevronDown className="size-4" aria-hidden /> Move down
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => duplicateItem(u.id, i.id)}>
                        <Copy className="size-4" aria-hidden /> Duplicate
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  setUnits((current) =>
                    current.map((cu) =>
                      cu.id !== u.id
                        ? cu
                        : {
                            ...cu,
                            items: [
                              ...cu.items,
                              {
                                id: `lesson-${Date.now()}`,
                                kind: "lesson",
                                title: "New lesson",
                                lessonKind: "Video",
                                duration: "0 min",
                                videoState: "none",
                              },
                            ],
                          },
                    ),
                  )
                }
                className="t-label-sm mx-2 mb-1 flex items-center gap-1 rounded-lg px-2 py-1.5 text-fg-tertiary hover:bg-bg-hover hover:text-fg-primary"
              >
                <Plus className="size-3.5" aria-hidden /> Add lesson
              </button>
              <button
                type="button"
                onClick={() => setDeleteTarget(u)}
                className="t-label-sm mx-2 mb-2 flex items-center gap-1 rounded-lg px-2 py-1.5 text-fg-danger hover:bg-bg-danger-subtle"
              >
                <Trash2 className="size-3.5" aria-hidden /> Delete unit
              </button>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-stroke-default bg-bg-surface p-6">
          {item.kind === "lesson" ? (
            <div className="flex flex-col gap-4">
              <Field label="Title">
                <Input value={item.title} onChange={(e) => updateItem({ title: e.target.value })} />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Type">
                  <Select
                    value={item.lessonKind}
                    onValueChange={(value) => updateItem({ lessonKind: value as BuilderLesson["lessonKind"] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Video">Video</SelectItem>
                      <SelectItem value="Reading">Reading</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Duration">
                  <Input value={item.duration} onChange={(e) => updateItem({ duration: e.target.value })} />
                </Field>
              </div>

              <div>
                <p className="t-label-md mb-2 text-fg-primary">Video</p>
                {item.videoState === "none" && (
                  <FileUpload
                    state="empty"
                    meta="MP4, up to 2 GB"
                    onFiles={() => {
                      updateItem({ videoState: "uploading", uploadProgress: 0 });
                      const timer = setInterval(() => {
                        setUnits((current) => {
                          const u = current.find((cu) => cu.id === selected.unitId)!;
                          const i = u.items.find((ci) => ci.id === selected.itemId) as BuilderLesson;
                          const next = (i.uploadProgress ?? 0) + 20;
                          if (next >= 100) clearInterval(timer);
                          return current.map((cu) =>
                            cu.id !== selected.unitId
                              ? cu
                              : {
                                  ...cu,
                                  items: cu.items.map((ci) =>
                                    ci.id !== selected.itemId
                                      ? ci
                                      : { ...ci, uploadProgress: Math.min(next, 100), videoState: next >= 100 ? "ready" : "uploading" },
                                  ),
                                },
                          );
                        });
                      }, 300);
                    }}
                  />
                )}
                {item.videoState === "uploading" && (
                  <FileUpload
                    state="uploading"
                    filename="lesson-video.mp4"
                    progress={item.uploadProgress ?? 0}
                    meta={`${item.uploadProgress ?? 0}% · about ${Math.ceil((100 - (item.uploadProgress ?? 0)) / 10)} min remaining`}
                    onCancel={() => updateItem({ videoState: "none", uploadProgress: undefined })}
                  />
                )}
                {item.videoState === "ready" && (
                  <FileUpload
                    state="success"
                    filename="lesson-video.mp4"
                    meta="Ready to publish"
                  />
                )}
                {item.videoState === "failed" && (
                  <FileUpload
                    state="error"
                    filename="lesson-video.mp4"
                    meta={`Upload failed at ${item.uploadProgress ?? 40}% — resume from where it stopped.`}
                    onRetry={() => updateItem({ videoState: "uploading" })}
                  />
                )}
              </div>

              <Field label="Transcript">
                <Textarea
                  value={item.transcript ?? ""}
                  onChange={(e) => updateItem({ transcript: e.target.value })}
                  placeholder="Paste or write the lesson transcript…"
                />
              </Field>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <Field label="Title">
                <Input value={item.title} onChange={(e) => updateItem({ title: e.target.value })} />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Pass mark (%)">
                  <Input
                    type="number"
                    value={item.passMark}
                    onChange={(e) => updateItem({ passMark: Number(e.target.value) })}
                  />
                </Field>
                <Field label="Attempts allowed">
                  <Input
                    type="number"
                    value={item.attemptsAllowed}
                    onChange={(e) => updateItem({ attemptsAllowed: Number(e.target.value) })}
                  />
                </Field>
              </div>

              <div className="flex flex-col gap-3">
                <p className="t-label-md text-fg-primary">Questions</p>
                {item.questions.length === 0 && (
                  <p className="t-body-sm text-fg-tertiary">No questions yet.</p>
                )}
                {item.questions.map((q, qIndex) => (
                  <div key={q.id} className="rounded-xl border border-stroke-default p-4">
                    <p className="t-body-sm-strong mb-2 text-fg-primary">
                      Q{qIndex + 1}. {q.prompt}
                    </p>
                    <ul className="flex flex-col gap-1">
                      {q.options.map((option, oIndex) => (
                        <li key={oIndex} className="t-body-sm text-fg-tertiary">
                          {String.fromCharCode(65 + oIndex)}. {option}
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => {
                        const newOptions = [...q.options, "New answer"];
                        updateItem({
                          questions: item.questions.map((qq, i) =>
                            i === qIndex ? { ...qq, options: newOptions } : qq,
                          ),
                        });
                      }}
                      className="t-label-sm mt-2 flex items-center gap-1 text-fg-link hover:text-fg-link-hover"
                    >
                      <Plus className="size-3.5" aria-hidden /> Add answer
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Modal
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        tone="danger"
        title={`Delete "${deleteTarget?.title}"?`}
        body={`This removes ${lessonCount} lesson${lessonCount === 1 ? "" : "s"} and ${quizCount} quiz${quizCount === 1 ? "" : "zes"}, and any student progress in this unit. This can't be undone.`}
        cancel={{ label: "Archive instead", onClick: () => setDeleteTarget(null) }}
        confirm={{ label: "Delete the unit", onClick: confirmDelete }}
      />

      <Modal
        open={conflictOpen}
        onOpenChange={setConflictOpen}
        tone="neutral"
        title="Someone else saved first"
        body="This course was edited elsewhere since you loaded it. Both versions are kept — nothing is silently overwritten."
        cancel={{ label: "Compare the two versions", onClick: () => setConflictOpen(false) }}
        confirm={{
          label: "Keep my version",
          onClick: () => {
            setConflictOpen(false);
            toast.success("Published");
          },
        }}
      />
    </div>
  );
}
