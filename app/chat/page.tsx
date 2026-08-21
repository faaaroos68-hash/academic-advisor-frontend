"use client";

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import PageShell from "@/components/PageShell";
import { postForm, postJson } from "@/lib/api";
import type { ChatResponse, CourseIntentResponse } from "@/lib/types";
import { dirFor, isArabic } from "@/lib/rtl";
import { IconImage, IconSend } from "@/components/Icons";

interface ChatMessage {
  id: number;
  role: "user" | "assistant";
  text: string;
  data?: ChatResponse;
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

const QUICK_ACTIONS = [
  { label: "Eligible courses", msg: "What courses am I eligible to take?" },
  { label: "Prerequisites", msg: "What are the prerequisites for CS301?" },
  { label: "Raise my GPA", msg: "How can I raise my GPA?" },
  { label: "GPA projection", msg: "What will my GPA be if I get an A in CS301?" },
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
    <span className="mb-2 inline-block rounded-full border border-[#75d7cc]/20 bg-[#75d7cc]/10 px-2.5 py-0.5 text-xs font-medium text-[#75d7cc]">
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

  useEffect(() => {
    setMessages([
      {
        id: 0,
        role: "assistant",
        text: "Hello! Ask me about which courses you're eligible to take, prerequisites, raising your GPA, what-if grade projections, or attach a photo of your transcript.",
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
        data = await postJson<ChatResponse>("/api/chat", {
          message: msg,
          offered_courses: [],
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
      <div className="glass-panel flex h-[75vh] flex-col overflow-hidden">
        <div className="border-b border-white/5 px-6 py-4">
          <h1 className="font-[family-name:var(--font-heading)] text-xl font-bold text-heading">
            AI Advisor
          </h1>
          <p className="text-xs text-caption">
            Ask about courses, prerequisites, or GPA projections
          </p>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-6">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {m.role === "assistant" && isCourseIntent(m.data) ? (
                <CourseIntentCard data={m.data} />
              ) : (
                <div
                  dir={dirFor(m.text)}
                  className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "rounded-br-md bg-gradient-to-br from-[#4FB3A9] to-[#2e8b82] text-white"
                      : isArabic(m.text)
                        ? "rounded-bl-md bg-glass text-right text-body-text"
                        : "rounded-bl-md bg-glass text-body-text"
                  }`}
                >
                  {m.text}
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md bg-glass px-4 py-3">
                <span className="h-2 w-2 animate-pulse-dot rounded-full bg-[#75d7cc]" style={{ animationDelay: "0s" }} />
                <span className="h-2 w-2 animate-pulse-dot rounded-full bg-[#75d7cc]" style={{ animationDelay: "0.2s" }} />
                <span className="h-2 w-2 animate-pulse-dot rounded-full bg-[#75d7cc]" style={{ animationDelay: "0.4s" }} />
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {messages.length <= 1 && (
          <div className="flex flex-wrap gap-2 px-6 pb-3">
            {QUICK_ACTIONS.map((qa) => (
              <button
                key={qa.label}
                onClick={() => {
                  setInput(qa.msg);
                }}
                className="rounded-full border border-white/10 bg-glass px-3 py-1.5 text-xs text-caption transition-all hover:border-[#75d7cc]/30 hover:bg-[#75d7cc]/10 hover:text-[#75d7cc]"
              >
                {qa.label}
              </button>
            ))}
          </div>
        )}

        <div className="border-t border-white/5 p-4">
          {fileError && (
            <p className="mb-2 text-xs text-danger">{fileError}</p>
          )}
          {selectedFile && (
            <div className="mb-2 flex items-center gap-2 rounded-lg bg-glass px-3 py-1.5 text-xs text-body-text">
              <span>📎 {selectedFile.name}</span>
              <button
                onClick={() => setSelectedFile(null)}
                className="text-caption hover:text-heading"
                aria-label="Remove image"
              >
                ✕
              </button>
            </div>
          )}
          <form onSubmit={send} className="flex items-end gap-2">
            <label className="cursor-pointer rounded-xl border border-white/10 bg-glass p-2.5 text-caption transition-colors hover:border-[#75d7cc]/30 hover:bg-[#75d7cc]/10 hover:text-[#75d7cc]">
              <IconImage className="h-5 w-5" />
              <span className="sr-only">Attach transcript image</span>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                className="hidden"
                onChange={(e) => pickFile(e.target.files?.[0])}
              />
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Type a message or ask about your courses…"
              rows={1}
              className="max-h-40 flex-1 resize-none rounded-xl border border-white/10 bg-glass-input px-4 py-2.5 text-sm text-heading placeholder-caption focus:border-[#75d7cc] focus:outline-none focus:ring-0"
            />
            <button
              type="submit"
              disabled={loading || (!input.trim() && !selectedFile)}
              className="primary-gradient-btn rounded-xl px-4 py-2.5"
            >
              <IconSend className="h-5 w-5" />
            </button>
          </form>
        </div>
      </div>
    </PageShell>
  );
}

function CourseIntentCard({ data }: { data: CourseIntentResponse }) {
  return (
    <div className="glass-card max-w-[85%] p-4">
      <IntentBadge intent={data.intent} />
      {data.clarify && data.response && (
        <p
          dir={dirFor(data.response)}
          className="whitespace-pre-wrap text-body-text"
        >
          {data.response}
        </p>
      )}
      {data.recommended_selection.length > 0 && (
        <div className="mb-3">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-caption">
            Recommended ({data.recommended_total_hours} hrs)
          </p>
          <div className="flex flex-wrap gap-1.5">
            {data.recommended_selection.map((c) => (
              <span
                key={c.code}
                className="rounded-full border border-[#b5c4ff]/20 bg-[#b5c4ff]/10 px-2.5 py-1 text-xs font-medium text-[#b5c4ff]"
              >
                {c.code} · {c.credit_hours}h
              </span>
            ))}
          </div>
        </div>
      )}
      {data.eligible_courses.length > 0 && (
        <div className="mb-3">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-caption">
            Eligible
          </p>
          <ul className="space-y-0.5">
            {data.eligible_courses.map((c) => (
              <li
                key={c.code}
                dir={dirFor(c.name ?? "")}
                className="flex items-center justify-between gap-2"
              >
                <span className="flex items-center gap-1.5 font-medium text-heading">
                  <span className="status-dot green" />
                  {c.code}
                </span>
                <span className="truncate text-body-text">{c.name}</span>
                <span className="text-xs text-caption">{c.credit_hours}h</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {data.ineligible_courses.length > 0 && (
        <div className="mb-3">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-caption">
            Blocked by prerequisites
          </p>
          <ul className="space-y-1">
            {data.ineligible_courses.map((c) => (
              <li key={c.code} className="text-body-text">
                <span className="flex items-center gap-1.5 font-medium text-heading">
                  <span className="status-dot red" />
                  {c.code}
                </span>
                <span className="pl-3 text-caption"> {c.name ?? ""}</span>
                <span className="block pl-3 text-xs text-warning">
                  needs: {c.missing_prerequisites.join(", ")}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {data.notes && data.notes !== "ok" && (
        <p className="mt-2 rounded-xl border border-warning/20 bg-warning/10 px-3 py-2 text-xs text-warning">
          {data.notes}
        </p>
      )}
      {data.gpa_projection !== undefined && (
        <div className="mt-2 rounded-xl bg-glass-input p-3 text-xs text-body-text">
          <pre className="whitespace-pre-wrap">
            {JSON.stringify(data.gpa_projection, null, 2)}
          </pre>
        </div>
      )}
      {data.prerequisite_info !== undefined && (
        <div className="mt-2 rounded-xl bg-glass-input p-3 text-xs text-body-text">
          <pre className="whitespace-pre-wrap">
            {JSON.stringify(data.prerequisite_info, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
