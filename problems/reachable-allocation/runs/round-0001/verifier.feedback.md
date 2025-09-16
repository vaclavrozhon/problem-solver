Overall assessment: The four provers disagree on a key structural point: whether a globally Pareto-efficient (PE) allocation in a Shapley–Scarf housing market with strict preferences must be the TTC outcome (and hence unique). Prover 1 bases a full O(n^2) algorithm on this claim; Provers 2 and 4 explicitly reject uniqueness and argue TTC is only a sufficient certificate. This disagreement is the primary blocking issue and must be resolved rigorously.

Key audits

- On “reachable ⇒ IR”: Correct. Any sequence of allowed edge-swaps strictly improves the two participants and leaves others unchanged, so each agent’s object improves monotonically relative to their initial endowment. Thus any reachable allocation is individually rational (IR). This can safely go to proofs.md.

- On global PO verification: Correct. The standard “trading (improvement) digraph” test is polynomial: build a digraph with arcs agent→object for objects strictly preferred to their current assignment and object→owner(object). An allocation is globally PO iff this digraph has no directed cycle. This is a known characterization; can be written formally in proofs.md and used to check candidates.

- On “IR+PO ⇒ TTC (unique)”: This is the linchpin of Prover 1’s reduction and is presently unproven in the drafts. It is NOT immediate that global PO plus IR implies core (blocking coalitions are allowed to harm outsiders, so absence of Pareto improvements does not rule out core blocking). The claim may be true or false; we need a rigorous proof or a counterexample. Until this is settled, the O(n^2) algorithm that reduces TREE-REACHABLE-PE to reachability of TTC is not validated.

- On TTC as a sufficient certificate: Correct. TTC is globally PO and unique in the core. If TTC is reachable (reachability to a fixed target on a tree is poly-time), then we have a valid YES-witness. This gives a one-sided polynomial-time test.

- On NP membership (Provers 2, 4): Correct. A certificate is a candidate matching µ*. Verification is polynomial: (i) check reachability µ0 → µ* on the tree (O(n^2) via standard “good edge” scheduling), (ii) check that µ* is globally PO by the cycle test (O(n^2)). This should be added to proofs.md.

- On FPT by treewidth (Prover 2): Plausible. A standard DP over a nice tree decomposition storing partial injections (agent→object identities) yields n^{O(w)} states; at the root, filter candidates by reachability and global PO. While not optimized, the approach is credible as an existence DP and provides concrete parameterized progress.

- On stars and paths special handling (Provers 3, 4): Claims about stars require care. Computing a unique “sink” under swap dynamics is standard for stars, but “sink” need not be globally PO; thus the proposed star procedure must include the global PO test after computing the sink (as Prover 4 suggests). These are tangential to the main tree question but consistent.

Blocking issues

1) The equivalence or non-equivalence of IR+global PO with the TTC outcome is unresolved in the drafts. Prover 1 relies critically on this; Provers 2/4 dispute it. We need either a self-contained proof (inductive TTC-style argument) or a concrete counterexample (small n) where an IR+global PO allocation differs from TTC.

2) If uniqueness fails, the complete polynomial-time algorithm claimed by Prover 1 collapses to a one-sided test (TTC reachability). We would then fall back to NP-membership, FPT in treewidth, and sufficient-condition algorithms only, leaving the general polynomial-time decidability on trees open.

Actionable next steps

- Prover 1: Provide a rigorous, complete proof that in Shapley–Scarf with strict preferences, the set of allocations that are both IR (w.r.t. initial endowments) and globally PO is a singleton equal to TTC. Preferably an inductive TTC-based proof that any IR+PO allocation must assign the first-round TTC cycle agents their top objects, recurse, etc. If this fails, produce a minimal counterexample (n ≤ 6) via exhaustive search.

- Prover 2: Flesh out the treewidth-FPT DP: define bag states (partial injection, used objects, and boundary consistency), transitions (introduce/forget/join), and time bound. Also implement the improvement-digraph PO check and target reachability check as root filters. Try to generate small instances where TTC is unreachable yet some other globally PO allocation is reachable—this would falsify Prover 1’s reduction.

- Prover 3/4: For stars, formalize the unique-sink result and verify that the sink, when it exists, can be globally dominated; include the global PO cycle test post hoc. For paths, keep TTC-as-certificate and provide explicit counterexamples where no swap applies yet initial allocation is not globally PO.

Given the above, we cannot yet promote an O(n^2) solution. We can safely add to proofs.md: (i) reachable ⇒ IR lemma; (ii) NP membership with formal verification procedures; (iii) TTC-as-certificate (sufficient) and tree-target reachability on trees; (iv) the improvement-digraph PO characterization.
