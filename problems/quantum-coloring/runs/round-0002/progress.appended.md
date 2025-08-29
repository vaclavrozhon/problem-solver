## Round 0002 — 2025-08-27T15:14:09.979743Z

Ideas and clarifications added this round
- We fixed the separation threshold (now correctly 2r) in the independence lemma and propagated it to the amplification stride (k + 2r). This matches the counterexample on a 3-node path for r = 1.
- We isolated a “placement invariance” principle for interior frames on a line segment: for any r-round algorithm with identical initial local states and uniform local channels, the marginal distribution over the cores of any r-gapped placement that lies fully r-buffered inside the segment is the same for all placements of the same frame family F (same core lengths, same t). This is the mechanism that justifies the LP constraints equating marginals across placements; it relies on light-cone localization and on the fact that all such placements induce isomorphic r-neighborhoods with identical initial reduced states. We will add this explicitly to output.md.

LP for r-non-signaling on a line segment (precise formulation)
- Domain: Σ = {1,2,3}. Fix r ≥ 1 and k ≥ 1. Let [k] := {1,…,k}. For a “family” F = ({{s1}},…,{{st}}) of sliding frames (each {{sj}} a length-sj contiguous core), a gap-r placement ω of F is a t-tuple of start indices (ω1,…,ωt) such that the r-buffers [[ωj − r .. ωj + sj − 1 + r]] are all subsets of [1..k] and pairwise disjoint. The induced cores are Cj = [[ωj .. ωj + sj − 1]].
- Variables: pψ for each ψ ∈ Σ^k, with pψ ≥ 0 and Σψ pψ = 1.
- Objective: maximize Σψ pψ · 1{ψ is proper on [1..k]} (i.e., no equal adjacent colors on edges (i,i+1), i=1..k−1).
- r-non-signaling constraints (segment version): For every fixed family F and every core assignment ζ = (ζ1,…,ζt) with ζj ∈ Σ^{sj}, the marginal probability that the segment-coloring ψ induces ζ on the cores must be independent of the placement ω of F (as long as all r-buffers lie inside [1..k]):
  Σψ: ∀j ψ|Cj = ζj pψ is equal for all gap-r placements ω of F.
- Implementation note: It suffices to equate all placements to a fixed choice per F and ζ; equivalently, enforce equality for all consecutive placements or to the average. For a valid (non-relaxed) certificate, include all placements ω whose r-buffers lie in [1..k].
- Symmetries to reduce size: (i) color permutations S3; (ii) reversals (reflection of the segment); (iii) translations of placements (realized as equality constraints; also exploitable to quotient variables if one switches to a marginal-based parameterization, but we keep pψ for simplicity). Dropping some constraints gives a relaxation; if its optimum < 1, the true optimum is also < 1.

Small structural lemmas (useful to guide computation)
- Monotonicity in k: Let q(r,k) be the LP optimum for fixed r,k. Then q(r,k+1) ≤ q(r,k). Proof sketch: restriction from length-(k+1) distributions to [1..k] preserves r-non-signaling (buffers still internal), and P[proper on k+1] ≤ P[proper on first k] pointwise, hence the supremum decreases.
- Placement invariance (segment version; to be added to output.md): For a fixed r-round quantum LOCAL algorithm with identical initial local states and uniform channels, and for any family F whose r-buffers fit inside [1..k], the distribution of Ψ(ω+F) is the same for all gap-r placements ω of F. Proof idea: Heisenberg-evolved effect for the event “cores equal ζ” is supported on the union of the r-neighborhoods of the cores. For two placements ω, ω′ inside the segment, these unions are isomorphic balls with identical initial reduced states; therefore the resulting probabilities Tr[ρ X_ω] and Tr[ρ X_ω′] coincide.

Concrete plan for r = 2 LP instances (k ≈ 10–16)
- Variables: pψ, ψ ∈ Σ^k. For k = 12, |Σ^k| = 531,441; with S3 color quotienting (factor ~6) and reflection (factor ~2), the effective unknowns can drop by ~10×–12×. For k = 10 (|Σ^k| = 59,049), even a straightforward LP is feasible with a commercial solver; for k = 12 a symmetry-reduced LP ought to be solvable.
- Constraints: we start with all F consisting of a single core {{s}} with s ∈ {1,2,3} and all placements ω with r=2 buffers internal; this enforces translation invariance of 1-, 2-, 3-block marginals. Then we add selected F with two cores (t=2), e.g., ({{1}},{{1}}), ({{2}},{{1}}), ({{2}},{{2}}), with varying separations, again over all placements with r-buffers internal. This matches the spirit of LGR and is already quite restrictive. For a final, fully rigorous certificate, we can include all families F up to, say, t ≤ 3 and core lengths up to 3, across all placements; empirically, this suffices in r=1 to detect q<1.
- Objective: maximize the probability of 0 violations among the k−1 adjacent edges; computed as Σψ pψ 1{proper(ψ)}.
- Solving and certification: Use a high-precision LP solver; if optimum < 1, extract a dual solution (constraints multipliers) as a certificate. We will archive (r,k,q) alongside the dual to make the bound verifiable.

Why a point-mass on a proper coloring is infeasible (important sanity check)
- On a line segment, concentrating pψ on a single proper ψ does not satisfy non-signaling across placements: single-core constraints force the distribution of s-blocks to be identical for all interior positions; a fixed ψ yields position-dependent s-blocks unless ψ is periodic with period 1 (impossible). Hence the LP can detect q<1 even though proper colorings exist.

Gaps or missing details in output.md
- The current output.md does not yet formalize the “placement invariance on segments” lemma; we propose to add it, as it justifies the LP constraints from algorithmic locality and symmetry (no IDs, identical initial states).
- Theorem 1 and Theorem 2 are stated with proof sketches; for a curated document, we should include a short, fully rigorous Heisenberg-picture derivation (operator support growth by at most one hop per round; product initial state factorization yields independence once N_r(S_i) are disjoint). We can reuse the projector construction from LGR Appendix A verbatim with symmetric buffers.
- We should add an explicit definition subsection for the r-non-signaling LP (variables, constraints, objective) and the monotonicity lemma q(r,k+1) ≤ q(r,k).

Next steps (auditable)
1) Add the “placement invariance on segments” lemma with a concise proof to output.md, and expand proofs of Theorem 1–2 to full detail (2–3 paragraphs each).
2) Implement the r = 2 LP generator:
   - Enumerate Σ^k with S3/reflection orbits and map constraints accordingly.
   - Generate constraints for F ∈ {(single-core s ∈ {1,2,3}), (1,1), (2,1), (2,2)} across all gap-2 placements.
   - Solve for k ∈ {10,…,16}. Target: locate first k with optimum q < 1; extract dual certificate.
3) If found (r=2,k,q<1), immediately record: (i) constant error bound with entanglement, P_success(C_n) ≤ q for n ≥ k; (ii) exponential bound without entanglement, P_success(C_n) ≤ q^{⌊n/(k+4)⌋}.
4) In parallel, attempt r = 3 with k ≤ 14 under the same constraint families.
5) Optional analytic route: explore representing feasible processes via stationary order-r Markov chains on Σ and bounding P[no equal adjacencies] under chain constraints; this may yield closed-form witnesses for small k.

Sanity checks and toy instances
- Monotonicity: verify numerically that the LP optimum decreases (or stays equal) as k grows.
- Minimal placements: confirm that with only single-core constraints, q(r,k) = 1 (insufficient); adding two-core constraints should reduce optimum.
- Counterexample retention: keep the r=1, 3-node path example in output.md to prevent regressions on the 2r threshold.

