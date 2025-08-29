## Round 0001 — 2025-08-27T15:23:43.272071Z

Round 0001 — Critical review of brainstormed approaches; precise counterexamples; small rigorized lemmas and a concrete plan to target the parameter b in Dvořák’s scheme

Summary of materials read
- task.tex: Problem and brainstormed approaches (1–6).
- Dvořák (2020) paper (ejc 27(2) #P2.26): Proof of the (3/8+o(1))n bound via Q3-patching; definitions of good/bad Q3, parameters p,a,b, and the resulting bound (1/3 + b/12 + o(1))n.
- There is no output.md provided; nothing to curate yet.

Gaps and corrections to notes in task.tex
1) “Deliverable sublemma” under approach 1 is false as stated.
- Claim in notes: If a color occupies at least an ε-fraction of each block boundary δS_J for (1−θ) of the blocks, then that color has conductance Ω(ε) in the whole cube (hence a monochromatic antipodal path).
- Counterexample (explicit): Color every edge (x,x⊕e_i) blue iff the Hamming parity of x is 0, and red otherwise. Then in every direction i and every block J we have exactly half of the edges blue, i.e. β_J = 1/2 for all J. Yet the blue subgraph has all odd-parity vertices isolated (degree 0), hence conductance 0 and is disconnected. Therefore, occupying a constant fraction of each δS_J does not imply any expansion or even connectivity. The obstruction is concentration on one bipartition side per direction.
- Conclusion: Any usable block-to-expansion lemma must include a “balanced across endpoints” condition (e.g. per-direction, blue edges incident to each bipartition side in the block must form a constant fraction), not just an aggregate fraction across δS_J.

2) Case A “Chernoff” bound in approach 1 is not valid as written.
- Notes say: In a biased block J with β_J ∉ [1/2−ε, 1/2+ε], a random start and random ordering yields O(ε|J|) off-color edges, then 4-cycle commuting clusters defects and total switches ≤ T + O(ε n).
- Issue: For a uniformly random start x and random ordering of the |J| directions, the i-edge encountered is uniformly distributed among all i-edges, so the expected number of blue edges encountered equals β_J|J| and red equals (1−β_J)|J|. If blue is the “majority,” the expected off-color count is (1−β_J)|J|, which is ≈ (1/2−ε)|J| when β_J = 1/2+ε — not O(ε|J|). Concentration inequalities do not apply directly here because these are m dependent edge-indicators evaluated at the same random vertex x.
- Even existence via the method of conditional expectation only guarantees there is an order achieving at most the expectation (≈ (1/2−ε)|J| off-color edges in the mild-bias regime), not O(ε|J|). So the proposed inequality is overly optimistic.

3) Why a naive “p-density of good Q3’s” cannot improve 3/8 by itself.
- In Dvořák’s analysis, after defining p (fraction of good Q3), a (probability two random neighboring Q3 are both good), and b (probability one good, one bad), the final expected bound simplifies to (1/3 + b/12 + o(1))n using p = a + b/2. Thus p cancels out. Any plan focusing only on raising p above 1/2 (approach 2 as currently phrased) does not directly improve the constant; one must lower b strictly below 1/2 (or reduce the “a-case” boundary change probability below 1/2).

Small rigorized lemmas and bounds
A) Vertex-wise Kneser (disjointness) graph viewpoint and a clean upper bound on mixed pairs.
- Setup: For a fixed vertex v, Q3-subcubes through v correspond to 3-subsets K ⊂ [n] (directions). Two such Q3’s are v-neighbors iff K1 ∩ K2 = ∅. This is the Kneser graph KG(n,3) on vertices V = {K ⊂ [n]: |K|=3}, edges between disjoint triples. Let N = |V| = C(n,3), degree d = C(n−3,3).
- For a given coloring, let G_v ⊆ V be the set of good triples at v; then b_v is the fraction of edges in KG(n,3) that cross the cut (G_v, V\G_v). Dvořák’s “b” is the average over vertices of b_v, up to the normalization between ordered/unordered pairs (which cancels in fractions).
- Spectral MAX-CUT bound (standard): For any d-regular graph with smallest eigenvalue λ_min, the maximum cut has at most |E|·(1/2)(1−λ_min/d) edges. For KG(n,3), the spectrum is known: eigenvalues are λ_0 = d, λ_1 = −C(n−4,2), λ_2 = n−5, λ_3 = −1. Hence λ_min = −C(n−4,2).
- Therefore, for every v and every choice of G_v,
  b_v ≤ 1/2 · (1 − λ_min/d) = 1/2 · (1 + C(n−4,2)/C(n−3,3)).
  Since C(n−4,2)/C(n−3,3) = 3/(n−3),
  b_v ≤ 1/2 + 3/(2(n−3)).
- Averaging over v gives the same bound for b up to o(1/n) bookkeeping. This recovers and slightly sharpens Dvořák’s b ≤ 1/2 + o(1), giving an explicit o(1) term. It also clarifies the structural limitation: vertex-wise information alone cannot force b ≤ 1/2−γ for absolute γ.
- Usefulness here: This pins down what extra (non-vertexwise) structure must be exploited to beat 3/8: correlations among the labels G_v across different vertices/edges, not captured by per-vertex cuts, are necessary.

B) Formal “no-go” lemma for naive block-conductance.
- Statement: There exist 2-colorings for which, for every block partition {J_t}, every block J satisfies β_J = 1/2 (blue occupies half of δS_J), yet the blue subgraph is disconnected (indeed, has 2^{n−1} isolated vertices) and has conductance 0.
- Proof: The parity coloring described above has b_i(x) = 1 iff ⟨x,1^n⟩ mod 2 = 0 for every direction i. Then exactly half of i-edges are blue for every i, whence β_J = 1/2 for all J. But odd-parity vertices have zero blue degree, so the blue subgraph is disconnected. QED.
- Usefulness here: Clarifies that any block-expansion lemma must additionally control endpoint-balance per direction (or within-block bipartition balance), not just overall fractions.

Refined ideas targeting the boundary term (the parameter b)
Idea I: Replace the per-vertex trivial cut bound with constraints across vertices via 4-cycle consistency.
- Observation: The good/bad status of Q3(v,K) depends on the colors of edges both through v and away from v. Two disjoint triples K1,K2 at v involve disjoint sets of directions; hence many 4-cycles and 3-faces touching v and those directions mediate dependencies between “good at K1” and “good at K2”. The per-vertex MAX-CUT bound treats G_v as an arbitrary subset of triples, ignoring these constraints.
- Plan (LP/SDP framework): Introduce variables for frequencies of local patterns around v on:
  • 1-edge statistics at v: the color of each direction i.
  • 2-edge statistics at v: for unordered pairs {i,j}, the multiset of colors on the 4-cycle through v in directions i,j (there are only a few 2-color isomorphism types), capturing parity constraints.
  • 3-edge statistics: the 2-coloring type of Q3(v,K), with a flag good/bad and, for good, the color at v chosen by f1.
- Impose consistency constraints: marginalization (3-edge types project to 2-edge and 1-edge types), and that for each fixed {i,j}, all four Q3 containing {i,j} at v aggregate consistently with the 4-cycle type. Also enforce that across a uniformly random direction set, distributions are invariant. Finally, encode that pairs (K1,K2) disjoint at v induce the boundary change indicator using the chosen colors for f1.
- Objective: Maximize b (probability of good-bad among disjoint pairs) plus the “both-good boundary switch” probability, to reproduce Dvořák’s boundary analysis with the extra structural constraints. The hope: these constraints force b strictly below 1/2.
- Auditable next step: Enumerate the finite type spaces explicitly (number of 2-edge types at v is small; number of Q3 types up to automorphism is also small), write the linear constraints, and solve the LP numerically to obtain a candidate γ > 0. If obtained, this gives a concrete target to then re-prove combinatorially.

Idea II: Classify Q3 patterns more finely to reduce the “a-case” bound below 1/2.
- In Dvořák’s proof, when both neighboring Q3’s are good (probability a), the probability of a boundary color switch at the common vertex is bounded by 1/2 + o(1). This is where structural savings may be hidden: for good Q3’s, the choice of f1 is not arbitrary; it tends to align with the majority color at the shared vertex in that Q3 (anchoring at a monochromatic star when present, see Lemma 8). Disjoint good cubes’ preferences may align more than random, leading to ≤ 1/2 − η for some absolute η.
- Concrete step: Enumerate good Q3 isomorphism classes; for each class and a marked vertex, compute c_v (the color at v chosen by f1 in that Q3). Show that for two independent disjoint good cubes, P[c_v differ] ≤ 1/2 − η. Then the “a-term” contribution in Dvořák’s bound becomes (1/2 − η + o(1)) a, improving the constant.
- Why plausible: The anchored-good subclass (Lemma 8) contributes a positive mass where c_v equals the common color at v; when degrees at v are slightly imbalanced these dominate. Even in the balanced case, the structure of bad patterns (Lemma 9) implies that good patterns have a constrained “preferred color” at v. This can be tested computationally for Q3.

Modest but checkable auxiliary computations
- Re-derive the exact coefficient that Dvořák bounds in the “a-case.” In the paper (p. 5–6), the 1/2 + o(1) arises by a crude bound treating pairs of good v-neighbors that share another vertex as negligible. A tighter local counting (still within good Q3’s) may already give a c/n improvement in the “a-term.” While asymptotically negligible for our target, it will validate the direction and help calibrate the LP in Idea I.

Examples to stress-test claims
- Parity coloring (defined above):
  • All blocks have β_J = 1/2; the blue subgraph is disconnected: demonstrates failure of naive conductance claims.
  • Dvořák’s scheme applied here: almost surely a monochromatic antipodal path exists when n is even (choose blue if start and end in even parity class), but not necessarily via geodesics; confirms that the method’s lower-level constants must be disentangled from global connectivity phenomena.

Next steps (concrete, auditable)
1) Q3 pattern enumeration and “preferred color map” at a vertex.
- Task: List all 2-colorings of Q3 up to automorphism, mark the isomorphism classes that are good/bad (using Dvořák’s definition), and for each good class and marked vertex identify the color at the marked vertex selected by f1 (minimal changes; fix a deterministic tie-break). Output: a table of classes with weights.
- Deliverable: For two independent random good Q3’s at v with disjoint direction sets (approximating independence), compute the probability their f1-colors at v differ. If this is ≤ 1/2 − η for some η > 0, draft a lemma capturing this bias. If not, record the counterexample pattern mix.

2) LP bound for b using local consistency.
- Task: Set up a linear program over the frequencies of: (i) per-vertex degree of blue; (ii) per-pair 4-cycle type frequencies at v; (iii) Q3 pattern frequencies at v. Impose marginal constraints and consistency of pairs of disjoint triples at v. Maximize b subject to these constraints to test if b ≤ 1/2 − γ is forced by local structure. Start with a reduced symmetry model (assume per-vertex blue degree equals n/2) to simplify.

3) Repair of approach 1 (block phase) via endpoint-balance conditions.
- Task: Formulate and prove a corrected lemma: If in a block J and for each direction i ∈ J the set {x ∈ {0,1}^n : the i-edge at x is blue} has density in [ε, 1−ε] and additionally its correlation with the block-parity function p_J is at most 1−2ε, then the blue subgraph restricted to coordinates in J is connected within each coset of the other coordinates. Sketch a proof via expansion of a product of matchings with endpoint balance, or point out the precise obstacle.
- Usefulness: Even if this does not directly lead to a global δ, it will clarify what endpoint-balance one must enforce to get monochromatic long runs.

4) Document the exact dependence on b in Dvořák’s bound and isolate where boundary improvements can be inserted.
- Task: Rewrite the final inequality as switches ≤ (1/3 + b/12 + φ)a + ψ with explicit φ,ψ capturing the “a-case” boundary term. Identify the component where replacing 1/2 by 1/2 − η moves the final constant by η·(a/3). This will quantify how large an η is needed for a given lower bound on a.

Why these steps are promising
- They target the only parameter that matters in Dvořák’s calculation (b), or the only loose bound (the 1/2 in the a-case), and they incorporate cross-cube constraints (4-cycles and consistency) that weren’t used in the 3/8 bound. Either an LP certifies a strict gap or it produces extremal local statistics guiding a human proof.

Potential obstacles
- Independence assumptions between disjoint triples at v are false; the LP must encode enough consistency without exploding in size. Start with a relaxation.
- Ties in the f1 choice for good Q3’s must be resolved canonically to keep the model deterministic; otherwise adversarial tie-breaking could push probabilities toward 1/2.
- Even a verified η > 0 for the a-case might be offset by an adversarial increase in b; the LP must optimize both simultaneously.

Closing
- Immediate action items: (1) Implement Q3 pattern classification and compute c_v biases for good Q3’s; (2) Draft the LP skeleton and test a symmetric relaxation (n large, per-vertex blue degree n/2) to probe whether b ≤ 1/2 − γ is plausible under local constraints.

## Round 0001 — 2025-08-27T15:24:16.452965Z

Status and reading
- I did not receive output.md or notes.md in this round; I cannot audit curated results. I focus on the task.tex and Dvořák’s paper (EJC 2020) to make incremental, checkable progress.

Recap of Dvořák’s parameterization
- The modified-geodesic scheme partitions a random antipodal geodesic into Q3-blocks and uses a local map f to rewire inside each block. The expected number of switches becomes
  E[switches] ≤ (1/3 + b/12 + o(1)) n,
  where b is the probability that two uniformly random neighboring Q3’s (sharing exactly one vertex) are of mixed type (one good, one bad). Dvořák proved b ≤ 1/2 + o(1), giving (3/8 + o(1))n. Any constant improvement must force b ≤ 1/2 − γ for some absolute γ > 0 (unless one redesigns the scheme at a larger scale).

Gap in brainstorming item 1 (block-expander dichotomy)
- Claim in task.tex: “If a color occupies at least an ε-fraction of each δS_J for (1−θ) of the blocks, then that color has conductance Ω(ε).” This is false in general.
- Counterexample (fully explicit; checkable): Fix n and ε ∈ (0,1/2). For each direction i ∈ [n], choose a pairwise-disjoint set A_i ⊂ {0,1}^{n−1} of size ε·2^{n−1}. Color an edge (x, x ⊕ e_i) blue iff the projection of x onto coordinates [n]\{i} lies in A_i; otherwise color it red. Then for every block J, the blue fraction across δS_J (the union of directions i ∈ J) is exactly ε, so the premise holds with θ = 0. However, the blue subgraph is a disjoint union of matchings (every vertex is incident to at most one blue edge because the A_i are disjoint), hence it has zero conductance. Therefore the “deliverable sublemma” is invalid without additional pseudorandomness or degree-spread assumptions.
- Consequence: The “Case A” estimate “O(ε|J|) off-color edges per biased block” also lacks justification. Even if β_J = 1/2 + ε at the block scale, one can realize this with each direction i having exactly 1/2 + ε fraction blue; then any geodesic that flips each i once sees ≈ (1/2 − ε)m minority edges on average, not O(εm). Without extra structure (e.g., many near-monochromatic directions within the block), the proposed O(εm) bound is not achievable.

Corrected formulation (what would be sufficient)
- A plausible, fixable version would require both:
  (i) per-direction bias within “good” blocks: for at least (1−θ) blocks J, each direction i ∈ J has blue fraction in [1/2 + ε, 1] or [0, 1/2 − ε]; and
  (ii) vertex-level spread: every vertex is incident to at least ρm blue edges from these directions for some fixed ρ > 0 (ruling out disjoint concentration as in the counterexample).
- Under (i)+(ii), a matrix-Chernoff/random-walk argument on the sum of many (partially) present matchings could give a conductance lower bound Φ = Ω(ερ), yielding a long monochromatic burst and fewer switches. This is a new sublemma to be proven; current task: formalize an expander bound from degree and per-matching density lower bounds under adversarial placement (nontrivial because independence is absent). One candidate route: canonical paths that use, for each coordinate, the present-blue matching with probability ≥ ε and exploit that each vertex has ≥ ρm available blue directions.

Towards reducing b below 1/2
- Dvořák’s bound b ≤ 1/2 + o(1) was obtained by, for each vertex v, letting s(v) be the number of good Q3’s containing v and observing that the fraction of good–bad v-neighbor pairs is at most s(v)(k−s(v)) with k = C(n,3), maximized at s(v)=k/2. To beat 1/2 one needs extra constraints coupling the types of different triples through shared edges/4-cycles.
- Key observation: The dependence of type(T) on the coloring enforces monotone constraints beyond “monochromatic star ⇒ good.” For a fixed v, the type function T_v on 3-subsets of [n] is not arbitrary; it must satisfy many local consistency relations (e.g., coming from the bad-Q3 structure Lemma 9 and from overlaps with other vertices of the same Q3). Exploiting these should lower the extremal good–bad mixing below the naive s(k−s) bound.

Auditable plan: a local LP/SDP bound for b
- Variables: For a fixed vertex v, let p_{abc} be the frequency over 3-sets I ⊂ [n] of the color-pattern at v on the three incident edges in directions I, where a,b,c ∈ {R,B} in some canonical order. Enforce the exact marginals determined by the degree at v: P(3R)=C(r_v,3)/C(n,3), P(3B)=C(n−r_v,3)/C(n,3), and the sums over 2R1B, 1R2B follow combinatorially.
- Enrich with 4-cycle constraints: For any pair of directions i≠j, and a third k, the joint distributions across the two Q3’s with triples {i,j,k} and {i,j,k′} must be compatible with the coloring on the 4-cycle generated by i and j. This couples p-distributions for different k,k′.
- Add “badness filters” from Lemma 9: for a bad Q3, from each vertex v there must exist exactly-one-change antipodal geodesics with prescribed colors at v and v′. Encode this as linear constraints on the frequencies with which a 3-set is classified as bad given its edge-colors at all 8 vertices (the latter determined by the global edge-coloring restricted to the Q3).
- Objective: Maximize the expected proportion of good–bad neighbor pairs b_v at v over all feasible distributions; then average v. Any universal upper bound strictly below 1/2 gives the desired γ. This is implementable as a relaxation (LP or small SDP) on the local configuration space (dimension controlled by the number of edge-color patterns on Q3 up to symmetry). Deliverable: set up the constraint system and solve numerically to detect a gap γ > 0, then try to certify analytically a positive margin.

Small, checkable computations that feed the LP
- Per-vertex lower bound on good Q3’s: For r_v red degree at v, the fraction of 3-sets yielding a monochromatic star is
  τ_v = [C(r_v,3)+C(n−r_v,3)] / C(n,3) = x^3+(1−x)^3 + O(1/n), with x=r_v/n.
  Minimizing in x gives τ_v ≥ 1/4 − 3/(4n) + O(1/n^2). This refines Dvořák’s “≥ 1/4 − o(1)” and quantifies the o(1) term; it feeds into the good–good boundary switch bound but, by itself, cannot beat 1/2.

Conditional improvement via vertex-bias (a structural lemma)
- Define, for a good Q3 containing v, the “suggested color at v,” σ ∈ {R,B}, as the color of the first edge in (v, f(v,w)). For v with red-degree fraction x, the bias among the good triples that are monochromatic at v is proportional to x^3−(1−x)^3 = (2x−1)(1/2−x(1−x)). Thus, if a positive fraction of vertices have |2x−1| ≥ η, then among good–good neighbor pairs at those v the disagreement probability drops below 1/2 by a quantity Ω(η), improving the boundary contribution. This yields a conditional bound of the form
  E[switches] ≤ (3/8 − c·E_v[|2r_v/n − 1|]) n + o(n).
  This is checkable once one quantifies how often f(v,w) is driven by the monochromatic-star mechanism among good Q3’s. The obstruction: there exist colorings with r_v≡n/2 (balanced at every vertex), so unconditional gains cannot rely on vertex-star bias alone.

Toy counterexamples and sanity tests
- The “disjoint A_i” construction shows block-level density guarantees do not imply expansion or easy phase clustering. It also shows that any argument requiring O(εm) minority edges per block must use stronger per-direction or per-vertex assumptions.
- Balanced-at-every-vertex constructions (deg_R(v) ≡ n/2) plausibly exist; in such colorings, per-vertex label biases vanish, so good–good boundary disagreement can be ≈ 1/2. Any unconditional improvement must therefore act through inter-triple consistency constraints (the proposed LP/SDP plan).

Next steps (actionable)
1) Formalize and solve the local LP: enumerate Q3 edge-colorings up to isomorphism; identify “good” vs “bad” as in Dvořák; introduce variables for frequencies of these patterns across the hypercube under the restriction that pairs sharing a vertex are coupled by 4-cycles. Compute the maximal b over feasible distributions. Even a numerical γ ≈ 10^{-3} would guide the analytic step.
2) Prove a strengthened “no-tiling-by-bads” lemma: show that for any fixed vertex v, among the 3-sets I disjoint from a fixed 3-set J, the indicator that Q3(v,I) is bad cannot be independent of Q3(v,J) being bad; quantify a negative correlation. This would directly lower b.
3) Explore Q4-block variant: Define “good Q4” and a corresponding f with improved boundary synchronization, aiming to replace the b/12 term by (b′/12) with b′ < b. Start with computational exploration on Q4 patterns.
4) Salvage block-phase under strengthened hypotheses: formulate and prove a lemma that if in at least (1−θ) blocks each direction has per-direction bias ≥ ε and each vertex sees ≥ ρm majority-color edges within those blocks, then one phase yields O((1/m)+θ+(1−θ)(1−ερ)) n switches. This will be a stand-alone result useful in a hybrid approach.

Summary of progress this round
- Identified and rigorously refuted a key sublemma in the brainstorm (expansion from block-thick density), with an explicit counterexample that also invalidates the O(εm) minority-edge claim.
- Clarified that improving the (3/8) constant within Dvořák’s framework hinges on proving b ≤ 1/2 − γ and proposed a concrete, auditable LP/SDP program to capture necessary local constraints beyond the vertex-star bound.
- Provided refined per-vertex counting bounds and a conditional structural lemma showing how vertex bias would reduce boundary disagreement (useful in structural case analyses).
- Outlined concrete next steps (computational and analytic) to move toward a constant γ > 0.

## Audit of output.md and context
- Theorem A (KG(n,3) spectral bound) is correct and useful to certify that vertex-wise constraints alone cannot push b below 1/2: for n≥6, b ≤ 1/2 + 3/(2(n−3)). A small bookkeeping remark: the identity “global b is the average of b_v over v” uses that the number of v-neighbor pairs is ½·C(n,3)·C(n−3,3), independent of v.
- Note that substituting this bound into Dvořák’s formula yields E[switches] ≤ (3/8 + 1/(8(n−3)) + o(1))·n, which is a slightly weaker upper bound than 3/8 + o(1) (the +1/(8(n−3)) is positive). This is not an improvement, but it cleanly quantifies the o(1) term achievable from per-vertex information alone.
- Lemma B (monochromatic-star count) is correct. It will be a useful input to quantify biases at vertices.

## New idea: quantify both-good boundary savings via a per-vertex bias parameter
We isolate the exact contribution of “both-good” v-neighbor pairs, improving Dvořák’s generic 1/2 bound by a vertex-level bias term that can later be lower-bounded in structural cases.

Definition (preferred color distribution at v among good Q3). For a vertex v, for each good Q3(v,K) and the map f1 used inside that Q3, define c_v(K) ∈ {R,B} as the color of the first edge at v along (v, f1(v,w)). Let t_v be the number of good Q3 containing v and let
\[ p_v := \mathbb{P}_{K\mid v,\,\text{good}}\big[c_v(K)=\R\big] = r_v^{(g)}/t_v,\quad u_v := |2p_v−1|. \]
Here r_v^{(g)} counts K with c_v(K)=R. By Lemma 8 and the definition of f1, c_v(K) is well defined (ties are broken deterministically within f1).

Lemma (both-good boundary disagreement at v). Among pairs of good v-neighbor Q3’s (disjoint triples) chosen uniformly, the probability that their f1-preferred colors at v differ is
\[ \le \frac{1}{2} - \frac{u_v^2}{2} + O\!\left(\frac{1}{n}\right). \]
Sketch. If we sampled two good triples uniformly without replacement from the t_v good triples, the exact fraction of disagreeing unordered pairs would be r_v^{(g)}(t_v−r_v^{(g)})/\binom{t_v}{2} = \frac{t_v}{t_v−1}\cdot 2p_v(1−p_v) = \frac{t_v}{t_v−1}\cdot\left(\frac{1}{2} − \frac{u_v^2}{2}\right). Restricting to v-neighbors excludes pairs that share a direction; for each fixed good Q3 there are at most O(n^2) “forbidden” partners (share ≥1 extra direction), so among \Theta(n^3) good triples this exclusion perturbs the pair distribution by O(1/n). Hence the bound follows.

Corollary (refined a-term). Writing a for the probability that two random neighboring Q3’s (sharing one vertex) are both good, the boundary-change probability in the both-good case satisfies
\[ \mathbb{P}[\text{boundary switch}\mid \text{both good}] \le \frac{1}{2} - \frac{1}{2}\,\mathbb{E}_v[u_v^2] + O\!\left(\frac{1}{n}\right). \]
Consequently, Dvořák’s expected-switch bound improves to
\[ \mathbb{E}[\text{switches}] \le \Big( \tfrac{1}{3} + \tfrac{b}{12} + \tfrac{a}{3}\big( \tfrac{1}{2} - \tfrac{1}{2}\,\mathbb{E}_v[u_v^2] + O(\tfrac{1}{n})\big) + o(1) \Big) n 
= \Big( \tfrac{1}{3} + \tfrac{b}{12} + \tfrac{a}{6} - \tfrac{a}{6}\,\mathbb{E}_v[u_v^2] + o(1) \Big) n. \]
This cleanly isolates a quantitative source of savings: any universal lower bound on \(\mathbb{E}_v[u_v^2]\) yields a constant improvement over 3/8.

Why useful here. This replaces the crude 1/2 in the a-term by 1/2 − (1/2)·E_v[u_v^2] + o(1). It is fully compatible with Dvořák’s framework and reduces the problem to exhibiting a nontrivial global bias among preferred colors at vertices, or to a dichotomy: either E_v[u_v^2] is bounded away from zero (immediate gain) or a “near-balanced” structure holds that we can try to exploit to force b ≤ 1/2 − γ.

## A conditional special case: degree-biased colorings force savings
Link u_v to the edge-color degree imbalance at v using star-good triples.
- Let x_v := r_v/n be the red-degree fraction at v. Among good triples, at least the monochromatic-star triples contribute, and for those c_v(K) equals the star color at v. Thus
  \[ p_v \ge \frac{\binom{r_v}{3}}{t_v},\quad 1-p_v \ge \frac{\binom{n-r_v}{3}}{t_v},\quad t_v \ge \binom{r_v}{3}+\binom{n-r_v}{3}. \]
- Hence \(u_v \ge \dfrac{\big|\binom{r_v}{3} - \binom{n-r_v}{3}\big|}{\binom{r_v}{3}+\binom{n-r_v}{3}}\). For x_v = 1/2 + \eta with |\eta| ≪ 1, a Taylor expansion gives \(u_v \gtrsim 6|\eta| + O(\eta^3)\).
- Therefore, if a positive fraction \(\rho\) of vertices satisfy |x_v − 1/2| ≥ \eta₀, then \(\mathbb{E}_v[u_v^2] \ge c\,\rho\,\eta_0^2\) for some absolute c > 0. Plugging into the corollary gives a concrete improvement \(\delta \ge c'\,a\,\rho\,\eta_0^2\).
This yields an auditable gain in the “degree-biased” regime. The hard case is the “globally balanced” regime where x_v ≈ 1/2 for most v.

## Obstacles and where the improvement must come from in the balanced regime
- There may exist colorings with x_v ≈ 1/2 for all (or almost all) vertices, killing the above degree-based bias. In this regime, any gain must come from structural constraints coupling the c_v(K) labels across different K (4-cycle/face consistency) and from the interaction between good and bad Q3’s (parameter b).
- The spectral KG(n,3) bound shows that cuts G_v⊂C([n],3) alone do not force b < 1/2. We must exploit cross-vertex and cross-triple constraints inherently present in the cube that the Kneser abstraction discards.

## Concrete, checkable next steps
1) Formalize and add the “both-good refinement” lemma to output.md. It is self-contained and only uses counting over t_v and the O(n^2)-exclusion argument already present implicitly in Dvořák’s proof. This yields a parameterized improvement term −(a/6)·E_v[u_v^2]·n.
2) Quantify the degree-bias case: write a short lemma proving u_v ≥ c·|2x_v−1| for star-driven minima (as above), with explicit c from exact binomial ratios, and derive the resulting δ in terms of the density of vertices with |2x_v−1| ≥ η.
3) Begin the LP relaxation in the balanced case (x_v ≈ 1/2):
   - Variables: for a fixed v, frequencies over Q3 isomorphism classes with a marked vertex and their c_v labels; frequencies over pairs of disjoint triples at v and their joint c_v labels; optionally include a minimal set of Q6-face constraints encoding compatibility between the two Q3’s via shared 4-cycles not passing through v.
   - Constraints: (i) normalization and marginalization; (ii) the fraction of good Q3 at v is ≥ τ_v ≥ 1/4 − 3/(4n); (iii) Dvořák’s Lemma 9 filters for bad Q3; (iv) symmetry under color swap and coordinate permutations.
   - Objective: maximize b subject to these constraints and u_v ≤ ε for all v (the “balanced” regime). If the optimum yields b ≤ 1/2 − γ for some absolute γ, we obtain the desired dichotomy.
4) Enumeration task for Q3 classes: catalog all 2-colorings of Q3 up to automorphism; for each class and marked vertex, determine “good/bad” and, for good, list all minimal-change geodesics’ starting colors at the marked vertex. This table will supply exact constraints for (3).

## Sanity checks and small examples
- For any v, if all good Q3’s containing v are anchored at v (monochromatic star), then u_v = |2x_v−1| and the both-good disagreement probability at v equals 1/2 − (2x_v−1)^2/2 + O(1/n), giving a clear deviation from 1/2 when x_v≠1/2.
- In a random coloring (each edge red/blue with prob 1/2 independently), heuristic suggests u_v concentrates near 0 and b≈1/2, matching the expectation that our improvement must come from worst-case structural constraints rather than average-case randomness. The LP aims exactly at the worst-case.

## Why this is incremental, auditable progress
- The both-good refinement is a precise, verifiable tightening of a step in Dvořák’s estimate; it cleanly introduces a measurable parameter u_v that future steps can bound from below.
- The conditional degree-bias improvement gives a family of explicit special cases yielding an immediate δ.
- The LP setup is concrete: it targets the balanced regime where the degree-based route fails, and it encodes local consistency that the Kneser graph abstraction ignores. Numerical experimentation on this relaxation can expose a positive margin γ and guide a combinatorial proof.

## Open gaps to flag explicitly
- output.md currently does not include the both-good refinement; adding it will make transparent how vertex-level biases translate to reduced switches.
- We do not yet have a universal lower bound on E_v[u_v^2]. Establishing a dichotomy (either E_v[u_v^2] ≥ δ0 or b ≤ 1/2 − γ0) via the LP is the key next milestone.

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

## Round 0003 — Anchored–anchored refinement, unconditional a-lower bound, and integrating a quantitative gain into Dvořák’s boundary term

Status and quick audit of output.md
- Theorem A (KG(n,3) spectral MAX-CUT bound for b) and Lemma B (monochromatic-star fraction τ_v) look correct and useful as book-keeping tools. Note: The numerical corollary “(3/8 + 1/(8(n−3)) + o(1))·n” is not an improvement on 3/8; it only makes the o(1) explicit.
- Lemma C (pair-sampling under disjointness) and Corollary D (both-good disagreement at v equals 1/2 − u_v^2/2 ± O(1/n)) are in good shape; the O(n^2/t) error with t=Θ(n^3) yields O(1/n) as intended.
- Missing ingredients to be added later: (i) an explicit import/citation that “anchored at v ⇒ good Q3” (Dvořák Lemma 8) to justify t_v=Θ(n^3) uniformly; (ii) a clean integration of Corollary D into Dvořák’s expected-switch calculation (it currently appears only as a local bound at v); and (iii) a refined anchored–anchored counting lemma with exact formulas and asymptotics (see below).
- Important correction (for our ongoing notes): in Dvořák’s proof, the expected number of switches inside a Q3-block is 1 − p/2 (not 1 − p^2). The final bound (1/3 + b/12 + o(1))·n comes from 1 − p/2 + (b/2 + (1/2 + o(1))a) and p = a + b/2.

Key new lemmas and quantitative refinements (ready to curate next)
1) Anchored–anchored pair mass at a vertex and its minimizer.
- Fix a vertex v with r red and b:=n−r blue incident edges. For an ordered disjoint pair of 3-sets (K,L) at v, both cubes Q3(v,K) and Q3(v,L) are anchored at v iff the three edges at v in the directions of K are monochromatic, and likewise for L. The exact anchored–anchored ordered-pair count equals
  C(r,3)C(r−3,3) + 2 C(r,3)C(b,3) + C(b,3)C(b−3,3),
  and the denominator (all ordered disjoint pairs) equals C(n,3)C(n−3,3). Thus the anchored–anchored probability at v is
  H(r,n) = [C(r,3)C(r−3,3) + 2 C(r,3)C(b,3) + C(b,3)C(b−3,3)] / [C(n,3)C(n−3,3)].
- As n→∞ with x=r/n, H(r,n) = (x^3 + (1−x)^3)^2 + O(1/n), which is minimized at x=1/2 (since s(x):=x^3+(1−x)^3 is minimized at 1/2). Hence for all large n, H(r,n) ≥ 1/16 − O(1/n), with equality asymptotically at r≈n/2. Next step: give a discrete proof (monotonicity of H(r+1,n)−H(r,n) changing sign at ⌊n/2⌋) valid for all n≥6.

2) Unconditional lower bound on a (both cubes good).
- “Anchored at v ⇒ good” (Dvořák Lemma 8) implies that anchored–anchored pairs are a subset of both-good pairs. Therefore, averaging over v and the (uniform) choice of a v-neighbor pair,
  a ≥ E_v[H(r_v,n)].
- Using the asymptotic from (1), we obtain a uniform, absolute lower bound:
  a ≥ 1/16 − O(1/n).
- Strengthening: One can avoid asymptotics by a direct application of Lemma C to the anchored-triple set T_v (of size t_v^anc = C(r_v,3)+C(n−r_v,3)): for a random disjoint pair from all triples, P[both anchored at v] = τ_v^2 ± O(1/n). Since τ_v is minimized at r_v≈n/2 and τ_v ≥ 1/4 − 3/(4n) (Lemma B), the anchored–anchored mass at v is ≥ (1/4 − 3/(4n))^2 − O(1/n), yielding the same absolute bound a ≥ 1/16 − O(1/n).

3) Anchored–anchored disagreement probability and its quadratic drop from 1/2.
- Conditioning on both being anchored at v, the exact disagreement probability equals
  P_v[disagree | anchored] = 2 C(r,3) C(b,3) / [C(r,3)C(r−3,3) + 2 C(r,3)C(b,3) + C(b,3)C(b−3,3)].
- As n→∞ with x=r/n and t=x−1/2,
  P_v[disagree | anchored] = 2x^3(1−x)^3 / (x^3+(1−x)^3)^2 + O(1/n)
                           = 1/2 − 18 t^2 + O(t^4 + 1/n).
  Thus, for vertices with degree imbalance |x−1/2|≥η, anchored–anchored pairs alone produce a drop below 1/2 of order Ω(η^2).

Integrating into Dvořák’s boundary step (unconditional quantitative gain)
- In Dvořák’s calculation, the boundary contribution across the k−1 junctions is bounded by (b/2 + (1/2 + o(1)) a)·(n/3). Using (2)–(3), we can refine the both-good (a-term) contribution without invoking any additional structure:
  • Let J denote the event “at a random junction, the two neighboring Q3’s are both anchored at their shared vertex.” By the above, P[J] = E_v[τ_v^2] ± O(1/n) ≥ (1/16 − o(1)).
  • On J, the boundary switch probability is 1/2 − 18 E_v[(x_v−1/2)^2 | J] + o(1); off J but still in the both-good case we keep the crude 1/2 bound.
  • Therefore, the unconditional both-good boundary-switch probability drops from (1/2)·a by at least
    Δ_total ≥ 18·E_v[(x_v−1/2)^2 · 1_J] − o(1) = 18·E_v[T_v·τ_v^2] − o(1),
    where T_v:=(x_v−1/2)^2 and we used P[J | v] = τ_v^2 ± O(1/n).
- Consequently, the expected number of switches satisfies the refined inequality
  E[switches] ≤ [ (1 − p/2) + (b/2 + (1/2)a − Δ_total) ]·(n/3) + o(n)
               = (1/3 + b/12)·n − (Δ_total/3)·n + o(n).
- Using τ_v ≥ 1/4 − O(1/n), we obtain a clean unconditional corollary:
  E[switches] ≤ (1/3 + b/12)·n − 6·E_v[T_v]·(1/16 − o(1))·n + o(n)
               = (1/3 + b/12)·n − (3/8)·E_v[T_v]·n + o(n).
  Thus, in any coloring with nontrivial mean-square degree imbalance E_v[T_v] ≥ ε, we gain a linear improvement of magnitude (3ε/8 − o(1))·n over the baseline (1/3 + b/12)·n. The balanced-degree regime (E_v[T_v] ≈ 0) remains the hard case, where we must force b ≤ 1/2 − γ via structural constraints.

Why useful here
- The anchored–anchored analysis yields two robust facts: an absolute lower bound a ≥ 1/16 − o(1), and a quantitative drop of the both-good boundary switch probability by a term ≥ 18·E_v[T_v·τ_v^2] − o(1). These are unconditional and compatible with Dvořák’s scheme. They give an explicit, checkable source of savings whenever degree variance is non-negligible, sharply isolating the balanced-degree regime for further work on b.

Examples and sanity checks
- Perfectly balanced degrees (r_v ≡ n/2): τ_v ≈ 1/4, H ≈ 1/16, P[disagree | anchored] = 1/2; our refinement produces no gain, as expected.
- Biased degrees (say x_v ≡ 1/2+0.1 on a positive fraction of vertices): T_v = 0.01. Then P[disagree | anchored] ≈ 1/2 − 0.18, and τ_v ≈ 0.251..., so Δ_total ≳ 18·0.01·(0.25)^2 ≈ 0.01125, giving an absolute reduction of about 0.00375·n switches after the (1/3) factor—substantial at scale.

Obstacles and open technical points
- Discrete minimization: Provide a self-contained proof (no asymptotics) that H(r,n) is minimized at r∈{⌊n/2⌋,⌈n/2⌉} for all n≥6.
- Weighting caveat: The “both-good” boundary probability is an average over vertices weighted by the mass of both-good v-neighbor pairs. We sidestepped this by extracting an unconditional Δ_total via anchored–anchored pairs. A stronger refinement (using Corollary D’s u_v) should control the conditional drop 1/2 − P[switch | both-good] by a weighted average of u_v^2; formalizing a lower bound on the weighted mean in terms of E_v[u_v^2] would further improve the statement. A natural route is to show Cov(t_v^2, u_v^2) ≥ 0 (t_v is the count of good triples at v), yielding a weighted-average ≥ uniform-average inequality.
- Balanced regime: We still need to push b ≤ 1/2 − γ using local consistency (4-cycles, badness structure). This remains the central challenge.

Next steps (concrete, auditable)
1) Curate two new lemmas into output.md:
   - Lemma E (Anchored–anchored mass and a≥1/16 − O(1/n)) with a short proof via Lemma C and Lemma B.
   - Lemma F (Anchored–anchored disagreement probability and the 1/2 − 18t^2 expansion), with a precise derivation as above.
   Then state the refined global inequality: E[switches] ≤ (1/3 + b/12)·n − (Δ_total/3)·n + o(n), with Δ_total ≥ 18·E_v[T_v·τ_v^2] − o(1).
2) Prove discrete minimization of H(r,n): Show H(r+1,n)−H(r,n) changes sign exactly once at ⌊n/2⌋ (discrete convexity of r↦C(r,3) and a careful telescoping argument on the product terms).
3) Balanced-degree regime LP: Begin the LP in the symmetric case r_v≡n/2. Variables: frequencies of 4-cycle types at v; frequencies of Q3 pattern classes with a marked vertex and their f1-start color. Constraints: marginalization, 4-cycle consistency, Dvořák badness filter (Lemma 9). Objective: maximize b subject to these constraints. Deliverable: a numerical upper bound strictly below 1/2 (even γ≈10^{-3} would be compelling).
4) Enumerate Q3 types with a marked vertex (up to automorphism), classify good/bad and, for good, the f1-start color at the mark. This feeds (3) and also allows a refined both-good analysis beyond anchored cubes.

Why this is progress
- We obtained an absolute lower bound a≥1/16−o(1) and a concrete, unconditional reduction Δ_total in the both-good boundary term proportional to the mean-square degree imbalance. These are new, testable refinements within Dvořák’s framework. They carve out the balanced regime as the sole obstruction and set up the LP attack on b ≤ 1/2 − γ under local consistency constraints.

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

## Round 0004 — 2025-08-27T19:53:15.052036Z

Round 0004 — Exact anchored drop inequality; clean global integration; comments on output.md

Quick audit of output.md (gaps and precisions)
- Positive: The curated Lemma E0 (membership under disjointness), Lemma F (anchored–anchored counts and the closed form P_v[disagree | anchored]), Corollary H (a ≥ 1/16 − O(1/n)), and Proposition G (uniformity of the shared boundary vertex) are all correct and highly useful.
- Minor clarity: Lemma F treats ordered pairs; most boundary probabilities are symmetric under swapping the two neighboring Q3’s. The ordered/unordered distinction does not affect the ratios we use (it cancels), but stating this explicitly where the boundary step is integrated would forestall confusion.
- Missing integration: The refined both-good boundary contribution (anchored savings) is not yet written as a global inequality. With Proposition G and Lemma E0 now curated, we can add it rigorously. I provide a clean statement and proof below (Proposition J’), together with a universal, exact anchored-drop inequality (Lemma I) that avoids asymptotics.

New lemmas (exact, checkable) — to add
- Lemma I (Universal anchored-drop inequality).
  • Statement. Let r be the red degree at a vertex v and set x:=r/n and t:=x−1/2. In Lemma F, the anchored–anchored conditional disagreement probability equals
    P_v[disagree | anchored] = 2x^3(1−x)^3 / (x^3+(1−x)^3)^2.
    Then, for all x∈[0,1],
    1/2 − P_v[disagree | anchored] ≥ 2 t^2 = 2 (r/n − 1/2)^2.
  • Proof. Write u:=t^2∈[0,1/4] and y:=4u∈[0,1]. Using the identities x(1−x)=1/4−u and x^3+(1−x)^3=1/4+3u, we compute
    P_v[disagree | anchored] = 2(1/4−u)^3 / (1/4+3u)^2.
    Hence the claimed inequality is equivalent to
    2(1/4−u)^3 ≤ (1/2−2u)(1/4+3u)^2.
    Multiplying out and scaling by 32, this becomes (1−y)^3 ≤ (1−y)(1+3y)^2, i.e., (1−y)^2 ≤ (1+3y)^2, which is true for all y∈[0,1]. Equality holds at y=0 and y=1. ∎
  • Why useful: This gives an absolute quadratic drop from 1/2, uniform in n and without O(·) terms, and is tight at the extremes. It upgrades the asymptotic 18t^2 expansion to a rigorous inequality valid for all r.

- Proposition J’ (Global anchored savings in the boundary step).
  • Setup. Use Dvořák’s scheme with k:=n/3 blocks and boundaries j=1,…,k−1. Let Bj be the event that both neighboring Q3’s at boundary j are good, and Aj the subevent that both are anchored at their shared vertex v_{3j}. Let τ_v be as in Lemma B and T_v:=(r_v/n − 1/2)^2.
  • Claim. For either choice f∈{f1,f2} from Dvořák’s proof, the boundary-switch probability at boundary j satisfies
    P[switch at boundary j] ≤ b/2 + (a/2) − E[ 1_{Aj} · (1/2 − P_v[disagree | anchored]) ] + o(1),
    where the expectation averages over the random geodesic and the boundary index j, and v is the shared boundary vertex.
    Consequently,
    E[switches] ≤ (1/3 + b/12)·n − (2/3)·E_v[ τ_v^2·T_v ]·n + o(n).
  • Proof. The baseline bound b/2 + (1/2)a + o(1) for P[switch at a boundary] is exactly Dvořák’s estimate, with the o(1) from excluding pairs sharing more than one vertex. On the subevent Aj, by Lemma I we have 1/2 − P_v[disagree | anchored] ≥ 2T_v; hence on Aj the both-good contribution drops by at least 2T_v. On B_j∖A_j (both good but not both anchored), we keep the crude 1/2 bound. Therefore
    P[switch at boundary j] ≤ b/2 + (a/2) − E[ 1_{Aj}·(1/2 − P_v[disagree | anchored]) ] + o(1).
    By Proposition G, v=v_{3j} is uniform over V(Q_n), and by Lemma E0, P[Aj | v] = τ_v^2 ± O(1/n). Combining with Lemma I and averaging over j gives
    E[ 1_{Aj}·(1/2 − P_v[disagree | anchored]) ] ≥ E_v[ τ_v^2·(2T_v) ] − O(1/n).
    Summing over the k−1≈n/3 boundaries yields the stated global inequality. ∎
  • Corollary (explicit unconditional gain in degree-unbalanced regime). Since τ_v ≥ 1/4 − 3/(4n) (Lemma B), we have τ_v^2 ≥ 1/16 − O(1/n) uniformly. Hence
    E[switches] ≤ (1/3 + b/12 − (1/24 − o(1))·E_v[T_v])·n + o(n).
    Thus any fixed lower bound on the mean-square degree imbalance E_v[T_v] yields a linear constant improvement over the (1/3 + b/12) baseline.

Why this is useful here
- Lemma I eliminates the asymptotic expansion in Lemma F and gives a clean, exact inequality. Proposition J’ completes the missing integration, showing precisely how anchored pairs reduce the both-good boundary contribution and quantifying the net effect.
- The corollary isolates the “balanced-degree” regime (E_v[T_v]≈0) as the only obstruction; this sharpens the target for the b-optimization program (LP/SDP in the balanced case).

Examples and sanity checks
- Extremal balance r_v≡n/2: T_v≡0 implies no anchored savings, recovering Dvořák’s baseline (1/3 + b/12 + o(1))·n.
- Extremal bias r_v∈{0,n}: T_v=1/4, τ_v=1, Lemma I gives 1/2 − P[disagree|anchored]=1/2. Proposition J’ then yields E[switches] ≤ (1/3 + b/12 − (2/3)·(1·1/4))·n = (1/3 + b/12 − 1/6)·n. This matches the intuition that fully monochromatic stars at every vertex allow very low boundary switch rates.

Ideas toward the balanced regime (b ≤ 1/2 − γ)
- LP skeleton refinement (balanced r_v≡n/2):
  • Variables: frequencies of the 4-cycle types at v; frequencies of marked-Q3 types (good/bad) with f1-start color at v; frequencies of disjoint marked-Q3 pairs at v with type-type combinations (subject to symmetry constraints).
  • Constraints: marginalization to 1-edge and 4-cycle types; Dvořák’s Lemma 9 “badness filter” at v and the opposite vertex of Q3; consistency across the four Q3’s sharing a fixed 4-cycle through v.
  • Objective: maximize b_v (good–bad fraction among disjoint pairs). Investigate numerically whether the optimum is < 1/2 under these local consistency constraints.
- Enumerative input: Enumerate 2-colorings of Q3 with a marked vertex up to Aut(Q3), tag good/bad, and, for good, record the f1-start color at the mark under a fixed tie-breaking.

Obstacles and notes
- Weighting: The boundary contribution is a weighted average over shared vertices; Proposition G addresses this by uniformizing v_{3j}. The only residual error is the O(1/n) from disjointness conditioning (Lemma E0), absorbed in o(1).
- Ordered vs unordered pairs: Our anchored calculations use ordered counts (Lemma F) but the translation to probabilities and to boundary events is invariant under order, so the distinction does not affect the inequalities; stating this explicitly in output.md would help.
- LP scale: Encoding joint constraints for disjoint marked-Q3 pairs may grow rapidly; symmetry reductions (balanced case, color-swap, coordinate permutations) will be crucial.

Next steps (auditable)
1) Add Lemma I and Proposition J’ (with proof) to output.md. This will complete the anchored-based refinement rigorously and yield the corollary with the explicit (1/24)·E_v[T_v] improvement.
2) Q3 pattern enumeration with a marked vertex: list isomorphism classes, classify good/bad, and, for good, record f1-start color at the mark. This feeds the LP in the balanced regime.
3) Build the first LP relaxation in the symmetric (balanced) case and solve numerically to test if b ≤ 1/2 − γ (γ>0) follows from 4-cycle and badness constraints.
4) Optional sharpening: Using Lemma F’s exact formula, one can improve the constant 2 in Lemma I for small |t| (the Taylor coefficient is 18). Prove a global bound of the form 1/2 − P_v[disagree|anchored] ≥ c·T_v with c>2 (e.g., c=3) valid for all t; this would slightly strengthen the anchored gain constant beyond 1/24 without relying on small-t asymptotics.

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

## Round 0005 — Complementary both-good refinement via u_v; boundary pair uniformity; and a sharper expression for the anchored drop

Audit of output.md (gaps/clarifications)
- The newly curated Lemma I and Proposition J look correct; the anchored-drop inequality is exact and the global integration is sound. The “tie-breaking” remark is no longer needed in anchored cubes (as noted in verifier feedback and also in notes.md): in an anchored Q3, all three edges at the shared vertex have the star color, so the boundary switch occurs iff the two star colors at the shared vertex differ, independently of how the minimal-change geodesics are fixed within each cube. No action needed beyond perhaps a clarifying sentence (already reflected in notes.md).
- One small-but-useful missing ingredient: an explicit statement that, at any fixed boundary j, the ordered pair of 3-sets (K_j,K_{j+1}) of directions defining the two neighbor Q3’s is uniform over all ordered disjoint 3-sets and independent of the shared boundary vertex v_{3j}. This uniformity is implicitly used when invoking Lemma E0/Lemma C at boundaries. I provide a clean proposition and proof below; adding it would make the conditioning steps in J/D-level refinements fully transparent.
- Opportunity for a complementary both-good refinement (beyond anchored): we can use Corollary D’s u_v-parameter directly for the both-good case at the boundary. This yields an independent and rigorous saving term ≥ (1/6)·E_v[τ_v^2·u_v^2]·n, which in turn gives a very clean corollary ≥ (1/96)·E_v[u_v^2]·n using τ_v ≥ 1/4 − O(1/n). This covers regimes where degree variance T_v is small but u_v retains variance due to non-anchored good cubes.

New, checkable propositions/lemmas (to add)

1) Proposition G2 (Uniform pair-of-block directions at a boundary and independence from v)
- Statement. In Dvořák’s random-permutation model, fix j∈{1,…,⌊n/3⌋−1}. Then the ordered pair (K_j,K_{j+1}) of 3-sets of directions used in blocks j and j+1 is uniformly distributed over all ordered disjoint pairs from C([n],3), and is independent of the shared boundary vertex v_{3j}.
- Proof. Let π be a uniform random permutation of [n], decomposed into 3-blocks (K_1,…,K_k) of consecutive 3 positions. For any ordered disjoint pair (A,B) of 3-sets, the number of π with K_j=A and K_{j+1}=B equals 3!·3!·(n−6)! (arrangements of A and B inside the 6 fixed slots, and permutations of remaining coordinates), independent of (A,B), hence (K_j,K_{j+1}) is uniform among ordered disjoint pairs. The boundary vertex v_{3j}=v_0⊕(⊕_{i≤3j}e_{π(i)}) depends only on v_0 and the earlier blocks (K_1,…,K_{j−1}), while (K_j,K_{j+1}) depends only on positions 3j−2,…,3j+3 in π. Under a uniform permutation, these parts are independent; v_0 is also independent. Hence (K_j,K_{j+1}) is independent of v_{3j}. ∎

2) Proposition K (Both-good boundary refinement via u_v)
- Setup. For a vertex v, let G_v⊆C([n],3) be good triples; define c_v:G_v→{R,B} as in Corollary D (first-edge color at v under f1 in a good Q3). Let u_v:=|2p_v−1| with p_v the c_v-red fraction. Let q_v be the boundary-level probability (under Dvořák’s random geodesic) that the two neighboring Q3’s at a boundary share vertex v and are both good.
- Statement. In Dvořák’s scheme, the both-good contribution at a boundary satisfies
  E[1_{both-good}·1_{switch at boundary}] = (a/2) − (1/2)·E_v[q_v·u_v^2] ± o(1).
  Consequently,
  E[switches] ≤ (1/3 + b/12)·n − (1/6)·E_v[q_v·u_v^2]·n + o(n).
  In particular, since q_v ≥ τ_v^2 − O(1/n) (anchored ⇒ good and Lemma E0),
  E[switches] ≤ (1/3 + b/12)·n − (1/6)·E_v[τ_v^2·u_v^2]·n + o(n)
  ≤ (1/3 + b/12 − (1/96)·E_v[u_v^2] + o(1))·n.
- Proof. Fix a boundary j and condition on the shared vertex v=v_{3j}. By Proposition G2, the ordered pair (K,L) of direction-sets is uniform over ordered disjoint pairs and independent of v. Condition further on “both good at v”: then (K,L) is uniform over ordered disjoint pairs in G_v. By Lemma C with T=G_v, we have P[c_v(K)≠c_v(L)] = 1/2 − u_v^2/2 ± O(1/n). Thus, conditioning on v, the both-good boundary switch probability equals q_v·(1/2 − u_v^2/2) ± O(1/n). Averaging v uniformly (Proposition G) and using E_v[q_v]=a (definition of a) yields the first displayed equality. Summing over ≈n/3 boundaries and adding the interior contribution 1 − p/2 per block gives the global inequality. The bound q_v ≥ τ_v^2 − O(1/n) follows since “anchored at v ⇒ good” and the probability of both anchored equals τ_v^2 ± O(1/n) by Lemma E0. Using τ_v ≥ 1/4 − O(1/n) gives the explicit 1/96 constant in the final corollary. ∎
- Why useful here. This yields a second, independent source of both-good savings that applies even when T_v is tiny. It converts vertex-level imbalance among preferred colors inside good Q3’s (u_v) into a linear-in-n gain.

3) Exact closed form and piecewise improvements for the anchored drop
- Exact expression. With T=(r_v/n − 1/2)^2 and R(x) as in Lemma I, one can write
  1/2 − R(x) = 2T · (9 + 24T + 16T^2)/(1 + 24T + 144T^2).
  Proof. Compute Q(T):=(1/4+3T)^2 − 4(1/4−T)^3 = (1/4)·T·(9 + 24T + 16T^2) and divide by 2(1/4+3T)^2.
- Consequences (auditable polynomial bounds):
  • Uniform inequality (Lemma I) re-proved: since (9 + 24T + 16T^2) ≥ (1 + 24T + 144T^2) for T∈[0,1/4], the ratio ≥1, giving 1/2 − R(x) ≥ 2T.
  • Small-T amplification. For any c∈(2,18), the inequality 1/2 − R(x) ≥ c·T holds for all T in [0,T_c], where T_c is the smallest positive root of (9 + 24T + 16T^2) − c(1 + 24T + 144T^2) ≥ 0. Two explicit instances:
    – c=6: inequality holds for T ≤ T_6 = (−24 + √3072)/416 ≈ 0.0755.
    – c=10: inequality holds for T ≤ T_10 = (−96 + √20480)/1408 ≈ 0.0335.
  These piecewise bounds can slightly improve constants in regimes with very small degree variance at many vertices.

How these pieces fit the overall plan
- We now have two rigorous, vertex-averaged savings for the both-good boundary term:
  • Anchored route (Proposition J): saving ≥ (2/3)·E_v[τ_v^2·T_v]·n.
  • u_v route (Proposition K): saving ≥ (1/6)·E_v[τ_v^2·u_v^2]·n.
  Either bound applies; in analysis we may take their maximum to get the strongest available improvement in a given instance. The anchored route is effective when degree variance is present; the u_v route can kick in even when degrees are nearly balanced but the good-Q3 preferred-color labels exhibit variance.
- The remaining hard regime remains: both T_v and u_v^2 concentrated near 0. There we must drive b ≤ 1/2 − γ by local consistency across 4-cycles and Q3-types.

Balanced-regime program for b (LP/SDP next steps, concrete)
- Variables at a vertex v with r_v=n/2 (symmetric case):
  1) 4-cycle type frequencies y_t (four isomorphism classes: monochromatic; two-adjacent; two-opposite; alternating).
  2) Marked-Q3 type frequencies z_π over isomorphism classes of 2-colored Q3 with a marked vertex v, tagged as good/bad (by Dvořák’s definition), and for good classes, the f1-start color at v.
  3) Pair variables for disjoint triples at v (linearized via standard product-to-new-variable trick), to express b_v.
- Constraints:
  • Normalization and marginalization from z_π to y_t and to star types at v.
  • 4-cycle consistency across the four marked Q3’s sharing a fixed 4-cycle through v.
  • Badness filters (Lemma 9) enforced at v and the opposite vertex of the marked cube.
  • Symmetry under color swap and S_n on coordinates; balanced degree r_v=n/2.
- Objective: maximize b_v (good–bad fraction among disjoint pairs). Any universal optimum < 1/2 yields γ>0. Enumerating the marked-Q3 classes is a finite task; a small script can produce the table of classes, their good/bad status, and f1-start colors.

Examples and sanity checks
- Random coloring (each edge red w.p. 1/2): heuristically u_v≈0 and T_v≈0, so both anchored- and u_v-routes give negligible savings, matching the intuition that average-case colorings are not the obstruction.
- Degree-biased coloring with x_v≡1/2+0.1 over a positive fraction of vertices: T_v=0.01; anchored drop per boundary ≥ 2T_v=0.02, scaled by τ_v^2≈(1/4)^2 gives ≳0.00125 per boundary, i.e., ≳0.00042·n total saving—consistent with Proposition J.

Next steps (auditable deliverables)
1) Curate Proposition G2 and Proposition K (with their short proofs) into output.md. They are self-contained and rely on already-curated Lemma C/E0 and Proposition G.
2) Optionally add the exact closed form 1/2 − R(x) = 2T·(9 + 24T + 16T^2)/(1 + 24T + 144T^2) with the two small-T corollaries.
3) Begin the balanced-regime LP: enumerate marked-Q3 2-coloring classes, tag good/bad and f1-start color at the mark; encode constraints and solve numerically. Report either a positive gap γ or an extremal local distribution to analyze combinatorially.

Explicitly flagged open points
- We still lack a universal lower bound on E_v[u_v^2] or E_v[T_v]. The only remaining route to a constant δ is to show b ≤ 1/2 − γ in the near-balanced regime via the LP/SDP or new structural lemmas.
- Discrete minimization of H(r,n) (anchored–anchored mass) at r≈n/2 is no longer needed for the core bounds (we use Lemma E0 and τ_v), but it may be added for completeness. A direct sign analysis of H(r+1,n)−H(r,n), using F(m)=C(m,3)C(m−3,3), should work; I can supply a proof if desired.

## Round 0005 — Firming up boundary sampling; explicit constants in the disjointness error; and a concrete LP blueprint for the balanced regime

### Quick audit of output.md (minor gaps and clarifications)
- Proposition J (global anchored savings) is sound. One minor sampling detail worth adding explicitly: at a random boundary, the ordered pair of 3-sets of directions flanking the boundary is uniform over all ordered disjoint pairs. This is implicitly used when applying Lemma E0; it is true by symmetry of the random permutation and block partition. I state this as Lemma K below for completeness.
- Lemma E0 (membership under disjointness) is used with an O(1/n) term. We can make the constant explicit by computing |S_K| exactly (see “Explicit constants for Lemma E0”). This will clarify error bookkeeping in Proposition J and Corollary J1.
- The present anchored-driven bound is already optimal in the sense that the coefficient 2 in Lemma I cannot be globally improved (as noted). Thus the only remaining obstruction to beating 3/8 unconditionally is the near-balanced regime where E_v[T_v]≈0. The LP/SDP program for b is the most promising next step.

### New, small, checkable lemmas and refinements

1) Lemma K (Uniformity of boundary 3-set pairs)
- Statement. Under Dvořák’s scheme with a uniform random permutation π of [n], partition [n] into contiguous 3-blocks B_1,…,B_k with B_j={π_{3j-2},π_{3j-1},π_{3j}}. Choose boundary j uniformly from {1,…,k−1}. Then the ordered pair (K,L):=(B_j,B_{j+1}) is uniformly distributed over all ordered pairs of disjoint 3-sets of [n].
- Proof idea. A random partition into k ordered blocks of size 3 is generated by the random permutation. Conditional on the partition, each B_j is a uniform 3-subset; conditioning further on B_j=K, the next block B_{j+1} is a uniform 3-subset of the remaining [n] \ K. Hence (K,L) is uniform among ordered disjoint pairs.
- Why useful here. It justifies the use of Lemma E0 (and Lemma F) at boundaries without additional averaging arguments.

2) Explicit constants for Lemma E0 (tight O(1/n) bound)
- Exact |S_K|. For a fixed 3-set K⊆[n], the number of 3-sets intersecting K equals |S_K| = C(n,3) − C(n−3,3) = (9n^2 − 45n + 60)/6 = (3/2)n^2 − (15/2)n + 10.
- Consequently, for any T⊆C([n],3) with |T|=τ·C(n,3) and a uniformly random ordered pair (K,L) of disjoint triples,
  |P[K∈T,L∈T] − τ^2| ≤ max_K |ε(K)| ≤ |S_K|/C(n−3,3)
  = (9n^2 − 45n + 60)/(n^3 − 12n^2 + 47n − 60) ≤ 10/(n−12) for all n≥20.
- Practical corollary. One may replace the O(1/n) in Lemma E0, Proposition J, and Corollary J1 by a concrete ≤ 10/(n−12), making all constants explicit (useful if we later optimize finite-n constants).

3) Finite-n constant in Proposition J (explicit c(n))
- Using Lemma B exactly, for even n we have τ_min = 2·C(n/2,3)/C(n,3); for odd n, τ_min = [C((n−1)/2,3)+C((n+1)/2,3)]/C(n,3).
- Hence Proposition J yields
  E[switches] ≤ (1/3 + b/12)·n − c(n)·E_v[T_v]·n + O(1),
  with c(n) = (2/3)·(τ_min)^2. In particular, c(n) → 1/24 as n→∞ and c(n) ≥ (1/24)·(1 − O(1/n)). This sharpens Corollary J1’s asymptotic statement to a finite‑n bound with an explicit coefficient.

### Discrete minimization of H(r,n) (status and plan)
- Claim (to be proved). For all n≥8, H(r,n) from Lemma F is minimized at r∈{⌊n/2⌋,⌈n/2⌉}.
- Sketch of approach. Write A(m)=C(m,3), and note H’s numerator equals A(r)A(r−3) + 2A(r)A(n−r) + A(n−r)A(n−r−3). Consider Δ(r)=Num(r+1)−Num(r) and show it changes sign exactly once at ⌊n/2⌋. The leading terms form a convex, symmetric polynomial in r (by asymptotics A(r)≈r^3/6), and small lower‑order corrections (the ±3 shifts) do not alter the location of the discrete minimizer for n≥8. I will carry out the exact discrete difference algebra next round.
- Why still useful. While Proposition J no longer relies on H(r,n), the minimization of H underpins optional anchored‑mass refinements and serves as an internal consistency check for our anchored estimates.

### Toward the balanced‑degree regime: an LP blueprint for bounding b
We now formalize a tractable LP in the symmetric (balanced-degree) regime r_v≡n/2, isolating local statistics at a fixed vertex v. The objective is to upper‑bound b_v (fraction of mixed edges across the cut (G_v, its complement) in KG(n,3)) under local consistency and Dvořák-style “badness” constraints; then average over v to bound b.

- Variables (at a fixed v):
  1) Star-type frequencies on 3-sets K: s_{3R}, s_{2R1B}, s_{1R2B}, s_{3B}. Balanced degrees impose s_{3R}=s_{3B}=τ (fixed by Lemma B) and s_{2R1B}=s_{1R2B}=(1−2τ)/2.
  2) 4-cycle-type frequencies y_t over unordered pairs {i,j}, where t∈{mono, two-adjacent, two-opposite, alternating}. Marginals must match the color-pair distribution at v: in the balanced case,
     y_mono + y_adjacent = P[RR]+P[BB] = C(n/2,2)/C(n,2) + C(n/2,2)/C(n,2) = 1/2,
     y_opposite + y_alternating = P[RB] = 1/2.
  3) Marked-Q3 pattern frequencies z_π over 2-colored Q3’s with a marked vertex v (up to Aut(Q3) with a mark), tagged as good/bad (per Dvořák) and, for good, the color chosen by f1 on the first edge at v. Each class π has an integer triple (a_π,b_π,c_π) counting how many of the three faces at v fall into each 4-cycle type; these induce linear constraints linking {z_π} to {y_t} and to the star types s_{·}.
  4) Pair variables for disjoint triples (K,L) that are v-neighbors. As in Lemma C/E0, the law over disjoint pairs is within O(1/n) of the product of the marginals. We thus linearize b_v by approximating the disjoint-pair distribution with the product distribution over K and L, adding a conservative ±O(1/n) slack in the constraints to absorb the dependency.

- Constraints:
  • Normalization: ∑_π z_π = 1; star/face marginals of the z_π equal s_{·}, y_{·}.
  • Dvořák badness filter: z_π=0 for patterns π violating Lemma 9’s characterization (i.e., bad Q3’s must admit antipodal geodesics from v with exactly one color change with prescribed endpoint colors; anchored classes are good by Lemma 8).
  • Symmetry under color swap: coupled with balance, this halves the variable set (e.g., s_{3R}=s_{3B}, s_{2R1B}=s_{1R2B}; likewise for z_π in color-swapped pairs).
  • Disjoint-pair linearization: the mixed mass b_v is a linear form in pair frequencies over (π,σ); we enforce upper bounds using the product-approximation and add an explicit O(1/n) slack (from Lemma E0) so the LP upper bound remains valid for finite n.

- Objective: Maximize b_v subject to the above constraints. Any universal optimum strictly below 1/2 (for n large) gives the desired γ>0 in b ≤ 1/2 − γ, certifying a constant improvement over 3/8 in the balanced regime.

- Why plausible: The inclusion of all anchored classes in “good”, together with 4-cycle consistency across the three faces at v in each Q3, should constrain the cut (G_v, ¯G_v) well below the vertexwise spectral MAX-CUT bound (which ignores such structure). Even a modest LP margin γ≈10^{-3} would suffice.

- Enumerative input (next deliverable): Provide the list of marked-Q3 isomorphism classes, their good/bad status, and (for good) the f1-start color at v. For each class, tabulate the triple (a_π,b_π,c_π) of face-types at v. This table pins down the linear map z_π ↦ (s_{·}, y_{·}).

### Small examples and sanity checks
- “One-direction dictatorial” Q3 (bad): all edges in one direction red, the other two directions blue. At any v, the star has type 1R2B or 2R1B depending on which of the three directions incident to v is the “red” one. Its three faces at v are: one monochrome (from the blue–blue pair), and two alternating (from the red–blue pairs). This pattern exactly matches Lemma 9’s behavior and will be an extremal bad class in the enumeration.
- Balanced-degree vertex: star-type frequencies over K computed directly are s_{3R}=s_{3B}=1/4 + O(1/n) and s_{2R1B}=s_{1R2B}=3/8 + O(1/n), consistent with Lemma B. The pair-of-edges at v over unordered {i,j} satisfy P[RR]=P[BB]=1/4, P[RB]=1/2, thus y_mono + y_adj=1/2 and y_alt + y_opposite=1/2 must hold in any feasible assignment.

### Obstacles and why previous routes fail here
- Anchored refinement cannot help in the balanced regime: τ_v hits its minimum and T_v≈0, so Proposition J yields no gain. Any further both-good refinement via u_v must overcome the adversary’s freedom to balance c_v within good classes, which may be possible in pathological colorings.
- Vertexwise Kneser-G cut bounds alone cannot beat 1/2: The spectral MAX-CUT gives b_v ≤ 1/2 + O(1/n), and without injecting cube-specific structure (anchored inclusion, 4-cycle consistency, badness filter) no universal γ>0 emerges.

### Concrete next steps (auditable)
1) Add Lemma K to output.md (uniformity of boundary 3-set pairs), with the short proof above.
2) Replace the O(1/n) in Lemma E0, Proposition J, and related corollaries by the explicit bound ≤ 10/(n−12), citing the exact |S_K| and C(n−3,3) formulae. This makes all finite‑n constants explicit.
3) Complete the discrete proof that H(r,n) is minimized at r≈n/2 for n≥8 (sign change of Δ(r)=Num(r+1)−Num(r)). Although not needed for Proposition J, it settles a standing claim from earlier rounds and may be reused in anchored‑mass refinements.
4) Begin the LP in the balanced regime:
   - Enumerate marked-Q3 classes up to Aut(Q3) with a mark; classify good/bad; for good, record f1-start color at v.
   - For each class, compute the triple (a_π,b_π,c_π) of face types at v among {mono, adj, opp, alt}.
   - Encode the LP (z_π variables; constraints to (s_{·}, y_{·}); product-linearization for b_v with ±10/(n−12) slack) and solve numerically for large n (treating asymptotic constraints). Any γ>0 will guide the ensuing combinatorial proof.

### Why this advances the program
- The new Lemma K closes a small but real sampling gap in Proposition J’s proof. The explicit constants for Lemma E0 strengthen all o(1) terms into precise O(1/n) with known coefficients, improving auditability.
- The LP blueprint isolates exactly which local statistics must be controlled to push b below 1/2 in the balanced regime. This is the remaining obstruction to a universal improvement below 3/8; each ingredient is finite, computable, and checkable.

### Explicitly flagged gaps (to be addressed)
- output.md does not yet contain Lemma K; add it.
- The finite‑n constant c(n) in Proposition J is not yet stated explicitly; add the formula c(n)=(2/3)·(τ_min)^2 with τ_min from Lemma B.
- The discrete minimization of H(r,n) remains unproven; I will supply a complete discrete argument next round.

## Round 0006 — 2025-08-27T20:17:27.083457Z

Round 0006 — Firming up the u_v-based both-good refinement: boundary–label equivalence, conditioning, and a rigorous global inequality; plus minor audits and next steps

Audit of output.md (gaps and clarifications)
- Good: The anchored-driven refinement (Lemma I, Proposition J, Corollary J1, I.1) is now rigorous and self-contained; Lemma K (uniformity of boundary direction pairs) and Corollary E0.1 provide the needed sampling backbone with explicit finite-n constants.
- Gap to close: The complementary both-good refinement via u_v (outlined in notes.md and earlier rounds) is still missing from output.md because we had not yet proved that the boundary switch equals the disagreement of the c_v labels when both neighboring Q3’s are good. This round supplies that equivalence and the uniformity-of-conditioning step, enabling a rigorous Proposition (K-type) and its global corollary.

New lemmas (ready to curate)
- Lemma L (Boundary–label equivalence for good Q3’s at the shared vertex v). Fix a good Q3(v,w) and Dvořák’s choice f∈{f1,f2}, so the path used inside Q3(v,w) from v to w is (v, f(v,w), f(w,v), w). Define c_v(K) to be the color of the edge (v, f(v,w)) (as in Corollary D). Consider a boundary between two consecutive blocks with shared vertex v where the previous block uses Q3(v′,v) and the next block uses Q3(v,w). Then the color of the incoming edge at v (last edge of the previous block) equals the color of the edge (f(v,w), v) in Q3(v,w) and thus equals c_v of the previous cube’s 3-set; the color of the outgoing edge at v (first edge of the next block) equals the color of (v, f(v,w)) and thus equals c_v of the next cube’s 3-set. Hence, on the both-good event, “switch at the boundary” is exactly the event [c_v(K_prev) ≠ c_v(K_next)].
  Proof. For the previous block Q3(v′,v), the used path is (v′, f(v′,v), f(v,v′), v). The last edge at v is (f(v,v′), v), which is the same undirected edge as (v, f(v,v′)) whose color defines c_v(K_prev). For the next block Q3(v,w), the first edge at v is (v, f(v,w)), which is exactly the edge whose color defines c_v(K_next). Since edge colors are undirected and f satisfies d(f(w,v), f(v,w))=1, the boundary switch occurs iff these two colors differ. ∎

- Proposition G3 (Both-good conditioning is uniform on disjoint good pairs and E_v[q_v]=a). Fix a boundary index j. Condition on the shared vertex v=v_{3j}. By Lemma K, the ordered pair (K,L) of direction 3-sets is uniform over ordered disjoint pairs and independent of v. Conditioning further on K,L∈G_v (both cubes good at v), (K,L) is uniform over ordered disjoint pairs from G_v. Consequently, with q_v := P[K,L∈G_v | v], we have E_v[q_v] = a, where a is the global both-good probability for neighboring Q3’s.
  Proof. Uniformity before conditioning is Lemma K. Conditioning on K,L∈G_v restricts to a uniform law on the induced set of disjoint good pairs. Averaging over v (uniform by Proposition G) yields E_v[q_v]=P(both good)=a. ∎

Proposition K (Both-good boundary refinement via u_v — rigorous statement and proof)
- Setup at v. Let G_v⊆C([n],3) be the set of good triples at v, c_v: G_v→{R,B} the label defined in Corollary D, p_v the red fraction, and u_v:=|2p_v−1|.
- Boundary-level identity. At a fixed boundary j with shared vertex v, on the event that both neighboring Q3’s are good, Lemma L implies
  P[switch at boundary j | v, both-good] = P[c_v(K)≠c_v(L) | v, K,L∈G_v].
  By Proposition G3, (K,L) is uniform over ordered disjoint pairs from G_v; hence by Corollary D (pair-sampling under disjointness),
  P[switch | v, both-good] = 1/2 − u_v^2/2 ± O(1/n).
- Averaging (using E_v[q_v]=a). Let q_v := P[K,L∈G_v | v]. Then
  E[1_{both-good}·1_{switch at boundary}] = E_v[q_v·(1/2 − u_v^2/2)] ± O(1/n)
  = (a/2) − (1/2)·E_v[q_v·u_v^2] ± O(1/n).
- Global bound. Summing over ≈n/3 boundaries and adding the interior 1 − p/2 per block, we obtain
  E[switches] ≤ (1/3 + b/12)·n − (1/6)·E_v[q_v·u_v^2]·n + o(n).
- Unconditional corollary (via the anchored lower bound on q_v). Since anchored triples A_v ⊆ G_v, Lemma E0 with T=A_v gives q_v ≥ P[K,L∈A_v | v] = τ_v^2 ± O(1/n). Therefore
  E[switches] ≤ (1/3 + b/12)·n − (1/6)·E_v[τ_v^2·u_v^2]·n + o(n)
  ≤ (1/3 + b/12 − (1/96)·E_v[u_v^2] + o(1))·n,
  using τ_v ≥ 1/4 − O(1/n).
- Why useful here. This furnishes a second, independent both-good saving that can be nontrivial even when the degree-variance T_v is tiny but the good-cube label bias u_v has variance. In particular, in highly biased stars (e.g., r_v∈{0,n}), u_v=1 and τ_v=1, and the bound yields the same −1/6 savings per n as the anchored route, matching expectations.

Consistency and non-overcounting
- The anchored-driven bound (Proposition J) and the u_v-driven bound (Proposition K) both act on the both-good boundary term. They should not be added; instead, one may take their pointwise maximum or pick the stronger one for a given coloring. For the purposes of output.md, we recommend adding Proposition K as an independent refinement and stating the final bound as the minimum of the two right-hand sides; in analysis we can use whichever gives the larger saving.

Small sanity checks
- Balanced degrees and balanced labels: If r_v≡n/2 and c_v is balanced (u_v≡0), then Proposition K yields no improvement, as desired. Proposition J also yields no improvement (T_v≡0); we revert to Dvořák’s baseline (1/3 + b/12 + o(1))·n.
- Extreme bias: If r_v∈{0,n} and (hence) u_v≡1 and τ_v≡1, Proposition K gives a saving (1/6)·n, consistent with Proposition J’s (2/3)·τ_v^2 T_v n = (2/3)·(1)·(1/4)·n = (1/6)·n.

Finite-n remarks
- Using Corollary E0.1 with T=A_v (anchored set), we can make the inequality q_v ≥ τ_v^2 − 20/(n−12) explicit for n≥20. This yields an explicit finite-n version of the u_v-bound: replace E_v[τ_v^2·u_v^2] by E_v[(τ_v^2 − 20/(n−12))_+·u_v^2], keeping the remainder in the o(n) term.

How to add to output.md
- Add Lemma L (boundary–label equivalence) under the “Additional proven results” section.
- Add Proposition G3 (uniformity under both-good conditioning and E_v[q_v]=a).
- Add Proposition K with the full proof above, and a Corollary K1 stating the unconditional 1/96 bound via τ_v ≥ 1/4.
- Optional: include the finite-n explicit slack from Corollary E0.1 in Proposition K’s error term.

Obstacles and open points
- We still lack a universal lower bound on E_v[u_v^2] (and on E_v[T_v]). Thus neither Proposition J nor K alone gives an unconditional δ>0. The remaining bottleneck is the “balanced regime” where both T_v and u_v^2 are tiny; here we must push b ≤ 1/2 − γ.
- Discrete minimization of H(r,n): still optional; not needed for the current propositions.

Next steps (auditable)
1) Curate Lemma L, Proposition G3, and Proposition K (with its corollary) into output.md, using Corollary E0.1 to make the finite-n error explicit if desired.
2) Begin the balanced-regime LP: enumerate marked-Q3 isomorphism classes with a marked vertex; tag good/bad and, for good, the f1-start color at the mark; compute each class’s triple of face-types at the mark. This table feeds the LP variables z_π and linear constraints to star/face marginals.
3) Implement the first LP relaxation (balanced r_v=n/2) with symmetry reductions and product-approximation for disjoint pairs, including explicit ±20/(n−12) slack. Solve numerically to estimate γ in b ≤ 1/2 − γ.
4) Optional: prove the discrete minimization of H(r,n) at balance (n≥8) for completeness.

Why this is progress
- We resolved the key missing justification for the u_v-based both-good refinement by proving the boundary–label equivalence (Lemma L) and the correct conditioning uniformity (Proposition G3). This enables a fully rigorous Proposition K and a clean global inequality yielding a linear saving proportional to E_v[τ_v^2·u_v^2]. Together with Proposition J, we now have two independent, checkable mechanisms that turn local imbalances (degree or label) into global savings, cleanly isolating the balanced regime for the forthcoming LP attack on b.

## Round 0006 — 2025-08-27T20:19:05.986257Z

Round 0006 — Firming up the both-good (u_v) refinement: boundary-label equivalence; global inequality; and actionable LP prep

Audit of output.md (gaps and precisions)
- What is solid: The anchored-driven refinement is now fully rigorous (Lemma I; Proposition J; Lemma K for boundary sampling; explicit finite-n constants Corollary E0.1, Corollary J1′). This quantitatively converts degree imbalance into a linear gain.
- Remaining gap flagged in verifier notes: The complementary both-good refinement via the c_v-labels (u_v) is not yet curated because we lacked a clean justification that, at a both-good boundary, the boundary switch indicator equals [c_v(K) ≠ c_v(L)]. This equivalence is actually a consequence of the exact way Dvořák’s modification uses f at boundaries for good Q3’s. Below I state a short lemma (Boundary-label equivalence) and then a global Proposition (both-good u_v gain) that can be added to output.md.

New lemma (to add): Boundary-label equivalence for good Q3’s
- Statement. Fix a boundary j and let v=v_{3j} be its shared vertex. Suppose both neighboring Q3’s at boundary j are good. Let K,L be their (ordered) 3-sets of directions as in Lemma K. With c_v(·) as in Corollary D (the color at v of the first edge along f1 inside a good Q3), we have
  1_{switch at boundary j} = 1[ c_v(K) ≠ c_v(L) ].
- Proof idea (clean, local). In the modified geodesic, the 3-step segment used inside a good Q3(v,w) is (v, f(v,w), f(w,v), w) with f=f1 (since for good cubes f2≡f1 by Dvořák’s definition). At boundary j, the last edge of the preceding block is (f(v, v_{3j−3}), v), and the first edge of the next block is (v, f(v, v_{3j+3})). Both are of the form (v, f(v, ·)) and hence have colors c_v(K) and c_v(L), respectively. Therefore a boundary switch occurs if and only if these two colors differ, i.e., iff c_v(K)≠c_v(L).
- Why useful here. This bridges the previously missing step and legitimizes translating the both-good boundary switch distribution into the disagreement distribution of the c_v-labels under disjoint sampling of K,L.

Proposition (both-good boundary refinement via u_v)
- Setup. For each vertex v, let G_v be the set of good triples at v, c_v:G_v→{R,B} the first-edge color at v under f1, p_v the c_v-red fraction, and u_v:=|2p_v−1|. For a boundary j with shared vertex v, let q_v be the conditional probability (given v_{3j}=v) that both neighboring Q3’s are good.
- Claim. With the boundary-label equivalence and Lemma C, we have
  E[1_{both-good at boundary}·1_{switch}] = a/2 − (1/2)·E_v[q_v·u_v^2] ± o(1).
  Consequently,
  E[switches] ≤ (1/3 + b/12)·n − (1/6)·E_v[q_v·u_v^2]·n + o(n).
- Proof. Condition on a fixed boundary j and v=v_{3j}. By Lemma K, (K,L) is uniform over ordered disjoint pairs and independent of v. Conditioning further on both-good at v restricts (K,L) to ordered disjoint pairs in G_v; by uniformity, (K,L) is uniform on that subset. By the boundary-label equivalence, the boundary switch occurs iff c_v(K)≠c_v(L). Lemma C (applied with T=G_v and labeling c_v) gives P[c_v(K)≠c_v(L)] = 1/2 − u_v^2/2 ± O(1/n). Thus, conditioning on v,
  E[1_{both-good}·1_{switch} | v] = q_v·(1/2 − u_v^2/2) ± O(1/n).
Averaging v uniformly (Proposition G) yields the displayed equality. Summing over ≈n/3 boundaries and adding the interior term (1 − p/2) per block gives the global inequality. ∎
- Corollary (explicit unconditional coefficient). Anchored ⇒ good implies q_v ≥ τ_v^2 − O(1/n) (Lemma E0 plus Lemma E). Hence
  E[switches] ≤ (1/3 + b/12)·n − (1/6)·E_v[τ_v^2·u_v^2]·n + o(n)
  ≤ (1/3 + b/12 − (1/96)·E_v[u_v^2] + o(1))·n,
using τ_v ≥ 1/4 − O(1/n).
- Why useful. This provides a second, rigorous, vertex-averaged saving that applies even when degree-variance T_v is tiny. It complements Proposition J and cleanly isolates the (still difficult) regime where both T_v and u_v are small.

Relationship between the two refinements (anchored vs u_v)
- They hold simultaneously and provide two independent lower bounds on the both-good boundary saving; at analysis time we may take their maximum. Formally we state them as separate propositions to avoid double counting, since anchored-pairs are a subset of both-good.
- Sanity checks:
  • Balanced degrees and symmetric c_v (u_v=0): u_v route gives no gain; anchored route also gives none as T_v=0.
  • Degree-biased but c_v perfectly balanced (contrived): anchored route still yields a linear gain via T_v.
  • Balanced degrees but c_v has variance (u_v^2>0): the u_v route yields a linear gain even when T_v≈0.

Small auxiliary inequality (anchored triples imply a baseline u_v)
- For any v with red degree r, anchored triples at v force c_v(K) to equal the star color on those K, hence
  u_v ≥ |C(r,3) − C(n−r,3)| / (C(r,3) + C(n−r,3)).
  As n→∞ with x=r/n=1/2+t,
  u_v ≥ 6|t| + O(t^3),
  since (x^3 − (1−x)^3)/(x^3 + (1−x)^3) = (3/2)|2t| + O(t^3) divided by (1/4+3t^2). This lower bound is exact (finite-n) in the displayed ratio form using only “anchored ⇒ good” and τ_v. It shows u_v cannot be uniformly tiny if degree-imbalance is macroscopic, and quantifies how T_v feeds into u_v.

Examples (toy instances to test the u_v route)
- Dictatorial-direction Q3 (bad): shows that c_v is undefined there; consistent with us only using c_v on good triples.
- Mixed good classes with a marked vertex (balanced star): it is possible to arrange at a single v that p_v≠1/2 (u_v>0) while r_v=n/2 by biasing the f1-start colors across non-anchored good classes; this illustrates that the u_v route can operate in T_v≈0 regimes.

Notes on constants and finite-n bookkeeping
- The o(1) in the u_v proposition can be replaced by an explicit ≤ (20/(n−12)) using Corollary E0.1 when translating disjoint-pair uniformity for G_v; this makes the finite-n coefficient fully explicit, matching the style of Corollary J1′.
- For clarity when curating: state explicitly that ordered/unordered distinctions do not affect disagreement ratios under uniformity; in the both-good conditioning, (K,L) is uniform over ordered disjoint pairs in G_v.

LP blueprint (balanced regime) — concrete next actions
- Enumerative input for the LP:
  1) List marked-Q3 isomorphism classes (2-colorings of Q3 with one vertex marked), tag good/bad (by Dvořák’s definition), and for good classes record the f1-start color at the mark.
  2) For each class π, tabulate the triple of face-types at the mark among {mono, two-adjacent, two-opposite, alternating}. This induces linear maps z_π ↦ star- and 4-cycle-type marginals at v.
- Constraints (recap): normalization; marginalization from z_π to star and 4-cycle types; 4-cycle consistency across the three faces at v and across cubes sharing a face; Dvořák’s badness filters (Lemma 9 at v and at the antipode in the cube); color-swap and S_n symmetries; disjoint-pair product approximation with ±20/(n−12) slack.
- Objective: maximize b_v under these constraints. Any universal optimum < 1/2 (for large n) yields b ≤ 1/2 − γ and thus beats 3/8 universally.

Obstacles and why they matter
- The LP requires the marked-Q3 enumeration; without it we cannot compute the face-type linear maps nor enforce the badness filters precisely.
- Combining the two savings (anchored and u_v) additively is not immediate due to overlap on anchored-good pairs; we therefore present them as separate bounds and take the stronger one when analyzing a given coloring.

Next steps (auditable deliverables)
1) Curate the Boundary-label equivalence lemma and the u_v Proposition (both-good refinement) into output.md, together with the finite-n explicit version using Corollary E0.1.
2) Add the simple anchored-implies-u_v lower bound (ratio of binomials) as an auxiliary lemma; it clarifies how T_v forces u_v.
3) Begin the marked-Q3 enumeration with a marked vertex: produce the class list and the (good/bad, f1-start, face-type) table. This concretely instantiates the LP for the balanced regime.

Why this advances the program
- It closes the key gap in the both-good refinement, providing a second rigorous, vertex-averaged saving term. Together with the anchored route, we now have two robust mechanisms that yield linear-in-n improvements in large structural regimes. The LP plan targets the remaining near-balanced case where both T_v and u_v^2 are small, exactly the obstruction to a universal δ>0 improvement over 3/8.

