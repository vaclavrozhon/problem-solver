## Round 0001 — 2025-08-27T09:50:46.706981Z

Mini-plan:
- Normalize assumptions (finite, simple, undirected graphs; n ≥ 3) and note edge cases; clarify rounding of n/2.
- Prove structural lemmas: δ ≥ n/2 implies connectivity and in fact 2-connectivity.
- Prove the Bondy–Chvátal single-edge closure step carefully (full self-contained argument).
- Deduce Dirac from closure: under δ ≥ n/2, the closure is K_n; conclude Hamiltonicity.
- Record sharpness examples showing the bound cannot be reduced.
- Sanity-check on small n and outline an alternative direct Dirac-style longest-cycle proof skeleton for later.

Setup and normalization
- We work with finite, simple, undirected graphs on n vertices, and will assume n ≥ 3. Interpret δ(G) ≥ n/2 as δ(G) ≥ ceil(n/2) since degrees are integers.

Claim 0. If n ≤ 2, the statement every graph with minimum degree ≥ n/2 is Hamiltonian is false. Why useful here: Ensures we restrict to the standard n ≥ 3 regime of Dirac's theorem.
- Proof sketch: For n = 1, δ = 0 ≥ 1/2, but there is no cycle of length 1 in standard conventions. For n = 2, K2 has δ = 1 = n/2 but has no cycle of length 2 in simple graphs.
- How it can fail: If one adopts a nonstandard convention allowing a 2-cycle or loop, the statement might change; we exclude such conventions.
- Quick test: K2 has δ = 1 ≥ 1 = n/2 but is not Hamiltonian. So we impose n ≥ 3 in the task.

Claim 1. δ(G) ≥ n/2 implies G is connected. Why useful here: Rules out disconnected counterexamples and supports later longest-path arguments.
- Proof sketch: If G were disconnected with components of sizes a and n − a, then every vertex in the smaller component has degree at most a − 1 ≤ n/2 − 1, contradicting δ ≥ n/2.
- How it can fail: If one weakens δ to ≥ (n − 1)/2, disconnected graphs can exist.
- Quick test: Take n = 2k + 1 and G = K_k ∪ K_{k+1}. Then δ = k − 1 = (n − 3)/2 and G is disconnected; indeed δ < n/2.

Claim 2. δ(G) ≥ n/2 implies G is 2-connected (no cut-vertex). Why useful here: Prevents cut-vertex obstructions to extending cycles/paths and is a standard strengthening in the Dirac range.
- Proof sketch: Suppose v is a cut-vertex. Then G − v has components A, B with |A| = a, |B| = b and a + b = n − 1. For any u ∈ A, all neighbors of u lie in A ∪ {v}, so deg(u) ≤ (a − 1) + 1 = a. Hence δ ≤ min(a, b) ≤ floor((n − 1)/2) < n/2, contradiction.
- How it can fail: If δ is only ≥ floor(n/2), there are graphs with cut-vertices; for example, join a high-degree vertex to two dense blocks whose sizes are imbalanced.
- Quick test: n = 6, suppose a cut splits into a = 2, b = 3. Then any u in the a-side has degree ≤ 2 < n/2 = 3; so δ ≥ 3 forbids a cut-vertex, consistent with the claim.

Claim 3. Longest-path lower bound: every graph has a path with at least δ(G) + 1 vertices. Why useful here: A standard baseline for rotation–extension and path-to-cycle arguments; also a sanity check that δ-scale phenomena reach linear size.
- Proof sketch: Let P be a longest path with endpoint x. If a neighbor of x were outside P, we could extend P, contradiction. Thus all neighbors of x lie on P, so P contains x together with all deg(x) neighbors, giving |P| ≥ deg(x) + 1 ≥ δ + 1.
- How it can fail: The analogous claim for cycles, length ≥ δ + 1, is false in general; we only assert it for paths.
- Quick test: In a star K_{1,m}, δ = 1 and indeed there is a path with 2 vertices; equality holds.

Claim 4. Bondy–Chvátal single-edge closure step. Let u, v be nonadjacent vertices with deg(u) + deg(v) ≥ n. Then G is Hamiltonian if and only if G + uv is Hamiltonian. Why useful here: It is the engine for the closure method; iterating it under δ ≥ n/2 will complete G to K_n without changing Hamiltonicity.
- Proof sketch: The forward direction is trivial. For the backward direction, assume G + uv has a Hamiltonian cycle C. If C avoids edge uv, then C ⊆ G and we are done. Otherwise, delete edge uv from C to obtain a Hamiltonian path P in G from u to v, say P: x_1 = u, x_2, ..., x_n = v.
  For i = 1, ..., n − 1, consider the consecutive pair (x_i, x_{i+1}). Define S = {i ∈ {1, ..., n − 1} : u is adjacent to x_{i+1} in G} and T = {i ∈ {1, ..., n − 1} : v is adjacent to x_i in G}. Because P contains all vertices, the neighbors of u (resp. v) correspond bijectively to indices in S (resp. T), so |S| = deg(u), |T| = deg(v). If S and T were disjoint, then |S| + |T| ≤ n − 1, contradicting deg(u) + deg(v) ≥ n. Hence there exists i with i ∈ S ∩ T, meaning u is adjacent to x_{i+1} and v is adjacent to x_i. Then the cycle u, x_{i+1}, x_{i+2}, ..., v, x_i, x_{i−1}, ..., x_1 = u is a Hamiltonian cycle in G avoiding uv. Thus G is Hamiltonian.
- How it can fail: The degree-sum threshold is tight for this argument; if deg(u) + deg(v) ≤ n − 1, the sets S and T can be disjoint and the splice may be impossible.
- Quick test: Let G be the path P4 on vertices 1−2−3−4. Then deg(1) + deg(4) = 2 < n = 4. G is not Hamiltonian, but G + 14 is Hamiltonian (C4). This does not contradict the lemma because the degree-sum condition fails.

Claim 5. Under δ(G) ≥ n/2, the closure cl(G) obtained by repeatedly adding nonedges uv with deg(u) + deg(v) ≥ n is the complete graph K_n. Why useful here: Reduces Dirac to the trivial fact that K_n is Hamiltonian.
- Proof sketch: Since deg(u) ≥ n/2 and deg(v) ≥ n/2 for all vertices, every nonedge uv already satisfies deg(u) + deg(v) ≥ n in the original graph. Thus we may add every missing edge; degrees only increase, so the condition remains satisfied throughout. Eventually all missing edges are added and cl(G) = K_n.
- How it can fail: If we only had δ ≥ floor(n/2), then for some nonedges uv, the sum deg(u) + deg(v) could be n − 1, and the closure may stop before reaching K_n.
- Quick test: n = 6, δ ≥ 3. Any nonedge uv has deg(u) + deg(v) ≥ 6, so it is added. After processing all, we indeed get K6.

Claim 6. Dirac via closure. If n ≥ 3 and δ(G) ≥ n/2, then G is Hamiltonian. Why useful here: This directly addresses the task.
- Proof sketch: By Claim 5, cl(G) = K_n. By Claim 4 applied at each added edge, Hamiltonicity is preserved during closure. K_n is Hamiltonian for n ≥ 3 (cycle through the vertices), hence so is G.
- How it can fail: Only if an intermediate application of Claim 4 were invalid; but the degree-sum hypothesis holds for every added edge throughout, so the chain is valid.
- Quick test: n = 5, δ ≥ 3. For instance, take K5 minus two disjoint edges; δ = 3. Closure adds back both missing edges, reaching K5, hence G is Hamiltonian; indeed one sees a 5-cycle directly.

Claim 7. Sharpness of the bound. The threshold δ ≥ n/2 cannot be lowered in general.
- Proof sketch: Even n = 2k: G = K_{k−1, k+1} has δ = k − 1 = n/2 − 1 and is not Hamiltonian because a bipartite Hamiltonian cycle would have to alternate perfectly between the two parts, which is impossible when part sizes are unequal. Odd n = 2k + 1: G = K_{k, k+1} has δ = k = floor(n/2) = ceil(n/2) − 1 and is not Hamiltonian because any cycle in a bipartite graph has even length, but n is odd.
- How it can fail: One might mistakenly cite K_{k,k} at n = 2k as a counterexample; but K_{k,k} is Hamiltonian (indeed 2-factorable), and in fact meets the Dirac bound with equality.
- Quick test: n = 6, K_{2,4} has δ = 2 = n/2 − 1 and is not Hamiltonian; n = 7, K_{3,4} has δ = 3 = floor(7/2) and is not Hamiltonian.

Sanity checks on small n
- n = 3: δ ≥ 2 forces G = K3, Hamiltonian.
- n = 4: δ ≥ 2. Examples: C4 (Hamiltonian), K4 minus a matching (Hamiltonian). No counterexamples exist.
- n = 5: δ ≥ 3. Example: K5 minus two disjoint edges, Hamiltonian. Balanced bipartite K_{2,3} has δ = 2 < 3 and is not Hamiltonian, consistent.

Alternative direct Dirac-style proof skeleton (for later writeup)
- Assume G not Hamiltonian and let C be a longest cycle of length c. Then there exists a vertex w outside C. Show that w has at least two neighbors on C at distance at least 2 apart along C using δ ≥ n/2, and splice to form a longer cycle, contradicting maximality. This approach avoids closure and uses rotation–extension; to be completed in a polished writeup if desired.

Status
- We now have a complete, local-lemma-based proof pipeline (via Bondy–Chvátal closure) with explicit lemmas and checks, and examples showing the bound is tight.

