"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { useReducedMotion } from "motion/react";

type Point = {
  x: number;
  y: number;
};

type CharMetrics = {
  centers: Point[];
  maxDist: number;
};

type TextPressureProps = {
  text: string;
  fontFamily?: string;
  width?: boolean;
  weight?: boolean;
  italic?: boolean;
  alpha?: boolean;
  flex?: boolean;
  stroke?: boolean;
  scale?: boolean;
  textColor?: string;
  strokeColor?: string;
  className?: string;
  minFontSize?: number;
};

const dist = (a: Point, b: Point) => {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.sqrt(dx * dx + dy * dy);
};

const getAttr = (distance: number, maxDist: number, minVal: number, maxVal: number) => {
  const safeMaxDist = Math.max(maxDist, 1);
  const val = maxVal - Math.abs((maxVal * distance) / safeMaxDist);
  return Math.max(minVal, val + minVal);
};

const debounce = (func: () => void, delay: number) => {
  let timeoutId: ReturnType<typeof setTimeout>;

  return () => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(func, delay);
  };
};

// Adapted from React Bits TextPressure (MIT + Commons Clause).
// The wordmark remains real DOM text for SEO/GEO and accessibility.
export default function TextPressure({
  text,
  fontFamily = "Roboto Flex ENHE",
  width = true,
  weight = true,
  italic = true,
  alpha = false,
  flex = true,
  stroke = false,
  scale = false,
  textColor = "#ffffff",
  strokeColor = "#41c5db",
  className = "",
  minFontSize = 36,
}: TextPressureProps) {
  const shouldReduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLSpanElement | null>(null);
  const titleRef = useRef<HTMLSpanElement | null>(null);
  const spansRef = useRef<(HTMLSpanElement | null)[]>([]);
  const mouseRef = useRef<Point>({ x: 0, y: 0 });
  const cursorRef = useRef<Point>({ x: 0, y: 0 });
  const metricsRef = useRef<CharMetrics>({ centers: [], maxDist: 1 });
  const hasMetricsRef = useRef(false);
  const isVisibleRef = useRef(true);
  const startFrameLoopRef = useRef<(() => void) | null>(null);
  const stopFrameLoopRef = useRef<(() => void) | null>(null);
  const chars = useMemo(() => text.split(""), [text]);
  const [fontSize, setFontSize] = useState(minFontSize);
  const [scaleY, setScaleY] = useState(1);
  const [lineHeight, setLineHeight] = useState(1);

  const measureCharacters = useCallback(() => {
    if (!titleRef.current) return;

    const titleRect = titleRef.current.getBoundingClientRect();
    metricsRef.current = {
      maxDist: Math.max(titleRect.width / 2, 1),
      centers: spansRef.current.map((span) => {
        if (!span) return { x: titleRect.left + titleRect.width / 2, y: titleRect.top + titleRect.height / 2 };

        const rect = span.getBoundingClientRect();
        return {
          x: rect.x + rect.width / 2,
          y: rect.y + rect.height / 2,
        };
      }),
    };
    hasMetricsRef.current = true;
  }, []);

  useEffect(() => {
    if (shouldReduceMotion) return;

    const handleMouseMove = (event: MouseEvent) => {
      cursorRef.current.x = event.clientX;
      cursorRef.current.y = event.clientY;
      startFrameLoopRef.current?.();
    };
    const handleTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0];

      if (!touch) return;
      cursorRef.current.x = touch.clientX;
      cursorRef.current.y = touch.clientY;
      startFrameLoopRef.current?.();
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });

    if (containerRef.current) {
      const { left, top, width: rectWidth, height } = containerRef.current.getBoundingClientRect();
      mouseRef.current.x = left + rectWidth / 2;
      mouseRef.current.y = top + height / 2;
      cursorRef.current.x = mouseRef.current.x;
      cursorRef.current.y = mouseRef.current.y;
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, [shouldReduceMotion]);

  const setSize = useCallback(() => {
    if (!containerRef.current || !titleRef.current) return;

    const { width: containerW, height: containerH } = containerRef.current.getBoundingClientRect();
    const nextFontSize = Math.max(containerW / (chars.length / 2), minFontSize);

    setFontSize(nextFontSize);
    setScaleY(1);
    setLineHeight(1);

    requestAnimationFrame(() => {
      if (!titleRef.current) return;

      const textRect = titleRef.current.getBoundingClientRect();

      if (scale && textRect.height > 0) {
        const yRatio = containerH / textRect.height;
        setScaleY(yRatio);
        setLineHeight(yRatio);
      }

      measureCharacters();
      startFrameLoopRef.current?.();
    });
  }, [chars.length, measureCharacters, minFontSize, scale]);

  useEffect(() => {
    const debouncedSetSize = debounce(setSize, 100);

    debouncedSetSize();
    window.addEventListener("resize", debouncedSetSize);

    return () => window.removeEventListener("resize", debouncedSetSize);
  }, [setSize]);

  useEffect(() => {
    if (shouldReduceMotion) return;

    let rafId: number | null = null;
    let settleFrames = 0;

    const animate = () => {
      rafId = null;

      if (!isVisibleRef.current || document.visibilityState === "hidden") {
        return;
      }

      if (!hasMetricsRef.current) {
        measureCharacters();
      }

      mouseRef.current.x += (cursorRef.current.x - mouseRef.current.x) / 15;
      mouseRef.current.y += (cursorRef.current.y - mouseRef.current.y) / 15;

      const metrics = metricsRef.current;
      if (metrics.centers.length > 0) {
        spansRef.current.forEach((span, index) => {
          if (!span) return;

          const charCenter = metrics.centers[index] ?? metrics.centers[0];
          const distance = dist(mouseRef.current, charCenter);
          const wdth = width ? Math.floor(getAttr(distance, metrics.maxDist, 5, 200)) : 100;
          const wght = weight ? Math.floor(getAttr(distance, metrics.maxDist, 100, 900)) : 400;
          const italVal = italic ? getAttr(distance, metrics.maxDist, 0, 1).toFixed(2) : "0";
          const alphaVal = alpha ? getAttr(distance, metrics.maxDist, 0, 1).toFixed(2) : "1";
          const newFontVariationSettings = `'wght' ${wght}, 'wdth' ${wdth}, 'ital' ${italVal}`;

          if (span.style.fontVariationSettings !== newFontVariationSettings) {
            span.style.fontVariationSettings = newFontVariationSettings;
          }

          if (alpha && span.style.opacity !== alphaVal) {
            span.style.opacity = alphaVal;
          }
        });
      }

      const cursorDelta = dist(mouseRef.current, cursorRef.current);
      if (cursorDelta > 0.2) {
        settleFrames = 0;
      } else {
        settleFrames += 1;
      }

      if (settleFrames < 3) {
        rafId = requestAnimationFrame(animate);
      }
    };

    const startFrameLoop = () => {
      if (rafId !== null || !isVisibleRef.current || document.visibilityState === "hidden") return;
      settleFrames = 0;
      rafId = requestAnimationFrame(animate);
    };

    const stopFrameLoop = () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        stopFrameLoop();
      } else if (isVisibleRef.current) {
        startFrameLoop();
      }
    };

    startFrameLoopRef.current = startFrameLoop;
    stopFrameLoopRef.current = stopFrameLoop;
    document.addEventListener("visibilitychange", handleVisibilityChange);
    startFrameLoop();

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      startFrameLoopRef.current = null;
      stopFrameLoopRef.current = null;
      stopFrameLoop();
    };
  }, [alpha, italic, measureCharacters, shouldReduceMotion, weight, width]);

  useEffect(() => {
    if (shouldReduceMotion || typeof IntersectionObserver === "undefined") return;

    const current = containerRef.current;
    if (!current) return;

    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      isVisibleRef.current = entry ? entry.isIntersecting : true;

      if (isVisibleRef.current) {
        measureCharacters();
        startFrameLoopRef.current?.();
      } else {
        stopFrameLoopRef.current?.();
      }
    });

    observer.observe(current);

    return () => observer.disconnect();
  }, [measureCharacters, shouldReduceMotion]);

  const dynamicClassName = [
    "text-pressure-title",
    flex ? "text-pressure-flex" : "",
    stroke ? "text-pressure-stroke" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span
      ref={containerRef}
      className="text-pressure-container"
      style={
        {
          "--text-pressure-color": textColor,
          "--text-pressure-stroke-color": strokeColor,
        } as CSSProperties
      }
    >
      <span
        ref={titleRef}
        className={dynamicClassName}
        style={{
          fontFamily,
          fontSize,
          lineHeight,
          transform: `scale(1, ${scaleY})`,
          transformOrigin: "center top",
        }}
      >
        {chars.map((char, index) => (
          <span
            key={`${char}-${index}`}
            ref={(el) => {
              spansRef.current[index] = el;
            }}
            data-char={char}
            data-space={char === " " ? "true" : undefined}
            style={{
              fontVariationSettings: shouldReduceMotion ? "'wght' 900, 'wdth' 110, 'ital' 0" : undefined,
            }}
          >
            {char === " " ? "\u00a0" : char}
          </span>
        ))}
      </span>
    </span>
  );
}
