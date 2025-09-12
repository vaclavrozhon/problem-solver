Preliminaries. Let C be the K candidates. For nonempty S⊆C and a∈S, let p_a(S)=Pr[top_S(ballot)=a], where top_S(x) is the highest-ranked candidate from S on ballot x. Adding ε fraction of c-first ballots increases p_c(S) by ε for every S⊇{c} and leaves p_a(S) for a≠c unchanged (we compare absolute tallies).

Lemma (Uniform certificate). Fix c∈C and define B(c)=max_{S⊇{c}} (min_{a∈S\{c}} p_a(S) − p_c(S)). If B(c) < ε, then c is an ε-winner. If B(c) ≤ ε and, whenever equality holds after adding ε, the tie-breaking rule does not eliminate c among tied minima, then c is an ε-winner.
Proof. After adding ε of c-first ballots, for any S⊇{c} we have p'_c(S)=p_c(S)+ε ≥ min_{a∈S\{c}} p_a(S) = min_{a∈S\{c}} p'_a(S). With strict inequalities (or favorable tie-breaking at equality), c is never eliminated and thus eventually wins IRV. ∎

Lemma A (Function counting for holdout). Fix ĉ. The number of distinct indicators g_{S,a}(x)=1[top_S(x)=a] required to evaluate B̃(ĉ) over all S⊇{ĉ} and a∈S equals
M_c = (K−1)·2^{K−2} + 2^{K−1} = 2^{K−2}(K+1).
Proof. The family of S containing ĉ has size 2^{K−1}. Summing |S\{ĉ}| over these S gives ∑_{t=1}^{K−1} t·C(K−1,t)=(K−1)2^{K−2}. Adding the 2^{K−1} functions for a=ĉ yields the claim. ∎

Theorem B (Holdout certificate ⇒ ε-winner, with strict slack). Fix ξ>0. Phase 1: draw m1 ballots, run IRV, and obtain ĉ. Phase 2: draw m2 fresh ballots and compute
B̃(ĉ) := max_{S⊇{ĉ}} [ min_{a∈S\{ĉ}} p̃_a(S) − p̃_{ĉ}(S) ],
where p̃ are empirical frequencies on the holdout. If
m2 ≥ (8/ε^2) · ln(2M_c/δ),  with M_c=2^{K−2}(K+1),
then with probability at least 1−δ, simultaneously |p̃_a(S)−p_a(S)| ≤ ε/4 for all required (S,a). On this event, if B̃(ĉ) ≤ ε/2 − ξ, then B(ĉ) ≤ ε − ξ and, by the uniform certificate, adding ε of ĉ-first ballots makes ĉ strictly safe in every S⊇{ĉ} by margin ≥ξ; thus ĉ wins IRV.
Proof. Hoeffding’s inequality and a union bound over M_c indicators yield the stated uniform deviation with the given m2. For any S, min_{a≠ĉ} p_a(S) − p_{ĉ}(S) ≤ [min_{a≠ĉ} p̃_a(S) − p̃_{ĉ}(S)] + ε/2, hence B(ĉ) ≤ B̃(ĉ)+ε/2. The strict slack gives the tie-free conclusion. ∎

Proposition C (K=3: exact c-first augmentation). Let C={c,a,b}. Define x*∈{a,b} by p_{x*}(C)=max{p_a(C),p_b(C)}. The minimal ε (restricted to adding c-first ballots) that makes c win IRV equals
E_c := max{ [min{p_a(C),p_b(C)} − p_c(C)]_+ , [p_{x*}({c,x*}) − p_c({c,x*})]_+ }.
Proof. Adding ε of c-first ballots increases p_c(S) by ε for S⊇{c} and leaves others unchanged. In round 1, c survives iff p_c(C)+ε ≥ min{p_a(C),p_b(C)}; then the eliminated candidate is the smaller of {a,b}, and the final opponent is x*. In the final pair {c,x*}, c wins iff p_c({c,x*})+ε ≥ p_{x*}({c,x*}). The minimal ε satisfying both is the stated maximum. ∎

Corollary D (K=3, separation-based guarantee for the natural algorithm). Let C={c,a,b} and suppose |p_a(C)−p_b(C)| ≥ γ. Draw m i.i.d. ballots, run IRV with the fixed tie-breaking rule on the sample, and let ĉ be the sample winner with sampled final opponent x̂. If m ≥ (8/ε^2)·ln(18/δ) and γ ≥ ε/2, then with probability at least 1−δ we have x̂=x* and |p̂_x(S)−p_x(S)| ≤ ε/4 for all S∈{C,{ĉ,x*}} and x∈S. Consequently, by Proposition C, E_{ĉ} ≤ ε and ĉ is an ε-winner.
Proof. Uniform Hoeffding over the 9 pairs (S,a) with S∈{C,{a,ĉ},{b,ĉ}} yields α=√(ln(18/δ)/(2m)) ≤ ε/4; the separation ensures x̂=x*. In the sample, ĉ is not the minimum at C and ĉ beats x̂; transferring to truth loses at most 2α in each inequality. Adding ε boosts ĉ’s margins to at least ε−2α ≥ ε/2, ensuring a strict win. ∎

Lower bound (K=2). Any algorithm that outputs an ε-winner with error probability at most δ requires m = Ω((1/ε^2)·log(1/δ)) samples in the worst case.
Proof sketch. Reduce to distinguishing Bernoulli means 1/2±ε/2 on m samples; Le Cam’s method gives the bound since TV between the product measures is e^{−Θ(mε^2)}. ∎
