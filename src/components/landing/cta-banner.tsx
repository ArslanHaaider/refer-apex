import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";

export function CtaBanner() {
  return (
    <Section.Root id="cta" className="bg-white">
      <Container>
        <div className="relative overflow-hidden rounded-3xl bg-emerald px-6 py-16 text-center sm:px-12 sm:py-20">
          <div
            className="pointer-events-none absolute -top-20 right-0 h-64 w-64 rounded-full bg-white/10 blur-3xl"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -bottom-16 left-1/4 h-56 w-56 rounded-full bg-emerald-dark/30 blur-3xl"
            aria-hidden="true"
          />

          <div className="relative">
            <p className="mb-3 text-sm font-medium tracking-widest text-white/80 uppercase">
              Get started
            </p>
            <h2 className="mx-auto max-w-2xl text-[32px] font-semibold leading-tight tracking-tight text-white">
              Ready to Transform Your Med Spa?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/90">
              Join 200+ med spas across UAE using Iqrava to grow reviews,
              referrals, and repeat bookings.
            </p>

            <div className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row sm:items-center">
              <label htmlFor="cta-email" className="sr-only">
                Email address
              </label>
              <input
                id="cta-email"
                type="email"
                placeholder="you@yourmedspa.com"
                className="h-12 flex-1 rounded-xl border-0 bg-white px-4 text-charcoal shadow-sm placeholder:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-emerald"
              />
              <Button.Outline size="lg" className="group shrink-0 border-0 bg-white text-emerald hover:bg-off-white">
                Get Started
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Button.Outline>
            </div>

            <p className="mt-4 text-sm text-white/80">
              Still chasing reviews manually? Bold move. Drop your email — we
              only ping you when there&apos;s something worth opening.
            </p>
          </div>
        </div>
      </Container>
    </Section.Root>
  );
}
