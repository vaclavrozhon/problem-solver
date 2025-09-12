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

Lemma (valuation at p-power roots, p odd). Let p≥3, a≥1, and ζ a primitive p^a-th root in K=Q_p(ζ). With the normalized valuation v_K such that v_K(p)=1, for k=p^s m with p∤m and 0≤s<a,
 v_K(ζ^k−1) = v_K(ζ−1) + s.
Proof. Write ζ=1+π with v_K(π)>0. Since p∤m, (1+π)^m−1 has valuation v_K(π). For s≥0, by the binomial expansion and p-adic lifting (p odd), v_K((1+u)^{p^s}−1)=v_K(u)+s for any u with v_K(u)>0. Apply with u=(1+π)^m−1. ∎

Proposition (valuation of (ζ)_n). With p, a, ζ as above and 0≤n<p^a,
 v_K((ζ)_n) = v_K\big(∏_{r=1}^n (1−ζ^r)\big) = n·v_K(ζ−1) + v_p(n!) ≥ v_p(n!).
Proof. Sum the previous lemma over r=1,…,n, writing r=p^{v_p(r)} m_r with p∤m_r and using additivity of v_p(n!). ∎

Corollary (uniform truncation). For any r≥1, let N(r) be the minimal n with v_p(n!)≥r. Then for every a≥1 and primitive ζ of order p^a, and every u(q)=∑_{n≥0} a_n(q) (q)_n ∈ Z[q]^N,
 u(ζ) ≡ ∑_{n=0}^{N(r)−1} a_n(ζ) (ζ)_n  (mod p^r Z_p(ζ)).
Proof. For n≥N(r), v_K((ζ)_n)≥r, so each term a_n(ζ)(ζ)_n has valuation ≥r. ∎

Proposition (determinant/product identity). If u ∈ U(Z[q]^N), then for every n≥1,
 ∏_{ζ^n=1} u(ζ) = ±1.
Proof. Let R_n=Z[q]/(q^n−1). The image of u is a unit, so multiplication-by-u is a Z-automorphism of the free abelian group R_n with determinant ±1. Over C, C⊗R_n ≅ ⊕_{ζ^n=1} C via evaluation, and the eigenvalues are u(ζ). The determinant equals the product of eigenvalues. ∎

Proposition (rigidity from infinitely many cyclotomic congruences). Let u ∈ U(Z[q]^N). If there exists an infinite T⊂N containing infinitely many prime powers such that u ≡ 1 (mod Φ_n) in Z[q]/(Φ_n) for all n∈T, then u=1 in Z[q]^N. More generally, if u ≡ ±q^i (mod Φ_n) for all n∈T with the same sign and i, then u=±q^i.
Proof. For each n∈T and each primitive ζ of order n, the congruence implies u(ζ)=1 (resp. u(ζ)=±ζ^i). Let Z be the set of such ζ. Since Z contains infinitely many prime-power orders, τ_{N,Z} is injective (Theorem 2), hence u=1 (resp. u=±q^i). ∎

Lemma (canonical exponent from the Ohtsuki expansion). Let u∈Z[q]^N be a unit with Habiro expansion u(q)=∑_{n≥0} a_n(q) (q)_n, a_n∈Z[q]. Then u(1)=a_0(1)∈{±1} and u′(1)=a_0′(1)−a_1(1). In particular, i:=u′(1)/u(1)∈Z.
Proof. Since (q)_0=1 and (q)_n(1)=0 for n≥1, u(1)=a_0(1). For derivatives, (q)_1=1−q so (q)_1′(1)=−1, and for n≥2 the product (q)_n=∏_{k=1}^n(1−q^k) has derivative 0 at q=1 because each summand’s product contains a factor (1−1^ℓ)=0 with ℓ≠j. Hence u′(1)=a_0′(1)−a_1(1). Since u(1)=±1, i∈Z. ∎

Proposition (first-order p-adic matching along μ_{p^∞}). Let p be an odd prime, u∈U(Z[q]^N), ε:=u(1), and i:=u′(1)/u(1). For any a≥1 and any primitive ζ of order p^a, we have in Z_p(ζ):
 u(ζ) ≡ ε·ζ^i  (mod (ζ−1)^2).
Proof. Write X=q−1 and expand in Z_p[[X]]: u(1+X)=ε + ε i X + X^2 w(X), w∈Z_p[[X]]. Substituting X=ζ−1 (which is topologically nilpotent in Z_p(ζ)) gives u(ζ)≡ε+ε i(ζ−1) mod (ζ−1)^2. Also (1+X)^i≡1+iX mod X^2, so ζ^i≡1+i(ζ−1) mod (ζ−1)^2. Multiplying by ε yields the claim. ∎