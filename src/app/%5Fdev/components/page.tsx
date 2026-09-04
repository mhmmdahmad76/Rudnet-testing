"use client";

import * as React from "react";
import {
  Award,
  BarChart3,
  Bell,
  BookOpen,
  Clock,
  CreditCard,
  Landmark,
  Mail,
  MoreVertical,
  Percent,
  Search,
  Settings,
  Users,
} from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert } from "@/components/ui/alert";

import { IconButton } from "@/components/lisaan/icon-button";
import { IconChip } from "@/components/lisaan/icon-chip";
import { LanguageSwitcher } from "@/components/lisaan/language-switcher";
import { Logo } from "@/components/lisaan/logo";
import { Field } from "@/components/lisaan/field";
import { CodeInput } from "@/components/lisaan/code-input";
import { ChoiceCard } from "@/components/lisaan/choice-card";
import { FileUpload } from "@/components/lisaan/file-upload";
import { FilterTrigger } from "@/components/lisaan/filter-trigger";
import { CourseCard } from "@/components/lisaan/course-card";
import { StatTile } from "@/components/lisaan/stat-tile";
import { LessonRow } from "@/components/lisaan/lesson-row";
import { CefrLadder } from "@/components/lisaan/cefr-ladder";
import { QuizOption } from "@/components/lisaan/quiz-option";
import { Banner } from "@/components/lisaan/banner";
import { Modal } from "@/components/lisaan/modal";
import { NavItem } from "@/components/lisaan/nav-item";
import { SiteHeader } from "@/components/lisaan/site-header";
import { EmptyState } from "@/components/lisaan/empty-state";
import { DataTable } from "@/components/lisaan/data-table";

function Section({ title, id, children }: { title: string; id: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 border-t border-stroke-default pt-10 first:border-t-0 first:pt-0">
      <h2 className="t-h2 mb-6 text-fg-primary">{title}</h2>
      <div className="flex flex-col gap-8">{children}</div>
    </section>
  );
}

function Swatch({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="t-overline text-fg-tertiary">{label}</p>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  );
}

interface DemoStudent {
  id: string;
  name: string;
  level: string;
  progress: number;
  status: "active" | "trial" | "pending" | "lapsed";
  joined: string;
}

const DEMO_STUDENTS: DemoStudent[] = [
  { id: "1", name: "Amal Al-Farsi", level: "B1", progress: 62, status: "active", joined: "2025-02-14" },
  { id: "2", name: "Yousef Nasser", level: "A2", progress: 18, status: "trial", joined: "2025-08-01" },
  { id: "3", name: "Rania Haddad", level: "C1", progress: 91, status: "active", joined: "2024-11-30" },
];

const STATUS_TONE: Record<DemoStudent["status"], "success" | "brand" | "warning" | "danger"> = {
  active: "success",
  trial: "brand",
  pending: "warning",
  lapsed: "danger",
};

export default function ComponentGallery() {
  const [dir, setDir] = React.useState<"ltr" | "rtl">("ltr");
  const [theme, setTheme] = React.useState<"light" | "dark">("light");

  const [checked, setChecked] = React.useState<boolean | "indeterminate">(true);
  const [switchOn, setSwitchOn] = React.useState(true);
  const [radioValue, setRadioValue] = React.useState("a2");
  const [choiceValue, setChoiceValue] = React.useState("b1");
  const [code, setCode] = React.useState("123");
  const [modalOpen, setModalOpen] = React.useState(false);
  const [dangerModalOpen, setDangerModalOpen] = React.useState(false);
  const [filterOpen, setFilterOpen] = React.useState(false);
  const [rowSelection, setRowSelection] = React.useState({});

  const columns = React.useMemo<ColumnDef<DemoStudent, unknown>[]>(
    () => [
      {
        id: "select",
        header: () => <span className="t-overline">Sel.</span>,
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(value === true)}
            aria-label="Select row"
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
            <span className="t-body-sm-strong">{row.original.name}</span>
          </div>
        ),
      },
      { accessorKey: "level", header: "Level", meta: { width: "100px" } },
      {
        accessorKey: "progress",
        header: "Progress",
        meta: { width: "200px" },
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Progress value={row.original.progress} size="xs" className="w-24" />
            <span className="t-numeric-sm text-fg-tertiary">{row.original.progress}%</span>
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        meta: { width: "140px" },
        cell: ({ row }) => <Badge tone={STATUS_TONE[row.original.status]}>{row.original.status}</Badge>,
      },
      {
        accessorKey: "joined",
        header: "Joined",
        meta: { width: "130px", className: "hidden lg:table-cell" },
        cell: ({ row }) => <span className="t-numeric-md">{row.original.joined}</span>,
      },
      {
        id: "actions",
        header: "",
        meta: { width: "44px", className: "hidden lg:table-cell" },
        cell: () => (
          <IconButton aria-label="Row actions" variant="ghost" size="sm">
            <MoreVertical aria-hidden />
          </IconButton>
        ),
      },
    ],
    [],
  );

  return (
    <div className="min-h-screen bg-bg-canvas">
      <div className="sticky top-0 z-50 flex flex-wrap items-center justify-between gap-3 border-b border-stroke-default bg-bg-surface px-6 py-3">
        <div>
          <p className="t-h5 text-fg-primary">Lisaan component gallery</p>
          <p className="t-body-xs text-fg-tertiary">Every variant, both directions, both themes.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex overflow-hidden rounded-md border border-stroke-default">
            <button
              onClick={() => setDir("ltr")}
              className={cn("t-label-sm px-3 py-1.5", dir === "ltr" ? "bg-bg-brand text-fg-on-brand" : "bg-bg-surface text-fg-secondary")}
            >
              LTR
            </button>
            <button
              onClick={() => setDir("rtl")}
              className={cn("t-label-sm px-3 py-1.5", dir === "rtl" ? "bg-bg-brand text-fg-on-brand" : "bg-bg-surface text-fg-secondary")}
            >
              RTL
            </button>
          </div>
          <div className="inline-flex overflow-hidden rounded-md border border-stroke-default">
            <button
              onClick={() => setTheme("light")}
              className={cn("t-label-sm px-3 py-1.5", theme === "light" ? "bg-bg-brand text-fg-on-brand" : "bg-bg-surface text-fg-secondary")}
            >
              Light
            </button>
            <button
              onClick={() => setTheme("dark")}
              className={cn("t-label-sm px-3 py-1.5", theme === "dark" ? "bg-bg-brand text-fg-on-brand" : "bg-bg-surface text-fg-secondary")}
            >
              Dark
            </button>
          </div>
        </div>
      </div>

      <div
        dir={dir}
        data-theme={theme}
        className="mx-auto flex max-w-5xl flex-col gap-14 bg-bg-canvas px-6 py-10 text-fg-primary"
      >
        <Section title="A · Foundations" id="foundations">
          <Swatch label="Button — variant">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
          </Swatch>
          <Swatch label="Button — size">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </Swatch>
          <Swatch label="Button — state">
            <Button loading>Loading</Button>
            <Button disabled>Disabled</Button>
            <Button icon={<BookOpen />}>With icon</Button>
          </Swatch>

          <Swatch label="Badge — tone">
            <Badge tone="neutral">Neutral</Badge>
            <Badge tone="brand">Brand</Badge>
            <Badge tone="success">Success</Badge>
            <Badge tone="warning">Warning</Badge>
            <Badge tone="danger">Danger</Badge>
            <Badge tone="achievement">Achievement</Badge>
            <Badge tone="neutral" dot={false}>
              No dot
            </Badge>
          </Swatch>

          <Swatch label="Avatar — size">
            <Avatar name="Amal Al-Farsi" size="sm" />
            <Avatar name="Yousef Nasser" size="md" />
            <Avatar name="Rania Haddad" size="lg" />
          </Swatch>

          <Swatch label="Progress">
            <div className="flex w-64 flex-col gap-3">
              <Progress value={30} size="md" />
              <Progress value={65} size="xs" />
            </div>
          </Swatch>

          <Swatch label="IconButton">
            <IconButton aria-label="Settings" variant="ghost" size="sm">
              <Settings aria-hidden />
            </IconButton>
            <IconButton aria-label="Settings" variant="secondary" size="md">
              <Settings aria-hidden />
            </IconButton>
          </Swatch>

          <Swatch label="IconChip — tone">
            <IconChip icon={BookOpen} tone="neutral" size="sm" />
            <IconChip icon={Award} tone="brand" size="md" />
            <IconChip icon={Percent} tone="accent" size="lg" />
            <IconChip icon={Users} tone="success" />
            <IconChip icon={Bell} tone="warning" />
            <IconChip icon={CreditCard} tone="danger" />
            <IconChip icon={Award} tone="achievement" />
            <IconChip icon={BarChart3} tone="info" />
          </Swatch>

          <Swatch label="LanguageSwitcher / Logo">
            <LanguageSwitcher locale="en" />
            <Logo type="lockup" tone="colour" />
            <Logo type="mark" tone="colour" />
          </Swatch>

          <Swatch label="Separator / Skeleton">
            <div className="flex w-64 flex-col gap-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Separator />
            </div>
          </Swatch>
        </Section>

        <Section title="B · Forms" id="forms">
          <Swatch label="Field + Input">
            <div className="w-72">
              <Field label="Email" help="We'll never share it.">
                <Input placeholder="you@example.com" />
              </Field>
            </div>
            <div className="w-72">
              <Field label="Email" error="That address already has an account.">
                <Input defaultValue="bad@" />
              </Field>
            </div>
          </Swatch>

          <Swatch label="Select">
            <div className="w-56">
              <Select defaultValue="b1">
                <SelectTrigger>
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="a1">A1</SelectItem>
                  <SelectItem value="a2">A2</SelectItem>
                  <SelectItem value="b1">B1</SelectItem>
                  <SelectItem value="b2">B2</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Swatch>

          <Swatch label="Textarea (with counter)">
            <div className="w-80">
              <Textarea placeholder="Tell us about yourself" maxLength={120} />
            </div>
          </Swatch>

          <Swatch label="Checkbox">
            <Checkbox checked={checked} onCheckedChange={setChecked} label="I agree" />
            <Checkbox checked="indeterminate" onCheckedChange={() => {}} label="Indeterminate" />
            <Checkbox checked={false} onCheckedChange={() => {}} label="Unchecked" disabled />
          </Swatch>

          <Swatch label="Radio">
            <RadioGroup value={radioValue} onValueChange={setRadioValue} className="flex-row gap-4">
              <RadioGroupItem value="a1" label="A1" />
              <RadioGroupItem value="a2" label="A2" />
              <RadioGroupItem value="b1" label="B1" />
            </RadioGroup>
          </Swatch>

          <Swatch label="Switch">
            <Switch checked={switchOn} onCheckedChange={setSwitchOn} label="Email reminders" />
          </Swatch>

          <Swatch label="CodeInput">
            <CodeInput length={6} value={code} onChange={setCode} />
            <CodeInput length={6} value="1234" error />
          </Swatch>

          <Swatch label="ChoiceCard">
            <RadioGroup value={choiceValue} onValueChange={setChoiceValue} className="w-full max-w-md gap-2">
              <ChoiceCard value="a2" marker="A2" title="Elementary" description="I can talk about routine tasks." />
              <ChoiceCard value="b1" marker="B1" title="Intermediate" description="I can handle most travel situations." />
            </RadioGroup>
          </Swatch>

          <Swatch label="FileUpload — state">
            <div className="grid w-full max-w-md gap-3">
              <FileUpload state="empty" meta="PDF or image, up to 10 MB" />
              <FileUpload state="uploading" filename="receipt.png" progress={62} meta="2.4 MB of 3.8 MB" />
              <FileUpload state="success" filename="receipt.png" meta="3.8 MB" />
              <FileUpload
                state="error"
                filename="receipt.png"
                meta="That file is 24 MB. The limit is 10 MB — try a photo instead of a scan."
                onRetry={() => {}}
              />
            </div>
          </Swatch>

          <Swatch label="FilterTrigger">
            <FilterTrigger label="Level" />
            <FilterTrigger label="Level" open={filterOpen} onClick={() => setFilterOpen((v) => !v)} />
            <FilterTrigger label="Level" value="A2, B1" onClear={() => {}} />
            <FilterTrigger label="Status" disabled />
          </Swatch>
        </Section>

        <Section title="C · Learning" id="learning">
          <Swatch label="CourseCard">
            <div className="w-64">
              <CourseCard href="#" title="Business English" level="B2" meta="12 lessons · 3h 40m" progress={45} />
            </div>
          </Swatch>

          <Swatch label="StatTile">
            <StatTile icon={Users} tone="brand" value="128" label="Active students" delta="+6 this month" />
            <StatTile icon={CreditCard} tone="warning" value="3" label="Transfers awaiting approval" href="#" />
            <StatTile icon={Landmark} tone="success" value="$4,820" label="MRR" numeric />
          </Swatch>

          <Swatch label="LessonRow — status">
            <div className="flex w-full max-w-md flex-col gap-1">
              <LessonRow status="complete" title="Greetings and introductions" kind="Video" duration="8 min" href="#" />
              <LessonRow status="current" title="Ordering at a café" kind="Video" duration="11 min" href="#" />
              <LessonRow status="locked" title="Past simple tense" kind="Quiz" duration="6 min" lockedReason="Unlocks after lesson 12" />
            </div>
          </Swatch>

          <Swatch label="CefrLadder">
            <CefrLadder current="B1" />
          </Swatch>

          <Swatch label="QuizOption — answer">
            <div className="flex w-full max-w-md flex-col gap-2">
              <QuizOption answer="default" marker="A">
                I have went to the store.
              </QuizOption>
              <QuizOption answer="selected" marker="B">
                I have gone to the store.
              </QuizOption>
              <QuizOption answer="correct" marker="C">
                I went to the store.
              </QuizOption>
              <QuizOption answer="incorrect" marker="D">
                I go to the store yesterday.
              </QuizOption>
            </div>
          </Swatch>
        </Section>

        <Section title="D · Navigation & feedback" id="navigation">
          <Swatch label="Alert — tone">
            <div className="grid w-full max-w-md gap-2">
              <Alert tone="info" title="Heads up" body="This is inline, inside a card or form." />
              <Alert tone="success" title="Saved" body="Your changes are live." />
              <Alert tone="warning" title="Payment failing" body="3 days of access remaining." />
              <Alert tone="danger" title="Wrong password" body="2 attempts remaining." />
            </div>
          </Swatch>

          <Swatch label="Banner — tone">
            <div className="flex w-full max-w-2xl flex-col gap-2">
              <Banner
                tone="warning"
                title="Your subscription lapsed"
                body="Lessons stay, quizzes are paused."
                action={{ label: "Renew", onClick: () => {} }}
                onDismiss={() => {}}
              />
              <Banner tone="danger" title="Failed to load" body="Cached progress is still shown." action={{ label: "Reload", onClick: () => {} }} />
            </div>
          </Swatch>

          <Swatch label="Modal">
            <Button variant="secondary" onClick={() => setModalOpen(true)}>
              Open neutral modal
            </Button>
            <Button variant="danger" onClick={() => setDangerModalOpen(true)}>
              Open danger modal
            </Button>
            <Modal
              open={modalOpen}
              onOpenChange={setModalOpen}
              tone="neutral"
              title="Save this view?"
              body="You can rename or delete it later."
              cancel={{ label: "Not now", onClick: () => setModalOpen(false) }}
              confirm={{ label: "Save", onClick: () => setModalOpen(false) }}
            />
            <Modal
              open={dangerModalOpen}
              onOpenChange={setDangerModalOpen}
              tone="danger"
              title="Delete this unit?"
              body="Five lessons, one quiz, and nine students' progress will be lost."
              cancel={{ label: "Archive instead", onClick: () => setDangerModalOpen(false) }}
              confirm={{ label: "Delete the unit", onClick: () => setDangerModalOpen(false) }}
            />
          </Swatch>

          <Swatch label="Tabs">
            <Tabs defaultValue="overview" className="w-full max-w-md">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="lessons">Lessons</TabsTrigger>
                <TabsTrigger value="resources">Resources</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="t-body-sm pt-4 text-fg-secondary">
                Overview panel content.
              </TabsContent>
              <TabsContent value="lessons" className="t-body-sm pt-4 text-fg-secondary">
                Lessons panel content.
              </TabsContent>
              <TabsContent value="resources" className="t-body-sm pt-4 text-fg-secondary">
                Resources panel content.
              </TabsContent>
            </Tabs>
          </Swatch>

          <Swatch label="NavItem">
            <div className="flex w-56 flex-col gap-1 rounded-xl border border-stroke-default bg-bg-surface p-2">
              <NavItem href="#" icon={BookOpen} label="My courses" selected />
              <NavItem href="#" icon={Bell} label="Notifications" />
              <NavItem href="#" icon={Settings} label="Settings" />
            </div>
          </Swatch>

          <Swatch label="SiteHeader">
            <div className="w-full overflow-hidden rounded-xl border border-stroke-default">
              <SiteHeader
                className="static"
                locale="en"
                links={[
                  { label: "Courses", href: "#courses" },
                  { label: "Pricing", href: "#pricing" },
                  { label: "Blog", href: "#blog" },
                ]}
              />
            </div>
          </Swatch>

          <Swatch label="EmptyState">
            <div className="w-full max-w-lg rounded-xl border border-stroke-default bg-bg-surface">
              <EmptyState
                icon={Search}
                title="No students match these filters"
                body="Level A2–B1, status Trial — nobody matches yet."
                action={{ label: "Clear filters", onClick: () => {} }}
                secondaryActions={[{ label: "Invite a student", onClick: () => {} }]}
              />
            </div>
          </Swatch>

          <Swatch label="DataTable">
            <div className="w-full overflow-hidden rounded-xl border border-stroke-default">
              <DataTable
                columns={columns}
                data={DEMO_STUDENTS}
                rowSelection={rowSelection}
                onRowSelectionChange={setRowSelection}
                getRowId={(row) => row.id}
              />
            </div>
          </Swatch>

          <Swatch label="Icon meta">
            <div className="flex items-center gap-2 t-body-xs text-fg-tertiary">
              <Mail className="size-4" aria-hidden /> Mail
              <Clock className="size-4" aria-hidden /> Clock
            </div>
          </Swatch>
        </Section>
      </div>
    </div>
  );
}
