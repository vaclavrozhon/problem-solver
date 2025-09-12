Your mod-ℓ gluing idea is on target and (after a small correction) gives an affirmative answer to the posed question. The key is to force all first-coordinate positions of A to lie in a single residue class modulo ℓ (conveniently 0), so that for each column r the three requisite translation parameters m=r−n_i fall in the same residue class as r. Then, if X and Y are unions of residue classes mod ℓ partitioning ℤ, exactly one of the two systems (α=0 or α=α′) operates in column r according to whether r∈X or r∈Y.

Corrections/clarifications.
- Gluing-by-mod-ℓ lemma: as stated, “if n_i≡n_0 (mod ℓ) then r∈X ⇒ m∈X” is not generally true unless X is chosen with residues shifted by −n_0. The clean version is: after translating A by (−n_0,0), assume n_i≡0 (mod ℓ) for all i; then m≡r (mod ℓ), so r∈X ⇔ m∈X. We encode this in the formal lemma below.
- Periodicity notation: T_2={(m,mα′+c_2):m∈Y} is invariant under (ℓ,ℓα′), not under (ℓ,α′). Your parenthetical remark matches this; we will state periodicity as invariance under that vector.
- Explicit instance: with α′=√2/12, ℓ=5, if you keep t_1=0,t_2=5,t_3=10 then b_3<b_2. This is harmless (we can relabel), but to match “0≤b_1<b_2<b_3<1” you can take (t_1,t_2,t_3)=(0,10,5), still all ≡0 (mod 5).

Soundness of the construction. With the corrected lemma, the proof that A+(T_1∪T_2) tiles is straightforward: in column r∈X, the fiber equals c_1+⋃ I_i=S^1 a.e., and only T_1 contributes; in column r∈Y, the fiber equals c_2+rα′+⋃(I_i−n_iα′)=S^1 a.e., and only T_2 contributes. Disjointness across different t’s follows from pairwise disjointness of the relevant families and from separation of columns. The “A not a column” obstruction via unequal slice measures carries over unchanged from the paper.

Non-tilability of X and Y. Your density argument is correct but can be sharpened: if X has residue set R⊂ℤ/ℓℤ, then k disjoint translates tile ℤ iff k|R|=ℓ. Thus for prime ℓ and 2≤|R|≤ℓ−2, neither X nor Y tiles ℤ by finitely many disjoint translates.

Next steps.
- Formalize (and use) the corrected gluing-by-mod-ℓ lemma in proofs.md.
- Add the density/non-tilability lemma with a short proof by counting in one period.
- State and prove the final theorem answering the question (choose prime ℓ≥5 and 2≤|R|≤ℓ−2), and include a fully explicit instance.
- Align the periodicity statement for T_2 as invariance under (ℓ,ℓα′).