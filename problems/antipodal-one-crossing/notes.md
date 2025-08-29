Context and target in Dvořák’s framework
- Dvořák’s modified-geodesic scheme yields the bound E[switches] ≤ (1/3 + b/12 + o(1))·n, where b is the probability that two uniformly random neighboring Q3’s (sharing exactly one vertex) have mixed types (one good, one bad). Because p cancels via p = a + b/2, any constant improvement over 3/8 must either prove b ≤ 1/2 − γ for some absolute γ>0, or reduce the 1/2 bound in the a-term (both-good case).

Why naive block-density does not imply expansion (correct counterexample)
- Brainstorm claim (now rejected): “If a color occupies at least an ε-fraction of each block boundary δS_J for (1−θ) of the blocks, then that color has conductance Ω(ε).” This is false without further structure (e.g., endpoint balance and degree spread).
- Construction (valid undirected 2-coloring): Fix j:[n]→[n] such that j(i)≠i for all i. For each i-edge {x, x⊕e_i}, let y be the endpoint with y_i=0 and color the edge blue iff y_{j(i)}=1; otherwise red. Then for each i, exactly half of the i-edges are blue (so β_J=1/2 for every block J). Yet the blue subgraph can be extremely sparse at many vertices; e.g., if j(1)=2 and j(i)=1 for all i≥2, then for a vertex v, deg_B(v) = (n−1)·[v_1=1] + [v_2=1]. In particular, all vertices with (v_1,v_2)=(0,0) are isolated. Thus block-level edge-density alone does not imply connectivity, let alone conductance.
- Separate but related flaw: Even if a block J has aggregate blue-density β_J = 1/2+ε, one can realize this with each direction i∈J having density 1/2+ε. A geodesic that uses each direction exactly once then sees ≈(1/2−ε)|J| minority edges on average, not O(ε|J|). Any O(ε|J|) claim must extract stronger inner-block structure (e.g., many near-monochromatic directions).

Vertex-wise Kneser-graph formulation and spectral bound
- For a fixed vertex v, Q3’s through v correspond to 3-subsets of [n]. Two Q3’s are v-neighbors iff their 3-sets are disjoint; this is the Kneser graph KG(n,3). If G_v⊆C([n],3) is the set of “good” triples at v, then b_v is the fraction of edges in KG(n,3) crossing the cut (G_v, its complement). The parameter b equals the average of b_v over v, up to negligible normalization.
- Spectral MAX-CUT bound in KG(n,3): KG(n,3) is d-regular with d= C(n−3,3), and its least eigenvalue is −C(n−4,2). Hence for any cut, the crossing-edge fraction is ≤ 1/2 − λ_min/(2d) = 1/2 + 3/(2(n−3)). Therefore b ≤ 1/2 + 3/(2(n−3)). This recovers Dvořák’s b ≤ 1/2 + o(1) and makes the o(1) term explicit.

Per-vertex monochromatic-star lower bound (useful bookkeeping)
- For a vertex v with red degree r_v, the fraction of 3-subsets K such that the three edges at v in directions K are monochromatic equals [C(r_v,3) + C(n−r_v,3)] / C(n,3). This is minimized near r_v≈n/2; explicitly: for n even it equals 2·C(n/2,3)/C(n,3), and for n odd it equals [C((n−1)/2,3)+C((n+1)/2,3)]/C(n,3). Asymptotically this is 1/4 − 3/(4n) + O(1/n^2). This sharpened estimate alone cannot beat 3/8 but is a clean input for any refined accounting of the a-term.

Promising directions to reduce b or the a-term
- LP/SDP relaxation for b: Model local pattern frequencies around v (1-edge colors; 4-cycle types; Q3-types with the f1-chosen color), enforce marginal and 4-cycle consistency, and maximize b. Any universal optimum < 1/2 indicates a path to a combinatorial proof.
- Good–good boundary improvement: Enumerate good Q3 classes, fix canonical tie-breaking for f1, and measure the disagreement probability at v between two disjoint good Q3’s. If it is ≤ 1/2 − η for some η>0, the a-term improves by η.
- Structural lemmas: Seek negative correlation between “badness” indicators for disjoint triples at v, induced by 4-cycle constraints and the forbidden patterns of bad Q3’s. Any quantified negative correlation lowers b below the vertexwise MAX-CUT upper bound.

What to avoid or strengthen
- Avoid relying on block-level densities without per-direction endpoint balance and degree-spread conditions. Any block-phase lemma should explicitly include such hypotheses (e.g., each direction in a good block has bias ≥ε and each vertex has ≥ρ·|J| majority-color incident edges within that block).
Refinement of the both-good boundary step via per-vertex bias
- For a fixed vertex v, let G_v ⊆ C([n],3) denote the collection of 3-sets K for which Q3(v,K) is “good” in Dvořák’s sense. Fix a deterministic tie-breaking for f1 inside each good Q3. Define c_v(K) ∈ {R,B} as the color of the first edge at v along the f1-path inside Q3(v,K). Let t_v = |G_v|, p_v := |{K∈G_v : c_v(K)=R}|/t_v, and u_v := |2p_v − 1|.
- Sampling heuristic made precise: If we pick two good v-neighbor Q3’s uniformly at random (i.e., two disjoint K,L ∈ G_v, unordered), the event “boundary switch occurs” equals [c_v(K) ≠ c_v(L)]. The disjointness constraint perturbs the color distribution only by O(1/n) since each K forbids only O(n^2) partners while t_v = Θ(n^3) (once we know a constant fraction of triples are good at v).

A general pair-sampling lemma (usable abstractly)
- Let T ⊆ C([n],3) be any subset of size t, and c: T → {R,B} any labeling. Let p = |{K∈T: c(K)=R}|/t. If we draw an unordered pair {K,L} uniformly from all disjoint pairs with K,L∈T, then
  P[c(K) ≠ c(L)] = 2p(1−p) ± O(n^2/t).
  Proof idea: For any fixed K, the “forbidden” set S_K = {L∈T: L∩K≠∅} has size O(n^2), so conditioning L to be disjoint from K changes its color distribution by at most O(|S_K|/t) = O(n^2/t). Averaging over K and expanding E[disagree|K] shows that the deviation from 2p(1−p) is bounded by the average of these perturbations.
- Application to both-good pairs at v: Taking T = G_v yields
  P_v[boundary switch | both-good at v] = 1/2 − u_v^2/2 ± O(n^2/t_v).
  By “anchored implies good” (imported from Dvořák) and Lemma B, t_v ≥ (1/4 − O(1/n))·C(n,3) = Θ(n^3), so the error is O(1/n). Note the global “both-good” boundary probability is a weighted average of the per-v quantities with weights proportional to the mass of both-good pairs at v.

Degree imbalance induces bias in c_v via anchored triples
- Let r_v be the red degree at v and x_v = r_v/n. Among all triples K with monochromatic stars at v (anchored at v), c_v(K) is forced to be the star color. Consequently, even ignoring non-anchored good triples one gets
  u_v ≥ |C(r_v,3) − C(n−r_v,3)| / (C(r_v,3) + C(n−r_v,3)).
  For x_v = 1/2 + η with |η| ≪ 1, this gives u_v ≥ 6|η| + O(η^3). Therefore, if a positive fraction ρ of vertices satisfy |x_v − 1/2| ≥ η_0, then E_v[u_v^2] ≥ c·ρ·η_0^2 for some absolute c>0.

Corrected anchored–anchored counts at a fixed vertex
- For r=r_v and b=n−r, the number of ordered v-neighbor pairs (K,L) with both cubes anchored at v equals
  C(r,3)C(r−3,3) + 2C(r,3)C(b,3) + C(b,3)C(b−3,3).
  Among these, the pairs with disagreeing star colors at v are exactly the mixed-color ones, counted by 2C(r,3)C(b,3). Therefore,
  P_v[disagree | both anchored at v] = 2C(r,3)C(b,3) / [C(r,3)C(r−3,3) + 2C(r,3)C(b,3) + C(b,3)C(b−3,3)].
  As n→∞ with x=r/n and t=x−1/2,
  P_v[disagree | anchored] = 2x^3(1−x)^3/(x^3+(1−x)^3)^2 + O(1/n) = 1/2 − 18t^2 + O(t^4 + 1/n).
  In particular, at balance (x=1/2) the anchored–anchored disagreement probability is 1/2 and the anchored–anchored pair probability is ≈(x^3+(1−x)^3)^2 = (1/4)^2 = 1/16 (up to O(1/n)), not 1/32.

Dichotomy and plan
- Unbalanced regime: If E_v[(x_v−1/2)^2] is bounded below, then E_v[u_v^2] is bounded below, and the both-good boundary term drops by a constant (via the pair-sampling lemma), yielding a linear improvement. Anchored–anchored pairs certify this effect concretely.
- Balanced regime: When x_v≈1/2 for most v, we must leverage structural constraints (4-cycle consistency, interaction of good/bad patterns across pairs) to bound b<1/2. Proceed with the proposed LP using: star-type frequencies, 4-cycle types, Q3-types-with-marked-v and their f1-start labels, symmetry constraints, and Dvořák’s characterization of bad cubes.

Immediate technical tasks
- Import or re-prove “anchored at v ⇒ good” to firm up the O(1/n) error uniformly.
- Prove that the anchored–anchored probability is minimized at r≈n/2 for all n≥6 (discrete convexity of F(m)=C(m,3)C(m−3,3) plus symmetry).
- Enumerate Q3 2-coloring classes with marked v; for each good class determine the f1-start at v. This feeds the LP for b in the balanced regime.
Additions and refinements (Round 0003)

1) Correction to the baseline interior contribution
- In Dvořák’s scheme the expected number of color changes inside a Q3-block is 1 − p/2 per block (not 1 − p^2). With p = a + b/2 this yields the baseline (1/3 + b/12 + o(1))·n for E[switches].

2) Anchored cubes and a uniform nontrivial anchored mass
- Anchored-at-v cubes (three edges at v all the same color in the chosen 3 directions) are good (Dvořák, Lemma 8). Consequently, anchored–anchored neighboring pairs form a subset of both-good pairs. For a vertex v with r red and b=n−r blue incident edges, the exact anchored–anchored (ordered) pair probability is
  H(r,n) = [ C(r,3)C(r−3,3) + 2C(r,3)C(b,3) + C(b,3)C(b−3,3) ] / [ C(n,3)C(n−3,3) ].
  As n→∞ with x=r/n, H(r,n) = (x^3 + (1−x)^3)^2 + O(1/n), minimized at x=1/2; hence H(r,n) ≥ 1/16 − O(1/n).
- A discrete, uniform lower bound that avoids minimizing H directly follows from a general “membership under disjointness” lemma: if T⊆C([n],3) has density τ, then for a uniform ordered disjoint pair (K,L) from all triples, P[K,L∈T] = τ^2 ± O(1/n). Applying this to the anchored set T_v gives P[both anchored at v] = τ_v^2 ± O(1/n), and since τ_v ≥ 1/4 − 3/(4n) (Lemma B), we conclude a ≥ 1/16 − O(1/n) unconditionally.

3) Anchored–anchored disagreement probability
- Conditioning on both Q3’s being anchored at v, the exact disagreement probability at v equals
  P_v[disagree | anchored] = 2C(r,3)C(b,3) / [ C(r,3)C(r−3,3) + 2C(r,3)C(b,3) + C(b,3)C(b−3,3) ].
  With x=r/n and t=x−1/2, as n→∞,
  P_v[disagree | anchored] = 2x^3(1−x)^3 / (x^3+(1−x)^3)^2 + O(1/n) = 1/2 − 18t^2 + O(t^4 + 1/n).
  Thus degree imbalance |t|≥η enforces a quadratic drop below 1/2 in the both-good boundary switch probability on the anchored submass.

4) Uniformity of boundary vertices in the random-geodesic model
- In Dvořák’s random antipodal geodesic scheme (uniform start vertex and uniform coordinate permutation), the shared vertex v_{3j} at each boundary j is uniformly distributed over V(Q_n). Hence vertex-averages at boundaries equal uniform averages over V(Q_n).

5) Path to a refined global bound
- Let T_v = (r_v/n − 1/2)^2. Using the anchored–anchored mass and the anchored disagreement drop, one can define a nonnegative anchored savings Δ_anchor ≈ E_v[H(r_v,n)·(1/2 − P_v[disagree | anchored])]. Inserting this at each boundary yields a refined inequality of the schematic form
  E[switches] ≤ (1/3 + b/12 − (1/3)·Δ_anchor + o(1))·n.
  Using H(r,n) ≥ 1/16 − O(1/n) and the 18T_v drop gives an unconditional gain ≳ (3/8)·E_v[T_v]·n in regimes with nontrivial degree variance. Formalizing this integration (with accurate o(1) control and precise weights) is the next task.

6) Open technical point
- Discrete minimization: prove that H(r,n) is minimized at r∈{⌊n/2⌋,⌈n/2⌉} for all n≥6. A direct sign analysis of H(r+1,n)−H(r,n) should suffice.
Anchored–anchored refinement: exact drop and global integration
- Notation recap at a vertex v:
  • r_v = red degree; x_v := r_v/n; T_v := (x_v − 1/2)^2.
  • τ_v := [C(r_v,3)+C(n−r_v,3)]/C(n,3), the fraction of 3‑sets anchored at v (monochromatic star at v). By Lemma B, τ_v ≥ 1/4 − 3/(4n).
  • For anchored–anchored pairs at v, Lemma F gives the exact conditional disagreement probability R(x) = 2x^3(1−x)^3/(x^3+(1−x)^3)^2 with x=x_v.

- Exact universal inequality (anchored drop): for all x∈[0,1], letting y:=x(1−x) and T:=(x−1/2)^2=1/4−y,
  1/2 − R(x) = 1/2 − 2y^3/(1−3y)^2 ≥ 2T.
  Proof sketch: The inequality is equivalent to y^2 ≤ (1−3y)^2 for y∈[0,1/4], which holds with equality at y∈{0,1/4} (i.e., x∈{0,1/2,1}). Thus the drop below 1/2 is at least 2T, uniformly and sharply.

- Boundary interpretation without extra tie‑breaking: At a boundary vertex v between consecutive blocks, the last edge of the preceding Q3 and the first edge of the next Q3 are both incident to v. If both cubes are anchored at v, then each of these edges must have its cube’s star color at v. Hence the boundary switch occurs if and only if the two star colors at v differ. Therefore, conditional on both cubes being anchored at v, the boundary switch probability equals the anchored disagreement probability R(x_v) from Lemma F. No special tie‑breaking is needed in anchored cubes for this conclusion.

- Global anchored savings (informal summary): For each boundary, Dvořák’s baseline bound is b/2 + a/2. On the subevent that both neighboring Q3’s are anchored at the shared vertex v, this both‑good term improves from 1/2 to R(x_v), saving (1/2 − R(x_v)) ≥ 2T_v. The probability that both are anchored at v equals τ_v^2 ± O(1/n) by Lemma E0 (membership under disjointness). Averaging v uniformly across boundaries (Proposition G) and summing over ~n/3 boundaries yields a net reduction of at least (2/3)·E_v[τ_v^2 T_v]·n − o(n). Consequently,
  E[switches] ≤ (1/3 + b/12)·n − (2/3)·E_v[τ_v^2 T_v]·n + o(n),
  and since τ_v^2 ≥ 1/16 − O(1/n) pointwise, an unconditional corollary is
  E[switches] ≤ (1/3 + b/12 − (1/24)·E_v[T_v] + o(1))·n.

- Limits and focus: The anchored‑driven gain vanishes in the balanced regime (T_v≈0). To improve the universal constant, we must either (i) control b strictly below 1/2 in the balanced case via local consistency (4‑cycles, marked‑Q3 types), or (ii) derive complementary both‑good savings using the bias parameter u_v from Corollary D with proper weighting.

- Caution: A uniform inequality 1/2 − R(x) ≥ c·T with c>2 is impossible (it fails at x∈{0,1}). Larger coefficients are attainable only on restricted |t| ranges.

Concrete next steps
- Enumerate marked‑Q3 isomorphism classes and determine their good/bad status and the f1‑start color at the marked vertex; set up an LP/SDP to bound b in the balanced regime, enforcing 4‑cycle consistency and Dvořák’s badness constraints.
- Formalize a weighted version of Corollary D at the boundary level: express the both‑good boundary switch probability as an average over v with weights ≈ density of both‑good disjoint pairs at v, and quantify the reduction 1/2 − (1/2)·E_v[u_v^2] + o(1) when u_v has variance.
Round 0005 verification notes: boundary pair uniformity; explicit disjointness error; anchored drop closed form; and status of the u_v refinement

- Boundary direction pairs are uniform and independent of the shared vertex. Fix j ∈ {1,…,⌊n/3⌋−1}. Under a uniform permutation π and the 3‑block partition B_j={π_{3j−2},π_{3j−1},π_{3j}}, the ordered pair (K,L):=(B_j,B_{j+1}) is uniformly distributed over all ordered disjoint 3‑sets, and is independent of v_{3j}. Proof: for any ordered disjoint (A,B), the number of permutations with (B_j,B_{j+1})=(A,B) equals 3!·3!·(n−6)!, independent of (A,B). Independence from v_{3j} follows since v_{3j} depends only on earlier blocks while (B_j,B_{j+1}) depends only on positions 3j−2,…,3j+3.

- Explicit finite‑n bound for Lemma E0. For a fixed 3‑set K, |S_K| = C(n,3) − C(n−3,3) = (9n^2 − 45n + 60)/6. For any T⊆C([n],3) with density τ and a random ordered disjoint pair (K,L),
  |P[K∈T, L∈T] − τ^2| ≤ 2|S_K|/C(n−3,3) = 2(9n^2 − 45n + 60)/(n^3 − 12n^2 + 47n − 60) ≤ 20/(n−12) for n≥20.
This tightens the previous O(1/n) into a concrete bound (the factor 2 comes from exact algebra when comparing (|T|−|T∩S_K|)/(C(n−3,3)) to |T|/C(n,3)).

- Anchored drop: exact closed form and small‑T amplification. With T=(r_v/n − 1/2)^2 and R(x) from Lemma I, the polynomial identity holds:
  1/2 − R(x) = 2T · (9 + 24T + 16T^2)/(1 + 24T + 144T^2).
Consequences:
  • Uniform inequality (Lemma I): 1/2 − R(x) ≥ 2T, since (9 + 24T + 16T^2) ≥ (1 + 24T + 144T^2) on T∈[0,1/4].
  • For any c ∈ (2,18), the inequality 1/2 − R(x) ≥ c·T holds for all T in [0,T_c], where T_c is the smallest positive root of (9 + 24T + 16T^2) − (c/2)(1 + 24T + 144T^2) = 0. In particular,
    – c=6: T_6 = (−24 + √3072)/416 ≈ 0.0755.
    – c=10: T_{10} = (−96 + √20480)/1408 ≈ 0.0335.
These piecewise bounds can slightly sharpen constants when many vertices have very small T_v.

- Finite‑n coefficient in Proposition J. Writing τ_min as in Lemma B (even n: 2·C(n/2,3)/C(n,3); odd n: [C((n−1)/2,3)+C((n+1)/2,3)]/C(n,3)), Proposition J yields
  E[switches] ≤ (1/3 + b/12)·n − c(n)·E_v[T_v]·n + O(1), with c(n) = (2/3)·(τ_min)^2.
Thus c(n)→1/24 and c(n) ≥ (1/24)(1 − O(1/n)).

- Status of the u_v‑based both‑good refinement. The idea: condition on the boundary shared vertex v, restrict to both‑good pairs (K,L) and measure the disagreement probability at v via the labels c_v(K), c_v(L), where c_v(K) is the color of the first edge at v along the f1 path inside Q3(v,K). Lemma C then gives P[c_v(K)≠c_v(L)] = 1/2 − u_v^2/2 ± O(1/n). However, to translate this into a boundary switch probability we must justify that, in the both‑good case, “switch at boundary” equals (or has the same distribution as) [c_v(K)≠c_v(L)]. This equivalence is automatic in the anchored case (all three edges at v have the star color), but is nontrivial in general. Next step: either (i) redefine the labels to match the actual boundary edge colors (last edge of block j at v and first edge of block j+1 at v) and re‑prove the pair‑sampling lemma for those labels, or (ii) prove a symmetry lemma for good cubes showing that the boundary edge color at v has the same marginal/pair distribution as the “first‑edge at v” color used in c_v. Until this is established, we keep the u_v refinement as a promising conjectural route only.

- Balanced‑regime LP blueprint (actionable). Variables: star‑type frequencies at v; 4‑cycle types through v; marked‑Q3 pattern frequencies (good/bad tags, and for good the f1 start color at v); linearized pair variables for disjoint triples. Constraints: normalization; marginalization from marked‑Q3 classes to star and 4‑cycle types; 4‑cycle consistency across faces at v; Dvořák’s badness filters; color‑swap and coordinate symmetries; disjoint‑pair product‑approximation with explicit ±20/(n−12) slack. Objective: maximize b_v. Any universal optimum < 1/2 (for large n) gives b ≤ 1/2 − γ and a constant improvement over 3/8 in the balanced regime.

Open items
- Prove the equivalence (or distributional equality) needed to justify the u_v‑based boundary saving in the both‑good case.
- Discrete minimization of H(r,n) at r≈n/2 (optional; not currently needed by Proposition J).
- Enumerate marked‑Q3 isomorphism classes and their good/bad status and f1 start color at the mark; compute the induced face‑type triples to feed the LP.
Round 0006: Closing the u_v-based both-good refinement; boundary–label equivalence; and a global inequality

- Definition alignment for c_v. For a fixed vertex v, let G_v be the set of triples K such that Q3(v,K) is good in Dvořák’s scheme. Define c_v(K) to be the color of the edge (v, f(v, •)) that Dvořák’s algorithm actually uses as the first step at v inside Q3(v,K) (i.e., along the chosen antipodal 3-edge geodesic for that cube). This replaces the earlier provisional definition using f1 only. Importantly, all pair-sampling statements (Lemma C and Corollary D) remain valid verbatim for this adjusted labeling, since they only require that c_v is a fixed map G_v → {R,B}.

- Boundary–label equivalence (local, both-good). Consider a boundary between two consecutive blocks where the shared vertex is v and both neighboring Q3’s are good. Let the previous block be Q3(v′, v) and the next block be Q3(v, w). By the definition of the modified geodesic, the last edge at v of the previous block is (f(v, v′), v), and the first edge at v of the next block is (v, f(v, w)). By the aligned definition of c_v, these two colors are exactly c_v(K_prev) and c_v(K_next), respectively. Since the edge colors are undirected, a boundary switch occurs if and only if c_v(K_prev) ≠ c_v(K_next).

- Conditioning uniformity and averaging. Fix a boundary index j and condition on v = v_{3j}. By Lemma K, the ordered pair (K,L) of direction triples flanking the boundary is uniform over ordered disjoint pairs and independent of v. Conditioning further on both cubes being good at v (i.e., K,L ∈ G_v), (K,L) is uniform over ordered disjoint pairs in G_v. Writing q_v := P[K,L ∈ G_v | v], we have E_v[q_v] = a by vertex-uniformity (Proposition G) and Lemma K.

- Pair-sampling on G_v and the boundary switch probability. By Corollary D (applied to T=G_v with the aligned c_v), for unordered disjoint pairs from G_v,
  P[c_v(K) ≠ c_v(L)] = 1/2 − u_v^2/2 ± O(1/n),
  where u_v := |2p_v − 1| and p_v is the c_v-red fraction in G_v. Ordered vs unordered does not affect the disagreement probability. Combining with the boundary–label equivalence yields, at boundary j and fixed v,
  E[1_{both-good}·1_{switch} | v] = q_v·(1/2 − u_v^2/2) ± O(1/n).
  Averaging over v and using E_v[q_v] = a gives the identity
  E[1_{both-good}·1_{switch}] = a/2 − (1/2)·E_v[q_v u_v^2] ± O(1/n).

- Global u_v-based refinement. Summing over ≈ n/3 boundaries and adding the interior contribution (1 − p/2) per block yields
  E[switches] ≤ (1/3 + b/12)·n − (1/6)·E_v[q_v u_v^2]·n + o(n).
  Using anchored ⊆ good and Lemma E0 gives q_v ≥ τ_v^2 − O(1/n), whence the unconditional corollary
  E[switches] ≤ (1/3 + b/12 − (1/96)·E_v[u_v^2] + o(1))·n.
  Here τ_v := [C(r_v,3)+C(n−r_v,3)]/C(n,3) ≥ 1/4 − 3/(4n), so τ_v^2 ≥ 1/16 − O(1/n).

- Non-overcounting with anchored refinement. The anchored-driven bound (Proposition J) and the u_v-driven bound above both refine the same both-good boundary term. They should not be added; in analysis one should use the stronger of the two in any given instance.

- Correction to earlier heuristic. A previously stated inequality claiming u_v ≥ |C(r_v,3) − C(n−r_v,3)|/(C(r_v,3)+C(n−r_v,3)) is not valid as a pointwise lower bound on u_v over all of G_v, because labels on non-anchored good triples can, in principle, cancel the anchored bias. We therefore do not use this inequality.

- Finite-n notes. By Corollary E0.1, the product-approximation error for q_v can be made explicit: q_v ≥ τ_v^2 − 20/(n−12) for n ≥ 20. A similar explicit O(1/n) bound applies to the pair-sampling error in Corollary D when T=G_v (since |S_K| = O(n^2) and |G_v| = Θ(n^3)).

- Path forward (balanced regime). The remaining obstruction to a uniform improvement is the near-balanced regime where both the degree variance T_v and u_v^2 are tiny. Proceed with the marked-Q3 enumeration (good/bad classification; the chosen start edge color at the mark; and face-type triples), set up the LP with 4-cycle consistency, Dvořák’s badness filters, symmetry reductions, and disjoint-pair product approximation (±20/(n−12) slack), and maximize b_v. Any universal optimum < 1/2 (for large n) gives b ≤ 1/2 − γ and improves 3/8.
