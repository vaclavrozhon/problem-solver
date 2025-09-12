# Rigorous Proofs



Refined outstar-with-δ+-common-leaves

Theorem 1 (Refinement of Theorem 3.4). Let ℓ ≥ 2, k ≥ 1, and let P be a δ+-common property with threshold d(P). Define
- Γ(0):= {v : v satisfies P}, and for 1 ≤ i ≤ k,
- Γ(i):= {v : deg^+_{Γ(i−1)}(v) ≥ t_i},
where t_k:=ℓ and, for 1 ≤ i ≤ k−1,
 t_{k−i}:=ℓ^{i+1}+⌈(ℓ^{i+1}−1)/(ℓ−1)⌉.
Let S_{k,ℓ}:=∑_{i=1}^k t_i. If δ^+(G) ≥ d(P)+S_{k,ℓ}, then G contains a copy B of B^+_{k,ℓ} whose leaves all satisfy P in G.

Proof. We follow the paper’s lexicographic partition argument, allowing variable thresholds.
(1) Non-emptiness of Γ(k). Suppose Γ(k)=∅. Let z be the lexicographically minimal vector with V_z ≠ ∅. Set I:= {i∈{0,…,k−1}: z_{i+1}=0} and W:=⋃_{i∈I} Γ(i). As in the paper, if z ≠ 0 then V=W; if z=0 then V=W ⊔ X with X:=V_{0…0}. For any v∈V_z and each i∈I, v∉Γ(i+1), so deg^+_{Γ(i)}(v) < t_{i+1}. Summing over i∈I gives deg^+_W(v) < ∑_{i∈I} t_{i+1} ≤ ∑_{j=1}^k t_j = S_{k,ℓ}. If z≠0 then deg^+(v)=deg^+_W(v) < S_{k,ℓ} ≤ δ^+(G)−d(P), contradicting δ^+(G). If z=0 then δ^+(G[X]) ≥ δ^+(G)−S_{k,ℓ} ≥ d(P), so by δ^+-commonness X contains a vertex satisfying P, contradicting X∩Γ(0)=∅. Hence Γ(k)≠∅.
(2) Greedy construction. Take v∈Γ(k). Build B_i≅B^+_{i,ℓ} (0≤i≤k) so that the leaves of B_i lie in Γ(k−i). The base step i=0 uses t_k=ℓ. For i≥0, let L be the ℓ^i leaves of B_i, and note |V(B_i)|=(ℓ^{i+1}−1)/(ℓ−1). Each w∈L lies in Γ(k−i), so
 deg^+_{Γ(k−i−1)}(w) ≥ t_{k−i} = ℓ^{i+1}+⌈(ℓ^{i+1}−1)/(ℓ−1)⌉ ≥ ℓ^{i+1}+|V(B_i)|.
Process leaves one by one; when treating the j-th leaf, at most ℓ(j−1) new vertices have been used at level i+1. Thus the current w has at least
 deg^+_{Γ(k−i−1)}(w) − |V(B_i)| − ℓ(j−1) ≥ ℓ^{i+1} − ℓ(j−1) ≥ ℓ
available choices in Γ(k−i−1)\V(B_i), allowing us to select ℓ fresh children. This yields B_{i+1} with leaves in Γ(k−i−1). After k steps, B_k has its leaves in Γ(0), i.e. satisfying P.

Bounding S_{k,ℓ}. We have
 S_{k,ℓ} = ℓ + ∑_{i=1}^{k−1} ( ℓ^{i+1} + ⌈(ℓ^{i+1}−1)/(ℓ−1)⌉ )
 ≤ 2·(ℓ^{k+1}−ℓ)/(ℓ−1) + ℓ ≤ (2ℓ/(ℓ−1))·ℓ^k + ℓ.
∎

Corollary 2 (Uniform-threshold variant). With T*:=⌈ℓ^k·ℓ/(ℓ−1)⌉, the same conclusion holds if δ^+(G) ≥ d(P)+kT*. Indeed, t_i ≤ T* for all i, hence S_{k,ℓ} ≤ kT* and Theorem 1 applies.

Packing many in-spiders at the leaves

Lemma 3 (Ray packing). Let B≅B^+_{k,ℓ} with leaves L (|L|=ℓ^k). For each w∈L let S(w)≅S^-_{k,h} be an in-spider centred at w. If
 h ≥ |V(B)| + kℓ·|L| + ℓ,
then one can choose subgraphs S′(w)≅S^-_{k,ℓ}, pairwise vertex-disjoint and disjoint from B except at their centres.

Proof. Order L arbitrarily. Let U be the union of V(B) and all previously chosen S′(w′), excluding their centres. For the current leaf w, every vertex x∈U lies on at most one ray of S(w), so at most |U| rays are blocked. Since |U| ≤ |V(B)| + kℓ·(|L|−1) ≤ |V(B)| + kℓ·|L|, having h ≥ |U|+ℓ ensures at least ℓ unblocked rays remain. Selecting these rays yields S′(w). ∎

Corollary 4 (Improved Theorem 3.6). Let k≥1, ℓ≥2. Set h:=kℓ^{k+1}+2ℓ^k+ℓ and S_{k,ℓ} as in Theorem 1. If
 δ^+(G) ≥ f(k,h) + S_{k,ℓ},
then G contains T(k,ℓ) as a subgraph.

Proof. Take P(v):=“v is the centre of S^-_{k,h}”. By Proposition 3.5 in the paper (Aboulker et al.), P is δ^+-common with d(P)=f(k,h). Apply Theorem 1 to obtain B≅B^+_{k,ℓ} whose leaves L are centres of S(w)≅S^-_{k,h}. Then apply Lemma 3 with |V(B)|=(ℓ^{k+1}−1)/(ℓ−1)≤2ℓ^k and |L|=ℓ^k to extract the disjoint S′(w), forming T(k,ℓ). ∎

Linear bound for S^-_{2,ℓ} via 2-walks and matching

Theorem 5 (Improves Theorem 4.3 quantitatively and fixes a gap). For every ℓ≥1, any digraph G with minimum out-degree d satisfying
 d > d_*(ℓ) := ((3ℓ−1)+√(17ℓ^2−10ℓ+1))/2
contains S^-_{2,ℓ} as a subgraph.

Proof. Make G d-out-regular by deleting edges. Partition V=A⊔B with A={v:deg^−(v)≥2ℓ}, B=V\A. If some r∈A has deg^-_A(r) ≥ 2ℓ, the greedy construction yields S^-_{2,ℓ}. Otherwise, assume deg^-_A(·) ≤ 2ℓ−1 on A.
Count directed 2-walks. Let X⇒Y⇒Z be the set of 2-walks with middle in Y and end in Z. Then
 |V⇒B⇒A| = |A⇒V⇒V| − |A⇒A⇒V| + |B⇒B⇒V| − |V⇒B⇒B|.
Using deg^+(·)=d, deg^-_A≤2ℓ−1 on A, and deg^−(b)≤2ℓ−1 on B,
 |A⇒V⇒V| = |A| d^2,
 |A⇒A⇒V| ≤ e(G[A]) d ≤ (2ℓ−1) d |A|,
 |B⇒B⇒V| = e(G[B]) d,
 |V⇒B⇒B| ≤ (2ℓ−1) e(G[B]).
Thus |V⇒B⇒A| ≥ |A| d(d−2ℓ+1). Hence there is a∈A with |V⇒B⇒{a}| ≥ d(d−2ℓ+1).
Form the bipartite graph H with left L:=V\{a} and right Y:=N^-_B(a), and put an edge (q,b)∈L×Y iff (q,b)∈E(G). Each edge of H corresponds to a 2-walk q→b→a. Let M be a maximum matching of H with size s; write Q and S for its left and right endpoints. The 2-walks using b∈S are at most ∑_{b∈S}deg^−(b) ≤ (2ℓ−1)s. By maximality, there is no edge joining an unmatched left vertex to an unmatched right vertex; hence every 2-walk via B\S starts in Q, contributing at most d|Q|=ds walks. Therefore
 d(d−2ℓ+1) ≤ |V⇒B⇒{a}| ≤ ds + (2ℓ−1)s = s(d+2ℓ−1),
so s ≥ d(d−2ℓ+1)/(d+2ℓ−1). If s ≥ ℓ, we obtain S^-_{2,ℓ}. Solving s ≥ ℓ gives d > d_*(ℓ). ∎