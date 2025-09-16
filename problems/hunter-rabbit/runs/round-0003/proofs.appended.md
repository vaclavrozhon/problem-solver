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

Further rigorous results on the evasion number

Notation. For a graph G=(V,E), define N(X):=\bigcup_{x\in X} N(x). For a schedule (S_1,\dots,S_t), set R_1:=V\setminus S_1 and R_{i+1}:=N(R_i)\setminus S_{i+1}.

Lemma 10 (Disjoint unions). If G and H have disjoint vertex sets, then h(G \sqcup H)=\max\{h(G),h(H)\}.
Proof. Any walk lies within one component. If k\ge\max\{h(G),h(H)\}, take a winning schedule for G (using only vertices of G) followed by a winning schedule for H (using only vertices of H), and repeat. Each component’s R-set becomes empty during its respective block and remains empty thereafter (since N(\emptyset)=\emptyset). Conversely, if k<h(G) then restricting to walks in G shows h(G\sqcup H)\ge h(G); similarly h(G\sqcup H)\ge h(H). ∎

Lemma 11 (Permanent blockers). For any U\subseteq V, if U\subseteq S_i for all i, then any avoiding walk stays in G-U. Consequently, h(G) \le |U| + h(G-U).
Proof. If a walk visits u\in U at time t, then v_t\in S_t, a contradiction; hence all avoiding walks stay in V\setminus U. Using |U| blockers each round and an additional h(G-U) hunters to follow a winning schedule on G-U yields a winning schedule on G with per-round budget |U|+h(G-U). ∎

Theorem 12 (Paths). For every n\ge 2, h(P_n)=1.
Proof. Label P_n by 1,2,\dots,n along the path. Consider the 1-hunter schedule of length 2n−3:
S_1=\{1\}, S_2=\{2\},\dots,S_{n-1}=\{n-1\}, then S_n=\{n-1\}, S_{n+1}=\{n-2\},\dots,S_{2n-3}=\{2\}.
Phase I (forward). For 1\le j\le n−1,
R_j = \{i: i>j\} \cup \{ i: 1\le i\le j and i\equiv j+1 \pmod 2\}.
This holds by induction: R_1=\{2,\dots,n\}; if it holds for j, then N(\{i>j\})=[j,\dots,n] and N(\{i\le j,\ i\equiv j+1\})=\{i:1\le i\le j+1,\ i\equiv j\}, and removing S_{j+1}=\{j+1\} gives the claimed R_{j+1}. In particular, R_{n−1}=\{i: i\equiv n \pmod 2\}.
Phase II (backward). Let r\in\{1,\dots,n−2\}. One checks by induction on r that after S_{n−1+r}=\{n−r\}, R_{n−1+r} is the arithmetic progression of the parity opposite to R_{n−1}, truncated to its largest element m:=n−r−2. Its neighborhood before removing S_{n+r}=\{m+1\} is the complementary parity up to m+1; removing S_{n+r} deletes the top element, leaving the opposite parity up to m−1. When r=n−2 this set is empty, so R_{2n−3}=\emptyset. Thus the schedule wins, and since \delta(P_n)=1, this is optimal: h(P_n)=1. ∎

Theorem 13 (k=1 classification). A graph G satisfies h(G)=1 if and only if G is a forest.
Proof. (⇒) If G contains a cycle C, then h(C)\ge \delta(C)=2; by subgraph monotonicity, h(G)\ge 2.
(⇐) Suppose G is a forest T. We build a 1-hunter schedule of length at most 2|V(T)|−1 by iteratively removing leaves. Fix a leaf \ell with neighbor u. For any X\subseteq V(T), since \ell has only neighbor u, we have \ell\notin N\big(N(X)\setminus\{u\}\big). Consider the schedule formed by two shots at u followed by the inductively constructed schedule S′ on T′:=T−\ell. Let R^T_i (resp. R^{T′}_j) denote the R-sets under these schedules. We claim by induction on j\ge 1 that R^T_{j+2} \subseteq R^{T′}_j. For j=1, R^T_2=N(V(T)\setminus\{u\})\setminus\{u\} and \ell\notin N(R^T_2), so R^T_3\subseteq V(T′)\setminus S′_1=R^{T′}_1. If R^T_{j+2}\subseteq R^{T′}_j then R^T_{j+3}=N(R^T_{j+2})\setminus S′_{j+1}\subseteq N(R^{T′}_j)\setminus S′_{j+1}=R^{T′}_{j+1}. Since S′ empties T′ after 2|V(T′)|−1 steps, we have R^T_{2+(2|V(T′)|−1)}=\emptyset, i.e., after at most 2|V(T)|−1 steps. Hence h(T)=1. ∎

Basic dynamics and equivalences

Definitions. For a graph G=(V,E) and a schedule S=(S_1,…,S_t) with |S_i|≤k, define R_1:=V\S_1 and R_{i+1}:=N(R_i)\S_{i+1}. Equivalently, define P_1:=V and P_{i+1}:=N(P_i\S_i).

Lemma 1 (R/P relation). For all i≥1, R_i = P_i\S_i and P_{i+1} = N(R_i). In particular, R_t=∅ iff P_{t+1}=∅.
Proof. By induction on i. For i=1, R_1=V\S_1=P_1\S_1. If R_i=P_i\S_i, then P_{i+1}=N(P_i\S_i)=N(R_i), and R_{i+1}=N(R_i)\S_{i+1}=P_{i+1}\S_{i+1}. ∎

Lower and upper bounds

Lemma 2 (Subgraph monotonicity). If H is a subgraph of G, then h(H) ≤ h(G).
Proof. Let S be a winning schedule on G. Restrict each S_i to V(H). Any H-walk avoiding the restricted schedule is also a G-walk avoiding S, contradiction. ∎

Lemma 3 (Minimum-degree lower bound). For any G, h(G) ≥ δ(G).
Proof. Suppose k<δ(G). Let S be any schedule with |S_i|≤k. An evader can constructively avoid S: pick v_1∉S_1; inductively, at time i at v_i∉S_i, choose any neighbor v_{i+1}∈N(v_i)\S_{i+1}, which exists since |S_{i+1}|≤k<deg(v_i). Thus no such S is winning. ∎

Corollary 4 (Degeneracy lower bound). h(G) ≥ degeneracy(G).
Proof. For any subgraph H⊆G, δ(H) ≤ h(H) ≤ h(G) by Lemmas 2 and 3. Taking the maximum over H gives the degeneracy bound. ∎

Lemma 5 (Vertex-cover upper bound). h(G) ≤ τ(G).
Proof. Let S⊆V be a vertex cover. Shoot S in round 1 and again in round 2 (splitting across rounds if |S|>k is not allowed; here we assume k≥τ(G) for the statement). Then R_1=V\S is independent, so N(R_1)⊆S and R_2=N(R_1)\S=∅. ∎

Disjoint unions and composition

Lemma 6 (Disjoint unions). For disjoint-vertex graphs G and H, h(G ⊔ H) = max{h(G), h(H)}.
Proof. Lower bound is by subgraph monotonicity. For the upper bound, let SG (resp. SH) be winning on G (resp. H). Concatenate the schedules: play SH first (shoot only in H), then SG (shoot only in G). Any evader starting in H is caught during SH; any evader starting in G is unaffected by shots in H and will be caught during SG. Formally, R-monotonicity in the initial set implies that starting SG from any subset of V(G) is no harder than from V(G). ∎

Lemma 7 (Permanent blockers). For any U⊆V, h(G) ≤ |U| + h(G−U).
Proof. Let T_1,…,T_t be a winning schedule on G−U with |T_i|≤h(G−U). Define S_i := U ∪ T_i. Inductively, an evader avoiding S remains in V\U and its R-sets are contained in the R-sets of T on G−U, hence empty at time t. ∎

Lemma 8 (Separator composition). Let S⊆V and suppose G−S is the disjoint union of induced subgraphs H_1,…,H_m. Then h(G) ≤ |S| + max_i h(H_i).
Proof. By Lemma 7, h(G) ≤ |S| + h(G−S). By Lemma 6, h(G−S)=max_i h(H_i). ∎

Exact values on basic families

Proposition 9. For complete graphs, h(K_n)=n−1.
Proof. By Lemma 3, h(K_n) ≥ δ(K_n)=n−1. By Lemma 5, h(K_n) ≤ τ(K_n)=n−1. ∎

Proposition 10. For complete bipartite graphs, h(K_{p,q})=min{p,q}.
Proof. δ(K_{p,q})=min{p,q} gives the lower bound. A minimum vertex cover in K_{p,q} has size min{p,q} (Kőnig’s theorem), yielding the upper bound via Lemma 5. ∎

Periodic schedules via time-lifts

Proposition 11 (Periodic-lift criterion). Fix p≥1 and a period-p schedule S=(S_1,…,S_p), repeated indefinitely. Construct the directed graph L_p(S) on V×{1,…,p} with arcs (u,i)→(v,i+1 mod p) for each uv∈E, and delete all vertices (w,i) with w∈S_i. Then S is winning iff L_p(S) is acyclic.
Proof. If L_p(S) has a directed cycle, tracing it gives a bi-infinite avoiding walk modulo p, so no finite horizon capture occurs. Conversely, if L_p(S) is acyclic, the longest directed path has length at most |V|·p, hence after at most that many rounds all avoiding walks terminate and R becomes empty. ∎