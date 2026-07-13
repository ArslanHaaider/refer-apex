"use client";

type GoogleConnectPromptProps = {
  isMock: boolean;
  connecting: boolean;
  onConnect: () => void;
};

function GoogleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className="h-8 w-8"
      aria-hidden
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

export function GoogleConnectPrompt({
  isMock,
  connecting,
  onConnect,
}: GoogleConnectPromptProps) {
  return (
    <div className="flex flex-1 items-center justify-center py-16">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-10 shadow-sm">
        {isMock ? (
          <div className="mb-6 flex items-center justify-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              Demo Mode
            </span>
          </div>
        ) : null}

        <div className="flex flex-col items-center text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-gray-100 bg-off-white shadow-sm">
            <GoogleIcon />
          </div>

          <h2 className="text-xl font-bold text-charcoal">
            Connect Google Business Profile
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-600">
            Link your Google Business account to see all your reviews in one
            place, track ratings over time, and monitor customer feedback.
          </p>

          <ul className="mt-6 w-full space-y-2 text-left">
            {[
              "See all your Google reviews in real time",
              "Track average rating and reply rates",
              "Filter by star rating and date",
            ].map((item) => (
              <li
                key={item}
                className="flex items-start gap-2.5 text-sm text-gray-700"
              >
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald/10">
                  <svg
                    viewBox="0 0 12 12"
                    className="h-2.5 w-2.5 text-emerald"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <path d="M2 6l3 3 5-5" />
                  </svg>
                </span>
                {item}
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={onConnect}
            disabled={connecting}
            className="mt-8 inline-flex h-11 w-full items-center justify-center gap-2.5 rounded-xl bg-emerald px-5 text-sm font-semibold text-white transition-colors hover:bg-emerald-dark disabled:opacity-60"
          >
            {connecting ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Connecting…
              </>
            ) : (
              <>
                <GoogleIcon />
                {isMock ? "Connect Google Business (Demo)" : "Connect Google Business"}
              </>
            )}
          </button>

          <p className="mt-4 text-xs text-gray-500">
            {isMock
              ? "Demo mode: no real Google account needed."
              : "You will be redirected to Google to authorize access. We only request read access to your reviews."}
          </p>
        </div>
      </div>
    </div>
  );
}
