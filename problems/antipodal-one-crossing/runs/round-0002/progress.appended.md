## Round 0002 — Anchored-good leverage on the a-term; explicit anchored–anchored counts; and an LP skeleton for b

Reading and audit
- I re-read output.md (Theorem A and Lemma B) and Dvořák (EJC 2020). The spectral Kneser bound is correct; the resulting substitution into Dvořák’s formula numerically gives a slightly worse constant than 3/8 (since b ≤ 1/2 + 3/(2(n−3))), but this is fine as an explicit o(1) term. Lemma B’s asymptotics τ_v ≥ 1/4 − 3/(4n) + O(1/n^2) are correct (I checked the expansion for even n).
- No changes to output.md are proposed, but I note this nuance: “refines to (3/8 + 1/(8(n−3)) + o(1))·n” means making the o(1) term explicit; it is not an improvement on 3/8.

Idea: Use anchored-good pairs to lower the both-good boundary switch probability below 1/2 by a vertex-bias dependent amount
- Motivation: In Dvořák’s analysis the “both-good” boundary switch probability was bounded by 1/2 + o(1). However, within the anchored-good subclass (good Q3’s with a monochromatic star at the shared vertex), the color at the shared vertex chosen by f1 is forced to be the star color. This creates an explicit bias for two disjoint anchored-good cubes depending on the local red degree r_v at the shared vertex v.

Explicit counting for anchored–anchored pairs at a fixed vertex v
- Let r = r_v and b = n − r. For an ordered v-neighbor pair of Q3’s (K1,K2) (disjoint 3-sets), consider the event A that both are anchored at v (i.e., the three incident edges at v within each Ki have the same color). Then the exact counts are:
  • #disjoint ordered pairs with both anchored red: C(r,3)·C(r−3,3).
  • #disjoint ordered pairs with both anchored blue: C(b,3)·C(b−3,3).
  • #disjoint ordered pairs with one anchored red and the other blue: C(r,3)·C(b−3,3) + C(b,3)·C(r−3,3).
  • Total #disjoint ordered pairs: C(n,3)·C(n−3,3).
- Consequently, the anchored–anchored v-probability is
  H(r,n) := P_v[A] = [ C(r,3)C(r−3,3) + C(b,3)C(b−3,3) ] / [ C(n,3)C(n−3,3) ].
  Observation: H(r,n) is symmetric in r↔b, minimized (empirically and by Taylor expansion) around r≈n/2, and for r=n/2 we have H ≈ 1/32 + O(1/n).
- Note: Since “anchored” implies “good” (Lemma 8), H(r,n) is a contribution to the both-good probability a at v. Averaging over v gives a universal lower bound a ≥ E_v[H(r_v,n)]. I will formalize the minimization of H at r≈n/2 in a separate lemma next round; numerically, H(n/2,n) → 1/32.

Anchored–anchored disagreement probability below 1/2 (precise expansion)
- For the same v and conditioning on A, let σ_i∈{R,B} be the star color at v in Q3(v,Ki) (this is exactly the color of the first edge at v chosen by f1 in an anchored-good cube). The conditional probability of disagreement is
  P_v[σ_1≠σ_2 | A] = [ C(r,3)C(b−3,3) + C(b,3)C(r−3,3) ] / [ C(r,3)C(r−3,3) + C(b,3)C(b−3,3) + C(r,3)C(b−3,3) + C(b,3)C(r−3,3) ].
- As n→∞, with x = r/n and t = x−1/2, a direct Taylor expansion gives
  P_v[σ_1≠σ_2 | A] = 1/2 − (9/2) t^2 + O(1/n + t^4).
  Sketch: Use C(r,3) ∼ x^3 C(n,3) and similarly for the (·−3) terms to reduce the ratio to 2x^3(1−x)^3/(x^3+(1−x)^3)^2 up to O(1/n), then expand around x=1/2 to obtain 1/2 − (9/2)t^2 + O(t^4).
- Consequence: For vertices with |t|≥η>0, the both-good boundary switch probability (within anchored–anchored pairs) is strictly < 1/2 by Ω(η^2).

Averaging over vertices and integrating into Dvořák’s boundary analysis
- Let T_v := (r_v/n − 1/2)^2. Then at the boundary step contributing the (both-good) term, we can refine Dvořák’s 1/2 bound as follows. Writing A_v for the anchored–anchored indicator at v and using that A_v implies both-good, we have
  P[boundary switch | both-good] ≤ 1/2 − E_v[ (9/2)·T_v · P_v[A] ] + O(1/n).
  Here the expectation is over the random shared vertex v (uniform) and random v-neighbor pair.
- Therefore, the boundary contribution in the a-term decreases by at least Δ_a := (9/2)·E_v[ T_v · H(r_v,n) ] + O(1/n). Since H(r_v,n) ≳ 1/32 around the balanced regime, a coarse but explicit averaged gain is
  Δ_a ≥ (9/64)·E_v[T_v] + O(1/n),
  provided we certify that H(r,n) is minimized at r≈n/2 (to be proved next round). This yields the refined expected-switch bound
  E[switches] ≤ (1/3 + b/12 + (1/2)a/3)·n − (Δ_a/3)·n + o(n).
- Interpretation: Whenever the mean square degree-imbalance E_v[T_v] is bounded away from 0, the both-good boundary term improves by a constant multiple of E_v[T_v], giving a linear gain. This sets up a natural dichotomy: either (Unbalanced case) E_v[T_v] ≥ τ>0, yielding a constant improvement via the a-term, or (Balanced case) E_v[T_v] is small, in which case we must force b ≤ 1/2 − γ using cross-cube constraints.

Why useful here
- This quantifies and isolates an unconditional source of improvement for the a-term that Dvořák bounded by 1/2. It is small if and only if the coloring is nearly degree-balanced at every vertex; this sharply delineates the hard regime for subsequent b-analysis.

LP skeleton for bounding b under local consistency (balanced-degree regime)
- Variables (at a typical vertex v; all frequencies are with respect to a uniform random 3-set K and, where relevant, uniform random disjoint pair K,L):
  1) Star-type frequencies at v: x_{3R}, x_{2R1B}, x_{1R2B}, x_{3B}, with x_{3R}+x_{2R1B}+x_{1R2B}+x_{3B}=1 and x_{3R} = E[C(r_v,3)]/C(n,3), etc.
  2) 4-cycle types at v for unordered pairs {i,j}: variables y_t for the small set of 2-color isomorphism classes of a 4-cycle (monochromatic, two-adjacent, two-opposite, alternating). These enforce consistency among triples sharing {i,j}.
  3) Q3 pattern types at v: for each isomorphism class of 2-colored Q3 with a marked vertex v, a variable z_π, along with a flag good/bad (by Dvořák’s definition) and, for good, the f1-chosen color at v.
- Constraints:
  • Marginalization: z_π summed over π projecting to a given 4-cycle type equals the corresponding y_t; and summing z_π over all π whose three incident edge colors at v equal a given star-type yields x_{·}.
  • 4-cycle consistency: Across the four Q3’s through a fixed {i,j} at v (varying the third direction k), their projections on the 4-cycle must agree with y_t, and the joint frequencies for pairs (k,k′) must be compatible.
  • Badness filters: The subset of π labeled bad must satisfy Lemma 9’s structural condition at v and at the opposite vertex (existence of 1-switch antipodal geodesics with specified endpoint colors).
  • Symmetry: Assume deg_R(v)=deg_B(v) (balanced regime) to reduce variables and focus on the hardest case.
- Objective: Maximize b_v, the frequency of mixed (good–bad) among disjoint pairs (K,L), computed as a linear form in z_π (and their pairwise products via a standard linearization trick on the disjoint-pair distribution). Any universal optimum b_v ≤ 1/2 − γ gives the desired γ for b.
- Auditable next step: Explicitly enumerate the 4-cycle isomorphism classes (there are 4) and the Q3 pattern classes up to Aut(Q3) with marks (modest; can be done by hand or small script), encode the LP, and solve numerically in the balanced case. The outcome will either exhibit γ>0 or produce an extremal local statistics candidate to analyze combinatorially.

Examples/sanity checks
- Balanced case r_v = n/2: H(r,n) ≈ 1/32 and P_v[σ_1≠σ_2|A] ≈ 1/2 (no anchored–anchored gain), matching the expansion with t=0.
- Unbalanced case r_v = (1/2+0.1)n: t=0.1 gives P_v[σ_1≠σ_2|A] ≈ 1/2 − 0.045, a substantial drop. Combined with H≈1/32, this yields a ≈ 0.0014 absolute reduction in the both-good boundary switch probability at v; across Θ(n) boundaries this is a linear gain.

Obstacles and open points
- Proving that H(r,n) is minimized at r≈n/2 for all n≥6 (intuitively clear; needs a short discrete convexity or rearrangement proof). I will address this rigorously next round.
- Extending the anchored–anchored bias to non-anchored good cubes requires Q3-type enumeration and analysis of f1’s choice in those classes.
- The LP must keep the state space small enough to be tractable; careful exploitation of symmetry will be crucial.

Next steps (checkable deliverables)
1) Prove: For n≥6 and all 3≤r≤n−3, H(r,n) ≥ H(⌊n/2⌋,n) = 2·C(⌊n/2⌋,3)·C(⌊n/2⌋−3,3) / [ C(n,3)C(n−3,3) ] = 1/32 + O(1/n).
   - Approach: Write F(m)=C(m,3)C(m−3,3) and show F(m)+F(n−m) is minimized at m≈n/2 by discrete convexity or rearrangement.
2) Formalize the anchored–anchored improvement in the a-term: derive the precise inequality
   E[switches] ≤ (1/3 + b/12 + (1/2)a/3)·n − ( (9/2)·E_v[T_v·H(r_v,n)]/3 )·n + o(n),
   and document all conditioning steps cleanly.
3) Q3 pattern work: enumerate Q3 2-coloring classes with a marked vertex; identify good/bad and (for good) the f1-chosen color at the mark; produce a table to feed the LP.
4) Build and solve the first LP relaxation in the balanced regime to test if b ≤ 1/2 − γ holds under 4-cycle and badness constraints.

Why this is progress
- We obtain explicit, verifiable formulas for anchored–anchored frequencies and their bias, giving a concrete, structural improvement in the both-good boundary term whenever degree variance is non-negligible. This cleanly reduces the problem to the balanced regime, where the LP program can plausibly show b<1/2 due to 4-cycle consistency and badness structure. The steps above are incremental and individually checkable.

