# Research Notes



Summary of current understanding

- Definitions: P_π = {(i, π(i))}, MST_log uses weights w(u,v)=log(1+||u−v||). Reg_log(π)=∑_{i=2}^n log(1+r_i) with r_i=min(d_i+t_i, i), d_i counts prior values between π(i−1) and π(i), and t_i is the temporal distance to the most recent earlier value-neighbor (|Δ value|=1), defaulting to i−1 if none exists.

- One-sided domination (L∞): Using Kruskal’s integral identity, ∑_{e∈MST} log(1+ℓ_e) = ∫_0^∞ (κ(t)−1) dt/(1+t), where κ(t) is the number of components in the threshold graph with edges of L∞-length ≤ t. Build a sparse subgraph H(t): when processing p_i, add the time edge (i−1,i) if |π(i)−π(i−1)|≤t, and the value-neighbor edge to the most recent earlier neighbor if t_i≤t. Then κ_G(t) ≤ κ_H(t) ≤ 1 + |{i≥2: Δ_i>t and t_i>t}|. Integrating yields MST_log(L∞) ≤ ∑ log(1+min(Δ_i,t_i)) ≤ ∑ log(1+r_i) = Reg_log.

- Norm invariance: For any norm ||·|| with ||z|| ≤ b||z||∞, choose an L∞-MST T∞ and obtain MST_log(||·||) ≤ (n−1)log(1+b) + MST_log(L∞) ≤ (1 + log(1+b)/log 3)·Reg_log, since Reg_log ≥ (n−1)log 3.

- Separation (no reverse domination): Order values by residue classes mod m, listing each class block in increasing order. For fixed m, we can span each block by index-adjacent edges (each costs log(1+m) under L∞), and connect the blocks with O(m) bridges (each costs O(log n)). Hence MST_log = Θ(n). Meanwhile, for any r≥2 and any element v=r+k m of class r, the earlier neighbor v−1 lies in class r−1 exactly m_{r−1} positions earlier, so t_i = m_{r−1} = Θ(n/m); therefore Reg_log ≥ ∑_{r=2}^m m_r log(1+m_{r−1}) = Θ(n log(n/m)). For m constant (e.g., parity), Reg_log/MST_log = Θ(log n).

- Remarks: A previously attempted charge (linking the value-adjacency path edge length directly to t_i at the later endpoint) is invalid in general (the closest earlier neighbor might be v±2). The component-integral method avoids this pitfall.

Open directions

- Likely tight frontier: prove a universal upper bound Reg_log(π) ≤ O(log n)·MST_log(π) for all π, matching the Θ(log n) lower bound from mod-m families.
- Tighten constants in the domination for specific norms; compute best b for L1 and L2.
- Quantify leading constants for E[MST_log], E[Reg_log] under random π.


Addition: universal logarithmic upper bound

- Minimal MST edge weight: For any fixed norm N on R^2, there exists α_N>0 such that ||z||_N ≥ α_N||z||_∞ for all z. Since any two distinct points p_i=(i,π(i)), p_j differ by at least 1 in each coordinate, ||p_i−p_j||_∞ ≥ 1, hence ||p_i−p_j||_N ≥ α_N. Therefore every tree edge has weight ≥ log(1+α_N), so MST_log^N(π) ≥ (n−1)·log(1+α_N).
- Trivial Reg upper bound: r_i ≤ i implies Reg_log(π) ≤ ∑_{i=2}^n log(1+i) ≤ (n−1)·log(1+n).
- Combining: Reg_log(π) ≤ (log(1+n)/log(1+α_N)) · MST_log^N(π) for all π. In particular: L∞ gives factor log(1+n)/log 2; for L2, one may sharpen c_N using ||(1,1)||_2=√2 (so each edge has weight ≥ log(1+√2)); for L1 similarly ||(1,1)||_1=2.

Thus, universally Reg_log ≤ Θ(log n)·MST_log, matching the Θ(log n) lower bound from parity/mod-m constructions. This complements the established MST_log ≤ Reg_log (exact in L∞, constant-factor for any fixed norm).