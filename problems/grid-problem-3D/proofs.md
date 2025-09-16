# Rigorous Proofs



Results for the 3D coloring c3

Setup. Let U⊆[n]^3. For an edge type T (sign pattern up to global sign) let J(T) be the set of nonzero coordinates and E(T) the zeros. Fix an orientation s(T) so that P(T)⊆J(T) are the indices with +, and N(T)⊆J(T) the indices with −. For i∈J(T), the color records m_i=min{u_i,v_i}; the coordinates in E(T) are unspecified but equal across the endpoints.

Lemma (Master multiplicity for c3). Fix T and m∈[n]^{J(T)}. For each t∈[n]^{E(T)} define
A_t={ u∈U: u_P=m_P, u_E=t, and u_M>m_M },
B_t={ v∈U: v_M=m_M, v_E=t, and v_P>m_P }.
Then the number of edges in G[U] with color (T,m) equals Σ_{t∈[n]^{E(T)}} |A_t|·|B_t|.
Proof. For any undirected edge {u,v} of color (T,m), orient it so that for i∈P(T) we have u_i<v_i and for i∈N(T) we have u_i>v_i; for i∈E(T) we have u_i=v_i=t_i. By the color definition, for i∈P(T) the minimum equals u_i=m_i, and for i∈N(T) the minimum equals v_i=m_i. Thus u∈A_t and v∈B_t for the unique t=u_E=v_E. Conversely any ordered pair (u,v) with u∈A_t and v∈B_t yields an undirected edge of color (T,m). Because the orientation is fixed by s(T), no undirected edge is counted twice.∎

Corollary 1 (All-plus). For J(T)={x,y,z} with P(T)={x,y,z} and N(T)=∅, writing m=(α,β,γ) and p=(α,β,γ), the multiplicity equals 1_{p∈U}·|NE3(p)|, where NE3(p)={q∈U: q_x>α, q_y>β, q_z>γ}.
Proof. Here E(T)=∅ and A_t reduces to {p} if p∈U and empty otherwise. The set B_t is NE3(p).

Corollary 2 (Two-changing, one equal). For J(T)={x,z}, E(T)={y}, with P(T)={x} and N(T)={z}, and parameters (α,γ), the multiplicity equals Σ_{β=1}^n r_β(α,γ)·s_β(α,γ), where r_β(α,γ)= #{(α,β,z)∈U: z>γ} and s_β(α,γ)= #{(x,β,γ)∈U: x>α}.
Proof. For fixed β (i.e., t=β), A_t are u with (x,y)=(α,β) and z>γ; B_t are v with (y,z)=(β,γ) and x>α. The claim follows by summing over β.

Corollary 3 (One-changing, two equal). For J(T)={x}, E(T)={y,z}, and parameter α, the multiplicity equals Σ_{(β,γ)} 1_{(α,β,γ)∈U}· #{(x,β,γ)∈U: x>α}.
Proof. For fixed (β,γ), A_t is { (α,β,γ) } if present, and B_t are points with y=β, z=γ, x>α.

Lemma (3D lex-max antichain). Order triples lex by (z,y,x). If a∈U is lexicographically maximal among 3D-eligible points (NE3(a)≠∅), then NE3(q)=∅ for every q∈NE3(a).
Proof. If q∈NE3(a) had NE3(q)≠∅, pick r∈NE3(q). Then (z(r),y(r),x(r))>(z(q),y(q),x(q))>(z(a),y(a),x(a)), so r is eligible and lex-larger than a, contradicting maximality.

Theorem (Coordinatewise-injective U ⇒ unique color). Suppose U⊆[n]^3 has injective projections on x, y, and z (no two points share an x, no two share a y, no two share a z), and |U|≥2. Then G[U] contains an edge whose c3-color is unique in G[U].
Proof. List U as u_1,…,u_m by increasing x. Let y_i=y(u_i), z_i=z(u_i).
Case 1: (y_i) and (z_i) are strictly increasing in i. Then the product order is a chain. For a=u_{m−1} we have NE3(a)={u_m}, so by Corollary 1 the (+++) color with minima (x(a),y(a),z(a)) has multiplicity 1.
Case 2: Otherwise, there exist i<j with either y_i>y_j and z_i>z_j, or exactly one of these holds.
- If y_i>y_j and z_i>z_j, consider edge e=u_i u_j with type having P(T)={x}, N(T)={y,z}. Its minima are (x_i,y_j,z_j). Because x is injective, A={u_i}. Because y and z are injective, B={u_j}. By the master lemma, multiplicity is 1.
- If w.l.o.g. y_i>y_j and z_i<z_j, take type with P(T)={x,z}, N(T)={y} and minima (x_i,y_j,z_i). Injectivity in x and z forces A={u_i}; injectivity in y forces B={u_j}. Multiplicity is 1.
In all subcases there is a uniquely colored edge.∎