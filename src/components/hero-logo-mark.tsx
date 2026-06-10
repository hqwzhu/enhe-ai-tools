"use client";

import { useEffect, useRef, useState } from "react";

type FlatEnheLogoSvgProps = {
  className?: string;
  decorative?: boolean;
  label?: string;
};

export function FlatEnheLogoSvg({
  className,
  decorative = false,
  label = "ENHE AI"
}: FlatEnheLogoSvgProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 640 420"
      role={decorative ? undefined : "img"}
      aria-hidden={decorative ? "true" : undefined}
      aria-label={decorative ? undefined : label}
    >
      <defs>
        <linearGradient id="flatHeroLogoFill" x1="96" y1="92" x2="494" y2="320" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F6FAFF" />
          <stop offset="0.42" stopColor="#BDEFFF" />
          <stop offset="1" stopColor="#5AD7F6" />
        </linearGradient>
        <linearGradient id="flatHeroLogoRail" x1="100" y1="112" x2="500" y2="308" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7DD3FC" stopOpacity="0.08" />
          <stop offset="0.52" stopColor="#A7F3FF" stopOpacity="0.5" />
          <stop offset="1" stopColor="#7DD3FC" stopOpacity="0.12" />
        </linearGradient>
        <linearGradient id="flatHeroLogoStem" x1="402" y1="62" x2="562" y2="356" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFFFFF" />
          <stop offset="0.52" stopColor="#D6E7FF" />
          <stop offset="1" stopColor="#8EDCF8" />
        </linearGradient>
        <filter id="flatHeroLogoGlow" x="-10%" y="-18%" width="120%" height="136%">
          <feGaussianBlur stdDeviation="3.8" result="blur" />
          <feColorMatrix
            in="blur"
            type="matrix"
            values="0 0 0 0 0.35 0 0 0 0 0.82 0 0 0 0 0.95 0 0 0 0.28 0"
          />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g className="enhe-flat-logo-rails" aria-hidden="true">
        <path d="M100 108H400" />
        <path d="M100 206H400" />
        <path d="M100 304H400" />
        <path d="M492 74V346" />
      </g>
      <g filter="url(#flatHeroLogoGlow)">
        <rect className="enhe-flat-logo-slat enhe-flat-logo-slat-top" x="108" y="122" width="292" height="48" rx="5" fill="url(#flatHeroLogoFill)" />
        <rect className="enhe-flat-logo-slat enhe-flat-logo-slat-mid" x="108" y="186" width="244" height="48" rx="5" fill="url(#flatHeroLogoFill)" />
        <rect className="enhe-flat-logo-slat enhe-flat-logo-slat-bottom" x="108" y="250" width="292" height="48" rx="5" fill="url(#flatHeroLogoFill)" />
        <path className="enhe-flat-logo-stem" d="M414 122H496V74H556V346H496V298H414V250H496V170H414V122Z" fill="url(#flatHeroLogoStem)" />
      </g>
      <g className="enhe-flat-logo-lines" aria-hidden="true">
        <path d="M128 146H382" />
        <path d="M128 210H332" />
        <path d="M128 274H382" />
        <path d="M518 96V324" />
      </g>
      <path className="enhe-flat-logo-scan" d="M82 210H584" aria-hidden="true" />
    </svg>
  );
}

export function HeroLogoMark({ label }: { label: string }) {
  const [isIgnited, setIsIgnited] = useState(false);
  const igniteTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const introTimer = setTimeout(() => triggerIgnition(), 520);
    return () => {
      clearTimeout(introTimer);
      if (igniteTimer.current) clearTimeout(igniteTimer.current);
    };
  }, []);

  function triggerIgnition() {
    if (igniteTimer.current) clearTimeout(igniteTimer.current);
    setIsIgnited(false);
    requestAnimationFrame(() => {
      setIsIgnited(true);
      igniteTimer.current = setTimeout(() => setIsIgnited(false), 1100);
    });
  }

  return (
    <button
      type="button"
      aria-label={label}
      onClick={triggerIgnition}
      className={`enhe-hero-logo-button ${isIgnited ? "is-ignited" : ""}`}
    >
      <span className="enhe-logo-energy-line enhe-logo-energy-line-a" aria-hidden="true" />
      <span className="enhe-logo-energy-line enhe-logo-energy-line-b" aria-hidden="true" />
      <span className="enhe-logo-node enhe-logo-node-a" aria-hidden="true" />
      <span className="enhe-logo-node enhe-logo-node-b" aria-hidden="true" />
      <FlatEnheLogoSvg className="enhe-hero-logo-svg" label={label} />
    </button>
  );
}
