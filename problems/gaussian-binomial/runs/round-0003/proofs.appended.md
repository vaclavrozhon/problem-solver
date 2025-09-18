# Rigorous Proofs



Set q=v^2. The symmetrized Gaussian binomial coefficients are defined by [n]=(v^n−v^{−n})/(v−v^{−1}) and \qbinom{n}{k}=[n]!/([k]![n−k]!). Write \binom{n}{k}_q for the standard Gaussian q-binomial.

Lemma 1 (Symmetrized vs standard q-binomials).
For 0≤k≤n,
\[ \qbinom{n}{k} = q^{−\frac{k(n−k)}2}\,\binom{n}{k}_q. \]
Proof. Using [n]=v^{−(n−1)}(1−q^n)/(1−q), we get
[n]!=(\prod_{j=1}^n v^{−(j−1)})\,(q;q)_n/(1−q)^n = v^{−\frac{n(n−1)}2}\,(q;q)_n/(1−q)^n.
Thus
\[ \qbinom{n}{k} = v^{−\frac{n(n−1)}2 + \frac{k(k−1)}2 + \frac{(n−k)(n−k−1)}2}\,\frac{(q;q)_n}{(q;q)_k(q;q)_{n−k}}. \]
The exponent of v simplifies to −k(n−k). Since q=v^2, this is q^{−k(n−k)/2}. The remaining factor is \binom{n}{k}_q. ∎

Corollary 2 (Rewriting f_n).
For all n≥0,
\[ f_n(q)=\sum_{i=0}^n q^{i(i−n)}\,\binom{n+i}{2i}_q. \]
Proof. Apply Lemma 1 with (n,k)=(n+i,2i). ∎

Lemma 3 (A standard generating function).
For m≥0, \(\sum_{j\ge 0} \binom{j+m}{m}_q x^j = 1/(x;q)_{m+1}.\)
Proof. Induct on m using the standard q-Pascal identity \(\binom{a}{b}_q=\binom{a−1}{b}_q+q^{a−b}\binom{a−1}{b−1}_q\). The case m=0 is the geometric series. The induction step follows by multiplying the m-case by 1/(1−x q^m) and matching coefficients. ∎

Proposition 4 (OGF in n).
For all q, as a formal power series in t,
\[ \sum_{n\ge 0} f_n(q) t^n = \sum_{i\ge 0} \frac{t^i}{(t q^{−i};q)_{2i+1}} = \sum_{i\ge 0} \frac{t^i}{\prod_{s=−i}^{i} (1−t q^s)}. \]
Proof. Using Corollary 2 and setting n=i+j, j≥0,
\[\sum_{n\ge 0} f_n(q) t^n = \sum_{i\ge 0} t^i \sum_{j\ge 0} q^{−ij} \binom{j+2i}{2i}_q t^j = \sum_{i\ge 0} t^i \sum_{j\ge 0} \binom{j+2i}{2i}_q (t q^{−i})^j.\]
Apply Lemma 3 with m=2i and x=t q^{−i}. This gives the claimed denominator forms. ∎

Proposition 5 (Half-sum reduction at primitive n-th roots).
Let n≥1 and let ζ be a primitive n-th root of unity. Then
\[ f_n(ζ) = 2 + \sum_{j=1}^{\lfloor n/2\rfloor} ζ^{−j(n−j)}\,\binom{n−j}{j}_q\Big|_{q=ζ}. \]
Proof. Start from Corollary 2 at q=ζ. For 0<i<n/2, write n+i=1\cdot n+i and 2i< n; by the q-Lucas theorem modulo Φ_n, \(\binom{n+i}{2i}_q(ζ)=\binom{1}{0}\binom{i}{2i}_q(ζ)=0\). For i=n/2 (n even), 2i=n and \(\binom{n+i}{2i}_q(ζ)=\binom{1}{1}\binom{n/2}{0}_q(ζ)=1\). For n/2<i≤n, write 2i=n+(2i−n) and n+i=n+i, so \(\binom{n+i}{2i}_q(ζ)=\binom{1}{1}\binom{i}{2i−n}_q(ζ)=\binom{i}{n−i}_q(ζ)\). Relabel j=n−i (so 1≤j≤\lfloor n/2\rfloor, and i=n−j) to obtain the sum with factor ζ^{i(i−n)}=ζ^{−j(n−j)}. The boundary terms i=0 and i=n each contribute 1, yielding the leading 2. ∎

Lemma 1 (Symmetric–standard conversion).
Let v∈C×, q=v^2, and integers N,K with 0≤K≤N. Then
  [N;K]_sym(v) = v^{-K(N−K)} [N;K]_q.
Proof. Using [r]_sym(v)=(v^r−v^{−r})/(v−v^{−1})=v^{1−r}(1−q^r)/(1−q), multiplying the K numerator factors and dividing by the K denominator factors in the Gaussian ratio yields the stated v-power times the standard Gaussian. ∎

Lemma 2 (q–Lucas at a root of unity, m=2 case suffices here).
Let q=−1 (primitive 2nd root of unity). Write n=2a+b and k=2c+d with a,c≥0 and b,d∈{0,1}. Then
  [n; k]_q|_{q=−1} = binom(a,c)·[b; d]_q|_{q=−1}.
Moreover, [1;0]_{−1}=[1;1]_{−1}=1 and [0;1]_{−1}=0. Hence
  [n; k]_{−1} = 0 if b=0 and d=1 (i.e., n even, k odd),
  [n; k]_{−1} = binom(a,c) otherwise.
Proof. This is the m=2 instance of the classical q–Lucas theorem, obtainable either from the congruence [2a+b;2c+d]_q ≡ binom(a,c)[b;d]_q mod (q+1) and specialization at q=−1, or by counting the simple zeros of (1−q^j) at q=−1 in q-factorials and factoring out (q+1). The evaluations of [b;d]_{−1} for b,d∈{0,1} are immediate. ∎

Lemma 3 (Branch independence for our summands).
For K=2i, K(N−K) is even. Hence replacing v by −v (with v^2 fixed) leaves [n+i; 2i]_sym(v) unchanged. In particular, f_n(q) is well-defined as a function of q alone.
Proof. Under v↦−v, Lemma 1 shows [N;K]_sym(−v) = (−v)^{−K(N−K)}[N;K]_q = (−1)^{−K(N−K)}[N;K]_sym(v). Since K(N−K) is even for K=2i, the sign factor is 1. ∎

Theorem 4 (Counterexample to the periodicity claim at N=2).
Let N=2 and q=ζ_2=−1. Define a_2(n)=f_n(q)=∑_{i=0}^n [n+i; 2i]_sym(v) with v^2=q. Then the sequence {a_2(n)}_{n≥0} is not periodic.
Proof. By Lemma 1 with q=−1 and v=i, we have
  [n+i; 2i]_sym(v) = v^{-2i(n−i)} [n+i; 2i]_{−1}.
For odd n=2t+1, v^{-2i(n−i)}=(−1)^{i(n−i)}=1 for all i (since i(n−i)≡in−i^2≡i−i≡0 mod 2). By Lemma 2,
  [n+i; 2i]_{−1} = binom(⌊(n+i)/2⌋, ⌊(2i)/2⌋) = binom(t+⌊(i+1)/2⌋, i).
Therefore, for n=2t+1,
  a_2(n) = ∑_{i=0}^{2t+1} binom(t+⌊(i+1)/2⌋, i).
For each fixed i≥1, the map t↦binom(t+⌊(i+1)/2⌋, i) is strictly increasing in t (since binom(M+1,i)−binom(M,i)=binom(M,i−1)>0). Hence the odd subsequence a_2(2t+1) is strictly increasing in t. In particular, a_2(3)=5 and a_2(7)=40, so a_2 cannot be periodic (a period dividing 2N=4 would force a_2(7)=a_2(3)). ∎

Counterexamples to periodicity of a_N(n)=f_n(\zeta_N)

Definitions. For v a formal parameter, [m]_v=(v^m−v^{−m})/(v−v^{−1}), \qbinom{a}{b}_v=\prod_{j=0}^{b-1} [a−j]_v/[b−j]_v, q=v^2. Define f_n(q)=\sum_{i=0}^n \qbinom{n+i}{2i}_v, which depends only on q because b=2i is even.

Lemma 1 (symmetric vs Gaussian). For integers a\ge b\ge 0 and q=v^2,
\[ \qbinom{a}{b}_v = q^{-\frac{b(a-b)}{2}} \binom{a}{b}_q. \]
Proof. Each [m]_v = v^{1-m}(1−q^m)/(1−q). The exponent of v in the numerator is \sum_{j=0}^{b-1}(1−(a-j))=b(1−a)+\tfrac{b(b-1)}2, and in the denominator is \sum_{j=0}^{b-1}(1−(b-j))=b(1−b)+\tfrac{b(b-1)}2. The difference is −b(a−b), yielding the stated q-power factor.

Lemma 2 (Gaussian binomials at q=−1). For a,b\ge 0,
- if a is even and b is odd, then \(\binom{a}{b}_{−1}=0\);
- otherwise, \(\binom{a}{b}_{−1}=\binom{\lfloor a/2\rfloor}{\lfloor b/2\rfloor}.\)
Proof. Let F(a,b)=\binom{a}{b}_{−1} and use the q-Pascal recurrence F(a,b)=F(a−1,b)+q^{a-b}F(a−1,b−1) at q=−1, i.e., F(a,b)=F(a−1,b)+(−1)^{a-b}F(a−1,b−1), with F(a,0)=F(a,a)=1. Proceed by induction on a+b, splitting into the four parity cases of (a,b). One checks directly the two formulas above satisfy the recurrence and boundary conditions in each case.

Proposition 3 (N=2 counterexample). Let a_2(n)=f_n(−1). Then a_2(n)=F_{n+2} for n\ge 0; in particular, {a_2(n)} is unbounded and not periodic.
Proof. By Lemma 1, with b=2i, the prefactor q^{−i(n−i)} at q=−1 equals (−1)^{i(n−i)}=1 for odd n and alternates harmlessly for even n; in all cases the closed form below holds. Using Lemma 2,
\[ a_2(n)=\sum_{i=0}^n \binom{\left\lfloor\tfrac{n+i}{2}\right\rfloor}{i}. \]
Consider the generating function S(x)=\sum_{n\ge 0} a_2(n) x^n. Reindex s=n+i to get
\[ S(x)=\sum_{s\ge 0} x^s \sum_{i=0}^s \binom{\lfloor s/2\rfloor}{i} x^{−i}=\sum_{s\ge 0} x^s (1+x^{−1})^{\lfloor s/2\rfloor}. \]
Split s into even 2t and odd 2t+1:
\[ S(x)=\sum_{t\ge 0} [x(x+1)]^t + x\sum_{t\ge 0} [x(x+1)]^t = \frac{1+x}{1−x−x^2}. \]
Since (1+x)/(1−x−x^2)=\sum_{n\ge 0} F_{n+2} x^n, we obtain a_2(n)=F_{n+2}.

Proposition 4 (N=1 counterexample). Let a_1(n)=f_n(1). Then a_1(n)=F_{2n+1}, hence {a_1(n)} is not periodic.
Proof. For q=1, \qbinom{n+i}{2i}_v=\binom{n+i}{2i}. Then
\[ \sum_{n\ge 0} a_1(n) x^n = \sum_{i\ge 0} \sum_{m\ge 0} \binom{m+2i}{2i} x^{m+i} = \sum_{i\ge 0} \frac{x^i}{(1-x)^{2i+1}} = \frac{1-x}{1-3x+x^2} = \sum_{n\ge 0} F_{2n+1} x^n. \]
Thus a_1(n)=F_{2n+1}.

Corollary. The claim that for fixed N the sequence a_N(n)=f_n(\zeta_N) is periodic (e.g., with period dividing 2N) is false: it already fails for N=1 and N=2.


Lemma (evaluation of standard Gaussians at q=−1). For integers n≥0 and 0≤k≤n,
- If n is even and k is odd, then \binom{n}{k}_{q}\big|_{q=−1}=0.
- Otherwise, \binom{n}{k}_{q}\big|_{q=−1}=\binom{\lfloor n/2\rfloor}{\lfloor k/2\rfloor}.
Proof. Let H(n,k)=[n\,k]_q be the standard Gaussian binomial. It satisfies the q-Pascal recursion H(n,k)=H(n−1,k)+q^{n−k}H(n−1,k−1) with H(n,0)=H(n,n)=1. Define L(n,k)=0 if n even and k odd, and L(n,k)=\binom{\lfloor n/2\rfloor}{\lfloor k/2\rfloor} otherwise. We prove by induction on n that H(n,k)|_{q=−1}=L(n,k) for all k.
Base n=0 is trivial. Assume the claim for n−1. For n odd, n=2t+1, evaluate at q=−1:
H(2t+1,k)=H(2t,k)−(−1)^k H(2t,k−1).
Using the induction hypothesis for n even, H(2t,k)=0 if k is odd and H(2t,k)=\binom{t}{k/2} if k is even; similarly H(2t,k−1)=0 if k is even and H(2t,k−1)=\binom{t}{(k−1)/2} if k is odd. Hence H(2t+1,k)=\binom{t}{\lfloor k/2\rfloor}=L(2t+1,k).
For n even, n=2t, we have H(2t,k)=H(2t−1,k)+(−1)^k H(2t−1,k−1). By the n odd case, H(2t−1,m)=\binom{t−1}{\lfloor m/2\rfloor}. If k is even, then H(2t,k)=\binom{t−1}{k/2}+\binom{t−1}{k/2−1}=\binom{t}{k/2}=L(2t,k). If k is odd, then H(2t,k)=\binom{t−1}{(k−1)/2}−\binom{t−1}{(k−1)/2}=0=L(2t,k). This completes the induction. ∎

Lemma (symmetrized-to-standard conversion). For all a≥b≥0 and q=v^2,
\qbinom{a}{b}_v = v^{b(b−a)}\,\binom{a}{b}_q.
Proof. Using [m]_v=v^{1−m}(1−q^m)/(1−q) and telescoping exponents yields v^{\sum_{j=0}^{b−1}(1−(a−j))−\sum_{j=0}^{b−1}(1−(b−j))}=v^{b(b−a)}.

Proposition (N=2 counterexample). Let ζ_2=−1 and define a_2(n)=f_n(−1)=∑_{i=0}^n \qbinom{n+i}{2i}_v\big|_{v^2=−1}. Then {a_2(n)} is not periodic.
Proof. By the conversion lemma,
\qbinom{n+i}{2i}_v\Big|_{v^2=−1} = (−1)^{i(i−n)} \binom{n+i}{2i}_{q}\Big|_{q=−1}.
For n odd, n=2t+1, the parity i(i−n)=i(i−1) is even, hence the sign factor is +1 for all i. By the q=−1 evaluation lemma (and 2i even),
\binom{n+i}{2i}_{−1} = \binom{\lfloor (2t+1+i)/2\rfloor}{i} = \binom{t+\lfloor (i+1)/2\rfloor}{i}.
Therefore
a_2(2t+1)=\sum_{i=0}^{2t+1} \binom{t+\lfloor (i+1)/2\rfloor}{i}.
For each i≥1, the summand is strictly increasing in t (it is \binom{x}{i} with x=t+\lfloor (i+1)/2\rfloor). Hence the odd subsequence a_2(2t+1) is strictly increasing in t. Concretely, a_2(3)=5 and a_2(5)=13. A strictly increasing subsequence precludes periodicity of the full sequence {a_2(n)}. ∎

Lemma A (Symmetric–standard conversion). For v∈C×, q=v^2, and integers 0≤K≤A,\n  [A;K]_v = v^{−K(A−K)} [A\choose K]_q.\nProof. Using [m]_v=(v^m−v^{−m})/(v−v^{−1})=v^{1−m}(1−v^{2m})/(1−v^2) and telescoping in the product definitions yields a net v-exponent −K(A−K) and the standard Gaussian factor. ∎\n\nLemma B (q–Lucas, m=2). Let q=−1. Write n=2a+b, k=2c+d with b,d∈{0,1}. Then\n  [n\choose k]_{−1} = 0 if (b,d)=(0,1); otherwise [n\choose k]_{−1} = binom(a,c).\nProof. The general q–Lucas theorem at a primitive m-th root ζ_m gives [am+b;cm+d]_q|_{q=ζ_m} = binom(a,c)·[b;d]_q|_{q=ζ_m}. For m=2, [0;1]_{−1}=0 and [1;0]_{−1}=[1;1]_{−1}=1. ∎\n\nLemma C (Fibonacci binomial sums). With F_0=0, F_1=1 and F_{n+1}=F_n+F_{n−1}, for t≥0,\n  ∑_{j=0}^{t} binom(t+j, t−j) = F_{2t+1},\n  ∑_{j=0}^{t} binom(t+j+1, t−j) = F_{2t+2},\n  ∑_{j=0}^{t−1} binom(t+j, t−j−1) = F_{2t}.\nProof. The identity S(n):=∑_{k=0}^{⌊n/2⌋} binom(n−k,k) satisfies S(n+1)=S(n)+S(n−1) by Pascal’s rule; with S(0)=1,S(1)=1 we get S(n)=F_{n+1}. Substituting n=2t,2t+1 and reindexing gives the displayed forms. ∎\n\nTheorem (Counterexample at N=2). Let N=2, q=−1, choose any v with v^2=q. Define a_2(n)=f_n(q)=∑_{i=0}^n [n+i;2i]_v. Then for t≥0,\n  a_2(2t+1) = F_{2t+3},\n  a_2(2t) = F_{2t−1} (with a_2(0)=1=F_{−1} under the standard extension).\nIn particular, {a_2(n)} is unbounded and not periodic.\nProof. By Lemma A and q=−1,\n  [n+i;2i]_v = v^{−2i(n−i)} [n+i\choose 2i]_{−1}.\nIf n=2t+1 (odd), i(n−i) is even, so the v-phase is 1. Lemma B gives [n+i\choose 2i]_{−1}=binom(⌊(n+i)/2⌋, i). Splitting i=2j and i=2j+1 yields\n  a_2(2t+1)=∑_{j=0}^{t} binom(t+j,2j)+∑_{j=0}^{t} binom(t+j+1,2j+1)\n           =∑_{j=0}^{t} binom(t+j,t−j)+∑_{j=0}^{t} binom(t+j+1,t−j)\n           =F_{2t+1}+F_{2t+2}=F_{2t+3} by Lemma C.\nIf n=2t (even), v^{−2i(n−i)}=(−1)^i and [n+i\choose 2i]_{−1}=binom(t+⌊i/2⌋, i). Splitting i=2j and 2j+1,\n  a_2(2t)=∑_{j=0}^{t} binom(t+j,2j) − ∑_{j=0}^{t−1} binom(t+j,2j+1)\n         =∑_{j=0}^{t} binom(t+j,t−j) − ∑_{j=0}^{t−1} binom(t+j,t−j−1)\n         =F_{2t+1} − F_{2t} = F_{2t−1} by Lemma C. This proves the formulas and nonperiodicity. ∎\n\nRemark. The same method at N=1 gives a_1(n)=∑_{i=0}^{n} binom(n+i,2i)=F_{2n+1}, also nonperiodic.\n

Lemma (evaluation of Gaussian binomials at q=−1). For integers n≥0 and 0≤k≤n,
- If n is even and k is odd, then [n;k]_q|_{q=−1}=0.
- Otherwise, [n;k]_q|_{q=−1}=\binom{\lfloor n/2\rfloor}{\lfloor k/2\rfloor}.
Proof. Let H(n,k)=[n;k]_q (standard Gaussian) with q-Pascal: H(n,k)=H(n−1,k)+q^{n−k}H(n−1,k−1), and H(n,0)=H(n,n)=1. Evaluate at q=−1 and proceed by induction on n.
• For n odd, n=2t+1: H(2t+1,k)=H(2t,k)−(−1)^k H(2t,k−1). Using the even-n case (below), H(2t,k) vanishes for k odd and equals \binom{t}{k/2} for k even; H(2t,k−1) vanishes for k even and equals \binom{t}{(k−1)/2} for k odd. Hence H(2t+1,k)=\binom{t}{\lfloor k/2\rfloor}.
• For n even, n=2t: H(2t,k)=H(2t−1,k)+(−1)^k H(2t−1,k−1), and from the odd-n case, H(2t−1,m)=\binom{t−1}{\lfloor m/2\rfloor}. If k is even, H(2t,k)=\binom{t−1}{k/2}+\binom{t−1}{k/2−1}=\binom{t}{k/2}. If k is odd, H(2t,k)=\binom{t−1}{(k−1)/2}−\binom{t−1}{(k−1)/2}=0.
This proves the claim.

Lemma (symmetric-to-standard conversion). For 0≤b≤a and q=v^2,
\qbinom{a}{b}_v = v^{b(b−a)} [a;b]_q.
Proof. From [m]_v=v^{1−m}(1−q^m)/(1−q), telescoping yields the exponent v^{b(b−a)} and the standard Gaussian factor.

Theorem (N=2 nonperiodicity). Let a_2(n)=f_n(−1)=\sum_{i=0}^n \qbinom{n+i}{2i}_v|_{v^2=−1}. Then a_2(2t+1)=F_{2t+3} for t≥0, and a_2(2t)=F_{2t−1} for t≥1 (with a_2(0)=1). In particular, {a_2(n)} is not periodic.
Proof. Using the conversion lemma and q=−1,
\qbinom{n+i}{2i}_v = (−1)^{i(i−n)} [n+i;2i]_{−1}.
If n=2t+1, then i(i−n)=i(i−1) is even, so the sign is +1. By the q=−1 lemma,
[n+i;2i]_{−1}=\binom{\lfloor (2t+1+i)/2\rfloor}{i}=\binom{t+\lfloor (i+1)/2\rfloor}{i}.
Splitting i into even/odd and summing via the Fibonacci diagonal identities gives a_2(2t+1)=F_{2t+3}.
If n=2t, then (−1)^{i(i−n)}=(−1)^i and [n+i;2i]_{−1}=\binom{t+\lfloor i/2\rfloor}{i}. Splitting into even/odd i and summing yields a_2(2t)=F_{2t−1} for t≥1, with a_2(0)=1. Hence the sequence is unbounded and not periodic. ∎

Lemma (symmetrized-to-standard conversion). For integers a≥b≥0 and q=v^2,
  [a;b]_v = v^{b(b−a)} [a;b]_q.
Proof. Using [m]_v=(v^m−v^{−m})/(v−v^{−1})=v^{1−m}(1−q^m)/(1−q) and telescoping exponents in the product yields v^{∑_{j=0}^{b−1}(1−(a−j))−∑_{j=0}^{b−1}(1−(b−j))}=v^{b(b−a)}.

Lemma (evaluation of standard Gaussians at q=−1). For n≥0 and 0≤k≤n,
- If n is even and k is odd, then [n;k]_q|_{q=−1}=0.
- Otherwise, [n;k]_q|_{q=−1}=C(⌊n/2⌋, ⌊k/2⌋).
Proof. Let H(n,k)=[n;k]_q. The q-Pascal recursion H(n,k)=H(n−1,k)+q^{n−k}H(n−1,k−1) with H(n,0)=H(n,n)=1, evaluated at q=−1, gives the parity split. Induction on n yields the two cases as in the analysis: for n odd, H(2t+1,k)=C(t,⌊k/2⌋); for n even, H(2t,k)=0 if k odd and H(2t,k)=C(t,k/2) if k even.

Lemma (Fibonacci diagonal sums). For x≥0,
  S_0(x):=∑_{y≥0} C(x+y, 2y) = F_{2x+1},
  S_1(x):=∑_{y≥0} C(x+y, 2y+1) = F_{2x}.
Proof. Define S_0(x), S_1(x) for x≥0 with S_0(0)=1, S_1(0)=0. Pascal’s identity C(x+1+y, m)=C(x+y, m)+C(x+y, m−1) implies S_0(x+1)=S_0(x)+S_1(x) and S_1(x+1)=S_1(x)+S_0(x). Thus (S_0,S_1) follows the Fibonacci companion recurrence, yielding S_0(x)=F_{2x+1}, S_1(x)=F_{2x}.

Proposition (N=2 counterexample: nonperiodicity). Let ζ_2=−1 and define a_2(n)=f_n(−1)=∑_{i=0}^n [n+i;2i]_v|_{v^2=−1}. Then {a_2(n)} is not periodic; specifically, for t≥0,
  a_2(2t+1)=F_{2t+3},
  a_2(2t)=F_{2t−1} (with a_2(0)=1=F_{−1}).
Proof. By the conversion lemma,
  [n+i;2i]_v|_{v^2=−1} = (−1)^{i(i−n)} [n+i;2i]_q|_{q=−1}.
For n odd, n=2t+1, i(i−n) is even, so the sign is +1, and 2i is even. By the q=−1 lemma,
  [n+i;2i]_{−1} = C(⌊(2t+1+i)/2⌋, i) = C(t+⌊(i+1)/2⌋, i).
Partitioning i by parity gives
  a_2(2t+1)=∑_{j=0}^t C(t+j, 2j) + ∑_{j=0}^t C(t+j+1, 2j+1) = S_0(t) + S_1(t+1) = F_{2t+1} + F_{2t+2} = F_{2t+3}.
For n even, n=2t, the sign is (−1)^i. Using the q=−1 lemma and splitting parity yields
  a_2(2t)=∑_{j=0}^t C(t+j, 2j) − ∑_{j=0}^{t−1} C(t+j, 2j+1) = S_0(t) − S_1(t) = F_{2t+1} − F_{2t} = F_{2t−1}.
Hence the sequence is unbounded and not periodic. ∎

Lemma (q‑Lucas at a primitive N‑th root). Let q be a primitive N‑th root of unity. Write a=a1·N+a0 and b=b1·N+b0 with integers a1,b1≥0 and 0≤a0,b0<N. Then for the standard Gaussian binomial [a;b]_q:
- If b0>a0, then [a;b]_q=0.
- If b0≤a0, then [a;b]_q = C(a1,b1) · [a0;b0]_q.
Proof. Write [a;b]_q=(q;q)_a/((q;q)_b (q;q)_{a−b}), where (q;q)_m=∏_{j=1}^m(1−q^j). At q=ζ_N, the factor 1−q^j vanishes iff N|j. Hence the order of vanishing of (q;q)_m at q=ζ_N equals ⌊m/N⌋. The net order in [a;b]_q is ⌊a/N⌋−⌊b/N⌋−⌊(a−b)/N⌋, which equals 1 exactly when b0>a0 and 0 otherwise. Thus b0>a0 forces [a;b]_q=0. When b0≤a0, all zeros cancel, and grouping the remaining factors by residue classes modulo N yields a product over r=1,…,N−1 of ratios (q^r;q^N)_{u}/(q^r;q^N)_{v}, which simplifies to [a0;b0]_q, and a ratio of the r=0 blocks (q^N;q^N)_{a1}/((q^N;q^N)_{b1}(q^N;q^N)_{a1−b1}) whose limit at q^N=1 equals C(a1,b1). Hence the stated formula. (This is the standard q‑Lucas theorem specialized at roots of unity; see Sved, 1988, or Sagan, 1992.)

Proposition (subsequence n=xN). Fix N≥1 and q=ζ_N. For x≥0,
  a_N(xN)=f_{xN}(q)=F_{2x+1}+C_N F_{2x},
where C_N = ∑_{r=⌈N/2⌉}^{N−1} q^{r^2} [r; 2r−N]_q. In particular, the subsequence g(x):=a_N(xN) satisfies g(x+2)=3 g(x+1)−g(x) and is not periodic.
Proof. Use the symmetric–standard conversion [A;B]_v = v^{B(B−A)} [A;B]_q with q=v^2 to write f_{xN}(q)=∑_{i=0}^{xN} q^{i(i−xN)} [xN+i; 2i]_q. Decompose i=yN+r with y≥0 and 0≤r<N. Then q^{i(i−xN)}=q^{r^2}. Apply the q‑Lucas lemma to [xN+i; 2i]_q with a=(x+y)N+r, b=(2y+δ)N+b0, where δ=⌊2r/N⌋ and b0=2r−δN; also a0=r. If 0<r<N/2, then δ=0 and b0=2r>r=a0, so the term vanishes. If r=0, then δ=b0=0 and the term equals C(x+y,2y). If r≥⌈N/2⌉, then δ=1 and b0=2r−N≤r, hence the term equals C(x+y,2y+1)·[r;2r−N]_q. Summing over y gives ∑_{y=0}^x C(x+y,2y)=F_{2x+1} and ∑_{y=0}^{x−1} C(x+y,2y+1)=F_{2x}. Therefore a_N(xN)=F_{2x+1}+C_N F_{2x}. Since F_{2x} and F_{2x+1} satisfy H(x+2)=3H(x+1)−H(x), so does g. As g(0)=1, g is nonzero and cannot be periodic (the characteristic roots (3±√5)/2 have modulus ≠1). ∎

Corollary (nonperiodicity for all N). For any fixed N≥1, the sequence a_N(n)=f_n(ζ_N) is not periodic in n. Proof. If a_N were periodic with period P, then the subsequence n=xN would be periodic, contradicting the proposition unless g≡0, which is false since g(0)=1. ∎