import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Resume',
  description:
    'Resume of John McGinn — designer and founder. Currently leading design and architecture for Slack and Salesforce. Founder of Fountain.',
  alternates: { canonical: 'https://mcginn.co/resume' },
  openGraph: {
    title: 'Resume · John McGinn',
    url: 'https://mcginn.co/resume',
  },
};

interface RoleEntry {
  range: string;
  title: string;
  location?: string;
  /** Multi-paragraph body. Split on \n\n for paragraph breaks. */
  detail?: string;
  /** Optional outcomes shown as bullets. */
  outcomes?: string[];
}

const ROLES: RoleEntry[] = [
  {
    range: '2021 — Present',
    title: 'Salesforce + Slack',
    location: 'San Francisco, CA',
    detail:
      'Lead design + architecture across Salesforce and Slack. Joined Salesforce as Principal Product Designer in Feb 2021; grew through Director and Senior Director into broader leadership across Suite and Slack.\n\nLead design for Agentic experience — making AI feel like part of the work, not a separate tool. Shape conversation-driven, trustworthy agentic systems that unify Salesforce and Slack at enterprise scale. Recent and current work spans the integration of Salesforce CRM into Slack, the Salesforce / Google Workspace integration, Salesforce Suite, and applying the new SLDS2 design system.',
    outcomes: [
      'Architected platforms across Salesforce + Slack that grew multi-billion ARR.',
      'Pioneered design-led trust and governance frameworks for agentic AI now shaping the future of enterprise platforms.',
      'Salesforce Suite — drove meaningful gains in sign-up rates, trial-to-logo conversion, Starter customer growth, and post-trial expansion.',
      'Scaled design organization and processes to accelerate product velocity across large engineering teams.',
      'Established the cross-functional design governance council overseeing enterprise design quality across product organizations.',
      'Regularly present design strategy to CTO, CPO, and EVP audiences; speaker at Dreamforce.',
    ],
  },
  {
    range: '2024 — Present',
    title: 'Founder · Fountain',
    location: 'Seattle, WA',
    detail:
      'A concept for ambient AI hardware — a wearable Pin and a desktop Stand that project intelligence into the physical world rather than behind a screen. In research and prototyping. thefountain.ai',
  },
  {
    range: '2016 — 2021',
    title: 'Co-Founder, Product Design Director · Elevar',
    location: 'Charleston, SC',
    detail:
      'Co-founded Elevar, an analytics product that brought conversational interfaces to ecommerce reporting before chatbots were cool. Drove product vision, design, and naming. Exited 2021.',
  },
  {
    range: '2014 — 2018',
    title: 'UX Design and Innovation Consultant (Redshift) · Autodesk',
    location: 'San Francisco, CA',
    detail:
      'Led design strategy for Redshift, Autodesk\'s brand publication and content marketing initiative — increased engagement 10×. Designed mobile applications for "Future of Cities" and IoT projects. Webby, Digiday, CMA, and Davey awards.',
  },
  {
    range: '2010 — 2011',
    title: 'Creative Principal · Blackbaud',
    location: 'Charleston, SC',
    detail:
      'Strategic and tactical leadership for nonprofit clients including Make-A-Wish, Habitat for Humanity, the Arthritis Society, and International Justice Mission.',
  },
];

interface EducationEntry {
  program: string;
  org: string;
  year: string;
}

const EDUCATION: EducationEntry[] = [
  {
    program: 'Leading for Success',
    org: 'University of California, Berkeley · Haas School of Business',
    year: '2026',
  },
];

interface Quote {
  body: string;
  attribution: string;
}

const QUOTES: Quote[] = [
  {
    body: '100% — John is the best designer I have worked with at Salesforce. He has been key in every step we have taken as a team.',
    attribution: 'EVP & GM, Salesforce',
  },
  {
    body: 'John will make an outstanding VP design leader. He has that rare-to-find approachability, craft, and skill that somehow removes the tension in a room.',
    attribution: 'VP UX, Salesforce',
  },
  {
    body: 'I counted myself incredibly lucky to hire and bring John to my team. He brings an eye for visual execution that cannot be taught, and an innate ability to craft beautiful & intuitive solutions out of massive amounts of ambiguity.',
    attribution: 'Design lead, Atlassian',
  },
  {
    body: 'He adds a sense of calm to every meeting.',
    attribution: 'VP Content, Salesforce',
  },
  {
    body: 'After working with John for over 18 years, I consider him to be a top notch thinker. His creative energy brings a fresh perspective to any project.',
    attribution: 'Former manager (18+ year working relationship)',
  },
];

const CLIENTS = [
  'Autodesk',
  'Bristol Myers Squibb',
  'Novartis',
  'Boehringer Ingelheim',
  'NASCAR',
  'Major League Baseball',
  'US Air Force',
  'International Justice Mission',
  'Make-A-Wish',
  'Habitat for Humanity',
  'Tableau',
  'Mulesoft',
  'Heroku',
];

const SKILLS = [
  'AI experience design',
  'Design leadership at scale',
  'Generative & agentic interfaces',
  'Product architecture',
  'Founder-operator track record',
  'Visual craft and brand',
  'Hardware concept development',
  'Design systems',
  'Cross-functional executive partnership',
];

const CONTACT_LINKS = [
  { label: 'mcginn.co', href: 'https://mcginn.co' },
  { label: 'thefountain.ai', href: 'https://thefountain.ai' },
  { label: 'linkedin.com/in/johnsmcginn', href: 'https://linkedin.com/in/johnsmcginn' },
  { label: 'behance.net/mcginnco', href: 'https://behance.net/mcginnco' },
];

export default function ResumePage() {
  return (
    <main className="w-full min-h-screen px-[clamp(24px,6vw,96px)] pt-[18vh] pb-[14vh] bg-paper text-ink">
      <div className="mx-auto max-w-[820px]">
        {/* Visible header — name hidden; the fixed signature in the layout
            stands in for it visually. The H1 stays in the DOM for SEO/a11y. */}
        <header className="flex flex-col gap-3">
          <h1 className="sr-only">John McGinn — Resume</h1>
          <p className="font-display text-ink m-0 text-[20px] md:text-[22px] tracking-[-0.005em]">
            Designer + Founder
          </p>
          <p className="mt-2 font-mono text-[12px] md:text-[13px] text-ink/60 leading-[1.7] m-0">
            Charleston, SC ·{' '}
            <a href="mailto:j@mcginn.co" className="hover-underline">
              j@mcginn.co
            </a>{' '}
            ·{' '}
            <a href="tel:+12064063284" className="hover-underline">
              (206) 406-3284
            </a>
          </p>
        </header>

        {/* Bio — hairline above and below for editorial framing */}
        <div className="mt-12 pt-10 border-t border-hairline">
          <div className="flex flex-col gap-5 max-w-[64ch] font-sans text-[16px] md:text-[17px] leading-[1.65] text-ink/90">
            <p className="m-0">
              I design and scale AI-powered systems that act on behalf of
              people. My approach is clarity, trust, and intent-led design —
              creating agentic platforms that transform enterprise work.
            </p>
            <p className="m-0">
              Currently leading design and architecture for Slack and
              Salesforce&rsquo;s Self-Service and Growth experiences — the
              surfaces where AI agents do work in the user&rsquo;s flow.
              Founder of Fountain, an ambient AI hardware concept.
            </p>
            <p className="m-0">
              Twenty years of bringing visual craft, design systems thinking,
              and team leadership to inflection moments. I think the best AI
              experiences will feel as quiet and obvious as the best of any
              other kind of design — and we&rsquo;re very early in figuring
              out what that means.
            </p>
          </div>
        </div>

        <Section title="Experience">
          <div className="flex flex-col">
            {ROLES.map((role, i) => (
              <RoleBlock key={`${role.range}-${i}`} role={role} />
            ))}
          </div>
        </Section>

        <Section title="Education & certification">
          <div className="flex flex-col">
            {EDUCATION.map((e, i) => (
              <article
                key={i}
                className="grid grid-cols-1 md:grid-cols-[140px_1fr] gap-y-2 gap-x-10 py-7 border-b border-hairline last:border-b-0"
              >
                <p className="font-mono text-[12px] uppercase tracking-[0.04em] text-ink/55 m-0 md:pt-[0.4em]">
                  {e.year}
                </p>
                <div className="max-w-[64ch]">
                  <h3
                    className="font-sans text-ink m-0 leading-[1.3]"
                    style={{ fontSize: '19px', letterSpacing: '-0.005em' }}
                  >
                    {e.program}
                  </h3>
                  <p className="mt-1 font-mono text-[12px] tracking-[0.02em] text-ink/60 m-0">
                    {e.org}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </Section>

        <Section title="What others have said">
          <div className="flex flex-col gap-9 max-w-[64ch]">
            {QUOTES.map((q, i) => (
              <blockquote key={i} className="m-0 pl-5 border-l-2 border-ink/15">
                <p className="m-0 font-sans text-[16px] md:text-[17px] leading-[1.55] text-ink/90">
                  &ldquo;{q.body}&rdquo;
                </p>
                <cite className="block mt-2 font-mono text-[12px] tracking-[0.02em] text-ink/55 not-italic">
                  — {q.attribution}
                </cite>
              </blockquote>
            ))}
          </div>
        </Section>

        <Section title="Selected clients (across roles)">
          <p className="font-sans text-[15px] md:text-[16px] leading-[1.7] text-ink/85 max-w-[64ch] m-0">
            {CLIENTS.join(' · ')}
          </p>
        </Section>

        <Section title="What I bring">
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-2 list-none p-0 m-0 max-w-[760px]">
            {SKILLS.map((s) => (
              <li
                key={s}
                className="font-sans text-[15px] md:text-[16px] leading-[1.55] text-ink/85 m-0"
              >
                {s}
              </li>
            ))}
          </ul>
        </Section>

        <footer className="mt-24 pt-8 border-t border-hairline font-mono text-[12px] md:text-[13px] text-ink/60 leading-[1.7]">
          {CONTACT_LINKS.map((l, i) => (
            <span key={l.href}>
              <a
                href={l.href}
                target="_blank"
                rel="noopener"
                className="hover-underline"
              >
                {l.label}
              </a>
              {i < CONTACT_LINKS.length - 1 && ' · '}
            </span>
          ))}
        </footer>
      </div>
    </main>
  );
}

function RoleBlock({ role }: { role: RoleEntry }) {
  const paragraphs = role.detail ? role.detail.split('\n\n') : [];

  return (
    <article className="grid grid-cols-1 md:grid-cols-[140px_1fr] gap-y-3 gap-x-10 py-9 border-b border-hairline last:border-b-0">
      <p className="font-mono text-[12px] uppercase tracking-[0.04em] text-ink/55 m-0 md:pt-[0.4em]">
        {role.range}
      </p>

      <div className="max-w-[64ch] flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <h3
            className="font-sans text-ink m-0 leading-[1.3]"
            style={{ fontSize: '19px', letterSpacing: '-0.005em' }}
          >
            {role.title}
          </h3>
          {role.location && (
            <p className="m-0 font-mono text-[12px] tracking-[0.02em] text-ink/55">
              {role.location}
            </p>
          )}
        </div>

        {paragraphs.length > 0 && (
          <div className="flex flex-col gap-4">
            {paragraphs.map((p, i) => (
              <p
                key={i}
                className="m-0 font-sans text-[15px] md:text-[16px] leading-[1.6] text-ink/85"
              >
                {p}
              </p>
            ))}
          </div>
        )}

        {role.outcomes && role.outcomes.length > 0 && (
          <div className="mt-1">
            <p className="font-mono text-[11px] uppercase tracking-[0.06em] text-ink/55 m-0 mb-3">
              Selected outcomes
            </p>
            <ul className="list-none p-0 m-0 flex flex-col gap-3">
              {role.outcomes.map((o, i) => (
                <li
                  key={i}
                  className="font-sans text-[15px] md:text-[16px] leading-[1.55] text-ink/85 pl-5 relative"
                >
                  <span
                    aria-hidden="true"
                    className="absolute left-0 top-[0.45em] w-2 h-px bg-ink/40"
                  />
                  {o}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </article>
  );
}

function Section({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-16">
      {title && (
        <h2 className="font-mono text-[12px] tracking-[0.06em] uppercase text-ink/55 m-0 pb-4 border-b border-hairline">
          {title}
        </h2>
      )}
      <div className={title ? 'mt-6' : 'mt-2'}>{children}</div>
    </section>
  );
}
