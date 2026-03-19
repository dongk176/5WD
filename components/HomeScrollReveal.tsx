"use client";

import { useEffect } from "react";

export default function HomeScrollReveal() {
  useEffect(() => {
    const targets = Array.from(document.querySelectorAll<HTMLElement>(".home-reveal"));

    if (!targets.length) return;

    targets.forEach((element) => element.classList.remove("home-reveal-visible"));

    if (!("IntersectionObserver" in window)) {
      targets.forEach((element) => element.classList.add("home-reveal-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
          if (entry.boundingClientRect.top > viewportHeight * 0.82) return;
          entry.target.classList.add("home-reveal-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -18% 0px",
      },
    );

    targets.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  return null;
}
