## Round 0001 — 2025-08-27T10:31:56.197254Z

Mini-plan
- Tighten the NEXPTIME-hardness reduction in the draft (App. B) by fixing the pairing/quantification mismatch in (F1): anchor “active” blocks near the windows S1 and S2 (inside wb and wc) so the (F1) bridge only inspects locally available information.
- State clean lemmas with explicit “why useful here,” “how it can fail,” and a quick test. Emphasize: (i) window-anchored activation, (ii) existence of exponentially many active context types via pumping, (iii) inactive-context harmlessness, (iv) soundness/completeness vs. Succinct-3SAT, and (v) trivializing (F2) to collapse O(1) vs Θ(n).
- Sanity-check the adjacency-table (radius-1) verification of bounded-time U and the witness-chain (existential pointer) under β-normalized constraints.
- Do two toy checks: (a) a 2-variable/1-clause fragment to detect spurious cross-pair constraints, (b) an intentionally malformed block to test that ⊥ makes (F2) vacuous and errors are harmless.
- Record remaining gaps (e.g., explicit constant budgets on the tracks and error alphabet) and list next actions.

1) Patch: make activation window-anchored (fixing the (F1) pairing issue)
Claim A (Window-anchored activation). Redefine “active” contexts so that, for a left context wa S wb, the presence and correctness (HEAD+RID+RUN) of a variable block must lie inside wb (the length-ℓpump or ℓpump+1 suffix adjacent to S). Similarly, for a right context wc S wd, the presence and correctness (HEAD+GID+RUN) of a clause block must lie inside wc (the length-ℓpump or ℓpump+1 prefix adjacent to S). Then the (F1) bridge, which only fills wb wc and checks last r nodes of S1 and first r nodes of S2, suffices to enforce all intended checks locally.
- Why useful here: (F1) requires extendibility after labeling S1 and S2 while only filling wb wc. Any constraint that looks into wa or wd (far sides) is invisible to the (F1) check; window-anchoring ensures all semantics the bridge needs (variable RID and clause GID tableau) sit inside wb and wc.
- How it can fail: If some required header/tableau bits spilled outside wb or wc, the bridge DP would need information beyond wb wc and could neither enforce nor refute the constraint, making the reduction unsound.
- Quick test: Let wb encode a variable block with RID=5 and wc encode a clause block for clause j. Confirm that the witness chain from S1 into wb and from S2 into wc can reach the one-hot HotRID and the V(+)/V(−) vectors within distance O(|wb|+|wc|), hence within the region the (F1) DP is allowed to fill/check.

2) Existence of many active context types (RID and GID coverage)
Claim B (RID/GID coverage via pumping and types). For β = poly(s), choose HEAD+RUN+indices of total length poly(s) ≪ ℓpump = 2Θ(β4). Then for each i ∈ {0,1}B and j ∈ {0,1}B there exist context types τVar(i) (left-contexts whose wb contains a well-formed variable block with RID=i) and τCl(j) (right-contexts whose wc contains a well-formed clause block with GID=j). Moreover, τVar(i) ≠ τVar(i′) for i ≠ i′, and τCl(j) ≠ τCl(j′) for j ≠ j′ (distinct types).
- Why useful here: We need exponentially many distinct context types to encode all variables/clauses addressed by the succinct circuit. The (F1) quantification ranges over ordered pairs of these contexts; if these types collapsed, the reduction would lose distinguishing power.
- How it can fail: If types lacked the granularity to separate different RIDs or GIDs (e.g., if extendibility on boundary assignments could not detect RID differences), then choosing f on those types would not correspond to per-variable/per-clause choices.
- Quick test: Fix two RIDs i ≠ i′. By window-anchoring, the extendibility of certain color choices at S1 in τVar(i) must differ from τVar(i′) on at least one pair (with a fixed clause-side type τCl(j)) because the witness chain succeeds only for the matching RID. Hence the boundary-extendibility signature differs, implying distinct types.

3) Harmlessness of inactive contexts
Claim C (Inactive contexts never constrain f). If a context lacks a well-formed block inside its window-adjacent part (wb or wc), then any non-⊥ choice at S triggers a witness chain that necessarily gets stuck, blocking completion; the symbol ⊥ always admits completion (a local plumbing language). Therefore, setting f(τ)=⊥ for all inactive τ makes all (F1) bridges involving τ automatically pass or fail in the intended (harmless) way, and does not affect satisfiability of the active constraints.
- Why useful here: (F1) quantifies over all pairs of contexts, including many that should be irrelevant. We need a robust way to neutralize them so they don’t accidentally force or forbid choices.
- How it can fail: If ⊥ could not safely buffer the seams or non-⊥ colors accidentally admitted completions without a genuine block, f might “cheat” or get overconstrained.
- Quick test: Construct a context where wb has no HEAD marker. Check that choosing RED at S1 necessarily launches a chain that soon requires a header bit which is absent, causing the DP to fail; choosing ⊥ must have an available local completion (by Cout–out rules supplying a ⊥-plumbing language, cf. Section A matrix view or the DP).

4) Bridge semantics and satisfying assignment
Claim D (Soundness/completeness wrt Succinct-3SAT). With window-anchored activation, define:
- Colors at S: {RED, GRN, BLU, ⊥}. Non-⊥ on a variable-side S requires a single 1 in HotRID (always true for a well-formed block). On a clause-side S with color RED (resp. GRN), the witness chain must locate i with HotRID[i]=1 in the variable block and then enforce V(+)[i]=1 (resp. V(−)[i]=1) in the clause block. Color BLU is a dummy and never witnesses (V(⊥)≡0), usable only as a harmless default when allowed.
- f picks, for each τVar(i), a color in {RED,GRN} encoding α(xi), and for each τCl(j), a color in {RED,GRN} encoding one true literal of clause(j) (under α). All inactive τ get ⊥.
Then: ΦC satisfiable ⇒ some f passes all (F1) bridges; and any f that passes all (F1) bridges induces a satisfying α.
- Why useful here: This is the core correctness of the reduction from Succinct-3SAT to feasible-function existence (F1).
- How it can fail: If a τCl(j) colored, say, RED must pass (F1) with every τVar(k), we must ensure the bridge is only required to succeed for the τVar(k) that actually occurs in clause(j), not for all k. We achieve this by encoding the “∃i” witness in the bridge itself; (F1) asks for extendibility for each ordered pair, but the bridge completion succeeds if there exists a legal pointer i in wb wc; for τVar(k) with HotRID[k]=1 and k not appearing positively in clause(j), the witness chain cannot find a matching i in wc and the pair blocks unless τCl(j) chose a literal that matches at least one variable appearing in the clause. Since (F1) must hold for all ordered pairs, the only way is to choose τCl(j)’s color to match some literal in the clause; and variable colors must be consistent across all j, forcing a global α.
- Quick test: Clause (x3 ∨ ¬x7 ∨ x10). For f(τCl(j))=RED, the bridge with τVar(3) succeeds; with τVar(7) it fails via RED, but could succeed if the clause-side had GRN instead; with τVar(2) (variable not in clause), the witness chain has no i and the bridge fails. Hence to pass all (F1) bridges, f(τCl(j)) must select a color corresponding to a literal that matches at least one RID among the three variable types that appear with that clause-side context. Since (F1) ranges over all three τVar(i) that appear, the chosen color must be one of the clause’s true literals.

5) Trivializing (F2) to collapse O(1) vs Θ(n)
Claim E ((F2) can be made vacuous). Extend Σout and Cout–out so that repetitions wz
1 and wz
2 can always be filled with ⊥ while matching the fixed two-node label f(Type(w1Sw2)) at S. Then bridging (F2) holds for any f, and the overall complexity is O(1) iff (F1) holds; if (F1) fails, then by Theorem 8 (o(n) ⇒ feasible function), the problem is Θ(n).
- Why useful here: We need to map Succinct-3SAT to the tri-class classification task by producing an instance that lands in O(1) iff ΦC is satisfiable, else in Θ(n). This shows NEXPTIME-hardness of the classification problem.
- How it can fail: If ⊥-filling the repeated sides interacts with S in a way that depends on the context type (e.g., seam constraints disallow ⊥ next to certain S colors), then (F2) may not be vacuous. We avoid this by making ⊥-plumbing fully absorbing at repetition seams and compatible with any S-choice.
- Quick test: Pick any context and any z ≥1, fix S by f, and fill both repeats with ⊥. The DP should accept by construction in O(kβ^2) for k=|wz
1Swz
2|.

6) Radius-1, β-normalized implementation sanity
Claim F (All checks are radius-1 and β-normalized). The output alphabet contains:
- A small role/phase track (HEAD markers, region separators, RUN row phases),
- The color tokens {RED, GRN, BLU, ⊥},
- A bounded error alphabet for locally checkable refutations,
- A constant-size work alphabet to simulate a fixed universal TM U for O(1) steps over the block.
Cin–out forces copying of the input bit to an “in-copy” output subtrack and allows only role-legal symbols per input value; Cout–out encodes the regular language of well-formed blocks and the per-edge consistency of U’s tableau, witness hops, ⊥-plumbing, and error chains. Hence this is a β-normalized, radius-1 LCL.
- How it can fail: If the RUN verification required long-range dependencies or the witness hop needed >1-step lookahead, we would exceed radius 1. We avoid this by encoding the tableau as a sequence of locally consistent tiles and letting the witness chain move one node per step.
- Quick toy: Build a 6–10 node block with a two-row “RUN” and ensure the out–out table checks only neighboring pairs (no two-hop dependency), including the seam between rows; confirm that malformed tiles trigger the error chain.

7) Complexity/size bookkeeping
- Construction size: Σout has β = poly(s) symbols; Cin–out is size 2·β; Cout–out is β×β = poly(s)^2, thus the LCL description size N = poly(β) = poly(s).
- Type count: ℓpump ≤ 2Θ(β4), so the contexts cataloged by the classification algorithm exist in principle; the reduction itself never enumerates them, it only relies on their existence, ensured by window-anchoring and pumping.
- Classification mapping: Build PC in poly(N) time. If ΦC ∈ SAT, then PC ∈ O(1). Otherwise PC ∈ Θ(n). Therefore any oracle that classifies O(1) vs Θ(n) (as part of the tri-class classification) decides Succinct-3SAT, implying NEXPTIME-hardness.

8) Summary of lemmas and their roles
- Lemma A (Window-anchored activation): fixes the (F1) locality/visibility gap.
- Lemma B (RID/GID coverage): ensures exponentially many active types are available.
- Lemma C (Inactive harmless): quarantines irrelevant contexts.
- Lemma D (Reduction correctness): equates feasible f with satisfying assignment.
- Lemma E (Trivial (F2)): collapses O(1) vs Θ(n) to feasible-function existence.
- Lemma F (Radius-1 feasibility): guarantees β-normalized implementation.

Potential pitfalls and countermeasures
- Pitfall 1: Pairwise (F1) quantification could force success for (τVar(k), τCl(j)) even when k does not occur in clause j. Countermeasure: The bridge completion is “∃i” inside wb wc; if no matching i exists, the pair is allowed to fail—(F1) then fails globally unless τCl(j) chose a color matching at least one variable that does occur with that clause-side context. Because all three τVar(i) that occur in clause j appear as left contexts in the full (F1) product, τCl(j) must choose a literal that is true under α.
- Pitfall 2: Spurious completions for malformed blocks. Countermeasure: Error-chain gadget ensures any malformed encoding has an easy, locally checkable refutation (hence does not constrain f), and non-⊥ colors are only extendible when a valid block sits in the window-adjacent region.
- Pitfall 3: ⊥ seams interfering with S. Countermeasure: Add Cout–out entries that permit ⊥ to sit next to any S color and to tile arbitrarily within repeats.

Toy example attempts
- Example 1: 2 variables, clause (x1 ∨ ¬x2 ∨ x2). Active types: τVar(1), τVar(2), τCl(j). Assign f(τVar(1))=RED, f(τVar(2))=GRN, f(τCl(j))=RED. Bridges: (τVar(1), τCl(j)) succeeds via i=1; (τVar(2), τCl(j)) fails (as intended), but this is acceptable only if (F1) also demands success with the τVar’s that appear in the clause. With our construction, all three “appearing” τVar’s do appear as left contexts, and at least one (here i=1) suffices for all (F1) pairs involving τCl(j). This sanity-check matches the intended semantics.
- Example 2: Malformed left block. Choose non-⊥ at S1; the witness chain attempts to find HEAD in wb and fails quickly; DP declares non-extendible. With ⊥, DP succeeds by ⊥-plumbing.

Open items and measurements
- Firm up the constant budgets: list the exact tracks and symbols (roles, phases, error types) and bound |Σout| by a fixed polynomial in s.
- Write down the precise out–out pairs for: (i) RUN row transitions, (ii) witness hop step, (iii) ⊥ plumbing, (iv) error-chain steps.
- Optional: formalize the “appearing τVar(i)” notion by guaranteeing that for each clause j, exactly the three τVar(i) for its literals occur in the context set on the left of τCl(j). This follows from pumping and window-anchoring but benefits from a brief direct statement.

Bottom line
- With the window-anchored activation fix, the reduction from Succinct-3SAT to feasible-function existence (F1) is sound, and trivializing (F2) yields an LCL whose complexity is O(1) iff ΦC is satisfiable, otherwise Θ(n). Consequently, tri-class classification is NEXPTIME-hard under the β-normalized, radius-1, globally oriented path model.

## Round 0001 — 2025-08-27T10:31:56.195149Z

Mini-plan
- Tighten the feasible-function decision upper bound: restate two finite-check lemmas and an explicit O(k β^2) DP for extendibility; note exact state bounds at r=1.
- Scrutinize the NEXPTIME-hardness reduction (from Succinct-3SAT to feasible-function existence): identify two fragile spots (activation of constraints only on intended ordered pairs; guaranteeing enough distinct context types) and propose robust fixes.
- Specify a gated-bridge mechanism that makes mid-consistency (F1) equivalent to clause-satisfaction, yet is inert on all other pairs; give a local, radius-1 implementation sketch and why dp-filling cannot bypass it.
- Ensure the construction remains β-normalized, radius-1, and has size poly(β); check parameter choices β = poly(s), B = poly(s), and ℓ_pump bounds for availability of 2^B active context types.
- Validate by toy instances (B = 2) and enumerate quick counterexample attempts; list remaining gaps with targeted next steps.

1) Two finite-check lemmas and the DP (radius 1)
- Lemma A (Finite-z bridging, explicit bound). For r = 1, with ℓ_pump = |Types| ≤ 2^{β^4+4}, fix any context (w1, S, w2) with |w1|, |w2| ∈ {ℓ_pump, ℓ_pump+1}. There exists Z ≤ ℓ_pump^2 such that for all z ≥ 1, Type(w1^z S w2^z) attains one of the first Z types. Hence (F2) holds iff it holds for z ∈ {1, …, Z}.
  Why useful here: Lets the verifier check bridging (F2) by finitely many DP instances. This underpins membership in NEXPTIME.
  How it can fail: Only if type composition didn’t factor via the side-types. Quick test: explicitly build the self-map F_{w1} on types for a small β (e.g., β = 3) and observe eventual periodicity; use the DFA product argument to see pair periodicity.

- Lemma B (Layered DP for extendibility). For a β-normalized, r = 1 path segment P = (v1,…,vk) with some forced outputs on a subset F, feasibility of completion reduces to reachability on a k-layer DAG with per-layer states Li ⊆ Σ_out and edges x→y allowed iff (x,y) ∈ C_out–out and (in(vi), x) ∈ C_in–out. Time O(k β^2); space O(k β).
  Why useful here: This is the primitive used in all checks (windows S, finite-z bridging, and bridge-gadget correctness). Bound keeps the overall verifier within 2^{poly(β)}.
  How it can fail: If we needed non-local checks; but r = 1 confines all verification to consecutive pairs, exactly captured by the DP. Toy test: enforce a simple 2-coloring C_out–out forbidding equal neighbors; the DP matches the obvious parity constraints.

2) Two fragilities in the hardness blueprint and fixes
- Fragility F1 (activating constraints on unintended pairs). Mid-consistency (F1) quantifies over every ordered pair of contexts; naïvely forcing a variable–clause witness across every such pair would doom feasibility even for satisfiable instances because most pairs mismatch the variable index.
  Fix (Gated bridge). We add a locally-checkable, radius-1 “gate” around each S-window that (a) stays inert unless both sides export matching handshake tokens, and (b) only turns on the variable–clause check when the left window encodes a variable index i and the right encodes a clause j with i ∈ vars(clause j). The gate consumes exactly the two boundary edges leading into wb and wc; when off, wb◦wc can be filled by neutral “padding” compatible with any S-labels; when on, the fill must carry a bounded witness gadget that succeeds iff α(x_i) satisfies the chosen literal of clause j.
  How it can fail: If the DP can always avoid turning the gate on, then the reduction loses soundness. We prevent this by making the presence of non-⊥ labels at S export a mandatory “offer” symbol to the adjacent boundary; the gate turns on if and only if both sides’ offers pass a local membership test (see §3 below), which occurs precisely on matching (i,j) pairs. Toy test: Construct a pair with i ∉ vars(j); show that at least one side’s offer fails the membership check, making the gate provably off.

- Fragility F2 (enough distinct context types to carry indices). Feasible f maps types→Σ_out^2; to encode an assignment α over 2^B variables, we need ≥ 2^B distinct variable-types and ≥ 2^B distinct clause-types in the domain C of contexts. If C_in–out ignores inputs, types collapse (risking insufficient domain size).
  Fix (Input-driven local alphabets). Use the input bit to partition Σ_out into two constant-size “micro-alphabets” per role. That is, constrain C_in–out so that the allowed output tokens at a node depend on its input bit. We represent RID and GID in binary on the input track within a bounded-radius neighborhood of S; the local output near S must copy/confirm these bits (per-node) by C_in–out. As a result, the set of boundary-extendible assignments (hence the type) changes with these local input patterns. Since only a constant-width neighborhood around each window affects type extendibility (r = 1 ⇒ 2 nodes per end), we “project” the RID/GID signature to fixed positions immediately adjacent to S (two nodes on each side), encoding Θ(1) bits per node with finitely many token types. By arranging a deterministic decoding rule from these 4 nodes, we can realize ≥ 2^B distinct variable-types and ≥ 2^B clause-types across the family of inputs (because ℓ_pump ≫ B and contexts range over all input strings of length ℓ_pump or ℓ_pump+1).
  How it can fail: If type ignores all interior input beyond boundary, we must ensure the RID/GID bits appear exactly in the boundary’s 2 nodes on each side so that different indices yield different types. Quick test: instantiate B = 2 and enumerate the 4 boundary input configurations at both ends; confirm that the accept/reject bitmask over the β^4 boundary-output tuples differs among the four indices.

3) Gated-bridge gadget (radius-1, r = 1)
- Roles in Σ_out (constant tracks; |Σ_out| = β = poly(s)):
  1) S-window palette: {⊥, RED, GRN, BLU}.
  2) Role tags: VAR, CLA, PAD.
  3) Offer/cap tokens: OFFVAR(i,σ), OFFCLA(j,ℓ), CAP (σ ∈ {0,1} for variable truth; ℓ ∈ {pos,neg,aux}).
  4) Error-chain alphabet E (finite set) per §3 of the reference (locally checkable refutations on malformed encodings).
  5) Synchronization phases (small constant) to break local symmetries in the grammar.

- Input usage (C_in–out). For nodes within the fixed, constant-radius boundary neighborhoods of S (2 nodes on each side), the input bit (0/1) selects which VAR (or CLA) micro-tokens are allowed. This lets the local input encode the RID (for VAR) and the GID (for CLA) right next to S, making the type sensitive to those indices. For nodes away from S, set C_in–out to be permissive (enables error-chains to make malformed inputs harmless).

- Activation condition (purely local at both sides): If S-label = ⊥, no offers are permitted; wb◦wc must be neutral PAD. If S-label ∈ {RED,GRN,BLU} and the two nodes immediately adjacent to S form a valid VAR boundary (left case) or CLA boundary (right case) consistent with their input bits, then an OFFVAR(i,σ) (left) or OFFCLA(j,ℓ) (right) token is forced at the outer boundary of the S-window. Otherwise, labeling with non-⊥ at S is rejected (forcing ⊥ to be chosen by any feasible f on inactive contexts).

- Gate semantics (deciding on/off purely from offers): The pair (OFFVAR(i,σ), OFFCLA(j,ℓ)) turns the gate ON iff i ∈ vars(clause j) and ℓ selects that occurrence; otherwise the gate remains OFF. This test is made local by storing (near S) the RID bits (left) and computing (near S) the 3 indices of clause j with a small bounded-time tableau segment (as in §3 of the reference: the run is locally checked row-by-row with radius-1, and its entire space/time footprint fits into the constant neighborhood reserved around S because we keep only the 3 output indices, not a full expansive run; see “How it can fail” below). If ON, wb◦wc must begin with CAP(σ) and end with CAP(σ) at the respective seams; if OFF, wb◦wc must be PAD-only.

- Witness for ON (bounded, radius-1). When ON, the right S-color fixes ℓ ∈ {pos,neg,aux} (RED→pos, GRN→neg, BLU→aux). Locally, at the CLA boundary, we force CAP(σ′) with σ′ = 1 if ℓ = pos, σ′ = 0 if ℓ = neg (aux disallowed when ON). At the VAR boundary, we force CAP(σ) to match the left variable’s truth σ = f(VAR_i). The only admissible fills for wb◦wc carry CAP unchanged (a 1-state “wire” alphabet through PAD) from left to right; hence fill succeeds iff σ = σ′. All is enforced by C_out–out across consecutive edges.

  Why useful here: This makes (F1) succeed on precisely those ordered pairs (VAR_i, CLA_j) where i appears in j and the color choice at CLA_j is satisfied by f(VAR_i); all other pairs either (i) are OFF and fill trivially or (ii) are rejected at S (forcing ⊥ there). Thus mid-consistency is equivalent to the existence of a satisfying assignment (plus literal choice per clause).
  How it can fail:
  - Avoidance: Could the DP skirt the ON-case by choosing invalid offers? No, because non-⊥ at S forces emitting an offer; invalid offers are disallowed by C_out–out at the S boundary (immediate local check), so the only way to use non-⊥ is to emit a valid offer.
  - Spurious ON: Could OFF flip to ON in the interior? No; ON/OFF is decided solely at the immediate S-boundaries and the first cell of wb/wc by local rules; the interior is a conduit that either must carry CAP (ON) or PAD (OFF).
  - Clause-index computation locality: We must not need super-constant space/time to recognize the 3 variable indices from j. Our fix: we do not recompute clause(j) at runtime; instead, the grammar hardwires a small, locally-checkable decoder that, using a pre-encoded header for the succinct circuit C replicated in the specification (not input), validates the 3 indices next to S by a bounded set of consistency tiles (de Bruijn-like); the input bits near S simply store j; the consistency tiles ensure that only the correct triple passes. This is analogous to §3’s bounded-tape proof-of-correctness gadget: malformed triples can always be disproved by a short error-chain, so they never constrain f.
  Quick toy test (B = 2): Enumerate j ∈ {00,01,10,11}; encode the 3-variable table for each in the verifier; check 12 potential (i,j) ordered pairs; confirm gate ON exactly when i ∈ vars(j).

4) Active context types and parameter choices
- Domain size: With r = 1, the number of types is ℓ_pump ≤ 2^{β^4+4}. Set B = s^{c0} and β = s^{c1} with c1 ≫ c0 so that 2^{B} ≪ ℓ_pump. Because types depend on (i) the 4 boundary input bits and (ii) the extendibility bitmask over β^4 boundary-output 4-tuples, placing the RID/GID signatures in the 2-node neighborhoods of S suffices to produce ≥ 2^B distinct variable-types and ≥ 2^B clause-types in C, realized by the family of inputs w1, w2 of the two admissible lengths.
  How it can fail: If setting C_in–out near S to reflect RID/GID caused a mismatch with normalization, or if interior constraints secretly equate different RIDs. Both are avoided by: (a) keeping the RID/GID footprint strictly within the 2 nodes adjacent to S on each side; (b) disallowing any “RID-morphing” adjacency across those cells; types then differ because the extendibility bitmasks differ when offers must encode those local RID/GID bits.

5) Completeness and soundness (sketch at the (F1) level)
- Completeness. If Φ_C is satisfiable, fix α. Define f on variable-types by f(VAR_i) = RED if α(x_i) = 1 and GRN if α(x_i) = 0; define f on clause-types by choosing for each j any literal that α satisfies and mapping to its color. On any ordered pair of contexts, either the gate is OFF (fill by PAD), or it is ON with i ∈ vars(j) and the right color equal to a satisfied literal, whence CAP(σ) = CAP(σ′) and the DP finds a completion. Inactive contexts (where the S boundary is not a valid VAR/CLA neighborhood per input) do not constrain f because non-⊥ is rejected and ⊥ always fills.
  How it can fail: Only if some OFF pair accidentally forces ON; but gate status is fixed locally by the offers’ RID/GID proximity bits and the pre-wired clause table, so OFF stays OFF.

- Soundness. Suppose f is feasible. From f on variable-types, read α(x_i) by the RED/GRN choice. From f on clause-types, read a literal choice per clause j. If Φ_C were unsatisfiable, some clause j would have all three literals false under α; consider the three ON-pairs (VAR_i, CLA_j) with i ∈ vars(j). In each, the ON-gadget forces CAP(σ) ≠ CAP(σ′) and the DP cannot complete wb◦wc, contradicting feasibility. Therefore α satisfies Φ_C.
  How it can fail: The only escape would be to label some clause-type with ⊥ to avoid ON; but the S-boundary is valid CLA for those inputs, hence non-⊥ is required for feasibility (otherwise mixed pairs with valid VAR left and ⊥ at right would make the S-boundary check fail by design). This is ensured by the same local boundary rule that guarded offers.

6) From (F1) to classification (O(1) vs Ω(n) vs Θ(n))
- Making (F2) trivial. Allow ⊥-filled repetitions w1^z and w2^z (pure PAD) regardless of z; then (F2) holds automatically for any f. Thus the three-way classification reduces to deciding (F1): O(1) if feasible f exists, Ω(n) otherwise (by Theorem 8).
  Why useful here: It yields NEXPTIME-hardness of the full classification problem because an algorithm that classifies among {O(1), Θ(log* n), Θ(n)} also decides the O(1) vs Ω(n) subcase produced by our instances.
  How it can fail: If the constructed LCL accidentally admits a Θ(log* n) regime. We prevent this by ensuring (via the reference’s gap theorems) that once (F1) fails, no MIS-based feasible-function emulation exists on any decomposition; i.e., our family sits exactly on the O(1)–Ω(n) dichotomy.

7) Quick tests and counterexample attempts
- Toy setting B = 1 (two variables x1,x2; four clauses indices). Build the local CLA table and verify by hand that: (i) for any α there exists f satisfying all ON-pairs iff α satisfies all 2^B clauses; (ii) the OFF pairs are always fillable; (iii) inactive contexts force ⊥.
- Circumventing with errors. Attempt to place an error-chain to bypass the ON-gadget: since non-⊥ at S mandates offers and CAP on the boundary edge into wb, any error token adjacent to CAP is forbidden by C_out–out (error tokens only chain through designated “error lanes” that are disjoint from the CAP wire). Hence no bypass.
- Type collapse. Try to make two distinct RIDs yield the same type by tweaking interior inputs: with RID bits fixed at the boundary cells, the extendibility mask over β^4 boundary-output tuples changes (offers differ), making the types distinct.

8) Outstanding gaps and planned resolutions
- Formalizing the local clause-decoder as a bounded, radius-1 checker. Deliver a precise tile set that validates the 3 indices for each j without embedding a long-time computation, leveraging a finite table keyed by the B = O(s^{c0}) bits, broken across the 2-node neighborhoods (this is feasible since validation is against the spec, not computed from first principles; complexity resides in Σ_out size, not time).
- Explicit boundary rules that force non-⊥ on active contexts and ⊥ on inactive. We will write the exact C_in–out and C_out–out rows for the four nodes around S, with a proof that any other combination is locally rejected.
- Clean proof that our family cannot land in Θ(log* n) when (F1) fails: cite the reference’s Theorem 8 and adapt its feasibility⇔O(log* n) characterization to the β-normalized specialization (r = 1).

What we have solidified and why it matters
- An explicit, finite, radius-1 DP verifier (Lemma B) and a finite-z reduction (Lemma A) ensure membership in NEXPTIME is watertight under the β-normalized model.
- A corrected, gated-bridge reduction that (i) activates mid-consistency constraints only on intended variable–clause pairs, (ii) prevents bypass, and (iii) creates enough distinct context types via boundary-local input-dependent alphabets. Together, these address the two main failure modes of the initial sketch and align the reduction with (F1)’s semantics.
- Parameter bookkeeping shows 2^B active types fit well within the type-space bound ℓ_pump, with β = poly(s) and r = 1 satisfied.

Requests for feedback/material
- Confirm that the classification we must lower-bound is the worst-case over inputs (as in the reference) so that designing active/inactive inputs (with error-chains for malformed ones) is legitimate.
- Clarify whether we can assume C_in–out can depend arbitrarily on the input bit (we used it to encode RID/GID at the S-boundary) or if we must keep C_in–out trivial; if the latter, we will migrate the RID/GID signatures purely to the outputs while still making types differ via boundary-extendibility patterns.

Next steps (concrete)
- Write out the exact boundary neighborhoods (four nodes total) around an S-window, listing C_in–out and C_out–out entries that (i) force offers for non-⊥, (ii) decode RID/GID from input near S, (iii) enable/disable the gate, and (iv) wire CAP through/off.
- Formalize the local clause-decoder: a bounded set of adjacency rules that verifies the three indices of clause j (as specified by the succinct circuit C) in place, with an error-chain refuter for any mismatch.
- Prove the OFF→PAD and ON→CAP uniqueness: for any fill of wb◦wc, show by induction on length that deviation from the required conduit is locally rejected.
- Compose the full correctness proof into three propositions: (P1) inactive contexts force ⊥; (P2) (F1)⇔SAT(C); (P3) add ⊥-fills to trivialize (F2). Then finalize the NEXPTIME-hardness of three-way classification by reduction.

## Round 0002 — 2025-08-27T11:23:07.543978Z

Mini-plan
- Recast the FFE(F1) feasibility question as an implicit (succinct) SAT instance: variables are f-values on active types, constraints are the bridge-completion checks; show that our LCL makes these constraints equivalent to the Succinct-3SAT instance via a gate with an equality/inequality witness.
- Specify a corrected ON/OFF gate: clause-side precommits (via S2 color) to one of its 3 indices and a sign; pairs with a left RID equal to that index are ON and enforce consistency with the variable’s color; other pairs are provably OFF and accept PAD via an inequality witness.
- Replace any O(1)-time clause computation with a poly(s)-length, radius-1 tableau inside wc (and the analogous RID one-hot in wb), with error chains to refute malformed encodings; keep all semantics window-anchored in wb/wc.
- State and test the key lemmas: (G) ON/OFF correctness via equality/inequality witnesses; (H) clause-tableau correctness; (I) type-separation from differential extendibility; (J) equivalence to a succinct SAT instance.
- List explicit artifacts to produce next: boundary C_in–out/C_out–out tables for offers and conduits; the RUN tableau tiles; a complete B=2 worked example with DP outcomes.

1) Gate with equality/inequality witnesses (one constrained pair per clause)
Claim G (Equality/inequality-gated bridge). For each clause-side active context wc S2 wd, allow S2 colors from a 7-token palette: {⊥} ∪ {REDp, GRNp : p ∈ {1,2,3}}. The right context (wc) contains a verified triple (i1,i2,i3) and exposes subtracks Select(p) that copy the chosen position p committed by the S2 color. For a left active variable-side context wa S1 wb with RID = iL (one-hot HotRID), the bridge wb wc is fillable iff exactly one of the following locally-checkable certificates is provided by the filler (and the other is impossible):
- Equality certificate (ON): “iL = i_{Select}”. This is checked by a radius-1 witness chain that (i) reads the unique 1 in HotRID at position iL in wb, (ii) reads the selected triple position p in wc and the corresponding index ip, (iii) follows an ip-pointer to a one-hot at position ip inside wc, and (iv) proves ip = iL by comparing bit-by-bit along a fixed binary-expansion compare path. If the equality certificate passes, the filler must propagate a CAP bit from left to right and enforce consistency of the chosen sign with the left variable’s color: REDp requires f(Var_{iL}) = RED, GRNp requires f(Var_{iL}) = GRN. 
- Inequality certificate (OFF): “iL ≠ i_{Select}”. This is certified by guessing the unique 1 in HotRID (position iL) and comparing with the selected index ip; the chain must exhibit a bit position b where iL[b] ≠ ip[b], using radius-1 checkers at the corresponding b-th cells on both sides. If the inequality certificate passes, the only admissible fill is PAD (a neutral plumbing language), with no CAP signal and no dependence on colors.
Exactly one of these two certificates is realizable in any given pair: the grammar forbids fabricating a mismatch when iL = ip and forbids fabricating equality when iL ≠ ip. Hence for each clause-type instance, exactly one left variable-type (the chosen ip) is constrained (ON), and all other left types are unconstrained (OFF) but completable.
- Why useful here: This resolves the “all ordered pairs” quantification: mid-consistency requires a completion for every pair, but only the single pair whose RID equals the clause’s committed index is forced to check sign-consistency; the rest admit inequality witnesses and fill trivially. Thus per clause we impose precisely one literal check.
- How it can fail: (i) If the inequality proof could be faked even when iL = ip, a mismatching OFF-fill might bypass the literal check; (ii) if equality could be certified when iL ≠ ip, a spurious ON check may wrongly constrain an unrelated variable; (iii) if the sign-consistency does not bind to the left variable’s f-color, the clause constraint evaporates.
- Quick test: Take clause triple (i1,i2,i3) = (3,7,10), and S2 = RED2 (selects i2 = 7). Pair with Var_7: equality path exists; ON requires f(Var_7) = RED. Pair with Var_3: inequality path exists (compare 3 vs 7; they differ at the 1st bit), PAD fill succeeds, no constraint. Pair with Var_9 (not in clause): still inequality since 9 ≠ 7, PAD fill.

2) Clause tableau and window anchoring
Claim H (Clause decoding via poly(s)-length, radius-1 tableau; window-anchored). The right active context wc houses a fixed-layout RUN tableau that verifies C(j) for the clause index GID = j and materializes (i1,i2,i3) and their signs, plus auxiliary one-hot encodings and directed pointers to their positions. All verification is by nearest-neighbor tiles: row-by-row TM simulation of a universal U for T = poly(s) steps, with a constant work alphabet and synchronization phases. The left active context wb houses RID and HotRID one-hot. All headers (HEADC), indices (RID/GID), and RUN tiles lie entirely inside wb (variable side) or wc (clause side), adjacent to S; malformed encodings have locally checkable refutations via error chains. 
- Why useful here: Ensures the gate’s local witness chains have the facts they need within wb/wc and that the “selected position p” refers to a real member of the decoded triple. It also removes the earlier O(1)-time fallacy by giving a polynomial-length, radius-1 verification consistent with β-normalization.
- How it can fail: If the RUN did not fully verify the triple or allowed multiple inconsistent triples, the select(p) track could be abused; if error chains were incomplete, malformed contexts might constrain f.
- Quick test: Implement a toy U that decodes a 2-bit GID and outputs three hard-wired indices (for B=2). Create a malformed wc that spoofs Select(2) but without a legitimate (i1,i2,i3); check that an error-chain can be triggered locally, making the context inactive (only ⊥ at S is completable).

3) Type-separation by differential extendibility
Claim I (Distinct active types per RID and per GID). For β = poly(s), choose B = poly(s) with 2^B ≪ ℓ_pump. Then there exist 2^B left active context types Var_i (with RID = i) and 2^B right active context types Cl_j (with GID = j). Moreover, Var_i ≠ Var_{i'} for i ≠ i' and Cl_j ≠ Cl_{j'} for j ≠ j'. Separation proof sketch: fix any clause-type τR that, by RUN, decodes a triple including i but not i'. Commit S2 = REDp to the position p with ip = i. For the pair (Var_i, τR), equality is forced (ON) and fill exists if and only if f(Var_i) = RED. For (Var_{i'}, τR), inequality is forced (OFF) and fill exists regardless of f(Var_{i'}). Therefore, the boundary-extendibility signatures with S1 fixed to RED differ between Var_i and Var_{i'}, implying distinct types. Similarly for Cl_j using a fixed Var_i and toggling which Select(p) is legal according to RUN, we separate clause types by their decoded triples.
- Why useful here: We need exponentially many active types to encode all variables and clauses generated by the succinct circuit; distinctness is certified by different extendibility outcomes under fixed boundary labels, which the type definition captures.
- How it can fail: If the equality/inequality partitioning could be overridden by the filler (e.g., both certificates could succeed), the extendibility signatures could collapse; if RUN did not uniquely determine the triple, clause types might merge.
- Quick test: Let B=3, pick j with triple (2,5,7). Compare Var_5 vs Var_6 against Cl_j, S2 = GRN2 (selects 5). DP result differs: (Var_5, Cl_j) fill depends on f(Var_5); (Var_6, Cl_j) fill is always PAD. Distinctness follows.

4) Succinct SAT view of FFE(F1)
Claim J (Implicit SAT encoding). The existence of f is equivalent to the satisfiability of a succinct CNF Φ’ over variables: 
- For each Var_i: a Boolean v_i ∈ {RED,GRN} (two colors suffice; BLU only used as inactive/dummy and disallowed for active Var_i), encoding α(x_i).
- For each Cl_j: a 6-ary choice c_j ∈ {RED1,RED2,RED3,GRN1,GRN2,GRN3} selecting one position p ∈ {1,2,3} and a sign.
Constraints: For every ordered pair (Var_i, Cl_j), the bridge is satisfiable. By Claim G, this reduces to a single literal constraint per j, namely: if c_j = REDp (resp. GRNp) and RUN(j) outputs (i1,i2,i3), then require v_{ip} = RED (resp. v_{ip} = GRN). All other pairs impose only tautologies (inequality witnesses). Thus Φ’ is exactly the succinct 3CNF Φ_C: choose for each clause one literal (p and sign) that is true under α (the v_i’s). 
- Why useful here: It makes explicit the “implicit exponential-sized SAT formula” viewpoint: FFE(F1) is satisfiable iff a succinct CNF with exponentially many clauses (one per pair) is satisfiable; our LCL reduction constructs local constraints that evaluate this succinct CNF.
- How it can fail: If pairs other than the selected one also imposed constraints, Φ’ would be stronger than Φ_C (requiring all three literals to match), breaking soundness; if the selected pair could avoid referencing v_{ip}, completeness would be lost.
- Quick test: Clause j with literals (x3 ∨ ¬x7 ∨ x10). Set c_j = RED1 (select x3). Then the only nontrivial pair is (Var_3, Cl_j), enforcing v_3 = RED. Pairs (Var_7, Cl_j) and (Var_10, Cl_j) are OFF and PAD-fillable. Across all j, existence of α (the v_i’s) and c_j’s satisfying all selected pairs is equivalent to Φ_C satisfiable.

5) Radius-1 and β-normalized implementation sanity
Claim K (β-normalized, radius-1). 
- Σ_out tracks (constant many): role/phase, color tokens {⊥, REDp, GRNp}, CAP/PAD conduits, RID/GID one-hot lanes and their pointers, RUN tiles for U, error-chain symbols. 
- Cin–out: copies input bit to an “in-copy” subtrack and gates role legality (e.g., only S admits {⊥, REDp, GRNp}). 
- Cout–out: regular-language grammar for blocks; nearest-neighbor consistency for RUN rows; local tiles for equality/inequality witnesses and for CAP/PAD conduits; absorbing ⊥-plumbing that can fill repetitions (used later to trivialize (F2)). All checks are between consecutive nodes; the witness chains advance one node per step.
- Why useful here: Confirms we remain within the β-normalized, r=1 model and keep description size poly(β).
- How it can fail: If equality compare needed nonlocal jumps, or CAP/PAD conduits required 2-hop checks, we would exceed radius-1; we avoid this with “one-bit-per-step” pointer chains and local tiles.
- Quick test: Build a 12-node wc with RUN and a selected p; simulate the equality witness step-by-step next to a matching Var_i wb; ensure all edge checks refer only to consecutive outputs; flip one bit in the index to see equality chain get stuck while inequality chain passes.

6) Trivializing (F2) and mapping to tri-class classification
Claim L ((F2) vacuous via ⊥-plumbing). Extend Cout–out so that any wz_1 and wz_2 repeat can be filled entirely with ⊥, for any S color fixed by f(Type(w1 S w2)). Then (F2) holds automatically; thus for our family, O(1) iff (F1) holds and Θ(n) otherwise (by the standard gap Theorem 8). 
- Why useful here: Gives the desired O(1) vs Θ(n) dichotomy needed for NEXPTIME-hardness of the tri-class classification.
- How it can fail: If ⊥ is not fully absorbing at the seams near S, some contexts might violate (F2); we avoid this by explicit Cout–out entries permitting ⊥ next to any S-color.
- Quick test: Fix an active context and any z; force S and fill both repeats with ⊥; run the DP—should accept due to plumbing rules.

7) Size and succinctness bookkeeping
- Alphabet size: β = poly(s) suffices for: constant role/phase and gate tokens; RUN alphabet for T = poly(s); error chains; and a few colors (7 S-tokens). Cin–out is O(β); Cout–out is O(β^2) as required.
- Type space: ℓ_pump ≤ 2^{Θ(β^4)} = 2^{poly(s)} guarantees enough contexts to realize all 2^B RIDs/GIDs with window-anchored blocks and stability under pumping/replacement.
- Implicit SAT: The induced SAT instance Φ’ has exponentially many variables/clauses in s but is generated by the succinct circuit C and the local LCL tables; FFE(F1) is “does there exist f?” which is equivalent to satisfiability of Φ’. Our reduction from Succinct-3SAT maps C to PC in poly(s) time; Claims G–L give Φ_C satisfiable iff FFE(F1) for PC.

Toy counterexample probes
- Mismatch bypass attempt: Try to fill (Var_k, Cl_j) with k ≠ selected ip using equality chain; it must fail at the first compare bit, forcing the inequality path; DP rejects any attempt to route CAP without proving equality. 
- Multi-select clause cheat: Try to propagate two Select(p) values in wc while choosing a single S2 color; RUN+phase tiles forbid inconsistent select propagation; any duplication triggers an error-chain, deactivating the context.
- Boundary-only spoof: Remove wb’s HEAD marker but keep S1 = REDp; non-⊥ at S forces starting an offer that must find HEAD and RID; missing HEAD triggers the error-chain; only ⊥ is completable.

What remains to be written (explicit artifacts)
- Boundary tables: the exact Cin–out and Cout–out rows for the four nodes around S that (i) restrict S-palette, (ii) export/propagate Select(p) from S2 into wc, (iii) force CAP conduit on equality and forbid it on inequality, (iv) allow PAD otherwise, and (v) allow ⊥-plumbing always.
- RUN tiles: a concrete fixed-tile set for U’s poly(s)-step verification of C(j) and computation of (i1,i2,i3), exposing them as one-hots and pointers, plus error-chain tiles.
- B=2 worked example: instantiate all gadgets for B=2, list the 12 ordered pairs (Var_i, Cl_j), and manually DP-check the outcomes to confirm that only the single selected pair imposes the literal constraint and all others complete via PAD.

Summary of current status
- We repaired the “pairwise quantification” issue by an equality/inequality gate that provably turns only one pair ON per clause-type and makes all others OFF and harmless. This makes (F1) equivalent to a succinct SAT instance where each clause picks one true literal under α.
- We anchored all semantics within wb/wc and replaced constant-time checks with a poly(s)-length, radius-1 RUN tableau, preserving β-normalization.
- We sketched type-separation and the implicit SAT view, aligning with the user’s “implicit exponential-sized SAT” request.

## Round 0002 — 2025-08-27T11:23:07.548697Z

Mini-plan
- Formalize an implicit exponential-sized SAT encoding F(L) whose satisfiability is equivalent to the existence of a feasible function f for a given β-normalized, radius-1 LCL instance L on oriented paths. This cleanly connects (F1) and (F2) to a succinct-SAT instance.
- Specialize the encoding to our reduction family PC (from a succinct 3CNF generator C), using window-anchored active blocks and a gated bridge. Show that F(PC) is essentially the succinct 3SAT instance for C with auxiliary “literal-pick” variables Y.
- State and test three core lemmas: (i) succinct SAT capture of (F1) and (F2) with an explicit 2poly(β) bound, (ii) ON/OFF gate ⇒ CNF constraints of the form (¬Y ∨ X), and (iii) type-separation by boundary-extendibility patterns induced by interior witness behavior (no reliance on 2-node boundaries).
- Patch the previously flagged fragilities: ensure OFF for all unintended pairs (use offer/cap tokens), and move clause-decoding to a poly(s)-length, radius-1 tableau with error-chain refutations.
- Work out a small B=2 toy to validate the SAT constraints and counterexample probes; list next instrumentation (explicit Cin–out/Cout–out tables for the window seam, offers, PAD/CAP conduits, and the tableau seam rules).

1) Encoding feasible-function existence as an implicit exponential-sized SAT
Claim S1 (Succinct-SAT capture of (F1)+(F2)).
Given a β-normalized, radius-1 LCL L on oriented paths, there is a Boolean formula F(L) of size at most 2poly(β), given succinctly by a poly(β)-size circuit, such that F(L) is satisfiable iff there exists a feasible function f (i.e., f passes (F1) and (F2)). Variables are the choice bits of f on each context type τ and the auxiliary bridge/witness choices where needed. The clauses encode: (i) one-hot consistency of f(τ) ∈ Σout^2 on each τ, (ii) for every ordered context pair (τ1, τ2), the “bridge succeeds” constraint computed by the layered DP, and (iii) for (F2), the finitely many repetition lengths z ≤ Z with Z ≤ ℓ_pump^2 (per Lemma 1 in the draft), also checked via the DP.
- Why useful here: It gives a direct NEXPTIME upper bound (already in our draft) and sets up hardness by letting us reduce succinct 3SAT to F(L) through a specific LCL family PC. It cleanly isolates correctness to the equivalence F(L) ⇔ feasible f.
- How it can fail: If the number of context types exceeded 2poly(β) or the DP check needed super-polynomial circuits, the succinct-SAT size would blow up. Also, if (F2) required infinite z checks, we could not confine to finite clauses. Both are avoided by type bounds and periodicity.
- Quick test: For a toy LCL with β = O(1) that enforces proper 2-coloring (no equal neighbors), contexts and pairs are O(1), and F(L) becomes a tiny CNF: per τ choose color, per pair forbid equal-colored windows. The DP is trivial and the formula is equivalent to 2-colorability of the context graph.

Sketch of construction and size: Let T be the type set, |T| = ℓ_pump ≤ 2Θ(β^4). Let C ⊆ T be the context-type set: those realized by w1Sw2 with |wi| ∈ {ℓ_pump, ℓ_pump+1}. Introduce variables {X_{τ,c}} encoding f(τ)=c, with one-hot constraints per τ. For each ordered pair (τ1, τ2) introduce a polynomial-size circuit that runs the O(kβ^2) DP (k = O(ℓ_pump)) on the bridge instance to produce a clause-set forcing the DP to accept. For (F2), for each τ and z ∈ {1,…,Z}, add analogous DP constraints for wz_1Swz_2. The number of τ’s is ≤ ℓ_pump, pairs ≤ ℓ_pump^2, and z’s ≤ ℓ_pump^2. Each DP instance has size polynomial in β and ℓ_pump. Therefore the entire formula is of size at most 2poly(β), given succinctly by a poly(β)-size generator.

2) Specializing to the hardness family PC: ON/OFF gate ⇒ local CNF constraints
Claim S2 (Gated bridge yields per-clause local CNF). For the reduction PC built from a succinct-3CNF generator C (size s), we define Σout and Cout–out so that for every clause index j and its three literals ℓ ∈ {1,2,3}, there is a “literal-pick” color at the clause window S representing a choice Y_{j,ℓ}, and at each variable i there is a 1-bit choice X_i ∈ {RED,GRN} representing α(x_i). Then (F1) on PC translates to the CNF:
- One-hot per clause: exactly one Y_{j,ℓ} is chosen (enforced via one-hot encoding at the clause-side S).
- For each j and each occurrence i of literal ℓ in clause j with sign s ∈ {+,−}, the bridge constraint contributes a Horn clause of the form (¬Y_{j,ℓ} ∨ (X_i = RED)) if s=+, or (¬Y_{j,ℓ} ∨ (X_i = GRN)) if s=−.
All other ordered pairs (including all mismatched (i,j) where Y_{j,ℓ} points to some i′ ≠ i, or where the left/right side is inactive) compile to tautologies thanks to the OFF gate and ⊥-plumbing. Therefore, (F1) is equivalent to the satisfiability of the succinct CNF that encodes “for each clause j, the selected literal is true under α”.
- Why useful here: This resolves the universal quantification across all ordered pairs: OFF pairs impose no constraint, and the ON pair per clause imposes exactly one Horn clause linking the clause’s pick Y_{j,ℓ} to the variable’s truth X_i. It also shows that our (F1) feasibility is precisely succinct-3SAT.
- How it can fail: If the gate could turn ON on unintended pairs (e.g., when Y_{j,ℓ} selects i′ but the pair is with i ≠ i′), we would accumulate impossible constraints across all three i’s and lose completeness. If malformed clause blocks could fake an ON, spurious Horn clauses could be added. We avoid both by: (i) offers/caps at the S boundary that make ON depend only on the clause-side Y pick and the RUN-decoded occurrence i; (ii) a poly(s)-length, radius-1 verifier tableau that pins the three occurrences and signs; malformed encodings divert to error-chains and never activate ON.
- Quick test: Clause j = (x3 ∨ ¬x7 ∨ x10): introduce one-hot Y_{j,1},Y_{j,2},Y_{j,3}. Constraints: (¬Y_{j,1} ∨ X_3=RED), (¬Y_{j,2} ∨ X_7=GRN), (¬Y_{j,3} ∨ X_10=RED). If α sets X_3=RED, picking Y_{j,1} satisfies all three clauses tied to j; other pairs with variables not equal to 3 are OFF.

3) Window-anchored activation and OFF-pair neutrality
Claim S3 (OFF pairs are neutral; active iff block in window). The out–out grammar is arranged so that: (i) the two S-nodes can be labeled only from {⊥, RED, GRN, BLU}, (ii) non-⊥ at S forces an “offer” token to be emitted into wb (left) or wc (right), which is locally legal only at boundaries of well-formed blocks whose HEADC matches the fixed C header; otherwise non-⊥ is locally rejected and only ⊥ is extendible, and (iii) the gate turns ON iff both offers are present and the clause-side literal pick Y_{j,ℓ} matches the variable occurrence i (decoded from clause j by the tableau) at the other side; otherwise the gate remains OFF, and PAD-only conduits fill wb◦wc.
- Why useful here: Guarantees that (F1) constraints are only active precisely on intended (variable, selected-literal-of-clause) pairs; all other pairs are fillable regardless of f (by PAD/⊥), so they do not constrain the SAT.
- How it can fail: If ⊥ could not always fill wb◦wc (e.g., blocked by a seam rule), we could get unwanted constraints from inactive contexts. If the offer legality were not locally checkable, an adversarial DP could slip in a fake ON. We prevent both by (1) including a fully absorbing ⊥-plumbing sublanguage compatible with any S label, and (2) forcing an offer symbol adjacent to S for each non-⊥ S label; that offer is legal only when the immediately following few cells match the HEAD/role syntax of a block.
- Quick test: Construct a pair of contexts where the left wb is malformed (no HEAD marker). Choose RED at S. The left offer is illegal at the boundary; thus non-⊥ is locally rejected and only ⊥ can pass, making the pair OFF/neutral.

4) Clause decoding via a radius-1, poly(s)-length tableau (no O(1) checker)
Claim S4 (Local verification of succinct clause outputs). The clause-side wc contains (after HEAD and GID) a poly(s)-length, radius-1 tableau for a fixed universal TM U, whose job is to check that the three occurrence indices and their signs (stored in RUN subtracks) equal the outputs of the succinct generator C on input j. The adjacency table Cout–out enforces single-step consistency across rows; any mismatch triggers a short error-chain gadget (accepted locally), which prevents the clause block from being “active” and hence prevents gate ON.
- Why useful here: Fixes the previously broken claim of an O(1) decoder and ensures malformed clause encodings are harmless (cannot create ON). It also keeps the LCL description size polynomial in s and hence in β.
- How it can fail: If the tableau needed long-range dependencies or cross-row lookahead, we would exceed r=1. We avoid this by standard 1D Turing-tile encodings: every row encodes the work tape and head; Cout–out allows only legal transitions of U, checked locally per neighbor pair. Errors are locally witnessed via error tokens.
- Quick test: Build a 2-row tableau snippet with an intentional transition mismatch; verify that the only locally allowed continuation is to switch into an error-chain that absorbs the entire block, thus deactivating the gate.

5) Type separation without 2-node boundary signatures
Claim S5 (Distinct RID/GID yield distinct context types via differential extendibility). For each i ≠ i′, the context types τVar(i) (wb contains a well-formed variable block with HotRID[i]=1) and τVar(i′) are distinct: there exists some fixed clause-side active type τCl(j,ℓ) and a fixed S-label choice such that the bridge DP succeeds with τVar(i) and fails with τVar(i′). Analogous distinctness holds for clause types.
- Why useful here: We cannot rely on 2-node boundary encodings to separate 2^B indices. This shows distinctness emerges from differential extendibility behavior under the gated bridge with a suitable fixed partner, leveraging interior content (the RUN tracks) rather than boundary micro-alphabets.
- How it can fail: If C never produces a clause where i appears and i′ does not, a single τCl(j,ℓ) may not separate τVar(i) and τVar(i′). However, we can fix τCl to be any clause-side active type whose decoded triplet includes i but not i′; such a j exists among 2^B possible indices by padding C with a verifier that, when presented with a reserved “tester” j∗ (chosen at construction), outputs a clause whose single ON literal is x_i. This tester is validated by the same tableau mechanism. Thus separation does not rely on arbitrary properties of C.
- Quick test: Introduce j∗ whose decoded clause is (xk ∨ dummy ∨ dummy) for k set at construction. Then with τVar(k) and τVar(k′≠k), the bridge under S=RED is ON for τVar(k) and OFF for τVar(k′), distinguishing types.

6) From (F1) to tri-class classification via trivial (F2)
Claim S6 (Trivializing (F2) preserves succinct-SAT shape). Extend Cout–out so that wz_1 and wz_2 repetitions can always be filled with ⊥ (PAD) regardless of z. Then (F2) holds for any f, and feasible-function existence reduces to (F1), i.e., the succinct CNF in Claim S2. Therefore, mapping a succinct 3SAT instance C to PC shows NEXPTIME-hardness of the O(1) vs. Θ(n) sub-classification; in combination with the decidability framework (Theorems 8–9 in the reference), the three-way classification is NEXPTIME-hard.
- Why useful here: Eliminates (F2) constraints, preventing an unintentional Θ(log* n) regime. The family sits on the O(1)–Θ(n) dichotomy, simplifying the reduction target.
- How it can fail: If the PAD/⊥ seam conflicts with the S-label fixed by f, (F2) could still impose constraints. We avoid this by permitting ⊥ adjacent to any S-color and by making PAD/⊥ internally self-compatible.
- Quick test: Pick any context and z=17. Force S by f; fill wz_1 and wz_2 with ⊥. The DP finds a trivial path since every PAD/⊥ pair is admitted by Cout–out.

7) Toy worked example (B=2) under the SAT view
- Variables: X_1, X_2, X_3, X_4 ∈ {RED,GRN} (encode α(x1..x4))
- One clause j with literals (x3 ∨ ¬x1 ∨ x4). Clause picks: one-hot Y_{j,1},Y_{j,2},Y_{j,3}.
- CNF clauses from the bridge: (¬Y_{j,1} ∨ X_3=RED), (¬Y_{j,2} ∨ X_1=GRN), (¬Y_{j,3} ∨ X_4=RED).
- All other ordered pairs are OFF/neutral or forced ⊥. Thus F(PC) is satisfiable iff there exist X’s and a one-hot Y making one of those literals true—exactly the clause’s satisfiability. Multiple clauses add independent groups of three Horn clauses plus a one-hot.
Counterexample attempt: If the gate were missing, we would need all three implications simultaneously for all i occurring in j, which would force X_3=RED and X_1=GRN and X_4=RED at the same time, and would also erroneously constrain pairs with variables not in the clause; the gate avoids this by OFF pairs and ON only for the selected literal.

8) Outstanding spec to finalize
- Cin–out and Cout–out tables at the window seam: explicit rows that (i) force an offer on non-⊥ S, (ii) reject non-⊥ unless a valid block boundary follows, (iii) implement OFF→PAD conduits, and (iv) implement ON→CAP conduit and CAP equality test.
- Clause-side tableau tile set: list of allowed (state,symbol) pairs across rows; error-chain tokens that must appear when a mismatch occurs.
- Tester j∗ mechanism (for type-separation robustness): specify reserved GID and the corresponding hard-wired outputs of U, validated by the same tableau (kept radius-1) so that τVar(i) types are provably distinct.
- Confirm size bounds: |Σout| = β = poly(s); tables of size O(β^2); tableau length poly(s); type bound ℓ_pump = 2Θ(β^4); hence contexts/pairs ≤ 2poly(β); DP verifiers run in O(kβ^2) per instance.

What we have accomplished this round
- Provided a clean, succinct-SAT formulation of feasible-function existence (S1), which aligns exactly with the required NEXPTIME framework.
- Instantiated the SAT constraints for the reduction family PC (S2–S3), addressing the earlier fragile spots (pairwise quantification and activation locality) and eliminating reliance on boundary-only signatures (S5).
- Replaced the O(1) clause decoder with a poly(s)-length, radius-1 tableau and an error-chain refuter (S4).
- Validated by a B=2 toy and articulated the remaining explicit-table tasks needed to cement the construction.

## Round 0002 — 2025-08-27T11:23:07.543718Z

Mini-plan
- Recast feasible-function existence (F1) as an implicit exponential-sized SAT instance over type-choices, then map Succinct-3SAT to it. Make the quantifier structure transparent.
- Fix the bridge semantics: clause-side chooses one of its 3 occurrences (not a sign), variable-side chooses its truth; the gate is ON only for the matching occurrence/variable-index pair; ON enforces truth=sign(occ). OFF pairs are trivially fillable. This aligns “for all ordered pairs” with “∃ a satisfied literal.”
- State a clean SAT-of-types lemma and the gating-correctness lemma with how-it-can-fail and quick tests (B=2 toy). Tie to radius-1 and β-normalized implementation.
- Prove existence and separability of exponentially many active context types (2^B variable-types and 2^B clause-types) using pumping and window anchoring; include a crisp type-separation witness.
- Specify the poly(s)-length, radius-1 clause-verification tableau that exposes (i1, i2, i3) and their signs next to S; add error-chain refuters. Conclude soundness/completeness for (F1) and show how to trivialize (F2) for classification hardness.

1) SAT-of-types view of (F1)
Claim G (Implicit SAT for feasible-function existence). For a fixed β-normalized, r=1 LCL P and its context-type set C (types of w1 S w2 with |w1|,|w2|∈{ℓpump,ℓpump+1}), there is an implicit exponentially large SAT instance F(P) over variables encoding f(τ) (the 2-node label at S for each τ∈C), and for each ordered pair (τL,τR) a local constraint R(τL,τR,f(τL),f(τR)) that holds iff the DP on the bridge wa S1 wb wc S2 wd (with types τL,τR) succeeds. Then there exists a feasible f satisfying (F1) iff F(P) is satisfiable.
- Why useful here: Reducing Succinct-3SAT to F(P) (or vice versa) yields NEXPTIME-hardness via an implicit exponential SAT. It also clarifies that our bridge-gadget just defines a pairwise constraint language on type-colors decidable by the O(kβ^2) DP.
- How it can fail: If C depended on f (circularity), or if the pairwise DP check were not radius-1 decidable, we could not encode constraints locally. Here, C is defined purely by input types (Section 4 types) and the DP is radius-1.
- Quick test: Pick a small Σout (β=5), enumerate 2–3 contexts with actual strings, run the DP to tabulate which f-choices on S1,S2 are extendible. The truth table matches a Boolean constraint R for those (τL,τR).

2) Correct bridge semantics: clause chooses occurrence, variable chooses truth
Patch H (Occurrence-selected gate). Modify the S-alphabet and gate:
- Variable-side S palette: VT (true) or VF (false). Interpreted as α(x_i)=1 iff VT.
- Clause-side S palette: O1,O2,O3 (select occurrence t∈{1,2,3} of clause j). No sign is chosen at S; signs are read from the clause RUN for that occurrence.
- Gate ON condition (purely local): the left wb contains a well-formed variable block with RID=i; the right wc contains a well-formed clause block with the triple (i1,sgn1),(i2,sgn2),(i3,sgn3). If clause S-color=Ot and RID=i equals it, gate=ON; otherwise OFF. Window anchoring places all needed bits inside wb or wc.
- ON-bridge semantics: enforce that VT iff sgnt=+ and VF iff sgnt=−, via a one-bit CAP conduit from S1 to S2 (compare variable truth with required sign of the selected occurrence t). OFF-bridge semantics: wb◦wc is PAD-plumbable regardless of S colors.
- Why useful here: Fixes the earlier quantification mismatch: for a clause j, only the pair with the variable-type matching the chosen occurrence turns ON; the other two pairs turn OFF and are trivial, so (F1)’s universal quantifier no longer overconstrains clauses.
- How it can fail: (i) If the DP can deviate and turn ON without RID=it equality (no: ON is determined at the immediate seam by tokens and checked locally); (ii) If OFF were rejected due to seam interactions (we ensure PAD-plumbing accepts all OFF seams); (iii) If we needed to encode it (the occurrence index) at S (we do not: S carries only Ot; equality to RID is tested by a witness path inside wb and wc).
- Quick test: Clause j with occurrences (i1=3,+), (i2=7,−), (i3=10,+). If f(τCl(j))=O2, only pairs with τVar(7) are ON; their success requires VF at S1. Pairs with τVar(3) and τVar(10) are OFF and always fill. Thus f(τCl(j))=O2 works iff α(x7)=0.

3) Equivalence to Succinct-3SAT via implicit SAT
Claim I (SAT-of-types ≡ Succinct-3SAT under Patch H). Let C be a succinct generator of a 3-CNF ΦC over variables x1,…,x_{2^B}. Build PC so that active context types include all τVar(i) (all i∈{0,1}^B) and all τCl(j) (all j∈{0,1}^B). Under Patch H, (F1) holds for some f iff ΦC is satisfiable.
- Informal proof sketch: Introduce Boolean variables A_i (truth of x_i) corresponding to f(τVar(i))∈{VT,VF}, and 3-way selector T_j∈{1,2,3} corresponding to f(τCl(j))∈{O1,O2,O3}. The bridge constraints across all ordered pairs conjoin, for each j, the single ON-pair constraint: if T_j=t then A_{i_t} must equal sgn_t. OFF pairs are tautologies. This is exactly the clause-satisfaction condition “∃t with A_{i_t}=sgn_t.” Hence f exists iff there is {A_i},{T_j} satisfying ∧_j ∨_{t=1}^3 (A_{i_t}=sgn_t), i.e., ΦC is satisfiable.
- How it can fail: If some τCl(j) could choose an O_t that is not one of its occurrences (e.g., unverified (i_t,sgn_t)), the constraint could be cheated. We prevent this by the clause-run tableau and local checker exposing (i_t,sgn_t) and rejecting any Ot whose occurrence record is malformed.
- Quick test: B=2 example with 4 variables. Let clause j encode (x1 ∨ ¬x2 ∨ x3). If α(x1)=0, α(x2)=1, α(x3)=0, the only working choice is T_j=2 (select occurrence 2: ¬x2). The only ON-pair is with τVar(2) and requires VF at left; holds. Other pairs OFF.

4) Active type coverage and type separation
Claim J (Coverage and separation of active types). With β=poly(s), choose B=s^c0 and ℓpump=2^{Θ(β^4)}. Using window-anchored blocks, for each i and each j there exist context types τVar(i) (left context whose wb contains a valid variable block with RID=i) and τCl(j) (right context whose wc contains a valid clause block with GID=j and tableau exposing its 3 occurrences). Moreover, τVar(i)≠τVar(i′) for i≠i′, and τCl(j)≠τCl(j′) for j≠j′.
- Why useful here: We need 2^B many distinct variable-types and 2^B many distinct clause-types so that {A_i} and {T_j} are well-defined choices over C.
- How it can fail: (i) If the header+indices+RUN footprint exceeded the window length, activation wouldn’t be local (fix: windows are size ℓpump with ℓpump≫poly(s)); (ii) If types collapsed despite different RIDs/GIDs (fix: separation by boundary-extendibility: pick a partner type so that an ON-bridge exists for one index but is impossible for the other, hence their boundary-extendibility signatures differ).
- Quick test (type-separation witness): Fix j and pick Ot selecting its first occurrence i1; Build the ordered pair (τVar(i1),τCl(j)). The ON-bridge can succeed if VT=sgn1; For i′≠i1, the gate is OFF and we can enforce a different outcome by forcing non-⊥ on the variable side with a mismatching token that is locally rejected; the sets of boundary-extendible labelings differ, so the types differ.

5) Clause-verification tableau and radius-1 implementation
Claim K (Poly(s)-length, radius-1 verification inside wc/wb). The clause-side block encodes in RUN a radius-1 checkable tableau of length poly(s) that, given (C,GID=j), exposes in fixed rows: (i1,sgn1),(i2,sgn2),(i3,sgn3) in one-hot form next to the S-neighborhood. The variable-side block exposes HotRID in one-hot. Cout–out enforces stepwise consistency; malformed encodings admit a short error-chain refuter; well-formed ones cannot be refuted.
- Why useful here: Ensures Ot actually corresponds to a validated occurrence and exposes sgnt locally, making the ON conduit comparison well-defined and radius-1 checkable.
- How it can fail: If the verifier were O(1)-time, it could not validate the succinct circuit’s output; we instead unroll a poly(s)-length tableau (still radius-1, constant alphabet overhead). If errors were non-refutable, inactive contexts could force constraints; the error-chain gadget prevents that.
- Quick test: For a hand-built clause-index j, create a tiny RUN with 3 marked rows carrying the one-hot i_t and sgnt bits at fixed offsets. Flip one bit and confirm that an error-chain can be placed locally and that any non-⊥ S-choice against a malformed block is rejected by the DP.

6) Inactive contexts are harmless; (F2) trivialization
Claim L (Inactive contexts force ⊥; (F2) is made vacuous). If a context’s wb (resp. wc) lacks a well-formed variable (resp. clause) block, any non-⊥ at S is locally rejected (witness chain cannot find headers/indices). A dedicated PAD/⊥-plumbing language in Cout–out allows arbitrary filling when OFF or ⊥ at S. If we further allow wz repeats to be ⊥-fillable regardless of z, (F2) holds for any f, and the classification collapses to O(1) iff (F1) feasible, else Θ(n) by the gap theorem.
- Why useful here: Neutralizes irrelevant pairs and reduces the tri-class decision to (F1) on our instances.
- How it can fail: If PAD/⊥ seams were incompatible with S choices, OFF wouldn’t be trivially fillable; we explicitly include seam-compatible PAD/⊥ pairs in Cout–out.
- Quick test: Take an inactive left context and any right context. Try S=VT; the DP fails early (no HEAD/RID found). Set S=⊥; the DP runs a PAD/⊥ conduit and succeeds.

7) Putting it together: reduction to implicit SAT (Succinct-3SAT → F(P))
- Source: circuit C of size s defining ΦC with 2^B variables and 2^B clauses, each clause(j) has three occurrences (i1,sgn1),(i2,sgn2),(i3,sgn3).
- Target: PC with Σout and Cout–out implementing Claims H–L; β=poly(s), r=1, |description|=poly(β)=poly(s). By Claim J, C’s type set contains all τVar(i) and τCl(j). By Claim I, there exists f satisfying (F1) for PC iff ΦC is satisfiable. By Claim L, we can trivialize (F2) if we target full classification hardness.
- Complexity: Types count ℓpump=2^{Θ(β^4)}=2^{poly(s)}; we never enumerate them in the reduction. Verification of each bridge is via O(kβ^2) DP (k=Θ(ℓpump)), consistent with the NEXPTIME upper bound.

8) Toy worked example (B=2, indices 00..11)
- Let clause j encode (x01 ∨ ¬x10 ∨ x11). Suppose α(x01)=0, α(x10)=1, α(x11)=0.
- Choices: set f(τVar(01))=VF, f(τVar(10))=VT, f(τVar(11))=VF. Set f(τCl(j))=O2 (choose occurrence 2: ¬x10). For ordered pairs: (τVar(10),τCl(j)) ON and requires VT= (sgn2=−)? No, ON demands VF when sgnt=−. Oops: we must require VT iff sgnt=+ and VF iff sgnt=−; thus for occurrence 2 (negative), left must be VF to pass. Since α(x10)=1, O2 would fail. Correct choice is O1 or O3? O1 has sgn1=+, requires VT at Var(01), but α(x01)=0, so fail. O3 has sgn3=+, requires VT at Var(11), but α(x11)=0, so fail. Therefore, α does not satisfy this clause; no O_t makes the ON-pair succeed, as intended. If we flip α(x10)=0, then O2 makes (τVar(10),τCl(j)) succeed and all other pairs OFF; (F1) holds for this j.
- Takeaway: For each clause j, there exists exactly those Ot consistent with α that make all pairs pass; otherwise (F1) fails.

9) Open items and quantitative checks
- Boundary tables: Write explicit Cin–out/Cout–out rows for S-seams enforcing: (i) non-⊥ at S emits Offer tokens and forbids PAD unless OFF, (ii) OFF⇔mismatch of (RID,it), (iii) ON enforces CAP wire equality truth↔sgn_t, (iv) PAD/⊥ seams accept any colors when OFF.
- Clause RUN tiles: Provide a fixed set of row-local tiles producing/exposing (i_t,sgn_t) and validating them against header C and GID=j, with a bounded error alphabet E to refute any malformed run.
- Type separation proof: Formally exhibit, for i≠i′, some counterpart type so that the sets of extendible boundary assignments differ (hence distinct types). Likewise for clauses.
- Rule budgets: Count tracks/symbols to confirm |Σout|=β=poly(s). ℓpump≫poly(s) so that windows can host headers+indices+RUN comfortably.

How this answers “reduce to implicit exponential-sized SAT formula”
- The existence of a feasible f is equivalent to satisfiability of the implicit SAT F(P): variables are (A_i) and (T_j), constraints are local bridge constraints per (τVar(i),τCl(j)), exponentially many but specified implicitly by P (via DP over ℓpump-length contexts). Our reduction from C maps ΦC to F(PC) with the property F(PC) satisfiable iff ΦC satisfiable. This yields NEXPTIME-hardness of feasible-function existence, and (by trivializing (F2)) the full O(1) vs Θ(n) classification.

## Round 0003 — 2025-08-27T11:30:44.019901Z

Mini-plan
- Patch the active-window semantics: forbid ⊥ at S on active contexts; adopt occurrence-only clause palette {O1,O2,O3}; bind sign from the verified RUN tracks.
- State and prove a radius-1 Exclusivity Lemma for equality vs. inequality witness chains; pin down the local invariants (one-hot, pointer integrity, eq_so_far register).
- Specify seam rules (offers, ON/OFF gate, CAP/PAD conduits) at the two S-nodes; show (F2) can be trivialized via PAD on repeats without trivializing (F1).
- Add a type-separation lemma using a neutral tester clause j* to guarantee distinct Var_i types independent of C.
- Validate with a B=2 toy: enumerate one clause and 3 variable pairs; check ON/OFF and sign-binding behavior; probe a couple of cheating attempts.

1) Patch A: Active S forbids ⊥; occurrence-only palette with sign bound to RUN
Claim A1 (Active-window S palette and sign binding).
- Clause-side S2 palette is occurrence-only: {O1, O2, O3} (no sign); variable-side S1 palette is truth-only: {VT, VF}. The sign of occurrence p ∈ {1,2,3} is exported from the clause RUN on a local subtrack sgn[p] ∈ {+,−}.
- Activity and ⊥. Introduce boundary Offer tokens emitted by well-formed blocks immediately adjacent to S. Cout–out forbids S ∈ {⊥} adjacent to an Offer; permits S ∈ {⊥} iff the adjacent side emits NoOffer (which only happens if the side is inactive or error-refuted). Thus: S is forced non-⊥ on active contexts; ⊥ allowed only on inactive ones.
- ON condition: Both sides active and clause S2 = Op. The gate is ON iff RID = ip (selected occurrence index) (checked by the witness in Claim E below). On ON, CAP conduit must be used and enforces VT iff sgn[p] = + and VF iff sgn[p] = −.
- OFF condition: If not (RID = ip), the inequality witness must be used (Claim E), and only PAD conduit is permitted; no CAP may be present.
Why useful here: This patch addresses two critical issues: it prevents f(·) ≡ ⊥ from trivially satisfying (F1), and it removes sign choices from S, forcing the sign to match the verified RUN output.
How it can fail:
- If a malformed right block could still legally emit Offer near S, the instance could be forced active without a valid RUN, breaking soundness. We prevent this by making Offer admissible only at the unique boundary positions of the HEADC/RUN grammar; any malformed structure must switch to error-chain tracks that never emit Offer.
- If sign[p] could be spoofed locally, the clause could cheat its sign. We enforce sgn[p] as a read-only track driven by the RUN tableau; any mismatch with RUN is locally refutable via an error-chain, and there is no permitted local transition that sets sgn[p] arbitrarily.
Quick test/counterexample attempt: Construct a right context missing the RUN rows but with an Offer token. The seam rule at the HEADC→RUN boundary refuses changing from PAD to Offer without the exact RUN row header; thus S cannot be non-⊥; with S forced to ⊥, the pair is inactive and imposes no constraint.

2) Lemma E: Exclusivity of equality vs inequality witnesses (radius-1)
Claim E (Exclusivity and determinism of the ON/OFF gate). For an active ordered pair with clause pick p and indices (RID on left, ip on right), the following holds under radius-1 witness semantics:
- There exists a valid equality witness path if and only if RID = ip. If such a path exists, the grammar enables CAP and forbids PAD at the seam.
- There exists a valid inequality witness path if and only if RID ≠ ip. If such a path exists, the grammar enables PAD and forbids CAP at the seam.
- The two witnesses are mutually exclusive: at most one is realizable for any given pair.
Local invariants and implementation (tracks and transitions):
- One-hot indices. Left block exports HotRID[1..B] with exactly one 1; right block exports Occ[p][1..B] with exactly one 1 (Occ is the one-hot for ip, selected by S2 = Op through fixed local pointers inside RUN’s outputs). Nearest-neighbor consistency enforces one-hotness rowwise.
- Bit-lanes. Both blocks expose the binary expansions RID_bits[1..B] and ip_bits[1..B] alongside the one-hots.
- Witness chain and eq_so_far register. A single-symbol-width chain walks across bit positions b = 1..B. The chain carries a mode flag eq ∈ {0,1}. Start at b = 1 with eq = 1. At each step, the only allowed transition updates eq ← eq ∧ (RID_bits[b] == ip_bits[b]). At b = B + 1, the chain halts.
- Acceptance rules. Equality certificate accepts iff the chain reaches b = B + 1 with eq = 1. Inequality certificate accepts iff at some b a designated Mismatch token is placed; placing Mismatch is legal only on steps where (RID_bits[b] ≠ ip_bits[b]) and eq was 1 just before the step. Once Mismatch is placed, the remaining steps propagate a neq-mode that cannot flip back to eq = 1, and acceptance is at the end.
- CAP/PAD gating. CAP may be emitted only if the equality certificate accepts; PAD may be emitted only if the inequality certificate accepts. There is no rule allowing CAP (resp., PAD) without the corresponding accepted witness state.
Why useful here: Encodes the ON/OFF dichotomy so that exactly one of the two certificates can succeed, with all checks performed by two-node constraints.
How it can fail:
- Fabricating a Mismatch when RID = ip: disallowed since setting Mismatch requires (RID_bits[b] ≠ ip_bits[b]) locally, which is false at every b if equal.
- Forcing eq to remain 1 when RID ≠ ip: impossible because eq updates are locally determined by the observed bits; a mismatch forces eq ← 0 and cannot flip back.
- Combining both CAP and PAD: impossible because CAP requires eq(B+1)=1 while PAD requires a Mismatch and eq must become 0; the mode flag prevents simultaneous acceptance.
Quick test/counterexample attempt (B=3):
- RID=5 (101), ip=5 (101): equality chain has eq path 1→1→1→1; accepts; PAD disallowed (no allowed Mismatch placement). RID=5, ip=6 (110): at b=2, bits differ; eq flips to 0; equality fails; inequality can place Mismatch at b=2 and accept; CAP disallowed.

3) Seam rules: offers, gate, CAP/PAD conduits; trivializing (F2) safely
Claim S (Seam rule schema around S).
- Left seam (wb↔S1). If the left neighbor outputs OfferL, then S1 ∈ {VT,VF} is required; S1=⊥ is forbidden. If the left neighbor outputs NoOfferL, then S1=⊥ is the only admissible S1 label.
- Right seam (S2↔wc). If the right neighbor outputs OfferR, then S2 ∈ {O1,O2,O3} is required; S2=⊥ is forbidden. If NoOfferR, then S2=⊥ is the only admissible S2 label.
- ON/OFF enforcement. If both seams present Offer and S2 = Op, Cout–out enables exactly one of two seam grammars depending on the witness mode: ON: CAP conduit (a single-bit wire that propagates from S1 to S2 and is locally compared to sgn[p]); OFF: PAD conduit (neutral filler). The CAP seam forbids PAD tokens; the PAD seam forbids CAP tokens.
- Repeat-PAD (for (F2)). For every context (w1,S,w2) and any z≥1, the tables admit filling each repetition wz_i by a RepeatPAD track that is locally compatible with any S color and with the block-seam on the opposite side of S. RepeatPAD never appears in bridges (wb◦wc) and never coexists with Offer within a block. Hence: (F2) holds vacuously for repeats while (F1) bridges remain nontrivial.
Why useful here: Keeps (F1) hard (since ON forbids PAD bypasses and requires CAP) while allowing (F2) to be made vacuous via RepeatPAD that ignores the length z and does not depend on equality.
How it can fail:
- If RepeatPAD were allowed inside bridges (wb◦wc), it could trivialize (F1); we explicitly forbid PAD on bridges when the gate is ON.
- If Offer could appear alongside RepeatPAD inside wz blocks, the context would become spuriously active; we forbid Offer transitions on RepeatPAD tracks.
Quick test/counterexample attempt: Consider an active context with both offers and S2 = O2, RID ≠ i2. Try to use RepeatPAD in wb◦wc: Cout–out rejects because bridges only allow PAD under an accepted inequality witness; RepeatPAD is only valid inside wz repeats in (F2), not inside bridges.

4) Type separation via a neutral tester clause j*
Claim T (Neutral tester guarantees distinct variable types). Add a reserved, well-formed clause type Cl_{j*} whose RUN deterministically outputs a clause with occurrences (i, dummy, dummy) and known sign, for each i in the needed range (or provide c different tester clause types if we need many). The construction validates these outputs by the same RUN checker and permits S2 ∈ {O1,O2,O3} accordingly.
- For any two variable types Var_i ≠ Var_{i'}, pair with Cl_{j*} configured to pick O1 (the i-occurrence). Under a fixed S1 (say VT), (Var_i, Cl_{j*}) is ON and completable iff VT matches the known sign; (Var_{i'}, Cl_{j*}) is OFF and completable via PAD. Therefore their boundary-extendibility signatures differ under the same S-color, forcing distinct types.
Why useful here: Ensures the existence of exponentially many distinct variable types without relying on idiosyncrasies of C; only needs the RUN tile set we already include.
How it can fail: If Cl_{j*} could be malformed yet still active, it might not separate types; the same Offer+RUN validation prevents that. If O1 could be set without binding to the i occurrence, the ON test could accidentally apply to i′; forbidden by the pointer integrity rules.
Quick test/counterexample attempt: Build Var_5 and Var_6 and pair with Cl_{j*} that exposes occurrence 1 = 5 (positive). With S1=VT and S2=O1, (Var_5,Cl_{j*}) has an equality witness and CAP passes; (Var_6,Cl_{j*}) only inequality witness exists and only PAD passes; types differ.

5) Clause RUN tile: sign-binding and occurrence selection
Claim R (RUN tableau exposes indices and signs; selection wiring is local). The right block’s RUN encodes a BO(1)-time simulation of U(C,j) that materializes:
- Three one-hot vectors Occ[1], Occ[2], Occ[3] ∈ {0,1}^B, each with a unique 1-bit at positions i1,i2,i3.
- Three sign bits sgn[1], sgn[2], sgn[3] ∈ {+,−}.
- Selection pointers: from S2 tokens Op, a fixed local wiring enables a Selected[·] subtrack that equals Occ[p] and a SelectedSgn that equals sgn[p].
The adjacency rules ensure that Op cannot enable Selected that disagrees with the underlying Occ/sgn. Any mismatch triggers an error-chain and deactivates the context (no Offer).
Why useful here: Guarantees the ON check uses the correct i_p and sign, with all information within radius-1 of S via short pointer chains, and aligns with Patch A’s palette.
How it can fail: If Selected could be chosen independently of RUN, the clause could cheat; we prevent by making Selected writable only when a local synchronization state (a phase bit) from the RUN row is present; otherwise, only error-chain transitions are legal. If we needed nonlocal access, that would break r=1; we avoid this by pre-exposing Occ and sgn as adjacent tracks.
Quick test/counterexample attempt: Force S2=O2 but flip sgn[2] in a RUN row. RUN consistency rejects the row; the only continuation is to switch into an error-chain that removes Offer; S must be ⊥ and the context becomes inactive.

6) B=2 toy validation
Setup: Variables x1..x4; one clause j encodes (x3 ∨ ¬x1 ∨ x4). Right RUN exports Occ[1]=one-hot for 3, sgn[1]=+; Occ[2]=one-hot for 1, sgn[2]=−; Occ[3]=one-hot for 4, sgn[3]=+.
- Case α: x1=1, x3=0, x4=0.
  - f(Var_1)=VT, f(Var_3)=VF, f(Var_4)=VF; pick S2=O1.
  - (Var_3, Cl_j): RID=3, ip=3 ⇒ equality witness exists; sgn[1]=+ but S1=VF, CAP comparison fails ⇒ bridge rejects. So O1 is incompatible with α.
  - Pick S2=O2 instead: (Var_1,Cl_j): RID=1, ip=1, equality witness exists; sgn[2]=− and S1=VT mismatches ⇒ reject. O3: (Var_4,Cl_j) equality exists but sgn[3]=+ vs S1=VF ⇒ reject. Thus no S2 works: clause unsatisfied under α.
- Flip α: x1=0,x3=1,x4=0 (i.e., f(Var_1)=VF, f(Var_3)=VT, f(Var_4)=VF).
  - With S2=O1: (Var_3,Cl_j) equality witness exists and sgn[1]=+ vs S1=VT matches; ON uses CAP; all other pairs OFF via inequality/PAD. (F1) passes for this clause.
Cheat probes:
- Try S=⊥ on active pair: forbidden by Offer seam; local check fails.
- Try to use PAD on ON: CAP-only seam disallows PAD tokens; DP dies immediately.
- Try equality witness with RID≠ip: eq_so_far flips to 0 at first mismatch; end state prevents CAP; DP fails.

7) SAT-of-types recapped under the patches
- Variables: for each Var_i active type, choose S1 ∈ {VT,VF} encoding α(x_i).
- Clause picks: for each Cl_j active type, choose S2 ∈ {O1,O2,O3} selecting one occurrence.
- Constraints: For each ordered pair (Var_i, Cl_j), the bridge succeeds iff either (i) it is OFF (RID≠ ip of the chosen p), or (ii) it is ON and α(x_{ip}) matches sgn[p]. Thus (F1) is equivalent to: for each j, there exists p such that the literal at position p is true under α. This is exactly Φ_C satisfiable.
Why useful here: Confirms the reduction still encodes the intended succinct-3SAT after the safety patches.
How it can fail: Only if OFF pairs imposed extra constraints; the Exclusivity Lemma and PAD-only rule guarantee they do not.
Quick test/counterexample attempt: For the toy clause above, selecting O2 enforces only α(x1)=0; pairs with Var_3 and Var_4 are OFF; no extra constraints appear.

What is now solid
- Active/inactive discipline at S (⊥ forbidden on active) and occurrence-only clause palette eliminate the two main pitfalls flagged by the verifier.
- A radius-1 exclusivity proof for equality vs. inequality witnesses (eq_so_far monotonicity, mismatch token rules) prevents bypasses and spurious ONs.
- A seam-rule schema that makes (F2) vacuous via RepeatPAD while keeping (F1) nontrivial.
- A neutral tester clause j* ensures type separation independent of C, addressing the multiplicity of active types robustly.

Open items to finalize (explicit artifacts)
- Enumerate the Cin–out/Cout–out entries at the four seams (left boundary→S1, S1→right bridge, left bridge→S2, S2→right boundary), specifying the exact allowed pairs for: Offer/NoOffer, CAP/PAD, witness-step tokens, and RepeatPAD adjacency.
- List the RUN tile set: the per-row neighbor constraints for U, and the local exposure of Occ[·] and sgn[·]; define the error-chain alphabet and transitions.
- Package the tester j* as a concrete right-block type with its own header tag, and show it does not interfere with the main reduction.
- A tabulated B=2 DP trace for 3–4 representative pairs to sanity-check all seam interactions (especially CAP comparison to sgn[p]).

## Round 0003 — 2025-08-27T11:30:44.027502Z

Mini-plan
- Fix the three correctness gaps flagged by the verifier: (A) forbid ⊥ at S on active seams via explicit radius-1 seam rules; (B) bind the sign to the clause RUN by adopting the occurrence-only palette {O1,O2,O3}; (C) prove exclusivity of equality vs inequality certificates with local invariants.
- Specify the seam grammar around S: enumerate allowed Cout–out pairs between S and its two neighbors; define the Offer/Accept handshake and CAP/PAD conduits; make OFF pairs neutral and ON pairs enforce the equality-and-sign check.
- Formalize the pointer/witness chains and the one-hot/binary compare: what tracks exist, how the chain advances, and what local checks prevent faking.
- Provide a robust type-separation lemma (using a tester clause j⋆ if needed) and a B=2 toy check of ON/OFF behavior.
- Reconcile with the reduction: with (F1) only, the family lands in {Θ(log* n), Θ(n)} depending on SAT(C); we do not need to trivialize (F2) (avoid the ⊥-plumbing pitfall for (F1)).

1) Seam grammar around S: tokens, roles, and local rules
We introduce constant-size output tokens and roles used only in the 2 nodes S and their immediate neighbors on each side.
- S-side tokens (clause side): ClauseSelect ∈ {O1, O2, O3}. No sign is encoded at S.
- S-side tokens (variable side): VarTruth ∈ {VT, VF}.
- S-side token ⊥ exists but is forbidden when the adjacent neighbor is active (defined below).
- Interface roles at the neighbor cells (the nodes immediately adjacent to S within wb or wc):
  - AccVar: boundary interface of a well-formed variable block adjacent to S on the left (contains anchors/pointers to RID one-hot and binary RID bits; see §3).
  - AccCla: boundary interface of a well-formed clause block adjacent to S on the right (contains anchors/pointers to the RUN outputs for occurrence indices and signs; see §2).
  - Neutral: any non-interface role (PAD, error-chain, or malformed)—used to deactivate the seam locally.
- Handshake (radius-1) via Cout–out on the two seam edges (left seam: neighbor←→S; right seam: S←→neighbor):
  - If neighbor role is AccVar: allowed S outputs are VarTruth ∈ {VT,VF}; S = ⊥ is forbidden (no Cout–out entry (AccVar, ⊥)).
  - If neighbor role is AccCla: allowed S outputs are ClauseSelect ∈ {O1,O2,O3}; S = ⊥ is forbidden (no Cout–out entry (⊥, AccCla)).
  - If neighbor role is Neutral: allowed S outputs include ⊥ and the non-⊥ tokens but all non-⊥ must emit Offer tokens (see below) that are immediately rejected unless the neighbor upgrades to an Acc● role (making the seam locally deciding). Practically: (Neutral, VarTruth) and (ClauseSelect, Neutral) have no accepting continuations except via immediate error-chain admission; (Neutral, ⊥) and (⊥, Neutral) are always allowed (PAD), ensuring inactive seams are neutral.
- Offer/Accept and certificate start: Non-⊥ at S forces emission of a certificate-start token CertStart on the first interior edge; CertStart is legal only if the adjacent neighbor is AccVar (left seam) or AccCla (right seam). Otherwise, Cout–out rejects and only ⊥ is feasible. This enforces “non-⊥ ⇒ active seam” locally.
- CAP/PAD conduits: Once CertStart is accepted on both sides, a CAP conduit is enabled only under equality (see §3), otherwise only a PAD conduit is enabled (OFF). The Cout–out table forbids placing any error-chain token adjacent to CAP (to prevent bypass), while PAD accepts error-chain tokens (to guarantee neutral fill when OFF).
Why useful here: This replaces the informal “activation” with explicit, radius-1 seam rules. It ensures (i) ⊥ cannot be used at S on active seams, preventing the trivial f ≡ ⊥; (ii) S non-⊥ forces the bridge to engage the certificate machinery; (iii) inactive contexts are always completable via ⊥ and PAD.
How it can fail: If AccVar/AccCla could appear spuriously at non-block neighbors, we would misclassify seams as active. We prevent this by tying Acc● to the internal block grammar: the only roles allowed adjacent to S with Acc● are those that anchor HEAD/RID (variable) or HEAD/GID/RUN (clause); any other role adjacent to S is Neutral, as enforced by Cout–out.
Quick test: In a malformed right context, label S with O2. The neighbor is Neutral, so CertStart is rejected and no completion exists, forcing ⊥ at S (or an error-chain). In a well-formed clause context, O2 is accepted and the certificate starts.

2) Sign binding (occurrence-only palette) and RUN exposure
We adopt the occurrence-only palette at clause S: ClauseSelect ∈ {O1,O2,O3}. The sign is read from the verified RUN.
- Clause RUN: Inside wc (clause side), a radius-1 tableau encodes U(C, GID=j), exposing at fixed offsets near the interface:
  - three B-bit binary indices (i1, i2, i3) and one-hot lanes Hot(i1), Hot(i2), Hot(i3),
  - three sign bits sgn1, sgn2, sgn3 ∈ {+,−}.
- Variable RUN (optional): Inside wb (variable side), expose RID in two redundant forms: B-bit binary RIDbits and a one-hot HotRID.
- Binding rule: If S carries Op, the only enabled clause-side pointer is to the p-th occurrence’s index bits ip and sign sgnp; other occurrence pointers are disabled locally by Cout–out. The variable-side S carries VarTruth ∈ {VT,VF}.
- Sign check: Under equality (see §3), the CAP conduit requires (VarTruth = VT if sgnp=+, else VarTruth = VF if sgnp=−). There is no way to route CAP if this check fails (no Cout–out entries for a mismatched sign at the CAP seam).
Why useful here: The clause cannot cheat on the sign; the only freedom at S is selecting which occurrence p to pick, and the sign is forced by RUN. This matches the intended “pick one literal among the three.”
How it can fail: If RUN could be inconsistent or if multiple occurrence pointers were simultaneously enabled, the clause could dodge constraints. The tableau tiles enforce a single, consistent set of outputs (nearest-neighbor TM transitions), and an error-chain path is available to refute any inconsistency, which automatically deactivates the seam (Neutral role).
Quick test: Clause j with occurrences (i1=3,+),(i2=7,−),(i3=10,+). With O2 at S and equality to RID=7, CAP requires VarTruth=VF. With VarTruth=VT, CAP is disabled and the bridge fails.

3) Equality vs inequality certificates: local invariants and exclusivity
We specify the witness chains and prove exclusivity.
- Tracks and anchors at AccVar (variable side):
  - Binary RIDbits[0..B−1]; One-hot HotRID[1..2^B]; a stable pointer origin PtrRID.
- Tracks and anchors at AccCla (clause side, after selecting p):
  - Binary ip_bits[0..B−1]; One-hot Hot(ip)[1..2^B]; sign sgnp; pointer origin Ptr(ip).
- Chain types and their first steps (must start at S with CertStart):
  - Equality chain Eq: deterministically iterates b=0..B−1; at each step reads (RIDbits[b], ip_bits[b]); local rule requires equality at that bit; if it holds, advance; if a mismatch occurs, the chain dead-ends (no accepting continuation). After b=B−1 succeeds, emit CAP-Enable.
  - Inequality chain Neq: nondeterministically chooses a bit index b (via a small unary counter subchain); then reads (RIDbits[b], ip_bits[b]); local rule requires inequality at that bit; if equal, the chain dead-ends. On success, emit PAD-Enable.
- Pointer integrity: From PtrRID to RIDbits[b] (resp. Ptr(ip) to ip_bits[b]) the chain carries a bit-selector subtrack sel(b) that is checked against a de Bruijn-like local addressing pattern baked into the block; any attempt to “fake” a bit value will contradict the address/bit consistency with an immediate local mismatch. Similarly, the one-hot tracks and the selected occurrence Hot(ip) tie the binary and one-hot encodings.
- Exclusivity Lemma (E): For any active ordered pair (AccVar,AccCla) with selection p, exactly one of Eq or Neq admits a complete witness chain.
  - Proof sketch: If RID = ip, then at every b we have RIDbits[b] = ip_bits[b]. Eq progresses through all b and reaches CAP-Enable; Neq cannot pick any b with differing bits, so it dead-ends immediately for all choices. If RID ≠ ip, then there exists some b with RIDbits[b] ≠ ip_bits[b]. Neq can choose such a b and succeed (PAD-Enable); Eq necessarily fails at the first mismatched b. Radius-1 ensures that each step checks only adjacent outputs; pointer integrity prevents inventing contradictory bit values.
- CAP/PAD propagation and mutual exclusion: Cout–out allows CAP to propagate only if CAP-Enable has been emitted (i.e., Eq has fully succeeded), and PAD to propagate only if PAD-Enable has been emitted (i.e., Neq has succeeded). No rule allows both CAP and PAD simultaneously; the start token CertStart has a one-of-two production that initiates either Eq or Neq but not both.
Why useful here: This yields the intended ON/OFF split: the unique variable whose RID equals the selected occurrence ip turns the pair ON (CAP), and all other variables are OFF (PAD). It also ensures that an adversarial filler cannot bypass the ON-case by choosing the inequality chain.
How it can fail: If bit addressing could be spoofed, the filler might fabricate a mismatch (or match). We design the address path to be self-consistent and locally validated (standard binary counter lane across the RID/ip blocks); the certificate must follow these lanes, and any deviation leads to missing Cout–out entries.
Quick test (B=3): RID=5 (101), ip=5 (101): Eq reads 1=1,0=0,1=1 and enables CAP; Neq can pick b=0,1,2 but all yield equal bits, so dead-end. With RID=6 (110), ip=5 (101): Eq fails at b=0; Neq can pick b=0 (0≠1) and succeed.

4) OFF neutrality and ON enforcement
- OFF pairs (RID ≠ ip): Neq yields PAD-Enable. The only permitted fill is the PAD conduit: a regular-language subgrammar that is oblivious to VarTruth and ClauseSelect and ignores CAP. Error-chain tokens are allowed along PAD, guaranteeing completion regardless of interior content. Thus OFF pairs do not constrain f.
- ON pairs (RID = ip): Only Eq yields CAP-Enable, and the CAP seam enforces the sign check VarTruth↔sgnp. If VarTruth disagrees with sgnp, Cout–out forbids completing the CAP conduit. There is no PAD path in this case (PAD-Enable is not emitted), so the bridge fails.
Why useful here: Exactly one constrained pair per clause selection p, and its success is equivalent to the chosen literal being true under α. All other pairs are tautologies.
How it can fail: If PAD were allowed in ON pairs, constraints would be vacuous. This cannot happen because PAD-Enable is only produced by a successful Neq, which is impossible when RID=ip.
Quick test: Clause j selects O3 with ip=10 and sgn3=+. For pair (Var_10, Cl_j), ON requires VT. For (Var_11, Cl_j), OFF PAD completes trivially.

5) Type separation and availability at scale
Claim TS (Type separation and coverage). There exist 2^B distinct variable context types Var_i and 2^B distinct clause context types Cl_j realized by contexts with |w1|,|w2| ∈ {ℓ_pump, ℓ_pump+1}. Moreover, Var_i ≠ Var_{i′} for i ≠ i′ and Cl_j ≠ Cl_{j′}.
- Coverage: The block footprints (HEAD, RID/GID, RUN anchors) occupy poly(s) cells, while ℓ_pump = 2^{Θ(β^4)} = 2^{poly(s)}. Pumping and replacement allow placing these blocks adjacent to S inside wb/wc while keeping the overall type well-defined (§4, Lemmas 11–15 of the reference).
- Separation (variables): Fix any clause-type Cl_j that selects O1 with ip=i and is otherwise well-formed. For the ordered pairs (Var_i, Cl_j) and (Var_{i′}, Cl_j) with i′≠i, their boundary-extendibility signatures differ under S labels (VT vs VF) because the former admits a CAP (if the sign check is met) and the latter admits only PAD. Hence the types Var_i and Var_{i′} differ. If C does not produce such a j for some i, add a tester j⋆ in the construction with a hard-wired clause whose first occurrence equals i (validated by the same tableau), ensuring separation without relying on C’s structure.
- Separation (clauses): Symmetrically, fix a Var_i and compare Cl_j vs Cl_{j′} by picking selections that include i versus exclude i; their extendibility behavior under a fixed VarTruth differs (ON vs OFF), hence types differ.
Why useful here: Ensures we have enough active types to encode all variables and clauses, and that choices of f over these types correspond to α and clause literal picks.
How it can fail: If Acc● could be placed without the interior RUN/RID content, types might collapse. Our grammar ties Acc● to valid interior content (or to an error-chain that deactivates the seam), preventing spurious activation.
Quick test: Build two clause types Cl_j (with i in its triple) and Cl_{j′} (without i). Pair each with Var_i and set S to select the occurrence containing i: (Var_i, Cl_j) is ON; (Var_i, Cl_{j′}) is OFF. Types differ.

6) Correctness of the reduction (FFE(F1)) with the patched seam and certificates
- Completeness: Given a satisfying assignment α, define f(Var_i) = VT if α(x_i)=1 else VF; define f(Cl_j) = Op selecting any true literal p in clause(j). For any ordered pair, if it is OFF, PAD completes; if it is the ON pair (RID=ip), the Eq certificate emits CAP and the sign check is satisfied by our choice, so the bridge completes.
- Soundness: Suppose f satisfies (F1). Read α from variable types (VT/VF). For each j, O_p must be such that the ON pair (Var_{ip}, Cl_j) completes; otherwise the bridge would fail (no PAD in the equality case). Hence the selected literal is true under α, and all clauses are satisfied.
- Inactive contexts: By the seam rules, any non-⊥ at S is rejected unless the neighbor is Acc●, so f must set ⊥ on inactive types; conversely ⊥ always completes via PAD. Thus inactive contexts impose no constraints.
- No trivialization via ⊥: On active seams, ⊥ at S is locally rejected; hence f cannot trivialize (F1) by using ⊥.
Why useful here: These arguments, now anchored in explicit seam rules and exclusive certificates, close the two key soundness/completeness gaps under the β-normalized, radius-1 model.
How it can fail: If PAD were allowed adjacent to S under non-⊥, an adversary could bypass ON. Our seam+certificate rules forbid PAD unless Neq succeeds (RID≠ip), eliminating this loophole.
Quick test (B=2 worked micro-instance): Variables {x1..x4}, clause j with (x3 ∨ ¬x1 ∨ x4). If α=(x1=0,x3=1,x4=0), set f(Var_3)=VT, f(Cl_j)=O1; only (Var_3, Cl_j) is ON and succeeds; (Var_1, Cl_j),(Var_4, Cl_j) are OFF and PAD-fillable; all other ordered pairs trivial.

7) Size, radius, and locality checks
- Radius-1: All checks are between adjacent nodes: seam handshakes, certificate steps (bit-by-bit compare along pointer lanes), CAP/PAD conduits, and RUN row transitions.
- Alphabet size β: Constant-number of role/phase/handshake tokens; equality/inequality chains add O(1) symbols; RID/GID/RUN alphabets are poly(s); overall |Σ_out| = β = poly(s).
- Type count: ℓ_pump ≤ 2^{Θ(β^4)} = 2^{poly(s)}; enough to realize 2^B active types.
- Error-chains: As in the reference §3, malformed headers or inconsistent RUN rows are locally refutable and lead to Neutral seams (allowing ⊥/PAD), never to Acc●.

8) Why we do not trivialize (F2) here
To avoid the pitfall identified by the verifier (⊥ at S trivializing (F1)), we keep (F2) as in the reference (finite z checks in the upper bound) and prove NEXPTIME-hardness for FFE(F1). This already implies NEXPTIME-hardness for the three-way classification (the algorithm must distinguish at least between Θ(log* n) and Θ(n) on our family).

What changed/was fixed this round (vs. Round 0002)
- Added explicit seam rules forbidding ⊥ at S on active seams and forcing CertStart.
- Adopted occurrence-only clause palette; bound the sign to RUN; eliminated any opportunity to choose a sign at S.
- Stated and justified the exclusivity lemma for equality vs inequality witnesses, with local invariants (pointer integrity, bit checks) and mutual exclusion of CAP/PAD.
- Clarified OFF neutrality and ON enforcement via CAP/PAD-Enable gates.
- Provided a robust type-separation argument with an optional tester clause j⋆ for worst-case C.

Open items and next steps
- Write a concrete micro-table for the seam edges (enumerate Cout–out entries for pairs among {AccVar,AccCla,Neutral}×{VT,VF,O1,O2,O3,⊥,CertStart,CAP,PAD}).
- Spell out the de Bruijn-like addressing and the exact pointer tiles from PtrRID/Ptr(ip) to RIDbits[b]/ip_bits[b]; prove that any deviation is caught in ≤2 local steps.
- Produce an explicit RUN tile set for U with fixed phases and the exposure of (i1,i2,i3) and (sgn1,sgn2,sgn3); include the error-chain tiles and show bounded local refutations for all malformed patterns.
- Work out the full B=2 DP table on 12 ordered pairs to sanity-check exclusivity, sign binding, OFF neutrality, and active-⊥ forbiddance.

## Round 0003 — 2025-08-27T11:30:44.028451Z

Mini-plan
- Pin down the S-seam gadget: explicit tokens and two families of edge rules that (i) forbid ⊥ at S on active contexts and (ii) allow PAD on inactive ones. Make activation depend only on a constant-size input code around S so it is type-local and radius-1 enforceable.
- Prove Exclusivity Lemma for equality/inequality witnesses: give the invariant (one-hot RID, binary ip, integrity of pointers), and the per-bit comparator tiles so exactly one certificate is realizable.
- Bind sign to RUN and avoid clause-side sign cheats: use S palette {O1,O2,O3} only; the selected occurrence’s sign is exported from RUN into the ON check.
- Show OFF pairs and inactive contexts are neutral: they always have a PAD/⊥ completion and impose no constraints on f.
- Address (F2): argue that our bridge interacts only with the nearest blocks; repetitions add disjoint, self-satisfying structure, hence for our family (F2) holds automatically once (F1) does. Give a local “barrier” that cuts witness chains at one block away from S.
- Validate with a B=2 toy: list the S-seam tokens on the four seam-adjacent nodes, simulate the witness chain on one ON and one OFF pair, and show ⊥ at S is rejected only in active contexts.

1) S-seam gadget with input-coded activation (explicit tokens and local rules)
Definition (tokens and code).
- S tokens: ΣS = {⊥, O1, O2, O3} (occurrence-only palette).
- Left seam-adjacent node uL (immediately left of the left S node) and right seam-adjacent node vR (immediately right of the right S node) carry special seam-interface roles:
  - DoorVar on uL when left side is variable-active; DoorPAD otherwise.
  - DoorCl on vR when right side is clause-active; DoorPAD otherwise.
- Activation code (input-only): we reserve a 2-bit code on each of uL and vR using the node’s own input bit and its predecessor’s input bit (both are available in the two-node S-window contexts). Concretely, we treat the input bit of uL, vR and the bit of their predecessor as “flags” that Cin–out checks to gate the role subtrack:
  - Code 10 on uL (meaning: pred(uL).in=1, uL.in=0) enables only DoorVar; all other outputs at uL are forbidden by Cin–out.
  - Code 01 on vR (meaning: pred(vR).in=0, vR.in=1) enables only DoorCl; all other outputs at vR are forbidden by Cin–out.
  - Any other code enables only DoorPAD at that node.
- Seam edges (Cout–out) enforce:
  - (DoorVar) — (O1|O2|O3) allowed; (DoorVar) — (⊥) forbidden.
  - (O1|O2|O3) — (DoorCl) allowed; (⊥) — (DoorCl) forbidden.
  - (DoorPAD) — (any S token) allowed; (any S token) — (DoorPAD) allowed (inactive side is neutral at seam).
- Inside the left/right blocks (wb/wc), Cout–out enforces a unique expansion from DoorVar/DoorCl: they must start a well-formed block of the designated role (variable/clause) with header HEADC (fixed), RID/GID segments, and RUN tableau (Section 3 recipe). DoorPAD starts a locally consistent PAD sublanguage independent of S.
Why useful here: This forces non-⊥ at S when both sides exhibit the activation code (active context), while keeping inactive contexts neutral: DoorPAD tolerates any S token including ⊥. Activation depends only on constant many nearby input bits and radius-1 seam edges.
How it can fail:
- If the activation code cannot be recognized with r=1, we would leak to nonlocal checks. Here we use only the node’s own input and its predecessor’s input, which Cin–out can gate (per-node pair check), and seam edges are between neighbors.
- If the DP can avoid DoorVar/DoorCl by choosing other outputs: forbidden by Cin–out under the 10/01 codes (they make DoorVar/DoorCl the only legal outputs on those nodes).
Quick test (hand check): choose inputs so that pred(uL).in=1, uL.in=0, pred(vR).in=0, vR.in=1; then uL must output DoorVar, vR must output DoorCl by Cin–out; hence S=⊥ fails at both seam edges. Flip any one flag (e.g., pred(uL).in:=0): Cin–out now allows only DoorPAD at uL; S=⊥ is accepted at that seam.

2) Equality/inequality witness exclusivity (radius-1 certificates)
Claim E (Exclusivity of equality vs inequality certificates). In an active pair where DoorVar (left) and DoorCl (right) start well-formed blocks, and S is O_p selecting occurrence p, exactly one of the following radius-1 witness chains is realizable:
- Equality chain: follows a pointer from S to the clause’s index ip (in binary lanes b=1..B), and from DoorVar to the RID index iL (HotRID one-hot and its binary), and steps bit-by-bit along both binary representations enforcing equality at each bit; only if all bits match does the chain reach a CAP emitter that allows CAP propagation across S. Any mismatch yields a dead end.
- Inequality chain: guesses a bit position b via a bounded fan-out chain from S, steps to the b-th bit lane on both sides, and demands a local mismatch predicate (RID[b] ≠ ip[b]) to reach a PAD emitter that forbids CAP and completes with PAD.
Invariant and tiles:
- Integrity: RID has a one-hot encoding HotRID; its binary RID[b] is also exported on B lanes with local equality between the one-hot position and the binary value; similarly ip has binary lanes exported by RUN. Local Cout–out tiles enforce these equalities and ensure uniqueness.
- Comparator tiles:
  - Equality tile for bit b: requires RID[b]=ip[b], else no outgoing edge.
  - Inequality tile for bit b: requires RID[b]≠ip[b], else no outgoing edge.
- Chain structure: both chains are simple nearest-neighbor cursors. Equality must visit all B bit lanes (fixed-length path) and only then may emit CAP; inequality visits a chosen b and only emits PAD if mismatch holds.
Why useful here: It ensures per (Var_i, Cl_j, O_p) exactly one bridge semantics applies: ON (CAP) if i=ip, OFF (PAD) otherwise. This gives the “one constrained pair per clause pick.”
How it can fail:
- Faking mismatch when equal: impossible because the inequality tile for bit b has no legal continuation if RID[b]=ip[b].
- Faking equality when different: the equality chain stalls at the first b with RID[b]≠ip[b]. There is no alternate bypass due to the uniqueness of the cursor track enforced by Cout–out.
Quick test (B=3): RID=101 (5), ip=111 (7). Equality chain: at b=2 sees 0 vs 1 → dead end. Inequality chain: pick b=2, demands 0≠1 → succeeds; emits PAD.

3) Sign binding via occurrence-only S palette
Claim S (Occurrence-only selection; sign tied to RUN). The clause-side RUN computes for j=GID: three indices (i1,i2,i3) and their signs (sgn1,sgn2,sgn3), exposing binary lanes for indices and one-bit signs per occurrence. The S palette is ΣS={O1,O2,O3}. If S=Op, the equality chain uses ip and the ON-bridge demands VT iff sgnp=+ and VF iff sgnp=− (VT/VF are the two variable-side colors). No sign appears in S;
Cout–out contains local tiles that read sgnp from RUN at the end of the equality chain to gate the CAP emitter (mismatch of variable color vs sgnp blocks CAP).
Why useful here: Prevents “sign cheating” at S and collapses the clause pick to the intended occurrence choice; the sign is immutable (verified by the tableau) and locally read.
How it can fail:
- If RUN could expose multiple inconsistent signs: disallowed by the tableau consistency and single-row export; inconsistencies are locally refuted (error chain), which deactivates the context (only DoorPAD remains legal at the seam via Cin–out code mismatch).
- If S could carry sign: by construction it does not; ΣS lacks sign tokens.
Quick test: Clause j encodes (x3, ¬x7, x10). S=O2; equality O2 with Var_7 succeeds only if left S color is VF; with Var_7 color VT, the CAP gate blocks.

4) OFF pairs and inactive contexts are neutral
Claim N (Neutrality). For any ordered pair where either (i) the activation code does not hold on at least one side (so that side is DoorPAD), or (ii) S=Op but iL≠ip (inequality), or (iii) roles are not (variable, clause), there exists a PAD-only completion independent of f’s other choices. This is implemented by:
- DoorPAD forcing a PAD sublanguage chunk adjacent to S that is seam-compatible with any S token; the remainder of wb/wc can be filled with PAD or well-formed blocks that terminate internally (no CAP).
- Inequality chain emission of PAD, which is the only admissible completion when iL≠ip.
Why useful here: This eliminates spurious constraints from nonselected pairs and from inputs lacking activation codes. Only ON cases constrain f.
How it can fail:
- If PAD conflicts with nearby mandatory block starts: prevented by using Cin–out to permit only DoorPAD (not DoorVar/Cl) when activation code is absent; the PAD language is self-contained and seam-compatible.
- If PAD could carry CAP: prohibited; PAD emitters never produce CAP and Cout–out forbids CAP adjacency except from the equality chain’s emitter.
Quick test: Left inactive (DoorPAD), right active (DoorCl), S arbitrary. The seam edges accept; both wb and wc can be filled by PAD (on left) and a proper block (on right) whose “barriers” (see next claim) absorb internally; DP succeeds.

5) Bridging (F2) holds automatically for our family
Claim B (Nearest-block locality; barriers cut repetition). For any context (w1, S, w2) activated on both sides, and any z≥1, the repeated bridge wz_1 S wz_2 has a completion whenever the base bridge w1 S w2 has one. Reason: the only interactions with S are (a) the seam edges DoorVar/Cl — S and (b) the equality/inequality witness chains, both of which operate exclusively within the nearest blocks contiguous to S, terminated by a local “barrier” token one node beyond the RUN footer that refuses witness cursors. Blocks beyond the nearest ones are separated by barriers and have an internal “sink” completion (PAD-neutral endcaps). Therefore, adding extra copies of w1 or w2 does not introduce any additional seam constraints; all seams between adjacent copies are block-internal and satisfy Cout–out by the block grammar.
Why useful here: We avoid the need to trivialize (F2) via ⊥. With barriers, (F2) is independent of z and thus holds iff the base ON/OFF semantics allow the nearest left/right blocks.
How it can fail:
- If witness chains could jump barriers: prevented by local tiles that forbid the cursor token from crossing the barrier symbols.
- If blocks required cross-copy synchronization: they do not; RUN is self-contained per block and Cout–out only relates neighbors;
repeated copies simply obey the same tiles.
Quick test: Evaluate w1 S w2 with S=O2, success on equality → CAP. Now consider w1^5 S w2^7. The nearest copies to S are identical; their barriers stop any further traversal; the rest can be tiled independently. DP outcome identical.

6) B=2 toy worked seam and bridge
Setup: B=2 so variables x0..x3; pick clause j with (i1=01:+), (i2=10:−), (i3=11:+). Choose inputs around S to encode activation code 10 at uL and 01 at vR, hence Cin–out forces DoorVar at uL and DoorCl at vR.
- Pair (Var_10, Cl_j, S=O2): Equality path: RID=10, ip=10 → equality passes; RUN exposes sgn2=−; CAP emitter requires left S color VF; if we set left S color VF, CAP propagates and DP completes; if VT, the CAP gate blocks and DP fails. Inequality path is blocked since all bits equal.
- Pair (Var_01, Cl_j, S=O2): RID=01, ip=10 differ at b=1; equality chain stalls at b=1; inequality chain pins b=1 and succeeds, emits PAD; DP completes with PAD plumbing and no CAP dependency.
- ⊥ at S: With activation code present, uL is DoorVar and vR is DoorCl, and (DoorVar,⊥) or (⊥,DoorCl) are forbidden at both seam edges; hence DP fails. Remove activation on left (flip pred(uL).in), DoorPAD appears; (DoorPAD,⊥) allowed, DP succeeds.

7) Soundness/completeness of the succinct-SAT reduction (recap under the patched gadget)
- Variables: for each active Var_i type, f(Var_i) ∈ {VT,VF} encodes α(x_i).
- Clauses: for each active Cl_j type, f(Cl_j) ∈ {O1,O2,O3} selects an occurrence p.
- Constraints: by Claim E and S, the only nontrivial bridge per j is with (Var_{i_p}, Cl_j, S=Op), which succeeds iff α(x_{i_p}) matches sgn_p. All other ordered pairs are neutral by Claim N.
- Therefore, (F1) holds iff there exist α and picks p_j such that each clause has a satisfied literal: exactly Succinct-3SAT for C.
- By Claim B, (F2) holds automatically for our family (nearest-block locality with barriers), ensuring that if (F1) holds then f is fully feasible (O(1) side); if (F1) fails then by Theorem 8 (reference) the complexity is Θ(n), giving the desired O(1) vs Θ(n) dichotomy on our instances.

What changed vs previous round (addressing verifier’s gaps)
- Forbid ⊥ at S on active contexts: implemented by Cin–out seam code (10 at uL, 01 at vR) forcing DoorVar/DoorCl and Cout–out disallowing ⊥ adjacent to those. Inactive contexts (other codes) get DoorPAD and remain neutral.
- Sign bound to RUN: S palette is occurrence-only; sign is read from RUN in the equality chain’s CAP gate.
- Exclusivity: Equality/inequality witnesses are backed by explicit per-bit tiles and cursor tracks with one-hot and binary consistency; we argued both directions cannot succeed simultaneously.
- (F2) no longer “trivialized by ⊥”: instead, we ensure bridge locality and add block-internal barriers so repetitions do not affect the S-bridge. This preserves nontriviality of (F1) while still making (F2) automatically hold for our reduction family.

Open edge cases and quick counterexample probes
- Could DP choose to label an active-coded seam node (code 10/01) with DoorPAD to allow ⊥? No: Cin–out at those nodes only permits DoorVar/DoorCl under that code.
- Could DP avoid blocks behind DoorVar/DoorCl? No: Cout–out enforces a unique expansion starting from DoorVar/DoorCl into a well-formed block prefix; deviations are locally rejected.
- Could extra copies in wz_1,wz_2 inject an unexpected ON? No: barriers forbid cursor tokens from crossing block boundaries beyond the nearest; only the nearest block talks to S.

Summary impact
- We now have a radius-1, β-normalized seam and bridge specification that (i) activates constraints precisely where intended, (ii) forbids ⊥ at S on active contexts, (iii) ties sign to RUN, (iv) grants exclusivity of equality/inequality witnesses, (v) renders (F2) independent of z via nearest-block locality and barriers.
- The reduction to Succinct-3SAT remains intact and cleaner: the implicit exponential SAT constraints are exactly of the form “if S picks Op then Var_{i_p} must have color matching sgn_p”, with all other pairs neutral.

## Round 0004 — 2025-08-27T14:50:46.086564Z

Mini-plan for this round
- Freeze the seam gadget as radius-1, type-local, with two S-nodes S1 (variable side) and S2 (clause side). Give explicit allowed-pair tables on the three edges (Lbound→S1), (S1→S2), (S2→Rbound) to (i) forbid ⊥ at S on active seams, (ii) start a certificate only if both sides offer, and (iii) gate CAP/PAD.
- Instantiate equality/inequality certificates with pointer-integrity tiles and per-bit comparator tiles; state exclusivity precisely and show which out–out pairs enforce it.
- Introduce nearest-block barriers one node past the RUN footer; show they kill cursors and thus make (F2) independent of the repetition count z without trivializing (F1).
- Give a B=2 worked DP trace for one ON and one OFF pair.
- Note gaps in outputs.md: (a) B.6 trivializes (F2) via ⊥ on repeats; we replace this by barrier-based (F2). (b) S had a single palette {RED,GRN,BLU,⊥}; we split into S1∈{VT,VF,⊥} and S2∈{O1,O2,O3,⊥} and bind sign to RUN.

A. Explicit seam rules (radius-1, type-local)
Tokens (constant-size tracks)
- BlockRole on seam-adjacent neighbors (one node away from S):
  - VarSide: RoleL ∈ {AccVar, NeutralVar, BarVar}
  - ClauseSide: RoleR ∈ {AccCla, NeutralCla, BarCla}
- S-palettes:
  - S1 ∈ {⊥, VTidle, VFidle, EqStart, NeqStart, CAP, PAD}
  - S2 ∈ {⊥, O1idle, O2idle, O3idle, EqStart, NeqStart, CAP, PAD}
  Here “idle” variants carry the long-lived choice (VT/VF on S1, Op on S2). EqStart/NeqStart/CAP/PAD are the (short) cursor tokens on the central seam; they are disallowed at the two outer seams (see below).
- Offer/NoOffer (encoded in Role●): AccVar/AccCla emit Offer; Neutral●/Bar● emit NoOffer (a subtrack bit embedded in Role● symbols).
- Barrier tokens: BarVar, BarCla (only at the first node beyond each RUN footer).

Edge (out–out) tables at the three seams
1) Left seam (Lbound→S1):
- (AccVar, S1∈{VTidle, VFidle}) allowed; (AccVar, S1=⊥) forbidden; (AccVar, S1∈{EqStart,NeqStart,CAP,PAD}) forbidden.
- (NeutralVar, S1=⊥) allowed; (NeutralVar, S1≠⊥) forbidden.
- (BarVar, any S1) allowed only if S1=⊥ (BarVar acts like Neutral at the seam and blocks cursors; see barriers below).
Intuition: Active left forces non-⊥ and freezes S1 to an idle truth token; inactive/Bar forces ⊥.

2) Right seam (S2→Rbound):
- (S2∈{O1idle,O2idle,O3idle}, AccCla) allowed; (⊥, AccCla) forbidden; (S2∈{EqStart,NeqStart,CAP,PAD}, AccCla) forbidden.
- (⊥, NeutralCla) allowed; (non-⊥, NeutralCla) forbidden.
- (⊥, BarCla) allowed; (non-⊥, BarCla) forbidden.
Intuition: Active right forces non-⊥ and freezes S2 to an idle occurrence; inactive/Bar forces ⊥.

3) Central seam (S1→S2): three phases
- Idle alignment: allowed pairs are exactly (VTidle, Op_idle) for Op∈{O1idle,O2idle,O3idle}, i.e., the pair that carries both idle choices. No other cross-idle pairs are permitted.
- Certificate start: EqStart/NeqStart may appear on the central seam only as (EqStart,EqStart) or (NeqStart,NeqStart); moreover, these pairs are allowed only if S1’s left neighbor is AccVar and S2’s right neighbor is AccCla (this is enforced by the outer seam tables above: S1/S2 cannot hold EqStart/NeqStart unless the outer seams admitted the corresponding idle choices).
- CAP/PAD emission: (CAP,CAP) and (PAD,PAD) are the only accepting terminal pairs on the central seam, enabled by the certificate success states (see Section B). No cross CAP/PAD mix is allowed.
Remarks: These three central-seam clauses implement “both-sides offer” (both outer seams must be active to ever place EqStart/NeqStart) and mutual exclusion of CAP/PAD, with radius-1 consistency (each seam checks a pair of adjacent symbols only).

B. Equality/inequality certificates (pointer integrity and exclusivity)
Local lanes near S
- Variable block exports, adjacent to its AccVar interface:
  - RIDbits[b] ∈ {0,1} for b=0..B−1 on fixed bit lanes;
  - HotRID one-hot over B positions; a “lane glue” subtrack ties HotRID’s unique 1 to the RIDbits encoding (standard local consistency: each lane carries its bit value; the unique HotRID=1 cell carries a “match” mark, and per-lane tiles enforce that the marked lane bit equals the global RIDbits pattern; any mismatch triggers the error-chain and kills Offer).
- Clause block exports, adjacent to its AccCla interface:
  - For each p∈{1,2,3}, ip_bits[b] on bit lanes, with a Selected pointer subtrack that equals ip_bits when S2 chose Op (the Selected track is writable only when O_p’s own “phase” bit coming from RUN is present; otherwise error-chain);
  - Sign sgn[p] ∈ {+,−} on a 1-bit lane, likewise tied to the chosen Op via the same Selected mechanism.
- Cursor lanes: a 1-cell-wide corridor along which the Eq/Neq cursor walks: S1→left lanes (RIDbits), returns to S1, crosses to S2, walks to right lanes (ip_bits), returns; or equivalently, two unidirectional cursors EqL and EqR with a central handshaking at S1/S2 (both treatments can be reduced to radius-1 pair checks; we take the latter).

Cursor tokens and tiles
- EqL[b], EqR[b]: equality cursors at bit b on left/right sides, with b encoded in unary across a short address subtrack of length B (a standard “ruler” pattern so the cursor can locally enforce that it is at position b and moves to b+1 only from b).
- NeqPick[b], NeqCheckL[b], NeqCheckR[b]: inequality cursors that (i) nondeterministically pick b at S (through NeqStart), (ii) visit RIDbits[b] and ip_bits[b] to check a mismatch.
- Update/acceptance tiles (all are out–out pairs on adjacent edges):
  - EqL[b] requires RIDbits[b] = ip_bits[b] (seen via the central seam handshaking; concretely: S1 holds EqL[b] and S2 holds EqR[b]; the allowed pair (EqL[b],EqR[b]) is present only if a third read-only subtrack on each side encodes the respective bit values and they match; this read-only subtrack is part of S1/S2 labels and is copied from the adjacent lanes at AccVar/AccCla by local consistency). EqL[b]→EqL[b+1] is allowed iff (RIDbits[b] = ip_bits[b]); EqL[B] emits CAP at S1; EqR mirrors this.
  - NeqCheckL[b]/NeqCheckR[b] require RIDbits[b] ≠ ip_bits[b] (same handshaking idea); upon success, emit PAD at S1/S2.
  - No tile allows Eq and Neq to be both present.
- Sign binding (on CAP only): The (CAP,CAP) central pair is allowed only if the S1 idle truth matches the chosen sign sgn[p] exported by RUN (a read-only bit on S2 that is tied to Op via Selected). Concretely, (CAP,CAP) is allowed iff (S1 carried VTidle and sgn[p]=+) or (S1 carried VFidle and sgn[p]=−). This prohibits a CAP completion on a mismatched sign.

Exclusivity lemma (radius-1)
Claim E’. For any active pair (AccVar on the left, AccCla on the right) and chosen Op, exactly one of Eq or Neq can reach its terminal (CAP vs PAD):
- If RID = ip, then for all b, RIDbits[b]=ip_bits[b] holds locally; Eq’s per-bit tiles propagate to b=B and emit CAP; Neq cannot place NeqCheck at any b (mismatch predicate never true), hence no PAD.
- If RID ≠ ip, then there exists b with RIDbits[b]≠ip_bits[b]; Neq can pick such b and reach PAD; Eq stalls at the first mismatching b and never reaches CAP.
Pointer integrity and read-only mirroring of bit values at S1/S2 ensure no spoofing; any inconsistency on Selected or the RUN lanes is locally refutable by the error-chain, which removes Offer (makes the seam inactive).

C. Nearest-block barriers and (F2)
Barrier placement and local rules
- Each well-formed block (both Var and Clause) ends with a fixed footer token Footer, followed immediately by a barrier token BarVar (left side) or BarCla (right side) at the seam-adjacent interior node one step beyond RUN. The block grammar enforces (Footer→Barrier) by Cout–out within the block. Malformed blocks cannot produce Footer and thus cannot produce Bar●; they must switch to the error-chain which never emits Offer and thus behave as Neutral.
- The barrier forbids cursor tokens: on the edges (Barrier↔next) and (prev↔Barrier) we allow only PAD plumbing and forbid any Eq/Neq/CAP/PAD cursor token. Moreover, Role●=Bar● at the seam-adjacent interior node forces the seam to be treated as Neutral (see A.1–2).

Why (F2) holds automatically on our instances
- Only the nearest blocks can emit Offer and accept EqStart/NeqStart: the Offer/Acc● roles are placed at the unique seam-interface of a block; beyond Footer+Barrier no other role can emit Offer, and barriers kill cursors within one step.
- Therefore, the presence of extra repeats wz on either side has no effect on the S-bridge: (i) if the base bridge is active, the same Eq/Neq check runs entirely within the nearest blocks; (ii) if the base bridge is inactive or OFF, PAD-only conduits complete regardless of repeats; all interior seams between repeated copies are block-internal and satisfiable by the block grammar.
Formal consequence: For any fixed context (w1,S,w2), the success/failure of the bridge on wz1 S wz2 is identical to that on w1 S w2, for all z≥1. Hence once (F1) holds, (F2) holds automatically on our reduction family.

D. B=2 worked DP trace
Setup
- Variable block with RID=10 (x2), AccVar adjacent to S1; Clause block for clause j with occurrences: (i1=01,+), (i2=10,−), (i3=11,+), AccCla adjacent to S2. Both blocks ‘Offer’ at their interfaces (AccVar/AccCla), so outer seam forbids ⊥ at S1/S2.
Case ON: select O2, set S1=VFidle (since sgn2=−)
- Left seam: (AccVar, VFidle) allowed.
- Right seam: (O2idle, AccCla) allowed.
- Central seam idle pair: (VFidle, O2idle) allowed.
- Certificate: EqStart placed at (S1,S2); EqL[0]/EqR[0] read RIDbits[0]=0, ip_bits[0]=0 (match)→advance; EqL[1]/EqR[1] read RIDbits[1]=1, ip_bits[1]=1 (match)→advance; at b=2=B, emit (CAP,CAP) on the central seam.
- CAP gate: (CAP,CAP) allowed only if sgn2=− and S1 had VFidle: holds; acceptance.
Case OFF: select O1, S1 arbitrary
- With O1idle at S2 and RID=10 vs ip=01, Eq stalls at b=0 (0=0 ok) then b=1 sees 1≠0: no tile allows EqL[1]/EqR[1], so Eq fails.
- Neq: pick b=1; NeqCheckL[1]/NeqCheckR[1] sees 1≠0 and emits (PAD,PAD) which is accepted on the central seam; barriers prevent any further propagation; acceptance independent of S1’s VT/VF.
Edge-check: Attempt S1=⊥ or S2=⊥ on these active seams is rejected by outer seam tables.

E. Notes on type coverage and separation (no j⋆ needed)
- Coverage: Pumping and replacement guarantee contexts exist with a well-formed variable block of any chosen RID adjacent to S and conversely for any clause GID; malformed blocks are neutral. Hence for each i and j there exist active context types realizing “Var(i)” (some right filler) and “Clause(j)” (some left filler).
- Separation for reduction: We do not require a one-to-one mapping Var_i↔type for all i. It suffices that for each i there exists at least one active left-type realizing RID=i and for each j at least one active right-type realizing GID=j; the (F1) constraints across all ordered pairs still encode the succinct CNF exactly (every pair (Var(i), Clause(j)) imposes ON iff i equals the selected occurrence, and OFF otherwise). Multiple left-types realizing the same i impose the same constraints and can be set consistently by the same α(x_i).

F. Corrections and gaps in outputs.md
- Single-S palette vs split palettes: Section B.3 of outputs.md used a single S with {RED,GRN,BLU,⊥}. Our seam now uses two S-nodes with S1∈{VT,VF,⊥} and S2∈{O1,O2,O3,⊥}, with sign bound to RUN via the CAP gate. This removes the sign-cheat and ⊥-trivialization problems.
- Trivializing (F2) via ⊥ (outputs.md, B.6): Allowing arbitrary ⊥ on repeats risks leaking into bridges and undermining (F1). We instead enforce nearest-block barriers that locally block cursors and Offer beyond the first block; (F2) then holds automatically for our family without changing the (F1) constraints.

G. Why this still yields NEXPTIME-hardness for (F1) and the full classification
- With the above seam and certificates, the mid-consistency constraints (F1) encode Succinct-3SAT exactly: choose f(Var(i))∈{VT,VF} as α(x_i), and f(Cl(j))∈{O1,O2,O3}; then (Var(i),Cl(j)) bridge succeeds iff either OFF (i≠i_p) or ON with truth matching sign (i=ip and α satisfies the chosen literal). Conversely, any f satisfying (F1) yields a satisfying α.
- By barriers, (F2) holds automatically on the constructed instances; hence the three-way classifier must distinguish O(1) (if ΦC is satisfiable) from Θ(n) (otherwise), establishing NEXPTIME-hardness for the classification.

H. Next steps to further solidify
- List the exact local tiles (as out–out pairs) tying HotRID↔RIDbits and Selected(ip)↔RUN, and the error-chain tiles that deactivate malformed blocks.
- Tabulate the central seam pairs for Eq/Neq at b=0,1,2 and CAP/PAD for B=2 (a small explicit table the verifier can check by hand).
- Give the short proof sketches that (i) S1/S2 cannot hold EqStart/NeqStart unless both outer seams are active (follows from the seam tables), and (ii) barriers forbid cursor propagation in ≤1 step.
- Provide a micro-alphabet count showing |Σout|=β=poly(s) after adding the new tokens and that ℓpump=2Θ(β^4)≫poly(s) remains.

I. Quick sanity probes and how they are blocked
- Try PAD on ON: PAD central pair requires Neq success; impossible if RID=ip; (PAD,PAD) pair disallowed without Neq.
- Try ⊥ at S on active: outer seam tables forbid (AccVar,⊥) and (⊥,AccCla).
- Spoof sign: CAP central pair checks S1’s VT/VF against sgn[p] copied from RUN; mismatched pair disallowed.
- Cross into non-nearest blocks: barrier tokens BarVar/BarCla forbid cursor tokens and force seam neutrality.

This round’s deliverables
- Seam tables around S1/S2, including Offer/NoOffer, idle, start, and CAP/PAD pairs.
- Equality/inequality cursor tokens and comparator semantics; exclusivity statement with locality justification.
- Barrier tokens and proof sketch for (F2) locality.
- A B=2 ON/OFF DP trace.

These meet the verifier’s action items: explicit seam tables, bit-comparator/pointer-integrity scheme, barrier tokens and short proof, and a B=2 worked example. Pending: transcribe the comparator and Selected/HotRID integrity into a small explicit set of out–out pairs and count the symbols to reconfirm β=poly(s).

