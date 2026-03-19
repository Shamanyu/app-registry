import { createClient } from "@supabase/supabase-js";
import { createHash } from "crypto";

const PREVIEW_BASE = "https://pageshot.site/v1/preview";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

function storagePath(url: string, width: number): string {
  const hash = createHash("md5").update(`${url}|${width}`).digest("hex");
  return `cache/${hash}.webp`;
}

export async function getCachedPreview(
  url: string,
  width: number
): Promise<{ previewUrl: string; isFresh: boolean } | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("preview_cache")
    .select("preview_url, created_at")
    .eq("url", url)
    .eq("width", width)
    .single();

  if (error || !data) return null;

  const createdAt = new Date(data.created_at).getTime();
  const age = Date.now() - createdAt;
  const isFresh = age < CACHE_TTL_MS;

  return { previewUrl: data.preview_url, isFresh };
}

export async function fetchAndCachePreview(
  url: string,
  width: number
): Promise<string | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  try {
    const pageshotUrl = `${PREVIEW_BASE}?url=${encodeURIComponent(url)}&width=${width}&format=webp`;
    const res = await fetch(pageshotUrl, {
      headers: { "User-Agent": "AppRegistry/1.0" },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return null;

    const blob = await res.blob();
    const path = storagePath(url, width);

    const { error: uploadError } = await supabase.storage
      .from("project-previews")
      .upload(path, blob, { upsert: true, contentType: "image/webp" });

    if (uploadError) {
      console.error("Preview cache upload error:", uploadError);
      return null;
    }

    const { data: urlData } = supabase.storage.from("project-previews").getPublicUrl(path);
    const publicUrl = urlData.publicUrl;

    await supabase.from("preview_cache").upsert(
      { url, width, preview_url: publicUrl, created_at: new Date().toISOString() },
      { onConflict: "url,width" }
    );

    return publicUrl;
  } catch {
    return null;
  }
}
