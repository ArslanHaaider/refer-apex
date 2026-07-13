"use client";

import { MapPin, Star } from "lucide-react";
import type { GoogleLocation } from "@/lib/reviews/types";

type BusinessSelectorProps = {
  locations: GoogleLocation[];
  connectionEmail: string;
  isMock: boolean;
  onSelect: (location: GoogleLocation) => void;
};

function StarDisplay({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-1">
      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-hidden />
      <span className="text-sm font-semibold text-charcoal">
        {rating.toFixed(1)}
      </span>
    </span>
  );
}

export function BusinessSelector({
  locations,
  connectionEmail,
  isMock,
  onSelect,
}: BusinessSelectorProps) {
  return (
    <div>
      <div className="mb-6 flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-charcoal">
          Select a business location
        </h2>
        <p className="text-sm text-gray-600">
          Connected as{" "}
          <span className="font-medium text-charcoal">{connectionEmail}</span>
          {isMock ? (
            <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
              Demo
            </span>
          ) : null}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {locations.map((location) => (
          <button
            key={location.id}
            type="button"
            onClick={() => onSelect(location)}
            className="group flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5 text-left shadow-sm transition-all hover:border-emerald hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald focus-visible:ring-offset-2"
          >
            <div className="flex items-start justify-between gap-3">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald/10 text-emerald">
                <MapPin className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <StarDisplay rating={location.averageRating} />
            </div>

            <div className="min-w-0">
              <p className="truncate font-semibold text-charcoal transition-colors group-hover:text-emerald">
                {location.displayName}
              </p>
              <p className="mt-0.5 truncate text-xs text-gray-500">
                {location.address}
              </p>
            </div>

            <div className="flex items-center justify-between border-t border-gray-100 pt-3">
              <span className="text-xs text-gray-500">
                {location.reviewCount.toLocaleString()} reviews
              </span>
              <span className="text-xs font-semibold text-emerald opacity-0 transition-opacity group-hover:opacity-100">
                View reviews →
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
