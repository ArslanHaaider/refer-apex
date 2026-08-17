"use client";

import { Check } from "lucide-react";

export type WizardStep = { title: string; description: string };

type StepIndicatorProps = {
  steps: WizardStep[];
  current: number;
  onStepClick: (index: number) => void;
};

export function StepIndicator({ steps, current, onStepClick }: StepIndicatorProps) {
  return (
    <ol className="flex items-start gap-2 sm:gap-4">
      {steps.map((step, index) => {
        const isDone = index < current;
        const isCurrent = index === current;
        const clickable = index < current;

        return (
          <li key={step.title} className="flex flex-1 items-center gap-2 sm:items-start">
            <div className="flex flex-1 flex-col items-center gap-2 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={() => clickable && onStepClick(index)}
                disabled={!clickable}
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition ${
                  isDone
                    ? "bg-emerald text-white"
                    : isCurrent
                      ? "border-2 border-emerald text-emerald"
                      : "border border-gray-200 text-gray-400"
                } ${clickable ? "cursor-pointer hover:opacity-80" : "cursor-default"}`}
              >
                {isDone ? <Check className="h-4 w-4" strokeWidth={2} /> : index + 1}
              </button>
              <p
                className={`hidden text-sm font-medium sm:block ${
                  isCurrent ? "text-charcoal" : "text-gray-500"
                }`}
              >
                {step.title}
              </p>
            </div>
            {index < steps.length - 1 ? (
              <div className={`h-px flex-1 ${isDone ? "bg-emerald" : "bg-gray-200"}`} />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
