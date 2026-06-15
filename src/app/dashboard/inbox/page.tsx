import { PlaceholderPage } from "@/components/dashboard/placeholder-page";
import { requireUser } from "@/lib/auth/get-user";
import { redirect } from "next/navigation";

export default async function InboxPage() {
  const user = await requireUser();

  if (user.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <PlaceholderPage
      title="Inbox"
      description="Respond to private feedback and client messages from one place."
    />
  );
}
