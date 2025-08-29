Main theorems proved in this file
- Light-cone localization and r-non-signaling for r-round LOCAL algorithms (with or without initial entanglement).
- Independence beyond 2r for two-way r-round LOCAL algorithms with product initial states (no shared entanglement).
- Exponential amplification without entanglement given a segment-level bound q(r,k) < 1.
- Automorphism-covariant interior placement invariance within fixed geometry classes.
- Segment LP with geometry-aware interior invariance; structural lemmas: monotonicity in k, monotonicity in r, extreme-point optimality.
- Constant-error bound with entanglement under automorphism invariance.

Preliminaries
Let G = (V, E) be a graph (cycles are of primary interest). An r-round quantum LOCAL algorithm consists of r synchronous layers of local channels acting on vertex/edge registers, followed by local measurements at the vertices that output colors in {1,2,3}. Each round is modeled as a product of CPTP maps localized on vertices/edges (purifiable to local unitaries by Stinespring dilation). For S ⊆ V, let N_r(S) = {v ∈ V : dist(v, S) ≤ r} denote the r-neighborhood of S.

Theorem 1 (Light-cone localization and r-non-signaling)
Fix an r-round quantum LOCAL algorithm. Let S ⊆ V, and let M_S be any POVM element that depends only on the final local measurements in S. Then there exists a positive operator X_S supported only on the registers associated with N_r(S) (and ancillas therein) such that, for every initial global state ρ (possibly entangled), the probability of M_S is Tr[ρ X_S]. Consequently, if two initial states ρ and ρ′ agree on N_r(S), then the output marginal on S is the same under ρ and ρ′.

Proof sketch (standard): Purify to a depth-r circuit of local unitaries. In the Heisenberg picture, conjugating M_S backward through each round enlarges its support by at most one graph hop. After r rounds, the evolved effect X_S is supported on N_r(S). For any ρ, P[M_S] = Tr[ρ X_S]. If ρ and ρ′ coincide on N_r(S), then Tr[ρ X_S] = Tr[ρ′ X_S].

Theorem 2 (Independence beyond 2r without initial entanglement)
Assume the initial state is a product across vertices, ρ = ⊗_{v∈V} ρ_v. Let S_1, …, S_m ⊆ V have pairwise disjoint r-neighborhoods (equivalently, dist(S_i, S_j) > 2r for i ≠ j). For each i, let M_{S_i} be any event depending only on measurements in S_i, and let X_{S_i} be its Heisenberg-evolved effect from Theorem 1. Then the random outcomes on S_1, …, S_m are mutually independent; in particular,
Tr[ρ X_{S_1} ⋯ X_{S_m}] = ∏_{i=1}^m Tr[ρ_{N_r(S_i)} X_{S_i}].

Proof: Each X_{S_i} acts only on N_r(S_i); these supports are disjoint, and ρ factors across them. The trace of the product factors, which is precisely independence.

Corollary 3 (Exponential amplification without entanglement)
Let r ≥ 1. Fix k ≥ 1 and suppose there exists q < 1 such that, for every distribution on a length-k path segment that satisfies the LP constraints in Definition 6 (below), the probability the segment is internally proper is at most q. Then, for any r-round two-way quantum LOCAL algorithm on the n-cycle with product initial state, the success probability satisfies
P_success(C_n) ≤ q^{⌊n / (k + 2r)⌋}.

Proof: Partition the cycle into m = ⌊n / (k + 2r)⌋ disjoint windows of length k separated by gaps of size 2r. If the cycle is proper, each window is internally proper. Let E_i be “window i is internally proper,” and X_i its Heisenberg-evolved effect. Supports N_r(W_i) are disjoint, so E_i are independent by Theorem 2. By the segment-level bound, P[E_i] ≤ q. Hence P_success(C_n) ≤ ∏_i P[E_i] ≤ q^m.

Remark 4 (Necessity of the 2r separation)
For r = 1 on a path 0–1–2, one round suffices for node 1 to correlate nodes 0 and 2 (e.g., by broadcasting a private random bit), so outputs at distance 2 need not be independent. Thus 2r is tight in general.

Lemma 5 (Automorphism-covariant interior placement invariance for fixed geometries)
Fix an r-round uniform quantum LOCAL algorithm on a cycle C_n, with initial global state ρ_0. Let W ⊆ C_n be any contiguous window of length k. Consider t cores with lengths s = (s_1,…,s_t), and let δ = (δ_1,…,δ_{t−1}) be nonnegative integers encoding the inter-core gaps (δ_j is the number of vertices strictly between core j and core j+1). Let ω and ω′ be two r-gapped placements of (s, δ) inside W (i.e., all r-buffers lie in W and δ_j ≥ 2r). Assume ρ_0 is invariant under the rotations of C_n (reflections as well if the model is reflection-invariant). Then, for every core assignment ζ, the probability that the outputs on the cores equal ζ is the same for ω and ω′.

Proof: Let U_ω ⊆ W and U_{ω′} ⊆ W be the unions of the r-neighborhoods of the cores. Because ω and ω′ have the same geometry (s, δ), there exists a rotation (and possibly a reflection) π of C_n mapping U_ω to U_{ω′} and carrying each core in ω to the corresponding core in ω′. By Theorem 1, there exist positive operators X_ω and X_{ω′} supported on U_ω and U_{ω′} giving the core-event probabilities as Tr[ρ_0 X_ω] and Tr[ρ_0 X_{ω′}]. Uniformity implies covariance under π: X_{ω′} = U_π X_ω U_π^†. Since ρ_0 is invariant under π, Tr[ρ_0 X_{ω′}] = Tr[ρ_0 X_ω].

Definition 6 (Segment LP with geometry-aware interior invariance)
Fix Σ = {1,2,3}, r ≥ 1, k ≥ 1. A geometry is a pair (s, δ) with s = (s_1,…,s_t) positive integers and δ = (δ_1,…,δ_{t−1}) nonnegative integers. An r-gapped placement ω of (s, δ) inside [1..k] is a t-tuple of start positions (ω_1 < ⋯ < ω_t) such that each core C_j = [ω_j .. ω_j + s_j − 1] has its r-buffer C_j^{(+r)} = [ω_j − r .. ω_j + s_j − 1 + r] contained in [1..k], these r-buffers are pairwise disjoint, and ω_{j+1} = ω_j + s_j + δ_j. The variables are p_ψ for ψ ∈ Σ^k, with p_ψ ≥ 0 and ∑_ψ p_ψ = 1. The objective is to maximize ∑_ψ p_ψ · 1{ψ has no equal-color adjacencies on edges (i,i+1), i = 1..k−1}. The constraints enforce interior placement invariance within fixed geometries: for every geometry (s, δ), every core assignment ζ, and every two r-gapped placements ω, ω′ of (s, δ) inside [1..k], the marginal ∑_{ψ: ∀j ψ|_{C_j(ω)} = ζ_j} p_ψ equals ∑_{ψ: ∀j ψ|_{C_j(ω′)} = ζ_j} p_ψ. Denote the optimum by q(r,k).

Remark 6.1 (Soundness regimes and symmetry)
These equality constraints are necessary for r-round uniform algorithms under either of the following assumptions: (i) product initial states with identical local marginals (⊗_v ρ; rotation-invariant), or (ii) arbitrary shared entanglement provided the initial global state is invariant under the rotations of the cycle (reflections as well if the model is reflection-invariant). Without such symmetry in the initial state, the constraints need not hold across placements, even within the same window.

Lemma 7 (Monotonicity in k)
For all r ≥ 1 and k ≥ 1, q(r,k+1) ≤ q(r,k).

Proof: Let p be feasible for (r,k+1). Its marginal p′ on the first k coordinates satisfies all geometry-aware invariance constraints for (r,k): any placement inside [1..k] remains a placement inside [1..k+1], and equalities are preserved under marginalization. Moreover 1{proper on k+1} ≤ 1{proper on first k} pointwise, hence ∑_ψ p_ψ·1{proper on k+1} ≤ ∑_{ψ′} p′_{ψ′}·1{proper on k}. Taking suprema over feasible p proves the claim.

Lemma 8 (Monotonicity in r)
For all r ≥ 1 and k ≥ 1, q(r+1,k) ≥ q(r,k).

Proof: As r increases to r+1, the set of admissible placements (and hence the set of equality constraints) for any geometry (s, δ) weakens: some placements cease to be admissible because r-buffers no longer fit or become non-disjoint. Therefore the feasible set enlarges, and the supremum cannot decrease.

Lemma 9 (Extreme-point optimality)
For each fixed (r,k), the feasible region of Definition 6 is a nonempty polytope in R^{3^k} defined by linear equalities, nonnegativity, and normalization. Hence an optimal solution exists and can be taken at an extreme point (basic feasible solution).

Proof: Nonemptiness follows from the uniform distribution p_ψ = 3^{-k}, which satisfies all equality constraints. Boundedness follows from nonnegativity and normalization. Linear programming theory guarantees that a maximum exists and is achieved at an extreme point of the polytope.

Corollary 10 (Constant-error bound with entanglement under automorphism invariance)
Let r ≥ 1 and k ≥ 1, and let q(r,k) be as in Definition 6. Consider any r-round uniform quantum LOCAL algorithm on C_n whose initial global state is invariant under the rotations of the cycle. Then, for all n ≥ k, the success probability obeys P_success(C_n) ≤ q(r,k).

Proof: Fix any contiguous window W ⊆ C_n of length k. If the cycle is properly colored, then W is internally proper. By Lemma 5, the distribution on W (restricted to events supported on geometry-aware r-buffered placements) satisfies the invariance constraints of Definition 6. Therefore it is feasible for the LP, and the probability that W is internally proper is at most q(r,k). Since {cycle proper} ⊆ {W proper}, P_success(C_n) ≤ q(r,k). (Necessity of the symmetry assumption is illustrated by the EPR counterexample in the notes.)
Proposition 11 (Trivialization of the segment LP under Definition 6)
For every r ≥ 1 and k ≥ 1, the optimum q(r,k) in Definition 6 satisfies q(r,k) = 1.

Proof.
Let Σ = {1,2,3}. Consider the order-1 Markov chain (X_t) with stationary distribution u(i) = 1/3 for i∈Σ and transition matrix P with P(i,i)=0 and P(i,j)=1/2 for j≠i. For k ≥ 1, define a distribution p on Σ^k by drawing (X_1,…,X_k) according to X_1 ∼ u and X_{t+1} | X_t ∼ P.

(i) Objective value. Because P(i,i)=0, adjacent colors are never equal: P[X_t = X_{t+1}] = 0 for all t. Therefore p assigns probability 1 to the event “ψ has no equal-color adjacencies on edges (t,t+1), t=1..k−1,” and the objective equals 1.

(ii) Feasibility (geometry-aware interior invariance). Since u is stationary for P, the process (X_t) is strictly stationary. Fix any geometry (s,δ) and two r-gapped placements ω, ω′ of (s,δ) inside [1..k]. Let C(ω) ⊆ {1,…,k} be the ordered list of core indices of ω (similarly C(ω′)). Because ω and ω′ have the same (s,δ), there exists an integer shift τ such that C(ω′) = C(ω) + τ (coordinatewise). Strict stationarity implies that the joint law of (X_i)_{i∈C(ω)} equals the joint law of (X_{i+τ})_{i∈C(ω)} = (X_j)_{j∈C(ω′)}. Hence for every core assignment ζ, the marginal probability that the cores equal ζ is the same for ω and ω′. Nonnegativity and normalization of p are immediate. Thus p is feasible with objective value 1, and so q(r,k) ≥ 1. Since the objective is at most 1 for all feasible p, q(r,k)=1.

Corollary 12 (No segment-LP constant-error bound in two-way under Definition 6)
Under Definition 6, the segment LP cannot certify any nontrivial bound for two-way algorithms: for all r,k we have q(r,k)=1. Consequently, Corollary 10 specializes to the trivial inequality P_success(C_n) ≤ 1 in the entanglement-allowed regime and gives no constant-error lower bound.

Remark 12.1 (Scope). Proposition 11 does not contradict the soundness of the constraints in Definition 6 for actual r-round algorithms under the symmetry assumptions of Remark 6.1; it shows that these constraints alone are insufficient. To obtain nontrivial upper bounds in the product-state regime, independence across sets with disjoint r-neighborhoods (>2r separation) must be incorporated, which is nonlinear (factorization). In the entanglement-allowed regime, no such independence holds, so segment-based linear constraints of this form cannot lead to q<1.
New results appended

Proposition 13 (Pair-equality identity at large separation in the product-state regime)
Assume no initial entanglement (product initial state). Let r ≥ 1, and let i, j be two vertices in a path segment whose r-neighborhoods are disjoint (equivalently, |i − j| ≥ 2r + 1). Then, for any r-round two-way LOCAL algorithm, the equality probability satisfies
  P[X_i = X_j] = ∑_{a∈{1,2,3}} P[X_i = a] · P[X_j = a].
In particular, if the single-site marginals at i and j are uniform (P[X_i = a] = P[X_j = a] = 1/3 for all a), then P[X_i = X_j] = 1/3.

Proof.
By Theorem 2 in this file, the outcomes on {i} and {j} are independent because their r-neighborhoods are disjoint. Hence, for any a, b,
  P[X_i = a, X_j = b] = P[X_i = a] P[X_j = b].
Summing over a = b gives the displayed identity. If the marginals are uniform, the sum is 3 · (1/3) · (1/3) = 1/3.

Lemma 14 (Two-point correlation for the 3-state no-self-loop chain)
Let Σ = {1,2,3}. Consider the stationary order-1 Markov chain (X_t) with stationary distribution u(i) = 1/3 and transition probabilities P(i,i) = 0, P(i,j) = 1/2 for j ≠ i. Then for all integers d ≥ 1,
  P[X_t = X_{t+d}] = 1/3 + (2/3)(−1/2)^d.

Proof.
The transition matrix P has eigenvalues 1 and −1/2 (with multiplicity 2). Diagonalizing P gives, for i ≠ j,
  P^d(i,i) = 1/3 + (2/3)(−1/2)^d,   P^d(i,j) = 1/3 − (1/3)(−1/2)^d.
Under the stationary initial law u, we have
  P[X_t = X_{t+d}] = ∑_{i} u(i) P^d(i,i) = (1/3) · 3 · [1/3 + (2/3)(−1/2)^d] = 1/3 + (2/3)(−1/2)^d.
This equals 0 at d = 1 and tends monotonically to 1/3 in absolute value with rate (1/2)^d.

Corollary 15 (Markov-chain witness violates the pair-equality identity)
For the chain in Lemma 14 and every d ≥ 1,
  P[X_t = X_{t+d}] ≠ 1/3.
Therefore, for any r ≥ 1 and any δ ≥ 2r + 1, the Markov-chain distributions used in Proposition 11 cannot satisfy the pair-equality identity of Proposition 13 at separation δ (in particular, they cannot satisfy the specialized form P_equal = 1/3 under uniform single-site marginals).

Remark.
Proposition 13 provides a sound linear identity (after imposing uniform marginals) that must be satisfied by any product-state strategy at separations ≥ 2r + 1. Lemma 14 certifies that the order-1 Markov-chain witness (which trivializes the base LP) is excluded as soon as these independence-driven identities are enforced.
Proposition 16 (Single-block reduction for product-state outputs, general r)
Fix r ≥ 1 and alphabet Σ = {1,2,3}. Let L := 2r + 2. Consider a uniform r-round LOCAL algorithm on a cycle C_n with product initial state ⊗_{v∈V} ρ (identical local marginals). Let (X_t)_{t∈ℤ/nℤ} be the output colors. Define t ∈ Δ(Σ^L) to be the common distribution of any contiguous L-block (X_i,…,X_{i+L−1}); by rotation invariance this is well defined. Then t satisfies:
(i) Nonnegativity and normalization: t(ζ) ≥ 0 and ∑_ζ t(ζ) = 1.
(ii) Shift-consistency: For all α ∈ Σ^{L−1}, letting M_1(α) = ∑_{ζ: ζ_1..ζ_{L−1}=α} t(ζ) and M_2(α) = ∑_{ζ: ζ_2..ζ_L=α} t(ζ), we have M_1(α) = M_2(α).
(iii) Perfect properness on the L − 1 interior edges, whenever it holds in the algorithm: If the algorithm achieves P[ζ_j ≠ ζ_{j+1} for all j = 1,…,L−1] = 1 on contiguous L-blocks, then t(ζ) = 0 for every ζ with ζ_j = ζ_{j+1} for some j ∈ {1,…,L−1}.
(iv) Lag-(2r+1) pair-independence at the block ends: Let m(a) = ∑_{ζ: ζ_1=a} t(ζ) and p(a,b) = ∑_{ζ: ζ_1=a, ζ_L=b} t(ζ). Then, for all a,b ∈ Σ, p(a,b) = m(a) m(b).

Proof.
- (i) is immediate.
- (ii) Rotation invariance (strict stationarity) of (X_t) implies the (L−1)-block marginals are equal when shifted by one, i.e., M_1(α) = M_2(α).
- (iii) If P[ζ_j ≠ ζ_{j+1} for all j] = 1 on contiguous L-blocks, then for each fixed j, P[ζ_j = ζ_{j+1}] = 0, which means ∑_{ζ: ζ_j = ζ_{j+1}} t(ζ) = 0. Hence t has support only on internally proper words.
- (iv) For any i, the r-neighborhoods of {i} and {i + (2r+1)} are disjoint. By Theorem 2 (independence beyond 2r in the product-state regime), X_i and X_{i + (2r+1)} are independent. Therefore, for all a,b, P[X_i=a, X_{i+(2r+1)}=b] = P[X_i=a] P[X_{i+(2r+1)}=b]. Identifying t’s (1,L) marginal with this pair law (by stationarity) gives p(a,b) = m(a)m(b).

Remark 16.1 (Color symmetry is not w.l.o.g. under independence constraints)
Averaging a feasible strategy by a random global color permutation can destroy unconditional independence across distant sets. Hence one should not impose color-symmetry constraints in models that also enforce independence equalities, unless admissibility is proved separately.

Lemma 17 (Kolmogorov/Markov extension from shift-consistent L-block marginals)
Let L ≥ 2 and Σ finite. Suppose t ∈ Δ(Σ^L) satisfies nonnegativity, normalization, and the shift-consistency equalities M_1(α) = M_2(α) for all α ∈ Σ^{L−1}. Then there exists a strictly stationary process (X_t)_{t∈ℤ} on Σ whose L-block marginal equals t. Moreover, the process can be taken to be a stationary Markov chain of order L−1 on the state space Σ^{L−1}.

Proof.
Define weights on (L−1)-blocks by μ(α) := M_1(α) = M_2(α). For any pair of (L−1)-blocks α,β that overlap on L−2 symbols (i.e., α_2..α_{L−1} = β_1..β_{L−2}), define a transition probability K(α→β) by
  K(α→β) := t(ζ) / μ(α),
where ζ ∈ Σ^L is the unique concatenation with ζ_1..ζ_{L−1} = α, ζ_2..ζ_L = β. If μ(α) = 0, leave K(α→·) arbitrary (those states are transient). Shift-consistency implies ∑_{β} K(α→β) = 1 and stationarity of μ: ∑_{α} μ(α) K(α→β) = μ(β). Hence μ is a stationary distribution for the order-(L−1) Markov chain on Σ^{L−1} with kernel K. Let (Y_t) be this chain at stationarity and set X_t := (Y_t)_{L−1} (the last symbol). One checks directly that (X_t,…,X_{t+L−1}) has law t for every t, yielding a strictly stationary process with the desired L-block marginal.

Corollary 18 (Implication of MIQCP infeasibility for r = 2)
Let r = 2 and L = 6. Consider the MIQCP that seeks t ∈ Δ(Σ^6) satisfying the linear constraints of Proposition 16 (i)–(iii) and the bilinear lag-5 independence equalities (iv). If this MIQCP is infeasible, then no uniform 2-round LOCAL algorithm with product initial state can achieve P[all 5 interior edges of a contiguous 6-block are proper] = 1 on the cycle. Consequently, there exists q < 1 and k ≥ 6 such that the success probability on C_n obeys P_success(C_n) ≤ q^{⌊n/(k+2r)⌋} by Corollary 3 (exponential amplification without entanglement).

Proof.
If an algorithm achieved perfect interior properness with probability 1 on contiguous 6-blocks, Proposition 16 would produce a feasible t, contradicting infeasibility. The amplification claim then follows from Corollary 3 once any finite k and q < 1 are certified (e.g., by optimizing the same constraints or by extending the infeasibility to a slightly larger window that yields an explicit q).
Addendum 18.A (Quantitative variant and correction to Corollary 18)

Definition 19 (Quantitative 6-block optimum for r = 2).
Let Σ = {1,2,3}. Define q_6 to be the maximum of the interior-properness indicator on a 6-block under the constraints of Proposition 16(i), (ii), and (iv):
  q_6 := max_{t ∈ Δ(Σ^6)} ∑_{ζ ∈ Σ^6} t(ζ) · 1{ζ_j ≠ ζ_{j+1} for j = 1,…,5}
subject to
  (i) t ≥ 0 and ∑_ζ t(ζ) = 1,
  (ii) 5-block shift-consistency: M_1(α) = M_2(α) for all α ∈ Σ^5,
  (iv) lag-5 independence: for all a,b ∈ Σ, ∑_{ζ: ζ_1=a, ζ_6=b} t(ζ) = (∑_{ζ: ζ_1=a} t(ζ)) (∑_{ζ: ζ_1=b} t(ζ)).

Corollary 20 (Amplification via q_6).
In the product-state regime (no shared entanglement) with r = 2, every 2-round uniform LOCAL algorithm on C_n satisfies, for all n ≥ 6,
  P_success(C_n) ≤ q_6^{⌊n/(6 + 2r)⌋} = q_6^{⌊n/10⌋}.
In particular, if q_6 < 1 (as certified by solving the optimization above), we obtain an exponential-in-n upper bound.

Proof.
Let t be the 6-block marginal of the algorithm’s output process. By Proposition 16, t satisfies (i), (ii), and (iv). Therefore, the probability that a contiguous 6-block is internally proper is at most q_6 by definition. Partition C_n into ⌊n/10⌋ disjoint windows of length 6 separated by gaps of size 2r = 4; by Theorem 2 these window events are independent. Applying Corollary 3 with k = 6 yields the claim.

Corollary 21 (Support restriction for the feasibility-at-1 test at r = 2, L = 6).
In the feasibility test for perfect interior properness on a 6-block (objective value 1), the search over t ∈ Δ(Σ^6) can be restricted to the 96 proper 6-words (those with ζ_j ≠ ζ_{j+1} for j = 1,…,5) without loss of generality.

Proof.
If an algorithm achieves probability 1 of interior properness, then Proposition 16(iii) implies t(ζ) = 0 whenever ζ has an equal adjacent pair. Hence any feasible t must be supported on proper words.

Lemma 22 (Uniqueness of a disjoint pair in a 6-block for r = 2).
Let r = 2 and consider positions {1,…,6} on a line. For i < j, the r-neighborhoods N_r({i}) ∩ [1..6] and N_r({j}) ∩ [1..6] are disjoint if and only if {i, j} = {1, 6}.

Proof.
For boundary indices, N_2({1}) = {1,2,3} and N_2({6}) = {4,5,6}, which are disjoint. For any other pair 1 ≤ i < j ≤ 6, we have j − i ≤ 4. Then N_2({i}) contains i, i+1, i+2 and N_2({j}) contains j, j−1, j−2; these sets overlap because i+2 ≥ j−2 whenever j − i ≤ 4. Thus only {1,6} yields disjoint neighborhoods.

Remark 22.1 (L = 7).
For r = 2 and a 7-block, the r-neighborhoods of (1,6) and (1,7) are disjoint, so both pairs can be enforced as independent via bilinear constraints. The pair (2,7) is redundant given shift-consistency and the (1,6) constraints (it corresponds to the same relative pair inside the shifted 6-block (2..7)).