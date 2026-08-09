"use client";

import { useState } from "react";

const CONFIRM_PHRASE = "DELETE";

export function AccountDangerZone() {
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch("/api/account/delete", { method: "POST" });
      if (!res.ok) {
        throw new Error("Failed to delete account");
      }
      window.location.href = "/";
    } catch {
      setError("Something went wrong deleting your account. Please try again or contact support@iqrava.com.");
      setDeleting(false);
    }
  }

  return (
    <div className="max-w-xl rounded-2xl border border-red-200 bg-red-50/40 p-6">
      <h2 className="text-sm font-semibold text-red-700">Danger Zone</h2>
      <p className="mt-2 text-sm text-gray-600">
        Permanently delete your account and all associated data, including
        your profile and any connected Google Business Profile. This cannot
        be undone.
      </p>

      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-4 inline-flex h-10 items-center justify-center rounded-xl border border-red-300 px-4 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100"
        >
          Delete my account
        </button>
      ) : (
        <div className="mt-4 space-y-3">
          <label className="block text-sm text-gray-700">
            Type <span className="font-semibold text-red-700">{CONFIRM_PHRASE}</span> to
            confirm.
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="mt-1 block w-full rounded-xl border border-gray-200 p-2.5 text-sm focus:border-red-400 focus:outline-none"
              autoComplete="off"
            />
          </label>

          {error ? <p className="text-sm text-red-700">{error}</p> : null}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleDelete}
              disabled={confirmText !== CONFIRM_PHRASE || deleting}
              className="inline-flex h-10 items-center justify-center rounded-xl bg-red-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
            >
              {deleting ? "Deleting…" : "Permanently delete account"}
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setConfirmText("");
                setError(null);
              }}
              disabled={deleting}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-gray-200 px-4 text-sm font-semibold text-gray-600 hover:bg-white"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
