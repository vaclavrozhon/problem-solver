# Rigorous Proofs



Setup. Let n≥2. Let M be the n×n tridiagonal matrix with diagonal entries z_1,…,z_n∈ℂ, subdiagonal entries 1, and superdiagonal entries −1. Write M=D+E−F with D=diag(z_1,…,z_n), E the subdiagonal shift, and F the superdiagonal shift.

Lemma 1 (trace of M^2). For 2≤i≤n−1, (M^2)_{ii}=z_i^2−2, and for i=1,n, (M^2)_{ii}=z_i^2−1. Consequently tr(M^2)=Σ_{i=1}^n z_i^2 − 2(n−1).
Proof. (M^2)_{ii} = Σ_k M_{ik} M_{ki}. Only k∈{i−1,i,i+1} contribute. The k=i term gives z_i^2. The off-diagonal contributions are M_{i,i+1}M_{i+1,i}=(−1)·1=−1 and M_{i,i−1}M_{i−1,i}=1·(−1)=−1, with only one such term at the endpoints. Summing over i yields tr(M^2)=Σ z_i^2 −[2(n−2)+2]=Σ z_i^2 − 2(n−1).

Lemma 2 (trace of M^3). We have tr(M^3)=Σ_{i=1}^n z_i^3 − 3(z_1+2z_2+⋯+2 z_{n−1}+z_n).
Proof. Expand (D+E−F)^3=(D+K)^3 with K:=E−F, noting K has zero diagonal and K^T=−K. In the trace, terms with a single K factor vanish since DK and KD have zero diagonal; tr(K^3)=0 as K is skew-symmetric (tr(A^T)=tr(A) and K^T=−K imply tr(K^3)=−tr(K^3)). The surviving terms are tr(D^3)+3 tr(D K^2). The diagonal of K^2 equals (−1, −2,…, −2, −1), hence tr(D K^2)=−[z_1+2(z_2+⋯+z_{n−1})+z_n], giving the claim.

Lemma 3 (endpoint entries). For all n≥2,
(a) (M^{n−1})_{1n}=(−1)^{n−1} and (M^{n−1})_{n1}=1.
(b) (M^{n})_{1n}=(−1)^{n−1} Σ_{i=1}^n z_i.
(c) (M^{n+1})_{1n}=(−1)^{n−1}(h_2(z) − (n−1)), where h_2(z):=Σ_{1≤i≤j≤n} z_i z_j.
Proof. Interpret (M^k)_{ij} as a weighted sum over length-k paths on {1,…,n} from i to j where a stay at r contributes z_r, an up-step (r→r+1) contributes −1, and a down-step (r→r−1) contributes +1. To go from 1 to n, the net up minus down equals n−1.
(a) For k=n−1, there is a unique path: n−1 up-steps, weight (−1)^{n−1}. Reversing direction gives (M^{n−1})_{n1}=1.
(b) For k=n, we must have exactly one stay and no down-steps; the stay can be at any vertex i, producing z_i with the same (−1)^{n−1} from the up-steps. Summing i gives the formula.
(c) For k=n+1, either (i) two stays and no down-step, which yields the weight (−1)^{n−1}h_2(z), or (ii) one down-step and no stays, which can be inserted at any of the n−1 edges of the monotone path, contributing (n−1)(−1)^n. Summing gives (−1)^{n−1}(h_2−(n−1)).

Corollary 4 (necessary conditions for nilpotency). If M is nilpotent, then tr(M)=0, tr(M^2)=0, tr(M^3)=0, and (M^{n+1})_{1n}=0. Equivalently,
- Σ z_i=0,
- Σ z_i^2=2(n−1),
- Σ z_i^3=3(z_1+2z_2+⋯+2 z_{n−1}+z_n),
- h_2(z)=n−1 (the last is redundant given Σ z_i=0 and Σ z_i^2=2(n−1), since h_2=(Σ z_i^2+(Σ z_i)^2)/2).

Proposition 5 (no nilpotent for n=2,3 under Σ i z_i=0).
(a) n=2. Nilpotency forces z_1+z_2=0 and z_1 z_2+1=0, so z_1=−z_2 and z_2^2=−1. The linear constraint z_1+2z_2=0 implies z_2=0, a contradiction.
(b) n=3. Nilpotency forces Σ z_i=0, Σ z_i^2=4, and Σ z_i^3=3(z_1+2z_2+z_3). Together with z_1+2z_2+3z_3=0 (and Σ z_i=0 ⇒ 2z_1+z_2=0) one finds by elimination that these relations are inconsistent (e.g., solving 2z_1+z_2=0 and Σ z_i=0 gives z_3=z_1; substituting into the cubic and quadratic constraints yields incompatible values). Hence no nilpotent M of the prescribed form exists for n=3.

These lemmas will be used as fixed constraints for the general case.