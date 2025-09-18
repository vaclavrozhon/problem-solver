# Research Notes



# Tridiagonal nilpotency problem: structural identities and plan

Let M be the n×n tridiagonal matrix with diagonal Z = diag(z_1,…,z_n), ones on the subdiagonal (J), and −1 on the superdiagonal (−U). Thus M = Z + J − U. Define D = diag(1,2,…,n). Then
- [D,J] = J,
- [D,U] = −U,
- e^{−tD} M e^{tD} = Z + e^{−t} J − e^{t} U.
These are useful for similarity-invariant reasoning and path counting.

Basic trace identities (valid for all such M):
- trace(M) = ∑_{i=1}^n z_i.
- trace(M^2) = ∑_{i=1}^n z_i^2 − 2(n−1).
- trace(M^3) = ∑_{i=1}^n z_i^3 − 3(2∑_{i=1}^n z_i − (z_1 + z_n)).
If M were nilpotent, then trace(M^k) = 0 for k ≥ 1, hence ∑ z_i = 0 and ∑ z_i^2 = 2(n−1), etc.

Path-sum identities for the (n,1)-entry of powers (counting words in {J,Z,−U} that map e_1 → e_n while respecting boundaries):
- For k = n: (M^n)_{n,1} = ∑_{i=1}^n z_i. Reason: the only admissible words are those with exactly n−1 copies of J and one Z; the Z can occur at any intermediate index i.
- For k = n+1: (M^{n+1})_{n,1} = ∑_{1≤i≤j≤n} z_i z_j − (n−1). Reason: admissible words have either two Z’s and n−1 J’s (contributing ∑_{i≤j} z_i z_j) or one U and n J’s (there are exactly n−1 valid placements of the U; each contributes −1).
Under ∑ i z_i = 0, the identities for k = n and k = n+1 are compatible with trace(M) = 0 and trace(M^2) = 0 (since c_{n,2} = (n−1) + ∑_{i<j} z_i z_j = 0 is equivalent to ∑ z_i^2 = 2(n−1) when ∑ z_i = 0).

Outlook: To force a contradiction from the extra linear constraint ∑ i z_i = 0, we likely need the next identity (k = n+2). Admissible words now have either three Z’s and n−1 J’s, or one Z, one U, and n J’s. We expect a formula of the form
(M^{n+2})_{n,1} = e_3(z_1,…,z_n) − C_n · (∑_{i=1}^n i z_i),
for some explicit combinatorial constant C_n, obtained by counting valid placements of the single U relative to the single Z along the J-chain. If true, under ∑ i z_i = 0 and nilpotency ((M^{n+2})_{n,1} = 0) we get e_3(z) = 0. In tandem with trace(M^3) = 0 (which reads ∑ z_i^3 + 3(z_1 + z_n) = 0 when ∑ z_i = 0), this yields additional boundary constraints (e.g., z_1 + z_n = 0). Iterating to k = n+3 should overdetermine the system and show nonexistence for n ≥ 2.

Additional identities to verify/extend:
- A convenient constant identity: l^T M u = ∑_{i=1}^n i z_i − (n−1), where l = (1,…,1)^T and u = (1,2,…,n)^T.
- Higher traces: derive exact trace(M^4) (including boundary corrections) using A := J − U. One finds A^2 has diagonal entries −1 at i=1,n and −2 for 2≤i≤n−1, and trace(A^4) counts length-4 closed paths; preliminary count suggests trace(A^4) = 6n − 10 for n ≥ 3 (check carefully for small n and boundary cases). Then trace(M^4) = ∑ z_i^4 + 6∑ z_i^2 (A^2)_{ii} + trace(A^4).

Next steps for provers:
1) Prove rigorously the k = n+2 identity for (M^{n+2})_{n,1} and extract the coefficient of ∑ i z_i.
2) Establish trace(M^4) and c_{n,4} via Faddeev–LeVerrier; compare against the k = n+2 entry identity.
3) Use these to derive an explicit contradiction under ∑ i z_i = 0 and nilpotency.

Remark: The case n = 1 is a trivial nilpotent (z_1 = 0); the statement to be proved should assume n ≥ 2.


Setup and notation
- M = D + L − U with D = diag(z_1,…,z_n), L the lower shift (ones on the subdiagonal), U the upper shift (ones on the superdiagonal).
- W = diag(1,2,…,n). Define J := L + U and S := L − U.

Key identities we will use
- Commutators: [W, M] = L + U; [L, M] = [L, D] + E_{1,1} − E_{n,n}, where [L,D] has entries ([L,D])_{i+1,i} = z_i − z_{i+1}.
- Boundary entries of powers (1 ≤ k ≤ n):
  • (M^k)_{k,1} = ∑_{j=1}^k z_j; and for 0 ≤ k ≤ n−1, (M^k)_{k+1,1} = 1.
  • (M^k)_{n−k+1,n} = (−1)^{k−1} ∑_{j=n−k+1}^n z_j.
- Weighted sum relations:
  • ∑_{i=1}^n i z_i = ∑_{k=1}^n T_k with T_k = ∑_{j=n−k+1}^n z_j = (−1)^{k−1} (M^k)_{n−k+1,n}.
  • ∑_{k=1}^n S_k with S_k = ∑_{j=1}^k z_j equals (n+1)∑ z_i − ∑ i z_i. Hence if tr(M)=∑ z_i=0 (e.g., under nilpotency), then ∑_{k=1}^n S_k = −∑ i z_i = −∑_{k=1}^n (−1)^{k−1} (M^k)_{n−k+1,n}.
- Trace constraints: tr(M^2) = ∑ z_i^2 − 2(n−1); tr(M^3) = ∑ z_i^3 + 3(z_1 + z_n). Under nilpotency these vanish, giving ∑ z_i^2 = 2(n−1), ∑ z_i^3 = −3(z_1 + z_n).
- Additional continuant/coefficients facts (to be formalized): the λ^{n−3} coefficient identity implies e_3 = −(z_1 + z_n) when e_1=0; this matches tr(M^3).

Checked case and corrections
- n = 3: a direct coefficient analysis shows the weighted constraint is incompatible with nilpotency (see proofs.md for a complete argument).
- Correction: the equality ∑ i z_i = ∑_{k=1}^n S_k is false in general; it holds up to a sign only when ∑ z_i = 0. The right-edge identity ∑ i z_i = ∑_{k=1}^n T_k is exact.
- The claim that all principal cofactors C_{ii}(0) vanish under Δ_n(λ)=λ^n is false; do not use Δ_{i−1}(0) Δ^{(i+1)}_{n−i}(0) = 0.

Next steps
- Compute tr(M^4) and optionally tr(M^5) explicitly; combine with the commutator identities 0 = tr([L,M] M^{k−1}) for k=1,… to obtain additional independent constraints.
- Derive the λ^{n−4} coefficient in closed form via matchings and combine with e_1=0, e_2=−(n−1), e_3=−(z_1+z_n) and ∑ i z_i=0.
- Prototype an edge-peeling induction (e.g., eliminate z_1, z_n via the two linear equations and analyze a reduced tridiagonal system) and test it for n=4,5.
