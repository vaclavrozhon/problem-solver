High-level assessment and triage
- The core bottleneck remains the |A|=4 one‑point CSP. The right way to unblock it is to finalize a correct IsO5 oracle and then compute the two base local tables F(+,+) and F(+,-).
- The most useful rigor this round is the pair‑set S criterion and the ε‑cocycle/generator data (Prover 03). These are fully compatible with the action already recorded in output.md (Lemma 6) and give a clean, exact, and implementable IsO5 oracle without enumerating the entire orbit explicitly.

Main correctness issues
- Prover 01’s Lemma H1 (“Hamming‑1 from E”) and Prover 02’s Lemma 18 (“inner‑product −3”) both characterize O5 membership using ε alone (i.e., E={ε(τ)}). This misses a crucial constraint: for e_O=(+,-,-,-,-), the image under τ is determined by the pair (ε(τ), i0:=τ(1)). In general, not every combination (ε,i0) with ε∈E is realized by a single τ. Therefore “∃ε∈E with Hamming(−p,ε)=1” (equivalently, Σ p_i ε_i = −3) is at best a necessary test; it is not sufficient unless the associated i0 is also realized. Prover 03 explicitly corrected this and proposed the exact S‑based criterion; that correction should be adopted.
- Because the ε‑only tests are not sufficient, the corollaries proposed by Prover 02 (C1–C3) cannot be accepted as rigorous without checking the (ε,i0) pairing. In particular, the claimed exclusion (+++)∉F(+,-) needs verification via the S‑oracle; it cannot be concluded from dot products alone.

What is rigorous and valuable now
- ε‑cocycle identity: ε_i(σ∘τ) = ε_i(σ)·ε_{σ^{-1}(i)}(τ). This follows cleanly from Lemma 6 and gives a stable way to generate all ε(τ) from generators.
- Generator values: ε(s_k) for s_k=(k k+1) has + at positions k,k+1, and − elsewhere. This is a straightforward computation from Lemma 6/c_j and is extremely useful for building E (and S) by BFS on the Cayley graph.
- Exact O5 membership via the pair‑set S: Define S:={(ε(τ), i0=τ(1)) : τ∈S5}. Then p∈O5 iff ∃(ε,i0)∈S with p_i=ε_i for i=i0 and p_i=−ε_i for i≠i0. This is precisely the specialization of the action to e_O and is both necessary and sufficient.

Consequences for next steps
- Build S (120 pairs) once by BFS over adjacent transpositions using the ε‑cocycle and tracking i0 under right‑multiplication. Then implement IsO5 by a simple 120‑pair membership test per query. This removes the ambiguity present in ε‑only heuristics.
- With IsO5 in hand, compute F(+,+) and F(+,-) completely (8 entries each). Derive F(−,−) and F(−,+) by global sign reversal (Cor. 9). Confirm the verified items already in output.md (e.g., Lemma 13: (---) forbidden for (+,-); and the |A|=3 constructive witnesses from Proposition 14) and explicitly decide contentious entries like (+++) for (+,-) and the permutations of (+,−,−) for both (+,+) and (+,−).
- Depending on these tables: (i) If both complements have size ≤1, apply Cor. 16.1 to conclude |A|=4; (ii) If, stronger, all three permutations of (+,−,−) lie in both F(+,+) and F(+,-), apply Proposition 11 (uniform 2+2); otherwise brute‑force the 2^6 CSP per realized profile, using the parity invariant (Lemma 17) for pruning.

Concrete next‑round checklist
1) Implement S via cocycle + generators; verify |S|=120 and sample ε(s_k) values. Unit tests: (+,−,−,−,−) is O5; (+,+,+,+,+) and (+,−,+,−,+) are non‑O5 (consistent with output.md). Use these as nonnegotiable checks of the action/implementation.
2) Compute F(+,+) and F(+,-); report explicit tables and the sizes of their complements; confirm the witnesses from Proposition 14.
3) Attempt the two decisive routes: Cor. 16.1 (small complements) or Proposition 11 (2+2). If neither applies, run the small backtracking/2^6 CSP per profile.

Summary of curation decisions
- Do not add the ε‑only O5 criteria (Hamming‑1 / inner‑product −3) to output.md; keep them as heuristics in notes with a clear warning about the missing (ε,i0) pairing. 
- Add the ε‑cocycle, the generator values, and the exact pair‑set S criterion to output.md; they are rigorous, implementation‑ready, and directly relevant to closing the remaining gap.