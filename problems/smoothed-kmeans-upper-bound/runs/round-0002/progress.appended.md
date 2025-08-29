## Recap of curated results and scope
- We have a clean per-k bound (Theorem 1 in output.md) via the anchor s(k):=min{s≤k: OPT_s ≤ 2·OPT_k}, translating “effective oversampling” into the MRS bi-criteria guarantee with a factor-2 slack.
- We have a per-plateau average bound (Theorem 2) using only the logarithmic branch of MRS and a Stirling inequality, plus a global decomposition across plateaus (Corollary 3).

## Small fixes/clarifications for output.md
- Monotonicity justification: In Theorem 2’s proof, replacing (s(k),Δ(k)) by (m,k−m) is valid because the MRS two-branch bound f(s,Δ):=min{2+1/(2e)+ln(2s/Δ), 1+s/(e(Δ−1))} is nondecreasing in s and nonincreasing in Δ for Δ≥2; the log-branch is also nonincreasing in Δ for Δ≥1. Thus f(s(k),Δ(k)) ≤ f(m,k−m). This monotonicity could be stated explicitly for completeness.
- Endpoint constant: The Δ=0 contribution can be bounded by C_fix(ln m + 2)/L, so A2 can be set to C_fix and the implicit O(1) made explicit as +2. This may help downstream constant accounting.
- Range note: On [k0,2k0), any plateau start m≥k0 and length L≤2k0−m≤m. This observation is useful when invoking the “large-Δ branch” below: since Δ≤L−1≤m−1, the second branch never yields values below 1+1/e.

## Lemma A (Monotonicity of the MRS bi-criteria bound)
Statement. Let f(s,Δ):=min{ 2+1/(2e)+ln(2s/Δ), 1+s/(e(Δ−1)) } defined for integers s≥1, Δ≥1 (interpret the second term only for Δ≥2). Then for fixed s, f is nonincreasing in Δ; for fixed Δ≥2, f is nondecreasing in s.
Why useful here. This formally justifies the substitution s(k)≤m and Δ(k)≥k−m in Theorem 2.
Sketch. Each branch is coordinate-wise monotone: ln(2s/Δ) increases in s and decreases in Δ; s/(e(Δ−1)) increases in s and decreases in Δ for Δ≥2. The pointwise minimum of functions with the same monotonicity preserves these directions.

## Proposition B (Two-branch per-plateau averaging with a tunable split)
Setup. On a 2-plateau I=[m,m+L) (L≥2), for Δ:=k−m∈{1,…,L−1}, we have the per-k bound (Theorem 1, with s(k)≤m, Δ(k)≥Δ):
E_++[ALG_{m+Δ}/OPT_{m+Δ}] ≤ 2·C_bi·min{ a + ln(2m/Δ), 1 + m/(e(Δ−1)) }, where a:=2 + 1/(2e).
For any integer τ with 1≤τ≤L−1,
(1/(L−1)) Σ_{Δ=1}^{L−1} min{ a + ln(2m/Δ), 1 + m/(e(Δ−1)) }
≤ a + (τ/(L−1))·ln(2m/τ) + ((L−1−τ)/(L−1)) + (m/(e(L−1)))·(H_{L−2} − H_{τ−1}),
where H_r is the r-th harmonic number, H_0:=0.
Proof idea. Split the sum at τ: for Δ≤τ use the logarithmic branch and upper bound ln(2m/Δ) by ln(2m/τ); for Δ≥τ+1 use the 1+m/(e(Δ−1)) branch and sum the 1/(Δ−1)-tail by H_{L−2}−H_{τ−1}.

- Consequence 1 (recovering Theorem 2): Choosing τ=L−1 (where the “large-Δ” branch is unused) yields the Stirling-based bound used in Theorem 2: average ≤ a + 1 + ln(2m/(L−1)).
- Consequence 2 (benefit when L is a constant fraction of m): Since L≤m on [k0,2k0), set τ=⌊c·L⌋ with c∈(0,1) fixed. Then H_{L−2}−H_{τ−1} ≤ ln((L−1)/(cL−1)) + O(1/L) = ln(1/c) + O(1/L). The right-hand side becomes
  a + c·ln(2m/(cL)) + (1−c) + (m/(e(L−1)))·(ln(1/c)+o(1)).
  If L≥α m (α∈(0,1]), then m/(L−1)≤1/α and ln(2m/(cL)) ≤ ln(2/(cα)), giving an explicit O(1) bound in terms of α (see Corollary C below).

## Corollary C (Explicit constants on long plateaus)
If L≥α m for some α∈(0,1], then for k uniform over I and algorithmic randomness,
E[ALG_k/OPT_k] ≤ 2·C_bi·( a + 1 + ln(2/α) ) + (C_fix(ln m + 2))/L.
Taking C_bi=C_fix=5, this simplifies to
E[ALG_k/OPT_k] ≤ 10·(3 + 1/(2e) + ln(2/α)) + 5(ln m + 2)/L.
In particular, if α is an absolute constant, the plateau-average is an absolute constant (e.g., for α=1, the leading term is ≤ 10·(3 + 1/(2e) + ln 2) ≈ 38.8).
Proof. Apply Proposition B with τ=L−1 (or any fixed fraction of L) and the observation m/(L−1)≤1/α, ln(2m/(L−1)) ≤ ln(2/α) + ln(L/(L−1)) ≤ ln(2/α) + O(1/L). Add the Δ=0 endpoint term.

## Corollary D (Quantile-in-Δ guarantee on a plateau)
Fix any η∈(0,1). On I=[m,m+L) with L≥2, for all Δ≥η(L−1), the large-Δ branch yields
E_++[ALG_{m+Δ}/OPT_{m+Δ}] ≤ 2·C_bi·(1 + m/(e·η(L−1))).
Therefore, for at least a (1−η) fraction of k∈I, we have the bound above. If moreover L≥α m, this becomes ≤ 2·C_bi·(1 + 1/(eαη)). For C_bi=5 and, say, η=0.01, α=1, this gives an explicit 1%‑quantile bound ≤ 10·(1 + 100/e) ≈ 10·(1 + 36.8) ≈ 378.
Why useful. This provides a rigorous “with probability ≥ 1−η over k uniform on the plateau” guarantee using the second branch. It is numerically loose but constant when L is a constant fraction of m.

## Suggested curation items
- Add Lemma A explicitly to output.md to justify the monotonic substitutions.
- Add Proposition B (two-branch split) and Corollary C (explicit constants for L≥α m). These strengthen Theorem 2 in regimes with long plateaus by giving explicit constants that do not grow with k0 (beyond a negligible L^{-1} endpoint term).
- Optionally add Corollary D (quantile-in-Δ within a plateau) as a step toward the “probability ≥ 0.01” formulation in the task.

## Examples and sanity checks
- Long dyadic plateau: If OPT halves only once across [k0,2k0), then L≈m (α≈1). Corollary C gives an O(1) plateau-average; Theorem 2 also gives O(1); Corollary D yields an explicit 1% bound ≤ ~378 (with C_bi=5), improvable by tightening constants.
- Short-plateau regime: If all plateaus have L_j=1, Corollary 3 indicates the global average can be Θ(log k0). Proposition B reverts to the Theorem 2 bound with τ=L−1.

## Toward a high-probability “heavy-coverage” lemma (progress)
Goal. Under strong scale separation (e.g., OPT_{k1} ≥ k^C·OPT_k for large C), show that the first k1 steps select one center in each of the k1 heavy optimal clusters without collision with probability ≥ 1−k^{-Ω(1)}.
Incremental step (testable sub-claim). Let H_t be the set of heavy clusters still uncovered at step t≤k1, and U_t(heavy) their uncovered cost. Then using Corollary 4.5 of MRS (supermartingale eH_t(P) per cluster) and linearity, we can define eH_t(heavy):=Σ_{P∈H_t} eH_t(P), which is a supermartingale dominating H_t(heavy). If the total “light” mass satisfies H_t(light)+U_t(light) ≤ OPT_k · polylog k and OPT_{k1} ≥ k^C·OPT_k, then for all t≤k1,
  E[ 1 − U_{t}(heavy)/(U_t(heavy)+H_t(all)) ] ≤ k^{-Ω(1)}.
Interpretation. The term in brackets is the one-step miss probability within heavy clusters. Summing over t or using a multiplicative Chernoff-type bound for time-inhomogeneous trials suggests a k^{-Ω(1)} bound on any miss among heavy clusters. Formalizing this requires quantifying the drift of eH_t(heavy) and the coupling between heavy and light processes; this is the next technical hurdle.
Next steps: (i) pin down a concrete scale-separation threshold (C) and a light-mass bound that make the miss probability summably small; (ii) formalize a stopping-time argument over the first k1 steps, applying optional stopping to eH_t(heavy) and bounding the cumulative collision probability.

## Next concrete actions
1) Curate Lemma A (monotonicity) and Proposition B (two-branch plateau averaging) into output.md, with explicit constants (e.g., C_bi=C_fix=5) to yield numerically interpretable bounds (Corollary C and D).
2) For the “0.01 probability” goal, record Corollary D as a per-plateau quantile bound. Then state a global condition: if at least 1% of k lie in plateaus with L≥α m, we get an explicit constant bound for those k.
3) Tighten constants in Corollary C by optimizing the split τ in Proposition B (solve for τ minimizing the RHS or pick τ≈(m/e)∧(L−1) to balance branches). Provide a closed-form upper bound using ln and 1/τ estimates.
4) Continue the heavy-coverage program: attempt to bound the expected number of heavy-collisions via a martingale or potential argument and convert to a high-probability bound via Freedman/Azuma inequalities adapted to bounded differences in eH_t(heavy).
5) Optional: instantiate Theorem 2’s constants numerically: A0=10·(2+1/(2e))≈21.84, A1=10, A2=C_fix≈5, replacing O(1) by +2 in the endpoint term, to facilitate downstream aggregation and “back-of-envelope” guarantees.

