"use client";

import { useState } from "react";
import Link from "next/link";
import PageShell from "@/components/PageShell";

export default function SettingsPage() {
  const [darkMode] = useState(true);
  const [language, setLanguage] = useState("en");
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [deadlineReminders, setDeadlineReminders] = useState(false);
  const [gradeUpdates, setGradeUpdates] = useState(false);
  const [profileVisibility, setProfileVisibility] = useState("public");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const navItems = [
    { label: "Profile", href: "/profile", active: false },
    { label: "Preferences", href: "/settings", active: true },
    { label: "Notifications", href: "/notifications", active: false },
    { label: "Privacy", href: "/privacy", active: false },
  ];

  return (
    <PageShell>
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-headline-md font-[family-name:var(--font-heading)] text-on-surface mb-2">
            Settings
          </h1>
          <p className="text-body-md text-on-surface-variant">
            Customize your experience
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Left Sidebar Nav */}
          <nav className="md:w-56 shrink-0">
            <div className="app-card rounded-xl p-2">
              <ul className="space-y-1">
                {navItems.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className={`block px-4 py-2.5 rounded-lg text-label-sm font-[family-name:var(--font-heading)] transition-colors ${
                        item.active
                          ? "bg-primary/10 text-primary"
                          : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          {/* Right Content Area */}
          <div className="flex-1 space-y-6">
            {/* Appearance */}
            <section className="app-card rounded-xl p-6">
              <h2 className="text-headline-md font-[family-name:var(--font-heading)] text-on-surface mb-5">
                Appearance
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-body-md text-on-surface font-medium">
                      Dark Mode
                    </p>
                    <p className="text-label-sm text-on-surface-variant mt-0.5">
                      Currently active
                    </p>
                  </div>
                  <div className="w-11 h-6 bg-primary rounded-full relative">
                    <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5" />
                  </div>
                </div>

                <div className="border-t border-outline-variant pt-4">
                  <label className="block text-label-sm text-on-surface-variant mb-2">
                    Language
                  </label>
                  <select
                    className="app-input w-full px-4 py-3 text-on-surface rounded-lg appearance-none"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                  >
                    <option value="en">English</option>
                    <option value="ar">Arabic</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Notifications */}
            <section className="app-card rounded-xl p-6">
              <h2 className="text-headline-md font-[family-name:var(--font-heading)] text-on-surface mb-5">
                Notifications
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-body-md text-on-surface font-medium">
                      Email Notifications
                    </p>
                    <p className="text-label-sm text-on-surface-variant mt-0.5">
                      Receive updates via email
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEmailNotifications(!emailNotifications)}
                    className={`w-11 h-6 rounded-full relative transition-colors ${
                      emailNotifications ? "bg-primary" : "bg-surface-container-highest"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${
                        emailNotifications ? "right-0.5" : "left-0.5"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between border-t border-outline-variant pt-4">
                  <div>
                    <p className="text-body-md text-on-surface font-medium">
                      Deadline Reminders
                    </p>
                    <p className="text-label-sm text-on-surface-variant mt-0.5">
                      Get reminded before deadlines
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDeadlineReminders(!deadlineReminders)}
                    className={`w-11 h-6 rounded-full relative transition-colors ${
                      deadlineReminders ? "bg-primary" : "bg-surface-container-highest"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${
                        deadlineReminders ? "right-0.5" : "left-0.5"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between border-t border-outline-variant pt-4">
                  <div>
                    <p className="text-body-md text-on-surface font-medium">
                      Grade Updates
                    </p>
                    <p className="text-label-sm text-on-surface-variant mt-0.5">
                      Notify when grades are posted
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setGradeUpdates(!gradeUpdates)}
                    className={`w-11 h-6 rounded-full relative transition-colors ${
                      gradeUpdates ? "bg-primary" : "bg-surface-container-highest"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${
                        gradeUpdates ? "right-0.5" : "left-0.5"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </section>

            {/* Privacy */}
            <section className="app-card rounded-xl p-6">
              <h2 className="text-headline-md font-[family-name:var(--font-heading)] text-on-surface mb-5">
                Privacy
              </h2>

              <div>
                <label className="block text-label-sm text-on-surface-variant mb-2">
                  Profile Visibility
                </label>
                <select
                  className="app-input w-full px-4 py-3 text-on-surface rounded-lg appearance-none"
                  value={profileVisibility}
                  onChange={(e) => setProfileVisibility(e.target.value)}
                >
                  <option value="public">Public</option>
                  <option value="students">Students Only</option>
                  <option value="private">Private</option>
                </select>
              </div>
            </section>

            {/* Save Button */}
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleSave}
                className="px-8 py-3 bg-primary text-on-primary-container rounded-lg font-medium font-[family-name:var(--font-heading)] hover:bg-primary-container transition-colors text-label-sm"
              >
                {saved ? "Saved!" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
