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

