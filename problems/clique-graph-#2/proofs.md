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

Lemma (Face-separation by an interior face). Let G be a finite Whitney triangulation of the disc and let f=xyz be an interior facial triangle. Then G−{x,y,z} has exactly three components, each attached along one of the edges xy, yz, zx; any vertex outside {x,y,z} that lies in a triangle meeting xy (resp. yz, zx) belongs to the corresponding component.
Proof. In a plane embedding of the disc triangulation, f bounds a closed 2-cell. Its boundary cycle x–y–z–x separates the plane; since all edges lie on the embedded 1-skeleton and faces are triangles, any vertex adjacent to two of {x,y,z} lies in the wedge beyond the corresponding edge, and no path avoiding {x,y,z} can cross between wedges. Thus removal of {x,y,z} disconnects into exactly three components, one per wedge. ∎

Proposition (Maximal cliques in k(G) for Whitney discs). Let G be the underlying graph of a finite Whitney triangulation of the disc. A clique K in k(G) is maximal if and only if either
(i) K=P_v := { facial triangles containing v } for some vertex v (vertex-star), or
(ii) K=Q_f := { f } ∪ { the three facial neighbours of an interior face f } (triangle-star).
Proof. First, P_v and Q_f are cliques; P_v is clear. For Q_f, any two members intersect (f meets each neighbour along an edge; two distinct neighbours meet at a vertex of f).
Let K be a maximal clique. If ⋂_{T∈K}T≠∅, pick v in the intersection. Then K⊆P_v and maximality gives K=P_v.
Assume ⋂_{T∈K}T=∅. We show K=Q_f for some interior face f. We claim no two members of K share an edge. Indeed, if T1 and T2 share edge uv, let their third vertices be c and d. Since the intersection of all members is empty, any T3∈K must avoid u and v. To meet T1 and T2, T3 must contain c and d, hence cd is an edge and {u,v,c,d} induces K4, impossible by K4-freeness of Whitney discs. Thus, among any three T1,T2,T3∈K, the pairwise intersections are single vertices.
Choose T1,T2,T3∈K and pick x∈(T1∩T2)\T3, y∈(T2∩T3)\T1, z∈(T3∩T1)\T2. Then x,y,z are distinct and xz, xy, yz are edges (each pair lies together in one of T1,T2,T3). Hence xyz is a 3-cycle and, by the Whitney property, a face f. By the face-separation lemma, G−{x,y,z} splits into three wedge-components U_xy, U_yz, U_zx. The third vertex of Ti lies in the component corresponding to the edge opposite its intersection with the other two. Any triangle τ avoiding {x,y,z} lies entirely within one component, so it can intersect at most one of T1,T2,T3. Therefore every member of K contains at least two of {x,y,z}. The only facial triangles containing two vertices of {x,y,z} are f and its three edge-neighbours. Hence K⊆Q_f. If f∉K, then K∪{f} is still a clique, contradicting maximality; thus f∈K. Finally, any triangle outside Q_f contains at most one vertex of {x,y,z} and hence misses one of the edge-neighbours; thus K cannot properly contain Q_f. Therefore K=Q_f. ∎

Lemma (Global degree-sum identity on discs). Let G be a finite Whitney triangulation of the disc, T its set of faces, and for v an integer t(v)=# of facial triangles incident with v; for an edge e, let t(e)∈{1,2} be the number of facial triangles incident with e. Then
  Σ_{τ∈T} deg_{kG}(τ) = Σ_{v} t(v)^2 − Σ_{e} t(e)^2.
Proof. For τ={a,b,c}, deg_{kG}(τ)=t(a)+t(b)+t(c) − t(ab) − t(bc) − t(ca). Summing over τ and swapping sums yields Σ_v t(v)·(# faces at v) − Σ_e t(e)·(# faces at e) = Σ_v t(v)^2 − Σ_e t(e)^2. ∎

Corollary (Closed case). If G triangulates a closed surface, then for each face f={a,b,c}, deg_{kG}(f)=deg(a)+deg(b)+deg(c)−6 and Σ_f deg_{kG}(f)=Σ_v deg(v)^2 − 6F, where F is the number of faces. ∎