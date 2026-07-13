import { PlaceholderPage } from "@/components/dashboard/placeholder-page";
import { requireUser } from "@/lib/auth/get-user";
import { redirect } from "next/navigation";

export default async function ContactsPage() {
  const user = await requireUser();

  if (user.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <PlaceholderPage
      title="Contacts"
      description="Manage client records and segmentation for automated outreach."
    />
  );
}
