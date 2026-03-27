**Output contract (strict)**:
- Return **only** a valid JSON object, with no markdown wrapper and no extra text.
- Use exactly this shape:
  - `summary`: string (<= 200 words)
  - `one_line_summary`: string (<= 100 chars)
- Do not output headings, bullets, or prose outside the JSON object.

Include:
- 3–7 bullet **Highlights** (facts learned, reductions, counterexamples, partial bounds).
- 1–3 **Open questions / TODOs** for the next round.
- 1–3 **Citations to files** you relied on (e.g. round files or papers by name).
