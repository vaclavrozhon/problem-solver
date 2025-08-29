## Round 0010 — 2025-08-27T19:47:47.645358Z

Round 0010 — audit of output.md, endpoint-cleanup notes, and a concrete Stage‑2 plan for oriented paths (O(1) vs Θ(log* n))

Audit of output.md (gaps, inconsistencies, and easy fixes)
- Duplicate/contradictory remarks on Stage‑1: There is still a “Remark (Stage‑1 equivalence pending endpoint treatment)” before Lemma E2, but Theorem S1‑path later resolves endpoint issues. This is now inconsistent. Suggested fix: remove or rewrite the earlier remark to forward‑reference Theorem S1‑path.
- Numbering collisions and duplication:
  • Proposition 6, 6A, 6B all exist; 6 and 6B both are base cases (k=1→2 and k=2→3) and 6A is another base case (k_flag=1 variant). Consider renumbering to 6 (k=1→2), 7 (k=2→3), 8 (k=3→4), or add clear “(Base cases)” headers to avoid confusion.
  • Concatenation appears as Lemma 2 (k_flag≥4) and Lemma 11 (all k_flag). Lemma 11 strictly subsumes Lemma 2; a short note stating “Lemma 11 subsumes Lemma 2” would prevent confusion.
- Transition‑cost mismatch: Proposition 9 still states “Each transition costs O(β^5) in the k_flag≥4 regime,” while a later “Correction to Proposition 9” paragraph records the improved O(β^4) bound (via Proposition 19). These must be aligned; keep the O(β^4) bound in the definitive statement of Proposition 9.
- Small‑n fallback in Theorem S1‑path (⇐): It says “0 or 1 separators handled by brute‑force completion using Ext tables in constant radius.” This is plausible, but a one‑line lemma would clarify that any path of length < K can be labeled (or rejected) by a constant‑time rule derived from Ext (finite lookup radius K). This would parallel Lemma E2’s style, ensuring no gap at tiny n.
- Orientation/convention reminder: Theorem S1‑path relies on the global convention (L1,L2,R2,R1); all seam references are consistent with earlier definitions. No action, but a short “Indexing reminder” near Definition of OutR2/OutL1 would help readers.

Endpoint coupling in Stage‑1 — sanity check on the new content
- The strengthened endpoint witnesses g_L(τ_end,s,τ_b), g_R(τ_c,s,τ_end), with (iii) β2∈OutR2(τ_b,s), β1∈OutL1(τ_c,s), are now integrated and correctly cover the first/last interior block via W_{b⊙c}. This closes the earlier gap.
- Preprocessing coverage is complete: T and T_long (Prop. 9), Ext (Lemmas 1, 11), W (Prop. 21), V_left/V_right (Lemma E1), and OutR2/OutL1 are all defined. The NEXPTIME verification clause is sound.

Stage‑2 on globally oriented paths (O(1) vs Θ(log* n)) — proposed path‑specific certificate and theorem
Rationale. To complete the trichotomy with a single‑exponential (in β) nondeterministic verifier, it is convenient to mirror the paper’s Section 4.4 feasible‑function framework, specialized to oriented paths. This avoids having to synthesize interior outputs from bare boundary quadruples and leverages the (ℓ_width,ℓ_count,ℓ_pattern) partition (Section 4.3 in the paper) in O(1) rounds.

Definitions (path specialization; reusing the paper’s Gw,z and Gw1,w2,S)
- Fix r=1 and ℓ_pump=|T| from Prop. 9. For any 1≤|w|≤ℓ_pump and z≥0, Gw,z is the path wr · wz · wr with complete output labeling f0(w)^{z+2r} (here f0 is a Stage‑2 function; see below). Mid(Gw,z): the central wz.
- For any w1,w2 with 1≤|wi|≤ℓ_pump and any S (possibly empty), Gw1,w2,S is the path w1^{ℓ_pump+2r} · S · w2^{ℓ_pump+2r} with a partial labeling that fixes the first 2r|w1| outputs to f0(w1)^{2r} and the last 2r|w2| outputs to f0(w2)^{2r}. Mid(Gw1,w2,S): w1^{ℓ_pump+r} · S · w2^{ℓ_pump+r}.
- Stage‑2 feasible function for paths. A map f0: {w ∈ Σ_in^k : 1≤k≤ℓ_pump} → Σ_out^k is path‑feasible if:
  (F1) For each w, the complete labeling f0(w) is locally legal, and for Gw,1 the labeling is locally consistent on Mid(Gw,1). (Equivalently, Gw,z is locally consistent on its mid for all z≥1.)
  (F2) For each Gw1,w2,S, there exists a completion L⋄ that is locally consistent on Mid(Gw1,w2,S).
Remark. This is the path analogue of the cycle notion used in the attached paper (Lemmas 23–27), with the same quantitative parameters (ℓ_pump) and “mid‑block extendibility” semantics; the only change is that we do not wrap ends.

Theorem S2‑path (O(1) vs Θ(log* n) on oriented paths; verifiable in NEXPTIME)
- Statement. An r=1 β‑normalized LCL on globally oriented paths has deterministic LOCAL complexity O(1) iff there exists a path‑feasible function f0. Otherwise, if Theorem S1‑path holds but no f0 exists, the complexity is Θ(log* n).
- (⇒) Given an O(1)‑round algorithm A, extract f0 as in the paper’s Lemma 24: for each 1≤|w|≤ℓ_pump, simulate A on wi · w^{2r+1} · wi with distinct IDs confined to a constant halo; define f0(w) as A’s outputs on w (one period). Local legality implies (F1), and by the same mid‑block simulation trick, (F2) holds for all Gw1,w2,S (replace the two long contexts by pumped canonical representatives so that the constant runtime halos are disjoint). This is the path version of Lemmas 24–25.
- (⇐) Given f0, compute in O(1) rounds an (ℓ_width,ℓ_count,ℓ_pattern)‑partition tailored to oriented paths (paper’s Lemma 22; orientation is given, so Lemma 19’s orientation step is unnecessary): short paths of length ≤2ℓ_width get explicit ranks; long paths P are repetitions wk with primitive w, |w|≤ℓ_pattern and k≥ℓ_count, and each node knows w. Label as follows:
  • For each long P with period w, label the central window of length 2r in every period occurrence by f0(w) (anchored and repeated), thereby fixing a 2r‑spaced set of “mid blocks” across P.
  • The remaining subpaths between these mid blocks (and any adjacent short/irregular segments) have total length O(ℓ_width+ℓ_pattern)=O(1). For each such S with adjacent periodic contexts represented by w1 and w2, apply (F2) to Gw1,w2,S to complete S locally. (Ends of the path are treated similarly, with one side lacking a further context; in that case the partially labeled path is a prefix/suffix of Gw1,w2,S and is handled within the same constant‑radius templates.)
  • All fillings are constant‑radius choices from precomputed tables indexed by (w1,S,w2), exactly as in the cycle proof.
  Hence a deterministic O(1) algorithm exists.
- NEXPTIME verification. As in Lemma 23, checking path‑feasibility of f0 reduces to finitely many Gw,1 (one z=1 per w) and finitely many Gw1,w2,S, where S ranges over a representative per Type τ (Lemmas 11 and 14 guarantee a choice with |S|≤ℓ_pump), plus S=∅. With T enumerated (Prop. 9) and Ext computed (Props. 5, 19), all checks are boolean table lookups; total time 2^{poly(β)}.

Endpoint handling in Stage‑2
- Unlike Stage‑1, Stage‑2’s construction does not require special endpoint witnesses: every short/irregular segment, including the two end segments, falls under the Gw1,w2,S completion rule with one or both contexts being (constant‑size) pumped fragments. No extra V_left/V_right matrices are needed; the end segments are simply instances of S.

Relation to the earlier Q_τ approach
- The boundary‑quadruple certificate Q_τ (with bridging across arbitrary τ_S) is intuitively sufficient but requires embedding a per‑type interior filler to produce node outputs in O(1). The f0‑based approach avoids this extra layer and follows the attached paper’s decidable formulation; both are single‑exponential in β. We suggest integrating S2‑path using f0 for clarity and alignment with the literature.

Mini‑lemmas to consider adding (short, testable)
- Tiny‑path completion lemma. Any path of length < K := ℓ_pump+4 is solvable or rejectable in constant radius by enumerating all candidates in Ext for its Type. This justifies the small‑n fallback in S1‑path and S2‑path.
- Orientation‑specialized (ℓ_width,ℓ_count,ℓ_pattern) partition. State the oriented‑path version (derivable from the paper’s Lemma 22 without re‑orienting) with explicit parameters ℓ_width=ℓ_pattern=ℓ_pump and ℓ_count=2ℓ_pump+2.

Sanity checks and examples for S2‑path
- Equality LCL (E={(c,c)}, A_0=A_1={c}). Take f0(w)≡c^{|w|}. Gw,1 and all Gw1,w2,S mid‑blocks are trivially consistent. Classified O(1) (agrees with S1‑path acceptance).
- Proper 2‑coloring on oriented paths. f0 cannot satisfy (F1) across Gw,1 (mid‑block requires a consistent 2r window under period‑1), so S2‑path rejects; S1‑path accepts with f_mid, hence Θ(log* n).

Actionable next steps for output.md
1) Add S2‑path (Stage‑2 theorem for oriented paths) using the f0 certificate: definitions of Gw,z and Gw1,w2,S, the feasibility conditions (F1)–(F2), the two directions of the equivalence, and the NEXPTIME verification argument.
2) Insert the oriented‑path (ℓ_width,ℓ_count,ℓ_pattern) partition statement with parameters and a short proof sketch (pointing to the paper’s Lemmas 20–22, noting global orientation simplifies the orientation step).
3) Clean up numbering and the lingering Stage‑1 remark; align Prop. 9’s transition cost to O(β^4) where referenced.
4) Optionally add the tiny‑path completion lemma to justify the small‑n fallback.

Why this is incremental and auditable
- All added checks for S2‑path reduce to Ext‑table membership (finite, precomputable) and pumping lemmas already in output.md; the structure matches the paper’s decidable formulation (Lemma 23). The verifier modifications (table sizes, enumeration scopes, and complexity bounds) remain within 2^{poly(β)}.
- The proposed edits are localized: no changes to S1‑path content, just removal of an obsolete remark and consistency fixes, plus the new S2‑path section with explicit definitions and a proof outline tied to existing lemmas.

