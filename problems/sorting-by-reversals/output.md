Statements and proofs curated so far

Setup and notation
- Let n=2^d. An array A is a permutation of [0,…,n−1]. For j∈{0,…,d−1}, color each entry of A by the j-th bit of its value and let B_j(A) be the number of monochromatic runs in this 2-coloring. Let T_j(A)⊆{1,…,n−1} be the set of indices i where the j-color flips between positions i and i+1 (so |T_j(A)|=B_j(A)−1). A single step A→A′ is a parallel block transposition (PBT): a product of disjoint swaps of adjacent contiguous interval pairs (L,R). Such a step changes adjacencies only at the three interface indices of each pair (left outer, inner, right outer; omitting outer ones at the array ends).

Theorem 1 (Model equivalence to PBT). A single step of the model (swapping a family of disjoint adjacent interval pairs in parallel) is exactly a parallel block transposition (PBT) step.
Proof. A step chooses disjoint adjacent pairs (L_k,R_k) of intervals and swaps each pair simultaneously, leaving all other positions untouched. This is precisely a product of disjoint adjacent block transpositions. Conversely, any product of disjoint adjacent block transpositions can be realized by choosing those pairs. ∎

Theorem 2 (Endpoint run-counts). Let n=2^d and A_0 be the bit-reversal permutation of [0,…,n−1]. For j∈{0,…,d−1}:
- B_j(A_0)=2^{j+1}.
- For the fully sorted order A_*=[0,1,…,n−1], B_j(A_*)=2^{d−j}.
Consequently, with D_j(A):=|log_2 B_j(A) − (d−j)|, one has Σ_{j=0}^{d−1} D_j(A_0)=Θ(d^2) and Σ_{j=0}^{d−1} D_j(A_*)=0.
Proof. In A_0, the j-bit of the value at position i equals the (d−1−j)-th bit of i; thus along positions 0,…,n−1 this bit is constant on runs of length 2^{d−1−j} and alternates every such block, giving exactly 2^{j+1} runs. In A_*, the j-bit is constant on blocks of length 2^j and alternates every 2^j positions, yielding 2^{d−j} runs. The Θ(d^2) sum follows from Σ_{j=0}^{d−1} |2j+1−d| = Θ(d^2) by symmetry around (d−1)/2. ∎

Lemma 3 (Toggle-locality identity). Let A→A′ be one PBT step and let S be the set of indices whose adjacency changes in this step (the three interfaces per pair). Then for every j,
  B_j(A′) − B_j(A) = |T_j(A′) ∩ S| − |T_j(A) ∩ S|.
In particular, Decrease_j := max{0, B_j(A) − B_j(A′)} ≤ |T_j(A) ∩ S| and Increase_j := max{0, B_j(A′) − B_j(A)} ≤ |S \ T_j(A)|.
Proof. If i∉S then the adjacent entries across i are the same in A and A′, hence i∈T_j(A) iff i∈T_j(A′). Thus T_j(A′) Δ T_j(A) ⊆ S and
|T_j(A′)|−|T_j(A)| = |T_j(A′)∩S| − |T_j(A)∩S|.
Since B_j(·)=|T_j(·)|+1, the displayed identity follows; the one-sided bounds are immediate. ∎

Lemma 4 (Per-pair ±2 bound at a fixed level). Fix j and a single swapped pair (L,R). Let Δ_pair be its contribution to ΔB_j. Then |Δ_pair| ≤ 2. Moreover, if the union U=L∪R is j-monochromatic (equivalently, contains no index of T_j(A)), then Δ_pair=0.
Proof. Only the three interface indices can change their boundary status. Let a_L be the j-color of the neighbor immediately left of L, a_R the j-color of the neighbor immediately right of R; let L_1,L_k be the first/last j-colors in L and R_1,R_m the first/last j-colors in R. Writing [·] for the indicator of inequality, the total contribution before the swap equals
  X := [a_L≠L_1] + [L_k≠R_1] + [R_m≠a_R],
and after the swap equals
  Y := [a_L≠R_1] + [R_m≠L_1] + [L_k≠a_R].
Thus Δ_pair = X − Y. Using the inequality [q≠x] − [q≠y] ≤ [x≠y] twice gives
  Δ_pair ≤ [L_1≠R_1] + [R_m≠L_k] + ([L_k≠R_1] − [R_m≠L_1]).
The binary 4-cycle inequality [p≠q]+[q≠r]+[r≠s]−[s≠p] ≤ 2, applied to (p,q,r,s)=(L_1,R_1,L_k,R_m), yields Δ_pair ≤ 2. The lower bound follows symmetrically (or by applying the argument to the inverse swap). If U is j-monochromatic then L_1=L_k=R_1=R_m and all three interface indicators are unchanged, so Δ_pair=0. ∎

Theorem 5 (Per-level factor-3 cap per step). For any array A, any j, and any single PBT step A→A′,
  B_j(A′) ≤ 3·B_j(A) and B_j(A) ≤ 3·B_j(A′).
Equivalently, |log_2 B_j| changes by at most log_2 3 in one step.
Proof. Let M_j(A) be the set of swapped pairs whose union U is not j-monochromatic in A. By disjointness of the unions, each U∈M_j(A) contains at least one index of T_j(A), and distinct U’s receive distinct such indices; hence |M_j(A)| ≤ |T_j(A)| = B_j(A)−1. Summing Lemma 4 over pairs gives
  |B_j(A′) − B_j(A)| ≤ Σ_{pairs} |Δ_pair| ≤ 2·|M_j(A)| ≤ 2(B_j(A)−1).
Therefore B_j(A′) ≤ B_j(A) + 2(B_j(A)−1) ≤ 3B_j(A). Applying the same bound to the inverse step A′→A yields B_j(A) ≤ 3B_j(A′). ∎

Theorem 6 (Dyadic alignment for A_0; weighted form). Let G_j⊆{1,…,n−1} be the set of j-run boundary indices in A_0. Then G_j = { i : 2^{d−1−j} divides i }. For any set S⊆{1,…,n−1},
  Σ_{j=0}^{d−1} |S ∩ G_j| = Σ_{i∈S} (1 + v_2(i)).
More generally, for any weights a_j≥0,
  Σ_{j=0}^{d−1} a_j·|S ∩ G_j| = Σ_{i∈S} Σ_{j: 2^{d−1−j} | i} a_j.
Proof. In A_0 the j-bit is periodic with period 2^{d−j}, so boundaries occur exactly at indices i that are multiples of 2^{d−1−j}. For fixed i, the set of j with i∈G_j has size 1+v_2(i); the weighted identity is immediate by exchanging sums. ∎

Corollary 6.1 (Weighted decrease bound from A_0). In one step A_0→A′ with changed-index set S, and any weights a_j≥0,
  Σ_{j} a_j·Decrease_j ≤ Σ_{i∈S} Σ_{j: i∈G_j} a_j.
In particular, with a_j=2^{−(j+1)} and v_2(i)=t,
  Σ_{j} 2^{−(j+1)}·Decrease_j ≤ Σ_{i∈S} 2^{−(d−t−1)}(1−2^{−(t+1)}) ≤ Σ_{i∈S} 2^{−d+t+1}.
Proof. Combine Lemma 3 with Theorem 6 and use nonnegativity of the weights; the explicit sum for a_j=2^{−(j+1)} is a direct geometric series. ∎
Theorem 7 (Hamming-sum identity across levels).
Let A be any permutation of [0,…,n−1]. For i∈{1,…,n−1}, let HD_A(i) be the Hamming distance in d-bit binary between the values at positions i and i+1. Then
- Σ_{j=0}^{d−1} (B_j(A) − 1) = Σ_{i=1}^{n−1} HD_A(i).
Moreover, for any single PBT step A→A′ with changed-adjacency set S,
- Σ_{j=0}^{d−1} (B_j(A′) − B_j(A)) = Σ_{i∈S} (HD_{A′}(i) − HD_A(i)).
Proof. For fixed i, the indicator that i∈T_j(A) is exactly the indicator that the j-th bits of the adjacent values differ; summing over j gives HD_A(i). Summing over i yields the first identity. Subtracting the identity for A from that for A′ gives Σ_j(B_j(A′)−B_j(A)) = Σ_i(HD_{A′}(i)−HD_A(i)). Since HD is unchanged outside S, the sum over all i reduces to the sum over i∈S. ∎

Corollary 7.1 (Pair-budget demand for decreases).
Let a step use m disjoint pairs and S be its set of changed indices. Then for every j,
- Decrease_j ≤ |T_j(A)∩S| ≤ |S| ≤ 3m.
In particular, achieving Decrease_j ≥ θ·B_j(A) in one step requires m ≥ (θ/3)·B_j(A).
Proof. The first inequality is Lemma 3; |S|≤3m since each pair contributes at most three changed indices. The demand bound is immediate. ∎

Lemma 7.2 (A_0 sub-run per-pair decrease bound).
Let A=A_0. Fix j and its run length L_j=2^{d−1−j}. Consider a single swapped pair (L,R) whose union U has length s< L_j, and let S_pair be the three changed indices contributed by this pair. Then |T_j(A_0)∩S_pair|≤1; consequently the per-pair decrease at level j in this step satisfies Decrease_j ≤ 1.
Proof. The three changed indices lie between the left-outer and right-outer interfaces; this integer interval has length s< L_j and hence contains at most one multiple of L_j. Since G_j=T_j(A_0) is exactly the set of multiples of L_j, at most one of the three changed indices lies in G_j. Toggle-locality gives Decrease_j ≤ |T_j(A_0)∩S_pair| ≤ 1. ∎

Theorem 8 (Large-scale weighted decrease bound from A_0).
Let A=A_0 and L=2^ℓ. For any PBT step A→A′ with changed-index set S,
- Σ_{j: L_j≥L} (L/L_j)·Decrease_j ≤ 2|S|.
Consequently, if the step uses m pairs then Σ_{j: L_j≥L} (L/L_j)·Decrease_j ≤ 6m. If, moreover, all pair lengths lie in [L,2L), then m≤n/L and hence Σ_{j: L_j≥L} (L/L_j)·Decrease_j ≤ 6n/L.
Proof. By Lemma 3 and Theorem 6 (weighted form), for any nonnegative weights a_j,
  Σ_j a_j·Decrease_j ≤ Σ_{i∈S} Σ_{j: i∈G_j} a_j.
Take a_j = (L/L_j)·1_{L_j≥L}. For i with 2-adic valuation v_2(i)=t, the inner sum equals Σ_{s=ℓ}^{t} 2^{ℓ−s} ≤ 2 (empty if t<ℓ). Summing over i∈S gives Σ_{j: L_j≥L} (L/L_j)·Decrease_j ≤ 2|S|. The two corollaries follow from |S|≤3m and, under equal-scale [L,2L) pairs, m≤n/L. ∎
Lemma 9 (Extremal 2-adic sum bound).
Let N\ge 1 and S\subseteq\{1,\dots,N\} with |S|=K\ge 1. Then
\[\sum_{i\in S} 2^{v_2(i)} \le N\,H_K,\]
where \(H_K=\sum_{\ell=1}^K 1/\ell\) is the K-th harmonic number.
Proof. Order the weights \(w(i):=2^{v_2(i)}\) in nonincreasing order as \(s_1\ge s_2\ge\cdots\ge s_N\). For each integer \(t\ge 0\), at most \(\lfloor N/2^t\rfloor\) integers have \(v_2\ge t\), hence at most \(\lfloor N/2^t\rfloor\) weights are \(\ge 2^t\). Therefore, for every \(\ell\ge 1\),
\[s_\ell\le \max\{2^t: N/2^t\ge \ell\}\le N/\ell.\]
Thus \(\sum_{i\in S}2^{v_2(i)}\le \sum_{\ell=1}^K s_\ell\le \sum_{\ell=1}^K (N/\ell) = N H_K.\quad\square\)

Theorem 9 (Small-scale fractional decrease bound at A_0).
Let \(n=2^d\), \(A=A_0\) (bit-reversal), and \(L=2^\ell\). For any single PBT step \(A_0\to A'\) with changed-index set \(S\subseteq\{1,\dots,n-1\}\),
\[\sum_{j: L_j<L} \frac{\mathrm{Decrease}_j}{B_j(A_0)} \le \frac{2}{nL}\sum_{i\in S} 2^{v_2(i)}.\]
Proof. By toggle-locality (Lemma 3) and the weighted dyadic identity (Theorem 6), for nonnegative weights \(a_j\),
\[\sum_j a_j\,\mathrm{Decrease}_j \le \sum_{i\in S}\sum_{j: i\in G_j} a_j.\]
Choose \(a_j=(1/L)\,\mathbf{1}_{\{L_j<L\}}\,2^{-(j+1)}=(1/L)\,\mathbf{1}_{\{d-1-j<\ell\}}\,2^{-(j+1)}\). For fixed \(i\) with \(v_2(i)=t\), the inner sum is
\[(1/L)\sum_{j: i\in G_j,\;L_j<L} 2^{-(j+1)}= (1/L)\,2^{-d}\sum_{s=0}^{\min\{t,\ell-1\}}2^s \le (1/L)\,2^{-d}\sum_{s=0}^{t}2^s \le (1/L)\,2^{t+1-d}.\]
Summing over \(i\in S\) gives
\(\sum_{j: L_j<L} \mathrm{Decrease}_j/B_j(A_0) \le (2/(nL))\sum_{i\in S}2^{v_2(i)}\).\quad\square

Corollary 9.1 (Extremal control and equal-scale specialization).
With notation as in Theorem 9, let \(K=|S|\). Then
\[\sum_{j: L_j<L} \frac{\mathrm{Decrease}_j}{B_j(A_0)} \le \frac{2}{nL}\,(n-1)\,H_K \le \frac{2}{L}\,H_K.\]
In particular, if the step uses \(m\) disjoint pairs then \(K\le 3m\) and
\[\sum_{j: L_j<L} \frac{\mathrm{Decrease}_j}{B_j(A_0)} \le \frac{2}{L}\,H_{3m}=O\!\left(\frac{\log m}{L}\right).\]
If, moreover, all pair lengths lie in \([L,2L)\) (equal-scale), then \(m\le n/L\), hence
\[\sum_{j: L_j<L} \frac{\mathrm{Decrease}_j}{B_j(A_0)} = O\!\left(\frac{\log(n/L)}{L}\right).\]
Proof. Apply Lemma 9 with \(N=n-1\), then use \(K\le 3m\) and \(m\le n/L\).\quad\square

Corollary 9.2 (Counting active small-scale levels).
Fix \(\theta\in(0,1]\). Under the hypotheses of Theorem 9, the number of indices \(j\) with \(L_j<L\) and \(\mathrm{Decrease}_j\ge \theta\,B_j(A_0)\) is at most \(\frac{2}{\theta L}H_K\); in particular, in equal-scale steps it is \(O((\log(n/L))/(\theta L))\).
Proof. By Markov’s inequality on the nonnegative sum in Theorem 9 combined with Corollary 9.1.\quad\square

Theorem 10 (Geometric-window weighted cross-level bound at A_0).
Fix \(\beta\in(0,1/2)\) and a home scale \(L=2^\ell\). Define weights \(a_j(L):=\beta^{\,| (d-1-j) - \ell |}/2^{j+1}\). For any single PBT step \(A_0\to A'\) with changed-index set \(S\),
\[\sum_{j=0}^{d-1} a_j(L)\,\mathrm{Decrease}_j \le C_\beta\,(L/n)\,|S|,\quad\text{where}\quad C_\beta:=\frac{1}{1-\beta/2}+\frac{1}{1-2\beta}.\]
In particular, if all pair lengths lie in \([L,2L)\), then \(|S|\le 3m\le 3n/L\) and thus \(\sum_j a_j(L)\,\mathrm{Decrease}_j\le 3C_\beta=O(1)\).
Proof. By Lemma 3 and Theorem 6 with weights \(a_j(L)\),
\[\sum_j a_j(L)\,\mathrm{Decrease}_j \le \sum_{i\in S}\sum_{j: i\in G_j} a_j(L).\]
For \(i\) with \(v_2(i)=t\), writing \(s=d-1-j\),
\[\sum_{j: i\in G_j} a_j(L)=\sum_{s=0}^{t} \beta^{\,|s-\ell|}\,2^{s-d}=2^{-d}\Big(\sum_{s=0}^{\ell} \beta^{\ell-s}2^{s}+\sum_{s=\ell}^{t} \beta^{s-\ell}2^{s}\Big)\le 2^{-d}\,2^{\ell}\Big(\tfrac{1}{1-\beta/2}+\tfrac{1}{1-2\beta}\Big)=C_\beta\,(L/n).\]
Summing over \(i\in S\) yields the claim; the equal-scale consequence follows from \(|S|\le 3m\le 3n/L\).\quad\square
