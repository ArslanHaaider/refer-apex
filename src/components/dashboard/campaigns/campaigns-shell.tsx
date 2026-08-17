"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, CheckCircle2, Megaphone, Plus, Radio, Users } from "lucide-react";
import type { ColumnMapping, ReferralCampaign, SheetConnectionStatus } from "@/lib/referrals/types";
import { extractSpreadsheetIdFromInput } from "@/lib/referrals/spreadsheet-id";
import { getEligibilityDays } from "@/lib/referrals/eligibility";
import { DataSourceCard } from "./data-source-card";
import { CampaignList } from "./campaign-list";

const DEFAULT_MAPPING: ColumnMapping = {
  full_name: "full_name",
  phone: "phone",
  email: "email",
  last_service_date: "last_service_date",
  referred_by_contact_id: "referred_by_contact_id",
  referral_code: "referral_code",
  booking_status: "booking_status",
};

export function CampaignsShell() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [status, setStatus] = useState<SheetConnectionStatus | null>(null);
  const [campaigns, setCampaigns] = useState<ReferralCampaign[]>([]);
  const [eligibleCount, setEligibleCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Spreadsheet selection
  const [tabs, setTabs] = useState<Array<{ title: string; sheetId: number }>>([]);
  const [selectedSpreadsheetId, setSelectedSpreadsheetId] = useState("");
  const [selectedSpreadsheetTitle, setSelectedSpreadsheetTitle] = useState("");
  const [selectedSheetName, setSelectedSheetName] = useState("");
  const [eligibilityDays, setEligibilityDays] = useState(getEligibilityDays());
  const [mapping, setMapping] = useState<ColumnMapping>(DEFAULT_MAPPING);

  const refresh = useCallback(async (options?: { silent?: boolean }) => {
    if (!options?.silent) {
      setLoading(true);
    }
    setError(null);
    try {
      const [statusRes, campaignsRes, contactsRes] = await Promise.all([
        fetch("/api/sheets/status").then((r) => r.json()),
        fetch("/api/campaigns").then((r) => r.json()),
        fetch("/api/contacts").then((r) => r.json()),
      ]);

      setStatus(statusRes);
      setCampaigns(campaignsRes.campaigns ?? []);
      setEligibleCount(contactsRes.eligibleCount ?? 0);

      if (statusRes.connected) {
        setSelectedSpreadsheetId((current) => statusRes.spreadsheetId || current);
        setSelectedSpreadsheetTitle((current) => statusRes.spreadsheetTitle || current);
        setSelectedSheetName((current) => statusRes.sheetName || current);
        if (typeof statusRes.eligibilityDays === "number") {
          setEligibilityDays(Math.max(0, Math.floor(statusRes.eligibilityDays)));
        }
        if (statusRes.columnMapping) setMapping(statusRes.columnMapping);
        if (statusRes.spreadsheetId) {
          const tabsRes = await fetch(
            `/api/sheets/tabs?spreadsheetId=${encodeURIComponent(statusRes.spreadsheetId)}`,
          ).then((r) => r.json());
          setTabs(tabsRes.sheets ?? []);
        } else {
          setTabs([]);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load campaigns");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const success = searchParams.get("success");
    const errorParam = searchParams.get("error");
    if (success) setMessage(success);
    if (errorParam) setError(errorParam);
    if (success || errorParam) {
      router.replace("/dashboard/campaigns");
    }
  }, [searchParams, router]);

  async function chooseSheet() {
    setBusy("pick");
    setError(null);
    try {
      if (status?.isMock && !status.connected) {
        const res = await fetch("/api/sheets/connect", { method: "POST" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Connect failed");
        await refresh();
        setMessage("Demo Google Sheets connected.");
        return;
      }

      const spreadsheetId = extractSpreadsheetIdFromInput(selectedSpreadsheetId);
      if (!spreadsheetId) {
        throw new Error(
          "Paste the Google Sheet URL or ID first, then share it with the service-account email shown in Data source.",
        );
      }

      const tabsRes = await fetch(
        `/api/sheets/tabs?spreadsheetId=${encodeURIComponent(spreadsheetId)}`,
      ).then((r) => r.json());
      if (tabsRes.error) {
        throw new Error(tabsRes.error);
      }

      const sheets = tabsRes.sheets ?? [];
      const sheetName = selectedSheetName || sheets[0]?.title || "Sheet1";
      setSelectedSpreadsheetId(spreadsheetId);
      if (!selectedSpreadsheetTitle.trim() && tabsRes.title) {
        setSelectedSpreadsheetTitle(tabsRes.title);
      }
      setTabs(sheets);
      setSelectedSheetName(sheetName);

      const saveRes = await fetch("/api/sheets/select", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          spreadsheetId,
          spreadsheetTitle: (selectedSpreadsheetTitle || tabsRes.title || "Spreadsheet").trim(),
          sheetName,
          eligibilityDays,
          columnMapping: mapping,
        }),
      });
      const saveData = await saveRes.json();
      if (!saveRes.ok) {
        throw new Error(saveData.error ?? "Failed to save selected sheet.");
      }

      setMessage("Sheet access verified and saved.");
      await refresh({ silent: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to verify shared sheet");
    } finally {
      setBusy(null);
    }
  }

  async function loadTabs() {
    const spreadsheetId = extractSpreadsheetIdFromInput(selectedSpreadsheetId);
    if (!spreadsheetId) {
      setError("Enter a valid Google Sheet URL or spreadsheet ID.");
      return;
    }

    setBusy("tabs");
    setError(null);
    try {
      const tabsRes = await fetch(
        `/api/sheets/tabs?spreadsheetId=${encodeURIComponent(spreadsheetId)}`,
      ).then((r) => r.json());
      if (tabsRes.error) {
        setError(tabsRes.error);
        return;
      }
      const sheets = tabsRes.sheets ?? [];
      const sheetName = sheets[0]?.title ?? "";
      setSelectedSpreadsheetId(spreadsheetId);
      if (!selectedSpreadsheetTitle.trim() && tabsRes.title) {
        setSelectedSpreadsheetTitle(tabsRes.title);
      }
      setTabs(sheets);
      setSelectedSheetName(sheetName);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load sheet tabs");
    } finally {
      setBusy(null);
    }
  }

  async function disconnectSheets() {
    setBusy("disconnect");
    try {
      await fetch("/api/sheets/disconnect", { method: "POST" });
      await refresh();
      setMessage("Google Sheets disconnected.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Disconnect failed");
    } finally {
      setBusy(null);
    }
  }

  function onSpreadsheetIdChange(idOrUrl: string) {
    setSelectedSpreadsheetId(idOrUrl);
    setTabs([]);
    setSelectedSheetName("");
  }

  function onEligibilityDaysChange(days: number) {
    const normalized = Number.isFinite(days) ? Math.max(0, Math.floor(days)) : 0;
    setEligibilityDays(normalized);
  }

  async function saveSelection() {
    setBusy("select");
    setError(null);
    try {
      const spreadsheetId = extractSpreadsheetIdFromInput(selectedSpreadsheetId);
      if (!spreadsheetId) {
        throw new Error("Enter a valid Google Sheet URL or spreadsheet ID.");
      }
      const res = await fetch("/api/sheets/select", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          spreadsheetId,
          spreadsheetTitle: selectedSpreadsheetTitle.trim() || "Spreadsheet",
          sheetName: selectedSheetName,
          eligibilityDays,
          columnMapping: mapping,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed");
      setMessage("Sheet selection saved.");
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setBusy(null);
    }
  }

  async function syncNow() {
    setBusy("sync");
    setError(null);
    try {
      const res = await fetch("/api/sheets/sync", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.errorMessage ?? data.error ?? "Sync failed");
      setMessage(
        `Sync complete: ${data.rowsUpserted} upserted, ${data.rowsSkipped} skipped of ${data.rowsScanned} scanned.`,
      );
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sync failed");
    } finally {
      setBusy(null);
    }
  }

  async function setCampaignStatus(id: string, nextStatus: "active" | "paused" | "draft") {
    setBusy(`status-${id}`);
    setError(null);
    try {
      const res = await fetch(`/api/campaigns/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Update failed");
      setMessage(`Campaign ${nextStatus}.`);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setBusy(null);
    }
  }

  async function dispatchCampaign(id: string) {
    setBusy(`dispatch-${id}`);
    setError(null);
    try {
      const res = await fetch(`/api/campaigns/${id}/dispatch`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Dispatch failed");
      setMessage(`Dispatched: ${data.sent} sent, ${data.failed} failed (${data.queued} queued).`);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Dispatch failed");
    } finally {
      setBusy(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-emerald" />
      </div>
    );
  }

  const activeCount = campaigns.filter((c) => c.status === "active").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald/10 text-emerald">
            <Megaphone className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-charcoal">Campaigns</h1>
            <p className="mt-1 text-sm text-gray-600">
              Choose a Google Sheet, configure referral campaigns, and launch messaging.
            </p>
          </div>
        </div>
        <Link
          href="/dashboard/campaigns/new"
          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-dark"
        >
          <Plus className="h-4 w-4" strokeWidth={1.75} />
          New campaign
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <OverviewTile
          icon={<Megaphone className="h-4 w-4" strokeWidth={1.75} />}
          label="Total campaigns"
          value={String(campaigns.length)}
        />
        <OverviewTile
          icon={<Radio className="h-4 w-4" strokeWidth={1.75} />}
          label="Active now"
          value={String(activeCount)}
        />
        <OverviewTile
          icon={<Users className="h-4 w-4" strokeWidth={1.75} />}
          label="Eligible contacts"
          value={String(eligibleCount)}
        />
      </div>

      {error ? (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.75} />
          {error}
        </div>
      ) : null}
      {message ? (
        <div className="flex items-start gap-2 rounded-xl border border-emerald/20 bg-emerald/5 px-4 py-3 text-sm text-emerald">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.75} />
          {message}
        </div>
      ) : null}

      <CampaignList
        campaigns={campaigns}
        busy={busy}
        onActivate={(id) => void setCampaignStatus(id, "active")}
        onPause={(id) => void setCampaignStatus(id, "paused")}
        onDispatch={(id) => void dispatchCampaign(id)}
      />

      <DataSourceCard
        status={status}
        eligibleCount={eligibleCount}
        busy={busy}
        tabs={tabs}
        selectedSpreadsheetId={selectedSpreadsheetId}
        selectedSpreadsheetTitle={selectedSpreadsheetTitle}
        selectedSheetName={selectedSheetName}
        eligibilityDays={eligibilityDays}
        mapping={mapping}
        onDisconnect={disconnectSheets}
        onSpreadsheetIdChange={onSpreadsheetIdChange}
        onSpreadsheetTitleChange={setSelectedSpreadsheetTitle}
        onPickSpreadsheet={chooseSheet}
        onLoadTabs={loadTabs}
        onSheetNameChange={setSelectedSheetName}
        onMappingChange={(key, value) => setMapping((prev) => ({ ...prev, [key]: value }))}
        onEligibilityDaysChange={onEligibilityDaysChange}
        onSaveSelection={saveSelection}
        onSyncNow={syncNow}
      />
    </div>
  );
}

function OverviewTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-off-white text-gray-500">
        {icon}
      </div>
      <div>
        <p className="text-xs font-medium text-gray-500">{label}</p>
        <p className="text-lg font-semibold text-charcoal">{value}</p>
      </div>
    </div>
  );
}
