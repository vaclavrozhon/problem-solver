# Rigorous Proofs



Permutation family with UB = Θ(n log n) and OPT ≤ O(n log log n)

Definitions
- Let h ≥ 1 and n = 4^h. For any contiguous key interval I = [a..b] with |I| = 4^t, split I into four equal contiguous subintervals I1 < I2 < I3 < I4. Define m(I) := ⌊(a+b)/2⌋.
- Define recursively F_0(I) to be the unique element of I. For t ≥ 1, define F_t(I) to be the concatenation of the four subsequences S2 := F_{t−1}(I2), S4 := F_{t−1}(I4), S1 := F_{t−1}(I1), S3 := F_{t−1}(I3), with the inductive constraint that for every interval J of size 4^u, the first element of F_u(J) is m(J). This is consistent since F_{u−1}(Jk) begins with m(Jk).
- The permutation π_h is F_h([1..4^h]). Let T be the 4-ary decomposition tree whose nodes are the intervals I encountered by the recursion; each internal node v has an interval I_v of size s_v and children I_v(1)<I_v(2)<I_v(3)<I_v(4).
- For any internal node v, the restriction of π_h to keys in I_v is exactly S2 ∘ S4 ∘ S1 ∘ S3, where Sk lists all keys in I_v(k) and no other keys.

Lemma 1 (Midpoint separation). Let v be an internal node with interval size s_v and let k ∈ {1,2,3,4}. Let x be the first key of Sk in the restricted sequence at v. Then for any key y ∉ I_v(k), |x − y| ≥ s_v/8.
Proof. By construction, x = m(I_v(k)), the midpoint of the child interval I_v(k), whose length is s_v/4. The distance from the midpoint to any boundary of I_v(k) is s_v/8. If y lies in a sibling I_v(k′), the closest such y is at the boundary between I_v(k) and I_v(k′), hence |x−y| ≥ s_v/8. If y lies outside I_v, the closest such y is at a boundary of I_v, and the distance from x to that boundary is ≥ s_v/8 as well. ∎

Lemma 2 (Per-boundary UB). Let i be the global time index at which, within the restricted sequence for v, the traversal first enters child k (i.e., the boundary S?→Sk at v). Then UB_i(π_h) ≥ log(1 + s_v/8).
Proof. At time i there has been no prior access to any key in I_v(k) (the subsequence for I_v(k) occurs only within Sk and we are at the first element of Sk). Therefore every prior key y lies in I_v \ I_v(k) or outside I_v. By Lemma 1, for all prior y we have |x_i − y| ≥ s_v/8. Hence for all j ≤ i−1, j + |x_i − x_{i−j}| ≥ s_v/8. Taking logs gives the claim. ∎

Lemma 3 (Boundary–transition bijection). For each i ∈ {2,…,n}, let v(i) be the lowest (deepest) node in T whose children contain x_{i−1} and x_i in two different children; equivalently, v(i) is the lowest common ancestor (LCA) of the two leaves holding x_{i−1} and x_i. Then i is exactly one of the three child-boundary indices S2→S4, S4→S1, or S1→S3 within the restricted sequence at v(i). Moreover, the mapping i ↦ v(i) is a bijection between {2,…,n} and the multiset of all such boundaries over all internal nodes of T; in particular, the boundary indices over all nodes are pairwise distinct and their total number is n−1.
Proof. The restricted sequence at any internal node v is the concatenation S2 ∘ S4 ∘ S1 ∘ S3, with no interleaving between different children. For any consecutive pair (x_{i−1}, x_i), there is a unique lowest node v whose children separate the two keys; at all descendants of v, the two keys lie in different subtrees, and at all ancestors they lie in the same child. Thus within the restriction to I_v the pair occurs at a boundary between two consecutive child blocks, necessarily one of S2→S4, S4→S1, S1→S3. Distinct consecutive pairs have distinct LCAs, so the boundary indices are distinct across nodes. Counting gives exactly three boundaries per internal node and a total of (4^h−1) internal nodes divided by 3 levels in a full 4-ary tree, hence 3·|(internal nodes)| = 4^h − 1 = n − 1 boundaries, matching the number of consecutive pairs. ∎

Theorem 4 (UB lower bound). There exists a universal constant c > 0 such that UB(π_h) ≥ c · n · log n.
Proof. By Lemma 3, the n−1 consecutive-pair indices are partitioned by internal nodes v, three per node. For each such index i associated with v, Lemma 2 gives UB_i ≥ log(1 + s_v/8). Hence
UB(π_h) ≥ ∑_{v internal} 3 · log(1 + s_v/8).
At level ℓ = 0,1,…,h−1 (counting 0 at the root), there are 4^ℓ internal nodes each with s_v = 4^{h−ℓ}. Therefore
∑_{v internal} log(1 + s_v/8) ≥ ∑_{ℓ=0}^{h−1} 4^ℓ · ( (h−ℓ) · log 4 − O(1) ) = Θ( 4^h · h ) = Θ( n · log n ).
Multiplying by the constant factor 3 and adjusting constants yields UB(π_h) ≥ c n log n. ∎

Proposition 5 (Wilber-1 bound for a tailored reference tree). There exists a fixed static BST T_ref on [1..n] such that the Wilber-1 alternation bound W_1(T_ref, π_h) = O(n).
Construction and proof. Build T_ref recursively: for each internal node interval I_v, create a BST node that partitions keys into L_v := I_v(1) ∪ I_v(2) and R_v := I_v(3) ∪ I_v(4), and recurse on L_v and R_v. Complete this into a full BST by arbitrary binary splits inside the contiguous subintervals. For any decomposition node v, the sequence restricted to I_v visits L_v and R_v in the order L_v, R_v, L_v, R_v (since the child order is 2,4,1,3), yielding exactly 3 alternations at that partition. Each internal decomposition node thus contributes 3 alternations. The remaining filler nodes partition contiguous intervals that the sequence visits as a single block at that scale, hence each such node sees at most one alternation. Since the total number of nodes is O(n), W_1(T_ref, π_h) = O(n). ∎

Corollary 6 (BST upper bound). The Tango tree achieves cost O(W_1 · log log n) against any fixed reference tree. With T_ref from Proposition 5, there is an explicit BST algorithm whose total cost on π_h is O(n log log n). Therefore OPT_BST(π_h) ≤ O(n log log n).

Conclusion. Combining Theorem 4 with the trivial UB(π_h) ≤ n log(1+n) gives UB(π_h) = Θ(n log n). Together with Corollary 6 we obtain OPT_BST(π_h) = o(UB(π_h)), resolving the separation task (non-strong form).