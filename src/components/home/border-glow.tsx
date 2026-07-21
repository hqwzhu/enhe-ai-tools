"use client";

import {
  useCallback,
  useEffect,
  useRef,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type PropsWithChildren,
} from "react";
import styles from "./border-glow.module.css";

// Adapted from React Bits BorderGlow, licensed MIT + Commons Clause.
type BorderGlowProps = PropsWithChildren<{
  animated?: boolean;
  backgroundColor?: string;
  borderRadius?: number;
  className?: string;
  colors?: string[];
  coneSpread?: number;
  edgeSensitivity?: number;
  fillOpacity?: number;
  glowColor?: string;
  glowIntensity?: number;
  glowRadius?: number;
  variant: "button" | "card";
}>;

type GlowStyle = CSSProperties & Record<`--${string}`, string | number>;

const DEFAULT_COLORS = ["#56bfd0", "#41c5db", "#20bbd6"];

function parseHsl(value: string) {
  const match = value.match(/([\d.]+)\s*([\d.]+)%?\s*([\d.]+)%?/);
  return match
    ? { h: Number(match[1]), s: Number(match[2]), l: Number(match[3]) }
    : { h: 190, s: 80, l: 72 };
}

function buildGlowVars(glowColor: string, intensity: number) {
  const { h, s, l } = parseHsl(glowColor);
  const opacities = [100, 60, 50, 40, 30, 20, 10];
  const suffixes = ["", "-60", "-50", "-40", "-30", "-20", "-10"];

  return Object.fromEntries(
    opacities.map((opacity, index) => [
      `--glow-color${suffixes[index]}`,
      `hsl(${h}deg ${s}% ${l}% / ${Math.min(opacity * intensity, 100)}%)`,
    ]),
  );
}

function buildGradientVars(colors: string[]) {
  const palette = colors.length > 0 ? colors : DEFAULT_COLORS;
  return {
    "--gradient-one": palette[0] ?? DEFAULT_COLORS[0],
    "--gradient-two": palette[1] ?? palette[0] ?? DEFAULT_COLORS[1],
    "--gradient-three": palette[2] ?? palette[0] ?? DEFAULT_COLORS[2],
  };
}

function getEdgeProximity(rect: DOMRect, x: number, y: number) {
  const cx = rect.width / 2;
  const cy = rect.height / 2;
  const dx = x - cx;
  const dy = y - cy;
  const kx = dx === 0 ? Infinity : cx / Math.abs(dx);
  const ky = dy === 0 ? Infinity : cy / Math.abs(dy);

  return Math.min(Math.max(1 / Math.min(kx, ky), 0), 1);
}

function getCursorAngle(rect: DOMRect, x: number, y: number) {
  const dx = x - rect.width / 2;
  const dy = y - rect.height / 2;

  if (dx === 0 && dy === 0) {
    return 0;
  }

  const angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
  return angle < 0 ? angle + 360 : angle;
}

function resetGlow(card: HTMLElement) {
  card.style.setProperty("--edge-proximity", "0");
  card.style.setProperty("--border-glow-strength", "0");
}

function bindMediaChange(query: MediaQueryList, listener: () => void) {
  query.addEventListener("change", listener);
  return () => query.removeEventListener("change", listener);
}

function easeOutCubic(value: number) {
  return 1 - Math.pow(1 - value, 3);
}

export default function BorderGlow({
  animated = false,
  backgroundColor = "transparent",
  borderRadius = 18,
  children,
  className = "",
  colors = DEFAULT_COLORS,
  coneSpread = 22,
  edgeSensitivity = 28,
  fillOpacity = 0.16,
  glowColor = "190 85 70",
  glowIntensity = 0.75,
  glowRadius = 42,
  variant,
}: BorderGlowProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const trackingEnabledRef = useRef(false);

  useEffect(() => {
    const card = cardRef.current;
    const coarsePointer = window.matchMedia("(pointer: coarse)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncTracking = () => {
      trackingEnabledRef.current = !coarsePointer.matches && !reducedMotion.matches;
      if (!trackingEnabledRef.current && card) {
        resetGlow(card);
      }
    };

    syncTracking();
    const unbindCoarsePointer = bindMediaChange(coarsePointer, syncTracking);
    const unbindReducedMotion = bindMediaChange(reducedMotion, syncTracking);

    return () => {
      unbindCoarsePointer();
      unbindReducedMotion();
    };
  }, []);

  useEffect(() => {
    const card = cardRef.current;
    const coarsePointer = window.matchMedia("(pointer: coarse)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (!animated || !card || coarsePointer.matches || reducedMotion.matches) {
      return;
    }

    const startedAt = performance.now();
    const duration = 3200;
    let frameId = 0;
    card.classList.add(styles.sweepActive);

    const tick = (now: number) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      const rise = easeOutCubic(Math.min(progress / 0.16, 1));
      const fade = progress < 0.68 ? 1 : 1 - easeOutCubic((progress - 0.68) / 0.32);
      const strength = Math.min(rise, fade);

      card.style.setProperty("--edge-proximity", (strength * 100).toFixed(3));
      card.style.setProperty("--border-glow-strength", strength.toFixed(3));
      card.style.setProperty("--cursor-angle", `${(110 + progress * 355).toFixed(3)}deg`);

      if (progress < 1) {
        frameId = window.requestAnimationFrame(tick);
      } else {
        card.classList.remove(styles.sweepActive);
        resetGlow(card);
      }
    };

    frameId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(frameId);
      card.classList.remove(styles.sweepActive);
      resetGlow(card);
    };
  }, [animated]);

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const card = cardRef.current;
      if (!card || !trackingEnabledRef.current) {
        return;
      }

      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const edgeProximity = getEdgeProximity(rect, x, y) * 100;
      const strength = Math.min(Math.max((edgeProximity - edgeSensitivity) / (100 - edgeSensitivity), 0), 1);

      card.style.setProperty("--edge-proximity", edgeProximity.toFixed(3));
      card.style.setProperty("--border-glow-strength", strength.toFixed(3));
      card.style.setProperty("--cursor-angle", `${getCursorAngle(rect, x, y).toFixed(3)}deg`);
    },
    [edgeSensitivity],
  );

  const handlePointerLeave = useCallback(() => {
    const card = cardRef.current;
    if (card && !card.classList.contains(styles.sweepActive)) {
      resetGlow(card);
    }
  }, []);

  const style = {
    "--card-bg": backgroundColor,
    "--border-radius": `${borderRadius}px`,
    "--cone-spread": coneSpread,
    "--edge-sensitivity": edgeSensitivity,
    "--fill-opacity": fillOpacity,
    "--glow-padding": `${glowRadius}px`,
    ...buildGlowVars(glowColor, glowIntensity),
    ...buildGradientVars(colors),
  } as GlowStyle;

  return (
    <div
      ref={cardRef}
      className={[styles.card, variant === "button" ? styles.button : styles.demandCard, className]
        .filter(Boolean)
        .join(" ")}
      style={style}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <span className={styles.edgeLight} aria-hidden="true" />
      <div className={styles.inner}>{children}</div>
    </div>
  );
}
