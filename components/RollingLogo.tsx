"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type RollingLogoProps = {
  mode?: "roll-in" | "spin" | "none";
};

const SPIN_DURATION_SECONDS = 24;
const SPIN_START_KEY = "__fivewdLogoSpinStartMs";

function getSharedSpinDelaySeconds(): number {
  if (typeof window === "undefined") return 0;

  const globalWindow = window as Window & { [SPIN_START_KEY]?: number };
  const now = Date.now();
  if (!globalWindow[SPIN_START_KEY]) {
    globalWindow[SPIN_START_KEY] = now;
  }

  const elapsedSeconds = (now - globalWindow[SPIN_START_KEY]!) / 1000;
  return -(elapsedSeconds % SPIN_DURATION_SECONDS);
}

export default function RollingLogo({ mode = "none" }: RollingLogoProps) {
  const [play, setPlay] = useState(false);
  const [spinDelaySeconds, setSpinDelaySeconds] = useState(() => (mode === "spin" ? getSharedSpinDelaySeconds() : 0));
  const shouldRollIn = mode === "roll-in";

  useEffect(() => {
    if (!shouldRollIn) {
      setPlay(false);
      return;
    }
    const rafId = requestAnimationFrame(() => setPlay(true));
    return () => cancelAnimationFrame(rafId);
  }, [shouldRollIn]);

  useEffect(() => {
    if (mode !== "spin") {
      setSpinDelaySeconds(0);
      return;
    }
    setSpinDelaySeconds(getSharedSpinDelaySeconds());
  }, [mode]);

  return (
    <div
      className={`${shouldRollIn && play ? "logo-roll-in" : ""} ${mode === "spin" ? "logo-spin-slow" : ""} shrink-0`}
      style={mode === "spin" ? { animationDelay: `${spinDelaySeconds}s` } : undefined}
    >
      <Image
        src="/home/logo.png"
        alt="Band logo"
        width={280}
        height={96}
        className="h-14 w-auto md:h-16"
        priority
      />
    </div>
  );
}
