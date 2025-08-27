Corrections and key lemmas to record

1) Correct append-one-bit recurrence (r=1)
Given a type t with Ext_t ⊆ Σ_out^4 over boundary (L1,L2,R2,R1) and an appended input bit a, the new type t′ has boundary (L1′,L2′,R2′,R1′) = (L1,L2, old R1, new), i.e., R2′ = R1 and R1′ is the label of the appended node. Formally, for each candidate quadruple (x1,x2,x3,x4) ∈ Σ_out^4,
  (x1,x2,x3,x4) ∈ Ext_{t′} ⇔ [x4 ∈ A_a and E(x3,x4) and ∃ z ∈ Σ_out: (x1,x2,z,x3) ∈ Ext_t].
This yields an O(β^5) DP to fill Ext_{t′} by scanning all (x1,x2,x3,x4) and checking ∃z.

Congruence lemma (needed): If Type(P)=Type(Q), then for all a ∈ {0,1}, Type(Pa)=Type(Qa). Proof sketch: The predicate “there exists an interior completion consistent with boundary assignments” over D1∪D2 is preserved under appending one node by the above DP rule, which depends only on Ext_t and a.

2) Concatenation of summaries (r=1)
If Summ(P) has Ext_P and Summ(Q) has Ext_Q, then the concatenation B=P·Q has boundary (P.left endpoint, P.left neighbor, Q.right neighbor, Q.right endpoint) and
  (o1,o2,o3′,o4′) ∈ Ext_B ⇔ ∃ x3,x4,x1′,x2′ ∈ Σ_out: (o1,o2,x3,x4) ∈ Ext_P, (x1′,x2′,o3′,o4′) ∈ Ext_Q, and E(x4,x1′).
Then R_B can be derived from Ext_B as usual.

3) Counterexample to R-composition via ∃m
Let Σ_out={a,b,c}, A_0=A_1=Σ_out. Let E={a→b, b→c} only. Suppose t_b admits a boundary tuple with right endpoint a, and t_c admits a boundary tuple with left endpoint c (interiors arbitrary but extendible). Then choose m=b. We have (x,m) ∈ R_{t_b} for any x with a valid left edge, and (m,y) ∈ R_{t_c} for suitable y. But the concatenation t_b·t_c requires the seam edge a→c, which is forbidden. Hence ∃m composition of R_t is not sound; use Ext-level concatenation and R_B instead.
Additions and fixes (r=1)

A) Correct k=2→3 base-case update
Let t=(b1,b2) and t′=t·a (length 3). Then
  (x1,x2,x3,x4) ∈ Ext_{t′} ⇔ [x3=x2, x1∈A_{b1}, x2∈A_{b2}, x4∈A_a, E(x1,x2), E(x2,x4)].
This replaces any prior statement that involved x2∈A_a.

B) Type representation and congruence
Define Type(t) := (b_in(t), Ext_t, k_flag(t)), where k_flag ∈ {1,2,3,≥4} indicates whether boundary coordinates coincide due to short length. Then the congruence lemma holds in the form:
  If Type(P)=Type(Q), then for all a∈{0,1}, Type(Pa)=Type(Qa).
Proof: case split on k_flag using the explicit base-case rules for k_flag∈{1,2,3} and the general append recurrence for k_flag=≥4.
Remark: Ext equality alone does not determine |t| (e.g., with E self-loops and A_0=A_1, Ext_{len 2} = Ext_{len 4}). Hence the k_flag is necessary for a length-agnostic update routine.

C) Enumeration fix
In the BFS over types, key the dictionary by the full Type(t), including k_flag. After the first transition to k_flag=≥4, all descendants remain in k_flag=≥4 and subsequent δ updates are length-agnostic.
