Good progress. All provers now use a consistent radius‑1 transfer‑matrix framework and have essentially completed the middle‑gap (O(log* n) vs Θ(n)) branch: guess a type‑based separator table f_type and verify local checks plus the scalar bridge restricted to τ_b,τ_c ∈ R_K∪R_{K+1}; verification is EXPTIME and the overall procedure is NEXPTIME. This part is ready to implement and is mathematically sound.

Top gap (O(1) vs Ω(log* n)): the key flaw from earlier rounds (using “some” loop length e instead of handling all large block lengths) is now addressed. Multiple equivalent, EXPTIME‑checkable components emerged:
- Necessary aperiodicity: for every primitive period type τ, the per‑period step matrix must have an aperiodic SCC (gcd=1). This blocks parity‑type false positives and is implementable.
- Sufficient certificates: two variants. (a) SCC‑constant outputs (simple subcase). (b) Aperiodic‑anchor certificate with constant‑length entry/exit witnesses and bridging via a short separator matrix; this correctly resolves length alignment and is EXPTIME‑verifiable.

Remaining rigor gaps: (1) A complete extraction/compression lemma is still missing: from an arbitrary O(1) algorithm, derive per‑type anchors in aperiodic SCCs and a finite separator table satisfying the proposed bridge conditions; this is needed to make the O(1) test a decision, not just a sufficient filter. (2) Stub surgery: formalize that within a long τ^m block one can adjust constant‑size prefixes/suffixes to present any boundary outputs a∈Ex_τ(k), b∈En_τ(k) while preserving legality and respecting the partition lengths K/K+1 (and without silently changing the type at the interface). (3) Convention hygiene: Provers use both M(w)=S·E·… and T_w=∏(E·S_i); lock one convention and restate all bridge products accordingly to avoid off‑by‑one errors. (4) Path endpoints: explicitly handle ends (no wrap‑around edge) in the O(1) scheme; this seems straightforward but must be written.

Concrete next steps:
- Implement the middle‑gap NEXPTIME verifier with τ_b,τ_c ∈ R_K∪R_{K+1}.
- Implement an EXPTIME O(1) branch using the aperiodic‑anchor certificate (compute Ptypes, SCC periods, choose anchors, compute bounded entry/exit sets, and verify separator bridges). Add the necessary aperiodicity filter as an early reject.
- Prove and add a rigorous “stub surgery” lemma under the chosen convention; then pursue the extraction lemma using the finite monoid ⟨E·S_0,E·S_1⟩ and SCC/idempotent structure.
- Unify notation (pick T_i=E·S_i or the S·E convention project‑wide) and fix all bridge formulas accordingly.
