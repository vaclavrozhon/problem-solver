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