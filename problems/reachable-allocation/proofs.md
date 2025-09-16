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


Lemma (Reachable ⇒ IR). From the initial endowment µ0, any allocation µ obtained via a finite sequence of allowed edge-swaps is individually rational: for every agent v, µ(v) ≽_v µ0(v).
Proof. Each swap strictly improves its two participants and leaves others unchanged, so each agent’s assignment is monotonically nondecreasing w.r.t. their preference along the sequence.

Proposition (Global PO test). For a given allocation µ, build a directed graph D on agents∪objects with arcs a→b for each object b with b ≻_a µ(a), and arcs b→owner_µ(b). Then µ is globally Pareto-efficient iff D has no directed cycle.
Proof sketch. A directed cycle alternates agents/objects and yields a cycle of strictly improving trades, giving a global Pareto improvement. Conversely, any global Pareto improvement induces such a cycle in D.

Proposition (Tree reachability to a fixed target). Given a tree T, initial allocation µ0, and a target allocation µ*, we can decide in O(n^2) whether µ* is reachable by allowed swaps, and produce a swap sequence when it is. 
Sketch. Let each agent move along the unique dipath from its current object to its target in µ*. An edge is good if both incident agents need to cross it next. If the target is reachable and not yet achieved, a good edge exists. Swapping across any good edge advances both agents; maintaining the set of good edges yields an O(n^2) algorithm.

Theorem (TREE-REACHABLE-PE ∈ NP). A certificate is a target allocation µ*. Verification is polynomial: (i) decide µ0→µ* reachability on the tree in O(n^2) (previous proposition); (ii) test global PO of µ* via the acyclicity criterion in O(n^2).

Corollary (Sink special case). If the initial allocation µ0 admits no allowed swap, then reach(µ0)={µ0}. Hence the instance is YES iff µ0 is globally PO (decidable in O(n^2)).

Lemma 1 (Reachable ⇒ IR). From the initial endowment µ0, any allocation µ obtained via a finite sequence of allowed edge-swaps is individually rational: for every agent v, µ(v) ≽_v µ0(v).
Proof. Each swap strictly improves its two participants and leaves others unchanged. Hence each agent’s assignment is monotonically nondecreasing in her preference relative to µ0.

Lemma 2 (PO implies no allowed swap). If a matching µ admits an allowed swap on some edge {u,w}, then the post-swap matching strictly improves u and w and leaves others unchanged, contradicting global PO. Thus any globally PO matching is a sink (no allowed swap).

Proposition 3 (Global PO test). For a given allocation µ, build a directed graph D on agents∪objects with arcs a→b for each object b such that b ≻_a µ(a), and arcs b→owner_µ(b). Then µ is globally Pareto-efficient iff D has no directed cycle.
Proof sketch. A directed cycle yields a cyclic reallocation strictly improving all involved agents. Conversely, any strict Pareto improvement induces such a cycle in D. (Standard Shapley–Scarf characterization.)

Proposition 4 (Tree reachability to a fixed target). Given a tree T, initial allocation µ0, and a target allocation µ*, we can decide in O(n^2) whether µ* is reachable by allowed swaps and produce a witness sequence if so.
Sketch. Let each agent follow the unique dipath from its current object to its target. An edge is good if both incident agents need to cross it next. If the target is reachable and not yet attained, some good edge exists. Swapping on any good edge advances both agents; maintaining the set of good edges yields an O(n^2) decision and sequence.

Theorem 5 (TREE-REACHABLE-PE ∈ NP). A certificate is a target allocation µ*. Verification is polynomial: (i) check reachability µ0→µ* via Proposition 4 (O(n^2)); (ii) check global PO via Proposition 3 (O(n^2)).

Corollary 6 (Sink special case). If the initial allocation µ0 admits no allowed swap, then reach(µ0)={µ0}. Hence the instance is YES iff µ0 is globally PO (decidable in O(n^2)).

Theorem (XP algorithm parameterized by the number of movers k). Fix a tree T, initial allocation µ0, and strict preferences. Let k be an upper bound on the number of movers (agents a with µ(a) ≠ µ0(a)). There is an algorithm that decides TREE-REACHABLE-PE and outputs a witness when one exists with ≤k movers, running in time n^{O(k)}·poly(n).

Proof. For each s=0,…,k, enumerate all subsets S⊆A with |S|=s. For each S, enumerate all injective maps φ: S → B\{µ0(a): a∈A\S}. Define a candidate matching µ by µ(a)=φ(a) for a∈S and µ(a)=µ0(a) for a∉S. For each connected component C of the induced forest T[S], check reachability of µ|_C from µ0|_C on the subtree induced by C (apply the O(n^2) tree target-reachability routine). If any component fails, discard µ. Otherwise, form the full matching µ and test global PO in O(n^2) via acyclicity of the improvement digraph. If both checks pass, output µ along with the concatenated per-component swap sequences (interleaved arbitrarily, as components are edge-disjoint), which realizes µ from µ0 on T. If no candidate passes, answer NO.

Correctness. Any solution with ≤k movers has some S and φ as above; outsiders remain fixed, so reachability reduces to independent checks on components of T[S]. Conversely, the procedure outputs only matchings that are both reachable (componentwise realizable) and globally PO (acyclic improvement digraph). The interleaving of componentwise swap sequences is valid since components are edge-disjoint.

Running time. The number of candidates is ∑_{s=0}^k C(n,s)·P(n,s) = n^{O(k)}. Each candidate verification (reachability and PO) is polynomial, yielding total time n^{O(k)}·poly(n). ∎