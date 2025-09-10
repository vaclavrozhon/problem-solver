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
