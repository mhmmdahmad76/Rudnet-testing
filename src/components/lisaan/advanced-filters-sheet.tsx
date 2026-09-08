"use client";

import * as React from "react";
import { Bookmark, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Field } from "@/components/lisaan/field";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
  emptyCriteria,
  hasTag,
  isoDaysAgo,
  isoStartOfYear,
  isoToday,
  matchesCriteria,
  PAYMENT_TAGS,
  STUDENT_TAGS,
  type AdminStudent,
  type DatePreset,
  type PaymentTag,
  type SavedFilterCriteria,
  type StudentTag,
} from "@/lib/use-student-filters";
import { saveView, useSavedViews, deleteView, type SavedView } from "@/lib/saved-views";

const ALL_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];
const STATUS_LABEL: Record<StudentTag, string> = {
  premium: "Premium",
  free: "Free plan",
  suspended: "Suspended",
  unverified: "Email not verified",
};
const PAYMENT_LABEL: Record<PaymentTag, string> = {
  pending_transfer: "Bank transfer awaiting approval",
};
const DATE_PRESETS: { value: DatePreset; label: string }[] = [
  { value: "30d", label: "30 days" },
  { value: "90d", label: "90 days" },
  { value: "year", label: "This year" },
  { value: "custom", label: "Custom" },
];

export interface AdvancedFiltersSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Students already narrowed by search — the pool counts are computed against. */
  students: AdminStudent[];
  criteria: SavedFilterCriteria;
  onApply: (criteria: SavedFilterCriteria) => void;
}

/**
 * §9.23 — every filter group at once, in one drawer, with the result count
 * shown before you commit. Distinct from FilterPopover (§9.21), which
 * handles one group inline in the toolbar.
 */
function AdvancedFiltersSheet({ open, onOpenChange, students, criteria, onApply }: AdvancedFiltersSheetProps) {
  const [draft, setDraft] = React.useState<SavedFilterCriteria>(criteria);
  const [saveOpen, setSaveOpen] = React.useState(false);
  const [viewName, setViewName] = React.useState("");
  const savedViews = useSavedViews();

  // Re-seed the draft from the applied criteria each time the sheet opens.
  const [wasOpen, setWasOpen] = React.useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setDraft(criteria);
  }

  const resultCount = students.filter((s) => matchesCriteria(s, draft)).length;

  function toggle(key: "level" | "status" | "payment", value: string) {
    setDraft((current) => {
      const list = current[key] as string[];
      return {
        ...current,
        [key]: list.includes(value) ? list.filter((v) => v !== value) : [...list, value],
      };
    });
  }

  function applyPreset(preset: DatePreset) {
    if (preset === "custom") {
      setDraft((current) => ({ ...current, datePreset: preset }));
      return;
    }
    const to = isoToday();
    const from = preset === "30d" ? isoDaysAgo(30) : preset === "90d" ? isoDaysAgo(90) : isoStartOfYear();
    setDraft((current) => ({ ...current, datePreset: preset, dateFrom: from, dateTo: to }));
  }

  function applySavedView(view: SavedView) {
    setDraft(view.criteria);
  }

  function handleSaveView() {
    if (!viewName.trim()) return;
    saveView(viewName.trim(), draft);
    toast.success(`Saved “${viewName.trim()}”`);
    setViewName("");
    setSaveOpen(false);
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="end" className="w-[420px] max-w-[92vw] overflow-y-auto">
          <SheetTitle>Advanced filters</SheetTitle>
          <SheetDescription>Every filter at once — the count updates as you go.</SheetDescription>

          <div className="mt-6 flex flex-col gap-6">
            {savedViews.length > 0 && (
              <section className="flex flex-col gap-2">
                <p className="t-label-md text-fg-primary">Saved views</p>
                <ul className="flex flex-col gap-1">
                  {savedViews.map((view) => (
                    <li key={view.id} className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => applySavedView(view)}
                        className="flex flex-1 items-center gap-2 rounded-md px-2 py-1.5 text-start t-body-sm text-fg-secondary hover:bg-bg-hover"
                      >
                        <Bookmark className="size-4 shrink-0 text-fg-tertiary" aria-hidden />
                        {view.name}
                      </button>
                      <button
                        type="button"
                        aria-label={`Delete saved view ${view.name}`}
                        onClick={() => deleteView(view.id)}
                        className="flex size-8 items-center justify-center rounded-md text-fg-tertiary hover:bg-bg-hover hover:text-fg-danger"
                      >
                        <Trash2 className="size-4" aria-hidden />
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section className="flex flex-col gap-2">
              <p className="t-label-md text-fg-primary">Level</p>
              <div className="flex flex-wrap gap-2">
                {ALL_LEVELS.map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => toggle("level", level)}
                    className={cn(
                      "t-label-sm rounded-full border px-3 py-1.5 transition-colors",
                      draft.level.includes(level)
                        ? "border-stroke-brand bg-bg-brand-subtle text-fg-brand"
                        : "border-stroke-default text-fg-secondary hover:bg-bg-hover",
                    )}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </section>

            <section className="flex flex-col gap-1">
              <p className="t-label-md mb-1 text-fg-primary">Status</p>
              {STUDENT_TAGS.map((tag) => (
                <Checkbox
                  key={tag}
                  checked={draft.status.includes(tag)}
                  onCheckedChange={() => toggle("status", tag)}
                  label={`${STATUS_LABEL[tag]} (${students.filter((s) => hasTag(s, tag)).length})`}
                />
              ))}
            </section>

            <section className="flex flex-col gap-2">
              <p className="t-label-md text-fg-primary">Progress</p>
              <div className="flex items-center gap-2">
                <Field label="Min %">
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={draft.minProgress ?? ""}
                    onChange={(e) =>
                      setDraft((c) => ({
                        ...c,
                        minProgress: e.target.value === "" ? null : Number(e.target.value),
                      }))
                    }
                  />
                </Field>
                <Field label="Max %">
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={draft.maxProgress ?? ""}
                    onChange={(e) =>
                      setDraft((c) => ({
                        ...c,
                        maxProgress: e.target.value === "" ? null : Number(e.target.value),
                      }))
                    }
                  />
                </Field>
              </div>
            </section>

            <section className="flex flex-col gap-2">
              <p className="t-label-md text-fg-primary">Joined</p>
              <div className="flex flex-wrap gap-2">
                {DATE_PRESETS.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => applyPreset(preset.value)}
                    className={cn(
                      "t-label-sm rounded-full border px-3 py-1.5 transition-colors",
                      draft.datePreset === preset.value
                        ? "border-stroke-brand bg-bg-brand-subtle text-fg-brand"
                        : "border-stroke-default text-fg-secondary hover:bg-bg-hover",
                    )}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              {draft.datePreset === "custom" && (
                <div className="flex items-center gap-2">
                  <Field label="From">
                    <Input
                      type="date"
                      value={draft.dateFrom ?? ""}
                      onChange={(e) => setDraft((c) => ({ ...c, dateFrom: e.target.value || null }))}
                    />
                  </Field>
                  <Field label="To">
                    <Input
                      type="date"
                      value={draft.dateTo ?? ""}
                      onChange={(e) => setDraft((c) => ({ ...c, dateTo: e.target.value || null }))}
                    />
                  </Field>
                </div>
              )}
            </section>

            <section className="flex flex-col gap-1">
              <p className="t-label-md mb-1 text-fg-primary">Payment</p>
              {PAYMENT_TAGS.map((tag) => (
                <Checkbox
                  key={tag}
                  checked={draft.payment.includes(tag)}
                  onCheckedChange={() => toggle("payment", tag)}
                  label={PAYMENT_LABEL[tag]}
                />
              ))}
            </section>
          </div>

          <div className="mt-6 flex items-center justify-between gap-2 border-t border-stroke-subtle pt-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="t-label-sm text-fg-link hover:text-fg-link-hover"
                onClick={() => setDraft(emptyCriteria())}
              >
                Clear all
              </button>
              <span className="text-fg-tertiary">·</span>
              <button
                type="button"
                className="t-label-sm text-fg-link hover:text-fg-link-hover"
                onClick={() => setSaveOpen(true)}
              >
                Save this view
              </button>
            </div>
            <Button
              size="sm"
              onClick={() => {
                onApply(draft);
                onOpenChange(false);
              }}
            >
              Show {resultCount} student{resultCount === 1 ? "" : "s"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
        <DialogContent>
          <DialogTitle>Save this view</DialogTitle>
          <DialogDescription>Give this filter combination a name to reuse it later.</DialogDescription>
          <div className="mt-4 flex flex-col gap-4">
            <Field label="Name">
              <Input
                value={viewName}
                onChange={(e) => setViewName(e.target.value)}
                placeholder="e.g. Lapsed B1+"
                autoFocus
              />
            </Field>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setSaveOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveView} disabled={!viewName.trim()}>
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export { AdvancedFiltersSheet };
