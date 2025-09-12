Main results on sampling ε-winners under IRV

- Sufficient certificate (all K; distribution-free). Define M_c:=max_{S⊆C, c∈S, |S|≥2} [min_{a∈S\{c}} t_a(S) − t_c(S)]_+. If ε > M_c, adding ε of c-first ballots makes c win. With m = Θ((K + log(1/δ))/ε^2) ballots, we can uniformly estimate the needed tallies and certify any such c with high probability.

- Exact characterization for K = 3. For C={a,b,c}, the minimal added mass to make c win is ε^*(c)=min{ε_a^*, ε_b^*}, where for eliminating a first,
  ε_a^* = [p_a−p_b]_+ + max{ [p_a−p_c]_+, [p_a−p_b]_+ + (t_b({b,c})−t_c({b,c})) }.
Estimating the five required tallies to accuracy Θ(ε) with m = Θ((log(1/δ))/ε^2) suffices to decide ε^*(c) ≤ ε w.h.p.

- Chain-based two-type certificate (general K; efficient). Fix a pivot b and form the baseline chain by iteratively removing the minimal among S_j\{b,c}. Let A_b:=max_j [t_{e_j}(S_j)−t_c(S_j)]_+, B_b:=max_j [t_{e_j}(S_j)−t_b(S_j)]_+, and D_{b,c}:=t_b({b,c})−t_c({b,c}). Adding α c-first and β b-first with α ≥ A_b, β ≥ B_b, and α−β ≥ D_{b,c} elects c; the optimal two-type mass is ε_b^* = B_b + max{A_b, B_b + D_{b,c}}. Under a verifiable chain-stability margin, a plug-in test certifies c with m = Θ((log K + log(1/δ))/ε^2).

- General necessary lower bound (round‑1 + final). For any augmentation achieving a {b,c} final with a strict c-over-b win, the total mass satisfies ∥y∥_1 ≥ L_b := B_b^{(1)} + max{A_b^{(1)}, B_b^{(1)} + D_{b,c}}, where A_b^{(1)}=[p_min^{(b,c)}−p_c]_+ and B_b^{(1)}=[p_min^{(b,c)}−p_b]_+. This bound is tight for K=3 and lower-bounds ε_b^* for any pivot b.

- Lower bound (baseline). Any algorithm needs m = Ω((1/ε^2) log(1/δ)) samples even for K = 2 (majority). A Ω((log K)/ε^2) dependence is necessary for certificates that must identify a favorable opponent among K−1 options (formalization via Fano is in progress).

- K=4 steering certificate (improvement over chain two-type). For C={a,b,c,d}, there is a closed-form two-type steering plan (c-first and a-first) that can force a chosen early elimination and reduce the required augmentation below the chain two-type bound. In a concrete instance, the best chain two-type bound 0.15 is beaten by a feasible augmentation of ≈0.1002 (a ≻ c ≻ b ≻ d and c-first additions). A general three-type steering certificate (adding a steering candidate u in addition to c and the pivot b) yields a 1D closed-form minimization and admits polynomial sample-splitting certification (m = Θ((log K + log(1/δ))/ε^2) under verifiable margins).