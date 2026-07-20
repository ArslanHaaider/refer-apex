export const AI_TEAM_SECTION = {
  eyebrow: "Meet Your AI Workforce",
  heading: "Every Client Journey Is Managed By Specialized AI Agents",
  description:
    "Each AI agent handles one part of your business automatically—from generating reviews to bringing clients back—so your team can focus on delivering exceptional treatments.",
} as const;

export const AI_AGENTS = [
  {
    number: "01",
    id: "scout",
    name: "Ava",
    role: "Client Review Specialist",
    tagline: "Never Miss The Perfect Moment To Ask For A Review",
    description:
      "Scout watches every completed appointment and automatically sends personalized review requests at exactly the right moment. Every message feels personal, timely, and perfectly branded.",
    responsibilities: [
      "Detect completed appointments",
      "Wait for the optimal timing",
      "Personalize every request",
      "Send automatically",
      "Track delivery and responses",
    ],
    accent: "emerald",
  },
  {
    number: "02",
    id: "guardian",
    name: "Mason",
    role: "Reputation Care Specialist",
    tagline: "Protect Your Reputation Before Problems Become Public",
    description:
      "Guardian reads customer sentiment before reviews go public. Happy clients are guided toward Google Reviews, while unhappy clients are privately invited to share feedback.",
    responsibilities: [
      "Analyze customer sentiment",
      "Detect negative experiences",
      "Redirect unhappy clients",
      "Encourage positive reviews",
      "Protect online reputation",
    ],
    accent: "amber",
  },
  {
    number: "03",
    id: "echo",
    name: "Lena",
    role: "Review Response Specialist",
    tagline: "Reply Like Your Best Employee Every Time",
    description:
      "Echo instantly drafts warm, thoughtful, on-brand responses to every review using your clinic's tone of voice. Your team only needs one click to publish.",
    responsibilities: [
      "Read incoming reviews",
      "Understand sentiment",
      "Match your brand voice",
      "Generate personalized replies",
      "Publish instantly",
    ],
    accent: "blue",
  },
  {
    number: "04",
    id: "connector",
    name: "Zara",
    role: "Referral Growth Specialist",
    tagline: "Turn Happy Clients Into Your Best Marketing Channel",
    description:
      "Connector automatically invites delighted clients into referral campaigns, tracks every referral, and measures the revenue generated from each recommendation.",
    responsibilities: [
      "Invite satisfied clients",
      "Generate referral links",
      "Track conversions",
      "Attribute revenue",
      "Measure ROI",
    ],
    accent: "violet",
  },
  {
    number: "05",
    id: "revive",
    name: "Noah",
    role: "Client Retention Specialist",
    tagline: "Bring Clients Back Before They Forget You",
    description:
      "Revive keeps your appointment book full by automatically sending reminders, promotions, and personalized follow-ups at exactly the right intervals.",
    responsibilities: [
      "Track visit history",
      "Launch follow-up campaigns",
      "Send personalized reminders",
      "Monitor bookings",
      "Optimize return rates",
    ],
    accent: "rose",
  },
  {
    number: "06",
    id: "pulse",
    name: "Eli",
    role: "Business Insights Specialist",
    tagline: "See Exactly What's Growing Your Business",
    description:
      "Pulse continuously monitors reviews, referrals, bookings, and revenue, transforming live business data into clear insights you can act on immediately.",
    responsibilities: [
      "Monitor KPIs",
      "Track review growth",
      "Measure referrals",
      "Analyze revenue",
      "Surface trends",
    ],
    accent: "emerald",
  },
] as const;

export type AiAgent = (typeof AI_AGENTS)[number];
