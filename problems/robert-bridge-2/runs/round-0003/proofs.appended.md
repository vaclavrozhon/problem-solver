# Rigorous Proofs



Definitions

- Let X be either G_{•,≤D} (all connected rooted graphs with max degree ≤D) or G_{•,=D} (all connected rooted D‑regular rooted graphs), D≥2. For a rooted graph (G,ρ), denote by B_r(G,ρ) its rooted r‑ball and by Cyl(F) the set of rooted graphs whose r‑ball equals F.
- A topology T on X is cylinder‑rich if for every open neighborhood U∈T and every x∈U there exists r such that Cyl(B_r(x))⊆U.

Lemma 1 (Parity in even‑regular graphs). In a countably infinite D‑regular graph with even D, every bridge is 2‑way infinite (after deleting a bridge, both components are infinite).
Proof. Suppose e separates a finite component C. Then ∑_{v∈C}deg_G(v)=D|C| is even, while in G−e the degree sum in C equals 2|E(C)|+1, which is odd. Contradiction.

Lemma 2 (Bridge‑forcing cylinder for ≤D). Fix D≥2. Let F be any realized r‑ball in X=G_{•,≤D}. Then there exists R>r and a realized R‑ball F′ with the following property: for every (G,ρ) with B_R(G,ρ)≅F′, the graph G contains a bridge e whose finite side lies entirely inside B_R(G,ρ), and e remains a bridge in every extension of B_R(G,ρ) respecting the degree bound.
Proof. Choose a boundary vertex u at distance r with deg_F(u)<D (existence follows since the graph is infinite). Build a finite connected graph H disjoint from F and a new vertex w∈V(H) so that: (i) every vertex of H\{w} has degree D within H, (ii) w has degree D−1 within H, and (iii) H contains no edges to F. Form F′ by adjoining H to F and adding the single edge e=uw. Inside F′, saturate all vertices of H to degree D (already true after adding e) and add edges within the F‑side (using new vertices on the F‑side only) to keep all degrees ≤D and maintain connectivity of the F‑side around the root. Leave at least one boundary vertex on the F‑side with spare degree to allow an infinite continuation. Then in any extension of F′ with maximum degree ≤D: no vertex of H can be incident to new edges (all have degree D), so the only possible edges between H and the rest are those already present; thus removing e disconnects H from the rest, so e is a bridge. The H‑side is finite; the F‑side can be extended to an infinite graph via a boundary vertex with spare degree. Hence Cyl(F′) is nonempty and every member has a (1‑way infinite) bridge.

Lemma 3 (Bridge‑forcing cylinder for =D, odd D). Fix odd D≥3. Let F be any realized r‑ball in X=G_{•,=D}. Then there exists R>r and a realized R‑ball F′ such that every (G,ρ) with B_R(G,ρ)≅F′ contains a bridge e, and e remains a bridge in all D‑regular extensions of F′.
Proof. Pick a boundary vertex u at distance r; inside F, deg_F(u)≤D, with at least one missing incident edge reserved for connections outside. Construct a finite connected D‑regular block H_0 and choose a vertex w_0∈V(H_0). Replace at w_0 one internal edge by a short tree‑like patch so that within the H‑side the vertex w has degree D−1 and every other vertex has degree D; denote the result by H and its special vertex by w. Form F′ by adjoining H and adding the single edge e=uw. On the F‑side, add edges and finitely many vertices (all within radius R) to saturate u to degree D while keeping the F‑side connected, and ensure at least one other boundary vertex retains spare stubs for infinite continuation. On the H‑side, every vertex has total degree D in F′ (w gains its final incident edge via e), so no extension can add edges at H; thus e remains the unique edge between H and the rest in any D‑regular extension, hence a bridge. Existence of an infinite D‑regular extension realizing F′ follows by continuing from a boundary vertex on the F‑side using a standard infinite D‑regular construction (e.g., attach a rooted copy of the D‑regular tree and adjust locally with finite D‑regular patches as needed); only the outside of radius R is modified, so B_R equals F′.

Theorem 4 (Bridgeless is nowhere dense for cylinder‑rich topologies). Let T be a cylinder‑rich topology on X.
- If X=G_{•,≤D} with D≥2, the set of bridgeless graphs is nowhere dense in (X,T).
- If X=G_{•,=D} with odd D≥3, the set of bridgeless graphs is nowhere dense in (X,T).
Proof. Let U be a nonempty T‑open set and x∈U. By cylinder‑richness, there exists r with Cyl(B_r(x))⊆U. Apply Lemma 2 (≤D) or Lemma 3 (=D odd) to obtain F′ extending B_r(x) such that Cyl(F′)⊆Cyl(B_r(x)) and every graph in Cyl(F′) has a bridge e that is preserved in all extensions. In particular, Cyl(F′)∩(bridgeless)=∅, and since the property is enforced by bounded‑radius degree saturation, any limit of graphs from Cyl(F′) still contains e as a bridge; hence cl_T(Cyl(F′))⊆(has a bridge), so Cyl(F′)∩cl_T(bridgeless)=∅. Thus the interior of cl_T(bridgeless) is empty. Therefore bridgeless is nowhere dense.

Remark (even D regular). By Lemma 1, any bridge in =D with even D must be 2‑way infinite. The above one‑sided bubble forcing cannot be used there (it would force a 1‑way bridge and hence yields an empty cylinder). Typicality for “bridgeless” in =D even reduces to understanding the size (Baire‑category) of the set of graphs with a 2‑way infinite bridge; this remains to be settled here.

Setup and notation
Let X be either G_{•,≤D} (connected rooted graphs with max degree ≤D) or G_{•,=D} (connected rooted D‑regular graphs), with D≥2. For a rooted graph x=(G,ρ) and r∈N, write F_r(x)=B_r(G,ρ). For a realized r‑ball F, denote the cylinder Cyl(F):={x∈X: F_r(x)≅F}.

Definition (cylinder‑open topologies)
A topology T on X is cylinder‑open if every local cylinder Cyl(F) is T‑open. (Equivalently, T contains the local topology.)

Lemma 1 (parity for even regular). In a countably infinite D‑regular graph with even D, every bridge is 2‑way infinite.
Proof. If removing e leaves a finite component C, then ∑_{v∈C}deg(v)=D|C| is even but also equals 2|E(C)|+1, a contradiction.

Lemma 2 (bridge‑forcing for ≤D). Fix D≥2. For any realized r‑ball F in X=G_{•,≤D}, there exists R>r and a realized R‑ball F′⊇F such that every completion x with F_R(x)≅F′ contains a bridge e whose finite side lies within F′, and e remains a bridge in every completion.
Proof. Pick u∈L_r(F) with deg_F(u)<D (otherwise F cannot extend to an infinite graph). Create a finite connected bubble H disjoint from F, with a designated vertex w of degree D−1 inside H and all other vertices of degree D in H. Set e=uw and include H∪{e} entirely within the annulus {r+1,…,R−1}. Inside this region, add edges among vertices of H (and possibly new auxiliary vertices at radii <R) so that every vertex of H, including w after adding e, has degree D within F′. Do not add any other edges between H and F. Leave at least one vertex on the F‑side boundary with residual degree to allow infinite continuation. In any completion with F_R=F′, no vertex of H can receive further incident edges (already degree D), hence the only edge across the cut (H)–(rest) is e, which is therefore a bridge. The H‑side is finite by construction.

Lemma 3 (bridge‑forcing for =D, odd D). Let D≥3 be odd. For any realized r‑ball F in X=G_{•,=D}, there exist R>r and a realized R‑ball F′⊇F such that every D‑regular completion x with F_R(x)≅F′ contains a bridge e that persists in all completions.
Proof. Choose u∈L_r(F). Let G_0:=K_{D+1}−e_0 (D+1 vertices, all but two of degree D, the two special vertices of degree D−1). Take a finite chain of copies of G_0 by identifying a special vertex of one copy with a special vertex of the next, restoring degree D at the identified vertex and leaving two special vertices overall. Call one w. Place the chain in the annulus {r+1,…,R−1} and add e=uw. Now all vertices of the chain have degree D within F′ (w’s degree is completed by e). No other edges join the chain to F. Ensure on the F‑side that at least one boundary vertex outside u can still be continued to realize an infinite D‑regular completion (e.g., by attaching disjoint D‑regular trees beyond radius R). In any D‑regular completion with F_R=F′, vertices of the chain cannot receive new edges (already degree D), so e is the unique edge across the cut and hence a bridge. The chain side is finite.

Theorem 4 (bridgeless nowhere dense under cylinder‑open topologies). Let T be a cylinder‑open topology on X.
(i) For X=G_{•,≤D} (D≥2), the set S_br of bridgeless graphs is nowhere dense in (X,T).
(ii) For X=G_{•,=D} with odd D≥3, S_br is nowhere dense in (X,T).
Proof. Let U be nonempty T‑open and pick x∈U. Since T is cylinder‑open, there is a cylinder C:=Cyl(F_r(x)) with x∈C⊆U. By Lemma 2 (or Lemma 3), there is R>r and a realized R‑ball F′ with Cyl(F′)⊆C such that every completion in Cyl(F′) has a bridge which persists. Thus Cyl(F′)⊆U and Cyl(F′)∩S_br=∅. Hence every nonempty open set contains a nonempty open subset disjoint from S_br, so int_T(cl_T(S_br))=∅ and S_br is nowhere dense.

Meagreness of 2‑way infinite bridges
For D>2, let S_{2wb}⊂X be the set of graphs containing a 2‑way infinite bridge.

Lemma 5 (nowhere dense at fixed radius). Fix k∈N and D>2. The set S_k of graphs having a 2‑way infinite bridge whose edge lies at distance ≤k from the root is nowhere dense in the local topology.
Proof. Let Cyl(F) be any nonempty cylinder with r≥k+2. Consider the set E_k of edges of F within distance ≤k from the root, viewed inside the finite graph F. For an edge e∈E_k, let F−e partition the vertex set of F into two sides A_e,B_e. Call e safe if at least one side (say A_e) contains no boundary vertex v∈L_r(F) with deg_F(v)<D; equivalently, every boundary vertex on A_e has deg_F(v)=D (or there is no boundary vertex on A_e). In any completion x∈Cyl(F), vertices not on the boundary cannot gain new neighbors; boundary vertices with deg_F(v)=D cannot gain new neighbors either. Hence in every completion, the component corresponding to A_e remains finite, and e cannot be a 2‑way infinite bridge.
For a critical edge e, both A_e and B_e contain a boundary vertex with deg_F(v)<D; pick v_A∈A_e∩L_r(F) and v_B∈B_e∩L_r(F) with deg_F(v_A),deg_F(v_B)<D. Extend F outside radius r by adding a new neighbor x_v to every boundary vertex v with deg_F(v)<D, and then connect all such x_v along a simple cycle using new edges and (if needed) new auxiliary vertices, all placed at distances r+1 or r+2 from the root. Let H be the resulting finite extension and R:=r+2. For the critical e, in H there is a path from one endpoint of e to v_A inside A_e⊆F (disjoint from e), then the edge (v_A,x_{v_A}), then along the external cycle to x_{v_B}, then to v_B, and finally inside B_e⊆F to the other endpoint, giving a path between the endpoints of e disjoint from e. Hence e lies on a cycle contained in B_R(H). Put F′:=B_R(H). Then Cyl(F′)⊆Cyl(F) and no x∈Cyl(F′) contains a 2‑way infinite bridge at distance ≤k. Therefore S_k is nowhere dense.

Theorem 6 (S_{2wb} is dense meagre for D>2). For D>2, in both X=G_{•,≤D} and X=G_{•,=D}, the set S_{2wb} is meagre and dense in the local topology.
Proof. Meagre: S_{2wb}=⋃_{k∈N} S_k and each S_k is nowhere dense by Lemma 5. Density: Given any cylinder Cyl(F), choose two distinct boundary vertices v_1,v_2 with deg_F(v_i)<D (existence is immediate in =D and otherwise by extending r if needed). Outside a sufficiently large radius, build two disjoint infinite D‑bounded branches T_1,T_2, connect the core only to T_1 by a long path, and connect T_1 to T_2 by a single edge e so that the whole graph remains within degree bound (and D‑regular in the =D case by using D‑regular trees). Then e is a 2‑way infinite bridge. By placing all modifications beyond some radius R, we get Cyl(B_R)⊆Cyl(F) consisting of graphs with a 2‑way infinite bridge. Thus S_{2wb} meets every cylinder and is dense.

Corollary 7 (even D‑regular: bridgeless is comeagre). For even D>2 on X=G_{•,=D}, every bridge is 2‑way infinite (Lemma 1), and S_{2wb} is meagre (Theorem 6). Hence the set of bridgeless graphs is comeagre in the local topology. The same holds for any cylinder‑open topology containing the local one.


Theorem A (2-way infinite bridges are meagre and dense for D>2).
Let X be either G_{•,≤D} or G_{•,=D} with D>2 under the local topology. For each k∈N, the set P_k of graphs that contain a 2-way infinite bridge at distance ≤k from the root is nowhere dense. Hence P=⋃_{k} P_k is meagre. Moreover, P is dense in X.

Proof.
Fix k and a realized cylinder C(F) with F=B_r(G,ρ), r≥k. Let S be the set of boundary vertices v∈L_r(F) with deg_F(v)<D. If S=∅, then no completion from C(F) can produce a 2-way infinite bridge with both sides escaping beyond B_r, so P_k∩C(F)=∅ and we are done by taking F′=F.
Assume S≠∅. For each v∈S, add a new vertex x_v at distance r+1 adjacent to v. Next connect the set {x_v: v∈S} into a single simple cycle by inserting new vertices outside B_{r+1} as needed so that degrees of all new vertices stay ≤D (this is always possible since D>2). Ensure at least one new vertex on this cycle retains residual degree (e.g., make one cycle node of degree 2), guaranteeing nonemptiness of the refined cylinder by allowing infinite continuation beyond radius r+2. Let H be the resulting extension and set F′=B_{r+2}(H).
Consider any edge e within distance ≤k from the root. If in F−e one side has no vertex from S, then in any completion from C(F) that side cannot be infinite (no boundary vertex there has residual capacity), so e cannot be a 2-way infinite bridge. Otherwise there exist v_A,v_B∈S on distinct sides of e. In H there is a path from v_A to v_B outside B_r via the cycle; concatenating with paths inside F from the endpoints of e to v_A and v_B (avoiding e) yields a cycle passing through e wholly contained in B_{r+2}(H). Therefore, for any completion with r+2-ball equal to F′, e is not a bridge. It follows that C(F′)⊆C(F) and C(F′)∩P_k=∅. Since C(F) was arbitrary, P_k is nowhere dense. As P=⋃_k P_k, P is meagre.
For density, let C(F) be any cylinder. Outside some large radius R≫r, attach two disjoint infinite D‑bounded rays and connect them by a single edge e; then connect the core to exactly one ray by a long path. This yields an element of C(F) with a 2‑way infinite bridge e. Hence P is dense.

Lemma B (Parity obstruction in even‑regular graphs).
In a D‑regular infinite graph with even D, every bridge is 2‑way infinite.
Proof. If removing e leaves a finite component C, then ∑_{v∈C}deg(v)=D|C| is even, while in G−e it equals 2|E(C)|+1, a contradiction.

Corollary C (Bridgeless is comeagre in even‑regular spaces).
In X=G_{•,=D} with even D>2 under the local topology, the set of graphs with a bridge equals P (by Lemma B) and is meagre (Theorem A). Its complement (bridgeless) is therefore comeagre.

Theorem D (Bridgeless is nowhere dense in cylinder‑rich topologies for ≤D and odd‑regular).
Let T be a cylinder‑rich topology on X. Then the set of bridgeless graphs is nowhere dense in G_{•,≤D} for D≥3 and in G_{•,=D} for odd D≥3.
Proof. Let U∈T be nonempty and x∈U. By cylinder‑richness, there is r with C(B_r(x))⊆U. Build a finite sealed set S within some larger radius R so that: (i) all vertices of S have total degree D inside B_R, (ii) there is exactly one edge e between S and V(B_R)\S, and (iii) there remains at least one vertex outside S with residual capacity to permit infinite completions (≤D) or a D‑regular completion (odd D). Then every graph in C(B_R(x)) contains the bridge e, hence U contains a nonempty open subset disjoint from the bridgeless set. Therefore bridgeless is nowhere dense in (X,T).

Lemma E (Existence of a finite D‑saturated bubble in ≤D).
Let D≥2. There exists n≥D+2 with parity opposite to D such that the degree sequence s=(D,…,D,D−1) of length n is graphic and admits a connected simple realization H with a distinguished vertex w of degree D−1 and all other vertices of degree D.
Proof. Choose n with Dn odd (e.g., n=D+3 if D is even; n=D+2 if D is odd). Then sum(s)=Dn−1 is even. Erdős–Gallai inequalities: for nonincreasing s with maximum D<n, there exists a realization iff ∑_{i=1}^n s_i is even and for all 1≤k≤n,
∑_{i=1}^k s_i ≤ k(k−1)+∑_{i=k+1}^n min(k,s_i).
These hold for large enough n with our choice (standard estimates; alternatively, apply Havel–Hakimi greedily to produce a simple realization). Since min s_i ≥ D−1 ≥ 1 and ∑ s_i = Dn−1 ≥ 2(n−1) for D≥2, Hakimi’s connectivity criterion implies a connected realization exists. Fix such a connected simple H; take w to be the unique vertex of degree D−1.

Lemma F (Odd‑regular bubble via K_{D+2}).
Let D≥3 be odd. Then there exists a finite connected simple graph H with a vertex w of degree D−1 and all other vertices of degree D. Construction: Take K_{D+2}, remove the edges of a Hamiltonian cycle C to decrease all degrees to D−1, then add a maximum matching M in K_{D+2}\E(C) that leaves exactly one vertex unmatched (possible since D+2 is odd). The matched vertices return to degree D; the unmatched vertex w remains at D−1. The resulting H is connected (K_{D+2}\E(C) is 2‑connected) and simple.

Lemma G (Bridge forcing from any cylinder, ≤D and odd =D).
Let X be G_{•,≤D} with D≥2 or G_{•,=D} with odd D≥3, and let C(F) be a realized cylinder of radius r. There exists R>r and a realized cylinder C(F′)⊆C(F) such that every (G,ρ)∈C(F′) has a bridge.
Proof. Pick a boundary vertex u∈L_r(F) with deg_F(u)<D. In ≤D, embed H from Lemma E disjoint from B_r and attach it by a single edge e=uw; choose R so H⊂B_R and do not add any other edges from H to the rest. In =D (odd), do the same with H from Lemma F and locally add finitely many internal edges and vertices (all within B_R) to saturate every vertex in H to degree D after adding e and to keep all other vertices’ degrees ≤D (or exactly D in the regular case). In either case, inside B_R all vertices of H have total degree D, and H meets the rest only at e. Any completion respecting the degree constraints cannot add edges incident to H; hence e is a bridge in every completion. Leave at least one other boundary vertex with residual capacity to ensure C(F′)≠∅.

Lemma H (Only boundary vertices can connect outward without changing the r‑ball).
Let F=B_r(G,ρ). In any graph (H,σ) with B_r(H,σ)≅F, adding an edge from a vertex at distance <r to a new vertex decreases the distance of that new vertex to ≤r and hence changes the r‑ball. Thus, within a cylinder C(F), new edges to the outside can be attached only at boundary vertices L_r(F). Consequently, a component of F−e that contains no boundary vertex with residual degree cannot become infinite in any completion from C(F).

Theorem I (P_k nowhere dense; 2‑way bridges meagre and dense).
Fix D>2 and k∈N; let X be G_{•,≤D} or G_{•,=D}. For any realized cylinder C(F) with radius r≥k, define S={v∈L_r(F): deg_F(v)<D}. For each critical edge e at distance ≤k (both components of F−e meet S), enlarge F outside B_r by attaching, for selected a,b∈S on the two sides of e, new vertices x_a,x_b adjacent to a,b and connect all x_• along a simple cycle disjoint from B_r; set F′=B_{r+2} of the extension. By Lemma H, every such e lies on a cycle within B_{r+2}, hence cannot be a bridge in any completion from C(F′). Therefore C(F′)⊆C(F) and C(F′)∩P_k=∅; P_k is nowhere dense. Since P=⋃_k P_k, P is meagre. Density: from any cylinder, attach far outside a pair of disjoint infinite rays joined by a single edge and connect only one ray to the core by a long path, keeping degrees within bounds; this creates a 2‑way infinite bridge arbitrarily far out, showing P is dense.

Corollary J (Even‑regular comeagre bridgeless).
In G_{•,=D} with even D, any bridge is 2‑way infinite (degree‑sum parity). Hence the bridged set equals P and is meagre by Theorem I; its complement (bridgeless) is comeagre.

Theorem K (Bridgeless is nowhere dense under cylinder‑rich topologies for ≤D and odd =D).
Let τ be any topology on X where every τ‑open neighborhood of x contains some local cylinder C(B_r(x)). Then in (G_{•,≤D},τ) for D≥2, and in (G_{•,=D},τ) for odd D≥3, the set of bridgeless graphs is nowhere dense. Proof: Given a nonempty τ‑open U, pick x∈U and r with C(B_r(x))⊆U. Apply Lemma G inside C(B_r(x)) to obtain a refined cylinder C(F′)⊆U containing only graphs with a bridge. Thus U contains a τ‑open subset disjoint from the bridgeless set, so the latter is nowhere dense.