"use client";

import { useEffect, useRef, useState } from "react";

export function HeroLogoMark({ label }: { label: string }) {
  const [isMorphing, setIsMorphing] = useState(false);
  const morphTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (morphTimer.current) clearTimeout(morphTimer.current);
    };
  }, []);

  function triggerMorph() {
    if (morphTimer.current) clearTimeout(morphTimer.current);
    setIsMorphing(false);
    requestAnimationFrame(() => {
      setIsMorphing(true);
      morphTimer.current = setTimeout(() => setIsMorphing(false), 780);
    });
  }

  return (
    <button
      type="button"
      aria-label={label}
      onClick={triggerMorph}
      className={`enhe-hero-logo-button ${isMorphing ? "is-morphing" : ""}`}
    >
      <span className="enhe-logo-comet-orbit enhe-logo-comet-orbit-a" aria-hidden="true">
        <span />
      </span>
      <span className="enhe-logo-comet-orbit enhe-logo-comet-orbit-b" aria-hidden="true">
        <span />
      </span>
      <span className="enhe-logo-comet-orbit enhe-logo-comet-orbit-c" aria-hidden="true">
        <span />
      </span>
      <svg className="enhe-hero-logo-svg" viewBox="0 0 640 420" role="img" aria-hidden="true">
        <defs>
          <linearGradient id="heroBlueFill" x1="112" y1="64" x2="428" y2="342" gradientUnits="userSpaceOnUse">
            <stop stopColor="#6FA8FF" />
            <stop offset="0.55" stopColor="#4B7FE8" />
            <stop offset="1" stopColor="#42D7C9" />
          </linearGradient>
          <linearGradient id="heroRightFill" x1="394" y1="64" x2="554" y2="350" gradientUnits="userSpaceOnUse">
            <stop stopColor="#AFC9F6" />
            <stop offset="0.5" stopColor="#7F9AD8" />
            <stop offset="1" stopColor="#5F7AB8" />
          </linearGradient>
          <filter id="heroLogoSoftGlow" x="-30%" y="-45%" width="160%" height="190%">
            <feGaussianBlur stdDeviation="5.5" result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="0 0 0 0 0.26 0 0 0 0 0.85 0 0 0 0 0.78 0 0 0 0.24 0"
            />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <g filter="url(#heroLogoSoftGlow)">
          <g className="enhe-logo-part enhe-logo-slat-top">
          <path d="M108 126L166 68H424V126H108Z" fill="url(#heroBlueFill)" />
          </g>
          <g className="enhe-logo-part enhe-logo-slat-mid">
            <path d="M106 179H366V231H106V179Z" fill="url(#heroBlueFill)" />
          </g>
          <g className="enhe-logo-part enhe-logo-slat-bottom">
            <path d="M108 285H424V343H166L108 285Z" fill="url(#heroBlueFill)" />
          </g>
          <g className="enhe-logo-part enhe-logo-metal">
            <path d="M394 180H480V74L494 60H554V350H480V240H394V180Z" fill="url(#heroRightFill)" />
          </g>
        </g>
        <path className="enhe-logo-scanline" d="M70 210C164 174 318 170 404 205C492 241 552 237 592 210" />
      </svg>
    </button>
  );
}
