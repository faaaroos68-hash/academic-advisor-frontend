"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import PageShell from "@/components/PageShell";
import { del, get, postForm, postJson } from "@/lib/api";
import type {
  AvailableCourse,
  ExtractedEntry,
  HistoryEntry,
  TranscriptExtraction,
} from "@/lib/types";
import { dirFor } from "@/lib/rtl";

const GRADES = [
  "A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "F", "FF",
];
const SPECIAL_GRADES = ["W", "FW", "AU", "S", "US", "I", "PASS"];

interface AddHistoryResult {
  message: string;
  inserted: number;
  skipped: { course_code: string; reason: string }[];
  code_conflicts: { course_code: string; message: string }[];
  needs_review: { course_code: string; message: string }[];
  updated_gpa: number;
  updated_total_hours: number;
  updated_level: number;
}

function formatAddResult(r: AddHistoryResult): string {
  const parts = [
    `${r.inserted} added (GPA ${r.updated_gpa}, ${r.updated_total_hours} hrs, level ${r.updated_level})`,
  ];
  if (r.skipped.length)
    parts.push(
      `Skipped: ${r.skipped.map((s) => `${s.course_code} (${s.reason})`).join(", ")}`
    );
  if (r.code_conflicts.length)
    parts.push(
      `Conflicts: ${r.code_conflicts.map((c) => c.message).join("; ")}`
    );
  if (r.needs_review.length)
    parts.push(
      `Review: ${r.needs_review.map((n) => n.message).join("; ")}`
    );
  return parts.join(" | ");
}

export default function HistoryPage() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [courses, setCourses] = useState<AvailableCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const [code, setCode] = useState("");
  const [grade, setGrade] = useState("B");
  const [semester, setSemester] = useState("");

  const [file, setFile] = useState<File | null>(null);
  const [extraction, setExtraction] = useState<TranscriptExtraction | null>(null);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [h, c] = await Promise.all([
        get<HistoryEntry[]>("/api/student/course-history"),
        get<AvailableCourse[]>("/api/student/available-courses"),
      ]);
      setEntries(h);
      setCourses(c);
    } catch (e) {
      setResult({
        kind: "err",
        text: e instanceof Error ? e.message : "Failed to load history",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function addEntry(e: FormEvent) {
    e.preventDefault();
    if (!code || !grade) return;
    setBusy(true);
    setResult(null);
    try {
      const r = await postJson<AddHistoryResult>("/api/student/course-history", {
        entries: [{ course_code: code, grade, semester_taken: semester || "General" }],
      });
      setResult({ kind: "ok", text: formatAddResult(r) });
      setCode("");
      setSemester("");
      await load();
    } catch (err) {
      setResult({ kind: "err", text: err instanceof Error ? err.message : "Add failed" });
    } finally {
      setBusy(false);
    }
  }

  async function deleteEntry(id: number) {
    if (!confirm("Delete this entry?")) return;
    setBusy(true);
    try {
      const r = await del<{ message: string; updated_gpa: number; updated_total_hours: number }>(
        `/api/student/course-history/${id}`
      );
      setResult({
        kind: "ok",
        text: `${r.message} (GPA ${r.updated_gpa}, ${r.updated_total_hours} hrs)`,
      });
      await load();
    } catch (err) {
      setResult({ kind: "err", text: err instanceof Error ? err.message : "Delete failed" });
    } finally {
      setBusy(false);
    }
  }

  function pickFile(f: File | undefined) {
    if (!f) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(f.type)) {
      setResult({ kind: "err", text: "Only JPG, PNG or WEBP images are supported." });
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setResult({ kind: "err", text: "Image must be under 10MB." });
      return;
    }
    setFile(f);
    setExtraction(null);
  }

  async function extract() {
    if (!file) return;
    setUploading(true);
    setResult(null);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const r = await postForm<TranscriptExtraction>(
        "/api/student/course-history/upload-image",
        fd
      );
      setExtraction(r);
    } catch (err) {
      setResult({ kind: "err", text: err instanceof Error ? err.message : "Extraction failed" });
    } finally {
      setUploading(false);
    }
  }

  async function confirmExtracted() {
    if (!extraction) return;
    setBusy(true);
    setResult(null);
    try {
      const entriesPayload = extraction.extracted_entries.map((e: ExtractedEntry) => ({
        course_code: e.course_code,
        grade: e.grade || "B",
        semester_taken: e.semester_taken || "General",
      }));
      const r = await postJson<AddHistoryResult>("/api/student/course-history/confirm", {
        entries: entriesPayload,
      });
      setResult({ kind: "ok", text: formatAddResult(r) });
      setExtraction(null);
      setFile(null);
      await load();
    } catch (err) {
      setResult({ kind: "err", text: err instanceof Error ? err.message : "Confirm failed" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <PageShell>
      <h1 className="mb-6 font-[family-name:var(--font-heading)] text-2xl font-bold text-heading">
        Course History
      </h1>

      {result && (
        <div
          className={`mb-4 whitespace-pre-wrap rounded-xl border px-4 py-3 text-sm ${
            result.kind === "ok"
              ? "border-success/20 bg-success/10 text-success"
              : "border-danger/20 bg-danger/10 text-danger"
          }`}
        >
          {result.text}
        </div>
      )}

      <section className="glass-card mb-6">
        <h2 className="mb-3 text-sm font-semibold text-heading">
          Upload transcript image
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <label className="cursor-pointer rounded-xl border border-white/10 bg-glass px-4 py-2 text-sm text-body-text transition-colors hover:border-[#75d7cc]/30 hover:text-heading">
            {file ? file.name : "Choose image…"}
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              className="hidden"
              onChange={(e) => pickFile(e.target.files?.[0])}
            />
          </label>
          {file && (
            <button
              onClick={extract}
              disabled={uploading}
              className="primary-gradient-btn"
            >
              {uploading ? "Extracting…" : "Extract courses"}
            </button>
          )}
          {file && (
            <button
              onClick={() => {
                setFile(null);
                setExtraction(null);
              }}
              className="secondary-btn"
            >
              Clear
            </button>
          )}
        </div>

        {extraction && (
          <div className="mt-4">
            {extraction.preprocessing_warning && (
              <p className="mb-2 text-xs text-warning">
                {extraction.preprocessing_warning}
              </p>
            )}
            <p className="mb-2 text-xs text-caption">
              Review the extracted entries before confirming. Only recognized
              courses with valid grades will be added.
            </p>
            <div className="overflow-x-auto rounded-xl border border-white/10">
              <table className="glass-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Course</th>
                    <th>Grade</th>
                    <th>Semester</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {extraction.extracted_entries.map((e, i) => (
                    <tr key={i}>
                      <td className="font-medium text-heading">
                        {e.course_code}
                      </td>
                      <td dir={dirFor(e.course_name ?? "")}>
                        {e.course_name ?? "—"}
                      </td>
                      <td>{e.grade || "—"}</td>
                      <td>{e.semester_taken ?? "—"}</td>
                      <td className="text-xs">
                        {!e.recognized && (
                          <span className="text-warning">not recognized</span>
                        )}
                        {e.was_corrected && (
                          <span className="text-secondary">corrected</span>
                        )}
                        {e.recognized && !e.was_corrected && (
                          <span className="text-success">ok</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {extraction.extracted_entries.length > 0 && (
              <button
                onClick={confirmExtracted}
                disabled={busy}
                className="primary-gradient-btn mt-3"
              >
                Confirm and add to history
              </button>
            )}
          </div>
        )}
      </section>

      <section className="glass-card mb-6">
        <h2 className="mb-3 text-sm font-semibold text-heading">
          Add a course manually
        </h2>
        <form onSubmit={addEntry} className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col">
            <label htmlFor="code" className="mb-1.5 text-xs font-medium text-caption">
              Course
            </label>
            <select
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              className="glass-select w-48"
            >
              <option value="">Select course…</option>
              {courses.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} — {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col">
            <label htmlFor="grade" className="mb-1.5 text-xs font-medium text-caption">
              Grade
            </label>
            <select
              id="grade"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="glass-select w-24"
            >
              {GRADES.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
              <optgroup label="Special">
                {SPECIAL_GRADES.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>
          <div className="flex flex-col">
            <label htmlFor="semester" className="mb-1.5 text-xs font-medium text-caption">
              Semester
            </label>
            <input
              id="semester"
              type="text"
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              placeholder="Fall 2024"
              className="glass-input w-40"
            />
          </div>
          <button
            type="submit"
            disabled={busy || !code}
            className="primary-gradient-btn"
          >
            Add
          </button>
        </form>
      </section>

      <section className="glass-panel overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
          <h2 className="text-sm font-semibold text-heading">History</h2>
          <span className="text-xs text-caption">
            {entries.length} course(s) ·{" "}
            {entries.reduce((s, e) => s + (e.credit_hours ?? 0), 0)} hrs
          </span>
        </div>
        {loading ? (
          <div className="flex items-center gap-2 p-6 text-sm text-caption">
            <div className="h-4 w-4 animate-pulse rounded-full bg-[#75d7cc]" />
            Loading…
          </div>
        ) : entries.length === 0 ? (
          <p className="p-6 text-sm text-caption">
            No courses yet. Add a course above or upload a transcript image.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="glass-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Course</th>
                  <th>Grade</th>
                  <th>Semester</th>
                  <th>Hours</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {entries.map((e) => (
                  <tr key={e.entry_id}>
                    <td className="font-medium text-heading">{e.course_code}</td>
                    <td dir={dirFor(e.course_name ?? "")}>
                      {e.course_name ?? "—"}
                    </td>
                    <td>{e.grade}</td>
                    <td>{e.semester_taken}</td>
                    <td>{e.credit_hours ?? "—"}</td>
                    <td className="text-right">
                      <button
                        onClick={() => deleteEntry(e.entry_id)}
                        className="text-xs font-medium text-danger/70 hover:text-danger"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </PageShell>
  );
}
