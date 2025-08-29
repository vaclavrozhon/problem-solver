## Round 0004 — 2025-08-28T15:00:52.153865Z

Round 0004 — audit, corrections, and new small results (measurable, checkable)

Quick audit of output.md (what’s solid; small clarifications)
- Theorem A: Correct construction; two tilings T_α and T_{α+1/2} exist, are singleton, hence irreducible by Lemma B. Non-column proof via the “two-translate impossibility” is sound because at the left boundary one forces two a.e. disjoint translates of J_0 to cover S^1. The endpoint issue is already covered by the “Remark on endpoints.” A small presentational note: the parenthetical “(iii) can also be deduced from Corollary F by instead choosing |J_0|∉{1/m})” refers to a variant of the theorem (with |J_0| not fixed to 1/2); as written, (iii) is proven via the component-length obstruction.
- Proposition H: The incommensurability clause correctly assumes s rational. We record below a slightly more flexible sufficient condition (s/β ∉ Q), which can be used to ensure incommensurability for arbitrary s by choosing β appropriately.
- Proposition I: Good fix of an earlier overreach; the additional hypothesis “no two-translate partition of S^1 by J_0” is essential in the |J_0|=1/2 case.

New small lemmas/propositions (auditable, with short proofs)
1) Singleton rigidity for complementary two-layer tiles under a mild integrality exclusion.
- Lemma S. Let A=({0}×J_0)∪({1}×J_1) with J_1=S^1\(J_0+α). If either 1/(1−|J_0|)∉N or 1/|J_0|∉N, then every tiling A+T=Z×S^1 satisfies |T_n|=1 for all n.
  Proof. Let d_n:=|T_n|. The per-row measure identity yields |J_0| d_n + (1−|J_0|) d_{n−1} = 1 for all n. The intersection identity (recorded in output.md) implies: if d_{n−1}≥1 then d_n≤1. If 1/(1−|J_0|)∉N and some d_m=0, then (1−|J_0|) d_{m−1}=1 forces a contradiction; hence d_n≥1 for all n, thus d_n≤1 by the previous inequality, so d_n=1. Symmetrically, if 1/|J_0|∉N and some d_{m−1}=0, then |J_0| d_m=1 contradicts integrality; shifting indices gives d_n≥1 for all n, hence d_n=1 by the inequality. ∎
  Why useful here. This supplies an easy route to singleton-per-row (hence irreducibility) for many complementary tiles without invoking the two-translate obstruction; it also streamlines non-column arguments when combined with Lemma B.

2) Meandering classification of singleton tilings for the complementary construction.
- Proposition K (classification). Let A=({0}×J_0)∪({1}×J_1) with J_1=S^1\(J_0+α). Assume a tiling is singleton-per-row, T_n={θ_n}. Then for every n one has J_0+θ_n = J_0+(α+θ_{n−1}) a.e., i.e. δ_n:=θ_n−θ_{n−1}−α ∈ Stab(J_0):={t: J_0+t=J_0 a.e.}. Conversely, for any sequence (δ_n) with values in Stab(J_0), the sequence defined by θ_n:=θ_0+∑_{j=1}^n(α+δ_j) yields a singleton tiling T={ (n,θ_n) }.
  Proof. The “only if” direction is Corollary J. For the converse, on row n we have J_0+θ_n and J_1+θ_{n−1}=S^1\(J_0+α+θ_{n−1}). Since δ_n∈Stab(J_0), J_0+θ_n=J_0+α+θ_{n−1}+δ_n=J_0+α+θ_{n−1} a.e., so the two contributions are complementary a.e. Pairwise a.e. disjointness holds because different anchors contribute on disjoint rows or contribute complementary sets on the same row. ∎
  Why useful here. This shows there are many (generally aperiodic) irreducible singleton tilings for complementary two-layer tiles; periodic choices correspond to δ_n constant, recovering the families in Theorem A and Proposition G. It corrects a prior (overly rigid) heuristic that increments must be constant.

3) Flexible incommensurability for the K={0,1,2} two-order family.
- Lemma Q. If s∈(0,1) and β∉Q satisfy s/β∉Q, then β/(β−s)∉Q.
  Proof. If β/(β−s)=p/q∈Q, then (q−p)β=ps, so s/β=(q−p)/p∈Q, contradiction. ∎
  Why useful here. Proposition H can achieve incommensurability without assuming s rational by choosing β so that s/β∉Q (e.g., β irrational and rationally independent from s).

4) Fourier obstruction to two-translate complement (explicit numeric check for Theorem A’s U).
- Lemma F2 (explicit check). For U=[0,0.2]∪[0.3,0.35] and J_0:=U∪(U+1/2), one has \hat{1_{J_0}}(2) and \hat{1_{J_0}}(4) both nonzero. Indeed, \hat{1_{J_0}}(t)=(1+e^{-π i t})\hat{1_U}(t), so it suffices to show \hat{1_U}(2),\hat{1_U}(4)≠0. Direct computation yields
  \hat{1_U}(2) ≈ 0.01787 − 0.10419 i,  \hat{1_U}(4) ≈ −0.05229 − 0.07196 i,
  hence \hat{1_{J_0}}(2)≈0.03573−0.20838 i and \hat{1_{J_0}}(4)≈−0.10458−0.14391 i. By the Fourier complement lemma (already recorded in notes), the existence of δ with J_0+δ=S^1\J_0 a.e. would force e^{2π i t δ}=−1 for all t with \hat{1_{J_0}}(t)≠0, impossible for t=2 and t=4 simultaneously. Thus J_0 has no two-translate complement, validating Theorem A’s non-column step via Fourier as an alternative to component-lengths.
  Why useful here. It provides a concrete, fully checkable obstruction for the numeric Theorem A instance.

Examples and quick checks
- Theorem A instance (as in output.md). The explicit Fourier values above certify the “no two-translate” hypothesis; T_α and T_{α+1/2} are singleton tilings; Lemma B gives irreducibility; incommensurability by Lemma R.
- K={0,1,2} instance. Take c_1=c_3=2/5, c_2=1/5. Pick β=√2/10 so that s/β= (2/5)/(√2/10)=4/√2=2√2∉Q; then β/(β−s) is irrational by Lemma Q. Non-column holds by Lemma E (1/c_1=5/2∉N). Irreducible by Lemma B.

Corrections and obstacles (what failed and how we fixed it)
- Earlier “rigidity” attempt (all increments equal) is false in general: Proposition K shows any sequence of increments in Stab(J_0) works in the singleton regime. Constant increments are just a special (periodic) case.
- The |J_0|=1/2 rigidity in Proposition I necessarily uses a further obstruction (no two-translate tiling for J_0); Lemma S shows an alternative path to singleton-per-row when either reciprocal measure is not an integer.

What to add/adjust in output.md (gaps and suggested insertions)
- Add Lemma S (singleton rigidity under 1/(1−|J_0|)∉N or 1/|J_0|∉N). It provides a simple, general route to singleton-per-row for complementary tiles beyond |J_0|=1/2.
- Add Proposition K (meandering classification) to make explicit that all singleton tilings for the complementary construction are parameterized by sequences in Stab(J_0); note that periodic sequences yield the families in Theorem A and Proposition G.
- In Proposition H, mention the alternative incommensurability criterion “s/β∉Q” (Lemma Q), allowing s arbitrary by a suitable choice of β.
- Optionally include the explicit Fourier check for the Theorem A example (Lemma F2) as an alternative to the component-length argument in (iii).

Next steps (concrete, testable)
- Formalize a “q-phase meandering classification”: with Stab(J_0)=(1/q)Z, characterize all periods arising from sequences δ_n taking values in (1/q)Z (e.g., constant sequences give periods (1,α+j/q), periodic δ_n of period r give periods (r, rα + sum δ_n), etc.).
- For K={0,1,2}, explore simultaneous compatibility for more than two orders and derive the associated linear relations among slopes; combine with Lemma E to obtain multi-period families, aiming at three or more pairwise incommensurable periods.
- Strengthen the Fourier obstruction into a general “no m-translate partition” test for |J_0|=1/m, recording explicit coefficient constraints and supplying at least one fully worked example for m=3.

