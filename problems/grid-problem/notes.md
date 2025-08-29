Setup and terminology.
- U ⊆ [n]×[n]. For p=(x,y) and q=(x',y'), say q is NE of p if x'>x and y'>y, and q is SE of p if x'>x and y'<y. Let G[U] be the graph on vertex set U with one edge for every unordered pair {p,q}. Each edge receives one of four types:
  • Type 1 (NE–SW): endpoints differ in both coordinates and one is NE of the other. The color label is (1,α,β) with α = min{x,x'} and β = min{y,y'}; equivalently the SW endpoint’s coordinates.
  • Type 2 (NW–SE): endpoints differ in both coordinates and one is NW of the other. The color label is (2,α,β) with α = min{x,x'} (the NW x) and β = min{y,y'} (the SE y).
  • Type 3 (vertical): same x; the color label is (3,β) where β = min{y,y'} (the lower y).
  • Type 4 (horizontal): same y; the color label is (4,α) where α = min{x,x'} (the left x).

Exact multiplicities (global; now established).
- Type 1: For (α,β)∈U, the multiplicity of color (1,α,β) equals the number of NE neighbors of (α,β) in U. No edge receives label (1,α,β) unless (α,β)∈U.
- Type 2: For any (α,β)∈[n]^2, set r_U(α,β)=# { (α,y)∈U : y>β } and s_U(α,β)=# { (x,β)∈U : x>α }. Then the multiplicity of color (2,α,β) equals r_U(α,β)·s_U(α,β). In particular it is unique iff r_U(α,β)=s_U(α,β)=1.
- Type 3: For any β, the multiplicity of (3,β) equals T_3(β)=∑_α 1_{(α,β)∈U} · # { (α,y)∈U : y>β }. It is unique iff exactly one α contributes and contributes 1.
- Type 4: For any α, the multiplicity of (4,α) equals T_4(α)=∑_β 1_{(α,β)∈U} · # { (x,β)∈U : x>α }. It is unique iff exactly one β contributes and contributes 1.

Safe uniqueness triggers (now established).
- Single-line uniqueness: If U⊆[n]×{y0} with |U|≥2, list its x-coordinates x_1<⋯<x_m. Then the edge between (x_{m−1},y0) and (x_m,y0) is the only edge in G[U] colored (4,x_{m−1}). Dually, if U⊆{x0}×[n] with |U|≥2, then the edge between (x0,y_{m−1}) and (x0,y_m) is the only edge colored (3,y_{m−1}).
- Singleton+extension uniqueness (global): If a row β contains exactly one vertex (α,β) and in column α there is exactly one vertex above it, then (3,β) is unique. Dually, if a column α contains exactly one vertex (α,β) and in row β there is exactly one vertex to its right, then (4,α) is unique. These follow immediately from the type-3/4 formulas.
- Antichain ⇒ unique type 2: If U is an antichain (no two share a row or a column), then ordering its points by increasing x (hence decreasing y), any consecutive pair (x_i,y_i),(x_{i+1},y_{i+1}) yields r_U(x_i,y_{i+1})=s_U(x_i,y_{i+1})=1, hence (2,x_i,y_{i+1}) is unique.
- Clean gap between consecutive maxima: Let M=Max(U) in the product order, list M as (x_1,y_1),…,(x_k,y_k) with x_1<⋯<x_k and y_1>⋯>y_k. For i∈{1,…,k−1} set R_i=# { (x_i,y)∈U : y>y_{i+1} } and S_i=# { (x,y_{i+1})∈U : x>x_i }. If R_i=S_i=1, then the color (2,x_i,y_{i+1}) is unique.
- 2×2 rectangle with clean margins: If U contains the four corners of {(x_1,y_1),(x_1,y_2),(x_2,y_1),(x_2,y_2)} with x_1<x_2, y_1<y_2 and has no other point in column x_1 above y_1 and no other point in row y_1 to the right of x_1, then (2,x_1,y_1) is unique.
- All three-point sets: If |U|=3, then G[U] has a uniquely colored edge. (Full case analysis is recorded in output.)

Corrections and counterexamples.
- “Three or more on a row/column ⇒ unique type 4/3” is false without further global conditions. Counterexample: U = {(1,1),(2,1),(3,1),(2,2),(4,2)}. On row y=1 we get a single occurrence of (4,2) within that row, but globally (4,2) occurs again on row y=2 (edge (2,2)–(4,2)). One must apply the global T_4(α) formula across all rows.
- Gap in “unique maximal ⇒ unique color” (as previously sketched). The subcase S≠∅ must rule out extra NE neighbors lying on the top row or rightmost column. Example showing the gap: U = {(3,3),(4,5),(5,5)}. Here p=(3,3) has two NE neighbors (4,5) and (5,5). A correct proof should either find a different witness (types 3/4 via T_3/T_4) or choose p to avoid such extra NE neighbors. This remains an open item to be fixed.

Open directions.
1) Complete the unique-maximal case rigorously, as outlined above (identify conditions under which T_3/T_4 already gives uniqueness; otherwise find p∈S with unique NE neighbor).
2) For |Max(U)|≥2, either certify a clean gap (R_i=S_i=1) for some consecutive pair, or force a type-3/4 trigger (singleton+extension) or a unique type-1 via a minimality argument on the “extra” points counted by R_i−1 and S_i−1.
3) Extend the small-case verification from |U|=3 to |U|=4 to stress-test the dichotomies and expose the right minimality invariants.
New curated results and corrections (this round)

1) Robust L-corner uniqueness (type 2)
If there exist α<α′ and β<β′ with (α,β′),(α′,β)∈U and, moreover, (i) (α,β) has exactly one point above it in its column (namely (α,β′)) and (ii) exactly one point to its right in its row (namely (α′,β)), then by the type-2 multiplicity formula r_U(α,β)=s_U(α,β)=1 and so the color (2,α,β) is unique. This generalizes the previously noted “2×2 rectangle with clean margins” by not requiring the NE corner (α′,β′) to be present.

2) Cross-shape (row ∪ column) support ⇒ unique color
If U is contained in the union of a single row Y and a single column X and |U|≥2, then G[U] has a uniquely colored edge. Proof: if |U∩row Y|≥2, let α be the second-largest x on that row. Since α≠X, the only row containing (α,·) inside U is Y, and on that row h_Y(α)=1. Thus T_4(α)=1 (unique type 4). Otherwise |U∩column X|≥2 and the vertical analogue gives a unique type 3.

3) Unique-maximal triggers
Let U have a unique maximal m=(X,Y) in the product order. Then X and Y are the global maxima of the used x- and y-coordinates. Define T={x<X : (x,Y)∈U} with α₂=max T (if T≠∅) and R={y<Y : (X,y)∈U} with β₂=max R (if R≠∅). Let S={p∈U : p_x<X and p_y<Y} and let Max(S) denote the set of product-maximal elements of S.
- H′ (SW-max + boundary thresholds ⇒ unique type 1). If S≠∅ and there exists p∈Max(S) with p_x≥α₂ and p_y≥β₂, then p has exactly one NE neighbor in U (namely m), hence the color (1,p_x,p_y) is unique.
- K (top-row pivot ⇒ unique type 4). If T≠∅ and the column α₂ contains no point below Y, then T_4(α₂)=1, realized by the top-row edge between (α₂,Y) and m.
Remark: The column-dual must be formulated with care (see below) to avoid extra contributors in T_3(β₂).

Corrections to proposed lemmas
- The proposed Lemma J (empty L-corner ⇒ unique type 2) was too weak: forbidding points only in the open segments (β,β′) and (α,α′) does not preclude additional points above β′ or to the right of α′. A correct sufficient condition is exactly r_U(α,β)=s_U(α,β)=1 (see robust L-corner above). Counterexample to the weak form: U={(1,2),(3,1),(1,5),(5,1)} satisfies the stated emptiness on (1, y∈(1,2)) and (x∈(1,3),1) but yields multiplicity 4 for color (2,1,1).
- The proposed Lemma K′ (right-column pivot ⇒ unique type 3) as stated omitted the requirement that no other columns contribute to T_3(β₂). A safe version is the singleton+extension trigger: if row β₂ is a singleton (only (X,β₂)) and column X has exactly one point above β₂ (necessarily m in the unique-maximal regime), then T_3(β₂)=1. Counterexample to the weak form: U={(5,5),(5,2),(1,2),(1,4)} makes T_3(2)=2.
- The proposed Lemma L (top/right extremality of consecutive maxima ⇒ unique type 2) is false without excluding intermediate points in column x_i above y_{i+1} (or in row y_{i+1} to the right of x_i). Counterexample: U={(2,5),(5,2),(2,4)} satisfies “m_i topmost” and “m_{i+1} rightmost,” yet r_U(2,2)=2.

Four-point sets (|U|=4)
The claim that every 4-point configuration admits a uniquely colored edge is true; a corrected complete proof is added to output.md. The flawed claim “if no row has 2 points, then no column has 2 points” is refuted by U={(1,1),(1,3),(2,2),(2,4)}. The corrected proof handles all row/column occupancy patterns (4), (3+1), (2+2), (2+1+1), and (1+1+1+1), using type-3/4 triggers or the antichain lemma.

Roadmap for the unique-maximal case
- S=∅ is settled by the cross-shape lemma.
- For S≠∅, aim for a trichotomy: H′ or K (or the safe column-dual) or a robust L-corner (D′) must fire. A workable extremal choice is p∈Max(S) with maximal x and, among those, maximal y; analyze its nearest boundary neighbors and the emptiness of the two open segments above/right of p. If both segments are populated, try to extract a singleton+extension on the boundary or an L-corner between consecutive top-row/right-column supports.
Erratum to Theorem 11 (|U|=4) and fix.
- The original subcase “two distinct rows each have exactly two points and share the same left endpoint α ⇒ T_3(β)=1 for the lower β” was incorrect. Counterexample: the 2×2 rectangle U={(1,1),(1,2),(2,1),(2,2)} has two columns contributing to T_3(1).
- Correct resolution: In that subcase, let β be the lower y among the two points in column α. Then row β has exactly two points (α,β),(γ,β) (so s_U(α,β)=1), and column α has exactly one point above β (namely at the higher row, so r_U(α,β)=1). By Theorem 7 (robust L-corner), (2,α,β) is unique. This uniform fix also covers the rectangle case.

Safe global triggers (recorded for use).
- R4 (row-of-two with globally unique left endpoint ⇒ unique type 4). Suppose some row β has exactly two points (α,β),(α′,β) with α<α′, and for every other row β′ either (α,β′)∉U or there is no point (x,β′) with x>α. Then T_4(α)=1, hence there is a unique color (4,α). Proof: From the type-4 formula, only row β contributes and contributes 1.
- R3 (column-of-two with globally unique lower endpoint ⇒ unique type 3). Suppose some column α has exactly two points (α,β)<(α,β′) with β<β′, and for every other column α′ either (α′,β)∉U or there is no point (α′,y) with y>β. Then T_3(β)=1, hence there is a unique color (3,β). Proof: From the type-3 formula, only column α contributes and contributes 1.

Unique-maximal structure (replace R1 by UM1).
- Setup: U has a unique maximal m=(X,Y). Let S={p∈U: p_x<X and p_y<Y} and Max(S) be its product-order maxima.
- UM1 (boundary-only NE neighbors for SW-maxima). For any p=(α,β)∈Max(S): (i) there is no q∈U with x=α and β<y<Y; (ii) there is no q∈U with y=β and α<x<X. Consequently, any NE neighbor of p lies on the top row y=Y or the right column x=X. Proof: If such a q existed in (i) or (ii), then q∈S and q≻p, contradicting p∈Max(S).
- Caution: The statement “If exactly one of (α,Y) and (X,β) lies in U, then p has exactly one NE neighbor” is false without further constraints. Counterexample: m=(5,5), p=(2,2)∈Max(S), and top-row points (3,5),(4,5) present while (2,5),(5,2) are absent. Then p has multiple NE neighbors. The correct boundary-threshold uniqueness is Theorem 9: require p_x≥α₂ and p_y≥β₂, where α₂ (resp. β₂) is the largest x<X with (x,Y)∈U (resp. largest y<Y with (X,y)∈U).

Maxima-local L-corner certificate.
- D′ (explicit consecutive-maxima L-corner). If M=Max(U)={m_i=(x_i,y_i)} with x_1<⋯<x_k and y_1>⋯>y_k and for some i there is no (x_i,y) with y_{i+1}<y<y_i and no (x,y_{i+1}) with x_i<x<x_{i+1}, then r_U(x_i,y_{i+1})=s_U(x_i,y_{i+1})=1 and color (2,x_i,y_{i+1}) is unique. This is a specialization of Theorem 7.

Extremal SW-max analysis blueprint (pivot-or-corner).
- Choose p∈Max(S) maximizing x and then y. By UM1, r_U(p),s_U(p)∈{0,1}, and all NE neighbors lie on the top row or right column.
  • Regime A: r_U(p)=s_U(p)=1 and p_x≥α₂, p_y≥β₂ ⇒ unique type 1 (Theorem 9).
  • Regime B: exactly one of r_U(p),s_U(p) equals 1. Try to promote a singleton+extension (Theorem 3) or apply R3/R4 to that row/column.
  • Regime C: r_U(p)=s_U(p)=0. Show the nearest top-row point right of p and nearest right-column point above p cannot both exist away from m; otherwise one can extract a robust L-corner (Theorem 7) at p. This will complete the unique-maximal case.

Toward a counting lemma for multiple maxima.
- The horizontal rays on rows y_{i+1} (counted by S_i) and vertical rays on columns x_i (counted by R_i) are anchored at disjoint rows/columns across i. If all R_i,S_i are large (≥2), then many rows/columns carry 
“extensions,” suggesting that a singleton+extension trigger (Theorem 3) or a robust L-corner (Theorem 7) must occur. Aim to formalize via a pigeonhole/counting argument over {y_{i+1}} and {x_i}.
Addenda: unique–maximal thresholds and crossing analysis

Definitions. Let U ⊆ [n]×[n] and assume U has a unique maximal element m = (X,Y) in the product order. Define
- T = { x < X : (x,Y) ∈ U } and, if T ≠ ∅, α₂ = max T.
- R = { y < Y : (X,y) ∈ U } and, if R ≠ ∅, β₂ = max R.
- S = { p ∈ U : p_x < X and p_y < Y }, and let Max(S) denote its product-order maximal elements.

Threshold-existence lemmas (for search reduction).
- Lemma UM–X (x-threshold). If S ≠ ∅ and T ≠ ∅, then either (i) column α₂ contains no point below Y, in which case Theorem 10 applies and yields a unique type-4 color, or (ii) there exists p ∈ Max(S) with p_x ≥ α₂.
  Proof. If column α₂ has no point below Y, we are in (i). Otherwise pick q = (α₂,β) with β < Y, so q ∈ S. In any finite poset, q is dominated by some p ∈ Max(S), hence p_x ≥ α₂.
- Lemma UM–Y (y-threshold). If S ≠ ∅ and R ≠ ∅, then either (i) row β₂ is a singleton {(X,β₂)} and Theorem 3 applies (unique type-3), or (ii) there exists q ∈ Max(S) with q_y ≥ β₂.
  Proof. If row β₂ is a singleton, we are in (i). Otherwise take r = (α,β₂) with α < X, so r ∈ S and is dominated by some q ∈ Max(S), whence q_y ≥ β₂.

Corollary (two-threshold reduction for unique–maximal). In the unique–maximal regime, unless a pivot is already available (Theorem 10 or the safe type-3 singleton-row trigger), we can locate p,q ∈ Max(S) meeting the x- and y-thresholds respectively (p_x ≥ α₂ and q_y ≥ β₂). If some s ∈ Max(S) meets both thresholds simultaneously, Theorem 9 yields a unique type-1 color. The only unresolved subcase is the crossing: x-threshold and y-threshold are met, but by different maxima.

Crossing-pair blueprint. List Max(S) as s_1, …, s_k with x increasing and y decreasing. Suppose indices f,g exist with x(s_f) ≥ α₂ and y(s_g) ≥ β₂ but no single s_i satisfies both. Then g ≥ f and, in fact, f > g. Consider the L-corner at (x(s_g), y(s_{g+1})).
- Vertical ray at x = x(s_g): let y_v be the minimum y ∈ (y(s_{g+1}), Y) with (x(s_g), y) ∈ U, if any (else the ray is clean).
- Horizontal ray at y = y(s_{g+1}): let x_h be the minimum x ∈ (x(s_g), X) with (x, y(s_{g+1})) ∈ U, if any (else the ray is clean).
Dichotomy to establish next: If both rays are clean up to their boundary supports, then Theorem 7 applies at (x(s_g), y(s_{g+1})) and yields a unique type-2 color. Otherwise, analyze the nearest interloper(s) at y_v and/or x_h; prove that at least one induces a safe unique color via either Theorem 3 (singleton+extension) or the global triggers R3/R4. This will complete the unique–maximal case.

Pattern library (robust L-corner in a 2+2(+…)).
- RL (two 2-point rows sharing a left endpoint with a clean column ⇒ unique type 2). If rows β₁ < β₂ have (α,β_i) and (γ_i,β_i) with α < γ_i (i=1,2), column α contains exactly (α,β₁),(α,β₂), and on the lower row β=β₁ there is exactly one point to the right of α (namely (γ₁,β)), then by Theorem 7 we have a unique (2,α,β).

Multiple maxima: counting lemma (work-in-progress). For M = Max(U) listed as m_i=(x_i,y_i) with x_1<…<x_k and y_1>…>y_k, define R_i and S_i as in Theorem 5. If no D′-witness exists for any i, then for each i at least one of R_i, S_i is ≥ 2. Since the rows {y_{i+1}} and columns {x_i} are disjoint across i, collect the “excess” contributors across all i and prove that some row/column must realize a singleton+extension (Theorem 3) or one of the global triggers R3/R4 (hence a unique type-3/4), or else a D′-witness appears, contradicting the assumption. Formalize an exact inequality to conclude.

Stress tests to design. “Staircase + boundary fillers” families where Max(U) is a long chain, and rows y_{i+1} and columns x_i have either clean rays or minimally dirty rays (single interloper). Use them to verify the nearest-interloper analysis and to calibrate when Theorem 7 vs. type-3/4 triggers apply.
Unique–maximal: new local triggers and the |Max(S)|=1 closure

Definitions recap (unique–maximal regime). Assume U has a unique maximal m=(X,Y) in the product order. Define
- T = { x<X : (x,Y)∈U }, α₂ = max T if T≠∅.
- R = { y<Y : (X,y)∈U }, β₂ = max R if R≠∅.
- S = { p∈U : p_x<X and p_y<Y }, and Max(S) its product-order maxima.

New local certificate at a SW-maximum (UM2′).
- Lemma (UM2′). If p=(α,β)∈Max(S) and both boundary-aligned points (α,Y) and (X,β) lie in U, then the color (2,α,β) is unique. Reason: By UM1, column α has no points in (β,Y) and row β has no points in (α,X). O1 forbids points beyond the boundary. Thus r_U(α,β)=s_U(α,β)=1, and Theorem 1 (type 2) yields uniqueness.

Closure when |Max(S)|=1 (UM-single).
- Theorem (UM-single). If S≠∅ and Max(S)={p=(α,β)}, then G[U] has a uniquely colored edge. Sketch (casework):
  • If T=R=∅, then by UM1 any NE neighbor of p lies on the boundary; since only m lies there, (1,α,β) is unique (type 1).
  • If T≠∅ and column α₂ has no point below Y, Theorem 10 gives a unique type 4.
  • If R≠∅ and row β₂ is a singleton {(X,β₂)}, Theorem 3 gives a unique type 3 (v_X(β₂)=1 holds automatically in this regime).
  • If T≠∅, R=∅ and column α₂ has some (α₂,β′) with β′<Y, then q=(α₂,β′)∈S and the uniqueness of the maximal element forces p≥q, hence p_x≥α₂. By UM1, all NE neighbors of p lie on the boundary; the right column contributes none (R=∅) and, among top-row points other than m, all have x≤α₂≤p_x, so none lies to the right of p. Thus m is p’s only NE neighbor and (1,α,β) is unique.
  • If T=∅, R≠∅ and row β₂ has some (α′,β₂) with α′<X, then similarly p_y≥β₂ and the only NE neighbor is m; (1,α,β) is unique.
  • If T,R≠∅ and both pivots fail, pick q₁=(α₂,β′) with β′<Y and q₂=(α′,β₂) with α′<X; then p≥q₁,q₂ so p_x≥α₂ and p_y≥β₂. Theorem 9 applies and (1,α,β) is unique.

Boundary-local type-2 triggers (first subrow/last left column).
- T2α. If T≠∅, column α₂ has some point below Y, and β_c=max{ y<Y : (α₂,y)∈U }, then whenever row β_c has exactly one point to the right of α₂ (i.e., h_{β_c}(α₂)=1), the color (2,α₂,β_c) is unique (r=1 via (α₂,Y), s=1 by hypothesis).
- T2β. If R≠∅, row β₂ has some point left of X, and α_r=max{ x<X : (x,β₂)∈U }, then whenever column α_r has exactly one point above β₂ (i.e., v_{α_r}(β₂)=1), the color (2,α_r,β₂) is unique (s=1 via (X,β₂), r=1 by hypothesis).

Pattern library (column-dual robust L-corner).
- RL′. If columns α<α′ have exactly (α,β),(α,β₁) with β<β₁ and (α′,β),(α′,β₂) with β<β₂, and row β contains exactly (α,β),(α′,β), then (2,α,β) is unique. This is a direct instance of Theorem 7.

Crossing subcase blueprint (|Max(S)|≥2; refined target for next round).
- List s_1,…,s_k=Max(S) with x increasing, y decreasing. If both T,R≠∅ and neither pivot fires, there exist indices f,g with x(s_f)≥α₂ and y(s_g)≥β₂ but no single s_i meets both (hence f>g). Consider the crossing corner c=(x(s_g), y(s_{g+1})).
  • If the open segments above/right of c are clean up to the boundary supports, Theorem 7 gives a unique type-2 at c.
  • Otherwise, let y_v be the least y>y(s_{g+1}) with (x(s_g),y)∈U, and x_h the least x>x(s_g) with (x,y(s_{g+1}))∈U. The next lemma to prove: at least one of these nearest interlopers can be converted into a safe uniqueness via Theorem 3 (singleton+extension) or the global R3/R4 triggers; failing that, both segments are clean and Theorem 7 fires. The disjointness of the rows {y(s_{i+1})} and columns {x(s_i)} across i will be the key to isolating a globally unique base.

Editorial note. In Theorem 11’s last paragraph, the phrase “v(β)=1” should read “T_3(β)=1” or “v_α(β)=1 for the unique contributing α”; this is purely notational.
Additions: general corollaries, robust pattern, and the |U|=5 resolution

Immediate corollaries of multiplicity formulas (for convenient use)
- S4gen (type 4 uniqueness by a single contributing row). Fix α. If there exists β₀ with (α,β₀)∈U and h_{β₀}(α)=1, and for every β≠β₀ with (α,β)∈U we have h_β(α)=0, then T_4(α)=1 and color (4,α) is unique. This is a direct read-off from Theorem 1 (type 4).
- S3gen (type 3 uniqueness by a single contributing column). Fix β. If there exists α₀ with (α₀,β)∈U and v_{α₀}(β)=1, and for every α≠α₀ with (α,β)∈U we have v_α(β)=0, then T_3(β)=1 and color (3,β) is unique. Direct from Theorem 1 (type 3).

Robust 2+2 pattern (instance of Theorem 7)
- RLclean+. If two distinct rows β₁<β₂ have points (α,β_i),(γ_i,β_i) with α<γ_i (i=1,2), and column α contains exactly (α,β₁),(α,β₂), then r_U(α,β₁)=s_U(α,β₁)=1, so (2,α,β₁) is unique by Theorem 7. This is stable under arbitrary extra points off column α.

Complete classification for |U|=5 (key substructures and the tricky 2+2+1 subcase)
Let |U|=5. By row-occupancy, one of: 5; 4+1; 3+2; 3+1+1; 2+2+1; 2+1+1+1; 1+1+1+1+1.
- 5 (single row) and 4+1: The rightmost-but-one left base on the heavy row gives T_4(α)=1 (Theorem 2 and type-4 formula); off-row points (if any) are singletons and contribute 0 at that α.
- 3+2: If the 2-point row’s left endpoint equals the middle x of the 3-point row, apply Theorem 7 (robust L-corner). Otherwise (4, x_mid) is unique: only the 3-point row contributes 1 to T_4(x_mid); the 2-point row cannot contribute positively at x_mid.
- 3+1+1: On the 3-point row, T_4(x_mid)=1; singleton rows contribute 0 at x_mid.
- 2+1+1+1: If the 2-point row has left endpoint α, then T_4(α)=1; no other row contributes positively at α.
- 1+1+1+1+1: If some column α contains ≥2 points with y-order β₁<⋯<β_k, choose β=β_{k−1}. Then row β is a singleton, v_α(β)=1, and no other column meets row β; hence T_3(β)=1. If every column has ≤1 point, U is an antichain and Theorem 4 yields a unique type-2 color.
- 2+2+1: If the 2-point rows have distinct left endpoints, let α be either left endpoint; only that row contributes positively to T_4(α), hence T_4(α)=1. If they share the same left endpoint α:
  • If the singleton is not in column α, apply RLclean+ to get a unique type 2 at (2,α,β_low).
  • If the singleton lies in column α, then column α has exactly three points. Let β_mid be the median y among them. If β_mid is one of the 2-point rows, then r_U(α,β_mid)=1 and s_U(α,β_mid)=1, hence (2,α,β_mid) is unique. If β_mid is the singleton row, then v_α(β_mid)=1 and no other column meets row β_mid, so T_3(β_mid)=1.

Editorial correction (notational). In Theorem 11’s last paragraph, replace “v(β)=1” by “v_α(β)=1 for the unique contributing α” (equivalently T_3(β)=1).

Next-step scaffold (unique–maximal crossing)
- Define, in the crossing subcase, the corner c=(x(s_g),y(s_{g+1})) and the nearest interlopers y_v on the vertical ray and x_h on the horizontal ray from c. Target lemma (NIL): if both boundary-local triggers of Lemma 14 fail, then either (i) both rays are clean up to their boundary supports and Theorem 7 applies at c, or (ii) at least one of y_v or x_h yields a singleton+extension (Theorem 3) or an S3gen/S4gen witness. The disjointness of the rows {y(s_{i+1})} and columns {x(s_i)} across i isolates a single contributing base, ensuring uniqueness.