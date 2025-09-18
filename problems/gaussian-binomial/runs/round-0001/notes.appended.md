# Research Notes



Problem: f_n(q)=\sum_{i=0}^n \qbinom{n+i}{2i} with [n]=(v^n−v^{−n})/(v−v^{−1}), q=v^2. Claim (original): the sequence (f_n(e^{2π i/n}))_n is periodic.

Clarifying the statement
- Two readings:
  (A) a(n)=f_n(ζ_n) with ζ_n=e^{2π i/n} (n varies with the root); this seems unlikely to be periodic.
  (B) Fix N and study a_N(n)=f_n(ζ_N); this plausibly is N-periodic.

Core identities
- Symmetrized vs standard Gaussian: for 0≤k≤n,
  \qbinom{n}{k}_{sym} = q^{−\frac{k(n−k)}2} \binom{n}{k}_q.
  Hence f_n(q)=\sum_{i=0}^n q^{i(i−n)}\,\binom{n+i}{2i}_q.
- n-OGF:
  \sum_{n≥0} f_n(q)t^n = \sum_{i≥0} \frac{t^i}{\prod_{s=−i}^{i}(1−t q^s)}.
- Half-sum at q=ζ_n:
  f_n(ζ_n)=2+\sum_{j=1}^{\lfloor n/2\rfloor} ζ_n^{−j(n−j)}\,\binom{n−j}{j}_q\big|_{q=ζ_n}.
  Derivation: apply q-Lucas with modulus n to (n+i,2i) and relabel j=n−i.

Computations and observations (reading A)
- Small n: f_2(ζ_2)=1, f_3(ζ_3)=1, f_4(ζ_4)=2, f_5(ζ_5)=2+ζ_5+ζ_5^4=2+2cos(2π/5), f_6(ζ_6)=2.
  Note: the minimal polynomial of 2+2cos(2π/5) is x^2−3x+1 (correction).
- These values already rule out very small periods, but do not yet rigorously disprove periodicity for (A).

Plausible corrected claim (reading B)
- Fix N and q=ζ_N. The OGF suggests \sum_{n≥0} f_n(q)t^n is rational with denominator a power of 1−t^N. If the global denominator reduces to 1−t^N, then n↦f_n(ζ_N) is exactly N-periodic.

Caveats
- The symmetrized q-Pascal recursion involves q^{1/2}; to avoid branch ambiguities at roots of unity, either work in v with q=v^2 (integer exponents) or use the standard q-Pascal identity and convert via the exact factor q^{−k(n−k)/2}.

Next steps
1) Disproving (A): Evaluate f_p(ζ_p) for p=7,11 via the half-sum to see whether values are pairwise distinct across infinitely many primes; aim to certify distinct minimal polynomials.
2) Proving (B): Group the OGF sum over i≡r (mod N) and show each grouped sum has denominator exactly 1−t^N (use ∏_{r=0}^{N−1}(1−t q^r)=1−t^N and telescoping across m). This would yield exact N-periodicity. Alternatively, derive a constant-coefficient linear recurrence for f_n(ζ_N).

Problem clarification and plan (fixed N)
- Task: Fix N and study a_N(n) = f_n(ζ_N) as n varies. Earlier rounds mistakenly analyzed the different problem q = e^{2π i/n} (root order tied to n). The correct setting is now fixed.

Core identities to use
- Symmetric–standard relation: [N;K]_sym(v) = v^{-K(N−K)} [N;K]_q with q=v^2. For our K=2i, K(N−K) is even, so a_N(n) is independent of the sign choice v↦−v for the fixed square root of q.
- q–Lucas at a primitive m-th root (standard Gaussian): Writing X = am + b, Y = cm + d with 0≤b,d<m, we have [X;Y]_q|_{q=ζ_m} = binom(a,c)·[b;d]_q|_{q=ζ_m}.

Immediate consequence: disproof for N=2
- Take q=ζ_2=−1, v^2=q (v=i). By q–Lucas with m=2,
  [n choose k]_{-1} = 0 if n even and k odd; else = binom(⌊n/2⌋, ⌊k/2⌋).
- Thus for odd n=2t+1, the phase v^{-2i(n−i)} = (−1)^{i(n−i)} = 1 for all i, and
  f_n(−1) = ∑_{i=0}^{2t+1} binom(t + ⌊(i+1)/2⌋, i), which is strictly increasing in t (each summand with i≥1 increases when t increases). Numerically: f_3(−1)=5, f_7(−1)=40. Hence the sequence is not periodic; the claimed period ≤ 2N = 4 is contradicted at n=3 vs 7.

Next steps
- Generalize the nonperiodicity argument for other fixed N using q–Lucas with base N. In particular, analyze the subsequence n=tN and the contributions from i multiples of N.
- Cleanly separate notes for the matched-order regime (q=e^{2π i/n}) as a distinct problem variant; do not mix it with the fixed-N analysis.

Disproof of the periodicity claim.

Setup: f_n(q)=\sum_{i=0}^n \qbinom{n+i}{2i}_v with q=v^2 and b=2i even, so \qbinom{a}{b}_v depends only on q. We study a_N(n)=f_n(\zeta_N).

Quick counterexamples:
- N=1: a_1(n)=\sum_i \binom{n+i}{2i}=F_{2n+1}, not periodic.
- N=2 (q=−1): Using the specialization \binom{a}{b}_{−1}=0 if a even, b odd; otherwise \binom{\lfloor a/2\rfloor}{\lfloor b/2\rfloor}, one gets a_2(n)=\sum_{i=0}^n \binom{\lfloor (n+i)/2\rfloor}{i}=F_{n+2}, not periodic (indeed unbounded).

Stronger structure (from residue-class decomposition): For fixed N, writing n=xN+s, one can group i=yN+r and use q-Lucas at q=\zeta_N to factor each summand into a residue-dependent constant times an ordinary binomial \binom{x+y+c}{2y+\delta}. Summing over y yields Fibonacci numbers F_{2x+\cdot}. Consequently, for each residue s the subsequence g_s(x)=a_N(xN+s) satisfies g_s(x+2)=3g_s(x+1)−g_s(x), hence cannot be periodic unless identically zero (and g_0(0)=1). This provides a general nonperiodicity mechanism for all N.

Next steps:
- Formalize the q-Lucas-at-\zeta_N step and write the full recurrence proof.
- Explore periodicity modulo primes (Pisano-type) or closed forms for the coefficients in the decomposition for small N.