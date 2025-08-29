List of proven intermediate results
- Theorem A (Spectral upper bound on the parameter b in Dvořák’s scheme).
- Lemma B (Per-vertex lower bound on monochromatic-star triples).

Theorem A (Spectral upper bound on b)
Statement. Let Q_n be the n-dimensional hypercube with an arbitrary 2-coloring of its edges, and let b denote the probability that two uniformly random neighboring 3-cubes (Q3’s) are of mixed type (one good, one bad) in the sense of Dvořák’s construction. Then for all n ≥ 6,

b ≤ 1/2 + 3/(2(n−3)).

Consequently, Dvořák’s expected switch bound refines to
E[switches] ≤ (1/3 + 1/24 + 1/(8(n−3)) + o(1))·n = (3/8 + 1/(8(n−3)) + o(1))·n.

Proof. Fix a vertex v of Q_n. Q3’s through v correspond bijectively to 3-subsets K ⊆ [n] (the chosen directions), and two such Q3’s are v-neighbors if and only if the 3-sets are disjoint. Thus, the v-neighborhood relation is the Kneser graph KG(n,3) on vertex-set C([n],3), which is d-regular with degree d = C(n−3,3). Let G_v ⊆ C([n],3) be the set of “good” triples at v. The fraction b_v of v-neighbor pairs that are mixed equals the fraction of edges in KG(n,3) crossing the cut (G_v, C([n],3) \ G_v). The global parameter b is the average of b_v over all v (this is a direct consequence of the definition of “neighboring Q3’s” as sharing exactly one vertex; each ordered choice of the shared vertex v and a disjoint pair of triples contributes equally).

For any d-regular graph with adjacency matrix A and least eigenvalue λ_min, the size of any cut is at most |E|·(1/2 − λ_min/(2d)). This follows from the identity that, for a ±1 vector s indicating a cut, the number of crossing edges equals |E|/2 − (1/4) s^T A s, combined with s^T A s ≥ λ_min · s^T s = λ_min · |V| and |E| = d|V|/2. The Kneser graph KG(n,3) has spectrum { C(n−3,3), −C(n−4,2), n−5, −1 } (standard; see e.g. Lovász, 1979), so λ_min = −C(n−4,2). Hence every cut in KG(n,3) has crossing-edge fraction at most 1/2 − (−C(n−4,2))/(2 C(n−3,3)) = 1/2 + C(n−4,2)/(2 C(n−3,3)) = 1/2 + 3/(2(n−3)). Therefore b_v ≤ 1/2 + 3/(2(n−3)) for each v, and averaging gives the same bound for b. The stated corollary for E[switches] follows by substitution into Dvořák’s expression. ∎

Lemma B (Per-vertex lower bound on monochromatic-star triples)
Statement. Let v be a vertex of Q_n and let r_v be the number of red edges incident to v (so n − r_v are blue). The fraction of 3-sets K ⊆ [n] such that the three edges at v with directions K are monochromatic equals

τ_v = [ C(r_v,3) + C(n − r_v,3) ] / C(n,3).

In particular, τ_v is minimized when r_v ∈ {⌊n/2⌋, ⌈n/2⌉}. For n even, the minimum equals 2·C(n/2,3)/C(n,3); for n odd, it equals [C((n−1)/2,3) + C((n+1)/2,3)]/C(n,3). As n→∞, uniformly in v,
	τ_v ≥ 1/4 − 3/(4n) + O(1/n^2).

Proof. Among all 3-sets K, exactly C(r_v,3) of them consist of three red directions at v, and exactly C(n − r_v,3) consist of three blue directions at v. There are C(n,3) total 3-sets, so the fraction is τ_v as stated. Define g(r) = C(r,3) + C(n − r,3) for integer r. Then g(r+1) − g(r) = C(r,2) − C(n − r − 1,2), which is negative for r < (n−1)/2 and positive for r > (n−1)/2; hence g is minimized at r ∈ {⌊n/2⌋, ⌈n/2⌉}. Substituting these values yields the explicit minima. The asymptotic expansion follows by a routine Taylor expansion of the ratio of polynomials in n. ∎
Lemma C (Pair-sampling stability under a disjointness constraint)
Statement. Let n≥6 and let T⊆C([n],3) be any subset of 3-sets of size t=|T|. Fix any labeling c: T→{R,B} and write p := |{K∈T : c(K)=R}|/t. If an unordered pair {K,L} is drawn uniformly from all pairs with K,L∈T and K∩L=∅, then

P[c(K)≠c(L)] = 2p(1−p) ± C·(n^2/t),

for some absolute constant C>0 (independent of n and T).

Proof. For K∈T, let T_K := {L∈T : L∩K=∅} and write q(K) := |{L∈T_K : c(L)=R}|/|T_K|. Let s(K):=1 if c(K)=R and 0 otherwise. If we generate a random unordered disjoint pair by first sampling K uniformly from T and then sampling L uniformly from T_K (and finally forgetting the order), its law is within a factor 2 of the uniform law on unordered disjoint pairs, so computing the disagreement probability under this sequential scheme suffices up to a harmless constant normalization (which cancels in the final equality below).

For fixed K, the probability of disagreement equals s(K)·(1−q(K)) + (1−s(K))·q(K). Averaging over K gives

P[c(K)≠c(L)] = E_K[q(K)] + E_K[s(K)] − 2E_K[q(K)·s(K)].

Let p = E_K[s(K)] and write q(K)=p+δ(K). Then

P[c(K)≠c(L)] = 2p(1−p) + E_K[δ(K)·(1−2s(K))].

Hence |P[c(K)≠c(L)] − 2p(1−p)| ≤ E_K[|δ(K)|]. It remains to bound |δ(K)| uniformly. For any K, all elements of T that are excluded from T_K (including K itself) lie in the set S_K := {L∈T : L∩K≠∅}∪{K}. Since K is a 3-set, the number of 3-sets intersecting K is at most 3·C(n−1,2) + 3·(n−1) + 1 = O(n^2). Therefore, removing S_K from T perturbs the color fraction by at most |S_K|/t ≤ C′·n^2/t for some absolute C′, i.e., |δ(K)| ≤ C′·n^2/t. Averaging over K yields the claimed bound with C=C′. ∎

Corollary D (Refined both-good disagreement at a fixed vertex)
Statement. Fix a vertex v. Let G_v⊆C([n],3) be the set of “good” triples at v (in Dvořák’s scheme), let t_v=|G_v|, and define c_v:G_v→{R,B} as the color of the first edge at v selected by f1 inside Q3(v,K). Set p_v := |{K∈G_v : c_v(K)=R}|/t_v and u_v := |2p_v−1|. Then, when {K,L} is drawn uniformly from unordered pairs of disjoint elements of G_v,

P[c_v(K)≠c_v(L)] = 1/2 − u_v^2/2 ± C·(n^2/t_v),

with the same absolute constant C as in Lemma C. In particular, if t_v ≥ δ·C(n,3) for some absolute δ>0 (as ensured once one imports that every monochromatic star at v is good), then the error term is O(1/n).

Proof. Apply Lemma C with T=G_v and p=p_v; observe that 2p_v(1−p_v) = 1/2 − u_v^2/2. ∎

Remark (Applicability in Dvořák’s framework). By standard facts in the modified-geodesic scheme (anchored-at-v cubes are good), Lemma B implies t_v ≥ [C(r_v,3)+C(n−r_v,3)], whence t_v = Θ(n^3) uniformly in v. Thus the error term in the corollary is O(1/n).
Additional proven intermediate results
- Lemma E0 (Membership under disjointness: two-step sampling is asymptotically independent).
- Lemma E (Anchored at v implies good; import from Dvořák).
- Lemma F (Anchored–anchored pair counts and anchored disagreement probability at a vertex).
- Corollary H (Unconditional lower bound on a: a ≥ 1/16 − O(1/n)).
- Proposition G (Uniformity of the shared boundary vertex in the random-geodesic model).

Lemma E0 (Membership under disjointness)
Statement. Let n≥6 and let T⊆C([n],3) have cardinality |T| = τ·C(n,3). Let (K,L) be a uniformly random ordered pair of disjoint 3-sets from C([n],3). Then
	P[K∈T and L∈T] = τ^2 ± C·(1/n)
for some absolute constant C>0 (independent of n and T).

Proof. Generate (K,L) by first choosing K uniformly from C([n],3) and then choosing L uniformly from the family of 3-sets disjoint from K. Let M:=C(n,3) and S_K be the set of triples intersecting K, so |S_K|=M−C(n−3,3)=O(n^2). Then
	P[L∈T | K] = (|T| − |T∩S_K|) / (M − |S_K|) = τ + ε(K),
with |ε(K)| ≤ max{|T∩S_K|, τ|S_K|}/(M−|S_K|) ≤ c/n for some absolute c>0, since |T∩S_K|≤|S_K|=O(n^2) and M−|S_K|=C(n−3,3)=Θ(n^3). Therefore
	P[K∈T and L∈T] = E[1_{K∈T}·P(L∈T|K)] = E[1_{K∈T}]·τ + E[1_{K∈T}·ε(K)] = τ^2 ± E|ε(K)| = τ^2 ± O(1/n).
∎

Lemma E (Anchored at v implies good)
Statement. In Dvořák’s framework for Q3-blocks, if a 3-cube Q3 has a vertex v such that the three edges incident to v within Q3 are monochromatic, then Q3 is good (in the sense used by the modified-geodesic scheme).

Proof. This is Dvořák’s Lemma 8 (see Dvořák, “A note on edge-colorings of the hypercube” [exact citation as in the original source]). A short case analysis shows that from a monochromatic 3-star at v one can construct the required monochromatic antipodal geodesics (or the canonical f1-path with the requisite bound on color changes), hence goodness. We invoke the lemma as a quoted result. ∎

Lemma F (Anchored–anchored counts and disagreement probability at a fixed vertex)
Statement. Fix a vertex v of Q_n. Let r be the number of red edges incident to v, and let b:=n−r. Consider ordered pairs (K,L) of disjoint 3-sets of coordinates. A Q3(v,K) is “anchored red at v” if all three edges from v in directions K are red, and analogously for blue. Then:
- The number of ordered disjoint pairs (K,L) with both Q3’s anchored at v equals
	C(r,3)·C(r−3,3) + 2·C(r,3)·C(b,3) + C(b,3)·C(b−3,3).
- The total number of ordered disjoint pairs equals C(n,3)·C(n−3,3).
- Therefore, the anchored–anchored probability at v is
	H(r,n) = [ C(r,3)C(r−3,3) + 2 C(r,3)C(b,3) + C(b,3)C(b−3,3) ] / [ C(n,3)C(n−3,3) ].
- Among anchored–anchored pairs, the conditional disagreement probability at v (i.e., the two star colors at v differ) is
	P_v[disagree | anchored at v] = 2 C(r,3) C(b,3) / [ C(r,3)C(r−3,3) + 2 C(r,3)C(b,3) + C(b,3)C(b−3,3) ].
Moreover, as n→∞ with x=r/n and t=x−1/2,
	H(r,n) = (x^3 + (1−x)^3)^2 + O(1/n),
	P_v[disagree | anchored] = 1/2 − 18 t^2 + O(t^4 + 1/n).

Proof. The counts are immediate: choose K by selecting 3 directions of the appropriate color, then choose L as any disjoint triple of the indicated color pattern; the factor 2 accounts for the ordered mixed-color case. The total number of ordered disjoint pairs is C(n,3) choices for K times C(n−3,3) choices for L. Dividing yields the probabilities.
For the asymptotics, write r = xn and b = (1−x)n. Using C(m,3) = m^3/6 + O(m^2), the numerator of H equals [r^3 + b^3]^2/36 + O(n^5) and the denominator equals n^6/36 + O(n^5), so H = [(x^3+(1−x)^3)^2] + O(1/n). For the disagreement expansion, observe that
	P_v[disagree | anchored] = 2 [x^3(1−x)^3]/[x^3+(1−x)^3]^2.
Setting x = 1/2 + t and using x(1−x) = 1/4 − t^2 and x^3+(1−x)^3 = 1 − 3x(1−x) = 1/4 + 3t^2 gives
	P_v[disagree | anchored] = 2(1/4 − t^2)^3 / (1/4 + 3t^2)^2 = 1/2 − 18 t^2 + O(t^4),
with an additional O(1/n) from the binomial-to-polynomial approximation. ∎

Corollary H (Unconditional lower bound on a)
Statement. Let a denote the probability that two uniformly random neighboring Q3’s (sharing exactly one vertex) are both good. Then
	a ≥ 1/16 − O(1/n).

Proof. Fix a vertex v and let T_v be the set of 3-sets whose stars at v are monochromatic. By Lemma B, |T_v|/C(n,3) = τ_v ≥ 1/4 − 3/(4n). By Lemma E (anchored ⇒ good), any pair with K,L∈T_v yields two good Q3’s; hence, among ordered neighboring pairs with shared vertex v, the probability that both are good is at least P[K,L∈T_v]. By Lemma E0, P[K,L∈T_v] = τ_v^2 ± O(1/n). Therefore, for each v,
	P[both good | shared vertex v] ≥ (1/4 − 3/(4n))^2 − O(1/n) = 1/16 − O(1/n).
By vertex-transitivity (the number of neighboring pairs sharing v is the same for all v), the global parameter a is the uniform average of these per-v probabilities, so the same lower bound holds for a. ∎

Proposition G (Uniformity of the shared boundary vertex)
Statement. In Dvořák’s random antipodal geodesic model (uniform start vertex v0 and uniform random permutation of coordinates), for any fixed j in {1,…,⌊n/3⌋−1}, the shared vertex v_{3j} at the j-th block boundary is uniformly distributed over V(Q_n). Consequently, for any bounded function φ on V(Q_n), E[φ(v_{3j})] = (1/|V|)∑_{v} φ(v).

Proof. We have v_{3j} = v0 ⊕ S_j, where S_j is the XOR of the first 3j coordinate directions of the permutation. For any fixed y, the number of pairs (v0,S_j) producing y equals the number producing 0 (translation-invariance of Q_n). Hence v_{3j} is uniform. Linearity gives the averaging statement. ∎
Lemma I (Universal anchored-drop inequality)
Statement. For x∈[0,1], set t:=x−1/2, T:=t^2, y:=x(1−x), and s:=x^3+(1−x)^3=1−3y. In Lemma F, the anchored–anchored conditional disagreement probability at a vertex v with x=r_v/n equals
	R(x) = 2x^3(1−x)^3 / (x^3+(1−x)^3)^2 = 2y^3 / s^2.
Then, for all x,
	1/2 − R(x) ≥ 2T.
Equality holds at x∈{0,1/2,1}.

Proof. Since T=1/4−y and s=1−3y with y∈[0,1/4], the inequality is equivalent to
	2y^3/s^2 ≤ 2y ⇔ y^2 ≤ s^2.
Because y≥0 and s≥0 on [0,1/4], this reduces to y ≤ s, i.e., y ≤ 1−3y, which is exactly y ≤ 1/4. Equality occurs at y=0 (x∈{0,1}) and y=1/4 (x=1/2). ∎

Proposition J (Global anchored savings in the boundary step)
Setup. Work in Dvořák’s random antipodal geodesic scheme with k:=⌊n/3⌋ blocks and boundaries j=1,…,k−1. Let a be the probability that two neighboring Q3’s are both good, and b the probability that they are of mixed type. For a vertex v, let r_v be its red degree, x_v:=r_v/n, T_v:=(x_v−1/2)^2, and
	τ_v := [C(r_v,3)+C(n−r_v,3)]/C(n,3).
For boundary j, let v:=v_{3j} denote the shared boundary vertex, and let A_j be the event that both neighboring Q3’s at boundary j are anchored at v (i.e., each has a monochromatic 3‑star at v in its three directions).

Statement. For either of Dvořák’s choices f∈{f1,f2}, the boundary‑switch probability satisfies
	P[switch at boundary j] ≤ b/2 + a/2 − E[ 1_{A_j} · (1/2 − R(x_v)) ] + o(1),
where the expectation is over the randomness of the geodesic scheme and the boundary index j, v=v_{3j} is the shared boundary vertex, and R is as in Lemma I. Consequently,
	E[switches] ≤ (1/3 + b/12)·n − (2/3)·E_v[ τ_v^2 · T_v ]·n + o(n).

Proof. The baseline bound P[switch at a boundary] ≤ b/2 + a/2 + o(1) is Dvořák’s, with o(1) from negligible pairs sharing more than one vertex. On the subevent A_j, the boundary switch occurs if and only if the two star colors at v differ, because the last edge of the j‑th block and the first edge of the (j+1)‑st block are both incident to v, and in an anchored cube the three edges at v are monochromatic. Conditioned on A_j and v, the two 3‑sets of directions flanking the boundary are uniformly distributed among all ordered disjoint anchored triples at v, so the conditional disagreement probability equals R(x_v) by Lemma F. Therefore, on A_j the both‑good contribution (bounded by 1/2 in the baseline) drops by (1/2 − R(x_v)). On the event that both cubes are good but A_j fails, we keep the crude 1/2 bound. This proves the displayed inequality.

By Proposition G, v=v_{3j} is uniformly distributed over V(Q_n) for each j. By Lemma E0 (membership under disjointness), P[A_j | v] = τ_v^2 ± O(1/n). Combining with Lemma I (which gives 1/2 − R(x_v) ≥ 2T_v) yields
	E[ 1_{A_j} · (1/2 − R(x_v)) ] ≥ E_v[ (τ_v^2 − O(1/n)) · 2T_v ] = 2·E_v[τ_v^2 T_v] − O(1/n).
Summing the boundary‑level inequality over the k−1 = Θ(n) boundaries and adding the (unchanged) interior contribution 1 − p/2 per block (with p = a + b/2) gives
	E[switches] ≤ (1/3 + b/12)·n − (2/3)·E_v[τ_v^2 T_v]·n + o(n).
∎

Corollary J1 (Explicit unconditional gain under degree variance)
Statement. With notation as above,
	E[switches] ≤ (1/3 + b/12 − (1/24)·E_v[T_v] + o(1))·n.

Proof. Lemma B gives τ_v ≥ 1/4 − 3/(4n) pointwise, hence τ_v^2 ≥ 1/16 − O(1/n). Since T_v ≥ 0, E_v[τ_v^2 T_v] ≥ (1/16 − O(1/n))·E_v[T_v]. Substitute into Proposition J. ∎

Remark. The inequality in Lemma I is sharp at x∈{0,1/2,1}; therefore the constant 2 multiplying T is the best possible uniform constant. Larger constants are attainable only on restricted ranges of |x−1/2| (not uniformly over x∈[0,1]).
Lemma K (Uniformity and independence of boundary direction pairs)
Statement. In Dvořák’s random antipodal geodesic model, fix j ∈ {1,…,⌊n/3⌋−1}. Let B_j = {π_{3j−2},π_{3j−1},π_{3j}} and B_{j+1} = {π_{3j+1},π_{3j+2},π_{3j+3}} be the consecutive 3‑blocks in the random permutation π of [n]. Then the ordered pair (K,L):=(B_j,B_{j+1}) is uniformly distributed over all ordered disjoint pairs of 3‑sets of [n]. Moreover, (K,L) is independent of the shared boundary vertex v_{3j}.

Proof. For any ordered disjoint pair (A,B) of 3‑sets, the number of permutations with (B_j,B_{j+1})=(A,B) equals 3!·3!·(n−6)!, independent of (A,B). Hence (K,L) is uniform among ordered disjoint pairs. The vertex v_{3j} depends only on v0 and the sets of directions in earlier blocks B_1,…,B_{j−1}, while (K,L) depends only on positions 3j−2,…,3j+3. Under a uniform permutation, these parts are independent; v0 is independent as well. Therefore (K,L) is independent of v_{3j}. ∎

Corollary E0.1 (Explicit finite‑n bound for Lemma E0)
Statement. Let T ⊆ C([n],3) have density τ:=|T|/C(n,3). For a uniformly random ordered pair (K,L) of disjoint 3‑sets,
  |P[K∈T and L∈T] − τ^2| ≤ 2·|S_K|/C(n−3,3),
where |S_K| = |{L ∈ C([n],3): L∩K≠∅}| = C(n,3)−C(n−3,3) = (9n^2 − 45n + 60)/6. In particular,
  |P[K,L∈T] − τ^2| ≤ 2(9n^2 − 45n + 60)/(n^3 − 12n^2 + 47n − 60) ≤ 20/(n−12) for all n ≥ 20.

Proof. Conditioning on K, the number of admissible L is C(n−3,3). We have P[L∈T | K] = (|T| − |T∩S_K|)/C(n−3,3). Let M=C(n,3) and s=|S_K|. Then
  |P[L∈T | K] − τ| = |(|T| − |T∩S_K|)/(M−s) − |T|/M|
  = |(s|T| − M|T∩S_K|)| / (M(M−s)) ≤ (s|T| + M|T∩S_K|)/(M(M−s)) ≤ 2s/(M−s).
Averaging over K gives the first inequality. Substituting s and simplifying yields the rational function; the final bound follows by monotonicity for n ≥ 20. ∎

Lemma I.1 (Exact closed form and small‑T piecewise bounds for the anchored drop)
Statement. With x ∈ [0,1], T = (x − 1/2)^2, and R(x) as in Lemma I,
  1/2 − R(x) = 2T · (9 + 24T + 16T^2)/(1 + 24T + 144T^2).
Consequently, for all x,
  1/2 − R(x) ≥ 2T,
with equality at x ∈ {0,1/2,1}. Moreover, for any c ∈ (2,18) there is T_c > 0 (explicit below) such that 1/2 − R(x) ≥ c·T holds for all T ∈ [0,T_c], where T_c is the smallest positive root of
  (9 + 24T + 16T^2) − (c/2)(1 + 24T + 144T^2) = 0.
Two explicit instances:
  • c = 6: T_6 = (−24 + √3072)/416 ≈ 0.0755.
  • c = 10: T_{10} = (−96 + √20480)/1408 ≈ 0.0335.

Proof. Starting from R(x) = 2(1/4 − T)^3/(1/4 + 3T)^2, compute
  1/2 − R(x) = [ (1/4 + 3T)^2/2 − 2(1/4 − T)^3 ] / (1/4 + 3T)^2
  = [ (9/8)T + 3T^2 + 2T^3 ] / (1/4 + 3T)^2
  = 2T · (9 + 24T + 16T^2)/(1 + 24T + 144T^2).
The inequality 1/2 − R ≥ 2T follows since (9 + 24T + 16T^2) − (1 + 24T + 144T^2) = 8(1 − 16T^2) ≥ 0 on T ∈ [0,1/4]. The small‑T bounds are immediate from the displayed identity by requiring (9 + 24T + 16T^2)/(1 + 24T + 144T^2) ≥ c/2 and solving for the smallest positive root. ∎

Corollary J1′ (Finite‑n coefficient in Proposition J)
Statement. Let τ_min denote the per‑vertex minimum of τ_v from Lemma B (even n: τ_min = 2·C(n/2,3)/C(n,3); odd n: τ_min = [C((n−1)/2,3)+C((n+1)/2,3)]/C(n,3)). Then Proposition J implies
  E[switches] ≤ (1/3 + b/12)·n − c(n)·E_v[T_v]·n + O(1),
with c(n) = (2/3)·(τ_min)^2. In particular, c(n) → 1/24 as n → ∞ and c(n) ≥ (1/24)·(1 − O(1/n)).

Proof. From Proposition J,
  E[switches] ≤ (1/3 + b/12)·n − (2/3)·E_v[τ_v^2 T_v]·n + o(n).
Using τ_v^2 ≥ (τ_min)^2 pointwise and T_v ≥ 0 gives the stated bound. ∎
Remark D.1 (Definition alignment for c_v)
For a fixed vertex v and K ∈ G_v (the set of triples such that Q3(v,K) is good), redefine c_v(K) to be the color of the edge (v, f(v, •)) that Dvořák’s algorithm actually uses as the first step at v inside the chosen antipodal 3-edge path across Q3(v,K). This replaces the provisional definition via f1 only. Corollary D (pair-sampling stability) and all results that use it remain valid verbatim for this aligned c_v, since those results apply to an arbitrary fixed labeling c_v: G_v → {R,B}.

Lemma L (Boundary–label equivalence for good Q3’s at the shared vertex)
Statement. Consider two consecutive blocks in Dvořák’s modified geodesic with shared boundary vertex v, and suppose both neighboring 3-cubes are good. Let K_prev and K_next be their 3-sets of directions (ordered, disjoint). Then, with c_v as in Remark D.1,
  1{switch at the boundary} = 1[ c_v(K_prev) ≠ c_v(K_next) ].
Proof. The path used inside a block Q3(x,y) has the form (x, f(x,y), f(y,x), y), where f is the deterministic rule chosen by Dvořák for that cube. At the boundary between Q3(v′,v) and Q3(v,w), the last edge of the previous block is (f(v, v′), v) and the first edge of the next block is (v, f(v, w)). By definition of c_v, the colors of these edges are exactly c_v(K_prev) and c_v(K_next), respectively. Edge colors are undirected, so the boundary switch occurs if and only if these two colors differ. ∎

Proposition G3 (Both-good conditioning is uniform on disjoint good pairs and E_v[q_v]=a)
Statement. Fix a boundary index j and condition on v = v_{3j}. Let (K,L) be the ordered pair of direction 3-sets flanking the boundary. Let G_v ⊆ C([n],3) be the set of triples for which Q3(v,K) is good, and define q_v := P[K,L ∈ G_v | v]. Then:
- (K,L) is uniform over ordered disjoint pairs of 3-sets and independent of v.
- Conditional on K,L ∈ G_v, the law of (K,L) is uniform over ordered disjoint pairs drawn from G_v.
- Averaging over v (uniform by Proposition G) yields E_v[q_v] = a, where a is the global probability that two neighboring Q3’s are both good.
Proof. The first two items follow from Lemma K by restriction to the event {K,L ∈ G_v}. The last item holds because the unconditional probability that both neighboring cubes are good equals the average over v of the corresponding conditional probabilities, and v_{3j} is uniform (Proposition G). ∎

Proposition K (Both-good boundary refinement via u_v)
Setup. For a vertex v, let G_v ⊆ C([n],3) be the set of good triples, let t_v = |G_v|, and let c_v: G_v → {R,B} be as in Remark D.1. Let p_v := |{K∈G_v : c_v(K)=R}|/t_v and u_v := |2p_v − 1|. For a boundary with shared vertex v, write q_v := P[K,L ∈ G_v | v] as in Proposition G3.

Statement. At a fixed boundary index j,
  E[ 1_{both-good at boundary} · 1_{switch at boundary} ] = a/2 − (1/2)·E_v[q_v · u_v^2] ± O(1/n).
Consequently,
  E[switches] ≤ (1/3 + b/12)·n − (1/6)·E_v[q_v · u_v^2]·n + o(n).

Proof. Condition on the shared vertex v = v_{3j}. By Lemma L, on {K,L ∈ G_v} the boundary switch event equals [c_v(K) ≠ c_v(L)]. By Lemma K and Proposition G3, conditional on {K,L ∈ G_v}, (K,L) is uniform over ordered disjoint pairs from G_v. By Corollary D (pair-sampling on T=G_v with labeling c_v),
  P[c_v(K) ≠ c_v(L) | v, K,L ∈ G_v] = 1/2 − u_v^2/2 ± O(1/n),
where the error is O(1/n) since t_v = Θ(n^3). Therefore,
  E[ 1_{both-good} · 1_{switch} | v ] = q_v · (1/2 − u_v^2/2) ± O(1/n).
Averaging over v (Proposition G) and using E_v[q_v] = a gives the displayed identity. Summing over ≈ n/3 boundaries and adding the interior contribution (1 − p/2) per block (with p = a + b/2) yields the global inequality. ∎

Corollary K1 (Unconditional coefficient via τ_v ≥ 1/4)
Statement. With τ_v := [C(r_v,3)+C(n−r_v,3)]/C(n,3) and r_v the red degree at v, anchored ⊆ good implies q_v ≥ τ_v^2 − O(1/n). Hence
  E[switches] ≤ (1/3 + b/12)·n − (1/6)·E_v[ (τ_v^2 − O(1/n)) · u_v^2 ]·n + o(n)
  ≤ (1/3 + b/12 − (1/96)·E_v[u_v^2] + o(1))·n,
using τ_v ≥ 1/4 − 3/(4n). For n ≥ 20 one may replace O(1/n) in q_v by the explicit 20/(n−12) from Corollary E0.1.

Remark (Non-overcounting). The anchored-driven refinement (Proposition J) and the u_v-driven refinement (Proposition K) both act on the both-good boundary contribution. They should not be added; in applications one uses the stronger of the two bounds pointwise.
