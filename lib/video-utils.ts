function getYouTubeId(url: string): string | null {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();

    if (host === "youtu.be") {
      const id = parsed.pathname.replace("/", "").trim();
      return id || null;
    }

    if (host.includes("youtube.com")) {
      if (parsed.pathname === "/watch") {
        const id = parsed.searchParams.get("v")?.trim();
        return id || null;
      }

      if (parsed.pathname.startsWith("/shorts/")) {
        const id = parsed.pathname.replace("/shorts/", "").split("/")[0]?.trim();
        return id || null;
      }

      if (parsed.pathname.startsWith("/embed/")) {
        const id = parsed.pathname.replace("/embed/", "").split("/")[0]?.trim();
        return id || null;
      }

      if (parsed.pathname.startsWith("/live/")) {
        const id = parsed.pathname.replace("/live/", "").split("/")[0]?.trim();
        return id || null;
      }
    }
  } catch {
    return null;
  }

  return null;
}

export function isYouTubeUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  return Boolean(getYouTubeId(url));
}

export function getYouTubeEmbedUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const id = getYouTubeId(url);
  if (!id) return null;
  return `https://www.youtube.com/embed/${id}`;
}

export function getYouTubeThumbnailUrl(url: string | null | undefined): string | null {
  const candidates = getYouTubeThumbnailCandidates(url);
  return candidates[0] ?? null;
}

export function getYouTubeThumbnailCandidates(url: string | null | undefined): string[] {
  if (!url) return [];
  const id = getYouTubeId(url);
  if (!id) return [];
  return [
    `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    `https://i.ytimg.com/vi/${id}/sddefault.jpg`,
    `https://i.ytimg.com/vi/${id}/mqdefault.jpg`,
    `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`,
    `https://i.ytimg.com/vi_webp/${id}/sddefault.webp`,
    `https://i.ytimg.com/vi_webp/${id}/maxresdefault.webp`,
  ];
}
