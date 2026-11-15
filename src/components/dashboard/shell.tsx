import type { ReactNode } from "react";
import type { AuthUser } from "@/lib/auth/types";
import { Sidebar } from "./sidebar";

type DashboardShellProps = {
  user: AuthUser;
  children: ReactNode;
};

export function DashboardShell({ user, children }: DashboardShellProps) {
  return (
    <div className="min-h-full bg-atmosphere">
      <Sidebar user={user} />
      <div className="flex min-w-0 flex-col lg:pl-60">
        <main id="main-content" className="px-4 pb-8 pt-16 lg:px-8 lg:pt-8">{children}</main>
      </div>
    </div>
  );
}
