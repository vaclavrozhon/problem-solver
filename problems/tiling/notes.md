Set-up and notation
- Work in G = Z × S^1 (S^1 = R/Z). A tile A is a finite union of layers of the form {k_i}×[a_i,b_i] with 0 < b_i−a_i < 1, i=1,…,ℓ. A tiling T ⊂ Z×S^1 is a set of translations such that the (almost everywhere) disjoint union of A+(n,θ) over (n,θ)∈T equals Z×S^1. The fiber at n is T_n := {θ ∈ S^1 : (n,θ) ∈ T}. A period (k,α) means T+(k,α)=T.

Basic facts
- Fiber finiteness. In any tiling, every T_n is finite, and for each m we have ∑_i |T_{m−k_i}|·(b_i−a_i) = 1.
- Period transport. If (k,α) is a period then T_{n+k} = T_n + α for all n.

Singleton-per-row tilings
- Definition: |T_n|=1 for all n. Write T_n={θ_n}. Then column m is the (a.e.) disjoint union of the ℓ intervals [a_i+θ_{m−k_i}, b_i+θ_{m−k_i}], i=1,…,ℓ.
- Fixed cyclic order formulation. If, at each m, the ℓ intervals appear in the same cyclic order σ and meet end-to-end, then for some row phase φ_m one has θ_{m−k_i} = φ_m + c_i − a_i, where c_i are order-dependent constants with c_{σ(i)} ≡ c_i + (b_i−a_i) (mod 1). Consequently θ_{m−k_i} − θ_{m−k_j} is independent of m. If 1∈{k_i}, then θ_n−θ_{n−1} is constant, i.e. T has period (1,β) with β := θ_n−θ_{n−1}.
- Linear congruence system (Prover 03). Under a fixed order σ,
  (k_i − k_{σ(i)}) β ≡ a_i + (b_i−a_i) − a_{σ(i)}  (mod 1),  i=1,…,ℓ.
  For ℓ=3, K={0,1,2}, and orders σ=(1→2→3→1), σ'=(1→3→2→1), the two orders are simultaneously compatible for the same endpoints a_i iff c_1=c_3, and then the slopes satisfy β' ≡ β − c_1 (mod 1). This yields two distinct singleton tilings for the same tile when c_1=c_3.
- Irreducibility (singleton, gcd=1). Let H:=⟨K−K⟩≤Z. If H≠Z then any tiling splits along residue classes mod H; hence irreducibility forces H=Z. Moreover, if |T_n|=1 and H=Z then any partition T=T_1⊔T_2 induces Z=X_1⊔X_2 with X_1 closed under subtraction by each k_i and hence under ±(K−K); since H=Z, X_1 is either ∅ or Z. Thus singleton tilings with gcd(K−K)=1 are irreducible.

Two complementary-layer construction (explicit)
- Choose U⊂S^1 a finite union of disjoint intervals with |U|=1/4 and U∩(U+1/2)=∅ (e.g., U=[0,0.2)∪[0.3,0.35)). Let J_0:=U∪(U+1/2). Then |J_0|=1/2 and J_0+1/2=J_0. Pick an irrational α∈(0,1/2), and set J_1:=S^1\(J_0+α). Define A:=({0}×J_0)∪({1}×J_1).
- Two tilings. For any θ_0, define T_α={ (n, θ_0+nα): n∈Z }. On row n the contributions are (J_0+θ_n) and (J_1+θ_{n−1}) with θ_n=θ_0+nα, which are complementary because J_1=S^1\(J_0+α). Thus A+T_α=Z×S^1 a.e., and T_α has period (1,α). Using J_0+1/2=J_0 the same argument works for α' := α+1/2, giving a tiling T_{α'} with period (1,α'). Both are singleton tilings, hence irreducible by the lemma above (K={0,1} has gcd 1).
- Incommensurability. If α∉Q, then α/(α+1/2)∉Q: from α/(α+1/2)=p/q one deduces α=p/(2(q−p))∈Q, a contradiction.
- Non-column property (finite-column tilings impossible). Say A+T=X×S^1 with X finite. Let d_n:=|T_n|. On row n the union is a.e. disjoint, so |J_0| d_n + |J_1| d_{n−1} = 1_{n∈X}. With |J_0|=|J_1|=1/2 this yields d_n + d_{n−1} = 2·1_{n∈X}. Because X is finite, d_n=0 for all n sufficiently large/small. At the left boundary p of any connected component of X, we get d_{p−1}=0 and hence d_p=2; so row p is tiled by two disjoint translates of J_0 alone. Therefore S^1 is a.e. the disjoint union of two translates of J_0, which forces J_0+δ = S^1\J_0 for some δ. Our choice of U ensures this is impossible (the multiset of lengths of connected components of J_0 differs from that of its complement). Hence no such finite X exists: A is not a column.

Consequences
- This explicit A is a non-column tile that admits two irreducible periodic tilings with incommensurable vertical periods (1,α) and (1,α+1/2).
- Independently, for ℓ=3 and K={0,1,2} with c_1=c_3, the congruence mechanism produces two distinct singleton tilings of the same tile with slopes β and β'≡β−c_1. Picking β irrational makes β/(β') irrational unless a rational relation holds; such relations are at most countable in the parameter.

Next directions
- q-periodic generalization: If J_0 has 1/q-periodicity, the same complementary construction yields q tilings with slopes α+j/q; non-column persists under the same “no translational complement” obstruction.
- Non-column for K={0,1,2} singleton tiles: adapt the boundary-recurrence method with |J_•| = c_• to force a boundary row covered by a single layer, then forbid that layer from tiling S^1 by finitely many translates via a connected-component-length invariant.
Additional tools and extensions

1) Boundary obstruction to finite-column tilings (general form). For a tile A, define for each height k the aggregated layer J_k⊂S^1 as the union of all arcs at that height, and μ_k:=|J_k|. In any finite-column tiling A+T=X×S^1 with X finite and d_n:=|T_n|, the per-row measure identity is
  ∑_k μ_k · d_{m−k} = 1_{m∈X}, for all m∈Z.
If p:=min X and k_min:=min K, then only anchors with z=p−k_min can appear (any other anchor would create coverage outside X below p). Therefore d_{p−k_min} μ_{k_min}=1, so 1/μ_{k_min}∈N. Symmetrically, with q:=max X and k_max:=max K we get d_{q−k_max} μ_{k_max}=1, hence 1/μ_{k_max}∈N.

Consequences:
- K={0,1}: μ_{0}=|J_0|, μ_{1}=|J_1|. If |J_0|∉{1/m} then A is not a column. (This yields a very quick non-column test for two-layer tiles, including the complementary construction.)
- K={0,1,2}: If c_i denotes the total measure at height i (e.g., one interval per layer), then necessarily 1/c_1 and 1/c_3 are integers in any finite-column tiling. In particular, if c_1 or c_3 is not a reciprocal of an integer, the tile is not a column.

2) q-phase generalization of the complementary 2-layer construction. If J_0⊂S^1 is 1/q-periodic (J_0+1/q=J_0) and J_1:=S^1\(J_0+α) with α irrational, then for each j=0,1,…,q−1 the singleton set T_{α+j/q}:={(n,θ_0+n(α+j/q))} is a tiling with period (1,α+j/q). For j≠j′, the ratio (α+j/q)/(α+j′/q) cannot be rational (else α would be rational). If additionally |J_0|∉{1/m}, the boundary obstruction implies A is not a column. Irreducibility follows from the singleton-gcd criterion (K={0,1}).

3) Two-order singleton family for K={0,1,2} completed. When c_1=c_3=s, Lemma C shows the two cyclic orders (1→2→3→1) and (1→3→2→1) are simultaneously compatible and the slopes satisfy β′≡β−s (mod 1). If s∉{1/m}, the boundary obstruction rules out columns. If s is rational and β is irrational, then β/(β′) cannot be rational (else β would be rational), so the two periods are incommensurable.

4) Fourier alternative to translational complement. If E⊂S^1 satisfies E+δ = S^1\E a.e., then for all t≠0 with \hat{1_E}(t)≠0 we have e^{2π i t δ}=−1. In particular, if two distinct t’s have nonzero coefficients and cannot share a δ with e^{2π i t δ}=−1 simultaneously, such a δ cannot exist. This certifies non-columnity in cases like |J_0|=1/m when the boundary obstruction alone does not suffice.

Remark on endpoints. Complements produce open arcs; choosing closed representatives changes sets only on measure-zero boundaries and does not affect any of our tiling or measure identities.
Updates, corrections, and new tools

1) On the “complementary two-layer” structure A=({0}×J_0)∪({1}×J_1) with J_1=S^1\(J_0+α)
- Intersection identity. For any tiling A+T and row m, writing U_m:=⋃_{θ∈T_m}(J_0+θ) and V_m:=⋃_{θ∈T_{m−1}}(J_1+θ), we have U_m⊔V_m=S^1 a.e. and
  V_m = ⋃_{θ∈T_{m−1}} (S^1\(J_0+α+θ)) = S^1 \ ⋂_{θ∈T_{m−1}} (J_0+α+θ).
  Hence U_m = ⋂_{θ∈T_{m−1}} (J_0+α+θ) a.e. In particular, if d_{m−1}:=|T_{m−1}|≥1 then |U_m|≤|J_0|, which implies d_m≤1 (since U_m is a disjoint union of d_m translates of J_0). A symmetric statement holds one step forward: if d_m≥1 then d_{m+1}≤1.
- Degeneracy (0/2) is not excluded without extra hypotheses. For |J_0|=|J_1|=1/2, the per-row identity is d_m+d_{m−1}=2. The pattern (…,2,0,2,0,…) is compatible with this identity; ruling it out requires forbidding two-translate tilings of J_0 (and hence of J_1). Our Theorem A already enforces this (via component-length mismatch). Under this “no two-translate” hypothesis we can prove d_m=1 for all m (see new Proposition I in output.md).

2) Irreducibility and gcd(K−K)
- Necessity. If H:=⟨K−K⟩≠Z (say gcd g>1), any tiling splits along residue classes modulo g: for T^{(r)}:={ (z,θ)∈T : z≡r (mod g) } one has A+T^{(r)} = X_r×S^1 a.e. where X_r:=gZ+r, and the union over r is disjoint. Thus H=Z is necessary for irreducibility, not only in the singleton regime.
- Sufficiency in the singleton case. We include the full closure argument: if T=T_1⊔T_2 yields A+T_i=X_i×S^1, then from m∈X_1 all m−k_i∈X_1, hence X_1 is a union of cosets of H. If H=Z, X_1 is ∅ or Z.

3) Singleton with fixed cyclic order: equivalence (Lemma C)
- We now record the sufficiency half: if β and the a_i satisfy (k_i−k_{σ(i)})β≡a_i+c_i−a_{σ(i)} (mod 1), then θ_n:=θ_0+nβ produces, at each row m, ℓ arcs that meet end-to-end in the σ-order and (since ∑c_i=1) a.e. partition S^1.

4) Incommensurability tools
- General rational-shift test. If α∉Q and a≠b∈Q, then (α+a)/(α+b)∉Q. In particular, if α∉Q and r∈Q\{0}, then α/(α+r)∉Q. This packages the algebra used repeatedly in Theorem A and Prop. G.
- Caution (Prop. H). The statement “β/(β−s)∉Q for all s∈(0,1)” is false without assuming s∈Q; e.g., β=√2 and s=β/2 give β/(β−s)=2∈Q. We retain the hypothesis s rational in the incommensurability clause of Prop. H.

5) Fourier two-copy obstruction (record)
- If E+δ=S^1\E a.e., then for every t≠0 with \hat{1_E}(t)≠0 we have e^{2πitδ}=−1. This is useful to forbid two-translate tilings when |E|=1/2 (or more generally |E|=1/m), and underpins the “no two-translate” hypothesis.

6) Next targets (rigidity and classification)
- Under J_0 with only 1/q-translational invariance, prove that any complementary two-layer tiling must have constant increment θ_m−θ_{m−1} modulo 1/q; hence classify all tilings as the q helical ones from Prop. G. Strategy: use the intersection identity row-to-row and endpoint propagation to show that varying the 1/q offset produces overlaps.
- Systematically extend the multi-order mechanism beyond K={0,1,2}, again leveraging Lemma C and boundary obstruction Lemma E.
Additions and clarifications (Round 0004)

1) Clarification for Lemma C (singleton congruences)
- The necessity part implicitly uses that the increment β:=θ_n−θ_{n−1} is constant in n. This is guaranteed when 1∈K (as in K={0,1} and K={0,1,2} used here), or more generally when the fixed order across rows implies a helical structure. All our applications satisfy 1∈K.

2) Complementary two-layer: singleton tools
- Integrality-based singleton rigidity. For A=({0}×J_0)∪({1}×J_1) with J_1=S^1\(J_0+α), the per-row identity is |J_0| d_m + (1−|J_0|) d_{m−1}=1 and the intersection identity implies: if d_{m−1}≥1 then d_m≤1, and symmetrically. If either 1/|J_0|∉N or 1/(1−|J_0|)∉N then no d_m can be 0 (else we would force one of these reciprocals to be an integer), and the inequality forces d_m≤1. Thus d_m=1 for all m. This recovers singleton-per-row without the special |J_0|=1/2 case.
- Anti-m-tiling singleton rigidity (stronger hypothesis). If neither J_0 nor J_1 admits any m-fold partition of S^1 by disjoint translates for any m≥2, then d_m=1 for all m: if d_{m−1}≥2, then |U_m|<|J_0| so d_m=0, which forces an m-tile by J_1; contradiction. Symmetrically, d_{m−1}=0 would force an m-tile by J_0. Hence all d’s are 1.
- Meandering classification (singleton regime). Assuming d_m=1, the complementary structure forces J_0+θ_m = J_0+(α+θ_{m−1}) a.e., i.e. θ_m−θ_{m−1}−α ∈ Stab(J_0). Conversely, any sequence of increments in α+Stab(J_0) yields a valid singleton tiling. This exhibits many (often aperiodic) singleton tilings; helical ones are obtained by taking a constant offset.

3) Fourier obstructions
- Two-translate obstruction. If E+δ=S^1\E a.e., then for any t≠0 with \hat{1_E}(t)≠0 we have e^{2π i t δ}=−1. In particular, nonvanishing at two even modes (e.g., t=2 and t=4) forbids such δ since no δ can satisfy both e^{4π i δ}=−1 and e^{8π i δ}=−1 simultaneously.
- Worked class: if J_0=U∪(U+1/2) with U=[0,c) and c∉Q, then \hat{1_{J_0}}(2k)=2\hat{1_U}(2k) with \hat{1_U}(2k)=(e^{4π i k c}−1)/(4π i k)≠0 for all k≥1, so no two-translate complement exists. This gives an easy certification for many explicit choices of U (including variants of Theorem A when |J_0|≠1/2).
- Sketch for m=3 (to be formalized): If \hat{1_E}(t) and \hat{1_E}(2t) are nonzero and S^1 is partitioned a.e. by three translates of E, then the sums of first and second powers of e^{2π i t δ_j} vanish simultaneously, which is incompatible unless the three are cube roots of unity up to rotation; that in turn contradicts the second equation. This yields a quick “no 3-translate tiling” test.

4) Incommensurability algebra
- If s/β∉Q then β/(β−s)∉Q. Thus, in the K={0,1,2} two-order family, one can ensure incommensurability by choosing β so that s/β is irrational (no need to assume s rational).

5) Symmetry of two-translate complements
- E+δ=S^1\E a.e. iff (S^1\E)+δ=E a.e. Hence “no two-translate tiling” is symmetric under complement and translation. This justifies the symmetric step in the |J_0|=1/2 singleton rigidity proof.

6) Concrete directions
- Prove that when Stab(J_0)=(1/q)Z with no finer invariance, the offsets θ_m−θ_{m−1}−α (mod 1/q) must be constant across m; deduce that only the q helical tilings occur in that regime.
- Formalize the m=3 Fourier obstruction and apply it to explicit J_0 at |J_0|=1/3 to enforce the hypotheses of the anti-m-tiling singleton rigidity.
- For K={0,1,2,3}, enumerate fixed orders, write the congruence systems, and search for simultaneous compatibilities; combine with boundary integrality to certify non-columnity and extract ≥3 incommensurable periods.
New tools and corrections (Round 0005)

1) Component-length obstruction to complementary translation
- Lemma. Let E ⊂ S^1 be a finite union of closed intervals with disjoint interiors. Write L(E) for the multiset of component lengths of E, and G(E) for the multiset of cyclic gap lengths between consecutive endpoints of E. If E+δ = S^1\E a.e. for some δ, then L(E) = G(E) as multisets. Thus L(E) ≠ G(E) forbids such a δ.
- Use in Theorem A(iii). For J_0=U ∪ (U+1/2) with a suitable U (e.g., U=[0,0.2) ∪ [0.3,0.35)), we have L(J_0) ≠ G(J_0), hence no two-translate complement exists. This closes the non-column step without Fourier.

2) Fourier obstruction for 3 translates (fix of the earlier sketch)
- Lemma M3. If S^1 is a.e. the disjoint union of three translates E+δ_1, E+δ_2, E+δ_3, then for every t≠0 with \hat{1_E}(t)≠0 we have Σ_{j=1}^3 e^{2πitδ_j}=0. In particular, if \hat{1_E}(t) and \hat{1_E}(3t) are both nonzero, no such 3-translate tiling exists.
- Proof idea. Let x_j:=e^{2πitδ_j}. From the partition, for t≠0 we have (Σ x_j) \hat{1_E}(t)=0 ⇒ Σ x_j=0. If also \hat{1_E}(3t)≠0 then Σ x_j^3=0. Newton’s identity for three variables gives Σ x_j^3 = 3x_1x_2x_3, impossible since |x_j|=1.

3) Periodicity of singleton complementary tilings ⇔ periodicity of increments
- Lemma P. In the complementary construction with singleton rows, write Δ_n:=θ_n−θ_{n−1}−α ∈ Stab(J_0) (Proposition K). Then T has period (r, α_*) iff Δ_{n+r}=Δ_n for all n and α_* ≡ rα + Σ_{j=1}^r Δ_j (mod 1). In particular, aperiodic (Δ_n) yield aperiodic tilings; r-periodic (Δ_n) yield period (r, α_*).

4) Two-sided boundary obstruction by rational independence (quick non-column test)
- Corollary (to Lemma E). With k_min:=min K, k_max:=max K, if A+T=X×S^1 with X finite, then μ_{k_min} d_{p−k_min}=1 and μ_{k_max} d_{q−k_max}=1 at the left/right boundaries. Therefore μ_{k_min}/μ_{k_max} ∈ Q. If this ratio is irrational, A cannot be a column.

5) Minimal component length for finite columns; no single-row columns when k_min<k_max
- Lemma. If K spans at least two heights (k_min<k_max) and A+T=X×S^1 is a finite-column tiling with a connected component [p,q]⊂X, then q−p+1 ≥ (k_max−k_min)+1. In particular, no single-row column exists. Equivalently, anchors contributing to a boundary row necessarily force coverage extending by ≥k_max−k_min rows.

6) Stabilizer symmetry
- Lemma. Stab(E)=Stab(S^1\E)=Stab(E+α) a.e. (trivial from indicator identities). This underlies the symmetric steps in K2 and the complementary construction.

7) Corrections and housekeeping
- Lemma T (Fourier two-translate) contradiction should be stated as congruences: e^{2πitδ}=−1 ⇒ tδ ≡ 1/2 (mod 1). For t=2, δ ≡ 1/4 (mod 1/2); for t=4, δ ≡ 1/8 (mod 1/4), incompatible.
- Remove duplicate placeholder for Lemma E in output.md; keep only the explicit statement with proof.
- Proposition H remark. Incommensurability of β and β′=β−s holds whenever s/β ∉ Q (Lemma Q), not only for s rational; choose β accordingly.

8) Program update (targets)
- Replace the (incorrect) global “constant increment” rigidity target by: classify periodic solutions via periodic increments (Lemma P) and exhibit aperiodic meanders when Stab(J_0)≠{0}.
- Strengthen Fourier obstructions for m≥4 using Newton’s identities with multiple nonvanishing modes of E. Seek explicit E with prescribed nonvanishing spectrum (e.g., unions of short arcs) to enforce anti-m-tiling hypotheses used in K2.
