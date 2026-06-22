"use client";

import { useCallback, useEffect, useRef, useState, type FocusEvent, type KeyboardEvent, type MouseEvent } from "react";
import { PrefetchLink } from "@/components/prefetch-link";
import { cn } from "@/lib/utils";

type HomeGooeyNavItem = {
  href: string;
  label: string;
  tone?: "primary" | "accent";
};

type HomeGooeyNavProps = {
  items: HomeGooeyNavItem[];
  className?: string;
  ariaLabel?: string;
  animationTime?: number;
  particleCount?: number;
  particleDistances?: [number, number];
  particleR?: number;
  timeVariance?: number;
  colors?: number[];
  initialActiveIndex?: number;
};

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

// Adapted from React Bits GooeyNav, licensed MIT + Commons Clause.
export function HomeGooeyNav({
  items,
  className,
  ariaLabel = "Homepage quick links",
  animationTime = 600,
  particleCount = 15,
  particleDistances = [90, 10],
  particleR = 100,
  timeVariance = 300,
  colors = [1, 2, 3, 1, 2, 3, 1, 4],
  initialActiveIndex = 0
}: HomeGooeyNavProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const navRef = useRef<HTMLUListElement | null>(null);
  const filterRef = useRef<HTMLSpanElement | null>(null);
  const textRef = useRef<HTMLSpanElement | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const hasAnimatedRef = useRef(false);
  const reduceMotionRef = useRef(false);
  const [activeIndex, setActiveIndex] = useState(initialActiveIndex);

  const noise = useCallback((n = 1) => n / 2 - Math.random() * n, []);

  const getXY = useCallback(
    (distance: number, pointIndex: number, totalPoints: number): [number, number] => {
      const angle = ((360 + noise(8)) / totalPoints) * pointIndex * (Math.PI / 180);

      return [distance * Math.cos(angle), distance * Math.sin(angle)];
    },
    [noise]
  );

  const createParticle = useCallback(
    (i: number, t: number, d: [number, number], r: number) => {
      const rotate = noise(r / 10);

      return {
        start: getXY(d[0], particleCount - i, particleCount),
        end: getXY(d[1] + noise(7), particleCount - i, particleCount),
        time: t,
        scale: 1 + noise(0.2),
        color: colors[Math.floor(Math.random() * colors.length)],
        rotate: rotate > 0 ? (rotate + r / 20) * 10 : (rotate - r / 20) * 10
      };
    },
    [colors, getXY, noise, particleCount]
  );

  const clearParticleTimers = useCallback(() => {
    timeoutRef.current.forEach((timeout) => clearTimeout(timeout));
    timeoutRef.current = [];
  }, []);

  const clearParticles = useCallback(() => {
    clearParticleTimers();
    filterRef.current?.querySelectorAll(".home-gooey-particle").forEach((particle) => particle.remove());
    filterRef.current?.classList.remove("active");
  }, [clearParticleTimers]);

  const makeParticles = useCallback(
    (element: HTMLElement) => {
      if (reduceMotionRef.current) {
        element.classList.add("active");
        return;
      }

      const bubbleTime = animationTime * 2 + timeVariance;
      element.style.setProperty("--time", `${bubbleTime}ms`);

      for (let i = 0; i < particleCount; i++) {
        const t = animationTime * 2 + noise(timeVariance * 2);
        const particle = createParticle(i, t, particleDistances, particleR);
        element.classList.remove("active");

        const startTimeout = setTimeout(() => {
          const particleEl = document.createElement("span");
          const pointEl = document.createElement("span");

          particleEl.classList.add("particle", "home-gooey-particle");
          particleEl.style.setProperty("--start-x", `${particle.start[0]}px`);
          particleEl.style.setProperty("--start-y", `${particle.start[1]}px`);
          particleEl.style.setProperty("--end-x", `${particle.end[0]}px`);
          particleEl.style.setProperty("--end-y", `${particle.end[1]}px`);
          particleEl.style.setProperty("--time", `${particle.time}ms`);
          particleEl.style.setProperty("--scale", `${particle.scale}`);
          particleEl.style.setProperty("--color", `var(--color-${particle.color}, white)`);
          particleEl.style.setProperty("--rotate", `${particle.rotate}deg`);

          pointEl.classList.add("point", "home-gooey-point");
          particleEl.appendChild(pointEl);
          element.appendChild(particleEl);

          requestAnimationFrame(() => {
            element.classList.add("active");
          });

          const cleanupTimeout = setTimeout(() => {
            particleEl.remove();
          }, t);

          timeoutRef.current.push(cleanupTimeout);
        }, 30);

        timeoutRef.current.push(startTimeout);
      }
    },
    [animationTime, createParticle, noise, particleCount, particleDistances, particleR, timeVariance]
  );

  const updateEffectPosition = useCallback((element: HTMLElement) => {
    if (!containerRef.current || !filterRef.current || !textRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();
    const styles = {
      left: `${elementRect.x - containerRect.x}px`,
      top: `${elementRect.y - containerRect.y}px`,
      width: `${elementRect.width}px`,
      height: `${elementRect.height}px`
    };

    Object.assign(filterRef.current.style, styles);
    Object.assign(textRef.current.style, styles);
    textRef.current.innerText = element.innerText;
  }, []);

  const activateItem = useCallback(
    (element: HTMLElement, index: number) => {
      if (activeIndex === index && hasAnimatedRef.current) return;

      hasAnimatedRef.current = true;
      containerRef.current?.classList.add("is-primed");
      setActiveIndex(index);
      updateEffectPosition(element);
      clearParticles();

      if (textRef.current) {
        textRef.current.classList.remove("active");
        void textRef.current.offsetWidth;
        textRef.current.classList.add("active");
      }

      if (filterRef.current) {
        makeParticles(filterRef.current);
      }
    },
    [activeIndex, clearParticles, makeParticles, updateEffectPosition]
  );

  const handleClick = (event: MouseEvent<HTMLAnchorElement>, index: number) => {
    const listItem = event.currentTarget.parentElement;

    if (listItem) {
      activateItem(listItem, index);
    }
  };

  const handleIntent = (event: MouseEvent<HTMLAnchorElement> | FocusEvent<HTMLAnchorElement>, index: number) => {
    const listItem = event.currentTarget.parentElement;

    if (listItem) {
      activateItem(listItem, index);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLAnchorElement>, index: number) => {
    if (event.key !== "Enter" && event.key !== " ") return;

    const listItem = event.currentTarget.parentElement;

    if (listItem) {
      activateItem(listItem, index);
    }

    if (event.key === " ") {
      event.preventDefault();
      event.currentTarget.click();
    }
  };

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }

    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncReducedMotion = () => {
      reduceMotionRef.current = query.matches;
      containerRef.current?.classList.toggle("is-reduced-motion", query.matches);
    };

    syncReducedMotion();

    return bindMediaChange(query, syncReducedMotion);
  }, []);

  useEffect(() => {
    if (!navRef.current || !containerRef.current) return;

    const activeListItem = navRef.current.querySelectorAll("li")[activeIndex] as HTMLElement | undefined;

    if (activeListItem) {
      updateEffectPosition(activeListItem);
    }

    const resizeObserver = new ResizeObserver(() => {
      const currentActiveListItem = navRef.current?.querySelectorAll("li")[activeIndex] as HTMLElement | undefined;

      if (currentActiveListItem) {
        updateEffectPosition(currentActiveListItem);
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, [activeIndex, updateEffectPosition]);

  useEffect(() => {
    return clearParticleTimers;
  }, [clearParticleTimers]);

  return (
    <div className={cn("home-gooey-nav-container", className)} ref={containerRef}>
      <nav aria-label={ariaLabel} className="home-gooey-nav">
        <ul className="home-gooey-nav-list" ref={navRef}>
          {items.map((item, index) => (
            <li className={cn("home-gooey-nav-item", activeIndex === index && "active")} key={item.href}>
              <PrefetchLink
                className={cn(
                  "cursor-target home-hero-cta backdrop-blur-xl backdrop-saturate-150",
                  item.tone === "accent" ? "home-hero-cta-accent" : "home-hero-cta-primary"
                )}
                href={item.href}
                onClick={(event) => handleClick(event, index)}
                onFocus={(event) => handleIntent(event, index)}
                onKeyDown={(event) => handleKeyDown(event, index)}
                onMouseEnter={(event) => handleIntent(event, index)}
              >
                <span className="relative z-10 inline-flex items-center gap-2">{item.label}</span>
              </PrefetchLink>
            </li>
          ))}
        </ul>
      </nav>
      <span aria-hidden="true" className="home-gooey-effect filter" ref={filterRef} />
      <span aria-hidden="true" className="home-gooey-effect text" ref={textRef} />
    </div>
  );
}
