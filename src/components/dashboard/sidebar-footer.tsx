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
  const initials = displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <div className="p-3.5">
      <div className="rounded-xl bg-gray-100 p-3.5">
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden
            className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold text-white"
          >
            {initials}
          </span>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold text-charcoal">{displayName}</p>
            <p className="truncate text-[11px] text-gray-500">{roleLabel}</p>
          </div>
        </div>
      </div>
      <form action={signOut} className="mt-2">
        <button
          type="submit"
          className="flex h-9 w-full items-center gap-2.5 rounded-[9px] px-3 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-charcoal"
        >
          <LogOut className="h-4 w-4" strokeWidth={1.75} />
          Sign out
        </button>
      </form>
    </div>
  );
}
