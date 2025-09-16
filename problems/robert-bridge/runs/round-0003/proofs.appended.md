# Rigorous Proofs



Definitions. A subset S of G_{\bullet,D} is saturated if for every (G,\rho) in S and every vertex u of G, (G,u) is also in S.

Lemma 1 (closure and interior of saturated sets are saturated). Let S be saturated. Then cl(S) and Int(cl(S)) are saturated.
Proof. We first show cl(S) is saturated. Fix (G,\rho) in cl(S) and u in V(G). For each integer t≥0, choose r≥t+dist_G(\rho,u). By (G,\rho) in cl(S), there exists (H_r,\sigma_r) in S and a root‑preserving isomorphism \phi_r: B_r(G,\rho)→B_r(H_r,\sigma_r). Let u_r=\phi_r(u). Since S is saturated and (H_r,\sigma_r) in S, also (H_r,u_r) in S. Moreover, B_t(G,u)≅B_t(H_r,u_r) because t≤r−dist(\rho,u). Hence for every t there is an element of S whose t‑ball at the root matches B_t(G,u); thus (G,u) in cl(S). Therefore cl(S) is saturated.
For the interior, note that Int(cl(S)) is a union of open sets contained in cl(S), and re‑rooting preserves membership in cl(S) by the first part. Hence Int(cl(S)) is saturated. ∎

Theorem 2 (root‑invariance of nowhere density). Let P be any property of unrooted graphs and S_P={ (G,\rho) in G_{\bullet,D} : G has P }. Then S_P is nowhere dense in (G_{\bullet,D},d_\bullet) if and only if Int(cl(S_P))=\emptyset, and this condition is independent of the choice of root. In particular, whether S_P is nowhere dense does not depend on the root.
Proof. S_P is saturated. By Lemma 1, cl(S_P) and Int(cl(S_P)) are saturated. Since “nowhere dense” means Int(cl(S_P))=\emptyset, the statement is root‑invariant. ∎