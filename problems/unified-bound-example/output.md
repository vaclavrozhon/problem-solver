# Main Results



Result: An explicit permutation family with UB = Θ(n log n) and OPT_BST ≤ O(n log log n)

Setup
- Let n = 4^h. Define a permutation π_h by recursively partitioning [1..n] into four equal contiguous key blocks I1<I2<I3<I4. The time order at each node is 2,4,1,3 (2413 inflation). Impose the midpoint-first constraint: for every interval J of size 4^t, the first key emitted by its subsequence is the midpoint m(J).

Unified-bound lower bound
- For an internal node v with interval size s_v, at the time i when the sequence first enters a child block within v (i.e., at boundaries S2→S4, S4→S1, S1→S3), the accessed key x_i is the midpoint of that child. No earlier access lies in that child, hence every earlier key y is outside it. The midpoint is at rank-distance ≥ s_v/8 from any such y. Therefore UB_i ≥ log(1 + s_v/8).
- Each pair of consecutive accesses (x_{i−1}, x_i) has a unique lowest common ancestor v in the 4-ary decomposition tree; within v’s restricted sequence this pair occurs at one of the three child-boundaries. These boundary indices over all v are pairwise distinct and total n−1.
- Summing UB_i over these n−1 indices yields ∑_v 3·log(1 + s_v/8). There are 4^ℓ nodes at level ℓ with s_v = 4^{h−ℓ}; thus the sum is Θ(∑_{ℓ=0}^{h−1} 4^ℓ (h−ℓ)) = Θ(n log n). Since trivially UB(π_h) ≤ n log(1+n), we conclude UB(π_h) = Θ(n log n).

BST upper bound
- Fix a static reference BST T_ref that, at each node of the decomposition, splits keys into L := I1∪I2 and R := I3∪I4 and recurses; fill contiguous subintervals arbitrarily to form a full BST. For any decomposition node, the restricted sequence visits L and R in the pattern L,R,L,R, so exactly 3 alternations occur at that partition. Filler nodes on contiguous intervals contribute at most one alternation each. Hence Wilber-1(T_ref, π_h) = O(n).
- Tango trees achieve cost O(W_1 · log log n) against any fixed reference tree. Therefore there is an explicit BST algorithm with total cost O(n log log n) on π_h, implying OPT_BST(π_h) ≤ O(n log log n).

Conclusion
- The family {π_h} yields UB(π_h) = Θ(n log n) while OPT_BST(π_h) ≤ O(n log log n). Consequently OPT_BST(π_h) / UB(π_h) = O(log log n / log n) = o(1), providing the requested separation (not yet the strongest O(n) vs Ω(n log n)).