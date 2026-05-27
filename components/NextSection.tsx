'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { SectionThemeWrapper, type SectionTheme } from './ThemeProvider';
import { ScrambleText } from './ScrambleText';

const NEXT_THEME: SectionTheme = {
  id: 'next',
  bg: '#FAFAF7',
  ink: '#0A0908',
  accent: '#7A7672',
  statement: 'Leading design for leading companies.',
};

export function NextSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.4, once: true });

  const reveal = {
    initial: { opacity: 0, y: 16 },
    animate: inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 },
    transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1] as const },
  };

  return (
    <SectionThemeWrapper
      theme={NEXT_THEME}
      aria-label="Get in touch"
      className="relative w-full min-h-screen flex items-center"
      style={{ color: NEXT_THEME.ink }}
    >
      <motion.div
        ref={ref}
        {...reveal}
        className="w-full px-[clamp(24px,6vw,96px)] mx-auto max-w-[960px]"
      >
        <ScrambleText
          as="p"
          active={inView}
          text="Next"
          className="font-mono text-[12px] md:text-[13px] tracking-[0.06em] uppercase opacity-60 m-0"
        />
        <ScrambleText
          as="h2"
          active={inView}
          text="Let’s talk."
          delay={220}
          className="mt-4 font-display m-0 leading-[1.05] tracking-[-0.022em]"
          style={{ fontSize: 'clamp(36px, 5vw, 64px)' }}
        />
        <p className="mt-10 font-mono text-[14px] md:text-[15px] flex flex-wrap gap-x-5 gap-y-2 m-0">
          <a
            href="mailto:j@mcginn.co"
            className="border-b border-current/40 hover:border-current transition-colors"
            style={{ borderColor: 'currentColor' }}
          >
            j@mcginn.co
          </a>
          <a
            href="https://linkedin.com/in/johnsmcginn"
            target="_blank"
            rel="noopener"
            className="border-b border-current/40 hover:border-current transition-colors"
            style={{ borderColor: 'currentColor' }}
          >
            LinkedIn
          </a>
          <a
            href="https://behance.net/mcginnco"
            target="_blank"
            rel="noopener"
            className="border-b border-current/40 hover:border-current transition-colors"
            style={{ borderColor: 'currentColor' }}
          >
            Behance
          </a>
        </p>
      </motion.div>
    </SectionThemeWrapper>
  );
}
