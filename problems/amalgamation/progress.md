## Round 0001 — 2025-08-27T14:25:45.772874Z

Status of outputs.md: Not provided. I cannot check for gaps there.

Goal: Decide whether H (finite 4-hypertournaments with no O_5) has the amalgamation property (AP). I aim to make incremental, auditable progress. Below I formalize the problem in a way that reduces AP to a finite local constraint problem, isolate “one-point amalgamation”, and give tools/lemmas and a concrete computational plan that the verifier can run. I also point out promising directions (and risks) toward a proof or counterexample.

1) Reformulation via alternating 4-forms
- A 4-hypertournament on a finite set V can be encoded by an alternating ±1-valued function f on ordered 4-tuples:
  f(x1,x2,x3,x4) = +1 iff (x1,x2,x3,x4) ∈ R; and for any permutation σ ∈ S4,
  f(x_{σ(1)},...,x_{σ(4)}) = sgn(σ) · f(x1,...,x4).
  This is just condition (2)+(3) restated: odd permutations flip membership; even preserve.
- For each 5-element set Y = {y1,...,y5}, define its “5-vector” s(Y) = (s1,...,s5) by si = f(Y\{yi}) computed on the increasing order of Y\{yi}. This depends on the chosen linear order on Y, but isomorphism type of the induced 5-vertex substructure is independent of order and is one of three: C5, H5, or O5 (given in the problem).
- H consists of those structures in which, for every 5-subset Y, the restriction is isomorphic to C5 or H5 (never O5).

2) Switching at a vertex (useful normalization tool)
- Define: “Switching at v” toggles the sign of f on every ordered 4-tuple that contains v (equivalently, multiply f by -1 on those 4-sets and leave others unchanged). Formally, for ε:V→{±1}, define the switched f^ε by
  f^ε(x1,x2,x3,x4) = (ε(x1)ε(x2)ε(x3)ε(x4)) · f(x1,x2,x3,x4).
- Lemma (Switching lemma): Switching preserves the 4-hypertournament axioms. Moreover, for a fixed 5-set Y, applying a switch on any vertex of Y takes a 5-type C5 to H5 or C5 (depending on which vertex), and never to O5; similarly switching preserves being O5 vs non-O5.
  Proof sketch: Alternation under S4 is preserved since we multiply f by a product that is invariant under even permutations and flips under odd permutations exactly once per coordinate involved; the local 5-type class C5∪H5 is the switching orbit avoiding O5 (known in oriented matroid folklore on 5 elements; see Note at end for a computation plan to verify this fact explicitly).
- Why useful: It shows forbidding O5 is invariant under switching. When seeking amalgams, one can sometimes normalize local data by pretending to switch on yet-unknown vertices (conceptually) to reduce cases, while remembering that B and C are fixed (so actual switches cannot be applied to them—this is just a reasoning aid).

3) Reduction of AP to one-point amalgamation
- Standard reduction for relational languages with local (finite) constraints: It suffices to check amalgamation when C is obtained from A by adding a single new vertex, and similarly B (so-called one-point amalgamation). If one-point amalgamation always works inside H, then by adding the vertices of C\A one by one to B and extending at each step, we construct D containing both B and C.
- In our setting, the only potential new forbidden substructures when we add one vertex c to A∪{b} arise on 5-sets of the form Y_T := T ∪ {b,c} where T ranges over 3-subsets of A. All 5-sets contained entirely in B or entirely in C are already in H by assumption.

4) The one-point amalgamation constraint system
- Fix A, |A|=m≥3, and suppose B = A ∪ {b} and C = A ∪ {c} are in H (so A is an induced common substructure).
- For each T ∈ [A]^3 (3-subsets), consider the 5-set Y_T := T ∪ {b,c}. The 4-subsets of Y_T are:
  • Δ_b := Y_T\{b} = {c} ∪ T, whose sign is fixed by C; write α(t) for this sign, where t is the unique element of A\T (so T = A\{t}).
  • Δ_c := Y_T\{c} = {b} ∪ T, fixed by B; write β(t) analogously (again t = A\T).
  • For each x ∈ T, Δ_x := Y_T\{x} = {b,c} ∪ (T\{x}). These are cross 4-sets not in B or C; their signs are our decision variables.
- Thus the unknowns are the signs z_P ∈ {±1} for each pair P ∈ [A]^2, interpreted as z_{ij} = sign on the 4-set {b,c,i,j} ordered increasingly. For a given T = {i,j,k} = A\{t}, the triple of unknowns entering Y_T is (z_{ij}, z_{ik}, z_{jk}). The fixed pair for Y_T is (α(t), β(t)).
- Constraint: For each t ∈ A, the 5-vertex structure on Y_T with the above five signs must be isomorphic to C5 or H5 (i.e., not O5). This gives 4 constraints when |A|=4 (the minimally nontrivial one-point case) on the 6 variables z_{ij}, and in general (m choose 3) constraints on (m choose 2) variables.
- This is a finite constraint satisfaction problem (CSP) depending only on the two 5-types B and C over A.

5) Two immediate base cases
- Trivial cases for one-point amalgamation:
  • If |A| ≤ 2: There is no 5-set Y_T at all, so any assignment of cross 4-sets works. Hence one-point amalgamation holds.
  • If |A| = 3: There is exactly one Y = A ∪ {b,c}, with two fixed signs α,β and three unknowns. At least one assignment of the three unknowns avoids O5, because the number of O5 realisations among the 2^3 possible triples is strictly less than 8 (details can be verified computationally from the explicit 5-type templates below). This delivers one-point amalgamation for |A|=3.
  Action item for verifier: Explicitly enumerate the orbit of O5 under all 120 relabelings (using the canonical labeled template described in §6) and count, for each fixed pair (α,β), how many 3-bit triples produce O5. It should be < 8 for all 4 pairs (α,β), completing a rigorous proof for |A|=3.

6) Concrete canonical 5-type templates (for computation)
- We need explicit labeled representatives of C5, H5, O5 to feed into the CSP described above. The problem statement already provides a convenient encoding: “positive vertices” among {1,2,3,4,5} equal the indices i such that the increasing 4-tuple (1,...,i-1,i+1,...,5) is in R.
- Choose the following explicit labeled representatives:
  • C5: positive set S_C = ∅.
  • H5: positive set S_H = {1,3,5}.
  • O5: positive set S_O = {2}.
- From any such positive set S ⊆ {1,...,5}, define the 5-vertex 4-hypertournament R_S by: For a 4-tuple whose underlying set is {1,...,5}\{i}, the increasing 4-tuple is in R_S iff i ∈ S; then close under even permutations and exclude the odd ones.
- Note: Different enumerations of the same unlabeled 5-type correspond to relabeling the vertices by a permutation π ∈ S5. Our “switching at a vertex” (ε) operation is also available to generate variants. The type classification is the orbit under isomorphisms; O5’s orbit should be disjoint from the union of C5’s and H5’s orbits even after switching, which the verifier can confirm by enumeration.

7) Computational test for |A|=4 (minimal nontrivial one-point case)
- Fix A = {1,2,3,4}. Let B be a 5-vertex 4-hypertournament on {1,2,3,4,b} that is either C5 or H5; similarly C on {1,2,3,4,c}. They must agree on A (i.e., the sign on the ordered 4-tuple (1,2,3,4) must be the same in both B and C). This determines β(∙) = signs for {b}∪(A\{t}) inside B, and α(∙) analogously from C.
- Unknowns: z_{12}, z_{13}, z_{14}, z_{23}, z_{24}, z_{34} ∈ {±1}.
- Constraints: For t ∈ {1,2,3,4}, define T = A\{t} (a 3-subset). Consider the 5-set Y_T = T ∪ {b,c}. Its five “coordinates” (in the sense of §4) are the triple (z_ij) over pairs in T and the fixed pair (α(t),β(t)). We must ensure that Y_T is isomorphic to C5 or H5 (i.e., its labeled 5-vector lies in the orbit of S_C or S_H under relabeling and switching). Equivalently, the triple (z_ij) must lie in an allowed set F_t(α(t),β(t)), which is the projection of the C5∪H5 orbit for those two fixed coordinates.
- Decision procedure:
  1. Enumerate all labeled B of type C5 or H5 on {1,2,3,4,5} that realize both possibilities for the sign on the A 4-tuple (delete 5), then rename 5→b. Similarly enumerate all labeled C on {1,2,3,4,6}, rename 6→c. This yields all possibilities for (α,β) patterns consistent with H.
  2. For each pair (B,C), form the allowed sets F_t(α(t),β(t)) for t=1..4 by enumerating all relabelings π of the canonical C5 and H5 templates in §6 and recording the triples of coordinates corresponding to the three T-coordinates when the two fixed coordinates are forced to equal (α(t),β(t)). Switching operations at any of the five vertices can be included to enlarge the allowed set if we treat “switching” as preserving the C5∪H5 class.
  3. Solve the 6-variable CSP: choose z_{ij} ∈ {±1} so that for all four t, the triple over pairs in T lies in F_t.
  4. If for some (B,C) this CSP is unsatisfiable, we have a concrete counterexample to AP (|A|=4), hence H fails AP. If all CSPs are satisfiable for |A|=4, this strongly suggests one-point amalgamation holds at this size; see §8 for extending to larger |A|.
- This is a tiny search (bounded by a few hundred cases) and should be readily machine-checkable.

8) Extending beyond |A|=4
- If one-point amalgamation holds for |A|=4 (and |A|≤3 is already settled), I conjecture it holds for all |A|, via the same CSP approach: variables z_P for P∈[A]^2, constraints per T∈[A]^3 that the 5-set on T∪{b,c} is in C5∪H5. This is a (m choose 2)-variable CSP with (m choose 3) local constraints, each depending on exactly three variables. A general existence theorem (e.g., a version of the Lovász Local Lemma) could apply if, for a random assignment, each local bad event (becoming O5) has probability < 1/4 and dependency is bounded by O(m); but we need the exact count of forbidden triples per (α,β) to use LLL. Alternatively, a direct constructive assignment might exist (see next bullet).
- Constructive Ansatz to test: z_{ij} := w_i w_j where w_i := β(i) α(i) for i ∈ A. Then for T={i,j,k}, the triple equals (w_i w_j, w_i w_k, w_j w_k), which automatically has product +1. Hypothesis: For any (α,β), the induced 5-set Y_T with triple (w_i w_j, w_i w_k, w_j w_k) and fixed pair (α(t),β(t)) cannot be O5. If true, this gives a uniform solution for all |A|. This hypothesis is natural from “switching/chirotope” heuristics, but I do not claim it as proven here. It is amenable to computational verification in the |A|=4 case; if it passes, we gain strong evidence and a template for a general proof.

9) What would falsify AP?
- To refute AP, it suffices to find |A|=4 and B,C∈H over A such that the 6-variable CSP has no solution. By the above algorithm, this reduces to finite explicit checking. If such a pair exists, AP fails.
- Heuristic reason it might fail: Although forbidding O5 is a local 5-set condition, it imposes nontrivial compatibility across overlapping 5-sets. This is reminiscent of oriented matroid Grassmann–Plücker constraints, which are not purely local in a free-amalgamation sense; hence two O5-free one-point extensions may “force” an O5 across the overlap. The CSP search is the correct way to catch this phenomenon.

10) Actionable items for the verifier
- Implement the canonical labeled templates for C5,H5,O5 from §6 (positive sets S_C=∅, S_H={1,3,5}, S_O={2}). Generate their R relations (closure under even permutations, exclude odd). Verify that these three are pairwise non-isomorphic and that switching (ε at any vertex) preserves the partition (C5∪H5) vs O5.
- For |A|=3: For each (α,β)∈{±1}^2, count how many of the 8 assignments to the three unknown coordinates yield an O5 5-set; check it is <8 to conclude existence of a good assignment. This would rigorously establish one-point amalgamation for |A|=3.
- For |A|=4: Enumerate all pairs (B,C) of 5-vertex structures of type C5 or H5 that agree on A, then build and solve the 6-variable CSP described in §7. Either find a counterexample or certify that all pairs allow a solution (proving one-point amalgamation at |A|=4).
- Optionally test the constructive Ansatz z_{ij}=α(i)β(i)α(j)β(j) to see if it always succeeds.

11) Summary of contributions (this round)
- Formalized AP for H as a local 5-set CSP on cross 4-sets in one-point amalgamation. This is auditable and reduces the problem to finite search in the minimal nontrivial case (|A|=4).
- Established trivial one-point amalgamation for |A|≤2, and gave a clear, verifiable route for |A|=3.
- Introduced the switching operation and explained its invariance properties relevant to forbidding O5.
- Proposed a concrete finite algorithm to decide the |A|=4 case (and thus likely AP), and a plausible constructive assignment pattern that may solve all cases if verified.

Open points to be clarified/verified next
- Precisely characterize, by explicit enumeration, the orbit of O5 among 5-vectors under relabeling (and optionally switching), especially to quantify “bad triples” in the |A|=3 and |A|=4 CSPs. This unlocks a rigorous completion of the small cases.
- If no counterexample is found at |A|=4, design an inductive or probabilistic argument (perhaps via LLL) to extend to all |A|.
- Alternatively, if a counterexample is found, extract the minimal pattern and provide a clean, human-readable certificate of unsatisfiability (values of α,β per t and an argument why every assignment of z leads to an O5 in some Y_T).

Note to the verifier on reproducibility
- All steps above can be encoded with small scripts: Relational generation for the three 5-types, orbit enumeration under S5, switching, and a brute-force CSP solver for the 6 unknowns in the |A|=4 case. This will either produce a concrete obstruction (refuting AP) or give strong evidence (and likely a proof) that one-point amalgamation holds, paving the way to a full AP proof.

## Round 0001 — 2025-08-27T14:26:06.637040Z

Status of outputs.md: not provided. I cannot check prior results; I proceed from the task statement only.

Scope and goal
- We study 4-hypertournaments, i.e., structures (V,R) with a 4-ary relation satisfying injectivity, closure under even permutations, and the “exactly one of (x1,…,x4) and (x2,x1,x3,x4) is in R” condition.
- For a finite set V, a 4-hypertournament is equivalent to specifying, for each 4-subset S of V, which parity-class of orderings of S lies in R (even vs. odd). Thus, for each 4-set S, we can define an orientation bit f(S) ∈ {+1,−1} that determines all tuples on S.
- On 5 vertices X, the induced 4-hypertournament type is determined by the 5-tuple of bits p = (p_x)_{x∈X} with p_x := f(X\{x}). Up to isomorphism (permuting X, with the induced parity corrections on the 4-sets), there are exactly three orbits of such 5-tuples, denoted C_5, O_5, H_5 in the task statement.
- We are to decide whether the class H of all finite 4-hypertournaments omitting O_5 has the amalgamation property (AP).

Key observations and lemmas

Lemma 1 (Orientation function viewpoint).
For any finite vertex set V, giving a 4-hypertournament structure on V is equivalent to giving an arbitrary function f: [V]^4 → {±1}. The relation R is then determined by: for a 4-tuple (x1,x2,x3,x4) of distinct vertices, let S={x1,x2,x3,x4}; let π be the permutation that maps the increasing ordering of S (in the ambient enumeration of V) to (x1,x2,x3,x4). Then (x1,x2,x3,x4) ∈ R iff sgn(π) = f(S).

Proof sketch. Conditions (1)–(3) say that for each 4-set S, the membership of an ordered tuple from S in R depends only on the parity of the permutation from a fixed ordering of S. Thus for each S we freely choose whether “even” or “odd” permutations lie in R; choices on different S are independent. Conversely, given f, the above prescription defines a 4-hypertournament.∎

Consequences. There are no compatibility constraints between different 4-sets S,T ⊆ V in the definition; all constraints arise only when we forbid an induced O_5 on some 5-set X, i.e., when we constrain the 5-tuple (p_x)_{x∈X} not to fall into the O_5 isomorphism class.

Notation for 5-sets and types.
- For a 5-element set X⊆V with the ambient enumeration 1<⋯<|V|, define p(X) ∈ {±1}^X by p_x := f(X\{x}). The induced isomorphism type on X depends only on the orbit of p(X) under the action of S_5 given by p ↦ M(τ)p with (M(τ)p)_i = ε_i(τ)·p_{τ^{-1}(i)}, where ε_i(τ) is the sign of the restriction of τ to the 4-set X\{τ^{-1}(i)}. The three orbits are denoted C_5, O_5, H_5.
- Concretely: representatives include p≡(+,+,+,+,+) for C_5, p with exactly one + (and four −) for O_5, and p with + on {1,3,5} and − on {2,4} for H_5 (indices relative to a chosen enumeration of X). Different enumerations (τ) can permute and flip coordinates (via ε(τ)), so the raw count of +’s is not invariant.

Reduction to one-point amalgamation

Lemma 2 (One-point amalgamation suffices).
To decide AP for H, it suffices to decide the following: whenever A∈H and B = A ∪ {b} ∈ H and C = A ∪ {c} ∈ H with B∩C = A, there exists D ∈ H on A∪{b,c} extending both B and C.

Proof sketch. Suppose one-point amalgamation always succeeds. Given arbitrary B,C ∈ H over A, enumerate the vertices of C\A as c1,…,ck. Starting with B0 := B, amalgamate Bi with Ai := A ∪ {c1,…,ci−1} by a one-point amalgamation with Ci := Ai ∪ {ci} to produce Bi+1 on A ∪ (B\A) ∪ {c1,…,ci}. Each step preserves membership in H (no O_5 arises on any 5-set entirely inside the old structure, and the newly created 5-sets are controlled by the one-point step). After k steps we obtain D∈H containing both B and C over A.∎

Thus, from now on we focus on |A|=4, B=A∪{b}, C=A∪{c}.

The 6-vertex constraint system for one-point amalgamation
Let A={1,2,3,4}, b=5, c=6. Structures on B and C fix f on all 4-sets contained in B and C respectively. Any amalgam D on {1,2,3,4,5,6} must specify f on the six “cross” 4-sets
- X_{ij} := {i,j,5,6}, for 1≤i<j≤4 (these are exactly the 4-sets not contained in B or C).
Write variables x_{ij} ∈ {±1} for f(X_{ij}). All other f-values are determined by B and C.

The only 5-sets Y in D that can introduce new constraints (relative to B and C) are
- Y_k := {5,6} ∪ (A\{k}) for k=1,2,3,4.
For each k, the 5-tuple p(Y_k) has two fixed coordinates:
- p missing 6 is p^B_k := f_B({5} ∪ (A\{k})) (a 4-set inside B),
- p missing 5 is p^C_k := f_C({6} ∪ (A\{k})) (a 4-set inside C),
and three variable coordinates corresponding to the three 4-sets missing each of the three elements of A\{k}, namely x_{ij} with {i,j} = (A\{k})\{ℓ} as ℓ ranges over A\{k}. Concretely,
- Y_1 depends on {x_{23}, x_{24}, x_{34}},
- Y_2 depends on {x_{13}, x_{14}, x_{34}},
- Y_3 depends on {x_{12}, x_{14}, x_{24}},
- Y_4 depends on {x_{12}, x_{13}, x_{23}}.

Constraint: For each k, we must choose the three variables so that the resulting 5-tuple p(Y_k) is not isomorphic to O_5 (i.e., p(Y_k) ∉ orbit_G(e1)). This is the entire constraint system for the one-point amalgamation step.

A necessary (but not sufficient) sub-constraint
In the special case p^B_k=+1 and p^C_k=−1 for all k (achievable by taking B of type C_5 with “all positive” and C of type C_5 with a relabelling so that k∈A all yield “negative” while A’s 4-set itself remains +1), an immediate necessary condition to avoid O_5 in Y_k is that not all three variables in its triple are −1; otherwise p(Y_k) has exactly one + under the ambient enumeration (coming from the “missing 6” coordinate), which is already the canonical O_5 representative.
In terms of the 6 variables on the edges of K_4 on A, the four triples are exactly the edge-sets of the four 3-vertex faces (triangles) of K_4: each Y_k corresponds to the triangle on A\{k}. Thus the necessary condition reads: every triangle of K_4 must contain at least one + variable. This is satisfiable, e.g., by setting x_{12}=x_{34}=+1 and all other x_{ij}=−1 (a perfect matching of +’s). Hence, forcing O_5 in this case cannot be achieved merely by the “identity-isomorphism” obstruction.

Why this is useful. This reduction isolates the exact degrees of freedom and shows the one-point amalgamation problem is a small finite CSP on 6 variables with 4 constraints. It suggests a feasible computational approach and indicates that any counterexample to AP (if it exists) must rely on the full isomorphism classification (not just the “exactly one +” under the fixed enumeration).

Plan to decide AP
- Step A (computational classification on 5 points). Compute the orbit G·e1 ⊆ {±1}^5 explicitly by generating the 120 matrices M(τ) and applying them to the seed e1=(+,-,-,-,-). Likewise, fix representatives for C_5 and H_5 to cross-check. This yields a precise membership test “p ∈ O_5?” for a 5-vector p in the fixed ambient enumeration.
- Step B (solve the 6-variable CSP for one-point amalgamation). Given p^B,p^C for B and C (both O_5-free on their 5-sets), enumerate the 2^6 assignments of x_{ij} and eliminate those for which some Y_k yields p(Y_k) ∈ O_5 (using membership from Step A). If at least one assignment survives, the one-point amalgamation exists for that (A,B,C). Repeat over all possibilities of p^B and p^C (up to isomorphism and compatibility on A) to decide whether the one-point amalgamation always exists.
- Step C (deduce AP). If Step B always succeeds, AP holds by Lemma 2. If there is a failing triple (A,B,C), we have a concrete counterexample witnessing failure of AP.

Remarks/conjectures to guide the search
- Because there are only three 5-point isomorphism types, p^B and p^C (subject to agreeing on the A-4-set value) range over finitely many patterns up to the shared labelling of A; the search space is tiny.
- Heuristic: in the symmetric case p^B_k=+ and p^C_k=− for all k, the matching assignment x_{12}=x_{34}=+, others − is a natural candidate. It satisfies the necessary “no identity-O_5” condition discussed above. I conjecture (to be verified computationally) that for each Y_k the resulting 5-vector p(Y_k) actually falls into C_5 or H_5, not O_5.
- If this conjecture holds in the most constrained symmetric case, it is plausible that one-point amalgamation always succeeds, hence H has AP. But this requires a check across all p^B,p^C patterns, not just the symmetric one.

What is rigorously established here
- The orientation function model (Lemma 1) and the exact reduction of one-point amalgamation to a finite 6-variable CSP with four 5-point constraints have been stated and justified.
- The sufficiency of one-point amalgamation for full AP (Lemma 2) has been argued.
- A necessary condition in a key symmetric case has been analyzed and shown satisfiable, indicating nontriviality and guiding further work.

Immediate next actions for the verifier
1) Implement Step A to compute the O_5-orbit in {±1}^5 under the action p' = (ε_i(τ)·p_{τ^{-1}(i)})_i. This gives a function IsO5(p) on 5-bit patterns in the fixed enumeration.
2) Implement Step B for the one-point amalgamation CSP:
   - Input: p^B,p^C consistent with A (i.e., the value on A itself agrees in B and C).
   - Variables: x_{ij} for 1≤i<j≤4.
   - For each k=1..4, form the 5-vector p(Y_k) with coordinates: missing 6 → p^B_k; missing 5 → p^C_k; and the three “missing a” coordinates given by the relevant x_{ij} as listed above.
   - Reject any assignment if IsO5(p(Y_k)) is true for some k; accept otherwise.
3) Exhaust over the finitely many p^B,p^C (modulo relabellings of A consistent across B and C) to determine whether one-point amalgamation always succeeds. If yes, conclude H has AP by Lemma 2. If no, record a concrete failing triple (A,B,C), which witnesses that H does not have AP.

Potential pitfalls to watch for
- When enumerating p^B,p^C possibilities, ensure the shared A-4-set has the same f-value in B and in C. This is necessary because A must be a common induced substructure.
- Beware that changing the ambient enumeration of V changes the raw p-vectors; the membership test IsO5 must be invariantly computed via the group action as above, not by counting pluses.

Summary
- We have reduced the AP question for H to a small, explicit, and checkable one-point amalgamation CSP on 6 variables with four constraints, each constraint being the avoidance of the O_5-orbit for a concrete 5-vector.
- A simple necessary condition in a symmetric case does not force a contradiction, suggesting that amalgamation may be possible in nontrivial scenarios.
- A short computational check (Steps A–B) should decide AP. If the one-point amalgamation always works, AP follows by iterating one-point amalgamations (Lemma 2). If a counterexample exists, the same check will find it and witness failure of AP.

Gaps to fill in future rounds
- Complete the explicit computation of the O_5 orbit and the CSP feasibility in all cases of p^B,p^C to settle the AP decisively.
- Optionally, extract conceptual invariants distinguishing the orbits C_5, O_5, H_5 to replace the computational step with a direct argument, if feasible.

## Gaps and corrections relative to output.md
- The core reductions in output.md are correct: the orientation-function model (Prop. 1), one-point sufficiency (Lemma 2), and the 6-variable CSP over |A|=4 (Prop. 3). The caution about “switching” (Fact 5) is now correctly stated (earlier round had an incorrect claim that switching preserves O5/non-O5; we acknowledge and avoid using switching as a normalization for the fixed one-point diagram).
- Missing justifications remain:
  1) |A|=3 one-point amalgamation is not fully proven. The note suggests it “should” hold but does not supply a decisive argument or enumeration.
  2) For |A|=4, the CSP-solving plan is laid out but no concrete allowed triple sets F(α,β) are provided yet, and no exhaustive case analysis or counterexample is given.

## Idea 1 — Explicit formula for the S5 action on 5-vectors (implementation aid and small lemma)
We refine the group-action details needed to compute IsO5(p) efficiently.
- Let τ ∈ S5. For 1≤i≤5, let j := τ^{-1}(i). Define c_j(τ) as the number of inversions in τ that involve the position j, i.e.,
  c_j(τ) = |{k<j : τ(k) > τ(j)}| + |{k>j : τ(k) < τ(j)}|.
- Then the sign multiplier on coordinate i in the action p′_i = ε_i(τ) · p_{τ^{-1}(i)} satisfies
  ε_i(τ) = sgn(τ) · (-1)^{c_{τ^{-1}(i)}(τ)}.
- Product identity: ∏_{i=1}^5 ε_i(τ) = sgn(τ).
  Proof: Each inversion (a,b) with a<b contributes 1 to c_a and 1 to c_b, so Σ_j c_j = 2·inv(τ). Hence ∏ ε_i = sgn(τ)·(-1)^{Σ c_j} = sgn(τ)·(-1)^{2·inv(τ)} = sgn(τ).
Why useful here: This yields a deterministic, easily checkable implementation of the S5 action for IsO5(p). It also clarifies that the product ∏ p_i flips precisely under odd permutations (so product is not an orbit invariant, which cautions against simplistic invariants).

## Idea 2 — Precompute local constraint sets F(α,β) and reduce cases drastically
For a 5-set Y with two “fixed” coordinates (coming from missing b and c) equal to α,β ∈ {±1} and three free coordinates (x,y,z), define F(α,β) ⊆ {±1}^3 as the set of triples for which the full 5-vector p(Y) lies in the non-O5 orbits (C5 ∪ H5). In the |A|=4 one-point CSP, for each k we merely need that the triangle-triple lies in F(p^B_k, p^C_k).
- Symmetry reductions for the verifier:
  • Because the IsO5 test is by the full S5 action, the labels of the two fixed positions are irrelevant; only the actual values α,β matter. It is plausible (and should be validated computationally) that |F(+,+)| = |F(-,-)| and |F(+,-)| = |F(-,+)| by the existence of permutations intertwining sign patterns; thus it suffices to compute F_eq := F(+,+) and F_opp := F(+,-). This reduces table size from 4 to 2.
  • Once F_eq, F_opp are known, the |A|=4 problem becomes: find x_{ij} so that each of the four triangle-triples lies in either F_eq or F_opp according to whether p^B_k and p^C_k agree or disagree at k.

Action item: Implement IsO5(p) via Idea 1, and exhaustively compute the 8 triples for each of the two cases (α,β)∈{(+,+),(+,-)} to tabulate F_eq and F_opp. This is an extremely small computation and will settle |A|=3 at once (since there is only a single Y in that case).

## Proven special cases (new small lemmas)
- Lemma A (|A|=3, case α=β). If α=β, the choice x=y=z=α gives p(Y)=(α,α,α,α,α), which is a C5 representative (and not O5). Thus one-point amalgamation holds in this subcase.
  Why useful: Certifies half of the |A|=3 instances directly and provides a sanity check for the IsO5 routine (all-equal should be classified non-O5).

- Lemma B (|A|=4, fully “aligned” case). Suppose B and C are such that p^B_k = p^C_k for all k∈A (equivalently, they induce the same 4-bit pattern on A). Then setting all six cross variables x_{ij} = δ, where δ is any fixed sign (e.g., δ = p^B_1), yields p(Y_k)=(δ,δ,δ,δ,δ) for all k. Hence all four Y_k are C5 and the amalgam exists in H.
  Why useful: This establishes one nontrivial family of one-point amalgams for |A|=4 and provides another test oracle for implementations.

Proof sketches: In both lemmas, the constructed 5-vectors are constant-sign. The class C5 admits a representative with all coordinates +1 (as noted in the task statement’s positive-vertex description). Therefore constant-sign 5-vectors are non-O5; they may represent C5 (or H5 under some relabeling), but certainly not O5.

## Idea 3 — Canonical test instances for the verifier (toward deciding the |A|=4 CSP)
Enumerate a few “extreme” (B,C) profiles over A={1,2,3,4} to stress-test the CSP solver and guide intuition:
- Profile P1 (both sides C5, aligned): p^B_k ≡ +, p^C_k ≡ +. By Lemma B, x_{ij}≡+ works; all Y_k are C5.
- Profile P2 (both sides C5, opposed): p^B_k ≡ +, p^C_k ≡ −. This is the symmetric “hard” case discussed earlier. A natural candidate assignment is a perfect matching of +’s on the K4 edges, say x_{12}=x_{34}=+, others −. Each triangle then contains exactly one +. This assignment should be checked: for each k, p(Y_k) has one + and two − among the variable coordinates and fixed pair (+,−). Use IsO5 to decide; either this works (evidence for satisfiability) or it fails (hints at the structure of F_opp).
- Profile P3 (C5 vs H5, mixed): Take p^B_k ≡ + and p^C on A extracted from the canonical H5 representative (+,−,+,−) (with compatibility on f(A) enforced). Try the constructive ansatz x_{ij} = w_i w_j with w_i := p^B_i·p^C_i. This guarantees, for each k, the variable triple over A\{k} has product +1. Check satisfiability under IsO5.
- Profile P4 (both sides H5). Use canonical H5 on both sides aligned over A; Lemma B applies and x_{ij}≡+ works.

Finding a single unsatisfiable profile among these certifies failure of AP. If these pass, expand coverage by randomizing the 5-vertex labelings for B and C within their types (subject to agreeing on A) and rerun the 6-variable search.

## Idea 4 — Constructive ansatz for general |A|
Retain the ansatz x_{ij} := w_i w_j with w_i := p^B_i·p^C_i for i∈A. For T={i,j,k}, the triple is (w_i w_j, w_i w_k, w_j w_k) with product +1. This yields a globally consistent choice across all triangles. Two paths forward:
- Computational: Verify this ansatz in all |A|=4 profiles. If it always avoids O5, it is a strong candidate for a uniform construction in general m=|A| by the same reasoning (every Y_T will have the same structured triple).
- Theoretical: Try to identify a 5-vector invariant (under the S5 action) which separates the O5 orbit from the set of vectors with the “pairwise-product” form on a distinguished triple combined with two fixed bits; if such an invariant exists, it would yield a conceptual proof that the ansatz avoids O5.

## Examples (toy checks by hand)
- Sanity check: For p = ( +, +, +, +, + ), IsO5 should return false (C5). For p = ( +, −, −, −, − ), IsO5 should return true (O5). For p = ( +, −, +, −, + ), IsO5 should return false (H5). These serve as unit tests for the IsO5 implementation.
- Under the action formula (Idea 1), confirm that for τ a transposition, ∏ p_i flips sign; test that IsO5 remains invariant (i.e., (+,−,−,−,−) maps to some vector in its orbit under appropriate ε(τ)).

## Obstacles
- A clean, pen-and-paper characterization of the O5 orbit in {±1}^5 under the signed S5 action is nontrivial. The counts of “+” entries or simple products do not classify orbits. Hence, for rigor and speed, we should rely on the small computational enumeration (32 candidates per 5-set, 120 actions).
- For |A|=3, while we covered the α=β subcase (Lemma A), the general α≠β case is best settled by the F_opp table. Attempting to fully classify it analytically seems overkill compared to the trivial enumeration.

## Next steps for the verifier (concrete, minimal)
1) Implement IsO5(p):
   - Precompute the 120 signed permutation matrices via ε_i(τ) from Idea 1.
   - Build the O5 orbit by applying all to the seed p_O=(+,-,-,-,-), store in a set.
   - IsO5(p) is membership in this set.
2) Compute F_eq and F_opp:
   - For (α,β)=(+,+) and (+,−), enumerate the 8 triples (x,y,z), form p=(α,β,x,y,z), evaluate IsO5(p), and record allowed triples.
3) |A|=3: Using F_eq and F_opp, verify that at least one triple is allowed in both cases (this completes the |A|=3 proof).
4) |A|=4 CSP:
   - Enumerate B and C as 5-vertex C5/H5 types on A∪{b} and A∪{c} that agree on A (reduce modulo S4 permutations of A to shrink cases).
   - For each k, decide eq/opp by testing p^B_k vs p^C_k, and enforce that the triangle-triple lies in F_eq or F_opp.
   - Solve the 6-variable CSP by brute force (2^6=64 assignments) for each (B,C). Either find an unsatisfiable pair (refuting AP) or certify all feasible (supporting AP).
5) Test the constructive ansatz x_{ij}=w_i w_j as a fast heuristic; if it always succeeds, we gain a candidate general proof strategy.

## Why these steps count as incremental, auditable progress
- We supplied a concrete, verifiable formula for the S5 action on 5-vectors (Idea 1), removing ambiguity in ε_i(τ) and aiding robust code.
- We proved two nontrivial special cases (Lemmas A and B) that establish one-point amalgamation in meaningful subfamilies.
- We reduced the enumeration burden by symmetry (Idea 2) and provided canonical test profiles (Idea 3) that will either quickly produce a counterexample or increase confidence toward AP.

## Checklist for the next round
- [ ] Verifier to produce F_eq, F_opp tables and report their sizes and entries.
- [ ] Confirm |A|=3 holds fully by those tables.
- [ ] Run the |A|=4 CSP, at least on Profiles P1–P4; report SAT/UNSAT and, if SAT, an explicit assignment {x_{ij}}.
- [ ] If all tested profiles are SAT, extend to a complete enumeration modulo S4 on A.
- [ ] Report whether the ansatz x_{ij}=w_iw_j always passes in the tested cases.

## Status and focus
- Outputs.md currently contains: the orientation-function model (Prop. 1), one-point sufficiency (Lemma 2), the |A|=4 CSP formulation (Prop. 3), trivial |A|≤2 (Cor. 4), a caution on switching (Fact 5), and the explicit S5 action/identity (Lemma 6, Cor. 7). These are correct and useful.
- Missing pieces to settle AP: explicit characterization of the 5-vector O5-orbit membership for the small “two-fixed plus three-free” situations; the tables F(α,β)⊆{±1}^3; a proof of the |A|=3 one-point case; and a resolution of the |A|=4 6-variable CSP across all compatible B,C.

## New observations and micro-lemmas (auditable)
1) Interpretation of the fixed bits p^B_k and p^C_k.
- For B on A∪{b}, the four fixed signs p^B_k (k∈A) are exactly the indicator (via +/−) of which vertices of A are “positive” in the 5-vertex structure induced by B (i.e., k is positive in B iff the increasing 4-tuple on {b}∪(A\{k}) is in R_B).
- Same for C. Why useful: This ties the |A|=4 profiles directly to the 5-point types of B and C and justifies reducing the search by S4-symmetry on A.

2) Necessary local exclusions for the “opposite” case (to be used as quick unit checks).
- Claim N1: With α=+ and β=−, the triple (x,y,z)=(−,−,−) yields p=(+;−;−,−,−) which is the canonical labeled O5 representative; hence forbidden. Symmetrically, with α=− and β=+, the triple (+,+,+) yields p=(−;+;+,+,+) which is in the O5 orbit (by the same reasoning after swapping the two fixed positions and re-enumerating); thus forbidden as well.
- Why useful: This gives immediate necessary constraints that any F(+,-) and F(-,+) must omit. It also supplies two easy sanity tests for any IsO5 implementation.

3) Triangle/edge perspective and a structured ansatz.
- Variables are on edges of K_4 on A: x_{ij}∈{±1} for 1≤i<j≤4. Each constraint Y_k involves the triangle on T=A\{k}. This viewpoint helps reason about compatibility.
- Structured ansatz (to test): pick signs w_i∈{±1} on vertices and set x_{ij}:=w_i w_j. Then for any triangle {i,j,k}, the triple is (w_iw_j,w_iw_k,w_jw_k) and has product +1. Among the 8 patterns, this ansatz realises exactly the four with product +1: (+++), (+−−), (−+−), (−−+).
- Why useful: If all constraints admit at least one of these four patterns (per their (α,β)), one can try to choose w_i to satisfy all triangles simultaneously. This reduces the search to a low-complexity global choice of four bits w_i; it is easy to brute-force (2^4=16) and scales to general |A| as well.

4) Reduction by eq/opp pattern across k.
- For the |A|=4 CSP, only the pair (α_k,β_k) for each k matters via the choice F(α_k,β_k) of allowed triples; the absolute signs on A’s 4-set in B and C do not enter the new constraints. Hence, modulo S4 on A, it suffices to test the 16 eq/opp patterns E⊆A where E={k: α_k=β_k} (provided we use the full F(α,β) tables rather than assuming F(+,+)=F(−,−), etc.). This organizes the exhaustive check and avoids unnecessary duplication.

## Explicit computational blueprint (refined)
A) Build IsO5(p) correctly.
- Use Lemma 6 to compute ε_i(τ)=sgn(τ)(−1)^{c_{τ^{-1}(i)}(τ)} for all τ∈S5.
- Generate the O5 orbit as O = { (ε(τ)·e1∘τ^{-1}) : τ∈S5 }, with e1=(+,-,-,-,-) in the chosen labeling.
- Implement IsO5(p): return true iff p∈O.
- Unit tests: IsO5(+,+,+,+,+)=false; IsO5(+,-,-,-,-)=true; IsO5(+,-,+,-,+)=false. Also verify orbit size (report it) and closure under the action.

B) Compute the local tables F(α,β)⊆{±1}^3.
- For each (α,β)∈{±1}^2, enumerate the 8 triples (x,y,z) and evaluate IsO5 on p=(α,β,x,y,z). Record F(α,β) as the complement of the O5 cases. Store the full tables (do not assume symmetries a priori), and note any observed invariances (e.g., under permuting x,y,z).
- Immediate checks: verify Claim N1 above is reflected (i.e., (−,−,−)∉F(+,-) and (+,+,+)∉F(−,+)); verify (+++)∈F(+,+) and (−,−,−)∈F(−,−) (constant 5-vectors are non-O5).

C) Conclude |A|=3 one-point amalgamation.
- For each (α,β), check that F(α,β) is nonempty and archive one explicit triple per case. This settles |A|=3 rigorously.

D) Solve the |A|=4 6-variable CSP.
- For a given eq/opp pattern E⊆{1,2,3,4}, impose that the triangle on A\{k} chooses a triple in F(α_k,β_k), i.e., in F(+,+) if k∈E, or in F(+,-) otherwise (after fixing a concrete representative with α_k,β_k; the concrete sign choices do not matter because the constraint is picked by the (α,β) pair).
- Two complementary solvers:
  • Brute-force x_{ij} (2^6=64) and check all four Y_k via IsO5 by constructing p(Y_k) explicitly; report SAT/UNSAT.
  • Try the structured ansatz x_{ij}=w_i w_j (2^4=16 assignments) and accept if each triangle’s triple lands in F(α_k,β_k). If this always succeeds across all tested patterns, we get a strong template for general |A|.
- Start with the four canonical profiles (P1–P4 from notes) and then cover all 16 eq/opp patterns modulo S4.

E) Optional but informative: enumerate actual pairs (B,C) up to S4 on A.
- Extract p^B_k and p^C_k patterns realizable by C5/H5 on B and C (as 4-bit vectors), ensuring B and C agree on A’s 4-set; then feed their induced eq/opp signatures to step D. This cross-checks that all emergent eq/opp patterns indeed arise from valid (B,C).

## Why this is concrete progress
- We isolated a sharp necessary exclusion (Claim N1) that provides immediate unit tests and sanity checks for F(α,β).
- We clarified exactly how the four fixed signs p^B_k and p^C_k are determined by the 5-point types on B and C, which justifies organizing the |A|=4 exploration by eq/opp patterns and S4 symmetry.
- We provided a structured, low-complexity ansatz (x_{ij}=w_iw_j) that, if accepted by the F(α,β) tables, yields a uniform construction and a plausible path to all |A| by iterated one-point steps.
- The refined computational blueprint reduces ambiguity (e.g., coordinate ordering in Y_k) and pinpoints the minimal data to archive (F(α,β) tables, eq/opp SAT results, and, if found, a counterexample assignment witnessing failure of AP).

## Obstacles and open items
- Analytic classification of the O5 orbit in {±1}^5 under the signed S5 action remains nontrivial; we rely (appropriately) on small-scale enumeration suggested above.
- We intentionally do not assert symmetries like F(+,+)=F(−,−) without computation. These might hold but are not needed to proceed.
- The structured ansatz may fail in some patterns; in that case, fallback to the 2^6 brute-force solver will still decide the |A|=4 CSP.

## Next steps for the verifier (minimal, checkable)
1) Implement IsO5 with Lemma 6; report orbit size and perform the unit tests (three vectors and an action-closure check).
2) Compute and record all four F(α,β) tables; confirm Claim N1 and that (+++)∈F(+,+), (−,−,−)∈F(−,−). Conclude |A|=3 by listing one allowed triple per (α,β).
3) For |A|=4, first test the four profiles P1–P4 (from notes) and then the 16 eq/opp patterns modulo S4 using the 2^6 brute force. Archive a satisfying assignment x_{ij} for each SAT case; if any UNSAT appears, this is a concrete counterexample to AP.
4) Test the structured ansatz x_{ij}=w_iw_j across all patterns; if it always succeeds, note it as a candidate general construction and we will attempt to lift it to arbitrary |A| next.

## Notes on outputs.md
- No errors detected in the current statements. A minor clarification we already kept in notes: the “aligned B,C” constant-triple trick works only when the common 4-bit pattern on A is constant (then taking all x_{ij} equal produces constant 5-vectors). This was previously mis-stated in a draft and has been corrected (not present in outputs.md).
- Still missing from outputs.md (for future addition once computed): the |A|=3 one-point lemma (with explicit witnesses per (α,β)) and the resolution of the |A|=4 CSP (either a general construction or a minimal counterexample).

## Status and focus for this round
- We keep the CSP reduction and one‑point amalgamation framework from output.md and notes.md. The key unresolved item is to decide feasibility of the |A|=4 one‑point step, which determines AP (Lemma 2).
- This round contributes: two concrete, checkable lemmas sharpening the local tables F(α,β); a uniform edge‑assignment strategy on K_4 that reduces the |A|=4 decision to verifying a very small number of membership tests in F; and a tightened computational plan that, if validated, essentially settles AP.

## Ideas and micro‑lemmas (auditable)

Lemma 10 (All‑equal triples in the opposite‑fixed case are O5).
- Statement: For F(+,-), both (+++) and (---) are forbidden (yield O5). By Corollary 9, the symmetric cases for F(−,+) are also forbidden.
- Proof sketch: (+++) with (α,β)=(+,-) gives p=(+,-,+,+,+), which has exactly one minus. There exists τ with ε_i(τ)=−1 for all i (Lemma 8), hence −ε=(+,+,+,+,+). Flipping one coordinate produces exactly the “one discrepancy” pattern, which is in the O5 orbit. Similarly, (---) with (α,β)=(+,-) yields p=(+,-,−,−,−), which is the canonical labeled O5 representative.∎
- Why useful: Gives two hard exclusions in the most constrained case; provides unit tests for IsO5 and for computed F(+,-).

Lemma 11 (Two‑plus two‑minus vertex signs force the triangle triple type (+−−) on all four Y_k).
- Set up: Label A={1,2,3,4}. Choose vertex signs w_i∈{±1} with exactly two + and two −, and set edge variables x_{ij}:=w_i w_j for 1≤i<j≤4 (the structured ansatz).
- Claim: For each k, the triple of variables on Y_k’s three edges (inside A\{k}) is, up to permutation of its three coordinates, of the form (+,−,−).
- Proof: If the missing vertex k is chosen from the + group, the included three vertices contain exactly one + and two −; the three pairwise products are (+·−, +·−, −·−) = (−,−,+), i.e., a permutation of (+,−,−). If k is chosen from the − group, the included set is {+, +, −}, whose pairwise products again form a permutation of (+,−,−).∎
- Why useful: A single global choice (2+2− on vertices) makes every triangle triple equal to (+−−) (up to reordering). If the triple pattern (+−−) is allowed for all four (α_k,β_k), then this assignment simultaneously satisfies all four constraints, yielding the one‑point amalgam.

Lemma 12 (Minimal membership tests suffice to settle the |A|=4 one‑point amalgam via a uniform assignment).
- Let F(α,β)⊆{±1}^3 be as in notes.md (p=(α,β,x,y,z) non‑O5). If the following three membership properties all hold:
  1) (+++) ∈ F(+,+) (already holds: p=(+,+,+,+,+) is C_5),
  2) (+−−) ∈ F(+,+), and by Corollary 9 also (−, +, +) ∈ F(−,−),
  3) (+−−) ∈ F(+,-), and by Corollary 9 also (+−−) ∈ F(−,+),
  then the |A|=4 one‑point amalgamation always succeeds.
- Proof: Distinguish two cases for a given one‑point diagram over A={1,2,3,4}:
  • If all four pairs (p^B_k,p^C_k) are equal (either all ++ or all −−), then setting w_i≡+ gives x_{ij}=+ and hence each triangle triple is (+++), which is allowed by (1). (By central symmetry, the (−,−) case is covered as well.)
  • Otherwise, there exists at least one k with (p^B_k,p^C_k) opposite. Choose w with exactly two + and two − (Lemma 11). Then all four triangle triples are of type (+−−) up to permutation. By (2) and (3), (+−−) is allowed for both equal and opposite fixed‑pairs (using Corollary 9 for the (−,−) and (−,+) subcases). Hence all four Y_k pass, and we obtain an amalgam in H.∎
- Why useful: Reduces the entire |A|=4 decision to verifying only two concrete membership facts: (a) (+−−) ∈ F(+,+), and (b) (+−−) ∈ F(+,-). The other two cases follow by Corollary 9.

Remark (Scope of the uniform 2+2− assignment).
- The argument of Lemma 12 is specific to |A|=4, where every Y_k sees exactly three of the w_i’s; with 2+2−, every triangle contains a mixed triple, never all three equal. For larger |A| the same fixed 2+2− choice would not prevent +++ triples on some 3‑subsets, so we do not propose it beyond |A|=4. This is fine: by Lemma 2, settling the one‑point step for all |A| is sufficient, and we can (and should) handle |A|>4 by the same CSP with its own choices of w.

## Examples and unit checks (to aid the verifier)
- Opposite case (+++, +−): p=(+,-,+,+,+) has exactly one minus ⇒ O5 (Lemma 10). Symmetric (---, +−) gives the canonical O5 representative.
- Equal case (+++, ++): p=(+,+,+,+,+) is C5 ⇒ allowed; unit test for IsO5.
- Pattern (+−−): test both F(+,+) and F(+,-). If either fails, archive the specific τ that maps p to the O5 orbit and note which ε(τ) was used. If both succeed, Lemma 12 resolves |A|=4.

## Obstacles and why a tiny computation is still needed
- We cannot, by purely pen‑and‑paper means, certify (+−−) ∈ F(+,+) and (+−−) ∈ F(+,-) without unpacking the S5 signed action in detail. However, this is an 8‑evaluation task per F and we only need two of them, with a simple IsO5 oracle (Step A in notes.md/output.md). The check is immediate once IsO5 is implemented.

## Next steps (minimal, checkable)
1) Implement IsO5 via Lemma 6; validate with unit tests: (+,+,+,+,+) non‑O5; (+,−,−,−,−) O5; (+,−,+,−,+) non‑O5. Report the orbit size for O5 and closure under the action.
2) Compute the two key memberships:
   - Check whether (+−−) ∈ F(+,+) (i.e., p=(+,+,+,−,−) is non‑O5).
   - Check whether (+−−) ∈ F(+,-) (i.e., p=(+,−,+,−,−) is non‑O5).
   By Corollary 9 this immediately implies the corresponding statements for F(−,−) and F(−,+).
3) If both are true, conclude (by Lemma 12) that the |A|=4 one‑point amalgamation always succeeds. Together with Lemma 2, this proves that H has the amalgamation property.
4) If either membership fails, fall back to the 2^6 brute‑force CSP solver for |A|=4 (as already outlined) to either find a different satisfying assignment or exhibit a counterexample to AP. In reporting, include the failing (α_k,β_k) pattern over k∈A and an UNSAT certificate (e.g., list of all 64 assignments with the O5‑witnessing Y_k per assignment, or a SAT witness if it exists).

## Additional cleanups and clarifications
- Symmetry note: Lemma 8 and Corollary 9 (in output.md) justify reducing F‑table computations by sign flip: F(−α,−β) is obtained from F(α,β) by triplewise negation. We do not assume S3‑invariance of F(α,β) on the last three coordinates; use the fixed coordinate convention when constructing p=(α,β,x,y,z).
- Edge‑assignment viewpoint: Lemma 11 makes explicit that the structured ansatz with vertex signs w realizes, on K_4’s triangles, only two S3‑types of triples: (+++) (when the three w’s are equal) and (+−−) (when exactly one w differs). This is the core combinatorial mechanism behind Lemma 12.

## Gaps in output.md (to be addressed later; do not edit now)
- Proposition 3 fixes which two coordinates of p(Y_k) are “missing c” and “missing b,” but does not record an explicit convention for ordering the last three coordinates (the vertices of A\{k}). For reproducibility, a precise convention (e.g., increasing order in the ambient enumeration) should be stated in output.md when the F(α,β) tables are finally incorporated.
- The |A|=3 one‑point case is not yet proved in output.md; once IsO5 is implemented and F(+,+), F(+,-) are tabulated, it will follow immediately by listing one allowed triple per (α,β).

## Summary of progress
- Proved Lemma 10 (both all‑equal triples forbidden in the opposite‑fixed case), sharpening constraints and supplying concrete unit tests.
- Proved Lemma 11 (a 2+2− vertex‑sign assignment yields (+−−) triples on all four triangles), and Lemma 12 reducing the |A|=4 one‑point amalgamation to verifying just two memberships: (+−−)∈F(+,+) and (+−−)∈F(+,-).
- Provided a minimal, auditable computational path: implement IsO5, check the two memberships, and conclude AP if both hold; else, perform the already‑planned 2^6 brute‑force search to decide AP either way.
- This materially narrows the search space and sets up a decisive final step for the verifier to complete in the next round.

## Round 0005 — 2025-08-27T15:25:18.671956Z

Status and goal
- Class H: all finite 4-hypertournaments with no induced O_5 on any 5-set.
- We aim to decide whether H has the amalgamation property. As agreed, we reduce to one-point amalgamation and, for the minimal nontrivial base |A|=4, to a 6-variable CSP on the six cross 4-sets, with exactly four local 5-set constraints Y_k (k∈A) that must avoid O_5 (see output.md Proposition 3).

Gaps and corrections relative to output.md
- Missing convention: output.md does not yet fix the precise ordering of the five coordinates in the 5-vector p(Y_k) used when defining the local tables F(α,β). For reproducibility, we should adopt the notes.md convention: order coordinates as (missing c, missing b; then missing i<j<ℓ for A\{k}). This is already spelled out in notes.md; it should be recorded in output.md when finalizing the F-tables and any explicit constructions.
- All other core reductions in output.md (orientation-function model, one-point sufficiency, S5-action formula, central symmetry, the |A|=4 CSP) remain correct. The conditional 2+2 ansatz (Proposition 11) is stated with the proper caveat (we need all three permutations of (+,−,−) to be allowed in each F(α,β)).

New rigor: complete resolution of |A|=3 one-point amalgamation
- Lemma (|A|=3 always solvable). Let |A|=3. For B=A∪{b} and C=A∪{c} in H, pick the cross 4-sets so that the unique 5-set Y=A∪{b,c} has 5-vector p(Y) equal to one of the canonical non-O_5 representatives, as follows:
  • If (α,β)=(+,+), set (x,y,z)=(+,+,+); then p(Y)=(+,+,+,+,+)=C_5.
  • If (α,β)=(−,−), set (x,y,z)=(−,−,−); then p(Y)=(−,−,−,−,−)=−C_5.
  • If (α,β)=(+,-), set (x,y,z)=(+,-,+); then p(Y)=(+,-,+,-,+)=H_5.
  • If (α,β)=(−,+), set (x,y,z)=(−,+,−); then p(Y)=(−,+,−,+,−)=−H_5.
  These choices use exactly the coordinate ordering in notes.md. They are manifestly not of type O_5, so the one-point amalgam exists. This completes |A|=3 without any enumeration.
  Why useful: This closes a gap acknowledged in prior rounds and relieves pressure on small-case computations.

Concrete test instances for |A|=4 (explicit p-vectors to check)
To expedite a decisive check by the IsO5 oracle, here are explicit variable assignments and the resulting four 5-vectors; a single IsO5 pass on these settles the showcased profiles.

- Ordering convention (used below): For Y_k={b,c}∪(A\{k}) with A={1,2,3,4} and i<j<ℓ the increasing order on A\{k}, encode p(Y_k) as (p_missing c, p_missing b, p_missing i, p_missing j, p_missing ℓ).

- Profile P1 (aligned C5 on both sides): p^B_k≡+, p^C_k≡+ for k=1..4.
  • Choose the 2+2 vertex-sign ansatz with w=(w_1,w_2,w_3,w_4)=(+,+,−,−) and set x_{ij}=w_i w_j.
  • Computed triangle-triples and resulting 5-vectors:
    – Y_1 uses pairs {23,24,34}: triple (−,−,+); p(Y_1)=(+,+,−,−,+).
    – Y_2 uses pairs {13,14,34}: triple (−,−,+); p(Y_2)=(+,+,−,−,+).
    – Y_3 uses pairs {12,14,24}: triple (+,−,−); p(Y_3)=(+,+,+,−,−).
    – Y_4 uses pairs {12,13,23}: triple (+,−,−); p(Y_4)=(+,+,+,−,−).
  • Action item: Verify via IsO5 that (+,+,−,−,+) and (+,+,+,−,−) are non-O_5. If yes, this witnesses an amalgam for P1.

- Profile P2 (opposed C5 vs C5): p^B_k≡+, p^C_k≡− for k=1..4.
  • Use the same w=(+,+,−,−), x_{ij}=w_i w_j.
  • Computed triples and vectors:
    – Y_1: triple (−,−,+); p(Y_1)=(+,-,−,−,+).
    – Y_2: triple (−,−,+); p(Y_2)=(+,-,−,−,+).
    – Y_3: triple (+,−,−); p(Y_3)=(+,-,+,−,−).
    – Y_4: triple (+,−,−); p(Y_4)=(+,-,+,−,−).
  • Action item: Verify via IsO5 that (+,−,−,−,+) and (+,−,+,−,−) are non-O_5. If yes, this witnesses an amalgam for P2 and gives strong support for the 2+2 ansatz in a “hard” pattern.

- Profile P3 (mixed C5 vs H5): Take p^B_k≡+ and p^C=(+,-,+,-) (canonical H_5 on A∪{c} aligned with A); hence w_i=p^B_i p^C_i = (+,−,+,−).
  • Set x_{ij}=w_i w_j. Then the two distinct p-vectors that appear (up to relabeling across Y_k) are exactly the same as in P2: (+,−,−,−,+) and (+,−,+,−,−). If these are non-O_5 (as per the P2 check), this assignment also witnesses an amalgam for P3.

These four concrete 5-vectors are a minimal, auditable set for the verifier to run through IsO5. If all are non-O_5, the 2+2 ansatz settles three central profiles at once.

A further solvable family (explicit constraints linking α,β across k)
- Construction pattern: For each Y_k prescribe its triple to be (α_k,β_k,α_k) (the “local H5 witness” pattern used to solve |A|=3). Consistency across the four Y_k’s (because edge-variables are shared) forces the following equalities on the type-data:
  • α_1=α_2=α_3=α_4.
  • β_1=α_3 (hence β_1=α_1) and β_4=α_2 (hence β_4=α_1).
  • β_2=β_3.
- If these hold for a given pair (B,C), then defining x_{ij} by this pattern yields, for each k, p(Y_k) equal to ±C_5 (if α_k=β_k) or H_5 (if α_k≠β_k), hence an amalgam in H.
- Why useful: This provides a nontrivial, checkable subclass of one-point instances (beyond the equal-constant case of Proposition 12) that are solvable by an explicit assignment. It also illustrates how shared-edge consistency interacts with local choices.

Ideas toward a uniform |A|=4 construction (analysis and obstacles)
- 2+2 vertex-sign ansatz: As recorded (Lemma 10), with x_{ij}=w_i w_j and exactly two plus and two minus on vertices, every triangle contributes a permutation of (+,−,−). Consequently, the uniform feasibility of this ansatz reduces to membership tests that all three permutations of (+,−,−) belong to F(α_k,β_k) for each k. This is precisely the conditional statement in Proposition 11.
- Without the F-tables, we cannot yet certify these memberships analytically. However, the concrete vectors in P1–P3 above are p(Y_k) images of such permutations and thus constitute decisive micro-tests for two of the four α,β-types: (++), (+−).
- Greedy/LLL thought: A random assignment to the six variables makes each triangle uniformly distributed over {±1}^3. If the complement set {±1}^3\F(α,β) has size ≤1 in all four local types, then the LLL (with dependency degree 3) would guarantee a satisfying assignment. Establishing such small forbidden-fraction bounds is equivalent to computing the F-tables, which remains the minimal necessary check.

Actionable next steps for the verifier (small, decisive computations)
1) Implement IsO5 using the ε-factor formula in output.md Lemma 6; run unit tests: (+,+,+,+,+) non-O_5; (+,−,−,−,−) O_5; (+,−,+,−,+) non-O_5. Report the size of the O_5 orbit under the signed S_5 action.
2) Check the four concrete 5-vectors listed above:
   - (+,+,−,−,+), (+,+,+,−,−) [Profile P1]
   - (+,−,−,−,+), (+,−,+,−,−) [Profiles P2, P3]
   If all are non-O_5 then the presented assignments witness amalgams for these profiles.
3) Compute the local tables F(+,+) and F(+,−) fully (8 triples each) under the fixed ordering convention. Derive F(−,−), F(−,+) by triplewise negation (Corollary 9). Archive the tables; this completes the data needed to:
   - finish |A|=3 formally (although we already supplied an explicit solution), and
   - apply Proposition 11 (if all permutations of (+,−,−) are present in each F) to resolve |A|=4 uniformly, or else run the small 2^6 brute-force CSP per type-profile.
4) If Proposition 11’s condition fails, perform the 2^6 brute-force search for all compatible (B,C) over A (or, at minimum, over the 16 eq/opp patterns modulo S_4 on A) using the F-tables. Either record a SAT assignment (proving one-point amalgamation in each case) or produce a concrete UNSAT certificate (which would refute AP).

Why this counts as incremental, auditable progress
- Closed the |A|=3 case completely with explicit assignments for each (α,β), requiring no computation.
- Provided concrete, small test vectors for three central |A|=4 profiles (aligned, opposed, and mixed). Verifying four 5-vectors against IsO5 will either provide immediate positive evidence (witnessing amalgams) or reveal a specific local obstruction to the 2+2 ansatz.
- Identified a nontrivial solvable subclass for |A|=4 via the “local H5 witness” pattern and spelled out the precise necessary equalities it imposes on the type-data (α_k,β_k).
- Consolidated the minimal computational tasks (IsO5, two F-tables) that now suffice to either complete a uniform proof via Proposition 11 or to drive a short brute-force resolution of the |A|=4 CSP across all patterns.

Obstacles and open items
- An analytic characterization of the F(α,β) tables (beyond the hard exclusion (−,−,−)∉F(+,-)) remains elusive; we appropriately defer to the tiny enumeration.
- The 2+2 ansatz success hinges on membership of all permutations of (+,−,−) in F(α,β); this must be checked. If it fails, we will pivot to full 2^6 CSP solving (still very small) and, if needed, extract a minimal counterexample.

Checklist for the next round (expected outputs)
- IsO5 orbit size and unit-test confirmations.
- Verdict on the four concrete 5-vectors: non-O_5 or O_5; if all non-O_5, record the P1–P3 amalgam witnesses.
- Full F(+,+), F(+,−) tables and derivations of the other two via sign-flip.
- Either: (i) confirmation that all permutations of (+,−,−) are present in each F(α,β), hence a uniform 2+2 solution for |A|=4; or (ii) a small list of remaining profiles with a brute-force SAT witness or a single UNSAT certificate (which would refute AP).

## Round 0006 — 2025-08-27T18:59:55.891338Z

Round 0006 — Focus: closing the |A|=4 one‑point step; small unconditional progress and a tiny decision check

Context recap and what is already rigorous in output.md
- Orientation function model (Prop. 1), sufficiency of one‑point amalgamation (Lemma 2), and the |A|=4 6‑variable CSP formulation (Prop. 3) are correct and sufficient to reduce AP to a finite local decision.
- Small cases: |A|≤2 are trivial (Cor. 4). The |A|=3 one‑point amalgamation is now fully solved constructively (Prop. 14).
- Tools: explicit S5 signed action (Lemma 6) and central symmetry of O5 (Lemma 8, Cor. 9).
- |A|=4: We have a conditional uniform solution (Prop. 11) via a 2+2 vertex‑sign ansatz x_{ij}=w_iw_j if all three permutations of (+,−,−) are allowed in each local table F(α,β). We also have a nontrivial solvable subclass (Prop. 15) and the equal‑constant case (Prop. 12).

New, unconditional micro‑lemma (auditable) — a union‑bound satisfiability criterion
Lemma UB (union‑bound CSP feasibility for |A|=4).
- Setup: In the |A|=4 CSP (variables x_{ij} on edges of K_4), suppose that for each triangle T_k (k=1,2,3,4), at most one ordered triple in {±1}^3 is forbidden (i.e., |{±1}^3\F(α_k,β_k)| ≤ 1).
- Claim: Then there exists a satisfying assignment to the six variables.
- Proof: There are 2^6=64 global assignments. Fix a triangle T; forbidding one ordered triple on its three variables eliminates exactly 2^3=8 of the 64 assignments (the other three variables are free). By the union bound, the four triangles together eliminate at most 4·8=32 assignments, leaving at least 32 ≥ 1 satisfying assignments.∎
Why useful here. This gives a rigorous, computation‑light sufficient condition for one‑point amalgamation at |A|=4. It reduces the task to bounding, per case (α,β), the number of forbidden triples. If a tiny computation confirms |{±1}^3\F(+,+)| ≤ 1 and |{±1}^3\F(+,-)| ≤ 1 (the other two follow by Cor. 9), then AP follows at once (by Lemma 2) without searching the 6‑variable space.

Product‑pattern conjecture (testable; would settle |A|=4 uniformly)
Conjecture P+. For both (α,β)=(+,+) and (α,β)=(+,-), one has
F(α,β) = { (x,y,z) ∈ {±1}^3 : x·y·z = +1 }.
- Evidence: All explicit non‑O5 witnesses used so far (|A|=3 and the P1–P3 test vectors in notes.md) exhibit triple product +1; the only hard exclusion we proved (Lemma 13: (−,−,−) ∉ F(+,-)) has triple product −1.
- Consequence if true: The structured ansatz x_{ij}=w_iw_j (with arbitrary w: A→{±1}) yields, on each triangle, product +1 (since (w_iw_j)(w_iw_k)(w_jw_k)=+1). Hence it would satisfy every local constraint for any (α_k,β_k), giving a uniform one‑point amalgam for |A|=4 (indeed for all |A|, by the same local reasoning). This would prove AP outright.
- Action: This is an 8+8 evaluation check once IsO5 is in place.

Clarification of the triangle coordinate mapping (implementation aid)
- For Y_k={b,c}∪(A\{k}) with A={1,2,3,4} and i<j<ℓ the increasing order on A\{k}, our fixed encoding is
  p(Y_k) = (p_{missing\ c}, p_{missing\ b}, p_{missing\ i}, p_{missing\ j}, p_{missing\ ℓ}).
- The last three coordinates are expressed via the edge‑variables as
  p_{missing\ i} = x_{jℓ},\quad p_{missing\ j} = x_{iℓ},\quad p_{missing\ ℓ} = x_{ij}.
This convention is already used in Prop. 15 and should be observed when populating F(α,β).

Concrete examples and unit checks to run (tiny, decisive)
- Maintain the unit tests for IsO5: (+,+,+,+,+) ∉ O5; (+,−,−,−,−) ∈ O5; (+,−,+,−,+) ∉ O5.
- The four decisive test vectors from notes.md §P1–P3:
  • (+,+,−,−,+), (+,+,+,−,−), (+,−,−,−,+), (+,−,+,−,−). Each should be classified non‑O5 for the 2+2 ansatz to witness those profiles.
- Populate F(+,+) and F(+,-) fully (8 triples each). Immediate checks: (+++)∈F(+,+); (−,−,−)∉F(+,-). Report sizes |F(+,+)|, |F(+,-)| and list the complements {±1}^3\F.
- If both complements have size ≤1, conclude |A|=4 by Lemma UB. If, stronger, F(α,β) equals “product +1,” conclude AP by the structured ansatz (Conjecture P+).

Why these steps are valuable incremental progress
- Lemma UB is unconditional and reduces the |A|=4 decision to checking two tiny local tables (16 values total) and two cardinality inequalities; this is significantly weaker than the earlier need to solve all 6‑variable instances, yet it suffices to conclude AP if the tables are as sparse as anticipated.
- Conjecture P+ crystallizes the suspected structure of the local constraints and provides a one‑line uniform solution template if verified; even if false, the explicit counter‑entries will directly inform a minimal backtracking strategy.

Obstacles and open points
- We still lack an analytic classification of the O5 orbit to certify F(α,β) without computation. Given the minute size (32 total 5‑vectors), a brute‑force enumeration remains the quickest rigorous path.
- The conditional Prop. 11 remains unverified pending the membership of the three permutations of (+,−,−) in each F(α,β). This should be settled by the same F‑table computation.

Gaps, corrections, and notes on output.md
- Prop. 3 uses a coordinate‑free description of Y_k; when F‑tables are integrated into output.md, it would be helpful to restate the fixed 5‑coordinate ordering (as above) near Prop. 3 or before Prop. 11 (currently the precise ordering is spelled out later in Prop. 15).
- All other statements in output.md remain correct; no further errors spotted. Lemma 13 is properly justified (it uses the canonical O5 representative under the fixed coordinate order).

Next steps for the verifier (minimal and decisive)
1) Implement IsO5 via Lemma 6; run the three unit tests and report the O5 orbit size.
2) Evaluate IsO5 on the four concrete 5‑vectors listed above to settle P1–P3 for the 2+2 ansatz.
3) Compute F(+,+) and F(+,-) completely; derive the other two by Cor. 9. Report complements and sizes.
4) If |{±1}^3\F(+,+)| ≤ 1 and |{±1}^3\F(+,-)| ≤ 1, invoke Lemma UB to conclude the |A|=4 step and AP.
5) If, stronger, F(α,β)={triples with product +1} in both cases, record the uniform construction x_{ij}=w_iw_j as a final proof strategy for all |A|.
6) If either complement has size ≥2, run the 2^6 brute‑force CSP per realized (B,C) profiles or at least per the 16 type‑patterns over k∈A (keeping the ordered pairs {++,−−,+−,−+}); archive either SAT witnesses or a single UNSAT certificate (refuting AP).

End of round summary
- Introduced a new unconditional lemma (union‑bound feasibility) that can, by checking two 8‑entry tables, settle |A|=4 and hence AP.
- Formulated the “product +1” conjecture (precisely testable) which, if true, yields a uniform, simple construction for the amalgam.
- Provided precise, small computational tasks that will decisively resolve the remaining |A|=4 bottleneck, along with explicit test vectors and sanity checks.

## Round 0006 — 2025-08-27T19:00:01.879047Z

Status and focus
- We keep the one‑point reduction and the 6‑variable CSP for |A|=4 (output.md Prop. 3). The key missing piece remains deciding the local 5‑set constraints, i.e., membership in F(α,β)⊆{±1}^3 (output.md Cor. 9 gives the sign‑flip symmetry, but we still need explicit tables or at least a few decisive entries).
- Proposition 11 is conditional; Proposition 12 settles the equal‑constant subcase; Proposition 14 settles |A|=3; Proposition 15 provides a further solvable subclass. No contradictions detected in output.md.

New micro‑lemmas and structural observations (auditable)
1) Type patterns on A induced by 5‑types (enumeration aid).
- Lemma T. Let B be a 5‑vertex structure on A∪{b} with type T_B∈{C5,H5}. Then the 4‑tuple (p^B_k)_{k∈A} equals:
  • Constant (all + or all −) if T_B=C5.
  • A 2+2 pattern (exactly two + and two −) if T_B=H5.
  Proof. For the 5‑vector p on A∪{b}, p_x is constant on C5; restricting to coordinates indexed by A yields a constant 4‑tuple. For H5, the canonical representative (+,−,+,−,+), after removing the “missing b” coordinate, leaves exactly two + and two − on A; S4 relabelings of A preserve the 2+2 property.∎
- Why useful: Narrows the |A|=4 case analysis to macro‑profiles (C,C), (C,H), (H,C), (H,H), and within each, the eq/opp pattern over k is now strongly constrained (e.g., C vs H yields exactly two equals and two opposites).

2) Triangle triple distribution under vertex‑sign assignments (combinatorial control).
- Lemma D. Let w∈{±1}^A and set x_{ij}=w_i w_j. For the four triangles (Y_k), the triple on Y_k is:
  • If |{i:w_i=+1}|=4 or 0: all four triples are (+++).
  • If |{i:w_i=+1}|=3 or 1: exactly one Y_k has (+++); the other three have permutations of (+,−,−).
  • If |{i:w_i=+1}|=2: all four Y_k have permutations of (+,−,−).
  Proof. For a 3‑vertex set, the pairwise products are (+++) if all three w are equal; otherwise exactly one edge‑product is + and two are −. Counting how many triangles contain three equal signs yields the cases above.∎
- Why useful: This extends Lemma 10 (the 2+2 case) and gives us three controllable regimes (0/1/4 occurrences of (+++)) by choosing w with 2+/2−, 3+/1− (or 1+/3−), or 4+/0− (or 0+/4−).

3) Global parity constraint across the four triangles (sanity check for UNSAT certificates).
- Lemma P (parity). For any assignment x_{ij}∈{±1}, the product of the four triangle‑products equals +1. Equivalently, the number of triangles whose triple has product −1 is even.
  Proof. Each edge variable x_{ij} appears in exactly two triangles of K_4, hence ∏_k (x_{ab}x_{ac}x_{bc} on triangle k) = ∏_{edges} x_{ij}^2 = 1.∎
- Why useful: If future F‑tables force odd parity (e.g., three triangles requiring triple product −1 and one requiring +1), we get an immediate contradiction, giving a clean UNSAT witness.

4) Minimal decisive membership checks for the 2+2/3+1 strategy (refinement of Prop. 11).
- Observation: The vertex‑sign method only ever produces (+++) or permutations of (+,−,−). Thus, to certify existence of an amalgam, it suffices to know, per (α,β): whether (+++) is allowed and whether the specific permutations of (+,−,−) that occur under a chosen w are allowed.
- Conditional Proposition 11′ (weaker prerequisites than Prop. 11). Fix the coordinate order from notes/output. If the following hold:
  (E1) (+++)∈F(+,+) and (+++)∈F(−,−) (true: ±C5),
  (E2) For (α,β)∈{(+,+),(−,−)}, at least one of the two concrete permutations of (+,−,−) realized by a 2+2 choice w=(+,+,−,−) (e.g., (+,−,−) and (−,−,+) as in P1) lies in F(α,β),
  (E3) For (α,β)∈{(+,-),(−,+)}, at least one of the two concrete permutations of (+,−,−) realized by a 2+2 choice w lies in F(α,β),
  (E4) For (α,β)∈{(+,-)}, (+++)∈F(+,-) or else (E3) holds and the count of k with (α_k,β_k)=(+,-) is even (so w with 2+2 can serve). For (−,+), (+++) is known forbidden (output.md Lemma 13), so require (E3) for those k.
  then every one‑point instance over |A|=4 is solvable by choosing w with 2+2, 3+1, or 4+0 as appropriate (use Lemma D to match how many (+++) triples are needed).
- Why useful: This further reduces the needed F‑table data to a handful of entries tied to the two triple shapes the vertex‑sign method can realize, and it incorporates the parity Lemma P to handle counts.

Concrete test vectors (to be evaluated by IsO5)
- As already prepared in notes/output, validating the following suffices to green‑light the 2+2 ansatz on central profiles:
  • P1 (C vs C, aligned): (+,+,−,−,+), (+,+,+,−,−).
  • P2 (C vs C, opposed): (+,−,−,−,+), (+,−,+,−,−).
  • P3 (C vs H, mixed): same two vectors as P2.
- Action: A single IsO5 pass on these four 5‑vectors decides P1–P3. If all are non‑O5, we have explicit amalgams for these macro‑profiles.

Enumeration of macro‑profiles and expected eq/opp distribution (for small exhaustive runs)
- By Lemma T, the four p^B_k (k∈A) are: all equal (C) or 2+2 (H). Hence, up to S4 on A, the possibilities are:
  • (C,C): either all eq (δ,δ) or all opp (δ,−δ).
  • (C,H) or (H,C): exactly two eq and two opp (which of the two depends on δ and the 2+2 positions).
  • (H,H): 4 eq (when identical), 0 eq (when negations), or 2 eq.
- These five eq/opp profiles, coupled with which positions within the 2+2 pattern, represent all realizable one‑point patterns.
- Why useful: This confines the 2^6 brute‑force search to a tiny, structured set of cases for final certification if needed.

Gaps/clarifications in output.md
- Prop. 11 requires “all three permutations” of (+,−,−) in each F(α,β). For our vertex‑sign method, only two concrete permutations occur for a fixed 2+2 choice; moreover, we can swap which two appear by permuting which vertices receive w=+ (Lemma D/notes’ P1–P3). It would be slightly sharper to state a conditional that only requires those two realized permutations (as in Proposition 11′ above) rather than all three.
- The precise mapping from the triple (x_{jℓ},x_{iℓ},x_{ij}) to the last three coordinates of p(Y_k) is stated in notes.md but not explicitly in output.md’s Prop. 3. When F‑tables are finalized, restating the “missing i/j/ℓ” order there would aid reproducibility.

Obstacles
- An analytic characterization of F(+,+) and F(+,-) remains elusive. We therefore continue to rely on the minimal computation plan (IsO5 oracle + 16 evaluations) to settle them.
- We cannot presently certify or refute the status of (+++) in F(+,-) without computation (we correctly retracted a heuristic argument earlier; output.md Lemma 13 addresses only (---)∉F(+,-)).

Next steps for the verifier (small, decisive)
1) Run IsO5 on the four vectors listed under P1–P3.
2) Compute F(+,+), F(+,-) fully (8 triples each) under the fixed coordinate convention; derive F(−,−), F(−,+) by sign‑flip (Cor. 9). Archive tables.
3) If both (+,−,−) and (−,−,+) lie in each F(α,β), apply output.md Prop. 11 directly. Otherwise, apply Proposition 11′ + Lemma D + parity Lemma P to choose between 2+2 vs 3+1 vs 4+0 for each macro‑profile, using (+++) where allowed to match the required counts among k.
4) If any macro‑profile remains unresolved, brute‑force its 2^6 assignments (Prop. 3), report SAT/UNSAT, and archive witnesses/certificates.

Why this is progress
- We refined the uniform vertex‑sign construction beyond the 2+2 case (Lemma D), and distilled the necessary F‑table checks to a minimal, actionable set (Proposition 11′), incorporating a global parity invariant (Lemma P).
- We classified the realizable p^B, p^C patterns over A (Lemma T), narrowing the remaining search to five macro‑profiles and providing a clear plan to dispatch each.
- These steps are immediately testable by the IsO5 routine and require only a handful of evaluations to either conclude AP or extract a concrete counterexample.

## Round 0006 — 2025-08-27T19:42:10.463400Z

Status and aim
- We continue to resolve the one-point amalgamation for |A|=4, which reduces AP for H to a finite CSP on six edge variables with four local 5-set constraints (output.md Prop. 3). The computational oracle IsO5 is still the bottleneck; I add rigorously checkable lemmas that simplify the local constraint analysis and shrink the number of patterns to verify.

New lemma: explicit O5-image formula (useful for hand checks)
- Lemma (O5 image equals “−ε off one coordinate”). Let e_O = (+,−,−,−,−). For any τ∈S_5 with ε(τ)=(ε_1,…,ε_5) and any i_0 with τ^{-1}(i_0)=the + position of e_O, the image p′ under the signed action satisfies
  p′_i = −ε_i for i≠i_0, and p′_{i_0} = ε_{i_0}.
  Proof. Immediate from p′_i = ε_i·(e_O)_{τ^{-1}(i)} and that (e_O)_j is + at one j and − otherwise.
- Why useful: To test whether a target 5-vector p lies in the O5 orbit, it suffices to check if there exists some i_0 with ε determined by ε_{i_0}=p_{i_0} and ε_i=−p_i for i≠i_0 such that ε=ε(τ) for some τ. This is a sharper necessary-and-sufficient condition and provides quick hand-proofs in some cases.

Corollary: all-equal triple is forbidden in the opposite-fixed case (now with a clean proof)
- Corollary (completes the “hard exclusion” in both directions). For (α,β)=(+,-), both (+++) and (---) are forbidden: (x,y,z)∉F(+,-) for (x,y,z)=(+,+,+) and (x,y,z)=(−,−,−). Proof:
  • (---) gives p=(+,-,−,−,−), the canonical O5 representative.
  • (+++) gives p=(+,-,+,+,+). By Lemma 8 there exists τ with ε_i(τ)=−1 for all i. Taking i_0=2 yields p′ with p′_2=ε_2=−1 and p′_i=−ε_i=+1 for i≠2, i.e., p′=(+,-,+,+,+). Hence p is in O5.∎
- Symmetrically, for (α,β)=(−,+), both (+++) and (---) are forbidden by global sign reversal (output.md Cor. 9).
- Why useful: This fully classifies the all-equal triples for the opposite-fixed case without computation, tightening the F(+,-) and F(−,+) tables and providing robust unit tests for IsO5.

Hand-verified ε-examples (sanity catalog for the verifier)
- Using Lemma 6, I computed ε(τ) for small τ (useful to debug IsO5):
  • id: ε=(+,+,+,+,+), Σε=+5.
  • (12): ε=(+,+,−,−,−), Σε=−1.
  • (123): ε=(+,−,−,+,+), Σε=+1.
  • (12)(34): ε=(−,−,−,−,+), Σε=−3.
  • (13): ε=(−,−,−,−,−), Σε=−5 (the “central” flip from Lemma 8).
  These confirm that Σε can realize ±5, ±3, ±1, so constraints based solely on Σε (or plus-counts) cannot rule out O5 membership.

Example checks guided by the O5-image formula
- For p=(+,-,+,-,-): considering i_0=2 gives ε=(−,−,−,+,+); i_0=1 gives ε=(+,+,−,+,+). Both patterns appear plausible from small τ, but I do not assert membership either way; this illustrates how the formula reduces a membership query to “does this ε occur as ε(τ)?”, which is trivial to decide computationally and infeasible by hand enumeration.

New solvable family via 2+2 vertex-sign ansatz (synthesis and scope)
- Recall Lemma 10 and Prop. 11. Under x_{ij}=w_iw_j with exactly two + and two − on A, each triangle-triple is a permutation of (+,−,−). Thus, if the verifier confirms that every F(α,β) contains all three permutations of (+,−,−), then the one-point step over |A|=4 is uniformly solvable (Prop. 11), implying AP for H (Lemma 2).
- I emphasize that the only remaining local memberships to check for this route are the 12 entries: for each (α,β)∈{++, +−, −+, −−}, the three permutations of (+,−,−). Cor. 9 halves this (the two opposite-sign cases follow by triplewise negation), so only F(+,+) and F(+,-) need computing.

Refined classification of 4-bit type patterns on A (search-space reduction)
- Observation (C5): For any B of type C5 on A∪{b}, the 5-vector on that 5-set is constant ±, hence the 4-bit pattern (p^B_k)_{k∈A} is constant (all equal) as well. This confirms that, in the one-point data, any non-constant 4-bit pattern on A must come from an H5 side.
- Heuristic (H5, to be verified computationally): For any C of type H5 on A∪{c}, the 4-bit pattern (p^C_k)_{k∈A} consists of exactly two + and two − (never all equal). The canonical representative (+,−,+,−) exhibits this; testing whether all six 2–2 patterns occur will reduce the |A|=4 enumeration by symmetry. Action item: Enumerate the orbit of H5 under relabelings that fix c and record the distinct 4-bit patterns on A; this bounds the profile list to check.

Obstacles and why a small computation remains necessary
- Attempts to certify (+,−,−)-admissibility analytically in F(+,+) or F(+,-) via parity/sum invariants fail because the S_5 signed action realizes ε with all odd sums, and the O5 orbit is large. The O5-image formula reduces membership to ε-realizability, yet characterizing the full image E={ε(τ):τ∈S_5} pen-and-paper appears cumbersome. A 120-step enumeration is the right tool here.

Actionable next steps for the verifier (precise and minimal)
1) Implement IsO5 via output.md Lemma 6. Unit tests: (+,+,+,+,+) non‑O5; (+,−,−,−,−) O5; (+,−,+,−,+) non‑O5; and the five ε-vectors above should appear for the listed τ.
2) Populate F(+,+) and F(+,-) (8 triples each) under the fixed coordinate order (notes/output). Obtain F(−,−), F(−,+) by triplewise negation (Cor. 9). Confirm the proven exclusions: for (+,-), exclude (+++) and (---).
3) Check the 12 key memberships: for each (α,β), all permutations of (+,−,−) belong to F(α,β). If yes, conclude the |A|=4 one‑point step via Prop. 11 and hence AP (Lemma 2).
4) If any of those memberships fail, revert to the 2^6 brute‑force CSP per realized (B,C) profile (with the H5 4-bit patterns catalogued as above). Either archive SAT assignments or produce an UNSAT certificate.

Gaps and clarifications in output.md
- Prop. 11 remains conditional on the F-table check; it should eventually cite explicitly which 12 memberships were verified. The present round supplies a complete proof that (+++) and (---) are both forbidden in F(+,-), filling a previously flagged gap.
- The precise ordering of the last three coordinates in p(Y_k) is critical and already stated; when the F-tables are recorded, repeat this convention in output.md adjacent to their definition for reproducibility.

Summary of this round’s contributions
- Introduced and proved the O5-image formula p = −ε off one coordinate, enabling quick hand checks and guiding IsO5 implementation.
- Fully classified “all-equal” triples in the opposite-fixed case as O5 (forbidden) by a short, rigorous argument.
- Provided computed ε-vectors for several small τ as sanity data.
- Outlined a minimal verification plan: compute two F-tables, test 12 memberships to unlock the uniform 2+2 solution; otherwise, fall back to the tiny 2^6 CSP with a reduced profile list via H5’s 4-bit patterns on A.

## Round 0007 — 2025-08-27T19:51:54.349723Z

Round 0007 — Focus: tightening IsO5 and the local F-tables; cocycle and generator analysis; implementable criteria

Status recap
- The reduction to one-point amalgamation and the |A|=4 CSP is sound (output.md Props. 1–3). The small cases |A|≤2 and |A|=3 are closed (Cor. 4, Prop. 14). We have two key tools now recorded: central symmetry (Lemma 8) and the global parity invariant across the four triangles (Lemma 17). The union-bound feasibility criterion (Lemma 16) gives a decisive small-table condition.
- The remaining bottleneck is to populate F(+,+) and F(+,-) (and derive the other two by Cor. 9), and then either apply Lemma 16 or the 2+2 construction (Prop. 11) to finish |A|=4.

New micro-lemmas (auditable) — structure of ε(τ) and a cocycle
1) Lemma 18 (ε-cocycle for composition).
- Statement: For τ,σ∈S5 and i∈{1,…,5}, one has ε_i(τσ) = ε_i(τ)·ε_{τ^{-1}(i)}(σ).
- Proof: For p′ = A_τ(p) with (A_τp)_i = ε_i(τ)·p_{τ^{-1}(i)}, we have (A_τA_σ p)_i = ε_i(τ)·(A_σ p)_{τ^{-1}(i)} = ε_i(τ)·ε_{τ^{-1}(i)}(σ)·p_{σ^{-1}(τ^{-1}(i))}. Since A_{τσ}p has i-th coordinate ε_i(τσ)·p_{(τσ)^{-1}(i)}, uniqueness of the action implies ε_i(τσ) = ε_i(τ)·ε_{τ^{-1}(i)}(σ). ∎
- Why useful: Enables computation of all ε(τ) from the generators without recomputing c-counts; critical for a robust, fast IsO5 oracle.

2) Lemma 19 (ε for adjacent transpositions).
- Statement: For s_k=(k k+1) (k=1,2,3,4), ε(s_k) has + at positions k,k+1 and − elsewhere, i.e., ε(s_k)=(−,…,−, + at k, + at k+1, −,…,−).
- Proof: s_k has exactly one inversion (between k and k+1). Its restriction to [5]\{j} has odd sign iff j∈{k,k+1}, hence ε_i(s_k)=sgn(s_k)·(−1)^{c_j} equals + at i=k,k+1 and − otherwise. This matches direct c_j counts (as checked in notes earlier). ∎
- Why useful: Supplies base ε-vectors on generators; combined with Lemma 18 yields all ε(τ) by multiplying generators.

3) Corollary (parity of the number of + in ε(τ)).
- By Corollary 7, ∏_i ε_i(τ)=sgn(τ). Let m(ε) be the number of + entries. Then (−1)^{5−m(ε)}=sgn(τ), so m(ε) is odd if τ is even and even if τ is odd. Useful as a sanity check for ε enumeration.

Corrected and implementable IsO5 criterion (pair-set S)
- O5-image formula (from notes) says: for e_O=(+,-,-,-,-), the image under τ is p with p_i = −ε_i(τ) for i≠i0 and p_{i0} = ε_{i0}(τ) where i0:=τ(1). Equivalently, for a given p, there exists τ with (ε,i0)=(ε(τ),τ(1)) such that p⊙ε equals h(i0), the vector with exactly one + at i0 and − elsewhere.
- Crucial correction: It is not enough to find i0 with p⊙h(i0) ∈ E={ε(τ)}; the pair (ε,i0) must be realized by the same τ (i.e., i0=τ(1) for ε=ε(τ)). This invalidates the naive “ε-only” test and explains the earlier false positive for p=(+,+,+,+,+) with ε=h(5).
- Implementation blueprint: Precompute the pair-set S = { (ε(τ), i0=τ(1)) : τ∈S5 } using Lemma 18 and generators s_k (Lemma 19), tracking i0 under right-multiplication: if τ′=τ s_k then ε(τ′)_i = ε_i(τ)·ε_{τ^{-1}(i)}(s_k) and i0′=τ(s_k(1)). Then IsO5(p) is true iff ∃(ε,i0)∈S with p_i=−ε_i for i≠i0 and p_{i0}=ε_{i0}. This avoids orbit-building and uses only a 120-pair membership test per query.

Hand checks and unit data (partial, to aid verification)
- ε on generators (confirmed):
  • ε((12))=(+,+,−,−,−),
  • ε((23))=(−,+,+,−,−),
  • ε((34))=(−,−,+,+,−),
  • ε((45))=(−,−,−,+,+).
- Quick “non-O5 by partial exclusion” for two of the profile vectors using these ε-samples:
  • p1=(+,+,−,−,+): For the above ε and also ε(id) and ε((13))=(−,−,−,−,−), the match count |{i: p1_i=ε_i}| is 4,2,0,2,3 respectively (never 1). This is not a proof of non-O5 (other τ could still work), but serves as a debugging checklist for IsO5. Please use the S-based oracle to decide decisively.
  • p2=(+,+,+,−,−) similarly has match-counts 3,2,2,0,1 under the above ε; again ambiguous and needs a full S-check.

Consequences for F(α,β) computation
- With the S-oracle in place, F(+,+) and F(+,-) are obtained by the 8 tests on p=(α,β,x,y,z). By Cor. 9, F(−,−) and F(−,+) follow by triplewise negation. Unit constraints to verify:
  • (+++)∈F(+,+) and (−,−,−)∈F(−,−) (constant 5-vectors are ±C5, non-O5).
  • (−,−,−)∉F(+,-) (output.md Lemma 13); by symmetry (+++)∉F(−,+).
- Two decisive targets (carry-over from last round): check whether (+−−)∈F(+,+) and (+−−)∈F(+,-). If both hold (for all three permutations under our fixed coordinate order), Prop. 11 resolves |A|=4 uniformly via the 2+2 ansatz.

Implementation blueprint (refined, minimal)
1) Build S via the cocycle:
  - Start with τ=id: ε=+++++, i0=1.
  - BFS over right-multiplication by s_k (k=1..4) using Lemma 18 to update ε and i0.
  - Store S as a set of 120 pairs (ε,i0). Sanity checks: parity of plus-count in ε matches sgn(τ); S has size 120; sample ε above are present with their correct i0.
2) Implement IsO5(p): return true iff ∃(ε,i0)∈S with p_i=−ε_i for i≠i0 and p_{i0}=ε_{i0}. Unit tests: (+,−,−,−,−) true; (+,+,+,+,+) false; (+,−,+,−,+) false.
3) Compute F(+,+) and F(+,-) (8 entries each) under the fixed coordinate convention (notes/output). Derive the other two via Cor. 9. Report complements and sizes. If both complements have size ≤1, conclude |A|=4 by Lemma 16.
4) If, stronger, all three permutations of (+,−,−) lie in both F(+,+) and F(+,-), apply Prop. 11 to conclude |A|=4 by the 2+2 ansatz x_{ij}=w_i w_j.
5) If either condition fails, brute-force the 2^6 CSP on the realized (B,C) profiles; use Lemma 17 to prune.

Gaps and clarifications in output.md (to address later; do not modify now)
- It would be helpful to add Lemma 18 (ε-cocycle) in output.md as an implementation lemma; currently Lemma 6 suffices but the cocycle substantially simplifies and stabilizes code.
- The O5-image formula specialized to e_O and the necessity to track the pair (ε(τ), i0=τ(1)) is only in notes; incorporating it in output.md would prevent misuse of “ε-only” tests. We flagged the earlier incorrect simplification explicitly here.
- Coordinate ordering for the last three entries of p(Y_k) is correctly fixed near Prop. 15; when F-tables appear, restating that ordering there will improve reproducibility.

Obstacles
- A purely analytic classification of E={ε(τ)} (or of the O5 orbit) appears cumbersome; the cocycle+generator method is the right small computation.
- Without the F-tables, we cannot certify the 2+2 ansatz or the union-bound criterion. These remain the decisive next computations.

Next steps (concrete, minimal)
- Verifier: Implement S via Lemma 18 and ε(s_k) from Lemma 19; build IsO5 as above and run the standard unit tests.
- Populate F(+,+), F(+,-); confirm the already-proved exclusions and record sizes of complements. If both complements ≤1, invoke Lemma 16 to conclude |A|=4 and AP. If, stronger, (+−−)-permutations are allowed in both, apply Prop. 11 to conclude AP via the 2+2 construction.
- Independently, evaluate IsO5 on the four concrete 5-vectors from profiles P1–P3 listed in notes/output; archive their classifications and, if non-O5, keep these as explicit witnesses for representative one-point instances.

Why this is incremental, auditable progress
- We introduced two precise, easy-to-check lemmas (ε-cocycle and ε on generators) that drastically simplify the O5 oracle and remove ambiguity in the ε-factors.
- We corrected a subtle but important pitfall (the necessity of tracking i0 alongside ε in O5 membership), providing a rigorous criterion based on the pair-set S.
- We supplied partial hand checks and a concrete, minimal computation plan that will decisively settle the small F-tables and hence the |A|=4 step via Lemma 16 or Prop. 11.

## Round 0007 — 2025-08-27T19:52:04.491555Z

Round 0007 — Focus: sharpen O5-membership testing and prune local tables with rigorous tools; refine the |A|=4 search

Summary of what is rigorous in output.md and remaining gaps
- Proposition 1, Lemma 2, Proposition 3, Corollary 4, Fact 5, Lemma 6, Corollary 7, Lemma 8, Corollary 9, Lemma 10, Proposition 11 (conditional), Proposition 12, Lemma 13, Proposition 14, Proposition 15, Lemma 16, Corollary 16.1, Lemma 17 are internally consistent and correctly stated.
- Remaining gap to settle AP: We still need the two base local tables F(+,+), F(+,-) and, consequently, a resolution of the |A|=4 one‑point CSP across the realized profiles. Proposition 11 remains conditional; Corollary 16.1 offers an unconditional route if both complements are ≤1, but this awaits the tiny computation.
- A useful characterization of O5 membership (the “Hamming‑1” criterion; see Lemma H1 below) is not yet recorded in output.md. It reduces orbit membership to a radius‑1 Hamming neighborhood test around the set E={ε(τ):τ∈S5}. This should be added later for transparency (do not edit output.md now).

New micro‑lemma (rigorous) — Hamming‑1 characterization of the O5 orbit (implementation aid)
Lemma H1 (O5 as Hamming distance 1 from E).
- Let e_O=(+,-,-,-,-) and E:={ε(τ):τ∈S_5} with ε(τ) as in Lemma 6. Then for p∈{±1}^5,
  p∈O5 if and only if there exist ε∈E and i0∈{1,…,5} such that, writing q:=-p, one has Hamming(q,ε)=1 with the unique discrepancy at i0.
- Equivalently, O5 = { flip_all_but_one(ε,i0) : ε∈E, i0∈[5] }, where flip_all_but_one(ε,i0) is the 5‑vector v with v_{i0}=ε_{i0} and v_i=−ε_i for i≠i0.
Proof. By the specialization of the action to e_O: R_τ(e_O) has coordinates p′_i = ε_i(τ)·(e_O)_{τ^{-1}(i)}; if j=τ^{-1}(i) equals the unique + position of e_O, then p′_i=ε_i(τ), and otherwise p′_i=−ε_i(τ). Writing i0:=τ(1), we obtain exactly p′=flip_all_but_one(ε(τ),i0). Conversely, any vector of this form is R_τ(e_O) for the corresponding τ. Rewriting as q:=-p yields the Hamming‑1 characterization. ∎
Why useful. For an IsO5 oracle, it suffices to precompute E (120 evaluations via Lemma 6) and then test membership of −p in the radius‑1 Hamming neighborhood of E. This is faster and more robust than building the full O5 orbit, and supports hand checks.

Concrete consequences and hand checks (auditable)
- Sanity: For p=(+,-,+,+,+), q=(−,+,−,−,−). If ε=all − were known to occur with i0=2, then Hamming(q,ε)=1 at 2 and p∈O5. We cannot assert “ε=all − with τ(1)=2” without computation (see Obstacles), so we keep this as a tiny check for the IsO5 implementation, not as a claim.
- Verified exclusions retained: (x,y,z)=(−,−,−) is forbidden for (α,β)=(+,-) (Lemma 13). By sign symmetry (Cor. 9), (+++) is forbidden for (α,β)=(−,+).
- Verified inclusions (from |A|=3 constructive witnesses, Proposition 14): (+++)∈F(+,+); (−−−)∈F(−,−); (+,−,+)∈F(+,-); (−,+,−)∈F(−,+). These serve as base unit tests for the F‑table computation.

Refined computational blueprint (minimal, decisive)
A) Precompute E and implement IsO5 via Lemma H1.
- Enumerate all τ∈S5; compute ε(τ) via Lemma 6; store E as a set of 5‑vectors.
- IsO5(p): compute q=−p; return true iff ∃ε∈E with Hamming(q,ε)=1. Archive |E| and, optionally, the multiset of sums Σε_i (useful for diagnostics).
- Unit checks: classify (+,+,+,+,+) as non‑O5; (+,−,−,−,−) as O5; (+,−,+,−,+) as non‑O5. Also verify sample ε(τ) vectors from notes (id, (12), (123), (12)(34), (13)).

B) Populate the base local tables under the fixed coordinate order.
- Compute F(+,+) and F(+,-) completely by evaluating the 8 triples each against IsO5 on p=(α,β,x,y,z). Derive F(−,−) and F(−,+) by triplewise negation (Cor. 9). Archive explicit lists and complements; report sizes.
- Immediate validations: (+++)∈F(+,+), (−−−)∉F(+,-) as above. Keep an eye on the number of forbidden triples per table (Cor. 16.1 route).

C) Decide |A|=4 one‑point amalgamation via two small routes.
- If |{±1}^3\F(+,+)| ≤ 1 and |{±1}^3\F(+,-)| ≤ 1, invoke Lemma 16 + Cor. 16.1 to conclude the |A|=4 step and hence AP (Lemma 2).
- Otherwise, run the 6‑variable CSP per realized profile (brute force over x_{ij}∈{±1}): for each assignment, build the four p(Y_k) and test IsO5; archive a SAT witness or an UNSAT certificate if found. Use Lemma 17 (parity) to prune: an odd number of triangles demanding triple product −1 is impossible.

D) Optional but efficient: a backtracking solver with small branching.
- Choose a triangle (say Y_4) and fix its triple (x_{12},x_{13},x_{23}) to one of the |F(p^B_4,p^C_4)| allowed patterns (at most 8 choices). Propagate to constraints on Y_1,Y_2,Y_3 via shared edges; backtrack when hitting an O5. With at most 8 initial branches and shallow propagation, this is typically faster than the naive 2^6 loop.

Implications for the 2+2 vertex‑sign ansatz
- The conditional Proposition 11 cannot be used until we certify memberships of all three permutations of (+,−,−) in each F(α,β). The Hamming‑1 criterion (Lemma H1) provides a crisp way to test the key instances; in particular, the four 5‑vectors listed in notes for P1–P3 should be tested immediately (they are built from permutations of (+,−,−) on the last three coordinates with (α,β)=(+,+) and (+,−)).
- If any of those four classifies as O5, the uniform 2+2 ansatz fails for that profile (which is fine; Proposition 12 already solves the fully aligned (++++) case by a constant assignment). We then proceed with the general CSP or the backtracking solver.

Examples to feed IsO5 (relisted for convenience; same coordinate order as output.md)
- P1 (C vs C, aligned): check (+,+,−,−,+) and (+,+,+,−,−).
- P2 (C vs C, opposed): check (+,−,−,−,+) and (+,−,+,−,−).
- P3 (C vs H, mixed): check (+,−,−,−,+) and (+,−,+,−,−) (same as P2).
Outcome of these four evaluations will immediately confirm or refute the 2+2 ansatz on these central profiles and guide the subsequent global search.

Why these steps are concrete, incremental progress
- Lemma H1 gives a simple, exact O5‑membership test in terms of a precomputed set E and Hamming distance. It streamlines the IsO5 routine and enables hand checks in small instances.
- The plan B/C/D consolidates earlier ideas into a minimal, decisive pipeline that either resolves |A|=4 via the small‑table criterion (Cor. 16.1) or via a tiny brute force/backtracking with parity pruning. This is auditable and easily implementable.
- The explicit test vectors from P1–P3 remain the quickest sanity checks; their classification directly informs whether the 2+2 ansatz is viable anywhere beyond the equal‑constant subcase.

Obstacles and open items
- We still lack an analytic description of E and, as a result, of the O5 orbit; computing E (120 entries) is the appropriate step.
- Without the F‑tables, we cannot confirm or deny the “product +1” conjecture (Conjecture P+) or the stronger condition in Proposition 11.
- Attempts to hand‑prove (+++)∉F(+,-) or to classify (+,−,−) in F(+,+) stumbled on the constraint i0=τ(1) in the O5‑image formula; these are best left to the IsO5 oracle.

Notes on output.md (gaps/clarifications; do not edit now)
- It would be helpful to add, after Lemma 6 or near the definition of O5, the Hamming‑1 characterization (Lemma H1) as a corollary specialized to the O5 seed e_O. This is already established in notes and will aid future readers.
- The coordinate convention for p(Y_k) is clearly stated near Proposition 15; when the F‑tables are finalized, repeating that convention next to their definition will avoid confusion in reproducing the data.

Next steps for the verifier (minimal, checkable)
1) Build E via Lemma 6 and implement IsO5 using Lemma H1; run the unit tests and report |E|.
2) Evaluate the four P1–P3 vectors; report their O5 status.
3) Populate F(+,+) and F(+,-); derive the others via Cor. 9; report complements and confirm Proposition 14’s witness triples.
4) If both complements are ≤1, conclude |A|=4 via Lemma 16 and AP via Lemma 2. Else, run the 6‑variable CSP (or the backtracking variant) on realized profiles; archive SAT witnesses or an UNSAT certificate if found.

This round’s deliverables
- New Lemma H1 (O5=Hamming‑1 from E), with proof and implementation guidance.
- A clarified, minimal computational plan prioritizing E and the two base F‑tables, and a compact backtracking alternative to the 2^6 brute force.
- Retained and emphasized concrete test vectors (P1–P3) and parity‑based pruning for the |A|=4 search.

## Round 0007 — 2025-08-27T19:52:27.721171Z

# Round 0007 — Inner‑product characterization of O5 and immediate consequences for local F‑tables

## Quick recap and current bottleneck
- Goal: Decide AP for H (finite 4‑hypertournaments omitting O5) via the one‑point step. The hard minimal base is |A|=4, a 6‑variable CSP with four local 5‑set constraints Y_k (output.md Prop. 3).
- Missing data: The local tables F(α,β)⊆{±1}^3 (especially for (α,β)∈{(+,+),(+,-)}), which determine whether the 2+2 vertex‑sign ansatz or a small brute‑force search suffices. We previously left open whether (+++)∈F(+,-).

## New lemma (rigorous, implementation‑ready)
Lemma 18 (Inner‑product characterization of O5).
- Statement. Let E={ε(τ):τ∈S5} be the ε‑set from Lemma 6. For p∈{±1}^5, one has p∈O5 if and only if there exists ε∈E with Σ_{i=1}^5 p_i ε_i = −3.
- Proof. O5 is the orbit of e_O=(+,-,-,-,-). For τ∈S5, the image has the form p=φ(ε,i0) where ε=ε(τ), i0=τ(1), and p_i=ε_i if i=i0 and p_i=−ε_i otherwise (notes: “O5‑image formula”). Hence Σ p_i ε_i = ε_{i0}^2 + Σ_{i≠i0}(−ε_i^2)=1−4=−3. Conversely, if Σ p_i ε_i = −3 with ε∈E, then exactly one coordinate satisfies p_i ε_i=+1 (the others are −1). Let i0 be this index. Then p=φ(ε,i0), hence p∈O5. ∎
- Why useful: Reduces IsO5 to a 120‑element check over E with a single scalar test; in particular, special ε∈E yield immediate hand‑classifications for families of 5‑vectors p.

## Immediate corollaries for F(α,β) (hard exclusions now settled)
Using Lemma 8 (ε≡−1∈E) and that ε≡(+1)∈E (τ=id), Lemma 18 yields:
- C1. F(+,-): (+++) is forbidden. Indeed, p=(+,-,+,+,+) has Σ p_i=+3, and with ε≡−1 we get Σ p_i ε_i=−3 ⇒ O5. Together with output.md Lemma 13 ((---) forbidden), we now fully classify the all‑equal triples in the opposite‑fixed case: both (+++) and (---) are O5 (forbidden).
- C2. F(+,+): Every triple with exactly two “+” and one “−” is forbidden. For p=(+,+,x,y,z), Σ p_i = 2 + (x+y+z). When the triple has two + and one −, x+y+z=+1 ⇒ Σ p_i=+3, hence O5 by ε≡−1. Thus all three permutations of (++−) are excluded in F(+,+).
- C3. F(−,−): Every triple with exactly one “+” and two “−” is forbidden. Symmetric to C2 via flipping all signs (Cor. 9).
These are strict consequences; there may be further forbidden triples (we do not claim exclusivity without enumerating E).

Why this matters now:
- The long‑standing ambiguity “(+++)∈F(+,-)?” is resolved (it is forbidden). This tightens the local tables and provides immediate unit tests for IsO5 and F‑table population.
- C2 implies the union‑bound route (Lemma 16) cannot settle the |A|=4 step: for (α,β)=(+,+), at least three triples are forbidden, so |{±1}^3\F(+,+)| ≥ 3 (>1). The union‑bound lemma remains valid but is not applicable here.

## Compatibility with the 2+2 vertex‑sign ansatz (sanity checks)
- The 2+2 ansatz only produces triangle‑triples of product +1, namely the three permutations of (+,−,−) and (+++). Lemma 10 (and its refinement in notes) shows that with 2+2, exactly the two ordered shapes (+,−,−) and (−,−,+) occur across k (under our fixed coordinate convention), never (−,+,−) and never (+++).
- The new exclusions C1–C3 do not rule out (+,−,−) or (−,−,+) for either (α,β)=(+,+) or (+,−). Thus the central feasibility question for the 2+2 method remains: do these two ordered shapes lie in F(+,+) and F(+,-)? If yes, Proposition 11 applies and the |A|=4 step follows uniformly.

## Examples and unit tests (for the verifier)
- All‑equal in the opposite‑fixed case:
  • (α,β)=(+,-), (x,y,z)=(+,+,+) ⇒ p=(+,-,+,+,+) ⇒ Σ p=+3 ⇒ O5 by ε≡−1.
  • (α,β)=(+,-), (x,y,z)=(−,−,−) ⇒ canonical O5 representative.
  These should both fail IsO5 (i.e., classify as O5) and be excluded from F(+,-).
- Mixed in the equal‑fixed case:
  • (α,β)=(+,+), (x,y,z) a permutation of (++−) ⇒ Σ p=+3 ⇒ O5 by ε≡−1. All three such ordered triples must be excluded from F(+,+).
- Sanity checks for the 2+2 test vectors (from notes P1–P3):
  • (+,+,−,−,+), (+,+,+,−,−), (+,−,−,−,+), (+,−,+,−,−) all have Σ p∈{+1,−1}. Lemma 18 gives no automatic O5 verdict with ε≡±1, which is consistent with the expectation that these might be non‑O5 (to be confirmed by IsO5).

## Implementation aids (to speed E and IsO5)
- Cocycle identity. For σ,τ∈S5 and i∈[5]: ε_i(σ τ) = ε_i(σ)·ε_{σ^{-1}(i)}(τ). Proof: Compose the two signed actions (output.md Lemma 6) and compare with the one‑step action of σ τ; coordinate‑wise equality follows from the definition of the induced signs on 4‑element complements. This identity enables generating E from the ε of adjacent transpositions.
- Minimal generator data. Compute ε for the four adjacent transpositions s_k=(k,k+1) (k=1,…,4) once (via Lemma 6), and generate E by the cocycle identity using any standard S5 word. Archive |E| and its list; then:
  • p∈O5 iff min_{ε∈E} Σ p_i ε_i = −3 (Lemma 18).
  • F(α,β) is the complement in {±1}^3 of those triples whose 5‑vector hits −3 against some ε.

## Obstacles and limits of the new facts
- C1–C3 are only necessary exclusions. Without a full enumeration of E (or equivalently, the O5 orbit), we cannot decide the status of the key ordered shapes (+,−,−) and (−,−,+) in F(+,+) and F(+,-), which control the 2+2 method.
- The union‑bound feasibility (Lemma 16) is now known inapplicable due to C2. We keep it as a general tool, but it will not conclude the |A|=4 step here.

## Next steps (minimal, decisive)
1) Compute E via the cocycle identity (or directly via Lemma 6) and report |E|.
2) Implement IsO5 using Lemma 18 (inner product −3 against E). Run unit tests including: C1/C2/C3 exclusions, and the four P1–P3 vectors from notes.
3) Populate F(+,+) and F(+,-) fully; derive the other two via Cor. 9. Explicitly confirm (or refute) that (+,−,−) and (−,−,+) are allowed in both tables.
4) If both shapes are allowed in both tables, apply Proposition 11 (uniform 2+2) to conclude the |A|=4 step and AP (via Lemma 2). Otherwise, run the 2^6 CSP per realized macro‑profile, using the parity invariant (Lemma 17) for pruning, and archive SAT/UNSAT witnesses.

## Notes on output.md (gaps/corrections to add later)
- Suggest adding Lemma 18 (inner‑product characterization of O5) to output.md; it streamlines IsO5 and underpins the new corollaries.
- With Lemma 18 in place, the status of (+++) in F(+,-) is settled (forbidden), refining the earlier caution in notes. Output.md currently proves only the (---) half (Lemma 13).
- Record in output.md the strict necessary exclusions C2 and C3 for F(+,+) and F(−,−) respectively. These clarify why the union‑bound lemma (Lemma 16) cannot close the |A|=4 case here.

## Summary of this round’s progress
- Established a sharp, general IsO5 criterion (Lemma 18): p∈O5 iff Σ p_i ε_i = −3 for some ε∈E. This yields immediate, rigorous exclusions in the local F‑tables.
- Resolved the open question (+++)∈F(+,-) (it is forbidden) and derived further necessary exclusions for F(+,+) and F(−,−), strengthening the local picture.
- Refined the computational plan: generate E via a cocycle identity and complete F(+,+),F(+,-); then either certify the 2+2 method or finish with a tiny 2^6 CSP per profile.
- Provided concrete unit tests and clarified why the union‑bound tool does not apply in this setting.

## Round 0008 — 2025-08-27T20:07:47.973645Z

Round 0008 — Shrinking the F-table computation via internal S5-induced symmetries; two decisive membership checks for the 2+2 ansatz

Status and aim
- We keep the one‑point reduction and the |A|=4 six‑variable CSP (output.md Prop. 3). The S‑based O5 membership test is now rigorous (output.md Lemma 20), as are the ε‑cocycle and generator data (Lemmas 18–19). The remaining bottleneck is to populate the two base tables F(+,+) and F(+,-) and then close |A|=4 either by the 2+2 ansatz (Prop. 11) or by a tiny brute force, if needed.

New rigor: S5 actions that preserve the (α,β) table and their effect on triples
- Notation and convention: We use the fixed coordinate order for p(Y_k) recorded in output.md: (missing c, missing b, then the three positions missing i<j<ℓ from A\{k}). For the local table F(α,β), membership is: (x,y,z)∈F(α,β) ⇔ (α,β,x,y,z) is non‑O5.

Lemma 21 (swap of the fixed coordinates enforces central symmetry at α=β).
- Statement. For all α,β and (x,y,z), one has
  (x,y,z)∈F(α,β) ⇔ (−x,−y,−z)∈F(β,α).
  In particular, if α=β, then F(α,α) is centrally symmetric: (x,y,z)∈F(α,α) ⇔ (−x,−y,−z)∈F(α,α).
- Proof. Apply τ=(12). By Lemma 19, ε(τ)=(+,+,−,−,−). The action A_τ swaps the first two coordinates and flips signs on the last three: A_τ(α,β,x,y,z)=(β,α,−x,−y,−z). O5‑membership is invariant under A_τ; hence (α,β,x,y,z) is non‑O5 ⇔ (β,α,−x,−y,−z) is non‑O5. This is exactly the claim.∎
- Use: reduces F(+,+) to four unordered pairs of opposite triples, and relates F(+,-) to F(−,+) (though we already have Cor. 9 for global sign flip).

Lemma 22 (two internal generators acting on last three coordinates while preserving (α,β)).
- Statements. For all α,β and all (x,y,z), one has the equivalences within the same table F(α,β):
  (S3) (x,y,z)∈F(α,β) ⇔ (−y,−x,z)∈F(α,β).
  (S4) (x,y,z)∈F(α,β) ⇔ (x,−z,−y)∈F(α,β).
- Proof. For S3 use τ=(34). Lemma 19 gives ε(τ)=(−,−,+,+,−). Then A_τ(α,β,x,y,z)= (−α,−β, y, x, −z). By Cor. 9 (global sign symmetry), (−α,−β, y, x, −z) is non‑O5 iff (α,β, −y, −x, z) is non‑O5. This yields S3. For S4 use τ=(45) with ε(τ)=(−,−,−,+,+), giving A_τ(α,β,x,y,z)=(−α,−β, −x, z, y). Applying Cor. 9 again gives (α,β, x, −z, −y), i.e., S4.∎
- Use: S3 and S4 generate a small group of transformations on triples inside a fixed table F(α,β) that preserve triple‑product and relate many ordered patterns without touching α,β.

Lemma 23 (a coordinate swap on triples that preserves (α,β)).
- Statement. For all α,β and all (x,y,z), one has (x,y,z)∈F(α,β) ⇔ (z,y,x)∈F(α,β).
- Proof. Combine S4, then S3, then S4 again. Starting with (x,y,z), S4 gives (x,−z,−y); S3 then gives (z,y,−x); S4 again gives (z,y,x). Each step preserves membership in F(α,β), hence the equivalence.∎
- Use: F(α,β) is invariant under swapping the first and third triple coordinates, a key reduction for the 2+2 ansatz.

Consequences for orbits of {±1}^3 under these internal symmetries
- The group generated by S3, S4, and the swap (x,y,z)↔(z,y,x) (Lemma 23) preserves triple‑product and partitions {±1}^3 into the following orbits:
  • Product +1: O+_A = { (+++), (+−−), (−−+) } and O+_B = { (−+−) }.
  • Product −1: O−_A = { (−−−), (++−), (−++) } and O−_B = { (+−+) }.
  The equivalences S3/S4 connect the two 3‑element orbits (within each parity) and leave the 1‑element orbits fixed; Lemma 23 allows us to permute x and z, ensuring (+−−) and (−−+) are interchangeable inside F(α,β).
- Reduction of F‑table workload: To determine F(α,β) completely, it suffices to test at most four representatives: (+++), (+−−), (−−−), (+−+). The remaining 4 triples follow by the above orbit relations and Lemma 21 when α=β (central symmetry).

Refined implications for the 2+2 vertex‑sign ansatz (Prop. 11)
- Under the fixed coordinate convention (output.md), the 2+2 vertex‑sign ansatz (Lemma 10) produces, for any choice of the two “+” vertices on A, on each triangle an ordered triple that is either (+,−,−) or (−,−,+). The permutation (−,+,−) never occurs under this ansatz.
- By Lemma 23 (x↔z swap) the two realized permutations are equivalent inside any fixed F(α,β). Therefore, for Prop. 11 it suffices to check a single representative:
  • Decisive checks: (+,−,−)∈F(+,+) and (+,−,−)∈F(+,-).
  If both hold, then by Lemma 23 the other realized permutation (−,−,+) also lies in F, and Prop. 11 yields a uniform |A|=4 solution, hence AP (via Lemma 2). By Cor. 9, the remaining two cases (−,−) and (−,+) follow by triplewise negation.
- This sharpens and justifies the “two‑checks suffice” reduction proposed earlier (now with full proofs relying on S3/S4/Lemma 23). Note this is weaker than assuming all three permutations of (+,−,−) are present; the ansatz never requires (−,+,−).

Concrete micro‑tests and minimal computation plan (auditable)
- Unit tests for the new symmetries (to sanity‑check the IsO5 implementation and the F‑tables):
  1) Verify S3/S4 on sample inputs: For a random (α,β) and triple t, confirm IsO5(α,β,t) equals IsO5(α,β,−y,−x,z) and IsO5(α,β,x,−z,−y).
  2) Verify Lemma 23: IsO5(α,β,x,y,z)=IsO5(α,β,z,y,x).
  3) Verify Lemma 21: IsO5(α,β,x,y,z)=IsO5(β,α,−x,−y,−z).
- Minimal decisive F‑entries to evaluate with the S‑oracle (output.md Lemma 20):
  • For F(+,+): check (+,−,−). (+++) is known allowed (Prop. 14 for |A|=3; also C5), so (−,−,−) follows by Lemma 21.
  • For F(+,-): check (+,−,−) and retain that (+,−,+) is allowed (Prop. 14). (−,−,−) is forbidden (Lemma 13).
  Derive the remaining two base tables by Cor. 9. Using Lemma 23, if (+,−,−) is allowed in a table, (−,−,+) is automatically allowed too.
- Four pre‑existing decisive 5‑vector tests (still recommended):
  • For F(+,+): (+,+,+,−,−) and (+,+,−,−,+) (the two realized permutations under w=(+,+,−,−)).
  • For F(+,-): (+,−,+,−,−) and (+,−,−,−,+).
  Each should be non‑O5 for the 2+2 ansatz to succeed on the corresponding profiles.

Examples and sanity data already fixed by output.md
- F(+,+) contains (+++) and, by Lemma 21, also (−−−).
- F(+,-) contains (+,−,+) (Prop. 14) and forbids (−−−) (Lemma 13). The status of (+++) in F(+,-) remains to be decided by the S‑oracle (do not assume).

Why this is incremental, auditable progress
- New, fully rigorous lemmas (21–23) extract symmetry directly from the S5 action (using only Lemmas 6, 8, 19) and sharply reduce the local enumeration:
  • Per base table, at most four representatives need evaluation to reconstruct all 8 entries.
  • For the 2+2 ansatz, only two total tests are decisive: (+,−,−)∈F(+,+) and (+,−,−)∈F(+,-).
- These are immediately testable with the existing S‑oracle plan (output.md Lemma 20). They also supply strong unit tests to validate an implementation.

Obstacles and open items
- An analytic (non‑computational) classification of S remains difficult; we therefore continue to rely on the small enumeration via the S‑oracle. The new symmetries minimize the number of required queries.
- If either of the two decisive checks fails, the uniform 2+2 construction (Prop. 11) is unavailable. The fallback remains the tiny 2^6 CSP search with parity pruning (output.md Lemma 17) or the specific solvable subclass (Prop. 15).

Gaps or clarifications for output.md (do not edit now; for later integration)
- Adding Lemmas 21–23 would be valuable: they formalize the internal invariances that reduce F‑table computation and justify the “two‑checks suffice” reduction for Prop. 11.
- When the F‑tables are eventually archived, include a note that they are invariant under the transforms S3, S4, and x↔z, and that F(α,α) is centrally symmetric (Lemma 21), to aid reproducibility and debugging.

Next steps for the verifier (minimal, decisive)
1) Implement/validate the S‑oracle IsO5 (output.md Lemma 20). Run the unit tests in output.md and the symmetry checks listed above (S3/S4/Lemma 23/Lemma 21).
2) Evaluate the two decisive entries: (+,−,−) in F(+,+) and in F(+,-). If both pass, conclude |A|=4 via Prop. 11 and AP via Lemma 2.
3) If needed, populate the full F(+,+), F(+,-) using only the four representatives (+++), (+−−), (−−−), (+−+) and derive all entries by the proved symmetries. Cross‑check against the four P1–P3 vectors.
4) If Prop. 11 fails, run the small 2^6 search with parity pruning and archive either SAT witnesses or a minimal UNSAT certificate (which would refute AP).

## Round 0008 — 2025-08-27T20:08:31.594665Z

Status and aim
- We keep the one‑point reduction and the |A|=4 six‑variable CSP (output.md Prop. 3). The exact O5 membership test via the pair‑set S (output.md Lemma 20), the ε‑cocycle (Lemma 18), and ε on generators (Lemma 19) are now in output.md and are sufficient to implement a correct IsO5.
- Remaining blocker: populate the two base local tables F(+,+) and F(+,-), then conclude |A|=4 either by the 2+2 construction (Prop. 11, conditional) or a tiny brute‑force/backtracking run.

New small, rigorous facts (auditable)
1) Product‑of‑entries identity for O5 (debug/check aid).
- Claim. If p∈O5 with witness τ in Lemma 20 (i.e., p=A_τ(e_O)), then ∏_{i=1}^5 p_i = sgn(τ).
- Proof. Writing p=flip_all_but_one(ε(τ), i0=τ(1)), we have ∏ p_i = ε_{i0}·∏_{i≠i0}(−ε_i) = (−1)^4∏_i ε_i = ∏_i ε_i = sgn(τ) by Corollary 7.∎
- Why useful: A quick invariant to sanity‑check an S‑oracle and any hand‑computed witnesses.

2) A concrete forbidden ordered triple in F(+,-).
- Lemma EX1. For (α,β)=(+,-), the ordered triple (x,y,z)=(+,+,−) is forbidden, i.e., ( +, −, +, +, − ) ∈ O5.
- Proof. Take τ=(12)(34), which is even; by direct computation (already in notes and rechecked here) ε(τ)=(−,−,−,−,+) and i0=τ(1)=2. Lemma 20 then gives p=A_τ(e_O)=flip_all_but_one(ε,2)=(+,−,+,+,−). Hence (x,y,z)=(+,+,−) is not in F(+,-).∎
- Why useful: This gives a certified entry of F(+,-) without any enumeration. It also provides a unit test for IsO5.

Explicit ε and (ε,i0) samples (for S‑oracle validation)
- τ=id: ε=(+,+,+,+,+), i0=1; ∏ε=+.
- τ=(12): ε=(+,+,−,−,−), i0=2; ∏ε=−.
- τ=(23): ε=(−,+,+,−,−), i0=1; ∏ε=−.
- τ=(34): ε=(−,−,+,+,−), i0=1; ∏ε=−.
- τ=(45): ε=(−,−,−,+,+), i0=1; ∏ε=−.
- τ=(12)(34): ε=(−,−,−,−,+), i0=2; ∏ε=+.
- τ=(123): ε=(+,−,−,+,+), i0=2; ∏ε=+.
- τ=(234): ε=(+,+,−,−,+), i0=1; ∏ε=+.
- τ=(345): ε=(+,+,+,−,−), i0=1; ∏ε=+.
These pairs should appear in S; they are also useful check‑points when debugging the cocycle BFS.

2+2 ansatz: precise permutation usage and a weaker feasibility reduction
- Reminder (output.md Lemma 10): with w having two + and two − and x_{ij}=w_iw_j, every triangle‑triple is a permutation of (+,−,−). Under our fixed coordinate order, for the concrete choice w=(+,+,−,−) on A={1,2,3,4}, one checks explicitly (as already used in notes) that:
  • Y_1,Y_2 realize the ordered shape (−,−,+); Y_3,Y_4 realize (+,−,−).
- Consequently, a weaker conditional than Prop. 11 suffices in practice:
  • If for every realized pair type (α_k,β_k), both ordered shapes (+,−,−) and (−,−,+) are in F(α_k,β_k), then choosing w so that the two “+” are placed on the two indices k where the (−,−,+) shape is allowed and the other two k where (+,−,−) is allowed yields a satisfying assignment. This reduces to a simple feasibility check on the multiset { (α_k,β_k) : k∈A } and whether exactly two of them admit (−,−,+) (the rest admitting (+,−,−)).
- Actionable use: Once F(+,+),F(+,-) are computed, form, for each ordered pair type, the set S_perm(α,β)⊆{(+−−),(−+−),(−−+)} of allowed ordered shapes. If for a given one‑point instance there exists a 2+2 choice with exactly two k’s assigned to a shape in S_perm that matches the 2+2 distribution above, the 2+2 ansatz succeeds even if the third permutation is disallowed. This is a small combinatorial check (choose which two indices carry the “(−,−,+)” triangles).

Backtracking solver blueprint (deterministic, tiny) with propagation
- Choose a starting triangle, e.g. Y_4, and branch on its allowed triple set F(p^B_4,p^C_4) (≤8 branches). For each branch (x_{12},x_{13},x_{23}) fixed, propagate to Y_1 (which shares {x_{23}}), Y_2 (shares {x_{13}}), Y_3 (shares {x_{12}}) by intersecting their allowed sets with the corresponding fiber:
  • Y_1 reduces F(p^B_1,p^C_1) by fixing its first of the three local variables to x_{23} (remember mapping: for Y_1 the last three coordinates are (x_{23},x_{24},x_{34})). Similarly for Y_2 and Y_3 via their shared edge.
- Use two pruning rules:
  • If any Y_k’s local set becomes empty, backtrack.
  • Track the triangle‑product parity (output.md Lemma 17): if the partial assignment forces an odd number of triangles to have product −1 with no flexibility left to flip an even count, backtrack.
- Depth is at most 4 steps; in most cases the branching factor collapses quickly.

Concrete test vectors to complete the 2+2 permutation checks (implement next)
- For (α,β)=(+,+): test the missing permutation (+,+,−,+,−) in addition to the two already listed in notes ( (+,+,−,−,+), (+,+,+,−,−) ).
- For (α,β)=(+,-): test the missing permutation (+,−,−,+,−) in addition to ( (+,−,−,−,+), (+,−,+,−,−) ).
- These two additional evaluations complete the 6 decisive checks needed to apply Prop. 11 (three permutations for each of the two base tables), modulo Cor. 9 for the sign‑flipped cases.

Sanity/unit tests for IsO5 and F‑tables (succinct list)
- IsO5 must classify: (+,−,−,−,−) as O5; (+,+,+,+,+) and (+,−,+,−,+) as non‑O5; and the samples under “Explicit ε …” should yield A_τ(e_O) as written (check via Lemma 20).
- F(+,+) must contain (+++) (output.md Prop. 14 witness) and F(−,−) must contain (−−−). F(+,-) must contain (+,−,+) and F(−,+) must contain (−,+,−). The new Lemma EX1 adds: F(+,-) forbids the ordered (++−).

Gaps and clarifications in output.md (for later incorporation; do not edit now)
- It would help to add the product‑of‑entries identity for O5 (∏p_i=sgn(τ)) as a corollary after Lemma 20; it is a convenient invariant for debugging and hand checks.
- The weaker 2+2 feasibility reduction sketched above (choose two k for (−,−,+), two for (+,−,−)) could be formulated as a proposition conditional on the explicitly computed S_perm(α,β); this avoids requiring all three permutations as in Prop. 11. Once F‑tables are known, this is a two‑line check per instance.

Next steps for the verifier (minimal and decisive)
1) Build S via Lemmas 18–19 and implement IsO5 using Lemma 20. Validate on the sample pairs and unit tests listed.
2) Populate F(+,+), F(+,-) fully (8 triples each). Record complements and confirm the witnesses from Prop. 14 and Lemma EX1.
3) Run the six decisive 2+2‑permutation checks listed above. If they all pass, invoke Prop. 11. If not, apply the weaker 2+2 selection test using S_perm(α,β); if still inconclusive, run the shallow backtracking solver.

Why this is incremental, auditable progress
- We added a new explicit exclusion in F(+,-) (ordered (++−) forbidden) with a concrete τ‑witness and no computation.
- We provided additional ε/(ε,i0) samples and a product‑of‑entries invariant that make the S‑oracle easy to validate.
- We sharpened how to use the 2+2 ansatz with only two permutations available per triangle (a simple selection check once the tables are computed) and supplied the two missing test vectors to complete the decisive 12‑entry check for Prop. 11.

## Round 0008 — 2025-08-27T20:09:50.936178Z

Round 0008 — Tightening the local F-tables with exact S-pair witnesses; correcting a subtle misuse of i0; minimal but rigorous exclusions

Context and aim
- We keep the framework in output.md: the |A|=4 one‑point step is a 6‑variable CSP with four local 5‑set constraints Y_k (Prop. 3). The decisive tool for O5 membership is now Lemma 20 (the exact S‑pair criterion), together with Lemmas 18–19 for computing ε(τ).
- Goal this round: record a few rigorously proved forbidden entries for the base tables F(+,+) and F(+,-) using explicit τ and the S‑pair criterion, and correct an earlier pitfall about choosing i0. These small exclusions are auditable and shrink the remaining enumeration.

New, rigorous micro‑lemmas (using Lemma 20)
- Lemma F1. In F(+,+), the ordered triple (x,y,z)=(-,+,+) is forbidden.
  Why: Take τ=(13). By Lemma 8, ε(τ)=(-,-,-,-,-). Here i0:=τ(1)=3. Lemma 20 then gives A_τ(e_O) with coordinates p_i=ε_i for i=3 and p_i=−ε_i for i≠3, namely p=(+,+,−,+,+). Thus (−,+,+)∉F(+,+). This is a concrete O5 instance in the fixed coordinate order.
  Consequence: |{±1}^3\F(+,+)| ≥ 1. (This does not yet falsify the union‑bound criterion, but it is a firm, testable exclusion.)

- Lemma F2 (already in output.md, restated for completeness). In F(+,-), (x,y,z)=(−,−,−) is forbidden (Lemma 13). By Corollary 9, in F(−,+), (+++) is forbidden.

- Corollary F1′ (by sign symmetry). In F(−,−), the ordered triple (+,−,−) is forbidden (triplewise negation of Lemma F1). Proof: Apply Corollary 9 to F1.
  Consequence: |{±1}^3\F(−,−)| ≥ 1.

Why useful here
- These entries are established via the exact S‑pair criterion (Lemma 20) with explicit τ, hence they are rigorous and independently verifiable. They prune the base tables and sharpen expectations for the remaining entries that the verifier will compute.
- F1 in particular shows that not all “two‑plus one‑minus” ordered patterns are allowed in F(+,+). This impacts both the union‑bound route (Lemma 16) and any uniform 2+2 construction that might rely on arbitrary permutations of (+,−,−): the precise ordered membership matters.

Important correction of a subtle pitfall (auditable)
- Earlier drafts (and my own heuristic in a past round) tried to classify O5 via the ε‑only condition Σ p_i ε_i = −3 (or Hamming(−p,ε)=1). This is necessary but not sufficient; it ignores the i0 matching constraint i0=τ(1) that Lemma 20 enforces. In particular, attempting to certify (+++)∈O5 for (α,β)=(+,-) by picking ε≡−1 and i0 arbitrary is invalid. Any O5 membership must be demonstrated via an explicit τ (or via the precomputed S‑set), not ε alone.
- As a concrete illustration of why i0 matters, for τ=(23) one has ε(τ)=(−,+,+,−,−) and i0=τ(1)=1; the image A_τ(e_O) is (−,−,−,+,+), not (+,−,+,+,+). The earlier shortcut that tacitly took i0=3 was incorrect; Lemma 20 clarifies the bookkeeping and prevents such slips.

Examples (fully worked, for audit)
- F1 computation in detail. τ=(13) has ε(τ)=(-,-,-,-,-) (Lemma 8), i0=3. By Lemma 20, p=A_τ(e_O) has p_3=ε_3=− and p_i=−ε_i=+ for i≠3, hence p=(+,+,−,+,+). This matches (α,β,x,y,z)=(+,+,−,+,+), so (−,+,+) is excluded from F(+,+).
- F2 remains the canonical case: for (α,β)=(+,-) and (x,y,z)=(−,−,−), p=(+,-,−,−,−) is the standard O5 representative.

Obstacles and scope
- Proving further entries without precomputing S is delicate because of the i0 constraint. For instance, it is tempting (but not justified) to generalize F1 to say that all three permutations of a “two‑plus one‑minus” triple are forbidden in F(+,+) by conjugating τ=(13); this requires tracking ε under conjugation (which is nontrivial) and verifying i0 for the same τ.
- Likewise, attempting to certify (+++)∉F(+,-) purely from ε≡−1 fails absent an explicit τ with ε(τ)=−−−−− and τ(1)=2. This should be decided computationally via S.

Impact on global strategies
- Union‑bound (Lemma 16). Since we have only shown ≥1 forbidden ordered triple in F(+,+) and in F(−,−), the condition “forbid at most one triple per table” is not yet falsified. A tiny computation of the two base tables F(+,+), F(+,-) remains the quickest path to either applying Lemma 16 or to proceeding with the backtracking/SAT approach.
- 2+2 ansatz (Prop. 11). The vertex‑sign method produces only (+++) and permutations of (+,−,−). F1 shows that in the equal‑fixed case (++), at least one of the three permutations of (+,−,−) is actually forbidden (the one with ‘−’ in position 3). Whether the two permutations realized by a specific 2+2 choice of w are allowed is a factual question for F(+,+). Computing the full ordered table F(+,+) resolves this immediately.

Actionable next steps for the verifier (minimal and decisive)
1) Build S and IsO5 exactly as in Lemma 20 (output.md); retain unit tests already listed in notes/output.
2) Populate F(+,+), F(+,-) completely (8 entries each) under the fixed coordinate order; derive F(−,−), F(−,+) by Corollary 9. Confirm:
   - The new exclusion from Lemma F1: (−,+,+)∉F(+,+).
   - The standard exclusion from Lemma 13: (−,−,−)∉F(+,-).
3) If both complements have size ≤1, apply Cor. 16.1 to conclude the |A|=4 step and AP. Otherwise:
   - Check whether the two ordered permutations of (+,−,−) that arise under a 2+2 choice w (as in notes) lie in the relevant F(α,β) for each k; if yes, apply Prop. 11.
   - If not, run the 2^6 brute‑force CSP per realized profile or the small backtracking solver with parity pruning (Lemma 17).
4) Evaluate the four P1–P3 5‑vectors from notes against IsO5; archive their status to quickly validate the 2+2 witnesses already proposed for those profiles.

Notes on output.md (gaps/clarifications)
- The new Lemma 20 (S‑pair criterion) is precisely the right tool; no contradictions found. The pitfalls around ε‑only criteria are now avoided.
- Suggestion (for later integration): Record Lemma F1 explicitly when the F‑tables are finalized, to document at least one ordered exclusion in F(+,+). This will help readers reproduce the non‑symmetry across ordered triples.

Summary of incremental progress
- Provided a new, exact O5 exclusion in the equal‑fixed case (Lemma F1: (−,+,+)∉F(+,+)) with a concrete τ witness, tightening the F(+,+) table.
- Reiterated the correct use of Lemma 20 and corrected a subtle but frequent mistake (misassigning i0), preventing false positives like the earlier (+++) claim for F(+,-).
- Clarified how these facts intersect with union‑bound and the 2+2 ansatz, and distilled the next minimal computations needed to close |A|=4 and hence AP.

## Round 0009 — 2025-08-27T20:22:34.667806Z

Round 0009 — Reconciling local F-table symmetries with explicit O5 witnesses; firming up F(+,-), flagging a contradiction in output.md

Key inconsistency detected in output.md (needs verifier attention)
- Claimed facts in output.md:
  • Lemma 21: F(α,α) is centrally symmetric: t ∈ F(α,α) ⇔ −t ∈ F(α,α).
  • Lemma 22: Within any fixed F(α,β), membership is preserved by S3: (x,y,z)↦(−y,−x,z) and S4: (x,y,z)↦(x,−z,−y).
  • Proposition 14: For |A|=3, (+++)∈F(+,+) (since (+,+,+,+,+)=C5 is non‑O5), hence by Lemma 21 also (−−−)∈F(+,+).
  • Lemma 24(b): (−,+,+)∉F(+,+) (witness τ=(13)).
- Contradiction: Apply S4 in Lemma 22 to (−−−) in F(+,+): S4(−,−,−)=(−,+,+), so (−,+,+) must be in F(+,+). This conflicts with Lemma 24(b).
- Likely source: Lemma 24(b) uses τ=(13), which does not preserve the “fixed coordinate semantics” (first two coordinates are missing c and missing b in our F-table convention). The vector (+,+,−,+,+) is indeed in O5, but this does not alone certify that the ordered triple (−,+,+) is forbidden in the specific F(+,+) table with our fixed coordinate order on Y_k. To forbid an ordered triple in F(+,+), one must produce an O5 witness that keeps the first two coordinates aligned with (missing c, missing b) and the last three aligned with the increasing ordering on A\{k}. The current proof for 24(b) does not enforce this alignment.
- Action: Please re‑validate Lemma 24(b) with an S-oracle constrained to transformations that preserve the F-table convention (e.g., composing τ with appropriate permutations in the subgroup fixing the first two coordinates, and re-ordering the last three as i<j<ℓ). Pending that, I recommend retracting 24(b) to keep the local symmetries consistent.

Safe extensions: completing the “−−− orbit” exclusions in F(+,-)
- From Lemma 13, in F(+,-) the triple (−,−,−) is forbidden.
- By Lemma 22 (internal symmetries within F(+,-)):
  • Apply S3 to (−,−,−) to get (++−), hence (++−) is also forbidden. This matches output.md Lemma 24(a).
  • Apply S4 to (−,−,−) to get (−,+,+), hence (−,+,+) is also forbidden.
- Conclusion: In F(+,-), all three triples in the product −1 orbit O−_A={ (−−−), (++−), (−++) } are forbidden. The remaining product −1 singleton (+−+) is allowed by Proposition 14 (the |A|=3 witness). This fully settles the product −1 slice of F(+,-) without further computation.
- Why useful: This gives three more hard local exclusions for F(+,-) from already-proved symmetries, shrinking the unknowns to the product +1 triples { (+++), (+−−), (−+−), (−−+) }.

Implications for 2+2 and the “two checks suffice” reduction
- Under the fixed choice w=(+,+,−,−) (or w=(−,−,+,+)), the two realized ordered shapes across Y_k are (+,−,−) and (−,−,+) (never (−,+,−) for this fixed w). By Lemma 23, these two are equivalent within any fixed F(α,β).
- Therefore, to deploy the 2+2 ansatz uniformly it suffices to check two entries: (+,−,−)∈F(+,+) and (+,−,−)∈F(+,-). By Corollary 9 this covers the remaining two base tables. This matches the refined plan in notes, and it is consistent with the proven internal symmetries.

Small, rigorous invariant for F(+,+): even complement size
- From Lemma 21, F(α,α) is centrally symmetric. Hence |{±1}^3\F(α,α)| is even. In particular, the union‑bound criterion (Corollary 16.1) can only apply if the complement size is 0 (it cannot be 1). This is a structural constraint to aid the final small computation.

Concrete unit tests for the S‑oracle and table symmetries
- S‑oracle sanity: Confirm that (+,+,+,+,+) is non‑O5, (+,−,−,−,−) is O5, (+,−,+,−,+) is non‑O5; and that the sample pairs (ε(τ),i0) listed earlier yield A_τ(e_O) as computed. Check Cor. 20.1: ∏ p_i = sgn(τ) on random O5 samples.
- Internal symmetry tests (must pass if Lemmas 21–23 are correctly implemented): For random (α,β) and t=(x,y,z), validate IsO5(α,β,t)=IsO5(β,α,−t); and IsO5(α,β,t)=IsO5(α,β,S3(t))=IsO5(α,β,S4(t))=IsO5(α,β,(z,y,x)).

Next steps (precise, minimal)
1) Re‑check Lemma 24(b): Either supply a corrected τ‑witness consistent with the F-table convention, or retract it. The contradiction with Lemmas 21–22 and (+++)∈F(+,+) strongly suggests 24(b) is invalid as currently justified.
2) Archive the three firm exclusions in F(+,-): O−_A is forbidden (−−−, ++−, −++), and record (+−+) as allowed (Prop. 14). Populate the remaining four product +1 entries via the S‑oracle.
3) Evaluate the two decisive entries (+,−,−)∈F(+,+) and (+,−,−)∈F(+,-). If both pass, conclude |A|=4 by the 2+2 ansatz (Proposition 11) and AP by Lemma 2.
4) If either fails, run the tiny backtracking solver with parity pruning (Lemma 17) on realized profiles; archive SAT assignments or minimal UNSAT certificates.

Why this is incremental, auditable progress
- We isolated a concrete logical inconsistency in output.md (Lemma 24(b) vs Lemmas 21–22 and the known (+++) allowance), explained its likely cause (coordinate alignment for F‑tables), and provided a clear check to fix it.
- We extended F(+,-) rigorously using proven internal symmetries: the entire product −1 orbit O−_A is now certified forbidden, reducing the unknowns to four product +1 triples.
- We reiterated the minimal decisive checks for the 2+2 method and an invariant (even complement) that constrains the small computation for F(+,+).

Gaps to note in output.md (do not edit now)
- Lemma 24(b) likely incorrect as stated; it contradicts Lemmas 21–22 and Proposition 14. Please mark it for re‑verification or removal.
- When the F‑tables are finalized, restate the fixed coordinate order alongside them to avoid future misalignment between S5 actions and the F‑table semantics.

## Round 0009 — 2025-08-27T20:23:24.436038Z

Round 0009 — Correcting a contradiction in output.md; sharpening F(+,+) and F(+,-) with rigorous deductions; decisive next checks

Key correction: Lemma 24(b) contradicts the proven internal symmetries
- Issue. Lemma 24(b) in output.md claims that in F(+,+) the ordered triple (−,+,+) is forbidden (i.e., (+,+,−,+,+)∈O5). This contradicts Lemmas 21–23 (proved earlier in output.md), which describe S5-induced invariances of the local tables.
- Rigorous contradiction (using only Lemmas 21–23 and Prop. 14):
  1) (+++) ∈ F(+,+) by Prop. 14 (|A|=3 witness, equivalently p=(+,+,+,+,+) is non‑O5).
  2) Apply S3 (Lemma 22): (x,y,z)↦(−y,−x,z). From (+++) we get (−,−,+) ∈ F(+,+).
  3) Apply the x↔z swap (Lemma 23): (z,y,x). From (−,−,+) we get (+,−,−) ∈ F(+,+).
  4) Apply central symmetry for α=β (Lemma 21): t∈F(+,+) ⇒ −t∈F(+,+). From (+,−,−) we get (−,+,+) ∈ F(+,+).
  Therefore (−,+,+) is allowed in F(+,+), contradicting Lemma 24(b). Hence Lemma 24(b) is false and should be retracted or corrected in output.md.
- Why this matters. The F-table symmetries are foundational for reducing the computation; any entry that violates them signals a bug. Fixing this restores consistency and unlocks strong deductions for F(+,+) below.

Consequences for F(+,+) (provable now)
- From the symmetry chain above, we immediately obtain:
  • (+++) ∈ F(+,+) (Prop. 14),
  • (−,−,+) ∈ F(+,+) (by S3),
  • (+,−,−) ∈ F(+,+) and (−,+,+) ∈ F(+,+) (by Lemma 23 and Lemma 21),
  • By Lemma 21 again, (−,−,−), (+,+,−) are also in F(+,+).
- Summary (F(+,+) status): At least 6 of the 8 triples are allowed: {+++, −−−, +−−, −−+, −++, ++−}. The only undecided pair is the central-symmetry pair {+−+, −+−}. By Lemma 21 they are either both allowed or both forbidden. This reduces the F(+,+) computation to a single yes/no decision on one representative, say (+,−,+).
- Practical impact: For any triangle with (α,β)=(+,+), the two ordered shapes realized by the fixed 2+2 choice w=(+,+,−,−), namely (+,−,−) and (−,−,+), are already certified allowed. Thus, triangles of equal‑fixed type pose no obstruction for the 2+2 construction.

Sharpened structure for F(+,-)
- Rigorous forbidden entries (with proofs independent of 24(b)):
  • (−,−,−) ∉ F(+,-) (Lemma 13; canonical O5 representative).
  • (++−) ∉ F(+,-) (Lemma 24(a); explicit τ=(12)(34) witness).
  • By Lemma 23 (x↔z), (−,+,+) ∉ F(+,-) follows from (++−) ∉ F(+,-).
- Rigorous allowed entry:
  • (+,−,+) ∈ F(+,-) (Prop. 14; |A|=3 witness to H5).
- Summary (F(+,-) so far): At least three forbidden triples {−−−, ++−, −++} and at least one allowed {+−+}. By Lemmas 22–23, (+−+) is a 1‑point orbit, so this does not propagate. The status of the three permutations of (+,−,−) remains open and is decisive for the 2+2 ansatz.
- Immediate consequence: The union‑bound route (Cor. 16.1) cannot decide the |A|=4 step, since F(+,-) already forbids ≥3 triples (violating the “≤1 forbidden per table” hypothesis). Keep Cor. 16.1 as a tool, but it does not apply here.

Decisive reduction for the 2+2 ansatz (now fully justified)
- For (α,β)=(+,+): we have proved that both (+,−,−) and (−,−,+) lie in F(+,+). By Cor. 9, the same applies to (α,β)=(−,−).
- For (α,β)=(+,-) (and by Cor. 9, (−,+)), it suffices to decide whether (+,−,−)∈F(+,-). By Lemma 23, this also decides (−,−,+). The singleton permutation (−,+,−) is not realized by the fixed w=(+,+,−,−) on any Y_k, so it is irrelevant for this fixed 2+2 construction.
- Therefore, a single membership check settles the uniform 2+2 strategy: if (+,−,−)∈F(+,-), then for every one‑point instance the assignment x_{ij}=w_i w_j with w having exactly two + and two − yields all four Y_k non‑O5.

Implementation/verification plan (minimal, auditable)
1) Fix output.md by removing Lemma 24(b) (or marking it “false”), and add the provable inclusions for F(+,+) listed above (derivable solely from Lemmas 21–23 and Prop. 14).
2) Implement/validate IsO5 via Lemma 20 (pair‑set S). Unit tests: the symmetry implications S3/S4/Lemma 23 must hold on random inputs (same (α,β)); Cor. 20.1 product identity must match sgn(τ) on sampled witnesses.
3) Compute F(+,+) on the lone undecided representative (+,−,+). Record the final table (it is either 6/8 or 8/8 allowed).
4) Compute F(+,-) on the three permutations of (+,−,−). If (+,−,−) is allowed, conclude the |A|=4 step via the fixed 2+2 construction, hence AP (by Lemma 2). If it is forbidden, proceed to the tiny backtracking solver with parity pruning (Lemma 17). In either case, archive the F‑tables.

Examples and unit checks (to assist the verifier)
- Symmetry chain proving (−,+,+)∈F(+,+): (+++) (allowed by Prop. 14) → S3: (−,−,+) → x↔z: (+,−,−) → central symmetry (α=β): (−,+,+).
- Forbidden trio in F(+,-): (++−) (Lemma 24(a)); x↔z gives (−, +, +); (−,−,−) (Lemma 13). Confirm that S3/S4 do not produce new shapes beyond these three.
- Decisive check: Evaluate IsO5 on p=(+,-,+,−,−) and p=(+,-,−,−,+) (the two ordered shapes realized by w=(+,+,−,−)). If both are non‑O5, the 2+2 construction is confirmed for the opposite‑fixed case.

Notes on output.md (gaps/adjustments)
- Lemma 24(b) is incorrect and should be removed to maintain consistency with Lemmas 21–23. The corrected content should instead record that (−,+,+)∈F(+,+) (by the symmetry chain from (+++)).
- It is worth adding (in a remark) the deduced structure of F(+,+): six entries are allowed a priori; the pair {+−+, −+−} remains to be decided.
- Keep Lemma 24(a); it is compatible with all symmetries proved and with Lemma 13.

Why this is incremental, auditable progress
- We identified and resolved a concrete contradiction in output.md, supplying a short, self‑contained proof using only previously recorded lemmas.
- We sharply reduced the remaining local computation: F(+,+) is down to one undecided orbit; the entire 2+2 viability reduces to a single membership in F(+,-).
- The plan remains minimal (a handful of IsO5 queries) and includes strong unit tests (symmetry checks and the three explicit F(+,-) forbiddens). This will decisively close the |A|=4 step or pinpoint the small residual casework needed via backtracking.

## Round 0009 — 2025-08-27T20:23:25.252354Z

# Round 0009 — Correcting Lemma 24(b); tightening the F-tables with rigorous consequences; shrinking the remaining computation

Summary of status and key tools already in output.md
- The one-point reduction (Proposition 3) and the |A|=4 six-variable CSP are sound. The exact O5 membership test via the S-pair set (Lemma 20), together with the ε-cocycle (Lemma 18) and ε on generators (Lemma 19), is correct and sufficient to implement IsO5.
- Internal symmetries of the local tables F(α,β) are recorded (Lemmas 21–23): central symmetry for α=β (swap of fixed coords), and two in-table transforms S3: (x,y,z)↔(−y,−x,z), S4: (x,y,z)↔(x,−z,−y), and the derived swap (x,y,z)↔(z,y,x). These preserve membership and triple-product within a fixed F(α,β).

Critical correction — Lemma 24(b) is false
- Claim in output.md Lemma 24(b): “In F(+,+), the ordered triple (−,+,+) is forbidden.” This contradicts Lemmas 21–23 together with a known allowed entry.
- Rigorous contradiction:
  1) (+++) ∈ F(+,+) because p=(+,+,+,+,+)=C5 is non-O5 (Proposition 14; also directly obvious).
  2) Apply S4 (Lemma 22) to (+++): we get (+,−,−) ∈ F(+,+).
  3) Apply Lemma 23 (x↔z): (−,−,+) ∈ F(+,+).
  4) Apply central symmetry for α=β (Lemma 21): negate each of these three allowed triples to get (−−−), (−,+,+), (+,+,−) ∈ F(+,+).
  Hence (−,+,+) must be allowed in F(+,+), contradicting Lemma 24(b). Therefore 24(b) is incorrect and should be removed or corrected in output.md.

New rigorous consequences (derived via Lemmas 21–23 and known entries)
- Lemma A (proved here). In F(+,+), all six triples in O+_A ∪ (−O+_A) are allowed, where O+_A = { (+++), (+,−,−), (−,−,+) } and (−O+_A) = { (−−−), (−,+,+), (+,+,−) }.
  Proof sketch. (+++) is allowed. Apply S4 to get (+,−,−), then Lemma 23 to get (−,−,+). Apply Lemma 21 (α=β) to negate these three, obtaining the other three allowed triples. Each step preserves membership. ∎
  Why useful: This settles two-thirds of F(+,+) without computation and, in particular, certifies the two ordered shapes (+,−,−) and (−,−,+) required by the fixed 2+2 ansatz.

- Lemma B (proved here). In F(+,-), all three triples in the size-3 product −1 orbit O−_A = { (−−−), (++−), (−++) } are forbidden, while (+,−,+) is allowed (Proposition 14).
  Proof. (−−−) is forbidden by Lemma 13. (++−) is forbidden by Lemma 24(a). By S3/S4 closure (Lemma 22), the orbit generated by these two equals O−_A, so (−++) is also forbidden. (+,−,+) was already shown allowed at |A|=3 (Proposition 14). ∎
  Why useful: This fully determines the product −1 part of F(+,-), leaving only the product +1 orbits to decide.

Consequences for the |A|=4 step and the 2+2 ansatz
- Equal-fixed case (++ and −−): By Lemma A and Corollary 9, the two shapes realized by the fixed 2+2 assignment w=(+,+,−,−) (namely (+,−,−) and (−,−,+), and their sign-negations for (−−)) are allowed. Thus whenever a triangle uses (α,β)∈{(++),(−−)}, the fixed 2+2 shapes are admissible.
- Opposite-fixed cases (+− and −+): By Lemma B (and Corollary 9), only the product +1 triples remain to be classified. The fixed 2+2 ansatz requires the two shapes (+,−,−) and (−,−,+); by Lemma 23, it suffices to check a single representative (+,−,−) in F(+,-). Corollary 9 then transfers this to F(−,+).
- Important caveat (as noted in earlier rounds and verifier feedback): Even if both shapes are allowed in each pair-type, choosing w so that each Y_k lands on an allowed shape is a small combinatorial selection problem (exactly two k realize (−,−,+), two realize (+,−,−) under any w with two pluses). If a pair-type appears three times among k and permits only one of the two shapes, the fixed 2+2 ansatz may still fail on that instance. Hence the full resolution still requires either: (i) both shapes allowed for every pair-type appearing in the instance (then we can place the two pluses appropriately), or (ii) a fall-back small backtracking over the six edge variables.

Shrinking the remaining computation — minimal decisive checks
- Thanks to Lemmas A and B, only the product +1 entries of F(+,-) remain undecided. By Lemmas 21–23, within F(+,-) it suffices to test at most the two representatives (+++) and (+,−,−), plus the singleton (−,+,−) (since it forms its own orbit). Thus three IsO5 queries settle F(+,-) completely:
  1) (+++) ∈? F(+,-)
  2) (+,−,−) ∈? F(+,-)  [by Lemma 23 this also decides (−,−,+)]
  3) (−,+,−) ∈? F(+,-)
- For completeness, F(+,+) still has two singleton-orbit entries whose status is not fixed by Lemma A: (+,−,+) and (−,+,−). These are not needed for the fixed 2+2 ansatz but can be recorded by two extra queries.

Auditable unit tests and examples (to validate implementation)
- Validate Lemma 22 symmetries on random entries: IsO5(α,β,x,y,z) equals IsO5(α,β,−y,−x,z) and IsO5(α,β,x,−z,−y);
  and Lemma 23: IsO5(α,β,x,y,z)=IsO5(α,β,z,y,x).
- Validate central symmetry for α=β (Lemma 21): (x,y,z)∈F(α,α) iff (−x,−y,−z)∈F(α,α).
- Check the forbidden set in Lemma B: (−−−), (++−), (−++) are O5 for (α,β)=(+,-); (+,−,+) is non-O5.
- Reconfirm canonical sanity: (+,−,−,−,−) ∈ O5; (+,+,+,+,+) ∉ O5; (+,−,+,−,+) ∉ O5.

Obstacles and why a tiny computation still remains
- An analytic classification of the product +1 part of F(+,-) still seems delicate without enumerating S (the 120 pairs). The S-oracle (Lemma 20) is the right tool and reduces the remaining unknowns to at most three checks listed above.
- The union-bound route (Corollary 16.1) cannot close the |A|=4 step since F(+,-) already forbids at least three triples (Lemma B). The fixed 2+2 ansatz reduces the need to decide only whether (+,−,−) is allowed in F(+,-); if yes, the ansatz often works, but a short backtracking remains prudent for adversarial distributions of pair-types across k.

Actionable next steps for the verifier (precise, minimal)
1) Remove (or mark false) output.md Lemma 24(b) and any deductions from it; retain Lemma 24(a).
2) Implement IsO5 via Lemma 20 (S-pair set). Validate with the symmetry unit tests above and Corollary 20.1 (product-of-entries = sgn(τ)).
3) Decide the three remaining entries of F(+,-): (+++), (+,−,−), (−,+,−). Record the full table; derive F(−,+) by Corollary 9.
4) Optionally, record the two singleton-orbit entries in F(+,+): (+,−,+), (−,+,−); though Lemma A already suffices for the fixed 2+2 shape requirements in the equal-fixed case.
5) Attempt the fixed 2+2 ansatz w=(+,+,−,−) on representative |A|=4 profiles; if any instance fails (because a pair-type appears three times and permits only one of the two shapes), run the tiny backtracking solver with parity pruning (Lemma 17).

Gaps and corrections to note in output.md
- Lemma 24(b) must be retracted: it contradicts Lemmas 21–23 and the known allowed entry (+++)∈F(+,+). The calculation via τ=(13) cannot be used to forbid (−,+,+) in F(+,+) because Lemmas 21–23 compel (−,+,+) to be allowed once (+++) is allowed.
- Recommend adding Lemma A and Lemma B (as stated above) explicitly: they consolidate many entries in F(+,+) and F(+,-) and sharply reduce the remaining computation.
- When the F(+,-) product +1 entries are decided, include the final tables and restate the fixed coordinate convention adjacent to their definition for reproducibility.

Why this is incremental and auditable
- We identified and rigorously refuted a false lemma (24(b)) in output.md, using only the already-recorded symmetries and a known allowed entry.
- We proved two new, checkable lemmas (A and B) that substantially determine the base tables without computation and reduce the remaining unknowns in F(+,-) to at most three representative queries.
- We outlined a minimal, deterministic plan to finish: three IsO5 checks for F(+,-), optional two for F(+,+), then either apply the fixed 2+2 assignment with a small combinatorial placement of the two pluses or fall back to a tiny backtracking consistent with Lemma 17.

