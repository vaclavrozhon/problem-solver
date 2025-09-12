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


## K = 3: exact minimal augmentation via two-type reduction

Let C = {a,b,c} and fix target winner c. Denote first-round shares p_x := t_x({a,b,c}) and pairwise shares t_x({b,c}), t_x({a,c}). To remove dependence on tie-breaking, introduce a slack γ > 0 and require strict separations in all inequalities.

Targeting elimination of a in round 1 and a c vs b final, it suffices to consider only two added ballot types: c-first (amount α ≥ 0) and b-first (amount β ≥ 0). These induce the linear constraints
- First round: p_a + 0 ≤ p_b + β − γ and p_a + 0 ≤ p_c + α − γ, i.e.,
  β ≥ B_γ := [p_a − p_b + γ]_+ and α ≥ A_γ := [p_a − p_c + γ]_+.
- Final: t'_c({b,c}) ≥ t'_b({b,c}) + γ, i.e., α − β ≥ D_γ := t_b({b,c}) − t_c({b,c}) + γ.
The minimum total mass is then
  ε_a^*(γ) = min_{α,β≥0} {α+β : α ≥ A_γ, β ≥ B_γ, α − β ≥ D_γ} = B_γ + max{A_γ, B_γ + D_γ}.
By a dominance argument, a-first additions are never optimal for this targeted strategy: if an a-first ballot ranks c ≻ b, it is dominated by a c-first ballot (strictly improves both elimination inequalities and matches the bc margin); if it ranks b ≻ c, it is dominated by a b-first ballot (improves the relevant elimination inequality and matches the bc margin). The symmetric expression ε_b^*(γ) is obtained by swapping a and b. The exact minimal augmentation to make c win is
  ε^*(γ; c) = min{ε_a^*(γ), ε_b^*(γ)}, and ε^*(c) = lim_{γ→0^+} ε^*(γ; c).
This matches the counterexample in the notes (a=0.38, b=0.35, c=0.27 with c beating b head-to-head): A_0=0.11, B_0=0.03, D_0=−0.10, hence ε_a^*(0) = 0.03 + max{0.11, −0.07} = 0.14.

Sampling for K = 3: Computing ε^*(γ; c) requires only five tallies: p_a, p_b, p_c, t_c({b,c}), t_c({a,c}). A Hoeffding + union bound over these five quantities gives m = Θ((log(1/δ))/ε^2) samples to decide whether ε^*(c) ≤ ε with probability ≥ 1 − δ.

## LP approach: primal/dual and sensitivity status (general K)

For a fixed elimination order π with remaining sets S_j = {π(j),...,π(K)}, add slack γ > 0 and consider variables y(r) ≥ 0 over rankings r. The primal is
- Minimize ∥y∥_1 subject to, for each j and a ∈ S_j \ {π(j)}:
  (t_a(S_j) − t_{π(j)}(S_j)) + ∑_r y(r)(1[top_{S_j}(r)=a] − 1[top_{S_j}(r)=π(j)]) ≥ γ.
Moving baseline tallies to the RHS gives constraints Ay ≥ b, with b_{j,a} = γ − (t_a(S_j) − t_{π(j)}(S_j)). The dual is
- Maximize ∑_{j}∑_{a≠π(j)} λ_{j,a}·(γ − (t_a(S_j) − t_{π(j)}(S_j))) subject to, for every ranking r,
  ∑_{j}∑_{a≠π(j)} λ_{j,a}(1[top_{S_j}(r)=a] − 1[top_{S_j}(r)=π(j)]) ≤ 1, and λ ≥ 0.
Sensitivity: v(b) = max_{λ∈Λ} b^T λ is 1-Lipschitz in the dual norm: |v(b+Δ) − v(b)| ≤ (sup_{λ∈Λ} ∥λ∥_1) ∥Δ∥_∞. Bounding R_K := sup_{λ∈Λ} ∥λ∥_1 by poly(K) would yield a polynomial-in-K sample bound for certifying a fixed π. For K = 3, the two-type reduction collapses Λ to two variables, giving R_3 ≤ 2. For general K, obtaining a good bound on R_K remains open; the per-constraint additive mass approach is invalid because a single added ranking can decrease other constraints when it tops the round-j loser.

## Checklist / next steps
- Formalize the K = 3 theorem and sampling corollary in output.md.
- Keep general c-first certifier and uniform convergence in output.md; use the K = 3 exact result when K = 3.
- Pursue a dual-based sensitivity bound sup_{λ∈Λ} ∥λ∥_1 = poly(K) or an approximate scheme with provable stability.
- Investigate few-type reductions for K ≥ 4 when targeting specific first eliminations.

Updates (verifier audit)

- Invalid general-K two-type claim (first-round-based). It is not enough to compare only first-round shares p_x. Later-round tallies t_w(S) can substantially exceed p_w after transfers. Counterexample sketch (K=4): Let p=(0.26,0.26,0.23,0.25) for (a,b,c,y). Suppose after removing a the tallies on S={b,c,y} are (t_b,t_c,t_y)=(0.40,0.25,0.35). A two-type bound computed only from p would take A*≈0.03 and B*≈0.01, which does not keep c,y above b in S: c would still be the round-2 loser. Any sound certificate must use the relevant subset tallies t_w(S).

- Dual sensitivity (fixed-order LP): prior attempts to bound sup_{λ} ||λ||_1 by K or K−1 dropped the negative term at j=pos_π(x) in the dual constraints. Including it makes the ‘sum over x’ argument cancel, giving no bound. The sensitivity constant remains open.

- Sound general-K two-type (chain) certificate. For target c and pivot b, let S_1=C and iteratively remove e_j = argmin_{e∈S_j\{b,c}} t_e(S_j), with the same deterministic tie-breaking as the election, forming S_{j+1}=S_j\{e_j}. Define
  A_b(γ)=max_j [t_{e_j}(S_j)−t_c(S_j)+γ]_+,
  B_b(γ)=max_j [t_{e_j}(S_j)−t_b(S_j)+γ]_+,
  D_{b,c}(γ)=t_b({b,c})−t_c({b,c})+γ.
Adding α≥A_b(γ) of c-first and β≥B_b(γ) of b-first ballots ensures elimination of e_1,…,e_{K−2} in order and a strict c-over-b final if α−β≥D_{b,c}(γ). The minimal two-type mass is B_b+max{A_b, B_b+D_{b,c}}. This is a sufficient, efficiently checkable condition depending on O(K) subset tallies (those on the chain sets S_j and the final pair).

- K=3 exact formula. The minimal augmentation to make c win is ε^*(γ;c)=min{ε_a^*(γ), ε_b^*(γ)}, where for first-eliminate a: A_γ=[p_a−p_c+γ]_+, B_γ=[p_a−p_b+γ]_+, D_γ=t_b({b,c})−t_c({b,c})+γ, and ε_a^*(γ)=B_γ+max{A_γ, B_γ+D_γ}. This matches the earlier counterexample and strictly improves the c-first certificate. A safe plug-in Lipschitz constant is 6 under sup-norm perturbations of the five required tallies.

Next steps
- Formalize the chain-based certificate (statement and proof) and add it to proofs.md; keep the K=3 exact theorem and the c-first certificate with sampling.
- Construct a K≥4 instance where adding a third ballot type strictly reduces the required mass relative to the two-type bound.
- Pursue a correct dual-norm bound for the fixed-order LP (retain negative contributions); explore alternative dual test rankings or decompositions by rounds.
- Lower bounds: formalize a Fano/packing family showing Ω((log K)/ε^2) for identifying a favorable opponent y among K−1 possibilities.


New validated results and corrections

- Chain-based two-type certificate (general K). For target c and pivot b, form the baseline chain S_1=C and e_j=argmin_{e∈S_j\{b,c}} t_e(S_j) (ties per the fixed rule), S_{j+1}=S_j\{e_j}. Define A_b(γ)=max_j [t_{e_j}(S_j)−t_c(S_j)+γ]_+, B_b(γ)=max_j [t_{e_j}(S_j)−t_b(S_j)+γ]_+, D_{b,c}(γ)=t_b({b,c})−t_c({b,c})+γ. Adding α c-first and β b-first with α≥A_b, β≥B_b, α−β≥D_{b,c} eliminates e_1,…,e_{K−2} in order and elects c over b with strict margins. The optimal two-type mass is ε_b^*(γ)=B_b+max{A_b, B_b+D_{b,c}}. This generalizes the K=3 exact formula and is a sound sufficient condition for K≥4.

- Sampling via chain-stability. If the empirical gaps along the chain, \hat g_j = min_{x∈\hat S_j\{\hat e_j}} \hat t_x(\hat S_j) − \hat t_{\hat e_j}(\hat S_j), exceed 4τ, then with high probability the empirical chain equals the true chain, and the plug-in cost deviates by ≤6τ. Using sample-splitting and Hoeffding bounds over O(K^2) tallies yields m = Θ((log K + log(1/δ))/ε^2) under this verifiable margin condition.

- Necessary lower bound (round‑1 + final). For any augmentation achieving a {b,c} final with a strict c-over-b win by γ, the total added mass satisfies ∥y∥_1 ≥ L_b(γ):=B_b^{(1)}(γ)+max{A_b^{(1)}(γ), B_b^{(1)}(γ)+D_{b,c}(γ)}, where A_b^{(1)}(γ)=[p_min^{(b,c)}−p_c+γ]_+, B_b^{(1)}(γ)=[p_min^{(b,c)}−p_b+γ]_+. This is tight for K=3 and lower-bounds ε_b^* since S_1=C contributes to A_b,B_b.

- Corrections. (i) The first-round-only two-type claim is invalid; later-round tallies t_w(S) can differ greatly from p_w. (ii) Attempts to bound the fixed-order LP dual norm by K or K−1 dropped negative terms in the dual constraints; a correct polynomial bound remains open.

Next steps
- Formalize an Ω((log K)/ε^2) lower bound via Fano over pivots b.
- Construct a K≥4 instance where a 3-type augmentation strictly improves over ε_b^*(γ).
- Seek a valid polynomial dual-norm bound or local (margin-dependent) sensitivity for the fixed-order LP.
