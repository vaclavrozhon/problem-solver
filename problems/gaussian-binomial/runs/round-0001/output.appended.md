# Main Results



Counterexample to the periodicity claim (fixed root of unity)

Definitions. For v a formal parameter, set [m]_v=(v^m−v^{−m})/(v−v^{−1}) and
  [A;B]_v = [A]_v [A−1]_v ··· [A−B+1]_v / ([B]_v [B−1]_v ··· [1]_v),
with the usual conventions. Let q=v^2, and define f_n(q)=∑_{i=0}^n [n+i; 2i]_v. For fixed N≥1, let ζ_N=e^{2π i/N} and a_N(n)=f_n(ζ_N).

Main result. The sequence {a_N(n)} need not be periodic. In fact, for N=2 (q=−1), the sequence is not periodic; hence the general periodicity claim (e.g., with period dividing 2N) is false.

Proof. First, relate symmetric and standard Gaussian coefficients: for all N,K,
  [N;K]_v = v^{−K(N−K)} [N;K]_{q} with q=v^2.
Take q=−1 (N=2) and choose v with v^2=−1 (e.g., v=i). Then
  [n+i; 2i]_v = v^{−2i(n−i)} [n+i; 2i]_{−1}.
At q=−1, a special case of q–Lucas (base 2) gives
  [n; k]_{−1} = 0 if n is even and k is odd; otherwise [n; k]_{−1} = binom(⌊n/2⌋, ⌊k/2⌋).
For odd n=2t+1 the phase v^{−2i(n−i)}=(−1)^{i(n−i)} equals 1 for all i, so
  a_2(2t+1) = ∑_{i=0}^{2t+1} binom(t+⌊(i+1)/2⌋, i).
Each summand with i≥1 strictly increases as t increases, hence the odd subsequence a_2(2t+1) is strictly increasing. Concretely, a_2(3)=5 and a_2(7)=40, so no period (in particular none dividing 2N=4) can exist. This disproves the periodicity claim. ∎

Remark. The above also shows that a_N(n) is well-defined (independent of the choice of square root v) in this problem, because K=2i makes K(N−K) even in the conversion formula.