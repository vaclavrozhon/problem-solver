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

Clarification: Nowhere-density root-invariance does not require that Int(cl(S)) be saturated. For an unrooted property P, S_P is saturated and the cylinder criterion yields a root-free formulation: S_P is nowhere dense iff for every rooted r-ball F there is an extension F′ such that every D-bounded connected graph containing a copy of F′ (at some vertex) fails P. This avoids any subtlety about interiors of closures.

Caveat on quotients: The forget-the-root quotient map π need not send cylinders to open sets in the quotient of the rooted topology; saturations of cylinders are typically not open. Thus arguments that rely on π being open (or category-preserving) are invalid. Work directly with the rooted clopen cylinder basis.

Meagre part plan update: Replace the previous “Bad_{m,ℓ} is nowhere dense” approach (false in general) by the Amb_k reduction: for nowhere-dense N, Sat_k(N) is covered by countably many homeomorphic images of N plus the ambiguity set Amb_k (points where some step of re-rooting is not uniquely determined). If we can show each Amb_k is meagre via intrinsic markers (degree-preserving gadgets in ≤D and =D), then Sat(N) is meagre. Action items: design explicit port/marker gadgets and prove the Amb_k meagreness. Also, fix parity/scope issues for regular even D (no bridges) in related theorems.