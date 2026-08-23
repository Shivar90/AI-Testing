// Form validation for the Evaluate a Job domain.
// Requirements.md defines the Evaluate Job board fields: Company Name,
// Designation, Job description. Company name and designation are required
// fields. The resume is supplied by an uploaded file (PDF/DOCX) and its
// presence is enforced by the Evaluate page, not this form validator.

export interface EvaluateJobValidationErrors {
  company?: string;
  designation?: string;
  jobDescription?: string;
}

export function validateEvaluateJobInput(data: {
  company: string;
  designation: string;
  jobDescription: string;
}): EvaluateJobValidationErrors {
  const errors: EvaluateJobValidationErrors = {};
  if (!data.company.trim()) {
    errors.company = 'Company name is required.';
  }
  if (!data.designation.trim()) {
    errors.designation = 'Designation is required.';
  }
  if (!data.jobDescription.trim()) {
    errors.jobDescription = 'Job description is required.';
  }
  return errors;
}
