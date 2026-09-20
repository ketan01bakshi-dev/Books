# Build & Pilot Roadmap

Framed on Mortimer Adler's four levels of reading (*How to Read a Book*).
Each phase both *builds the feature* and *is itself* that level of reading,
applied to the product's own maturity. Phase 4 (Syntopical) is the
commercial wedge — "many books, one understanding" is the feature nothing
else in the market does well (see competitor analysis).

Schema referenced throughout: `schema/book-graph.schema.json` (single book)
and `schema/master-graph.schema.json` (cross-book synthesis).

---

## Phase 0 — Foundation & migration (Weeks 1–2)

*Before any reading level: get one honest floor under the three existing PRs.*

- Migrate the 3 existing book graphs (`the-wisdom-bridge`, `python-pdsa`,
  `mans-search-for-meaning`) into the standardized schema.
- Pick **one** renderer (vis-network, already used in PR #3, is the pragmatic
  default — retire the hand-rolled SVG approach from PR #4).
- Consolidate PRs #1–#4 into one canonical structure on `main`; close the
  divergence between the Cursor-authored and Claude-authored formats.
- Add a schema validator (ajv or similar) to CI so every new book graph is
  checked before merge.

**Exit criteria:** all 3 books render from one viewer using one schema; no
book-specific rendering code remains.

---

## Phase 1 — Elementary: "read the words" (Weeks 3–5)

*Get raw content into the system reliably, at low marginal cost per book.*

- Build the authoring pipeline: chapter/section text → LLM draft extraction
  into schema-valid JSON → human curation pass (a simple editor is enough;
  polish comes later).
- Add 5–7 more books spanning different genres (memoir, technical,
  self-help) to stress-test the schema — this is where hidden assumptions
  in the node/edge model surface.
- Flag `copyrightStatus` and `curationStatus` on every book from day one;
  block anything not `human-reviewed` from ever reaching a paid tier.

**Exit criteria:** time-to-produce one new book graph is measured and
trending down (target: <4 hours of human curation time per book by end of
phase); schema needed zero breaking changes across the new books.

---

## Phase 2 — Inspectional: "get the overview" (Weeks 6–8)

*Skim-level UX — orientation before depth.*

- Library home: browse/search across all books.
- Collapsed default view = themes only (inspectional depth); nothing below
  `readingLevel: analytical` renders until a user expands a branch.
- Mobile-first pass: pan/zoom tested at phone width, dark/light theme parity.
- Ship a public read-only preview (3 free books) to get first outside
  feedback — this is the first point real users touch the product.

**Exit criteria:** a first-time user can find a book and get oriented (grasp
its top-level themes) in under 60 seconds, verified with 5–10 usability
sessions.

---

## Phase 3 — Analytical: "debate with the book" (Weeks 9–12)

*Full single-book depth — this is what PRs #1, #2, #4 already demonstrate;
this phase generalizes and polishes it.*

- Full click-to-expand interaction down to `concept` / `quote` / `example`
  nodes, with the dotted `relates_to` cross-links (per PR #4's pattern)
  rendered book-wide, not just within one theme.
- Lightweight personal layer: user notes/highlights attached to nodes (their
  own "debate" with the author) — local storage is fine at this stage, no
  backend needed yet.
- Complete full analytical-depth graphs for the ~10 pilot books.

**Exit criteria:** session-depth metric shows real exploration (users expand
more than N nodes per session, not just skim the top level); qualitative
feedback shows people engaging past what a linear summary (Blinkist-style)
would give them.

---

## Phase 4 — Syntopical: "many books, one understanding" (Weeks 13–18)

*The actual product differentiator and the commercialization test.*

Build the master graph engine directly on `schema/master-graph.schema.json`,
following Adler's four syntopical steps as literal features:

1. **Frame your own question** → `questions[]` — a query mode where a user
   poses a question and gets a synthesized answer pulled from multiple
   books' nodes (`answeringNodeIds`).
2. **Learn the history of the book** → surfaced via existing `book` metadata
   (author, year, context) shown alongside any cross-book answer, so a
   position is never presented unmoored from its source.
3. **Build your vocabulary** → `vocabularyClusters[]` — unify terms that
   different authors use for the same idea (e.g. Frankl's "logotherapy" vs.
   *The Wisdom Bridge*'s "preparation," both clustered under
   "meaning-through-discipline" in the worked example).
4. **Find the point of conflict** → `conflictClusters[]` — explicitly modeled
   disagreements between books on the same question. This is the highest-
   value, least-automatable content in the product; budget real curator
   time here, not just LLM drafts.

Commercial test:
- Curate 2–3 flagship syntopical questions across the pilot's ~10 books as a
  showcase (marketing asset + proof of the differentiator).
- Put the master/syntopical graph and question mode behind a paywall; single-
  book graphs stay free.
- Run the actual pilot: measure free→paid conversion specifically for
  syntopical access.

**Exit criteria (go/no-go gate):** conversion rate on the syntopical paywall
tells you whether to invest in scaling content production (more books,
publisher licensing deals) or to pivot the model. This is the point where
"can we commercialize this" gets an actual answer instead of a guess.

---

## After Phase 4

- If conversion validates: invest in the authoring pipeline's throughput
  (this is the real bottleneck at scale, not the viewer) and pursue
  publisher/author partnerships for official companion graphs.
- If it doesn't: the single-book analytical graphs (Phase 3) may still stand
  alone as a Blinkist-style product without the syntopical layer — cheaper
  to run, smaller differentiation, but a fallback rather than a dead end.
