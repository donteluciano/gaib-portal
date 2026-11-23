import type { Metadata } from 'next';
import Link from 'next/link';
import { CtaBand, SectionHeading } from '@/components/site/blocks';
import { SITE_DESCRIPTION } from '@/components/site/content';

export const metadata: Metadata = {
  title: { absolute: 'Herald Capital Partners | Powered sites for AI inference' },
  description: SITE_DESCRIPTION,
};

const STEPS = [
  {
    title: 'Originate',
    text: 'We identify sites, open land or existing buildings, where electric capacity or gas, fiber and water line up, often before they come to market.',
  },
  {
    title: 'Secure',
    text: 'We put promising sites under option, so we control them while we prove them out.',
  },
  {
    title: 'De-risk',
    text: 'Each site moves through staged diligence on power, feasibility, environmental, fiber and community, with a go/no-go decision at every gate.',
  },
  {
    title: 'Deliver',
    text: 'We package the site with the studies and approvals a buyer needs, then sell it to a developer or advance it ourselves.',
  },
];

const CRITERIA = [
  {
    title: 'Power',
    text: 'Utility electric capacity from nearby substations and transmission, transmission-pipeline gas for on-site generation, or both.',
  },
  {
    title: 'Fiber',
    text: 'Multiple carrier options nearby and a defined, costed last-mile path.',
  },
  {
    title: 'Water and environment',
    text: 'Confirmed water availability and a clean environmental record, verified through site assessments.',
  },
  {
    title: 'Permitting',
    text: 'A workable zoning pathway, and a clear route to air permits where generation is on site.',
  },
  {
    title: 'Community',
    text: 'Local officials and communities who see the project as an asset, with incentives explored early.',
  },
  {
    title: 'Deployment',
    text: 'Land or buildings suited to modular deployment and phased expansion as demand grows.',
  },
];

const AUDIENCES = [
  {
    title: 'Property owners',
    text: 'If you own land or an industrial building near gas transmission lines, substations or fiber routes, we would like to hear from you. We move quickly and explain our process plainly.',
    cta: 'Submit your property',
  },
  {
    title: 'Brokers',
    text: 'We review sites brought to us by brokers and work cooperatively with them through the process.',
    cta: 'Submit a listing',
  },
  {
    title: 'Developers and operators',
    text: 'We deliver sites with diligence complete and a certainty package in hand, so you can move from acquisition to construction faster.',
    cta: 'Talk to us',
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="border-b border-[#BD9468]/15">
        <div className="mx-auto max-w-6xl px-6 pb-20 pt-16 md:px-10 md:pb-32 md:pt-28">
          <p className="hc-label">Predevelopment investment</p>
          <span className="hc-rule mt-6" />
          <h1 className="mt-8 max-w-4xl text-[38px] sm:text-[52px] lg:text-[64px]">
            Powered sites for AI inference, ready to build.
          </h1>
          <p className="hc-muted mt-8 max-w-2xl text-[17px] leading-[1.7] md:text-[20px]">
            Herald Capital Partners finds, secures and de-risks sites for modular inference data centers, from open land to existing
            buildings. We
            assemble the power, fiber, water and approvals a developer needs, so new capacity can come online fast.
          </p>
          <div className="mt-11 flex flex-col gap-4 sm:flex-row">
            <Link href="/contact" className="hc-btn">
              Submit a site
            </Link>
            <Link href="/approach" className="hc-btn hc-btn-ghost">
              Our approach
            </Link>
          </div>
        </div>
      </section>

      {/* Why now */}
      <section className="hc-cream">
        <div className="mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-28">
          <SectionHeading label="Why now" title="Power, not land, is the constraint." />
          <div className="mt-12 grid gap-8 text-[17px] leading-[1.75] md:grid-cols-2 md:gap-14">
            <p>
              Inference is the part of AI that answers users in real time, and demand for it is growing quickly.
              Operators increasingly want capacity they can deploy in modular increments, close to where it is
              needed.
            </p>
            <p>
              Grid connections can take years. The sites that move fastest pair a property with firm power, from the
              grid, generated on site or both, along with fiber, water and a clear permitting path. Those sites are scarce, and
              assembling one takes specialized work well before construction begins.
            </p>
          </div>
        </div>
      </section>

      {/* What we do */}
      <section>
        <div className="mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-28">
          <SectionHeading label="What we do" title="We do the early work, so a site is ready to build." />
          <ol className="mt-14 grid gap-px bg-[#BD9468]/15 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, i) => (
              <li key={step.title} className="bg-[#111D2B] p-7 sm:p-8">
                <p className="hc-eyebrow">{String(i + 1).padStart(2, '0')}</p>
                <h3 className="mt-5 text-[22px]">{step.title}</h3>
                <p className="hc-muted mt-4 text-[15px] leading-[1.7]">{step.text}</p>
              </li>
            ))}
          </ol>
          <p className="mt-10 text-[15px]">
            <Link href="/approach" className="hc-link">
              See our full process
            </Link>
          </p>
        </div>
      </section>

      {/* What we look for */}
      <section className="hc-cream">
        <div className="mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-28">
          <SectionHeading
            label="What we look for"
            title="The full infrastructure stack, on one site."
            intro="Most properties have one or two of these. The sites we pursue have, or can credibly reach, all of them."
          />
          <div className="mt-14 grid gap-x-14 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
            {CRITERIA.map((item) => (
              <div key={item.title} className="border-t border-[#111D2B]/15 pt-6">
                <h3 className="text-[20px]">{item.title}</h3>
                <p className="hc-muted mt-3 text-[15px] leading-[1.7]">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who we work with */}
      <section>
        <div className="mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-28">
          <SectionHeading label="Who we work with" title="Built around the people who bring and build sites." />
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {AUDIENCES.map((a) => (
              <div key={a.title} className="flex flex-col border border-[#BD9468]/20 p-7 sm:p-8">
                <h3 className="text-[22px]">{a.title}</h3>
                <p className="hc-muted mt-4 flex-1 text-[15px] leading-[1.7]">{a.text}</p>
                <p className="mt-7 text-[15px]">
                  <Link href="/contact" className="hc-link">
                    {a.cta}
                  </Link>
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
