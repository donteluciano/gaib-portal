'use client';

import { useState } from 'react';
import { CONTACT_EMAIL, INQUIRY_ROLES } from '@/components/site/content';

type Status = 'idle' | 'submitting' | 'success' | 'error';

export default function ContactForm() {
  const [status, setStatus] = useState<Status>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [role, setRole] = useState<string>(INQUIRY_ROLES[0]);

  const isSiteSubmission = role === 'Property owner' || role === 'Broker';

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('submitting');
    setErrorMessage('');

    const data = Object.fromEntries(new FormData(event.currentTarget).entries());

    try {
      const response = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.error || 'Something went wrong.');
      }
      setStatus('success');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Something went wrong.');
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div className="border border-[#BD9468]/30 p-8 md:p-10" role="status">
        <span className="hc-rule" />
        <h2 className="mt-6 text-[26px]">Thank you.</h2>
        <p className="hc-muted mt-4 text-[16px] leading-[1.7]">
          Your submission has been received and will be reviewed by our team.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate={false}>
      {/* Honeypot for spam bots. Hidden from people and screen readers. */}
      <div className="hc-sr-only" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="hc-field">
        <label htmlFor="role">I am a</label>
        <select
          id="role"
          name="role"
          className="hc-input"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          {INQUIRY_ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="hc-field">
          <label htmlFor="firstName">First name *</label>
          <input id="firstName" name="firstName" required autoComplete="given-name" className="hc-input" />
        </div>
        <div className="hc-field">
          <label htmlFor="lastName">Last name *</label>
          <input id="lastName" name="lastName" required autoComplete="family-name" className="hc-input" />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="hc-field">
          <label htmlFor="email">Email *</label>
          <input id="email" name="email" type="email" required autoComplete="email" className="hc-input" />
        </div>
        <div className="hc-field">
          <label htmlFor="phone">Phone</label>
          <input id="phone" name="phone" type="tel" autoComplete="tel" className="hc-input" />
        </div>
      </div>

      <div className="hc-field">
        <label htmlFor="company">Company</label>
        <input id="company" name="company" autoComplete="organization" className="hc-input" />
      </div>

      {isSiteSubmission && (
        <fieldset className="space-y-6 border-t border-[#BD9468]/20 pt-8">
          <p className="hc-eyebrow">Site details</p>
          <div className="hc-field">
            <label htmlFor="address">Address or parcel ID</label>
            <input id="address" name="address" className="hc-input" />
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="hc-field">
              <label htmlFor="city">City</label>
              <input id="city" name="city" className="hc-input" />
            </div>
            <div className="hc-field">
              <label htmlFor="county">County</label>
              <input id="county" name="county" className="hc-input" />
            </div>
            <div className="hc-field">
              <label htmlFor="state">State</label>
              <input id="state" name="state" autoComplete="address-level1" className="hc-input" />
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="hc-field">
              <label htmlFor="acreage">Approximate acreage</label>
              <input id="acreage" name="acreage" inputMode="decimal" className="hc-input" />
            </div>
            <div className="hc-field">
              <label htmlFor="askingPrice">Asking price (optional)</label>
              <input id="askingPrice" name="askingPrice" className="hc-input" />
            </div>
          </div>
          <div className="hc-field">
            <label htmlFor="currentUse">Existing buildings and current use</label>
            <input
              id="currentUse"
              name="currentUse"
              className="hc-input"
              placeholder="e.g. 60,000 sq ft vacant warehouse, or open farmland"
            />
          </div>
        </fieldset>
      )}

      <div className="hc-field">
        <label htmlFor="message">{isSiteSubmission ? 'Anything else we should know?' : 'Message'}</label>
        <textarea
          id="message"
          name="message"
          className="hc-input"
          placeholder={
            isSiteSubmission
              ? 'Nearby gas lines, substations or fiber, timing, anything else...'
              : 'How can we help?'
          }
        />
      </div>

      {status === 'error' && (
        <p className="border border-[#BD9468]/40 px-4 py-3 text-[15px]" role="alert">
          {errorMessage} You can also email us at{' '}
          <a href={`mailto:${CONTACT_EMAIL}`} className="hc-link">
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      )}

      <button type="submit" className="hc-btn w-full sm:w-auto" disabled={status === 'submitting'}>
        {status === 'submitting' ? 'Sending...' : 'Submit'}
      </button>
    </form>
  );
}
