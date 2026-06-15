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
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald focus-visible:ring-offset-2";

function Primary({
  children,
  size = "md",
  className = "",
  ...props
}: BaseProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`${baseClasses} bg-emerald text-white hover:bg-emerald-dark ${sizeClasses[size]} ${className}`}
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
      className={`${baseClasses} bg-emerald text-white hover:bg-emerald-dark ${sizeClasses[size]} ${className}`}
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

export const Button = {
  Primary,
  Outline,
  Ghost,
  PrimaryLink,
  OutlineLink,
};
