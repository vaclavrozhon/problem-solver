# Rigorous Proofs



Results toward the units conjecture in Z[q]^N

1) Lemma (torsion units are trivial). If u∈Z[q]^N and u^m=1 for some m≥1, then u=±1.
Proof. By Theorem 13 of Habiro, Z[q]^N injects into Z[[q−1]]. Embed further into Q[[q−1]]. Write u=∑_{k≥0} a_k (q−1)^k with a_0∈{±1}. If a_0=1, set v=u; if a_0=−1 and m is even, set v=−u; then in either case v has constant term 1 and v^m=1. In Q[[q−1]], the formal logarithm log(1+x) is well-defined for x in (q−1)Q[[q−1]], and m·log v=log(v^m)=0 implies log v=0, hence v=1. Thus u=±1. If a_0=−1 and m is odd, then u^m has constant term −1, contradicting u^m=1. ∎

2) Lemma (p-adic congruence on μ_{p^∞}). Let p be an odd prime, u∈Z[q]^N, and ζ a primitive p^a-th root of unity. Then u(ζ)≡u(1) (mod p) in Z[ζ].
Proof. In Z[[q−1]] write u(q)=s+∑_{k≥1} c_k (q−1)^k with s=u(1)∈{±1}. In Z_p[ζ] one has ζ≡1 (mod p), so (ζ−1) has positive p-adic valuation. The series ∑ c_k (ζ−1)^k converges p-adically and is divisible by p. Therefore u(ζ)≡s (mod p). ∎

3) Proposition (rigidity from infinitely many exact matches). Let u∈U(Z[q]^N). Suppose there exist i∈Z and an infinite set Z′ of roots of unity of prime-power order such that u(ζ)=±ζ^i for all ζ∈Z′. Then u=±q^i.
Proof. Set w=±q^{−i}u so that w(ζ)=1 for all ζ∈Z′. By Theorem 2 (Habiro), since Z′ contains infinitely many roots of prime-power order, the evaluation map τ_{N,Z′}: Z[q]^N→∏_{ζ∈Z′} Z[ζ] is injective. Thus w=1, so u=±q^i. ∎

Lemma (Units in inverse limits). Let (R_I)_I be an inverse system of rings with surjective transition maps and R = lim← R_I. Then x ∈ R is a unit iff each image x_I ∈ R_I is a unit.
Proof. If xy=1 in R then x_I y_I=1 in each R_I. Conversely, if each x_I is a unit, then the inverses y_I=x_I^{-1} are compatible; y=(y_I)_I ∈ R and xy=1. ∎

Proposition (Laurent-polynomial Habiro-units are monomials). If g ∈ Z[q,q^{-1}] is a unit in Z[q]^N, then g = ± q^i for some i ∈ Z.
Proof. Write g=q^i h with i∈Z and h∈Z[q], chosen so that h(0)≠0. Suppose h is not ±1. Choose a prime p such that p ∤ h(0) and h mod p is nonconstant. Over a finite extension F_{p^f}, pick a nonzero root α of ĥ (the reduction of h). Let n=ord(α) in F_{p^f}^×; then p ∤ n and α is a primitive n-th root of unity in characteristic p, hence a root of the reduction of Φ_n. The map θ: Z[q]/(Φ_n) → F_{p^f} induced by reduction mod p and q↦α is a ring homomorphism with θ(h)=0, hence θ(g)=θ(q^i)θ(h)=0. Therefore the image of g in Z[q]/(Φ_n) is not a unit. By the inverse-limit lemma, g cannot be a unit in Z[q]^N. Contradiction. Hence h=±1 and g=±q^i. ∎

Corollary (Alternating sums are not Habiro-units). For odd m≥3, γ_m(q)=∑_{j=0}^{m−1}(−1)^j q^j ∉ U(Z[q]^N).
Proof. Evaluate at q=−1: γ_m(−1)=m≠±1. Units map to units under evaluation Z[q]^N→Z, so γ_m is not a unit. ∎