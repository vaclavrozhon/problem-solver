Strong progress: both provers now converge on a local catalogue of maximal cliques in kG and supplied (mostly) correct tools to finish the classification. The shared-interior-edge (anchor) classification and the corrected maximality of N(t) are sound. The three-triangle lemma is correct and essential. The remaining gap was the “no edge-sharing” case; the intended resolution is right, but the written proofs need tightening.

Main fixes needed
- No-edge-sharing cliques: Prover 1’s Proposition 2 argument omits the critical case |f∩{a,b,c}|=0 and does not justify the |f∩{a,b,c}|=1 impossibility. You must treat both subcases rigorously. For |f∩{a,b,c}|=1, use the K4 obstruction (edge a–x_bc would create a K4 on {a,b,c,x_bc}). For |f∩{a,b,c}|=0, the only way to meet all three neighbors {f_ab,f_bc,f_ca} is f={u,v,w} (the three opposite vertices), which forces additional 3-cycles ubv, vcw, wau to be faces by Whitney, yielding a closed 2D component with empty boundary; impossible in a disk. Prover 2’s sketch (“must contain at least two of {a,b,c}”) is not generally valid and should be replaced by this case analysis.
- Clique number: Prover 1’s Corollary 4 should read ω(kG)=max{max_v |T(v)|, 4·1_{∃ fully interior face}}. Without a fully interior face, 4 need not be realized.
- Outerplanar remarks: The earlier claim that maximal outerplanar triangulations admit fully interior faces is false. In a maximal outerplanar triangulation, every bounded face has exactly one boundary edge, so no fully interior t exists; C(t)-type cliques do not occur there. Please retract and realign the outerplanar plan accordingly.

What is ready to formalize
- K4-freeness via the “closed component” argument.
- Link cycles; interior degree ≥ 4.
- Local Helly across an interior edge.
- Anchor-based classification when a shared interior edge is present: maximal cliques are T(u), T(v), or N(t) for one of the two uv-faces.
- Three-triangle lemma (neighbors of a fully interior face).
- No-edge-sharing classification with the corrected case analysis above.

Next steps
1) Insert the corrected no-edge-sharing proof and the precise ω(kG) formula into proofs.md; then state the final classification: every maximal clique of kG is T(v) or N(t). 2) Outerplanar case: with C(t) absent, kG’s maximal cliques are exactly the maximal vertex-stars. Model k(kG) as intersections of these stars; attempt an ear-removal induction or a tree-path intersection model to show k-nullness. 3) Begin explicit k^2G analysis using intersections among T(·) and N(·) (where present) and look for a decreasing potential toward completeness.
