"use client";

import Link from "next/link";
import { useState } from "react";

const STREAMING_OPTIONS = [
  {
    label: "Apple Music",
    href: "https://music.apple.com/kr/artist/%EC%98%A4%EB%A5%9C%EA%B5%AC%EB%8F%99/1834092287",
    icon: "/sns/apple-music.png",
  },
  {
    label: "Spotify",
    href: "https://open.spotify.com/artist/381k5Yy8foFQKk2H1Ff1ne?si=SwAYJOuvSoez7PznXRL-8g",
    icon: "/sns/spotify.png",
  },
];

export default function HomeHeroCta() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="absolute bottom-8 left-1/2 z-20 flex w-[calc(100%-3rem)] max-w-sm -translate-x-1/2 flex-col items-center gap-3 md:bottom-28 md:w-auto md:max-w-none md:flex-row">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="home-reveal home-delay-2 w-full border border-charcoal bg-charcoal px-7 py-3 text-center text-xs font-semibold tracking-[0.24em] text-white uppercase transition hover:bg-transparent hover:text-charcoal md:w-auto"
        >
          Listen Now
        </button>
        <Link
          href="/contact"
          className="home-reveal home-delay-3 w-full border border-charcoal bg-white/40 px-7 py-3 text-center text-xs font-semibold tracking-[0.24em] text-charcoal uppercase backdrop-blur-sm transition hover:bg-charcoal hover:text-white md:w-auto"
        >
          Contact
        </Link>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/45 p-5"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Select streaming platform"
        >
          <div
            className="w-full max-w-sm border border-slate-200 bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold tracking-[0.2em] text-charcoal uppercase">Listen Now</h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-xs font-medium tracking-[0.14em] text-slate-500 uppercase hover:text-charcoal"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {STREAMING_OPTIONS.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className="flex flex-col items-center gap-2 border border-slate-200 px-4 py-4 transition hover:border-charcoal hover:bg-slate-50"
                >
                  <img src={item.icon} alt={item.label} className="h-9 w-9 object-contain" />
                  <span className="text-[11px] font-semibold tracking-[0.14em] text-charcoal uppercase">{item.label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
