Asymptotic comparison between MST_log and Reg_log

Setup. Fix an integer n≥2 and a permutation π∈S_n. Let P_π={p_i=(i,π(i)) : i=1,…,n}⊂R^2. Fix a norm ||·|| on R^2 and a logarithm base (changing either only rescales constants). For u,v∈P_π define the edge weight w(u,v)=log(1+||u−v||). Let MST_log^{||·||}(π) be the total w-weight of a minimum spanning tree on P_π.

For i≥2 define
- Δ_i := |π(i)−π(i−1)|,
- t_i := min{i−j : 1≤j<i and |π(i)−π(j)|=1}, with t_i := i−1 if no such j exists,
- d_i := 1 + #{ k<i : min(π(i−1),π(i)) < π(k) < max(π(i−1),π(i)) },
- r_i := min{ d_i + t_i, i }.
Set Reg_log(π) := ∑_{i=2}^n log(1+r_i). Note that for all i≥2, d_i≥1 and t_i≥1, hence r_i≥2 and log(1+r_i)≥log 3.

We write MST_log(π) for the L∞ case (||·||=||·||_∞). The main results resolve the dominance questions up to optimal Θ(log n) factors.

Theorem 1 (Exact one-sided domination in L∞). For all permutations π,
MST_log(π) ≤ Reg_log(π).

Proof. For t≥0, let G(t) be the graph on P_π with an edge {u,v} whenever ||u−v||_∞ ≤ t, and let κ(t) be its number of connected components. For an MST whose L∞-edge lengths are {ℓ_e}, the layer-cake identity and Kruskal’s algorithm give
MST_log(π) = ∑_e log(1+ℓ_e) = ∫_0^∞ #(e:ℓ_e>t) dt/(1+t) = ∫_0^∞ (κ(t)−1) dt/(1+t).
(The last equality holds for all t except ties, which form a measure-zero set.)
We upper bound κ(t) via a sparse subgraph H(t). Process i=2,…,n and add to H(t):
- the time edge (i−1,i) if Δ_i ≤ t;
- the value-neighbor edge (i,j), where j<i is the largest index with |π(i)−π(j)|=1, if t_i ≤ t.
Each added edge has L∞-length ≤ t (time: ||p_i−p_{i−1}||_∞=max{1,Δ_i}; value: ||p_i−p_j||_∞=max{1,t_i}). Hence H(t)⊆G(t), so κ(t)≤κ_H(t). Expose vertices in increasing i. When i arrives, κ_H increases by 1 (for the new vertex) and decreases by 1 if at least one of the two edges is present (the vertex attaches to previous vertices), and possibly decreases further if both are present (merging two components). Thus the component count fails to drop back by 1 only if both edges are absent, i.e., if Δ_i>t and t_i>t. Starting from κ_H(1)=1 we obtain
κ(t) ≤ κ_H(t) ≤ 1 + |{ i∈{2,…,n} : Δ_i>t and t_i>t }|.
Integrating,
MST_log(π) ≤ ∫_0^∞ ∑_{i=2}^n 1[Δ_i>t and t_i>t] dt/(1+t) = ∑_{i=2}^n log(1+min{Δ_i,t_i}).
Finally, since r_i=min{d_i+t_i,i} and t_i≤i−1, we have r_i≥t_i. Hence log(1+min{Δ_i,t_i}) ≤ log(1+t_i) ≤ log(1+r_i). Summing over i gives MST_log(π) ≤ Reg_log(π).
∎

Corollary 2 (Domination for any norm; explicit constant). Let b:=sup_{||z||_∞=1} ||z|| ∈ [1,∞). Then for all π,
MST_log^{||·||}(π) ≤ (1 + (log b)/log 3) · Reg_log(π).

Proof. Let T_∞ be an L∞-MST. For any edge e, 1+||e|| ≤ b(1+||e||_∞), so log(1+||e||) ≤ log b + log(1+||e||_∞). Summing over the n−1 edges of T_∞,
MST_log^{||·||}(π) ≤ (n−1)·log b + MST_log(π) ≤ (n−1)·log b + Reg_log(π).
Since Reg_log(π) ≥ (n−1)·log 3, the additive term is absorbed to yield the stated factor. For L_p in R^2 one has b=2^{1/p}, giving MST_log^{(p)}(π) ≤ (1 + (log 2)/(p·log 3))·Reg_log(π).
∎

Theorem 3 (Universal logarithmic reverse bound). For any fixed norm ||·|| there exists c>0 such that for all π and n,
Reg_log(π) ≤ (log(1+n)/c) · MST_log^{||·||}(π).

Proof. In a permutation grid, any two distinct points have both coordinate gaps ≥1. Thus every spanning-tree edge has length at least α and weight at least c:=log(1+α), with α=1,√2,2 respectively in L∞, L2, L1. More generally, by norm equivalence there is α>0 with ||z|| ≥ α||z||_∞, hence every edge length is ≥α. Therefore MST_log^{||·||}(π) ≥ (n−1)·c. On the other hand r_i≤i implies Reg_log(π) ≤ ∑_{i=2}^n log(1+i) ≤ (n−1)·log(1+n). Dividing yields the claim.
∎

Theorem 4 (Separation; no reverse constant). There is no universal C with Reg_log(π) ≤ C·MST_log^{||·||}(π) for all π. In fact, for any fixed norm, there exist permutations with Reg_log/MST_log = Θ(log n).

Proof. Take the parity-block permutation for even n: list all even values in increasing order, then all odd values in increasing order; i.e., π(i)=2i for 1≤i≤n/2 and π(i)=2(i−n/2)−1 for i>n/2.
MST_log^{||·||}(π)=Θ(n): within each half, the time edges (i−1,i) have constant length, contributing Θ(n); one bridge connects the halves, costing O(log n). A matching Ω(n) lower bound holds since every MST has n−1 edges of weight ≥c>0 (Theorem 3), so MST_log^{||·||}(π)=Θ(n).
Reg_log(π)=Θ(n log n): in the first half (even block), no odd has appeared, so for 2≤i≤n/2 one has t_i=i−1 and d_i=1, hence r_i=i and ∑_{i=2}^{n/2} log(1+r_i)=Θ((n/2)·log n). In the second half (odd block), the nearest value-neighbor lies in the first half at temporal distance t_i=n/2 for all but the first odd, and d_i=2 (the unique even between consecutive odds has appeared), hence r_i=Θ(n) for almost all i, contributing Θ(log n) each; the first odd has r_i=Θ(n) as well. Thus the odd block contributes Θ((n/2)·log n). Summing gives Reg_log(π)=Θ(n log n). Therefore Reg_log/MST_log=Θ(log n).
∎

Consequences. Theorems 1–4 resolve the dominance questions:
- Reg dominates MST: MST_log(π) ≤ Reg_log(π) in L∞, and MST_log^{||·||}(π) ≤ (1 + (log b)/log 3)·Reg_log(π) for any fixed norm.
- MST does not dominate Reg by a constant: there are permutations with Reg_log/MST_log = Θ(log n).
- Universal upper bound: for all π, Reg_log(π) ≤ (log(1+n)/c)·MST_log^{||·||}(π).
Hence the worst-case gap is Θ(log n) and this is optimal. All constants depend only on the norm and the log base.