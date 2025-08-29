Overall assessment: We have solid incremental advances and one clear, rigorous new tool (the union‑bound feasibility lemma) plus a correct global parity invariant. There are, however, a couple of incorrect or unjustified claims that we must not carry forward.

Prover 01
- Lemma UB (union‑bound CSP feasibility) is correct. The counting is sound: forbidding a single ordered triple for a fixed triangle eliminates exactly 2^3 global assignments; with ≤1 forbidden triple per triangle, ≤32 of the 64 assignments are excluded, hence a solution exists. This is worth elevating to output.md; I’ve added a precise version and a corollary explaining how to conclude |A|=4 once the two base tables F(+,+) and F(+,-) have complements of size ≤1.
- Conjecture P+ (F equals “triple product +1”) is a clean, testable hypothesis. Keep it in notes; do not promote to output.md without computation.
- The clarification of the triangle coordinate mapping is consistent with our fixed convention in output.md Proposition 15. Good to keep emphasized in notes.

Prover 02
- The “O5‑image formula” specialized to e_O is a correct, immediate consequence of Lemma 6: for τ and i0 with τ^{-1}(i0) the “+” position of e_O, one has p′_i = ε_i if i=i0 and p′_i = −ε_i otherwise. This is useful for hand checks/debugging; I’ve kept it in notes as an implementation aid.
- The claimed corollary “for (α,β)=(+,-), both (+++) and (---) are forbidden” is not proved. The argument incorrectly treats i0 as freely choosable for a fixed τ with ε≡−1. In fact i0 is determined by τ via i0=τ(1), and the specific τ from Lemma 8 need not satisfy τ(1)=2. We retain only the rigorously proved exclusion (---)∉F(+,-) (output.md Lemma 13). The status of (+++) in F(+,-) remains to be decided computationally.
- The sample ε(τ) vectors are welcome as unit tests, but they should be presented as checks for the IsO5 implementation, not as structural constraints.

Prover 03
- Lemma D (distribution of (+++) vs permutations of (+,−,−) under x_{ij}=w_iw_j) is correct and complements Lemma 10. I leave it in notes; Lemma 10 already covers the 2+2 case explicitly.
- Lemma P (parity of triangle products) is correct and broadly useful. I’ve promoted it to output.md.
- Lemma T (“on C5 the 4‑tuple (p^B_k) is constant; on H5 it is 2+2”) is false as stated. Counterexample: if the 5‑set is of type C5, then under the S5 signed action its 5‑vector equals ε(τ) for some τ; taking τ=(12) (as in the samples), ε can be (+,+,−,−,−), which is not constant on the A‑coordinates. Please discard this classification; do not use it to prune cases.
- Proposition 11′ is a reasonable conditional plan (using 2+2/3+1/4+0 choices guided by which entries of F are allowed) but remains conditional; keep in notes only.

What is now in output.md
- Added Lemma (union‑bound feasibility) and its corollary (how to conclude the |A|=4 step once |{±1}^3\F(+,+)|≤1 and |{±1}^3\F(+,-)|≤1).
- Added Lemma (parity across the four triangles).
- No other structural changes; kept all previously proved items intact.

Next steps (minimal, decisive)
1) Implement IsO5 via Lemma 6; run unit tests: (+,+,+,+,+) non‑O5; (+,−,−,−,−) O5; (+,−,+,−,+) non‑O5; and verify the ε(τ) samples listed by Prover 02.
2) Populate F(+,+) and F(+,-) completely (8 entries each) under the fixed coordinate order. Derive F(−,−), F(−,+) by triplewise negation (Corollary 9). Report complements and their sizes.
3) If both complements have size ≤1, conclude the |A|=4 amalgamation by the union‑bound lemma and hence AP (via Lemma 2). If, stronger, both F tables coincide with “triple product +1”, record the uniform construction x_{ij}=w_iw_j and close the problem.
4) Otherwise, check whether all permutations of (+,−,−) lie in F(+,+) and F(+,-); if yes, apply Proposition 11 (uniform 2+2 ansatz). If not, brute‑force the 2^6 CSP for the realized (B,C) profiles; use the parity lemma to prune and archive SAT/UNSAT witnesses.
5) Optionally precompute the set E={ε(τ):τ∈S5}. Then p∈O5 iff ∃i0 with p_i=−ε_i for i≠i0 and p_{i0}=ε_{i0} for some ε∈E. This gives a very fast IsO5.
