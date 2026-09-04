"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import GraduationModal from "@/components/GraduationModal";

interface NavItem {
  href: string;
  label: string;
  icon: string;
  isButton?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: "home" },
  { href: "#", label: "Study Plan", icon: "calendar_month", isButton: true },
  { href: "/courses", label: "Registration", icon: "person_add" },
  { href: "/history", label: "Transcript", icon: "description" },
  { href: "/analytics", label: "Analytics", icon: "bar_chart" },
  { href: "/gpa-calculator", label: "GPA Calculator", icon: "calculate" },
  { href: "/chat", label: "AI Advisor", icon: "smart_toy" },
  { href: "/notifications", label: "Notifications", icon: "notifications" },
  { href: "/profile", label: "Profile", icon: "person" },
  { href: "/settings", label: "Settings", icon: "settings" },
];

export default function SidebarNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { student, logout } = useAuth();
  const { lang, setLang } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [planOpen, setPlanOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => { setMobileOpen(false); }, [pathname]);
  useEffect(() => { document.body.style.overflow = mobileOpen ? "hidden" : ""; return () => { document.body.style.overflow = ""; }; }, [mobileOpen]);
  useEffect(() => {
    if (!mobileOpen) return;
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") setMobileOpen(false); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  async function handleLogout() {
    try { await logout(); } finally { router.push("/login"); }
  }

  function isActive(item: NavItem) {
    if (item.isButton) return false;
    return item.href === "/courses" ? pathname === "/courses" : pathname === item.href;
  }

  function renderNavItem(item: NavItem, onNavigate?: () => void) {
    const active = isActive(item);
    if (item.isButton) {
      return (
        <button
          key={item.label}
          onClick={() => { setPlanOpen(true); onNavigate?.(); }}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-on-surface-variant hover:bg-surface-container transition-colors w-full text-left"
        >
          <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
          <span>{item.label}</span>
        </button>
      );
    }
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={onNavigate}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
          active
            ? "bg-tertiary text-white font-semibold"
            : "text-on-surface-variant hover:bg-surface-container"
        }`}
      >
        <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
        <span>{item.label}</span>
      </Link>
    );
  }

  function BrandBlock() {
    return (
      <div className="flex items-center gap-3 px-3 py-2">
        <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center">
          <span className="material-symbols-outlined text-primary text-2xl">school</span>
        </div>
        <div>
          <h1 className="text-[15px] font-bold text-primary leading-tight font-[family-name:var(--font-heading)]">Delta University</h1>
          <p className="text-[13px] font-semibold text-on-surface leading-tight">Delta Portal</p>
          <p className="text-[11px] text-on-surface-variant">Student Portal</p>
        </div>
      </div>
    );
  }

  function FooterBlock({ onNavigate }: { onNavigate?: () => void }) {
    return (
      <div className="px-4 mt-4 space-y-3">
        <button
          className="w-full bg-tertiary text-white py-2.5 px-4 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 hover:brightness-110 transition-colors"
          onClick={() => { window.location.href = "/chat"; onNavigate?.(); }}
        >
          <span className="material-symbols-outlined text-[18px]">smart_toy</span>
          AI Advisor
        </button>
        <div className="flex items-center gap-2 px-1 py-2">
          <span className="material-symbols-outlined text-tertiary text-[18px]">verified_user</span>
          <span className="text-sm">
            Academic Standing:{" "}
            <span className={`font-semibold ${student && student.gpa >= 2.0 ? "text-success" : "text-danger"}`}>
              {student && student.gpa >= 2.0 ? "Good" : "Probation"}
            </span>
          </span>
        </div>
        <div className="flex items-center gap-2 pt-2 border-t border-outline-variant">
          <div className="flex items-center rounded-lg border border-outline-variant bg-surface p-0.5 flex-1">
            {(["en", "ar"] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLang(l)}
                className={`flex-1 rounded-md px-2 py-1 text-[11px] font-semibold uppercase transition-colors ${
                  lang === l ? "bg-primary text-on-primary" : "text-on-surface-variant"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-outline-variant bg-surface text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">
              {theme === "dark" ? "light_mode" : "dark_mode"}
            </span>
          </button>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg border border-outline-variant bg-surface text-on-surface-variant hover:text-danger hover:border-danger/30 transition-colors text-sm font-medium"
        >
          <span className="material-symbols-outlined text-[16px]">logout</span>
          Log out
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Desktop sidebar */}
      <nav className="hidden md:flex flex-col h-screen py-4 fixed left-0 top-0 w-[240px] bg-surface border-r border-outline-variant z-50">
        <div className="px-4 mb-4">
          <BrandBlock />
        </div>
        <div className="flex-1 overflow-y-auto px-3 flex flex-col gap-0.5">
          {NAV_ITEMS.map((item) => renderNavItem(item))}
        </div>
        <div className="px-3">
          <FooterBlock />
        </div>
      </nav>

      {/* Mobile top bar */}
      <header className="md:hidden fixed top-0 inset-x-0 z-50 h-14 flex items-center justify-between px-4 bg-surface border-b border-outline-variant">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-primary text-lg">school</span>
          </div>
          <span className="text-sm font-bold text-primary truncate font-[family-name:var(--font-heading)]">Delta University</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex items-center rounded-lg border border-outline-variant bg-surface p-0.5" role="group" aria-label="Language">
            {(["en", "ar"] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLang(l)}
                aria-pressed={lang === l}
                className={`rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase transition-colors ${
                  lang === l ? "bg-primary text-on-primary" : "text-on-surface-variant"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-outline-variant bg-surface text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined text-sm">
              {theme === "dark" ? "light_mode" : "dark_mode"}
            </span>
          </button>
          <button
            type="button"
            aria-label="Open navigation menu"
            onClick={() => setMobileOpen(true)}
            className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-xl">menu</span>
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-[60]">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <nav className="absolute inset-y-0 left-0 w-[280px] max-w-[85vw] bg-surface border-r border-outline-variant flex flex-col py-4 shadow-xl animate-fade-in-up">
            <div className="px-4 mb-4 flex items-start justify-between">
              <BrandBlock />
              <button
                type="button"
                aria-label="Close navigation menu"
                onClick={() => setMobileOpen(false)}
                className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-3 flex flex-col gap-0.5">
              {NAV_ITEMS.map((item) => renderNavItem(item, () => setMobileOpen(false)))}
            </div>
            <div className="px-3">
              <FooterBlock onNavigate={() => setMobileOpen(false)} />
            </div>
          </nav>
        </div>
      )}

      {planOpen && <GraduationModal onClose={() => setPlanOpen(false)} />}
    </>
  );
}
