"use client";

import { useEffect, useRef, useState } from "react";

type FullscreenElement = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void> | void;
};
type FullscreenDocument = Document & {
  webkitFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void> | void;
};

export default function GamePlayer({
  src,
  title,
}: {
  src: string;
  title: string;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const onChange = () => {
      const doc = document as FullscreenDocument;
      setIsFullscreen(
        Boolean(doc.fullscreenElement || doc.webkitFullscreenElement)
      );
    };
    document.addEventListener("fullscreenchange", onChange);
    document.addEventListener("webkitfullscreenchange", onChange);
    return () => {
      document.removeEventListener("fullscreenchange", onChange);
      document.removeEventListener("webkitfullscreenchange", onChange);
    };
  }, []);

  const toggleFullscreen = () => {
    const doc = document as FullscreenDocument;
    if (doc.fullscreenElement || doc.webkitFullscreenElement) {
      (doc.exitFullscreen || doc.webkitExitFullscreen)?.call(doc);
      return;
    }
    const el = wrapperRef.current as FullscreenElement | null;
    if (!el) return;
    (el.requestFullscreen || el.webkitRequestFullscreen)?.call(el);
  };

  return (
    <div
      ref={wrapperRef}
      className="game-player group relative overflow-hidden rounded-2xl border border-border bg-panel"
    >
      <iframe
        src={src}
        title={title}
        className="h-[calc(100dvh-7.5rem)] min-h-[560px] w-full"
        allow="fullscreen; gamepad; autoplay"
      />

      <button
        onClick={toggleFullscreen}
        aria-label={isFullscreen ? "Keluar fullscreen" : "Fullscreen"}
        className="absolute right-3 top-3 flex items-center gap-1.5 rounded-lg border border-border bg-bg/80 px-3 py-1.5 text-sm text-ink-dim backdrop-blur transition hover:border-brand hover:text-ink"
      >
        {isFullscreen ? (
          <>
            <span className="text-base leading-none">✕</span> Keluar
          </>
        ) : (
          <>
            <span className="text-base leading-none">⛶</span> Fullscreen
          </>
        )}
      </button>
    </div>
  );
}
