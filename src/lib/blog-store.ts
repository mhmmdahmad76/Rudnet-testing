"use client";

import * as React from "react";

// Demo/mock backend: posts live in localStorage, seeded from DEMO_POSTS —
// standing in for a real posts table. See lib/onboarding-store.ts for the
// same pattern.

const KEY = "lisaan-demo-blog-posts";

export interface Post {
  id: string;
  title: string;
  slug: string;
  status: "draft" | "scheduled" | "published" | "archived";
  category: string;
  body: string;
  views: number;
  updatedAt: string;
  inboundLinks: number;
  /** How the last unpublish was resolved — for display only. */
  unpublishResolution?: "redirect" | "archive" | "unpublish";
}

export const DEMO_POSTS: Post[] = [
  {
    id: "p1",
    title: "Why “since” and “for” trip up every Arabic speaker",
    slug: "since-vs-for",
    status: "published",
    category: "Grammar",
    body: "Arabic doesn't mark this distinction the way English does, so it's the single most common tense mistake we see in essays...",
    views: 1240,
    updatedAt: "2025-08-02",
    inboundLinks: 4,
  },
  {
    id: "p2",
    title: "The five phrases that unlock most business calls",
    slug: "five-phrases-business-calls",
    status: "draft",
    category: "Business",
    body: "",
    views: 0,
    updatedAt: "2025-08-20",
    inboundLinks: 0,
  },
];

const listeners = new Set<() => void>();
let cache: Post[] | null = null;

function read(): Post[] {
  if (typeof window === "undefined") return DEMO_POSTS;
  const raw = localStorage.getItem(KEY);
  if (!raw) return DEMO_POSTS;
  try {
    return JSON.parse(raw) as Post[];
  } catch {
    return DEMO_POSTS;
  }
}

function write(posts: Post[]) {
  cache = posts;
  if (typeof window !== "undefined") {
    localStorage.setItem(KEY, JSON.stringify(posts));
  }
  listeners.forEach((listener) => listener());
}

function getSnapshot(): Post[] {
  if (cache === null) cache = read();
  return cache;
}

function getServerSnapshot(): Post[] {
  return DEMO_POSTS;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useBlogPosts(): Post[] {
  return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function getPostById(id: string): Post | undefined {
  return getSnapshot().find((p) => p.id === id);
}

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function findConflictingSlug(slug: string, excludeId?: string): Post | undefined {
  return getSnapshot().find((p) => p.slug === slug && p.id !== excludeId);
}

export function suggestSlugs(base: string, excludeId?: string): string[] {
  const suggestions: string[] = [];
  let n = 2;
  while (suggestions.length < 3 && n < 20) {
    const candidate = `${base}-${n}`;
    if (!findConflictingSlug(candidate, excludeId)) suggestions.push(candidate);
    n++;
  }
  return suggestions;
}

export function savePost(post: Post) {
  const current = getSnapshot();
  const exists = current.some((p) => p.id === post.id);
  const next = exists ? current.map((p) => (p.id === post.id ? post : p)) : [post, ...current];
  write(next);
}

export function updatePost(id: string, patch: Partial<Post>) {
  write(getSnapshot().map((p) => (p.id === id ? { ...p, ...patch } : p)));
}
