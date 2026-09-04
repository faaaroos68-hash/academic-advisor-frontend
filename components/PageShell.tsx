"use client";

import type { ReactNode } from "react";
import RequireAuth from "./RequireAuth";
import SidebarNav from "./SidebarNav";

export default function PageShell({ children }: { children: ReactNode }) {
  return (
    <RequireAuth>
      <SidebarNav />
      <main className="md:ml-[240px] min-h-screen">
        <div className="pt-14 md:pt-0">{children}</div>
      </main>
    </RequireAuth>
  );
}
