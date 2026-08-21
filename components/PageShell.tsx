"use client";

import type { ReactNode } from "react";
import RequireAuth from "./RequireAuth";
import SidebarNav from "./SidebarNav";

export default function PageShell({ children }: { children: ReactNode }) {
  return (
    <RequireAuth>
      <SidebarNav />
      <main className="ml-[260px] min-h-screen p-6 lg:p-8">{children}</main>
    </RequireAuth>
  );
}
