"use client";

import * as React from "react";

import type { SavedFilterCriteria } from "@/lib/use-student-filters";

// Demo/mock backend: saved views live in localStorage, standing in for a
// real "saved views" table. See lib/onboarding-store.ts for the same pattern.

const KEY = "lisaan-admin-saved-views";

export interface SavedView {
  id: string;
  name: string;
  criteria: SavedFilterCriteria;
}

const EMPTY: SavedView[] = [];
const listeners = new Set<() => void>();
let cache: SavedView[] | null = null;

function read(): SavedView[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as SavedView[];
  } catch {
    return [];
  }
}

function write(views: SavedView[]) {
  cache = views;
  if (typeof window !== "undefined") {
    localStorage.setItem(KEY, JSON.stringify(views));
  }
  listeners.forEach((listener) => listener());
}

function getSnapshot(): SavedView[] {
  if (cache === null) cache = read();
  return cache;
}

function getServerSnapshot(): SavedView[] {
  return EMPTY;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useSavedViews(): SavedView[] {
  return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function saveView(name: string, criteria: SavedFilterCriteria) {
  const view: SavedView = { id: `view-${Date.now()}`, name, criteria };
  write([...getSnapshot(), view]);
  return view;
}

export function deleteView(id: string) {
  write(getSnapshot().filter((v) => v.id !== id));
}
