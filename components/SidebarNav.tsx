"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import GraduationModal from "@/components/GraduationModal";
import {
  IconDashboard,
  IconSmartToy,
  IconSchool,
  IconDescription,
  IconLogout,
} from "@/components/Icons";

interface NavItem {
  href: string;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", Icon: IconDashboard },
  { href: "/chat", label: "AI Advisor", Icon: IconSmartToy },
  { href: "/courses", label: "Registration", Icon: IconSchool },
  { href: "/history", label: "Transcript", Icon: IconDescription },
];

function standing(gpa: number) {
  return gpa >= 2.0
    ? { label: "Good Standing", color: "text-success", dot: "green" as const }
    : { label: "Academic Probation", color: "text-danger", dot: "red" as const };
}

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function SidebarNav() {
  const pathname = usePathname();
  const { student, logout } = useAuth();
  const [planOpen, setPlanOpen] = useState(false);
  const st = student ? standing(student.gpa) : null;

  return (
    <>
      <aside className="fixed left-0 top-0 z-40 flex h-screen w-[260px] flex-col border-r border-white/10 bg-[rgba(20,35,33,0.85)] backdrop-blur-xl">
        <div className="flex items-center gap-3 px-6 py-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#4FB3A9] to-[#2e8b82] text-sm font-bold text-white">
            AA
          </div>
          <span className="font-[family-name:var(--font-heading)] text-lg font-semibold text-heading">
            Academic Advisor
          </span>
        </div>

        <nav className="flex-1 space-y-1 px-3" aria-label="Main">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                  active
                    ? "border-l-[3px] border-l-[#75d7cc] bg-primary-100 pl-[13px] text-[#75d7cc]"
                    : "border-l-[3px] border-l-transparent text-body-text hover:bg-glass-hover hover:text-heading"
                }`}
              >
                <item.Icon className="h-5 w-5 opacity-80" />
                {item.label}
              </Link>
            );
          })}

          <button
            onClick={() => setPlanOpen(true)}
            title="View your graduation plan"
            className="group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-body-text transition-all duration-200 hover:bg-glass-hover hover:text-heading"
          >
            <IconSchool className="h-5 w-5 opacity-80" />
            Graduation Plan
          </button>
        </nav>

        <div className="border-t border-white/5 px-3 py-4">
          {student && (
            <>
              {st && (
                <div className="mb-3 flex items-center gap-2 rounded-xl bg-glass px-4 py-2.5 text-xs font-medium">
                  <span className={`status-dot ${st.dot}`} />
                  <span className={st.color}>{st.label}</span>
                </div>
              )}
              <div className="flex items-center gap-3 px-3 py-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-200 text-xs font-semibold text-[#75d7cc]">
                  {initials(student.full_name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-heading">
                    {student.full_name}
                  </p>
                  <p className="truncate text-xs text-caption">
                    {student.student_id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => logout()}
                className="mt-2 flex w-full items-center gap-2 rounded-xl px-4 py-2.5 text-sm text-body-text transition-colors hover:bg-glass-hover hover:text-heading"
              >
                <IconLogout className="h-5 w-5 opacity-70" />
                Logout
              </button>
            </>
          )}
        </div>
      </aside>

      {planOpen && <GraduationModal onClose={() => setPlanOpen(false)} />}
    </>
  );
}
