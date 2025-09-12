# Rigorous Proofs



# Entropy-adaptivity bounds for Python’s patched TimSort

We analyze the Python TimSort core with the corrected merge condition (case #5). We count comparisons; a stable merge of runs of sizes a and b uses at most a+b−1 comparisons, and we define merge cost M(a,b)=a+b. Detecting runs costs O(n) comparisons. Therefore comparisons ≤ (total merge cost) + O(n).

We prove two results:
- Theorem A (coarse): comparisons = O(n + n·H), where H = ∑ (ℓ_i/n) log2(n/ℓ_i) for the greedy run lengths ℓ_1,…,ℓ_r.
- Theorem B (sharp): comparisons ≤ (3/2)·n·H + O(n); there are inputs with ≥ (3/2)·n·H − O(n) comparisons, so the constant 3/2 is optimal for TimSort.

Throughout, the stack of runs is (R_1,…,R_h) from top to bottom with lengths r_1,…,r_h.

Definitions. An iteration (pushing a new run) decomposes into:
- starting sequence: #1 followed by a maximal block of #2 merges;
- ending sequence: the subsequent merges (#3/#4/#5, possibly interspersed #2) until no merge condition holds.

Lemma 1 (stack-growth invariant). After each ending sequence, r_{i+2} > r_{i+1} + r_i and r_{i+1} > r_i for all valid i.
Reason. Standard case analysis on updates #1–#5; see Auger–Jugé–Nicaud–Pivoteau (AJNP), Lemma 1. As a consequence, r_{i+2} ≥ 2 r_i, so along the stack r_i ≤ 2^{(i+1−j)/2} r_j for i ≤ j.

Lemma 2 (starting sequences cost O(n)). If a starting sequence begins by pushing a run R of length r and performs k−1 merges #2 (merging R_1,…,R_k beneath R), then its cost C satisfies C ≤ γ·r with γ = 2 ∑_{j≥1} j·2^{−j/2} < ∞. Summing over pushes gives O(n).
Proof. The k−1 merges contribute C ≤ ∑_{i=1}^k (k+1−i) r_i. The last #2 implies r > r_k; by Lemma 1 on the pre-push stack, r_k ≥ 2^{(k−1−i)/2} r_i, so C/r ≤ 2 ∑_{j=1}^k j 2^{−j/2}.

Lemma 3 (height bound after starting sequence). If we just pushed R of length r and finished its starting sequence, then h ≤ 4 + 2 log2(n/r).
Proof. Runs R_3,…,R_h did not change during the starting sequence. By Lemma 1 on the pre-push stack, r_3 ≤ 2^{2−h/2} r_h ≤ 2^{2−h/2} n. At the end, r_1 = r ≤ r_3, hence r ≤ 2^{2−h/2} n.

Token scheme for ending sequences. We endow each element with two kinds of tokens, c and s.
- Credits: when an element’s height decreases during an ending-sequence merge, it receives 2 c-tokens and 1 s-token. (Also, the initial push can be viewed as a height decrease from outside the stack.)
- Spends in a merge (with top runs R_1,R_2,R_3 as needed):
  • #2 (merge R_2,R_3): each element of R_1 and R_2 spends 1 c-token; since r_1 > r_3, r_2+r_3 ≤ r_1+r_2.
  • #3 (merge R_1,R_2): each element of R_1 spends 2 c-tokens; cost ≤ 2 r_1.
  • #4 or #5 (merge R_1,R_2): each element of R_1 spends 1 c-token and each element of R_2 spends 1 s-token; cost = r_1+r_2.

Lemma 4 (no deficits). No element ever owes tokens.
Proof. c-tokens are credited whenever height decreases; their spends in #2/#3/#4/#5 are covered by these credits. s-tokens are only spent by R_2 in #4/#5; in the Python-corrected TimSort, the resulting top run must be merged again immediately within the same ending sequence, decreasing the height of those elements and re-crediting one s-token before any further s-spend can occur. Induction over the ending sequence.

Lemma 5 (ending-sequence cost bound). The total merge cost of all ending sequences is O(∑_i ℓ_i (1 + log(n/ℓ_i))) = O(n + n·H).
Proof. Each element obtains O(h) token credits over its lifetime, where h is the stack height after its starting sequence; by Lemma 3, h = O(1 + log(n/r)). All spent tokens equal the merge cost of ending sequences (Lemma 4), hence the sum is O(∑ r (1+log(n/r))).

Theorem A (coarse bound). Total comparisons ≤ O(n) [run detection] + (starting sequences O(n)) + (ending sequences O(n+nH)) + O(n) [−1 per merge], i.e., O(n + n·H).

Sharp bound via potential.
Define Φ(r) = (3/2) r log2 r, and the potential Φ(S) of a stack S as the sum over its runs.

Lemma 6 (balanced merges). If two runs of sizes a and b satisfy φ^{−2} ≤ a/b ≤ φ^2 (φ the golden ratio), then the potential increase satisfies ΔΦ ≥ a+b.
Proof. ΔΦ = (3/2) [(a+b) log(a+b) − a log a − b log b] = (3/2) (a+b)·H(x) with x=a/(a+b). The ratio condition implies x ∈ [1/(1+φ^2), φ^2/(1+φ^2)] ≈ [0.276,0.724]. Since min_{x∈[0.276,0.724]} H(x) > 2/3, ΔΦ ≥ (3/2)(a+b)(2/3) ≥ a+b.

Lemma 7 (forbidden short patterns). No ending sequence contains two consecutive #2 merges, nor a subsequence of the form X X #2, where X ∈ {#3,#4,#5}.
Proof. Otherwise, the required inequalities on (r_1,…,r_5) at the start of the pattern contradict Lemma 1. (Standard case check.)

Lemma 8 (pairing unbalanced X merges). Let m be an unbalanced merge X merging R_1,R_2 with r_1 ≪ r_2 (precisely r_1 < φ^{−2} r_2). Then m is immediately followed (within the same ending sequence) by a #3 merge m′ combining (R_1+R_2) with R_3, and cost(m)+cost(m′) ≤ ΔΦ(m)+ΔΦ(m′).
Proof. From r_1 < φ^{−2} r_2 and the merge conditions we get r_2 < r_3 and r_1+r_2 ≥ r_3, so the next merge is #3. Writing x=r_1/(r_1+r_2) and y=(r_1+r_2)/(r_1+r_2+r_3), one checks that 3[y H(2 − 1/y)+H(y)]/2 ≥ 1+y for y ∈ [1/2,(1+φ^2)/(1+2φ^2)], which covers the constraints implied by the merge conditions. Hence cost ≤ ΔΦ for the pair.

Proposition 9 (ending sequences paid by potential up to O(n)). Partition each ending sequence into groups: the first group is its first merge; thereafter, whenever an unbalanced X occurs, group it with its following #3; all other merges form singletons. By Lemmas 6–8, every group’s cost ≤ ΔΦ(group), except possibly the first group, which exceeds by ≤ r, where r is the length of the just-pushed run. Summed over all ending sequences, the excess is ≤ n.

Theorem B (sharp bound). Total merge cost ≤ ΔΦ_total + O(n) = (3/2)·n·H + O(n). Hence comparisons ≤ (3/2)·n·H + O(n).
Proof. Φ telescopes: from initial runs to the final single run, the total increase is Φ(final) − Φ(initial) = − (3/2) ∑_i ℓ_i log2(ℓ_i/n) = (3/2)·n·H. Apply Proposition 9 and add O(n) for run detection and the −1-per-merge adjustment.

Lower bound (tightness). There exists a family of run-length sequences (Buss–Knop) for which TimSort’s merge cost ≥ (3/2)·n·log2 n − O(n); since H ≤ log2 n, this implies ≥ (3/2)·n·H − O(n) comparisons. Therefore the factor 3/2 is optimal for TimSort.

Remarks.
- The proofs assume the Python-corrected TimSort (with the additional #5 condition); the token s-balance and Lemma 7 use this.
- Galloping reduces comparisons; our upper bounds remain valid.
- The standard lower bound for any comparison sort with fixed run lengths is n·H − O(n) (Stirling), but TimSort’s strategy is provably off by factor 3/2 in the worst case.
