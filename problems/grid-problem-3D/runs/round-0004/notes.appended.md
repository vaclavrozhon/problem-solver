# Research Notes



3D unique color under c3: strategy and notes

- Coloring c3(e)=(T,ℓ) records the sign type modulo global sign and the full componentwise minimum ℓ, including the equal coordinates (E(T)). This prevents loss of information across slices.

- Dichotomy:
  1) Slice case: If a coordinate slice (e.g., z=t) contains ≥2 points, apply the proven d=2 theorem on that slice. Because c3 remembers the fixed coordinate value t in ℓ and has E(T) including that coordinate, uniqueness in the slice implies global uniqueness (edges off the slice have z in J(T) or different ℓ_z).
  2) Coordinatewise injective case: If every coordinate slice contains ≤1 point, then all coordinates are distinct across U. Two subcases:
     - If an incomparable pair exists, pick any mixed-sign type (some + and some −). A product multiplicity r·s argument (fixing a representative sign vector) shows both factors are ≤1 under injectivity and equal 1 for the realized color, hence multiplicity 1.
     - If no mixed-sign edges exist, U is a chain in the product order. Injectivity forces strict increase in each coordinate along the chain. The [+++]-type at the penultimate element has exactly one NE neighbor, so multiplicity 1.

- Multiplicity (useful facts):
  - [+++]-type with lower corner α has multiplicity 1_{α∈U}·|NE_3(α)|.
  - One-odd-coordinate types (e.g., [++−]) factor as r·s, where r counts points on the α-anchored line increasing in the odd coordinate and s counts points in the fixed-level plane strictly NE in the other two coordinates. Under injectivity, r,s≤1.

- This yields a short complete proof in 3D. The same method scales to dimension d by induction: either reduce on a coordinate hyperplane or use the injective case (unique mixed-sign color, or chain gives unique [+,…, +]).

Plan for d=3 under color c_3(T, \ell):

- Slice reduction: If some z-slice U_z[t] contains at least two points, apply the proven d=2 theorem on that slice (with the 2D color remembering which coordinates are equal). The 3D color of the chosen in-slice edge has T_z=0 and records t in \ell_z, so any edge with the same 3D color must lie in the same slice and have the same 2D color. Hence uniqueness lifts from 2D to 3D.

- Complementary case: If every z-slice contains at most one point of U, list vertices by increasing z: v_1,\dots,v_m with z_1<\cdots<z_m. The edge v_{m-1}v_m has \ell_z=z_{m-1}. No other edge has this \ell_z value: any edge with \ell_z=z_{m-1} must use v_{m-1} and a partner above z_{m-1}, which is uniquely v_m. Thus c_3(v_{m-1}v_m) is unique.

- This resolves d=3 without extra counting. For higher d, the same idea suggests induction: either a (d−1)-dimensional slice contains ≥2 points (reduce to d−1), or every slice along the last coordinate has ≤1 point and the edge between the top two levels locks in a unique last-coordinate entry in \ell.


d=3 unique color under c_3: concise plan

- Slice lifting: If some z-slice U_t has at least two points, apply the proven d=2 theorem on that slice. Because c_3 records that z is equal (z∈E(T)) and stores ℓ_z=t, any edge with the same 3D color must lie in the same slice and have the same 2D color. Hence uniqueness in the slice implies global uniqueness.
- Complementary case: If every z-slice has at most one point, list points by increasing z as v_1<⋯<v_m. The edge v_{m-1}v_m has ℓ_z=z(v_{m-1}). No other edge can realize ℓ_z=z(v_{m-1}) (it would need the unique point at z(v_{m-1}) paired with a point above it, which is uniquely v_m). Thus c_3(v_{m-1}v_m) is unique.
- This yields a short complete proof in 3D. The same split suggests a straightforward induction in general dimension d: either reduce on a (d−1)-slice and lift, or use the top-two-level argument on the last coordinate.


d=3 finalized proof under c_3:
- Slice lifting: If some z-slice U_z[t] has at least two points, apply the d=2 theorem on that slice. Because c_3 stores z in E(T) and ℓ_z=t, uniqueness in the slice implies global uniqueness (any color match must lie in the same slice and match the 2D label).
- If every z-slice has at most one point, order vertices by z. The edge between the second-highest and highest z-levels has lower-corner z equal to the second-highest realized z value, forcing endpoints uniquely; hence its color is unique.

Note: A purported counterexample against the top-two-level lemma (e.g., multiple [+++] edges with identical ℓ from a lower vertex) does not contradict the lemma; the top-two edge’s ℓ_z is distinct and forces uniqueness.

Next: Extend to general dimension d. Define c_d analogously; either a (d−1)-slice has ≥2 points (reduce and lift), or every last-coordinate slice has ≤1 point and the edge between the top two last-coordinate levels is unique by the same ℓ-last argument. Optionally, use a general A_+·A_- multiplicity to handle mixed-sign types and explore quantitative bounds on the number of unique colors.