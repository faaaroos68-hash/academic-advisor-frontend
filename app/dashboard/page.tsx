"use client";

import { useEffect, useState } from "react";
import PageShell from "@/components/PageShell";
import { get } from "@/lib/api";
import type { GraduationPlan, Student } from "@/lib/types";

const DEPARTMENT_LABELS: Record<string, string> = {
  AI_GENERAL: "AI General",
  CYBER_SECURITY: "Cyber Security",
  BIO_INFORMATICS: "Bio Informatics",
  UNDECIDED: "Undecided",
};

const LEVEL_LABELS: Record<number, string> = {
  1: "First Year",
  2: "Second Year",
  3: "Third Year",
  4: "Fourth Year",
};

function standing(gpa: number) {
  return gpa >= 2.0
    ? { label: "Good Standing", dot: "green" as const }
    : { label: "Academic Probation", dot: "red" as const };
}

export default function DashboardPage() {
  const [profile, setProfile] = useState<Student | null>(null);
  const [plan, setPlan] = useState<GraduationPlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      get<{ student: Student }>("/api/me").then((d) => d.student),
      get<GraduationPlan>("/api/student/graduation-plan"),
    ])
      .then(([student, graduationPlan]) => {
        setProfile(student);
        setPlan(graduationPlan);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const st = profile ? standing(profile.gpa) : null;

  return (
    <PageShell>
      {loading && (
        <div className="flex items-center gap-2 text-sm text-caption">
          <div className="h-4 w-4 animate-pulse rounded-full bg-[#75d7cc]" />
          Loading your profile…
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      {profile && (
        <>
          <div className="glass-panel mb-6 p-6">
            <div className="mb-1 font-[family-name:var(--font-heading)] text-xl font-bold text-heading">
              Welcome back, {profile.full_name.split(" ")[0]}
            </div>
            <p className="text-sm text-caption">
              {profile.student_id} ·{" "}
              {DEPARTMENT_LABELS[profile.department] ?? profile.department} ·{" "}
              {LEVEL_LABELS[profile.level] ?? `Level ${profile.level}`}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {st && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-glass px-3 py-1 text-xs font-medium text-body-text">
                  <span className={`status-dot ${st.dot}`} />
                  {st.label}
                </span>
              )}
              {plan && (
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${
                    plan.graduation_status.graduation_ready
                      ? "border-success/20 bg-success/10 text-success"
                      : "border-warning/20 bg-warning/10 text-warning"
                  }`}
                >
                  <span className={`status-dot ${plan.graduation_status.graduation_ready ? "green" : "amber"}`} />
                  {plan.graduation_status.graduation_ready
                    ? "Graduation requirements met"
                    : `${plan.graduation_status.hours_remaining} hrs to graduation`}
                </span>
              )}
            </div>
          </div>

          <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard
              label="GPA"
              value={profile.gpa.toFixed(2)}
              accent={profile.gpa >= 2.0 ? "text-success" : "text-danger"}
            />
            <StatCard label="Completed Hours" value={`${profile.total_hours}`} />
            <StatCard label="Level" value={`${profile.level}`} />
            <StatCard
              label="Graduation Target"
              value={`${plan?.target_hours ?? 142} hrs`}
            />
          </div>

          {plan && plan.current_completed_hours === 0 && (
            <div className="glass-card border-l-[3px] border-l-[#75d7cc]">
              <p className="text-sm text-body-text">
                Tip: add your completed courses in the{" "}
                <span className="font-semibold text-heading">Transcript</span> tab to get a
                personalized graduation plan.
              </p>
            </div>
          )}
        </>
      )}
    </PageShell>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="glass-card">
      <p className="text-xs font-medium uppercase tracking-wide text-caption">
        {label}
      </p>
      <p className={`mt-2 font-[family-name:var(--font-heading)] text-2xl font-bold ${accent ?? "text-heading"}`}>
        {value}
      </p>
    </div>
  );
}
