# Rigorous Proofs



Lemma (single-coset criterion). Let A=\bigcup_{i=1}^{\ell} \{n_i\}\times I_i with half-open arcs I_i\subset \Sone and define S(\alpha):=\bigcup_{i=1}^{\ell}(I_i-n_i\alpha). Then A+T_{\alpha,c} tiles G a.e. (for some/every c) iff the family \{I_i-n_i\alpha\}_{i=1}^{\ell} is pairwise a.e. disjoint and S(\alpha)=\Sone a.e.
Proof. For each r\in\Z, the fiber of A+T_{\alpha,c} over r equals c+r\alpha+S(\alpha). Disjointness and coverage in this fiber are equivalent to the stated conditions; fibers over different r are disjoint.

Lemma (gluing by a modulus). Fix ℓ\in\Z_{\ge 2}. Let A=\bigcup_{i=1}^{p}\{n_i\}\times I_i be such that the families \{I_i\} and \{I_i-n_i\alpha'\} are pairwise a.e. disjoint and satisfy \bigcup I_i=\Sone a.e. and \bigcup (I_i-n_i\alpha')=\Sone a.e. Assume n_i\in ℓ\Z for all i (after a horizontal translation if necessary). Let X,Y\subset\Z be a partition into unions of residue classes modulo ℓ. Fix c_1,c_2\in\Sone and define
T_1:=\{(m,c_1):m\in X\},\quad T_2:=\{(m,m\alpha'+c_2):m\in Y\},\quad T:=T_1\sqcup T_2.
Then:
(i) A+T=\Z\times \Sone a.e., and overlaps (A+t)\cap(A+t') have measure zero for t\ne t'.
(ii) A+T_1=X\times \Sone a.e. and A+T_2=Y\times \Sone a.e.
(iii) T_1 is invariant under addition by (ℓ,0) and T_2 is invariant under addition by (ℓ,ℓ\alpha').
Proof. Fix r\in\Z. For any i, the only translates contributing to the r-th column are those with first coordinate m=r-n_i. Since n_i\inℓ\Z, m\equiv r (mod ℓ), independent of i. If r\in X then all m=r-n_i lie in X, hence in T_1; none lie in Y, so T_2 contributes nothing to column r. The fiber equals c_1+\bigcup I_i=\Sone a.e., and disjointness inside the fiber follows from pairwise disjointness of \{I_i\}. If r\in Y, the same argument with T_2 yields the fiber c_2+r\alpha'+\bigcup (I_i-n_i\alpha')=\Sone a.e.; disjointness follows from the pairwise disjointness of \{I_i-n_i\alpha'\}. Distinct columns are disjoint, proving (i)–(ii). For (iii), note X and Y are periodic mod ℓ, so (m,c_1)\mapsto(m+ℓ,c_1) preserves T_1, and (m,m\alpha'+c_2)\mapsto(m+ℓ,(m+ℓ)\alpha'+c_2)=(m,m\alpha'+c_2)+(ℓ,ℓ\alpha') preserves T_2.

Lemma (non-tilability of periodic subsets of \Z). Let ℓ\ge 1 and R\subset \Z/ℓ\Z with 1\le r:=|R|\le ℓ. Set X:=\{n\in\Z: n\bmod ℓ\in R\}. If k disjoint translates of X tile \Z, then kr=ℓ. In particular, X tiles \Z by finitely many disjoint translates iff r\mid ℓ; when this holds, exactly k=ℓ/r translates are needed. The same holds for Y=\Z\setminus X, with residue count ℓ-r.
Proof. Work modulo ℓ: in a fundamental period of length ℓ, X occupies exactly r residue classes. Disjoint translates correspond to disjoint shifts of R in \Z/ℓ\Z, so their union has size at most kr. If these shifts cover all ℓ residues, then kr\ge ℓ. Conversely, coverage of \Z forces coverage of each period and hence kr\le ℓ. Therefore kr=ℓ. The remaining statements follow immediately; a density proof gives the same conclusion: density(X)=r/ℓ, additivity of densities for disjoint unions yields k(r/ℓ)=1.

Theorem (answer to the X/Y non-tilability question). Let α' be irrational and let ℓ be a prime with ℓ\ge 5. There exist a measurable tile A supported on three columns that is not a column, a partition \Z=X\sqcup Y into unions of residue classes modulo ℓ, and sets T_1,T_2 as above such that:
(a) A+(T_1\sqcup T_2)=\Z\times \Sone a.e., with A+T_1=X\times \Sone and A+T_2=Y\times \Sone;
(b) T_1 is (ℓ,0)-periodic and T_2 is (ℓ,ℓα')-periodic;
(c) Neither X nor Y tiles \Z by finitely many disjoint translates;
(d) A is not a column.
Proof. Choose t_1,t_2,t_3 in arithmetic progression modulo ℓ, e.g. t_j=s+(j-1)ℓ with s\in\Z; since α' is irrational, the fractional parts b_i=\{t_iα'\} are pairwise distinct. Construct A exactly as in the three-column construction (define L_i, a_i, I_i and n_1=0, n_2=t_1-t_3, n_3=t_2-t_3). Then the single-coset criterion shows A+T_{α',0} and A+T_{0,0} both tile G a.e., and n_i\inℓ\Z for all i. Apply the gluing-by-mod-ℓ lemma with any nontrivial residue set R with 2\le |R|\le ℓ-2, setting X from R and Y=\Z\setminus X; this yields (a)–(b). By the non-tilability lemma and the primality of ℓ, (c) holds. Finally, the slice measures are L_1,L_2,L_3 with L_1+L_2+L_3=1 and, by irrationality of α', not all equal; hence A is not a column by the column-slice obstruction (if all nonempty slices had equal measure they would each equal 1/|\Lambda|, impossible here). Remark: one can ensure L_1\ne L_2 by taking t_2-t_1=t_3-t_2=ℓ, which forces L_1=L_2 to be irrational, hence L_3=1-2L_1\ne L_1.

Remark (explicit instance). Take α'=\sqrt{2}/12, ℓ=5, and (t_1,t_2,t_3)=(0,10,5). Build A as above. Let R=\{0,2\}, so X=5\Z\cup(5\Z+2), Y=(5\Z+1)\cup(5\Z+3)\cup(5\Z+4). Then A+T_1=X\times\Sone, A+T_2=Y\times\Sone, T_1 is (5,0)-periodic, T_2 is (5,5α')-periodic, and neither X nor Y tiles \Z by finitely many disjoint translates.