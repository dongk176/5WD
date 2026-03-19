"use client";

import { useEffect, useMemo, useState } from "react";

type YouTubeThumbnailWithFallbackProps = {
  alt: string;
  className?: string;
  sources?: string[];
  fallbackText?: string;
  previewEmbedUrl?: string | null;
};

function buildPreviewEmbedUrl(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.searchParams.set("autoplay", "0");
    parsed.searchParams.set("controls", "0");
    parsed.searchParams.set("rel", "0");
    parsed.searchParams.set("modestbranding", "1");
    parsed.searchParams.set("playsinline", "1");
    return parsed.toString();
  } catch {
    return url;
  }
}

export default function YouTubeThumbnailWithFallback({
  alt,
  className,
  sources,
  fallbackText = "No thumb",
  previewEmbedUrl,
}: YouTubeThumbnailWithFallbackProps) {
  const candidates = useMemo(() => Array.from(new Set((sources ?? []).filter(Boolean))), [sources]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [candidates.join("|")]);

  const current = candidates[index] ?? null;
  const moveToNext = () => {
    setIndex((prev) => (prev < candidates.length - 1 ? prev + 1 : candidates.length));
  };

  if (!current && previewEmbedUrl) {
    return (
      <iframe
        src={buildPreviewEmbedUrl(previewEmbedUrl)}
        title={alt}
        className={className}
        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        loading="lazy"
      />
    );
  }

  if (!current) {
    return <div className={`flex items-center justify-center text-xs text-slate-400 ${className ?? ""}`}>{fallbackText}</div>;
  }

  return (
    <img
      src={current}
      alt={alt}
      className={className}
      onError={moveToNext}
      onLoad={(event) => {
        const width = event.currentTarget.naturalWidth;
        const height = event.currentTarget.naturalHeight;
        const isLikelyPlaceholder = width <= 120 && height <= 90;
        const isLowResMaxres = current.includes("maxresdefault") && width <= 320;
        if (isLikelyPlaceholder || isLowResMaxres) {
          moveToNext();
        }
      }}
    />
  );
}
