## Round 0007 — 2025-08-27T19:52:27.721171Z

# Round 0007 — Inner‑product characterization of O5 and immediate consequences for local F‑tables

## Quick recap and current bottleneck
- Goal: Decide AP for H (finite 4‑hypertournaments omitting O5) via the one‑point step. The hard minimal base is |A|=4, a 6‑variable CSP with four local 5‑set constraints Y_k (output.md Prop. 3).
- Missing data: The local tables F(α,β)⊆{±1}^3 (especially for (α,β)∈{(+,+),(+,-)}), which determine whether the 2+2 vertex‑sign ansatz or a small brute‑force search suffices. We previously left open whether (+++)∈F(+,-).

## New lemma (rigorous, implementation‑ready)
Lemma 18 (Inner‑product characterization of O5).
- Statement. Let E={ε(τ):τ∈S5} be the ε‑set from Lemma 6. For p∈{±1}^5, one has p∈O5 if and only if there exists ε∈E with Σ_{i=1}^5 p_i ε_i = −3.
- Proof. O5 is the orbit of e_O=(+,-,-,-,-). For τ∈S5, the image has the form p=φ(ε,i0) where ε=ε(τ), i0=τ(1), and p_i=ε_i if i=i0 and p_i=−ε_i otherwise (notes: “O5‑image formula”). Hence Σ p_i ε_i = ε_{i0}^2 + Σ_{i≠i0}(−ε_i^2)=1−4=−3. Conversely, if Σ p_i ε_i = −3 with ε∈E, then exactly one coordinate satisfies p_i ε_i=+1 (the others are −1). Let i0 be this index. Then p=φ(ε,i0), hence p∈O5. ∎
- Why useful: Reduces IsO5 to a 120‑element check over E with a single scalar test; in particular, special ε∈E yield immediate hand‑classifications for families of 5‑vectors p.

## Immediate corollaries for F(α,β) (hard exclusions now settled)
Using Lemma 8 (ε≡−1∈E) and that ε≡(+1)∈E (τ=id), Lemma 18 yields:
- C1. F(+,-): (+++) is forbidden. Indeed, p=(+,-,+,+,+) has Σ p_i=+3, and with ε≡−1 we get Σ p_i ε_i=−3 ⇒ O5. Together with output.md Lemma 13 ((---) forbidden), we now fully classify the all‑equal triples in the opposite‑fixed case: both (+++) and (---) are O5 (forbidden).
- C2. F(+,+): Every triple with exactly two “+” and one “−” is forbidden. For p=(+,+,x,y,z), Σ p_i = 2 + (x+y+z). When the triple has two + and one −, x+y+z=+1 ⇒ Σ p_i=+3, hence O5 by ε≡−1. Thus all three permutations of (++−) are excluded in F(+,+).
- C3. F(−,−): Every triple with exactly one “+” and two “−” is forbidden. Symmetric to C2 via flipping all signs (Cor. 9).
These are strict consequences; there may be further forbidden triples (we do not claim exclusivity without enumerating E).

Why this matters now:
- The long‑standing ambiguity “(+++)∈F(+,-)?” is resolved (it is forbidden). This tightens the local tables and provides immediate unit tests for IsO5 and F‑table population.
- C2 implies the union‑bound route (Lemma 16) cannot settle the |A|=4 step: for (α,β)=(+,+), at least three triples are forbidden, so |{±1}^3\F(+,+)| ≥ 3 (>1). The union‑bound lemma remains valid but is not applicable here.

## Compatibility with the 2+2 vertex‑sign ansatz (sanity checks)
- The 2+2 ansatz only produces triangle‑triples of product +1, namely the three permutations of (+,−,−) and (+++). Lemma 10 (and its refinement in notes) shows that with 2+2, exactly the two ordered shapes (+,−,−) and (−,−,+) occur across k (under our fixed coordinate convention), never (−,+,−) and never (+++).
- The new exclusions C1–C3 do not rule out (+,−,−) or (−,−,+) for either (α,β)=(+,+) or (+,−). Thus the central feasibility question for the 2+2 method remains: do these two ordered shapes lie in F(+,+) and F(+,-)? If yes, Proposition 11 applies and the |A|=4 step follows uniformly.

## Examples and unit tests (for the verifier)
- All‑equal in the opposite‑fixed case:
  • (α,β)=(+,-), (x,y,z)=(+,+,+) ⇒ p=(+,-,+,+,+) ⇒ Σ p=+3 ⇒ O5 by ε≡−1.
  • (α,β)=(+,-), (x,y,z)=(−,−,−) ⇒ canonical O5 representative.
  These should both fail IsO5 (i.e., classify as O5) and be excluded from F(+,-).
- Mixed in the equal‑fixed case:
  • (α,β)=(+,+), (x,y,z) a permutation of (++−) ⇒ Σ p=+3 ⇒ O5 by ε≡−1. All three such ordered triples must be excluded from F(+,+).
- Sanity checks for the 2+2 test vectors (from notes P1–P3):
  • (+,+,−,−,+), (+,+,+,−,−), (+,−,−,−,+), (+,−,+,−,−) all have Σ p∈{+1,−1}. Lemma 18 gives no automatic O5 verdict with ε≡±1, which is consistent with the expectation that these might be non‑O5 (to be confirmed by IsO5).

## Implementation aids (to speed E and IsO5)
- Cocycle identity. For σ,τ∈S5 and i∈[5]: ε_i(σ τ) = ε_i(σ)·ε_{σ^{-1}(i)}(τ). Proof: Compose the two signed actions (output.md Lemma 6) and compare with the one‑step action of σ τ; coordinate‑wise equality follows from the definition of the induced signs on 4‑element complements. This identity enables generating E from the ε of adjacent transpositions.
- Minimal generator data. Compute ε for the four adjacent transpositions s_k=(k,k+1) (k=1,…,4) once (via Lemma 6), and generate E by the cocycle identity using any standard S5 word. Archive |E| and its list; then:
  • p∈O5 iff min_{ε∈E} Σ p_i ε_i = −3 (Lemma 18).
  • F(α,β) is the complement in {±1}^3 of those triples whose 5‑vector hits −3 against some ε.

## Obstacles and limits of the new facts
- C1–C3 are only necessary exclusions. Without a full enumeration of E (or equivalently, the O5 orbit), we cannot decide the status of the key ordered shapes (+,−,−) and (−,−,+) in F(+,+) and F(+,-), which control the 2+2 method.
- The union‑bound feasibility (Lemma 16) is now known inapplicable due to C2. We keep it as a general tool, but it will not conclude the |A|=4 step here.

## Next steps (minimal, decisive)
1) Compute E via the cocycle identity (or directly via Lemma 6) and report |E|.
2) Implement IsO5 using Lemma 18 (inner product −3 against E). Run unit tests including: C1/C2/C3 exclusions, and the four P1–P3 vectors from notes.
3) Populate F(+,+) and F(+,-) fully; derive the other two via Cor. 9. Explicitly confirm (or refute) that (+,−,−) and (−,−,+) are allowed in both tables.
4) If both shapes are allowed in both tables, apply Proposition 11 (uniform 2+2) to conclude the |A|=4 step and AP (via Lemma 2). Otherwise, run the 2^6 CSP per realized macro‑profile, using the parity invariant (Lemma 17) for pruning, and archive SAT/UNSAT witnesses.

## Notes on output.md (gaps/corrections to add later)
- Suggest adding Lemma 18 (inner‑product characterization of O5) to output.md; it streamlines IsO5 and underpins the new corollaries.
- With Lemma 18 in place, the status of (+++) in F(+,-) is settled (forbidden), refining the earlier caution in notes. Output.md currently proves only the (---) half (Lemma 13).
- Record in output.md the strict necessary exclusions C2 and C3 for F(+,+) and F(−,−) respectively. These clarify why the union‑bound lemma (Lemma 16) cannot close the |A|=4 case here.

## Summary of this round’s progress
- Established a sharp, general IsO5 criterion (Lemma 18): p∈O5 iff Σ p_i ε_i = −3 for some ε∈E. This yields immediate, rigorous exclusions in the local F‑tables.
- Resolved the open question (+++)∈F(+,-) (it is forbidden) and derived further necessary exclusions for F(+,+) and F(−,−), strengthening the local picture.
- Refined the computational plan: generate E via a cocycle identity and complete F(+,+),F(+,-); then either certify the 2+2 method or finish with a tiny 2^6 CSP per profile.
- Provided concrete unit tests and clarified why the union‑bound tool does not apply in this setting.

