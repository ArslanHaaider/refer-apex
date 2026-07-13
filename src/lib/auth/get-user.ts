import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import type { AuthUser, UserRole } from "./types";

function resolveRole(
  profileRole: string | null | undefined,
  appMetadataRole: unknown,
): UserRole {
  if (profileRole === "admin" || profileRole === "user") {
    return profileRole;
  }
  if (appMetadataRole === "admin") {
    return "admin";
  }
  return "user";
}

export async function getUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .maybeSingle();

  const role = resolveRole(
    profile?.role,
    user.app_metadata?.role,
  );

  return {
    id: user.id,
    email: user.email ?? "",
    fullName: profile?.full_name ?? user.user_metadata?.full_name ?? null,
    role,
  };
}

export async function requireUser(): Promise<AuthUser> {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}
