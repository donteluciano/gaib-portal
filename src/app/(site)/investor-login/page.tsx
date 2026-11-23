import type { Metadata } from 'next';
import Link from 'next/link';
import { CONTACT_EMAIL } from '@/components/site/content';

export const metadata: Metadata = {
  title: 'Investor access',
  robots: { index: false, follow: false },
};

export default function InvestorAccessPage() {
  return (
    <section>
      <div className="mx-auto max-w-2xl px-6 py-24 text-center md:py-36">
        <p className="hc-label">Investor access</p>
        <span className="hc-rule mx-auto mt-6" />
        <h1 className="mt-8 text-[32px] md:text-[40px]">Materials for our investors.</h1>
        <p className="hc-muted mx-auto mt-6 max-w-lg text-[17px] leading-[1.75]">
          Fund reporting and materials are provided directly to our investors. If you are an investor and need
          access, please contact us.
        </p>
        <div className="mt-10 flex flex-col items-center gap-6">
          <a href={`mailto:${CONTACT_EMAIL}`} className="hc-btn">
            Email us
          </a>
          <Link href="/" className="hc-link text-[15px]">
            Return to home
          </Link>
        </div>
      </div>
    </section>
  );
}
