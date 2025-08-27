## Round 0001 — 2025-08-27T14:35:49.057947Z

Status and gaps
- outputs.md not provided in this round; I assume no curated, fully rigorous proof has yet been recorded. I will propose a clean closure-based proof plan with self-contained lemmas and give complete proofs suitable for outputs.md. I also flag small technical points to watch (endpoints, index ranges, n ≥ 3).

Plan (closure route to Dirac)
- Prove the path-closing lemma: a Hamiltonian path with endpoints u,v and deg(u)+deg(v) ≥ n closes to a Hamiltonian cycle. Why useful: it is the local engine for the Bondy–Chvátal single-edge step.
- Deduce the single-edge closure equivalence: adding a nonedge uv with deg(u)+deg(v) ≥ n preserves Hamiltonicity (iff). Why useful: allows iterative augmentation without changing Hamiltonicity.
- Under δ(G) ≥ n/2, every nonedge has deg-sum ≥ n, so the iterative closure yields K_n; therefore G is Hamiltonian. Why useful: completes Dirac’s theorem.
- Record connectivity and 2-connectivity consequences of δ ≥ n/2 and sharpness examples. Why useful: prevents false counterexamples and documents optimality of the bound.

Setting
- All graphs are finite, simple, undirected; n = |V(G)| ≥ 3. Write δ(G) for the minimum degree.

Lemma 1 (Connectivity from δ ≥ n/2)
- Claim: If δ(G) ≥ n/2, then G is connected.
- Proof: If G were disconnected, let C be a smallest component, |C| = s. Each v ∈ C has deg(v) ≤ s − 1. If s ≤ n/2 then deg(v) ≤ s − 1 ≤ n/2 − 1 < n/2, contradicting δ ≥ n/2. Hence s ≥ n/2 + 1, but two disjoint components then have ≥ (n/2 + 1) + (n/2 + 1) > n vertices, impossible. ∎

Lemma 2 (2-connectivity from δ ≥ n/2)
- Claim: If δ(G) ≥ n/2, then G has no cut-vertex.
- Proof: Suppose w is a cut-vertex. Let the components of G − w be H_1,…,H_t with t ≥ 2, and let s = min_i |V(H_i)|. For any x ∈ V(H_i) (the smallest one), x has neighbors only in H_i and possibly w, hence deg(x) ≤ (s − 1) + 1 = s. Also s ≤ (n − 1)/2, so deg(x) ≤ (n − 1)/2 < n/2, contradicting δ ≥ n/2. ∎

Lemma 3 (Path-closing lemma)
- Statement: Let G have a Hamiltonian path P = x_0 x_1 … x_{n−1} with endpoints u = x_0 and v = x_{n−1}. If uv ∉ E(G) and deg(u) + deg(v) ≥ n, then G has a Hamiltonian cycle.
- Proof (indexing per notes): Define
  A = { i ∈ {1,…,n−2} : u is adjacent to x_i },
  B = { i ∈ {2,…,n−1} : v is adjacent to x_{i−1} }.
  Because uv ∉ E(G), every neighbor of u lies among {x_1,…,x_{n−2}}, so |A| = deg(u). Likewise, every neighbor of v lies among {x_1,…,x_{n−2}}, so |B| = deg(v) (via the shift i ↦ i − 1).
  For each i ∈ {1,…,n−2}, we cannot have both edges u x_i and v x_{i−1}, because then the cycle
  x_0(=u) — x_i — x_{i+1} — … — x_{n−1}(=v) — x_{i−1} — x_{i−2} — … — x_1 — x_0
  would be a Hamiltonian cycle in G already. Equivalently, A and B′ := {i − 1 : i ∈ B} are disjoint subsets of {1,…,n−2}. Hence |A| + |B′| ≤ n − 2. But |B′| = |B|, so deg(u) + deg(v) = |A| + |B| = |A| + |B′| ≤ n − 2, contradicting deg(u) + deg(v) ≥ n. Therefore some i has both edges present, giving the Hamiltonian cycle as displayed. ∎
- Why useful: This is the core combinatorial step ensuring we can remove a “closure edge” from a Hamiltonian cycle and still recover Hamiltonicity in the original graph.

Lemma 4 (Single-edge closure equivalence)
- Statement: Let uv ∉ E(G) with deg(u) + deg(v) ≥ n, and let G′ = G + uv. Then G is Hamiltonian iff G′ is Hamiltonian.
- Proof: If G is Hamiltonian then so is its supergraph G′. Conversely, suppose G′ has a Hamiltonian cycle C. If C does not use uv, then C ⊆ G and we are done. If C uses uv, delete uv from C to obtain a Hamiltonian path P of G with endpoints u and v. Apply Lemma 3 to P and deg(u) + deg(v) ≥ n to conclude that G has a Hamiltonian cycle. ∎
- Why useful: Allows iterative addition of edges with deg-sum ≥ n without changing Hamiltonicity.

Lemma 5 (Closure to K_n under δ ≥ n/2)
- Claim: If δ(G) ≥ n/2, then for every nonadjacent pair {u,v}, deg(u) + deg(v) ≥ n. Consequently, adding all such nonedges yields K_n.
- Proof: δ(G) ≥ n/2 implies deg(u) ≥ n/2 and deg(v) ≥ n/2 for all u,v, so the sum is ≥ n. Add any nonedge uv; degrees only increase, so at any stage every remaining nonedge still has deg-sum ≥ n. Adding all of them produces a complete graph. ∎
- Why useful: Reduces Dirac to the trivial Hamiltonicity of K_n.

Theorem (Dirac)
- Statement: For n ≥ 3, every graph G with δ(G) ≥ n/2 is Hamiltonian.
- Proof: Iteratively add nonedges with deg-sum ≥ n to obtain K_n (Lemma 5). By Lemma 4, Hamiltonicity is preserved at each addition, so G is Hamiltonian iff K_n is, and K_n is Hamiltonian for n ≥ 3. ∎

Sharpness and examples
- Even n = 2k: The complete bipartite graph K_{k−1, k+1} has δ = k − 1 = n/2 − 1 and is not Hamiltonian (unbalanced bipartite graphs have no spanning cycle). Shows the bound cannot be lowered below n/2.
- Odd n = 2k + 1: K_{k, k+1} has δ = k = ⌊n/2⌋ and is not Hamiltonian (all cycles are even in bipartite graphs). Shows replacing n/2 by ⌊n/2⌋ would be false.

Checks and potential pitfalls
- n ≥ 3 is essential: for n = 2, δ ≥ n/2 = 1 gives K_2, which has no Hamiltonian cycle in simple graphs (no 2-cycles). Our theorem correctly excludes n = 2.
- Indexing in Lemma 3 carefully avoids referring to uv by restricting A to 1,…,n−2 and using the shifted B. The disjointness is proved on A and B′.
- Closure of K_{n/2, n/2} is indeed K_n: nonedges lie within parts, and each such pair has deg-sum = n, so all are added. No contradiction with Dirac (K_{n/2,n/2} itself is Hamiltonian for n ≥ 4).

Alternative route (for appendix)
- One can also derive Dirac via Ore’s theorem (if deg(u)+deg(v) ≥ n for all nonadjacent u,v, then G is Hamiltonian), which in turn follows by the same single-edge closure lemma without fully iterating to K_n. Or via Pósa’s rotation-extension method plus a longest-path argument. These are optional and not needed for the main proof.

Next steps
- Curate Lemmas 1–5 and the Dirac theorem proof into outputs.md with explicit statements and proofs as above.
- Optionally add a brief note on 2-connectivity corollary and the sharpness examples.
- If desired, include a short Ore-style proof as an appendix for completeness.

