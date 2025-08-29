## Round 0007 — 2025-08-27T20:14:27.749940Z

Round 0007 — New probability guarantees (two-level Markov), explicit global constants, and audit notes

Summary
- I propose a simple, unconditional probability bound that holds on the whole window [k0,2k0): a two-level Markov argument yields a constant-mass guarantee that ALG/OPT is O(log k0) with explicit constants. This meets the “≥0.01 probability” alternative formulation and is stronger (gives ≥25% mass) without any structural assumptions on OPT(·).
- I also instantiate the resulting threshold explicitly when C_bi=C_fix=5, giving a clean numeric bound. The proof only uses the already curated plateau average bounds (Corollary 11/12) and Markov’s inequality.
- Minor audit: I see no correctness issues in output.md. I point out one easy-to-curate addition (the two-level Markov corollary) and provide all steps and constants needed.

Idea — Two-level Markov to get constant joint (k,++) probability
- Setting. For each maximal factor-2 plateau I_j=[m_j,m_j+L_j) with L_j≥2, let
  B_j := K0 + K1·min{ ln^+(2m_j/(L_j−1)), (m_j ln L_j)/L_j, (m_j(1+ln ln L_j))/L_j } + K2·(ln m_j)/L_j
  be the per-plateau envelope from Corollary 11. For L_j=1, use the fixed-k bound D_j := C_fix(ln m_j+O(1)). Let
  B_max := max{ max_{j:L_j≥2} B_j,  max_{j:L_j=1} D_j }.
- Two-level Markov (plateau-agnostic). For each k in [k0,2k0), define Y_k := E_++[ALG_k/OPT_k | k]. From Corollary 11 and the fixed-k bound, Y_k ≤ B_{plateau(k)} ≤ B_max. Then for any c≥1:
  1) Over k, Markov gives P_k[Y_k ≤ c·B_max] ≥ 1 − 1/c.
  2) Conditional on any such k, Markov over ++ gives P_{++}[ ALG_k/OPT_k ≤ c·Y_k ] ≥ 1 − 1/c.
  Combining and using c·Y_k ≤ c·(c·B_max) = c^2·B_max yields the joint bound
  P_{k,++}[ ALG_k/OPT_k ≤ c^2 · B_max ] ≥ (1 − 1/c)^2.
- Consequence (take c=2). With probability at least 1/4 over the joint (k,++) randomness,
  ALG_k/OPT_k ≤ 4·B_max.
- This requires no structural conditions on OPT(·) (no long plateaus, etc.) and directly addresses the alternative task statement (probability ≥ 0.01) with ≥ 0.25.

Explicit global bound on B_max
- For L_j≥2, min{·} ≤ ln^+(2m_j/(L_j−1)) ≤ ln(2·(2k0)/1) = ln(4k0), and (ln m_j)/L_j ≤ (ln(2k0))/2. Hence for L_j≥2,
  B_j ≤ K0 + K1·ln(4k0) + (K2/2)·ln(2k0).
- For L_j=1, D_j ≤ C_fix(ln(2k0)+O(1)). Thus
  B_max ≤ max{ K0 + K1·ln(4k0) + (K2/2)·ln(2k0),  C_fix(ln(2k0)+O(1)) }.
- Instantiation when C_bi=C_fix=5 and K0=35, K1=10, K2=5 (from Corollary 12):
  • L_j≥2: 35 + 10·ln(4k0) + (5/2)·ln(2k0) = 35 + 10 ln 4 + 2.5 ln 2 + 12.5 ln k0 ≈ 50.6 + 12.5 ln k0.
  • L_j=1: 5(ln(2k0)+O(1)) ≤ 10 + 5 ln(2k0).
  For k0 large, the first dominates; a safe uniform bound is
    B_max ≤ 45 + 12.5·ln(2k0)   (conservative; absorbs the O(1) from the L=1 case).

New corollary (proposed for output.md): Unconditional ≥25% probability bound
- Statement. For k uniform on [k0,2k0) and k-means++ randomness, and with B_max as above,
  P[ ALG_k/OPT_k ≤ 4·B_max ] ≥ 1/4.
  In particular, if C_bi=C_fix=5, then for all k0≥2,
  P[ ALG_k/OPT_k ≤ 4(45 + 12.5·ln(2k0)) ] ≥ 1/4,
  i.e., P[ ALG_k/OPT_k ≤ 180 + 50·ln(2k0) ] ≥ 1/4.
- Proof. Immediate from the two-level Markov argument with c=2 and the bound on B_max above. (For small k0 the additive constants can be slightly tightened; the stated numbers are conservative and uniform.)
- Parametric variant. For any c≥1,
  P[ ALG_k/OPT_k ≤ c^2·B_max ] ≥ (1 − 1/c)^2.
  This yields a continuum of tradeoffs; e.g., c=10 gives probability ≥0.81 for a threshold 100·B_max.

Why this is useful
- It gives a clean, structure-free probability guarantee for the alternative task goal (“bound attained with probability ≥0.01”), actually with 25% mass and explicit O(log k0) thresholds.
- It complements Corollary 16/18 (which give stronger constants on long plateaus) by providing a baseline bound even when no plateau is long.
- It is derived entirely from existing curated statements (Corollary 11/12 and the fixed‑k bound), and thus is easy to verify and insert.

Examples and sanity checks
- Worst-case short plateaus (L_j=1 for almost all j): B_max is governed by the fixed-k term 5(ln(2k0)+O(1)), hence the corollary still yields an O(log k0) threshold at ≥25% mass.
- Single long plateau (L≈m): B_max is O(1) (Corollary 5), so the same two-level Markov gives an O(1) threshold with ≥25% mass, consistent with Corollary 16’s stronger constants for ≥1% mass.

Minor audit of output.md (this round)
- The min-of-three per-plateau bound (Corollary 11) and its explicit-constant instantiation (Corollary 12) are correctly stated, including the L≥3 caveat for the third branch.
- Global aggregation (Corollary 13), unconditional O(log k0) (Corollary 14), long-plateau mixture (Corollary 15), and multi-plateau probability (Corollary 18) are coherent. Endpoint-sum control (Lemma 1) is clean and used properly. I see no correctness issues.

Next steps (curation-ready)
1) Add the “Two-level Markov” corollary above to output.md (plateau-agnostic ≥25% probability bound), with the parametric c≥1 version. Include the explicit numeric instantiation for C_bi=C_fix=5.
2) Optionally note (as a remark) that for any target probability p∈(0,1), choosing c=(1−√p)^{-1} gives P≥p at threshold c^2·B_max, making the tradeoff explicit.
3) If desired, very slightly tighten the numeric constant in B_max (e.g., B_max ≤ 42 + 12.5 ln(2k0) as argued in-line); the current 45 + 12.5 ln(2k0) statement is safe and simple.

Obstacles and open items
- Heavy coverage under scale separation: the key “persistence” denominator (cost_t(all) ≥ (β+1)·U_t(H) before heavy coverage completes) remains to be established under clean separation hypotheses. Once proved, the expected-collisions bound can follow by summing conditional probabilities; then Freedman’s inequality can lift to high probability.
- Lower bounds under random-k smoothing: constructing a single dataset producing Ω(log k0) average (or comparable ≥p probability) across the entire window remains open; existing fixed‑k lower bounds depend on k.

