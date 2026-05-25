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
          <linearGradient id="heroBlueFill" x1="116" y1="70" x2="430" y2="346" gradientUnits="userSpaceOnUse">
            <stop stopColor="#D9E8FF" />
            <stop offset="0.22" stopColor="#7FAEFF" />
            <stop offset="0.6" stopColor="#3E78E8" />
            <stop offset="1" stopColor="#57D3CE" />
          </linearGradient>
          <linearGradient id="heroBlueEdge" x1="112" y1="46" x2="434" y2="352" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFFFFF" />
            <stop offset="0.3" stopColor="#BFD4FF" />
            <stop offset="0.68" stopColor="#6EA2FF" />
            <stop offset="1" stopColor="#8FF2E5" />
          </linearGradient>
          <linearGradient id="heroMetalFill" x1="398" y1="68" x2="548" y2="350" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFFFFF" />
            <stop offset="0.16" stopColor="#DCE8F6" />
            <stop offset="0.45" stopColor="#A7BCD8" />
            <stop offset="0.72" stopColor="#7890B0" />
            <stop offset="1" stopColor="#C7D4E8" />
          </linearGradient>
          <linearGradient id="heroMetalEdge" x1="402" y1="64" x2="548" y2="356" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFFFFF" />
            <stop offset="0.34" stopColor="#9DC2FF" />
            <stop offset="0.72" stopColor="#5E89D7" />
            <stop offset="1" stopColor="#A4FFF0" />
          </linearGradient>
          <linearGradient id="heroLogoPremiumSheen" x1="114" y1="76" x2="424" y2="320" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFFFFF" stopOpacity="0.72" />
            <stop offset="0.34" stopColor="#AFC8FF" stopOpacity="0.2" />
            <stop offset="1" stopColor="#48F5D3" stopOpacity="0" />
          </linearGradient>
          <filter id="heroLogoGlow" x="-18%" y="-26%" width="136%" height="152%">
            <feGaussianBlur stdDeviation="5.4" result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="0 0 0 0 0.08 0 0 0 0 0.37 0 0 0 0 1 0 0 0 0.45 0"
            />
            <feBlend in="SourceGraphic" mode="screen" />
          </filter>
          <filter id="heroMetalShadow" x="-12%" y="-14%" width="124%" height="128%">
            <feDropShadow dx="0" dy="14" stdDeviation="14" floodColor="#0C2A5C" floodOpacity="0.28" />
            <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#9EC7FF" floodOpacity="0.28" />
          </filter>
        </defs>
        <g className="enhe-logo-part enhe-logo-slat-top" filter="url(#heroLogoGlow)">
          <path d="M108 126L166 68H424V126H108Z" fill="url(#heroBlueFill)" />
          <path d="M108 126L166 68H424V126H108Z" stroke="url(#heroBlueEdge)" strokeWidth="8" strokeLinejoin="round" />
          <path d="M125 116L172 79H411" stroke="url(#heroLogoPremiumSheen)" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
          <path d="M114 130H420" stroke="#3157A4" strokeWidth="7" opacity="0.34" />
        </g>
        <g className="enhe-logo-part enhe-logo-slat-mid" filter="url(#heroLogoGlow)">
          <path d="M106 179H366V231H106V179Z" fill="url(#heroBlueFill)" />
          <path d="M106 179H366V231H106V179Z" stroke="url(#heroBlueEdge)" strokeWidth="8" strokeLinejoin="round" />
          <path d="M120 190H354" stroke="url(#heroLogoPremiumSheen)" strokeWidth="3" strokeLinecap="round" opacity="0.58" />
          <path d="M112 235H360" stroke="#3157A4" strokeWidth="7" opacity="0.32" />
        </g>
        <g className="enhe-logo-part enhe-logo-slat-bottom" filter="url(#heroLogoGlow)">
          <path d="M108 285H424V343H166L108 285Z" fill="url(#heroBlueFill)" />
          <path d="M108 285H424V343H166L108 285Z" stroke="url(#heroBlueEdge)" strokeWidth="8" strokeLinejoin="round" />
          <path d="M125 294H411" stroke="url(#heroLogoPremiumSheen)" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
          <path d="M168 354H420" stroke="#3157A4" strokeWidth="7" opacity="0.32" />
        </g>
        <g className="enhe-logo-part enhe-logo-metal" filter="url(#heroMetalShadow)">
          <path d="M394 180H480V74L494 60H554V350H480V240H394V180Z" fill="url(#heroMetalFill)" />
          <path d="M394 180H480V74L494 60H554V350H480V240H394V180Z" stroke="url(#heroMetalEdge)" strokeWidth="8" strokeLinejoin="round" />
          <path d="M412 191H490V85L500 74H539" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" opacity="0.42" />
          <path d="M495 334H538V78" stroke="#627EA8" strokeWidth="8" opacity="0.34" />
        </g>
        <path className="enhe-logo-scanline" d="M70 210C164 174 318 170 404 205C492 241 552 237 592 210" />
      </svg>
    </button>
  );
}
