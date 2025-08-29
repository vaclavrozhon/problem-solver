Summary of proven results and why they matter
- Main existence theorem (Theorem A). We construct an explicit non-column tile A ⊂ Z×S^1 that admits two irreducible tilings with incommensurable vertical periods (1,α) and (1,α+1/2), α irrational.
- Boundary and structural tools. We record a precise boundary obstruction (Lemma E), a two-sided rational-independence corollary, and a minimal component-length lemma for finite columns. Together these provide quick non-column tests across many K.
- Fourier obstructions. We include a corrected and robust two-translate obstruction (Lemma T) and a new m=3 obstruction (Lemma M3) based on t and 3t, which replaces an earlier incorrect sketch.
- Complementary two-layer family: meanders and periods. Singleton tilings are classified by per-row increments in Stab(J_0) (Proposition K). We add a precise equivalence (Lemma P) between periodicity of increments and periodicity of the tiling, subsuming the helical cases and exhibiting many aperiodic examples when Stab(J_0)≠{0}.
- Two-order mechanism for K={0,1,2}. When c_1=c_3, a single tile admits two distinct singleton tilings corresponding to the two cyclic orders; non-columnity follows from boundary obstructions; incommensurability holds under a mild irrationality condition (Lemma Q).

Theorem A (Non-column tile with two incommensurable periods). Fix an irrational α∈(0,1/2). Let U⊂S^1 be a finite union of disjoint intervals of total length 1/4 such that U∩(U+1/2)=∅ and L(U)≠G(U) inside [0,1/2), where L(·),G(·) are the multisets of component and gap lengths. Define J_0:=U∪(U+1/2) (so |J_0|=1/2 and J_0+1/2=J_0), J_1:=S^1\(J_0+α), and set A:=( {0}×J_0 ) ∪ ( {1}×J_1 ). Then:
(i) There is a tiling T_α with period (1,α), and a tiling T_{α+1/2} with period (1,α+1/2).
(ii) Both tilings are irreducible.
(iii) A is not a column (i.e., there is no finite X⊂Z and T⊂Z×S^1 with A+T=X×S^1).
(iv) The periods are incommensurable: α/(α+1/2)∉Q.
Proof. (i) For θ_0 arbitrary, T_α={(n,θ_0+nα)} yields on row n the union (J_0+θ_n) ⊔ (J_1+θ_{n−1}) with θ_n=θ_0+nα; since J_1=S^1\(J_0+α), this is S^1 a.e. Using J_0+1/2=J_0, the same argument gives T_{α+1/2}. (ii) Singleton-per-row implies irreducible because ⟨K−K⟩=Z (Lemma B). (iii) Suppose A+T=X×S^1 with X finite. At the left boundary row p of a component of X the per-row disjointness forces a two-translate partition of S^1 by J_0 alone; by the component-length obstruction lemma (Lemma CL below) applied to J_0, this is impossible. (iv) If α/(α+1/2)=p/q∈Q, then α=p/(2(q−p))∈Q, contradiction. ∎

Lemma B (Irreducibility for singleton tilings with gcd(K−K)=1). Let A have layers at K={k_1,…,k_ℓ} and suppose |T_n|=1 for all n. Let H:=⟨K−K⟩≤Z. If H=Z then any tiling is irreducible.
Proof. If T=T_1⊔T_2 with A+T_i=X_i×S^1 and Z=X_1⊔X_2, then from m∈X_1 we deduce m−k_i∈X_1 for all i, so X_1 is a union of cosets of H. If H=Z, only ∅ and Z can occur. ∎

Lemma B′ (Reducibility when gcd(K−K)>1). If H:=⟨K−K⟩ has index g>1, decompose T by residues mod g: T^{(r)}:={ (z,θ)∈T : z≡r (mod g) }. Then A+T^{(r)}=X_r×S^1 with X_r:=gZ+r, so the tiling splits along residue classes. ∎

Lemma C (Singleton congruences under a fixed cyclic order: necessity and sufficiency). Assume |T_n|=1 and that on every row the ℓ intervals appear in the same cyclic order σ and meet end-to-end. Let c_i:=b_i−a_i and β:=θ_n−θ_{n−1} (mod 1). Then
  (k_i − k_{σ(i)}) β ≡ a_i + c_i − a_{σ(i)}  (mod 1),  i=1,…,ℓ.
Necessity and sufficiency as in the previous version. ∎

Lemma E (Boundary obstruction to finite-column tilings: explicit statement). Let A=⋃_i {k_i}×[a_i,b_i] and, for each height k, let the aggregated layer be J_k:=⋃_{i: k_i=k}[a_i,b_i] with μ_k:=|J_k|. Suppose A+T=X×S^1 with X finite, and write d_n:=|T_n|. Then for all m∈Z
  Σ_k μ_k · d_{m−k} = 1_{m∈X}.
If p:=min X and k_min:=min K, then μ_{k_min}·d_{p−k_min}=1. If q:=max X and k_max:=max K, then μ_{k_max}·d_{q−k_max}=1. In particular, if 1/μ_{k_min}∉N or 1/μ_{k_max}∉N, then A is not a column. ∎

Lemma T (Fourier two-translate obstruction; corrected congruences). Let E⊂S^1 be measurable. If there exists δ with E+δ = S^1\E a.e., then for every t∈Z\{0} with \hat{1_E}(t)≠0 we have e^{2πitδ}=−1, i.e. tδ ≡ 1/2 (mod 1). In particular, if \hat{1_E}(2), \hat{1_E}(4) ≠ 0, no such δ can exist because δ ≡ 1/4 (mod 1/2) and δ ≡ 1/8 (mod 1/4) are incompatible. ∎

Lemma CL (Component-length obstruction). Let E⊂S^1 be a finite union of closed intervals with disjoint interiors, with component-length multiset L(E) and gap-length multiset G(E). If E+δ = S^1\E a.e. for some δ, then L(E)=G(E) as multisets. Hence L(E)≠G(E) forbids a two-translate complement. ∎

Lemma M3 (Fourier obstruction to 3-translate tilings). If S^1 is a.e. the disjoint union of three translates E+δ_1,E+δ_2,E+δ_3, then for every t≠0 with \hat{1_E}(t)≠0 one has Σ_{j=1}^3 e^{2πitδ_j}=0. In particular, if there exists t with \hat{1_E}(t), \hat{1_E}(3t) ≠ 0, then no such 3-translate tiling exists.
Proof. Let x_j:=e^{2πitδ_j}. The partition identity gives (Σ x_j) \hat{1_E}(t)=0 for t≠0. If \hat{1_E}(t)≠0, then Σ x_j=0. If also \hat{1_E}(3t)≠0, then Σ x_j^3=0. Newton’s identity p_3 = e_1 p_2 − e_2 p_1 + 3e_3 with e_1=Σ x_j=0 and p_1=Σ x_j=0 gives Σ x_j^3 = 3x_1x_2x_3 ≠ 0, contradiction. ∎

Corollary E′ (Two-sided boundary rational-independence test). In the setting of Lemma E, μ_{k_min}·d_{p−k_min}=1 and μ_{k_max}·d_{q−k_max}=1 force μ_{k_min}/μ_{k_max}∈Q. Hence if μ_{k_min}/μ_{k_max}∉Q, A is not a column. ∎

Lemma N (Minimal component length for finite columns; no single-row columns). Let K have k_min<k_max. If A+T=X×S^1 with X finite and [p,q] is a connected component of X, then q−p+1 ≥ (k_max−k_min)+1. In particular, no single-row column exists.
Proof. Any anchor (z,θ) contributes to rows z+k, k∈K. To avoid coverage outside [p,q], one must have z∈[p−k_min, q−k_max]. Coverage of row p requires anchors with z=p−k for some k∈K; the only such z in [p−k_min, q−k_max] is z=p−k_min. Similarly, coverage of row q requires z=q−k_max. Existence of both requires p−k_min ≤ q−k_max, i.e. q−p ≥ k_max−k_min. ∎

Proposition S (Singleton rigidity via integrality exclusion for complementary two-layer tiles). Let A=({0}×J_0)∪({1}×J_1) with J_1=S^1\(J_0+α). If either 1/|J_0|∉N or 1/|J_1|∉N, then every tiling satisfies |T_n|=1. Proof as before. ∎

Proposition G (q-phase generalization of the complementary 2-layer construction). If J_0⊂S^1 satisfies J_0+1/q=J_0 and J_1:=S^1\(J_0+α) with α irrational, then for each j=0,1,…,q−1 the singleton set T_{α+j/q}:={(n,θ_0+n(α+j/q))} is a tiling with period (1,α+j/q). For j≠j′, the periods are incommensurable (Lemma R). If |J_0|∉{1/m}, then A is not a column (Lemma E).
Proof. As in Theorem A(i). Incommensurability: apply Lemma R with a=j/q, b=j′/q. The boundary conclusion follows from Lemma E at the two extremes. ∎

Proposition H (K={0,1,2} two-order mechanism). Let K=(0,1,2) and c_i=b_i−a_i>0 with c_1+c_2+c_3=1. If c_1=c_3=s∉{1/m}, there exist endpoints and an irrational slope β such that A admits two distinct singleton tilings with orders (1→2→3→1) and (1→3→2→1), slopes β and β′≡β−s (mod 1), respectively. Both are irreducible; A is not a column. If s∈Q and β∉Q, the periods are incommensurable. Remark: more generally, incommensurability holds whenever s/β ∉ Q (Lemma Q). ∎

Proposition I (Singleton rigidity for |J_0|=1/2 complementary tiles). Let A=({0}×J_0)∪({1}×J_1) with J_1=S^1\(J_0+α) and |J_0|=|J_1|=1/2. If J_0 admits no two-translate partition of S^1, then every tiling is singleton per row. ∎

Corollary J (Row-to-row increment constraint in the complementary case). In the setting of Proposition I, with T_n={θ_n}, we have θ_m−θ_{m−1}−α ∈ Stab(J_0) for all m; in particular, if Stab(J_0)=(1/q)Z a.e., then θ_m−θ_{m−1} ∈ α+(1/q)Z. ∎

Proposition K (Meandering classification of singleton complementary tilings). In the complementary construction, if |T_n|=1, then Δ_n:=θ_n−θ_{n−1}−α ∈ Stab(J_0) for all n, and conversely any bi-infinite (Δ_n)⊂Stab(J_0) produces a tiling. ∎

Lemma P (Periodicity ⇔ periodic increments). In the setting of Proposition K, T has period (r,α_*) iff Δ_{n+r}=Δ_n for all n and α_* ≡ rα + Σ_{j=1}^r Δ_j (mod 1). In particular, nonperiodic (Δ_n) produce aperiodic tilings, while r-periodic (Δ_n) produce period (r,α_*). ∎

Lemma Q (Incommensurability via ratio). If s∈(0,1) and β∉Q satisfy s/β∉Q, then β/(β−s)∉Q. ∎

Lemma R (Rational-shift incommensurability). If α∉Q and a≠b∈Q, then (α+a)/(α+b)∉Q. ∎

Lemma SS (Stabilizer symmetry). For measurable E⊂S^1 and α∈S^1, Stab(E)=Stab(S^1\E)=Stab(E+α) a.e. ∎

Remark on endpoints. Complements produce open arcs; choosing closed representatives changes sets only on null boundaries and does not affect any a.e. tiling or measure identity above.
