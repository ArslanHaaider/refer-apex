import { LOGO_CLOUD } from "@/lib/landing-data";
import { Container } from "@/components/ui/container";

export function LogoCloud() {
  return (
    <section id="social-proof" className="border-y border-gray-200 bg-white py-12">
      <Container>
        <p className="mb-8 text-center text-sm font-medium text-gray-600">
          Trusted by leading med spas across UAE
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
          {LOGO_CLOUD.map((name) => (
            <span
              key={name}
              className="text-lg font-semibold tracking-wide text-gray-200 select-none"
              aria-label={name}
            >
              {name}
            </span>
          ))}
        </div>
      </Container>
    </section>
  );
}
