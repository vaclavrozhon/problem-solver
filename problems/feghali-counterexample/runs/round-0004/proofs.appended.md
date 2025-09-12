# Rigorous Proofs



Setup and notation
Let k≥3. Given functions f_1,…,f_k:E→F with pointwise distinct outputs, define the conflict graph G on E by joining x≠y if ∃ p≠q with f_p(x)=f_q(y).
For a set of functions, define n*:=max_{z∈F} min_{t∈[k]} |f_t^{-1}(z)|.

Lemma 1 (Permutation template yields complete G).
Let F=[k], let E⊆S_k, and define f_i(π)=π(i). Then the conflict graph on E is complete.
Proof. For π≠σ∈E, the permutations π^{-1} and σ^{-1} differ, so choose s with π^{-1}(s)≠σ^{-1}(s). Set p:=π^{-1}(s) and q:=σ^{-1}(s). Then p≠q and f_p(π)=π(p)=s=σ(q)=f_q(σ), so π and σ are adjacent. ∎

Theorem 2 (Strong counterexamples with prescribed n).
Fix k≥3 and an integer n with 1≤n≤D_{k-1} (where D_m is the number of derangements of [m]). There exist functions f_1,…,f_k:E→[k] with pointwise distinct outputs such that n*=n and the conflict graph is complete with
χ(G)=|E|=D_k + kn.
Proof. Let E_0 be the set of derangements of [k], |E_0|=D_k. For each s∈[k], choose a set E_s of n permutations that fix s and have no other fixed points; this is possible since there are D_{k-1} such permutations for each s. Define E:=E_0 ∪ (⋃_{s=1}^k E_s) and f_i(π):=π(i).
Pointwise distinctness holds because each π is a permutation. For each z=s, consider t=s. Then f_s^{-1}(s)=E_s, so |f_s^{-1}(s)|=n, hence min_{t}|f_t^{-1}(s)|≤n. Taking max over s gives n*≤n, while clearly n*≥n since for each s we have |f_s^{-1}(s)|=n. Thus n*=n. By Lemma 1 the conflict graph on E is complete, so χ(G)=|E|=D_k+kn. ∎

Corollary 3 (Explicit k=3, n=1 counterexample).
For k=3, take E_0={(1 2 3),(1 3 2)} and E_1={ (2 3), (1 3), (1 2) }. With f_i(π)=π(i), we have n*=1 and G=K_5, so 5 parts are needed although 2n*+1=3.

Theorem 4 (Projective-plane family: all fibres size 1 and complete G).
Let q be a prime power and set k:=q+1. Let PG(2,q) have point set F and line set E, each of size q^2+q+1=k^2−k+1. Consider the incidence bipartite graph between F and E (each vertex has degree k). Properly edge-color this bipartite k-regular graph with k colors (by Kőnig’s line-coloring theorem). For i∈[k] and L∈E define f_i(L) to be the unique point z∈F such that the incidence edge (z,L) has color i.
Then for every z∈F and every i we have |f_i^{-1}(z)|=1, and for any distinct L,M∈E, the conflict graph has L adjacent to M. Consequently G is complete on |E|=k^2−k+1 vertices and χ(G)=k^2−k+1 with n*=1.
Proof. At each vertex the k incident edges receive distinct colors among [k], so for fixed z and i there is exactly one L with color i at (z,L), giving |f_i^{-1}(z)|=1. For distinct lines L≠M, they meet in a unique point z; the two edges (z,L) and (z,M) receive distinct colors p≠q, hence f_p(L)=z=f_q(M), so L and M are adjacent. ∎

Proposition (Fixed-transversal optimality within the permutation template).
Let k≥3, F=[k], and f_i(π)=π(i) on E⊆S_k. Fix a bijection τ:F→[k]. Suppose that for every z∈F we have N_z:=|{π∈E: π(τ(z))=z}|≤n. Then |E|≤D_k+kn. Moreover, equality holds for E=D_k ∪ (⋃_{z} U_z), where each U_z consists of n permutations with exactly one fixed point at z.
Proof. Let E_0 be the set of π∈E with π(τ(z))≠z for all z. The map π↦π∘τ is a bijection S_k→S_k sending E_0 to the usual derangements; hence |E_0|≤D_k. Let B:=E\E_0. For π∈B, pick the smallest z (in a fixed total order on F) with π(τ(z))=z, and assign π to z. This assignment is injective into a multiset of size at most N_z per z, so |B|≤∑_z N_z≤kn. Thus |E|=|E_0|+|B|≤D_k+kn. The explicit construction shows equality is attainable. ∎

Lemma (Factorial core avoiding r forbidden matchings).
Let 1≤r≤k−1. Let B be the union of r permutation matrices in [k]×[k], and let A be the 0–1 complement. Then each row/column sum of A is d:=k−r, and per(A)≥d^k·(k!/k^k)=((1−r/k)^k)k!. Hence there exists E_0(r)⊆S_k with |E_0(r)|≥((1−r/k)^k)k! such that π(i) avoids the r forbidden columns for every i.
Proof. Normalize B:=A/d to obtain a doubly stochastic matrix. By Egorychev–Falikman, per(B)≥k!/k^k. Therefore per(A)=d^k per(B)≥d^k·(k!/k^k). ∎

Corollary (Counterexamples with ≥r small fibres per z at n=1).
With F=[k], E=E_0(r), f_i(π)=π(i): for each z there are r indices t with f_t^{-1}(z)=∅, so the strengthened hypothesis (≥r small fibres per z) holds for n=1. By completeness of the permutation template, G is complete and χ(G)=|E|≥((1−r/k)^k)k!.

Lemma (General bipartite template for n=1 with all fibres 1).
Let B be a k-regular bipartite graph with parts (E,F) and a proper k-edge-coloring with colors [k]. Define f_i(x) as the unique neighbor of x in color i. Then for all x∈E the values f_1(x),…,f_k(x) are distinct; for all z∈F and i, |f_i^{-1}(z)|=1. If every two vertices of E have a common neighbor in F, then the conflict graph on E is complete. Hence χ(G)=|E|. Projective planes PG(2,q) realize this with |E|=k^2−k+1.
Proof. Edge-coloring gives distinct colors around each vertex and a perfect matching per color; thus |f_i^{-1}(z)|=1. If x≠y share z, denote by p (resp. q) the color of (x,z) (resp. (y,z)). Since the coloring is proper at z, p≠q and f_p(x)=z=f_q(y), giving adjacency; hence G is complete. ∎

Theorem (Stronger linear coefficient lower bound).
Let c(k) be such that for all instances with k functions, \chi(G) \le c(k)\,n^*. Then c(k)\ge D_k+k, where D_k is the derangement number. 
Proof. Use the permutation construction with E = D_k \cup (\cup_{z\in[k]} U_z), where each U_z consists of one permutation with exactly one fixed point at z. Then n^*=1 and G is complete with \chi(G)=|E|=D_k+k, so c(k)\ge \chi(G)/n^* = D_k+k. ∎

Theorem (Bijection regime: tight upper bound).
Assume |E|=|F|=:m and for each i, f_i:E→F is a bijection (equivalently, |f_i^{-1}(z)|=1 for all i,z). If the conflict graph G on E is complete, then m ≤ k^2−k+1. Equality is attained by projective planes PG(2,q) with k=q+1 and m=q^2+q+1.
Proof. Write σ_i:=f_i and D:=\{σ_q^{-1}σ_p: p\ne q\}. Completeness means: for all x\ne y in E, ∃ p\ne q with σ_q^{-1}σ_p(x)=y. Thus every ordered pair (x,y), x\ne y, is in the graph of some δ∈D. Since each δ is a bijection, it contributes exactly m ordered pairs (x,δ(x)). Therefore m(m−1) ≤ |D|·m ≤ k(k−1)·m, i.e., m ≤ k^2−k+1. For PG(2,q), define f_i via a proper k-edge-coloring of the incidence graph; each f_i is a bijection and any two lines meet in one point with distinct colors, so G is K_m with m=q^2+q+1, achieving equality. ∎

Proposition (Uniform r-to-1 fibres: quadratic bound).
Suppose for some r≥1 and all i,z we have |f_i^{-1}(z)|=r. Then with v:=|E|=r|F|, if G is complete, one has v ≤ kr(kr−1)+1.
Proof. For z∈F let c_z:=|\{x∈E: z∈\{f_1(x),…,f_k(x)\}\}|. Pointwise distinctness implies that for fixed z the r preimages per color are disjoint across colors, so c_z=kr for all z. Double count pairs (x,y) with x\ne y which share some z∈F: on one hand, \sum_z C(c_z,2) = |F|·C(kr,2) = (v/r)·kr(kr−1)/2. On the other hand, completeness gives at least C(v,2). Hence (v/r)·kr(kr−1)/2 ≥ v(v−1)/2, yielding v ≤ kr(kr−1)+1. For r=1 this recovers the bijective bound. ∎