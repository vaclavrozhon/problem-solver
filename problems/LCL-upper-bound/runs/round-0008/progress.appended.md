## Round 0008 — 2025-08-27T18:49:31.402449Z

Round 0008 — Path endpoints for Stage‑1, Stage‑2 certificate formalization for oriented paths, and audit items

Summary
- I propose a complete, endpoint-aware Stage‑1 characterization for globally oriented paths that is verifiable in NEXPTIME and closes the gap currently marked as “pending endpoint treatment” in output.md. The witness consists of (i) a two-sided feasible function f_mid on long types, plus (ii) one-sided endpoint witnesses g_L and g_R certified via precomputed endpoint seam-compatibility matrices derived from Ext.
- I also propose a precise Stage‑2 (O(1) vs Ω(log* n)) certificate specialized to globally oriented paths, with a constant-time construction proof that reuses the paper’s (ℓ_width,ℓ_count,ℓ_pattern)-partition framework, now expressed wholly in Ext/type terms. This fills the other major missing piece.
- I point out several small gaps/cleanups in output.md (notably the missing k=2→3 base case and a minor duplication) and list concise steps to integrate the new lemmas and theorems.

Audit of output.md: gaps and cleanups
- Missing base case k=2→3. Proposition 6 (k=1→2) and Proposition 7 (k=3→4) are present, but the explicit k=2→3 update is absent. This is needed to seed δ transitions from length 2.
  • Correct rule to add: for t=(b1,b2), t′=t·a,
    (x1,x2,x3,x4)∈Ext_{t′} iff [x3=x2, x1∈A_{b1}, x2∈A_{b2}, x4∈A_a, E(x1,x2), E(x2,x4)].
- Stage‑1 equivalence on paths is marked “pending endpoint treatment.” Below I supply a self-contained endpoint-aware witness, a verification routine, and an equivalence theorem using only Ext and Types.
- Redundancy: Lemma 2 (Ext concatenation for k_flag≥4) and Lemma 11 (for all k_flag) both appear. Lemma 11 subsumes Lemma 2; we can keep both but it is clearer to refer uniformly to Lemma 11.
- Stage‑2 (O(1) vs Ω(log* n)) is not yet included. I give a precise per-type boundary-interface witness and an O(1) labeling construction for oriented paths, with checks entirely in Ext.

Preliminaries to add (endpoint projections)
- Define for any type τ:
  • RightColors(τ) := { y ∈ Σ_out : ∃x1,x2,x3 s.t. (x1,x2,x3,y) ∈ Ext_τ }.
  • LeftColors(τ)  := { x ∈ Σ_out : ∃x2,x3,y s.t. (x,x2,x3,y) ∈ Ext_τ }.
  These are just projections of Ext_τ; computable in O(β^4) per τ.
- Define endpoint seam-compatibility (precompute once):
  • V_left[τ][α1] = true iff ∃y∈RightColors(τ) with E(y,α1).
  • V_right[α2][τ] = true iff ∃x∈LeftColors(τ) with E(α2,x).
  These witness that an end block of type τ can be attached to the first (resp. last) node of the adjacent 2-node separator colored α1 (resp. α2).

Stage‑1 (Ω(n) vs o(n)) on globally oriented paths — endpoint-aware witness and equivalence
Witness objects to guess and verify
- Long types: T_long := {τ : k_flag(τ)≥4}. Precompute T and split.
- Mid-separator feasible function f_mid: T_long × {0,1}^2 × T_long → Σ_out^2.
  • Local legality: if f_mid(τ_L, s, τ_R)=(α1,α2), require αi∈A_{s[i]} and E(α1,α2).
  • Universal extendibility across two separators: For all τ_b,τ_c∈T_long, s1,s2∈{0,1}^2 and for all α_L ∈ OutR2(τ_b,s1), α_R ∈ OutL1(τ_c,s2), require ∃(o1,o2,o3,o4)∈Ext_{τ_b⊙τ_c} with E(α_L,o1) and E(o4,α_R). Here
    OutR2(τ_b,s):={second(f_mid(τ_a,s,τ_b)): τ_a∈T_long},
    OutL1(τ_c,s):={first(f_mid(τ_c,s,τ_d)): τ_d∈T_long}.
  • Verification reduction: precompute W_{b⊙c}[α_L][α_R] as in Prop. 21; then check W_{b⊙c}[α_L][α_R]=true for all required α_L, α_R.
- Endpoint witnesses: g_L : T × {0,1}^2 → Σ_out^2 and g_R : {0,1}^2 × T → Σ_out^2.
  • Local legality: if g_L(τ_end,s)=(β1,β2) then βi∈A_{s[i]} and E(β1,β2). Symmetric for g_R.
  • One-sided feasibility: V_left[τ_end][β1]=true for g_L, and V_right[β2][τ_end]=true for g_R.

Theorem S1-path (equivalence; oriented paths).
An r=1, β-normalized LCL on globally oriented paths has deterministic complexity o(n) iff there exist witnesses (f_mid, g_L, g_R) satisfying the above checks. Moreover, existence is verifiable in nondeterministic time 2^{poly(β)}.
Sketch proof (⇒): Given an o(n)-round algorithm A, define f_mid exactly as in the cycle case by pumping the two long contexts on either side of a 2-node separator; feasibility uses Ext_{τ_b⊙τ_c} (Lemma 11) and pumping (Lemmas 13–14). Define g_L(τ_end,s), g_R(s,τ_end) by simulating A on a path that consists of a long pumped left (resp. right) context, then the endpoint block of type τ_end, then a 2-node separator S with input s, then a long pumped right (resp. left) context; pick IDs so that A’s runtime halo is well inside the pumped parts. Local legality is by correctness of A; one-sided feasibility follows because the seam edge between the endpoint block and S is satisfied in the simulation, hence V_left/V_right holds by projection to Ext.
Sketch proof (⇐): From (f_mid, g_L, g_R), construct in O(log* n) a labeling as follows. In O(log* n) rounds, compute an MIS on the K-th power of the oriented path (K:=ℓ_pump+4); separators are the selected MIS nodes augmented to 2-node blocks with inputs s, spaced in [K,2K]. For each interior pair of separators (S1, S2) with adjacent long types τ_b, τ_c on their sides, color S1 and S2 by f_mid, and complete the middle using the witness in Ext_{τ_b⊙τ_c}. For endpoint segments, color the unique separator S by g_L or g_R and complete the adjoining block using V_left or V_right and Ext of the endpoint type. All checks and fillings are local and constant-radius; runtime O(log* n) comes from MIS.
NEXPTIME verification: Deterministically compute T, T_long, Ext and W_{b⊙c}, V_left, V_right in 2^{poly(β)} time. Nondeterministically guess f_mid, g_L, g_R and verify the finite set of constraints via table lookups; total time 2^{poly(β)}.

Stage‑2 (O(1) vs Ω(log* n)) on globally oriented paths — per-type boundary interface
Witness per long type τ∈T_long: Q_τ=(L1_τ,L2_τ,R2_τ,R1_τ)∈Ext_τ.
Checks
- Per-type tiling:
  • E(L1_τ,L2_τ), E(R2_τ,R1_τ) (redundant but explicit), and wrap E(R1_τ,L1_τ).
- Universal bridging across any middle type τ_S (short or long):
  • For all τ_left, τ_S, τ_right with τ_left,τ_right∈T_long: ∃(o1,o2,o3,o4)∈Ext_{τ_S} with E(R1_{τ_left},o1) and E(o4,L1_{τ_right}). For S empty, this reduces to E(R1_{τ_left},L1_{τ_right}).
Theorem S2-path (constant-time construction).
If {Q_τ} satisfy the above, there is an O(1)-round deterministic algorithm on oriented paths.
Sketch construction: In O(1) rounds compute an (ℓ_width,ℓ_count,ℓ_pattern)-partition (as in the paper’s Lemma 22; here orientation is globally given). Choose parameters ℓ_width=ℓ_pattern=ℓ_pump and ℓ_count=2ℓ_pump+2. Long paths are periodic with primitive period length ≤ℓ_pump, repeated ≥ℓ_count. Each long path P has a long type τ; tile P by repeats of τ using E(R1_τ,L1_τ); interior legality holds since Q_τ∈Ext_τ. Each short/irregular separator S (any τ_S) is filled using its Ext witness to match the boundary colors of adjacent long blocks (bridging condition). Endpoints need no special treatment beyond bridging to the nearest long block. All decisions are constant-radius.
NEXPTIME verification: Guess {Q_τ} over T_long; verify tiling and bridging universally with Ext lookups; total time 2^{poly(β)}.

Complexity refinements and preprocessing
- Append optimization (already Proposition 19): O(β^4) per append after Left3 slices.
- Concatenation optimization (Proposition 5): O(β^6) per pair via Left/Right 3D slices.
- Seam feasibility matrices W_{b⊙c} (Proposition 21): speed up Stage‑1 verification.
- Endpoint matrices V_left, V_right: O(|T|·β·Δ) preprocessing; used by g_L/g_R verification.

Sanity checks on examples
- Equality LCL: choose c∈A_0∩A_1 with E(c,c); f_mid constant (c,c); g_L, g_R constant (c,c); any Q_τ=(c,c,c,c); both stages accept ⇒ O(1).
- Proper 2-coloring: Stage‑1 witnesses exist (Θ(log* n)); Stage‑2 fails due to wrap E(R1_τ,L1_τ) and universal bridging impossibility with a period‑1 interface; classification Θ(log* n).
- Linear case: if no feasible (f_mid,g_L,g_R) exists, Stage‑1 rejects ⇒ Ω(n).

Actionable insertions for output.md
1) Add Proposition (Base-case update; k=2→3) exactly as stated in the audit.
2) Add definitions of RightColors, LeftColors, V_left, V_right, and a short proposition on their computation/complexity.
3) Add the endpoint-aware Stage‑1 theorem S1-path: statement, witness definitions (f_mid, g_L, g_R), quantifier-minimized verification using W_{b⊙c}, and both directions of the equivalence (with brief, oriented-path-specific proofs relying on Lemmas 11, 13–14).
4) Add Stage‑2 theorem S2-path: the per-type boundary interface witness Q_τ, universal checks, and the O(1) labeling construction using the (ℓ_width,ℓ_count,ℓ_pattern)-partition on oriented paths (cite the paper’s lemma if not reproved in full; parameters explicit).
5) Note that Lemma 11 subsumes Lemma 2 and refer to Lemma 11 uniformly for concatenation; optionally keep Lemma 2 as a corollary for readability.

Why these fill the gaps
- Stage‑1 now covers finite paths with endpoints rigorously, removing the caveat. All conditions are expressed with Ext plus precomputed matrices, so the verification remains single-exponential. The construction uses only standard Kth‑power MIS.
- Stage‑2 shifts entirely to per-type interfaces and Ext bridging, matching the paper’s constant-time regime but specialized to globally oriented paths. The verification is again single-exponential; the algorithm is explicit and constant‑round.

Next steps
- Integrate the new statements into output.md with concise proofs. Keep the MIS step description and (ℓ_width,ℓ_count,ℓ_pattern)-partition paraphrased from the paper but specialized to oriented paths.
- Add a small regression suite for β∈{2,3}: (i) verify k=2→3 update; (ii) validate V_left/V_right vs direct Ext; (iii) test W_{b⊙c} correctness; (iv) confirm Stage‑1 acceptance on equality LCL, Stage‑2 rejection on 2‑coloring.

