"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
} from "react";
import { gsap } from "gsap";
import styles from "./flowing-menu.module.css";

export interface FlowingMenuItem {
  id: "productivity" | "content-creation" | "ai-learning" | "ai-news";
  link: string;
  text: string;
  image: string;
  imageAlt: string;
}

interface FlowingMenuProps {
  items: FlowingMenuItem[];
  ariaLabel: string;
  speed?: number;
  textColor?: string;
  bgColor?: string;
  marqueeBgColor?: string;
  marqueeTextColor?: string;
  borderColor?: string;
}

interface MenuItemProps extends FlowingMenuItem {
  animationsEnabled: boolean;
  speed: number;
}

type Edge = "top" | "bottom";

type FlowingMenuStyle = CSSProperties & {
  "--enhe-flowing-bg": string;
  "--enhe-flowing-border": string;
  "--enhe-flowing-marquee-bg": string;
  "--enhe-flowing-marquee-text": string;
  "--enhe-flowing-text": string;
};

function getClosestEdge(
  event: MouseEvent<HTMLAnchorElement>,
  element: HTMLElement,
): Edge {
  const rect = element.getBoundingClientRect();
  const y = event.clientY - rect.top;
  return y < rect.height / 2 ? "top" : "bottom";
}

function FlowingMenuRow({
  link,
  text,
  image,
  imageAlt,
  animationsEnabled,
  speed,
}: MenuItemProps) {
  const itemRef = useRef<HTMLLIElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);
  const marqueeInnerRef = useRef<HTMLDivElement>(null);
  const firstPartRef = useRef<HTMLDivElement>(null);
  const loopTweenRef = useRef<gsap.core.Tween | null>(null);
  const revealTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const isOpenRef = useRef(false);
  const [repetitions, setRepetitions] = useState(4);

  const setMarqueeVisibility = useCallback(
    (visible: boolean, edge: Edge) => {
      if (!animationsEnabled) return;

      const marquee = marqueeRef.current;
      const marqueeInner = marqueeInnerRef.current;
      if (!marquee || !marqueeInner) return;

      isOpenRef.current = visible;
      revealTimelineRef.current?.kill();
      gsap.killTweensOf([marquee, marqueeInner], "y");

      const marqueeOffset = edge === "top" ? "-101%" : "101%";
      const innerOffset = edge === "top" ? "101%" : "-101%";

      if (visible) {
        loopTweenRef.current?.play();
        revealTimelineRef.current = gsap
          .timeline({ defaults: { duration: 0.6, ease: "expo.out" } })
          .set(marquee, { y: marqueeOffset })
          .set(marqueeInner, { y: innerOffset })
          .to([marquee, marqueeInner], { y: "0%" }, 0);
        return;
      }

      revealTimelineRef.current = gsap
        .timeline({
          defaults: { duration: 0.6, ease: "expo.inOut" },
          onComplete: () => loopTweenRef.current?.pause(),
        })
        .to(marquee, { y: marqueeOffset }, 0)
        .to(marqueeInner, { y: innerOffset }, 0);
    },
    [animationsEnabled],
  );

  useEffect(() => {
    const item = itemRef.current;
    const firstPart = firstPartRef.current;
    if (!item || !firstPart) return;

    const updateRepetitions = () => {
      const partWidth = firstPart.getBoundingClientRect().width;
      if (!partWidth) return;
      setRepetitions(Math.max(4, Math.ceil(item.clientWidth / partWidth) + 2));
    };

    updateRepetitions();

    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(updateRepetitions);
      observer.observe(item);
      observer.observe(firstPart);
      return () => observer.disconnect();
    }

    window.addEventListener("resize", updateRepetitions);
    return () => window.removeEventListener("resize", updateRepetitions);
  }, [image, text]);

  useEffect(() => {
    const marquee = marqueeRef.current;
    const marqueeInner = marqueeInnerRef.current;
    const firstPart = firstPartRef.current;

    loopTweenRef.current?.kill();
    revealTimelineRef.current?.kill();

    if (!animationsEnabled || !marquee || !marqueeInner || !firstPart) {
      if (marquee && marqueeInner) {
        gsap.set([marquee, marqueeInner], { clearProps: "transform" });
      }
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      const partWidth = firstPart.getBoundingClientRect().width;
      if (!partWidth) return;

      gsap.set(marqueeInner, { x: 0 });
      loopTweenRef.current = gsap.to(marqueeInner, {
        x: -partWidth,
        duration: speed,
        ease: "none",
        paused: !isOpenRef.current,
        repeat: -1,
      });
    });

    return () => {
      window.cancelAnimationFrame(frame);
      loopTweenRef.current?.kill();
      revealTimelineRef.current?.kill();
      gsap.killTweensOf([marquee, marqueeInner]);
    };
  }, [animationsEnabled, image, repetitions, speed, text]);

  useEffect(
    () => () => {
      loopTweenRef.current?.kill();
      revealTimelineRef.current?.kill();
    },
    [],
  );

  return (
    <li className={styles["enhe-flowing-menu__item"]} ref={itemRef}>
      <Link
        href={link}
        className={styles["enhe-flowing-menu__link"]}
        onMouseEnter={(event) =>
          setMarqueeVisibility(true, getClosestEdge(event, itemRef.current ?? event.currentTarget))
        }
        onMouseLeave={(event) =>
          setMarqueeVisibility(false, getClosestEdge(event, itemRef.current ?? event.currentTarget))
        }
        onFocus={() => setMarqueeVisibility(true, "bottom")}
        onBlur={() => setMarqueeVisibility(false, "bottom")}
      >
        <span>{text}</span>
        <span className={styles["enhe-flowing-menu__static-image"]}>
          <Image src={image} alt={imageAlt} fill sizes="(max-width: 640px) 92px, 160px" />
        </span>
      </Link>

      <div className={styles["enhe-flowing-menu__marquee"]} ref={marqueeRef} aria-hidden="true">
        <div className={styles["enhe-flowing-menu__marquee-viewport"]}>
          <div className={styles["enhe-flowing-menu__marquee-inner"]} ref={marqueeInnerRef}>
            {Array.from({ length: repetitions }, (_, index) => (
              <div
                className={styles["enhe-flowing-menu__part"]}
                key={`${text}-${index}`}
                ref={index === 0 ? firstPartRef : undefined}
              >
                <span className={styles["enhe-flowing-menu__marquee-text"]}>{text}</span>
                <span
                  className={styles["enhe-flowing-menu__image"]}
                  style={{ backgroundImage: `url(${image})` }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </li>
  );
}

export default function FlowingMenu({
  items,
  ariaLabel,
  speed = 16,
  textColor = "#f7fbff",
  bgColor = "#0b1720",
  marqueeBgColor = "#56bfd0",
  marqueeTextColor = "#07131a",
  borderColor = "rgba(86, 191, 208, 0.28)",
}: FlowingMenuProps) {
  const [animationsEnabled, setAnimationsEnabled] = useState(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const updateAnimationMode = () =>
      setAnimationsEnabled(finePointer.matches && !reducedMotion.matches);

    updateAnimationMode();
    reducedMotion.addEventListener("change", updateAnimationMode);
    finePointer.addEventListener("change", updateAnimationMode);

    return () => {
      reducedMotion.removeEventListener("change", updateAnimationMode);
      finePointer.removeEventListener("change", updateAnimationMode);
    };
  }, []);

  const style: FlowingMenuStyle = {
    "--enhe-flowing-bg": bgColor,
    "--enhe-flowing-border": borderColor,
    "--enhe-flowing-marquee-bg": marqueeBgColor,
    "--enhe-flowing-marquee-text": marqueeTextColor,
    "--enhe-flowing-text": textColor,
  };

  return (
    <div className={styles["enhe-flowing-menu"]} style={style}>
      <nav className={styles["enhe-flowing-menu__nav"]} aria-label={ariaLabel}>
        <ul className={styles["enhe-flowing-menu__list"]}>
          {items.map((item) => (
            <FlowingMenuRow
              key={item.id}
              {...item}
              animationsEnabled={animationsEnabled}
              speed={speed}
            />
          ))}
        </ul>
      </nav>
    </div>
  );
}
