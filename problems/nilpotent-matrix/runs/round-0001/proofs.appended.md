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
