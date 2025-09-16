# Rigorous Proofs



Theorem (Entropy-adaptive complexity of Python TimSort). Let an array of length n be greedily decomposed into maximal monotone runs (decreasing runs reversed), with lengths ℓ1,…,ℓr and Σℓi=n. Define H = Σi (ℓi/n) log2(n/ℓi). Consider Python’s TimSort core (with the guard r2 + r3 ≥ r4). Then the number of comparisons is at most C n + C′ n H for universal constants C,C′. In particular, comparisons = O(n + nH).

Model and rules. Maintain a stack of runs R1,…,Rh (top to bottom) with lengths r1,…,rh. After pushing a new run, repeatedly apply the first applicable rule:
 #2: if h≥3 and r1>r3, merge (R2,R3)
 #3: else if h≥2 and r1≥r2, merge (R1,R2)
 #4: else if h≥3 and r1+r2≥r3, merge (R1,R2)
 #5: else if h≥4 and r2+r3≥r4, merge (R1,R2)
Else break; after all runs are pushed, force-collapse.
Cost model: merging runs of sizes a and b has merge cost a+b. Counting comparisons: each merge uses ≤ a+b−1 comparisons; scanning to detect runs and loop overhead cost O(n). Thus comparisons ≤ (total merge cost) + O(n).

Invariant (Fibonacci-type growth). At any moment just before a push (i.e., when the while-loop is quiescent), the stack satisfies r1<r2, r1+r2<r3, r2+r3<r4, and for all i≥3: ri+ri+1<ri+2. Proof: By inspection of the rules, if quiescent then the three displayed inequalities hold; merges only shift indices and preserve ri+ri+1<ri+2 for i≥3.
Exponential growth corollary. For any i≤j≤h: ri ≤ 2^{(i+1−j)/2} rj. In particular, given the bottom run is ≤ n, we have r3 ≤ 2^{2−h/2} n.

Iteration decomposition. After pushing a run R of length r, the ensuing merges split into:
- starting sequence: a block of rule #2 merges (possibly empty);
- ending sequence: the subsequent merges until the next push (never containing #1, may be empty).

Lemma 1 (Starting sequences cost O(n)). Fix a starting sequence for run R that merges k≥2 top runs R1,…,Rk from the pre-existing stack (before the push). Its total merge cost is C = Σ_{i=1}^k (k+1−i) ri. The last #2 merge occurs with r>rk; by the exponential growth bound on the pre-existing stack, rk ≥ 2^{(k−1−i)/2} ri. Hence C/r ≤ Σ_{j=1}^k j·2^{−j/2} ≤ γ for a universal constant γ. Summing over all pushes (Σ r = n) yields O(n).

Token scheme for ending sequences. We assign two token types: c-tokens and s-tokens. Tokens pay unit merge cost.
Credits: When a run is pushed, each element in it receives 2 c-tokens and 1 s-token. Whenever an ending-sequence merge lowers an element’s stack height, that element is credited again with 2 c-tokens; moreover, in #4/#5 merges the elements of R2 (which move to the top) receive 1 s-token.
Charges: For each ending-sequence merge:
- #2 (merge R2,R3): every element of R1 and R2 pays 1 c-token (r1+r2 tokens ≥ r2+r3 since r1>r3).
- #3 (merge R1,R2): every element of R1 pays 2 c-tokens (cost ≤ 2 r1 since r1≥r2).
- #4/#5 (merge R1,R2): every element of R1 pays 1 c-token and every element of R2 pays 1 s-token (exactly r1+r2 tokens).
Lemma 2 (No deficits). Throughout the execution, no element’s c- or s-token balance becomes negative. Proof: In #2/#3/#4/#5, the top run’s elements’ height drops and they receive fresh 2 c-tokens immediately after the merge, covering c-charges. In #4/#5, elements of R2 pay 1 s-token; the resulting top run necessarily triggers another ending-sequence merge next (by #3 or #4/#5), lowering their height and re-crediting 1 s-token before any further s-charge can apply. A straightforward induction on merges establishes nonnegativity.

Stack-height bound after the starting sequence. Let h be the stack height when the starting sequence of run R (length r) is over. At that point, r=r1 ≤ r3, while for the tail we have r3 ≤ 2^{2−h/2} n. Hence r ≤ 2^{2−h/2} n, i.e., h ≤ 4 + 2 log2(n/r).

Lemma 3 (Per-element budget). Each element of a run of length r is credited O(h) c-tokens and O(h) s-tokens over its ending sequence, where h ≤ 4 + 2 log2(n/r). Proof: Each height drop gives 2 c-tokens; height can drop at most h times. Each s-token is charged only on #4/#5 and immediately re-credited at the next merge; thus at most one s-token per height drop is ever in flight, giving O(h) total.

Ending-sequence cost bound. By Lemma 2, every unit of ending-sequence merge cost is paid by some token. By Lemma 3, elements of a run of length r supply O(1 + log2(n/r)) tokens on average. Summing over all elements yields O(Σ r (1 + log2(n/r))) = O(n + nH).

Conclusion. Total merge cost = (starting) + (ending) = O(n) + O(n + nH) = O(n + nH). Since comparisons ≤ merge cost + O(n), the theorem follows.

Lower bound (for optimality up to constants). For arrays whose run partition is fixed with lengths ℓ1,…,ℓr and distinct keys, there are n!/(ℓ1!⋯ℓr!) compatible permutations. Any comparison decision tree must have height ≥ log2(n!) − Σ log2(ℓi!) = nH − O(n) by Stirling. Hence no comparison sort can beat nH − O(n) comparisons on all such inputs.

Remark (tight leading constant is 3/2 for TimSort). The bound with leading constant 1 is false for TimSort; families exist with ≥ (3/2 − o(1)) n log2 n comparisons. A refined potential-function analysis proves an upper bound (3/2) nH + O(n).