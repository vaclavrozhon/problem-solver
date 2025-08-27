## Status and focus
- Outputs.md currently contains: the orientation-function model (Prop. 1), one-point sufficiency (Lemma 2), the |A|=4 CSP formulation (Prop. 3), trivial |A|≤2 (Cor. 4), a caution on switching (Fact 5), and the explicit S5 action/identity (Lemma 6, Cor. 7). These are correct and useful.
- Missing pieces to settle AP: explicit characterization of the 5-vector O5-orbit membership for the small “two-fixed plus three-free” situations; the tables F(α,β)⊆{±1}^3; a proof of the |A|=3 one-point case; and a resolution of the |A|=4 6-variable CSP across all compatible B,C.

## New observations and micro-lemmas (auditable)
1) Interpretation of the fixed bits p^B_k and p^C_k.
- For B on A∪{b}, the four fixed signs p^B_k (k∈A) are exactly the indicator (via +/−) of which vertices of A are “positive” in the 5-vertex structure induced by B (i.e., k is positive in B iff the increasing 4-tuple on {b}∪(A\{k}) is in R_B).
- Same for C. Why useful: This ties the |A|=4 profiles directly to the 5-point types of B and C and justifies reducing the search by S4-symmetry on A.

2) Necessary local exclusions for the “opposite” case (to be used as quick unit checks).
- Claim N1: With α=+ and β=−, the triple (x,y,z)=(−,−,−) yields p=(+;−;−,−,−) which is the canonical labeled O5 representative; hence forbidden. Symmetrically, with α=− and β=+, the triple (+,+,+) yields p=(−;+;+,+,+) which is in the O5 orbit (by the same reasoning after swapping the two fixed positions and re-enumerating); thus forbidden as well.
- Why useful: This gives immediate necessary constraints that any F(+,-) and F(-,+) must omit. It also supplies two easy sanity tests for any IsO5 implementation.

3) Triangle/edge perspective and a structured ansatz.
- Variables are on edges of K_4 on A: x_{ij}∈{±1} for 1≤i<j≤4. Each constraint Y_k involves the triangle on T=A\{k}. This viewpoint helps reason about compatibility.
- Structured ansatz (to test): pick signs w_i∈{±1} on vertices and set x_{ij}:=w_i w_j. Then for any triangle {i,j,k}, the triple is (w_iw_j,w_iw_k,w_jw_k) and has product +1. Among the 8 patterns, this ansatz realises exactly the four with product +1: (+++), (+−−), (−+−), (−−+).
- Why useful: If all constraints admit at least one of these four patterns (per their (α,β)), one can try to choose w_i to satisfy all triangles simultaneously. This reduces the search to a low-complexity global choice of four bits w_i; it is easy to brute-force (2^4=16) and scales to general |A| as well.

4) Reduction by eq/opp pattern across k.
- For the |A|=4 CSP, only the pair (α_k,β_k) for each k matters via the choice F(α_k,β_k) of allowed triples; the absolute signs on A’s 4-set in B and C do not enter the new constraints. Hence, modulo S4 on A, it suffices to test the 16 eq/opp patterns E⊆A where E={k: α_k=β_k} (provided we use the full F(α,β) tables rather than assuming F(+,+)=F(−,−), etc.). This organizes the exhaustive check and avoids unnecessary duplication.

## Explicit computational blueprint (refined)
A) Build IsO5(p) correctly.
- Use Lemma 6 to compute ε_i(τ)=sgn(τ)(−1)^{c_{τ^{-1}(i)}(τ)} for all τ∈S5.
- Generate the O5 orbit as O = { (ε(τ)·e1∘τ^{-1}) : τ∈S5 }, with e1=(+,-,-,-,-) in the chosen labeling.
- Implement IsO5(p): return true iff p∈O.
- Unit tests: IsO5(+,+,+,+,+)=false; IsO5(+,-,-,-,-)=true; IsO5(+,-,+,-,+)=false. Also verify orbit size (report it) and closure under the action.

B) Compute the local tables F(α,β)⊆{±1}^3.
- For each (α,β)∈{±1}^2, enumerate the 8 triples (x,y,z) and evaluate IsO5 on p=(α,β,x,y,z). Record F(α,β) as the complement of the O5 cases. Store the full tables (do not assume symmetries a priori), and note any observed invariances (e.g., under permuting x,y,z).
- Immediate checks: verify Claim N1 above is reflected (i.e., (−,−,−)∉F(+,-) and (+,+,+)∉F(−,+)); verify (+++)∈F(+,+) and (−,−,−)∈F(−,−) (constant 5-vectors are non-O5).

C) Conclude |A|=3 one-point amalgamation.
- For each (α,β), check that F(α,β) is nonempty and archive one explicit triple per case. This settles |A|=3 rigorously.

D) Solve the |A|=4 6-variable CSP.
- For a given eq/opp pattern E⊆{1,2,3,4}, impose that the triangle on A\{k} chooses a triple in F(α_k,β_k), i.e., in F(+,+) if k∈E, or in F(+,-) otherwise (after fixing a concrete representative with α_k,β_k; the concrete sign choices do not matter because the constraint is picked by the (α,β) pair).
- Two complementary solvers:
  • Brute-force x_{ij} (2^6=64) and check all four Y_k via IsO5 by constructing p(Y_k) explicitly; report SAT/UNSAT.
  • Try the structured ansatz x_{ij}=w_i w_j (2^4=16 assignments) and accept if each triangle’s triple lands in F(α_k,β_k). If this always succeeds across all tested patterns, we get a strong template for general |A|.
- Start with the four canonical profiles (P1–P4 from notes) and then cover all 16 eq/opp patterns modulo S4.

E) Optional but informative: enumerate actual pairs (B,C) up to S4 on A.
- Extract p^B_k and p^C_k patterns realizable by C5/H5 on B and C (as 4-bit vectors), ensuring B and C agree on A’s 4-set; then feed their induced eq/opp signatures to step D. This cross-checks that all emergent eq/opp patterns indeed arise from valid (B,C).

## Why this is concrete progress
- We isolated a sharp necessary exclusion (Claim N1) that provides immediate unit tests and sanity checks for F(α,β).
- We clarified exactly how the four fixed signs p^B_k and p^C_k are determined by the 5-point types on B and C, which justifies organizing the |A|=4 exploration by eq/opp patterns and S4 symmetry.
- We provided a structured, low-complexity ansatz (x_{ij}=w_iw_j) that, if accepted by the F(α,β) tables, yields a uniform construction and a plausible path to all |A| by iterated one-point steps.
- The refined computational blueprint reduces ambiguity (e.g., coordinate ordering in Y_k) and pinpoints the minimal data to archive (F(α,β) tables, eq/opp SAT results, and, if found, a counterexample assignment witnessing failure of AP).

## Obstacles and open items
- Analytic classification of the O5 orbit in {±1}^5 under the signed S5 action remains nontrivial; we rely (appropriately) on small-scale enumeration suggested above.
- We intentionally do not assert symmetries like F(+,+)=F(−,−) without computation. These might hold but are not needed to proceed.
- The structured ansatz may fail in some patterns; in that case, fallback to the 2^6 brute-force solver will still decide the |A|=4 CSP.

## Next steps for the verifier (minimal, checkable)
1) Implement IsO5 with Lemma 6; report orbit size and perform the unit tests (three vectors and an action-closure check).
2) Compute and record all four F(α,β) tables; confirm Claim N1 and that (+++)∈F(+,+), (−,−,−)∈F(−,−). Conclude |A|=3 by listing one allowed triple per (α,β).
3) For |A|=4, first test the four profiles P1–P4 (from notes) and then the 16 eq/opp patterns modulo S4 using the 2^6 brute force. Archive a satisfying assignment x_{ij} for each SAT case; if any UNSAT appears, this is a concrete counterexample to AP.
4) Test the structured ansatz x_{ij}=w_iw_j across all patterns; if it always succeeds, note it as a candidate general construction and we will attempt to lift it to arbitrary |A| next.

## Notes on outputs.md
- No errors detected in the current statements. A minor clarification we already kept in notes: the “aligned B,C” constant-triple trick works only when the common 4-bit pattern on A is constant (then taking all x_{ij} equal produces constant 5-vectors). This was previously mis-stated in a draft and has been corrected (not present in outputs.md).
- Still missing from outputs.md (for future addition once computed): the |A|=3 one-point lemma (with explicit witnesses per (α,β)) and the resolution of the |A|=4 CSP (either a general construction or a minimal counterexample).

