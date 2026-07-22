"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useReducedMotion } from "motion/react";
import GradientText from "./gradient-text";

const heroGradientColors = [
  "#ffffff",
  "#d8f9fb",
  "#8be1e9",
  "#56bfd0",
  "#20bbd6",
  "#8be1e9",
  "#ffffff"
];

export function HeroGradientSubtitle({ children }: { children: ReactNode }) {
  const motionPreference = useReducedMotion();
  const [shouldReduceMotion, setShouldReduceMotion] = useState<boolean | null>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    function syncMotionPreference() {
      setShouldReduceMotion(mediaQuery.matches);
    }

    syncMotionPreference();
    mediaQuery.addEventListener("change", syncMotionPreference);
    return () => mediaQuery.removeEventListener("change", syncMotionPreference);
  }, []);

  if (shouldReduceMotion !== false || motionPreference) {
    return <span className="enhe-hero-subtitle-static">{children}</span>;
  }

  return (
    <GradientText
      colors={heroGradientColors}
      animationSpeed={7.5}
      direction="horizontal"
      pauseOnHover={false}
      yoyo
      showBorder={false}
      className="enhe-hero-gradient-subtitle"
    >
      {children}
    </GradientText>
  );
}
