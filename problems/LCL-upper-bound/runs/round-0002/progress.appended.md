## Round 0002 — 2025-08-27T11:52:16.710497Z

Mini-plan
- Repair and formalize the r=1 type DP: exact append-one-bit recurrence (including k<4 base cases), congruence (Type preserved under append), and concatenation at Ext-level.
- Replace all uses of R-composition via an intermediate output with explicit concatenation of Ext-tables; record a minimal counterexample showing why R-composition is unsound.
- Specify deterministic enumeration of all reachable types in exp time: state representation, δ update, reversal operator, and complexity bounds.
- Restate Stage-1 (Ω(n) vs o(n)) and Stage-2 (O(1) vs Ω(log* n)) NEXPTIME verifiers using only Ext-level concatenation; add precise verification conditions and pitfalls.
- Stress-test with toy LCLs (complete E, equality E, alternation E; mixed A_0/A_1) and sanity checks for base cases and reversal.

Context repairs from verifier feedback
- The δ update (append-one-bit) must be defined at the Ext-table level with correct boundary indexing; special care for k<4. I give exact formulas and a congruence lemma.
- Composition via R_t with an existential intermediate color m is unsound; replace by Ext-level concatenation (and only then project to R if needed). I provide a concrete 3-color counterexample and a corrected concatenation lemma.

1) r=1 summaries (Ext-tables) and exact DP
Notation: Σ_in={0,1}, Σ_out of size β, adjacency E⊆Σ_out×Σ_out, and per-input memberships A_0,A_1⊆Σ_out from C_in–out.
- For an input segment t of length k≥1, Ext_t ⊆ Σ_out^4 comprises the boundary quadruples (leftmost, second-from-left, second-from-right, rightmost) of all legal output colorings. For k<4 some positions coincide; we fix the boundary mapping:
  • k=1: B_1(c)=(c1,c1,c1,c1)
  • k=2: B_2(c)=(c1,c2,c1,c2)
  • k=3: B_3(c)=(c1,c2,c2,c3)
  • k≥4: B_k(c)=(c1,c2,c_{k-1},c_k)

Claim 1 (Append-one-bit recurrence; k≥3)
Statement. Let t be length k≥3 and a∈{0,1}. For every (x1,x2,x3,x4)∈Σ_out^4,
  (x1,x2,x3,x4)∈Ext_{t·a} ⇔ [x4∈A_a ∧ E(x3,x4) ∧ ∃z∈Σ_out: (x1,x2,z,x3)∈Ext_t].
Why useful here. It makes δ(Type,a) computable directly from Ext_t in O(β^5) time per append, avoiding string-level enumeration.
How it can fail. Misindexing x3 vs the old second-last and x4 vs the new last; or forgetting the k<4 cases, causing incorrect bases.
Quick test. Take β=2, A_0=A_1=Σ_out, E complete. Then Ext_t=Σ_out^4 for all t, and the RHS evaluates to true for all quadruples, so Ext_{t·a}=Σ_out^4, consistent.

Claim 2 (Base cases: k=1,2,3 updates)
Statement. Let t have length k∈{1,2,3}, a∈{0,1}.
- k=1, t=(b): (x1,x2,x3,x4)∈Ext_{t·a} iff x1=x3, x2=x4, x1∈A_b, x2∈A_a, and E(x1,x2).
- k=2, t=(b1,b2): (x1,x2,x3,x4)∈Ext_{t·a} iff x3=x2, x1∈A_{b1}, x2∈A_{b2}∩A_a, E(x1,x2), E(x2,x4).
- k=3, t=(b1,b2,b3): (x1,x2,x3,x4)∈Ext_{t·a} iff x1∈A_{b1}, x2∈A_{b2}, x3∈A_{b3}, x4∈A_a, and E(x1,x2), E(x2,x3), E(x3,x4).
Why useful here. These are the only special cases needed when seeding the DP from strings of length ≤3.
How it can fail. Forgetting that entries in Ext_t encode coordinate equalities when k<4; checking wrong membership set (e.g., using A_{b3} on x4).
Quick test. Let β=2, E={(a,a)} (self-loops at a only), A_b={a} for all b. For any t, Ext_t contains only quadruples with all entries a in the appropriate equality pattern. Each base-case update preserves this invariant.

Claim 3 (Congruence under append for r=1)
Statement. If Ext_P=Ext_Q then for every a∈{0,1} we have Ext_{P·a}=Ext_{Q·a}.
Why useful here. It justifies that δ on types is well-defined: the new Ext depends only on the old Ext and the appended bit.
Sketch proof. For k≥3 use Claim 1; for k<3 the base-case rules refer only to Ext_P (which determines k), A, and E; identical Ext tables imply identical updates.
How it can fail. If one accidentally lets δ depend on the concrete string beyond Ext (e.g., on interior inputs), congruence breaks; our recurrence avoids this.
Quick test. For β=3, pick random A,E; generate random P,Q of the same length with Ext_P=Ext_Q by construction (e.g., both trivial), and check Ext_{·a} equality by brute force on tiny β to sanity-check.

2) Concatenation and why R-composition is unsound
Claim 4 (Concatenation at Ext-level)
Statement. For any strings P,Q and B=P·Q, (o1,o2,o3′,o4′)∈Ext_B iff ∃x3,x4,x1′,x2′ s.t. (o1,o2,x3,x4)∈Ext_P, (x1′,x2′,o3′,o4′)∈Ext_Q, and E(x4,x1′).
Why useful here. All verifiers must use this to combine contexts; it is the sound way to merge summaries.
How it can fail. Omitting the seam edge E(x4,x1′) admits spurious quadruples.
Quick test. E complete ⇒ Ext_B is exactly the relational composition of Ext_P and Ext_Q over the shared inner pairs; the formula collapses to intuitive behavior; verified by brute force for tiny β.

Claim 5 (R-composition unsound; counterexample)
Statement. Let Σ_out={a,b,c}, A_0=A_1=Σ_out, E={a→b, b→c}. With P=Q=“00”:
- R_P contains (a,b); R_Q contains (b,c).
- Existentially composing R’s yields (a,c).
- But (a,c)∉R_{P·Q} because no 4-node coloring has both y1=a and y4=c.
Why useful here. It pinpoints the bug in the earlier verifier; we must build Ext_{P·Q} then (if desired) project to R.
How it can fail. If one believes ∃m composition is okay, this example breaks it; thus we must adhere to Ext-level concatenation.
Quick test. Manually enumerated above.

3) Deterministic enumeration of all reachable types (explicit algorithm)
Representation. A type is a pair (b_in, Ext) where b_in=(i1,i2,i3,i4)∈{0,1}^4 are the boundary inputs (first two and last two bits) and Ext⊆Σ_out^4 is the boundary-extendibility table. Two strings with identical pairs are the same type.

Claim 6 (Enumeration by closure under append)
Statement. We can deterministically enumerate the set T of all reachable types and the successor function δ: T×{0,1}→T in time 2^{poly(N)} where N=poly(β) is the encoding size.
Construction.
- Seed S with all strings of length k∈{1,2,3} (at most 2^3=8 strings) and also k=4 (2^4=16 strings) to avoid short-length corner cases. For each seed string s compute its (b_in(s), Ext_s) by brute force over Σ_out^k; insert into a dictionary keyed by (b_in, Ext).
- While queue nonempty: pop type τ=(b_in,Ext) with an associated length k (store k≥1 as metadata to apply base rules when k<3). For each a∈{0,1}:
  • Compute Ext′ from Ext and a using: base-case update if k<3; Claim 1 if k≥3.
  • Update the boundary inputs b_in′ by shifting right: new right pair is (old last input bit, a); left pair unchanged.
  • Let k′=k+1. If (b_in′,Ext′) unseen, insert new type with metadata k′ and enqueue.
- For δ, record the mapping from τ to τ′ for each a as transitions.
Complexity. |T|≤16·2^{β^4}; each append costs O(β^5) time to fill Ext′ (β^4 entries × ∃z over β). Total ≤ |T|·2·O(β^5)=2^{poly(N)} time/space.
Why useful here. This provides the finite state space and transitions we need for the verifiers without ranging over long strings.
How it can fail. If we forget to carry k for base cases, the first few transitions are wrong; also, b_in must be updated correctly or concatenation contexts may be mismatched later.
Quick test. With E complete and A_0=A_1=Σ_out, the construction stabilizes at the 16 possibilities of b_in with Ext≡Σ_out^4; δ maps each b_in to updating only the right two bits. BFS closes quickly as expected.

Claim 7 (Reversal operator on types)
Statement. Given τ=(b_in=(i1,i2,i3,i4), Ext), define Rev(τ)=(b_in^R=(i4,i3,i2,i1), Ext^R) where Ext^R={ (y1,y2,y3,y4): (y4,y3,y2,y1)∈Ext }.
Why useful here. Stage-1 feasibility allows labeling either S or its reverse; we need Rev to swap contexts cleanly.
How it can fail. Neglecting that the two-node boundary reverses as (R1,R2,L2,L1) at output level causes miswired checks.
Quick test. For symmetric E (undirected) and symmetric A, Ext=Ext^R for all τ; verify Rev(Rev(τ))=τ.

4) NEXPTIME verifiers (repaired): Ω(n) vs o(n)
We use types only through their Ext tables and boundary inputs; concatenations are performed with Claim 4.

Witness to guess. A table f: T×{0,1}^2×T → Σ_out^2, mapping (t_L, s_in, t_R) to the output pair on a 2-node separator S with input bits s_in (ordered left-to-right). Constraint: for all entries, f respects per-node membership (A) and E on the edge inside S.

Verification (for all quadruples t_a,t_b,t_c,t_d and s1,s2∈{0,1}^2):
1) Build Ext_B = Concat(Ext_{t_b}, Ext_{t_c}) via Claim 4. Also consider the four orientation choices for S1,S2 (original or reversed contexts). Let α_L be the right output on S1 (second component of f(t_a,s1,t_b) or of f^R depending on the chosen orientation), and α_R be the left output on S2 (first component accordingly).
2) Check ∃(o1,o2,o3,o4)∈Ext_B such that E(α_L,o1) and E(o4,α_R). Per-node A-constraints for S1,S2 are enforced directly on f when the witness is guessed.
If all checks pass, accept o(n) (hence Θ(log* n)); otherwise, conclude Ω(n).

Why useful here. This is exactly the feasible-function condition specialized to r=1 but implemented at the Ext-level. It avoids the unsound R-composition.
How it can fail. Two pitfalls:
- Forgetting orientation: must try both labeling S and labeling SR in the four combinations.
- Using only R-projections instead of Ext_B can admit spurious pairs (Claim 5 counterexample).
Quick test. (i) Trivial LCL: E complete, A unrestricted. Any f passes; we classify o(n). (ii) Secret-equality LCL (E equality only): any f that assigns same output on S works; checks pass ⇒ O(1) (indeed correct). (iii) Proper 2-coloring (E forbids equal): O(1) fails; this witness f exists but Stage-2 test will reject, leaving Θ(log* n), as expected on cycles.

5) NEXPTIME verifiers (repaired): O(1) vs Ω(log* n)
Witness to guess. For each t∈T, two 2-tuples: pref2(t)=(L1,L2), suff2(t)=(R2,R1) in Σ_out^2. Intuition: fixed boundary outputs for first two and last two positions of the block that (a) can be extended internally; (b) tile across repeated copies; (c) bridge via any feasible separator type.

Verification:
(a) Per-type tiling feasibility:
- Membership: L1∈A_{i1}, L2∈A_{i2}, R2∈A_{i3}, R1∈A_{i4}, where (i1,i2,i3,i4)=b_in(t).
- Edge checks: E(L1,L2), E(R2,R1), and wrap-around E(R1,L1) (so repeats of t can be tiled).
- Extendibility: (L1,L2,R2,R1)∈Ext_t.
(b) Bridging across any middle type t_S (including the empty middle):
- Compute Ext_bridge = Ext_{t_S} (empty S handled by directly checking E-edges).
- Let α_L:=suff2(t_left)[2] (the last output of the left block), α_R:=pref2(t_right)[1] (the first output of the right block).
- Require ∃(o1,o2,o3,o4)∈Ext_bridge with E(α_L,o1) and E(o4,α_R).
If all pass, accept O(1); else classify Ω(log* n).

Why useful here. Mirrors Section 4.4–4.5: constant-time solvability hinges on the ability to precommit to boundary interfaces that tile and bridge. All existential interior assignments are captured by Ext.
How it can fail. The chosen interface may be too restrictive; the check is universal over t_S, so witnesses must be carefully guessed. Another pitfall: forgetting E(R1,L1) (wrap-around) leads to falsely accepting non-tilable patterns.
Quick test. (i) E equality only, A unrestricted: choose c∈Σ_out and set all entries of pref2,suff2 to c. All checks pass ⇒ O(1). (ii) Proper 2-coloring: impossible to satisfy E(R1,L1) and E(L1,L2) with a period-1 interface consistently; checks fail ⇒ Ω(log* n), matching known results.

6) Complexity summary (conservative)
- Precompute T and δ: at most |T|≤16·2^{β^4} types; each append in O(β^5); total 2^{poly(N)} time/space.
- Concatenation: naive O(β^8) per pair. Precomputing Ext_{b⊙c} for all pairs (b,c)∈T^2 takes |T|^2·O(β^8)=2^{poly(N)} time.
- Stage-1 verification: iterate over |T|^4·4 orientation choices with O(1) lookups on precomputed Ext_{b⊙c}; total 2^{poly(N)}.
- Stage-2 verification: checks over |T| + |T|^2·(|T|+1) cases; each uses a constant number of Ext lookups; total 2^{poly(N)}.
Thus: a nondeterministic exponential-time (NEXPTIME) trichotomy decision.

7) Additional small examples and checks
- Mixed A_0,A_1. Let A_0={a}, A_1={b}, E={(a,b),(b,b)}. Intuitively, the rightmost outputs are forced by the input pattern; long-range coordination can’t help. Stage-1 likely rejects any f (seam constraints fail for adversarial separators), yielding Ω(n). Quick brute-force on tiny β confirms Ext shrinkage near seams.
- Reversal sanity. For any τ, Ext_{Rev(τ)} matches reversed Ext; concatenation with Rev(τ) is consistent: Concat(Ext_P,Ext_Q)^R = Concat(Ext_{Q}^R,Ext_{P}^R). Verified algebraically using Claim 4.

What remains open for polish
- A clean, fully self-contained proof that the boundary-interface witness (pref2,suff2) per type matches exactly the feasible-function definition in Section 4.4; I sketched the equivalence but will transcribe a full reduction argument.
- Micro-optimizations for concatenation (e.g., iterating seam colors first) are not needed for complexity, but I will outline a faster O(β^6) routine to keep constants reasonable.

