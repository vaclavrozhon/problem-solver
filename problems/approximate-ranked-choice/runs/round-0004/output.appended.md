Main results on sampling ε-winners under IRV

- Sufficient certificate (all K): Define M_c:=max_{S⊆C, c∈S, |S|≥2} [min_{a∈S\{c}} t_a(S) − t_c(S)]_+. If ε > M_c, adding ε of c-first ballots makes c win. With m = Θ((K + log(1/δ))/ε^2) random ballots, we can uniformly estimate all required tallies and soundly certify any c with high probability.

- Exact characterization for K = 3: For C={a,b,c}, the minimal added mass to make c win is ε^*(c)=min{ε_a^*, ε_b^*}, where for eliminating a first,
  ε_a^* = [p_a−p_b]_+ + max{ [p_a−p_c]_+, [p_a−p_b]_+ + (t_b({b,c})−t_c({b,c})) },
with p_x = t_x({a,b,c}). Symmetrically for ε_b^*. Estimating the five needed tallies to accuracy Θ(ε) with m = Θ((log(1/δ))/ε^2) samples suffices to decide whether ε^*(c) ≤ ε with probability ≥ 1−δ.

- Lower bound: Any algorithm requires m = Ω((1/ε^2) log(1/δ)) samples even for K = 2 (majority).
