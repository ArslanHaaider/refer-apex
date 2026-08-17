"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle, ArrowLeft, ArrowRight, X } from "lucide-react";
import type {
  ChannelMode,
  ColumnMapping,
  DiscountType,
  SheetConnectionStatus,
  WhatsappConnectionStatus,
} from "@/lib/referrals/types";
import { extractSpreadsheetIdFromInput } from "@/lib/referrals/spreadsheet-id";
import { getEligibilityDays } from "@/lib/referrals/eligibility";
import { StepIndicator, type WizardStep } from "./wizard/step-indicator";
import { StepAudience } from "./wizard/step-audience";
import { StepOffer } from "./wizard/step-offer";
import { StepChannels } from "./wizard/step-channels";
import { StepReview } from "./wizard/step-review";

const DEFAULT_MAPPING: ColumnMapping = {
  full_name: "full_name",
  phone: "phone",
  email: "email",
  last_service_date: "last_service_date",
  referred_by_contact_id: "referred_by_contact_id",
  referral_code: "referral_code",
  booking_status: "booking_status",
};

const STEPS: WizardStep[] = [
  { title: "Audience", description: "Choose your data source" },
  { title: "Offer & message", description: "Craft the referral ask" },
  { title: "Channels", description: "Pick how to reach people" },
  { title: "Review & launch", description: "Confirm and go live" },
];

export function CampaignWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [createdCampaignId, setCreatedCampaignId] = useState<string | null>(null);

  const [status, setStatus] = useState<SheetConnectionStatus | null>(null);
  const [eligibleCount, setEligibleCount] = useState(0);
  const [tabs, setTabs] = useState<Array<{ title: string; sheetId: number }>>([]);
  const [selectedSpreadsheetId, setSelectedSpreadsheetId] = useState("");
  const [selectedSpreadsheetTitle, setSelectedSpreadsheetTitle] = useState("");
  const [selectedSheetName, setSelectedSheetName] = useState("");
  const [eligibilityDays, setEligibilityDays] = useState(getEligibilityDays());
  const [mapping, setMapping] = useState<ColumnMapping>(DEFAULT_MAPPING);
  const [mappingSaved, setMappingSaved] = useState(false);

  const [name, setName] = useState("Referral Campaign");
  const [channelMode, setChannelMode] = useState<ChannelMode>("both");
  const [messageTemplate, setMessageTemplate] = useState(
    "Hi {{first_name}}! Enjoyed your visit? Refer a friend and they get {{discount}}. Share your link: {{referral_link}}",
  );
  const [emailSubject, setEmailSubject] = useState("Refer a friend and share the love");
  const [discountType, setDiscountType] = useState<DiscountType>("percent");
  const [discountValue, setDiscountValue] = useState(15);
  const [discountDescription, setDiscountDescription] = useState("on your next visit");
  const [whatsappStatus, setWhatsappStatus] = useState<WhatsappConnectionStatus | null>(null);

  const loadData = useCallback(async (options?: { silent?: boolean }) => {
    if (!options?.silent) {
      setLoading(true);
    }
    setError(null);
    try {
      const [statusRes, contactsRes, whatsappRes] = await Promise.all([
        fetch("/api/sheets/status").then((r) => r.json()),
        fetch("/api/contacts").then((r) => r.json()),
        fetch("/api/whatsapp/status").then((r) => r.json()),
      ]);

      setStatus(statusRes);
      setEligibleCount(contactsRes.eligibleCount ?? 0);
      setWhatsappStatus(whatsappRes);

      if (statusRes.connected) {
        setSelectedSpreadsheetId((current) => statusRes.spreadsheetId || current);
        setSelectedSpreadsheetTitle((current) => statusRes.spreadsheetTitle || current);
        setSelectedSheetName((current) => statusRes.sheetName || current);
        if (typeof statusRes.eligibilityDays === "number") {
          setEligibilityDays(Math.max(0, Math.floor(statusRes.eligibilityDays)));
        }
        if (statusRes.columnMapping) setMapping(statusRes.columnMapping);
        setMappingSaved(Boolean(statusRes.spreadsheetId && statusRes.sheetName));
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
      setError(err instanceof Error ? err.message : "Failed to load setup data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  async function chooseSheet() {
    setBusy("pick");
    setError(null);
    try {
      if (status?.isMock && !status.connected) {
        const res = await fetch("/api/sheets/connect", { method: "POST" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Connect failed");
        await loadData();
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

      setMappingSaved(true);
      await loadData({ silent: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to verify shared sheet");
    } finally {
      setBusy(null);
    }
  }

  async function disconnectSheets() {
    setBusy("disconnect");
    try {
      await fetch("/api/sheets/disconnect", { method: "POST" });
      setMappingSaved(false);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Disconnect failed");
    } finally {
      setBusy(null);
    }
  }

  function onSpreadsheetIdChange(idOrUrl: string) {
    setSelectedSpreadsheetId(idOrUrl);
    setMappingSaved(false);
    setTabs([]);
    setSelectedSheetName("");
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
      setSelectedSpreadsheetId(spreadsheetId);
      setTabs(tabsRes.sheets ?? []);
      setSelectedSheetName(tabsRes.sheets?.[0]?.title ?? "");
      if (!selectedSpreadsheetTitle.trim() && tabsRes.title) {
        setSelectedSpreadsheetTitle(tabsRes.title);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load sheet tabs");
    } finally {
      setBusy(null);
    }
  }

  function onSheetNameChange(nameValue: string) {
    setSelectedSheetName(nameValue);
    setMappingSaved(false);
  }

  function onEligibilityDaysChange(days: number) {
    const normalized = Number.isFinite(days) ? Math.max(0, Math.floor(days)) : 0;
    setEligibilityDays(normalized);
    setMappingSaved(false);
  }

  function onMappingChange(key: keyof ColumnMapping, value: string) {
    setMapping((prev) => ({ ...prev, [key]: value }));
    setMappingSaved(false);
  }

  async function saveAudienceSelection(): Promise<boolean> {
    if (mappingSaved) return true;
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
      setMappingSaved(true);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
      return false;
    } finally {
      setBusy(null);
    }
  }

  const audienceReady = Boolean(
    status?.connected &&
      selectedSpreadsheetId &&
      selectedSpreadsheetTitle.trim() &&
      selectedSheetName,
  );
  const offerReady = Boolean(name.trim() && messageTemplate.trim() && emailSubject.trim());
  const channelsReady =
    channelMode === "email" || Boolean(whatsappStatus?.connected);

  const canContinue = [audienceReady, offerReady, channelsReady, true][step];

  async function goNext() {
    if (step === 0) {
      const saved = await saveAudienceSelection();
      if (!saved) return;
    }
    setError(null);
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function goBack() {
    setError(null);
    setStep((s) => Math.max(s - 1, 0));
  }

  async function ensureCampaignCreated(): Promise<string> {
    if (createdCampaignId) return createdCampaignId;
    const res = await fetch("/api/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        channelMode,
        messageTemplate,
        emailSubject,
        discountType,
        discountValue,
        discountDescription,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Failed to create campaign");
    setCreatedCampaignId(data.campaign.id as string);
    return data.campaign.id as string;
  }

  async function saveDraft() {
    setBusy("draft");
    setError(null);
    try {
      await ensureCampaignCreated();
      router.push(
        `/dashboard/campaigns?success=${encodeURIComponent("Campaign saved as draft.")}`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save draft");
    } finally {
      setBusy(null);
    }
  }

  async function activate(andSend: boolean) {
    setBusy(andSend ? "activate-send" : "activate");
    setError(null);
    try {
      const id = await ensureCampaignCreated();
      const patchRes = await fetch(`/api/campaigns/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "active" }),
      });
      const patchData = await patchRes.json();
      if (!patchRes.ok) throw new Error(patchData.error ?? "Failed to activate campaign");

      if (!andSend) {
        router.push(`/dashboard/campaigns?success=${encodeURIComponent("Campaign activated.")}`);
        return;
      }

      const dispatchRes = await fetch(`/api/campaigns/${id}/dispatch`, { method: "POST" });
      const dispatchData = await dispatchRes.json();
      if (!dispatchRes.ok) throw new Error(dispatchData.error ?? "Failed to dispatch campaign");

      router.push(
        `/dashboard/campaigns?success=${encodeURIComponent(
          `Campaign activated and sent: ${dispatchData.sent} sent, ${dispatchData.failed} failed.`,
        )}`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to activate campaign");
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

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-charcoal">New campaign</h1>
          <p className="mt-1 text-sm text-gray-600">
            {STEPS[step].description}
          </p>
        </div>
        <Link
          href="/dashboard/campaigns"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-gray-400 transition hover:bg-off-white hover:text-gray-600"
        >
          <X className="h-4 w-4" strokeWidth={1.75} />
        </Link>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        <StepIndicator steps={STEPS} current={step} onStepClick={setStep} />
        <p className="mt-3 text-sm font-medium text-charcoal sm:hidden">
          Step {step + 1} of {STEPS.length}: {STEPS[step].title}
        </p>

        <div className="mt-6 sm:mt-8">
          {step === 0 ? (
            <StepAudience
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
              onSheetNameChange={onSheetNameChange}
              onMappingChange={onMappingChange}
              onEligibilityDaysChange={onEligibilityDaysChange}
            />
          ) : null}

          {step === 1 ? (
            <StepOffer
              name={name}
              onNameChange={setName}
              messageTemplate={messageTemplate}
              onMessageTemplateChange={setMessageTemplate}
              emailSubject={emailSubject}
              onEmailSubjectChange={setEmailSubject}
              discountType={discountType}
              onDiscountTypeChange={setDiscountType}
              discountValue={discountValue}
              onDiscountValueChange={setDiscountValue}
              discountDescription={discountDescription}
              onDiscountDescriptionChange={setDiscountDescription}
            />
          ) : null}

          {step === 2 ? (
            <StepChannels
              channelMode={channelMode}
              onChannelModeChange={setChannelMode}
              whatsappConnected={Boolean(whatsappStatus?.connected)}
              whatsappDisplayPhoneNumber={whatsappStatus?.displayPhoneNumber ?? null}
            />
          ) : null}

          {step === 3 ? (
            <StepReview
              name={name}
              channelMode={channelMode}
              discountType={discountType}
              discountValue={discountValue}
              discountDescription={discountDescription}
              emailSubject={emailSubject}
              sheetName={selectedSheetName}
              eligibleCount={eligibleCount}
              busy={busy}
              error={error}
              onSaveDraft={() => void saveDraft()}
              onActivate={() => void activate(false)}
              onActivateAndSend={() => void activate(true)}
            />
          ) : null}
        </div>

        {error && step !== 3 ? (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.75} />
            {error}
          </div>
        ) : null}

        {step !== 3 ? (
          <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-5">
            <button
              type="button"
              onClick={goBack}
              disabled={step === 0}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-off-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
              Back
            </button>
            <button
              type="button"
              onClick={() => void goNext()}
              disabled={!canContinue || busy === "select"}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy === "select" ? "Saving…" : "Continue"}
              <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </div>
        ) : (
          <div className="mt-6 flex items-center border-t border-gray-100 pt-5">
            <button
              type="button"
              onClick={goBack}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-off-white"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
              Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
