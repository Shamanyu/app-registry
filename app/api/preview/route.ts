import { NextRequest, NextResponse } from "next/server";
import { getCachedPreview, fetchAndCachePreview } from "@/lib/preview-cache";

// Safari/WebKit caches 302 redirects for images incorrectly (Bug #77538), causing
// images to fail on second load. no-store prevents that; our server responds fast anyway.
const NO_CACHE = "no-store, must-revalidate";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  if (!url) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }

  try {
    new URL(url);
  } catch {
    return NextResponse.json({ error: "Invalid url" }, { status: 400 });
  }

  const width = Math.min(480, Math.max(200, parseInt(request.nextUrl.searchParams.get("width") || "400", 10)));

  const cached = await getCachedPreview(url, width);

  if (cached?.previewUrl) {
    if (cached.isFresh) {
      return NextResponse.redirect(cached.previewUrl, {
        headers: { "Cache-Control": NO_CACHE },
      });
    }
    if (!cached.isFresh) {
      fetchAndCachePreview(url, width).catch(() => {});
      return NextResponse.redirect(cached.previewUrl, {
        headers: { "Cache-Control": NO_CACHE },
      });
    }
  }

  const previewUrl = await fetchAndCachePreview(url, width);
  if (previewUrl) {
    return NextResponse.redirect(previewUrl, {
      headers: { "Cache-Control": NO_CACHE },
    });
  }

  return new NextResponse(JSON.stringify({ error: "Preview failed" }), {
    status: 502,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store, must-revalidate" },
  });
}
