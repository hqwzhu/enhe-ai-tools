"use client";

import { useEffect, useState } from "react";
import Strands from "./strands.client";

type RenderMode = "static" | "desktop" | "mobile";

export default function SearchStrands() {
  const [mode, setMode] = useState<RenderMode>("static");

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobileViewport = window.matchMedia("(max-width: 640px)");
    const updateMode = () => {
      setMode(reducedMotion.matches ? "static" : mobileViewport.matches ? "mobile" : "desktop");
    };

    updateMode();
    reducedMotion.addEventListener("change", updateMode);
    mobileViewport.addEventListener("change", updateMode);

    return () => {
      reducedMotion.removeEventListener("change", updateMode);
      mobileViewport.removeEventListener("change", updateMode);
    };
  }, []);

  if (mode === "static") {
    return <div className="public-search-strands-static" />;
  }

  const mobile = mode === "mobile";

  return (
    <Strands
      colors={["#56bfd0", "#41c5db", "#20bbd6", "#d8f9fb"]}
      count={mobile ? 2 : 3}
      speed={mobile ? 0.32 : 0.38}
      amplitude={mobile ? 0.76 : 0.85}
      waviness={0.9}
      thickness={mobile ? 0.45 : 0.56}
      glow={mobile ? 1.8 : 2.2}
      taper={3.4}
      spread={0.92}
      intensity={mobile ? 0.38 : 0.48}
      saturation={1.25}
      opacity={mobile ? 0.64 : 0.82}
      scale={mobile ? 1.2 : 1.35}
      glass={false}
      refraction={1}
      dispersion={1}
      glassSize={1}
    />
  );
}
