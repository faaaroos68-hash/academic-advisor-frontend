"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import PageShell from "@/components/PageShell";
import { get } from "@/lib/api";
import type { AvailableCourse } from "@/lib/types";
import { dirFor } from "@/lib/rtl";
import { CATALOG } from "@/lib/catalog";

const CATALOG_BY_CODE = new Map(CATALOG.map((c) => [c.code, c]));

const DEPARTMENT_OPTIONS = [
  { value: "AI_GENERAL", label: "Artificial Intelligence" },
  { value: "CYBER_SECURITY", label: "Cybersecurity" },
  { value: "BIO_INFORMATICS", label: "Bioinformatics" },
];

function levelFromCode(code: string): number {
  const m = code.match(/\d/);
  const d = m ? parseInt(m[0], 10) : 1;
  return d === 0 ? 1 : d;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<AvailableCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [levelFilter, setLevelFilter] = useState("");

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

  const eligible = useMemo(() => courses.filter((c) => c.eligible), [courses]);
  const ineligible = useMemo(
    () => courses.filter((c) => !c.eligible),
    [courses]
  );
  const eligibleHours = useMemo(
    () => eligible.reduce((s, c) => s + c.credit_hours, 0),
    [eligible]
  );

  const query = search.trim().toLowerCase();

  const matchesFilters = useCallback(
    (c: AvailableCourse) => {
      if (deptFilter) {
        const cat = CATALOG_BY_CODE.get(c.code);
        if (!cat || !(cat.departments.includes("ALL") || cat.departments.includes(deptFilter))) {
          return false;
        }
      }
      if (levelFilter && levelFromCode(c.code) !== Number(levelFilter)) {
        return false;
      }
      return true;
    },
    [deptFilter, levelFilter]
  );

  const filteredEligible = useMemo(
    () =>
      eligible.filter(
        (c) =>
          matchesFilters(c) &&
          (!query ||
            c.code.toLowerCase().includes(query) ||
            c.name.toLowerCase().includes(query))
      ),
    [eligible, query, matchesFilters]
  );

  const filteredIneligible = useMemo(
    () =>
      ineligible.filter(
        (c) =>
          matchesFilters(c) &&
          (!query ||
            c.code.toLowerCase().includes(query) ||
            c.name.toLowerCase().includes(query))
      ),
    [ineligible, query, matchesFilters]
  );

  const filteredAll = useMemo(
    () => [...filteredEligible, ...filteredIneligible],
    [filteredEligible, filteredIneligible]
  );

  return (
    <PageShell>
      <div className="page-content">
        <div className="mb-6">
          <h1 className="font-[family-name:var(--font-heading)] text-display-lg-mobile md:text-display-lg text-on-background mb-2">
            Course Registration
          </h1>
          <p className="text-body-lg text-on-surface-variant">Fall 2024 Semester</p>
        </div>

        <div className="app-card rounded-xl p-6 mb-6 flex flex-col sm:flex-row gap-4 items-end">
          <div className="w-full sm:flex-1">
            <label className="stat-label block">
              Search
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">
                search
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Course code, title, or keywords"
                className="app-input w-full"
              />
            </div>
          </div>
          <div className="w-full sm:w-48">
            <label className="stat-label block">
              Department
            </label>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="app-input w-full appearance-none cursor-pointer"
            >
              <option value="">All Departments</option>
              {DEPARTMENT_OPTIONS.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
          <div className="w-full sm:w-32">
            <label className="stat-label block">
              Level
            </label>
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="app-input w-full appearance-none cursor-pointer"
            >
              <option value="">Any Level</option>
              {[1, 2, 3, 4].map((l) => (
                <option key={l} value={l}>
                  Level {l}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading && (
          <div className="flex items-center gap-2 text-sm text-on-surface-variant">
            <div className="h-4 w-4 animate-pulse rounded-full bg-primary" />
            Loading courses…
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-xl border border-error/20 bg-error/10 px-4 py-3 text-sm text-error">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="app-card rounded-xl p-4">
                <div className="mb-1 flex items-center gap-2">
                  <span className="status-dot green" />
                  <p className="stat-label">
                    Eligible now
                  </p>
                </div>
                <p className="stat-value text-success">
                  {eligible.length}
                </p>
              </div>
              <div className="app-card rounded-xl p-4">
                <div className="mb-1 flex items-center gap-2">
                  <span className="status-dot amber" />
                  <p className="stat-label">
                    Blocked by prerequisites
                  </p>
                </div>
                <p className="stat-value text-warning">
                  {ineligible.length}
                </p>
              </div>
              <div className="app-card rounded-xl p-4">
                <div className="mb-1 flex items-center gap-2">
                  <span className="status-dot teal" />
                  <p className="stat-label">
                    Eligible hours
                  </p>
                </div>
                <p className="stat-value text-primary">
                  {eligibleHours}
                </p>
              </div>
            </div>

            <div className="app-card rounded-xl overflow-hidden">
              <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-outline-variant text-stat-label text-on-surface-variant uppercase tracking-wider bg-surface-container font-semibold">
                <div className="col-span-2">Code</div>
                <div className="col-span-5">Course Title</div>
                <div className="col-span-2 text-center">Credits</div>
                <div className="col-span-3">Status</div>
              </div>

              {filteredAll.length === 0 ? (
                <p className="p-6 text-sm text-on-surface-variant">
                  {query || deptFilter || levelFilter
                    ? "No courses match your search or filters."
                    : "No courses available yet."}
                </p>
              ) : (
                filteredAll.map((c) => (
                  <div
                    key={c.code}
                    className={`grid grid-cols-12 gap-4 px-6 py-4 border-b border-outline-variant items-center hover:bg-surface-container transition-colors group ${
                      !c.eligible ? "bg-error/5" : ""
                    }`}
                  >
                    <div className="col-span-2">
                      <span
                        className={`font-mono text-sm ${
                          c.eligible ? "text-primary" : "text-on-surface-variant"
                        }`}
                      >
                        {c.code}
                      </span>
                    </div>
                    <div
                      className="col-span-5 text-on-surface flex items-center"
                      dir={dirFor(c.name)}
                    >
                      <div>
                        <div className="font-[family-name:var(--font-heading)] text-body-md text-on-surface mb-1">
                          {c.name}
                        </div>
                      </div>
                    </div>
                    <div className="col-span-2 text-center font-mono text-on-surface-variant">
                      {c.credit_hours}
                    </div>
                    <div className="col-span-3 flex items-center gap-2 flex-wrap">
                      {c.eligible ? (
                        <span className="rounded-full bg-primary/10 text-primary text-xs font-medium px-2.5 py-0.5">
                          Eligible
                        </span>
                      ) : (
                        <>
                          <span className="rounded-full bg-error/10 text-error text-xs font-medium px-2.5 py-0.5">
                            Blocked
                          </span>
                          {c.missing_prerequisites.map((m) => (
                            <span
                              key={m}
                              className="rounded-full border border-warning/20 bg-warning/10 text-warning text-xs px-2 py-0.5"
                            >
                              {m}
                            </span>
                          ))}
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </PageShell>
  );
}
