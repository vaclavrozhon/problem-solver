Both provers advanced the structural picture and supplied several correct, rigorous local lemmas; however, there are still gaps and one substantive flaw to fix before we can claim a classification of maximal cliques in kG.

What is solid
- K4-freeness of the primal graph for disk Whitney triangulations is correct; use the “closed component” argument (four facial triangles on a K4 seal off a sphere-like 2-complex) rather than unbounded-face arguments. 
- Link-of-v is a chordless cycle; interior vertices have degree ≥ 4. 
- For interior v, T(v) is a clique and is maximal in kG (the chordless link bounds the number of T(v)-faces any external face can meet). 
- For a fully interior face t, N(t) forms a K4 in kG and is maximal (edge-saturation and K4-free arguments). 
- The “local Helly across an interior edge” lemma is correct and very useful: any face meeting both faces across an interior edge must contain one endpoint of the edge.

Issues to fix
- Prover 1’s Lemma 5 proof is flawed: from “f contains a” it does not follow that f must be f_ab or f_ac; any face through a intersects both f_ab and f_ac at a. The intended conclusion (S=N(t) under a two-edge configuration) is plausible but needs a corrected argument. 
- Prover 2’s Proposition 9 is on the right track but the proof needs a precise “anchor” argument: in the mixed case (both u- and v-faces present), every cross-pair must share w or x; this forces all u-faces to contain the same anchor (say w) and all v-faces the same anchor (also w), yielding C ⊆ {t,g,f_{uw},f_{vw}}, hence C=N(t) by maximality. Also correct the slip “N(g)=N(t)”: they are generally different; the conclusion should be “C=N(t) or C=N(g)”. 
- Full classification remains incomplete: cliques with no pair of faces sharing an edge have not been settled (a Helly-type statement is still conjectural).

Next steps (concrete)
1) Repair and formalize the “two-edge trigger” classification with the anchor proof (we appended a clean version to proofs.md). 2) Tackle the no-edge-sharing cliques: attempt a minimal-counterexample analysis around a face t of minimal boundary-edge count; or prove a Helly-type property for facial triangles in disk Whitney triangulations. 3) Outerplanar case: write the ear-removal induction carefully; track maximal cliques of kG via contiguous blocks S(v) in the dual tree; aim to show k(kG) is a forest. 4) Computational sweep for small instances (outerplanar and with interior degree 4/5) to test the conjectured classification and k-nullness bounds.