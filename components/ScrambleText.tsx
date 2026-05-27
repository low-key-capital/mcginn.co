'use client';

import { createElement, useEffect, useRef, useState, type CSSProperties, type ElementType } from 'react';

const BLOCK_CHARS = '█▓▒░';
const FRAME_INTERVAL_MS = 32;
const SETTLE_BASE_MS = 90;
const SETTLE_STAGGER_MS = 28;

interface ScrambleTextProps {
  text: string;
  /**
   * When this flips true the scramble→settle plays once. Wire it to the
   * section's existing `useInView` so the decode syncs with the fade-in.
   */
  active: boolean;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
  /** Delay (ms) before the settle clock starts — sequences label before title. */
  delay?: number;
  /** Per-character settle stagger (ms). */
  stagger?: number;
}

interface Cell {
  char: string;
  settled: boolean;
}

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Renders `text` that decodes out of random block glyphs (█▓▒░), the same
 * effect as the top-right working statement. The settled real text is the
 * default render, so SSR, no-JS, and reduced-motion all show the real text;
 * the animation is a client-side enhancement. Glyphs are aria-hidden and the
 * real text is exposed via `aria-label`, so assistive tech is unaffected.
 */
export function ScrambleText({
  text,
  active,
  as,
  className = '',
  style,
  delay = 0,
  stagger = SETTLE_STAGGER_MS,
}: ScrambleTextProps) {
  const Tag = (as ?? 'span') as ElementType;
  const [cells, setCells] = useState<Cell[]>(() =>
    text.split('').map((c) => ({ char: c, settled: true }))
  );
  const started = useRef(false);

  useEffect(() => {
    if (!active || started.current) return;
    started.current = true;
    if (prefersReducedMotion()) return; // leave the real, settled text in place

    let cancelled = false;
    let raf = 0;
    let lastFrame = 0;
    let start = 0;
    const chars = text.split('');
    const scramble = () => BLOCK_CHARS[Math.floor(Math.random() * BLOCK_CHARS.length)];

    // Seed an all-scrambled frame immediately so the real text never flashes.
    setCells(
      chars.map((ch) =>
        ch === ' ' ? { char: ' ', settled: true } : { char: scramble(), settled: false }
      )
    );

    const tick = (now: number) => {
      if (cancelled) return;
      if (!start) start = now;
      if (now - lastFrame < FRAME_INTERVAL_MS) {
        raf = requestAnimationFrame(tick);
        return;
      }
      lastFrame = now;

      const elapsed = now - start;
      let allSettled = true;
      const next = chars.map((ch, i) => {
        // Spaces read better unglitched.
        if (ch === ' ') return { char: ' ', settled: true };
        const settleAt = delay + SETTLE_BASE_MS + i * stagger;
        if (elapsed >= settleAt) return { char: ch, settled: true };
        allSettled = false;
        return { char: scramble(), settled: false };
      });
      setCells(next);
      if (!allSettled) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [active, text, delay, stagger]);

  // The visible (aria-hidden) scrambling glyphs.
  const glyphs = (
    <span aria-hidden="true">
      {cells.map((cell, i) => (
        <span
          key={i}
          style={{
            opacity: cell.settled ? 1 : 0.5,
            transition: 'opacity 220ms cubic-bezier(0.22, 1, 0.36, 1)',
            // Block glyphs (█▓▒░) only render solid in a monospace face;
            // display/proportional fonts fall back to halftone tofu. Render
            // unsettled glyphs in mono, then hand back to the inherited
            // (display) font as each character settles into its real letter.
            fontFamily: cell.settled
              ? undefined
              : "ui-monospace, SFMono-Regular, Menlo, 'Liberation Mono', monospace",
          }}
        >
          {cell.char}
        </span>
      ))}
    </span>
  );

  // `createElement` (rather than a dynamic <Tag> in JSX) keeps TypeScript from
  // resolving the element's children to `never` — a side effect of the global
  // JSX augmentation that @react-three/fiber brings in for the Beams effect.
  return createElement(Tag, { className, style, 'aria-label': text }, glyphs);
}
