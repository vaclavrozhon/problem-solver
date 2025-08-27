Corrections and key lemmas to record

1) Correct append-one-bit recurrence (r=1)
Given a type t with Ext_t ⊆ Σ_out^4 over boundary (L1,L2,R2,R1) and an appended input bit a, the new type t′ has boundary (L1′,L2′,R2′,R1′) = (L1,L2, old R1, new), i.e., R2′ = R1 and R1′ is the label of the appended node. Formally, for each candidate quadruple (x1,x2,x3,x4) ∈ Σ_out^4,
  (x1,x2,x3,x4) ∈ Ext_{t′} ⇔ [x4 ∈ A_a and E(x3,x4) and ∃ z ∈ Σ_out: (x1,x2,z,x3) ∈ Ext_t].
This yields an O(β^5) DP to fill Ext_{t′} by scanning all (x1,x2,x3,x4) and checking ∃z.

Congruence lemma (needed): If Type(P)=Type(Q), then for all a ∈ {0,1}, Type(Pa)=Type(Qa). Proof sketch: The predicate “there exists an interior completion consistent with boundary assignments” over D1∪D2 is preserved under appending one node by the above DP rule, which depends only on Ext_t and a.

2) Concatenation of summaries (r=1)
If Summ(P) has Ext_P and Summ(Q) has Ext_Q, then the concatenation B=P·Q has boundary (P.left endpoint, P.left neighbor, Q.right neighbor, Q.right endpoint) and
  (o1,o2,o3′,o4′) ∈ Ext_B ⇔ ∃ x3,x4,x1′,x2′ ∈ Σ_out: (o1,o2,x3,x4) ∈ Ext_P, (x1′,x2′,o3′,o4′) ∈ Ext_Q, and E(x4,x1′).
Then R_B can be derived from Ext_B as usual.

3) Counterexample to R-composition via ∃m
Let Σ_out={a,b,c}, A_0=A_1=Σ_out. Let E={a→b, b→c} only. Suppose t_b admits a boundary tuple with right endpoint a, and t_c admits a boundary tuple with left endpoint c (interiors arbitrary but extendible). Then choose m=b. We have (x,m) ∈ R_{t_b} for any x with a valid left edge, and (m,y) ∈ R_{t_c} for suitable y. But the concatenation t_b·t_c requires the seam edge a→c, which is forbidden. Hence ∃m composition of R_t is not sound; use Ext-level concatenation and R_B instead.
Additions and fixes (r=1)

A) Correct k=2→3 base-case update
Let t=(b1,b2) and t′=t·a (length 3). Then
  (x1,x2,x3,x4) ∈ Ext_{t′} ⇔ [x3=x2, x1∈A_{b1}, x2∈A_{b2}, x4∈A_a, E(x1,x2), E(x2,x4)].
This replaces any prior statement that involved x2∈A_a.

B) Type representation and congruence
Define Type(t) := (b_in(t), Ext_t, k_flag(t)), where k_flag ∈ {1,2,3,≥4} indicates whether boundary coordinates coincide due to short length. Then the congruence lemma holds in the form:
  If Type(P)=Type(Q), then for all a∈{0,1}, Type(Pa)=Type(Qa).
Proof: case split on k_flag using the explicit base-case rules for k_flag∈{1,2,3} and the general append recurrence for k_flag=≥4.
Remark: Ext equality alone does not determine |t| (e.g., with E self-loops and A_0=A_1, Ext_{len 2} = Ext_{len 4}). Hence the k_flag is necessary for a length-agnostic update routine.

C) Enumeration fix
In the BFS over types, key the dictionary by the full Type(t), including k_flag. After the first transition to k_flag=≥4, all descendants remain in k_flag=≥4 and subsequent δ updates are length-agnostic.
Additions: Stage-1 and Stage-2 specifications at the Ext level (r=1, oriented paths)

Notation. Σ_out has size β. For an input word t with bits b_in(t) ∈ {0,1}^{|t|}, let Ext_t ⊆ Σ_out^4 denote the set of boundary quadruples (L1,L2,R2,R1) = (o[1],o[2],o[|t|-1],o[|t|]) that admit an interior completion o consistent with node constraints o[i]∈A_{b_in(t)[i]} and edge constraints (o[i],o[i+1])∈E. Types are Type(t)=(Ext_t, k_flag(t)), where k_flag∈{1,2,3,≥4} encodes short-length degeneracies. Concatenation of types τ⊙σ is defined by the Ext-level concatenation rule (see outputs.md) and k_flag update.

Stage-1 (Ω(n) vs o(n)): type-level feasible function
- Universe: the finite set of types T obtained by BFS from k=1 under the append-one-bit updates (keyed by (Ext,k_flag)). For τ,σ∈T, the Ext of τ⊙σ is defined by Ext-level concatenation.
- Definition (feasible f). A function f: T × {0,1}^2 × T → Σ_out^2 mapping (τ_L, s, τ_R) to (α1,α2) is feasible if:
  (i) Node/window constraints: αi ∈ A_{s[i]} for i=1,2 and (α1,α2) ∈ E (i.e., E(α1,α2) holds).
  (ii) Universal extendibility across two separators: for all τ_a,τ_b,τ_c,τ_d∈T and s1,s2∈{0,1}^2, letting α_L := second component of f(τ_a,s1,τ_b) and α_R := first component of f(τ_c,s2,τ_d), we require
      ∃ (o1,o2,o3,o4) ∈ Ext_{τ_b ⊙ τ_c} with E(α_L,o1) and E(o4,α_R).
  Comment: The quantification over τ_a and τ_d is stronger than necessary but safe; a weaker version quantifies only over τ_b,τ_c and s1,s2. Indexing uses our convention (L1,L2,R2,R1); thus o1 and o4 are the first and last outputs of the middle block of type τ_b⊙τ_c.
- NEXPTIME check: deterministically enumerate T and all Ext_{τ} and on-demand Ext_{τ⊙σ}; nondeterministically guess f; verify (i) and (ii) exhaustively. Complexity is 2^{poly(N)} in the problem description size N.
- Status: We still owe a self-contained proof that “o(n) algorithm exists iff a feasible f exists” at the Ext level (the intended replacement of the paper’s feasible-function lemma). This will rely only on our Ext-append and Ext-concat lemmas and a standard pumping argument specialized to r=1.

Stage-2 (O(1) vs Ω(log* n)): per-type boundary-interface witness
- For each τ∈T with k_flag(τ)≥4, guess Q_τ=(L1_τ,L2_τ,R2_τ,R1_τ) with Q_τ ∈ Ext_τ. Enforce:
  (a) Local consistency and tiling: E(L1_τ,L2_τ), E(R2_τ,R1_τ), and wrap E(R1_τ,L1_τ). Intuition: long blocks of type τ can be tiled by copies using the same boundary outputs.
  (b) Bridging across any middle type (including empty): for all τ_left,τ_S,τ_right ∈ T, require either
      - if τ_S has k_flag≥1: ∃ (o1,o2,o3,o4) ∈ Ext_{τ_S} with E(R1_{τ_left},o1) and E(o4,L1_{τ_right}); or
      - if τ_S is empty: E(R1_{τ_left},L1_{τ_right}).
- Decision logic: if witnesses {Q_τ} exist and pass (a)–(b), classify O(1). Else, if a Stage-1 feasible f exists, classify Θ(log* n). Otherwise, classify Θ(n).
- Status: We still owe a concrete constant-radius construction on oriented paths from {Q_τ} (e.g., a partition/tiling routine parametrized by fixed radii ℓ_width, ℓ_pattern, ℓ_count) and a proof that the produced labeling is legal. Short types (k_flag<4) are treated as separators τ_S in (b).

Faster concatenation (proven and moved to outputs.md)
- Precompute for each τ the 3D slices: Left_τ[o1,o2,x4] := ∃x3 (o1,o2,x3,x4)∈Ext_τ, and Right_τ[x1′,o3′,o4′] := ∃x2′ (x1′,x2′,o3′,o4′)∈Ext_τ.
- Then (o1,o2,o3′,o4′)∈Ext_{τ⊙σ} iff ∃x4,x1′: Left_τ[o1,o2,x4] ∧ E(x4,x1′) ∧ Right_σ[x1′,o3′,o4′]. This allows computing Ext_{τ⊙σ} in O(β^6) time after O(β^4) precomputation per type.

Sanity checks (kept as examples)
- Trivial LCL (A_0=A_1=Σ_out, E complete): Ext_τ=Σ_out^4 for all τ; Stage-2 witness exists trivially ⇒ O(1).
- Equality LCL (E={(x,x)}): take Q_τ=(c,c,c,c) ⇒ O(1).
- Proper 2-coloring: Stage-2 fails; Stage-1 feasible f should exist ⇒ Θ(log* n).
- Linear cases with incompatible seams: Stage-1 fails ⇒ Ω(n).
Updates and clarifications (r=1, oriented paths)

1) Base-case updates finalized
- k=1→2 is special and cannot be derived from the general append recurrence without over-constraining x1=x2; we record an explicit rule in outputs.md.
- k=3→4 is also added explicitly (although it follows from the same recurrence if stated for k≥2). This ensures δ can move from short types to k_flag≥4 deterministically.

2) Type-count bound corrected
Type(t) consists of (Ext_t, k_flag(t)) only; boundary input bits are not part of Type. Hence the number of types satisfies
  |T| ≤ 4 · 2^{β^4}.
The earlier 16 · 2^{β^4} bound mixed in boundary input bits unnecessarily.

3) δ well-defined and BFS enumeration
- Seeds: k=1 types for b∈{0,1} (Ext_{(b)} = {(x,x,x,x): x∈A_b}).
- Transitions: use base-cases for k<4 (1→2, 2→3, 3→4) and Lemma 1 for k≥4. By congruence, δ(Type, a) depends only on (Ext, k_flag) and a.
- Termination and complexity: at most |T| ≤ 4·2^{β^4} insertions; each append is O(β^5) in the k≥4 regime (base-cases are ≤ O(β^4)); total time/space 2^{poly(β)}.

4) Reversal operator (optional but helpful)
Define Rev(τ) = (Ext_τ^R, k_flag(τ)) with Ext_τ^R := { (y1,y2,y3,y4) : (y4,y3,y2,y1) ∈ Ext_τ }. Then Rev(Rev(τ))=τ and Ext_{Rev(τ) ⊙ Rev(σ)} = (Ext_{σ ⊙ τ})^R.

5) Stage-1 and Stage-2 (status)
- Stage-1 (Ω(n) vs o(n)): the feasible function f: T × {0,1}^2 × T → Σ_out^2 with the universal Ext-based check (seams E(α_L, o1), E(o4, α_R), using the (L1,L2,R2,R1) ordering) is the right formal object. We still need a fully self-contained proof of the equivalence “o(n) iff such f exists”.
- Stage-2 (O(1) vs Ω(log* n)): the per-type witness Q_τ∈Ext_τ for k_flag≥4 with tiling and universal bridging checks is plausible. A complete constant-radius construction on oriented paths remains to be written and verified.

6) Sanity and regression items
- β=2 trivial LCLs and equality LCL check the base-cases and concatenation routines.
- Reconfirm the 3-color counterexample for R-composition via ∃m.
- Maintain an indexing reminder: Ext quadruples are ordered (L1,L2,R2,R1); in seam checks across a middle block of type τ_b⊙τ_c, the left seam meets o1 and the right seam meets o4.
