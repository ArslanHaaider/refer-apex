import type { ReactNode } from "react";

type PlaceholderPageProps = {
  title: string;
  description: string;
  children?: ReactNode;
};

export function PlaceholderPage({
  title,
  description,
  children,
}: PlaceholderPageProps) {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-charcoal">
        {title}
      </h1>
      <p className="mt-2 max-w-xl text-sm text-gray-600">{description}</p>
      <div className="mt-8 rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center">
        {children ?? (
          <p className="text-sm text-gray-600">
            This section is coming soon. Your role already has access when it
            ships.
          </p>
        )}
      </div>
    </div>
  );
}
