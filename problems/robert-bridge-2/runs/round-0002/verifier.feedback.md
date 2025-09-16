High-level: Good progress toward a robust invariance statement. The key correction is to replace all pendant-leaf arguments by a sealed finite component (“saturated bubble”) that forces a single-edge cut in every completion. Within any topology whose open neighborhoods contain local cylinders (your “strongly local/cylinder‑rich” class), this yields nowhere‑denseness of “bridgeless” in ≤D and in =D for odd D. However, several claims still need fixes, and one topological monotonicity statement is false.

Critical corrections
- Pendant leaf does not force a bridge: an extension may add edges at the leaf. Use a finite sealed set S contained in a ball: saturate every vertex of S to degree D within the ball, and create exactly one edge e from S to its complement within the ball. Then no completion can add edges at S, so e remains a bridge. In =D (odd), ensure all vertices of S have total degree D in the ball.
- Parity in even D: P1’s internal lump T with degrees (D,…,D,D−1) is impossible for even D (odd degree sum). Fix by allowing some S–(ball\S) adjacencies inside the ball and including those endpoints into S, then sealing all of S; or restrict to odd D in the regular case. The ≤D case can still be handled by sealing S via edges to vertices inside the ball while ensuring all S vertices have global degree D in the ball.
- Refinement monotonicity (P2 Prop. 2) is false in general. Replace with a cylinder‑rich hypothesis: every open neighborhood contains a local cylinder. Then the forcing works uniformly in such topologies.
- Even‑regular case: do not rely on the abstract’s Theorem 16 without proof. We provide a complete construction showing that “has a 2‑way infinite bridge at distance ≤k” is nowhere dense for every k, hence the union is meagre. Combined with the parity lemma (no 1‑way bridges for even D), this yields that bridgeless is comeagre for even D under the local topology.

What is solid now
- A clean lemma: in any cylinder‑rich topology, once a property’s complement can be forced by a cylinder refinement, that property is nowhere dense. The saturated‑bubble forcing is valid for ≤D and =D (odd).
- A full proof that 2‑way infinite bridges form a dense meagre set (hence not nowhere dense) for D>2 in both ≤D and =D.

Next steps
- Formalize the cylinder‑rich/strongly‑local class; list standard metrics (weighted local, edit‑on‑balls, FO‑local) that belong to it and verify Baire/Polish status.
- Explicitly construct D‑regular infinite completions realizing the refined ball in the odd‑regular forcing; include a short lemma ensuring existence.
- Replace any use of refinement‑monotonicity by the cylinder‑rich argument. If exploring metrics that are not cylinder‑rich (end‑aware), first prove they are Baire/Polish, then analyze density of no‑1‑edge‑cut constraints.
