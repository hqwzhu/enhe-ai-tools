"use client";

import { useEffect, useRef, useState } from "react";

type ProductVideoPlayerProps = {
  src: string;
  title: string;
  fallbackText: string;
  playLabel: string;
};

export function ProductVideoPlayer({
  src,
  title,
  fallbackText,
  playLabel,
}: ProductVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [needsGesture, setNeedsGesture] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let cancelled = false;

    const tryPlay = async () => {
      try {
        video.muted = true;
        if (!video.currentSrc) {
          video.src = src;
          video.load();
        }
        await video.play();
        if (!cancelled) setNeedsGesture(false);
      } catch {
        if (!cancelled) setNeedsGesture(true);
      }
    };

    if (!("IntersectionObserver" in window)) {
      void tryPlay();
      return () => {
        cancelled = true;
      };
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          void tryPlay();
        } else {
          video.pause();
        }
      },
      { threshold: 0.35 },
    );

    observer.observe(video);

    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [src]);

  const handlePlayClick = async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      video.muted = true;
      await video.play();
      setNeedsGesture(false);
    } catch {
      setNeedsGesture(true);
    }
  };

  return (
    <div className="tool-detail-video-stage">
      <video
        ref={videoRef}
        aria-label={title}
        data-src={src}
        className="aspect-video w-full bg-black object-contain"
        autoPlay
        muted
        controls
        playsInline
        preload="none"
      >
        {fallbackText}
      </video>
      {needsGesture ? (
        <button
          type="button"
          className="tool-detail-video-play cursor-target"
          aria-label={playLabel}
          onClick={handlePlayClick}
        >
          {playLabel}
        </button>
      ) : null}
    </div>
  );
}
