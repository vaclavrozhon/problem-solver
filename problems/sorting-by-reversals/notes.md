Setting and notation
- Input size n=2^d. The specific permutation A_0 is bit-reversal order of [0,…,n−1]. For j∈{0,…,d−1} we color elements by their j-th bit and denote by B_j(A) the number of monochromatic runs (contiguous blocks of equal j-bit) in the array A. Let T_j(A)⊆{1,…,n−1} be the set of j-run boundary indices (|T_j(A)|=B_j(A)−1). We consider one-step operations that swap a family of disjoint adjacent interval pairs in parallel.
- Our model of one step coincides with PBT (parallel adjacent block transpositions). One step chooses disjoint pairs (L_k,R_k) of adjacent contiguous intervals and swaps every chosen pair simultaneously.

Endpoint calibration (bit-reversal vs sorted)
- For A_0 (bit-reversal), B_j(A_0)=2^{j+1}. For the fully sorted order A_* = [0,1,…,n−1], B_j(A_*)=2^{d−j}. Consequently, the potential Φ(A):=Σ_{j=0}^{d−1} |log_2 B_j(A) − (d−j)| satisfies Φ(A_0)=Θ(d^2) and Φ(A_*)=0.

Locality of changes per pair and a safe per-level cap
- A single swapped pair (L,R) can alter adjacency only at three indices: the left outer boundary before L, the inner boundary between L and R, and the right outer boundary after R. For a fixed level j, if the union L∪R contains no j-boundary of the current array A, then all three affected adjacencies are between same colors both before and after; hence this pair produces no change in B_j.
- Therefore only pairs whose union contains at least one element of T_j(A) can affect B_j. Because the pair unions are disjoint, the number of such pairs is at most |T_j(A)|=B_j(A)−1. Each such pair contributes at most 3 to |B_j(A′)−B_j(A)|. Hence for every j and every PBT step A→A′,
  |B_j(A′) − B_j(A)| ≤ 3(B_j(A) − 1),
  which implies the multiplicative cap B_j(A′) ≤ 4·B_j(A) and B_j(A) ≤ 4·B_j(A′). In particular, |Δ log_2 B_j| ≤ 2 per step.

Dyadic alignment for A_0
- Let G_j denote the j-run boundary set in A_0. Then G_j = { i∈{1,…,n−1} : 2^{d−1−j} divides i }. For any set S of cut indices used in a step, one has
  Σ_{j=0}^{d−1} |S ∩ G_j| = Σ_{i∈S} (1 + v_2(i)) ≤ |S| (1 + ⌊log_2(n−1)⌋),
  since the number of j for which i∈G_j equals 1+v_2(i).

Caveats and corrections to earlier sketches
- The previously proposed “useful boundary” set U_j (indices in or adjacent to T_j(A)) is not a valid certificate for where toggles can occur: the post-step adjacency at a changed index depends on elements imported from potentially far away; mere distance-1 proximity to T_j(A) is insufficient to characterize where toggles can or cannot happen. We avoid using U_j.
- A claimed “size lemma” of the form Δ_j ≤ C·Σ_p min{1, s(p)/L_j} is false deterministically. Short pairs can be aligned to j-gridlines so that Δ_j ≍ n/L_j while the RHS is ≍ n/L_j^2. Any valid size-sensitive bound must use a different aggregation (see Next steps).
- Edge-to-level weighting that relies on fixed dyadic gridlines E_j holds at A_0 but not after the array evolves; after one step the j-boundaries are no longer constrained to those gridlines.

Next steps (program)
1) Try to sharpen the per-level cap to factor 2: Show |B_j(A′)−B_j(A)| ≤ c·|T_j(A)∪T_j(A′)| with small c (ideally c=1 or 2) by charging every toggling edge to a unique j-boundary contained in the union of the pair in either A or A′.
2) Demand for central matches: Prove that achieving a constant-factor decrease of B_j in one step requires Θ(B_j) central-boundary alignments (inner boundaries of swapped pairs) with j-run boundaries of A; outer-boundary hits alone cannot effect global coalescence. Make this precise and robust to local cancellations.
3) Cross-level scarcity via “home levels”: For each pair p of total size s(p), assign h(p) with L_{h(p)}≈s(p). Prove that constant-factor progress at level j needs Σ_{p: h(p)=j} Ω(1) contribution. Since Σ_p s(p) ≤ n and the sets {p: h(p)=j} are disjoint across j, only O(1) levels can make factor-≥2 progress in the same step. First prove the equal-scale special case (all pairs have sizes within ×2 of some L), which should already yield an Ω(log^2 n) lower bound for that restricted class.
4) Use the dyadic structure of G_j at A_0 to formalize a “central-boundary alignment trade-off” across levels: matched central boundaries that effect progress for one j are largely incompatible with those needed for many other j due to disjointness and dyadic spacing.
5) Perform small-n experiments (n=16,32) to estimate the maximal number of levels that can experience ≥2× change in B_j in one step and to guide constants.
New: toggle-locality identity and consequences
- Let A→A′ be one PBT step and let S⊆{1,…,n−1} be the set of indices whose adjacency changes in this step (exactly three per matched pair: left outer, inner, right outer; omit outer ones at array ends if absent). For each j, let T_j(A) be the set of j-run boundary indices (|T_j(A)|=B_j(A)−1).
- Identity (toggle-locality). For every j,
  B_j(A′) − B_j(A) = |T_j(A′) ∩ S| − |T_j(A) ∩ S|.
  Reason: outside S, adjacencies (and hence boundary membership) are identical in A and A′, so T_j(A′) Δ T_j(A) ⊆ S, which implies the stated cardinality identity.
- Corollary (one-sided bounds). For every j,
  Decrease_j := max{0, B_j(A) − B_j(A′)} ≤ |T_j(A) ∩ S|,
  Increase_j := max{0, B_j(A′) − B_j(A)} ≤ |S \ T_j(A)|.
  Interpretation: shrinking B_j by Δ forces at least Δ of the changed indices to land on current j-boundaries.

Improved per-level cap via per-pair ±2
- Per pair (L,R) and fixed j, define Δ_pair as the change in the number of j-boundaries attributable to that pair; then |Δ_pair| ≤ 2 (prove by the binary 4-cycle inequality on the three interfaces). In addition, only pairs whose union is non-monochromatic at level j can contribute, and such pairs are at most |T_j(A)| by disjointness (charge to an internal j-boundary index).
- Summing gives |B_j(A′)−B_j(A)| ≤ 2·|T_j(A)| = 2(B_j(A)−1). Applying the bound to the inverse step yields the multiplicative cap B_j(A′) ≤ 3B_j(A) and B_j(A) ≤ 3B_j(A′). Thus |Δ log_2 B_j| ≤ log_2 3 per step.

Weighted dyadic alignment at A_0 and a corrected weighted bound
- For A_0, G_j = T_j(A_0) is the dyadic grid {i: 2^{d−1−j} | i}. For any set S of changed indices, Σ_j |S∩G_j| = Σ_{i∈S} (1+v_2(i)). More generally, for nonnegative weights a_j, Σ_j a_j·|S∩G_j| = Σ_{i∈S} Σ_{j: i∈G_j} a_j.
- Combining with toggle-locality yields the exact inequality Σ_j a_j·Decrease_j ≤ Σ_{i∈S} Σ_{j: i∈G_j} a_j. For the specific weights a_j=2^{−(j+1)}, if v_2(i)=t then Σ_{j: i∈G_j} 2^{−(j+1)} = 2^{−(d−t−1)}(1−2^{−(t+1)}) ≤ 2^{−d+t+1}. Thus Σ_j 2^{−(j+1)}·Decrease_j ≤ Σ_{i∈S} 2^{−d+v_2(i)+1}. (This corrects a factor-2 slip in an earlier draft.)

Caution on “equal-scale first-step scarcity from A_0”
- The claim “if L_j > s then every union U=L∪R is j-monochromatic in A_0” is false. Counterexample (n=8, j=0): L_j=4; a union U of size s=2 that straddles the unique G_0 index at 4 is not monochromatic.
- What does hold: the per-pair ±2 bound implies |ΔB_j| ≤ 2m ≤ 2n/s for any j. From A_0 this yields that if L_j ≪ s then |ΔB_j|/B_j(A_0) ≤ O(L_j/s)=o(1), so constant-factor decreases at such j are impossible in that step. This does not preclude large changes when L_j ≫ s; additional structure (e.g., grid-aligned inner boundaries) seems necessary to prove an O(1) cap on the number of “active levels”.

Planned direction: equal-scale, grid-aligned scarcity
- Assume an L-aligned step: pair sizes in [L,2L) and all inner boundaries on the L-grid. For A starting at A_0, use arithmetic progression intersections to show that for off-scale j (2^{d−1−j} far from L) the proportion |S∩G_j|/B_j is o(1); combine with toggle-locality to rule out constant-factor decreases at those j. Only O(1) consecutive j with 2^{d−1−j}∈[L/2,2L] can be “active”. Control outer-boundary contributions by noting they contribute only O(#pairs) points, spread over a constant number of L-residue classes.

Next steps (actionable)
1) Write the full aligned-scarcity proof, including the precise bounds on |S∩G_j| and |S\G_j| for off-scale j.
2) Extend to near-alignment by averaging over residues modulo L to extract a constant-aligned subfamily.
3) Develop a central-vs-outer charging lemma: quantify the fraction of Decrease_j that must be paid by inner boundaries hitting T_j(A), uniformly over steps. This will dovetail with a home-level charging scheme for pairs.
4) Continue small-n experiments (n=32,64,128) to probe the number of levels with ≥ constant-factor decreases under equal-scale steps.
New exact identities, corrections, and scale-weighted constraints

1) Exact Hamming-sum identity across levels
- For any array A, define HD_A(i) as the Hamming distance (in d bits) between the values at positions i and i+1. Then for all A,
  Σ_{j=0}^{d−1} (B_j(A) − 1) = Σ_{i=1}^{n−1} HD_A(i).
- Across one step A→A′ with changed-adjacency set S (three per pair),
  Σ_{j=0}^{d−1} (B_j(A′) − B_j(A)) = Σ_{i∈S} (HD_{A′}(i) − HD_A(i)).
Explanation: For each i, the indicator that i∈T_j(A) is exactly the indicator that the j-th bits at i and i+1 differ; summing over j gives HD_A(i). Subtracting two arrays and noting HD is unchanged outside S yields the step identity. This is complementary to toggle-locality and shows per changed index the total boundary mass across all levels changes by at most d.

2) Sub-run regime from A_0: corrected one-sided statement
- Setup: A=A_0, fix j and its run length L_j=2^{d−1−j}. Consider a single pair (L,R) with union U of length s=|U|.
- Fact (geometry on G_j): If s<L_j then among the three changed indices of this pair (left outer, inner, right outer), at most one index belongs to G_j=T_j(A_0). Indeed, the three indices lie in an index interval of length s, which contains at most one multiple of L_j.
- Consequence (decrease-only). For such a pair and level j, the per-pair j-decrease is ≤1 (toggle-locality gives Decrease_j ≤ |T_j(A_0)∩S_pair| ≤ 1). Caution: increases can be as large as +2 in this regime (e.g., when the pair straddles a single j-boundary), so |Δ_pair(j)| is not ≤1 in general.
- Counterexample to the |Δ_pair(j)|≤1 claim: Let L be the last item of a j-run and R the first item of the next j-run in A_0; then s=2<L_j. Before the swap, only the inner interface is a j-boundary; after swapping, all three interfaces are j-boundaries, so the per-pair change is Δ_pair(j)=−2 (B_j increases by 2).

3) “Decrease-only alignment bound” as stated is false
- The claim “if all pair boundaries lie on the L-grid then for j with L_j∤L one has Decrease_j=0” does not hold. Even if S⊆{multiples of L}, S can still contain indices that are also multiples of L_j (e.g., multiples of lcm(L,L_j)), so |G_j∩S| may be nonempty. Toggle-locality alone cannot force Decrease_j=0 under this assumption. Any valid one-sided alignment bound must add further structure about which L-residue classes are used by S.

4) A clean large-scale weighted inequality from A_0
- For A=A_0 and any power-of-two L=2^ℓ,
  Σ_{j: L_j≥L} (L/L_j)·Decrease_j ≤ 2|S|.
  In steps with m pairs, this gives Σ_{j: L_j≥L} (L/L_j)·Decrease_j ≤ 6m. If in addition all pair lengths lie in [L,2L), then m≤n/L, yielding Σ_{j: L_j≥L} (L/L_j)·Decrease_j ≤ 6n/L.
- Proof idea: Combine toggle-locality with the dyadic alignment of G_j in A_0; for i with v_2(i)=t, the inner sum Σ_{j: i∈G_j, L_j≥L} (L/L_j)=Σ_{s=ℓ}^{t}2^{ℓ−s}≤2.

5) On small-scale control (sketch; not yet curated)
- Using weights w_j:=1/B_j(A_0)=L_j/n, toggle-locality and dyadic alignment give
  Σ_j w_j·Decrease_j ≤ (2/n)·Σ_{i∈S} 2^{v_2(i)}.
- Two routes to control the RHS:
  (a) General extremal bound: For any K-subset S⊆{1,…,n−1}, prove Σ_{i∈S}2^{v_2(i)} ≤ C K log(2n/K). With K≤|S|≤3m≤3n/L this yields Σ_{j: L_j<L} Decrease_j/B_j(A_0) ≤ O((log L)/L).
  (b) L-grid inner-boundary route: If a “central-boundary demand” lemma shows small-scale decreases must be paid mostly by inner boundaries, then restricting to S_inner⊆{multiples of L} gives Σ_{i∈S_inner}2^{v_2(i)} ≤ 2^ℓ·Σ_{k≤n/L}2^{v_2(k)} = O(n·log(n/L)), hence Σ_j Decrease_j/B_j(A_0) ≤ O(log(n/L)/L).
- Either route needs a complete proof before inclusion in output.

6) Reassessment of the “O(1) active levels per step)” heuristic
- In aligned steps at very small scale (e.g., L=1), S can intersect G_j at Θ(B_j(A_0)) for Θ(log n) many j simultaneously, so any argument purely bounding the number of active levels is untenable. Scale-sensitive weighted bounds (as above) are the right replacements.

7) Restricted-phase milestone
- For algorithms operating in phases with pair sizes in [L_t,2L_t) and inner L_t-grid alignment, define a phase-weighted potential Ψ_t(A) concentrated near the home scale L_t. Combine the large-scale inequality in (4) with a proved small-scale control to show O(1) drop per phase, yielding Ω(log^2 n) steps across scales.

Actionable next steps
- Prove a sharp bound on Σ_{i∈S}2^{v_2(i)} via route (a) or (b) above.
- Complete a per-pair six-bit case analysis; extract a “central-boundary demand” lemma quantifying the necessary contribution of the inner boundary for large decreases at a fixed j.
- Design signed cross-level weights using the Hamming-sum identity to bound per-index signed contributions by O(1). Validate on small-n instances.
New rigorously verified bounds from A_0 (bit-reversal start)

- Extremal 2-adic sum bound. For N≥1 and any K-subset S⊆{1,…,N}, one has
  \[\sum_{i\in S} 2^{v_2(i)} \le N\,H_K,\]
  where H_K is the K-th harmonic number. This is sharp up to constants and will be our default way to control 2-adic weighted sums over changed indices.

- Small-scale fractional decrease bound (first step from A_0). For L=2^\ell,
  \[\sum_{j: L_j<L} \frac{\mathrm{Decrease}_j}{B_j(A_0)} \le \frac{2}{nL}\sum_{i\in S} 2^{v_2(i)}.\]
  Combining with the extremal bound and |S|=K≤3m gives
  \[\sum_{j: L_j<L} \frac{\mathrm{Decrease}_j}{B_j(A_0)} \le \frac{2}{L} H_K \le \frac{2}{L} H_{3m}=O\!\left(\frac{\log m}{L}\right).\]
  Under equal-scale steps (all pair lengths in [L,2L)), we have m≤n/L and thus
  \[\sum_{j: L_j<L} \frac{\mathrm{Decrease}_j}{B_j(A_0)} = O\!\left(\frac{\log(n/L)}{L}\right).\]
  Immediate counting corollary: for any \(\theta\in(0,1]\), the number of levels j with L_j<L and \(\mathrm{Decrease}_j \ge \theta\,B_j(A_0)\) is at most \(O((\log(n/L))/(\theta L))\).

- Geometric-window weighted decrease (first step from A_0). Fix \(\beta\in(0,1/2)\) and a home scale L=2^\ell. Define weights \(a_j(L):=\beta^{\,| (d-1-j) - \ell |}/2^{j+1}\). Then
  \[\sum_j a_j(L)\,\mathrm{Decrease}_j \le C_\beta\,(L/n)\,|S|,\quad C_\beta=\frac{1}{1-\beta/2}+\frac{1}{1-2\beta}.\]
  In equal-scale steps, \(|S|\le 3m\le 3n/L\), so \(\sum_j a_j(L)\,\mathrm{Decrease}_j\le 3C_\beta=O(1)\).

Corrections to earlier sketches
- A previously claimed “layer-cake” estimate \(\sum_{i\in S}2^{v_2(i)}\le C n (1+\log(n/m))\) is not tight and in general false for large m; the correct universal upper bound is \(\sum_{i\in S}2^{v_2(i)}\le (n-1) H_{|S|}=O(n\log|S|)=O(n\log m)\).
- The specialization \(O((\log L)/L)\) for \(\sum_{j: L_j<L}\mathrm{Decrease}_j/B_j(A_0)\) does not follow in general; the correct equal-scale bound is \(O((\log(n/L))/L)\).

How these fit the program
- Together with Theorem 8 (large-scale weighted decreases), the new small-scale bound pinches progress from both sides at a chosen L, and the geometric-window lemma concentrates the accounting near L with an O(1) per-step cap (from A_0). This strongly motivates a phase potential centered at L and a proof of O(1) drop per equal-scale phase.

Next steps (refined)
1) Formalize an equal-scale phase potential that combines Theorem 8 with the small-scale bound and handles large relative drops via the factor-3 cap; target an O(1) drop per phase starting at A_0.
2) Extend beyond the first step: either show arithmetic regularity for \(T_j(A)\) near the home scale persists (enough to reapply the geometric-window argument), or prove a signed per-index inequality uniform in A, guided by the Hamming-sum identity.
3) Prove a central-boundary demand lemma via a six-bit case analysis, quantifying the necessary inner-boundary hits for large decreases at a fixed j.
