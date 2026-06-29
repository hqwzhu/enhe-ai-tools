"use client";

import { useEffect, useState } from "react";
import LiquidEther from "@/components/home/liquid-ether";

const liquidEtherColors = ["#56bfd0", "#41c5db", "#20bbd6"];

export function HomeLiquidEtherBackground() {
  const [canRenderWebGL, setCanRenderWebGL] = useState(false);

  useEffect(() => {
    const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    function syncMotionPreference() {
      setCanRenderWebGL(!reduceMotionQuery.matches);
    }

    syncMotionPreference();
    reduceMotionQuery.addEventListener("change", syncMotionPreference);

    return () => {
      reduceMotionQuery.removeEventListener("change", syncMotionPreference);
    };
  }, []);

  if (!canRenderWebGL) {
    return <div className="home-liquid-ether-fallback" />;
  }

  return (
    <LiquidEther
      colors={liquidEtherColors}
      mouseForce={20}
      cursorSize={100}
      isViscous
      viscous={30}
      iterationsViscous={32}
      iterationsPoisson={32}
      resolution={0.5}
      isBounce={false}
      autoDemo
      autoSpeed={0.5}
      autoIntensity={2.2}
      takeoverDuration={0.25}
      autoResumeDelay={3000}
      autoRampDuration={0.6}
      className="home-liquid-ether-canvas"
    />
  );
}
