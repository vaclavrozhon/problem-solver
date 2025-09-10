# Research Notes



# Round 1 — Setup and Missing Information

Status: The exact statement of Conjecture 7.2 is not available. We cannot proceed with proof/disproof or auditing without it.

Requested information (RFI):
- Verbatim text of Conjecture 7.2, including all hypotheses, variable ranges, and quantifiers.
- Definitions/notation from earlier sections that 7.2 depends on.
- Subject area/context (e.g., combinatorics, number theory, analysis, geometry) and the role of 7.2.
- Any known special cases, partial results, or previously verified instances.
- Computational constraints (time/space limits) for small-case exploration if needed.

Proposed workflow once 7.2 is provided:
1) Formalization: Rewrite the conjecture precisely; isolate parameters; identify implicit assumptions.
2) Sanity checks: Evaluate trivial/edge cases (small n, degenerate structures, extremal parameter values). Record any immediate necessary conditions.
3) Counterexample search: Design a small-instance enumeration/testing harness tailored to the domain (e.g., Sage/Pari for arithmetic, NetworkX/SAT/ILP for graphs/combinatorics). Define stopping criteria and logging format.
4) Structural approach: Attempt reductions (monotonicity, subadditivity, hereditary properties), identify invariants, and explore canonical forms.
5) Proof avenues: Map applicable standard techniques (e.g., compactness, extremal combinatorics, spectral bounds, convexity/majorization, regularity, concentration inequalities). Draft candidate lemmas.
6) Documentation: Keep clean separation—exploratory notes here; fully-verified results in proofs.md; only major milestones in output.md.

Risk register (potential failure modes to test early):
- Boundary/degenerate counterexamples violating hidden assumptions.
- Dependence on non-stated regularity/positivity conditions.
- Non-equivalence between common reformulations (ensure implications are two-sided before using them).

Next actions pending RFI:
- Await the exact statement and definitions.
- Once received, immediately execute steps (1)–(3), then triage based on findings.

# Round 2 — Coordination While Awaiting the Statement

Status: Still blocked by the absence of the verbatim statement of Conjecture 7.2 and its dependent definitions/notation.

What we need (RFI reiteration):
- Exact text of Conjecture 7.2 with all hypotheses, quantifiers, domains.
- Any definitions/lemmas it depends on (paste directly for completeness).
- Context: subject area and how 7.2 connects to prior results.
- Known special cases or computational evidence, if any.

Readiness plan (to execute immediately after receiving 7.2):
- Formalization: restate the conjecture self-contained; list parameters; identify edge/degenerate cases; note any monotonicity/closure properties.
- Edge-case checklist: test trivial parameter values (e.g., smallest sizes, zero/empty structures, extremal bounds). Record any immediate necessary conditions.
- Counterexample search template: define instance generator; property checker; logging schema (instance, parameters, pass/fail, witness); stopping rules for small cases.
- Structural toolkit mapping: identify candidate techniques (e.g., compactness, extremal arguments, spectral/convex tools) aligned with the conjecture’s domain.

Division of labor proposal:
- Prover A: formalization + immediate corollaries/normal forms.
- Prover B: implement small-instance enumeration/testing and report minimal counterexamples if found.
- Prover C: literature scan for related theorems/lemmas to reuse and potential equivalences.

Documentation discipline:
- Only exploratory ideas here in notes.md.
- Fully verified lemmas/proofs go to proofs.md with complete details.
- output.md updated only for decisive milestones (proof, disproof, or sharp bounds).

Blocking risks:
- Ambiguous quantifiers or hidden assumptions.
- Heavy dependence on earlier definitions not restated.
- Computational intractability without problem-specific pruning.


# Round 3 — Escalation and Information Requirements

Status: Blocked by the absence of the verbatim statement of Conjecture 7.2 and its prerequisite definitions.

Immediate RFI (high priority):
- Paste the exact text of Conjecture 7.2 and all referenced definitions/lemmas.
- Include the surrounding context (paragraphs) to capture conventions and hidden assumptions.
- Provide known special cases, extremal examples, or computational evidence.
- State subject area and how 7.2 relates to earlier results (strengthening, generalization, equivalence, bound, etc.).

Intake checklist (to apply as soon as 7.2 is received):
- Clarify quantifiers and parameter domains; note any normalization (scaling, symmetry, monotonicity).
- Enumerate trivial/degenerate cases and boundary values; log any immediate necessary conditions.
- Identify equivalent or one-sided reformulations; verify implications are two-sided before use.
- List candidate extremal configurations to test sharpness.

Counterexample search blueprints (chosen after domain is known):
- Combinatorics/graphs: enumerate small n (e.g., up to 8–10); canonical generation to avoid isomorph duplicates; check the conjecture’s property; record minimal violating instances.
- Number theory/arithmetic: brute-force over small ranges; sieve modular obstructions; test density/structure heuristics; log counterexamples with minimal parameters.
- Inequalities/analysis: test parametrized families (Gaussians, exponentials, extremal sequences); probe asymptotic regimes and degenerate limits.
- Geometry: small rational/integer-coordinate constructions; perturbation to test stability; check convexity/extremal principles.

Post-intake workflow:
1) Formalize the self-contained statement and immediate corollaries.
2) Run edge-case checks and small-instance searches.
3) Attempt first-steps structural lemmas enabling induction, decomposition, or convexity/variational methods.
4) Triage: if counterexamples arise, minimize and document; if not, escalate toward a proof strategy with clearly stated lemmas.

Documentation discipline:
- Keep exploratory reasoning here in notes.md.
- Move only fully verified arguments to proofs.md.
- Update output.md exclusively for decisive milestones (proof, disproof, or sharp bounds).