type LogoProps = {
  className?: string;
};

export function Logo({ className = "" }: LogoProps) {
  return (
    <a href="#" className={`inline-flex items-center gap-1.5 ${className}`}>
      <span className="text-xl font-bold tracking-tight text-charcoal">
        Refer<span className="text-emerald">Apex</span>
      </span>
      <span className="h-2 w-2 rounded-full bg-emerald" aria-hidden="true" />
    </a>
  );
}
