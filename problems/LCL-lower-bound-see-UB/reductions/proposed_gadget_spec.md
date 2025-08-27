Title: Window-Anchored NEXPTIME-Hardness Gadget for β-Normalized, Radius-1 LCLs on Directed Paths

Tracks in Σ_out (constant many families; total size β = poly(s))
- Role/phase: HEAD, SEPR, RUN(row-phase∈{0,1,2}), RID-bit, GID-bit, PAD.
- Colors: RED, GRN, BLU, ⊥ (only these labels are allowed at the 2-node window S; elsewhere they appear only as part of plumbing/witness tokens).
- Work tape: small fixed alphabet for a universal TM U that runs O(1) steps.
- Error alphabet: constant-sized set E0, E1, ..., implementing locally checkable refutations.

Cin–out
- Copies input bit to a dedicated output subtrack (for normalization) and permits only role-appropriate symbols at each node.

Cout–out
- Grammar for well-formed blocks: HEAD ... RID (B bits) ... GID (B bits) ... RUN rows ... SEPR ...
- RUN verification: local transitions between adjacent nodes encode consistency of U’s row-by-row evolution.
- Witness steps: when S is colored non-⊥, enable a path that moves one step per edge from S into wb (to check Hot_RID is one-hot and read its index i) and into wc (to check V(+)[i]=1 or V(−)[i]=1 depending on S2’s color on the clause side).
- ⊥-plumbing: allow arbitrary tilings of ⊥ across repetitions wz_1 and wz_2 and permit ⊥ to sit next to any color at S.
- Error chains: for every malformed header/tableau seam, offer a short chain that locally proves inconsistency (as in the PSPACE-hardness LBA proof), ensuring malformed contexts never constrain f.

Window anchoring
- A left context wa S wb is active iff wb contains a well-formed variable block (HEAD+RID+RUN witnessing Hot_RID is one-hot). A right context wc S wd is active iff wc contains a well-formed clause block (HEAD+GID+RUN writing V(+), V(−) for that clause).

Semantics for (F1) bridges
- For a pair (left context, right context), the DP that fills wb wc succeeds iff: (i) non-⊥ on the left implies existence of exactly one i with Hot_RID[i]=1 in wb; (ii) non-⊥ on the right implies existence of V(+)[i]=1 for RED or V(−)[i]=1 for GRN in wc for the same i; (iii) BLU never witnesses; (iv) any ⊥ choice trivially permits completion via ⊥-plumbing.

Making (F2) vacuous
- For any repetition wz_1 S wz_2, fill the repeats with ⊥ regardless of z. Cout–out must allow ⊥ next to S and propagate ⊥ freely so that every such partially labeled path is completable.

Size and radius
- All checks are radius-1: each Cout–out entry concerns adjacent nodes only. The total number of distinct output symbols is β=poly(s). Description size |Cin–out|+|Cout–out| = O(β^2) = poly(s).

Notes
- Ensure that for each clause j, the three τVar(i) that appear with that clause actually occur as left contexts that can be paired with the right context τCl(j). This follows from pumping, since wb and wc are of length ℓ_pump or ℓ_pump+1 and can stably host any fixed poly(s)-length block.
