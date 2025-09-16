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