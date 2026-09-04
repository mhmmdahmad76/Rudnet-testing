"use client";

import * as React from "react";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { FilterTrigger } from "@/components/lisaan/filter-trigger";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

export interface FilterOption {
  value: string;
  label: string;
  /** How many rows this option alone would match, combined with any other
   * active filters — shown so counts appear before you commit. */
  count: number;
}

export interface FilterPopoverProps {
  label: string;
  options: FilterOption[];
  selected: string[];
  onApply: (values: string[]) => void;
  /** Result count if this draft selection were applied, combined with
   * every other active filter. */
  computeCount: (draft: string[]) => number;
}

/** Counts appear before you commit — the apply button says "Show 4
 * students", not "Apply". Applied filters are never hidden: the trigger
 * carries its own value. */
function FilterPopover({ label, options, selected, onApply, computeCount }: FilterPopoverProps) {
  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState<string[]>(selected);

  // Reset the draft to the applied selection each time the popover opens —
  // adjusted during render (not an effect) per React's guidance for
  // resetting state in response to a prop/state change.
  const [wasOpen, setWasOpen] = React.useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setDraft(selected);
  }

  const valueLabel = selected.length
    ? selected.map((v) => options.find((o) => o.value === v)?.label ?? v).join(", ")
    : undefined;

  const resultCount = computeCount(draft);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <FilterTrigger
          label={label}
          value={valueLabel}
          open={open}
          onClear={selected.length > 0 ? () => onApply([]) : undefined}
        />
      </PopoverTrigger>
      <PopoverContent>
        <div className="flex flex-col gap-1">
          {options.map((option) => (
            <Checkbox
              key={option.value}
              checked={draft.includes(option.value)}
              onCheckedChange={(checked) =>
                setDraft((current) =>
                  checked ? [...current, option.value] : current.filter((v) => v !== option.value),
                )
              }
              disabled={option.count === 0}
              label={`${option.label} (${option.count})`}
            />
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-stroke-subtle pt-3">
          <button
            type="button"
            className="t-label-sm text-fg-link hover:text-fg-link-hover"
            onClick={() => setDraft([])}
          >
            Clear
          </button>
          <Button
            size="sm"
            onClick={() => {
              onApply(draft);
              setOpen(false);
            }}
          >
            Show {resultCount} student{resultCount === 1 ? "" : "s"}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export { FilterPopover };
