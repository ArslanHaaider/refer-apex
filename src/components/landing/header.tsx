"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { NAV_LINKS } from "@/lib/landing-data";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Logo } from "./logo";

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200/60 bg-white/80 backdrop-blur-md">
      <Container>
        <div className="flex h-16 items-center justify-between">
          <Logo />

          <nav className="hidden items-center gap-8 md:flex" aria-label="Main navigation">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-gray-600 transition-colors hover:text-charcoal"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Button.OutlineLink href="#cta" size="sm">
              Book Demo   
            </Button.OutlineLink>
            <Button.PrimaryLink href="#pricing" size="sm">
              Get Started
            </Button.PrimaryLink>
          </div>

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-charcoal hover:bg-off-white md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileOpen ? (
          <nav
            className="border-t border-gray-200 py-4 md:hidden"
            aria-label="Mobile navigation"
          >
            <div className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-off-white hover:text-charcoal"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <div className="mt-3 flex flex-col gap-2 border-t border-gray-200 pt-4">
                <Button.OutlineLink href="#cta" size="md" className="w-full">
                  Book Demo
                </Button.OutlineLink>
                <Button.PrimaryLink href="#pricing" size="md" className="w-full">
                  Start Free Trial
                </Button.PrimaryLink>
              </div>
            </div>
          </nav>
        ) : null}
      </Container>
    </header>
  );
}
