"use client";

import { useCallback, useEffect, useState } from "react";
import PageShell from "@/components/PageShell";
import { get } from "@/lib/api";
import type { AvailableCourse } from "@/lib/types";
import { dirFor } from "@/lib/rtl";

export default function CoursesPage() {
  const [courses, setCourses] = useState<AvailableCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setCourses(await get<AvailableCourse[]>("/api/student/available-courses"));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load courses");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const eligible = courses.filter((c) => c.eligible);
  const ineligible = courses.filter((c) => !c.eligible);
  const eligibleHours = eligible.reduce((s, c) => s + c.credit_hours, 0);

  return (
    <PageShell>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-heading">
            Course Registration
          </h1>
          <p className="text-sm text-caption">
            View available courses and prerequisites
          </p>
        </div>
        <button
          onClick={load}
          className="secondary-btn"
        >
          Refresh
        </button>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-sm text-caption">
          <div className="h-4 w-4 animate-pulse rounded-full bg-[#75d7cc]" />
          Loading courses…
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="glass-card">
              <div className="mb-1 flex items-center gap-2">
                <span className="status-dot green" />
                <p className="text-xs font-medium uppercase tracking-wide text-caption">
                  Eligible now
                </p>
              </div>
              <p className="font-[family-name:var(--font-heading)] text-2xl font-bold text-success">
                {eligible.length}
              </p>
            </div>
            <div className="glass-card">
              <div className="mb-1 flex items-center gap-2">
                <span className="status-dot amber" />
                <p className="text-xs font-medium uppercase tracking-wide text-caption">
                  Blocked by prerequisites
                </p>
              </div>
              <p className="font-[family-name:var(--font-heading)] text-2xl font-bold text-warning">
                {ineligible.length}
              </p>
            </div>
            <div className="glass-card">
              <div className="mb-1 flex items-center gap-2">
                <span className="status-dot teal" />
                <p className="text-xs font-medium uppercase tracking-wide text-caption">
                  Eligible hours
                </p>
              </div>
              <p className="font-[family-name:var(--font-heading)] text-2xl font-bold text-heading">
                {eligibleHours}
              </p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <section>
              <h2 className="mb-3 text-sm font-semibold text-heading">
                Available to take
              </h2>
              <div className="space-y-2">
                {eligible.length === 0 && (
                  <p className="text-sm text-caption">No courses available yet.</p>
                )}
                {eligible.map((c) => (
                  <CourseCard key={c.code} course={c} variant="eligible" />
                ))}
              </div>
            </section>

            <section>
              <h2 className="mb-3 text-sm font-semibold text-heading">
                Blocked by prerequisites
              </h2>
              <div className="space-y-2">
                {ineligible.length === 0 && (
                  <p className="text-sm text-caption">
                    Nothing blocked — every course is available.
                  </p>
                )}
                {ineligible.map((c) => (
                  <CourseCard key={c.code} course={c} variant="blocked" />
                ))}
              </div>
            </section>
          </div>
        </>
      )}
    </PageShell>
  );
}

function CourseCard({
  course,
  variant,
}: {
  course: AvailableCourse;
  variant: "eligible" | "blocked";
}) {
  return (
    <div className={`glass-card !p-3 ${variant === "blocked" ? "opacity-80" : ""}`}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className={`rounded-lg px-2 py-0.5 text-xs font-bold ${
              variant === "eligible"
                ? "bg-success/10 text-success"
                : "bg-white/5 text-caption"
            }`}
          >
            {course.code}
          </span>
          <span dir={dirFor(course.name)} className="text-sm font-medium text-heading">
            {course.name}
          </span>
        </div>
        <span className="text-xs text-caption">{course.credit_hours}h</span>
      </div>
      {variant === "blocked" && (
        <div className="mt-2">
          <p className="text-xs font-medium text-warning">Missing prerequisites:</p>
          <div className="mt-1 flex flex-wrap gap-1">
            {course.missing_prerequisites.map((m) => (
              <span
                key={m}
                className="rounded-full border border-warning/20 bg-warning/10 px-2 py-0.5 text-xs text-warning"
              >
                {m}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
