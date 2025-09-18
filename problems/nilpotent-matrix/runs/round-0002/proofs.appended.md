# Rigorous Proofs



Definitions
Let n ≥ 2 and let M ∈ C^{n×n} be tridiagonal with diagonal entries z_1,…,z_n, subdiagonal entries 1, and superdiagonal entries −1. Write D = diag(z_1,…,z_n). Let L be the lower shift (L_{i+1,i} = 1), U the upper shift (U_{i,i+1} = 1). Then M = D + L − U. Let W = diag(1,2,…,n). We use the standard matrix units E_{ij}.

1) Commutator identities
Lemma 1. [W, M] = L + U.
Proof. Since [W,D] = 0 and [W,L] has entries ([W,L])_{i+1,i} = (i+1 − i) = 1, we get [W,L] = L. Similarly ([W,U])_{i,i+1} = (i − (i+1)) = −1, hence [W,−U] = −[W,U] = U. Thus [W,M] = [W,L] + [W,−U] = L + U.

Lemma 2. [L, M] = [L, D] + E_{1,1} − E_{n,n}, where [L, D] is strictly lower bidiagonal with ([L,D])_{i+1,i} = z_i − z_{i+1}.
Proof. Directly, ([L,D])_{i+1,i} = L_{i+1,i} z_i − z_{i+1} L_{i+1,i} = z_i − z_{i+1}. Also [L, L] = 0 and [L, −U] = −[L,U]. Since (LU)_{ii} = 1 for i ≥ 2 and (UL)_{ii} = 1 for i ≤ n−1, we have [L,U] = LU − UL = −E_{1,1} + E_{n,n}. Therefore [L, −U] = E_{1,1} − E_{n,n}, giving [L,M] = [L,D] + E_{1,1} − E_{n,n}.

Corollary 3. For every k ≥ 1, tr((L+U) M^{k−1}) = 0 and tr([L, M] M^{k−1}) = 0.
Proof. For any k ≥ 1, [W, M^k] = ∑_{j=0}^{k−1} M^j [W,M] M^{k−1−j}. Taking traces and using cyclicity yields k·tr([W,M] M^{k−1}) = 0; hence tr((L+U) M^{k−1})=0 by Lemma 1. Similarly 0 = tr([L, M^k]) = k·tr([L, M] M^{k−1}).

The identity tr([L,M] M^{k−1}) = 0 expands as
(∗)  (M^{k−1})_{1,1} − (M^{k−1})_{n,n} + ∑_{i=1}^{n−1} (z_i − z_{i+1}) (M^{k−1})_{i, i+1} = 0.

2) Boundary entries of powers
Lemma 4. For 0 ≤ k ≤ n−1, (M^k)_{k+1,1} = 1.
Proof. In a length-k product, the only way to move from column 1 to row k+1 is to take exactly k steps of L (each of weight 1). Any U-step would require an extra L-step to compensate and exceed the budget, and any D-step would reduce the number of L-steps but cannot be offset. Hence the unique admissible path has weight 1.

Lemma 5. For 1 ≤ k ≤ n, (M^k)_{k,1} = ∑_{j=1}^k z_j.
Proof. Let the numbers of L, U, D-steps be ℓ,u,d with ℓ − u = k − 1 and ℓ + u + d = k; thus 2u + d = 1. The only nonnegative solution is u = 0, d = 1, ℓ = k − 1. The unique position of the D-step can be any s ∈ {1,…,k}. At that moment the current index equals s, contributing z_s; all L-steps have weight 1. Summing over s gives the claim.

Lemma 6. For 1 ≤ k ≤ n, (M^k)_{n−k+1,n} = (−1)^{k−1} ∑_{j=n−k+1}^n z_j.
Proof. Now ℓ − u = −(k − 1) and ℓ + u + d = k, hence 2ℓ + d = 1. Thus ℓ = 0, d = 1, u = k − 1. Each U-step contributes a factor −1, hence the sign (−1)^{k−1}. The D-step can occur at any of the k positions, at height n − r after r U-steps, contributing z_{n−r}. Summing yields the suffix sum.

Corollary 7 (weighted sums via boundary entries). Let S_k = ∑_{j=1}^k z_j and T_k = ∑_{j=n−k+1}^n z_j. Then
- ∑_{k=1}^n T_k = ∑_{i=1}^n i z_i = ∑_{k=1}^n (−1)^{k−1} (M^k)_{n−k+1,n}.
- ∑_{k=1}^n S_k = (n+1)∑_{i=1}^n z_i − ∑_{i=1}^n i z_i = ∑_{k=1}^n (M^k)_{k,1}.
In particular, if tr(M)=0 then ∑_{k=1}^n (M^k)_{k,1} = −∑_{i=1}^n i z_i.
Proof. The combinatorial equalities for ∑ T_k and ∑ S_k are standard double-counting of coefficients. The boundary-entry expressions follow from Lemmas 5–6.

3) Low-order trace identities
Lemma 8. tr(M^2) = ∑_{i=1}^n z_i^2 − 2(n−1).
Proof. Write M = D + S with S = L − U, which has zero diagonal. Then tr(M^2) = tr(D^2) + tr(S^2). The diagonal of S^2 equals −1 at i=1,n and −2 at interior indices. Summing gives tr(S^2) = −2(n−1).

Lemma 9. tr(M^3) = ∑_{i=1}^n z_i^3 + 3(z_1 + z_n).
Proof. Expanding (D+S)^3 and using trace-cyclicity,
tr(M^3) = tr(D^3) + tr(D^2 S + D S D + S D^2) + tr(D S^2 + S D S + S^2 D) + tr(S^3).
The sum with one S vanishes since S has zero diagonal. The middle sum equals 3 tr(D S^2) by cyclicity. Since diag(S^2) is −1 at i=1,n and −2 otherwise, tr(D S^2) = −z_1 − 2∑_{i=2}^{n−1} z_i − z_n. Hence tr(M^3) = ∑ z_i^3 − 3z_1 − 6∑_{i=2}^{n−1} z_i − 3z_n = ∑ z_i^3 + 3(z_1 + z_n) once we use ∑ z_i = (z_1 + z_n) + ∑_{i=2}^{n−1} z_i.

Corollary 10 (nilpotency constraints). If M is nilpotent, then tr(M^k)=0 for all k ≥ 1, and in particular
∑_{i=1}^n z_i = 0,
∑_{i=1}^n z_i^2 = 2(n−1),
∑_{i=1}^n z_i^3 = −3(z_1 + z_n).

4) The case n = 3 under the weighted constraint
Theorem 11. For n = 3, there is no nilpotent M with z_1 + 2 z_2 + 3 z_3 = 0.
Proof. Nilpotency enforces: (i) z_1 + z_2 + z_3 = 0; (ii) the sum of principal 2×2 minors equals 0, i.e., z_1 z_2 + z_1 z_3 + z_2 z_3 + 2 = 0; (iii) det(M) = z_1 z_2 z_3 + z_1 + z_3 = 0. The weighted constraint gives z_1 + 2 z_2 + 3 z_3 = 0. Subtracting (i) from the weighted equation yields z_2 + 2 z_3 = 0, so z_2 = −2 z_3. Then (i) gives z_1 = z_3. Substituting into (iii): z_1 z_2 z_3 + z_1 + z_3 = −2 z_3^3 + 2 z_3 = 0, so z_3 ∈ {0, ±1}. If z_3 = 0 then z_1 = z_2 = 0 contradicting (ii). If z_3 = ±1, then z_1 = ±1 and z_2 = ∓2; inserting into (ii) yields (±1)(∓2) + (±1)(±1) + (∓2)(±1) + 2 = −1 ≠ 0, a contradiction. Thus no nilpotent solution exists.

Remarks. Corollary 7 translates the weighted sum into a boundary-sum of powers of M. Together with (∗) and the low-degree trace identities, these provide a growing set of constraints that can be exploited for larger n.


Lemma A (Fourth coefficient a_{n,4}).
Let P_k(λ) = det(λ I − M_{[k]}) = λ^k + a_{k,1} λ^{k−1} + a_{k,2} λ^{k−2} + a_{k,3} λ^{k−3} + a_{k,4} λ^{k−4} + ⋯, where M_{[k]} is the leading k×k principal submatrix. Then for k ≥ 4,
 a_{k,4} = a_{k−1,4} − z_k a_{k−1,3} + a_{k−2,2}.
With a_{m,1} = −S_m, a_{m,2} = E_2^{(m)} + (m − 1), a_{m,3} = −E_3^{(m)} − (m − 3) S_m − (z_1 + z_m), summing from k = 4 to n yields the closed form
 a_{n,4} = E_4 + (n − 5) E_2 + \sum_{j=1}^{n−1} z_j z_{j+1} − (z_1^2 + z_n^2) + (n − 3)(n − 2)/2.
Here S_m = ∑_{i=1}^m z_i, E_r^{(m)} is the r-th elementary symmetric sum in z_1,…,z_m, and E_r = E_r^{(n)}.

Proof. The recurrence for P_k implies a_{k,4} = a_{k−1,4} − z_k a_{k−1,3} + a_{k−2,2}. Using the explicit formulas for a_{k−1,3}, a_{k−2,2} and telescoping from k=4 to n gives
 a_{n,4} = \sum_{k=4}^n [ z_k E_3^{(k−1)} + (k−4) z_k S_{k−1} + z_k (z_1 + z_{k−1}) + E_2^{(k−2)} + (k−3) ].
Now ∑_{k=4}^n z_k E_3^{(k−1)} = E_4. Next, ∑_{k=4}^n (k−3) = (n − 3)(n − 2)/2, and ∑_{k=4}^n z_k z_{k−1} = ∑_{j=3}^{n−1} z_j z_{j+1}. Also ∑_{k=4}^n z_1 z_k = z_1 (S − z_1 − z_2 − z_3). For the partial 2-sums,
 ∑_{k=4}^n E_2^{(k−2)} = ∑_{m=2}^{n−2} E_2^{(m)} = ∑_{j=2}^{n−2} (n − 1 − j) z_j S_{j−1}
(using E_2^{(m)} = ∑_{j=2}^m z_j S_{j−1}). Combining with ∑_{k=4}^n (k−4) z_k S_{k−1} and reorganizing yields
 ∑_{k=4}^n [(k−4) z_k S_{k−1}] + ∑_{m=2}^{n−2} E_2^{(m)} = (n − 5) E_2 + [2 z_1 z_2 + z_1 z_3 + z_2 z_3 + z_n S − z_n^2].
Collecting all terms and simplifying gives the stated formula
 a_{n,4} = E_4 + (n − 5) E_2 + \sum_{j=1}^{n−1} z_j z_{j+1} − (z_1^2 + z_n^2) + (n − 3)(n − 2)/2.
∎

Remark. There is no ∑ k z_k term in a_{n,4}. By Newton’s identities, under nilpotency we have tr(M^2) = tr(M^4) = 0, and a_{n,4} = 0 provides no independent constraint.

Lemma B (Trace of M^4).
For M = D + N with D = diag(z_1,…,z_n) and N the tridiagonal skew-symmetric (1 on subdiagonal, −1 on superdiagonal),
 tr(M^4) = ∑_{i=1}^n z_i^4 − 8∑_{i=1}^n z_i^2 + 4(z_1^2 + z_n^2) − 4∑_{i=1}^{n−1} z_i z_{i+1} + (6n − 10).

Proof. In the trace expansion of (D+N)^4, terms with an odd number of N’s have zero trace (either because they have a factor with zero diagonal or reduce to tr(D N^3) with N^3 skew-symmetric). Thus
 tr(M^4) = tr(D^4) + 4 tr(D^2 N^2) + 2 tr(D N D N) + tr(N^4).
Now tr(D^4) = ∑ z_i^4. Since N^2 has diagonal (−1, −2, …, −2, −1), tr(D^2 N^2) = ∑ z_i^2 (N^2)_{ii} = −2∑ z_i^2 + z_1^2 + z_n^2.
Moreover, tr(D N D N) = ∑_{i,j} z_i N_{ij} z_j N_{ji} = −2∑_{i=1}^{n−1} z_i z_{i+1} (only nearest neighbors contribute). Finally, N^2 has off-diagonals at distance two with 1’s, so (N^4)_{ii} = (N^2)_{ii}^2 plus two off-distance contributions when available; a direct count yields diag(N^4): 2 at i=1,n; 5 at i=2,n−1; and 6 otherwise. Hence tr(N^4) = 2+2+5+5+6(n−4) = 6n−10. Substituting and simplifying gives the formula.
∎

Lemma 1 (boundary-to-boundary entries for k = n and k = n+1).
Let M = Z + J − U with Z = diag(z_1,…,z_n), J the subdiagonal shift, U the superdiagonal shift. Then
(i) (M^n)_{n,1} = ∑_{i=1}^n z_i.
(ii) (M^{n+1})_{n,1} = h_2(z) − (n−1) = ∑_{1≤i≤j≤n} z_i z_j − (n−1).
Proof. A length-k contribution is a word in {Z,J,−U} mapping e_1 to e_n, respecting boundaries. For k = n, net displacement n−1 forces exactly one Z and n−1 J with no U. Along the monotone-J path, Z can occur when the current index equals any i ∈ {1,…,n}, giving contribution z_i. Summing yields (i).
For k = n+1, either there are two Z and n−1 J (no U) or one U and n J (no Z). The first case contributes h_2(z) by placing two Z’s among the J’s along the monotone-J path. In the one-U case, U cannot be the first letter and must occur before attempting a J at index n, giving exactly n−1 valid placements, each contributing −1. Hence (ii). ∎

Lemma 2 (closed form for (M^{n+2})_{n,1}).
For n ≥ 2,
(M^{n+2})_{n,1} = h_3(z) − [(n+1)∑_{i=1}^n z_i − (z_1 + z_n)].
Proof. Words of length n+2 with net displacement n−1 have either (u=0) three Z and n−1 J (no U), or (u=1) one Z, one U, and n J. For u=0, the contribution is h_3(z) by the same monotone-J placement argument as in Lemma 1.
For u=1, the valid J/U skeletons are W_t = J^{t−1} U J^{n+1−t}, t ∈ {2,…,n}. Each has n+2 insertion slots for the single Z. Let f_t(s) be the current index after s letters of W_t. A direct check shows the number of pairs (t,s) with f_t(s) = i is c_i with c_1 = c_n = n and c_i = n+1 for 2 ≤ i ≤ n−1. Each such placement contributes −z_i. Therefore the u=1 total is −∑_i c_i z_i = −[(n+1)∑ z_i − (z_1 + z_n)]. Adding the u=0 part gives the claim. ∎

Corollary 3 (equivalence with tr(M^3)). If ∑ z_i = 0 (as under nilpotency), then (M^{n+2})_{n,1} = h_3 + (z_1 + z_n). Newton’s identity with e_1 = 0 gives ∑ z_i^3 = 3 e_3 and h_3 = e_3. Meanwhile tr(M^3) = ∑ z_i^3 − 3(2∑ z_i − (z_1 + z_n)) reduces to ∑ z_i^3 + 3(z_1 + z_n). Hence (M^{n+2})_{n,1} = 0 ⇔ tr(M^3) = 0.

Lemma 4 (trace of A^4).
Let A = J − U. For n ≥ 2, tr(A^4) = 6n − 10.
Proof. Any diagonal contribution to A^4 arises from words of length 4 with exactly two J and two U. There are six such words. Encode J by +1 and U by −1, and let S_t be the prefix sums; for a given word, the number of valid starting indices equals n + min S − max S. For the six words (++−−), (+−+−), (+−−+), (−++−), (−+−+), (−−++), these counts are respectively n−2, n−1, n−2, n−2, n−1, n−2. Summing gives 6n − 10. ∎

Proposition 5 (trace of M^4).
For n ≥ 2,
tr(M^4) = ∑_{i=1}^n z_i^4 + 4 tr(Z^2 A^2) + 2 tr(Z A Z A) + tr(A^4)
= ∑_{i=1}^n z_i^4 − 4 z_1^2 − 8∑_{i=2}^{n−1} z_i^2 − 4 z_n^2 − 4∑_{i=1}^{n−1} z_i z_{i+1} + (6n − 10).
Proof. Expand (Z + A)^4. The trace of any word with an odd number of A’s vanishes. Among the six two-A words, cyclic invariance shows four contribute tr(Z^2 A^2) and two contribute tr(Z A Z A). Since A^2 is diagonal with (A^2)_{11} = (A^2)_{nn} = −1 and (A^2)_{ii} = −2 for 2 ≤ i ≤ n−1, we have tr(Z^2 A^2) = −z_1^2 − 2∑_{i=2}^{n−1} z_i^2 − z_n^2. Also, (Z A)_{i,i+1} = −z_i and (Z A)_{i,i−1} = z_i, so (Z A Z A)_{ii} = − z_i z_{i+1} − z_i z_{i−1}, and summing in i yields tr(Z A Z A) = −2∑_{i=1}^{n−1} z_i z_{i+1}. Together with Lemma 4, this gives the stated formula. ∎

Setup. Let M be the n×n tridiagonal matrix with diagonal Z = diag(z_1,…,z_n), ones on the subdiagonal (L) and −1 on the superdiagonal (−U). Write A := L − U. Thus M = Z + A. Let e_k and h_k denote the elementary and complete homogeneous symmetric polynomials in z_1,…,z_n.

Lemma 1 (Trace M^3). For all n ≥ 2,
tr(M^3) = ∑_{i=1}^n z_i^3 − 6∑_{i=1}^n z_i + 3(z_1 + z_n).
Proof. Expand (Z + A)^3 and use cyclicity of trace. Terms with exactly one A or three A’s have zero trace (A has zero diagonal and tr(A^3)=0). The 2-A terms are cyclic permutations of Z A^2. Hence tr(M^3) = tr(Z^3) + 3 tr(Z A^2). Since A^2 has diagonal entries −1 at i=1,n and −2 otherwise, tr(Z A^2) = −2∑ z_i + (z_1 + z_n). The result follows. ∎

Lemma 2 (tr(A^4)). For A = L − U,
tr(A^4) = 6n − 10.
Proof. A^2 has diagonal entries −1 at i=1,n and −2 otherwise, with ones on the second sub/super-diagonals and zeros elsewhere. Thus (A^2)_{ij} ∈ {0,±1,−2}. Then tr(A^4) = ∑_{i,j} (A^2)_{ij} (A^2)_{ji} = ∑_{i} (A^2)_{ii}^2 + 2∑_{i=1}^{n−2} (A^2)_{i,i+2}^2. This equals [1+1+4(n−2)] + 2(n−2) = 6n − 10. ∎

Proposition 3 (Trace M^4). For all n ≥ 2,
tr(M^4) = ∑_{i=1}^n z_i^4 − 4 z_1^2 − 8∑_{i=2}^{n−1} z_i^2 − 4 z_n^2 − 4∑_{i=1}^{n−1} z_i z_{i+1} + (6n − 10).
Proof. Expand (Z + A)^4. By cyclicity, all terms with an odd number of A’s have zero trace. The remaining terms reduce to tr(Z^4) + 4 tr(Z^2 A^2) + 2 tr(Z A Z A) + tr(A^4). Since Z is diagonal, tr(Z^2 A^2) = ∑ z_i^2 (A^2)_{ii} = −z_1^2 − 2∑_{i=2}^{n−1} z_i^2 − z_n^2. Also tr(Z A Z A) = ∑_{i,j} z_i A_{ij} z_j A_{ji} = −2∑_{i=1}^{n−1} z_i z_{i+1}. Insert Lemma 2 for tr(A^4). ∎

Proposition 4 (Boundary entry (M^{n+2})_{n,1}). For all n ≥ 2,
(M^{n+2})_{n,1} = h_3(z_1,…,z_n) − (n+1) e_1(z) + (z_1 + z_n).
Proof. Interpret (M^k)_{n,1} as the total weight of length-k paths from 1 to n on {1,…,n} using steps: L (i→i+1) of weight +1, U (i→i−1) of weight −1, and D (stay) of weight z_i. For k = n+2, displacement constraints give 2u + s = 3 with u = #U, s = #D, so (u,s) ∈ {(0,3),(1,1)}. Class (0,3): no U, n−1 L’s, three D’s; summing over all placements yields h_3. Class (1,1): one U (weight −1), n L’s, one D. Valid U positions are t ∈ {2,…,n} (n−1 choices), and for a fixed t the index trajectory visits level j exactly c_j(t) times before each of the (n+2) steps, with c_1(t)=1 for all t except one extra visit from the “bounce” at t, similarly c_n(t)=1 except at the right boundary; summing over t yields total visits c_1 = n, c_j = n+1 for 2 ≤ j ≤ n−1, and c_n = n. Hence the total class-(1,1) contribution equals −[n z_1 + (n+1)∑_{j=2}^{n−1} z_j + n z_n] = −[(n+1) e_1 − (z_1 + z_n)]. Summing both classes gives the formula. ∎

Corollary. If M is nilpotent, then e_1 = 0 and (M^{n+2})_{n,1} = 0, hence h_3 = e_3 and e_3 + (z_1 + z_n) = 0, which coincides with the λ^{n−3} coefficient identity under e_1 = 0. ∎