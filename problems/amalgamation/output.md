Proposition 1 (Orientation function model).
For a finite set V, giving a 4‑hypertournament structure (V,R) satisfying: (i) all tuples in R have distinct entries; (ii) R is closed under even permutations of coordinates; (iii) for every 4‑tuple of distinct vertices (x1,x2,x3,x4), exactly one of (x1,x2,x3,x4) and (x2,x1,x3,x4) lies in R; is equivalent to giving an arbitrary function f:[V]^4→{±1}.
Proof. Given f, declare (x1,x2,x3,x4)∈R iff the permutation from the increasing ordering of S={x1,x2,x3,x4} to (x1,…,x4) has sign equal to f(S). This satisfies (i)–(iii) by construction. Conversely, given R with (i)–(iii), fix any 4‑set S and any increasing ordering s of S. By (iii), exactly one of s and its swap lies in R; define f(S)=+1 if s∈R and f(S)=−1 otherwise. By (ii) and (iii), membership of any ordered tuple from S depends only on the parity relative to s, so f is well defined and recovers R. ∎

Lemma 2 (One‑point amalgamation suffices for AP in H).
Let H be the class of finite 4‑hypertournaments omitting O5. Suppose that whenever A∈H and B=A∪{b}∈H and C=A∪{c}∈H with B∩C=A, there exists D∈H on A∪{b,c} extending both B and C. Then H has the amalgamation property.
Proof. Given B0,B1∈H over A, enumerate C\A as c1,…,ck and set A0:=A. Inductively, amalgamate Bi with Ai∪{ci} over Ai to obtain Bi+1 on Ai+1:=Ai∪{ci}. At each step, by hypothesis, all 5‑sets involving the new vertex ci avoid O5, and previously constructed parts are unchanged. After k steps we obtain an amalgam D∈H of B0 and C over A. ∎

Proposition 3 (CSP formulation of the |A|=4 one‑point step).
Let A={1,2,3,4}, b, c new. Given B on A∪{b} and C on A∪{c} in H that agree on A, any amalgam D on A∪{b,c} is determined on new 4‑sets by the six values x_{ij}:=f({i,j,b,c}) (1≤i<j≤4). The only new 5‑sets are Y_k:={b,c}∪(A\{k}) for k=1,2,3,4. Writing p^B_k:=f_B({b}∪(A\{k})) and p^C_k:=f_C({c}∪(A\{k})), the 5‑vector p(Y_k) has two fixed coordinates (missing c gives p^B_k; missing b gives p^C_k) and three coordinates equal to the x_{ij} for {i,j}⊂A\{k}. D∈H iff for each k, p(Y_k) is not in the O5 orbit.
Proof. All 4‑sets contained in B or C are already fixed. The only 4‑sets not contained in B or C are precisely the six X_{ij}={i,j,b,c}. The only new 5‑subsets of A∪{b,c} (relative to B and C) are those that contain both b and c; there are exactly four, the Y_k. Their p‑vectors depend on the listed values. Avoidance of O5 on all 5‑sets is thus equivalent to the stated four constraints. ∎

Corollary 4 (Trivial one‑point cases |A|≤2).
If |A|≤2, then one‑point amalgamation always succeeds in H.
Proof. When |A|≤2 there are no 3‑subsets of A, hence no 5‑sets of the form {b,c}∪T with T⊂A of size 3. Thus there are no new 5‑set constraints; any assignment to cross 4‑sets yields an amalgam in H. ∎

Fact 5 (Switching yields a 4‑hypertournament but may change 5‑types).
For ε:V→{±1}, define f^ε(S):=(∏_{v∈S}ε(v))·f(S). Then f^ε encodes a 4‑hypertournament. However, for a fixed 5‑set X, switching at v∈X flips the four coordinates of p(X) corresponding to 4‑sets containing v and leaves the coordinate “missing v” unchanged; this can change the isomorphism type on X (e.g., an O5 representative (+,−,−,−,−) switches at its ‘+’ vertex to (+,+,+,+,+), a C5 representative). ∎

Lemma 6 (Explicit formula for the S5 action on 5‑vectors).
Let X be a 5‑set equipped with an increasing labeling {1,2,3,4,5}. For τ∈S5 and i∈{1,…,5}, write j:=τ^{-1}(i) and define
c_j(τ) := |{k<j : τ(k) > τ(j)}| + |{k>j : τ(k) < τ(j)}|.
In the isomorphism action on p∈{±1}^X given by p′_i = ε_i(τ)·p_{τ^{-1}(i)}, the sign factor is
ε_i(τ) = sgn(τ)·(−1)^{c_j(τ)}.
Proof. Let τ′ be the induced bijection from [5]\{j} to [5]\{i}. By definition, ε_i(τ)=sgn(τ′). The inversions of τ split into those not involving j (in bijection with inversions of τ′) and those involving j, whose number is c_j(τ). Hence inv(τ)=inv(τ′)+c_j(τ), so sgn(τ)=sgn(τ′)·(−1)^{c_j(τ)}. Rearranging gives the claimed formula. ∎

Corollary 7 (Product identity for ε‑factors).
For τ∈S5, one has ∏_{i=1}^5 ε_i(τ) = sgn(τ).
Proof. Using ε_i(τ) = sgn(τ)·(−1)^{c_{τ^{-1}(i)}(τ)} and that Σ_j c_j(τ) = 2·inv(τ), we get ∏_i ε_i(τ) = sgn(τ)^5 · (−1)^{2·inv(τ)} = sgn(τ). ∎

Lemma 8 (Central symmetry of the O5 orbit).
There exists τ∈S5 with ε_i(τ)=−1 for all i. In particular, for any 5‑vector p one has p∈O5 iff −p∈O5.
Proof. Take τ=(13) in one‑line notation [3,2,1,4,5]. A direct count shows c_j(τ) is even for all j, while sgn(τ)=−1, hence ε_i(τ)=−1 for every i. Since A_τ acts by signed relabeling, −O5=O5. ∎

Corollary 9 (Sign‑flip symmetry for local tables F).
Let F(α,β)⊆{±1}^3 be defined by: (x,y,z)∈F(α,β) iff (α,β,x,y,z) is non‑O5. Then
F(−α,−β) = { (−x,−y,−z) : (x,y,z)∈F(α,β) }.
Proof. (α,β,x,y,z) is non‑O5 iff (−α,−β,−x,−y,−z) is non‑O5 by Lemma 8. ∎

Lemma 10 (2+2 vertex signs induce (+−−)‑type on every triangle).
Let A={1,2,3,4} and choose w_i∈{±1} with exactly two plus and two minus. Define x_{ij}:=w_i w_j for 1≤i<j≤4. For each k∈A, on the triangle A\{k} the ordered triple of edge‑variables (in the fixed coordinate convention) is a permutation of (+,−,−).
Proof. If k is a + vertex, A\{k} contains one + and two −, giving products (−,−,+). If k is a − vertex, the products are (+,−,−). ∎

Proposition 11 (Conditional |A|=4 amalgamation via a uniform 2+2 ansatz).
Fix a consistent ordering convention for F(α,β). Suppose that for each (α,β)∈{++, +−, −+, −−}, all three permutations of (+,−,−) lie in F(α,β). Then for every one‑point diagram over |A|=4 there exists an amalgam D∈H obtained by setting x_{ij}=w_i w_j for some choice of w with exactly two + and two − on A.
Proof. By Lemma 10, each triangle contributes a permutation of (+,−,−), which by hypothesis is allowed in its table. ∎

Proposition 12 (Equal‑constant fixed pairs are solvable by a constant assignment).
In the |A|=4 one‑point problem, if (p^B_k,p^C_k)=(δ,δ) for all k with δ∈{±1}, then setting x_{ij}≡δ yields p(Y_k)=(δ,δ,δ,δ,δ)=±C5, hence D∈H.
Proof. Immediate. ∎

Lemma 13 (A hard local exclusion in the opposite‑fixed case).
In F(+,-), (−,−,−) is forbidden; by Corollary 9, (+++) is forbidden in F(−,+).
Proof. p=(+,-,−,−,−) is the canonical O5 representative. Negating gives the symmetric statement. ∎

Proposition 14 (The one‑point amalgamation over |A|=3 always succeeds, constructively).
Let A have size 3. Writing p(Y)=(α,β,x,y,z) in the fixed order, the following choices avoid O5:
- (α,β)=(+,+): (x,y,z)=(+,+,+) → p(Y)=C5.
- (α,β)=(−,−): (x,y,z)=(−,−,−) → p(Y)=−C5.
- (α,β)=(+,-): (x,y,z)=(+,-,+) → p(Y)=H5.
- (α,β)=(−,+): (x,y,z)=(−,+,−) → p(Y)=−H5.
Thus the |A|=3 one‑point step always succeeds. ∎

Proposition 15 (A solvable subclass for |A|=4 via a local H5 pattern with consistency).
With notation as in Proposition 3, suppose the type‑data satisfy α_1=α_2=α_3=α_4, β_1=α_3, β_4=α_2, β_2=β_3. Then there exists an assignment making each p(Y_k)=±C5 if α_k=β_k and ±H5 otherwise, hence an amalgam exists.
Proof. Define (x_{jℓ},x_{iℓ},x_{ij})=(α_k,β_k,α_k) for Y_k={b,c}∪{i,j,ℓ} with i<j<ℓ. The displayed equalities are exactly those needed for edge‑consistency. ∎

Lemma 16 (Union‑bound feasibility for the |A|=4 CSP).
If each Y_k forbids at most one ordered triple in its F‑table, then some assignment to the six x_{ij} satisfies all constraints.
Proof. Each forbidden triple rules out exactly 2^3 global assignments. With ≤1 forbidden per triangle, ≤4·2^3=32 assignments are ruled out among 2^6=64. ∎

Corollary 16.1 (A small‑table criterion for the |A|=4 step).
If |{±1}^3\F(+,+)| ≤ 1 and |{±1}^3\F(+,-)| ≤ 1, then every |A|=4 one‑point diagram has an amalgam (by Corollary 9 also covering F(−,−),F(−,+)). ∎

Lemma 17 (Global parity constraint across the four triangles).
In the |A|=4 CSP, the product of the triangle‑products over the four Y_k equals +1. In particular, an odd number of triangles cannot have triple‑product −1.
Proof. Each x_{ij} appears in exactly two triangles, contributing x_{ij}^2=1 to the total product. ∎

Lemma 18 (ε‑cocycle for composition).
For σ,τ∈S5 and i∈{1,…,5}, ε_i(σ∘τ) = ε_i(σ)·ε_{σ^{-1}(i)}(τ).
Proof. From the signed action A_ρ(p)_i=ε_i(ρ)p_{ρ^{-1}(i)} and uniqueness of the action. ∎

Lemma 19 (ε for adjacent transpositions).
For s_k=(k k+1), ε(s_k) has + at positions k,k+1 and − elsewhere.
Proof. Directly from Lemma 6 via the c_j counts and sgn(s_k)=−1. ∎

Lemma 20 (O5‑image formula and exact pair‑set membership test).
Let e_O=(+,-,-,-,-) and S:={ (ε(τ), i0=τ(1)) : τ∈S5 }. Then for p∈{±1}^5,
 p∈O5 ⇔ ∃(ε,i0)∈S s.t. p_i=ε_i for i=i0 and p_i=−ε_i for i≠i0.
Proof. If p=A_τ(e_O), then p_i=ε_i(τ) for i=i0 and p_i=−ε_i(τ) for i≠i0. Conversely, given (ε,i0) from τ, A_τ(e_O) has the stated coordinates. ∎

Corollary 20.1 (Product‑of‑entries identity for O5).
If p=A_τ(e_O), then ∏_{i=1}^5 p_i = sgn(τ).
Proof. From Lemma 20 and Corollary 7. ∎

Lemma 21 (Swap of fixed coordinates; central symmetry when α=β).
For all α,β and all (x,y,z),
 (x,y,z)∈F(α,β) ⇔ (−x,−y,−z)∈F(β,α).
In particular, F(α,α) is centrally symmetric.
Proof. Take τ=(12) with ε(τ)=(+,+,−,−,−). The action sends (α,β,x,y,z) to (β,α,−x,−y,−z). O5‑avoidance is invariant under A_τ. ∎

Lemma 22 (Internal generators preserving F(α,β)).
Within a fixed table F(α,β):
- S3: (x,y,z)∈F(α,β) ⇔ (−y,−x,z)∈F(α,β).
- S4: (x,y,z)∈F(α,β) ⇔ (x,−z,−y)∈F(α,β).
Proof. For τ=(34) and τ=(45), combine A_τ with Lemma 8. ∎

Lemma 23 (Swap of first and third triple coordinates within F(α,β)).
Within F(α,β), (x,y,z)∈F(α,β) ⇔ (z,y,x)∈F(α,β).
Proof. Apply S4, then S3, then S4. ∎

Corollary 23.1 (Orbit structure on {±1}^3 under S3/S4/swap within a fixed F(α,β)).
The set {±1}^3 splits into four orbits: for product +1, a size‑3 orbit {+++, +−−, −−+} and the singleton {−+−}; for product −1, a size‑3 orbit {−−−, ++−, −++} and the singleton {+−+}. ∎

Lemma 24 (An explicit forbidden triple in F(+,-)).
In F(+,-), the ordered triple (++−) is forbidden.
Proof. Take τ=(12)(34). A direct computation gives ε(τ)=(−,−,−,−,+) and i0=2. Then A_τ(e_O)=(+,-,+,+,−) shows (++−)∉F(+,-). ∎

Lemma 25 (Six allowed entries in F(+,+)).
In F(+,+), the six triples {+++, +−−, −−+, −−−, −++, ++−} are allowed.
Proof. (+++)∈F(+,+) by Proposition 14. Apply S4 to get (+,−,−)∈F(+,+), then Lemma 23 to get (−,−,+)∈F(+,+). By Lemma 21 (central symmetry for α=β), the negatives are also in F(+,+). ∎

Corollary 25.1 (At most two undecided entries in F(+,+)).
The only entries not decided by Lemma 25 are the singleton‑orbit pair {+−+, −+−}, which are either both allowed or both forbidden (by Lemma 21). ∎

Lemma 26 (The product −1 size‑3 orbit is forbidden in F(+,-)).
In F(+,-), each of (−−−), (++−), (−++) is forbidden. Moreover, (+−+) is allowed (Proposition 14).
Proof. Lemma 13 forbids (−−−). By Lemma 22, S3 sends (−−−) to (++−), and S4 sends it to (−++), so these are also forbidden. The allowance of (+−+) follows from Proposition 14. ∎
