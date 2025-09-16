# Rigorous Proofs



Setup and conventions. Let G be the underlying graph of a finite Whitney triangulation of the disk: an embedding on the closed disk in which every 3-cycle of G bounds a facial triangle, each edge is incident with one or two faces (boundary or interior edge, respectively), and the union of the faces is a topological disk.

Lemma 1 (K4-free). The graph G contains no K4 as a subgraph.
Proof. Suppose a K4 with vertex set X={a,b,c,d} occurs. By the Whitney condition, each 3-cycle in X bounds a face, so the four triangles abc, abd, acd, bcd are faces of the triangulation. Every edge of the K4 lies in exactly two of these four triangular faces, hence none of these edges is a boundary edge, and no additional face can be incident with them. Therefore the subcomplex formed by these four faces has empty boundary: it is a closed 2-dimensional component (indeed, the boundary of a tetrahedron). This cannot occur in a triangulation of a disk, whose 2-complex has exactly one component with nonempty boundary and no closed components. Contradiction. ∎

Corollary 2. The maximal cliques of G are exactly its facial triangles.
Proof. By Lemma 1, G has no K4. Any 3-clique is a 3-cycle and hence a facial triangle by the Whitney condition. No edge or single vertex is maximal. ∎

Lemma 3 (Link of an interior vertex). If v is an interior vertex of G with neighbors N(v) listed in cyclic order around v as w_1,\dots,w_d, then for each i the edge w_iw_{i+1} exists and bounds the face (v,w_i,w_{i+1}), and there is no edge w_iw_j for nonconsecutive indices i\notin\{j\pm1\}.
Proof. Each face incident to v is a triangle and uses two consecutive neighbors of v; thus each consecutive pair bounds a face and is an edge. If some nonconsecutive pair w_i,w_j were adjacent, then (v,w_i,w_j) would be a 3-cycle and hence a face by the Whitney condition. This face would overlap the existing fan of faces around v, contradicting that faces form a 2-manifold (the local link at v must be a simple cycle). Hence no such chord exists. ∎

Corollary 4 (Interior degree bound). If v is an interior vertex then deg(v) ≥ 4.
Proof. If deg(v)=3, Lemma 3 implies the neighbors form a triangle w_1w_2w_3, which is a 3-cycle. By Whitney, it must be a face. But the three faces (v,w_1,w_2), (v,w_2,w_3), (v,w_3,w_1) already partition the region bounded by w_1w_2w_3, so w_1w_2w_3 cannot be a face. Contradiction. ∎

Proposition 5 (Vertex-stars are maximal cliques in kG). Let v be an interior vertex with deg(v)=d≥4, and let T(v) be the set of faces incident to v. Then T(v) induces a clique in kG and is maximal.
Proof. Any two faces in T(v) meet at v, so T(v) is a clique. Let f be a face not containing v. By Lemma 3, f contains at most two vertices from N(v), and if it contains two, they must be consecutive along the link cycle. If f contains exactly one neighbor w_i of v, then f intersects only the two faces (v,w_{i-1},w_i) and (v,w_i,w_{i+1}) in T(v). If f contains two consecutive neighbors w_i,w_{i+1}, then f intersects at most the three faces (v,w_{i-1},w_i), (v,w_i,w_{i+1}), (v,w_{i+1},w_{i+2}) in T(v). In all cases, since d≥4, there exists a face in T(v) disjoint from f. Hence no face outside T(v) is adjacent (in kG) to all of T(v), proving maximality. ∎

Proposition 6 (Interior-face 4-cliques). Let t be an interior face whose three edges are interior. Let N(t) be the set consisting of t and the unique face across each edge of t. Then N(t) has size 4 and induces a K4 in kG, and it is a maximal clique of kG.
Proof. Each of the three neighbors of t shares an edge with t, hence is adjacent to t in kG. Two distinct neighbors of t share exactly one vertex (the corresponding vertex of t), so they are adjacent. Thus N(t) induces K4. For maximality, let f be any face not in N(t). If f meets all three neighbors of t, then, since any two of those neighbors intersect only in a vertex of t, f must contain at least two vertices of t. But any face containing two vertices of t must use an edge of t, and each edge of t already has exactly two incident faces (t and its opposite neighbor), so no such f exists. Therefore N(t) is maximal. ∎

Lemma 7 (Connectivity of kG). If G has at least two faces, then kG is connected.
Proof. The dual graph whose vertices are faces of G and edges join faces that share an edge is connected (the 2-complex is a disk). Since kG contains this dual graph as a spanning subgraph (it has at least those adjacencies, and possibly more when faces meet at a vertex), kG is connected. ∎

Special k-null cases.
Proposition 8 (Fans). If G has exactly one interior vertex v (a fan triangulation), then kG is complete, hence k^2G≅K1.
Proof. Every face contains v, so any two faces intersect. The clique graph of a complete graph is K1. ∎

Proposition 9 (Two faces). If G consists of two triangles sharing an interior edge, then kG≅K2 and k^2G≅K1. ∎

Proposition 10 (Central interior triangle in a hexagon). Consider a maximal outerplanar triangulation obtained from a 6-cycle A–B–C–D–E–F–A by adding chords AC, CE, EA. The faces are ABC, CDE, EFA, and ACE, and every pair of faces intersects. Hence kG≅K4 and k^2G≅K1. ∎


Lemma 11 (Local Helly across an interior edge). Let uv be an interior edge with incident faces t=uvw and g=uvx (w\neq x). If a face f intersects both t and g, then f contains u or v.
Proof. Suppose f contains neither u nor v. Then to meet t and g, f must contain both w and x. Any face containing w and x must include the edge wx. But then the vertices {u,v,w,x} span all six edges uv,uw,vw,ux,vx,wx, yielding a K4, contradicting Lemma 1. ∎

Lemma 12 (Common neighbors of an interior edge). With notation as above, N(u)\cap N(v)=\{w,x\}.
Proof. Any common neighbor y of u and v forms the 3-cycle uvy, which must be a face by the Whitney property. Since uv is interior, it has exactly two incident faces, namely t and g. Hence y∈\{w,x\}. ∎

Proposition 13 (Classification when a shared interior edge is present). Let C be a maximal clique of kG that contains two faces t=uvw and g=uvx sharing the interior edge uv. Then either C=T(u), or C=T(v), or C=N(t)={t,g,f_{uw},f_{vw}}, or C=N(g)={g,t,f_{ux},f_{vx}}, where f_{ab} denotes the unique face across interior edge ab when it exists.
Proof. Let A be the set of faces in C that contain u but not v, and B the set of faces that contain v but not u. If B=\varnothing, then every face in C contains u, so C⊆T(u), and maximality forces C=T(u). Symmetrically, if A=\varnothing then C=T(v). Assume A,B≠\varnothing. For any a∈A and b∈B, a and b cannot share u or v, so they must share a common neighbor of u and v. By Lemma 12, the only possibilities are w or x. Thus for every a∈A and b∈B we have (w∈a∩b) or (x∈a∩b).
Claim: All faces in A contain the same anchor in {w,x}, and all faces in B contain the same anchor, and these anchors are equal. Indeed, if some a,a′∈A satisfy w∈a and x∈a′, then any b∈B would need to contain both w and x to intersect both a and a′, impossible. Thus all A-faces contain the same anchor; call it y∈{w,x}. The same argument shows all B-faces contain the same anchor y′∈{w,x}. Since every a∈A must meet every b∈B, we must have y=y′.
Assume y=w (the case y=x is symmetric). Any face in A contains u and w but not v; the only such face is f_{uw} (the face opposite uw), so A⊆{f_{uw}}, and in fact A={f_{uw}}. Similarly, B={f_{vw}}. Therefore C⊆{t,g,f_{uw},f_{vw}}. All four pairwise intersect, so by maximality C must equal this set, i.e., C=N(t). If y=x, the same reasoning yields C=N(g). ∎
