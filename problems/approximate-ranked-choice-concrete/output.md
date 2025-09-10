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


Remark (Tie-breaking becomes irrelevant under strict margins). In all certification theorems below, once we establish d_{r,y}(P′) > 0 for all rounds r and competitors y ∈ A_r \ {e_r} under a perturbed profile P′, the eliminated candidate e_r is the unique minimizer of top-among-A_r score. Hence the IRV path σ executes independent of any tie-breaking convention.

Lemma A (Counting of path functionals). Let F = { (A,y,x): A ⊆ [K], |A| ≥ 2, y ≠ x ∈ A }. Then |F| = U = K(K−1) 2^{K−2}.
Proof. Fix an ordered pair (y,x), y ≠ x (K(K−1) choices). The subsets A that contain both y and x are formed by choosing any subset of the remaining K−2 candidates, giving 2^{K−2} choices. Multiply.

Theorem 1′ (Parametric path-wise certificate). Let S be an m-sample from P, and let σ = (e_1,…,e_{K−1}, w) be the IRV order obtained from S. Suppose a uniform deviation bound holds:
  sup_{A ⊆ [K], |A| ≥ 2} sup_{y ≠ x ∈ A} |(score_y(S;A) − score_x(S;A)) − (score_y(P;A) − score_x(P;A))| ≤ γ.
Define τ := min_{r} min_{y ∈ A_r \ {e_r}} d_{r,y}(S). If τ > γ, then for any α ∈ [0, τ − γ], the same order σ is feasible on P′ := (P + α Q)/(1+α), where Q is the point mass on the ranking (w, e_{K−1}, …, e_1). In particular, w is an (τ−γ)-winner for P.
Proof. For each r and y ≠ e_r, the uniform bound yields d_{r,y}(P) ≥ d_{r,y}(S) − γ ≥ τ − γ. Under Q we have d_{r,y}(Q) = 0 for y ≠ w and d_{r,w}(Q) = 1. Hence for y ≠ w, d_{r,y}(P′) = d_{r,y}(P)/(1+α) ≥ (τ−γ)/(1+α) > 0; for y = w, d_{r,w}(P′) = (d_{r,w}(P) + α)/(1+α) ≥ (τ−γ+α)/(1+α) > 0. Therefore all margins along σ are strictly positive in P′, so σ is feasible and w wins.

Corollary 1.1 (Data-driven certified robustness). Under the conditions of Theorem 1′, define α̂ := max{0, τ − γ}. Then w is an α̂-winner for P. Moreover, for any target ε, if α̂ ≥ ε, then w is an ε-winner.

Theorem 2 (Gap-dependent guarantee for the natural IRV sampler). Let Γ := min_{r} min_{y ∈ A_r \ {e_r}} d_{r,y}(P) be the true minimum path margin for the elimination order σ induced by P. Fix α > 0 and γ > 0 with Γ ≥ α + 2γ. If m ≥ (2/γ^2)(log(2U) + log(1/δ)), then with probability at least 1 − δ the uniform deviation bound holds with radius γ and the empirical path satisfies τ ≥ Γ − γ ≥ α + γ. By Theorem 1′, the empirical winner w is an α-winner for P.
Proof. Hoeffding’s inequality for averages of variables in [−1,1] gives for any fixed (A,y,x): Pr(|…| > γ) ≤ 2 exp(− m γ^2/2). Union bound over U functionals and their negations gives the stated m for the uniform deviation. The rest follows by plugging into Theorem 1′.

Corollary 2 (K=3, explicit certificate with constants). Let K=3 and suppose the empirical IRV order on S is (e, o, w). Define
- M1 := min{ score_o(S;[3]) − score_e(S;[3]), score_w(S;[3]) − score_e(S;[3]) },
- M2 := Pr_S[w ≻ o] − Pr_S[o ≻ w] = score_w(S;{w,o}) − score_o(S;{w,o}),
- τ := min{M1, M2}.
If m ≥ (2/γ^2)(log 6 + log(1/δ)) and τ ≥ α + γ, then with probability at least 1 − δ the candidate w is an α-winner for P. In particular, taking α = ε and γ = ε yields the simple trigger “all three margins ≥ 2ε” with m ≥ (2/ε^2)(log 6 + log(1/δ)).
Proof. Only the three listed functionals (and two-sided deviations) are needed. Apply Hoeffding + union bound (factor 6) for a uniform γ; then apply Theorem 1′.

Theorem 3 (K=3 two-point lower bound). Fix s ∈ (0, 1/3) and ε ∈ (0, s/4). Consider candidates w, o, e and the two electorates P_+, P_- supported on the two rankings R_1 = (w ≻ o ≻ e), R_2 = (o ≻ w ≻ e) with masses P_+(R_1) = 1/2 + ε, P_+(R_2) = 1/2 − ε and P_-(R_1) = 1/2 − ε, P_-(R_2) = 1/2 + ε. Then for any algorithm that, given m iid ballots, outputs a candidate who is an ε-winner of the true election with probability at least 1 − δ under both P_+ and P_-, it must hold that
  m ≥ (s/16) · (log(1/(4δ))) / ε^2.
Proof. For any added distribution Q and α ≤ ε < 1/3, e’s first-place share in P′ := (P_+ + α Q)/(1+α) is at most α/(1+α) < 1/3, while w and o each have first-place shares at least (1/2 − ε)/(1+α) > 1/3. Hence e remains the unique first-round loser under both P_+ and P_- for all α ≤ ε; IRV thus reduces to the pairwise w vs o decision. The pairwise margin under P_+ equals M2 = 2ε. Under mixing with α and any Q, the new pairwise margin is (M2 + αΔ)/(1+α) where Δ ∈ [−1,1] is the w vs o skew of Q. This cannot flip sign unless α ≥ 2ε. Therefore, under P_+, only w is an ε-winner; under P_- only o is. Any algorithm that succeeds with probability ≥ 1 − δ on both P_+, P_- thus solves a simple-vs-simple testing problem on the single-ballot distribution. By Bretagnolle–Huber, for product distributions of size m we have 
  inf_φ [P_+(φ=−) + P_-(φ=+)] ≥ (1/2) exp(− m KL(P_+||P_-)).
Here KL(P_+||P_-) = (1/2 + ε) ln((1/2 + ε)/(1/2 − ε)) + (1/2 − ε) ln((1/2 − ε)/(1/2 + ε)) = 2ε ln((1/2 + ε)/(1/2 − ε)). For the variant with a fixed buffer s on e’s first-place mass (if desired), one may embed this instance in a larger support with e’s top share s and w/o shares (1 − s)/2 each; then KL(P_+||P_-) = 2ε ln((s/2 + ε)/(s/2 − ε)) ≤ 4ε^2/(s/2 − ε) ≤ 16ε^2/s for ε ≤ s/4 (using ln(1+x) ≤ x/(1 − x/2)). Requiring both type-I and type-II errors ≤ δ implies 2δ ≥ (1/2) exp(− m KL), hence m ≥ (log(1/(4δ)))/KL ≥ (s/16) (log(1/(4δ)))/ε^2. This yields the claimed Ω((log(1/δ))/ε^2) lower bound with an explicit constant.

Discussion. The parametric certificate makes the certify-or-abstain logic fully data-driven: with a chosen γ from m, K, δ and observed τ from S, the algorithm can confidently certify α̂ = (τ − γ)_+. The gap-dependent theorem quantifies when certification succeeds with high probability. The K = 3 lower bound shows the ε, δ scaling is unimprovable (up to constants).