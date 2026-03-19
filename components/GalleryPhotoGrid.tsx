"use client";

import { useMemo, useState } from "react";

type GalleryItem = {
  id: string;
  photoUrl: string | null;
  caption: string | null;
};

type GalleryPhotoGridProps = {
  items: GalleryItem[];
};

export default function GalleryPhotoGrid({ items }: GalleryPhotoGridProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const activeItem = useMemo(() => {
    if (activeIndex === null) return null;
    return items[activeIndex] ?? null;
  }, [activeIndex, items]);

  return (
    <>
      <div className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {items.map((item, index) => (
          <div key={item.id} className="group cursor-zoom-in">
            <div className="relative mb-4 aspect-square overflow-hidden bg-slate-100">
              {item.photoUrl ? (
                <button type="button" onClick={() => setActiveIndex(index)} className="h-full w-full">
                  <img
                    alt={item.caption ?? "Gallery photo"}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                    style={{ filter: "saturate(0.8) contrast(1.05) sepia(0.05)" }}
                    src={item.photoUrl}
                  />
                </button>
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm text-slate-400">No image</div>
              )}
            </div>
            <h4 className="mb-1 text-sm font-medium opacity-0 transition-all duration-300 group-hover:text-primary group-hover:opacity-100">
              {item.caption || "5WD Archive"}
            </h4>
          </div>
        ))}
      </div>

      {activeItem?.photoUrl && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-4 md:p-8"
          onClick={() => setActiveIndex(null)}
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            onClick={() => setActiveIndex(null)}
            className="absolute top-4 right-4 rounded bg-black/50 px-3 py-1 text-sm text-white transition hover:bg-black/70"
          >
            Close
          </button>
          <img
            src={activeItem.photoUrl}
            alt={activeItem.caption ?? "Gallery photo"}
            className="max-h-[90vh] max-w-[90vw] object-contain"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
