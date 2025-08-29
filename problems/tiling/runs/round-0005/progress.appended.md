## Round 0005 — 2025-08-28T15:10:37.535604Z

Round 0005 — audit corrections, new Fourier obstruction (m=3), and two structural lemmas

Gaps and corrections in output.md (to fix explicitly)
- Incorrect “m=3 Fourier obstruction” sketch. In “Fourier obstructions” the sketch claims that requiring both ∑ e^{2π i t δ_j}=0 and ∑ e^{2π i 2t δ_j}=0 for three translates is impossible unless the δ_j are (rotated) cube roots of unity, and then asserts this contradicts the second equation. This is not correct: if z_j are a rotated triple of cube roots of unity, then both sums at t and 2t vanish. So the stated sketch cannot be used as an obstruction.
  • Corrected usable obstruction (see Lemma M3 below): for three translates, the simultaneous vanishing at frequencies t and 3t is impossible when both Fourier coefficients \(\hat{1_E}(t),\hat{1_E}(3t)\neq0\). This should replace the current sketch.
- Minor duplication. Lemma E appears first as “[As before]” and later as a full statement with proof. For coherence, keep only the explicit statement with proof and ensure earlier references point to it.
- Minor precision in Lemma T’s proof. It says “for t=2 and t=4 this would impose δ≡1/2 and δ≡1/4 simultaneously.” The precise congruences are e^{4π i δ}=−1 ⇒ δ≡1/4 (mod 1/2) and e^{8π i δ}=−1 ⇒ δ≡1/8 (mod 1/4). The contradiction remains, but stating moduli avoids confusion.
- Proposition H’s incommensurability clause. The “s rational” hypothesis is sufficient but not necessary. Lemma Q already included shows an alternative: choose β with s/β∉Q; then β/(β−s)∉Q. It would be good to mention this option in the main body of Proposition H (not only in the “Additions” section).

New small lemmas (auditable) to add
1) Lemma M3 (Fourier obstruction to 3-translate tilings via t and 3t)
- Statement. Let E⊂S^1 be measurable. If S^1 is a.e. the disjoint union of three translates E+δ_1,E+δ_2,E+δ_3, then for every t∈Z\{0} with \(\hat{1_E}(t)\neq0\) one has \(\sum_{j=1}^3 e^{2\pi i t\,\delta_j}=0\). In particular, if there exists t with \(\hat{1_E}(t)\neq0\) and \(\hat{1_E}(3t)\neq0\), then no such 3-translate tiling exists.
- Proof. The identity 1=∑_{j=1}^3 1_{E+δ_j} a.e. gives, for t≠0, \(\sum_j e^{2\pi i t\delta_j}\,\hat{1_E}(t)=0\). If both \(\hat{1_E}(t),\hat{1_E}(3t)\neq0\), then with x_j:=e^{2\pi i t\delta_j} we must have \(\sum_j x_j=0\) and \(\sum_j x_j^3=0\). By Newton’s identity for three variables, \(\sum_j x_j^3 = 3 x_1 x_2 x_3\). Since each x_j has unit modulus, the product is nonzero, so \(\sum_j x_j^3\neq0\), a contradiction. ∎
- Why useful here. This supplies a correct and sharp obstruction for m=3 (replacing the incorrect sketch). It lets us forbid 3-fold partitions for concrete E by checking two Fourier modes t and 3t.

2) Lemma P (Periodicity of singleton complementary tilings ⇔ periodicity of increments)
- Setting. In the complementary two-layer construction A=({0}×J_0)∪({1}×(S^1\(J_0+α))) assume the tiling is singleton-per-row, T_n={θ_n}, and write increments Δ_n:=θ_n−θ_{n−1}−α ∈ Stab(J_0) (Proposition K).
- Claim. T has period (r,α_*) iff (i) Δ_{n+r}=Δ_n for all n (r-periodicity), and (ii) \(\alpha_* \equiv r\alpha + \sum_{j=1}^r \Delta_j\) (mod 1).
- Proof. T has period (r,α_*) iff θ_{n+r}−θ_n is independent of n and equals α_* (mod 1). But θ_{n+r}−θ_n = rα + ∑_{j=1}^r Δ_{n+j}. Thus constancy in n is equivalent to Δ_{n+r}−Δ_n=0 for all n (by taking successive differences of r-window sums), and the constant value equals rα+∑_{j=1}^rΔ_j, yielding α_*. ∎
- Consequence. Choosing a nonperiodic sequence (Δ_n)∈Stab(J_0)^Z produces an aperiodic (yet irreducible) tiling. For q=2 (Stab(J_0)={0,1/2}), any nonperiodic 0–1 sequence gives an aperiodic tiling.

3) Lemma R′ (Two-sided boundary obstruction via rational independence)
- Statement. Let A be any tile with aggregated boundary measures μ_{k_min}, μ_{k_max} at the lowest and highest heights, respectively. If A tiles a finite set X×S^1, Lemma E forces μ_{k_min}=1/d_L and μ_{k_max}=1/d_R for some d_L,d_R∈N. Hence μ_{k_min}/μ_{k_max}=d_R/d_L∈Q. Therefore, if μ_{k_min}/μ_{k_max}∉Q, A cannot be a column.
- Proof. Immediate from Lemma E’s boundary equalities and d_L,d_R∈N. ∎
- Use. This strengthens easy non-column tests: for K={0,1,2} with one interval per layer, if c_1/c_3 is irrational then A is not a column, regardless of c_2.

Examples and quick checks
- Corrected Fourier m=3 certificate: Take E=U∪(U+1/3)∪(U+2/3) with U=[0,c) and choose c so that \(\hat{1_E}(1)\neq0\) and \(\hat{1_E}(3)\neq0\) (true for generic c). Then by Lemma M3, E cannot 3-tile S^1 by translations. This provides a clean “anti-3-tiling” hypothesis to feed into Proposition K2 when |E|=1/3.
- Aperiodic irreducible tilings in the complementary q=2 case: Let J_0 be as in Theorem A (for which singleton rigidity holds). Pick any nonperiodic bi-infinite sequence ε_n∈{0,1} and put Δ_n:=ε_n·(1/2). Then T_n={θ_0+nα+∑_{j=1}^nΔ_j} defines a tiling by Proposition K. By Lemma P, T has no period (k,α_*). Irreducibility follows as in Lemma B (gcd(K−K)=1).

Why useful here
- Lemma M3 repairs and strengthens the Fourier toolkit for m=3, replacing an incorrect sketch and giving a crisp, checkable obstruction in a delicate case (|E|=1/3) that our boundary lemma alone does not exclude.
- Lemma P formalizes the exact relationship between periods and increment sequences in the complementary construction. It both explains the source of many periods (constant increments) and guarantees the existence of aperiodic irreducible tilings when increments meander.
- Lemma R′ packages a very simple non-column test that only inspects the two boundary layers; it is immediately applicable to many K (including K={0,1,2}).

Obstacles and cautions
- Fourier obstructions beyond m=2 and m=3. For m≥4, requiring p_1=∑z_j=0 does not in general force p_m=∑z_j^m≠0, so the t and mt strategy may not yield a contradiction. Stronger multi-frequency constraints (a set T of t’s with \(\hat{1_E}(t)\neq0\)) or structural assumptions on E are likely needed.
- Classification for q≥3. Proposition K gives the meandering classification but does not force constant increments modulo 1/q. Proving rigidity (only the q helical tilings) seems to require an additional nondegeneracy hypothesis; current attempts via two- or three-row endpoint propagation have not yet yielded a contradiction when offsets vary.

Next steps (concrete, testable updates to output.md)
1) Replace the incorrect m=3 Fourier sketch by Lemma M3 (t and 3t obstruction) with its short proof. Optionally add a brief worked example class (E as a 1/3-periodic union of intervals with nonvanishing \(\hat{1_E}(1),\hat{1_E}(3)\)).
2) Insert Lemma P (periodicity ⇔ periodic increments) after Proposition K; add a one-line corollary: aperiodic increments produce aperiodic irreducible tilings.
3) Add Lemma R′ (boundary rational independence) to the “Boundary tools” and cite it in the K={0,1,2} section as an alternative non-column certificate when c_1/c_3∉Q.
4) In Proposition H, append: “Alternatively, incommensurability holds whenever s/β∉Q (Lemma Q), allowing arbitrary s by a suitable choice of β.”
5) Minor housekeeping: remove the first “[As before]” occurrence of Lemma E in favor of the explicit statement later, and refine the modulus wording in Lemma T’s proof as noted above.

These are all incremental, auditable changes that close a correctness gap (m=3 Fourier), add two compact structural lemmas, and expand the stock of easy-to-verify non-column and aperiodicity criteria.

