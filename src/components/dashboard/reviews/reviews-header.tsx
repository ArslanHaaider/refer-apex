"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, RefreshCw, MapPin } from "lucide-react";
import type { GoogleLocation } from "@/lib/reviews/types";

type ReviewsHeaderProps = {
  locations: GoogleLocation[];
  selected: GoogleLocation;
  connectionEmail: string;
  isMock: boolean;
  syncing: boolean;
  onChangeLocation: (location: GoogleLocation) => void;
  onSync: () => void;
};

export function ReviewsHeader({
  locations,
  selected,
  connectionEmail,
  isMock,
  syncing,
  onChangeLocation,
  onSync,
}: ReviewsHeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-charcoal">
          Reviews
        </h1>
        <p className="text-sm text-gray-600">
          Connected as{" "}
          <span className="font-medium text-charcoal">{connectionEmail}</span>
          {isMock ? (
            <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              Demo Data
            </span>
          ) : null}
        </p>
      </div>

      <div className="flex items-center gap-2">
        {/* Location picker dropdown */}
        <div ref={dropdownRef} className="relative">
          <button
            type="button"
            onClick={() => setDropdownOpen((o) => !o)}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-sm font-medium text-charcoal shadow-sm transition-colors hover:bg-off-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald focus-visible:ring-offset-1"
          >
            <MapPin className="h-4 w-4 shrink-0 text-gray-500" strokeWidth={1.75} />
            <span className="max-w-[180px] truncate">{selected.displayName}</span>
            <ChevronDown
              className={`h-4 w-4 shrink-0 text-gray-500 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
              strokeWidth={1.75}
            />
          </button>

          {dropdownOpen ? (
            <div className="absolute right-0 z-50 mt-1.5 w-72 rounded-2xl border border-gray-200 bg-white py-1.5 shadow-lg">
              {locations.map((loc) => (
                <button
                  key={loc.id}
                  type="button"
                  onClick={() => {
                    onChangeLocation(loc);
                    setDropdownOpen(false);
                  }}
                  className={`flex w-full items-start gap-3 px-4 py-3 text-left text-sm transition-colors hover:bg-off-white ${
                    loc.id === selected.id ? "bg-emerald/5" : ""
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <p
                      className={`truncate font-medium ${
                        loc.id === selected.id ? "text-emerald" : "text-charcoal"
                      }`}
                    >
                      {loc.displayName}
                    </p>
                    <p className="truncate text-xs text-gray-500">{loc.address}</p>
                  </div>
                  {loc.id === selected.id ? (
                    <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-emerald" />
                  ) : null}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        {/* Sync button */}
        <button
          type="button"
          onClick={onSync}
          disabled={syncing}
          title="Sync reviews"
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 shadow-sm transition-colors hover:bg-off-white hover:text-charcoal disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald focus-visible:ring-offset-1"
        >
          <RefreshCw
            className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`}
            strokeWidth={1.75}
          />
          <span className="sr-only">Sync reviews</span>
        </button>
      </div>
    </div>
  );
}
