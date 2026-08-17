import { ReferralCaptureForm } from "@/components/referrals/referral-capture-form";

type PageProps = {
  params: Promise<{ token: string }>;
};

export default async function ReferralLandingPage({ params }: PageProps) {
  const { token } = await params;

  return (
    <main className="min-h-screen bg-off-white px-4 py-12">
      <div className="mx-auto w-full max-w-lg">
        <ReferralCaptureForm token={token} />
      </div>
    </main>
  );
}
