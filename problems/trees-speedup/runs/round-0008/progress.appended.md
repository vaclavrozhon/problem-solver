## Round 0008 — 2025-08-27T20:12:43.370082Z

Status and aim
- Goal: Settle the remaining unrestricted Online-LOCAL(t) case on bounded-degree trees by a rigorously sound lower-bound route (to exclude the log n-hard class via sinkless orientation), or by a constructive compile-out of idle-state effects.
- Key verifier feedback: The “normalization-and-extension around an edge” used previously is only valid in the extension direction; the converse normalization is false in the unrestricted online model. Any round-elimination step must avoid boundary-freezing assumptions that would implicitly sever outside influence. We adapt accordingly by switching to an adversarial local-first schedule (no transformation of an existing schedule), and by defining set-valued universal relations over all internal arrival orders inside a finite ball, with outside vertices simply absent.

New clean tools (consistent with feedback)
1) Adversarial local-first scheduling around an edge (simple but crucial)
- Lemma S (Schedule-localization for an edge). Fix an edge e = uv and t ≥ 1. For any deterministic Online-LOCAL(t) algorithm A and any bounded-degree tree G, there exists an arrival schedule σ(e) such that: (i) all vertices in B(e,2t) arrive before any vertex outside B(e,2t); (ii) u and v both arrive by the time e becomes decidable (in the edge-decided semantics: upon arrival of the second endpoint); (iii) the online run of A up to that decisive moment depends only on B(e,2t) and on the internal arrival order inside that ball.
- Why valid and useful: This is not a normalization of an arbitrary schedule; it is an adversarial schedule choice. Since A must be correct for every arrival order, we are free to schedule no outside vertices until after the decision on e. This isolates e’s decision within the finite ball B(e,2t) without any boundary-freezing assumption. This is the missing adversarial counterpart to the earlier (invalid) “push-outside-past-the-decision” transformation.
- Proof sketch (trivial but explicit). List all vertices of B(e,2t) in any order that ends with the second endpoint of e. Declare that to be the initial prefix of arrivals; only thereafter list all vertices outside B(e,2t). During this prefix, the subgraph of arrived vertices equals B(e,2t), and all t-round windows run exclusively there; hence the decision transcript for e depends only on the internal arrival order in B(e,2t).

2) Universal set-valued node→edge half-step (edge-decided semantics; local-only universes)
- Setup. Work on Δ-regular trees with the ID-graph framework (Def. 2.16): edges are port-colored with colors in [Δ], and the node IDs are drawn from a fixed high-girth ID-graph H that respects port colors. This ensures a finite catalogue of rooted radius-r ID-types (up to colored-rooted isomorphism) for any fixed r=O(t).
- Definitions.
  • Let X_e be the isomorphism type (graph structure, port colors, and ID-graph labels) of the radius-2t ball B(e,2t) in G labeled by H. Let Ord(X_e) be the set of all internal arrival orders on the vertices of B(e,2t) that end when the second endpoint of e arrives.
  • For each τ ∈ Ord(X_e), let out_A(X_e, τ) ∈ {u→v, v→u} be the orientation chosen by A on e when the outside is absent (by Lemma S, this is realized by some global arrival schedule).
  • Define the admissible set S_e(X_e) := { out_A(X_e, τ) : τ ∈ Ord(X_e) } ⊆ {u→v, v→u}.
- Lemma LB.1u’ (Node→edge universal set step). For every edge e and X_e as above, S_e(X_e) is nonempty and depends only on X_e (finitely many types). Moreover, define the node-side constraint “no-sink in sets” at a node w: among the incident edges e ∋ w, at least one S_e(X_e) contains an orientation pointing away from w. Then the family {S_e(X_e)} produced by A satisfies the no-sink-in-sets constraint at every w.
- Why each part holds.
  • Well-defined and nonempty: For each τ, edge e becomes decidable by construction, and A is deterministic; hence out_A(X_e, τ) exists. Dependence only on X_e is immediate because τ and all dynamics happen inside B(e,2t), with the outside absent (Lemma S). Since the catalogue of ID-types X_e is finite (bounded Δ, finite port colors, fixed radius 2t), these sets live over a finite type space.
  • No-sink-in-sets: Fix any node w, and consider the union of the radius-2t balls around edges incident to w (a constant-radius object in a tree). Let the adversary list arrivals inside this union in any order that makes all those edges decidable (outside vertices still absent). If every S_e at w disallowed the orientation pointing out of w, then under every internal order the run would force w to be a sink at the moment all incident edges are decided—contradicting A’s correctness for that arrival order. Therefore, at least one incident S_e must contain an outward orientation.
- Remarks.
  • No boundary-freezing: We never appeal to any fixed “boundary snapshot”; the universe of internal orders is taken over the full 2t-ball with the outside absent, which is realized by Lemma S. Thus the construction aligns with the verifier’s critique.
  • Finite type space: The ID-graph framework replaces unbounded raw IDs by bounded-degree colored-tree types of depth 2t, yielding a finite catalogue for S_e(·), as in classical round-elimination.

3) Towards iteration (edge→node half-step) and 0-round contradiction (plan)
- Next step (to be formalized): Given the edge-centered set rule S_e on 2t-balls, define a node-centered set rule S_w on (2t−1)-balls that captures which incident edge-colors at w can be chosen “outwards” under all internal orders within B(w,2t−1). This is the standard symmetric half-step, adjusted to use the same adversarial local-first scheduling within the appropriate constant-radius ball.
- Inductive invariant. At each half-step, (i) the type space is finite (bounded depth in the ID-graph); (ii) set nonemptiness is preserved; (iii) the node-side “no-sink in sets” constraint persists. Iterating 2t half-steps yields a 0-round (set-valued) prescription depending only on the 0-type at each edge.
- Final contradiction via the ID-graph. As in the classical proof (Theorem 2.15), any 0-round prescription depending only on ID-graph types induces a global edge-labeling on H. Using the ID-graph properties (large girth, independence bounds per color class), one shows that no such 0-round (even set-valued) prescription can satisfy the no-sink-in-sets constraint on all vertices simultaneously—yielding a contradiction. We will port this argument in the next round after formalizing the edge→node step.

A tightness example for the +1 in Lemma 8 (requested by the verifier)
- Proposition P (+1 necessity for t=2, W=0). On a path, there exists a deterministic quiescent Online-LOCAL(2) algorithm A and a proper coloring of G^{2t}=G^{4} such that if two active centers a,b at distance 2t+1=5 are processed in the same phase (so their B(·,2) active regions are disjoint but adjacent by one edge), a one-phase, 2-round batching can couple the regions via a 2-hop relay across the single cross-edge—invalidating the independence needed in Lemma 8. Coloring G^{2t+1}=G^{5} (so dist(B(a,2),B(b,2))≥2) eliminates this coupling. We will write the explicit A and 2-round relay in the next edit; the qualitative statement matches the existing remark and corrects the earlier t=1 sketch.

Audit of output.md (gaps/clarifications)
- No invalid normalization remains in output.md; Lemma 9 (strong witness localization at a vertex) only swaps v with predecessors at distance > 2t and is sound. The flawed edge-normalization never made it into output.md and should stay out.
- Suggest adding Lemma S (Schedule-localization for an edge) to the new “Online round-elimination on trees” subsection as the adversarial scheduling primitive; it is trivial but clarifies the model and removes the need for any boundary-freezing language.
- Suggest adding LB.1u’ (Node→edge universal set step) with the precise definitions above (X_e types, Ord(X_e), S_e) and the no-sink-in-sets lemma; this now uses only the extension/scheduling direction and is consistent with the verifier’s critique.
- Lemma 8’s +1 remark is correct; once Proposition P is written out, it can be cited as a formal tightness example (t=2 path), avoiding the earlier t=1 mismatch.

Obstacles and why our approach addresses them
- Boundary influence and normalization: We avoid all converse normalization claims. The outside is simply absent until after the decisive moment, by adversarial choice (Lemma S). This eliminates the key flaw identified by the verifier.
- Unbounded type spaces: By working in the ID-graph framework from the outset and only within constant-radius balls, all local types are finite, as in classical lower bounds.
- Non-conflict of “double-witnesses”: We explicitly use set-valued admissible relations and a universal quantification over all internal orders—no uniqueness is claimed or needed. The node constraint is formulated in the “no-sink-in-sets” form customary in set-valued round-elimination, which follows from correctness under all arrival orders.

Next steps (concrete and auditable)
1) Add Lemma S and LB.1u’ (with complete formal proofs) to output.md; include the exact definition of the type catalogue (rooted, port-colored ID-graph balls of radius 2t) and the finiteness argument.
2) Formalize the symmetric edge→node half-step in the same adversarial, local-first fashion; state and prove preservation of nonemptiness and the “no-sink in sets” constraint; track the radius drop precisely.
3) Complete the 2t-step iteration and write the ID-graph contradiction for the 0-round set-valued prescription, adapting Theorem 2.15’s last step to the set-valued context.
4) Provide the explicit t=2 path construction for Proposition P (two-round relay across a single cross-edge) to document the +1 necessity in Lemma 8.

Why this is progress
- We replace the invalid normalization with a trivial but powerful adversarial scheduling lemma (Lemma S) that suffices for a localized elimination. This directly addresses the verifier’s core criticism.
- We give a precise, finite-type, universal set-valued node→edge step that is compatible with the unrestricted online model and depends only on local structure; this is the cornerstone for the lower-bound route.
- We outline the remaining steps to complete the lower bound for sinkless orientation in Online-LOCAL(t), which would settle the main task existentially via the tree classification.

