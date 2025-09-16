Main audit points

- Prover 2’s core⇔PO claim is false. In Shapley–Scarf housing markets, “core ⇒ PO” holds (a global Pareto improvement would be implemented by the grand coalition), but “PO ⇒ core” fails because a coalition can block µ using only its initial endowments even if there is no global Pareto improvement (outsiders may be worse). Concrete counterexample (3 agents, endowments 1:a,2:b,3:c). Preferences: 1: b ≻ c ≻ a; 2: a ≻ b ≻ c; 3: a ≻ b ≻ c. Allocation µ = (1→c, 2→b, 3→a) has no directed improvement cycle (hence globally PO), but coalition {1,2} can reassign their endowments {a,b} to (1→b,2→a), strictly improving both; thus µ is not in the core. Therefore, PO≠core and the “unique PO=TTC” conclusion is invalid. The O(n^2) algorithm reducing TREE-REACHABLE-PE to TTC reachability is incorrect.

- Prover 1: Solid corrections. NP membership is right; “reachable ⇒ IR” is correct; “globally PO ⇒ no allowed swap” is correct. TTC as a sufficient certificate (if reachable, return it) is valid. The sink special case is valid: if µ0 is a sink, reach(µ0)={µ0}; decide by a single PO test.

- Prover 3/4: Claims for stars are promising, but the unique-sink assertion needs a complete proof (order-independence). Until then, keep it in notes; do not move to proofs/output. The FPT-by-treewidth outline is reasonable (DP over nice decomposition; filter candidates by reachability and PO). Provide formal state definitions and transitions next.

- Verification subroutines: Global PO via the improvement digraph (acyclicity) and tree target-reachability via “good edges” are both standard and belong in proofs.md; use them as the NP verifier.

Next steps

1) Add the explicit PO≠core counterexample to notes; correct any text claiming PO⇔core. 2) Formalize the treewidth-FPT DP: bag states (partial injection; used objects), introduce/forget/join transitions, size bound n^{O(w)}, and root filters (reachability + PO). 3) For stars, deliver a rigorous unique-sink proof or provide a counterexample. 4) Maintain TTC-as-certificate as a one-sided polynomial-time test and the sink special case. 5) Explore small instances (n≤6) to catalog when TTC is unreachable but some reachable globally PO exists; this informs structure and potential hardness.
