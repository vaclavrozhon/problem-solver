# Output

No output yet.


## Theorems toward certifying the natural IRV sampler

We study the following algorithm: sample m ballots i.i.d. from the electorate, run IRV on the sample to obtain an elimination order σ and winner w, and output w. We provide a path-wise certificate that, when triggered, guarantees that w is an ε-winner of the true election with high probability.

Definitions. For any subset A⊆[K] with |A|≥2 and x∈A, let
- score_x(P; A) := Pr_{b∼P}[x is the top-ranked among A on ballot b].
For a fixed elimination order σ=(e_1,…,e_{K−1}, w), set A_r := [K] \ {e_1,…,e_{r−1}} and, for each y∈A_r\{e_r}, define the margin functional
- d_{r,y}(P) := score_y(P; A_r) − score_{e_r}(P; A_r).
We say that σ is feasible under P if d_{r,y}(P) ≥ 0 for all r and y (with a fixed deterministic tie-breaking rule consistent with σ).

We adopt the additive-ballot model for ε-winner: a candidate c is an ε-winner for P if there exists a distribution Q over full rankings and α∈[0,ε] such that, in the profile P′ := (P + α Q)/(1+α), candidate c wins under IRV.

Lemma 1 (Uniform concentration of path functionals). Let
U := Σ_{s=2}^K C(K,s) s(s−1) = K(K−1) 2^{K−2}.
For any ε∈(0,1) and δ∈(0,1), if m ≥ (1/(2ε^2))(log(2U)+log(1/δ)), then with probability at least 1−δ, simultaneously for all subsets A and ordered pairs (y,x) with y≠x∈A,
| (score_y(S; A) − score_x(S; A)) − (score_y(P; A) − score_x(P; A)) | ≤ ε.
Proof. Each difference is an average of m i.i.d. variables in [−1,1]. Apply Hoeffding’s inequality and a union bound over the U functionals and their negations. The identity for U follows by evaluating E[S(S−1)] for S∼Bin(K,1/2).

Lemma 2 (Certificate via adding a single ranking). Fix σ=(e_1,…,e_{K−1}, w). Let R be the full ranking that orders candidates as (w, e_{K−1}, e_{K−2}, …, e_1), and let Q be the point mass on R. For every round r and every y∈A_r\{e_r}, under Q we have score_{e_r}(Q; A_r)=0 and
- d_{r,y}(Q) = 1 if y = w,
- d_{r,y}(Q) = 0 if y ≠ w.
Consequently, for any α≥0 and any P, in P′:=(P+αQ)/(1+α),
- d_{r,y}(P′) = (d_{r,y}(P) + α d_{r,y}(Q))/(1+α).

Theorem 1 (Path-wise ε-winner certificate for IRV). Fix ε∈(0,1/2) and δ∈(0,1). Draw m ballots i.i.d. from P to form the empirical profile S, and run IRV on S to obtain an elimination order σ and winner w. If m ≥ C (K + log(1/δ))/ε^2 for a suitable absolute constant C, then with probability at least 1−δ, the following implication holds:
If d_{r,y}(S) ≥ 2ε for every round r and every y∈A_r\{e_r}, then w is an ε-winner for P.
Proof. By Lemma 1 (absorbing constants into C), with probability ≥1−δ we have |d_{r,y}(S) − d_{r,y}(P)| ≤ ε uniformly over all (A,y,x). On this event, for all r and y we get d_{r,y}(P) ≥ ε. Let Q be as in Lemma 2 and take α=ε. Then for y≠w, d_{r,y}(P′) = (d_{r,y}(P) + 0·ε)/(1+ε) ≥ ε/(1+ε) > 0; for y=w, d_{r,w}(P′) = (d_{r,w}(P) + ε·1)/(1+ε) ≥ (ε+ε)/(1+ε) > 0. Hence all feasibility inequalities for σ hold in P′, so w wins under IRV in P′. By definition, w is an ε-winner for P.

Corollary 2 (K=3, explicit certificate). For K=3, let the sample S have elimination order (e, o, w). If the empirical first-round margins satisfy score_e(S;[3]) ≤ min(score_o(S;[3]), score_w(S;[3])) − 2ε and the final pairwise margin satisfies Pr_S[w ≻ o] − Pr_S[o ≻ w] ≥ 2ε, then for m ≥ C' (log(1/δ))/ε^2 (for a suitable constant C'), with probability ≥1−δ the candidate w is an ε-winner of P. Proof: specialize Theorem 1 to K=3; only O(1) functionals are needed for concentration in this case.

Discussion. The theorem gives a certify-or-abstain guarantee for the natural algorithm: whenever the observed sample path has per-round slack at least 2ε, the sample winner is an ε-winner of the true election with high probability from m = O((K+log(1/δ))/ε^2) samples. The uniform concentration over all path functionals resolves adaptivity of the random elimination sets.
