import type { Status } from './index';

/** Ordered Kanban columns — the six approved statuses (Requirements.md). */
export const COLUMNS: { id: Status; label: string }[] = [
  { id: 'wishlist', label: 'Wishlist' },
  { id: 'applied', label: 'Applied' },
  { id: 'follow-up', label: 'Follow-up' },
  { id: 'interview', label: 'Interview' },
  { id: 'offer', label: 'Offer' },
  { id: 'rejected', label: 'Rejected' },
];

export const STATUS_LABELS: Record<Status, string> = COLUMNS.reduce(
  (acc, c) => {
    acc[c.id] = c.label;
    return acc;
  },
  {} as Record<Status, string>,
);

/** Tailwind accent classes per status (screenshot: left-border color coding). */
export const STATUS_ACCENTS: Record<Status, string> = {
  wishlist: 'border-accent-wishlist',
  applied: 'border-accent-applied',
  'follow-up': 'border-accent-follow-up',
  interview: 'border-accent-interview',
  offer: 'border-accent-offer',
  rejected: 'border-accent-rejected',
};

/** Solid background classes per status (used for buttons / badges). */
export const STATUS_BG: Record<Status, string> = {
  wishlist: 'bg-accent-wishlist',
  applied: 'bg-accent-applied',
  'follow-up': 'bg-accent-follow-up',
  interview: 'bg-accent-interview',
  offer: 'bg-accent-offer',
  rejected: 'bg-accent-rejected',
};