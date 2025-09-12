# Research Notes



# Certificates and sampling for IRV ε-winners

- Notation: For S⊆C, a∈S, p_a(S)=Pr[top_S(ballot)=a]. Adding ε mass of c-first ballots increases c’s tallies by ε for every S containing c and leaves others’ tallies unchanged (compare absolute counts; normalization is irrelevant for elimination).

- Correct sufficient certificate (uniform): If for every nonempty S⊇{c} we have p_c(S) ≥ min_{a∈S\{c}} p_a(S) − ε (with tie-breaking known and either strict margins or reserved slack), then after adding ε mass of c-first ballots, c is never strictly below the minimum and hence cannot be eliminated; thus c wins.

- Caveat on single-chain certificates: Verifying inequalities only along one elimination chain of opponents is insufficient for K≥4, because the actual post-augmentation elimination path may visit sets not on the chosen chain. Therefore the earlier Lemma 1 (single-chain witness) is not a valid sufficient condition in general.

- K=3 case: There are only two relevant sets containing c (C and {c,x}). A union bound over the 9 quantities {p_a(S)}_{a∈S} yields uniform deviation, and adding ε mass to the sample winner ĉ suffices with ε=2α.

- Adaptivity: For sample-run IRV, one can control all top-of-set frequencies uniformly by a union bound over K·2^{K−1} indicators; this is exponential computationally but only linear in K in the sample size via the log term.

- Two-phase certification idea: Use a holdout sample to compute B̃(c)=max_{S⊇{c}}(min_{a∈S\{c}} p̃_a(S)−p̃_c(S)). If B̃(c)≤ε/2 (and uniform deviation ≤ε/4), then c is an ε-winner. This avoids chain-dependence but may be computationally heavy.

- Lower bounds: K=2 needs m=Ω((1/ε^2)·log(1/δ)). A Fano construction suggests m=Ω((log K)/ε^2) for identifying a unique ε/4-winner among K candidates; to be formalized with explicit IRV distributions.

- Next steps: (i) Provide a minimal counterexample demonstrating failure of single-chain certificates for K≥4 (or a proof that extra conditions suffice). (ii) Finalize the K=3 theorem with corrected constants and full tie handling. (iii) Either analyze the one-phase algorithm via a uniform bound that implies ε-winning, or switch to a two-phase max-deficit certificate. (iv) Complete the Fano lower bound.


## Refinements and validations

- Single-chain certificates fail (explicit K=4 counterexample). Ballot types and weights:
  T1: c>a>d>b (0.34), T2: a>d>c>b (0.29), T3: d>c>a>b (0.34), T4: b>a>d>c (0.03). First round eliminates b; then on {a,c,d} eliminate a; final pair {c,d} with c losing 0.34 vs 0.66. Chain checks against b then a and the pair {c,a} all pass (even with ε=0), yet c does not win. Hence chain-only witnesses are unsound for K≥4.

- Uniform max-deficit certificate. Define B(c)=max_{S⊇{c}} (min_{a∈S\{c}} p_a(S) − p_c(S)). If B(c) < ε, then adding ε mass of c-first ballots makes c safe in every S and thus an ε-winner. If only B(c) ≤ ε, either assume the tie-breaking never eliminates c on equality or require a strict slack.

- Two-phase holdout certification. Phase 1: pick ĉ by running IRV on m1 samples. Phase 2: estimate all p_a(S) for S⊇{ĉ} and a∈S on an independent holdout of size m2. With Hoeffding + union bound over M = (K−1)·2^{K−2} (others) plus 2^{K−1} (ĉ) indicators, uniform deviation ≤ ε/4 holds if m2 ≥ (2/ε^2)·ln(2M/δ). If B̃(ĉ) ≤ ε/2 − ξ, then B(ĉ) ≤ ε − ξ and ĉ is an ε-winner. Threshold ε/2 without slack requires favorable tie-breaking on equality.

- K=3 with separation. If |p_a(C) − p_b(C)| ≥ γ and m ≥ (8/ε^2)·ln(18/δ) with γ ≥ ε/2 (so α ≤ ε/4 ≤ γ/2), then the sample more-popular opponent x̂ equals the true x*, and the sample winner ĉ is an ε-winner with probability ≥ 1−δ by verifying safety at C and a head-to-head win versus x*.

- Open directions: (i) Reduce the family of S needed for certification (are worst-case S IRV-reachable?). (ii) One-phase analysis via uniform deviations that imply B̂(ĉ) small. (iii) Complete the Fano Ω((log K)/ε^2) lower bound with an explicit IRV family.


### Additional observations and corrections

- Holdout constant correction: To ensure |p̃_a(S)−p_a(S)| ≤ ε/4 uniformly over M_c functions, Hoeffding yields m2 ≥ (8/ε^2)·ln(2M_c/δ). The earlier (2/ε^2) factor was incorrect by 4×.

- Non-monotonicity: For fixed c, f(S)=min_{a∈S\{c}} p_a(S)−p_c(S) need not be monotone in S; there exist S⊂T with f(S)<0<f(T). So pruning by subset/superset relations is invalid.

- Why K=3 is special: With candidates {a,b,c}, the first-round minimum at C coincides with c being below both opponents at C; and the final opponent is the larger of {a,b} at C, independent of c-first augmentation. This equivalence breaks for K≥4, where top-of-C and top-of-S can decouple.

- Exact K=3 augmentation (c-first): E_c = max{ [min{p_a(C),p_b(C)} − p_c(C)]_+ , [p_{x*}({c,x*}) − p_c({c,x*})]_+ }, x*=argmax_{a,b} p_a(C).

- Toward polynomial sample complexity: Rather than enumerating all S, analyze the statistical complexity of G={1[top_S(·)=a] : S⊇{a}, a∈C}. Each g_{S,a} is a monotone conjunction of pairwise comparisons on permutations. Bounding VC/pseudodimension of G (conjecturally O(K log K)) could yield O((K log K + log(1/δ))/ε^2) uniform deviation without the 2^K factor. This could enable a one-phase analysis or a more efficient holdout.

- Open tasks: (i) Prove VC/pseudo-dim bounds for G and translate to uniform deviations for B̃. (ii) Formalize an explicit Fano Ω((log K)/ε^2) lower bound. (iii) Explore whether worst-case S for f(S) are constrained to IRV-reachable sets under neighboring profiles to shrink the verification family.
