import type { Metadata } from 'next';
import { PageHero } from '@/components/site/blocks';
import { CONTACT_EMAIL } from '@/components/site/content';
import ContactForm from './ContactForm';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Submit a site or get in touch with Herald Capital Partners.',
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        label="Contact"
        title="Tell us about your site."
        intro="Whether you own land or a building, represent a seller or develop data centers, we would like to hear from you. Submissions go directly to our team."
      />

      <section>
        <div className="mx-auto grid max-w-6xl gap-14 px-6 py-16 md:grid-cols-[1fr_1.6fr] md:gap-20 md:px-10 md:py-24">
          <div className="space-y-10">
            <div>
              <p className="hc-label">What helps</p>
              <span className="hc-rule mt-5" />
              <p className="hc-muted mt-6 text-[16px] leading-[1.75]">
                For a property, the location, the acreage or building size, and anything you know about nearby gas transmission lines,
                substations or fiber. Partial information is fine. We will follow up with questions.
              </p>
            </div>
            <div>
              <p className="hc-label">Email</p>
              <span className="hc-rule mt-5" />
              <p className="mt-6 text-[16px]">
                <a href={`mailto:${CONTACT_EMAIL}`} className="hc-link break-all">
                  {CONTACT_EMAIL}
                </a>
              </p>
            </div>
          </div>

          <ContactForm />
        </div>
      </section>
    </>
  );
}
