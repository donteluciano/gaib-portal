import type { Metadata } from 'next';
import { CtaBand, PageHero } from '@/components/site/blocks';
import { NEWS } from '@/components/site/content';

export const metadata: Metadata = {
  title: 'News',
  description: 'Firm updates and team experience from Herald Capital Partners.',
};

export default function NewsPage() {
  return (
    <>
      <PageHero label="News" title="News and experience." intro="Firm updates, and the work our team has done." />

      <section>
        <div className="mx-auto max-w-6xl px-6 py-16 md:px-10 md:py-24">
          <div className="border-t border-[#BD9468]/20">
            {NEWS.map((item) => (
              <article
                key={item.title}
                className="grid gap-6 border-b border-[#BD9468]/20 py-12 md:grid-cols-[200px_1fr] md:gap-12 md:py-16"
              >
                <div>
                  <p className="hc-eyebrow">{item.category}</p>
                  <p className="hc-muted mt-2 text-[15px]">{item.date}</p>
                </div>
                <div className="max-w-2xl">
                  <h2 className="text-[26px] md:text-[32px]">{item.title}</h2>
                  <div className="hc-muted mt-6 space-y-5 text-[17px] leading-[1.8]">
                    {item.paragraphs.map((p) => (
                      <p key={p}>{p}</p>
                    ))}
                  </div>
                  {item.link && (
                    <p className="mt-8 text-[15px]">
                      <a href={item.link.href} target="_blank" rel="noopener noreferrer" className="hc-link">
                        {item.link.label}
                      </a>
                    </p>
                  )}
                  {item.note && <p className="mt-8 text-[13px] leading-relaxed text-[#A9B3C1]/80">{item.note}</p>}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
