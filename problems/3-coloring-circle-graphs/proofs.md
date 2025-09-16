# Rigorous Proofs



Definitions and representation.
- A circle graph is the intersection graph of a set of chords on a circle. Cutting the circle at a point not coinciding with any endpoint yields a linear order of 2n endpoints. Each chord x corresponds to an open interval I(x) = (s(x), t(x)) with s(x) < t(x). Two vertices x ≠ y are adjacent iff the intervals overlap without containment: either s(x) < s(y) < t(x) < t(y) or s(y) < s(x) < t(y) < t(x).
- The ply w of the representation is the maximum size of the active set A(t) = {x : s(x) ≤ t < t(x)} over all cut points t (between consecutive endpoints).

Lemma 1 (Neighborhoods are permutation graphs).
Statement. For any chord x, the induced subgraph G[N(x)] is a permutation graph.
Proof. Let the endpoints of x split the circle into open arcs A_L and A_R (in circular order). Every neighbor z ∈ N(x) has exactly one endpoint on A_L and one on A_R. Place the points of A_L and A_R on two parallel lines, in their circular orders. Map z to the straight segment connecting its endpoint on the A_L-line to its endpoint on the A_R-line. For z,z′ ∈ N(x), the chords cross iff the order of their endpoints is inverted between A_L and A_R, i.e., the two segments cross. This is precisely the permutation-graph model. ∎

Corollary 2 (Double neighborhoods remain permutation). For any chords x,y, the induced subgraph on N(x) ∩ N(y) is a permutation graph.
Proof. By Lemma 1, G[N(x)] is permutation. The class of permutation graphs is hereditary, so every induced subgraph, in particular G[N(x) ∩ N(y)], is permutation. ∎

Theorem 3 (FPT algorithm for k-colorability parameterized by ply w).
Statement. Given a chord/interval representation of a circle graph G on n vertices with interval ply w, one can decide k-colorability in time O(n·w·k^w) and space O(k^w).
Algorithm (endpoint sweep DP). Sort the 2n endpoints to obtain an event order e_1, …, e_{2n}. Maintain at each step t the active set A_t = {x : s(x) ≤ e_t < t(x)} and a set S_t of states. A state is a proper coloring c: A_t → {1,…,k} consistent with all edges whose later-starting endpoint has appeared.
Transitions.
- Start of an interval b at e_{t+1} = s(b): Let N_t(b) = {a ∈ A_t : t(a) < t(b)}. For each state c ∈ S_t, define F_c = {c(a) : a ∈ N_t(b)}. For every color q ∈ {1,…,k} \ F_c, create a successor state c′ extending c by c′(b) = q.
- End of an interval a at e_{t+1} = t(a): For each state c ∈ S_t, remove a from its domain to obtain the successor state.
Correctness. Consider any edge {a,b} with s(a) < s(b). In the overlap model, {a,b} is an edge iff s(a) < s(b) < t(a) < t(b), i.e., at time s(b), a is active and t(a) < t(b). Thus {a,b} is enforced exactly when b starts: the color chosen for b must differ from c(a). All other pairs that are disjoint or nested impose no constraint. By induction over events, S_t consists precisely of the colorings of the partially revealed overlap graph consistent with processed constraints. Hence S_{2n} is nonempty iff G is k-colorable.
Complexity. At any time, |A_t| ≤ w, so a state assigns ≤ w vertices, giving at most k^w states per layer. Each transition computes N_t(b) against A_t in O(w) time (or O(1) if we maintain suitable per-state summaries), so total time O(n·w·k^w). Memory per layer is O(k^w). ∎

Lemma 4 (Side adjacency determined by side endpoints). Fix a chord x with endpoints splitting the circle into A_L and A_R. Let N(x) be precolored with two colors a,b, and let c_x be the third color. For a chord y with both endpoints on A_L, y is adjacent to z ∈ N(x) iff the A_L-endpoint of z lies strictly between the two endpoints of y along A_L. The symmetric statement holds for A_R.
Proof. For z ∈ N(x), its endpoints lie one on each side arc. For y with both endpoints on A_L, the chords y and z cross exactly when the endpoints alternate along the circle, which here is equivalent to the A_L-endpoint of z lying between y’s endpoints on A_L. ∎

Proposition 5 (Side extension under bipartite sides). Let x be a fixed chord with color c_x. Suppose both side subgraphs L (chords with both endpoints on A_L) and R (both endpoints on A_R) are bipartite. Let N(x) be precolored properly with colors {a,b} = {1,2,3} \ {c_x}. For a side H ∈ {L,R}, define for each y ∈ H a set S(y) ⊆ {a,b} of forbidden colors: q ∈ S(y) iff y is adjacent to some z ∈ N(x) of color q. Then H admits a proper coloring φ with colors in {c_x} ∪ ({a,b} \ S(y)) for each y iff for every connected component C of H, at least one of the two bipartition-orientations o of C yields an independent set of violators B_o(C) := { y ∈ C : the a/b color prescribed by o is in S(y) }.
Moreover, when such an orientation exists, coloring B_o(C) with c_x and the remaining vertices according to orientation o gives a proper coloring of C.
Proof. Let C be a connected component of H with bipartition (P,Q). There are exactly two 2-colorings of C with colors {a,b}: o assigns a to P, b to Q; o′ assigns b to P, a to Q. Fix an orientation o. Any y with its prescribed a/b color forbidden (i.e., y ∈ B_o(C)) must take color c_x. If B_o(C) is independent, the coloring that assigns c_x to B_o(C) and the o-prescribed a/b color to the rest is proper: edges inside C either join two vertices with different a/b colors (both outside B_o(C)) or one endpoint in B_o(C) (colors differ), and no edge has both endpoints in B_o(C) by independence. Edges from H to N(x) are respected by construction of S(·). Conversely, suppose there exists a proper coloring ψ of C respecting the lists {c_x} ∪ ({a,b} \ S(y)). Consider the subgraph induced by vertices not colored c_x; ψ restricts to a proper 2-coloring with colors {a,b} and thus equals one of the two orientations (say o). Then the set of vertices colored c_x is exactly B_o(C), which must be independent; otherwise ψ would color adjacent vertices identically (both c_x). This proves the characterization. ∎

Corollary 6 (Algorithm under bipartite sides). Fix x. If G[N(x)], L, and R are bipartite, then for each choice of c_x and for each choice of 2-coloring of the components of N(x), one can compute S(·) on both sides and test all side components via Proposition 5 in total polynomial time. If both sides succeed, combining these colorings with the fixed coloring of N(x) and c_x on x yields a proper 3-coloring of G. Trying all x gives an overall n-fold factor. This is polynomial-time whenever cc(N(x)) is bounded and both sides are bipartite. ∎

Lemma (Path decomposition of width ≤ w−1 from ply).
Let a circle graph be given by an interval-overlap representation with distinct endpoints, and let w be the maximum number of intervals covering any point. Consider the elementary segments σ between consecutive endpoints. For each σ, define B(σ) = {x : s(x) < σ < t(x)}. Then the sequence of bags (B(σ)) in left-to-right order is a path decomposition of the overlap graph of width at most w−1.
Proof. (i) Vertex contiguity: For any interval x, the set of segments σ with s(x) < σ < t(x) is an interval on the line; hence x appears in a contiguous block of bags. (ii) Edge coverage: If x,y are adjacent in the overlap graph, w.l.o.g. s(x) < s(y) < t(x) < t(y). Any σ with s(y) < σ < t(x) is contained in both (s(x), t(x)) and (s(y), t(y)), so both x and y are in B(σ). (iii) Width: By definition of ply, |B(σ)| ≤ w for all σ, thus the width is at most w−1. ∎

Proposition (Ply ≤ 2 implies acyclic).
If the ply w ≤ 2, then the overlap (circle) graph is a forest (in particular, bipartite and 3-colorable).
Proof. Suppose there is a cycle C = (v_1, v_2, …, v_m) with m ≥ 3. Choose v_1 with minimal right endpoint t(v_1) among vertices of C. In the overlap model, v_1 is adjacent to v_2 and v_m, so for each i ∈ {2,m} either s(v_1) < s(v_i) < t(v_1) < t(v_i) or s(v_i) < s(v_1) < t(v_i) < t(v_1). The latter alternative would give t(v_i) < t(v_1), contradicting the choice of v_1. Hence s(v_1) < s(v_2) < t(v_1) < t(v_2) and s(v_1) < s(v_m) < t(v_1) < t(v_m). Pick any point p with max{s(v_2), s(v_m)} < p < t(v_1). Then v_1, v_2, and v_m all cover p, so three intervals cover p, contradicting w ≤ 2. Therefore no cycle exists and the graph is acyclic. ∎

Lemma (Bags induce permutation graphs).
In an interval-overlap representation, fix an elementary segment σ between consecutive endpoints and let B(σ) = {x : s(x) < σ < t(x)}. Then G[B(σ)] is a permutation graph.
Proof. Each x ∈ B(σ) has one endpoint on the left of σ and one on the right. Place left endpoints (in increasing order) on a top line and right endpoints (in increasing order) on a bottom line; connect the two endpoints of each x by a straight segment. For x,y ∈ B(σ), we have x adjacent to y in the overlap graph iff s(x) < s(y) and t(x) > t(y) or vice versa, i.e., the orders on the two lines are inverted, which is exactly the permutation-graph model. ∎

Lemma (Balanced separator of size ≤ w via the sweep).
Let w be the ply. There exists a segment σ such that removing S = B(σ) disconnects the graph into two parts A and C with |A|, |C| ≤ 2n/3.
Proof. Order the elementary segments σ_1,…,σ_m. Let a(i) = |{x : t(x) ≤ σ_i}| and c(i) = |{x : s(x) ≥ σ_i}|. We have a(1)=0, a(m)=n, and a(i+1)−a(i) ∈ {0,1}. Thus there exists i with a(i) ∈ [⌊n/3⌋, ⌈2n/3⌉]. For σ=σ_i, every vertex not in S := B(σ) lies entirely to one side, so removing S separates the graph into A of size a(i) and C of size c(i). Moreover, for every elementary segment we have |B(σ)| ≥ 1 (between the first start and last end), hence c(i) = n − |B(σ)| − a(i) ≤ n − 1 − n/3 < 2n/3, and also a(i) ≤ 2n/3 by choice. Therefore |A|, |C| ≤ 2n/3. ∎

Corollary (List-coloring and counting by ply-DP).
Given lists L(v) ⊆ {1,…,k}, list k-colorability of a circle graph with representation ply w can be decided in O(n·w·k^w) time and O(k^w) space by the sweep/path DP: on introducing u at its start, extend a state only with colors in L(u) \ {c(a) : t(a) < t(u)}; on forgetting u at its end, project the state. Counting k-colorings follows by storing counts per state and summing over equivalent projections. ∎

Lemma (Degeneracy bound).
In an interval-overlap representation with ply w, the graph is (2w−2)-degenerate.
Proof. Consider any induced subgraph and any vertex b in it. Just to the right of s(b), there are at most w−1 other active intervals; all earlier-start neighbors of b must be active there, so b has at most w−1 earlier-start neighbors. Symmetrically, just to the left of t(b), there are at most w−1 other active intervals; all later-start neighbors of b must be active there, so b has at most w−1 later-start neighbors. Hence deg(b) ≤ 2w−2 in any induced subgraph, and the degeneracy is at most 2w−2. ∎

Lemma (Helly-type property for overlap cliques).
Let {I(x)=(s(x),t(x))} be open intervals on a line and let G be their overlap graph (edges between pairs that intersect without containment). If S ⊆ V(G) is a clique, then ⋂_{x∈S} (s(x), t(x)) ≠ ∅.
Proof. Since overlaps imply intersections, intervals in S are pairwise intersecting. Intervals on a line satisfy the Helly property with Helly number 2, hence the intersection over all members is nonempty. For completeness: order S by increasing starts s(x_1) < … < s(x_k). From x_1 ∼ x_k we have s(x_1) < s(x_k) < t(x_1) < t(x_k). For any i, x_1 ∼ x_i and x_i ∼ x_k give s(x_i) < t(x_1) and s(x_k) < t(x_i). Choose p with s(x_k) < p < t(x_1); then p ∈ (s(x_i), t(x_i)) for all i. ∎

Corollary (Clique number via sweep bags; bound by ply).
For a circle graph G represented as above and any elementary segment σ, let B(σ) be the set of intervals covering σ. Then ω(G) = max_σ ω(G[B(σ)]) and ω(G) ≤ max_σ |B(σ)| = w.
Proof. By the lemma, any clique S has a common point p, hence S ⊆ B(σ) for any σ containing p, so ω(G) ≤ max_σ ω(G[B(σ)]). The reverse inequality is trivial since G[B(σ)] is an induced subgraph. The bound by ply is immediate from ω(G[B(σ)]) ≤ |B(σ)| and maximizing over σ. ∎

Lemma (Clique number of a permutation bag via LIS/LDS).
If H is a permutation graph given by two total orders of its vertex set, then ω(H) equals the length of a longest decreasing subsequence when one order is viewed as a permutation of the other.
Proof. In a permutation representation, vertices correspond to segments between two parallel lines; two vertices are adjacent iff the corresponding segments cross, i.e., the relative order of their endpoints is inverted. A set of vertices forms a clique iff every pair crosses, i.e., their endpoints are strictly decreasing in one order relative to the other. Thus cliques correspond exactly to decreasing subsequences. ∎

Proposition (Computing ω(G) in O(n·w·log w)).
With notation as above, ω(G) = max_σ ω(G[B(σ)]). For each σ, compute ω(G[B(σ)]) by the longest decreasing subsequence of the permutation induced by the two orders on B(σ) in O(|B(σ)| log |B(σ)|) time. Since |B(σ)| ≤ w and there are O(n) segments, and ∑_σ |B(σ)| = O(nw), the total time is O(n·w·log w). ∎

Theorem (Exact 2-SAT reduction for bipartite side extension).
Fix a pivot chord x and a color c_x ∈ {1,2,3}. Suppose G[N(x)] is bipartite and a proper 2-coloring with colors {a,b} = {1,2,3}\{c_x} is fixed on each component. Let H be a connected side-subgraph (either L or R) that is bipartite with bipartition (P,Q). For each y ∈ V(H), let S(y) ⊆ {a,b} be the set of colors appearing among neighbors of y in N(x) (computable by prefix sums along the side arc). Build a 2-CNF F(H) with variables: an orientation o_H and z_y for each y, with clauses:
- (Independence) For every edge uv ∈ E(H): (¬z_u ∨ ¬z_v).
- (Avoid forbidden side colors) If y ∈ P: if a ∈ S(y) then (o_H ∨ z_y); if b ∈ S(y) then (¬o_H ∨ z_y). If y ∈ Q: if b ∈ S(y) then (o_H ∨ z_y); if a ∈ S(y) then (¬o_H ∨ z_y).
Then H admits an extension to a proper 3-coloring (assigning c_x to some vertices and a/b to the rest, consistent with the fixed coloring of N(x)) iff F(H) is satisfiable.
Proof. (⇒) From an extension, set z_y=1 iff y has color c_x and set o_H to match the a/b assignment on (P,Q); all clauses hold: independence forbids adjacent z=1, and gating clauses ensure any y with z_y=0 does not receive a forbidden side color. (⇐) From a satisfying assignment, color z_y=1 vertices by c_x and the remaining vertices in P by (a if ¬o_H, b if o_H) and in Q by (b if ¬o_H, a if o_H). Independence guarantees no edge is monochromatic c_x; gating clauses ensure edges to N(x) are proper. Thus we obtain a valid extension. ∎

Corollary (Pivot algorithm under bipartite sides). For a chosen pivot x, trying c_x ∈ {1,2,3} and the two 2-colorings per connected component of G[N(x)], solve F(H) for each side component H independently; accept if all sides succeed. Total time per pivot is O(3·2^{cc(N(x))}·poly(n)). ∎

Theorem (Ply ≤ 3 implies 3-colorability).
Let G be a circle graph given by an interval-overlap representation with ply w ≤ 3. Then G is 3-colorable. Moreover, a 3-coloring can be found in linear time after sorting endpoints.
Proof. The bags B(σ) of intervals covering each elementary segment σ form a path decomposition of G with width ≤ w−1 ≤ 2. Hence treewidth(G) ≤ 2. Graphs of treewidth ≤ 2 are partial 2-trees and thus 3-colorable. Constructively, order vertices by the index of their last bag; fill each bag into a clique to obtain a chordal supergraph H with ω(H) ≤ 3 and use greedy coloring along this perfect elimination order, yielding a 3-coloring of H and hence of G. Building H implicitly from the path decomposition makes the procedure linear after sorting. ∎

Lemma (Structure of N(x)∩N(y) for adjacent x,y).
Let x,y be adjacent chords with s(x)<s(y)<t(x)<t(y) on the circle. Partition the circle into arcs A1=(s(x),s(y)), A2=(s(y),t(x)), A3=(t(x),t(y)), A4=(t(y),s(x)). Then every chord z ∈ N(x)∩N(y) has one endpoint in A1∪A3 and the other in A2∪A4, and in fact z lies in exactly one of the two groups G13 (endpoints in A1 and A3) or G24 (endpoints in A2 and A4). Moreover, every z ∈ G13 intersects every z′ ∈ G24. Consequently, G[N(x)∩N(y)] is independent iff at most one of G13,G24 is nonempty, and the nonempty group is inversion-free (no crossings) in its permutation orders.
Proof. The crossing conditions with x and y force endpoints to be on opposite sides of each of {s(x),t(x)} and {s(y),t(y)}, yielding exactly the two opposite-arc pairs G13 and G24. Fix z∈G13 with endpoints p∈A1 and q∈A3, and z′∈G24 with endpoints r∈A2 and s∈A4. In circular order we have p<r<q<s, so the endpoints alternate and z,z′ cross. Within a fixed group, adjacency is determined by inversions between the two induced orders (permutation graph); independence is equivalent to monotone agreement (no inversions). ∎

Proposition (Canonical-state reduction for 3-coloring DP on a bag).
Let B be a bag of size t in the sweep/path decomposition. Two colorings c1,c2: B→{1,2,3} are equivalent if c2 = π∘c1 for some permutation π of {1,2,3}. The endpoint-DP for plain 3-coloring can be carried out on equivalence classes, using a canonical representative canon(c): scan B in fixed order (e.g., increasing right endpoint) and relabel the first-seen color as 1, the next unseen color as 2, etc.
(i) Correctness: The DP recurrence depends only on color equality/inequality and thus is invariant under global color permutations; applying canon after each introduce/forget preserves the existence of extensions.
(ii) State count: The number of equivalence classes equals the number of set partitions of B into at most 3 blocks: Q(t) = S2(t,1)+S2(t,2)+S2(t,3) = (1/6)·3^t + 1/2. Hence the DP runs in O(n·w·Q(w)) time and O(Q(w)) space, an asymptotic 6× reduction over 3^w. This reduction does not apply when color names carry semantics (lists/precolors). ∎