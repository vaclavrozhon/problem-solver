Audit

- Core vs global PO: Prover 2’s “PO ⇔ core” is false. A 3-agent counterexample shows a globally PO allocation that is blocked by a coalition using initial endowments. Hence TTC is not the unique globally PO outcome and TREE-REACHABLE-PE does not reduce to TTC reachability. Any algorithm built on this equivalence is invalid.

- Safe primitives: All provers largely agree on solid components that belong in proofs: (i) reachable ⇒ individually rational (IR); (ii) a polynomial global PO test via the improvement digraph (acyclicity); (iii) a polynomial tree reachability test for a fixed target matching using the “good edge” scheduler; (iv) NP membership via these two checks. These are correct.

- Stars: Prover 3 proposes a unique terminal state via an acceptance digraph and a center-monotonicity argument. The center-object monotonicity is sound, but the claim that the terminal allocation is unique (not only the center’s final object) needs a fully rigorous proof of order-independence for all leaves; keep this in notes until completed. Prover 4 is appropriately cautious here.

- Parameterized result: Prover 2’s “FPT in number of movers k” enumerates subsets of size ≤k (O(n^k)) and permutations (k!), yielding time O(n^k·k!·poly(n)). This is XP, not FPT. Please correct the classification or provide a true f(k)·poly(n)-time approach.

- One-sided certificates: TTC-as-certificate and sink-tests are valid sufficient procedures; neither is complete on trees. Keep them as practical poly-time checks that produce constructive witnesses when they succeed.

Next steps

1) Formalize the stars result: either prove uniqueness of the terminal allocation with full order-independence or produce a counterexample. 2) Correct the movers-parameter claim to XP; investigate whether additional structure (e.g., bounded branch vertices + small k) yields FPT. 3) Develop a precise DP interface (boundary summaries) for a true decomposition-based algorithm on trees or craft a hardness reduction from Reachable Object on trees with a tree-preserving gadget. 4) Expand the catalog of small instances where TTC is unreachable but another reachable globally PO allocation exists; use them to validate or refute candidate structural lemmas.
