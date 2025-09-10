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