"use client";

import { useActionState, useState } from "react";
import { useSearchParams } from "next/navigation";
import { signIn, signUp, type AuthActionState } from "./actions";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/landing/logo";

const initialState: AuthActionState = {};

export function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/dashboard";
  const authError = searchParams.get("error");
  const [mode, setMode] = useState<"signin" | "signup">("signin");

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

  return (
    <div className="flex min-h-full flex-col justify-center px-4 py-12">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-8 text-center">
          <Logo href="/" className="justify-center" />
          <h1 className="mt-6 text-2xl font-bold tracking-tight text-charcoal">
            {mode === "signin" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            {mode === "signin"
              ? "Sign in to manage reviews, referrals, and bookings."
              : "Start growing your med spa with Iqrava."}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          {error ? (
            <p
              className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              role="alert"
            >
              {error}
            </p>
          ) : null}

          {mode === "signin" ? (
            <form action={signInAction} className="space-y-4">
              <input type="hidden" name="next" value={next} />
              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-sm font-medium text-charcoal"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="h-11 w-full rounded-xl border border-gray-200 bg-off-white px-4 text-sm text-charcoal outline-none transition-colors focus:border-emerald focus:ring-2 focus:ring-emerald/20"
                  placeholder="you@yourspa.com"
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="mb-1.5 block text-sm font-medium text-charcoal"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="h-11 w-full rounded-xl border border-gray-200 bg-off-white px-4 text-sm text-charcoal outline-none transition-colors focus:border-emerald focus:ring-2 focus:ring-emerald/20"
                  placeholder="••••••••"
                />
              </div>
              <Button.Primary
                type="submit"
                size="md"
                className="w-full"
                disabled={isPending}
              >
                {isPending ? "Signing in…" : "Sign in"}
              </Button.Primary>
            </form>
          ) : (
            <form action={signUpAction} className="space-y-4">
              <div>
                <label
                  htmlFor="fullName"
                  className="mb-1.5 block text-sm font-medium text-charcoal"
                >
                  Full name
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  className="h-11 w-full rounded-xl border border-gray-200 bg-off-white px-4 text-sm text-charcoal outline-none transition-colors focus:border-emerald focus:ring-2 focus:ring-emerald/20"
                  placeholder="Jane Smith"
                />
              </div>
              <div>
                <label
                  htmlFor="signup-email"
                  className="mb-1.5 block text-sm font-medium text-charcoal"
                >
                  Email
                </label>
                <input
                  id="signup-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="h-11 w-full rounded-xl border border-gray-200 bg-off-white px-4 text-sm text-charcoal outline-none transition-colors focus:border-emerald focus:ring-2 focus:ring-emerald/20"
                  placeholder="you@yourspa.com"
                />
              </div>
              <div>
                <label
                  htmlFor="signup-password"
                  className="mb-1.5 block text-sm font-medium text-charcoal"
                >
                  Password
                </label>
                <input
                  id="signup-password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  className="h-11 w-full rounded-xl border border-gray-200 bg-off-white px-4 text-sm text-charcoal outline-none transition-colors focus:border-emerald focus:ring-2 focus:ring-emerald/20"
                  placeholder="At least 8 characters"
                />
              </div>
              <Button.Primary
                type="submit"
                size="md"
                className="w-full"
                disabled={isPending}
              >
                {isPending ? "Creating account…" : "Create account"}
              </Button.Primary>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-gray-600">
            {mode === "signin" ? (
              <>
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={() => setMode("signup")}
                  className="font-semibold text-emerald hover:text-emerald-dark"
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setMode("signin")}
                  className="font-semibold text-emerald hover:text-emerald-dark"
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
