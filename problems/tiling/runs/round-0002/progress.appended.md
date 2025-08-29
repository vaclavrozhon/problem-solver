## Round 0002 — audit, fixes, and new lemmas

Audit of output.md (what stands and what can be tightened)
- Theorem A is essentially correct and now contains a valid non-column proof using a “component-length” obstruction when |J_0|=1/2. The tiling constructions (periods (1,α) and (1,α+1/2)), irreducibility (singleton with K={0,1}), and incommensurability are all sound.
- Minor simplification available: the non-column step for Theorem A can be made even simpler if we do not insist that |J_0|=1/2. The same two tilings work for any J_0 with 1/2-periodicity; if we pick |J_0|∉{1/m: m∈N}, then the boundary recurrence forces an integer contradiction immediately (details below). The current proof keeps |J_0|=1/2 and uses the component-length obstruction to rule out the special case d_p=2; both approaches are fine, but the “non-1/m” route is simpler to state and verify.
- Proposition D (K={0,1,2}, two orders when c_1=c_3) is correct; the proof sketch via Lemma C is standard. The output currently labels this family as “pending a non-column verification.” I supply below a clean, short non-column criterion that completes this second family under very mild numerical assumptions (in particular, it works for the concrete examples already suggested).

Lemma E (non-column for K={0,1,2} with one interval per layer)
- Statement. Let A have layers at K=(0,1,2) with lengths c_1,c_2,c_3>0, c_1+c_2+c_3=1. If A tiles a finite set X×S^1, set d_n:=|T_n|. Then necessarily 1/c_1 and 1/c_3 are (nonnegative) integers. In particular, if either c_1 or c_3 is not the reciprocal of an integer, then A is not a column.
- Proof. The per-row measure identities are
  c_1 d_n + c_2 d_{n-1} + c_3 d_{n-2} = 1_{n∈X},  for all n∈Z.
  Let p:=min X. For n=p−2, the right-hand side is 0, all coefficients are positive, hence d_{p−2}=d_{p−3}=d_{p−4}=0. For n=p−1, we get c_1 d_{p−1}=0, so d_{p−1}=0. For n=p, 1=c_1 d_p, so d_p=1/c_1∈N. A symmetric argument at the right boundary q:=max X gives d_{q−2}=1/c_3∈N. This proves the claim. ∎
- Consequence for the “two-order” family: If we impose c_1=c_3=s and choose s not of the form 1/m (e.g., s=2/5 as in the worked example, or any irrational in (0,1/2)), then A cannot be a column. Combined with Proposition D and the singleton irreducibility criterion, this completes a second explicit family of examples with two irreducible periodic tilings and incommensurable periods (β and β−s).

Lemma F (simpler non-column for the complementary 2-layer construction)
- Setting: Same as Theorem A except we do not fix |J_0|=1/2; still assume J_0+1/2=J_0 and J_1:=S^1\(J_0+α).
- Claim. If |J_0|∉{1/m: m∈N}, then A is not a column.
- Proof. The per-row measures are |J_0| d_n + (1−|J_0|) d_{n−1} = 1_{n∈X}. Let p:=min X. For n=p−1, 0=|J_0| d_{p−1}+(1−|J_0|) d_{p−2} forces d_{p−1}=d_{p−2}=0. For n=p, 1=|J_0| d_p, so d_p=1/|J_0|∈N. Contradiction unless |J_0|=1/m. ∎
- Remark. This shows the component-length hypothesis in Theorem A is only needed in the special endpoint case |J_0|=1/2 (when the boundary recurrence yields d_p=2). Keeping |J_0|=1/2 is perfectly fine (current output), but the theorem can be simplified by picking |U| so that |J_0|≠1/2 and |J_0| is not a reciprocal of an integer; then the non-column conclusion is immediate from the boundary equations.

Proposition G (q-phase generalization of the 2-layer construction)
- Statement. Fix q≥2. Suppose J_0⊂S^1 is 1/q-periodic (J_0+1/q=J_0). For any irrational α, define J_1:=S^1\(J_0+α) and A:=( {0}×J_0 )∪( {1}×J_1 ). Then for each j=0,1,…,q−1 there is a singleton tiling T_{α+j/q} with period (1,α+j/q). If j≠j′, the periods (1,α+j/q) and (1,α+j′/q) are incommensurable. If moreover |J_0|∉{1/m: m∈N}, then A is not a column.
- Proof. Define T_{α+j/q}:={(n,θ_0+n(α+j/q))}. On row n, contributions are (J_0+θ_n) and (J_1+θ_{n−1}). Since J_0+1/q=J_0, J_0+θ_n=J_0+(θ_{n−1}+α+j/q)=J_0+(θ_{n−1}+α); hence J_1+θ_{n−1} is the complement of J_0+θ_n, so we have a tiling with period (1,α+j/q). If (α+j/q)/(α+j′/q)∈Q with j≠j′, rearranging gives α as a rational number, contradiction; thus the periods are incommensurable. The non-column condition follows as in Lemma F. ∎

Concrete check for the K={0,1,2} family (completing the second mechanism)
- Parameters: c_1=c_3=2/5, c_2=1/5; pick β irrational (e.g., β=√2/10), set a_1=0, and define a_2≡a_1+c_1+β, a_3≡a_2+c_2+β (mod 1). Then:
  • Order σ=(1→2→3→1) produces a tiling with slope β.
  • Order σ′=(1→3→2→1) produces a tiling with slope β′≡β−c_1 (mod 1).
  • By Lemma E, A is not a column because 1/c_1=5/2∉N.
  • β/(β′) is irrational since β/(β−c_1)∈Q ⇒ β∈Q (with c_1 rational), a contradiction.
  • Irreducibility follows from the singleton irreducibility lemma (H=⟨K−K⟩=Z).

Why useful here
- Lemma E fills the “pending non-column” gap for the K={0,1,2} two-order family under a very mild numerical requirement (e.g., c_1=c_3 not a reciprocal of an integer), thus upgrading that mechanism to a complete existence scheme.
- Lemma F and Proposition G streamline and extend Theorem A: they show the complementary 2-layer construction yields q distinct incommensurable periods, and provide a simpler non-column criterion.

Obstacles and cautions
- Endpoints: All uses of measure additivity rely on a.e. disjointness; overlaps can occur at finitely many endpoints only, hence measure zero—consistent with the tiling definition.
- For Theorem A as stated (|J_0|=1/2), the “component-length” obstruction should specify that translation preserves the multiset of component lengths, while (S^1\J_0) inheres the multiset from the complement of U in [0,1/2); the difference is guaranteed by the hypothesis on U. This is correct as written, but the simpler alternative via Lemma F avoids this case distinction entirely.

Next steps (suggested updates to output.md)
- Add Lemma E to complete the K={0,1,2} mechanism as a second explicit family of examples.
- Optionally, rephrase Theorem A to allow arbitrary |J_0| (with 1/2-periodicity) and replace the non-column hypothesis by “|J_0|∉{1/m: m∈N},” or keep the current |J_0|=1/2 statement and append Lemma F as a remark.
- Record Proposition G (q-phase generalization) with its incommensurability claim; this shows one tile can admit multiple (≥2) pairwise incommensurable periods simultaneously.

