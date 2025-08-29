Both reports converge on the same core fix: Stage‑1 for oriented paths must couple the endpoint‑adjacent separator to the interior feasible function via Out‑sets. This resolves the previously identified flaw in output.md (endpoint treatment pending). The proposed certificate (f_mid for interior separators and g_L, g_R for the two endpoint‑adjacent separators, each taking as a third argument the adjacent long type) is correct in spirit and aligns with the Ext/W machinery we have already built. In particular:

- Correctness: The necessity of the coupling is convincingly argued by the obstruction template (and toy examples): without (iii) β2 ∈ OutR2(τ_b,s) (left end) and (iii) β1 ∈ OutL1(τ_c,s) (right end), the first/last interior block may fail to fill even when V_left/V_right and all interior W-matrix checks hold. This is a genuine gap now fixed by requiring alignment with Out‑sets.
- Rigor: The suggested strengthening yields a clean equivalence statement (Theorem S1‑path) and a verifiable certificate in 2^{poly(β)} time using only table lookups (W, V_left/V_right, OutR2/OutL1). The construction direction (⇐) is fully covered by our existing Ext‑concatenation and W‑matrices, plus Lemma E1 for endpoint blocks. The existence direction (⇒) relies on the standard pumping/canonical‑context extraction to define f_mid and on padding to isolate the runtime halo when defining g_L/g_R; this is standard in LOCAL classification and is consistent with the machinery we already recorded (pumping lemmas and T_long).
- Complexity: Both reports correctly point out that Proposition 9 can be tightened to use the O(β^4) append (Proposition 19) once k_flag ≥ 4, improving the preprocessing constants. This should be recorded explicitly.

Minor editorial issues flagged by the provers (duplicate numbering of Proposition 6, Lemma 2 vs Lemma 11 subsumption) are real. We will not renumber in this round, but we will add a note to avoid confusion and add the new content as new named lemmas/theorem.

What we will add now to output.md:
- A correction note tightening Prop. 9’s append complexity from O(β^5) to O(β^4) for k_flag ≥ 4 via Prop. 19.
- An Endpoint–interior bridging lemma (a direct unpacking of W_{b⊙c}), making explicit the condition used in the (⇐) construction.
- Theorem S1‑path (endpoint‑coupled equivalence) with a careful proof in both directions using our existing Ext/W/V apparatus, Out‑sets, MIS placement, and standard pumping arguments.

Next steps for provers:
- Stage‑2: Specialize the constant‑radius partition/tiling lemma to oriented paths and formalize the constant‑round construction from per‑type interfaces Q_τ. Provide explicit parameters (ℓ_width, ℓ_pattern, ℓ_count) and a complete proof that the produced labeling is legal, using Ext‑concatenation and endpoint lemmas.
- Hygiene and tests: (i) Add a regression test that dropping (iii) in g_L/g_R creates false positives (the misalignment template). (ii) Tighten Prop. 9 in code to use the O(β^4) append. (iii) Confirm W_{b⊙c} vs direct Ext scans. (iv) Consider consolidating Lemma 2 into Lemma 11 to avoid duplication.
- Optional: precompute bitset forms of OutR2/OutL1 and L_allow/R_allow for faster verification, as suggested.
