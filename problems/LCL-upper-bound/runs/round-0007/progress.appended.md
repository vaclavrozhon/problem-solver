## Round 0007 — 2025-08-27T15:27:59.162756Z

Round 0007 — endpoint-aware Stage‑1 for paths; audits, fixes, and a path-specific feasible witness

Audit of output.md (gaps and quick fixes)
- Missing base-case k=2→3. outputs.md currently states k=1→2 (Prop 6) and k=3→4 (Prop 7) but omits the explicit k=2→3 rule, although later arguments (“short cases follow by base cases”) rely on it. Please add:
  Proposition (Base-case update; k=2→3). Let t=(b1,b2), t′=t·a. For all (x1,x2,x3,x4)∈Σ_out^4,
  (x1,x2,x3,x4)∈Ext_{t′} ⇔ [x3=x2, x1∈A_{b1}, x2∈A_{b2}, x4∈A_a, E(x1,x2), E(x2,x4)].
  This is the corrected rule that eliminates the earlier x2∈A_a bug and is needed by δ.
- Stage‑1 equivalence on paths is still marked as “pending endpoint treatment.” Below I propose an endpoint-aware feasible witness and theorem tailored to globally oriented paths that cleanly resolves this gap using only Ext-level checks.

Preliminaries to reuse (from outputs.md)
- Types T with k_flag and Ext tables; δ enumeration and |T|≤4·2^{β^4} (Props 8–9).
- Ext-concatenation for all k_flags (Lemma 11) and associativity (Prop 12).
- Feasible function f over long types (Definition, Lemma 20) and seam-feasibility matrices W_{b⊙c} (Prop 21).
- Optimized append (Prop 19) and O(β^6) concatenation (Prop 5).

New endpoint primitives (one-sided summaries)
- RightColors and LeftColors of a type τ:
  RightColors(τ):= { y∈Σ_out : ∃ x1,x2,x3 with (x1,x2,x3,y)∈Ext_τ }.
  LeftColors(τ):= { x∈Σ_out : ∃ x2,x3,x4 with (x,x2,x3,x4)∈Ext_τ }.
  These are simply the projections of Ext_τ to the last and first coordinates.
- Endpoint seam-compatibility matrices (precomputed once):
  • V_left[τ][α1] := true iff ∃ y∈RightColors(τ) with E(y,α1). This witnesses the possibility to attach a left-end block of type τ to the first node of a separator colored α1.
  • V_right[α2][τ] := true iff ∃ x∈LeftColors(τ) with E(α2,x). This witnesses the possibility to attach the last node of a separator colored α2 to a right-end block of type τ.
  Complexity: RightColors, LeftColors in O(β^4) per τ by projecting Ext_τ; V_left, V_right in O(|T|·β·Δ) where Δ≤β.

Endpoint-aware Stage‑1 witness for paths
- Mid-separator witness (unchanged): f_mid : T_long × {0,1}^2 × T_long → Σ_out^2. This is the feasible function of outputs.md (Out-set form), to be used for separators strictly between two long contexts. Verification uses the W_{b⊙c} matrices (Prop 21).
- Endpoint witnesses: g_L : T × {0,1}^2 → Σ_out^2 and g_R : {0,1}^2 × T → Σ_out^2, giving the 2-node output on the unique separator adjacent to the left end (g_L) and to the right end (g_R). They must satisfy:
  (i) Node/edge legality on the separator: if g_L(τ_end,s)=(β1,β2) then βi∈A_{s[i]} and E(β1,β2); similarly for g_R(s,τ_end)=(β1,β2).
  (ii) One-sided extendibility:
    • Left end: V_left[τ_end][β1]=true (equivalently, ∃y∈RightColors(τ_end) with E(y,β1)).
    • Right end: V_right[β2][τ_end]=true (equivalently, ∃x∈LeftColors(τ_end) with E(β2,x)).
  Remarks. We quantify τ_end over all reachable types (short or long). The checks involve only precomputed endpoint matrices and A,E.

Theorem (Stage‑1 for globally oriented paths — equivalence).
Let P be a β-normalized r=1 LCL on globally oriented paths. The following are equivalent:
- P has deterministic LOCAL complexity o(n) on paths.
- There exist witnesses (f_mid, g_L, g_R) such that f_mid is feasible in the sense of outputs.md (Out-set form; Lemma 20) and g_L,g_R satisfy (i)–(ii) above.
Moreover, existence of such witnesses is checkable in nondeterministic time 2^{poly(β)}.

Proof sketch.
⇒ (Only if; extract witnesses from an o(n) algorithm A.)
- Let t(n)=o(n) be the runtime of A. Fix s≫t(n) and n′≫s as in Lemma 18. For each w with |w|≤ℓ_pump, define pumped w^+ with |w^+|∈[s,s+ℓ_pump] and Type(w^+)=Type(w). As in Lemma 18, define f_mid by simulating A on w_a^+·S·w_b^+ (two-sided) and reading the 2-node outputs on S; feasibility follows exactly as in the cycle proof using concatenation and Type pumping.
- Left endpoint g_L: For any end type τ_end and 2-bit input s of the separator S, consider an imaginary path P := Y · P_end · S · Z where P_end has Type τ_end, Y and Z are long pumped contexts with Type in T_long (|Y|,|Z|≥s), and the total size is ≤n′. Assign pairwise distinct IDs so that the view of S is determined as in Lemma 24. Run A on P, and define g_L(τ_end,s) as the 2-node output on S. Since A produces a legal labeling, the edge between the last node of P_end and the first node of S is legal; thus ∃y∈RightColors(τ_end) with E(y,β1)=true for β1 = first(g_L(τ_end,s)), i.e., V_left[τ_end][β1] holds. Node memberships and E(β1,β2) hold by local legality on S. g_R is extracted symmetrically by placing S before P_end. This construction is independent of particular Y,Z choices due to pumping and Type-determinism; hence witnesses are well-defined.
⇐ (If; construct an O(log* n)-round algorithm.)
- Place separators by computing an MIS on the K-th power of the directed path in O(log* n) rounds with K:=ℓ_pump+4; as standard, the distance between neighboring separators is in [K,2K] except possibly from an endpoint to its nearest separator, which is <K+1.
- For any two separators S1,S2 (with a middle block B between them), let τ_b,τ_c be the long Types of the (at least K−2)-long contexts abutting S1 on the right and S2 on the left, respectively (pumping and δ ensure K is above the threshold so Types are long). Label S1 and S2 using f_mid (either orientation as needed). The feasibility of f_mid and the precomputed W_{b⊙c} matrix guarantee a consistent completion of B via membership in Ext_{τ_b⊙τ_c} with the seam constraints E(α_L,o1), E(o4,α_R).
- For the leftmost end block P_end (from the path’s first node to the first separator S), let τ_end be its Type and s the 2-bit input on S. Label S by g_L(τ_end,s). Then (ii) ensures V_left[τ_end][β1]=true for β1=first(g_L(τ_end,s)), i.e., ∃(o1,o2,o3,o4)∈Ext_{τ_end} with E(o4,β1). Fill P_end by any such Ext-witness; all internal nodes of P_end and the seam to S are now locally consistent. Handle the right end with g_R symmetrically using V_right.
- All nodes satisfy A/E constraints by construction; runtime is O(log* n) (the MIS step dominates; all fillings are local constant-radius choices guided by precomputed tables).

NEXPTIME verification (paths)
- Deterministically enumerate T and split T_long; precompute Ext_τ for τ∈T, W_{b⊙c} for τ_b,τ_c∈T_long (Prop 21), and endpoint matrices V_left, V_right.
- Nondeterministically guess f_mid and verify:
  • For every (τ_L,s,τ_R): node constraints on f_mid(·) (A and internal E).
  • For all τ_b,τ_c∈T_long and s1,s2 and all α_L∈OutR2(τ_b,s1), α_R∈OutL1(τ_c,s2): W_{b⊙c}[α_L][α_R]=true (Lemma 20).
- Nondeterministically guess g_L,g_R and verify their (i) node constraints and (ii) one-sided feasibility via V_left,V_right.
- Total time 2^{poly(β)}; all lookups are constant-time in the precomputed tables.

Indexing sanity and orientation
- Ext quadruples are ordered (L1,L2,R2,R1). For the left end, the seam to S is between R1 of P_end and L1 of S, hence we use V_left[τ_end][β1] with β1=first(g_L). For the right end, the seam is between R1 of S and L1 of P_end, hence we require V_right[β2][τ_end] with β2=second(g_R).

Why the endpoint augmentation is necessary
- The two-sided feasibility of f_mid on cycles does not imply one-sided compatibility with arbitrary short end segments (counterexamples exist where RightColors(τ_end) has no E-neighbor in some OutL1-set). The explicit endpoint witnesses g_L,g_R and checks via V_left,V_right are exactly the missing conditions to make the (⇐) direction work on paths without circularity.

Small examples and stress tests
- Equality E={(c,c)}. RightColors(τ)=LeftColors(τ)={c} for all τ with Ext≠∅. Pick f_mid constant (c,c) and let g_L(·,·)=g_R(·,·)=(c,c). V_left,V_right trivially true. Classified O(1) by Stage‑2 later; Stage‑1 accepts.
- Proper 2-coloring (Σ_out={a,b}, A_0=A_1=Σ_out, E forbids equal). There exists f_mid (Θ(log* n)), and we can choose g_L,g_R that alternate (e.g., g_L returns (a,b) or (b,a) matching end inputs), since both RightColors and LeftColors are {a,b}. Stage‑1 accepts; Stage‑2 will reject, yielding Θ(log* n).
- Linear/unsatisfiable seam cases. If for some τ_end we have RightColors(τ_end)⊆N_E^{-1}(α) empty for all α in some OutL1-set forced by any f_mid, then no g_L can satisfy V_left on that τ_end; Stage‑1 rejects, certifying Ω(n).

Implementation additions (to integrate into outputs.md)
- Add the missing k=2→3 base-case proposition.
- Add definitions of RightColors, LeftColors and endpoint matrices V_left,V_right with complexity notes.
- Add the endpoint-aware Stage‑1 witness (f_mid, g_L, g_R), its verification conditions, and the Stage‑1 theorem (equivalence on paths) with the proof outline as above.
- Keep the quantifier-minimized Out-set verification and W_{b⊙c} precomputation; add a note that g_L,g_R do not require quantification over left/right long types—only endpoint matrices V_left,V_right.

Next steps
- Promote the proposed theorem and primitives into output.md, resolving the “pending endpoint treatment” remark.
- Provide a short appendix with an MIS-on-Kth-power routine for directed paths and the exact K used (ℓ_pump+4), to make the O(log* n) construction fully explicit for paths.
- Stage‑2: once Stage‑1 is in place for paths, return to the constant-time partition for oriented paths (Lemma 22 analogue) and integrate the per-type boundary interface certificate Q_τ to decide O(1) vs Θ(log* n).
- Regression: extend the existing tests to include endpoint checks using V_left,V_right; verify on random tiny β that RightColors/LeftColors agree with direct enumeration; re-run concatenation associativity and W_{b⊙c} validation.

