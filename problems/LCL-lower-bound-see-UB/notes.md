Working model and notation (radius 1, β-normalized)
- We study LCLs on globally oriented paths with fixed input alphabet Σ_in and output alphabet Σ_out of size β. The local legality is given by two global relations: Cin–out relating each input symbol to allowed output symbols at a node, and Cout–out relating allowed pairs of consecutive output symbols. The radius is 1.
- A path segment w has four boundary nodes (two on the left, two on the right). For a fixed assignment to the four boundary inputs, we define the extendibility bitvector over all β^4 assignments to the four boundary outputs indicating for which boundary-output assignments there exists a legal extension to the interior.
- The type Type(w) is the collection, over all 4-boundary input assignments, of these extendibility bitvectors. Two words share a type if they have identical extendibility behavior for all boundary input/output assignments. Let T be the finite set of all types realizable by some word.

Verified technical facts (recorded in output.md)
- Type bound: |T| ≤ |Σ_in|^4 · 2^{β^4}. Reason: a type is determined by four boundary input symbols and a Boolean function on the β^4 boundary output assignments.
- Composition lemma: There is a computable binary operation ⊛ on T such that Type(uv) = Type(u) ⊛ Type(v) for all words u, v. Intuition: to decide extendibility of uv under a boundary-output assignment, one needs only (i) the extendibility tables of u and v, and (ii) existentially quantify over the two internal boundary outputs to satisfy Cout–out at the join.
- Periodicity: For any fixed word w, the sequence τ_z := Type(w^z) is ultimately periodic with preperiod and period ≤ |T|. Thus the pair sequence (Type(w1^z), Type(w2^z)) is ultimately periodic with preperiod ≤ 2|T| and period ≤ |T|.
- Finite-Z for (F2): Given any context (w1, S, w2), whether the (F2) check passes for all z ≥ 1 depends only on finitely many pairs (Type(w1^z), Type(w2^z)); it suffices to check z up to Z ≤ |T|^2 (a non-tight but simple bound).
- DP for extension: For a fixed path with some outputs forced (e.g., on S), the existence of a global completion can be decided in O(k β^2) time for a length-k path by a layered dynamic program over output symbols.

Hardness direction we will pursue (pivot suggested by Prover 01)
- Source problem: Succinct 3-Coloring of a graph G on V={0,1}^B, given by a circuit D(u,v) (size s) deciding adjacency; NEXP-complete.
- Target LCL: Construct a β-normalized, r=1 instance P_D with Σ_out size β = poly(s). The plan:
  1) For each u, build at least one context type τ_u whose boundary behavior (detected via a reserved boundary-probe) certifies that the interior encodes the index u in a standard, radius-1-checkable block. The interior also stores a copy of D on an input track and a runzone for a fixed TM U.
  2) In a bridge between τ_u and τ_v, locally simulate U on input (D,u,v) across the seam for poly(s) steps to evaluate D(u,v); malformed simulations are locally refutable.
  3) Gate constraints: if D(u,v)=0 (non-edge) allow completion regardless of colors; if D(u,v)=1 enforce color inequality across S. All other pairings (not recognized as vertex–vertex) are trivial.
  4) Assigning a color to each τ_u by a feasible function f is then exactly a proper 3-coloring of G.
  5) Make (F2) vacuous by allowing repeated sides to be filled with a globally available ⊥-plumbing language.

Open technical items for hardness (to be formalized next)
- Boundary-probe/type-separation lemma: Exhibit a fixed boundary-output probe that, when used, triggers an interior index-check subroutine; show that for distinct indices u ≠ u′, the probe’s extendibility bit differs, hence τ_u ≠ τ_{u′}.
- Seam handshake and computation: Specify the constant-size interface by which the bridge accesses (via pointers) the interior encodings of u and v and runs the 1D tableau for U for poly(s) steps, with radius-1 local checks and robust error refutations.
- Alphabet/size bookkeeping: Keep Σ_out constant tracks (roles, colors, error, U’s work alphabet) constant, with β = poly(s) sufficient for all auxiliary symbols.
- Soundness/completeness proof for the reduction P_D: G is 3-colorable iff a feasible f exists for P_D (with (F2) neutralized).

Caveats and corrections logged
- Short seam codes cannot distinguish exponentially many indices; instead use constant-size pointers/handshakes plus interior blocks that store and validate indices.
- Do not attempt to “program arbitrary boundary truth tables per type” via Cout–out; all rules are global. Use boundary probes plus uniform interior checks to separate types.
- For 3SAT-based reductions, the (F1) universal quantifier clashes with clause-level existential quantification unless one adds complex nondeterministic gating. The succinct 3-coloring pivot avoids this.
Refined hardness plan via Succinct 3-Coloring: type separation and seam simulation (radius 1)

Parameters and normalization
- Given a succinct graph instance D of size s over V={0,1}^B with B=s^{c0}, choose β=s^{c1} with c1≥c0 so β≥B and the output alphabet Σ_out has size β. The LCL instance P_D has radius 1 and is β-normalized (Cin–out global, Cout–out nearest-neighbor global). The DP and type framework from output.md applies with |T|≤|Σ_in|^4·2^{β^4}.

Canonical vertex contexts and activity gating
- We will construct canonical context shapes L(u)=W_L(u) S F_R and R(v)=F_L S W_R(v) for each u,v∈{0,1}^B such that:
  1) W_L(u) (resp. W_R(v)) is a well-formed vertex block anchored O(1) from S; it exposes a port zone of length Θ(B) immediately adjacent to S holding the index bits.
  2) Only these canonical contexts permit color tokens at S (role gating). Any context that is not a canonical vertex context is inactive: any non-⊥ token at S dead-ends locally; ⊥ at S always extends via neutral plumbing.
  3) For each u (resp. v) the type Type(L(u)) (resp. Type(R(v))) depends only on u (resp. v) via a boundary-probe mechanism detailed below. Thus we obtain at least 2^B distinct left-types and 2^B distinct right-types.

Type separation via a family of boundary probes (two workable options)
- Option A (per-bit probes Q_j with address field): Reserve B distinct boundary-output 4-tuples {Q_j : j∈[B]}. In the port zone, include an address track Addr∈[B] and a data track RID∈{0,1}. Local rules enforce that under boundary outputs Q_j the only legal continuation is a deterministic pointer that walks from the boundary to the unique port cell with Addr=j and then accepts iff RID=1 at that cell; otherwise no continuation exists. For all non-reserved boundary outputs we allow generic ⊥-plumbing so they do not affect separation. Fix a boundary-input pattern a⋆. Then for each u we have E_{L(u)}(a⋆)[Q_j]=u_j. Consequently, u≠u′ implies Type(L(u))≠Type(L(u′)). This uses O(B) extra symbols (addresses/pointer states) and remains within β=poly(s).
- Option B (mask/parity probes with M≥B tests): Reserve M boundary-output 4-tuples {b_t : t∈[M]} with M≥B. Store in the input of W_L(u) a table of M masks M_t∈{0,1}^B (with the B×M matrix of full rank over GF(2)) and the RID block u. Under boundary outputs b_t, a deterministic pointer reads M_t and then the RID block and accumulates the inner product ⟨M_t,u⟩ mod 2 using a small “RUN” zone (row-by-row locally checked). Accept iff the parity is 1. Define Sig(u)=(⟨M_t,u⟩)_t∈{0,1}^M; Sig is injective because M≥B and the masks are independent. Fixing a boundary-input a⋆, E_{L(u)}(a⋆)[b_t]=Sig(u)_t, so types differ for distinct u. Again, the probe behavior is radius-1 and β=poly(s) suffices.
- In both options, under reserved probes the control is deterministic (no error-chain escape). Outside reserved probes, error-chains and ⊥-plumbing ensure malformed interiors do not constrain f.

Seam gadget for succinct adjacency and color inequality
- In an (F1) instance on L(u) seam R(v), the bridge wb∘wc hosts a row-by-row simulation of a fixed TM U that evaluates D(u,v) in poly(s) steps:
  1) The port zones adjacent to S on each side expose the B-bit strings u and v. A small handshake track opens a corridor through wb∘wc where U’s tableau is laid out.
  2) Cout–out enforces nearest-neighbor consistency between successive rows; malformed rows are locally refutable (no accepting continuation). The run emits a verdict bit EDGE∈{0,1} at a fixed place near S.
  3) Local acceptance: If EDGE=0 (non-edge), admit completion irrespective of colors at S; if EDGE=1 (edge), admit completion iff the two color tokens at the two S nodes differ. These are radius-1 checks.
- If either side is inactive (not a canonical vertex context), a ⊥-plumbing language allows completion irrespective of the other side and the colors; however, the role gating forbids colors at S for inactive types, so mapping inactive types to a color would violate (F1) on some pair.

Neutralizing (F2)
- Add a global ⊥-filler that, for any context (w_1,S,w_2) and any z≥1, allows filling w_1^z and w_2^z entirely with ⊥ symbols, consistent with any boundary outputs and inputs, without altering the two S positions or the vertex-role gating. Then (F2) holds for every f, reducing the 3-way classification on this family to (F1)-feasibility.

Why this matches our DP/type framework
- Types are defined with respect to fixed inputs; the reserved-probe acceptance depends only on the interior index u and the chosen boundary 4-tuple, so it is type-invariant. The DP in O(kβ^2) can verify both probe behavior and seam runs on small test instances (e.g., B=2), giving a concrete auditable path.

Key cautions to enforce in the local rules
- Reserved probes must have a unique legal continuation (deterministic pointer/run); no error-chain may provide an alternative accepting path.
- Color tokens at S must be gated by the vertex role; inactive contexts cannot place colors, ensuring f is only free on canonical vertex types and ⊥ elsewhere.
- The seam gadget must accept for non-edges regardless of colors and enforce inequality for edges; malformed simulations must not accept.

Minimal sanity check (B=2)
- Use Option A with Q_1,Q_2 and an Addr track {1,2} in the port zone. For u∈{00,01,10,11}, the vector (E_{L(u)}(a⋆)[Q_1], E_{L(u)}(a⋆)[Q_2]) equals u. The seam gadget with a small circuit D (e.g., a 4-cycle) enforces inequality exactly on edges, which can be brute-forced by the DP.
Consolidated plan and corrections for the S3Col → F1 reduction (radius 1, β-normalized)

Parameters and model
- Input: succinct graph on V={0,1}^B specified by circuit D of size s. Choose β=s^{c1} with c1≥c0 so β≥Θ(B) and there is symbol budget for O(B) auxiliary symbols. All constraints are radius 1 via Cin–out and Cout–out.

Canonical vertex blocks and activity
- Left canonical block W_L(u) adjacent to S exposes a port zone of length B with two subtracks: Addr∈{1,…,B} and RID∈{0,1}. Local rules enforce Addr increases by 1 left→right and Cin–out ties RID to Σ_in. The B-bit word u is RID[1..B]. Right canonical block W_R(v) is symmetric.
- Per-side color gating (corrected): S may carry a color token {R,G,B} on a side iff the adjacent interior begins with a well-formed canonical vertex header (per-side handshake). This decision is per-side and does not depend on the opposite side. If the header is absent or malformed, the only allowed S token on that side is ⊥.
- Seam activation: The seam gadget is “active” only when both sides are canonical (both per-side handshakes present). Mixed pairs (only one side canonical) are “semi-active” and must accept unconditionally (see below), so that f may color canonical types without violating F1 on mixed pairs.

Type separation via per-bit probes (Option A)
- Reserve B distinct boundary-output 4-tuples {Q_j}. Under boundary inputs a⋆ and outputs Q_j, Cout–out forces a deterministic probe mode starting at the boundary, carrying a tagged head Head_j that moves along a pre-laid corridor to the unique cell in the port zone with Addr=j. At that cell, continuation exists iff RID=1. While in probe mode, error/⊥ symbols are forbidden from appearing adjacent to probe states; outside reserved probes, standard error/⊥ plumbing is allowed.
- Claim (TS): For any canonical left vertex word L(u), E_{L(u)}(a⋆)[Q_j]=u_j. Hence u≠u′ ⇒ Type(L(u))≠Type(L(u′)). Symmetric on the right. This uses only radius-1 locality and O(B) symbol budget.

Seam tableau and acceptance
- Active seam (both sides canonical): The bridge wb∘wc hosts a row-by-row tableau of a fixed TM U computing EDGE:=D(u,v) and Eq:=[u=v] in poly(s) steps. The last row writes (EDGE,Eq,ForwardedColor(S1)) into the cell immediately to the right of S2. Local rules between S2 and this neighbor enforce simultaneously:
  (A) if EDGE=1 then Color(S2)≠ForwardedColor(S1) (inequality on edges), else vacuous; and
  (B) if Eq=1 then Color(S2)=ForwardedColor(S1) (same-vertex consistency), else vacuous.
  Additionally, a must-color rule is enforced only in this active-active case: both S sides must be non-⊥.
- Semi-active seam (mixed pair): If exactly one side is canonical, the colored side is allowed (by per-side gating), the opposite side must be ⊥, and the seam does not activate; the pair must accept unconditionally (neutral plumbing fills the interior). This prevents mixed pairs from constraining f.
- Inactive seam (neither side canonical): Both sides must be ⊥ and the pair accepts (neutral plumbing).

F2 neutralization
- A global ⊥-filler is available on repetitions w^z, z≥1, independent of boundary outputs and inputs, and does not interfere with per-side gating or the active seam. Thus (F2) becomes trivial.

Existence/length normalization (to be formalized)
- We assume (to be proven or replaced by an explicit construction) that for each u there exists at least one left (resp. right) canonical context of length ℓ∈{ℓ_pump,ℓ_pump+1} with the port zone adjacent to S. Padding occurs outside the port zone, so probes and seam interfaces are unaffected. This step currently rests on pumping/replacement lemmas not yet included in output.md; keep it here as an assumption until proven.

Budget and locality checklist
- Alphabet: O(1) for roles/phases, colors+⊥, error alphabet, tableau alphabet; O(B) for Addr; O(B) for probe heads and reserved boundary outputs. Choose β accordingly. All constraints are radius 1 and refer only to adjacent outputs (S↔S neighbor or S↔interior neighbor).

Audit points to pin down next
- Explicit tables for probe-mode transitions and the prohibition of ERR/⊥ near probe states.
- Exact per-side handshake symbols, and the three seam modes (inactive, semi-active, active) encoded locally.
- The seam’s final cell format and the constant-size forbidden/allowed adjacency list realizing (A) and (B) above.
- A B=2 explicit instance for DP validation.
Synthesis of gadgets and checks for the S3Col → F1 reduction (radius 1, β-normalized)

Canonical vertex blocks and side-local gating
- Left canonical block W_L(u) adjacent to S exposes a contiguous B-cell PORT zone with two subtracks present only when Role=PORT: Addr ∈ {1,…,B} and RIDbit ∈ {0,1}. Cin–out ties RIDbit to the input bit at that node. Addr must increase by +1 left→right. The right canonical block W_R(v) is symmetric. Noncanonical interiors do not use Role=PORT and have only PAD/ERR/HEAD/RUN roles as appropriate.
- Per-side gating: Only when the interior neighbor of S is a canonical gate token (GateL at S1’s right neighbor or GateR at S2’s left neighbor) is S allowed to carry a color {R,G,B}; otherwise S must be ⊥. These permissions are enforced by Cout–out on the S↔(interior) edges and are independent per side.

Per-bit boundary probe (Type-Separation)
- Reserve B boundary-output 4-tuples {Q_j} (one per j). Fix a boundary-input tuple a⋆ ∈ Σ_in^4. Under Q_j, a deterministic “probe mode” is forced from the left boundary through a corridor into the PORT zone:
  • States per j: Start_j, Head_j (or Move_j/Test_j variants), Accept_j. While any of these is present, ERR/⊥ are disallowed in adjacent symbols.
  • Movement rules: Start_j→Head_j; Head_j marches rightward across non-PORT roles and across PORT cells whose Addr ≠ j; at the unique cell with Addr=j, the successor is Test_j; Test_j transitions to Accept_j iff RIDbit=1, otherwise dead-ends; Accept_j deterministically exits to PAD.
  • PORT well-formedness: local rules enforce a contiguous PORT block of length B with Addr=1,…,B adjacent to S. Addr monotonicity and contiguity prevent the probe from skipping or looping.
- Claim TS (informal): For a canonical left block L(u), E_{L(u)}(a⋆)[Q_j] = u_j. This is DP-checkable and relies purely on the above radius-1 pairs and Cin–out.

Seam activation, mixed pairs, and local verdict (adopt directional tokens)
- Directional tokens: Introduce Tok→ and Tok← that live only on the seam corridor cells (RUN/PAD roles). If the left side is canonical, the cell right of S1 seeds Tok→=1 and it propagates deterministically to the right across the bridge; symmetrically, the right side seeds Tok←=1 propagating to the left.
- Must-color and fallback, locally enforced at S:
  • If the opposite-direction token is present adjacent to S (Tok←=1 at S2’s neighbor; Tok→=1 at S1’s neighbor), then S cannot be ⊥ and cannot attach to a neutral neighbor; it must attach to the seam verdict neighbor. This enforces “must-color” only in active-active pairs.
  • If the opposite-direction token is absent, a colored S can attach to neutral neighbors and ⊥ is allowed; this yields unconditional acceptance in mixed pairs (exactly one token present) and inactive pairs (no token present).
- RUN tableau and verdict: When both tokens are present (active-active), we run a fixed-width 1D tableau (role RUN) that reads enc(D) and the port bits u and v and computes two bits: EDGE := D(u,v) and Eq := [u=v]. The cell immediately right of S2 becomes V = VERD(FwdColor, EDGE, Eq), where FwdColor is a copy of S1’s color forwarded along the seam via a local-equality track. ERR/⊥ are disabled adjacent to RUN/VERD in active mode.
- Local acceptance at S2–V: Forbid exactly those pairs that violate (A) EDGE=1 ⇒ Color(S2) ≠ FwdColor and (B) Eq=1 ⇒ Color(S2) = FwdColor. Allow all pairs when EDGE=0 (for (A)) and when Eq=0 (for (B)). The diagonal D(u,u)=0 assumption avoids EDGE=1 ∧ Eq=1 conflicts.

Alphabet and adjacency budgeting
- Disjoint role subalphabets ensure sizes add, not multiply: PORT symbols O(B) (2× per bit for RIDbit), probe states O(B), reserved boundary tokens O(B), colors and ⊥ (4), RUN/VERD/ERR/PAD/HEAD (O(1)). Thus |Σ_out| = Θ(B) with slack; adjacency table contains O(B^2) allowed pairs for probe marching (Head_j ↔ PORT@Addr=k) plus O(β) for other roles. Choose β = s^{c1} with c1 ≥ 2c0 (or 3c0 conservatively) so β = poly(s) and adjacency tables remain polynomial.

Length normalization (status)
- We will assume (to be proved or replaced by an explicit padding) that for each u there exists at least one left/right canonical context of length in {ℓ_pump, ℓ_pump+1} whose PORT abuts S. This is intended to follow from standard replacement/pumping lemmas for radius-1 types, pumping only in PAD so the probe/seam interfaces are unaffected.

B=2 DP-auditable instance (to build next)
- Symbols: colors {R,G,B,⊥}; PORT cells {P1^0,P1^1,P2^0,P2^1}; probe states {Start_1,Head_1,Test_1,Accept_1, Start_2,Head_2,Test_2,Accept_2}; boundary tokens for Q_1,Q_2; GATE_L/GATE_R; tokens Tok→/Tok← ∈ {0,1}; RUN alphabet (constant); VERD(c∈{R,G,B}, EDGE∈{0,1}, Eq∈{0,1}).
- Checks to run by O(kβ^2) DP: (i) For L(00), L(01), L(10), L(11), verify E(a⋆)[Q_1,Q_2] equals u. (ii) For a toy D (4-cycle), and all 16 ordered pairs (L(u),R(v)), verify: active-active acceptance iff inequality on edges and equality when u=v; mixed pairs accept unconditionally (colored canonical side; ⊥ on the other).

Audit checklist for table instantiation
- Probes: enumerate allowed pairs for Start_j, Head_j, Test_j, Accept_j; no ERR/⊥ adjacent; PORT contiguity and Addr monotonicity; forbid all other successors.
- Tokens: deterministic propagation; at S, forbid ⊥ and neutral neighbors only when the opposite token is present; allow fallback otherwise.
- Verdict: S2–V adjacency list realizing (A) and (B); ERR disabled near RUN/VERD.
- Cin–out: tie RIDbit to inputs for PORT cells; limit other Cin–out entries to the roles used at those nodes.
Directional-token seam activation: corrected local rules and B=2 checklist (radius 1)

Correct token seeding and propagation (two-cell corridor)
- Corridor cells: CL (immediately right of S1) and CR (immediately left of S2). Each carries two token bits (t→, t←) ∈ {0,1}^2.
- Seeding at S:
  • At S1–CL: If the interior neighbor is GateL and S1 ∈ {R,G,B}, force CL.t→=1 and CL.t←=0; otherwise force CL=(0,0).
  • At S2–CR: If the interior neighbor is GateR and S2 ∈ {R,G,B}, force CR.t←=1 and CR.t→=0; otherwise force CR=(0,0).
- Asymmetric propagation across the corridor (left→right edge CL→CR): allowed iff CR.t→ ≥ CL.t→ and CR.t← ≤ CL.t←. Equivalently: Tok→ is nondecreasing left→right; Tok← is nondecreasing right→left. No 0→1 increase is possible except from its own seeding side. Outside the corridor, no symbol with a 1‑bit token is permitted.
- Consequences:
  • Mixed pairs (exactly one canonical/colored side): CL or CR may be (1,0) on the canonical side; the opposite cell remains (0,0). No Corr_11 appears; RUN/VERD remain absent.
  • Active–active (both sides canonical/colored): CL seeds (1,0), CR seeds (0,1); propagation yields CR=(1,1) and CL=(1,1) as needed; RUN is enabled and VERD must appear at CR.

Must‑color and fallback (local at S)
- The must‑color trigger uses the opposite‑direction token bit only:
  • At S1: if CL.t← = 1, forbid S1=⊥ and forbid attaching to neutral PAD; require the designated FWD neighbor (color forwarder). If CL.t← = 0, allow S1=⊥ and permit neutral PAD.
  • At S2: if CR.t→ = 1, forbid S2=⊥ and neutral PAD; require VERD at CR. If CR.t→ = 0, allow S2=⊥ and neutral PAD.
- This guarantees: mixed pairs accept unconditionally (colored on the canonical side; ⊥ on the noncanonical side). Active–active pairs must color and run the verdict.

Per‑bit probe (TS) recap and requirements
- Reserve B boundary 4‑tuples {Q_j}. Under Q_j and fixed boundary inputs a⋆, a deterministic pipeline Start_j→Head_j marches to the unique PORT cell with Addr=j and accepts iff RIDbit=1. While PROBE states are present: no ERR/⊥ adjacency and unique successors only. PORT contiguity enforces a contiguous block Addr=1,…,B abutting S.
- DP‑checkable claim: For canonical L(u), E_{L(u)}(a⋆)[Q_j] = u_j. Mirrored on the right.

S2↔VERD acceptance table (local, exhaustive)
- VERD encodes (cFwd ∈ {R,G,B}, e=EDGE∈{0,1}, q=Eq∈{0,1}). Allowed pairs (S2_color, VERD(cFwd,e,q)) are exactly those satisfying:
  • If e=1 then S2_color ≠ cFwd; if e=0, no restriction.
  • If q=1 then S2_color = cFwd; if q=0, no restriction.
- Thus: (e,q)=(0,0): all 3×3 pairs; (1,0): all unequal pairs; (0,1): only equal pairs; (1,1): none (should be unreachable since we enforce D(u,u)=0).

B=2 DP‑audit checklist (explicit)
1) Symbols:
  • S: S_⊥, S_R, S_G, S_B. Gate: GateL, GateR. PAD/ERR. PORT: P1^0,P1^1,P2^0,P2^1 (and probe‑active variants if used). PROBE: Start_j, Head_j, Test_j, Accept_j for j=1,2. Corridor tokens: Corr_ab for a,b∈{0,1} encoding (t→,t←). VERD(c∈{R,G,B}, e∈{0,1}, q∈{0,1}). Boundary outputs for Q_1,Q_2.
  • Cin–out: tie RIDbit to input bit for PORT; other roles accept both inputs.
2) Probes: enumerate Cout–out pairs for Start/Head/Test/Accept and forbid any ERR/⊥ adjacent to PROBE; list PORT contiguity (P1→P2 on the left; mirror on the right) and disallow any PROBE entry except from Q_j.
3) Gating: allow S_color only when adjacent neighbor is GateL/GateR; otherwise only S_⊥.
4) Tokens: seeding at S as above; corridor edge CL→CR obeys CR.t→ ≥ CL.t→ and CR.t← ≤ CL.t←; outside corridor, only Corr_00 is allowed.
5) Must‑color: if the opposite‑token bit at the S‑adjacent corridor cell = 1, forbid S=⊥ and forbid neutral PAD; otherwise allow both.
6) VERD/equations: enumerate the S2↔VERD acceptance table; wire (u,v)↦(e,q) by listing only those local pairs that allow the proper VERD to appear (expand VERD/Corr variants to encode the 16 cases, or constrain the corridor placement to “see” the two PORT bits via radius‑1 neighborhoods).
7) ERR discipline: omit ERR adjacency near PROBE/RUN/VERD in active modes; permit ERR away from special modes.
8) Tests to run by DP: 
  • TS: For u∈{00,01,10,11}, verify E_{L(u)}(a⋆)[Q_1]=u_1 and E_{L(u)}(a⋆)[Q_2]=u_2.
  • Seam: For all 16 (u,v) with D a 4‑cycle and Eq=[u=v], verify active–active acceptance iff [(edge⇒colors differ) ∧ (u=v⇒colors equal)]. Verify that mixed pairs accept unconditionally (canonical side colored; opposite side ⊥).

Clarifications to remember
- Types are defined w.r.t. fixed interior inputs; Cin–out ties PORT.RIDbit to those inputs. 
- Context set C (used in upper bounds and in our bookkeeping) can be taken as the set of types realized by w_1 S w_2 with |w_i| ∈ {ℓ_pump, ℓ_pump+1}; hence |C| ≤ ℓ_pump. We have not yet added a padding lemma to output.md; keep padding arguments here until a self‑contained lemma is written.
