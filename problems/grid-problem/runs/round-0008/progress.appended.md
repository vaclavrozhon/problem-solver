## Round 0008 — 2025-08-27T20:08:08.551401Z

Round 0008 — incremental, auditable progress

Overview
- I focus on consolidating the unique–maximal regime by adding two safe, local type–2 triggers tied to the boundary thresholds α₂ (top row) and β₂ (right column). These are immediate consequences of the type–2 multiplicity formula and fit the “pivot-or-corner” strategy. I also audit output.md: no new gaps found; minor notational point noted below. Finally, I outline how these triggers integrate into the crossing subcase and propose concrete next steps.

Audit of output.md (gaps or issues)
- Theorem 11: The corrected proof for |U|=4 looks consistent after switching to Theorem 7 (robust L-corner) in the two-rows-with-common-left-endpoint subcase.
- Theorem 8: Notation uses X,Y for the designated column/row; the proof is fine. The sentence “there are no β>Y in U when m is the unique maximal” only appears in Theorem 10 and is justified by Lemma O1.
- Minor notation: in the last paragraph of Theorem 11, “v(β)=1” should read v_α(β)=1 or directly “T_3(β)=1” to match earlier notation (purely cosmetic).

New, rigorously stated lemmas (safe triggers; immediate from the type–2 formula)

- Lemma T2α (top-row failure ⇒ local type–2 at α₂’s first subrow if exactly one right neighbor).
  Setup. U has a unique maximal m=(X,Y). Let T={x<X : (x,Y)∈U}, assume T≠∅, and let α₂=max T. Assume column α₂ contains at least one point below Y and define β_c = max{ y<Y : (α₂,y)∈U } (the highest sub-top-row point in column α₂). If on row β_c there is exactly one point to the right of α₂ (i.e., h_{β_c}(α₂)=1), then the color (2,α₂,β_c) is unique.
  Proof. In column α₂, the only point above β_c is (α₂,Y) by definition of β_c, so r_U(α₂,β_c)=1. By hypothesis, s_U(α₂,β_c)=h_{β_c}(α₂)=1. By the type–2 multiplicity formula, (2,α₂,β_c) has multiplicity 1.
  Why useful: When the top-row pivot (Theorem 10) fails, this is the next-in-line check on the first subrow of α₂ and yields uniqueness under a minimal, verifiable right-neighbor condition.

- Lemma T2β (right-column failure ⇒ local type–2 at β₂’s last left column if exactly one upper neighbor).
  Setup. U has a unique maximal m=(X,Y). Let R={y<Y : (X,y)∈U}, assume R≠∅, and let β₂=max R. Assume row β₂ contains at least one point left of X and define α_r = max{ x<X : (x,β₂)∈U } (the rightmost sub-right-column point on row β₂). If in column α_r there is exactly one point above β₂ (i.e., v_{α_r}(β₂)=1), then the color (2,α_r,β₂) is unique.
  Proof. On row β₂, the only point to the right of α_r is (X,β₂) by definition of α_r, hence s_U(α_r,β₂)=1. By hypothesis v_{α_r}(β₂)=1, so r_U(α_r,β₂)=1. The type–2 formula gives multiplicity 1 for (2,α_r,β₂).
  Why useful: Dual to T2α; when the safe type–3 pivot (Theorem 3) at β₂ does not apply, this certifies uniqueness on the first left-ward base if the relevant column has a single upward extension.

Examples (sanity checks)
- For T2α. Let m=(8,8), top row has points at x=3,6,8 so α₂=6. Column 6 contains (6,5) and no other below 8, so β_c=5. Suppose row 5 has exactly one point to the right of 6, say (7,5), and no others to the right. Then r_U(6,5)=1 (only (6,8)), s_U(6,5)=1, so (2,6,5) is unique by T2α.
- For T2β. Let m=(8,8), right column has points at y=4,7,8 so β₂=7. Row 7 contains (5,7) and (8,7), with column 5 having exactly one point above 7, say (5,9) absent (forbidden by O1) and (5,8) present? O1 forbids y>8; only (5,8) can be present above 7, so v_5(7)=1. Then s_U(5,7)=1 (only (8,7)), and (2,5,7) is unique by T2β.

How these plug into the unique–maximal crossing subcase
- Context. When both T and R are nonempty and neither pivot fires (Theorem 10 nor the safe type–3 singleton-row trigger), UM–X and UM–Y guarantee existence of SW-maxima meeting the x- or y-threshold separately. If a single SW-maximum meets both thresholds, Theorem 9 gives a type–1 unique color. Otherwise (crossing), the next checks are precisely T2α and T2β on the “closest” subrow/column: β_c below α₂ and α_r left of β₂. If either h_{β_c}(α₂)=1 or v_{α_r}(β₂)=1, we immediately get a unique type–2 color.
- What remains. The difficult residual is when both h_{β_c}(α₂)≥2 and v_{α_r}(β₂)≥2. I plan to show that then the lowest vertical/horizontal interlopers at these positions can be turned into either a robust L-corner (Theorem 7) or a singleton+extension trigger (Theorem 3) on some nearby row/column. This will complete the unique–maximal case.

Obstacles and cautions
- T2α/T2β are sufficient but not necessary; they do not by themselves close the crossing subcase when both local counts are ≥2.
- A naïve attempt to force Theorem 7 at the “crossing L-corner” (x(s_g),y(s_{g+1})) fails without controlling intermediate points on the relevant column/row segments. The nearest-interloper analysis is therefore essential.

Next steps (concrete and auditable)
1) Prove a nearest-interloper lemma for the crossing subcase: if both h_{β_c}(α₂)≥2 and v_{α_r}(β₂)≥2, then among the nearest interlopers one induces either (i) a robust L-corner (Theorem 7) or (ii) a singleton+extension (Theorem 3) or (iii) a row/column-of-two with globally unique base (R4/R3). I will formalize the minimality choices and verify that additional contributors cannot create a second witness for the same color.
2) Curate Lemmas T2α and T2β into output.md under “Unique–maximal: boundary-local type–2 triggers.” They are direct from the type–2 formula and strengthen the practical checklist after the pivots fail.
3) Optional: add a brief remark in output.md clarifying Theorem 11’s notation (replace “v(β)=1” by “T_3(β)=1” or “v_α(β)=1”).

Why this is progress
- T2α and T2β are clean, checkable uniqueness certificates targeted at the unique–maximal regime’s remaining hard zone (post-pivot, pre-crossing resolution). They are immediate to implement in the search and reduce many configurations without global casework. The planned nearest-interloper lemma will dovetail with these to finish the unique–maximal case.

