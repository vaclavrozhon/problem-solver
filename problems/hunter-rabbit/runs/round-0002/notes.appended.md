# Research Notes



Working definitions and dynamics
- We fix the open-neighborhood operator N(X)=⋃_{x∈X}N(x). For a schedule S_1, …, S_t (|S_i|≤k), define R_1:=V\S_1 and R_{i+1}:=N(R_i)\S_{i+1}. The schedule is winning up to horizon t iff R_t=∅. Equivalently, using P_1:=V and P_{i+1}:=N(P_i\S_i), the schedule wins iff P_{t+1}=∅. These are equivalent formulations under an index shift.

Verified results we will use
- Subgraph monotonicity: If H⊆G then h(H)≤h(G).
- Upper bound: h(G)≤τ(G) by shooting a minimum vertex cover twice (capture by time 2).
- Lower bounds: h(G)≥δ(G); therefore h(G)≥degeneracy(G). Also, if G contains K_{s,t} as a subgraph then h(G)≥min{s,t}.
- Exact values: h(K_n)=n−1; h(K_{p,q})=min{p,q}. For cycles, h(C_3)=2 (clique), h(C_4)=2; for C_5 a concrete 4-round schedule with k=2 succeeds (see proofs.md). The claim that two fixed antipodal shots per round win on all cycles is false for odd n.

Corrections to earlier claims
- The statement h(K_n)=n is incorrect; n−1 hunters suffice (and are necessary by δ(K_n)=n−1).
- The 1-hunter impossibility on P_n for n≥4 is false; e.g., P_4 has an explicit 1-hunter winning schedule. A general proof that h(P_n)=1 appears feasible but is not yet written.
- The assertion that the decision problem is in NP lacks a bound on schedule length; a priori, a winning schedule may require exponentially many rounds.

Concrete example (cycles)
- C_5 with k=2: S_1={1,3}, S_2={4,5}, S_3={2,4}, S_4={1,4} yields R_1={2,4,5}, R_2={1,3}, R_3={5}, R_4=∅. Thus h(C_5)≤2. For odd cycles, fixed pairs per round do not suffice; schedules must change over time.

Algorithmic consequences (current)
- Fast NO: if degeneracy(G)>k or ω(G)≥k+2 then h(G)>k.
- Fast YES: if τ(G)≤k then h(G)≤k (via FPT vertex-cover).
- These give n^{O(k)} filters but do not settle all instances.

Open targets and next steps
1) Prove h(C_n)=2 for all n≥3 (and record a general schedule). 2) Settle k=1: prove or refute “h(G)=1 iff G is a forest.” 3) Investigate structural upper bounds: does h(G)≤tw(G)? A positive answer implies polynomial recognition for fixed k. 4) Design a separator-based DP that simulates R-evolution with states depending only on boundary sets of size ≤k. 5) Empirically compute h on small graphs (n≤10) and all trees up to n≈12 to test the degeneracy-equality conjecture and discover obstructions.