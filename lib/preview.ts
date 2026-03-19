// Bump when fixing cache bugs to invalidate stale client caches
const PREVIEW_CACHE_VERSION = 2;

export function getPreviewUrl(url: string, width = 400): string {
  try {
    const parsed = new URL(url);
    const target = parsed.origin + parsed.pathname;
    return `/api/preview?url=${encodeURIComponent(target)}&width=${width}&v=${PREVIEW_CACHE_VERSION}`;
  } catch {
    return "";
  }
}
