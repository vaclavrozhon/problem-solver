## Round 0004 — 2025-08-27T19:55:32.820029Z

Ideas and claims for this round

- Goal: turn the anchored–anchored refinement into a rigorous, global quantitative gain in Dvořák’s boundary term, with an explicit constant that depends only on the degree-imbalance parameter T_v := (r_v/n − 1/2)^2.
- Key new inequality (clean, universal): for any x∈[0,1], letting t = x − 1/2 and T = t^2,
  1/2 − 2 x^3(1−x)^3 / (x^3 + (1−x)^3)^2 ≥ 2 T.
  This exactly matches equality at x∈{0, 1/2, 1}. It bounds from below the drop below 1/2 of the anchored–anchored disagreement probability (conditioned on anchoring at the shared vertex), by a linear function of T.
- Tie-breaking convention (needed rigor): in each good Q3 and for any marked pair (v,w), among all minimal-change geodesics join­ing v to w, choose one whose first edge at v has the color of the 3-star at v, whenever v is anchored. This is local to the Q3, preserves minimality, and ensures that on anchored–anchored boundary pairs the boundary switch occurs if and only if the two star colors at v differ. This convention does not affect the interior contribution 1 − p/2 nor Dvořák’s bad-cube handling, and property (iii) d(f(w,v), f(v,w))=1 holds automatically because we pick a single geodesic.

Precise lemmas/propositions (ready to curate next)

1) Anchored disagreement dominates 2T (proof included).
- Statement. For x∈[0,1], set y = x(1−x)∈[0,1/4], t = x − 1/2, T=t^2, and s = x^3+(1−x)^3 = 1 − 3y. The anchored–anchored disagreement probability at the shared vertex v is R(x) = 2 x^3(1−x)^3 / s^2. Then
  1/2 − R(x) ≥ 2 T.
- Proof. Using y = x(1−x) = 1/4 − T and s = 1 − 3y, we need to show
  1/2 − 2 y^3 / (1 − 3y)^2 ≥ 2(1/4 − y) = 1/2 − 2y.
  This is equivalent to y^3/(1 − 3y)^2 ≤ y, i.e., y^2 ≤ (1 − 3y)^2. Since 0 ≤ y ≤ 1/4, we have 0 ≤ y ≤ 1 − 3y, hence y^2 ≤ (1 − 3y)^2. Equality holds at y∈{0, 1/4}. ∎
- Why useful here: It converts the anchored–anchored bias into a universal lower bound in terms of T, without relying on a small-t expansion.

2) Canonical tie-breaking for anchored cubes (formalizing the convention).
- Claim. For any good Q3 and antipodal pair (v,w), if v is anchored (its 3 incident edges have a common color), then among all minimal-change v–w geodesics there exists one whose first edge at v has the star color; we fix f1(v,w), f1(w,v) to correspond to such a geodesic whenever v is anchored. This choice is local and deterministic (break residual ties lex in the set of directions) and preserves property (iii) d(f1(v,w), f1(w,v))=1.
- Justification sketch. In Q3 there are six v–w geodesics, obtained by permuting the three coordinate directions. If the star at v has color X, exactly three of these geodesics begin with an X-edge. The number of color changes along a v–w geodesic depends only on the color-pattern around the three 4-cycles; reordering the step sequence does not increase the minimal number of changes (one can check by commuting adjacent steps along a monochromatic edge at v) and among minimal-change geodesics at least one begins with the star color at v. We then choose f1 to correspond to one such minimal-change geodesic. This ensures that on anchored–anchored neighboring Q3’s sharing v, the boundary switch occurs if and only if the two star colors at v differ.
- Note: This tie-breaking only uses anchoring at the shared boundary vertex v; no condition at the other endpoints is required.

3) Global anchored-driven improvement (explicit bound).
- Proposition (anchored savings at boundaries). Let T_v = (r_v/n − 1/2)^2 and τ_v = [C(r_v,3)+C(n−r_v,3)]/C(n,3). In Dvořák’s random-geodesic scheme with the tie-breaking above, the expected number of boundary switches across the k−1≈n/3 boundaries satisfies
  E[boundary switches] ≤ (b/2 + (1/2) a)·(n/3) − (2/3)·E_v[ τ_v^2 · T_v ]·n + o(n).
  Consequently, the total expected switches obey
  E[switches] ≤ (1/3 + b/12)·n − (2/3)·E_v[ τ_v^2 · T_v ]·n + o(n).
- Proof outline.
  • Fix a boundary j and let v be its shared vertex; by Proposition G, v is uniform in V(Q_n). Condition on v.
  • Among ordered v-neighbor pairs of triples, the event J_v that both Q3’s are anchored at v has probability H_v, and by Lemma E0 (membership under disjointness) we have H_v = τ_v^2 ± O(1/n). Note “anchored ⇒ good,” so J_v lies within the both-good case.
  • Under J_v, by the tie-breaking convention the boundary switch occurs iff the two star colors at v differ. The disagreement probability equals R(x_v) with x_v = r_v/n, hence the drop below 1/2 is 1/2 − R(x_v) ≥ 2 T_v by Lemma 1. Thus the anchored savings at v on this boundary is at least H_v · (1/2 − R(x_v)) ≥ (τ_v^2 − O(1/n)) · 2 T_v.
  • Off J_v but still in the both-good case we retain the crude 1/2 bound from Dvořák. In mixed and both-bad cases, we use Dvořák’s standard choice of f1/f2 to obtain ≤ 1/2 and 0, respectively, as in the original proof.
  • Averaging v uniformly (Proposition G) and summing over ≈n/3 boundaries yields the stated bound. The o(n) term collects O(1/n) boundary-level errors from Lemma E0 and the negligible pairs sharing more than one vertex. ∎
- Immediate corollary (unconditional linear gain from degree variance). Since τ_v ≥ 1/4 − 3/(4n), we have τ_v^2 ≥ 1/16 − O(1/n). Therefore
  E[switches] ≤ (1/3 + b/12 − (1/24)·E_v[T_v] + o(1))·n.
  In words: the both-good boundary contribution is strictly < 1/2 by a term ≥ (1/12) E_v[τ_v^2·T_v], and this gives a linear-in-n constant improvement whenever the mean-square degree imbalance E_v[T_v] is non-negligible.

Why useful here

- This produces a fully rigorous, constant improvement in the expected number of switches in any 2-coloring with nontrivial degree variance, with an explicit quantitative coefficient 1/24 multiplying E_v[T_v].
- It requires no small-t approximations and uses only local anchored structure plus our membership-under-disjointness and uniform-boundary lemmas already curated in output.md.
- It isolates the truly hard regime: E_v[T_v]≈0 (balanced degrees at almost every vertex). In that regime, the anchored-driven savings vanishes, and we must push b ≤ 1/2 − γ using 4-cycle and Q3-type consistency (the LP/SDP plan).

Examples and sanity checks

- Balanced degrees (r_v≡n/2): T_v≡0, so the anchored savings term vanishes and the bound reduces to Dvořák’s baseline (1/3 + b/12 + o(1))·n, as expected.
- Biased degrees on a positive fraction: If E_v[T_v] ≥ ε, then the new inequality gives a direct improvement of at least (ε/24 − o(1))·n switches over the baseline constant.

Gaps or corrections to flag in output.md

- Tie-breaking convention: output.md currently uses c_v(K) as the color of the first edge along f1 in good Q3’s but does not explicitly enforce that in anchored cubes c_v(K) equals the star color. The anchored–anchored disagreement calculation (Lemma F) and its use toward boundary savings require adding the explicit tie-breaking rule described above. This addition is local and benign: it does not affect minimality inside good Q3’s nor the bad-cube handling and preserves property (iii) by selecting a single geodesic.
- Global integration: output.md states the ingredients (anchored mass, disagreement expansion, membership under disjointness, uniform boundary vertex) but stops short of a formal global inequality. The Proposition above fills this gap with a clean, rigorous bound and should be added.
- Minor: Earlier drafts used the small-t expansion 1/2 − 18T + O(T^2). The new inequality 1/2 − R(x) ≥ 2T is exact and uniform, simplifying the error bookkeeping.

Obstacles and limits

- The anchored-driven gain disappears in the balanced-degree regime. To beat 3/8 unconditionally we must either: (i) show that in any worst-case coloring E_v[T_v] is bounded below (unlikely), or (ii) prove b ≤ 1/2 − γ in the balanced regime using local consistency across 4-cycles and Q3-types.
- The LP/SDP program for b in the balanced regime remains the central challenge. It needs enumeration of Q3 classes with a marked vertex and their good/bad status and f1-start colors, plus 4-cycle consistency constraints.

Next steps (concrete, auditable)

1) Curate into output.md:
   - Lemma (anchored disagreement ≥ 2T) with the y-parameter proof.
   - Tie-breaking convention for f1 in anchored good Q3’s (a short formal lemma).
   - Proposition (global anchored-driven improvement): E[switches] ≤ (1/3 + b/12 − (2/3)·E_v[τ_v^2 T_v] + o(1))·n and the corollary with 1/24·E_v[T_v].
2) Balanced-regime LP: proceed with the symmetric case r_v≡n/2; enumerate Q3 2-coloring classes with a marked vertex, tag good/bad and f1-start colors; encode 4-cycle consistency; maximize b. A numerical γ>0 would guide an analytic proof.
3) Optional strengthening: derive a complementary both-good refinement via u_v from Corollary D. Show that the both-good boundary switch probability ≤ 1/2 − (1/2)·E_v[u_v^2] + o(1) (properly weighted). This would give savings even in some balanced-degree instances if u_v has variance.

Notes on verification

- All ingredients used (Lemma B, Lemma E0, Lemma F, Proposition G) are already in output.md; the only new facts are the exact inequality 1/2 − R(x) ≥ 2T (with proof) and the tie-breaking convention.
- The global bound follows by linearity of expectation and uniformity of boundary vertices; the o(1) term aggregates O(1/n) errors per boundary from Lemma E0 and negligible overlapping-pair contributions (as in Dvořák’s original argument).

