"use client";

import Image from "next/image";
import {
  type TouchEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

const HERO_ALT = "Кольцо из серебра 925";

const HERO_VIDEOS = [
  "/images/video-hero_2.mp4",
  "/images/braslet_video_3.mp4",
  "/images/braslet_video_6.mp4",
  "/images/braslet_video_7.mp4",
] as const;

/** Hard fallback if ended/timeupdate never fire on iOS. */
const FALLBACK_ADVANCE_MS = 12_000;
const SWITCH_LOCK_MS = 2500;

type Slot = "a" | "b";

function prepareVideo(video: HTMLVideoElement) {
  video.muted = true;
  video.defaultMuted = true;
  video.playsInline = true;
  video.setAttribute("playsinline", "");
  video.setAttribute("webkit-playsinline", "");
  video.setAttribute("muted", "");
}

function waitForCanPlay(video: HTMLVideoElement, timeoutMs = 5000): Promise<void> {
  if (video.readyState >= 2) return Promise.resolve();

  return new Promise((resolve) => {
    let settled = false;
    const done = () => {
      if (settled) return;
      settled = true;
      video.removeEventListener("loadeddata", done);
      video.removeEventListener("canplay", done);
      resolve();
    };
    video.addEventListener("loadeddata", done);
    video.addEventListener("canplay", done);
    window.setTimeout(done, timeoutMs);
  });
}

async function playSafely(video: HTMLVideoElement) {
  prepareVideo(video);
  try {
    await video.play();
  } catch {
    // Autoplay can fail until user gesture.
  }
}

export function HeroMedia() {
  const [hydrated, setHydrated] = useState(false);
  const [activeSlot, setActiveSlot] = useState<Slot>("a");
  const [index, setIndex] = useState(0);

  const videoARef = useRef<HTMLVideoElement>(null);
  const videoBRef = useRef<HTMLVideoElement>(null);
  const indexRef = useRef(0);
  const activeSlotRef = useRef<Slot>("a");
  const switchingRef = useRef(false);
  const fallbackTimerRef = useRef(0);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const getVideo = useCallback((slot: Slot) => {
    return slot === "a" ? videoARef.current : videoBRef.current;
  }, []);

  const clearFallbackTimer = useCallback(() => {
    if (fallbackTimerRef.current) {
      window.clearTimeout(fallbackTimerRef.current);
      fallbackTimerRef.current = 0;
    }
  }, []);

  const loadSrc = useCallback(async (video: HTMLVideoElement, src: string) => {
    prepareVideo(video);
    video.preload = "auto";

    const current = video.getAttribute("src") || "";
    if (current !== src && !video.currentSrc.endsWith(src)) {
      video.src = src;
      video.load();
    }

    await waitForCanPlay(video);

    try {
      if (!video.paused) video.pause();
    } catch {
      // ignore
    }

    // Seeking is flaky on iOS — never block the carousel on it.
    try {
      if (Number.isFinite(video.duration) && video.currentTime > 0.05) {
        video.currentTime = 0;
      }
    } catch {
      // ignore
    }
  }, []);

  const scheduleFallback = useCallback(
    (fromIndex: number, durationMs?: number) => {
      clearFallbackTimer();
      const delay = Math.max(
        4000,
        Math.min(
          FALLBACK_ADVANCE_MS,
          Number.isFinite(durationMs) && (durationMs ?? 0) > 0
            ? Math.round((durationMs as number) * 1000) - 200
            : FALLBACK_ADVANCE_MS,
        ),
      );
      fallbackTimerRef.current = window.setTimeout(() => {
        if (indexRef.current !== fromIndex) return;
        void switchToIndexRef.current(fromIndex + 1);
      }, delay);
    },
    [clearFallbackTimer],
  );

  const switchToIndexRef = useRef<(nextIndex: number) => Promise<void>>(
    async () => undefined,
  );

  const switchToIndex = useCallback(
    async (nextIndex: number) => {
      if (switchingRef.current) return;

      const length = HERO_VIDEOS.length;
      const normalized = ((nextIndex % length) + length) % length;
      if (normalized === indexRef.current && hydrated) return;

      const active = activeSlotRef.current;
      const inactive: Slot = active === "a" ? "b" : "a";
      const nextSrc = HERO_VIDEOS[normalized];
      const inactiveVideo = getVideo(inactive);
      const activeVideo = getVideo(active);
      if (!inactiveVideo || !activeVideo) return;

      switchingRef.current = true;
      const unlock = window.setTimeout(() => {
        switchingRef.current = false;
      }, SWITCH_LOCK_MS);

      try {
        await loadSrc(inactiveVideo, nextSrc);
        await playSafely(inactiveVideo);

        activeSlotRef.current = inactive;
        indexRef.current = normalized;
        setActiveSlot(inactive);
        setIndex(normalized);

        window.setTimeout(() => {
          try {
            activeVideo.pause();
          } catch {
            // ignore
          }
        }, 80);

        const duration = inactiveVideo.duration;
        scheduleFallback(
          normalized,
          Number.isFinite(duration) ? duration : undefined,
        );
      } finally {
        window.clearTimeout(unlock);
        switchingRef.current = false;
      }
    },
    [getVideo, hydrated, loadSrc, scheduleFallback],
  );

  switchToIndexRef.current = switchToIndex;

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    let cancelled = false;

    const boot = async () => {
      const first = getVideo("a");
      if (!first) return;

      await loadSrc(first, HERO_VIDEOS[0]);
      if (cancelled) return;
      await playSafely(first);
      if (cancelled) return;

      // Warm next clip in background (non-blocking).
      const next = getVideo("b");
      if (next) void loadSrc(next, HERO_VIDEOS[1 % HERO_VIDEOS.length]);

      scheduleFallback(0, first.duration);
    };

    void boot();

    const onVisible = () => {
      if (document.hidden) return;
      const current = getVideo(activeSlotRef.current);
      if (current) void playSafely(current);
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      clearFallbackTimer();
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [clearFallbackTimer, getVideo, hydrated, loadSrc, scheduleFallback]);

  useEffect(() => {
    if (!hydrated) return;
    const activeVideo = getVideo(activeSlot);
    if (!activeVideo) return;

    const onTimeUpdate = () => {
      const { duration, currentTime, paused } = activeVideo;
      if (paused || !Number.isFinite(duration) || duration <= 0) return;
      if (duration - currentTime > 0.25) return;
      void switchToIndex(indexRef.current + 1);
    };

    const onEnded = () => {
      void switchToIndex(indexRef.current + 1);
    };

    const onLoadedMetadata = () => {
      scheduleFallback(indexRef.current, activeVideo.duration);
    };

    activeVideo.addEventListener("timeupdate", onTimeUpdate);
    activeVideo.addEventListener("ended", onEnded);
    activeVideo.addEventListener("loadedmetadata", onLoadedMetadata);

    return () => {
      activeVideo.removeEventListener("timeupdate", onTimeUpdate);
      activeVideo.removeEventListener("ended", onEnded);
      activeVideo.removeEventListener("loadedmetadata", onLoadedMetadata);
    };
  }, [activeSlot, getVideo, hydrated, scheduleFallback, switchToIndex]);

  const goTo = useCallback(
    (next: number) => {
      void switchToIndex(next);
    },
    [switchToIndex],
  );

  const goNext = useCallback(() => {
    void switchToIndex(indexRef.current + 1);
  }, [switchToIndex]);

  const goPrev = useCallback(() => {
    void switchToIndex(indexRef.current - 1);
  }, [switchToIndex]);

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    const touch = event.touches[0];
    if (!touch) return;
    touchStart.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    if (!touchStart.current) return;
    const touch = event.changedTouches[0];
    if (!touch) return;

    const deltaX = touch.clientX - touchStart.current.x;
    const deltaY = touch.clientY - touchStart.current.y;
    touchStart.current = null;

    if (Math.abs(deltaX) < 40 || Math.abs(deltaX) < Math.abs(deltaY)) return;

    if (deltaX < 0) goNext();
    else goPrev();
  };

  const videoClassName =
    "absolute inset-0 h-full w-full object-cover object-center lg:object-cover lg:object-top bg-transparent";

  return (
    <div
      className="absolute inset-0 bg-black"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <Image
        src="/images/hero-poster.webp"
        alt={HERO_ALT}
        fill
        priority
        fetchPriority="high"
        sizes="(max-width: 1023px) 100vw, 512px"
        className="object-cover object-center lg:object-cover lg:object-top"
      />

      {hydrated ? (
        <>
          <video
            ref={videoARef}
            muted
            playsInline
            preload="auto"
            disablePictureInPicture
            className={`${videoClassName} ${
              activeSlot === "a" ? "z-[2]" : "z-[1]"
            }`}
            aria-label={activeSlot === "a" ? HERO_ALT : undefined}
            aria-hidden={activeSlot !== "a"}
          />
          <video
            ref={videoBRef}
            muted
            playsInline
            preload="auto"
            disablePictureInPicture
            className={`${videoClassName} ${
              activeSlot === "b" ? "z-[2]" : "z-[1]"
            }`}
            aria-label={activeSlot === "b" ? HERO_ALT : undefined}
            aria-hidden={activeSlot !== "b"}
          />
        </>
      ) : null}

      <div
        className="pointer-events-none absolute inset-x-0 bottom-3 z-10 flex items-center justify-center gap-2 lg:bottom-4"
        role="tablist"
        aria-label="Видео в карусели"
      >
        {HERO_VIDEOS.map((src, i) => {
          const isActive = i === index;
          return (
            <button
              key={src}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-label={`Видео ${i + 1}`}
              onClick={() => goTo(i)}
              className={`pointer-events-auto h-2.5 min-w-[10px] touch-manipulation rounded-full transition-all [-webkit-tap-highlight-color:transparent] ${
                isActive
                  ? "w-6 bg-white shadow-sm"
                  : "w-2.5 bg-white/55 hover:bg-white/80"
              }`}
            />
          );
        })}
      </div>

      <button
        type="button"
        aria-label="Предыдущее видео"
        onClick={goPrev}
        className="absolute left-2 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 touch-manipulation items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-sm transition-colors hover:bg-black/50 [-webkit-tap-highlight-color:transparent] lg:flex"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M15 18 9 12l6-6"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <button
        type="button"
        aria-label="Следующее видео"
        onClick={goNext}
        className="absolute right-2 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 touch-manipulation items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-sm transition-colors hover:bg-black/50 [-webkit-tap-highlight-color:transparent] lg:flex"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="m9 18 6-6-6-6"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}
