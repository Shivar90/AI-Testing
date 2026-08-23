// Resume text extraction from uploaded files (PDF and DOCX).
// PDFs are parsed with pdfjs-dist; DOCX with mammoth. Both are user-authorized
// additions so the Evaluate page can take a real resume file instead of pasted
// text. Extraction happens fully in the browser — nothing is uploaded.
//
// The libraries are imported lazily (dynamic import) so this module can be
// unit-tested without loading the real PDF worker in Node.

export type ResumeFileKind = 'pdf' | 'docx' | 'unsupported';

export function detectResumeKind(fileName: string): ResumeFileKind {
  const lower = fileName.toLowerCase();
  if (lower.endsWith('.pdf')) return 'pdf';
  if (lower.endsWith('.docx')) return 'docx';
  return 'unsupported';
}

/**
 * Extract plain text from a resume file. Throws a descriptive Error for
 * unsupported file types or unreadable documents.
 */
export async function extractResumeText(file: File): Promise<string> {
  const kind = detectResumeKind(file.name);
  if (kind === 'pdf') return extractPdfText(file);
  if (kind === 'docx') return extractDocxText(file);
  throw new Error(
    'Unsupported file type. Please upload a PDF (.pdf) or Word (.docx) resume.',
  );
}

async function extractPdfText(file: File): Promise<string> {
  const { getDocument, GlobalWorkerOptions } = await import('pdfjs-dist');
  // The worker ships inside pdfjs-dist; point Vite at the ESM worker bundle.
  GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.mjs',
    import.meta.url,
  ).toString();

  const data = new Uint8Array(await file.arrayBuffer());
  const pdf = await getDocument({ data }).promise;
  const parts: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    // Re-join text items with spaces so separate tokens don't glue together.
    let lastY: number | null = null;
    let line = '';
    for (const item of content.items) {
      if ('str' in item) {
        if (lastY !== null && Math.abs(item.transform[5] - lastY) > 2) {
          parts.push(line);
          line = '';
        }
        line += line && item.str && !item.str.startsWith(' ') ? ' ' : '';
        line += item.str;
        lastY = item.transform[5];
      }
    }
    if (line) parts.push(line);
  }
  const text = parts.join('\n').replace(/\n{3,}/g, '\n\n').trim();
  if (!text) {
    throw new Error('Could not read any text from this PDF (scanned image?).');
  }
  return text;
}

async function extractDocxText(file: File): Promise<string> {
  const mammoth = await import('mammoth');
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  const text = result.value.trim();
  if (!text) {
    throw new Error('Could not read any text from this DOCX file.');
  }
  return text;
}
