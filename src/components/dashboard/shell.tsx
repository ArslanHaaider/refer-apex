import type { ReactNode } from "react";
import type { AuthUser } from "@/lib/auth/types";
import { Sidebar } from "./sidebar";

type DashboardShellProps = {
  user: AuthUser;
  children: ReactNode;
};

export function DashboardShell({ user, children }: DashboardShellProps) {
  return (
    <div className="flex min-h-full bg-off-white">
      <Sidebar user={user} />
      <div className="flex min-w-0 flex-1 flex-col lg:pl-0">
        <main className="flex-1 px-4 pb-8 pt-16 lg:px-8 lg:pt-8">
          {children}
        </main>
      </div>
    </div>
  );
}
