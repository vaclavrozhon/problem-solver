Overall: Good structural progress on the disc case, but there are key gaps and one concrete error. The maximal-outerplanar subclass is handled well (Prover 2), while the general disc program (Prover 1) needs a rigorous Helly-type statement to go through. I recommend consolidating the correct degree formula (with boundary) and promoting the outerplanar k^2-structure result to our proofs. Next, focus on formalizing the “maximal cliques in kG are vertex-stars” claim in the general disc case (or isolating precisely where it fails), and on a monotone potential under k^2.

Specific issues:
- Prover 1 Lemma 3 (degree formula) is incorrect on discs with boundary. Counting triangles through a boundary vertex equals deg(v)−1, not deg(v). The correct formula (Prover 2) is deg_k(f)=deg(a)+deg(b)+deg(c)−6−B(f)+Eb(f), where B(f) is the number of boundary vertices of f and Eb(f) the number of boundary edges of f. Minimal counterexample: the square-with-diagonal (two triangles). For a boundary triangle with two boundary edges, the incorrect formula gives 4 instead of the correct 1.
- Prover 1 Proposition 5: the second bullet (every pairwise-intersecting family of facial triangles lies in a single T(v)) is only sketched. The edge-sharing case argument is on the right track (and correctly observes that introducing a third triangle on the remaining two vertices forces a K4). However, a complete case analysis (including the vertex-only intersections) is needed; as written, it is not yet usable.
- Prover 2 Lemma 7: identity (1) should read Σ_f deg_k(f)=Σ_v deg(v)^2 − 6F (not −3F). The average-degree bound (2) is nevertheless correct as stated.
- Prover 2 Corollary 5 (zig-zag triangulations collapse to K1 in ≤3 steps) is not justified and is likely false for long zig-zags: by Proposition 4, k^2(D) can be a long path, whose clique graph reduces length by one per iteration, not necessarily to K1 in one further step.

What is solid:
- K4 cannot occur in a Whitney triangulation of the disc; hence maximal cliques of G are facial triangles.
- The boundary-aware degree formula (Prover 2) is correct.
- For maximal outerplanar discs: the Helly property for maximal cliques implies the maximal cliques of k(D) are exactly P_v, and k^2(D)≅D[S] with S={v:deg(v)≥3}.

Next steps:
1) Prover 1: Replace Lemma 3 by the corrected boundary-aware formula; write a complete proof of the “pairwise-intersecting implies common vertex” claim for families of facial triangles in Whitney disc triangulations (or produce a minimal counterexample). If true, this pins down maximal cliques of k(G) as stars T(v).
2) Prover 2: Formalize that for maximal outerplanar D, iterating G↦k^2(G)=D[S] strictly reduces a simple invariant (e.g., number of degree-2 vertices removed) and terminates at K3, proving k-nullness for all maximal outerplanar discs. Drop or prove the zig-zag corollary.
3) Joint: Explore a two-step invariant Φ(G)=|{distinct stars T(v)}| for general discs; attempt to show Φ(k^2G)<Φ(G) unless Φ=1.
4) Computation: enumerate small disc triangulations to test the Φ-decrease and to look for counterexamples to the “stars are all maximal cliques of k(G)” claim.
