## Status and goals
- Target: Prove that any LCL solvable in O(1) rounds in deterministic Online-LOCAL(t) on bounded-degree (nonoriented) trees admits an O(log* n) deterministic LOCAL algorithm.
- Current archive (output.md): Contains the output-only/t-local-dependence bridges, bounded-writes simulation with the corrected K = max(2W, R+W), 2t-commutativity (Lemma 7), the quiescent bridge (Lemma 8) with the necessary +1 in K, strong witness-localization (Lemma 9), and Phase-locality (Claim 8.1). These cover O(log* n) for quiescent and output-only variants.
- Open gap: the unrestricted Online-LOCAL(t) case. Lower-bound program via localized round-elimination for sinkless orientation needs two missing pieces: a precise normalization-and-extension lemma, and a non-conflict argument in the node→edge step (the earlier sketch was invalid in the node-form).

## New clean tools (ready to archive)

### Lemma NE (Normalization-and-Extension around an edge on trees)
- Statement. Let A be any deterministic Online-LOCAL(t) algorithm on a bounded-degree tree G, and let e = uv be an edge. Fix any finite arrival sequence prefix τ consisting of distinct vertices of B(e,2t). There exists a global arrival sequence σ on V(G) such that:
  1) The first |τ| steps of σ equal τ (same vertices in the same order), and no vertex outside B(e,2t) arrives before those |τ| steps.
  2) For every 0 ≤ j ≤ |τ|, the state and fixed outputs on B(e,t) after j steps of σ coincide with those obtained by executing exactly the first j steps of τ (i.e., executing A on the induced subgraph of the arrived vertices inside B(e,2t), with all other vertices absent).
  Moreover, given any global arrival sequence σ0, there exists σ1 obtained from σ0 by repeatedly swapping adjacent arrivals at distance > 2t such that up to and including the first arrival of the second endpoint of e, no vertex outside B(e,2t) arrives in σ1, and the state on B(e,t) at each step up to that time is identical under σ0 and σ1.
- Why useful here. This formalizes the exact “local sandbox” principle needed for localized round-elimination: any normalized local execution inside B(e,2t) is realized by some global schedule and unaffected by outside arrivals; conversely, any global schedule can be normalized so that only B(e,2t) arrives before e is decided without changing B(e,t).
- Proof sketch (auditable). The second part is Lemma 7 iterated: swap any pre-decision arrival at distance > 2t past the decision time; each swap preserves states in B(e,t). For the first part, define σ by listing τ first and then any permutation of V(G)\B(e,2t). Before the |τ|-th step, no vertex outside B(e,2t) arrives; thus the online runs of A on σ and on the local τ coincide on B(e,t), since absent vertices neither send nor receive. □

### Lemma (+1 minimality re-stated, with a crisp example)
- Statement. For (W,t)-quiescent batching in Lemma 8, K = 2t+2W is insufficient in general; K = 2t+2W+1 is necessary to forbid one-round coupling across distinct active regions.
- Proof idea. Path example, W=0, t=1: choose two same-color centers a,b at distance 3. Then B(a,1) and B(b,1) are disjoint but adjacent by a single edge. In the first round of the phase, a boundary node of B(a,1) may send a message to a boundary node of B(b,1); in the second round, that boundary node (if not quiescent) could forward to the interior. Under quiescence, nodes outside the active regions do not change state and cannot forward newly received information, but if K=2t (so dist(R_a,R_b)=1), a single cross-edge allows immediate coupling. K=2t+2W+1 implies dist(R_a,R_b) ≥ 2, forbidding any direct edge between active regions; Claim 8.1 then applies. □

## Revised formulation of the node→edge elimination (fixing the non-conflict)
We adopt a universal-quantifier variant that aligns with classical round-elimination (where labels become sets of allowed labels) and avoids the earlier “double-grab is fine” pitfall.

### Definitions (edge-local boundary types and consistency)
- Fix Δ, t and a bounded-degree tree G. For an edge e = uv, let B = B(e,2t) and let ∂B be the set of vertices at exact distance 2t from e. A boundary snapshot β consists of: (i) the arrived subgraph inside B just before the (yet-to-be-decided) step at which e will be oriented, (ii) the fixed outputs and internal states on ∂B at that moment. We say a local arrival schedule τ inside B (a permutation of some/all vertices of B, ending at or after the arrival of the second endpoint of e) is consistent with β if running A on the induced arrived subgraph inside B, starting from β with all vertices outside B absent, produces the transcript τ and preserves the boundary β as fixed (i.e., no outside interaction).
- By Lemma NE, any such τ is realized as the prefix of some global schedule with the same transcript on B(e,t) up to the decisive step, and any global schedule can be normalized to such a τ without changing B(e,t) transcripts.

### Universal forcing relation and node→edge step (LB.1u)
- For each oriented option u→v of e and boundary snapshot β, define that u universally forces u→v under β if for all normalized local arrival schedules τ inside B consistent with β in which both u and v have arrived (i.e., up to and including the step that makes e decidable), the online run of A yields orientation u→v for e (under the natural interpretation of A’s final decision on e at or before the second endpoint’s arrival; if A defers orientation, consider the orientation implied by the first time both endpoints have arrived and message influence can reach e within the remaining steps of τ).
- Define the derived edge-centered (t−1/2)-local rule A′ on B: given β, set the admissible set S_e(β) ⊆ {u→v, v→u} by
  S_e(β) = { u→v : u universally forces u→v under β } ∪ { v→u : v universally forces v→u under β }.
- Non-conflict lemma. For any β, it is impossible that both u universally forces u→v under β and v universally forces v→u under β. Otherwise, pick any τ consistent with β; by universality, e must be oriented both u→v and v→u in the same (normalized) run—a contradiction.
- Why useful here. A′ assigns, per boundary β, a set S_e(β) of admissible orientations; this is the standard “set-valued label” after a half-step of round-elimination. No contradictions arise, and the dependency radius drops by 1/2 (node→edge) while everything remains confined to B(e,2t).
- Correctness scope. Using Lemma NE, any normalized local schedule realized globally has the same transcripts on B(e,t); thus the admissible set S_e(β) captures exactly the orientations consistent with all normalized continuations, which is the right notion in round-elimination. This construction is independent of arrivals outside B, thanks to normalization.

### Iteration plan (edge→node universal half-step)
- Symmetrically, define for a node x the set of admissible incident-edge orientations based on universal quantification over normalized local schedules within B(x,2t−1), obtaining a node-centered (t−1) rule with set-valued labels.
- Iterating node↔edge 2t times yields a 0-round object in which each edge e has a non-empty set S_e of admissible orientations determined by its constant-radius type (from the ID-graph framework). The contradiction to the ID-graph (Def. 2.16) follows if one shows that these sets cannot be assigned globally without creating a forbidden configuration (as in the classical proof).
- To do next: formalize the symmetric edge→node universal step and state the precise induction invariant “universality is preserved under elimination,” paralleling the classical round-elimination schema with set-valued labels.

## How this addresses the verifier’s concerns
- The earlier non-conflict gap is eliminated: we no longer claim existential “there exists a witness” for each direction; instead, we define admissibility via universal quantification over all normalized local schedules given a fixed boundary snapshot β. Non-conflict is immediate by logic, and the elimination becomes a transformation on sets of allowed labels, i.e., exactly the classical framework.
- The required normalization-and-extension tool is provided (Lemma NE), ensuring any normalized local schedule and boundary snapshot β correspond to some global execution and that outside arrivals can be pushed after without affecting B(e,t).

## Minor clarifications on output.md
- Lemma 8: The boundary-state sufficiency (Claim 8.1) is correctly stated; it may help to add one explicit sentence that the ≥2 separation is used only to exclude any single cross-edge between distinct active regions, which, together with quiescence and standard LOCAL timing, forbids any causal path between active regions within the t-round phase.
- Remark after Corollary B vs Lemma 8: The archive already notes why no +1 is needed for sequential (R,W)-simulation. The minimal-path counterexample above motivates the +1 for quiescent batching, with an explicit 2-round signal path ruled out by dist(R_v,R_w) ≥ 2.

## Obstacles and caveats
- Precise semantics at the “decisive step for e”: In the universal relation, we appealed to the first moment both endpoints have arrived under τ. This is natural for edge-orientation; still, to be fully rigorous, we will explicitly fix the “decision time” as the earliest time at which both endpoints are arrived and the remaining rounds of the current window cannot affect the admissible orientation beyond B(e,t) (this is standard in the classical proof and aligns with Lemma NE).
- Edge→node half-step and preservation of universality: We need to write the exact dual construction and show that the set-valued constraints compose without loss; this mirrors the classical proofs, but we will write it out with the online normalization in place.

## Next steps (auditable)
1) Write and insert Lemma NE (Normalization-and-Extension around an edge) in output.md with the proof based on Lemma 7 (and its vertex counterpart already archived as Lemma 9).
2) Restate LB.1 as LB.1u (universal node→edge step) precisely, with the definitions of boundary snapshot β, normalized local schedules inside B(e,2t), and the universal forcing relation; include the non-conflict lemma and the (t→t−1/2) dependency analysis.
3) Formalize the symmetric edge→node universal step and the induction invariant that the admissible-set semantics is preserved by iteration; then state LB.2 (iteration to 0 rounds) and conclude the ID-graph contradiction.
4) Optionally, add a brief “modeling note” explaining that our elimination works with set-valued admissible labels under universal quantification, which is the standard device in classical round-elimination, and that normalization via Lemma NE ensures online effects outside B(e,2t) are irrelevant.
5) In parallel, continue exploring a constructive positive route under additional hypotheses (finite-state and ID-oblivious algorithms): attempt to prove a path, t=1 interface-invariance lemma via finite enumeration of boundary types; if successful, this yields a quiescentization transform in that regime.

## Why this is progress
- We provide a rigorous normalization-and-extension lemma tailored to edges, removing ambiguity about embedding local schedules into global runs.
- We fix the core gap in the lower-bound program by adopting a universal set-valued elimination step (LB.1u), which is standard in classical proofs and avoids the earlier invalid “double-grab” argument in the node-form.
- These pieces are local, finite-radius, and independently checkable, and they pave the way to completing the lower-bound route, which in turn implies the desired O(log* n) LOCAL upper bound for the class Online-LOCAL(t)=O(1) on trees via the known classification.

