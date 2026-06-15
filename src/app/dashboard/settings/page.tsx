import { PlaceholderPage } from "@/components/dashboard/placeholder-page";
import { requireUser } from "@/lib/auth/get-user";

export default async function SettingsPage() {
  const user = await requireUser();

  return (
    <PlaceholderPage
      title="Settings"
      description={
        user.role === "admin"
          ? "Configure platform defaults, integrations, and team access."
          : "Update your spa profile, notification preferences, and review links."
      }
    />
  );
}
