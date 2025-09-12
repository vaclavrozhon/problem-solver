# Research Notes



## Entropy-adaptivity of TimSort: corrected target and plan

- The target “comparisons ≤ n·H + O(n)” (leading constant 1) is false for TimSort. Buss–Knop construct run-length sequences yielding merge cost ≥ (3/2)·n·log n − O(n); since H ≤ log n, TimSort requires ≥ (3/2)·n·H − O(n) comparisons on those inputs. Hence we cannot prove the original claim.
- Correct bounds for Python’s patched TimSort (with the additional #5 condition):
  - Coarse: comparisons = O(n + n·H) via starting/ending-sequence decomposition and token accounting.
  - Sharp: comparisons ≤ (3/2)·n·H + O(n), tight (there are matching lower-bound inputs).

Sketch of the coarse O(n + nH) argument
- Model: merging runs of sizes a,b uses ≤ a+b−1 comparisons; run detection takes O(n) comparisons; so total comparisons ≤ total merge cost + O(n).
- Split each iteration into a starting sequence (#1 followed by maximal #2’s) and an ending sequence (merges #3/#4/#5, possibly with #2’s, until invariant restored).
- Invariant (after collapse): r_{i+2} > r_{i+1} + r_i and r_{i+1} > r_i; consequence: along the stack, r_{i+2} ≥ 2 r_i, giving exponential growth and a height bound.
- Starting sequences: cost O(n) in total, via geometric decay (last #2 implies r > r_k and r_k ≥ 2^{(k−1−i)/2} r_i; the weighted sum ∑(k+1−i) r_i ≤ γ·r for a constant γ).
- Ending sequences: tokens per element (2 c + 1 s) credited whenever its height decreases; spends per case #2/#3/#4/#5 are covered; s-token balances stay nonnegative because the patched #5 forces another merge. Each element encounters O(1 + log(n/r)) height levels (height after starting sequence ≤ 4 + 2 log2(n/r)), so total tokens minted sum to O(∑ r (1 + log(n/r))) = O(n + nH). This equals ending-sequence merge cost.
- Final collapse: handled by appending a sentinel run (> n) or charged O(n).

Plan for sharp (3/2)·nH + O(n)
- Use potential Φ(r) = (3/2) r log2 r. Balanced merges (sizes within a factor φ^2) satisfy cost ≤ ΔΦ. Group the remaining merges in each ending sequence into singletons or pairs so that each group’s cost ≤ ΔΦ(group), except possibly the first group which exceeds by ≤ r (length of the just-pushed run). These r-slacks sum to O(n). Hence total merge cost ≤ ΔΦ + O(n) = (3/2)·n·H + O(n). Lower bound: Buss–Knop family gives ≥ (3/2)·n·H − O(n).

Assumptions
- Python’s corrected TimSort (with case #5). Galloping only reduces comparisons. Converting merge cost to comparisons adds O(n).

Next
- Write up proofs in proofs.md (coarse and sharp bounds) and adjust output.md to state the corrected main theorem (3/2 factor).

## Coarse entropy bound with explicit constants (Python-patched TimSort)

- We finalize the coarse bound comparisons = O(n + nH). Using the stack invariant and the starting/ending split:
  - Starting sequences: total merge cost ≤ γ n with γ = 2\sum_{j\ge1} j\,2^{-j/2} = 6\sqrt{2} + 8 \approx 16.485.
  - Ending sequences: token scheme (2 c + 1 s credited per height decrease) and the height bound h ≤ 4 + 2 log2(n/r) imply ending-sequence merge cost ≤ 12 n + 6 n H.
- Immediate follow-up after #4/#5 (patched case #5): every #4/#5 merge is followed by another merge in the same ending sequence, ensuring s-tokens are re-credited before reuse.
- Final collapse is absorbed by appending a sentinel run of length > n (or charged O(n)), so all merges are within the main loop.
- Hence comparisons ≤ merge cost + O(n) ≤ (γ + 12) n + 6 n H.
- Sharp bound remains (3/2)·n·H + O(n) via the potential method; to be written with the balanced-merge, forbidden-pattern, and pairing/grouping lemmas.