## Round 0002 — 2025-08-27T11:23:07.543718Z

Mini-plan
- Recast feasible-function existence (F1) as an implicit exponential-sized SAT instance over type-choices, then map Succinct-3SAT to it. Make the quantifier structure transparent.
- Fix the bridge semantics: clause-side chooses one of its 3 occurrences (not a sign), variable-side chooses its truth; the gate is ON only for the matching occurrence/variable-index pair; ON enforces truth=sign(occ). OFF pairs are trivially fillable. This aligns “for all ordered pairs” with “∃ a satisfied literal.”
- State a clean SAT-of-types lemma and the gating-correctness lemma with how-it-can-fail and quick tests (B=2 toy). Tie to radius-1 and β-normalized implementation.
- Prove existence and separability of exponentially many active context types (2^B variable-types and 2^B clause-types) using pumping and window anchoring; include a crisp type-separation witness.
- Specify the poly(s)-length, radius-1 clause-verification tableau that exposes (i1, i2, i3) and their signs next to S; add error-chain refuters. Conclude soundness/completeness for (F1) and show how to trivialize (F2) for classification hardness.

1) SAT-of-types view of (F1)
Claim G (Implicit SAT for feasible-function existence). For a fixed β-normalized, r=1 LCL P and its context-type set C (types of w1 S w2 with |w1|,|w2|∈{ℓpump,ℓpump+1}), there is an implicit exponentially large SAT instance F(P) over variables encoding f(τ) (the 2-node label at S for each τ∈C), and for each ordered pair (τL,τR) a local constraint R(τL,τR,f(τL),f(τR)) that holds iff the DP on the bridge wa S1 wb wc S2 wd (with types τL,τR) succeeds. Then there exists a feasible f satisfying (F1) iff F(P) is satisfiable.
- Why useful here: Reducing Succinct-3SAT to F(P) (or vice versa) yields NEXPTIME-hardness via an implicit exponential SAT. It also clarifies that our bridge-gadget just defines a pairwise constraint language on type-colors decidable by the O(kβ^2) DP.
- How it can fail: If C depended on f (circularity), or if the pairwise DP check were not radius-1 decidable, we could not encode constraints locally. Here, C is defined purely by input types (Section 4 types) and the DP is radius-1.
- Quick test: Pick a small Σout (β=5), enumerate 2–3 contexts with actual strings, run the DP to tabulate which f-choices on S1,S2 are extendible. The truth table matches a Boolean constraint R for those (τL,τR).

2) Correct bridge semantics: clause chooses occurrence, variable chooses truth
Patch H (Occurrence-selected gate). Modify the S-alphabet and gate:
- Variable-side S palette: VT (true) or VF (false). Interpreted as α(x_i)=1 iff VT.
- Clause-side S palette: O1,O2,O3 (select occurrence t∈{1,2,3} of clause j). No sign is chosen at S; signs are read from the clause RUN for that occurrence.
- Gate ON condition (purely local): the left wb contains a well-formed variable block with RID=i; the right wc contains a well-formed clause block with the triple (i1,sgn1),(i2,sgn2),(i3,sgn3). If clause S-color=Ot and RID=i equals it, gate=ON; otherwise OFF. Window anchoring places all needed bits inside wb or wc.
- ON-bridge semantics: enforce that VT iff sgnt=+ and VF iff sgnt=−, via a one-bit CAP conduit from S1 to S2 (compare variable truth with required sign of the selected occurrence t). OFF-bridge semantics: wb◦wc is PAD-plumbable regardless of S colors.
- Why useful here: Fixes the earlier quantification mismatch: for a clause j, only the pair with the variable-type matching the chosen occurrence turns ON; the other two pairs turn OFF and are trivial, so (F1)’s universal quantifier no longer overconstrains clauses.
- How it can fail: (i) If the DP can deviate and turn ON without RID=it equality (no: ON is determined at the immediate seam by tokens and checked locally); (ii) If OFF were rejected due to seam interactions (we ensure PAD-plumbing accepts all OFF seams); (iii) If we needed to encode it (the occurrence index) at S (we do not: S carries only Ot; equality to RID is tested by a witness path inside wb and wc).
- Quick test: Clause j with occurrences (i1=3,+), (i2=7,−), (i3=10,+). If f(τCl(j))=O2, only pairs with τVar(7) are ON; their success requires VF at S1. Pairs with τVar(3) and τVar(10) are OFF and always fill. Thus f(τCl(j))=O2 works iff α(x7)=0.

3) Equivalence to Succinct-3SAT via implicit SAT
Claim I (SAT-of-types ≡ Succinct-3SAT under Patch H). Let C be a succinct generator of a 3-CNF ΦC over variables x1,…,x_{2^B}. Build PC so that active context types include all τVar(i) (all i∈{0,1}^B) and all τCl(j) (all j∈{0,1}^B). Under Patch H, (F1) holds for some f iff ΦC is satisfiable.
- Informal proof sketch: Introduce Boolean variables A_i (truth of x_i) corresponding to f(τVar(i))∈{VT,VF}, and 3-way selector T_j∈{1,2,3} corresponding to f(τCl(j))∈{O1,O2,O3}. The bridge constraints across all ordered pairs conjoin, for each j, the single ON-pair constraint: if T_j=t then A_{i_t} must equal sgn_t. OFF pairs are tautologies. This is exactly the clause-satisfaction condition “∃t with A_{i_t}=sgn_t.” Hence f exists iff there is {A_i},{T_j} satisfying ∧_j ∨_{t=1}^3 (A_{i_t}=sgn_t), i.e., ΦC is satisfiable.
- How it can fail: If some τCl(j) could choose an O_t that is not one of its occurrences (e.g., unverified (i_t,sgn_t)), the constraint could be cheated. We prevent this by the clause-run tableau and local checker exposing (i_t,sgn_t) and rejecting any Ot whose occurrence record is malformed.
- Quick test: B=2 example with 4 variables. Let clause j encode (x1 ∨ ¬x2 ∨ x3). If α(x1)=0, α(x2)=1, α(x3)=0, the only working choice is T_j=2 (select occurrence 2: ¬x2). The only ON-pair is with τVar(2) and requires VF at left; holds. Other pairs OFF.

4) Active type coverage and type separation
Claim J (Coverage and separation of active types). With β=poly(s), choose B=s^c0 and ℓpump=2^{Θ(β^4)}. Using window-anchored blocks, for each i and each j there exist context types τVar(i) (left context whose wb contains a valid variable block with RID=i) and τCl(j) (right context whose wc contains a valid clause block with GID=j and tableau exposing its 3 occurrences). Moreover, τVar(i)≠τVar(i′) for i≠i′, and τCl(j)≠τCl(j′) for j≠j′.
- Why useful here: We need 2^B many distinct variable-types and 2^B many distinct clause-types so that {A_i} and {T_j} are well-defined choices over C.
- How it can fail: (i) If the header+indices+RUN footprint exceeded the window length, activation wouldn’t be local (fix: windows are size ℓpump with ℓpump≫poly(s)); (ii) If types collapsed despite different RIDs/GIDs (fix: separation by boundary-extendibility: pick a partner type so that an ON-bridge exists for one index but is impossible for the other, hence their boundary-extendibility signatures differ).
- Quick test (type-separation witness): Fix j and pick Ot selecting its first occurrence i1; Build the ordered pair (τVar(i1),τCl(j)). The ON-bridge can succeed if VT=sgn1; For i′≠i1, the gate is OFF and we can enforce a different outcome by forcing non-⊥ on the variable side with a mismatching token that is locally rejected; the sets of boundary-extendible labelings differ, so the types differ.

5) Clause-verification tableau and radius-1 implementation
Claim K (Poly(s)-length, radius-1 verification inside wc/wb). The clause-side block encodes in RUN a radius-1 checkable tableau of length poly(s) that, given (C,GID=j), exposes in fixed rows: (i1,sgn1),(i2,sgn2),(i3,sgn3) in one-hot form next to the S-neighborhood. The variable-side block exposes HotRID in one-hot. Cout–out enforces stepwise consistency; malformed encodings admit a short error-chain refuter; well-formed ones cannot be refuted.
- Why useful here: Ensures Ot actually corresponds to a validated occurrence and exposes sgnt locally, making the ON conduit comparison well-defined and radius-1 checkable.
- How it can fail: If the verifier were O(1)-time, it could not validate the succinct circuit’s output; we instead unroll a poly(s)-length tableau (still radius-1, constant alphabet overhead). If errors were non-refutable, inactive contexts could force constraints; the error-chain gadget prevents that.
- Quick test: For a hand-built clause-index j, create a tiny RUN with 3 marked rows carrying the one-hot i_t and sgnt bits at fixed offsets. Flip one bit and confirm that an error-chain can be placed locally and that any non-⊥ S-choice against a malformed block is rejected by the DP.

6) Inactive contexts are harmless; (F2) trivialization
Claim L (Inactive contexts force ⊥; (F2) is made vacuous). If a context’s wb (resp. wc) lacks a well-formed variable (resp. clause) block, any non-⊥ at S is locally rejected (witness chain cannot find headers/indices). A dedicated PAD/⊥-plumbing language in Cout–out allows arbitrary filling when OFF or ⊥ at S. If we further allow wz repeats to be ⊥-fillable regardless of z, (F2) holds for any f, and the classification collapses to O(1) iff (F1) feasible, else Θ(n) by the gap theorem.
- Why useful here: Neutralizes irrelevant pairs and reduces the tri-class decision to (F1) on our instances.
- How it can fail: If PAD/⊥ seams were incompatible with S choices, OFF wouldn’t be trivially fillable; we explicitly include seam-compatible PAD/⊥ pairs in Cout–out.
- Quick test: Take an inactive left context and any right context. Try S=VT; the DP fails early (no HEAD/RID found). Set S=⊥; the DP runs a PAD/⊥ conduit and succeeds.

7) Putting it together: reduction to implicit SAT (Succinct-3SAT → F(P))
- Source: circuit C of size s defining ΦC with 2^B variables and 2^B clauses, each clause(j) has three occurrences (i1,sgn1),(i2,sgn2),(i3,sgn3).
- Target: PC with Σout and Cout–out implementing Claims H–L; β=poly(s), r=1, |description|=poly(β)=poly(s). By Claim J, C’s type set contains all τVar(i) and τCl(j). By Claim I, there exists f satisfying (F1) for PC iff ΦC is satisfiable. By Claim L, we can trivialize (F2) if we target full classification hardness.
- Complexity: Types count ℓpump=2^{Θ(β^4)}=2^{poly(s)}; we never enumerate them in the reduction. Verification of each bridge is via O(kβ^2) DP (k=Θ(ℓpump)), consistent with the NEXPTIME upper bound.

8) Toy worked example (B=2, indices 00..11)
- Let clause j encode (x01 ∨ ¬x10 ∨ x11). Suppose α(x01)=0, α(x10)=1, α(x11)=0.
- Choices: set f(τVar(01))=VF, f(τVar(10))=VT, f(τVar(11))=VF. Set f(τCl(j))=O2 (choose occurrence 2: ¬x10). For ordered pairs: (τVar(10),τCl(j)) ON and requires VT= (sgn2=−)? No, ON demands VF when sgnt=−. Oops: we must require VT iff sgnt=+ and VF iff sgnt=−; thus for occurrence 2 (negative), left must be VF to pass. Since α(x10)=1, O2 would fail. Correct choice is O1 or O3? O1 has sgn1=+, requires VT at Var(01), but α(x01)=0, so fail. O3 has sgn3=+, requires VT at Var(11), but α(x11)=0, so fail. Therefore, α does not satisfy this clause; no O_t makes the ON-pair succeed, as intended. If we flip α(x10)=0, then O2 makes (τVar(10),τCl(j)) succeed and all other pairs OFF; (F1) holds for this j.
- Takeaway: For each clause j, there exists exactly those Ot consistent with α that make all pairs pass; otherwise (F1) fails.

9) Open items and quantitative checks
- Boundary tables: Write explicit Cin–out/Cout–out rows for S-seams enforcing: (i) non-⊥ at S emits Offer tokens and forbids PAD unless OFF, (ii) OFF⇔mismatch of (RID,it), (iii) ON enforces CAP wire equality truth↔sgn_t, (iv) PAD/⊥ seams accept any colors when OFF.
- Clause RUN tiles: Provide a fixed set of row-local tiles producing/exposing (i_t,sgn_t) and validating them against header C and GID=j, with a bounded error alphabet E to refute any malformed run.
- Type separation proof: Formally exhibit, for i≠i′, some counterpart type so that the sets of extendible boundary assignments differ (hence distinct types). Likewise for clauses.
- Rule budgets: Count tracks/symbols to confirm |Σout|=β=poly(s). ℓpump≫poly(s) so that windows can host headers+indices+RUN comfortably.

How this answers “reduce to implicit exponential-sized SAT formula”
- The existence of a feasible f is equivalent to satisfiability of the implicit SAT F(P): variables are (A_i) and (T_j), constraints are local bridge constraints per (τVar(i),τCl(j)), exponentially many but specified implicitly by P (via DP over ℓpump-length contexts). Our reduction from C maps ΦC to F(PC) with the property F(PC) satisfiable iff ΦC satisfiable. This yields NEXPTIME-hardness of feasible-function existence, and (by trivializing (F2)) the full O(1) vs Θ(n) classification.

