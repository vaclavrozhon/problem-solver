## Round 0005 — 2025-08-27T19:41:15.598712Z

Headlines for this round
- We isolate and formalize a natural “quiescence” hypothesis for Online-LOCAL(t) that precisely removes the idle-state accumulation pitfall flagged by the verifier, and prove a clean O(log* n) LOCAL simulation under this assumption (also with bounded writes W). This subsumes the output-only bridges and matches many natural online greedy designs.
- We explain why the existing Lemma 7 (2t-commutativity) remains valid despite unrestricted mutable state, and we suggest a small wording clarification to pre-empt confusion.
- We outline a concrete program to either (i) transform any Online-LOCAL(t) algorithm for LCLs on trees into a quiescent one (state-elimination-by-quiescence), or (ii) find a counterexample LCL on paths showing that such a transformation is impossible.

New definition and lemma: quiescent Online-LOCAL(t)
- Definition (quiescent outside the active ball). A deterministic Online-LOCAL(t) algorithm A is quiescent if, at the arrival of v, the only nodes whose local state may change during the ensuing t synchronous rounds are those in B(v,t). Equivalently, for every arrival step, nodes u with dist(u,v) > t do not modify their state (they may send/receive no messages anyway).
  • Bounded-writes extension (W-write): If A, at arrival of v, may irrevocably fix outputs within B(v,W), we say A is (W,t)-quiescent if only nodes in the active region B(v,W+t) may change state during the t-round window.
  • Relationship to prior models: Output-only is a special case of quiescence (no mutable state remains, hence trivially no changes outside the active region). The t-local-dependence property is about read-dependence; quiescence is about state updates and complements it.

- Lemma Q (Quiescent Online-LOCAL(t) ⇒ O(log* n) LOCAL). Let Π be an LCL on bounded-degree graphs. If Π has a deterministic quiescent Online-LOCAL(t) algorithm (W=0), then Π has a deterministic LOCAL algorithm with round complexity O(log* n). More generally, if Π has a deterministic (W,t)-quiescent Online-LOCAL(t) algorithm, then Π has a deterministic LOCAL algorithm with round complexity O((2t+2W)·log* n) = O(log* n) for constant Δ, t, W.
  • Proof sketch (auditable).
    1) Compute a proper coloring φ of G^{K} with K = 2t (or K = 2t+2W when W>0) using Lemma 1 in O(K·log* n) rounds; the color count C = Δ^{O(K)} is a constant for fixed Δ, t, W.
    2) Process color classes 1,2,…,C. In phase i, we simulate, in parallel, the t-round “arrival window” of every vertex v with φ(v)=i over the subgraph induced by already-arrived colors ≤ i (nodes of colors > i stay absent and silent). Because φ colors G^{2t} (resp. G^{2t+2W}), the active regions B(v,t) (resp. B(v,W+t)) are pairwise disjoint for same-color vertices. Thus the per-phase parallel simulation costs exactly t rounds and there is no inter-phase interference.
    3) Quiescence guarantees that nodes outside unions of active regions do not change state in a phase. Hence the sequence of states/output labels after finishing phase i exactly matches the sequential online run that processes arrival order σ_φ: first all color-1 vertices in any internal order, then color-2, etc. Induction on i (standard color-phased invariant) completes the argument. Correctness follows from the online algorithm’s correctness for every order; runtime is O(K·log* n + C·t)=O(log* n).
  • Radii accounting (W>0). Independence of same-color arrivals needs disjointness of the active regions B(v,W+t), hence K = 2t+2W, consistent with Lemma 5’s write–write and read–write separation bound K = max(2W, R+W) with R=W+t here.

Why this is useful
- This lemma cleanly fixes the flaw in the previously proposed “faithful t-rounds-per-color” batching: the failure stemmed from idle updates at distant nodes; quiescence explicitly rules those out. It generalizes the output-only bridges (Lemmas 3 and 6) and conveniently captures many practical online-local designs in which only the newly active t-neighborhood ever changes state.
- Examples (fit quiescence): Greedy MIS, greedy maximal matching (with W=1), and (Δ+1)-coloring variants that only modify states/labels within distance 1 of the arriving vertex; in all such rules, no node outside the local t-ball modifies its state during an arrival step.

Clarification about Lemma 7 (2t-commutativity)
- Status: Lemma 7 in output.md is sound even under unrestricted mutable state. The proof informally remarks that nodes outside B(u,t) “undergo the same deterministic state updates as they would in any window where they receive the same (empty) messages”. A potential confusion was whether state updates could depend on the identity of the arriving vertex or a global step counter. Swapping two consecutive arrivals at u and w: (i) nodes outside B(u,t)∪B(w,t) experience two consecutive steps with empty incoming messages in both orders, hence perform the same pair of updates (possibly depending on step index), and (ii) nodes in B(u,t) (resp. B(w,t)) are unaffected by the arrival at w (resp. u) due to t-hop message speed, hence their transcripts in the two orders are identical. Therefore, the combined effect commutes.
- Suggestion for output.md: Add a sentence noting explicitly that the argument allows arbitrary deterministic updates of “idle” nodes that depend on the step index but not on messages; since the number and positions of the two steps are the same after swapping, their updates coincide.

Relationship to the current archive (output.md)
- The new Lemma Q can be added as a sibling of Lemmas 3–6. It strictly subsumes Lemma 3 (output-only, W=0) and Lemma 6 (output-only, W>0): output-only implies quiescence, so Q re-derives Corollary B. It also clearly separates the regimes: unrestricted Online-LOCAL(t) (with idle updates) does not admit the batched simulation (see the parity-counter counterexample already added as a remark), whereas quiescent Online-LOCAL(t) does.
- No changes are needed to Lemma 5’s coloring radius K = max(2W, R+W); here R = W+t in the (W,t)-quiescent case, giving K = 2t+2W, as used in the proof.

State-elimination-by-quiescence program on trees (next objective)
- Goal: Show that for LCLs on bounded-degree trees, any deterministic Online-LOCAL(t) algorithm can be transformed into an equivalent quiescent Online-LOCAL(t) algorithm (or into an order-robust sequential (R,W)-local rule). This would remove the extra assumption and settle the main task in full generality.
- Rationale. For LCLs, correctness depends only on the final labeling and local constraints. On trees, Corollary 7.1 localizes pre-arrival influence to B(v,2t). We conjecture that any dependence on idle state accumulation outside active balls can be compiled away without affecting the final outputs: replace far-away idle dynamics by a canonical, inert behavior (quiescence) together with a localized interface summary at ∂B(v,2t), sufficient to reconstruct any messages that matter for v’s decision.
- Concrete plan (auditable, starting with paths, t=1):
  1) Normalize the arrival order using Corollary 7.1 so that only vertices in B(v,2) are processed before v.
  2) For each neighbor u of v, define the interface relation Σ(u→v): the set of possible neighbor-to-v messages u can send at the start of v’s window over all normalized executions consistent with the same already-fixed outputs on B(v,2). Try to prove that Σ(u→v) depends only on those outputs (context-invariance), not on internal mutable state histories. This is exactly the step where idle updates must be shown irrelevant for LCLs.
  3) If successful, define a canonical message selector and hence a quiescent rule (no far-away updates) that reproduces the same outputs; if not, construct a counterexample LCL on paths demonstrating that idle updates can alter Σ(u→v) despite fixed B(v,2) outputs.

Examples and sanity checks
- MIS and matching (greedy, patch-based): These are (W,t)-quiescent with W=1, t=1. Lemma Q immediately yields O(log* n) LOCAL.
- (Δ+1)-vertex-coloring with an arriving-vertex patch that finalizes the vertex and possibly one-hop neighbors (W=1, t=1): also (W,t)-quiescent. Lemma Q applies.
- Non-quiescent toy algorithm (not an LCL witness): The parity-toggling construction in output.md shows that faithful batching fails without quiescence, but since it targets a trivial LCL, it does not refute the existence of some other correct batched simulation. This underscores the need for either a quiescentization proof or a genuine LCL counterexample.

Gaps or edits to output.md
- Add Lemma Q (Quiescent Online-LOCAL(t) ⇒ O(log* n), with the W-write extension) including the exact radius/coloring parameters: K = 2t (W=0) and K = 2t+2W (W>0), per-phase time t, total O(log* n) on bounded-degree graphs.
- After Lemma 7, include a brief clarifying remark that idle updates depending only on step index are handled by the swap argument (as noted above).
- Keep the existing “No faithful t-per-color batching for unrestricted Online-LOCAL(t)” remark; it documents the core obstruction and motivates the quiescence hypothesis.

Obstacles and risks
- Quiescence is a strong assumption; while it matches many natural greedy rules, it may not cover all constant-time online algorithms. The main technical challenge is to either justify that quiescence is without loss of generality for LCLs on trees (state-elimination), or exhibit a separating LCL.
- The interface-invariance step on paths, t=1, may fail in the unrestricted model due to unbounded state+IDs; if so, we will aim to craft an explicit LCL that requires such dependence.

Next steps (concrete)
1) Integrate Lemma Q (statement and proof) into output.md and explicitly note that it subsumes the output-only bridges.
2) Begin the path/t=1 state-elimination-by-quiescence attempt:
   - Precisely formalize Σ(u→v) and the notion of “consistent normalized executions” (after Corollary 7.1).
   - Try to prove context-invariance of Σ(u→v) under the LCL constraint (messages that affect v depend only on B(v,2) already-fixed outputs). If successful, define a canonical quiescent neighbor interface and derive a quiescent online rule.
   - In parallel, explore candidate LCLs that might violate context-invariance by encoding a step-count into neighbor messages without affecting B(v,2) outputs.
3) Maintain radii accounting: for any (R,W)-local sequential rule extracted from a quiescent online rule, ensure simulation by a G^{K} coloring with K = max(2W, R+W) as in Lemma 5.

Why this is progress
- The quiescence lemma pinpoints a precise, verifiable condition under which the O(log* n) speedup holds for arbitrary deterministic Online-LOCAL(t) algorithms (bounded-degree trees or graphs), consolidating and extending the previously archived bridges.
- It gives a crisp target for the remaining open part: either prove quiescence w.l.o.g. for LCLs on trees (closing the task) or demonstrate a tight counterexample.

