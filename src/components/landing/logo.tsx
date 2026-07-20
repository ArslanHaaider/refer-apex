import Link from "next/link";

type LogoProps = {
  className?: string;
  href?: string;
};

export function Logo({ className = "", href = "/" }: LogoProps) {
  return (
    <Link href={href} className={`group inline-flex items-center gap-2.5 ${className}`}>
      <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald to-emerald-dark shadow-sm shadow-emerald/30 transition-transform duration-300 group-hover:scale-105">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-5 w-5 text-white"
          aria-hidden="true"
        >
          <path
            d="M4 15c4-8 12-8 16 0"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="4" cy="15" r="1.6" fill="currentColor" />
          <circle cx="20" cy="15" r="1.6" fill="currentColor" />
          <circle cx="12" cy="7" r="1.6" fill="currentColor" />
        </svg>
      </span>
      <span className="text-xl font-bold tracking-tight text-charcoal">
        Iqr
        <span className="bg-gradient-to-r from-emerald to-emerald-dark bg-clip-text text-transparent">
          ava
        </span>
      </span>
    </Link>
  );
}
