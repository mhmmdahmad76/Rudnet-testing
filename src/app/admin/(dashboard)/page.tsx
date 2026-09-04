"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { ColumnDef, RowSelectionState } from "@tanstack/react-table";
import {
  Bookmark,
  CircleDollarSign,
  CreditCard,
  FileText,
  Mail,
  MoreVertical,
  Search,
  SlidersHorizontal,
  UserPlus,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Banner } from "@/components/lisaan/banner";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatTile } from "@/components/lisaan/stat-tile";
import { FilterPopover } from "@/components/lisaan/filter-popover";
import { AdvancedFiltersSheet } from "@/components/lisaan/advanced-filters-sheet";
import { EmptyState } from "@/components/lisaan/empty-state";
import { DataTable } from "@/components/lisaan/data-table";
import { Modal } from "@/components/lisaan/modal";
import { Field } from "@/components/lisaan/field";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { DEMO_STUDENTS, type Level, type Student } from "@/lib/demo-data";
import { useSavedViews, type SavedView } from "@/lib/saved-views";
import {
  emptyCriteria,
  extractCriteria,
  hasAnyCriteria,
  matchesCriteria,
  useStudentFilters,
} from "@/lib/use-student-filters";

const ALL_LEVELS: Level[] = ["A1", "A2", "B1", "B2", "C1", "C2"];
const ALL_STATUSES: Student["status"][] = ["active", "trial", "pending", "lapsed"];
const STATUS_LABEL: Record<Student["status"], string> = {
  active: "Active",
  trial: "Trial",
  pending: "Pending",
  lapsed: "Lapsed",
};
const STATUS_TONE: Record<Student["status"], "success" | "brand" | "warning" | "danger"> = {
  active: "success",
  trial: "brand",
  pending: "warning",
  lapsed: "danger",
};

type EmailTarget = { label: string };
type ChangeLevelTarget = { label: string; count: number };

export default function AdminOverviewPage() {
  const router = useRouter();
  const demoState = useSearchParams().get("state");

  const [filters, setFilters] = useStudentFilters();
  const { q: search, level: levelFilter, status: statusFilter, sort: sortBy, hideCols } = filters;
  const criteria = extractCriteria(filters);

  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [grantOpen, setGrantOpen] = React.useState(false);
  const [emailFailed, setEmailFailed] = React.useState(demoState === "email-failed");
  const [advancedOpen, setAdvancedOpen] = React.useState(false);
  const [emailTarget, setEmailTarget] = React.useState<EmailTarget | null>(null);
  const [changeLevelTarget, setChangeLevelTarget] = React.useState<ChangeLevelTarget | null>(null);
  const [changeLevelValue, setChangeLevelValue] = React.useState<Level>("A1");

  const savedViews = useSavedViews();

  const students = demoState === "empty" ? [] : DEMO_STUDENTS;

  const matchesSearch = React.useCallback(
    (s: Student) =>
      !search ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()),
    [search],
  );
  const matchesLevel = (s: Student, levels: string[]) =>
    levels.length === 0 || levels.includes(s.level);
  const matchesStatus = (s: Student, statuses: string[]) =>
    statuses.length === 0 || statuses.includes(s.status);

  const searched = students.filter(matchesSearch);

  const baseForLevel = searched.filter((s) => matchesStatus(s, statusFilter));
  const levelOptions = ALL_LEVELS.map((level) => ({
    value: level,
    label: level,
    count: baseForLevel.filter((s) => s.level === level).length,
  }));

  const baseForStatus = searched.filter((s) => matchesLevel(s, levelFilter));
  const statusOptions = ALL_STATUSES.map((status) => ({
    value: status,
    label: STATUS_LABEL[status],
    count: baseForStatus.filter((s) => s.status === status).length,
  }));

  const filtered = searched.filter(
    (s) => matchesLevel(s, levelFilter) && matchesStatus(s, statusFilter) && matchesCriteria(s, criteria),
  );

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "name") return a.name.localeCompare(b.name);
    if (sortBy === "progress") return b.progressPct - a.progressPct;
    if (sortBy === "level") return a.level.localeCompare(b.level);
    return b.joinedAt.localeCompare(a.joinedAt);
  });

  const selectedIds = Object.keys(rowSelection).filter((id) => rowSelection[id]);
  const hasFilters = levelFilter.length > 0 || statusFilter.length > 0 || hasAnyCriteria(criteria);
  const advancedOnlyCount =
    (criteria.minProgress !== null ? 1 : 0) +
    (criteria.maxProgress !== null ? 1 : 0) +
    (criteria.dateFrom !== null || criteria.dateTo !== null ? 1 : 0) +
    (criteria.payment.length > 0 ? 1 : 0);

  function clearAllFilters() {
    setFilters({ ...emptyCriteria() });
  }

  function applySavedView(view: SavedView) {
    setFilters({ ...view.criteria });
  }

  function openChangeLevel(target: ChangeLevelTarget) {
    setChangeLevelValue("A1");
    setChangeLevelTarget(target);
  }

  function confirmChangeLevel() {
    if (!changeLevelTarget) return;
    toast.success(`${changeLevelTarget.label} moved to ${changeLevelValue} — progress kept`);
    setChangeLevelTarget(null);
    if (changeLevelTarget.count > 1) setRowSelection({});
  }

  const columnDefs = React.useMemo<ColumnDef<Student, unknown>[]>(() => {
    const base: ColumnDef<Student, unknown>[] = [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected()
                ? true
                : table.getIsSomePageRowsSelected()
                  ? "indeterminate"
                  : false
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(value === true)}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(value === true)}
            aria-label={`Select ${row.original.name}`}
          />
        ),
        meta: { width: "40px" },
      },
      {
        accessorKey: "name",
        header: "Student",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <Avatar name={row.original.name} size="sm" />
            <div className="min-w-0">
              <p className="t-body-sm-strong truncate text-fg-primary">{row.original.name}</p>
              <p className="t-body-xs truncate text-fg-tertiary">{row.original.email}</p>
            </div>
          </div>
        ),
      },
      { accessorKey: "level", header: "Level", meta: { width: "100px" } },
      {
        accessorKey: "progressPct",
        header: "Progress",
        meta: { width: "200px" },
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Progress value={row.original.progressPct} size="xs" className="w-24" />
            <span className="t-numeric-sm text-fg-tertiary">{row.original.progressPct}%</span>
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        meta: { width: "140px" },
        cell: ({ row }) => (
          <Badge tone={STATUS_TONE[row.original.status]}>{STATUS_LABEL[row.original.status]}</Badge>
        ),
      },
    ];

    if (!hideCols.includes("joined")) {
      base.push({
        accessorKey: "joinedAt",
        header: "Joined",
        meta: { width: "130px", className: "hidden lg:table-cell" },
        cell: ({ row }) => <span className="t-numeric-md">{row.original.joinedAt}</span>,
      });
    }

    if (!hideCols.includes("actions")) {
      base.push({
        id: "actions",
        header: "",
        meta: { width: "44px", className: "hidden lg:table-cell" },
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                onClick={(event) => event.stopPropagation()}
                className="flex size-8 items-center justify-center rounded-md text-fg-tertiary outline-none hover:bg-bg-hover focus-visible:shadow-(--elev-focus)"
                aria-label={`Actions for ${row.original.name}`}
              >
                <MoreVertical className="size-4" aria-hidden />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(event) => event.stopPropagation()}>
              <DropdownMenuItem asChild>
                <Link href={`/admin/students/${row.original.id}`}>View</Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setEmailTarget({ label: row.original.name })}>
                Email
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => openChangeLevel({ label: row.original.name, count: 1 })}
              >
                Change level
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast(`Access granted to ${row.original.name}`)}>
                Grant access
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="danger"
                onClick={() => toast(`${row.original.name} suspended`)}
              >
                Suspend
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      });
    }

    return base;
  }, [hideCols]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="t-h2 text-fg-primary">Overview</h1>
        <div className="flex gap-2">
          <Button variant="secondary" icon={<Mail />} onClick={() => setEmailTarget({ label: "all students" })}>
            Email students
          </Button>
          <Button asChild icon={<UserPlus />}>
            <Link href="/admin/courses/new">New course</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile icon={Users} tone="brand" value={String(DEMO_STUDENTS.length)} label="Active students" />
        <StatTile
          icon={CreditCard}
          tone="warning"
          value="1"
          label="Transfers awaiting approval"
          href="/admin/payments?state=pending"
        />
        <StatTile icon={FileText} tone="info" value="2" label="Essays to grade" href="/admin/grading" />
        <StatTile icon={CircleDollarSign} tone="success" value="$4,820" label="MRR" numeric />
      </div>

      {emailFailed && (
        <Banner
          tone="warning"
          title="Reached 11 of 14 students"
          body="3 addresses bounced: omar@example.com, huda@example.com, and one more."
          action={{
            label: "Resend to the 3 that failed",
            onClick: () => setEmailFailed(false),
          }}
          onDismiss={() => setEmailFailed(false)}
        />
      )}

      <div className="rounded-2xl border border-stroke-default bg-bg-surface">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stroke-subtle p-4">
          <div>
            <p className="t-h5 text-fg-primary">Students</p>
            <p className="t-body-xs text-fg-tertiary">
              {hasFilters ? `Filtered — ${sorted.length} of ${students.length} students` : `${students.length} students`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search
                className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-fg-tertiary"
                aria-hidden
              />
              <Input
                placeholder="Search"
                className="w-48 ps-9"
                value={search}
                onChange={(event) => setFilters({ q: event.target.value })}
                disabled={students.length === 0}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="sm" disabled={students.length === 0}>
                  Sort
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {(["newest", "name", "progress", "level"] as const).map((key) => (
                  <DropdownMenuItem key={key} onClick={() => setFilters({ sort: key })}>
                    {key === "newest" ? "Newest" : key[0]!.toUpperCase() + key.slice(1)}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="sm" disabled={students.length === 0}>
                  Columns
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuCheckboxItem
                  checked={!hideCols.includes("joined")}
                  onCheckedChange={(checked) =>
                    setFilters({
                      hideCols: checked ? hideCols.filter((c) => c !== "joined") : [...hideCols, "joined"],
                    })
                  }
                >
                  Joined
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={!hideCols.includes("actions")}
                  onCheckedChange={(checked) =>
                    setFilters({
                      hideCols: checked ? hideCols.filter((c) => c !== "actions") : [...hideCols, "actions"],
                    })
                  }
                >
                  Actions
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {selectedIds.length > 0 ? (
          <div className="flex flex-wrap items-center gap-3 bg-bg-brand-subtle px-4 py-3">
            <span className="t-label-md text-fg-brand">
              {selectedIds.length} student{selectedIds.length === 1 ? "" : "s"} selected
            </span>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setEmailTarget({ label: `${selectedIds.length} selected students` })}
            >
              Email
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() =>
                openChangeLevel({
                  label: `${selectedIds.length} student${selectedIds.length === 1 ? "" : "s"}`,
                  count: selectedIds.length,
                })
              }
            >
              Change level
            </Button>
            <Button size="sm" variant="danger" onClick={() => setGrantOpen(true)}>
              Grant access
            </Button>
            <Button size="sm" variant="secondary" onClick={() => toast("Exporting CSV…")}>
              Export
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setRowSelection({})}>
              Clear
            </Button>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2 px-4 py-3">
            <FilterPopover
              label="Level"
              options={levelOptions}
              selected={levelFilter}
              onApply={(values) => setFilters({ level: values })}
              computeCount={(draft) => baseForLevel.filter((s) => matchesLevel(s, draft)).length}
            />
            <FilterPopover
              label="Status"
              options={statusOptions}
              selected={statusFilter}
              onApply={(values) => setFilters({ status: values })}
              computeCount={(draft) => baseForStatus.filter((s) => matchesStatus(s, draft)).length}
            />
            <Button
              variant="secondary"
              size="sm"
              icon={<SlidersHorizontal />}
              onClick={() => setAdvancedOpen(true)}
              disabled={students.length === 0}
            >
              More filters{advancedOnlyCount > 0 ? ` (${advancedOnlyCount})` : ""}
            </Button>
            {savedViews.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" icon={<Bookmark />}>
                    Saved views
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {savedViews.map((view) => (
                    <DropdownMenuItem key={view.id} onClick={() => applySavedView(view)}>
                      {view.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            {hasFilters && (
              <button
                type="button"
                className="t-label-sm text-fg-link hover:text-fg-link-hover"
                onClick={clearAllFilters}
              >
                Clear all
              </button>
            )}
          </div>
        )}

        {demoState === "loading" ? (
          <div className="flex flex-col gap-3 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : students.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No students yet"
            body="Invite students directly, import a CSV of existing students, or grant access by hand."
            action={{ label: "Invite a student", onClick: () => toast("Invite sent") }}
            secondaryActions={[
              { label: "Import CSV", onClick: () => toast("CSV import started") },
              { label: "Grant access", onClick: () => setGrantOpen(true) },
            ]}
          />
        ) : sorted.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No students match these filters"
            body={`${statusOptions
              .filter((o) => statusFilter.includes(o.value))
              .map((o) => o.label)
              .join(", ") || "Your search"} — nobody matches yet.`}
            action={{
              label: "Clear filters",
              onClick: () => setFilters({ q: "", ...emptyCriteria() }),
            }}
          />
        ) : (
          <>
            {/* ≥769px: the full table. ≤768px: not a table — a stacked list of cards. */}
            <div className="hidden sm:block">
              <DataTable
                columns={columnDefs}
                data={sorted}
                rowSelection={rowSelection}
                onRowSelectionChange={setRowSelection}
                getRowId={(row) => row.id}
                onRowClick={(row) => router.push(`/admin/students/${row.id}`)}
              />
            </div>
            <div className="flex flex-col divide-y divide-stroke-subtle sm:hidden">
              {sorted.map((student) => (
                <div
                  key={student.id}
                  role="link"
                  tabIndex={0}
                  onClick={() => router.push(`/admin/students/${student.id}`)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") router.push(`/admin/students/${student.id}`);
                  }}
                  className="flex cursor-pointer flex-col gap-3 p-4 outline-none hover:bg-bg-hover focus-visible:bg-bg-hover"
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={Boolean(rowSelection[student.id])}
                      onCheckedChange={(checked) => {
                        setRowSelection((current) => ({ ...current, [student.id]: checked === true }));
                      }}
                      aria-label={`Select ${student.name}`}
                      className="mt-1"
                      onClick={(event) => event.stopPropagation()}
                    />
                    <Avatar name={student.name} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="t-body-sm-strong truncate text-fg-primary">{student.name}</p>
                      <p className="t-body-xs truncate text-fg-tertiary">{student.email}</p>
                    </div>
                    <Badge tone={STATUS_TONE[student.status]}>{STATUS_LABEL[student.status]}</Badge>
                  </div>
                  <div className="flex items-center gap-3 ps-11">
                    <span className="t-body-xs text-fg-tertiary">Level {student.level}</span>
                    <Progress value={student.progressPct} size="xs" className="flex-1" />
                    <span className="t-numeric-sm text-fg-tertiary">{student.progressPct}%</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between border-t border-stroke-subtle px-4 py-3">
              <p className="t-body-xs text-fg-tertiary">
                1–{sorted.length} of {sorted.length}
              </p>
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" disabled>
                  Previous
                </Button>
                <Button variant="secondary" size="sm" disabled>
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      <AdvancedFiltersSheet
        open={advancedOpen}
        onOpenChange={setAdvancedOpen}
        students={searched}
        criteria={criteria}
        onApply={(next) => setFilters({ ...next })}
      />

      <Sheet open={Boolean(emailTarget)} onOpenChange={(open) => !open && setEmailTarget(null)}>
        <SheetContent side="end">
          <SheetTitle>Email students</SheetTitle>
          <SheetDescription>Recipients: {emailTarget?.label}</SheetDescription>
          <div className="mt-6 flex flex-col gap-4">
            <Field label="Subject">
              <Input placeholder="What's new this week" />
            </Field>
            <Button
              onClick={() => {
                toast.success(`Email queued for ${emailTarget?.label}`);
                setEmailTarget(null);
              }}
            >
              Send
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={Boolean(changeLevelTarget)} onOpenChange={(open) => !open && setChangeLevelTarget(null)}>
        <DialogContent>
          <DialogTitle>Change level for {changeLevelTarget?.label}</DialogTitle>
          <DialogDescription>This does not reset progress.</DialogDescription>
          <div className="mt-4 flex flex-col gap-4">
            <Field label="New level">
              <Select value={changeLevelValue} onValueChange={(v) => setChangeLevelValue(v as Level)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ALL_LEVELS.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setChangeLevelTarget(null)}>
                Cancel
              </Button>
              <Button onClick={confirmChangeLevel}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Modal
        open={grantOpen}
        onOpenChange={setGrantOpen}
        tone="danger"
        title={`Grant access to ${selectedIds.length || 1} student${selectedIds.length === 1 || selectedIds.length === 0 ? "" : "s"}?`}
        body="This hands out paid product for free. Names and duration are recorded in the audit log."
        cancel={{ label: "Cancel", onClick: () => setGrantOpen(false) }}
        confirm={{
          label: "Grant access",
          onClick: () => {
            setGrantOpen(false);
            toast("Access granted");
          },
        }}
      />
    </div>
  );
}
