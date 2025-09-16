The round achieved a clear, rigorous extension of our catalogue. The core modeling convention (i→j iff W_ij≠0) is consistently used. The new results fall into two buckets: (i) graph-level uniform guarantees over all W,h (already settled as “⇔ DAG”), and (ii) per-instance guarantees uniform in h but for fixed W, organized via SCCs.

Soundness and value:
- Functional digraphs (outdegree ≤ 1): The equivalence “universally PNE-admitting (UPA) ⇔ every directed cycle has positive sign product” is correct. In a functional SCC each node has exactly one internal out-neighbor; if all directed cycles are positive, a path-product signature σ makes all internal arcs nonnegative, hence the SCC is unsigned and supermodular for any external field; necessity follows by the negative-cycle contradiction (h=0). Lifting to the whole graph via SCC composition yields a constructive PNE. Good addition beyond DAGs (still not a graph-only uniform guarantee, but a complete UPA classification within a natural family).
- 2-node SCC UPA classification (W_12·W_21≥0) is correct and its proof via switching to unsigned is clean. This forbids matching-pennies digons.
- Dominant negative directed cycle obstruction is correct and provides a robust nonexistence witness that tolerates extra neighbors (useful diagnostically). Dominant positive cycles yield two internal PNE; this is subsumed by the SCC structural-balance/gauge argument but still clarifies robustness margins.
- Structural balance in directed SCCs via cycle parity is stated correctly (∃σ with [σ]W[σ]≥0 iff every directed cycle has positive sign). The parity/BFS checker is appropriate.
- Forests with sign-symmetric digons are correctly handled via SCC composition (only singletons or 2-node sign-symmetric SCCs).

Caveats/clarifications:
- Be explicit that functional-digraph guarantees are per fixed W (uniform in h), not “graph-only” guarantees over all sign assignments. Within the functional class, necessity of positive cycles is only for uniform-in-h; a negative cycle can be offset by strong biases, but then the guarantee is not uniform.
- When asserting BR-reachability in unsigned games, cite I-path reachability and binary-action equivalence.

Next steps:
- Characterize UPA SCCs beyond undirected/structurally balanced/functional: candidates include exact/ordinal potential polymatrix blocks or classes switchable to monotone forms. Try to prove a dichotomy or provide counterexamples.
- Implement a polynomial checker: SCC decomposition; per-SCC tests for (a) symmetry, (b) structural balance (cycle parity), (c) functional with positive cycles; else attempt cohesive-core conditions. Provide pseudocode and complexity.
- Integrate dominance obstructions as negative certificates in the pipeline and quantify minimal margins.