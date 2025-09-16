# Research Notes



Working definitions and dynamics
- We fix the open-neighborhood operator N(X)=⋃_{x∈X}N(x). For a schedule S_1, …, S_t (|S_i|≤k), define R_1:=V\S_1 and R_{i+1}:=N(R_i)\S_{i+1}. The schedule is winning up to horizon t iff R_t=∅. Equivalently, using P_1:=V and P_{i+1}:=N(P_i\S_i), the schedule wins iff P_{t+1}=∅. These are equivalent formulations under an index shift.

Verified results we will use
- Subgraph monotonicity: If H⊆G then h(H)≤h(G).
- Upper bound: h(G)≤τ(G) by shooting a minimum vertex cover twice (capture by time 2).
- Lower bounds: h(G)≥δ(G); therefore h(G)≥degeneracy(G). Also, if G contains K_{s,t} as a subgraph then h(G)≥min{s,t}.
- Exact values: h(K_n)=n−1; h(K_{p,q})=min{p,q}. For cycles, h(C_3)=2 (clique), h(C_4)=2; for C_5 a concrete 4-round schedule with k=2 succeeds (see proofs.md). The claim that two fixed antipodal shots per round win on all cycles is false for odd n.

Corrections to earlier claims
- The statement h(K_n)=n is incorrect; n−1 hunters suffice (and are necessary by δ(K_n)=n−1).
- The 1-hunter impossibility on P_n for n≥4 is false; e.g., P_4 has an explicit 1-hunter winning schedule. A general proof that h(P_n)=1 appears feasible but is not yet written.
- The assertion that the decision problem is in NP lacks a bound on schedule length; a priori, a winning schedule may require exponentially many rounds.

Concrete example (cycles)
- C_5 with k=2: S_1={1,3}, S_2={4,5}, S_3={2,4}, S_4={1,4} yields R_1={2,4,5}, R_2={1,3}, R_3={5}, R_4=∅. Thus h(C_5)≤2. For odd cycles, fixed pairs per round do not suffice; schedules must change over time.

Algorithmic consequences (current)
- Fast NO: if degeneracy(G)>k or ω(G)≥k+2 then h(G)>k.
- Fast YES: if τ(G)≤k then h(G)≤k (via FPT vertex-cover).
- These give n^{O(k)} filters but do not settle all instances.

Open targets and next steps
1) Prove h(C_n)=2 for all n≥3 (and record a general schedule). 2) Settle k=1: prove or refute “h(G)=1 iff G is a forest.” 3) Investigate structural upper bounds: does h(G)≤tw(G)? A positive answer implies polynomial recognition for fixed k. 4) Design a separator-based DP that simulates R-evolution with states depending only on boundary sets of size ≤k. 5) Empirically compute h on small graphs (n≤10) and all trees up to n≈12 to test the degeneracy-equality conjecture and discover obstructions.

New validated tools and results
- Permanent blockers. If U⊆V is shot every round, any avoiding walk stays in G−U, hence h(G) ≤ |U|+h(G−U). This enables reductions via feedback vertex sets and other separators.
- Disjoint unions. For graphs on disjoint vertex sets, h(G ⊔ H)=max{h(G),h(H)}. A concatenation of winning schedules for components suffices.
- Paths. A 1-hunter “forward/backward sweep” of length 2n−3 (shots 1,2,…,n−1,n−1,n−2,…,2) wins on P_n; a parity-invariant proof verifies R_{2n−3}=∅.
- k=1 classification. h(G)=1 iff G is a forest. Proof: cycles force ≥2 by δ=2; for forests, an inductive schedule repeatedly shoots a neighbor u of a leaf ℓ twice, then recurses on T−ℓ. A key fact: for any X and leaf ℓ with neighbor u, ℓ∉N(N(X)\{u}). This ensures ℓ never reappears in R after the double-shot.
- Cycles. Explicit 2-hunter captures verified on C_5 and C_6; odd cycles require time-varying shots. A uniform proof h(C_n)=2 for all n remains open.

Corrections and cautions
- The “Z-process” identity R_i=V\(Z_i∪S_i) with Z_{i+1}={v:N(v)⊆Z_i∪S_i} holds, but Z_i need not be monotone. Arguments relying on Z-monotonicity (e.g., h=degeneracy proof) are invalid.

Algorithmic implications (current)
- Exact k=1 recognition in linear time via acyclicity. For general k, fast filters: if degeneracy(G)>k (or ω(G)≥k+2), then NO; if τ(G)≤k, then YES (2-round capture using a vertex cover).
- Permanent blockers yield: if fvs(G)≤k−1 and h(forest)=1 (proved), then h(G)≤k, giving an n^{O(k)} recognition on that subclass by enumerating U (|U|≤k−1).

Next steps
1) Settle cycles: prove h(C_n)=2 for all n (start with exhaustive R-set BFS on C_7). 2) Formalize a separator-based DP that simulates R_{i+1}=N(R_i)\S_{i+1} across small boundaries (treewidth/FVS). 3) Evaluate the degeneracy-equality conjecture empirically on n≤10 and either prove or refute it. 4) Pursue either h≤tw (positive algorithmic route) or hardness for k=2 (layered gadgets) as a decisive direction on the main question.

Updates and clarifications

- Conventions: A k-hunter schedule is a sequence (S_1, …, S_t) with |S_i| ≤ k. We use t for the horizon and n=|V|.
- Dynamics: Define R_1:=V\S_1 and R_{i+1}:=N(R_i)\S_{i+1}. Equivalently, P_1:=V and P_{i+1}:=N(P_i\S_i). Then R_t=∅ iff P_{t+1}=∅; moreover, R_t = P_t\S_t and P_{t+1} = N(R_t) (easy induction).
- Z-process identity: With Z_1:=∅ and Z_{i+1}:={v : N(v)⊆Z_i∪S_i}, one has R_i = V\(Z_i∪S_i) for all i. Caution: (Z_i) need not be monotone. Example: on P_4 with S_1={3}, S_2={2}, one checks 4∈Z_2 but 4∉Z_3.

Validated tools
- Subgraph monotonicity: If H⊆G, then h(H) ≤ h(G).
- Lower bounds: h(G) ≥ δ(G); hence h(G) ≥ degeneracy(G) by subgraph monotonicity.
- Upper bound: h(G) ≤ τ(G) (two rounds shooting a vertex cover).
- Disjoint unions: h(G ⊔ H)=max{h(G), h(H)}.
- Permanent blockers: If U⊆V is shot every round, any evading walk stays in G−U; thus h(G) ≤ |U| + h(G−U).
- Separator composition: If G is obtained by gluing pieces along S, then h(G) ≤ |S| + max_i h(piece_i).
- Exact values: h(K_n)=n−1; h(K_{p,q})=min{p,q}.
- Periodic lifts: A period-p schedule (repeated) is winning iff the cyclic time-lift L_p, after removing per-layer shots, is acyclic (gives a finite capture horizon ≤ n·p).

Corrections and open items
- Minor-monotonicity is unproven; the edge-contraction proof attempt fails because an H-walk through the contracted vertex need not lift to a G-walk of the same length while avoiding the shots. Do not assume {h≤k} is minor-closed.
- The claim h(G)=1 iff G is a forest is not yet rigorously established. The leaf double-shot invariant ensures exclusion after exactly two steps but does not imply the leaf never reappears later. A complete proof (or counterexample) is needed.
- Cycles: We have explicit small schedules for C_5, C_6. A uniform proof h(C_n)=2 can follow from a complete proof that h(P_m)=1; alternatively, provide a direct 2-hunter schedule.
- Unicyclic graphs: The statement h(G)=2 for fvs(G)=1 depends on the (currently unproven) forest case.

Algorithmic implications (current)
- Fast NO: if degeneracy(G)>k or ω(G)≥k+2 then h(G)>k (the clique test is n^{O(k)} by brute force; degeneracy is linear-time).
- Fast YES: if τ(G)≤k then h(G)≤k (two-round capture). For fvs(G)≤k−1, by permanent blockers one gets h(G)≤k whenever h(forests)=1 holds; this gives an n^{O(k)} recognition on that subclass once the forest case is settled.

Next steps
- Write and verify a complete proof that a 1-hunter schedule of length O(n) wins on P_n; then derive h(C_n)=2. Revisit unicyclic once forests are resolved.
- Probe minor-monotonicity: search for a contraction counterexample (e.g., compare K_4 versus a single-edge subdivision) via exact R-evolution on n≤8.
- Explore bounded-period schedules using the L_p acyclicity criterion; implement a checker for small p and k.
- Develop a separator-based DP on bounded treewidth/feedback vertex set exploiting the separator composition bound.

New settled results and tools this round
- Cycles solved: For all n≥3, h(C_n)=2. Proof: Permanently shoot one vertex u (anchor); the evader is confined to C_n−u ≅ P_{n−1}, where a 1-hunter sweep wins. Explicit 2-hunter schedule length 2n−5 follows from the path sweep template.
- Unicyclic graphs: If G is connected with exactly one cycle, then h(G)=2. Anchor any cycle vertex; G−{u} is a tree (h=1) and permanent blockers add +1.
- Cut-vertex reduction: If a is a cut vertex of G and C_1,…,C_m are the components of G−a, then h(G) ≤ 1 + max_i h(C_i). Reason: block a, then use that h on a disjoint union is the max over components.
- Disjoint unions: h(G ⊔ H)=max{h(G),h(H)} (components decouple under R-evolution).
- FVS bound (constructive): h(G) ≤ fvs(G)+1 by blocking a feedback vertex set and sweeping each tree component. This yields an n^{O(k)} YES-recognizer on graphs with fvs ≤ k−1 by enumerating blockers and checking acyclicity.

Cautions
- Do not rely on monotonicity of the Z-process R_i = V\(Z_i∪S_i) with Z_{i+1}={v:N(v)⊆Z_i∪S_i}; Z_i need not be monotone.
- Unproven length bounds for arbitrary trees: we use the proven 2|V(T)|−1 schedule-length bound; the stronger 2|V(T)|−3 holds for paths, not yet for all trees.

Next steps
- Implement the small-FVS recognizer and a block–cut DP using anchors at selected cut vertices. Resolve cactus graphs for k=2. Investigate Pre_k(T) fixpoint compression for k=2. Explore separator-based DP or hardness for general k.

New tools and results
- Periodic schedules: A period-p schedule (S_1,…,S_p) repeated is winning iff the time-lift L_p on V×[p], after removing layer-shot vertices, is acyclic. If acyclic, capture occurs within ≤ p·|V| rounds. This enables verification of periodic strategies by finite DAG checks.
- Pathwidth upper bound: h(G) ≤ pw(G)+1, via coupling to classical node-search (Kinnersley 1992; Fomin–Thilikos 2008). Consequently, for classes with pw≤k−1 we can accept h≤k in polytime.
- Separator composition: If V=U⊔W⊔S with no U–W edges, then h(G) ≤ |S| + max{h(G[U∪S]), h(G[W∪S])} by permanently shooting S. This generalizes the cut-vertex reduction.
- Cacti: Necklaces (block–cut path of cycles with pendant trees) are plausibly 2-hunter via a maintained anchor and safe transfers; general cacti admit a constructive 3-hunter strategy using two permanent anchors plus one sweeper; whether all cacti have h=2 remains open.

Corrections and cautions
- Vertex-expansion lower bound: ι(G):=min_{∅≠X}(|N(X)|−|X|). The implication ι(G)≥k ⇒ h(G)≥k+1 is valid, but it does not strengthen the min-degree bound since ι≤δ−1. Use it as a NO-filter only.
- Anchor transfer: To transfer an anchor from a to b across a cut, require a ∉ R_i at the transfer time i. Otherwise neighbors of a outside the intended side may enter R_{i+1}.
- Cactus h=2 by leaf-block pruning fails without persistent barriers: releasing the attachment vertex later can reintroduce cleared blocks. Maintain a global barrier invariant (e.g., a current anchor) as in the necklace setup, or use two anchors + one sweeper (h≤3).

Next steps
- Formalize and prove: periodic-lift criterion; h ≤ pw+1; corrected anchor-transfer lemma; necklace h=2. 
- Implement n^{O(k)} YES-recognizer for graphs with fvs≤k−1 (enumerate blockers; run forest schedule), and a block–cut DP prototype.
- Investigate period bounds p=f(k) and cactus tightness (h=2 vs h=3) via small counterexample search.