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
