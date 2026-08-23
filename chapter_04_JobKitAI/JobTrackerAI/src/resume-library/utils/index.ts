// Helpers for displaying and ranking saved resumes in dropdowns.
// From "Resume Tailoring workflow.md": show a useful label, rank resumes
// matching the current company/job title first, keep all others selectable.

import type { SavedResume } from '../types';

export function savedResumeLabel(resume: SavedResume): string {
  const company = resume.companyName ? ` — ${resume.companyName}` : '';
  const title = resume.jobTitle ? ` — ${resume.jobTitle}` : '';
  const date = resume.createdAt
    ? ` — ${new Date(resume.createdAt).toLocaleDateString()}`
    : '';
  return `${resume.name}${company}${title}${date}`;
}

/**
 * Rank non-archived resumes: those whose company OR job title matches the
 * given values sort first; the rest remain selectable below.
 */
export function rankSavedResumes(
  resumes: SavedResume[],
  company: string,
  jobTitle: string,
): SavedResume[] {
  const qCompany = company.trim().toLowerCase();
  const qTitle = jobTitle.trim().toLowerCase();
  const active = resumes.filter((r) => !r.isArchived);
  return [...active].sort((a, b) => {
    const aMatch =
      (qCompany && a.companyName?.toLowerCase().includes(qCompany)) ||
      (qTitle && a.jobTitle?.toLowerCase().includes(qTitle));
    const bMatch =
      (qCompany && b.companyName?.toLowerCase().includes(qCompany)) ||
      (qTitle && b.jobTitle?.toLowerCase().includes(qTitle));
    if (aMatch && !bMatch) return -1;
    if (bMatch && !aMatch) return 1;
    return 0;
  });
}
