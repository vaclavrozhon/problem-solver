Good progress this round; several key points are now on firmer ground, but Q1 remains open and we still lack a global monotone invariant. Positives:
- Both provers now use the correct boundary-aware degree formula for deg_k at a face. Prover 2’s Corollary 2 correctly fixes the earlier −6F typo in the closed case. Prover 1’s Lemma B gives a clean, general identity in terms of triangle-incidence counts t(v), t(e).
- K4-free for Whitney discs is correctly used as a structural prohibition.
- The major advance is the classification of maximal cliques in k(G) for Whitney disc triangulations: they are precisely vertex-stars P_v or triangle-stars Q_f (the 4-clique around an interior face). Prover 2’s Proposition 4 provides a usable proof strategy; the critical step is excluding any pair of triangles sharing an edge within a clique with empty total intersection (else a third triangle forces a K4), and then using the face-separation (3-cut) property of an interior face to confine any such clique to Q_f. I have added a more explicit 3-separator argument in proofs.md to close the topological gap.
- For maximal outerplanar discs, the specialisation is clean: only P_v occur as maximal cliques, and k^2(D)≅D[S] (S={deg≥3}). The path/line-graph observation gives explicit bounds for zig-zag cases.

Caveats and corrections:
- Ensure the “no two in K share an edge” step for empty-intersection cliques is justified exactly as in the proof (the third triangle would need the opposite edge, creating a K4). The selection of three triangles with pairwise distinct intersection vertices needs a brief choice argument; I have supplied it.
- The adjacency rules among P_u, P_v, Q_f in k^2(G) are stated informally; they should be fully formalised next.

Next steps:
1) Finalise the adjacency schema among P and Q vertices in k^2(G), and extract a compact description of k^2(G) in terms of G (which vertices/faces survive, how they connect).
2) Propose and prove a monotone 2-step potential (e.g., Φ(G)=|{maximal P_v}|+|{interior faces}|) with Φ(k^2G)<Φ(G) unless Φ=1. Verify rigorously in outerplanar and small mixed cases; aim to extend to all Whitney discs.
3) Computationally enumerate small disc triangulations to validate the P/Q classification, the k^2 model, and candidate potentials.
4) For Q2, leverage the closed-case degree identity to build a divergence parameter for non-K4 sphere triangulations (e.g., a subsequence with strictly growing count of high-degree faces in k^n).
