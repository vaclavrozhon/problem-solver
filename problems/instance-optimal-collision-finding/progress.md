## Round 0001 — 2025-08-27T15:20:45.742509Z

Goal. Prove Theorem (forward-only, low complexity): for any f with no loops and RAC(collision,f) ≤ √n / log^α n, the interleaved all-scales algorithm A_all finds a collision in O(log n)·RAC expected queries. The main obstacle versus the graph case is handling “false merges” in the forward-only model (walking into a vertex that was previously chosen as a start, but not yet reached by any walk), which are not collisions.

Plan this round. Make rigorously checkable progress on the two technical pillars needed by the roadmap: (I) a robust bound on false merges (expectation and tail) up to q = O(√(n/ polylog n)) total forward steps; (II) a scale-by-scale coupling lemma specialized to forward-only function walks (replacement for the graph Claim 6.11). Then (III) assemble into an epoch argument. I also isolate a “no-skip” event and give a simple union-bound proof (no Freedman needed), and point out subtleties and where more care may be required.

Definitions and notation.
- Work with a fixed function f:[n]→[n] with f(v)≠v for all v. The algorithm’s two query types: Start draws a uniformly random unseen vertex; Step reveals f(u) for an already seen u (forward-only). A collision is exhibited when we discover u≠u′ with f(u)=f(u′).
- Let q be an integer budget for total queries; let q_step ≤ q be the number of Step queries (we will take q_step ≤ 2q in the epoch where we run A up to 2q queries), and s ≤ q the number of Start queries in that epoch.
- A “false merge” at a Step is the event that we reveal f(u)=v where v is a vertex that was previously selected via Start and has not yet been reached by any forward walk (so the edge reveals a merge, but not yet a collision). Denote by X the total number of false merges by the time we make at most q queries.
- A random start string r: a uniformly random permutation of [n] that predetermines which unseen vertex would be chosen upon each Start; we say the “no-skip” event holds if the j-th Start indeed takes r_j (equivalently: none of r_1,…,r_j was discovered by earlier Step queries before that Start). Skips can happen only if some Step hits a not-yet-Start vertex r_j.

Lemma 1 (Few false merges via a clean double-sum bound).
Statement. For any (adaptive) forward-only algorithm that makes at most q queries and q_step Step queries (q_step ≤ q), and for any fixed f with no loops,
- E[X] ≤ (q_step · s)/(n−q) ≤ 2 q^2/n for q ≤ n/2.
- In particular, Pr[X ≥ 1] ≤ E[X] ≤ 2 q^2/n.
Why useful. Gives the “no-false-merge” event with probability 1−O(q^2/n) uniformly over f and the algorithm, sufficient for q ≪ √n.
Proof sketch (checkable). Index Step times by t∈T (|T|=q_step), and Start times by j∈J (|J|=s). A false merge at Step t occurs if f(u_t) equals some previously started vertex v_j. For any fixed pair (t,j) with Start j preceding Step t, the probability that v_j equals f(u_t) is at most 1/(n−j+1): at the j-th Start, v_j is drawn uniformly from the then-unseen set (of size at least n−(j−1)), and this upper bounds the chance v_j picks that particular label w=f(u_t) (if w was seen earlier, this probability is 0 and the bound still holds). Thus by a union bound over pairs (t,j),
\[\Pr[\text{false merge at Step }t] \le \sum_{j< t}\frac{1}{n-j+1} \le \frac{s}{n-q+1}.\]
Summing over t ∈ T and using s ≤ q, q_step ≤ q gives E[X] ≤ q· s /(n−q) ≤ 2 q^2/n for q ≤ n/2. Markov gives the tail bound. Adaptivity does not invalidate the bound because we only used the (unconditional) uniformity of each Start and a union bound over disjoint Start indices.

Remark. This proof avoids Freedman/Azuma; it is robust to any adaptivity or function f. It is slightly looser (constant-factor) but sufficient in the q = O(√(n/ log n)) regime.

Lemma 2 (No-skip with high probability).
Statement. Fix an algorithm making at most q queries. Let SKIP be the event that for some Start index j, the vertex r_j (the j-th element of the global Start permutation) appears earlier as the image of a Step before the j-th Start occurs. Then Pr[SKIP] ≤ 2 q^2/n for q ≤ n/2.
Why useful. Allows coupling all algorithms to the same Start string r (as in Section 6.3 of the paper) with failure probability O(q^2/n).
Proof sketch. By union bound over Step times t and future Start indices j: for a fixed Step t and any future j, the probability that the Step’s image equals r_j is ≤ 1/(n−j+1) (same rationale as in Lemma 1). Summing j over at most q future Starts and t over q Steps gives ≤ q·q/(n−q) ≤ 2 q^2/n.

Discussion: relation between Lemmas 1 and 2. A “skip” is not the same as a false merge—skips occur when we Step into a vertex that hasn’t been declared as a Start yet (so it cannot be a false merge). The same counting method bounds both types of bad events by O(q^2/n).

Lemma 3 (Forward-only scale coupling; functions analogue of Claim 6.11).
Setup. Let A be any forward-only algorithm that (with access to the unlabeled certificate) finds a collision within q queries with decent probability. Let r be the Start string. Define E_no-merge to be the event “no false merges occur in the first 2q queries of A” and E_no-skip the event “no-skip for A with respect to r in its first 2q queries”. For 0 ≤ i < ⌊log_2 n⌋ define E_coll(i,A,2q) to be the event that A first finds a collision within 2q queries, and the collision point lies at distance in [2^i,2^{i+1}) along the forward walk W_j from its Start v_j.
Statement. Conditioned on E_no-merge ∧ E_no-skip and E_coll(i,A,2q), the single-scale process A_i (the i-th component inside A_all) will deterministically find the same collision within ≤ 4·(number of queries performed by A up to the collision) ≤ 4·2q forward steps.
Why useful. This is the scale-by-scale domination needed to transfer progress from a hypothetical competing algorithm A (with certificate) to A_all (without certificate), exactly as in §6.3 but simplified by forward-only walks.
Proof sketch. Couple A and A_i to share the same Start string r. Impose wlog an “older-first” rule on A: if two walks have identical shapes, extend the older one; this does not worsen A’s query complexity or success. Under E_no-merge, before the first collision all walks starting from distinct Starts remain disjoint; a collision occurs precisely when some walk steps into a vertex reached earlier by a different walk (closing a directed cycle also exhibits a collision and only helps). Under E_no-skip, the j-th Start in A is exactly v_j=r_j. If A’s first collision along W_j happens at distance L ∈ [2^i,2^{i+1}), then by older-first, every earlier Start v_{j′}, j′<j, has already advanced by at least 2^i steps unless its walk terminated earlier by closing a cycle (in which case A_i will also terminate that walk early and not waste more budget). The single-scale A_i extends each active walk up to 2^i steps (bidirectional walking is not needed in functions; forward-only suffices). Accounting shows A_i spends at most 2·2^i steps per good earlier Start and at most 2·(distance-to-cycle) on bad ones. Summing yields the bound of ≤ 4·(A’s work to reach L), implying A_i reaches the same collision in ≤ 4·2q steps.

Remark on cycle closure. In the function model, closing a directed cycle when stepping from u to a previously visited v supplies an immediate collision witness: f(u)=v and also f(pred(v))=v with pred(v) ≠ u (unless v was the very first vertex, which cannot happen since f has no loops). Thus early cycle closure helps, and the above amortization only becomes easier.

Proposition 4 (Epoch success probability and assembly of Theorem).
Let q⋆ = RAC(collision,f). Let A⋆ be an algorithm achieving expected q⋆ with certificate. By Markov, Pr[A⋆ finishes within 2q⋆ queries] ≥ 1/2. By Lemma 1 with q=2q⋆, Pr[E_no-merge] ≥ 1−O(q⋆^2/n). By Lemma 2, Pr[E_no-skip] ≥ 1−O(q⋆^2/n). Intersecting (and using a union bound) gives
\[\Pr[ E\_no\text{-}merge \wedge E\_no\text{-}skip \wedge (\text{A⋆ finishes within }2q\_⋆) ] \ge 1/2 - O(q\_⋆^2/n).\]
Under this event, Lemma 3 implies that in 8q⋆ rounds of A_all (each round costs O(log n) queries; 8 is a safe constant from doubling the 4 overhead), some scale A_i finds the same collision. If we assume the low-complexity regime q⋆ ≤ √n/ log^α n for α ≥ 2, then q⋆^2/n ≤ 1/ log^{2α} n is small; for large n, the success probability in one 8q⋆-round epoch is at least, say, 1/3. A geometric-series argument yields
\[ \mathbb{E}[\text{Queries}_{A\_{all}}(f)] = O(q\_⋆ \log n), \]
which is Theorem 1 with C an absolute constant and any fixed α ≥ 2 (α can be optimized; α>1 suffices with constants tracked carefully).

Sanity checks and small examples.
- Extreme indegree: f maps almost all points to a single value v_0. Starts pick v_0 with probability 1/n each time. Our Lemma 1 correctly yields E[X]=Θ(q^2/n); false merges remain rare for q ≪ √n.
- Dense cycles: if the first walk quickly closes a cycle, that already gives a collision, so A_all only improves.
- Adaptivity stress-test: an algorithm might choose Step vertices u adversarially using all past labels. Our arguments never require independence between f(u) and the past; they only rely on the per-Start uniformity of selecting r_j (and union bounds), hence are robust.

Obstacles and gaps to be tightened.
- “Older-first” wlog: As in §6.3 of the paper, one needs to argue we may modify A into an older-first tie-breaker without hurting its performance. This is standard but should be stated explicitly for functions. I believe the identical monotonicity argument carries over.
- Accounting constants in Lemma 3: I used a factor 4 overhead mirroring the graph case; it is straightforward to check in the function setting but should be written with precise per-walk budgets (2^i forward steps per older Start plus at most the distance-to-cycle for those that end early).
- No-skip proof uses a union bound over at most q future Starts for each Step. A slightly tighter bound (hypergeometric) can reduce constants but is not needed here.
- Independence of residual unseen set size: in Lemmas 1–2 I bounded 1/(n−j+1) from above by 1/(n−q), which is valid since at most q vertices can be seen by the j-th Start in the considered epoch. This detail should be recorded precisely in the formal proof.

Next steps.
1) Write full formal proofs of Lemmas 1–3 with detailed conditioning on the filtration, including the precise definition of E_coll(i,A,2q) in the function setting.
2) Optimize α. Track constants to show α = 1 suffices for large n (since q^2/n ≤ 1/log^2 n then).
3) Clarify the stopping rule for A_all in the function setting: cycle closure produces a collision witness; we can thus remove the “or cycle closes” early-stop clause or re-interpret it as immediate success.
4) Prepare coupling writeup mirroring §6.3, replacing bidirectional graph walks by forward-only function walks.

Notes on output.md. I did not see an existing output.md; if there is one, please surface it. The above lemmas strengthen the “false merges are rare” part with a simple union-bound proof and give a clean coupling in the forward-only function model. I believe this covers the key missing substitute for the graph “hardness of merging” lemma, moving us closer to a complete proof of Theorem 1 in the low-complexity regime.

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

## Round 0002 — 2025-08-27T15:50:03.880434Z

Ideas

- We isolate and prove two structural facts that will be used repeatedly: (i) under no-false-merge, pre-collision walks are disjoint and any merge detected by a Step is a true collision; (ii) under an “older-first” tie-break among equal-length walks, the vector of walk lengths is age-monotone (nonincreasing by start index) at all times. The second fact is the key combinatorial invariant that powers the single-scale amortization.
- We then formalize a symmetrization lemma: in the forward-only, Start-uniform model with an unlabeled certificate, we can w.l.o.g. restrict attention to label-invariant algorithms. For such algorithms, we further impose the older-first tie-break without increasing the expected time to the first collision (proof via exchangeability of ties under a random relabeling of unseen vertices).
- Finally, we state and prove a clean functions-version of the single-scale coupling (analogue of Claim 6.11) that does not rely on backward queries, using the age-monotone invariant. This fills the placeholder mentioned in notes.md and aligns with Section 6.3’s amortization, adapted to functions.

Clarifying events and a basic structural lemma

- Definitions. Fix a function f:[n]→[n] with no loops. At each Step, the algorithm reveals y_t:=f(u_t) for some previously seen u_t. Let I_t be the set of images revealed by Steps strictly before Step t; let S_t be the set of vertices obtained by Start strictly before Step t (uniform-permutation coupling as in output.md).
- A false merge at time t is the event y_t∈S_t\I_t (i.e., y_t was previously seen only as a Start). A true collision occurs exactly when y_t∈I_t: then there exists u′ (queried at an earlier Step) with f(u′)=y_t, so f(u_t)=f(u′) and u_t≠u′.

Lemma A (Disjointness and collision detection under no-false-merge).
- Statement. Fix any run and any horizon T. If X_T=0 (no false merges among the first T Steps) then up to the first time a collision is found: (i) walks started from distinct Starts are vertex-disjoint; (ii) the first time a Step lands on any previously visited vertex v is necessarily a true collision (i.e., v∈I_t). In particular, before the first collision, the walk-system is a disjoint family of forward paths.
- Proof. If a Step lands on a previously seen, non-Start vertex v, then v∈I_t by definition, and we have a collision as above. If a Step were to land on a vertex seen previously only by Start (i.e., in S_t\I_t), that would be a false merge, forbidden by X_T=0. Hence, until a collision occurs, no Step can land on any previously seen vertex at all, so walks remain disjoint. ∎
- Why useful here. This justifies treating all active walks as disjoint, forward-only paths until the first collision; there are no interactions to entangle them except the eventual, collision-causing merge into a previously Step-seen image.

Age-monotonicity under older-first ties

Definition (Older-first tie-break). An algorithm is older-first if whenever it chooses to extend a walk, and there exist two or more eligible walks of the same current length, it extends the one with the smallest start index (the oldest among them).

Lemma B (Age-monotone length invariant). Consider any run up to time T in which no collision has occurred (hence walks are disjoint by Lemma A). If the algorithm is older-first, then at every time t≤T, the vector of walk lengths ℓ_j(t) (number of Steps applied to the j-th started walk) is nonincreasing in the start index: ℓ_1(t)≥ℓ_2(t)≥… (for all walks that have been started). Equivalently, when some walk W_j reaches length L at time t, every earlier walk W_{j′} with j′<j has length at least L at time t.
- Proof. By induction on the number of Steps. Initially, all started walks have equal length (0), hence the invariant holds. Suppose it holds just before some Step that increases a length from ℓ to ℓ+1 on walk W_k. If there were some older j<k with ℓ_j=ℓ, then the older-first rule would have forced extending W_j instead of W_k, contradiction. For older j with ℓ_j>ℓ, increasing ℓ_k to ℓ+1 preserves ℓ_j≥ℓ_k. For younger indices, the invariant cannot be violated by increasing ℓ_k. Hence the invariant is preserved. ∎
- Why useful here. This yields the exact structural condition needed for the scale amortization: when the “winning” walk W_j reaches length L∈[2^i,2^{i+1}), all older walks have already been extended to length at least L≥2^i unless they had been (prematurely) terminated by a collision—ruled out before the first collision—or by a self-detected stop rule (not needed for our argument).

Symmetrization: reducing to label-invariant and older-first algorithms

Definition (Label-invariant algorithm). An algorithm is label-invariant if its distribution over next queries depends only on the isomorphism type of the current (unlabeled) state (the multiset of active walk lengths, their relative ages, and the set of Step-seen images), and not on vertex labels.

Lemma C (Symmetrization to label-invariance). For any randomized algorithm A and any fixed f, there exists a randomized algorithm A_sym which is label-invariant and satisfies, for any horizon T, E[time-to-first-collision ∧ T of A_sym on f] = E[time-to-first-collision ∧ T of A on f]. Moreover, A_sym can be implemented by sampling a uniform random relabeling σ of [n] at time 0, then simulating A on the σ-relabeling of the instance while undoing σ in queries and answers.
- Proof sketch. The Start oracle is uniform over unseen vertices; composing the entire interaction with a uniformly random permutation σ of labels preserves the joint distribution of the transcript (up to relabeling). Averaging A over σ yields A_sym whose decisions depend only on the isomorphism type of the revealed (unlabeled) state. This standard symmetrization leaves the distribution (hence expected time) of the hitting time unchanged. ∎

Lemma D (Older-first tie-break w.l.o.g. under symmetrization). Let A be label-invariant. There exists a label-invariant algorithm A_old with the same Start/Step schedule laws except that ties among equal-length walks are broken older-first, and such that for any horizon T,
  E[time-to-first-collision ∧ T of A_old] ≤ E[time-to-first-collision ∧ T of A].
- Proof sketch. In a label-invariant algorithm, when there is a tie among m equal-length eligible walks, the law of picking one is exchangeable across the m candidates. Fix any run up to the first time a tie occurs; condition on the unlabeled state. Among all exchangeable tie-breaking rules, the deterministic rule “pick the oldest” is a mean-preserving contraction for the rank of the chosen index; by a standard coupling (randomize a total order among tied walks and show that picking the minimal element stochastically dominates picking a uniformly random one), one can couple A and A_old so that (i) the chosen walk under A_old is never younger than under A at any tie; and (ii) between ties, both algorithms make identical choices. Under Lemma B, choosing older at ties preserves (and maximizes) age-monotonicity. Since a collision occurs exactly when some Step lands in I_t (independent of which equal-length representative was picked within the tied class), choosing an older representative never delays the first occurrence of such an event in expectation. Formalizing proceeds by a Doob decomposition of the indicator of “collision occurs at next Step” and exchangeability within ties. ∎
- Why useful here. We can now assume, w.l.o.g. and without paying in expectation, that the competing algorithm is label-invariant and older-first; this is the regime where Lemma B applies deterministically.

Functions-version of the single-scale coupling (analogue of Claim 6.11)

We couple a competing algorithm A (label-invariant, older-first) with the single-scale process A_i inside A_all.

Setup and notation. Fix a scale i and an epoch budget Q. Let r=(r_1,…,r_Q) be the Start string (uniform permutation of unseen vertices) used by both A and A_i. Define events on the run of A up to Q queries:
- E_noFM: X_Q=0 (no false merges).
- E_noSK: no skip occurs (as in output.md) up to Q queries.
- E_hit(i): A finds its first collision within Q queries, and it occurs along some walk W_j whose length at that time lies in [2^i,2^{i+1}).
By Lemma A, under E_noFM, before the first collision walks are disjoint. Under E_noSK, the j-th Start in A is exactly r_j, so age indices agree between A and A_i.

Lemma E (Single-scale coupling for functions). Condition on E_noFM ∧ E_noSK ∧ E_hit(i). Then, running A_i with the same Start string r, A_i finds a collision within at most 4·(number of Steps made by A up to its first collision) forward Steps.
- Proof. Let t be the number of Step queries A makes up to its first collision, and let j be the (unique) index of the walk W_j realizing the collision at length L∈[2^i,2^{i+1}). By Lemma B (age-monotone lengths), at time t, for each earlier start j′<j, either (a) W_{j′} has length at least L≥2^i, or (b) W_{j′} would have terminated earlier due to a collision—which cannot happen since this is the first collision—so (a) must hold. Thus, for all j′<j, A has already invested at least 2^i Steps in W_{j′}. The total Step work A spent on the set {1,…,j−1} is ≥ (j−1)·2^i.
Now consider A_i. By definition, A_i processes starts in increasing order and extends each active walk by up to 2^i Steps (stopping early only upon finding a collision, which only helps). Therefore, the total number of Steps A_i spends on {1,…,j−1} is ≤ (j−1)·2^i ≤ (work of A on {1,…,j−1}). For W_j itself, A_i spends at most 2^{i+1} Steps to reach length L, while A spent L Steps, so A_i’s work on W_j is at most 2·(work of A on W_j). Summing yields that A_i’s total Steps to reach the same collision is at most 2·(work on W_j) + 1·(work on {1,…,j−1}) ≤ 2·t + t = 3t. Conservatively (to account for off-by-one and interleaving overheads), we bound by 4t. ∎
- Why useful here. This is the exact “scale-by-scale” domination needed to compare A_all to a competing algorithm in the forward-only function model; it replaces the graph backtracking used in the paper with the age-monotone invariant.

Assembling the epoch argument (parameters and constants)

- Let q⋆=RAC(collision,f), and let A⋆ be a (certificate-aware) algorithm with E[Queries(A⋆)]≤q⋆. By Markov, Pr[A⋆ finishes within 2q⋆ Steps]≥1/2.
- By output.md (Corollary 3) with S,F≤2q⋆ and q⋆≤n/4, we have Pr[E_noFM fails]≤O(q⋆^2/n), Pr[E_noSK fails]≤O(q⋆^2/n). Hence for large enough n and in the target regime q⋆≤√(n)/log^α n with α>1, Pr[E_noFM ∧ E_noSK]≥1−O(1/log^{2α} n).
- Condition on E_noFM ∧ E_noSK and on A⋆ finishing within 2q⋆ Steps. By Lemma E, in an epoch of length 8q⋆ rounds of A_all (total cost O(q⋆ log n) queries), some A_i finds a collision deterministically. Thus, a single epoch succeeds with probability at least 1/2−O(q⋆^2/n), which is ≥1/3 for sufficiently large n if α>1. A geometric bound implies E[Queries(A_all)] = O(q⋆ log n).

Gaps, checks, and what remains

- Output.md correctness. The permutation-coupling bounds for false merges and skips are correct and robust; they are stated and proved cleanly. No changes needed there.
- Older-first w.l.o.g. (Lemma D). We provided a plausible coupling proof sketch under label-invariance; a fully formal proof should spell out the exchangeability at tie times and the stopping-time argument (define the filtration; show that the conditional success indicator at the next Step is a symmetric function of the tied candidates; older-first maximizes the chance to “serve” older walks without reducing the immediate collision probability). If desired, one can also implement A_old by resolving every tie in A via a fixed deterministic map to the oldest walk, and then average over a random relabeling σ to regain label-invariance and preserve expectation.
- Cycle closure caveat. Our arguments no longer rely on “cycle closure implies a collision.” In functions, closing a cycle (e.g., returning to v_0) may not immediately witness two distinct preimages of the same image. Lemma A/age-monotone + the collision-as-I_t argument avoids this pitfall.
- Constants and α. With the Markov+union bound and the 4× overhead in Lemma E, any fixed α>1 suffices for one-epoch success probability ≥1/3 for large n. With a sharper tail bound (Freedman on the skip/false-merge counts) and a tighter constant than 4 in Lemma E (3 suffices by the accounting above), α can likely be pushed down to α≥1 (or even any α>1/2); this is optional refinement.

Next steps

1) Formalize Lemma D. Write a complete proof using the permutation coupling of starts and a tie-exchangeability argument at each tie time, with a stopping-time coupling that shows expected hitting time to the first collision does not increase when switching to older-first ties.
2) Integrate Lemma E into a fully written proof of Theorem (forward-only, low complexity), tracking all constants in the epoch assembly and clarifying how A_all interleaves scales (one query per scale per round) and how cross-scale collision checks are accounted for (they are not counted as queries).
3) Optional: provide Freedman/Bernstein tail bounds for the counts of false merges/skips to lower the required α. The martingale differences are bounded by 1 with predictable quadratic variation ≈ F·S/(n−F).
4) Add small, adversarial toy instances to stress-test Lemma D’s assumptions (label-invariance and tie symmetry), verifying that older-first does not change the expected time under random relabelings.

Summary of new concrete claims ready to curate next
- Lemma A (No-false-merge ⇒ disjointness and true-collision characterization). Short, fully proved.
- Lemma B (Age-monotone invariant under older-first ties). Short, fully proved.
- Lemma C (Symmetrization to label-invariance). Standard, proof sketched; can be expanded.
- Lemma D (Older-first tie-break w.l.o.g. under symmetrization). Proof sketch provided; to be fully formalized next.
- Lemma E (Functions single-scale coupling). Fully proved given Lemma B and the no-false-merge/no-skip coupling.
These, together with output.md’s probabilistic pillars and the epoch assembly above, essentially complete the forward-only, low-complexity theorem modulo a fully detailed writeup of Lemma D and constant tracking.

## Round 0002 — Forward-only coupling: older-first pacing and single-scale domination

Summary of what is already curated (output.md)
- The permutation-coupling bounds for both false merges and skips are correct and robust: for an epoch with S starts and F steps, E[#false merges] ≤ F·S/(n−F) and E[#skips] ≤ F·S/(n−F), hence each occurs with probability O(q^2/n) in 2q-query epochs. These are uniform over f and over fully adaptive algorithms. No changes needed.

Gaps remaining toward the target theorem
- We still need a precise, checkable coupling from an arbitrary (certificate-aided) algorithm A to a single-scale process A_i in the forward-only model. The sticking point is “older-first” tie-breaking. Rather than claim w.l.o.g. directly, we propose and prove a pacing wrapper that enforces an older-first discipline with at most a constant-factor overhead. We then prove a clean single-scale domination lemma under the two rare-event conditions (no false merges, no skips).

Definitions to fix notation
- We work with a fixed f:[n]→[n] (no loops). A Start returns a uniformly random unseen vertex (unseen means neither returned by Start before nor revealed as an image of any Step). A Step on u reveals y=f(u).
- Let r be the global random start-permutation (as in output.md). For a time window of at most T total queries, define SKIP(A,T,r) and FM(A,T,r) to be the events that A incurs at least one skip or false merge, respectively, within that window relative to r (as in the curated lemmas).
- For a run of A up to its first collision, let W_j be the walk (indexed by the j-th Start of A under r) on which the first collision is found, and let L be the distance from its start to the colliding image at that moment.

Lemma OF (older-first pacing wrapper; forward-only, deterministic statement).
- Statement. Fix f, a (possibly adaptive) algorithm A, a start permutation r, and an integer i≥0. There exists a wrapper algorithm B=B[A,i] that, given the same f and r, makes only forward queries and satisfies: for any integer T≥1, if A finds a collision within ≤T queries, then B finds a collision within ≤2T queries. Moreover, in the run of B up to the moment when W_j first reaches length ≥2^i (or terminates), B enforces the following discipline: whenever A attempts to advance some walk W_ℓ of current length <2^i while there exists an older (ℓ′<ℓ) active walk of length <2^i, B advances one such older walk instead; otherwise B advances as A does.
- Why useful here. This provides an “older-first up to 2^i” property sufficient for the single-scale amortization, without assuming any stochastic optimality of older-first. The overhead is at most a factor two in query count to the first collision.
- Proof sketch (checkable). B simulates A step-by-step but with the scheduling rule in the statement: in each simulated A-step, if A’s choice respects the discipline, B issues the same Step/Start; if not, B issues one Step on an older active walk with current length <2^i (arbitrarily breaking ties), then in the next B-move carries out A’s planned Step. Thus, each simulated A-step causes either one or two B-steps; hence if A halts by time T, B halts by time ≤2T. That B does not delay the existence of a collision follows because B never undoes revealed information: by the time B completes the first T simulated A-steps (in possibly different order, interleaved with at most T catch-up steps), it has revealed a superset of the images revealed by A up to its collision time; revealing more edges cannot preclude a collision that A witnessed, so B must witness a (possibly earlier) collision by then. The rule ensures that prior to any W_ℓ exceeding 2^i, all older active walks have been advanced to min{2^i, their termination distance}.

Lemma SC (single-scale domination; forward-only functions, analogue of Claim 6.11).
- Setup. Fix f, a certificate-aided algorithm A that finds a collision within q queries with probability ≥1/2, a start permutation r, and scale i with 2^i ≤n. Run the pacing wrapper B=B[A,i]. Define the events:
  • E1:= ¬FM(A,2q,r) ∧ ¬SKIP(A,2q,r) (no false merges, no skips for A within 2q queries).
  • E2(i):= ¬FM(A_i,4q,r) ∧ ¬SKIP(A_i,4q,r) (no false merges, no skips for the single-scale process A_i within 4q queries; A_i uses starts from r and extends each active walk forward up to 2^i steps, stopping earlier if it revisits a seen vertex or closes a directed cycle).
  • Ecoll(i): the first collision of A occurs on W_j at distance L∈[2^i,2^{i+1}).
- Statement. Conditioned on E1 ∧ E2(i) ∧ Ecoll(i), the process A_i (with start order r) deterministically finds a collision within at most 4q forward queries.
- Why useful here. This is the scale-by-scale coupling needed to transfer progress from an optimal certificate algorithm to the all-scales strategy.
- Proof (detailed charging). Throughout, couple A_i and B to share the start order r (E2(i) guarantees A_i’s j-th Start equals r_j; E1 guarantees A’s j-th Start equals r_j and that before the first collision, any step into a previously seen vertex is a true collision, never a false merge). Consider the run of B up to the first collision of A; by Lemma OF, this takes ≤2q queries and, by construction, enforces that for any active walk with index ≤j−1 (older than W_j), its length at the time W_j first reaches 2^i is at least min{2^i, its termination distance}.
  Define the “budget” that A_i must spend before it reaches the same collision as A:
  • For each older start ℓ<j whose walk does not terminate earlier, A_i must advance it to length exactly 2^i (it resets or freezes thereafter). For each older start that terminates earlier (by hitting a previously seen vertex or closing a cycle), A_i must advance it up to that termination length.
  • For the colliding walk W_j, A_i must advance it to distance L (≤2^{i+1}−1).
  All other work A_i may do (e.g., advancing younger starts or beyond-2^i work on older ones) only delays success and can be charged to the above items by truncating the schedule, so it suffices to bound this budget.
  By the enforced discipline of B, for each ℓ<j either B has already spent ≥2^i steps on W_ℓ (if it remained active), or B has spent at least its termination length advancing W_ℓ to termination. Thus, summing over ℓ<j, A_i’s total budget on older starts is upper bounded by B’s total steps spent on older starts up to the time W_j reaches length 2^i. Similarly, A_i’s work on W_j up to length L is at most B’s work on W_j up to that moment (since B follows A’s choices on W_j except for interleaving catch-ups). Therefore, the total budget A_i needs is ≤ (B’s steps on older starts) + (B’s steps on W_j) ≤ (total steps of B up to A’s collision time) ≤ 2q by Lemma OF.
  Finally, A_i may incur at most a constant-factor overhead due to interleaving and possible partial restarts across attempts; a standard doubling/truncation argument (identical to the graphs case) shows that simulating the above budget with A_i costs at most a factor 2 in queries, because each active older walk is extended forward in disjoint prefixes up to its own cap (2^i or termination), and work on W_j is in addition. Hence A_i finds the collision within ≤4q steps. Determinism follows because, under E1 and E2(i), the relative order of starts is aligned by r and no skip/false-merge alters it.

Epoch assembly (quantitative bound and α)
- Let q⋆:=RAC(collision,f). Choose A to be a certificate-aided algorithm with E[queries]≤q⋆. By Markov, Pr[A finishes within 2q⋆] ≥ 1/2. For a fixed scale i, the curated bounds yield:
  • Pr[FM(A,2q⋆,r) ∪ SKIP(A,2q⋆,r)] ≤ c·(2q⋆)^2/(n−2q⋆) = O(q⋆^2/n).
  • Pr[FM(A_i,4q⋆,r) ∪ SKIP(A_i,4q⋆,r)] ≤ c′·(4q⋆)^2/(n−4q⋆) = O(q⋆^2/n).
  Union bounding over the O(log n) scales yields that with probability ≥ 1 − O((q⋆^2 log n)/n), all needed E2(i) except possibly a constant number hold; in particular, for the specific i picked out by Ecoll(i) (when A finds a collision), E2(i) also holds with probability ≥ 1 − O((q⋆^2 log n)/n). Combining with Pr[finish ≤ 2q⋆] ≥ 1/2, we get that a single epoch of length 8q⋆ rounds (each round has O(log n) queries) succeeds with probability at least 1/2 − O((q⋆^2 log n)/n).
- In the low-complexity regime q⋆ ≤ √n / log^α n, we have (q⋆^2 log n)/n ≤ 1 / log^{2α−1} n. Choosing any fixed α ≥ 1 makes this error o(1); for large n the success probability per epoch is bounded below by, say, 1/3. Therefore, E[Queries of A_all] = O(q⋆ log n).

Examples and sanity checks
- Single-cycle instance with no collisions: The coupling is applied only when A actually finds a collision; the wrapper and A_i bounds are vacuous otherwise, consistent with the theorem’s premise (it concerns instances with small RAC for collisions).
- Instance where a walk closes a directed cycle before any collision: Our budget accounting treats cycle closures as early terminations, which only reduce the A_i budget by capping an older walk’s cost at its termination distance; this aids the domination.

Obstacles and clarifications
- Conditioning on no-skips for A_i. The single-scale domination lemma conditions on no-skips and no-false-merges for both A and A_i at the relevant scale i. While this adds an O(log n) factor in the failure probability (we must union-bound E2(i) across scales), the low-complexity regime still yields a constant per-epoch success probability for α ≥ 1. If desired, one can refine the epoch design to randomize the scale focus and avoid a full union bound; however, the simpler union bound suffices.
- Cycle-closure yields no automatic collision. We treat cycle closures only as walk terminations (no success), which is the correct behavior for directed function graphs without preimage queries.

Next steps for curation
1) Formalize the proof of Lemma OF with explicit filtrations and a pathwise coupling argument (the above sketch is deterministic and should be straightforward to write down formally).
2) Write Lemma SC fully rigorously, including the precise “budget charging” inequalities and the final factor-4 bound. We suggest curating Lemma OF first, then Lemma SC.
3) Add the epoch assembly as a proposition with explicit constants, recording the mild condition α ≥ 1 in the theorem statement. If we later tighten the per-scale skip bound (e.g., via Freedman), α can likely be improved.

Notes on output.md
- No issues found. The permutation-coupling lemmas are correct and are the key probabilistic inputs for the coupling. The present round adds the algorithmic coupling lemmas needed for assembly; once verified, they can be appended to output.md under new lemma numbers.

## Round 0003 — Consolidating prerequisites; symmetrization fix; roadmap to older-first w.l.o.g.

### What is already solid (recap of curated pieces)
- False merges and skips are rare up to 2q queries: E[#false merges] ≤ F·S/(n−F) and E[#skips] ≤ F·S/(n−F); hence Pr[bad] = O(q^2/n) in 2q-query epochs (curated Lemmas 1–2 and Corollary 3). This is uniform over f and adaptivity.
- Structural consequences under no-false-merge: before the first collision the active walks are disjoint forward paths, and any step landing in the previously Step-seen image set I_t is a true collision (curated Lemma 4).
- Age-monotone invariant: under older-first tie-breaking, the length vector (by start age) is nonincreasing at all times prior to the first collision (curated Lemma 5).
- Single-scale domination under older-first: conditioned on no-skips/no-false-merge for both processes, if A’s first collision occurs along W_j at length L ∈ [2^i,2^{i+1}), then the single-scale process A_i finds a collision within ≤ 2·t steps where t is the number of Step queries A used up to that moment (curated Lemma 6).

These ingredients are the forward-only analogue of the graph-side amortization in §6.3 of BGN, contingent on the older-first assumption.

### Corrections and clarifications relative to output.md
- No changes required to curated Lemmas 1–2–3–4–5–6. They are consistent and correctly conditioned on no-false-merge and no-skip for both A and A_i.
- Remaining gap: we still need a rigorous reduction “older-first w.l.o.g.” for the certificate-aided competitor. Until that is in place, the epoch assembly towards Theorem (forward-only, low complexity) uses Lemma 6 only for algorithms that already tie-break older-first.

### New clean lemma (ready to curate next): Symmetrization to label-invariant algorithms
Statement (precise averaged form). For any randomized algorithm A and any fixed f:[n]→[n], define the symmetrized algorithm A_sym that samples a uniform permutation σ of [n] at time 0 and simulates A on σ∘f∘σ^{-1}, undoing σ in queries/answers. Then for any finite horizon T,
\[ \E[T_{hit}\wedge T\;\text{of}\;A_{sym}\;\text{on}\;f] \;=\; \E_{\sigma}\,\E[ T_{hit}\wedge T\;\text{of}\;A\;\text{on}\;\sigma\circ f\circ\sigma^{-1}]. \]
Consequently, since RAC(collision,σ∘f∘σ^{−1}) = RAC(collision,f) for all σ, the infimum defining RAC can be achieved (or arbitrarily approached) within the class of label-invariant algorithms (i.e., those whose decision distribution depends only on the unlabeled state). This is the safe replacement for the incorrect equality “E[T(A_sym on f)] = E[T(A on f)]” (which need not hold for a fixed f).
Why useful here. It allows us to restrict attention to label-invariant competitors before addressing tie-breaking, without loss for RAC.
Sketch of proof. Standard: composing with a uniform σ makes the transcript distribution depend only on unlabeled states; averaging preserves the optimal value since the max over permutations in RAC is invariant under conjugation.

### Toward the older-first w.l.o.g.: a precise plan and a key sub-lemma
Goal. Show that among label-invariant algorithms, resolving ties older-first does not increase the expected time to the first collision. We outline a filtration-based, exchangeability-driven argument and isolate a checkable sub-lemma.

- Setup. Work under the event E_noFM that no false merges occur before the first collision; by Lemma 4, the walk-system is a disjoint family of forward paths until the first collision. Fix a pre-sampled start order r and condition on E_noSK (for coupling to r). Consider a label-invariant algorithm A; ties occur at stopping times τ when there are at least two eligible walks with identical current length.

- Exchangeability at ties. Under the symmetrized setting (averaging over σ), conditioned on the unlabeled state just before τ, the multiset of labels assigned to the tied walks is in uniform random order (by label-invariance and σ-randomness). Therefore, the immediate success hazard at the next step (probability that the next Step lands in I_t) is identical for all choices among the tied walks.

- Monotone coupling of tie choices. Define A_old to be A with the sole modification that at each tie it picks the smallest start index among tied walks (“older-first”). We couple A and A_old to share all randomness except at tie indices. At a tie time τ with tied set T, the conditional law of the immediate success indicator 1{hit at next Step} is the same under both choices. If no success occurs at that step, we progress to the next state. The crucial quantitative direction is to show that, for each fixed scale i, the capped-sum potential
  Φ_i(t) := ∑_j min{ℓ_j(t), 2^i}
 stochastically dominates under A_old compared to A at all times t prior to the first collision. Intuitively, older-first greedily fills earlier coordinates up to the cap 2^i before advancing younger ones (Lemma 5 guarantees coordinatewise age-monotonicity), so by an exchange argument Φ_i cannot decrease when switching a tie choice to the older index. This gives a pathwise (with respect to σ) inequality Φ_i^{old}(t) ≥ Φ_i^{A}(t) for all t, and all i.

Sub-lemma S (capped-sum dominance at ties). Fix a tie time τ and a scale i. Let the current equal length be L<2^i (the only interesting case; if L≥2^i the cap is inactive). Consider two next-step choices: extend the oldest tied index a or a younger tied index b. Denote the capped-sum after this step by Φ_i^{(a)} and Φ_i^{(b)} respectively. Then Φ_i^{(a)} ≥ Φ_i^{(b)} deterministically. Moreover, iterating such local improvements shows that after any finite sequence of tie resolutions, Φ_i under older-first dominates Φ_i under any other tie-breaking policy, for all i and all times.
Sketch of proof. At a single tie where all tied walks have the same current length L<2^i, incrementing the older one increases the same coordinate that appears earlier in the sum over j ordered by start age; with the cap min(·,2^i), the increment contribution is 1 regardless of which tied walk is chosen, but future opportunities to accrue additional units before hitting the cap are better preserved on the older indices under older-first. A standard adjacent-swap exchange (bubble-sort) argument formalizes that repeatedly moving mass to older coordinates (without changing total mass and while respecting that increments occur one unit at a time) never decreases the capped sum. We will write this carefully by induction on steps and via adjacent transpositions in the next round.

Why S helps. Given S, for the particular scale i picked out by A’s first collision, we have for every time t prior to that collision
  Φ_i^{old}(t) ≥ Φ_i^A(t),
 pathwise (for a fixed σ,r). Using the fact that the total number of Step queries of A up to that moment equals ∑_j ℓ_j(t), we obtain the bound from Lemma 6 for A_old. Thus A_old meets the single-scale overhead guarantee, which is sufficient for the epoch analysis. Combined with the exchangeability of immediate hazards at ties, this shows that E[time-to-first-collision(A_old)] ≤ E[time-to-first-collision(A)].

Status. The sub-lemma S is the remaining formal piece; its single-tie version is straightforward, and the multi-step cumulative dominance follows by an adjacent-transposition argument. I will supply the full proof in the next round with a clearly defined partial order and a rigorous exchange.

### Freedman-style tails for skips and false merges (optional refinement)
Lemma (Freedman tail for X). In an epoch with S starts and F steps, define X_false as the false-merge count and X_skip as the skip count. Under the permutation coupling, each increment is a [0,1]-bounded martingale difference with predictable quadratic variation V ≤ F·S/(n−F). Therefore, for any λ>0,
- Pr[X_false − E X_false ≥ λ] ≤ exp(− λ^2 / (2(V + λ/3))).
- The same bound holds for X_skip.
Why useful. This yields exponentially small tails in the regime F·S ≪ n, enabling (if needed) a simultaneous high-probability control over all O(log n) scales in a single epoch. It does not change the asymptotic α-threshold of 1/2 for the union bound over scales (since the union is over O(log n) events), but it tightens constants.
Sketch. Standard application of Freedman’s inequality for martingales with bounded increments. The Doob martingale is obtained by revealing the step-by-step history; the indicator at each Step has bounded conditional variance ≤ s_t/|W_t|(1−s_t/|W_t|), summing to ≤ E X_false.

### Parameter check for the epoch assembly (assuming older-first)
- Let q⋆=RAC(collision,f). Picking an optimal certificate-aided older-first, label-invariant competitor A⋆, Markov gives Pr[A⋆ finishes within 2q⋆] ≥ 1/2.
- Intersect with no-skip/no-false-merge for A⋆ over 2q⋆ queries: Pr ≥ 1 − O(q⋆^2/n).
- For the particular scale i at which A⋆ first collides, require no-skip/no-false-merge for A_i over 4q⋆ queries: Pr ≥ 1 − O(q⋆^2/n). Union over O(log n) scales contributes an additive O((q⋆^2 log n)/n).
- Thus a single 8q⋆-round epoch of A_all succeeds with probability at least 1/2 − O((q⋆^2 log n)/n). In the regime q⋆ ≤ √n / log^α n, this is ≥ 1/3 for large n when α > 1/2. Hence E[Queries_{A_all}(f)] = O(q⋆ log n).
Remark. With only the coarser two-event union bound (not unioning over scales), α ≥ 1 suffices; with the refined per-scale union bound as above, α > 1/2 suffices.

### Small examples and sanity checks
- Necessity of older-first for the deterministic 2× bound. Construct a toy where A starts many walks but advances only the youngest to length L while keeping older ones at length 0. Then (j−1)·2^i can greatly exceed t, showing Lemma 6’s amortization fails without older-first.
- Symmetry of tie hazards. Under the symmetrized setting, at a tie the probability that the chosen step lands in I_t is the same no matter which tied walk is extended; this uses only exchangeability of labels among tied indices.

### Obstacles remaining
- The rigorous proof of the multi-step capped-sum dominance (Sub-lemma S) and the consequent “older-first w.l.o.g.” Lemma are pending. The plan is to formalize an adjacent-transposition exchange at ties and demonstrate that Φ_i is nondecreasing under replacement of any non-oldest tie choice by the oldest, iterated to convergence (older-first).
- We must keep conditioning consistently on no-skips/no-false-merges for both A and A_i in the single-scale coupling and reflect the O(log n) union bound (already addressed in the parameter check above).

### Next steps
1) Write the full proof of Sub-lemma S (capped-sum dominance) and the older-first w.l.o.g. Lemma, with explicit filtrations: define tie stopping times τ_k, prove exchangeability at τ_k, and carry out the adjacent-swap argument to show Φ_i^{old}(t) ≥ Φ_i^A(t) for all i,t.
2) Curate the symmetrization lemma (averaged form) into output.md and connect it to the “older-first w.l.o.g.” reduction for RAC.
3) Finalize the epoch assembly, explicitly quantifying the per-epoch success probability with α > 1/2 and constants C in Theorem (forward-only, low complexity).
4) Optionally, add Freedman tails for skip/false-merge counts to improve constants and support a simultaneous control across all scales in a single epoch.

## Round 0003 — Symmetrization and older-first tie-breaking formalization; assembling the epoch bound

In this round I address two gaps flagged by the verifier and needed to complete the forward-only, low-complexity theorem: (1) a correct symmetrization statement that justifies focusing on label-invariant algorithms in the unlabeled-certificate setting; (2) a rigorous “older-first w.l.o.g.” lemma based on exchangeability at tie times under random relabelings. I then outline the epoch assembly with explicit constants. I also point out what to append to output.md and what remains open.

### Corrections and clarifications about output.md
- Symmetrization (missing): output.md does not yet include the correct symmetrization lemma. The earlier Round 0002 notes claimed an equality E[T(A_sym on f)] = E[T(A on f)], which is generally false for a fixed labeled instance f. The correct statement averages over a random relabeling (conjugacy) of f. I give a precise formulation below (Lemma S).
- Older-first w.l.o.g.: output.md uses older-first in Lemma 6 but lacks a formal reduction showing that we can restrict attention to older-first tie-breaking among label-invariant algorithms without increasing expected time (in the conjugacy-averaged sense). I provide Lemma D below, resolving this gap.
- Pacing wrapper: As the verifier noted, a wrapper that “inserts catch-up steps” is not implementable in our online oracle model. I do not use it. The route via Lemma D suffices.

### New Lemma S (Averaged symmetrization to label-invariant algorithms)
Statement.
- Let P be the collision property. For any randomized algorithm A (possibly label-dependent) and any fixed f:[n]→[n], define A_sym that samples a uniform σ∈S_n and simulates A on σ∘f∘σ^{-1}, undoing σ when issuing queries/processing answers. For any horizon T,
  E[T_hit∧T(A_sym on f)] = E_σ[E[T_hit∧T(A on σ∘f∘σ^{-1})]].
- Consequently, RAC(P,f) = inf_A max_π E[T_hit(A on π∘f)] = inf_A′ E_σ[E[T_hit(A′ on σ∘f∘σ^{-1})]], where the infimum can be taken over label-invariant algorithms A′ (those whose decisions depend only on the unlabeled state). In particular, there exists a sequence of label-invariant algorithms attaining RAC(P,f) up to arbitrarily small additive ε.
Why useful here.
- Reduces the competitor to be label-invariant without loss for the unlabeled-certificate benchmark, allowing us to reason about tie-breaking via exchangeability under random conjugacy.
Sketch of proof.
- The first identity is by construction. For the second, observe that RAC(P,σ∘f∘σ^{-1})=RAC(P,f) for all σ, so the maximum over conjugates equals the average over conjugates; then apply the first identity and note that averaging A over σ yields a label-invariant algorithm achieving the same averaged cost.

### New Lemma D (Tie-breaking invariance under conjugacy; older-first w.l.o.g.)
Setup/definitions.
- Work in the forward-only model on a fixed f. Let A_base be a label-invariant randomized policy that, at any state, specifies whether to Start or Step, and if Step, specifies a target length (e.g., “extend one of the longest eligible walks”). When at some step the policy mandates “extend a walk among a set U of eligible walks that share the same current length,” we call this a tie.
- A tie-breaker is a measurable rule that, given the unlabeled state and the set U (with their age indices), selects one element of U to extend. Let φ and ψ be two tie-breakers (e.g., φ = older-first; ψ = any other label-independent tie-breaker), and let A_φ, A_ψ denote the corresponding algorithms. Let T_hit denote the time to first collision.
Statement.
- Consider the experiment that first samples a uniform random σ∈S_n, then runs A_φ (resp. A_ψ) on the conjugate instance σ∘f∘σ^{-1}, stopping at the first collision. Then for any horizon T,
  E_σ[E[T_hit∧T(A_φ on σ∘f∘σ^{-1})]] = E_σ[E[T_hit∧T(A_ψ on σ∘f∘σ^{-1})]].
- In particular, in the unlabeled-certificate benchmark (which is invariant under conjugacy), tie-breaking does not affect the expected query complexity; hence, we may assume w.l.o.g. that the competitor resolves ties older-first.
Why useful here.
- This justifies the use of Lemma 5 (age-monotone invariant) and Lemma 6 (single-scale domination) for the competitor, closing a key gap.
Proof idea (filtration and exchangeability at ties).
- Let (F_t) be the filtration of the labeled process up to t Steps. Define the unlabeled abstraction U_t: it contains the multiset of active walk lengths (ordered by age), whether a walk is terminated, and the count |I_t| of Step-seen images. A label-invariant policy A_base ensures that, pre-collision and under “no false merges,” the decision to Step vs Start and the targeted length depend only on U_t.
- Consider the first tie time τ (a stopping time with respect to the unlabeled filtration) where there are m≥2 eligible walks U_τ={W_{j_1},…,W_{j_m}} of equal length L. Condition on U_τ and on the sigma-field generated by U_s for s≤τ, and on the internal randomness of A_base up to τ. Under a uniform random conjugacy σ, the joint distribution of the labeled endpoints (u_{j_1},…,u_{j_m}) at time τ is exchangeable: it is invariant under any permutation of {j_1,…,j_m}, because σ induces a uniform random relabeling across the still-unseen vertices, and (by no false merges up to τ) the ℓ=L forward endpoints arise from disjoint, unlabeled tails that are symmetric under conjugation. Similarly, the Step-seen image set I_τ is (conditionally) uniformly distributed among |I_τ|-subsets of the revealed images and independent of the labels of the u_{j_r}’s beyond U_τ.
- Hence, the conditional hazard at τ, Pr[f(u_{j_r})∈I_τ | U_τ, F_{τ−}], is the same for all r (exchangeability across the tied endpoints). Therefore the one-step success probability (at the next Step) is identical under any tie-breaker.
- To extend beyond the first tie, define recursively the sequence of tie times τ_1<τ_2<⋯ (up to T). At each τ_k, given the unlabeled history up to τ_k, the conditional joint law of the labels on the tied endpoints remains exchangeable; this uses that relabeling by right composition with a permutation that acts within the (unseen) labels of the tied walks preserves the uniform distribution over σ. One can formalize a measure-preserving bijection Φ_k on the relabelings σ (compose with a transposition within the tied endpoints’ labels) that maps the run of A_φ to a run of A_ψ while preserving the unlabeled history up to τ_k and the distribution of future randomness. Inductively, the distributions of the entire labeled transcripts (up to T or to collision) under A_φ and under A_ψ coincide after averaging over σ. Taking expectations yields the claim.
- Remark on “no false merges”: The exchangeability argument at ties uses that, pre-collision, the tied endpoints correspond to disjoint, unseen regions of the function graph (Lemma 4), so a conjugacy that swaps their label-sets leaves the unlabeled state unaffected while preserving the uniform measure on σ. This is exactly the regime we condition on in Lemma 6 and in the epoch assembly.

### Consequence: older-first w.l.o.g. and completion of the single-scale comparison
- By Lemma S we can assume the competitor is label-invariant without changing the RAC benchmark. By Lemma D, we can also assume the tie-breaker is older-first with no change to the conjugacy-averaged expected time. Therefore Lemma 5 (age-monotone invariant) and Lemma 6 (single-scale domination, 2× overhead in Steps) apply to the competitor A.
- This completes the missing justification for using older-first in output.md’s Lemma 6. I recommend curating Lemma S and Lemma D next to make the chain airtight.

### Epoch assembly (explicit constants and α)
Let q⋆=RAC(collision,f). Let A⋆ be a certificate-aided algorithm with E[Queries]≤q⋆.
- Success within 2q⋆. By Markov, Pr[A⋆ finishes within 2q⋆] ≥ 1/2.
- No false merges/skips with high probability.
  • For A⋆ over 2q⋆ queries, Lemmas 1–2 and Corollary 3 (with S,F≤2q⋆) give Pr[FM(A⋆)∪SKIP(A⋆)] ≤ 8·(2q⋆)^2/n ≤ 32·q⋆^2/n.
  • For the single-scale A_i over 4q⋆ queries, the same bound yields Pr[FM(A_i)∪SKIP(A_i)] ≤ 8·(4q⋆)^2/n ≤ 128·q⋆^2/n for a fixed i.
  • We only need the latter for the specific i at which A⋆ finds the first collision. To upper bound the probability that this fails at that i, we can union bound over all i∈{0,…,⌊log_2 n⌋}; this gives an additional factor O(log n). Thus the combined failure probability across both processes is O((q⋆^2 log n)/n).
- Coupling to a winning scale. Condition on the intersection of: (i) A⋆ finishes within 2q⋆; (ii) no false merges/skips for A⋆; and (iii) no false merges/skips for A_i at the relevant i. By Lemma 6 (using older-first per Lemma D), A_i deterministically finds a collision within ≤ 2·(2q⋆)=4q⋆ Steps. Interleaving scales as in A_all costs O(log n) queries per round, so 8q⋆ rounds suffice per epoch.
- Per-epoch success probability and expectation. For large n and in the regime q⋆ ≤ √n / log^α n with α≥1, we have (q⋆^2 log n)/n ≤ 1/log^{2α−1} n = o(1). Picking n large enough, the per-epoch success probability is at least 1/2 − c·(q⋆^2 log n)/n ≥ 1/3 for a fixed absolute c. Therefore, by a geometric bound, E[Queries(A_all on f)] ≤ C·q⋆·log n for an absolute C.
- Note on α: The simple union bound across O(log n) scales requires α≥1 for a clean constant success probability. If desired, Freedman’s inequality for the martingale of increments of skip/false-merge indicators (bounded by 1 with predictable variance ≲ F·S/(n−F)) can improve constants/tails but does not evidently reduce the α-threshold below 1 without further refinements to the epoch design.

### Why the Lemma D proof conditions match our usage
- Lemma 6 and the epoch assembly condition on “no false merges” for both A and A_i. This guarantees disjointness of active walks up to the first collision (Lemma 4), which is the regime where the tie-exchangeability argument applies. Thus, applying Lemma D exactly in this conditional world is legitimate and sufficient for Lemma 6.

### What to curate next into output.md
- Lemma S (Averaged symmetrization to label-invariant algorithms) with the proof sketch above.
- Lemma D (Tie-breaking invariance under conjugacy) with the exchangeability-at-tie proof. It would be good to state explicitly the tie times τ_k as stopping times, and the construction of measure-preserving maps σ↦τ_k∘σ that swap the labels of tied endpoints without affecting the unlabeled process.
- Proposition (Epoch assembly). Given Lemma 6 and the permutation-coupling bounds (Lemmas 1–2), this yields the target theorem in the regime q⋆ ≤ √n / log^α n with α≥1, with explicit constants as above.

### Obstacles and remaining items
- Full formalization of Lemma D: I presented a detailed, checkable route via stopping times and exchangeability, but the measure-preserving map “compose σ by a transposition within the label-set of tied endpoints” constructed adaptively over ties should be written explicitly (induction over tie events). The key invariant is that the unlabeled state is fixed while the distribution of labels remains uniform under conjugacy; no-false-merge ensures the tied endpoints’ future tails are disjoint/unseen, so these local conjugacies are well-defined.
- Freedman tails: optional improvement for the per-epoch failure probability. Define the Doob martingale for X_t (cumulative skips/false merges) with bounded increments and predictable quadratic variation V_t ≤ E[X_T]; Freedman then yields exp(−Ω(min{λ^2/(E[X_T]+λ),λ})) tails. Not crucial for α≥1.
- Final theorem statement and constants: After curating Lemma S and Lemma D, we can add the theorem “Forward-only, low complexity” with α≥1 and some explicit C.

### Next steps
1) Write Lemma S and Lemma D as formal statements in output.md with proofs organized by filtrations and tie times, as outlined. This closes the main correctness gaps.
2) Add a short proposition assembling the epoch argument: quantify per-epoch success and conclude E[Queries(A_all)] ≤ C·q⋆·log n in the regime q⋆ ≤ √n / log^α n with α≥1.
3) Optional: include a Freedman tail lemma for skips/false merges (under the permutation coupling) to strengthen high-probability bounds.

## Round 0004 — 2025-08-27T18:54:43.729631Z

Round 0004 — Corrected single-scale comparator (two-chunk schedule) and a majorization lemma blueprint

Summary of status and gaps in output.md
- As the verifier requested, the flawed single-scale Lemma 6 was removed from output.md. The probabilistic pillars (permutation coupling for false merges/skips, and Freedman tails) and the basic structural Lemmas 4–5 remain correct and useful.
- Missing pieces to reach Theorem (forward-only, low complexity): (i) a correct single-scale comparator that is consistent with its schedule; (ii) a clean reduction to older-first (or a constant-factor domination) so that we can apply the comparator to a certificate-aided competitor.

New: a corrected single-scale comparator under older-first, forward-only
We define a fixed, label-invariant, forward-only single-scale process that is coherent with its proof. The key is a “two-chunk per start” schedule at scale i.

Definition (two-chunk single-scale process B_i).
- Input: fixed scale i≥0; a start string r=(r_1,r_2,…) (the global Start-permutation);
- For j=1,2,3,… do sequentially:
  1) Stage A: Start at r_j (if not yet started) and extend W_j forward for up to 2^i Step queries, stopping early if a collision is detected (i.e., the Step lands in I_t) or if a false-merge would occur (the actual run will be conditioned on no-false-merge; otherwise the process just halts on the collision event if it happens). If a collision is found, halt and report success.
  2) Stage B: If Stage A completed without collision, immediately continue W_j forward for up to an additional 2^i Steps (again, stopping as soon as a collision is found). If a collision is found, halt and report success; otherwise advance to j+1.
- B_i uses only forward queries and the Start interface; it is label-invariant and pre-specified (no dependence on any competitor’s transcript).

Lemma E′ (Single-scale domination with two-chunk schedule; forward-only functions).
Assume the following conditioning for some fixed horizon T (large enough for the bounds below):
- No-skip for A up to T and for B_i up to 2T, with respect to the same start string r (so their j-th new starts are r_j);
- No-false-merge up to the same horizons (so pre-collision walks are disjoint and any revisit to a Step-seen image is a true collision by Lemma 4);
- A is label-invariant and resolves ties older-first; its first collision occurs along W_j at distance L∈[2^i,2^{i+1}). Let t denote the number of Step queries used by A up to (and including) that collision.
Then B_i (with start order r) finds a collision deterministically after at most 2t forward Steps.

Proof (deterministic, pathwise under the conditioning).
- Disjointness and identity of starts: No-skip aligns the j-th start across A and B_i (both use r_j). No-false-merge implies disjointness of walks before the first collision (Lemma 4), so the forward trajectory of each W_ℓ in B_i matches the corresponding forward trajectory that A would reveal if it extended W_ℓ (no interference from other walks before collision).
- Age-monotone lengths in A: Under older-first (Lemma 5), at the moment A first reaches the collision on W_j at length L∈[2^i,2^{i+1}), every older walk W_{ℓ} with ℓ<j has length at least L≥2^i (unless a collision had already occurred earlier, which is excluded by the definition of the first collision). Consequently, A’s total Step work t satisfies
  t ≥ (j−1)·2^i + L.
- Work of B_i up to processing W_j:
  • For each older ℓ<j, B_i spends at most 2·2^i Steps: it executes Stage A (≤2^i) and then Stage B (≤2^i) on W_ℓ unless a collision is found even earlier (which only helps). Hence B_i’s cumulative work on older walks is ≤ (j−1)·2^{i+1} = 2·(j−1)·2^i.
  • On W_j, B_i spends at most 2^i Steps in Stage A to reach length 2^i. Since A’s collision along W_j occurs at length L<2^{i+1}, B_i’s Stage B requires at most an additional L−2^i Steps to reach the collision (because the disjointness guarantees B_i traces the same path of W_j as A, and the collision trigger is a revisit to a previously Step-seen image).
  • Therefore B_i’s total Steps until collision are bounded by
    (j−1)·2^{i+1} + 2^i + (L−2^i) = (j−1)·2^{i+1} + L ≤ 2·((j−1)·2^i + L) ≤ 2t.
- Thus B_i detects a collision within at most 2t Steps. ∎

Why this fixes the earlier inconsistency
- The schedule now explicitly permits up to 2^i additional Steps on exactly one walk per start (Stage B); we do not claim a 2^i cap on every walk globally. The analysis charges B_i’s older-walk work as at most twice A’s “older-walk budget” ((j−1)·2^i), and B_i’s W_j work as at most twice A’s work on W_j (L). Hence the 2× factor holds deterministically.
- The process is fixed and label-invariant, does not invoke any backtracking or knowledge of the competitor.

Consequence for epoch assembly (assuming older-first competitor)
- Let q⋆ = RAC(collision,f). Take A⋆ to be a certificate-aided algorithm with E[queries]≤ q⋆. By Markov, Pr[A⋆ finishes within 2q⋆ Steps]≥1/2.
- Using output.md’s bounds, for any 2q⋆-query window, both Pr[skip] and Pr[false-merge] are O(q⋆^2/n) for A⋆, and likewise O(q⋆^2/n) for B_i over a 4q⋆ window. Unioning over O(log n) scales adds a factor of log n. Thus, in one epoch of length 8q⋆ rounds of A_all (O(q⋆ log n) queries), the probability all the needed “good events” (no-skip/no-false-merge for A⋆ and B_i and A⋆ finishing within 2q⋆) hold is at least 1/2 − O((q⋆^2 log n)/n).
- In the low-complexity regime q⋆ ≤ √n / log^α n, this is ≥ 1/2 − O(1/log^{2α−1} n). For any fixed α>1/2 and large n, a single epoch succeeds with constant probability (say ≥1/3), whence E[Queries(A_all)] = O(q⋆ log n).
- Constants: the per-scale multiplicative overhead is 2 in Lemma E′; across scales we pay an additional O(log n) interleaving factor.

New structural lemma toward removing the older-first assumption
To apply Lemma E′ to an arbitrary label-invariant competitor, we need a principled tie-breaking reduction. I propose to use a majorization-style potential and prove it cleanly. Here is the precise claim and a proof blueprint; it can be curated next.

Lemma M (capped-sum majorization under older-first).
- Fix a scale i and consider any (collision-free so far) run with disjoint walks W_1,W_2,… (ordered by start age) and their lengths vector ℓ(t) at time t. Define Φ_i(t) := ∑_{j≥1} min{ℓ_j(t), 2^i} (sum of lengths capped at 2^i, in age order).
- Among all tie-breaking policies that, at a given state, are allowed to extend any walk among those with maximum eligible length, the older-first policy maximizes Φ_i(t) at all times t, pathwise. Formally, if at each tie (equal-length choice below the cap 2^i) we replace a younger choice by the older one, Φ_i never decreases; iterating adjacent exchanges until all ties are resolved older-first yields a process with Φ_i^{old}(t) ≥ Φ_i(t) for all t.
Proof sketch (adjacent-transposition exchange):
- Consider a single step at a state where the set U of eligible walks share the maximal current length L<2^i; pick any two adjacent indices a<b in U. Compare the effects on Φ_i of choosing a vs. choosing b. In either choice, Φ_i increases by exactly 1 at this step (since L<2^i). The difference arises in future steps: by choosing the older index a, we “front-load” a capped unit to an earlier coordinate, which can only increase the partial sums ∑_{j≤k} min{ℓ_j,2^i} for all k≥a, and never decrease them for k<a. Standard majorization/Hardy–Littlewood–Pólya exchange arguments show that a sequence of such local adjacent improvements cannot decrease Φ_i at any future time (the choices below the cap commute and only the order in which capped units hit earlier coordinates matters). Rigorous details will be written with an induction on the number of tie resolutions up to time t and on the number of adjacent transpositions needed to transform any tie-breaking path into the older-first one.
Why useful: For a fixed scale i corresponding to A’s first collision (L∈[2^i,2^{i+1})), having a larger Φ_i at each prefix time implies that by the time A has accrued t Steps, the older-first process has at least as many fully-capped older walks (reaching 2^i) as any other tie-breaker, and at least as much progression on the current walk. This is precisely the resource that B_i consumes (two chunks per start), so older-first is the “hardest” tie-breaker to dominate by B_i. This clears the way to apply Lemma E′ to an arbitrary label-invariant A via a comparison to its older-first variant.

Plan to close the older-first reduction rigorously
- Symmetrization (already curated as Proposition 6): We may assume the competitor is label-invariant for the unlabeled certificate benchmark.
- Tie-breaking reduction: Using Lemma M, for each fixed f and start string r, we can pathwise couple any tie-breaking to the older-first one so that for every t, Φ_i^{old}(t) ≥ Φ_i(t) for all i. Since B_i’s budget up to the index of A’s first collision is an increasing function of Φ_i (by the two-chunk accounting), Lemma E′ applied to the older-first variant yields the same or a better bound than for the original. I will write this formally next: define the stopping time of A’s first collision; show that B_i’s Steps until success are ≤ 2·t_old, and that t_old ≤ C·t for a universal constant C (we aim for C=1 using only tie exchanges; if an equality-in-law proof at ties remains delicate, we can settle for a constant-factor relation via amortized arguments on the potentials).

Sanity checks and small examples
- Adversarial tie-breaking (always extend youngest): our Lemma M predicts this policy minimizes Φ_i and thus makes it easiest for B_i to win relative to A’s budget; older-first is the extremal hard case for the single-scale domination.
- Cycle closure corner case: Under no-false-merge, the only cycle closure that is not a collision (hitting the initial start vertex) does not occur before the first collision; thus Stage A/B halts on a collision (consistent with Lemma 4).

Next steps (concrete curation items)
1) Curate Lemma E′ (statement and proof) into output.md. It is fully formal and consistent with the defined schedule.
2) Curate Lemma M with a complete adjacent-transposition proof. This will justify using older-first in the comparator without loss (or establish it as the hardest tie-breaker to dominate).
3) Assemble the epoch bound: with Lemma E′ and Proposition 6, conclude Theorem (forward-only, low complexity) in the regime q⋆ ≤ √n / log^α n for any α>1/2 (per-epoch failure O((q⋆^2 log n)/n)). Track constants (the single-scale factor is 2, interleaving adds O(log n)).
4) Optional: add a short note that Freedman tails (already curated) can polish constants and allow simultaneous control over all scales within an epoch, but do not change the α-threshold qualitatively.

Potential issues to watch
- Ensure the no-skip event is applied to both A and B_i at the appropriate horizons (2q⋆ and 4q⋆ respectively) and that S,F parameters are set consistently in the permutation-coupling bounds.
- When formalizing Lemma M, specify precisely the filtration and what constitutes a tie (common maximal eligible length below 2^i) and handle adjacent transpositions carefully to preserve the history and the no-false-merge condition.

## Round 0004 — 2025-08-27T18:54:50.268946Z

Round 0004 — Forward-only, low-complexity: fixing the single-scale inconsistency via a two-scale coupling, and an implementable older-first pacing

Summary of gaps in output.md and corrections
- The previously curated single-scale domination (removed from output.md) had an inconsistency: A_i was capped at 2^i per walk but the proof allocated up to 2^{i+1} steps on the colliding walk. This was rightly removed. We now propose a corrected, forward-only comparator that uses two adjacent scales (i and i+1) to effect the needed “second half” of work on the colliding walk. This avoids violating the cap while preserving the O(1) overhead.
- The “older-first w.l.o.g.” claim remains uncurated. We do not need it in a strong form. Instead, we introduce an implementable pacing wrapper B that enforces an “older-first up to 2^i” discipline at most doubling the competitor’s step count. We use B purely as an auxiliary algorithm in the analysis to charge A_all’s (i,i+1)-work to the competitor’s work. We do not change the benchmark RAC nor claim w.l.o.g. for A; B is constructed from A only for analysis and has its own (Las Vegas) execution.
- Symmetrization (Proposition 6) and the skip/false-merge bounds (Lemmas 1–2 and Proposition 7) remain correct and are used as black boxes below.

New ideas and claims (to be curated next)

1) Lemma OF (older-first pacing wrapper; forward-only; deterministic).
- Statement. Fix an instance f:[n]→[n], a (possibly adaptive) algorithm A (e.g., a certificate-aided competitor), a pre-sampled global start sequence r (uniform permutation coupling), and an integer i≥0. Define a wrapper algorithm B=B[A,i] that executes only Start and Step operations on f and satisfies:
  • For any horizon T, if A finds a collision within ≤T total queries (Starts+Steps), then B finds a collision within ≤2T queries.
  • Up to the first moment when any active walk reaches length 2^i (or a collision is found or the walk terminates sooner), B enforces the discipline: whenever A attempts to Step-extend a walk of current length <2^i while there exists an older active walk with current length <2^i, B instead extends such an older walk; immediately after, B performs A’s intended Step. For Starts, B issues the same Start as A (which equals the next element of r under no-skip).
- Proof sketch (checkable, deterministic). B simulates A step-by-step. If A’s intended Step respects the “older-first up to 2^i” rule, B mirrors it; otherwise B first inserts one catch-up Step on an older active walk of current length <2^i, then performs A’s intended Step. Each simulated A-Step triggers either one or two B-Steps; thus if A halts by T queries, B halts by ≤2T queries. B never erases information: by the time B completes the first T simulated A-Steps (interleaved with ≤T catch-ups), it has revealed a superset of the Step images A revealed up to its collision time; any collision witnessed by A is still present for B. The enforced discipline guarantees that, before any walk reaches 2^i (or collision), all older walks are at least as long and thus reach min{2^i, termination} by the time the designated walk reaches 2^i.
- Why useful here. It gives, for analysis purposes, a version of the competitor whose pre-2^i work on older walks is maximally “front-loaded”, enabling a clean resource charging to scale i, at the cost of at most a factor-2 overhead in its total queries. We do not require B to be label-invariant and we do not claim it w.l.o.g.; we use it only to upper bound A_all’s rounds.

2) Lemma TS (two-scale forward-only coupling; resolves the 2^i-cap inconsistency).
- Setup. Fix f, pre-sampled start sequence r, and a certificate-aided competitor A. Let q*:=RAC(collision,f). Let t be the number of Steps used by A up to its first collision in a particular run, and suppose the collision occurs along the j-th started walk W_j at length L∈[2^i,2^{i+1}). Consider the following “good” events: (i) E_noFM(A,2t): A has no false merge within 2t queries; (ii) E_noSK(A,2t): no skip for A within 2t; (iii) E_noFM(A_i,2t) and E_noSK(A_i,2t): no false merges/skips for the single-scale processes A_i up to 2t queries; and similarly for A_{i+1} up to 2t queries. All processes share the same start sequence r.
- Statement. Condition on all the “good” events and on the realization that A’s first collision occurs at scale i with length L∈[2^i,2^{i+1}). Then, running the two scales i and i+1 of A_all in parallel, a collision is deterministically found within at most 2t rounds. Consequently, the total number of queries incurred by A_all up to that time is O(log n)·2t.
- Proof (deterministic, conditioned on the good events).
  • Replace A by its pacing wrapper B=B[A,i]. By Lemma OF, B finds a collision within ≤2t queries and, crucially, enforces that by the time W_j first reaches length 2^i, each older walk W_{j′} with j′<j has length at least min{2^i, termination}.
  • Charge to scale i: To make the future collision visible, it suffices that for every j′<j, the walk W_{j′} is advanced to min{2^i, termination}. Under the enforced discipline, the total number of Steps B has invested on these older walks by the time W_j reaches 2^i is S_i ≤ #Steps_B ≤ 2t.
  • Charge to scale i+1: The colliding walk W_j must be extended by L (its length at A’s collision time). Under the no-skip coupling, A_{i+1} will process W_j as the j-th start and can spend L Steps on it. This requires S_{i+1}:=L Steps (no cap violation because A_{i+1} allows up to 2^{i+1} steps per started walk).
  • Detection mechanism across scales: A_all maintains a global set of Step-seen images I across scales. Conditioning on no false merges, any step that lands in I produces a true collision (Lemma 4). When A_{i+1} advances W_j to length L, one of its Steps lands on an image already revealed earlier by scale i (from some W_{j′}, j′<j), hence a collision is detected.
  • Round bound: The two scales run in parallel, consuming one query per round per active scale. The number of rounds until both budgets finish is at most max{S_i,S_{i+1}} ≤ max{2t, L} ≤ 2t. Hence A_all finds a collision within ≤ 2t rounds, using ≤ 2t·O(log n) queries.
- Why useful here. This fixes the “extra 2^i on W_j” gap by delegating the second half of W_j’s work to scale i+1, while the older-walk prework resides at scale i. The parallelism of A_all converts the sum of per-scale work into the maximum over the two scales, preserving the desired O(t) round bound.

3) Epoch assembly with explicit parameters (forward-only, low complexity)
- Setup. Let q*:=RAC(collision,f). Choose a certificate-aided A with E[Queries]≤q*. By Markov, Pr[T_A≤2q*] ≥ 1/2.
- Good events probabilities.
  • For A over ≤2q* queries: by Lemmas 1–2 (or Proposition 7 for tails), Pr[E_noFM^c ∪ E_noSK^c] = O(q*^2/n).
  • For A_i and A_{i+1} over ≤2·(2q*) queries each (we can round up the per-scale budget to 4q* to be safe): Pr[bad at a fixed scale] = O(q*^2/n). We only need the two scales (i and i+1) corresponding to A’s collision, but a union bound over all O(log n) scales still gives O((q*^2 log n)/n).
- Per-epoch success. In an epoch of R:=8q* rounds of A_all (each round uses O(log n) queries), intersect the events: (i) T_A ≤ 2q*; (ii) no skips/false-merges for A; (iii) no skips/false-merges for the relevant A_i and A_{i+1}. By Lemma TS, conditioned on these, A_all deterministically finds a collision within ≤2·(2q*) ≤ 4q* rounds, so certainly within R rounds. Thus the per-epoch success probability ≥ 1/2 − O((q*^2 log n)/n).
- Expected queries. In the regime q* ≤ √n / log^α n with any fixed α > 1/2, we have (q*^2 log n)/n ≤ 1/ log^{2α−1} n = o(1). Hence a single epoch succeeds with probability at least, say, 1/3 for large n. A geometric bound yields E[Queries(A_all on f)] ≤ C·q*·log n for an absolute C.
- Note on constants and α. Using Proposition 7 (Freedman tails) tightens constants but is not needed to reach α>1/2. The previous conservative α≥1 threshold can be improved to α>1/2 as above.

Examples and sanity checks
- Single long branch: Suppose A’s first collision is at depth L∈[2^i,2^{i+1}). Even if many older walks terminated early, S_i only decreases, and scale i+1’s budget remains L. Parallel rounds ≤ max{S_i,L} ≤ 2t, consistent with Lemma TS.
- Edge case L≈2^i. Then scale i’s and i+1’s budgets are both Θ(2^i). Parallel execution completes in Θ(2^i) rounds, again ≤ 2t by the pacing wrapper.

Why wrappers are acceptable here (addressing prior concern)
- The pacing wrapper B is used only as an auxiliary comparator in the analysis; we do not claim it is w.l.o.g. nor that it preserves A’s transcript. The key pathwise inequality is: if A halts by T Steps, then B halts by ≤2T, revealing a superset of A’s Step images; hence any collision A witnesses appears in B’s run no later than time 2T. This monotonicity is sufficient to upper bound the work that A_all must perform across the two scales to expose the same collision.

What to curate next into output.md
- Lemma OF (older-first pacing wrapper) with a clean, deterministic proof.
- Lemma TS (two-scale forward-only coupling) with the precise conditioning described above and the parallel-rounds accounting, explicitly referencing Lemma 4 (no-false-merge ⇒ true-collision on hitting I) and the no-skip coupling to the shared start sequence r.
- Proposition (Epoch assembly). In the regime RAC ≤ √n / log^α n with α>1/2, A_all achieves E[Queries] ≤ C log n·RAC. This will complete the targeted forward-only, low-complexity theorem.

Optional but beneficial next steps
- Provide a formal, local exchange lemma for the capped potential Φ_i(t)=∑_j min{ℓ_j(t),2^i}: at a tie among equal-length (<2^i) walks, incrementing the oldest weakly increases all prefix sums of Φ_i relative to incrementing a younger one; iterating tie corrections shows Φ_i is maximized by older-first at every time. While not needed given the wrapper approach, it provides a clean structural underpinning if we later aim to reduce to older-first without a wrapper.
- Tighten tail bounds (via Proposition 7) to improve constants and potentially simplify the per-epoch round budget.

Checklist of dependencies and consistency
- Uses curated Lemmas 1–2 (and optionally 7) for skip/false-merge control.
- Uses curated Lemma 4 for collision detection upon hitting a Step-seen image (no false merge).
- Does not rely on the previously removed, inconsistent single-scale lemma.
- Does not assume the stronger, unproven “tie-breaking invariance under conjugacy.”

Potential pitfalls to watch when formalizing
- Be explicit that the two-scale parallel argument counts rounds (max of per-scale budgets), not sum. This is crucial to preserve the O(t) round bound.
- Ensure all no-skip/no-false-merge events are stated for the correct horizons: 2t for A, and 2t (or simply 4q*) for each of A_i and A_{i+1}.
- Clarify that the global image set I is shared across scales within A_all; since only oracle queries count, these set operations are “free” in the query model.

Bottom line
With Lemma OF and the two-scale Lemma TS, we resolve the single-scale cap inconsistency in the forward-only setting by leveraging adjacent scales. Together with the permutation-coupled bounds on skips and false merges and a standard epoch assembly, this yields the target Theorem (forward-only, low complexity) with α>1/2: E[Queries_{A_all}(f)] ≤ C log n·RAC(collision,f). We recommend curating Lemma OF and Lemma TS next, followed by the final theorem statement and its proof.

