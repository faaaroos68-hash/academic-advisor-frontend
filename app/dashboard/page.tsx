"use client";

import { useEffect, useState } from "react";
import PageShell from "@/components/PageShell";
import { get } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";
import type { GraduationPlan, HistoryEntry, Student } from "@/lib/types";
import { computeTermGpaTrend } from "@/lib/analytics";

const TOTAL_REQUIRED_HOURS = 142;

const DEPARTMENT_LABELS: Record<string, string> = {
  AI_GENERAL: "AI General", CYBER_SECURITY: "Cyber Security",
  BIO_INFORMATICS: "Bio Informatics", UNDECIDED: "Undecided",
};

function getSemesterInfo(t: (key: "dash.fall" | "dash.spring" | "dash.summer") => string) {
  const m = new Date().getMonth();
  const year = new Date().getFullYear();
  if (m >= 8 && m <= 11) return `${t("dash.fall")} ${year}`;
  if (m >= 0 && m <= 4) return `${t("dash.spring")} ${year}`;
  return `${t("dash.summer")} ${year}`;
}

export default function DashboardPage() {
  const { t } = useLanguage();
  const [profile, setProfile] = useState<Student | null>(null);
  const [plan, setPlan] = useState<GraduationPlan | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      get<{ student: Student }>("/api/me").then((d) => d.student),
      get<GraduationPlan>("/api/student/graduation-plan"),
      get<HistoryEntry[]>("/api/student/course-history"),
    ])
      .then(([s, p, h]) => { setProfile(s); setPlan(p); setHistory(h); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const creditsEarned = profile?.total_hours ?? 0;
  const creditProgress = Math.min((creditsEarned / TOTAL_REQUIRED_HOURS) * 100, 100);
  const degreeProgress = Math.round((creditsEarned / TOTAL_REQUIRED_HOURS) * 100);

  return (
    <PageShell>
      <div className="page-content">
        {loading && (
          <div className="flex items-center gap-2 text-sm text-on-surface-variant">
            <div className="h-4 w-4 animate-pulse rounded bg-primary" />
            {t("dash.loading")}
          </div>
        )}
          {error && (
            <div className="mb-4 rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">{error}</div>
          )}
        {profile && (
          <>
            <div className="mb-6">
              <h1 className="text-[28px] font-bold text-on-surface font-[family-name:var(--font-heading)] mb-1">
                {t("dash.welcome")}, {profile.full_name.split(" ")[0]}
              </h1>
              <p className="text-sm text-on-surface-variant">
                {t(`dept.${profile.department}` as "dept.AI_GENERAL" | "dept.CYBER_SECURITY" | "dept.BIO_INFORMATICS" | "dept.UNDECIDED") ?? DEPARTMENT_LABELS[profile.department] ?? profile.department} &middot; Level {profile.level} &middot; {getSemesterInfo(t)}
              </p>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="app-card p-5">
                <p className="stat-label">{t("dash.cgpa")}</p>
                <p className="text-[32px] font-bold text-primary">{profile.gpa.toFixed(2)}</p>
                <p className="text-xs text-on-surface-variant mt-1">
                  {profile.gpa >= 2.0 ? t("dash.goodStanding") : t("dash.belowMinimum")}
                </p>
              </div>
              <div className="app-card p-5">
                <p className="stat-label">{t("dash.creditsEarned")}</p>
                <p className="text-[32px] font-bold text-primary">
                  {creditsEarned} <span className="text-base font-normal text-on-surface-variant">/ {TOTAL_REQUIRED_HOURS}</span>
                </p>
                <div className="mt-2 h-2 w-full rounded-full bg-surface-container-high overflow-hidden">
                  <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${creditProgress}%` }} />
                </div>
              </div>
              <div className="app-card p-5">
                <p className="stat-label">{t("dash.recommendedLoad")}</p>
                {plan ? (
                  <>
                    <p className="text-[32px] font-bold text-primary">{plan.load_rule.min_hours}–{plan.load_rule.max_hours}</p>
                    <p className="text-xs text-on-surface-variant mt-1">{t("dash.basedOnGpa")} {plan.load_rule.based_on_gpa.toFixed(2)}</p>
                  </>
                ) : (
                  <div className="h-10 w-24 animate-pulse rounded bg-surface-container-high" />
                )}
              </div>
              <div className="app-card p-5 flex flex-col items-center justify-center">
                <p className="stat-label mb-2">{t("dash.degreeProgress")}</p>
                <div className="relative w-20 h-20">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="52" fill="none" stroke="var(--c-outline-variant)" strokeWidth="10" />
                    <circle cx="60" cy="60" r="52" fill="none" stroke="var(--c-primary)" strokeWidth="10" strokeLinecap="round" strokeDasharray={`${(degreeProgress / 100) * 326.7} 326.7`} />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-primary">{degreeProgress}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* GPA Trend + Recommendations */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 app-card p-6">
                <h2 className="text-[16px] font-bold text-on-surface font-[family-name:var(--font-heading)] mb-4">{t("dash.gpaTrend")}</h2>
                {(() => {
                  const trend = computeTermGpaTrend(history);
                  if (trend.length === 0) {
                    return <p className="text-sm text-on-surface-variant py-8 text-center">{t("dash.gpaTrendEmpty")}</p>;
                  }
                  return (
                    <div className="flex items-end gap-3 h-40">
                      {trend.map((tr, i) => (
                        <div key={tr.term} className="flex flex-1 flex-col items-center gap-2 min-w-0">
                          <span className="text-xs text-on-surface-variant">{tr.gpa.toFixed(2)}</span>
                          <div className="w-full relative" style={{ height: "100px" }}>
                            <div
                              className="absolute bottom-0 w-full rounded-t transition-all"
                              style={{ height: `${(tr.gpa / 4.0) * 100}%`, background: i === trend.length - 1 ? "var(--c-primary)" : "var(--c-primary-container)" }}
                            />
                          </div>
                          <span className="text-xs text-on-surface-variant truncate">{tr.term}</span>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

              <div className="app-card p-6">
                <h2 className="text-[16px] font-bold text-on-surface font-[family-name:var(--font-heading)] mb-4">{t("dash.aiRecommendations")}</h2>
                <div className="space-y-3">
                  {profile.gpa >= 3.0 && (
                    <div className="rounded-lg bg-primary-container/50 p-3">
                      <p className="text-sm font-medium text-on-surface">{t("dash.honorsCourses")}</p>
                      <p className="text-xs text-on-surface-variant mt-1">{t("dash.honorsCoursesDesc")}</p>
                    </div>
                  )}
                  {creditsEarned < 100 && (
                    <div className="rounded-lg bg-primary-container/50 p-3">
                      <p className="text-sm font-medium text-on-surface">{t("dash.stayOnTrack")}</p>
                      <p className="text-xs text-on-surface-variant mt-1">{t("dash.stayOnTrackDesc").replace("{n}", String(TOTAL_REQUIRED_HOURS - creditsEarned))}</p>
                    </div>
                  )}
                  <div className="rounded-lg bg-primary-container/50 p-3">
                    <p className="text-sm font-medium text-on-surface">{t("dash.useAiAdvisor")}</p>
                    <p className="text-xs text-on-surface-variant mt-1">{t("dash.useAiAdvisorDesc")}</p>
                  </div>
                  {profile.gpa < 2.0 && (
                    <div className="rounded-lg bg-danger/10 border border-danger/30 p-3">
                      <p className="text-sm font-medium text-danger">{t("dash.academicWarning")}</p>
                      <p className="text-xs text-on-surface-variant mt-1">{t("dash.academicWarningDesc")}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </PageShell>
  );
}
