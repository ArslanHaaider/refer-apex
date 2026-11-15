"use client";

import { useEffect, useRef } from "react";

type CountUpProps = {
  /** Text or number whose first numeric token is animated, e.g. "4.8", "1,248", "+18% vs last month". */
  value: string | number;
  duration?: number;
  delay?: number;
  className?: string;
};

const NUMBER_PATTERN = /\d[\d,]*(?:\.\d+)?/;

function format(n: number, decimals: number, grouped: boolean) {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    useGrouping: grouped,
  });
}

export function CountUp({ value, duration = 1400, delay = 0, className }: CountUpProps) {
  const text = String(value);
  const match = NUMBER_PATTERN.exec(text);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !match) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const token = match[0];
    const target = parseFloat(token.replace(/,/g, ""));
    const decimals = token.includes(".") ? token.split(".")[1].length : 0;
    const grouped = token.includes(",");
    const before = text.slice(0, match.index);
    const after = text.slice(match.index + token.length);
    const render = (n: number) => {
      el.textContent = `${before}${format(n, decimals, grouped)}${after}`;
    };

    render(0);
    let frame = 0;
    let start = 0;
    const tick = (now: number) => {
      if (!start) start = now;
      const t = Math.min((now - start) / duration, 1);
      render(target * (1 - Math.pow(1 - t, 4))); // ease-out quart
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    const timer = setTimeout(() => {
      frame = requestAnimationFrame(tick);
    }, delay);

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(frame);
      render(target);
    };
  }, [text, duration, delay]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <span ref={ref} className={`tabular-nums ${className ?? ""}`}>
      {text}
    </span>
  );
}
