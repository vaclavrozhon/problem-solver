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

