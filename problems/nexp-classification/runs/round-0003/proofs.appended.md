# Rigorous Proofs



Radius‑1 LCLs on oriented paths: matrices, types, and the middle‑gap NEXPTIME decision

Definitions
- Let Σ_in={0,1}, |Σ_out|=β. Define E∈{0,1}^{β×β} by E[x,y]=1 ⇔ (x,y)∈C_out–out. For i∈{0,1}, define S_i as the β×β diagonal matrix with (S_i)[x,x]=1 ⇔ (i,x)∈C_in–out.
- For a word w=i_1…i_k (k≥1), define its transfer matrix M(w)=S_{i_1}·E·S_{i_2}·E·…·E·S_{i_k} over the Boolean semiring. Two words have the same type iff their transfer matrices are equal. For a segment P with input word w, write M_P:=M(w).

Lemma 1 (Composition).
For any segments P,Q, M_{P·Q}=M_P·E·M_Q.
Proof. Immediate by definition and associativity: concatenation introduces exactly one E between the blocks.

Lemma 2 (Replacement).
Let G be an oriented path or cycle, P⊆G a subpath, and P′ another segment with M_{P′}=M_P. Fix a legal labeling of G that is locally consistent everywhere and fix the outputs on the two nodes adjacent to P (call them a on the left boundary edge and c on the right boundary edge). Then G admits a legal relabeling after replacing P by P′ that preserves all outputs outside P/P′ (and the two boundary outputs), if and only if there exist u,v∈Σ_out with E[a,u]=1, M_P[u,v]=1, and E[v,c]=1. In particular, if the original labeling labels P legally, such u,v exist, and the relabeling exists with P′.
Proof. Necessity is clear from the run across P. For sufficiency, pick any u,v with E[a,u]=1, M_{P′}[u,v]=1 (equal to M_P[u,v]=1), and E[v,c]=1; label P′ internally by a witness for M_{P′}[u,v]=1. All internal node/edge checks hold by construction; cross‑boundary edges use (a,u) and (v,c) and are legal by the E‑constraints. Outside labels are unchanged.

Type automaton and reachability
- Define transitions δ(M,i)=M·E·S_i on β×β Boolean matrices. The set T of reachable types is the least set containing {S_0,S_1} and closed under δ(·,0/1). By construction, for any word w, M(w) is reachable by iterating δ on its letters. Conversely, any reachable matrix equals M(w) for some w.
- Size bound: T⊆{0,1}^{β×β}, so |T|≤2^{β^2}. A BFS over δ builds T in time 2^{O(β^2)}·poly(β).
- For length awareness, define R_1={S_0,S_1} and R_{ℓ+1}={M·E·S_i : M∈R_ℓ, i∈{0,1}}. Then R_ℓ is exactly the set of types of words of length ℓ. Let K:=|T|.

Type‑feasible separator function and bridge condition
- Let S range over {00,01,10,11}. A function f_type: T×S×T→Σ_out^2 is locally valid if for all (τ_L,S,τ_R) it returns (x,y) with (S[1],x)∈C_in–out, E[x,y]=1, and (S[2],y)∈C_in–out.
- For τ_b,τ_c∈T, define the bridge matrix B(τ_b,τ_c):=E·M_{τ_b}·E·M_{τ_c}·E.
- Bridge condition: Given S1,S2 and outputs (ℓ_1,ℓ_2)=f_type(·,S1,τ_b), (r_1,r_2)=f_type(τ_c,S2,·), we require B(τ_b,τ_c)[ℓ_2,r_1]=1.

Theorem 3 (NEXPTIME decision of O(log* n) vs Θ(n)).
There is a nondeterministic exponential‑time algorithm that, given (C_in–out,C_out–out) for a β‑normalized radius‑1 LCL on oriented paths, decides whether the LOCAL complexity is O(log* n) or Θ(n).

Algorithm and proof.
1) Build T and the length‑filtered sets R_K and R_{K+1} by BFS (EXPTIME in β).
2) Nondeterministically guess f_type: T×S×T→Σ_out^2.
3) Verify:
   (i) Local validity at every (τ_L,S,τ_R).
   (ii) For all τ_b,τ_c ∈ R_K∪R_{K+1} and all S1,S2∈S, with (ℓ_1,ℓ_2)=f_type(·,S1,τ_b), (r_1,r_2)=f_type(τ_c,S2,·), check B(τ_b,τ_c)[ℓ_2,r_1]=1. Each check costs O(β^3).
The number of tuples is |R_K∪R_{K+1}|^2·|S|^2 ≤ |T|^2·16 ≤ 2^{O(β^2)}. Thus verification is EXPTIME, and the overall procedure is in NEXPTIME.

Soundness. If a guessed f_type passes, run the standard O(log* n) decomposition on cycles/paths into length‑2 separators and gaps of length K or K+1. Label each separator S by f_type using the types of its neighboring gaps. For each gap with types (τ_b,τ_c), condition (ii) ensures a legal filling consistent with the chosen boundary outputs; replacement (Lemma 2) guarantees independence from the particular representatives. This yields a legal global labeling in O(log* n) rounds.

Completeness. If the problem is solvable in o(n), then by the standard feasible‑function method specialized to r=1 and the type replacement lemma, there exists a separator labeling depending only on the neighboring gap types that makes every K/K+1 gap fillable. Encoding these boundary choices as f_type produces a table satisfying (i)–(ii).

Complexity. Building T, R_K, R_{K+1}: 2^{O(β^2)}·poly(β). Guess size: 2^{Θ(β^2)} entries. Verification: 2^{O(β^2)} checks, each O(β^3). Hence EXPTIME verification and NEXPTIME overall.

Remark on conventions. One can equivalently work with A=E, D_i=S_i and T_w=(A D_{i_1})…(A D_{i_k}); the bridge scalar then appears as (T_{τ_b}·T_{τ_c}·A)[ℓ_2,r_1]. All results are unchanged if the convention is kept consistent.
