# Notes



# Path-wise IRV certification and concentration

- Define, for any subset A of candidates and candidate x ∈ A, the linear functional score_x(P; A) := Pr_{b∼P}[x is the top-ranked among A on ballot b]. For a fixed elimination order σ = (e_1, e_2, …, e_{K-1}, w), define A_r := [K] \ {e_1,…,e_{r-1}} and, for each y ∈ A_r \ {e_r}, the margin functional d_{r,y}(P) := score_y(P; A_r) − score_{e_r}(P; A_r).
- Feasibility of σ under P is equivalent to d_{r,y}(P) ≥ 0 for all r and y; ties are broken by a fixed rule consistent with σ.
- Certificate distribution: Let R be the full ranking that lists candidates in the order (w, e_{K−1}, e_{K−2}, …, e_1). Let Q be the point mass on R. Under Q, for every round r, e_r is never top among A_r (so score_{e_r}(Q; A_r)=0). The top among A_r is always w, hence d_{r,y}(Q) = 1 if y=w and 0 otherwise.
- Additive-ballot model: Adding an α-fraction of additional ballots from Q transforms P into P′ := (P + α Q)/(1+α). For any linear functional ℓ, ℓ(P′) = (ℓ(P) + α ℓ(Q))/(1+α).
- Uniform concentration: The family of functionals F := { (A, y, x) ↦ score_y(·; A) − score_x(·; A) : A ⊆ [K], |A|≥2, y≠x∈A } has cardinality U = Σ_{s=2}^K C(K,s) s(s−1) = K(K−1) 2^{K−2}. Hoeffding plus a union bound yields that with m ≥ C (log U + log(1/δ))/ε^2 = C' (K + log(1/δ))/ε^2, we have |ℓ(S) − ℓ(P)| ≤ ε for all ℓ ∈ F w.p. ≥ 1−δ.
- Path-wise certificate (informal): If IRV run on the sample S produces σ, and d_{r,y}(S) ≥ 2ε for all r,y on that path, then on the uniform concentration event, d_{r,y}(P) ≥ ε. Adding α=ε fraction of ballots from Q makes d_{r,y}(P′) ≥ ε/(1+ε) for y≠w and ≥ (ε+ε)/(1+ε) for y=w, so σ is feasible on P′ and w wins. Thus w is an ε-winner.

Remarks and contrasts
- This approach controls adaptivity: we concentrate uniformly over all d_{r,y}, so the random sets A_r along the sample path pose no extra difficulty.
- A previously suggested per-round “repair by adding ≤ 2η mass” must be reformulated as a single added distribution Q (e.g., the ranking R above). Sequential repairs are hard to compose rigorously due to renormalization and cross-effects.
- Identity check: Σ_{s} C(K,s) s(s−1) = K(K−1) 2^{K−2} follows from evaluating E[S(S−1)] for S∼Bin(K,1/2).

Next targets
- Write a clean theorem: with m ≥ C (K+log(1/δ))/ε^2, with prob ≥ 1−δ, either some empirical margin < 2ε (no certificate), or the sample winner is an ε-winner. Provide full proof under the additive-ballot model.
- K=3 specialization: Only a constant number of statistics (first-round shares and final pairwise margin) are needed; present the explicit certificate and concentration.
- Lower bounds: (i) K=3 two-point lower bound Ω((log(1/δ))/ε^2); (ii) constructions probing K-dependence (hidden near-tie constraints; chains of near-ties).


Path-wise IRV certificate and uniform concentration (refined)

- For A ⊆ [K], |A| ≥ 2 and x ∈ A, define score_x(P; A) = Pr[x is top-ranked among A on a random ballot]. For elimination order σ = (e_1, …, e_{K−1}, w), set A_r := [K] \ {e_1,…,e_{r−1}}, and define d_{r,y}(P) := score_y(P; A_r) − score_{e_r}(P; A_r) for y ∈ A_r \ {e_r}. Feasibility of σ under P is equivalent to d_{r,y}(P) ≥ 0 for all r,y (with a fixed deterministic tie-break consistent with σ).
- Additive-ballot model: c is an ε-winner for P if ∃ distribution Q over rankings and α ∈ [0, ε] such that IRV run on P′ = (P + α Q)/(1+α) elects c.
- Single-ranking certificate Q: Fix σ with winner w. Let R be the ranking (w, e_{K−1}, …, e_1) and Q = δ_R. Then for all r,y ≠ w, d_{r,y}(Q) = 0 and for y = w, d_{r,w}(Q) = 1. Consequently, d_{r,y}(P′) = (d_{r,y}(P) + α d_{r,y}(Q))/(1+α).
- Uniform concentration: The family F = { (A,y,x) ↦ score_y(·;A) − score_x(·;A) } has cardinality U = Σ_{s=2}^K C(K,s) s(s−1) = K(K−1) 2^{K−2}. Hoeffding + union bound gives a uniform deviation bound γ with m = O((K + log(1/δ))/γ^2).
- Parametric certificate: Let τ := min_{r,y} d_{r,y}(S). On the uniform event sup_{ℓ∈F} |ℓ(S) − ℓ(P)| ≤ γ, if τ > γ then for any α ∈ [0, τ − γ] the same σ is feasible on P′ = (P+αQ)/(1+α), hence w wins in P′ and is an (τ−γ)-winner for P. This generalizes the 2ε→ε trigger by decoupling sample slack from uniform deviation.
- Tie-breaking: Once all d_{r,y}(P′) > 0, elimination is unique in every round and does not depend on the tie-breaking rule.

K = 3 specialization and lower bound
- For K=3 with empirical order (e, o, w), the relevant functionals are: score_o(·; [3]) − score_e(·; [3]), score_w(·; [3]) − score_e(·; [3]), and Pr[w ≻ o] − Pr[o ≻ w] (which equals score_w(·; {w,o}) − score_o(·; {w,o})). A uniform bound over these three (two-sided) gives m ≥ (2/γ^2)(log 6 + log(1/δ)). The certificate triggers if all three empirical margins exceed α + γ, certifying w as an α-winner.
- Two-point lower bound (K=3): Construct P_+, P_− supported on w≻o≻e and o≻w≻e with masses 1/2±ε (and e always last). For any α ≤ ε < 1/3 and any Q, e remains the unique first-round loser, and the final pairwise margin changes as (2ε + αΔ)/(1+α) with Δ ∈ [−1,1], so it cannot flip unless α ≥ 2ε. Therefore, under P_+ only w is an ε-winner, and under P_− only o is. Using Bretagnolle–Huber with KL(P_+||P_−) = 2ε ln((s/2+ε)/(s/2−ε)) ≤ 4ε^2/(s/2−ε) ≤ 16ε^2/s (for ε ≤ s/4), any algorithm that outputs an ε-winner with probability ≥ 1−δ for both P_+, P_− requires m ≥ (s/16)·(log(1/(4δ)))/ε^2, i.e., m = Ω((log(1/δ))/ε^2).

Next targets
- Integrate the parametrized certificate and a gap-dependent guarantee into output.md with full proofs and explicit constants. Provide a simple data-dependent certification rule α̂ = max{0, τ − γ}.
- Strengthen constants (optional) via Bernstein-type bounds; document impact.
- Develop K-dependent lower bounds via packings over rounds/constraints and Fano’s method (aiming for Ω((log K)/ε^2) or Ω(K/ε^2) under priors).