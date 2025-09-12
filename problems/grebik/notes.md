# Research Notes



Idea: glue the two single-coset tilings (α=0 and α=α′) residue-by-residue modulo ℓ. Ensure all first-coordinate supports of A lie in one congruence class mod ℓ (after a horizontal translation, take n_i∈ℓℤ). Then for column r, the needed integer shifts are m=r−n_i≡r (mod ℓ), independent of i. If we choose a partition ℤ=X⊔Y into unions of residue classes modulo ℓ, define T_1={(m,c_1):m∈X} and T_2={(m,mα′+c_2):m∈Y}. For r∈X, only T_1 supplies the three shifts m=r−n_i, and the fiber is c_1+⋃I_i=S^1 a.e. For r∈Y, only T_2 contributes and the fiber is c_2+rα′+⋃(I_i−n_iα′)=S^1 a.e. No cross-interference occurs because m≡r (mod ℓ).

Choose ℓ prime ≥5 and a residue set R with 2≤|R|≤ℓ−2. Let X be the union of those residues and Y its complement. A density/counting-in-one-period argument shows: k disjoint translates of X tile ℤ iff k|R|=ℓ; hence neither X (density |R|/ℓ) nor Y (density 1−|R|/ℓ) tiles ℤ disjointly.

Compatibility with the 3-column A from the paper: pick t_1,t_2,t_3 all ≡0 (mod ℓ), e.g. an arithmetic progression. The construction of I_i and the disjoint coverings for α=0 and α′ go through verbatim. The column obstruction still applies since not all slice measures L_1,L_2,L_3 are equal. Explicit numbers: α′=√2/12, ℓ=5, (t_1,t_2,t_3)=(0,10,5) (all ≡0 mod 5). Then take R={0,2}, so X=5ℤ∪(5ℤ+2), Y=(5ℤ+1)∪(5ℤ+3)∪(5ℤ+4). Periodicity: T_1 is (5,0)-periodic, T_2 is (5,5α′)-periodic (i.e., invariant under addition by (5,5α′)).