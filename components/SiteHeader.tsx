"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import RollingLogo from "@/components/RollingLogo";

type NavKey = "tour" | "team" | "discography" | "video" | "gallery" | "contact";

type SiteHeaderProps = {
  active?: NavKey;
  logoAnimation?: "roll-in" | "spin" | "none";
};

const navItems: Array<{ key: NavKey; label: string; href: string }> = [
  { key: "tour", label: "Tour", href: "/tour" },
  { key: "team", label: "Team", href: "/team" },
  { key: "discography", label: "Discography", href: "/discography" },
  { key: "video", label: "Video", href: "/video" },
  { key: "gallery", label: "Gallery", href: "/gallery" },
  { key: "contact", label: "Contact", href: "/contact" },
];

export default function SiteHeader({ active, logoAnimation = "spin" }: SiteHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isMenuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMenuOpen]);

  return (
    <>
      <header className="fixed top-0 left-0 z-50 w-full border-b border-slate-300/35 bg-white/10 backdrop-blur-[6px]">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <RollingLogo mode={logoAnimation} />
            <span className="text-sm font-semibold tracking-[0.14em] text-charcoal drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)] md:text-xl">
              5WD 오륜구동
            </span>
          </Link>

          <nav className="hidden items-center gap-10 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className={`text-sm md:text-base tracking-[0.2em] uppercase transition-colors hover:text-primary ${
                  active === item.key ? "font-semibold text-primary" : "font-medium text-charcoal"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <button
            aria-label="Open menu"
            className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 border border-slate-300/70 bg-white/35 backdrop-blur-sm md:hidden"
            type="button"
            onClick={() => setIsMenuOpen(true)}
          >
            <span className="h-0.5 w-5 bg-slate-500" />
            <span className="h-0.5 w-5 bg-slate-500" />
            <span className="h-0.5 w-5 bg-slate-500" />
          </button>
        </div>
      </header>

      {isMenuOpen && (
        <div className="fixed inset-0 z-[90] md:hidden">
          <button
            type="button"
            aria-label="Close menu overlay"
            className="absolute inset-0 bg-black/35"
            onClick={() => setIsMenuOpen(false)}
          />
          <div className="absolute right-0 bottom-0 left-0 border-t border-slate-200 bg-white/95 px-6 pt-5 pb-[calc(env(safe-area-inset-bottom)+1.25rem)] backdrop-blur-md">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-xs font-semibold tracking-[0.18em] text-slate-500 uppercase">Menu</p>
              <button
                type="button"
                onClick={() => setIsMenuOpen(false)}
                className="text-xs font-medium tracking-[0.12em] text-slate-500 uppercase"
              >
                Close
              </button>
            </div>
            <nav className="grid gap-1">
              <Link
                href="/"
                onClick={() => setIsMenuOpen(false)}
                className={`border-b border-slate-100 py-3 text-base tracking-[0.14em] uppercase ${
                  pathname === "/" ? "font-semibold text-primary" : "font-medium text-charcoal"
                }`}
              >
                Home
              </Link>
              {navItems.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`border-b border-slate-100 py-3 text-base tracking-[0.14em] uppercase ${
                    active === item.key ? "font-semibold text-primary" : "font-medium text-charcoal"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
