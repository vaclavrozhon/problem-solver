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
New additions (r=1, oriented paths): pumping, general concatenation, and Stage-1 equivalence

- Pumping bound and lemmas. Let T be the set of reachable types (Proposition 9) and δ: T×{0,1}→T the append transition. Define
  ℓ_pump := |T|.
  Lemma (prefix pumping). For any input w with |w| ≥ ℓ_pump there exist x,y,z with 1 ≤ |y| ≤ ℓ_pump and |xy| ≤ ℓ_pump such that Type(x y^i z) is independent of i ≥ 0.
  Lemma (periodic pumping). For any nonempty u there exist a,b with a+b ≤ ℓ_pump such that Type(u^{a+bi}) is invariant for all i ≥ 0.
  Both follow from the pigeonhole principle applied to the δ-run over Types.

- Ext-level concatenation for all k_flags and associativity. The general concatenation rule (Ext_{P·Q} witnessed by Ext_P and Ext_Q with a seam constraint E(x4,x1′)) holds verbatim for all lengths because Ext for short words already lives in Σ_out^4 with coordinate equalities enforced by k_flag. Associativity of Ext-concatenation follows semantically (concatenation of words is associative) or by rebracketing seam witnesses.

- Stage-1 (Ω(n) vs o(n)). Restrict left/right context Types to T_long := {τ∈T : k_flag(τ)≥4}. Define a feasible f: T_long×{0,1}^2×T_long→Σ_out^2 that (i) satisfies node/edge constraints on the 2-node separator and (ii) for all τ_b,τ_c∈T_long and s1,s2, and for all τ_a,τ_d∈T_long (affecting only α_L,α_R), there exists (o1,o2,o3,o4)∈Ext_{τ_b⊙τ_c} with E(α_L,o1) and E(o4,α_R), where α_L is the second output of f(τ_a,s1,τ_b) and α_R is the first output of f(τ_c,s2,τ_d). Theorem (added to output.md): an r=1, oriented-path LCL has deterministic complexity o(n) iff such a feasible f exists. Proof outline recorded in output.md: (⇒) extract f from an o(n) algorithm via pumping and a cycle-gadget; (⇐) place separators by an MIS on the K-th power of the path with K≳ℓ_pump and solve each O(K)-long block locally using the guaranteed Ext-witness; total time O(log* n).

- Stage-2 (O(1) vs Θ(log* n)). The per-type interface Q_τ∈Ext_τ (for τ∈T_long) with tiling and universal bridging checks remains a plausible certificate. However, the constant-radius partition of an arbitrary input path into “long periodic” and “short/irregular” subpaths is not yet proven in this writeup. Do not claim S2 in output.md until a self-contained partition lemma (parameters and proof) is supplied or the construction is reworked to avoid this dependency.

- Minor lemma. Nonemptiness monotonicity under concatenation: if Ext_P and Ext_Q are nonempty and there exists at least one seam pair (x4,x1′) with E(x4,x1′), then Ext_{P·Q}≠∅. This is an immediate corollary of the general concatenation rule.

Implementation notes

- Quantify over T_long for left/right contexts in Stage-1; middle types in Stage-2 can be arbitrary (short included), handled by the general concatenation lemma.
- Precompute T by BFS (Prop. 9), split T_long vs short, cache Left_τ and Right_τ for all τ, and build Ext_{τ⊙σ} for τ,σ∈T_long (Prop. 5). ℓ_pump=|T| is computable in 2^{poly(β)}.
- Separator placement for Stage-1: in O(log* n), compute an MIS on the K-th power of the directed path for K=ℓ_pump+4; distances between consecutive separators are ≤2K, ensuring each middle block is O(K)-long and solvable in O(1) rounds by exhaustive local choice of an Ext-witness–consistent interior labeling.

Open item for Stage-2

- Provide a self-contained constant-radius partition lemma on oriented paths or redesign the Stage-2 constant-round construction to avoid reliance on periodicity. Until then, keep S2 as a notes-only plan.
Endpoint handling in Stage-1 (r=1) and refinements

- Endpoint gap (to-do). The current Stage-1 (⇐) algorithm partitions the path using a K-th power MIS with K := ℓ_pump+4 and then fills each middle block between two separators using a feasible function f. This leaves one-sided end segments (from a path endpoint to the nearest separator). The proof sketch in output.md did not treat these explicitly and incorrectly asserted that every separator has long-type contexts on both sides. A separate lemma is needed to guarantee that the seam color chosen at an endpoint-adjacent separator is compatible with the end segment’s Ext set. Alternatively, redesign the partition so that every nontrivial block lies strictly between two separators, eliminating one-sided cases. Until one of these is proven, the o(n)⇔feasible-f equivalence remains open here.

- Clean k=1→2 update (no “recover b”). For a type τ with k_flag(τ)=1, let S_τ := { x ∈ Σ_out : (x,x,x,x) ∈ Ext_τ }. Then appending a bit a yields Ext_{τ·a} consisting exactly of tuples (x1,x2,x3,x4) with x1=x3, x2=x4, x1∈S_τ, x2∈A_a, and E(x1,x2). This removes the need to speak about an internal bit b and works also when A_0=A_1.

- Optimized append in O(β^4). For k_flag≥4, define Left3_t[x1,x2,x3]:=∃z (x1,x2,z,x3)∈Ext_t. Then (x1,x2,x3,x4)∈Ext_{t·a} iff Left3_t[x1,x2,x3] ∧ E(x3,x4) ∧ x4∈A_a. Precompute Left3_t in O(β^4) time and fill Ext_{t·a} in O(β^4) time (dense worst-case).

- Out-set formulation of feasibility. Given a guessed f: T_long×{0,1}^2×T_long→Σ_out^2, define
  OutR2(τ_b,s) := { second(f(τ_a,s,τ_b)) : τ_a ∈ T_long },
  OutL1(τ_c,s) := { first(f(τ_c,s,τ_d)) : τ_d ∈ T_long }.
The universal extendibility clause is equivalent to: for all τ_b,τ_c,s1,s2 and α_L∈OutR2(τ_b,s1), α_R∈OutL1(τ_c,s2), ∃(o1,o2,o3,o4)∈Ext_{τ_b⊙τ_c} with E(α_L,o1) and E(o4,α_R). This isolates the relevant seam colors and simplifies verification.

- Seam-feasibility matrices. For faster verification and construction, precompute for each pair (τ_b,τ_c) the β×β boolean matrix W_{b⊙c}[α_L][α_R] that records whether there exists (o1,o2,o3,o4) ∈ Ext_{τ_b⊙τ_c} with E(α_L,o1) and E(o4,α_R). Then the universal extendibility checks reduce to table lookups W_{b⊙c}[α_L][α_R].

- Regression checklist.
  1) Verify optimized append equals brute-force append on random small Σ_out (β≤3).
  2) Verify associativity of Ext-concatenation on random triples of types.
  3) Verify W_{b⊙c} by direct Ext scans.
  4) Sanity: equality LCL and proper 2-coloring behave as expected.
Endpoint seam projections and matrices (r=1, oriented paths)

- For any type τ, define:
  RightColors(τ) := { y ∈ Σ_out : ∃ x1,x2,x3 with (x1,x2,x3,y) ∈ Ext_τ }.
  LeftColors(τ)  := { x ∈ Σ_out : ∃ x2,x3,y with (x,x2,x3,y) ∈ Ext_τ }.
  These are just the projections of Ext_τ to coordinates R1 and L1.

- Define endpoint seam-compatibility matrices from Ext alone:
  V_left[τ][α]  := (∃ y ∈ RightColors(τ) with E(y, α)).
  V_right[α][τ] := (∃ x ∈ LeftColors(τ) with E(α, x)).

Lemma E1 (endpoint feasibility via Ext). Fix any type τ and α ∈ Σ_out.
- There exists a legal labeling of a left end-block of type τ and the adjacent separator’s first node α iff V_left[τ][α] is true.
- There exists a legal labeling of a right end-block of type τ and the adjacent separator’s second node α iff V_right[α][τ] is true.
Proof. If (x1,x2,x3,y)∈Ext_τ and E(y,α), then the end-block interior is witnessed by Ext_τ and the seam edge by E(y,α). Conversely, any legal instance provides such y. The right case is symmetric.

Endpoint gap in Stage-1 (diagnosis and fix). Our current Stage-1 construction labels interior separators using a feasible f and fills the block between them via Ext_{τ_b ⊙ τ_c} using W_{b⊙c}. For paths, the first/last interior block is bounded on one side by an endpoint-adjacent separator. If that separator is colored by an independent g_L/g_R, the right (resp. left) seam color entering the first (resp. last) interior block may lie outside the OutR2/OutL1 sets induced by f. Then the pre-verified W_{b⊙c} guarantees do not apply, and the fill of that block can fail, even if V_left/V_right holds. Hence additional coupling is required.

Corrected Stage-1 certificate for paths (proposal). Keep T_long and f as in the Out-set formulation. Replace the 2-argument endpoint maps by 3-argument ones that are aligned with the Out-sets of the adjacent long type:
- g_L: T × {0,1}^2 × T_long → Σ_out^2. For g_L(τ_end, s, τ_b)=(β1,β2) require:
  (i) node/window legality at the separator: βi ∈ A_{s[i]} and E(β1,β2);
  (ii) one-sided feasibility toward the endpoint: V_left[τ_end][β1]=true;
  (iii) alignment with interior Out-set: β2 ∈ OutR2(τ_b, s).
- g_R: T_long × {0,1}^2 × T → Σ_out^2. For g_R(τ_c, s, τ_end)=(β1,β2) require:
  (i) node/window legality and E(β1,β2);
  (ii) one-sided feasibility toward the endpoint: V_right[β2][τ_end]=true;
  (iii) alignment with interior Out-set: β1 ∈ OutL1(τ_c, s).

With these constraints, the MIS-based O(log* n) construction proceeds as before:
- Label every interior separator by f; label the endpoint-adjacent separators using g_L/g_R (using the computed adjacent long types τ_b, τ_c on their interior sides). Fill end-blocks using Lemma E1.
- For the blocks between an endpoint-adjacent separator and its nearest interior separator, use the same W_{b⊙c} check as for interior blocks, with α_L := second(g_L(…)) or α_R := first(g_R(…)). By (iii), α_L ∈ OutR2(τ_b,·) and α_R ∈ OutL1(τ_c,·), so the precomputed W_{b⊙c} guarantees existence of a witness in Ext_{τ_b ⊙ τ_c}.

Necessity (⇒) sketch under the corrected certificate. Given an o(n)-round algorithm A:
- Extract f from A as in the cycle case (pumping + concatenation).
- For each (τ_end, s, τ_b), build a path consisting of a long pumped block of type τ_b to the right, the separator with input s, and an endpoint block of type τ_end on the left (plus pumped padding as needed outside the radius of A). Let g_L(τ_end,s,τ_b) be A’s output on the separator. Pumping ensures well-definedness and (iii). The V_left constraint follows because the seam into the endpoint segment is satisfied by A. Symmetrically define g_R.

Verification remains in 2^{poly(β)}: T, T_long, Ext, W_{b⊙c}, V_left, V_right, OutR2/OutL1 are all precomputable. The guessed tables f, g_L, g_R are checked entrywise.

Action items.
- Integrate Lemma E1 and the V_left/V_right definitions into outputs.
- Replace the current endpoint witness proposal by the 3-argument version and update both directions of the Stage-1 path theorem accordingly.
- Keep Stage-2 items in notes until a self-contained partition lemma for oriented paths is written.
Endpoint‑coupled Stage‑1 for oriented paths: resolution and integration

- Gap recap. Our earlier Stage‑1 (o(n) vs Ω(n)) write‑up did not handle the endpoint‑adjacent separators. Labeling endpoints independently (even with V_left/V_right checks) can misalign the “open” seam color toward the interior with the Out‑sets induced by the interior feasible function f, causing the first/last interior block to be unfillable.

- Fix (now integrated into output.md). We strengthen the certificate by adding 3‑argument endpoint maps coupled to Out‑sets:
  • g_L(τ_end, s, τ_b) = (β1,β2) with: (i) node/window legality; (ii) V_left[τ_end][β1]; (iii) β2 ∈ OutR2(τ_b,s).
  • g_R(τ_c, s, τ_end) = (β1,β2) with: (i) node/window legality; (ii) V_right[β2][τ_end]; (iii) β1 ∈ OutL1(τ_c,s).
  With these, the interior block between an endpoint‑adjacent separator and the nearest interior separator is covered by the same W_{b⊙c} universal checks as for interior blocks. We added an explicit Endpoint–interior bridging lemma to make this step transparent.

- Theorem S1‑path (added). For β‑normalized r=1 LCLs on globally oriented paths, an o(n)‑round deterministic algorithm exists iff there are witnesses (f_mid, g_L, g_R) satisfying the above constraints. Proof: (⇒) extract f_mid and g_L/g_R from an o(n) algorithm using pumped canonical contexts and padding outside the runtime halo; (⇐) place separators by MIS on the K‑th power (K = ℓ_pump+4), color interior separators via f_mid and endpoint‑adjacent ones via g_L/g_R, and complete all blocks by table lookups in W and V. Verification is NEXPTIME (single‑exponential) via precomputed tables.

- Complexity tightening (recorded). Using Proposition 19 (O(β^4) append for k_flag ≥ 4), the BFS enumeration in Proposition 9 uses O(β^4) per transition in the long regime.

- Minimal obstruction template (for tests). Fix τ_b with OutR2(τ_b,s) = {α}. If an uncoupled g_L outputs β2 ≠ α while V_left holds, the first interior block can fail because W_{b⊙c}[β2][·] may be all false; coupling (iii) prevents this.

- Bookkeeping. Lemma 11 subsumes Lemma 2 (general vs k_flag≥4 concatenation). There are duplicated labels around Proposition 6/6A/6B; renumbering is recommended in a clean pass.
Addendum: Stage‑2 on oriented paths via a path‑feasible function f0 (plan and checks)

We record here a path‑specialized Stage‑2 certificate that matches the cycle proof technique in the literature and avoids embedding per‑type interior fillers.

Definitions (r=1; pumping length ℓ_pump = |T| from Prop. 9)
- For a word w with 1 ≤ |w| ≤ ℓ_pump and integer z ≥ 0, define the path Gw,z := wr · wz · wr, where wr denotes a fixed context of length r = 1 on each side, and equip it with a complete output labeling f0(w)^{z+2r} (periodic by f0(w)). Mid(Gw,z) denotes the middle wz.
- For w1, w2 with 1 ≤ |wi| ≤ ℓ_pump and any finite substring S (possibly empty), define Gw1,w2,S := w1^{ℓ_pump+2r} · S · w2^{ℓ_pump+2r} with a partial labeling that fixes the first 2r|w1| outputs to f0(w1)^{2r} and the last 2r|w2| outputs to f0(w2)^{2r}. Mid(Gw1,w2,S) := w1^{ℓ_pump+r} · S · w2^{ℓ_pump+r}.

Path‑feasible function (F1)–(F2)
- f0: { w ∈ Σ_in^k : 1 ≤ k ≤ ℓ_pump } → Σ_out^k is path‑feasible if:
  (F1) For every w, the labeling f0(w) is locally legal; moreover, the labeling of Gw,1 is locally consistent on Mid(Gw,1). (Equivalently, for all z ≥ 1, Gw,z is locally consistent on its mid.)
  (F2) For every Gw1,w2,S, there exists a completion that is locally consistent on Mid(Gw1,w2,S).

Intuition and relation to Ext/W tables
- (F1) ensures that when the short word w is periodically repeated with a unit of separation (z ≥ 1), the outputs at the mid block can be anchored by f0(w) without conflict.
- (F2) ensures that any finite irregular gap S flanked by long pumped contexts with periodic mid‑anchors f0(w1), f0(w2) can be completed using constant‑radius rules, exactly mirroring how W_{b⊙c} checks mediate between Out‑sets in Stage‑1.

Verification (NEXPTIME)
- With T and Ext enumerated (Prop. 9) and the standard pumping lemmas (Lemmas 13–14), it suffices to check finitely many Gw,1 and a finite representative set of Gw1,w2,S where S ranges over types τ_S with |S| ≤ ℓ_pump (plus S = ∅). Each check reduces to Ext‑table membership and adjacency constraints; total time 2^{poly(β)}.

Construction sketch (if f0 exists; to be moved to output.md once the partition lemma is proven)
- Use an oriented‑path version of the (ℓ_width, ℓ_count, ℓ_pattern) partition (as in the cycle proof), with parameters ℓ_width = ℓ_pattern = ℓ_pump and ℓ_count = 2ℓ_pump + 2. On long periodic regions with primitive period w (|w| ≤ ℓ_pattern and repeat count ≥ ℓ_count), label the central 2r‑window of every period by f0(w), creating evenly spaced mid‑anchors. The remaining subpaths between anchors (and near endpoints) have O(ℓ_width + ℓ_pattern) length and are filled using (F2) by constant‑radius table lookups indexed by (w1, S, w2). Orientation is given, so no orientation step is required.

Sanity examples
- Equality LCL (E = {(c,c)}, A_0 = A_1 = {c}): f0(w) ≡ c^{|w|} satisfies (F1)–(F2); classified O(1).
- Proper 2‑coloring: no f0 exists (F1 fails on Gw,1 due to parity); Stage‑1 with endpoints succeeds; classified Θ(log* n).

Endpoint incremental identities and filters (implementation notes)
- Incremental projection under append (k_flag ≥ 4): RightColors(τ·a) = { y ∈ A_a : ∃ x1,x2,x3 Left3_τ[x1,x2,x3] ∧ E(x3,y) }, LeftColors(τ·a) = LeftColors(τ). Direct from Lemma 1 via projections.
- Allow sets: L_allow(τ) = N_E(RightColors(τ)), R_allow(τ) = N_E^{-1}(LeftColors(τ)). This restates V_left/V_right.
- Early feasibility filters for Stage‑1: If some OutR2(τ_b,s) or OutL1(τ_c,s) is empty, no feasible f_mid exists. If L_allow(τ_end)=∅ or OutR2(τ_b,s)=∅, then g_L(τ_end,s,τ_b) is impossible; similarly for g_R. These are constant‑time table emptiness checks.

Open items to promote S2 to output.md
- Provide a self‑contained oriented‑path partition lemma (constant rounds) with the explicit ℓ parameters above, or adapt an established reference to our notation.
- Integrate the S2‑path theorem with full proofs and NEXPTIME verification, pointing to our Ext/W machinery for the finite checks.
Stage‑2 for oriented paths: per‑type interface certificate with one‑sided endpoint bridging (plan)

Parameters and objects
- T is the finite set of reachable types (Proposition 9), T_long := {τ ∈ T : k_flag(τ) ≥ 4}, and ℓ_pump := |T|.
- For τ ∈ T, Ext_τ ⊆ Σ_out^4 is the boundary‑quadruple set (L1,L2,R2,R1). For τ ∈ T_long, pick an interface quadruple Q_τ = (L1_τ,L2_τ,R2_τ,R1_τ) ∈ Ext_τ.

Certificate constraints (families)
1) Local tiling and wrap within τ: E(L1_τ,L2_τ), E(R2_τ,R1_τ), and E(R1_τ,L1_τ) for each τ ∈ T_long.
2) Two‑sided bridging across any middle short block: For all τ_left, τ_right ∈ T_long and all τ_S ∈ T (including short and possibly empty), require existence of (o1,o2,o3,o4) ∈ Ext_{τ_S} with E(R1_{τ_left}, o1) and E(o4, L1_{τ_right}). For τ_S empty this reduces to E(R1_{τ_left}, L1_{τ_right}). Equivalently, using W‑matrices built from Ext_{τ_left ⊙ τ_S ⊙ τ_right}, every pair of seam colors (R1_{τ_left}, L1_{τ_right}) is supported across τ_S.
3) One‑sided endpoint bridging (paths only): For all τ ∈ T_long and τ_S ∈ T, require both
   - ∃(o1,o2,o3,o4) ∈ Ext_{τ_S} with E(o4, L1_τ) (fills a left‑endpoint short segment S abutting a long τ on the right), and
   - ∃(o1,o2,o3,o4) ∈ Ext_{τ_S} with E(R1_τ, o1) (fills a right‑endpoint short segment abutting a long τ on the left).
Necessity of (3): Without it, a short endpoint segment S could fail to attach to an adjacent long block even though (2) holds for interior segments. Sufficiency: the missing outer seam imposes no constraint; Ext membership provides the interior; the single seam to τ ensures legality at the boundary edge.

Oriented‑path partition lemma (statement; to be proven)
Lemma P‑Partition (O(1) rounds). For constants ℓ_width, ℓ_pattern, ℓ_count with ℓ_pattern ≥ ℓ_width, there is a deterministic LOCAL algorithm that, in O(1) rounds and using only the input bits and the given global orientation, partitions any path into directed subpaths with:
- Plong: Maximal long periodic segments, each equal to w^k for a primitive w with |w| ≤ ℓ_pattern and k ≥ ℓ_count; each node in Plong learns w.
- Pshort: The remaining segments are short, each of length ≤ 2ℓ_width; each node in Pshort learns its rank within the segment.
Suggested parameters for Stage‑2: ℓ_width = ℓ_pattern = ℓ_pump and ℓ_count = 2ℓ_pump + 2.
Proof idea. Detect, for each primitive w (|w| ≤ ℓ_pattern), membership in maximal w‑periodic runs using constant‑radius checks (constants depend only on β). Trim ℓ_width·|w| nodes from each end of these runs to form Plong. On the irregular remainder Pirreg, use a precomputed, constant‑state beacon selection over the de Bruijn graph of length‑ℓ_pattern windows to cut Pirreg into subpaths of length in [ℓ_pattern, 2ℓ_pattern]. A fully rigorous construction and spacing proof remains to be written.

Stage‑2 path theorem (plan)
Theorem S2‑path (certificate ⇔ O(1)). A β‑normalized r=1 LCL on globally oriented paths has deterministic complexity O(1) iff there exist {Q_τ}_{τ∈T_long} satisfying (1)–(3) above. Otherwise, if S1‑path holds but no such {Q_τ} exist, the deterministic complexity is Θ(log* n). Verification is in NEXPTIME (singly exponential in β).
Sketch of the (⇐) direction (given P‑Partition). In O(1) rounds, compute the partition with ℓ_width = ℓ_pattern = ℓ_pump and ℓ_count = 2ℓ_pump+2:
- For each P ∈ Plong with long type τ, tile P by repeating Q_τ; wrap E(R1_τ,L1_τ) closes each tile; interior legality holds by Q_τ ∈ Ext_τ.
- For each short interior S ∈ Pshort between long neighbors of types τ_L, τ_R, pick (o1,o2,o3,o4) ∈ Ext_{Type(S)} satisfying E(R1_{τ_L}, o1) and E(o4, L1_{τ_R}); legality follows from Ext_{Type(S)}.
- For each endpoint short S ∈ Pshort adjacent to a single long neighbor τ, use (3) to pick a quadruple with a single seam into τ.
All decisions are local and depend on O(ℓ_pump)‑radius information and precomputed tables. The (⇒) direction follows by restricting any O(1) solution on canonical long representatives of each τ ∈ T_long.

Verification plan (singly exponential in β)
- Enumerate T and T_long (Proposition 9). Precompute Ext_τ for τ ∈ T and Ext_{τ_b ⊙ τ_c} for τ_b,τ_c ∈ T_long (Proposition 5) and/or W‑matrices (Proposition 21). For endpoint checks, precompute RightAllow(Type) and LeftAllow(Type) := projections of Ext.
- Check (1) for each τ ∈ T_long; check (2) for all triples (τ_left, τ_S, τ_right); check (3) for all pairs (τ, τ_S). Total work is |T_long|·β^O(1) + |T_long|^2·|T|·β^O(1) + |T_long|·|T|·β^O(1).

Sanity tests for the Stage‑2 certificate
- Equality LCL (E={(c,c)}, A_0=A_1={c}): choose Q_τ=(c,c,c,c) for all τ ∈ T_long; (1)–(3) hold; classification O(1).
- Proper 2‑coloring: wrap E(R1_τ,L1_τ) fails for any τ; no {Q_τ} exist; Stage‑1 yields Θ(log* n).
- Endpoint stress: If for some τ,τ_S RightAllow(τ_S) ∩ N_E(L1_τ) = ∅, clause (3) fails as desired.

Endpoint‑coupled Stage‑1 (clarification)
In Theorem S1‑path (output.md), the interior block between two consecutive separators S (left) and S′ (right) is filled using W_{b⊙c}[α_L][α_R], where τ_b is the long type immediately to the right of S, τ_c is the long type immediately to the left of S′, α_L is the second output of S (given by f_mid or g_L), and α_R is the first output of S′ (given by f_mid or g_R). For endpoint‑adjacent separators, alignment conditions (iii) in g_L/g_R ensure α_L ∈ OutR2(τ_b,·) and α_R ∈ OutL1(τ_c,·), so the same W‑matrix completion applies. The missing small‑n cases are handled by Lemma TP (tiny‑path fallback).

Implementation aids and early filters
- Endpoint projections: RightColors(τ) and LeftColors(τ) are the R1/L1 projections of Ext_τ. Define V_left[τ][α] := (∃y ∈ RightColors(τ) with E(y,α)) and V_right[α][τ] := (∃x ∈ LeftColors(τ) with E(α,x)). These equal allow‑sets L_allow(τ) and R_allow(τ) as E‑neighborhoods.
- Incremental endpoint projections under append (k_flag ≥ 4): LeftColors(τ·a) = LeftColors(τ) and RightColors(τ·a) = { y ∈ A_a : ∃x1,x2,x3 Left3_τ[x1,x2,x3] ∧ E(x3,y) }.
- Early infeasibility filters (Stage‑1): If OutR2(τ_b,s) or OutL1(τ_c,s) is empty for some arguments, no feasible f_mid exists. If L_allow(τ_end)=∅ or R_allow(τ_end)=∅, then no endpoint maps g_L/g_R can exist. These are constant‑time checks on precomputed tables.
Stage‑2 on oriented paths: audit of partition proposals and typed certificate (r=1)

1) Counterexample to the bounded‑remainder claim (Prover 01, Step C)
- Claim in 01: After removing trimmed interiors of long periodic runs, every remaining component P_short has |P_short| ≤ 2ℓ_width.
- Counterexample: Let the input be a binary string with no subword of the form w^K with |w| ≤ ℓ_pattern and K ≥ ℓ_count + 2ℓ_width (e.g., a de Bruijn‑type or random string). Then P_long = ∅ and P_short = whole path. For n ≫ 2ℓ_width this violates the claim. Conclusion: a separate cutting step on the irregular remainder is necessary.

2) Why the window‑color injectivity (Prover 02) needs revision
- As stated, Lbig = ℓ_count·ℓ_pattern and the Fine–Wilf argument are insufficient to guarantee that the map v ↦ c(v) is injective within distance ℓ_pattern on Pirreg. Take a long p‑periodic run with p=ℓ_pattern. Let u be within ℓ_width·p of the left boundary and v:=u+p. If Lbig is a multiple of p (it is), then c(u)=c(v). Both u and v can remain in the trimmed margins (Pirreg). Hence injectivity fails. Moreover, the proof mixes distances in the full path with distances in the induced subgraph on Pirreg; MIS correctness needs injectivity within the induced subgraph on connected components of Pirreg.
- Fix sketch: (i) choose Lbig ≥ (ℓ_count+2ℓ_width−1)·ℓ_pattern and (preferably) coprime to every period p ≤ ℓ_pattern, and (ii) prove injectivity within each connected component H of Pirreg: if u,v ∈ H, dist_H(u,v) ≤ ℓ_pattern, and c(u)=c(v), then H would contain a p‑periodic subpath of length ≥ (ℓ_count+2ℓ_width)·p, contradicting the removal of trimmed interiors. The proof must explicitly ensure that the periodic region witnessing c(u)=c(v) lies inside H (hence the need to work in the induced subgraph metric).

3) MIS on Pirreg (constant rounds)
- Once injectivity in each component H is established, compute a greedy MIS on the ℓ_pattern‑th power of H in O(1) phases by processing length‑Lbig color classes in a fixed total order (the number of colors is a constant depending only on β). The resulting components of H\I have lengths in [ℓ_pattern, 2ℓ_pattern]. This replaces the incorrect Step C and yields the desired constant‑size irregular blocks.

4) Stage‑2 certificate: avoid length/phase mismatch
- Full‑period outputs f_type(τ) of length |w_τ| are awkward when the actual primitive period |w| in a long run differs from |w_τ|. Two safer alternatives:
  • Anchors: define f_anchor on period types to give only 2r outputs per period (r=1 here). Add a local, constant‑radius phase‑selection rule inside each long run (e.g., pick the unique phase whose length‑|w| window is lexicographically minimal; uniqueness holds for primitive w). Use (F1) to prevent anchor conflicts and (F2) with Bridging[τ_S] to fill O(1)‑gaps.
  • Length‑matched types: restrict f_type so that its output length equals the primitive period length actually used in P_long (with a proof that the length is determined by the period’s type in this context), and specify how nodes compute phase in O(1).

5) Do not “tile by Q_τ”
- A quadruple Q_τ ∈ Ext_τ certifies existence of a labeling for the whole block of type τ with those boundary colors. It does not imply the existence of a constant tile that can be repeated. Instead, use anchors inside long runs and fill gaps by Ext‑based Bridging over the type τ_S of each short gap.

6) Auxiliary tables for Stage‑2 verification (singly exponential in β)
- Bridging across a short middle type τ_S:
  Bridging[τ_S][α_L][α_R] := true ⇔ ∃(o1,o2,o3,o4) ∈ Ext_{τ_S} with E(α_L,o1) and E(o4,α_R).
  This is precomputable from Ext_{τ_S} and E.
- Endpoint allow sets (already aligned with our S1 machinery):
  LeftAllow(τ) := { α : ∃y with (x1,x2,x3,y) ∈ Ext_τ and E(y,α) },
  RightAllow(τ) := { α : ∃x with (x, x2, x3, y) ∈ Ext_τ and E(α,x) }.
- With these, a typed anchor certificate can be checked in 2^{poly(β)} time.

7) Status and action items
- We keep Theorem S2‑path out of output.md until a correct O(1) partition is written and proved in our notation. The (⇒) direction (extracting a typed anchor certificate from an O(1) algorithm) is standard and can be formalized once the certificate object is finalized. The (⇐) direction hinges on the partition; complete that first.
- Provide a full proof of the per‑component injectivity lemma (with an explicit Lbig) and the constant‑phase MIS construction on the ℓ_pattern‑th power of Pirreg. Then integrate the Stage‑2 anchors + Bridging construction.
- Meanwhile, the auxiliary Bridging/Allow tables and the typed‑certificate idea are sound and useful for the verifier; use them in tests but do not elevate S2 to output.md yet.
Refined Stage‑2 plan on oriented paths: per‑component injectivity, anchors, and reversal caution

Parameters and notation
- Let ℓ_pattern := ℓ_pump, ℓ_width := ℓ_pump, and ℓ_count := 2ℓ_pump + 2. Define
  Lwin := (ℓ_count + 2ℓ_width) · ℓ_pattern + (ℓ_pattern − 1).
- For any type τ, we continue to use the (L1,L2,R2,R1) boundary indexing of Ext_τ. For a middle concatenation τ_b ⊙ τ_c, the left seam meets o1 and the right seam meets o4.

Partition of an oriented path (per‑component formulation to avoid leaks)
- Step 1 (Plong): For each period length p ∈ [1..ℓ_pattern] and each short type σ of length p, detect maximal σ^{⊙K} runs with K ≥ ℓ_count + 2ℓ_width. Trim ℓ_width · p nodes off both ends of each such run. The union of all trimmed interiors over all p,σ is Plong. The complement is Pirreg.
- Good set per component: For a directed connected component H of Pirreg, define
  Good_H := { v ∈ H : the forward window of length Lwin, positions v..v+Lwin−1, lies entirely in H }.
  Define c_H(v) as that length‑Lwin input window (as a bitstring) for v ∈ Good_H.

Injectivity lemma (to be proven and then moved to output)
- Lemma (per‑component injectivity). Fix a component H of Pirreg. If u,v ∈ Good_H with dist_H(u,v) = p ∈ [1..ℓ_pattern] and c_H(u) = c_H(v), then H contains a p‑periodic subpath of length at least (ℓ_count + 2ℓ_width) · p, a contradiction with Step 1.
  Sketch. Equality of the two length‑Lwin windows at shift p implies p‑periodicity on the union interval of length Lwin+p. With our choice of Lwin, Lwin+p ≥ (ℓ_count+2ℓ_width)·p. Both windows lie in H and H is connected, hence the union lies in H. Such a long p‑periodic subpath would have produced a trimmed interior in Step 1, so it cannot exist in Pirreg.
- Consequence. Running a greedy MIS on the ℓ_pattern‑th power of each component H, processing color classes c_H in a fixed total order, yields spacing in [ℓ_pattern, 2ℓ_pattern] within H. Combining with the trimmed margins (each < ℓ_width·ℓ_pattern from Step 1), every connected piece of Pirreg\I has length bounded by a constant K_part = Lwin + 2ℓ_width·ℓ_pattern + 2ℓ_pattern.

Typed‑anchor Stage‑2 certificate (cleaned)
- Base types and periodic families: T_base := { σ ∈ T : k_flag(σ) ∈ {1,2,3}, 1 ≤ |σ| ≤ ℓ_pattern }. For σ ∈ T_base, define Π(σ) := { τ ∈ T_long : ∃ k ≥ ℓ_count with τ = Type(σ^{⊙k}) } via type concatenation.
- Canonical phase: On each Plong run whose long type lies in Π(σ), select a unique phase modulo |σ| (e.g., lexicographically minimal length‑|σ| window inside the run; ties broken by a fixed total order). Place anchors at that phase every |σ| nodes.
- Certificate data: For each σ ∈ T_base, choose an anchor α(σ) = (α1,α2) ∈ Σ_out^2.
- Feasibility checks (finite, from Ext only):
  1) Local anchor legality: αi ∈ A_{bit at anchor i} and E(α1, α2). For p=1 (|σ|=1) add the overlap constraint α1=α2 and E(α1, α1).
  2) Two‑sided bridging: For every short middle type τ_S ∈ T and every τ_L ∈ Π(σ_L), τ_R ∈ Π(σ_R), require Bridging[τ_S][α_R2(σ_L)][α_L1(σ_R)] = true, where α_R2(σ_L) denotes the right seam (second) color of α(σ_L) and α_L1(σ_R) the left seam (first) color of α(σ_R). Bridging[τ_S] is derived from Ext_{τ_S} by existentially quantifying o2,o3 and enforcing E at o1/o4.
  3) Endpoints (one‑sided): For each τ ∈ Π(σ) and each τ_S ∈ T that may appear at an endpoint, require LeftAllow(τ_S) to contain some o4 with E(o4, α1(σ)) and RightAllow(τ_S) to contain some o1 with E(α2(σ), o1).
- Construction (given the partition): Place anchors at the chosen phase in each Plong run. All gaps (between anchors, between Plong and Pirreg, and endpoint pieces) have O(1) length (bounded by K_part). Fill each gap S by a table lookup in Bridging[Type(S)] using the seam colors determined by adjacent anchors; fill endpoint gaps using the one‑sided Allow sets. No global word enumeration is needed.
- Verification (NEXPTIME): Enumerate T, compute Ext_τ, Bridging[τ_S], and Allow‑sets; generate Π(σ) via concatenations σ^{⊙k} for k ≤ ℓ_count. Check the three families of constraints exhaustively. Total work 2^{poly(β)}.

Reversal caution for W‑matrices
- The identity W_{Rev(c) ⊙ Rev(b)}[α_R][α_L] = W_{b ⊙ c}[α_L][α_R] fails in general for directed E because it swaps the direction of the seam constraints. Counterexample: Σ_out={a,b}, E={(a,b),(b,b)}; for the length‑2 middle type, W_{b⊙c}[a][b]=true (a→b→b→b), but W_{Rev(c)⊙Rev(b)}[b][a] would require b→?→?→a, impossible since there is no edge to a. Use reversal only together with E transposed, or avoid it in formal proofs.
