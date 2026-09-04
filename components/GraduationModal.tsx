"use client";

import { useCallback, useEffect, useState } from "react";
import { get } from "@/lib/api";
import type { GraduationPlan } from "@/lib/types";

const TERMINATION_LABELS: Record<string, string> = {
  requirement_reached: "Graduation requirements reached",
  term_cap_reached: "Reached the maximum number of planned terms",
  no_more_courses: "No further courses can be scheduled",
};

export default function GraduationModal({
  onClose,
}: {
  onClose: () => void;
}) {
  const [plan, setPlan] = useState<GraduationPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    get<GraduationPlan>("/api/student/graduation-plan")
      .then(setPlan)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Graduation plan"
    >
      <div
        className="bg-surface rounded-xl p-6 my-8 w-full max-w-4xl border border-outline-variant shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-[family-name:var(--font-heading)] text-[24px] font-medium text-on-surface">
            Graduation Plan
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
            aria-label="Close"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {loading && (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-on-surface-variant">
            <div className="h-4 w-4 animate-pulse rounded-full bg-primary" />
            Loading your plan…
          </div>
        )}

        {error && !loading && (
          <div className="py-10 text-center">
            <p className="text-sm text-error">{error}</p>
            <button
              onClick={load}
              className="primary-gradient-btn mt-4"
            >
              Try again
            </button>
          </div>
        )}

        {plan && !loading && (
          <>
            {plan.total_terms === 0 ? (
              <div className="rounded-xl border border-warning/20 bg-warning/10 p-8 text-center">
                <p className="text-lg font-medium text-warning">
                  Add your completed courses first
                </p>
                <p className="mt-2 text-sm text-on-surface-variant">
                  Your graduation plan needs your course history to be built.
                  Head to the{" "}
                  <span className="font-semibold text-on-surface">Transcript</span> tab and add
                  your completed courses (or upload a transcript image), then
                  come back to see your plan.
                </p>
              </div>
            ) : (
              <>
                {plan.graduation_status.graduation_ready ? (
                  <div className="mb-4 rounded-xl border border-success/20 bg-success/10 p-4">
                    <p className="text-sm font-semibold text-success">
                      You meet all graduation requirements.
                    </p>
                    <p className="mt-1 text-sm text-on-surface-variant">
                      {plan.graduation_status.progress.total_hours} /{" "}
                      {plan.target_hours} credit hours at GPA{" "}
                      {plan.graduation_status.progress.gpa.toFixed(2)}.
                    </p>
                  </div>
                ) : (
                  <div className="mb-4 rounded-xl border border-warning/20 bg-warning/10 p-4">
                    <p className="text-sm font-semibold text-warning">
                      Not ready yet —{" "}
                      {plan.graduation_status.hours_remaining} credit hours
                      remaining
                      {plan.graduation_status.gpa_shortfall > 0 &&
                        ` and GPA needs +${plan.graduation_status.gpa_shortfall.toFixed(2)}`}
                      .
                    </p>
                    {plan.current_completed_hours === 0 && (
                      <p className="mt-1 text-sm text-on-surface-variant">
                        This plan assumes you start from scratch. Add your
                        completed courses in the Transcript tab to personalize it.
                      </p>
                    )}
                  </div>
                )}

                <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <StatCard label="Target hours" value={`${plan.target_hours}`} />
                  <StatCard
                    label="Completed"
                    value={`${plan.current_completed_hours}`}
                  />
                  <StatCard
                    label="Projected after plan"
                    value={`${plan.projected_total_hours}`}
                  />
                  <StatCard label="Terms to graduate" value={`${plan.total_terms}`} />
                </div>

                <div className="mb-4">
                  <p className="text-[13px] font-semibold uppercase tracking-wider text-on-surface-variant">
                    Planned load per term: {plan.load_rule.min_hours}–{plan.load_rule.max_hours}{" "}
                    hours (GPA {plan.load_rule.based_on_gpa})
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {plan.terms.map((term) => (
                    <div
                      key={term.term}
                      className="app-card rounded-xl p-4"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm font-semibold text-on-surface">
                          Term {term.term}
                        </span>
                        <span className="rounded-full bg-surface-container px-2 py-0.5 text-[13px] font-semibold text-on-surface-variant">
                          {term.term_total_hours} hrs
                        </span>
                      </div>
                      <ul className="space-y-1">
                        {term.courses.map((c) => (
                          <li
                            key={c.code}
                            className="flex items-center justify-between gap-2 text-sm"
                          >
                            <span className="flex items-center gap-1.5 font-medium text-on-surface-variant">
                              <span className="status-dot green" />
                              {c.code}
                            </span>
                            <span className="truncate text-on-surface-variant">{c.name}</span>
                            <span className="text-[13px] text-on-surface-variant">
                              {c.credit_hours}h
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                <p className="mt-4 text-[13px] text-on-surface-variant">
                  {TERMINATION_LABELS[plan.termination_reason] ??
                    plan.termination_reason}
                </p>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="app-card rounded-xl p-3">
      <p className="text-[13px] font-semibold uppercase tracking-wider text-on-surface-variant">
        {label}
      </p>
      <p className="mt-1 font-[family-name:var(--font-heading)] text-xl font-medium text-on-surface">
        {value}
      </p>
    </div>
  );
}
