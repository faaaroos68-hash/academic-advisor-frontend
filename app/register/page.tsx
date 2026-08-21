"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

const DEPARTMENTS = [
  { value: "AI_GENERAL", label: "AI General" },
  { value: "CYBER_SECURITY", label: "Cyber Security" },
  { value: "BIO_INFORMATICS", label: "Bio Informatics" },
  { value: "UNDECIDED", label: "Undecided" },
];

const LEVELS = [1, 2, 3, 4];

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [form, setForm] = useState({
    username: "",
    password: "",
    full_name: "",
    student_id: "",
    department: "AI_GENERAL",
    level: "1",
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await register({
        username: form.username,
        password: form.password,
        full_name: form.full_name,
        student_id: form.student_id,
        department: form.department,
        level: Number(form.level),
      });
      router.push("/login?registered=1");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main
      className="flex min-h-screen items-center justify-center px-4 py-10"
      style={{ background: "linear-gradient(135deg, #0f1414 0%, #132422 50%, #11191c 100%)" }}
    >
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#4FB3A9] to-[#2e8b82] text-lg font-bold text-white shadow-[0_4px_15px_rgba(79,179,169,0.3)]">
            AA
          </div>
          <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold tracking-tight text-heading">
            Create your account
          </h1>
          <p className="mt-1 text-sm text-caption">
            Register to start planning your courses
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          className="glass-card space-y-4"
        >
          {error && (
            <div className="rounded-xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger">
              {error}
            </div>
          )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="full_name"
                className="mb-1.5 block text-sm font-medium text-body-text"
              >
                Full name
              </label>
              <input
                id="full_name"
                type="text"
                required
                value={form.full_name}
                onChange={(e) => set("full_name", e.target.value)}
                className="glass-input"
              />
            </div>
            <div>
              <label
                htmlFor="student_id"
                className="mb-1.5 block text-sm font-medium text-body-text"
              >
                Student ID
              </label>
              <input
                id="student_id"
                type="text"
                required
                value={form.student_id}
                onChange={(e) => set("student_id", e.target.value)}
                className="glass-input"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="username"
              className="mb-1.5 block text-sm font-medium text-body-text"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              required
              autoComplete="username"
              value={form.username}
              onChange={(e) => set("username", e.target.value)}
              className="glass-input"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-sm font-medium text-body-text"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
              className="glass-input"
            />
            <p className="mt-1 text-xs text-caption">At least 8 characters</p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="department"
                className="mb-1.5 block text-sm font-medium text-body-text"
              >
                Department
              </label>
              <select
                id="department"
                value={form.department}
                onChange={(e) => set("department", e.target.value)}
                className="glass-select"
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="level"
                className="mb-1.5 block text-sm font-medium text-body-text"
              >
                Level
              </label>
              <select
                id="level"
                value={form.level}
                onChange={(e) => set("level", e.target.value)}
                className="glass-select"
              >
                {LEVELS.map((l) => (
                  <option key={l} value={l}>
                    Level {l}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="primary-gradient-btn w-full"
          >
            {submitting ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-caption">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-[#75d7cc] hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
