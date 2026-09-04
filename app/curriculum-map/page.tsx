"use client";

import { useMemo, useState } from "react";
import PageShell from "@/components/PageShell";
import { CATALOG, DEPARTMENT_LABELS, type CatalogCourse } from "@/lib/catalog";

const TAB_ORDER = ["ALL", "AI_GENERAL", "CYBER_SECURITY", "BIO_INFORMATICS"] as const;
type TabKey = (typeof TAB_ORDER)[number];

const GROUP_ACCENTS: Record<string, string> = {
  "University Requirement": "text-secondary bg-secondary/10 border-secondary/30",
  "University Elective": "text-tertiary bg-tertiary/10 border-tertiary/30",
};

function accentFor(groupType: string): string {
  return GROUP_ACCENTS[groupType] ?? "text-primary bg-primary/10 border-primary/30";
}

export default function CurriculumMapPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("ALL");
  const [openKey, setOpenKey] = useState<string | null>(null);

  const courses = useMemo(() => {
    if (activeTab === "ALL") return CATALOG;
    return CATALOG.filter((c) => c.departments.includes(activeTab));
  }, [activeTab]);

  const totalCredits = useMemo(
    () => courses.reduce((s, c) => s + c.credit_hours, 0),
    [courses]
  );

  function toggle(key: string) {
    setOpenKey((prev) => (prev === key ? null : key));
  }

  function descriptionFor(c: CatalogCourse): string {
    const deptTags = c.departments.map((d) => DEPARTMENT_LABELS[d] ?? d);
    const origin = c.departments.includes(activeTab) && activeTab !== "ALL"
      ? DEPARTMENT_LABELS[activeTab]
      : deptTags.join(" / ");
    return `[${origin}] ${c.name} — a ${c.credit_hours}-credit-hour ${c.group_type.toLowerCase()} course.`;
  }

  return (
    <PageShell>
      <div className="page-content flex flex-col min-h-[calc(100vh-8rem)]">
        {/* Page Header & Tabs */}
        <div className="pt-2 pb-4 shrink-0 z-20">
          <div className="flex justify-between items-end mb-6">
            <h1 className="font-[family-name:var(--font-heading)] text-headline-md text-on-surface">
              Curriculum Map
            </h1>
            <span className="text-label-sm text-on-surface-variant">
              {courses.length} courses · {totalCredits} credit hours
            </span>
          </div>
          <div className="flex gap-4 border-b border-outline-variant overflow-x-auto">
            {TAB_ORDER.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 px-4 text-label-sm font-semibold transition-colors whitespace-nowrap ${
                  activeTab === tab
                    ? "text-primary border-b-2 border-primary"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {DEPARTMENT_LABELS[tab]}
              </button>
            ))}
          </div>
        </div>

        {/* Course Grid */}
        <div className="flex-1 overflow-auto relative z-10 pb-8 pt-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {courses.map((c) => {
              const key = `${activeTab}::${c.code}`;
              const isOpen = openKey === key;
              return (
                <div
                  key={`${c.code}-${c.departments.join("-")}`}
                  id={`node-${c.code}`}
                  onClick={() => toggle(key)}
                  role="button"
                  aria-expanded={isOpen}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      toggle(key);
                    }
                  }}
                  className={`app-card rounded-xl cursor-pointer transition-all duration-300 hover:bg-surface-container hover:shadow-lg hover:shadow-primary/5 ${
                    isOpen ? "ring-1 ring-primary/40 bg-surface-container" : ""
                  }`}
                >
                  {/* Collapsed summary — always visible */}
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span
                        className={`text-label-sm px-2 py-1 rounded border font-semibold ${accentFor(c.group_type)}`}
                      >
                        {c.code}
                      </span>
                      <span
                        className={`material-symbols-outlined text-lg transition-transform duration-300 ${
                          isOpen ? "rotate-180 text-primary" : "text-on-surface-variant"
                        }`}
                      >
                        expand_more
                      </span>
                    </div>
                    <h4 className="font-[family-name:var(--font-heading)] text-[16px] leading-tight mb-1 text-on-surface">
                      {c.name}
                    </h4>
                    <p className="text-[12px] text-on-surface-variant">
                      {c.credit_hours} Credits · {c.group_type}
                    </p>
                    {!isOpen && c.prereqs.length > 0 && (
                      <p className="text-[11px] text-on-surface-variant/60 mt-2">
                        {c.prereqs.length} prerequisite{c.prereqs.length > 1 ? "s" : ""} — click to expand
                      </p>
                    )}
                  </div>

                  {/* Expandable detail panel */}
                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      isOpen ? "max-h-72 opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="px-4 pb-4 border-t border-outline-variant pt-3 space-y-3">
                      <p className="text-[13px] leading-relaxed text-on-surface-variant">
                        {descriptionFor(c)}
                      </p>
                      <div>
                        <p className="text-[11px] uppercase tracking-wider font-semibold text-on-surface-variant mb-1.5">
                          Credit hours
                        </p>
                        <span className="inline-flex items-center gap-1.5 text-label-sm font-semibold text-primary">
                          <span className="material-symbols-outlined text-sm">style</span>
                          {c.credit_hours} credit hours
                        </span>
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-wider font-semibold text-on-surface-variant mb-1.5">
                          Prerequisites
                        </p>
                        {c.prereqs.length === 0 ? (
                          <span className="inline-flex items-center gap-1.5 text-label-sm text-on-surface-variant">
                            <span className="material-symbols-outlined text-sm">check_circle</span>
                            None — open entry point
                          </span>
                        ) : (
                          <div className="flex flex-wrap gap-1.5">
                            {c.prereqs.map((p) => (
                              <span
                                key={p}
                                className="text-xs font-mono px-2 py-0.5 rounded-full bg-warning/10 text-warning border border-warning/20"
                              >
                                {p}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {courses.length === 0 && (
            <div className="app-card rounded-xl p-10 text-center text-on-surface-variant">
              No courses found for this department.
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}
