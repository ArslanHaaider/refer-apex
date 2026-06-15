"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { PRICING_TIERS } from "@/lib/landing-data";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";

export function Pricing() {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <Section.Root id="pricing" className="bg-white">
      <Container>
        <div className="grid gap-12 lg:grid-cols-5 lg:gap-16">
          <div className="lg:col-span-2">
            <Section.Eyebrow>Pricing</Section.Eyebrow>
            <Section.Heading>Simple, Transparent Pricing</Section.Heading>
            <Section.Body>
              Choose the plan that fits your practice. All plans include a 14-day
              free trial with no credit card required.
            </Section.Body>

            <div className="mt-8 flex items-center gap-3">
              <button
                type="button"
                role="switch"
                aria-checked={isAnnual}
                aria-label="Toggle annual billing"
                onClick={() => setIsAnnual(!isAnnual)}
                className={`relative h-7 w-12 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald focus-visible:ring-offset-2 ${
                  isAnnual ? "bg-emerald" : "bg-gray-200"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
                    isAnnual ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
              <span className="text-sm text-gray-600">
                Annual{" "}
                <span className="rounded-full bg-emerald/10 px-2 py-0.5 text-xs font-medium text-emerald">
                  Save 20%
                </span>
              </span>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:col-span-3 lg:grid-cols-3">
            {PRICING_TIERS.map((tier) => {
              const price =
                tier.monthlyPrice !== null
                  ? isAnnual
                    ? tier.annualPrice
                    : tier.monthlyPrice
                  : null;

              return (
                <article
                  key={tier.name}
                  className={`relative flex flex-col rounded-2xl border p-6 shadow-lg ${
                    tier.highlighted
                      ? "border-emerald bg-white ring-2 ring-emerald"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  {tier.highlighted ? (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-emerald px-3 py-1 text-xs font-semibold text-white">
                      MOST POPULAR
                    </span>
                  ) : null}

                  <h3 className="text-lg font-semibold text-charcoal">{tier.name}</h3>
                  <div className="mt-3">
                    {price !== null ? (
                      <p className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold text-charcoal">${price}</span>
                        <span className="text-sm text-gray-600">/mo</span>
                      </p>
                    ) : (
                      <p className="text-4xl font-bold text-charcoal">Custom</p>
                    )}
                    {isAnnual && price !== null ? (
                      <p className="mt-1 text-xs text-gray-600">Billed annually</p>
                    ) : null}
                  </div>
                  <p className="mt-3 text-sm text-gray-600">{tier.description}</p>

                  <ul className="mt-6 flex-1 space-y-3">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm text-gray-600">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald" strokeWidth={2.5} />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8">
                    {tier.cta === "Book Demo" ? (
                      <Button.OutlineLink href="#cta" className="w-full">
                        {tier.cta}
                      </Button.OutlineLink>
                    ) : (
                      <Button.PrimaryLink href="#cta" className="w-full">
                        {tier.cta}
                      </Button.PrimaryLink>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </Container>
    </Section.Root>
  );
}
