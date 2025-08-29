## Round 0003 — 2025-08-27T19:44:38.834112Z

Round 0003 — Correcting a key mis-citation (p vs. p/2), anchoring-based refinement of the a-term, exact anchored–anchored counts, uniformity of boundary vertices, and a clean global inequality

Summary and audit of output.md
- Sound pieces: Theorem A (KG(n,3) spectral MAX-CUT for b), Lemma B (monochromatic-star fraction), Lemma C + Corollary D (pair-sampling under disjointness and the u_v parameter) are correct and useful.
- Missing explicit import: output.md uses in the Remark that “anchored-at-v cubes are good,” but does not restate/prove it. This is Dvořák’s Lemma 8. I recommend adding it as a self-contained lemma (I provide a short proof sketch below) so we can invoke it to ensure t_v = Θ(n^3) uniformly in v.
- Important correction (from the PDF): In Dvořák’s proof, the expected number of color changes inside a Q3-block contributes 1 − p/2 per block (not 1 − p^2). This is essential for the cancellation to give (1/3 + b/12 + o(1))·n. Some of my Round 0001 notes used 1 − p^2; that was an error. All refinements below use the correct 1 − p/2 baseline.

New, checkable lemmas/propositions to add
1) Lemma E (Anchored at v implies good; Dvořák’s Lemma 8). If at some vertex of a Q3 the three incident edges are monochromatic, then the Q3 is good.
- Utility here: Guarantees that “anchored” cubes are a subset of good, allowing us to quantify a nontrivial anchored–anchored submass within the both-good case.
- Proof sketch (as in Dvořák): Assume 000 has all three blue edges. If all edges in the opposite square are red, we immediately have three monochromatic antipodal geodesics disjoint from 000–111 and one blue antipodal geodesic through 000, totaling ≤2 changes. If some edge there is blue, a short case-check (as in the paper) creates two disjoint monochromatic antipodal geodesics, forcing goodness by the definition. This can be restated verbatim from Lemma 8 in the EJC note.

2) Lemma F (Exact anchored–anchored counts at a fixed vertex and the disagreement probability).
- Setup: Fix v. Let r=r_v be the red degree, b=n−r. Consider ordered pairs (K,L) of v-neighbor Q3’s (disjoint 3-sets). Say a Q3 is “anchored red at v” if all three edges at v in that Q3 are red, and analogously for blue.
- Exact counts:
  • Both anchored red: C(r,3)·C(r−3,3).
  • Both anchored blue: C(b,3)·C(b−3,3).
  • One anchored red, one anchored blue: 2·C(r,3)·C(b,3).
  • Total ordered disjoint pairs: C(n,3)·C(n−3,3).
- Therefore, the anchored–anchored probability (at v) is
  H(r,n) = [ C(r,3)C(r−3,3) + 2C(r,3)C(b,3) + C(b,3)C(b−3,3) ] / [ C(n,3)C(n−3,3) ].
- Conditional disagreement probability among anchored pairs at v (star colors σ1,σ2 at v):
  P_v[σ1≠σ2 | anchored at v] = 2C(r,3)C(b,3) / [ C(r,3)C(r−3,3) + 2C(r,3)C(b,3) + C(b,3)C(b−3,3) ].
- Asymptotics: With x=r/n and t=x−1/2, as n→∞,
  • H(r,n) = (x^3+(1−x)^3)^2 + O(1/n) after normalizing by the denominator, hence H minimized at x=1/2 and H(1/2,n) = 1/16 + O(1/n).
  • P_v[σ1≠σ2 | anchored] = 2x^3(1−x)^3 / (x^3+(1−x)^3)^2 + O(1/n) = 1/2 − 18t^2 + O(t^4 + 1/n).
- Why useful: This gives an explicit, vertex-wise, anchored-driven bias away from 1/2 in the both-good boundary step, proportional to t^2 and with anchored mass H(r,n).

3) Proposition G (Uniformity of the shared boundary vertex under the random-geodesic scheme).
- Claim: In Dvořák’s random antipodal geodesic model (uniform start vertex v0 and uniform coordinate permutation), for any fixed j in {1,…,k−1}, the shared vertex v3j at the j-th boundary is uniformly distributed over V(Q_n). Consequently, any bounded function φ(v) satisfies E[φ(v3j)] = E_v[φ(v)], the uniform average over vertices.
- Proof sketch: v3j = v0 ⊕ S where S is a uniformly random j-th 3-subset of coordinates from the permutation. For any fixed y, the number of (v0,S) pairs producing y equals the number of (v0,S) pairs producing 0 (by translation invariance), so y is equiprobable. Averaging over j (uniformly in {1,…,k−1}) preserves uniformity. This justifies replacing boundary-vertex averages by uniform E_v[·].

Refined global bound integrating anchoring
- Boundary switch step: For a fixed boundary j with shared vertex v=v3j, the color-change probability is bounded by
  P[switch at boundary j] ≤ b/2 + a/2 − E_v[ (1/2 − P_v[σ1≠σ2 | anchored at v]) · H(r_v,n) ] + o(1).
  Here σi is the f1-chosen color at v for the i-th Q3; for anchored-good cubes, σi equals the star color at v, and “anchored ⇒ good” ensures we can subtract the anchored improvement unconditionally. The o(1) comes from the O(1/n) error in Lemma F and the negligible pairs sharing more than one vertex (as in Dvořák).
- Using Lemma F’s expansion, write T_v := (r_v/n − 1/2)^2. Then
  (1/2 − P_v[σ1≠σ2 | anchored]) = 18T_v + O(T_v^2 + 1/n).
  Thus the anchored savings per boundary satisfy
  Δ_anchor := E_v[ (1/2 − P_v[σ1≠σ2 | anchored]) · H(r_v,n) ] ≥ 18·E_v[ T_v·H(r_v,n) ] + O(1/n).
- Interior Q3 step: The correct baseline is 1 − p/2 per block. Summing over blocks and boundaries (k≈n/3) and inserting p=a+b/2 gives the refined expectation
  E[switches] ≤ (n/3)·[ (1 − p/2) + (a/2 + b/2) − Δ_anchor + o(1) ]
                  = (n/3)·[ 1 + b/4 − Δ_anchor + o(1) ]
                  = (1/3 + b/12 − (1/3)·Δ_anchor + o(1))·n.
- Consequence (unbalanced-degree regime): Since H is minimized at balance with H(1/2,n)=1/16+O(1/n), we obtain the explicit inequality
  E[switches] ≤ (1/3 + b/12 − 6·E_v[T_v]·(1/16 + O(1/n)) + o(1))·n
              = (1/3 + b/12 − (3/8)·E_v[T_v] + o(1))·n.
  Therefore, if the mean-square degree-imbalance E_v[T_v] ≥ τ for some absolute τ>0, we get a linear improvement δ ≥ (3/8)·τ.
- Hard case isolated: The only regime where this anchored refinement fails to give a constant gain is the “balanced” one with E_v[T_v]→0. This exactly isolates where we must force b ≤ 1/2 − γ via additional structure (4-cycles, Q3-type constraints), matching the LP plan from Round 0002.

Small discrete convexity fact (to be added; proof next round)
- Claim: For n≥8, H(r,n) is minimized at r∈{⌊n/2⌋,⌈n/2⌉}.
- Rationale: The leading term is proportional to (C(r,3)+C(n−r,3))^2, whose base C(r,3)+C(n−r,3) is discrete-convex and minimized at balance (Lemma B). The (−3)-shifts in C(r−3,3) produce O(1/n) corrections that preserve the minimizer for n large. I will provide a clean discrete argument (or a short rearrangement bound) next round.

Examples and sanity checks
- Balanced coloring (deg_R(v)≡n/2): H≈1/16 and P[σ1≠σ2 | anchored]≈1/2, so Δ_anchor≈0 and the bound reverts to Dvořák’s 1/3 + b/12 (no gain here), exactly as expected.
- Degree-biased coloring: If a fixed fraction ρ of vertices have |r_v/n − 1/2|≥η, then E_v[T_v]≥ρη^2 and the anchored refinement yields a gain ≥(3/8)ρη^2 on the constant in front of n (up to o(1)).

Obstacles
- We have not yet added “anchored implies good” as a formal lemma to output.md; current remarks rely on it tacitly. This should be included explicitly (with proof or precise citation) to make the error bounds uniform.
- The minimization of H(r,n) at balance requires a short but explicit discrete argument; while clear asymptotically, I will supply a fully discrete proof to avoid asymptotic handwaving.
- Balanced regime: The anchored refinement yields no improvement when E_v[T_v] is tiny. Here we must execute the LP/SDP program to show b ≤ 1/2 − γ using 4-cycle and Q3-type consistency.

Next steps (auditable)
1) Add Lemma E (“anchored ⇒ good”) to output.md with a short proof (or explicit citation to Dvořák’s Lemma 8).
2) Add Lemma F to output.md: exact anchored–anchored counts and the asymptotic expansion P_v[σ1≠σ2 | anchored] = 1/2 − 18T_v + O(T_v^2 + 1/n). Provide the elementary calculation.
3) Add Proposition G to output.md: uniformity of shared boundary vertex under the random-geodesic model. This justifies averaging over v.
4) State and prove the refined global inequality: E[switches] ≤ (1/3 + b/12 − 6·E_v[T_v·H(r_v,n)] + o(1))·n. This cleanly quantifies the anchored-driven savings.
5) Prove the discrete minimization: H(r,n) minimized at r≈n/2 (all n≥8). Conclude E_v[T_v·H(r_v,n)] ≥ (1/16−O(1/n))·E_v[T_v].
6) Balanced-regime LP: Start with the deg_R(v)=n/2 symmetric case; enumerate Q3 2-colorings with a marked vertex, tag good/bad and f1-start color at the mark, encode 4-cycle consistency, and maximize b. Numerical solution will guide an analytic γ>0.

Why this advances the program
- We corrected a crucial mis-citation (1 − p/2 vs. 1 − p^2) and derived a rigorous, quantified refinement that converts degree variance into a linear constant gain via anchored–anchored pairs, with fully explicit counts.
- This yields an immediate δ-improvement in a large and natural structural regime (nontrivial degree variance), and narrows the hard case to the near-balanced regime, for which we have a concrete LP plan.

Gaps explicitly flagged for output.md
- Include Lemma E (anchored ⇒ good) explicitly.
- Incorporate Lemma F and Proposition G to formalize the anchored-based refinement and the uniformity of boundary-vertex averaging.
- Update any place where 1 − p^2 was (mis)used to the correct 1 − p/2.

