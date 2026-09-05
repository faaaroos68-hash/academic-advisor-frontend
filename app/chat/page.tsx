"use client";

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import PageShell from "@/components/PageShell";
import { get, postForm, postJson } from "@/lib/api";
import type { AvailableCourse, ChatResponse, CourseIntentResponse } from "@/lib/types";
import { dirFor, isArabic } from "@/lib/rtl";

interface ChatMessage {
  id: number;
  role: "user" | "assistant";
  text: string;
  data?: ChatResponse;
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

const QUICK_ACTIONS = [
  { label: "Eligible courses", msg: "What courses am I eligible to take?", icon: "school" },
  { label: "Prerequisites", msg: "What are the prerequisites for CS301?", icon: "account_tree" },
  { label: "Raise my GPA", msg: "How can I raise my GPA?", icon: "trending_up" },
  { label: "GPA projection", msg: "What will my GPA be if I get an A in CS301?", icon: "calculate" },
];

function assistantText(data: ChatResponse): string {
  const d = data as unknown as Record<string, unknown>;
  if (typeof d.ai_answer === "string" && d.ai_answer) return d.ai_answer;
  if (typeof d.response === "string" && d.response) return d.response;
  if (typeof d.error === "string" && d.error) return d.error;
  return "";
}

function isCourseIntent(data: ChatResponse | undefined): data is CourseIntentResponse {
  return !!data && Array.isArray((data as CourseIntentResponse).eligible_courses);
}

function IntentBadge({ intent }: { intent: string }) {
  const labels: Record<string, string> = {
    eligibility: "Course availability",
    gpa_projection: "GPA projection",
    prerequisite_query: "Prerequisites",
    raise_gpa: "GPA improvement",
    free_question: "Answer",
    image_query: "Image",
  };
  return (
    <span className="mb-2 inline-block rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
      {labels[intent] ?? intent}
    </span>
  );
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(1);
  // Real catalog codes for this student (same source as the Courses page),
  // sent as offered_courses so the advisor classifies the actual offerings.
  const offeredCodesRef = useRef<string[]>([]);

  useEffect(() => {
    get<AvailableCourse[]>("/api/student/available-courses")
      .then((courses) => {
        offeredCodesRef.current = courses.map((c) => c.code);
      })
      .catch(() => {
        offeredCodesRef.current = [];
      });
  }, []);

  useEffect(() => {
    setMessages([
      {
        id: 0,
        role: "assistant",
        text: "Good morning. I notice you've completed 75% of your core requirements for the Computer Science track. Based on your current trajectory, you have room for two electives next semester. How can I assist you with your planning today?",
      },
    ]);
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  function pushMessage(msg: Omit<ChatMessage, "id">) {
    setMessages((prev) => [...prev, { ...msg, id: idRef.current++ }]);
  }

  function pickFile(file: File | undefined) {
    setFileError(null);
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) {
      setFileError("Only JPG, PNG or WEBP images are supported.");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setFileError("Image must be under 10MB.");
      return;
    }
    setSelectedFile(file);
  }

  async function send(e: FormEvent) {
    e.preventDefault();
    const msg = input.trim();
    if ((!msg && !selectedFile) || loading) return;

    const userText = selectedFile
      ? msg
        ? `${msg} (with image ${selectedFile.name})`
        : `📎 ${selectedFile.name}`
      : msg;
    pushMessage({ role: "user", text: userText });
    setInput("");
    setLoading(true);

    try {
      let data: ChatResponse;
      if (selectedFile) {
        const fd = new FormData();
        fd.append("image", selectedFile);
        fd.append("message", msg);
        data = await postForm<ChatResponse>("/api/chat", fd);
      } else {
        // Conversation memory: last 10 turns so follow-ups read naturally.
        const history = messages
          .filter((m) => m.text.trim())
          .slice(-10)
          .map((m) => ({ role: m.role, content: m.text }));
        data = await postJson<ChatResponse>("/api/chat", {
          message: msg,
          offered_courses: offeredCodesRef.current,
          history,
        });
      }
      const text = assistantText(data);
      pushMessage({ role: "assistant", text, data });
    } catch (err) {
      pushMessage({
        role: "assistant",
        text: err instanceof Error ? err.message : "Something went wrong.",
      });
    } finally {
      setLoading(false);
      setSelectedFile(null);
    }
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send(e as unknown as FormEvent);
    }
  }

  return (
    <PageShell>
      <div className="flex h-[75vh] flex-col overflow-hidden -m-6 md:-m-8">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 app-card border-b-0 z-20">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
            <h1 className="font-[family-name:var(--font-heading)] text-headline-md font-semibold">AI Advisor</h1>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:flex app-card border-b border-outline-variant px-6 py-4 items-center justify-between">
          <div>
            <h1 className="font-[family-name:var(--font-heading)] text-headline-md text-on-background font-semibold">
              AI Advisor
            </h1>
            <p className="text-label-sm text-on-surface-variant">
              Ask about courses, prerequisites, or GPA projections
            </p>
          </div>
        </div>

        {/* Quick Topics */}
        {messages.length <= 1 && (
          <div className="flex gap-3 px-6 py-4 overflow-x-auto no-scrollbar shrink-0">
            {QUICK_ACTIONS.map((qa) => (
              <button
                key={qa.label}
                onClick={() => setInput(qa.msg)}
                className="whitespace-nowrap px-4 py-2 rounded-full border border-outline-variant bg-surface-container text-label-sm font-semibold text-on-surface hover:bg-surface-container hover:border-outline-variant transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">{qa.icon}</span>
                {qa.label}
              </button>
            ))}
          </div>
        )}

        {/* Chat Canvas */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col gap-6 w-full max-w-4xl mx-auto pb-32">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`animate-fade-in-up flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {m.role === "assistant" && isCourseIntent(m.data) ? (
                <CourseIntentCard data={m.data} />
              ) : m.role === "user" ? (
                <div
                  dir={dirFor(m.text)}
                  className="max-w-[80%] bg-primary text-on-primary px-5 py-3 rounded-2xl rounded-tr-sm text-body-md leading-relaxed"
                >
                  {m.text}
                </div>
              ) : (
                <div className="flex gap-4 max-w-[85%] self-start">
                  <div className="w-8 h-8 rounded shrink-0 flex items-center justify-center bg-surface-container border border-outline-variant mt-1">
                    <span className="material-symbols-outlined text-primary text-lg">smart_toy</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div
                      dir={dirFor(m.text)}
                      className={`whitespace-pre-wrap text-body-md text-on-surface leading-relaxed ${
                        isArabic(m.text) ? "text-right" : ""
                      }`}
                    >
                      {m.text}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex gap-4 max-w-[85%] self-start items-center mt-2 opacity-70">
              <div className="w-6 h-6 rounded flex items-center justify-center bg-transparent mt-1">
                <span className="material-symbols-outlined text-primary text-lg thinking-indicator">change_history</span>
              </div>
              <span className="text-label-sm text-on-surface-variant italic">Analyzing prerequisites...</span>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Composer */}
        <div className="absolute bottom-0 left-0 w-full p-4 md:p-6 bg-gradient-to-t from-surface-container-lowest via-surface-container-lowest/90 to-transparent z-30 pt-12">
          <div className="max-w-4xl mx-auto relative">
            {fileError && (
              <p className="mb-2 text-xs text-error">{fileError}</p>
            )}
            {selectedFile && (
              <div className="mb-2 flex items-center gap-2 rounded-lg app-card px-3 py-1.5 text-xs text-on-surface">
                <span>📎 {selectedFile.name}</span>
                <button
                  onClick={() => setSelectedFile(null)}
                  className="text-on-surface-variant hover:text-on-surface"
                  aria-label="Remove image"
                >
                  ✕
                </button>
              </div>
            )}
            <form onSubmit={send} className="app-card rounded-full flex items-end p-2 pl-6 focus-within:border-primary/50 focus-within:bg-surface-container transition-all duration-300 group shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Ask about courses, requirements, or policy..."
                rows={1}
                className="w-full bg-transparent border-none text-on-surface placeholder:text-on-surface-variant/50 focus:ring-0 resize-none max-h-32 min-h-[44px] py-3 text-body-md"
              />
              <div className="flex items-center gap-2 pb-1 shrink-0">
                <label className="cursor-pointer p-2 text-on-surface-variant hover:text-primary transition-colors rounded-full hover:bg-surface-container flex items-center justify-center">
                  <span className="material-symbols-outlined">attach_file</span>
                  <span className="sr-only">Attach transcript image</span>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp"
                    className="hidden"
                    onChange={(e) => pickFile(e.target.files?.[0])}
                  />
                </label>
                <button
                  type="submit"
                  disabled={loading || (!input.trim() && !selectedFile)}
                  className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-on-primary hover:shadow-[inset_0_0_10px_rgba(255,255,255,0.5)] transition-all duration-200 disabled:opacity-50"
                >
                  <span className="material-symbols-outlined">arrow_upward</span>
                </button>
              </div>
            </form>
            <div className="text-center mt-2">
              <p className="text-[11px] text-outline-variant">AI Advisor can make mistakes. Verify important academic decisions with your human counselor.</p>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

function CourseIntentCard({ data }: { data: CourseIntentResponse }) {
  const ga = data.gpa_analysis as
    | {
        current_gpa?: number;
        total_hours?: number;
        courses_completed?: number;
        suggestions?: string[];
        safety_note?: string | null;
        course_details?: { code: string; grade: string; points: number | null; passing: boolean }[];
      }
    | undefined;
  const pi = data.prerequisite_info as
    | { code: string; name: string; has_all_prerequisites: boolean; missing_prerequisites: { code: string; name: string }[] }[]
    | undefined;

  return (
    <div className="app-card max-w-[90%] p-4 rounded-xl flex flex-col gap-3">
      <IntentBadge intent={data.intent} />
      {data.clarify && data.response && (
        <p
          dir={dirFor(data.response)}
          className="whitespace-pre-wrap text-body-md text-on-surface leading-relaxed"
        >
          {data.response}
        </p>
      )}

      {data.intent === "raise_gpa" && ga && (
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-3 text-label-sm text-on-surface">
            <span>GPA: <strong>{ga.current_gpa}</strong></span>
            <span>Hours: <strong>{ga.total_hours}</strong></span>
            <span>Courses: <strong>{ga.courses_completed}</strong></span>
          </div>
          {ga.safety_note && (
            <p className="rounded-xl border border-warning/20 bg-warning/10 px-3 py-2 text-xs text-warning">
              {ga.safety_note}
            </p>
          )}
          {ga.suggestions && ga.suggestions.length > 0 && (
            <ul className="list-disc ps-5 text-body-sm text-on-surface space-y-1">
              {ga.suggestions.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          )}
          {ga.course_details && ga.course_details.length > 0 && (
            <div>
              <p className="mb-1 text-label-sm font-semibold uppercase tracking-wider text-on-surface-variant">
                Course history
              </p>
              <ul className="space-y-1">
                {ga.course_details.map((c) => (
                  <li key={c.code} className="flex items-center justify-between gap-2 text-sm">
                    <span className="flex items-center gap-1.5 font-medium text-on-surface">
                      <span className={`status-dot ${c.passing ? "green" : "red"}`} />
                      {c.code}
                    </span>
                    <span className="text-on-surface-variant">{c.grade}</span>
                    <span className="text-xs text-on-surface-variant">{c.points ?? "—"} pts</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {data.intent === "prerequisite_query" && pi && pi.length > 0 && (
        <div className="flex flex-col gap-2">
          {pi.map((info) => (
            <div key={info.code} className="rounded-xl border border-outline-variant p-3">
              <p className="font-medium text-on-surface">
                {info.code} — {info.name}
              </p>
              {info.has_all_prerequisites ? (
                <p className="text-xs text-success mt-1">Prerequisites met</p>
              ) : (
                <ul className="mt-1 space-y-0.5">
                  {info.missing_prerequisites.map((m) => (
                    <li key={m.code} className="text-xs text-warning">
                      Missing: {m.code} — {m.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {data.intent === "gpa_projection" && data.gpa_projection !== undefined && (
        <div className="rounded-xl bg-surface-container-highest/50 p-3 text-xs text-on-surface">
          <pre className="whitespace-pre-wrap">
            {JSON.stringify(data.gpa_projection, null, 2)}
          </pre>
        </div>
      )}

      {data.intent === "eligibility" && (
        <>
          {data.recommended_selection.length > 0 && (
            <div className="mb-3">
              <p className="mb-1 text-label-sm font-semibold uppercase tracking-wider text-on-surface-variant">
                Recommended ({data.recommended_total_hours} hrs)
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {data.recommended_selection.map((c) => (
                  <div key={c.code} className="app-card p-3 rounded-xl flex flex-col gap-2">
                    <span className="text-label-sm text-secondary bg-secondary/15 px-2 py-0.5 rounded-full w-fit">
                      {c.code}
                    </span>
                    <span className="text-label-sm text-on-surface-variant">
                      {c.credit_hours}h
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {data.eligible_courses.length > 0 && (
            <div className="mb-3">
              <p className="mb-1 text-label-sm font-semibold uppercase tracking-wider text-on-surface-variant">
                Eligible
              </p>
              <ul className="space-y-1">
                {data.eligible_courses.map((c) => (
                  <li
                    key={c.code}
                    dir={dirFor(c.name ?? "")}
                    className="flex items-center justify-between gap-2"
                  >
                    <span className="flex items-center gap-1.5 font-medium text-on-surface">
                      <span className="status-dot green" />
                      {c.code}
                    </span>
                    <span className="truncate text-on-surface-variant">{c.name}</span>
                    <span className="text-xs text-on-surface-variant">{c.credit_hours}h</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {data.ineligible_courses.length > 0 && (
            <div className="mb-3">
              <p className="mb-1 text-label-sm font-semibold uppercase tracking-wider text-on-surface-variant">
                Blocked by prerequisites
              </p>
              <ul className="space-y-1">
                {data.ineligible_courses.map((c) => (
                  <li key={c.code} className="text-on-surface-variant">
                    <span className="flex items-center gap-1.5 font-medium text-on-surface">
                      <span className="status-dot red" />
                      {c.code}
                    </span>
                    <span className="pl-3 text-on-surface-variant"> {c.name ?? ""}</span>
                    <span className="block pl-3 text-xs text-warning">
                      needs: {c.missing_prerequisites.join(", ")}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      {data.notes && data.notes !== "ok" && (
        <p className="mt-2 rounded-xl border border-warning/20 bg-warning/10 px-3 py-2 text-xs text-warning">
          {data.notes}
        </p>
      )}
    </div>
  );
}
