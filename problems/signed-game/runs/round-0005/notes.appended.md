# Research Notes



Added identified PNE-guaranteeing graph classes for signed network coordination (SNC) games (binary actions):

- Undirected graphs (W symmetric): exact potential → PNE exist; a BR-stable subset exists (per paper).
- Unsigned graphs (W≥0): supermodular → PNE exist; global I-reachability implies BR-reachability in binary.
- Structurally balanced directed graphs: ∃σ with [σ]W[σ]≥0 (definition here: bipartition V=V1⊔V2 with W_ij≥0 within parts and ≤0 across). Gauge to unsigned → supermodular → PNE exist.
- DAG dependency digraphs (i→j iff W_ij≠0): backward induction from sinks constructs a PNE; BR-path mimics the order.
- SCC composition: If every SCC is “universally PNE-admitting under arbitrary external fields” (e.g., undirected or structurally balanced), then the whole game has a PNE; construct by solving SCCs in reverse topological order.
- Cohesive cores (from paper): If R is unsigned (or structurally balanced after a signature τ) and satisfies w_i^R + a h_i ≥ w_i^S (or w_i^R + τ_i h_i ≥ w_i^S), and the S-subgame (with R frozen) has a PNE (e.g., S undirected or structurally balanced), then a global PNE exists with x_R fixed (consensus/polarization).
- Weight-dominance: If |h_i|>∑_j|W_ij| ∀i, then x=sgn(h) is a strict PNE.

Counterexamples: 2-node discoordination (W_12>0, W_21<0) and the directed 3-cycle with all negative arcs both lack PNE.

Key modeling convention: dependency arc i→j iff W_ij≠0 so u_i depends only on its out-neighbors. Structural balance is taken in this directed sense; σ_i=+1 on one part, −1 on the other yields [σ]W[σ]≥0.

Open directions: characterize SCCs that are universally PNE-admitting beyond undirected/structurally-balanced; design a polynomial-time checker; develop end-to-end algorithm: detect DAG, else SCC-decompose, test each SCC, construct PNE by reverse topological order; integrate cohesive-core criteria when some SCCs fail the universal property.

New main guarantee and subclasses

- Graph-level (uniform) guarantee: A dependency digraph guarantees a PNE for all weight matrices W (zero diagonal, supported on E) and all biases h iff it is a DAG. Necessity: any directed cycle can be given edge signs with product −1 and h=0 to force contradictory BR constraints and destroy PNE; sufficiency: backward induction.
- SCC composition remains the core construction: if each SCC is universally PNE-admitting (UPA) for arbitrary external fields (e.g., undirected or structurally balanced in the directed sense ∃σ with [σ]W[σ]≥0), then a global PNE exists with a BR-path by reverse topological order.
- Two-player UPA classification: a 2-node SCC is UPA iff W_{12} and W_{21} have the same sign (including zeros). This forbids “matching-pennies digons.”
- Diagnostic cycle criteria: (i) Dominant negative directed cycle (each edge weight exceeds all other influences at its tail) ⇒ no PNE. (ii) Dominant positive directed cycle ⇒ exactly two internal PNE on that cycle, independent of external fields.
- Additional subclasses covered by SCC composition: (a) Forest underlying undirected graph with sign-symmetric digons (only SCCs are singletons or sign-symmetric digons) ⇒ PNE. (b) Functional digraphs (outdegree ≤1) with all directed cycles sign-positive ⇒ PNE for all h; necessity within this class: a negative cycle obstructs PNE at h=0.

Algorithmic pipeline (draft): (1) If DAG, construct PNE by backward pass. (2) Else, decompose into SCCs; per SCC check symmetry or structural balance (cycle-parity after switching). If all pass ⇒ construct by reverse order. (3) Otherwise, test functional/forest subclasses or use cohesive-core conditions; otherwise, report obstructions (e.g., dominant negative cycles).

Additions to PNE-guaranteeing classes and diagnostics (binary SNC games, i→j iff W_ij≠0)

- Functional digraphs (outdegree ≤ 1): An SCC is universally PNE-admitting (UPA) for all external fields iff every directed cycle has positive sign (product of edge signs +1). Proof: path-product signature σ makes internal arcs nonnegative; unsigned subgame ⇒ supermodular ⇒ PNE for all fields; negative cycle yields a contradiction at h=0. Whole-graph existence follows by SCC composition. Note: uniform in h for fixed W; not a graph-only guarantee over all W.
- Two-node SCCs: UPA ⇔ W_{12}W_{21}≥0 (forbids matching-pennies digons). Switch to unsigned via σ when both are negative.
- Forests with sign-symmetric digons: Only SCCs are singletons/sign-symmetric digons, hence UPA; SCC composition yields a PNE.
- Directed structural balance (SCC): ∃σ with [σ]W_{UU}[σ]≥0 iff every directed cycle in U has positive sign; checkable in O(|U|+|E|) by parity labeling.
- Dominant negative directed cycles: If on a directed cycle each edge weight exceeds the sum of all other influences at its tail and the cycle sign product is −1, then no PNE (robust obstruction). Dominant positive cycles force two internal PNE.

Pipeline (updated): (1) If DAG ⇒ build PNE by backward pass. (2) Else SCC-decompose. For each SCC U: test symmetry (exact potential) or structural balance (parity via switching); if functional, test positive cycles; if all SCCs are UPA ⇒ construct PNE by reverse topological order. Otherwise, attempt cohesive-core criteria or report obstructions (e.g., dominant negative cycles).

New modules added

- Multi-core cohesive existence: Partition V=R^1⊔⋯⊔R^m⊔S. For each block R^t, assume there exists τ^{(t)} with G_{R^t}^{[τ^{(t)}]} unsigned and the cohesiveness inequalities w_i^{R^t}+τ_i^{(t)}h_i ≥ w_i^{V\R^t} for all i∈R^t. If the S-restricted game with R frozen at τ_R admits a PNE, then the full game has a PNE with x_{R^t}=τ^{(t)} for all t. Proof by global gauge [σ] fixing each R^t to +1; within blocks W^{[σ]}≥0 and Δ_i ≥ 2(h_i^{[σ]}+w_i^{R^t} − w_i^{V\R^t}) ≥ 0.

- Monotone bounded-length BR paths in unsigned components: Starting from −1_U, flipping any i with positive marginal yields a monotone BR path of length ≤|U| to a PNE. Under SCC composition after gauging each SCC to unsigned, a BR path to a global PNE has length ≤∑_k |U_k|.

- Forests with sign-symmetric digons: Underlying undirected forest and every digon {i,j} has sgn(W_{ij})=sgn(W_{ji}). Then SCCs are singletons or 2-node symmetric digons (UPA), so a PNE exists for all h by SCC composition.

- Structural balance (directed SCC): ∃σ with [σ]W_{UU}[σ]≥0 iff every directed cycle in U has positive sign; linear-time parity labeling.

- Dominant negative cycles: If on a directed cycle C each main edge dominates (|W_{i s(i)}| greater than the sum of other outgoing magnitudes and |h_i|) and the cycle sign product is −1, then no PNE (robust nonexistence certificate).

Notes: Functional/SCC UPA results are uniform in h for fixed W. Counting of PNE on functional cycles is exact (two) when all nodes are strictly responsive (|h_i|<|w_i|); with ties, treat counts as lower bounds; existence still holds.