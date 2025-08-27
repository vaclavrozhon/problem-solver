# Prototype: semigroup-of-types explorer for beta-normalized, radius-1 LCLs on oriented paths
# Input: Cinout: 2 x beta table; Coutout: beta x beta table
# Computes M0, M1 as boolean matrices; explores the semigroup S = <M0, M1> for small beta
# Provides basic sufficient-condition checks for O(1) and Omega(n) (heuristic), and computes a crude pump bound.

from collections import deque
from itertools import product

class BoolMat:
    def __init__(self, n, data=None):
        self.n = n
        if data is None:
            self.a = [[0]*n for _ in range(n)]
        else:
            self.a = [row[:] for row in data]
    def __eq__(self, other):
        return self.a == other.a
    def __hash__(self):
        # tuple of tuples for hashing
        return hash(tuple(tuple(row) for row in self.a))
    def mul(self, other):
        n = self.n
        res = BoolMat(n)
        # boolean matrix multiply
        for i in range(n):
            for k in range(n):
                if self.a[i][k]:
                    # Or row i of self with column j of other
                    row_k = other.a[k]
                    r = res.a[i]
                    for j in range(n):
                        if row_k[j]:
                            r[j] = 1
        return res
    @staticmethod
    def identity(n):
        I = BoolMat(n)
        for i in range(n):
            I.a[i][i] = 1
        return I
    def is_idempotent(self):
        return self.mul(self) == self
    def rank_bool(self):
        # boolean rank upper bound via greedy cover (heuristic)
        # Not exact; used only as a rough check.
        n = self.n
        rows = [tuple(row) for row in self.a]
        basis = []
        covered = set()
        for i, r in enumerate(rows):
            if r in covered:
                continue
            basis.append(r)
            # cover rows reachable by OR with this row
            new_cov = set([r])
            for s in list(covered):
                new_cov.add(tuple(int(a or b) for a, b in zip(s, r)))
            covered.update(new_cov)
        return len(basis)

def build_M_sigma(Cinout, Coutout, sigma):
    # Cinout: list of 2 rows, each a list of beta bits; Coutout: list of beta rows of beta bits
    beta = len(Coutout)
    M = BoolMat(beta)
    A = Cinout[sigma]
    for u in range(beta):
        if A[u] == 0:
            continue
        row_u = Coutout[u]
        for v in range(beta):
            if row_u[v]:
                M.a[u][v] = 1
    return M

def semigroup_closure(M0, M1, limit=100000):
    # BFS closure; limit to avoid blow-up
    gens = [M0, M1]
    seen = set(gens)
    q = deque(gens)
    mults = {}  # optional: store parents
    while q and len(seen) < limit:
        X = q.popleft()
        for Y in gens:
            Z = X.mul(Y)
            if Z not in seen:
                seen.add(Z)
                q.append(Z)
                mults[Z] = (X, Y)
    return seen

def sufficient_O1_condition(Cinout, Coutout):
    # A very strong sufficient condition for O(1): exists labels a0 in A0, a1 in A1 s.t. (a_sigma, a_tau) allowed for all successive bits sigma, tau
    # i.e., Coutout has (a0,a0),(a0,a1),(a1,a0),(a1,a1)=1
    A0 = [i for i,b in enumerate(Cinout[0]) if b]
    A1 = [i for i,b in enumerate(Cinout[1]) if b]
    for a0 in A0:
        for a1 in A1:
            ok = True
            for u, v in [(a0,a0),(a0,a1),(a1,a0),(a1,a1)]:
                if Coutout[u][v] == 0:
                    ok = False
                    break
            if ok:
                return True
    return False

def sufficient_Omegan_condition(M0, M1):
    # Heuristic: if every idempotent in the semigroup is a permutation-like projector that fixes a unique label per row
    # and the semigroup contains the identity and a transposition-like element, suspect Omega(n).
    S = semigroup_closure(M0, M1, limit=10000)
    idems = [X for X in S if X.is_idempotent()]
    if not idems:
        return False
    # Check if some idempotent has all rows with a single 1 and distinct columns (a partial permutation)
    def is_partial_perm(X):
        seen_cols = set()
        for i in range(X.n):
            cols = [j for j in range(X.n) if X.a[i][j]]
            if len(cols) != 1:
                return False
            if cols[0] in seen_cols:
                return False
            seen_cols.add(cols[0])
        return True
    if any(is_partial_perm(E) for E in idems):
        return True
    return False

def classify(Cinout, Coutout):
    beta = len(Coutout)
    M0 = build_M_sigma(Cinout, Coutout, 0)
    M1 = build_M_sigma(Cinout, Coutout, 1)
    if sufficient_O1_condition(Cinout, Coutout):
        return "O(1) (sufficient condition triggered)"
    if sufficient_Omegan_condition(M0, M1):
        return "suspect Ω(n) (heuristic)"
    return "unknown (could be Θ(log* n) or O(1)); requires deeper checks"

if __name__ == "__main__":
    # Example: 3-coloring on paths
    beta = 3
    Cinout = [ [1]*beta, [1]*beta ]
    Coutout = [[1 if i!=j else 0 for j in range(beta)] for i in range(beta)]
    print("3-coloring classification:", classify(Cinout, Coutout))
    # Example: 2-coloring
    beta = 2
    Cinout = [ [1]*beta, [1]*beta ]
    Coutout = [[0,1],[1,0]]
    print("2-coloring classification:", classify(Cinout, Coutout))
