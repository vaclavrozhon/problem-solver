# Rigorous Proofs



Basic facts about the hunters–rabbit evasion number

Notation. For a finite simple graph G=(V,E), write N(X):=⋃_{x∈X}N(x) for the open neighborhood of X⊆V.

Definition (Schedule verification). Given a finite sequence S_1,…,S_t with S_i⊆V, define R_1:=V\S_1 and, for i≥1, R_{i+1}:=N(R_i)\S_{i+1}.

Proposition 1 (Equivalence). The sequence S_1,…,S_t is winning up to horizon t (i.e., for every walk v_1,…,v_t in G there exists i with v_i∈S_i) if and only if R_t=∅.
Proof. For each i, R_i is exactly the set of vertices w for which there exists a length-i walk v_1,…,v_i=w with v_j∉S_j for all j≤i. This holds by induction on i using the recurrence definition. Thus R_t=∅ iff no length-t walk avoids all S_i. ∎

Lemma 2 (Subgraph monotonicity). If H is a subgraph of G, then h(H)≤h(G).
Proof. Any walk in H is also a walk in G. A schedule that hits all walks in G hits all walks confined to H. ∎

Proposition 3 (Vertex-cover upper bound). Let τ(G) be the size of a minimum vertex cover. Then h(G)≤τ(G).
Proof. Fix a minimum vertex cover C. Take S_1=C and S_2=C. If the rabbit starts in C it is caught at time 1. Otherwise it starts in V\C (an independent set), so R_1=V\C and R_2=N(R_1)\C⊆C\C=∅. Hence capture by time 2. ∎

Lemma 4 (Minimum-degree lower bound). If k<δ(G), then no schedule with k hunters is winning; in particular h(G)≥δ(G).
Proof. Fix k<δ(G) and any schedule S. Pick v_1∈V\S_1. Inductively, given v_i∉S_i, since deg(v_i)≥δ(G)>k and |S_{i+1}|≤k, there exists v_{i+1}∈N(v_i)\S_{i+1}. This constructs an avoiding walk of any length. ∎

Corollary 5 (Degeneracy lower bound). Let d(G) be the degeneracy (the maximum of δ(H) over all subgraphs H of G). Then h(G)≥d(G).
Proof. Choose H⊆G with δ(H)=d(G). By Lemma 4 applied to H, h(H)≥d(G). By Lemma 2, h(G)≥h(H). ∎

Corollary 6 (Complete graphs). For n≥1, h(K_n)=n−1.
Proof. Lower bound: δ(K_n)=n−1 and Lemma 4. Upper bound: with k=n−1, take S_i=V\{x} for a fixed x. Then R_1={x} and R_2=N({x})\(V\{x})=∅. ∎

Proposition 7 (Complete bipartite graphs). For K_{p,q} with p≤q, h(K_{p,q})=p.
Proof. Lower bound: δ(K_{p,q})=p, so h≥p by Lemma 4. Upper bound: take S_i to be the p-vertex side A each round. If the walk starts in A, it is caught at i=1. Otherwise it starts in B and must move to A at i=2, where it is shot. ∎

Proposition 8 (Graphs containing a cycle need at least two hunters). If G contains a cycle as a subgraph, then h(G)≥2.
Proof. Every cycle C_m has δ(C_m)=2, hence h(C_m)≥2 by Lemma 4. By Lemma 2, h(G)≥h(C_m)≥2. ∎

Example 9 (C_5 is 2-hunter-catchable). On the 5-cycle with vertices 1–2–3–4–5–1, let
S_1={1,3}, S_2={4,5}, S_3={2,4}, S_4={1,4}.
Then R_1=V\S_1={2,4,5}; R_2=N(R_1)\S_2={1,3,4,5}\{4,5}={1,3}; R_3=N(R_2)\S_3={2,4,5}\{2,4}={5}; R_4=N({5})\S_4={1,4}\{1,4}=∅. Hence h(C_5)≤2.

Remarks. We have not yet proved h(C_m)=2 for all m≥3 (odd m require nontrivial schedules), nor the classification h(G)=1 iff G is a forest. These remain open targets.