// Tests for the Evaluate a Job form validation.
// The form has required fields (Company Name, Designation, Job description).
// Resume presence is enforced by the Evaluate page (upload flow), not by the
// form validator — so an empty resume still passes form validation.

import { describe, expect, it } from 'vitest';
import { validateEvaluateJobInput } from '../../../src/evaluate-job/validators';

describe('validateEvaluateJobInput', () => {
  const valid = {
    company: 'Acme',
    designation: 'Engineer',
    jobDescription: 'JD text',
  };

  it('accepts a valid form', () => {
    expect(validateEvaluateJobInput(valid)).toEqual({});
  });

  it('requires company name', () => {
    const errors = validateEvaluateJobInput({ ...valid, company: '  ' });
    expect(errors.company).toBeDefined();
  });

  it('requires designation', () => {
    const errors = validateEvaluateJobInput({ ...valid, designation: '' });
    expect(errors.designation).toBeDefined();
  });

  it('requires job description', () => {
    const errors = validateEvaluateJobInput({ ...valid, jobDescription: '' });
    expect(errors.jobDescription).toBeDefined();
  });

  it('does not require resume text (uploaded via the file flow)', () => {
    // The old behavior required resumeText; now the page gates on upload.
    expect(validateEvaluateJobInput(valid)).not.toHaveProperty('resumeText');
  });
});
