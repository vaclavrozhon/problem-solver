# Rigorous Proofs



Theorem 1 (One-sided domination).
For the L∞ norm on R^2 and any permutation π, MST_log(π) ≤ Reg_log(π). For any fixed norm N, there exists a universal constant C_N such that MST_log^N(π) ≤ C_N·Reg_log(π) for all π.

Proof.
1) Kruskal integral identity for log weights. Let d(u,v) be the L∞ distance. For t≥0 let G(t) be the graph on P_π with edges {u,v} whenever d(u,v) ≤ t, and let κ(t) be the number of connected components of G(t). Let ℓ_1≤⋯≤ℓ_{n−1} be the L∞-lengths of the MST edges. Since log(1+x)=∫_0^x dt/(1+t),
∑_{j=1}^{n−1} log(1+ℓ_j) = ∫_0^∞ m(t) dt/(1+t), where m(t)=|{j: ℓ_j ≥ t}|.
By Kruskal’s algorithm, m(t) = κ(t) − 1. Hence
MST_log(L∞) = ∫_0^∞ (κ(t)−1) dt/(1+t).

2) A sparse super-bound on κ(t). Process points in time order i=1,…,n and build a graph H(t) by adding (to earlier vertices only):
- the time edge {i−1,i} if Δ_i := |π(i)−π(i−1)| ≤ t;
- the value-neighbor edge {j,i} where j<i achieves t_i:=min{i−j: |π(i)−π(j)|=1}, if t_i ≤ t (if no such j exists, we skip this edge).
Every inserted edge has L∞-length ≤ t, so H(t) is a subgraph of G(t), and κ(t) ≤ κ_H(t). Moreover, when adding p_i, if both Δ_i>t and t_i>t then no edge is added from p_i to the existing graph and the number of components increases by at most 1; otherwise p_i attaches (possibly merging components). Therefore κ_H(t) ≤ 1 + |{i≥2: Δ_i>t and t_i>t}|.
Combining with (1),
MST_log(L∞) ≤ ∫_0^∞ |{i≥2: Δ_i>t and t_i>t}| dt/(1+t)
= ∑_{i=2}^n ∫_0^{min(Δ_i,t_i)} dt/(1+t)
= ∑_{i=2}^n log(1+min(Δ_i,t_i)).
Since r_i := min(d_i+t_i, i) ≥ t_i, we get
MST_log(L∞) ≤ ∑_{i=2}^n log(1+r_i) = Reg_log(π).

3) Norm lifting. For any norm N there is b_N>0 with ||z||_N ≤ b_N||z||_∞. For any spanning tree T,
∑_{e∈T} log(1+||e||_N) ≤ ∑_{e∈T} log(1+b_N||e||_∞) ≤ (n−1)log(1+b_N) + ∑_{e∈T} log(1+||e||_∞).
Choose T to be an L∞-MST and apply the L∞ bound:
MST_log^N(π) ≤ (n−1)log(1+b_N) + MST_log(L∞) ≤ (n−1)log(1+b_N) + Reg_log(π).
Since r_i ≥ 2 for all i≥2, Reg_log(π) ≥ (n−1)·log 3. Thus
MST_log^N(π) ≤ (1 + log(1+b_N)/log 3) · Reg_log(π) =: C_N·Reg_log(π).
This proves Theorem 1. ∎

Theorem 2 (Separation; no reverse domination).
There is no universal C>0 such that Reg_log(π) ≤ C·MST_log(π) for all π. In fact, there is a family with Reg_log/MST_log = Θ(log n).

Proof.
Fix an integer m≥2 and, for each n, order the values by residue classes modulo m: list all numbers congruent to 1 mod m in increasing order, then 2 mod m, …, then m mod m. Let m_r be the size of class r (m_r = ⌊(n−r)/m⌋+1 or ⌈n/m⌉; in any case m_r = Θ(n/m)).

MST upper bound (L∞). Within each residue class r, connect consecutive indices inside that block: each such edge has L∞-length m, hence weight log(1+m). Summed over all classes this contributes (n−m)·log(1+m). Add m−1 “bridging” edges to connect the m blocks arbitrarily; each has length O(n) and weight O(log n). Therefore MST_log(π) ≤ (n−m)·log(1+m) + O(m log n) = Θ(n) for fixed m. A matching lower bound Ω(n) holds because every edge in L∞ has length ≥1, so every tree edge costs at least log 2; hence MST_log(π) ≥ (n−1)·log 2.

Reg lower bound. Consider a value v=r+k m in class r≥2. Its earlier true neighbor v−1 lies in class r−1 and occurs exactly m_{r−1} indices earlier, so t_i = m_{r−1}. Hence r_i ≥ t_i and
Reg_log(π) ≥ ∑_{r=2}^m m_r·log(1+m_{r−1}) = Θ(n log(n/m)).
For fixed m (e.g., m=2), Reg_log(π) = Θ(n log n) while MST_log(π) = Θ(n), so Reg_log(π)/MST_log(π) = Θ(log n). ∎

Corollary (parity blocks). Taking m=2 (all odds, then all evens, or vice versa) yields Reg_log(π)=Θ(n log n) and MST_log(π)=Θ(n).
