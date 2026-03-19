import { NextRequest, NextResponse } from "next/server";
import { checkStatus } from "@/lib/status";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  if (!url) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 });
  }

  const live = await checkStatus(url);

  return NextResponse.json(
    { live },
    { headers: { "Cache-Control": "public, max-age=900" } }
  );
}
