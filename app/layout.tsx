import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Logo } from '@/components/Logo';
import { KeyboardShortcuts } from '@/components/KeyboardShortcuts';
import { ThemeProvider } from '@/components/ThemeProvider';
// Top-right glitch statement line — hidden for now (re-enable <Statement /> below).
// import { Statement } from '@/components/Statement';
import { SmoothScroll } from '@/components/SmoothScroll';
import { personSchema, websiteSchema } from '@/lib/seo';

export const metadata: Metadata = {
  metadataBase: new URL('https://mcginn.co'),
  title: {
    default: 'John McGinn — Designer & Founder · AI experience design',
    template: '%s · John McGinn',
  },
  description:
    'John McGinn is a designer and founder leading AI experience design at Salesforce. Founder of Fountain, an ambient AI hardware concept. Co-founded and exited Elevar (2024). Twenty years of design across 400+ projects with 100+ teammates.',
  keywords: [
    'John McGinn',
    'John McGinn designer',
    'John McGinn Salesforce',
    'AI experience design',
    'agentic AI design',
    'generative UI',
    'design leadership',
    'Fountain AI',
    'ambient AI hardware',
    'design director',
  ],
  authors: [{ name: 'John McGinn', url: 'https://mcginn.co' }],
  creator: 'John McGinn',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://mcginn.co',
    title: 'John McGinn — Designer & Founder · AI experience design',
    description:
      'Designer and founder leading AI experience design at Salesforce. Founder of Fountain. Co-founded and exited Elevar (2024). Twenty years of design across 400+ projects.',
    siteName: 'John McGinn',
    images: [
      {
        url: '/assets/og.jpg',
        width: 1200,
        height: 630,
        alt: 'John McGinn — Designer & Founder',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'John McGinn — Designer & Founder',
    description: 'Leading AI experience design at Salesforce. Founder of Fountain.',
    images: ['/assets/og.jpg'],
    creator: '@mcginnco',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://mcginn.co',
  },
  icons: {
    icon: [{ url: '/assets/favicon.svg', type: 'image/svg+xml' }],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // theme-color is set dynamically by ThemeProvider so the iOS Safari chrome
  // tracks the active section. A static value here gets cached by Safari's
  // chrome-tint feature and fights the dynamic update.
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body>
        <SmoothScroll />
        <ThemeProvider>
          <header
            className="fixed top-[clamp(20px,3.5vw,40px)] left-[clamp(20px,4vw,48px)] z-30 pointer-events-none"
          >
            <div className="pointer-events-auto" style={{ color: 'var(--theme-ink)' }}>
              <Logo className="h-14 w-auto" />
            </div>
          </header>
          {/* <Statement /> — top-right glitch line, hidden for now */}
          {children}
          <KeyboardShortcuts />
        </ThemeProvider>
      </body>
    </html>
  );
}
