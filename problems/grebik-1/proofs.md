# Rigorous Proofs



Structural lemmas for tilings by vertical intervals

Setup. Let Ω = ⋃_{j=1}^m {n_j} × I_j ⊂ Z × S^1, where I_j ⊂ S^1 are half-open arcs of positive length ℓ_j := |I_j| and n_j ∈ Z. A (measurable) tiling is a set T ⊂ Z × S^1 such that the translates {Ω + t : t ∈ T} form a pairwise disjoint cover of Z × S^1 up to null sets (counting × Lebesgue measure).

Lemma 1 (Local finiteness and unit-sum per column). For any tiling Ω ⊕ T = Z × S^1 and any n ∈ Z, the family of arcs appearing on the fiber {n} × S^1 is finite and the sum of their lengths is 1.
Proof. Each contributing arc on {n} × S^1 has positive length and the family is almost-disjoint; hence only finitely many can fit. Coverage up to null sets implies the length-sum equals 1.

Let d := gcd{n_j − n_1 : 1 ≤ j ≤ m} (equivalently gcd of all pairwise differences).

Proposition 2 (Residue-class decomposition). For r ∈ Z/dZ set T_r := {t ∈ T : t_Z ≡ r (mod d)} and X_r := {x ∈ Z : x ≡ r + n_1 (mod d)}. Then for every r,
Ω ⊕ T_r = X_r × S^1 (disjointly, up to null sets),
and T = ⊔_{r∈Z/dZ} T_r, Z = ⊔_{r∈Z/dZ} X_r.
Proof. If t = (u,θ) ∈ T_r, then every arc from Ω + t lies in columns u + n_j, all congruent to r + n_1 mod d, so Ω ⊕ T_r ⊆ X_r × S^1. Conversely, fix x ∈ X_r; any arc covering {x} × S^1 must come from some t with u + n_j = x, hence u ≡ x − n_j ≡ r (mod d). Thus only points of T_r contribute at column x. Since Ω ⊕ T covers {x} × S^1, Ω ⊕ T_r covers {x} × S^1. Disjointness of different r is clear.

Corollary 3 (Irreducible components are residue-pure; lower bound). Let T = ⊔_{i∈I} T_i be an irreducible decomposition with Ω ⊕ T_i = X_i × S^1. Then for each i, T_i ⊂ T_r for some r, and X_i ⊂ X_r. Consequently, any irreducible decomposition has at least d components. In particular, if an irreducible decomposition has exactly two components, then d ≤ 2; if d = 2, the two X-sets are the two residue classes modulo 2 (translates of each other).
Proof. Suppose T_i contains points of two distinct residue classes r ≠ r′. Then writing A := T_i ∩ T_r and B := T_i ∩ T_{r′}, we have Ω ⊕ A = (X_i ∩ X_r) × S^1 and Ω ⊕ B = (X_i ∩ X_{r′}) × S^1, a nontrivial decomposition of T_i, contradicting irreducibility. Hence T_i ⊂ T_r for some r. Since the X_r’s partition Z, at least one irreducible component is needed per residue class, giving the lower bound. For d = 2, the two residue classes are translates, so any two-component irreducible decomposition must coincide with these classes.

Lemma 4 (Periodicity ⇒ periodic columns). If Ω ⊕ T_i = X_i × S^1 and T_i is (a,α)-periodic, then X_i + a = X_i (i.e., X_i is a-periodic).
Proof. Ω ⊕ (T_i + (a,α)) = (Ω ⊕ T_i) + (a,α) = (X_i + a) × S^1. Since T_i + (a,α) = T_i, the claim follows.

Lemma 5 (Minkowski relation for a component). Let N := {n_1,…,n_m}. If Ω ⊕ T_i = X_i × S^1 and Y_i := proj_Z(T_i), then X_i = Y_i + N := {y + n : y ∈ Y_i, n ∈ N}.
Proof. If y ∈ Y_i, then (Ω + (y,θ)) contributes exactly to y + N, hence y + N ⊂ X_i. Conversely, if x ∈ X_i, at least one arc appears at x; any such arc is I_j shifted by some θ coming from a point t = (y,θ) with y + n_j = x, so x ∈ Y_i + N.

Lemma 6 (Per-residue linear constraints for periodic components). Fix a ≥ 1 and suppose Ω ⊕ T_i = X_i × S^1 with T_i (a,α)-periodic. For s ∈ Z/aZ let p^i_s be the number of anchors in T_i with integer coordinate congruent to s inside a fixed complete residue set modulo a (local finiteness ensures p^i_s < ∞). Then, for every r ∈ Z/aZ,
Σ_{j=1}^m ℓ_j · p^i_{r − n_j} = 1 if r ∈ X_i (mod a), and 0 otherwise.
Moreover, for the full tiling T = ⊔_i T_i, one has for all r,
Σ_{j=1}^m ℓ_j · p_{r − n_j} = 1, where p_s := Σ_i p^i_s.
Proof. In residue class r, contributors from T_i to a column come precisely from anchors with residues s ≡ r − n_j. The number of such anchors per period is p^i_{r − n_j}. Lemma 1 yields the unit sum on r ∈ X_i and zero otherwise. Summing over i gives the last identity.

Remarks. From Lemma 4, in the main problem any admissible partition X = X_1 ⊔ X_2 must split Z into a-periodic subsets; combined with Corollary 3, the case of exactly two irreducible components with X_1, X_2 not translates forces d = 1 and a ≥ 3.
