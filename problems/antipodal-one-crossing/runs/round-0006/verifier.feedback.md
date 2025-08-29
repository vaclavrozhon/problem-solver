High-level: Both reports converged on the missing boundary–label equivalence for the both-good refinement, and on a rigorous u_v-based global inequality. This is the right gap to close. With one adjustment to the definition of c_v (align it with the path actually chosen by Dvořák inside each good Q3), the boundary equivalence becomes immediate and the remainder of the argument (uniformity of conditioning, pair-sampling, and global averaging) is sound and compatible with the existing sampling lemmas in output.md. The resulting Proposition K (u_v-based both-good refinement) is ready to curate, together with a corollary giving an explicit 1/96 coefficient when only τ_v ≥ 1/4 is used.

Key corrections/rigor points:
- Do not rely on “for good cubes f2≡f1.” This is not established and is unnecessary. Instead, define c_v(K) to be the color of the edge (v, f(v,•)) along the actual path chosen by Dvořák inside Q3(v,K). Corollary D (pair-sampling) remains valid for this c_v because it needs only an arbitrary fixed labeling of G_v.
- Boundary–label equivalence: With the above definition, the last edge of the previous block at v is (f(v, v′), v) and the first edge of the next block is (v, f(v, w)). Their colors are exactly c_v(K_prev) and c_v(K_next). Thus, on the both-good event, boundary switch equals [c_v(K_prev) ≠ c_v(K_next)]. This is local and rigorous.
- Conditioning uniformity: Lemma K implies (K,L) is uniform over ordered disjoint pairs and independent of v. Conditioning on K,L ∈ G_v restricts to uniform on disjoint good pairs. Averaging over v yields E_v[q_v] = a. All these steps are fully justified by existing lemmas.
- Anchored-implies-u_v lower bound: The claim u_v ≥ |C(r,3)−C(n−r,3)|/(C(r,3)+C(n−r,3)) is not valid as a pointwise lower bound for u_v on all of G_v; non-anchored good triples can, in principle, cancel the anchored bias. Please do not add this to output.md. Keep anchored-based savings and u_v-based savings as separate refinements.

What to curate now:
1) A “definition alignment” remark updating c_v to be the color of the first edge at v along the actual chosen path in a good Q3. State explicitly that Corollary D remains valid for this labeling.
2) Lemma L (Boundary–label equivalence at v for good neighboring Q3’s).
3) Proposition G3 (Both-good conditioning is uniform on disjoint good pairs and E_v[q_v]=a).
4) Proposition K (u_v-based both-good refinement) with its proof and the global bound E[switches] ≤ (1/3 + b/12)·n − (1/6)·E_v[q_v u_v^2]·n + o(n).
5) Corollary K1 (unconditional 1/96 via τ_v ≥ 1/4 − O(1/n)). Optionally mention the explicit finite-n slack 20/(n−12) via Corollary E0.1.

Non-overcounting: Emphasize that the anchored-driven (Proposition J) and u_v-driven (Proposition K) savings act on the same both-good boundary term, so they should not be added; in analysis, use the stronger one pointwise.

Next steps:
- Begin the “balanced-regime” LP: enumerate marked-Q3 classes (good/bad tagging under Dvořák’s filters), record each good class’s f-start color at the mark, and their face-type triples. These give linear maps from class variables to star- and face-marginals.
- Enforce 4-cycle consistency and the badness filters; include the disjoint-pair product approximation with explicit ±20/(n−12) slack.
- Explore constraints that relate c_v-labels across triples (e.g., via shared faces/4-cycles) to obtain a lower bound on E_v[u_v^2] in the balanced regime.
- Optional: quantitative finite-n versions of Proposition K using Corollary E0.1; and a standalone note on E_v[q_v]=a in terms of a.
