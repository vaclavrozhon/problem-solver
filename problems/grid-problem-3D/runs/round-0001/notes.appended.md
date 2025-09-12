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