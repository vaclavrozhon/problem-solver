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


Proof of the 3D theorem for c_3

Setup. Let G be the complete graph on V=[n]^3. For an edge e=uv with u≠v, its color is c_3(e)=(T(e),ℓ(u,v)), where T(e) is the sign pattern in {−1,0,+1}^3 modulo global sign, and ℓ(u,v) is the componentwise minimum (recording equal coordinates).

Lemma (slice lifting). Fix t∈[n] and let U_t=U∩{(x,y,z): z=t}. If |U_t|≥2 and an in-slice edge e has a unique color under the 2D coloring on (x,y) (type modulo global sign with componentwise minima, including equalities), then e has a unique color under c_3 in G[U].
Proof. For e in z=t, T_z(e)=0 and ℓ_z(e)=t. If f is any edge with c_3(f)=c_3(e), then T_z(f)=0 and ℓ_z(f)=t, so both endpoints of f lie in z=t. Within the slice, c_3 reduces to the 2D color on (x,y) together with the recorded z-value t; hence the 2D colors of e and f coincide, forcing f=e by in-slice uniqueness. Thus c_3(e) is unique in G[U].

Lemma (top two z-levels). Suppose every z-slice contains at most one point of U and |U|≥2. Order the distinct z-values realized by U as z_1<⋯<z_m and let p,q∈U satisfy z(p)=z_{m−1}, z(q)=z_m. Then the edge pq has a unique color under c_3 in G[U].
Proof. For any edge f, ℓ_z(f)=min{z of its endpoints}. Thus ℓ_z(pq)=z_{m−1}. If g is an edge with ℓ_z(g)=z_{m−1}, one endpoint must be the unique vertex at z_{m−1} (namely p) and the other must have z>z_{m−1}. Because z_{m−1} is the second-highest realized z-level, the only vertex with z>z_{m−1} is q. Hence g=pq. Therefore no other edge shares ℓ(pq); in particular, no edge shares c_3(pq).

Theorem (d=3 unique color). For every U⊆[n]^3 with |U|≥2, the induced graph G[U] contains an edge whose color under c_3 appears exactly once in G[U].
Proof. If some z-slice U_t has |U_t|≥2, apply the d=2 theorem on U_t to obtain an in-slice edge with a unique 2D color; by the slice-lifting lemma it is unique in G[U] under c_3. Otherwise every z-slice has size ≤1; the top two z-levels lemma gives an edge of unique color. This covers all cases.

Remark. The same argument extends to higher dimensions by induction on the last coordinate: either a (d−1)-dimensional slice has ≥2 points (reduce and lift), or each last-coordinate slice has ≤1 point and the edge between the top two levels has a uniquely determined last-coordinate entry in ℓ, making its color unique.


Three-dimensional result under c_3.

Setup. Let G be the complete graph on V=[n]^3. For distinct u=(x_1,y_1,z_1), v=(x_2,y_2,z_2), let the sign vector be \sigma(u,v)=(sgn(x_1-x_2), sgn(y_1-y_2), sgn(z_1-z_2)). The type T=[\sigma(u,v)] is defined modulo global sign (zeros remain zeros), and the lower corner is \ell(u,v)=(min{x_1,x_2}, min{y_1,y_2}, min{z_1,z_2}). Define the color c_3(uv)=(T,\ell(u,v)).

Lemma (Slice lifting). Fix t\in[n] and U_t=U\cap\{(x,y,z): z=t\}. If G[U_t] contains an edge whose 2D color (under the d=2 coloring on (x,y)) is unique in G[U_t], then this edge has a unique color in G[U] under c_3.
Proof. Any edge within z=t has z\in E(T) and \ell_z=t. If an edge e outside the slice had c_3(e) equal to that of the in-slice edge, then its type would also have z\in E(T), impossible. Among in-slice edges, equality of c_3 colors forces equality of the induced 2D type and 2D lower corner, contradicting 2D uniqueness. Hence the 3D color is unique.

Lemma (Top two z-levels). Suppose every z-slice U_t has size at most 1 and |U|\ge 2. Let the realized z-values be z_1<\cdots<z_m and pick p,q with z(p)=z_{m-1}, z(q)=z_m. Then the edge pq has a unique color under c_3.
Proof. For any edge f=uv, \ell_z(f)=min\{z(u),z(v)\}. If c_3(f)=c_3(pq), then \ell_z(f)=\ell_z(pq)=z_{m-1}. Thus one endpoint has z=z_{m-1} and the other has z>z_{m-1}. By the at-most-one-per-slice hypothesis, p is the unique vertex with z=z_{m-1}, and q is the unique vertex with z>z_{m-1}. Hence f=pq.

Theorem (d=3 unique color). For every U\subseteq[n]^3 with |U|\ge 2, G[U] contains an edge whose color under c_3 appears exactly once in G[U].
Proof. If some z-slice U_t has size at least 2, apply the d=2 theorem on G[U_t] to obtain an in-slice edge with a unique 2D color; by the slice-lifting lemma, its color is unique in G[U]. Otherwise, each z-slice has size at most 1; by the top two z-levels lemma, the edge between the vertices at z_{m-1} and z_m has a unique c_3 color. This is symmetric in coordinates, so the choice of z is without loss of generality. \qed

## Uniquely colored edge in 3D under c_3

Setup. Let G be the complete graph on V=[n]^3. For u\neq v, define the sign vector \sigma(u,v)\in\{-1,0,+1\}^3\setminus\{(0,0,0)\} componentwise, the type T(e)=[\sigma(u,v)] modulo global sign, and the componentwise minimum \ell(u,v). The color is c_3(uv)=(T(e),\ell(u,v)).

We will use the proven 2D theorem on slices: in [n]^2 with the 2D coloring that records the type (modulo global sign) and the appropriate minima (including which coordinates are equal), every induced subgraph on a nonempty vertex set of size at least 2 contains an edge whose color appears exactly once.

Lemma (slice lifting). Fix t\in[n]. Let U_t=U\cap\{(x,y,z): z=t\}. If |U_t|\ge 2 and an edge e within G[U_t] has a unique 2D color (under the 2D map), then e has a unique color in G[U] under c_3.

Proof. Any edge within z=t has T_z=0 and c_3 records \ell_z=t. If another edge f in G[U] satisfied c_3(f)=c_3(e), then T_z(f)=0 and \ell_z(f)=t, so both endpoints of f lie in z=t. On that slice, equality of 3D labels implies equality of the 2D labels. Since e is unique in G[U_t] under the 2D coloring, no such f\ne e exists. Hence c_3(e) is unique in G[U].\quad\square

Lemma (top two z-levels). Suppose each z-slice U\cap\{z=t\} contains at most one point and |U|\ge 2. Let the realized z-levels be z_1<\cdots<z_m (m\ge 2). Let p,q\in U satisfy z(p)=z_{m-1} and z(q)=z_m. Then c_3(pq) is unique in G[U].

Proof. Let e=pq. If an edge f=uv had c_3(f)=c_3(e), then in particular \ell_z(f)=\ell_z(e)=z_{m-1}. Thus one endpoint of f has z=z_{m-1} and the other has z>z_{m-1}. By the at-most-one-per-slice assumption, the unique vertex with z=z_{m-1} is p, and the unique vertex with z>z_{m-1} is q (since z_m is the only realized level above z_{m-1}, with at most one point). Hence f=e. Therefore c_3(e) is unique.\quad\square

Theorem (d=3). For every U\subseteq[n]^3 with |U|\ge 2, the induced subgraph G[U] contains an edge whose color under c_3 appears exactly once in G[U].

Proof. If some z-slice U_t has size at least 2, apply the 2D theorem on G[U_t] and lift the resulting edge by the slice-lifting lemma. Otherwise, every z-slice has size at most 1; by the top-two z-levels lemma, the edge between the unique vertices at the two highest realized z-levels has a unique color under c_3.\quad\square

Remark (toward higher dimensions). The same dichotomy yields an induction for dimension d: either a (d−1)-dimensional slice along the last coordinate contains at least two points (apply the (d−1) theorem and lift), or each last-coordinate slice has at most one point and the edge between the top two levels has a unique last-coordinate entry in \ell, ensuring uniqueness of c_d.\n

## Dimension-d generalization under c_d

Setup (general d). For u\neq v\in[n]^d, let \sigma(u,v)\in\{-1,0,+1\}^d\setminus\{0\} be the componentwise sign vector, and define the type T(e)=[\sigma(u,v)] modulo global sign (zeros remain zero). Let J(T)=\{i: T_i\neq 0\} and E(T)=[d]\setminus J(T). Let \ell(u,v) be the componentwise minimum. Define the color
\[
 c_d(uv)=(T(e),\,\ell(u,v)).
\]

Lemma (slice lifting, general d). Fix i\in[d] and t\in[n]. Let U_{i=t}=U\cap\{x\in[n]^d: x_i=t\}. If |U_{i=t}|\ge 2 and an edge e within G[U_{i=t}] has a unique (d\!-
1)–dimensional color on the remaining coordinates, then e has a unique color in G[U] under c_d.

Proof. Any in–slice edge has i\in E(T) and \ell_i=t. If f in G[U] satisfied c_d(f)=c_d(e), then T(f)=T(e) with i\in E(T(f)) and \ell_i(f)=t, so f also lies in the slice U_{i=t}. On that slice, equality of c_d–labels implies equality of the induced (d\!-
1)–dimensional labels, contradicting uniqueness. Thus c_d(e) is unique. \square

Lemma (top two levels, general d). Fix i\in[d]. Suppose each slice U_{i=t} has size at most 1 and |U|\ge 2. Let the realized i–coordinates be t_1<\cdots<t_m (m\ge 2). Let p,q\in U satisfy p_i=t_{m-1} and q_i=t_m. Then c_d(pq) is unique in G[U].

Proof. For e=pq we have \ell_i(e)=t_{m-1}. If f=uv has c_d(f)=c_d(e), then \ell_i(f)=t_{m-1}, so one endpoint has i–coordinate t_{m-1} (hence equals p) and the other has i–coordinate >t_{m-1}. Since t_m is the only realized value above t_{m-1} and its slice contains at most one point, that endpoint must be q. Hence f=e, so the color is unique. \square

Theorem (all d\ge 2). For every U\subseteq[n]^d with |U|\ge 2, the induced subgraph G[U] contains an edge whose color under c_d appears exactly once in G[U].

Proof. Induct on d. The base d=2 holds by the provided theorem. For d\ge 3, fix i=d. If some slice U_{d=t} has size at least 2, apply the (d\!-
1) theorem within that slice and lift by the slice–lifting lemma. Otherwise, every slice has size at most 1; apply the top–two–levels lemma to obtain a uniquely colored edge. \square
