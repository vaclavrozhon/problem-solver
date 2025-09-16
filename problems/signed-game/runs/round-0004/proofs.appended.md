# Rigorous Proofs



Definitions. Let G=(V,E,W) be a directed signed network with binary actions x_i∈{±1} and utilities u_i(x)=h_i x_i + x_i ∑_j W_{ij} x_j. The dependency arc i→j is present iff W_{ij}≠0, so u_i depends only on its out-neighbors.

Lemma 1 (Undirected ⇒ exact potential). If W is symmetric, the game is an exact potential game with Φ(x)=1/2∑_{i,j} W_{ij} x_i x_j + ∑_i h_i x_i. Hence a PNE exists.
Proof. If x,y differ only at i with y_i=−x_i, Φ(y)−Φ(x)=2(h_i+∑_j W_{ij}x_j)x_i = u_i(y)−u_i(x). Finite exact potential games admit PNE.

Lemma 2 (Unsigned ⇒ supermodular). If W_{ij}≥0 for all i,j, then for δ_i(x)=u_i(+1,x_{−i})−u_i(−1,x_{−i})=2h_i+2∑_j W_{ij}x_j and x≤y, δ_i(y)−δ_i(x)=2∑_j W_{ij}(y_j−x_j)≥0, so the game has increasing differences and admits a PNE.

Lemma 3 (Gauge transform and Nash correspondence). For σ∈{±1}^V, define [σ] diagonal, W^{[σ]}=[σ]W[σ], h^{[σ]}=[σ]h. Then u_i^{[σ]}(x)=u_i([σ]x). Consequently, y is a PNE in the [σ]-transformed game iff x=[σ]y is a PNE in the original game.
Proof. u_i^{[σ]}(x)=x_i(∑_j W^{[σ]}_{ij}x_j)+h^{[σ]}_i x_i = u_i([σ]x). Best-response sets transform via multiplication by σ_i.

Lemma 4 (Directed structural balance ⇔ unsigned via gauge). Suppose V admits a bipartition V=V_1⊔V_2 with W_{ij}≥0 for i,j in the same part and W_{ij}≤0 across parts. Let σ_i=+1 on V_1, σ_i=−1 on V_2. Then W^{[σ]}=[σ]W[σ] is entrywise nonnegative. Conversely, if ∃σ with W^{[σ]}≥0, the induced bipartition by σ has nonnegative within-part and nonpositive across-part weights.

Theorem 1 (DAGs guarantee PNE). If the dependency digraph is acyclic, then for any W,h the game admits a PNE; moreover a BR-path to it exists.
Proof. Let v_1,…,v_n be a topological order with i→j ⇒ i<j. For k=n,…,1, pick x_{v_k}∈argmax_{a∈{±1}} a(h_{v_k}+∑_{j>k}W_{v_k j}x_{v_j}). Each u_{v_k} depends only on x_{v_j} with j>k, which are already fixed, so x_{v_k} is a best response in the final profile. Updating players in order n,n−1,…,1 yields a BR-path to the constructed PNE.

Theorem 2 (SCC-wise composition). Let C_1,…,C_m be the strongly connected components (SCCs) of the dependency digraph ordered so edges go only from C_k to C_ℓ with k<ℓ. Suppose each induced subgame on C_k admits a PNE for every external field (equivalently here: each C_k is either undirected or structurally balanced). Then the full game admits a PNE; a BR-path exists.
Proof. Proceed by reverse topological order. For C_m (a sink SCC), utilities of i∈C_m depend only on x_{C_m} and h, so by the hypothesis on C_m there exists a PNE x^*_{C_m}. Suppose x^*_{C_{k+1}},…,x^*_{C_m} fixed. For i∈C_k, u_i(x)=x_i(∑_{j∈C_k}W_{ij}x_j) + x_i(h_i+∑_{j∉C_k}W_{ij}x^*_j). Treating f^{(k)}=h_{C_k}+W_{C_k,>k}x^*_{>k} as an external field, by the hypothesis on C_k there is a PNE x^*_{C_k}. Concatenate x^*=(x^*_{C_1},…,x^*_{C_m}). For i∈C_k, u_i depends only on x_{C_k} and on x in later SCCs, which are exactly those fixed when x^*_{C_k} was chosen; hence each i is best responding in x^*. A BR-path is obtained by concatenating BR-paths inside C_m,C_{m−1},…,C_1, holding later components fixed at each stage.

Corollary 2.1. If each SCC is undirected (exact potential) or structurally balanced (via Lemma 4 and Lemma 2), then the hypothesis of Theorem 2 holds, so a PNE exists and is BR-reachable.

Remark. The DAG case is the special case when all SCCs are singletons. Lemma 4 plus Lemma 3 ensures structurally balanced components remain PNE-admitting under arbitrary external fields.

Theorem 3 (Weight-dominance). If |h_i|>∑_j |W_{ij}| ∀i, then x_i=sgn(h_i) defines a strict PNE.
Proof. For any x_{−i}, the sign maximizing u_i is sgn(h_i+∑_j W_{ij} x_j)=sgn(h_i), because |∑_j W_{ij} x_j|<|h_i|. Hence each player has a unique best response equal to sgn(h_i).

Theorem (Uniform graph-level classification: PNE for all W,h iff DAG).
Let G=(V,E) be the dependency digraph (i→j iff W_{ij}≠0). The following are equivalent:
(i) For every weight matrix W with zero diagonal supported on E and every h∈ℝ^V, the SNC game u_i(x)=h_i x_i + x_i∑_j W_{ij} x_j admits a pure Nash equilibrium.
(ii) G is acyclic (a DAG).
Proof. (ii⇒i) Topologically order v_1,…,v_n so i→j implies i<j. Construct x by backward induction k=n,…,1, setting x_{v_k}∈argmax_{a∈{±1}} a(h_{v_k}+∑_{j>k}W_{v_k j}x_{v_j}). Each u_{v_k} depends only on already fixed out-neighbors, hence x is a PNE.
(i⇒ii) Suppose G has a directed cycle C=(i_1→…→i_k→i_1). Choose h=0 and set all off-cycle weights to 0. On C, choose nonzero W so that the product of edge signs ∏_{ℓ=1}^k sgn(W_{i_ℓ,i_{ℓ+1}}) = −1 (e.g., choose an odd number of negative edges). For any profile x, a best response at i_ℓ requires x_{i_ℓ}=sgn(W_{i_ℓ,i_{ℓ+1}}) x_{i_{ℓ+1}}. Any PNE would satisfy all k constraints, whose product yields x_{i_1}=(∏ sgn) x_{i_1}=−x_{i_1}, impossible. Hence there exist W,h with no PNE, contradicting (i). ∎

Proposition (Two-player UPA classification).
Let U={1,2} and consider the induced subgame with weights a=W_{12}, b=W_{21}. The subgame on U admits a PNE for every external field f∈ℝ^U iff ab≥0.
Proof. If ab≥0 and at least one of a,b is zero, one player’s utility is independent of the other’s action; the other has a linear term; a PNE exists for all f. If a,b>0, the 2-player game is supermodular (unsigned) and thus has a PNE for all f. If a,b<0, apply σ=(1,−1) to make both off-diagonals nonnegative; by gauge equivalence, the transformed unsigned game has a PNE for all f, and mapping back preserves PNE. Conversely, if ab<0, with f=(0,0) the subgame is the 2-player discoordination (matching pennies) and has no PNE. Hence UPA ⇔ ab≥0. ∎

Lemma (Single directed cycle is UPA iff positive sign product).
Let C=(1→2→…→k→1) with W_{i,i+1}≠0 on cycle edges and no other internal edges; external field f arbitrary. Then the restricted subgame on C admits a PNE for every f iff ∏_{i=1}^k sgn(W_{i,i+1})=+1.
Proof. If the product is −1, set f=0; best responses enforce x_i=sgn(W_{i,i+1})x_{i+1}, whose product implies x_1=−x_1, impossible. If the product is +1, choose σ with σ_iσ_{i+1}=sgn(W_{i,i+1}). Then [σ]W has W^{[σ]}_{i,i+1}=|W_{i,i+1}|≥0, so the transformed subgame is unsigned and supermodular; for any f^{[σ]}=[σ]f it admits a PNE. Mapping back via x=[σ]y preserves PNE. ∎

Theorem (Functional digraphs: UPA ⇔ all directed cycles are positive).
Assume outdegree ≤1 for all i. Let U be an SCC. If U is a singleton, the restricted subgame is trivially UPA. Otherwise U is a directed simple cycle. By the Lemma, the restricted subgame on U is UPA iff its cycle sign product is +1. For the whole graph, order SCCs in reverse topological order (condensation DAG). For sinks (cycles), pick a PNE for the restricted subgame (exists for all external fields). For predecessors, the external field induced by already fixed successors is constant; since each predecessor SCC is either a singleton (trivial) or a cycle with positive product (UPA), choose a PNE. Concatenation yields a global PNE; a BR-path is obtained by concatenating within-SCC BR-paths from sinks upwards. Conversely, if some directed cycle has negative sign product, set h=0 and restrict to that cycle; by the Lemma there is no PNE; thus the SCC (and the whole game) is not UPA. ∎

Lemma (Dominant negative directed cycle obstruction).
Let C=(i_1→…→i_L→i_1) with edge signs s_k=sgn(W_{i_k,i_{k+1}}) and product ∏ s_k=−1. Suppose for each k, |W_{i_k,i_{k+1}}| > |h_{i_k}| + ∑_{j≠i_{k+1}} |W_{i_k j}|. Then no PNE exists.
Proof. For any profile x, S_k=h_{i_k}+∑_j W_{i_k j}x_j has sign sgn(W_{i_k,i_{k+1}}x_{i_{k+1}}), hence best response enforces x_{i_k}=s_k x_{i_{k+1}}. Multiplying around C yields x_{i_1}=−x_{i_1}, a contradiction. ∎