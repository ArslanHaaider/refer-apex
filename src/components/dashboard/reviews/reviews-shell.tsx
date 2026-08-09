"use client";

import { useState, useEffect } from "react";
import type { GoogleLocation, GoogleReview, StarRating } from "@/lib/reviews/types";
import { GoogleConnectPrompt } from "./google-connect-prompt";
import { BusinessSelector } from "./business-selector";
import { ReviewsHeader } from "./reviews-header";
import { ReviewsStatsBar } from "./reviews-stats-bar";
import { ReviewsFilterBar } from "./reviews-filter-bar";
import { ReviewCard } from "./review-card";

type SortOrder = "newest" | "oldest" | "highest" | "lowest";

const PAGE_SIZE = 10;

// ─── Skeleton ────────────────────────────────────────────────────────────────

function ReviewsSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }, (_, i) => (
        <div
          key={i}
          className="h-36 animate-pulse rounded-2xl bg-gray-100"
        />
      ))}
    </div>
  );
}

// ─── Pagination ──────────────────────────────────────────────────────────────

function Pagination({
  current,
  total,
  onChange,
}: {
  current: number;
  total: number;
  onChange: (page: number) => void;
}) {
  if (total <= 1) return null;

  const pages = Array.from({ length: total }, (_, i) => i + 1);
  const visible = pages.filter(
    (p) => p === 1 || p === total || Math.abs(p - current) <= 1,
  );

  const rendered: Array<number | "ellipsis-start" | "ellipsis-end"> = [];
  let prev = 0;
  for (const p of visible) {
    if (p - prev > 1) {
      rendered.push(prev === 0 ? "ellipsis-start" : "ellipsis-end");
    }
    rendered.push(p);
    prev = p;
  }

  return (
    <nav
      className="mt-6 flex items-center justify-center gap-1"
      aria-label="Pagination"
    >
      <button
        type="button"
        onClick={() => onChange(current - 1)}
        disabled={current === 1}
        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 text-sm text-gray-600 disabled:opacity-40 hover:bg-off-white"
      >
        ←
      </button>

      {rendered.map((item, idx) =>
        typeof item === "number" ? (
          <button
            key={item}
            type="button"
            onClick={() => onChange(item)}
            className={`inline-flex h-9 w-9 items-center justify-center rounded-xl text-sm font-medium transition-colors ${
              item === current
                ? "bg-emerald text-white"
                : "border border-gray-200 text-gray-700 hover:bg-off-white"
            }`}
          >
            {item}
          </button>
        ) : (
          <span key={`${item}-${idx}`} className="px-1 text-gray-400">
            …
          </span>
        ),
      )}

      <button
        type="button"
        onClick={() => onChange(current + 1)}
        disabled={current === total}
        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 text-sm text-gray-600 disabled:opacity-40 hover:bg-off-white"
      >
        →
      </button>
    </nav>
  );
}

// ─── Shell ───────────────────────────────────────────────────────────────────

export function ReviewsShell() {
  // Connection state
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [isMock, setIsMock] = useState(false);
  const [connectionEmail, setConnectionEmail] = useState("");

  // Location state
  const [locations, setLocations] = useState<GoogleLocation[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<GoogleLocation | null>(null);

  // Reviews state
  const [reviews, setReviews] = useState<GoogleReview[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [repliedCount, setRepliedCount] = useState(0);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // Filter state
  const [starFilter, setStarFilter] = useState<0 | StarRating>(0);
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  const [currentPage, setCurrentPage] = useState(1);

  // ── Check connection on mount ───────────────────────────────────────────
  useEffect(() => {
    fetch("/api/google/status")
      .then((r) => r.json())
      .then(async (data) => {
        setIsMock(data.isMock ?? false);
        if (data.connected) {
          setIsConnected(true);
          setConnectionEmail(data.email ?? "");
          const locData = await fetch("/api/google/locations").then((r) => r.json());
          setLocations(locData.locations ?? []);
          setConnectionEmail(locData.connectionEmail ?? data.email ?? "");
        }
      })
      .finally(() => setCheckingStatus(false));
  }, []);

  // ── Connect handler ─────────────────────────────────────────────────────
  async function handleConnect() {
    if (!isMock) {
      window.location.href = "/api/google/auth";
      return;
    }

    setConnecting(true);
    try {
      const res = await fetch("/api/google/connect", { method: "POST" });
      const data = await res.json();
      if (data.connected) {
        const locData = await fetch("/api/google/locations").then((r) => r.json());
        setConnectionEmail(locData.connectionEmail ?? data.email ?? "");
        setLocations(locData.locations ?? []);
        setIsConnected(true);
      }
    } finally {
      setConnecting(false);
    }
  }

  // ── Reply handler ───────────────────────────────────────────────────────
  async function handleReply(reviewId: string, comment: string) {
    const res = await fetch("/api/google/reviews/reply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reviewId, comment }),
    });

    if (!res.ok) {
      throw new Error("Failed to submit reply");
    }

    const data = await res.json();
    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId
          ? { ...r, ownerReply: data.ownerReply, ownerReplyUpdatedAt: data.ownerReplyUpdatedAt }
          : r,
      ),
    );
    setRepliedCount((prev) => prev + 1);
  }

  // ── Select location ─────────────────────────────────────────────────────
  async function handleSelectLocation(location: GoogleLocation) {
    setSelectedLocation(location);
    setReviews([]);
    setReviewsLoading(true);
    setStarFilter(0);
    setSortOrder("newest");
    setCurrentPage(1);

    try {
      const res = await fetch(
        `/api/google/reviews?locationId=${encodeURIComponent(location.id)}`,
      );
      const data = await res.json();
      setReviews(data.reviews ?? []);
      setTotalCount(data.totalCount ?? 0);
      setAverageRating(data.averageRating ?? 0);
      setRepliedCount(data.repliedCount ?? 0);
    } finally {
      setReviewsLoading(false);
    }
  }

  // ── Sync handler ────────────────────────────────────────────────────────
  async function handleSync() {
    if (!selectedLocation) return;
    setSyncing(true);
    try {
      const res = await fetch(
        `/api/google/reviews?locationId=${encodeURIComponent(selectedLocation.id)}`,
      );
      const data = await res.json();
      setReviews(data.reviews ?? []);
      setTotalCount(data.totalCount ?? 0);
      setAverageRating(data.averageRating ?? 0);
      setRepliedCount(data.repliedCount ?? 0);
    } finally {
      setSyncing(false);
    }
  }

  // ── Filter + sort + paginate ────────────────────────────────────────────
  const filtered = reviews
    .filter((r) => (starFilter === 0 ? true : r.starRating === starFilter))
    .sort((a, b) => {
      if (sortOrder === "newest")
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortOrder === "oldest")
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortOrder === "highest") return b.starRating - a.starRating;
      return a.starRating - b.starRating;
    });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  function handleStarFilter(star: 0 | StarRating) {
    setStarFilter(star);
    setCurrentPage(1);
  }

  function handleSortChange(sort: SortOrder) {
    setSortOrder(sort);
    setCurrentPage(1);
  }

  // ── Render ──────────────────────────────────────────────────────────────

  if (checkingStatus) {
    return (
      <div className="flex items-center justify-center py-24">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-emerald" />
      </div>
    );
  }

  if (!isConnected) {
    return (
      <>
        <h1 className="text-2xl font-bold tracking-tight text-charcoal">
          Reviews
        </h1>
        <p className="mt-1 mb-8 text-sm text-gray-600">
          Connect your Google Business Profile to see all your reviews here.
        </p>
        <GoogleConnectPrompt
          isMock={isMock}
          connecting={connecting}
          onConnect={handleConnect}
        />
      </>
    );
  }

  if (!selectedLocation) {
    return (
      <>
        <h1 className="text-2xl font-bold tracking-tight text-charcoal">
          Reviews
        </h1>
        <p className="mt-1 mb-8 text-sm text-gray-600">
          Connected as{" "}
          <span className="font-medium text-charcoal">{connectionEmail}</span>
          {isMock ? (
            <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              Demo Data
            </span>
          ) : null}
        </p>
        <BusinessSelector
          locations={locations}
          connectionEmail={connectionEmail}
          isMock={isMock}
          onSelect={handleSelectLocation}
        />
      </>
    );
  }

  return (
    <>
      <ReviewsHeader
        locations={locations}
        selected={selectedLocation}
        connectionEmail={connectionEmail}
        isMock={isMock}
        syncing={syncing}
        onChangeLocation={handleSelectLocation}
        onSync={handleSync}
      />

      <ReviewsStatsBar
        totalCount={totalCount}
        averageRating={averageRating}
        repliedCount={repliedCount}
        shownCount={reviews.length}
      />

      {reviewsLoading ? (
        <ReviewsSkeleton />
      ) : (
        <>
          <ReviewsFilterBar
            starFilter={starFilter}
            sortOrder={sortOrder}
            totalShown={reviews.length}
            filteredCount={filtered.length}
            onStarFilter={handleStarFilter}
            onSortChange={handleSortChange}
          />

          {paginated.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center">
              <p className="text-sm text-gray-500">
                No reviews match the selected filter.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {paginated.map((review) => (
                <ReviewCard key={review.id} review={review} onReply={handleReply} />
              ))}
            </div>
          )}

          <Pagination
            current={currentPage}
            total={totalPages}
            onChange={setCurrentPage}
          />
        </>
      )}
    </>
  );
}
