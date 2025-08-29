Context and goal
We study the relationship between online-style constant-locality algorithms for LCLs on bounded-degree, unoriented trees and deterministic LOCAL-time upper bounds. Two notions of “online local” are relevant:
- Sequential local/greedy model (order-robust r-local): when processing a vertex v, the decision at v depends only on the r-hop neighborhood B(v,r) of the underlying graph and on already fixed outputs within B(v,r); the algorithm must succeed for every vertex order. No global mutable state or long-range message accumulation between steps.
- Online-LOCAL(t) (Akbari–Eslami–Lievonen–Melnyk–Särkijärvi–Suomela, ICALP’23): vertices arrive one by one; upon each arrival, the algorithm has t synchronous LOCAL rounds on the subgraph induced by arrived vertices; outputs are irrevocable. Over many arrivals, an unbounded number of communication rounds can occur, enabling long-range state accumulation.

Safe, proven variant (archived below in output.md)
- Theorem (Sequential-local to LOCAL): If an LCL Π on bounded-degree graphs has a deterministic order-robust r-local sequential algorithm (decisions at v depend only on B(v,r) and outputs of earlier vertices in B(v,r), and the rule writes only the output at v), then Π has a deterministic LOCAL algorithm running in O(r log* n + Δ^{O(r)}) rounds. On bounded-degree trees with constant r, this is O(log* n). Proof: compute a proper coloring of G^r in O(r log* n) rounds with Δ^{O(r)} colors; process color classes in order, letting each v gather outputs from B(v,r) restricted to earlier colors and apply the sequential rule. Because nodes of the same color are at distance > r, their decisions do not depend on each other.

Gap for the full Online-LOCAL(t) model
- A direct phase simulation that uses a distance-(2t) coloring and t rounds per color does not generally reproduce the state a node v would see upon arrival in an actual online execution. In a true online run, before v arrives, there may have been Θ(n) earlier arrivals, yielding Θ(n)·t global rounds; information can propagate arbitrarily far and may alter the states within B(v,t). The phase simulation grants only O(1)·t total rounds before v’s phase, so the local states can differ. Hence, without additional constraints, we cannot claim that the phase simulation faithfully reproduces the online run or even yields correctness solely from A’s correctness.

Ways forward for Online-LOCAL(t)
- Add a locality-of-dependence assumption: the t-round transcript that determines v’s output depends only on the arrived subgraph inside distance ≤ t from v and on the outputs of those nodes, not on mutable states imported from farther away. Under this, distance-(2t) coloring plus phase simulation is valid and yields O(log* n).
- Alternatively, seek a structural scheduling/padding argument ensuring that for LCLs on bounded-degree trees, the state within B(v,t) before v’s arrival is independent of far-away arrivals. This is nontrivial; try first on paths/trees with t=1 to see whether accumulation can matter for any LCL.
- Or try to separate the models: construct an LCL that is solvable in constant t in Online-LOCAL but provably not simulable by the above constant-phase compression; if such an LCL exists, the general reduction fails, and the sequential-local variant becomes the correct target.

Remarks
- No global edge orientation is needed anywhere in the reduction we proved; IDs suffice for coloring.
- The archived proof applies to all bounded-degree graphs; we stated trees to match the project focus.
Refinements on bridging Online-LOCAL(t) to sequential local rules
- Definitions (recap and refinement):
  • Online-LOCAL(t): vertices arrive one by one; upon each arrival we have t synchronous LOCAL rounds on the subgraph induced by arrived vertices; outputs are irrevocably set at arrival; in the general model, nodes may maintain unbounded mutable state across arrival windows.
  • Output-only Online-LOCAL(t): the only persistent state at nodes is the immutable output label after it is set; between windows there is no other state; in any t-round window, messages sent by a node are functions only of the underlying graph and the currently known outputs within its distance-t neighborhood (no dependence on farther outputs or on pre-window mutable state).
  • t-local-dependence at v: when v arrives, its output depends only on the arrived subgraph restricted to B(v,t) and outputs of the arrived nodes within B(v,t).

- Correct radius accounting:
  • At v’s arrival with window length t, nodes within B(v,t) can influence v. A node u ∈ B(v,t) may compute its messages based on outputs within B(u,t), which is contained in B(v,2t). Thus, in the output-only model, v’s output depends only on the graph structure and outputs within B(v,2t). Consequently, the correct bridge is to a sequential rule of radius 2t (not t). If we assume t-local-dependence at v, the bridge tightens to radius t.

- Minimal counter-scenario (why naive phase-compression fails for the unrestricted online model):
  Consider a path with t=1. In a genuine online run, before a vertex v arrives, Θ(n) earlier arrivals can propagate state one hop per window across the path; by the time v arrives, its neighbors may carry information injected far away. A color-phased simulation that offers only O(1) windows before v’s phase cannot reproduce these accumulated states. This shows that without output-only or t-local-dependence, we cannot black-box simulate arbitrary Online-LOCAL(t) runs by a constant number of phases.

- Practical takeaway for reductions:
  • If your online algorithm is output-only, design the sequential rule to read B(v,2t) and write only at v; then apply the G^{2t} coloring pipeline to get O(log* n) on bounded-degree trees.
  • If your online algorithm satisfies t-local-dependence at v, the sequential rule needs only B(v,t).

- Next-step plan (state elimination on trees):
  • Start on paths with t=1. Define the interface ∂B(v,2) and annulus R=B(v,2)\B(v,1). Attempt to prove: if two online executions agree on outputs over B(v,2), then they allow exactly the same outputs at v. If proven, extend to trees and t by replacing 2 with 2t. If refuted, crystallize a separation example.
  • Track read/write radii for any sequential rules that go beyond “write only at v”; use distance-(R+W) colorings for phase independence.
Additions and corrections

1) Correct simulation radius for bounded writes.
- When simulating an order-robust sequential rule that reads within B(v,R) and may write within B(v,W), independence within a color class requires both:
  • Write–write disjointness: B(u,W) ∩ B(v,W) = ∅.
  • Read–write disjointness: B(u,R) ∩ B(v,W) = ∅ and B(v,R) ∩ B(u,W) = ∅.
- These are guaranteed if dist(u,v) > max(2W, R+W). Therefore, the correct coloring is a proper coloring of G^K with K = max(2W, R+W). Using G^{R+W} alone is insufficient in general.
- Minimal counterexample to G^{R+W}: Take R=0, W=1 on the path u–x–v. Here dist(u,v)=2>R+W, but B(u,1)∩B(v,1)={x} so simultaneous writes conflict.

2) Output-only, W-write Online-LOCAL(t) ⇒ sequential (R,W) with R=2t+W.
- Model: When v arrives, A runs t rounds and may irrevocably write outputs on B(v,W); messages during this window depend only on the graph and the currently known outputs within distance ≤ t of the sender; no other mutable state persists.
- Radius accounting: To decide outputs on the patch B(v,W) within t rounds, only nodes in B(B(v,W), t) = B(v, W + t) can send messages that reach the patch. Under output-only, each such sender’s messages are functions of outputs in its own t-ball. Hence the decisions on the patch depend only on outputs within B(v, W + 2t) = B(v, 2t + W).
- Sequential rule S: For a given order σ, when processing v, S reads already-fixed outputs in B(v, 2t+W) and deterministically reproduces A’s t-window on the patch, writing only to currently-unset outputs in B(v,W). Because A is deterministic and correct for all orders, S reproduces A’s result for order σ.

3) Commutativity of independent arrivals (unrestricted Online-LOCAL(t)).
- If two consecutive arrivals u and w satisfy dist(u,w) > 2t, swapping their order leaves the t-round transcripts and resulting states identical everywhere. In particular, by repeatedly swapping, one can assume that, when analyzing v, only arrivals within B(v,2t) occur before v. This normalizes the analysis horizon for any state-elimination attempt.

4) State-elimination program on paths (t=1) — concrete targets.
- Define the interface K(v) as the already-fixed outputs on B(v,2) just before v arrives (after normalizing the order so only B(v,2) arrives first). Target claim (context-invariance): The set of feasible outputs/messages at v depends only on K(v). If true, derive a canonical sequential rule of read radius R=2 and (potential) write radius W by reproducing the canonical choice. If false, document a counterexample LCL on paths.

5) Accounting for LOCAL complexity when W>0.
- With (R,W)-local sequential rules, compute a proper coloring of G^{K} with K = max(2W, R+W) in O(K log* n) rounds (Lemma 1 simulated on G), then process colors in O(R) rounds per color. On bounded-degree trees with constant R,W, this gives O(log* n) overall.
Disproof of “faithful color-by-color simulation” for unrestricted Online-LOCAL(t)
The tempting idea to fix a proper coloring φ of G^{2t}, choose the arrival order σ_φ that processes color classes 1,2,…,C, and then simulate each color class in O(t) rounds by running all arrivals of that color concurrently, is not valid in the unrestricted Online-LOCAL(t) model.

Key obstruction: In the Online-LOCAL(t) semantics, each arrival triggers t synchronous rounds across the entire arrived subgraph. Nodes outside B(v,t) of the newly arrived vertex v may still update their local state in that step (e.g., increment a local counter) even though they receive no messages. Over k arrivals in a color class, every previously arrived node performs k such "idle" updates. Compressing k steps to 1 per color fails to reproduce the global state unless one can apply k-fold local updates everywhere, which is not locally computable in O(1) rounds.

Minimal counterexample (paths, t=1). Consider the trivial LCL Π that accepts any labeling. Define a deterministic Online-LOCAL(1) algorithm A as follows:
- Every arrived node maintains a parity bit p, initially 0, and toggles p at every arrival step (independently of messages).
- When a new vertex v arrives, in the 1-round window v queries any neighbor u (if one exists) for p and outputs that bit. (If v has no arrived neighbor, it outputs 0.)
This A is correct for Π for every arrival order (Π accepts any labeling). Fix any proper 3-coloring φ of the path’s G^2. In the sequential σ_φ-run that processes all color-1 vertices one by one, p toggles at every arrival, so the outputs of color-1 vertices alternate with their internal order. A batched O(1)-round simulation that processes all color-1 vertices simultaneously cannot reproduce these alternating outputs: all of them see the same parity p from earlier colors and output the same bit. Hence faithful reproduction of the σ_φ-run is impossible in general.

Consequences.
- The earlier “main gap” (state accumulation across many arrivals) is real for unrestricted Online-LOCAL(t): batched simulation does not, in general, preserve the online run’s state trajectory.
- To make per-color batching sound, one needs extra structure such as quiescence: outside B(v,t), the per-step state update is the identity (or, more generally, does not depend on the number of arrivals). The output-only and t-local-dependence variants already enforce related constraints.

On Lemma 8 and local order normalization
- Our Corollary 7.1 already implies the witness localization needed for per-node analysis: by swapping distant arrivals (dist > 2t), one can assume all arrivals before v occur in B(v,2t) without changing the state in B(v,t) at v’s arrival. This is the appropriate normalization tool for any local confluence/interface analysis.

On Lemma 9 (finite enumeration claim)
- As stated (“the set of possible transcripts/messages seen by v is finite”), this is false in the standard LOCAL model due to unbounded message/state spaces and dependence on unique IDs. Finite enumeration becomes viable only if one assumes bounded message alphabets, bounded state, or ID-obliviousness; otherwise, for a fixed constant-size ball B(v,2), the algorithm can encode arbitrarily large ID-dependent information into messages/states.

Next steps for the path/t=1 interface program
- Either (i) impose output-only (or stronger quiescence/ID-obliviousness) and aim to prove the context-invariance Claim C1 under those constraints, or (ii) build a concrete counterexample to C1 in the unrestricted model by letting neighbors’ 1-round messages to v depend on the number of prior arrivals while keeping K(v) fixed. In both tracks, use Corollary 7.1 to restrict attention to B(v,2).

Complexity reminder for bounded writes
- With (R,W)-local sequential rules, independence within a color class requires K = max(2W, R+W). Computing a proper coloring of G^{K} costs O(K·log* n) rounds and per-color work is O(R). For bounded Δ, R, W, this yields O(log* n) total complexity dominated by the coloring step.
New bridge via quiescence (precise form) and radius accounting
- Definition (quiescent Online-LOCAL(t), standard LOCAL timing). In each arrival step for v, the algorithm runs t synchronous LOCAL rounds on the arrived subgraph. Messages sent in round r depend only on the node’s state at the start of round r; at the end of the round, nodes update their state based on received messages. The algorithm is quiescent if, during the t rounds triggered by v’s arrival, every node u with dist(u,v) > t does not change its state in any of these t rounds. (Under the above timing, such u cannot forward newly received information in subsequent rounds because its outgoing messages in round r depend only on its unchanged state.)
- (W,t)-quiescent: If the algorithm may irrevocably write outputs on a patch B(v,W) during v’s window, we call it (W,t)-quiescent if only nodes in B(v,W+t) may change state in that window.

- Correct separation for parallel batching: To parallelize all same-color windows for t rounds without interference, it is necessary to forbid any edge between distinct active regions. For W=0 the active region for v is B(v,t). Thus, a proper coloring of G^{2t+1} (not merely G^{2t}) guarantees that for same-color u,v, dist(u,v) ≥ 2t+2, hence dist(B(u,t), B(v,t)) ≥ 2. This eliminates one-hop coupling across region boundaries. With W>0, color G^{2t+2W+1} so that distinct active regions B(·,W+t) have mutual distance ≥ 2.

- Why quiescence removes the “idle-accumulation” pitfall: In the unrestricted model, nodes can encode the number of prior arrivals into their state and/or messages, letting each new window see different ambient information; batching then fails. Under quiescence, any vertex whose t-window has not yet been processed cannot track steps that do not involve it, so its local view (modulo the already-arrived graph and earlier colors) is invariant across the internal order within a color class. Combined with the ≥2 separation between active regions, the parallel t-round simulation per color faithfully matches any sequential permutation of that color.

- Examples that fit quiescence: Greedy MIS and greedy maximal matching on bounded-degree graphs (W=1, t=1) where only the newly active 1-neighborhood changes, and (Δ+1)-vertex-coloring rules that finalize a 1-hop patch around the arrival.

Remark on Lemma 7 (2t-commutativity)
- The lemma remains valid even if nodes outside B(u,t) ∪ B(w,t) perform deterministic updates depending only on the global step index (and not on messages). Those nodes experience the same two consecutive step indices before and after the swap; hence their pair of updates is identical.

Lower-bound program (outline) for Online-LOCAL on trees
- Target: Prove that sinkless orientation on bounded-degree trees admits no deterministic Online-LOCAL(t)=O(1) algorithm (adversarial arrival). Use Lemma 7/Cor. 7.1 to normalize prefixes so that only B(e,2t) arrives before deciding edge e. Then adapt the node↔edge round-elimination locally inside B(e,2t), iterating 2t times to obtain a 0-round contradiction with the ID-graph property. Formalizing this (LB.1–LB.2) would non-constructively imply: any LCL with constant-t Online-LOCAL on trees lies in the O(1)/Θ(log* n) class, so there exists an O(log* n) deterministic LOCAL algorithm.

Next steps
- Integrate the quiescent bridge with K=2t+1 (resp. 2t+2W+1) into output.md.
- Begin the path (t=1) state-elimination-by-quiescence attempt with a precise interface Σ(u→v) and normalized histories (via Cor. 7.1). Either prove context-invariance or extract a counterexample LCL.
- In parallel, formalize LB.1–LB.2 for sinkless orientation as described above.
Additions (witness localization, phase-locality, and LB pitfalls)

1) Strong witness localization at v (unrestricted Online-LOCAL(t)). Using Lemma 7 (2t-commutativity), one can bubble v leftward across any predecessor u with dist(u,v) > 2t. Performing all such swaps yields an arrival sequence in which every predecessor of v lies in B(v,2t). Moreover, the set of predecessors of v inside B(v,2t) is unchanged, so the arrived subgraph just before v equals the restriction of the original arrived subgraph to B(v,2t). Each swap preserves the state on B(v,t) at v’s arrival; hence the state on B(v,t) when v arrives is identical before and after normalization. This refinement is now recorded as Lemma 9 in output.md.

2) Phase-locality under (W,t)-quiescence. In Lemma 8’s color-phase simulation with K = 2t+2W+1 (so that dist(R_v,R_w) ≥ 2 for R_v = B(v,W+t)), nodes outside R := ⋃ R_v keep their state fixed in the t rounds of the phase. Under standard LOCAL timing (send from current state; receive; update), such nodes cannot forward newly received information in later rounds. Therefore, there is no causal influence along any path that leaves one active region and re-enters another within the same phase. The transcript inside each R_v depends only on the initial boundary states, and the effects of different R_v commute. This is now formalized as Claim 8.1 inside Lemma 8’s proof.

3) Localized round-elimination on trees: modeling choices and a gap. The intended LB.1 (node→edge) step asserts that if both endpoints have local witnesses for opposite orientations of an edge e inside B(e,2t), then one can glue these into a single global execution that contradicts correctness. This is not valid for the node-form of sinkless orientation: both endpoints may “grab” e without violating the constraint that every node has at least one outgoing edge. To proceed, adopt one of:
- Edge-form LCL with decisive step at the second endpoint, so “double-witness in opposite directions” is a genuine contradiction; or
- A universal-quantifier version of the elimination step, together with a proof that the universal property is preserved by iteration; and in all cases
- A precise normalization-and-extension lemma: any normalized local arrival order inside B(e,2t) extends to a global order whose transcript inside B(e,t) (up to the decisive step for e) is preserved.

4) Radius sanity. The +1 in K = 2t+2W+1 (for quiescent batching) is necessary to guarantee dist(R_v,R_w) ≥ 2 and exclude one-round coupling across a single cross-edge. In contrast, in Corollary B we simulate a derived sequential (R,W)-rule and only require K = max(2W, R+W) (no +1).

Next steps (crisp):
- Prove the normalization-and-extension lemma for balls B(e,2t) on trees.
- Fix the problem model for the LB route (edge-form with a decisive step, or a universal-quantifier variant) and re-state LB.1/LB.2 accordingly; then supply complete proofs.
- Continue the path, t=1 interface study under quiescence or output-only; either prove context-invariance or give a counterexample LCL confined to B(v,2).
Critical audit: normalization around an edge and boundary freezing

- Edge-prefix extension (valid). For any edge e=uv and any finite arrival prefix τ consisting of distinct vertices of B(e,2t), there is a global arrival order σ whose first |τ| arrivals are exactly τ, and no vertex outside B(e,2t) arrives before those steps. Running A on σ and on the induced local execution confined to the arrived subgraph inside B(e,2t) produces identical states/outputs on B(e,t) at each of those |τ| steps. This is immediate from the model: outside vertices are simply absent.

- The converse normalization (invalid). It is not generally possible to transform an arbitrary global schedule into one in which no vertex outside B(e,2t) arrives before the decisive moment for e while preserving the state on B(e,t) step-by-step (or even at the decisive moment). The obstruction is that outside arrivals at distance > 2t from e can influence B(e,t) before the second endpoint arrives via chains of arrivals inside B(e,2t), and Lemma 7 (2t-commutativity) allows swaps only for pairs of arrivals at pairwise distance > 2t.

Counterexample (t = 1 on a path). Let the path be … x3 – x2 – x1 – u – v – y1 – y2 – y3 … with e = uv. Consider an Online-LOCAL(1) algorithm A that maintains at each arrived node a persistent bit s (initially 0). Upon an arrival of w, in the single LOCAL round each already-arrived node sends its current s to arrived neighbors; the new node w sets its own s to the parity of the s-values it receives (or 0 if it has no arrived neighbor). Now take the arrival order: x3 (outside B(e,2)), x2, x1, u (first endpoint), v (second endpoint). When x2 arrives, it sets s(x2) based on s(x3); then x1 sets s(x1) based on s(x2); by the time v arrives, s(x1) depends on x3’s early arrival, and the state on B(e,1) at the decisive moment reflects that influence. One cannot push x3 past v by a sequence of swaps allowed by Lemma 7 without encountering swaps with x2 or x1, which are at distance ≤ 2t from x3. Thus the “moreover” normalization fails even on a path.

Implication for elimination. Any node→edge elimination step that freezes a boundary ∂B around e and then quantifies over local schedules inside B must justify why the boundary states are fixed and unaffected by outside arrivals up to the decisive time. In the unrestricted online model, boundary nodes may change state many times before e is decided, driven by outside arrivals; there is no general way to ignore or freeze that evolution. Consequently, the proposed universal set-valued rule that depends only on B(e,2t) and a fixed boundary snapshot is not yet sound.

On finite type spaces. Classical round-elimination relies on a finite set of local types induced by t-round views. Here, without restrictions (output-only, quiescence, finite-state, ID-obliviousness), the set of possible boundary states at distance 2t is unbounded. Any lower-bound scheme must either (i) prove a compaction lemma that only finitely many boundary features can influence the decision at e, or (ii) work within a restricted model where such a bound is immediate.

On the “+1” in K for quiescent batching. The rationale remains correct: to forbid any within-phase signal that leaves one active region and re-enters another, we must ensure there is no single cross-edge between distinct active regions. For W=0, R_v=B(v,t); for general W, R_v=B(v,W+t). A proper coloring of G^{2t+2W+1} guarantees dist(R_v,R_w) ≥ 2 for same-color v≠w, which is exactly what Claim 8.1 uses.

Next steps.
- Keep only the safe edge-prefix extension fact; drop the converse normalization from any formal statements.
- If pursuing elimination, restrict the model to obtain finite boundary types (output-only, (W,t)-quiescent, or finite-state/ID-oblivious), and then formalize universal-set node↔edge steps, including exact radius accounting, preservation of nonemptiness, and node constraints.
- Alternatively, attempt a compaction lemma in the unrestricted model: prove that for sinkless orientation on trees, the orientation at e at the decisive moment depends only on a finite equivalence class of the evolving boundary at radius 2t. If this fails, document a counterexample LCL.
- Optionally, provide a formal tightness example for the +1 in Lemma 8 with t≥2 on paths to complement the existing remark.
New: Adversarial schedule-localization for an edge and audit of edge-centered set steps

Edge-local adversarial scheduling (safe primitive)
- Lemma S (informal). For any edge e=uv and t≥1, the adversary can choose an arrival order in which all vertices of B(e,2t) arrive before any vertex outside B(e,2t). In such a run, the decision that A makes at e at the moment the second endpoint arrives depends only on the labeled type of B(e,2t) and on the internal arrival order within that ball; the outside is simply absent up to that moment.
- Rationale. This is not a transformation of a given schedule but a fresh adversarial choice, fully permitted in the model (A must succeed for all arrival orders). The lemma avoids any boundary-freezing assumption or converse normalization.

Audit: why the proposed node→edge universal set step on B(e,2t) breaks at a node w
- Setup. Prover 01 defines S_e(X_e) for each edge e using only the 2t-ball around e (outside absent) and claims a node-side "no-sink in sets" property: at each w, among incident edges e∋w at least one S_e contains an orientation pointing away from w.
- Issue (non-composability across edges). The proof switches to a schedule over U_w := ⋃_{e∋w} B(e,2t) that decides all edges at w while keeping outside-U_w absent. For a given e=wx, this schedule may include arrivals of vertices in U_w\B(e,2t) before e is decided; their windows can alter states of nodes inside B(e,2t) via boundary interactions over multiple steps. Consequently, the decision at e in this U_w-schedule need not be among those seen when only B(e,2t) is present. Hence one cannot conclude that forbidding “outward at w” in all S_e forces w to be a sink in the U_w-schedule. This breaks the claimed node-side constraint for the S_e defined on B(e,2t).

Fix: define node-centered sets on U_w
- Define U_w as the union of radius-2t edge-balls around edges incident to w. On trees and for fixed Δ,t, U_w has constant size (radius ≈ 2t+1 around w).
- Define a node-centered set T_w(X_w) on the finite type X_w of U_w (port-colored, ID-graph labeled) as the set of incident port directions at w that can be oriented outward under some internal arrival order confined to U_w (outside-U_w absent) while deciding all incident edges. Nonemptiness of T_w follows from correctness: if T_w were empty, then in every internal order on U_w the run would decide all incident edges pointing into w, making w a sink in a valid schedule.
- After this node-side step is formalized, attempt the symmetric derivation of per-edge sets from neighbors’ node-sets, carefully auditing radius changes and ensuring that admissibility and node-side constraints are preserved under the same adversarial scheduling principle.

Output-only variant (repair to LBoo.1)
- Use union-over-orders (not intersection) for admissible sets and work with node-centered T_w on U_w. In output-only, type finiteness is immediate (finite output alphabet; bounded-radius balls). The same composability caveat applies if one insists on per-edge sets based on B(e,2t); prefer node-level sets on U_w for the “no-sink” constraint.

On the +1 in Lemma 8
- The necessity of K=2t+2W+1 is correct in spirit. To promote this to a formal proposition, provide an explicit quiescent (W=0), t=2 algorithm on a path that uses a 2-round relay across a single cross-edge to couple the two active regions when K=2t, thereby violating phase-independence. Until the explicit construction is documented, we retain the existing explanatory remark after Lemma 8.

Action items
- Formalize T_w on U_w (types, finiteness, nonemptiness, and node-side “no-sink”) and then the edge↔node half-step with precise radius accounting.
- For the output-only regime, rework LBoo.1 accordingly and track the invariants under iteration to a 0-round contradiction via the ID-graph.
- Provide the explicit t=2 path example for the +1 necessity.
Node-centered admissible sets and safe composition (lower-bound scaffolding)

Setup and motivation.
- The earlier per-edge universal-set construction on B(e,2t) was non-compositional at nodes: deciding multiple incident edges of a node w in a larger prefix can involve arrivals inside U_w := ⋃_{e∋w} B(e,2t) that are outside an individual B(e,2t) yet influence it before the edge is decided. This invalidates any argument that freezes the boundary of B(e,2t).
- Remedy: Move admissible-set construction to the node level on U_w, quantify over all internal orders confined to U_w (outside absent), and only then derive per-edge sets from the two endpoint node-sets. This keeps all dependencies within constant-radius type spaces and preserves a node-side “no-sink-in-sets” invariant.

Definitions.
- For a node w, let U_w := ⋃_{e∋w} B(e,2t). On trees, U_w ⊆ B(w,2t+1).
- Fix edge-decided semantics for sinkless orientation: the orientation of an edge e is irrevocably fixed at the moment the second endpoint of e arrives.
- Let X_w denote the labeled isomorphism type of U_w with root w (graph structure, port numbering, and IDs). For a type X_w, let Ord_w(X_w) be the set of internal arrival orders of U_w that end after the second endpoints of all edges incident to w have arrived; vertices outside U_w are absent up to that time.
- Define the node-level admissible set of outward ports at w by
  T_w(X_w) := { p ∈ Ports(w) : ∃ τ ∈ Ord_w(X_w) s.t. the incident edge on port p is oriented out of w when all incident edges at w are decided in the τ-run }.

Key facts (all justified in output.md now).
- Node-local schedule localization (Lemma S_node): the adversary can list all of U_w first; up to the time all edges incident to w are decided, the transcript depends only on the labeled type X_w and on the internal order on U_w.
- Lemma T (node-centered admissible ports): For every node type X_w, T_w(X_w) is well defined and nonempty. Proof idea: if T_w(X_w)=∅, then under every internal order on U_w (outside absent) all incident edges are decided into w, permanently making w a sink in a valid schedule.
- Node→edge derivation: For an edge e=wx, define S_e := { w→x if x corresponds to a port in T_w(X_w) } ∪ { x→w if w corresponds to a port in T_x(X_x) }. Then:
  • Locality: S_e depends only on the labeled type of B(e,2t+1) (since X_w and X_x are determined within it).
  • Preserved node-side no-sink: For every node w, there exists an incident edge e with w→• ∈ S_e (because T_w(X_w) ≠ ∅).

Invariants to maintain under alternation.
- I1 (Local type dependence): T_w(X_w) depends only on X_w (radius ≤ 2t+1); S_e(X_e) depends only on the type X_e of B(e,2t+1).
- I2 (Node-side nonemptiness): For every X_w, T_w(X_w) ≠ ∅; equivalently, for every node w there exists an incident edge e with an outward option for w in S_e.
- I3 (Adversarial soundness): T_w is defined via existential quantification over all internal orders on U_w with the outside absent, so it is sound for every global arrival order.
- I4 (Radius accounting): Node types use radius 2t+1; edge types use radius 2t+1.

+1 necessity in Lemma 8 (quiescent batching).
- For W=0, t=2 on a path, if we color G^{2t}=G^4 (no +1), two same-color centers a and b can be at distance 5, so R_a = B(a,2) and R_b = B(b,2) are disjoint but have a single cross-edge between boundary nodes x∈R_a and y∈R_b. A quiescent 2-round algorithm can let y’s bit cross to x in round 1 and reach a in round 2, coupling the regions. Coloring G^{2t+1} ensures dist(R_a,R_b) ≥ 2, preventing such coupling. A fully explicit proposition and proof are now archived.

Finiteness of type spaces.
- As noted earlier, with arbitrary IDs there are infinitely many labeled types of constant-radius balls. For a finite-type iteration, adopt the standard ID-graph framework: fix a finite labeled constant-degree graph H of sufficiently large girth, and restrict attention to H-labeled trees. All local types induced by bounded-radius balls in H are then finite. Lemmas S_node and T hold independently of finiteness; we will invoke finiteness only when we iterate the node↔edge steps.

Next steps.
- Formalize the symmetric edge→node half-step: define S_e(X_e) by existential quantification over internal orders on Z = U_u ∪ U_v (outside absent), then define a successor node-level T′_w that preserves nonemptiness and locality, ideally shrinking radius by 1/2 per half-step.
- Prove that alternation maintains I1–I3 and delivers a 0-round contradiction under the ID-graph framework, completing the lower bound for sinkless orientation in Online-LOCAL(t).
- In parallel, thread the same node-centered set machinery through the output-only model to obtain a simpler, fully finished lower bound there.
