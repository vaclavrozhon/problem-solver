# Rigorous Proofs



Definitions. A subset S of G_{\bullet,D} is saturated if for every (G,\rho) in S and every vertex u of G, (G,u) is also in S.

Lemma 1 (closure and interior of saturated sets are saturated). Let S be saturated. Then cl(S) and Int(cl(S)) are saturated.
Proof. We first show cl(S) is saturated. Fix (G,\rho) in cl(S) and u in V(G). For each integer t≥0, choose r≥t+dist_G(\rho,u). By (G,\rho) in cl(S), there exists (H_r,\sigma_r) in S and a root‑preserving isomorphism \phi_r: B_r(G,\rho)→B_r(H_r,\sigma_r). Let u_r=\phi_r(u). Since S is saturated and (H_r,\sigma_r) in S, also (H_r,u_r) in S. Moreover, B_t(G,u)≅B_t(H_r,u_r) because t≤r−dist(\rho,u). Hence for every t there is an element of S whose t‑ball at the root matches B_t(G,u); thus (G,u) in cl(S). Therefore cl(S) is saturated.
For the interior, note that Int(cl(S)) is a union of open sets contained in cl(S), and re‑rooting preserves membership in cl(S) by the first part. Hence Int(cl(S)) is saturated. ∎

Theorem 2 (root‑invariance of nowhere density). Let P be any property of unrooted graphs and S_P={ (G,\rho) in G_{\bullet,D} : G has P }. Then S_P is nowhere dense in (G_{\bullet,D},d_\bullet) if and only if Int(cl(S_P))=\emptyset, and this condition is independent of the choice of root. In particular, whether S_P is nowhere dense does not depend on the root.
Proof. S_P is saturated. By Lemma 1, cl(S_P) and Int(cl(S_P)) are saturated. Since “nowhere dense” means Int(cl(S_P))=\emptyset, the statement is root‑invariant. ∎

Definitions. A subset S of G_{\bullet,D} is saturated if (G,\rho) in S implies (G,u) in S for all vertices u of G. For an r-ball F, the cylinder C(F):=G_{\bullet}^{F}={ (H,\sigma): B_r(H,\sigma)≅F }.

Lemma 1 (cylinders are clopen). For every finite rooted ball F, the cylinder C(F) is open and closed in (G_{\bullet,D},d_\bullet).
Proof. Openness: If (H,\sigma)\in C(F) with F an r-ball, then for any ε with 0<ε≤2^{-(r+1)} the ε-ball around (H,\sigma) equals C(F). Closedness: If (H,\sigma)\notin C(F), then B_r(H,\sigma) is some r-ball F'\not\cong F; hence (H,\sigma) lies in the open cylinder C(F'), and the complement of C(F) is the union of such cylinders. ∎

Lemma 2 (closure of saturated sets is saturated). If S⊆G_{\bullet,D} is saturated, then cl(S) is saturated.
Proof. Fix (G,\rho)\in cl(S) and u\in V(G). For t≥0, choose r≥t+dist_G(\rho,u). There exists (H_r,\sigma_r)\in S with B_r(H_r,\sigma_r)≅B_r(G,\rho). Transport u to u_r via this isomorphism. By saturation, (H_r,u_r)\in S, and B_t(H_r,u_r)≅B_t(G,u). Thus every neighborhood of (G,u) meets S, so (G,u)\in cl(S). ∎

Proposition 3 (root-free cylinder criterion for nowhere density). Let P be a property of unrooted graphs and S_P={ (G,\rho): G has P }. The following are equivalent:
(a) S_P is nowhere dense in G_{\bullet,D}.
(b) For every rooted r-ball F there exists an extension r′-ball F′ with C(F′)⊆C(F) and such that for every D-bounded connected graph H and vertex v with B_{r′}(H,v)≅F′, the unrooted graph H does not have P.
Proof. (a⇒b) Since cylinders form a clopen base (Lemma 1), nowhere denseness yields for each F a subcylinder C(F′)⊆C(F) disjoint from S_P. Any (H,v) with B_{r′}(H,v)≅F′ then lies outside S_P, hence H fails P. (b⇒a) If (b) holds, then each cylinder C(F) contains a subcylinder C(F′) disjoint from S_P, which is equivalent to S_P being nowhere dense. ∎

Theorem 4 (Root-invariance of nowhere density). Fix D≥2. For any unrooted property P, the set S_P={ (G,\rho) in G_{\bullet,D} : G has P } is nowhere dense in (G_{\bullet,D},d_\bullet) if and only if the root-free condition (b) in Proposition 3 holds. In particular, the nowhere-dense status of S_P is independent of root choices.
Proof. Immediate from Proposition 3. ∎