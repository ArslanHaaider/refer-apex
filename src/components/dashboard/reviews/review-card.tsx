"use client";

import { useState } from "react";
import { Star, CornerDownRight } from "lucide-react";
import type { GoogleReview } from "@/lib/reviews/types";

type ReviewCardProps = {
  review: GoogleReview;
  onReply?: (reviewId: string, comment: string) => Promise<void>;
};

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < rating
              ? "fill-amber-400 text-amber-400"
              : "fill-gray-100 text-gray-300"
          }`}
          aria-hidden
        />
      ))}
    </div>
  );
}

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("");

  const colors = [
    "bg-blue-100 text-blue-700",
    "bg-purple-100 text-purple-700",
    "bg-orange-100 text-orange-700",
    "bg-teal-100 text-teal-700",
    "bg-rose-100 text-rose-700",
    "bg-indigo-100 text-indigo-700",
  ];
  const colorClass = colors[name.charCodeAt(0) % colors.length];

  return (
    <span
      className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${colorClass}`}
      aria-hidden
    >
      {initials}
    </span>
  );
}

function timeAgo(isoString: string): string {
  const diffMs = Date.now() - new Date(isoString).getTime();
  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);

  if (seconds < 60) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  if (weeks < 4) return `${weeks} week${weeks === 1 ? "" : "s"} ago`;
  if (months < 12) return `${months} month${months === 1 ? "" : "s"} ago`;
  return `${Math.floor(months / 12)}y ago`;
}

export function ReviewCard({ review, onReply }: ReviewCardProps) {
  const [replying, setReplying] = useState(false);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!onReply || !comment.trim()) return;
    setSubmitting(true);
    try {
      await onReply(review.id, comment.trim());
      setReplying(false);
      setComment("");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <Avatar name={review.reviewerName} />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-semibold text-charcoal">{review.reviewerName}</p>
            <time
              dateTime={review.createdAt}
              className="text-xs text-gray-500"
            >
              {timeAgo(review.createdAt)}
            </time>
          </div>
          <StarRow rating={review.starRating} />
        </div>
      </div>

      {review.comment ? (
        <p className="mt-3 text-sm leading-relaxed text-gray-700">
          {review.comment}
        </p>
      ) : null}

      {review.ownerReply ? (
        <div className="mt-4 flex gap-2.5 rounded-xl bg-emerald/5 p-3.5">
          <CornerDownRight
            className="mt-0.5 h-4 w-4 shrink-0 text-emerald"
            strokeWidth={1.75}
          />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-emerald">Owner replied</p>
            <p className="mt-1 text-sm leading-relaxed text-gray-700">
              {review.ownerReply}
            </p>
          </div>
        </div>
      ) : onReply ? (
        replying ? (
          <div className="mt-4 space-y-2">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={2}
              placeholder="Write a reply…"
              className="w-full rounded-xl border border-gray-200 p-3 text-sm text-charcoal focus:border-emerald focus:outline-none"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting || !comment.trim()}
                className="inline-flex h-9 items-center justify-center rounded-lg bg-emerald px-4 text-xs font-semibold text-white disabled:opacity-60"
              >
                {submitting ? "Sending…" : "Send reply"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setReplying(false);
                  setComment("");
                }}
                className="inline-flex h-9 items-center justify-center rounded-lg border border-gray-200 px-4 text-xs font-semibold text-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setReplying(true)}
            className="mt-3 text-xs font-semibold text-emerald hover:underline"
          >
            Reply
          </button>
        )
      ) : null}
    </article>
  );
}
