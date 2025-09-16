# Research Notes



Conjecture (Root‑invariance of smallness). For an unrooted property P and S_P={ (G,\rho) in G_{\bullet,D} : G has P }, does the nowhere‑dense/meagre status of S_P depend on root choices?

Agreed notions
- Saturated sets: S is saturated if (G,\rho) in S implies (G,u) in S for every vertex u of G. For unrooted P, S_P is saturated.
- Cylinders form a clopen base in the local topology, hence nowhere density can be witnessed by refining cylinders.

Key lemma (settled). If S is saturated, then cl(S) and Int(cl(S)) are saturated. Sketch: For (G,\rho) in cl(S) and u in V(G), for each t pick r≫dist(\rho,u)+t and (H_r,\sigma_r) in S with B_r matching at the root; transport the root to the image of u and use saturation to see (H_r,u_r) in S with B_t(H_r,u_r)≅B_t(G,u). Thus (G,u) in cl(S). Interior of a saturated set is saturated because open sets are unions of cylinders and re‑rooting preserves membership.

Consequence (nowhere density is root‑invariant). S is nowhere dense iff Int(cl(S))=\emptyset. For saturated S this condition is root‑free; applied to S_P it proves the ND half of the conjecture.

Caveat on quotients. Let π: G_{\bullet,D}→U_q be the quotient by forgetting the root. In general, π maps open cylinders to sets whose preimages are the saturations of those cylinders, which need not be open; π(C) need not be open. Thus arguments that rely on π being open are invalid. Any quotient‑based comparison must work with saturated open sets only, or with a selector on a comeagre domain.

Meagre part: current route and plan. Define Good_∞ (comeagre local rigidity): around the root and finitely many steps, distinct neighbors are eventually distinguishable. Using (degree‑preserving) markers, each Bad_{m,\ell} should be nowhere dense; this yields a comeagre domain on which countably many partial re‑rooting homeomorphisms generate all finite re‑rootings. Then: the saturation of a nowhere‑dense set is meagre (countable union of homeomorphic images of a nowhere‑dense set plus a meagre exceptional set). This would imply meagreness for many S_P constructed as saturations of root‑local nowhere‑dense witnesses. Completing this requires explicit marker gadgets in both Δ≤D and Δ= D (odd/even cases).

Open items
- Finish the Good_∞ construction with uniform markers in Δ= D and write the proof that each Bad_{m,\ell} is nowhere dense.
- Either produce a Borel/continuous selector on a comeagre domain (unique marked root) to compare meagreness between U_q and the rooted space, or construct a counterexample showing full meagre equivalence can fail without extra structure.
- Optional: record the metric off‑by‑one correction and the safe non‑emptiness criterion for cylinders (≤D is straightforward).