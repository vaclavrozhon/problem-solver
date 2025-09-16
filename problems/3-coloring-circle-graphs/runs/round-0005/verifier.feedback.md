Highlights and audits by prover:

Prover 1
- Canonical-state DP: The idea to quotient 3-colorings of a bag by S3 using a first-appearance renaming is standard and sound for plain 3-coloring (no fixed color names/lists). However, your closed form for the number of canonical states Q(t) is incorrect. The number of orbits equals S2(t,1)+S2(t,2)+S2(t,3) = (1/6)·3^t + 1/2, not (1/6)·3^t + (1/2)·2^t + 1/3. Please correct. With this, the asymptotic 6× reduction holds.
- Common-neighborhood test for adjacent chords: The necessity “N(x)∩N(y) must be independent” is correct. But the structural refinement is flawed: when x,y are adjacent and we split M into chords linking A1–A3 vs A2–A4 (four arcs around x,y), every chord from the first block intersects every chord from the second. Thus G[M] is independent iff at most one block is nonempty, and the nonempty block is inversion-free (monotone) in its permutation orders. Your monotonicity check per block alone is insufficient; it would incorrectly accept cases with both blocks nonempty. Please fix the statement and test.
- 2-SAT barrier: Your explanation that folding N(x)-component orientations into one 2-CNF forces 3-clauses via gated disjunctions is correct.

Prover 2
- New theorem “ply ≤ 3 implies 3-colorable” is correct and important. From the sweep path decomposition, pathwidth ≤ 2 implies treewidth ≤ 2 (partial 2-tree), hence χ ≤ 3. The constructive coloring via filling each bag to a clique and greedily coloring a perfect elimination order is valid and linear after sorting endpoints. Please add a clear proof (we include a fully rigorous version in proofs.md).
- Consolidation of DP, Helly clique bound, and bipartite-sides 2-SAT packaging is sound. Minor: present the DP bound uniformly as O(n·w·k^w) (your O(n·k^{w+1}) fits this up to constants).

Prover 3
- Exact side-extension criterion (exists independent Z so that H−Z is bipartite and list-2-colorable with lists {a,b}\S(y)) is correct and clean. It unifies previous sufficient conditions and justifies an FPT branching scheme in |Z| per side plus cc(N(x)).
- Proofs for bag-permutation, balanced separator, and degeneracy are correct and consistent with earlier notes. Good to keep examples clearly abstracted from the circle model where needed.

Next steps
- Correct P1’s Q(t) formula and the common-neighborhood test (add the “one block must be empty” condition). Integrate the canonical-state DP (plain 3-coloring) in code and measure speedup.
- Promote and implement the ply ≤ 3 theorem (fast 3-coloring), and keep the DP (lists/counting) and pivot+2-SAT pipeline; measure w and cc(N(x)).
- Combine the exact side-extension criterion with small-t branching and the bipartite-sides 2-SAT (t=0) to get a practical FPT variant parameterized by t+cc(N(x)).
- Explore two-pivot separators with N(x)∩N(y) permutation middle and four sides; attempt an orientation-plus-2-SAT composition.
- Hardness: continue gadget search within K4-free circle graphs.
