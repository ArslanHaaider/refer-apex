import { forwardRef, type ReactNode } from "react";

type SectionRootProps = {
  children: ReactNode;
  id?: string;
  className?: string;
};

const Root = forwardRef<HTMLElement, SectionRootProps>(function Root(
  { children, id, className = "" },
  ref,
) {
  return (
    <section ref={ref} id={id} className={`py-20 ${className}`}>
      {children}
    </section>
  );
});

type SectionTextProps = {
  children: ReactNode;
  className?: string;
};

function Eyebrow({ children, className = "" }: SectionTextProps) {
  return (
    <p
      className={`mb-3 text-sm font-medium uppercase tracking-widest text-emerald ${className}`}
    >
      {children}
    </p>
  );
}

function Heading({ children, className = "" }: SectionTextProps) {
  return (
    <h2
      className={`text-[32px] font-semibold leading-tight tracking-tight text-charcoal ${className}`}
    >
      {children}
    </h2>
  );
}

function Body({ children, className = "" }: SectionTextProps) {
  return (
    <p className={`mt-4 text-base leading-relaxed text-gray-600 ${className}`}>
      {children}
    </p>
  );
}

export const Section = {
  Root,
  Eyebrow,
  Heading,
  Body,
};
