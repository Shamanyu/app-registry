import { NextRequest, NextResponse } from "next/server";

const PREVIEW_BASE = "https://pageshot.site/v1/preview";

// In-memory cache: key -> { body, contentType, timestamp }
const cache = new Map<string, { body: ArrayBuffer; contentType: string; timestamp: number }>();

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours - serve from cache
const REVALIDATE_AFTER_MS = 60 * 60 * 1000; // 1 hour - refresh in background when older

function cacheKey(url: string, width: number): string {
  return `${url}|${width}`;
}

async function fetchPreview(previewUrl: string): Promise<{ body: ArrayBuffer; contentType: string }> {
  const res = await fetch(previewUrl, {
    headers: { "User-Agent": "AppRegistry/1.0" },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error("Preview failed");
  const body = await res.arrayBuffer();
  const contentType = res.headers.get("Content-Type") || "image/jpeg";
  return { body, contentType };
}

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
  const previewUrl = `${PREVIEW_BASE}?url=${encodeURIComponent(url)}&width=${width}`;
  const key = cacheKey(url, width);

  const cached = cache.get(key);
  const now = Date.now();

  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    // Cache hit - return immediately
    if (now - cached.timestamp > REVALIDATE_AFTER_MS) {
      // Stale: revalidate in background (fire-and-forget)
      fetchPreview(previewUrl)
        .then(({ body, contentType }) => {
          cache.set(key, { body, contentType, timestamp: Date.now() });
        })
        .catch(() => {});
    }

    return new NextResponse(cached.body, {
      headers: {
        "Content-Type": cached.contentType,
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    });
  }

  // Cache miss - fetch and cache
  try {
    const { body, contentType } = await fetchPreview(previewUrl);
    cache.set(key, { body, contentType, timestamp: now });

    return new NextResponse(body, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    });
  } catch {
    return new NextResponse(JSON.stringify({ error: "Preview failed" }), {
      status: 502,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store, must-revalidate" },
    });
  }
}
