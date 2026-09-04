"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/lisaan/field";
import { RadioGroup } from "@/components/ui/radio-group";
import { ChoiceCard } from "@/components/lisaan/choice-card";
import { Alert } from "@/components/ui/alert";
import { Modal } from "@/components/lisaan/modal";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface PriceRow {
  region: string;
  monthly: number;
  annual: number;
  vat: number;
  subscribers: number;
}

interface Post {
  id: string;
  title: string;
  status: "draft" | "scheduled" | "published" | "archived";
  category: string;
  views: number;
  updatedAt: string;
  inboundLinks: number;
}

const STATUS_TONE = {
  draft: "neutral",
  scheduled: "warning",
  published: "success",
  archived: "neutral",
} as const;

export default function AdminPricingPage() {
  const [prices, setPrices] = React.useState<PriceRow[]>([
    { region: "United Arab Emirates", monthly: 39, annual: 390, vat: 5, subscribers: 6 },
    { region: "Saudi Arabia", monthly: 39, annual: 390, vat: 15, subscribers: 3 },
    { region: "Rest of Gulf", monthly: 35, annual: 350, vat: 0, subscribers: 0 },
  ]);
  const [posts, setPosts] = React.useState<Post[]>([
    {
      id: "p1",
      title: "Why “since” and “for” trip up every Arabic speaker",
      status: "published",
      category: "Grammar",
      views: 1240,
      updatedAt: "2025-08-02",
      inboundLinks: 4,
    },
    {
      id: "p2",
      title: "The five phrases that unlock most business calls",
      status: "draft",
      category: "Business",
      views: 0,
      updatedAt: "2025-08-20",
      inboundLinks: 0,
    },
  ]);

  const [editRegion, setEditRegion] = React.useState<PriceRow | null>(null);
  const [draftPrice, setDraftPrice] = React.useState({ monthly: 0, annual: 0, vat: 0 });
  const [migrationChoice, setMigrationChoice] = React.useState<"grandfather" | "migrate">("grandfather");
  const [migrationOpen, setMigrationOpen] = React.useState(false);

  const [discountCode, setDiscountCode] = React.useState("");
  const [discountRegions, setDiscountRegions] = React.useState<string[]>([]);
  const [discountConflict, setDiscountConflict] = React.useState(false);

  const [unpublishTarget, setUnpublishTarget] = React.useState<Post | null>(null);

  function openEdit(row: PriceRow) {
    setEditRegion(row);
    setDraftPrice({ monthly: row.monthly, annual: row.annual, vat: row.vat });
  }

  function savePrice() {
    if (!editRegion) return;
    if (editRegion.subscribers > 0 && draftPrice.monthly !== editRegion.monthly) {
      setMigrationOpen(true);
      return;
    }
    setPrices((current) =>
      current.map((r) => (r.region === editRegion.region ? { ...r, ...draftPrice } : r)),
    );
    setEditRegion(null);
    toast.success("Price updated");
  }

  function confirmMigration() {
    if (!editRegion) return;
    setPrices((current) =>
      current.map((r) => (r.region === editRegion.region ? { ...r, ...draftPrice } : r)),
    );
    toast.success(
      migrationChoice === "grandfather"
        ? `${editRegion.subscribers} existing subscribers kept their old price`
        : "Existing subscribers will migrate at their next renewal, with 30 days' notice",
    );
    setMigrationOpen(false);
    setEditRegion(null);
  }

  function checkDiscount() {
    // UAE already carries a 20% launch discount — a new one there would be invisible.
    if (discountRegions.includes("United Arab Emirates")) {
      setDiscountConflict(true);
      return;
    }
    toast.success(`Discount ${discountCode || "code"} created`);
    setDiscountCode("");
    setDiscountRegions([]);
  }

  function unpublish(post: Post) {
    setPosts((current) =>
      current.map((p) => (p.id === post.id ? { ...p, status: "archived" as const } : p)),
    );
    setUnpublishTarget(null);
    toast.success(`"${post.title}" unpublished`);
  }

  return (
    <div className="flex flex-col gap-8">
      <h1 className="t-h2 text-fg-primary">Pricing & blog</h1>

      <section className="rounded-2xl border border-stroke-default bg-bg-surface">
        <div className="flex items-center justify-between border-b border-stroke-subtle p-4">
          <p className="t-h5 text-fg-primary">Regional pricing</p>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="secondary" size="sm" icon={<Plus />}>
                Add discount
              </Button>
            </SheetTrigger>
            <SheetContent side="end">
              <SheetTitle>Add discount</SheetTitle>
              <SheetDescription>Percentage discounts never stack — the larger one wins.</SheetDescription>
              <div className="mt-6 flex flex-col gap-4">
                <Field label="Code">
                  <Input
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                    placeholder="WELCOME10"
                  />
                </Field>
                <div className="flex flex-col gap-2">
                  <p className="t-label-md text-fg-primary">Regions</p>
                  {prices.map((row) => (
                    <label key={row.region} className="flex items-center gap-2 t-body-sm text-fg-secondary">
                      <input
                        type="checkbox"
                        checked={discountRegions.includes(row.region)}
                        onChange={(e) =>
                          setDiscountRegions((current) =>
                            e.target.checked
                              ? [...current, row.region]
                              : current.filter((r) => r !== row.region),
                          )
                        }
                      />
                      {row.region}
                    </label>
                  ))}
                </div>
                {discountConflict && (
                  <Alert
                    tone="warning"
                    title="This code would be invisible in the UAE"
                    body="United Arab Emirates already has LAUNCH20 (20% off) active. Percentage discounts never stack — the larger one always wins, so your new code would never actually apply there."
                  >
                    <div className="mt-3 flex flex-col gap-2">
                      <Button size="sm" variant="secondary" onClick={() => setDiscountRegions((r) => r.filter((x) => x !== "United Arab Emirates"))}>
                        Remove UAE from this code
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => toast("LAUNCH20 ended in the UAE")}>
                        End LAUNCH20 in the UAE instead
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setDiscountConflict(false)}>
                        Create it anyway (it just won&rsquo;t apply there)
                      </Button>
                    </div>
                  </Alert>
                )}
                <Button onClick={checkDiscount} disabled={!discountCode || discountRegions.length === 0}>
                  Create discount
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Region</TableHead>
              <TableHead>Monthly</TableHead>
              <TableHead>Annual</TableHead>
              <TableHead>VAT</TableHead>
              <TableHead>Subscribers</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {prices.map((row) => (
              <TableRow key={row.region}>
                <TableCell className="t-body-sm-strong">{row.region}</TableCell>
                <TableCell className="t-numeric-md">${row.monthly}</TableCell>
                <TableCell className="t-numeric-md">${row.annual}</TableCell>
                <TableCell className="t-numeric-md">{row.vat}%</TableCell>
                <TableCell className="t-numeric-md">{row.subscribers}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" onClick={() => openEdit(row)}>
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>

      <section className="rounded-2xl border border-stroke-default bg-bg-surface">
        <div className="flex items-center justify-between border-b border-stroke-subtle p-4">
          <p className="t-h5 text-fg-primary">Blog</p>
          <Button size="sm" icon={<Plus />} onClick={() => toast("Opening the post editor…")}>
            Write a post
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Views</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.map((post) => (
              <TableRow key={post.id}>
                <TableCell className="t-body-sm-strong">{post.title}</TableCell>
                <TableCell>
                  <Badge tone={STATUS_TONE[post.status]}>{post.status}</Badge>
                </TableCell>
                <TableCell className="t-body-sm">{post.category}</TableCell>
                <TableCell className="t-numeric-md">{post.views}</TableCell>
                <TableCell className="t-numeric-md">{post.updatedAt}</TableCell>
                <TableCell>
                  {post.status === "published" && (
                    <Button variant="ghost" size="sm" onClick={() => setUnpublishTarget(post)}>
                      Unpublish
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>

      <Sheet open={Boolean(editRegion)} onOpenChange={(open) => !open && setEditRegion(null)}>
        <SheetContent side="end">
          <SheetTitle>Edit pricing — {editRegion?.region}</SheetTitle>
          <SheetDescription>{editRegion?.subscribers ?? 0} subscribers currently on this price.</SheetDescription>
          <div className="mt-6 flex flex-col gap-4">
            <Field label="Monthly">
              <Input
                type="number"
                value={draftPrice.monthly}
                onChange={(e) => setDraftPrice((d) => ({ ...d, monthly: Number(e.target.value) }))}
              />
            </Field>
            <Field label="Annual">
              <Input
                type="number"
                value={draftPrice.annual}
                onChange={(e) => setDraftPrice((d) => ({ ...d, annual: Number(e.target.value) }))}
              />
            </Field>
            <Field label="VAT (%)">
              <Input
                type="number"
                value={draftPrice.vat}
                onChange={(e) => setDraftPrice((d) => ({ ...d, vat: Number(e.target.value) }))}
              />
            </Field>
            <Button onClick={savePrice}>Save</Button>
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={migrationOpen} onOpenChange={setMigrationOpen}>
        <DialogContent showClose={false}>
          <DialogTitle>{editRegion?.subscribers} existing subscribers are on the old price</DialogTitle>
          <DialogDescription>Choose what happens to them.</DialogDescription>
          <RadioGroup
            value={migrationChoice}
            onValueChange={(v) => setMigrationChoice(v as typeof migrationChoice)}
            className="mt-4 gap-2"
          >
            <ChoiceCard
              value="grandfather"
              marker="A"
              title="Grandfather existing subscribers"
              description={`Keep all ${editRegion?.subscribers} at their current price indefinitely.`}
            />
            <ChoiceCard
              value="migrate"
              marker="B"
              title="Migrate at next renewal"
              description="Requires 30 days' notice to each subscriber before their price changes — this is written to the audit log."
            />
          </RadioGroup>
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setMigrationOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmMigration}>Confirm</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Modal
        open={Boolean(unpublishTarget)}
        onOpenChange={(open) => !open && setUnpublishTarget(null)}
        tone="danger"
        title={`This post has ${unpublishTarget?.inboundLinks ?? 0} inbound links`}
        body="Unpublishing without a plan turns those links into 404s. Redirecting or archiving keeps them working."
        cancel={{ label: "Redirect instead", onClick: () => unpublishTarget && unpublish(unpublishTarget) }}
        confirm={{
          label: "Unpublish anyway",
          onClick: () => unpublishTarget && unpublish(unpublishTarget),
        }}
      />
    </div>
  );
}
