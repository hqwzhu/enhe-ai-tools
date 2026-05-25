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
      <svg className="enhe-hero-logo-svg" viewBox="0 0 640 420" role="img" aria-hidden="true">
        <defs>
          <linearGradient id="heroBlueFill" x1="112" y1="64" x2="428" y2="342" gradientUnits="userSpaceOnUse">
            <stop stopColor="#79B4FF" />
            <stop offset="0.48" stopColor="#4F86F7" />
            <stop offset="1" stopColor="#42D9CE" />
          </linearGradient>
          <linearGradient id="heroBlueEdge" x1="112" y1="46" x2="434" y2="352" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFFFFF" />
            <stop offset="0.4" stopColor="#BBD4FF" />
            <stop offset="1" stopColor="#84F4E8" />
          </linearGradient>
          <linearGradient id="heroRightFill" x1="394" y1="64" x2="554" y2="350" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F7FBFF" />
            <stop offset="0.38" stopColor="#D7E5FF" />
            <stop offset="1" stopColor="#9EB8E7" />
          </linearGradient>
          <linearGradient id="heroRightEdge" x1="396" y1="58" x2="556" y2="356" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFFFFF" />
            <stop offset="0.5" stopColor="#8FB9FF" />
            <stop offset="1" stopColor="#7CF1E4" />
          </linearGradient>
          <linearGradient id="heroLogoPremiumSheen" x1="114" y1="76" x2="424" y2="320" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFFFFF" stopOpacity="0.72" />
            <stop offset="0.34" stopColor="#AFC8FF" stopOpacity="0.2" />
            <stop offset="1" stopColor="#48F5D3" stopOpacity="0" />
          </linearGradient>
          <filter id="heroLogoGlow" x="-28%" y="-38%" width="156%" height="176%">
            <feGaussianBlur stdDeviation="7.5" result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="0 0 0 0 0.22 0 0 0 0 0.62 0 0 0 0 1 0 0 0 0.48 0"
            />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <g className="enhe-logo-part enhe-logo-slat-top">
          <path d="M108 126L166 68H424V126H108Z" fill="url(#heroBlueFill)" />
          <path d="M108 126L166 68H424V126H108Z" fill="none" stroke="url(#heroBlueEdge)" strokeWidth="6" strokeLinejoin="round" filter="url(#heroLogoGlow)" />
          <path d="M128 113L174 82H406" fill="none" stroke="url(#heroLogoPremiumSheen)" strokeWidth="2.5" strokeLinecap="round" opacity="0.68" />
        </g>
        <g className="enhe-logo-part enhe-logo-slat-mid">
          <path d="M106 179H366V231H106V179Z" fill="url(#heroBlueFill)" />
          <path d="M106 179H366V231H106V179Z" fill="none" stroke="url(#heroBlueEdge)" strokeWidth="6" strokeLinejoin="round" filter="url(#heroLogoGlow)" />
          <path d="M122 191H352" fill="none" stroke="url(#heroLogoPremiumSheen)" strokeWidth="2.5" strokeLinecap="round" opacity="0.56" />
        </g>
        <g className="enhe-logo-part enhe-logo-slat-bottom">
          <path d="M108 285H424V343H166L108 285Z" fill="url(#heroBlueFill)" />
          <path d="M108 285H424V343H166L108 285Z" fill="none" stroke="url(#heroBlueEdge)" strokeWidth="6" strokeLinejoin="round" filter="url(#heroLogoGlow)" />
          <path d="M126 296H408" fill="none" stroke="url(#heroLogoPremiumSheen)" strokeWidth="2.5" strokeLinecap="round" opacity="0.5" />
        </g>
        <g className="enhe-logo-part enhe-logo-metal">
          <path d="M394 180H480V74L494 60H554V350H480V240H394V180Z" fill="url(#heroRightFill)" />
          <path d="M394 180H480V74L494 60H554V350H480V240H394V180Z" fill="none" stroke="url(#heroRightEdge)" strokeWidth="6" strokeLinejoin="round" filter="url(#heroLogoGlow)" />
          <path d="M411 191H492V88L502 78H538" fill="none" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" opacity="0.58" />
          <path d="M496 332H536V82" fill="none" stroke="#7892C4" strokeWidth="3.4" strokeLinecap="round" opacity="0.42" />
        </g>
        <path className="enhe-logo-scanline" d="M70 210C164 174 318 170 404 205C492 241 552 237 592 210" />
      </svg>
    </button>
  );
}
