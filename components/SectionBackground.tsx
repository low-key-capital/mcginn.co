'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useTheme } from './ThemeProvider';

// Each Reactbits effect is code-split and only mounts while its section is
// near the viewport (see the IntersectionObserver below), so at most one or
// two WebGL contexts are ever live on this single-page scroll.
const DotField = dynamic(() => import('./backgrounds/DotField'), { ssr: false });
const Beams = dynamic(() => import('./backgrounds/Beams'), { ssr: false });
const GradientBlinds = dynamic(() => import('./backgrounds/GradientBlinds'), { ssr: false });
const Grainient = dynamic(() => import('./backgrounds/Grainient'), { ssr: false });
const Ballpit = dynamic(() => import('./backgrounds/Ballpit'), { ssr: false });

interface BackgroundConfig {
  /** Full opacity while this section is the active (focal) theme. */
  opacity: number;
  /**
   * Soft edge fade that dissolves the effect into the solid section color.
   * 'both' (default) fades top + bottom, 'top' fades only the top, 'none'
   * leaves the effect edge-to-edge (used for full-cover gradients whose color
   * would clash with the section's flat background at the seams).
   */
  fade?: 'both' | 'top' | 'none';
  render: (isMobile: boolean, paused: boolean) => ReactNode;
}

// Each project's effect is themed to its own palette and echoes the metaphor
// of its (now hidden) glitch silhouette — envelope → dot field, tokens →
// particles, etc. Density and mouse interaction are turned up so the effect
// reads as the section's focal point.
const BACKGROUNDS: Record<string, BackgroundConfig> = {
  // Google Workspace — dot field, the structured productivity grid. The
  // cursor glow is tinted to the section's blue so it blends in rather than
  // casting a dark shadow.
  'salesforce-google-workspace': {
    opacity: 0.85,
    render: (_isMobile, paused) => (
      <DotField
        dotSpacing={16}
        dotRadius={1.6}
        cursorRadius={520}
        bulgeStrength={80}
        gradientFrom="rgba(255, 255, 255, 0.85)"
        gradientTo="rgba(251, 188, 4, 0.7)"
        glowColor="#1A73E8"
        paused={paused}
      />
    ),
  },
  // Salesforce in Slack — beams of light raking across the aubergine, a calmer
  // focal effect than the old fluid sim.
  'salesforce-in-slack': {
    opacity: 0.85,
    render: (_isMobile, paused) => (
      <Beams
        beamNumber={14}
        beamWidth={2.2}
        beamHeight={18}
        lightColor="#E6CBEC"
        speed={2}
        noiseIntensity={1.6}
        scale={0.2}
        rotation={32}
        paused={paused}
      />
    ),
  },
  // Salesforce Suite — gradient blinds in the brand's cyan/navy, with a
  // spotlight that tracks the cursor.
  'salesforce-suite': {
    opacity: 0.8,
    render: (_isMobile, paused) => (
      <GradientBlinds
        gradientColors={['#0E76B5', '#00A0E0', '#8FD8F4']}
        angle={20}
        noise={0.25}
        blindCount={18}
        spotlightRadius={0.55}
        spotlightOpacity={0.9}
        mouseDampening={0.15}
        mixBlendMode="lighten"
        paused={paused}
      />
    ),
  },
  // Elevar — a ball pit of buoyant spheres that rise and scatter under the
  // cursor, in the brand's lilac/purple.
  elevar: {
    opacity: 0.9,
    fade: 'top',
    render: (isMobile) => (
      <Ballpit
        count={isMobile ? 50 : 160}
        colors={[0xc8befa, 0xffffff, 0x9b8cff]}
        gravity={0.4}
        friction={0.9975}
        wallBounce={0.95}
        followCursor
      />
    ),
  },
  // IJM — a grainy gradient in vibrant-but-calming jewel tones (teal, warm
  // gold, soft plum), kept mid-dark so white copy stays legible.
  ijm: {
    opacity: 0.9,
    fade: 'none',
    render: () => (
      <Grainient
        color1="#166E66"
        color2="#D4A24C"
        color3="#3E3A7A"
        timeSpeed={0.2}
        grainAmount={0.12}
        saturation={1.05}
      />
    ),
  },
};

export function hasSectionBackground(slug: string): boolean {
  return slug in BACKGROUNDS;
}

export function SectionBackground({ slug }: { slug: string }) {
  const config = BACKGROUNDS[slug];
  const { active } = useTheme();
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Track phone-width viewports so effects can scale down (e.g. fewer balls).
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(max-width: 767px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  // Mount the effect a little before the section enters and unmount once it's
  // well past, bounding the number of simultaneous WebGL contexts.
  useEffect(() => {
    if (!config) return;
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setMounted(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => setMounted(entry.isIntersecting),
      { rootMargin: '400px 0px 400px 0px', threshold: 0 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [config]);

  if (!config) return null;

  // Fade in only while this section owns the active theme, so the effect
  // crossfades in lock-step with the section's background color (the body bg
  // transition is 700ms in globals.css).
  const focused = active.id === slug;

  // Fade the effect out at the section edges so it dissolves into the solid
  // section color, softening the seams between sections. Configurable per
  // section (see BackgroundConfig.fade).
  const fade = config.fade ?? 'both';
  const edgeFade =
    fade === 'none'
      ? undefined
      : fade === 'top'
        ? 'linear-gradient(to bottom, transparent 0%, black 16%, black 100%)'
        : 'linear-gradient(to bottom, transparent 0%, black 16%, black 84%, transparent 100%)';

  return (
    <div
      ref={ref}
      aria-hidden="true"
      // pointer-events only on desktop: on touch devices the WebGL canvases
      // (Ballpit sets touch-action:none, LiquidEther preventDefaults touchmove)
      // would otherwise capture the gesture and block page scrolling.
      className="pointer-events-none md:pointer-events-auto absolute inset-0 z-0 overflow-hidden transition-opacity duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
      style={{
        opacity: focused ? config.opacity : 0,
        maskImage: edgeFade,
        WebkitMaskImage: edgeFade,
      }}
    >
      {mounted ? config.render(isMobile, !focused) : null}
    </div>
  );
}
