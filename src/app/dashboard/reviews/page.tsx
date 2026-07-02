import { requireUser } from "@/lib/auth/get-user";
import { ReviewsShell } from "@/components/dashboard/reviews/reviews-shell";

export default async function ReviewsPage() {
  await requireUser();
  return <ReviewsShell />;
}
