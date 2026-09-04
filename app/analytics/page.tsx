"use client";

import { useEffect, useState } from "react";
import PageShell from "@/components/PageShell";
import { get } from "@/lib/api";
import type { HistoryEntry, Student } from "@/lib/types";
import {
  computeGradeDistribution,
  computeTermHours,
} from "@/lib/analytics";

const TOTAL_REQUIRED_HOURS = 142;

export default function AnalyticsPage() {
  const [profile, setProfile] = useState<Student | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      get<{ student: Student }>("/api/me").then((d) => d.student),
      get<HistoryEntry[]>("/api/student/course-history"),
    ])
      .then(([student, courseHistory]) => {
        setProfile(student);
        setHistory(courseHistory);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <PageShell>
        <div className="flex items-center gap-2 text-sm text-on-surface-variant">
          <div className="h-4 w-4 animate-pulse rounded-full bg-primary" />
          Loading your analytics…
        </div>
      </PageShell>
    );
  }

  if (error) {
    return (
      <PageShell>
        <div className="mb-4 rounded-xl border border-error/20 bg-error/10 px-4 py-3 text-sm text-error">
          {error}
        </div>
      </PageShell>
    );
  }

  const gradeDist = computeGradeDistribution(history);
  const termHours = computeTermHours(history);
  const maxGradeCount = Math.max(...gradeDist.map((g) => g.count), 1);
  const maxTermHours = Math.max(...termHours.map((t) => t.hours), 1);
  const finalCumulative = termHours.length
    ? termHours[termHours.length - 1].cumulative
    : 0;

  if (history.length === 0) {
    return (
      <PageShell>
        <div className="page-content">
          <header className="mb-8">
            <h2 className="font-[family-name:var(--font-heading)] text-display-lg-mobile md:text-display-lg text-on-background mb-2">
              Performance Analytics
            </h2>
            <p className="text-body-lg text-on-surface-variant max-w-2xl">
              Insights from your completed coursework.
            </p>
          </header>
          <div className="app-card rounded-xl p-12 text-center">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant/60 mb-4">
              monitoring
            </span>
            <p className="text-headline-md font-[family-name:var(--font-heading)] text-on-surface mb-2">
              Your analytics will build up as you complete courses
            </p>
            <p className="text-body-md text-on-surface-variant max-w-md mx-auto">
              Add graded courses in the Transcript tab (or upload a transcript
              image) and your grade distribution, workload, and credit
              progression will appear here.
            </p>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="page-content">
        <header className="mb-8">
          <h2 className="font-[family-name:var(--font-heading)] text-display-lg-mobile md:text-display-lg text-on-background mb-2">
            Performance Analytics
          </h2>
          <p className="text-body-lg text-on-surface-variant max-w-2xl">
            {history.length} graded course{history.length === 1 ? "" : "s"} ·{" "}
            {finalCumulative} credit hours across {termHours.length} term
            {termHours.length === 1 ? "" : "s"} · CGPA{" "}
            {(profile?.gpa ?? 0).toFixed(2)}
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="app-card rounded-xl p-6 lg:col-span-8 flex flex-col">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="font-[family-name:var(--font-heading)] text-headline-md text-on-background">
                  Grade Distribution
                </h3>
                <p className="text-body-md text-on-surface-variant">
                  Count of each earned grade across your completed courses.
                </p>
              </div>
              <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-lg">
                pie_chart
              </span>
            </div>
            <div className="flex-1 min-h-[250px] flex items-end justify-between gap-2 border-b border-outline-variant pb-2 px-1">
              {gradeDist.map(({ grade, count }) => (
                <div key={grade} className="flex flex-col items-center flex-1 group min-w-0">
                  <span className="text-xs text-on-surface-variant mb-1">{count}</span>
                  <div
                    className={`w-full max-w-[40px] rounded-t-sm relative transition-all duration-300 ${
                      count > 0 ? "bg-primary" : "bg-surface-container"
                    }`}
                    style={{ height: `${Math.max((count / maxGradeCount) * 180, 4)}px` }}
                    title={`${count} course${count === 1 ? "" : "s"}`}
                  />
                  <span className="text-xs text-on-surface-variant mt-2" style={{ fontFamily: "var(--font-mono)" }}>
                    {grade}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[11px] text-on-surface-variant/70">
              Counts from your {history.length} recorded course entr{history.length === 1 ? "y" : "ies"}.
            </p>
          </div>

          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="app-card rounded-xl p-6 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-[family-name:var(--font-heading)] text-headline-md text-on-background text-lg">
                  Workload per Term
                </h3>
                <span className="material-symbols-outlined text-secondary text-sm">bar_chart</span>
              </div>
              <div className="flex-1 flex flex-col justify-end gap-2">
                {termHours.map(({ term, hours }) => (
                  <div key={term} className="flex items-center gap-2 min-w-0">
                    <span className="text-[11px] text-on-surface-variant w-16 shrink-0 truncate" title={term}>
                      {term}
                    </span>
                    <div className="flex-1 h-3 rounded-full bg-surface-container overflow-hidden">
                      <div
                        className="h-full rounded-full bg-secondary transition-all duration-500"
                        style={{ width: `${(hours / maxTermHours) * 100}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-on-surface-variant w-8 rtl:text-left text-right shrink-0">{hours}h</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="app-card rounded-xl p-6 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-[family-name:var(--font-heading)] text-headline-md text-on-background text-lg">
                  Credits Over Time
                </h3>
                <span className="material-symbols-outlined text-primary text-sm">trending_up</span>
              </div>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="stat-value">{finalCumulative}</span>
                <span className="stat-label">/ {TOTAL_REQUIRED_HOURS} hrs</span>
              </div>
              <div className="h-2 w-full rounded-full bg-surface-container overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{
                    width: `${Math.min(
                      (finalCumulative / TOTAL_REQUIRED_HOURS) * 100,
                      100
                    )}%`,
                  }}
                />
              </div>
              <ul className="mt-3 space-y-1 text-[11px] text-on-surface-variant">
                {termHours.map(({ term, cumulative }) => (
                  <li key={term} className="flex justify-between gap-2">
                    <span className="truncate">{term}</span>
                    <span style={{ fontFamily: "var(--font-mono)" }}>{cumulative}h total</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
