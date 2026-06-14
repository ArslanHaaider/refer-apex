import { PROBLEMS, PROBLEM_STATS } from "@/lib/landing-data";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";

export function ProblemStatement() {
  return (
    <Section.Root
      id="problems"
      className="relative overflow-hidden border-t border-gray-200/60 bg-gradient-to-br from-off-white via-white to-emerald-50/40 py-24"
    >
      <div
        className="pointer-events-none absolute -top-32 right-0 h-96 w-96 rounded-full bg-emerald-200/20 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-0 left-1/4 h-72 w-72 rounded-full bg-blue-100/30 blur-3xl"
        aria-hidden="true"
      />

      <Container className="relative">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,0.4fr)_minmax(0,1fr)] lg:gap-20">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <Section.Eyebrow>The Challenge</Section.Eyebrow>
            <h2 className="text-[28px] font-semibold leading-tight tracking-tight sm:text-[36px]">
              <span className="text-charcoal">Growth gaps </span>
              <span className="bg-gradient-to-r from-emerald to-emerald-dark bg-clip-text text-transparent">
                cost more than acquisition
              </span>
            </h2>
            <Section.Body className="max-w-md text-gray-600">
              Satisfied clients and strong outcomes are already there. What most
              practices lack is the structure to turn that goodwill into
              referrals, rebookings, and measurable revenue.
            </Section.Body>

            <dl className="mt-10 hidden space-y-4 border-t border-gray-200/80 pt-8 lg:block">
              {PROBLEM_STATS.map((stat) => (
                <div
                  key={stat.label}
                  className="group rounded-xl border border-transparent bg-white/50 px-4 py-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald/15 hover:bg-white hover:shadow-md hover:shadow-emerald/5"
                >
                  <dt className="text-2xl font-semibold tracking-tight text-charcoal transition-colors duration-300 group-hover:text-emerald">
                    {stat.value}
                  </dt>
                  <dd className="mt-1 text-sm leading-snug text-gray-600">
                    {stat.label}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="space-y-3">
            {PROBLEMS.map((problem, index) => (
              <article
                key={problem.title}
                className="group relative overflow-hidden rounded-2xl border border-gray-200/70 bg-white/60 px-5 py-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald/25 hover:bg-white hover:shadow-lg hover:shadow-emerald/8 sm:px-6 sm:py-7"
              >
                <div
                  className="absolute inset-y-0 left-0 w-1 origin-top scale-y-0 rounded-r-full bg-gradient-to-b from-emerald to-emerald-dark transition-transform duration-300 group-hover:scale-y-100"
                  aria-hidden="true"
                />

                <div className="flex gap-5 sm:gap-7">
                  <span
                    aria-hidden="true"
                    className="w-8 shrink-0 pt-0.5 text-sm font-semibold tabular-nums text-gray-300 transition-all duration-300 group-hover:scale-110 group-hover:text-emerald sm:w-10"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-semibold text-charcoal transition-colors duration-300 group-hover:text-emerald sm:text-lg">
                      {problem.title}
                    </h3>
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-600 transition-colors duration-300 group-hover:text-gray-600/90 sm:text-base">
                      {problem.description}
                    </p>
                  </div>
                  <span
                    aria-hidden="true"
                    className="hidden shrink-0 self-center text-emerald opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100 sm:inline"
                  >
                    →
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>

        <dl className="mt-14 grid gap-4 border-t border-gray-200/80 pt-10 sm:grid-cols-3 lg:hidden">
          {PROBLEM_STATS.map((stat) => (
            <div
              key={stat.label}
              className="group rounded-xl border border-gray-200/70 bg-white/70 px-4 py-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald/20 hover:bg-white hover:shadow-md hover:shadow-emerald/5"
            >
              <dt className="text-2xl font-semibold tracking-tight text-charcoal transition-colors duration-300 group-hover:text-emerald">
                {stat.value}
              </dt>
              <dd className="mt-1 text-sm leading-snug text-gray-600">
                {stat.label}
              </dd>
            </div>
          ))}
        </dl>
      </Container>
    </Section.Root>
  );
}
