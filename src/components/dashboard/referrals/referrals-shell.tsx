"use client";

import { useCallback, useEffect, useState } from "react";
import type {
  FunnelMetrics,
  ReferralCampaign,
  ReferralLeadRow,
  ReferralRequestRow,
} from "@/lib/referrals/types";

const EMPTY_METRICS: FunnelMetrics = {
  sent: 0,
  clicked: 0,
  referralSubmitted: 0,
  bookingStarted: 0,
  booked: 0,
  rewarded: 0,
};

export function ReferralsShell() {
  const [campaigns, setCampaigns] = useState<ReferralCampaign[]>([]);
  const [campaignId, setCampaignId] = useState<string>("");
  const [metrics, setMetrics] = useState<FunnelMetrics>(EMPTY_METRICS);
  const [leads, setLeads] = useState<ReferralLeadRow[]>([]);
  const [requests, setRequests] = useState<ReferralRequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const campaignsRes = await fetch("/api/campaigns").then((r) => r.json());
      const list: ReferralCampaign[] = campaignsRes.campaigns ?? [];
      setCampaigns(list);

      const selected = campaignId || list[0]?.id || "";
      if (!campaignId && selected) setCampaignId(selected);

      const qs = selected ? `?campaignId=${encodeURIComponent(selected)}` : "";
      const [leadsRes, requestsRes] = await Promise.all([
        fetch(`/api/referrals/leads${qs}`).then((r) => r.json()),
        fetch(`/api/referrals/requests${qs}`).then((r) => r.json()),
      ]);

      if (leadsRes.error) throw new Error(leadsRes.error);
      setMetrics(leadsRes.metrics ?? EMPTY_METRICS);
      setLeads(leadsRes.leads ?? []);
      setRequests(requestsRes.requests ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load referrals");
    } finally {
      setLoading(false);
    }
  }, [campaignId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  if (loading && campaigns.length === 0) {
    return (
      <div className="flex items-center justify-center py-24">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-emerald" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-charcoal">Referrals</h1>
          <p className="mt-1 text-sm text-gray-600">
            Track sends, clicks, submissions, bookings, and rewards.
          </p>
        </div>
        <label className="text-sm">
          <span className="mr-2 font-medium text-gray-700">Campaign</span>
          <select
            value={campaignId}
            onChange={(e) => setCampaignId(e.target.value)}
            className="rounded-xl border border-gray-200 px-3 py-2"
          >
            <option value="">All campaigns</option>
            {campaigns.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <FunnelCard label="Sent" value={metrics.sent} />
        <FunnelCard label="Clicked" value={metrics.clicked} />
        <FunnelCard label="Submitted" value={metrics.referralSubmitted} />
        <FunnelCard label="Booking started" value={metrics.bookingStarted} />
        <FunnelCard label="Booked" value={metrics.booked} />
        <FunnelCard label="Rewarded" value={metrics.rewarded} />
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-charcoal">Referral leads</h2>
        {leads.length === 0 ? (
          <p className="mt-3 text-sm text-gray-500">No referral leads yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-xs uppercase text-gray-500">
                <tr>
                  <th className="pb-2 pr-4 font-semibold">Lead</th>
                  <th className="pb-2 pr-4 font-semibold">Referrer</th>
                  <th className="pb-2 pr-4 font-semibold">Campaign</th>
                  <th className="pb-2 pr-4 font-semibold">Status</th>
                  <th className="pb-2 font-semibold">Created</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id} className="border-t border-gray-100">
                    <td className="py-3 pr-4">
                      <p className="font-medium text-charcoal">{lead.fullName}</p>
                      <p className="text-xs text-gray-500">
                        {lead.email ?? lead.phone ?? "—"}
                      </p>
                    </td>
                    <td className="py-3 pr-4 text-gray-700">{lead.referrerName}</td>
                    <td className="py-3 pr-4 text-gray-700">{lead.campaignName}</td>
                    <td className="py-3 pr-4">
                      <StatusPill status={lead.status} />
                    </td>
                    <td className="py-3 text-gray-600">
                      {new Date(lead.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-charcoal">Outbound requests</h2>
        {requests.length === 0 ? (
          <p className="mt-3 text-sm text-gray-500">No outbound referral requests yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-xs uppercase text-gray-500">
                <tr>
                  <th className="pb-2 pr-4 font-semibold">Contact</th>
                  <th className="pb-2 pr-4 font-semibold">Channel</th>
                  <th className="pb-2 pr-4 font-semibold">Status</th>
                  <th className="pb-2 font-semibold">Sent</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req.id} className="border-t border-gray-100">
                    <td className="py-3 pr-4">
                      <p className="font-medium text-charcoal">{req.contactName}</p>
                      <p className="text-xs text-gray-500">
                        {req.channel === "email" ? req.contactEmail : req.contactPhone}
                      </p>
                    </td>
                    <td className="py-3 pr-4 capitalize text-gray-700">{req.channel}</td>
                    <td className="py-3 pr-4">
                      <StatusPill status={req.status} />
                    </td>
                    <td className="py-3 text-gray-600">
                      {req.sentAt ? new Date(req.sentAt).toLocaleString() : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function FunnelCard({ label, value }: { label: string; value: number }) {
  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className="mt-2 text-2xl font-bold tracking-tight text-charcoal">{value}</p>
    </article>
  );
}

function StatusPill({ status }: { status: string }) {
  return (
    <span className="inline-flex rounded-full bg-emerald/10 px-2 py-0.5 text-xs font-semibold capitalize text-emerald">
      {status.replaceAll("_", " ")}
    </span>
  );
}
