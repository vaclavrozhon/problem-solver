# Research Notes



Structural facts we will use for Whitney triangulations of the disk
- The underlying graph G is K4-free. Otherwise the four 3-cycles of a K4 would all be faces, every edge of that K4 would be incident with two faces within the K4, yielding a closed 2D component incompatible with a disk with boundary.
- Every maximal clique of G is a facial triangle: Whitney implies every 3-cycle is a face, and K4-free prohibits larger cliques.
- The link of an interior vertex v is a chordless cycle on N(v): the faces around v are exactly the triangles (v, w_i, w_{i+1}) in cyclic order; any chord among nonconsecutive neighbors would create a 3-cycle (v, w_i, w_j) that cannot be realized as a face without breaking the manifold structure.
- In particular, interior vertices have degree ≥ 4 (deg 3 would force the neighbor triangle to be a face, contradicting that it is subdivided by the three v-incident faces).
- For an interior vertex v with deg(v) ≥ 4, the set T(v) of faces incident to v is a clique in kG and is maximal: a face f not containing v can include at most two consecutive neighbors of v, hence meets at most three consecutive faces in T(v); for deg(v) ≥ 4 there exists a face of T(v) disjoint from f.
- For an interior face t with all three edges interior, N(t) (t together with the faces across its three edges) induces a K4 in kG and is a maximal clique.

Special k-null families verified
- Fans (exactly one interior vertex): all faces meet at the apex, so kG is complete; hence k^2G ≅ K1.
- Two-face disk (two triangles sharing one interior edge): kG ≅ K2 and k^2G ≅ K1.
- Hexagon with a central interior triangle (outerplanar triangulation with three chords forming a central triangle): exactly four faces; all pairs intersect, so kG ≅ K4 and k^2G ≅ K1.

Open targets and plan
- Classify maximal cliques of kG: Conjecture that every non-star maximal clique is N(t) for some interior face t. Needed: a rigorous reduction showing any pairwise-intersecting family of faces with no common vertex has size ≤ 4 and is contained in N(t).
- Outerplanar case (no interior vertices): pursue ear-removal induction. Track how maximal cliques of kG change and prove that k(kG) remains acyclic (or otherwise identify a monotone invariant). Verify carefully that adding/removing an ear does not create cycles in the clique graph.
- Computation: exhaustively generate small disk Whitney triangulations to test k-iterations and search for counterexamples to k-nullness in low-degree interior regimes (4 and 5).
