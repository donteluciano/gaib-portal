import type { Metadata } from 'next';
import Link from 'next/link';
import { CtaBand, PageHero, SectionHeading } from '@/components/site/blocks';

export const metadata: Metadata = {
  title: 'About',
  description:
    'Herald Capital Partners is a focused predevelopment investment firm building powered sites for modular AI inference data centers.',
};

const PRINCIPLES = [
  {
    title: 'Power first',
    text: 'Every evaluation starts with power. If firm power cannot be delivered on a credible timeline, the site does not move forward.',
  },
  {
    title: 'Discipline at every gate',
    text: 'Each stage ends in a go/no-go decision. We stop early when a site does not hold up, and commit further when it does.',
  },
  {
    title: 'Certainty for buyers',
    text: 'We document each site so a developer can underwrite it with confidence and move straight to construction planning.',
  },
  {
    title: 'Good neighbors',
    text: 'We engage local officials and communities early, and structure projects that benefit the places they are built.',
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHero label="About" title="A focused firm for a specific problem." />

      <section>
        <div className="mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-28">
          <div className="grid gap-10 md:grid-cols-[1fr_1.4fr] md:gap-16">
            <p className="text-[24px] leading-[1.5] md:text-[28px]">
              We build the sites that modular inference data centers are built on.
            </p>
            <div className="hc-muted space-y-6 text-[17px] leading-[1.8]">
              <p>
                Herald Capital Partners is a predevelopment investment firm. Demand for AI inference capacity is
                growing faster than the grid can serve it, and developers increasingly need sites where power can be
                delivered on their timeline, not the utility queue&apos;s.
              </p>
              <p>
                We work at the earliest and most specialized stage of that process: finding the right site, whether open land or an existing building, securing
                it, and completing the power, environmental, fiber, permitting and community work that turns it into
                a site a developer can build on.
              </p>
              <p>
                We are deliberately small and focused. Backed by a dedicated capital partner, we can commit to sites
                quickly and see each one through our full process.
              </p>
              <p>
                <Link href="/approach" className="hc-link text-[#FBF3DA]">
                  How we work
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="hc-cream">
        <div className="mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-28">
          <SectionHeading label="Principles" title="How we make decisions." />
          <div className="mt-14 grid gap-x-14 gap-y-10 md:grid-cols-2">
            {PRINCIPLES.map((p) => (
              <div key={p.title} className="border-t border-[#111D2B]/15 pt-6">
                <h3 className="text-[22px]">{p.title}</h3>
                <p className="hc-muted mt-3 text-[16px] leading-[1.75]">{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-16 md:flex-row md:items-center md:justify-between md:px-10 md:py-20">
          <div>
            <p className="hc-label">Leadership</p>
            <h2 className="mt-5 text-[26px] md:text-[30px]">A partnership directly involved in every site.</h2>
          </div>
          <Link href="/team" className="hc-btn hc-btn-ghost self-start md:self-auto">
            Meet the team
          </Link>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
