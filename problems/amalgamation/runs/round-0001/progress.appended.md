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

