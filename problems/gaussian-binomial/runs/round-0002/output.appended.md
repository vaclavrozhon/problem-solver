Main result: the fixed-root periodicity claim is false

Definitions. For a formal parameter v, set [m]_v=(v^m−v^{−m})/(v−v^{−1}) and \qbinom{A}{B}_v=([A]_v⋯[A−B+1]_v)/([B]_v⋯[1]_v), with the usual conventions. Let q=v^2 and define f_n(q)=\sum_{i=0}^n \qbinom{n+i}{2i}_v. For fixed N≥1, let ζ_N=e^{2π i/N} and a_N(n)=f_n(ζ_N).

Theorem (counterexample at N=2). For N=2 (q=−1), the sequence a_2(n)=f_n(−1) is not periodic. In fact, for t≥0,
- a_2(2t+1)=F_{2t+3},
- a_2(2t)=F_{2t−1} for t≥1 (and a_2(0)=1),
where F_0=0, F_1=1, F_{k+1}=F_k+F_{k−1}.

Proof. Convert symmetric to standard Gaussians: \qbinom{a}{b}_v = v^{b(b−a)} [a;b]_q with q=v^2. Thus
f_n(−1)=\sum_{i=0}^n (−1)^{i(i−n)} [n+i;2i]_q\big|_{q=−1}.
We evaluate the standard Gaussian at q=−1.
Lemma. For 0≤k≤n, [n;k]_q|_{q=−1}=0 if n is even and k odd; otherwise [n;k]_q|_{q=−1}=\binom{\lfloor n/2\rfloor}{\lfloor k/2\rfloor}.
Proof of lemma. Let H(n,k)=[n;k]_q with q-Pascal H(n,k)=H(n−1,k)+q^{n−k}H(n−1,k−1). Evaluate at q=−1 and argue by induction on n. For n odd, H(2t+1,k)=H(2t,k)−(−1)^k H(2t,k−1), which equals \binom{t}{\lfloor k/2\rfloor}. For n even, H(2t,k)=H(2t−1,k)+(−1)^k H(2t−1,k−1), yielding \binom{t}{k/2} if k even and 0 if k odd.
Now for n=2t+1 the sign (−1)^{i(i−n)}=1, and the lemma gives [n+i;2i]_{−1}=\binom{t+\lfloor (i+1)/2\rfloor}{i}. Splitting i even/odd and summing the standard identities ∑_{j=0}^{t} \binom{t+j}{2j}=F_{2t+1} and ∑_{j=0}^{t} \binom{t+j+1}{2j+1}=F_{2t+2} yields a_2(2t+1)=F_{2t+3}.
For n=2t≥2, (−1)^{i(i−n)}=(−1)^i and [n+i;2i]_{−1}=\binom{t+\lfloor i/2\rfloor}{i}. Splitting even/odd i and summing ∑_{j=0}^{t} \binom{t+j}{2j}=F_{2t+1} and ∑_{j=0}^{t−1} \binom{t+j}{2j+1}=F_{2t} gives a_2(2t)=F_{2t−1}. The value a_2(0)=1 is immediate. Hence {a_2(n)} is unbounded (e.g., a_2(1)=2, a_2(3)=5, a_2(5)=13, a_2(7)=34) and not periodic. ∎

Conclusion. The claim “for fixed N, {a_N(n)} is periodic (e.g., with period dividing 2N)” is false in general; it already fails for N=2, and likewise for N=1 (where f_n(1)=F_{2n+1}).