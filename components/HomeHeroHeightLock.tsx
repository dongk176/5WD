"use client";

import { useLayoutEffect } from "react";

export default function HomeHeroHeightLock() {
  useLayoutEffect(() => {
    const hero = document.getElementById("home-hero");
    if (!hero) return;

    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    if (!isMobile) return;

    hero.style.setProperty("--home-hero-height", `${Math.round(window.innerHeight)}px`);
  }, []);

  return null;
}
