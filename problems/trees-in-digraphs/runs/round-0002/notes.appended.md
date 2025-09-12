# Research Notes



Updates and insights

- Outstar-with-δ+-common-leaves: A level-dependent threshold schedule t_{k-i}=ℓ^{i+1}+⌈(ℓ^{i+1}−1)/(ℓ−1)⌉ yields a total additive term S_{k,ℓ}=∑_{i=1}^k t_i=Θ(ℓ^k), independent of k up to a constant depending only on ℓ. The lexicographic partition argument and greedy extension both adapt cleanly.
- Uniform vs variable thresholds: The uniform choice T*=⌈ℓ^k·ℓ/(ℓ−1)⌉ (repeated k times) also works but is weaker (cost kT*). The key sufficient condition at depth i is deg_{Γ(k−i−1)}(w) ≥ |V(B_i)|+ℓ^{i+1}, with |V(B_i)|=(ℓ^{i+1}−1)/(ℓ−1).
- Packing rays: For attaching S^-_{k,ℓ} at each leaf, h ≥ kℓ^{k+1}+2ℓ^k+ℓ suffices: each previously used vertex blocks at most one ray in any fixed S(w), and |V(B)| ≤ (ℓ^{k+1}−1)/(ℓ−1) ≤ 2ℓ^k.
- k=2 spiders: Counting 2-walks and using a maximum matching between V\{a} and N^-_B(a) gives s ≥ d(d−2ℓ+1)/(d+2ℓ−1), implying δ^+ > ((3ℓ−1)+√(17ℓ^2−10ℓ+1))/2. This fixes a gap in the paper’s proof where a maximality implication was unjustified.

Next directions
- Attempt a global selection (matching/nibble) over all leaves to push S_{k,ℓ} to (1+o(1))ℓ^k.
- Globalize the ray packing to reduce h to (1+o(1))kℓ^{k+1}.
- Seek better bounds on f(k,h) (e.g., polynomial in h) to translate structural improvements into substantially smaller δ^+ thresholds.