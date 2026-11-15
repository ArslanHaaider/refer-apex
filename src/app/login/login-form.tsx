"use client";

import { useActionState, useState } from "react";
import { useSearchParams } from "next/navigation";
import { signIn, signUp, type AuthActionState } from "./actions";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff, MessageSquareHeart, Send, Star, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const initialState: AuthActionState = {};

export function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/dashboard";
  const authError = searchParams.get("error");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [showPassword, setShowPassword] = useState(false);

  const [signInState, signInAction, signInPending] = useActionState(
    signIn,
    initialState,
  );
  const [signUpState, signUpAction, signUpPending] = useActionState(
    signUp,
    initialState,
  );

  const isPending = signInPending || signUpPending;
  const error =
    signInState.error ??
    signUpState.error ??
    (authError ? "Sign in failed. Try again." : undefined);

  const inputClass =
    "h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-[15px] text-charcoal outline-none transition-all placeholder:text-gray-400 hover:border-gray-300 focus:border-emerald focus:ring-4 focus:ring-emerald/10";
  const labelClass = "mb-2 block text-sm font-medium text-charcoal";

  const passwordField = (id: string, autoComplete: string, placeholder: string, minLength?: number) => (
    <div className="relative">
      <input
        id={id}
        name="password"
        type={showPassword ? "text" : "password"}
        autoComplete={autoComplete}
        required
        minLength={minLength}
        className={`${inputClass} pr-12`}
        placeholder={placeholder}
      />
      <button
        type="button"
        onClick={() => setShowPassword((v) => !v)}
        className="absolute right-1.5 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-charcoal"
        aria-label={showPassword ? "Hide password" : "Show password"}
      >
        {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
      </button>
    </div>
  );

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      {/* Brand panel */}
      <aside className="relative hidden overflow-hidden bg-charcoal text-white lg:flex lg:flex-col lg:justify-between lg:p-14 xl:p-16">
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage: "radial-gradient(ellipse at 30% 40%, black 20%, transparent 75%)",
          }}
        />
        <div aria-hidden="true" className="absolute -right-32 -top-32 h-[34rem] w-[34rem] rounded-full bg-emerald/50 blur-[120px]" />
        <div aria-hidden="true" className="absolute -bottom-40 left-10 h-[28rem] w-[28rem] rounded-full bg-accent/25 blur-[120px]" />

        <div className="relative rise">
          <Link href="/" className="font-display text-3xl font-semibold tracking-tight">
            Iq<span className="text-accent">rava</span>
          </Link>
        </div>

        <div className="relative max-w-xl">
          <p className="t-label rise text-accent" style={{ "--d": "100ms" } as React.CSSProperties}>
            Growth platform for med spas
          </p>
          <h2
            className="t-display rise mt-5 text-[64px] text-white xl:text-[76px]"
            style={{ "--d": "200ms" } as React.CSSProperties}
          >
            Every visit, a <em className="!text-accent">reason</em> to come back.
          </h2>

          <div className="relative mt-12 h-[17rem]">
            <div
              className="rise absolute left-0 top-0 w-[19rem] -rotate-2 rounded-2xl border border-white/10 bg-white/[0.07] p-5 backdrop-blur-md"
              style={{ "--d": "380ms" } as React.CSSProperties}
            >
              <div className="flex items-center gap-1 text-accent">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
                <span className="t-label ml-2 text-white/50">New review</span>
              </div>
              <p className="font-display mt-3 text-lg font-light italic leading-snug text-white/90">
                &ldquo;Felt looked after from the first hello to the follow-up.&rdquo;
              </p>
              <p className="mt-3 flex items-center gap-1.5 text-xs text-white/50">
                <MessageSquareHeart className="h-3.5 w-3.5" /> Reply drafted by AI
              </p>
            </div>

            <div
              className="rise absolute right-0 top-10 w-[15rem] rotate-2 rounded-2xl border border-white/10 bg-white/[0.07] p-5 backdrop-blur-md"
              style={{ "--d": "520ms" } as React.CSSProperties}
            >
              <p className="t-label flex items-center gap-1.5 text-white/50">
                <Send className="h-3.5 w-3.5" /> Referral sent
              </p>
              <p className="mt-2 text-sm text-white/80">A friend just got their invite link by SMS.</p>
            </div>

            <div
              className="rise absolute bottom-0 left-24 w-[13rem] rounded-2xl bg-white p-5 text-charcoal shadow-2xl shadow-black/30"
              style={{ "--d": "660ms" } as React.CSSProperties}
            >
              <p className="t-label flex items-center gap-1.5 text-gray-500">
                <TrendingUp className="h-3.5 w-3.5 text-emerald" /> Follow-ups
              </p>
              <p className="t-num mt-1 text-5xl">24/7</p>
              <p className="mt-1 text-xs text-gray-500">running on autopilot</p>
            </div>
          </div>
        </div>

        <p className="relative t-label text-white/40">Reviews · Referrals · Repeat bookings</p>
      </aside>

      {/* Form panel */}
      <main id="main-content" className="bg-atmosphere flex flex-col px-5 py-8 sm:px-10">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 transition-colors hover:text-charcoal"
          >
            <ArrowLeft className="h-4 w-4" /> Back to site
          </Link>
          <Link href="/" className="font-display text-2xl font-semibold tracking-tight lg:hidden">
            Iq<span className="text-accent">rava</span>
          </Link>
        </div>

        <div className="mx-auto flex w-full max-w-[26rem] flex-1 flex-col justify-center py-10">
          <div className="rise">
            <h1 className="text-5xl font-light tracking-[-0.03em] text-charcoal">
              {mode === "signin" ? "Welcome back" : "Start growing"}
            </h1>
            <p className="mt-3 text-[15px] leading-relaxed text-gray-600">
              {mode === "signin"
                ? "Sign in to manage reviews, referrals, and bookings."
                : "Create your Iqrava account in under a minute."}
            </p>
          </div>

          <div
            role="tablist"
            aria-label="Account"
            className="rise relative mt-8 grid grid-cols-2 rounded-xl bg-gray-100 p-1"
            style={{ "--d": "100ms" } as React.CSSProperties}
          >
            <span
              aria-hidden="true"
              className={`absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-lg bg-white shadow-sm transition-transform duration-300 ease-out ${
                mode === "signup" ? "translate-x-full" : ""
              }`}
            />
            {(["signin", "signup"] as const).map((m) => (
              <button
                key={m}
                type="button"
                role="tab"
                aria-selected={mode === m}
                onClick={() => setMode(m)}
                className={`relative z-10 h-10 rounded-lg text-sm font-semibold transition-colors ${
                  mode === m ? "text-charcoal" : "text-gray-500 hover:text-charcoal"
                }`}
              >
                {m === "signin" ? "Sign in" : "Create account"}
              </button>
            ))}
          </div>

          {error ? (
            <p
              className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              role="alert"
            >
              {error}
            </p>
          ) : null}

          <div className="rise mt-6" style={{ "--d": "200ms" } as React.CSSProperties}>
            {mode === "signin" ? (
              <form action={signInAction} className="space-y-5">
                <input type="hidden" name="next" value={next} />
                <div>
                  <label htmlFor="email" className={labelClass}>Email</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className={inputClass}
                    placeholder="you@yourspa.com"
                  />
                </div>
                <div>
                  <label htmlFor="password" className={labelClass}>Password</label>
                  {passwordField("password", "current-password", "Your password")}
                </div>
                <Button.Primary type="submit" size="lg" className="w-full" disabled={isPending}>
                  {isPending ? "Signing in…" : "Sign in"}
                </Button.Primary>
              </form>
            ) : (
              <form action={signUpAction} className="space-y-5">
                <div>
                  <label htmlFor="fullName" className={labelClass}>Full name</label>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    autoComplete="name"
                    className={inputClass}
                    placeholder="Jane Smith"
                  />
                </div>
                <div>
                  <label htmlFor="signup-email" className={labelClass}>Email</label>
                  <input
                    id="signup-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className={inputClass}
                    placeholder="you@yourspa.com"
                  />
                </div>
                <div>
                  <label htmlFor="signup-password" className={labelClass}>Password</label>
                  {passwordField("signup-password", "new-password", "At least 8 characters", 8)}
                </div>
                <Button.Primary type="submit" size="lg" className="w-full" disabled={isPending}>
                  {isPending ? "Creating account…" : "Create account"}
                </Button.Primary>
              </form>
            )}
          </div>

          <p className="mt-8 text-center text-xs leading-relaxed text-gray-500">
            By continuing you agree to our{" "}
            <Link href="/terms" className="underline underline-offset-2 hover:text-charcoal">Terms</Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline underline-offset-2 hover:text-charcoal">Privacy Policy</Link>.
          </p>
        </div>
      </main>
    </div>
  );
}
