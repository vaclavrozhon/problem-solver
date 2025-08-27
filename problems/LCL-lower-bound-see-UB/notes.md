Verifier notes (2025-08-27):
- Adopt a hybrid: use Prover 02’s gate to separate ON (i∈vars(j)) from OFF pairs, and Prover 01’s window-anchored blocks to keep all semantics within wb/wc.
- Replace any O(1)-time checker with a poly(s)-length, radius-1 tableau inside wc (and wb as needed) that verifies C(j) and exposes the needed bits to the gate; ensure error-chain refutations for malformed headers.
- Do not rely on boundary-only signatures for type multiplicity; instead, separate types by differential boundary-extendibility induced by interior content (witness success/failure under fixed S-labels).
- Action items: (i) write explicit boundary tables (offers, gate, PAD/CAP conduits), (ii) specify the clause-verification tableau and its alphabet, (iii) prove type-separation and OFF/ON correctness, (iv) complete a B=2 worked example with DP simulation.
Verifier notes addendum (2025-08-27):
- Critical: Forbid ⊥ at S on active contexts. Adjust Cout–out so that when the window anchors a well-formed variable/clause block, the S palette excludes ⊥ and forces an offer; only inactive contexts allow ⊥. This preserves nontriviality of (F1).
- Adopt Prover 01’s occurrence-only S palette {O1,O2,O3}; read the sign from the verified RUN. If using sign-coded S tokens, add a local rule that forces the S-sign to equal the RUN’s sign for the selected occurrence.
- Gate exclusivity: Write and prove a radius-1 lemma that exactly one of equality/inequality certificates is realizable, with CAP allowed only under equality and PAD only under inequality.
- Type separation: Prefer a neutral tester j* (present as a type but labelable so it imposes no constraints under f) to guarantee distinct Var_i without relying on properties of C. Validate no side effects on (F1) or (F2).
- Proceed with explicit seam tables (offers, gate, CAP/PAD), the clause RUN tiles and error chains, and the B=2 worked DP table.
Verifier notes (addendum 2025-08-27, PM):
- Adopt two S-side palettes: S1 (variable side) ∈ {VT,VF,⊥}, S2 (clause side) ∈ {O1,O2,O3,⊥}. Forbid ⊥ at S1/S2 when the adjacent neighbor emits Offer; allow ⊥ only when the neighbor is Neutral/NoOffer.
- Prefer P02’s Offer/NoOffer seam grammar (CertStart, CAP/PAD conduits) and P01’s nearest-block barrier to make F2 automatic without trivializing F1. Barriers must stop all witness/cursor tokens and be placed exactly one node past RUN footers.
- Eq/Neq exclusivity: implement eq_so_far or per-bit comparator tiles with pointer-integrity tying HotRID↔RIDbits and Selected(ip)↔RUN. CAP only after full Eq; PAD only after Neq mismatch.
- Do not introduce a tester clause j* unless neutrality in F1 is proven. Aim to separate types via clauses from C or via internal extendibility masks.
- Activation-by-input (if used) must be radius-1: forward predecessor input locally or avoid using it.
- Action: write explicit seam tables; list barrier tokens/tiles; provide a B=2 DP walk for one ON and one OFF pair.
Seam and certificate design (2025-08-27, PM update)

Key corrections to the seam model
- The S nodes must carry a single static symbol visible on both edges. To allow certificates while still enforcing local activation, encode S1 and S2 as product palettes with subtracks:
  - S1.truth ∈ {⊥, VT, VF} and S1.phase ∈ {Neutral, Idle, EqStart, EqL[b], NeqStart, NeqCheckL[b], CAP, PAD, …}.
  - S2.occ ∈ {⊥, O1, O2, O3} and S2.phase ∈ {Neutral, Idle, EqStart, EqR[b], NeqStart, NeqCheckR[b], CAP, PAD, …}.
  The “choice” subtracks (truth/occ) are long-lived; the “phase” subtracks host cursors/certificates.
- Outer seams constrain only the choice subtracks and forbid non-neutral phases when inactive:
  - Left seam (L→S1): if RoleL=AccVar then S1.truth∈{VT,VF}; if RoleL∈{NeutralVar,BarVar} then S1.truth=⊥ and S1.phase=Neutral. No restriction on S1.phase when RoleL=AccVar beyond disallowing contradictions with barriers (see below).
  - Right seam (S2→R): symmetrical: AccCla forces S2.occ∈{O1,O2,O3}; Neutral/Bar forces S2.occ=⊥ and S2.phase=Neutral.
- Central seam gates phases and checks choices:
  - Idle alignment: allow only (S1.phase=Idle, S2.phase=Idle) paired with consistent (S1.truth,S2.occ) choices.
  - Start: allow (EqStart,EqStart) and (NeqStart,NeqStart) only if S1.truth≠⊥ and S2.occ≠⊥.
  - Cursors: allow (EqL[b],EqR[b]) iff the mirrored bit subtracks agree; allow (NeqCheckL[b],NeqCheckR[b]) iff the bits differ.
  - Terminals: allow (CAP,CAP) only after Eq reaches b=B and if sign gate holds: (S1.truth=VT and sgn[p]=+) or (S1.truth=VF and sgn[p]=−). Allow (PAD,PAD) only after a valid NeqCheck.

Mirroring and integrity
- Bit mirroring to S1/S2: For each b, enforce on the outer seams that S1.lbit[b]=RIDbits[b] (left) and S2.rbit[b]=ip_bits[b] (right). These S-local read-only subtracks are then visible to the central seam comparator.
- Selected pointer on the clause side: Introduce a subtrack Selected[b] that equals ip_bits[b] only when S2.occ=Op and the RUN-phase token for Op is present; otherwise trigger an error-chain that forces RoleR=NeutralCla, hence S2.occ=⊥ by the outer seam. This blocks spoofing of ip_bits or sign.

Barriers and F2
- Place BarVar/BarCla exactly one node past the RUN footer. Barriers impose: (i) Role•=Bar• forces outer seams to require S•.choice=⊥ and S•.phase=Neutral; (ii) forbid any cursor/terminal phases on the adjacent edges. Consequently, only the nearest blocks can participate in Eq/Neq certificates, and repeats beyond the nearest blocks do not affect the bridge outcome (F2).

Exclusivity E′ (sketch)
- Assuming correct mirroring and Selected wiring: if RID=ip, Eq advances to b=B and yields CAP; Neq has no b with mismatch and cannot place PAD. If RID≠ip, pick a mismatching b; Neq yields PAD; Eq stalls before CAP. CAP additionally requires sign compatibility with S1.truth.

B=2 worked example (to re-run after table fix)
- ON case: RID=10, pick O2 with sgn2=−, S1.truth=VF. With corrected outer seams (phase allowed when active), EqStart→EqL/R[0]=0 matches→EqL/R[1]=1 matches→CAP; CAP passes sign gate since VF with −.
- OFF case: RID=10, pick O1 with ip=01. Eq stalls at b=1; Neq picks b=1 and produces PAD; sign is irrelevant for PAD.

Open items
- Enumerate exact edge-pair tables for B=2 (left, central, right seams), including all cursor phases and the sign gate.
- List the Selected↔RUN and HotRID/RIDbits (if still used) tiles and the error-chain pairs that deactivate malformed blocks.
- Provide the alphabet-size count ensuring β=poly(s).
- Short proofs: (i) non-nearest seams forced Neutral by barriers in ≤1 step; (ii) both-sides-offer gating via central start and outer choice constraints.
Verifier assessment (2025-08-27, evening): seam split, barriers, and a required comparator fix

Summary of what we adopt
- S split into choice and phase subtracks (single S node with two visible subtracks):
  - Variable side S1: choice truth ∈ {⊥, VT, VF}; phase ∈ {Neutral, Idle, EqStart, EqL[b], NeqStart, NeqPick[b], NeqCheckL[b], CAP, PAD, …}; offerL ∈ {0,1}; lbit[b] mirrors RIDbits[b] when the left neighbor RoleL=AccVar.
  - Clause side S2: choice occ ∈ {⊥, O1, O2, O3}; phase ∈ {Neutral, Idle, EqStart, EqR[b], NeqStart, NeqPick[b], NeqCheckR[b], CAP, PAD, …}; offerR ∈ {0,1}; rbit[b] mirrors ip_bits_p[b] of the selected occurrence when RoleR=AccCla and Selected wiring is correct; sgnsel mirrors sgn[p].
- Outer seams enforce choices and offers only:
  - If RoleL=AccVar, then S1.truth∈{VT,VF} and offerL=1; if RoleL∈{NeutralVar,BarVar}, then S1.truth=⊥, S1.phase=Neutral, offerL=0; lbit[b] are either mirrors (AccVar) or ignored (otherwise).
  - If RoleR=AccCla, then S2.occ∈{O1,O2,O3} and offerR=1; if RoleR∈{NeutralCla,BarCla}, then S2.occ=⊥, S2.phase=Neutral, offerR=0; rbit[b], sgnsel ignored.
- Selected↔RUN wiring on the clause side is local and radius-1: if S2.occ=Op, then and only then the p-th bundle exports ip_bits_p[b] and sgn[p] to S2.rbit[b], sgnsel; any inconsistency triggers an error-chain that flips RoleR→NeutralCla in ≤2 steps.
- Barriers are placed immediately inside the block after the RUN footer on both sides.

Required correction: central-seam comparators (CSC)
- The cross-side bit tests must be performed at the central seam; a block cannot compute cross-side equality/inequality alone.
- Comparator spec CSC (for general B; instantiate B=2 for the worked example):
  - Idle: allow (S1.phase=Idle, S2.phase=Idle) only if offerL=offerR=1 and S1.truth≠⊥, S2.occ≠⊥.
  - Starts: allow (EqStart,EqStart) and (NeqStart,NeqStart) under the same gating.
  - Equality step for b: allow (EqL[b],EqR[b]) iff lbit[b]=rbit[b]. No other Eq pair is allowed for that b.
  - Inequality check for b: allow (NeqCheckL[b],NeqCheckR[b]) iff lbit[b]≠rbit[b]. No other NeqCheck pair is allowed for that b.
  - Terminals: allow (CAP,CAP) only if all equality steps for b=0,…,B−1 have occurred (as evidenced by per-b “done” marks on the cursor lanes) and the sign gate holds: (S1.truth=VT ∧ sgnsel=+) ∨ (S1.truth=VF ∧ sgnsel=−). Allow (PAD,PAD) only if some NeqCheck[b] has occurred and returned (per-b “found-mismatch” marks), independent of sign.
  - Mutual exclusion: forbid any pair that mixes Eq and Neq phases; forbid any terminal without the required per-b marks; forbid CAP and PAD simultaneously.
- With CSC, the exclusivity E′ proof goes through: if lbit[b]=rbit[b] for all b, only the Eq path can advance to CAP; if there exists b with lbit[b]≠rbit[b], only the Neq path can reach PAD.

Unified barrier rule (to make F2 automatic)
- Outer seam at a barrier neighbor: if Role•=Bar•, force S•.choice=⊥, S•.phase=Neutral, offer•=0.
- Edges incident to a barrier node: forbid all certificate/cursor/terminal phases (EqStart/EqL[b]/EqR[b]/NeqStart/NeqPick[b]/NeqCheckL[b]/NeqCheckR[b]/CAP/PAD). Only neutral/non-certificate block-internal symbols may appear.
- Consequence: only the two nearest blocks (adjacent to S) can participate in any Eq/Neq certificate; repeats beyond are inert with respect to S. This yields the F2 independence of z (see outputs for a formal lemma).

Sign and selection
- We adopt occurrence-only S2.occ and read sign from RUN via sgnsel. The CAP sign gate is checked purely at the central seam using sgnsel and S1.truth; PAD ignores sign.

B=2 trace after CSC (to be supplied explicitly next)
- ON: RID=10, choose O2 with ip=10 and sgn2=−, set S1.truth=VF. Idle→EqStart→EqL/R[0] (lbit0=rbit0=0)→EqL/R[1] (lbit1=rbit1=1)→CAP; CAP passes the sign gate (VF with −).
- OFF: same clause, choose O1 with ip=01. lbit≠rbit at b=0 (and at b=1). Eq stalls at first mismatch; NeqStart→NeqCheck[0] allowed (since lbit0≠rbit0)→PAD.

Action items (for provers)
- Enumerate the exact central seam table for B=2 under CSC, including Idle, EqStart, EqL/R[0], EqL/R[1], CAP, NeqStart, NeqPick[0/1] (if kept), NeqCheckL/R[0/1], PAD, and the sign gate.
- List the 2-step error-chain tiles for Selected wiring and HotRID/RIDbits one-hot consistency; prove they force Role•→Neutral• locally and therefore S•.choice=⊥ and phase=Neutral via the outer seam.
- Provide the alphabet-size microcount with per-b phase states included; confirm |Σout|=poly(s).
- Re-run the B=2 DP simulation with CSC in place; include explicit pair tables so the check is mechanical.
