# Main Results



Theorem (Root‑invariance of nowhere density). Fix D≥2. Let P be any property of unrooted graphs and let S_P={ (G,\rho) in G_{\bullet,D} : G has P }. Then S_P is nowhere dense in (G_{\bullet,D},d_\bullet) if and only if Int(cl(S_P))=\emptyset, and this condition does not depend on the root: equivalently, whether S_P is nowhere dense is independent of how graphs are rooted.

Proof. S_P is saturated: if G has P, then (G,\rho) in S_P for every vertex \rho. For any saturated S, its closure cl(S) and interior Int(cl(S)) are also saturated: given (G,\rho) in cl(S) and any vertex u, for each radius t choose r≫dist(\rho,u)+t and (H_r,\sigma_r) in S whose r‑ball at the root matches that of (G,\rho); transport the root to the image of u to obtain (H_r,u_r) in S with B_t(H_r,u_r)≅B_t(G,u). Hence (G,u) in cl(S). It follows that Int(cl(S)) is saturated as well. Therefore the condition Int(cl(S_P))=\emptyset (the definition of “nowhere dense”) is root‑invariant. ∎

Discussion. This resolves the conjecture for nowhere density unconditionally in the rooted local topology: for any unrooted property P, the nowhere‑dense status of S_P is a root‑free notion. The meagre part of the conjecture requires additional structure (e.g., a comeagre domain of canonical re‑rootings or a category‑preserving selector) and is left for future work.