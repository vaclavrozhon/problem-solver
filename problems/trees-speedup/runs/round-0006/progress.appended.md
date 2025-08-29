## Round 0006 — 2025-08-27T19:51:10.350867Z

Status and aim
- Goal: Prove that any LCL solvable in O(1) rounds in deterministic Online-LOCAL(t) on bounded-degree (nonoriented) trees is solvable in O(log* n) rounds in LOCAL.
- Current archive: We have complete bridges for (i) output-only (with/without bounded writes) and (ii) t-local-dependence, plus the commutativity lemma (2t) and a quiescent bridge (Lemma 8) with the corrected separation K = 2t+1 (or 2t+2W+1) for safe per-color batching. We also documented why unrestricted Online-LOCAL(t) cannot be faithfully batched without extra structure.

New incremental results (clean statements and proofs)

1) Strong witness-localization (model-agnostic; to support localized arguments)
- Lemma 9 (Strong witness-localization at v). Let A be a deterministic Online-LOCAL(t) algorithm (no restrictions), G a bounded-degree graph, and σ any arrival sequence. For any vertex v, there exists a sequence σ_v obtained from σ by repeatedly swapping adjacent arrivals at distance > 2t such that:
  (i) All arrivals before v in σ_v are at vertices in B(v,2t).
  (ii) The arrived subgraph just before v arrives in σ_v equals the restriction of the original arrived subgraph to B(v,2t).
  (iii) The entire state on B(v,t) at the moment v arrives (including fixed outputs and any mutable state) is identical under σ and σ_v.
- Why useful here: It confines all pre-v influences to a finite ball, enabling local case analyses and localized reductions (e.g., round-elimination inside B(v,2t)) without assumptions like quiescence.
- Proof sketch (checkable). Swap adjacent independent arrivals (distance > 2t) using Lemma 7. Each swap preserves states in B(v,t) at the time v arrives because neither swapped step can influence B(v,t) in t rounds. Iterating, push every pre-v arrival outside B(v,2t) past v. The arrived subgraph outside B(v,2t) is absent before v in σ_v, establishing (i)–(ii). Preservation of states in B(v,t) at v’s arrival is maintained by each swap, giving (iii).

2) Quiescent domain-of-dependence inside a phase (tightening Lemma 8’s core invariant)
- Lemma 10 (Phase-locality under quiescence). Consider a (W,t)-quiescent Online-LOCAL(t) algorithm A. Fix a proper coloring φ of G^{K} with K = 2t+2W+1, and simulate phase i as in Lemma 8: all vertices v with φ(v)=i arrive simultaneously, and we run t LOCAL rounds over the induced subgraph of colors ≤ i. For each such v, let R_v = B(v,W+t).
  Claim: During phase i, the state evolution on R_v depends only on (a) the initial states on R_v ∪ ∂R_v at the start of the phase (i.e., after phase i−1), and (b) the algorithm A, and it is identical to executing v’s t-window in isolation with those boundary states. In particular, the combined effect of the phase equals the composition (in any order) of the individual arrival-windows of vertices of color i.
- Why useful here: This is the precise “active-region independence” that makes Lemma 8’s batching sound; it also clarifies why the +1 in K is necessary.
- Proof (detailed induction). Because dist(R_v,R_w) ≥ 2 for distinct same-color v,w when K = 2t+2W+1, there is no edge between different active regions. Quiescence implies nodes outside R := ⋃_{φ(v)=i} R_v do not change state during the t rounds of the phase, and under standard LOCAL timing (send from current state; receive; update) such nodes cannot forward any newly received messages in later rounds—outgoing messages depend only on their unchanged state at the start of each round. Hence, any path starting in R_v and reaching a node in R_w would have to traverse at least one node outside R that cannot propagate new information; therefore, no causal influence can cross from one active region to another within the t rounds. Induction on the round counter r=1,…,t shows that the transcript inside each R_v is identical to that of running v’s window alone with the same boundary states (states on ∂R_v are frozen during the phase). Therefore, the phase equals the composition of independent arrival windows of its color-class.

3) Localized round-elimination for Online-LOCAL(t) on trees (lower-bound track)
We formalize the key step needed to show that log n-hard LCLs (e.g., sinkless orientation) cannot have deterministic constant-t Online-LOCAL algorithms on bounded-degree trees. This, combined with the tree LCL classification, would imply the desired O(log* n) LOCAL upper bound for the class “Online-LOCAL(t)=O(1) on trees”.

- Setup and notation. Work on a Δ-regular infinite tree T_Δ (or large finite high-girth trees) with an ID-graph H as in Definition 2.16 (girth ≥ γ log_Δ n; color-classes Hi with each independent set < n/Δ). Consider deterministic Online-LOCAL(t) A that solves sinkless orientation (or its node-form edge-grabbing) for all arrival orders. Use Lemma 9 to localize to a finite ball and the ID-graph framework to avoid reliance on global unique IDs.

- Lemma LB.1 (Online node→edge reduction within a fixed ball). Suppose A solves node-form edge-grabbing in Online-LOCAL(t) on Δ-regular trees for all arrival orders. Fix an edge e = uv and normalize so that before the decisive steps at u and v, all prior arrivals lie in B(e,2t) (by Lemma 9). There exists a deterministic edge-centered Online-LOCAL(t−1/2) rule A′ on B(e,2t) that orients e based solely on the local neighborhood B(e,2t) and consistent arrival orders inside that ball. Formally: define A′ so that e is oriented from u→v if and only if there exists a pre-v normalized arrival order inside B(u,t) consistent with the current arrived subgraph in B(e,2t) leading A at u to grab e; similarly for v→u. These definitions are non-conflicting and well-defined.
  Why useful: This is the Online analogue of the one-half round-elimination step (node-to-edge), localized within a bounded-radius ball. It sets up the iterative descent to 0-round.
  Proof idea (verifiable conditions). The only obstruction would be “double grab”: both u and v have consistent local histories leading to grabbing e. But then we can glue the two histories into a single normalized local execution inside B(e,2t), and extend to a global arrival sequence (complete T_Δ outside the ball; push all outside arrivals after the decision via Lemma 9) that makes A grab e from both ends—contradiction with correctness. The gluing is feasible because arrivals are confined to B(e,2t), each endpoint’s t-window depends only on B(endpoint,t), and the union remains within B(e,2t); overlapping influences are identical by determinism, and no information from outside the ball is needed (by Lemma 9). The reduction is edge-centered and costs one half-step of dependence radius.

- Lemma LB.2 (Iterated localized elimination to 0 rounds). Starting from a node-centered Online-LOCAL(t) solution for sinkless orientation on Δ-regular trees, iterate LB.1 and its symmetric edge→node reduction (the standard pair in round elimination) within B(·,2t). After 2t iterations, obtain a 0-round edge-centered rule A^{(0)} on B(e,2t) deciding the orientation of e as a function only of the local ID labels on B(e,2t).
  Why useful: A^{(0)} induces a 0-round global labeling depending only on the ID-graph labels, contradicting the ID-graph property (Definition 2.16) exactly as in the classical proof for LOCAL. Hence, no deterministic constant-t Online-LOCAL algorithm solves sinkless orientation on trees.
  Proof idea (structure mirrors classical). The normalized-balls argument (Lemma 9) ensures that at each step, all needed information is inside a constant-radius ball; determinism plus the non-conflict property from LB.1 and its converse allow well-defined round-elimination steps. The finite number (2t) of steps yields a 0-round prescription; the ID-graph contradiction follows because such a prescription would color H with Δ colors avoiding monochromatic edges within Hi, impossible by the independence bound in Definition 2.16.

- Corollary LB (Non-existence of constant-t online for log n-hard LCLs). Sinkless orientation has no deterministic Online-LOCAL(t)=O(1) algorithm on bounded-degree trees. By Theorem 2.33 (classification on trees), any LCL with O(1) online complexity cannot be in the log n-hard class; thus it lies in the O(1)/Θ(log* n) class. Therefore, any LCL solvable in O(1) deterministic Online-LOCAL(t) on bounded-degree trees admits an O(log* n) deterministic LOCAL algorithm (existentially).

Why these are progress
- Lemma 9 and Lemma 10 make the previously informal core invariants fully explicit and reusable: (i) state confinement to B(v,2t) for unrestricted online, and (ii) phase-wise active-region independence under quiescence.
- Lemmas LB.1–LB.2 provide the localized round-elimination scheme needed for the lower-bound path. The statements are precise and reduce the remaining work to filling in the standard gluing construction and the symmetric edge→node half-step, both classical in flavor but with the normalized-ball twist (Lemma 9).

Examples and sanity checks
- Minimal K for quiescent batching: Two same-color centers at distance 2t+1 have disjoint active regions B(·,t) but these can be adjacent by one edge. In round 1, a message can cross that edge, coupling the evolutions. Hence K = 2t is insufficient; K = 2t+1 ensures ≥2-hop separation.
- Typical quiescent online rules: Greedy MIS and maximal matching with W=1, t=1 modify only B(v,1) at each arrival; they are (W,t)-quiescent. Lemma 8 yields O(log* n) LOCAL as already recorded.

Obstacles and open items
- For LB.1, the “gluing” step must be spelled out so that any two locally consistent normalized histories can be realized inside B(e,2t) without conflict. This uses determinism and the 2t horizon; we need to check corner cases where the two histories interact through nodes at distance exactly t from both u and v. The conflict-freedom argument via contradiction is standard but must be carefully written.
- The symmetric edge→node reduction (half-step) must be stated and proved in the online setting, paralleling LB.1. This is straightforward but needs a clean write-up.
- State-elimination (constructive simulation) on trees without quiescence remains open. The lower-bound program bypasses constructive simulation but proves the target speedup existentially by excluding the log n-hard class.

Edits and additions suggested for output.md
- Add Lemma 9 (Strong witness-localization at v) with full proof. It is model-agnostic and will be useful for both the lower-bound program and any future interface-invariance attempts.
- In Lemma 8’s proof, we already included the K = 2t+1 (or 2t+2W+1) separation and the standard LOCAL round semantics. We recommend explicitly stating the two facts used in Lemma 10 (active-region independence and non-forwarding by quiescent outside nodes) as a short standalone claim, to make the dependency clear.
- Create a new subsection “Online round-elimination on trees” with precise statements of Lemmas LB.1 and LB.2 (as above) and a roadmap to the ID-graph contradiction. This does not change any prior result but clarifies the pathway to the main theorem under unrestricted Online-LOCAL(t).

Next steps (auditable)
1) Write the full proof of Lemma 9 and add it to output.md. (Most of the argument is already implicit in Corollary 7.1; formalize items (ii)–(iii) carefully.)
2) Insert Lemma 10’s phrasing (active-region domain-of-dependence) as a paragraph in Lemma 8’s proof, with a short inductive argument per round.
3) Formalize LB.1 (node→edge) and the symmetric edge→node step for Online-LOCAL(t) on Δ-regular trees with ID-graph H. Carefully define “locally consistent normalized arrivals” inside B(e,2t) and the gluing argument.
4) Complete LB.2 to 0 rounds and the ID-graph contradiction, giving the lower bound for sinkless orientation. State the existential corollary for the main task (O(log* n) LOCAL for any LCL with O(1) Online-LOCAL(t) on trees).
5) Optionally, continue exploring the constructive path: try to establish interface invariance on paths for t=1 under extra constraints (bounded-state or ID-obliviousness), or produce a counterexample LCL under unrestricted online showing that quiescence is not w.l.o.g.

Gaps or errors spotted in output.md
- None critical. The separation radii for quiescent batching (K = 2t+1 and 2t+2W+1) are correctly recorded with an explanatory remark. Lemma 5’s K = max(2W, R+W) is appropriate for sequential rules (no extra +1 needed). The commutativity lemma includes the clarifying remark about deterministic step-index updates. We suggest adding the standalone formalization of Lemma 9 and the localized round-elimination lemmas LB.1–LB.2 as described above.

