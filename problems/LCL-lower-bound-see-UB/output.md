Results validated for radius-1, β-normalized LCLs on oriented paths

Why these results matter
- The decision procedures for feasible-function existence (and hence the O(1)/Θ(log* n)/Θ(n) classification on paths) rely on two ingredients: (i) that path segments admit a finite set of “types” which compose under concatenation, and (ii) that extendibility of partially labeled paths can be checked efficiently. The theorems below formalize these facts for radius 1 and yield a finite bound for the bridging (F2) checks.

Definitions (radius 1)
- Fix finite alphabets Σ_in and Σ_out (|Σ_out| = β). Cin–out ⊆ Σ_in × Σ_out specifies allowed output symbols at a node given its input symbol. Cout–out ⊆ Σ_out × Σ_out specifies allowed pairs of consecutive output symbols along the oriented path. A labeling of outputs y_1…y_k over an input x_1…x_k is legal if (x_i, y_i) ∈ Cin–out for all i and (y_i, y_{i+1}) ∈ Cout–out for all i.
- For a word w of length k ≥ 2, let the four boundary positions be i=1,2 and i=k-1,k. For a fixed assignment a ∈ Σ_in^4 to the boundary inputs (x_1, x_2, x_{k-1}, x_k), define E_w(a) ⊆ Σ_out^4 to be the set of boundary-output assignments b = (y_1, y_2, y_{k-1}, y_k) for which there exists a legal output labeling y_1…y_k extending b, given the boundary inputs a (interior inputs may be arbitrary in Σ_in; if the model fixes interior inputs, the definition is with respect to those fixed inputs). The type of w, Type(w), is the map a ↦ E_w(a). Let T be the set of all types realized by some w.

Theorem 1 (Finite number of types and an explicit bound)
Let m := |Σ_in|. For radius 1 we have |T| ≤ m^4 · 2^{β^4}.
Proof. For each fixed boundary-input assignment a there are exactly β^4 possible boundary-output assignments; E_w(a) is an arbitrary subset of these, hence at most 2^{β^4} possibilities. There are m^4 possible a’s. The type is fully determined by the tuple (a, E_w(a))_{a∈Σ_in^4}. Thus the total number of distinct types is at most m^4 · 2^{β^4}.

Lemma 2 (Composition of types under concatenation)
There is a computable binary operation ⊛: T × T → T such that for all words u, v we have Type(uv) = Type(u) ⊛ Type(v).
Proof. Fix boundary inputs a on uv, i.e., inputs on positions 1,2 and at the last two positions of uv. For each boundary-outputs choice b on uv, extendibility is equivalent to the existence of output symbols p,q ∈ Σ_out at the shared boundary between u and v (the last two outputs of u = first two of v) such that:
- (i) (Type(u) under its corresponding boundary inputs) accepts the boundary outputs given by the left two outputs of b together with p,q; and
- (ii) (Type(v) under its corresponding boundary inputs) accepts p,q together with the right two outputs of b; and
- (iii) the two internal adjacencies across the u|v seam are allowed by Cout–out (these involve only (y_{|u|-1}, y_{|u|}) = (p_left, p_right) and (p_left, p_right) = (y_1, y_2) of v, but these are exactly the p,q we quantify over).
Because radius is 1, no other interior constraints couple u and v. Thus extendibility of uv under (a,b) can be decided solely from Type(u), Type(v), and Cout–out by existentially quantifying p,q. Defining ⊛ to implement this decision for all (a,b) yields Type(uv) = Type(u) ⊛ Type(v).

Lemma 3 (Ultimate periodicity of repeated concatenation)
Fix w and let τ := Type(w). Define the sequence σ_1, σ_2, … in T by σ_z := Type(w^z). Then σ_{z+1} = σ_z ⊛ τ for all z ≥ 1. Consequently, the sequence (σ_z) is ultimately periodic with preperiod and period at most |T|.
Proof. By Lemma 2, σ_{z+1} = Type(w^{z+1}) = Type(w^z w) = Type(w^z) ⊛ Type(w) = σ_z ⊛ τ. Since T is finite, the sequence must revisit a previous value within at most |T| steps, after which it evolves deterministically with fixed period ≤ |T|.

Corollary 4 (Finite bound for the bridging (F2) check)
Let ℓ := |T|. Fix a context (w_1, S, w_2) with |S| = 2 and a forced output assignment s ∈ Σ_out^2 on S. For each z ≥ 1, consider the path w_1^z S w_2^z with S fixed to s, and let P(z) be the predicate “there exists a legal completion of outputs on w_1^z and w_2^z consistent with s.” Then P(z) depends only on the pair (Type(w_1^z), Type(w_2^z)). Moreover, it suffices to check P(z) for 1 ≤ z ≤ Z with Z ≤ ℓ^2; if all these hold then P(z) holds for all z ≥ 1.
Proof. For fixed s, feasibility is determined by whether there exist outputs on the two boundary nodes adjacent to S on each side such that the two segments extend and Cout–out holds across the two adjacencies touching S; this depends only on Type(w_1^z) and Type(w_2^z). By Lemma 3, each of the two type sequences is ultimately periodic with preperiod and period ≤ ℓ. Hence the pair sequence (Type(w_1^z), Type(w_2^z)) takes values in a set of size ≤ ℓ^2 and is ultimately periodic. If P(z) holds for one full traversal of the distinct pairs (which occurs within the first ℓ^2 indices), it holds for all subsequent z.

Theorem 5 (DP for extension on a partially labeled path)
Given a path of length k with a fixed input string and some outputs preassigned on a subset of nodes, there is an O(k β^2) time algorithm that decides whether the outputs can be completed to a legal labeling.
Proof. Construct a layered graph with k layers, each layer’s vertices being the output symbols allowed at that node by Cin–out and any preassignment. Add a directed edge from y at layer i to y′ at layer i+1 iff (y, y′) ∈ Cout–out. There exists a legal completion iff there is a path from some vertex in layer 1 to some vertex in layer k. The graph has O(k β) vertices and O(k β^2) edges; reachability is decidable in O(k β^2).

Remarks
- The bounds above are not tight (e.g., the ℓ^2 bound in Corollary 4 can be improved using lcm of periods), but they suffice for verification in exponential time in β. They also isolate exactly where only the types matter (composition and periodicity), which is crucial for hardness reductions that aim to make (F2) vacuous and focus on (F1).
