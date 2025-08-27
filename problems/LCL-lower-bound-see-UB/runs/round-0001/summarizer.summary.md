Round snapshot: two prover sketches plus verifier feedback. Prover-01 proposed a window-anchored activation fix (place RID/GID and HEAD/RUN inside wb/wc) and pumping-based existence of many active types; it also argued inactive contexts can be neutralized with ⊥ and that (F2) can be trivialized by ⊥-plumbing. Prover-02 introduced a gated-bridge gadget that turns ON only for intended (VAR_i, CLA_j) ordered pairs (forcing CAP propagation when i ∈ vars(j)), plus two finite-check lemmas (finite-z periodicity for (F2) and a layered radius-1 DP for extendibility in O(k·β^2)). The verifier endorsed combining gating with window-anchoring but flagged two untenable claims (deriving 2^B types from only 2 boundary nodes; O(1) local clause-triple validation) and requested explicit C_in–out/C_out–out tables for the four boundary nodes and conduits, a formal type-separation lemma, and a poly(s)-length clause-decoder tableau. Verdict: uncertain. Citations: prover-01.out.json, prover-02.out.json, Verifier (summary_md).

---
**User additional feedback (2025-08-27T11:22:51.513658Z)**

lets try to prove this by reducing to (implicit exponential-sized) SAT formula
