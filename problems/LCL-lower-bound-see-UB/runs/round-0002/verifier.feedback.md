Overall, the three reports converge on a coherent “implicit SAT of types” program with a corrected ON/OFF bridge and a poly(s)-length, radius-1 clause tableau. That said, two correctness gaps and one design pitfall must be fixed to avoid trivial or unsound instances. The most serious is the possibility of allowing ⊥ at S on active contexts; as currently written, if ⊥ is permitted at S for active types and PAD/⊥ plumbing always succeeds, then (F1) becomes trivially satisfiable by setting f(·) ≡ ⊥. This would collapse the reduction. The fix is to forbid ⊥ at S on active contexts (and force offers/certificates) while allowing ⊥ only on inactive ones.

A second gap is sign binding. Prover 01 fixes this cleanly (clause picks occurrence only; the sign is read from the clause RUN). Provers 02/03 expose 6 sign-coded tokens at S; unless the grammar forces those tokens to match the verified sign for the selected occurrence p, the clause could cheat by picking an arbitrary sign. Adopt 01’s O1/O2/O3 palette or add a local check tying S’s sign to the RUN.

Finally, the equality/inequality-gate needs a formal “exclusivity lemma”: exactly one of the two certificates is realizable for a given pair, with radius-1 witness chains that cannot be faked. Provide the minimal local invariants (one-hot RID, pointer integrity, bit-by-bit compare) and a short counterexample analysis showing attempted fakes dead-end.

3-row table of key claims
| Claim (short) | Status | Why |
| Gate gives exactly one ON pair | Unclear | Needs a formal exclusivity lemma for equality/inequality witnesses; also depends on banning ⊥ at active S so OFF cannot bypass ON. |
| Sign bound to clause RUN | Unclear | 01: OK (S picks occurrence only). 02/03: unclear unless S-token sign is locally forced to equal RUN’s sign for the selected occurrence. |
| Trivializing (F2) without trivializing (F1) | Broken | If ⊥ is allowed at S on active contexts and PAD/⊥ always fills, f(·) ≡ ⊥ satisfies (F1). Must forbid ⊥ at S on active contexts. |

Value triage: The SAT-of-types framing, window anchoring, and the poly(s)-length tableau are solid and valuable. Patch H (01) resolves the quantifier mismatch cleanly. 02’s equality/inequality gate is a good mechanism provided exclusivity is proven and sign binding is enforced. 03’s general succinct-SAT capture is useful context and upper-bound bookkeeping.

Next steps: (i) Prove the exclusivity lemma with explicit seam rules and witness invariants; (ii) forbid ⊥ at S on active contexts in Cout–out and re-verify nontriviality; (iii) adopt 01’s O1/O2/O3 palette or add a local sign-check tying S to RUN; (iv) complete the B=2 DP table to sanity-check ON/OFF and sign logic.
