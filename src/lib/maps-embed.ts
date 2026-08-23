export function mapsEmbedSrc(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) {
    return null;
  }
  if (trimmed.includes("/maps/embed")) {
    return trimmed;
  }
  try {
    const parsed = new URL(trimmed);
    const query =
      parsed.searchParams.get("query") ||
      parsed.searchParams.get("q") ||
      parsed.searchParams.get("destination");
    if (query) {
      return `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
    }
    if (parsed.hostname.includes("google") && parsed.pathname.includes("/maps")) {
      return `https://www.google.com/maps?q=${encodeURIComponent(trimmed)}&output=embed`;
    }
  } catch {
    return null;
  }
  return `https://www.google.com/maps?q=${encodeURIComponent(trimmed)}&output=embed`;
}
