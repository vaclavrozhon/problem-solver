## Round 0008 — 2025-08-27T20:24:23.298409Z

Round 0008 — Small, checkable additions: direct s(k)-averaging, L=2 plateau, and a sharper weighted endpoint bound

Audit of output.md (no blocking issues)
- The file is coherent and the earlier two-level Markov pitfall has been avoided; Corollary 21 (Markov from the global expectation) is correct. Power-law (Cor. 23), discrete 1/k-smoothness (Cor. 22), the min-of-three envelope (Cor. 11–12), balanced split (Cor. 17), and multi-plateau probability mixing (Cor. 18) are all consistent. I found no correctness errors.
- Opportunities: (i) add a direct, per-k s(k)-based averaging corollary (complements the plateau calculus and can be tighter on highly irregular OPT profiles), (ii) state an exact bound for the L=2 plateau edge case (ties together the Δ=0 endpoint and the single Δ=1 term cleanly), and (iii) slightly sharpen the weighted endpoint term bound used in the global aggregation (replace ≤ ln(2k0) by ≤ ln(2k0) − 1 + O(1/k0)). All are strictly incremental and immediately checkable from existing statements.

New, checkable additions (proposed to curate)

1) Direct s(k)-based global averaging (complements plateau calculus)
- Statement (s(k)-averaging). For k uniform on [k0,2k0), let s(k) := min{s≤k: OPT_s ≤ 2·OPT_k} and Δ(k):=k−s(k). Then
  E_{k∼U([k0,2k0)),++}[ ALG_k/OPT_k ]
  ≤ (1/k0) ∑_{k=k0}^{2k0−1} G(k),
  where for each k: if Δ(k)≥1,
    G(k) := 2·C_bi·min{ a + ln(2 s(k)/Δ(k)), 1 + s(k)/(e(Δ(k)−1)) },
  and if Δ(k)=0,
    G(k) := C_fix·(ln k + O(1)).
  Here a:=2 + 1/(2e).
- Proof. Immediate from Theorem 1 applied pointwise to each k, followed by averaging over k. No additional assumptions required.
- Why useful. This gives a “fine-grained” alternative to plateau aggregation. For instance, if Δ(k) is large on a nontrivial fraction of k, the logarithmic branch yields O(ln ln k) rather than O(ln k), independently of how plateaus are grouped.
- Simple application (illustrative). Suppose for some β∈(0,1] and for at least a γ-fraction of k∈[k0,2k0) we have Δ(k) ≥ β·k/ln k. Then for each such k,
  a + ln(2 s(k)/Δ(k)) ≤ a + ln( 2k / (β·k/ln k) ) = a + ln((2/β) ln k)
  = O(ln ln k).
  Averaging gives a γ-weighted O(ln ln k0) contribution on this subset of k, independent of plateau structure. The remaining (1−γ)-fraction can be bounded by the unconditional O(ln k0) envelope (Cor. 14).

2) Exact L=2 plateau bound (edge case cleaned up)
- Setting. Consider a factor-2 plateau I=[m,m+2) (so L=2). There are only two indices: k=m (Δ=0) and k=m+1 (Δ=1).
- Statement. For k uniform on I and ++ randomness,
  E_{k∈I,++}[ ALG/OPT ]
  ≤ (1/2)·C_fix·(ln m + O(1))
    + (1/2)·2·C_bi·( a + ln(2 s(m+1)/1) ).
  In particular, since s(m+1) ≤ m,
  E_{k∈I,++}[ ALG/OPT ] ≤ (1/2)·C_fix·(ln m + O(1)) + C_bi·( a + ln(2m) ).
- Proof. Combine the fixed-k bound at k=m (Δ=0) with Theorem 1 at k=m+1 (Δ=1), then average the two values. Use monotonicity s(m+1)≤m on a factor-2 plateau to simplify.
- Why useful. This gives a crisp and slightly tighter edge-case bound, avoiding any invocation of the ln ln branch and making the constants explicit for L=2.

3) Sharper weighted endpoint-sum bound in the global aggregation
- Context. Corollary 14 bounds the weighted endpoint term by
  (1/k0)∑_{j:L_j≥2} L_j ln m_j ≤ (1/k0)∑_{k=k0}^{2k0−1} ln k ≤ ln(2k0).
- Refinement (optional). Using the integral test,
  (1/k0)∑_{k=k0}^{2k0−1} ln k ≤ (1/k0)∫_{k0−1}^{2k0−1} ln x dx
  = (1/k0)[ x ln x − x ]_{k0−1}^{2k0−1}
  = ln(2k0−1) − 1 − [(k0−1)/k0]·(ln(k0−1) − 1)
  = ln(2k0) − 1 + O(1/k0).
  Thus a slightly tighter numerical form is available:
  (1/k0)∑_{j:L_j≥2} L_j ln m_j ≤ ln(2k0) − 1 + O(1/k0).
- Why useful. This improves only the additive constant and can be recorded as a remark without changing asymptotics. It may simplify explicit constant bookkeeping in numerical instantiations.

Sanity checks and examples
- s(k)-averaging vs plateau calculus. On a profile with many small gaps (Δ(k)=1 for most k), s(k)-averaging reproduces the Θ(ln k0) behavior by summing a + ln(2 s/1) ≈ a + ln(2k) over k and averaging. Conversely, if a sizeable fraction has Δ(k) ≳ k/ln k, the s(k)-formulation immediately gives an O(ln ln k0) contribution for that fraction, independently of how plateaus are bundled.
- L=2 edge case. For C_bi=C_fix=5 and a=2+1/(2e), the bound reads
  E_{k∈I,++}[ALG/OPT] ≤ (5/2)·ln m + 5·(a + ln(2m)) + O(1),
  which is fully explicit and avoids any ln ln terms.

Why these are incremental and auditable
- The s(k)-averaging corollary is a direct averaging of Theorem 1 pointwise bounds; proof is one line.
- The L=2 plateau bound is an exact two-point average of existing per-k guarantees (Theorem 1 and the fixed-k bound).
- The weighted endpoint refinement is a standard integral estimate; constants are explicit and easily checked.

Gaps and open items (for future rounds)
- Heavy-coverage program. A next concrete step remains a geometric inequality under λ-separation bounding the total D^2-mass outside uncovered heavy clusters by a small multiple of the uncovered-heavy mass plus a controlled covered-heavy term. Combined with the eH_t supermartingale, this would imply a persistence denominator and yield a bounded expected number of heavy-collisions. I will attempt to formalize this under an explicit λ-separation in the next round.
- Probability threshold tuning (≥1%). Given the tradeoff P ≥ (1−η)(1−1/c) and threshold ∝ c(1 + 1/(α e η)), one can optimize c and η numerically to slightly improve over (η,c)=(0.98,2). A closed-form minimizer for c·(1 + b/η) subject to (1−η)(1−1/c)≥p0 can be derived via reparameterization t=1−1/c; I will provide a small table of improved pairs for p0=0.01 and typical α in a later pass (constants only).

Proposed insertions in output.md
- Add “Corollary (Direct s(k)-averaging)” with the displayed formula and a one-line proof.
- Add “Corollary (L=2 plateau bound)” with the explicit average stated above.
- Add a “Remark (Weighted endpoint sum: slightly sharper bound)” after Corollary 14, with the ln(2k0) − 1 + O(1/k0) refinement.

