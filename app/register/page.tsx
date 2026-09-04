"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";

const LEVELS = [1, 2, 3, 4];

// Exact backend Department enum values (models/enums.py); labels via i18n.
const DEPARTMENTS = ["AI_GENERAL", "CYBER_SECURITY", "BIO_INFORMATICS", "UNDECIDED"] as const;

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const { t, lang } = useLanguage();
  const [form, setForm] = useState({
    username: "",
    password: "",
    full_name: "",
    student_id: "",
    department: "",
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
      dir={lang === "ar" ? "rtl" : "ltr"}
      className="relative flex min-h-screen flex-col items-center justify-center px-4 py-12 overflow-hidden"
    >
      {/* Background overlay */}
      <div className="absolute inset-0 z-0 bg-surface" />

      <div className="relative z-10 w-full max-w-[460px] px-container-padding">
        <div className="app-card rounded-xl p-6 shadow-2xl flex flex-col gap-4">
          {/* Header */}
          <div className="text-center mb-2">
            <span className="material-symbols-outlined text-primary text-4xl mb-1">school</span>
            <h1 className="font-[family-name:var(--font-heading)] text-headline-md text-primary font-semibold">
              {t("register.title")}
            </h1>
            <p className="text-body-md text-on-surface-variant mt-1">{t("register.subtitle")}</p>
          </div>

          {error && (
            <div className="p-3 bg-error-container text-on-error-container rounded-lg text-label-sm font-semibold">
              {error}
            </div>
          )}

          {/* Form */}
          <form className="flex flex-col gap-4" onSubmit={onSubmit}>
            {/* Full Name */}
            <div className="flex flex-col gap-1">
              <label className="text-label-sm text-on-surface-variant font-semibold uppercase tracking-wider" htmlFor="full_name">
                {t("register.fullName")}
              </label>
              <input
                className="app-input rounded px-4 py-2 w-full text-body-md placeholder:text-on-surface-variant/50"
                id="full_name"
                placeholder={t("register.fullNamePlaceholder")}
                required
                type="text"
                value={form.full_name}
                onChange={(e) => set("full_name", e.target.value)}
              />
            </div>

            {/* Username */}
            <div className="flex flex-col gap-1">
              <label className="text-label-sm text-on-surface-variant font-semibold uppercase tracking-wider" htmlFor="username">
                {t("register.username")}
              </label>
              <input
                className="app-input rounded px-4 py-2 w-full text-body-md placeholder:text-on-surface-variant/50"
                id="username"
                placeholder="jdoe_academic"
                required
                type="text"
                autoComplete="username"
                value={form.username}
                onChange={(e) => set("username", e.target.value)}
              />
            </div>

            {/* Student ID */}
            <div className="flex flex-col gap-1">
              <label className="text-label-sm text-on-surface-variant font-semibold uppercase tracking-wider" htmlFor="student_id">
                {t("register.studentId")}
              </label>
              <input
                className="app-input rounded px-4 py-2 w-full text-body-md placeholder:text-on-surface-variant/50"
                id="student_id"
                placeholder="202400123"
                required
                type="text"
                value={form.student_id}
                onChange={(e) => set("student_id", e.target.value)}
              />
            </div>

            {/* Department */}
            <div className="flex flex-col gap-1">
              <label className="text-label-sm text-on-surface-variant font-semibold uppercase tracking-wider" htmlFor="department">
                {t("register.department")}
              </label>
              <div className="relative">
                <select
                  className="app-input rounded px-4 py-2 w-full text-body-md appearance-none cursor-pointer"
                  id="department"
                  name="department"
                  required
                  value={form.department}
                  onChange={(e) => set("department", e.target.value)}
                >
                  <option value="" disabled>
                    {t("register.departmentPlaceholder")}
                  </option>
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>
                      {t(`dept.${d}`)}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute end-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">
                  expand_more
                </span>
              </div>
            </div>

            {/* Level */}
            <div className="flex flex-col gap-1">
              <label className="text-label-sm text-on-surface-variant font-semibold uppercase tracking-wider" htmlFor="level">
                {t("register.level")}
              </label>
              <div className="relative">
                <select
                  className="app-input rounded px-4 py-2 w-full text-body-md appearance-none cursor-pointer"
                  id="level"
                  value={form.level}
                  onChange={(e) => set("level", e.target.value)}
                >
                  {LEVELS.map((l) => (
                    <option key={l} value={l}>
                      Level {l}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute end-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">
                  expand_more
                </span>
              </div>
              <p className="text-[11px] text-on-surface-variant/70">
                {t("register.levelHint")}
              </p>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1">
              <label className="text-label-sm text-on-surface-variant font-semibold uppercase tracking-wider" htmlFor="password">
                {t("register.password")}
              </label>
              <input
                className="app-input rounded px-4 py-2 w-full text-body-md placeholder:text-on-surface-variant/50"
                id="password"
                placeholder="••••••••"
                required
                type="password"
                autoComplete="new-password"
                minLength={8}
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
              />
            </div>

            {/* Action */}
            <button
              className="group mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--c-primary)] py-3.5 text-sm font-bold text-white shadow-[0_4px_16px_-4px_rgba(30,63,145,0.4)] transition-all hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
              type="submit"
              disabled={submitting}
            >
              {submitting ? t("register.submitting") : t("register.submit")}
              <span className="material-symbols-outlined text-lg transition-transform duration-200 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 rtl:-scale-x-100">
                arrow_forward
              </span>
            </button>
          </form>

          {/* Footer Link */}
          <div className="text-center mt-2">
            <Link
              href="/login"
              className="text-body-md text-on-surface-variant hover:text-primary transition-colors inline-flex items-center gap-1 group"
            >
              {t("register.haveAccount")}{" "}
              <span className="text-primary font-medium group-hover:underline">{t("register.logIn")}</span>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

