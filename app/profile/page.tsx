"use client";

import { useEffect, useState } from "react";
import PageShell from "@/components/PageShell";
import { get } from "@/lib/api";
import type { Student } from "@/lib/types";

type ProfileTab = "Profile" | "Preferences" | "Notifications" | "Privacy";

const NAV_ITEMS = [
  { label: "Profile" as ProfileTab, icon: "person" },
  { label: "Preferences" as ProfileTab, icon: "tune" },
  { label: "Notifications" as ProfileTab, icon: "notifications" },
  { label: "Privacy" as ProfileTab, icon: "shield_lock" },
];

export default function ProfilePage() {
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ProfileTab>("Profile");
  const [darkMode, setDarkMode] = useState(true);
  const [emailNotif, setEmailNotif] = useState(false);
  const [deadlineReminders, setDeadlineReminders] = useState(false);
  const [gradeUpdates, setGradeUpdates] = useState(false);
  const [profileVisibility, setProfileVisibility] = useState("public");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    get<{ student: Student }>("/api/me")
      .then((d) => setStudent(d.student))
      .catch(() => setStudent(null))
      .finally(() => setLoading(false));
  }, []);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <PageShell>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h2 className="font-[family-name:var(--font-heading)] text-display-lg-mobile md:text-display-lg text-on-surface mb-2">
            Profile &amp; Settings
          </h2>
          <p className="text-body-md text-on-surface-variant">
            Manage your account preferences and personal information.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-64 flex-shrink-0">
            <div className="app-card p-4 sticky top-24">
              <nav className="flex flex-col gap-2">
                {NAV_ITEMS.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => setActiveTab(item.label)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors rtl:text-right text-left w-full ${
                      activeTab === item.label
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-on-surface-variant hover:bg-surface-container"
                    }`}
                  >
                    <span className="material-symbols-outlined">{item.icon}</span>
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          <div className="flex-1 space-y-8">
            {activeTab === "Profile" && (
              <>
                <div className="app-card p-8 flex flex-col md:flex-row items-center gap-8">
                  <div className="relative group cursor-pointer">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-primary/30 group-hover:border-primary transition-colors bg-primary/30 flex items-center justify-center">
                      {loading ? (
                        <span className="w-24 h-24 rounded-full bg-surface-container animate-pulse inline-block" />
                      ) : (
                        <span className="text-primary text-3xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
                          {student?.full_name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "ST"}
                        </span>
                      )}
                    </div>
                    <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <span className="material-symbols-outlined text-white">photo_camera</span>
                    </div>
                  </div>
                   <div className="flex-1 text-center md:rtl:text-right md:text-left">
                    <h3 className="font-[family-name:var(--font-heading)] text-headline-md text-on-surface">
                      {loading ? <span className="inline-block h-7 w-40 bg-surface-container rounded animate-pulse" /> : student?.full_name}
                    </h3>
                    <div className="text-on-surface-variant text-body-md mb-4">
                      {loading ? <span className="inline-block h-5 w-56 bg-surface-container rounded animate-pulse mt-1" /> : `${student?.department} • Level ${student?.level}`}
                    </div>
                    <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                      <button className="btn-primary px-4 py-2 rounded-lg">
                        Upload New
                      </button>
                      <button className="btn-secondary px-4 py-2 rounded-lg">Remove</button>
                    </div>
                  </div>
                </div>

                <div className="app-card p-8">
                  <h4 className="font-[family-name:var(--font-heading)] text-headline-md text-on-surface mb-6">Personal Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="stat-label">First Name</label>
                      <input type="text" disabled readOnly value={loading ? "" : student?.full_name?.split(" ")[0] || ""} placeholder={loading ? "Loading..." : ""} className="app-input w-full rounded-lg px-4 py-3 text-on-surface focus:ring-0 disabled:opacity-60" />
                    </div>
                    <div className="space-y-2">
                      <label className="stat-label">Last Name</label>
                      <input type="text" disabled readOnly value={loading ? "" : student?.full_name?.split(" ").slice(1).join(" ") || ""} placeholder={loading ? "Loading..." : ""} className="app-input w-full rounded-lg px-4 py-3 text-on-surface focus:ring-0 disabled:opacity-60" />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="stat-label">Student ID</label>
                      <div className="flex">
                        <input type="text" disabled readOnly value={loading ? "" : student?.student_id || ""} placeholder={loading ? "Loading..." : ""} className="app-input w-full rounded-lg px-4 py-3 text-on-surface-variant opacity-70 cursor-not-allowed" />
                        <span className="ml-2 flex items-center justify-center p-3 text-primary bg-primary/10 rounded-lg">
                          <span className="material-symbols-outlined">verified</span>
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="stat-label">Department</label>
                      <input type="text" disabled readOnly value={loading ? "" : student?.department || ""} placeholder={loading ? "Loading..." : ""} className="app-input w-full rounded-lg px-4 py-3 text-on-surface focus:ring-0 disabled:opacity-60" />
                    </div>
                    <div className="space-y-2">
                      <label className="stat-label">Level</label>
                      <input type="text" disabled readOnly value={loading ? "" : `Level ${student?.level || ""}`} placeholder={loading ? "Loading..." : ""} className="app-input w-full rounded-lg px-4 py-3 text-on-surface focus:ring-0 disabled:opacity-60" />
                    </div>
                  </div>
                  <div className="flex justify-end gap-4 mt-8 border-t border-outline-variant pt-8">
                    <button className="btn-secondary px-6 py-2.5 rounded-lg">Cancel</button>
                    <button className="btn-primary px-6 py-2.5 rounded-lg">
                      Save Changes
                    </button>
                  </div>
                </div>
              </>
            )}

            {activeTab === "Preferences" && (
              <div className="app-card p-8">
                <h4 className="font-[family-name:var(--font-heading)] text-headline-md text-on-surface mb-6">Appearance</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="stat-value">Dark Mode</p>
                      <p className="stat-label mt-0.5">Currently active</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDarkMode(!darkMode)}
                      className={`w-11 h-6 rounded-full relative transition-colors ${darkMode ? "bg-primary" : "bg-surface-container"}`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${darkMode ? "right-0.5" : "left-0.5"}`} />
                    </button>
                  </div>
                </div>
                <div className="flex justify-end mt-8 border-t border-outline-variant pt-6">
                  <button onClick={handleSave} className="btn-primary px-6 py-2.5 rounded-lg">
                    {saved ? "Saved!" : "Save Changes"}
                  </button>
                </div>
              </div>
            )}

            {activeTab === "Notifications" && (
              <div className="app-card p-8">
                <h4 className="font-[family-name:var(--font-heading)] text-headline-md text-on-surface mb-6">Notifications</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="stat-value">Email Notifications</p>
                      <p className="stat-label mt-0.5">Receive updates via email</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEmailNotif(!emailNotif)}
                      className={`w-11 h-6 rounded-full relative transition-colors ${emailNotif ? "bg-primary" : "bg-surface-container"}`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${emailNotif ? "right-0.5" : "left-0.5"}`} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between border-t border-outline-variant pt-4">
                    <div>
                      <p className="stat-value">Deadline Reminders</p>
                      <p className="stat-label mt-0.5">Get reminded before deadlines</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDeadlineReminders(!deadlineReminders)}
                      className={`w-11 h-6 rounded-full relative transition-colors ${deadlineReminders ? "bg-primary" : "bg-surface-container"}`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${deadlineReminders ? "right-0.5" : "left-0.5"}`} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between border-t border-outline-variant pt-4">
                    <div>
                      <p className="stat-value">Grade Updates</p>
                      <p className="stat-label mt-0.5">Notify when grades are posted</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setGradeUpdates(!gradeUpdates)}
                      className={`w-11 h-6 rounded-full relative transition-colors ${gradeUpdates ? "bg-primary" : "bg-surface-container"}`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${gradeUpdates ? "right-0.5" : "left-0.5"}`} />
                    </button>
                  </div>
                </div>
                <div className="flex justify-end mt-8 border-t border-outline-variant pt-6">
                  <button onClick={handleSave} className="btn-primary px-6 py-2.5 rounded-lg">
                    {saved ? "Saved!" : "Save Changes"}
                  </button>
                </div>
              </div>
            )}

            {activeTab === "Privacy" && (
              <div className="app-card p-8">
                <h4 className="font-[family-name:var(--font-heading)] text-headline-md text-on-surface mb-6">Privacy</h4>
                <div>
                  <label className="block stat-label mb-2">Profile Visibility</label>
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
                <div className="flex justify-end mt-8 border-t border-outline-variant pt-6">
                  <button onClick={handleSave} className="btn-primary px-6 py-2.5 rounded-lg">
                    {saved ? "Saved!" : "Save Changes"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
