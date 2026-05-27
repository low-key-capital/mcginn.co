'use client';

import dynamic from 'next/dynamic';
import { Suspense, useCallback, useEffect, useRef } from 'react';

const Spline = dynamic(() => import('@splinetool/react-spline'), {
  ssr: false,
  loading: () => <div aria-hidden="true" className="h-full w-full" />,
});

/** Subset of the Spline runtime Application we use to pause/resume rendering. */
interface SplineApp {
  play: () => void;
  stop: () => void;
}

const SCENE_URL = 'https://prod.spline.design/ACP80S192fjY66ON/scene.splinecode';

interface FountainArtworkProps {
  /** When true, allow user input (used inside the case study modal). */
  interactive?: boolean;
  /**
   * External destination for taps on the pen. Renders an invisible
   * overlay anchor (opens in a new tab). Matches the text CTA target.
   */
  href?: string;
  /**
   * Fallback to an invisible overlay button that fires onOpen when the
   * entry doesn't have an external href.
   */
  onOpen?: () => void;
}

export function FountainArtwork({
  interactive = false,
  href,
  onOpen,
}: FountainArtworkProps) {
  const figureRef = useRef<HTMLElement>(null);
  const splineRef = useRef<SplineApp | null>(null);
  const visibleRef = useRef(true);

  // Spline runs its own continuous WebGL render loop that doesn't stop when
  // the hero scrolls off-screen — leaving it burning GPU behind every section
  // below and starving the case-study background effects. Pause its render
  // loop (stop/play, no unmount → no scene reload) while it's out of view.
  const handleLoad = useCallback((app: SplineApp) => {
    splineRef.current = app;
    if (!visibleRef.current) app.stop();
  }, []);

  useEffect(() => {
    const el = figureRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      ([entry]) => {
        const visible = entry.isIntersecting;
        visibleRef.current = visible;
        if (visible) splineRef.current?.play();
        else splineRef.current?.stop();
      },
      { rootMargin: '200px 0px 200px 0px', threshold: 0 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <figure ref={figureRef} className="relative w-full h-full overflow-visible m-0">
      <div
        className="absolute inset-0"
        style={{ pointerEvents: interactive ? 'auto' : 'none' }}
      >
        <Suspense fallback={null}>
          <Spline scene={SCENE_URL} onLoad={handleLoad} />
        </Suspense>
      </div>

      {!interactive && href && (
        <a
          href={href}
          target="_blank"
          rel="noopener"
          aria-label="Visit thefountain.ai"
          className="absolute inset-0 z-10 cursor-pointer bg-transparent outline-offset-8"
        />
      )}
      {!interactive && !href && onOpen && (
        <button
          type="button"
          onClick={onOpen}
          aria-label="Open Fountain in 3D"
          className="absolute inset-0 z-10 cursor-pointer bg-transparent border-0 outline-offset-8"
        />
      )}
      <figcaption className="sr-only">
        Fountain — a concept by John McGinn for ambient AI hardware.
      </figcaption>
    </figure>
  );
}
