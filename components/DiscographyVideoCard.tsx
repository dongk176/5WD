"use client";

import { useEffect, useMemo, useState } from "react";

type DiscographyVideoCardProps = {
  title: string;
  embedUrl: string | null;
  videoUrl: string;
  thumbnailUrl: string | null;
  thumbnailCandidates?: string[];
};

function buildAutoplayEmbedUrl(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.searchParams.set("autoplay", "1");
    parsed.searchParams.set("rel", "0");
    parsed.searchParams.set("modestbranding", "1");
    return parsed.toString();
  } catch {
    return url;
  }
}

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

export default function DiscographyVideoCard({
  title,
  embedUrl,
  videoUrl,
  thumbnailUrl,
  thumbnailCandidates,
}: DiscographyVideoCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [thumbnailIndex, setThumbnailIndex] = useState(0);

  const playableEmbedUrl = useMemo(() => (embedUrl ? buildAutoplayEmbedUrl(embedUrl) : null), [embedUrl]);
  const previewEmbedUrl = useMemo(() => (embedUrl ? buildPreviewEmbedUrl(embedUrl) : null), [embedUrl]);
  const fallbackThumbnails = useMemo(
    () => Array.from(new Set((thumbnailCandidates ?? []).filter(Boolean))),
    [thumbnailCandidates],
  );
  const thumbnails = useMemo(
    () => Array.from(new Set([thumbnailUrl, ...fallbackThumbnails].filter(Boolean) as string[])),
    [thumbnailUrl, fallbackThumbnails],
  );
  const currentThumbnail = thumbnails[thumbnailIndex] ?? null;

  useEffect(() => {
    setThumbnailIndex(0);
  }, [thumbnails.join("|")]);

  const moveToNextThumbnail = () => {
    setThumbnailIndex((prev) => (prev < thumbnails.length - 1 ? prev + 1 : thumbnails.length));
  };

  return (
    <article className="group">
      <div className="mb-4 overflow-hidden bg-slate-100">
        {!isPlaying ? (
          <button
            type="button"
            onClick={() => setIsPlaying(true)}
            aria-label={`${title} 재생`}
            className="relative block w-full"
          >
            {currentThumbnail ? (
              <img
                src={currentThumbnail}
                alt={title}
                className="aspect-video w-full object-cover"
                onError={moveToNextThumbnail}
                onLoad={(event) => {
                  const width = event.currentTarget.naturalWidth;
                  const height = event.currentTarget.naturalHeight;
                  const isLikelyPlaceholder = width <= 120 && height <= 90;
                  const isLowResMaxres = currentThumbnail.includes("maxresdefault") && width <= 320;
                  if (isLikelyPlaceholder || isLowResMaxres) {
                    moveToNextThumbnail();
                  }
                }}
              />
            ) : previewEmbedUrl ? (
              <iframe
                className="pointer-events-none aspect-video w-full object-cover"
                src={previewEmbedUrl}
                title={`${title} preview`}
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                loading="lazy"
              />
            ) : (
              <div className="flex aspect-video w-full items-center justify-center bg-slate-100 text-sm text-slate-400">No Thumbnail</div>
            )}
            <div className="absolute inset-0 bg-black/15 transition group-hover:bg-black/25" />
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-charcoal/90 shadow-md transition-transform group-hover:scale-105">
                <svg viewBox="0 0 24 24" className="h-8 w-8 translate-x-px fill-white" aria-hidden="true">
                  <path d="M5 3L19 12L5 21V3Z" />
                </svg>
              </span>
            </span>
          </button>
        ) : playableEmbedUrl ? (
          <iframe
            className="aspect-video w-full object-cover"
            src={playableEmbedUrl}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <video controls autoPlay preload="metadata" className="aspect-video w-full object-cover" src={videoUrl} />
        )}
      </div>
      <h4 className="mb-1 text-base font-medium">{title}</h4>
    </article>
  );
}
