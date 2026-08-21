"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login, student, loading } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
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
      className="flex min-h-screen items-center justify-center px-4"
      style={{ background: "linear-gradient(135deg, #0f1414 0%, #132422 50%, #11191c 100%)" }}
    >
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#4FB3A9] to-[#2e8b82] text-lg font-bold text-white shadow-[0_4px_15px_rgba(79,179,169,0.3)]">
            AA
          </div>
          <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold tracking-tight text-heading">
            Academic Advisor
          </h1>
          <p className="mt-1 text-sm text-caption">
            Sign in to your student account
          </p>
        </div>

        {registered && (
          <div className="mb-4 rounded-xl border border-success/20 bg-success/10 px-4 py-3 text-sm text-success">
            Account created successfully — please sign in.
          </div>
        )}

        <form
          onSubmit={onSubmit}
          className="glass-card space-y-4"
        >
          {error && (
            <div className="rounded-xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger">
              {error}
            </div>
          )}
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
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="glass-input"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="primary-gradient-btn w-full"
          >
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-caption">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-medium text-[#75d7cc] hover:underline"
          >
            Register
          </Link>
        </p>
      </div>
    </main>
  );
}
