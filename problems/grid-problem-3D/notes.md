# Research Notes



# 3D color c3: validated tools, obstacles, and plan

- Types and colors: For an edge type T (sign pattern up to global sign), let J(T) be nonzero coordinates, E(T) the zeros. Fix an orientation s(T) so that P(T) are the + indices, N(T) the − indices. The color records T and minima m_i for i in J(T).

- Master multiplicity (validated): For each t∈[n]^{E(T)}, define A_t={u∈U: u_P=m_P, u_E=t, u_M>m_M} and B_t={v∈U: v_M=m_M, v_E=t, v_P>m_P}. The number of edges with color (T,m) equals Σ_t |A_t|·|B_t|. Key corollaries:
  • (+++) J={x,y,z}: multiplicity = 1_{m∈U}·|NE3(m)|.
  • J={x,z}, y equal: multiplicity = Σ_β r_β(α,γ)·s_β(α,γ), with r_β= #{(α,β,z)∈U: z>γ}, s_β= #{(x,β,γ)∈U: x>α}.
  • J={x} only: multiplicity = Σ_{β,γ} 1_{(α,β,γ)∈U}· #{(x,β,γ)∈U: x>α}.

- Lex-max antichain (validated): If a is lex-max among 3D-eligible points (NE3(a)≠∅) under (z,y,x) lex order, then NE3(q)=∅ for all q∈NE3(a).

- Special case proved: If U has injective projections in x, y, z (no coordinate repeats), then G[U] contains a uniquely colored edge under c3.

- Main obstacle to lifting 2D propagation: When dropping in z, we must certify an r=1 factor in a product count that is taken over all of U (not just NE(a)). Vertical duplicates ((x,y) repeated at multiple z) can invalidate naive choices.

- Working plan:
  1) Choose a lex-max eligible a. Let δ be the topmost z with NE3(a)[z=δ]≠∅ and γ the highest lower such z. Pick an in-plane partially row-good pair b1,b2 on z=δ (topmost row with at least two points, rightmost two). Show r_β(x(b1),γ)=1 and, by (H), s_β≥2 at z=γ to produce two witnesses there; this is the (++−) forcing step.
  2) Handle vertical duplicates: enforce a selection rule avoiding (x,y) pairs that recur above δ; if unavoidable, use the |J|=1 multiplicity to force a unique color on a minimal (y,z)-fiber.
  3) Prove a 3D “no eligible ⇒ unique color” lemma using minimal supporting planes and |J|=1,2 formulas (3D analogue of the 2D endgame).
  4) Establish a 3-way dichotomy (z-/y-/x-plane-good) for a lex-max eligible point, then adapt the 2D iterative contradiction using cone-lex maxima.

- Division of labor suggested:
  • P01: Formalize the topmost-plane propagation and certify r=1; write it up cleanly.
  • P02: Refine the cross-plane lemma (fix δ topmost, quantify r over U), and design a duplicate-avoidance rule.
  • P03: Complete the 13-type multiplicity dictionary and push the slice anchoring toward guaranteed isolation or a balanced |J|=3 trigger.
