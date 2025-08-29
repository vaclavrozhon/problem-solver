Setup and definitions (r=1, globally oriented paths)
- Let Σ_out be a finite output alphabet of size β. Let A_0,A_1 ⊆ Σ_out be the allowed outputs at nodes with input bit 0 or 1, respectively. Let E ⊆ Σ_out × Σ_out be the allowed directed edge relation (u→v allowed iff (u,v)∈E). For an input word t ∈ {0,1}^k with k≥1, a labeling o ∈ Σ_out^k is legal if o[i]∈A_{t[i]} for all i, and (o[i],o[i+1])∈E for all 1≤i<k.
- For k≥4, define Ext_t ⊆ Σ_out^4 as the set of boundary quadruples (L1,L2,R2,R1) that extend to a legal labeling o with L1=o[1], L2=o[2], R2=o[k−1], R1=o[k]. For k≤3, Ext_t is defined with the same 4‑tuple container but with the obvious coordinate equalities imposed by overlaps (tracked by k_flag ∈ {1,2,3,≥4}). The Type of t is Type(t) := (Ext_t, k_flag(t)).
- Indexing reminder: Throughout, boundary quadruples are ordered as (L1, L2, R2, R1).

Lemma 1 (Append‑one‑bit recurrence; k_flag ≥ 4).
Let t be an input word with k_flag(t)≥4, and let t′ := t·a be t with one bit a ∈ {0,1} appended on the right. Then for all (x1,x2,x3,x4)∈Σ_out^4,
  (x1,x2,x3,x4) ∈ Ext_{t′} ⇔ [ x4 ∈ A_a and E(x3,x4) and ∃z∈Σ_out: (x1,x2,z,x3) ∈ Ext_t ].
Proof. Standard restriction/extension argument on legal labelings. □

Proposition 6 (Base‑case update; k=1→2).
Let t=(b) be a length‑1 input and t′:=t·a the length‑2 input obtained by appending a∈{0,1}. For all (x1,x2,x3,x4)∈Σ_out^4,
  (x1,x2,x3,x4) ∈ Ext_{t′} ⇔ [ x1 = x3, x2 = x4, x1 ∈ A_b, x2 ∈ A_a, and E(x1,x2) ].
Proof. Immediate from the definition. □

Proposition 6B (Base‑case update; k=2→3).
Let t=(b1,b2) be a length‑2 input and t′:=t·a the length‑3 input obtained by appending a∈{0,1}. For all (x1,x2,x3,x4) ∈ Σ_out^4,
  (x1,x2,x3,x4) ∈ Ext_{t′} ⇔ [ x3 = x2, x1 ∈ A_{b1}, x2 ∈ A_{b2}, x4 ∈ A_a, E(x1,x2), and E(x2,x4) ].
Proof. Any legal labeling on three nodes has boundary (o1,o2,o2,o3), with o1∈A_{b1}, o2∈A_{b2}, o3∈A_a and E(o1,o2), E(o2,o3). Conversely, any tuple satisfying these constraints is realized by such a labeling. □

Proposition 7 (Base‑case update; k=3→4).
Let t=(b1,b2,b3) be a length‑3 input and t′:=t·a the length‑4 input obtained by appending a∈{0,1}. For all (x1,x2,x3,x4)∈Σ_out^4,
  (x1,x2,x3,x4) ∈ Ext_{t′} ⇔ [ x1∈A_{b1}, x2∈A_{b2}, x3∈A_{b3}, x4∈A_a, and E(x1,x2), E(x2,x3), E(x3,x4) ].
Proof. Unfold the definition on the 4‑node path. □

Lemma 2 (Ext‑level concatenation; k_flag ≥ 4).
Let P and Q be input words with k_flag(P), k_flag(Q) ≥4, and let B := P·Q. Then for all (o1,o2,o3′,o4′)∈Σ_out^4,
  (o1,o2,o3′,o4′) ∈ Ext_B ⇔ ∃ x3,x4,x1′,x2′ ∈ Σ_out such that
    (o1,o2,x3,x4) ∈ Ext_P, (x1′,x2′,o3′,o4′) ∈ Ext_Q, and E(x4,x1′).
Proof. Combine witnesses across the seam, or restrict a legal labeling of B. □

Proposition 3 (Type congruence under appending one bit).
If Type(P)=Type(Q), then for all a∈{0,1}, Type(P·a)=Type(Q·a). In particular, Ext_{P·a}=Ext_{Q·a} and k_flag updates identically.
Proof. For k_flag≥4, Lemma 1 shows Ext_{(·)·a} depends only on Ext_{(·)} and a. Short cases follow by the explicit base‑case rules. □

Proposition 4 (Unsoundness of existential R‑composition).
There exists an instance (Σ_out,A_0,A_1,E) and types t_b,t_c such that there is m∈Σ_out with (x,m) ∈ R_{t_b} and (m,y) ∈ R_{t_c} for some x,y, yet (x,y) ∉ R_{t_b·t_c}. Hence the rule “(∃m) R_{P·Q}(x,y) ⇐ R_P(x,m) ∧ R_Q(m,y)” is not valid in general.
Proof. Use Σ_out={a,b,c}, A_0=A_1=Σ_out, E={(a,b),(b,c)}; choose t_b with rightmost a and t_c with leftmost c; pick m=b. The seam would require E(a,c), which fails. □

Proposition 5 (Optimized computation of Ext for concatenation in O(β^6)).
For any types τ,σ with k_flag(τ),k_flag(σ)≥4, define the 3D slices
  Left_τ[o1,o2,x4] := ∃x3 (o1,o2,x3,x4)∈Ext_τ, and
  Right_σ[x1′,o3′,o4′] := ∃x2′ (x1′,x2′,o3′,o4′)∈Ext_σ.
Then for all (o1,o2,o3′,o4′),
  (o1,o2,o3′,o4′) ∈ Ext_{τ⊙σ} ⇔ ∃x4,x1′: Left_τ[o1,o2,x4] ∧ E(x4,x1′) ∧ Right_σ[x1′,o3′,o4′].
Moreover, after precomputing Left_τ and Right_σ for all τ,σ in O(β^4) time per type, Ext_{τ⊙σ} can be computed in O(β^6) time.
Proof. Eliminate x3,x2′ by definitions; count entries. □

Proposition 6A (k_flag=1 append update without recovering the bit).
Let τ be a type with k_flag(τ)=1 and define S_τ := { x ∈ Σ_out : (x,x,x,x) ∈ Ext_τ }. For a∈{0,1}, let τ′ := δ(τ,a). Then for all (x1,x2,x3,x4)∈Σ_out^4,
  (x1,x2,x3,x4) ∈ Ext_{τ′} ⇔ [ x1=x3, x2=x4, x1∈S_τ, x2∈A_a, and E(x1,x2) ].
Proof. Any legal 2‑node labeling has boundary (o1,o2,o1,o2) with o1∈S_τ, o2∈A_a and E(o1,o2). Conversely, any tuple satisfying the listed constraints is realized by a legal labeling on the 2‑node input. □

Lemma 8 (Type‑count bound).
With Type(t):=(Ext_t, k_flag(t)) and Ext_t⊆Σ_out^4, the number of distinct types obeys |T| ≤ 4 · 2^{β^4}.
Proof. For each k_flag value, Ext can be any subset of Σ_out^4; sum over k_flag. □

Proposition 9 (δ well‑defined; deterministic BFS enumeration in 2^{poly(β)} time/space).
Let δ map a type τ and an appended bit a∈{0,1} to the type of the one‑bit extension. Define δ by:
- If k_flag(τ)=1, compute Ext of the 2‑node type by Proposition 6A using S_τ.
- If k_flag(τ)=2, use the explicit k=2→3 update (Proposition 6B).
- If k_flag(τ)=3, use Proposition 7.
- If k_flag(τ)≥4, use Lemma 1 (implementable in O(β^4) time via Proposition 19).
Then δ(τ,a) depends only on τ and a (by Proposition 3). A deterministic BFS that starts from the length‑1 seeds (t=(0) and t=(1)), repeatedly applies δ(·,0) and δ(·,1), and interns types by equality of (Ext, k_flag), halts after at most |T| insertions and enumerates all reachable types. Each transition costs O(β^4) in the k_flag≥4 regime (base‑cases are ≤O(β^4)). Since |T| ≤ 4·2^{β^4}, the total time and space are 2^{poly(β)}. □

Lemma 10 (Reversal operator; basic properties).
Define, for any type τ=(Ext_τ,k_flag(τ)), the reversed type Rev(τ):=(Ext_τ^R, k_flag(τ)), where Ext_τ^R := { (y1,y2,y3,y4) : (y4,y3,y2,y1) ∈ Ext_τ }. Then Rev(Rev(τ))=τ and, for k_flag≥4, Ext_{Rev(τ) ⊙ Rev(σ)} = (Ext_{σ ⊙ τ})^R.
Proof. Direct from definitions and Lemma 2. □

Definition (Long types and pumping bound).
- T_long := { τ ∈ T : k_flag(τ) ≥ 4 }.
- Define ℓ_pump := |T|, where T is the set of reachable Types enumerated by Proposition 9.

Lemma 11 (Ext‑level concatenation; all k_flag).
For any input words P,Q (no restriction on length) and B := P·Q, for all (o1,o2,o3′,o4′) ∈ Σ_out^4,
  (o1,o2,o3′,o4′) ∈ Ext_B ⇔ ∃ x3,x4,x1′,x2′ ∈ Σ_out:
    (o1,o2,x3,x4) ∈ Ext_P, (x1′,x2′,o3′,o4′) ∈ Ext_Q, and E(x4,x1′).
Proof. As in Lemma 2; k_flag imposes only coordinate equalities. □

Proposition 12 (Associativity of Ext‑concatenation).
For any input words P,Q,R, Ext_{(P·Q)·R} = Ext_{P·(Q·R)} as subsets of Σ_out^4.
Proof. Either semantically (concatenation of words) or by rebracketing witnesses from Lemma 11. □

Lemma 13 (Prefix pumping).
Let ℓ_pump := |T|. For any input string w with |w| ≥ ℓ_pump there exist a decomposition w = x y z with 1 ≤ |y| ≤ ℓ_pump and |x y| ≤ ℓ_pump such that Type(x y^i z) is independent of i ≥ 0.
Proof. Pigeonhole on the first ℓ_pump+1 states of the δ‑run. □

Lemma 14 (Periodic pumping).
For any nonempty string u there exist integers a,b with a+b ≤ ℓ_pump such that Type(u^{a+bi}) is invariant for all i ≥ 0.
Proof. Pigeonhole on the sequence Type(u^j), j≥0, and determinism of δ. □

Definition (Feasible function; Out‑set form).
A function f: T_long × {0,1}^2 × T_long → Σ_out^2 is feasible if for every (τ_L, s, τ_R) it outputs (α1,α2) with αi ∈ A_{s[i]} and E(α1,α2), and moreover the following universal extendibility holds: for all τ_b,τ_c∈T_long and s1,s2 ∈ {0,1}^2, and for all α_L ∈ OutR2(τ_b,s1), α_R ∈ OutL1(τ_c,s2), there exists (o1,o2,o3,o4) ∈ Ext_{τ_b ⊙ τ_c} with E(α_L,o1) and E(o4,α_R), where
  OutR2(τ_b,s) := { second(f(τ_a,s,τ_b)) : τ_a ∈ T_long },
  OutL1(τ_c,s) := { first(f(τ_c,s,τ_d)) : τ_d ∈ T_long }.

Lemma 20 (Quantifier minimization equivalence).
Let f be any function T_long×{0,1}^2×T_long→Σ_out^2 obeying node/window constraints. The universal extendibility clause stated here is equivalent to the clause “for all τ_a,τ_b,τ_c,τ_d and s1,s2, letting α_L := second(f(τ_a,s1,τ_b)) and α_R := first(f(τ_c,s2,τ_d)), there exists (o1,o2,o3,o4)∈Ext_{τ_b⊙τ_c} with E(α_L,o1), E(o4,α_R)).”
Proof. “Only if”: the α_L,α_R in the original clause range over OutR2,OutL1. “If”: for given τ_b,τ_c,s1,s2 and α_L∈OutR2, α_R∈OutL1, pick τ_a,τ_d witnessing membership and apply the original clause. □

Proposition 19 (Optimized append in O(β^4) time for k_flag ≥ 4).
For t with k_flag≥4 and a∈{0,1}, define Left3_t[x1,x2,x3] := ∃z (x1,x2,z,x3)∈Ext_t. One can compute Left3_t in O(β^4) time. Then fill Ext_{t·a} by scanning all (x1,x2,x3) with Left3_t[x1,x2,x3]=true and, for each, iterating over x4 with E(x3,x4) and x4∈A_a, setting Ext_{t·a}[x1,x2,x3,x4]←true. The total time is O(β^4) in the dense worst‑case.
Proof. Correctness follows from Lemma 1. Complexity: Left3_t has β^3 entries, each tested in O(β); the fill step is O(β^3Δ) with Δ≤β. □

Proposition 21 (Seam‑feasibility matrices for τ_b ⊙ τ_c).
For τ_b,τ_c, define W_{b⊙c}[α_L][α_R] (a β×β boolean matrix) to be true iff ∃(o1,o2,o3,o4)∈Ext_{τ_b⊙τ_c} with E(α_L,o1) and E(o4,α_R). Using precomputed 3D slices or Ext_{τ_b⊙τ_c}, W_{b⊙c} can be computed in O(β^4Δ^2) time (or better with sparse E), and then universal extendibility checks reduce to testing W_{b⊙c}[α_L][α_R].
Proof. Expand the definition via Lemma 11, eliminate internal witnesses by slices, and count operations. □

Proposition 17 (Nonemptiness monotonicity under concatenation).
If Ext_P ≠ ∅ and Ext_Q ≠ ∅ and there exist x4,x1′ with E(x4,x1′), then Ext_{P·Q} ≠ ∅.
Proof. Choose any (o1,o2,x3,x4) ∈ Ext_P and (x1′,x2′,o3′,o4′) ∈ Ext_Q; Lemma 11 and E(x4,x1′) imply (o1,o2,o3′,o4′) ∈ Ext_{P·Q}. □

Definitions (endpoint projections and seam matrices).
For any type τ, define the projections of Ext_τ to the endpoint coordinates:
- RightColors(τ) := { y ∈ Σ_out : ∃ x1,x2,x3 with (x1,x2,x3,y) ∈ Ext_τ }.
- LeftColors(τ)  := { x ∈ Σ_out : ∃ x2,x3,y with (x,x2,x3,y) ∈ Ext_τ }.
Define the endpoint seam‑compatibility matrices by
- V_left[τ][α]  := true ⇔ ∃ y ∈ RightColors(τ) with E(y, α), and
- V_right[α][τ] := true ⇔ ∃ x ∈ LeftColors(τ) with E(α, x).

Lemma E1 (Endpoint feasibility via Ext).
Let τ be any type and α ∈ Σ_out.
(i) There exists a legal labeling of a left end‑block of type τ together with an adjacent separator whose first output is α if and only if V_left[τ][α] is true.
(ii) There exists a legal labeling of a right end‑block of type τ together with an adjacent separator whose second output is α if and only if V_right[α][τ] is true.
Proof. (i) If V_left[τ][α] holds, pick y ∈ RightColors(τ) with E(y,α) and any (x1,x2,x3,y)∈Ext_τ; Ext‑membership provides the interior, and E(y,α) the seam. Conversely, any legal instance gives y as the last output on the end block, whence (x1,x2,x3,y)∈Ext_τ and E(y,α). (ii) is symmetric. □

Lemma E2 (Endpoint–interior bridging via W_{b⊙c}).
Fix τ_b, τ_c ∈ T_long, inputs s1,s2 ∈ {0,1}^2, and seam colors α_L, α_R ∈ Σ_out. There exists a legal completion of the intervening block of type τ_b ⊙ τ_c consistent with the left seam color α_L (toward τ_b) and the right seam color α_R (toward τ_c) if and only if W_{b⊙c}[α_L][α_R] is true.
Proof. Directly by definition of W_{b⊙c}: “if” is witnessed by (o1,o2,o3,o4); “only if” follows by restricting any legal completion of the intervening block to its boundary and the seam edges. □

Lemma E3 (Feasible‑f condition as set inclusion).
Let f be as in Definition “Feasible function; Out‑set form.” For all τ_b,τ_c∈T_long and s1,s2,
  OutR2(τ_b,s1) × OutL1(τ_c,s2) ⊆ { (α_L,α_R) : W_{b⊙c}[α_L][α_R] = true }.
Conversely, if these inclusions hold for all τ_b,τ_c,s1,s2, then f satisfies the universal extendibility clause.
Proof. Immediate from Lemma E2 and the definition of W_{b⊙c}. □

Definition (Endpoint maps with Out‑set alignment).
- g_L: T × {0,1}^2 × T_long → Σ_out^2. For g_L(τ_end, s, τ_b) = (β1,β2) require:
  (i) βi ∈ A_{s[i]} (i = 1,2) and E(β1,β2);
  (ii) V_left[τ_end][β1] = true;
  (iii) β2 ∈ OutR2(τ_b, s).
- g_R: T_long × {0,1}^2 × T → Σ_out^2. For g_R(τ_c, s, τ_end) = (β1,β2) require:
  (i) βi ∈ A_{s[i]} and E(β1,β2);
  (ii) V_right[β2][τ_end] = true;
  (iii) β1 ∈ OutL1(τ_c, s).

Lemma M1 (MIS on the K‑th power of a path in O(log* n); spacing [K,2K]).
For every constant K ≥ 1, there is a deterministic LOCAL algorithm that in O(log* n) rounds computes a maximal independent set on the K‑th power of the underlying undirected path. In the resulting set, consecutive selected positions are at distances in [K, 2K].
Proof sketch. First compute a proper O(1)‑coloring of the path in O(log* n) rounds (e.g., Cole–Vishkin color reduction). Then greedily construct an MIS on the K‑th power in O(1) rounds by iterating over color classes and adding a node if none of its K‑neighbors is already selected. Maximality and the spacing bounds follow from construction. □

Theorem S1‑path (Endpoint‑coupled equivalence on oriented paths).
Let an r=1 LCL be given on globally oriented paths with output alphabet Σ_out of size β. Then the following are equivalent:
(A) There exists a deterministic LOCAL algorithm with runtime o(n).
(B) There exist witnesses (f_mid, g_L, g_R) where f_mid: T_long×{0,1}^2×T_long→Σ_out^2 is feasible in the Out‑set sense (Definition “Feasible function; Out‑set form”), and g_L, g_R satisfy the endpoint map constraints above.
Moreover, existence of such witnesses is verifiable in nondeterministic time 2^{poly(β)}.

Proof.
(⇒) Assume a deterministic o(n)‑round algorithm A. Fix a large n and let R := R(n) be its runtime on paths of length n. By Lemmas 13–14 (pumping), for each τ ∈ T_long choose a canonical input string w_τ of type τ with |w_τ| ≫ R and with a short prefix y_τ of length ≤ ℓ_pump such that w_τ = x_τ y_τ^M z_τ for some M, and the δ‑state is stable across repetitions.

Define f_mid(τ_L, s, τ_R) as follows: consider W := w_{τ_L} · S(s) · w_{τ_R}, where S(s) is the 2‑node separator with input s. Assign unique identifiers so that the ID pattern is periodic and identical within the R‑neighborhoods around S(s), and pad beyond distance R into w_{τ_L}, w_{τ_R}. Run A on W and record the 2‑node output on S(s) as f_mid(τ_L, s, τ_R). Because the neighborhoods of S(s) are isomorphic across all such choices (by periodic pumping and our canonical construction), f_mid is well defined and satisfies node/window constraints. The Out‑set feasibility of f_mid holds: for any τ_b, τ_c and α_L ∈ OutR2(τ_b, s1), α_R ∈ OutL1(τ_c, s2), choose τ_a, τ_d witnessing α_L, α_R via f_mid and form the path w_{τ_b} · S(s1) · middle · S(s2) · w_{τ_c}, where “middle” is any long block of type τ_b ⊙ τ_c built from our canonical pieces and padded so that the R‑neighborhoods of the two separators are disjoint. By locality, A’s outputs on the two separators are α_L and α_R, and since A is correct, a legal completion of the middle block exists. Projecting to Ext gives W_{b⊙c}[α_L][α_R] = true, as required by the Out‑set feasibility clause.

Define g_L(τ_end, s, τ_b) as follows: pick any finite path P_end with Type(P_end)=τ_end; pick w_{τ_b} (as above) long enough so that the radius‑R neighborhood of S(s) lies entirely inside w_{τ_b} on the right. Run A on the finite path P := P_end · S(s) · w_{τ_b} (with padding only on the right beyond distance R if needed). Let g_L(τ_end,s,τ_b) be the output on S(s). Local correctness of A implies (i); the existence of a legal seam into the endpoint block yields V_left[τ_end][β1] = true (ii); and since the right context is w_{τ_b}, the second output β2 lies in OutR2(τ_b, s), giving (iii). Define g_R symmetrically by choosing any P_end of type τ_end on the right and padding on the left within w_{τ_c}.

(⇐) Assume witnesses (f_mid, g_L, g_R) as above. Let K := ℓ_pump + 4. By Lemma M1, compute in O(log* n) rounds a maximal independent set on the K‑th power of the path; consecutive MIS nodes (separators) are at distances in [K, 2K].
- Interior separators: For each separator between long blocks of types τ_b and τ_c with local inputs s1 and s2 on its two adjacent 2‑node windows, set its 2‑node output to f_mid(·). By Out‑set feasibility and Lemma E2, the block between any two consecutive interior separators is fillable via Ext_{τ_b ⊙ τ_c} using table W_{b⊙c}.
- Endpoint‑adjacent separators: Let S_L be the unique separator adjacent to the left end; compute τ_end (the type of the end block to its left) and τ_b (the long type on its right). Set S_L’s output to g_L(τ_end, s, τ_b). By Lemma E1 and condition (ii), the endpoint block can be filled. For the block between S_L and the nearest interior separator S_2 (with right‑side long type τ_c), condition (iii) gives α_L := second(g_L) ∈ OutR2(τ_b, s), while the left seam color α_R at S_2 is in OutL1(τ_c, s2) by construction. Hence W_{b⊙c}[α_L][α_R] = true, and Lemma E2 fills the intervening block. Do the right endpoint symmetrically with g_R.
- Small‑n edge cases (0 or 1 separator) are handled by brute‑force completion using Ext tables in constant radius; this does not affect asymptotic runtime.
All fillings are computed from constant‑size tables; the MIS step dominates with O(log* n) rounds. Thus we obtain an O(log* n) algorithm.

Verification complexity. Deterministically enumerate T and T_long via Proposition 9 with O(β^4) per long append (Prop. 19), precompute Ext_τ and Ext_{τ_b ⊙ τ_c}, W_{b⊙c}, V_left, V_right. For a guessed f_mid, compute OutR2 and OutL1 sets. Then check the constraints entrywise; the total time is 2^{poly(β)}.

Remark. Lemma 11 strictly subsumes Lemma 2; we retain Lemma 2 for emphasis in the k_flag ≥ 4 regime.
Supplement: max out‑degree and tiny‑path fallback

Definition (Max out‑degree of E).
Let Δ := max_{x ∈ Σ_out} |{ y ∈ Σ_out : E(x,y) }|. We use Δ for coarse complexity bounds in Propositions 19 and 21.

Lemma TP (Tiny‑path fallback; constant‑radius completion for small n).
Let K := ℓ_pump + 4 and M := 2K. There exists a deterministic LOCAL algorithm that, on any globally oriented path of length n ≤ M, decides in O(1) rounds whether a legal labeling exists and outputs one when it does.
Proof. Precompute offline, for every input word t with |t| ≤ M, whether Ext_t ≠ ∅ and, when Ext_t ≠ ∅, a witness labeling o_t ∈ Σ_out^{|t|}. This can be done by dynamic programming on t in time 2^{poly(β)} (a constant depending only on β). At runtime, every node gathers the entire path in at most M rounds (a constant) using the global orientation, agrees on the exact input t and length n, and either rejects (if Ext_t=∅) or outputs the precomputed o_t. This is deterministic and O(1) in the LOCAL model because M depends only on β. □

Clarification for Theorem S1‑path (Interior vs endpoint seams).
In the (⇐) construction, let K := ℓ_pump + 4 and compute an MIS on the K‑th power (Lemma M1). Consecutive selected separators S (left) and S′ (right) define an intervening block. Let τ_b be the long type immediately to the right of S and τ_c be the long type immediately to the left of S′. Denote by α_L the second output placed on S (it is second(f_mid(·)) for interior S, or second(g_L(·)) on the endpoint‑adjacent S), and by α_R the first output placed on S′ (it is first(f_mid(·)) or first(g_R(·)) accordingly). By Out‑set feasibility and alignment (iii) in the endpoint maps, we have α_L ∈ OutR2(τ_b,·) and α_R ∈ OutL1(τ_c,·), hence W_{b⊙c}[α_L][α_R] = true (Proposition 21), which certifies that the intervening block admits a legal completion. The two end blocks are completed by Lemma E1 (endpoint feasibility) and the tiny‑path fallback (Lemma TP) handles the cases with 0 or 1 separator.

Proposition 22 (Incremental update of endpoint projections under append; k_flag ≥ 4).
Let τ be a type with k_flag(τ) ≥ 4 and τ′ := δ(τ,a) the result of appending bit a ∈ {0,1}. Then
- LeftColors(τ′) = LeftColors(τ), and
- RightColors(τ′) = { y ∈ A_a : ∃x1,x2,x3 with Left3_τ[x1,x2,x3] and E(x3,y) }.
Proof. The left endpoint outputs do not change when appending on the right. For the right endpoint, Lemma 1 and Proposition 19 imply that (x1,x2,x3,y) ∈ Ext_{τ′} iff Left3_τ[x1,x2,x3] ∧ E(x3,y) ∧ y ∈ A_a; projection to the R1 coordinate yields the claimed identity. □