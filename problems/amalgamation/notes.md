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
Additional clarifications, small lemmas, and symmetry for the 5-vector orbit

1) Semantics of the fixed bits p^B_k and p^C_k (|A|=4)
For B on A∪{b} and k∈A, define p^B_k:=f_B({b}∪(A\{k})). On the 5-set A∪{b}, the 5-vector p has entries p_x=f((A∪{b})\{x}). Thus for k∈A, p^B_k coincides with the coordinate “missing k” of p on A∪{b}: it records whether the increasing 4-tuple on {b}∪(A\{k}) is in R_B. Analogously p^C_k is the coordinate “missing k” of the 5-vector on A∪{c}.

2) Necessary local exclusions in the opposite-fixed case (rigorous justification)
- With (α,β,x,y,z)=(+;−;−,−,−) we obtain the canonical O5 representative; hence this triple is forbidden for (α,β)=(+,-).
- By central symmetry of the O5 orbit (see 4) below), (−;+;+,+,+) is also O5; hence forbidden for (α,β)=(−,+).
These give immediate unit tests for any IsO5 implementation and constraints for F(+,-) and F(−,+).

3) Edge/triangle viewpoint and the structured ansatz
- Place the six variables x_{ij} on the edges of K4 on A. The constraint Y_k uses the triangle on T=A\{k}.
- Structured ansatz: pick w_i∈{±1} on the vertices and set x_{ij}:=w_i w_j. For any triangle {i,j,k}, the triple (w_iw_j,w_iw_k,w_jw_k) has product +1, realizing exactly (+++),(+−−),(−+−),(−−+).

4) Central symmetry of the O5 orbit and a consequence for F(α,β)
There exists τ∈S5, e.g. τ=(13), with ε_i(τ)=−1 for all i (check via Lemma 6: c_j(τ) is even for every j and sgn(τ)=−1). Hence for any 5-vector p, p∈O5 iff −p∈O5. As a consequence, for the local tables F(α,β)⊆{±1}^3 (defined by p=(α,β,x,y,z) non-O5), one has
F(−α,−β) = { (−x,−y,−z) : (x,y,z)∈F(α,β) }.
Therefore it suffices to compute F(+,+) and F(+,-); the other two cases follow by triplewise negation. Do not assume any further symmetries (e.g., permutations of x,y,z or F(+,-)=F(−,+)) without verification.

5) On classifying |A|=4 instances
The constraint at each k depends on the ordered pair (p^B_k,p^C_k)∈{++,−−,+−,−+}. Reduction to the pure eq/opp pattern E={k: p^B_k=p^C_k} is insufficient unless one proves F(+,+)=F(−,−) and F(+,-)=F(−,+). Use the full type-vector in {++,−−,+−,−+}^A. By 4), it is enough to compute and store F(+,+), F(+,-), and infer the other two by negation.

6) Implementation checklist (precise conventions)
- Fix, once and for all, an ordering of the five vertices of each Y_k with the first two positions corresponding to the coordinates “missing c” and “missing b”, respectively, and the last three to the vertices of A\{k} in increasing order. Use the same convention for constructing p=(α,β,x,y,z) when populating F(α,β).
- Implement IsO5 via Lemma 6. Unit tests: (+,+,+,+,+) is non-O5; (+,−,−,−,−) is O5; (+,−,+,−,+) is non-O5. Report the orbit size and verify closure under the action.
- Compute F(+,+), F(+,-); obtain F(−,−), F(−,+) by triplewise negation. Conclude |A|=3 by listing one admissible triple for each (α,β).
- For |A|=4, enumerate realizable type-vectors from actual pairs (B,C) (both C5/H5, agreeing on A), and brute-force 2^6 assignments to x_{ij}. Archive SAT witnesses or UNSAT certificates. Test the ansatz x_{ij}=w_i w_j with w_i=p^B_i p^C_i across the same cases.

These additions lock down the symmetry that underlies Claim N1, correct the eq/opp reduction, and make the forthcoming computations unambiguous and reusable.
Uniform 2+2− assignment and a corrected conditional reduction for |A|=4

Ordering convention for local F-tables
- For any 5-set Y_k={b,c}∪(A\{k}) with A={1,2,3,4} and i<j<ℓ the increasing order on A\{k}, we use the coordinate order
  p(Y_k) = (p_{\text{missing }c}, p_{\text{missing }b}, p_{\text{missing }i}, p_{\text{missing }j}, p_{\text{missing }\ell}).
- With this convention, F(α,β)⊆{±1}^3 is the set of ordered triples (x,y,z) such that (α,β,x,y,z) is non-O5.

Lemma A (2+2 vertex-sign ansatz yields (+−−)-type on every triangle).
- Let w_i∈{±1} (i∈A) have exactly two + and two −, and set x_{ij}:=w_i w_j. For each k, the triple (x,y,z) contributed by the three edges inside A\{k} is, up to permutation of its three coordinates, of the form (+,−,−).
- Proof. If k is from the + vertices, then A\{k} contains {+,−,−}; the pairwise products are (−,−,+). If k is from the − vertices, then A\{k} contains {+, +, −}; the pairwise products are (+,−,−). In either case the unordered triple has one + and two −. The order within (x,y,z) depends on the fixed coordinate convention but is a permutation of (+,−,−). ∎

Corrected conditional reduction for |A|=4
- Conditional Proposition (uniform 2+2 ansatz). Fix the above ordering convention. Suppose that for each (α,β)∈{++, +−, −+, −−}, all three permutations of (+,−,−) lie in F(α,β). Then for every one-point instance over |A|=4 there exists an amalgam D in H obtained by the uniform assignment x_{ij}=w_i w_j with some w having exactly two + and two − on A.
  • Proof. By Lemma A, for every k the ordered triple on Y_k is a permutation of (+,−,−). By hypothesis, this ordered triple is in F(p^B_k,p^C_k) for each k, hence none of the four Y_k is O5, and D∈H. ∎
- Unconditional subcase (equal-constant fixed pairs). If (p^B_k,p^C_k)=(δ,δ) for all k (with δ∈{±1}), then the constant assignment x_{ij}≡δ makes every p(Y_k) equal to (δ,δ,δ,δ,δ), which is ±C5 and therefore non-O5. Hence an amalgam exists in this subcase.

Hard local exclusion in the opposite-fixed case
- For (α,β)=(+,-), the triple (−,−,−) is forbidden: p=(+,-,−,−,−) is the canonical O5 representative. By central symmetry of the S5 action, (+++) is forbidden for (α,β)=(−,+) as well. These serve as unit checks for IsO5 and constraints in populating F.

Notes on earlier claims
- The claim “(+++) is forbidden in F(+,-)” has not been proved. The argument via “flipping one coordinate” is not valid under the S5 signed action. Treat this as a computational check when populating F.

Computational checklist (precise and minimal)
1) Implement IsO5 via Lemma 6; unit tests: (+,+,+,+,+) non-O5; (+,−,−,−,−) O5; (+,−,+,−,+) non-O5. Report the size of the O5 orbit and closure under the action.
2) Compute F(+,+) and F(+,-) completely (8 triples each) under the above ordering; use Corollary 9 to derive F(−,−) and F(−,+) by triplewise negation. Do not assume S3-invariance.
3) Test the 12 memberships: for each (α,β)∈{++, +−, −+, −−}, verify that all three permutations of (+,−,−) lie in F(α,β).
4) If step 3 passes, conclude by the conditional proposition that the |A|=4 one-point step is uniformly solvable by a 2+2 ansatz; with Lemma 2 this yields AP.
5) If step 3 fails, run the 2^6 CSP for the offending type-profile to search for a different satisfying assignment or produce an UNSAT certificate (listing, for each assignment, a Y_k showing O5).

Implementation detail retained: the structured ansatz yields triangle triples of product +1, hence it can never realize (−,+,+) or (−,−,−). Keep this in mind when interpreting F-tables and debugging assignments.
Updates: explicit |A|=3 solution, concrete |A|=4 tests, and a solvable subclass

Coordinate convention reminder (used below)
- For Y_k={b,c}∪(A\{k}) with A={1,2,3,4} and i<j<ℓ the increasing order on A\{k}, we encode
  p(Y_k) = (p_{missing c}, p_{missing b}, p_{missing i}, p_{missing j}, p_{missing ℓ}).
- Mapping of the last three coordinates to edge variables on K4[A]:
  • p_{missing i} = x_{jℓ},  p_{missing j} = x_{iℓ},  p_{missing ℓ} = x_{ij}.

|A|=3 one‑point amalgamation solved (constructive)
- Let A have size 3. For Y=A∪{b,c} write p(Y)=(α,β,x,y,z) in the above order, where α is fixed by B (missing c), β by C (missing b), and x,y,z are the cross 4‑sets. The following choices always avoid O5:
  • (α,β)=(+,+): take (x,y,z)=(+,+,+) → p(Y)=(+,+,+,+,+)=C5.
  • (α,β)=(−,−): take (x,y,z)=(−,−,−) → p(Y)=(−,−,−,−,−)=−C5.
  • (α,β)=(+,-): take (x,y,z)=(+,-,+) → p(Y)=(+,-,+,-,+)=H5.
  • (α,β)=(−,+): take (x,y,z)=(−,+,−) → p(Y)=(−,+,−,+,−)=−H5.
  Hence the one‑point extension over |A|=3 always exists in H.

Concrete |A|=4 test profiles for the 2+2 ansatz (w=(+,+,−,−), x_{ij}=w_i w_j)
- Triangles (Y_k):
  • k=1: (x_{23},x_{24},x_{34})=(−,−,+) → p(Y_1)=(p^B_1,p^C_1,−,−,+).
  • k=2: (x_{13},x_{14},x_{34})=(−,−,+) → p(Y_2)=(p^B_2,p^C_2,−,−,+).
  • k=3: (x_{12},x_{14},x_{24})=(+,-,−) → p(Y_3)=(p^B_3,p^C_3,+,−,−).
  • k=4: (x_{12},x_{13},x_{23})=(+,-,−) → p(Y_4)=(p^B_4,p^C_4,+,−,−).
- Profiles to check via IsO5 (the first two coordinates are specialized as follows):
  • P1: p^B≡+, p^C≡+ → test (+,+,−,−,+) and (+,+,+,−,−).
  • P2: p^B≡+, p^C≡− → test (+,−,−,−,+) and (+,−,+,−,−).
  • P3: p^B≡+, p^C=(+,-,+,-) (aligned H5 on A∪{c}) → same two vectors as P2.
A single IsO5 pass on these four vectors settles P1–P3 for the 2+2 ansatz.

A solvable subclass for |A|=4 via a “local H5 witness” pattern
- Prescribe for each k a local triple (x_{jℓ}, x_{iℓ}, x_{ij}) = (α_k, β_k, α_k), where (α_k,β_k)=(p^B_k,p^C_k) and i<j<ℓ enumerate A\{k}.
- Shared‑edge consistency forces:
  • α_1=α_2=α_3=α_4;  β_1=α_3;  β_4=α_2;  β_2=β_3.
- If the given one‑point data (B,C) satisfy these equalities, then for each k we get p(Y_k)=(α_k,β_k,α_k,β_k,α_k), which is ±C5 if α_k=β_k, else ±H5. Hence an amalgam exists for this subclass.

Caveat on the LLL heuristic
- The symmetric LLL condition e·p·(d+1)≤1 with d=3 would require p≤1/(4e)≈0.091. If |{±1}^3\F(α,β)|≤1 then p=1/8≈0.125, which does not meet the symmetric bound. Treat any LLL‑based argument as heuristic unless we deploy a sharper criterion tailored to our dependency graph.

Actionable checklist (minimal computation to unblock |A|=4)
1) Implement IsO5 (Lemma 6), run unit tests, and report the O5 orbit size.
2) Test the four 5‑vectors from P1–P3 above.
3) Compute F(+,+) and F(+,-) fully (8 triples each) under the fixed ordering; obtain the other two by triplewise negation. Archive the tables.
4) If all permutations of (+,−,−) lie in each F(α,β), invoke Proposition 11 (uniform 2+2). Otherwise, brute‑force the 2^6 CSP per realized 4‑type profile and record SAT witnesses or an UNSAT certificate.
New rigorous tools and corrections (to be used going forward)

1) Union‑bound feasibility for the |A|=4 CSP
- Statement. In the |A|=4 CSP with six edge variables x_{ij} and four triangle constraints Y_k, if for each k the local table F(p^B_k,p^C_k) forbids at most one ordered triple (i.e., |{±1}^3\F(p^B_k,p^C_k)| ≤ 1), then there exists a satisfying global assignment.
- Reason. Each forbidden triple for a fixed triangle rules out exactly 2^3 global assignments (the other 3 edges are free). With at most one forbidden triple per triangle, at most 4·2^3=32 of the 64 assignments are excluded. Hence at least 32 assignments remain.
- Consequence. If a small computation confirms |{±1}^3\F(+,+)| ≤ 1 and |{±1}^3\F(+,-)| ≤ 1 (the other two cases follow by triplewise negation; Cor. 9), the |A|=4 step follows immediately without any 6‑variable search.

2) Specialization of the S5 action to the O5 representative (implementation aid)
- For e_O=(+,-,-,-,-) and τ∈S5 with ε(τ)=(ε_1,…,ε_5), let i0:=τ(1). Then the image p′ under the signed action satisfies p′_i = ε_i if i=i0 and p′_i = −ε_i otherwise. Equivalently, p′ is obtained from ε by flipping all coordinates except i0. Thus p∈O5 iff ∃ε∈E:={ε(τ):τ∈S5} and i0 with p_i=−ε_i for i≠i0 and p_{i0}=ε_{i0}.
- Note. This enables a very compact IsO5: precompute E (120 evaluations) and check the 5·|E| candidates.

3) Parity invariant across the four triangles
- For any assignment x_{ij}∈{±1}, the product of the triangle‑products over the four Y_k equals +1. Equivalently, an odd number of triangles cannot have triple product −1. Reason: each x_{ij} appears in exactly two triangle‑products.

4) Distribution of triangle triples under vertex‑sign assignments
- If x_{ij}=w_i w_j with w∈{±1}^A, then on any triangle the triple is either (+++) (when the three w are equal) or a permutation of (+,−,−) (otherwise). In particular: 4+/0− (or 0+/4−) yields four (+++); 3+/1− (or 1+/3−) yields exactly one (+++); 2+/2− yields no (+++) and all four triangles are permutations of (+,−,−).

Corrections to prior claims
- False: “If T_B=C5 then (p^B_k)_{k∈A} is constant; if T_B=H5 then it is 2+2.” Counterexample: for a C5 5‑set, the 5‑vector equals ε(τ) for some τ; e.g., τ=(12) gives ε=(+,+,−,−,−), which is not constant on A. Do not use this classification to prune cases.
- Unproved (and currently unknown): (+++)∉F(+,-). The argument that tried to force this from Lemma 8 incorrectly treats the free index i0. We keep only the rigorously proved exclusion (---)∉F(+,-) (output.md Lemma 13). The status of (+++) in F(+,-) must be decided computationally.

Coordinate convention (reminder)
- For Y_k={b,c}∪(A\{k}) with A={1,2,3,4} and i<j<ℓ the increasing order on A\{k}, we encode p(Y_k)=(p_{missing c}, p_{missing b}, p_{missing i}, p_{missing j}, p_{missing ℓ}), with p_{missing i}=x_{jℓ}, p_{missing j}=x_{iℓ}, p_{missing ℓ}=x_{ij}.

Actionable checklist (minimal computation to unblock |A|=4)
- Implement IsO5 using Lemma 6; validate unit tests: (+,+,+,+,+) ∉O5; (+,−,−,−,−) ∈O5; (+,−,+,−,+) ∉O5. Also verify the sample ε(τ) values listed in prior notes.
- Compute F(+,+) and F(+,-) completely (8 triples each) under the fixed coordinate order; derive F(−,−), F(−,+) by triplewise negation. Report sizes and explicit complements.
- If both complements have size ≤1, conclude |A|=4 by the union‑bound lemma and hence AP via Lemma 2. If, stronger, both F tables are exactly “triple product +1,” record the uniform construction x_{ij}=w_i w_j and close.
- If not, test whether all permutations of (+,−,−) lie in F(+,+) and F(+,-); if yes, apply Proposition 11 (uniform 2+2). Otherwise brute‑force the 2^6 CSP on the realized profiles, using the parity invariant to prune, and archive SAT/UNSAT witnesses.
O5 membership: exact S‑criterion vs. ε‑only heuristics
- Exact criterion (to be used for IsO5). Let e_O=(+,-,-,-,-), and define the pair‑set
  S := { (ε(τ), i0=τ(1)) : τ ∈ S_5 },
  where ε(τ) is as in Lemma 6. Then for p∈{±1}^5,
  p ∈ O5 ⇔ ∃(ε,i0)∈S such that p_i = ε_i for i=i0 and p_i = −ε_i for i≠i0.
  Equivalently, p is obtained from ε by “flipping all coordinates except i0,” with (ε,i0) realized by the same τ. This is the specialization of the action to e_O and is both necessary and sufficient.

- ε‑only heuristics (use with caution). Two convenient tests are often useful but are not sufficient on their own:
  • Hamming‑1: Hamming(−p, ε) = 1 for some ε ∈ E := {ε(τ) : τ∈S_5}.
  • Inner‑product −3: Σ_i p_i ε_i = −3 for some ε∈E (equivalently to Hamming‑1).
  These conditions are necessary for O5 membership but not sufficient unless the unique discrepancy index i0 is consistent with i0=τ(1) for the same τ realizing ε. Hence, they can give false positives. Always validate by checking the pair (ε,i0)∈S.

ε‑cocycle and generators (implementation aids)
- Cocycle identity. For σ,τ∈S_5 and i∈[5]:
  ε_i(σ∘τ) = ε_i(σ) · ε_{σ^{-1}(i)}(τ).
  This follows by composing the signed actions (Lemma 6) and comparing with the action of σ∘τ.

- Adjacent transpositions. For s_k=(k k+1) (k=1,2,3,4),
  ε(s_k) has + at positions k and k+1 and − elsewhere.
  This is a direct computation from Lemma 6 via the c_j counts and is a robust generator datum for building E and S by BFS on the Cayley graph of S_5.

Practical S‑oracle blueprint
- Build S by BFS over right‑multiplication by s_k, storing for each state (τ) the pair (ε(τ), i0=τ(1)). Update via the cocycle and track i0′=τ(s_k(1)). Verify: |S|=120; sample ε values on generators; product identity ∏_i ε_i(τ)=sgn(τ) (Cor. 7).
- IsO5(p): return true iff ∃(ε,i0)∈S with p_i=ε_i for i=i0 and p_i=−ε_i otherwise.

Local F‑tables and the |A|=4 plan
- Compute F(+,+) and F(+,-) by 8 exact IsO5 calls each on p=(α,β,x,y,z) under the fixed coordinate order (reminder in output.md). Derive F(−,−) and F(−,+) by triplewise negation (Cor. 9). Confirm the |A|=3 witnesses (Proposition 14) show up as allowed entries in the appropriate tables.
- Decision routes:
  • If |{±1}^3\F(+,+)| ≤ 1 and |{±1}^3\F(+,-)| ≤ 1, conclude |A|=4 by Cor. 16.1.
  • If, stronger, all three permutations of (+,−,−) lie in F(+,+) and F(+,-), conclude by Proposition 11 (uniform 2+2).
  • Otherwise, run the 2^6 CSP per realized profile, pruning by the parity invariant (Lemma 17).

Unit checks for the oracle
- Mandatory: (+,−,−,−,−) ∈ O5; (+,+,+,+,+) ∉ O5; (+,−,+,−,+) ∉ O5. Also verify ε(s_k) as above and closure properties from Lemma 6/Cor. 7.

Caveat
- Do not treat “ε only” rules (Hamming‑1 or inner‑product −3) as definitive. They are helpful filters but must be validated against the S‑pair constraint to avoid false positives.
New internal symmetries for F(α,β), concrete exclusions, and a correction about 2+2 shapes

Internal S5-induced symmetries of the local tables
- Let F(α,β)⊆{±1}^3 be defined under the fixed coordinate convention: (x,y,z)∈F(α,β) iff (α,β,x,y,z) is non‑O5.
- Lemma 21 (swap of the fixed coordinates; central symmetry when α=β). For all α,β and all (x,y,z),
  (x,y,z)∈F(α,β) ⇔ (−x,−y,−z)∈F(β,α).
  In particular, F(α,α) is centrally symmetric: t∈F(α,α) ⇔ −t∈F(α,α).
  Sketch: Apply τ=(12) (ε=(+,+,−,−,−) by Lemma 19) and use O5‑invariance under A_τ.
- Lemma 22 (internal generators preserving (α,β)). Within a fixed table F(α,β), membership is preserved by the transformations
  • S3: (x,y,z)↦(−y,−x,z) (from τ=(34) + global sign symmetry),
  • S4: (x,y,z)↦(x,−z,−y) (from τ=(45) + global sign symmetry).
- Lemma 23 (swap of first and third triple coordinates). Within F(α,β), (x,y,z)∈F(α,β) ⇔ (z,y,x)∈F(α,β). Proof: compose S4, then S3, then S4.
- Consequence: The action generated by S3, S4, and (x,y,z)↦(z,y,x) preserves the triple‑product and partitions {±1}^3 into four orbits: for product +1, an orbit of size 3 {+++, +−−, −−+} and a fixed singleton {−+−}; for product −1, an orbit of size 3 {−−−, ++−, −++} and a fixed singleton {+−+}. Thus, per table, it suffices to test at most four representatives, e.g. (+++), (+−−), (−−−), (+−+). When α=β, the central symmetry of Lemma 21 reduces the representatives further.

Concrete forbidden triples (with explicit τ‑witnesses)
- In F(+,-): (++−) is forbidden. Witness: τ=(12)(34) has ε=(−,−,−,−,+) and i0=τ(1)=2. Then A_τ(e_O)=(+,−,+,+,−), i.e. (α,β,x,y,z)=(+,-,+,+,−) is O5, so (++−)∉F(+,-).
- In F(+,+): (−,+,+) is forbidden. Witness: τ=(13) has ε=(−,−,−,−,−) (cf. Lemma 8) and i0=3. Then A_τ(e_O)=(+,+,−,+,+), so (−,+,+)∉F(+,+). By Lemma 21 (α=β), (+,−,−) is also forbidden in F(+,+).

Correction about realized permutations under the 2+2 ansatz
- The 2+2 vertex‑sign ansatz (x_{ij}=w_i w_j with w having two + and two −) produces on each triangle a permutation of (+,−,−) (Lemma 10). However, contrary to an earlier claim, the specific permutation (−,+,−) can occur for some choices of w under our fixed coordinate order. Example: w=(+,-,+,-) and k=4 yield (x_{23},x_{13},x_{12})=(−,+,−).
- A safe specialization: if we commit to the fixed choice w=(+,+,−,−) (or symmetrically w=(−,−,+,+)), then one checks explicitly that Y_1,Y_2 realize (−,−,+) while Y_3,Y_4 realize (+,−,−). Under this restriction, Lemma 23 guarantees that the two realized shapes are equivalent within each F(α,β), reducing checks to a single representative per base table.

Minimal computation plan (refined by symmetries)
- Implement IsO5 via Lemma 20 and validate using the sample (ε,i0) pairs and the product invariant ∏ p_i = sgn(τ).
- Populate F(+,+), F(+,-) by testing only the four representatives (+++), (+−−), (−−−), (+−+) per table; recover the rest by Lemmas 21–23 and Cor. 9. Derive F(−,−), F(−,+) by Cor. 9.
- If |{±1}^3\F(+,+)|≤1 and |{±1}^3\F(+,-)|≤1, conclude by Cor. 16.1. Otherwise, try the fixed 2+2 choice w=(+,+,−,−) and check (+,−,−)∈F(+,+) and (+,−,−)∈F(+,-); if both hold, all four Y_k are allowed by Lemma 23. Failing that, run the tiny backtracking solver with parity pruning (Lemma 17).
Key correction: retract Lemma 24(b) and its consequences
- Lemma 24(b) in output.md (“(−,+,+)∉F(+,+)”) contradicts the already-proved symmetries. Indeed, (+++)∈F(+,+) by Proposition 14; applying S4 then Lemma 23 yields (+,−,−) and (−,−,+) in F(+,+); central symmetry for α=β (Lemma 21) then yields (−,+,+)∈F(+,+). Therefore 24(b) is false and must be removed.

Orbit structure inside each local table F(α,β)
- The operations S3: (x,y,z)↦(−y,−x,z), S4: (x,y,z)↦(x,−z,−y), and the swap (x,y,z)↦(z,y,x) (Lemmas 22–23) preserve membership in a fixed F(α,β) and partition {±1}^3 into four orbits:
  • product +1: size-3 orbit {+++, +−−, −−+} and singleton {−+−};
  • product −1: size-3 orbit {−−−, ++−, −++} and singleton {+−+}.

New rigorous consequences (to be used going forward)
- F(+,+): Six entries are provably allowed
  From (+++)∈F(+,+) (Proposition 14), S4 and Lemma 23 give (+,−,−) and (−,−,+), and by central symmetry for α=β (Lemma 21) their negatives are also allowed. Hence
  {+++, +−−, −−+, −−−, −++, ++−} ⊆ F(+,+).
  The only undecided entries in F(+,+) are the central-symmetry pair {+−+, −+−}.

- F(+,-): The product −1 size-3 orbit is forbidden; (+−+) is allowed
  Lemma 13 forbids (−−−) in F(+,-). By Lemma 22, S3/S4 carry (−−−) to (++−) and (−++), so these are also forbidden. Meanwhile, (+−+) is allowed by Proposition 14 (|A|=3). Thus the entire product −1 slice of F(+,-) is decided.
  Remaining unknowns in F(+,-): the product +1 size-3 orbit (represented by +++) and the singleton (−+−). Two IsO5 queries suffice to finish F(+,-). By Corollary 9, F(−,+) follows by triplewise negation.

Caveat and refinement for the 2+2 ansatz
- A 2+2 assignment x_{ij}=w_i w_j produces, on each triangle, some permutation of (+,−,−) (Lemma 10). For triangles with pair type (−,+), membership of a triple t in F(−,+) is equivalent to membership of −t in F(+,-) (Corollary 9). Since −t has product −1, and we now know the product −1 orbit O− is forbidden in F(+,-) except for (+−+), it follows that an (−,+)-type triangle can only accept the permutation (−,+,−). Consequently:
  • The “fixed” choice w=(+,+,−,−) (which realizes only (+,−,−) and (−,−,+)) may fail whenever (−,+)-type triangles occur.
  • A different 2+2 choice (e.g., w=(+,-,+,-)) realizes (−,+,−) on some triangles, so an appropriate placement of the two plus signs might satisfy all four triangles if the relevant entries are allowed in their tables. This is a small selection/backtracking problem over the 2+2 placements, not a proof that any one fixed w suffices.

Actionable checklist
1) Update output.md: remove 24(b); add the two new lemmas stated above.
2) Implement the exact S-oracle (Lemma 20). Unit tests: (+,−,−,−,−)∈O5; (+,+,+,+,+)∉O5; (+,−,+,−,+)∉O5; ε-cocycle (Lemma 18); product identity (Cor. 7 and Cor. 20.1); S3/S4/swap invariances (Lemmas 21–23).
3) Decide F(+,-) by testing (+++) and (−+−); derive F(−,+) by triplewise negation. Optionally decide the two singleton entries in F(+,+).
4) With all four F-tables complete, try 2+2 placements w that assign to each triangle an allowed permutation. If any instance resists, run the tiny 2^6 backtracking with parity pruning (Lemma 17).

Structural corollary to record
- For α=β, F(α,α) is centrally symmetric (Lemma 21). Hence the size of its complement is even. This is a small but useful invariant when finishing F(+,+).
