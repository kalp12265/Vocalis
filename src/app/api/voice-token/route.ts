import { NextResponse } from "next/server";
// Mints a single-use AssemblyAI Voice Agent token so the browser never sees the API key.
const TOKEN_TTL_SECONDS = 120;
const MAX_SESSION_SECONDS = 600;
export const dynamic = "force-dynamic";
export async function GET() {
  const apiKey = process.env.ASSEMBLYAI_API_KEY;
  if (!apiKey)
    return NextResponse.json(
      { error: "The voice coach is not configured." },
      { status: 501 },
    );
  try {
    const url = new URL("https://agents.assemblyai.com/v1/token");
    url.searchParams.set("expires_in_seconds", String(TOKEN_TTL_SECONDS));
    url.searchParams.set(
      "max_session_duration_seconds",
      String(MAX_SESSION_SECONDS),
    );
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${apiKey}` },
      cache: "no-store",
    });
    if (!response.ok)
      return NextResponse.json(
        { error: "The voice coach is unavailable right now. Please try again." },
        { status: 502 },
      );
    const { token } = await response.json();
    return NextResponse.json({ token });
  } catch {
    return NextResponse.json(
      { error: "Could not reach the voice coach. Check your connection." },
      { status: 502 },
    );
  }
}
