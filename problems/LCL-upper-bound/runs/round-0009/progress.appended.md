## Round 0009 — 2025-08-27T19:01:12.517580Z

Round 0009 — Endpoint-correct Stage-1 for paths, audits, and verifiable fixes

Status and quick audit of output.md
- What is solid: r=1 primitives (append DP with k-flag, corrected base cases k=1→2, 3→4; concatenation; associativity; congruence), type enumeration and |T| bound; pumping lemmas; Out-set version of feasible f over T_long; optimized append O(β^4); seam-feasibility matrices W; endpoint projections RightColors/LeftColors and endpoint seam matrices V_left,V_right with Lemma E1.
- Main gap (explicitly acknowledged): Stage-1 equivalence on oriented paths is “pending endpoint treatment.” As written, there is no coupling between the endpoint-adjacent separator’s open seam color and the Out-sets of the interior feasible function; this can admit false positives.
- Minor editorial/numbering issues to flag: (i) There are two different “Proposition 6” items (base k=1→2 and k_flag=1 update as 6A) and also “Proposition 6B” (k=2→3), which is confusing; consider renumbering. (ii) Both Lemma 2 (k_flag≥4) and Lemma 11 (all k_flag) state concatenation; Lemma 11 subsumes Lemma 2—either keep both with a note or refer to Lemma 11 uniformly. (iii) Proposition 9 still quotes O(β^5) per append in the long regime; Proposition 19 improves this to O(β^4), so the preprocessing bound can be tightened accordingly.

Problem and minimal counterexample (why the current endpoint certificate is insufficient)
- Obstruction template: Fix a long type τ_b and an input s such that OutR2(τ_b,s) = {α}. Suppose W_{b⊙c}[α][·] admits all right seams induced by f on the next separator. If an endpoint witness g_L(τ_end,s) outputs (β1,β2) with β2 ≠ α but V_left[τ_end][β1]=true, the current checks pass but the fill of the block between this separator and the next separator (colored by f) may fail, as there may be no (o1,o2,o3,o4) ∈ Ext_{τ_b ⊙ τ_c} with E(β2,o1). Hence the endpoint separator must be aligned with the interior Out-sets.

Claim (corrected endpoint-aware Stage-1 certificate for oriented paths)
- Augmented endpoint witnesses aligned to Out-sets:
  • g_L: T × {0,1}^2 × T_long → Σ_out^2. For g_L(τ_end,s,τ_b)=(β1,β2) require: (i) βi∈A_{s[i]} and E(β1,β2); (ii) V_left[τ_end][β1]=true; (iii) β2 ∈ OutR2(τ_b,s).
  • g_R: T_long × {0,1}^2 × T → Σ_out^2. For g_R(τ_c,s,τ_end)=(β1,β2) require: (i) βi∈A_{s[i]} and E(β1,β2); (ii) V_right[β2][τ_end]=true; (iii) β1 ∈ OutL1(τ_c,s).
- Feasible mid-separator function f_mid: as in output.md (Out-set form over T_long), with universal extendibility checked via W_{b⊙c}.
- Theorem S1-path (equivalence; oriented paths). An r=1, β-normalized LCL on globally oriented paths has deterministic complexity o(n) iff there exist (f_mid,g_L,g_R) satisfying the above. Verification is in nondeterministic 2^{poly(β)} time.

Proof sketch (auditable pieces)
- (⇒) Existence. Given an o(n)-round algorithm A:
  • f_mid: As in output.md (cycle gadget + pumping). Well-definedness uses that we pump to length in [s,s+ℓ_pump] and choose IDs inside the <0.1s halos.
  • g_L: For any (τ_end,s,τ_b), form a path consisting of a long pumped block of type τ_b to the right, the 2-node separator S with input s, and a left endpoint block of type τ_end; pad far outside S so A’s runtime halo is contained. Set g_L(τ_end,s,τ_b) to A’s 2-node output on S. Then: (i) node/window legality holds by correctness of A; (ii) V_left holds because the seam into τ_end is satisfied in A’s run; (iii) alignment β2∈OutR2(τ_b,s) holds by construction since S’s right output was produced in a context of type τ_b, i.e., it is one of the attained second outputs for τ_b under f_mid with input s. Define g_R symmetrically.
- (⇐) Construction of an O(log* n) algorithm.
  • Place separators by an MIS on the K-th power of the directed path in O(log* n) rounds with K := ℓ_pump+4. Standard properties ensure that the distance between neighboring separators is in [K,2K], and that the long contexts abutting each interior side are T_long.
  • Label interior separators by f_mid (using local s and adjacent long types τ_b,τ_c). Use the precomputed matrix W_{b⊙c} to fill each interior middle block between two separators by choosing a witness in Ext_{τ_b⊙τ_c} consistent with the seams.
  • Endpoints: Let S_left be the unique separator adjacent to the left end. Compute τ_end (type of the left end-block) and τ_b (long type on S_left’s right). Color S_left by g_L(τ_end,s,τ_b). By V_left there is (o1,o2,o3,o4)∈Ext_{τ_end} with E(o4,β1), so we fill the endpoint block. For the block between S_left and the nearest interior separator S2, by (iii) the outward seam color β2 is in OutR2(τ_b,s), while the left seam color from S2 lies in OutL1(τ_c,s2). Hence W_{b⊙c}[β2][α_R] is true and the block is fillable via Ext_{τ_b⊙τ_c}. Do the right end symmetrically with g_R. Runtime is O(log* n); all fillings are constant-radius lookups in precomputed tables.

NEXPTIME verification details
- Precompute deterministically in 2^{poly(β)} time:
  • T, T_long via BFS (Prop. 9) and Ext_τ for τ∈T; use Prop. 19 to implement k_flag≥4 appends in O(β^4).
  • Ext_{τ_b⊙τ_c} for τ_b,τ_c∈T_long via Prop. 5, and W_{b⊙c}.
  • V_left, V_right from endpoint projections (as in output.md).
  • OutR2(τ_b,s), OutL1(τ_c,s) sets from f_mid.
- Guess f_mid, g_L, g_R. Verify:
  • For all entries: node legality and E on the 2-node window.
  • f_mid universal extendibility via W_{b⊙c} (Out-set form; Lemma 20).
  • g_L: V_left[τ_end][β1]=true and β2 ∈ OutR2(τ_b,s). g_R: V_right[β2][τ_end]=true and β1 ∈ OutL1(τ_c,s).
- All checks are constant-time table lookups; total number of cases is |T_long|^2·4 for f_mid and (|T|·|T_long|)·4 for each endpoint map; overall time 2^{poly(β)}.

Small example illustrating necessity of alignment
- Let Σ_out={a,b}, A_0=A_1=Σ_out, and E contains only edges a→a and b→b. Suppose a feasible f_mid exists that always outputs (a,a), hence OutR2(τ_b,s)={a}. Choose τ_end with RightColors(τ_end)={a,b}. If g_L(τ_end,s) outputs (b,a), V_left holds (since E(b,b) and b∈RightColors(τ_end)) but β2=a… OK here it matches. Now flip: define f_mid that always outputs (b,b), so OutR2={b}, but g_L outputs (a,a). V_left still holds if a∈RightColors(τ_end), yet β2=a∉OutR2. There is no guarantee that the endpoint–interior block can be completed respecting the next separator colored according to f_mid. This shows (iii) is required.

Additional small lemmas/propositions to add (self-contained)
- Endpoint–interior bridging lemma. Given τ_b,τ_c∈T_long, inputs s1,s2, and endpoint-adjacent separator colors α_L,α_R with α_L∈OutR2(τ_b,s1), α_R∈OutL1(τ_c,s2), there exists a completion of the intervening block consistent with both seams iff W_{b⊙c}[α_L][α_R]=true. Proof: by definition of W_{b⊙c}; direction “only if” follows by restricting any legal completion; “if” follows by taking the witnessing (o1,o2,o3,o4)∈Ext_{τ_b⊙τ_c}.
- Preprocessing remark (tightening Prop. 9). Using Prop. 19, the k_flag≥4 append step is O(β^4), so the BFS enumeration can cite O(β^4) per transition in the long regime; short base-case transitions remain O(β^4).

Implementation notes and counts
- OutR2/OutL1 sets have size ≤β; precompute once per (τ, s). For faster Stage-1 checks, one can precompute for each (τ_b,τ_c,s1,s2) the β×β mask W_{b⊙c} and then just iterate over α_L in OutR2(τ_b,s1) and α_R in OutL1(τ_c,s2).
- Endpoints: the verification size of g_L is |T|·|T_long|·4 entries; g_R symmetric. Sparse E can reduce preprocessing time for W and V matrices.

Explicit gaps to address in output.md
- Integrate the corrected Stage-1 path theorem (S1-path) with (f_mid,g_L,g_R) as above, and add the (⇒) and (⇐) proofs specialized to globally oriented paths.
- Add the endpoint–interior bridging lemma stated above; it is just an unpacking of W_{b⊙c} and will clarify the fill of the first interior block.
- Tighten Prop. 9’s complexity to use Prop. 19 (O(β^4) per long append).
- Note that Lemma 11 subsumes Lemma 2; consider merging references.
- Clean up numbering: avoid multiple “Proposition 6/6A/6B”.

Next steps
- Promote S1-path into output.md with full statement and auditable proofs, together with the augmented endpoint witnesses. Update the classification logic: if Stage-1 fails, classify Ω(n); if Stage-1 holds but Stage-2 certificate fails, classify Θ(log* n); if Stage-2 holds, classify O(1).
- Prepare unit tests: (i) synthetic instances where OutR2 is singleton and g_L is misaligned; the augmented certificate must reject; (ii) equality LCL (accept both stages); (iii) proper 2-coloring (accept Stage-1, reject Stage-2).
- Return to Stage-2: port the (ℓ_width,ℓ_count,ℓ_pattern)-partition to oriented paths with explicit parameters and a short self-contained proof, then finalize the per-type boundary interface certificate Q_τ.

