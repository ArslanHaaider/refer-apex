import { NextResponse } from "next/server";
import { getSupabaseEnv } from "@/utils/supabase/env";

export async function GET() {
  try {
    const { url, key } = getSupabaseEnv();

    const response = await fetch(`${url}/auth/v1/health`, {
      headers: { apikey: key },
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        { status: "error", connected: false },
        { status: 503 },
      );
    }

    return NextResponse.json({ status: "ok", connected: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Supabase health check failed";

    return NextResponse.json(
      { status: "error", connected: false, message },
      { status: 503 },
    );
  }
}
