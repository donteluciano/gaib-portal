import type { Metadata } from 'next';
import { CtaBand, PageHero } from '@/components/site/blocks';
import { TEAM } from '@/components/site/content';

export const metadata: Metadata = {
  title: 'Team',
  description: 'The partners of Herald Capital Partners.',
};

export default function TeamPage() {
  return (
    <>
      <PageHero
        label="Team"
        title="The partners."
        intro="Herald is a small partnership. The people listed here are directly involved in sourcing, diligence and execution on every site."
      />

      <section>
        <div className="mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-28">
          <ul className="flex flex-wrap justify-center gap-x-8 gap-y-14">
            {TEAM.map((person) => (
              <li key={person.name} className="w-full max-w-[300px] sm:w-[calc(50%-16px)] lg:w-[calc(33.333%-22px)]">
                <div className="flex aspect-square w-full items-center justify-center overflow-hidden border border-[#BD9468]/25 bg-[#18283B]">
                  {person.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={person.photo} alt={person.name} className="h-full w-full object-cover" />
                  ) : (
                    <span className="hc-wordmark text-[40px] text-[#BD9468]" aria-hidden="true">
                      {person.initials}
                    </span>
                  )}
                </div>
                <h2 className="mt-6 text-[22px]">{person.name}</h2>
                <p className="hc-eyebrow mt-2">{person.title}</p>
                {person.bio && <p className="hc-muted mt-4 text-[15px] leading-[1.7]">{person.bio}</p>}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <CtaBand title="Work with us" text="Landowners, brokers and developers: we would like to hear from you." cta="Get in touch" />
    </>
  );
}
