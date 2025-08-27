- Adopt closure-based proof as the primary route to Dirac: (1) prove path-closing lemma from a Hamiltonian path under deg-sum ≥ n; (2) deduce single-edge equivalence; (3) iterate to K_n under δ ≥ n/2.
- Normalize indexing to x0,…,x_{n−1} with u = x0, v = x_{n−1}. State and use A = {i∈{1,…,n−2}: u~x_i} and B = {i∈{2,…,n−1}: v~x_{i−1}} with |A| = deg(u), |B| = deg(v).
- Include short proofs of connectivity and 2-connectivity under δ ≥ n/2; include sharpness examples K_{k−1,k+1} and K_{k,k+1}; state n ≥ 3 up front.
- Optional appendix: direct Pósa/Ore-style proof; keep the ‘two common neighbors’ claim there if used.
Refinements and recorded tools for the closure route to Dirac

Setting: Finite, simple, undirected graphs on n = |V(G)| ≥ 3; δ(G) is minimum degree. We index Hamiltonian paths as P = x_0,x_1,…,x_{n−1} with u = x_0 and v = x_{n−1}.

Path-closing lemma (indexing we will use): If P is Hamiltonian and deg(u)+deg(v) ≥ n, then G has a Hamiltonian cycle. If uv ∈ E, the path closes immediately. Otherwise define
- A = { i ∈ {1,…,n−2} : u is adjacent to x_i },
- B = { i ∈ {2,…,n−1} : v is adjacent to x_{i−1} }.
Because P spans all vertices and uv ∉ E, |A| = deg(u) and |B| = deg(v). For i ∈ {2,…,n−2}, the simultaneous occurrence i ∈ A ∩ B yields the Hamiltonian cycle u−x_i−…−v−x_{i−1}−…−u. If A ∩ B = ∅, then |A|+|B| ≤ (n−3) + 1 + 1 = n−1, contradicting deg(u)+deg(v) ≥ n. Hence A ∩ B ≠ ∅ and the cycle exists.

Single-edge closure equivalence: If uv ∉ E(G) with deg(u)+deg(v) ≥ n, then G is Hamiltonian iff G+uv is Hamiltonian. The backward direction uses the path-closing lemma after removing uv from a Hamiltonian cycle in G+uv.

Closure under δ ≥ n/2: If δ(G) ≥ n/2, every nonedge uv satisfies deg(u)+deg(v) ≥ n. Adding all such nonedges (degrees only increase) yields K_n. By the equivalence at each step, Hamiltonicity is preserved.

Immediate consequences recorded
- Connectivity: δ ≥ n/2 ⇒ G is connected.
- 2-connectivity: δ ≥ n/2 ⇒ G has no cut-vertex.
- Common neighbors under δ ≥ n/2: For nonadjacent u,v, |N(u)∪N(v)| ≤ n−2, so |N(u)∩N(v)| ≥ deg(u)+deg(v) − (n−2) ≥ 2. Thus any nonadjacent pair has at least two common neighbors. Useful for rotation–extension arguments.

Sharpness: For even n=2k, K_{k−1,k+1} has δ = k−1 = n/2−1 and is non-Hamiltonian (bipartite imbalance). For odd n=2k+1, K_{k,k+1} has δ = k = ⌊n/2⌋ and is non-Hamiltonian (all cycles even). Thus Dirac’s bound can’t be lowered.

What’s next
- Add Ore’s theorem as a corollary of the single-edge equivalence (no full closure needed).
- Prove the full Bondy–Chvátal closure theorem cl(G) is Hamiltonian iff G is.
- Optional: Pancyclicity strengthening (Bondy) under δ ≥ n/2, and a constructive extraction of a Hamiltonian cycle via closure plus the path-closing lemma.
Additions appended to outputs (all rigorously proven there)

- Corollary (two common neighbors under δ ≥ n/2): For any nonadjacent u, v we have |N(u) ∩ N(v)| ≥ 2. Proof idea: N(u), N(v) ⊆ V \ {u, v}, so |N(u) ∪ N(v)| ≤ n − 2; inclusion–exclusion with deg(u) + deg(v) ≥ n gives |N(u) ∩ N(v)| ≥ 2.
- Corollary (diameter ≤ 2 under δ ≥ n/2): Every pair of vertices is either adjacent or has a common neighbor; thus diam(G) ≤ 2.
- Ore’s theorem via Lemma 4: If every nonadjacent pair satisfies deg(u) + deg(v) ≥ n in G, then iteratively adding any nonedge uv preserves Hamiltonicity equivalence (degrees only increase), reaching K_n and implying G is Hamiltonian.
- Bondy–Chvátal closure equivalence: Define Φ(H) by adding all nonedges with current degree sum ≥ n. Iterating Φ from G stabilizes at cl(G). Monotonicity of Φ gives order-independence (any maximal one-by-one process yields the same cl(G)) and provides a chain from G to cl(G) adding one eligible edge at a time; applying Lemma 4 at each step gives G Hamiltonian iff cl(G) Hamiltonian.

Algorithmic note (constructing a Hamiltonian cycle under δ ≥ n/2)
- Compute the closure (here it is K_n) while recording the added edges in order.
- Start with any Hamiltonian cycle in K_n.
- Traverse the added edges in reverse: if the current cycle uses the last added edge uv, delete uv to get a Hamiltonian u–v path in the previous graph and re-close it by the path-closing lemma; otherwise keep the cycle. Invariants: at each step you maintain a Hamiltonian cycle in the current graph. This yields a Hamiltonian cycle in the original G.

Sanity checks
- Threshold examples K_{n/2,n/2} (even n) and small n (n = 3, 4) behave as expected under the closure and the corollaries.

Next objectives
- Prove Bondy’s pancyclicity strengthening (either closure-based or via rotation–extension), and, if included, give sharp exceptions.
- Optional: quantify the complexity of the constructive procedure; record a brief pseudocode and complexity O(n^2)–O(n^3) depending on data structures.
