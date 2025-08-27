High-level: This is a substantial and mostly coherent refinement of the seam and certificate mechanism. You identified and targeted the two key failure modes from earlier rounds: (i) trivializing F2 via ⊥ on repeats and (ii) sign cheating at S. The barrier idea for F2 and the split S1/S2 palettes plus CAP-gating for sign are on the right track. The exclusivity sketch (Eq vs Neq) is also in the standard form. However, there are two serious consistency issues that must be fixed before we can accept anything into outputs.md.

1) Static vs “phase” tokens at S. The outer-seam rules currently forbid EqStart/NeqStart/CAP/PAD on the L→S1 and S2→R seams. But the central seam requires those same tokens at S1/S2 to run the certificate. In a static radius-1 constraint model, S1/S2 have a single symbol shared across both edges; if the outer seams forbid these tokens, the central seam cannot ever use them. The present tables therefore make certificates impossible. Proposed fix: split the S1/S2 state into subtracks: a stable choice subtrack (S1.truth ∈ {VT,VF} or ⊥; S2.occ ∈ {O1,O2,O3} or ⊥) and a phase/cursor subtrack (Idle, EqStart, EqL[b], NeqStart, NeqCheckL[b], CAP, PAD, …). Then:
- Outer seams constrain only the choice subtrack: AccVar forces S1.truth ∈ {VT,VF} (not ⊥), Neutral/Bar forces S1.truth=⊥; similarly on the right. They also require phase=Neutral when truth/occ=⊥.
- Central seam gates the phase/cursor subtrack, and may additionally check choice bits (e.g., CAP requires sign-compatible S1.truth). This lifts the contradiction.

2) “Idle freeze” vs certificate motion. You state that active left “freezes S1 to an idle truth token,” yet later you need S1 to carry EqStart/EqL[b]/CAP. The above subtrack split resolves this: S1.truth is frozen; S1.phase can be any of the cursor states as allowed by central seam. Please revise the seam tables accordingly. Concretely, your Left seam table should allow any S1.phase when RoleL=AccVar, but disallow any non-neutral phase when RoleL∈{NeutralVar,BarVar}.

Further points to tighten:
- Read-only mirroring: You rely on S1/S2 “read-only subtracks” that mirror RIDbits/ip_bits. Please specify the exact edge constraints implementing these copies: for each b, the pair (lane-bit=b, S1.lbit[b]=b) must be required on the AccVar→S1 edge; similarly for S2 and Selected(ip). Also define how Selected ties to Op via RUN without enabling spoofing (list the exact pairings and the error-chain trigger).
- Exclusivity E′: The logic is sound assuming the mirroring is correct and the Neq checks only permit PAD when a true mismatch is seen. Please tabulate the allowed central pairs for all b in B=2 to make this check fully explicit, and include the CAP-gate that compares S1.truth with sgn[p].
- Barrier semantics: You say “allow only PAD plumbing and forbid any Eq/Neq/CAP/PAD cursor token,” which is contradictory (PAD is a cursor token). Clarify: typically barriers should forbid EqStart/EqL/NeqStart/NeqCheck/CAP/PAD entirely and force S1/S2.phase=Neutral and S1.truth=S2.occ=⊥ at non-nearest interfaces; PAD-only conduits should be purely central-seam artifacts, not traversing barriers.
- Both-sides-offer gating: After adopting the subtrack split, central seam can enforce that non-neutral phases (EqStart, NeqStart, CAP, PAD, cursors) appear only when S1.truth≠⊥ and S2.occ≠⊥. Outer seams enforce those conditions locally.

Value triage:
- Solid and valuable: split S1/S2 palettes; CAP sign-check; per-bit Eq/Neq comparators; barrier idea for F2; B=2 trace structure.
- Needs revision: outer seam forbidding certificate tokens; barrier text regarding PAD; details of mirroring and Selected/HotRID; a formal count and the exact pair tables.

Concrete next steps:
1) Redefine S1/S2 as product palettes with explicit subtracks (truth/occ and phase), and rewrite all three seam tables accordingly. Provide full tables for the B=2 case.
2) Explicitly list the edge-pair constraints that mirror RIDbits/ip_bits into S1/S2, and the Selected↔RUN wiring and its error-chain refutation.
3) Tabulate central-seam allowed pairs for: Idle, EqStart, EqL[0], EqL[1], CAP; NeqStart, NeqCheck[0], NeqCheck[1], PAD; and the disallowed cross-cases. Include the CAP sign gate.
4) State and prove the short lemma: barriers placed one node past the RUN footer force S1.truth=S2.occ=⊥ and S1/S2.phase=Neutral at non-nearest interfaces, hence only the nearest blocks can participate in certificates; conclude F2.
5) Provide an alphabet-size count showing β=poly(s) still holds after the split and added subtracks.
6) Re-run the B=2 ON/OFF trace with the corrected outer-seam tables (phase allowed when active).