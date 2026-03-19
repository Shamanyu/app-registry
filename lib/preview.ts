export function getPreviewUrl(url: string, width = 400): string {
  try {
    const parsed = new URL(url);
    const target = parsed.origin + parsed.pathname;
    return `/api/preview?url=${encodeURIComponent(target)}&width=${width}`;
  } catch {
    return "";
  }
}
