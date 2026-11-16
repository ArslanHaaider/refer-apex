"use client";

import { useCallback, useEffect, useState } from "react";

type GatewayStatus = {
  connected: boolean;
  status: "not_configured" | "pending_test" | "connected" | "needs_attention";
  statusDetail: string | null;
  deviceName: string | null;
  lastTestAt: string | null;
};

const inputClass =
  "mt-1 h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-charcoal outline-none focus:border-gray-400";
const buttonClass =
  "inline-flex h-10 items-center justify-center rounded-xl border border-gray-200 px-4 text-sm font-semibold text-gray-700 transition-colors hover:bg-off-white disabled:opacity-60";

const BADGES: Record<GatewayStatus["status"], { label: string; className: string }> = {
  not_configured: { label: "Not connected", className: "bg-gray-100 text-gray-600 ring-gray-200" },
  pending_test: { label: "Waiting for test message", className: "bg-amber-50 text-amber-700 ring-amber-200" },
  connected: { label: "Connected", className: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  needs_attention: { label: "Needs attention", className: "bg-red-50 text-red-700 ring-red-200" },
};

export function SmsGatewayCard() {
  const [loading, setLoading] = useState(true);
  const [gateway, setGateway] = useState<GatewayStatus | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [testPhone, setTestPhone] = useState("");
  const [busy, setBusy] = useState<"connect" | "test" | null>(null);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/sms-gateway/status");
      if (res.ok) setGateway(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  // While waiting for the test message to be reported, poll for the status flip.
  useEffect(() => {
    if (gateway?.status !== "pending_test" || !gateway.lastTestAt) return;
    const id = setInterval(() => void refresh(), 5000);
    return () => clearInterval(id);
  }, [gateway?.status, gateway?.lastTestAt, refresh]);

  async function post(url: string, body: unknown, kind: "connect" | "test") {
    setBusy(kind);
    setMessage(null);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage({ kind: "error", text: data.error ?? "Something went wrong." });
        return false;
      }
      return true;
    } finally {
      setBusy(null);
    }
  }

  async function handleConnect(e: React.FormEvent) {
    e.preventDefault();
    if (await post("/api/sms-gateway/connect", { apiKey }, "connect")) {
      setApiKey("");
      setMessage({ kind: "ok", text: "Device connected. Send a test message to finish setup." });
      await refresh();
    }
  }

  async function handleTest(e: React.FormEvent) {
    e.preventDefault();
    if (await post("/api/sms-gateway/test", { toPhone: testPhone }, "test")) {
      setMessage({ kind: "ok", text: "Test message sent. This page updates once your phone reports it." });
      await refresh();
    }
  }

  const status = gateway?.status ?? "not_configured";
  const badge = BADGES[status];
  const configured = status !== "not_configured";

  return (
    <div className="max-w-xl rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-charcoal">SMS gateway (TextBee)</h2>
        {!loading ? (
          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ${badge.className}`}>
            {badge.label}
          </span>
        ) : null}
      </div>

      {loading ? (
        <p className="mt-3 text-sm text-gray-500">Checking connection…</p>
      ) : (
        <>
          <p className="mt-3 text-sm text-gray-600">
            Referral texts are sent from your own Android phone through TextBee. Install the
            TextBee app, then paste the API key from your TextBee dashboard.
            {gateway?.deviceName ? (
              <>
                {" "}Device: <span className="font-medium text-charcoal">{gateway.deviceName}</span>.
              </>
            ) : null}
          </p>

          {status === "needs_attention" && gateway?.statusDetail ? (
            <p className="mt-3 text-sm text-red-700">{gateway.statusDetail}</p>
          ) : null}

          <form onSubmit={handleConnect} className="mt-4">
            <label className="block text-xs font-semibold text-gray-700">
              {configured ? "Replace API key" : "TextBee API key"}
              <input
                type="password"
                autoComplete="off"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className={inputClass}
              />
            </label>
            <button
              type="submit"
              disabled={busy !== null || apiKey.trim().length < 8}
              className={`${buttonClass} mt-3`}
            >
              {busy === "connect" ? "Connecting…" : configured ? "Reconnect" : "Connect"}
            </button>
          </form>

          {configured && status !== "needs_attention" ? (
            <form onSubmit={handleTest} className="mt-5 border-t border-gray-100 pt-4">
              <label className="block text-xs font-semibold text-gray-700">
                Send a test message to
                <input
                  type="tel"
                  placeholder="+15551234567"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  className={inputClass}
                />
              </label>
              <button
                type="submit"
                disabled={busy !== null || !/^\+\d{8,15}$/.test(testPhone.trim())}
                className={`${buttonClass} mt-3`}
              >
                {busy === "test" ? "Sending…" : "Send test"}
              </button>
            </form>
          ) : null}

          {message ? (
            <p className={`mt-3 text-sm ${message.kind === "error" ? "text-red-700" : "text-emerald-700"}`}>
              {message.text}
            </p>
          ) : null}
        </>
      )}
    </div>
  );
}
