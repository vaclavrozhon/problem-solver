Proved statements so far
- Lemma 1 (False merges are rare via permutation coupling). In any forward-only epoch with S Starts and F Steps, the expected number of false merges is at most F·S/(n−F), and hence Pr[at least one false merge] ≤ F·S/(n−F).
- Lemma 2 (Skips are also rare via permutation coupling). In the same epoch, the expected number of skip events is at most F·S/(n−F), and hence Pr[SKIP] ≤ F·S/(n−F).
- Corollary 3 (Uniform O(q^2/n) bound in 2q-query epochs). In any epoch with at most 2q total queries (so S,F≤2q) and q≤n/4, both Pr[at least one false merge] and Pr[SKIP] are O(q^2/n), more precisely ≤ 4q^2/(n−2q).
- Lemma 4 (No-false-merge implies pre-collision disjointness and true-collision detection). Fix any run and any horizon T (counting Step queries). If no false merges occur among the first T Steps, then up to (and excluding) the first collision time: (i) no Step lands on any previously seen vertex; consequently, the active walks are disjoint forward paths; and (ii) whenever a Step does land on a previously seen vertex, that vertex lies in the Step-seen set I_t and this event witnesses a true collision.
- Lemma 5 (Age-monotone length invariant under older-first ties). Consider any run up to the first collision. If ties among equal-length eligible walks are always broken in favor of the smallest start index, then at every time the vector of walk lengths (indexed by start order) is nonincreasing: ℓ_1(t) ≥ ℓ_2(t) ≥ ⋯.
- Proposition 6 (Averaged symmetrization to label-invariant competitors). For any randomized algorithm A and any fixed f:[n]→[n], define A_sym that samples a uniform σ∈S_n at time 0 and simulates A on σ∘f∘σ^{-1}, undoing σ in queries and answers. For any horizon T,
  E[T_hit∧T (A_sym on f)] = E_σ [ E[T_hit∧T (A on σ∘f∘σ^{-1})] ].
  Consequently, for any conjugacy-invariant benchmark (e.g., RAC(collision,f)), the infimum over all algorithms equals the infimum over label-invariant algorithms (those whose decision distributions depend only on the unlabeled state). In particular, there exists a sequence of label-invariant algorithms that attains RAC(collision,f) up to arbitrary ε>0.
- Proposition 7 (Freedman tails for skip/false-merge counts). In an epoch with S Starts and F Steps, let X_false be the number of false merges and X_skip the number of skips. There is a filtration with bounded martingale differences such that, for any λ>0,
  Pr[X_false − E X_false ≥ λ] ≤ exp(−λ^2 / (2(V + λ/3))) and Pr[X_skip − E X_skip ≥ λ] ≤ exp(−λ^2 / (2(V + λ/3))),
  where V ≤ F·S/(n−F) is a deterministic bound on the predictable quadratic variation.

Proofs

Preliminaries and setup. Fix n≥1 and a function f:[n]→[n]. Consider an arbitrary (possibly adaptive) algorithm that issues two types of oracle interactions:
- Start: return a uniformly random vertex from the set of unseen vertices; here “unseen” means not yet returned by any Start and not yet revealed as the image of any Step.
- Step(u): for a previously seen vertex u, reveal y=f(u); now y becomes seen (if it was not already).
Fix an arbitrary epoch (time window) during which exactly S Start operations and F Step operations occur (S,F finite; they may be adapted to the history). Write the Step times as t=1,2,…,F in their chronological order within the epoch. Let I_t denote the set of images revealed by Steps strictly before the t-th Step, and let s_t be the number of Starts that occurred strictly before the t-th Step. Let W_t:=[n]\I_t be the set of vertices that have not yet been revealed as images before Step t.
We use the standard permutation coupling for the Start oracle: sample a uniform random permutation π of [n] at the beginning. At each Start, return the unseen vertex with smallest π-rank. This realizes exactly the uniform new-start rule and yields the following fact.
Fact (Uniform-subset view). Conditional on the history up to just before Step t, in particular on I_t, the set S_t of vertices returned by the s_t Starts so far is distributed as the set of the s_t smallest-π elements of W_t. Equivalently, S_t is uniform among all s_t-subsets of W_t.

Lemma 1 (False merges are rare).
Definition. A false merge at Step t occurs iff the revealed image y_t:=f(u_t) satisfies y_t∉I_t and y_t∈S_t (i.e., it is a newly revealed image that coincides with a previously started vertex).
Claim. E[#false merges in the epoch] ≤ F·S/(n−F). In particular, Pr[at least one false merge] ≤ F·S/(n−F).
Proof. Fix t. Conditional on the history up to Step t, either y_t∈I_t (then the indicator for a false merge at t is 0) or y_t∉I_t (then y_t∈W_t). By the Uniform-subset view, Pr[y_t∈S_t | history] = s_t/|W_t|. Since |W_t| ≥ n−F for all t (at most F images can be revealed in the entire epoch), we have Pr[false merge at t | history] ≤ s_t/(n−F). Taking expectations and summing over t=1,…,F gives E[#false merges] ≤ (1/(n−F))∑_{t=1}^F E[s_t] ≤ F·S/(n−F) because s_t ≤ S. Finally, Pr[#false merges ≥ 1] ≤ E[#false merges]. This bound holds uniformly over f and over the algorithm’s adaptivity. ∎

Lemma 2 (Skips are rare).
Definition. Let r_1,r_2,… be the (random) Start sequence defined by the π-coupling: within the epoch, the j-th Start returns r_j. A skip event occurs at Step t if y_t:=f(u_t) satisfies y_t∉I_t and y_t equals one of the vertices that would be returned by a future Start within the epoch, i.e., y_t∈R_t where R_t is the set of the next S−s_t smallest-π elements of W_t.
Claim. E[#skip events in the epoch] ≤ F·S/(n−F). In particular, Pr[SKIP] ≤ F·S/(n−F).
Proof. Fix t. Conditional on the history up to Step t, if y_t∈I_t the indicator is 0. Otherwise y_t∈W_t. By symmetry of π, the probability that a fixed y_t lies among the next S−s_t smallest-π elements of W_t equals (S−s_t)/|W_t|. Hence Pr[skip at t | history] = (S−s_t)/|W_t| ≤ (S−s_t)/(n−F) ≤ S/(n−F). Taking expectations and summing over t yields E[#skips] ≤ (1/(n−F))∑_{t=1}^F (S−E[s_t]) ≤ F·S/(n−F). Finally, Pr[SKIP] ≤ E[#skips]. This bound is uniform over f and adaptive choices. ∎

Corollary 3 (Bounds for 2q-query epochs).
Suppose an epoch performs at most 2q total queries, so S,F≤2q, and assume q≤n/4 (so n−2q≥n/2>0). Then Lemmas 1 and 2 give Pr[at least one false merge] ≤ 4q^2/(n−2q) ≤ 8q^2/n and Pr[SKIP] ≤ 4q^2/(n−2q) ≤ 8q^2/n. Thus, in the low-complexity regime q≪√n, both events occur with vanishing probability O(q^2/n). ∎

Lemma 4 (No-false-merge ⇒ pre-collision disjointness and true-collision detection).
Proof. Let t be the first time a Step lands on a previously seen vertex v. If v∈S_t\I_t, this is by definition a false merge, which is excluded. Hence v∉S_t\I_t. Since v is previously seen, v∈S_t∪I_t, and thus v∈I_t. When v∈I_t there exists u′, stepped at some earlier time, with f(u′)=v; stepping at time t on some u≠u′ with f(u)=v therefore witnesses a collision. Before time t (or if such a time does not occur), no Step lands on any previously seen vertex, so every Step reveals a new image and all walk prefixes (including across different starts) are disjoint forward paths. ∎

Lemma 5 (Age-monotone invariant under older-first).
Proof. We argue by induction on the number of Steps. Initially, all started walks have length 0 and the claim holds. Suppose just before a Step the lengths satisfy ℓ_1 ≥ ℓ_2 ≥ ⋯ for the already started walks. Let the Step increase ℓ_k by 1. If there exists j<k with ℓ_j=ℓ_k before the step, then by the older-first rule that Step would have been applied to the smallest such j instead of k, a contradiction. Therefore for all j<k we have ℓ_j ≥ ℓ_k+1 before the step, and hence ℓ_j ≥ ℓ_k after the step. For j>k, increasing ℓ_k by 1 cannot violate ℓ_k ≥ ℓ_j. Starting a new walk appends a 0 at the end, which preserves nonincreasing order. Thus the invariant holds at all times up to the first collision. ∎

Proposition 6 (Averaged symmetrization to label-invariant competitors).
Proof. By construction of A_sym, when run on f it samples σ uniformly and simulates A on σ∘f∘σ^{-1}, undoing σ on queries/answers. Therefore T_hit∧T(A_sym on f) has the same law as T_hit∧T(A on σ∘f∘σ^{-1}) under the product measure over σ and the internal randomness of A. Taking expectations yields the identity. For the benchmark consequence, note that RAC is invariant under conjugation: RAC(collision,σ∘f∘σ^{-1})=RAC(collision,f) for all σ. Averaging any algorithm A over σ yields a label-invariant algorithm A′ with E[T_hit(A′ on f)] = E_σ E[T_hit(A on σ∘f∘σ^{-1})]. Taking infima proves that the infimum over all algorithms equals the infimum over label-invariant ones, and there exists a sequence of label-invariant algorithms approaching RAC(collision,f). ∎

Proposition 7 (Freedman tails for skip/false-merge counts).
Proof. Reveal the process step by step and let F_t be the sigma-field just before Step t. For false merges, define ξ_t:=1{false merge at t}. Then E[ξ_t | F_t] = p_t with p_t ≤ s_t/|W_t| ≤ S/(n−F) (deterministically). Let D_t := ξ_t − p_t. Then (D_t) is a martingale difference sequence with |D_t| ≤ 1 and conditional variance Var(D_t | F_t) ≤ p_t(1−p_t) ≤ p_t. The predictable quadratic variation V := ∑_{t=1}^F Var(D_t | F_t) satisfies V ≤ ∑_{t=1}^F p_t ≤ F·S/(n−F). By Freedman’s inequality for martingales with bounded increments (|D_t|≤1), for any λ>0,
  Pr[∑_{t=1}^F D_t ≥ λ] ≤ exp(−λ^2/(2(V+λ/3))).
Since X_false = ∑ ξ_t = ∑ p_t + ∑ D_t, we have Pr[X_false − E X_false ≥ λ] ≤ exp(−λ^2/(2(V+λ/3))). The argument for X_skip is identical, using p_t = (S−s_t)/|W_t| ≤ S/(n−F). ∎

Remarks.
- Lemma 6 from the previous version (single-scale domination under older-first) has been removed due to a definition/proof inconsistency (the schedule capped each walk at 2^i steps but the proof implicitly allocated up to 2^{i+1}−1 steps on one walk). A corrected comparator lemma will be added once the schedule and proof are fully aligned.
- The above results are uniform over f and algorithmic adaptivity. The permutation coupling also supports refined concentration with Freedman tails (Proposition 7), which can be used for tighter constants or simultaneous control across scales.
