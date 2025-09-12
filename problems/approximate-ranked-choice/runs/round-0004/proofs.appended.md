# Rigorous Proofs



Preliminaries

- Candidates C, |C|=K. For nonempty S⊆C and a∈S, let t_a(S)=Pr[top among S is a] under the population distribution over full rankings. Adding a nonnegative measure y on rankings (||y||_1 denotes its total mass) updates tallies additively: t'_a(S)=t_a(S)+∑_r y(r) 1[top_S(r)=a]. We assume a fixed deterministic tie-breaking rule; we enforce strict margins via a slack γ>0 so ties are irrelevant.

Theorem 1 (Uniform convergence for top-of-S tallies).
Let F={1[top_S(r)=a]: a∈S⊆C, |S|≥1}. For m i.i.d. ballots and any δ∈(0,1), with probability ≥1−δ we have sup_{a,S} |\hat t_a(S)−t_a(S)| ≤ τ whenever m ≥ c (log(K·2^{K−1})+log(2/δ))/τ^2 for a universal constant c.

Proof. Hoeffding’s inequality and a union bound over |F| ≤ K·2^{K−1}.

Theorem 2 (Sufficient c-first certificate).
Fix c∈C and define M_c:=max_{S⊆C, c∈S, |S|≥2} [min_{a∈S\{c}} t_a(S) − t_c(S)]_+. If ε > M_c, then adding any ε' with M_c < ε' ≤ ε of c-first ballots makes c the IRV winner (strictly, by γ absorbed into ε').

Proof. For each S with c∈S, t'_c(S)=t_c(S)+ε' > min_{a≠c} t_a(S), so c is never the unique minimum in any round and thus survives to win.

Corollary 3 (Sampling for the c-first certificate).
Let \hat M_c be the plug-in estimator of M_c from \hat t. Then |\hat M_c−M_c| ≤ 2τ under sup_{a,S} |\hat t_a(S)−t_a(S)| ≤ τ. Consequently, output any c with \hat M_c ≤ ε−2τ; with probability ≥1−δ, c is an ε-winner. Taking τ=ε/4 gives m=Θ((K+log(1/δ))/ε^2).

Proof. For fixed S, the map (t_a(S))_{a∈S} ↦ min_{a≠c} t_a(S) − t_c(S) is 2-Lipschitz in sup norm; positive part and max preserve Lipschitzness.

Proposition 4 (Necessary ε,δ dependence).
Any algorithm that outputs an ε-winner with probability ≥1−δ requires m=Ω((1/ε^2) log(1/δ)).

Proof. For K=2 (majority), distinguishing µ≥1/2−ε from µ≤1/2−2ε needs Ω((1/ε^2) log(1/δ)).

Theorem 5 (K=3 exact minimal augmentation).
Let C={a,b,c} and fix target c. Write first-round shares p_x:=t_x({a,b,c}) and pairwise tallies t_x({b,c}), t_x({a,c}). For γ>0 define
A_γ:=[p_a−p_c+γ]_+,
B_γ:=[p_a−p_b+γ]_+,
D_γ:=t_b({b,c})−t_c({b,c})+γ.
Let ε_a^*(γ) be the minimum total mass needed to eliminate a first and make c beat b in the final by ≥γ. Then ε_a^*(γ)=B_γ+max{A_γ, B_γ+D_γ}. Symmetrically, ε_b^*(γ)=B'_γ+max{A'_γ, B'_γ+D'_γ} with a↔b. The exact minimal augmentation is ε^*(γ;c)=min{ε_a^*(γ), ε_b^*(γ)}, and ε^*(c)=lim_{γ→0^+} ε^*(γ;c).

Proof. Sufficiency: adding α c-first and β b-first changes p'_a=p_a, p'_b=p_b+β, p'_c=p_c+α, so a is strictly below both b and c in round 1 if α≥A_γ and β≥B_γ. In the final, t'_c({b,c})−t'_b({b,c})=(t_c−t_b)+α−β, so α−β≥D_γ ensures a strict c-over-b win. Optimality over two types reduces to minimizing α+β over α≥A_γ, β≥B_γ, α−β≥D_γ, whose solution is β=B_γ and α=max{A_γ, B_γ+D_γ}. Taking the better of eliminating a or b first yields ε^*(γ;c).

Theorem 6 (General K chain-based two-type certificate).
Fix c∈C and choose a pivot b∈C\{c}. Set S_1:=C. For j=1,…,K−2, let e_j be the (tie-broken) minimizer of t_e(S_j) over e∈S_j\{b,c}, and define S_{j+1}:=S_j\{e_j}. Let
A_b(γ):=max_{1≤j≤K−2} [t_{e_j}(S_j)−t_c(S_j)+γ]_+,
B_b(γ):=max_{1≤j≤K−2} [t_{e_j}(S_j)−t_b(S_j)+γ]_+,
D_{b,c}(γ):=t_b({b,c})−t_c({b,c})+γ.
If we add α≥0 of c-first ballots and β≥0 of b-first ballots with α≥A_b(γ), β≥B_b(γ), and α−β≥D_{b,c}(γ), then the IRV elimination proceeds by removing e_1,…,e_{K−2} (in order) before {b,c}, and c defeats b in the final by ≥γ. Among such two-type additions, the minimum total mass is
ε_b^*(γ)=B_b(γ)+max{A_b(γ), B_b(γ)+D_{b,c}(γ)}.

Proof. Induct on j. For S_j, by construction e_j is the minimal among S_j\{b,c}. Since only c and b tallies increase, all other candidates remain at baseline and e_j remains the (tie-broken) minimum among S_j\{b,c}. The constraints α≥A_b(γ), β≥B_b(γ) imply t'_c(S_j)>t'_{e_j}(S_j) and t'_b(S_j)>t'_{e_j}(S_j), so e_j is the unique minimum in S_j and is eliminated. This yields S_{j+1}. In the final between b and c, each c-first (resp. b-first) ballot adds +1 to t'_c({b,c}) (resp. t'_b({b,c})), so α−β≥D_{b,c}(γ) ensures a strict c-over-b win. Minimizing α+β over the three halfspaces gives β=B_b(γ) and α=max{A_b(γ), B_b(γ)+D_{b,c}(γ)}.

Corollary 7 (K=3 sampling for exact ε^*).
Estimating the five quantities {p_a,p_b,p_c,t_c({b,c}),t_c({a,c})} within τ by m=Θ((log(1/δ))/τ^2) samples and using a safety margin 6τ yields a correct plug-in decision with probability ≥1−δ. Choosing τ=Θ(ε) gives m=Θ((log(1/δ))/ε^2).
