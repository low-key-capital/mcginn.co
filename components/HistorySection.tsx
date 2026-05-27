'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import Link from 'next/link';
import type { WorkEntry } from '@/lib/content';
import { SectionThemeWrapper, type SectionTheme } from './ThemeProvider';
import { ScrambleText } from './ScrambleText';

interface HistorySectionProps {
  entry: WorkEntry;
}

/**
 * Custom layout for the final "History" entry — a museum-credits-style
 * spread. Two-row grid:
 *   Row 1 — title (left)            ·  small label (right, desktop only)
 *   Row 2 — subtext + CTAs (left)   ·  alphabetical company list (right)
 * The row-2 alignment puts the subtext flush with the start of the list.
 */
export function HistorySection({ entry }: HistorySectionProps) {
  const theme: SectionTheme = {
    id: entry.slug,
    bg: entry.bg ?? '#0A0908',
    ink: entry.ink ?? '#FAFAF7',
    accent: entry.accent ?? '#7A7672',
    statement: entry.statement ?? '',
  };

  const contentRef = useRef<HTMLDivElement>(null);
  const inView = useInView(contentRef, { amount: 0.3, once: true });

  const reveal = {
    initial: { opacity: 0, y: 18 },
    animate: inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 },
    transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1] as const },
  };

  const clients = entry.clients ?? [];
  const portfolioHref = entry.href ?? 'https://behance.net/mcginnco';

  return (
    <SectionThemeWrapper
      theme={theme}
      aria-label={entry.title}
      className="relative w-full min-h-screen flex items-center overflow-visible"
      style={{ color: theme.ink }}
    >
      <div
        ref={contentRef}
        className="w-full px-[clamp(24px,6vw,96px)] py-[14vh] md:py-[18vh] mx-auto max-w-[1280px]"
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-y-8 md:gap-y-10 gap-x-10 md:gap-x-20 items-start">
          {/* Row 1, left — title */}
          <motion.h2
            {...reveal}
            className="md:col-span-5 md:row-start-1 font-display m-0 leading-[1.05] tracking-[-0.022em] whitespace-nowrap"
            style={{ fontSize: 'clamp(28px, 3.6vw, 44px)' }}
          >
            <ScrambleText as="span" active={inView} text={entry.title} delay={220} />
          </motion.h2>

          {/* Row 1, right — small editorial label (desktop only) */}
          <motion.p
            {...reveal}
            className="hidden md:block md:col-span-7 md:row-start-1 font-mono text-[11px] uppercase tracking-[0.06em] opacity-55 m-0"
          >
            <ScrambleText as="span" active={inView} text="Selected · A–Z" />
          </motion.p>

          {/* Row 2, left — subtext + CTAs (aligned with the list start) */}
          <motion.div
            {...reveal}
            transition={{ ...reveal.transition, delay: 0.04 }}
            className="md:col-span-5 md:row-start-2 flex flex-col gap-7"
          >
            {entry.description && (
              <p className="font-sans text-[15px] md:text-[17px] leading-[1.55] max-w-[44ch] opacity-90 m-0">
                {entry.description}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <Link
                href="/resume"
                className="font-mono text-[12px] md:text-[13px] uppercase tracking-[0.04em] border-b border-current/40 hover:border-current transition-colors py-[2px]"
                style={{ borderColor: 'currentColor', color: 'currentColor' }}
              >
                Resume
              </Link>
              <a
                href={portfolioHref}
                target="_blank"
                rel="noopener"
                className="font-mono text-[12px] md:text-[13px] uppercase tracking-[0.04em] border-b border-current/40 hover:border-current transition-colors py-[2px]"
                style={{ borderColor: 'currentColor', color: 'currentColor' }}
              >
                Portfolio
              </a>
            </div>
          </motion.div>

          {/* Row 2, right — alphabetical company list, two-up via CSS columns */}
          <motion.ul
            {...reveal}
            transition={{ ...reveal.transition, delay: 0.08 }}
            aria-label="Selected clients across roles"
            className="md:col-span-7 md:row-start-2 m-0 p-0 list-none font-sans text-[14px] md:text-[15px] leading-[1.7] opacity-90 columns-1 md:[column-count:2] md:[column-gap:1.5em] md:[column-fill:balance]"
          >
            {clients.map((c) => (
              <li
                key={c}
                className="m-0"
                style={{ breakInside: 'avoid' }}
              >
                {c}
              </li>
            ))}
          </motion.ul>
        </div>
      </div>
    </SectionThemeWrapper>
  );
}
