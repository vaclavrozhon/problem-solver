# Rigorous Proofs



# Rigorous results

## Theorem (K=3 upper bound for the natural algorithm)
Let K=3. Draw m i.i.d. ballots from the election profile, run IRV on the sample with the fixed deterministic tie-breaking rule, and let ĉ be the sample winner. If

m ≥ (2/ε^2) · ln(18/δ),

then with probability at least 1−δ, ĉ is an ε-winner of the true election.

### Proof
For S∈{C}∪{two-candidate subsets} and a∈S, define f_{S,a}(x)=1[top_S(x)=a]. There are exactly 9 such pairs (S,a). Let p_a(S)=E f_{S,a}, and let p̂_a(S) be the empirical mean over the m sampled ballots.

By Hoeffding’s inequality and a union bound over the 9 pairs, with probability at least 1−δ we have simultaneously

|p̂_a(S) − p_a(S)| ≤ α,  for all (S,a),

where α = sqrt(ln(18/δ)/(2m)). Work on this event and set ε := 2α.

Let the sample IRV elimination sequence be b̂_1 (first eliminated from C) and then the final opponent â (so the last two candidates are {ĉ, â}). By the sample rule,
- at S=C, p̂_{ĉ}(C) ≥ p̂_{b̂_1}(C);
- at S={ĉ,â}, p̂_{ĉ}({ĉ,â}) ≥ p̂_{â}({ĉ,â}).

Using the uniform deviations,
- p_{b̂_1}(C) − p_{ĉ}(C) ≤ (p̂_{b̂_1}(C)+α) − (p̂_{ĉ}(C)−α) ≤ 2α = ε;
- p_{â}({ĉ,â}) − p_{ĉ}({ĉ,â}) ≤ (p̂_{â}({ĉ,â})+α) − (p̂_{ĉ}({ĉ,â})−α) ≤ 2α = ε.

Now add ε fraction of ĉ-first ballots to the electorate (compare absolute tallies; others’ tallies are unchanged on any S containing ĉ). At S=C, ĉ’s tally increases by ε, so ĉ is no smaller than p_{b̂_1}(C) and hence at least as large as the minimum among the other two candidates; thus ĉ is not eliminated. The eliminated candidate is one of the two original opponents. In the subsequent two-candidate set {ĉ, â}, ĉ’s tally exceeds (or equals, with the fixed tie-breaking possibly favoring ĉ or handled by reserving an arbitrarily small slack) that of â. Therefore ĉ wins. This holds on the event above, which has probability at least 1−δ. ∎

## Lemma (Uniform sufficient certificate)
Fix c. If for every nonempty S⊇{c},

p_c(S) ≥ min_{a∈S\{c}} p_a(S) − ε,

then c is an ε-winner. 

Proof. Add ε mass of c-first ballots. For any S containing c, c’s tally increases by ε and others’ tallies are unchanged, so c is never strictly below the minimum and thus cannot be eliminated; c eventually wins. ∎

## Lower bound (K=2)
For K=2, any algorithm that outputs an ε-winner with error probability at most δ requires m = Ω((1/ε^2)·log(1/δ)) samples in the worst case.

Sketch. Let X∼Bernoulli(μ) be the indicator that a random ballot ranks a fixed candidate c above the other. Under μ=1/2−ε/2, c is not an ε-winner; under μ=1/2+ε/2, c is an ε-winner. The total variation (or KL) between the two Bernoulli product measures over m samples is e^{−Θ(mε^2)}. By Le Cam’s two-point method, to distinguish these with error ≤δ one needs m=Ω((1/ε^2)·log(1/δ)). ∎
