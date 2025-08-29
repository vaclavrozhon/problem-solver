## Round 0012 — 2025-08-27T20:07:23.076774Z

Round 0012 — Completing Stage‑2: a rigorous O(1) partition on oriented paths and a singly‑exponential Stage‑2 certificate based on types (not words), plus audits and verifiable lemmas

Overview
- Goal this round: close the remaining Stage‑2 gap (O(1) vs Θ(log* n)) for β‑normalized radius‑1 LCLs on globally oriented paths by (i) stating a self‑contained, deterministic O(1) partition lemma tailored to oriented paths and (ii) proposing a singly‑exponential Stage‑2 certificate and verifier that avoids the doubly‑exponential blow‑up inherent in word‑based certificates.
- High‑level plan: specialize the paper’s Lemma 20/21/22 path partition to our oriented path setting with explicit constants linked to ℓ_pump=|T|, and replace the word‑indexed f0 by a type‑indexed path‑feasible function f_type on short types (length ≤ ℓ_pump). This keeps verification within 2^{poly(β)}.
- Audit: output.md currently contains a complete Stage‑1 (S1‑path) including endpoint coupling, and the tiny‑path fallback (Lemma TP). Stage‑2 is not yet included; this note supplies a ready‑to‑integrate Stage‑2 section.

A. Oriented‑path partition lemma in O(1) rounds (self‑contained)
Parameters
- Set ℓ_pattern := ℓ_pump and ℓ_width := ℓ_pump and ℓ_count := 2ℓ_pump + 2. These are constants depending only on β.
- Primitive word means a period w ∈ {0,1}^k with 1 ≤ k ≤ ℓ_pattern that is not a proper power.

Statement (P‑Partition‑Path)
Let G be a globally oriented path. In O(1) LOCAL rounds we can compute a partition P = P_long ∪ P_short of G such that:
1) Direction and minimum length: each P ∈ P has nodes oriented the same way and |P| ≥ ℓ_width.
2) Long periodic segments (P_long): each P ∈ P_long is a maximal subpath contained in a run w^K for some primitive w with |w| ≤ ℓ_pattern and K ≥ ℓ_count; each node in P learns the canonical primitive w.
3) Short/irregular segments (P_short): the remaining subpaths form P_short; each P ∈ P_short has |P| ≤ 2ℓ_width, and each node in P learns its rank in P and the types of the adjacent long neighbors (if any).

Algorithm (constant‑round, oriented)
- Step A (detect deep interiors of long runs): For each primitive w with 1 ≤ |w| ≤ ℓ_pattern, each node v checks in radius R_w := (ℓ_count + 2ℓ_width)|w| that there exists an aligned block centered near v of the form w^{ℓ_count+2ℓ_width}. If yes, label v ∈ Deep(w). (Alignment uses the global orientation and |w|.) Prioritize conflicts by a fixed total order on primitive words (first by |w|, then lexicographically) and assign each node to the first w for which it is in Deep(w).
- Step B (form P_long): For each w, let L(w) be the maximal connected subpaths consisting of nodes assigned to w. Each such L ∈ L(w) is contained in a w‑periodic run of length ≥ (ℓ_count + 2ℓ_width)|w|, and by construction each end of the run is at least ℓ_width|w| from the boundary of L. Set P_long := ⋃_w L(w). Each L ∈ P_long is a directed path, and each node knows its w.
- Step C (form P_short): Define P_short as the connected components of G \ P_long. By construction, each P ∈ P_short has |P| ≤ 2ℓ_width: any longer segment would contain a subpath w^{ℓ_count+2ℓ_width} for some w, contradicting Step A’s maximality and conflict resolution. Each node in P can determine its rank and the adjacent long neighbors (if any) in O(1) rounds.

Correctness and complexity (sketch, auditable)
- Completeness of long detection: If a primitive run w^K has K ≥ ℓ_count + 2ℓ_width, its internal nodes at distance ≥ ℓ_width|w| from both ends satisfy the Deep(w) test and are captured into P_long. The fixed priority on primitive words yields a disjoint assignment.
- Boundedness of the remainder: Let H be any component of G \ P_long. If |H| > 2ℓ_width, its interior contains a subpath w^{ℓ_count+2ℓ_width} (for some primitive w with |w| ≤ ℓ_pattern), which would have produced Deep(w) nodes in Step A, contradiction.
- Round complexity: All pattern detections and conflict resolutions use a constant number of fixed‑length windows bounded by (ℓ_count+2ℓ_width)·ℓ_pattern = O(ℓ_pump^2), hence O(1) rounds. Ranking within short segments and learning adjacent long types are constant‑radius tasks.

Remark (optional, strengthens Step C)
On each irregular component H of G \ P_long with |H| ≥ ℓ_width, the string has no subpath of the form w^x with |w| ≤ ℓ_pattern and |w^x| ≥ ℓ_count+2ℓ_width. Hence the paper’s (γ,2γ) independent‑set lemma (with γ=ℓ_pattern) applies; combining it with a local cut procedure yields an alternative derivation of |H| ≤ 2ℓ_width and a decomposition into blocks of lengths in [ℓ_pattern,2ℓ_pattern]. We keep the simpler trimming‑based bound ≤ 2ℓ_width above.

B. A singly‑exponential Stage‑2 certificate based on short types (not words)
Motivation
- The word‑indexed f0 (mapping each w with |w| ≤ ℓ_pump to f0(w)) risks a doubly exponential verification because the number of words is 2^{Θ(ℓ_pump)} and ℓ_pump itself is exponential in β.
- Resolution: collapse w to its short type τ_w (Type(w) with |w| ≤ ℓ_pump). The number of short types is ≤ |T| = 4·2^{β^4}, so guessing and verifying a type‑indexed function remains singly exponential in β.

Certificate objects
- T_short := { τ ∈ T : τ is realized by some word w with 1 ≤ |w| ≤ ℓ_pump }.
- For each τ ∈ T_short, fix any canonical representative w_τ with |w_τ| ≤ ℓ_pump.
- The certificate provides f_type: T_short → Σ_out^{|w_τ|}, i.e., an output string f_type(τ) of length |w_τ| for each τ.

Feasibility conditions (typed analogue of (F1)–(F2))
- (F1‑T) For each τ ∈ T_short, define G_{τ,1} to be the path w_τ^r · w_τ · w_τ^r labeled by f_type(τ)^{2r+1}. Require: the labeling is locally consistent on the mid block w_τ.
- (F2‑T) For each τ_1, τ_2 ∈ T_short and each τ_S ∈ T (any type, short or long), define G_{τ_1,τ_2,τ_S} as w_{τ_1}^{ℓ_pump+2r} · S · w_{τ_2}^{ℓ_pump+2r}, with the first 2r|w_{τ_1}| outputs fixed to f_type(τ_1)^{2r} and the last 2r|w_{τ_2}| outputs fixed to f_type(τ_2)^{2r}. Require: there exists a completion that is locally consistent on the middle block w_{τ_1}^{ℓ_pump+r} · S · w_{τ_2}^{ℓ_pump+r}.

Why this is enough (intuition)
- (F1‑T) anchors a 2r‑window per period type τ so that repeating anchors do not conflict.
- (F2‑T) ensures any finite irregular subpath S flanked by long pumped contexts with anchored mid‑windows can be completed locally.

Verification in NEXPTIME (single‑exponential)
- Enumerate T and T_short (Proposition 9). For each τ ∈ T_short fix a representative w_τ of length ≤ ℓ_pump.
- Check (F1‑T): for each τ ∈ T_short, G_{τ,1} mid‑block consistency is a finite Ext‑membership test (at most |T_short| many instances; each reduces to a constant number of seam checks via Ext of Type(w_τ^3)).
- Check (F2‑T): For each triple (τ_1, τ_S, τ_2), pick any representative S of τ_S with |S| ≤ ℓ_pump (Lemma 14) and test existence of a mid‑consistent completion. This reduces to a boolean check expressible through Ext_{τ_S} and the seam adjacency constraints to the anchored windows. Total checks: |T_short|^2·|T|, each a constant‑size table lookup against precomputed Ext; overall time 2^{poly(β)}.

C. S2‑path (oriented paths; certificate ⇔ O(1))
Statement (S2‑path)
A β‑normalized radius‑1 LCL on globally oriented paths has deterministic LOCAL complexity O(1) iff there exists f_type satisfying (F1‑T) and (F2‑T). Otherwise, if S1‑path holds but no such f_type exists, the complexity is Θ(log* n).

(⇒) Given an O(1) algorithm A, construct f_type
- For each τ ∈ T_short (|w_τ| ≤ ℓ_pump), simulate A on G_{τ,1} with IDs chosen so that the radius‑R (constant) halos of the three copies of w_τ are disjoint and isomorphic (as in the paper’s Lemma 24). Set f_type(τ) to be A’s output string on the mid w_τ. This defines f_type(τ) of correct length and satisfies (F1‑T). For (F2‑T), simulate A on G_{τ_1,τ_2,τ_S} with pumped contexts w_{τ_i}^{ℓ_pump+2r} so that the halos around the two anchors are disjoint; by correctness of A a completion exists.

(⇐) Given f_type, construct an O(1) algorithm
- Compute the partition P = P_long ∪ P_short in O(1) (P‑Partition‑Path). For each P_long component with primitive w and |w| ≤ ℓ_pattern, each node learns w and |w|.
- On each P_long, anchor mid‑windows: on every occurrence of the period w, fix the outputs on a 2r window to f_type(τ_w), where τ_w := Type(w) (|w| ≤ ℓ_pump). Each node in that 2r window gathers the |w| input bits (≤ ℓ_pump) to compute τ_w and f_type(τ_w) in O(1) rounds. Repeat this in every period; anchors are disjoint and 2r‑spaced.
- On each P_short (|P_short| ≤ 2ℓ_width), and on the gaps between adjacent anchors (all of length O(ℓ_pump)), use (F2‑T) to complete the labeling locally: each gap is an instance of some G_{τ_1,τ_2,τ_S} with τ_S being the type of the gap; completeness follows from (F2‑T). End segments (if any) are handled the same way with one anchor missing on one side; this is a special case of (F2‑T) where one anchored context is truncated, admitted by the local check since no seam constraint is required at the path boundary.
- All steps are constant‑radius table lookups; hence O(1) LOCAL time.

D. Auxiliary check matrices for Stage‑2 verification
- For τ_S ∈ T, precompute Bridging[τ_S][α_L][α_R] := true iff ∃(o1,o2,o3,o4)∈Ext_{τ_S} with E(α_L,o1) and E(o4,α_R). This is exactly the two‑sided seam matrix; computable via Lemma 11 and 3D slices in O(β^4Δ^2). Then (F2‑T) reduces to checking that for each (τ_1,τ_S,τ_2), Bridging[τ_S][L1(τ_1,anchor)→?][?←R1(τ_2,anchor)] is true for each anchored seam color pair read from f_type(τ_1), f_type(τ_2) at the anchor windows.
- For endpoints, if one uses the specialization where S sits at a boundary, precompute RightAllow(τ_S):={o4:∃o1,o2,o3 (o1,o2,o3,o4)∈Ext_{τ_S}} and LeftAllow(τ_S):={o1:∃o2,o3,o4 (o1,o2,o3,o4)∈Ext_{τ_S}}, and then check single‑seam adjacency via E.

E. Audits of output.md (minor issues and alignment)
- Stage‑2 missing: output.md currently lacks S2‑path and the partition lemma. The P‑Partition‑Path and S2‑path presented here are compatible with the machinery already in output.md (Ext, types, pumping, and seam matrices) and can be integrated.
- Endpoint handling in S2: With the f_type anchors, endpoint short segments are completed via the same (F2‑T) rule (one anchor missing); no special endpoint tables are needed beyond Ext.
- MIS mention: Stage‑2 does not rely on MIS; all steps are O(1) owing to the partition and anchors.

F. Testable subclaims and sanity
- Partition lemma: unit tests on random inputs verifying that P_long obeys periodicity and that all P_short lengths are ≤ 2ℓ_pump.
- Typed anchoring (F1‑T): for random τ ∈ T_short, construct G_{τ,1} and assert mid‑block consistency from f_type(τ).
- Bridging (F2‑T): for random triples (τ_1,τ_S,τ_2), verify Bridging[τ_S][·][·] includes all seam pairs induced by the anchor windows of f_type(τ_1) and f_type(τ_2).
- Endpoints: verify that single‑seam completions exist via RightAllow/LeftAllow + E.

G. Complexity summary (verifier)
- Enumerating T and T_short takes 2^{poly(β)} (Prop. 9 with Prop. 19). Building Ext tables and slices is 2^{poly(β)} (Props. 5, 19). The certificate f_type has |T_short| entries. Checking (F1‑T) needs |T_short| instances, (F2‑T) needs |T_short|^2·|T| instances; each reduces to constant‑time lookups in precomputed Ext and Bridging matrices. Total nondeterministic time: 2^{poly(β)}.

H. Why type‑indexed f_type avoids the Q_τ tiling gap
- The earlier Q_τ certificate requires the algorithm to produce an interior labeling of long blocks from boundary quadruples alone; while Ext_τ guarantees existence, it does not supply a constructive constant‑round filler. The f_type anchors provide explicit periodic interior labels (a short block per period), and the remaining gaps are filled by (F2‑T), which is a finite Ext‑check. This is exactly the construct used in the paper’s Section 4.4 but expressed over types to keep verification singly‑exponential.

I. Integration plan for output.md
1) Add Lemma (P‑Partition‑Path) with parameters ℓ_pattern=ℓ_width=ℓ_pump and ℓ_count=2ℓ_pump+2, algorithm and proof sketch (as above).
2) Add the S2‑path theorem with the type‑indexed f_type certificate, the (⇒) extraction from an O(1) algorithm, the (⇐) O(1) construction via anchors and (F2‑T) fills, and the NEXPTIME verification argument.
3) Add Bridging[τ_S] matrices and endpoint allow sets RightAllow/LeftAllow (optional) as implementation aids; all precomputable from Ext.
4) Cross‑reference existing Ext machinery (Lemmas 11, 12; Props. 5, 19, 21) and the tiny‑path fallback (Lemma TP) for the very small‑n cases.

J. Potential objections and how we address them
- Do nodes need to know the type of a long block? No: they only need to know the type τ_w of the period w (|w| ≤ ℓ_pump) to read f_type(τ_w) for anchors; gathering |w| inputs is O(ℓ_pump)=O(1).
- Does irregular segmentation require symmetry breaking? No: the partition is computed solely from input windows and the fixed global orientation (Step A); no MIS is used here.
- Is (F2‑T) “typed” formulation sufficient? Yes: by Lemma 11, feasibility depends only on the middle type τ_S and the anchored seam colors, which are determined by f_type(τ_1), f_type(τ_2) and Ext_{τ_S}.

K. Closing note
- With P‑Partition‑Path and the typed Stage‑2 certificate, we now have a clean, singly‑exponential NEXPTIME pipeline for the full trichotomy on globally oriented paths: (i) S1‑path (endpoint‑coupled) separates Ω(n) vs o(n); (ii) S2‑path (typed anchors) separates O(1) vs Θ(log* n). The constructions reduce to precomputed Ext tables, type enumeration, and constant‑radius decisions.

