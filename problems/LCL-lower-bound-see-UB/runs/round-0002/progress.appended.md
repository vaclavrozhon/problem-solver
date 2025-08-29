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

