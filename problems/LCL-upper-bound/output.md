Setup and definitions (r=1, globally oriented paths)
- Let Σ_out be a finite output alphabet of size β. Let A_0,A_1 ⊆ Σ_out be the allowed outputs at nodes with input bit 0 or 1, respectively. Let E ⊆ Σ_out × Σ_out be the allowed directed edge relation (u→v allowed iff (u,v)∈E). For an input word t ∈ {0,1}^k with k≥1, a labeling o ∈ Σ_out^k is legal if o[i]∈A_{t[i]} for all i, and (o[i],o[i+1])∈E for all 1≤i<k.
- For k≥4, define Ext_t ⊆ Σ_out^4 as the set of boundary quadruples (L1,L2,R2,R1) that extend to a legal labeling o with L1=o[1], L2=o[2], R2=o[k−1], R1=o[k]. For k≤3, Ext_t is defined with the same 4-tuple container but with the obvious coordinate equalities imposed by overlaps (tracked by k_flag ∈ {1,2,3,≥4}). The Type of t is Type(t) := (Ext_t, k_flag(t)).

Lemma 1 (Append-one-bit recurrence; k_flag≥4 case).
Let t be an input word with k_flag(t)≥4, and let t′ := t·a be t with one bit a ∈ {0,1} appended on the right. Then for all (x1,x2,x3,x4)∈Σ_out^4,
  (x1,x2,x3,x4) ∈ Ext_{t′} ⇔ [ x4 ∈ A_a and E(x3,x4) and ∃z∈Σ_out: (x1,x2,z,x3) ∈ Ext_t ].
Proof. (⇒) From (x1,x2,x3,x4)∈Ext_{t′} there is a legal labeling o′ on t′ with o′[1]=x1, o′[2]=x2, o′[k]=x3, o′[k+1]=x4. Node/edge constraints give x4∈A_a and E(x3,x4). Let z := o′[k−1]; then the restriction o := o′[1..k] is a legal labeling of t with boundary (x1,x2,z,x3), so (x1,x2,z,x3)∈Ext_t. (⇐) Conversely, given z with (x1,x2,z,x3)∈Ext_t, pick a witnessing legal labeling o on t. Extend by setting o′[1..k]=o and o′[k+1]=x4. If x4∈A_a and E(x3,x4), then o′ is legal on t′ and has boundary (x1,x2,x3,x4), so (x1,x2,x3,x4)∈Ext_{t′}. □

Base-case update (k=2→3).
Let t=(b1,b2) and t′=t·a. Then for all (x1,x2,x3,x4)∈Σ_out^4,
  (x1,x2,x3,x4) ∈ Ext_{t′} ⇔ [ x3=x2, x1∈A_{b1}, x2∈A_{b2}, x4∈A_a, E(x1,x2), E(x2,x4) ].
This follows by unfolding the definition when positions 2 and 3 coincide in the boundary coordinates.

Lemma 2 (Ext-level concatenation; k_flag≥4).
Let P and Q be input words with k_flag(P), k_flag(Q) ≥4, and let B := P·Q (concatenation). Then for all (o1,o2,o3′,o4′)∈Σ_out^4,
  (o1,o2,o3′,o4′) ∈ Ext_B ⇔ ∃ x3,x4,x1′,x2′ ∈ Σ_out such that
    (o1,o2,x3,x4) ∈ Ext_P, (x1′,x2′,o3′,o4′) ∈ Ext_Q, and E(x4,x1′).
Proof. (⇒) Given a legal labeling on B with boundary (o1,o2,o3′,o4′), define x3:=o[|P|−1], x4:=o[|P|], x1′:=o[|P|+1], x2′:=o[|P|+2]. Restrictions to P and Q witness the two Ext-memberships, and E(x4,x1′) is the edge across the seam. (⇐) Given witnesses, combine the legal labelings on P and Q and the seam constraint E(x4,x1′) to obtain a legal labeling on B with the required boundary. □

Proposition 3 (Type congruence under appending one bit).
If Type(P)=Type(Q), then for all a∈{0,1}, Type(P·a)=Type(Q·a). In particular, Ext_{P·a}=Ext_{Q·a} and k_flag updates identically.
Proof. For k_flag≥4, Lemma 1 shows Ext_{(·)·a} depends only on Ext_{(·)} and a. Thus Ext_{P·a}=Ext_{Q·a}. The k_flag transition is determined solely by k_flag and the append operation, hence identical for P and Q. Short-length cases follow by the explicit base-case rules. □

Proposition 4 (Unsoundness of existential R-composition).
There exists an instance (Σ_out,A_0,A_1,E) and types t_b,t_c such that there is m∈Σ_out with (x,m) ∈ R_{t_b} and (m,y) ∈ R_{t_c} for some x,y, yet (x,y) ∉ R_{t_b·t_c}. Hence the rule “(∃m) R_{P·Q}(x,y) ⇐ R_P(x,m) ∧ R_Q(m,y)” is not valid in general.
Proof. Take Σ_out={a,b,c}, A_0=A_1=Σ_out, and E={(a,b),(b,c)} only. Let t_b be any type that admits a legal labeling with rightmost output a (left side arbitrary), so (x,a)∈R_{t_b} for any feasible x. Let t_c admit a legal labeling with leftmost output c (right side arbitrary), so (c,y)∈R_{t_c} for a suitable y. Choose m=b; then (x,m)∈R_{t_b} and (m,y)∈R_{t_c}. However, in the concatenation t_b·t_c, the seam would require E(a,c), which is false. Thus (x,y)∉R_{t_b·t_c}. □

Proposition 5 (Optimized computation of Ext for concatenation in O(β^6)).
For any types τ,σ with k_flag(τ),k_flag(σ)≥4, define the 3D slices
  Left_τ[o1,o2,x4] := ∃x3 (o1,o2,x3,x4)∈Ext_τ, and
  Right_σ[x1′,o3′,o4′] := ∃x2′ (x1′,x2′,o3′,o4′)∈Ext_σ.
Then for all (o1,o2,o3′,o4′),
  (o1,o2,o3′,o4′) ∈ Ext_{τ⊙σ} ⇔ ∃x4,x1′: Left_τ[o1,o2,x4] ∧ E(x4,x1′) ∧ Right_σ[x1′,o3′,o4′].
Moreover, after precomputing Left_τ and Right_σ for all τ,σ in O(β^4) time per type, Ext_{τ⊙σ} can be computed in O(β^6) time by scanning all (o1,o2,o3′,o4′)∈Σ_out^4 and testing the existential condition over (x4,x1′)∈Σ_out^2.
Proof. The equivalence is immediate from Lemma 2 by eliminating the existential witnesses x3 and x2′ into the definitions of Left_τ and Right_σ. Complexity: each 3D table has O(β^3) entries and can be filled in O(β) time per entry (by checking ∃ over one coordinate), giving O(β^4). Computing Ext_{τ⊙σ} requires O(β^4) target entries and an O(β^2) search over (x4,x1′) per entry, hence O(β^6). □
Proposition 6 (Base-case update; k=1→2).
Let t=(b) be a length-1 input and t′:=t·a the length-2 input obtained by appending a∈{0,1}. For all (x1,x2,x3,x4)∈Σ_out^4,
  (x1,x2,x3,x4) ∈ Ext_{t′} ⇔ [ x1 = x3, x2 = x4, x1 ∈ A_b, x2 ∈ A_a, and E(x1,x2) ].
Proof. A legal labeling on t′ has outputs (o1,o2) with o1∈A_b, o2∈A_a and E(o1,o2); its boundary tuple is (o1,o2,o1,o2), giving the stated equalities and constraints. The converse is immediate. □

Proposition 7 (Base-case update; k=3→4).
Let t=(b1,b2,b3) be a length-3 input and t′:=t·a the length-4 input obtained by appending a∈{0,1}. For all (x1,x2,x3,x4)∈Σ_out^4,
  (x1,x2,x3,x4) ∈ Ext_{t′} ⇔ [ x1∈A_{b1}, x2∈A_{b2}, x3∈A_{b3}, x4∈A_a, and E(x1,x2), E(x2,x3), E(x3,x4) ].
Proof. Unfold the definition: Ext_{t′} collects exactly the boundary tuples of legal labelings on the 4-node path with the given input bits, which are precisely those satisfying the listed node and edge constraints. □

Lemma 8 (Type-count bound).
With Type(t):=(Ext_t, k_flag(t)) and Ext_t⊆Σ_out^4, the number of distinct types obeys
  |T| ≤ 4 · 2^{β^4}.
Proof. For each of the four values of k_flag∈{1,2,3,≥4}, Ext_t can be any subset of Σ_out^4 (subject to feasibility), so the total number of pairs (Ext, k_flag) is at most 4·2^{|Σ_out^4|} = 4·2^{β^4}. □

Proposition 9 (δ well-defined; deterministic BFS enumeration in 2^{poly(β)} time/space).
Let δ map a type τ and an appended bit a∈{0,1} to the type of the one-bit extension. Define δ by:
- If k_flag(τ)=1 and input bit inside τ is b (implicitly recoverable as A_b = { x : (x,x,x,x) ∈ Ext_τ }), compute Ext of the 2-node type by Proposition 6.
- If k_flag(τ)=2, use the explicit k=2→3 update (already in outputs.md).
- If k_flag(τ)=3, use Proposition 7.
- If k_flag(τ)≥4, use Lemma 1.
Then δ(τ,a) depends only on τ and a (by Proposition 3), not on the particular representative. A deterministic BFS that starts from all length-1 seeds (t=(0) and t=(1)), repeatedly applies δ(·,0) and δ(·,1), and interns types by equality of (Ext, k_flag), halts after at most |T| insertions and enumerates all reachable types. Each transition costs O(β^5) in the k_flag≥4 regime (base-cases are ≤O(β^4)). Since |T| ≤ 4·2^{β^4}, the total time and space are 2^{poly(β)}. □

Lemma 10 (Reversal operator; basic properties).
Define, for any type τ=(Ext_τ,k_flag(τ)), the reversed type Rev(τ):=(Ext_τ^R, k_flag(τ)), where
  Ext_τ^R := { (y1,y2,y3,y4) ∈ Σ_out^4 : (y4,y3,y2,y1) ∈ Ext_τ }.
Then Rev(Rev(τ))=τ. Moreover, for any types τ,σ with k_flag≥4,
  Ext_{Rev(τ) ⊙ Rev(σ)} = (Ext_{σ ⊙ τ})^R.
Proof. The involution Rev(Rev(τ))=τ is immediate from the definition. For concatenation, note that reversing P·Q swaps the order and reverses boundary coordinates. Applying Lemma 2 to σ⊙τ and then reversing both sides yields the stated identity. □
