"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Field } from "@/components/lisaan/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DEMO_COURSE } from "@/lib/demo-data";

export default function NewCoursePage() {
  const router = useRouter();
  const [title, setTitle] = React.useState("");
  const [level, setLevel] = React.useState("");

  function create(event: React.FormEvent) {
    event.preventDefault();
    // No backend — land on the one demo course's builder as if it were new.
    router.push(`/admin/courses/${DEMO_COURSE.slug}`);
  }

  return (
    <div className="flex max-w-md flex-col gap-6">
      <h1 className="t-h2 text-fg-primary">New course</h1>
      <form onSubmit={create} className="flex flex-col gap-4">
        <Field label="Title">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </Field>
        <Field label="Level">
          <Select value={level} onValueChange={setLevel}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a level" />
            </SelectTrigger>
            <SelectContent>
              {["A1", "A2", "B1", "B2", "C1", "C2"].map((l) => (
                <SelectItem key={l} value={l}>
                  {l}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Button type="submit" disabled={!title || !level}>
          Create draft
        </Button>
      </form>
    </div>
  );
}
