
We study **translational tilings** with a single tile in the group $\mathbb{Z}\times S^1$, where $\mathbb{Z}$ denotes the integers and $S^1$ the unit circle with addition modulo 1.

A **tile** is a set of the form

$$
A = \bigcup_{i=1}^\ell \{k_i\}\times [a_i,b_i],
$$

where the indices $k_i \in \mathbb{Z}$ may repeat, and each $[a_i,b_i]\subseteq S^1$ is an interval.

A **tiling** is a set $T\subseteq \mathbb{Z}\times S^1$ such that

$$
A+T = \mathbb{Z}\times S^1
\quad\text{and}\quad 
(A+t)\cap (A+t')
$$

has measure zero whenever $t\neq t'$.

We say that a tile $A$ is a **column** if it tiles a set of the form $\{n_1,\dots,n_m\}\times S^1$.

We call a tiling $T$ **irreducible** if it cannot be written as a disjoint union $T=T_1\sqcup T_2$ of two nonempty sets such that there exists a partition $\mathbb{Z}=X_1\sqcup X_2$ with

$$
A+T_i = X_i\times S^1
\quad\text{for } i=1,2.
$$

The problem is to decide whether there exists a tile $A$ which is **not a column**, and which admits two different **irreducible** tilings $T$ and $T'$ of $\mathbb{Z}\times S^1$, such that:

* $T$ has period $(k,\alpha)$ and $T'$ has period $(k',\alpha')$ with $k,k'>0$,
* the periods are *incommensurable*, i.e. $\alpha/\alpha'\notin \mathbb{Q}$.

