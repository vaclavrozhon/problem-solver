Main result: the fixed-root periodicity claim is false

Definitions. For a formal parameter v, set [m]_v=(v^m−v^{−m})/(v−v^{−1}) and [A;B]_v=([A]_v⋯[A−B+1]_v)/([B]_v⋯[1]_v), with the usual conventions. Let q=v^2 and define f_n(q)=∑_{i=0}^n [n+i; 2i]_v. For fixed N≥1, write ζ_N=e^{2πi/N} and a_N(n)=f_n(ζ_N).

Theorem (counterexample at N=2). For N=2 (q=−1), the sequence a_2(n)=f_n(−1) is not periodic. In fact, for t≥0,
- a_2(2t+1)=F_{2t+3},
- a_2(2t)=F_{2t−1} (with a_2(0)=1=F_{−1}),
where F_k denotes the Fibonacci sequence (F_0=0, F_1=1, F_{k+1}=F_k+F_{k−1}). Thus {a_2(n)} is unbounded; for example a_2(1)=2, a_2(3)=5, a_2(5)=13, a_2(7)=34.

Proof. Relate the symmetric and standard Gaussian coefficients: for all a≥b≥0 and q=v^2,
  [a;b]_v = v^{b(b−a)} [a;b]_q.
Hence
  f_n(−1)=∑_{i=0}^n (−1)^{i(i−n)} [n+i;2i]_q|_{q=−1}.
At q=−1, the standard Gaussian specializes as follows: for 0≤k≤n,
  [n;k]_q|_{q=−1}=0 if n is even and k is odd, and otherwise equals C(⌊n/2⌋, ⌊k/2⌋).
This is proved by induction from the q-Pascal recursion [n;k]_q=[n−1;k]_q+q^{n−k}[n−1;k−1]_q.
For odd n=2t+1, the sign factor is 1 since i(i−n) is even, so
  a_2(2t+1)=∑_{j=0}^t C(t+j, 2j) + ∑_{j=0}^t C(t+j+1, 2j+1) = F_{2t+1}+F_{2t+2}=F_{2t+3}.
For even n=2t, the sign factor is (−1)^i, giving
  a_2(2t)=∑_{j=0}^t C(t+j, 2j) − ∑_{j=0}^{t−1} C(t+j, 2j+1) = F_{2t+1}−F_{2t}=F_{2t−1}.
The Fibonacci equalities follow from the standard diagonal-sum identities ∑_{y≥0} C(x+y, 2y)=F_{2x+1} and ∑_{y≥0} C(x+y, 2y+1)=F_{2x}. Therefore a_2 is not periodic, and the general claim of periodicity (e.g., with period dividing 2N) is false. ∎