## Round 0001 — 2025-08-28T11:34:40.081926Z

Status and goal
- Target: Show NEXPTIME-hardness of the 3-way classification problem for β-normalized, radius-1 LCLs on globally oriented paths: decide whether the LOCAL complexity is O(1) vs. Ω(log* n) vs. Ω(n).
- Strategy adopted: Factor classification through the “feasible function” certificates that characterize the two gaps on paths/cycles (Balliu–Brandt–Chang–Olivetti–Rabie–Suomela, §4). Prove:
  1) Feasible-Function Existence for r=1, β-normalized LCLs is NEXPTIME-complete (mid-consistency (F1) only).
  2) Reduce this to the 3-way classification by neutralizing bridging (F2) so that instances in the image are either O(1) (if (F1) holds) or Ω(n) (if (F1) fails), hence the 3-way decision is at least as hard.
  3) Record a tight, finite verification procedure for (F1)+(F2) in 2^{poly(β)} to support membership (optional).

Quick recap of types/pumping for r=1 (specialized bounds)
- Boundary sets (radius r=1): B1 = {first, last}, B2 = {second, second-to-last}. The type of a path is determined by (i) its 4 boundary input bits and (ii) the extendibility bit-vector for all β^4 assignments of outputs to B1∪B2. Hence the number of types is
  |Types| ≤ 2^4 · 2^{β^4} = 2^{β^4+4} =: ℓ_pump.
- Pumping and replacement follow §4, Lemmas 10–15: same-type replacement preserves extendibility and local legality; for any nonempty w there exist a,b>0 with a+b ≤ ℓ_pump such that Type(w^{a t+b}) is t-invariant. We will use these facts repeatedly to (i) realize “active” contexts of the needed form and (ii) bound finite checks below.

Finite check for bridging (F2)
- For any fixed context (w1,S,w2) with |w_i|∈{ℓ_pump,ℓ_pump+1} and |S|=2, the type of w1^z S w2^z depends only on the pair (Type(w1^z), Type(w2^z)). By periodicity of w_i (Lemma 15), each side cycles with period ≤ ℓ_pump after ≤ ℓ_pump prefix, hence the pair takes ≤ ℓ_pump^2 values. Therefore there exists Z ≤ ℓ_pump^2 such that (F2) holds iff the partial labeling on S extends for all z∈{1,…,Z}.
- Verification of extension on a partially labeled path is a standard layered-DAG DP in O(k β^2) time for a path of length k: layer i keeps allowed outputs matching Cin–out (and any forced output); edges between adjacent layers match Cout–out.

NEXPTIME upper bound for Feasible-Function Existence (supporting algorithmics)
- Precompute all types in time 2^{poly(β)} by exploring the boundary-extendibility DFA (composition Lemma 12); set ℓ_pump = |Types|.
- Let C be the set of context types realized by w1 S w2 with |w_i|∈{ℓ_pump,ℓ_pump+1}. Nondeterministically guess f: C→Σ_out^2. Verify:
  (V1) Mid-consistency (F1): For every ordered pair of contexts, run the DP on wa S1 wb wc S2 wd with S1,S2 forced to f; accept iff extendible.
  (V2) Bridging (F2): For each context (w1,S,w2) and each z ≤ Z:=ℓ_pump^2, run the DP on w1^z S w2^z with S forced to f.
- Complexity: 2^{poly(β)} overall; sound/complete for feasible-function existence.

Hardness core: Feasible-Function Existence (F1) is NEXPTIME-hard
- Source: Succinct-3SAT (circuit C of size s “generates” a 3-CNF Φ_C over 2^B variables); NEXPTIME-complete.
- Parameters: choose B = s^{c0}, β = s^{c1} for constants 1 ≪ c0 ≪ c1. Then ℓ_pump = 2^{Θ(β^4)} = 2^{poly(s)}.
- Target instance P_C (β-normalized, r=1): Σ_in={0,1}; Σ_out of size β contains constant tracks: role/phase, three colors {RED,GRN,BLU} and a neutral ⊥, a finite error-alphabet, and a constant work alphabet for a fixed universal TM U.
- Well-formed block language (output-regular, radius-1 checkable): a block = HEAD_C · RID · GID · RUN · PAD laid out along the path. Cin–out enforces that role symbols copy designated input bits (so nodes in HEAD_C positions must see the corresponding input header bit). Cout–out enforces adjacency, phase progress, and single-step consistency of U across seams; malformed fragments admit locally checkable “error chains” (as in §3) that always yield completions and hence never constrain f.
- Semantics: the 2-node window S admits only colors or ⊥. Non-⊥ at S “activates” a witness-chain gadget: an existential pointer (radius-1) that (i) chooses an index i, (ii) walks to bit i inside the left block (variable) and checks Hot_RID[i]=1, and (iii) walks to bit i inside the right block (clause) and checks V^{(+)}[i]=1 (for RED) or V^{(-)}[i]=1 (for GRN). If any subcheck fails the chain gets stuck → no completion. When S=⊥, a self-looping ⊥-plumbing language (independent of input) always completes. Thus inactive contexts (no valid block on either side) are tautologically satisfied by f(·)=⊥.
- Existence of exponentially many active context types: Since the HEAD+RID/GID+RUN length is poly(s) ≪ ℓ_pump, pumping/replacement allow us to realize, within contexts (length ≈ℓ_pump), many variants where the left side encodes any RID∈{0,1}^B and the right side encodes any GID∈{0,1}^B. Types differing in RID (or GID) are distinct because extendibility from S depends on Hot_RID and V^{(·)} at the chosen i. Hence we obtain 2^B variable-types {Var_i} and 2^B clause-types {Cl_j} in the context set C.
- Correctness of reduction:
  • Completeness: If Φ_C is satisfiable, pick a satisfying assignment α. Define f on variable types by f(Var_i)=RED if α(x_i)=1 and GRN otherwise; for each clause type Cl_j set f(Cl_j) to a true literal’s color. All other (inactive) context types map to ⊥. Every (F1) bridge wa S1 wb wc S2 wd either is trivial (inactive or non-(variable,clause)) or admits an i witnessing the chosen literal, so the DP completes.
  • Soundness: If f satisfies (F1), define α by reading f(Var_i) (RED→1, GRN→0; BLU arbitrary). For any clause j, (F1) applied to (Var_i,Cl_j) over all i occurring in clause j forces at least one match at i with the color chosen at Cl_j; hence α satisfies clause j. Thus α satisfies Φ_C.
  • Inactive contexts never constrain: non-⊥ colors at S trigger witness chains that require a valid block; absent one, chains get stuck (no completion); ⊥ always extends. Error chains ensure malformed encodings accept with a consistent “refutation” output.
- Conclusion: Feasible-Function Existence (mid-consistency (F1) only) is NEXPTIME-hard for β-normalized, r=1 LCLs on oriented paths.

From FFE(F1) to the 3-way classification
- We construct, from P_C, a P_C^⋆ whose bridging (F2) is neutral:
  • Keep P_C unchanged around S (so (F1) semantics identical).
  • Permit, in Cout–out and Cin–out, a global ⊥-filler language on repetitions w_1^z and w_2^z that is compatible with any boundary (including adjacency to S) and with any input. Then for every context and every z≥1, the partial labeling that fixes S to f(Type(w1 S w2)) extends by filling w_i^z with ⊥. Thus (F2) holds vacuously for every f.
- Hence for P_C^⋆:
  • If a feasible f (for (F1)) exists, both (F1) and (F2) hold, so the problem is O(1) by the standard construction (MIS-free partition with fill-in; §4.5, Lemmas 26–27).
  • If no feasible f exists, the (ω(log* n)–o(n)) dichotomy (Theorem 8) forces Ω(n) complexity.
  • The Ω(log* n) class does not occur for P_C^⋆, so the 3-way classifier, when applied to P_C^⋆, outputs either O(1) or Ω(n). Deciding which is equivalent to deciding (F1) for P_C, which is NEXPTIME-hard.
- Therefore, the 3-way classification problem is NEXPTIME-hard.

Why worst-case over inputs is handled (important subtlety)
- Complexity is measured in the worst-case over input labelings. Our constructions ensure that malformed inputs are always completable in O(1) (⊥-plumbing or error chains), so the adversary’s worst-case choice will include well-formed active contexts. In the satisfiable case, the O(1)-algorithm derived from f works on all inputs; in the unsatisfiable case, Theorem 8 yields a global Ω(n) lower bound (no f exists → no sublinear algorithm on cycles/paths).

Potential gaps to firm up (action items)
1) Radius-1 realizability of the block grammar: We sketched role/phase tracks and single-step checks for U across row seams; to be fully formal, we should list the finite set of out–out pairs permitted at row separators and the Cin–out masks that tie “role-phase” symbols to input bits. This is standard but should be written once.
2) Witness chain details: spell out the constant-size alphabet and local rules for the existential pointer that safely walks to bit i in both blocks and enforces Hot_RID[i] ∧ (V^{(+)}[i] or V^{(-)}[i]). This reuses the error-pointer pattern from §3, but a concrete table will help verification.
3) Active context separability: we used that distinct RID/GID induce distinct context types. A short lemma should argue: if two left contexts have different Hot vectors, there exists a right clause context and a color such that the extendibility bits differ—hence types differ. (This reduces to the existence of some j and color where the witness succeeds for one RID but not the other.)
4) Enumeration of types (upper bound side): we outlined a DFA exploration; adding an explicit construction based on the boolean-matrix view C_w (Appendix A of draft) would make precomputation and composition clearer.
5) Three-class mapping clarity: While our hardness instances never realize the Ω(log* n) class, explaining explicitly that hardness for a subfamily suffices (since the classifier must be correct on all inputs) would avoid confusion.

Small sanity checks / examples
- Toy DP: For a tiny β (say β=3), define Cin–out to allow ⊥ on both input bits and restrict colors to input bit 1; define Cout–out so that a colored S must be followed on the right by a specific symbol. Running the layered DP checks extendibility quickly; this matches the O(k β^2) bound.
- Finite-Z for bridging: For a fixed (w1,S,w2), one can compute the two self-maps F_{w1}, F_{w2} on the type set, find their cycles, and set Z to lcm of periods times max preperiod (≤ ℓ_pump^2). On a random small instance, we indeed observe stabilization after a few iterations.

Next steps (concrete deliverables)
- Write the explicit out–out adjacency tables for: (i) row separators and U’s transition seams, (ii) error-pointer steps; specify the small work alphabet.
- Prove the “active context separability” lemma rigorously.
- Package the reduction P_C ↦ P_C^⋆ with exact β = poly(s) and tables’ sizes Θ(β^2); verify radius is 1 everywhere.
- Optionally, extend the NEXPTIME-membership argument from feasible-function existence to the full 3-way classifier by adding the finite-Z bridging checks; this would give NEXPTIME-completeness if desired.

Notes on attached materials (possible gaps)
- In the draft (LCL_classification.pdf), Section B (hardness) sketches the block/witness gadgets but leaves adjacency tables implicit; these must be concretized to eliminate ambiguity about radius and alphabet size.
- The claim “types differing in RID/GID are distinct” is stated but not proved; adding the separability lemma as noted above will close this gap.
- The finite-Z lemma for (F2) is stated with Z ≤ ℓ_pump^2; a brief derivation from the type DFA (pair product) would strengthen the presentation.

Summary claim (ready to formalize)
- The 3-way classification problem for β-normalized, radius-1 LCLs on oriented paths is NEXPTIME-hard. Reduction: Succinct-3SAT → Feasible-Function Existence (F1) (NEXPTIME-hard) → classification via bridging neutralization. The gadgets needed are all radius-1 and use β = poly(|C|). The upper-bound side (finite checks via types + DP) sits in NEXPTIME and can be added to obtain completeness if needed.

## Round 0001 — 2025-08-28T11:37:08.567248Z

Ideas and plan for NEXPTIME-hardness via feasible functions (and gaps spotted)

Context recap and goal
- We work with β-normalized, radius-1 LCLs on globally oriented paths, with explicit tables Cin–out and Cout–out. The classification into O(1), Θ(log∗ n), Θ(n) in the path/cycle case goes via the existence of a feasible function f on “context types” (mid-consistency F1 gives O(log∗ n) vs Θ(n); adding bridging F2 gives O(1) vs Ω(log∗ n)), per Section 4 of the reference (Lemmas 10–15, 11, 12; Theorems 8–9).
- The attached draft provides: (i) a NEXPTIME upper bound for deciding feasible-function existence (with an explicit bound Z ≤ ℓpump^2 for (F2) finite checks and an O(k β^2) DP for local extendibility), and (ii) a hardness sketch (Section B) intended to reduce Succinct-3SAT to mid-consistency (F1).

Critical gaps in the current hardness sketch (Section B)
1) Universal machine runtime and one-hot vectors: The draft says a fixed U runs in BO(1) to compute clause literals and uses a 2^B-long one-hot vector HotRID. Neither is feasible. Evaluating a size-s circuit C requires poly(s) steps; one-hot vectors of length 2^B cannot be produced/stored in a constant-alphabet radius-1 LCL with poly(s) footprint.
2) Mid-consistency quantifies over all ordered pairs of contexts. The current design enforces that for (variable i, clause j) pairs the bridge only succeeds if i appears in j and the chosen colors match a picked literal. But f(Clj) is fixed per type; then for the other two variables in the same clause the bridge would fail, contradicting the “for all pairs” requirement in (F1). This is a fundamental mismatch: 3SAT’s “∃ satisfied literal” cannot be expressed by a constraint that must hold for every pairing.
3) Type–separation assumptions: The sketch implicitly needs exponentially many distinct context types (e.g., one per RID and per GID) and that type equality can be forced to depend on RID/GID. This needs a concrete mechanism to “project” the index to a boundary-extendibility distinction (otherwise different indices could collapse to the same type).

Proposed pivot: reduce from Succinct 3-Coloring (NEXPTIME-complete)
Why it matches (F1):
- Feasible-function mid-consistency induces pairwise constraints among context-types. 3-colorability of a succinctly described graph H on 2^B vertices is a pure pairwise constraint system: for each edge (u, v) we require color(u) ≠ color(v). This aligns with “for all ordered pairs” checks, provided we gate the bridge so that non-edges are trivial.
- Succinct 3-coloring is NEXP-complete (Papadimitriou–Yannakakis). The succinct adjacency oracle A(u, v) is a circuit of size s on 2B bits. This lets us stay within poly(s) resources inside a block.

Refined reduction outline (mid-consistency (F1) only)
- Instance: succinct graph G on V = {0,1}^B, circuit D(u, v) outputs 1 iff edge.
- Build β-normalized LCL P_D with constant-radius verifier and Σin = {0,1}; keep |Σout| = β = poly(s).
- “Vertex contexts”: For each u ∈ {0,1}^B, we realize many contexts wa S wb whose interior carries a well-formed block encoding: a self-delimiting header (copy of D on input track), the index u, and a locally-checkable runzone computing a short “seam handshake code” Hu placed near the right boundary; symmetrically, the left boundary carries Lu. All of this is forced locally via Cout–out. Error chains per §3 of the reference allow any malformed block to be locally refuted, making such contexts effectively inactive.
- Coloring choices via f: For each “vertex-type” τu (i.e., the type of contexts realizing u), f(τu) ∈ {RED, GRN, BLU}^2 fixes a color token at S (two nodes). For all non-vertex types, set f(τ) to a neutral token ⊥⊥ that never activates constraints.
- Gating only edges: In a bridge between (τu on the left, τv on the right), the seam region interprets Hu and the right’s corresponding handshake. It then runs (in the bridge) a locally-checkable simulation of a fixed universal TM U on input (D, u, v) (time poly(s); we have length budget since ℓpump ≫ poly(s)), to compute D(u, v). Error refutations are permitted, as usual. The cout–out grammar enforces: the partial labeling extends if either (i) D(u, v) = 0 (non-edge) irrespective of colors; or (ii) D(u, v) = 1 and the two S colors are different. If D(u, v) = 1 and colors are equal, all completion paths get stuck, so the DP rejects.
- All pairs outside the (vertex, vertex) role (or with malformed header/index) are trivially extendible (via ⊥ plumbing), so they do not constrain f.
- This creates the intended constraint family: for all ordered pairs, only edges impose “≠”; others are vacuous.

Why the above fixes the (F1) mismatch
- With this gating, the (F1) universal quantification over ordered pairs exactly enforces a proper coloring constraint on every edge. There is no clause-like “exists” quantifier left that would clash with the universal pairing; non-edges require nothing.

Key technical components to instantiate and verify
A. Computing and checking at radius 1:
- Block language: As in §3, use a constant-alphabet, radius-1 nearest-neighbor checker for the header, index, and a row-by-row simulation of U for poly(s) steps. The input circuit D is copied from the input track (Cin–out). The work alphabet of U is constant and independent of s.
- Seam handshakes: Deterministically derive short fixed-size codes Lu, Hu from the index u and place them in O(1) cells adjacent to the context boundary; they are computed in the block and forced by Cout–out.
- Bridge computation: In wb◦wc, run U for poly(s) steps using the adjacent copies of D and the seam codes Lu/Hv to reconstruct u and v and evaluate D(u, v). This is the same 1D-encoding recipe as §3; errors are locally refutable.
B. Separation of exponentially many vertex context types:
- We need that for each u, there exist contexts whose type remembers the presence of Lu/Hu; more strongly, to assign different colors per u we only require that for each u there exists at least one type τu on which f can act. Distinctness of types can be enforced by a boundary-extendibility probe: add a reserved boundary-output pattern that triggers a local “index-check subroutine” which accepts iff the seam code equals a prescribed function of u; different u yield different extendibility outcomes under that boundary pattern, hence different types. This uses the definition of Type (extendibility table on 4 boundary nodes).
- Pumping to reach ℓpump-sized buffers: Lemmas 12, 14–15 ensure we can embed the block and seam codes inside w1/w2 and pump to lengths ℓpump or ℓpump+1 without changing type (replacement lemma, Lemma 11).
C. β and time bounds:
- The per-symbol state space (roles/phases/colors/⊥/error alphabet/U work letters) is constant; β can be chosen poly(s) to absorb all tracks comfortably. The LCL description size is poly(β) = poly(s). The verifier’s DP runs in O(k β^2) per string.

Correctness sketch under the new reduction
- Completeness: If G is 3-colorable, pick any proper coloring χ: V → {RED, GRN, BLU}. Define f(τu) = χ(u). For any ordered pair (τu, τv), the bridge’s local computation derives D(u, v); if D(u, v) = 0, we allow completion; if D(u, v) = 1, χ(u) ≠ χ(v) so completion is allowed. All other context pairs are vacuous. Hence all (F1) checks pass.
- Soundness: If a feasible f exists, read a color assignment χ(u) = f(τu) (choosing any representative context type for each u; if several exist, they must all share the same f-value else (F1) would fail on the pair of those contexts). For any u, v with D(u, v) = 1, the bridge between τu and τv must be extendible, which forces χ(u) ≠ χ(v). Thus χ is a proper 3-coloring, so G is 3-colorable.

Handling (F2)
- Make (F2) vacuous by allowing repeated sides wz
1 and wz
2 to be filled with ⊥ (a self-looping buffer language in Cout–out), independent of the chosen f on S. Then bridging checks in the upper bound accept for all z ≤ ℓpump^2 (and hence all z), without constraining f.

Examples (toy sanity check)
- Let B = 2, V = {00,01,10,11}. Let D encode a 4-cycle 00–01–11–10–00. Under the reduction, there are 4 vertex context types τ00,…,τ11. Feasible f exist iff a 3-coloring of a 4-cycle exists (true). Pairs like (τ00, τ10) with D(00,10) = 0 are unconstrained; pairs like (τ00, τ01) with D(00,01) = 1 enforce f(τ00) ≠ f(τ01).

Obstacles and open items to formalize next
- Formal type-separation lemma: Specify the boundary-output probe and prove that contexts with distinct u become distinct types (by differing in at least one boundary-extendibility bit). This pins down the “one type per vertex” requirement.
- Seam handshake construction details: Specify an O(1)-cell code and the local rules that move u from the block interior to the boundary deterministically.
- Bridge computation layout: Spell out the row format and the interface that feeds D and (u, v) into the U-simulation, ensuring errors are caught locally.
- Size bookkeeping: Choose concrete constants so that block length is poly(s), while ℓpump = 2Θ(β^4) dominates to allow pumping. Confirm Cin–out/Cout–out remain of size poly(β).

Why this yields NEXPTIME-hardness for feasible-function existence (and classification)
- Feasible-function existence with (F1) alone is NEXPTIME-hard via succinct 3-coloring under the reduction above. Together with the NEXPTIME upper bound in the draft, this gives NEXPTIME-completeness for (F1)-feasibility in the explicit β-normalized, r=1 setting.
- For full classification (O(1)/Θ(log∗ n)/Θ(n)), add the neutral ⊥ repetition to trivialize (F2), so the hardness transfers to deciding whether (F1) holds—hence to the classification problem that internally tests (F1).

Next steps
1) Write the explicit local rules for the seam gate and the bridge simulation (succinct adjacency computation) and verify they fit in radius 1.
2) Prove the type-separation lemma rigorously (construct the boundary probe and show different u change the extendibility table).
3) Integrate the error-chain library from §3 to guarantee malformed blocks are always locally refutable, keeping non-vertex contexts harmless.
4) Provide a fully quantified statement/theorem of the reduction with the poly-time construction mapping D ↦ P_D and the equivalence “G 3-colorable ⇔ (F1)-feasible f exists for P_D”.

Notes on the NEXPTIME upper bound (good to keep)
- The finite z bound Z ≤ ℓpump^2 for (F2) follows cleanly from Lemma 15 periodicity and Lemma 12 composition; no circularity with f.
- The layered DP (O(k β^2)) to decide extendibility of partially labeled paths gives an explicit verifier runtime bound compatible with 2poly(β).

No output.md was provided; these notes flag substantial issues in the current (3SAT-based) Section B and outline a repaired (3-coloring-based) reduction aligned with (F1).

## Round 0001 — 2025-08-28T11:37:18.219942Z

Ideas and plan
- Goal: Prove NEXPTIME-hardness of the 3-way classification (O(1) vs. Ω(log* n) vs. Ω(n)) for β-normalized, radius-1 LCLs on oriented paths. By the Balliu–Brandt–Chang–Olivetti–Rabie–Suomela framework (Section 4), the 3-way classification reduces to existence of a feasible function f with two properties: (F1) mid-consistency and (F2) bridging. If (F1) fails then the complexity is Θ(n); if (F1) holds and (F2) fails then Θ(log* n); if (F1)+(F2) holds then O(1). Hence NEXPTIME-hardness follows if we can reduce a NEXPTIME-hard problem (e.g., Succinct-3SAT) to deciding existence of f.
- Upper bound: The attached draft “LCL_classification.pdf” sketches an NEXPTIME upper bound for Feasible-Function Existence (FFE) via types and bounded DP checks. I re-checked: the type bound |Types| ≤ 2^{Θ(β^4)} for r=1 is sound, the “finite z” lemma for (F2) with Z ≤ ℓ_pump^2 is correct, and the layered-DAG DP is O(kβ^2) for a length-k path. Hence membership in NEXPTIME looks solid.

Gaps/concerns in output.md (hardness part B)
- Quantifier mismatch in (F1): (F1) universally quantifies over all ordered pairs of contexts (wa S1 wb, wc S2 wd), not merely pairs “variable on left, clause on right” with a shared variable. In Section B, the bridge is made to succeed only if a witness i connects the left “variable RID i” to a right “clause V(·)[i]=1”. This enforces success only for some pairs. But (F1) requires success for all ordered pairs simultaneously. As written, if there exist “variable” types Vari that are not among the three variables of a given clause type Clj, then the ordered pair (Vari, Clj) will cause the bridge DP to fail for the f chosen, violating (F1). The text attempts to restrict to pairs “where i ranges over variables occurring in clause(j)”, but (F1) does not allow restricting the universal set of pairs; every pair of context types appearing in C must pass.
- “Inactive contexts” and pair filtering: The draft claims we can trivialize all pairs that are not (variable, clause) or have malformed blocks by allowing ⊥. However, (F1) still quantifies over ordered pairs regardless of internal content. If the left is a “variable” context (i fixed) and the right a “clause” context (j), but i /∈ vars(clause j), the pair remains “variable–clause” and is not falsifiable by declaring one side “inactive”: that would force f to assign ⊥ to at least one side for all contexts of that type, collapsing the intended encoding (we need variable/clause contexts to be active to constrain f). No mechanism was given that makes those specific pairs inactive without also deactivating the entire type.
- Types vs. interior degrees of freedom: The argument “there are 2^B distinct variable types Vari and 2^B clause types Clj” uses that differing RID/GID values must give distinct types because extendibility from S differs “for some bridge”. But Type(·) is defined by which boundary assignments are extendible; it existentially quantifies over all interior labelings. If a context admits multiple interior RIDs, then for many S-labelings the existence of some witness RID can make extendibility identical across many RIDs. Thus different RID values need not force different types unless we can tie RID deterministically to boundary information. The current construction does not ensure RID/GID are uniquely determined by the context’s boundary behavior.
- Context locality: The construction wants a large, well-formed block to sit “inside” w1 (resp. w2). But (F1) only fixes the two outputs on S; the remaining outputs (including inside w1 and w2) can be chosen arbitrarily in each check. This is intended, but it then exacerbates the previous issue: types correspond to sets of interior completions. One must ensure the property “RID equals i” is forced by boundary behavior, otherwise types conflate many RIDs.
- Pair-wise gating by clause membership: The hardness relies on only pairs (Vari, Clj) with i ∈ vars(clause j) being active (i.e., constrained by the witness chain). However, no local, radius-1 gating was given that makes all other variable/clause pairs trivially extendible while keeping those of interest constraining, especially given that the grammar cannot refer to “pair identity” globally. A local activation must be derivable from S and nearby labels, not from global pairing information.

Small positive results we can reuse (from output.md)
- Type bound for r=1: M := |Types| ≤ 24·2^{β^4} = 2^{Θ(β^4)}; set ℓ_pump := M.
- Finite z for (F2): For each fixed context (w1, S, w2), the set {Type(w1^z S w2^z)} has size ≤ ℓ_pump^2, so it suffices to check 1 ≤ z ≤ Z with Z ≤ ℓ_pump^2.
- DP feasibility test: For radius-1 β-normalized LCLs, partial-to-total extension on a given path with some outputs forced is decidable by a layered-DAG DP in O(kβ^2) time.

Proposed corrections/patches to the hardness construction
- Force RID/GID by boundary behavior: To obtain a family of 2^B distinct “variable” context types Vari, we can build a left-anchored gadget whose unique continuation from the S-window outwards deterministically encodes the index i in the nearest O(1) outputs (e.g., a self-delimiting, gray-coded header with radius-1 local rules). Concretely, add a “phase” track that rigidly positions the start of a short RID header of length Θ(B) within distance O(1) from the S-window. Enforce, via Cout–out, that whenever the S-window carries a designated activation token and the phase indicates “variable mode”, the next O(B) outputs are uniquely determined (one-hot RID with a fixed delimiter). This ensures: (i) the interior labelings consistent with an activated S-window determine exactly one RID, (ii) types differ across different i because the set of boundary-extendible S-outputs differs.
- Clause contexts likewise: Symmetrically enforce a GID header near S on the right context, again determined uniquely upon activation, and attach RUN rows that compute the literal set for clause j based on the fixed circuit C (hardwired in the adjacency table). As before, activation at S forces a unique GID.
- Local gating of pairs: Introduce a “handshake” protocol across the bridge that makes a pair active only if both windows are activated and their local roles match a prescribed pattern (left role=VAR, right role=CL). All other combinations, including (VAR, CL) with at least one window deactivated (⊥), are assigned a trivial buffer language that always extends. This satisfies (F1) over all pairs once we ensure that, for each type, f can choose ⊥ to deactivate it when needed; but now activation will be needed only on the types we purposefully created (Vari, Clj), and deactivation on all other types is harmless.
- Still need to address “wrong variable for a clause”: To avoid the quantifier mismatch, ensure that for a given right clause context Clj, only those left context types Vari with i ∈ vars(clause j) can be simultaneously activated: implement a local test that compares the variable index i (encoded near the left S-window) with the finite set of three indices embedded near the right S-window (also encoded near its S-window), and only if there is equality do we allow the activation token to persist across the bridge; otherwise the only locally valid option is to turn off activation on at least one S-window (i.e., f must set ⊥ for one of the two types). This way, for a fixed clause type Clj, there are exactly three variable types Vari whose joint activation with Clj is locally legal. All other pairs are forced to be inactive (and thus trivial). This preserves the universal quantifier of (F1): we require success for all pairs, but for non-matching pairs success is guaranteed by deactivation.
- Encoding satisfiability: Now (F1) for the three matching pairs (Vari1, Clj), (Vari2, Clj), (Vari3, Clj) amounts to requiring that, with the f-choices of colors on these types, at least one pair’s witness chain can complete (using the V(+)/V(−) bits from the RUN gadget). To phrase this with universal quantification, we allow only one activated pair per clause to persist in any given bridge instance: locally, at the mid-bridge we place a “choice” gadget that nondeterministically selects one of the three matching i; the DP succeeds iff the selected i’s witness check passes. Since (F1) demands existence of some completion, it suffices that at least one of the three literal checks can succeed for the f-choice at Clj. This exactly encodes that each clause has a satisfied literal under the assignment extracted from f(Vari).
- Trivializing (F2): As in the draft, add a neutral symbol ⊥ and permit filling wz with ⊥ regardless of the context, so (F2) is always true. This keeps the 3-way classification hinging on (F1) alone: satisfiable ⇒ (F1) holds ⇒ O(1); unsatisfiable ⇒ (F1) fails for some clause ⇒ Θ(n).

Toy counterexample of the current draft’s (F1) usage
- Consider a clause type Clj whose literals are over indices {i1, i2, i3}. For a variable type Vari with i ∉ {i1, i2, i3}, the proposed grammar makes the pair active (since it is a (variable, clause) pair) and then the witness chain must fail (no V-bit at i), violating (F1) unless f sets ⊥ on Vari or Clj. But if f sets ⊥ on Vari to fix this pair, it also deactivates all its interactions with the correct clauses, undermining the intended encoding. This shows the need for local gating to force all non-matching pairs inactive irrespective of f.

Why the capacity (number of types) suffices
- With β = poly(|C|), ℓ_pump = 2^{Θ(β^4)} gives room for exponentially many distinct context types. The “phase+RID/GID near S” gadgets use only O(B) symbols, so they comfortably fit into contexts of length ≥ ℓ_pump. Deterministic forcing from S ensures that different i (or j) yield different type behaviors (distinct sets of extendible S-labelings), so we can realize 2^B variable types and 2^B clause types.

Concrete micro-lemmas to formalize next
1) RID-forcing lemma. There is a radius-1 adjacency schema over a constant-size role/phase alphabet that, upon placing a VAR-activation token on S, deterministically fixes a unique B-bit one-hot RID string within the next O(B) positions. Distinct RIDs induce distinct type behaviors at the boundary (different activated S choices are extendible).
2) Pair-gating lemma. There is a radius-1 schema that, given left VAR with RID=i and right CL with a three-element set {i1,i2,i3} encoded within O(1) of S, allows activation across the bridge if and only if i ∈ {i1,i2,i3}; otherwise the only legal option is to deactivate (⊥) at one or both S-windows (enforced locally by Cout–out).
3) Clause-choice lemma. There is a radius-1 gadget on the bridge that nondeterministically chooses one of the three matching i and routes a witness chain to check the corresponding RUN subtrack; DP success is equivalent to the existence of a satisfied literal among the three under the f-colors.

Obstacles and open items
- The exact encoding of the “choice” on the bridge needs to be pinned down so that: (i) choice is local, (ii) its existence suffices for DP success (so (F1) is existential per pair), (iii) it cannot enable success for non-matching pairs.
- We must verify that deactivation (⊥) never creates spurious constraints: for every non-matching pair, there is always a completion that uses ⊥, regardless of f’s color on other types.
- We must confirm that the uniqueness of RID/GID under activation really separates types (no alternative interior labeling can fake a different RID/GID without violating adjacency), so the number of types available is exponential in B.

Next steps
- Write the RID-forcing and clause-gating gadgets precisely as out–out adjacency tables, with a short formal proof of their correctness (local determinism from S; matching-only activation across the bridge).
- Prove that the “choice-on-bridge” gadget yields the right existential semantics for (F1) and that the entire pair space satisfies (F1) iff Φ_C is satisfiable.
- Check that (F2) can be made vacuous with ⊥ without interfering with (F1).
- Once the above is settled, we can present a full reduction from Succinct-3SAT to FFE(F1), yielding NEXPTIME-hardness; by the known gap characterizations, this yields NEXPTIME-hardness for the 3-way classification.

Summary
- The NEXPTIME-membership part of output.md is in good shape. The hardness section B has a fundamental quantifier gap for (F1) and needs a corrected local “gating” mechanism so that only the intended (Vari, Clj) pairs are active, and even then the (F1)-existential nature must be implemented via a local nondeterministic choice on the bridge. I outlined concrete gadgets (RID-forcing, pair-gating, clause-choice) that, once formalized, should fix these issues while staying within radius-1, β-normalized constraints. I will next encode these gadgets into explicit Cout–out tables and prove their properties.

## Round 0001 — 2025-08-28T11:38:00.688946Z

Headlines
- Goal: Prove NEXPTIME-hardness for classifying β-normalized, radius-1 LCLs on globally oriented paths into O(1) vs. Ω(log* n) vs. Ω(n).
- Status: The attached draft gives an NEXPTIME upper bound for feasible-function existence (FFE) and sketches NEXPTIME-hardness via a reduction from Succinct-3SAT. I identified a subtlety in the hardness appendix: “activity” of a context must be type-invariant, since f is defined on context types, not on concrete words. I propose a corrected construction that makes the relevant property depend only on the boundary-extendibility behavior (hence on the type), and I outline the checks that keep everything radius-1 and β-normalized.

Gaps / issues spotted in the attached draft (Appendix B)
- Context activity vs. type invariance. Appendix B uses “active contexts” that contain a well-formed header+indices+RUN somewhere “inside w1/w2.” As written, the property “this concrete context contains a valid block” may not be constant within a type: two words of the same type (agreeing on D1∪D2 extendibility) can differ arbitrarily in the interior. Since f is defined on types, we must ensure that for any type τ we use as a variable or clause type, every representative of τ is active in exactly the same way (otherwise (F1) could fail on some representative).
- Where the exponential blow-up resides. The draft claims there are 2^B variable and 2^B clause context types present in C. This is plausible only if “RID/GID” information is encoded into the boundary-extendibility function of the whole context (thus affecting the type). It is not enough to place RID/GID far in the interior, as that would not be reflected in the type (which only depends on boundary inputs and the extendibility table for the 4 boundary outputs). A clean way is to make “RID/GID” selection manifest at the context’s boundaries, via boundary key states whose permitted continuations encode the 2^B possibilities.
- Uniform extendibility vs. S-only forcing. In the (F1) verification, only the two S nodes are forced; the verifier chooses all other outputs (including the 4 boundary nodes). Hence, any variable/clause identity must be “selected” by the existence of some consistent completion, not by externally fixing boundary outputs. The construction must ensure: for each variable-type τi, some (and in fact many) boundary assignments lead to a completion that realizes RID = i and no assignment leads to RID ≠ i; analogously for clause types. Otherwise two different RIDs could collapse to the same type.

Key idea: boundary-keyed types and seam-certified witnesses
- Boundary-keyed types. For each variable index i∈{0,1}^B, define a distinct boundary behavior at the right end of a variable-context (the last two nodes of wa S1 wb), witnessed by a “key” pair (kv,i, rv,i) of output symbols. Dually, for each clause index j define a distinct boundary behavior at the left end (first two nodes of wc S2 wd), with a key pair (kc,j, lc,j). The adjacency table is set so that:
  - A variable-context of type Vari is characterized by: there exists a completion consistent with S free such that the last-two-boundary symbols are exactly (kv,i, rv,i), and conversely, no completion exists that realizes the last-two-boundary symbols from any other key (kv,i′, rv,i′) with i′≠i. The same for clause-context types Clj at their first two boundary nodes.
  - This makes RID/GID selection a property of the context’s type (since the type is precisely the yes/no table of extendibility for all 4-boundary assignments). Because the type equivalence class records, for each of β^4 boundary assignments, whether a completion exists, we have more than enough capacity to separate 2^B different behaviors when β = poly(s) and B = s^{c0} with a larger constant in β.
- Witness chains initiated at S. Upon placing a non-⊥ color at S (RED/GRN/BLU), the out–out rules enable a local “witness chain” that walks from S to (i) the right boundary of the left context and (ii) the left boundary of the right context. At those boundaries, it must latch onto the proper keys (kv,i, rv,i) and (kc,j, lc,j). From the keys, the chain enters the corresponding interior block modules that encode, via a row-by-row 1D tableau, the vectors HotRID (one-hot) and the three clause-indicator vectors V(+),V(−),V(⊥) computed by a fixed universal TM U on input (C, RID, GID). The chain succeeds iff for the chosen color, there exists a bit position p such that HotRID[p]=1 and V(±/⊥)[p]=1 as appropriate. If any subcheck fails, the chain cannot be completed (no completion exists, hence the DP rejects). All of this is radius-1: pointer segments are finite-state “pipes” checked by Cout–out, and each tape row transition in RUN is enforced by nearest-neighbor constraints, exactly as in §3 of the reference.
- Uniformity within types. Because keys reside at the 4 boundary nodes and the admissible continuations for a given key are baked into the out–out table, the existence/non-existence of a successful witness is purely a type property. That is, any two representatives of the same type have identical extendibility tables for all 4-boundary assignments; hence for a fixed color at S, either both admit some completion (with the appropriate key) or neither do.

Why exponentially many (context) types are available
- Type count. For r=1, types are determined by: (i) 2^4 choices of boundary inputs and (ii) a β^4-bit truth table indicating which 4-boundary output assignments are extendible. Hence |Types| ≤ 2^4 · 2^{β^4} = 2^{Θ(β^4)}. With β = s^{c1}, pick c1≫c0 so that 2^{β^4} ≫ 2^B. Thus we can assign pairwise distinct truth tables to the 2^B desired variable keys and to the 2^B clause keys, leaving plenty of slack for all other contexts.
- Realization by radius-1 rules. Each distinct truth table is realized by tailoring the local “plumbing” around the 4 boundary nodes: for each of the β^4 boundary assignments, either permit at least one outgoing legal extension (by supplying a small admissible gadget that grows into the variable/clause block and RUN) or forbid any extension (by forcing dead ends unless an error-chain is emitted, which we disallow when S carries a non-⊥ color). This is purely in Cout–out and Cin–out and does not depend on interior inputs.

Soundness and completeness of the reduction (cleaned)
- Source: Succinct-3SAT instance C of size s. We set β = s^{c1} and work in the explicit β-normalized, radius-1 model.
- Target: PC = (Σin={0,1}, Σout of size β, Cin–out, Cout–out). The alphabet has fixed tracks: role/phase, ⊥, 3 colors {RED,GRN,BLU}, finitely many error symbols, and the work alphabet for U (all independent of B), as in §3.
- Variable and clause types. We reserve 2^B variable types {Vari} and 2^B clause types {Clj} by their boundary keys, as above. All other types are “inactive” and accept ⊥ at S unconditionally.
- (⇒) If ΦC is satisfiable, define f on types by: f(Vari)=RED if α(xi)=1 else GRN; f(Clj) is set to a color that corresponds to some true literal in clause(j) (RED for positive, GRN for negative; BLU is unused/dummy); f(τ)=⊥ for all inactive types. For any ordered pair of contexts, if both are active and in roles (variable,clause), the witness chain succeeds by picking the unique hot position for RID (enforced by the variable block) and the matching 1 in V(±) (enforced by the clause block). All other ordered pairs are trivialized (either inactive or the grammar ignores colors in those role combinations), hence all (F1) DP checks pass.
- (⇐) If there exists f satisfying (F1), read an assignment α from the variable types: α(xi)=1 iff f(Vari)=RED, α(xi)=0 iff f(Vari)=GRN (BLU impossible for variable types by construction; if allowed, fix it arbitrarily). Fix any clause j. Since (F1) must hold for the ordered pair (Vari, Clj) for the i appearing in clause(j), the only way the DP can succeed (given the grammar) is that f(Clj) picks a color that matches a true literal under α (the witness chain cannot otherwise be completed). Hence every clause has a true literal and α satisfies ΦC.
- Inactive contexts never constrain f: for any type without the proper boundary keys and RUN plumbing, any non-⊥ color at S leads to a dead-end (no completion), whereas ⊥ always admits a completion via the neutral plumbing and/or the standard error-chain (per §3). Thus assigning f(τ)=⊥ for all such τ ensures all mixed-type (F1) checks pass.

From FFE(F1) to the tri-class classification
- As in the draft: (F1) characterizes O(log* n) vs. Θ(n) (Theorem 8 machinery), and adding a neutral ⊥ that freely fills repetitions makes (F2) vacuous, whence (F1)+(F2) yields O(1) (Theorem 9 machinery). Therefore:
  - Distinguishing Θ(n) vs. sublinear (i.e., the existence of a feasible f) is NEXPTIME-hard.
  - Distinguishing O(1) vs. Ω(log* n) (by toggling (F2) via ⊥-filling) is also NEXPTIME-hard.
  - Hence the full three-way classification is NEXPTIME-hard under the explicit β-normalized encoding.

Checkability and complexity bookkeeping
- Radius 1: All constraints (role placement, boundary keys, pointer pipes, RUN row-to-row evolution, and error-chains) involve each node and its predecessor only, i.e., exactly Cin–out and Cout–out.
- Alphabet size: Σout is of size β = poly(s); the number of “states” required for roles, phases, pipes, and U is constant. The heavy lifting (2^B distinct behaviors) is encoded not in new symbols but in the accept/reject decisions for the β^4 boundary assignments (the type truth tables), which are programmed into Cout–out.
- Lengths: Contexts have length ≈ℓpump (double-exponential in s), so there is ample room to host the O(poly(s))-size headers/indices and RUNs needed to compute clause(j) from C.

Examples / sanity checks
- Toy instance: Fix B=2, so there are 4 variable and 4 clause types. Assign four disjoint pairs of boundary keys for the variables on the right and four for the clauses on the left. The seam witness for RED requires a position p with HotRID[p]=1 and V(+)[p]=1; the grammar enforces that exactly one p has HotRID[p]=1, and RUN computes V(+) correctly from C and GID. Testing all 16 ordered pairs (Vari, Clj) by hand recovers the truth table of satisfaction.

Next steps (concrete, verifiable)
1) Formalize the boundary-keyed type lemma: Given β, construct Cout–out so that for any prescribed subset S⊆[β]^4 (boundary assignments) of size ≤2^B we can realize a type whose extendibility table equals the indicator of S. This pins down the “truth table capacity” rigorously.
2) Write the exact local transition rules for the pointer pipes and RUN rows, following §3 of the reference, and count the number of symbols added (to check β=poly(s) suffices).
3) Prove the uniformity lemma: For any two words of the same type, the success/failure of the (F1) DP for a fixed pair of types and a fixed color at S is identical. This uses Lemma 11 (replacement) to justify that only the boundary truth tables matter.
4) Integrate the ⊥-filling trick to make (F2) vacuous and connect the hardness to the O(1) vs. Ω(log* n) gap explicitly.

Why useful here
- The boundary-keyed construction eliminates the “activity” non-invariance and anchors the reduction in the type semantics used by the NEXPTIME verifier. Establishing this rigorously will convert the hardness sketch into a clean, auditable proof.

## Round 0002 — 2025-08-28T11:46:01.458097Z

Status. We have a solid upper-bound skeleton (types, composition, periodicity, finite-Z for (F2), and the O(kβ^2) DP) captured in output.md. To push hardness to NEXPTIME for the 3-way classifier, I focus on formalizing the succinct 3-coloring reduction via (F1), with two key technical lemmas: (i) type-separation per vertex index u using a boundary-probe truth-table signature realized by a radius-1 checker; (ii) a seam gadget that, on colored S-windows, locally simulates D(u,v) (adjacency) across the bridge, accepting iff either non-edge or colors differ. I also point out a minor optional tightening in output.md and confirm its current statements are correct as written.

Gaps/remarks on output.md (minor). 
- The ℓ^2 bound in Corollary 4 is correct and sufficient; optionally, one can refine Z to preperiod1 + preperiod2 + lcm(period1, period2) ≤ 2ℓ + ℓ ≤ 3ℓ (or ≤ lcm periods) by analyzing the pair map on T×T, but this is nonessential. The current deterministic DP lemma (Theorem 5) is correct; an explicit treatment of boundary inputs when k<4 is trivial and can be omitted. No correctness issues spotted.

Plan and why useful. 
- Pivot source to Succinct 3-Coloring (NEXP-complete). For a circuit D of size s deciding adjacency on V={0,1}^B (B=s^{c0}), we construct a β-normalized, r=1 LCL P_D with β=s^{c1} (c1≫c0) so that: existence of a feasible function (F1) ⇔ G is 3-colorable. This matches (F1)’s universal quantification (pairwise inequality on edges) and avoids clause-level ∃-quantifiers.

Core technical ingredients (new lemmas, concrete gadgets).

Lemma A (Type-separation via boundary-probe signature). Fix integers B=s^{c0} and β=s^{c1} with 4c1>c0. There exists a radius-1 β-normalized LCL fragment that enforces: for any path segment W that contains a well-formed vertex block encoding an index u∈{0,1}^B (and no errors), the type Type(W) has extendibility truth-table over the β^4 boundary-output assignments equal to an injective signature g(u)∈{0,1}^{β^4}. In particular, u≠u′ ⇒ Type(W)≠Type(W′).
- Construction sketch (radius-1):
  • Reserve in Σ_out constant tracks: role/phase, error alphabet, a ⊥-plumbing symbol, and a RUN track for a fixed universal TM U. The vertex block stores u in a self-delimiting header and includes a short RUN zone computing on demand bits of an injective signature g(u) of length L=β^4≥2^B (we can set g(u) to the length-L zero-padded copy of u followed by a fixed injective encoding). The run budget is poly(s).
  • Boundary-probe coding: Each of the four boundary outputs carries an index digit in base β; together they encode b∈[β^4] (the probe index). Adjacency rules copy these 4 base-β digits along “carrier” subtracks deterministically from both ends toward the interior (radius-1 constraints enforcing equality along edges). If the two ends encode different b, a detector in the middle halts with an unsatisfiable local pattern ⇒ that boundary assignment is rejected (truth-table bit 0). If they match, the bridge enables U to read (u,b) from the interior/carriers and compute g(u)[b] in poly(s) steps within W. Local acceptance (extendibility) is permitted iff g(u)[b]=1 (otherwise the RUN must end in a dead configuration). Malformed interiors open an error-chain (always extendible) and are hence excluded when defining vertex types.
- Why useful: It produces ≥2^B distinct types attributable to different u while using only β symbols and radius 1; f can then assign colors per vertex-type τ_u.

Lemma B (Realization of vertex context types near S). For each u, there exist contexts (w_1,S,w_2) with |w_i|∈{ℓ_pump,ℓ_pump+1} whose left (or right) side contains a well-formed vertex block for u adjacent (within O(1)) to S, and whose type equals the Type(W) from Lemma A. Moreover, replacement/pumping (Lemmas 11, 14–15) ensure that these contexts persist under padding to the required lengths.
- Why useful: Guarantees the context set C contains, for each u, at least one “vertex” type τ_u on which f can act.

Lemma C (Seam gadget for succinct adjacency and color inequality). There is a radius-1 out–out grammar across the seam between a left τ_u-context and a right τ_v-context such that, when both S windows are colored, the bridge wa S_1 wb wc S_2 wd admits a completion iff either D(u,v)=0 (non-edge) or D(u,v)=1 and the two colors differ. If either side is not a vertex context (no valid block), the seam always completes (via ⊥-plumbing or error chains) irrespective of S.
- Construction sketch:
  • Seam handshake: Near each S window, a constant-size “handshake” subtrack asserts role=VERTEX, and opens a bounded-width corridor through wb∘wc where a fixed TM U simulates D(u,v) for poly(s) steps using the copies of D from the interiors and seam pointers that fetch u (on the left) and v (on the right). As in §3 of the attached paper, each tableau row is locally checked by Cout–out; malformed runs are locally refutable (error-chain), keeping non-vertex contexts harmless.
  • Acceptance policy: The corridor exposes a verdict bit Edge(u,v). The adjacency table then enforces: if Edge=0, accept regardless of colors; if Edge=1, require Color(S_1)≠Color(S_2) (three colors in a constant subalphabet). Violations force a dead pattern (no completion). All checks are radius-1 because comparisons are between adjacent row/phase symbols and the two S outputs.
- Why useful: Encodes the exact pairwise 3-coloring constraint on edges within (F1)’s universal pair quantification; non-edges/vacuous pairs always pass.

Lemma D (Bridging neutralization). Add ⊥-repetition plumbing: for any context (w_1,S,w_2), all repetitions w_1^z and w_2^z can be filled entirely with ⊥ while remaining compatible with any S outputs and the fixed boundary inputs. Then (F2) holds for every f.
- Why useful: Collapses the three-class decision to (F1)-feasibility, transferring NEXP-hardness to the classifier (O(1) vs Ω(n) on our instances).

Soundness/completeness outline for the reduction (auditable).
- Parameters: Choose c1≫c0 so that β^4 = s^{4c1} ≥ 2B; then ℓ_pump = 2^{Θ(β^4)} = 2^{poly(s)}. Block length is poly(s)≪ℓ_pump.
- Cmpltns:
  • If G is 3-colorable with χ:V→{R,G,B}, define f(τ_u) = (χ(u) on S) and f(τ)=⊥ for non-vertex types. For any ordered pair (τ_left, τ_right), the seam gadget computes Edge(u,v); non-edges accept; edges accept iff χ(u)≠χ(v). Hence all (F1) checks pass. (F2) is vacuous by Lemma D.
- Sndnss:
  • If f satisfies (F1), read χ(u)=f(τ_u). Consider any edge (u,v). The pair (τ_u, τ_v) must pass the (F1) DP; by Lemma C, this forces χ(u)≠χ(v). Therefore χ is a proper 3-coloring.

Key implementation details (to be checked next, but radius-1 and β=poly(s)).
- Fixed tracks in Σ_out (constant multiplicity): role/phase states; three color tokens and ⊥; RUN work alphabet of the fixed U; error-chain symbols. The total |Σ_out|=β can be chosen polynomial in s to host these tracks.
- Probe carriers: The four boundary positions provide base-β digits (b_1,b_2,b_3,b_4) coding b∈[β^4]; per-edge Cout–out permits copying these digits unchanged along special carrier tracks. A small synchronizer ensures two carriers meet and agree before the RUN consults b.
- Robustness: Any malformed header/index/RUN admits a locally checkable error-chain (as in the LBA construction), so such contexts never constrain f; they can be mapped to ⊥ by f.

Toy sanity checks.
- Tiny β example: Let β=3, reserve 3 colors+⊥ and minimal RUN symbols. With B=2 (four vertices), choose a trivial D; the seam accepts iff colors differ on the unique edge case. The probe signature g(u) can be just the 9-bit (β^4=81 in general; here smaller) table determined by U’s response to the four boundary symbols; in the toy, let g(u) encode u across a few “distinguishing” boundary assignments to see Type(W_u)≠Type(W_v) by direct DP.

Obstacles and mitigations.
- Probe capacity vs. 2^B: We cannot dedicate a distinct boundary 4-tuple per u since β^4≪2^B; instead we use the full truth-table over β^4 probes, mapping u↦g(u)∈{0,1}^{β^4} injectively (possible since β^4≥B). The grammar is uniform; dependence on u enters only via the interior-encoded u read by U.
- Uniformity within types: Because the probe acceptance policy is fixed and depends only on (boundary 4-tuple, interior u), all representatives of the same type (i.e., same interior u and no errors) yield identical extendibility tables, satisfying type-invariance.
- Ensuring active τ_u exist: Use Lemma 11 (replacement) and Lemmas 14–15 (pumping) to embed the O(poly(s))-length block adjacent to S within words of length ℓ_pump or ℓ_pump+1 on each side, without changing the type.

Next concrete steps (incremental, testable).
1) Formalize Lemma A. Specify: (i) the base-β boundary-digit carriers and their radius-1 propagation; (ii) the U-simulation that, given (u,b), outputs g(u)[b] and how Cout–out enforces acceptance iff 1. Prove type-separation: u≠u′ ⇒ the truth tables differ in at least one b.
2) Formalize Lemma C. Write the exact row interface and verdict wiring so that (Edge=0) ⇒ unconditional acceptance, (Edge=1) ⇒ require Color(S_1)≠Color(S_2). Include the local refutation for malformed runs.
3) Prove Lemma B: a clean pumping/replacement embedding argument placing blocks within contexts of the required lengths while preserving type.
4) Package the construction P_D and the equivalence “G 3-colorable ⇔ (F1)-feasible f exists,” then add the ⊥-repetition rules (Lemma D) to transfer hardness to the O(1)/Ω(n) classification.

Why this is progress.
- It addresses the main unresolved pieces flagged by the verifier: a type-invariant “activity” mechanism and a pairwise constraint that matches (F1). The boundary-probe signature provides exponentially many distinct types with β=poly(s) and radius-1 rules; the seam gadget exactly encodes edge constraints suitable for (F1). These are compact, checkable subclaims that can be verified independently using the O(kβ^2) DP.

## Round 0002 — 2025-08-28T11:43:33Z

Focus and plan for this round
- Goal: push the NEXPTIME-hardness via Succinct 3-Coloring (S3Col) by cleanly aligning (F1) mid-consistency with pairwise edge constraints “color(u) ≠ color(v) when D(u,v)=1”. Make (F2) vacuous via ⊥-filler. Deliver concrete, radius-1 gadgets and type-separation lemmas that are checkable and do not rely on per-type ad hoc rules.
- This round: (i) state and justify a “boundary-anchored vertex-type separation” lemma; (ii) design a seam simulation gadget that, on active vertex–vertex pairs, computes D(u,v) in the bridge and enforces inequality if D(u,v)=1 while accepting any colors if D(u,v)=0; (iii) detail the ⊥-filler that neutralizes (F2); (iv) give a small B=2 sanity check; (v) log minor clarifications for output.md.

Context recap from last round
- Use S3Col: input is circuit D of size s deciding an undirected succinct graph on V={0,1}^B (we can symmetrize by using D′(u,v):=D(u,v)∨D(v,u)). Set B=s^{c0}, choose |Σ_out|=β=s^{c1} with c1≫c0. ℓ_pump=2^{Θ(β^4)}≫poly(s) so we have ample pumping room. We only need vertex-types (no clause-types).

Key new lemmas (informal statements, why useful, and how to validate)
1) Boundary-anchored vertex-type separation (existence of 2^B distinct vertex types)
- Statement. There exists a β-normalized, radius-1 schema (global Cin–out, Cout–out) with constant role/phase/error/work tracks such that for each index u∈{0,1}^B there is at least one context type τ_u in the context set C (realizable by some input word w_1 S w_2) with the following properties:
  (A) Vertex activation near S on the left side: if the two-node window S is colored (non-⊥) and the left side is intended to be a vertex, then a radius-1 forced “index header” of length Θ(B) is determined immediately to the left of S; this header copies the B input bits (RID-track) adjacent to S via Cin–out, so the u encoded in input is fixed. All malformed attempts can be locally refuted by error-chains.
  (B) Probe distinguishability: there exists a fixed 4-tuple b⋆ of boundary outputs on the four boundary nodes of w_1 (two leftmost and two “second” nodes) such that E_{w_1}(b⋆)=1 iff the input RID next to S equals u. Consequently, if u≠u′, then τ_u≠τ_{u′} (types differ on b⋆).
- Why useful: gives us exponentially many pairwise distinct vertex context types, allowing a map f on types to encode a coloring χ(u)∈{RED,GRN,BLU}.
- How enforced at radius 1. We predefine a reserved “probe-left” boundary pattern b⋆ using symbols that (i) fix a role/phase state at the two boundary layers and (ii) enable a single deterministic pipe that walks inward for B steps, checking at position j that the RID-output symbol agrees with the local input bit (Cin–out) and with a constant j-th bit of the target u. If any check fails, the pipe has no legal continuation (no extension). If all pass, the pipe halts into a neutral filler. Because the pipe is unique, the existential nature of types cannot “cheat” by choosing a different interior: existence of a completion under b⋆ exactly encodes “RID equals u”.
- Validation: The pipe is exactly the standard radius-1 pointer gadget (Section 3 in the attached paper) but with a bounded, fixed length B and equality tests via Cin–out. The existence of contexts carrying any prescribed B-bit RID adjacent to S is guaranteed by considering input words over Σ_in; malformed inputs are harmless due to error-chains.

2) Seam-simulation gadget for pairwise constraints (edge gating and color inequality)
- Statement. There is a radius-1 out–out schema such that for any ordered pair of active vertex types (τ_u on the left, τ_v on the right):
  (i) If D(u,v)=0, there is a completion irrespective of the colors f(τ_u), f(τ_v) placed on the window S; (ii) If D(u,v)=1, there is a completion iff the two colors differ; and (iii) For any pair where at least one side is inactive (no well-formed vertex near S), there is always a completion (via ⊥-plumbing), independent of the other side.
- Why useful: This aligns (F1)’s universal quantification with 3-coloring constraints: f feasible ⇔ χ(u)≠χ(v) for all edges (u,v).
- Seam layout (radius-1):
  • Near-boundary index tapes. On each side, the Θ(B)-long RID tape sits immediately adjacent to S (by Lemma 1). We also place a fixed-size “header acceptance” bit (valid if the embedded header equals the constant D-encoding)
  • Bridge tableau. On the wb◦wc bridge, allow a standard 1D row-by-row simulation of a fixed universal TM U for poly(s) steps to evaluate D(u,v), reading the two B-bit tapes and the constant header. Each row transition is enforced by nearest-neighbor Cout–out constraints; malformed rows can be refuted by error-chains as in §3.
  • Acceptance signals. The simulation emits a bit EDGE∈{0,1}. Local rules at S admit completion if (EDGE=0) or (EDGE=1 and colors on S are unequal). If EDGE=1 and colors equal, all continuations are forbidden. All these checks involve only constant-size neighborhoods around S.
- Validation: Standard “computation-by-tiling” for 1D simulations as in §3 and §4; run time is poly(s)≪ℓ_pump and space sits in wb◦wc (length ≥ℓ_pump). Robustness via error-chains ensures that malformed headers and/or runs never constrain f.

3) Neutralizing bridging (F2) by a ⊥-filler
- Statement. Add a self-looping ⊥-track and allow wz (for any z≥1) to be filled entirely with ⊥ irrespective of boundary outputs adjacent to S. Then for every context (w_1,S,w_2) and z, the partial S-label from f extends by filling both sides with ⊥, making (F2) hold vacuously.
- Why useful: Reduces the classification to (F1) only on our instances, hence the 3-way classifier must output O(1) iff a feasible f exists and Ω(n) otherwise; the Θ(log* n) case is eliminated for our reduction family.
- Validation: This is compatible with the DP in output.md (Theorem 5) and with Lemma 1 (finite-Z) but stronger: it makes every z trivially feasible. It does not interfere with (F1) since (F1) instances use one copy of each side and the bridge; those are left unchanged by the ⊥-filler language.

Blueprint of the alphabet/tracks and local rules (radius-1, β=poly(s))
- Fixed tracks in Σ_out (constant per node, combined into a single symbol):
  1) Role/phase: {HEAD, VERT, RUN, PAD, PIPE, ERR_k, …}×{phase modulo c}.
  2) Header bits: output track that must match a fixed string enc(D) under HEAD-role; Cin–out ties head-bit outputs to Σ_in bits so only inputs matching enc(D) allow HEAD.
  3) RID tape: B bits adjacent to S on each vertex side; Cin–out enforces that RID-bit output equals the input bit at that node (copy constraint) when in VERT-role.
  4) Bridge-run work alphabet: constant-size tape symbols for U.
  5) Color tokens and ⊥ at S: {RED, GRN, BLU, ⊥} available only at S positions (enforced by phases/roles around S).
  6) Error-chain alphabet from §3 to refute malformed fragments locally.
- Cin–out usage: ties HEAD bits to input; ties RID bits to input; allows generic symbols elsewhere. This guarantees that whether a vertex is well-formed is determined by inputs (hence activity is type-invariant once the boundary role is fixed).
- Cout–out (nearest-neighbor): enumerates allowed pairs that (i) implement the deterministic PIPE for Lemma 1 (RID-forcing/probe), (ii) implement the RUN tableau rows and acceptance edge-bit, (iii) enforce color inequality test when EDGE=1, and (iv) allow ⊥-plumbing everywhere if chosen.

Soundness/completeness sketches of the reduction (S3Col → FFE(F1))
- Completeness (G 3-colorable ⇒ feasible f exists): choose χ:V→{R,G,B}. For each vertex-type τ_u, set f(τ_u)=χ(u); for all other (inactive) types, set f(τ)=⊥. For any ordered pair, if both are active, the bridge computes EDGE=D(u,v). If EDGE=0, completion exists; if EDGE=1 then χ(u)≠χ(v) ensures completion by inequality check. All non-active pairs are vacuous due to ⊥-plumbing. Hence (F1) holds.
- Soundness (feasible f ⇒ G 3-colorable): for each u, define χ(u)=f(τ_u) (well-defined since otherwise the ordered pair of two τ_u representatives would violate (F1) via the bridge rules that require consistent acceptance conditions). For any edge (u,v), the bridge yields EDGE=1; thus (F1) forces f(τ_u)≠f(τ_v). Therefore χ is a proper 3-coloring.

Toy sanity check (B=2)
- Suppose V={00,01,10,11} and D encodes a 4-cycle 00–01–11–10–00. Contexts include τ_00,…,τ_11, each with RID=that index adjacent to S on the left or right side. The bridge-run reads those 2-bit RID tapes, computes EDGE (using D hardwired), and enforces inequality iff EDGE=1. A valid f assigns a 3-coloring of the 4-cycle; the DP on each (F1) instance accepts exactly under that condition.

Obstacles and how we address them
- Type invariance vs. interior nondeterminism: Lemma 1’s PIPE is deterministic and initiated solely by boundary outputs; if the probe is selected, the only way to extend is to carry the unique pipeline and match the B-bit RID from input. Thus the existence/non-existence of an extension under the probe is a property of the fixed input substring near the boundary, hence of the type.
- Non-edges must accept any colors: We ensure the bridge-run emits EDGE=0 in that case, and acceptance rules ignore S colors. Since (F1) only needs existence of one completion, this suffices.
- Symmetry of edges: Replace D by D′(u,v)=D(u,v)∨D(v,u) in the instance to guarantee undirected adjacency while keeping size poly(s).
- Global inputs adversarial: Our complexity claim is worst-case over inputs. The construction ensures malformed inputs are always completable (⊥/error-chain) and do not constrain f; active contexts (those that matter) arise from many input strings (enough to ensure all τ_u exist as realizable types), which suffices because (F1) quantifies over all contexts.

Gaps/clarifications in output.md (minor)
- Composition lemma wording (Lemma 2): the proof mentions “two internal adjacencies across the seam” using (p_left,p_right); to avoid confusion, note explicitly that (i) the adjacency within u between its last two outputs and within v between its first two outputs are already captured by Type(u), Type(v), and (ii) the seam adjacency is only between the last output of u (p_right) and the first of v (p_left); the boolean-matrix view in Appendix A already encodes this correctly.
- Types vs. interior inputs: Definition currently says “interior inputs may be arbitrary”; in our β-normalized model inputs are fixed per instance. It may help to state explicitly that E_w(a) is computed with the interior inputs fixed to those of w; this is consistent with Lemmas 10–15 in the attached paper and with the DP in Theorem 5.

Why the new lemmas are auditable now
- Lemma 1 reduces to a finite-radius PIPE with length B=poly(s) (bounded independent of ℓ_pump) that is checkable by local tables; E_w(b⋆) depends only on the fixed w (hence on Type(w)). The verifier can test a concrete instantiation on a small B (e.g., B=2) by brute-force DP to observe the extendibility difference.
- The seam simulation is a standard 1D tableau simulation; a checker can write out the row alphabet and the local transition constraints for a small instance (with a 2-input AND gate as D) and verify the edge/inequality behavior.

Next steps (concrete, checkable deliverables)
1) Write the explicit adjacency fragments:
   - RID-PIPE: list states for “step j” (0≤j≤B), legal successors, and Cin–out masks that tie role=RID,j to the input bit.
   - Bridge-run: define the U-row alphabet and per-row local constraints; define the EDGE output; layout how it reads RID tapes.
   - Color-check rules at S conditional on EDGE.
2) Prove the vertex-type separation lemma formally: select b⋆, show E_w(b⋆)=1⇔RID(u) and that u≠u′ gives differing extendibility tables ⇒ distinct types.
3) Formalize the soundness/completeness argument into a theorem “S3Col ≤_m FFE(F1) for β-normalized r=1” with explicit size bounds (|Σ_out|=poly(s), tables of size Θ(β^2)).
4) Integrate the ⊥-filler rules and note that (F2) is vacuous; state the corollary “3-way classification is NEXPTIME-hard on our family”.

Potential stretch: tighten the (F2) finite-Z bound in output.md from ℓ^2 to lcm(periods)×(max preperiod) (still ≤ℓ^2) and add a remark on how to compute it from the type DFA; not needed for hardness but improves the upper-bound section.

## Round 0002 — 2025-08-28T11:46:48.770121Z

Ideas: boundary-probe separation for vertex types; succinct 3-coloring bridge
- Pivot retained: Reduce Succinct 3-Coloring (NEXP-complete) to Feasible-Function Existence (F1) for β-normalized, r=1 LCLs on oriented paths. Colors at the S-window implement the vertex coloring; the bridge between two contexts simulates D(u,v) and enforces “≠” iff D(u,v)=1.
- New ingredient (type separation without per-type tailoring): Design a fixed family of boundary-output “probe patterns” Q_j (one per bit index j∈[B]) that, when set on the four boundary nodes of a context, uniformly trigger a radius-1 pointer that reads the j-th bit of an interior u-block positioned O(1) from S. The existence (extendibility) of a completion under probe Q_j equals that bit. Therefore the vector (ext_Q_j)_{j=1..B} encodes u, and different u yield different types. This avoids the flawed idea of “programming arbitrary boundary truth tables per type”.

Clean statements (to be proven/verified)
- Lemma A (Probe-bits). There exist global Cin–out, Cout–out and, for the left-side vertex-context shape W(u) (|W(u)|∈{ℓ_pump,ℓ_pump+1}), a fixed family of boundary-output 4-tuples {Q_j: j∈[B]} such that, for any boundary input assignment a, Gw:=W(u) has a legal completion with boundary outputs Q_j on its four boundary nodes iff the j-th bit of u equals 1. Consequently, Type(W(u))≠Type(W(u′)) for u≠u′.
  Why useful: Gives 2^B distinct vertex context types using only B=poly(s) probes, well within the β^4 boundary assignments. The construction is uniform and radius-1 (probes trigger a constant-symbol “probe role” that spawns a pointer reading the port region where u’s bits are pre-exposed near S; failures dead-end).
- Lemma B (Canonical vertex-context family). There exist two canonical context shapes L(u):=W_L(u) S F_R and R(v):=F_L S W_R(v) with |W_L(u)|,|W_R(v)|∈{ℓ_pump,ℓ_pump+1} and fixed fillers F_L,F_R (no vertex data) such that:
  (i) L(u) and R(v) are active (contain well-formed u- or v-blocks anchored O(1) from S),
  (ii) Type(L(u)) (resp. Type(R(v))) is determined by u (resp. v) via Lemma A, and
  (iii) any other context type without such a block is inactive: any non-⊥ color at S leads to a locally-detectable dead end; ⊥ always extends via neutral plumbing.
  Why useful: Ensures exactly one (or at least a unique canonical) type per vertex; non-vertex types force f(·)=⊥ by (F1) universal quantification.
- Lemma C (Bridge semantics for 3-coloring). There is a fixed, radius-1 seam gadget (placed across the concatenation of L(u) and R(v) in an (F1) instance) that locally simulates a universal TM U for poly(s) steps to evaluate D(u,v) using:
  (i) a copy of D stored in each block (copied from Σ_in via Cin–out), and
  (ii) the B-bit ports of u (on the right edge of L(u)) and v (on the left edge of R(v)).
  The bridge admits a completion iff [D(u,v)=0] or [D(u,v)=1 and the two S colors differ]. Malformed simulations are locally refutable (standard error-chain); spurious accept is impossible due to row-to-row radius-1 checks.
  Why useful: Matches (F1)’s universal pair check with “≠ on edges, trivial on non-edges”.

Sketch of constructions (radius-1 and uniform)
- Vertex block (near S): A constant-role phase track places a “port zone” of length Θ(B) immediately adjacent to S inside W_L(u) (to the right) and W_R(v) (to the left). This port zone carries the B bits (u_1,…,u_B) (resp. v) twice with parity/check bits; its layout is enforced by Cout–out (deterministic pattern given activation at S). The rest of the block includes a self-delimiting header and a RUN zone encoding U’s tableau on input D (copied from the input track) and the index, all standard and locally checkable.
- Probe patterns Q_j: Four special outputs on the boundary (two per side of the word) encode a “probe-bit j” token with local phase. Cout–out has rules: if a probe token sits on the boundary, the unique legal continuation from that boundary is a finite-state pointer that advances into the port zone, lands on the j-th cell, and requires its bit=1; otherwise no outgoing legal edge exists in the layered DP. This uses O(1) symbols and maintains radius-1 (pointer heads advance cell-by-cell with locally checkable direction and countdown in unary up to j encoded by constant number of “repeat until phase X” steps; the step count is derived by walking, not stored in boundary symbols). Result: extendibility under Q_j discriminates u_j.
- Bridge simulation: In wa S1 wb wc S2 wd with wa S1 wb=L(u), wc S2 wd=R(v), the seam region wb wc contains a fixed-width (poly(s)+O(B)) “bridge RUN” where U takes as inputs (D, u, v) read from the adjacent port zones and computes d:=D(u,v). Cout–out enforces single-step tableau constraints, with local error-escape allowed only for malformed inputs; a dedicated final row propagates d to a 1-bit flag near S2. Separate local rules check “if d=1 then colors at S1,S2 must be unequal; if d=0 then no constraint on colors”.

Correctness of the reduction (succinct 3-coloring ⇒ (F1) and vice versa)
- Completeness: If G is 3-colorable, fix χ: {0,1}^B→{RED,GRN,BLU}. Define f on vertex types by f(Type(L(u))) = χ(u) and f(Type(R(v))) = χ(v); define f(τ)=⊥ for all inactive (non-vertex) types. For any ordered pair of contexts in the (F1) check, either both are vertex-types (u,v): the bridge computes D(u,v) and enforces χ(u)≠χ(v) when D=1 (holds by proper coloring), or at least one is inactive, in which case ⊥ plumbing makes the DP succeed. Hence (F1) holds.
- Soundness: If some f satisfies (F1), read χ(u) := f(Type(L(u))). For any u,v with D(u,v)=1, the bridge between Type(L(u)) and Type(R(v)) must be extendible; the simulation forces χ(u)≠χ(v). Thus χ is a proper 3-coloring. Non-vertex types cannot be mapped to a color, else some pair (inactive, anything) would violate (F1) due to the local “colors-only-when-vertex” gating; therefore setting them to ⊥ is necessary and consistent.

Neutralizing (F2) and hardness for the tri-class classifier
- As in previous rounds, add a global ⊥-filler language permitted on repeated sides w_i^z independent of context; then (F2) is true for every f by Lemma 1 in output.md. Therefore the classifier answers O(1) iff (F1) holds, and Ω(n) otherwise (Theorem 8 machinery). Since feasible-function existence (mid-consistency) is NEXPTIME-hard by the reduction above and in NEXPTIME (output LCL_classification.pdf), the three-way classification is NEXPTIME-hard.

Examples and sanity checks
- Tiny case B=2: u∈{00,01,10,11}. Define Q_1,Q_2 probes. For the four left-contexts L(u), the 2-bit vector (ext_Q1, ext_Q2) equals u. The bridge runs D on pairs and requires color-inequality only on edges.
- DP perspective: The probe under Q_j forces a unique finite path in the layered automaton that reaches the j-th port cell; existence of an outgoing edge at that cell hinges on the bit=1. The bridge tableau likewise becomes a layered composition check; any inconsistency blocks all paths, so the DP precisely mirrors the existence of a legal completion.

Obstacles / things to make explicit next
- Probe pointer encoding: Make the boundary probe tokens and the in-block “port zone” phases explicit, with a table showing (current symbol, next symbol) pairs permitted by Cout–out. Verify that the pointer is guaranteed to stop on the exact j-th cell (walk semantics) without storing j in the boundary symbol (to keep alphabet constant).
- Seam I/O interface: Specify how the bridge RUN reads u and v: either by duplicating the B-bit ports directly adjacent to the bridge (preferred), or via pointers with locally checkable handshakes. The former is cleaner and fits ℓ_pump.
- Error-chain integration: Ensure malformed blocks are always completable via the error alphabet (like §3), and that the color-at-S activation is allowed only when the vertex role is present, preventing spurious constraints on inactive types.
- Size bookkeeping: Enumerate the tracks and show |Σ_out| = β = poly(s) suffices: roles/phases O(1), colors+⊥ (4), error alphabet O(1), U’s work tape O(1), plus finitely many probe/pointer states O(1). The “O(B)-long” ports are spatial, not alphabetic.

Gaps/notes on output.md
- The core lemmas (type bound, composition, periodicity, finite-Z, DP) are sound and sufficient for our verifier. Minor clarification: in Theorem 5 the DP assumes fixed input string; the construction adapts by restricting layer i to Cin–out[Input(i)]. No action needed.
- The bound Z≤ℓ^2 (Cor. 4) is non-tight but usable; we will carry it as-is for (F2) neutralization.

Next steps (auditable deliverables)
1) Formalize Lemma A with a concrete probe alphabet and Cout–out snippet; prove the “iff u_j=1” claim rigorously.
2) Specify the canonical L(u), R(v) layouts with exact offsets: positions of the port zones, header footprint, and RUN rows. Provide a bound O(poly(s)) for occupied length.
3) Write the seam tableau interface and prove Lemma C: that the only accepting completions correspond to the correct d = D(u,v) and enforce inequality when d=1.
4) Package the reduction C↦P_D, including ⊥-filler for (F2), and finalize the completeness/soundness argument with explicit references to the output lemmas (replacement, pumping) to guarantee existence of required contexts within lengths ℓ_pump or ℓ_pump+1.

## Round 0002 — 2025-08-28T11:48:05.813325Z

Ideas — pivot formalization via succinct 3-coloring and type separation
- Goal of this round: Make the NEXPTIME-hardness route auditable by (i) aligning (F1) semantics with a pairwise constraint problem (succinct 3-coloring), and (ii) pinning down a concrete, radius-1 mechanism that guarantees exponentially many distinct context types (one per vertex u ∈ {0,1}^B) even though f is defined on types (not concrete words). We state small lemmas with proof sketches and bookkeeping, and we flag minor clarifications for output.md.

Claim A (3-coloring matches (F1)). Why useful here: It resolves the quantifier mismatch that plagued 3SAT-style reductions; (F1) enforces universal pairwise constraints, exactly color(u) ≠ color(v) for edges.
- Source: Succinct 3-Coloring instance D: {0,1}^{2B} → {0,1}, circuit of size s; vertices V = {0,1}^B.
- Target semantics (mid-consistency (F1) only): Context types corresponding to vertices τ_u on both sides; the (F1) bridge between (τ_u, τ_v) must succeed (extend) iff either (i) D(u,v)=0 (non-edge; vacuous) or (ii) D(u,v)=1 and f(τ_u) ≠ f(τ_v).
- Implementation sketch: When S is colored, the bridge launches a row-by-row, radius-1-checked U-simulation on input (D,u,v) embedded in the inputs near the seam. Local rules guarantee: if D(u,v)=1 and colors equal, the bridge dead-ends; otherwise the bridge always extends. All other role pairings and inactive contexts allow trivial completions (⊥-plumbing). This aligns (F1) with 3-colorability.

Claim B (Type separation via boundary test family; B.1). Why useful here: Ensures at least 2^B distinct context types τ_u exist, allowing f to encode a color per vertex.
- Parameters: Choose integers B = s^{c0}, β = s^{c1} with 1 ≪ c0 ≪ c1 so that β ≥ B and ℓ_pump = 2^{Θ(β^4)} = 2^{poly(s)}.
- Reserved test boundary assignments: Fix one boundary-input 4-tuple a⋆. Reserve a collection J of size M := β distinct boundary-output 4-tuples {b_t : t ∈ [M]}; choosing b_t means “activate test id t”. All other boundary outputs are filler. This uses only O(β) reserved symbols (poly(s)).
- Input layout inside τ_u: The input track near the left end contains (i) a mask table row M_t ∈ {0,1}^B for each t ∈ [M] (packed contiguously and self-delimited), and (ii) a vertex-index block RID(u) ∈ {0,1}^B stored once in a fixed phase near S. The right end is symmetric or carries only fillers (not used for separation). We require well-formedness by radius-1 local rules; malformed encodings are locally refutable by error chains (as in §3 of the reference), hence “inactive.”
- Local test protocol: Under the boundary assignment (a⋆, b_t), the out–out rules enable a pointer that (1) walks from the left boundary to read the t-th mask row M_t, (2) walks to the RID block, and (3) computes parity ⟨M_t, u⟩ mod 2 using a fixed U-simulation in O(B) steps, all radius-1 checkable. If parity = 1, the pointer can terminate in an accepting sink; if parity = 0, no accepting continuation exists (the DP gets stuck). For all other boundary-output assignments (non-reserved), we permit a trivial completion (⊥ buffers) so they don’t affect separation.
- Linear independence: Pick M ≥ B masks whose rows form a full-rank B×M matrix over GF(2); since M=β ≥B, this is possible. Then the signature map Sig(u) := (⟨M_t,u⟩)_{t∈[M]} ∈ {0,1}^M is injective on {0,1}^B. For the fixed boundary-input a⋆, the extendibility table for reserved outputs is exactly E_{w(u)}(a⋆)[b_t] = Sig(u)_t. Consequently, u ≠ u′ ⇒ Type(w(u)) ≠ Type(w(u′)).
- Radius/size: The checker is constant-radius (pointers and row-to-row tableau), uses a constant work alphabet, with β = poly(s) large enough to host reserved symbols. The mask table sits in the input (binary) and is read by the pointer; malformed tables are harmless due to error chains.

Claim C (Realization of exponentially many vertex context types; B.2). Why useful here: Guarantees that, among contexts w_1 S w_2 with |w_i| ∈ {ℓ_pump, ℓ_pump+1}, there are at least 2^B distinct types representing all vertices u.
- Using Claim B, fix for each u an input string W(u) that realizes the left block (table + RID(u)), a neutral S, and a right filler block; ensure via pumping (Lemma 14/15) that both sides have length ℓ_pump or ℓ_pump+1 and that replacement preserves type (Lemma 11). Then Type(W(u)) are all distinct and populate C (the context-type domain for f). The same construction symmetrically realizes right-side vertex contexts τ_v.

Claim D (Bridge gating for succinct adjacency; B.3). Why useful here: Implements the pairwise constraint “if edge then colors differ, else vacuous” under (F1).
- Input near both sides supplies (i) a copy of D’s encoding (as in the LBA proof, stored in binary and copied by outputs), (ii) the local RID blocks (u and v). Upon non-⊥ colors at S, the bridge runs U on input (D,u,v) for poly(s) steps; rules enforce success as follows:
  • If the simulation yields D(u,v)=0 (non-edge), accept irrespective of colors by enabling a trivial acceptor after the run.
  • If D(u,v)=1 (edge), accept iff two color tokens at S are different; if equal, dead-end. The “color-different” test is purely local across the S seam.
- Robustness: Inactive/malformed blocks admit the standard error chains; colored S then cannot complete and hence forces f to map such types to ⊥.

Claim E (From (F1) to classification hardness; B.4). Why useful here: Transfers hardness from (F1)-feasibility to the 3-way decision by neutralizing (F2).
- Add a global ⊥-filler language for repetitions so that for any context (w_1,S,w_2) and any z≥1, w_1^z and w_2^z can be labeled with ⊥ (independent of inputs). Thus (F2) holds vacuously for any f. Therefore, deciding whether (F1) holds (i.e., whether G is 3-colorable) is as hard as the 3-way classification on our instances.

Proof sketches for soundness/completeness (FFE(F1) ↔ 3-coloring)
- Completeness: Given a proper 3-coloring χ: V → {RED,GRN,BLU}, define f(τ_u)=χ(u). For any pair (τ_u,τ_v), the bridge computes D(u,v); if non-edge it accepts; if edge, χ(u)≠χ(v) by proper coloring, so acceptance follows. Inactive contexts mapped to ⊥ are trivially satisfied.
- Soundness: If f satisfies (F1), define χ(u)=f(τ_u). For any edge (u,v), (F1) requires that the bridge succeeds; the only way it can succeed on edges is with χ(u)≠χ(v). Hence χ is a proper 3-coloring.

Instantiation details to verify next (concrete, checkable)
1) Pointer/test gadget (radius-1): Specify the constant-size out–out automaton for the test: states “go-to-row t”, “scan mask bits”, “accumulate parity”, “jump to RID”, “accumulate parity”, “accept if 1”; verify all transitions read-only from input and are nearest-neighbor.
2) Mask addressing with small boundary ID: Limit test IDs t to [β], each encoded by one of β reserved symbols. In input, arrange the mask table as β rows of length B with clear row delimiters; the “go-to-row t” stage follows row delimiters counted via the ID implicit in the chosen boundary symbol. Local rules ensure the pointer’s row-counter matches the selected symbol; wrong row ⇒ dead-end (so the DP cannot cheat by reading a different row).
3) Existence of contexts of length ℓ_pump: Use pumping/replacement to pad left/right to prescribed lengths without changing types, ensuring that (i) the reserved boundary tests remain available at the outermost two boundary nodes, and (ii) the interior test and RID regions remain intact.
4) Bridge TM: Use the same row-by-row U-simulation as in §3 to evaluate D(u,v) in poly(s) time. Errors are locally refutable; malformed inputs cannot permit a colored-S completion, making such contexts inactive.
5) Size bookkeeping: Σ_out tracks: roles/phases, 3 colors + ⊥, error alphabet, and U’s work alphabet are constant; plus β many reserved test symbols and a constant amount of plumbing. Tables Cin–out, Cout–out remain size poly(β)=poly(s). Input length is unbounded and holds the mask table, RID blocks, and circuit D wherever needed.

Toy example (sanity)
- Take B=2, β=8, masks M_t ∈ {00,01,10,11,01,10,11,00} (first 4 rows linearly independent). For u∈{00,01,10,11}, the reserved boundary outputs b_t induce an extendibility pattern equal to the parity vector across the first 4 tests; the four τ_u types differ on these 4 bits. On the bridge, if D is a 4-cycle adjacency, f(τ_u) = u mod 3 gives a valid coloring; pairs on edges with equal colors are forbidden locally.

Notes/obstacles
- Mask-table on input vs. grammar size: We deliberately read mask rows from input to avoid hardwiring O(β·B) bits into Cout–out; only the per-test control (β distinct boundary tokens) are baked into Cout–out.
- Dependence only on type: The separation relies on fixed boundary-input a⋆ and the reserved family {b_t}. For any two words with the same input content (table + RID) but otherwise different interiors, the existence or non-existence of a completion under (a⋆, b_t) is forced by the local test, hence is type-invariant. Distinct u’s yield distinct yes/no pattern across {b_t}, so types differ.
- Ensuring non-edges are vacuous: The bridge must accept for D(u,v)=0 irrespective of colors. We implement this by enabling a finishing acceptor after the U-run concludes “0”, independent of S’s colors.

Minor clarifications/suggestions for output.md
- Types and fixed inputs: In “Definitions (radius 1)”, clarify that E_w(a) is with respect to the fixed input string on the entire path; the parenthetical “interior inputs may be arbitrary” could be read as allowing the verifier to choose internal inputs. For our model, the input word is fixed; the extension existentially quantifies outputs only.
- Context set C size: Where LCL_classification.pdf states “Note |C| ≤ ℓ_pump,” consider adding a short justification: a context type is a specific element of the global type set T realized by a word of the form w_1 S w_2 with |w_i| ∈ {ℓ_pump,ℓ_pump+1}; hence |C| ≤ |T| = ℓ_pump.

Next steps
- Write the explicit local rule set for the boundary test gadget and prove the Type-Separation Lemma rigorously (injectivity from M≥B linearly independent masks).
- Specify the seam U-simulation interface and the local rule that gates acceptance by “D(u,v)=0 or colors differ.”
- Package the reduction formally: map D ↦ P_D with β=poly(s), prove “G 3-colorable ⇔ (F1)-feasible f exists”, and add the ⊥ repetition to neutralize (F2). This will give a clean NEXPTIME-hardness statement for the 3-way classification.

## Round 0003 — 2025-08-28T11:54:24.396122Z

Status and focus
- Objective: firm up the NEXPTIME-hardness reduction by fully specifying two auditable gadgets: (i) a per-bit boundary probe that separates 2^B vertex indices into distinct context types; (ii) a seam gadget that simulates D(u,v) across the bridge and enforces color-inequality iff D(u,v)=1. Also enforce “color gating” so only canonical vertex contexts may carry colors, making all non-canonical types inactive and mapped to ⊥.
- This round delivers precise lemmas with radius-1 local behavior, alphabet budgeting, and proof sketches that can be checked by the O(k β^2) DP on toy instances (e.g., B=2).

Gaps in output.md (minor clarifications)
- Types vs. fixed inputs: output.md’s Definitions allow “interior inputs may be arbitrary.” Our reductions assume the interior inputs are fixed to the instance string; E_w(a) is computed w.r.t. that fixed string. Suggest adding a parenthetical: “if the model fixes interior inputs, E_w(a) is computed with respect to those fixed inputs,” to avoid ambiguity when we later rely on interior-encoded indices.
- Context set C: it is useful to note explicitly that C consists of types realized by words of the form w_1 S w_2 with |w_i| ∈ {ℓ_pump, ℓ_pump+1}. This plays a role in gating colors and in counting how many “active” types we can realize.

Lemma TS (Type Separation via per-bit boundary probes)
- Parameters: B = s^{c0}, β = s^{c1} with c1 ≥ c0 so β ≥ B. Fix one boundary-input pattern a⋆ ∈ Σ_in^4.
- Port zone layout (left contexts): In every canonical left vertex block W_L(u), immediately to the right of S there is a port zone of length B with two read-only subtracks: Addr ∈ {1,…,B} (hardwired per position) and RID ∈ {0,1} (copied from input via Cin–out). Outside the port zone and a short header, the block is neutral PAD/error-plumbed.
- Reserved boundary outputs: For each j ∈ [B], define a distinct reserved 4-tuple Q_j of boundary outputs (the four symbols on the two leftmost and two rightmost boundary nodes of w_1). Under Q_j, Cout–out allows only a deterministic “probe-j” pipeline that flows from the left boundary across w_1, enters the port zone, and stops at the unique cell where Addr=j. This pipeline is implemented by a pointer head state P_j carried on a dedicated track; adjacency rules enforce P_j → P_j deterministically, moving one step per edge. At the target cell, the only legal successor enforces RID=1 at that cell; if RID=0, the pipeline has no legal continuation (dead end). Upon RID=1, the pipeline transitions to a local ACCEPT sink that splices into a neutral filler for the remaining interior, enabling completion.
- No error escape under probes: Under boundary outputs Q_j the error-chain alphabet is disabled (no error transition is permitted from P_j states). For all non-reserved boundary outputs, standard error-chains and PAD are enabled.
- Claim (formal). For any canonical left vertex word L(u) and fixed boundary inputs a⋆, E_{L(u)}(a⋆)[Q_j] = 1 if and only if u_j = 1. Moreover, for j ≠ j′, Q_j ≠ Q_{j′}, and under any other 4-tuple, E behaves as generic PAD/error-plumbing.
- Why type separation holds: Let Sig(u) ∈ {0,1}^B be (E_{L(u)}(a⋆)[Q_j])_{j=1..B}. Then Sig(u)=u, so u≠u′ ⇒ Sig(u)≠Sig(u′). Hence Type(L(u))≠Type(L(u′)). This uses only global Cin–out/Cout–out and is radius-1.
- Alphabet budget: the pointer heads P_j and reserved Q_j consume O(B) symbols; permitted since β ≥ B and Σ_out size is β = poly(s). The rest of the tracks (roles/phases, PAD, error, etc.) are O(1).
- Why useful: Gives ≥ 2^B distinct left-context types τ^L_u. A symmetric construction gives ≥ 2^B right-context types τ^R_v.

Lemma CG (Color gating for canonical vertex contexts)
- Statement. There is a role/phase track and Cin–out/Cout–out rules such that: the two S nodes may carry non-⊥ colors {RED,GRN,BLU} if and only if the adjacent side is a well-formed canonical vertex block (W_L(u) on the left of S, W_R(v) on the right of S). In all other contexts, any non-⊥ symbol at S has no legal continuation (dead end), whereas ⊥ at S always admits a completion via PAD/error plumbing.
- Implementation at radius 1: Gate the color tokens by an “ACT” flag emitted by a short handshake subtrack that is present only when the port-and-header structure near S is well-formed. Cin–out forbids colors unless ACT=true. Cout–out disables the error alphabet on transitions emanating from colored S unless ACT=true, so colors on inactive types cannot be extended.
- Why useful: Ensures f can assign colors only to τ^L_u and τ^R_v; all other types must be mapped to ⊥ to satisfy (F1).

Lemma Seam (Seam gadget for succinct adjacency and inequality)
- Statement. There is a fixed radius-1 seam gadget such that for any ordered pair (τ^L_u, τ^R_v): the bridge segment wb∘wc between S_1 and S_2 hosts a 1D tableau of a universal TM U that, in poly(s) steps, reads the B-bit ports u and v and computes d := D(u,v). A final verdict bit EDGE=d is exposed near S_2 together with a forwarded copy of Color(S_1). Local rules at S_2 enforce: if EDGE=0, accept regardless of colors; if EDGE=1, accept iff Color(S_2) ≠ ForwardedColor(S_1). All checks are nearest-neighbor.
- I/O wiring details:
  - Inputs to U: The header encodes C; adjacent to S_1 (resp. S_2) the port zone exposes u (resp. v). A seam handshake opens a corridor across wb∘wc for the tableau. Each tableau row is a constant-width word; Cout–out enforces per-row transitions of U.
  - Verdict wiring: The last row writes EDGE∈{0,1} and copies Color(S_1) into a “forwarded color” register next to S_2. Cout–out contains pairs that check (EDGE=1) ⇒ neighbor-to-S_2 carries a color different from S_2; if equal, no legal transition. If EDGE=0, both equal and unequal are allowed.
- Robustness:
  - Malformed runs or headers: standard error-chain refutations are allowed when ACT=false or when S is ⊥; these make such contexts inactive. Under ACT=true with colors at S, malformed rows have no accepting continuation (no error escape), so (F1) cannot be satisfied by cheating.
- Why useful: Aligns (F1)’s universal pair constraint with 3-coloring: feasibility of f is equivalent to the existence of a proper 3-coloring χ with χ(u)≠χ(v) whenever D(u,v)=1.

Soundness/completeness of the S3Col → FFE(F1) reduction (recap with the new lemmas)
- Active types: For each u, pick canonical L(u) and R(u) shapes; by Lemma TS they yield distinct types τ^L_u and τ^R_u. By Lemma CG, only these may carry colors.
- Completeness: Given a proper 3-coloring χ, set f(τ^L_u)=χ(u), f(τ^R_v)=χ(v), and f(τ)=⊥ for all other τ. For any pair (τ_left, τ_right), if both are active, Lemma Seam computes d=D(u,v) and enforces inequality iff d=1; satisfied by χ. If one or both are inactive, ⊥-plumbing admits completion. Hence (F1) holds.
- Soundness: If f satisfies (F1), read χ(u):=f(τ^L_u). For any edge (u,v) (i.e., D(u,v)=1), Lemma Seam forces f(τ^L_u)≠f(τ^R_v), so χ is a proper 3-coloring. Inactive types cannot be colored by f (or some pair would violate Lemma CG’s gating), hence f(τ)=⊥ there.

Neutralizing (F2)
- Add global ⊥-filler: allow wz to be labeled entirely ⊥ for all z ≥ 1, consistent with any boundary assignments and regardless of interior; S remains untouched; ACT gating remains enforced. Then (F2) holds trivially for any f, reducing the tri-class decision to (F1)-feasibility on our family.

Alphabet and radius-1 bookkeeping (explicit)
- Σ_out tracks (constant unless noted): roles/phases O(1), colors {RED,GRN,BLU,⊥} (4), error alphabet O(1), U’s work alphabet O(1), PAD O(1). Additional O(B) symbols for {Q_j} and {P_j} suffice for Lemma TS. Choose β ≥ c·B for a suitable constant c, which holds for c1 ≥ c0 in β = s^{c1}, B = s^{c0}.
- All constraints are radius-1: probes and pointer moves are enforced by nearest-neighbor pairs; tableau rows by local step relations; color inequality is a single adjacency near S_2.

Sanity check plan (B=2)
- Build a toy instance with β≥8, reserve Q_1,Q_2 and P_1,P_2, port zone of length 2 adjacent to S. Verify by brute DP: E_{L(00)}(a⋆)[Q_1,Q_2]=(0,0), E_{L(01)}=(0,1), E_{L(10)}=(1,0), E_{L(11)}=(1,1). Instantiate a tiny D (e.g., a 4-cycle) and check the bridge DP accepts iff colors differ on edges.

Why this is progress
- We have replaced informal sketches with concrete, radius-1 gadgets and clean lemmas (TS, CG, Seam) that are directly checkable via the DP. The per-bit probe avoids the flawed “single probe” idea and uses only O(B) extra symbols, admissible within β=poly(s). Color gating resolves the earlier consistency issue on multiple types per u. The seam gadget specifies exactly how to locally enforce inequality conditioned on D(u,v).

Next steps (auditable deliverables)
1) Write the small adjacency tables for the probe pipeline: list states {PROBE_L, P_j, ACCEPT, PAD} and allowed successors, and the Cin–out masks that gate colors by ACT. Provide a concrete symbol count to confirm β ≥ B+O(1) suffices.
2) Specify the tableau alphabet for U and the local transition rules that output EDGE and forward Color(S_1); include the exact pair checks near S_2 used to enforce inequality.
3) Produce a B=2 machine-readable instance (inputs and tables) and have the verifier’s O(kβ^2) DP validate: (i) separation under Q_1,Q_2; (ii) seam acceptance iff inequality on edges.
4) Integrate a short note into output.md clarifying fixed interior inputs in E_w(a), and (optionally) the explicit definition of C to avoid ambiguity when we later reference “inactive” types.

## Round 0003 — 2025-08-28T11:55:04.875014Z

Status and aim
- Objective: push the NEXPTIME-hardness reduction (Succinct 3-Coloring → Feasible-Function Existence (F1)) to a checkable state by pinning down two core gadgets with radius-1 rules and polynomial alphabet: (i) per-bit boundary probes that separate 2^B vertex types, and (ii) a seam tableau that computes D(u,v) and enforces color inequality on edges. Also enforce “must-color” only on canonical vertex contexts and neutralize (F2) via ⊥-filling.
- Output.md: no correctness issues spotted for the upper bound (types, DP, finite-Z). Clarification already noted there (“fixed inputs” interpretation) is consistent with what we use below. The NEXPTIME verifier section is still informal; we supply precise, testable lemmas and constraints to move pieces into output.md.

Lemma TS (Per-bit probe type separation; radius-1, β=poly(s))
- Parameters: B = s^{c0}, β = s^{c1} with c1 > c0 so β ≥ B and there is headroom for O(B) reserved symbols.
- Canonical left vertex block L(u): a fixed-format segment W_L(u) adjacent to S with the following O(B)-length subzones (roles enforced by Cout–out phases):
  1) HEAD_C: a short header whose out-track copies (via Cin–out) a fixed binary description enc(C) of the succinct adjacency circuit. Any deviation allows an error-chain in non-probe contexts, but see “Probe discipline” below.
  2) PORT: B consecutive cells immediately to the right of S. Each PORT cell carries two output subtracks: Addr ∈ {1,…,B} and RidBit ∈ {0,1}. Local Cout–out rules require Addr to increase by 1 from left to right, starting at 1 and ending at B, and RidBit to equal the input bit (Cin–out tie) at that node under role=PORT. The vector (RidBit[1..B]) encodes u.
  3) RUN_L: a fixed-width corridor (constant tracks) that hosts a row-by-row 1D tableau for U; unused in the probe; used later by the seam gadget.
- Reserved boundary-output family: Define B distinct boundary-output 4-tuples {Q_j : j∈[B]}. Implementationally, allocate four disjoint reserved symbol families in Σ_out: for the four boundary nodes of L(u), allow only the 4-tuple (ProbeL1(j), ProbeL2(j), ProbeR2(j), ProbeR1(j)) when “probing j”. The set {Probe•(j)} across all j uses O(B) distinct symbols, feasible as β ≥ B and we have ample slack for other tracks.
- Pointer and acceptance (radius-1): Under boundary inputs fixed to a⋆ (choose any constant 4-tuple; e.g., all zeros) and boundary outputs Q_j, Cout–out enforces a deterministic, unique continuation into a “probe mode”: a finite-state pointer head propagates rightward from the left boundary through PORT, matching successive Addr values and halting exactly when Addr=j. The only legal continuation at that cell is to accept iff RidBit=1; if RidBit=0 then the probe path dead-ends (no completion). No alternative transitions (e.g., error-chain) are permitted while “probe mode” is active (see probe discipline below). Outside reserved probes, normal error-chains exist so malformed interiors never constrain f.
- Probe discipline (no error-escape): Cout–out tags each transition in a binary “mode” track. When Q_j is present, the mode is forced to PROBE in a bounded prefix of W_L(u) and error symbols are disallowed in PROBE mode; the only legal edges follow the deterministic pointer/run described above. If any local check fails (role/phase, Addr monotonicity, reaching j, or RidBit), no outgoing pair is allowed ⇒ the DP rejects that boundary 4-tuple.
- Claim (Type-Separation): For any u∈{0,1}^B and any j∈[B], E_{Type(L(u))}(a⋆)[Q_j] = 1 iff u_j=1. Hence the B-bit vector (E(a⋆)[Q_j])_{j=1..B} equals u. In particular, u≠u′ ⇒ Type(L(u))≠Type(L(u′)).
  Why: Under Q_j the continuation is unique; extendibility equals the truth of RidBit[j]=1 in the PORT zone. Because E_w(a) is defined with interior inputs fixed (as in output.md), this bit is a property of the concrete L(u) and thus of its type. Since at least one probe outcome differs when u≠u′, the types differ. Radius-1 holds (only nearest-neighbor checks); Σ_out budget is O(B) for Addr values, O(B) for reserved Q_j symbols, plus O(1) for roles, phases, ⊥, colors, errors, U’s alphabet ⇒ β = poly(s) suffices.

Lemma RG (Role gating and must-color for canonical contexts)
- Gating: Two special role markers are allowed at S’s two nodes: Color and ⊥. Cout–out permits Color tokens {RED, GRN, BLU} at S iff and only if the adjacent interior begins with a well-formed canonical vertex header: HEAD_C followed immediately by the PORT zone (left side for L(·), right side for R(·)). Otherwise (inactive contexts), Color at S has no legal continuation (dead); ⊥ at S always has a legal continuation via neutral plumbing (a self-looping ⊥ language as in the upper bound DP).
- Must-color on active pairs: On a bridge instance between an active left L(u) and an active right R(v) (see next lemma), the seam accepts only if both S nodes carry Color (non-⊥). Thus any feasible f must assign a color to each canonical vertex type; assigning ⊥ would falsify (F1) on its pairings with some active opposite.
- Consequence: f is only free to color canonical types; any attempt to color an inactive type causes (F1) to fail on some pair (inactive, anything) because Color-at-S would be unextendible on the inactive side. Therefore f must map all inactive types to ⊥.

Lemma SG (Seam tableau for succinct adjacency and inequality)
- Canonical right vertex block R(v): symmetric to L(u), with its PORT zone immediately to the left of S; it exposes Addr and RidBit tracks encoding v.
- Seam layout: In the bridge wb∘wc between L(u)’s right side and R(v)’s left side, Cout–out allocates a fixed-width corridor RUN_B that hosts a row-by-row simulation of a universal TM U on input (enc(C), u, v). The input (enc(C)) is present in both HEAD_C zones, and u,v are read from the PORT zones (local wiring at the near seam). Each row transition is enforced by nearest-neighbor Cout–out constraints; malformed rows cannot continue (no error-escape inside RUN_B). The final row writes EDGE ∈ {0,1} at a fixed seam-local cell.
- Acceptance policy at S (radius-1): Local rules enforce: (i) if EDGE=0, accept regardless of colors at S; (ii) if EDGE=1, accept iff the two S colors differ; (iii) on an active-active pair, ⊥ is not permitted (must-color). All checks refer only to the two S outputs and the nearby EDGE bit.
- Robustness: If either side is inactive or malformed (HEAD_C absent, corrupted PORT), the only allowed S symbol is ⊥ and a neutral ⊥-plumbing fills both sides, ensuring these contexts never constrain f (consistent with Lemma RG).
- Correctness: On active-active pairs, the tableau computes D(u,v) in poly(s) time and exposes EDGE correctly; the final local check enforces exactly the 3-coloring constraint “colors must differ on edges and arbitrary on non-edges”.

Canonicality and existence of active types
- Canonical shapes: Define L(u)=W_L(u) S F_R and R(v)=F_L S W_R(v) with W_L, W_R as above and fixed fillers F_L, F_R (PAD-roles). Cout–out recognizes only these shapes as vertex roles (for gating). Any other context is inactive (no Color at S).
- Existence via pumping/replacement: HEAD_C+PORT+RUN zones have length poly(s) ≪ ℓ_pump = 2^{Θ(β^4)}. By Lemma 11 (replacement) and Lemmas 14–15 (pumping), we can place W_L(u) adjacent to S inside words of length ℓ_pump or ℓ_pump+1 on the designated side, preserving the type of W_L(u); ditto for W_R(v). Thus the context set C contains, for each u (resp. v), at least one canonical left (resp. right) type, and Lemma TS gives at least 2^B distinct left-types and 2^B distinct right-types.

Soundness/completeness of the reduction (sketch tightened)
- Completeness (⇒): Given a proper 3-coloring χ: {0,1}^B → {RED,GRN,BLU} of the succinct graph defined by C, define f on canonical types by f(Type(L(u)))=χ(u) and f(Type(R(v)))=χ(v); set f(τ)=⊥ on all inactive types. By Lemma SG, every active-active (F1) pair accepts iff χ(u)≠χ(v) when D(u,v)=1 and always if D(u,v)=0. All other pairings accept via ⊥-plumbing. Hence (F1) holds.
- Soundness (⇐): If some f satisfies (F1), Lemma RG forces f to assign colors to canonical vertex types and ⊥ to all inactive types. Read χ(u):= f(Type(L(u))). For any edge (u,v) with D(u,v)=1, the seam between Type(L(u)) and Type(R(v)) must be extendible; by Lemma SG this implies χ(u)≠χ(v). Non-edges impose no restriction. Thus χ is a proper 3-coloring.

Neutralizing (F2)
- Add a global ⊥-filler language: For any repetition w_1^z and w_2^z (z≥1), Cout–out admits labeling all repeated sides with ⊥ regardless of boundary outputs, without touching S or the vertex-role gating. Then (F2) holds for any f, reducing the three-way classifier to deciding (F1)-feasibility on our instances (NEXPTIME-hard).

Alphabet/size and radius bookkeeping
- Σ_out tracks (all merged into symbols): roles/phases O(1); colors+⊥ (4); error alphabet O(1); U’s row alphabet O(1); Addr values {1,…,B} (O(B)); reserved probe symbols for Q_j (O(B)); a few pointer states O(1). Total |Σ_out| = β = poly(s). All constraints are radius-1 (depend on current and predecessor outputs only).

Sanity example (B=2)
- Reserve Q_1, Q_2 for the left boundary. L(00), L(01), L(10), L(11) yield extendibility vectors (E(a⋆)[Q_1], E(a⋆)[Q_2]) equal to (0,0), (1,0), (0,1), (1,1) respectively. On the seam, with C encoding a 4-cycle, the tableau sets EDGE=1 exactly on adjacency pairs; the local check enforces color inequality on those.

Obstacles and how addressed (verifier feedback alignment)
- “Single fixed probe” issue: we use a family {Q_j} indexed by boundary outputs; acceptance depends on interior u via the deterministic pointer (no dependence on a globally fixed j). Addresses or O(B)-many probe symbols ensure radius-1 feasibility without exponential symbol blowup.
- Consistency on same u: avoided by canonical gating. Only L(u), R(v) allow colors; mapping any other type to a color breaks (F1). Thus each u is represented by exactly one colorable type per side.
- Error-escape under probes: disallowed by a probe-mode bit; in probe mode, error-chain symbols are not permitted in Cout–out’s allowed neighbor pairs.

Next steps (concrete, verifiable)
1) Write explicit local rule snippets for the probe gadget:
   - The four reserved boundary symbols and their immediate successors in “probe mode”.
   - PORT zone neighbor pairs enforcing Addr increment and RidBit copy.
   - Pointer transitions and the accept/dead-end at Addr=j with RidBit test.
   Provide a small B=2 instance and brute-force the DP to observe E(a⋆)[Q_j] = u_j.
2) Formalize Lemma RG: list Cout–out pairs that allow Color at S only next to HEAD_C+PORT; add dead-end rules otherwise; add the ⊥ self-loop plumbing.
3) Specify RUN_B alphabet and row transitions for U; define EDGE emission and the local color-inequality check at S. Verify on a toy circuit D by DP.
4) Package the reduction D ↦ P_D with precise β sizing and radius-1 constraints; add the ⊥-filler rules. Then move Lemmas TS, RG, SG and the reduction theorem into output.md.

Why useful here
- The per-bit probe family and probe discipline directly resolve the main gaps flagged by the verifier: we now separate 2^B types without per-type tailoring, and we prevent error-escape in reserved probes. The role-gating and must-color rules ensure f assigns colors only to canonical vertex types, avoiding consistency pitfalls. The seam tableau matches (F1)’s pairwise nature. All components are radius-1 and compatible with the O(kβ^2) DP for audit.

## Round 0003 — 2025-08-28T11:55:40.787420Z

Round goal
- Deliver a clean, radius-1, per-bit boundary-probe Type-Separation Lemma (Option A) that yields 2^B distinct “vertex” context types τ_u, with a concrete deterministic pointer gadget and explicit gating against error-escapes under reserved probes.
- State the canonical vertex-context lemma (existence of L(u), R(v) types adjacent to S only) with a pumping-based padding argument to hit lengths ℓ_pump or ℓ_pump+1 without disturbing the port zone.
- Formalize the seam gadget lemma that simulates D(u,v) across the bridge and gates acceptance by “if EDGE=1 then colors differ, else vacuous,” while keeping error-chains disabled in the active bridge mode. Provide alphabet/radius bookkeeping and a B=2 sanity check blueprint.

Context recap and constraints we must respect
- β-normalized, radius-1: Cin–out ties outputs to input bits locally; Cout–out is the only adjacency checker. All gadgets must be nearest-neighbor.
- Types are defined over fixed interior inputs (clarified in output.md remarks). Distinguishing types only requires showing E_w(a⋆) differs for some fixed boundary-input tuple a⋆.
- Feasible-function existence (F1) is the only property we reduce to (we neutralize (F2) later by ⊥-filler). We must ensure that colored S is only legal on canonical vertex contexts, so f is only “free” on τ_u and is forced to ⊥ elsewhere.

Lemma TS (Per-bit probe type separation, radius 1)
Statement. Fix parameters B = s^{c0}, β = s^{c1} with c1 ≥ c0. There exist global Cin–out, Cout–out and a family of β′ ≥ B reserved boundary-output 4-tuples {Q_j: j ∈ [B]} and a fixed boundary-input assignment a⋆ ∈ Σ_in^4 such that the following holds. For any word W_L(u) that contains a well-formed left-vertex block (defined below) positioned O(1) from S and encoding u ∈ {0,1}^B adjacent to S, and has no errors:
- E_{W_L(u)}(a⋆)[Q_j] = 1 iff u_j = 1.
Consequently, for u ≠ u′, Type(W_L(u)) ≠ Type(W_L(u′)) (they differ on E(·)(a⋆) for some Q_j), so there are at least 2^B distinct left-vertex types. Symmetrically for right-vertex types.

Design (radius-1 with uniform global rules)
- Tracks in Σ_out (constant multiplicity; folded into single symbols):
  1) Role/phase ∈ {HEAD, PORT, BRIDGE, PAD, ERR} × {phase mod c}.
  2) RID data bit (output track) required to equal the input bit when Role=PORT (Cin–out enforces copy).
  3) Address track Addr ∈ {1,2,…,B} present only when Role=PORT. Each Addr=j is a distinct output symbol component; total O(B).
  4) Probe corridor states Probe_j,Move and Probe_j,Test (two local phases) for each j ∈ [B]. These travel inside W_L(u) when a probe is active. Total O(B) many “probe-id” states, permitted since β = poly(s).
  5) Neutral ⊥ and error-chain alphabet (ERR_x) as in §3 of the reference, but these are disabled in probe-active mode (see below).
- Reserved boundary outputs Q_j (two-node boundary on the far-left and the two nodes just inside it) place a start-token that forces the unique corridor Role=BRIDGE with state Probe_j,Move to appear immediately to the right of the left boundary, propagating deterministically rightward cell-by-cell.
- Corridor-path and uniqueness: Cout–out enumerates exactly one successor for each Probe_j,Move, forcing the head to march right until it meets a cell whose Role=PORT. If no PORT appears within the allowed window, no outgoing pair is allowed: the DP dies (reject). Error-chain and ⊥ are disallowed adjacent to Probe_j,* by omitting such pairs from Cout–out.
- Address match and test: At a PORT cell, Cout–out allows Probe_j,Move to step to Probe_j,Test iff the PORT cell carries Addr=j; otherwise it must continue moving (still Probe_j,Move). In Probe_j,Test, Cout–out further requires the PORT cell’s RID bit be 1; only then does it allow a local acceptor “sink” (a short fixed BRIDGE→PAD termination sequence). If RID=0, there is simply no legal outgoing pair for Probe_j,Test at this site (reject). Again, no error-escape pairs exist in these states.
- Disabling probes when not selected: For any boundary-output 4-tuple not in {Q_j}, Cout–out never enables Probe_* states at the boundary; instead it allows generic PAD/⊥-plumbing, so these assignments do not influence separation.

Why E_{W_L(u)}(a⋆)[Q_j] = u_j
- “⇒”: If Q_j is used and the interior is a well-formed vertex block, the corridor deterministically reaches the PORT zone adjacent to S (see vertex blocks below), then walks along PORT cells until encountering Addr=j; at that cell, Probe_j,Test checks RID=1. If u_j=1, Cin–out forces the PORT symbol’s RID=1 (copy of input), so the test passes and the sink terminator exists, so the DP has a path.
- “⇐”: If u_j=0, then at the unique cell with Addr=j the RID bit is 0, so Probe_j,Test has no legal continuation; there are no alternative continuations (no error, no ⊥ permitted in probe mode), and the unique path dies. Therefore E=0.
- Type-invariance: E_{W_L(u)}(a⋆)[Q_j] depends only on the fixed boundary inputs a⋆ and the presence/contents of the PORT zone (encodes u). Any two representatives with the same u and no errors admit the same probe behavior. Thus the bitvector over {Q_j} is the same across all words of that type.

Vertex blocks and canonical contexts
- Canonical left-context L(u) and right-context R(v): A well-formed left block W_L(u) begins O(1) to the left of S and is laid out as HEAD · RIDPORT · SPACER · PAD, with:
  • HEAD: a self-delimiting header containing enc(D) (copied from Σ_in via Cin–out) and marks the start of the block (constant size overhead, independent of B).
  • RIDPORT: a contiguous port zone of exactly B cells adjacent to S, each with Role=PORT, the address track Addr=1..B in increasing order left-to-right, and the RID bit track which Cin–out ties to the node’s input bit so that the zone encodes u verbatim.
  • SPACER and PAD: a constant-length SPACER followed by a long padding segment PAD with Role=PAD (any filler pattern consistent with Cout–out). Right blocks W_R(v) are symmetric to the right of S.
- Color-at-S gating: The two S nodes have access to color symbols {RED, GRN, BLU} only if their immediate neighbors on the inside are special handshake boundary symbols that must be adjacent (in Cout–out) to Role=PORT with the correct phase for a vertex block. If these adjacencies fail (i.e., the block is absent/malformed), then any attempt to place a non-⊥ color at S cannot be extended (no legal Cout–out pair), hence non-vertex contexts cannot carry colors. Conversely, if the block is well-formed, the handshake permits a colored S, activating the seam gadget (below). This implements “only canonical contexts permit colors,” using radius-1 adjacencies.
- Length normalization at ℓ_pump or ℓ_pump+1: For any fixed u, we construct a seed left word U_left(u) = P^z · HEAD · RIDPORT · SPACER, where P is a constant PAD primitive whose repetitions are allowed by Cout–out. Choose z so that |U_left(u)| equals ℓ_pump or ℓ_pump+1. This is always possible by taking z = ⌈(ℓ_pump − c)/|P|⌉ or z+1. The right side is a 
neutral filler F_R of the required length. By Lemma 12 (composition) and Lemma 11 (replacement), any further padding on the far sides preserves the type near S; the port zone stays adjacent to S because we do not insert repeats inside RIDPORT. Thus for each u there exists at least one left-context of the required lengths with the port zone at S; symmetrically for R(v).

Lemma SG (Seam gadget for succinct adjacency and color inequality)
Statement. There is a fixed radius-1 bridge schema such that for any ordered pair of canonical vertex contexts (L(u), R(v)), if both S windows are colored, the concatenation wa S1 wb wc S2 wd admits a completion iff either D(u,v)=0 or (D(u,v)=1 and the two colors differ). If either side is not a canonical vertex context, colors are forbidden by the handshake; if a side is malformed but S was colored regardless, the bridge offers no completion (no error-escape in active mode).
Design details (radius-1)
- Activation: The color-at-S handshake (above) also puts the inner neighbors of S into a special BRIDGE-Start phase. Cout–out allows entering a BRIDGE corridor across wb ◦ wc only from this phase.
- Inputs to the run: The two B-bit port zones are immediately adjacent to S. The bridge corridor accesses these bits by simple “read heads” that move one step into wb or wc and copy the bit into the first row of a RUN tableau (implemented in the bridge). The circuit D is present in HEAD on both sides (since enc(D) is copied from Σ_in to Σ_out under HEAD), or, alternatively, we can duplicate enc(D) in the bridge header as constant local data—both are radius-1 local.
- Tableau: A fixed universal TM U is simulated row-by-row across the bridge to compute d := D(u,v) in poly(s) steps. Cout–out enforces per-row local transitions; malformed rows admit no accepting continuation in the active mode (no ERR allowed adjacent to BRIDGE states). After the last row, a dedicated cell adjacent to the S2 side outputs EDGE ∈ {0,1}.
- Local acceptance: Cout–out encodes the rule that across S1 and S2 and the adjacent EDGE cell:
  • If EDGE=0 (non-edge), all three color-equality pairs at S are allowed.
  • If EDGE=1 (edge), the two S outputs must be unequal; the three equal-color pairs are disallowed, blocking all completions in those cases.
- Robustness: All ERR_x error-chain symbols are globally available for inactive modes (e.g., malformed vertex blocks when S is ⊥), but in bridge-active mode (colors present at S) the BRIDGE corridor allows no ERR transitions. Thus a malformed attempt in active mode rejects rather than escaping to ERR.

Alphabet and radius bookkeeping
- Σ_out size: roles/phases O(1); color tokens + ⊥ (4); error alphabet O(1) (global); PORT addresses (B); probe-id states per j (O(B)); RUN work alphabet for U (constant). Total |Σ_out| = β can be chosen s^{c1} with c1 ≥ c0 large enough so β ≥ C·B for a fixed constant C (absorbing all constants).
- Radius-1: Every constraint is between a node and its predecessor: Cin–out ties PORT.RID to the input bit; Cout–out enumerates the only legal neighbor pairs for PROBE movement, RUN row steps, BRIDGE activation, and color/EDGE gates.

Soundness/completeness sketches (Succinct 3-Coloring → FFE(F1))
- Type separation: By Lemma TS, for each u there is at least one canonical left (resp. right) vertex type τ^L_u (resp. τ^R_u), and τ^L_u ≠ τ^L_{u′} for u≠u′. All non-vertex contexts are inactive (color-at-S cannot be extended), so f must map them to ⊥.
- Completeness: Given a proper 3-coloring χ: {0,1}^B → {R,G,B}, define f(τ^L_u) = χ(u) and f(τ^R_v) = χ(v), f(τ)=⊥ for others. For any pair (τ^L_u, τ^R_v), the bridge simulates D(u,v); if D=0, acceptance is unconditional; if D=1, the inequality holds by χ, so the bridge accepts. All other pairings are vacuous by gating.
- Soundness: If f satisfies (F1), define χ(u) = f(τ^L_u). For any (u,v) with D(u,v)=1, the pair (τ^L_u, τ^R_v) must pass the (F1) DP; by Lemma SG’s gate, that forces χ(u)≠χ(v). Hence χ is a proper 3-coloring. Note the “same-u consistency” issue is avoided by construction: only the canonical τ^L_u and τ^R_v can carry colors, so f is single-valued on u.

Neutralizing (F2)
- Add global ⊥-plumbing on repeats: for any w and z≥1, the repetition wz can be filled entirely with ⊥ consistent with Cout–out (and respecting the handshake that forbids colors unless a vertex block is present). Then (F2) is vacuous for all contexts, so the three-way classifier reduces to deciding (F1)—hence NEXPTIME-hard.

Toy sanity check (B=2)
- Let β≥8. Port zone has two PORT cells with Addr=1,2 and RID matching input bits (u_1,u_2). Q_1, Q_2 probes: under Q_1 the corridor moves to Addr=1 and accepts iff u_1=1; similarly for Q_2. The 4 left-types τ^L_{00}, τ^L_{01}, τ^L_{10}, τ^L_{11} differ on the two probe bits. For a small D encoding (e.g., 4-cycle), the BRIDGE tableau reads u,v and emits EDGE=1 on edges; local gate forbids equal colors only then. A brute-force DP on the combined path verifies that all (F1) instances accept iff colors define a proper 3-coloring.

Obstacles and how addressed
- Unique continuation under reserved probes: We explicitly disallow ERR/⊥ adjacencies when any Probe_j,* state appears; the only permitted successor is the deterministic path, ensuring E(Q_j) reflects u_j.
- Keeping the port zone adjacent to S after length normalization: We choose padding only in PAD, outside RIDPORT, so the port stays adjacent to S; we do not rely on pumping to preserve the internal structure of RIDPORT.
- Same-u consistency: Avoided by gating colors at S exclusively to canonical vertex contexts; alternative contexts cannot carry colors, so f cannot assign contradictory colors to the same u across multiple types.

Gaps or clarifications for output.md (minor)
- Clarify explicitly (already noted in Remarks) that types E_w(a) are computed with respect to the fixed interior input string of w. Our reductions rely on Cin–out copying input bits into PORT.RID.
- Optional: Note that while Corollary 4 uses Z ≤ ℓ^2, for a fixed context one can compute smaller Z from the per-side type DFA cycles; not required for our hardness but may tighten constants.

Next steps (auditable deliverables)
1) Write the local Cout–out transitions for the probe gadget: list states {Probe_j,Move/Test}, allowed pairs with PORT cells (Addr≠j ⇒ Move; Addr=j and RID=1 ⇒ acceptor; disallow ERR/⊥ near probes). Provide a finite table parametrized by j with size O(B) to confirm β budget.
2) Give the exact HEAD and RIDPORT layouts with Cin–out masks: specify that when Role=PORT, only two output symbols (RID=0/1) are allowed and must match the input bit; when Role=HEAD, output must match the input encoding of D.
3) Specify the BRIDGE tableau alphabet and the final EDGE cell’s interface to S: define the three forbidden adjacent pairs across S when EDGE=1 (RR, GG, BB) and allow all when EDGE=0; verify radius-1 locality.
4) Provide a fully worked B=2 instance (explicit symbols) and run the O(kβ^2) DP to validate both Type-Separation and Seam Gadget behavior; we can submit this as a regression test to the verifier.
5) Integrate the global ⊥-filler rules for repetitions and restate the corollary: on our instances, the classifier’s O(1) vs. Ω(log* n) vs. Θ(n) reduces to (F1), hence NEXPTIME-hard.

Why useful here
- The per-bit probe lemma squarely addresses the verifier’s major issue: we do not “program” per-type tables; instead we use uniform global rules and reserved probes whose acceptance depends on the interior u via Cin–out, yielding exponentially many types. The seam gadget aligns exactly with (F1)’s universal pairwise check for 3-coloring. Both gadgets are radius-1 and fit the β budget, and they can be verified independently by the DP on small instances.

## Round 0003 — 2025-08-28T12:27:11.729096Z

Status and focus
- Goal: finalize a clean, radius-1 reduction from Succinct 3-Coloring (S3Col) to Feasible-Function Existence (F1) in the β-normalized model, with (F2) neutralized by ⊥-filling, thereby yielding NEXPTIME-hardness of the 3-way classifier.
- This round: (i) fix the probe/type-separation gadget using a family of per-bit probes Q_j; (ii) specify canonical vertex contexts and gating so only those contexts can carry non-⊥ colors at S; (iii) specify a seam tableau that computes Edge(u,v) and Eq(u,v) and enforces acceptance iff (Edge=0 or colors differ) and (Eq=0 or colors equal), which also forces left/right copies of the same vertex to share the same color; (iv) give concrete DP-checkable formulations and bookkeeping; (v) list verifiable next deliverables.

Gaps in output.md (minor clarifications, no changes made)
- Types vs fixed inputs: The definition of E_w(a) notes interior inputs may be arbitrary or fixed by the instance; our hardness builds contexts by choosing suitable interior inputs (binary strings) realizing the canonical blocks. It would help to add a sentence to output.md explicitly stating: “When we refer to Type(w), interior inputs are fixed to those of w; the type depends on the chosen input word w.” This is already consistent with the DP and Section 4 of the reference.
- Optional: Corollary 4’s bound Z ≤ ℓ^2 is sufficient (tightening via lcm of periods is possible but unnecessary here).

Idea 1 — Per-bit probe family Q_j gives 2^B distinct vertex types
Concrete tracks and symbols (radius 1, β-normalized)
- Σ_in = {0,1}. Σ_out tracks (combined into one symbol):
  1) Role/phase: {HEAD, VERT, PORT, RUN, PAD, PROBE, ERR_k, …} × {phase mod c} (constant size).
  2) S-color: {RED, GRN, BLU, ⊥} available only on the two S nodes (enforced by roles around S).
  3) Port zone outputs that must copy Σ_in via Cin–out: an address track Addr ∈ {1,…,B} (encoded in binary or unary across cells) and a data track RIDbit ∈ {0,1} for the index u.
  4) Pointer/probe track with states {Start_j, Head_j, Ok_j, Dead_j} for j∈[B]; Head_j carries probe-id j along the pointer path; this induces O(B) states; permitted because β = poly(s) and B = s^{c0}.
  5) RUN work alphabet for a fixed U (constant-size), error-chain alphabet as in §3 of the reference (constant).
- Reserved boundary outputs: choose a common boundary-input pattern a⋆, and for each j∈[B] a dedicated 4-tuple Q_j on the boundary outputs that sets the PROBE role to Start_j at both boundary sides and fixes neighbors to allow only the probe pipeline (see below).

Probe pipeline (only legal continuation under Q_j)
- Cout–out lists only the following successor pairs when the left boundary outputs equal Q_j: Start_j (at the outermost position) must be followed by Head_j moving deterministically right, keeping the j-tagged Head_j; along Head_j, the role PORT is required (locally enforced) and the port zone must be present adjacent to S within a fixed offset. Head_j advances cell-by-cell until it stands on a PORT cell whose output Addr equals j (comparison is local: the j-tag in Head_j must match Addr). At that cell:
  • If RIDbit=1, a transition Head_j→Ok_j is allowed, after which a short, locally-checked accept sink attaches to filler/PAD; the boundary assignment Q_j is extendible.
  • If RIDbit=0, there is no legal successor (no error-escape is listed under PROBE), so no completion exists; the boundary assignment Q_j is non-extendible.
- No error-chain or alternative plumbing is enabled while the PROBE role is active; this guarantees uniqueness of the computation under Q_j and prevents spurious accepting paths.

Lemma TS (Type-separation via Q_j). For each u∈{0,1}^B there exists a canonical left-context L(u)=W_L(u) S F_R (constructed below) with a well-formed PORT zone of length Θ(B) adjacent to S on the right, whose RIDbit track (copied from Σ_in via Cin–out) spells u and whose Addr track enumerates addresses 1,…,B. For the fixed boundary-input assignment a⋆ and boundary-outputs Q_j, E_{L(u)}(a⋆)[Q_j]=u_j. Consequently, if u≠u′ then Type(L(u))≠Type(L(u′)).
Why useful: Gives ≥2^B distinct left context types injectively indexed by u. The same construction mirrored yields right context types R(v).
Proof sketch: Under Q_j the only legal extension (by Cout–out) is the deterministic PROBE pipeline; it reaches the unique PORT cell with Addr=j. Cin–out forces RIDbit outputs to equal the input bits of W_L(u); hence Ok_j exists iff u_j=1. Thus the extendibility bit for Q_j equals u_j. Since the Type records, for each fixed boundary input a⋆, the yes/no table over all boundary-outputs, and the family {Q_j} lies within those outputs, the truth tables differ for u≠u′, hence types differ. Uniformity: under Q_j there is no alternative continuation, so E_w(a⋆)[Q_j] depends only on u, not on other interior nondeterminism.

Idea 2 — Canonical vertex contexts and color gating
Canonical shapes
- Left: L(u) = W_L(u) S F_R. The block W_L(u) is HEAD · VERT · PORT · RUN with O(poly(s)) length, anchored within O(1) of S (fixed offset). The right side F_R is neutral filler (PAD) of length ℓ_pump−O(poly(s)).
- Right: R(v) = F_L S W_R(v), symmetric.
Color gating at S (radius 1)
- Only when the immediate neighbors of S display role tokens GateL (on the left side) or GateR (on the right side), which appear exclusively in well-formed W_L(·)/W_R(·) at the fixed offsets, do the S nodes permit non-⊥ S-color outputs. Otherwise, S-color must be ⊥ and any non-⊥ choice yields no continuation (local dead-end). This makes all non-canonical contexts inactive.
- The existence of contexts with |W_L(u)|∈{ℓ_pump,ℓ_pump+1} follows from pumping/replacement (Lemmas 11, 14–15 in the reference). We pick fixed offsets so that GateL/GateR alignment is independent of the global length choice; padding happens in the outer PAD region.
Result: Only the canonical L(u), R(v) types are active; all others must be assigned ⊥ by any feasible f.

Idea 3 — Seam tableau computing Edge(u,v) and Eq(u,v) and local acceptance
Bridge layout and computation
- On a bridge instance wa S1 wb wc S2 wd with left=L(u) and right=R(v), the concatenation wb∘wc (length ≥ℓ_pump−O(poly(s))) hosts a standard row-by-row simulation of a fixed U for poly(s) steps. U reads:
  1) the encoding of the circuit D from HEAD (copied from Σ_in via Cin–out inside both W_L, W_R),
  2) the B-bit RID port u adjacent to S1, the B-bit GID (or v) adjacent to S2.
- The tableau checks nearest-neighbor consistency (Cout–out row transitions), with conventional error-chains available only when RUN is malformed or HEAD/RID is malformed; but if S carries a non-⊥ color while a side is malformed, the seam dead-ends (no accept path), ensuring non-canonical types cannot use colors.
- U emits two 1-bit flags near S: Edge = D(u,v) and Eq = [u=v] (computed by a simple bitwise equality scan).
Local acceptance policy (enforced by constant-size radius-1 constraints around S)
- Accept iff both conditions hold simultaneously:
  (A) Edge=0 OR (S-color1 ≠ S-color2), and
  (B) Eq=0 OR (S-color1 = S-color2).
- Intuition: (A) enforces inequality on edges, vacuous on non-edges; (B) forces left/right copies of the same vertex to carry identical colors (Eq=1 ⇒ colors equal), which also makes all duplicate types for a given u consistent via pairing with the unique right-type R(u).
- If either side is inactive (color at S forbidden), a colored attempt dead-ends; with ⊥ at S, the seam always accepts (⊥-plumbing), making all non-canonical pairs trivial.

Why this aligns with (F1) and fixes prior concerns
- Pairwise constraint matches (F1): every ordered pair of contexts is checked; edges impose inequality; non-edges impose nothing; in addition Eq=1 imposes left/right consistency, removing the need for uniqueness of types per u.
- Determinism under probes prevents “cheating” via error-chains.

Neutralizing (F2)
- Add a global ⊥-filler: for any context (w1,S,w2) and any z≥1, allow wz_1, wz_2 to be entirely labeled with ⊥ via Cout–out, independent of boundary inputs/outputs and independent of the internal roles. This never overrides S nor GateL/GateR, and thus does not affect (F1). Consequently, (F2) is always true for any f on our instances; the classifier reduces to (F1)-feasibility.

Soundness/completeness (sketch with the new Eq gating)
- Completeness (3-colorable ⇒ feasible f): Given a proper 3-coloring χ:V→{R,G,B}, define f(Type(L(u))) = χ(u) and f(Type(R(v))) = χ(v); all inactive types map to ⊥. For any ordered pair (L(u),R(v)), U computes Edge and Eq. If Edge=1 then χ(u)≠χ(v) and (A) holds; if Edge=0 then (A) holds trivially. If Eq=1 (thus u=v), then χ(u)=χ(v) by definition of f on left/right copies and (B) holds; if Eq=0, (B) is vacuous. Thus all (F1) instances accept. (F2) is vacuous by ⊥-filling.
- Soundness (feasible f ⇒ 3-colorable): Define χ(u):=f(Type(L(u))) (well-defined because pairing (L(u),R(u)) forces equality via (B)). For any edge (u,v), pairing (L(u),R(v)) yields Edge=1, so (A) forces χ(u)≠χ(v). Hence χ is a proper 3-coloring.

DP-checkable toy instance (B=2)
- Set β≥8. Build L(00), L(01), L(10), L(11), and R(·) analogously. Reserve Q_1,Q_2. Verify:
  • E_{L(u)}(a⋆)[Q_1] = u_1, E_{L(u)}(a⋆)[Q_2] = u_2 (the DP fails/succeeds under the unique probe pipeline).
  • On a small D (e.g., a 4-cycle), the seam tableau sets Edge accordingly; local acceptance enforces inequality on edges; Eq enforces equality across (L(u),R(u)) pairs.
- The verifier can brute-force all ordered pairs of these contexts and check that (F1) holds iff a 3-coloring exists.

Alphabet and complexity bookkeeping
- Tracks: roles/phases O(1), colors+⊥ (4), error alphabet O(1), RUN alphabet O(1), probe/pointer states O(B), plus a constant variety of plumbing symbols. Choose β = s^{c1} with c1≥c0 so β≥Θ(B); the global tables Cin–out (2×β) and Cout–out (β×β) remain poly(β).
- Lengths: HEAD+PORT+RUN = poly(s) ≪ ℓ_pump = 2^{Θ(β^4)}; pumping/replacement embeds blocks adjacent to S within contexts of length ℓ_pump or ℓ_pump+1.
- Radius 1: every check (probe step, address match, bit read, row-to-row evolution, local acceptance at S) is nearest-neighbor.

Obstacles addressed and remaining
- Fixed single-probe issue resolved: we use a family {Q_j} and carry the j-id in Head_j; acceptance depends on u.
- Consistency across duplicate types: ensured by Eq gating across (L(u),R(u)). This propagates equality across all left/right duplicates via (F1).
- Error-chain leakage: explicitly disabled under PROBE; enabled only in malformed RUN/head regions not under probe or color activation.
- Remaining work: write explicit Cout–out pairs for pointer transitions and RUN rows (constant-size schemas); specify the exact offsets and phases that isolate GateL/GateR to canonical contexts; present a small B=2 instantiation with explicit tables that the verifier can DP-check.

Next concrete steps (auditable)
1) Write the pointer/probe transitions: the set of allowed (y_i,y_{i+1}) pairs for Start_j, Head_j, Ok_j, including the guard that Head_j may move only over PORT cells and must compare its j-tag to Addr.
2) Formalize Lemma TS: a fully self-contained proof in our r=1 model that E_{L(u)}(a⋆)[Q_j]=u_j (no alternative accepting continuation) and that u≠u′ ⇒ types differ. Include a precise statement of a⋆ and the reserved outputs Q_j.
3) Specify canonical L(u), R(v) layouts: exact offsets for HEAD, PORT, RUN relative to S; a small constant-phase scheme that ensures GateL/GateR appear only at those offsets; show padding preserves type (Lemmas 11,14–15).
4) Write the seam U-tableau alphabet and local rules; define where Edge and Eq flags appear; list the constant-size local acceptance checks at S implementing (A) and (B).
5) Provide a B=2 toy with explicit Cin–out,Cout–out snippets and run the O(kβ^2) DP to confirm: (i) probe acceptance patterns; (ii) seam behavior on all pairs; (iii) ⊥-filling for (F2).

Why this is progress
- We now have concrete, verifiable lemmas addressing the verifier’s critiques: a radius-1, globally uniform probe family that separates 2^B types; canonical gating to single out active contexts; and a seam that enforces both edge-inequality and same-vertex equality, removing the latent ambiguity across duplicates. Each component is amenable to the O(kβ^2) DP, and the size/radius constraints stay within the β-normalized model.

## Round 0004 — 2025-08-28T12:33:37.134207Z

Status and aim
- Objective: make the NEXPTIME-hardness reduction auditable by pinning down three radius-1 gadgets with explicit, testable behavior: (i) a per-bit boundary-probe family {Q_j} that injectively separates 2^B vertex indices into distinct context types; (ii) per-side color gating and seam activation that keep mixed pairs vacuous and enforce “must color” only when both sides are canonical; (iii) a seam tableau that computes EDGE := D(u,v) and Eq := [u=v] and enforces local acceptance (EDGE=0 or colors differ) ∧ (Eq=0 or colors equal).

Gaps or clarifications in output.md (to log, not to edit now)
- Fixed inputs in types: Definitions state “interior inputs may be arbitrary; if the model fixes interior inputs, the definition is with respect to those fixed inputs.” Our reduction uses fixed interior inputs to encode indices/C. Suggest adding a sentence clarifying that Type(w) is computed with respect to the fixed input string of w, which is the instance’s input.
- Context set size and construction: It would be useful to state explicitly that the context set C consists of types realized by words of the form w_1 S w_2 with |w_i| ∈ {ℓ_pump, ℓ_pump+1}, hence |C| ≤ ℓ_pump. Also note (or later prove) how pumping/replacement ensures the existence of canonical contexts with prescribed lengths.

Lemma TS — Per-bit boundary probe (radius 1, deterministic, no error-escape)
- Statement. There exist: (a) a fixed boundary-input tuple a⋆ ∈ Σ_in^4; (b) B distinct reserved boundary-output 4-tuples Q_1,…,Q_B; (c) an output-track layout with Role ∈ {HEAD, PORT, RUN, PAD, PROBE, ERR}, an address subtrack Addr ∈ {1,…,B}, and a data subtrack RIDbit ∈ {0,1} tied to Σ_in by Cin–out when Role=PORT; (d) probe-head states Start_j, Head_j, Test_j, Acc_j for each j; such that for each canonical left block L(u) exposing a well-formed B-cell PORT zone with Addr=1,…,B and RIDbit spelling u ∈ {0,1}^B adjacent to S, we have for all j∈[B]:
  E_{L(u)}(a⋆)[Q_j] = u_j.
  Hence u≠u′ ⇒ Type(L(u))≠Type(L(u′)). A symmetric construction yields 2^B distinct right-types.
- Rule discipline (sketch sufficient for DP audit):
  • Under Q_j the only legal Cout–out pairs from the left boundary enter PROBE mode with Start_j, then deterministically propagate Head_j one step per edge along a predeclared probe-corridor; ERR/⊥ pairs are disallowed when any PROBE state is present.
  • Along Head_j: if current Role≠PORT, the unique successor keeps moving; if Role=PORT with Addr≠j, keep moving; if Role=PORT with Addr=j, the only successor is Test_j.
  • At Test_j: allow transition to Acc_j iff RIDbit=1; otherwise no successor exists (dead-end).
  • Acc_j locally splices into PAD and disables all alternative branches.
- Why this yields E= u_j: Q_j triggers a unique run; it reaches exactly the unique PORT cell with Addr=j; Cin–out forces RIDbit to equal the node’s input bit; hence continuation exists iff u_j=1. No error-escape is available in PROBE mode.
- Alphabet budget: O(1) for roles/phases, O(B) for Addr values, O(B) for {Start_j,Head_j,Test_j,Acc_j}, plus O(1) for PAD/ERR; feasible with β ≥ c·B.

Lemma CG — Per-side color gating and seam activation
- Statement. There exist handshake markers GateL, GateR emitted near S if and only if the adjacent interior begins with a well-formed canonical vertex header (HEAD+PORT at fixed offsets). Local rules ensure:
  • Color-permission at S_i (i∈{1,2}) is per-side: S_i may carry Color ∈ {RED,GRN,BLU} iff Gate on that side is present; else the only allowed token is ⊥.
  • Active seam mode is enabled only if both GateL and GateR are present (active-active). In active-active, we enforce “must color”: both S nodes must be non-⊥. In mixed pairs (exactly one Gate present), the seam remains inactive and accepts unconditionally (the inactive side is ⊥ by gating). In inactive-inactive, both sides are ⊥ and accept.
- Why useful. It prevents mixed pairs from constraining f and restricts non-⊥ colors to canonical vertex contexts only, so f must color only τ^L_u, τ^R_v and map all others to ⊥.

Lemma Seam — Tableau for D(u,v) and Eq(u,v) with local gates
- Statement. There is a fixed-width RUN corridor across the bridge wb∘wc that simulates a universal TM U for poly(s) steps, reading enc(D) from HEAD and the port bits u (from left PORT) and v (from right PORT), and computing two verdict bits: EDGE := D(u,v) and Eq := [u=v]. The last tableau row writes, in the unique cell immediately to the right of S2, a triple (EDGE, Eq, FwdCol), where FwdCol is a copy of Color(S1). Local rules between S2 and this neighbor enforce all of:
  (A) EDGE=1 implies Color(S2) ≠ FwdCol; if EDGE=0 both equal/unequal are allowed.
  (B) Eq=1 implies Color(S2) = FwdCol; if Eq=0 both equal/unequal are allowed.
  Coupled with CG’s “must color” in active-active, this yields acceptance iff (EDGE=0 or colors differ) and (Eq=0 or colors equal).
- Robustness: In active mode, ERR symbols are disallowed adjacent to RUN states; malformed tableaux have no accepting continuation. Outside active mode (i.e., mixed or inactive), neutral ⊥-plumbing is available, so those pairs accept vacuously.

Padding to prescribed lengths (existence of canonical contexts)
- Claim. For each u∈{0,1}^B there exists at least one left word w_1 of length in {ℓ_pump, ℓ_pump+1} whose suffix adjacent to S is a canonical W_L(u); similarly for right contexts. Proof sketch: Build a seed left word as P^z · W_L(u) with padding P outside the HEAD/PORT/RUN header. By Lemma 15 (pumping), choose z so that Type(P^z) stabilizes and the total length hits ℓ_pump or ℓ_pump+1. By Lemma 12 (type composition), replacing P^z by any P^{z′} of the same type preserves Type(P^z · W_L(u)); since we pump only in PAD outside the seam, the near-S structure and the probe/seam interfaces are unaffected. Symmetrically for the right side.

Soundness/completeness (recap with Eq)
- Completeness: Given a proper 3-coloring χ, set f(τ^L_u)=χ(u) and f(τ^R_v)=χ(v), ⊥ elsewhere. Active-active bridges accept by Lemma Seam (Eq forces same color on (u,u), EDGE forces inequality on edges; non-edges are vacuous). Mixed/inactive pairs accept via CG.
- Soundness: If f satisfies (F1), define χ(u):=f(τ^L_u). Pairing (τ^L_u,τ^R_u) is active-active with Eq=1, so colors must match; pairing (τ^L_u,τ^R_v) for any edge has EDGE=1, so colors must differ. Hence χ is a proper 3-coloring.

Alphabet/radius budget (concrete)
- Tracks: roles/phases O(1), colors+⊥ (4), ERR O(1), RUN alphabet O(1), Addr values O(B), probe heads and reserved boundary outputs O(B). Total |Σ_out| ≤ c_0 + c_1·B for fixed constants, so choose β ≥ c·B. All checks are radius-1: probe steps, RUN row transitions, per-side gating, and the S2–neighbor acceptance gates.

DP-auditable B=2 sanity plan
- Build four left seeds L(00), L(01), L(10), L(11) and four right seeds; reserve Q_1,Q_2; fix a⋆. Verify by the O(kβ^2) DP that E_{L(u)}(a⋆)[Q_1,Q_2]=(u_1,u_2). Implement a tiny U that sets EDGE for a 4-cycle and Eq via bitwise equality. Check all 16 ordered pairs (L(u),R(v)): accept iff (u=v ⇒ colors equal) and (u,v edge ⇒ colors differ). Mixed pairs (e.g., L(u) with a non-canonical right) accept regardless.

Potential pitfalls and how we address them
- Alternative completions under probes: explicitly forbid ERR/⊥ and any non-probe successors when a PROBE state is active.
- Mixed-pair dead-ends: avoided by per-side gating and late seam activation; only active-active enforces “must color”.
- S-token control: f controls only the color/⊥ choice at S; all other S subtracks (handshake bits) are fixed by local adjacencies.
- Length normalization dependence: we only need existence of at least one canonical context per u at lengths in {ℓ_pump, ℓ_pump+1}; pumping/replacement provides this without changing near-S behavior.

Next steps (explicit, auditable)
1) Write the parametrized probe-rule schema: enumerate allowed Cout–out pairs for Start_j,Head_j,Test_j,Acc_j and the prohibition of ERR/⊥ adjacent to any PROBE state; list Cin–out constraints tying RIDbit to Σ_in whenever Role=PORT.
2) Specify the per-side handshake tokens near S and the exact Cout–out conditions that (i) enable colors per-side; (ii) activate the seam only if both handshakes present; (iii) enforce “must color” only then; and (iv) make mixed pairs accept unconditionally.
3) Give the seam tableau’s final-cell interface: define the neighboring cell’s states that encode (EDGE,Eq,FwdCol) and the constant-size forbidden/allowed pairs with S2 realizing (A) and (B).
4) Produce a B=2 instance (explicit symbol names and tables) and run the O(kβ^2) DP to validate: probe bits, mixed-pair vacuity, and active-active acceptance policy.
5) Add a short clarification to output.md (later): fixed-interior-input interpretation of Type(w) and a one-line bound |C| ≤ ℓ_pump; defer full hardness write-up until the three gadgets are tabled and DP-tested.

## Round 0004 — 2025-08-28T12:34:16.661374Z

Round 0004 — Filling in local rules for probes and seam; mixed-pair gating and a B=2 skeleton

Context recap and objective
- Goal: finalize a NEXPTIME-hardness reduction from Succinct 3-Coloring (S3Col) to Feasible-Function Existence (F1) for β-normalized, radius-1 LCLs on oriented paths, with (F2) neutralized by a global ⊥-plumbing. We now pin down explicit, radius-1 Cout–out rule schemas for (i) per-bit boundary probes that separate 2^B vertex indices; (ii) per-side color gating and seam activation with correct mixed-pair behavior; (iii) a seam verdict interface enforcing simultaneously EDGE=1 ⇒ color-inequality and Eq=1 ⇒ color-equality, while keeping error-escape disabled in active modes. We also provide a B=2 (toy) instance blueprint and a symbol budget check.

Corrections/clarifications to output.md (gaps)
- Types with fixed interior inputs: Please add to Definitions: “If the model fixes interior inputs, E_w(a) is computed with respect to those fixed inputs.” Our reduction relies on Cin–out copying input bits to outputs in PORT cells; extendibility is type-invariant under the fixed interior input string.
- Context set size: It helps to note explicitly that context types are a subset of the global type space realized by words w_1 S w_2 with |w_i| ∈ {ℓ_pump, ℓ_pump+1}, hence |C| ≤ ℓ_pump.

Symbols/tracks used (Σ_out components folded into symbols)
- Colors at the two S nodes: Scol ∈ {RED, GRN, BLU, ⊥}.
- Roles/phases (constant): {HEAD, PORT, RUN, PAD, ERR, GATE_L, GATE_R, BRIDGE, VERD} × {phase ∈ [c]}.
- Port subtracks at Role=PORT: Addr ∈ [B] (unary, i.e., distinct symbol per j) and RIDbit ∈ {0,1} with Cin–out tie RIDbit = input bit.
- Probe states (left side) per j ∈ [B]: Start_j, Head_j, Test_j, Accept_j.
- Reserved boundary outputs per j ∈ [B]: 4-tuples Q_j ≡ (Q^L1_j, Q^L2_j, Q^R2_j, Q^R1_j) used only on the four boundary nodes.
- Seam verdict neighbor (right of S2): VERD(FwdColor ∈ {R,G,B}, EDGE ∈ {0,1}, Eq ∈ {0,1}). We also use a one-cell “forwarder” just left of S2 inside the RUN corridor to carry FwdColor.
- Error/plumbing: a constant ERR alphabet (as in the PSPACE ref.) and PAD; these are disabled in active probe/seam modes (see discipline below).

A. Per-bit probe gadget (Type-Separation, radius-1)
Parameters: B = s^{c0}, β = s^{c1}, c1 ≥ c0 so β ≥ c·B for a fixed constant c.

Layout of a canonical left vertex block W_L(u)
- Immediately to the right of S, a contiguous PORT zone of length B: the j-th cell carries Role=PORT, Addr=j, and RIDbit = u_j, with Cin–out enforcing RIDbit equals the input bit at that node. Outside PORT, a short HEAD and long PAD. Right of S this is the only active structure; elsewhere PAD (neutral).

Probe discipline (no error-escape / unique continuation)
- Under the boundary outputs Q_j on the left boundary (and a fixed boundary-input 4-tuple a⋆), we force a deterministic “probe mode” corridor from the boundary into the interior. While any Probe state appears on an edge, no Cout–out pair involving ERR or ⊥ is listed; the only legal successors are those below. Outside reserved probes, error/⊥-plumbing is available as usual.

Radius-1 Cout–out rule schema (parametrized by j)
- Boundary injection: allow (Q^L2_j → Start_j) on the left-boundary-to-interior edge; forbid any other successor from Q^L2_j.
- Movement: for any interior x, allow (Start_j → Head_j) on the next edge; for any non-PORT cell y (Role∈{HEAD,RUN,PAD}), allow (Head_j at predecessor → Head_j at y). Disallow any (Head_j → ERR/*) or (* → Start_j) except the specified ones.
- Port scan: at a PORT cell with Addr=k ≠ j, allow (Head_j(prev) → Head_j(curr)), continuing the march. At a PORT cell with Addr=j and RIDbit=b, allow exactly one of:
  • If b=1: (Head_j(prev) → Test_j(curr)) and (Test_j(curr) → Accept_j(next)), where Accept_j transitions (deterministically in O(1) steps) to PAD.
  • If b=0: (Head_j(prev) → [no successor]); i.e., no pair listed; the DP dies.
- Addr enforcement: between consecutive PORT cells, only pairs that increment Addr by 1 are allowed (e.g., (PORT@Addr=k, PORT@Addr=k+1)); Addr monotonicity before reaching the PORT zone is enforced by disallowing (Head_j → PORT@Addr≠1) at the very first PORT and by requiring contiguous PORT cells.

Claim TS (Type-Separation; precise)
For any canonical W_L(u) and fixed boundary inputs a⋆, we have E_{W_L(u)}(a⋆)[Q_j] = u_j. Proof sketch: Under Q_j, the only legal continuation is the above deterministic probe; it reaches the unique PORT cell with Addr=j, where continuation exists iff RIDbit=1. Cin–out ties RIDbit to the input bit, so acceptance depends only on u_j. No error/⊥ escape is possible in probe mode. Hence the B-bit vector (E(a⋆)[Q_1],…,E(a⋆)[Q_B]) equals u; distinct u give distinct vectors, i.e., distinct left types. Symmetrically, we obtain 2^B right types with a mirrored probe.

Alphabet budget for probes
- PORT symbols: 2·B (RIDbit×Addr) distinct symbols.
- Probes: 4·B symbols (Start_j,Head_j,Test_j,Accept_j) across j.
- Reserved boundary symbols: ≤4·B tokens for the four boundary positions (Q^L1_j,…), re-used across instances.
- Add O(1) roles/phases, PAD, ERR, RUN alphabet: total |Σ_out| = O(B) + O(1) = Θ(B) ≤ β.

B. Per-side color gating and mixed pairs
Per-side handshake
- The cell immediately adjacent to S1 on the left interior uses role GATE_L if and only if a well-formed canonical left vertex block is present; otherwise that cell uses PAD/HEAD/RUN. Similarly, on the right interior adjacent to S2 we use role GATE_R iff a canonical right block is present. These are enforced by local HEAD/PORT placement and phases.
- The allowed Cout–out pairs between a GATE_* cell and its adjacent S node restrict the S symbol’s handshake flags: the S symbol includes two read-only bits HL, HR. At S1, adjacency with GATE_L forces HL=1 (else no pair allowed); if not GATE_L, adjacency forces HL=0. Similarly, at S2, adjacency with GATE_R forces HR=1 else HR=0. These flags are forced by neighbors; f cannot change them.
Color permission
- Pairs between a GATE_* cell and S permit Scol ∈ {RED,GRN,BLU,⊥}. When not GATE_* (i.e., PAD/HEAD), only Scol=⊥ is permitted. Thus colors are permitted per-side based on the adjacent interior only; this is independent across sides.
Mixed pairs accept unconditionally
- If exactly one side is canonical (say HL=1, HR=0), we do not activate the seam tableau. The S1–S2 pair allows any (Scol1 ∈ {R,G,B}, Scol2=⊥) combination; the two interior halves are filled with PAD/⊥ plumbing. No must-color constraint is enforced here.

C. Seam activation and verdict wiring (active-active pairs)
Activation and must-color locality
- The seam is active only when both sides are canonical; locally this is encoded by HL=1 at S1 and HR=1 at S2 (both forced by the adjacent GATE_* cells). Only in this case do we enforce “must-color”: the S1–S2 adjacency forbids any pair with Scol1=⊥ or Scol2=⊥ when (HL=1 and HR=1). When either HL=0 or HR=0, ⊥ is allowed on the corresponding S and the seam is inactive.
RUN_B tableau and verdict cell
- Across wb∘wc (a corridor spanning into both sides right next to S), Cout–out enforces a row-by-row simulation of a fixed TM U on input (enc(D), u, v). The RUN corridor is enabled only when HL=HR=1 and both S nodes are non-⊥. The last row writes into the neighbor immediately to the right of S2 a symbol VERD(FwdColor, EDGE, Eq), where FwdColor∈{R,G,B} is a copy of Scol1, EDGE = D(u,v), and Eq = [u=v]. ERR is disallowed adjacent to RUN/VERD in this active mode (no escape).
Local verdict check (pure radius-1)
- Pairs S2 ↔ VERD are allowed exactly when both constraints hold:
  (A) if EDGE=1 then FwdColor ≠ Scol2; if EDGE=0 then no restriction.
  (B) if Eq=1 then FwdColor = Scol2; if Eq=0 then no restriction.
- The edge S1 ↔ S2 additionally forbids ⊥ when HL=HR=1 (must-color) and otherwise imposes no restriction. No other global signal is used.
Correctness: On active-active pairs, acceptance iff (EDGE=0 or colors differ) and (Eq=0 or colors equal). This enforces 3-coloring on edges and consistency on (u,u) pairs.

D. Soundness/completeness (recap) and role of mixed pairs
- Completeness: Given a proper 3-coloring χ of the succinct graph, define f on canonical types by f(τ^L_u)=χ(u), f(τ^R_v)=χ(v), all other types map to ⊥. On active-active pairs (u,v): RUN_B computes (EDGE,Eq); (A)(B) hold by χ. On mixed pairs: seam inactive; pairs accept with plumbing. Hence (F1) holds. (F2) is neutralized by ⊥-filling (see F below).
- Soundness: If f passes (F1), then each canonical τ^L_u must be colored (or some active-active seam would violate must-color), and the values on τ^L_u and τ^R_u must coincide (pair (u,u) has Eq=1). For any edge (u,v) with D(u,v)=1, the pair (τ^L_u, τ^R_v) must satisfy (A), forcing χ(u)≠χ(v). Thus χ is a proper 3-coloring.

E. B=2 DP-checkable skeleton (auditable)
Symbols (sample)
- Colors at S: S_R, S_G, S_B, S_⊥ (each encodes HL,HR bits as forced by neighbors).
- PORT cells: P1^0,P1^1 and P2^0,P2^1 (Addr=1 or 2 and RIDbit=b). Cin–out allows Pj^b only on input b.
- Probes: Start_1,Head_1,Test_1,Accept_1 and Start_2,Head_2,Test_2,Accept_2.
- Boundary: Q^L1_1,Q^L2_1 (and similarly for j=2), mirrored on the right.
- Gating: GATE_L, GATE_R on the interior cells adjacent to S, else PAD.
- Verdict: VERD(c∈{R,G,B}, EDGE∈{0,1}, Eq∈{0,1}).
Key Cout–out pairs (non-exhaustive but complete by schema)
- Probe injection and march: (Q^L2_j → Start_j), (Start_j → Head_j), (Head_j → Head_j) on non-PORT, (Head_j → Head_j) on PORT@Addr≠j, (Head_j → Test_j) on PORT@Addr=j, then (Test_j → Accept_j) iff RIDbit=1, then Accept_j → PAD.
- PORT adjacency: (P1^b → P2^{b′}) allowed; (Addr monotonicity) require that between consecutive PORT cells, Addr increases by 1 (here 1→2). No other PORT transitions.
- Per-side color gating: (GATE_L → S_x with HL=1) and (non-GATE_L → S_⊥ with HL=0) only; symmetrically for S2 and HR.
- Seam activation/must-color: edge (S1 ↔ S2) forbids S_⊥ on either side when HL=HR=1; allows any pair otherwise.
- Verdict check: (S2=R ↔ VERD(FwdColor=R,EDGE=1,Eq=0)) is forbidden; (S2=R ↔ VERD(FwdColor=G,EDGE=1,Eq=0)) allowed; similarly for other colors; and (Eq=1) forces equality by allowing only pairs with FwdColor=Scol2; when EDGE=0 both equal/unequal are allowed. No VERD neighbors occur unless HL=HR=1 (RUN active); otherwise the neighbor is PAD.
Audit plan
- Verify TS: run the O(kβ^2) DP on L(00),L(01),L(10),L(11) under Q_1,Q_2 with the above probe rules; acceptance matches u_j.
- Verify seam: choose a small D (e.g., 4-cycle) and implement U as a constant table that writes EDGE,Eq deterministically from u,v (for B=2, D can be tabulated directly). Check that all active-active pairs accept iff inequality on edges and equality when u=v. Mixed pairs accept regardless.

F. Neutralizing (F2)
Add to Cout–out a neutral self-looping ⊥-language: for any repetition w^z, z≥1, and any boundary outputs/inputs, the interiors can be labeled entirely with PAD/⊥ without touching S or the handshake flags. Then for every context (w1,S,w2) and any z≥1, f(Type(w1Sw2)) on S extends trivially: (F2) holds for all f.

G. Existence of canonical contexts at lengths ℓ_pump/ℓ_pump+1
We rely on the standard replacement/pumping lemmas for path types (ref. Lemmas 10–15, 11, 12 in the attached paper): HEAD+PORT+RUN have length poly(s) ≪ ℓ_pump = 2^{Θ(β^4)}. We place W_L(u) and W_R(v) adjacent to S and pad only outside the PORT zone to achieve total side lengths in {ℓ_pump,ℓ_pump+1}. Replacement preserves type near S, so each u (and v) has at least one canonical left (right) context in C. This item should be added explicitly to output.md or cited as such; until then, treat it as an assumption backed by the cited lemmas.

H. Determinism and locality checks (addressing reviewer points)
- Probe determinism: In probe mode (presence of Start_j/Head_j/Test_j), Cout–out lists no ERR/⊥ pairs; only the deterministic march/test/accept transitions exist. Thus E(a⋆)[Q_j] is a single-bit function of RIDbit[j].
- Seam wiring locality: The final check uses only the pair S2 ↔ VERD; the must-color trigger uses only S1 ↔ S2 with locally stored HL,HR flags.
- S symbol control by f: The only component of S chosen by f is the color field; HL,HR are forced by neighbors via adjacency constraints.
- Budget: Σ_out has O(B) reserved symbols and O(1) others; choose β ≥ c·B. Tables Cin–out (2×β) and Cout–out (β×β) remain poly(β).

I. Why this is incremental progress
- We have converted the earlier sketches into explicit, radius-1 rule schemas that the verifier can instantiate for B=2 and check with the O(kβ^2) DP. We addressed mixed pairs (seam inactive; unconditional acceptance), must-color locality (only when both handshakes present), S-symbol control (only color is free), probe-mode determinism (no error-escape), and seam wiring locality. We provided a concrete symbol budget and a B=2 audit plan.

Next steps (auditable deliverables)
1) Write the parameterized Cout–out tables for probes explicitly (as a list of allowed pairs for Start_j,Head_j,Test_j,Accept_j, PORT adjacency), and the Cin–out mask tying PORT.RIDbit to Σ_in.
2) Enumerate the S-adjacent pairs that gate colors per side, enforce must-color only when HL=HR=1, and list the S2↔VERD pairs that implement (A)(B).
3) For B=2, produce a machine-readable instance (Σ_out symbol list, Cin–out, Cout–out) and run the DP to validate TS and seam behavior on all 16 ordered pairs (L(u),R(v)).
4) Incorporate (or cite) the pumping/replacement lemmas into output.md to justify existence of canonical contexts at the required lengths. If preferred, give an explicit padding construction that never touches the PORT zone.
5) Package the reduction D ↦ P_D, state the equivalence “G 3-colorable ⇔ (F1) feasible f,” and add the ⊥-filler to neutralize (F2), yielding the NEXPTIME-hardness of the 3-way classifier under the explicit β-normalized, r=1 model.

## Round 0004 — 2025-08-28T12:34:37.142350Z

Status and plan
- Objective: make the hardness reduction auditable by giving concrete, radius-1 rule schemas for (i) per-bit boundary probes that separate 2^B vertex indices; (ii) per-side color gating and “active/semi-active” seam activation; (iii) a seam gadget that enforces EDGE and Eq with purely local checks, while permitting unconditional acceptance on mixed pairs. We also pin down a small but sufficient symbol budget and a B=2 sanity test template. These address the verifier’s items (1)–(8).

Explicit rule schemas (radius 1) — ready to DP-check on small B
A. Per-bit boundary probes (Type-Separation TS)
- Fixed inputs for separation: pick an arbitrary 4-tuple a⋆ ∈ Σ_in^4 (e.g., all zeros). All extendibility bits we use for type separation are E_{w}(a⋆)[·].
- Tracks encoded in Σ_out (conceptual fields; realized as a finite product alphabet):
  1) Role ∈ {HEAD, PORT, PAD, PROBE, ERR, …}, Phase ∈ {0,…,c−1} for a small constant c.
  2) Addr ∈ {⊥,1,…,B}. Present only when Role=PORT. Local neighbor rule enforces Addr increases by +1 left→right across a contiguous PORT zone, starting at 1 and ending at B.
  3) RIDbit ∈ {0,1}. Cin–out ties RIDbit to Σ_in at nodes with Role=PORT, and otherwise ignores RIDbit (free) unless constrained by Role.
  4) ProbeHead ∈ {None} ∪ {Start_j, Move_j, Test_j, Accept_j : j∈[B]}. Distinct j are distinct symbols.
  5) Error/plumbing symbols ERR_• and ⊥ are available globally but will be disabled near ProbeHead≠None during probes.
- Reserved boundary outputs: define Q_j as the unique 4-tuple of boundary output symbols that set ProbeHead=Start_j at the first interior position (and fix harmless padding on the boundary nodes themselves). Different j use distinct Start_j.
- Allowed Cout–out neighbor pairs (parametric by j):
  R1. Start_j → Move_j (the right neighbor carries Move_j; left neighbor is the boundary symbol). No other successor out of Start_j.
  R2. Move_j may advance only over the pre-laid PROBE corridor and PORT: (Move_j at i, y_{i+1}) is legal iff y_{i+1}.ProbeHead ∈ {Move_j, Test_j} and either (i) y_{i+1}.Role=PORT with Addr incrementing correctly; or (ii) y_{i+1}.Role ∈ {PROBE,PAD} as part of a fixed, finite corridor skeleton that leads into the PORT zone. No ERR or ⊥ adjacent to any Move_j/Test_j (omit such pairs).
  R3. Move_j → Test_j only when y_{i+1}.Role=PORT and y_{i+1}.Addr=j.
  R4. Test_j → Accept_j only if y_{i+1}.RIDbit=1 (Cin–out has already tied this bit to the input at that node). Otherwise, Test_j has no legal successor.
  R5. Accept_j transitions through a short fixed sequence to a neutral PAD filler (a constant-length exit), after which Role=PAD continues with a self-loop language. While ProbeHead∈{Start_j,Move_j,Test_j,Accept_j}, no pairs to ERR_• or ⊥ are allowed; outside probe mode, ERR/⊥ are permitted as usual.
- PORT-zone well-formedness: local rules enforce a contiguous PORT block with Addr=1,…,B, immediately adjacent to S on the canonical side, as part of the canonical vertex block (see C below). If the probe reaches the end of the allowed corridor without encountering Addr=j (which cannot happen in a well-formed block), there is no legal successor and the DP fails; this guarantees uniqueness.
- Claim TS (restated precisely). For any canonical left vertex word L(u) with properly formed PORT just to the right of S, E_{L(u)}(a⋆)[Q_j]=1 iff u_j=1; otherwise 0. Proof: under Q_j, the only legal continuation is the deterministic probe path R1–R5; acceptance is equivalent to RIDbit=1 exactly at Addr=j; RIDbit copies the fixed input bit at that node by Cin–out. No error/plumbing escape is permitted in probe mode.
- Budget for probes: ProbeHead states contribute 4B symbols; Addr contributes B; corridor roles/phases add a constant factor. This induces at most O(B^2) distinct combined symbols in Σ_out when folded. See “Alphabet budget” below.

B. Canonical vertex contexts and per-side color gating (RG)
- Canonical left block W_L(u): fixed layout HEAD · PORT(B) · RUN · PAD with PORT abutting S on its right; HEAD exposes enc(D) (copied from inputs by Cin–out) and a short delimiter; RUN is a corridor used by the seam tableau (below); PAD is arbitrary filler. Right block W_R(v) is symmetric.
- Per-side handshake flags next to S: the cell immediately inside S on each side must show a fixed gate token GateL (left context) or GateR (right context), followed (at a fixed offset) by the PORT zone. Cout–out allows S to take a color token {RED, GRN, BLU} only if the adjacent inner neighbor displays the correct Gate• token; otherwise, the only allowed S token is ⊥.
- Mixed-pair policy (critical correction): seam activity (and any “must-color” constraint) is triggered only when both sides are canonical. If exactly one side is canonical, the canonical side may be colored (per-side gating), the opposite S must be ⊥, and the interior wb∘wc admits only neutral plumbing; no seam tableau is required or even allowed to start.

C. Seam gadget with directional tokens and local acceptance (EDGE, Eq)
- Goal: enforce, when both sides are canonical, the conjunction
  (A) EDGE=1 ⇒ colors differ; vacuous if EDGE=0; and
  (B) Eq=1 ⇒ colors equal; vacuous if Eq=0;
  while (i) forcing “must-color” in active-active pairs and (ii) guaranteeing unconditional acceptance in mixed pairs.
- Directional seam tokens: two 1-bit subtracks Tok→ and Tok← that live only on corridor (RUN/PAD) cells across wb∘wc.
  • If left side is canonical, the inner neighbor of S1 seeds Tok→=1 that deterministically propagates rightwards (Tok→=1 on each successive cell) until it meets S2; Tok→ never turns off.
  • If right side is canonical, the inner neighbor of S2 seeds Tok←=1 that propagates leftwards analogously.
- Colored S fallback gating, local and sound:
  • Near S2: if Tok←=1 is present at the first interior cell (i.e., a token coming from the opposite end), then a colored S2 cannot attach to a neutral neighbor; its only legal successor pairs are to a seam verdict cell (see below). If Tok←=0 locally, a colored S2 may attach to a neutral neighbor (mixed pair fallback). Symmetric rule near S1 using Tok→.
  • ⊥ at S is locally disallowed when the opposite-direction token is present: if Tok←=1 (respectively Tok→=1) is present adjacent to S2 (resp. S1), then S2=⊥ (resp. S1=⊥) has no legal neighbor pair. This implements must-color only in active-active pairs.
  These checks are purely local (each S only inspects its interior neighbor’s two Tok bits).
- Verdict cell and adjacency enforcing (A) and (B):
  • When both tokens are present anywhere (they overlap throughout the bridge), the seam tableau is permitted and required to run row-by-row across the corridor (standard 1D TM simulation) and eventually place a verdict cell V next to S2 carrying fields EDGE∈{0,1}, Eq∈{0,1}, and FwdColor ∈ {RED,GRN,BLU}, which is a copy of Color(S1).
  • Cout–out forbids the following pairs between S2 and its interior neighbor when that neighbor is V (verdict):
    – If EDGE=1 and Color(S2)=FwdColor, forbid (violates inequality on edges).
    – If Eq=1 and Color(S2)≠FwdColor, forbid (violates same-vertex equality).
    Conversely, all pairs are allowed if EDGE=0 (for (A)) and if Eq=0 (for (B)). These enforce (A) and (B) simultaneously, using only the S2–V adjacency.
  • It is legal (but not necessary) for the verdict cell to exist when only one token is present; the tableau cannot complete in that case (no incoming start from the far side), so V never appears. Thus the only viable completion in mixed pairs is via the neutral fallback, which is allowed by the Tok-based gating above.
- Tableau consistency and robustness: as usual, Cout–out enforces per-row TM transitions across the seam corridor; malformed rows have no accepting continuation. Error-chain alphabets are disabled on RUN/PAD when either color is used at S and a token from the opposite side is present (to avoid escape hatches in active-active mode); they remain enabled in mixed pairs and inactive contexts.

D. Alphabet budget and β sizing (explicit bound)
- Constant tracks: roles/phases O(1); error alphabet O(1); tableau work alphabet O(1); color/⊥ (4 symbols).
- O(B) tracks/components:
  • Addr: B values + ⊥ (for non-PORT cells).
  • ProbeHead states: 4B distinct states (Start/Move/Test/Accept per j).
  • Reserved boundary 4-tuples Q_j: B distinct boundary-output choices; these do not multiply Σ_out but require special boundary symbols (O(B)).
- Tokens and verdict: Tok→, Tok← ∈ {0,1} each (constant factor); verdict fields EDGE, Eq ∈ {0,1}, FwdColor ∈ {R,G,B} (constant factor), realized only on a special verdict role.
- Folding into Σ_out: the combined symbol set can be organized so that the number of symbols is O(B^2) times a constant (addresses × probe-head id dominate), or O(B^3) if we choose to fully decouple j from head modes and addresses conservatively. With B = s^{c0}, pick β = s^{c1} with c1 ≥ 3c0 to guarantee β ≥ c · B^3 for a fixed c; this leaves ample headroom for all constant factors. This satisfies the “β = poly(s)” requirement.

E. B=2 sanity test template (DP-ready)
- Choose β ≥ 32. Enumerate symbols for: colors {⊥,R,G,B}; roles {HEAD,PORT,RUN,PAD,PROBE,VERDICT}; Addr ∈ {⊥,1,2}; ProbeHead ∈ {None,Start_1,Move_1,Test_1,Accept_1,Start_2,Move_2,Test_2,Accept_2}; Tok→, Tok← ∈ {0,1}; verdict bits EDGE, Eq ∈ {0,1}, FwdColor ∈ {R,G,B} (verdict role only); error symbols ERR_•.
- Build four canonical left words L(00), L(01), L(10), L(11) and right words analogously, each with HEAD, a 2-cell PORT zone abutting S, and trivial RUN/PAD. Fix a⋆. Verify with the O(kβ^2) DP that under Q_1 and Q_2, the bits (E_{L(u)}(a⋆)[Q_1], E_{L(u)}(a⋆)[Q_2]) equal u.
- Instantiate a toy D on 4 vertices (e.g., a 4-cycle), encode it into HEAD, and run the DP on all 16 ordered pairs (L(u), R(v)). Check: if D(u,v)=1, the only completions for active-active pairs have unequal colors (enforced by S2–V pairs); if D(u,v)=0, all color pairs accept; if u=v, Eq=1 forces equal colors. Mixed pairs accept unconditionally with the colored canonical side and ⊥ on the inactive side.

Why the token-gated seam resolves the locality issues
- Mixed pairs accept locally: if only one side is canonical, the opposite-direction token is absent locally. Thus colored S can attach to neutral neighbor states without requiring a verdict, and ⊥ is allowed as well.
- Active-active pairs force constraints locally: both tokens are present adjacent to both S’s. Locally (at each S), ⊥ is disallowed (must-color), and colored S cannot attach to neutral neighbors; it must attach to a verdict cell. The verdict cell enforces (A) and (B) via S2–V local pairs. No reference to distant nodes is needed.
- No error escape: in probe mode and in seam-active modes (when opposite-direction token is present), ERR/⊥ transitions are disabled in Cout–out; malformed attempts dead-end.

Soundness/completeness recapped with Eq
- Completeness: Given a 3-coloring χ on V={0,1}^B, set f(Type(L(u)))=χ(u), f(Type(R(v)))=χ(v), f(τ)=⊥ for all inactive τ. Active-active pairs: both tokens present; the tableau computes EDGE and Eq; the verdict adjacency enforces S-color inequality on edges and equality on u=v; mixed pairs: exactly one token near S; fallback acceptance ensures feasibility. Must-color is enforced automatically on active-active pairs by token rules.
- Soundness: If f passes (F1), the token-gated must-color forces f to assign non-⊥ to canonical types. Define χ(u)=f(Type(L(u))). The (L(u),R(v)) bridge (with both tokens) enforces χ(u)≠χ(v) for edges and χ(u)=χ(u) trivially for same-vertex pairs; thus χ is a proper 3-coloring.

Gaps/risks and how we addressed them
- Unique probe continuation (verifier item 6): enforced by forbidding ERR/⊥ next to ProbeHead and by making Start_j/Move_j/Test_j deterministic with a single successor per state; the corridor layout ensures the head must reach the unique Addr=j cell or die.
- Mixed-pair acceptance (items 1–2): resolved by per-side gating and directional tokens; only the presence of the opposite-direction token disables fallback and ⊥ locally.
- “Must-color” only in active-active: enforced by forbidding S=⊥ locally when the opposite-direction token is present.
- Seam wiring locality (item 7): acceptance checks occur only between S2 and the verdict cell V (and symmetrically S1/its verdict if desired); EDGE/Eq and FwdColor are carried in V. No distant inspection.
- Alphabet budgeting (item 8): explicit O(B^2)–O(B^3) bound and β sizing provided.
- Length normalization: existence of canonical contexts with PORT abutting S at |w_i|∈{ℓ_pump,ℓ_pump+1} still relies on pumping/replacement. We keep this as an assumption in notes; integrating Lemmas 11,14–15 into output.md remains a to-do if needed.

Minor clarifications for output.md (new)
- Types vs. fixed interior inputs: please add a parenthetical “types E_w(a) are computed with respect to the fixed input string of w” (we rely on Cin–out tying RIDbit to inputs in PORT).
- Context set C: it helps to state explicitly that C consists of types of words w_1 S w_2 with |w_i|∈{ℓ_pump,ℓ_pump+1} and |S|=2; this keeps C finite with |C|≤ℓ_pump.

Next concrete steps (auditable)
1) Produce a B=2 machine-readable instance (symbol list and Cin–out/Cout–out fragments) reflecting A–C above and run the verifier’s O(kβ^2) DP for the TS probe and seam pairs.
2) Write the exact Cout–out pair schemas (parametric) used above: Start_j→Move_j→Test_j→Accept_j; token propagation; S/neighbor forbidden pairs; verdict adjacency.
3) Optional: formalize the existence of canonical contexts at |w|∈{ℓ_pump,ℓ_pump+1} using Lemmas 11,14–15 (replacement/pumping) and add a short lemma to output.md.
4) Integrate Lemma TS (per-bit probe), Lemma RG (per-side gating and token must-color), and Lemma SG (seam tableau with EDGE/Eq and local acceptance) into the curated output once the B=2 validation passes.

Why this is progress
- We’ve transformed the sketches into precise, local rule families that a DP can check: deterministic probe pipelines for type separation; per-side gating plus directional tokens to reconcile mixed-pair acceptance with active-active constraints; and a strictly local verdict interface encoding both EDGE and Eq. The symbol budget is explicit and stays within β=poly(s). This addresses all previously flagged locality, determinism, and mixed-pair issues and sets up a small-scale DP regression to validate behavior end-to-end.

## Round 0004 — 2025-08-28T12:35:18.823891Z

Round 0004 — tightening gadgets to a DP-checkable spec (radius 1, β-normalized)

Context and goal
- We continue the NEXPTIME-hardness reduction from Succinct 3-Coloring to Feasible-Function Existence (F1) for β-normalized, radius-1 LCLs on oriented paths. The key deliverables now are (i) explicit, radius-1 local rules for a per-bit boundary probe that separates 2^B canonical left/right vertex types; (ii) explicit per-side color gating and mixed-pair acceptance; (iii) a seam tableau interface with local inequality/equality checks; (iv) concrete alphabet counting compatible with β = poly(s); and (v) a B=2 sanity instance blueprint.

Minor gaps noted in output.md (no edits made)
- Types vs fixed interior inputs. Definitions allow both “interior inputs arbitrary” and “fixed by the instance”; the hardness uses the latter. It would help to emphasize that Type(w) is computed w.r.t. the fixed interior input string of w.
- Context set size. When later we use contexts realized by w_1 S w_2 with |w_i| ∈ {ℓ_pump, ℓ_pump+1}, it would be useful to remark explicitly that |C| ≤ |T| = ℓ_pump.

A. Explicit probe gadget (Type-Separation Lemma, radius-1, DP-checkable)
Parameters and layout
- B = s^{c0}. Fix β = s^{c1} with c1 ≥ 2c0 to give O(B^2) room in the adjacency table (C_out–out), while keeping |Σ_out| = β = poly(s).
- Canonical left block W_L(u) adjacent to S (right of S) contains, in order: HEAD_C (constant size), a Corridor prefix (constant size), and the PORT zone of length B, followed by neutral PAD. PORT cell t (1 ≤ t ≤ B) statically carries Addr=t and RidBit=u_t on its output symbol; Cin–out ties RidBit to the input bit at that node.
- Reserved boundary-output 4-tuples {Q_j: j ∈ [B]}. Q_j means: at the two leftmost boundary nodes put tokens BL1_j, BL2_j; at the two rightmost boundary nodes tokens BR2_j, BR1_j (these four come from disjoint reserved subalphabets). Under any other 4-tuple we are in “non-probe” mode.
- Probe corridor states: For each j ∈ [B], we have Head_j and Accept_j. In non-probe mode these symbols are not permitted anywhere. In probe mode (only if Q_j is used), they are the only non-PAD symbols allowed before the PORT zone; ERR/⊥ are explicitly forbidden adjacent to any Head_j/Accept_j.

Allowed C_out–out pairs (schema; all others are disallowed)
- Probe start at boundary:
  • (BL1_j, BL2_j) and (BL2_j, Head_j). This forces the first interior cell after the second boundary node to be Head_j when Q_j is used.
- Corridor propagation up to PORT[1]:
  • Head_j must continue deterministically: (Head_j, Head_j) on each corridor edge until the first PORT cell. No other successor is permitted from Head_j (disables ERR/⊥ escape).
- Entering the PORT zone (key test). Let Port(k,b) denote the output symbol of the k-th PORT cell when “probe-active”; we use a distinct “probe variant” for PORT cells (Port^P) so the grammar can react to probe mode without interfering with the non-probe alphabet.
  • From the corridor into Port^P(k,b): allow (Head_j, Port^P(k,b)) for all j,k and b∈{0,1}.
  • From Port^P(k,b) to the next interior cell:
    - If k ≠ j: require continuation of the probe head: (Port^P(k,b), Head_j). (For all pairs (j,k) with k≠j; total O(B^2) entries.)
    - If k = j and b = 1: allow termination: (Port^P(j,1), Accept_j).
    - If k = j and b = 0: no outgoing pair is allowed (this creates a dead end, rejecting the boundary assignment Q_j).
- Accept sink and padding:
  • (Accept_j, PAD) and then PAD self-loops (neutral plumbing) to the end of the block. No ERR near Accept_j is permitted.
- Non-probe discipline:
  • If the boundary outputs are not Q_j, then Head_j and Accept_j are not allowed anywhere; the PORT cells use their non-probe variants Port^I(k,b) with standard PAD plumbing. All error-chain symbols are available in non-probe mode (as in the reference), ensuring malformed interiors never constrain f.

Claim TS (Type-Separation). Fix a boundary-input 4-tuple a⋆. For any canonical W_L(u), under boundary outputs Q_j we have E_{W_L(u)}(a⋆)[Q_j] = 1 if and only if u_j = 1. Hence the bit-vector (E(a⋆)[Q_j])_{j=1..B} equals u, which separates 2^B distinct left-context types; symmetric right-contexts are constructed analogously.
- Why: Under Q_j the only legal continuation from BL2_j is Head_j (unique path). Head_j must propagate to Port^P(1, u_1), then to Head_j, then Port^P(2, u_2), etc. When it reaches Port^P(j, u_j), it has an outgoing edge only if u_j=1 (Accept_j). Thus extendibility equals u_j.
- Radius-1 and budgeting: All checks are nearest-neighbor pairs. Alphabet uses O(B) symbols for {Head_j, Accept_j} and O(B) probe variants of PORT; the O(B^2) combinatorics appears only in the adjacency table (pairs (Head_j, Port^P(k,·)) and (Port^P(k,·), Head_j)), which is acceptable since C_out–out has β^2 entries and β = s^{c1} with c1 ≥ 2c0.
- No error escape: Head_j and Accept_j have no allowed neighbors other than those listed; in particular there are no pairs with ERR or ⊥ adjacent to Head_j/Accept_j, so reserved probes are deterministic.

B. Per-side color gating and mixed pairs
Symbols near S (two nodes S1 and S2): SColor ∈ {R,G,B,⊥} is the only choice f makes at S nodes. All handshake bits are attached to interior neighbors, not to S.
- Gate tokens on the interiors: The immediate neighbor on the left side of S is either GateL (present only in canonical W_L(u) at a fixed offset) or ¬GateL (any other symbol). Symmetrically, the immediate neighbor on the right side of S is GateR in canonical W_R(v) or ¬GateR otherwise. These are enforced by the constant-size grammar of HEAD/PORT/PAD adjacent to S.
- Per-side gating (local, radius-1):
  • If the neighbor is ¬GateL (resp. ¬GateR), then only ⊥ is allowed at S on that side; any non-⊥ color at S has no legal neighbor pair and dead-ends.
  • If the neighbor is GateL (resp. GateR), then S may be labeled R,G,B or ⊥.
- Seam activation and must-color:
  • The bridge wb∘wc is “active” only if both sides are canonical, i.e., the two interior neighbors are GateL and GateR and both S nodes are non-⊥. This is encoded by allowing a special ActiveBridgeStart symbol adjacent to S only under the pairs (GateL, S∈{R,G,B}) and (S∈{R,G,B}, GateR) simultaneously. When ActiveBridgeStart appears on both sides, the interior between S1 and S2 must be labeled by the RUN_B corridor (see §C). In this active-active case, ⊥ at either S is forbidden (no pair with ActiveBridgeStart), implementing “must color” only when both sides are canonical.
  • Mixed pairs (exactly one side canonical): No ActiveBridgeStart is produced (since one side fails the gate), so RUN_B is not enabled. The interior wb∘wc is filled by neutral PAD and accepts unconditionally. This ensures that mapping inactive types to ⊥ and coloring canonical types does not produce (F1) violations on mixed pairs.
  • Inactive pairs (neither side canonical): Both S nodes must be ⊥; PAD fills the bridge; accept.

C. Seam tableau and local acceptance (EDGE and Eq)
Corridor and inputs
- In the active-active case, between S1 and S2 we lay a fixed-width RUN_B corridor that statically encodes a row-by-row tableau of a fixed universal machine U. U runs in poly(s) steps to compute:
  • EDGE := D(u,v) ∈ {0,1} and Eq := [u=v] ∈ {0,1}, reading u and v from the two PORT zones adjacent to S (u from W_L(u) and v from W_R(v)). As is standard, the row transitions of U are enforced by local C_out–out pairs across row separators; malformed rows have no accepting continuation and cannot appear in the active mode (ERR is disabled adjacent to RUN_B states).
  • Forwarding of S1Color: The first corridor cell to the right of S1 captures the color at S1; this “forwarded color” is then carried unchanged (checked by nearest-neighbor equalities) to a designated verdict cell V next to S2.
Verdict cell and local gate (radius-1)
- The verdict cell V (the immediate right neighbor of S2) carries a symbol Ver(EDGE, Eq, FwdColor) in a constant-size set (there are 2×2×3 ≤ 12 possibilities). The only allowed pairs between S2 and V enforce:
  • If EDGE=1, then Color(S2) ≠ FwdColor.
  • If Eq=1, then Color(S2) = FwdColor.
  • If EDGE=0 and Eq=0, allow all 3×3 color pairs.
- This implements “accept iff (EDGE=0 or colors differ) and (Eq=0 or colors equal)” purely locally between S2 and its neighbor V. Note ERR is forbidden adjacent to RUN_B states and V in active mode.
- Graphs without loops: To avoid contradictory (EDGE=1 and Eq=1) on diagonals, we assume D(u,u)=0; if needed, pre-process the succinct circuit to zero the diagonal (standard and w.l.o.g. for 3-colorability).

D. Budget and radius bookkeeping (explicit)
- Disjoint-role alphabets: We partition Σ_out into disjoint subalphabets per role/phase (HEAD/PORT/PAD/ERR/PROBE/RUN_B/S, etc.), so sizes add rather than multiply.
- Symbol counts (dominant terms):
  • PORT symbols: O(B) (Port^I(k,b) in idle mode and Port^P(k,b) in probe mode; constant factor 2×2 per k).
  • Probe heads: O(B) symbols {Head_j, Accept_j}.
  • Boundary tokens for Q_j: O(B) (the four boundary positions use disjoint constant-size families per j; total O(B)).
  • RUN_B and HEAD/PAD/ERR: O(1) each (fixed universal TM alphabet and error-chain tokens as in the reference).
  • S colors: {R,G,B,⊥} (4 symbols restricted to the two S positions by role).
- Adjacency table size: The probe needs O(B^2) distinct allowed pairs ((Head_j, Port^P(k,·)) and (Port^P(k,·), Head_j)), which fits within the β×β table since β = s^{c1} with c1 ≥ 2c0; the rest are O(β) pairs per role. All interactions are radius-1.

E. B=2 sanity instance blueprint (DP-ready)
- Fix B=2. Port^I(k,b), Port^P(k,b) for k∈{1,2}, b∈{0,1}. Head_1, Head_2, Accept_1, Accept_2. Q_1 and Q_2 families each with four boundary tokens. S colors {R,G,B,⊥}. GateL/GateR. RUN_B row alphabet (constant-size), and verdict states Ver(e,q,c) with e,q∈{0,1}, c∈{R,G,B}.
- Probe rules instantiate the schema:
  • (BL1_1, BL2_1), (BL2_1, Head_1), Head_1 propagations, (Head_1, Port^P(1,b)), (Port^P(1,1), Accept_1), (Port^P(1,0), ·) has no successor, (Head_1, Port^P(2,b)), (Port^P(2,b), Head_1).
  • Similarly for j=2 with indices swapped.
- Canonical W_L(u) with u∈{00,01,10,11}: PORT^I(1,u_1), PORT^I(2,u_2) adjacent to S, with HEAD_C before them. The DP on the 4-node boundary assigns Q_1 or Q_2 and checks that E[Q_1]=u_1, E[Q_2]=u_2.
- Seam: For a toy D (say, the 4-cycle on {00,01,10,11}), RUN_B emits Ver(EDGE,Eq,FwdColor), and the S2–Ver adjacency forbids equal colors iff EDGE=1 and requires equality if Eq=1. Mixed pairs accept via PAD.

F. Soundness/completeness checks (sketch, unchanged in spirit)
- Completeness: Given a 3-coloring χ of the succinct graph, set f(τ^L_u)=χ(u), f(τ^R_v)=χ(v), f(others)=⊥. Active-active pairs accept because RUN_B computes EDGE and Eq correctly and the local gate enforces χ(u)≠χ(v) when EDGE=1 and χ(u)=χ(v) when Eq=1; mixed/inactive pairs accept via PAD and gating.
- Soundness: Any feasible f must map non-canonical types to ⊥ and assign colors to canonical types (by gating/must-color). Then χ(u):=f(τ^L_u) is well-defined (Eq-gate across (L(u),R(u)) forces consistency), and for any edge D(u,v)=1, the (L(u),R(v)) pair is extendible only if colors differ, so χ is a proper 3-coloring.

G. Outstanding items and why they matter
- Existence/normalization of canonical contexts at lengths ℓ_pump or ℓ_pump+1: We continue to rely on pumping/replacement (Lemmas 10–12, 14–15 from the reference) to ensure that HEAD_C+PORT+PAD blocks occur adjacent to S at the required lengths. Alternatively, we could present an explicit “two-length padding” construction; until then, keep this as an assumption tied to the standard lemmas.
- DP regression (B=2): Assemble a machine-readable instance listing Cin–out and Cout–out per the schemas above; verify by the O(kβ^2) DP (i) probe separation; (ii) seam acceptance behavior on all 16 ordered pairs (L(u),R(v)).

Why this round is substantive progress
- We turned the probe and seam gadgets into explicit radius-1 adjacency schemas that the verifier can implement and test: (i) deterministic per-bit probe with no error escape and extendibility exactly u_j; (ii) per-side gating with mixed pairs accepting unconditionally; (iii) active seam with local EDGE/Eq gate adjacent to S2. Budgeting and radius-1 checks are laid out; the B=2 instance is specified concretely enough to build the DP.

Next steps (auditable deliverables)
1) Produce the explicit C_out–out table fragment (parameterized by B) for the probe schema: list all (Head_j, Port^P(k,b)) and (Port^P(k,b), Head_j) pairs, the start/accept edges, and the disallowed ERR/⊥ adjacencies in probe mode. Provide the Cin–out rule tying Port(k,b).RidBit to Σ_in.
2) Formalize the GateL/GateR placement around S (constant-size patterns) and the exact pairs that enable ActiveBridgeStart only when both sides are canonical and S colors are non-⊥.
3) Fix the RUN_B row alphabet and transitions for a concrete U; specify the verdict cell placement and the allowed/forbidden S2–Ver pairs for all (EDGE,Eq,FwdColor) and S2 colors.
4) Build and share the B=2 tables and a small D (4-cycle) for the verifier’s DP harness; check probe separation and seam behavior thoroughly.
5) (Optional) Add a short proof of the replacement/padding lemma specialized to r=1 into output.md so canonical contexts at lengths ℓ_pump or ℓ_pump+1 are guaranteed without appealing externally.

## Round 0005 — 2025-08-28T12:40:21.652864Z

Round 0005 — Toward a DP-checkable B=2 instance: explicit Cin–out/Cout–out fragments for probes, tokens, gating, and verdict

Context and goal
- We adopt directional tokens for seam activation (as recommended in verifier.feedback.md) and produce an explicit, radius-1 rule skeleton for B=2 that a DP can check. The focus is on: (i) per-bit boundary probes Q_1, Q_2; (ii) per-side color gating plus mixed-pair fallback (must-color only in active-active); (iii) a seam verdict cell V enforcing both EDGE and Eq via S2↔V local pairs; and (iv) ERR/⊥ discipline in probe/seam modes. We keep disjoint-role subalphabets so sizes add rather than multiply.

Symbols (B=2, disjoint roles)
- Boundary-reserved outputs (used only on boundary nodes at the four ends for the TS checks): BL1_1, BL2_1, BR2_1, BR1_1 and BL1_2, BL2_2, BR2_2, BR1_2 corresponding to Q_1 and Q_2. (The DP sets boundary outputs to these values; interior neighbors see them through Cout–out.)
- S-node symbols: S_R, S_G, S_B, S_⊥. (No handshake bits on S; all activation/gating is enforced by the interior neighbors’ symbols.)
- Interior roles (pairwise disjoint subalphabets):
  • PAD: Pad.
  • ERR: Err. (Used only outside probe/seam-active modes.)
  • PORT (probe-idle): P1^0, P1^1, P2^0, P2^1. (Addr=j and RIDbit=b encoded in the name.)
  • PORT (probe-active variants): P1p^0, P1p^1, P2p^0, P2p^1. (Same content, different role tag to control adjacency during probes.)
  • PROBE states (per j): Head_1, Accept_1; Head_2, Accept_2. (Start is injected from the boundary neighbor via BL2_j → Head_j.)
  • Gating neighbors: GateL, GateR (the unique symbols that may appear immediately inside S1/S2 for canonical sides); NonGate (placeholder representing any other noncanonical neighbor role adjacent to S).
  • Seam corridor (RUN/PAD aggregate role with token flags): we instantiate four concrete corridor symbols by token bits: Corr_00, Corr_10, Corr_01, Corr_11 where the suffix encodes (Tok→, Tok←) ∈ {(0,0),(1,0),(0,1),(1,1)}. These occur only on the bridge wb∘wc (the two cells immediately adjacent to S and possibly one more cell for B=2; here we use two cells: one next to S1 and one next to S2).
  • Verdict cell (adjacent to S2 only): Ver(c, e, q) with c∈{R,G,B}, e∈{0,1}, q∈{0,1}. (12 symbols.)

Cin–out constraints (B=2)
- PORT cells tie RIDbit to input bit:
  • Allowed: (input 0, P1^0), (input 1, P1^1), (input 0, P2^0), (input 1, P2^1).
  • Same for probe-active variants: (0, P1p^0), (1, P1p^1), (0, P2p^0), (1, P2p^1).
- Other roles ignore input: for each x∈{Pad, Err, Head_1, Accept_1, Head_2, Accept_2, GateL, GateR, NonGate, Corr_00, Corr_10, Corr_01, Corr_11, Ver(⋅)}, both (0,x) and (1,x) are allowed.
- S-node symbols: both inputs allowed for S_R, S_G, S_B, S_⊥.

Cout–out: PORT zone well-formedness and placement (left canonical block)
- Adjacent to S1 on its right, the first interior cell of a canonical left block is GateL, followed immediately by the contiguous PORT zone P1, P2 (in this order), then Pad. Allowed pairs inside a canonical left block (rightward orientation):
  • (GateL, P1^b), (P1^b, P2^{b′}), (P2^{b′}, Pad). (For all b,b′∈{0,1}.)
- In non-canonical left contexts, the neighbor of S1 is NonGate; from NonGate we only allow PAD onward: (NonGate, Pad), Pad self-loops. (We do not list any pair enabling PORT after NonGate.)
- Symmetric rules for the canonical right block: immediately left of S2 is GateR; on its left are the contiguous PORT cells P2, P1 in reverse (since the path is oriented left-to-right, the right block’s PORT sits to the left of S2). For simplicity in B=2 we mirror: allowed pairs leftward are expressed via rightward pairs as (P2^b, GateR) and (Pad, P2^b), (P1^{b′}, GateR) as needed; for the DP we will construct rightward lists so that reading from left to right along wb∘wc we encounter …Pad, P1^⋅, P2^⋅, GateR, S2.

Per-bit probe TS (left side; radius-1; deterministic; no escape)
- Injection from boundary (for j∈{1,2}):
  • Allowed: (BL1_j, BL2_j), (BL2_j, Head_j).
  • Disallowed: Any pair (BL2_j, x) with x≠Head_j.
- Corridor to PORT (we use the probe-active variants at the PORT cells visited during probes):
  • Before the PORT zone: (Head_j, Head_j) on any corridor Pad stretch prepared for the canonical block. In B=2 we keep this to one step: (Head_j, P1p^b) for the first PORT cell.
  • Entering PORT: (Head_j, P1p^b) allowed for all b. From P1p^b to the next cell:
    – If j=1 and b=1: (P1p^1, Accept_1) allowed; if b=0: no successor (DP dead-ends under Q_1).
    – If j=2: (P1p^b, Head_2) continues the march to the next PORT.
  • At second PORT: (Head_2, P2p^b) allowed. Then:
    – If j=2 and b=1: (P2p^1, Accept_2) allowed; if b=0: no successor.
    – If j=1: this case only arises if Head_1 reached P2p^b; we allow (P2p^b, Head_1) to continue (though for B=2, Head_1 should have halted at P1p already; the pair is harmless if never used in a well-formed block).
- Accept exits deterministically to Pad: (Accept_j, Pad), (Pad, Pad) self-loop.
- Probe-mode discipline (no ERR/⊥ escape): We do not list any pairs with Err adjacent to Head_j or Accept_j or any probe-active PORT P⋅p^⋅; similarly, no (Head_j, S_⋅) or (Head_j, GateL/NonGate) pairs.
- Idle vs probe-active PORT symbols: In probe mode we require P⋅p^⋅ at the PORT positions by listing (Head_j, P⋅p^⋅) and omitting (Head_j, P⋅^⋅). In all non-probe contexts we do not permit P⋅p^⋅; only P⋅^⋅ with standard PAD neighbors are allowed.
- Type-separation claim (B=2 instance): With the above, for any canonical left word L(u1u2), E_{L(u)}(a⋆)[Q_1] = u1 and E_{L(u)}(a⋆)[Q_2] = u2 (with a⋆ fixed arbitrarily, e.g., 0000). This is DP-checkable.

Per-side color gating at S (local; mixed pairs accept)
- Allowed S1-adjacent pairs (left side):
  • If neighbor is GateL: (GateL, S_R), (GateL, S_G), (GateL, S_B), (GateL, S_⊥).
  • If neighbor is NonGate or Pad: only (NonGate, S_⊥), (Pad, S_⊥). (All (NonGate, S_color) with color∈{R,G,B} omitted.)
- Symmetrically for S2: if its left neighbor is GateR, then (GateR, S_color) allowed for color∈{R,G,B,⊥}; if neighbor is not GateR, only (NonGate, S_⊥)/(Pad, S_⊥) allowed.
- This makes mixed pairs vacuous: a canonical side may be colored; a non-canonical side must be ⊥.

Directional tokens and seam activation (local; must-color only in active-active)
- Token seeding at the first corridor cells adjacent to S:
  • When (GateL, S_color) occurs at S1’s edge and the right neighbor cell is the first corridor cell, we allow only (S_color, Corr_10) (Tok→=1) as the successor (and forbid (S_color, Corr_00), (S_color, Corr_01), (S_color, Corr_11)). If S1= S_⊥, we allow only (S_⊥, Corr_00).
  • When the left neighbor of S2 is GateR and the left corridor cell is adjacent to S2, we enforce Tok←=1 on that corridor cell: the edge immediately to the left of S2 must be (Corr_x1, S_color) for some x (i.e., Tok←=1); if S2= S_⊥ we still permit (Corr_01, S_⊥) in mixed pairs.
- Token propagation across the two corridor cells (we use exactly two):
  • Left corridor cell C_L ∈ {Corr_10, Corr_00} sits to the right of S1; right corridor cell C_R ∈ {Corr_01, Corr_00, Corr_11} sits to the left of S2. Allowed pairs:
    – (Corr_10, Corr_11) (Tok→ continues right; Tok← injected on the next cell if GateR is present), (Corr_10, Corr_10) otherwise is not listed (we force meeting at the second corridor cell).
    – (Corr_01, Corr_01) (Tok← persists if injected from the right side only).
    – (Corr_00, Corr_00) for inactive edges.
    – In active-active, list (Corr_10, Corr_11) and (Corr_11, GateR) (see below).
- Must-color enforcement (local at S):
  • If the corridor cell adjacent to S1 has Tok←=1 (i.e., symbol is Corr_01 or Corr_11), then omit pairs (Corr_01, S_⊥) and (Corr_11, S_⊥); only (Corr_01, S_color) and (Corr_11, S_color) with color∈{R,G,B} are allowed. If Tok←=0 (Corr_00 or Corr_10), allow (Corr_⋅0, S_⊥) and (Corr_⋅0, S_color) (mixed/inactive fallback).
  • Symmetrically at S2: if the corridor cell to its left has Tok→=1 (Corr_10 or Corr_11), omit (S_⊥, Corr_10) and (S_⊥, Corr_11); only (S_color, Corr_10/Corr_11) allowed. If Tok→=0, allow (S_⊥, Corr_00/Corr_01) and (S_color, Corr_00/Corr_01).

Verdict placement and S2↔V local acceptance (EDGE and Eq)
- Verdict insertion (one-cell): In active-active mode (both tokens present), the right corridor cell adjacent to S2 must be Ver(c,e,q) instead of a Corr_⋅⋅ symbol. We realize this by listing only the pairs (Corr_11, Ver(c,e,q)) for some c,e,q (and omitting (Corr_11, S2) with a corridor symbol). The color c is copied from S1 by permitting (S1_color, Corr_10) only when the Ver’s c equals that S1_color; concretely, we constrain the sequence S1_color → Corr_10 → Corr_11 → Ver(c, e, q) so that c matches S1_color. (For DP, we can simply list (Corr_11, Ver(R,⋅,⋅)), (Corr_11, Ver(G,⋅,⋅)), (Corr_11, Ver(B,⋅,⋅)) and then add S2↔Ver gating below; the color-copy guarantee is optional for the toy B=2 check.)
- Computation of EDGE and Eq (B=2): For audit we tabulate D(u,v) and Eq[u=v] by constant-width local rules that “read” the PORT bits u and v. An easy way is to require that the left corridor cell Corr_10 sits immediately after P2 (on the left side) so it sees u (two PORT cells back), and the right corridor cell Ver(⋅,e,q) sits immediately before GateR and thus “sees” v; we then list only those (P1^u1,P2^u2, Corr_10) patterns and (Ver(⋅,e,q), P2^v2, P1^v1) local neighborhoods consistent with (EDGE, Eq) for the chosen D (e.g., the 4-cycle). For the DP harness, we can bake the 16 cases into which Ver(⋅,e,q) symbols are allowed given the adjacent PORT values on each side. (This is implementable via radius-1 pairs by expanding a finite number of Corr/Ver variants if needed; for brevity we leave the exact micro-expansion as a checklist item.)
- S2↔Ver local acceptance table (simultaneous constraints): For each Ver(c,e,q) and S2_color ∈ {R,G,B} we allow S2↔Ver iff both hold: (A) if e=1 then S2_color≠c; (B) if q=1 then S2_color=c. Enumerated allowed pairs:
  • If (e,q)=(0,0): allow all (S2_color, Ver(c,0,0)).
  • If (e,q)=(1,0): allow (S2_color≠c, Ver(c,1,0)); forbid (c, Ver(c,1,0)).
  • If (e,q)=(0,1): allow (c, Ver(c,0,1)); forbid (S2_color≠c, Ver(c,0,1)).
  • If (e,q)=(1,1): (this case does not arise for D(u,u)=0; to be safe, list none so any accidental appearance dead-ends.)
- ERR/⊥ disabled near VERD in active modes: We omit all pairs with Err adjacent to Corr_⋅⋅ or Ver(⋅) whenever Tok→ or Tok← is 1. (Outside active-active/mixed, ERR is permitted next to Pad/NonGate.)

Mixed-pair fallback
- If exactly one side is canonical, then one token is present and the other absent. Locally, this permits S_color on the canonical side (GateL/R adjacency), forces S_⊥ on the non-canonical side (NonGate adjacency), allows corridor cells to be Corr_10 or Corr_01 near the canonical side and Corr_00 elsewhere, and crucially allows S↔Corr pairs with S_⊥ (since opposite-direction token is 0). No Ver(⋅) appears (no Corr_11), so the pair accepts unconditionally via PAD/corridor self-loops.

ERR discipline outside special modes
- Outside probes or active seam (i.e., when no Head_j/Accept_j/P⋅p^⋅ or Corr_⋅⋅/Ver(⋅) present), we allow (Pad, Err), (Err, Err), (Err, Pad) to guarantee malformed interiors can always be completed and never constrain f.

B=2 DP audit plan (concrete checklist)
1) TS probe checks: Build four canonical left seeds L(00), L(01), L(10), L(11) whose interior right of S is GateL, P1^{u1}, P2^{u2}, Pad. Set boundary inputs a⋆ (e.g., 0000). For Q_1: boundary outputs (BL1_1, BL2_1, BR2_1, BR1_1); run the DP and confirm extendibility iff u1=1. Similarly for Q_2 vs u2.
2) Seam/mixed pairs: Build R(v) symmetrically so that left of S2 is Pad, P2^{v2}, P1^{v1}, GateR. For each pair (u,v), activate corridor tokens as per GateL/GateR presence. Instantiate the toy succinct graph D as the 4-cycle on {00,01,11,10} with D(u,u)=0. Bake the 16 cases into the allowed Ver(⋅,e,q) alongside the local S2↔Ver acceptance table above. Verify:
   • Mixed pairs (exactly one side canonical) accept for any S_color on the canonical side and S_⊥ on the non-canonical side.
   • Active-active pairs accept iff (D(u,v)=0 or colors differ) AND (u=v ⇒ colors equal). (Since Eq=1 only for u=v, the latter becomes a requirement.)
3) ERR/⊥-escape: Confirm via the adjacency that no Head_j, P⋅p^⋅, Corr_⋅⋅, or Ver(⋅) has any outgoing pair to Err; attempts dead-end as intended.

Alphabet/adjacency budget (B=2 instance)
- Symbols: S(4) + PORT idle(4) + PORT probe(4) + PROBE(4) + Gate*(2) + NonGate(1) + Pad(1) + Err(1) + Corr(4) + Ver(12) + boundary tokens(8) = 45 symbols. Adjacency table lists O(10^2) pairs; well within β for any reasonable β≥64.

Gaps in output.md (observations; no edits made)
- Context set C not explicitly defined in output.md: As used in our reduction and the NEXPTIME upper bound, C denotes types realized by words w_1 S w_2 with |w_i|∈{ℓ_pump, ℓ_pump+1}. It may help to add this remark (|C|≤ℓ_pump), though the main theorems do not depend on it.
- Finite-Z bound is stated (Cor. 4) with Z≤|T|^2; we use this for (F2) in the upper bound. For hardness we neutralize (F2) via ⊥-plumbing; output.md does not describe this family-specific trick (by design), but our notes rely on it.

Obstacles/risks and mitigations
- Verdict e/q linkage to PORT bits (B=2): We sketched two radius-1 realizations: (i) expand Corr/Ver symbols to encode the (u,v) case and list only consistent pairs; (ii) constrain the corridor placement to sit adjacent to the PORT cells and list only (PORT, Corr)/(Corr, Ver)/(Ver, PORT) pairs consistent with the table of (EDGE,Eq). Either is DP-checkable with a finite list; we propose to use (i) to keep the corridor width at two.
- “Simultaneous activation” locality: Resolved via tokens. Must-color and the requirement to attach to Ver(⋅) are triggered solely by the presence of the opposite-direction token on the adjacent corridor cell; this is local and symmetric.
- Probe determinism: We listed the unique successors from BL2_j and from probe-active PORT cells; no pairs to Err/S/Pad are present before Accept_j, preventing escape.

Next steps (auditable deliverables)
1) Finalize the B=2 machine-readable instance: list the exact symbol set and the Cout–out adjacency pairs as above, plus the 16-case table wiring (u,v)↦(EDGE,Eq) into Corr/Ver pairs. Share with the DP harness.
2) Run the DP to validate: TS per-bit probes; mixed-pair acceptance; active-active seam behavior for all 16 (u,v) with the S2↔Ver acceptance table; absence of Err/⊥ escape.
3) Generalize the probe schema to arbitrary B (add Head_j/Accept_j and P_kp^⋅ symbols) and state the O(B^2) adjacency count bound explicitly; verify symbol budgets with β≥c·B^2.
4) Add a short r=1 padding lemma (or cite Lemmas 11, 14–15) guaranteeing existence of canonical contexts at lengths ℓ_pump and ℓ_pump+1 with the PORT zone abutting S; ensure pumping occurs in PAD only.
5) After B=2 validation, formalize Lemma TS (type separation), Lemma RG (gating + tokens), and Lemma SG (seam verdict with EDGE/Eq) and integrate into the curated output once vetted.

## Round 0005 — 2025-08-28T12:40:25.720099Z

Round 0005 — Parametric, radius-1 rule schemas you can DP-check; adopting directional tokens

Context and objective
- We adopt the verifier’s recommendation to use directional tokens for seam activation. This round supplies explicit, radius-1 Cout–out (and the relevant Cin–out) rule schemas that are ready to be instantiated (especially for B=2) and verified by the O(kβ^2) DP. We also give a short, specialized padding lemma (radius 1) to justify canonical contexts at lengths in {ℓ_pump, ℓ_pump+1} without changing near-S behavior.

A. Per-bit probe: explicit local rules (Type-Separation TS)
Symbols/tracks (folded into Σ_out; disjoint role subalphabets so sizes add):
- Boundary outputs: for each j∈[B], four reserved tokens Q^L1_j, Q^L2_j, Q^R2_j, Q^R1_j. All non-reserved boundary outputs are ordinary tokens Bnd•.
- PORT zone (adjacent to S on canonical left): Port^I(k,b) and Port^P(k,b) for k∈[B], b∈{0,1}. Port^I used in idle, Port^P in probe mode; both carry (Role=PORT, Addr=k, RIDbit=b).
- Probe states per j: Start_j, Head_j, Test_j, Accept_j (Role=PROBE). No other role has ProbeHead≠None.
Cin–out constraints:
- When Role=PORT, RIDbit equals the node’s input bit; otherwise unrestricted.
Cout–out pairs (all omitted pairs are illegal):
- Boundary injection (reserved probes only): (Q^L1_j, Q^L2_j) and (Q^L2_j, Start_j). No other successor from Q^L2_j.
- Corridor marching to PORT[1]: (Start_j, Head_j). For any non-PORT corridor cell y, (Head_j_prev, Head_j_y). No pairs from Head_j to ERR/⊥ (disables escape).
- Entering PORT and scan-by-address:
  • For any k,b: (Head_j_prev, Port^P(k,b)).
  • If k≠j: (Port^P(k,b), Head_j_next) (head keeps moving).
  • If k=j and b=1: (Port^P(j,1), Test_j), then (Test_j, Accept_j). If k=j and b=0: Test_j has no legal successor (dead-end). No (Test_j,•) except (Test_j,Accept_j).
- Accept exit to PAD: (Accept_j, PAD), and then PAD self-loops.
- Mode exclusivity: Any adjacency involving Start_j/Head_j/Test_j/Accept_j appears only under Q_j; there are no pairs from PAD/HEAD/PORT^I into any PROBE state. Thus PROBE states cannot spontaneously appear unless Q_j is used.
- PORT contiguity/monotonicity (independent of probes): For consecutive PORT cells x→y, allowed pairs enforce Addr(x)+1=Addr(y), starting at Addr=1 and ending at Addr=B. This makes a contiguous block abutting S; non-PORT intrusions in between have no legal pairs with PORT neighbors.
Claim TS (restated, DP-checkable): For canonical L(u) with a well-formed contiguous PORT zone at S, and fixed boundary inputs a⋆, the DP on the 4-node boundary with outputs Q_j accepts iff u_j=1, hence E_{L(u)}(a⋆)[Q_j]=u_j. Determinism comes from unique successors and the prohibition of ERR/⊥ near PROBE.

B. Per-side color gating and seam activation with directional tokens
Symbols/tracks:
- S-color tokens at the two S nodes: S_⊥, S_R, S_G, S_B.
- Gate tokens adjacent to S inside canonical blocks: GateL on left interior neighbor of S1; GateR on right interior neighbor of S2.
- Corridor roles across the bridge wb∘wc: RUN, PAD, VERD (verdict cell role). Each corridor symbol encodes Tok→,Tok←∈{0,1} (two bits) used only on corridor roles.
Local gating at S (Cout–out pairs touching S and its interior neighbor):
- Permission: If neighbor is GateL (resp. GateR), allow S∈{S_R,S_G,S_B,S_⊥} on that side; else only S_⊥ allowed. This is per-side, independent.
Directional token seeding (purely local):
- If the interior neighbor is GateL and S1∈{S_R,S_G,S_B}, then the immediate corridor cell to the right of S1 must have Tok→=1; otherwise Tok→=0.
- If the interior neighbor is GateR and S2∈{S_R,S_G,S_B}, then the immediate corridor cell to the left of S2 must have Tok←=1; otherwise Tok←=0.
Token propagation (deterministic):
- For any corridor edge x→y, allowed iff Tok→(y) ≥ Tok→(x) and Tok←(y) ≥ Tok←(x), and once a token bit becomes 1 it stays 1 across the entire bridge (monotone propagation). Concretely, list the four allowed bit-pairs per edge: (0,0)→(0,0), (1,0)→(1,0), (0,1)→(0,1), (1,1)→(1,1). Disallow any decrease.
Must-color and mixed-pair fallback (local checks at S):
- If the interior neighbor’s Tok bit from the opposite side is 1 (Tok→ at S1’s neighbor; Tok← at S2’s), then the only allowed S tokens are S_R,S_G,S_B (forbid S_⊥). Also, in this case S must attach to a non-PAD verdict/corridor neighbor (see C below); attaching to neutral PAD is forbidden. If the opposite token bit is 0, both S_⊥ and S_{R,G,B} are allowed and may attach to PAD neighbors (mixed/inactive acceptance).
Remark: These three rules ensure: (i) only canonical sides can choose colors; (ii) must-color is enforced only in active-active (both tokens present); and (iii) mixed pairs accept via PAD-only plumbing.

C. RUN tableau and verdict cell with local EDGE/Eq gate
Verdict neighbor format:
- The cell immediately to the right of S2 (inside the corridor) takes a role VERD(e,q,c) with e=EDGE∈{0,1}, q=Eq∈{0,1}, and c=FwdColor∈{R,G,B}. A 1-bit forwarder track copies S1’s color along the corridor; pairwise neighbor equalities enforce consistency until VERD.
Local acceptance at S2↔VERD (enumerable finite list):
- Allowed pairs (S2, VERD(e,q,c)) exactly when both constraints hold:
  • If e=1, then S2’s color ≠ c; else (e=0) no restriction.
  • If q=1, then S2’s color = c; else (q=0) no restriction.
- Concretely: for e=0,q=0 allow all 3×3 color pairs; e=1,q=0 allow all unequal pairs; e=0,q=1 allow only (S2=c); e=1,q=1 allow none (this case should be unreachable if D(u,u)=0; if it occurs due to a malformed tableau, the instance correctly dead-ends).
RUN corridor robustness and activation:
- When both Tok→=Tok←=1 (active-active), Cout–out permits only RUN/VERD states (no ERR/⊥) and requires a well-formed row-by-row simulation of U that reads (enc(D), u, v). Any malformed step has no legal continuation (local refutation). When at least one token is 0, RUN/VERD symbols are disallowed and PAD plumbing is allowed.

D. B=2 auditable micro-instance (symbol list and key pairs)
Symbols (minimal set):
- S: S_⊥, S_R, S_G, S_B.
- PORT (left): Port^I(1,0/1), Port^I(2,0/1), Port^P(1,0/1), Port^P(2,0/1).
- Probe: Start_1, Head_1, Test_1, Accept_1; Start_2, Head_2, Test_2, Accept_2.
- Boundary: Q^L1_1,Q^L2_1,Q^R2_1,Q^R1_1 and same for j=2; also generic Bnd• tokens.
- Gate: GateL, GateR.
- Corridor: PAD_00, PAD_10, PAD_01, PAD_11 (PAD with Tok→Tok← bits), and VERD(c∈{R,G,B}, e∈{0,1}, q∈{0,1}); RUN_x (finite work alphabet, omitted here but locally checked).
Key Cout–out pairs (subsample; full set by schemas A–C):
- Probes: (Q^L2_1, Start_1), (Start_1, Head_1), (Head_1, Port^P(1,b)), (Port^P(1,1), Test_1), (Test_1, Accept_1), (Accept_1, PAD_00), (Head_1, Port^P(2,b)), (Port^P(2,b), Head_1). Mirror for j=2.
- PORT contiguity: (Port^I(1,•), Port^I(2,•)) allowed; (Port^I(2,•), non-PORT) terminates block; no other cross.
- Gating at S1: (GateL, S_{R/G/B/⊥}) allowed; (non-GateL, S_⊥) only. Similarly for S2 and GateR.
- Token seeding/propagation: From GateL with S1∈{R,G,B} require the right neighbor be PAD/RUN with Tok→=1; else Tok→=0. Along corridor, (PAD_ab, PAD_ab) and (PAD_a b, PAD_a b) with nondecreasing bits as above.
- Must-color: If the cell next to S2 has Tok←=1, forbid (S_⊥, •) and forbid attachment to bare PAD; require the neighbor be VERD or a RUN boundary state. If Tok←=0, allow (S_any, PAD_•0) freely.
- Verdict: enumerate allowed (S2_color, VERD(e,q,c)) as per C.
DP audit steps:
1) Build L(00), L(01), L(10), L(11) with a length-2 PORT zone abutting S and seed HEAD/PAD elsewhere. Fix a⋆. Verify E_{L(u)}(a⋆)[Q_1]=u_1 and E_{L(u)}(a⋆)[Q_2]=u_2.
2) Define a toy D on 4 vertices (00–01–11–10–00). Implement U as a constant table writing VERD(e,q,c) with q=1 iff u=v and e=1 on edges. For all 16 ordered pairs (L(u),R(v)): active-active accepts iff [(edge ⇒ colors differ) ∧ (u=v ⇒ colors equal)]. Mixed pairs (exactly one Gate) accept for any color on the canonical side and ⊥ on the other.

E. Padding lemma for canonical contexts (radius 1, specialized)
Lemma Pad (explicit). Fix any finite “near-S” pattern W (HEAD·PORT(B)·RUN), and a PAD filler P (Role=PAD) whose Type(P^t) stabilizes by t≥t0 (exists by Lemma 15). For each large ℓ∈{ℓ_pump, ℓ_pump+1}, there exists t such that |P^t·W|=ℓ and Type(P^t·W) depends only on Type(W) (independent of t once t≥t0). Moreover, since PAD never uses PROBE/RUN/PORT roles, the probe/seam interfaces at S are unchanged.
Proof sketch: By periodicity of Type(P^t) and replacement (Lemma 11), increasing t beyond t0 does not change Type(P^t·W). Adjust t by at most 1 to hit the desired length. Apply symmetrically on the right. Hence canonical contexts with PORT abutting S exist at both target lengths without altering the gadgets.

F. Budget and locality recap (for the tables you will instantiate)
- Disjoint role subalphabets (S, PORT, PROBE, GATE, PAD, RUN, VERD, BOUNDARY) prevent unintended cross-products; sizes add. Dominant counts: O(B) PORT symbols (both I/P variants) and O(B) probe states. Adjacency table has O(B^2) nonzeros from (Head_j↔Port^P(k,•)) and a constant number elsewhere. Choose β ≥ c·B^2.

Gaps/clarifications in output.md
- None critical remain; output.md already states the “fixed interior inputs” interpretation parenthetically in Definitions. You may consider adding a short note that C (context types) is realized by w_1 S w_2 with |w_i|∈{ℓ_pump,ℓ_pump+1}, hence |C|≤ℓ_pump (used implicitly in our verifier loops).

Next steps (auditable)
1) Instantiate the above schemas for B=2: provide the full Cin–out mask (RIDbit copy) and the complete Cout–out table fragment covering A–D.
2) Run the O(kβ^2) DP to validate TS and the seam behavior on all 16 pairs; include traces for any failing pair (none expected).
3) Generalize the B=2 tables parametrically to arbitrary B (the only growth is in the families {Port^•(k,·)} and {Start/Head/Test/Accept}_j and {Q}_j).
4) Incorporate Lemma Pad (E) into output.md as a short lemma once the DP confirms behavior.
5) Package the S3Col→FFE(F1) reduction with these gadgets; ensure ⊥-plumbing makes (F2) vacuous, concluding NEXPTIME-hardness of the 3-way classifier in this explicit model.

## Round 0005 — 2025-08-28T12:40:31.236846Z

Round 0005 — Parametric, radius-1 rule schemas (directional tokens adopted), B=2 instantiation blueprint, and finite-length canonical contexts

Context and objective
- We continue the NEXPTIME-hardness program via Succinct 3-Coloring (S3Col) by finalizing DP-auditable, radius-1 rule schemas for: (i) deterministic per-bit boundary probes that separate 2^B canonical vertex types; (ii) per-side color gating; (iii) seam activation via directional tokens Tok→/Tok← with a local verdict enforcing simultaneously EDGE and Eq; and (iv) a bridging policy that either vacuously holds (inactive/mixed) or reduces to the same local seam constraints regardless of repetition z. We also provide a B=2 symbol list and explicit Cout–out fragments sufficient for a DP check.
- Minor gaps to output.md: (1) Please add a parenthetical note that types E_w(a) are computed with respect to fixed interior inputs (our PORT.RIDbit copies the fixed Σ_in). (2) When feasible functions are used, it helps to define the context set C explicitly as those types realized by w_1 S w_2 with |w_i| ∈ {ℓ_pump, ℓ_pump+1}; hence |C| ≤ ℓ_pump. (We do not edit output.md, only flagging these clarifications.)

A) Per-bit probe (Type-Separation) — explicit radius-1 rules (deterministic, no escape)
Symbols/tracks used (folded via disjoint roles; sizes add):
- Roles: {PAD, HEAD, PORT, PROBE, RUN, VERD, ERR, S} × Phase∈[c0] (constant c0).
- PORT subtracks: Addr∈{1,…,B}, RIDbit∈{0,1}.
- Probe states per j∈[B]: Start_j, Head_j, Test_j, Accept_j (role=PROBE).
- Boundary outputs: For the 4 boundary positions, reserve B 4-tuples Q_j. We refer to the second-from-left boundary output as BL2_j for injection.
- Cin–out: PORT cells have (input b, output RIDbit=b) allowed for b∈{0,1}. Non-PORT roles ignore RIDbit in Cin–out; ERR and PAD accept any input (standard).
- PORT well-formedness and contiguity: Allowed PORT–PORT Cout–out pairs on interior edges are exactly (P(k,·) → P(k+1,·)) for k=1,…,B−1; no other PORT adjacency allowed. The unique PORT block abuts S.
Cout–out rules (parametric in j):
- Injection: (BL2_j → Start_j) is the only allowed successor from BL2_j.
- March: For any non-PORT y, allow (Head_j → Head_j at y); forbid any pairs from {Start_j,Head_j,Test_j,Accept_j} to ERR or to ⊥.
- At PORT(k,b):
  • If k≠j: allow (Head_j(prev) → Head_j(curr)), no other successor.
  • If k=j and b=1: allow (Head_j(prev) → Test_j(curr)), then (Test_j → Accept_j) to the next cell.
  • If k=j and b=0: no successor listed from Head_j; dead-ends.
- Accept exit: (Accept_j → PAD) followed by PAD self-plumbing.
Type-Separation claim TS (re-stated, DP-checkable): Fix boundary inputs a⋆. For any canonical left block L(u) with PORT adjacent to S, E_{L(u)}(a⋆)[Q_j] = u_j. Proof sketch: under Q_j, the only legal continuation is the deterministic chain above; it reaches PORT(j, u_j) and continues iff u_j=1; Cin–out ties RIDbit to the input bit. ERR/⊥ are disallowed near PROBE, eliminating alternative completions. Symmetric right probe gives 2^B right-types.
Alphabet/adjacency budget: PROBE contributes O(B) symbols, PORT contributes O(B), reserved boundary outputs contribute O(B). The adjacency table needs O(B^2) pairs for (Head_j ↔ PORT(k,·)); others are O(1). With disjoint roles, |Σ_out| = Θ(B) and |Cout–out| = O(B^2) + O(β), feasible with β = s^{c1} and B = s^{c0}, c1 ≥ 2c0.

B) Per-side color gating and directional-token seam activation (mixed pairs accept)
Symbols/tracks:
- S colors: {S_R, S_G, S_B, S_⊥} (role=S). Only the color field is under f; all other subtracks derive from neighbors.
- Gate tokens at the interior neighbor of S: GateL (left side canonical), GateR (right side canonical). If absent, neighbor is neutral PAD.
- Directional tokens on the corridor: Tok→, Tok← ∈ {0,1} carried by RUN/PAD/VERD cells across the bridge wb∘wc. Tokens propagate deterministically; see rules below.
Per-side gating (purely local):
- If S’s interior neighbor is Gate•, S may be in {S_R,S_G,S_B,S_⊥}; otherwise S must be S_⊥ (only S_⊥-adjacency pairs are listed to neutral neighbors).
Token seeding (only when the side is canonical and colored):
- If (GateL ↔ S_x) with x∈{R,G,B}, the first corridor cell to the right of S1 is forced to Tok→=1 (a special Seed→ state). If S1=S_⊥, no seeding: Tok→=0.
- Analogously, if (S2_x ↔ GateR) with x∈{R,G,B}, the first corridor cell to the left of S2 is forced to Tok←=1 (Seed←); else Tok←=0.
Token propagation (radius-1):
- Along the corridor toward the opposite end, for any consecutive interior edge i→i+1, allowed pairs enforce: Tok→(i)=1 ⇒ Tok→(i+1)=1; Tok←(i+1)=1 ⇒ Tok←(i)=1. (Implement by restricting allowed symbol pairs to those with nonincreasing zeros, i.e., once 1 is present it persists; in practice, corridor symbols carry both bits, and Cout–out allows only pairs with Tok→ nondecreasing left→right and Tok← nondecreasing right→left.) Outside the corridor, tokens are implicitly 0 (no symbols with tokens permitted).
Must-color and mixed-pair fallback (enforced at S by inspecting opposite token on its neighbor):
- Let N1 be S1’s interior neighbor; if Tok→(N1)=0, any S1∈{S_R,S_G,S_B,S_⊥} may attach to neutral neighbors; if Tok→(N1)=1 (which occurs only when the right side is canonical and colored), then S1≠S_⊥ is required and the neighbor must be the designated FWD cell (see below). Symmetrically at S2 using Tok←.
- Consequently, mixed pairs (exactly one side canonical/colored) have no opposite-direction token locally; colored S on the canonical side attaches to a neutral neighbor; the inactive side is S_⊥; PAD plumbing accepts unconditionally. No seam tableau runs.

C) Seam RUN tableau and local verdict (EDGE and Eq simultaneously)
Corridor layout near S:
- FWD cell immediately right of S1: records FwdColor ∈ {R,G,B} equal to S1; allowed pairings: (S1_x ↔ FWD(FwdColor=x)) only; if Tok→(FWD)=0, neutral pairs to PAD are also allowed; if Tok→=1, only the FWD pairing is allowed (must-color enforced).
- VERD cell immediately left of S2: symbol Ver(FwdColor∈{R,G,B}, EDGE∈{0,1}, Eq∈{0,1}).
RUN tableau enablement:
- RUN-role symbols (row-by-row U-simulation) are permitted on the corridor only when (Tok→=1 and Tok←=1) on those cells; else only PAD is permitted. ERR is globally available but explicitly disallowed adjacent to RUN/VERD when any token bit is 1 (no escape in active modes).
U’s task (constant alphabet): read enc(D) in HEAD; read u from left PORT and v from right PORT; compute EDGE=D(u,v) and Eq=[u=v] in poly(s) steps. The last row writes Ver(FwdColor,EDGE,Eq) into the VERD cell next to S2; FwdColor is copied unaltered from the FWD cell via a constant-width forwarder track (enforced by local equalities).
Local verdict at S2–VERD edge (radius-1 adjacency list):
- For each c∈{R,G,B} and bits e,q∈{0,1}, allowed pairs (S2_col, Ver(FwdColor=c,EDGE=e,Eq=q)) are:
  • If q=1: allow only when S2_col = c (forces equality on u=v). If additionally e=1, this case is unreachable because we ensure D(u,u)=0 in preprocessing (or the seam would be contradictory). If e=0, equality holds; allowed.
  • If q=0 and e=1: allow only when S2_col ≠ c (forces inequality on edges).
  • If q=0 and e=0: allow all 3×3 color combinations.
- Must-color at S2: If Tok←(VERD)=1, forbid S2_⊥; otherwise S2_⊥ is allowed (mixed/inactive pairs).
Correctness (active-active): Acceptance iff (EDGE=0 or colors differ) and (Eq=0 or colors equal). Mixed/inactive: tokens absent locally; neutral plumbing accepts unconditionally.

D) Bridging (F2) is vacuous or reduces to local seam
- For inactive/mixed contexts: S choices are either ⊥ (inactive) or unrestricted on the canonical side with PAD neighbors (mixed); repetitions w_i^z away from S are filled by PAD/⊥ self-loops; Cout–out includes PAD–PAD self-transitions for every interior edge type; thus wz_1 S wz_2 always extends independently of z.
- For active-active canonical pairs: all constraints are confined to the immediate corridor around S (FWD, RUN rows, and VERD), which has constant width; repeating w_i does not create new constraints across S and does not affect U’s computation (it reads PORTs adjacent to S). Hence feasibility for z=1 implies feasibility for all z ≥ 1. Formally, by Lemma 1 in output.md (periodicity), we may check z up to Z, but here local wiring already makes the outcome z-invariant.

E) B=2 concrete instance (DP-auditable)
Symbols to enumerate (suggested names):
- S: S_R, S_G, S_B, S_⊥.
- PORT: P1^0,P1^1,P2^0,P2^1.
- PROBE: Start_1,Head_1,Test_1,Accept_1; Start_2,Head_2,Test_2,Accept_2.
- Boundary outputs: Q_1, Q_2; we treat BL2_1 and BL2_2 as the left second boundary outputs selecting Start_j.
- Gating: GateL, GateR; otherwise PAD.
- Corridor bits: tokens Tok→/Tok← ∈ {0,1} carried in symbol variants (we can realize four variants of PAD and RUN cells to encode the two bits; only those pairs consistent with monotone propagation are listed).
- RUN: a tiny fixed alphabet sufficient to tabulate D on {00,01,10,11} and Eq=[u=v].
- VERD: Ver(c∈{R,G,B}, e∈{0,1}, q∈{0,1}).
Cin–out (B=2): Allow PORT b-outputs matching the input bit b; all other roles accept any input bit (copy-through or don’t-care). Optionally, forbid ROLE=PORT unless the HEAD/PORT header is present (enforced by Cout–out grammar between HEAD and PORT).
Cout–out key fragments (B=2):
- Probes: as in A, instantiate k∈{1,2} and j∈{1,2}. Enumerate (Head_j ↔ Port^P(k,·)) march, (Port^P(k≠j,·) → Head_j), (Port^P(j,1) → Test_j → Accept_j), and no successor on (Port^P(j,0) → ·). No ERR/⊥ adjacent to Start/Head/Test/Accept.
- Gating at S: (GateL ↔ S_color) for color∈{R,G,B,⊥}; (¬GateL ↔ S_⊥) only. Same on the right with GateR.
- Tokens: (GateL ↔ S_color) forces Seed→(Tok→=1) on the next interior cell; otherwise Tok→=0. Enforce Tok→ nondecreasing left→right and Tok← nondecreasing right→left by allowing only corridor pairs (x,y) with y.Tok→ ≥ x.Tok→ and x.Tok← ≥ y.Tok←.
- Must-color at S: If N1.Tok→=1 then forbid (S1=⊥ ↔ N1); also require (S1 ↔ FWD) pairing; symmetrically if N2.Tok←=1 require (S2 ↔ VERD).
- RUN enablement: Only when both token bits are 1 on corridor cells are RUN-row symbols permitted (else PAD). ERR adjacent to RUN or VERD is forbidden in this mode.
- Verdict adjacency: Explicitly list allowed pairs (S2_col ↔ Ver(c,e,q)) following the cases in C.
DP audit checks:
1) Probe: Four left seeds L(00),L(01),L(10),L(11) with contiguous PORT zone next to S. For each u, and boundary outputs Q_1,Q_2 under fixed a⋆, the DP should yield E(u)[Q_1]=u_1 and E(u)[Q_2]=u_2.
2) Seam: Take D as a 4-cycle on {00,01,10,11} and Eq by equality. Build right seeds R(v). For all 16 ordered pairs (L(u),R(v)), the DP should accept iff (u=v ⇒ colors equal) and (D(u,v)=1 ⇒ colors differ). Mixed pairs (canonical on one side only) accept regardless, with S on inactive side = ⊥.

F) Existence of canonical contexts at lengths ℓ_pump or ℓ_pump+1 (specialized padding lemma)
Lemma CN (canonical contexts exist with prescribed side-length parity). For each index u∈{0,1}^B there is at least one left word w_1 of length in {ℓ_pump, ℓ_pump+1} whose suffix adjacent to S is a well-formed canonical block W_L(u) (HEAD · PORT(B) · RUN prefix) and PAD elsewhere; likewise for right contexts.
- Proof sketch (uses output.md Lemmas 11–12, 14–15): Start from a seed word U_L(u) = PAD^z · W_L(u) with z≫1 chosen so that Type(PAD^z) stabilizes and replacing PAD^z by any PAD^{z′} with the same type preserves the type of U_L(u). By Lemma 15 (periodicity), select z′ so that |PAD^{z′} · W_L(u)| hits ℓ_pump or ℓ_pump+1. All pumping/replacement happens in PAD outside the seam, so the HEAD/PORT layout and probe/seam interfaces are unaffected. Symmetric for the right.

G) Why (F1)⇔3-coloring and why (F2) imposes no extra burden
- Completeness: Given χ: {0,1}^B→{R,G,B}, set f(Type(L(u)))=χ(u), f(Type(R(v)))=χ(v), f(others)=⊥. Active-active seam checks EDGE and Eq and enforces inequality on edges and equality on u=v via local verdict; mixed pairs pass via fallback plumbing.
- Soundness: If f passes (F1), then for each u, both τ^L_u and τ^R_u must be non-⊥ (else some active-active diagonal pair would violate must-color); the diagonal (u,u) has Eq=1, so the colors match, defining χ(u). For any edge (u,v), EDGE=1 forces χ(u)≠χ(v). Thus χ is a proper 3-coloring.
- Bridging (F2): As argued in D), repeating w_i adds only PAD away from S; in active-active pairs the corridor logic is local-invariant; mixed/inactive are vacuous. Hence any f that satisfies (F1) also satisfies (F2) in this construction.

H) Risks and resolutions (for DP and audit)
- Probe uniqueness/escape: We explicitly forbid ERR/⊥ adjacent to PROBE states and give each probe state a unique successor; PORT contiguity is enforced by allowing only Addr→Addr+1 across PORT. This makes E(a⋆)[Q_j] a single-bit function of RIDbit[j].
- Seam activation locality: Tokens are read only one hop from S; must-color is triggered iff the opposite-direction token is present; RUN/VERD are permitted only when both tokens are present. Mixed pairs see no opposite token and thus accept.
- Verdict consistency: The Eq gate enforces equal colors only on u=v; to avoid Eq∧EDGE contradictions, set D(u,u)=0 in preprocessing of the succinct graph (standard and WLOG for 3-coloring).
- Alphabet/adjacency budgets: With disjoint-role subalphabets, |Σ_out|=Θ(B) and |Cout–out|=O(B^2)+O(1). Choose β≥c·B^2 to be safe (or β=Θ(B) with careful symbol reuse as in A–C).

Next steps (concrete, auditable)
1) Produce a machine-readable B=2 instance: enumerate Σ_out symbols listed in E), tabulate Cin–out and the Cout–out fragments for probes, gating, token propagation, RUN enablement, must-color, and verdict adjacency. Run the O(kβ^2) DP to validate the probe bits and seam acceptance on all 16 ordered pairs (L(u),R(v)).
2) Generalize the parametric tables (Head_j/Port(k,·), Tok monotonicity, S-adjacent constraints, verdict pairs) for arbitrary B and bundle them into the reduction.
3) Integrate Lemma TS (probes), Lemma RG (gating+tokens), Lemma SG (seam verdict) into the curated output once B=2 validation passes; add Lemma CN (canonical contexts existence) referencing output.md Lemmas 11–12,14–15.
4) Package the reduction D ↦ P_D formally and state the equivalence (3-colorable ⇔ feasible f), concluding NEXPTIME-hardness of the classification (O(1)/Θ(log* n)/Θ(n)) under the explicit β-normalized, r=1 model.

## Round 0005 — 2025-08-28T12:41:54.605499Z

Round 0005 — Parametric radius-1 rule schemas made DP-ready (B=2 instance blueprint) and locality checks consolidated

Context and objective
- We are proving NEXPTIME-hardness of the β-normalized, radius-1 classification on oriented paths by reducing Succinct 3-Coloring to Feasible-Function Existence (F1). The verifier asked for fully local, radius-1 rule schemas that (i) separate 2^B vertex types via per-bit boundary probes, (ii) realize per-side color gating and mixed-pair vacuity, and (iii) implement an active seam with a local verdict enforcing both EDGE=1 ⇒ color-inequality and Eq=1 ⇒ color-equality. We adopt the directional-token activation to keep mixed pairs unconditional and must-color only in active-active pairs. Below I spell out parametric Cout–out rule schemas and instantiate a B=2 DP-auditable skeleton.

Gaps spotted in output.md (minor; no edits)
- None new. The parenthetical “interior inputs may be arbitrary; if the model fixes interior inputs, the definition is with respect to those fixed inputs” is present; we rely on the fixed-interior-inputs interpretation. The finite-Z bound Z ≤ |T|^2 is already recorded (Corollary 4).

Symbols, roles, and disjoint subalphabets (budget discipline)
- We keep disjoint role subalphabets so sizes add, not multiply. Output symbols encode: Role ∈ {S, GATE_L, GATE_R, PORT, PROBE, PAD, RUN, VERD, ERR}, color ∈ {⊥,R,G,B} used only when Role=S, PORT-fields Addr∈{1,…,B}, RIDbit∈{0,1}, probehead ∈ {None, Start_j, Head_j, Test_j, Accept_j}, tokens Tok→,Tok←∈{0,1} present only on RUN/PAD in the bridge, verdict fields (EDGE,Eq,FwdCol) present only when Role=VERD. Cin–out ties RIDbit to Σ_in for Role=PORT and is otherwise permissive.

A. Per-bit boundary probe — parametric Cout–out schema (Type-Separation)
Setup
- Reserve B boundary-output 4-tuples Q_j, j∈[B]. We use only the left pair (positions 1,2) actively; the right pair is a neutral terminator (RB_pad2,RB_pad1). Fix a boundary-input 4-tuple a⋆.
Canonical left block W_L(u)
- Adjacent to S on its right: a contiguous PORT zone of length B with symbols Port(k,b) (Role=PORT, Addr=k, RIDbit=b=u_k). The remainder is PAD/HEAD as filler; RUN is absent unless the seam is active. Addr increases strictly left→right; the PORT zone abuts S.
Allowed Cout–out pairs (all unlisted pairs disallowed)
- Boundary injection and uniqueness:
  • (QL1_j, QL2_j) is allowed for each j; for any i≠j, (QL1_i, QL2_j) is disallowed.
  • (QL2_j, Start_j) is allowed; for any x ≠ Start_j, (QL2_j, x) is disallowed.
- Deterministic march (no error/⊥ escape while probing):
  • (Start_j, Head_j) is allowed; no other successor from Start_j.
  • For any non-PORT role y∈{PAD,HEAD}, (Head_j, Head_j@y) is allowed; pairs (Head_j, ERR_•), (Head_j, ⊥@S), and (Head_j, any non-probehead) are disallowed.
- PORT scan and test at Addr:
  • For k≠j, (Head_j, Head_j@Port(k,b)) is allowed (pass-through over wrong address).
  • For k=j and RIDbit=b:
    – If b=1: (Head_j, Test_j@Port(j,1)) is allowed, then (Test_j@Port(j,1), Accept_j) is allowed.
    – If b=0: no outgoing pair from Head_j into Port(j,0) (dead end).
- Accept exit:
  • (Accept_j, PAD) is allowed; while probehead∈{Start_j,Head_j,Test_j,Accept_j} appears on either endpoint of an edge, no pair with ERR_• nor ⊥ is listed.
- PORT well-formedness (static, local): within the zone, only pairs (Port(k,b), Port(k+1,b′)) are allowed; no skips, no reordering. The left neighbor of Port(1,·) must be S (or the seam’s right S when mirrored).
Claim TS (per-bit separation)
- For any canonical L(u) and the boundary assignment (QL1_j, QL2_j, RB_pad2, RB_pad1), the DP has a legal completion iff u_j=1. Proof: the only possible evolution is the deterministic pipeline above; it reaches Port(j,·) and accepts iff RIDbit=1; no alternative paths or error-plumbing exist during the probe.

B. Per-side gating, directional tokens, and mixed pairs
Per-side gating (local, independent across sides)
- The interior neighbor of S is GATE_L (left side) iff a canonical left block starts there; otherwise PAD/HEAD. Allowed S-adjacent pairs:
  • If neighbor∈{PAD,HEAD}, then only (neighbor, S_⊥) is allowed.
  • If neighbor=GATE_L, then (GATE_L, S_c) is allowed for c∈{R,G,B,⊥}. Symmetrically on the right side with GATE_R.
Directional tokens (purely local activation)
- Seeding:
  • If the cell to the right of S1 is GATE_L and S1∈{R,G,B}, then (S1_c, Tok→=1@RUN) is allowed; otherwise only (S1_token, Tok→=0@PAD/RUN) is allowed.
  • If the cell to the left of S2 is GATE_R and S2∈{R,G,B}, then (Tok←=1@RUN, S2_c) is allowed; otherwise only (Tok←=0@PAD/RUN, S2_token) is allowed.
- Propagation:
  • Along the bridge, only (Tok→=1, Tok→=1) and (Tok→=0, Tok→=0) pairs are listed left→right; similarly (Tok←=1, Tok←=1) and (Tok←=0, Tok←=0) right→left. No pair can spontaneously create a 1 from 0.
Must-color and mixed-pair fallback (enforced locally at S)
- At S1, adjacency to the right neighbor obeys:
  • If neighbor carries Tok→=1: pairs (S1_⊥, neighbor) are disallowed; S1 must be colored and must attach to RUN (or VERD, see below); (S1_c, PAD) is disallowed to prevent neutral fallback in active mode.
  • If neighbor carries Tok→=0: both (S1_⊥, neighbor) and (S1_c, PAD) are allowed (fallback); no activation of RUN.
- Symmetrically at S2 with Tok←.
Consequences
- In mixed pairs (exactly one canonical side), exactly one token is present near S; the colored side is permitted (by GATE_*), the opposite side must be ⊥, and the seam cannot activate (since the opposite-direction token is 0). Neutral PAD-plumbing accepts.
- In active-active pairs, both tokens are 1; locally at S we forbid ⊥ and forbid attaching to neutral neighbors, forcing RUN activation and a verdict neighbor.

C. Seam tableau and verdict adjacency (local enforcement of EDGE and Eq)
Verdict interface (radius-1, small)
- The immediate neighbor to the right of S2 may be VERD(e,q,cFwd) only when both tokens are 1 (RUN active) and after the RUN corridor has stabilized; ERR is disallowed adjacent to RUN/VERD in active mode.
- Allowed S2–VERD pairs implement the conjunction:
  • If e=1 (edge), then Color(S2) ≠ cFwd (forbid equal-color pairs); if e=0, both equal and unequal allowed.
  • If q=1 (same index), then Color(S2) = cFwd (forbid unequal-color pairs); if q=0, both equal and unequal allowed.
- This yields acceptance iff (e=0 or colors differ) and (q=0 or colors equal). We ensure D(u,u)=0 so e∧q never conflicts.
Computation of (EDGE,Eq,FwdCol)
- RUN carries: (i) a one-cell forwarder that copies S1’s color into cFwd (checked by local equality along the corridor), (ii) a fixed-width, row-by-row computation of EDGE=D(u,v) and Eq=[u=v] from the nearby PORT bits, enforced by local row-consistency pairs. In DP-auditable B=2 we tabulate a 4×4 truth table for D and Eq and materialize VERD accordingly.

D. B=2 explicit skeleton (sufficient for DP audit)
Alphabet sketch (names are individual Σ_out symbols; roles are disjoint)
- S: S_R, S_G, S_B, S_⊥.
- Gating: GATE_L, GATE_R.
- PORT: P1^0, P1^1, P2^0, P2^1.
- Probe states: Start_1, Head_1, Test_1, Accept_1, Start_2, Head_2, Test_2, Accept_2.
- Boundary tokens: QL1_1, QL2_1, QL1_2, QL2_2, RB2_pad, RB1_pad.
- Tokens on bridge: Tok00, Tok10, Tok01, Tok11 encoding (Tok→,Tok←)∈{0,1}^2.
- RUN (constant small alphabet) and VERD(e,q,c) for e,q∈{0,1}, c∈{R,G,B}.
Cin–out (radius-0 constraints)
- For PORT symbols: Cin–out allows Pj^b only when Σ_in bit at that node equals b. For all other roles, both input bits are allowed.
Cout–out: key allowed pairs (representative list sufficient for DP harness)
- Probe (j=1): (QL1_1, QL2_1), (QL2_1, Start_1), (Start_1, Head_1), (Head_1, Head_1) over PAD/HEAD, (Head_1, Head_1) over P2^b, (Head_1, Test_1) over P1^1, (Test_1, Accept_1), (Accept_1, PAD). For j=2 swap P1↔P2 in the test pair.
- PORT contiguity: (P1^b, P2^{b′}) allowed; no other PORT–PORT pair.
- Gating: (GATE_L, S_c) for c∈{R,G,B,⊥}; (PAD, S_⊥) and (HEAD, S_⊥) only; similarly on the right with GATE_R.
- Token seeding/propagation (bridge cells immediately inside S): (S_c, Tok10) allowed iff neighbor is right of S1 and S1 is adjacent to GATE_L; otherwise only (S_token, Tok00). Along the bridge, (Tok10, Tok10), (Tok00, Tok00) left→right; symmetrically right→left for Tok←, combining into Tok00, Tok10, Tok01, Tok11.
- Must-color: if neighbor of S has Tok←=1 (i.e., Tok01 or Tok11), pairs (S2_⊥, Tok•) are disallowed; if Tok←=0 (Tok00 or Tok10), both (S2_⊥, Tok•) and (S2_c, PAD) are allowed. Symmetric rule at S1 with Tok→.
- Verdict adjacency (explicit): for each e,q,cFwd and color d∈{R,G,B}, allow (S2_d, VERD(e,q,cFwd)) iff [(e=1 ⇒ d≠cFwd) and (q=1 ⇒ d=cFwd)]. For example, disallow (S2_R, VERD(1,0,R)), allow (S2_G, VERD(1,0,R)); disallow (S2_G, VERD(0,1,R)), allow (S2_R, VERD(0,1,R)). When Tok←=0, VERD never appears (RUN inactive), and neutral PAD neighbors are allowed.
- ERR disabled near PROBE/RUN/VERD: no pairs with ERR on either endpoint adjacent to any of Start_j, Head_j, Test_j, Accept_j, RUN, or VERD.
DP checks to run (auditable)
- TS: For four L(u) with u∈{00,01,10,11}, and the pair (QL1_1,QL2_1) on the left and (RB2_pad,RB1_pad) on the right, verify by O(kβ^2) DP that acceptance equals u_1; similarly QL1_2,QL2_2 yields u_2.
- Seam: Fix a toy D on 4 vertices (e.g., a 4-cycle) and Eq=[u=v]. Ensure RUN places VERD(e,q,·) and S2–VERD adjacency enforces: (i) if D(u,v)=1, only unequal colors pass; (ii) if u=v, only equal colors pass; (iii) mixed pairs accept regardless of the colored canonical side’s choice on S (the opposite side must be ⊥ by gating).

E. Why the rules are local, deterministic where needed, and budget-feasible
- Probe determinism: Reserved boundary pairs Q_j force Start_j uniquely; Head_j has a single successor on every edge; at Addr=j the only way forward depends on RIDbit; ERR/⊥ are not allowed adjacent to probe states. Hence E_{L(u)}(a⋆)[Q_j]=u_j.
- Mixed-pair vacuity and must-color: The opposite-direction token locally indicates whether the seam is active; only when it is 1 do we (i) forbid ⊥ at S and (ii) forbid attaching to neutral PAD; otherwise all fallbacks are allowed.
- Verdict locality: All semantic checks reduce to S2↔VERD adjacency; the forward color is carried explicitly; EDGE and Eq are pinned by the local RUN-to-VERD interface.
- Budget: With disjoint roles, symbols scale as O(B) (PORT and probe states) plus O(1) for others; the Cout–out table uses O(B^2) entries for (Head_j ↔ Port(k,·)) and O(β) elsewhere. Choose β ≥ c·B^2 to leave slack.

F. Obstacles and how addressed
- Token spurious creation: Prevented by listing only (Tok0→Tok0) and (Tok1→Tok1) along the corridor, with seeding tied to GATE_* adjacency; no rule lists 0→1 without a gate.
- Probe escape: All pairs with ERR/⊥ adjacent to probe states are omitted; Start/Head/Test/Accept have unique successors.
- Seam mis-activation: Only the presence of the opposite-direction token adjacent to S forbids ⊥ and neutral neighbors; there is no cross-seam dependence beyond immediate neighbors.
- Length normalization: We still rely on pumping/replacement to realize canonical W_L(u), W_R(v) at lengths ℓ_pump or ℓ_pump+1 with the PORT zone abutting S; we will supply a short, r=1 specialization of Lemmas 11–15 to make this self-contained.

G. Next steps (concrete, auditable)
1) Produce a machine-readable B=2 instance: enumerate Σ_out symbols as listed; provide Cin–out (PORT bit-tying) and Cout–out pairs exactly as above (including the explicit S2–VERD table and probe pairs). Run the O(kβ^2) DP to verify TS and the mixed/active seam behavior on all 16 ordered pairs (L(u), R(v)).
2) Fill in the RUN-to-VERD micro-tableau for B=2: a finite, row-by-row transition system that reads u,v from the two-port zones and writes VERD(e,q,cFwd) adjacent to S2; ensure ERR is disallowed near RUN in active mode.
3) Generalize token and probe tables from B=2 to arbitrary B (the only growth is the set {Start_j,Head_j,Test_j,Accept_j} and the PORT addresses).
4) Write a short r=1 padding lemma: “For each u, there exist left/right contexts of lengths in {ℓ_pump,ℓ_pump+1} with the same near-S structure (HEAD+PORT) and the same type near S,” by pumping PAD and applying Lemma 11 (replacement) to preserve type at the seam.
5) After B=2 validation, promote Lemmas TS (probe separation), RG (gating+tokens), and SG (seam verdict) into the curated output.

H. Minimal claims ready for DP audit (summarized)
- TS: Under the boundary 4-tuples (QL1_j,QL2_j,RB2_pad,RB1_pad), E_{L(u)}(a⋆)[·] equals u_j. Distinct u give distinct left-types; mirrored on the right.
- Mixed pairs accept unconditionally: exactly one token present ⇒ S-side with 0 allows ⊥ and neutral fallback; no RUN/VERD appears.
- Active-active: both tokens present ⇒ must-color; S2↔VERD adjacency enforces simultaneously EDGE and Eq constraints; ERR is disallowed near RUN/VERD.
These are all checkable by the O(kβ^2) DP once the above symbol list and pair tables are instantiated.

