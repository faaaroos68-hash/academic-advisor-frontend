"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";

const FEATURES = [
  {
    icon: "school",
    title: "GPA Tracking",
    titleAr: "تتبع المعدل التراكمي",
    desc: "Monitor your academic performance in real-time with detailed analytics and grade projections.",
    descAr: "تتبع أدائك الأكاديمي في الوقت الحقيقي مع تحليلات مفصلة وتوقعات الدرجات.",
  },
  {
    icon: "how_to_reg",
    title: "Course Registration",
    titleAr: "تسجيل المواد",
    desc: "Browse available courses, check prerequisites, and plan your semester schedule effortlessly.",
    descAr: "تصفح المواد المتاحة، تحقق من المتطلبات، وخطط لجدول فصلك بسهولة.",
  },
  {
    icon: "smart_toy",
    title: "AI Academic Advisor",
    titleAr: "المستشار الأكاديمي الذكي",
    desc: "Get personalized academic advice powered by AI — eligibility checks, GPA projections, and study plans.",
    descAr: "احصل على نصائح أكاديمية مخصصة مدعومة بالذكاء الاصطناعي — فحص الأهلية، توقعات المعدل، وخطة الدراسة.",
  },
  {
    icon: "account_tree",
    title: "Curriculum Planning",
    titleAr: "التخطيط المناهج",
    desc: "Visualize your degree path, track completed courses, and see what's ahead on your academic journey.",
    descAr: "تخيل مسار دراستك، تتبع المواد المكتملة، وشاهد ما ينتظرك في رحلتك الأكاديمية.",
  },
];

export default function LandingPage() {
  const { lang, setLang, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  return (
    <main
      dir={lang === "ar" ? "rtl" : "ltr"}
      className="min-h-screen bg-background text-on-background"
    >
      {/* Header */}
      <header className="fixed top-0 inset-x-0 z-50 border-b border-outline-variant bg-surface">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <svg viewBox="0 0 80 80" className="h-10 w-10" aria-hidden="true">
              <path d="M20 55 L40 15 L60 55 Z" fill="none" stroke="var(--c-primary)" strokeWidth="5" strokeLinejoin="round" />
              <path d="M52 38 L65 28 L65 48 Z" fill="var(--c-tertiary)" />
            </svg>
            <span className="text-xl font-bold text-primary font-[family-name:var(--font-heading)]">
              Delta University
            </span>
          </Link>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors">
              {lang === "ar" ? "المميزات" : "Features"}
            </a>
            <a href="#about" className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors">
              {lang === "ar" ? "حول" : "About"}
            </a>
            <a href="#contact" className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors">
              {lang === "ar" ? "اتصل بنا" : "Contact"}
            </a>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Language + Theme toggles */}
            <div className="flex items-center rounded-full border border-outline-variant bg-surface p-0.5" role="group" aria-label="Language">
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
              className="flex h-8 w-8 items-center justify-center rounded-full border border-outline-variant bg-surface text-on-surface-variant hover:text-on-surface hover:bg-surface-hover transition-colors"
            >
              <span className="material-symbols-outlined text-base">
                {theme === "dark" ? "light_mode" : "dark_mode"}
              </span>
            </button>
            <Link
              href="/login"
              className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-on-primary shadow-[0_2px_8px_-2px_rgba(30,63,145,0.4)] transition-all hover:brightness-110 active:scale-[0.98]"
            >
              {lang === "ar" ? "تسجيل الدخول" : "Log in"}
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 md:pt-32 md:pb-28 overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0 -z-10">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/images/campus-archway.jpg')" }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: theme === "dark"
                ? "linear-gradient(180deg, rgba(10,15,24,0.80) 0%, rgba(10,15,24,0.60) 50%, rgba(10,15,24,0.90) 100%)"
                : "linear-gradient(180deg, rgba(240,244,248,0.75) 0%, rgba(240,244,248,0.50) 50%, rgba(240,244,248,0.85) 100%)",
            }}
          />
        </div>

        <div className="mx-auto max-w-7xl px-6 text-center">
          <div className="mx-auto max-w-3xl">
            <svg viewBox="0 0 80 80" className="h-20 w-20 mx-auto mb-6" aria-hidden="true">
              <path d="M20 55 L40 15 L60 55 Z" fill="none" stroke="var(--c-primary)" strokeWidth="4" strokeLinejoin="round" />
              <path d="M52 38 L65 28 L65 48 Z" fill="var(--c-tertiary)" />
            </svg>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary leading-tight font-[family-name:var(--font-heading)]">
              {lang === "ar" ? "رحلتك الأكاديمية، بمجرد نظرة" : "Your academic journey, simplified"}
            </h1>
            <p className="mt-6 text-lg md:text-xl text-on-surface-variant max-w-2xl mx-auto">
              {lang === "ar"
                ? "منصة Delta University للطلاب — تتبع تقدمك، سجّل في المواد، واحصل على نصائح أكاديمية ذكية، كل ذلك في مكان واحد."
                : "The Delta University student portal — track your progress, register for courses, and get smart academic advising, all in one place."}
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/login"
                className="rounded-xl bg-primary px-8 py-4 text-base font-bold text-on-primary shadow-[0_4px_20px_-4px_rgba(30,63,145,0.5)] transition-all hover:brightness-110 active:scale-[0.98] flex items-center gap-2"
              >
                {lang === "ar" ? "سجّل الدخول" : "Get Started"}
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </Link>
              <Link
                href="/register"
                className="rounded-xl border-2 border-primary/30 px-8 py-4 text-base font-semibold text-primary transition-all hover:bg-primary/5 active:scale-[0.98]"
              >
                {lang === "ar" ? "إنشاء حساب" : "Create Account"}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-surface">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-primary font-[family-name:var(--font-heading)]">
              {lang === "ar" ? "كل ما تحتاجه في مكان واحد" : "Everything you need, in one place"}
            </h2>
            <p className="mt-4 text-on-surface-variant max-w-2xl mx-auto">
              {lang === "ar"
                ? "أدوات ذكية مصممة لمساعدتك على النجاح في رحلتك الأكاديمية."
                : "Smart tools designed to help you succeed in your academic journey."}
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className="app-card rounded-2xl p-6 transition-all hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <span className="material-symbols-outlined text-2xl text-primary">{f.icon}</span>
                </div>
                <h3 className="text-lg font-bold text-on-surface mb-2 font-[family-name:var(--font-heading)]">
                  {lang === "ar" ? f.titleAr : f.title}
                </h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  {lang === "ar" ? f.descAr : f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="app-card rounded-3xl p-10 md:p-16 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-primary font-[family-name:var(--font-heading)] mb-6">
              {lang === "ar" ? "عن جامعة Delta" : "About Delta University"}
            </h2>
            <p className="text-on-surface-variant max-w-3xl mx-auto text-lg leading-relaxed">
              {lang === "ar"
                ? "جامعة Delta هي مؤسسة تعليمية رائدة مكرسة لتمكين الطلاب من تحقيق أهدافهم الأكاديمية والمهنية. 포트ال الطلاب هو بوابتك الرقمية لإدارة رحلتك الأكاديمية."
                : "Delta University is a leading educational institution dedicated to empowering students to achieve their academic and professional goals. The student portal is your digital gateway to managing your academic journey."}
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-surface">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary font-[family-name:var(--font-heading)] mb-6">
            {lang === "ar" ? "جاهز للبدء؟" : "Ready to get started?"}
          </h2>
          <p className="text-on-surface-variant max-w-xl mx-auto mb-10">
            {lang === "ar"
              ? "انضم إلى آلاف الطلاب الذين يستخدمون بوابة جامعة Delta لإدارة نجاحهم الأكاديمي."
              : "Join thousands of students using the Delta University portal to manage their academic success."}
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-4 text-base font-bold text-on-primary shadow-[0_4px_20px_-4px_rgba(30,63,145,0.5)] transition-all hover:brightness-110 active:scale-[0.98]"
          >
            {lang === "ar" ? "إنشاء حساب مجاني" : "Create Free Account"}
            <span className="material-symbols-outlined text-lg">arrow_forward</span>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="border-t border-outline-variant py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <svg viewBox="0 0 80 80" className="h-8 w-8" aria-hidden="true">
                <path d="M20 55 L40 15 L60 55 Z" fill="none" stroke="var(--c-primary)" strokeWidth="5" strokeLinejoin="round" />
                <path d="M52 38 L65 28 L65 48 Z" fill="var(--c-tertiary)" />
              </svg>
              <span className="text-lg font-bold text-primary font-[family-name:var(--font-heading)]">
                Delta University
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm text-on-surface-variant">
              <a href="#" className="hover:text-primary transition-colors">
                {lang === "ar" ? "الخصوصية" : "Privacy"}
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                {lang === "ar" ? "الشروط" : "Terms"}
              </a>
              <a href="mailto:info@delta.edu" className="hover:text-primary transition-colors">
                info@delta.edu
              </a>
            </div>
            <p className="text-xs text-on-surface-variant/60">
              &copy; {new Date().getFullYear()} Delta University. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
