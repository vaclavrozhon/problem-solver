# Research Notes



Problem. Decide the complexity of 3-coloring circle graphs (intersection graphs of chords of a circle). Unger’s O(n log n) algorithm was refuted (Bachmann–Rutter–Stumpf). For k ≥ 4, k-coloring circle graphs is NP-complete.

Key observations consolidated this round:
- Representation: Cutting the circle away from endpoints turns chords into open intervals (s(x), t(x)) with x,y adjacent iff their intervals overlap without containment: s(x) < s(y) < t(x) < t(y) or vice versa.
- Neighborhood structure: For any chord x, N(x) induces a permutation graph: neighbors of x have one endpoint on each side arc; adjacency among them is determined by inversion between the two side orders. Consequently, in any 3-coloring N(x) must be bipartite.
- Two-chord view: For any x,y, the set N(x)∩N(y) is an induced subgraph of N(x) and hence also a permutation graph (permutation graphs are hereditary). This tightens and replaces a tentative “trapezoid” claim.

Parameterized algorithm (ply w):
- Define the interval ply w as the maximum number of intervals covering a point in the linearized representation. A sweep-line DP over the 2n endpoints maintains proper colorings of the active set; on the start of b, forbid colors used by current actives a with t(a) < t(b). This yields an algorithm for k-colorability in O(n·w·k^w) time and O(k^w) space. The parameter is representation-dependent; recognizing circle graphs and finding a representation is polytime.

Bipartite-sides decomposition:
- Fix a chord x. Removing x splits chords into three parts: left side L, right side R, and N(x). If L and R are bipartite, then for any fixed 2-coloring of each component of N(x), each side reduces to choosing one of its two bipartition orientations; vertices that cannot use their prescribed a/b color (due to conflicts with N(x)) are assigned the third color c_x, provided these “violators” form an independent set. This gives a polynomial-time extension test per choice and overall runtime O(3·2^{cc(N(x))}·poly(n)) for a fixed x; trying all x multiplies by n. This is polytime whenever cc(N(x)) is bounded and both sides are bipartite.

Limits and obstacles:
- Necessary local conditions (e.g., N(v) bipartite for all v) are far from sufficient; known triangle-free circle graphs can have chromatic number 5 (Ageev). The ply parameter can be Θ(n) even for easy instances. Extending the side method beyond bipartite sides appears to require an independent odd cycle transversal with list constraints.

Next steps:
- Unify and finalize the DP proof (k-colorability, O(n·w·k^w)). Implement and benchmark typical w values.
- Replace the double-neighborhood trapezoid claim by the hereditary-permutation fact in all notes.
- Explore a 2-SAT encoding to eliminate the 2^{cc(N(x))} factor; alternatively, branch on a small independent odd-cycle transversal per side.
- Investigate two-chord separators and whether a global decomposition can be derived by combining permutation substructures.
- Hardness attempt within K4-free circle graphs (gadget search aided by SAT/ILP).