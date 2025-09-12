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


# Entropy-adaptivity of Python’s TimSort (patched): Coarse and Sharp Bounds

Setup and model. We analyze Python’s corrected TimSort (with the additional case #5 in merge_collapse). We consider the translated rule set with cases #1–#5 as in AJNP. Merging runs of sizes a and b costs at most a+b−1 comparisons; we upper-bound by merge cost a+b. Detecting runs on the fly uses O(n) comparisons. Hence total comparisons ≤ (total merge cost) + O(n).

Notation. The stack of runs is S = (R_1,…,R_h) from top to bottom with lengths r_1,…,r_h. Each iteration (pushing a run) decomposes into a starting sequence (#1 followed by a maximal block of #2 merges) and an ending sequence (subsequent merges from {#3,#4,#5}, possibly with #2 interspersed, until no rule applies).

Lemma 1 (Stack-growth invariant). After each ending sequence completes, the stack satisfies r_{i+1} > r_i for all 1 ≤ i < h and r_{i+2} > r_{i+1} + r_i for all 1 ≤ i ≤ h−2.
Proof. Induct over updates #1–#5. A push (#1) is performed only when none of #2–#5 applies, which implies r_1 < r_2, r_1 + r_2 < r_3, and r_2 + r_3 < r_4; for deeper indices the inequalities held before and simply shift. Each merge (#2–#5) replaces a pair by their sum and shifts indices; a straightforward case analysis verifies that superadditivity r_{i+2} > r_{i+1} + r_i persists for indices ≥3 and that strict increase holds for adjacent pairs.∎

Corollary 2 (Geometric growth). Whenever a run is about to be pushed, for all i ≤ j ≤ h we have r_i ≤ 2^{(i+1−j)/2}·r_j. In particular r_{i+2} ≥ 2 r_i.

Lemma 3 (Starting sequences have linear total cost). Consider a starting sequence that begins by pushing a run R of length r and performs k−1 ≥ 1 merges #2 with underlying runs R_1,…,R_k. Its total merge cost C satisfies C ≤ γ·r where γ = 2∑_{j≥1} j·2^{−j/2} < ∞. Summing over all such sequences yields total cost O(n).
Proof. The k−1 merges contribute C ≤ ∑_{i=1}^k (k+1−i) r_i. The last #2 implies r > r_k. By Corollary 2 applied to the pre-push stack, r_k ≥ 2^{(k−1−i)/2} r_i, hence C/r ≤ ∑_{i=1}^k (k+1−i) 2^{(i+1−k)/2} = 2∑_{j=1}^k j 2^{−j/2} < γ. Each run initiates exactly one starting sequence and ∑ r = n.∎

Token accounting for ending sequences. We assign tokens to elements and ensure that the spent tokens equal the ending-sequence merge costs.
- Credits: when an element’s height decreases due to a merge in an ending sequence, credit it 2 c-tokens and 1 s-token (the initial push can be treated as a height decrease from outside the stack).
- Spends: in a merge with current top runs R_1,R_2 (and R_3,R_4 as needed):
  • #2 (merge R_2,R_3): every element of R_1 and R_2 pays 1 c-token (since r_1>r_3, r_2+r_3 ≤ r_1+r_2).
  • #3 (merge R_1,R_2): every element of R_1 pays 2 c-tokens (cost ≤ 2 r_1).
  • #4/#5 (merge R_1,R_2): every element of R_1 pays 1 c-token and every element of R_2 pays 1 s-token (exactly r_1+r_2 tokens).

Lemma 4 (No token deficits). Throughout ending sequences, no element’s c- or s-balance is negative.
Proof. c-tokens: any merge that causes a height decrease immediately mints ≥2 c-tokens for the charged elements, covering the spends in #2/#3/#4/#5 by design. s-tokens: only elements of R_2 spend 1 s-token in #4/#5. In the Python-corrected algorithm (with #5), the resulting top run must be merged again immediately within the same ending sequence; this next merge decreases the height of those elements and re-credits 1 s-token before any further s-spend can occur (the top run never pays s). Induct over the merges within an ending sequence.∎

Lemma 5 (Height bound after a starting sequence). Let R be a run of length r just pushed. When its starting sequence finishes, the stack height h satisfies h ≤ 4 + 2 log2(n/r).
Proof. Runs at positions ≥3 were unaffected during the starting sequence. By Corollary 2 applied to the pre-push tail, r_3 ≤ 2^{2−h/2} r_h ≤ 2^{2−h/2} n. At the end of the starting sequence, case #2 no longer applies, so r = r_1 ≤ r_3. Therefore r ≤ 2^{2−h/2} n, i.e., h ≤ 4 + 2 log2(n/r).∎

Proposition 6 (Ending sequences cost O(n + nH)). Let ℓ_1,…,ℓ_r be the greedy run lengths and H = ∑ (ℓ_i/n) log2(n/ℓ_i). The total merge cost of all ending sequences is O(∑ ℓ_i (1 + log(n/ℓ_i))) = O(n + nH).
Proof. By Lemma 5, after its starting sequence, an element of a run of length r can undergo at most O(1 + log(n/r)) height decreases while it remains on the stack. Each such decrease mints O(1) tokens, and by Lemma 4 the total spent tokens equal the ending-sequence merge cost. Summing over all elements yields O(∑ r (1+log(n/r))) = O(n + nH).∎

Theorem A (Coarse entropy bound). Python’s corrected TimSort performs O(n + nH) comparisons.
Proof. Run detection costs O(n). By Lemma 3, starting sequences cost O(n). By Proposition 6, ending sequences cost O(n + nH). Each merge of sizes a,b uses ≤ a+b−1 comparisons; the −1 per merge and the final collapse add O(n).∎

Sharp bound via potential.
Define Φ(r) = (3/2) r log2 r and let Φ(S) be the sum over runs in S.

Lemma 7 (Balanced merges). If runs R and R′ satisfy φ^{−2} ≤ r′/r ≤ φ^2 (φ is the golden ratio), then the merge cost r+r′ is at most ΔΦ = Φ(r+r′) − Φ(r) − Φ(r′).
Proof. Write x = r/(r+r′). Then ΔΦ = (3/2) (r+r′) H(x), where H is the binary entropy. The ratio condition implies x ∈ [1/(1+φ^2), φ^2/(1+φ^2)] ⊂ [0.276…,0.723…], on which H(x) ≥ 2/3. Hence ΔΦ ≥ r+r′.∎

Lemma 8 (Forbidden short patterns). No ending sequence contains two consecutive #2 merges, nor a subsequence of the form X X #2, where X ∈ {#3,#4,#5}.
Proof. Suppose for contradiction such a pattern occurs at stack state (r_1,…,r_5). The defining inequalities for triggering those cases together with Lemma 1 (superadditivity deep in the stack) imply incompatible bounds: (i) X X #2 would require r_1+r_2 < r_4 and r_1+r_2+r_3 ≥ r_5, contradicting r_3+r_4 < r_5; (ii) X #2 #2 would require r_1 ≤ r_3 and r_1+r_2 ≥ r_5, contradicting r_2 < r_4 and r_3 < r_4.∎

Lemma 9 (Pairing unbalanced X merges). Let m be a merge of type X ∈ {#3,#4,#5} merging runs R_1 and R_2 with r_1 < φ^{−2} r_2. Then m is immediately followed by a #3 merge m′, and cost(m)+cost(m′) ≤ ΔΦ(m)+ΔΦ(m′).
Proof. Let r_3 be the next run. Because r_2 < r_3 and r_2+r_3 < r_4 (deduced as in AJNP from the preceding update and Lemma 1), while r_1 ≤ r_3 and r_1 < φ^{−2} r_2, the post-merge top r_1+r_2 lies between r_3 and r_4, forcing a #3 merge next. Set x = r_1/(r_1+r_2) and y = (r_1+r_2)/(r_1+r_2+r_3). One checks that for y ∈ [1/2,(1+φ^2)/(1+2φ^2)] the function F(y) = (3/2)(y H(2 − 1/y) + H(y)) − (1+y) is nonnegative (F′′<0 on (1/2,1), F(1/2)=0, F(3/4)>0, and (1+φ^2)/(1+2φ^2) < 3/4). This yields cost(m)+cost(m′) ≤ ΔΦ(m)+ΔΦ(m′).∎

Proposition 10 (Ending sequences paid by potential up to O(n)). Partition each ending sequence into groups: the first merge alone; thereafter, every unbalanced X (with r_1 < r_2) grouped with its following #3; all other merges as singletons. By Lemmas 7–9 and Lemma 8, every group’s total cost is ≤ its ΔΦ, except possibly the first group, which may exceed by ≤ r, the length of the just-pushed run. Summed over all iterations, these excesses total O(n).

Theorem B (Sharp bound). The total merge cost of TimSort is ≤ (3/2)·n·H + O(n), and the number of comparisons is ≤ (3/2)·n·H + O(n).
Proof. Φ telescopes between the initial configuration and the final single run: ΔΦ_total = −(3/2)∑_i ℓ_i log2(ℓ_i/n) = (3/2)·n·H. By Proposition 10, ending sequences cost at most ΔΦ_total + O(n); starting sequences cost O(n) (Lemma 3). Converting merge cost to comparisons adds O(n).∎

Remark (Tightness). There exist families of run-length sequences for which TimSort’s merge cost is ≥ (3/2)·n·log2 n − O(n); since H ≤ log2 n, this implies ≥ (3/2)·n·H − O(n) comparisons. Thus the factor 3/2 is optimal for TimSort.

Scope. The s-token argument and Lemma 8 rely on the Python-corrected rule (#5). Galloping is ignored as it can only reduce comparisons.