"use client";

import { useEffect, useState } from "react";
import type { ClientContact } from "@/lib/referrals/types";

export function ContactsShell() {
  const [contacts, setContacts] = useState<ClientContact[]>([]);
  const [eligibleCount, setEligibleCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/contacts")
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Failed to load contacts");
        setContacts(data.contacts ?? []);
        setEligibleCount(data.eligibleCount ?? 0);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-emerald" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-charcoal">Contacts</h1>
        <p className="mt-1 text-sm text-gray-600">
          Synced from your Google Sheet. {eligibleCount} of {contacts.length} are
          currently eligible for referral campaigns.
        </p>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        {contacts.length === 0 ? (
          <p className="text-sm text-gray-500">
            No contacts yet. Connect a Google Sheet and sync from Campaigns.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-xs uppercase text-gray-500">
                <tr>
                  <th className="pb-2 pr-4 font-semibold">Name</th>
                  <th className="pb-2 pr-4 font-semibold">Phone</th>
                  <th className="pb-2 pr-4 font-semibold">Email</th>
                  <th className="pb-2 pr-4 font-semibold">Last service</th>
                  <th className="pb-2 font-semibold">Eligible</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((contact) => (
                  <tr key={contact.id} className="border-t border-gray-100">
                    <td className="py-3 pr-4 font-medium text-charcoal">
                      {contact.fullName}
                    </td>
                    <td className="py-3 pr-4 text-gray-700">{contact.phone}</td>
                    <td className="py-3 pr-4 text-gray-700">{contact.email}</td>
                    <td className="py-3 pr-4 text-gray-700">
                      {contact.lastServiceDate}
                    </td>
                    <td className="py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                          contact.isEligible
                            ? "bg-emerald/10 text-emerald"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {contact.isEligible ? "Yes" : "No"}
                      </span>
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
