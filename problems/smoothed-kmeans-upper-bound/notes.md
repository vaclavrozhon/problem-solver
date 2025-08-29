Problem and notation
- X ⊂ R^d finite dataset; cost(C) = ∑_{x∈X} min_{c∈C} ||x−c||^2.
- OPT_k := min_{|C|=k} cost(C), nonincreasing in k.
- ALG_k := cost of k-means++ after k centers; E_++[·] denotes expectation over its randomness.
- We study E_{k∼U({k0,…,2k0−1})} E_++[ ALG_k / OPT_k ].

Key external input (Makarychev–Reddy–Shan 2020)
- There is an absolute constant C_bi (quoted as 5 in MRS) such that for any r≥1, Δ≥1,
  E_++[cost after r+Δ centers] ≤ C_bi · min{ 2 + 1/(2e) + ln(2r/Δ), 1 + r/(e(Δ−1)) } · OPT_r.
- For Δ=0 (fixed-k), there is an absolute constant C_fix (also ≲5 in MRS) with E_++[ALG_k] ≤ C_fix · (ln k + O(1)) · OPT_k.

Per-k oversampling bound (robust to s-misalignment)
- For any k, define s(k) := min{ s∈{1,…,k} : OPT_s ≤ 2·OPT_k }. Let Δ(k)=k−s(k).
- If Δ(k)≥1, then
  E_++[ALG_k] ≤ 2·C_bi · min{ 2 + 1/(2e) + ln(2 s(k)/Δ(k)), 1 + s(k)/(e(Δ(k)−1)) } · OPT_k.
- If Δ(k)=0, fall back to E_++[ALG_k] ≤ C_fix · (ln k + O(1)) · OPT_k.
Note: On any factor-2 plateau I=[m,m+L) (i.e., OPT_k∈(OPT_m/2,OPT_m] for k∈I), we have s(k)≤m and Δ(k)≥k−m; since the MRS bound is monotone in (s,Δ), replacing (s(k),Δ(k)) by (m,k−m) yields a valid upper bound.

Per-plateau averaging and Stirling control
- For a factor-2 plateau I=[m,m+L), L≥2, uniform k over I gives
  E_{k,++}[ALG_k/OPT_k] ≤ 2·C_bi · (2 + 1/(2e) + (1/(L−1))∑_{Δ=1}^{L−1} ln(2m/Δ)) + (C_fix(ln m + O(1)))/L.
- Using ln(n!) ≥ n ln n − n + 1 (n≥1),
  (1/(L−1))∑_{Δ=1}^{L−1} ln(2m/Δ) = ln(2m) − ln((L−1)!)/(L−1) ≤ 1 + ln(2m/(L−1)).
- Hence E_{k,++}[ALG_k/OPT_k] ≤ const + const·ln^+(2m/(L−1)) + O((ln m)/L), where ln^+(x)=max{ln x,0} and all const’s are absolute.

Decomposition over [k0,2k0)
- Partition [k0,2k0) into maximal factor-2 plateaus I_j=[m_j, m_j+L_j). For L_j≥2, the per-plateau average is bounded as above. For L_j=1, the single k in I_j contributes ≤ C_fix(ln m_j + O(1)). Averaging with weights L_j/k0 yields a global bound explicitly in terms of {(m_j,L_j)}; in the worst case many L_j=1 plateaus can force Θ(log k0).

Consequences and regimes
- Long plateaus: If some I=[m,m+L) satisfies L ≥ m/polylog(k0), then E_{k∈I,++}[ALG/OPT] = O(log log k0). If a constant fraction of [k0,2k0) is covered by such plateaus, the global average is O(log log k0).
- Worst case without structure: If many plateaus are short (e.g., L_j=1), the global average can be Θ(log k0), aligning with classic worst-case fixed-k behavior.

Open directions
- Structural conditions on OPT(·) implying many long plateaus (e.g., bounded discrete derivative decay, quasiconvexity/regularity of k·OPT_k) to get unconditional O(log log k0).
- Heavy-coverage lemma (conjectural): under strong scale separation OPT_{k1} ≫ OPT_k, show k-means++ hits all k1 heavy clusters w.h.p. before collisions, then apply bi-criteria on the remaining part.
- Lower bounds: Construct instances with Δ(k)=1 for a 1−o(1) fraction of k in [k0,2k0), giving an Ω(log k0) average and clarifying optimality of random-k smoothing.
Refinements and corrections for plateau averaging and monotonicity

- Monotonicity of the MRS bi-criteria bound. Define for integers s≥1 and Δ≥1 (interpreting the second branch only for Δ≥2):
  f(s,Δ) := min{ a + ln(2s/Δ), 1 + s/(e(Δ−1)) }, where a := 2 + 1/(2e).
  Then f is nondecreasing in s and nonincreasing in Δ. Consequently, on any factor-2 plateau I=[m,m+L) and for k=m+Δ with Δ≥1, the per-k bound from Theorem 1 satisfies
  f(s(k),Δ(k)) ≤ f(m,Δ), so we may safely replace (s(k),Δ(k)) by (m,Δ) in upper bounds.

- Correct τ-split averaging (fixing Proposition B). On a factor-2 plateau I=[m,m+L) with L≥2, for any integer τ∈{1,…,L−1}:
  (1/(L−1)) ∑_{Δ=1}^{L−1} min{ a+ln(2m/Δ), 1 + m/(e(Δ−1)) } (with the second term read only for Δ≥2)
  ≤ (τ/(L−1)) [ a + 1 + ln(2m/τ) ]
    + ((L−1−τ)/(L−1))
    + (m/(e(L−1))) · (H_{L−2} − H_{τ−1}).
  Proof sketch: Split the sum at τ and use Stirling ln(τ!) ≥ τ ln τ − τ + 1 to bound ∑_{Δ≤τ} ln(2m/Δ) ≤ τ(1+ln(2m/τ)). For the tail, sum 1/(Δ−1) as H_{L−2}−H_{τ−1}. This corrects two issues in earlier drafts: (i) the constant a must be multiplied by τ/(L−1), and (ii) ln(2m/Δ) cannot be upper bounded by ln(2m/τ) when Δ≤τ.

- Hybrid extremes recovered from the τ-split:
  • Choosing τ=L−1 gives the pure-logarithmic average a+1+ln(2m/(L−1)).
  • Choosing τ=1 gives the “hybrid extreme” 1 + (a+ln(2m))/(L−1) + (m/(e(L−1))) H_{L−2}.
  Hence we may take the minimum of these two regimes for a tighter bound, plateau by plateau.

- Long-plateau corollary. If L≥α m with α∈(0,1], then a+1+ln(2m/(L−1)) ≤ a+1+ln(2/α)+O(1/L), so the plateau-average is O(1) up to the endpoint term of order (ln m)/L.

- Quantile-in-Δ bound (careful threshold). For any η∈(0,1), let T := max{2, ⌈η(L−1)⌉+1}. Then, for all Δ≥T, by the large-Δ branch
  E_++[ALG_{m+Δ}/OPT_{m+Δ}] ≤ 2·C_bi·(1 + m/(e(T−1))).
  The fraction of k∈I with Δ≥T is (L−T+1)/L = 1 − η − O(1/L). This yields a rigorous “with probability ≥ 1−η−O(1/L) over k uniform on the plateau” expected-ratio bound; Markov then converts it into a constant-factor joint (k,++) probability if desired.

- Global decomposition improvement. Using the τ-split per plateau and optimizing τ as a function of (m,L) leads to a refined global bound that, informally, scales like
  K0 + K1 · min{ ln^+(2m/(L−1)), (m ln L)/L } + K2 · (ln m)/L,
  up to absolute constants K0,K1,K2. Formalizing this from Theorem 3 is a next step.

Open directions and next steps
- Optimize τ in the τ-split bound and write a clean, closed-form per-plateau bound. Then aggregate over plateaus to strengthen Corollary 3.
- Probability guarantees: phrase clean conditions under which at least a 1% measure of k (in [k0,2k0) or on a specific plateau) yields a constant expected ratio, and apply Markov to obtain joint (k,++) probability.
- Heavy-coverage: formalize the supermartingale for heavy uncovered mass (precise citation from MRS), bound expected heavy-collisions by O(k1/R), and lift to high probability via Freedman/Azuma with a stopping time.
- Lower bounds: construct OPT(·) with OPT_{k−1}/OPT_k ≈ 1 − Θ(1/ln k0) for most k to force Δ(k)=1 on a 1−o(1) fraction of the window, yielding an Ω(log k0) average.
Additions and clarifications

- Geometric constraint on plateau length within the window. If a factor-2 plateau I=[m,m+L) is contained in [k0,2k0), then L ≤ 2k0−m ≤ m. In particular, for L≥2 we have m/(L−1) ≥ 1. This prevents sign errors when simplifying expressions involving m/(L−1).

- Min-of-extremes and an upper envelope. From Theorem 3 and Corollary 4 we can (and will) use the minimum of the two extreme instantiations τ=L−1 (pure log) and τ=1 (hybrid extreme). Using H_q ≤ ln q + 1, this yields a clean per-plateau upper envelope of the form
  E_{k∈I} E_++[ALG_k/OPT_k] ≤ K0 + K1 · min{ ln^+(2m/(L−1)), (m ln L)/L } + K2 · (ln m)/L,
for absolute constants K0,K1,K2 depending only on C_bi,C_fix. This is the regime split we will use in global aggregation: the log term dominates when L≪m, while the (m ln L)/L term is O(1) when L is a constant fraction of m.

- Safe balanced-split (τ=⌊L/2⌋) template (optional). The following uniform bounds hold for L≥3 and τ=⌊L/2⌋:
  • τ/(L−1) ≤ 2/3 and (L−1−τ)/(L−1) ≤ 1/2.
  • ln(2m/τ) ≤ ln(4m/(L−1)).
  • H_{L−2} − H_{τ−1} ≤ ln 3 + 1 (with small-L cases checked directly).
Plugging these into Theorem 3 yields the rigorous estimate
  E_{k∈I} E_++[ALG_k/OPT_k]
  ≤ 2C_bi [ (2/3)(a + 1 + ln(4m/(L−1))) + 1/2 + (m/(e(L−1)))(ln 3 + 1) ]
    + (C_fix(\ln m + O(1)))/L.
This improves the (m ln L)/L term to a pure (m/L) term at the expense of a larger coefficient on the logarithmic piece. It may be tighter than the min-of-extremes envelope in intermediate regimes. If used, constants must be kept as above (1/2 is not a safe coefficient for τ/(L−1) when L is even).

- Probability ≥ 1% guarantees under a long-plateau condition. From Corollary 6: fix η∈(0,1) and define T := max{2, ⌈η(L−1)⌉+1}. For at least a (1−η−O(1/L)) fraction of k∈I we have
  E_++[ALG_k/OPT_k] ≤ 2C_bi (1 + m/(e(T−1))).
By Markov, for any c≥1,
  P_{++}[ ALG_k/OPT_k ≤ c · 2C_bi (1 + m/(e(T−1))) ] ≥ 1 − 1/c
for each such k. Therefore, jointly over k uniform on I and ++ randomness,
  P[ ALG_k/OPT_k ≤ c · 2C_bi (1 + m/(e(T−1))) ] ≥ (1−η−O(1/L))(1−1/c).
If L ≥ α m, then m/(T−1) ≤ 1/(α η) up to 1+O(1/L) factors, giving an explicit constant bound. If the plateau covers a γ-fraction of [k0,2k0), the global probability is ≥ γ times the RHS. Example: with C_bi=5, α=1, η=0.99, c=100, we get a ≥1% guarantee with a factor ≤ 100·2·5·(1 + 1/(0.99 e)).

- Heavy-coverage program (caveats and plan). Any per-step “collision within heavy” probability bound must be stated conditionally on the current filtration F_t: under D^2 sampling,
  P[collision in H at step t | F_t] = cost_t(covered H) / cost_t(all).
Avoid ratio-of-expectations. A plausible route is to bound cost_t(covered H) in terms of the uncovered heavy mass U_t(H) via the MRS eH_t supermartingale (in expectation and eventually with concentration), while lower bounding cost_t(all) by U_t(H) + U_t(L). To obtain a β-persistence-type condition from scale separation, quantify the expected reduction of U_t(H) when sampling outside H and show it is o(U_t(H)) under strong separation (e.g., OPT_{k1} ≥ k^C · OPT_k). With these in place, the expected number of heavy collisions can be bounded by summing the conditional probabilities until all heavy clusters are hit, and then lifted to high probability by Freedman/Azuma.

- Lower bounds. To show random-k smoothing cannot beat Θ(log k0) in general, aim for an instance where Δ(k)=1 for a 1−o(1) fraction of k in [k0,2k0). Concretely, calibrate radii so OPT_{k−1}/OPT_k ≈ 1 + Θ(1/ln k0) across most of the window, ensuring s(k)=k−1 on most k. Then adapt Arthur–Vassilvitskii’s lower-bound calculation to the averaged setting.
New per-plateau refinement: τ≈m/ln L branch and an updated envelope

- Additional τ-instantiation. On a factor-2 plateau I=[m,m+L) with L≥3, choose τ*:=min{L−1, ⌊m/ln L⌋}. Then Theorem 3 yields
  E_{k∈I} E_++[ALG/OPT]
  ≤ 2C_bi [ (τ*/(L−1))(a+1+ln(2m/τ*)) + ((L−1−τ*)/(L−1)) + (m/(e(L−1)))(H_{L−2} − H_{τ*−1}) ]
    + (C_fix(\ln m + O(1)))/L,
  where a:=2+1/(2e).
  In the subcase m ≤ (L−1) ln L (hence τ*=⌊m/ln L⌋) and assuming m≥L (which holds for plateaus contained in [k0,2k0)), we can bound
  • ln(2m/τ*) ≤ ln(4 ln L)
  • τ*/(L−1) ≤ m/((L−1) ln L)
  • H_{L−2} − H_{τ*−1} ≤ 1 + ln ln L
  to conclude
  E_{k∈I} E_++[ALG/OPT]
  ≤ 2C_bi [ 1 + (m/((L−1) ln L))(a+1+\ln(4\ln L)) + (m/(e(L−1)))(1 + \ln\ln L) ]
    + (C_fix(\ln m + O(1)))/L.
  This improves the (m\ln L)/L tail from the τ=1 branch to ≈ (m/L)(1+\ln\ln L).

- Updated min-of-three envelope (plateau-wise). Together with the τ=L−1 (pure-log) and τ=1 (hybrid) instantiations, we may use
  E_{k∈I} E_++[ALG/OPT] ≤ K0 + K1·min{ ln^+(2m/(L−1)), (m\ln L)/L, (m(1+\ln\ln L))/L } + K2·(\ln m)/L,
  for absolute constants K0,K1,K2 depending only on C_bi,C_fix. This strictly strengthens the previous min-of-two envelope in regimes where ln ln L ≪ ln L.

- Global aggregation (window-wise). For the maximal factor-2 plateau partition [k0,2k0)=\bigsqcup_j I_j with I_j=[m_j,m_j+L_j), one may take, plateau by plateau, the minimum of the three branches above (with the third used for L_j≥3), and sum with weights L_j/k0:
  E_{k\sim U([k0,2k0))} E_++[ALG/OPT]
  ≤ (1/k0) \sum_j L_j [ K0 + K1·min{ ln^+(2m_j/(L_j−1)), (m_j\ln L_j)/L_j, (m_j(1+\ln\ln L_j))/L_j } ]
    + (K2/k0) \sum_j \ln m_j.

- Balanced split reminder. The τ=⌊L/2⌋ instantiation yields
  E_{k∈I} E_++[ALG/OPT]
  ≤ 2C_bi [ (2/3)(a+1+\ln(4m/(L−1))) + 1/2 + (m/(e(L−1)))(\ln 3 + 1) ] + (C_fix(\ln m + O(1)))/L,
  valid for all L≥3. This removes the ln L factor in the tail at the expense of a larger constant on the log piece.

- Probabilistic 1% instantiation (correction). From Corollary 9, for any η∈(0,1) and c≥1,
  P_{k∈I,++}[ ALG/OPT ≤ c·B_I ] ≥ (1−η−O(1/L))(1−1/c), with B_I=2C_bi(1 + m/(e(T−1))), T=\max\{2,\lceil η(L−1)\rceil+1\}.
  To guarantee at least 1% mass uniformly (up to O(1/L)), take η=0.98 and c=2, giving (1−η)(1−1/c)=0.02·0.5=0.01. If, in addition, L≥α m, then B_I ≤ 2C_bi(1 + 1/(α e η)) up to O(1/L).

Caveat on heavy-coverage sketches. The pathwise control and metric-separation heuristics are promising but currently lack fully rigorous denominators: one must explicitly quantify cost_t(X) in terms of U_t(H) under precise conditions, and avoid uncontrolled uses of triangle inequality against existing centers outside H. These ideas remain in-development items in notes, not yet suitable for output.
Global aggregation and probability instantiations (added)

- Global min-of-three aggregator. From Corollary 11 (per-plateau min-of-three) and linearity, we can average over the maximal factor-2 plateau partition [k0,2k0)=⊔_j I_j=[m_j,m_j+L_j). For L_j≥2 each plateau contributes its per-plateau bound with weight L_j/k0, and L_j=1 plateaus contribute via the fixed-k bound. This yields a clean, explicit global formula with constants K0,K1,K2 depending only on C_bi,C_fix. When C_bi=C_fix=5, one can set K0=35, K1=10, K2=5. The third branch (m(1+ln ln L))/L is to be read only for L≥3.

- Endpoint-sum control. The unweighted endpoint contribution aggregates as (K2/k0)∑_{j:L_j≥2} ln m_j. This is always ≤ K2·ln(2k0) since there are ≤k0 plateaus and m_j≤2k0−1 for all j. Thus endpoint terms never exceed O(ln k0).

- Unconditional aggregation bound. Using only the pure-log branch and the easy inequality ln m_j ≤ ln k for k∈I_j, we recover E_{k∼U([k0,2k0)),++}[ALG/OPT] ≤ K′ + K″·ln(2k0) for absolute K′,K″. This validates that, without structural information (e.g., long plateaus), the Θ(log k0) behavior is unavoidable.

- Long-plateau mixture. If a γ-fraction of the window is covered by plateaus with L≥α m, then that portion contributes γ·O_α(1) (by Corollary 5), while the rest is ≤ (1−γ)·O(ln k0). This gives a transparent global interpolation.

- ≥1% global probability under a single long plateau. If I=[m,m+L) with L≥α m covers a γ-fraction of the window, then by Corollary 9 with η=0.98 and c=2 we get P_{k,++}[ALG/OPT ≤ 2·B_I] ≥ γ·(1−η−O(1/L))·(1−1/2) = 0.01·γ − O(γ/L), where B_I = 2·C_bi·(1 + m/(e(T−1))) and T = max{2,⌈0.98(L−1)⌉+1}. If L≥α m then B_I ≤ 2·C_bi(1 + 1/(α e·0.98)) + O(1/L).

Caveat and next steps for heavy-coverage

- The pathwise heavy-collision lemma remains a program: define U_t(H) (uncovered heavy mass), H_t(H) (covered heavy mass), and the stopping time τ when all heavy clusters are covered. A key missing ingredient is a quantitative persistence lower bound inf_{t<τ} U_t(H) ≥ c·S_H (S_H is the sum of single-cluster OPT costs over H) under an explicit separation hypothesis (e.g., OPT_{k1} ≫ OPT_k or geometric separation). Once such a bound and a dominance parameter β>0 (U_t(H) ≥ β·(H_t(all)+U_t(L))) are established, summing conditional collision probabilities gives an expected-collisions bound, which can then be upgraded to high probability via Freedman’s inequality. We should avoid any pathwise inequality that is only justified in expectation (e.g., eH_t supermartingale bounds) without a concentration argument.
Round 0006 updates: audits, fixes, and new curated directions

1) Balanced split (τ=⌊L/2⌋) is safe and useful
- For L≥3 and τ=⌊L/2⌋ we have the uniform bounds: τ/(L−1)≤2/3, (L−1−τ)/(L−1)≤1/2, ln(2m/τ)≤ln(4m/(L−1)), and H_{L−2}−H_{τ−1}≤ln 3+1 (check L=3,4 directly; for larger L use H_n−H_m≤ln((n+1)/(m+1))≤ln 3). Plugging these into Theorem 3 produces a clean O(m/L) tail with explicit constants. We will curate this to output.md.

2) “Constant-tail split” (τ≈(L−1)/e): caution on constants
- With τ=⌊(L−1)/e⌋, τ≥1 only when L≥4. The bound H_{L−2}−H_{τ−1}≤2 is false at L=6 (H_4≈2.083). A rigorous statement should either (i) retain the form H_{L−2}−H_{τ−1}≤1+ln((L−1)/τ), or (ii) give a safe constant (e.g., ≤3 or ≤4) uniformly for L≥4. Until this is adjusted, we will not add this branch to output.md.

3) Multi-plateau ≥1% probability (mixing)
- If a disjoint family of long plateaus {I_j=[m_j,m_j+L_j)} with L_j≥α m_j covers a γ-fraction of [k0,2k0), then by Corollary 9 with η=0.98 and c=2,
  P[ALG/OPT ≤ 2·B_j on the event k∈I_j for some j] ≥ γ·(1−η)·(1−1/2) − O(γ/\min_j L_j) = 0.01·γ − O(γ/\min_j L_j),
  where B_j=2C_bi(1+m_j/(e(T_j−1))), T_j=max{2,⌈η(L_j−1)⌉+1}, and hence B_j≤2C_bi(1+1/(α e η))+O(1/L_j). We will add this global mixing corollary to output.md.

4) Quantified O(log log k0) mixture under polylog-long plateaus
- Let S be the set of plateaus with L_j≥m_j/(ln k0)^σ for some σ≥1 and suppose ∑_{j∈S} L_j≥γ k0. Then
  E[ALG/OPT] ≤ γ·[2C_bi(a+1+ln(const)+σ ln ln k0)] + (1−γ)·[K′+K″ ln(2k0)] + o(1),
  where const is an absolute constant (2 or 4; absorbed into O(1)). The o(1) comes from endpoint terms: their contribution over S is (C_fix/k0)∑_{j∈S} ln m_j ≤ C_fix·|S|·ln(2k0)/k0 = O(γ (ln k0)^σ ln k0/k0)→0, since |S|≤(γ k0)/min_j L_j and min_j L_j≥k0/(ln k0)^σ. We will curate a precise corollary to output.md.

5) Discrete smoothness ⇒ long plateaus (corrected rounding)
- Lemma (sequence form). If (v_k) is nonincreasing and for all k in {m+1,…,m+L−1} we have v_{k−1}≤(1+δ) v_k, then v_{m+L−1}≥v_m/(1+δ)^{L−1}. Hence a factor-2 drop within [m,m+L) requires L≥1+⌈ln 2/ln(1+δ)⌉. Using ln(1+δ)≤δ, it suffices that L≥1+⌈(ln 2)/δ⌉.
- Corollary (1/m-type smoothness on [m,2m)). If v_{k−1}≤(1+A/m) v_k for all k∈[m+1,2m−1], then any factor-2 drop within [m,2m) requires L≥1+⌈(ln 2) m/A⌉. Thus: if A≥ln 2, then L≥((ln 2)/A)·m up to lower-order terms; if A<ln 2, then a factor-2 drop cannot occur within the window, so the whole [m,2m) is one plateau (L=m). This cleanly connects “discrete smoothness” to long plateaus.

6) Heavy-coverage program: rigor requirements
- To bound the expected number of heavy-collisions, one must avoid ratio-of-expectations. Work with p_t^{ch}=cost_t(covered heavy)/cost_t(all) conditioned on the filtration. A usable inequality is p_t^{ch}≤H_t(H_cov)/((β+1)U_t(H)) once we have a deterministic persistence bound cost_t(all)≥(β+1)U_t(H). Then ∑_{t<τ}E[p_t^{ch}|F_t]≤(1/(β+1))·∑_{t<τ}E[H_t(H_cov)/U_t(H)], which still needs (a) a deterministic or high-prob lower bound on U_t(H) until τ, and (b) control of H_t(H_cov) (e.g., via a supermartingale with concentration). These should be established under explicit separation assumptions before drawing collision bounds.

Next steps
- Curate to output.md: (i) balanced split corollary; (ii) multi-plateau 1% mixing; (iii) quantified O(log log k0) mixture; (iv) discrete-smoothness lemma and corollary.
- Either repair or defer the τ≈(L−1)/e branch.
- For heavy coverage: prove a persistence inequality cost_t(all)≥(β+1)U_t(H) under a clean separation hypothesis; then bound expected collisions; then lift to high probability via Freedman.
Corrections, new unconditional probability, and new structural global regimes

- Caution on plateau-average vs per-k bounds. Corollary 11 (min-of-three envelope) controls the plateau average E_{k∈I}E_++[ALG/OPT]. It is not a per-k bound on Y_k:=E_++[ALG_k/OPT_k|k]. Hence one cannot conclude Y_k ≤ B_I from Corollary 11. Any probability argument that treats the plateau-average envelope as a per-k upper bound (e.g., a “two-level Markov” multiplying two Markov factors) is invalid.

- Unconditional probability from the global expectation. Let Z := ALG_k/OPT_k for k uniform on [k0,2k0) and ++ randomness. From Corollary 14, E[Z] ≤ K′ + K″ ln(2k0) unconditionally. Markov’s inequality gives for any c≥1:
  P[ Z ≤ c·(K′ + K″ ln(2k0)) ] ≥ 1 − 1/c.
This yields a simple, structure-free probability guarantee (e.g., 50% at threshold 2·(K′ + K″ ln(2k0)); 90% at threshold 10·(K′ + K″ ln(2k0))). If desired, one can also instantiate an explicit numerical bound M(k0) from Corollaries 12–13 and Lemma 1 when C_bi=C_fix=5, but we keep the symbolic statement in output.md.

- Discrete 1/k-smoothness across the whole window ⇒ global O_A(1). If OPT_{k−1} ≤ (1 + A/k)·OPT_k for all k∈[k0+1,2k0−1], then every factor-2 plateau I=[m,m+L) inside the window has L ≥ (ln 2)·m/A up to +O(1). Hence each plateau average is ≤ 2·C_bi·(a+1+ln(2A/ln 2)) + o(1) (Corollary 5), with a:=2+1/(2e). The number of plateaus J across [k0,2k0) is O(A), so the endpoint contribution sums to o(1). Therefore E_{k,++}[ALG/OPT] ≤ 2·C_bi·(a+1+ln(2A/ln 2)) + o(1).

- Two-sided power-law envelope ⇒ global O_{p,ρ}(1), with explicit α. Suppose for all k∈[k0,2k0) we have C_1 k^{-p} ≤ OPT_k ≤ C_2 k^{-p} with p>0 and ρ:=C_2/C_1. Set α:=min{1, ((2ρ)^{1/p}−1)}. Then for any plateau starting at m, for all t≤⌊α m⌋−1,
  OPT_{m+t}/OPT_m ≥ (C_1/C_2)·(m/(m+t))^p ≥ (C_1/C_2)·(1/(1+α))^p ≥ 1/2,
so L ≥ ⌊α m⌋. By Corollary 5 each plateau average is ≤ 2·C_bi·(a+1+ln(2/α)) + o(1), and the number of plateaus in the window is O_{p,ρ}(1) (since m increases by ≥(1+α) each step). Consequently, E_{k,++}[ALG/OPT] ≤ 2·C_bi·(a+1+ln(2/α)) + o(1).

- Plateau-level 25% probability. As an easy specialization of Corollary 9, choosing η=1/2 and c=2 yields, for any plateau I=[m,m+L) with L≥2,
  P_{k∈I,++}[ ALG/OPT ≤ 2·B_I ] ≥ 1/4 − O(1/L),
with B_I=2·C_bi·(1 + m/(e(T−1))) and T=max{2,⌈(L−1)/2⌉+1}. If L≥α m then B_I ≤ 2·C_bi·(1+2/(α e)) + O(1/L).

Next steps
- For probability tails beyond Markov, seek per-k upper bounds (under structure) that hold for a constant fraction of k, enabling a one-level Markov at lower thresholds.
- Explore other regularity conditions on OPT(·) that enforce either long plateaus or few plateaus across [k0,2k0), and translate them into global averages and constant-probability bounds via our plateau calculus.
- For the heavy-coverage program, focus on proving a filtration-adapted denominator lower bound cost_t(all) ≥ (β+1)·U_t(H) up to the stopping time when H is fully covered, under explicit geometric/separation hypotheses; then sum conditional collision probabilities and apply Freedman to lift to high probability.
