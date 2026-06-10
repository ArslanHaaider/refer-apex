export const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "Testimonials", href: "#social-proof" },
  { label: "FAQ", href: "#faq" },
] as const;

export const TRUST_BADGES = [
  "Trusted by 200+ UAE Med Spas",
  "GDPR Compliant",
  "HIPAA Ready",
] as const;

export const LOGO_CLOUD = [
  "Lumiere",
  "Invicta",
  "Velora",
  "Élan",
  "Pure Vive",
] as const;

export const FEATURES = [
  {
    title: "AI Review Requests",
    description:
      "Automatically send personalized review requests at the perfect moment after each treatment.",
    icon: "star" as const,
  },
  {
    title: "Review Gatekeeping",
    description:
      "Route unhappy clients to private feedback while directing happy clients to public review sites.",
    icon: "shield" as const,
  },
  {
    title: "AI Review Responses",
    description:
      "Generate thoughtful, on-brand responses to every review in seconds with AI assistance.",
    icon: "message-circle" as const,
  },
  {
    title: "Referral Automation",
    description:
      "Turn satisfied clients into advocates with automated referral campaigns and tracking.",
    icon: "users" as const,
  },
  {
    title: "Repeat Visit Campaigns",
    description:
      "Re-engage clients with timely reminders and offers to keep your schedule full.",
    icon: "calendar" as const,
  },
  {
    title: "Analytics Dashboard",
    description:
      "Track reviews, referrals, and revenue impact with real-time insights and trends.",
    icon: "bar-chart" as const,
  },
] as const;

export const PLATFORM_FEATURES = [
  "Unified review management across Google, Facebook & more",
  "Automated client journey workflows",
  "Real-time sentiment analysis",
  "Referral tracking & attribution",
  "Revenue impact reporting",
  "Multi-location support",
] as const;

export const PLATFORM_STATS = [
  { value: "47%", label: "More Reviews" },
  { value: "3.2x", label: "Referral Rate" },
  { value: "68%", label: "Repeat Visits" },
  { value: "4.9", label: "Star Rating" },
] as const;

export const TIMELINE_STEPS = [
  { label: "Review Request Sent", status: "completed" as const },
  { label: "Review Received", status: "completed" as const },
  { label: "Referral Sent", status: "completed" as const },
  { label: "Booking Made", status: "current" as const },
] as const;

export const PRICING_TIERS = [
  {
    name: "Starter",
    monthlyPrice: 49,
    annualPrice: 39,
    description: "Perfect for single-location med spas getting started.",
    features: [
      "Up to 500 clients",
      "AI review requests",
      "Basic analytics",
      "Email support",
      "1 location",
    ],
    cta: "Start Free Trial",
    highlighted: false,
  },
  {
    name: "Professional",
    monthlyPrice: 99,
    annualPrice: 79,
    description: "For growing practices ready to scale referrals.",
    features: [
      "Unlimited clients",
      "AI review responses",
      "Referral automation",
      "Advanced analytics",
      "Priority support",
      "Up to 3 locations",
    ],
    cta: "Start Free Trial",
    highlighted: true,
  },
  {
    name: "Enterprise",
    monthlyPrice: null,
    annualPrice: null,
    description: "Custom solutions for multi-location groups.",
    features: [
      "Everything in Professional",
      "Unlimited locations",
      "Custom integrations",
      "Dedicated account manager",
      "SLA & onboarding",
      "API access",
    ],
    cta: "Book Demo",
    highlighted: false,
  },
] as const;

export const FAQ_ITEMS = [
  {
    question: "How does ReferApex integrate with my existing systems?",
    answer:
      "ReferApex connects with popular booking platforms, CRMs, and review sites. Our team handles setup during onboarding so you can start automating within days, not weeks.",
  },
  {
    question: "Is my client data secure and compliant?",
    answer:
      "Yes. ReferApex is GDPR compliant and HIPAA ready. All data is encrypted in transit and at rest, with role-based access controls for your team.",
  },
  {
    question: "How long does it take to see results?",
    answer:
      "Most med spas see a measurable increase in reviews within the first 30 days. Referral and repeat booking improvements typically follow within 60–90 days.",
  },
  {
    question: "Can I customize the review request messages?",
    answer:
      "Absolutely. You can edit templates, set timing rules, and let AI personalize messages based on treatment type while keeping your brand voice.",
  },
  {
    question: "What happens during the free trial?",
    answer:
      "You get full access to your chosen plan for 14 days. No credit card required. Our team provides onboarding support to help you launch your first campaigns.",
  },
  {
    question: "Do you offer support for multiple locations?",
    answer:
      "Yes. Professional supports up to 3 locations, and Enterprise offers unlimited locations with centralized reporting and per-location customization.",
  },
] as const;

export const FOOTER_LINKS = {
  product: [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "Integrations", href: "#" },
    { label: "Changelog", href: "#" },
  ],
  company: [
    { label: "About", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Contact", href: "#" },
    { label: "Partners", href: "#" },
  ],
  resources: [
    { label: "Blog", href: "#" },
    { label: "Help Center", href: "#" },
    { label: "Case Studies", href: "#" },
    { label: "Webinars", href: "#" },
  ],
  legal: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Cookie Policy", href: "#" },
    { label: "GDPR", href: "#" },
  ],
} as const;

export const SOCIAL_LINKS = [
  { label: "LinkedIn", href: "#" },
  { label: "Instagram", href: "#" },
  { label: "Facebook", href: "#" },
  { label: "YouTube", href: "#" },
] as const;
