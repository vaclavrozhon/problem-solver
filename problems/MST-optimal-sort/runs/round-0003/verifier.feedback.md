The core results are now rigorous: (i) MST_log ≤ Reg_log holds exactly in L∞ via Kruskal’s integral and a sparse threshold subgraph H(t) using time and most-recent value-neighbor edges; (ii) by norm equivalence, MST_log^N ≤ C_N·Reg_log for any fixed norm N with an explicit constant; (iii) universally Reg_log ≤ Θ(log n)·MST_log by combining r_i ≤ i with a norm-dependent per-edge lower bound on MST. The mod-m (parity) families give Reg_log/MST_log = Θ(log n), proving the Θ(log n) factor is tight.

Key audit points:
- Prover 2/3/4’s H(t) construction and integral identity are correct and sufficient. The counting step κ_G ≤ κ_H ≤ 1 + |{i: Δ_i>t and t_i>t}| is justified by processing in increasing i.
- Norm-lifting can be sharpened: for any norm with b = sup_z ||z||/||z||∞ ≥ 1, 1+||e|| ≤ b(1+||e||∞) gives log(1+||e||) ≤ log b + log(1+||e||∞). This improves the constant from 1 + log(1+b)/log 3 to 1 + (log b)/log 3. For L_p in R^2, b_p = 2^{1/p}, so C_p = 1 + (log 2)/(p·log 3). Prover 1’s constants here are correct and better than previous.
- The universal upper bound Reg_log ≤ (log(1+n)/log(1+α_N))·MST_log^N is correct. Ensure α_N is derived via norm equivalence (α_N>0 with ||z|| ≥ α_N||z||∞) or direct minimal distances ((1,1) for permutation grids): L∞: log 2; L2: log(1+√2); L1: log 3.
- The general concave weight extension MST_φ ≤ ∑ φ(min{Δ_i,t_i}) in L∞ is valid and can be recorded as a side result.

Next steps:
- Consolidate constants: record refined C_p for L_p and α_N/b_N for common norms, and update proofs.md accordingly.
- Optional: compute leading constants for E[MST_log] and E[Reg_log] under random π using the integral identity.
- If desired, include the general concave-weight theorem as a separate statement (it follows by the same integral argument).