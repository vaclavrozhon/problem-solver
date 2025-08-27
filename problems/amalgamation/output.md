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
For ε:V→{±1}, define f^ε(S):=(∏_{v∈S}ε(v))·f(S). Then f^ε encodes a 4‑hypertournament. However, for a fixed 5‑set X, switching at v∈X flips the four coordinates of p(X) corresponding to 4‑sets containing v and leaves the coordinate “missing v” unchanged; this can change the isomorphism type on X (e.g., an O5 representative (+,-,-,-,-) switches at its ‘+’ vertex to (+,+,+,+,+), a C5 representative). ∎