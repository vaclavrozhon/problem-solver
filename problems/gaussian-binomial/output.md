Main result: the fixed-root periodicity claim is false for every N

Definitions. For a formal parameter v, set [m]_v=(v^m−v^{−m})/(v−v^{−1}) and [A;B]_v=([A]_v⋯[A−B+1]_v)/([B]_v⋯[1]_v), with the usual conventions. Let q=v^2 and define f_n(q)=∑_{i=0}^n [n+i;2i]_v. For fixed N≥1, let ζ_N=e^{2πi/N} and a_N(n)=f_n(ζ_N).

Lemma (symmetric→standard conversion). For a≥b≥0 and q=v^2, [a;b]_v=v^{b(b−a)}[a;b]_q.

Lemma (q–Lucas at ζ_N). Writing a=a_1N+a_0 and b=b_1N+b_0 with 0≤a_0,b_0<N, one has at q=ζ_N: [a;b]_q=0 if b_0>a_0, and otherwise [a;b]_q=binom(a_1,b_1)[a_0;b_0]_q.

Theorem (uniform counterexample). For every N≥1 and all x≥0,
f_{xN}(ζ_N)=F_{2x+1}+C_N F_{2x},
where C_N=∑_{r=⌈N/2⌉}^{N−1} ζ_N^{r^2} [r;2r−N]_q evaluated at q=ζ_N. In particular, the subsequence n=xN is unbounded, so the full sequence {a_N(n)} is not periodic in n.

Proof. By the conversion lemma,
f_{xN}(ζ_N)=∑_{i=0}^{xN} ζ_N^{i(i−xN)} [xN+i;2i]_q|_{q=ζ_N}.
Write i=yN+r with 0≤r<N. Then ζ_N^{i(i−xN)}=ζ_N^{r^2}. Apply q–Lucas to [xN+yN+r;2yN+2r]_q. If r=0, the term equals binom(x+y,2y) and summing y=0..x yields F_{2x+1}. If 0<r<N/2, then b_0=2r>a_0=r and the term vanishes. If ⌈N/2⌉≤r≤N−1, the term equals binom(x+y,2y+1)[r;2r−N]_q and summing y=0..x−1 yields F_{2x}. Summing over r gives f_{xN}(ζ_N)=F_{2x+1}+C_NF_{2x}. Since F_{2x+1} grows with x and has coefficient 1, {f_{xN}(ζ_N)} is unbounded. Any global period P would force periodicity of the subsequence with step N dividing lcm(P,N), a contradiction. ∎

Consequently, the claim that {a_N(n)} is periodic (e.g., with period dividing 2N) is false for every N≥1.