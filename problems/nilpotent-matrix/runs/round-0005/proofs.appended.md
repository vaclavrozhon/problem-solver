Setup and notation
- Fix n ≥ 2. Let Z = diag(z_1,…,z_n). Let L be the subdiagonal shift (ones on (i+1,i)) and U the superdiagonal shift (ones on (i,i+1)). Set S = L − U and M = Z + S. Let W = diag(1,2,…,n). Denote by e_k (resp. h_k) the elementary (resp. complete homogeneous) symmetric polynomials in z_1,…,z_n.

Lemma 1 (continuant recurrence and first coefficients)
Let P_k(λ) = det(λ I − M_{[k]}) for the leading k×k principal submatrix M_{[k]}. Then P_0(λ)=1, P_1(λ)=λ − z_1, and for k ≥ 2
P_k(λ) = (λ − z_k) P_{k−1}(λ) + P_{k−2}(λ).
Writing P_k(λ) = λ^k + a_{k,1} λ^{k−1} + a_{k,2} λ^{k−2} + a_{k,3} λ^{k−3} + ⋯, we have
- a_{k,1} = −∑_{j=1}^k z_j.
- a_{k,2} = ∑_{1≤i<j≤k} z_i z_j + (k − 1).
- a_{k,3} = −∑_{1≤i<j<ℓ≤k} z_i z_j z_ℓ − (k − 3)∑_{j=1}^k z_j − (z_1 + z_k).
Proof. By induction comparing coefficients in P_k = (λ − z_k) P_{k−1} + P_{k−2}. ∎

Lemma 2 (trace identities for squares and cubes)
With M = Z + S and diag(S^2) = (−1, −2,…, −2, −1),
- tr(M^2) = ∑_{i=1}^n z_i^2 − 2(n − 1).
- tr(M^3) = ∑_{i=1}^n z_i^3 − 6∑_{i=1}^n z_i + 3(z_1 + z_n).
Proof. Expand (Z+S)^2 and (Z+S)^3; one-S terms vanish on the diagonal; S^3 is skew-symmetric with zero diagonal; tr(Z S^2) = ∑ z_i (S^2)_{ii} = −(2∑ z_i − (z_1+z_n)). ∎

Lemma 3 (tr(S^4) and tr(M^4))
Let S = L − U. Then tr(S^4) = 6n − 10. Moreover,
tr(M^4) = ∑_{i=1}^n z_i^4 − 4 z_1^2 − 8∑_{i=2}^{n−1} z_i^2 − 4 z_n^2 − 4 ∑_{i=1}^{n−1} z_i z_{i+1} + (6n − 10).
Proof. S^2 has diagonal −1 at i=1,n and −2 otherwise, and ones on second off-diagonals. Thus tr(S^4) = tr((S^2)^2) equals the sum of squared row norms of S^2: 2 at i=1,n; 5 at i=2,n−1; and 6 for 3≤i≤n−2, summing to 6n−10. For tr(M^4), expand (Z+S)^4. Odd-in-S terms have zero trace. Among two-S terms, up to cyclicity, four copies of tr(Z^2 S^2) and two copies of tr(Z S Z S) appear. Compute tr(Z^2 S^2) = ∑ z_i^2 (S^2)_{ii} = − z_1^2 − 2∑_{i=2}^{n−1} z_i^2 − z_n^2, and tr(Z S Z S) = ∑_{i,j} z_i S_{i j} z_j S_{j i} = −2 ∑_{i=1}^{n−1} z_i z_{i+1}. Add tr(Z^4) and tr(S^4). ∎

Lemma 4 (boundary entries at k=n and k=n+1)
Let α_m := (M^m)_{n,1}. Then
- α_n = ∑_{i=1}^n z_i.
- α_{n+1} = h_2(z) − (n − 1) = ∑_{1≤i≤j≤n} z_i z_j − (n − 1).
Proof. For m=n: paths from 1 to n of length n use exactly n−1 L’s and one Z at a visited vertex, yielding ∑ z_i. For m=n+1: either two Z and n−1 L (contributing h_2), or one U and n L; U cannot be first/last, so there are n−1 valid placements, each contributing −1. ∎

Proposition 5 (boundary entry at k = n+2)
For n ≥ 2,
(M^{n+2})_{n,1} = h_3(z) − (n+1)∑_{i=1}^n z_i + (z_1 + z_n).
Proof. Split by number of U’s. If u=0, the monotone path has n−1 L and 3 Z at visited vertices, contributing h_3. If u=1, the skeleton is L^{a−1} U L^{n+1−a} with 2≤a≤n. Across the n+2 slots for the single Z, level i appears with multiplicity c_i where c_1=c_n=n and c_i=n+1 for 2≤i≤n−1. The contribution is −∑ c_i z_i = −[(n+1)∑ z_i − (z_1+z_n)]. Sum the two classes. ∎

Proposition 6 (λ^{n−4} coefficient via matchings)
Let Δ_n(λ) = det(λ I − M). Then the coefficient of λ^{n−4} is
c_{n−4} = e_4 + Q + C(n−2,2),
with Q = ∑_{edges e} ∑_{i<j, i,j ∉ V(e)} z_i z_j = ∑_{1≤i<j≤n} c(i,j) z_i z_j,
where c(i,j) = (n − 1) − deg(i) − deg(j) + 1_{|i−j|=1} and deg(1)=deg(n)=1 while deg(i)=2 for 2≤i≤n−1.
Equivalently,
Q = (n − 1) e_2 − e_1 
\Big(\sum_{i=1}^n deg(i) z_i\Big) + \sum_{i=1}^n deg(i) z_i^2 + \sum_{i=1}^{n−1} z_i z_{i+1}.
Proof. By the continuant/matching expansion on P_n, to obtain λ^{n−4} we must take matchings of size m with n−2m≥n−4, so m∈{0,1,2}. Case m=0 contributes e_4. Case m=2 contributes +1 per 2-edge matching, i.e., C(n−2,2). Case m=1: pick an edge e and then two z’s among vertices not incident to e, summing over edges gives Q. The closed form for Q follows from the stated c(i,j) and the identity ∑_{i<j} (deg(i)+deg(j)) z_i z_j = e_1∑ deg(i) z_i − ∑ deg(i) z_i^2. ∎

Lemma 7 (weighted traces)
With W=diag(1,…,n),
- tr(W M) = ∑_{i=1}^n i (M)_{ii} = ∑_{i=1}^n i z_i.
- tr(W M^2) = ∑_{i=1}^n i z_i^2 − (n^2 − 1).
- tr(W M^3) = ∑_{i=1}^n i z_i^3 − 6\sum_{i=2}^{n−1} i z_i − 4 z_1 − (3n − 1) z_n.
Proof. tr(WM)=∑ i M_{ii}. For tr(WM^2), (M^2)_{ii} = z_i^2 + (S^2)_{ii} with ∑ i i (S^2)_{ii} = −[(2+⋯+n) + (1+⋯+n−1)] = −(n^2−1). For tr(WM^3), expand (Z+S)^3: one-S terms and S^3 have zero diagonal. On the diagonal, (Z S^2 + S^2 Z) contributes 2 z_i (S^2)_{ii}; (S Z S) contributes −(z_{i−1}+z_{i+1}). Multiply by i and sum to obtain the stated formula. ∎

Lemma 8 (commutator identity with L)
For all k ≥ 1,
(M^{k−1})_{11} − (M^{k−1})_{nn} + ∑_{i=1}^{n−1} (z_i − z_{i+1}) (M^{k−1})_{i,i+1} = 0.
Proof. Since tr([L,M] M^{k−1}) = 0 and [L,M] = [L,Z] + E_{11} − E_{nn} with ([L,Z])_{i+1,i} = z_i − z_{i+1}, we have
0 = tr([L,Z] M^{k−1}) + (M^{k−1})_{11} − (M^{k−1})_{nn} = ∑_{i=1}^{n−1} (z_i − z_{i+1}) (M^{k−1})_{i,i+1} + (M^{k−1})_{11} − (M^{k−1})_{nn}. ∎