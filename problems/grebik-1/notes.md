# Research Notes



Clarifications and structural progress
- Measure: We work with counting measure on Z and Lebesgue measure on S^1; all sets are measurable; equalities/disjointness are up to null sets.
- Intervals: Use half-open arcs on S^1; endpoints are negligible.
- Periodicity: A ⊂ Z × S^1 is (a,α)-periodic if A + (a,α) = A with a ∈ Z\{0}, α ∈ R/Z of infinite order for ‘irrational’.
- Irreducible component: T_i is irreducible if it cannot be split into nontrivial disjoint subfamilies that themselves tile disjoint subsets of columns.

Per-column finiteness
For any tiling Ω ⊕ T = Z × S^1 and any column n, only finitely many pieces appear and the sum of their lengths is 1.

Residue-class (mod d) decomposition
Let d := gcd{n_j − n_h}. For r ∈ Z/dZ define T_r := {t ∈ T : t_Z ≡ r (mod d)} and X_r := {x ∈ Z : x ≡ r + n_1 (mod d)}. Then Ω ⊕ T_r = X_r × S^1, and T = ⊔_{r} T_r, Z = ⊔_{r} X_r.

Consequences
- Every irreducible component lives inside a single residue class modulo d; thus any irreducible decomposition has at least d components.
- Therefore an irreducible decomposition with exactly two components forces d ≤ 2. If d = 2, the two X-sets are the two residue classes modulo 2 (translates), so to have X_1, X_2 not translates one must have d = 1 and a ≥ 3.

Periodic components
If T_i is (a,α)-periodic, then X_i is a-periodic (union of residue classes mod a). Moreover, with N = {n_j}, if Y_i := proj_Z(T_i), then X_i = Y_i + N.

Residue linear system (per-period counts)
Fix a and set ℓ_j = |I_j|. For (a,α)-periodic T_i, let p^i_s be the number of anchors with integer coordinate s in a chosen complete residue set mod a (local finiteness ⇒ p^i_s < ∞). Then for each residue r ∈ Z/aZ:
Σ_j ℓ_j · p^i_{r − n_j} = 1 if r ∈ X_i (mod a), and 0 otherwise.

Implications for the main problem
- Necessary: d = 1 and a ≥ 3.
- Unknown: Existence for d = 1 under the given periodicities. We must either produce a construction (solving the linear system and realizing phases) or prove a global obstruction (e.g., Fourier analysis on Z/aZ combined with irreducibility).

Planned next steps
1) Prove formally that any irreducible component is contained in a single residue class modulo d (recorded in proofs). 2) Focus on d = 1, a ≥ 3; choose small m, small N with gcd 1, and attempt to solve the per-residue linear system for integer solutions with X_1, X_2 a-partition but not translates. 3) If solutions exist, construct phases consistent with (a,0) and (a,α) periodicities; otherwise develop a Fourier-based obstruction to rule them out.