# Rigorous Proofs



Basic lemmas and verification procedures

Lemma 1 (Reachable ⇒ IR). Let µ0 be the initial endowment and let µk be obtained from µ0 by a finite sequence of allowed swaps along edges of a tree (each swap strictly improves both participating agents and leaves others unchanged). Then for each agent v, µk(v) is weakly preferred to µ0(v). In particular, every reachable allocation is individually rational w.r.t. the initial endowment.
Proof. At each swap, only the two participants strictly improve; all others keep their object. Thus each agent’s object along the sequence is monotonically nondecreasing in their preference order. If they never swap, they keep their endowment; if they swap, they strictly improve at that step. Hence the final object is weakly preferred to the endowment.

Lemma 2 (Global PO via improvement digraph). Fix an allocation µ. Construct a directed graph Dµ on the set of agents and objects with arcs (a → b) for every agent a and object b such that b ≻_a µ(a), and arcs (b → owner_µ(b)) from each object to its owner under µ. Then µ is globally Pareto-efficient if and only if Dµ has no directed cycle.
Proof sketch. If Dµ contains a directed cycle, it alternates agents/objects; traversing the cycle gives each agent on the cycle an object they strictly prefer to µ, producing a Pareto improvement (others unchanged). Conversely, if µ is not PO, there exists an allocation ν that weakly improves all agents and strictly improves at least one. Tracing the predecessor–successor relation of object ownership from µ to ν yields a directed cycle in Dµ along which all agents strictly improve. (This is the standard “trading cycle” characterization; see, e.g., standard texts on house allocation with strict preferences.)

Theorem 3 (TREE-REACHABLE-PE is in NP). The decision version—given a tree T, initial allocation µ0, and strict preferences, decide whether there exists a reachable allocation that is globally Pareto-efficient—belongs to NP.
Proof. A certificate consists of a target allocation µ*. Verification is polynomial-time: (i) Decide reachability µ0 → µ* by allowed swaps on the tree using the “good-edge” scheduler (O(n^2)). (ii) Verify global PO of µ* using Lemma 2 in O(n^2) time by cycle detection. If both pass, accept; otherwise reject.

Proposition 4 (TTC as a sufficient certificate). Compute the TTC outcome µ_TTC of the housing market (agents with initial endowments µ0 and strict preferences). If µ_TTC is reachable from µ0 by allowed swaps on the given tree, then µ_TTC is a correct YES-witness: it is globally Pareto-efficient and reachable. If not reachable, this test is inconclusive.
Proof. TTC is globally PO in Shapley–Scarf markets with strict preferences. Reachability is decided as above; if reachable, return the witnessed swap sequence and µ_TTC.

Remark 5 (Reachability to a fixed target on trees). Given a tree T, an initial allocation µ, and a target allocation µ*, reachability by allowed swaps can be decided in O(n^2) time via the standard good-edge approach: maintain edges whose endpoints need to cross next along their unique dipaths toward µ*; a good edge always exists unless the current allocation equals µ*. Swapping on any good edge monotonically advances agents; maintaining the set of good edges yields the decision and a witness sequence when reachable. (Adapted from known results for the object-moving model.)
