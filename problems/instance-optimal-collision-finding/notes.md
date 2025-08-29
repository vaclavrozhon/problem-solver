Setting and goals.
- We study forward-only oracle access to a fixed function f:[n]→[n] with no loops (f(v)≠v). The algorithm issues two kinds of queries: Start (returns a uniformly random unseen vertex) and Step (for a previously seen u, reveal f(u)). A collision is found when we have distinct u≠u′ with f(u)=f(u′).
- In the forward-only model, a Step may land on a vertex selected earlier by Start but not yet reached by any walk; this is a “false merge” (not a collision). Also, a Step may land on a vertex that would have been selected by a future Start; this is a “skip,” which disrupts coupling to a pre-sampled Start order.
- Target theorem (informal): If RAC(collision,f)≤√n / log^α n (low-complexity regime), then the interleaved all-scales algorithm A_all finds a collision in O(log n)·RAC expected queries. We need (i) robust bounds that false merges and skips are rare up to O(√n/polylog n) queries, and (ii) a functions-version of the scale-coupling lemma (analogue of Claim 6.11) plus an epoch assembly argument.

Key probabilistic tool: permutation coupling of starts.
- Fix an epoch (a time window) in which the algorithm performs S Start operations and F Step operations (S,F arbitrary, adaptive, but finite). Expose a uniform random permutation π of [n]. Implement the Start oracle by always returning the unseen vertex of smallest π-rank. This realizes the uniform new-start oracle and implies that, conditioning on the set I_t of images revealed by steps before time t, the set of started vertices S_t is uniform among all s_t-subsets of W_t:=[n]\I_t, where s_t is the number of starts before t.
- For a step at time t with target y:=f(u_t), the conditional probability that y is in the previously-started set is s_t/|W_t| if y∉I_t (and 0 if y∈I_t). Similarly, the conditional probability that y equals one of the vertices that would be selected by future Starts within the epoch is (S−s_t)/|W_t| if y∉I_t (and 0 otherwise). Since |W_t|≥n−F for all t, these yield simple, uniform bounds.

Consequences (rigorous; curated into output.md):
- Expected number of false merges in the epoch ≤ F·S/(n−F); hence Pr[at least one false merge] ≤ F·S/(n−F).
- Expected number of skip events in the epoch ≤ F·S/(n−F); hence Pr[SKIP] ≤ F·S/(n−F).
- In particular, for an epoch of ≤2q total queries, with S,F≤2q and q≤n/4, both probabilities are O(q^2/n). This is uniform over f and any adaptive strategy.

Caveats and corrections to prior reports.
- The union-bound attempt that upper-bounds Pr[v_j=f(u_t)] by 1/(n−j+1) is incorrect, because the unseen pool at the j-th start can be substantially smaller than n−j+1 after many steps, making the true probability larger. The permutation-coupling analysis above addresses this correctly.
- Skips are not the same as false merges. A skip occurs when a step lands on a vertex slated to be chosen by a future Start; false merges require landing on a previously started vertex that has not yet been reached by any walk. Both are rare, but they are distinct events and must be bounded separately (both bounds follow from the same coupling).
- “Cycle closure always gives an immediate collision” needs a qualification: stepping into the very first start vertex v_0 does not automatically produce two distinct known preimages of v_0. The analysis should not rely on this shortcut.

What remains to prove for the main theorem.
- Older-first tie-breaking w.l.o.g.: State and prove a lemma that among algorithms that differ only by how they choose between isomorphic active walks, choosing the oldest cannot increase the number of queries to the first collision. Use the permutation-coupling to justify exchangeability of unseen start vertices.
- Functions-version of the single-scale coupling (analogue of Claim 6.11): Under the joint event {no false merges}∧{no skips}, and conditioning on the first collision occurring along W_j at distance L∈[2^i,2^{i+1}), show that the single-scale process at scale i finds the same collision within a constant-factor (e.g., ≤4×) number of forward steps relative to A’s cost up to the collision. Provide a precise amortization argument that charges A_i’s work to A’s work, carefully accounting for walks that terminate early (due to merging into already-reached vertices or cycle closure).
- Epoch assembly: With Markov (Pr[T_A*≤2q*]≥1/2) and the O(q^2/n) bounds above, a single 8q*-round epoch of A_all succeeds with probability ≥1/2−O(q*^2/n); in the regime q*≤√n/log^α n, this is a positive constant. Then a geometric bound yields E[Queries_A_all]=O(q* log n).

Pointers for future rounds.
- Write the older-first lemma and the single-scale coupling with full filtrations and stopping times. Consider a potential equal to the total “budgeted” remaining steps at scale i, and show it decreases at each step of A while A_i lags by at most a constant factor.
- If tighter constants are desired, upgrade the Markov control of the no-false-merge/no-skip counts to a Freedman/Bernstein tail bound (increments ≤1, predictable quadratic variation ≈ E[count]).
New structural invariants and the single-scale comparison (functions, forward-only)

Definitions and events.
- For a run, let I_t be the set of images revealed by Steps strictly before the t-th Step; let S_t be the set of vertices returned by Starts strictly before the t-th Step; and let W_t := [n] \ I_t.
- A false merge at Step t means y_t := f(u_t) ∈ S_t \ I_t. A skip at t means y_t ∈ W_t lies among vertices that would be chosen by future Starts within the epoch (relative to the pre-sampled start order).
- Older-first tie-break: whenever the algorithm chooses to extend a walk and there are at least two eligible walks of the same current length, it extends the one with smallest start index (the “oldest”).

Basic structural lemma (proved and curated as Lemma 4 in output.md).
- Under the event “no false merges up to T Steps”, before the first collision, any Step landing on a previously seen vertex would necessarily be a false merge, hence cannot occur; therefore the active walks are disjoint simple forward paths. Conversely, when a Step does land in the previously Step-seen set I_t, this is a true collision witness.

Age-monotone invariant under older-first (proved and curated as Lemma 5).
- If ties are resolved older-first, then at every time before the first collision, the vector of lengths (by start index) is nonincreasing. In particular, when the j-th walk reaches length L, every earlier walk has length at least L.

Single-scale process and domination (proved and curated as Lemma 6; step-count form).
- Define the single-scale process A_i: it uses the (pre-sampled) start order r, processes starts in increasing index, and for each started walk advances it forward up to 2^i steps (or stops earlier if a collision is detected), then proceeds to the next start.
- Conditioning on (i) no false merges and no skips for both the competitor A and A_i up to the relevant horizon, and (ii) the first collision of A occurring on W_j at length L ∈ [2^i, 2^{i+1}), the process A_i (with the same start order) finds a collision within at most 2·(#Steps used by A up to its first collision) steps. The proof is a direct charge: by age-monotonicity, A already invested ≥ 2^i steps into each older walk (j′ < j), and invested L steps into W_j; so (j−1)·2^i + L ≤ (#Steps of A). Since A_i spends at most (j−1)·2^i on older walks and at most 2^{i+1}−1 ≤ 2L on W_j, it succeeds within ≤ 2·(#Steps of A).

On symmetrization.
- Correct form: for any algorithm A, let A_sym be the algorithm that samples a uniform permutation σ and simulates A on the relabeled instance, undoing σ in queries/answers. Then for any f and horizon T,
  E[T_hit∧T(A_sym on f)] = E_σ[E[T_hit∧T(A on σ∘f∘σ^{−1})]].
  In particular, since RAC(collision, σ∘f∘σ^{−1}) = RAC(collision, f) for all σ, the infimum over all algorithms equals the infimum over label-invariant algorithms. The stronger claim “E[T(A_sym on f)] = E[T(A on f)]” need not hold and should not be used.

Caveat on wrappers.
- A proposed “pacing wrapper” that inserts extra steps to enforce older-first is not implementable without changing A’s subsequent choices (the transcript changes). We treat older-first either as an a priori restriction (justified w.l.o.g. after a correct Lemma D) or we do pathwise accounting without wrappers.

What remains.
- Formalize the older-first w.l.o.g. lemma (ties are exchangeable under label-invariance; older-first does not increase expected time to first collision). Provide a filtration-based proof.
- Integrate Lemma 6 into the epoch assembly, tracking starts as well as steps, and make the per-epoch constant probability explicit (α ≥ 1 suffices with a simple union bound; tighter martingale tails can reduce α).
Updates and corrections (critical).
- Symmetrization. The correct, averaged symmetrization lemma is sound and should be used to restrict attention to label-invariant competitors in the unlabeled-certificate benchmark. We curate it below into output.md.
- Older-first w.l.o.g. remains unproven. Two routes:
  1) Exchangeability/invariance (Prover 02’s route): average over conjugacy and construct measure-preserving bijections on σ at tie times to show that tie-breaking does not change the (conjugacy-averaged) law of the hitting time. This requires a fully formal inductive construction over the stopping times of ties and careful conditioning on the unlabeled filtration. At present, the proof is incomplete and should not be curated.
  2) Potential/majorization (Prover 01’s route): prove Sub-lemma S, showing that for each scale i the capped potential Φ_i(t):=∑_j min{ℓ_j(t),2^i} is maximized by older-first at all times prior to the first collision. Combine this with a corrected single-scale comparator lemma to obtain a constant-factor reduction from an arbitrary label-invariant tie-breaker to older-first. This appears tractable and is my recommended path.

- Single-scale comparator (Lemma 6) inconsistency. As previously curated, A_i caps walks at 2^i steps but the proof allocates up to 2^{i+1}−1 steps on W_j, exceeding the cap. This is a genuine error. We remove Lemma 6 from output.md for now. A corrected version should: (i) define in advance a label-invariant schedule that (a) invests at most 2^i steps on each older walk, and (b) allows up to an additional 2^i steps on one designated walk without re-advancing older ones; and (ii) prove that, under older-first and no-skip/no-false-merge for both processes, this schedule detects a collision within ≤ C·t steps, where t is A’s Steps to its first collision and C is an absolute constant (ideally C=2). One concrete option: a two-phase schedule that in the second phase continues only the earliest index whose length reached 2^i in phase one; this avoids re-expanding older walks.

- Tails and parameter regime. Using the per-scale bounds and a union bound over O(log n) scales, the per-epoch failure probability is O((q^2 log n)/n). Hence a constant success probability per epoch holds already for α>1/2 in q≤√n/log^α n. Freedman/Bernstein tails are available (curated below) and sharpen constants but do not change the α-threshold qualitatively in this regime.

Technical to-do list (next steps).
1) Prove Sub-lemma S rigorously via an adjacent-transposition exchange or majorization: at any tie with equal lengths below 2^i, replacing a younger-choice step by an older-choice step does not decrease Φ_i, and iterating yields Φ_i^{old}(t) ≥ Φ_i^A(t) for all t.
2) Specify and prove a corrected single-scale comparator lemma with a coherent schedule (as above), ensuring no hidden re-advancement of older walks.
3) Choose and formalize one older-first reduction route (exchangeability equality or constant-factor domination). If pursuing exchangeability, define the filtration, tie stopping times, and measure-preserving maps on conjugacies explicitly, with a proof that the average hitting-time distribution is invariant under tie-breakers. If pursuing domination, quantify the constant factor.
4) Once 1–3 are in place, finalize the epoch assembly with explicit constants and α>1/2.

Sanity checks and examples.
- Counter-check against tie-breaking invariance: construct small instances (n≈10–20) with two or three concurrent walks where the future hazard materially depends on which tied endpoint is extended (after averaging over conjugacy this should vanish if Lemma D were true). If a counterexample persists under averaging, Lemma D must be weakened to a constant-factor claim.
- Necessity of older-first for the 2× single-scale bound: the toy example where a policy always advances the youngest shows that (j−1)·2^i≈t can fail badly without older-first. This motivates Sub-lemma S and an explicit older-first reduction.
