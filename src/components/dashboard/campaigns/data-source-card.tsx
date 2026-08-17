"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2, ChevronDown, RefreshCw, Table2, Unplug } from "lucide-react";
import type { ColumnMapping, SheetConnectionStatus } from "@/lib/referrals/types";

type DataSourceCardProps = {
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
  onSaveSelection: () => void;
  onSyncNow: () => void;
};

const MAPPING_FIELDS: Array<[keyof ColumnMapping, string]> = [
  ["full_name", "Full name column"],
  ["phone", "Phone column"],
  ["email", "Email column"],
  ["last_service_date", "Last service date column"],
];

export function DataSourceCard({
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
  onSaveSelection,
  onSyncNow,
}: DataSourceCardProps) {
  const connected = Boolean(status?.connected);
  const needsReauth = connected && status?.status === "needs_reauth";
  const isMock = Boolean(status?.isMock);
  const [expanded, setExpanded] = useState(true);

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald/10 text-emerald">
            <Table2 className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-charcoal">Data source</h2>
            <p className="mt-1 text-sm text-gray-600">
              One Google Sheet per account. Share the sheet with the trusted service-account email
              as Viewer, then verify it here.
            </p>
            {!isMock ? (
              <p className="mt-1 text-xs text-gray-500">
                Trusted reader:{" "}
                <code className="rounded bg-off-white px-1">
                  {status?.serviceAccountEmail ?? "service account not configured"}
                </code>
              </p>
            ) : null}
          </div>
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
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-off-white disabled:opacity-50"
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
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.75} />
          <span>
            We could not access the shared sheet, so syncing is paused. Click{" "}
            <strong>Verify shared sheet again</strong> after confirming the service-account viewer
            permission.
          </span>
        </div>
      ) : null}

      <div className="mt-5 space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <Metric
              label="Sheet owner"
              value={status?.email ?? "Unknown"}
              hint={isMock ? "Demo mode" : "From Google Drive metadata"}
              icon={<CheckCircle2 className="h-4 w-4 text-emerald" strokeWidth={1.75} />}
            />
            <Metric
              label="Eligible contacts"
              value={String(eligibleCount)}
              hint="Ready for referral asks"
            />
            <Metric
              label="Last sync"
              value={status?.lastSyncAt ? new Date(status.lastSyncAt).toLocaleString() : "Never"}
              hint={status?.lastSyncError ?? (connected ? "OK" : "Not connected yet")}
            />
          </div>

          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="flex w-full items-center justify-between rounded-xl border border-gray-100 bg-off-white/70 px-4 py-2.5 text-left text-sm font-medium text-gray-700 transition hover:bg-off-white"
          >
            <span>Sheet &amp; column mapping</span>
            <ChevronDown
              className={`h-4 w-4 text-gray-500 transition-transform ${expanded ? "rotate-180" : ""}`}
              strokeWidth={1.75}
            />
          </button>

          {expanded ? (
            <div className="space-y-4 rounded-xl border border-gray-100 p-4">
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
                    We only access this selected file.
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
                    onChange={(e) =>
                      onEligibilityDaysChange(Number.parseInt(e.target.value || "0", 10))
                    }
                    className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-emerald focus:outline-none focus:ring-1 focus:ring-emerald"
                  />
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

              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  onClick={onSaveSelection}
                  disabled={
                    busy === "select" ||
                    !selectedSpreadsheetId ||
                    !selectedSpreadsheetTitle.trim() ||
                    !selectedSheetName
                  }
                  className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 transition hover:bg-off-white disabled:opacity-50"
                >
                  Save mapping
                </button>
                <button
                  type="button"
                  onClick={onSyncNow}
                  disabled={busy === "sync" || !connected}
                  title={!connected ? "Verify and save the shared sheet before syncing." : undefined}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-dark disabled:opacity-50"
                >
                  <RefreshCw
                    className={`h-3.5 w-3.5 ${busy === "sync" ? "animate-spin" : ""}`}
                    strokeWidth={1.75}
                  />
                  {busy === "sync" ? "Syncing…" : "Sync now"}
                </button>
              </div>
            </div>
          ) : null}
      </div>
    </section>
  );
}

function Metric({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: string;
  hint: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-off-white/70 p-3">
      <div className="flex items-center gap-1.5">
        <p className="text-xs font-medium text-gray-500">{label}</p>
        {icon}
      </div>
      <p className="mt-1 truncate text-sm font-semibold text-charcoal">{value}</p>
      <p className="mt-0.5 truncate text-xs text-gray-500">{hint}</p>
    </div>
  );
}
