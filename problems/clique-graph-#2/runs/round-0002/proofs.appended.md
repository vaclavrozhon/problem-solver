# Rigorous Proofs



Lemma 1 (K4-free for Whitney discs). Let G be the underlying graph of a finite Whitney triangulation of the disc (every 3-cycle bounds a triangular face). Then G contains no subgraph isomorphic to K4.
Proof. Suppose a,b,c,d induce a K4. Its four 3-cycles abc, abd, acd, bcd are triangles of G and, by the Whitney property, all four must be faces. Consider the 2-dimensional subcomplex X formed by taking these four triangular faces together with their edges and vertices. Each edge of X lies in exactly two of these faces, and X has f=4 faces, e=6 edges, v=4 vertices, hence χ(X)=v−e+f=2. Thus X is a combinatorial 2-sphere. But a triangulated disc cannot contain a closed spherical subcomplex: in a disc triangulation, every boundary edge is incident with exactly one face, whereas each edge of X is already incident with two faces within X, leaving no way to place X along the boundary. Contradiction. ∎

Corollary 2 (Maximal cliques of G). In the setting of Lemma 1, the clique number of G is 3, and the maximal cliques of G are exactly the facial triangles.
Proof. By Lemma 1, ω(G)≤3. Every edge of a Whitney triangulation lies in at least one facial triangle, so every 2-clique extends to a 3-clique. Since every 3-cycle is a face, the 3-cliques are precisely facial triangles and are maximal. ∎

Lemma 3 (Degree of a face in kG with boundary). Let G be the underlying graph of a finite Whitney triangulation of a disc. For a facial triangle f={a,b,c}, let B(f) be the number of boundary vertices among {a,b,c} and let Eb(f) be the number of boundary edges of f. Then
  deg_{kG}(f) = deg_G(a) + deg_G(b) + deg_G(c) − 6 − B(f) + Eb(f).
In particular, for closed triangulations (no boundary) one has deg_{kG}(f)=deg(a)+deg(b)+deg(c)−6.
Proof. A triangle t≠f is adjacent to f in kG iff it either shares an edge with f or shares exactly one vertex. For v∈{a,b,c}, the number of facial triangles through v equals deg_G(v) if v is interior and deg_G(v)−1 if v is on the boundary. Summing over v and excluding f itself gives Σ_v (deg_G(v)−χ_B(v)) − 3 = deg_G(a)+deg_G(b)+deg_G(c) − B(f) − 3. Triangles sharing an edge with f were counted twice; for each edge e of f there are t_e−1 such triangles distinct from f, where t_e∈{1,2} is the number of facial triangles containing e. Subtracting (t_{ab}−1)+(t_{bc}−1)+(t_{ca}−1) yields
 deg_{kG}(f) = deg_G(a)+deg_G(b)+deg_G(c) − B(f) − 3 − (t_{ab}+t_{bc}+t_{ca}) + 3.
Now t_{ab}+t_{bc}+t_{ca} equals 2·(# interior edges of f) + 1·(# boundary edges of f) = 2(3−Eb(f)) + Eb(f) = 6 − Eb(f). Hence the claimed formula. ∎

Corollary 4 (Closed case summation identity). If G triangulates a closed surface, then for its clique graph kG with vertex set the facial triangles,
  Σ_{f} deg_{kG}(f) = Σ_{v} deg_G(v)^2 − 6F,
where F is the number of facial triangles of G. Consequently, the average degree in kG satisfies
  2|E(kG)|/|V(kG)| ≥ 3·(2|E(G)|/|V(G)|) − 6.
Proof. In the closed case, each vertex v lies in exactly deg_G(v) facial triangles. Summing Lemma 3 over all faces and simplifying yields the identity. The bound follows from Cauchy–Schwarz and F=2|E(G)|/3. ∎

Proposition 5 (Maximal outerplanar discs: structure of k and k^2). Let D be a maximal outerplanar graph (triangulation of a polygon). Let Tri(D) denote its set of facial triangles, and for a boundary vertex v let P_v⊆Tri(D) be the set of facial triangles incident with v.
(a) The family Tri(D) has the Helly property: any pairwise-intersecting subfamily has nonempty total intersection.
(b) The maximal cliques of k(D) are exactly the P_v with deg_D(v)≥3.
(c) Let S={v∈V(D): deg_D(v)≥3}. Then k^2(D) ≅ D[S] (the subgraph induced by S).
Proof. (a) Maximal outerplanar graphs are chordal (indeed 2-trees). In a chordal graph, maximal cliques satisfy the running-intersection property, which implies the Helly property for the family of maximal cliques. Here, the maximal cliques are exactly the facial triangles.
(b) For any v, triangles in P_v pairwise intersect at v, so P_v is a clique in k(D). Conversely, let C be a maximal clique in k(D). Then the corresponding triangles form a pairwise-intersecting family, hence by (a) share a common vertex v; thus C⊆P_v, and maximality gives C=P_v. If deg_D(v)=2, then |P_v|=1 and P_v is not maximal in k(D), as that triangle also lies in P_u for its other two vertices u.
(c) Vertices of k^2(D) correspond to maximal cliques of k(D), i.e., to P_v with v∈S. Two such vertices P_u,P_v are adjacent in k^2(D) iff P_u∩P_v≠∅, i.e., iff there exists a facial triangle containing both u and v, equivalently iff uv∈E(D). Hence k^2(D)≅D[S]. ∎

Corollary 6 (Fans are k-null in ≤2 steps). Let D be a fan (one interior vertex x adjacent to all boundary vertices). Then k(D)≅K_{deg_D(x)} and k^2(D)≅K_1.
Proof. Every facial triangle contains x, so k(D) is complete on the set of faces. The clique graph of a clique is a single vertex. ∎