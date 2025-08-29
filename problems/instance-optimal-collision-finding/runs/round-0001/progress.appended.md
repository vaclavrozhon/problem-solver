## Round 0001 — 2025-08-27T15:22:11.034843Z

Ideas

- We isolate a precise, forward-only “false merges” lemma that bounds the expected number of times a forward edge lands on a vertex previously sampled only as a start. The bound is uniform over adaptive algorithms and fixed f, with randomness only from the uniform new-start oracle and the algorithm’s coins.
- We then state a clean coupling lemma for functions (forward-only) that is a faithful, simplified analogue of Claim 6.11 in the paper, replacing merging-hardness by conditioning on no false merges. This gives the scale-by-scale amortization without backward queries.
- Finally we assemble the epoch argument in the low-complexity regime q ≤ √(n)/log^α n, showing that A_all needs O(q log n) queries in expectation.

Definitions

- We consider an arbitrary (adaptive) algorithm interacting with a fixed function f:[n]→[n] (no loops). There are two operations: Start (uniform unseen vertex) and Step (query f(u) for a previously encountered u). Let S be the total number of Start operations and F the total number of Step operations in a given time window. Let X be the number of false merges in that window, i.e., the number of rounds t in which the operation is Step on u and the revealed f(u) equals a vertex v that had been obtained earlier by a Start (and v has not been reached by any Step before that time). Note that counting all hits to previously started vertices overcounts false merges, hence yields an upper bound.

Lemma A (Uniform-subset view of starts; expectation bound for false merges)

- Statement.
For any fixed function f and any adaptive algorithm, condition on a time window in which the algorithm performs exactly S starts and F forward steps. Let I be the set of images revealed by the F Step operations in the window. Then, for the randomness of the Start oracle and the internal randomness of the algorithm, the expected number of hits of Step targets into the set of started vertices is bounded by
  E[X] ≤ F·S / (n − F).
In particular E[X] ≤ F·S / n.
- Why useful here.
Setting S,F ≤ 2q in an epoch of length 2q total queries, we obtain E[X] ≤ 4 q^2/(n−2q) = O(q^2/n), hence Pr[X≥1] = O(q^2/n) by Markov. This gives “no false merges” with high probability when q ≪ √n.
- Proof sketch (fully rigorous with the permutation coupling).
Expose in advance a uniformly random permutation π of [n]. Implement each Start as returning the unseen vertex with the smallest π-rank among currently unseen vertices; this exactly realizes the uniform new-start oracle and yields exchangeability. Let I_{t} be the set of images revealed by Step operations before time t, and let s_{t} be the number of Starts before t. Then, conditional on I_{t}, the set of started vertices S_{t} is the set of the s_{t} smallest-π elements of W_{t}:=[n]\I_{t}; in particular S_{t} is uniform among all s_{t}-subsets of W_{t}. For a Step at time t with target y=f(u), if y ∈ I_{t} then no false merge occurs; otherwise
  Pr[y ∈ S_{t} | history up to t] = s_{t} / |W_{t}| ≤ s_{t}/(n−F).
Summing over all F steps yields E[X] ≤ Σ_t s_{t}/(n−F) ≤ F·S/(n−F). This bound does not assume independence between steps and starts beyond the uniformity of each Start.

Corollary A.1 (Low-complexity regime, no-false-merge w.h.p.).
Let q ≥ 1, and let the algorithm perform at most 2q queries within an epoch, of which at most 2q are Step and at most 2q are Start. Then E[X] ≤ 4q^2/(n−2q). If q ≤ √n/ log^α n and n is large enough, then E[X] ≤ 5/log^{2α}n, hence Pr[X≥1] ≤ 5/log^{2α}n.

Comment on “no-skip”. In our forward-only model, a “skip” (the j-th new start in the random order having already been seen before it is started) is exactly a false merge. Thus, a separate “no-skip” event is unnecessary once we control X.

Coupling to a single scale in the forward-only model

- Setup.
Fix any algorithm A that, given the unlabeled certificate, finds a collision in expected q queries. As in the paper, fix in advance the random permutation r listing new-start vertices, and condition on the event that A finishes within 2q queries. Additionally, condition on X=0 (no false merges) in these 2q queries. We also adopt the standard “older-first tie-break” w.l.o.g.: whenever two active walks have isomorphic revealed shapes, advance the older one. The usual symmetry/exchangeability argument under the random-start permutation permits this tie-break without harming success probability or increasing expected query complexity (we only use it for analysis).

- Single-scale amortization (functions version of Claim 6.11).
Let i be such that A’s first collision arises from a walk W_j whose distance (number of forward steps from its start v_j to the colliding image) lies in [2^i, 2^{i+1}). Under X=0 and older-first tie-break, at that time all older starts j′<j that have not terminated earlier have been advanced to at least 2^i steps, and all others have been advanced up to their own termination threshold (cycle or collision). Therefore, the single-scale process A_i that repeatedly:
  - starts at fresh random vertices and advances each active walk forward up to 2^i steps (stopping earlier upon cycle/termination/collision),
will deterministically find a collision after at most a factor-4 overhead in forward steps relative to A’s 2q steps up to the first collision. The factor 4 arises from at most doubling the budget per older active start and at most doubling for incomplete walks; as in the paper’s amortization, this constant is independent of f and i.

Assembling the bound

- Epoch definition.
Run A_all for T=8q rounds; each round performs O(log n) queries, one interleaved step for each scale i. We declare success if any scale detects a collision.
- Success probability per epoch.
By Markov, A succeeds within 2q queries with probability ≥ 1/2. By Corollary A.1 with S,F ≤ 2q, the event X=0 holds with probability ≥ 1 − O(q^2/n). Under these two events, the single-scale coupling implies that some scale i in A_all finds a collision within 8q rounds (constant-factor overhead), so the epoch succeeds. Therefore a single epoch succeeds with probability at least 1/2 − O(q^2/n). In the target regime q ≤ √n/log^α n, this is ≥ 1/3 for α large enough (e.g., any α > 1/2 suffices; choosing α as in the theorem statement gives a clean bound).
- Expected query complexity.
Each epoch costs O(q log n) queries. A geometric bound with constant success probability per epoch implies
  E[Queries_{A_all}(f)] = O(q log n) = O(log n)·RAC(collision,f),
proving Theorem (forward-only, low complexity) with appropriate absolute constants.

Examples and sanity checks

- Worst-case f with many short cycles: our Lemma A is independent of f’s structure; it upper-bounds false merges in terms of S and F only, so short cycles do not hurt the argument.
- Algorithm that starts aggressively: X scales with S·F/n, so to increase false merges substantially one must also increase S, which costs queries; in the epoch we cap S,F by O(q), keeping X small.

Obstacles / gaps to be handled next

- Older-first tie-break justification: We used the standard symmetry argument (exchangeability of unseen starting vertices under the random permutation coupling) to assume older-first without loss. It would be good to add a crisp lemma: “Among algorithms that differ only by tie-breaking between isomorphic walks, older-first does not increase the hitting time to the first collision.” This follows from considering an automorphism that swaps the two walks and averaging.
- Concentration beyond Markov: For completeness, one can promote Corollary A.1 from Markov to Freedman/Bernstein for martingales. The increments of X_t are bounded by 1 and the predictable quadratic variation is ≤ E[X], yielding tail P[X ≥ (1+δ)E[X] + λ] with exp(−Ω(min{λ,λ^2/E[X]})) bounds. This is not needed for the theorem, but could tighten constants.
- Bookkeeping for A_all: We implicitly assumed collision checks across scales are free. In the query model, only oracle queries to f are counted; set/dictionary checks are paid in time but not in queries; hence the analysis is consistent.

Concrete claims to curate into output.md

- Lemma A (E[X] ≤ F·S/(n−F)) with its permutation-coupling proof.
- Corollary A.1 (Pr[X≥1] = O(q^2/n) for S,F ≤ 2q).
- Functions-analogue of Claim 6.11 (single-scale amortization under no false merges).
- Epoch assembly yielding E[Queries_{A_all}] = O(q log n) when RAC ≤ √n/log^α n.

No output.md was provided; hence no contradictions detected there yet. I recommend adding Lemma A and the functions coupling claim as the next curated steps.

