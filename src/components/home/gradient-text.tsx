"use client";

import { useRef, type ReactNode } from "react";
import { motion, useAnimationFrame, useMotionValue, useTransform } from "motion/react";
import styles from "./gradient-text.module.css";

// Adapted from React Bits GradientText for the existing motion/react stack.
type GradientDirection = "horizontal" | "vertical";

interface GradientTextProps {
  children: ReactNode;
  colors: string[];
  animationSpeed?: number;
  direction?: GradientDirection;
  pauseOnHover?: boolean;
  yoyo?: boolean;
  showBorder?: boolean;
  className?: string;
}

export default function GradientText({
  children,
  colors,
  animationSpeed = 8,
  direction = "horizontal",
  pauseOnHover = false,
  yoyo = false,
  showBorder = false,
  className = ""
}: GradientTextProps) {
  const progress = useMotionValue(0);
  const isHovered = useRef(false);
  const cycleLength = yoyo ? 200 : 100;
  const cycleDuration = Math.max(animationSpeed, 0.1) * 1000;

  useAnimationFrame((_time, delta) => {
    if (pauseOnHover && isHovered.current) return;

    const nextProgress = progress.get() + (delta / cycleDuration) * 100;
    progress.set(nextProgress % cycleLength);
  });

  const backgroundPosition = useTransform(progress, (value) => {
    const offset = yoyo ? 100 - Math.abs(100 - value) : value;
    return direction === "horizontal" ? `${offset}% 50%` : `50% ${offset}%`;
  });
  const gradientDirection = direction === "horizontal" ? "to right" : "to bottom";
  const backgroundImage = `linear-gradient(${gradientDirection}, ${colors.join(", ")})`;
  const backgroundSize = direction === "horizontal" ? "200% 100%" : "100% 200%";
  const rootClassName = [styles.root, className].filter(Boolean).join(" ");

  return (
    <motion.span
      className={rootClassName}
      onPointerEnter={() => {
        isHovered.current = true;
      }}
      onPointerLeave={() => {
        isHovered.current = false;
      }}
    >
      {showBorder ? (
        <motion.span
          aria-hidden="true"
          className={styles.border}
          style={{ backgroundImage, backgroundPosition, backgroundSize }}
        />
      ) : null}
      <motion.span
        className={`${styles.textContent} gradient-text-content`}
        style={{ backgroundImage, backgroundPosition, backgroundSize }}
      >
        {children}
      </motion.span>
    </motion.span>
  );
}
