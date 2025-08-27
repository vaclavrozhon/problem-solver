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
Addendum: explicit S5 action, corrections, and computation plan

1) Explicit ε-formula for the S5 action (implementation aid)
For τ ∈ S5 and i ∈ {1,…,5}, write j := τ^{-1}(i) and define
c_j(τ) := |{k<j : τ(k) > τ(j)}| + |{k>j : τ(k) < τ(j)}|.
Then the sign multiplier in the action p′_i = ε_i(τ)·p_{τ^{-1}(i)} equals
ε_i(τ) = sgn(τ)·(−1)^{c_j(τ)}.
Sketch of justification: Let τ′ be the induced bijection from [5]\{j} to [5]\{i}. Its inversion count is inv(τ′) = inv(τ) − c_j(τ) because the inversions of τ decompose into those not involving j (which biject with the inversions of τ′) and those involving j (counted by c_j). Hence sgn(τ′) = (−1)^{inv(τ′)} = (−1)^{inv(τ)−c_j} = sgn(τ)·(−1)^{c_j}. By definition ε_i(τ) = sgn(τ′). A immediate corollary is the product identity ∏_{i=1}^5 ε_i(τ) = sgn(τ), since Σ_j c_j(τ) = 2·inv(τ).

Practical note: This eliminates ambiguity about ε and supports a robust IsO5 enumerator.

2) Correction to the “fully aligned” claim
The statement “If p^B_k = p^C_k for all k then setting all x_{ij}=δ makes p(Y_k) constant δ for all k” is false unless the common pattern (p^B_k)_{k∈A} is itself constant with value δ. Counterexample: take p^B=p^C=(+,+,−,+) and δ=+. Then for k=3 the fixed coordinates are (−,−) while the three variables are +, so p(Y_3) is not constant. A correct (weaker) statement is: if p^B_k = p^C_k = δ for all k, then x_{ij}≡δ makes every p(Y_k) constant δ, hence non-O5.

3) F(α,β) tables: compute all four cases
Define F(α,β) ⊆ {±1}^3 as the set of triples (x,y,z) for which p=(α,β,x,y,z) is non-O5. Do not assume F(+,+)=F(−,−) or F(+,-)=F(−,+) a priori; compute all four cases. This is an 8×4=32-evaluation task. Record each F(α,β) explicitly along with any observed symmetries (e.g., invariance under permuting x,y,z).

Consequence: |A|=3 reduces to checking that for each (α,β) there exists at least one triple in F(α,β). Archive one such triple per case.

4) |A|=4 CSP protocol (profiles and ansatz)
- Use the already-recorded CSP with variables x_{ij} on the six edges of K4 and four constraints Y_k. For any concrete pair (B,C) over A with B∩C=A and both omitting O5, determine the four pairs (p^B_k,p^C_k) and require the corresponding triangle-triple to lie in F(p^B_k,p^C_k).
- Profiles to test early:
  • P1: p^B≡+, p^C≡+. The corrected alignment lemma (constant case) gives the assignment x_{ij}≡+.
  • P2: p^B≡+, p^C≡−. Try the perfect-matching assignment x_{12}=x_{34}=+, others −; check all four Y_k via IsO5.
  • P3: p^B≡+, p^C drawn from an H5 labeling consistent on A; try ansatz x_{ij}=w_i w_j with w_i=p^B_i p^C_i.
  • P4: both sides H5 aligned on A; by the corrected alignment lemma with δ=+, x_{ij}≡+ works if the common 4-bit pattern on A is constant +.
- Constructive ansatz: x_{ij}:=w_i w_j where w_i:=p^B_i p^C_i. For T={i,j,k}, the triple is (w_i w_j, w_i w_k, w_j w_k) with product +1. Test this uniformly across enumerated cases; if it always avoids O5, it suggests a uniform construction for general |A|.

5) Unit tests for IsO5
- p=(+,+,+,+,+) should classify non-O5; p=(+,−,−,−,−) should classify O5; p=(+,−,+,−,+) should classify non-O5 (H5). Also verify that for a transposition τ, ∏_i p′_i flips sign (product identity) and that orbit membership is invariant under the action.

6) Checklist for the next round
- Implement IsO5 with the ε-formula; report the size of the O5 orbit found by enumeration.
- Compute and list F(α,β) for all four cases; confirm |A|=3.
- Run the |A|=4 CSP on P1–P4 first, then extend to representatives modulo S4 on A; archive satisfying/unsatisfying assignments.
- Report whether the ansatz x_{ij}=w_i w_j succeeds in all tested instances.
