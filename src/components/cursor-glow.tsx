"use client";

import { useEffect, useRef, useState } from "react";

const EASE = 0.14;
const INITIAL_COORDINATE = 0;

function bindMediaChange(query: MediaQueryList, listener: () => void) {
  const mediaQuery = query as MediaQueryList & {
    addListener?: (callback: () => void) => void;
    removeListener?: (callback: () => void) => void;
  };

  if (typeof mediaQuery.addEventListener === "function") {
    query.addEventListener("change", listener);
    return () => query.removeEventListener("change", listener);
  }

  mediaQuery.addListener?.(listener);
  return () => mediaQuery.removeListener?.(listener);
}

export function CursorGlow() {
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const shellRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const enabledRef = useRef(false);
  const visibleRef = useRef(false);
  const targetRef = useRef({ x: INITIAL_COORDINATE, y: INITIAL_COORDINATE });
  const currentRef = useRef({ x: INITIAL_COORDINATE, y: INITIAL_COORDINATE });

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }

    const coarsePointerQuery = window.matchMedia("(pointer: coarse)");
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const hideGlow = () => {
      visibleRef.current = false;
      setVisible(false);
    };

    const syncEnabled = () => {
      const nextEnabled = !coarsePointerQuery.matches && !reducedMotionQuery.matches;
      enabledRef.current = nextEnabled;
      setEnabled(nextEnabled);

      if (!nextEnabled) {
        hideGlow();

        if (frameRef.current !== null) {
          window.cancelAnimationFrame(frameRef.current);
          frameRef.current = null;
        }
      } else if (frameRef.current === null) {
        frameRef.current = window.requestAnimationFrame(tick);
      }
    };

    const tick = () => {
      if (enabledRef.current && shellRef.current) {
        const dx = targetRef.current.x - currentRef.current.x;
        const dy = targetRef.current.y - currentRef.current.y;

        currentRef.current.x += dx * EASE;
        currentRef.current.y += dy * EASE;
        shellRef.current.style.transform = `translate3d(${currentRef.current.x}px, ${currentRef.current.y}px, 0)`;
      }

      frameRef.current = window.requestAnimationFrame(tick);
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!enabledRef.current) {
        return;
      }

      targetRef.current = { x: event.clientX, y: event.clientY };

      if (!visibleRef.current) {
        currentRef.current = { x: event.clientX, y: event.clientY };
        visibleRef.current = true;
        setVisible(true);

        if (shellRef.current) {
          shellRef.current.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
        }
      }
    };

    const handlePointerOut = (event: PointerEvent) => {
      if (event.relatedTarget === null) {
        hideGlow();
      }
    };

    syncEnabled();

    const unbindCoarsePointer = bindMediaChange(coarsePointerQuery, syncEnabled);
    const unbindReducedMotion = bindMediaChange(reducedMotionQuery, syncEnabled);

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    document.addEventListener("pointerout", handlePointerOut);
    window.addEventListener("blur", hideGlow);

    return () => {
      unbindCoarsePointer();
      unbindReducedMotion();
      window.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerout", handlePointerOut);
      window.removeEventListener("blur", hideGlow);

      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  if (!enabled) {
    return null;
  }

  return (
    <div
      ref={shellRef}
      aria-hidden="true"
      className={`cursor-glow-shell${visible ? " is-visible" : ""}`}
    >
      <div className="cursor-glow-orb cursor-glow-orb-outer" />
      <div className="cursor-glow-orb cursor-glow-orb-inner" />
    </div>
  );
}
