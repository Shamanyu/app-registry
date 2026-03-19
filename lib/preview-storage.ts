import { createClient } from "@supabase/supabase-js";

const PREVIEW_BASE = "https://pageshot.site/v1/preview";

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function fetchAndStorePreview(
  projectId: string,
  targetUrl: string
): Promise<string | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  try {
    const previewUrl = `${PREVIEW_BASE}?url=${encodeURIComponent(targetUrl)}&width=400&format=webp`;
    const res = await fetch(previewUrl, {
      headers: { "User-Agent": "AppRegistry/1.0" },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return null;

    const blob = await res.blob();
    const ext = res.headers.get("Content-Type")?.includes("png") ? "png" : "webp";
    const path = `${projectId}.${ext}`;

    const { error } = await supabase.storage
      .from("project-previews")
      .upload(path, blob, { upsert: true, contentType: blob.type });

    if (error) {
      console.error("Preview upload error:", error);
      return null;
    }

    const { data: urlData } = supabase.storage.from("project-previews").getPublicUrl(path);
    return urlData.publicUrl;
  } catch {
    return null;
  }
}
