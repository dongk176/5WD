"use client";

import { useLayoutEffect } from "react";

export default function HomeHeroViewportLock() {
  useLayoutEffect(() => {
    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    if (!isMobile) return;

    const locked = document.documentElement.style.getPropertyValue("--home-hero-lock");
    if (locked) return;

    const height = Math.round(window.visualViewport?.height || window.innerHeight || 0);
    if (height > 0) {
      document.documentElement.style.setProperty("--home-hero-lock", `${height}px`);
    }
  }, []);

  return null;
}
