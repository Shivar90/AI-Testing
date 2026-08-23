// Form validation for the Job Application domain.
// Guards precisely what Requirements.md marks required: company and role are
// required; every other field is optional. LinkedIn URL stays clickable when set.

export interface ValidationErrors {
  company?: string;
  role?: string;
  dateApplied?: string;
}

export function validateJobForm(data: {
  company: string;
  role: string;
  dateApplied: string;
}): ValidationErrors {
  const errors: ValidationErrors = {};
  if (!data.company.trim()) {
    errors.company = 'Company name is required.';
  }
  if (!data.role.trim()) {
    errors.role = 'Job title / role is required.';
  }
  if (!data.dateApplied || Number.isNaN(Date.parse(data.dateApplied))) {
    errors.dateApplied = 'A valid date applied is required.';
  }
  return errors;
}