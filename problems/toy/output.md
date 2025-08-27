Definitions and standing assumptions
- Graphs are finite, simple, undirected. Let n = |V(G)| ≥ 3. Write δ(G) for the minimum degree. A Hamiltonian path/cycle is a path/cycle on all n vertices.

Proposition 1 (Connectivity). If δ(G) ≥ n/2, then G is connected.
Proof. Suppose G is disconnected, and let C be a smallest component with |C| = s. Any v ∈ C has deg(v) ≤ s−1. If s ≤ n/2 then deg(v) ≤ n/2−1 < n/2, contradicting δ(G) ≥ n/2. Hence s ≥ n/2+1, but then the union of two components already has more than n vertices, a contradiction. ∎

Proposition 2 (2-connectivity). If δ(G) ≥ n/2, then G has no cut-vertex.
Proof. Suppose w is a cut-vertex. Let the components of G−w be H_1,…,H_t with t ≥ 2, and set s = min_i |V(H_i)|. For any x in a smallest component, x has neighbors only within that component and possibly w, so deg(x) ≤ (s−1)+1 = s. Since s ≤ (n−1)/2, we get deg(x) ≤ (n−1)/2 < n/2, contradicting δ(G) ≥ n/2. ∎

Lemma 3 (Path-closing). Let P = x_0,x_1,…,x_{n−1} be a Hamiltonian path in G with endpoints u = x_0 and v = x_{n−1}. If deg(u)+deg(v) ≥ n, then G has a Hamiltonian cycle.
Proof. If uv ∈ E(G), adding uv closes P into a Hamiltonian cycle. Assume uv ∉ E(G). Define
A = { i ∈ {1,…,n−2} : u is adjacent to x_i },
B = { i ∈ {2,…,n−1} : v is adjacent to x_{i−1} }.
Because P spans all vertices and uv ∉ E(G), every neighbor of u (resp. v) lies among x_1,…,x_{n−2}, so |A| = deg(u) and |B| = deg(v). For i ∈ {2,…,n−2}, if both u∼x_i and v∼x_{i−1} hold (i.e., i ∈ A ∩ B), then the cycle
u, x_i, x_{i+1}, …, x_{n−1}(=v), x_{i−1}, x_{i−2}, …, x_0(=u)
uses edges of P plus the two chords and spans all vertices. If A ∩ B = ∅, then among the (n−3) indices i ∈ {2,…,n−2} at most one of i ∈ A or i ∈ B can occur each time, and additionally index 1 can contribute only to A and index n−1 only to B. Hence |A|+|B| ≤ (n−3)+1+1 = n−1, contradicting deg(u)+deg(v) = |A|+|B| ≥ n. Therefore A ∩ B ≠ ∅ and the Hamiltonian cycle exists. ∎

Lemma 4 (Single-edge closure equivalence). Let uv ∉ E(G) with deg(u)+deg(v) ≥ n, and let G′ = G + uv. Then G is Hamiltonian if and only if G′ is Hamiltonian.
Proof. If G is Hamiltonian then so is the supergraph G′. Conversely, suppose G′ has a Hamiltonian cycle. If the cycle avoids uv, it is a Hamiltonian cycle of G. If it uses uv, then deleting uv yields a Hamiltonian path in G with endpoints u and v; apply Lemma 3 to conclude that G is Hamiltonian. ∎

Lemma 5 (Closure to K_n under δ ≥ n/2). If δ(G) ≥ n/2, then for every nonedge {u,v} we have deg(u)+deg(v) ≥ n. Iteratively adding all such nonedges yields K_n.
Proof. Under δ(G) ≥ n/2, any two vertices satisfy deg(u) ≥ n/2 and deg(v) ≥ n/2, so deg(u)+deg(v) ≥ n. Adding a nonedge can only increase degrees, so the degree-sum condition persists for remaining nonedges. After finitely many additions, all nonedges are added and the resulting graph is K_n. ∎

Theorem 6 (Dirac’s theorem). Let G be a graph on n ≥ 3 vertices. If δ(G) ≥ n/2, then G is Hamiltonian.
Proof. By Lemma 5 we may add all nonedges with degree-sum at least n to obtain K_n. By Lemma 4, Hamiltonicity is preserved (equivalently) at each addition, so G is Hamiltonian if and only if K_n is. Since K_n has a Hamiltonian cycle for n ≥ 3, G is Hamiltonian. ∎

Proposition 7 (Sharpness of the bound). The threshold n/2 cannot be lowered.
(a) For even n = 2k, the graph K_{k−1, k+1} has δ = k−1 = n/2−1 and is not Hamiltonian (a Hamiltonian cycle in a bipartite graph must alternate evenly, impossible with parts of different sizes).
(b) For odd n = 2k+1, the graph K_{k, k+1} has δ = k = ⌊n/2⌋ and is not Hamiltonian (all cycles in bipartite graphs are even, but n is odd).
Thus the bound n/2 is best possible up to rounding. ∎
Corollary 8 (Two common neighbors under δ ≥ n/2). Let G be a graph on n ≥ 3 vertices with δ(G) ≥ n/2. If u and v are nonadjacent, then |N(u) ∩ N(v)| ≥ 2.
Proof. Since N(u), N(v) ⊆ V(G) \ {u, v}, we have |N(u) ∪ N(v)| ≤ n − 2. Hence
|N(u) ∩ N(v)| = deg(u) + deg(v) − |N(u) ∪ N(v)| ≥ n − (n − 2) = 2. ∎

Corollary 9 (Diameter ≤ 2 under δ ≥ n/2). If δ(G) ≥ n/2, then diam(G) ≤ 2.
Proof. For any two vertices u, v, either uv ∈ E(G), giving distance 1, or uv ∉ E(G), in which case by Corollary 8 they share a neighbor and have distance 2. ∎

Theorem 10 (Ore’s theorem). Let G be a graph on n ≥ 3 vertices such that for every nonadjacent pair u, v we have deg(u) + deg(v) ≥ n. Then G is Hamiltonian.
Proof. Enumerate the nonedges of G arbitrarily and add them one by one. Degrees only increase, so at each step the current nonedge uv being added satisfies deg(u) + deg(v) ≥ n in the current graph. By Lemma 4, each single addition preserves Hamiltonicity equivalence. The final graph is K_n, which is Hamiltonian; thus the original G is Hamiltonian. ∎

Theorem 11 (Bondy–Chvátal closure equivalence). Let G be a graph on n ≥ 3 vertices. Define the operator Φ by
Φ(H) = H + { uv ∉ E(H) : deg_H(u) + deg_H(v) ≥ n }.
Let cl(G) = Φ^m(G) for any m large enough that Φ^m(G) = Φ^{m+1}(G) (this stabilization occurs since the edge set is finite). Then G is Hamiltonian if and only if cl(G) is Hamiltonian. Moreover, cl(G) is the unique graph obtainable from G by repeatedly adding nonedges uv with deg(current u) + deg(current v) ≥ n until none remain, independent of the order of additions.
Proof. Uniqueness/order-independence: Consider the chain H_0 = G, H_{t+1} = Φ(H_t). Since |E| is finite, H_t stabilizes at some m with H_m = Φ(H_m); set cl(G) = H_m. Let G = G_0 ⊂ G_1 ⊂ ··· ⊂ G_s = H be any maximal chain obtained by adding one eligible nonedge at each step, stopping when no such pair remains. First, by monotonicity of Φ we have G_i ⊆ Φ^i(G) for all i (induction: if G_i ⊆ Φ^i(G), then G_{i+1} ⊆ Φ(G_i) ⊆ Φ(Φ^i(G)) = Φ^{i+1}(G)). Hence H ⊆ Φ^s(G) ⊆ cl(G). Conversely, since H has no eligible nonedges, Φ(H) = H; thus for all k, Φ^k(G) ⊆ Φ^k(H) = H by monotonicity, and in particular cl(G) ⊆ H. Therefore H = cl(G), proving order-independence and uniqueness.
Equivalence of Hamiltonicity: At each stage, the set Φ(H_t) \ E(H_t) consists of nonedges uv whose degree sums are ≥ n in H_t. Enumerating these edges one by one yields a chain of single-edge additions from H_t to H_{t+1}; concatenating over t = 0, 1, …, m − 1 gives a chain from G to cl(G) where each added edge satisfies the degree-sum condition in the current graph. By Lemma 4, each addition preserves Hamiltonicity equivalence; composing these equivalences yields that G is Hamiltonian iff cl(G) is. ∎
Corollary 12 (Closing any Hamiltonian path under δ ≥ n/2). Let G be a graph on n ≥ 3 vertices with δ(G) ≥ n/2. If G has a Hamiltonian path with endpoints u and v, then G has a Hamiltonian cycle.
Proof. We have deg(u) ≥ n/2 and deg(v) ≥ n/2, so deg(u)+deg(v) ≥ n. Apply Lemma 3 to close the path. ∎

Corollary 13 (Perfect matching for even n under δ ≥ n/2). Let G be a graph on n ≥ 3 vertices with n even and δ(G) ≥ n/2. Then G has a perfect matching.
Proof. By Theorem 6, G has a Hamiltonian cycle C. Taking every other edge along C yields a matching that saturates all vertices. ∎

Corollary 14 (Near-perfect matching for odd n under δ ≥ n/2). Let G be a graph on n ≥ 3 vertices with n odd and δ(G) ≥ n/2. Then G has a matching of size (n−1)/2.
Proof. By Theorem 6, G has a Hamiltonian cycle C on n vertices. Remove any vertex w to obtain a Hamiltonian path on the remaining n−1 vertices; alternating its edges gives a matching of size (n−1)/2. ∎

Proposition 15 (Constructive extraction of a Hamiltonian cycle under δ ≥ n/2). There is a procedure that, given a graph G on n ≥ 3 vertices with δ(G) ≥ n/2 and adjacency-matrix access, outputs a Hamiltonian cycle in worst-case time O(n^3).
Proof. Enumerate all nonedges of G as e_1,…,e_t (t = O(n^2)). Define G_i = G + {e_1,…,e_i}; then G_t = K_n and for each i the added edge e_i = u_iv_i was eligible in G_{i−1}, i.e., deg_{G_{i−1}}(u_i)+deg_{G_{i−1}}(v_i) ≥ n. Pick any Hamiltonian cycle C_t in K_n. For i = t down to 1: if e_i ∉ E(C_i), let C_{i−1} = C_i; otherwise, delete e_i from C_i to obtain a Hamiltonian u_i–v_i path P in G_{i−1}, and apply Lemma 3 within G_{i−1} (using deg_{G_{i−1}}(u_i)+deg_{G_{i−1}}(v_i) ≥ n) to re-close P into a Hamiltonian cycle C_{i−1} of G_{i−1}. By induction, C_i is a Hamiltonian cycle of G_i for all i, so C_0 is a Hamiltonian cycle of G. Implementation: maintain the current graph as an adjacency matrix, initially K_n; each step removes e_i (if present) and, when needed, scans the u_i–v_i path to locate an index i ∈ A ∩ B as in Lemma 3 in O(n) time. Total time is O(tn) = O(n^3). ∎
