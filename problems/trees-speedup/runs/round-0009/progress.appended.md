## Round 0009 — 2025-08-27T20:22:41.217582Z

Status and alignment
- Objective: Prove that any LCL that is solvable in O(1) rounds in the deterministic Online-LOCAL(t) model on bounded-degree (nonoriented) trees admits an O(log* n) deterministic LOCAL algorithm.
- Archive status: output.md now includes the core positive bridges (sequential simulation; output-only and (W,t)-quiescent pipelines with correct radii and the +1 separation), the commutativity lemma (2t-commutativity), strong vertex-level witness localization (Lemma 9), the “no faithful batching” counterexample for unrestricted Online-LOCAL, and Lemma S (adversarial schedule-localization for an edge). These are consistent and useful.
- Verifier guidance: The edge-centered universal step S_e based solely on B(e,2t) has a compositionality flaw at nodes; repair by shifting to node-centered admissible sets on U_w := ⋃_{e∋w} B(e,2t), then derive edge-sets from node-sets. Replace intersection-over-orders by union-over-orders. Supply an explicit t=2 example showing the +1 necessity in Lemma 8.

New contributions this round
1) Node-centered admissible sets on U_w (finite-type, “no-sink-in-sets” preserved)
- Setup and notation.
  • Model: deterministic Online-LOCAL(t), edge-decided semantics for orientations (an edge is irrevocably oriented when its second endpoint arrives). Graphs are bounded-degree trees with ID-graph framework (port colors, high-girth ID graph H) as in Def. 2.16.
  • For a node w, define the localized universe
    U_w := ⋃_{e=wx incident to w} B(e, 2t) ⊆ B(w, 2t+1).
    Let X_w denote the rooted, port-colored, ID-labeled isomorphism type of U_w (root at w); since Δ,t are constants and H induces finitely many depth-(2t+1) types, the catalogue of X_w is finite.
  • Let Ord_w(X_w) be the set of all internal arrival orders τ of the vertices of U_w that (i) include both endpoints of every edge incident to w by the time τ ends (so all these edges become decidable), and (ii) list no vertex outside U_w before τ ends (outside-U_w absent). By Lemma S, each τ ∈ Ord_w(X_w) is realized by some global arrival order; conversely, correctness must hold for all τ.
  • For τ ∈ Ord_w(X_w), write out_A(wx, τ) ∈ {w→x, x→w} for the orientation that A assigns to edge e=wx at its decision time under τ (well-defined by edge-decided semantics).

- Definition (node-centered admissible ports).
  For each node type X_w, define the admissible port set
  T_w(X_w) := { x ∈ N(w) : ∃ τ ∈ Ord_w(X_w) with out_A(wx, τ) = w→x }.

- Lemma T (well-definedness and nonemptiness of T_w; “no-sink-in-sets”).
  Statement. For sinkless orientation on bounded-degree trees under edge-decided semantics:
  (i) For every node type X_w, T_w(X_w) is well-defined (depends only on X_w) and T_w(X_w) ⊆ N(w).
  (ii) T_w(X_w) ≠ ∅ for all X_w (node-side “no-sink-in-sets”).
  Proof. (i) The outcomes out_A(wx, τ) for τ ∈ Ord_w(X_w) depend only on the execution restricted to U_w with the outside absent, hence only on X_w and τ; thus T_w(X_w) is well-defined. Type finiteness follows from the ID-graph framework and the constant radius 2t+1.
  (ii) Suppose T_w(X_w) = ∅ for some X_w. Then for every τ ∈ Ord_w(X_w) and every neighbor x, out_A(wx, τ) = x→w, implying that once all edges incident to w are decidable in the τ-run, w has no outgoing edge—w is a sink. As τ is a valid adversarial schedule with the outside absent (Lemma S), this contradicts correctness. Hence T_w(X_w) ≠ ∅. □

- Why useful here. This node-level construction fixes the compositionality issue flagged by the verifier: all adversarial variability is quantified within U_w (a constant-radius ball), and the “no-sink-in-sets” property holds locally and unconditionally at w. The set semantics use union-over-orders (existential quantification) per port, ensuring nonemptiness at nodes.

2) Deriving edge-centered admissible sets from node-sets (safe composition at nodes)
- Given T at nodes, define per-edge sets without boundary-freezing:
  For an edge e=wx, let
    S_e := { w→x : x ∈ T_w(X_w) } ∪ { x→w : w ∈ T_x(X_x) }.
  Observations:
  • S_e depends only on the pair of node types (X_w, X_x); hence S_e is a function of the labeled type of B(e, 2t+1) (the union of B(w, 2t+1) and B(x, 2t+1) overlaps in B(e, 2t)). The catalogue of such edge types is finite.
  • Node-side constraint preserved: For any w, by Lemma T there exists x ∈ T_w(X_w), and hence w→x ∈ S_{wx}. Thus, for every node w, at least one incident edge set S_e contains an outward orientation for w (no-sink-in-sets at nodes persists via S).
  • We do not assert nonemptiness of S_e for every individual edge; this is not needed to preserve the node-side constraint, which is the relevant one for sinkless orientation. (If desired, one can separately argue nonemptiness for an appropriate fraction of edges, but this is not required for the next steps.)

- Why this composition is robust. It uses only node-side admissible information T_w on U_w and T_x on U_x, avoiding any reliance on edge-local schedules that would later be embedded in larger unions (the source of the prior flaw). All dependencies remain confined to constant-radius node types.

3) Radii and finiteness (explicit accounting)
- Node step: U_w ⊆ B(w, 2t+1); types X_w form a finite set determined by Δ, t, and the ID-graph H. T_w(X_w) maps each X_w to a nonempty subset of incident port colors of w.
- Edge step: S_e depends on X_w and X_x; hence S_e depends only on the labeled type of B(e, 2t+1) (finite catalogue).
- Summary: All admissible-set assignments live over finite type spaces, with explicit constant radii (2t+1 around nodes; 2t+1 around edges).

4) A clean invariant package (to be maintained in further steps)
- I1 (Type finiteness). The domain of node types X_w (radius 2t+1) and edge types X_e (radius 2t+1) is finite.
- I2 (Locality). T_w(X_w) and S_e(X_e) depend only on their respective local types.
- I3 (Node-side no-sink-in-sets). For all node types X_w, T_w(X_w) ≠ ∅. Consequently, for all w there exists an incident e with w→• ∈ S_e.
- I4 (Adversarial soundness). T_w(X_w) is defined by existential quantification over all internal orders τ ∈ Ord_w(X_w) with outside absent (Lemma S), hence is consistent with correctness for every adversarial arrival order.

These invariants are precisely the safe replacements for the flawed edge-local universal construction on B(e,2t).

5) Explicit t=2, W=0 path example witnessing the +1 necessity in Lemma 8
- Instance: Path … – p2 – p1 – a – u – x – y – v – b – q1 – q2 – … with centers a, b at distance 5. For t=2, the active regions are R_a = B(a,2) = {a, u, x} and R_b = B(b,2) = {b, v, y}. These regions are disjoint but adjacent by the cross-edge x–y (dist(R_a, R_b) = 1). A proper coloring of G^{2t} = G^4 can assign a and b the same color; thus with K=2t the phase may process both regions simultaneously.
- Quiescent Online-LOCAL(2) algorithm A (W=0): In a phase when all same-color centers “arrive,” A runs two synchronous rounds on the induced subgraph of colors ≤ current, with these rules:
  • Round 1: Each boundary node (distance exactly 2 from its center) sends the bit 1 to all neighbors; in particular, x sends 1 to y and y sends 1 to x across the cross-edge. Internal nodes and centers send 0.
  • Round 2: Each boundary node forwards to its center the bit it received in Round 1 from the cross-edge neighbor (if any); internal nodes forward towards the center; the center outputs that bit (default 0 if nothing received).
  • Quiescence: Only nodes within R := R_a ∪ R_b may change state (W=0); nodes outside R neither change state nor forward information, satisfying the (W,t)-quiescent definition.
- Effect: In this single phase with K=2t, the output of a depends on y (in R_b) via the 2-hop route y→x→u→a within the two rounds; symmetrically, the output of b depends on x. Hence the transcript in R_a depends on the concurrent activity in R_b, violating the per-region independence that Lemma 8’s proof requires. With K=2t+1, we would have dist(R_a, R_b) ≥ 2 and no cross-edge x–y; the above coupling is impossible, and Claim 8.1’s argument applies. This exhibits the necessity of the “+1”.

Audit of output.md (gaps and suggested insertions)
- The newly archived Lemma S is correct and well-placed.
- Missing lower-bound pieces:
  • A node-centered “universal sets” lemma (Lemma T above) on U_w, with explicit definitions, radius 2t+1, type finiteness, and proof of nonemptiness. This directly addresses the compositionality flaw noted by the verifier for edge-based sets on B(e,2t).
  • A safe Node→Edge composition producing S_e from T_w and T_x, together with the preserved node-side “no-sink-in-sets” invariant. This should replace any previous edge-centered set step based on B(e,2t).
  • The explicit t=2 path example witnessing the +1 necessity for Lemma 8 (Quiescent batching), as a short proposition/remark after Lemma 8.
- Open items (not yet in output.md): The symmetric Edge→Node half-step with precise radius evolution and preservation of invariants; the iteration to 0 rounds and the ID-graph contradiction. These remain to be formalized using the adversarial, local-first framework.

Why this is progress
- The node-centered admissible set construction T_w(X_w) provides a rigorous and local (finite-type) foundation for a set-valued round-elimination scheme on trees, addressing the verifier’s compositionality concern head-on.
- The Node→Edge composition yields per-edge sets that preserve the critical node-side “no-sink-in-sets” invariant without relying on any unsafe boundary-freezing assumptions.
- An explicit, fully specified quiescent W=0, t=2 path example demonstrates the necessity of the +1 in Lemma 8, turning an intuitive remark into a verifiable witness.

Obstacles and open questions
- Edge→Node half-step with radius control: A clean transformation that (ideally) decreases the radius by 1/2 per half-step remains to be designed under the adversarial, local-first semantics, while preserving the invariants I1–I4. A naive T′_w := { x : w→x ∈ S_{wx} } composes but increases the radius; the universal-quantifier variant may help shrink sets/radius but needs care.
- Iteration to 0 rounds and ID-graph contradiction: After formalizing the symmetric half-step, we must show that after O(t) alternations we obtain a 0-round set-valued prescription over the ID-graph H that violates the independence constraint (as in Theorem 2.15). This will likely follow the classical scheme once the half-steps are validated.
- Output-only variant: Redo the lower bound in the simpler output-only model with node-level sets on U_w and union-over-orders admissibility. This is lower risk and should be integrated first.

Next steps (auditable)
1) Add Lemma T (node-centered admissible ports on U_w) to output.md, with explicit definitions, the proof of nonemptiness, and the finite-type argument via the ID-graph.
2) Add the Node→Edge composition (from T_w and T_x to S_e) and record the preserved node-side “no-sink-in-sets” property and radii (edge type depends on B(e,2t+1)).
3) Formalize the symmetric Edge→Node half-step in the same adversarial, local-first framework, aiming for a (t → t−1/2) style radius change or, at minimum, an inductive invariant that enables iteration to a 0-round contradiction.
4) Integrate the explicit t=2 path example as a short proposition justifying the +1 necessity in Lemma 8.
5) In parallel, implement the output-only lower bound using node-level sets on U_w (union-over-orders) and state the iteration outline to a 0-round contradiction over H.

Appendix: crisp statements to integrate
- Lemma T (Node-level admissible ports on U_w): as above.
- Corollary (Preserved node-side no-sink-in-sets under Node→Edge): For every node w, there exists an incident edge e with w→• ∈ S_e.
- Proposition (+1 necessity for t=2, W=0): The explicit path construction above.

