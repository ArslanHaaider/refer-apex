import { ReferredBookingForm } from "@/components/referrals/referred-booking-form";

type PageProps = {
  params: Promise<{ token: string }>;
};

export default async function ReferredBookingPage({ params }: PageProps) {
  const { token } = await params;

  return (
    <main className="min-h-screen bg-off-white px-4 py-12">
      <div className="mx-auto w-full max-w-lg">
        <ReferredBookingForm token={token} />
      </div>
    </main>
  );
}
