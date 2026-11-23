// Shared content for the public website. Edit here to update every page at once.

export const FIRM_NAME = 'Herald Capital Partners';
export const LEGAL_NAME = 'Herald Capital Partners LLC';

// TODO: confirm this is the inbox you want public inquiries to show. It is on the old GAIB name.
export const CONTACT_EMAIL = 'info@gaibcapitalpartners.com';

export const SITE_DESCRIPTION =
  'Herald Capital Partners finds, secures and de-risks powered sites for modular AI inference data centers.';

export const NAV_LINKS = [
  { href: '/approach', label: 'Approach' },
  { href: '/about', label: 'About' },
  { href: '/team', label: 'Team' },
];

export type TeamMember = {
  name: string;
  title: string;
  initials: string;
  /** Optional one or two sentence background. Shown under the title when present. */
  bio?: string;
  /** Optional headshot path in /public, e.g. '/team/donte-bronaugh.jpg'. Initials are shown when absent. */
  photo?: string;
};

export const TEAM: TeamMember[] = [
  { name: 'Donte Bronaugh', title: 'Managing Partner', initials: 'DB' },
  { name: 'Lemar Boone', title: 'Partner', initials: 'LB' },
  { name: 'Benjamin Cobb', title: 'Partner', initials: 'BC' },
  { name: 'Daniel Hoddinott', title: 'Partner', initials: 'DH' },
  { name: 'Sean Thomas', title: 'Partner', initials: 'ST' },
];

export const INQUIRY_ROLES = ['Landowner', 'Broker', 'Developer / Operator', 'Other'] as const;
export type InquiryRole = (typeof INQUIRY_ROLES)[number];
