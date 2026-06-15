import type { ReactNode } from "react";

type MockupProps = {
  className?: string;
};

function MockupFrame({ children, className = "" }: MockupProps & { children: ReactNode }) {
  return (
    <div
      className={`overflow-hidden rounded-2xl border border-white/20 bg-white/80 shadow-xl backdrop-blur-md ${className}`}
    >
      {children}
    </div>
  );
}

export function ReviewRequestsMockup({ className = "" }: MockupProps) {
  return (
    <MockupFrame className={className}>
      <div className="border-b border-gray-200/60 px-5 py-3">
        <p className="text-sm font-semibold text-charcoal">Review Requests</p>
      </div>
      <div className="grid grid-cols-2 gap-3 p-4">
        <div className="rounded-xl border border-gray-200/60 bg-off-white p-3">
          <p className="text-xs text-gray-600">Smart Timing</p>
          <p className="mt-1 text-lg font-bold text-emerald">Active</p>
        </div>
        <div className="rounded-xl border border-gray-200/60 bg-off-white p-3">
          <p className="text-xs text-gray-600">Sent Today</p>
          <p className="mt-1 text-lg font-bold text-charcoal">24</p>
        </div>
        <div className="col-span-2 rounded-xl border border-gray-200/60 bg-off-white p-3">
          <p className="mb-2 text-xs font-medium text-gray-600">Review Activity</p>
          <div className="flex h-16 items-end gap-1.5">
            {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-t bg-emerald/80"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </div>
      </div>
    </MockupFrame>
  );
}

export function ReviewGatekeepingMockup({ className = "" }: MockupProps) {
  const emojis = ["😞", "😐", "🙂", "😊", "🤩"];
  return (
    <MockupFrame className={className}>
      <div className="border-b border-gray-200/60 px-5 py-3">
        <p className="text-sm font-semibold text-charcoal">Private Feedback Capture</p>
      </div>
      <div className="p-4">
        <p className="text-xs text-gray-600">How was your experience?</p>
        <div className="mt-3 flex justify-between gap-1">
          {emojis.map((emoji, i) => (
            <span
              key={emoji}
              className={`flex h-10 w-10 items-center justify-center rounded-full text-lg ${
                i === 4 ? "bg-emerald/10 ring-2 ring-emerald" : "bg-off-white"
              }`}
            >
              {emoji}
            </span>
          ))}
        </div>
        <div className="mt-4 rounded-xl border border-emerald/30 bg-emerald/5 p-3">
          <p className="text-xs font-medium text-emerald">Gatekeeping Filter</p>
          <p className="mt-1 text-xs text-gray-600">
            {"Happy clients → Google Reviews · Unhappy → Private feedback"}
          </p>
        </div>
      </div>
    </MockupFrame>
  );
}

export function AiResponsesMockup({ className = "" }: MockupProps) {
  return (
    <MockupFrame className={className}>
      <div className="border-b border-gray-200/60 px-5 py-3">
        <p className="text-sm font-semibold text-charcoal">AI Suggested Response</p>
      </div>
      <div className="p-4">
        <div className="rounded-xl border border-gray-200/60 bg-off-white p-3">
          <p className="text-xs leading-relaxed text-gray-600">
            {`"Thank you so much for your kind words, Sarah! We're thrilled you loved your Hydrafacial. We look forward to seeing you again soon."`}
          </p>
        </div>
        <div className="mt-3 flex gap-2">
          <span className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600">
            Regenerate
          </span>
          <span className="rounded-lg bg-emerald px-3 py-1.5 text-xs font-semibold text-white">
            Approve &amp; Post
          </span>
        </div>
      </div>
    </MockupFrame>
  );
}

export function ReferralAutomationMockup({ className = "" }: MockupProps) {
  const rows = [
    { name: "Sarah M.", status: "Booked", revenue: "$450", statusColor: "text-emerald" },
    { name: "Ahmed K.", status: "Pending", revenue: "—", statusColor: "text-gray-600" },
    { name: "Layla R.", status: "Booked", revenue: "$320", statusColor: "text-emerald" },
  ];
  return (
    <MockupFrame className={className}>
      <div className="border-b border-gray-200/60 px-5 py-3">
        <p className="text-sm font-semibold text-charcoal">Referral Program</p>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-3 gap-2 border-b border-gray-200/60 pb-2 text-xs font-medium text-gray-600">
          <span>Customer</span>
          <span>Status</span>
          <span>Revenue</span>
        </div>
        {rows.map((row) => (
          <div key={row.name} className="grid grid-cols-3 gap-2 border-b border-gray-200/40 py-2.5 text-xs">
            <span className="font-medium text-charcoal">{row.name}</span>
            <span className={`font-medium ${row.statusColor}`}>{row.status}</span>
            <span className="text-charcoal">{row.revenue}</span>
          </div>
        ))}
      </div>
    </MockupFrame>
  );
}

export function RepeatCampaignsMockup({ className = "" }: MockupProps) {
  const days = ["Day 0", "Day 7", "Day 14", "Day 30"];
  return (
    <MockupFrame className={className}>
      <div className="border-b border-gray-200/60 px-5 py-3">
        <p className="text-sm font-semibold text-charcoal">Campaign Builder</p>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between">
          {days.map((day, i) => (
            <div key={day} className="flex flex-col items-center gap-1">
              <span
                className={`h-3 w-3 rounded-full ${i === 0 ? "bg-emerald" : "bg-gray-200"}`}
              />
              <span className="text-[10px] text-gray-600">{day}</span>
            </div>
          ))}
        </div>
        <div className="relative mt-2 h-0.5 bg-gray-200">
          <div className="absolute h-full w-1/4 bg-emerald" />
        </div>
        <div className="mt-4 rounded-xl border border-gray-200/60 bg-off-white p-3">
          <p className="text-xs font-medium text-gray-600">Message Preview</p>
          <p className="mt-1 text-xs leading-relaxed text-charcoal">
            {`Hi Sarah! It's been a week since your visit. Ready to book your next treatment?`}
          </p>
        </div>
      </div>
    </MockupFrame>
  );
}

export function AnalyticsMockup({ className = "" }: MockupProps) {
  return (
    <MockupFrame className={className}>
      <div className="border-b border-gray-200/60 px-5 py-3">
        <p className="text-sm font-semibold text-charcoal">Review Overview</p>
      </div>
      <div className="grid grid-cols-5 gap-4 p-4">
        <div className="col-span-3">
          <svg className="h-24 w-full" viewBox="0 0 200 80" preserveAspectRatio="none">
            <polyline
              points="0,70 30,55 60,60 90,35 120,40 150,20 180,25 200,10"
              fill="none"
              stroke="#10b981"
              strokeWidth="2.5"
            />
          </svg>
        </div>
        <div className="col-span-2 flex flex-col items-center justify-center">
          <svg className="h-20 w-20" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="15" fill="none" stroke="#e5e7eb" strokeWidth="3" />
            <circle
              cx="18"
              cy="18"
              r="15"
              fill="none"
              stroke="#10b981"
              strokeWidth="3"
              strokeDasharray="60 100"
              strokeLinecap="round"
              transform="rotate(-90 18 18)"
            />
          </svg>
          <p className="mt-1 text-[10px] text-gray-600">By Platform</p>
        </div>
      </div>
    </MockupFrame>
  );
}
