# Main Results

Theorem (Root-invariance of nowhere density). Fix D≥2. Let P be any property of unrooted graphs and let S_P={ (G,\rho) in G_{\bullet,D} : G has P }. Then S_P is nowhere dense in (G_{\bullet,D},d_\bullet) if and only if the following equivalent, root-free condition holds:
For every rooted r-ball F there exists an extension r′-ball F′ with G_{\bullet}^{F′}⊆G_{\bullet}^{F} such that for every D-bounded connected graph H and vertex v with B_{r′}(H,v)≅F′, the unrooted graph H does not have P.
In particular, whether S_P is nowhere dense does not depend on how graphs are rooted.

Proof. Cylinders G_{\bullet}^{F} form a clopen base of the local topology. If S_P is nowhere dense, then for each r-ball F there exists a subcylinder G_{\bullet}^{F′}⊆G_{\bullet}^{F} with G_{\bullet}^{F′}∩S_P=\emptyset. Hence any (H,v) whose r′-ball equals F′ lies outside S_P, so H fails P. Conversely, if such F′ exists for each F, then every nonempty cylinder contains a subcylinder disjoint from S_P, which is equivalent to S_P being nowhere dense. This criterion refers only to P and D, not to a chosen root, establishing root-invariance. ∎

Note. The meagre part of the conjecture remains open in full generality. A promising route proceeds via covering the re-root saturations of nowhere-dense sets by countably many homeomorphic images plus a small ambiguity set; proving that the ambiguity set is meagre (via degree-preserving marker gadgets) would settle meagre root-invariance for broad classes of properties.