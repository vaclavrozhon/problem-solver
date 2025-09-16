Key audits and corrections

- Prover 1: Your star analysis conflates the agent-moving and object-moving models. In our setting, agents are fixed on vertices; objects move. Phrases like “center becomes A” and the arc condition u→v defined via u’s preferences are agent-moving semantics and lead to invalid sequences (e.g., a purported leaf–leaf swap). The non-uniqueness counterexample as stated is therefore incorrect for our model. Do not use an agent-transition digraph on stars. A correct object-moving account is given by Prover 3 via an object-acceptance digraph and center-object monotonicity. Please rework your star analysis accordingly and drop the agent-moving terminology.

- Prover 2: Good corrections: the “k movers” procedure is XP (n^{O(k)}), not FPT. The proposed FPT by number of leaves L is plausible as a decomposition at an articulation vertex with branch path subroutines and boundary summaries, but the cycle-composition lemma (your Lemma G) needs a precise and verifiable boundary state. At present it is a promising outline, not a proof. Provide a formal specification of boundary tokens, the exact partial orders kept, and a correctness proof for global acyclicity from local summaries.

- Prover 3: Your star lemmas (center-object monotonicity, each leaf swaps at most once) are sound for object-moving and the star counterexample demonstrates that terminal allocations (sinks) are not unique, though the final center object is unique. Keep this line; develop a DP on the acceptance DAG to decide existence of a PO sink without path enumeration.

- Prover 4: The XP(k) algorithm is rigorous and immediately useful as a baseline exact solver for small k; we can add it to proofs.md. The double-star scheme has clear invariants (bridge swaps only across {u,v}, O(n) bound) but remains heuristic until confluence/order-independence issues on each side are settled; keep it in notes.

Safe building blocks (retain in proofs): reachable ⇒ IR; PO test via improvement-digraph acyclicity; fixed-target reachability on trees (good-edge scheduler); NP membership from these two tests. One-sided polytime certificates: TTC-reachable and sink-test (compute a sink then PO-test) remain valid but incomplete.

Next steps

- Prover 1: Rewrite the star analysis in object-moving terms (object-acceptance DAG over objects; center vertex agent’s order controls monotone progress). Drop agent-transition digraph H.
- Prover 2: Formalize the L-leaves algorithm: exact boundary state definition, per-branch path solver with prescribed in/out flows, and a proof that the union of boundary partial orders characterizes global acyclicity.
- Prover 3: Provide a formal proof that leaf swaps at most once and uniqueness of the final center object; then attempt a DP over the acceptance DAG to decide PO-sink existence.
- Prover 4: Keep XP(k) and add correctness details; for double-stars, either prove local confluence or define a bounded branching that yields completeness with a complexity bound.
