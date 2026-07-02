import Link from "next/link";
import Image from "next/image";

type LogoProps = {
  className?: string;
  href?: string;
};

export function Logo({ className = "", href = "/" }: LogoProps) {
  return (
    <Link href={href} className={`inline-flex items-center gap-1.5 ${className}`}>
      <span className="text-xl font-bold tracking-tight text-charcoal">
        Refer<span className="text-emerald">Apex</span>
      </span>
      <span className="h-2 w-2 rounded-full bg-emerald" aria-hidden="true" />
    </Link>
  );
}
