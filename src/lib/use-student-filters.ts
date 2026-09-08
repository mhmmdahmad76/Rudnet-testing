"use client";

import { parseAsArrayOf, parseAsInteger, parseAsString, parseAsStringEnum, useQueryStates } from "nuqs";

export type SortKey = "newest" | "name" | "progress" | "level";
export const SORT_KEYS: SortKey[] = ["newest", "name", "progress", "level"];

export type DatePreset = "30d" | "90d" | "year" | "custom";

/** Independent, non-exclusive tags a real student can carry — replaces the
 * old fake active/trial/pending/lapsed status, which didn't correspond to
 * any real column. */
export const STUDENT_TAGS = ["premium", "free", "suspended", "unverified"] as const;
export type StudentTag = (typeof STUDENT_TAGS)[number];

export const PAYMENT_TAGS = ["pending_transfer"] as const;
export type PaymentTag = (typeof PAYMENT_TAGS)[number];

/** A real student row, as returned by lib/admin-students.ts. Kept here
 * (not in the server-only DAL module) so client components can import the
 * type without pulling in the database driver. */
export interface AdminStudent {
  id: number;
  name: string;
  email: string;
  level: string | null;
  planStatus: "free" | "premium";
  planId: "monthly" | "annual" | null;
  suspended: boolean;
  emailVerified: boolean;
  createdAt: string; // ISO yyyy-mm-dd
  progressPct: number;
  pendingTransfer: boolean;
}

/**
 * Every filter/sort/column field the students table exposes, kept in the URL
 * via nuqs. A filtered view is shareable and survives a refresh — the table
 * previously held all of this in plain useState, which lost it on reload.
 */
export const studentFilterParsers = {
  q: parseAsString.withDefault(""),
  level: parseAsArrayOf(parseAsString).withDefault([]),
  status: parseAsArrayOf(parseAsString).withDefault([]),
  sort: parseAsStringEnum<SortKey>(SORT_KEYS).withDefault("newest"),
  hideCols: parseAsArrayOf(parseAsString).withDefault([]),
  minProgress: parseAsInteger,
  maxProgress: parseAsInteger,
  dateFrom: parseAsString,
  dateTo: parseAsString,
  datePreset: parseAsStringEnum<DatePreset>(["30d", "90d", "year", "custom"]),
  payment: parseAsArrayOf(parseAsString).withDefault([]),
};

export function useStudentFilters() {
  return useQueryStates(studentFilterParsers, { history: "replace" });
}

export type StudentFilterState = ReturnType<typeof useStudentFilters>[0];

/** The subset that makes up a "view" — excludes q, sort and hideCols, which
 * describe the current look at the table rather than which students match. */
export type SavedFilterCriteria = Pick<
  StudentFilterState,
  "level" | "status" | "minProgress" | "maxProgress" | "dateFrom" | "dateTo" | "datePreset" | "payment"
>;

export function extractCriteria(state: StudentFilterState): SavedFilterCriteria {
  const { level, status, minProgress, maxProgress, dateFrom, dateTo, datePreset, payment } = state;
  return { level, status, minProgress, maxProgress, dateFrom, dateTo, datePreset, payment };
}

export function hasAnyCriteria(criteria: SavedFilterCriteria): boolean {
  return (
    criteria.level.length > 0 ||
    criteria.status.length > 0 ||
    criteria.minProgress !== null ||
    criteria.maxProgress !== null ||
    criteria.dateFrom !== null ||
    criteria.dateTo !== null ||
    criteria.payment.length > 0
  );
}

export function emptyCriteria(): SavedFilterCriteria {
  return {
    level: [],
    status: [],
    minProgress: null,
    maxProgress: null,
    dateFrom: null,
    dateTo: null,
    datePreset: null,
    payment: [],
  };
}

export function hasTag(student: AdminStudent, tag: string): boolean {
  switch (tag as StudentTag) {
    case "premium":
      return student.planStatus === "premium";
    case "free":
      return student.planStatus === "free";
    case "suspended":
      return student.suspended;
    case "unverified":
      return !student.emailVerified;
    default:
      return false;
  }
}

export function matchesCriteria(student: AdminStudent, criteria: SavedFilterCriteria): boolean {
  if (criteria.level.length > 0 && !(student.level && criteria.level.includes(student.level))) return false;
  if (criteria.status.length > 0 && !criteria.status.some((tag) => hasTag(student, tag))) return false;
  if (criteria.minProgress !== null && student.progressPct < criteria.minProgress) return false;
  if (criteria.maxProgress !== null && student.progressPct > criteria.maxProgress) return false;
  if (criteria.dateFrom !== null && student.createdAt < criteria.dateFrom) return false;
  if (criteria.dateTo !== null && student.createdAt > criteria.dateTo) return false;
  if (criteria.payment.length > 0 && !(criteria.payment.includes("pending_transfer") && student.pendingTransfer)) {
    return false;
  }
  return true;
}

/** ISO yyyy-mm-dd for `daysAgo` days before today, in local time. */
export function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

export function isoStartOfYear(): string {
  return `${new Date().getFullYear()}-01-01`;
}

export function isoToday(): string {
  return new Date().toISOString().slice(0, 10);
}
