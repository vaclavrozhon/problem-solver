# Rigorous Proofs



The 3D unique color theorem under c3

Setup. Let U⊆[n]^3, G the complete graph on U, and for distinct u=(x1,y1,z1), v=(x2,y2,z2), let the type T be the sign pattern modulo global sign, and let ℓ(u,v) be the componentwise minimum. The color is c3(uv)=(T,ℓ(u,v)).

Lemma (slice lifting). Fix a coordinate i∈{x,y,z} and level t. If |U∩{i=t}|≥2, then there is an edge in G[U] whose c3-color is unique in G[U].
Proof. WLOG i=z. Identify the slice U_t=U∩{z=t} with a 2D point set in [n]^2. By the proven d=2 theorem on this slice, there is an edge with a 2D color unique in the slice. For such an edge, z∈E(T) and ℓ_z=t; inside the slice, two edges have the same 3D color iff they have the same 2D color (the 3D label is the 2D label plus t). No edge off the slice has z∈E(T) or can match ℓ_z=t. Hence the color is unique in G[U].

Lemma (3D multiplicity formula). Fix a type T and a representative sign vector s∈{−1,0,+1}^3\{0} for T (changing s to −s only swaps roles below). For ℓ∈[n]^3 define
- A_+(T,ℓ):= #{ v∈U : for all i∈E(T), v_i=ℓ_i; for i with s_i=+1, v_i>ℓ_i; for i with s_i=−1, v_i=ℓ_i }.
- A_−(T,ℓ):= #{ u∈U : for all i∈E(T), u_i=ℓ_i; for i with s_i=+1, u_i=ℓ_i; for i with s_i=−1, u_i>ℓ_i }.
Then the number of edges e with c3(e)=(T,ℓ) equals A_+(T,ℓ)·A_−(T,ℓ).
Proof. Orient each such edge u→v so its coordinatewise signs equal s on J(T); then for i with s_i=+, ℓ_i=u_i and v_i>ℓ_i; for i with s_i=−, ℓ_i=v_i and u_i>ℓ_i; and for i∈E(T), both endpoints equal ℓ_i. This gives a bijection between oriented edges and pairs (u,v)∈A_−×A_+, yielding the product. Replacing s by −s swaps A_+,A_− but preserves the product.

Corollaries.
- [+++]-type: For α∈[n]^3, the multiplicity of ([+++],α) equals 1_{α∈U}·|NE_3(α)|, where NE_3(α)={q∈U: q_i>α_i for i=x,y,z}.
- One-odd-coordinate types (e.g., [++−]): letting ℓ=α and taking s=[+,+,−], the multiplicity equals r·s with r=|{(α_x,α_y,z)∈U: z>α_z}| and s=|{(x,y,α_z)∈U: x>α_x,y>α_y}|.

Lemma (injective case). Suppose every coordinate slice contains at most one point of U (equivalently, all x-, y-, z-values are pairwise distinct across U) and |U|≥2. Then G[U] has a uniquely colored edge under c3.
Proof. If there is a mixed-sign pair, pick one with type having exactly one “odd” coordinate, say [++−]. In the corollary above, r≤1 (at most one point with x=α_x and y=α_y) and s≤1 (at most one point with z=α_z). Since the edge exists, r=s=1 and the multiplicity is 1. If no mixed-sign pair exists, then every pair is [+++] or [---], hence U is a chain in the product order; injectivity forces strict increase on all coordinates along the chain. Let w be the second-largest element; then |NE_3(w)|=1, so the ([+++],ℓ=w) color has multiplicity 1.

Theorem (3D unique color). For every U⊆[n]^3 with |U|≥2, there exists an edge in G[U] whose color under c3 appears exactly once in G[U].
Proof. If some coordinate slice contains ≥2 points, apply the slice lifting lemma. Otherwise, the injective case lemma applies. In both cases a unique color exists.

Remark. The same proof extends by induction to dimension d: either reduce on a coordinate hyperplane with ≥2 points (using the d−1 theorem), or in the injective case use the general A_+·A_- multiplicity with any mixed-sign type; if none exist, U is a chain and a [+,…, +]-type at the penultimate element is unique.

Statement of the 3D result under c_3.

Setup. Let G be the complete graph on V=[n]^3. For distinct u=(x_1,y_1,z_1), v=(x_2,y_2,z_2), let \sigma(u,v)=(sgn(x_1-x_2), sgn(y_1-y_2), sgn(z_1-z_2)) and let the type be T=[\sigma(u,v)] modulo global sign. Let \ell(u,v) be the componentwise minimum. The color is c_3(uv)=(T, \ell(u,v)).

We use the proven 2D theorem: for the analogous 2D coloring c_2 on [n]^2 (type modulo global sign together with the componentwise minimum that records equalities), every nontrivial induced subgraph contains an edge whose c_2-color is unique within that 2D induced subgraph.

Lemma (slice lifting). Fix t\in[n]. Let U_t=U\cap\{(x,y,z): z=t\}. If an edge e in G[U_t] has a unique 2D color under c_2 (on its (x,y)-projection), then e has a unique color in G[U] under c_3.
Proof. Any edge within z=t has T_z=0 and \ell_z=t. Conversely, if an edge in G[U] has T_z=0 and \ell_z=t, its endpoints both lie in z=t (since their z-coordinates are equal to t). For edges inside z=t, c_3 coincides with c_2 on (x,y) together with the recorded z-value t. Thus uniqueness in the slice implies global uniqueness.

Lemma (top two z-levels). Suppose every z-slice U_t has size at most 1. Order U by increasing z as v_1,\dots,v_m with z_1<\cdots<z_m (m\ge 2). Then the edge e=v_{m-1}v_m has a unique color under c_3.
Proof. For any edge f, \ell_z(f)=\min\{z(\text{endpoints of }f)\}. The only way to have \ell_z(f)=z_{m-1} is for one endpoint to have z=z_{m-1} and the other to have z>z_{m-1}. Under the assumption that each z-slice contains at most one point, there is exactly one vertex at z=z_{m-1}, namely v_{m-1}, and exactly one vertex above z_{m-1}, namely v_m. Hence the only edge with \ell_z=z_{m-1} is v_{m-1}v_m. Since c_3 records \ell, in particular \ell_z, no other edge can share c_3(e).

Theorem (d=3 unique color). For every U\subseteq[n]^3 with |U|\ge 2, the induced graph G[U] contains an edge whose c_3-color appears exactly once in G[U].
Proof. If some z-slice U_t has size at least 2, apply the 2D theorem to the induced 2D graph on U_t to obtain an edge with a unique c_2-color; by the slice-lifting lemma, this edge has a unique c_3-color in G[U]. Otherwise, every z-slice has size at most 1; by the top-two z-levels lemma, the edge between the two highest z-level vertices has a unique c_3-color. In either case, a uniquely colored edge exists.

Remark. The same strategy extends to higher dimensions by induction on the last coordinate: either a (d−1)-dimensional slice contains at least two points (reduce to d−1), or the edge between the top two levels in the last coordinate has a uniquely determined last-coordinate entry in its lower corner, making its color unique.
