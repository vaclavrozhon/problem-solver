# Main Results



# Entropy-Adaptivity of TimSort

We consider Python’s TimSort (with the de Gouw et al. repair, i.e., the extra guard r2 + r3 ≥ r4) in the comparison model. The input array of length n is greedily decomposed into maximal monotone runs; decreasing runs are reversed (stably), so all runs are nondecreasing. Let the run lengths be ℓ1,…,ℓr with Σℓi = n, and define the binary entropy of the run-length distribution
H = Σ_{i=1}^r (ℓ_i/n) log2(n/ℓ_i).
We count comparisons; merging runs of lengths a and b needs at most a + b − 1 comparisons; detecting runs and loop overhead costs O(n). We upper bound by the “merge cost” M = Σ(a+b) over all merges and add O(n) at the end.

Theorem (Entropy adaptivity). Python’s TimSort performs at most C n + C′ n H comparisons for universal constants C, C′. Equivalently, comparisons = O(n + nH).

Algorithmic core (abstracted rules). TimSort maintains a stack of runs R1,…,Rh (top to bottom) with lengths r1,…,rh. After pushing a new run, repeatedly apply the first applicable rule:
(#2) if h ≥ 3 and r1 > r3 then merge (R2,R3);
(#3) else if h ≥ 2 and r1 ≥ r2 then merge (R1,R2);
(#4) else if h ≥ 3 and r1 + r2 ≥ r3 then merge (R1,R2);
(#5) else if h ≥ 4 and r2 + r3 ≥ r4 then merge (R1,R2);
otherwise stop. After all pushes, force-collapse until one run remains.

1) Fibonacci-type growth invariant. At any quiescent moment (no rule applies), the stack satisfies r1 < r2, r1 + r2 < r3, r2 + r3 < r4, and for all i ≥ 3: ri + ri+1 < ri+2. Proof: If quiescent, the negations of the rules yield the first three inequalities; merges only shift indices and preserve ri + ri+1 < ri+2 for i ≥ 3. Consequently, ri+2 ≥ 2 ri, hence for i ≤ j ≤ h: ri ≤ 2^{(i+1−j)/2} rj.

2) Iteration decomposition. For each push of a run R (length r), split ensuing updates into: starting sequence = maximal block of (#2)-merges; ending sequence = the later merges until the next push.

3) Starting sequences cost O(n). Fix a starting sequence that merges the top k pre-existing runs R1,…,Rk (k ≥ 2). Its total merge cost is C ≤ Σ_{i=1}^k (k+1−i) ri. The last (#2) merge ensures r > rk; applying the exponential-decay bound to the pre-existing stack yields rk ≥ 2^{(k−1−i)/2} ri. Thus C/r ≤ Σ (k+1−i) 2^{(i+1−k)/2} = 2 Σ_{j≥1} j 2^{−j/2} =: γ, a universal constant. Summing over all pushes (Σ r = n) gives O(n) total.

4) Token scheme for ending sequences. We amortize ending merges with per-element tokens (each pays 1 unit of merge cost), of two kinds: c-tokens and s-tokens.
Credits: When a run is pushed, each element receives 2 c-tokens and 1 s-token. Whenever an ending-sequence merge lowers an element’s stack height, it receives again 2 c-tokens; additionally, in #4/#5 merges, the elements of R2 will be re-credited 1 s-token on the immediately following ending merge (see below).
Charges: For a merge in the ending sequence:
- #2 (merge R2,R3): each element of R1 and R2 pays 1 c-token. Since r1 > r3, r1 + r2 ≥ r2 + r3 covers the cost.
- #3 (merge R1,R2): each element of R1 pays 2 c-tokens; cost ≤ 2 r1 as r1 ≥ r2.
- #4/#5 (merge R1,R2): each element of R1 pays 1 c-token and each element of R2 pays 1 s-token; cost equals r1 + r2.
No deficits. In #2/#3/#4/#5, the height of elements in the top run (and sometimes the second) drops, and each drop credits 2 c-tokens, covering c-charges. For s-tokens, only #4/#5 charge R2. After such a merge, the resulting top run necessarily triggers another ending merge immediately (by #3 or #4/#5), reducing its height and re-crediting 1 s-token before any subsequent s-charge. Hence no element’s c- or s-balance becomes negative (induction over merges).

5) Stack-height bound after the starting sequence. Let h be the stack height when the starting sequence of R (length r) ends. At that time, r = r1 ≤ r3, while for the tail r3 ≤ 2^{2−h/2} n by the exponential bound. Thus r ≤ 2^{2−h/2} n, i.e., h ≤ 4 + 2 log2(n/r).

6) Ending-sequence cost. Each height drop re-credits 2 c-tokens, so each element accrues O(h) credits; the s-token is re-credited at most once per height drop. Therefore, each element of a run of length r contributes O(1 + log(n/r)) tokens during its ending sequence (by the height bound). Summing over all elements gives O(Σ r (1 + log(n/r))) = O(n + Σ r log(n/r)) = O(n + n H) for the ending-sequence merge cost.

Conclusion. Starting sequences cost O(n); ending sequences cost O(n + nH). Adding O(n) for the run scan and control, we obtain comparisons ≤ C n + C′ n H.

Lower bound (optimality up to constants). Any comparison sort needs at least n H − O(n) comparisons on inputs with fixed run partition ℓ1,…,ℓr (distinct keys). Indeed, there are n!/(ℓ1!⋯ℓr!) compatible permutations; Stirling’s bounds give log2(n!) − Σ log2(ℓi!) = nH − O(n).

Remarks. (i) The stricter “≤ nH + O(n)” with leading constant 1 is false for TimSort: there are families with ≥ (3/2 − o(1)) n log2 n comparisons and H ≈ log2 n. (ii) A refined potential-function analysis yields the tight upper bound comparisons ≤ (3/2) nH + O(n) for TimSort.
