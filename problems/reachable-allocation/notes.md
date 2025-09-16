# Research Notes



Research log (round X)

- Problem recap: Tree T with agents at vertices, initial endowments h_v, strict preferences. Allowed swaps occur on edges when both endpoints strictly prefer the swap. TREE-REACHABLE-PE asks if there exists a reachable allocation that is globally Pareto-efficient (PO), and to produce one if it exists.

- Settled facts:
  - Any allocation reachable via allowed swaps is individually rational (IR) w.r.t. the initial endowment.
  - For a fixed target matching on a tree, reachability by allowed swaps can be decided in O(n^2) time (good-edge scheduling).
  - Global PO of a given allocation can be checked in O(n^2) via the standard improvement-digraph (agent→objects strictly preferred to current; object→current owner); PO ⇔ no directed cycle.
  - TTC is globally PO and is the unique core allocation under strict preferences. Thus: TTC reachability is a valid one-sided poly-time test (if reachable, answer YES and output TTC with a swap sequence).

- Open pivot: Is the TTC allocation the unique allocation that is both IR and globally PO? If yes, then TREE-REACHABLE-PE reduces to checking reachability of TTC (O(n^2)). If not, the TTC test is incomplete and the general problem remains open.

- Action items:
  1) Attempt a formal proof that any IR+PO allocation must coincide with TTC, by inductively showing that the first-round TTC cycle agents must receive their top objects in any IR+PO allocation (and recursing). If this fails, search small instances (n ≤ 6) for an IR+PO allocation ≠ TTC.
  2) Regardless, maintain TTC-as-certificate: compute TTC, then run the tree reachability routine; if reachable, we get a constructive solution.
  3) Parameterized approach: implement a nice tree-decomposition DP (width w) that enumerates partial injections; at the root, filter by (a) reachability from µ0, (b) global PO. This yields an FPT algorithm in treewidth.

- Examples recorded:
  - Path A–B–C with A: c≻a≻b, B: b≻a≻c, C: a≻c≻b: no swap applies, and the initial allocation is not globally PO (the 3-cycle allocation dominates). Serves as a caution that “no allowed swap” ≠ global PO even on paths.


Counterexample: Pareto-optimal ≠ core in Shapley–Scarf

- Endowments: agents 1,2,3 own a,b,c. Preferences: 1: b ≻ c ≻ a; 2: a ≻ b ≻ c; 3: a ≻ b ≻ c. Allocation µ = (1→c, 2→b, 3→a) has no directed improvement cycle (globally PO). Coalition {1,2} can reassign their endowments {a,b} to (1→b,2→a), strictly improving both, so µ is not in the core. Thus PO does not imply core; TTC is not the unique globally PO outcome.

Safe building blocks (kept):
- Reachable ⇒ IR. Any allowed swap strictly improves its endpoints; others unchanged.
- PO test: the improvement-digraph acyclicity criterion (agent→more-preferred objects; object→owner) in O(n^2).
- Tree target-reachability in O(n^2) via good-edges; yields witness sequences when reachable.
- TTC as a one-sided poly-time certificate: if reachable, output it; else inconclusive.
- Sink special case: if µ0 has no allowed swap, reach(µ0)={µ0}; decide by a single PO test.

Open directions:
- FPT by treewidth: DP over a nice decomposition storing partial injections; root filters: reachability + PO.
- Stars: prove or refute unique sink (order-independence) rigorously.
- Small-instance search (n≤6) to find instances with TTC unreachable but some other reachable globally PO, and to probe structural patterns.


Addendum: parameterization and stars status

- Parameterized by number of movers k: Enumerating subsets S of size ≤k and permutations of their endowments yields time O(n^k·k!·poly(n)). This is XP (slice-wise polynomial), not FPT. A true FPT algorithm would require f(k)·poly(n) time; further techniques (e.g., kernelization, bounded-branch parameters) are needed.

- Stars (object-moving): The center’s object increases monotonically in the center’s preference along any allowed swap sequence. A proposed acceptance-digraph approach suggests a unique final center object, but uniqueness of the entire terminal allocation (order-independence across leaves) still lacks a fully rigorous proof. We keep stars in the “special-case under investigation” category until a complete proof or counterexample is produced.

- Working plan: (i) Prove or refute unique terminal allocation on stars; (ii) Explore combined parameters (e.g., number of branch vertices plus k movers) for potential FPT; (iii) Formalize boundary summaries for a decomposition-based DP on trees; (iv) Build a small-instance benchmark set (n≤6) with TTC unreachable yet some other reachable globally PO allocation present.


Model alignment and star dynamics (object-moving)

- In our model, agents are fixed on vertices; objects move along edges by allowed swaps. Analyses based on agents moving (e.g., “center becomes A”) are invalid here.

- Stars: Let the center vertex agent have strict order ≻_c. A swap with leaf ℓ at state where the center holds x and ℓ holds h_ℓ is allowed iff h_ℓ ≻_c x and x ≻_ℓ h_ℓ. Along any swap sequence, the center’s held object strictly increases in ≻_c; each leaf swaps at most once. The final center object is unique (maximal in the acceptance DAG under ≻_c), but terminal allocations (sinks) are not unique; e.g., with center order b ≻ a ≻ x0 and both leaves preferring x0 ≻ a ≻ b, both paths x0→b and x0→a→b are valid and yield distinct sinks.

- Safe verifiers retained: fixed-target reachability on trees via good-edge scheduling (O(n^2)); global PO test via improvement-digraph acyclicity (O(n^2)); hence TREE-REACHABLE-PE ∈ NP. TTC reachability and sink-test remain sound one-sided certificates.

- Parameterization: Enumerating at most k movers yields an exact XP algorithm in n^{O(k)} time by enumerating subsets S (|S|≤k) and injective assignments on S, then checking reachability and PO per candidate.

- Leaves parameter (outline): Root at an articulation r; for a bounded number of leaves L, enumerate cross-branch flow patterns across r; solve each branch (path) under boundary constraints and summarize a boundary partial order; accept if the union summary is acyclic and per-branch PO holds. Requires a precise boundary state and a correctness proof.

Next steps: (i) Replace any agent-moving formulations with object-moving ones; (ii) formalize the leaves-parameter boundary summaries and proofs; (iii) develop a star acceptance-DAG DP to decide existence of a PO sink without path enumeration; (iv) continue assembling small instances (n≤6) to test and refine structural claims.