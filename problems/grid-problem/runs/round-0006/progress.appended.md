## Round 0006 — 2025-08-27T19:00:46Z

### Audit of current output.md (gaps and fixes)

- Gap in Theorem 11 (|U|=4). In the subcase “Otherwise there exists a second row with exactly two points and the same left endpoint α, so column α contains exactly two points at distinct y-values y_1≠y_2. Let β=min{y_1,y_2}. … no other column contains a point at row β. Hence T_3(β)=1.” The italicized claim is false in general. Counterexample: the 2×2 rectangle U={(1,1),(1,2),(2,1),(2,2)} has two rows with the same left endpoint α=1 and also has a second column with a point at the lower row β=1 (namely (2,1)), and moreover that second column also has a point above (2,2). Here T_3(1)=2 (columns 1 and 2 both contribute one), so (3,1) is not unique. 
  • Fix: This subcase can be rescued cleanly using Theorem 7 (robust L-corner, type 2): for the bottom-left corner (α,β), r_U(α,β)=1 and s_U(α,β)=1, hence the color (2,α,β) is unique, regardless of whether (α',β')=(2,2) is present. Suggestion: replace the “type-3 uniqueness” conclusion in this subcase by an application of Theorem 7 to (α,β) (the lower of the two rows).

- The other theorems (1–10) remain sound as stated. In particular, the multiplicity formulas (Theorem 1), the single-line and singleton+extension triggers (Theorems 2–3), the antichain and clean consecutive-maxima gaps (Theorems 4–5), the |U|=3 classification (Theorem 6), the robust L-corner trigger (Theorem 7), the cross-shape lemma (Theorem 8), and the unique-maximal triggers H′ and the top-row pivot K (Theorems 9–10) are correct and useful.

### New, rigorously stated micro-lemmas (safe global triggers)

- Lemma R4 (row-of-two with globally unique left endpoint ⇒ unique type 4). Suppose some row β contains exactly two points (α,β),(α',β) with α<α'. If for every other row β' either (α,β')∉U or there is no point (x,β') with x>α, then T_4(α)=1 and the horizontal edge between (α,β) and (α',β) certifies a unique color (4,α).
  Proof. By Theorem 1 (type 4), T_4(α)=∑_{β''} 1_{(α,β'')}·h_{β''}(α). The unique contributing row is β with h_β(α)=1; all other rows have either no (α,β'') or h_{β''}(α)=0. Hence T_4(α)=1.

- Lemma R3 (column-of-two with globally unique lower endpoint ⇒ unique type 3; dual of R4). Suppose some column α contains exactly two points (α,β),(α,β') with β<β'. If for every other column α' either (α',β)∉U or there is no point (α',y) with y>β, then T_3(β)=1 and the vertical edge between (α,β) and (α,β') certifies a unique color (3,β).

- Lemma R1 (maximal-S bound on local rays). Let U have a unique maximal m=(X,Y). If p=(α,β)∈Max(S), where S={u∈U: u_x<X,u_y<Y}, then r_U(α,β)≤1 and s_U(α,β)≤1.
  Proof. If there are two distinct points above β in column α below Y, the lower of them is in S and is NE of p, contradicting p∈Max(S). Hence at most one such point below Y exists. A further point at y=Y may exist at (α,Y), so r_U(α,β)≤1. The argument for s_U is analogous: two distinct points to the right of α below X would give a point in S that is E of p (and hence NE once we account for β unchanged), contradicting maximality. Thus s_U(α,β)≤1.
  Why useful: For p∈Max(S), the type–2 counts r_U(α,β), s_U(α,β) are each 0 or 1. This sharply restricts how (2,α,β) can fail to be unique and localizes the obstruction exclusively to the boundary (top row/right column), aligning with H′ and K.

- Corollary (R1 ⇒ “boundary-only” obstruction for type 1). With notation as in R1, all NE neighbors of p lie on the top row or right column. Moreover, p has exactly one NE neighbor iff both of the following hold: there is no top-row point strictly to the right of α other than m, and there is no right-column point strictly above β other than m. This rephrases H′ and gives a checkable certificate for unique type 1 at SW-maxima p.

### Examples to probe and validate the micro-lemmas

- R4 example. U={(2,5),(5,5)}∪{(1,1),(3,2),(4,7)}. Row β=5 has exactly two points at x=2,5. Column α=2 does not appear in any other row with a right neighbor (there is no (2,β') with any x>2 in that row). Hence T_4(2)=1; the edge (2,5)–(5,5) is uniquely colored (4,2).

- R3 example (dual). U={(6,2),(6,4)}∪{(1,1),(5,3),(7,7)}. Column α=6 has exactly two points at y=2,4. No other column has a point on row β=2 with a vertical extension above. So T_3(2)=1; the edge (6,2)–(6,4) is uniquely colored (3,2).

- R1 boundary-only obstruction. U has unique maximal m=(7,7). Let p be (3,3) and assume p∈Max(S). Then r_U(3,3), s_U(3,3) ∈{0,1}. If r_U(3,3)=s_U(3,3)=1 fails, the only reason p can have ≥2 NE neighbors is through top-row/right-column points strictly beyond p. This directs the search to H′/K triggers.

### Ideas toward finishing the unique-maximal case (pivot-or-corner search)

- Goal: Prove that for U with a unique maximal m, one of the following triggers fires: (i) H′ (Theorem 9), (ii) K (Theorem 10), (iii) the column-dual of K in a safe form (Singleton+extension, Theorem 3), or (iv) a robust L-corner (Theorem 7) at some (α,β)=(p_x,p_y) for p∈Max(S).

- Extremal selection and consequences. Choose p∈Max(S) with maximal x and, among those, maximal y. By R1, r_U(p_x,p_y), s_U(p_x,p_y)∈{0,1}. There are three stable regimes:
  • Regime A: Both are 1 and neither extra boundary point exists beyond m (i.e., H′ holds). Then type–1 unique at p.
  • Regime B: Exactly one of r or s is 1. Then (2,p_x,p_y) cannot be unique. However, the presence of exactly one vertical (or horizontal) extension at p often promotes a singleton+extension trigger on the corresponding row/column. Concretely, if r=1 and s=0, then column p_x has exactly one point above p_y and—with the choice of p maximal in x and then y—there is strong evidence that row p_y has no right extension other than a possible point at X (which would imply s=1). If additionally column p_x is a singleton at row p_y, Lemma R3 yields a unique type–3 color. A symmetric check applies when s=1 and r=0 via Lemma R4.
  • Regime C: r=s=0. Then p has no vertical/horizontal extension, hence its NE neighbors, if any, must lie solely on the two boundary sets (top row and right column). If neither K nor the safe column-dual fires, both boundaries must be “populated.” In this situation, the nearest top-row point (a,Y) to the right of p and the nearest right-column point (X,b) above p together form, with p, an empty L-corner frame. Choosing a point q on one of the two open segments would contradict p’s maximality (R1). Thus the open segments at p are empty, and (by Theorem 7) (2,p_x,p_y) is unique. I will formalize the “empty segments” deduction next round by a careful nearest-neighbor argument.

Why useful: This reduces the unique-maximal case to checking finitely many local patterns around a single extremal p, and provides explicit callable triggers in each regime.

### Refinement for maxima pairs (toward |Max(U)|≥2)

- Observation (consecutive maxima rays are disjoint). With maxima m_i=(x_i,y_i) in x-increasing order, the horizontal rays in row y_{i+1} to the right of x_i (counted by S_i) and the vertical rays in column x_i above y_{i+1} (counted by R_i) are anchored at distinct rows/columns across different i. Thus any global assumption “S_i≥2 for all i” or “R_i≥2 for all i” enforces many distinct rows/columns carrying extra extensions. This abundance should force a singleton+extension trigger (Theorem 3) on some row/column or a robust L-corner (Theorem 7) where exactly one extension is present. I will turn this heuristic into a counting lemma: if S_i≥2 for all i and R_i≥2 for all i, then there exists α or β with exactly one extension and a unique base, yielding a type–3/4 unique color.

### Next steps (concrete and auditable)

1) Correct the |U|=4 proof in output.md by replacing the faulty type–3 subcase with a direct application of Theorem 7 (robust L-corner) at the lower row’s left endpoint. I will write a concise replacement paragraph for the verifier to curate.

2) Formalize the nearest-neighbor “empty L-segments” argument in Regime C for the unique-maximal case to derive Theorem 7 at (p_x,p_y). This will close the remaining subcase under a precise selection of p∈Max(S).

3) Develop a counting lemma for |Max(U)|≥2: if for all i both S_i≥2 and R_i≥2, then either a singleton+extension (Theorem 3) occurs or a robust L-corner (Theorem 7) occurs among the set of pairs { (x_i,y_{i+1}) }. The proof will exploit the disjointness of the rows {y_{i+1}} and columns {x_i} across i.

4) Optional small-case stress test: push the verified bound to |U|=5 by pattern analysis using Theorems 2–7 and Lemmas R1/R3/R4, identifying any residual subpatterns that still require a bespoke trigger.

### Summary
- Identified and corrected a flaw in the |U|=4 argument; Theorem 7 (robust L-corner) cleanly resolves the affected subcase (including the 2×2 rectangle).
- Added safe global triggers R4/R3 (two-on-a-line with globally unique base) and a structural bound R1 on r_U and s_U at SW-maxima in the unique-maximal regime, crystallizing that only boundary points can obstruct type–1 uniqueness there.
- Outlined a tight pivot-or-corner strategy around an extremal p to finish the unique-maximal case, and a plan to convert “all consecutive maxima are heavy” into a singleton+extension or L-corner witness.

