## Round 0001 — 2025-08-27T09:50:46.706820Z

Mini-plan
- Fix the model (finite, simple, undirected graphs, n ≥ 3) and restate target (Dirac’s theorem). Note and use the immediate consequence δ ≥ n/2 ⇒ every nonedge uv satisfies deg(u)+deg(v) ≥ n.
- Prove two basic structural lemmas under δ ≥ n/2: (i) connectivity and (ii) 2-connectivity. Why useful: rules out trivial counterexamples and enables path/cycle splicing arguments.
- Prove a path-closing lemma (pigeonhole on a Hamiltonian path between u and v with deg(u)+deg(v) ≥ n). Why useful: this is the key single-step Bondy–Chvátal closure move.
- Derive the single-edge closure equivalence (G is Hamiltonian iff G+uv is Hamiltonian when deg(u)+deg(v) ≥ n).
- Conclude Dirac via iterating closure to K_n; record sharpness examples and sanity checks; flag pitfalls.

Setup and standing assumptions
- All graphs are finite, simple, undirected; |V(G)| = n ≥ 3. δ(G) denotes minimum degree. “Hamiltonian” = containing a cycle through all n vertices.
- Target statement (Dirac): If δ(G) ≥ n/2, then G is Hamiltonian.
- Immediate observation: If δ(G) ≥ n/2 and uv is a nonedge, then deg(u)+deg(v) ≥ n.

Claim 1 (Connectivity and 2-connectivity from δ ≥ n/2)
- Statement: If δ(G) ≥ n/2, then G is connected and has no cut-vertex (i.e., G is 2-connected).
- Sketch proof:
  - Connectivity: Suppose G has ≥ 2 components, with sizes a and b ≥ 1 and a+b ≤ n. Any vertex in the component of size a has degree ≤ a−1, contradicting δ ≥ n/2 unless a−1 ≥ n/2. But then a ≥ n/2+1 and similarly b ≥ n/2+1, so a+b ≥ n+2, impossible. Thus G is connected.
  - No cut-vertex: Suppose v is a cut-vertex, so G−v has ≥ 2 components A, B with sizes a = |A|, b = |B| and a+b = n−1. Pick u ∈ A. Then N(u) ⊆ (A−{u}) ∪ {v}, so deg(u) ≤ (a−1)+1 = a. By δ ≥ n/2 we get a ≥ n/2. Similarly b ≥ n/2. Then a+b ≥ n, contradicting a+b = n−1. Hence no cut-vertex.
- Why useful here: longest-path/closure arguments typically need at least connectivity; 2-connectivity prevents trivial obstructions and aligns with Hamiltonicity.
- How it can fail: For n small (e.g., n=2) statements are false/trivial; we assumed n ≥ 3. For the cut-vertex part, we used the easy bound deg(u) ≤ a; the only way around is if some u had neighbors outside A∪{v}, but that’s impossible by definition of components of G−v.
- Quick test: n=6, δ ≥ 3. Try to engineer a cut vertex. If G−v had components of sizes 3 and 2, then a=3, b=2 fail b ≥ n/2=3. Contradiction as expected.

Claim 2 (Two common neighbors from a large degree sum)
- Statement: If u,v are nonadjacent and deg(u)+deg(v) ≥ n, then |N(u) ∩ N(v)| ≥ 2.
- Proof: N(u), N(v) ⊆ V \ {u,v}, so |N(u) ∪ N(v)| ≤ n−2. Inclusion–exclusion gives |N(u) ∩ N(v)| = deg(u)+deg(v) − |N(u) ∪ N(v)| ≥ deg(u)+deg(v) − (n−2) ≥ 2.
- Why useful here: shows abundance of overlaps; often used to pivot/rotate paths and to rule out local obstructions.
- How it can fail: If we mistakenly allowed loops or multiple edges or counted u ∈ N(u), v ∈ N(v), the bound breaks; but in simple graphs, neighborhoods exclude the vertex itself.
- Quick test: In K_{m,m} with n=2m, any two nonadjacent vertices lie in the same part and have exactly m common neighbors; lower bound 2 is satisfied for m ≥ 2.

Claim 3 (Longest path lower bound)
- Statement: Every graph has a path on at least δ(G)+1 vertices.
- Proof: Let P be a longest path with endpoints x,y. Then all neighbors of x lie on P, so deg(x) ≤ |P|−1. Hence |P| ≥ deg(x)+1 ≥ δ+1.
- Why useful here: sanity check on reachability; under δ ≥ n/2 this already yields a path of length ≥ n/2+1, a mild step toward Hamiltonicity.
- How it can fail: If we allowed infinite graphs or directed edges, the statement needs modification; here finite and undirected suffices.
- Quick test: For C_5 (δ=2) the longest path has length 3 (i.e., 3 vertices), consistent with δ+1=3.

Lemma 4 (Path-closing lemma; pigeonhole on a Hamiltonian path)
- Statement: Let G be a graph on n vertices. Let P = x_0, x_1, ..., x_{n-1} be a Hamiltonian path in G with endpoints x_0 = u and x_{n-1} = v, and suppose uv is not an edge. If deg(u)+deg(v) ≥ n, then G has a Hamiltonian cycle.
- Proof: Consider index set I = {1,2,...,n−1}. Define
  - A = { i ∈ I : u is adjacent to x_i } so |A| = deg(u) (all neighbors of u lie among x_1,...,x_{n−1}).
  - B = { i ∈ I : v is adjacent to x_{i−1} } so |B| = deg(v) (neighbors of v lie among x_0,...,x_{n−2}).
  Then A,B ⊆ I and |A|+|B| ≥ n = |I|+1, hence A ∩ B ≠ ∅. Take i ∈ A ∩ B. Edges ux_i and v x_{i−1} are present. The following closed walk is a Hamiltonian cycle:
  u = x_0, x_1, ..., x_i, then jump via ux_i back to u? No—use the chords in the order that preserves simplicity:
  Construct the cycle
  u — x_i — x_{i+1} — ... — x_{n−1}(=v) — x_{i−1} — x_{i−2} — ... — x_1 — u,
  where the edges used are: ux_i (by choice i ∈ A), the path edges x_j x_{j+1} for j = i,...,n−2, the chord v x_{i−1} (by choice i ∈ B), and the path edges x_{j} x_{j−1} for j = i−1,...,1. This visits every x_j exactly once and returns to u, hence is a Hamiltonian cycle.
- Why useful here: This is the combinatorial heart of the Bondy–Chvátal single-edge closure step.
- How it can fail: The indexing must avoid using uv; that’s why B is defined with predecessors x_{i−1}. A common pitfall is to pair u with x_i and v with x_{i+1}; that pairing does not directly yield a simple cycle without repetition.
- Quick test: Take n=6, a Hamiltonian path P = (u,a,b,c,d,v) with deg(u)=deg(v)=3. If uv ∉ E, then A = {indices of neighbors of u} and B = {indices whose predecessors neighbor v} both have size 3 in I={1,...,5}; intersection exists, e.g., i=3 could work (u—c and v—b), and the cycle is u—c—d—v—b—a—u.

Lemma 5 (Single-edge closure equivalence; Bondy–Chvátal step)
- Statement: Let G be a graph on n vertices and u,v nonadjacent with deg(u)+deg(v) ≥ n. Then G is Hamiltonian iff G' = G + uv is Hamiltonian.
- Proof: “Only if” is trivial. For “if”, assume G' has a Hamiltonian cycle. If that cycle does not use uv, it lies in G and we are done. Otherwise, delete edge uv from the cycle; what remains is a Hamiltonian path in G from u to v. By Lemma 4, G then has a Hamiltonian cycle.
- Why useful here: This makes adding edges with large degree sum a Hamiltonicity-preserving operation.
- How it can fail: If the path-closing lemma were false or incorrectly applied (e.g., wrong pairing indices), or if G' were assumed Hamiltonian only via a cycle that cannot be converted, the equivalence would fail. Lemma 4 prevents this.
- Quick test: In K_{3,3}, pick two same-side vertices u,v; deg(u)+deg(v)=6=n. K_{3,3} is Hamiltonian, and so are all supergraphs including the extra edge uv; closure preserves Hamiltonicity both ways.

Corollary 6 (Dirac via closure)
- Statement: If δ(G) ≥ n/2, then G is Hamiltonian.
- Proof idea: For any nonedge uv of G, deg(u)+deg(v) ≥ n. By Lemma 5, adding any such nonedge preserves Hamiltonicity equivalence. Iteratively add all nonedges; degrees only increase, so the precondition remains true throughout. The process ends at K_n, which is Hamiltonian for n ≥ 3. Therefore, the original G is Hamiltonian.
- Why useful here: This is a compact, auditable route to Dirac’s theorem using only Lemma 4.
- How it can fail: Must ensure we can indeed add all nonedges; but the premise deg(u)+deg(v) ≥ n holds for every nonedge at the start (since δ ≥ n/2), and only improves as we add edges. Another pitfall is n=2; our standing assumption n ≥ 3 avoids it. Finally, we used that K_n is Hamiltonian (trivial for n ≥ 3).
- Quick tests:
  - n=4: δ ≥ 2. All such graphs are Hamiltonian; e.g., C_4, K_4 minus any matching, etc.
  - n=6: δ ≥ 3. Examples like K_{3,3} (bipartite) and the cocktail-party graph CP_3 (K_6 minus a perfect matching; δ=4) are Hamiltonian.

Sharpness of the bound
- Even n: K_{n/2−1, n/2+1} is connected, non-Hamiltonian (bipartite parts unequal), and has δ = n/2−1. Shows δ ≥ n/2−1 does not suffice.
- Odd n: K_{(n−1)/2, (n+1)/2} is connected, non-Hamiltonian, with δ = (n−1)/2 = ⌊n/2⌋ < n/2. Again, threshold n/2 is tight.
- How it can fail: One might mistakenly cite K_{n/2,n/2} as a counterexample at the boundary; but balanced complete bipartite graphs K_{m,m} are Hamiltonian for m ≥ 2 (they have many 2-factors that are cycles of length 2m).
- Quick test: K_{2,4} (n=6) has δ=2 = n/2−1 and is not Hamiltonian (unequal bipartition), as expected.

Notes on earlier misconceptions and corrections
- Disconnected counterexamples under δ ≥ n/2 do not exist: Claim 1 already forbids disconnectedness and cut-vertices. Any attempt to refute Dirac by a disconnected graph violates δ ≥ n/2.

Summary of where we are
- We have given a clean, self-contained path-closing lemma (Lemma 4), the single-edge closure equivalence (Lemma 5), and the short derivation of Dirac via iterative closure (Corollary 6). We also established basic structure (2-connectivity) and recorded sharpness examples. The remaining work is presentation polish (LaTeX writeup), and optionally an alternative direct proof via longest-path rotations (Pósa/Ore-style) for redundancy.

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

