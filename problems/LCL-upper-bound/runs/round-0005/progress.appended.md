## Round 0005 — 2025-08-27T15:07:17.291300Z

Status check and gaps in output.md
- Present: rigorous r=1 primitives: Ext-tables, k_flag, append-one-bit DP (including k=1→2, 2→3, 3→4), congruence under append, Ext-level concatenation (for k_flag≥4), an O(β^6) concatenation routine, a counterexample to R-composition, δ well-defined and BFS enumeration, Type-count bound |T| ≤ 4·2^{β^4}, and a reversal operator.
- Missing: (A) A pumping bound ℓ_pump and the associated type-level pumping lemmas (they are implicitly used but not stated). (B) Stage-1 trichotomy step: a precise type-level feasible-function theorem (o(n) iff a feasible f exists) specialized to oriented paths using only Ext. (C) Stage-2 trichotomy step: a constant-round construction from per-type boundary interfaces Q_τ with complete, oriented-path-specific partition argument. (D) Associativity of Ext-level concatenation (useful for sanity checks and caching). (E) Clarification that Stage-1/2 quantification ranges over long types T_long := {τ : k_flag(τ)=≥4}, which matches the pumping-based constructions.

Additions proposed (statements, why useful, proof sketches)

1) Type-level pumping (define ℓ_pump and two pumping lemmas)
- Definition. Let T be the set of reachable types computed by Proposition 9, and δ: T×{0,1}→T the append successor. Define ℓ_pump := |T|. Let run(s) be the δ-trajectory when reading s left-to-right from an initial length-1 seed type.
- Lemma P1 (prefix pumping). For any input string w with |w| ≥ ℓ_pump, there exist a decomposition w = x y z with 1 ≤ |y| ≤ ℓ_pump and |x y| ≤ ℓ_pump such that for all i ≥ 0, Type(x y^i z) is constant (independent of i). Why useful: Enables length normalization of contexts to [ℓ_pump, ℓ_pump+1] and underpins the o(n)⇒feasible f construction.
  Proof sketch. Along the first ℓ_pump states of the δ-run there is a repetition by pigeonhole, say after positions i<j≤ℓ_pump with the same type. Let y := w[i+1..j], and x,z be the corresponding prefix/suffix. Since δ is a DFA on Types (Proposition 9) and congruence holds (Proposition 3), repeating y preserves the final Type.
- Lemma P2 (periodic pumping). For any nonempty u there exist a,b with a+b ≤ ℓ_pump such that Type(u^{a+bi}) is invariant for all i≥0. Why useful: Allows injecting arbitrarily long repeated contexts of the same Type (used to space out separators in the two-stage constructions). Proof sketch. Run δ on u,u^2,…; within ℓ_pump+1 steps two Types repeat, say after exponents a and a+b; then δ-closure yields Type(u^{a+bi}) fixed.

2) Ext-level concatenation for all k_flags
- Lemma C (general concatenation). For any P,Q (no restriction on k_flag) and B=P·Q, for all (o1,o2,o3′,o4′),
  (o1,o2,o3′,o4′)∈Ext_B iff ∃ x3,x4,x1′,x2′: (o1,o2,x3,x4)∈Ext_P, (x1′,x2′,o3′,o4′)∈Ext_Q, and E(x4,x1′).
  Why useful: Allows concatenation in verifiers even if a few short types appear (e.g., when S is short), and simplifies uniform API. Proof sketch. Identical to Lemma 2; coordinate equalities when k_flag<4 are harmless because the boundary map B_k is definitional.
- Lemma A (associativity). For any P,Q,R, Ext_{(P·Q)·R} = Ext_{P·(Q·R)}. Why useful: sanity check and enables memoization policies independent of parenthesization. Proof sketch. Expand both sides with Lemma C: both characterize the set of boundary quadruples admitting witnesses (x3,x4,x1′,x2′) at the first seam and (y3,y4,y1′,y2′) at the second seam with E-seam constraints; the conjunctions are equivalent by rebracketing witnesses.

3) Stage-1 (Ω(n) vs o(n)) — feasible f theorem at the type level
- Definition (domain restriction to long types). Let T_long := {τ∈T : k_flag(τ)=≥4}. Define f: T_long × {0,1}^2 × T_long → Σ_out^2. For each (τ_L,s,τ_R), f(·)=(α1,α2) must satisfy αi∈A_{s[i]} and E(α1,α2).
- Verification condition (Ext-based). For all τ_b,τ_c∈T_long and s1,s2∈{0,1}^2 and all τ_a,τ_d∈T_long (these only affect α_L,α_R), let α_L := second output of f(τ_a,s1,τ_b) and α_R := first output of f(τ_c,s2,τ_d). Require ∃(o1,o2,o3,o4)∈Ext_{τ_b ⊙ τ_c} with E(α_L,o1) and E(o4,α_R). Here ⊙ is Ext-concatenation on long types.
- Theorem S1 (equivalence). An r=1, β-normalized LCL on globally oriented paths has deterministic complexity o(n) iff a feasible f as above exists. Why useful: This cleanly separates Ω(n) from o(n) and is implementable in NEXPTIME using only T_long and Ext.
  Proof sketch (⇒). Given an o(n)-round algorithm A, fix n large and choose s≫T(n) so that A’s runtime on n-node instances is <0.1s. For any w∈{0,1}^{1..ℓ_pump}, choose w^+ with Type(w^+)=Type(w) and |w^+|∈[s,s+ℓ_pump] (Lemma P1). For any tuple (τ_L,s,τ_R) with long τ_L,τ_R, pick representatives w_L^+,w_R^+ realizing τ_L,τ_R and define f(τ_L,s,τ_R) as A’s output on the 2-node window S when run on the pumped path w_L^+ · S · w_R^+ with arbitrary distinct IDs consistent inside the 0.1s halos. To verify feasibility, consider any adjacent separators (S1 next to τ_b) and (S2 next to τ_c). Build a cycle G′ by concatenating w_a^+, S1, w_b^+, w_c^+, S2, w_d^+, and run A; legality implies the existence of a labeling of the middle w_b^+·w_c^+ consistent with α_L,α_R. By Lemma 11 and Lemma C, the boundary witness lives in Ext_{τ_b⊙τ_c}, yielding the required (o1,o2,o3,o4). (⇐). Given f, place separators in O(log* n) rounds with spacing K≳ℓ_pump using a standard MIS on the directed path. Label each separator’s 2 nodes by f(·), producing boundary colors α_L,α_R on either side of each middle block. For a middle block with long type τ_b⊙τ_c, the Ext-witness in Ext_{τ_b⊙τ_c} provides a legal completion consistent with the seams. This yields an O(log* n) algorithm. The construction does not need reversals on globally oriented paths.
- NEXPTIME verification. Deterministically compute T_long and Ext_{τ⊙σ} for all τ,σ∈T_long (Proposition 5). Nondeterministically guess f; verify all constraints by membership tests in Ext_{τ⊙σ} and E. The number of checks is |T_long|^4·4; total time 2^{poly(β)}.

4) Stage-2 (O(1) vs Ω(log* n)) — per-type boundary interfaces and constant-round construction
- Witness. For each τ∈T_long, guess Q_τ=(L1_τ,L2_τ,R2_τ,R1_τ)∈Ext_τ.
- Checks.
  (a) Tiling per τ: E(L1_τ,L2_τ), E(R2_τ,R1_τ), and wrap E(R1_τ,L1_τ) (so copies of τ can be tiled). Already implied by Ext_τ computed from legal colorings, but we keep the explicit checks.
  (b) Universal bridging: For all τ_left,τ_S,τ_right with τ_left,τ_right∈T_long and τ_S arbitrary (short or long), require ∃(o1,o2,o3,o4)∈Ext_{τ_S} with E(R1_{τ_left},o1) and E(o4,L1_{τ_right}). For τ_S empty, this reduces to E(R1_{τ_left},L1_{τ_right}). Use Lemma C to allow short τ_S.
- Theorem S2 (construction). If such {Q_τ} exist, there is an O(1)-round deterministic algorithm on globally oriented paths. Why useful: Cleanly separates O(1) from Θ(log* n) and yields a verifiable certificate of constant-time solvability.
  Proof sketch. In O(1) rounds, compute a partition into “long periodic” and “short/irregular” subpaths with parameters (ℓ_width,ℓ_count,ℓ_pattern) := (ℓ_pump,2ℓ_pump+2,ℓ_pump); for oriented paths, a specialization of Lemma 22 suffices (orientation is given). On each long periodic block P with primitive pattern of length ≤ℓ_pump and length ≥ℓ_count, its type τ is long; tile P by repeats of τ using E(R1_τ,L1_τ); interior legality follows from Q_τ∈Ext_τ. Each short/irregular separator S (any k_flag) is filled using the existential witness from Ext_{τ_S} to attach to the adjacent long blocks’ boundary colors, by (b). Endpoints require no special handling on oriented paths. Runtime is O(1) as all decisions take radius O(ℓ_pump).
- NEXPTIME verification. Guess {Q_τ} over T_long. Compute Ext tables once. Verify (a) per τ and (b) for all triples (τ_left,τ_S,τ_right), using Ext_{τ_S} and E. Number of checks is |T_long| + |T_long|^2·|T| = 2^{poly(β)}; each check is polynomial in β.

5) Implementation-level refinements for verifiers
- Restricting to long types. Both Stage-1 and Stage-2 certificates and universal checks can safely limit τ ranging over T_long on the left/right contexts. Middle τ_S in Stage-2 may be any type; Lemma C covers short τ_S.
- Precomputation plan. Compute T (BFS), split T_long and T_short. Precompute Left_τ and Right_τ for τ∈T (for Stage-2 we need short τ too). Materialize Ext_{τ⊙σ} for τ,σ∈T_long using Proposition 5. Cache membership queries for Ext_{τ_S} via hash/table lookups.

6) Extra sanity: small lemmas and examples
- Lemma M (nonemptiness monotonicity under concatenation). If Ext_P and Ext_Q are nonempty and there exists at least one seam pair (x4,x1′) with E(x4,x1′), then Ext_{P·Q} is nonempty. Why useful: quick diagnostics when pruning infeasible candidates. Proof sketch. Choose any quadruples realizing x4 and x1′; then Lemma C yields a witness.
- Example (proper 2-coloring on oriented paths). Σ_out={a,b}, A_0=A_1={a,b}, E forbids equal neighbors. Stage-1 admits feasible f (log* algorithm exists); Stage-2 fails (cannot have wrap E(R1_τ,L1_τ) for a single τ), so the verifier classifies Θ(log* n).
- Example (constant label). If ∃c with (c,c)∈E and c∈A_0∩A_1, set f constant and Q_τ=(c,c,c,c); both stages accept (O(1)).

Complexity recap (unchanged asymptotically)
- Precomputation: |T| ≤ 4·2^{β^4}. BFS and Ext tables in 2^{poly(β)} time/space.
- Stage-1: guess f over T_long×{0,1}^2×T_long; verify O(|T_long|^4) constraints using Ext_{·⊙·} in O(1) each → 2^{poly(β)}.
- Stage-2: guess Q_τ over T_long; verify per-type tiling and |T_long|^2·|T| bridging constraints → 2^{poly(β)}.

Obstacles and pitfalls addressed
- Short types in concatenation: handled by Lemma C; Stage-1 still quantifies only over long contexts (as in the pumping-based definition).
- Seam indexing: clarified that seams meet o1 on the left and o4 on the right under the (L1,L2,R2,R1) convention.
- MIS/orientation: On globally oriented paths, no reversal and the standard O(log* n) MIS suffices for Stage-1’s construction; Stage-2 uses a constant-radius partition specialized to oriented paths (orientation is already globally consistent).

Next concrete steps
- Integrate Lemmas P1, P2, C, A, M and the theorems S1, S2 into output.md with concise proofs (as above). Explicitly define ℓ_pump := |T| and note it is computable in 2^{poly(β)}.
- Amend Stage-1/2 verifier specs in outputs to quantify over T_long for the left/right contexts and to use Ext_{τ_S} for arbitrary τ_S in Stage-2 bridging.
- Provide a short appendix with the MIS-based O(log* n) separator placement and the constant-radius partition for oriented paths (parameters and radii explicitly spelled out).
- Add a tiny regression suite (β∈{2,3}) to test: (i) pumping decomposition found via δ; (ii) associativity of Ext-concatenation on random instances; (iii) Stage-1 acceptance on trivial/all-allowed LCL; (iv) Stage-2 rejection on proper 2-coloring.

