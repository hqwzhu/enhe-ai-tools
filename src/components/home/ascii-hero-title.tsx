"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import styles from "./ascii-text.module.css";

function StaticTitle({ text }: { text: string }) {
  return (
    <div className={styles.staticOnly}>
      <span className={styles.staticWordmark}>{text}</span>
    </div>
  );
}

const ASCIIText = dynamic(() => import("@/components/home/ascii-text.client"), {
  ssr: false,
  loading: () => <StaticTitle text="ENHE AI" />,
});

type RenderMode = "static" | "tablet" | "desktop";

function supportsWebGL() {
  if (typeof window.WebGLRenderingContext === "undefined") return false;
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
  context?.getExtension("WEBGL_lose_context")?.loseContext();
  return Boolean(context);
}

export function ASCIIHeroTitle({ text }: { text: string }) {
  const [renderMode, setRenderMode] = useState<RenderMode>("static");

  useEffect(() => {
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobileQuery = window.matchMedia("(max-width: 767px)");
    const desktopQuery = window.matchMedia("(min-width: 1024px)");

    function syncRenderMode() {
      if (reducedMotionQuery.matches || mobileQuery.matches || navigator.webdriver || !supportsWebGL()) {
        setRenderMode("static");
        return;
      }
      setRenderMode(desktopQuery.matches ? "desktop" : "tablet");
    }

    syncRenderMode();
    reducedMotionQuery.addEventListener("change", syncRenderMode);
    mobileQuery.addEventListener("change", syncRenderMode);
    desktopQuery.addEventListener("change", syncRenderMode);

    return () => {
      reducedMotionQuery.removeEventListener("change", syncRenderMode);
      mobileQuery.removeEventListener("change", syncRenderMode);
      desktopQuery.removeEventListener("change", syncRenderMode);
    };
  }, []);

  return (
    <div className={styles.heroTitleShell} aria-hidden="true">
      {renderMode === "static" ? (
        <StaticTitle text={text} />
      ) : (
        <div className={styles.interactiveSurface}>
          <ASCIIText
            text="ENHE AI"
            enableWaves
            asciiFontSize={renderMode === "desktop" ? 8 : 7}
            textFontSize={renderMode === "desktop" ? 220 : 180}
            textColor="#ffffff"
            planeBaseHeight={renderMode === "desktop" ? 8 : 7}
          />
        </div>
      )}
    </div>
  );
}
