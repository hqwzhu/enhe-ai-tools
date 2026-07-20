"use client";

import { useEffect, useState } from "react";
import Particles from "@/components/home/particles";

const HERO_PARTICLE_COLORS = ["#13c4e2"];

export function HomeParticlesBackground() {
  const [canRenderWebGL, setCanRenderWebGL] = useState(false);

  useEffect(() => {
    const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const isAutomatedBrowser = navigator.webdriver;

    function syncMotionPreference() {
      setCanRenderWebGL(!reduceMotionQuery.matches && !isAutomatedBrowser);
    }

    syncMotionPreference();
    reduceMotionQuery.addEventListener("change", syncMotionPreference);

    return () => {
      reduceMotionQuery.removeEventListener("change", syncMotionPreference);
    };
  }, []);

  if (!canRenderWebGL) {
    return <div className="home-particles-fallback" />;
  }

  return (
    <Particles
      particleColors={HERO_PARTICLE_COLORS}
      particleCount={600}
      particleSpread={10}
      speed={0.1}
      particleBaseSize={100}
      moveParticlesOnHover
      alphaParticles={false}
      disableRotation={false}
      pixelRatio={1}
      className="home-particles-canvas"
    />
  );
}
