Setup and conflict graph
Let k≥2 and f_1,…,f_k:E→F satisfy pointwise distinctness: for each x, the values f_1(x),…,f_k(x) are pairwise distinct. Define the conflict graph G on E by joining x≠y iff ∃ p≠q with f_p(x)=f_q(y).

1) Completeness for the permutation template
Lemma 1. Let F=[k], E⊆S_k, and f_i(π)=π(i). Then G is complete on E.
Proof. For π≠σ pick s with π^{-1}(s)≠σ^{-1}(s). Set p=π^{-1}(s), q=σ^{-1}(s). Then p≠q and f_p(π)=s=f_q(σ). ∎

2) Sharp bound within a fixed transversal (permutation template)
Proposition 2 (Fixed-transversal optimality). Fix a bijection τ:F→[k]. Suppose E⊆S_k satisfies, for each z∈F,
C_z:=|{π∈E : π(τ(z))=z}| ≤ n.
Then |E|≤D_k+kn, where D_k is the derangement number. Moreover, for every 1≤n≤D_{k−1} there exists E with |E|=D_k+kn and complete G.
Proof. Let E_0 be permutations avoiding all cells (τ(z),z). By conjugation, |E_0|≤D_k. Let B:=E\E_0. Each π∈B hits at least one designated cell; assigning each π to the least such z yields an injection into ⋃_z of n slots, so |B|≤∑_z n=kn. Hence |E|≤D_k+kn. For equality, take E_0 to be all derangements and for each z pick n permutations with exactly one fixed point at z; G is complete by Lemma 1. ∎

Corollary 3 (Coefficient lower bound). If a universal bound χ(G)≤c(k) n* holds for all instances, then c(k)≥D_k+k by applying Proposition 2 with n*=1, since χ(G)=|E|=D_k+k.

3) Many small fibres per z: factorial core via van der Waerden
Lemma 4. Let σ_1,…,σ_r∈S_k and forbid cells B=⋃_{j=1}^r{(i,σ_j(i))}. Let A be the 0–1 allowed matrix (complement). Then per(A)≥((k−r)/k)^k k!=((1−r/k)^k)k!.
Proof. A has row/column sums d:=k−r. Normalize B:=A/d to a doubly-stochastic matrix. Egorychev–Falikman gives per(B)≥k!/k^k, hence per(A)=d^k per(B)≥((k−r)/k)^k k!. ∎

Corollary 5. With E:= {π∈S_k: (i,π(i)) is allowed}, f_i(π)=π(i) gives G complete (Lemma 1). For each z, the r indices t_j=σ_j^{-1}(z) satisfy |f_{t_j}^{-1}(z)|=0. Thus n=1 (indeed stronger) and χ(G)=|E|≥((1−r/k)^k)k!.

4) Pair-coverage inequality and consequences
Lemma 6 (Pair coverage). Let m:=|E| and a_i(z):=|f_i^{-1}(z)|. If G is complete, then
m(m−1) ≤ ∑_{z∈F} [ (∑_{i=1}^k a_i(z))^2 − ∑_{i=1}^k a_i(z)^2 ].
Proof. For p≠q define R_{p,q}:={(x,y): f_p(x)=f_q(y)}; then |R_{p,q}|=∑_z a_p(z)a_q(z). Completeness implies every ordered pair (x,y), x≠y, lies in ⋃_{p≠q}R_{p,q}, so m(m−1)≤∑_{p≠q}|R_{p,q}|. Summing and rearranging yields the formula. ∎

Corollary 7 (Bijective regime). If each f_i is a bijection E→F (so |E|=|F|=:m and a_i(z)=1), then
m(m−1) ≤ m(k^2−k), hence m≤k^2−k+1.
Attainment. For k=q+1, let E be the lines and F the points of PG(2,q). A proper k-edge-coloring of the incidence graph yields bijections f_i with |f_i^{-1}(z)|=1 and completeness, so m=q^2+q+1=k^2−k+1. ∎

Corollary 8 (Uniform r-to-1 regime). If for some r≥1, a_i(z)=r for all i,z (so |E|=v=r|F|), then
v(v−1) ≤ v·r·k(k−1), hence v≤r k(k−1)+1.

5) Incidence graph template (all fibres 1)
Lemma 9. Let H be a k-regular bipartite graph on (E,F) with a proper k-edge-coloring into perfect matchings M_1,…,M_k. Define f_i(x) as the unique neighbor of x via M_i. Then pointwise distinctness holds; |f_i^{-1}(z)|=1 for all i,z; and if any two x≠y∈E share a neighbor in H, then G is complete.
Proof. Distinct colors around x give distinct values; each M_i is perfect, giving uniform fibres; shared neighbor z yields colors p≠q at z, so f_p(x)=z=f_q(y). ∎

Theorem (Two-sided bounds for permutations avoiding r matchings).
Let k≥2, 1≤r≤k−1, and let σ_1,…,σ_r∈S_k. Form the 0–1 allowed matrix A by setting A_{i,z}=1 iff z≠σ_j(i) for all j. Then each row and column of A has sum t:=k−r, and the number of permutations avoiding the r forbidden matchings equals per(A). One has
\[
\Big(\tfrac{t}{k}\Big)^k k! \;\le\; \operatorname{per}(A) \;\le\; (t!)^{k/t}.
\]
In particular, as k→∞ with fixed r, \(\operatorname{per}(A)=e^{-r+o(1)}k!\).
Proof. Normalize B:=A/t to obtain a doubly-stochastic matrix. By the Egorychev–Falikman (van der Waerden) theorem, per(B)≥k!/k^k, hence per(A)=t^k per(B)≥(t/k)^k k!. For the upper bound, apply Brégman’s inequality: for a 0–1 matrix with row sums r_i, per(A)≤∏_{i=1}^k (r_i!)^{1/r_i}. Here all r_i=t, so per(A)≤(t!)^{k/t}. Stirling’s formula gives the asymptotic e^{-r+o(1)}k!. ∎