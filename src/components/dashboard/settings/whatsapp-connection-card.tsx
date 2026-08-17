"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    FB?: {
      init: (params: { appId: string; version: string }) => void;
      login: (
        callback: (response: { authResponse?: { code?: string } }) => void,
        params: Record<string, unknown>,
      ) => void;
    };
    fbAsyncInit?: () => void;
  }
}

const SDK_SRC = "https://connect.facebook.net/en_US/sdk.js";
const TRUSTED_ORIGIN = "https://www.facebook.com";
const SIGNUP_WAIT_MS = 15_000;

// Cached across calls so re-mounts (e.g. Fast Refresh) never skip FB.init —
// relying on `window.FB` truthiness to decide that is what caused
// "FB.login() called before FB.init()" when the script/global survived a
// remount but init hadn't actually run yet.
let fbSdkPromise: Promise<void> | null = null;

function loadFacebookSdk(): Promise<void> {
  if (fbSdkPromise) return fbSdkPromise;

  fbSdkPromise = new Promise((resolve, reject) => {
    const appId = process.env.NEXT_PUBLIC_META_APP_ID;
    if (!appId) {
      reject(new Error("NEXT_PUBLIC_META_APP_ID is not configured."));
      return;
    }

    function initAndResolve() {
      window.FB?.init({ appId: appId as string, version: "v21.0" });
      resolve();
    }

    if (window.FB) {
      initAndResolve();
      return;
    }

    window.fbAsyncInit = initAndResolve;

    if (document.getElementById("facebook-jssdk")) {
      // Script tag already inserted by an earlier call; fbAsyncInit above
      // will fire once it finishes loading.
      return;
    }

    const script = document.createElement("script");
    script.id = "facebook-jssdk";
    script.src = SDK_SRC;
    script.async = true;
    script.onerror = () => {
      fbSdkPromise = null;
      reject(new Error("Failed to load Facebook SDK"));
    };
    document.body.appendChild(script);
  });

  return fbSdkPromise;
}

export function WhatsappConnectionCard() {
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [displayPhoneNumber, setDisplayPhoneNumber] = useState<string | null>(null);
  const [isMock, setIsMock] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signupInfo = useRef<{ wabaId: string; phoneNumberId: string } | null>(null);

  function refreshStatus() {
    return fetch("/api/whatsapp/status")
      .then((r) => r.json())
      .then((data) => {
        setConnected(Boolean(data.connected));
        setDisplayPhoneNumber(data.displayPhoneNumber ?? null);
        setIsMock(Boolean(data.isMock));
      });
  }

  useEffect(() => {
    refreshStatus().finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.origin !== TRUSTED_ORIGIN) return;
      let data: unknown = event.data;
      if (typeof data === "string") {
        try {
          data = JSON.parse(data);
        } catch {
          return;
        }
      }
      const payload = data as {
        type?: string;
        event?: string;
        data?: { waba_id?: string; phone_number_id?: string };
      };
      if (payload.type === "WA_EMBEDDED_SIGNUP" && payload.event === "FINISH" && payload.data) {
        signupInfo.current = {
          wabaId: payload.data.waba_id ?? "",
          phoneNumberId: payload.data.phone_number_id ?? "",
        };
      }
    }

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  async function handleConnect() {
    setError(null);
    setConnecting(true);
    try {
      if (isMock) {
        const res = await fetch("/api/whatsapp/connect", { method: "POST" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Connect failed");
        await refreshStatus();
        return;
      }

      signupInfo.current = null;
      await loadFacebookSdk();

      const code = await new Promise<string>((resolve, reject) => {
        window.FB?.login(
          (response) => {
            const authCode = response.authResponse?.code;
            if (authCode) {
              resolve(authCode);
            } else {
              reject(new Error("WhatsApp connection was cancelled."));
            }
          },
          {
            config_id: process.env.NEXT_PUBLIC_META_WHATSAPP_CONFIG_ID,
            response_type: "code",
            override_default_response_type: true,
            extras: { sessionInfoVersion: "3" },
          },
        );
      });

      const deadline = Date.now() + SIGNUP_WAIT_MS;
      while (!signupInfo.current && Date.now() < deadline) {
        await new Promise((r) => setTimeout(r, 250));
      }
      const info = signupInfo.current as { wabaId: string; phoneNumberId: string } | null;
      if (!info?.wabaId || !info?.phoneNumberId) {
        throw new Error("Didn't receive WhatsApp business account details. Please try again.");
      }

      const res = await fetch("/api/whatsapp/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, wabaId: info.wabaId, phoneNumberId: info.phoneNumberId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to connect WhatsApp");
      await refreshStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect WhatsApp");
    } finally {
      setConnecting(false);
    }
  }

  async function handleDisconnect() {
    setDisconnecting(true);
    try {
      await fetch("/api/whatsapp/disconnect", { method: "POST" });
      setConnected(false);
      setDisplayPhoneNumber(null);
    } finally {
      setDisconnecting(false);
    }
  }

  return (
    <div className="max-w-xl rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-sm font-semibold text-charcoal">WhatsApp Business</h2>

      {loading ? (
        <p className="mt-3 text-sm text-gray-500">Checking connection…</p>
      ) : connected ? (
        <>
          <p className="mt-3 text-sm text-gray-600">
            Connected as{" "}
            <span className="font-medium text-charcoal">{displayPhoneNumber}</span>
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
        <>
          <p className="mt-3 text-sm text-gray-600">
            Connect your WhatsApp Business number to send referral messages over WhatsApp.
          </p>
          <button
            type="button"
            onClick={() => void handleConnect()}
            disabled={connecting}
            className="mt-4 inline-flex h-10 items-center justify-center rounded-xl bg-emerald px-4 text-sm font-semibold text-white transition-colors hover:bg-emerald-dark disabled:opacity-60"
          >
            {connecting ? "Connecting…" : "Connect WhatsApp"}
          </button>
        </>
      )}

      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
