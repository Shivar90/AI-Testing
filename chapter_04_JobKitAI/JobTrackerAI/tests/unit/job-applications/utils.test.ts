// Tests for the Job Application board helpers.
// Requirements.md: card shows days since applied / relative time; LinkedIn URL
// is clickable; unique stable ids (ARCHITECTURE §8).

import { describe, expect, it, vi, afterEach } from 'vitest';
import {
  daysSinceApplied,
  generateId,
  isValidHttpUrl,
  timeAgo,
  toInputDate,
} from '../../../src/job-applications/utils';

describe('generateId', () => {
  it('returns a unique, non-derived id', () => {
    const a = generateId();
    const b = generateId();
    expect(a).not.toBe(b);
    expect(a).toMatch(/^[0-9a-f-]{36}$/i);
  });
});

describe('timeAgo', () => {
  afterEach(() => {
    vi.useRealTimers();
  });
  it('returns "just now" for recent dates', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-22T12:00:00Z'));
    expect(timeAgo(new Date('2026-08-22T11:59:40Z').toISOString())).toBe(
      'just now',
    );
  });
  it('returns hours/days labels', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-22T12:00:00Z'));
    expect(timeAgo(new Date('2026-08-22T11:00:00Z').toISOString())).toBe(
      '1 hour ago',
    );
    expect(timeAgo(new Date('2026-08-20T12:00:00Z').toISOString())).toBe(
      '2 days ago',
    );
  });
  it('returns empty string for invalid dates', () => {
    expect(timeAgo('not-a-date')).toBe('');
  });
});

describe('daysSinceApplied', () => {
  afterEach(() => {
    vi.useRealTimers();
  });
  it('computes days since the applied date', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-22T12:00:00Z'));
    expect(daysSinceApplied(new Date('2026-08-19T12:00:00Z').toISOString())).toBe(3);
  });
  it('returns 0 for invalid dates', () => {
    expect(daysSinceApplied('nope')).toBe(0);
  });
});

describe('isValidHttpUrl', () => {
  it('accepts http/https links', () => {
    expect(isValidHttpUrl('https://www.linkedin.com/jobs/view/123')).toBe(true);
    expect(isValidHttpUrl('http://example.com')).toBe(true);
  });
  it('rejects non-http and garbage', () => {
    expect(isValidHttpUrl('javascript:alert(1)')).toBe(false);
    expect(isValidHttpUrl('ftp://example.com')).toBe(false);
    expect(isValidHttpUrl('not a url')).toBe(false);
    expect(isValidHttpUrl(undefined)).toBe(false);
  });
});

describe('toInputDate', () => {
  it('formats an ISO date as yyyy-mm-dd', () => {
    expect(toInputDate('2026-08-22T10:00:00Z')).toBe('2026-08-22');
  });
  it('returns empty for invalid dates', () => {
    expect(toInputDate('garbage')).toBe('');
  });
});
