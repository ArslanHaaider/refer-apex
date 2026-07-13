import { NextResponse } from "next/server";

// Mock-only endpoint. In real mode, use /api/google/auth to initiate OAuth.
const USE_MOCK = process.env.GOOGLE_MOCK !== "false";

export async function POST() {
  if (!USE_MOCK) {
    return NextResponse.json(
      { error: "Use /api/google/auth in real mode" },
      { status: 400 },
    );
  }

  return NextResponse.json({
    connected: true,
    email: "owner@mybusiness.com",
    isMock: true,
  });
}
