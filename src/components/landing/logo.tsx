import Link from "next/link";

type LogoProps = {
  className?: string;
  href?: string;
};

export function Logo({ className = "", href = "/" }: LogoProps) {
  return (
    <Link href={href} className={`group inline-flex items-center gap-2.5 ${className}`}>
      <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-emerald ring-1 ring-inset ring-white/10 shadow-sm shadow-emerald/30 transition-transform duration-300 group-hover:scale-105">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-5 w-5 text-white"
          aria-hidden="true"
        >
          <path
            d="m6 15 6-6 6 6"
            stroke="currentColor"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="font-display text-2xl font-semibold tracking-tight text-charcoal">
        Iq
        <span className="text-accent">rava</span>
      </span>
    </Link>
  );
}
