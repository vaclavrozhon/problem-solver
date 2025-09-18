Setup and notation
- Fix n ≥ 2. Let Z = diag(z_1,…,z_n). Let L be the subdiagonal shift (ones on (i+1,i)) and U the superdiagonal shift (ones on (i,i+1)). Set S = L − U. Then M = Z + S. Let W = diag(1,2,…,n).
- We use e_k for the elementary symmetric polynomials in the variables z_1,…,z_n and h_k for the complete homogeneous ones. (These are symmetric polynomials in the diagonal entries; they are not the characteristic-polynomial coefficients of M unless explicitly stated.)

Lemma 1 (continuant recurrence and first coefficients)
Let P_k(λ) = det(λ I − M_{[k]}) for the leading k×k principal submatrix M_{[k]}. Then P_0=1, P_1=λ − z_1, and for k ≥ 2
P_k(λ) = (λ − z_k) P_{k−1}(λ) + P_{k−2}(λ).
Writing P_k(λ) = λ^k + a_{k,1} λ^{k−1} + a_{k,2} λ^{k−2} + a_{k,3} λ^{k−3} + ⋯, we have
- a_{k,1} = −∑_{j=1}^k z_j.
- a_{k,2} = ∑_{1≤i<j≤k} z_i z_j + (k − 1).
- a_{k,3} = −∑_{1≤i<j<ℓ≤k} z_i z_j z_ℓ − (k − 3)∑_{j=1}^k z_j − (z_1 + z_k).
Proof. By induction, comparing coefficients in the recurrence. ∎

Lemma 2 (trace identities for squares and cubes)
With M = Z + S and diag(S^2) = (−1, −2,…, −2, −1),
- tr(M^2) = ∑_{i=1}^n z_i^2 − 2(n − 1).
- tr(M^3) = ∑_{i=1}^n z_i^3 − 6∑_{i=1}^n z_i + 3(z_1 + z_n).
Proof. Expand (Z+S)^2 and (Z+S)^3, use cyclicity of trace, S_{ii}=0, tr(S^3)=0, and tr(Z S^2) = ∑ z_i (S^2)_{ii} = −(2∑ z_i − (z_1+z_n)). ∎

Lemma 3 (tr(A^4) and tr(M^4))
Let A = S = L − U. Then tr(A^4) = 6n − 10. Moreover,
tr(M^4) = ∑_{i=1}^n z_i^4 − 4 z_1^2 − 8∑_{i=2}^{n−1} z_i^2 − 4 z_n^2 − 4 ∑_{i=1}^{n−1} z_i z_{i+1} + (6n − 10).
Proof. S^2 has diagonal −1 at i=1,n and −2 otherwise, and ones on the second off-diagonals. Thus tr(A^4) = tr((S^2)^2) equals the sum of squared row norms of S^2: 2 at i=1,n; 5 at i=2,n−1; and 6 for 3≤i≤n−2, giving 6n−10. For M^4, expand (Z+S)^4. Terms with an odd number of S have zero trace. The 2-S terms, up to cyclic equivalence, are 4 tr(Z^2 S^2) + 2 tr(Z S Z S). Compute tr(Z^2 S^2) = ∑ z_i^2 (S^2)_{ii} = − z_1^2 − 2∑_{i=2}^{n−1} z_i^2 − z_n^2, and tr(Z S Z S) = −2 ∑_{i=1}^{n−1} z_i z_{i+1}. Add tr(Z^4) and tr(S^4). ∎

Lemma 4 (boundary entries at k=n and k=n+1)
Let α_m := (M^m)_{n,1}. Then
- α_n = ∑_{i=1}^n z_i.
- α_{n+1} = h_2(z) − (n − 1) = ∑_{1≤i≤j≤n} z_i z_j − (n − 1).
Proof. Count admissible words in {L, −U, Z} that send 1→n. For m=n, exactly n−1 L moves and one Z at any visited vertex: sum of z_i. For m=n+1, either two Z and n−1 L (contributing h_2) or one U and n L. Valid U positions are 2,…,n, each giving weight −1; total −(n−1). ∎

Proposition 5 (boundary entry at k = n+2)
For n ≥ 2,
(M^{n+2})_{n,1} = h_3(z) − (n+1)∑_{i=1}^n z_i + (z_1 + z_n).
Proof. Decompose by number of U’s. If u=0, the path is monotone with n−1 L and 3 Z at visited vertices, contributing h_3. If u=1, the L/U skeleton is W_t = L^{t−1} U L^{n+1−t}, t=2,…,n. For a fixed t, the index trajectory visits each interior level twice except the endpoints according to a simple peak at t. Counting visits of level j across all t gives coefficients c_1=c_n=n and c_j=n+1 for 2≤j≤n−1. Inserting the single Z contributes −∑ c_j z_j = −[(n+1)∑ z_i − (z_1+z_n)]. Summing the two classes yields the formula. ∎

Proposition 6 (λ^{n−4} coefficient via matchings)
Let Δ_n(λ) = det(λ I − M). Then the coefficient of λ^{n−4} is
c_{n−4} = e_4 + Q + C(n−2,2),
where Q = ∑_{edges e} ∑_{i<j, i,j ∉ V(e)} z_i z_j = ∑_{1≤i<j≤n} c(i,j) z_i z_j with
c(i,j) = (n − 1) − deg(i) − deg(j) + 1_{|i−j|=1},
where deg(1)=deg(n)=1 and deg(i)=2 otherwise. Equivalently,
Q = (n − 1) e_2 − e_1 
\Big(\sum_{i=1}^n deg(i) z_i\Big) + \sum_{i=1}^n deg(i) z_i^2 + \sum_{i=1}^{n−1} z_i z_{i+1}.
Proof. The continuant/matching expansion on the path P_n shows that to get λ^{n−4} we must take matchings of size m with (n−2m) = n−4 → m ∈ {0,1,2}. For m=0 we obtain e_4. For m=2 we get +1 per 2-edge matching, i.e., C(n−2,2). For m=1, we pick an edge e and then two z’s among vertices not incident to e, giving Q. The closed form for Q follows from c(i,j) as stated and the identity ∑_{i<j} (deg(i)+deg(j)) z_i z_j = e_1∑ deg(i) z_i − ∑ deg(i) z_i^2. ∎

Lemma 7 (weighted traces)
With W=diag(1,…,n),
- tr(W M) = ∑_{i=1}^n i (M)_{ii} = ∑_{i=1}^n i z_i.
- tr(W M^2) = ∑_{i=1}^n i z_i^2 − (n^2 − 1).
- tr(W M^3) = ∑_{i=1}^n i z_i^3 − 6\sum_{i=2}^{n−1} i z_i − 4 z_1 − (3n − 1) z_n.
Proof. For tr(W M), M is diagonal+off-diagonal with zero off-diagonal contribution to the trace. For tr(W M^2), compute (M^2)_{ii} = z_i^2 − 1 if i∈{1,n} and z_i^2 − 2 otherwise, then sum with weights i to get ∑ i z_i^2 − [1 + 2∑_{i=2}^{n−1} i + n] = ∑ i z_i^2 − (n^2 − 1). For tr(W M^3), expand (Z+S)^3 and use cyclicity to eliminate all one-S terms: tr(W Z^2 S)=tr(S W Z^2)=0, tr(W Z S Z)=tr(Z W Z S)=0, tr(W S Z^2)=tr(Z^2 W S)=0. The two-S terms are tr(W Z S^2)+tr(W S Z S)+tr(W S^2 Z). Since W and Z commute, tr(W Z S^2)=tr(W S^2 Z)=∑ i i z_i (S^2)_{ii} and tr(W S Z S)=tr(S W S Z)=∑ z_i (S W S)_{ii}. Using (S^2)_{ii} = −1 for i∈{1,n}, −2 otherwise, and (S W S)_{11}=−2, (S W S)_{ii}=−2i for 2≤i≤n−1, (S W S)_{nn}=−(n−1), yields the stated formula after adding tr(W Z^3)=∑ i i z_i^3. ∎

Lemma (Weighted Laplacian identity for tr(diag(w) A Z A)).
Let A = L − U, Z = diag(z_1,…,z_n), and let w=(w_1,…,w_n) be any scalars with boundary convention w_0=w_{n+1}=0. Then
 2∑_{i=1}^n w_i z_i + tr(diag(w)·A Z A) = −∑_{i=1}^n (w_{i+1} − 2 w_i + w_{i−1}) z_i.
Proof. Since A has A_{i,i−1}=1 and A_{i,i+1}=−1, we have (A Z A)_{ii} = ∑_k A_{ik} z_k A_{ki} = −(z_{i−1}+z_{i+1}) (with z_0=z_{n+1}=0). Hence
 tr(diag(w) A Z A) = ∑_{i} w_i (A Z A)_{ii} = −∑_{i} w_i (z_{i−1}+z_{i+1}) = −∑_{i} (w_{i+1}+w_{i−1}) z_i,
after reindexing. Therefore
 2∑_{i} w_i z_i + tr(diag(w) A Z A) = ∑_{i} (2 w_i − w_{i+1} − w_{i−1}) z_i = −∑_{i} (w_{i+1} − 2 w_i + w_{i−1}) z_i.
∎

Corollary (Linear weights). For w_i=i and w^-_i=n+1−i, we obtain
- 2∑ i z_i + tr(W A Z A) = (n+1) z_n and 2∑ (n+1−i) z_i + tr(W^- A Z A) = (n+1) z_1.
In particular, if ∑ z_i = 0 and ∑ i z_i = 0, then tr(W A Z A) = (n+1) z_n and tr(W^- A Z A) = (n+1) z_1. The explicit expansions are
 tr(W A Z A) = −2 z_1 − 2∑_{i=2}^{n−1} i z_i − (n−1) z_n,
 tr(W^- A Z A) = −(n−1) z_1 − 2∑_{i=2}^{n−1} (n+1−i) z_i − 2 z_n.
These follow by direct evaluation of (A Z A)_{ii} and simple index shifts.
∎

Lemma 5 (boundary entry at k = n+2).
Let M = Z + L − U with Z = diag(z_1,…,z_n), L the subdiagonal shift, U the superdiagonal shift, and define α_m := (M^m)_{n,1}. Then for all n ≥ 2,
α_{n+2} = h_3(z_1,…,z_n) − [(n+1)∑_{i=1}^n z_i − (z_1 + z_n)].
Proof. A word of length n+2 that maps 1 to n has net displacement n−1. If s is the number of diagonal steps Z and r the number of U-steps, with ℓ L-steps, we have r + ℓ + s = n+2 and ℓ − r = n−1, hence r = (3 − s)/2 and s ∈ {1,3}. Two disjoint types contribute: (i) s=3,r=0,ℓ=n−1: no U and three Z’s inserted among the monotone L-chain visiting 1,2,…,n. This contributes h_3(z). (ii) s=1,r=1,ℓ=n: one U and one Z. The L/U skeleton has the form L^a U L^{n−a} for 1 ≤ a ≤ n−1 (U cannot be first or last). For a fixed a, there are n+2 slots to insert the Z (before each step and after the last). The index sequence along these slots is 1,2,…,a,a+1,a,a+1,…,n. Summing over a gives slot-visit counts c_1=c_n=n and c_j=n+1 for 2≤j≤n−1. Each such word has weight −z_{current} from the U and the Z, hence the total contribution is −∑ c_j z_j = −[(n+1)∑ z_i − (z_1+z_n)]. Summing (i) and (ii) yields the formula. ∎

Proposition 6 (redundancy of c_{n−4} with tr(M^4)).
Let Δ_n(λ) = det(λ I − M), and let c_{n−4} be the coefficient of λ^{n−4}. Then
c_{n−4} = e_4 + Q + C(n−2,2),
with Q = ∑_{i<j} c(i,j) z_i z_j, where c(i,j) = (n−1) − deg(i) − deg(j) + 1_{|i−j|=1}, deg(1)=deg(n)=1, deg(i)=2 otherwise. Assume M is nilpotent so e_1 = 0 and e_2 = −(n−1) (equivalently, ∑ z_i^2 = 2(n−1)). Then c_{n−4}=0 is equivalent to tr(M^4)=0.
Proof. Under e_1=0, Q = (n−1)e_2 + ∑ deg(i) z_i^2 + ∑_{i=1}^{n−1} z_i z_{i+1} = −(n−1)^2 + (z_1^2 + z_n^2) + 2∑_{i=2}^{n−1} z_i^2 + A, where A = ∑_{i=1}^{n−1} z_i z_{i+1}. Using ∑ z_i^2 = 2(n−1), we obtain c_{n−4} = e_4 + A − (z_1^2 + z_n^2) + (−n^2 + 7n − 4)/2. On the other hand, with A as above,
tr(M^4) = ∑ z_i^4 − 4(z_1^2 + z_n^2) − 8∑_{i=2}^{n−1} z_i^2 − 4A + (6n − 10) = p_4 + 4(z_1^2 + z_n^2) − 4A − 10n + 6,
where p_4 = ∑ z_i^4 and we used ∑ z_i^2 = 2(n−1). Newton’s identity with e_1=0 gives p_4 = − e_2 p_2 − 4 e_4 = 2(n−1)^2 − 4 e_4. Substituting, tr(M^4)=0 is equivalent to e_4 − (z_1^2 + z_n^2) + A + (−n^2 + 7n − 4)/2 = 0, which is exactly c_{n−4}=0. ∎

Lemma 7 (weighted quadratic trace).
Let W = diag(1,2,…,n). Then for all z,
tr(W M^2) = ∑_{i=1}^n i z_i^2 − (n^2 − 1).
Proof. (M^2)_{ii} = z_i^2 − 1 for i ∈ {1,n} and z_i^2 − 2 for 2 ≤ i ≤ n−1. Hence tr(W M^2) = ∑ i i (z_i^2 − α_i) with α_1=α_n=1 and α_i=2 otherwise. The weighted constant is ∑ i α_i = 1 + 2∑_{i=2}^{n−1} i + n = n^2 − 1. ∎

Lemma 8 (kernel summation-by-parts identities).
If v ≠ 0 satisfies M v = 0, then
(i) ∑_{i=1}^n z_i v_i^2 = 0.
(ii) ∑_{i=1}^n i z_i v_i^2 = −∑_{i=1}^{n−1} v_i v_{i+1}.
Proof. The equations M v = 0 read: z_1 v_1 − v_2 = 0; v_{i−1} + z_i v_i − v_{i+1} = 0 for 2 ≤ i ≤ n−1; v_{n−1} + z_n v_n = 0. Multiply the i-th equation by v_i and sum to obtain (i). Multiplying by i v_i and summing yields (ii) after telescoping the off-diagonal terms. ∎