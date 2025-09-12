# Output

No output yet.


# Theorems and results relevant to sampling ε-winners under IRV

We work with a candidate set C of size K. For any nonempty S ⊆ C and a ∈ S, let t_a(S) = Pr[top among S is a] under the population distribution P over full rankings. When we add a nonnegative measure y on rankings with total mass ||y||_1 ≤ ε, the tallies update additively: for each S and a ∈ S,

 t'_a(S) = t_a(S) + ∑_{r} y(r) 1[top_S(r) = a].

We assume ties in IRV are broken by a fixed deterministic rule, but we will enforce strict separations so that tie-breaking is irrelevant for our sufficient conditions.

Theorem 1 (Uniform convergence of top-of-S tallies).
Let F = {f_{a,S}(r) := 1[top_S(r) = a] : a ∈ S ⊆ C, |S| ≥ 1}. For m i.i.d. sampled ballots and any δ ∈ (0,1), with probability at least 1 − δ,

 sup_{a,S} |\hat t_a(S) − t_a(S)| ≤ τ

whenever m ≥ c (log(K · 2^{K-1}) + log(2/δ)) / τ^2 for a universal constant c.

Proof.
There are at most K · 2^{K-1} indicator functions f_{a,S}. Hoeffding’s inequality plus a union bound gives the claim.

Theorem 2 (Sufficient certificate via c-first additions).
Fix c ∈ C and define

 f_c(P) := max_{S ⊆ C, c ∈ S, |S| ≥ 2} [ min_{a ∈ S \ {c}} t_a(S) − t_c(S) ]_+.

If ε > f_c(P), then c is an ε-winner. In particular, adding any ε' with f_c(P) < ε' ≤ ε of c-first ballots (with arbitrary completion below c) makes c the IRV winner under the augmented profile.

Proof.
Adding ε' c-first ballots increases t_c(S) by ε' for every S with c ∈ S and leaves t_a(S) for a ≠ c unchanged. By the choice ε' > f_c(P), for each such S we have t'_c(S) = t_c(S) + ε' > min_{a∈S\{c}} t_a(S). Therefore, at any round in which the remaining set is S, c’s tally strictly exceeds the minimum among other candidates in S and hence c cannot be eliminated. Since some candidate is eliminated in every round, c survives all rounds and is the unique remaining candidate; thus c wins. Because the inequalities are strict, the fixed tie-breaking rule is irrelevant.

Corollary 3 (Sound certifier and its sample complexity).
Let τ > 0, and suppose m satisfies Theorem 1 so that with probability ≥ 1 − δ we have sup_{a,S} |\hat t_a(S) − t_a(S)| ≤ τ. Define the plug-in estimator

 \hat f_c := max_{S ⊆ C, c ∈ S, |S| ≥ 2} [ min_{a ∈ S \ {c}} \hat t_a(S) − \hat t_c(S) ]_+.

Then |\hat f_c − f_c(P)| ≤ 2τ for all c. Consequently, the following procedure is a sound certifier: compute \hat f_c for all c and output any c with \hat f_c ≤ ε − 2τ. With probability at least 1 − δ, every output c satisfies f_c(P) ≤ ε, and hence (by Theorem 2) is an ε-winner.

In particular, choosing τ = ε/4 and m = Θ((log(K · 2^{K-1}) + log(1/δ)) / ε^2) suffices for correctness with probability ≥ 1 − δ.

Proof.
For each fixed S containing c, the map (\{t_a(S)\}_{a∈S}) ↦ min_{a∈S\{c}} t_a(S) − t_c(S) is 2-Lipschitz in the sup norm (the minimum over a ≠ c perturbs by at most τ, and t_c by at most τ). Taking positive part and a maximum over S preserves Lipschitzness, giving |\hat f_c − f_c| ≤ 2τ. The rest follows from Theorem 2.

Proposition 4 (Necessary dependence on ε and δ).
Any algorithm that, with probability at least 1 − δ, outputs an ε-winner from m samples must have m = Ω((1/ε^2) log(1/δ)).

Proof.
For K = 2, IRV reduces to a two-candidate majority. Determining whether a given candidate is an ε-winner requires distinguishing whether their head-to-head share is ≥ 1/2 − ε versus ≤ 1/2 − 2ε, which is standard Bernoulli mean testing and requires Ω((1/ε^2) log(1/δ)) samples by classical information-theoretic or concentration lower bounds.

Remarks and scope.
- The certifier in Theorem 2 is sufficient but not necessary in general (and, in particular, is not exact for K = 3). It uses only c-first additions and enforces non-elimination of c in every potential round, which can be conservative.
- An exact minimal-augmentation characterization for a fixed elimination order can be expressed via a linear program over the added-ballot distribution; making this rigorous with a fixed tie-breaking rule and deriving a stability bound in terms of estimation error in the t_a(S) are promising next steps.


Theorem 5 (K = 3: exact minimal augmentation to make a target c win under IRV).
Let C = {a,b,c} and fix a target winner c. Write first-round shares p_x := t_x({a,b,c}) for x ∈ {a,b,c}, and pairwise tallies t_x({b,c}) and t_x({a,c}). Fix a deterministic tie-breaking rule and introduce a slack parameter γ > 0 to enforce strict separations so that tie-breaking is irrelevant.

Define, for the strategy that eliminates a in round 1 and then pits c against b in the final,
- A_γ := [p_a − p_c + γ]_+,
- B_γ := [p_a − p_b + γ]_+,
- D_γ := t_b({b,c}) − t_c({b,c}) + γ.
Let ε_a^*(γ) be the minimum total mass of added ballots required to realize this strategy. Then
  ε_a^*(γ) = B_γ + max{A_γ, B_γ + D_γ}.
Symmetrically, for the strategy that eliminates b first and then pits c against a, with
- A'_γ := [p_b − p_c + γ]_+,
- B'_γ := [p_b − p_a + γ]_+,
- D'_γ := t_a({a,c}) − t_c({a,c}) + γ,
we have
  ε_b^*(γ) = B'_γ + max{A'_γ, B'_γ + D'_γ}.
Consequently, the exact minimal total added mass to make c the IRV winner with strict margins γ is
  ε^*(γ; c) = min{ε_a^*(γ), ε_b^*(γ)},
and the exact minimal augmentation without slack is ε^*(c) = lim_{γ→0^+} ε^*(γ; c).

Proof.
Consider the strategy targeting a’s elimination in round 1 and a final between c and b. It suffices to consider added ballots of only two types: c-first ballots (total mass α ≥ 0) and b-first ballots (total mass β ≥ 0). Indeed, any added a-first ballot either ranks c ≻ b, in which case a c-first ballot strictly improves both first-round inequalities (it raises p_c and leaves p_b unchanged while an a-first raises p_a) and matches the bc final margin; or it ranks b ≻ c, in which case a b-first ballot strictly improves the relevant first-round inequality (it raises p_b while an a-first raises p_a) and matches the bc final margin. Thus a-first ballots are strictly dominated and never appear in an optimal solution.
Under α and β, the first-round tallies become p'_a = p_a, p'_b = p_b + β, and p'_c = p_c + α. Enforcing that a is strictly below both b and c in round 1 yields α ≥ A_γ and β ≥ B_γ. In the final between b and c, each added c-first ballot contributes 1 to t'_c({b,c}) and each added b-first ballot contributes 1 to t'_b({b,c}); hence t'_c({b,c}) − t'_b({b,c}) = (t_c({b,c}) − t_b({b,c})) + (α − β). The strict final-round win requires α − β ≥ D_γ. Therefore the feasible region is exactly
  { (α,β) ∈ R_+^2 : α ≥ A_γ, β ≥ B_γ, α − β ≥ D_γ }.
Minimizing α + β over this polyhedron is achieved at β = B_γ and α = max{A_γ, B_γ + D_γ}, yielding ε_a^*(γ) = B_γ + max{A_γ, B_γ + D_γ}. The expression for ε_b^*(γ) follows symmetrically. Any winning IRV run with three candidates must eliminate either a or b in the first round and then elect c in the final; hence the minimal total added mass is the minimum of the two strategy optima. Finally, sending γ → 0^+ gives ε^*(c).

Corollary 6 (Sampling complexity for K = 3 exact certifier).
Fix ε, δ ∈ (0,1). Let \hat p_x, \widehat{t}_x({b,c}), \widehat{t}_x({a,c}) be empirical estimates of p_x and the pairwise tallies from m i.i.d. ballots. There exists a universal constant c such that if
  m ≥ c · (log(5/δ)) / τ^2,
then with probability at least 1 − δ we have sup error ≤ τ simultaneously for the five quantities {p_a, p_b, p_c, t_c({b,c}), t_c({a,c})}. The maps (p_a,p_b,p_c,t_c({b,c}),t_c({a,c})) ↦ ε_a^*(γ), ε_b^*(γ), and ε^*(γ; c) are Lipschitz with a universal constant (e.g., ≤ 6) under the sup norm. Consequently, the plug-in decision “declare c an ε-winner if \min{\widehat{ε}_a^*(γ), \widehat{ε}_b^*(γ)} ≤ ε − 2Lτ” is correct with probability at least 1 − δ, where L is a Lipschitz constant (e.g., L = 6). Choosing τ = Θ(ε) yields m = Θ((log(1/δ))/ε^2).

Remarks.
- This exact characterization for K = 3 strictly improves the c-first sufficient certificate (Theorem 2) and matches the counterexample in the notes.
- For general K, an exact minimal-augmentation characterization for a fixed elimination order can be written as a linear program. A dual-based sensitivity analysis suggests that a polynomial-in-K sample bound per fixed order will follow from a poly(K) bound on sup_{λ∈Λ} ∥λ∥_1 over the dual feasible region; establishing such a bound remains open.