"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { get, postJson } from "@/lib/api";
import type { Student } from "@/lib/types";

export interface RegisterPayload {
  username: string;
  password: string;
  full_name: string;
  student_id: string;
  department: string;
  level: number;
}

interface AuthContextValue {
  student: Student | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<Student>;
  register: (payload: RegisterPayload) => Promise<{
    message: string;
    student_id: string;
    username: string;
  }>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await get<{ student: Student }>("/api/me");
      setStudent(data.student);
    } catch {
      setStudent(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(async (username: string, password: string) => {
    const data = await postJson<{ student: Student }>("/api/login", {
      username,
      password,
    });
    setStudent(data.student);
    return data.student;
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    return await postJson<{ message: string; student_id: string; username: string }>(
      "/api/register",
      payload
    );
  }, []);

  const logout = useCallback(async () => {
    await postJson("/api/logout", {});
    setStudent(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ student, loading, login, register, logout, refresh }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}