## Round 0006 — 2025-08-27T19:42:10.463400Z

Status and aim
- We continue to resolve the one-point amalgamation for |A|=4, which reduces AP for H to a finite CSP on six edge variables with four local 5-set constraints (output.md Prop. 3). The computational oracle IsO5 is still the bottleneck; I add rigorously checkable lemmas that simplify the local constraint analysis and shrink the number of patterns to verify.

New lemma: explicit O5-image formula (useful for hand checks)
- Lemma (O5 image equals “−ε off one coordinate”). Let e_O = (+,−,−,−,−). For any τ∈S_5 with ε(τ)=(ε_1,…,ε_5) and any i_0 with τ^{-1}(i_0)=the + position of e_O, the image p′ under the signed action satisfies
  p′_i = −ε_i for i≠i_0, and p′_{i_0} = ε_{i_0}.
  Proof. Immediate from p′_i = ε_i·(e_O)_{τ^{-1}(i)} and that (e_O)_j is + at one j and − otherwise.
- Why useful: To test whether a target 5-vector p lies in the O5 orbit, it suffices to check if there exists some i_0 with ε determined by ε_{i_0}=p_{i_0} and ε_i=−p_i for i≠i_0 such that ε=ε(τ) for some τ. This is a sharper necessary-and-sufficient condition and provides quick hand-proofs in some cases.

Corollary: all-equal triple is forbidden in the opposite-fixed case (now with a clean proof)
- Corollary (completes the “hard exclusion” in both directions). For (α,β)=(+,-), both (+++) and (---) are forbidden: (x,y,z)∉F(+,-) for (x,y,z)=(+,+,+) and (x,y,z)=(−,−,−). Proof:
  • (---) gives p=(+,-,−,−,−), the canonical O5 representative.
  • (+++) gives p=(+,-,+,+,+). By Lemma 8 there exists τ with ε_i(τ)=−1 for all i. Taking i_0=2 yields p′ with p′_2=ε_2=−1 and p′_i=−ε_i=+1 for i≠2, i.e., p′=(+,-,+,+,+). Hence p is in O5.∎
- Symmetrically, for (α,β)=(−,+), both (+++) and (---) are forbidden by global sign reversal (output.md Cor. 9).
- Why useful: This fully classifies the all-equal triples for the opposite-fixed case without computation, tightening the F(+,-) and F(−,+) tables and providing robust unit tests for IsO5.

Hand-verified ε-examples (sanity catalog for the verifier)
- Using Lemma 6, I computed ε(τ) for small τ (useful to debug IsO5):
  • id: ε=(+,+,+,+,+), Σε=+5.
  • (12): ε=(+,+,−,−,−), Σε=−1.
  • (123): ε=(+,−,−,+,+), Σε=+1.
  • (12)(34): ε=(−,−,−,−,+), Σε=−3.
  • (13): ε=(−,−,−,−,−), Σε=−5 (the “central” flip from Lemma 8).
  These confirm that Σε can realize ±5, ±3, ±1, so constraints based solely on Σε (or plus-counts) cannot rule out O5 membership.

Example checks guided by the O5-image formula
- For p=(+,-,+,-,-): considering i_0=2 gives ε=(−,−,−,+,+); i_0=1 gives ε=(+,+,−,+,+). Both patterns appear plausible from small τ, but I do not assert membership either way; this illustrates how the formula reduces a membership query to “does this ε occur as ε(τ)?”, which is trivial to decide computationally and infeasible by hand enumeration.

New solvable family via 2+2 vertex-sign ansatz (synthesis and scope)
- Recall Lemma 10 and Prop. 11. Under x_{ij}=w_iw_j with exactly two + and two − on A, each triangle-triple is a permutation of (+,−,−). Thus, if the verifier confirms that every F(α,β) contains all three permutations of (+,−,−), then the one-point step over |A|=4 is uniformly solvable (Prop. 11), implying AP for H (Lemma 2).
- I emphasize that the only remaining local memberships to check for this route are the 12 entries: for each (α,β)∈{++, +−, −+, −−}, the three permutations of (+,−,−). Cor. 9 halves this (the two opposite-sign cases follow by triplewise negation), so only F(+,+) and F(+,-) need computing.

Refined classification of 4-bit type patterns on A (search-space reduction)
- Observation (C5): For any B of type C5 on A∪{b}, the 5-vector on that 5-set is constant ±, hence the 4-bit pattern (p^B_k)_{k∈A} is constant (all equal) as well. This confirms that, in the one-point data, any non-constant 4-bit pattern on A must come from an H5 side.
- Heuristic (H5, to be verified computationally): For any C of type H5 on A∪{c}, the 4-bit pattern (p^C_k)_{k∈A} consists of exactly two + and two − (never all equal). The canonical representative (+,−,+,−) exhibits this; testing whether all six 2–2 patterns occur will reduce the |A|=4 enumeration by symmetry. Action item: Enumerate the orbit of H5 under relabelings that fix c and record the distinct 4-bit patterns on A; this bounds the profile list to check.

Obstacles and why a small computation remains necessary
- Attempts to certify (+,−,−)-admissibility analytically in F(+,+) or F(+,-) via parity/sum invariants fail because the S_5 signed action realizes ε with all odd sums, and the O5 orbit is large. The O5-image formula reduces membership to ε-realizability, yet characterizing the full image E={ε(τ):τ∈S_5} pen-and-paper appears cumbersome. A 120-step enumeration is the right tool here.

Actionable next steps for the verifier (precise and minimal)
1) Implement IsO5 via output.md Lemma 6. Unit tests: (+,+,+,+,+) non‑O5; (+,−,−,−,−) O5; (+,−,+,−,+) non‑O5; and the five ε-vectors above should appear for the listed τ.
2) Populate F(+,+) and F(+,-) (8 triples each) under the fixed coordinate order (notes/output). Obtain F(−,−), F(−,+) by triplewise negation (Cor. 9). Confirm the proven exclusions: for (+,-), exclude (+++) and (---).
3) Check the 12 key memberships: for each (α,β), all permutations of (+,−,−) belong to F(α,β). If yes, conclude the |A|=4 one‑point step via Prop. 11 and hence AP (Lemma 2).
4) If any of those memberships fail, revert to the 2^6 brute‑force CSP per realized (B,C) profile (with the H5 4-bit patterns catalogued as above). Either archive SAT assignments or produce an UNSAT certificate.

Gaps and clarifications in output.md
- Prop. 11 remains conditional on the F-table check; it should eventually cite explicitly which 12 memberships were verified. The present round supplies a complete proof that (+++) and (---) are both forbidden in F(+,-), filling a previously flagged gap.
- The precise ordering of the last three coordinates in p(Y_k) is critical and already stated; when the F-tables are recorded, repeat this convention in output.md adjacent to their definition for reproducibility.

Summary of this round’s contributions
- Introduced and proved the O5-image formula p = −ε off one coordinate, enabling quick hand checks and guiding IsO5 implementation.
- Fully classified “all-equal” triples in the opposite-fixed case as O5 (forbidden) by a short, rigorous argument.
- Provided computed ε-vectors for several small τ as sanity data.
- Outlined a minimal verification plan: compute two F-tables, test 12 memberships to unlock the uniform 2+2 solution; otherwise, fall back to the tiny 2^6 CSP with a reduced profile list via H5’s 4-bit patterns on A.

