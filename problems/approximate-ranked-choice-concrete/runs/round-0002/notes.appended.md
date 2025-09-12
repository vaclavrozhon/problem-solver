# Research Notes



# Certificates and sampling for IRV ε-winners

- Notation: For S⊆C, a∈S, p_a(S)=Pr[top_S(ballot)=a]. Adding ε mass of c-first ballots increases c’s tallies by ε for every S containing c and leaves others’ tallies unchanged (compare absolute counts; normalization is irrelevant for elimination).

- Correct sufficient certificate (uniform): If for every nonempty S⊇{c} we have p_c(S) ≥ min_{a∈S\{c}} p_a(S) − ε (with tie-breaking known and either strict margins or reserved slack), then after adding ε mass of c-first ballots, c is never strictly below the minimum and hence cannot be eliminated; thus c wins.

- Caveat on single-chain certificates: Verifying inequalities only along one elimination chain of opponents is insufficient for K≥4, because the actual post-augmentation elimination path may visit sets not on the chosen chain. Therefore the earlier Lemma 1 (single-chain witness) is not a valid sufficient condition in general.

- K=3 case: There are only two relevant sets containing c (C and {c,x}). A union bound over the 9 quantities {p_a(S)}_{a∈S} yields uniform deviation, and adding ε mass to the sample winner ĉ suffices with ε=2α.

- Adaptivity: For sample-run IRV, one can control all top-of-set frequencies uniformly by a union bound over K·2^{K−1} indicators; this is exponential computationally but only linear in K in the sample size via the log term.

- Two-phase certification idea: Use a holdout sample to compute B̃(c)=max_{S⊇{c}}(min_{a∈S\{c}} p̃_a(S)−p̃_c(S)). If B̃(c)≤ε/2 (and uniform deviation ≤ε/4), then c is an ε-winner. This avoids chain-dependence but may be computationally heavy.

- Lower bounds: K=2 needs m=Ω((1/ε^2)·log(1/δ)). A Fano construction suggests m=Ω((log K)/ε^2) for identifying a unique ε/4-winner among K candidates; to be formalized with explicit IRV distributions.

- Next steps: (i) Provide a minimal counterexample demonstrating failure of single-chain certificates for K≥4 (or a proof that extra conditions suffice). (ii) Finalize the K=3 theorem with corrected constants and full tie handling. (iii) Either analyze the one-phase algorithm via a uniform bound that implies ε-winning, or switch to a two-phase max-deficit certificate. (iv) Complete the Fano lower bound.
