'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import type { WorkEntry } from '@/lib/content';
import { SectionThemeWrapper, type SectionTheme } from './ThemeProvider';
import { GlitchRedacted } from './GlitchRedacted';
import { SectionBackground, hasSectionBackground } from './SectionBackground';

interface WorkSectionProps {
  entry: WorkEntry;
  index: number;
  total: number;
  /** Optional alternate artwork (e.g. Spline scene for Fountain). */
  artwork?: React.ReactNode;
  /** Called when the user clicks the case-study CTA. */
  onOpen?: () => void;
}

export function WorkSection({ entry, index, total, artwork, onOpen }: WorkSectionProps) {
  const isLocked = entry.status === 'locked';
  const theme: SectionTheme = {
    id: entry.slug,
    bg: entry.bg ?? '#FAFAF7',
    ink: entry.ink ?? '#0A0908',
    accent: entry.accent ?? '#7A7672',
    statement: entry.statement ?? entry.description ?? '',
  };

  const contentRef = useRef<HTMLDivElement>(null);
  const inView = useInView(contentRef, { amount: 0.35, once: true });

  const reveal = {
    initial: { opacity: 0, y: 18 },
    animate: inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 },
    transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1] as const },
  };

  // Fountain gets a layered treatment: Spline fills the section behind the
  // text on mobile, and on desktop bleeds across the right side. The text
  // sits in front and the entire Spline area is the case-study tap target.
  if (entry.slug === 'fountain' && artwork) {
    return (
      <SectionThemeWrapper
        theme={theme}
        aria-label={entry.title}
        className="relative w-full min-h-screen flex items-center overflow-visible"
        style={{ color: theme.ink }}
      >
        <div className="pointer-events-none absolute inset-0 z-0 md:left-[30%] md:-right-[8%] md:-top-[4%] md:-bottom-[4%]">
          <div className="pointer-events-auto absolute inset-0">{artwork}</div>
        </div>

        <div
          ref={contentRef}
          className="pointer-events-none relative z-10 w-full px-[clamp(24px,6vw,96px)] py-[14vh] md:py-[18vh] mx-auto max-w-[1280px]"
        >
          <motion.div
            {...reveal}
            className="pointer-events-auto flex flex-col gap-6 max-w-[44ch] md:max-w-[42%]"
          >
            <SectionText
              entry={entry}
              index={index}
              total={total}
              isLocked={isLocked}
              onOpen={onOpen}
            />
          </motion.div>
        </div>
      </SectionThemeWrapper>
    );
  }

  return (
    <SectionThemeWrapper
      theme={theme}
      aria-label={entry.title}
      className="relative w-full min-h-screen flex items-center overflow-visible"
      style={{ color: theme.ink }}
    >
      <SectionBackground slug={entry.slug} />

      <div
        ref={contentRef}
        className="pointer-events-none relative z-10 w-full px-[clamp(24px,6vw,96px)] py-[14vh] md:py-[18vh] mx-auto max-w-[1280px]"
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-y-12 gap-x-8 items-center">
          <motion.div
            {...reveal}
            className="pointer-events-auto relative md:col-span-5 flex flex-col gap-6"
          >
            {/* Mobile-only legibility scrim: full-bleed effects sit directly
                behind the stacked text on small screens, so a soft radial wash
                in the section color keeps the copy readable. A radial mask
                fades it to transparent at the edges so there's no visible halo. */}
            <div
              aria-hidden="true"
              className="md:hidden absolute -inset-x-6 -inset-y-10 -z-10"
              style={{
                background: 'var(--theme-bg)',
                opacity: 0.8,
                maskImage: 'radial-gradient(ellipse at center, black 38%, transparent 80%)',
                WebkitMaskImage: 'radial-gradient(ellipse at center, black 38%, transparent 80%)',
              }}
            />
            <SectionText
              entry={entry}
              index={index}
              total={total}
              isLocked={isLocked}
              onOpen={onOpen}
            />
          </motion.div>

          <motion.div
            {...reveal}
            transition={{ ...reveal.transition, delay: 0.08 }}
            className="md:col-span-7 overflow-visible"
          >
            <Artwork entry={entry} artwork={artwork} isLocked={isLocked} />
          </motion.div>
        </div>
      </div>
    </SectionThemeWrapper>
  );
}

function SectionText({
  entry,
  index,
  total,
  isLocked,
  onOpen,
}: {
  entry: WorkEntry;
  index: number;
  total: number;
  isLocked: boolean;
  onOpen?: () => void;
}) {
  return (
    <>
      <p className="font-mono text-[12px] md:text-[13px] tracking-[0.04em] uppercase opacity-70 m-0">
        {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
        {entry.year ? ` · ${entry.year}` : ''}
      </p>

      <h2
        className="font-display m-0 leading-[1.05] tracking-[-0.022em]"
        style={
          entry.slug === 'fountain'
            ? {
                fontSize: 'clamp(29px, 4vw, 51px)',
                fontWeight: 600,
                letterSpacing: '-0.018em',
              }
            : { fontSize: 'clamp(36px, 5vw, 64px)' }
        }
      >
        {entry.title}
      </h2>

      {entry.description && (
        <p className="font-sans text-[15px] md:text-[16px] leading-[1.55] max-w-[44ch] opacity-90 m-0">
          {entry.description}
        </p>
      )}

      <dl className="grid grid-cols-[80px_1fr] gap-y-1 gap-x-4 font-mono text-[12px] md:text-[13px] opacity-80 m-0">
        {entry.role && (
          <>
            <dt className="opacity-70">Role</dt>
            <dd className="m-0">{entry.role}</dd>
          </>
        )}
        {entry.client && (
          <>
            <dt className="opacity-70">Company</dt>
            <dd className="m-0">{entry.client}</dd>
          </>
        )}
      </dl>

      {/*
        CTA layout:
        - external + href set → CTA is itself the external link (replaces modal). PRESS link hidden.
        - otherwise → CTA opens the case-study modal; if href is set it shows beside as PRESS.
      */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-2">
        {entry.external && entry.href ? (
          <div className="inline-flex items-center gap-2">
            {isLocked && (
              <span
                aria-hidden="true"
                className="opacity-75"
                style={{ color: 'currentColor' }}
              >
                <LockIcon />
              </span>
            )}
            <a
              href={entry.href}
              target="_blank"
              rel="noopener"
              className="font-mono text-[12px] md:text-[13px] uppercase tracking-[0.04em] border-b border-current/40 hover:border-current transition-colors py-[2px]"
              style={{ borderColor: 'currentColor', color: 'currentColor' }}
              aria-label={`${entry.cta ?? 'Open case study'}: ${entry.title}`}
            >
              {entry.cta ?? 'Open case study'}
            </a>
          </div>
        ) : (
          onOpen && (
            <div className="inline-flex items-center gap-2">
              {isLocked && (
                <span
                  aria-hidden="true"
                  className="opacity-75"
                  style={{ color: 'currentColor' }}
                >
                  <LockIcon />
                </span>
              )}
              <button
                type="button"
                onClick={onOpen}
                className="font-mono text-[12px] md:text-[13px] uppercase tracking-[0.04em] border-b border-current/40 hover:border-current transition-colors py-[2px]"
                style={{ borderColor: 'currentColor', color: 'currentColor' }}
                aria-label={`${entry.cta ?? 'Open case study'}: ${entry.title}`}
              >
                {entry.cta ?? 'Open case study'}
              </button>
            </div>
          )
        )}
        {!entry.external && entry.href && (
          <a
            href={entry.href}
            target="_blank"
            rel="noopener"
            aria-label={`Press reference for ${entry.title}`}
            className="font-mono text-[12px] md:text-[13px] uppercase tracking-[0.04em] border-b border-current/40 hover:border-current transition-colors py-[2px]"
            style={{ borderColor: 'currentColor', color: 'currentColor' }}
          >
            Press
          </a>
        )}
      </div>
    </>
  );
}

function Artwork({
  entry,
  artwork,
}: {
  entry: WorkEntry;
  artwork?: React.ReactNode;
  isLocked: boolean;
}) {
  if (artwork) return <>{artwork}</>;

  // The section background effect stands in for the glitch silhouette here.
  if (hasSectionBackground(entry.slug)) return null;

  if (entry.image) {
    return (
      <div className="relative w-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={entry.image}
          alt={entry.imageAlt ?? entry.title}
          className="block w-full h-auto"
          loading="lazy"
        />
      </div>
    );
  }

  return (
    <div
      className="mx-auto w-full max-w-[640px]"
      style={{ containerType: 'inline-size' }}
    >
      <GlitchRedacted seed={entry.slug} />
    </div>
  );
}

function LockIcon() {
  return (
    <svg
      width="11"
      height="13"
      viewBox="0 0 11 13"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <rect
        x="0.75"
        y="5.75"
        width="9.5"
        height="6.5"
        rx="0.5"
        stroke="currentColor"
        strokeWidth="1"
      />
      <path
        d="M2.75 5.75V3.5C2.75 1.98 3.98 0.75 5.5 0.75C7.02 0.75 8.25 1.98 8.25 3.5V5.75"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
      />
    </svg>
  );
}
