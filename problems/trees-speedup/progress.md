## Round 0001 — 2025-08-27T15:08:55.312111Z

Goal and target claim
- Target we propose to prove: If an LCL Π on bounded-degree (nonoriented) trees admits a deterministic online-local algorithm with constant locality r = O(1), then Π has a deterministic LOCAL (message-passing) algorithm with round complexity O(log* n).
- Why useful: This gives the desired speedup from the online local model to the standard LOCAL model on trees, matching the Θ(log* n) symmetry-breaking regime and aligning with known classifications (Theorem 2.33 in the attached notes).

Idea in one sentence
- Reduce a constant-radius deterministic online-local algorithm to a deterministic sequential local algorithm with the same radius, then simulate it in the LOCAL model by (i) computing an O(Δ^{O(r)})-coloring of the power graph G^r in O(r log* n) rounds and (ii) executing r-round phases by colors; with Δ bounded and r = O(1), total is O(log* n).

Model bridging and key lemmas (clean statements with “why useful”)
- Lemma A (Online ⇒ Sequential local, constant radius): Let Π be an LCL on bounded-degree graphs. If Π has a deterministic online local algorithm that (for any adversarial vertex order) decides each vertex’s output using only its r-hop neighborhood and previously fixed outputs within that neighborhood, then Π admits a deterministic sequential local algorithm of local complexity r (in the sense of Definition 1.3 in the notes).
  - Why useful here: The simulation framework (Theorem 2.5 in the notes) converts sequential local algorithms to distributed ones. This lemma lets us plug online-local algorithms directly into that framework.
  - Proof sketch to be formalized: Fix any adversarial order; define the sequential rule to perform exactly the online rule when visiting a vertex, using already determined outputs in its r-hop neighborhood as the online algorithm would. Since the online algorithm must succeed for all orders, the resulting sequential algorithm succeeds for every order.

- Lemma B (Power-graph coloring in O(log* n)): For any bounded-degree graph G and constant r, one can compute in the LOCAL model a proper coloring of G^r with O(Δ(G^r)^2) = Δ^{O(r)} colors in O(r log* n) rounds.
  - Why useful here: The coloring provides a schedule with O(Δ^{O(r)}) parallel phases in which vertices at pairwise distance > r act simultaneously without conflicts in the sequential simulation.
  - Support: Linial’s color reduction (Theorem 2.4 in the notes) computes a Δ(G^r)^{O(1)}-coloring of G^r in O(log* n) rounds on G^r; simulating a G^r round on G costs r rounds ⇒ total O(r log* n). (Bounded-degree implies Δ(G^r) ≤ Δ^r.)

- Lemma C (Color-phased simulation of sequential local A): Let A be a deterministic sequential local algorithm for Π of locality r. Given a proper coloring of G^r with c colors, one can simulate A in the LOCAL model in c · O(r) additional rounds: process colors 1,2,…,c; in color i, each vertex gathers the outputs (and any auxiliary state) within distance r restricted to colors < i and computes its own output/state by A.
  - Why useful here: This yields a LOCAL simulation with round complexity c·O(r) = Δ^{O(r)} for the simulation after the coloring is available.
  - Correctness intuition: By definition of G^r-coloring, vertices of the same color are at distance > r, so their simulations do not depend on each other. Sequential local algorithms are defined to succeed regardless of order, so the color order is a valid global order.

- Corollary (Putting B + C together): For bounded-degree graphs and constant r, the LOCAL round complexity is O(r log* n) (coloring) + Δ^{O(r)}·O(r) (simulation). With Δ constant and r = O(1), this is O(log* n).
  - Why useful here: It gives the exact O(log* n) bound we want for nonoriented trees (indeed, for any bounded-degree graphs).

Clarifying the online-local model assumptions (potential gap to check)
- We are relying on the version of the deterministic online local model in which:
  1) Vertices are processed in an adversarial order; upon processing a vertex u, the algorithm can only inspect B(u,r) in the current graph and the already-fixed outputs in that ball; the choice is irrevocable.
  2) The algorithm must succeed for every adversarial order. 
- This matches the “sequential local algorithm” model in Definition 1.3 (deterministic, order-robust) once we fix r. If the online model allowed dependence on future arrivals (it shouldn’t) or only guaranteed success for a specific order, Lemma A would fail. Action item: confirm that the online-local definition we use matches [Akb+23; Chang et al. 2023] for trees.

Examples/sanity checks
- Example 1: Weak 2-coloring on bounded-degree trees. Known to be solvable in constant locality sequentially; by our pipeline, LOCAL complexity O(log* n) — consistent with classic results.
- Example 2: Sinkless orientation on trees. Known deterministic LOCAL lower bound is Ω(log n) (Theorem 2.15); thus no constant-radius deterministic online algorithm can exist, consistent with the contrapositive.

Obstacles and subtle points
- Port numbering/orientation: Our argument does not require oriented trees. Linial’s color reduction and the power-graph coloring use unique IDs; they do not need a global orientation. The LCL constraints are checked on unlabeled, port-numbered neighborhoods as usual.
- Auxiliary state in sequential algorithms: Definition 1.3 allows storing auxiliary state at each step. In the LOCAL simulation, we carry auxiliary state along phases as metadata; only the final “output label” needs to satisfy Π. This is standard in the Theorem 2.5 simulation.
- Dependence on Δ and r: The number of colors c in the G^r-coloring is Δ^{O(r)}. Since we restrict to bounded-degree trees and r = O(1), c = O(1); hence the c·O(r) term is constant, leaving O(log* n) overall due to the coloring step.

Relation to known results (how this fits in the literature)
- This is a specialization of Theorem 2.5 (sequential ⇒ distributed simulation via coloring) to the case t = r = O(1), plus Lemma A to bridge from online-local to sequential-local. The resulting O(log* n) bound recovers the symmetry-breaking regime on trees (Theorem 2.33), and works in the nonoriented setting.
- Note: The statement actually holds on any bounded-degree graph, not only trees; we emphasized trees to match the task wording.

Actionable next steps to move to output.md
- Formalize Lemma A with a precise definition of the deterministic online-local model; include a short proof that it induces a deterministic sequential local algorithm of the same locality r.
- State and prove Lemma B with an explicit citation to Linial’s color reduction and the simulation overhead to work on G instead of G^r.
- State and prove Lemma C (the color-phased simulation) carefully, including the auxiliary state bookkeeping and the per-phase O(r) implementation details (what needs to be communicated each phase).
- Combine the lemmas into the main theorem for bounded-degree (nonoriented) trees, explicitly tracking constants: total rounds O(r log* n) + Δ^{O(r)}·O(r) = O(log* n).

Notes on gaps/missing justifications in output.md
- There is currently no output.md provided; hence no curated results to audit. When drafting output.md, please include: (i) precise model definitions, (ii) the three lemmas above with proofs, (iii) the combined theorem, and (iv) a short remark that the proof does not use orientation of the tree.

## Round 0001 — 2025-08-27T15:09:44.908376Z

Ideas and goal
- Target claim (tree version of “speedup”): Let Π be an LCL on bounded-degree, unoriented trees. If Π has a deterministic online-LOCAL algorithm with constant round complexity t = O(1), then Π has a deterministic LOCAL (standard distributed) algorithm with round complexity O(log* n).
- Intuition: Fix any online algorithm A that works for every arrival order. We will impose an artificial arrival order derived from a distance-(2t) vertex coloring and then simulate A in phases of colors. Computing such a distance coloring takes O(t·log* n) rounds in LOCAL on bounded-degree graphs (via Linial’s color reductions on the power graph). The phase-by-phase simulation of A costs O(1) additional rounds since the number of colors is a Δ^{O(t)} constant. Therefore, total complexity is O(log* n).

Model alignment and assumptions to state precisely
- Online-LOCAL (deterministic), following Akbari–Eslami–Lievonen–Melnyk–Särkijärvi–Suomela (ICALP’23): vertices arrive in an adversarial order; when a vertex v arrives, edges to previously arrived neighbors are revealed; the algorithm may perform t synchronous LOCAL rounds on the current revealed graph to decide the output for v (deterministically), and outputs are irrevocable. The LCL Π has checkability radius rΠ.
- LOCAL (deterministic): standard model with unique IDs from poly(n) and synchronous message passing. We are allowed O(log* n) time. Degree Δ is a fixed constant (bounded-degree trees).
- Nonoriented tree: no global edge orientation is given; port numbers may be arbitrary; our construction does not assume any edge orientation.

Key technical ingredients
1) Distance-power coloring in O(log* n):
   - For any fixed k = O(1), we can compute a proper coloring of G^k (i.e., nodes at distance ≤ k get distinct colors) with C = Δ^{O(k)} colors in O(k·log* n) LOCAL rounds. This follows by running Linial’s color reduction (Theorem 2.4 in the Rozhoň notes) on the power graph G^k; one round in G^k is simulated by k rounds in G. For bounded Δ and fixed k, the number of colors C is a constant independent of n.
   - Why useful here: If nodes of the same color are at distance > 2t, then their t-hop neighborhoods in G are disjoint. This enables parallel, interference-free simulation of online steps for all nodes of the same color.

2) Color-phased simulation of an online algorithm:
   - Let A be a deterministic online-LOCAL t-round algorithm for Π that succeeds for all arrival orders. Compute a distance-(2t) coloring φ: V→[C]. We define a canonical arrival order compatible with φ: all nodes of color 1 arrive first (in any order), then all of color 2, …, up to color C. Since A works for all orders, it works for this order.
   - We simulate this order in LOCAL as follows. We proceed in phases i = 1,2,…,C.
     • In phase i, all nodes v with φ(v)=i simultaneously “arrive” and run A for t rounds, but communication is restricted so that they only exchange messages with already “arrived” nodes (colors < i) and other newly arrived nodes in their own radius-t neighborhoods. Nodes of colors > i remain passive.
     • Because φ is a distance-(2t) coloring, for any two nodes v,w with φ(v)=φ(w)=i we have dist(v,w)>2t, so B(v,t) and B(w,t) in G are disjoint. Hence their t-round simulations touch disjoint parts of the revealed subgraph and can be done in parallel without conflicts.
   - Practical implementation detail: To enforce the restriction “only talk to earlier colors”, each node exchanges color values with neighbors, and in phase i, nodes with colors > i simply ignore messages (remain silent). Nodes of color i can collect all needed information from their radius-t region intersected with colors < i.

3) Inductive correctness of the simulation:
   - Invariant I(i): After phase i, all nodes with colors ≤ i have outputs exactly matching those produced by running A on the arrival order in which colors 1,…,i have arrived (in any internal order) and other nodes have not arrived yet.
   - Base i=0: vacuous. 
   - Step i→i+1: For any v with φ(v)=i+1, the t-round transcript available to v during phase i+1 in our simulation depends only on the already fixed outputs of nodes with colors ≤ i and the structure of the revealed subgraph within distance t from v. This transcript is identical to what A would see when v arrives next in the chosen arrival order, because nodes with colors ≤ i have already “arrived” (their outputs fixed) and nodes with colors > i+1 have not arrived and remain silent. Since simulations of nodes of color i+1 run in disjoint t-neighborhoods, we can fix their outputs simultaneously without interference. Hence I(i+1) holds.
   - At the end of phase C, all nodes are assigned outputs equal to running A on the full arrival order determined by colors. Since A is correct for any order, the output labeling satisfies Π.

4) Complexity accounting:
   - Coloring: O(2t·log* n) = O(log* n) rounds (since t=O(1)). Number of colors C = Δ^{O(2t)} = constant (independent of n).
   - Simulation of phases: C phases, each needing t rounds of local messaging restricted to earlier colors. Total O(C·t) = O(1).
   - Overall: O(log* n) deterministic LOCAL algorithm.

Formal statement (to be checked and polished)
Theorem (Online-to-LOCAL speedup on bounded-degree trees). Let Π be an LCL with checkability radius rΠ on the class of bounded-degree trees (maximum degree Δ). Suppose Π has a deterministic online-LOCAL t-round algorithm A for some constant t. Then Π has a deterministic LOCAL algorithm with round complexity O(log* n).

Sketch proof: As above, using a distance-(2t) coloring of G and phase-by-phase simulation of A. The only model-specific subtlety is ensuring that in phase i, nodes with colors > i are silent so the new nodes only access the “revealed” portion, exactly as in the online process. The distance-(2t) coloring guarantees disjointness of the t-neighborhoods of simultaneously arriving nodes, so their simulations are independent. Since A is deterministic and succeeds for all arrival orders, correctness follows for the specific color-induced order.

Notes and why trees/nonorientation
- The proof as written uses only bounded degree and does not exploit any particular property of trees beyond the bounded degree. Thus, the same speedup holds for general bounded-degree graphs under the same online-LOCAL definition. Since the task asked for trees, we have specialized the statement, but the argument is robust to extension.
- No global orientation is required anywhere; we do not require rooted trees or consistent port orderings beyond what standard LOCAL presumes.

Examples / sanity checks
- If Π is trivial (e.g., a constant labeling), then the construction yields O(log* n) trivially. 
- If Π is 2-coloring of bipartite trees, and if there existed a deterministic O(1)-round online algorithm, our reduction would produce an O(log* n)-round LOCAL algorithm, which is consistent with the known Θ(log* n) bounds on cycles/grids and with tree LCL classifications (Theorem 2.33 in the Rozhoň notes).

Potential obstacles and how we address them
- Does the online algorithm use global knowledge (e.g., n)? In online-LOCAL as per [Akb+23], nodes do not know n, and here t is constant, so our simulation does not require such knowledge.
- Does it matter that online processes one vertex at a time while we process an entire color class in parallel? No: distance-(2t) separation ensures that nodes in the same color do not interact within t rounds of A. Hence parallelization is safe.
- Checkability radius rΠ: A may decide at v even if some constraints with not-yet-arrived neighbors cannot be checked yet. Our simulation mirrors the exact run of A under the chosen order, so the final labeling is valid by A’s correctness.

Precise lemmata proposed for formal write-up
- Lemma 1 (Distance-power coloring): For fixed k and bounded Δ, there is a deterministic LOCAL algorithm that computes a proper coloring of G^k with Δ^{O(k)} colors in O(k·log* n) rounds.
- Lemma 2 (Phase-locality): If φ is a proper coloring of G^{2t}, then for any color i, the t-hop neighborhoods B(v,t) for nodes v with φ(v)=i are pairwise disjoint. 
- Lemma 3 (Faithful phase simulation): Given a deterministic online-LOCAL t-round algorithm A and a color order 1,…,C, the phase i simulation in which nodes of color i interact only with nodes of colors < i for t rounds produces exactly the outputs A would produce if nodes arrived in that color order.
- Theorem (Speedup): Combine Lemmas 1–3 and the “works for all orders” property.

Why useful here
- This yields the desired O(log* n) upper bound from any constant-round deterministic online-LOCAL upper bound. It matches the known folklore that order-based/online constant-time local rules can be turned into LOCAL algorithms with only the symmetry-breaking overhead of computing a distance coloring (O(log* n)).

Gaps/open points to clarify in the next round
- Precisely restate the online-LOCAL model we assume (cite [Akb+23]) and check that the above simulation conforms to it (e.g., whether earlier nodes may continue to communicate after committing their outputs; our simulation allows t rounds of interaction per phase, which matches per-arrival t rounds).
- Fix exact distance parameter for coloring: 2t suffices for independence of t-neighborhoods; if we prefer extra slack, 2t+1 can be used with identical asymptotics.
- Make explicit the handling of port numbering and input labels in LCL definition; the proof is oblivious to these details.

Relation to literature
- The simulation mirrors the sequential-to-distributed simulation principle (Theorem 2.5 in the Rozhoň notes) but replaces “sequential local” by “online-LOCAL” and avoids network decomposition; distance-power coloring suffices on bounded-degree graphs to get O(log* n). 
- The distance-power coloring step is a direct application of Linial’s O(log* n) coloring reductions on power graphs (Theorem 2.4), and standard “simulate G^k by k rounds in G”.

Status of outputs
- There is no output.md provided; hence no existing curated results to correct. The above provides a concrete reduction plan, key lemmata, and a proof skeleton ready to be formalized.

Next steps
- Write the full formal proof with the three lemmata and the main theorem, with all radii/constants explicit and a rigorous induction over color phases.
- Add a short discussion that the same argument actually applies to bounded-degree graphs beyond trees, if desired by the project scope.
- Consider an extension to randomized online algorithms (expecting a similar speedup to randomized LOCAL with O(log* n) or to deterministic LOCAL via derandomization), and map the exact bounds (optional).

## Round 0002 — 2025-08-27T15:19:52.625785Z

Ideas
- Clarify target model and bridge. The archived Theorem A already proves the O(log* n) speedup from an order-robust r-local sequential algorithm that only writes the output at the current vertex. To reach the stated Online-LOCAL(t) goal, we propose the following incremental plan.
  1) Define a t-local-dependence property for deterministic Online-LOCAL(t): when vertex v arrives, its output depends only on the induced arrived subgraph inside B(v,t) and the already fixed outputs in that ball (no dependence on mutable state originating outside B(v,t)).
  2) Lemma (Online-LOCAL(t) with t-local-dependence ⇒ sequential r-local): Under this property, fixing any arrival order produces a local decision rule of radius r=t that is order-robust and writes only at the current vertex. This drops directly into Theorem A, giving O(log* n) in LOCAL.
  3) Conversion attempt on trees: For LCLs on bounded-degree trees, try to transform any constant-t Online-LOCAL algorithm into one satisfying t-local-dependence with the same t (or t′=O(t)). Intuition: on trees, arrivals at distance >2t commute (their effects on B(v,t) do not interact), and an adversarial order certification plus a confluence-style argument should let us “erase” far-away influences without affecting correctness.

Examples and sanity checks
- Toy counterexample to naive phase compression (why we need the extra property). Consider a path and t=1. In a genuine online run that processes almost all nodes on the left before v, one-hop state can per-arrival propagate across the path and reach the neighbors of v before v arrives. A color-phased simulation that grants only O(1) rounds before v’s phase cannot reproduce these accumulated states. Hence the earlier invariant “simulate an identical transcript” fails in the unrestricted online model.
- Benign class where the reduction works: problems for which nodes never maintain auxiliary state, and per-arrival message contents are functions of already fixed outputs within distance ≤t (e.g., greedy MIS/Maximal Matching in their purely local sequential guise). These satisfy t-local-dependence and are covered by Theorem A via the proposed Lemma.

Obstacles
- Unrestricted Online-LOCAL(t) admits unbounded many t-round windows before a vertex arrives; local states in B(v,t) may depend on far-away arrivals via long chains of arrived vertices. Without t-local-dependence, a color-phased simulation cannot in general reconstruct the per-arrival transcript or even guarantee correctness.
- Confluence on trees is nontrivial: While arrivals at distance >2t commute, establishing a global Church–Rosser–type property that yields a canonical local state in B(v,t) independent of far-away order requires careful formalization of the per-arrival t-round “rewrite steps”.

Proposed lemmas (clean, checkable)
- Definition (t-local-dependence). A deterministic Online-LOCAL(t) algorithm A has t-local-dependence if, when vertex v arrives, its output is a function of the arrived subgraph induced in B(v,t) and of the already fixed outputs within B(v,t); in particular, it does not depend on any additional mutable states in B(v,t) that could have been imported from beyond B(v,t).
- Lemma 1 (Bridge under t-local-dependence). If Π has a deterministic Online-LOCAL(t) algorithm with t-local-dependence, then Π has a deterministic order-robust t-local sequential algorithm that writes only at the current vertex. Why useful: plugs directly into Theorem A to get O(log* n) LOCAL on bounded-degree graphs.
  Sketch: Fix any adversarial order. At v, read G[B(v,t)] and the outputs already fixed within B(v,t). By t-local-dependence, this determines exactly the output that A would produce when v arrives under that order; writing only at v yields an order-robust sequential rule.
- Lemma 2 (Power-graph coloring as in output.md). Already archived; we will use k=r=t.
- Lemma 3 (Color-phased simulation of order-robust rules). Already archived; note the “writes only at v” hypothesis. If a rule may write to neighbors, replace G^r-coloring by G^{2r}-coloring; the asymptotics on bounded-degree graphs remain O(log* n).

Next steps (auditable)
- Formalize Lemma 1 and add to output.md the “writes only at v” caveat explicitly (or the G^{2r} variant). Provide a crisp proof.
- Attempt a tree-specific conversion from arbitrary Online-LOCAL(t) to t-local-dependence. Plan: model each arrival as a local rewrite acting on radius-t views; prove commutativity for arrivals at distance >2t; use acyclicity of trees to show that the local state in B(v,t) at the time v arrives has a canonical form depending only on outputs in B(v,t). If successful, this removes the extra assumption on trees.
- In parallel, explore lower bounds: adapt round-elimination or known hard LCLs on trees (e.g., sinkless orientation) to Online-LOCAL, aiming to show they require Ω(log n) even there. This would indirectly support the classification-based route: constant-time Online-LOCAL cannot handle the log n-class, hence any LCL solvable in O(1) Online-LOCAL sits in the O(1)/Θ(log* n) bucket.
- Construct toy counterexamples to test necessity/tightness of t-local-dependence: try to design an LCL and an Online-LOCAL(1) algorithm whose output at v provably depends on imported far-away state within B(v,1). If such an LCL exists, then the general reduction needs genuinely new ideas (or must fail for that problem).

Notes on gaps or edits for output.md
- Lemma 2 currently assumes the sequential rule “reads within distance r and writes only at the current node”; mention this hypothesis explicitly. If one wishes to allow writing to neighbors within distance r, modify the coloring to G^{2r} to ensure independence of same-color phases.
- The remark about Online-LOCAL(t) correctly flags the key gap: unlimited accumulation of state prior to an arrival. We will add Definition/Lemma (t-local-dependence and bridge) if the verifier agrees; this would document a precise condition under which the claimed speedup is valid for online algorithms as well.

Why this is progress
- We identified the precise barrier preventing a direct reduction from Online-LOCAL(t) to LOCAL and proposed a concrete, checkable locality-of-dependence condition that suffices to bridge the models.
- We outlined a tree-specific confluence program that, if proven, removes the extra assumption and would settle the original task.
- We gave a tight modification to the archived Lemma 2 concerning writing side effects and the need for G^{2r}-coloring, which the verifier can incorporate immediately.

## Round 0002 — 2025-08-27T15:20:40.448756Z

Summary of status and gaps
- The archived output (Theorem A, Lemma 1–2, Corollary A) cleanly proves the O(log* n) speedup on bounded-degree trees for the order-robust r-local sequential model (aka “greedy sequential local”), with the important restriction “reads within distance ≤ r, writes only at the current vertex”. This is correct and standard.
- However, the task statement requests the speedup for a “deterministic online local model”. In the literature there are two different models under this name:
  1) Order-robust r-local sequential model (what we already handled in output.md).
  2) Online-LOCAL(t) model of Akbari–Eslami–Lievonen–Melnyk–Särkijärvi–Suomela (ICALP’23): when a vertex arrives, the algorithm is allowed t synchronous LOCAL rounds on the subgraph induced by arrived vertices; over many arrivals, long-range state/message propagation can accumulate across arbitrarily many t-round windows.
- The color-phased simulation we sketched in earlier rounds does not in general simulate (2), due to unbounded long-range state accumulation before a vertex arrives. The output.md already includes a remark acknowledging this gap.

New incremental results and proposals
1) Clarify the model target and add a safe variant we can prove now
- Definition (Output-only Online-LOCAL(t)). A deterministic online algorithm is output-only if an arrived vertex irrevocably sets its output, and thereafter any messages it sends in subsequent arrivals depend only on the underlying graph and the immutable outputs in its radius-t (no auxiliary mutable state beyond fixed outputs; previously arrived vertices do not maintain or evolve additional state across arrivals other than their final output label).
- Lemma O1 (Output-only online ⇒ sequential r-local). Let Π be an LCL on bounded-degree graphs. If Π has a deterministic output-only Online-LOCAL(t) algorithm, then Π has a deterministic order-robust r-local sequential algorithm with r = t that reads only B(v,t) and writes only at v.
  Why useful: This bridges a natural restriction of the online model to the sequential model covered in output.md, yielding O(log* n) LOCAL time on bounded-degree trees.
  Proof sketch (checkable): Fix any arrival order that first lists all vertices with colors < i, then color i, etc., derived from a proper coloring of G^t. For a vertex v, the t-round transcript relevant to determining v’s output depends only on the outputs within B(v,t), by the output-only restriction. Hence a sequential rule that, upon processing v, gathers outputs in B(v,t) and applies the online decision procedure produces the same output as the online algorithm on any arrival order consistent with those outputs; order-robustness then holds by the online algorithm’s correctness for all orders.
  Consequence: Combining Lemma O1 with Lemma 1–2 from output.md yields an O(log* n) LOCAL algorithm on bounded-degree trees.

2) Minimal counter-scenario illustrating the gap for general Online-LOCAL(t)
- Consider a path and t = 1. In the genuine online model, before some vertex v arrives, there may have been Θ(n) earlier arrivals, each granting one synchronous round on the entire arrived subgraph. Information originating far away can propagate one hop per arrival and reach B(v,1) by the time v arrives. In a color-phased simulation that grants only O(1) rounds before v’s phase, such accumulated state within B(v,1) is not reproduced. Hence, without extra assumptions, we cannot claim that our phase simulation computes the same output as the online algorithm would under any fixed arrival order.
- This shows that to leverage an online algorithm as a black-box subroutine, we need a restriction (like output-only) preventing long-range state effects from being essential to v’s decision.

3) Special-case sanity checks on trees
- Positive example (fits our proven pipeline): MIS/greedy maximal matching on trees admits a deterministic order-robust sequential r-local algorithm with r = 1 (reads only outputs of earlier neighbors and writes only at v). Our output.md pipeline yields O(log* n) LOCAL as expected.
- Negative intuition for general Online-LOCAL(t): If an online algorithm uses persistent mutable state at arrived nodes, then even on trees it may encode far-away information inside B(v,t) before v’s arrival. Our current simulation does not account for this. We have not yet constructed a concrete LCL that exploits this to beat O(log* n), and Theorem 2.33 (classification on trees) suggests such a separation is unlikely. Still, a proof that state can be eliminated is needed to complete the general reduction.

4) A concrete “state-elimination” goal for the full Online-LOCAL(t) model on trees
- Target Lemma (to prove next): For bounded-degree trees and fixed t = O(1), any deterministic Online-LOCAL(t) algorithm for an LCL Π can be transformed into an equivalent output-only Online-LOCAL(t) algorithm (or into an order-robust sequential r-local algorithm with r = O(t)), without increasing locality. Intuition: On trees, the influence of nodes outside B(v,2t) on v’s decision must pass through the annulus R = B(v,2t)\B(v,t). If auxiliary state is unbounded, in principle R could encode arbitrarily long histories. However, because Π has finite checkability radius and t is constant, we conjecture that for deciding v’s output there exists a constant-size canonical summary of the interface over R, depending only on the final outputs in B(v,2t). If so, auxiliary state can be replaced by a local function of outputs in B(v,2t), and thus eliminated.
- Why plausible on trees: The absence of cycles suggests a finite “context automaton” across a cut; any information flowing from outside must cross the cut and influence the inside only via a constant-depth, constant-degree neighborhood, potentially yielding a finite equivalence of contexts. Yet, the caveat is that nodes in Online-LOCAL(t) have unbounded memory; any proof must show that unbounded histories are irrelevant for the final LCL outputs at constant-radius decisions.
- Plan to attack: Start with paths and t = 1. Formalize the notion of an “interface context” at the boundary ∂B(v,2), and show that for any two online executions producing the same outputs on B(v,2), the set of feasible outputs for v is identical. If this holds, we can define a sequential rule depending only on outputs in B(v,2). Extend to general t by replacing 2 with 2t. If counterexamples exist on paths, we will pivot to a separation attempt.

5) Alternative route (if state-elimination fails): A separation attempt
- Try to construct an LCL Π on bounded-degree trees for which there is a constant-t deterministic Online-LOCAL(t) algorithm that crucially uses accumulated mutable state, and yet any order-robust r-local sequential algorithm would require r growing with n (or does not exist). This would invalidate the desired speedup under the full Online-LOCAL(t) definition and justify restricting the theorem to the sequential/greedy or output-only variants.
- Candidates to explore: LCLs that encode a long-range parity/potential propagated along the tree via mutable state before a node is processed. We will start with paths, try to enforce via local constraints that the propagated value is globally consistent, and test whether this yields any advantage over the standard O(log* n) symmetry-breaking barrier. Given Theorem 2.33, the end complexity class on trees should still be O(log* n), suggesting that either such an LCL cannot benefit from Online-LOCAL(t), or it is simulable by sequential rules of constant radius.

What to add/adjust in output.md
- Make explicit (in the Model and definitions) that the archived Theorem A applies to sequential/greedy, order-robust r-local rules which write only at the current vertex; emphasize that this is the “online local” variant covered.
- Add Lemma O1 to the archived list as a bridge from an output-only Online-LOCAL(t) algorithm to the sequential model already handled. This covers a meaningful online variant and clarifies the scope.
- Keep the current remark on the full Online-LOCAL(t) model and expand it with the “state-elimination” target lemma stated above as an open step.

Next concrete steps
- Formalize and prove Lemma O1 rigorously (definitions and proof details are straightforward and checkable).
- Begin the path/t = 1 case study for state-elimination:
  • Precisely define the interface ∂B(v,2) and the annulus R = B(v,2)\B(v,1).
  • Show that if two online executions agree on outputs in B(v,2), then any valid output for v in one execution is valid in the other (towards context-independence of far-away state). If true, set r = 2 for paths.
  • Either obtain a proof (yielding an order-robust sequential rule with r = 2 on paths), or construct a counterexample LCL on paths demonstrating dependence on accumulated state inside B(v,1).
- If the path case succeeds, generalize to trees and t > 1 by induction on t using the same interface argument with ∂B(v,2t).

References and alignment
- Online-LOCAL(t) model: Akbari et al., ICALP’23.
- Tree LCL classification: Theorem 2.33 in the attached notes; supports the expectation that O(log* n) is the relevant upper bound on trees in the sublogarithmic regime.
- Our proof tools for the sequential-to-LOCAL step (Linial’s coloring on power graphs) do not use orientations and hence apply directly to nonoriented trees.

## Round 0003 — 2025-08-27T15:27:05.894412Z

Ideas
- Broadened bridge to capture online algorithms that may commit outputs beyond the arriving vertex. We define an “output-only, W-write” Online-LOCAL(t) model: upon arrival of v, the algorithm runs t synchronous rounds on the arrived subgraph and irrevocably fixes outputs possibly on the W-neighborhood B(v,W); no other mutable state persists across arrivals and all messages sent by a node during this t-round window are functions only of the graph and currently known outputs within distance ≤ t from the sender.
- Why useful: This covers natural online local greedy rules that may finalize a small local patch around the arriving vertex. We prove a clean bridge to sequential-local rules with explicit read/write radii, which then drops into the color-phased LOCAL simulation pipeline.

New lemmas (clean, checkable)
- Lemma D (Output-only, W-write Online-LOCAL(t) ⇒ sequential local with (R,W) = (2t+W,W)).
  Statement. Let Π be an LCL on bounded-degree graphs. Suppose there is a deterministic output-only, W-write Online-LOCAL(t) algorithm A that is correct for every arrival order. Then Π admits a deterministic order-robust sequential rule S that, when processing v, reads only outputs in B(v,2t+W), writes only on vertices in B(v,W), and is correct for every vertex order.
  Proof sketch. Fix any vertex order σ = (v1,…,vn). Consider the φ-execution of A with arrivals σ. When vi arrives, during its t-window only nodes u ∈ B(vi,t) can send messages which reach B(vi,0). Each such u computes its messages as a function of outputs within B(u,t) by the output-only restriction; hence u’s messages to the patch B(vi,W) depend only on outputs in B(vi, t+W) ∪ (⋃u∈B(vi,t) B(u,t)) ⊆ B(vi,2t+W). Therefore the full t-round transcript relevant to deciding outputs on B(vi,W) in the σ-run depends only on the restriction of the arrived subgraph and already fixed outputs to B(vi,2t+W). Define S as follows: when processing vi in σ, S gathers the outputs already fixed within B(vi,2t+W)∩{v1,…,vi−1} and deterministically reproduces A’s t-window decision for B(vi,W) given that local view. As A is deterministic and correct for all orders, S reproduces the same patch outputs as A in this order; order-robustness of S follows by the same order-by-color simulation used previously. S is (R,W) = (2t+W,W)-local.

- Lemma E (LOCAL simulation for (R,W)-local sequential rules).
  Statement. Let S be a deterministic sequential rule that, when processing v, reads only B(v,R) and writes only on B(v,W), for fixed constants R,W ≥ 0. Given a proper coloring of G^{R+W} with C colors, one can simulate S in the LOCAL model by processing colors 1,…,C, using O(R) rounds per color. The simulation outputs exactly what S would produce for any order that respects the color layering.
  Proof. If dist(u,v) > R+W and φ(u) = φ(v), then (i) B(u,R)∩B(v,R) = ∅ and (ii) B(u,R) is disjoint from the write neighborhood B(v,W), and vice versa. Thus, within one color phase, decisions are independent. Each vertex of color i gathers the outputs written by earlier colors in B(v,R) (O(R) rounds), applies S, and writes within B(v,W). Correctness is identical to Lemma 2’s argument. A coloring of G^{R+W} with C = Δ^{O(R+W)} colors can be computed in O((R+W)·log* n) rounds by Lemma 1 simulated on G.

Corollaries (bounded-degree trees ⇒ O(log* n))
- Corollary D. On bounded-degree trees, if Π has a deterministic output-only, W-write Online-LOCAL(t) algorithm with constants t,W, then Π has a deterministic LOCAL algorithm with round complexity O((2t+W)·log* n) + O(1) = O(log* n).
  Reason: Apply Lemma D to get a (R,W)-local sequential rule with R = 2t+W, then Lemma E and Lemma 1.
- Note existing special cases are recovered: W=0 gives Lemma B (R=2t), and “t-local-dependence” with W=0 gives Lemma C (R=t).

Examples and sanity checks
- Greedy (Δ+1)-coloring online variant fixing a constant-radius patch: If at arrival of v the online rule picks a color for v and possibly finalizes colors of uncolored neighbors (W=1) using only the set of colors already fixed in B(v,1), then the rule is output-only, W-write with t=1. Corollary D yields an O(log* n) LOCAL algorithm on bounded-degree trees.
- Greedy maximal matching: a variant that, at v’s arrival, matches v to a free neighbor and possibly finalizes the matched pair (W=1), while sending messages depending only on currently fixed outputs within distance 1, meets the model; Corollary D applies.

Obstacles and model gaps (reiterated crisply)
- The unrestricted Online-LOCAL(t) model allows arbitrary mutable state and unbounded accumulation of information before v arrives. The path/t=1 counter-scenario still shows naive phase compression is invalid without extra restrictions. Our bridges cover output-only (R=2t or 2t+W) and t-local-dependence (R=t), but the general state-elimination step remains open.

State-elimination program (t=1 on paths) — concrete, testable steps
- Formalize the “interface view” at radius 2: for any vertex v on a path, define the context K(v) := restriction of outputs to B(v,2) at the time v arrives in an online execution. Target claim (Context-invariance): For any two online executions that agree on K(v), the set of outputs that the algorithm may produce at v is the same. If true, define a canonical tie-breaking function on K(v) to derive a sequential rule with R=2 and W determined by the online rule. Action items:
  1) Model each arrival as a local rewrite on the current output labeling; record that in t=1, only the immediate neighbors of v can send messages to v during the window, and each of those neighbors’ messages are functions of outputs in their own 1-neighborhood.
  2) Attempt to construct a counterexample LCL where two executions with identical K(v) force different outputs at v. If found, local elimination at radius 2 fails; otherwise, prove the lemma.
- Generalize: If the t=1 path case succeeds, extend to trees by handling the degree>2 case via boundary decomposition along paths to ∂B(v,2). For general t, replace 2 by 2t; for W>0, consider K(v) extended to B(v,2t+W).

Editorial notes on output.md
- The newly added Variant of Lemma 2 for bounded-distance writes aligns with Lemma E above. Suggest adding Lemma D explicitly (output-only, W-write bridge with read radius 2t+W) to make the pipeline fully parametric in W. This will make it transparent how to handle online rules that finalize a constant-radius patch.
- Minor clarity: In Lemma 1, it may help to note explicitly that in bounded-degree trees with constants Δ and k, the color count C = Δ^{O(k)} is an absolute constant, so the per-color simulation overhead is O(1).

Why this is progress
- We extend the safe, proven bridge to cover online rules that finalize constant-radius patches (common in greedy online/local designs), giving an immediate path to O(log* n) LOCAL algorithms on bounded-degree trees.
- We outline a concrete, falsifiable “context-invariance” claim for the state-elimination program on paths with t=1, including what to prove or how to refute it with a counterexample LCL. This isolates the remaining conceptual barrier and provides a roadmap for the next proof or separation.

Next steps (auditable)
- Add Lemma D to output.md with a full proof (the proof follows the same envelope as Lemma B and is straightforward to formalize).
- Start the path/t=1 case: either prove the context-invariance claim (produce a short inductive proof or a monotonicity argument) or construct a counterexample LCL. If proven, write the path/t=1 “state-elimination” lemma; if refuted, document the counterexample precisely.
- If bounded-distance writes are used (W>0), ensure the simulation uses G^{R+W} coloring (i.e., G^{2t+2W}) consistently; verify radii accounting in each step with small toy instances to avoid off-by-one errors.

## Round 0003 — sharpening the bridge from Online-LOCAL(t) to LOCAL on trees

Summary of status
- output.md is now correct regarding the “output-only” bridge: the needed sequential locality is 2t (Lemma B) and can be tightened to t under the stronger t-local-dependence hypothesis (Lemma C). The color-phased simulation and the (R+W)-write variant are also stated cleanly.
- The remaining gap for the unrestricted Online-LOCAL(t) model is the possibility of unbounded accumulation of mutable state before a vertex v arrives. We need additional structural arguments tailored to trees to remove this dependence.

New incremental results (clean statements with proofs)

1) Commutativity of independent arrivals (a tool for order normalisation)
- Lemma D (2t-commutativity of consecutive independent arrivals). Let A be a deterministic Online-LOCAL(t) algorithm on a bounded-degree graph. Consider an arrival sequence σ and two consecutive arrival steps at vertices u and w with dist(u,w) > 2t (distance in the underlying graph G). Let σ′ be obtained by swapping these two steps. Then the states and already-fixed outputs after executing these two steps under σ and under σ′ coincide everywhere; in particular, the outputs on B(u,t) ∪ B(w,t) and outside are identical.
  - Proof sketch (checkable). In the step when u arrives in σ, A runs t synchronous LOCAL rounds on the current arrived graph G_i. All messages and updates during this window are confined to B(u,t) (messages can travel at most distance t in t rounds). Since dist(u,w) > 2t, we also have B(u,t) ∩ B(w,t) = ∅, and w is absent before either of the two steps in both σ and σ′. Moreover, in both orders, the set of previously arrived vertices intersected with B(u,t) is the same at the time u’s window runs, hence the local t-round transcript at nodes in B(u,t) is identical in σ and σ′, and the same updates occur there. The same argument applies to w’s step. Because the two windows touch disjoint node sets and no messages cross between them within t rounds, their effects commute, and all other nodes remain unaffected. □

- Corollary D.1 (Pushing far-away arrivals past v). Fix v and any arrival sequence. By repeatedly applying Lemma D to adjacent independent steps, one can transform the sequence into another sequence in which (i) all vertices at distance > 2t from v arrive after v, and (ii) the outputs of all nodes and the states at the time v arrives on nodes within B(v,t) are identical to those in the original sequence.
  - Why useful: It reduces the analysis of v’s decision to local arrival orders that involve only the ball B(v,2t). This finite-horizon reduction is independent of graph orientation and holds on all graphs.

2) Consequence for dependence radius
- Observation. Under Corollary D.1, we may w.l.o.g. assume that before v arrives, only vertices in B(v,2t) have arrived. Hence any information that can reach v during its t-round window originates within B(v,2t). This is consistent with Lemma B’s 2t radius for the output-only bridge and provides the right target radius for any state-elimination attempt on trees.

New approach outline: “Interface confluence” on trees for t=1
- Goal (paths, t=1 case). Prove: For any deterministic Online-LOCAL(1) algorithm A and any LCL Π, after normalising the order as in Corollary D.1, the output at v depends only on (G[B(v,2)], outputs already fixed in B(v,2)]). Equivalently: mutable states of nodes in B(v,1) at v’s arrival can be replaced by canonical functions of outputs in B(v,2).
- Why plausible on trees: When all arrivals before v lie in B(v,2), any message reaching v during its 1-round window comes from neighbors of v. Each neighbor’s outgoing message is computed using its current state, which itself resulted from arrivals in B(v,2) only. In a tree, one can attempt to summarise the influence of each branch by a finite “interface type” depending only on already-fixed outputs in that branch up to distance 2 from v.
- Proposed technical route:
  1) Define, for each neighbor u of v, the 1-hop interface type τ(u→v) as the set of all possible outgoing messages u would send to v at v’s arrival time, over all arrival orders restricted to B(u,1) consistent with the same already-fixed outputs in B(u,2). Show τ(u→v) is a function of the output-labeling of B(u,2) alone.
  2) Show that the tuple of interface types around v, together with outputs already fixed in B(v,2), determines v’s t=1 transcript and hence v’s output. This would establish the desired (output-only) dependence for t=1 on paths; by a standard tree decomposition at v, extend to general trees.
  3) Generalise to t > 1 by replacing radii 1 and 2 with t and 2t and defining depth-t interface types.
- Obstacles: The interface type τ(u→v) as defined must be well-defined (independent of the arrival order within B(u,2)), which requires a local confluence argument. While Lemma D lets us push arrivals at distance > 2t past v, it does not by itself give confluence among different orders internal to B(u,2). Establishing that the set of feasible outgoing messages depends only on outputs (and not on internal mutable state histories) is the crux.

Why Lemma D is useful even without full state elimination
- It strictly confines the relevant arrivals to B(v,2t) and eliminates concerns about “long-haul” state injected from beyond that radius. Any further dependence on arrival order or mutable state must be attributable to choices made entirely within B(v,2t). This localises the problem and suggests a finite-case analysis/state-aggregation strategy on trees.

Notes on output.md (gaps and suggestions)
- The current output.md correctly states and proves the bridges (Lemma B: radius 2t; Lemma C: radius t under t-local-dependence) and the simulation via coloring. No errors spotted.
- Suggested addition for future versions: include Lemma D (2t-commutativity of independent arrivals) with proof and Corollary D.1. These will be useful scaffolding for the tree-specific state-elimination program, and they are correct for the unrestricted Online-LOCAL(t) model.

Examples/sanity checks
- Example (commutativity applicability). On a path with t=1, any two consecutive arrivals at nodes with distance ≥ 3 commute. Thus, when analysing v, we can always push all arrivals at distance ≥ 3 past v. The only potentially order-sensitive part is the sequence of arrivals within distance ≤ 2 of v.
- Consistency with lower bounds. Sinkless orientation requires Ω(log n) deterministic LOCAL rounds on trees; by Corollary D.1, a hypothetical constant-time online algorithm would still have to resolve constraints within B(v,2t), which is consistent with known impossibility: we do not derive a contradiction but focus on the local reduction.

Next steps (auditable action items)
1) Formalise and prove Lemma D and Corollary D.1 in output.md, including precise quantification over states and message transcripts; this is model-agnostic and verifiable.
2) Path, t=1 case study for interface confluence:
   - Precisely define “interface type” and prove monotonicity properties (adding arrivals outside B(u,2) does not change τ(u→v) by Corollary D.1).
   - Attempt to prove that for fixed outputs on B(u,2), τ(u→v) is a singleton (order-robust), or at least that the set of feasible messages has a canonical choice leading to a valid global solution. If successful, this yields the output-only bridge on paths with r = 2.
3) If (2) succeeds, generalise to trees (branch-wise independence) and to general t by layered interfaces of depth t. If it fails, craft a concrete LCL counterexample on paths demonstrating genuine dependence on mutable state histories within B(v,2) (which would delimit the scope of the desired speedup).
4) Keep tracking read/write distances carefully. If any future sequential rule writes within distance W > 0 (e.g., when extracting canonical choices), ensure to schedule by a G^{R+W}-coloring as already anticipated in output.md.

Why this is progress
- We added a rigorously provable commutativity lemma (and corollary) that strictly localises the analysis to B(v,2t). This is a necessary stepping stone for any tree-specific state-elimination.
- We laid out a concrete, checkable interface-aggregation program starting with paths and t=1, with clear success/failure outcomes to be tested next.

## Round 0004 — 2025-08-27T18:51:19.565901Z

Status check and scope
- The curated output.md now includes the corrected bounded-writes simulation (color G^K with K = max(2W, R+W)), the output-only bridges (W=0 and W>0), and the 2t-commutativity/cutoff lemma. This fixes the earlier flaw flagged by the verifier (using G^{R+W} was insufficient) and provides a complete O(log* n) pipeline for the output-only (and t-local-dependence) online models on bounded-degree trees.
- The main open gap remains the unrestricted Online-LOCAL(t) model: unlimited mutable state can accumulate across many arrivals before v, and our color-phased simulation need not reproduce these states. The commutativity lemma localizes influence to B(v,2t), but internal nonconfluence within B(v,2t) is unresolved.

New micro-lemmas (formal and checkable)
- Lemma 8 (Strong witness-localization at v). Let A be a deterministic Online-LOCAL(t) algorithm and σ any arrival sequence. For any vertex v, there exists a sequence σ_v obtained from σ by swapping adjacent arrivals at distance > 2t such that (i) all arrivals before v in σ_v occur at vertices in B(v,2t), (ii) the arrived subgraph just before v arrives is G[B(v,2t)]∩{arrived}, and (iii) the local states and fixed outputs on B(v,t) at the time v arrives are identical in σ and σ_v.
  Proof idea: Iteratively apply Lemma 7 to push every arrival at distance > 2t from v past v. Each swap preserves the state within B(v,t) at the time v arrives; hence (iii) holds. Statements (i)–(ii) then follow by construction.
- Lemma 9 (Finite local enumeration for t=1 on paths). On a path, for any vertex v, the set of arrival orders restricted to B(v,2) is finite with size bounded by a constant c(Δ) independent of n; hence the set of possible transcripts/messages seen by v under any normalized σ_v is finite. This is an accounting lemma (use Δ ≤ 2 on paths) and will be useful if a local confluence/summary argument can be established.

Path, t=1 interface program — sharpening targets
- Definitions (interface types). For a path and t=1, define K(v) to be the restriction of already-fixed outputs just before v arrives to B(v,2). For each neighbor u ∈ N(v), define the interface type τ(u→v) as the set of all outgoing 1-round messages that u can send to v at the start of v’s window, ranging over all normalized arrival orders σ_v consistent with K(v). Note that τ(u→v) depends a priori on the internal states at u caused by earlier arrivals within B(v,2), not just on outputs.
- Target Claim C1 (context-invariance). For any deterministic Online-LOCAL(1) algorithm A that is correct for all orders on paths, τ(u→v) is a function only of K(v). If C1 holds, then the pair of types (τ(left→v), τ(right→v)) together with K(v) determines v’s 1-round transcript and thus v’s output; consequently, v’s output can be written as f(K(v)), yielding a sequential rule with read radius R=2 (W depending on A).
- Why plausible: Lemma 8 restricts all relevant pre-v activity to B(v,2). Correctness-for-all-orders constrains the variability of τ(u→v): in particular, if two normalized local histories share K(v), any divergence in τ would imply two global normalized executions that share K(v) but force different decisions at v under the same neighbor messages—this is the crux to be formalized.

Obstacles and what fails without extra structure
- Messages are unbounded in LOCAL, hence in principle τ(u→v) could be infinite and depend on arbitrary pre-window states, even if K(v) is fixed. Without additional constraints, direct finiteness/regularity arguments (e.g., Myhill–Nerode–style) are unavailable.
- Local confluence inside B(v,2) is not implied by 2t-commutativity (which only handles dist > 2t). For t=1, arrivals at distance 2 can causally affect a neighbor’s 1-round message to v, and these steps need not commute.

Why the current bridges suffice in natural cases
- The output-only model (and its W-write variant) sidesteps the obstacles: each neighbor’s outgoing message during v’s window is a function of outputs within distance 1 of the sender; by Lemma 6, v’s decision depends only on outputs in B(v,2) (or B(v,2+W) for bounded writes), and the color-phased simulation gives O(log* n).
- The t-local-dependence variant provides an even tighter radius (R=t) and is common for greedy “decide-at-current-node” online rules.

Actionable next steps (auditable)
1) Formalize C1 or refute it on paths:
   - Set up the precise semantics of τ(u→v): enumerate all normalized permutations of arrivals in B(v,2), run A on each (local simulation of a finite tree of executions), and collect the set of possible messages. Prove (or disprove by counterexample) that τ(u→v) depends only on K(v).
   - If C1 holds, define f(K(v)) by simulating v’s 1-window using any representative execution consistent with K(v); argue that f yields a well-defined (R=2, W as needed) sequential rule S. Then invoke Lemma 5 to obtain O(log* n) in LOCAL on bounded-degree trees.
2) If C1 fails, attempt a weaker canonicalization:
   - Show existence of a canonical choice g(K(v)) ∈ τ(u→v) for each interface that still yields a valid global labeling when composed across vertices via color-phased scheduling (this would be a “local mending” style selection).
3) Extend Lemma 8 to quantify the precise bound on the number of arrival steps that can affect v: for general t and degree Δ, |B(v,2t)| ≤ Δ^{O(t)}; record this bound for use in exhaustive local simulations.
4) Strengthen output.md with an explicit remark that the main theorem presently holds under output-only (and t-local-dependence) hypotheses and that unrestricted Online-LOCAL(t) is open; add Lemma 8 and Lemma 9 as formal tools for the path-interface program.

Notes on output.md (gaps/edits)
- The listed lemmas are correct as stated. To support the path-interface program, we suggest adding:
  • Lemma 8 (strong witness-localization at v) with proof.
  • A short bound on |B(v,2t)| and the induced finite enumeration of normalized local orders (Lemma 9).
- Clarify in Corollary B that the overall runtime is O((2t+2W)·log* n + O(1)) and dominated by the coloring step for constant Δ, t, W.

Why this round is progress
- We strengthened the normalization toolkit (Lemma 8), formalized the interface-type notion for the path/t=1 case, and articulated a precise, falsifiable claim (C1) whose resolution would close the remaining gap. We also scoped a concrete finite-enumeration approach to test C1 and outlined fallback strategies if it fails. These are incremental, auditable steps towards eliminating mutable-state dependence inside B(v,2t) on trees.

## Round 0004 — 2025-08-27T18:52:06.648937Z

Ideas (closing the main gap)
- New lemma (faithful phase simulation for arbitrary deterministic Online-LOCAL(t), no extra restrictions): Fix any proper coloring φ of G^{2t}. There is a deterministic LOCAL simulation that, in O(t·log* n) (to compute φ) + C·t rounds (C = Δ^{O(t)} colors), reproduces exactly the outputs that the online algorithm A would produce on the arrival order that processes color classes 1,2,…,C, with ties inside a color class resolved arbitrarily. On bounded-degree graphs with constant t, this is O(log* n).
  • Why this suffices for the task: The online model requires A to succeed for every adversarial order; hence it certainly succeeds for the specific “color-by-color” order. Our LOCAL simulation reproduces that run, up to perfect fidelity, yet at a cost of O(log* n) rounds. This directly proves: Any LCL solvable in O(1) rounds in deterministic Online-LOCAL(t) on bounded-degree trees (indeed, bounded-degree graphs) can be solved in O(log* n) rounds in the standard LOCAL model.

- Key observation resolving the prior concern (barrier of unbounded state accumulation): In the color-by-color arrival order, before a vertex v arrives, only vertices of earlier colors have arrived. The online algorithm must work for this order. During phase i, we need to execute the t-round “arrival-window” for all vertices v with φ(v)=i. Even though an online execution would conceptually perform these windows sequentially (one at a time), the union of active parts of the system involved in each individual t-window is B(v,t) and, since φ colors G^{2t}, these t-balls are pairwise disjoint for same-color vertices. Therefore we can execute all these t-windows concurrently in exactly t LOCAL rounds, without interference. No “k·t” overhead arises, even if the color class has k≫1 vertices.

Clean statement (to add as a new lemma in output.md)
- Lemma F (Faithful color-phased simulation of arbitrary deterministic Online-LOCAL(t), W=0). Let A be any deterministic Online-LOCAL(t) algorithm (arrived vertex decides its own output; all previously arrived vertices may maintain arbitrary state across arrivals and participate in the t rounds of subsequent arrivals). Let φ be a proper coloring of G^{2t} with C colors. There is a deterministic LOCAL algorithm that produces exactly the same outputs as A would produce on the arrival order σ_φ that processes colors 1,2,…,C, by spending O(t) LOCAL rounds per color and keeping vertices of colors > i passive in phase i. Total round complexity: O(t·log* n + C·t) = O(log* n) for bounded Δ and constant t.
  • Proof sketch (formal details straightforward):
    1) Compute φ in O(t·log* n) rounds (Lemma 1). Fix the arrival order σ_φ: all color-1 vertices arrive first (in any order), then color 2, etc. Since A is correct for every order, it is correct for σ_φ.
    2) Inductive invariant I(i): After finishing phase i, the global state of all arrived vertices (colors ≤ i), and the fixed outputs for these vertices, are exactly those that would arise in an online execution of A under σ_φ after all color-≤i vertices have been processed (sequentially in any order within the color), and vertices of colors > i have not yet arrived (absent from the induced subgraph).
    3) Base i=0: vacuous. Step i→i+1: In phase i+1 we must run the “arrival window” (t rounds) for every v with φ(v)=i+1, over the subgraph induced by colors ≤ i+1, with vertices of colors > i+1 absent. For a single vertex v this t-window involves only nodes in B(v,t); nodes outside B(v,t) cannot influence or be influenced (information cannot travel > t hops in t rounds). If u and v share the same color i+1, then dist(u,v)>2t, hence B(u,t)∩B(v,t)=∅, and their windows can be executed simultaneously without interference in exactly t rounds. (Previously arrived vertices may participate in these t rounds, but only those inside the corresponding disjoint t-balls.) Therefore, after t rounds, every color-(i+1) vertex has exactly the output it would get in the run of A under σ_φ; all other states/outputs also match, proving I(i+1).
    4) After phase C we have the outputs A would produce on σ_φ. Since A is correct for all orders, the labeling satisfies Π.

- Variant with bounded writes (optional, for completeness): If A (at arrival of v) may additionally finalize outputs on a patch B(v,W), the same simulation goes through using a proper coloring of G^{2t+2W} (so that the “influence regions” B(v,W+t) are disjoint inside a color). In phase i, we run t rounds over the subgraph induced by colors ≤ i, with vertices of colors > i absent, and let each new vertex v finalize the patch B(v,W). The per-color runtime is still t, and correctness follows by the same invariant. This matches the K = 2t+2W bound already used in Lemma 5/Corollary B.

Why this closes the loop
- The main task asks to simulate any O(1)-round deterministic online-local algorithm on bounded-degree trees in O(log* n) LOCAL rounds. Lemma F does exactly that (and for general bounded-degree graphs), relying only on (i) a distance-(2t) coloring and (ii) faithful, batched execution of t-windows per color. No restrictions such as “output-only” or “t-local-dependence” are needed. The essential ingredient is that A must succeed for every arrival order, so we are free to choose the color-by-color order.

Sanity checks and examples
- Path graph, t=1, “long-haul state accumulation” algorithm A. Even if one can design A so that, under some orders, far-away information travels across many arrivals before a vertex v appears, A must also succeed under order σ_φ, where only O(1) color classes arrive before v. Our simulation reproduces precisely that run of A; hence the output is valid. The earlier apparent obstacle (needing Θ(n)·t global rounds pre-arrival) is resolved by choosing a benign order.
- Toy parallelization check: two new vertices u,v at distance ≥2t in the same phase. In A, if processed sequentially, first arrival’s t rounds touch only B(·,t), then the second’s t rounds touch only the other t-ball; batching them into one t-round block yields identical transcripts in the two disjoint neighborhoods.

Gaps or edits needed in output.md
- Current output.md (Round 0003) contains:
  • Bridges for output-only and for t-local-dependence (Lemmas 3–4), the corrected bounded-writes simulation (Lemma 5 with K = max(2W,R+W)), the output-only W-write bridge (Lemma 6), and the commutativity lemma (Lemma 7). All are correct as stated.
  • Missing piece: an explicit lemma for the general Online-LOCAL(t) case without extra restrictions (the new Lemma F above). This is the central statement that directly yields the desired O(log* n) upper bound for arbitrary deterministic online-local algorithms on bounded-degree trees.
- Actionable addition for output.md: Add Lemma F (as above) and its proof. Then state the main theorem as a corollary: On bounded-degree trees (indeed, graphs), any LCL Π solvable in O(1) rounds in deterministic Online-LOCAL(t) admits an O(log* n) deterministic LOCAL algorithm. Optionally include the bounded-writes variant using a G^{2t+2W}-coloring.

Relation to earlier commutativity tool
- Lemma 7 and Corollary 7.1 remain useful generally (e.g., for order normalization arguments, or if one prefers a proof with an explicit swapping argument). However, Lemma F gives a simpler, direct construction via a fixed order σ_φ.

Obstacles and caveats to keep in mind
- Model semantics: In each phase we must ensure that vertices of colors > i are “absent”: they neither send nor receive messages. This is easily enforced in the LOCAL simulation by having these nodes ignore messages (remain silent) until their phase.
- Independence radius: The 2t separation is tight for W=0. With W>0, use 2t+2W so that the influence regions B(v,W+t) are disjoint inside a color. This matches the corrected K in Lemma 5 (max(2W,R+W) specialized with R=W+t for the online window’s read neighborhood of the patch).
- Per-phase runtime: Exactly t rounds suffice; we do not need k·t even if the color class size is k, thanks to disjointness of the active regions.

Next steps (auditable)
1) Insert Lemma F into output.md with a rigorous inductive proof of invariant I(i); include the bounded-writes variant (coloring G^{2t+2W}).
2) State the main theorem as a clean corollary and explicitly emphasize that the argument does not rely on orientations (nonoriented trees are fine) nor on tree structure (it works for bounded-degree graphs).
3) Provide a short “pitfall” remark explaining why the earlier worry about long state accumulation is resolved by choosing a suitable arrival order, and why batching t-windows per color costs only t rounds.
4) Optionally keep the bridges (Lemmas 3–6) as auxiliary tools—they remain correct and are useful independently (e.g., if one wants a sequential-rule perspective).

Why this is meaningful progress
- We isolate and formalize the decisive lemma (faithful batched simulation of arbitrary deterministic online-local t-windows by colors), with a tight radius argument and runtime accounting. This cleanly settles the stated task for (nonoriented) bounded-degree trees and, in fact, for bounded-degree graphs. The lemma is ready to be integrated into output.md as a short but complete proof component.

## Round 0005 — 2025-08-27T19:02:02.024427Z

High-level status and target
- We now have a clean O(log* n) pipeline when the online algorithm satisfies output-only (with or without bounded writes) or the stronger t-local-dependence property. The bounded-writes scheduling radius K = max(2W, R+W) is correctly recorded. We also have a rigorously stated obstacle: faithful per-color batching is invalid in the unrestricted Online-LOCAL(t) due to idle state evolution; the minimal parity-counter example documents this.
- To settle the task in full generality for arbitrary deterministic Online-LOCAL(t) on bounded-degree trees, a remaining route is to separate the “log n-hard” class from the online-constant domain (showing those cannot have t = O(1)), and hence, by the tree-LCL classification, any LCL with Online-LOCAL(t)=O(1) must lie in the O(1)/Θ(log* n) class, yielding the desired O(log* n) deterministic LOCAL upper bound non-constructively. Below we formulate this lower-bound program precisely and propose a safe additional “quiescent” bridge that can be added to output.md.

New definitions and lemmas (clean statements, why useful)
- Definition (Quiescent Online-LOCAL(t)). An online algorithm is quiescent if, at the arrival of v, during the t synchronous rounds, nodes outside B(v,t) do not change their local state (they may ignore all computation/messages and remain idle). Why useful: This explicitly rules out the idle-update obstruction in unrestricted online runs and subsumes output-only as a special case with W=0.
- Lemma Q (Quiescent ⇒ O(log* n) LOCAL). If an LCL Π on bounded-degree graphs has a deterministic quiescent Online-LOCAL(t) algorithm (t=O(1)), then Π has a deterministic LOCAL algorithm running in O(t·log* n + Δ^{O(t)}·t) = O(log* n) rounds. Sketch: Fix a proper coloring of G^{2t} (Lemma 1). Process color classes 1,…,C. In phase i, all vertices v of color i execute their t-window in parallel. Quiescence ensures that only nodes in the disjoint balls {B(v,t)} may change state during phase i, so per-color cost is exactly t and no cross-interference occurs. Correctness holds for the specific “color-by-color” arrival order. This is a safe, self-contained variant to include in output.md.
- Open transformation target (state-elimination to quiescent on trees). Goal: Given any deterministic Online-LOCAL(t) algorithm A for an LCL Π on bounded-degree trees, construct a quiescent Online-LOCAL(t) algorithm A′ that reproduces A’s outputs for all arrival orders. Why useful: Combined with Lemma Q, this would close the full generality gap. Status: nontrivial; obstacles below.

Lower-bound program: excluding the log n-hard class from constant-t Online-LOCAL on trees
- Goal LB (Online lower bound for sinkless orientation). Prove: On bounded-degree trees, sinkless orientation cannot be solved by any deterministic Online-LOCAL(t) algorithm with constant t (for adversarial arrival orders). Why useful: By Theorem 2.33 (tree LCL classification), the log n-hard class is exemplified by sinkless orientation. If it requires t growing with n even in Online-LOCAL, then any LCL solvable in O(1) online rounds cannot be in the log n-hard class; hence, by the classification, it must have a deterministic LOCAL algorithm in O(1) or Θ(log* n) time, giving the desired O(log* n) bound existentially.
- Toolkit already in output.md: Lemma 7 (2t-commutativity) and Corollary 7.1 (push far-away arrivals past v). These localize pre-v influences to B(v,2t) without assuming quiescence. This is exactly the horizon needed for adapting the round-elimination proof scheme.
- Proposed Lemma LB.1 (Online node→edge reduction in a localized ball). On a Δ-regular tree with an ID-graph H as in Theorem 2.16, suppose a deterministic Online-LOCAL(t) algorithm A solves node-centered edge-grabbing (the node form of sinkless orientation) for all arrival orders. For any edge e = uv, after normalizing the prefix so only B(e,2t) arrives first (Cor. 7.1), one can define an edge-centered (t−1/2)-local reduction (within B(e,2t)) that decides the orientation of e by exhaustively considering consistent local arrival orders in B(e,2t). This faithfully mirrors Lemma 2.17 in the classical round-elimination proof but with the normalization step replacing global bounds. Why useful: It sets up a t→t−1/2 elimination inside a fixed-radius ball for the online model.
- Proposed Lemma LB.2 (Iterated elimination yields a 0-round contradiction). Iterating the node↔edge localized elimination 2t times yields a 0-round edge-centered algorithm on B(e,2t), hence a 0-round global prescription depending only on the ID-graph labels at the edge. As in Theorem 2.15, this contradicts the ID-graph property (Definition 2.16), showing that no constant-t Online-LOCAL algorithm can solve sinkless orientation. Why useful: This delivers the desired lower bound LB.
- Plan to formalize LB.1–LB.2 (next steps): (i) Specify the semantics of “consider all consistent local arrival orders within B(e,2t)” and show feasibility because the prefix is normalized and the ball is finite. (ii) Show that any conflict (both endpoints deciding to grab uv) witnessed by two such locally consistent extensions implies an actual global input and arrival order (gluing them into B(e,2t)) under which A fails, contradicting A’s correctness. (iii) Carry the induction to 0 rounds and invoke the ID-graph argument. These steps closely parallel the classical proof and are amenable to rigorous write-up.

Obstacles and clarifications
- Why quiescent reduction from arbitrary online A is hard: Without constraints, idle state updates outside B(v,t) can influence future behaviors inside the next B(·,t) even after normalization (the influence can be funneled through nodes that will later fall inside B(v,t)). Hence, a priori, replacing such idle updates by identity is not obviously sound. We therefore propose the classification-based route above as a robust way to separate out the hard class.
- On the path/t=1 “interface” program: The parity-counter example shows that without constraints, the realized output at v can depend on the number of prior arrivals even with identical K(v). However, to formally refute the context-invariance Claim C1 one needs two normalized histories with the same K(v) but different sets of feasible outputs; constructing such an LCL in the unrestricted model may require additional care (bounded-state/ID-obliviousness would make enumeration finite and C1 provable; otherwise, the set may be infinite). We suggest postponing this until the LB program is resolved.

Edits and additions suggested for output.md
- Add Lemma Q (Quiescent ⇒ O(log* n)) with a short proof. It clearly delineates a safe class where per-color batching works.
- Consider adding a short “Roadmap to online lower bound” remark: explain how Lemma 7/Cor. 7.1 enable localizing the round-elimination to B(e,2t), and outline the forthcoming Lemmas LB.1–LB.2 for sinkless orientation. This prepares for integrating a full proof that Online-LOCAL(t)=O(1) cannot solve the log n-hard LCLs on trees.
- Keep the existing negative “no faithful batching” remark; it prevents misuse of per-color batching outside quiescent/output-only models.

Concrete next steps (auditable)
1) Write and insert Lemma Q (quiescent bridge) into output.md, including the bounded-writes variant (color G^{2t+2W}).
2) Formalize Lemma LB.1 (localized node→edge elimination) and Lemma LB.2 (iteration to 0 rounds) for Online-LOCAL on Δ-regular trees with an ID-graph H. Provide full proofs, borrowing structure from Theorem 2.15 and leveraging Cor. 7.1.
3) Conclude the Online-LOCAL lower bound for sinkless orientation on trees: no deterministic constant-t algorithm exists. State the non-constructive corollary: Any LCL on bounded-degree trees solvable in deterministic Online-LOCAL(t) with constant t must admit an O(log* n) deterministic LOCAL algorithm by Theorem 2.33.
4) Optionally, explore whether the quiescent transformation can be proven for special online designs (e.g., finite-state or ID-oblivious algorithms), which would yield a constructive black-box simulation in those regimes.

Notes on gaps/errors
- No new errors spotted in output.md; the negative remark correctly blocks earlier flawed batching. Lemma 7 and Cor. 7.1 provide the localization tool we need for the online lower bound program. The quiescent variant is not yet present and can be safely added.

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

## Round 0006 — 2025-08-27T19:50:40.482712Z

Status and alignment with task
- The curated output.md now contains: (i) the output-only bridges (W=0 and W>0), (ii) the read/write simulation with the corrected K = max(2W, R+W), (iii) a 2t-commutativity lemma that localizes influence to B(·,2t), and (iv) a new quiescent bridge (Lemma 8) with the corrected separation K = 2t+1 (or 2t+2W+1) and a proof that respects standard LOCAL round timing. These cover an O(log* n) simulation for output-only and for (W,t)-quiescent Online-LOCAL(t).
- The remaining open gap is the unrestricted deterministic Online-LOCAL(t) on trees, where idle state accumulation across many arrivals can foil color-phased batching.

Gaps or clarifications in output.md (minor and easy to address)
- Corollary B vs Lemma 8 radii: Corollary B uses K = 2t+2W (no +1), which is correct because it simulates a derived sequential (R,W)-rule via Lemma 5, not batched online windows. Lemma 8 requires +1 since it parallelizes online t-windows per color and must forbid a single edge between active regions. Consider adding a one-sentence remark after Corollary B explaining why there is no +1 there but there is in Lemma 8.
- Hypotheses of Lemma 8: It may help to restate explicitly that the standard LOCAL round timing is assumed (send based on current state, receive, then update), and that nodes outside the active region do not change their state; hence they cannot forward newly received information in later rounds. This explains the domain-of-dependence argument used in the proof.

New incremental, testable steps towards closing the unrestricted case on trees
A) Localized round-elimination for Online-LOCAL(t) on trees (lower-bound route)
- Goal: Show that sinkless orientation does not admit deterministic Online-LOCAL(t) with constant t on bounded-degree trees. Then, by the tree-LCL classification (Theorem 2.33), any LCL solvable in constant Online-LOCAL(t) lies in the O(1)/Θ(log* n) class, implying the required O(log* n) deterministic LOCAL upper bound.
- Tool already in output.md: Lemma 7 and Cor. 7.1 localize pre-decision influence to B(e,2t). We leverage this to run a localized node↔edge round-elimination inside a fixed ball.
- Lemma LB.1 (Node→edge localization). On a Δ-regular tree with an ID-graph H as in Def. 2.16, assume A is a deterministic Online-LOCAL(t) algorithm that solves node-centered edge grabbing for all arrival orders. Fix an edge e = uv and normalize the prefix by Cor. 7.1 so that only B(e,2t) arrives before deciding e. Then there is an edge-centered (t−1/2)-local reduction that determines the orientation of e by exhaustively considering all normalized local arrival orders within B(e,2t) consistent with the fixed ID labels on the ball. Why sound: any two “local witnesses” that would force opposite decisions for e can be extended to global inputs and arrival orders (by pushing all other arrivals past e using Cor. 7.1), contradicting correctness of A.
- Lemma LB.2 (Iterated elimination). Iterating LB.1 and its converse edge→node step 2t times yields a 0-round edge-centered algorithm tied to an ID-graph labeling, contradicting the ID-graph property (Def. 2.16) as in the classical proof. Hence no deterministic constant-t Online-LOCAL algorithm can solve sinkless orientation on trees.
- Why checkable: Both lemmas operate entirely inside B(e,2t), a finite object for fixed Δ,t. The “glueability” claim (extending consistent local arrival orders to a global order) is justified by Cor. 7.1 and the tree structure (no cycles) and can be written as a standalone lemma (Normalization-and-extension lemma) for verification.

B) Strengthening the quiescent bridge (positive route)
- Interface-of-boundary states lemma. In Lemma 8’s proof, one may formalize the dependency as: for v in phase i, the transcript in R_v depends only on the boundary states on ∂R_v at the start of the phase. Because boundary nodes do not change state during the phase and dist(R_v,R_w) ≥ 2 for v≠w of the same color, transcripts in distinct active regions are independent and coincide with any sequential permutation. This lemma can be added as a short formal claim nested in Lemma 8.
- Special case W=0 on trees: give a tiny sanity example (path, t=1) showing necessity of K=2t+1 by constructing two same-color centers at distance 2t+1=3; an edge between the two radius-1 regions permits one-round coupling if K=2t.

C) Path, t=1 interface program (state-elimination-by-quiescence attempt)
- Definitions: For a path and t=1, let K(v) be the restriction of already fixed outputs to B(v,2) just before v arrives, after normalizing arrivals via Cor. 7.1. For each neighbor u of v, define Σ(u→v;K) as the set of outgoing 1-round messages u can send to v over all normalized arrival orders within B(v,2) consistent with K.
- Target (context-invariance on paths): Prove that Σ(u→v;K) depends only on K (not on deeper mutable histories). If true, choose a canonical selector g(K) ∈ Σ(u→v;K) and define a quiescent online rule A′ whose neighbor interfaces are g. This would yield a quiescent Online-LOCAL(1) algorithm equivalent on paths, extendable to trees by branch decomposition, and to general t by replacing radii 1,2 with t,2t.
- Why auditable: All normalized histories live in the finite ball B(v,2); we can try to either prove invariance or build an explicit LCL counterexample where Σ differs while K is fixed.

Sanity checks, tiny examples
- Necessity of +1 in Lemma 8: On a path, t=1, pick two centers at distance 3. Their B(·,1) balls are disjoint but adjacent; if nodes outside active balls may not change state but still send messages based on (fixed) state, a single cross-edge allows a one-round signal between regions, so K=2t would be unsafe. K=2t+1 forbids such an edge.
- Consistency of radii across the pipeline: Output-only W-write bridge first derives a sequential rule with R=2t+W, then simulates it with K=max(2W,R+W)=2t+2W (no +1). The +1 appears only in Lemma 8, which batches online windows per color.

Why this is progress
- We provide concrete, local lemmas (LB.1–LB.2) that, once formalized, would rule out constant-t Online-LOCAL for the log n-hard class (sinkless orientation), thereby establishing the desired O(log* n) LOCAL upper bound for any LCL solvable in constant Online-LOCAL(t) on bounded-degree trees.
- We sharpen the quiescent bridge with a boundary-state lemma and sanity examples, reinforcing its correctness and clarifying the role of K.
- We outline an auditable path/t=1 program to try to compile arbitrary Online-LOCAL into a quiescent one via local interface canonicalization; this has clear success/failure outcomes confined to constant-radius balls.

Next steps (actionable)
1) Write formal proofs of LB.1 and LB.2 in output.md, including the normalization-and-extension lemma (any local arrival order inside B(e,2t) extends to some global order without altering states inside B(e,t) up to e’s decision time).
2) Augment Lemma 8 with a brief “boundary-state sufficiency” sub-lemma and add a short remark after Corollary B about why the +1 is unnecessary there but needed in Lemma 8.
3) Start the path, t=1 interface analysis: (i) define Σ(u→v;K) precisely, (ii) attempt a proof of context-invariance, or (iii) construct a minimal LCL counterexample on a path if invariance fails. Document either outcome.
4) Double-check all radius constants with toy graphs to prevent off-by-one mistakes (in particular, re-verify K=2t+2W+1 for (W,t)-quiescent and K=max(2W, R+W) for sequential (R,W)-simulation).

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

## Round 0007 — 2025-08-27T20:02:06.818018Z

Status and target
- Goal: Close the remaining gap for the general Online-LOCAL(t) case on bounded-degree trees by finalizing the lower-bound route (localized round-elimination for sinkless orientation) and by clarifying the decision semantics so that the non-conflict step (“double grab implies contradiction”) is valid.
- What is already archived and solid: Lemma 7 (2t-commutativity), Corollary 7.1 (witness localization), Lemma 8 (quiescent bridge with K = 2t+2W+1), Claim 8.1 (phase-locality inside a color phase), and Lemma 9 (strong witness localization at v). These give an O(log* n) upper bound for quiescent/output-only regimes and the tools needed to localize online effects to B(·,2t).

Gap identified in output.md (lower-bound program)
- The previously sketched node→edge elimination step (LB.1) for sinkless orientation used the node-form (each node chooses an outgoing edge). As the verifier noted, “double witnesses” at the two endpoints of an edge do not contradict node-form feasibility—both endpoints may choose the same edge without violating “not a sink.” To proceed, we must (i) change to an edge-form LCL with a decisive step at the second endpoint, or (ii) use a universal-quantifier elimination variant that records sets of feasible labels per edge. Below I formalize both options, with a concrete normalization-and-extension lemma that is needed in either case.

New model ingredient (to make non-conflict well-defined)
- Edge-decided Online-LOCAL(t) for sinkless orientation. For orientations, we adopt edge-form semantics: an edge e = uv becomes decidable at the moment the second endpoint arrives; in that arrival window (t rounds), the algorithm must irrevocably choose one of the two orientations for e, and encode it redundantly at both endpoints. Earlier arrivals may maintain local state and make temporary proposals, but the only irrevocable decision for e is the orientation made when the second endpoint arrives. The global LCL constraint is: in the final orientation, every vertex has outdegree ≥ 1, and every edge is oriented in exactly one direction.
- Why useful: Under this semantics, two locally consistent histories that force opposite orientations for the same edge at the same decisive moment are genuinely contradictory; hence a “double-witness” proves inconsistency, fixing the non-conflict step in LB.1.

Normalization-and-extension lemma (precise, to use in LB.1)
- Lemma NE (Extension of localized schedules on trees). Fix an edge e = uv and radius t ≥ 1. Let X := B(e,2t). Consider any arrival schedule τ on X in which (i) only vertices of X arrive before the decisive step for e (the second of u,v), and (ii) outside vertices V\X are absent up to that decisive step. Then τ extends to a global arrival order 
  
  τ̂ on V(G) such that the transcript inside B(e,t) up to and including the decisive step is identical to that under τ.
- Proof idea (tree + Lemma 7 + Corollary 7.1): Keep all steps on X exactly as in τ and defer all outside arrivals to after the decisive step. During each arrival inside X, any vertex w ∈ V\X is at distance > 2t from both u and v (by definition of X), hence cannot affect B(e,t) within t rounds (Lemma 7). Thus, the absence of outside vertices is consistent and their later arrival cannot retroactively change the transcript in B(e,t). Corollary 7.1 guarantees we can push any stray outside arrival (if any) past the decisive moment without changing states in B(e,t). The tree structure prevents cycles across ∂X and ensures no “feedback” from absent nodes. Therefore τ̂ exists and preserves the local transcript. (We will write a fully quantified version for output.md; the above captures the key invariants.)
- Sanity check (t = 1): X = B(e,2) contains u, v, their neighbors, and neighbors’ neighbors. Any path from V\X to B(e,1) has length ≥ 2. In the 1-round windows of vertices of X, information from V\X cannot reach B(e,1); hence deferring V\X is harmless.

LB.1e (node→edge reduction, decisive-edge variant)
- Statement (existential form). Assume a deterministic Online-LOCAL(t) algorithm A solves sinkless orientation under edge-decided semantics for all arrival orders on bounded-degree trees. Fix an edge e = uv. After normalizing the prefix so that only vertices in X = B(e,2t) may arrive before the decisive step for e (by Cor. 7.1 and Lemma NE), the orientation of e produced by A depends only on the labeled ball X (IDs and port orderings restricted to X). Consequently, there is a well-defined edge-centered (t−1/2)-local rule A′ that, given X, outputs the unique orientation of e.
- Proof sketch (two parts):
  1) Dependence on X. Suppose there are two normalized schedules τ1, τ2 on X (with outside vertices absent) that lead A to choose opposite orientations at the decisive step. Apply Lemma NE to extend τ1, τ2 to global schedules τ̂1, τ̂2 that preserve the transcript inside B(e,t) up to the decisive step. Now consider a hybrid schedule that follows τ̂1 up to the decisive step and τ̂2 afterward (or vice versa). Since the decisive decision must be made based solely on the state in B(e,t) at that moment, and these states coincide with the ones in τ̂1 and τ̂2 respectively, we force A to choose both orientations on the same global input at the same decisive moment—a contradiction. Hence the orientation is unique and depends only on X.
  2) Radius accounting and “−1/2”: The rule is edge-centered because the decisive step is tied to the second endpoint. Looking one “half layer” beyond B(e,t) suffices to resolve which endpoint arrives second in the normalized view and to collect all causal influences (the classical t→t−1/2 descent). The dependence on X = B(e,2t) matches the standard round-elimination radius on trees.
- Why (t−1/2)-local: As in classical round-elimination, the node→edge step consumes half a round because the edge rule skips one endpoint’s final local step and aggregates the two adjacent node views into a single decision.

LB.1u (universal-sets variant—safer and closer to classical elimination)
- Statement (set labeling). Under the same setup, for each edge e and labeled ball X = B(e,2t), define S_e(X) ⊆ {u→v, v→u} to be the set of orientations that A may choose at the decisive step over all normalized arrival schedules on X consistent with the fixed labels on X (with outside vertices absent). By Lemma NE and Cor. 7.1, S_e(X) depends only on X. Moreover, S_e(X) ≠ ∅ (A always orients e when both endpoints have arrived). This yields an edge-centered (t−1/2)-local rule that assigns each edge a nonempty set of allowed orientations.
- Preservation of node constraints under sets. For any vertex w and its incident edges E(w), define the node constraint “no-sink in sets” as: there exists e ∈ E(w) such that S_e contains an orientation pointing away from w. Suppose, for contradiction, that all S_e forbid an outgoing choice for w. Then, in every normalized local schedule on the union ⋃_{e∈E(w)} B(e,2t) consistent with the same labels, A would be forced to leave w without any outgoing edge at the moment all incident edges become decidable—contradicting correctness. Thus the “no-sink in sets” constraint holds locally for the family {S_e}.
- Why this variant is attractive: It avoids the non-conflict/gluing subtlety entirely; instead of proving uniqueness, we carry sets of feasible labels as in classical round-elimination. The next elimination step will shrink these sets further.

LB.2 (iteration to 0 rounds and ID-graph contradiction)
- Statement (outline in the universal-sets framework). Alternating the localized node↔edge elimination steps 2t times, we obtain a 0-round edge-centered set-labeling rule S^{(0)} that assigns to each edge e a nonempty subset S^{(0)}_e ⊆ {u→v, v→u}, where S^{(0)}_e depends only on the ID labels in B(e,2t). The node constraints persist at each step (“no-sink in sets” remains satisfiable). As in the classical proof with ID-graphs, this induces a 0-round global prescription depending only on IDs in constant-radius neighborhoods which must satisfy the sinkless-orientation constraints. By the ID-graph property (Def. 2.16), such a 0-round prescription cannot exist, yielding a contradiction. Therefore, no deterministic constant-t Online-LOCAL algorithm (under edge-decided semantics) solves sinkless orientation on bounded-degree trees.
- Remarks:
  • The elimination preserves nonemptiness and the node constraints because both are verified locally on finite balls and follow from correctness of A over all normalized local schedules (by Lemma NE and witness localization).
  • The final contradiction for 0 rounds mirrors Theorem 2.15’s ID-graph argument: a 0-round rule reduces to an ID-based choice for each edge with no room for coordination; the girth and independence properties of H forbid satisfying the constraints everywhere.

Auditable components ready to integrate into output.md
1) Add the new Edge-decided Online-LOCAL(t) semantics for orientations (a brief model paragraph). This cleanly separates edge orientation from node “grabs” and fixes the earlier non-conflict issue.
2) Add Lemma NE (Normalization-and-extension of localized schedules) with a complete proof. It relies only on Lemma 7, Corollary 7.1, and the tree structure. We recommend including the explicit t=1 special case as an illustrative sublemma.
3) Add LB.1u (universal-sets node→edge step) as the main elimination step (safer to verify). State precisely that S_e depends only on X = B(e,2t); prove nonemptiness and the local “no-sink in sets” property.
4) State LB.2 (iteration to 0 rounds) at the same universal-sets level, and outline the ID-graph contradiction. If desired, include the decisive-edge variant LB.1e as a lemma following from uniqueness; its proof is short once Lemma NE is in place.

Sanity checks and small examples
- t = 1, paths/trees. For e = uv, X = B(e,2) suffices. It is straightforward to enumerate normalized schedules on X and verify that S_e(X) is determined solely by labels on X; any attempted dependence on arrivals outside X would contradict Lemma NE.
- Why “no-sink in sets” is preserved: If S_e(X) excluded all orientations out of u for e incident to u, then every completion of arrivals consistent with X would leave u sink at the decisive times—contradiction to A’s correctness.

Edits and clarifications suggested for output.md
- Add a short “Orientation semantics for lower bounds” remark: we work with edge-decided Online-LOCAL(t) for sinkless orientation (orientation fixed at the second endpoint’s arrival). This avoids the double-grab pitfall in the node-form.
- Insert Lemma NE (Normalization-and-extension lemma) in the “Online round-elimination on trees” subsection; cite it in LB.1u/LB.2.
- Present LB.1u (universal-sets node→edge) and LB.2 (iteration) as formal statements; defer the mechanical details of the edge→node half-step to the next iteration (we will mirror the standard set-propagation used in classical elimination and keep all radii explicit).

Next steps (concrete, checkable)
1) Write the full proof of Lemma NE with explicit quantifiers and a careful boundary argument (no edges across R_v regions for t rounds). Provide the t = 1 special case as a warm-up.
2) Formalize the edge→node half-step in the universal-sets framework, including its exact radius transformation and the preservation of nonemptiness and node constraints.
3) Complete the LB.2 write-up: define the inductive family of set rules S^{(k)}, prove invariants, and carry out the final ID-graph contradiction carefully (as in Theorem 2.15), referencing the girth and independence properties.
4) Optionally, give a short note showing that, if one prefers, LB.1e (decisive-edge uniqueness) can be proven directly for t = 1 (trees), then extended to general t by induction on t using the universal-sets machinery.

Additional observations (minor)
- Output.md is consistent on radii: Lemma 8 needs K = 2t+2W+1; Corollary B simulates a derived sequential (R,W)-rule and needs K = max(2W, R+W) (no +1). The explanatory remark is already present—good.
- No further gaps spotted in the positive (quiescent) route. After integrating the LB lemmas above, we can state the main theorem existentially: Any LCL solvable in O(1) deterministic Online-LOCAL(t) on bounded-degree trees admits an O(log* n) deterministic LOCAL algorithm. (Proof: such an LCL cannot be in the log n-hard class by the lower bound; hence by tree classification it lies in the O(1)/Θ(log* n) class.)

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

## Round 0008 — 2025-08-27T20:11:49.230329Z

Status and alignment with the task
- Goal: Prove that any LCL on bounded-degree (nonoriented) trees solvable in O(1) rounds in deterministic Online-LOCAL(t) has a deterministic LOCAL algorithm in O(log* n) rounds.
- What is archived: Solid positive bridges for (i) output-only (with/without bounded writes) and (ii) (W,t)-quiescent Online-LOCAL(t), including correct radius/coloring constants and a clean phase-independence claim (Claim 8.1). Vertex-level witness localization (Lemma 9) is correct.
- What remains open: The unrestricted Online-LOCAL(t) case (idle state accumulation). The previously proposed edge-level normalization and boundary-freezing tools are not valid in this model.

Corrections and clarifications (no changes to output.md required)
- Edge-level normalization is not available in the unrestricted Online-LOCAL(t) model. The “converse normalization” that would push all outside arrivals past the decisive moment for an edge e while preserving the state on B(e,t) is false in general; a t=1 path counterexample is recorded in notes.md (already drafted). We will keep any edge-centric normalization claims out of output.md.
- Lemma 9 (vertex-level) remains correct and sufficient for node-focused analyses. We will resist using it to argue about edge-level decisions without additional assumptions.

New incremental results: two small but precise additions
1) Lower bound route under output-only (unbounded writes optional): localized set-valued elimination is sound
- Why relevant: Although we already have an O(log* n) upper bound for output-only (Corollary B), it is conceptually useful to document that the “log n-hard” class (e.g., sinkless orientation) cannot have constant-t deterministic Online-LOCAL algorithms even under output-only. This pins down the classification boundary and sets up a template for trying to extend to broader models.
- Statement (LBoo.1: Node→edge universal step, output-only). Let A be a deterministic output-only Online-LOCAL(t) algorithm on bounded-degree trees for sinkless orientation, under edge-decided semantics (the orientation of edge e=uv is fixed when the second endpoint arrives). For each edge e and labeled ball X=B(e,2t) consisting of the underlying tree structure and the current fixed outputs on vertices in X (outputs are immutable; no other state persists), define the admissible orientation set S_e(X)⊆{u→v, v→u} as follows: orientation o∈{u→v,v→u} is in S_e(X) iff for every arrival schedule τ that processes only vertices of X up to e’s decisive step (with outside vertices absent), A orients e as o when run on τ. Then S_e(X) is well-defined and depends only on X (not on any outside history). Moreover, S_e(X)≠∅.
- Why sound under output-only:
  • (Dependence) In output-only, messages sent during v’s t-round window depend only on currently fixed outputs within distance ≤t of the sender. Hence, at the decisive step for e, all messages that can influence e come from within B(e,2t) and are functions of outputs in B(e,2t). Outside arrivals cannot affect these messages except via altering outputs inside B(e,2t), which is excluded by fixing X.
  • (Universal quantification) Quantifying over all internal schedules τ within X (with outside absent) captures exactly the variability consistent with the same X; no external mutable state exists.
- Consequence (iteration). The above universal node→edge step yields an edge-centered set-valued rule at parameter t−1/2, with a finite type space since X is a constant-radius ball with finite output alphabet. The classical dual edge→node universal step can be defined symmetrically (node’s admissible incident orientations based on B(v,2t−1)). Iterating 2t times yields a 0-round set-valued prescription depending only on constant-radius output patterns. Combining with the ID-graph argument (Def. 2.16) as in classical proofs gives a contradiction for sinkless orientation, hence no constant-t deterministic output-only Online-LOCAL algorithm solves it on bounded-degree trees.
- Audit plan: We will write the universal step precisely, define the finite type spaces, and state the invariants (nonemptiness and local constraints preservation). This avoids boundary-freezing and does not require edge-level normalization beyond “outside absent.”

2) Minimality of the +1 in Lemma 8 for t≥2 (clean formal counterexample)
- Proposition (tightness of K): For (W=0,t≥2)-quiescent batching in Lemma 8, a coloring of G^{2t} (no +1) is insufficient in general. Even on a path, there exist two same-color centers a,b at distance 2t+1 such that their active regions R_a=B(a,t) and R_b=B(b,t) are disjoint but adjacent by a single edge; within the t rounds of the phase, messages can couple the evolutions across that cross-edge and invalidate independence. Therefore, K=2t+1 is necessary to forbid any edge between active regions.
- Proof sketch (paths): Place a and b at distance 2t+1. Let x∈R_a and y∈R_b be the unique boundary vertices with dist(x,y)=1 (dist(x,a)=t and dist(y,b)=t). Define a quiescent Online-LOCAL(t) algorithm A whose t-round window at a uses a 2-round dependency chain that needs information from y to x to a (e.g., x sends a bit to y in round 1; y sends a function of that bit back in round 2; then x forwards to neighbors, and so on toward a). Symmetrically, b’s window uses the same coupling. Because x∈R_a and y∈R_b, the cross-edge (x,y) allows one-round communication and a two-round path x→y→(toward b) exists within the window; thus, the transcript in R_a depends on the initial state at y (and vice versa), violating active-region independence. For K=2t+1 we have dist(R_a,R_b)≥2, ruling out any cross-edge and restoring independence, as used in Lemma 8.
- Note: The earlier t=1 intuition is correct in spirit, but a fully explicit two-round coupling is simplest for t≥2. We propose adding this as a short formal remark after Lemma 8.

Why these are progress
- LBoo.1 pins down a rigorous elimination step in the output-only regime (no boundary-freezing pitfalls) and establishes impossibility of constant-t online for sinkless orientation even there. This complements the positive bridge, and the proof components (finite type spaces; universal sets; ID-graphs) can be audited locally.
- The tightness proposition for K clarifies the necessity of the +1 separation and provides a clean t≥2 path example that can be checked by hand, enhancing the exposition of Lemma 8.

Obstacles and limits
- Unrestricted Online-LOCAL(t): The boundary-freezing abstraction is invalid; outside arrivals can influence B(e,t) through chains interior to B(e,2t). Any round-elimination in this model needs either (i) an a priori finite compaction of all relevant outside influence to a finite boundary type, or (ii) a restriction (output-only / quiescent / finite-state & ID-oblivious). We do not yet have such a compaction lemma.
- Edge-level normalization: Only the “extension” direction (realize a local schedule τ inside B(e,2t) by listing τ first and postponing outside vertices) is safe; the converse normalization is false.

Concrete next steps (auditable)
1) Formalize and add to notes a precise statement LBoo.1 (node→edge universal step under output-only), its symmetric edge→node step, and the iteration to a 0-round contradiction for sinkless orientation. Keep it in a dedicated “Lower bound under output-only” subsection. Track constants and type spaces explicitly (Δ,t fixed, output alphabet finite).
2) Add a short remark to output.md after Lemma 8 with the t≥2 path counterexample justifying K=2t+1 necessity (currently only a general remark is present). We can phrase it as a one-paragraph proposition with the coupling path spelled out.
3) Record explicitly in notes (not output.md) that edge-level converse normalization is invalid, including the t=1 path counterexample already drafted, to prevent its reintroduction.
4) Explore a quiescentization transform on paths for t=1 (finite-state/ID-oblivious first): define formal boundary interfaces Σ(u→v;K) over B(v,2) and attempt either (a) to prove context-invariance (thus a constructive compilation to quiescent), or (b) to build a minimal LCL counterexample showing invariance fails in the unrestricted model.

Potential additions to output.md (optional, if desired by verifier)
- A new “Lower bound under output-only Online-LOCAL(t)” lemma suite (LBoo.1–LBoo.2) stating that sinkless orientation has no deterministic constant-t Online-LOCAL solution even under output-only, with a brief proof sketch and references to ID-graphs. This is independent of the main positive result but clarifies the landscape.

Gaps spotted in output.md
- None critical. If we add the K-tightness remark for t≥2, we should ensure it aligns with Claim 8.1’s proof and the standard LOCAL timing used there.

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

## Round 0009 — 2025-08-27T20:21:29.125628Z

Status and focus
- Objective: Prove the speedup on bounded-degree (nonoriented) trees: any LCL solvable in O(1) rounds in deterministic Online-LOCAL(t) admits an O(log* n) deterministic LOCAL algorithm.
- Current archive: Positive bridges are solid (order-robust sequential⇒LOCAL; output-only and (W,t)-quiescent bridges with correct radii; Lemma 7 and Lemma 9 for 2t-commutativity/witness localization; Lemma 8 for quiescent batching with K=2t+2W+1). Lower-bound route is partially scaffolded: output.md now contains Lemma S (edge-local adversarial scheduling) but not the elimination steps.

New clean ingredients (node-centric admissible sets and node-local scheduling)
- Lemma S_node (Schedule-localization around a node). Let A be any deterministic Online-LOCAL(t) algorithm on a bounded-degree tree G and w any vertex. There exists an arrival schedule σ(w) such that: (i) all vertices of B(w,2t+1) arrive before any vertex outside B(w,2t+1); (ii) all edges incident to w become decidable within this prefix (in edge-decided semantics: by the time both endpoints of each incident edge have arrived); (iii) the entire execution up to the time when all edges incident to w are decided depends only on the labeled type of B(w,2t+1) (graph structure, port colors, IDs) and the internal arrival order within B(w,2t+1); vertices outside are absent and irrelevant up to that time.
  Why true: This is the node-analogue of Lemma S. List all vertices in B(w,2t+1) first (in any order ending with the last endpoints of incident edges), then list the rest. During the prefix, all signal paths that can influence the decisions on edges incident to w have length ≤ t within the active regions attached to those edges; the farthest relevant sources lie within distance ≤ 2t+1 from w (union over incident edges), so the outside can be kept absent without loss. This avoids any converse normalization and relies only on adversarial scheduling.

- Definition (U_w and node-type). For a node w and parameter t, define U_w := ⋃_{e∋w} B(e,2t). On a tree, U_w ⊆ B(w,2t+1). Let X_w denote the isomorphism type (structure, port colors, and ID-graph labels) of U_w, taken up to rooted-isomorphism at w.

- Lemma T (Node-centered admissible outward ports). Consider sinkless orientation under edge-decided semantics and a deterministic Online-LOCAL(t) algorithm A on Δ-bounded trees with the ID-graph framework. For each node w and its type X_w, define T_w(X_w) ⊆ Ports(w) as follows: p ∈ T_w(X_w) iff there exists an internal arrival order τ on U_w (with the outside absent) under which A orients the incident edge in direction “out of w along port p,” when all incident edges of w are decided. Then:
  (a) Well-defined dependence and finiteness: T_w depends only on X_w. The family of possible X_w is finite for fixed Δ,t via the ID-graph framework.
  (b) Nonemptiness (node-side “no-sink-in-sets”): For every X_w, T_w(X_w) ≠ ∅.
  Justification: (a) follows from Lemma S_node (the adversary can fix all arrivals to lie inside U_w before any outside node, so the transcript and all incident-edge decisions depend only on the labeled type and internal order). (b) If T_w(X_w)=∅, then under every internal order on U_w with the outside absent, A would necessarily decide all incident edges into w, making w a sink—contradicting correctness for some valid arrival order (the one confined to U_w).
  Remarks: This node-level set construction avoids the compositionality flaw of per-edge sets on B(e,2t): it quantifies over the whole finite neighborhood U_w in which mutual interactions among the incident edges of w can occur before they are decided.

Towards a safe elimination framework (outline acceptable for auditing)
- Edge→Node half-step (formalizable now). Starting from an Online-LOCAL(t) algorithm A (edge-based semantics), define the node-level set rule T_w on X_w as above. Invariants: (I1) T_w(X_w) is nonempty for all X_w; (I2) Type space is finite (bounded depth 2t+1 in the ID-graph); (I3) The rule depends only on the local type X_w (adversarial scheduling ensures outside is absent). This is the “universal union over internal orders” step at node level.
- Node→Edge half-step (to be completed next round, but scoped). Given node-level sets T_w on U_w, derive per-edge admissible orientation sets S_e on X_e (type of B(e,2t)) as follows: o ∈ S_e(X_e) if there exists a joint type Z = U_u ∪ U_v (u,v are endpoints of e) and an internal order on Z (outside absent) such that the chosen outward ports at u and v belong to T_u(X_u) and T_v(X_v) respectively, and the resulting orientation of e is o while all incident edges at u and v are decided consistently. We will keep quantification local to Z (radius ≤ 2t+1 around e) and use adversarial scheduling as in Lemma S_node. We will prove: (J1) S_e(X_e) is nonempty; (J2) it depends only on X_e (finite); and (J3) the node-side nonemptiness of T_w is preserved in the next node step. This yields a (t−1/2)-step reduction and can be iterated. Details forthcoming.

Explicit tightness example for the “+1” in Lemma 8 (quiescent, W=0, t=2)
- Proposition (+1 necessity for quiescent batching). On a path, with W=0 and t=2, coloring G^{2t}=G^{4} is insufficient to ensure phase independence under Lemma 8; G^{2t+1}=G^{5} is necessary. Construction:
  • Graph and centers: Take a path and choose two centers a,b at distance 2t+1=5. Their active regions are R_a = B(a,2) and R_b = B(b,2), which are disjoint but adjacent by a single cross-edge (x,y) with x ∈ R_a at dist(a,x)=2 and y ∈ R_b at dist(b,y)=2.
  • Quiescent algorithm A (W=0, t=2): In the 2-round arrival window of color-i vertices, only nodes in the active regions change state; all others are quiescent. Round 1: every node in R := R_a ∪ R_b sends its initial bit b(v) (e.g., computed from ID(v) modulo 2) to all neighbors. Round 1 update: for each v ∈ R, set s(v) = XOR of received bits. Round 2: each v ∈ R sends s(v) to neighbors in R; outputs inside R can depend on s(·). Nodes outside R never change state (quiescent) and cannot forward.
  • Coupling via the cross-edge: In round 1, y sends b(y) to x across the single cross-edge (x,y). Thus s(x) depends on b(y) at the end of round 1. In round 2, x propagates s(x) one hop inward within R_a; hence the transcript inside R_a (already at x and its neighbor) depends on b(y), a boundary variable in R_b. This violates the Claim 8.1 independence when K=2t (adjacent active regions). Coloring G^{2t+1} forbids any cross-edge (dist(R_a,R_b) ≥ 2), restoring independence as in Lemma 8.
  • Conclusion: The +1 in K=2t+1 is necessary already for t=2 under standard LOCAL timing and quiescence; without it, one-round cross-edge signals couple the regions in the same phase.

Why these are progress
- We remove the compositionality bug in the edge-centered sets by moving to node-centered admissible sets T_w on U_w = ⋃ B(e,2t). This is the correct granularity for capturing all interactions among edges incident to a node before their decisions, and it is compatible with adversarial local-first scheduling (no boundary freezing).
- We introduce Lemma S_node (node-local scheduling), the exact node analogue of the already archived Lemma S; it is needed to justify that T_w(X_w) depends only on the type X_w.
- We provide a fully explicit, round-by-round, quiescent W=0, t=2 counterexample establishing the necessity of the +1 in K, ready to be archived as a proposition following Lemma 8.

Gaps and corrections suggested for output.md
- Missing: Node-local adversarial scheduling lemma. Recommend adding Lemma S_node as stated above; its proof mirrors Lemma S by listing B(w,2t+1) first and deferring the outside.
- Missing: Node-level admissible sets. Add Lemma T (node-centered admissible outward ports) with precise definitions: U_w, X_w, T_w(X_w); prove dependence on X_w and nonemptiness by adversarial schedules and correctness.
- Lower-bound step caution: Do not add per-edge set S_e based solely on B(e,2t) with a “no-sink-in-sets” argument; as the verifier noted, that argument is non-compositional. Shift the set framework to the node level as above and only then define a safe node→edge half-step over Z = U_u ∪ U_v (to be written next round).
- +1 tightness: Promote the “+1 is necessary” remark after Lemma 8 to a formal proposition using the explicit t=2 construction above.

Obstacles and what remains
- Formal node→edge half-step: We must define S_e(X_e) using only local data from Z = U_u ∪ U_v (radius ≤ 2t+1), prove nonemptiness and the preservation of node-side invariants when alternating node and edge steps, and quantify exact radius changes (t → t−1/2). This is planned for the next round.
- Final ID-graph contradiction: After 2t iterations we should obtain a 0-round edge-centered set rule S^{(0)} with nonempty per-edge sets determined by constant-radius types. We then replicate the classical ID-graph contradiction for sinkless orientation. Node-only sets are insufficient for a final contradiction; arriving at edge-level sets is required.

Next steps (auditable)
1) Archive Lemma S_node (schedule-localization around a node) and Lemma T (node-centered admissible ports) in output.md with full proofs and explicit type finiteness under the ID-graph framework.
2) Formalize the node→edge universal half-step using Z = U_u ∪ U_v, including: definition of S_e(X_e), proof of nonemptiness and type dependence, and the precise radius drop to 2t (edge-centered). State invariants for iteration.
3) Add the explicit t=2, W=0, quiescent counterexample as a proposition after Lemma 8, establishing the necessity of K=2t+1.
4) In a separate subsection, outline the full iteration (2t steps) and the 0-round contradiction via the ID-graph, to conclude the lower bound for sinkless orientation and hence the existential O(log* n) speedup for any O(1)-round Online-LOCAL LCL on trees by Theorem 2.33.

Why the plan yields the main theorem
- The node/edge universal elimination (once completed) gives that sinkless orientation has no deterministic constant-t Online-LOCAL algorithm on trees. By the tree LCL classification (Theorem 2.33), any LCL solvable in O(1) Online-LOCAL on trees cannot be in the Θ(log n) or Θ(log log n)/Θ(log n) classes; hence it belongs to the Op1q/Θ(log* n) class, implying the existence of an O(log* n) deterministic LOCAL algorithm.

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

