"use client";

import { Star } from "lucide-react";
import type { StarRating } from "@/lib/reviews/types";

type SortOrder = "newest" | "oldest" | "highest" | "lowest";

type ReviewsFilterBarProps = {
  starFilter: 0 | StarRating;
  sortOrder: SortOrder;
  totalShown: number;
  filteredCount: number;
  onStarFilter: (star: 0 | StarRating) => void;
  onSortChange: (sort: SortOrder) => void;
};

const STAR_OPTIONS: Array<{ value: 0 | StarRating; label: string }> = [
  { value: 0, label: "All" },
  { value: 5, label: "5" },
  { value: 4, label: "4" },
  { value: 3, label: "3" },
  { value: 2, label: "2" },
  { value: 1, label: "1" },
];

const SORT_OPTIONS: Array<{ value: SortOrder; label: string }> = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "highest", label: "Highest rated" },
  { value: "lowest", label: "Lowest rated" },
];

export function ReviewsFilterBar({
  starFilter,
  sortOrder,
  totalShown,
  filteredCount,
  onStarFilter,
  onSortChange,
}: ReviewsFilterBarProps) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-1.5 flex-wrap">
        {STAR_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onStarFilter(opt.value)}
            className={`inline-flex h-8 items-center gap-1 rounded-lg px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald focus-visible:ring-offset-1 ${
              starFilter === opt.value
                ? "bg-emerald text-white"
                : "border border-gray-200 bg-white text-gray-700 hover:bg-off-white"
            }`}
          >
            {opt.value === 0 ? (
              "All"
            ) : (
              <>
                {opt.label}
                <Star
                  className={`h-3.5 w-3.5 ${
                    starFilter === opt.value
                      ? "fill-white text-white"
                      : "fill-amber-400 text-amber-400"
                  }`}
                  aria-hidden
                />
              </>
            )}
          </button>
        ))}

        <span className="ml-1 text-xs text-gray-500">
          {filteredCount === totalShown
            ? `${totalShown} reviews`
            : `${filteredCount} of ${totalShown}`}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <label
          htmlFor="reviews-sort"
          className="shrink-0 text-sm text-gray-600"
        >
          Sort:
        </label>
        <select
          id="reviews-sort"
          value={sortOrder}
          onChange={(e) => onSortChange(e.target.value as SortOrder)}
          className="h-9 rounded-xl border border-gray-200 bg-white px-3 text-sm text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
