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
          <linearGradient id="heroBlueFill" x1="112" y1="64" x2="438" y2="356" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F6FAFF" />
            <stop offset="0.22" stopColor="#BFD1FF" />
            <stop offset="0.62" stopColor="#82AAFF" />
            <stop offset="1" stopColor="#7DD3FC" />
          </linearGradient>
          <linearGradient id="heroRightFill" x1="398" y1="48" x2="562" y2="366" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F6FAFF" />
            <stop offset="0.36" stopColor="#DCE8FA" />
            <stop offset="0.72" stopColor="#A9BBE8" />
            <stop offset="1" stopColor="#8EA7FF" />
          </linearGradient>
          <linearGradient id="heroDepthFill" x1="120" y1="92" x2="470" y2="372" gradientUnits="userSpaceOnUse">
            <stop stopColor="#7C8DBF" stopOpacity="0.82" />
            <stop offset="0.54" stopColor="#536384" stopOpacity="0.72" />
            <stop offset="1" stopColor="#24304C" stopOpacity="0.78" />
          </linearGradient>
          <linearGradient id="heroRightDepthFill" x1="410" y1="86" x2="584" y2="368" gradientUnits="userSpaceOnUse">
            <stop stopColor="#D7E6FA" stopOpacity="0.82" />
            <stop offset="0.42" stopColor="#7F91BE" stopOpacity="0.72" />
            <stop offset="1" stopColor="#405177" stopOpacity="0.78" />
          </linearGradient>
          <linearGradient id="heroLogoGlassHighlight" x1="96" y1="78" x2="552" y2="312" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFFFFF" stopOpacity="0.95" />
            <stop offset="0.34" stopColor="#E8F1FF" stopOpacity="0.5" />
            <stop offset="1" stopColor="#9EEBFF" stopOpacity="0.22" />
          </linearGradient>
          <linearGradient id="heroLogoRim" x1="92" y1="76" x2="554" y2="348" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFFFFF" />
            <stop offset="0.44" stopColor="#C9D9FF" />
            <stop offset="1" stopColor="#8DEAFF" />
          </linearGradient>
          <filter id="heroLogoSoftGlow" x="-30%" y="-45%" width="160%" height="190%">
            <feGaussianBlur stdDeviation="4" result="blur" />
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
          <filter id="heroLogoDepthShadow" x="-28%" y="-32%" width="166%" height="170%">
            <feDropShadow dx="13" dy="16" stdDeviation="9" floodColor="#081629" floodOpacity="0.46" />
            <feDropShadow dx="-5" dy="-6" stdDeviation="7" floodColor="#D7E6FA" floodOpacity="0.14" />
          </filter>
        </defs>
        <g className="enhe-logo-depth enhe-logo-takeoff-tail" filter="url(#heroLogoDepthShadow)">
          <path d="M132 148L190 90H448V148H132Z" fill="url(#heroDepthFill)" />
          <path d="M130 201H390V253H130V201Z" fill="url(#heroDepthFill)" />
          <path d="M132 307H448V365H190L132 307Z" fill="url(#heroDepthFill)" />
          <path d="M418 202H504V96L518 82H578V372H504V262H418V202Z" fill="url(#heroRightDepthFill)" />
        </g>
        <g filter="url(#heroLogoSoftGlow)">
          <g className="enhe-logo-part enhe-logo-takeoff-front enhe-logo-slat-top">
            <path d="M108 126L166 68H424V126H108Z" fill="url(#heroBlueFill)" />
            <path className="enhe-logo-highlight" d="M128 114L174 80H407" />
          </g>
          <g className="enhe-logo-part enhe-logo-takeoff-front enhe-logo-slat-mid">
            <path d="M106 179H366V231H106V179Z" fill="url(#heroBlueFill)" />
            <path className="enhe-logo-highlight" d="M127 191H344" />
          </g>
          <g className="enhe-logo-part enhe-logo-takeoff-front enhe-logo-slat-bottom">
            <path d="M108 285H424V343H166L108 285Z" fill="url(#heroBlueFill)" />
            <path className="enhe-logo-highlight" d="M127 296H405" />
          </g>
          <g className="enhe-logo-part enhe-logo-takeoff-tail enhe-logo-metal">
            <path d="M394 180H480V74L494 60H554V350H480V240H394V180Z" fill="url(#heroRightFill)" />
            <path className="enhe-logo-highlight" d="M501 78H540V330" />
          </g>
          <g className="enhe-logo-glass-sheen">
            <path d="M115 126L166 76H424V103L151 103L123 126H115Z" fill="url(#heroLogoGlassHighlight)" />
            <path d="M106 179H366V196H106V179Z" fill="url(#heroLogoGlassHighlight)" />
            <path d="M108 285H424V306H132L108 285Z" fill="url(#heroLogoGlassHighlight)" />
            <path d="M494 60H554V91H504L480 115V74L494 60Z" fill="url(#heroLogoGlassHighlight)" />
          </g>
          <g className="enhe-logo-rim">
            <path d="M108 126L166 68H424V126H108Z" />
            <path d="M106 179H366V231H106V179Z" />
            <path d="M108 285H424V343H166L108 285Z" />
            <path d="M394 180H480V74L494 60H554V350H480V240H394V180Z" />
          </g>
        </g>
        <path className="enhe-logo-scanline" d="M70 210C164 174 318 170 404 205C492 241 552 237 592 210" />
      </svg>
    </button>
  );
}
