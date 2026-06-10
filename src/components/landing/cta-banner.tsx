import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export function CtaBanner() {
  return (
    <section id="cta" className="py-20">
      <Container>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-500 to-emerald px-6 py-16 text-center sm:px-12 sm:py-20">
          <h2 className="text-[28px] font-semibold text-white sm:text-[32px]">
            Ready to Transform Your Med Spa?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-white/90">
            Join 200+ med spas across UAE using ReferApex to grow reviews,
            referrals, and repeat bookings.
          </p>

          <div className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row sm:items-center">
            <label htmlFor="cta-email" className="sr-only">
              Email address
            </label>
            <input
              id="cta-email"
              type="email"
              placeholder="Enter your email"
              className="h-12 flex-1 rounded-xl border-0 bg-white px-4 text-charcoal placeholder:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-emerald"
            />
            <Button.Primary size="lg" className="shrink-0 bg-white text-emerald hover:bg-off-white">
              Get Started
            </Button.Primary>
          </div>

          <p className="mt-4 text-sm text-white/80">
            Free 14-day trial. No credit card required.
          </p>
        </div>
      </Container>
    </section>
  );
}
