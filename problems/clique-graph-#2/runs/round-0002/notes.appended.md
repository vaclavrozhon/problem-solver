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