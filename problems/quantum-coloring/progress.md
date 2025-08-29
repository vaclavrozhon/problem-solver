## Round 0001 — 2025-08-27T15:06:34.224169Z

Ideas and target for this round
- Goal: move beyond the single-round, one-way lower bound of Le Gall–Rosmanis (LGR, 2022) and obtain any nontrivial lower bound for 3-coloring cycles in the quantum LOCAL model with 2 or 3 rounds. A first milestone is to rule out perfect correctness (i.e., prove a constant error lower bound) for fixed small numbers of rounds; a stronger milestone is an exponential decay in n of the success probability.
- We leverage two key abstractions of quantum outputs: bounded-dependence (independence beyond distance r), and non-signaling beyond distance r. In the one-way model without shared entanglement, r rounds imply independence beyond r (LGR Lemma 3). In the standard two-way model, without shared entanglement we can adapt the same proof technique to show independence beyond r (sketch below). With shared entanglement, we retain non-signaling beyond r (Akbari et al. 2024, and earlier Gavoille–Kosowski–Markiewicz 2009).

Deliverable A: Independence beyond r also holds for two-way algorithms without shared entanglement
- Statement (Two-way analogue of LGR Lemma 3). Let Φ be the coloring produced by a standard (two-way) r-round quantum LOCAL algorithm on the ring, assuming no initial shared entanglement and identical initial local states. Then Φ is independent at distances beyond r in the natural undirected sense: for any collection of vertex intervals whose pairwise distance (in the cycle metric) is > r, the random colorings on these intervals are mutually independent.
- Proof sketch. Substitute the directed, gapped sliding frames in LGR Appendix A by symmetric intervals [v−r..v+s−1], and allow messages to flow both directions. Define the reverse-evolved measurement projector exactly as in LGR A.2, but now on symmetric buffers. The operator corresponding to the final measurement on a block is supported entirely on the r-neighborhood of that block after reversing the r communication layers. For disjoint r-buffers, the corresponding projectors act on disjoint tensor factors of the initial product state |0⟩⊗n, hence their joint outcome probabilities factor. This gives independence beyond r for two-way quantum LOCAL algorithms without shared entanglement. (We can formalize this as a lemma mirroring LGR’s Lemma 3; nothing in the Heisenberg-picture argument relies on the one-way directionality beyond where the buffers are placed.)
- Usefulness: With independence beyond r established for two-way/no-entanglement, we can reuse LGR’s block-tensorization Lemma 4 to amplify any constant bound on the success probability on a length-k segment into an exponential-in-n bound on the cycle.

Deliverable B: LP framework for multi-round (general r) line segments
- LGR’s LP (Section 4.2) upper-bounds the maximum success probability on a k-node line segment among distributions that are non-signaling beyond distance r. For one-way single-round they obtained r=1, k=9 with optimum 11/15.
- For our 2- and 3-round targets, we propose to instantiate the same LP for r=2 and r=3, seeking any k with optimum strictly less than 1. This suffices for two distinct scenarios:
  1) No shared entanglement (two-way or one-way): by Deliverable A we actually have independence beyond r, which is included in non-signaling; hence sup_indep ≤ sup_non-signaling < 1. Then by LGR Lemma 4 we get an exponential bound (q⌊n/(k+r)⌋).
  2) With shared entanglement: we still obtain that the success probability on a single length-k segment is < 1 for any non-signaling distribution; this certifies at least a constant error on rings whose geometry allows embedding that segment as a necessary condition. (Amplification to exponential in n is delicate without independence; we outline a route below.)
- We write down the r-parameterized LP for the line segment [[1..k]] exactly as in LGR (Eq. (2)), with “gap-r placements that respect the segment” and the non-signaling equality of marginals across placements. This LP size grows with k and r via the number of placements; we propose reductions:
  - Color symmetry: quotient by the action of S3 on colors to shrink variables.
  - Translation symmetry on the segment: use that the LP constraints are invariant under shifting all frames by an offset that keeps them in the segment.
  - Restrict to a generating set of collections F (small t, e.g., t≤3 or 4) that we conjecture already enforces all non-signaling constraints; in r=1, LGR used all collections but observed that small-t constraints were very effective.
- Computational plan: implement the constraint generator and solve the LP numerically (and potentially symbolically for small k) for r=2 with k ranging from 9 to ~18, and then for r=3 with k up to ~20. The first k where the optimum drops below 1 gives the constant q. (This mirrors LGR’s successful r=1, k=9 case.)

Deliverable C: From line-segment bound to exponential decay (no entanglement)
- If we obtain any k with LP optimum q(r,k) < 1 for r=2 or r=3, Deliverable A allows us to invoke the independence (two-way/no-entanglement). Then LGR’s Lemma 4 applies verbatim, yielding success ≤ q⌊n/(k+r)⌋ for cycles. This provides the requested 2- or 3-round exponential lower bound in the quantum LOCAL model (without shared state), improving the state of the art beyond single-round one-way.

Deliverable D: Constant error lower bounds with shared entanglement (non-signaling only)
- Even without independence, the LP optimum <1 for a suitable k immediately implies that any r-round non-signaling strategy on sufficiently large cycles must fail with probability at least ε>0, via a “necessary local witness” argument: partition the cycle into Ω(n/k) windows of length k separated by gaps of size r; if any window is internally improper, the whole coloring is improper. While we cannot multiply probabilities without independence, we can still conclude that the global success probability is ≤1−ε for infinitely many n by the union bound’s converse: If success were 1, then all windows would be proper with probability 1, contradicting the LP.
- We will formalize this via a covering argument that selects a set of O(n/k) disjoint windows; non-signaling ensures each window has success ≤ q<1, hence the global success probability is ≤ 1−c for some c depending on q and the window packing density. (We do not claim exponential decay in this setting.)

Why experiments-in-distance do not directly extend to two-way multi-round
- LGR’s Section B “bias” method relies on one-way non-signaling beyond 1, which enforces that the pair distribution of colors for two non-adjacent nodes is independent of their mutual distance. In the two-way model, the t-view of a pair at distance d includes the gap length, so φ-LOCAL/non-signaling does not collapse pair distributions for different d. Therefore, we focus on the line-segment LP route for r=2,3.

Obstacles and barriers
- The barrier of Akbari et al. (2024): non-signaling alone cannot separate O(1) from O(log* n) for many LCLs; indeed, they show constant-locality finitely dependent distributions for all O(log* n) LOCAL problems, including 3-coloring on cycles. Our plan sidesteps this by targeting fixed small round numbers (r=2,3) and proving strictly sub-unit success for line segments via LP – exactly the kind of finite-radius obstruction that their barrier does not rule out.
- Computational feasibility: The LP grows quickly with r and k. We mitigate using symmetry reductions and by exploring small k; the r=1 case succeeded already at k=9; for r=2 we expect feasible bounds appear at k in the low teens.

Concrete next steps (auditable)
1) Formal lemma write-up: Two-way/no-entanglement implies independence beyond r (as in Deliverable A). We will produce a concise, checkable proof with the symmetric buffer operator construction; this will be reusable beyond rings.
2) LP implementation for r=2: Generate constraints for k∈{10,…,16}, apply color and translation symmetries, and solve numerically to locate the first k with optimum <1. Verify robustness by increasing the family of frame collections F. Target outcome: a certificate (primal and dual) for some (r,k) with e.g. q≤0.99.
3) If step 2 succeeds, apply Lemma 4 (independence) to yield an explicit exponential lower bound in 2 rounds for two-way, no entanglement; record base and block size.
4) In parallel, attempt r=3 with smaller k (≤14) to see if a similar bound appears.
5) For the shared-entanglement case, formalize the window-covering argument to deduce a constant error lower bound from any line-segment q<1.

Notes on output.md
- No output.md was provided; hence we cannot cross-check or point out gaps in an existing curated proof document. We will ensure that the lemmas we propose (two-way independence beyond r; line-segment LP for r=2,3) are stated precisely and accompanied by self-contained proofs or computational certificates in subsequent rounds.

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

## Round 0003 — 2025-08-27T15:22:40.586198Z

Headlines for this round
- We stress-test the logical interface between the LP and the algorithmic regimes and add two small structural lemmas (monotonicity in r; extreme-point structure) to guide computations. We also sharpen what the interior-placement constraints actually model and when they are justified.
- We outline an auditable plan to generate and certify r = 2 LP instances for k ≈ 10–16 with symmetry reductions, and propose a fallback “transfer-matrix” analytic relaxation for cross-checks. 
- We point out two places in output.md that benefit from explicit caveats (regime for LP constraints; role of automorphism invariance with entanglement).

Gaps or clarifications needed in output.md
1) Scope of the LP constraints (Definition 6). The LP enforces “interior placement invariance.” As stated, Definition 6 is purely combinatorial and does not mention the regime under which these equalities are necessary for a physical algorithm. In the entangled regime, those equalities are only guaranteed if the initial global state is invariant under the automorphisms of the cycle (or if one applies a symmetrization step at the start). In the product-state regime (no entanglement, identical local states), they are justified. Suggestion: add one sentence after Definition 6 clarifying: “These constraints are necessary for r-round uniform algorithms under (i) product initial states with identical local marginals, or (ii) arbitrary shared entanglement provided the initial global state is invariant under cycle automorphisms (rotations/reflections). Without such symmetry in the initial state, the constraints need not hold.” This would harmonize Definition 6 with Lemma 5 and Corollary 8.
2) Constant-error bound with entanglement (Corollary 8). The proof correctly uses Lemma 5; it would help to add a pointer back to Remark 5.2 (EPR-pair counterexample) to remind the reader that the automorphism-invariance hypothesis is essential. As a constructive note: in many distributed protocols one can enforce automorphism invariance by a public random rotation of node labels/ports prior to the algorithm; if allowed, that reduces the assumption to “shared randomness is available”. If such a symmetry-randomization step is admissible in our model, we can note this explicitly; otherwise, keep the assumption as is.

New small lemmas (useful structure for the LP and for planning computations)
- Lemma A (Monotonicity in r). For fixed k, the LP optimum is nondecreasing in r: q(r+1,k) ≥ q(r,k). Reason: Every feasible p for (r,k) is also feasible for (r+1,k), because as r grows the family of interior placements shrinks (fewer ω with buffers fully inside [1..k]), so the set of equality constraints weakens. Therefore the feasible set enlarges and the supremum cannot decrease.
- Lemma B (Extreme points). The feasible region of Definition 6 is a polytope in R^{3^k} cut out by linear equalities and nonnegativity plus Σ p_ψ = 1. Hence an optimal solution exists at an extreme point. In particular, for any (r,k) one can search for sparse optimal supports (basic feasible solutions). This is useful for reducing solver time and for constructing human-auditable dual certificates.

Sanity checks and toy examples
- Consistency of thresholds: The stride k+2r in Corollary 3 matches the necessity of 2r-separation; the r = 1, path 0–1–2 example shows that an r-stride would be false. 
- Dirac mass infeasibility: As noted in notes.md, under single-core invariance constraints even a single proper coloring dirac mass is infeasible; we will keep this test in our solver harness to catch bugs.

Computation plan (r = 2) — concrete and auditable
- Variables and symmetries:
  • Work in the quotient space under S3 color permutations and reflection to reduce Σ^k orbits. For k = 12 this typically yields ~5–10× reduction. Maintain a map to lift primal/dual certificates back to the full space.
  • Enforce translation invariance across interior placements by constraints; do not hardwire stationarity on positions in advance, to keep the LP sound in our regime.
- Constraint families (progressive tightening):
  • Start with all single-core families {{s}} with s ∈ {1,2,3}, all r-gapped interior placements; this enforces uniformity of position-marginals for blocks of length ≤ 3.
  • Add two-core families ({{1}},{{1}}), ({{2}},{{1}}), ({{2}},{{2}}) at separations d ranging over those permitted by r-gaps inside [1..k]. This captures pairwise non-signaling constraints beyond immediate adjacencies.
  • If the optimum remains 1, expand to t = 3 families, e.g., (1,1,1) and (2,1,1), again at several admissible placements.
- Solving and certification:
  • Use a high-precision LP solver (e.g., exact rational via QSopt_ex or SoPlex with long-double) to avoid numerical slack. 
  • For any instance with optimum q < 1, extract the dual solution (weights on equality constraints and indicator inequalities) and store it as a certificate. We will include: problem parameters (r,k), list of placements F, the dual vector, and the certificate inequality showing Σ_ψ p_ψ 1{proper(ψ)} ≤ q.
- Targets and acceptance criteria:
  • Parameter sweep: (r,k) = (2,10..16). Stop as soon as one k yields q ≤ 0.99 (or any q < 1). Record the smallest such k and the achieved q.
  • Cross-checks: (i) Verify monotonicity q(r,k+1) ≤ q(r,k) on our chosen constraint families (a relaxation); (ii) Verify Lemma A empirically by comparing r = 2 and r = 3 with identical constraint families.

Backup analytic cross-check (transfer-matrix / Markov relaxations)
- As an independent relaxation (feasible set ⊂ LP-feasible), we can restrict to stationary Markov chains of order d (e.g., d = 2 or 3) on Σ with forbidden equal-adjacency transitions. The feasible chains are parameterized by local marginals consistent with our single-/two-core placement constraints. Maximizing P[proper on [1..k]] under such a chain yields an upper bound on q(r,k). This helps detect solver/modeling errors and provides intuition about which local patterns saturate the optimum.

Entanglement regime and symmetry discussion (why our LP still yields a valid constant bound)
- With entanglement but without automorphism-invariance, interior placement equality need not hold (Remark 5.2). For constant-error bounds (Corollary 8), we either (i) assume the initial state is automorphism-invariant, or (ii) allow an initial public random rotation of the cycle (if admissible), which effectively restores invariance in distribution. In both cases, Lemma 5 applies and the LP optimum upper-bounds P[W proper]. Without such symmetry, we cannot soundly use the LP; this caveat should be explicit at Definition 6 (see “Gaps” above).

Additional observations
- Theorem 2 independence with product states remains sound: disjoint supports imply commuting effects and factorization of the trace; there is no subtlety from non-commutativity.
- Combining Lemma 7 (monotonicity in k) and Lemma A (monotonicity in r) suggests focusing first on the smallest r and the largest k our solver tolerates; any q < 1 found there is “hardest won” and suffices for amplification.

Next steps (checkable)
1) Text refinements in output.md:
   - After Definition 6, add a one-sentence regime caveat as above.
   - In Corollary 8, add a parenthetical “(under automorphism-invariant initial states; cf. Remark 5.2)” to spotlight the assumption.
2) Implement the r = 2 solver (with symmetry reductions and staged constraints) and sweep k ∈ {10,…,16}. For any instance with optimum < 1, produce and archive a dual certificate. 
3) If a (2,k,q<1) is found, immediately state: 
   - No-entanglement exponential bound: P_success(C_n) ≤ q^{⌊n/(k+4)⌋}.
   - Entanglement (automorphism-invariant) constant bound: P_success(C_n) ≤ q for n ≥ k.
4) Explore r = 3 with smaller k (≤ 14) to gauge sensitivity; verify Lemma A numerically.
5) Build the Markov-chain relaxation and compute its bound for the same (r,k) to cross-check solver outputs; keep code and numeric logs for audit.

Potential pitfalls to watch
- Over-reduction of symmetry (e.g., misquotienting S3 or reflection) can silently invalidate constraints; we will keep both full and reduced LPs on small k to validate the reduction pipeline.
- Constraint generation must ensure that every equality ties only placements whose r-buffers lie entirely inside [1..k]. We will implement a placement validator to avoid illegal constraints.

## Round 0004 — 2025-08-27T15:51:27.050231Z

Headlines for this round
- Critical observation: the current geometry-aware non-signaling LP in Definition 6 is too weak to certify any nontrivial bound in the two-way model (with or without entanglement). In fact, for every r ≥ 1 and k ≥ 1 one can construct a feasible distribution with success 1. Hence q(r,k) = 1 under Definition 6, and the LP as stated cannot yield the desired constant-error lower bound. We give an explicit feasible “stationary proper Markov chain” witness and verify it satisfies all geometry-aware placement-invariance constraints while assigning probability 1 to proper colorings. This reveals a gap in output.md: constant-error bounds cannot be extracted from this LP for two-way algorithms.
- Implication: to obtain any nontrivial bound for 2–3 rounds, we must strengthen the constraint system beyond geometry-aware invariance. For product initial states, independence across sets whose 2r-neighborhoods are disjoint is valid, but it is nonlinear (factorization) and thus does not fit directly in a linear program. For the entanglement-allowed regime, no such independence holds, so even stronger difficulty arises—non-signaling alone is insufficient.
- We propose two corrective directions: (A) independence-augmented constraints for the product-state regime (leading to a non-linear, or lifted, formulation); (B) switch to ring-level “experiment” arguments tailored for two-way (rather than the segment-LP), or to LCL-round-elimination style arguments yielding constant-error lower bounds for fixed r.

Gap in output.md (and why)
- Definition 6 + Lemma 5 (geometry-aware invariance within automorphism classes) are correct and sound. However, the discussion that suggests solving this LP for r = 2,3 and extracting q < 1 (progress.md Round 0001–0003; output.md Constant-error bound, Corollary 10, “segment LP” as the vehicle) is too optimistic: the LP feasible region is broad enough to include measures supported entirely on proper strings.
- Concrete witness (feasibility with objective 1). Consider the order-1 Markov chain on Σ = {1,2,3} with stationary distribution u(σ) = 1/3 and transition matrix P with P(σ→σ) = 0 and P(σ→τ) = 1/2 for all τ ≠ σ. Let p_k be the induced distribution on Σ^k generated by (X_1,…,X_k) with X_1 ∼ u and X_{i+1} | X_i ∼ P. Then:
  • Support: p_k(ψ) = 0 whenever ψ has any equal adjacent colors; thus ∑_ψ p_k(ψ)·1{proper(ψ)} = 1.
  • Interior single-core invariance: For any core length s and any interior position i (with r-buffers inside [1..k]), the marginal law of (X_i,…,X_{i+s-1}) is the stationary s-block law of the chain, independent of i. Hence all single-core equalities across interior translations are satisfied.
  • Geometry-aware multi-core invariance: For any geometry (s,δ) and two r-gapped placements ω, ω′ of (s,δ) inside [1..k], the joint law of the blocks (centered at the cores) depends only on (s,δ) (i.e., on inter-core separations), and not on absolute position. Therefore all geometry-aware multi-core constraints in Definition 6 hold. (The only admissibility requirement is δ_j ≥ 2r, which we respect by picking placements with disjoint r-buffers; stationarity ensures invariance across interior translations for each fixed geometry.)
- Since p_k is feasible and achieves objective value 1, we have q(r,k) = 1 for all r,k under Definition 6. Thus, the (segment) LP cannot witness q < 1 in the two-way model and provides no constant-error bound in Corollary 10 beyond the trivial bound 1. This should be clearly stated in output.md, and the current plan “solve the LP for r = 2,3 to get q < 1” should be revised.

Consequences and revised modeling proposals
- Product-state (no entanglement) regime:
  • Valid extra structure: independence across regions whose r-neighborhoods are disjoint (in our setting: beyond 2r for two-way). This implies that, for any geometry (s,δ) with pairwise δ_j ≥ 2r and placements ω, the joint law on the cores factorizes across connected components of the union of r-buffers. Unfortunately, factorization constraints are multiplicative (bilinear if expressed in terms of probabilities); hence the natural feasible set is not a polytope. Adding “independence” to Definition 6 transforms the LP into a non-linear (and non-convex) program.
  • Auditable alternative (still linear, but stronger than Definition 6): Introduce auxiliary variables for joint marginals on tuples of cores and impose linear consistency across overlaps together with linear “bounds” implied by independence (e.g., all 2×2 minors nonnegative inequalities, union/intersection bounds). These are necessary but not sufficient for independence; they cut off some (but not all) spurious feasible points such as the Markov-chain witness. The hope is that a sufficiently rich hierarchy of such linear constraints (e.g., k-local consistency with lifted variables) already forces q(r,k) < 1 for small k,r. This is akin to local-consistency/Sherali–Adams lift-and-project. We propose to instantiate the first 1–2 lift levels and test.
  • Nonlinear route (exact): Enforce true factorization for disjoint unions by constraints of the form P(A∩B) = P(A)P(B), where A,B are cylinder events on disjoint r-buffers. This yields a polynomial system (bilinear equalities). One can attack it with algebraic or mixed-integer programming tools, or via iterative convex relaxations (e.g., log-likelihood parametrization) — at least for small k. A negative certificate (infeasibility at value 1) would give the desired q(r,k) < 1.
- Entanglement-allowed regime:
  • No independence is valid; only non-signaling and geometry-aware invariance hold. As the Markov-chain witness shows, these are insufficient to rule out perfect (segment-level) properness. Consequently, our prior plan to get a constant-error bound via the segment LP is not viable.
  • For ring-level bounds, one-way r = 1 enjoyed special non-signaling equalities collapsing dependence on distance, which powered LGR’s bias method. In two-way, pair laws explicitly depend on distance, so that collapse is unavailable. This strongly suggests that non-signaling-only methods cannot give nontrivial constant-error bounds for 3-coloring in small two-way rounds.

Alternative analytic avenues for small fixed rounds (r = 2,3)
- Classical LCL lower bounds (no entanglement) imply that 3-coloring cycles needs ω(1) rounds (Θ(log* n)) in the LOCAL model. In particular, no 2- or 3-round (randomized) classical algorithm can succeed with probability 1. However, these results do not immediately give a uniform n-independent constant error lower bound. We suggest to target the following more modest, but auditable, goal:
  • Claim (target): For any fixed r, there exists ε(r) > 0 and k = k(r) such that any r-round classical algorithm (hence any quantum w/o entanglement) on C_n has P_success ≤ 1 − ε(r) for all n ≥ k.
  • Sketch of route: Use the round-elimination/indistinguishability toolkit to construct, for large enough n, two inputs (e.g., two rotations of a sparse “seed” pattern) whose r-views are locally indistinguishable at a positive fraction of nodes, yet whose global constraints force inconsistent local choices. A counting/averaging argument (e.g., via the hard-core potential method) yields a constant gap. This can be adapted to randomized algorithms by conditioning on a typical event of the private randomness. We will prototype this for r = 2.
- ϕ-LOCAL approach: In the φ-LOCAL model (Gavoille–Kosowski–Markiewicz 2009), strong view-based lower bounds hold (e.g., for MIS, 2-coloring); for 3-coloring cycles in small rounds the situation is open. We suggest to explore whether φ-LOCAL prohibits perfect 3-coloring in r = 2, by constructing two inputs with identical V_r-views at a positive fraction of edges but globally incompatible under properness. Any such lower bound would automatically apply to quantum models by Theorem 2 in their paper.

Concrete items for the verifier (auditable)
1) Insert into output.md an explicit Proposition: Under Definition 6, q(r,k) = 1 for all r ≥ 1, k ≥ 1; include the stationary proper Markov chain witness and a short verification of feasibility and objective = 1. This corrects the current suggestion that the LP may yield q < 1 in two-way.
2) State explicitly that, consequently, the segment LP cannot certify any constant-error lower bound in the two-way model (with or without entanglement). Corollary 10 remains formally correct, but vacuous with this LP (it upper-bounds by 1).
3) Fork the plan into two tracks:
   - Track A (product state): develop independence-augmented formulations. Start with a lifted linear relaxation (Sherali–Adams level-1/2) that adds auxiliary joint variables for disjoint cores and imposes linear consistency; test r = 2, k ∈ {10,…,16}. If any such relaxation already yields q < 1, extract a dual certificate (linear inequality). In parallel, set up a small non-linear system encoding exact factorization for a few geometries and solve by algebraic tools for k ≲ 12.
   - Track B (entanglement allowed): pivot away from segment LP; attempt direct two-way analogues of LGR’s ring-level “experiment” method tailored to r = 2 (design mixes of distances leveraging light-cone symmetries that must equalize certain expectations), or use φ-LOCAL/view indistinguishability to obtain constant-error lower bounds for fixed r.
4) Document a minimal analytic example showing how the stationary proper Markov chain satisfies the geometry-aware equality constraints (single-core, two-core, and t = 3 cores) for arbitrary placements with fixed (s,δ). This serves as a counter-model to avoid future regressions.

Minor clarifications to add in output.md
- Corollary 10: emphasize its scope is only as strong as the segment certificate; with Definition 6 alone, the bound is 1. Note the necessity of rotation (and potentially reflection) invariance in the initial state.
- Assumptions about uniformity: clarify that “uniform algorithm” implies the same local CPTP maps at each vertex and that rotations/reflections act covariantly; otherwise even geometry-aware equalities need not hold.

Next steps (short horizon)
- Formalize and insert the “q(r,k) = 1” proposition in output.md with the stationary Markov chain witness.
- Draft the lifted (Sherali–Adams type) linear relaxation for independence across two disjoint cores (t = 2) and their blocks, and implement constraint generation for r = 2, k up to 12; empirically test whether this already forces q < 1.
- Begin drafting a ring-level indistinguishability argument for r = 2: identify a finite family of local views and a probabilistic planting that forces a constant fraction of edges to be “locally ambiguous” in a way incompatible with 3-coloring.

## Round 0005 — 2025-08-27T16:05:16.178705Z

Headlines for this round
- We pivot from the trivialized segment LP (Definition 6) to independence-augmented formulations in the product-state regime, and to ring-level (experiment/φ-LOCAL) arguments in the entanglement-allowed regime.
- We isolate a simple, checkable linear constraint that excludes the Markov-chain witness once product-state independence is enforced: at any gap δ ≥ 2r+1, color-equality at the two sites must be 1/3 (under color symmetry), which contradicts the strictly stationary order-1 proper Markov chain’s correlation 1/3 + (2/9)(−1/2)^δ.
- We propose a concrete feasibility test (linear, color-symmetric, pair-independence relaxation) for r = 2 and moderate k that should already force objective < 1, yielding a rigorous certificate in the no-entanglement regime.
- For the entanglement-allowed regime, we outline a two-way, r = 2 adaptation of the LGR “experiments” method: construct weighted mixtures of match-at-distance indicators whose expectations must be equal under r-non-signaling locality but separate under properness, certifying constant error. We propose an auditable search plan.

Gaps and clarifications in output.md (minor)
- Theorem 2 (Independence beyond 2r): the current statement and proof are fine; if we later rely on higher-arity independence (for m ≥ 3 windows), note explicitly that the product initial state implies factorization over any collection of disjoint r-buffers by the same argument (pairwise disjoint supports ⇒ global factorization). Not essential but worth noting for later factorization constraints.
- Corollary 10 and Proposition 11: now consistent; Proposition 11 makes Corollary 10 vacuous with the current LP. We will add independence-augmented constraints (Track A) to resurrect nontrivial bounds in the product-state setting.

Track A (product-state, no entanglement): independence-augmented constraints
Idea A1 (minimal linear independence constraint under color symmetry)
- Independence premise: For any two cores A, B whose r-neighborhoods are disjoint in the segment (equivalently, inter-core gap δ ≥ 2r+1), the joint law on the cores must factorize. Under color symmetry (see below), this yields a linear identity for single-site cores:
  I1(δ): P[X_i = X_{i+δ}] = 1/3, for every interior pair (i, i+δ) with δ ≥ 2r+1.
- Why linear: By color symmetry (permutation of {1,2,3}), single-site marginals must be uniform, P[X_t = a] = 1/3 for all a. Factorization then implies P[X_i = X_{i+δ}] = ∑_a P[X_i=a]P[X_{i+δ}=a] = 3·(1/3·1/3) = 1/3.
- Justification for enforcing color symmetry as constraints: The objective (maximizing probability of properness) and all existing placement-equality constraints are invariant under the global action of S3 on colors; hence averaging any feasible solution over S3 yields a color-symmetric feasible solution with the same objective value. It is therefore valid (and can only strengthen the relaxation) to add linear constraints enforcing equal color marginals at all interior positions.

Lemma A (Order-1 proper chain violates I1 at any finite separation)
- Consider the stationary 3-state nearest-neighbor chain with no self-loops (P(i→i) = 0, P(i→j) = 1/2 for j ≠ i). Then for d ≥ 1:
  P[X_t = X_{t+d}] = 1/3 + (2/9)(−1/2)^d.
  Proof sketch: The transition matrix has eigenvalues 1 and (−1/2) (multiplicity 2). One obtains P^d(i→i) = 1/3 + (2/3)(−1/2)^d and P^d(i→j) = 1/3 − (1/3)(−1/2)^d for i ≠ j. Average over the stationary law to get the stated equality probability. For every finite d, this differs from 1/3, so the chain is not independent at separation d.
- Consequence: any feasible family supported on fully proper strings and strictly stationary with nontrivial finite-range correlations fails I1 at some δ; imposing I1 (for δ ≥ 2r+1) cuts off the Markov-chain witness.

Formulation A2 (linear, color-symmetric, pair-independence relaxation)
- Variables: p_ψ for ψ ∈ Σ^k as in Definition 6.
- Enforce:
  • Color symmetry: For every interior position u, P[X_u = 1] = P[X_u = 2] = P[X_u = 3] = 1/3 (linear constraints in p_ψ).
  • Placement invariance within fixed geometries (Definition 6, restricted to t = 1 and t = 2 core families): single-core (s = 1), and two-core (s = (1,1)) at gaps δ ∈ {2r+1, 2r+2, …}, across all interior translations.
  • Independence at large gaps (pair level): For each such δ, impose I1(δ): P[X_i = X_{i+δ}] = 1/3 (as a single linear equality for each δ, using color symmetry).
  • Optionally, refine to block-level: For s = 2 cores (length-2 blocks) with gap δ ≥ 2r+1, enforce P[(block1) = (block2)] = ∑_{ξ ∈ Σ^2} P[block1 = ξ] P[block2 = ξ]; under color symmetry and single-core uniformity this yields a finite set of linear identities involving diagonal sums of pair-block marginals. (We will start with single-site cores for robustness.)
- Objective: as before, maximize the probability of internal properness.
- Claim (target to check computationally): For r = 2 and some moderate k (e.g., 11 ≤ k ≤ 15), the above linear system has optimum strictly less than 1. Intuition: Full support on proper strings combined with translation invariance of pair laws at large gaps forces equality-probability 1/3 for those pairs, which is incompatible with any measure supported entirely on proper strings satisfying the interior invariances.

Auditable test plan A3 (r = 2, feasibility at objective 1)
- Fix r = 2. Consider k ∈ {11, 12, 13, 14, 15}.
- Build the linear system described in A2 with:
  • Single-core invariance (t = 1) and two-core invariance (t = 2) for gaps δ ∈ {5,6} (since 2r+1 = 5), across all interior placements.
  • Color symmetry constraints yielding uniform marginals.
  • Independence equalities I1(5) and optionally I1(6).
- Solve the LP feasibility with the additional equality “objective = 1” (i.e., demand probability 1 on proper strings) or, equivalently, check whether any p_ψ supported on proper strings satisfies the linear constraints. If infeasible, the conclusion is: in the product-state regime, objective 1 is impossible already under these (linear) constraints, hence the true optimum q_prod(r,k) < 1.
- Certificate: Invalidate objective = 1 with a dual ray (Farkas certificate), archiving the precise linear combination of constraints leading to a contradiction with 1{proper}.

Why a fully proper, translation-invariant measure cannot meet I1 (intuition)
- Any measure supported on proper strings induces for each finite gap δ a pair-law P(X_i, X_{i+δ}) which, under interior translation invariance (two-core constraints) and mild mixing, typically deviates from the product measure at δ finite. The order-1 chain demonstrates the unavoidable alternation: equality-prob oscillates around 1/3 with amplitude (2/9)(1/2)^δ. Imposing P_equal(δ)=1/3 at δ = 5,6 forces structure incompatible with “always proper” and two-core invariance. The LP feasibility test A3 makes this precise.

Extending A2 to stronger (still linear) independence surrogates
- Fréchet bounds sharpening: For each δ ≥ 2r+1 and color a, add bounds P[X_i = a, X_{i+δ} = a] ∈ [max(0, 2/3−1), min(1/3, 1/3)] = [0,1/3] with summed diagonal fixed to 1/3. These are necessary consequences of independence and color symmetry, and improve robustness.
- Multi-gap constraints: Impose I1(δ) for multiple δ in {5,6,7}. The stationary proper Markov chain fails all of them; a general proper distribution would struggle to satisfy them simultaneously.

Track B (entanglement allowed): r = 2 ring-level “experiments”
Idea B1 (two-way analogue of LGR’s distance-mix experiment)
- Objective: Construct two “experiments” (randomized procedures that pick a random node v and a random distance d ∈ D_1 or D_2 with specified weights, then ask whether colors at v and v+d match) whose expected outcomes must be equal under any r-round non-signaling strategy (by locality and rotation invariance), but differ on any proper 3-coloring of the cycle. Any strictly positive separation yields a constant-error lower bound.
- Why equality under r-non-signaling? In one-way, LGR exploited that pair distributions at non-adjacent nodes are independent of distance. In two-way, this fails. However, by designing D_1, D_2 and how we select the pair (v, v+d) so that both experiments induce the same law of the r-views seen by the two sites and their r-neighborhoods (including the gap size), the non-signaling principle (Heisenberg localization) enforces equality of the corresponding match probabilities.
- Candidate construction: r = 2. Choose D_1 and D_2 supported on distances ≥ 3 to avoid adjacency, with mixtures of distances of different parity to exploit alternating behavior of proper colorings (as in LGR’s pair-correlation alternation). Example sketch: Let D_1 put mass on {5,7,9} and D_2 on {6,8,10} with weights tuned so that the multiset of r-neighborhood isomorphism types (including the informed gap-length) seen by the pair in Experiment 1 equals that for Experiment 2. We will solve for weights by equating counts of r-view types.
- Proper-coloring separation: In any proper 3-coloring of the cycle, P[X_v = X_{v+d}] alternates with parity of d (1/3 ± c·(2)^{−d} in long cycles, or exactly computable on finite cycles). Thus an odd–even mixture typically yields a positive bias between the two experiments. If this bias can be bounded away from 0 uniformly in n for some (D_1,D_2), we obtain a constant error bound.

Auditable search plan B2
- Fix r = 2 and a cycle length n moderately large (e.g., n = 4m + O(1), m ≳ 50). Enumerate all r-view isomorphism types for unordered pairs (u,v) at distance d up to some cap, with the view capturing: local degrees (trivial for cycles), the labeled positions of u,v and their r-neighborhoods, and the explicit value d, all modulo rotation.
- Construct a linear system requiring that the multiset of view types sampled by Experiment 1 (weights w_1(d)) equals that of Experiment 2 (weights w_2(d)). Solve for nonnegative weights w_1, w_2 supported on a small distance set (e.g., up to 10 or 12). If a feasible pair exists, compute the induced gap between match probabilities on proper 3-colorings. If positive and uniform in n (beyond a threshold), this yields the constant-error bound.
- If no small-support solution exists, enlarge the distance set and repeat. We expect small supports to suffice, by analogy with LGR’s n = 11 construction.

Small calculations to support B1
- In any proper 3-coloring C_n, the probability (over uniform v) that X_v = X_{v+d} equals 1/3 + α(d,n), with α(d,n) alternating in parity and |α(d,n)| ≥ c·(2)^{−d} uniformly over n ≥ 2d + 1 (constant c > 0). This follows from the same eigen-analysis as Lemma A, adapted to cycles (edge effects vanish for d ≪ n). Thus mixtures of odd and even d’s yield a nonzero bias.

Obstacles and considerations
- Independence is nonlinear; our linear relaxation (I1) relies on enforcing color symmetry and uniform single marginals. While justified by symmetry of the objective/constraints, we will explicitly note in the solver and certificate that we are working under a color-symmetrized subspace; any bound < 1 then holds a fortiori.
- For Track B, the critical step is the view-equivalence argument: we must ensure the two experiments induce the same distribution over the r-views of the selected pair (including gap length). This is a finite combinatorial check for given (D_1,D_2) and r.

Concrete next steps (auditable)
1) Implement LP test A3 (r = 2):
   - Build constraints for k ∈ {11,12,13,14,15} with single-core and two-core placement invariance, color symmetry, and I1(5) (and optionally I1(6)).
   - Check feasibility with objective = 1 (support on proper strings). If infeasible for some k, archive the dual Farkas certificate (linear combination of constraints ⇒ contradiction).
   - If feasible persists, augment with I1(6) and/or block-level linear constraints as described.
2) Document Lemma A (pair-equality formula) and add to notes as a reusable analytic tool for excluding Markov-type correlated constructions when independence constraints are present.
3) Start the B2 search: generate r = 2 pair-view types on cycles and solve for two mixtures (D_1,D_2) with equal view-type distributions. Begin with distances up to 10. If a feasible pair exists, compute separation on proper colorings and quantify an n-independent ε > 0.
4) Optional: formulate a small nonlinear feasibility problem enforcing exact factorization for δ ∈ {5,6} (P(A ∩ B) = P(A)P(B) for all singleton-color events A,B), and solve with MIP for k ≤ 12 to cross-check LP conclusions.

Why this is promising
- The linear independence surrogate I1 is extremely low-cost and already incompatible with any fully proper, strictly stationary nearest-neighbor model; combining I1 with translation-invariance constraints should suffice to cut off objective 1. A dual infeasibility certificate would be a clean, auditable product.
- The r = 2 experiment approach stays squarely within non-signaling/φ-LOCAL reasoning and avoids segment trivialization; it mirrors LGR’s success at r = 1 while respecting that two-way views depend on distance.

Deliverables for the next round
- Report of LP feasibility tests (A3) including one explicit k with “objective=1 infeasible” and the dual ray.
- First candidate (D_1,D_2) for r = 2 with equal r-view distributions, plus the computed separation on proper colorings (or a report that no small-support pair was found and an updated plan).

## Round 0006 — 2025-08-27T18:54:52.680518Z

Headlines for this round
- We corrected and consolidated the analytic underpinnings for the product-state regime and adjusted the plan to avoid unsound linearizations. The key shift is to formulate a sound, finite, nonlinear feasibility test (MIQCP/QCQP) at objective value 1 based on a single stationary 6-block distribution, which already encodes: (i) perfect properness on all adjacent edges in the window; (ii) shift-consistency (Kolmogorov consistency for a stationary 1D process); and (iii) exact pair-independence at lag δ = 5 (the 2r+1 separation for r = 2). This test is strictly necessary for any r-round product-state output and will be attempted with global nonconvex solvers (BARON/Couenne/SCIP-NLP). If infeasible, it yields a clean, auditable contradiction to perfect success.
- We acknowledge the verifier’s cautions: (1) block-level independence is inherently nonlinear; (2) color-symmetry averaging is not w.l.o.g. under independence constraints; (3) any parity-type intuition about pair equality for each fixed proper coloring is false; (4) ring-level “distance mix” experiments do not carry over straightforwardly to r = 2 as matching r-views forces equality of expectations for r-local algorithms. We therefore pivot away from linearizations relying on color symmetry and from distance-mix experiments for r = 2 in the near term.

Corrections and clarifications (to be reflected in output.md)
- Markov-chain two-point correlation. We have already corrected the equality-probability for the stationary 3-state no-self-loop chain to P[X_t = X_{t+d}] = 1/3 + (2/3)(−1/2)^d (Lemma 14), which now matches d = 1 (value 0) and d = 2 (value 1/2), and excludes the witness as soon as any lag-δ pair independence is imposed (Corollary 15).
- No linear block-level independence. Our earlier suggestion that length-2 block-independence becomes linear under color symmetry is incorrect in general; the independence equalities remain bilinear (products of marginal probabilities) even with symmetric marginals (except in the degenerate single-site P_equal case under uniform marginals). We will not employ such linearizations.
- Color-symmetry w.l.o.g. is not available once independence constraints are in play. A global random color-permutation can destroy unconditional independence across distant sets. We therefore refrain from imposing color-symmetry constraints in independence-augmented models unless we separately prove their admissibility.
- View-equivalence experiments for r = 2. Matching the distribution of r-views exactly forces equality of expectations for any r-local Heisenberg-evolved effect (by non-signaling). Hence the r = 1 “distance mix” trick does not directly extend to r = 2. We do not pursue this path further until/unless we identify a different observable (or sampling scheme) whose r-view distributions can be equalized while still forcing separation on proper colorings.

A sound nonlinear feasibility test for the product-state regime (r = 2)
Goal. Prove that perfect success (objective = 1) on a long enough segment is impossible under exact independence across disjoint r-neighborhoods (i.e., lag-5 independence), even before invoking amplification. This yields the desired constant-error bound for 2-round two-way LOCAL algorithms without entanglement (by Corollary 3) once a finite k is certified.

Key modeling choice: a single stationary 6-block distribution
- Variables: For a 1D stationary process (X_t) over Σ = {1,2,3}, introduce a single 6-block distribution t(ζ) for ζ ∈ Σ^6. This is interpreted as the common distribution of (X_i,…,X_{i+5}) for all i in the interior of a long segment. Number of variables: 3^6 = 729.
- Linear constraints:
  1) Nonnegativity and normalization: t(ζ) ≥ 0, ∑_ζ t(ζ) = 1.
  2) Shift-consistency (Kolmogorov consistency): For all α ∈ Σ^5, let M_1(α) = ∑_{ζ: ζ_1..ζ_5=α} t(ζ) and M_2(α) = ∑_{ζ: ζ_2..ζ_6=α} t(ζ). Impose M_1(α) = M_2(α). This enforces stationary consistency of length-5 marginals across overlapping 6-windows.
  3) Perfect properness on adjacent edges within the window: For j = 1,…,5 and a ∈ Σ, ∑_{ζ: ζ_j = ζ_{j+1} = a} t(ζ) = 0. (No equal adjacent colors on any interior edge in the 6-window.)
- Nonlinear (bilinear) independence constraints at lag δ = 5:
  Let m(a) = ∑_{ζ: ζ_1 = a} t(ζ) (single-site marginal; stationarity implies the same for position 6), and p(a,b) = ∑_{ζ: ζ_1 = a, ζ_6 = b} t(ζ) (pair marginal across lag 5 within the 6-block).
  Impose for all a,b ∈ Σ: p(a,b) = m(a) · m(b).
  This encodes exact pair-independence at separation 5 (which is the 2r+1 threshold for r = 2) and is a necessary condition for any product-state r-round output process.

Why this is sound (and minimalist)
- Stationarity and shift-consistency: These are necessary in the interior by interior-placement invariance (Definition 6 specialized to single frames and their shifts) and by uniform channels across vertices. Using a single 6-block distribution is the most compact way to enforce both translation invariance and Kolmogorov consistency.
- Perfect properness: Objective = 1 on sufficiently long segments implies no equal-color adjacencies anywhere; imposing it on every adjacent pair inside the 6-block is necessary.
- Pair-independence at lag 5: In the product-state regime, independence across sets whose r-neighborhoods are disjoint (Theorem 2; Proposition 13) implies independence of (X_i, X_{i+5}). Since the 6-block covers positions i and i+5, enforcing p(a,b) = m(a) m(b) within the window is necessary.
- No color-symmetry assumed: We avoid any averaging or symmetry constraints that could invalidate independence.
- Feasibility at value 1 implies existence of a stationary measure on bi-infinite strings consistent with all constraints (Kolmogorov extension applies under shift-consistency and positivity). Thus, if the MIQCP is infeasible, perfect success is impossible for any product-state r-round process.

Practical MIQCP formulation and solvers
- Problem size: 729 continuous variables; linear equality constraints: 3^5 shift constraints (243) plus properness constraints (5·3 = 15) plus normalization; nonnegativity; and 3^2 = 9 bilinear equalities p(a,b) − m(a)m(b) = 0.
- Solvers: BARON, Couenne (via IPOPT/Bonmin), SCIP-NLP with ANTIGONE or Juniper, or Gurobi/CPLEX with nonconvex quadratic support (MIQCP) can handle this scale. Our target is an infeasibility certificate. If the solver returns feasible solutions, we can inspect them and adjust (e.g., add δ = 6 constraints by moving to a 7-block with analogous structure) or tighten via additional necessary constraints (e.g., pair-independence for both boundary pairs (1,6) and any extra far-separated pair inside a 7-block).
- Extension knobs:
  • Add lag-6 independence (δ = 6) by moving to a single 7-block distribution (3^7 = 2187 variables) and enforcing p(1,7) = m(1)m(7).
  • Add multi-lag constraints (δ = 5 and 6) to preclude pathological constructions.

Why we expect infeasibility
- The stationary “no self-loop” Markov chain shows that properness alone is easy. However, that chain exhibits nonzero correlations at lag 5: P_equal(5) = 1/3 + (2/3)(−1/2)^5 ≠ ∑_a m(a)^2 under any nontrivial marginal m(·) consistent with perfect properness. The MIQCP mandates exact independence at lag 5, which the chain fails, and stationarity/shift-consistency constrain the space of candidates enough that we expect no distribution can satisfy all three: (i) perfect properness for all 5 interior edges; (ii) stationarity with shift-consistency; (iii) lag-5 pair independence.

Soundness boundary (why this suffices for Corollary 3 if infeasible)
- If the MIQCP is infeasible, then no stationary r-round product-state output process can be perfectly proper on all edges while obeying lag-5 independence. A fortiori, no interior-invariant segment distribution induced by an r-round product-state algorithm can have objective value 1 on a sufficiently long segment. By Corollary 3, this yields a constant-error lower bound and, with independence, exponential decay for cycles with stride k + 2r.

Actionable next steps (auditable)
1) Implement the stationary 6-block MIQCP (r = 2):
   - Variables: t(ζ), ζ ∈ Σ^6.
   - Linear constraints: nonnegativity, normalization, shift-consistency (243 equalities), properness on 5 interior edges (15 equalities).
   - Nonlinear constraints: 9 bilinear equalities p(a,b) = m(a)m(b).
   - Solver: BARON or Couenne; report feasibility status and, if infeasible, the solver’s proof log/statistics for audit.
2) If 6-block is feasible, move to 7-block with lag-6 independence added; repeat.
3) If still feasible, add both δ = 5 and δ = 6 independence in a single 7-block formulation. If infeasible anywhere, record and archive the exact model file and solver transcript.
4) (If needed) As a cross-check, attempt to construct an explicit candidate distribution numerically (e.g., via alternating projections) to see whether the constraints can be satisfied approximately; this can guide which additional necessary constraints to add.

Small gaps or missing justifications in output.md
- Color symmetry comments. The current output.md correctly avoids using color-symmetry to linearize independence, but it would help to add a short remark stating explicitly that color-symmetry is not w.l.o.g. under independence constraints (cf. our Corrections section), to prevent accidental overuse of symmetry in future modeling.
- Experiments for r = 2. The text mentions the “experiments” route only in a high-level remark; given the obstacles identified (equalizing r-view distributions forces equality of expectations), we suggest adding a note that the r = 1 distance-mix method does not directly carry to r = 2 two-way, thereby motivating our focus on product-state MIQCP.

Why this plan is promising
- The 6/7-block stationary MIQCP precisely encodes only necessary conditions (stationarity, properness, and exact lag-independence) and avoids any extraneous modeling assumptions. A single-block variable drastically reduces dimensionality while preserving shift-consistency and interior invariance. If infeasibility at objective = 1 is certified, it yields a clean lower bound in the product-state regime compatible with our amplification template.

Appendix: explicit constraints summary for the 6-block MIQCP
- Variables: t(ζ), ζ ∈ Σ^6.
- For α ∈ Σ^5: ∑_{ζ: ζ_1..ζ_5=α} t(ζ) − ∑_{ζ: ζ_2..ζ_6=α} t(ζ) = 0.
- For j = 1,…,5 and a ∈ Σ: ∑_{ζ: ζ_j = ζ_{j+1} = a} t(ζ) = 0.
- ∑_ζ t(ζ) = 1; t(ζ) ≥ 0.
- For a ∈ Σ: m(a) = ∑_{ζ: ζ_1 = a} t(ζ).
- For a,b ∈ Σ: p(a,b) = ∑_{ζ: ζ_1 = a, ζ_6 = b} t(ζ) and enforce p(a,b) − m(a)m(b) = 0.
- (Optional convenience) Eliminate p(·,·) by writing constraints directly as ∑_{ζ: ζ_1=a, ζ_6=b} t(ζ) = (∑_{ζ: ζ_1=a} t(ζ)) (∑_{ζ: ζ_1=b} t(ζ)).

We will proceed to implement item (1) immediately and report feasibility status and solver certificates in the next round.

## Round 0007 — 2025-08-27T19:43:46.832462Z

Headlines for this round
- We concretize the r = 2 product-state feasibility test as a compact MIQCP on proper 6-words (3·2^5 = 96 variables instead of 3^6 = 729) with explicit constraint counts, and give a minimal, auditable recipe to implement and certify infeasibility. We also outline a 7-block (L = 7) escalation that enforces both lag-5 and lag-6 independence, and argue why these two lags are the only nontrivial pair-independence constraints available within a single block for r = 2.
- We add a useful reduction: represent the 6-block variables by increment sequences S_t ∈ {±1} and record combinatorial counts by end-point residue Δ ∈ {0,±1}, which can be used as linear statistics to sanity-check solver outputs and to derive necessary equalities implied by independence.
- We point out a small gap to tighten in output.md Corollary 18: to turn infeasibility-at-1 into an explicit quantitative bound q < 1, one should solve an optimization variant (maximize the 5-edge properness probability under the same constraints) and record its optimum as q.

Ideas and modeling details (towards an auditable MIQCP)
- Proper 6-words enumeration. Any proper 6-word ζ ∈ Σ^6 is uniquely described by (X_1 = a, S_1,…,S_5) where S_j ∈ {±1} encodes X_{j+1} = X_j + S_j (mod 3) and S_j ≠ 0 encodes properness. Hence the proper 6-words are exactly 3 · 2^5 = 96, and t(ζ) = 0 for all other 729 − 96 words. We strongly recommend enumerating these 96 words as the support and declaring a variable p(a,s) for each pair (a ∈ Σ, s ∈ {±1}^5); all sums below are then finite over this set. This reduces scale and solver branching.
- Shift-consistency (stationarity). For α ∈ Σ^5, the length-5 marginal bound at positions 1..5 equals that at positions 2..6. In the 96-variable encoding, this amounts to linear equalities equating the probability of any fixed 5-word at (1..5) to the same 5-word at (2..6). Counting constraints: there are 3^5 = 243 such equalities; many are vacuous (any 5-word with equal adjacencies has zero mass by properness), but we keep them for generality.
- Single-site marginals (optional explicit form). Although implied by shift-consistency, for numerical robustness and audit, add linear equalities that all single-site marginals are equal across positions 1..6; in the 6-block formulation this is just 3·(6−1)=15 redundant equalities.
- Independence at lag 5 (positions 1 and 6). In the 96-variable encoding, define m(a) := ∑_{s} p(a,s), and p(a,b) := ∑_{s: a + Σ s ≡ b (mod 3)} p(a,s). Enforce the nine bilinear equalities p(a,b) = m(a) m(b) for all a,b ∈ Σ. These nine constraints are the only nontrivial pair-independence relations valid within a 6-block for r = 2. (Justification: for r = 2, the only pair of sites in {1,…,6} whose 2-neighborhoods are disjoint is {1,6}. Every other pair shares at least one site in their 2-neighborhoods; see the neighborhood spans below.)
  • N_2({1}) = {1,2,3}; N_2({6}) = {4,5,6} on a line-indexed block; they are disjoint.
  • Any other pair {i,j} with 1 ≤ i < j ≤ 6 has j − i ≤ 4 ⇒ N_2({i}) ∩ N_2({j}) ≠ ∅.
- Constraint counts and sizes. With variables p(a,s) over 96 support atoms:
  • Nonnegativity (96) and normalization (1).
  • Properness is built in by support restriction; no extra equalities needed for ζ_j ≠ ζ_{j+1}.
  • Shift-consistency equalities: up to 243 linear (many redundant), plus optional 15 single-site equalities.
  • Lag-5 independence: 9 bilinear equalities.
  This is a compact MIQCP: roughly 96 variables, ~260 linear equalities/inequalities, and 9 bilinear equalities.

Combinatorial sanity checks (increment-sum residue counts)
- For any fixed starting color a, the end color b ∈ Σ after 5 steps depends only on the residue Δ ≡ Σ_{j=1}^5 S_j (mod 3): b ≡ a + Δ (mod 3). The number of increment sequences yielding each residue is independent of a:
  • c_0 := |{s ∈ {±1}^5 : Σ s ≡ 0 (mod 3)}| = 10 (either one −1 and four +1, or four −1 and one +1),
  • c_{+1} = c_{−1} := |{s : Σ s ≡ ±1 (mod 3)}| = 11.
  These counts provide a simple check on any candidate t: if the solver reports exact independence with m, then aggregated frequencies by residue should match the bilinear target m(a)m(b) totals once mapped by Δ.
- We do not assume that increments are i.i.d. or unbiased; the residue counts are only combinatorial support sizes. However, they give a helpful oracle to diagnose trivial bugs (e.g., if summed probabilities over residue-classes do not match the independence target totals m(a)m(b)).

Escalation to L = 7 (enforcing both lag 5 and lag 6 independence)
- For r = 2, independence holds for any pair of sites whose graph-distance ≥ 5. Within 7 sites, the pairs (1,6) and (1,7) both satisfy this. Hence, at L = 7 we can add another 9 bilinear equalities enforcing independence for (X_1, X_7).
- We recommend the following staged plan: (i) attempt L = 6; if feasible, (ii) move to L = 7 and enforce both lag-5 and lag-6 independence; if still feasible, (iii) consider L = 8 or 9 to add an additional disjoint far pair internal to the window, or jump to L = 11 to encode triple independence of sites {1,6,11} (all pairwise distances = 5).

Optimization variant for an explicit q < 1 (to tighten Corollary 18)
- As noted by the verifier, Corollary 18 certifies impossibility of perfect properness in 6-blocks if the MIQCP is infeasible. To extract a quantitative bound, we propose solving the nonconvex optimization variant: maximize P[ζ_j ≠ ζ_{j+1} for j = 1,…,5] under the same constraints (i)–(iv). The optimum, denoted q_6, directly yields a constant-error bound with stride k = 6 + 2r = 10 (in the no-entanglement regime) via Corollary 3. If the optimum is strictly less than 1, we record (r=2, k=6, q=q_6) as a certified bound.
- Practicality: with the 96-variable encoding, the objective simplifies to ∑_{(a,s)} p(a,s) = 1 (when perfect properness), but for the optimization variant we lift the support to all 3^6 blocks and keep the properness indicator in the objective. Alternatively, one can keep the 96 support but relax independence into inequalities to detect how far from 1 we can get; we prefer the direct optimization over the full alphabet for clean interpretability.

Toy contradiction heuristics (why we expect infeasibility already at L = 6)
- For any stationary process with zero adjacent equalities, the increment representation forces X_{t+5} ≡ X_t + Σ_{j=0}^4 S_{t+j} (mod 3). Lag-5 independence requires the distribution of the modular sum Σ_{j=0}^4 S_{t+j} to be independent of X_t and to induce the same marginal m on X_{t+5}. In particular, for any a, the vector (P[Σ≡0|X_t=a], P[Σ≡1|X_t=a], P[Σ≡2|X_t=a]) must equal (m(a), m(a+1), m(a+2)) up to cyclic shift. Combined with shift-consistency over length-5 blocks, this places strong linear constraints on the 5-block marginals which are difficult to satisfy simultaneously with perfect interior properness (these constraints are encoded implicitly in the MIQCP).
- In the order-1 Markov special case with no self-loops, independence at lag 5 implies P^5 has all rows equal to m, which forces the non-Perron eigenvalues to be zero; no such nonnegative stochastic matrix with zeros on the diagonal exists. While our MIQCP allows non-Markov order 5 processes, this calculation motivates why lag-5 independence plus perfect properness is likely impossible already at L = 6.

Obstacles and why we defer a fully analytic contradiction
- The increment-sum residue argument shows all three residues are combinatorially possible with 5 steps; hence residue-based counting alone does not preclude independence. A direct analytic contradiction seems to require exploiting the full 6-block sliding consistency; we therefore prioritize a solver-based infeasibility certificate.

Next steps (checkable and auditable)
1) Implement the 96-variable MIQCP (L = 6):
   - Variables p(a,s) on proper 6-words; nonnegativity and normalization.
   - Shift-consistency across positions 1..5 and 2..6; optional explicit single-site equalities.
   - Lag-5 independence for (X_1, X_6): ∑_{s: a+Σs≡b} p(a,s) = (∑_s p(a,s))(∑_{a′,s′: a′=b} p(a′,s′)).
   - Solver: BARON, Couenne/Bonmin, or SCIP-NLP (nonconvex). Archive model file and solver log. Record either an infeasibility proof or a feasible solution.
2) If feasible, escalate to L = 7 and add the independent pair (X_1, X_7) equalities (another 9 bilinear constraints). Repeat step (1).
3) If infeasible at value 1, run the optimization variant to compute q_6 < 1 under the same constraints; record (r=2, k=6, q_6). Add the optimization statement to output.md to strengthen Corollary 18 quantitatively.
4) Cross-checks: implement the residue-count sanity checks on any solver solution; verify single-site marginals coincide across positions; verify that pair counts match independence totals.
5) Optional escalation: if L = 7 remains feasible at value 1, consider L = 11 and triple independence for sites {1,6,11}; or strengthen with linear necessary inequalities derived from Fréchet bounds for the (X_1,X_6) pair (diagonal sums and marginal intervals), though these are implied by the bilinear equalities at feasibility.

Gaps or clarifications to tighten in output.md
- Corollary 18 (quantitative bound). Add a sentence that to obtain an explicit q < 1, we solve the nonconvex optimization variant maximizing the probability of the event “all L−1 interior adjacencies are proper” under constraints (i)–(iv), and denote the optimum q_L. This produces a certified (r,k=q-dependent) bound via Corollary 3.
- Numerical reproducibility. It may help to state explicitly that the 6-block MIQCP can be reduced to 96 variables by restricting to proper 6-words, with 9 bilinear independence constraints, and ~243 sliding equalities, to guide independent verification.

References for this round
- Structural MIQCP: output.md Proposition 16 (single-block reduction), Lemma 17 (Kolmogorov/Markov extension), Corollary 18 (implication for lower bounds).
- Independence thresholds and φ-LOCAL discussions: 2403.01903 (Akbari et al. 2024), quantum.pdf (Gavoille–Kosowski–Markiewicz 2009).

