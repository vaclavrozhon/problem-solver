## Round 0002 — 2025-08-27T19:00:19.998765Z

Headlines
- New rigorous, step-local identities for how B_j changes: an exact toggle-count formula restricted to the set S of the at-most-3-per-pair indices whose adjacency actually changes. Two immediate corollaries quantify how much B_j can decrease (or increase) in terms of how many of these changed indices hit current j-boundaries. These identities are clean, model-agnostic, and ready to be curated.
- Clarification: The “useful boundary adjacency” heuristic is invalid in general (as already noted in notes.md). The correct locality is at the changed indices S only; nothing else can contribute in a step.
- Programmatic next step: Use the toggle-count identity plus the dyadic alignment structure of A_0 to lower bound the necessary “central hits” at many levels at once. I outline a restricted (equal-scale, grid-aligned) special case that can likely be proved fully and would yield an Ω(log^2 n) bound for that restricted class.

Formal statements and proofs (new, ready to curate)
1) Lemma (toggle-locality identity and signed change at level j).
- Setup. Let A→A′ be any single PBT step, and S⊆{1,…,n−1} be the set of indices whose adjacency changes in this step (i.e., the three indices around each matched pair: left outer, inner, right outer). For j∈{0,…,d−1}, let T_j(A) be the set of j-run boundary indices of A.
- Claim. For every j,
  B_j(A′) − B_j(A) = |T_j(A′) ∩ S| − |T_j(A) ∩ S|.
- Proof. By definition, all adjacencies outside S are identical in A and A′, hence their membership in T_j(·) is unchanged. Thus T_j(A′) Δ T_j(A)⊆S, and
  |T_j(A′)| − |T_j(A)| = |T_j(A′)∩S| − |T_j(A)∩S|.
Since B_j(·)=|T_j(·)|+1, the identity follows. ∎

Corollary 1.1 (one-sided bounds per level).
- For every j,
  Decrease_j := max{0, B_j(A) − B_j(A′)} ≤ |T_j(A) ∩ S|,
  Increase_j := max{0, B_j(A′) − B_j(A)} ≤ |S\T_j(A)|.
- Proof. From the identity, B_j(A) − B_j(A′) = |T_j(A)∩S| − |T_j(A′)∩S| ≤ |T_j(A)∩S|, and similarly for increases. ∎

Remarks on usefulness.
- This exposes the exact “demand”: shrinking B_j by Δ forces at least Δ of the changed indices to land on T_j(A). For A=A_0 (bit-reversal), T_j(A)=G_j are dyadic arithmetic progressions, so we can quantify how often a single changed index can service many levels via v_2(i).
- It also yields the previously curated factor-4 cap as a very special (and weaker) consequence when combined with the disjointness-of-unions argument (only O(B_j) pairs can intersect T_j(A)). More importantly, it is sharp enough to support cross-level trade-off inequalities.

2) Lemma (alignment counting at A_0, restated with weights).
Let A=A_0 and G_j be the j-boundary set at A_0. For any set of changed indices S (from an arbitrary step):
  Σ_{j=0}^{d−1} |S ∩ G_j| = Σ_{i∈S} (1+v_2(i)).
In particular, for any weights a_j≥0,
  Σ_j a_j·|S∩G_j| = Σ_{i∈S} Σ_{j: 2^{d−1−j}|i} a_j.
- Proof. As in Theorem 4 of output.md; I include the flexible weighted form since we will need to choose tailored a_j.

Immediate consequences and their limits
- Using Cor. 1.1 with A=A_0 gives Σ_j Decrease_j ≤ Σ_j |S∩G_j| = Σ_{i∈S}(1+v_2(i)). This shows that the total number of j-boundaries removed in a single step is at most the “alignment budget” Σ_i(1+v_2(i)). Since 1+v_2(i) ≤ 1+⌊log_2(n−1)⌋, we get the coarse bound Σ_j Decrease_j ≤ |S|·O(log n).
- This is not yet strong enough to force an O(1) drop of the log-gap potential per step (the step may create increases elsewhere, and |S| can be Θ(n)), but it is the right necessary-condition inequality to drive sharper cross-level trade-offs (see Next steps).

Restricted special case towards cross-level scarcity (equal-scale, grid-aligned)
- Definition (equal-scale, grid-aligned step). Fix L a power of two. A step is L-aligned if (i) every matched pair consists of two adjacent intervals each of length in [L,2L), and (ii) all inner boundaries of matched pairs occur at indices divisible by L (i.e., central cuts lie on the L-grid). This is a strong but natural restriction; many plausible blockwise algorithms satisfy it in phases.
- Claim (to be proved next; sketch here). In an L-aligned step from A_0, at most O(1) bit-levels j with 2^{d−1−j}∈[L/2,2L] can shrink B_j by a constant factor; all other levels change by at most o(B_j). Outline:
  • By Cor. 1.1, to reduce B_j by θ·B_j we need |S∩G_j| ≥ θ·B_j − |S\G_j|. Since all inner boundaries lie on the L-grid and all outer boundaries are spaced by at least L (due to equal-scale blocks), |S∩G_j| is Θ(#pairs) if and only if the two grids (L and 2^{d−1−j}) are commensurate: specifically, if 2^{d−1−j}∈[L/2,2L]. Otherwise |S∩G_j|/B_j=O(2^{d−1−j}/L) or O(L/2^{d−1−j}), which is o(1), precluding constant-factor change by Lemma 1.
  • Moreover, only O(1) consecutive j satisfy 2^{d−1−j}∈[L/2,2L]. Thus per step only O(1) “active levels” can reduce by a constant factor. Combining with the per-level factor cap (Theorem 3) bounds the per-step drop of Σ_j |log_2 B_j − (d−j)| by O(1) in this restricted regime.
- Status: The combinatorics of outer-boundary contributions needs a careful bound to ensure |S\G_j| does not swamp the inequality; but because outer boundaries per pair are only 2 and lie on the same L-grid offsets, the o(B_j) estimate for off-scale j is achievable. I will write this rigorously next.

Why the “useful-boundary” heuristic fails and how the new lemma fixes the issue
- Earlier “U_j” (indices adjacent to boundaries) is not a certificate. A changed index far from T_j(A) can certainly toggle membership at j depending on the imported endpoints. The correct locality is: only the indices whose adjacencies change (S) can flip membership; among them, a decrease of B_j can only occur on those that were in T_j(A) (Cor. 1.1). This is the precise and minimal condition we need.

A small but precise trade-off for A_0 (weighted decreases)
- For A=A_0 and any step, Cor. 1.1 plus weighted alignment gives
  Σ_{j=0}^{d−1} 2^{−(j+1)}·Decrease_j ≤ Σ_{i∈S} Σ_{j: i∈G_j} 2^{−(j+1)}.
For i with v_2(i)=t, the inner sum equals Σ_{j≥d−1−t} 2^{−(j+1)} = 2^{−(d−t)}(1−2^{−(t+1)}) ≤ 2^{−d+t}.
Therefore Σ_j 2^{−(j+1)}·Decrease_j ≤ Σ_{i∈S} 2^{−d+v_2(i)}.
- Crude bound: since v_2(i) ≤ ⌊log_2 i⌋ ≤ d−1, the RHS ≤ |S|/2. This is not strong enough by itself, but it is an exact accounting that we can pair, in the equal-scale regime, with commensurability to limit |S∩G_j| where it matters.

Checks on small n
- For n=8 (A_0=[0,4,2,6,1,5,3,7]), Cor. 1.1 predicts that B_0 can decrease only if S contains the unique G_0 index (the middle cut); indeed, experiments confirm B_0 changes by at most O(1) per step. For B_1, G_1 are indices 2,4,6; placing inner boundaries on these is necessary for noticeable decrease; changing other indices primarily increases B_1.

Gaps in output.md
- The current output.md includes Theorem 3 (factor-4 cap) proved by bounding |ΔB_j| via the number of pairs that intersect T_j(A). This is correct as written. However, for subsequent stronger trade-offs we need the toggle-locality identity (new Lemma 1) and its corollary as they cleanly separate (i) where decreases can happen (only at S∩T_j(A)) from (ii) where increases can happen (only at S\T_j(A)). I recommend curating Lemma 1 and Cor. 1.1 next.

Obstacles and what failed (crisp)
- A previously sketched “size lemma” Δ_j ≤ C·Σ_p min{1, s(p)/L_j} is false; changed adjacencies are only three per pair and independent of s(p).
- Cross-level scarcity in full generality cannot rely purely on counting |S|, because each changed index can be “relevant” to O(log n) levels at A_0 (via v_2(i)), and |S| can be Θ(n).
- Weighting arguments that sum ΔB_j/B_j(A_0) over j yield bounds of order |S| (too large) unless we impose structural constraints (equal-scale, grid alignment) to force commensurability conflicts.

Next steps (concrete, testable)
1) Curate Lemma 1 (toggle-locality identity) and Cor. 1.1. These are simple, exact, and will be repeatedly used.
2) Prove the equal-scale, grid-aligned cross-level scarcity claimed above. The key is to bound |S∩G_j|/B_j for off-scale j by o(1) using simple arithmetic progression intersection counts and the fact that inner cuts lie on the L-grid, while outer cuts contribute only O(#pairs) uniformly spread on that grid.
3) Generalize from exact alignment to “near alignment”: pairs with lengths in [L,2L) but inner boundaries allowed to drift; show via a pigeonhole/averaging over residues modulo L that one residue class captures a constant fraction, hence we can apply the aligned argument to that fraction, obtaining the same O(1) active-level cap (up to constants).
4) Experiments for n=64,128: enumerate random equal-scale partitions for several L and measure, per step, the number of j with B_j reduced by ≥1/2. We expect this number to be O(1) near levels with 2^{d−1−j}≈L and near zero for others. Record distributions to calibrate constants.
5) With the scarcity lemma in hand for each equal-scale phase, layer phases across L=1,2,4,… to argue that Σ_j |log_2 B_j − (d−j)| drops by at most O(1) per phase. This would yield Ω(log^2 n) steps for any algorithm restricted to equal-scale phases. Later, try to remove the restriction by decomposing an arbitrary step into O(1) “scale bins” (pigeonhole) and charging the potential drop to those bins.

Why this is promising
- The toggle-locality identity provides the right “demand certificate” per level j in terms of S∩T_j(A). In the A_0 regime, T_j(A) are dyadic grids, and equal-scale steps naturally constrain S to near-periodic grids; this sets up an arithmetic progressions intersection framework that is well suited to proving the desired O(1) active-level cap per step.

