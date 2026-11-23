import type { Metadata } from 'next';
import { CtaBand, PageHero, SectionHeading } from '@/components/site/blocks';

export const metadata: Metadata = {
  title: 'Approach',
  description:
    'A staged, gated process that takes land from first look to a build-ready site for modular AI inference data centers.',
};

const STAGES = [
  {
    title: 'Site control',
    text: 'Parcel identified and screened, ownership confirmed through title, the site visited and documented, and an option agreement executed.',
    gate: 'Site under option',
  },
  {
    title: 'Gas and power',
    text: 'Transmission pipeline identified, a third-party gas supply study commissioned, the gas utility engaged, and deliverable megawatts confirmed. Grid interconnection is assessed as backup or supplement.',
    gate: 'Gas and power confirmed',
  },
  {
    title: 'Water and environmental',
    text: 'Water availability and rights confirmed. A Phase I environmental site assessment is completed, with Phase II work and remediation scoped where needed.',
    gate: 'Environmental clear',
  },
  {
    title: 'Fiber and access',
    text: 'Fiber routes mapped, multiple carriers engaged, and last-mile cost and timeline estimated.',
    gate: 'Fiber path confirmed',
  },
  {
    title: 'Political and community',
    text: 'Municipal officials engaged early, community outreach begun, incentives explored, and community benefit agreements drafted where appropriate.',
    gate: 'Local alignment confirmed',
  },
  {
    title: 'Engineering and feasibility',
    text: 'Site engineer engaged, cooling approach and equipment assessed, zoning and the air-permit pathway confirmed, and a full financial model built.',
    gate: 'Engineering confirmed',
  },
  {
    title: 'Packaging and exit',
    text: 'The site is assembled into a certainty package and taken to buyers, or carried further into development.',
    gate: 'Transaction',
  },
];

const PACKAGE = [
  'Option or purchase agreement, with title work',
  'Gas supply study and utility will-serve or capacity letters',
  'Water availability and Phase I environmental site assessment',
  'Fiber route mapping and last-mile cost estimate',
  'Zoning confirmation and air-permit pathway',
  'Engineering, equipment and financial analysis',
  'Record of municipal and community engagement',
];

export default function ApproachPage() {
  return (
    <>
      <PageHero
        label="Our approach"
        title="A staged, gated process from raw land to a build-ready site."
        intro="Every site moves through seven stages. Each one ends in a go/no-go decision, so capital goes in only as risk comes out."
      />

      {/* Stages */}
      <section>
        <div className="mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-28">
          <ol className="border-t border-[#BD9468]/20">
            {STAGES.map((stage, i) => (
              <li
                key={stage.title}
                className="grid gap-4 border-b border-[#BD9468]/20 py-9 md:grid-cols-[120px_1fr_220px] md:gap-10 md:py-11"
              >
                <p className="hc-eyebrow pt-1">Stage {String(i + 1).padStart(2, '0')}</p>
                <div>
                  <h2 className="text-[24px] md:text-[28px]">{stage.title}</h2>
                  <p className="hc-muted mt-4 max-w-2xl text-[16px] leading-[1.75]">{stage.text}</p>
                </div>
                <div className="md:pt-2">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-[#A9B3C1]">
                    {i === STAGES.length - 1 ? 'Outcome' : 'Decision point'}
                  </p>
                  <p className="mt-2 text-[16px] text-[#BD9468]">{stage.gate}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Two paths */}
      <section className="hc-cream">
        <div className="mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-28">
          <SectionHeading label="At exit" title="Two paths, chosen site by site." />
          <div className="mt-12 grid gap-10 md:grid-cols-2 md:gap-14">
            <div className="border-t border-[#111D2B]/15 pt-6">
              <h3 className="text-[24px]">Sell</h3>
              <p className="hc-muted mt-4 text-[16px] leading-[1.75]">
                We sell de-risked sites to data center developers and operators at the point where our work saves
                them the most time: power confirmed, diligence complete and a clear path to construction.
              </p>
            </div>
            <div className="border-t border-[#111D2B]/15 pt-6">
              <h3 className="text-[24px]">Advance</h3>
              <p className="hc-muted mt-4 text-[16px] leading-[1.75]">
                Where it creates more value, we carry the strongest sites further into development before bringing
                in a long-term owner.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Certainty package */}
      <section>
        <div className="mx-auto grid max-w-6xl gap-14 px-6 py-20 md:grid-cols-2 md:px-10 md:py-28">
          <SectionHeading
            label="The certainty package"
            title="What a buyer receives."
            intro="Our work is designed to answer a buyer's diligence questions before they ask them. Contents vary by site."
          />
          <ul className="border-t border-[#BD9468]/20">
            {PACKAGE.map((item) => (
              <li key={item} className="flex gap-4 border-b border-[#BD9468]/20 py-5 text-[16px] leading-[1.6]">
                <span className="mt-[11px] block h-px w-4 shrink-0 bg-[#BD9468]" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
