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
  { href: '/news', label: 'News' },
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
  {
    name: 'Donte Bronaugh',
    title: 'Managing Partner',
    initials: 'DB',
    bio: 'Previously at Hyperscale Data, where he worked on its 20 MW AI compute agreement at the company’s Michigan data center campus.',
  },
  { name: 'Lemar Boone', title: 'Partner', initials: 'LB' },
  { name: 'Benjamin Cobb', title: 'Partner', initials: 'BC' },
];

export type NewsItem = {
  /** Shown as written, e.g. 'June 2026'. */
  date: string;
  category: string;
  title: string;
  paragraphs: string[];
  link?: { href: string; label: string };
  /** Small print under the post. */
  note?: string;
};

// Newest first.
export const NEWS: NewsItem[] = [
  {
    date: 'June 2026',
    category: 'Team experience',
    title: '20 MW of AI compute capacity at Hyperscale Data’s Michigan campus',
    paragraphs: [
      'In a previous role at Hyperscale Data (NYSE American: GPUS), Managing Partner Donte Bronaugh worked on the master services agreement that its subsidiary Alliance Cloud Services signed with a California-based neocloud provider in June 2026.',
      'The agreement covers 20 megawatts of critical AI compute capacity at the company’s Michigan data center campus, expected to be operational in the fourth quarter of 2026, with an option for the customer to expand to 52 megawatts. Hyperscale Data has said it expects the initial deployment to generate more than $1.2 billion in revenue if the agreement runs its full term.',
      'The project turned an existing powered site into AI compute capacity. It reflects the thesis behind Herald: power is the constraint, and sites that can deliver it quickly are the most valuable.',
    ],
    link: {
      href: 'https://www.nasdaq.com/press-release/hyperscale-data-executes-first-master-services-agreement-california-based-neocloud',
      label: 'Read Hyperscale Data’s announcement',
    },
    note: 'Herald Capital Partners was not a party to this transaction. Figures are as reported by Hyperscale Data.',
  },
];

export const INQUIRY_ROLES = ['Landowner', 'Broker', 'Developer / Operator', 'Other'] as const;
export type InquiryRole = (typeof INQUIRY_ROLES)[number];
