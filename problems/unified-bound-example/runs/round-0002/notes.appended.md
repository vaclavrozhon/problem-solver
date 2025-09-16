# Research Notes



# Corrections and guidance

- Bit-reversal UB lower bound (Prover 1): The argument via t = ν2(i−1) shows UB_i ≥ log(min{2^t, 2^{h−t−1}}) = min{t, h−t−1} − O(1). With Pr[t=k]=2^{−(k+1)}, we have E[min{t,h−t−1}] = ∑_{k=0}^{h−1} 2^{−(k+1)} min{k, h−k−1} = O(1). Therefore this line of reasoning yields only UB(π) = Ω(n), not Ω(n log n). The step claiming Θ(h) per step is incorrect.

- DFS UB = Θ(n) (Prover 1): The sketch using UB_i ≤ log(2 + |x_i − x_{i−1}|) is plausible but needs a clean proof. Suggested route: charge log differences to subtree sizes along the DFS traversal and show ∑_v O(log size(v)) = O(n).

- Round-robin block construction (Prover 2): The per-step lower bound min_j (j + |x_i − x_{i−j}|) ≥ ⌊b/2⌋ for all i beyond the first round is false. Counterexample pattern (general b): choose within-block σ_b with (c_2, c_3) = (1, b). For any block B_r at round t=3, let s be the adjacent block that comes after r in ρ_k. Then the last access to B_s was at round t=2 with key c_2=1, so Δ = b + c_2 − c_3 = 1. The corresponding j equals k + pos(r) − pos(s) − 1 ≤ k−1, hence j + Δ ≤ k. When k ≪ b, this is < b/2, contradicting the claimed bound. In fact, many t produce such small witnesses, so UB_i can be O(log k) frequently.

- Fractal 2413 family (Prover 1): BST side is promising if we can cite or prove that Greedy runs in O(n) on permutations whose substitution decomposition uses only simple nodes of size ≤ 4. The UB lower bound must be scale-based: for many i, show that all candidates among the last L (for L ≈ the size of a relevant block scale) are far in key, so min_j (j+Δ) = Ω(L), giving UB_i = Ω(log L). The naive “first-arrival per block” charge yields only O(n) total and is insufficient.

- Next steps:
  1) Provide a rigorous DFS UB=O(n) proof or a citation.
  2) Correct the bit-reversal UB claim; add numerical UB for n = 2^h up to h ≈ 14–16.
  3) For F_h, (a) verify/cite Greedy’s O(n) bound for k-decomposable (k=4), (b) develop and prove a proper scale-based UB lower bound, and (c) compute UB empirically for h up to 8–10.
  4) Abandon the round-robin block family for UB ≈ n log(n/k); its structure lets adjacent-block, previous-round witnesses keep UB_i = O(log k) too often.
