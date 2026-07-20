"use client";

import { useEffect, useState } from "react";

const SEGMENTS = [
  { id: "growth-engine", text: "Growth Engine", prefix: "", nowrap: true },
] as const;

const REVEAL_INTERVAL_MS = 550;
const START_DELAY_MS = 400;

type HighlightHeadlineAccentProps = {
  className?: string;
};

export function HighlightHeadlineAccent({ className = "" }: HighlightHeadlineAccentProps) {
  const [revealedCount, setRevealedCount] = useState(0);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
      setRevealedCount(SEGMENTS.length);
      return;
    }

    const timeouts: ReturnType<typeof setTimeout>[] = [];
    const startDelayId = setTimeout(() => {
      SEGMENTS.forEach((_, index) => {
        timeouts.push(
          setTimeout(() => setRevealedCount(index + 1), index * REVEAL_INTERVAL_MS),
        );
      });
    }, START_DELAY_MS);

    return () => {
      clearTimeout(startDelayId);
      timeouts.forEach(clearTimeout);
    };
  }, []);

  return (
    <span className={className}>
      {SEGMENTS.map((segment, index) => {
        const isRevealed = index < revealedCount;

        return (
          <span key={segment.id}>
            {segment.prefix}
            <span
              className={[
                isRevealed ? "highlight-reveal-word" : "text-charcoal",
                "nowrap" in segment && segment.nowrap ? "whitespace-nowrap" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {segment.text}
            </span>
          </span>
        );
      })}
    </span>
  );
}
