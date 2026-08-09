import { GoogleConnectionCard } from "@/components/dashboard/settings/google-connection-card";
import { AccountDangerZone } from "@/components/dashboard/settings/account-danger-zone";
import { requireUser } from "@/lib/auth/get-user";

export default async function SettingsPage() {
  const user = await requireUser();

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-charcoal">
        Settings
      </h1>
      <p className="mt-2 max-w-xl text-sm text-gray-600">
        {user.role === "admin"
          ? "Configure platform defaults, integrations, and team access."
          : "Update your spa profile, notification preferences, and review links."}
      </p>

      <div className="mt-8 space-y-6">
        <GoogleConnectionCard />
        <AccountDangerZone />
      </div>
    </div>
  );
}
