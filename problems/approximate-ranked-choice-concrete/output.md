Main results to date:

- Two-phase holdout certification (general K). Phase 1: run IRV on m1 samples to select ĉ. Phase 2: on an independent holdout of size m2 ≥ (8/ε^2)·ln(2M_c/δ) with M_c=2^{K−2}(K+1), compute B̃(ĉ)=max_{S⊇{ĉ}}(min_{a∈S\{ĉ}} p̃_a(S)−p̃_{ĉ}(S)). If B̃(ĉ) ≤ ε/2 − ξ (for any ξ>0), then with probability at least 1−δ, ĉ is an ε-winner.

- K=3: exact c-first augmentation formula. For C={c,a,b}, the minimal ε making c win via c-first augmentation is E_c = max{ [min{p_a(C),p_b(C)} − p_c(C)]_+ , [p_{x*}({c,x*}) − p_c({c,x*})]_+ }, where x*=argmax_{a,b} p_a(C).

- K=3 (natural algorithm, with separation). If |p_a(C)−p_b(C)| ≥ ε/2 and m ≥ (8/ε^2)·ln(18/δ), then with probability at least 1−δ the sample IRV winner ĉ is an ε-winner.

- Baseline lower bound (K=2). Any algorithm needs m = Ω((1/ε^2)·log(1/δ)).

Open: Tight guarantees for the one-phase natural algorithm when K≥4 without separation assumptions; reducing exponential dependence on 2^{K} in certification.