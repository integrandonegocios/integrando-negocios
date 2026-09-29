export function siteUrl(): URL | undefined {
  if (!process.env.APP_URL) return undefined;
  try {
    const url = new URL(process.env.APP_URL);
    if (url.protocol !== "https:" || url.username || url.password || ["localhost", "127.0.0.1"].includes(url.hostname)) return undefined;
    return new URL(url.origin);
  } catch { return undefined; }
}

export function canonical(path: string) {
  const origin = siteUrl();
  return origin ? { canonical: new URL(path, origin).toString() } : undefined;
}
