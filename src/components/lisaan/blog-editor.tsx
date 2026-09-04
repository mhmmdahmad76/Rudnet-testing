"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/lisaan/field";
import { Alert } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  findConflictingSlug,
  savePost,
  slugify,
  suggestSlugs,
  useBlogPosts,
  type Post,
} from "@/lib/blog-store";

const CATEGORIES = ["Grammar", "Business", "IELTS/TOEFL", "Culture", "Product updates"];

export interface BlogEditorProps {
  /** Present when editing an existing post; absent when writing a new one. */
  postId?: string;
}

/**
 * Shared by /admin/blog/new and /admin/blog/[id]. Slugs are checked live
 * against the store — a collision blocks publishing and offers three
 * alternatives, per BUILD.md §9.25 BLOG-04.
 */
function BlogEditor({ postId }: BlogEditorProps) {
  const router = useRouter();
  const posts = useBlogPosts();
  const existing = postId ? posts.find((p) => p.id === postId) : undefined;

  const [title, setTitle] = React.useState(existing?.title ?? "");
  const [slug, setSlug] = React.useState(existing?.slug ?? "");
  const [slugTouched, setSlugTouched] = React.useState(Boolean(existing));
  const [category, setCategory] = React.useState(existing?.category ?? CATEGORIES[0]!);
  const [body, setBody] = React.useState(existing?.body ?? "");

  // Keep the slug in sync with the title until the author edits it directly.
  // Adjusted during render (not an effect) per React's guidance for deriving
  // state from a prop/state change — see filter-popover.tsx for the same pattern.
  const [prevTitle, setPrevTitle] = React.useState(title);
  if (title !== prevTitle) {
    setPrevTitle(title);
    if (!slugTouched) setSlug(slugify(title));
  }

  const conflict = slug ? findConflictingSlug(slug, postId) : undefined;
  const suggestions = conflict ? suggestSlugs(slugify(title) || slug, postId) : [];

  function persist(status: Post["status"]) {
    const post: Post = {
      id: existing?.id ?? `p${Date.now()}`,
      title: title.trim() || "Untitled post",
      slug,
      status,
      category,
      body,
      views: existing?.views ?? 0,
      updatedAt: new Date().toISOString().slice(0, 10),
      inboundLinks: existing?.inboundLinks ?? 0,
    };
    savePost(post);
    toast.success(status === "published" ? "Post published" : "Draft saved");
    router.push("/admin/pricing");
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <h1 className="t-h2 text-fg-primary">{existing ? "Edit post" : "Write a post"}</h1>

      <Field label="Title">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Post title" />
      </Field>

      <Field
        label="Slug"
        help={conflict ? undefined : "lisaan.app/blog/" + (slug || "…")}
        error={conflict ? `“${conflict.title}” already uses this slug` : undefined}
      >
        <Input
          value={slug}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(slugify(e.target.value));
          }}
        />
      </Field>

      {conflict && (
        <Alert
          tone="warning"
          title={`This slug belongs to “${conflict.title}”`}
          body={`That post has ${conflict.views.toLocaleString()} views and ${conflict.inboundLinks} inbound link${conflict.inboundLinks === 1 ? "" : "s"}. Publishing is disabled until the slug is unique.`}
        >
          <div className="mt-3 flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <Button
                key={s}
                size="sm"
                variant="secondary"
                onClick={() => {
                  setSlugTouched(true);
                  setSlug(s);
                }}
              >
                Use “{s}”
              </Button>
            ))}
          </div>
        </Alert>
      )}

      <Field label="Category">
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field label="Body">
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={10}
          placeholder="Write the post…"
        />
      </Field>

      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={() => router.push("/admin/pricing")}>
          Cancel
        </Button>
        <Button variant="secondary" onClick={() => persist("draft")} disabled={!title.trim()}>
          Save draft
        </Button>
        <Button onClick={() => persist("published")} disabled={!title.trim() || Boolean(conflict)}>
          Publish
        </Button>
      </div>
    </div>
  );
}

export { BlogEditor };
