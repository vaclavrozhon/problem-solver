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


Added progress and corrections summary.

- We verified the continuant recurrence for P_k(λ) = det(λ I − M_{[k]}): P_k = (λ − z_k) P_{k−1} + P_{k−2}, with P_0 = 1, P_1 = λ − z_1. From this we confirmed:
  • a_{k,1} = −∑_{j ≤ k} z_j.
  • a_{k,2} = ∑_{1≤i<j≤k} z_i z_j + (k − 1).
  • a_{k,3} = −∑_{1≤i<j<ℓ≤k} z_i z_j z_ℓ − (k − 3)∑_{j ≤ k} z_j − (z_1 + z_k).
- Low-order traces: tr(M^2) = ∑ z_i^2 − 2(n − 1), tr(M^3) = ∑ z_i^3 − 6∑ z_i + 3(z_1 + z_n).
- Under nilpotency (M^n = 0): a_{n,1} = a_{n,2} = a_{n,3} = 0 ⇒ ∑ z_i = 0, ∑_{i<j} z_i z_j = −(n − 1), ∑_{i<j<k} z_i z_j z_k = −(z_1 + z_n). Also tr(M^2) = tr(M^3) = 0. Using α_{n+2} (see below) in fact enforces z_1 + z_n = 0 and hence E_3 = 0.
- Path counting (boundary-to-boundary entries): α_{n−1} = 1, α_n = ∑ z_i, α_{n+1} = ∑_{i≤j} z_i z_j − (n − 1), α_{n+2} = ∑_{i≤j≤k} z_i z_j z_k − (n − 1)∑ z_i. With S = ∑ z_i = 0, α_{n+2} = h_3 = (2/3)∑ z_i^3 − E_3. Since tr(M^3) = 0 gives ∑ z_i^3 + 3E_3 = 0, we get α_{n+2} = −3E_3. Nilpotency implies α_{n+2} = 0 ⇒ E_3 = 0 ⇒ z_1 + z_n = 0. (This corrects a factor-3 slip in an earlier note.)
- New explicit formulas:
  • Fourth coefficient: a_{n,4} = E_4 + (n − 5) E_2 + [∑_{j=1}^{n−1} z_j z_{j+1}] − (z_1^2 + z_n^2) + (n − 3)(n − 2)/2. In particular, there is no ∑ k z_k term.
  • tr(M^4) = ∑ z_i^4 − 8∑ z_i^2 + 4(z_1^2 + z_n^2) − 4∑_{j=1}^{n−1} z_j z_{j+1} + (6n − 10).
  Under nilpotency, tr(M^2) = tr(M^4) = 0.
- Observation: Newton identities show a_{n,4} is determined by tr(M^2), tr(M^4). Thus a_{n,4} = 0 brings no new constraint beyond tr(M^2) = tr(M^4) = 0 when M is nilpotent.
- Critical gap: None of the current identities truly use the weighted constraint ∑ k z_k = 0. Coefficients/traces and α_{n+q} depend on symmetric sums and boundary effects (z_1, z_n) and adjacent products, but we do not see an index-weighted linear term emerge. We need identities explicitly involving J = diag(1,2,…,n). Candidates: tr(J M^r) expansions, and a kernel-vector approach for M v = 0 combined with discrete summation by parts and ∑ k z_k = 0.

Corrections and rigorous identities (consolidated)

- Definitions: M = Z + J − U with Z = diag(z_1,…,z_n), J the subdiagonal shift (ones on (i+1,i)), U the superdiagonal shift (ones on (i,i+1)). Let A := J − U and D := diag(1,…,n). We use symmetric polynomials h_r (complete homogeneous) and e_r (elementary) in (z_1,…,z_n).

- Entry identities (n,1) via path counting:
  • (M^n)_{n,1} = ∑_{i=1}^n z_i.
  • (M^{n+1})_{n,1} = h_2(z) − (n−1) = ∑_{1≤i≤j≤n} z_i z_j − (n−1).
  • (M^{n+2})_{n,1} = h_3(z) − [(n+1)∑ z_i − (z_1 + z_n)]. Proof: decompose words by number of U. For u = 0 (no U), admissible words have n−1 J and 3 Z, contributing h_3. For u = 1, the J/U skeletons are W_t = J^{t−1} U J^{n+1−t}, t = 2,…,n. Inserting the single Z into any of the n+2 slots yields contributions −z_i counted by c_i with c_1 = c_n = n and c_i = n+1 for 2 ≤ i ≤ n−1. Hence the one-U total is −[(n+1)∑ z_i − (z_1 + z_n)].
  Under ∑ z_i = 0 (true for nilpotent M), this simplifies to (M^{n+2})_{n,1} = h_3 + (z_1 + z_n).

- Equivalence with tr(M^3): tr(M^3) = ∑ z_i^3 − 3(2∑ z_i − (z_1 + z_n)). If ∑ z_i = 0, then tr(M^3) = ∑ z_i^3 + 3(z_1 + z_n). Newton (with e_1=0) gives ∑ z_i^3 = 3 e_3 and h_3 = e_3, hence (M^{n+2})_{n,1} = 0 ⇔ tr(M^3) = 0. So k = n+2 adds no new constraint beyond tr(M^3) when tr(M)=0.

- A^4 and M^4 traces:
  • tr(A^4) = 6n − 10. Proof by enumerating the six length-4 words with two J and two U and counting valid starting indices (boundary-respecting paths).
  • Expand tr((Z + A)^4): terms with an odd number of A’s have zero trace; among the six two-A words, four contribute tr(Z^2 A^2) and two contribute tr(Z A Z A). With A^2 diagonal having entries −1 at i=1,n and −2 otherwise, and tr(Z A Z A) = −2∑_{i=1}^{n−1} z_i z_{i+1}, we obtain
    tr(M^4) = ∑ z_i^4 − 4 z_1^2 − 8∑_{i=2}^{n−1} z_i^2 − 4 z_n^2 − 4∑_{i=1}^{n−1} z_i z_{i+1} + (6n − 10).

- Moment identity linking the weighted constraint: for l = (1,…,1)^T and u = (1,2,…,n)^T, l^T M u = ∑ i z_i − (n−1). Hence the given condition ∑ i z_i = 0 is equivalent to l^T M u = −(n−1). This suggests studying s_k := l^T M^k u (which vanishes for large k under nilpotency) to inject the weighted constraint into higher-order relations.

Status and plan: We now have rigorous control of (n,1)-entries up to length n+2 and tr(M^4). The k = n+2 identity is redundant with tr(M^3) under tr(M) = 0. To exploit ∑ i z_i = 0, we will compute (M^{n+3})_{n,1} exactly (decomposing u = 0,1,2) and finalize a_{n,4} via continuant or Faddeev–LeVerrier, then combine with tr(M^4) and s_{n+3} := l^T M^{n+3} u to seek a contradiction for all n ≥ 2.

Corrections and new verified identities

- Exact boundary entry for k = n+2: (M^{n+2})_{n,1} = h_3(z) − (n+1) e_1(z) + (z_1 + z_n). Under e_1=0 (true if M is nilpotent), this reduces to e_3 = −(z_1 + z_n), matching the λ^{n−3} coefficient identity. Earlier claims with coefficients −(n−1)∑ z_i or a factor “−3” are incorrect.
- Trace of M^4: With M = Z + (L−U),
  tr(M^4) = ∑_{i=1}^n z_i^4 − 4 z_1^2 − 8∑_{i=2}^{n−1} z_i^2 − 4 z_n^2 − 4∑_{i=1}^{n−1} z_i z_{i+1} + (6n−10).
  Also tr(L−U)^4 = 6n−10. Under nilpotency, tr(M^2)=tr(M^4)=0 gives two concrete constraints.
- Weighted identities: tr(WM) = ∑ i z_i (so the constraint is tr(WM)=0), and tr(WM^2) = ∑ i z_i^2 − (n^2 − 1). The kernel identity for v ∈ ker M: ∑ i z_i v_i^2 = 0 and ∑ i i z_i v_i^2 = −∑_{i=1}^{n−1} v_i v_{i+1} (summation-by-parts), offering a potential bridge to the weighted constraint.

Implications and plan
- Coefficients/α-entries naturally yield symmetric sums and boundary corrections, not index-weighted terms; thus they do not, by themselves, encode ∑ i z_i.
- Next: compute tr(WM^3) explicitly and combine with tr(M)=tr(M^2)=tr(M^3)=0, tr(WM)=0, tr(WM^2) to constrain endpoints vs. interior. In parallel, finalize a complete derivation of the λ^{n−4} coefficient c_{n−4} and attempt a boundary-peeling induction using the established z_1+z_n relation from e_3.
- Avoid using unproven regroupings or speculative weighted appearances in coefficients; rely on the verified formulas above.