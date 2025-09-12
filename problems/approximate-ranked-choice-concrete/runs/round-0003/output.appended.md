Main results to date:

- K=3 (natural algorithm, with separation). If |p_a(C)−p_b(C)| ≥ ε/2 and m ≥ (8/ε^2)·ln(18/δ), then with probability at least 1−δ the sample IRV winner ĉ is an ε-winner.

- Two-phase holdout certification (general K). Draw m1 ballots to select ĉ by running IRV; then on an independent holdout of size m2 ≥ (2/ε^2)·ln(2M/δ), with M=(K−1)·2^{K−2}+2^{K−1}, compute B̃(ĉ)=max_{S⊇{ĉ}}(min_{a∈S\{ĉ}} p̃_a(S)−p̃_{ĉ}(S)). If B̃(ĉ) ≤ ε/2 − ξ (for any ξ>0), then with probability at least 1−δ, ĉ is an ε-winner.

- Baseline lower bound (K=2). Any algorithm needs m = Ω((1/ε^2)·log(1/δ)).

Open: Tight guarantees for the one-phase natural algorithm when K≥4 without separation assumptions.