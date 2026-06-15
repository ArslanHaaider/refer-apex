import type { ReactNode } from "react";
import { Calendar, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { UserRole } from "@/lib/auth/types";

type DashboardHeaderProps = {
  title: string;
  dateRange?: string;
  showExport?: boolean;
  role: UserRole;
  children?: ReactNode;
};

export function DashboardHeader({
  title,
  dateRange,
  showExport = false,
  role,
  children,
}: DashboardHeaderProps) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-charcoal">
          {title}
        </h1>
        {role === "user" ? (
          <p className="mt-1 text-sm text-gray-600">
            Your spa&apos;s performance at a glance
          </p>
        ) : (
          <p className="mt-1 text-sm text-gray-600">
            Platform-wide metrics across all locations
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {children}
        {dateRange ? (
          <button
            type="button"
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-sm font-medium text-charcoal transition-colors hover:bg-off-white"
          >
            <Calendar className="h-4 w-4 text-gray-600" strokeWidth={1.75} />
            {dateRange}
          </button>
        ) : null}
        {showExport ? (
          <Button.Outline size="sm" className="gap-2">
            <Download className="h-4 w-4" strokeWidth={1.75} />
            Export
          </Button.Outline>
        ) : null}
      </div>
    </div>
  );
}
