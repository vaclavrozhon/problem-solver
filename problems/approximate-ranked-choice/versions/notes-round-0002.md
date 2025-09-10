# Notes



# Corrected certificate and counterexample for K = 3

Notation: For a candidate set C with |C| = K and any nonempty S ⊆ C with c ∈ S and |S| ≥ 2, define t_a(S) = Pr[top among S is a] under the population distribution P over full rankings.

Corrected c-first certificate: Define

M_c(P) := max_{S ⊆ C, c ∈ S, |S| ≥ 2} [ min_{a ∈ S \ {c}} t_a(S) − t_c(S) ]_+.

If ε > M_c(P), then adding ε' (with 0 < ε' ≤ ε) mass of c-first ballots ensures that in every subset S encountered along any IRV elimination path, c's tally strictly exceeds the minimum among S \ {c}, so c cannot be eliminated and is the eventual winner. This yields a sound, distribution-free sufficient condition. Note the strict inequality requirement; in algorithmic use we maintain a margin so that ε' < ε and ties do not involve c.

Uniform estimation: The family {1[top_S(r) = a]} over all (a, S) has size K · 2^{K-1}. Hoeffding + union bound gives uniform estimation of all t_a(S) within ±τ using m = O((log(K · 2^{K-1}) + log(1/δ))/τ^2) samples. The plug-in estimate \hat M_c satisfies |\hat M_c − M_c| ≤ 2τ.

Counterexample to "K = 3 exactness" of c-first certificate: Let first-place shares be a = 0.38, b = 0.35, c = 0.27. Suppose c beats b head-to-head by margin m = 0.10 but loses to a by margin 0.20. The c-first certificate f_c requires ε ≥ max{0.35 − 0.27, 0.20, 0} = 0.20. However, adding α = 0.11 of c-first ballots and β = 0.03 of b-first ballots yields new first-place tallies c' = 0.38, b' = 0.38, a' = 0.38 (with tiny extra slack to make a uniquely minimal). Then a is eliminated first; in the final, the c vs b margin is m + α − β = 0.10 + 0.11 − 0.03 = 0.18 > 0, so c wins. Total added mass ≈ 0.14 < 0.20. Thus, for K = 3, the minimal augmentation need not equal the c-first-only threshold. A full characterization must allow mixed additions.

LP approach (status and caveats): For a fixed elimination order π, the condition that π(j) is eliminated at round j can be written linearly in terms of the baseline tallies t_a(S_j) and the additive contributions of the added mass y(r) via indicators 1[top_{S_j}(r) = a]. This leads to a linear program minimizing total added mass. To be rigorous one must encode the fixed tie-breaking rule (e.g., by strict inequalities or lexicographic tie constraints). Sensitivity of the LP optimum to perturbations in the t_a(S) (estimated from samples) is the key technical step for a polynomial-in-K sample bound using this approach; deriving an explicit O(poly(K)) Lipschitz constant remains open.

Lower bounds: The Ω((1/ε^2) log(1/δ)) dependence is necessary even for K = 2 (majority). Stronger K-dependent lower bounds (Ω((log K)/ε^2) or Ω(K/ε^2)) are plausible but require explicit constructions.

Next steps summary:
- Formalize LP with tie-breaking and derive sensitivity bounds.
- Provide a correct, closed-form minimal-augmentation characterization for K = 3 allowing mixed additions (compare two strategies: avoid facing a losing opponent by flipping the first-round loser vs. directly fixing the head-to-head deficit).
- Explore whether the worst-case S for the c-first certificate can be restricted by |S| ≤ r for a constant r.
- Build K-dependent lower bounds via Fano/packing constructions over top-of-S events.
