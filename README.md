# Books

Explorable knowledge graphs for books — see [ROADMAP.md](ROADMAP.md) for the product framing (built around Adler's four levels of reading).

**Live site (once GitHub Pages is enabled, see below):** `https://<owner>.github.io/Books/`

## Structure

- `schema/` — JSON Schema for a single book's graph (`book-graph.schema.json`) and for cross-book synthesis (`master-graph.schema.json`), plus worked examples.
- `subjects.json` (mirrored into `site/subjects.json`) — the subject taxonomy: which books belong to Coding vs. Human Psychology. Add a subject or move a book here, not by restructuring folders.
- `site/` — the deployable static site (GitHub Pages source):
  - `index.html` — library landing page: book grid, subject tiles, and the "Master of All" cross-subject graph.
  - `viewer.html` + `assets/viewer.js` — one shared vis-network viewer for every graph, parameterized by `?graph=<path>`.
  - `books/<id>/graph.json` — each book's graph, conforming to `schema/book-graph.schema.json`.
  - `subjects/<id>/master.json` — each subject's cross-book synthesis graph, conforming to `schema/master-graph.schema.json`.
  - `subjects/master/master.json` — the top-level graph spanning every book.
- `scripts/validate_graphs.py` — validates every `graph.json`/`master.json` against the schemas; run in CI on every PR.

## Enabling GitHub Pages (one-time, manual)

The `.github/workflows/deploy-pages.yml` workflow deploys `site/` automatically on every push to `main`, but the *first* deployment needs Pages switched on for this repository:

1. Go to **Settings → Pages**.
2. Under **Build and deployment → Source**, choose **GitHub Actions**.
3. Push to `main` (or re-run the `Deploy site to GitHub Pages` workflow) — the site will publish to `https://<owner>.github.io/Books/`.

## Adding a book

1. Create `site/books/<book-id>/graph.json` conforming to `schema/book-graph.schema.json`.
2. Add it to `site/subjects.json` under the right subject's `bookIds` (or a new subject).
3. If it joins an existing subject, add real cross-book synthesis (`questions`, `vocabularyClusters`, `conflictClusters`) to that subject's `master.json` — don't leave it as just an added `sourceBooks` entry with nothing else populated.
4. Run `python scripts/validate_graphs.py` before opening a PR.
