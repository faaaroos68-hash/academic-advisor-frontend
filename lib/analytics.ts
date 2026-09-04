import type { HistoryEntry } from "@/lib/types";

// Single source of truth for client-side academic computations shared by the
// dashboard and analytics pages. Everything here derives strictly from real
// course-history records returned by GET /api/student/course-history.

export const GRADE_POINTS: Record<string, number> = {
  "A+": 4.0,
  "A": 4.0,
  "A-": 3.7,
  "B+": 3.3,
  "B": 3.0,
  "B-": 2.7,
  "C+": 2.3,
  "C": 2.0,
  "C-": 1.7,
  "D+": 1.3,
  "D": 1.0,
  "F": 0.0,
};

const SEASON_ORDER: Record<string, number> = {
  spring: 0,
  summer: 1,
  fall: 2,
};

function termSortKey(term: string): [number, number] {
  const year = parseInt(term.match(/(\d{4})/)?.[1] ?? "9999", 10);
  const season = term.trim().toLowerCase().split(/\s+/)[0];
  return [year, SEASON_ORDER[season] ?? 9];
}

export interface TermGpaPoint {
  term: string;
  gpa: number;
}

/** Real per-term weighted GPA, chronologically ordered. */
export function computeTermGpaTrend(entries: HistoryEntry[]): TermGpaPoint[] {
  const byTerm = new Map<string, { pts: number; hrs: number }>();
  for (const e of entries) {
    const term = (e.semester_taken || "").trim();
    if (!term || !(e.grade in GRADE_POINTS)) continue;
    const hrs = e.credit_hours ?? 0;
    const cur = byTerm.get(term) ?? { pts: 0, hrs: 0 };
    cur.pts += GRADE_POINTS[e.grade] * hrs;
    cur.hrs += hrs;
    byTerm.set(term, cur);
  }
  return Array.from(byTerm.entries())
    .map(([term, v]) => ({ term, gpa: v.hrs ? v.pts / v.hrs : 0 }))
    .sort((a, b) => {
      const [ya, sa] = termSortKey(a.term);
      const [yb, sb] = termSortKey(b.term);
      return ya !== yb ? ya - yb : sa - sb;
    });
}

export interface GradeCount {
  grade: string;
  count: number;
}

/** Count of each earned grade across all graded history entries. */
export function computeGradeDistribution(entries: HistoryEntry[]): GradeCount[] {
  const counts = new Map<string, number>();
  for (const e of entries) {
    if (!(e.grade in GRADE_POINTS)) continue;
    counts.set(e.grade, (counts.get(e.grade) ?? 0) + 1);
  }
  return Object.keys(GRADE_POINTS).map((grade) => ({
    grade,
    count: counts.get(grade) ?? 0,
  }));
}

export interface TermHoursPoint {
  term: string;
  hours: number;
  cumulative: number;
}

/** Credit hours attempted per term (chronological) plus a running total. */
export function computeTermHours(entries: HistoryEntry[]): TermHoursPoint[] {
  const byTerm = new Map<string, number>();
  for (const e of entries) {
    const term = (e.semester_taken || "").trim();
    if (!term) continue;
    byTerm.set(term, (byTerm.get(term) ?? 0) + (e.credit_hours ?? 0));
  }
  let cumulative = 0;
  return Array.from(byTerm.entries())
    .sort((a, b) => {
      const [ya, sa] = termSortKey(a[0]);
      const [yb, sb] = termSortKey(b[0]);
      return ya !== yb ? ya - yb : sa - sb;
    })
    .map(([term, hours]) => {
      cumulative += hours;
      return { term, hours, cumulative };
    });
}
