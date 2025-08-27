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

