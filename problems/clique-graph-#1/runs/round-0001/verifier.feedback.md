Overall both provers made useful structural progress, but several claims need correction or fuller proofs.

What looks correct and ready to formalize
- K4 cannot occur in the underlying graph of a Whitney triangulation of the disk. Prover 1’s argument (a K4 would form a closed 2-manifold component with no boundary) is sound. Prover 2’s proof invoking the unbounded face is not robust for a disk; please switch to the “closed component” argument.
- In the disk case, every maximal clique of the primal graph is a facial triangle (since K4 is forbidden and every 3-cycle is a face). Hence kG is the intersection graph of the facial triangles (two faces adjacent iff they share a vertex). This should go to proofs.md.
- The link of an interior vertex is a chordless cycle. From this, interior degree ≥ 4 follows (deg 3 would force the neighbor triangle to be a face, contradicting that the three v-incident faces already subdivide its interior). Prover 2’s statement is right; please ground it in the link-of-v lemma.
- For an interior vertex v with deg(v) ≥ 4, T(v) is a clique and is maximal in kG. A clean proof uses: (i) the link cycle has no chords; (ii) any face f not containing v can include at most two consecutive neighbors of v, so it meets at most three consecutive faces in T(v); for deg ≥ 4 some face in T(v) is missed.
- For an interior face t whose three edges are interior, N(t) (t plus its three edge-neighbors) induces a K4 in kG and is maximal; the “third vertex” argument excluding further faces is sound.
- Special k-null classes are correct: fans (one interior vertex), two-face disks, and the “hexagon with a central interior triangle.” These can be cleanly proved.

What needs fixing or remains unproven
- Prover 1: the deg(v)=3 case in Lemma 2 is irrelevant in the disk (interior deg ≥ 4); please remove or explicitly restrict the statement to general surfaces. The “bounded non-star cliques” classification is only sketched; do not claim ω(kG)=max{max_deg_int,4} without a full proof. Provide a rigorous reduction proving any clique with no common vertex is contained in N(t) for some interior face t.
- Prover 2: the “local Helly” claim “two faces sharing an edge force the maximal clique to be a vertex-star” is false (counterexample: N(t) as in Lemma 3). So weaken it to: any face intersecting both of two faces that share an edge must contain one of the edge’s endpoints; this still helps.
- Outerplanar case: the program to prove k(kG) is a forest is promising but unproven; also, even if H is a forest, iterating k does not trivially collapse in ≤3 steps without a careful analysis (since k(H)=L(H), which may have triangles). Please formalize the ear-removal step and acyclicity preservation.

Next steps
1) Write full proofs for: link-of-v as a chordless cycle; T(v) maximal for interior v; N(t) maximal K4. 2) Prove the “non-star cliques” classification or produce a minimal counterexample. 3) Outerplanar case: complete the ear-removal induction and precisely track how maximal cliques of kG change. 4) Run exhaustive checks up to moderate size to guide conjectures and find any counterexamples to k-nullness.
