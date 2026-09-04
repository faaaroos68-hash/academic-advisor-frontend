"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";

export default function LoginPage() {
  const router = useRouter();
  const { login, student, loading } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [registered, setRegistered] = useState(false);

  useEffect(() => {
    if (!loading && student) router.replace("/dashboard");
  }, [loading, student, router]);

  useEffect(() => {
    if (window.location.search.includes("registered=1")) {
      setRegistered(true);
    }
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(username, password);
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main
      dir={lang === "ar" ? "rtl" : "ltr"}
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-12 md:px-6"
    >
      {/* Campus photo background */}
      <div className="absolute inset-0 -z-10" aria-hidden="true">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/images/campus-archway.jpg')" }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: theme === "dark"
              ? "linear-gradient(180deg, rgba(10,15,24,0.70) 0%, rgba(10,15,24,0.50) 45%, rgba(10,15,24,0.80) 100%)"
              : "linear-gradient(180deg, rgba(240,244,248,0.30) 0%, rgba(240,244,248,0.60) 45%, rgba(240,244,248,0.80) 100%)",
          }}
        />
      </div>

      {/* Language + Theme toggles */}
      <div className="fixed top-4 end-4 z-20 flex items-center gap-2">
        <div
          className="flex items-center rounded-full border border-glass-border bg-glass p-0.5 shadow-sm backdrop-blur-md"
          role="group"
          aria-label="Language"
        >
          {(["en", "ar"] as const).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLang(l)}
              aria-pressed={lang === l}
              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide transition-colors ${
                lang === l
                  ? "bg-primary text-on-primary"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={t("theme.toggle")}
          title={t("theme.toggle")}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-glass-border bg-glass text-primary shadow-sm backdrop-blur-md transition-colors hover:bg-glass-hover"
        >
          <span className="material-symbols-outlined text-base">
            {theme === "dark" ? "light_mode" : "dark_mode"}
          </span>
        </button>
      </div>

      {/* White card */}
      <div className="w-full max-w-[420px] animate-fade-in-up">
        <div className="rounded-[20px] border border-[var(--c-outline-variant)] bg-white p-7 shadow-[0_8px_40px_-8px_rgba(26,39,68,0.12)] sm:p-9">
          {/* Logo */}
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center">
              <svg viewBox="0 0 80 80" className="h-16 w-16" aria-hidden="true">
                <path d="M20 55 L40 15 L60 55 Z" fill="none" stroke="#1e3f91" strokeWidth="5" strokeLinejoin="round" />
                <path d="M52 38 L65 28 L65 48 Z" fill="#e8852a" />
              </svg>
            </div>
            <h1 className="text-balance text-[26px] font-bold leading-tight text-[var(--c-navy)]">
              {t("login.welcome")}
            </h1>
            <p className="mt-2 text-sm text-[var(--c-on-surface-variant)]">
              {t("login.subtitle")}
            </p>
          </div>

          {registered && (
            <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
              Account created successfully — please sign in.
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={onSubmit}>
            {/* Student ID */}
            <div className="space-y-1.5">
              <label
                className="block text-[11px] font-bold uppercase tracking-wider text-[var(--c-on-surface-variant)]"
                htmlFor="student_id"
              >
                {t("login.studentId")}
              </label>
              <div className="relative">
                <span className="material-symbols-outlined pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-xl text-[var(--c-outline)]">
                  person
                </span>
                <input
                  className="w-full rounded-lg border border-[var(--c-outline-variant)] bg-white py-3 ps-10 pe-4 text-sm text-[var(--c-on-surface)] placeholder:text-[var(--c-outline)] focus:border-[var(--c-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--c-primary)]"
                  id="student_id"
                  name="username"
                  placeholder={t("login.studentIdPlaceholder")}
                  required
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  className="text-[11px] font-bold uppercase tracking-wider text-[var(--c-on-surface-variant)]"
                  htmlFor="password"
                >
                  {t("login.password")}
                </label>
                <a
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  className="text-[11px] font-bold uppercase tracking-wider text-[var(--c-primary)] transition-colors hover:underline"
                >
                  {t("login.forgot")}
                </a>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-xl text-[var(--c-outline)]">
                  lock
                </span>
                <input
                  className="w-full rounded-lg border border-[var(--c-outline-variant)] bg-white py-3 ps-10 pe-12 text-sm text-[var(--c-on-surface)] placeholder:text-[var(--c-outline)] focus:border-[var(--c-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--c-primary)]"
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  required
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? t("login.hidePassword") : t("login.showPassword")}
                  aria-pressed={showPassword}
                  className="absolute end-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-[var(--c-outline)] transition-colors hover:text-[var(--c-on-surface)]"
                >
                  <span className="material-symbols-outlined text-xl">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            {/* Submit — primary blue button */}
            <button
              className="group mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--c-primary)] py-3.5 text-sm font-bold text-white shadow-[0_4px_16px_-4px_rgba(30,63,145,0.4)] transition-all hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
              type="submit"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span
                    className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                    aria-hidden="true"
                  />
                  {t("login.submitting")}
                </>
              ) : (
                <>
                  {t("login.submit")}
                  <span className="material-symbols-outlined text-lg transition-transform duration-200 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 rtl:-scale-x-100">
                    arrow_forward
                  </span>
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="mt-6 text-center text-sm text-[var(--c-on-surface-variant)]">
            {t("login.newHere")}{" "}
            <Link
              href="/register"
              className="font-semibold text-[var(--c-primary)] transition-colors hover:underline"
            >
              {t("login.createAccount")}
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
