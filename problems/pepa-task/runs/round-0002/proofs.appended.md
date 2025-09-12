# Rigorous Proofs



Results toward the units conjecture in Z[q]^N

1) Lemma (torsion units are trivial). If u∈Z[q]^N and u^m=1 for some m≥1, then u=±1.
Proof. By Theorem 13 of Habiro, Z[q]^N injects into Z[[q−1]]. Embed further into Q[[q−1]]. Write u=∑_{k≥0} a_k (q−1)^k with a_0∈{±1}. If a_0=1, set v=u; if a_0=−1 and m is even, set v=−u; then in either case v has constant term 1 and v^m=1. In Q[[q−1]], the formal logarithm log(1+x) is well-defined for x in (q−1)Q[[q−1]], and m·log v=log(v^m)=0 implies log v=0, hence v=1. Thus u=±1. If a_0=−1 and m is odd, then u^m has constant term −1, contradicting u^m=1. ∎

2) Lemma (p-adic congruence on μ_{p^∞}). Let p be an odd prime, u∈Z[q]^N, and ζ a primitive p^a-th root of unity. Then u(ζ)≡u(1) (mod p) in Z[ζ].
Proof. In Z[[q−1]] write u(q)=s+∑_{k≥1} c_k (q−1)^k with s=u(1)∈{±1}. In Z_p[ζ] one has ζ≡1 (mod p), so (ζ−1) has positive p-adic valuation. The series ∑ c_k (ζ−1)^k converges p-adically and is divisible by p. Therefore u(ζ)≡s (mod p). ∎

3) Proposition (rigidity from infinitely many exact matches). Let u∈U(Z[q]^N). Suppose there exist i∈Z and an infinite set Z′ of roots of unity of prime-power order such that u(ζ)=±ζ^i for all ζ∈Z′. Then u=±q^i.
Proof. Set w=±q^{−i}u so that w(ζ)=1 for all ζ∈Z′. By Theorem 2 (Habiro), since Z′ contains infinitely many roots of prime-power order, the evaluation map τ_{N,Z′}: Z[q]^N→∏_{ζ∈Z′} Z[ζ] is injective. Thus w=1, so u=±q^i. ∎