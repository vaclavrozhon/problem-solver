# Research Notes



Counterexample families and conflict-graph view

- Conflict graph G: vertices E; edge x–y iff ∃ p≠q with f_p(x)=f_q(y). A valid partition equals a proper coloring; #parts = χ(G).

Permutation-based counterexamples (very strong)
- Template: k functions on E⊆S_k, F=[k], f_i(π)=π(i). For any distinct π,σ∈E there exists s with π^{-1}(s)≠σ^{-1}(s), yielding an edge. Hence G is complete for any E⊆S_k.
- Take E = D_k (derangements) ∪ (for each s∈[k], pick n permutations that fix s and no other point). Then for z=s, choose t=s: f_s^{-1}(s) has size n. Therefore n* = n. G is complete, so χ(G)=|E|=|D_k|+kn. For n=1 this is ≈ k!/e + k.
- Small explicit case k=3, n=1: E = {(1 2 3),(1 3 2)} ∪ {(2 3),(1 3),(1 2)}. Then χ(G)=5 while 2n+1=3.
- Variant (informal): For r≥1, by forbidding r disjoint perfect matchings of cells one can pick a large set E_0(r) with |E_0(r)|≈e^{-r}k!, and still ensure that for each z there are ≥ r indices whose fibres at z have size ≤ n after adding nk more permutations. Completeness persists. Rigor via rook polynomials to be written.

Projective-plane counterexamples (robust under strong fibre constraints)
- For k=q+1 (q a prime power): E = lines, F = points in PG(2,q). Proper k-edge-color the incidence bipartite graph; for i∈[k], define f_i(L) to be the point incident to L via color i. Then for all z and i, |f_i^{-1}(z)|=1. Any two lines meet in one point z and receive distinct colors there, so G is complete on |E|=k^2−k+1. Thus n*=1 yet χ(E)=k^2−k+1 > 2n+1.

Caveat / correction
- A proposed general upper bound m≤k^2−k+1 for n*=1 and complete G is false; permutation-based n*=1 examples give m≈k!/e. The mistaken step was assuming that among vertices containing a given z the indices used at z must be distinct; completeness does not force this at a fixed z.

Takeaways
- The permutation family shows that, even with n*=1, χ can be factorial in k; the projective-plane family shows robustness when all fibres are forced to be size 1 simultaneously.
- Next: formalize the r≥1 variant counts; explore upper bounds under added regularity (e.g., all f_i surjective or balanced fibre sizes).

Further refinements and cautions

- Fixed-transversal optimality (permutation template): Fix a bijection τ:F→[k]. If E⊆S_k satisfies |{π∈E: π(τ(z))=z}|≤n for all z, then |E|≤D_k+kn. Proof idea: split E into those avoiding all k cells (τ(z),z) (exactly D_k many) and those hitting at least one; assign each of the latter to the least z with π(τ(z))=z to get an injection into ⋃_z of n slots, hence ≤kn.

- Many small fibres per z via forbidden matchings: Let B be the union of r permutation matrices; let A be its complement (row/col sums = k−r). Then E_0(r):={π: π avoids B} has size per(A)≥((1−r/k)^k)k! by van der Waerden (normalize A by k−r). With f_i(π)=π(i), for every z there are r indices with fibre 0, G is complete, and χ=|E_0(r)| is factorial.

- Caution: Quantitative bounds for the number of permutations that use a fixed forbidden cell (i,z) and avoid all others were claimed using a uniform-row/column argument; this submatrix is not regular in general. Use Hall’s theorem/rook polynomials/LLL for existence (sufficient for n=1) or omit counts.

- General bipartite template: If B is a k-regular bipartite graph on (E,F) with a proper k-edge-coloring and every two vertices of E have a common neighbor in F, then defining f_i(x) as the neighbor of x in color i yields pointwise distinctness, |f_i^{-1}(z)|=1 for all i,z (n=1), and G complete. Projective planes are a canonical example with |E|=k^2−k+1.

To do: formalize Hall/rook-polynomial arguments for pinned completions (r≥2); explore bounds under surjectivity/balanced-fibre constraints.

Upper bounds under strong regularity; scope cautions

- Bijection regime (all fibres 1): If each f_i is a bijection E→F and G is complete, then |E|=|F|=:m satisfies m≤k^2−k+1. Equality holds for projective planes PG(2,q), giving m=k^2−k+1 with n=1. Thus the plane construction is optimal under maximal regularity.
- Uniform r-to-1 regime: If for all i,z we have |f_i^{-1}(z)|=r (so |E|=r|F|) and G is complete, then |E|≤kr(kr−1)+1 by double counting shared images.
- Many small fibres per z (≥r indices): Using r forbidden permutation matchings and van der Waerden’s bound, one obtains a factorial-sized core E_0(r) with G complete and n=1.

Cautions
- The fixed-transversal upper bound |E|≤D_k+kn is sharp within the permutation template when the k capped cells form a bijection τ:F→[k]; it is not claimed in general when witness indices t(z) repeat rows.
- “Pinned completions” through a prescribed forbidden cell lack a simple uniform degree structure; quantitative bounds must use Hall’s theorem, rook polynomials, or LLL. Existence for n=1 suffices for current purposes.
- In the permutation construction, the surjectivity of each f_i holds as stated when τ=id (after renaming indices); otherwise omit surjectivity.

Next: Prove existence (without counts) for pinned completions via Hall; explore near-tight constructions for r>1 in the uniform-fibres regime; and survey symmetric designs beyond planes for additional k.