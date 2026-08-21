"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { student, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !student) {
      router.replace("/login");
    }
  }, [loading, student, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: "linear-gradient(135deg, #0f1414 0%, #132422 50%, #11191c 100%)" }}>
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 animate-pulse rounded-full bg-[#75d7cc]" />
          <span className="text-sm text-body-text">Loading…</span>
        </div>
      </div>
    );
  }

  if (!student) return null;

  return <>{children}</>;
}
