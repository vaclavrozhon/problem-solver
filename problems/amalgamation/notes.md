Set‑up and notations (agreed baseline)
- 4‑hypertournament on finite V: equivalent to a function f:[V]^4→{±1}. For an ordered 4‑tuple (x1,x2,x3,x4) with underlying set S, we declare (x1,x2,x3,x4)∈R iff the permutation from the increasing ordering of S to (x1,…,x4) has sign equal to f(S). This satisfies (i) tuples have distinct entries, (ii) closure under even permutations, (iii) exactly one of (x1,x2,x3,x4) and (x2,x1,x3,x4) lies in R.
- For a 5‑set X, define its 5‑vector p(X)∈{±1}^X by p_x:=f(X\{x}). Isomorphisms act by p↦(ε_i(τ)·p_{τ^{-1}(i)}) with ε_i(τ)=sign of τ restricted to X\{τ^{-1}(i)}. The three isomorphism types on 5 points are denoted C5, H5, O5. For computation we may use representatives C5=(+,+,+,+,+), O5=(+,-,-,-,-), H5=(+,-,+,-,+); the orbit relation is determined by the above action (not by raw counts of pluses).

One‑point amalgamation reduction
- AP for H (class of finite 4‑hypertournaments with no induced O5) reduces to the one‑point case: Given A∈H, B=A∪{b}∈H, C=A∪{c}∈H with B∩C=A, existence of D on A∪{b,c} in H extending B and C implies full AP by iteratively adding the vertices of C\A to B.

CSP for the minimal nontrivial one‑point case |A|=4
- Fix A={1,2,3,4}, b=5, c=6. The only undetermined f‑values are the six cross 4‑sets X_{ij}={i,j,5,6} (1≤i<j≤4). Let variables x_{ij}:=f(X_{ij})∈{±1}.
- The only potentially new 5‑sets are Y_k:={5,6}∪(A\{k}) for k∈{1,2,3,4}. For each k, p(Y_k) has two fixed coordinates: p missing 6 equals p^B_k:=f_B({5}∪(A\{k})), and p missing 5 equals p^C_k:=f_C({6}∪(A\{k})); and three variable coordinates drawn from {x_{ij}} on the three pairs inside A\{k}:
  • Y_1 depends on {x_{23},x_{24},x_{34}}
  • Y_2 depends on {x_{13},x_{14},x_{34}}
  • Y_3 depends on {x_{12},x_{14},x_{24}}
  • Y_4 depends on {x_{12},x_{13},x_{23}}.
- Constraint: For each k, p(Y_k) must not lie in the O5‑orbit. This is the complete constraint system for the one‑point amalgam over A of size 4.

Base sizes |A|≤2 and |A|=3
- |A|≤2: There are no 5‑sets Y; any assignment to cross 4‑sets works, so one‑point amalgamation always succeeds.
- |A|=3: There is exactly one 5‑set Y=A∪{b,c}, with two fixed coordinates (those missing b and c) and three unknowns (those missing each a∈A). We expect (and plan to verify computationally) that for every (α,β)∈{±1}^2 at least one of the 8 assignments to the three unknowns avoids the O5 orbit. This settles one‑point amalgamation at size 3 once verified.

Switching: what it does and what it does not
- For ε:V→{±1}, define f^ε(S):=(∏_{v∈S}ε(v))·f(S). Then f^ε encodes another 4‑hypertournament.
- Caution: For a fixed 5‑set X, switching at a vertex v∈X flips the four coordinates of p(X) corresponding to the 4‑sets that contain v and leaves the coordinate “missing v” unchanged. This can change the 5‑type: e.g., (+,-,-,-,-) (an O5 representative) switches at the ‘+’ vertex to (+,+,+,+,+) (a C5 representative). Thus switching is not a valid normalization trick for fixed one‑point data (B,C) in H.

Computational plan (to settle |A|=3 and |A|=4)
- Step A: Compute the O5 orbit via the S5 action above; implement IsO5(p).
- Step B (|A|=3): For each (α,β), enumerate the 8 triples, test IsO5, and record that at least one choice avoids O5.
- Step C (|A|=4): Enumerate compatible (B,C) (both of type C5 or H5, agreeing on f(A)), form p^B_k,p^C_k (k=1..4), and brute‑force the 2^6 choices of x_{ij}, rejecting any assignment for which some Y_k is O5. Record either a counterexample or certify all cases pass.
- Precompute F(α,β)⊆{±1}^3: the allowed triples for a 5‑set with given two fixed coordinates. Then the |A|=4 CSP checks membership of the four triangle‑triples in F(p^B_k,p^C_k).

Constructive ansatz to test
- Try x_{ij}=w_iw_j with w_i:=p^B_i·p^C_i for i∈A. For T={i,j,k} this gives a triple (w_iw_j,w_iw_k,w_jw_k) of product +1. If this never yields O5 for any (p^B_k,p^C_k), it provides a uniform construction for all |A| (worth testing; not proved).