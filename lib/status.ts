import { createClient } from "@supabase/supabase-js";

const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

const ERROR_PATTERNS = [
  /\b404\b/i,
  /\b500\s+(internal\s+)?server\s+error\b/i,
  /\b503\s+service\s+unavailable\b/i,
  /\b502\s+bad\s+gateway\b/i,
  /\bpage\s+not\s+found\b/i,
  /\bnot\s+found\b/i,
  /\bservice\s+unavailable\b/i,
  /\bsite\s+is\s+down\b/i,
  /\bconnection\s+(refused|timed\s+out)\b/i,
  /\berror\s+\d{3}\b/i,
  /\bthis\s+(site|page)\s+(can'?t|cannot)\s+be\s+reached\b/i,
  /\bdns\s+(probe|lookup)\s+failed\b/i,
  /\bmaintenance\s+mode\b/i,
  /\bunder\s+construction\b/i,
];

const PLACEHOLDER_PATTERNS = [
  /\bcoming\s+soon\b/i,
  /\bdeveloper\s+info\b/i,
  /create\s+(a\s+)?web\s+app\s+to\s+handle\s+this\s+domain/i,
  /add\s+(a\s+)?new\s+web\s+app\b/i,
  /\byou'?re\s+almost\s+there\b.*\bweb\s+app\b/i,
  /\bthis\s+domain\s+(has|is)\s+not\s+(yet\s+)?(configured|assigned)\b/i,
  /\bdefault\s+(site|page)\s+(placeholder|page)\b/i,
];

function looksLikeNonLivePage(html: string): boolean {
  const sample = html.slice(0, 6000);
  const lower = sample.toLowerCase();

  if (html.length < 300 && (lower.includes("error") || lower.includes("not found"))) {
    return true;
  }

  const titleMatch = sample.match(/<title[^>]*>([^<]{0,200})<\/title>/i);
  if (titleMatch) {
    const title = titleMatch[1].toLowerCase();
    if (
      title.includes("404") ||
      title.includes("500") ||
      title.includes("503") ||
      title.includes("not found") ||
      title.includes("error") ||
      title.includes("unavailable")
    ) {
      return true;
    }
  }

  const bodyMatch = sample.match(/<body[^>]*>([\s\S]{0,4000})/i);
  const searchIn = bodyMatch ? bodyMatch[1] : sample;

  for (const pattern of ERROR_PATTERNS) {
    if (pattern.test(searchIn) && !/https?:\/\/[^\s"']*\d{3}/.test(searchIn)) {
      return true;
    }
  }

  for (const pattern of PLACEHOLDER_PATTERNS) {
    if (pattern.test(searchIn)) {
      return true;
    }
  }

  return false;
}

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function checkStatus(url: string): Promise<boolean> {
  try {
    new URL(url);
  } catch {
    return false;
  }

  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data, error } = await supabase
      .from("status_cache")
      .select("live, created_at")
      .eq("url", url)
      .single();

    if (!error && data) {
      const createdAt = new Date(data.created_at).getTime();
      const age = Date.now() - createdAt;
      if (age < CACHE_TTL_MS) {
        return data.live;
      }
    }
  }

  let live = false;

  try {
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: AbortSignal.timeout(12000),
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; AppRegistry/1.0; +https://github.com/Shamanyu/app-registry)",
      },
    });

    const status = res.status;

    if (status >= 200 && status < 300) {
      const html = await res.text();
      live = !looksLikeNonLivePage(html);
    } else if (status >= 300 && status < 400) {
      live = true;
    }
  } catch {
    live = false;
  }

  if (supabase) {
    await supabase.from("status_cache").upsert(
      { url, live, created_at: new Date().toISOString() },
      { onConflict: "url" }
    );
  }

  return live;
}
