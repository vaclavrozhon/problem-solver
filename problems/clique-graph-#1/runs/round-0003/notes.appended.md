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


Additional structural tools and partial classification
- Local Helly across an interior edge: If uv is an interior edge with incident faces uvw and uvx, any face that meets both uvw and uvx must contain u or v. Otherwise it would have to contain both w and x, forcing the edge wx and thus a K4 on {u,v,w,x}, contradicting K4-freeness.
- Shared-edge classification (partial): Let C be a maximal clique in kG that contains two faces t=uvw and g=uvx sharing the interior edge uv. Partition C into A (faces containing u but not v) and B (faces containing v but not u). If B=∅, then C=T(u); if A=∅, then C=T(v). If both A and B are nonempty, then every a∈A and b∈B must share a common vertex in {w,x} (the only common neighbors of u and v). This forces all faces in A and B to contain the same anchor (say w), whence A⊆{f_{uw}} and B⊆{f_{vw}}, so C⊆{t,g,f_{uw},f_{vw}} and maximality yields C={t,g,f_{uw},f_{vw}}=N(t). Symmetrically, if the common anchor is x then C=N(g).
- Caution: Non-star cliques without any edge-sharing pair remain unclassified. A plausible Helly-type statement is that any pairwise-intersecting family of facial triangles with no two sharing an edge has a common vertex; proving this would complete the classification.

Program milestones
- Complete the above shared-edge classification (done; see proofs.md) and then settle the no-edge-sharing case via a minimal-counterexample analysis around a face with minimal number of boundary edges.
- Outerplanar (no interior vertices): model faces as nodes of the dual tree; for each boundary vertex v, the incident faces form a contiguous path S(v). Conjecture: maximal cliques of kG are exactly T(v) with S(v) inclusion-maximal. Aim to show k(kG) is a forest via ear-removal, yielding k-nullness.
- Continue small-instance computations for guidance (particularly with interior degrees 4 and 5).