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

Refinements and corrections
- Local Helly across an interior edge (uv with faces uvw and uvx): any face meeting both must contain u or v. This rule underpins all local classifications.
- Maximality of N(t): for a fully interior face t=abc, the set C(t)={t and the three faces across ab, bc, ca} induces K4 in kG and is maximal. Any face f meeting all of C(t) leads to a K4 obstruction.
- Shared-edge classification: Any maximal clique containing two faces on an interior edge uv equals T(u), T(v), or C(t) for one of the two uv-faces t.
- Three-triangle lemma: If three faces are pairwise intersecting, have no common vertex, and no pair shares an edge, then they are exactly the three neighbors of a fully interior face. Consequently, such a 3-set is not maximal since it extends to C(t).

Corrections
- Size-3 vertex-stars T(v) can be maximal (e.g., hexagon with faces ABC, ACD, ADE, DEF has maximal cliques T(A) and T(D)). Remove any restriction |T(v)|≥4 from global classification statements.
- Outerplanar Helly claim is false: maximal outerplanar triangulations can contain a fully interior triangular face (e.g., central triangle ACE in a hexagon). The triple {ABC, CDE, EFA} is pairwise intersecting with no common vertex.

Open tasks
- No-edge-sharing cliques: Prove rigorously that any pairwise-intersecting family with no shared edges is either (i) contained in a single T(v) and hence extendable unless it equals T(v), or (ii) exactly the three neighbors of a fully interior face and thus extendable to C(t). This will complete the classification: maximal cliques of kG are precisely T(v) or C(t).
- Outerplanar case: With the corrected catalogue (T(v) and possibly C(t)), set up an ear-removal induction and track how these maximal cliques transform under k. Aim to show k(kG) becomes a forest or has a decreasing potential.
- Computation: continue exhaustive checks (n≤20 faces; interior degrees 4–5) to test the classification and k-iteration stabilization.

Corrections and completion of the clique classification
- Clique number: ω(kG)=max{ max_v |T(v)|, 4·1_{there exists a fully interior face} }. The value 4 occurs only when some face has all three edges interior.
- Outerplanar note: In a maximal outerplanar triangulation every bounded face has exactly one boundary edge; hence fully interior faces do not occur. Earlier speculation to the contrary is withdrawn.

No-edge-sharing cliques (pairwise-intersecting families of faces with no shared edges)
- Three-triangle lemma (recall): If three faces are pairwise intersecting, share no common vertex, and no pair shares an edge, then they are exactly the three neighbors of a fully interior face t.
- Completion: Let S be a clique in kG with no edge-sharing pair. If ⋂S≠∅ then S⊆T(v). If ⋂S=∅, pick any three F1,F2,F3∈S; by the lemma they are the three neighbors of a fully interior face t=abc. Any fourth face f meeting all three must fall into one of the cases:
  (i) |f∩{a,b,c}|=2: f would share an edge with one of F1,F2,F3, forbidden.
  (ii) |f∩{a,b,c}|=1, say {a}: To meet the neighbor across bc without using b or c, f must contain the opposite vertex x_bc. Then ax_bc must be an edge (for f to be a face), but the edges ab,ac,bx_bc,cx_bc,ax_bc would form a K4 on {a,b,c,x_bc}, impossible.
  (iii) |f∩{a,b,c}|=0: To meet all three neighbors, f must be {u,v,w}, the three opposite vertices across ab, bc, ca. Then the 3-cycles ubv, vcw, wau are forced to be faces by Whitney, and together with t and its three neighbors and the face uvw this creates a closed 2D component (all edges of this subcomplex lie in exactly two faces), contradicting that we triangulate a disk. Hence no such f exists.
Conclusion: Any no-edge-sharing clique is either contained in a vertex-star T(v) (and not maximal unless it equals T(v)) or is exactly the triple of neighbors of a fully interior face (and extends to the maximal K4 N(t)).

Global classification (summary)
- Every maximal clique of kG is either T(v) for some vertex v (interior or boundary; when T(v) is maximal) or N(t) for some fully interior face t. This will be used in analyzing k^2G as the intersection graph on these families.
