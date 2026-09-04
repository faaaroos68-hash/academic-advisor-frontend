"use client";

import { useEffect, useState } from "react";
import { get, postJson, postForm, del } from "@/lib/api";

// Shapes mirror the backend responses exactly:
// GET/POST /api/student/course-history rows come from StudentService.get_history().
type HistoryEntry = {
  entry_id: number;
  course_code: string;
  course_name: string | null;
  grade: string;
  semester_taken: string;
  credit_hours: number | null;
};

// GET /api/student/available-courses returns a bare array of catalog courses.
type CatalogCourse = {
  code: string;
  name: string;
  credit_hours: number;
};

// upload-image returns ImageService.extract_transcript() at the top level.
type ExtractedEntry = {
  course_code: string;
  course_name?: string | null;
  grade: string;
  semester_taken?: string | null;
  recognized?: boolean;
  was_corrected?: boolean;
};

type TranscriptExtraction = {
  model_used?: string;
  entries: ExtractedEntry[];
};

const GRADES: Record<string, number> = {
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

function pointsFor(grade: string): number | undefined {
  return GRADES[grade];
}

export default function HistoryPage() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [courses, setCourses] = useState<CatalogCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [code, setCode] = useState("");
  const [grade, setGrade] = useState("A");
  const [semester, setSemester] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [extraction, setExtraction] = useState<TranscriptExtraction | null>(null);
  const [uploading, setUploading] = useState(false);

  // Backend returns BARE ARRAYS for both GETs — no {ok}/{entries}/{courses} wrapper.
  async function load() {
    setLoading(true);
    try {
      const [hist, crs] = await Promise.all([
        get<HistoryEntry[]>("/api/student/course-history"),
        get<CatalogCourse[]>("/api/student/available-courses"),
      ]);
      setEntries(hist);
      setCourses(crs);
    } catch (e) {
      setResult(e instanceof Error ? e.message : "Failed to load transcript");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  // Extraction entries carry no credit hours — the backend resolves them from
  // the catalog at confirm time. Preview math uses the same catalog mapping.
  function summarize(list: ExtractedEntry[]) {
    const hoursByCode = new Map(courses.map((c) => [c.code, c.credit_hours]));
    let creditsEarned = 0;
    let totalPoints = 0;
    let gpaCredits = 0;
    for (const e of list) {
      const hrs = hoursByCode.get(e.course_code) ?? 0;
      const pts = pointsFor(e.grade);
      if (!["I", "W", "AU", "P", "NP"].includes(e.grade)) creditsEarned += hrs;
      if (pts !== undefined) {
        totalPoints += pts * hrs;
        gpaCredits += hrs;
      }
    }
    return {
      cgpa: gpaCredits ? totalPoints / gpaCredits : 0,
      creditsEarned,
      totalPoints,
    };
  }

  const cgpa = (() => {
    const valid = entries.filter((e) => pointsFor(e.grade) !== undefined);
    const totalPoints = valid.reduce(
      (s, e) => s + pointsFor(e.grade)! * (e.credit_hours ?? 0),
      0
    );
    const totalCredits = valid.reduce((s, e) => s + (e.credit_hours ?? 0), 0);
    return totalCredits ? totalPoints / totalCredits : 0;
  })();

  const creditsEarned = entries.reduce((s, e) => s + (e.credit_hours ?? 0), 0);
  const creditsRequired = 130;

  const terms = Array.from(new Set(entries.map((e) => e.semester_taken))).sort();

  const groupedByTerm: Record<string, HistoryEntry[]> = {};
  for (const t of terms) {
    groupedByTerm[t] = entries.filter((e) => e.semester_taken === t);
  }

  // Backend POST /course-history expects {entries: [...]} and answers
  // {message, inserted, skipped, code_conflicts, needs_review, updated_*}.
  async function addEntry() {
    if (!code || !semester) return;
    setBusy(true);
    setResult(null);
    try {
      const data = await postJson<{
        message: string;
        inserted: number;
        skipped: { course_code: string; reason: string }[];
        code_conflicts: unknown[];
        updated_gpa: number;
        updated_total_hours: number;
      }>("/api/student/course-history", {
        entries: [{ course_code: code, grade, semester_taken: semester }],
      });

      if (data.inserted > 0) {
        const bits = [`Added ${code} (${grade})`];
        if (data.skipped?.length) {
          bits.push(`skipped ${data.skipped.length}`);
        }
        if (typeof data.updated_gpa === "number") {
          bits.push(`GPA now ${data.updated_gpa.toFixed(2)} · ${data.updated_total_hours} hrs`);
        }
        setResult(bits.join(" · "));
        setCode("");
        setGrade("A");
        setSemester("");
        await load();
      } else if (data.skipped?.length) {
        setResult(data.skipped.map((s) => `${s.course_code}: ${s.reason}`).join("; "));
      } else {
        setResult(data.message ?? "Nothing added");
      }
    } catch (e) {
      setResult(e instanceof Error ? e.message : "Network error");
    } finally {
      setBusy(false);
    }
  }

  async function deleteEntry(entryId: number) {
    if (!confirm("Delete this entry?")) return;
    setBusy(true);
    try {
      await del(`/api/student/course-history/${entryId}`);
      await load();
    } catch (e) {
      setResult(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setBusy(false);
    }
  }

  function pickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    setExtraction(null);
  }

  // upload-image answers top-level {extracted_entries, raw_model_output, model_used}
  // on success, or {error, message?} with a non-200 status on failure.
  async function extract() {
    if (!file) return;
    setUploading(true);
    setResult(null);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const data = await postForm<{
        extracted_entries?: ExtractedEntry[];
        raw_model_output?: string;
        model_used?: string;
        error?: string;
        message?: string;
      }>("/api/student/course-history/upload-image", fd);

      if (data.extracted_entries && data.extracted_entries.length > 0) {
        setExtraction({ entries: data.extracted_entries, model_used: data.model_used });
      } else if (data.error || data.message) {
        setResult(data.message ?? data.error ?? "Extraction failed");
      } else {
        setResult("No courses were detected in that image.");
      }
    } catch (e) {
      setResult(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  // confirm expects {entries: [...]} built from the extracted entries.
  async function confirmExtracted() {
    if (!extraction) return;
    setBusy(true);
    try {
      const data = await postJson<{
        message: string;
        inserted: number;
        skipped: { course_code: string; reason: string }[];
      }>(
        "/api/student/course-history/confirm",
        {
          entries: extraction.entries.map((e) => ({
            course_code: e.course_code,
            grade: e.grade,
            semester_taken: e.semester_taken ?? "",
          })),
        }
      );
      setExtraction(null);
      setFile(null);
      await load();
      setResult(
        data.inserted > 0
          ? `Transcript imported — ${data.inserted} added` +
              (data.skipped?.length ? `, ${data.skipped.length} skipped` : "")
          : `Nothing imported — ${data.skipped?.length ?? 0} skipped` +
              (data.skipped?.length
                ? ` (${data.skipped
                    .slice(0, 3)
                    .map((s) => `${s.course_code}: ${s.reason}`)
                    .join("; ")})`
                : "")
      );
    } catch (e) {
      setResult(e instanceof Error ? e.message : "Confirm failed");
    } finally {
      setBusy(false);
    }
  }

  const termGpaMap: Record<string, number> = {};
  for (const t of terms) {
    const list = groupedByTerm[t];
    const valid = list.filter((e) => pointsFor(e.grade) !== undefined);
    const tp = valid.reduce((s, e) => s + pointsFor(e.grade)! * (e.credit_hours ?? 0), 0);
    const tc = valid.reduce((s, e) => s + (e.credit_hours ?? 0), 0);
    termGpaMap[t] = tc ? tp / tc : 0;
  }

  const [openTerms, setOpenTerms] = useState<Set<string>>(new Set());

  function toggleTerm(t: string) {
    setOpenTerms((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });
  }

  const extractionSummary = extraction ? summarize(extraction.entries) : null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 page-content">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-on-surface">Academic Transcript</h1>
        <p className="text-on-surface-variant mt-1">Bachelor of Science in Computer Science</p>
      </header>

      {/* CGPA Hero Banner */}
      <section className="app-card rounded-xl p-8 mb-8 text-center">
        <div className="text-primary text-[64px] font-bold leading-none">
          {cgpa.toFixed(2)}
        </div>
        <div className="text-on-surface-variant text-sm mt-2">Cumulative GPA</div>
        <div className="flex justify-center gap-8 mt-4 text-on-surface-variant text-sm">
          <div>
            <span className="font-semibold">{creditsEarned}</span> credits earned
          </div>
          <div>
            <span className="font-semibold">{creditsRequired}</span> credits required
          </div>
        </div>
      </section>

      {/* Transcript Accordions */}
      <section className="space-y-4 mb-10">
        {loading ? (
          <div className="text-center py-12 text-on-surface-variant">Loading…</div>
        ) : terms.length === 0 ? (
          <div className="text-center py-12 text-on-surface-variant">
            No entries yet. Add courses below or upload a transcript image.
          </div>
        ) : (
          terms.map((t) => (
            <div key={t} className="app-card rounded-xl overflow-hidden">
              <button onClick={() => toggleTerm(t)} className="w-full flex items-center justify-between p-6 hover:bg-surface-container transition-colors">
                <div className="flex items-center gap-4">
                  <span className="text-on-surface font-medium">{t}</span>
                  <span className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary font-medium">
                    {termGpaMap[t]?.toFixed(2) ?? "—"} GPA
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-on-surface-variant text-sm">
                    {groupedByTerm[t].reduce((s, e) => s + (e.credit_hours ?? 0), 0)} credits
                  </span>
                  <span className={`material-symbols-outlined accordion-icon text-on-surface-variant ${openTerms.has(t) ? "open" : ""}`}>
                    expand_more
                  </span>
                </div>
              </button>
              <div className={`accordion-content ${openTerms.has(t) ? "open" : ""}`}>
                <div className="px-6 pb-6">
                  <table className="app-table w-full rtl:text-right text-left border-collapse">
                    <thead>
                      <tr className="border-b border-outline-variant">
                        <th className="py-3 px-2 text-[13px] uppercase text-on-surface-variant font-medium">
                          Course
                        </th>
                        <th className="py-3 px-2 text-[13px] uppercase text-on-surface-variant font-medium">
                          Title
                        </th>
                        <th className="py-3 px-2 text-[13px] uppercase text-on-surface-variant font-medium">
                          Credits
                        </th>
                        <th className="py-3 px-2 text-[13px] uppercase text-on-surface-variant font-medium">
                          Grade
                        </th>
                        <th className="py-3 px-2 text-[13px] uppercase text-on-surface-variant font-medium">
                          Points
                        </th>
                        <th className="py-3 px-2 text-[13px] uppercase text-on-surface-variant font-medium"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {groupedByTerm[t].map((e) => (
                        <tr key={e.entry_id} className="border-b border-outline-variant hover:bg-surface-container">
                          <td className="py-4 px-2 text-on-surface font-medium">{e.course_code}</td>
                          <td className="py-4 px-2 text-on-surface-variant">{e.course_name ?? "—"}</td>
                          <td className="py-4 px-2 text-on-surface-variant">{e.credit_hours ?? "—"}</td>
                          <td className="py-4 px-2">
                            <span className="text-primary font-medium">{e.grade}</span>
                          </td>
                          <td className="py-4 px-2 text-on-surface-variant">
                            {pointsFor(e.grade) !== undefined && e.credit_hours != null
                              ? (pointsFor(e.grade)! * e.credit_hours).toFixed(1)
                              : "—"}
                          </td>
                          <td className="py-4 px-2">
                            <button
                              onClick={() => deleteEntry(e.entry_id)}
                              disabled={busy}
                              className="text-on-surface-variant/60 hover:text-red-400 transition-colors"
                            >
                              <span className="material-symbols-outlined text-lg">delete</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ))
        )}
      </section>

      {/* Add Course Section */}
      <section className="app-card rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-on-surface mb-4">Add Course</h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <select
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="app-input rounded-lg px-4 py-3"
          >
            <option value="">Select course</option>
            {courses.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code} – {c.name}
              </option>
            ))}
          </select>
          <select
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            className="app-input rounded-lg px-4 py-3"
          >
            {Object.keys(GRADES).map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
          <input
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            placeholder="e.g. Fall 2024"
            className="app-input rounded-lg px-4 py-3 placeholder:text-on-surface-variant/40"
          />
          <button
            onClick={addEntry}
            disabled={busy || !code || !semester}
              className="btn-primary font-medium rounded-lg px-6 py-3 disabled:opacity-50 transition-colors"
          >
            {busy ? "Adding…" : "Add"}
          </button>
        </div>
        {result && (
          <div className="mt-4 text-sm text-on-surface-variant">{result}</div>
        )}
      </section>

      {/* Upload Transcript Section */}
      <section className="app-card rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-on-surface mb-4">Upload Transcript</h2>
        <div className="flex items-center gap-4">
          <input
            type="file"
            accept="image/*"
            onChange={pickFile}
            className="block w-full text-sm text-on-surface-variant file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary/20 file:text-primary file:font-medium file:cursor-pointer hover:file:bg-primary/30"
          />
          <button
            onClick={extract}
            disabled={!file || uploading}
            className="bg-surface-container hover:bg-surface-container font-medium rounded-lg px-6 py-3 disabled:opacity-50 transition-colors whitespace-nowrap"
          >
            {uploading ? "Extracting…" : "Extract"}
          </button>
        </div>
        {extraction && extractionSummary && (
          <div className="mt-6">
            <h3 className="text-on-surface-variant text-sm mb-3">Detected Courses</h3>
            <div className="bg-surface-container rounded-lg p-4 mb-4">
              <div className="grid grid-cols-3 gap-4 text-sm text-on-surface-variant">
                <div>
                  CGPA: <span className="text-primary font-medium">{extractionSummary.cgpa.toFixed(2)}</span>
                </div>
                <div>
                  Credits: <span className="font-medium">{extractionSummary.creditsEarned}</span>
                </div>
                <div>
                  Points: <span className="font-medium">{extractionSummary.totalPoints.toFixed(1)}</span>
                </div>
              </div>
            </div>
            <table className="app-table w-full rtl:text-right text-left border-collapse mb-4">
              <thead>
                <tr className="border-b border-outline-variant">
                  <th className="py-2 px-2 text-[13px] uppercase text-on-surface-variant">Code</th>
                  <th className="py-2 px-2 text-[13px] uppercase text-on-surface-variant">Title</th>
                  <th className="py-2 px-2 text-[13px] uppercase text-on-surface-variant">Grade</th>
                  <th className="py-2 px-2 text-[13px] uppercase text-on-surface-variant">Semester</th>
                </tr>
              </thead>
              <tbody>
                {extraction.entries.map((e, i) => (
                  <tr key={i} className="border-b border-outline-variant">
                    <td className="py-3 px-2 text-on-surface font-medium">
                      {e.course_code}
                      {!e.recognized && (
                        <span className="ml-2 text-xs text-warning">(unrecognized)</span>
                      )}
                    </td>
                    <td className="py-3 px-2 text-on-surface-variant">{e.course_name ?? "—"}</td>
                    <td className="py-3 px-2 text-primary">{e.grade}</td>
                    <td className="py-3 px-2 text-on-surface-variant">{e.semester_taken ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              onClick={confirmExtracted}
              disabled={busy}
            className="btn-primary font-medium rounded-lg px-6 py-3 disabled:opacity-50 transition-colors"
            >
              {busy ? "Confirming…" : "Confirm & Import"}
            </button>
          </div>
        )}
        {result && !extraction && (
          <div className="mt-4 text-sm text-on-surface-variant">{result}</div>
        )}
      </section>
    </div>
  );
}
