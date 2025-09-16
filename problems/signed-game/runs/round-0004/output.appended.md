# Main Results



Main Results

We identify graph classes for which every signed network coordination game with binary actions x_i∈{±1} and utilities u_i(x)=h_i x_i + x_i∑_j W_{ij}x_j admits a pure Nash equilibrium (PNE). The dependency arc i→j is present iff W_{ij}≠0, so u_i depends only on its out-neighbors.

1) Directed acyclic dependency graphs (DAGs)
Theorem (DAG ⇒ PNE). If the dependency digraph is acyclic, then for any real weights W and bias vector h, the game admits a PNE. Moreover, a best-response (BR) path to it exists.
Proof. Take a topological order v_1,…,v_n with i→j ⇒ i<j. Construct x by backward induction: for k=n,…,1 pick x_{v_k}∈argmax_{a∈{±1}} a(h_{v_k}+∑_{j>k}W_{v_k j}x_{v_j}). Because u_{v_k} depends only on out-neighbors v_j with j>k (already fixed), x_{v_k} is a best response in the final profile. Updating players in order n,n−1,…,1 yields a BR-path to this PNE.

2) SCC-wise composition under per-component PNE admissibility
Definition (Universally PNE-admitting component). An induced subgame on U⊆V is universally PNE-admitting if for every external field f∈ℝ^U the game with utilities u_i(y)=y_i(∑_{j∈U}W_{ij}y_j+f_i) admits a PNE.
Examples. (a) Undirected W_{ij}=W_{ji} on U: exact potential ⇒ PNE for all f. (b) Structurally balanced on U: ∃σ_U with [σ_U]W_{UU}[σ_U]≥0; after y↦[σ_U]y the game is unsigned (supermodular) ⇒ PNE for all f; mapping back preserves PNE.

Theorem (SCC composition ⇒ PNE). Let C_1,…,C_m be the SCCs of the dependency digraph ordered so edges go only from C_k to C_ℓ with k<ℓ. If each induced subgame on C_k is universally PNE-admitting (e.g., undirected or structurally balanced), then for any W,h the full game admits a PNE. A BR-path exists.
Proof. Process SCCs in reverse topological order. For the sink C_m, u_i depends only on x_{C_m} and h, so pick a PNE x^*_{C_m}. Suppose x^*_{C_{k+1}},…,x^*_{C_m} are fixed. For i∈C_k, u_i(x)=x_i(∑_{j∈C_k}W_{ij}x_j)+x_i(h_i+∑_{j∉C_k}W_{ij}x^*_j). Treat f^{(k)}=h_{C_k}+W_{C_k,>k}x^*_{>k} as an external field. By the hypothesis on C_k, choose a PNE x^*_{C_k}. The concatenation x^*=(x^*_{C_1},…,x^*_{C_m}) is a PNE since each i∈C_k depends only on x_{C_k} and later components (fixed when x^*_{C_k} was chosen). Concatenating BR-paths inside C_m,C_{m−1},…,C_1 yields a global BR-path.

Discussion and relevance
- The DAG result is a clean, graph-theoretic guarantee that covers arbitrary signs and weights.
- The SCC composition theorem modularizes PNE existence: it suffices to certify each SCC as universally PNE-admitting (e.g., undirected or structurally balanced). This strictly includes DAGs (all SCCs are singletons) and globally undirected/structurally balanced graphs as special cases, and provides a constructive method to build a PNE by solving SCCs from sinks upward.

3) Graph-level classification (uniform guarantee)
Theorem (Uniform guarantee ⇔ DAG). A dependency digraph guarantees a PNE for every real weight matrix W (zero diagonal, supported on the digraph) and every bias vector h∈ℝ^V if and only if it is acyclic (a DAG).
Proof. If acyclic, a PNE exists by backward induction along a topological order (item 1). Conversely, if there is a directed cycle C, choose h=0 and put nonzero weights only on C with an odd number of negative signs so that the product of edge signs is −1. Then the best-response constraints along C force x_i = s_i x_{succ(i)} with ∏ s_i = −1, which is inconsistent, so no PNE exists. Hence only DAGs provide a uniform guarantee over all W,h.

4) Functional digraphs (outdegree ≤ 1)
Theorem (UPA ⇔ all directed cycles positive). Suppose each vertex has outdegree ≤1. Decompose the graph into SCCs; each SCC is either a singleton or a directed simple cycle. The game admits a PNE for every bias vector h (uniform in h) if and only if every directed cycle C has positive sign product ∏_{(i→j)∈C} sgn(W_{ij})=+1. A best-response path to a PNE exists.
Proof. For a cycle C, if the sign product is +1, there exists a signature σ with [σ]W[σ] nonnegative on C, so the restricted subgame on C is unsigned (supermodular) and admits a PNE for any external field; if the product is −1, with h=0 the best-response constraints around C are inconsistent, so no PNE exists. Singletons are trivial. Process SCCs in reverse topological order: choose a PNE for each sink cycle, then for upstream singletons set their action as a best response to their unique successor. Concatenation yields a global PNE; concatenating within-SCC BR-paths gives a BR-path in the full game.