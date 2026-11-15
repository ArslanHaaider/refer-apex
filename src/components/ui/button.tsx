import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

type ButtonSize = "sm" | "md" | "lg";

type BaseProps = {
  children: ReactNode;
  size?: ButtonSize;
  className?: string;
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-sm",
};

const baseClasses =
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2";

function Primary({
  children,
  size = "md",
  className = "",
  ...props
}: BaseProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`${baseClasses} bg-emerald text-white shadow-[0_1px_0_rgba(255,255,255,0.18)_inset,0_6px_16px_-6px_rgba(15,107,87,0.55)] hover:bg-emerald-dark hover:shadow-[0_8px_20px_-6px_rgba(15,107,87,0.65)] ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

function Outline({
  children,
  size = "md",
  className = "",
  ...props
}: BaseProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`${baseClasses} border border-gray-200 bg-white text-charcoal hover:bg-off-white ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

function Ghost({
  children,
  size = "md",
  className = "",
  ...props
}: BaseProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`${baseClasses} text-gray-600 hover:bg-off-white hover:text-charcoal ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

function PrimaryLink({
  children,
  size = "md",
  className = "",
  ...props
}: BaseProps & AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      className={`${baseClasses} bg-emerald text-white shadow-[0_1px_0_rgba(255,255,255,0.18)_inset,0_6px_16px_-6px_rgba(15,107,87,0.55)] hover:bg-emerald-dark hover:shadow-[0_8px_20px_-6px_rgba(15,107,87,0.65)] ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </a>
  );
}

function OutlineLink({
  children,
  size = "md",
  className = "",
  ...props
}: BaseProps & AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      className={`${baseClasses} border border-gray-200 bg-white text-charcoal hover:bg-off-white ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </a>
  );
}

function GhostLink({
  children,
  size = "md",
  className = "",
  ...props
}: BaseProps & AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      className={`${baseClasses} text-gray-600 hover:bg-off-white hover:text-charcoal ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </a>
  );
}

export const Button = {
  Primary,
  Outline,
  Ghost,
  PrimaryLink,
  OutlineLink,
  GhostLink,
};
