Scope and goal
We seek lower bounds for 2–3 round quantum LOCAL algorithms that 3-color an n-cycle. We separate two resource regimes: (i) no initial shared entanglement (initial product state across vertices), and (ii) arbitrary initial shared entanglement. Our strategy follows and extends Le Gall–Rosmanis (LGR, 2022): reduce to a line-segment optimization under r-local non-signaling constraints, then lift to cycles. Two technical pillars are (A) light-cone localization of measurements in r rounds (implying r-non-signaling), and (B) independence across well-separated regions when the initial state is a product.

Key corrections/new facts
- Independence threshold is 2r, not r, in the two-way model without entanglement. After reversing r communication layers, any measurement on a block depends only on the block’s r-neighborhood. Thus independence of multiple blocks requires their r-neighborhoods to be disjoint, i.e., pairwise distances > 2r. Counterexample to “> r” for r = 1: on a path 0–1–2, one round suffices for node 1 to broadcast a private random bit to nodes 0 and 2, correlating their outputs at distance 2.
- Non-signaling beyond r holds with or without shared entanglement: the marginal on a set S depends only on the initial state on N_r(S). This follows from Heisenberg-picture localization of effects under depth-r local circuits/channels.

Amplification templates
- No entanglement (product initial state): If there exists k and q < 1 such that every r-non-signaling distribution on a length-k segment makes the segment proper with probability at most q, then on cycles C_n the success probability is at most q^{⌊n/(k+2r)⌋}. Partition C_n into ⌊n/(k+2r)⌋ disjoint windows of length k separated by gaps of size 2r; window events are independent by the 2r-separation lemma; ring proper implies all windows are proper.
- With entanglement allowed: For any fixed window W of length k, ring proper implies W is proper. The distribution on W (restricted to placements with r-buffers inside W) is feasible for the r-non-signaling LP, hence P[ring proper] ≤ P[W proper] ≤ q. There is no improvement from packing without independence; the optimal general bound is the n-independent constant q.

LP plan for r = 2, 3
- Variables: probabilities over colorings on r-gapped placements (collections of frames) inside [1..k]. Placements include cores and r-buffers fully contained in [1..k].
- Constraints: non-signaling equalities enforcing that the marginal distribution on a given core is independent of the surrounding placement context as long as r-buffers are intact (equalities of marginals across placements that agree on the core).
- Objective: maximize P[all k − 1 edges inside [1..k] are properly 3-colored].
- Symmetries: quotient by S3 color permutations; translations (and reflections, if used). It is safe (as a relaxation) to enforce only a generating set of non-signaling constraints; for the final certificate, include all placements that respect the segment.
- Execution: sweep k ≈ 10–16 for r = 2 (then smaller k for r = 3), solve numerically, and extract dual certificates for any instance with optimum < 1.

What remains to be computed
- A concrete (r, k, q) with q < 1 via the LP. Once obtained, immediately plug into the amplification templates above. Note the stride is k + 2r (not k + r) in the independence-based exponential bound.

Reference counterexample (to avoid regression)
- Two-way, r = 1, no entanglement: path 0–1–2. Node 1 samples b ∈ {0,1}, sends b to 0 and 2, both output b. Outputs at distance 2 are perfectly correlated; independence beyond r = 1 fails. Independence holds only when r-neighborhoods are disjoint (distance > 2r).
Additional clarifications and refinements

1) Interior placement invariance: correct assumptions and a counterexample
- Valid regimes. For an r-round uniform LOCAL algorithm on a cycle C_n, invariance of interior placements (i.e., equality of core marginals for all gap-r placements whose r-buffers lie within a window W) holds under either of the following assumptions:
  (a) No shared entanglement and identical local initial states (product initial state ⊗_v ρ, with the same ρ at every vertex).
  (b) Shared entanglement is allowed, but the global initial state ρ_0 is invariant under the automorphisms of C_n (rotations and reflections). Uniformity of the local channels across vertices is also required.
- Why. In the Heisenberg picture, the effect for a core event depends only on the union of r-neighborhoods of the cores. Two interior placements of the same frame family induce isomorphic unions; the corresponding effects are related by a permutation of registers. If ρ_0 is invariant under that permutation (true in (a) and (b)), the probabilities coincide.
- Necessity of the symmetry assumption with entanglement. Without (b), the statement can fail. Counterexample (r = 0): prepare EPR pairs on disjoint edges (1,2), (3,4), … around the cycle, and have each vertex measure Z and output a color that is a function of its bit. Then the joint distribution on two adjacent cores depends on whether the placement coincides with a paired edge (correlated) or straddles a pair boundary (independent). Hence, equality across placements fails.

2) Segment LP (precise, and what it models)
- Alphabet Σ = {1,2,3}. Fix r ≥ 1 and k ≥ 1. Let a frame family F = ({{s_1}}, …, {{s_t}}), each {{s_j}} a contiguous core of length s_j.
- An r-gapped placement ω of F inside [1..k] is a t-tuple of start positions (ω_1,…,ω_t) such that the r-buffers [[ω_j − r .. ω_j + s_j − 1 + r]] are subsets of [1..k] and pairwise disjoint. The cores are C_j = [[ω_j .. ω_j + s_j − 1]].
- Variables: p_ψ for ψ ∈ Σ^k, with p_ψ ≥ 0 and ∑_ψ p_ψ = 1.
- Objective: maximize ∑_ψ p_ψ · 1{ψ has no equal-color adjacencies on edges (i, i+1), i = 1..k−1}.
- Constraints (interior placement invariance): For every family F and every core assignment ζ = (ζ_1,…,ζ_t), the marginal probability ∑_{ψ: ∀j ψ|_{C_j} = ζ_j} p_ψ is the same for all gap-r placements ω of F (whose r-buffers lie in [1..k]).
- Soundness: These constraints are necessary for distributions induced by r-round uniform algorithms in regimes (1a) or (1b). Dropping some equalities yields a relaxation (weaker constraints and thus a larger feasible set); any optimum < 1 for a relaxation implies the true optimum < 1 as well.

3) Monotonicity in segment length
Let q(r,k) denote the LP optimum at parameters (r,k) as above. Then q(r,k+1) ≤ q(r,k). Proof idea: Any feasible distribution on Σ^{k+1} marginalizes to a feasible distribution on Σ^k (equalities on interior placements survive marginalization), and 1{proper on k+1} ≤ 1{proper on first k} pointwise.

4) Why a point mass on a proper coloring violates the constraints
Under the single-core placement-invariance constraints, the distribution of s-blocks (e.g., s ∈ {1,2}) must be identical for all interior positions. A point mass on a single proper ψ has position-dependent s-blocks unless ψ is constant (impossible if ψ is proper). Hence a Dirac mass cannot be feasible—this is a useful solver sanity check.

5) Amplification stride and regimes
- No entanglement (product initial state): independence requires gaps of size 2r (not r). The exponential amplification stride is k + 2r. This is tight in general (see r = 1 path 0–1–2 counterexample).
- With entanglement: constant-error bounds via the LP above are valid if the initial shared state is automorphism-invariant; without that symmetry, the placement-equality constraints need not hold (cf. the counterexample in item 1).

6) Computational plan (r = 2)
- Variables: p_ψ, ψ ∈ Σ^k. For k = 10, |Σ^k| = 59,049; for k = 12, |Σ^k| = 531,441.
- Symmetry/useful reductions: quotient by S_3 (color permutations) and reflection; treat translation of placements via equality constraints.
- Constraints to start with: all single-core families with s ∈ {1,2,3}; then add two-core families (1,1), (2,1), (2,2) at several separations, over all interior placements.
- Certification: if optimum < 1, extract a dual certificate (constraint multipliers) that verifies the bound.
Important correction: geometry-aware interior placement invariance
- The equalities we enforce must respect automorphism classes of placements. Two placements of t cores are guaranteed to have equal core marginals only if they are related by a cycle automorphism (rotation; reflection only if the model is reflection-invariant). Equating placements with different inter-core distances is not justified by light-cone localization plus uniformity.
- Minimal counterexample (r = 0, entangled, rotation-invariant): let ρ0 be the 1/2-mixture of the two perfect matchings of EPR pairs around the cycle. Adjacent vertices have Z-correlations (EPR half the time); vertices at distance 2 are uncorrelated. Thus, two singleton cores at distance 1 vs distance 2 have different joint marginals, defeating geometry-agnostic equality constraints.
- Fix: Parameterize multi-core constraints by geometry (core lengths s = (s1,…,st) and inter-core gaps δ = (δ1,…,δt−1), where δj is the number of vertices between cores j and j+1). Require equality only across translations inside [1..k] (and optionally reflections) for the same (s, δ), with the additional admissibility condition δj ≥ 2r ensuring disjoint r-buffers.

Monotonicity in r (new)
- Let q(r,k) be the (revised, geometry-aware) LP optimum. Then q(r+1,k) ≥ q(r,k). Reason: when r increases, fewer placements are admissible, so fewer equalities are enforced; the feasible region enlarges and the optimum cannot decrease.

Extreme-point structure (new)
- The feasible set is a nonempty polytope in R^{3^k} (uniform distribution is feasible), defined by linear equalities (geometry-aware invariance), nonnegativity, and normalization. Hence an optimal distribution exists and can be taken at an extreme point (basic feasible solution). This supports sparse-support searches and dual-certificate extraction.

Amplification reminders (unchanged)
- No entanglement: independence requires gaps of size 2r, so the exponential stride is k+2r. The r = 1 path 0–1–2 counterexample shows smaller gaps are insufficient.
- With entanglement: constant-error bounds require automorphism-invariant initial states (or an admissible public random rotation to enforce it). Without that symmetry, interior-placement equalities need not hold.

Computation plan (r = 2), updated to geometry-aware constraints
- Variables: p_ψ, ψ ∈ Σ^k. Quotient by S3 color permutations; do not assume reflection unless explicitly imposed.
- Constraints (progressive):
  • Single-core: s ∈ {1,2,3}, equality across all interior translations.
  • Two-core: (s1,s2) ∈ {(1,1),(2,1),(2,2)}, at several admissible separations δ ≥ 2r; enforce equality across translations for each fixed δ.
  • If needed, add t = 3 families similarly.
- Certification: For any q < 1, extract a dual and archive (r,k), the (s,δ) list, the dual vector, and the inequality certifying ∑_ψ p_ψ·1{proper} ≤ q.

Transfer-matrix/Markov cross-check
- Restricting to stationary Markov chains (order d) is a subset of the LP-feasible set; maximizing properness yields a lower bound on q(r,k), useful for catching modeling/solver errors but not a certifying upper bound.

Pitfalls and checks
- Do not equate placements with different δ. Keep separate runs with and without reflection constraints. Validate symmetry reductions on small k against the full (unreduced) LP.
- Ensure all placements counted in constraints have r-buffers fully inside [1..k].
Critical correction: the segment LP (Definition 6) is too weak for two-way
- New fact. For every r ≥ 1 and k ≥ 1, the LP optimum q(r,k) in Definition 6 equals 1. A feasible witness achieving objective 1 is given by the order-1 Markov chain on Σ={1,2,3} with stationary distribution u≡1/3 and transition matrix P with P(i,i)=0 and P(i,j)=1/2 for j≠i. Let p_k be the law of (X_1,…,X_k) with X_1∼u and X_{t+1}|X_t∼P. Then p_k assigns probability 1 to internally proper strings, and because (X_t) is strictly stationary, all core marginals for any fixed geometry (s,δ) are invariant under interior translations, hence all Definition 6 constraints hold. If reflection constraints are included, the chain remains feasible because it is reversible under u.
- Implication. The current LP cannot certify any nontrivial bound q<1 in the two-way model (with or without entanglement). Corollary 10 remains formally valid but is vacuous with this LP (it upper-bounds by 1).

Why the witness satisfies the geometry-aware equalities (minimal checks)
- Single core (t=1). For any s and any interior position i, the s-block (X_i,…,X_{i+s−1}) has the stationary s-block law; translation of i within the window preserves the law.
- Two cores (t=2). For s=(s1,s2) and gap δ≥2r, the joint law of the two blocks depends only on δ (and s1,s2); by strict stationarity, translating the placement within [1..k] does not change this joint law.
- Three cores (t=3). Similarly, for s=(s1,s2,s3) and gaps δ=(δ1,δ2) with δj≥2r, the joint law of the three blocks depends only on the inter-core separations, not on absolute position; interior translations preserve it.

Consequences for modeling and plan (forked)
- Track A (product-state, no entanglement): Independence across regions whose r-neighborhoods are disjoint (>2r separation) must be used. This is nonlinear (factorization). Two practical approaches:
  1) Lifted linear relaxation (Sherali–Adams style): Introduce auxiliary variables for joint marginals on small tuples of cores; enforce linear consistency across overlaps and interior-translation equalities; add necessary linear bounds implied by independence (e.g., Fréchet inequalities for all pairs). This excludes some spurious correlated witnesses (including the Markov chain) and may already force q<1 for small r,k.
  2) Nonlinear exact factorization: Add constraints P(A∩B)=P(A)P(B) for cylinder events A,B supported on disjoint r-buffers. Solve the resulting bilinear system for r=2 and k≤12 using algebraic/MIP methods. Any infeasibility at value 1 yields the desired q(r,k)<1.
- Track B (entanglement allowed): The segment LP cannot help. Pursue ring-level methods: (i) tailor LGR-style experiments for two-way r=2 to derive linear identities that cannot hold simultaneously under properness; (ii) indistinguishability/φ-LOCAL arguments to prove uniform ε(r)>0 constant-error lower bounds for fixed small r. Start at r=2.

Near-term to-dos
- Archive a formal statement and proof that q(r,k)=1 (now added to output.md) to prevent regressions.
- Implement Track A level-1/2 lift and a small exact factorization instance for r=2, k≤12, and test whether q<1 emerges. Extract and store any dual certificates (linear inequalities) obtained.
- Begin a concrete r=2 indistinguishability construction: enumerate r-views on the cycle; design two globally incompatible templates sharing those r-views on a positive fraction of positions; quantify a constant contradiction via averaging.
Addendum: independence-linearization, color symmetry, and corrected chain correlation

1) Pair independence at large separations and its linearization
- In the product-state regime (no shared entanglement), independence across sets whose r-neighborhoods are disjoint (distance > 2r) implies, for single-site cores at positions i and j with |i − j| ≥ 2r + 1:
  P[X_i = a, X_j = b] = P[X_i = a] · P[X_j = b] for all colors a, b.
- This yields, for the equality event:
  P_equal(i, j) := P[X_i = X_j] = ∑_{a∈{1,2,3}} P[X_i = a] P[X_j = a].
- If, in addition, the single-site marginals are uniform, i.e., P[X_u = a] = 1/3 for all a and all interior positions u, then P_equal(i, j) = 1/3. This is the proposed linear identity I1(δ) for δ ≥ 2r + 1.
- Caution (soundness): Enforcing uniform marginals (color symmetry) is harmless for the base LP (geometry-aware placement equalities), but combining it with independence-derived constraints needs justification. A global random color-permutation used only for symmetrization can introduce correlations across far-apart sets (breaking unconditional independence). Therefore, unless we prove that restricting to color-symmetric algorithms is w.l.o.g. even under independence constraints, using I1(δ) as a necessary linear condition is not sound. As a safe alternative, either (i) keep the exact (nonlinear) independence equalities, or (ii) prove the w.l.o.g. color-symmetry claim for the product-state model.

2) Corrected two-point correlation for the stationary “no self-loop” 3-state chain
Let (X_t) be the stationary order-1 Markov chain on {1,2,3} with transition matrix P(i,i) = 0 and P(i,j) = 1/2 for j ≠ i and stationary distribution u ≡ 1/3. Then, for d ≥ 1,
  P[X_t = X_{t+d}] = 1/3 + (2/3) (−1/2)^d.
This follows from the spectral decomposition of P (eigenvalues 1, −1/2, −1/2). In particular, P[X_t = X_{t+1}] = 0 and P[X_t = X_{t+2}] = 1/2. Consequently, for any finite d ≥ 1, this chain violates the identity P_equal(d) = 1/3.

3) Track A (product-state) implementation notes
- Sound feasibility test at objective 1 should include exact (nonlinear) pair independence for δ ∈ {2r+1, 2r+2}, along with placement equalities by geometry. For r = 2 and k ∈ {10, 11, 12}, this should be within reach of a MIP/CP-SAT solver. An infeasibility certificate at value 1 would be decisive.
- If you pursue the linearized I1(δ) route, first prove rigorously that restricting to color-symmetric strategies is w.l.o.g. with independence preserved in the relevant sense (i.e., that the resulting distribution still satisfies the imposed independence equalities). Otherwise, any certificate obtained may not upper-bound the true product-state optimum.

4) Track B (entanglement allowed) clarifications
- r-view equivalence lemma to formalize: If two experiments induce the same distribution over the Heisenberg-evolved effects for the queried event at depth r (as random placements on the cycle), then every r-LOCAL strategy yields equal expectations for the two experiments. Your weight-solving LP should enforce exact equality of the induced multiset of r-view isomorphism types (including gap size if it is part of the view definition).
- Separation on proper colorings must be uniform over all proper colorings (for n beyond some threshold). The parity-oscillation intuition is valid for the stationary chain or the uniform measure over proper colorings, but not for each fixed coloring; e.g., the 2-color alternating pattern has P_equal(d) ∈ {0,1} depending on parity. Therefore, after finding (D1, D2) with equal r-views, compute the minimum separation over all proper colorings (e.g., by transfer-matrix enumeration) and certify a positive gap.

5) Practical next steps
- Product-state: implement the exact pair-independence feasibility test at value 1 for r = 2, k ≤ 12. If infeasible, record the specific contradiction (solver proof log) and the list of constraints used. If feasible, extend δ or add three-core geometry constraints.
- Entanglement allowed: enumerate r = 2 pair-view types up to distance 10–12; solve for two mixtures with equal view distributions; compute the minimum separation over proper colorings and report whether a uniform ε > 0 is achieved.
Stationary single-block MIQCP for r = 2 (product-state, two-way)

- Block length L = 2r + 2 = 6. Alphabet Σ = {1,2,3}. Variables t(ζ) for ζ ∈ Σ^6.
- Linear constraints:
  • Nonnegativity and normalization: t(ζ) ≥ 0; ∑_ζ t(ζ) = 1.
  • Shift-consistency (stationarity of length-5 marginals): For all α ∈ Σ^5, M_1(α) := ∑_{ζ: ζ_1..ζ_5 = α} t(ζ) equals M_2(α) := ∑_{ζ: ζ_2..ζ_6 = α} t(ζ).
  • Perfect properness on interior edges: For j = 1,…,5 and a ∈ Σ, ∑_{ζ: ζ_j = ζ_{j+1} = a} t(ζ) = 0.
- Nonlinear (bilinear) independence at lag 5:
  • m(a) := ∑_{ζ: ζ_1 = a} t(ζ), p(a,b) := ∑_{ζ: ζ_1 = a, ζ_6 = b} t(ζ).
  • Enforce p(a,b) = m(a) m(b) for all a,b ∈ Σ (equivalently, ∑_{ζ: ζ_1=a, ζ_6=b} t(ζ) = (∑_{ζ: ζ_1=a} t(ζ))(∑_{ζ: ζ_1=b} t(ζ))).

Soundness rationale (concise): For a uniform r-round algorithm on a cycle with product initial state (identical local states), the output process is strictly stationary. Independence at separation 2r+1 follows from Theorem 2. If, on a sufficiently long segment, the interior 5 edges of a 6-block are proper with probability 1, then the 6-block marginal t assigns zero to any ζ with ζ_j = ζ_{j+1}. Hence any such algorithm induces t feasible for the MIQCP above. Conversely, any t satisfying the linear equalities is extendable to a stationary order-5 process with 6-block marginal t (Kolmogorov/Markov extension), so infeasibility certifies impossibility of perfect interior properness at r = 2 in the product-state regime.

Escalation knobs (if L = 6 is feasible):
- Enforce lag-6 independence by moving to L = 7 and adding ∑_{ζ: ζ_1=a, ζ_7=b} t(ζ) = (∑_{ζ: ζ_1=a} t(ζ))(∑_{ζ: ζ_1=b} t(ζ)). Both lag-5 and lag-6 are necessary in the product-state model.
- For stronger constraints, eventually consider triple independence (e.g., positions 1,6,11) requiring L = 11.

Numerical plan:
- Solvers: BARON, Couenne/Bonmin, SCIP-NLP. Archive model files and solver logs. If infeasible at L = 6, immediately use amplification (stride k + 2r) to conclude a constant-error bound (see Corollary below in output.md). If feasible, switch to an optimization variant to upper-bound the maximum properness probability (< 1) numerically.

Cautions reiterated:
- Do not impose color symmetry when independence constraints are active; a global color-permutation randomization can destroy unconditional independence across distant sets.
- The Markov-chain witness p_equal(d) = 1/3 + (2/3)(−1/2)^d shows why the base (linear) segment LP is vacuous but is excluded as soon as any lag-5 independence is enforced.

Analytic angle (optional):
- Let S_t = X_{t+1} − X_t (mod 3) ∈ {±1}. Properness forces S_t ∈ {±1} a.s. Independence at lag 5 forces constraints on the distribution of ∑_{j=0}^4 S_{t+j} (mod 3). An explicit contradiction along these lines would bypass computation and is worth exploring in parallel.
Product-state MIQCP for r = 2 at L = 6 (compact and auditable)

- Encoding and variables (96 proper atoms). Any proper 6-word ζ ∈ Σ^6 is uniquely described by a starting color and 5 increments S ∈ {±1}^5 via X_{j+1} ≡ X_j + S_j (mod 3). There are exactly 3 · 2^5 = 96 such words. Use variables p(a, s) for a ∈ Σ and s ∈ {±1}^5; set t(ζ) = 0 for all non-proper ζ by construction. This is sound for the feasibility-at-1 test because, under perfect interior properness, Proposition 16(iii) forces t to have support only on proper words.

- Shift-consistency (stationarity). For each α ∈ Σ^5, the 5-block marginal at positions (1..5) equals that at (2..6): M_1(α) = M_2(α). There are 3^5 = 243 equalities (many are vacuous under the 96-word support). Single-site marginal equalities across positions are implied by these and may be included as redundant numerical stabilizers.

- Lag-5 pair independence. Define the single-site marginals m(a) := ∑_s p(a,s) and pair marginals p(a,b) := ∑_{s: a + ∑ s ≡ b (mod 3)} p(a,s). Enforce p(a,b) = m(a) m(b) for all a,b ∈ Σ (9 bilinear equalities). For r = 2 and L = 6, (1,6) is the only pair with disjoint r-neighborhoods.

- Constraint inventory (L = 6): 96 nonnegativity, 1 normalization, 243 shift-consistency, and 9 bilinear independence equalities. This MIQCP is a compact certificate vehicle for infeasibility at objective 1.

- Combinatorial sanity checks (increment residues). Let ∆ := ∑_{j=1}^5 S_j (mod 3). Then b ≡ a + ∆ (mod 3). The counts of sequences by residue are: c_0 = 10 and c_{+1} = c_{−1} = 11. These are support sizes only; use them to cross-check solver outputs by aggregating t over residue classes and comparing to the independence targets m(a) m(b) grouped by b − a.

- Escalation to L = 7. With r = 2 and L = 7, two nonredundant independent pairs can be imposed: (1,6) and (1,7). The pair (2,7) is automatically enforced by shift-consistency from (1,6). If L = 7 remains feasible at 1, consider L = 11 to impose triple independence for {1,6,11}.

Quantitative bound q_6 and stride

- To obtain an explicit q < 1, lift the support to all Σ^6 and maximize the interior properness indicator (edges 1..5) subject to: (i) nonnegativity + normalization, (ii) 5-block shift-consistency, (iv) lag-5 independence (on (1,6)). Denote the optimum by q_6. If q_6 < 1, then by Corollary 3 the success probability on C_n is at most q_6^{⌊n/(6+2r)⌋} for r = 2, i.e., stride 10.

Cautions and soundness reminders

- Do not assume color-symmetry (e.g., uniform single-site marginals) when independence constraints are active unless proven w.l.o.g.; random global color-permutation can break unconditional independence across distant sets.
- The base (linear) segment LP (without independence) is provably trivial (q(r,k)=1); the MIQCP independence constraints are essential to exclude Markov-chain witnesses.

Implementation checklist

- Archive model files and logs (BARON/SCIP-NLP/Couenne/Bonmin). Validate: equality of single-site marginals across positions; the independence equalities; residue-class aggregation sanity checks.
- If L = 6 is infeasible at 1, immediately run the optimization variant to compute q_6 and report the amplified bound (stride 10). If still feasible at 1, add (1,7) independence at L = 7; if needed, move to L = 11 for triple independence.