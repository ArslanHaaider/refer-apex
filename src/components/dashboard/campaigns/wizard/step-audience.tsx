"use client";

import { AlertTriangle, CheckCircle2, Table2, Unplug, Users } from "lucide-react";
import type { ColumnMapping, SheetConnectionStatus } from "@/lib/referrals/types";

type StepAudienceProps = {
  status: SheetConnectionStatus | null;
  eligibleCount: number;
  busy: string | null;
  tabs: Array<{ title: string; sheetId: number }>;
  selectedSpreadsheetId: string;
  selectedSpreadsheetTitle: string;
  selectedSheetName: string;
  eligibilityDays: number;
  mapping: ColumnMapping;
  onDisconnect: () => void;
  onSpreadsheetIdChange: (idOrUrl: string) => void;
  onSpreadsheetTitleChange: (title: string) => void;
  onPickSpreadsheet: () => void;
  onLoadTabs: () => void;
  onSheetNameChange: (name: string) => void;
  onMappingChange: (key: keyof ColumnMapping, value: string) => void;
  onEligibilityDaysChange: (days: number) => void;
};

const MAPPING_FIELDS: Array<[keyof ColumnMapping, string]> = [
  ["full_name", "Full name column"],
  ["phone", "Phone column"],
  ["email", "Email column"],
  ["last_service_date", "Last service date column"],
];

export function StepAudience({
  status,
  eligibleCount,
  busy,
  tabs,
  selectedSpreadsheetId,
  selectedSpreadsheetTitle,
  selectedSheetName,
  eligibilityDays,
  mapping,
  onDisconnect,
  onSpreadsheetIdChange,
  onSpreadsheetTitleChange,
  onPickSpreadsheet,
  onLoadTabs,
  onSheetNameChange,
  onMappingChange,
  onEligibilityDaysChange,
}: StepAudienceProps) {
  const connected = Boolean(status?.connected);
  const needsReauth = connected && status?.status === "needs_reauth";
  const isMock = Boolean(status?.isMock);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-100 bg-off-white/70 p-3">
        <div className="flex items-center gap-2 text-sm text-charcoal">
          <CheckCircle2 className="h-4 w-4 text-emerald" strokeWidth={1.75} />
          <span className="font-medium">{status?.email ?? (connected ? "Connected" : "Not connected")}</span>
          {isMock ? <span className="text-xs text-gray-500">(Demo mode)</span> : null}
        </div>
        {needsReauth ? (
          <button
            type="button"
            onClick={onPickSpreadsheet}
            disabled={busy === "connect" || busy === "pick"}
            className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-amber-600 disabled:opacity-50"
          >
            {busy === "connect" || busy === "pick"
              ? "Verifying access…"
              : "Verify shared sheet again"}
          </button>
        ) : connected ? (
          <button
            type="button"
            onClick={onDisconnect}
            disabled={busy === "disconnect"}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-white disabled:opacity-50"
          >
            <Unplug className="h-3.5 w-3.5" strokeWidth={1.75} />
            Disconnect
          </button>
        ) : (
          <button
            type="button"
            onClick={onPickSpreadsheet}
            disabled={busy === "connect" || busy === "pick"}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-dark disabled:opacity-50"
          >
            {busy === "connect" || busy === "pick"
              ? "Verifying access…"
              : "Verify and save shared sheet"}
          </button>
        )}
      </div>

      {needsReauth ? (
        <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.75} />
          <span>
            We could not access the shared sheet. Click <strong>Verify shared sheet again</strong>{" "}
            after confirming the service-account viewer permission.
          </span>
        </div>
      ) : null}

      <div className="grid gap-3 md:grid-cols-2">
        <label className="block text-sm">
          <span className="font-medium text-gray-700">Spreadsheet URL or ID</span>
          <input
            value={selectedSpreadsheetId}
            onChange={(e) => onSpreadsheetIdChange(e.target.value)}
            className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-emerald focus:outline-none focus:ring-1 focus:ring-emerald"
            placeholder="https://docs.google.com/spreadsheets/d/... or sheet ID"
          />
          <p className="mt-1 text-xs text-gray-500">
            Limited access mode: only this selected file is used.
          </p>
        </label>
        <label className="block text-sm">
          <span className="font-medium text-gray-700">Spreadsheet name</span>
          <input
            value={selectedSpreadsheetTitle}
            onChange={(e) => onSpreadsheetTitleChange(e.target.value)}
            className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-emerald focus:outline-none focus:ring-1 focus:ring-emerald"
            placeholder="My Client List"
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-gray-700">Eligibility delay (days)</span>
          <input
            type="number"
            min={0}
            step={1}
            value={eligibilityDays}
            onChange={(e) => onEligibilityDaysChange(Number.parseInt(e.target.value || "0", 10))}
            className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-emerald focus:outline-none focus:ring-1 focus:ring-emerald"
          />
          <p className="mt-1 text-xs text-gray-500">
            A contact becomes eligible this many days after last service date.
          </p>
        </label>
      </div>

      {!isMock ? (
        <button
          type="button"
          onClick={onPickSpreadsheet}
          disabled={busy === "pick"}
          className="w-full rounded-lg border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 transition hover:bg-off-white disabled:opacity-50"
        >
          {busy === "pick" ? "Verifying access…" : "Verify shared sheet"}
        </button>
      ) : null}

      <div className="grid gap-3 md:grid-cols-2">
        <label className="block text-sm">
          <span className="font-medium text-gray-700">Sheet tab</span>
          <select
            value={selectedSheetName}
            onChange={(e) => onSheetNameChange(e.target.value)}
            className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-emerald focus:outline-none focus:ring-1 focus:ring-emerald"
          >
            <option value="">Select…</option>
            {tabs.map((t) => (
              <option key={t.sheetId} value={t.title}>
                {t.title}
              </option>
            ))}
          </select>
        </label>
        <div className="flex items-end">
          <button
            type="button"
            onClick={onLoadTabs}
            disabled={!selectedSpreadsheetId || busy === "tabs"}
            className="w-full rounded-lg border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 transition hover:bg-off-white disabled:opacity-50"
          >
            {busy === "tabs" ? "Loading tabs…" : "Load sheet tabs"}
          </button>
        </div>
      </div>

      {selectedSpreadsheetId && selectedSpreadsheetTitle.trim() && selectedSheetName ? (
        <div className="grid gap-3 md:grid-cols-2">
          {MAPPING_FIELDS.map(([key, label]) => (
            <label key={key} className="block text-sm">
              <span className="font-medium text-gray-700">{label}</span>
              <input
                value={mapping[key]}
                onChange={(e) => onMappingChange(key, e.target.value)}
                className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-emerald focus:outline-none focus:ring-1 focus:ring-emerald"
              />
            </label>
          ))}
        </div>
      ) : null}

      <div className="flex items-center gap-3 rounded-xl border border-emerald/20 bg-emerald/5 p-3">
        <Users className="h-4 w-4 text-emerald" strokeWidth={1.75} />
        <p className="text-sm text-emerald">
          <span className="font-semibold">{eligibleCount}</span> eligible contact
          {eligibleCount === 1 ? "" : "s"} ready for referral asks
        </p>
      </div>
    </div>
  );
}
