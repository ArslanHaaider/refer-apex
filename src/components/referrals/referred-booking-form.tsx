"use client";

import { useEffect, useState } from "react";

type LeadInfo = {
  leadName: string;
  referrerName: string;
  businessLabel: string;
  discountType: "percent" | "fixed";
  discountValue: number;
  discountDescription: string;
  status: string;
};

export function ReferredBookingForm({ token }: { token: string }) {
  const [info, setInfo] = useState<LeadInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [preferredDate, setPreferredDate] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    fetch(`/api/public/lead/${token}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Invalid link");
        setInfo(data);
        if (data.status === "booked" || data.status === "rewarded") {
          setDone(true);
        }
        // Track booking started when page opens for booking.
        await fetch(`/api/public/lead/${token}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "start" }),
        });
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  async function handleBook(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/public/lead/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "book",
          preferredDate,
          notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Booking failed");
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Booking failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-600">
        Loading booking…
      </div>
    );
  }

  if (!info) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center">
        <p className="text-sm text-red-600">{error ?? "This booking link is invalid."}</p>
      </div>
    );
  }

  const discountLabel =
    info.discountType === "percent"
      ? `${info.discountValue}% off`
      : `$${info.discountValue} off`;

  if (done) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald">
          Confirmed
        </p>
        <h1 className="mt-2 text-2xl font-bold text-charcoal">You&apos;re booked!</h1>
        <p className="mt-2 text-sm text-gray-600">
          Your {discountLabel} referral reward has been applied for your visit with{" "}
          {info.businessLabel}.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-emerald">
        Book your visit
      </p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight text-charcoal">
        Hi {info.leadName.split(" ")[0]}
      </h1>
      <p className="mt-2 text-sm text-gray-600">
        Referred by <span className="font-medium text-charcoal">{info.referrerName}</span>.
        Book now and get <span className="font-semibold text-emerald">{discountLabel}</span>
        {info.discountDescription ? ` — ${info.discountDescription}` : ""}.
      </p>

      <form onSubmit={handleBook} className="mt-6 space-y-4">
        <label className="block">
          <span className="text-xs font-semibold text-gray-700">Preferred date</span>
          <input
            type="date"
            required
            value={preferredDate}
            onChange={(e) => setPreferredDate(e.target.value)}
            className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-emerald focus:outline-none"
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-gray-700">Notes (optional)</span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-emerald focus:outline-none"
            placeholder="Preferred time, service, etc."
          />
        </label>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-emerald text-sm font-semibold text-white disabled:opacity-60"
        >
          {submitting ? "Booking…" : "Book appointment"}
        </button>
      </form>
    </div>
  );
}
