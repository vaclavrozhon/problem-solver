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
