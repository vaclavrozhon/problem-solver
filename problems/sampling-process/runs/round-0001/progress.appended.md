## Round 0001 — 2025-08-27T15:27:52.572907Z

# Reading and scope
- Goal: understand asymptotic order of g(k,2) in the two-point adversarial sampling process; explore partial success under the “lighter-item adversary” (delete the lighter of two i.i.d. size‑biased samples, with fixed weights), and the geometric layered inputs.
- Ambiguity check: In task.tex, g(k,2) is stated without an expectation. In GÖRT (Fact B.4), discussion uses sampling; all known comparisons (“with constant probability”) suggest the intended guarantee is in expectation. I proceed with expected values; if pathwise bounds are required, the trivial O(k) upper bound is essentially best possible (rare but possible sequences can remove all light items first).

# Lighter‑item adversary: exact one‑step formulas
Fix a multiset of positive weights v = (v_1,…,v_n) at some step, with W = ∑ v_i, n = k−i.
- Let the size‑biased law be P(Z = v_j) = v_j/W. For two i.i.d. draws Z_1, Z_2, the rule deletes min(Z_1,Z_2).
- Sort v nondecreasingly: v_1 ≤ … ≤ v_n. Let tail sums S_j = v_j + … + v_n.

Claim 1 (deletion probability and expected drop).
- Probability item j is deleted in this step is
  
  P_del(j) = 2 (v_j/W) (S_j/W) − (v_j/W)^2 = v_j (2 S_j − v_j)/W^2.
  
  Proof sketch: P(delete j) = P(X=j, Y≥v_j) + P(Y=j, X≥v_j) − P(X=Y=j) with X,Y i.i.d.
- Expected weight removed in the step is
  
  E_drop = E[min(Z_1,Z_2)] = (1/W^2) ∑_{j=1}^n v_j^2 (2 S_j − v_j).
  
  This representation is useful and testable (e.g., by coding or small hand‑checks).

Immediate corollaries:
- Upper bound: E_drop ≤ 2 ∑ v_j^2 / W = 2 E[Z]. (Use S_j ≤ W.)
- Lower bound: E_drop ≥ ∑ v_j^3 / W^2. (Use S_j ≥ v_j.) This is weak but universal.

# Hazard of a single heavy outlier
Consider one heavy v_max = M and all other weights summing to R; let p = M/(M+R).

Lemma 2 (heavy hazard). In any step with two‑sample deletion, the heavy is deleted with probability exactly p^2 (the event both draws are the heavy). Hence while the heavy survives, its deletion time T satisfies
- P(T > t) ≤ (1 − p^2)^t and E[T] ≤ 1/p^2.
Moreover, while the heavy survives and other items are removed, p is nondecreasing (weights fixed), so these bounds are conservative across time. This gives a quick (and checkable) explanation why truly massive outliers cannot be postponed for long under the lighter‑item rule.

Implication: In the extreme instance (M ≍ k, others weight 1), the expected number of deletions before the heavy disappears is O(1); during O(1) deletions, the factor (n/(n−t)) multiplying average is 1+O(1/k), so the expected average cannot blow up by more than a constant in this phase.

# Two‑value distributions: exact minimization of E[min]/AVG
A clean tractable family: m light items of weight a and (n−m) heavy items of weight b = r a (r ≥ 1). Let p_h be the size‑biased mass of the heavy side: p_h = (n−m) b / W and p_ℓ = 1 − p_h.
- E[min(Z_1,Z_2)] = a + p_h^2 (b − a). (Since min is a unless both draws are heavy.)
- AVG = W/n = (m a + (n−m) b)/n.
For n=2 (one a and one b), with r = b/a we obtain
- E[min]/AVG = 2 (r^3 + 2 r + 1)/(1 + r)^3.
Differentiating shows the minimum over r≥1 occurs at r* = (4 + 2√7)/6 ≈ 1.54858, with value
- c_2 := min_r E[min]/AVG ≈ 0.943931…
For general m, n but still two weights, optimizing over the size‑biased share p and r yields the same qualitative picture: the worst ratio E[min]/AVG is attained in a two‑item configuration (this can be checked for the two‑group model by expressing in (p,r) and observing the minimal achieved at boundary m=1, n−m=1), yielding the same constant c_2.

Conjecture 1 (Schur‑convex minimizer). Among all weight vectors of length n with fixed W, the quantity E[min(Z_1,Z_2)]/AVG is minimized by a two‑point support (one a and one b). If true, then universally
- E[min(Z_1,Z_2)] ≥ c_2 ⋅ (W/n) with c_2 ≈ 0.9439.
This is amenable to a proof via majorization/Schur‑convexity since the functional ∑_{i,j} v_i v_j min(v_i,v_j) is symmetric cubic; I have not completed this, but it is a crisp target to check (first for n=3 by hand).

Consequence (conditional): With W′ = W − E_drop and n′ = n − 1,
- E[AVG′] = E[W′/n′] ≤ (W − c_2 W/n)/(n−1) = AVG ⋅ (1 − c_2/n)/(1 − 1/n).
Telescoping over n = k,k−1,… gives
- E[AVG_i] ≤ AVG_0 ⋅ exp(∑_{t=n+1}^{k} [(1−c_2)/t + O(1/t^2)]) = O(1) ⋅ AVG_0 ⋅ k^{1−c_2}.
Thus, under the lighter‑item adversary with fixed weights,
- g(k,2) ≤ O(k^{1−c_2}) with 1−c_2 ≈ 0.0561, i.e., a subpolynomial exponent. This is a concrete, nontrivial improvement over O(k), and it reduces the problem to proving Conjecture 1.

Remark: Even without Conjecture 1, a weaker universal bound E[min] ≥ c ⋅ (W/n) for some explicit c>0 would imply g(k,2) ≤ O(k^{1−c}). The two‑item calculation gives c≥0.9439 in that restricted family; proving any uniform c>0.8 appears tractable and would already yield g(k,2) ≤ k^{0.2}.

# General adversary (not restricted to lighter)
Two knobs make the adversary stronger than the lighter rule: (i) choosing which of two sampled items to delete, and (ii) shrinking weights. Even with fixed weights, the adversary can choose in each step whether to use ℓ_i=1 (safe from p_max^2 hazards) or ℓ_i=2 (to accelerate removal of light). This suggests the potential for a lower bound strictly larger than a constant. A promising direction: adapt “postponing a heavy” strategies by switching to ℓ=1 whenever p_max becomes too large, and using ℓ=2 otherwise to skim light weight. A layered instance should then realize a growth at least Ω(log k). I will formalize this in the next round (I have a blueprint combining the hazard control with a coarse potential for W).

# Geometric layered inputs under lighter‑item adversary (heuristics)
Instance: α^i items at weight 2^{−i}, i=0,…,I, total ≈k.
- The size‑biased mass at layer i is ∝ α^i ⋅ 2^{−i} = (α/2)^i. Thus if α<2, most sampling mass is on small i; the lighter‑item deletion then removes primarily those layers, keeping W in check. If α>2, mass shifts to deep layers; nevertheless, the “both draws in deep layers” event becomes frequent and removes deep elements themselves. Heuristic computation (using the explicit two‑group formulas layer‑by‑layer) suggests no blow‑up beyond a constant factor for fixed α (I will turn this into a precise bound; the relevant recurrence is E_drop ≈ ∑ p_i^2 2^{−i} + (1 − ∑ p_i^2) min‑layer weight, with p_i ∝ (α/2)^i).

# Why the noisy‑k‑means++ constant‑average proof is relevant (and different)
The O(1) adversarial‑advantage of [Noisy k‑means++ revisited, 2023] relies on per‑draw (1±ε) perturbations and an arbitrary but monotone decrease of weights. The crucial combinatorial lemma (bounding the total number of bad iterations when “big mass” dominates) depends on the fact that only one draw is made per step. In our ℓ=2 model, the quadratic hazard p_max^2 interacts adversarially with the choice ℓ_i∈{1,2}; still, their “big/medium/small” partition and the integral identity E[min]=∫ S(t)^2/W^2 may be transplantable to produce an O(1) bound in the lighter case. I will try to adapt their Lemma 3.3‑style argument with S(t) in place of the distorted probabilities.

# Concrete, checkable items produced this round
1) Exact deletion probability and expected drop (Claim 1): formulas ready to verify numerically on toy inputs.
2) Heavy hazard lemma (Lemma 2): simple, rigorous bound E[T] ≤ 1/p^2, with qualitative corollary that massive outliers cannot persist.
3) Two‑value family minimization: closed form for E[min]/AVG, minimum at r*≈1.5486 with constant c_2≈0.9439; derivation is explicit and checkable.
4) Conditional bound: g(k,2) ≤ O(k^{1−c_2}) under lighter‑item adversary if Conjecture 1 holds; even weaker constants would still give subpolynomial growth. This is a clear, testable milestone.

# Obstacles / gaps
- The key gap is Conjecture 1 (minimizer is two‑point support). I have not yet proved Schur‑convexity of L(v):=∑_{i,j} v_i v_j min(v_i,v_j) under fixed W and n. This is the crux for a universal c.
- For the full adversary (choosing which of the two to delete and optionally shrinking weights), even establishing Ω(log k) lower bounds needs a formal strategy (switching ℓ_i), which I have only sketched.
- Layered instances: I outlined the heuristic; a clean potential‑based proof is pending.

# Next steps
- Prove Conjecture 1 for n=3 explicitly, then attempt induction via Karamata/majorization to show that spreading mass (in the sense of majorization) increases E[min]/AVG. If successful, this certifies c_2.
- Fallback: obtain a universal explicit constant c≥3/4 such that E[min] ≥ c ⋅ W/n, via a simpler inequality (e.g., Jensen‑type bounds on ∫ S(t)^2). This would already give g(k,2) ≤ k^{1/4} in the lighter model.
- General adversary lower bound: formalize a strategy that alternates between ℓ=2 (to skim light) and ℓ=1 (to avoid p_max^2 deletions), and construct a layered instance achieving E[AVG] ≥ Ω(log k) ⋅ AVG_0.
- Layered inputs under lighter adversary: write the exact mean‑field recurrence for layer counts using Claim 1 and bound E[AVG_i]/AVG_0 for any fixed α.

# Sanity checks / toy examples
- Two items weights (1,2): E[min]=13/9, AVG=3/2, ratio≈0.9629 < 1 (average increases slightly in one step), consistent with formulas.
- Heavy‑outlier (M=k, k−1 ones): initial p=1/2 ⇒ heavy eliminated each step with prob 1/4; expected survival ≤ 4 steps; numeric evolution shows E[AVG_i] stays within a small constant factor.

# References used
- GÖRT 2022 Appendix B.2 (definition of the ℓ‑point adversarial sampling process) for context.
- Grunau–Özüdoğru–Rozhoň 2023 (Noisy k‑means++ revisited) for the ∫ S^2 identity style and “big/medium/small” partition idea.

