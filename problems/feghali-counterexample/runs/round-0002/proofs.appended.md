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