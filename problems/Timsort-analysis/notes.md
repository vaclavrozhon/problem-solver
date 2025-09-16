# Research Notes



We target entropy adaptivity of TimSort on inputs decomposed into runs of lengths ℓ1,…,ℓr with Σℓi=n and H=Σ (ℓi/n) log2(n/ℓi).

Key status:
- The statement “TimSort uses ≤ n H + O(n) comparisons (leading constant 1)” is false. Buss–Knop exhibited run-length sequences that force ≥ (3/2 − o(1)) n log2 n comparisons for TimSort; for these inputs, H ≈ log2 n.
- True: Python TimSort (with the de Gouw et al. fix, i.e., the extra guard r2 + r3 ≥ r4) achieves comparisons ≤ O(n + n H). We now have a self-contained proof.
- Stronger/tight: comparisons ≤ (3/2) n H + O(n) is provable via a potential-function analysis; this is tight. We will formalize this later.

Proof strategy for O(n + nH):
1) Model TimSort’s core stack rules (top=R1, below=R2,…): After pushing a new run, repeatedly apply (in order):
   #2: if h≥3 and r1>r3 merge (R2,R3); #3: if h≥2 and r1≥r2 merge (R1,R2); #4: if h≥3 and r1+r2≥r3 merge (R1,R2); #5 (fix): if h≥4 and r2+r3≥r4 merge (R1,R2). Finally collapse.
   Cost model: merge(a,b) costs a+b; comparisons ≤ total merge cost + O(n) for scanning.
2) Fibonacci-type invariant: At quiescence (before the next push), r1<r2, r1+r2<r3, r2+r3<r4, and for i≥3: ri+ri+1<ri+2. Hence exponential growth down the stack: ri ≤ 2^{(i+1−j)/2} rj.
3) Decompose each iteration into a starting sequence (maximal consecutive #2’s after push) and an ending sequence (subsequent merges until next push). Show starting sequences have total cost O(n): for a starting sequence that merges k preexisting runs R1,…,Rk, the cost is ≤ γ r with a universal constant γ, using r>rk and the exponential growth bound.
4) Token accounting for ending sequences: Each element receives 2 c-tokens and 1 s-token upon push and whenever its height drops during an ending merge. Charge merges as follows: #2: top two runs pay 1 c each; #3: top run pays 2 c; #4/#5: top run pays 1 c, second run pays 1 s. Show no deficits: s-tokens used by R2 in #4/#5 are immediately re-credited on the subsequent merge (the ending sequence must continue), and c-credits on height drops cover c-charges.
5) Stack-height bound for a run of length r after its starting sequence: h ≤ 4 + 2 log2(n/r), since r1=r ≤ r3 ≤ 2^{2−h/2} n by the exponential-growth bound. Thus each element accrues O(h)=O(1+log(n/r)) credits, paying for O(h) merge cost. Summing over all elements yields O(Σ r (1+log(n/r)))=O(n+nH).
6) Add O(n) for run detection/overhead. Hence comparisons ≤ O(n+nH).

Lower bound: Any comparison sort needs ≥ nH − O(n) comparisons when the run partition is known, by counting n!/(ℓ1!…ℓr!) and Stirling.

Next steps:
- Polish constants and edge cases (empty/singleton runs, final-collapse folding), then promote the O(n + nH) result to output.md.
- Optionally, finalize the potential-function proof for the tight (3/2) nH + O(n) upper bound and add it to proofs.md.
- If the goal truly requires a leading constant 1, switch to a nearly optimal stable mergesort (e.g., powersort/peeksort): comparisons ≤ nH + O(n).