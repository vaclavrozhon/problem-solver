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
