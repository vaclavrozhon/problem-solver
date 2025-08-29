## Round 0005 — 2025-08-27T16:05:16.178705Z

Headlines for this round
- We pivot from the trivialized segment LP (Definition 6) to independence-augmented formulations in the product-state regime, and to ring-level (experiment/φ-LOCAL) arguments in the entanglement-allowed regime.
- We isolate a simple, checkable linear constraint that excludes the Markov-chain witness once product-state independence is enforced: at any gap δ ≥ 2r+1, color-equality at the two sites must be 1/3 (under color symmetry), which contradicts the strictly stationary order-1 proper Markov chain’s correlation 1/3 + (2/9)(−1/2)^δ.
- We propose a concrete feasibility test (linear, color-symmetric, pair-independence relaxation) for r = 2 and moderate k that should already force objective < 1, yielding a rigorous certificate in the no-entanglement regime.
- For the entanglement-allowed regime, we outline a two-way, r = 2 adaptation of the LGR “experiments” method: construct weighted mixtures of match-at-distance indicators whose expectations must be equal under r-non-signaling locality but separate under properness, certifying constant error. We propose an auditable search plan.

Gaps and clarifications in output.md (minor)
- Theorem 2 (Independence beyond 2r): the current statement and proof are fine; if we later rely on higher-arity independence (for m ≥ 3 windows), note explicitly that the product initial state implies factorization over any collection of disjoint r-buffers by the same argument (pairwise disjoint supports ⇒ global factorization). Not essential but worth noting for later factorization constraints.
- Corollary 10 and Proposition 11: now consistent; Proposition 11 makes Corollary 10 vacuous with the current LP. We will add independence-augmented constraints (Track A) to resurrect nontrivial bounds in the product-state setting.

Track A (product-state, no entanglement): independence-augmented constraints
Idea A1 (minimal linear independence constraint under color symmetry)
- Independence premise: For any two cores A, B whose r-neighborhoods are disjoint in the segment (equivalently, inter-core gap δ ≥ 2r+1), the joint law on the cores must factorize. Under color symmetry (see below), this yields a linear identity for single-site cores:
  I1(δ): P[X_i = X_{i+δ}] = 1/3, for every interior pair (i, i+δ) with δ ≥ 2r+1.
- Why linear: By color symmetry (permutation of {1,2,3}), single-site marginals must be uniform, P[X_t = a] = 1/3 for all a. Factorization then implies P[X_i = X_{i+δ}] = ∑_a P[X_i=a]P[X_{i+δ}=a] = 3·(1/3·1/3) = 1/3.
- Justification for enforcing color symmetry as constraints: The objective (maximizing probability of properness) and all existing placement-equality constraints are invariant under the global action of S3 on colors; hence averaging any feasible solution over S3 yields a color-symmetric feasible solution with the same objective value. It is therefore valid (and can only strengthen the relaxation) to add linear constraints enforcing equal color marginals at all interior positions.

Lemma A (Order-1 proper chain violates I1 at any finite separation)
- Consider the stationary 3-state nearest-neighbor chain with no self-loops (P(i→i) = 0, P(i→j) = 1/2 for j ≠ i). Then for d ≥ 1:
  P[X_t = X_{t+d}] = 1/3 + (2/9)(−1/2)^d.
  Proof sketch: The transition matrix has eigenvalues 1 and (−1/2) (multiplicity 2). One obtains P^d(i→i) = 1/3 + (2/3)(−1/2)^d and P^d(i→j) = 1/3 − (1/3)(−1/2)^d for i ≠ j. Average over the stationary law to get the stated equality probability. For every finite d, this differs from 1/3, so the chain is not independent at separation d.
- Consequence: any feasible family supported on fully proper strings and strictly stationary with nontrivial finite-range correlations fails I1 at some δ; imposing I1 (for δ ≥ 2r+1) cuts off the Markov-chain witness.

Formulation A2 (linear, color-symmetric, pair-independence relaxation)
- Variables: p_ψ for ψ ∈ Σ^k as in Definition 6.
- Enforce:
  • Color symmetry: For every interior position u, P[X_u = 1] = P[X_u = 2] = P[X_u = 3] = 1/3 (linear constraints in p_ψ).
  • Placement invariance within fixed geometries (Definition 6, restricted to t = 1 and t = 2 core families): single-core (s = 1), and two-core (s = (1,1)) at gaps δ ∈ {2r+1, 2r+2, …}, across all interior translations.
  • Independence at large gaps (pair level): For each such δ, impose I1(δ): P[X_i = X_{i+δ}] = 1/3 (as a single linear equality for each δ, using color symmetry).
  • Optionally, refine to block-level: For s = 2 cores (length-2 blocks) with gap δ ≥ 2r+1, enforce P[(block1) = (block2)] = ∑_{ξ ∈ Σ^2} P[block1 = ξ] P[block2 = ξ]; under color symmetry and single-core uniformity this yields a finite set of linear identities involving diagonal sums of pair-block marginals. (We will start with single-site cores for robustness.)
- Objective: as before, maximize the probability of internal properness.
- Claim (target to check computationally): For r = 2 and some moderate k (e.g., 11 ≤ k ≤ 15), the above linear system has optimum strictly less than 1. Intuition: Full support on proper strings combined with translation invariance of pair laws at large gaps forces equality-probability 1/3 for those pairs, which is incompatible with any measure supported entirely on proper strings satisfying the interior invariances.

Auditable test plan A3 (r = 2, feasibility at objective 1)
- Fix r = 2. Consider k ∈ {11, 12, 13, 14, 15}.
- Build the linear system described in A2 with:
  • Single-core invariance (t = 1) and two-core invariance (t = 2) for gaps δ ∈ {5,6} (since 2r+1 = 5), across all interior placements.
  • Color symmetry constraints yielding uniform marginals.
  • Independence equalities I1(5) and optionally I1(6).
- Solve the LP feasibility with the additional equality “objective = 1” (i.e., demand probability 1 on proper strings) or, equivalently, check whether any p_ψ supported on proper strings satisfies the linear constraints. If infeasible, the conclusion is: in the product-state regime, objective 1 is impossible already under these (linear) constraints, hence the true optimum q_prod(r,k) < 1.
- Certificate: Invalidate objective = 1 with a dual ray (Farkas certificate), archiving the precise linear combination of constraints leading to a contradiction with 1{proper}.

Why a fully proper, translation-invariant measure cannot meet I1 (intuition)
- Any measure supported on proper strings induces for each finite gap δ a pair-law P(X_i, X_{i+δ}) which, under interior translation invariance (two-core constraints) and mild mixing, typically deviates from the product measure at δ finite. The order-1 chain demonstrates the unavoidable alternation: equality-prob oscillates around 1/3 with amplitude (2/9)(1/2)^δ. Imposing P_equal(δ)=1/3 at δ = 5,6 forces structure incompatible with “always proper” and two-core invariance. The LP feasibility test A3 makes this precise.

Extending A2 to stronger (still linear) independence surrogates
- Fréchet bounds sharpening: For each δ ≥ 2r+1 and color a, add bounds P[X_i = a, X_{i+δ} = a] ∈ [max(0, 2/3−1), min(1/3, 1/3)] = [0,1/3] with summed diagonal fixed to 1/3. These are necessary consequences of independence and color symmetry, and improve robustness.
- Multi-gap constraints: Impose I1(δ) for multiple δ in {5,6,7}. The stationary proper Markov chain fails all of them; a general proper distribution would struggle to satisfy them simultaneously.

Track B (entanglement allowed): r = 2 ring-level “experiments”
Idea B1 (two-way analogue of LGR’s distance-mix experiment)
- Objective: Construct two “experiments” (randomized procedures that pick a random node v and a random distance d ∈ D_1 or D_2 with specified weights, then ask whether colors at v and v+d match) whose expected outcomes must be equal under any r-round non-signaling strategy (by locality and rotation invariance), but differ on any proper 3-coloring of the cycle. Any strictly positive separation yields a constant-error lower bound.
- Why equality under r-non-signaling? In one-way, LGR exploited that pair distributions at non-adjacent nodes are independent of distance. In two-way, this fails. However, by designing D_1, D_2 and how we select the pair (v, v+d) so that both experiments induce the same law of the r-views seen by the two sites and their r-neighborhoods (including the gap size), the non-signaling principle (Heisenberg localization) enforces equality of the corresponding match probabilities.
- Candidate construction: r = 2. Choose D_1 and D_2 supported on distances ≥ 3 to avoid adjacency, with mixtures of distances of different parity to exploit alternating behavior of proper colorings (as in LGR’s pair-correlation alternation). Example sketch: Let D_1 put mass on {5,7,9} and D_2 on {6,8,10} with weights tuned so that the multiset of r-neighborhood isomorphism types (including the informed gap-length) seen by the pair in Experiment 1 equals that for Experiment 2. We will solve for weights by equating counts of r-view types.
- Proper-coloring separation: In any proper 3-coloring of the cycle, P[X_v = X_{v+d}] alternates with parity of d (1/3 ± c·(2)^{−d} in long cycles, or exactly computable on finite cycles). Thus an odd–even mixture typically yields a positive bias between the two experiments. If this bias can be bounded away from 0 uniformly in n for some (D_1,D_2), we obtain a constant error bound.

Auditable search plan B2
- Fix r = 2 and a cycle length n moderately large (e.g., n = 4m + O(1), m ≳ 50). Enumerate all r-view isomorphism types for unordered pairs (u,v) at distance d up to some cap, with the view capturing: local degrees (trivial for cycles), the labeled positions of u,v and their r-neighborhoods, and the explicit value d, all modulo rotation.
- Construct a linear system requiring that the multiset of view types sampled by Experiment 1 (weights w_1(d)) equals that of Experiment 2 (weights w_2(d)). Solve for nonnegative weights w_1, w_2 supported on a small distance set (e.g., up to 10 or 12). If a feasible pair exists, compute the induced gap between match probabilities on proper 3-colorings. If positive and uniform in n (beyond a threshold), this yields the constant-error bound.
- If no small-support solution exists, enlarge the distance set and repeat. We expect small supports to suffice, by analogy with LGR’s n = 11 construction.

Small calculations to support B1
- In any proper 3-coloring C_n, the probability (over uniform v) that X_v = X_{v+d} equals 1/3 + α(d,n), with α(d,n) alternating in parity and |α(d,n)| ≥ c·(2)^{−d} uniformly over n ≥ 2d + 1 (constant c > 0). This follows from the same eigen-analysis as Lemma A, adapted to cycles (edge effects vanish for d ≪ n). Thus mixtures of odd and even d’s yield a nonzero bias.

Obstacles and considerations
- Independence is nonlinear; our linear relaxation (I1) relies on enforcing color symmetry and uniform single marginals. While justified by symmetry of the objective/constraints, we will explicitly note in the solver and certificate that we are working under a color-symmetrized subspace; any bound < 1 then holds a fortiori.
- For Track B, the critical step is the view-equivalence argument: we must ensure the two experiments induce the same distribution over the r-views of the selected pair (including gap length). This is a finite combinatorial check for given (D_1,D_2) and r.

Concrete next steps (auditable)
1) Implement LP test A3 (r = 2):
   - Build constraints for k ∈ {11,12,13,14,15} with single-core and two-core placement invariance, color symmetry, and I1(5) (and optionally I1(6)).
   - Check feasibility with objective = 1 (support on proper strings). If infeasible for some k, archive the dual Farkas certificate (linear combination of constraints ⇒ contradiction).
   - If feasible persists, augment with I1(6) and/or block-level linear constraints as described.
2) Document Lemma A (pair-equality formula) and add to notes as a reusable analytic tool for excluding Markov-type correlated constructions when independence constraints are present.
3) Start the B2 search: generate r = 2 pair-view types on cycles and solve for two mixtures (D_1,D_2) with equal view-type distributions. Begin with distances up to 10. If a feasible pair exists, compute separation on proper colorings and quantify an n-independent ε > 0.
4) Optional: formulate a small nonlinear feasibility problem enforcing exact factorization for δ ∈ {5,6} (P(A ∩ B) = P(A)P(B) for all singleton-color events A,B), and solve with MIP for k ≤ 12 to cross-check LP conclusions.

Why this is promising
- The linear independence surrogate I1 is extremely low-cost and already incompatible with any fully proper, strictly stationary nearest-neighbor model; combining I1 with translation-invariance constraints should suffice to cut off objective 1. A dual infeasibility certificate would be a clean, auditable product.
- The r = 2 experiment approach stays squarely within non-signaling/φ-LOCAL reasoning and avoids segment trivialization; it mirrors LGR’s success at r = 1 while respecting that two-way views depend on distance.

Deliverables for the next round
- Report of LP feasibility tests (A3) including one explicit k with “objective=1 infeasible” and the dual ray.
- First candidate (D_1,D_2) for r = 2 with equal r-view distributions, plus the computed separation on proper colorings (or a report that no small-support pair was found and an updated plan).

