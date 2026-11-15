import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";
import type { LatestReview } from "@/lib/dashboard/overview-data";

const toneClasses = {
  mint: "bg-emerald-100 text-emerald",
  peach: "bg-accent-soft text-accent",
  sand: "bg-gray-100 text-gray-600",
} as const;

type LatestReviewsProps = {
  reviews: LatestReview[];
};

export function LatestReviews({ reviews }: LatestReviewsProps) {
  return (
    <section
      className="card rise flex flex-col gap-3 px-[22px] py-4"
      style={{ "--d": "460ms" } as React.CSSProperties}
      aria-labelledby="latest-reviews-heading"
    >
      <div className="flex items-baseline justify-between">
        <h2 id="latest-reviews-heading" className="text-[19px] font-normal tracking-[-0.01em] text-charcoal">
          Latest reviews
        </h2>
        <Link
          href="/dashboard/reviews"
          className="group inline-flex items-center gap-1 text-xs font-semibold text-emerald hover:text-emerald-dark"
        >
          View all
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      <ul className="grid gap-3 md:grid-cols-3">
        {reviews.map((review) => {
          const initials = review.name
            .split(" ")
            .map((part) => part[0])
            .join("");

          return (
            <li
              key={review.name}
              className="flex items-start gap-2.5 rounded-[10px] bg-gray-50 p-2.5 transition-colors hover:bg-gray-100"
            >
              <span
                aria-hidden
                className={`flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${toneClasses[review.tone]}`}
              >
                {initials}
              </span>
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 text-xs font-semibold text-charcoal">
                  {review.name}
                  <span className="flex gap-px" aria-label={`${review.rating} out of 5 stars`}>
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${
                          i < review.rating ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"
                        }`}
                        aria-hidden
                      />
                    ))}
                  </span>
                </p>
                <p className="mt-0.5 truncate text-xs text-gray-500">{review.text}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
