'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

const BLOCKS = '█▓▒░';
const COLS = 42;
const REVEAL_FADE_MS = 520;
const REVEAL_STAGGER_MS = 1200;

interface GlitchRedactedProps {
  /** Stable seed (e.g. slug) — selects the silhouette and seeds randomness. */
  seed: string;
  className?: string;
}

type Mask = boolean[][];

/**
 * A shape can be returned as a raw mask, or wrapped in ShapeResult to add:
 *  - `delayOffset`: extra reveal/disperse delay per cell, used to sequence
 *    sub-parts of a composite shape (e.g. Elevar's trend line appears after
 *    its bars).
 *  - `shimmerMode`: 'standard' cycles glyphs and opacities randomly per cell;
 *    'glisten' keeps the random glyph shimmer but drives opacity from a
 *    CSS keyframe with a diagonal per-cell delay, producing a slow wave
 *    of brightness moving across the shape.
 */
interface ShapeResult {
  mask: Mask;
  delayOffset?: number[][];
  shimmerMode?: 'standard' | 'glisten';
}

type ShapeFn = () => Mask | ShapeResult;

function isShapeResult(v: Mask | ShapeResult): v is ShapeResult {
  return !Array.isArray(v);
}

// ---------- drawing primitives ----------

function makeGrid(rows: number, cols: number): Mask {
  return Array.from({ length: rows }, () => new Array<boolean>(cols).fill(false));
}

function makeNumberGrid(rows: number, cols: number): number[][] {
  return Array.from({ length: rows }, () => new Array<number>(cols).fill(0));
}

function plot(m: Mask, c: number, r: number) {
  if (r < 0 || r >= m.length || c < 0 || c >= m[0].length) return;
  m[r][c] = true;
}

function drawLine(m: Mask, c0: number, r0: number, c1: number, r1: number) {
  const dc = Math.abs(c1 - c0);
  const dr = Math.abs(r1 - r0);
  const sc = c0 < c1 ? 1 : -1;
  const sr = r0 < r1 ? 1 : -1;
  let err = dc - dr;
  let c = c0;
  let r = r0;
  for (let i = 0; i < 500; i++) {
    plot(m, c, r);
    if (c === c1 && r === r1) break;
    const e2 = 2 * err;
    if (e2 > -dr) { err -= dr; c += sc; }
    if (e2 < dc) { err += dc; r += sr; }
  }
}

function drawRect(m: Mask, c: number, r: number, w: number, h: number) {
  for (let i = 0; i < w; i++) { plot(m, c + i, r); plot(m, c + i, r + h - 1); }
  for (let i = 0; i < h; i++) { plot(m, c, r + i); plot(m, c + w - 1, r + i); }
}

function fillRect(m: Mask, c: number, r: number, w: number, h: number) {
  for (let dr = 0; dr < h; dr++) {
    for (let dc = 0; dc < w; dc++) plot(m, c + dc, r + dr);
  }
}

function drawCircle(m: Mask, cx: number, cy: number, radius: number, filled = false) {
  for (let r = 0; r < m.length; r++) {
    for (let c = 0; c < m[0].length; c++) {
      const dx = c - cx;
      const dy = (r - cy) * 2;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (filled ? d <= radius : Math.abs(d - radius) < 0.8) m[r][c] = true;
    }
  }
}

function drawHeart(m: Mask, cx: number, cy: number, scale: number) {
  // Standard 2D heart curve: (x²+y²-1)³ - x²y³ ≤ 0
  for (let r = 0; r < m.length; r++) {
    for (let c = 0; c < m[0].length; c++) {
      const x = (c - cx) / (scale * 3.4);
      const y = -((r - cy) + 0.5) / (scale * 1.8);
      const v = Math.pow(x * x + y * y - 1, 3) - x * x * y * y * y;
      if (v <= 0) m[r][c] = true;
    }
  }
}

function drawWavy(
  m: Mask,
  c0: number,
  c1: number,
  r: number,
  amp: number,
  freq: number,
  phase: number,
) {
  for (let c = c0; c <= c1; c++) {
    const off = amp * Math.sin(freq * (c - c0) + phase);
    plot(m, c, Math.round(r + off));
  }
}

// ---------- per-slug compositions ----------

function envelope(): Mask {
  const m = makeGrid(11, COLS);
  drawRect(m, 3, 1, 36, 9);
  drawLine(m, 3, 1, 20, 6);
  drawLine(m, 38, 1, 20, 6);
  return m;
}

function slackMessages(): Mask {
  const m = makeGrid(12, COLS);
  fillRect(m, 2, 1, 4, 2); fillRect(m, 8, 1, 12, 2);
  fillRect(m, 2, 5, 4, 2); fillRect(m, 8, 5, 22, 2);
  fillRect(m, 2, 9, 4, 2); fillRect(m, 8, 9, 30, 2);
  return m;
}

function funnelStaged(): Mask {
  // A single tapered funnel divided into three stages by horizontal lines.
  // Walls go from a wide top (cols 4–37) to a narrow bottom (cols 14–27)
  // over rows 2–11; dividers sit at rows 5 and 8.
  const m = makeGrid(13, COLS);
  const drops: Array<[number, number]> = [
    [10, 0], [16, 0], [22, 0], [28, 0], [32, 0],
    [13, 1], [19, 1], [25, 1], [29, 1],
  ];
  drops.forEach(([c, r]) => plot(m, c, r));

  // Top rim
  for (let c = 4; c <= 37; c++) plot(m, c, 2);
  // Tapering walls
  drawLine(m, 4, 2, 14, 11);
  drawLine(m, 37, 2, 27, 11);
  // Stage dividers (interior horizontal lines that sit between the walls)
  for (let c = 8; c <= 33; c++) plot(m, c, 5);
  for (let c = 11; c <= 30; c++) plot(m, c, 8);
  // Narrow bottom edge
  for (let c = 14; c <= 27; c++) plot(m, c, 11);
  return m;
}

function elevarBarChart(): ShapeResult {
  // Seven ascending bars, then a diagonal trend line drawn on top after the
  // bars have appeared. The trend line cells carry a delayOffset so they
  // start revealing only once the bars are mostly in place.
  const mask = makeGrid(13, COLS);
  const delayOffset = makeNumberGrid(13, COLS);

  const bars: Array<[number, number]> = [
    [4, 2], [9, 3], [14, 4], [19, 5], [24, 6], [29, 8], [34, 10],
  ];
  for (const [baseCol, height] of bars) {
    fillRect(mask, baseCol, 13 - height, 4, height);
  }

  const trend = makeGrid(13, COLS);
  drawLine(trend, 4, 10, 37, 1);
  const TREND_DELAY = 1100;
  for (let r = 0; r < mask.length; r++) {
    for (let c = 0; c < mask[0].length; c++) {
      if (trend[r][c]) {
        mask[r][c] = true;
        delayOffset[r][c] = TREND_DELAY;
      }
    }
  }

  return { mask, delayOffset };
}

function ijmHeart(): ShapeResult {
  // Single fat heart, large enough that the top dip reads clearly. Uses the
  // 'glisten' shimmer so characters cycle from transparent to solid in a
  // diagonal wave, like light moving across a surface.
  const mask = makeGrid(14, COLS);
  drawHeart(mask, 21, 7, 3.0);
  return { mask, shimmerMode: 'glisten' };
}

const CUSTOM_SHAPES: Record<string, ShapeFn> = {
  'salesforce-google-workspace': envelope,
  'salesforce-in-slack': slackMessages,
  'salesforce-suite': funnelStaged,
  elevar: elevarBarChart,
  ijm: ijmHeart,
};

// ---------- procedural fallback ----------

function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function proceduralSilhouette(seed: string): Mask {
  const rShape = mulberry32(hashSeed(`${seed}-shape`));
  const rowCount = 10 + Math.floor(rShape() * 5);

  const baseL = 0.04 + rShape() * 0.22;
  const ampL = 0.04 + rShape() * 0.18;
  const freqL = 0.4 + rShape() * 1.4;
  const phaseL = rShape() * Math.PI * 2;

  const baseR = 0.62 + rShape() * 0.28;
  const ampR = 0.04 + rShape() * 0.18;
  const freqR = 0.4 + rShape() * 1.4;
  const phaseR = rShape() * Math.PI * 2;

  const rFill = mulberry32(hashSeed(`${seed}-fill`));
  const lit: boolean[][] = [];
  for (let row = 0; row < rowCount; row++) {
    const leftPct = baseL + ampL * Math.sin(freqL * row + phaseL);
    const rightPct = baseR + ampR * Math.sin(freqR * row + phaseR);
    const left = Math.max(0, Math.floor(leftPct * COLS));
    const right = Math.min(COLS - 1, Math.floor(rightPct * COLS));
    const rowLit = new Array<boolean>(COLS).fill(false);
    if (right > left) {
      let col = left;
      while (col <= right) {
        const wordLen = 2 + Math.floor(rFill() * 6);
        for (let k = 0; k < wordLen && col + k <= right; k++) rowLit[col + k] = true;
        col += wordLen;
        col += 1 + Math.floor(rFill() * 3);
      }
    }
    lit.push(rowLit);
  }
  return lit;
}

function getShape(seed: string): ShapeResult {
  const fn = CUSTOM_SHAPES[seed];
  const raw = fn ? fn() : proceduralSilhouette(seed);
  return isShapeResult(raw) ? raw : { mask: raw };
}

// ---------- cells & shimmer ----------

interface Cell {
  lit: boolean;
  char: string;
  opacity: number;
  revealDelay: number;
  disperseDelay: number;
}

function buildCells(
  mask: Mask,
  seed: string,
  delayOffset?: number[][],
): Cell[][] {
  const rInit = mulberry32(hashSeed(`${seed}-init`));
  const rReveal = mulberry32(hashSeed(`${seed}-reveal`));
  const rDisperse = mulberry32(hashSeed(`${seed}-disperse`));
  return mask.map((row, r) =>
    row.map((lit, c) => {
      const offset = delayOffset?.[r]?.[c] ?? 0;
      return {
        lit,
        char: lit ? BLOCKS[Math.floor(rInit() * BLOCKS.length)] : ' ',
        opacity: lit ? 0.32 + rInit() * 0.42 : 0,
        revealDelay: lit ? offset + Math.floor(rReveal() * REVEAL_STAGGER_MS) : 0,
        disperseDelay: lit ? offset + Math.floor(rDisperse() * REVEAL_STAGGER_MS) : 0,
      };
    })
  );
}

function shimmer(prev: Cell[][]): Cell[][] {
  return prev.map((row) =>
    row.map((c) =>
      c.lit
        ? {
            ...c,
            char: BLOCKS[Math.floor(Math.random() * BLOCKS.length)],
            opacity: 0.32 + Math.random() * 0.42,
          }
        : c
    )
  );
}

type Phase = 'pending' | 'revealing' | 'shimmering' | 'dispersing';

export function GlitchRedacted({ seed, className = '' }: GlitchRedactedProps) {
  const shape = useMemo(() => getShape(seed), [seed]);
  const initial = useMemo(
    () => buildCells(shape.mask, seed, shape.delayOffset),
    [shape, seed]
  );
  const maxRevealDelay = useMemo(
    () =>
      initial.reduce(
        (m, row) => row.reduce((mm, c) => Math.max(mm, c.revealDelay), m),
        0
      ),
    [initial]
  );
  const maxDisperseDelay = useMemo(
    () =>
      initial.reduce(
        (m, row) => row.reduce((mm, c) => Math.max(mm, c.disperseDelay), m),
        0
      ),
    [initial]
  );

  const [cells, setCells] = useState<Cell[][]>(initial);
  const [phase, setPhase] = useState<Phase>('pending');
  const containerRef = useRef<HTMLDivElement>(null);

  // Bidirectional IO: construct on enter, disperse on exit.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setPhase('revealing');
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        setPhase((prev) => {
          if (entry.isIntersecting) {
            return prev === 'revealing' || prev === 'shimmering' ? prev : 'revealing';
          }
          return prev === 'pending' || prev === 'dispersing' ? prev : 'dispersing';
        });
      },
      { rootMargin: '-15% 0px -15% 0px', threshold: 0 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (phase !== 'revealing') return;
    const total = maxRevealDelay + REVEAL_FADE_MS + 80;
    const t = setTimeout(() => {
      setPhase((prev) => (prev === 'revealing' ? 'shimmering' : prev));
    }, total);
    return () => clearTimeout(t);
  }, [phase, maxRevealDelay]);

  useEffect(() => {
    if (phase !== 'dispersing') return;
    const total = maxDisperseDelay + REVEAL_FADE_MS + 80;
    const t = setTimeout(() => {
      setPhase((prev) => (prev === 'dispersing' ? 'pending' : prev));
    }, total);
    return () => clearTimeout(t);
  }, [phase, maxDisperseDelay]);

  // Shimmer ticker — runs whenever the shape is on-screen. In 'glisten' mode
  // it still drives glyph changes; opacity is handled by a CSS keyframe (see
  // the render path below) so the cycling reads as a coherent wave rather
  // than per-cell flicker.
  useEffect(() => {
    if (phase !== 'shimmering') return;
    let cancelled = false;
    let timeout: ReturnType<typeof setTimeout>;
    const tick = () => {
      if (cancelled) return;
      setCells(shimmer);
      timeout = setTimeout(tick, 240 + Math.random() * 220);
    };
    timeout = setTimeout(tick, 280);
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [phase]);

  const glistenActive = phase === 'shimmering' && shape.shimmerMode === 'glisten';

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      style={{ fontSize: 'clamp(10px, 3.5cqw, 22px)' }}
      className={`flex flex-col gap-1 w-fit mx-auto font-mono leading-[1.3] tracking-[0.04em] ${className}`}
    >
      {cells.map((row, i) => (
        <div key={i} className="whitespace-pre">
          {row.map((cell, j) => {
            if (glistenActive && cell.lit) {
              // CSS animation drives opacity; per-cell delay along the
              // diagonal creates the moving highlight. Glyph changes still
              // come from the shimmer ticker re-rendering each cell.
              return (
                <span
                  key={j}
                  style={{
                    color: 'currentColor',
                    animation: 'glitch-glisten 2.6s ease-in-out infinite',
                    animationDelay: `${((j + i) * 70) % 2600}ms`,
                  }}
                >
                  {cell.char}
                </span>
              );
            }

            const shown = phase === 'revealing' || phase === 'shimmering';
            const opacity = cell.lit && shown ? cell.opacity : 0;
            let transition: string;
            if (phase === 'revealing') {
              transition = `opacity ${REVEAL_FADE_MS}ms cubic-bezier(0.22, 1, 0.36, 1) ${cell.revealDelay}ms`;
            } else if (phase === 'dispersing') {
              transition = `opacity ${REVEAL_FADE_MS}ms cubic-bezier(0.22, 1, 0.36, 1) ${cell.disperseDelay}ms`;
            } else if (phase === 'shimmering') {
              transition = 'opacity 280ms cubic-bezier(0.22, 1, 0.36, 1)';
            } else {
              transition = 'none';
            }
            return (
              <span
                key={j}
                style={{ opacity, transition, color: 'currentColor' }}
              >
                {cell.lit ? cell.char : ' '}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
}
