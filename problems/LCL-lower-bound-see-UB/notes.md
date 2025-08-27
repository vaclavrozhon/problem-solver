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