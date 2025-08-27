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

