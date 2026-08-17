"use client";

import { useEffect, useState } from "react";

type ReferralInfo = {
  referrerName: string;
  businessLabel: string;
  discountType: "percent" | "fixed";
  discountValue: number;
  discountDescription: string;
};

export function ReferralCaptureForm({ token }: { token: string }) {
  const [info, setInfo] = useState<ReferralInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`/api/public/referral/${token}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Invalid link");
        setInfo(data);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/public/referral/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, phone, email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Submission failed");
      const origin = window.location.origin;
      setShareLink(`${origin}/b/${data.leadToken}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  }

  async function copyLink() {
    if (!shareLink) return;
    await navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-600">
        Loading referral…
      </div>
    );
  }

  if (!info) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center">
        <p className="text-sm text-red-600">{error ?? "This referral link is invalid."}</p>
      </div>
    );
  }

  const discountLabel =
    info.discountType === "percent"
      ? `${info.discountValue}% off`
      : `$${info.discountValue} off`;

  if (shareLink) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald">
          Referral sent
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-charcoal">
          Share this booking link
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Send this link to {fullName.split(" ")[0] || "your friend"} so they can book and claim{" "}
          <span className="font-semibold text-emerald">{discountLabel}</span>.
        </p>
        <div className="mt-5 rounded-xl bg-off-white p-3 text-sm break-all text-charcoal">
          {shareLink}
        </div>
        <button
          type="button"
          onClick={copyLink}
          className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-xl bg-emerald text-sm font-semibold text-white"
        >
          {copied ? "Copied!" : "Copy booking link"}
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-emerald">
        Referral invite
      </p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight text-charcoal">
        Refer a friend to {info.businessLabel}
      </h1>
      <p className="mt-2 text-sm text-gray-600">
        Hi {info.referrerName.split(" ")[0]}. Your friend gets{" "}
        <span className="font-semibold text-emerald">{discountLabel}</span>
        {info.discountDescription ? ` — ${info.discountDescription}` : ""}.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <label className="block">
          <span className="text-xs font-semibold text-gray-700">Friend&apos;s name</span>
          <input
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-emerald focus:outline-none"
            placeholder="Full name"
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-gray-700">Friend&apos;s phone</span>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-emerald focus:outline-none"
            placeholder="+1…"
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-gray-700">Friend&apos;s email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-emerald focus:outline-none"
            placeholder="friend@example.com"
          />
        </label>
        <p className="text-xs text-gray-500">Provide at least a phone or email.</p>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-emerald text-sm font-semibold text-white disabled:opacity-60"
        >
          {submitting ? "Creating link…" : "Create booking link"}
        </button>
      </form>
    </div>
  );
}
