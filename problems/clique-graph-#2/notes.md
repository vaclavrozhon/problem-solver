# Research Notes



- Whitney triangulations of the disc (every 3-cycle bounds a triangular face) are K4-free: a K4 would force its four 3-cycles to be faces, forming a closed spherical subcomplex incompatible with a disc. Hence the clique number is 3, and maximal cliques of G are exactly the facial triangles.

- Degree of a face in kG (discs, with boundary): For a facial triangle f={a,b,c}, let B(f) be the number of boundary vertices among a,b,c and Eb(f) the number of its boundary edges. Then
  deg_k(f) = deg(a)+deg(b)+deg(c) − 6 − B(f) + Eb(f).
  Special cases: interior face (B=Eb=0) gives deg_k(f)=deg(a)+deg(b)+deg(c)−6; a boundary face with exactly b boundary edges satisfies deg_k(f)=deg(a)+deg(b)+deg(c) − 6 − B + b. This corrects an earlier (incorrect) formula that ignored boundary vertices.

- Maximal outerplanar discs (triangulated polygons): The family of facial triangles has the Helly property (as maximal outerplanar graphs are chordal/2-trees). Consequently, maximal cliques of k(D) are precisely the sets P_v of facial triangles incident with a boundary vertex v with deg(v)≥3. Two iterations yield k^2(D) ≅ D[S], where S={v: deg_D(v)≥3} and adjacency in k^2(D) matches edges of D between vertices in S. This exposes a two-step “ear pruning” mechanism on maximal outerplanar discs.

- Fans (one interior apex adjacent to all boundary vertices) satisfy k(D)≅K_{deg(x)} and k^2(D)≅K1 (k-null in ≤2 steps).

Open items and next steps:
- General discs: We need a rigorous proof (or counterexample) that any pairwise-intersecting family of facial triangles has a common vertex (which would imply maximal cliques of k(G) are stars T(v)).
- For maximal outerplanar discs: formalize that D↦D[S] strictly decreases a simple invariant and eventually terminates at K3, proving k-nullness for this subclass.
- Explore a two-step potential Φ(G)=|{distinct stars T(v)}| and test whether Φ(k^2G)<Φ(G) unless Φ(G)=1 in general disc triangulations.
- Computational checks on small discs to validate the k^2-pruning and search for counterexamples to the “stars” characterization.

Update: Maximal cliques in k(G) for Whitney disc triangulations.
- Any maximal family of facial triangles that are pairwise intersecting is either a vertex-star P_v (all facial triangles through a vertex v) or a triangle-star Q_f consisting of an interior face f and its three edge-neighbours. In particular, Helly fails in general (Q_f has empty total intersection), but holds in the maximal outerplanar subclass (only P_v occur).
- Consequences for k^2(G): vertices of k^2 split into P_v and Q_f types. Intersections (and hence adjacencies) are determined combinatorially:
  • P_u–P_v adjacent iff uv is an edge of G (some facial triangle contains both).
  • P_v–Q_f adjacent iff v is a corner of f or the third vertex of a neighbour of f.
  • Q_f–Q_g adjacent iff f and g share an edge (then {f,g}⊆Q_f∩Q_g).
- Maximal outerplanar discs: only P_v are maximal, and k^2(D)≅D[S] with S={deg≥3}. If D[S] is a path P_m then k(P_m)=P_{m−1}, so D is k-null after ≤ m+1 more steps.

Next steps:
- Fully formalise the P/Q adjacency rules and compress k^2(G) into an explicit graph operation on G (faces↔Q, vertices↔P) with clear identification conditions.
- Prove a 2-step potential Φ decreasing strictly under k^2, e.g., Φ(G)=|{maximal P_v}|+|{interior faces}|, aiming at k-nullness for all Whitney discs.
- Exhaustive checks on small discs to calibrate Φ and search for slow cases.