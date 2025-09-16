# Research Notes



Setup. Let M be n×n tridiagonal with diagonal z_1,…,z_n, subdiagonal entries 1 and superdiagonal entries −1. Let D=diag(z_1,…,z_n), E be the subdiagonal shift, F the superdiagonal shift. Then M=D+E−F. Let H=diag(1,2,…,n). The condition is Σ_{i=1}^n i z_i = tr(HM) = 0. We work for n≥2 (n=1 yields the zero 1×1 matrix, which is nilpotent).

Verified identities.
- Commutators: [H,E]=E, [H,F]=−F, [H,D]=0, hence [H,M]=E+F. The similarity flow M(t)=e^{tH}Me^{−tH}=D+e^t E−e^{−t}F will be useful.
- Diagonal of M^2: (M^2)_{ii}=z_i^2−2 for 2≤i≤n−1, and z_i^2−1 for i=1,n, so tr(M^2)=Σ z_i^2 − 2(n−1).
- tr(M^3)=Σ z_i^3 − 3(z_1+2z_2+⋯+2 z_{n−1}+z_n). Using Σ z_i=0, this is Σ z_i^3 + 3(z_1+z_n).
- Endpoint path counts: (M^{n−1})_{1n}=(−1)^{n−1} (unique all-up path). (M^{n})_{1n}=(−1)^{n−1} Σ z_i (exactly one stay). (M^{n+1})_{1n}=(−1)^{n−1}(h_2(z) − (n−1)) where h_2=Σ_{i≤j} z_i z_j (two stays or one down step).
- Consequence for nilpotent M: tr(M^k)=0 for all k≥1, hence Σ z_i=0 and Σ z_i^2=2(n−1), and Σ z_i^3=3(z_1+2⋯+2+z_n). Also (M^{n+1})_{1n}=0 gives h_2 = n−1, consistent with Σ z_i^2=2(n−1) since h_2 = (Σ z_i^2 + (Σ z_i)^2)/2.

Small n resolved. For n=2 and n=3, imposing Σ i z_i=0 together with nilpotency constraints leads to contradictions; hence no nilpotent matrix of the prescribed form exists for n≤3.

3×3 principal minors (status). For n=4, a direct computation shows the sum of all 3×3 principal minors equals Σ_{i<j<k} z_i z_j z_k + (2 z_1 + z_2 + z_3 + 2 z_4). This matches the general ansatz S_3 = Σ_{i<j<k} z_i z_j z_k + (n−3) Σ z_i + (z_1+z_n) (which reduces for n=4 to 2z_1+z_2+z_3+2z_4). We need a uniform proof for all n.

Planned route to contradiction.
1) Prove the general formula for S_3: S_3 = Σ_{i<j<k} z_i z_j z_k + (n−3) Σ z_i + (z_1+z_n). Under nilpotency, e_3=S_3=0, thus with Σ z_i=0 we get Σ_{i<j<k} z_i z_j z_k = −(z_1+z_n).
2) Compute (M^{n+2})_{1n} exactly by path counting. Expect: (−1)^{n−1}(h_3(z) − 3φ(z)), where φ(z)=z_1+2z_2+⋯+2 z_{n−1}+z_n. Nilpotency forces (M^{n+2})_{1n}=0, hence h_3=3φ.
3) Eliminate the cubic quantities using identities relating h_3 and Σ_{i<j<k} z_i z_j z_k, together with Σ z_i=0 and Σ z_i^2=2(n−1), to isolate a nonzero linear boundary form that contradicts Σ i z_i=0.

Action items for next round.
- Prover 2: Supply a complete proof of the S_3 formula for all n.
- Prover 3: Prove the exact formula for (M^{n+2})_{1n}, including the −3 coefficient on φ(z).
- Prover 1: Cross-verify both identities, correct the earlier weight sketch for c_{n,3}, and attempt the elimination for n=4 to confirm inconsistency before generalizing.