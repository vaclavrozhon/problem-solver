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
