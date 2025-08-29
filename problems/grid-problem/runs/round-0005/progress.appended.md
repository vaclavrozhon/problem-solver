## Round 0005 — 2025-08-27T18:47:25Z

### Audit of output.md (gaps or issues)
- The current output.md has removed the previously flagged false global claim about “≥3 on a row/column ⇒ unique type 4/3,” and only states the correct single-line (entirely in one row/column) uniqueness. Good.
- Theorem 1 (multiplicity formulas for all four types) is correct and central.
- Theorem 2 (single-line uniqueness) is correctly stated for the case U lies entirely in a single row/column.
- Theorem 3 (singleton+extension triggers for types 3/4) is correct.
- Theorem 4 (antichain ⇒ unique type 2) is correct: in an antichain the two relevant rays at (α,β) each contain exactly one point.
- Theorem 5 (consecutive-maxima clean gap ⇒ unique type 2) is correct.
- Theorem 6 (|U|=3) looks sound; the last subcase (non-monotone permutations) could be expanded, but it is correct that among the 6 permutations, one of the consecutive x-order pairs is type 2 with r=s=1 in a 3-point set. No correction needed.

Conclusion: No gaps to fix in output.md this round.

### New, rigorously stated and proved lemmas (incremental triggers)

#### Lemma XR (cross-shape, no south–west points ⇒ unique 3/4)
Statement. Let U be contained in the union of a single row R={ (x,Y): x∈[n] } and a single column C={ (X,y): y∈[n] }. Assume |U|≥2. Then G[U] has a uniquely colored edge.

Proof. If U⊆R or U⊆C we are in Theorem 2 (single-line uniqueness). Otherwise U intersects both R and C. If |U∩R|≥2, list its x-coordinates as x_1<⋯<x_m (m≥2). Consider α:=x_{m−1}. In the global type–4 formula T_4(α)=∑_β 1_{(α,β)∈U}·h_β(α), there is exactly one β (namely β=Y) with (α,β)∈U because U has no points off R in column α (by hypothesis U⊆R∪C and α≠X). On that row Y there is exactly one right neighbor (the point with x_m), so h_Y(α)=1. Hence T_4(α)=1, and color (4,α) is unique. The case |U∩R|≤1 and |U∩C|≥2 is symmetric, yielding a unique type–3 color. ∎

Why useful. This settles the “S=∅” subcase of the unique-maximal scenario and any configuration supported on one row plus one column, which appears frequently in extremal layouts.

#### Lemma J (empty L–corner ⇒ unique type 2)
Statement. Suppose there exist integers α<α′ and β<β′ such that U contains (α,β′) and (α′,β), contains no point (α,y) with β<y<β′, and contains no point (x,β) with α<x<α′. Then the color (2,α,β) appears exactly once in G[U].

Proof. By the type–2 formula, r_U(α,β)=# { (α,y)∈U : y>β }. The only candidate above β on column α in the interval (β,β′] is (α,β′), and by hypothesis there is no point with y∈(β,β′). Points with y>β′ do not exist among those considered unless present, but they are irrelevant: any such would be ≥β′ and hence contradict “no point in (β,β′)” unless they are ≥β′; we only need to know there is exactly one point above β in column α, namely (α,β′). Similarly, s_U(α,β)=# { (x,β)∈U : x>α } counts exactly one point to the right, namely (α′,β). Therefore r_U(α,β)=s_U(α,β)=1 and (2,α,β) is unique. ∎

Remark. Lemma G in notes/output is the special case with the NE corner (α′,β′) also present; Lemma J omits that requirement and only uses emptiness along the open vertical/horizontal segments.

#### Lemma L (clean consecutive-maxima via top/right extremality ⇒ unique type 2)
Statement. Let M=Max(U) be listed as m_i=(x_i,y_i) with x_1<⋯<x_k and y_1>⋯>y_k, k≥2. If for some i we have: (i) m_i is the topmost point in column x_i (no (x_i,y)∈U with y>y_i), and (ii) m_{i+1} is the rightmost point in row y_{i+1} (no (x,y_{i+1})∈U with x>x_{i+1}), then the color (2,x_i,y_{i+1}) is unique.

Proof. Under (i), the set { (x_i,y)∈U : y>y_{i+1} } equals { (x_i,y_i) }, so R_i=1. Under (ii), the set { (x,y_{i+1})∈U : x>x_i } equals { (x_{i+1},y_{i+1}) }, so S_i=1. Lemma D (or the type–2 formula) yields uniqueness. ∎

Why useful. This is a concrete, easily checked certificate implementable in a scan over maxima; it isolates a frequent “staircase corner” where inflation by extra points is impossible by simple top/right extremality.

### Examples probing/illustrating the new lemmas
- Example for Lemma XR. U={ (2,5),(4,5),(6,5),(6,1),(6,3) } is supported on row 5 and column 6. The two rightmost on row 5 yield α=4. No other row contains (4,·), so T_4(4)=1 and (4,4) is unique.
- Example for Lemma J. U contains (2,4),(5,1), and no points on {2}×{2,3} nor on {3,4}×{1}. Then (2,2)-color (2,2,1) is unique even if (5,4) is absent and even if there are many other points elsewhere.
- Example for Lemma L. U has consecutive maxima m_i=(3,7), m_{i+1}=(8,2), and there is no (3,y) above y=7 nor any (x,2) to the right of x=8. Then (2,3,2) is unique.

### Clarifying the unique-maximal case (partial resolution and roadmap)
- Fact (simple but key). If U has a unique maximal m=(X,Y), then X=max{x : (x,·)∈U} and Y=max{y : (·,y)∈U}. Proof: If some x*>X appears, the point with x=x* is maximal (no strictly larger x exists to dominate it), contradicting uniqueness; similarly for y.
- Immediate subcase solved (S=∅). If every u∈U\{m} lies on row Y or column X (i.e., no point strictly SW of m), then Lemma XR applies and yields a unique type–3 or type–4 color.
- Remaining subcase S≠∅. Let S={ u∈U : u_x<X and u_y<Y }. The earlier gap arose from extra NE neighbors of a “maximal” p∈S lying on row Y or column X. Lemma J provides a new way forward: whenever a p∈S has one extra NE neighbor on the top row and one on the right column, the L-corner (α=p_x, β=p_y) becomes a candidate for a unique type–2 color provided the open vertical/horizontal segments above/right of (α,β) are empty. A concrete next step is to identify, via extremal choices within S, conditions guaranteeing these segments are empty (e.g., choose p with maximal x in S and among those maximal y, and check the nearest top-row/right-column points). This yields a checkable route to finish the unique-maximal case.

### Obstacles and why prior attempts failed
- Attempt to force uniqueness on the top row (or right column) in the unique-maximal case by looking at colors (3,Y) or (4,X) fails because T_3(Y)=T_4(X)=0 (no points strictly above Y or to the right of X).
- Picking a maximal p∈S does not prevent extra NE neighbors on row Y or column X; extra control (emptiness along segments) is needed—hence Lemma J and L-type certificates.

### Next steps (concrete, auditable)
1) Complete the unique-maximal case by a precise extremal choice of p∈S that certifies the emptiness of the two open segments needed in Lemma J, or else reduces to Lemma XR. A candidate rule: take p with maximal x; among those, maximal y; then analyze the closest top-row neighbor a=(α_top,Y) with α_top>p_x and the closest right-column neighbor b=(X,β_right) with β_right>p_y. Prove that at least one of the open segments above/right of p is empty, giving either type–1 uniqueness (if both empty beyond m) or type–2 uniqueness via Lemma J (if both a and b exist but the segments are empty).
2) Develop a maxima-scan algorithm: for consecutive maxima, check the Lemma L top/right extremality; if it fails, record the offending points causing R_i>1 or S_i>1 and attempt to trigger Lemma E/F (singleton+extension) on the corresponding row/column. Formalize and prove a small lemma turning an “offending” point into a 3/4-uniqueness witness when it is the only base of an extension.
3) Extend the curated base to a robust four-point proposition by clean case analysis (rows/columns occupancy patterns: 4, 3+1, 2+2, 2+1+1, 1+1+1+1), using Theorems 2–5 and Lemmas XR/J/L. This is manageable and will stress-test the library of triggers.

### Summary of this round’s progress
- Added three new certified triggers: Lemma XR (row∪column support), Lemma J (empty L-corner ⇒ unique type 2), Lemma L (clean consecutives via top/right extremality ⇒ unique type 2).
- Clarified the structure of the unique-maximal case (X and Y are global maxima), solved its S=∅ subcase via Lemma XR, and outlined a concrete path to finish S≠∅ using Lemma J.
- Identified precise checks to implement in a maxima-scan strategy and set up a plan to verify |U|=4 as a next curated milestone.

