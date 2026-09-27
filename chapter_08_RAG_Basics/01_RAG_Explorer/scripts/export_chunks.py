"""Emit chunk sets for several configs, for every document in data/.

Reuses the same text processing the live server runs (extract_pdf, normalise,
chunk_text), so the hosted build and the local pipeline chunk identically.

    python scripts/export_chunks.py     # -> scripts/chunks.json
    cd ui && node build-index.mjs       # -> ui/public/index.json (adds vectors)
"""
import json, sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from server.app import extract_pdf, normalise, chunk_text, DATA_DIR

CONFIGS = [(60, 20), (100, 20), (140, 30), (180, 40), (260, 50), (400, 80)]
PDF_SUFFIX = {".pdf"}
TEXT_SUFFIX = {".csv", ".txt", ".md"}
KEEP = ("id", "index", "text", "word_count", "char_count", "word_start", "word_end")


def load_document(path: Path) -> tuple[str, int, str]:
    """Extract text from one document. PDFs go through pypdf; text files are read as-is."""
    suffix = path.suffix.lower()
    if suffix in PDF_SUFFIX:
        raw, pages = extract_pdf(path)
        return raw, len(pages), "pdf"
    raw = path.read_text(encoding="utf-8", errors="replace")
    return raw, 1, suffix.lstrip(".")


paths = sorted(
    (p for p in DATA_DIR.iterdir() if p.suffix.lower() in PDF_SUFFIX | TEXT_SUFFIX),
    key=lambda p: p.name.lower(),
)
if not paths:
    sys.exit(f"no documents found in {DATA_DIR}")

out = {"documents": []}
for path in paths:
    raw, pages, kind = load_document(path)
    clean = normalise(raw)
    configs = []
    for size, overlap in CONFIGS:
        chunks = chunk_text(clean, size, overlap)
        configs.append(
            {
                "chunk_size": size,
                "overlap": overlap,
                "step": size - overlap,
                "chunks": [{k: c[k] for k in KEEP} for c in chunks],
            }
        )
    out["documents"].append(
        {
            "doc": {
                "filename": path.name,
                "kind": kind,
                "pages": pages,
                "raw_chars": len(raw),
                "clean_chars": len(clean),
                "words": len(clean.split()),
                "raw_sample": raw[:280],
                "clean_sample": clean[:280],
            },
            "configs": configs,
        }
    )
    print(f"  {kind:<4} {path.name}: {len(clean.split()):>5} words", file=sys.stderr)

Path("scripts/chunks.json").write_text(json.dumps(out))
print(f"wrote scripts/chunks.json for {len(out['documents'])} documents", file=sys.stderr)
