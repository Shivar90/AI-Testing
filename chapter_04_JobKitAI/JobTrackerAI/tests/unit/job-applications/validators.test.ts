// Tests for Job Application form validation.
// Requirements.md: "The form should validate required fields before saving";
// company and role are required.

import { describe, expect, it } from 'vitest';
import { validateJobForm } from '../../../src/job-applications/validators';

describe('validateJobForm', () => {
  it('accepts a valid form', () => {
    expect(
      validateJobForm({ company: 'Acme', role: 'Engineer', dateApplied: '2026-08-22' }),
    ).toEqual({});
  });

  it('requires company name', () => {
    const errors = validateJobForm({ company: '  ', role: 'Engineer', dateApplied: '2026-08-22' });
    expect(errors.company).toBeDefined();
  });

  it('requires role', () => {
    const errors = validateJobForm({ company: 'Acme', role: '', dateApplied: '2026-08-22' });
    expect(errors.role).toBeDefined();
  });

  it('requires a valid applied date', () => {
    const errors = validateJobForm({ company: 'Acme', role: 'Engineer', dateApplied: 'nope' });
    expect(errors.dateApplied).toBeDefined();
  });
});
