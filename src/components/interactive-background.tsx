"use client";

import { useEffect } from "react";

export function InteractiveBackground() {
  useEffect(() => {
    const root = document.documentElement;
    const updatePointer = (event: PointerEvent) => {
      root.style.setProperty("--mouse-x", `${event.clientX}px`);
      root.style.setProperty("--mouse-y", `${event.clientY}px`);
    };

    window.addEventListener("pointermove", updatePointer, { passive: true });
    return () => window.removeEventListener("pointermove", updatePointer);
  }, []);

  return (
    <div className="interactive-backdrop" aria-hidden="true">
      <div className="interactive-beam interactive-beam-a" />
      <div className="interactive-beam interactive-beam-b" />
      <div className="interactive-grid" />
    </div>
  );
}
