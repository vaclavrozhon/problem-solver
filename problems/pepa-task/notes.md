# Research Notes



Conjecture under study (assumed): Units in the Habiro ring Z[q]^N are exactly {±q^i | i∈Z}.

Partial progress and tools
- Torsion units are trivial: If u∈Z[q]^N and u^m=1 for some m≥1, then u=±1. (Proof now in proofs.md.)
- p-adic congruence along μ_{p^∞}: For odd p and primitive p^a-th roots ζ, one has u(ζ) ≡ u(1) (mod p) in Z[ζ]. (Proof now in proofs.md.)
- Rigidity via infinite exact matches (corrected): If u∈U(Z[q]^N) and there exist i∈Z and infinitely many roots of unity ζ of prime-power order with u(ζ)=±ζ^i, then u=±q^i. The proof must use the injectivity map τ over the set of those ζ (Theorem 2), not just over their orders (Theorem 3). (Proof now in proofs.md.)

Caveats
- Claim “if u∈Z[q,q^{-1}] is a unit in Z[q]^N then u=±q^i” is not automatic from inclusion of rings; needs a separate argument (e.g., via values at infinitely many ζ or norms).
- A proposed ‘chain injectivity’ extension (divisibility chain m_{i+1}/m_i = p-power) has a gap; do not rely on it.

Next steps
- Settle γ_m(q)=∑_{i=0}^{m-1}(-1)^i q^i (odd m≥3): show non-unit by finding p|m such that γ_m is not invertible in Z[q]/(Φ_p, p).
- Laurent-polynomial case: prove that if g∈Z[q,q^{-1}] maps to units in Z[ζ] for infinitely many ζ, then g=±q^i (Kronecker-type strategy via norms/height).
- Prime-power rigidity: for a fixed odd p, analyze u in Z_p[[q−1]] and its values on μ_{p^∞}; attempt to force infinitely many exact equalities u(ζ)=±ζ^{i_p} to trigger the rigidity lemma; combine two primes and use τ-injectivity.
- Clarify the target conjecture (“7.2”) to prioritize either the unit group or the general injectivity for arbitrary infinite Z.

New milestone: Laurent-polynomial units resolved. If g ∈ Z[q,q^{-1}] is a unit in the Habiro ring Z[q]^N, then g = ± q^i. We will use the finite-field reduction proof (see proofs.md), which also immediately implies that the alternating sums γ_m are not units. This removes the earlier caveat about Laurent-polynomial candidates.

Open bottleneck: We still need a mechanism to obtain infinitely many exact monomial evaluations u(ζ)=±ζ^i, e.g., along μ_{p^∞}. The p-adic congruence u(ζ_{p^a}) ≡ u(1) (mod p) is insufficient; we need upgrades to exact equalities at infinitely many levels.

Working plan:
- p-adic tower analysis: For fixed odd p, normalize v=ε q^{-i}u with v(1)=v(−1)=1. Study v(ζ_{p^a}) in Z_p(ζ_{p^a}) using σ_{N,ζ}. Aim to show v(ζ_{p^a})=1 for infinitely many a, then apply the rigidity lemma.
- Two-prime synthesis: Repeat for another odd prime to pin down the same i and conclude u=±q^i via τ-injectivity.
- If possible, derive constraints for values at many prime orders ℓ to force u(ζ_ℓ) into {±ζ_ℓ^i} infinitely often.


New progress
- Laurent-polynomial units settled: If g ∈ Z[q,q^{-1}] is a unit in Z[q]^N, then g = ± q^i. Consequently, the alternating sums γ_m (odd m≥3) are not units.
- p-adic tools: For p odd and ζ of order p^a, v_𝔭(ζ^k−1) = v_𝔭(ζ−1)+v_p(k) and v_𝔭((ζ)_n) = n v_𝔭(ζ−1)+v_p(n!). Hence, for any r≥1 there is N(r) with v_𝔭((ζ)_n)≥r for all n≥N(r), uniformly in a, giving a uniform truncation control of u(ζ) modulo p^r.
- Rigidity: If u(ζ)=±ζ^i for infinitely many ζ of prime-power order, then u=±q^i (via τ-injectivity on infinite sets).

Open bottleneck
- Need to promote p-adic congruences along μ_{p^∞} to exact equalities u(ζ_{p^a})=±ζ_{p^a}^i for infinitely many a.

Plan
- Normalize v=ε q^{-i}u with v(±1)=1. Use the truncation lemma to bound v(ζ_{p^a})−1 modulo p^r uniformly in a. Seek r and infinitely many a with v(ζ_{p^a})=1; then apply rigidity. Repeat for two primes to identify the same i.
- Incorporate determinant identity at level n (∏_{ζ^n=1} u(ζ)=±1) and rigidity from infinitely many cyclotomic congruences as auxiliary constraints.

Additions
- Laurent-polynomial units settled: If g ∈ Z[q,q^{-1}] is a unit in Z[q]^N, then g = ± q^i. Hence γ_m (odd m≥3) are not units.
- p-adic tools (p odd): For ζ of order p^a and k=p^s m (p∤m), v(ζ^k−1)=v(ζ−1)+s. Consequently, v((ζ)_n)=n·v(ζ−1)+v_p(n!) ≥ v_p(n!). For any r≥1, there exists N(r) such that for all n≥N(r) and all a≥1, (ζ)_n ≡ 0 (mod p^r) in Z_p(ζ).
- Canonical exponent i: For u∈U(Z[q]^N), u(1)=±1 and i:=u′(1)/u(1)∈Z. First-order matching: for p odd and ζ of order p^a, u(ζ) ≡ u(1)·ζ^i (mod (ζ−1)^2).
- Rigidity trigger: If u(ζ)=±ζ^i for infinitely many ζ of prime-power order, then u=±q^i (by τ-injectivity on such Z).

Clarification
- Uniform truncation is a tail statement: for fixed r, (ζ)_n vanishes mod p^r for all n≥N(r), uniformly in a. There is no uniform-in-a lower bound for v_p((ζ)_n) at fixed small n.

Open bottleneck
- Upgrade congruences along μ_{p^∞} to exact equalities u(ζ_{p^a})=±ζ_{p^a}^i for infinitely many a.

Next steps
- Tower-lifting in Z_p(ζ_{p^a}): study E_{p^a}=u(ζ_{p^a})/(±ζ_{p^a}^i)∈1+(ζ−1)^2 and attempt criteria ensuring E_{p^a}=1 for infinitely many a.
- Two-prime synthesis to pin down the same i and conclude via τ-injectivity.

New verified tools
- Laurent-polynomial units: If g ∈ Z[q,q^{-1}] is a Habiro-unit, then g = ± q^i. Thus γ_m (odd m≥3) are not units.
- p-adic along μ_{p^∞} (p odd): v_p(ζ^k−1)=v_p(ζ−1)+v_p(k) for k<p^a; hence v_p((ζ)_n)=n·v_p(ζ−1)+v_p(n!). For any r≥1, there is N(r) with (ζ)_n ≡ 0 (mod p^r) for all n≥N(r), uniformly in a (tail truncation).
- Canonical exponent: For u∈U(Z[q]^N), i:=u′(1)/u(1)∈Z. First-order matching: u(ζ) ≡ u(1)·ζ^i (mod (ζ−1)^2) for all odd prime-power ζ.
- Determinant constraint: ∏_{ζ^n=1} u(ζ) = ±1 for every n.
- CRT exponent gluing: exact congruences modulo Φ_m and Φ_n (m,n coprime) combine to Φ_{mn} with a single exponent.
- Prime-order rigidity: If u(ζ_ℓ)=±ζ_ℓ^i for infinitely many primes ℓ, then u=±q^i.

Open bottleneck
- Need a tower-lifting argument: for v(q)=u(1)^{−1}q^{−i}u(q), show v(ζ_{p^a})=1 for infinitely many a (at least one odd p). Tail control reduces to finitely many head terms, but a rigorous stabilization across the cyclotomic tower remains to be proved.

Plan
- Prove a finite-level lifting/stabilization criterion along μ_{p^∞}; or obtain infinitely many prime-order exact matches via determinant/CRT methods and first-order matching, then conclude by τ-injectivity.