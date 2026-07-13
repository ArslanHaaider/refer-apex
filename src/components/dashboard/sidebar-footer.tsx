"use client";

import { LogOut } from "lucide-react";
import { signOut } from "@/app/login/actions";
import type { AuthUser } from "@/lib/auth/types";

type SidebarFooterProps = {
  user: AuthUser;
};

export function SidebarFooter({ user }: SidebarFooterProps) {
  const displayName = user.fullName || user.email.split("@")[0];
  const roleLabel = user.role === "admin" ? "Admin" : "Spa Owner";

  return (
    <div className="border-t border-gray-200 p-4">
      <div className="mb-3 rounded-xl bg-off-white px-3 py-2.5">
        <p className="truncate text-sm font-semibold text-charcoal">
          {displayName}
        </p>
        <p className="truncate text-xs text-gray-600">{user.email}</p>
        <span className="mt-1.5 inline-flex rounded-md bg-emerald/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-emerald">
          {roleLabel}
        </span>
      </div>
      <form action={signOut}>
        <button
          type="submit"
          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-off-white hover:text-charcoal"
        >
          <LogOut className="h-4 w-4" strokeWidth={1.75} />
          Sign out
        </button>
      </form>
    </div>
  );
}
