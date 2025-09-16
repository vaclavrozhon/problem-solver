# Research Notes



Problem. Decide the complexity of 3-coloring circle graphs (intersection graphs of chords of a circle). Unger’s O(n log n) algorithm was refuted (Bachmann–Rutter–Stumpf). For k ≥ 4, k-coloring circle graphs is NP-complete.

Key observations consolidated this round:
- Representation: Cutting the circle away from endpoints turns chords into open intervals (s(x), t(x)) with x,y adjacent iff their intervals overlap without containment: s(x) < s(y) < t(x) < t(y) or vice versa.
- Neighborhood structure: For any chord x, N(x) induces a permutation graph: neighbors of x have one endpoint on each side arc; adjacency among them is determined by inversion between the two side orders. Consequently, in any 3-coloring N(x) must be bipartite.
- Two-chord view: For any x,y, the set N(x)∩N(y) is an induced subgraph of N(x) and hence also a permutation graph (permutation graphs are hereditary). This tightens and replaces a tentative “trapezoid” claim.

Parameterized algorithm (ply w):
- Define the interval ply w as the maximum number of intervals covering a point in the linearized representation. A sweep-line DP over the 2n endpoints maintains proper colorings of the active set; on the start of b, forbid colors used by current actives a with t(a) < t(b). This yields an algorithm for k-colorability in O(n·w·k^w) time and O(k^w) space. The parameter is representation-dependent; recognizing circle graphs and finding a representation is polytime.

Bipartite-sides decomposition:
- Fix a chord x. Removing x splits chords into three parts: left side L, right side R, and N(x). If L and R are bipartite, then for any fixed 2-coloring of each component of N(x), each side reduces to choosing one of its two bipartition orientations; vertices that cannot use their prescribed a/b color (due to conflicts with N(x)) are assigned the third color c_x, provided these “violators” form an independent set. This gives a polynomial-time extension test per choice and overall runtime O(3·2^{cc(N(x))}·poly(n)) for a fixed x; trying all x multiplies by n. This is polytime whenever cc(N(x)) is bounded and both sides are bipartite.

Limits and obstacles:
- Necessary local conditions (e.g., N(v) bipartite for all v) are far from sufficient; known triangle-free circle graphs can have chromatic number 5 (Ageev). The ply parameter can be Θ(n) even for easy instances. Extending the side method beyond bipartite sides appears to require an independent odd cycle transversal with list constraints.

Next steps:
- Unify and finalize the DP proof (k-colorability, O(n·w·k^w)). Implement and benchmark typical w values.
- Replace the double-neighborhood trapezoid claim by the hereditary-permutation fact in all notes.
- Explore a 2-SAT encoding to eliminate the 2^{cc(N(x))} factor; alternatively, branch on a small independent odd-cycle transversal per side.
- Investigate two-chord separators and whether a global decomposition can be derived by combining permutation substructures.
- Hardness attempt within K4-free circle graphs (gadget search aided by SAT/ILP).

Additional consolidated points this round

- Path-decomposition viewpoint. Let the 2n endpoints be sorted and consider the elementary segments between consecutive endpoints. For each segment σ, the bag B(σ) of intervals covering σ has size ≤ w (the ply). The sequence (B(σ)) is a path decomposition of the overlap graph: each vertex x appears in bags for σ ⊂ (s(x), t(x)) (contiguous), and each edge xy (with s(x)<s(y)<t(x)<t(y) or vice versa) is covered by any σ ⊂ (s(y), t(x)). Thus pathwidth ≤ w−1. The sweep DP is exactly standard DP on this path decomposition.

- Structural: tiny ply. If w ≤ 2, the overlap graph is acyclic (a forest): in any cycle, pick the interval with the smallest right endpoint; its two neighbors start before and end after it, so some point is covered by three intervals—a contradiction.

- Bipartite-sides pivot algorithm. For a chord x, if both sides L and R are bipartite and G[N(x)] is 2-colored, then each side component C admits a valid extension iff at least one orientation (assigning a/b to its bipartition) yields an independent set of violators; equivalently, one can encode the side as a 2-SAT instance with variables for component orientations and z-variables marking vertices assigned the third color. This gives polytime per fixed coloring of N(x) and yields an overall FPT algorithm in 2^{cc(N(x))} when such a pivot exists.

- Limits. The attempt to fold all N(x)-component orientation choices into a single 2-SAT generally fails because “color appears” at a side vertex becomes an OR over multiple components. A special “single-touch” subclass (each side vertex sees at most one N(x)-component) admits cleaner 2-SAT constraints, but avoiding branching over side-component orientations still needs a careful, fully polynomial argument.

- Next steps. Implement the ply-DP and the pivot algorithm (with 2-SAT packaging), measure typical w, cc(N(x)), and frequency of bipartite sides; explore two-pivot separators and orientations; pursue characterization for w ∈ {3,4}; and continue gadget search towards hardness within K4-free circle graphs.

New audited observations and extensions

- Bags are permutation graphs. For any elementary segment σ between consecutive endpoints, the active set B(σ) has one endpoint on each side of σ; G[B(σ)] is a permutation graph under the left/right endpoint orders. This strengthens local structure beyond neighborhoods.

- Balanced separator (via sweep). There exists a segment σ with a(σ) := |{x : t(x) ≤ σ}| in [n/3, 2n/3]. Since every elementary segment has |B(σ)| ≥ 1 (between the first start and last end), c(σ) := |{x : s(x) ≥ σ}| = n − |B(σ)| − a(σ) ≤ n − 1 − n/3 < 2n/3, so removing B(σ) separates the graph into two parts of size ≤ 2n/3. This uses the path-decomposition separation property of the sweep bags.

- List-coloring and counting. The sweep/path-DP extends to list k-coloring and to counting colorings with runtime O(n·w·k^w) and space O(k^w), by maintaining per-bag proper list-respecting states and aggregating counts on identical projected states.

- Degeneracy bound. In any overlap representation with ply w, the graph is (2w−2)-degenerate: for a vertex b, at most w−1 earlier-start neighbors are active just right of s(b), and at most w−1 later-start neighbors are active just left of t(b); hence degree ≤ 2w−2 in any induced subgraph, yielding the degeneracy bound.

- Side-interface S(y) by prefix sums. For a pivot x and a fixed 2-coloring of N(x), all S(y) for y on a side arc can be computed in linear time via prefix sums over the arc’s endpoint order.

- Formal 2-SAT packaging (bipartite sides). With variables for side-component orientations and per-vertex z_y (color 3), independence and avoidance of forbidden colors reduce to 2-CNF; combined with branching over the 2-colorings of N(x)-components, this yields polytime per pivot and FPT in cc(N(x)).

- Caution on oct ≤ 1. The proposed iff criterion for extending across a side component with odd-cycle transversal ≤ 1 is not established; necessity fails if neighbors of the apex are forced to color 3. Treat this as a sufficient condition or as a branching-based FPT approach (parameter t + cc(N(x))).

Next actions: finalize proofs for the bag-permutation lemma, balanced separator (with the |B(σ)| ≥ 1 detail), list/counting DP, and degeneracy bound; implement DP and pivot+2-SAT; test empirical parameters w and cc(N(x)).

Additional results and algorithmic corollaries

- Helly-type clique lemma for overlaps. Any clique S in the overlap graph (intervals intersect pairwise and do not contain each other) has a nonempty common intersection ⋂_{x∈S} (s(x), t(x)). Consequently, ω(G) ≤ w (ply), and moreover ω(G) = max_σ ω(G[B(σ)]) where σ ranges over elementary segments and B(σ) is the active set at σ.

- Computing ω(G). Since each bag induces a permutation graph, ω(G[B(σ)]) equals the length of a longest decreasing subsequence under the left/right endpoint orders and can be computed in O(|B(σ)| log |B(σ)|). Summing over all σ yields O(n·w·log w) total time (as ∑σ |B(σ)| = O(nw)).

- Exact 2-SAT side extension (bipartite sides). For a pivot x, a fixed color c_x, and a fixed 2-coloring of each component of N(x), each bipartite side component H reduces to a 2-SAT instance with orientation variable o_H and per-vertex variables z_y (use of c_x). Clauses enforce that adjacent z=1 are forbidden and that any side vertex with z_y=0 avoids forbidden side colors given by S(y). This exactly captures extendability per side; the two sides are independent.

- Caution on oct ≤ 1. The earlier bidirectional claim is not valid; a sufficient condition remains (delete at most one vertex v per side component and require independence of the violator set away from v), but it is not necessary. Treat further extensions via branching/FPT.

Implementation checklist: integrate ω-computation routine; implement ply-DP (lists/counting); implement pivot+2-SAT with linear-time S(y); measure w and cc(N(x)) on benchmarks.

New items and corrections this round

- Ply ≤ 3 ⇒ 3-colorable (constructive). The sweep bags B(σ) give a path decomposition of width ≤ w−1. If w ≤ 3, then pathwidth ≤ 2 (hence treewidth ≤ 2), so G is a partial 2-tree and thus 3-colorable. Constructively, fill each bag to a clique and greedily color along a perfect elimination order; runtime linear after sorting endpoints.

- Canonical-state DP (plain 3-coloring). For bag size t, quotient colorings by global color permutations using first-appearance renaming. The number of canonical states is Q(t)=S2(t,1)+S2(t,2)+S2(t,3)=(1/6)·3^t+1/2, yielding ~6× state reduction vs 3^t. This applies only when color names carry no semantics (no lists/precolors).

- Adjacent pair common neighborhood. For adjacent chords x,y with endpoints in order s(x)<s(y)<t(x)<t(y), the set M=N(x)∩N(y) splits into two groups by opposite arcs: A1–A3 and A2–A4. Every chord from the first group intersects every chord from the second (complete bipartite across groups). Therefore G[M] is independent iff at most one group is nonempty; independence within the nonempty group is equivalent to monotonicity (no inversions) in its permutation orders.

- Exact side-extension criterion (pivot x, fixed 2-coloring of N(x)). A side component H admits extension iff there exists an independent set Z with H−Z bipartite and a list-2-coloring of H−Z using lists {a,b}\S(y) for y∈V(H)\Z. This unifies earlier sufficient criteria and yields an FPT scheme by branching on |Z| per side plus cc(N(x)).

- Summary of implementables: (i) ply-DP (lists/counting); (ii) canonical-state DP for plain 3-coloring; (iii) ω(G) via bags in O(n·w·log w); (iv) pivot+2-SAT for bipartite sides with linear-time S(y); (v) FPT branching on small |Z|.

Next steps: implement the above, measure w and cc(N(x)) on benchmarks, and explore two-pivot separators (N(x)∩N(y) permutation middle with four sides).