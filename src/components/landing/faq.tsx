"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { FAQ_ITEMS } from "@/lib/landing-data";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  function toggle(index: number) {
    setOpenIndex(openIndex === index ? null : index);
  }

  return (
    <Section.Root id="faq" className="bg-off-white">
      <Container>
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <Section.Heading>Frequently Asked Questions</Section.Heading>
            <Section.Body>
              Everything you need to know about ReferApex. Can&apos;t find what
              you&apos;re looking for? Reach out to our team.
            </Section.Body>
          </div>

          <div className="divide-y divide-gray-200 border-t border-gray-200">
            {FAQ_ITEMS.map((item, index) => {
              const isOpen = openIndex === index;
              const buttonId = `faq-button-${index}`;
              const panelId = `faq-panel-${index}`;

              return (
                <div key={item.question}>
                  <h3>
                    <button
                      id={buttonId}
                      type="button"
                      className="flex w-full items-center justify-between gap-4 py-5 text-left text-base font-medium text-charcoal transition-colors hover:text-emerald focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald focus-visible:ring-offset-2"
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => toggle(index)}
                    >
                      {item.question}
                      <Plus
                        className={`h-5 w-5 shrink-0 text-gray-600 motion-safe:transition-transform motion-safe:duration-200 ${
                          isOpen ? "rotate-45" : "rotate-0"
                        }`}
                        aria-hidden="true"
                      />
                    </button>
                  </h3>
                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={buttonId}
                    hidden={!isOpen}
                    className="pb-5"
                  >
                    <p className="text-sm leading-relaxed text-gray-600">{item.answer}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Container>
    </Section.Root>
  );
}
