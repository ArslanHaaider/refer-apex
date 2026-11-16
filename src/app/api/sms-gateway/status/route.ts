import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { requireApiUser } from "@/lib/auth/api-auth";
import { getPublicGatewayStatus } from "@/lib/sms/gateway";

export async function GET() {
  const supabase = createClient(await cookies());
  const auth = await requireApiUser(supabase);
  if (auth.error) return auth.error;

  return NextResponse.json(await getPublicGatewayStatus(auth.userId));
}
