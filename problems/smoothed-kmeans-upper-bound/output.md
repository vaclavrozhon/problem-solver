Theorems curated in this file depend on the following standard notation and external input.
- For a finite dataset X⊂R^d, write OPT_k for the optimal k-means cost with k centers, and ALG_k for the cost produced by k-means++ after k centers; E_++[·] is expectation over the algorithm’s randomness.
- External input (Makarychev–Reddy–Shan, 2020): There exists an absolute constant C_bi such that for all integers r≥1 and Δ≥1,
  E_++[cost after r+Δ centers] ≤ C_bi · min{ 2 + 1/(2e) + ln(2r/Δ), 1 + r/(e(Δ−1)) } · OPT_r.
  There is also an absolute constant C_fix with E_++[ALG_k] ≤ C_fix·(ln k + O(1))·OPT_k for all k (the fixed-k bound). We treat C_bi and C_fix as absolute numerical constants.

Theorem 1 (Per-k oversampling bound via a 2-approximate anchor).
Fix k≥1 and define
  s(k) := min{ s∈{1,…,k} : OPT_s ≤ 2·OPT_k },    Δ(k) := k − s(k).
Then:
- If Δ(k) ≥ 1, we have
  E_++[ALG_k] ≤ 2·C_bi · min{ 2 + 1/(2e) + ln(2 s(k)/Δ(k)), 1 + s(k)/(e(Δ(k)−1)) } · OPT_k.
- If Δ(k) = 0, we have E_++[ALG_k] ≤ C_fix·(ln k + O(1))·OPT_k.
Proof.
For Δ(k)≥1, apply the MRS bi-criteria inequality with r = s(k) and Δ = k−s(k):
  E_++[ALG_k] = E_++[cost after s(k)+Δ(k) centers]
  ≤ C_bi · min{ 2 + 1/(2e) + ln(2 s(k)/Δ(k)), 1 + s(k)/(e(Δ(k)−1)) } · OPT_{s(k)}.
By definition of s(k), OPT_{s(k)} ≤ 2·OPT_k, giving the stated bound. For Δ(k)=0 the fixed-k bound yields the second claim. ∎

Theorem 2 (Averaging over a factor-2 plateau).
Let I = {m, m+1, …, m+L−1} with L≥2 and assume OPT_k ∈ (OPT_m/2, OPT_m] for all k∈I. Then for k uniform in I and over the k-means++ randomness,
  E_{k∈I} E_++[ ALG_k / OPT_k ] ≤ A0 + A1 · ln^+( 2m/(L−1) ) + (A2 · ln m)/L,
where ln^+(x) := max{ln x,0} and A0,A1,A2 are absolute constants depending only on C_bi,C_fix.
Proof.
Average the bound from Theorem 1 over k∈I. For Δ:=k−m≥1, we may upper bound s(k) by m and lower bound Δ(k) by Δ (since s(k)≤m and Δ(k)≥Δ on a factor-2 plateau), and use only the logarithmic branch of MRS to get
  E_++[ALG_{m+Δ}/OPT_{m+Δ}] ≤ 2·C_bi · ( 2 + 1/(2e) + ln(2m/Δ) ).
Averaging Δ from 1 to L−1 gives
  (1/(L−1))∑_{Δ=1}^{L−1} ln(2m/Δ) = ln(2m) − ln((L−1)!)/(L−1) ≤ 1 + ln(2m/(L−1)),
where we used ln(n!) ≥ n ln n − n + 1 for n=L−1≥1. Multiplying by (L−1)/L and adding the Δ=0 endpoint contribution C_fix(ln m + O(1))/L yields the claim with suitable absolute constants A0,A1,A2. Replacing ln by ln^+ only weakens the bound. ∎

Corollary 3 (Decomposition across [k0,2k0)).
Partition the integer interval [k0,2k0) into maximal factor-2 plateaus I_j = [m_j, m_j+L_j), j=1,…,J, so OPT_k ∈ (OPT_{m_j}/2, OPT_{m_j}] for k∈I_j, and ∑_j L_j = k0. Then, for k uniform on [k0,2k0),
  E_k E_++[ ALG_k / OPT_k ]
  ≤ (1/k0) ∑_{j : L_j≥2} L_j [ A0 + A1 · ln^+( 2 m_j/(L_j−1) ) ]
    + (1/k0) ∑_{j : L_j≥2} A2 · ln m_j
    + (1/k0) ∑_{j : L_j=1} C_fix · (ln m_j + O(1)).
In particular, if a constant fraction of [k0,2k0) is covered by plateaus satisfying L_j ≥ m_j / polylog(k0), then the contribution of those plateaus is O(log log k0), and the remaining fraction must be controlled separately; in the worst case with many L_j=1 plateaus the global average can be Θ(log k0).
Proof.
Average the bound of Theorem 2 over plateaus with weights L_j/k0, and handle L_j=1 plateaus by the fixed-k bound. ∎
Lemma (Monotonicity of the MRS bi-criteria bound).
Let a := 2 + 1/(2e), and for integers s≥1, Δ≥1 define
  F(s,Δ) := min{ a + ln(2s/Δ), 1 + s/(e(Δ−1)) },
where the second term is interpreted only for Δ≥2 (or taken as +∞ for Δ=1). Then:
- For fixed Δ, F is nondecreasing in s.
- For fixed s, F is nonincreasing in Δ (for all Δ≥1 in the above interpretation).
Proof.
For Δ≥2, both functions s ↦ a + ln(2s/Δ) and s ↦ 1 + s/(e(Δ−1)) are nondecreasing in s, hence their pointwise minimum is nondecreasing. For Δ≥2, both functions Δ ↦ a + ln(2s/Δ) and Δ ↦ 1 + s/(e(Δ−1)) are nonincreasing in Δ, hence the minimum is nonincreasing. For the transition from Δ=1 to Δ=2, note that F(s,1) = a + ln(2s) ≥ a + ln(s) ≥ a + ln(2s/2) ≥ F(s,2), since the logarithmic branch decreases with Δ and adding the second branch at Δ=2 can only decrease the minimum. Thus F is nonincreasing in Δ for all Δ≥1. ∎

Theorem 3 (Plateau averaging with a tunable split of the two MRS branches).
Let I = {m, m+1, …, m+L−1} be a factor-2 plateau (i.e., OPT_k ∈ (OPT_m/2, OPT_m] for k∈I) with L≥2. For any integer τ with 1≤τ≤L−1, for k uniform on I and over k-means++ randomness we have
  E_{k∈I} E_++[ ALG_k / OPT_k ]
  ≤ 2·C_bi · [ (τ/(L−1)) · ( a + 1 + ln(2m/τ) )
                + ((L−1−τ)/(L−1))
                + (m/(e(L−1))) · ( H_{L−2} − H_{τ−1} ) ]
    + (C_fix · (ln m + O(1)))/L,
where H_r denotes the r-th harmonic number (H_0:=0).
Proof.
Fix k=m+Δ with Δ∈{1,…,L−1}. By Theorem 1, and Lemma (monotonicity),
  E_++[ALG_{m+Δ}/OPT_{m+Δ}] ≤ 2·C_bi · min{ a + ln(2m/Δ), 1 + m/(e(Δ−1)) },
with the second branch applicable for Δ≥2. Averaging Δ uniformly over {1,…,L−1}, split the sum at τ:
  (1/(L−1)) ∑_{Δ=1}^{L−1} min{…}
  ≤ (1/(L−1)) ∑_{Δ=1}^{τ} [ a + ln(2m/Δ) ]
    + (1/(L−1)) ∑_{Δ=τ+1}^{L−1} [ 1 + m/(e(Δ−1)) ].
For the first sum, use ∑_{Δ=1}^{τ} ln(2m/Δ) = τ ln(2m) − ln(τ!) ≤ τ[1 + ln(2m/τ)] by ln(τ!) ≥ τ ln τ − τ. For the second, ∑_{Δ=τ+1}^{L−1} 1 = L−1−τ and ∑_{Δ=τ+1}^{L−1} 1/(Δ−1) = H_{L−2} − H_{τ−1}. This yields the displayed bound. Finally, incorporate the Δ=0 endpoint k=m which has probability 1/L and contributes at most C_fix·(ln m + O(1))/L by the fixed-k bound. ∎

Corollary 4 (Hybrid extremes recovered; strengthening Theorem 2).
In the setting of Theorem 3:
- Choosing τ = L−1 gives
  E_{k∈I} E_++[ ALG_k / OPT_k ] ≤ 2·C_bi · ( a + 1 + ln(2m/(L−1)) ) + (C_fix · (ln m + O(1)))/L.
  This recovers Theorem 2 (up to constant reparameterization by a and the explicit +1 from Stirling).
- Choosing τ = 1 gives
  E_{k∈I} E_++[ ALG_k / OPT_k ] ≤ 2·C_bi · ( 1 + (a+ln(2m))/(L−1) + (m/(e(L−1))) · H_{L−2} )
    + (C_fix · (ln m + O(1)))/L.
Using H_q ≤ ln q + 1, this yields a complementary regime where the bound scales like 1 + O((ln m)/L) + O((m ln L)/L).
Proof.
Both bounds are immediate from Theorem 3 with the specified τ and the inequality H_q ≤ ln q + 1 for q≥1. ∎

Corollary 5 (Explicit constants on long plateaus).
If L ≥ α m for some fixed α∈(0,1], then for k uniform on I,
  E_{k∈I} E_++[ ALG_k / OPT_k ]
  ≤ 2·C_bi · ( a + 1 + ln(2/α) ) + (C_fix · (ln m + O(1)))/L.
Proof.
Apply Corollary 4 with τ=L−1 and use ln(2m/(L−1)) ≤ ln(2/α) + O(1/L). The endpoint term is unchanged. ∎

Corollary 6 (Quantile-in-Δ guarantee on a plateau).
Fix η∈(0,1) and let T := max{2, ⌈η(L−1)⌉+1}. Then for all Δ∈{T,…,L−1},
  E_++[ ALG_{m+Δ} / OPT_{m+Δ} ] ≤ 2·C_bi · ( 1 + m/( e (T−1) ) ).
Consequently, for k uniform on I, the fraction of k for which the above inequality holds is at least (L−T+1)/L = 1 − η − O(1/L).
Proof.
For Δ≥T, the large-Δ branch gives 1 + m/(e(Δ−1)) ≤ 1 + m/(e(T−1)). Combine with Theorem 1 and monotonicity, and note that the set {k: Δ(k)≥T} has size L−T+1 among the L indices in I. ∎
Remark (Plateau length within [k0,2k0)).
Let I = [m,m+L) be a factor-2 plateau contained in [k0,2k0). Then L ≤ 2k0 − m ≤ m. In particular, for L≥2 we have m/(L−1) ≥ 1.
Proof.
Since m+L−1 ≤ 2k0−1, we have L ≤ 2k0−m. As m ≥ k0, it follows that 2k0−m ≤ m. The final claim is immediate. ∎

Corollary 7 (Min-of-extremes plateau bound).
In the setting of Theorem 3 with L≥2, for k uniform on I and the k-means++ randomness,
  E_{k∈I} E_++[ ALG_k / OPT_k ]
  ≤ min{ B_log, B_hyb } + (C_fix · (ln m + O(1)))/L,
where
  B_log := 2·C_bi · ( a + 1 + ln^+( 2m/(L−1) ) ),
  B_hyb := 2·C_bi · ( 1 + (a+\ln(2m))/(L−1) + (m/(e(L−1))) · H_{L−2} ),
and a := 2 + 1/(2e), H_q denotes the q-th harmonic number with H_0:=0, and ln^+(x):=max{ln x,0}.
Proof.
Take τ=L−1 and τ=1 in Theorem 3 to obtain the two bounds (cf. Corollary 4). Replacing ln by ln^+ only increases the RHS. Taking the minimum preserves validity. ∎

Corollary 8 (Upper envelope from the min-of-extremes).
In the setting of Corollary 7, there exist absolute constants K0,K1,K2 (depending only on C_bi and C_fix) such that
  E_{k∈I} E_++[ ALG_k / OPT_k ]
  ≤ K0 + K1 · min{ ln^+( 2m/(L−1) ), (m ln L)/L } + K2 · (\ln m)/L.
Proof.
From Corollary 7 with the logarithmic extreme,
  E ≤ 2·C_bi·(a+1) + 2·C_bi·ln^+(2m/(L−1)) + (C_fix·(\ln m + O(1)))/L.
From the hybrid extreme and H_{L−2} ≤ ln(L−2)+1 ≤ ln L + 1,
  E ≤ 2·C_bi·\Big( 1 + (a+\ln(2m))/(L−1) + (m/(e(L−1))) (\ln L + 1) \Big)
    + (C_fix·(\ln m + O(1)))/L.
Absorb constants into K0 and the terms (ln m)/(L−1), (m/(L−1)) into K2·(\ln m)/L and K1·(m ln L)/L, respectively, using L−1≈L up to absolute factors for L≥2. Taking the minimum of the two displays yields the claim. ∎

Corollary 9 (Plateau-level probability guarantee via quantiles and Markov; global mixing).
Let I=[m,m+L) be a factor-2 plateau with L≥2 and fix η∈(0,1). Define T := max{2, ⌈η(L−1)⌉+1}. Then for at least a (1−η−O(1/L)) fraction of k∈I we have
  E_++[ ALG_k / OPT_k ] ≤ B_I := 2·C_bi · ( 1 + m/( e (T−1) ) ).
Consequently, for any c≥1,
  P_{k\sim U(I),\,++}\big[ ALG_k/OPT_k ≤ c · B_I \big] ≥ (1−η−O(1/L)) · (1 − 1/c).
If, moreover, L ≥ α m for some α∈(0,1], then B_I ≤ 2·C_bi · (1 + 1/(α e η)) + O(1/L). If a plateau I covers a γ-fraction of [k0,2k0) (i.e., L/k0 ≥ γ), then for k uniform on [k0,2k0) and the ++ randomness,
  P\big[ ALG_k/OPT_k ≤ c · B_I \big] ≥ γ · (1−η−O(1/L)) · (1 − 1/c).
Proof.
The first assertion is Corollary 6: a (1−η−O(1/L)) fraction of k satisfy the displayed per-k bound with Δ≥T, hence with E_++ bounded by B_I. For any such k, Markov’s inequality gives P_{++}[ALG_k/OPT_k ≤ c·B_I] ≥ 1−1/c. Averaging uniformly over k on I yields the claim. If L ≥ α m, then T−1 ≥ η(L−1) ≥ η(α m−1), which implies m/(T−1) ≤ 1/(α η) + O(1/L). The global bound follows by restricting to k in I, which occurs with probability ≥ γ. ∎
Corollary 10 (A τ≈m/ln L branch on a plateau).
Let I=[m,m+L) be a factor-2 plateau with L≥3. Define τ*:=min{L−1, ⌊m/ln L⌋}. Then for k uniform on I and over the k-means++ randomness,
  E_{k∈I} E_++[ ALG_k / OPT_k ]
  ≤ 2·C_bi · [ (τ*/(L−1)) · ( a + 1 + ln(2m/τ*) )
                + ((L−1−τ*)/(L−1))
                + (m/(e(L−1))) · ( H_{L−2} − H_{τ*−1} ) ]
    + (C_fix · (ln m + O(1)))/L,
where a:=2 + 1/(2e), and H_r is the r-th harmonic number (H_0:=0). In particular, if m ≤ (L−1) ln L and (as is the case for plateaus inside [k0,2k0)) m≥L, then
  E_{k∈I} E_++[ ALG_k / OPT_k ]
  ≤ 2·C_bi · [ 1 + (m/((L−1) ln L)) · ( a + 1 + ln(4 ln L) )
                + (m/(e(L−1))) · ( 1 + ln ln L ) ]
    + (C_fix · (ln m + O(1)))/L.
Proof.
Apply Theorem 3 with τ=τ*. The displayed inequality is just Theorem 3. In the subcase m ≤ (L−1) ln L, τ*=⌊m/ln L⌋ satisfies τ* ≥ m/ln L − 1, hence 2m/τ* ≤ 4 ln L and ln(2m/τ*) ≤ ln(4 ln L). Also τ*/(L−1) ≤ m/((L−1) ln L). Finally, H_{L−2} − H_{τ*−1} ≤ ln(L/τ*) + 1 ≤ ln((L ln L)/m) + 1 ≤ 1 + ln ln L, using m≥L. Substituting these bounds into Theorem 3 yields the “in particular” display. ∎

Corollary 11 (Updated per-plateau upper envelope: min-of-three).
In the setting of Corollary 7, there exist absolute constants K0,K1,K2 (depending only on C_bi and C_fix) such that for k uniform on I=[m,m+L) with L≥2,
  E_{k∈I} E_++[ ALG_k / OPT_k ]
  ≤ K0 + K1 · min{ ln^+( 2m/(L−1) ), (m ln L)/L, (m(1 + ln ln L))/L } + K2 · (\ln m)/L.
Here ln^+(x):=max{ln x,0}. The third term in the minimum is intended for L≥3; when L=2 the minimum of the first two terms suffices. 
Proof.
Combine: (i) the logarithmic extreme τ=L−1 (Corollary 4), (ii) the τ=1 hybrid extreme (Corollary 4 with H_{L−2}≤ln L+1), and (iii) Corollary 10 in the subcase τ*=⌊m/ln L⌋ (which holds exactly when m ≤ (L−1) ln L). In case (iii), the two m-dependent contributions are bounded by a constant multiple of (m/L)(1+ln ln L), since (m/((L−1) ln L))(a+1+ln(4 ln L)) ≤ (const)·(m/L) and (m/(e(L−1)))(1+ln ln L) ≤ (const)·(m/L)(1+ln ln L), with all constants depending only on C_bi. Absorb all additive O(1) and O((\ln m)/L) terms into K0 and K2. Taking the minimum of the three displays yields the claim. ∎

Corollary 12 (Explicit constants for the envelope when C_bi=C_fix=5).
Assume C_bi=C_fix=5 and L≥2. Then for k uniform on I=[m,m+L),
  E_{k∈I} E_++[ ALG_k / OPT_k ]
  ≤ 35 + 10 · min{ ln^+(2m/(L−1)), (m ln L)/L, (m(1+\ln\ln L))/L } + 5 · (\ln m)/L.
Proof.
From Corollary 7 (logarithmic extreme), E ≤ 2·C_bi·(a+1) + 2·C_bi·ln^+(2m/(L−1)) + (C_fix·(\ln m + O(1)))/L. With a=2+1/(2e) and C_bi=C_fix=5, 2·C_bi·(a+1) ≈ 31.84; round up to 35 to absorb the endpoint O(1/L) terms. The coefficient in front of ln^+(·) is 2·C_bi=10. For the τ=1 branch, the (m ln L)/L contribution carries a factor 2·C_bi/e ≤ 10/e < 10; rounding up to 10 is safe after replacing L−1 by L. For the τ≈m/ln L branch (Corollary 10), the m-dependent part is ≤ const·(m/L)(1+\ln\ln L) with const depending only on C_bi; choosing 10 dominates those constants as well. The endpoint term is ≤ 5·(\ln m + 2)/L and we keep 5·(\ln m)/L after absorbing the additive 10/L into 35. Taking the minimum of the three candidate bounds proves the display. ∎

Remark (Numerical 1% probability instantiation on a single plateau).
In Corollary 9, choose η=0.98 and c=2. Then for k uniform on I and ++ randomness,
  P[ ALG_k/OPT_k ≤ 2 · B_I ] ≥ (1−η−O(1/L)) · (1 − 1/2) = (0.02−O(1/L)) · 0.5 ≥ 0.01 − O(1/L),
with B_I = 2·C_bi·(1 + m/(e(T−1))) and T = max{2, ⌈0.98(L−1)⌉+1}. If additionally L ≥ α m, then B_I ≤ 2·C_bi·(1 + 1/(α e · 0.98)) + O(1/L), giving a fully explicit constant-factor guarantee at ≥1% mass (up to O(1/L)).
Remark (Clarification on Corollary 12).
In Corollary 12 the third term inside the minimum, (m(1+ln ln L))/L, is intended only for L≥3. For L=2, take the minimum of the first two terms. This mirrors the restriction stated in Corollary 11 and avoids using ln ln 2<0.

Corollary 13 (Global min-of-three aggregation across plateaus; explicit constants available).
Partition [k0,2k0) into maximal factor-2 plateaus I_j=[m_j,m_j+L_j), j=1,…,J, so that ∑_j L_j=k0. Then, for k uniform in [k0,2k0) and the k-means++ randomness,
  E_{k,++}[ ALG_k / OPT_k ]
  ≤ (1/k0) ∑_{j:L_j≥2} L_j · [ K0 + K1 · min{ ln^+(2m_j/(L_j−1)), (m_j ln L_j)/L_j, (m_j(1+ln ln L_j))/L_j } ]
    + (K2/k0) ∑_{j:L_j≥2} ln m_j
    + (1/k0) ∑_{j:L_j=1} C_fix · (ln m_j + O(1)),
where ln^+(x):=max{ln x,0}. The third term in the minimum is to be used only for L_j≥3. Here K0,K1,K2 are absolute constants depending only on C_bi,C_fix. In the numerical case C_bi=C_fix=5 one may take K0=35, K1=10, K2=5.
Proof.
For each j with L_j≥2, apply Corollary 11 to I_j and weight by L_j/k0. For L_j=1, use the fixed-k bound with weight 1/k0. Sum over j. The constants K0,K1,K2 come directly from Corollaries 11–12. ∎

Lemma 1 (Endpoint term cap).
With the notation of Corollary 13,
  (1/k0) ∑_{j:L_j≥2} ln m_j ≤ ln(2k0).
Proof.
There are at most J≤k0 plateaus and for all j we have m_j≤2k0−1. Thus ∑_{j:L_j≥2} ln m_j ≤ ∑_{j=1}^{J} ln(2k0) ≤ k0·ln(2k0). Divide by k0. ∎

Corollary 14 (Unconditional global O(log k0) bound).
There exist absolute constants K′,K″ (depending only on C_bi,C_fix) such that for k uniform on [k0,2k0) and ++ randomness,
  E_{k,++}[ ALG_k / OPT_k ] ≤ K′ + K″ · ln(2k0).
Proof.
Use Theorem 2 (or Corollary 7 with τ=L−1) on each plateau with L_j≥2 and average with weights L_j/k0, and handle L_j=1 via the fixed-k bound. For L_j≥2,
  (1/k0)∑_j L_j · ln^+(2m_j/(L_j−1)) ≤ (1/k0)∑_j L_j · ln(2m_j)
  = ln 2 + (1/k0)∑_j L_j ln m_j.
Since for every k∈I_j we have m_j≤k, ∑_j L_j ln m_j ≤ ∑_{k=k0}^{2k0−1} ln k ≤ k0·ln(2k0), giving a contribution ≤ ln(2k0). The endpoint term is bounded by Lemma 1 up to a constant factor, and the L_j=1 part contributes ≤ C_fix·(ln(2k0)+O(1)). Absorb all absolute factors into K′,K″. ∎

Corollary 15 (Global constant under a single long plateau; explicit constants).
Suppose there exists a plateau I=[m,m+L) contained in [k0,2k0) with L ≥ α m for some α∈(0,1] and covering a γ-fraction of the window (i.e., L/k0 ≥ γ). Then
  E_{k,++}[ ALG_k / OPT_k ]
  ≤ γ · [ 2·C_bi · ( a + 1 + ln(2/α) ) + (C_fix · (\ln m + O(1)))/L ]
    + (1−γ) · [ K′ + K″ · ln(2k0) ],
where a:=2+1/(2e) and K′,K″ are the constants from Corollary 14. In particular, as L→∞ the term (C_fix·(\ln m))/L=o(1), so the γ-contribution is O_α(1).
Proof.
Average Corollary 5 over I (weight L/k0=γ) and use Corollary 14 on the complement fraction 1−γ. ∎

Corollary 16 (Global ≥1% probability under a single long plateau; explicit constants).
Under the assumptions of Corollary 15, let η=0.98, c=2, and define T:=max{2,⌈η(L−1)⌉+1} and
  B_I := 2·C_bi · ( 1 + m / ( e (T−1) ) ).
Then, for k uniform on [k0,2k0) and ++ randomness,
  P[ ALG_k / OPT_k ≤ c · B_I ] ≥ γ · (1−η−O(1/L)) · (1 − 1/c) = 0.01·γ − O(γ/L).
If moreover L ≥ α m, then B_I ≤ 2·C_bi · (1 + 1/(α e η)) + O(1/L). For C_bi=5 and α=1, this yields the explicit threshold c·B_I ≤ 20 · (1 + 1/(0.98 e)) ≈ 27.7 on at least 1%·γ − O(γ/L) of the joint (k,++) mass.
Proof.
Apply Corollary 9 on I (giving a per-k bound with probability ≥(1−η−O(1/L)) and then Markov with c=2, hence factor (1−1/2)), and multiply by the mixing weight L/k0=γ. The long-plateau simplification of B_I follows from m/(T−1) ≤ 1/(α η) + O(1/L). ∎
Corollary 17 (Balanced split τ=⌊L/2⌋: an O(m/L) tail with explicit constants).
Let I=[m,m+L) be a factor-2 plateau with L≥3. Set τ:=⌊L/2⌋. Then, for k uniform on I and over the k-means++ randomness,
  E_{k∈I} E_++[ ALG_k / OPT_k ]
  ≤ 2·C_bi · [ (2/3)·( a + 1 + ln( 4m/(L−1) ) ) + 1/2 + (m/(e(L−1)))·( ln 3 + 1 ) ]
    + (C_fix · (ln m + O(1)))/L,
where a:=2 + 1/(2e).
Proof.
Apply Theorem 3 with τ=⌊L/2⌋ and use the uniform bounds for L≥3: τ/(L−1)≤2/3; (L−1−τ)/(L−1)≤1/2; ln(2m/τ)≤ln(4m/(L−1)); and H_{L−2}−H_{τ−1}≤ln 3 + 1 (verified directly for L=3,4 and by monotonicity of H_n−H_m thereafter). Substitute these into Theorem 3. The endpoint term is unchanged. ∎

Corollary 18 (Multi-plateau ≥1% probability guarantee by mixing).
Let {I_j=[m_j,m_j+L_j)} be disjoint factor-2 plateaus with L_j≥α m_j for all j in some index set J, and let their total coverage be γ:= (1/k0)∑_{j∈J} L_j. Fix η∈(0,1) and c≥1. For each j set T_j:=max{2, ⌈η(L_j−1)⌉+1} and B_j:=2·C_bi·(1 + m_j/(e(T_j−1))). Then, for k uniform on [k0,2k0) and over the ++ randomness,
  P\big[ ALG_k/OPT_k ≤ c · B_j for the unique j with k∈I_j \big]
  ≥ γ · (1−η) · (1 − 1/c) − O( γ / L_{\min} ),
where L_{\min}:=\min_{j∈J} L_j. In particular, with η=0.98 and c=2 this gives
  P[ ALG_k/OPT_k ≤ 2·B_j for the unique j with k∈I_j ] ≥ 0.01·γ − O(γ/L_{\min}).
Moreover, if L_j≥α m_j for all j, then B_j ≤ 2·C_bi·(1 + 1/(α e η)) + O(1/L_j), so a uniform threshold B_*=2·C_bi·(1 + 1/(α e η)) + o(1) can be used.
Proof.
Apply Corollary 9 on each plateau I_j with the same (η,c), yielding for k uniform on I_j the bound E_++[ALG_k/OPT_k]≤B_j on a (1−η−O(1/L_j)) fraction of k. For any such k, Markov gives P_{++}[ALG_k/OPT_k ≤ c·B_j]≥1−1/c. Weighting by L_j/k0 and summing over j∈J produces the stated lower bound. The O(·) term is ∑_j (L_j/k0)·O(1/L_j)=O(|J|/k0)=O(γ/L_{\min}). The long-plateau simplification of B_j follows from m_j/(T_j−1)≤1/(α η)+O(1/L_j). ∎

Lemma 2 (Discrete smoothness implies long plateaus).
Let (v_k)_{k≥1} be a nonincreasing positive sequence. Fix integers m≥1 and L≥2. Suppose that for all k∈{m+1,…,m+L−1} we have
  v_{k−1} ≤ (1+δ)·v_k
for some δ∈(0,1). Then
  v_{m+L−1} ≥ v_m / (1+δ)^{L−1}.
Consequently, if a factor-2 drop occurs within [m,m+L) (i.e., v_{m+L−1} ≤ v_m/2), then necessarily
  L ≥ 1 + ⌈ ln 2 / ln(1+δ) ⌉ ≥ 1 + ⌈ (\ln 2)/δ ⌉.
Proof.
Iterating the inequality gives v_{m+t} ≥ v_m/(1+δ)^t for 0≤t≤L−1. If v_{m+L−1}≤v_m/2, then (1+δ)^{L−1}≥2, which is equivalent to L≥1+⌈ln 2/ln(1+δ)⌉. Since ln(1+δ)≤δ, the second inequality follows. ∎

Corollary 19 (1/m-type discrete smoothness on [m,2m) forces long plateaus).
Let (v_k) be nonincreasing and assume that for some absolute A>0 and all k∈{m+1,…,2m−1},
  v_{k−1} ≤ (1 + A/m)·v_k.
Then any factor-2 drop within [m,2m) requires
  L ≥ 1 + ⌈ (\ln 2)·m / A ⌉.
In particular: if A≥\ln 2 then L ≥ ((\ln 2)/A)·m up to +1 rounding; if A<\ln 2, then a factor-2 drop cannot occur within the window and the entire [m,2m) is one plateau (L=m).
Proof.
Apply Lemma 2 with δ=A/m and note that the window has at most m steps, so if 1+⌈(\ln 2)·m/A⌉>m then the drop cannot happen within [m,2m). ∎

Corollary 20 (Quantified O(log log k0) mixture under polylog-long plateaus).
Fix σ≥1 and let S be the set of plateaus I_j=[m_j,m_j+L_j) with L_j ≥ m_j/(\ln k0)^σ. Suppose these plateaus cover a γ-fraction of [k0,2k0), i.e., ∑_{j∈S} L_j ≥ γ k0. Then, for k uniform on [k0,2k0) and ++ randomness,
  E_{k,++}[ ALG_k / OPT_k ]
  ≤ γ · [ 2·C_bi · ( a + 1 + ln 2 + σ·\ln\ln k0 ) ]
    + (1−γ) · [ K′ + K″·\ln(2k0) ]
    + o(1),
where a:=2+1/(2e) and K′,K″ are the constants from Corollary 14. The o(1) term can be taken as O( (\ln(2k0)) (\ln k0)^σ / k0 ).
Proof.
On each I_j∈S, Corollary 5 with α=1/(\ln k0)^σ yields E_{k∈I_j,++}[ALG/OPT] ≤ 2·C_bi·(a+1+\ln(2/α)) + (C_fix·\ln m_j)/L_j. Since \ln(2/α)=\ln 2 + σ·\ln\ln k0, the first term equals the bracket. Weighting by L_j/k0 and summing over j∈S gives γ times the bracket plus (C_fix/k0)∑_{j∈S}\ln m_j. Now |S|≤(∑_{j∈S} L_j)/\min_{j∈S} L_j ≤ γ k0 / (k0/(\ln k0)^σ) = γ (\ln k0)^σ, so (C_fix/k0)∑_{j∈S}\ln m_j ≤ C_fix·|S|·\ln(2k0)/k0 = O( (\ln(2k0))(\ln k0)^σ / k0 ) = o(1). The complement fraction 1−γ is bounded by Corollary 14. ∎
Corollary 21 (Unconditional Markov tail from the global expectation).
Let k be uniform on [k0,2k0) and consider the joint randomness of k and k-means++. There exist absolute constants K′,K″ (as in Corollary 14) such that for any c≥1,
  P\big[ ALG_k / OPT_k ≤ c · (K′ + K″ · \ln(2k0)) \big] ≥ 1 − 1/c.
Proof.
Let Z := ALG_k/OPT_k. By Corollary 14, E[Z] ≤ K′ + K″ · ln(2k0). Markov’s inequality gives
  P[ Z ≥ c · (K′ + K″ · ln(2k0)) ] ≤ E[Z]/(c · (K′ + K″ · ln(2k0))) ≤ 1/c,
which is equivalent to the stated lower tail bound. ∎

Remark (Median-level 25% plateau-level probability).
In Corollary 9, choose η=1/2 and c=2. Then for any plateau I=[m,m+L) with L≥2,
  P_{k∈I,++}[ ALG_k/OPT_k ≤ 2 · B_I ] ≥ 1/4 − O(1/L),
where B_I = 2·C_bi · ( 1 + m/( e (T−1) ) ) and T = max{2, ⌈(L−1)/2⌉+1}.

Corollary 22 (Global O_A(1) average under discrete 1/k-smoothness across the window).
Assume that for some A>0 and all k∈{k0+1,…,2k0−1} we have
  ln( OPT_{k−1} / OPT_k ) ≤ A/k  (equivalently, OPT_{k−1} ≤ (1 + A/k)·OPT_k).
Then, for k uniform on [k0,2k0) and over the k-means++ randomness,
  E_{k,++}[ ALG_k / OPT_k ] ≤ 2·C_bi · ( a + 1 + \ln( 2A/\ln 2 ) ) + o(1)  as k0→∞,
where a:=2 + 1/(2e). In particular, the RHS depends only on A and C_bi.
Proof.
Fix a maximal factor-2 plateau I_j=[m_j,m_j+L_j) within [k0,2k0). Since A/k ≤ A/m_j for k≥m_j, we have OPT_{k−1} ≤ (1 + A/m_j)·OPT_k for all k∈{m_j+1,…,m_j+L_j−1}. Applying Lemma 2 with δ=A/m_j yields L_j ≥ 1 + ⌈(\ln 2)·m_j/A⌉, i.e., L_j ≥ (\ln 2)·m_j/A up to +O(1). Thus each plateau is long with α:=(\ln 2)/A. By Corollary 5,
  E_{k∈I_j} E_++[ ALG/OPT ] ≤ 2·C_bi · ( a + 1 + \ln(2/α) ) + (C_fix·\ln m_j)/L_j.
Summing with weights L_j/k0 across plateaus (Corollary 13) yields
  E_{k,++}[ ALG/OPT ] ≤ 2·C_bi · ( a + 1 + \ln(2A/\ln 2) ) + (C_fix/k0)∑_j \ln m_j.
The number of plateaus J across [k0,2k0) is O(A): indeed, m_{j+1} ≥ m_j + (\ln 2)·m_j/A = (1 + (\ln 2)/A)·m_j, so J ≤ ⌈ \ln 2 / \ln(1 + (\ln 2)/A) ⌉ = O(A). Hence (C_fix/k0)∑_j \ln m_j ≤ C_fix·J·\ln(2k0)/k0 = o(1) as k0→∞. ∎

Corollary 23 (Two-sided power-law envelope on the window implies a global O(1) average).
Fix p>0 and constants C_1,C_2>0 with ρ:=C_2/C_1. Suppose that for all k∈[k0,2k0) we have
  C_1 · k^{−p} ≤ OPT_k ≤ C_2 · k^{−p}.
Define α_0 := ((2ρ)^{1/p} − 1) and set α := min{1, α_0} ∈ (0,1]. Then, for k uniform on [k0,2k0) and k-means++ randomness,
  E_{k,++}[ ALG_k / OPT_k ] ≤ 2·C_bi · ( a + 1 + \ln(2/α) ) + o(1)  as k0→∞,
where a:=2 + 1/(2e), and the implicit constants depend only on p and ρ.
Proof.
Let I=[m,m+L) be a maximal factor-2 plateau inside the window. For any t with 0≤t≤⌊α m⌋−1,
  OPT_{m+t} / OPT_m ≥ (C_1 (m+t)^{−p}) / (C_2 m^{−p}) = (C_1/C_2) · (m/(m+t))^p ≥ (C_1/C_2) · (1/(1+α))^p.
By the choice of α≤α_0 we have (C_1/C_2)·(1/(1+α))^p ≥ 1/2, hence OPT_{m+t} > OPT_m/2. Therefore the plateau length satisfies L ≥ ⌊α m⌋. Applying Corollary 5 with this α gives for each plateau
  E_{k∈I} E_++[ ALG/OPT ] ≤ 2·C_bi · ( a + 1 + \ln(2/α) ) + (C_fix·\ln m)/L.
Across [k0,2k0) the number of plateaus is O_{p,ρ}(1), since m increases by at least a factor 1+α from plateau to plateau until reaching 2k0. Weighting by L/k0 and summing (Corollary 13) yields the stated global bound, with the endpoint contribution (C_fix/k0)∑ \ln m_j = o(1) because the sum has O_{p,ρ}(1) terms. ∎
