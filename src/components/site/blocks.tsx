import Link from 'next/link';

/** Top-of-page heading block used on inner pages. */
export function PageHero({
  label,
  title,
  intro,
}: {
  label: string;
  title: string;
  intro?: string;
}) {
  return (
    <section className="border-b border-[#BD9468]/15">
      <div className="mx-auto max-w-6xl px-6 pb-16 pt-16 md:px-10 md:pb-24 md:pt-24">
        <p className="hc-label">{label}</p>
        <span className="hc-rule mt-6" />
        <h1 className="mt-8 max-w-3xl text-[34px] sm:text-[44px] md:text-[54px]">{title}</h1>
        {intro && <p className="hc-muted mt-6 max-w-2xl text-[17px] leading-[1.7] md:text-[19px]">{intro}</p>}
      </div>
    </section>
  );
}

/** Section heading: Perandory label, brass rule, Didact Gothic headline. */
export function SectionHeading({
  label,
  title,
  intro,
}: {
  label: string;
  title: string;
  intro?: string;
}) {
  return (
    <div className="max-w-3xl">
      <p className="hc-label">{label}</p>
      <span className="hc-rule mt-5" />
      <h2 className="mt-7 text-[28px] sm:text-[34px] md:text-[40px]">{title}</h2>
      {intro && <p className="hc-muted mt-5 text-[17px] leading-[1.7]">{intro}</p>}
    </div>
  );
}

/** Closing call to action used at the bottom of most pages. */
export function CtaBand({
  title = 'Have a site that fits?',
  text = 'Tell us about it. Submissions go directly to our team.',
  cta = 'Submit a site',
}: {
  title?: string;
  text?: string;
  cta?: string;
}) {
  return (
    <section className="hc-cream">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-16 md:flex-row md:items-center md:justify-between md:px-10 md:py-20">
        <div>
          <h2 className="text-[28px] md:text-[34px]">{title}</h2>
          <p className="hc-muted mt-3 text-[17px]">{text}</p>
        </div>
        <Link href="/contact" className="hc-btn self-start md:self-auto">
          {cta}
        </Link>
      </div>
    </section>
  );
}
