"use client";

import { useEffect, useState } from "react";
import PageShell from "@/components/PageShell";
import { get } from "@/lib/api";
import type { Student } from "@/lib/types";

const TARGET_HOURS = 142;

interface CourseRow {
  id: number;
  name: string;
  credits: number;
  grade: string;
}

const GRADE_POINTS: Record<string, number> = {
  "A+": 4.0, "A": 4.0, "A-": 3.7, "B+": 3.3, "B": 3.0, "B-": 2.7,
  "C+": 2.3, "C": 2.0, "C-": 1.7, "D+": 1.3, "D": 1.0, "F": 0.0,
};

const VALID_GRADES = new Set(Object.keys(GRADE_POINTS));
const pointsFor = (g: string) => VALID_GRADES.has(g) ? GRADE_POINTS[g] : undefined;

const GRADE_OPTIONS = Object.entries(GRADE_POINTS).map(([g, p]) => ({
  label: `${g} (${p.toFixed(1)})`, value: g,
}));

let nextRowId = 1;
const makeEmptyRow = (): CourseRow => ({ id: nextRowId++, name: "", credits: 3, grade: "A" });

export default function GPACalculatorPage() {
  const [profile, setProfile] = useState<Student | null>(null);
  const [rows, setRows] = useState<CourseRow[]>([makeEmptyRow()]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [calculated, setCalculated] = useState(false);

  useEffect(() => {
    get<{ student: Student }>("/api/me")
      .then((d) => setProfile(d.student))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const currentGPA = profile?.gpa ?? 0;
  const totalHours = profile?.total_hours ?? 0;
  const existingPoints = currentGPA * totalHours;

  const validRows = rows.filter((r) => pointsFor(r.grade) !== undefined);
  const totalRowCredits = validRows.reduce((s, r) => s + r.credits, 0);
  const totalNewPoints = validRows.reduce((s, r) => s + pointsFor(r.grade)! * r.credits, 0);
  const newTotalCredits = totalHours + totalRowCredits;
  const projectedGPA = newTotalCredits > 0 ? (existingPoints + totalNewPoints) / newTotalCredits : currentGPA;
  const gpaChange = projectedGPA - currentGPA;
  const creditsNeeded = Math.max(TARGET_HOURS - totalHours, 0);

  const addRow = () => setRows((p) => [...p, makeEmptyRow()]);
  const removeRow = (id: number) => setRows((p) => p.filter((r) => r.id !== id));
  const updateRow = (id: number, field: keyof CourseRow, value: string | number) =>
    setRows((p) => p.map((r) => {
      if (r.id !== id) return r;
      if (field === "grade") { const g = String(value); return pointsFor(g) !== undefined ? { ...r, grade: g } : r; }
      return { ...r, [field]: value };
    }));

  return (
    <PageShell>
      <div className="page-content">
        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-[28px] font-bold text-on-surface font-[family-name:var(--font-heading)] mb-1">
            GPA Calculator
          </h1>
          <p className="text-sm text-on-surface-variant max-w-2xl">
            Model your academic trajectory. Add prospective courses below to see how they impact your Cumulative Grade Point Average.
          </p>
        </div>

        {loading && (
          <div className="flex items-center gap-2 text-sm text-on-surface-variant">
            <div className="h-4 w-4 animate-pulse rounded bg-primary" />
            Loading your profile...
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {profile && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left column: Prospective Courses */}
            <div className="lg:col-span-8 app-card p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-[18px] font-bold text-on-surface font-[family-name:var(--font-heading)]">
                  Prospective Courses
                </h2>
                <button
                  onClick={addRow}
                  className="text-sm font-semibold text-primary hover:text-primary-fixed transition-colors"
                >
                  + Add Row
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="app-table">
                  <thead>
                    <tr>
                      <th className="w-1/2">Course Name / Code</th>
                      <th className="w-1/4">Credits</th>
                      <th className="w-1/4">Expected Grade</th>
                      <th className="w-10" />
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.id} className="group">
                        <td>
                          <input
                            type="text"
                            value={row.name}
                            onChange={(e) => updateRow(row.id, "name", e.target.value)}
                            placeholder="e.g. CS301"
                            className="app-input"
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            min="1" max="6"
                            value={row.credits}
                            onChange={(e) => updateRow(row.id, "credits", parseInt(e.target.value) || 0)}
                            className="app-input"
                          />
                        </td>
                        <td>
                          <select
                            value={row.grade}
                            onChange={(e) => updateRow(row.id, "grade", e.target.value)}
                            className="app-input cursor-pointer"
                          >
                            {GRADE_OPTIONS.map((g) => (
                              <option key={g.value} value={g.value}>{g.label}</option>
                            ))}
                          </select>
                        </td>
                        <td className="rtl:text-left text-right">
                          <button
                            onClick={() => removeRow(row.id)}
                            disabled={rows.length === 1}
                            className="text-on-surface-variant hover:text-danger transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-30"
                          >
                            <span className="material-symbols-outlined text-[16px]">close</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setCalculated(true)}
                  className="btn-primary"
                >
                  Calculate Impact
                </button>
              </div>
            </div>

            {/* Right column: Stats */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              {/* Projected CGPA */}
              <div className="app-card p-6 text-center">
                <p className="stat-label">Projected CGPA</p>
                <div className="text-[48px] font-bold text-primary leading-tight my-2">
                  {projectedGPA.toFixed(2)}
                </div>
                {calculated ? (
                  <p className="text-sm text-on-surface-variant flex items-center justify-center gap-1">
                    <span className="material-symbols-outlined text-[14px] text-primary">trending_up</span>
                    <span className="text-primary font-semibold">
                      {gpaChange > 0 ? "+" : ""}{gpaChange.toFixed(2)}
                    </span>
                    from Current ({currentGPA.toFixed(2)})
                  </p>
                ) : (
                  <p className="text-sm text-on-surface-variant">
                    Current GPA: {currentGPA.toFixed(2)}
                  </p>
                )}
              </div>

              {/* Trajectory Chart */}
              <div className="app-card p-6 flex-1">
                <h3 className="text-[16px] font-bold text-on-surface font-[family-name:var(--font-heading)] mb-4">
                  Trajectory
                </h3>
                <div className="relative h-48">
                  {/* Y-axis */}
                  <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-[11px] text-on-surface-variant w-8">
                    <span>4.0</span><span>3.5</span><span>3.0</span><span>2.5</span>
                  </div>
                  {/* Grid */}
                  <div className="absolute left-10 right-0 top-0 bottom-6">
                    <div className="absolute inset-0 border-b border-outline-variant" />
                    <div className="absolute inset-0 border-b border-outline-variant/50" style={{ top: "25%" }} />
                    <div className="absolute inset-0 border-b border-outline-variant/50" style={{ top: "50%" }} />
                    <div className="absolute inset-0 border-b border-outline-variant/50" style={{ top: "75%" }} />
                  </div>
                  {/* Line */}
                  <svg className="absolute left-10 right-0 top-0 h-[calc(100%-24px)]" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <polyline
                      points="10,62 35,50 60,35 90,12"
                      fill="none"
                      stroke="var(--c-primary)"
                      strokeWidth="2"
                      vectorEffect="non-scaling-stroke"
                    />
                  </svg>
                  {/* Points */}
                  <svg className="absolute left-10 right-0 top-0 h-[calc(100%-24px)]" viewBox="0 0 100 100">
                    <circle cx="10" cy="62" r="3" fill="var(--c-primary)" />
                    <circle cx="35" cy="50" r="3" fill="var(--c-primary)" />
                    <circle cx="60" cy="35" r="3" fill="var(--c-primary)" />
                    <circle cx="90" cy="12" r="4" fill="var(--c-primary)" stroke="var(--c-surface)" strokeWidth="1.5" />
                    <text x="90" y="8" textAnchor="middle" fill="var(--c-primary)" fontSize="6" fontWeight="bold">{projectedGPA.toFixed(2)}</text>
                  </svg>
                  {/* X-axis labels */}
                  <div className="absolute left-10 right-0 bottom-0 flex justify-between text-[11px] text-on-surface-variant px-2">
                    <span>FA24</span>
                    <span className="font-semibold text-primary">SP25 (Proj)</span>
                  </div>
                </div>
              </div>

              {/* Small stat cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="app-card p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
                    Total Credits Earned
                  </p>
                  <p className="text-[28px] font-bold text-primary">{totalHours}</p>
                </div>
                <div className="app-card p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
                    Credits Needed to Grad
                  </p>
                  <p className="text-[28px] font-bold text-primary">{creditsNeeded}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageShell>
  );
}
