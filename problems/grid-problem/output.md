Setup and notation
- U ⊆ [n]×[n]. For p=(x,y) and q=(x',y'), say q is NE of p if x'>x and y'>y, and q is SE of p if x'>x and y'<y. G[U] has an (undirected) edge for every unordered pair {p,q}⊆U, each labeled by one of four types and a color as follows:
  • Type 1 (NE–SW): if one endpoint is NE of the other. Color (1,α,β) with α = min{x,x'} and β = min{y,y'} (coordinates of the SW endpoint).
  • Type 2 (NW–SE): if one endpoint is NW of the other. Color (2,α,β) with α = min{x,x'} (the NW x) and β = min{y,y'} (the SE y).
  • Type 3 (vertical): if x=x'. Color (3,β) with β = min{y,y'} (the lower y).
  • Type 4 (horizontal): if y=y'. Color (4,α) with α = min{x,x'} (the left x).

Theorems currently established
1) Exact multiplicity formulas for types 1–4.
2) Single-line uniqueness: If U lies in a single row (resp. a single column) and has at least two points, then G[U] has a uniquely colored edge of type 4 (resp. type 3).
3) Singleton+extension triggers: A singleton row (resp. singleton column) with exactly one extension above (resp. to the right) forces a unique type-3 (resp. type-4) color.
4) Antichain ⇒ a unique type-2 color.
5) Consecutive-maxima clean gap ⇒ a unique type-2 color.
6) All three-point sets U admit a uniquely colored edge.
7) Robust L-corner uniqueness (type 2).
8) Row ∪ column support ⇒ a unique color.
9) Unique-maximal: SW-max with boundary thresholds ⇒ unique type 1.
10) Unique-maximal: top-row pivot ⇒ unique type 4.
11) Every four-point set admits a uniquely colored edge.

Proofs
Theorem 1 (Exact multiplicities).
- Type 1. Fix (α,β)∈[n]^2. An edge has color (1,α,β) iff its SW endpoint is (α,β), hence necessarily (α,β)∈U. Each NE neighbor q of (α,β) produces exactly one edge of that color, and distinct NE neighbors yield distinct edges. Conversely, any edge of that color arises this way. Therefore the multiplicity of (1,α,β) equals the number of NE neighbors of (α,β) in U.
- Type 2. Fix (α,β)∈[n]^2 and define r_U(α,β)=# { (α,y)∈U : y>β } and s_U(α,β)=# { (x,β)∈U : x>α }. Choosing any (α,y) with y>β and any (x,β) with x>α produces a NW–SE pair whose color is (2,α,β); distinct choices yield distinct edges of that color. Conversely, any edge of color (2,α,β) has its NW endpoint on the vertical ray { (α,y) : y>β } and its SE endpoint on the horizontal ray { (x,β) : x>α }. Hence the multiplicity is r_U(α,β)·s_U(α,β). In particular, uniqueness holds iff r_U(α,β)=s_U(α,β)=1.
- Type 3. Fix β. For each α with (α,β)∈U, the lower endpoint (α,β) connects vertically to each (α,y) with y>β, contributing v_α(β)=# { (α,y)∈U : y>β } edges of color (3,β). Summing over α gives the total multiplicity T_3(β)=∑_α 1_{(α,β)∈U}·v_α(β). Uniqueness holds iff exactly one α contributes and v_α(β)=1.
- Type 4. Fix α. For each β with (α,β)∈U, the left endpoint (α,β) connects horizontally to each (x,β) with x>α, contributing h_β(α)=# { (x,β)∈U : x>α } edges of color (4,α). Summing over β gives T_4(α)=∑_β 1_{(α,β)∈U}·h_β(α). Uniqueness holds iff exactly one β contributes and h_β(α)=1.

Theorem 2 (Single-line uniqueness).
- Row case. Suppose U⊆[n]×{y0} and |U|≥2. Let the distinct x-coordinates be x_1<⋯<x_m with m≥2. The only horizontal edges in G[U] are those between (x_i,y0) and (x_j,y0). The multiset of colors on these edges is { (4,x_1) repeated m−1 times, (4,x_2) repeated m−2 times, …, (4,x_{m−1}) once }. In particular, (4,x_{m−1}) occurs exactly once in G[U].
- Column case. The vertical analogue holds by symmetry: if U⊆{x0}×[n] with |U|≥2 and y_1<⋯<y_m, then (3,y_{m−1}) occurs exactly once.

Theorem 3 (Singleton+extension triggers).
- If a row β contains exactly one point (α,β)∈U and in column α there is exactly one point (α,y) with y>β, then by Theorem 1 (type 3) we have T_3(β)=1 and hence the color (3,β) is unique. The column/row dual gives the type-4 trigger.

Theorem 4 (Antichain ⇒ unique type 2).
- Assume U is an antichain (no two share a row or a column). List U as (x_1,y_1),…,(x_m,y_m) in increasing x, which forces y_1>y_2>⋯>y_m. For any i∈{1,…,m−1} consider (α,β)=(x_i,y_{i+1}). In column α there is exactly one point above β, namely (x_i,y_i); in row β there is exactly one point to the right of α, namely (x_{i+1},y_{i+1}). Thus r_U(α,β)=s_U(α,β)=1, and by Theorem 1 (type 2) the color (2,α,β) is unique.

Theorem 5 (Consecutive-maxima clean gap ⇒ unique type 2).
- Let M=Max(U) under the product order, listed as m_i=(x_i,y_i) with x_1<⋯<x_k and y_1>⋯>y_k (k≥2). For i∈{1,…,k−1} define R_i=# { (x_i,y)∈U : y>y_{i+1} } and S_i=# { (x,y_{i+1})∈U : x>x_i }. If R_i=S_i=1, then with (α,β)=(x_i,y_{i+1}) we have r_U(α,β)=R_i and s_U(α,β)=S_i, hence r_U·s_U=1 and color (2,α,β) is unique by Theorem 1 (type 2).

Theorem 6 (All three-point sets admit a uniquely colored edge).
- Let U have three distinct points.
  • If all three lie on a common row, with x_1<x_2<x_3, the three horizontal edges on that row have colors (4,x_1),(4,x_1),(4,x_2), so (4,x_2) is unique.
  • If all three lie on a common column, the vertical analogue yields a unique (3,y_2).
  • Otherwise, if some pair lies on a row (resp. column) but not all three do, the edge of that pair has a type-4 (resp. type-3) color that cannot be duplicated elsewhere in U because there is no second edge on that same row (resp. column).
  • Finally, if all x- and y-coordinates are distinct, order by x: p_1=(x_1,y_1),p_2=(x_2,y_2),p_3=(x_3,y_3).
    – If y_1<y_2<y_3, then p_2p_3 is type 1 with color (1,x_2,y_2) and is unique (its SW endpoint is p_2, which has exactly one NE neighbor, namely p_3).
    – If y_1>y_2>y_3, then p_2p_3 is type 2 with label (2,x_2,y_3) and is unique since r_U(x_2,y_3)=s_U(x_2,y_3)=1.
    – In each of the remaining permutations of (y_1,y_2,y_3), one of the consecutive pairs in x-order forms a type-2 edge (NW–SE) with exactly one point above the L-corner in its column and exactly one point to the right on its row, giving a unique type-2 color by Theorem 1 (type 2). Hence at least one unique color exists in all cases.

Theorem 7 (Robust L-corner uniqueness for type 2).
Let α<α′ and β<β′. Suppose (α,β′),(α′,β)∈U, and in column α there is exactly one point above β (namely (α,β′)), and in row β there is exactly one point to the right of α (namely (α′,β)). Then the color (2,α,β) occurs exactly once in G[U].
Proof. By Theorem 1 (type 2), r_U(α,β)=1 and s_U(α,β)=1, hence the multiplicity r_U·s_U=1.

Theorem 8 (Row ∪ column support ⇒ a unique color).
Assume U⊆({x=X}×[n]) ∪ ([n]×{y=Y}) and |U|≥2. Then G[U] has a uniquely colored edge.
Proof. If U⊆{x=X}×[n] or U⊆[n]×{y=Y}, Theorem 2 applies. Otherwise U meets both the row and the column. If |U∩([n]×{Y})|≥2, list its x-coordinates x_1<⋯<x_m and set α=x_{m−1}. Since α≠X and U⊆(column X)∪(row Y), the only β with (α,β)∈U is β=Y. On row Y, h_Y(α)=1. Hence T_4(α)=1 by Theorem 1 (type 4). If instead |U∩({X}×[n])|≥2, the vertical analogue yields a unique type-3 color.

Theorem 9 (Unique-maximal: SW-max with boundary thresholds ⇒ unique type 1).
Suppose U has a unique maximal element m=(X,Y) in the product order. Let T={x<X : (x,Y)∈U} and R={y<Y : (X,y)∈U}, with α₂=max T if T≠∅ (and α₂=−∞ otherwise), and β₂=max R if R≠∅ (and β₂=−∞ otherwise). Let S={p∈U : p_x<X and p_y<Y}. If S≠∅ and there exists p∈Max(S) (for the product order) with p_x≥α₂ and p_y≥β₂, then the color (1,p_x,p_y) is unique.
Proof. Any NE neighbor q of p with q_x<X and q_y<Y would satisfy q≻p and lie in S, contradicting p∈Max(S). Thus every NE neighbor of p lies on row Y or column X. Because p_x≥α₂, there is no (x,Y)∈U with p_x<x<X, and because p_y≥β₂, there is no (X,y)∈U with p_y<y<Y. Hence the only possible NE neighbor is m. By Theorem 1 (type 1), the multiplicity of (1,p_x,p_y) equals the number of NE neighbors of p, namely 1.

Theorem 10 (Unique-maximal: top-row pivot ⇒ unique type 4).
In the setting of Theorem 9, if T≠∅ and the column α₂ contains no point below Y, then the color (4,α₂) occurs exactly once in G[U].
Proof. On row Y, the point (α₂,Y) has exactly one right neighbor, (X,Y), so h_Y(α₂)=1. For β≠Y there is no (α₂,β)∈U by hypothesis, and there are no β>Y in U when m is the unique maximal. Therefore T_4(α₂)=h_Y(α₂)=1 by Theorem 1 (type 4).

Theorem 11 (Every four-point set admits a uniquely colored edge).
If |U|=4, then G[U] has a uniquely colored edge.
Proof. If some row has ≥3 points, list the x-coordinates on that row as x_1<⋯<x_k with k≥3. The rightmost edge on that row has color (4,x_{k−1}). To realize (4,x_{k−1}) elsewhere would require a different row containing both (x_{k−1},·) and a point with x>x_{k−1}, which is impossible with only one point off the given row. Thus (4,x_{k−1}) is unique. If some column has ≥3 points, the vertical analogue (type 3) applies.
Otherwise, every row and every column has ≤2 points. If there is a row with exactly two points, let its smaller x be α. If no other row contains both (α,·) and a point to its right, then by Theorem 1 (type 4) we have T_4(α)=1. Otherwise there exists a second row with exactly two points and the same left endpoint α. Let β be the lower of the two y-values in column α. Then on row β there is exactly one point to the right of α, and in column α there is exactly one point above β. By Theorem 7 (robust L-corner), r_U(α,β)=s_U(α,β)=1 and the color (2,α,β) is unique.
Finally, if no row has two points, then each row has exactly one point. If some column has two points, let β be the lower y on that column; at row β only that column contributes and v(β)=1, so T_3(β)=1. If no column has two points either, U is an antichain, and Theorem 4 gives a unique type-2 color. In all cases a unique color exists.
Auxiliary lemmas (supporting Theorems 9–11 and later triggers)

Lemma O1 (unique maximal ⇒ coordinatewise maxima).
Statement. If U has a unique maximal element m=(X,Y) in the product order, then X = max{ x : (x,·) ∈ U } and Y = max{ y : (·,y) ∈ U }.
Proof. Suppose some u=(x′,y′) ∈ U has x′ > X. In any finite poset, u is dominated by some maximal element m′ (i.e., m′ ≥ u coordinatewise). Then m′_x ≥ x′ > X, so m′ ≠ m, contradicting uniqueness. The case y′ > Y is symmetric. Therefore no point of U has x > X or y > Y, proving the claim.

Lemma UM1 (SW-maxima have only boundary NE neighbors).
Setup. Assume U has a unique maximal m=(X,Y). Let S={ p ∈ U : p_x < X and p_y < Y } and Max(S) its product-order maximal elements.
Statement. If p=(α,β) ∈ Max(S), then: (i) there is no q ∈ U with x=α and β < y < Y; (ii) there is no q ∈ U with y=β and α < x < X. Consequently, every NE neighbor of p lies on the top row y=Y or the right column x=X.
Proof. If q=(α,y) with β<y<Y existed, then q ∈ S and q ≻ p, contradicting p ∈ Max(S). The horizontal case is analogous. The consequence follows immediately.

Corollary R4 (row-of-two with globally unique left endpoint ⇒ unique type 4).
Statement. Suppose there exists a row β with exactly two points (α,β),(α′,β) ∈ U with α<α′. Assume furthermore that for every β′ ≠ β either (α,β′) ∉ U or there is no point (x,β′) with x>α. Then the color (4,α) appears exactly once in G[U].
Proof. By the type-4 multiplicity formula, T_4(α)=∑_{β''} 1_{(α,β'')∈U} · h_{β''}(α). By hypothesis, only β contributes (since (α,β'')∉U for β''≠β or h_{β''}(α)=0 there), and on row β we have h_β(α)=1 (exactly one right neighbor at α′). Hence T_4(α)=1 and (4,α) is unique.

Corollary R3 (column-of-two with globally unique lower endpoint ⇒ unique type 3).
Statement. Suppose there exists a column α with exactly two points (α,β),(α,β′) ∈ U with β<β′. Assume furthermore that for every α′ ≠ α either (α′,β) ∉ U or there is no point (α′,y) with y>β. Then the color (3,β) appears exactly once in G[U].
Proof. By the type-3 multiplicity formula, T_3(β)=∑_{α''} 1_{(α'',β)∈U} · v_{α''}(β). By hypothesis, only α contributes (since (α'',β)∉U for α''≠α or v_{α''}(β)=0 there), and in column α we have v_α(β)=1 (exactly one point above at β′). Hence T_3(β)=1 and (3,β) is unique.
Theorems currently established (continued)
12) Unique–maximal: SW–maximum with both boundary contacts ⇒ unique type 2.
13) Unique–maximal with a single SW–maximum ⇒ some unique color exists.
14) Unique–maximal: boundary-local type-2 triggers at α₂ and β₂.

Proofs (additions)

Theorem 12 (Unique–maximal: SW–maximum with both boundary contacts ⇒ unique type 2).
Assume U has a unique maximal element m=(X,Y). Let S={ p∈U : p_x<X and p_y<Y }, and let p=(α,β)∈Max(S). Suppose (α,Y)∈U and (X,β)∈U. By Lemma UM1, there is no point of U on the open vertical segment { (α,y) : β<y<Y } and no point on the open horizontal segment { (x,β) : α<x<X }. By Lemma O1 there are no points with y>Y or x>X. Hence r_U(α,β)=1 and s_U(α,β)=1. By Theorem 1 (type 2), the color (2,α,β) occurs exactly once in G[U].

Theorem 13 (Unique–maximal with a single SW–maximum ⇒ a unique color exists).
Assume U has a unique maximal m=(X,Y). Let S={ p∈U : p_x<X and p_y<Y } and suppose S≠∅ but Max(S)={p=(α,β)}.
Define T={ x<X : (x,Y)∈U } and, if T≠∅, α₂=max T. Define R={ y<Y : (X,y)∈U } and, if R≠∅, β₂=max R. We consider cases.
- Case 1: T=∅ and R=∅. By Lemma UM1, any NE neighbor of p lies on the top row or right column; since m is the only point on either, m is the unique NE neighbor. By Theorem 1 (type 1), (1,α,β) has multiplicity 1.
- Case 2: T≠∅ and column α₂ contains no point below Y. Then on row Y, h_Y(α₂)=1 and, by the definition of α₂ and Lemma O1, no other row contributes to T_4(α₂). Theorem 10 applies: (4,α₂) is unique.
- Case 3: R≠∅ and row β₂ is a singleton {(X,β₂)}. In column X there is exactly one point above β₂, namely m, by the definition of β₂ and Lemma O1. By Theorem 3, (3,β₂) is unique.
- Case 4: T≠∅, column α₂ contains some (α₂,β′) with β′<Y, and R=∅. Then q=(α₂,β′)∈S. Since p is the unique maximal of S, we have p≥q, hence p_x≥α₂. By Lemma UM1, any NE neighbor of p lies on the top row or the right column. The right column contributes none (R=∅). Among top-row points other than m, all have x≤α₂≤p_x and thus are not to the right of p. Therefore m is p’s only NE neighbor, and by Theorem 1 (type 1) the color (1,α,β) is unique.
- Case 5: R≠∅, row β₂ contains some (α′,β₂) with α′<X, and T=∅. Then r=(α′,β₂)∈S and p≥r gives p_y≥β₂. By Lemma UM1, all NE neighbors of p lie on the top row or right column. The top row contributes none (T=∅). On the right column, by the definition of β₂ and Lemma O1 there is no point strictly above p_y other than m. Hence m is the only NE neighbor and (1,α,β) is unique.
- Case 6: T≠∅ and R≠∅, with column α₂ containing some (α₂,β′) with β′<Y and row β₂ containing some (α′,β₂) with α′<X (i.e., both pivots fail). Then p≥(α₂,β′) and p≥(α′,β₂), so p_x≥α₂ and p_y≥β₂. Theorem 9 applies: p has exactly one NE neighbor (m), hence (1,α,β) is unique.
These cases are exhaustive; in all cases a uniquely colored edge exists.

Lemma 14 (Boundary-local type-2 triggers at α₂ and β₂).
Assume U has a unique maximal m=(X,Y).
(a) Suppose T≠∅ and column α₂ contains at least one point below Y. Let β_c=max{ y<Y : (α₂,y)∈U }. If row β_c has exactly one point to the right of α₂ (i.e., h_{β_c}(α₂)=1), then the color (2,α₂,β_c) is unique.
Proof. In column α₂ the only point above β_c is (α₂,Y) by the choice of β_c and Lemma O1, so r_U(α₂,β_c)=1. By hypothesis s_U(α₂,β_c)=h_{β_c}(α₂)=1. By Theorem 1 (type 2), (2,α₂,β_c) has multiplicity 1.
(b) Suppose R≠∅ and row β₂ contains at least one point left of X. Let α_r=max{ x<X : (x,β₂)∈U }. If column α_r has exactly one point above β₂ (i.e., v_{α_r}(β₂)=1), then the color (2,α_r,β₂) is unique.
Proof. On row β₂ the only point to the right of α_r is (X,β₂) by the choice of α_r and Lemma O1, so s_U(α_r,β₂)=1. By hypothesis r_U(α_r,β₂)=v_{α_r}(β₂)=1. Theorem 1 (type 2) yields uniqueness.

Remarks. Lemma 14(a,b) are boundary-anchored instances of Theorem 7 (robust L-corner), specialized to the first subrow below (α₂,Y) and the last left column before (X,β₂), respectively. They are particularly effective when the primary pivots (Theorems 10 and 3) fail but these first substructures are minimally “clean.”
Theorems currently established (continued)
15) Every five-point set admits a uniquely colored edge.

Proofs (additions)

Theorem 15 (Every five-point set admits a uniquely colored edge).
Let U⊆[n]×[n] with |U|=5. Classify by the multiset of row-occupancies.
- Case 5 (single row). By Theorem 2, on that row the unique color is (4,x_4), where x_1<⋯<x_5 are the x-coordinates.
- Case 4+1. Let the 4-point row be y=y₀ with x_1<x_2<x_3<x_4. On that row h_{y₀}(x_3)=1. Any other row is a singleton; if it contains (x_3,·) then h_β(x_3)=0. Hence T_4(x_3)=1 by Theorem 1 (type 4), so (4,x_3) is unique.
- Case 3+2. Let the 3-point row be y=y₀ with x_1<x_2<x_3 and the 2-point row be y=y₁ with α<γ.
  • If α≠x_2, then only row y₀ contributes positively to T_4(x_2): h_{y₀}(x_2)=1, while on row y₁ either (x_2,y₁)∉U or it is the right endpoint there (so h_{y₁}(x_2)=0). Thus T_4(x_2)=1 and (4,x_2) is unique.
  • If α=x_2, then in column α we have exactly (α,y₀),(α,y₁). On the lower of {y₀,y₁}, r_U(α,β)=1 and, being a 2-point row, s_U(α,β)=1. By Theorem 7, (2,α,β) is unique.
- Case 3+1+1. Let the 3-point row be y=y₀ with x_1<x_2<x_3. On that row h_{y₀}(x_2)=1; the two other rows are singletons, so no other row contributes to T_4(x_2). Hence T_4(x_2)=1 and (4,x_2) is unique.
- Case 2+2+1. Let the 2-point rows be y=β₁ with points (α₁,β₁),(γ₁,β₁) (α₁<γ₁) and y=β₂ with (α₂,β₂),(γ₂,β₂) (α₂<γ₂), and let the remaining point be a singleton.
  • If α₁≠α₂, pick α∈{α₁,α₂}. Only its own 2-point row contains (α,·) with a right neighbor, so h_{β}(α)=1 for that row and all other rows contribute 0 at α. Hence T_4(α)=1 and (4,α) is unique.
  • If α₁=α₂=:α and the singleton is not in column α, then column α contains exactly (α,β₁),(α,β₂). On the lower of {β₁,β₂} we have r_U(α,β)=1 and, being a 2-point row, s_U(α,β)=1. By Theorem 7, (2,α,β) is unique.
  • If α₁=α₂=:α and the singleton also lies in column α, then column α contains exactly three points at y-levels β_a<β_b<β_c. If the middle level β_b is a 2-point row, then r_U(α,β_b)=1 and s_U(α,β_b)=1, so (2,α,β_b) is unique by Theorem 1 (type 2). If the middle level is the singleton row, then v_α(β_b)=1 and no other column meets row β_b (it is a singleton row), hence T_3(β_b)=1 and (3,β_b) is unique.
- Case 2+1+1+1. Let the 2-point row have left endpoint α. Then h_β(α)=1 on that row and every other row is a singleton; if another row meets column α, it contributes 0 at α. Thus T_4(α)=1 and (4,α) is unique.
- Case 1+1+1+1+1. If some column α contains at least two points with y-order β_1<⋯<β_k (k≥2), choose β=β_{k−1} (the second-highest y in that column). Row β is a singleton, and v_α(β)=1; no other column meets row β, so T_3(β)=1 and (3,β) is unique. If every column contains at most one point, U is an antichain and Theorem 4 yields a unique type-2 color.
These cases are exhaustive. In each case G[U] contains a uniquely colored edge. ∎

Remark (editorial correction to Theorem 11). In the last paragraph of Theorem 11, the phrase “v(β)=1” should read “v_α(β)=1 for the unique contributing α” (equivalently T_3(β)=1).