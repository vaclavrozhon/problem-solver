# Main Results



Main theorem (corrected). For an input of length n whose greedy run decomposition has lengths ℓ_1,…,ℓ_r and entropy H = ∑ (ℓ_i/n) log2(n/ℓ_i), Python’s corrected TimSort performs at most (3/2)·n·H + O(n) comparisons. This bound is tight: there are inputs requiring ≥ (3/2)·n·H − O(n) comparisons.

Coarse bound. TimSort uses O(n + n·H) comparisons (starting sequences cost O(n); ending sequences cost O(n + n·H) via token amortization).