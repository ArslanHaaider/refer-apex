"use client";

import { useEffect, useState } from "react";

export function GoogleConnectionCard() {
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [isMock, setIsMock] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  useEffect(() => {
    fetch("/api/google/status")
      .then((r) => r.json())
      .then((data) => {
        setConnected(Boolean(data.connected));
        setEmail(data.email ?? null);
        setIsMock(Boolean(data.isMock));
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleDisconnect() {
    setDisconnecting(true);
    try {
      await fetch("/api/google/disconnect", { method: "POST" });
      setConnected(false);
      setEmail(null);
    } finally {
      setDisconnecting(false);
    }
  }

  return (
    <div className="max-w-xl rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-sm font-semibold text-charcoal">
        Google Business Profile
      </h2>

      {loading ? (
        <p className="mt-3 text-sm text-gray-500">Checking connection…</p>
      ) : connected ? (
        <>
          <p className="mt-3 text-sm text-gray-600">
            Connected as{" "}
            <span className="font-medium text-charcoal">{email}</span>
            {isMock ? (
              <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                Demo Data
              </span>
            ) : null}
          </p>
          <button
            type="button"
            onClick={handleDisconnect}
            disabled={disconnecting}
            className="mt-4 inline-flex h-10 items-center justify-center rounded-xl border border-gray-200 px-4 text-sm font-semibold text-gray-700 transition-colors hover:bg-off-white disabled:opacity-60"
          >
            {disconnecting ? "Disconnecting…" : "Disconnect"}
          </button>
        </>
      ) : (
        <p className="mt-3 text-sm text-gray-600">
          Not connected. Connect your Google Business Profile from the
          Reviews page to see your locations and reviews here.
        </p>
      )}
    </div>
  );
}
