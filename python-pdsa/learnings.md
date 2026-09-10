# PDSA using Python — Learnings

> Programming, Data Structures and Algorithms using Python
> Prof. Madhavan Mukund, Chennai Mathematical Institute
> [NPTEL 106106145](https://nptel.ac.in/courses/106106145)

Living notebook for the course. Capture what you want to recall in an interview. The visual map in `index.html` uses the same eight-week structure; filled lectures light up as notes arrive.

**Ready now:** Euclid's remainder algorithm (Week 1, Lecture 3), numeric types (Week 2, Lecture 5), string slices and immutability (Week 2, Lecture 6), and Recursion (Week 3, Lecture 8).

---

## How to use this file

- Add bullets under a lecture as you watch.
- Keep one idea per bullet so the map can fold it in cleanly.
- For interview topics, aim for: one-line idea, why it works, code, complexity, a hand trace, questions, pitfalls.

---

## Week 1 — Algorithms through gcd

### Lecture 1. Algorithms and programming: simple gcd

- 

### Lecture 2. Improving naive gcd

- 

### Lecture 3. Euclid's algorithm for gcd — remainder version (2nd version)

**One line.** If `n` divides `m`, `gcd(m, n) = n`. Otherwise `gcd(m, n) = gcd(n, m % n)`. This remainder form is Euclid's actual algorithm. The difference form (`m - n`) is only a slower first version.

**Why it works.** Write `m = qn + r` with remainder `r` strictly smaller than `n`. If `d` divides both `m` and `n`, then `d` divides `qn`, so `d` also divides `r = m - qn`. Every common divisor of `m` and `n` is a common divisor of `n` and `r`, so the greatest one is shared.

**Why not version 1.** Subtracting peels `n` off one copy at a time. `gcd(101, 2)` needs about 50 subtractions. Remainder jumps: `101 % 2 = 1`, then `gcd(2, 1) = 1` in one step. Remainder is already `< n`, so you do not take max/min after the first call.

**Recursive (lecture).**

```python
def gcd(m, n):
    # Assume m >= n
    if m < n:
        (m, n) = (n, m)
    if (m % n) == 0:
        return n
    else:
        return gcd(n, m % n)
```

**Same reduction as a while loop.**

```python
def gcd(m, n):
    if m < n:
        (m, n) = (n, m)
    while (m % n) != 0:
        (m, n) = (n, m % n)
    return n
```

**Python bits.** `(m, n) = (n, m)` is simultaneous assignment — both right-hand values are read first, so a swap needs no temp. `m % n` is remainder. `!=` is not-equal. `#` comments to end of line. Calling `gcd` from inside `gcd` is allowed; that is recursion.

**Complexity.** Naive factor scan is proportional to `min(m, n)`. Remainder Euclid is proportional to the number of digits of `max(m, n)` (interview: `O(log min(m, n))`). A billion (~10 digits) is ~10 remainder steps, not ~10⁹ factor checks. Worst case: consecutive Fibonacci numbers; still logarithmic.

**Termination.** Each remainder is a smaller non-negative integer. It cannot stay put: remainder 0 would already have returned. Worst case it hits 1, and 1 divides every integer.

**Hand traces.**

- `gcd(101, 2)` → `101 % 2 = 1` → `gcd(2, 1)` → `2 % 1 = 0` → `1`
- `gcd(14, 63)` → swap to `gcd(63, 14)` → `63 % 14 = 7` → `gcd(14, 7)` → `0` remainder → `7`
- `gcd(48, 18)` → `12` → `gcd(18, 12)` → `6` → `gcd(12, 6)` → `6`

**Interview questions.**

1. State the remainder identity in one line. → If `n | m` return `n`, else `gcd(n, m mod n)`.
2. Why is remainder faster than difference? → Modulo skips `q` copies of `n` at once.
3. Prove `gcd(m, n) = gcd(n, m % n)`. → `m = qn + r`; common divisors of `m, n` are exactly those of `n, r`.
4. Time complexity? → `O(log min(m, n))` vs naive `Θ(min(m, n))`.
5. Iterative form? → While remainder ≠ 0, `(m, n) = (n, m % n)`, then return `n`.
6. If the caller passes `m < n`? → Swap once. Later remainders are already smaller.

**Pitfalls.**

- Interviews want remainder, not subtraction.
- CPython does not optimise tail recursion — prefer the loop for huge values.
- `n == 0` blows up on `%`. Guard if you need `gcd(0, n) = n`.
- `math.gcd` exists; you still write Euclid in an interview.

### Lecture 4. Downloading and installing Python

- 

---

## Week 2 — Basics of Python

### Lecture 5. Assignment, int, float, bool — numeric values

**One line.** Numbers come in two flavours: `int` (integers) and `float` (fractional / floating-point). They are different types because the bits are read differently.

**Why two types.** Every value is a finite sequence of 0s and 1s.

- **int** — the whole sequence is one binary number. `178`, `-3`, `4283829`.
- **float** — the sequence splits into **mantissa** and **exponent**, like scientific notation `0.602 × 10^24`. The lecture calls this *floating point*. `37.82`, `-0.01`, `28.7998`.

Finite bits in the mantissa mean many decimals are stored only approximately — that is why `0.1 + 0.2` can fail `== 0.3`.

**Operations.**

```python
7 / 3.5      # 2.0   — / always produces a float
7 / 2        # 3.5
9 // 5       # 1     — quotient
9 % 5        # 4     — remainder
3 ** 4       # 81    — exponentiation
```

- `+`, `-`, `*`, `/` — usual arithmetic. In Python 3, `/` always returns a float.
- `//` quotient, `%` remainder. Euclid uses `%`. Check: `9 = (9//5)*5 + (9%5)`.
- `**` is power (`3**4` is `81`). Not `*`.

**math library.** `log()`, `sqrt()`, `sin()` are built into Python but not loaded by default.

```python
from math import *
sqrt(9)      # 3.0
```

**Boolean from a comparison.** `=` assigns; `==` compares. The comparison itself is a `bool`.

```python
divisor = (m % n == 0)   # True iff n divides m
```

Same test as Euclid's base case: if `divisor` is true, return `n`.

**Hand traces.**

- `7 / 2` → `3.5` (float, not `3`)
- `9 // 5` → `1`, `9 % 5` → `4`
- `3 ** 4` → `81`
- `m, n = 14, 7` → `(14 % 7 == 0)` → `True`
- `m, n = 14, 5` → `(14 % 5 == 0)` → `False`

**Interview questions.**

1. Why int vs float? → Same bits, different reading: whole binary integer vs mantissa + exponent.
2. What does `/` return in Python 3? → Always float. `7/2` is `3.5`. Use `//` for quotient.
3. `/` vs `//` vs `%`? → True division, floor quotient, remainder.
4. How do you write 3⁴? → `3 ** 4` → `81`.
5. Why `sqrt(9)` fails in a fresh interpreter? → Need `from math import *` (or `import math`).
6. Type of `divisor = (m % n == 0)`? → `bool`. Euclid's “does n divide m?”
7. Why can `0.1 + 0.2 != 0.3`? → Finite mantissa. Do not `==` floats for exact tests.

**Pitfalls.**

- Python 3 `/` is not integer division (Python 2 muscle memory).
- `**` not `*` for powers.
- math functions need an import; `from math import *` pollutes the namespace — `import math` is cleaner in real code.
- `=` vs `==`.
- Euclid's `%` test is for ints, not floats. 

### Lecture 6. Strings — slices and immutability

**One line.** A slice is a segment of a string. The end index is excluded (same rule as `range(1, m+1)`). Strings are **immutable** — you cannot update them in place.

**Slice.** Positions start at 0.

```python
s = "hello"     # indices  0 1 2 3 4
                # letters   h e l l o
s[1:4]          # "ell"  — start in, end out, like range(1, 4)
```

`s[1:4]` takes indices 1, 2, 3. The handwritten `range(1, m+1)` on the slide is the same half-open convention: include the start, exclude the stop.

**Cannot modify in place.**

```python
s = "hello"
# s[3] = "p"          # TypeError — 'str' does not support item assignment
s = s[0:3] + "p!"     # "hel" + "p!" → "help!"
```

You keep the prefix you want (`s[0:3]` is `"hel"`), concatenate the new tail, and rebind the name. That creates a **new** string; the old `"hello"` is unchanged.

**Interview questions.**

1. `s = "hello"`; what is `s[1:4]`? → `"ell"` (indices 1, 2, 3).
2. Why does the lecturer write `range(1, m+1)` next to slices? → Both are half-open. Forgetting the excluded end is the off-by-one.
3. What does `s[3] = "p"` do? → `TypeError`. Strings are immutable.
4. How do you turn `"hello"` into `"help!"`? → `s = s[0:3] + "p!"`.
5. Does that assignment mutate `"hello"`? → No. New string, name `s` now points at it.

**Pitfalls.**

- `s[1:4]` is three characters, not four. The `4` is a fence.
- `s[3] = "p"` looks like a list update and is a favourite interview trap.
- Lists (later) *are* mutable; strings stay immutable. 

### Lecture 7. Lists

- 

### Lecture 8. Control flow

- 

### Lecture 9. Functions

- 

### Lecture 10. Examples

- 

---

## Week 3 — Lists, induction, sorting, recursion

### Lecture 11. More about range()

- 

### Lecture 12. Manipulating lists

- 

### Lecture 13. Breaking out of a loop

- 

### Lecture 14. Arrays vs lists, binary search

- 

### Lecture 15. Efficiency

- 

### Lecture 16. Selection sort

- 

### Lecture 17. Insertion sort

- 

### Lecture 18. Recursion

**One line.** An inductive definition (base case + a step on a smaller argument) becomes a recursive Python function.

**What every recursive function needs.**

1. A base case that returns without calling itself.
2. Progress: each call gets a strictly smaller problem (smaller `n`, shorter list, smaller `k`).
3. The base case must be reachable in finitely many steps — the same contract as a `while` loop.

You already used this in Euclid: `gcd(m, n)` reduces to `gcd(n, m % n)` until `n` divides `m`. Week 3 names the pattern.

**Arithmetic (lecture).**

```python
def factorial(n):
    if n == 0:
        return 1
    else:
        return n * factorial(n - 1)

def multiply(m, n):
    if n == 1:
        return m
    else:
        return m + multiply(m, n - 1)
```

`0! = 1`, `n! = n × (n − 1)!`. Multiplication is repeated addition.

**Lists.** Split as first element + rest `l[1:]`. Base: empty list (or length 1). Step: define `f(l)` from a smaller sublist.

```python
def length(l):
    if l == []:
        return 0
    else:
        return 1 + length(l[1:])

def sumlist(l):
    if l == []:
        return 0
    else:
        return l[0] + sumlist(l[1:])
```

**Recursive insertion sort (lecture).** Sort `seq[0:k-1]`, then insert `seq[k-1]`.

```python
def InsertionSort(seq):
    isort(seq, len(seq))

def isort(seq, k):  # sort slice seq[0:k]
    if k > 1:
        isort(seq, k - 1)
        insert(seq, k - 1)

def insert(seq, k):  # insert seq[k] into sorted seq[0:k-1]
    pos = k
    while pos > 0 and seq[pos] < seq[pos - 1]:
        (seq[pos], seq[pos - 1]) = (seq[pos - 1], seq[pos])
        pos = pos - 1
```

**Python depth.** Recursion limit is about 1000. `InsertionSort(list(range(1000, 0, -1)))` raises `RecursionError`. `import sys; sys.setrecursionlimit(10000)` raises the ceiling. Prefer a loop in real code. CPython does not do tail-call optimisation.

**Complexity.** Recursive insertion sort: `T(n) = (n − 1) + T(n − 1)`, `T(1) = 1` → `n(n − 1)/2 = O(n²)`. Selection sort is also `O(n²)`; insertion is usually faster, especially on nearly sorted input. `O(n²)` hurts for `n` over ~5000 — next week is merge sort. Recursion made insertion sort clearer, not faster.

`l[1:]` copies a list each call, so naive list recursion can be extra `O(n)` memory/time per level.

**Hand traces.**

- `factorial(4)` → `4 * 3 * 2 * 1 * factorial(0)` → `24`
- `length([7, 8, 9])` → `1 + 1 + 1 + length([])` → `3`
- `isort(seq, 3)` sorts the prefix of length 2, then inserts `seq[2]`

**Interview questions.**

1. Two parts of a recursive function? → Base case + smaller recursive step.
2. Recursion vs `while`? → Same reduction. Euclid was written both ways in Week 1.
3. Write `factorial`. → `n == 0` return 1, else `n * factorial(n - 1)`.
4. Inductive list functions? → Head + tail; base `[]`; examples `length`, `sumlist`.
5. Too deep? → `RecursionError` at ~1000 frames; raise the limit or rewrite as a loop.
6. Insertion-sort recurrence? → `T(n) = T(n-1) + (n-1) = O(n²)`.
7. When to use recursion in an interview? → Trees, divide-and-conquer, backtracking, gcd-style reductions. State complexity and the depth limit.

**Pitfalls.**

- Missing or unreachable base case → infinite recursion / `RecursionError`.
- Lecture `multiply` bases on `n == 1`, not `0`.
- Slice recursion `l[1:]` can silently become `O(n²)`.
- Recursive insertion sort is still quadratic — wait for merge sort for speed.

---

## Week 4 — Mergesort, quicksort, tuples

### Lecture 19. Mergesort

- 

### Lecture 20. Mergesort, analysis

- 

### Lecture 21. Quicksort

- 

### Lecture 22. Quicksort analysis

- 

### Lecture 23. Tuples and dictionaries

- 

### Lecture 24. Function definitions

- 

### Lecture 25. List comprehension

- 

---

## Week 5 — Exceptions, I/O, files, strings

### Lecture 26. Exception handling

- 

### Lecture 27. Standard input and output

- 

### Lecture 28. Handling files

- 

### Lecture 29. String functions

- 

### Lecture 30. Formatting printed output

- 

### Lecture 31. pass, del() and None

- 

---

## Week 6 — Backtracking, scope, heaps

### Lecture 32. Backtracking, N queens

- 

### Lecture 33. Global scope, nested functions

- 

### Lecture 34. Generating permutations

- 

### Lecture 35. Sets, stacks, queues

- 

### Lecture 36. Priority queues and heaps

- 

---

## Week 7 — Classes, lists, search trees

### Lecture 37. Abstract datatypes, classes and objects

- 

### Lecture 38. Classes and objects in Python

- 

### Lecture 39. User defined lists

- 

### Lecture 40. Search trees

- 

---

## Week 8 — Memoization and dynamic programming

### Lecture 41. Memoization and dynamic programming

- 

### Lecture 42. Grid paths

- 

### Lecture 43. Longest common subsequence

- 

### Lecture 44. Matrix multiplication

- 

### Lecture 45. Wrap-up, Python vs other languages

- 
