# Algorithms & Python — Evolving Knowledge Notebook

> Topic-based reference for Data Structures, Algorithms, and Core Python
> Designed to evolve across books, courses, and interview preparation

Living notebook for core algorithms and language mechanics. The visual knowledge graph in `index.html` connects these conceptual domains; filled topics light up and provide instant interview flashcards.

**Ready topics:** Euclid's remainder algorithm, numeric values (int/float/bool), string slices & immutability, list operations & aliasing, list methods (`append` / `extend` / `remove` / `sort` / `index`), in-place mutation vs new lists, `for`-`else` search (`findpos`), loop repetition with `range()`, function namespaces & execution order, dynamic scanning with `while` (first n primes), and inductive recursion.

---

## How to use this notebook

- Add bullet points and code notes under any conceptual domain.
- When learning from new books or tutorials, append new sections or deepen existing topics.
- For interview topics, capture: one-line intuition, mathematical/runtime proof, clean code snippet, asymptotic complexity, hand traces, and pitfalls.

---

## Number Theory & Greatest Common Divisor

### Simple GCD & Factor Listings

- 

### Improving Naive GCD (Reverse Scan)

- 

### Euclid's Algorithm for GCD (Remainder Version)

**One line.** If `n` divides `m`, `gcd(m, n) = n`. Otherwise `gcd(m, n) = gcd(n, m % n)`. This remainder form is Euclid's actual algorithm. The difference form (`m - n`) is only a slower initial formulation.

**Why it works.** Write `m = qn + r` with remainder `r` strictly smaller than `n`. If `d` divides both `m` and `n`, then `d` divides `qn`, so `d` also divides `r = m - qn`. Every common divisor of `m` and `n` is a common divisor of `n` and `r`, so the greatest one is shared.

**Why not subtraction.** Subtracting peels `n` off one copy at a time. `gcd(101, 2)` needs about 50 subtractions. Remainder jumps: `101 % 2 = 1`, then `gcd(2, 1) = 1` in one step. Remainder is already `< n`, so you do not take max/min after the first call.

**Recursive implementation.**

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

### Environment & Interpreter Setup

- 

---

## Core Types & Language Foundations

### Numeric Values — int, float, bool

**One line.** Numbers come in two flavours: `int` (integers) and `float` (fractional / floating-point). They are different types because the bits are read differently.

**Why two types.** Every value is a finite sequence of 0s and 1s.

- **int** — the whole sequence is one binary number. `178`, `-3`, `4283829`.
- **float** — the sequence splits into **mantissa** and **exponent**, like scientific notation `0.602 × 10^24` (*floating point*). `37.82`, `-0.01`, `28.7998`.

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

### Strings — Slices & Immutability

**One line.** A slice is a segment of a string. The end index is excluded (same rule as `range(1, m+1)`). Strings are **immutable** — you cannot update them in place.

**Slice.** Positions start at 0.

```python
s = "hello"     # indices  0 1 2 3 4
                # letters   h e l l o
s[1:4]          # "ell"  — start in, end out, like range(1, 4)
```

`s[1:4]` takes indices 1, 2, 3. The `range(1, m+1)` convention is half-open: include the start, exclude the stop.

**Cannot modify in place.**

```python
s = "hello"
# s[3] = "p"          # TypeError — 'str' does not support item assignment
s = s[0:3] + "p!"     # "hel" + "p!" → "help!"
```

You keep the prefix you want (`s[0:3]` is `"hel"`), concatenate the new tail, and rebind the name. That creates a **new** string; the old `"hello"` is unchanged.

**Interview questions.**

1. `s = "hello"`; what is `s[1:4]`? → `"ell"` (indices 1, 2, 3).
2. Why is a slice like `range(1, m+1)`? → Both are half-open. Forgetting the excluded end is the off-by-one.
3. What does `s[3] = "p"` do? → `TypeError`. Strings are immutable.
4. How do you turn `"hello"` into `"help!"`? → `s = s[0:3] + "p!"`.
5. Does that assignment mutate `"hello"`? → No. New string, name `s` now points at it.

**Pitfalls.**

- `s[1:4]` is three characters, not four. The `4` is a fence.
- `s[3] = "p"` looks like a list update and is a favourite interview trap.
- Lists *are* mutable; strings stay immutable.

### Lists — Indexing, Aliasing & Identity

**One line.** A list index returns an element; a list slice returns a list. `list2 = list1` is an alias, not a copy. Copy with `list1[:]`. `==` is value; `is` is identity.

**Lists vs strings.**

```python
h = "hello"
h[0] == h[0:1] == "h"     # both strings

factors = [1, 2, 5, 10]
factors[0]                 # 1     — a value
factors[0:1]               # [1]   — a list
# 1 != [1]
```

**Nested lists.** Top-level of `nested = [[2, [37]], 4, ["hello"]]` has three items.

```python
nested[0]          # [2, [37]]
nested[1]          # 4
nested[2][0][3]    # "l"
nested[0][1:2]     # [[37]]  — slice, so still a list, not 37
```

**Aliasing.** Assignment does **not** copy a mutable value.

```python
list1 = [1, 3, 5, 7]
list2 = list1              # two names, one list
list1[2] = 4               # list2[2] is also 4
```

**Copy with a full slice.** A slice always makes a new list. `l[:k]` is `l[0:k]`, `l[k:]` is `l[k:len(l)]`, `l[:]` is `l[0:len(l)]`.

```python
list2 = list1[:]           # copy — later edits to list1 miss list2
```

**`==` vs `is`.**

```python
list1 = [1, 3, 5, 7]
list2 = [1, 3, 5, 7]
list3 = list2
list1 == list2             # True   same value
list2 is list3             # True   same object
list1 is list2             # False  two lists that just look alike
```

**Concatenation.** `+` glues lists like strings and **always** produces a new list.

```python
list3 = list1 + list2      # [1,3,5,7,4,5,6,8]

list1 = [1, 3, 5, 7]
list2 = list1
list1 = list1 + [9]        # rebinds list1; list2 still [1,3,5,7]
```

**Interview questions.**

1. `factors[0]` vs `factors[0:1]`? → `1` vs `[1]`. Strings do not make that distinction.
2. `nested[0][1:2]`? → `[[37]]`, not `37`.
3. `list2 = list1; list1[2] = 4`. `list2[2]`? → `4`. Same object.
4. How do you copy? → `list2 = list1[:]`.
5. `==` vs `is`? → value vs identity.
6. `list1 = list1 + [9]` after aliasing? → new list; alias broken.

**Pitfalls.**

- Wanting the number `1` and writing a slice.
- Thinking a nested slice unwraps to `37`.
- `list2 = list1` is not a copy — the classic mutation bug.
- `l[:]` is shallow: inner lists still shared.
- Using `is` to compare list contents.

### List Methods — append, extend, remove, sort, index

**One line.** `append` adds one value; `extend` concatenates in place; `remove` deletes the first match; `reverse` / `sort` reorder the same object; `index` is the leftmost position.

**Grow.**

```python
list1 = [1, 3, 5]
list1.append(7)            # [1, 3, 5, 7]  — one value
list1.append([9, 11])      # [1, 3, 5, 7, [9, 11]]  — nested
list1 = [1, 3, 5]
list1.extend([7, 9])       # [1, 3, 5, 7, 9]
# in-place equivalent of list1 = list1 + [7, 9]
```

**Shrink.** `remove(x)` deletes the **first** occurrence. Error if `x` is not in the list.

```python
list1 = [3, 1, 3, 2]
list1.remove(3)            # [1, 3, 2]
# list1.remove(99)         # ValueError
if 99 in list1:
    list1.remove(99)
```

**Reorder in place.** Both return `None` — do not assign the result back.

```python
l = [3, 1, 4, 1]
l.reverse()                # [1, 4, 1, 3]
l.sort()                   # [1, 1, 3, 4]
# wrong: l = l.sort()      # l becomes None
```

**Search.** `l.index(x)` is leftmost. Guard with `if x in l`. Lists have **no** `rindex` (strings do).

```python
l = ["a", "b", "a"]
l.index("a")               # 0

def rindex(l, x):
    for i in range(len(l) - 1, -1, -1):
        if l[i] == x:
            return i
    raise ValueError(f"{x!r} is not in list")
```

**Interview questions.**

1. `append` vs `extend`? → one element vs each item of a sequence. `append([1, 2])` nests.
2. `extend` vs `+`? → mutate same object vs new list and rebind.
3. `remove` twice / missing? → first hit only; `ValueError` if absent.
4. Does `sort()` return the list? → No, `None`. Use `sorted(l)` for a copy.
5. Leftmost vs rightmost? → `index`; walk from the end (`rindex` is a `str` method).
6. Avoid crash on `index` / `remove`? → `if x in l` first.

**Pitfalls.**

- `append(list2)` when you meant `extend`.
- `l = l.sort()` or `l = l.reverse()` → `None`.
- Bare `index` / `remove` → `ValueError`.
- Believing `list.rindex` exists because a slide wrote `l.rindex(x)`.

### Repeating n Times — range()

**One line.** To do something exactly n times, use `range`. `range(0, n)` is `0, 1, …, n−1` (n values, **stop excluded**). Same half-open rule as a slice.

**The idea vs the Python.**

```python
# idea:  for i in [1, 2, ..., n]:

for i in range(0, n):     # i = 0, 1, ..., n-1   — n repetitions
    ...

# range(i, j) → i, i+1, ..., j-1
for i in range(1, n + 1): # i = 1, 2, ..., n     — if you want 1..n
    ...
```

`range(n)` is the same as `range(0, n)`.

**Hand traces.**

- `n = 4` → `range(0, 4)` → `0, 1, 2, 3` (four passes)
- `range(1, 4)` → `1, 2, 3` — not `1..4`
- `range(2, 2)` → empty; body never runs

**Interview questions.**

1. Repeat a block n times? → `for i in range(n):`
2. What does `range(i, j)` yield? → `i .. j−1` (start in, stop out)
3. Does `range(0, n)` include n? → No; last is `n−1`
4. Loop `i` from 1 to n inclusive? → `range(1, n+1)`

**Pitfalls.**

- Building `[1,2,…,n]` just to count — use `range`
- `range(1, n)` when you wanted n trips from 1 — that is n−1 trips
- Mixing 0-based `range(n)` with 1-based “from 1 to m”

### Functions — Scope & Call Order

**One line.** Names inside a function are **local**. A function must be defined before you **call** it (mentioning another function in the body is fine). A function may call itself — **recursion** — if it has a base case.

**Scope.** Inner `n` is not outer `n`.

```python
def stupid(x):
    n = 17          # local
    return x

n = 7
v = stupid(28)
# n is still 7; v is 28
```

**Define before invoke.** Lookup happens when the call **runs**, not when `def` is read.

```python
# OK — both defs finish before z = f(77)
def f(x):
    return g(x + 1)
def g(y):
    return y + 3
z = f(77)              # g(78) → 81

# NOT OK — call sits between the two defs
# def f(x):
#     return g(x + 1)
# z = f(77)            # NameError: g is not defined
# def g(y):
#     return y + 3
```

**Recursion.** `n! = n × (n−1) × … × 1`, and `0! = 1`. The tail `(n−1)×…×1` is `(n−1)!`, so `n! = n × (n−1)!`.

```python
def factorial(n):
    if n <= 0:                 # base case
        return 1
    else:
        val = n * factorial(n - 1)
        return val
```

`factorial(3)` → `3 * factorial(2)` → `2 * factorial(1)` → `1 * factorial(0)` → `1`, then unwind to `6`.

**Interview questions.**

1. After `stupid` assigns `n = 17`, is outer `n` 17? → No, still 7. Local vs outer are different boxes.
2. Can `f` mention `g` if `g` is defined later in the file? → Yes, if `g`'s `def` has run before you call `f`.
3. Two parts of `factorial`? → Base `n <= 0` → 1; step `n * factorial(n-1)`.
4. `factorial(3)`? → 6.

**Pitfalls.**

- Thinking assignment inside a function writes the global of the same name.
- Calling in between two defs that use each other.
- No base case → infinite recursion.

### First n Primes — While Loops & Invariant Progression

**One line.** When you don't know ahead of time how many numbers you must scan to find $n$ primes, use a `while(count < n)` loop. Simultaneous tuple assignment initializes and updates counters, while `i = i + 1` must advance **unconditionally**.

**The problem: "How many to scan?"**
Unlike `range(n)` where iteration count is fixed upfront, the $n$-th prime's magnitude is not known beforehand. A `while` loop checks `count < n` dynamically.

**The code.**

```python
def nprimes(n):
    (count, i, plist) = (0, 1, [])
    while (count < n):
        if isprime(i):
            (count, plist) = (count + 1, plist + [i])
        i = i + 1
    return plist
```

**Key details.**
1. **Tuple assignment initialization:** `(count, i, plist) = (0, 1, [])` sets `count = 0`, candidate `i = 1`, and empty prime list `plist = []` in one atomic expression.
2. **Loop condition:** `while (count < n)` stops precisely when $n$ primes have been found.
3. **Simultaneous update:** `(count, plist) = (count + 1, plist + [i])` increments the prime count and creates an extended list with `+ [i]`.
4. **Unconditional progress:** `i = i + 1` is outside the `if` block. It must execute on *every* loop iteration regardless of whether $i$ was prime, otherwise composite numbers would trap the program in an infinite loop!

**Hand trace ($n = 3$).**
- Start: `(count, i, plist) = (0, 1, [])`
- `i = 1`: `isprime(1)` is `False` $\rightarrow$ `i` becomes `2`
- `i = 2`: `isprime(2)` is `True`  $\rightarrow$ `count = 1, plist = [2]`, `i` becomes `3`
- `i = 3`: `isprime(3)` is `True`  $\rightarrow$ `count = 2, plist = [2, 3]`, `i` becomes `4`
- `i = 4`: `isprime(4)` is `False` $\rightarrow$ `i` becomes `5`
- `i = 5`: `isprime(5)` is `True`  $\rightarrow$ `count = 3, plist = [2, 3, 5]`, `i` becomes `6`
- `count < 3` is now `False` $\rightarrow$ returns `[2, 3, 5]`.

**Interview questions.**

1. *Why use while instead of for for finding the first n primes?*
   $\rightarrow$ We do not know in advance what the $n$-th prime value will be. A `while (count < n)` loop runs dynamically until the termination condition is met.
2. *Why is `i = i + 1` called "unconditional"?*
   $\rightarrow$ It is placed outside the `if isprime(i):` check so that non-primes are skipped and the search space continuously advances. Putting it inside causes an infinite loop on the first composite number.
3. *What is the memory and time drawback of `plist + [i]`?*
   $\rightarrow$ `+` creates and copies an entirely new list of length $k$ each time, adding $O(n^2)$ copying overhead over $n$ steps. In production, `plist.append(i)` operates in $O(1)$ amortized time.
4. *How does `(count, plist) = (count + 1, plist + [i])` execute?*
   $\rightarrow$ Python computes the entire right-hand tuple first, then unpacks and assigns to the left-hand targets simultaneously.

**Pitfalls.**
- Indenting `i = i + 1` under `if isprime(i):` — freezes execution on $i = 1$ or $i = 4$.
- Using `count <= n` instead of `count < n` — produces $n + 1$ primes.
- Confusing list concatenation `plist + [i]` (needs bracket `[i]`) with integer addition.

---

## Inductive Definitions & Recursion

### Range Slices & Stepping

- 

### Manipulating Lists in Memory

**One line.** `append`, `extend`, `remove`, `reverse`, and `sort` edit the existing list object. Every alias sees the change. `+` allocates a new list and rebinds one name.

**In-place leaks through aliases.**

```python
list1 = [1, 3, 5]
list2 = list1              # alias
list1.append(7)
list1.extend([9])
list1.reverse()
# list2 is [9, 7, 5, 3, 1] — same object
```

**`+` rebinds; `extend` does not.**

```python
list1 = [1, 3, 5]
list2 = list1
list1 = list1 + [7]        # new list; list2 still [1, 3, 5]

list1 = [1, 3, 5]
list2 = list1
list1.extend([7])          # same list; list2 is [1, 3, 5, 7]
```

**Copy, then mutate one side.**

```python
list1 = [3, 1, 2]
list2 = list1[:]
list1.sort()
# list1 is [1, 2, 3]; list2 is still [3, 1, 2]
```

**Interview questions.**

1. `list2 = list1; list1.extend([9])`. `list2`? → the extended list. Contrast `list1 = list1 + [9]`.
2. Why prefer `append` over `+` when collecting primes? → `+` copies each time (`O(n²)`); `append` is amortized `O(1)` on the same object.
3. Sort without destroying the original? → `sorted(l)`, or copy then `.sort()`. Never `l = l.sort()`.

**Pitfalls.**

- Mutating through an alias and thinking there were two lists.
- Treating `extend` and `+` as interchangeable while another name still points at the original.
- Sorting or reversing a list still needed in input order.

### Loop Breaking & Early Exit

**One line.** A `for` loop may have an `else`. That `else` runs only on **normal termination** (no `break`) — “never found”. Do **not** seed `pos = -1` before the loop.

**`findpos` — `else` means no `break`.**

```python
def findpos(l, v):
    for i in range(len(l)):
        if l[i] == v:      # exit, report position
            pos = i
            break
    else:
        pos = -1           # no break, v not in l
    return pos
```

The slide crosses out `pos = -1` above the `for`. The `else` *is* that assignment.

**Same idea with early return.**

```python
def findpos(l, v):
    for i in range(len(l)):
        if l[i] == v:
            return i
    return -1
```

**Interview questions.**

1. When does `for`-`else` run? → the loop did not `break` (including zero iterations).
2. Write `findpos(l, v)` with `for`-`else`. → match: `pos = i; break`. `else: pos = -1`.
3. Why not `pos = -1` before the loop? → duplicates the `else` and hides the feature.
4. vs `l.index(v)`? → `index` raises `ValueError` on a miss; `findpos` returns `-1`.
5. Is the `else` attached to the `if`? → No. It hangs on `for`.

**Pitfalls.**

- Reading `for`-`else` as `if`-`else`.
- Initialising `pos = -1` *and* using `else`.
- Forgetting `break` after a hit — you report the last match, not the first.
- Using unguarded `l.index` when the miss sentinel should be `-1`. 

### Arrays vs Lists & Binary Search

- 

### Algorithmic Efficiency & Orders of Growth

- 

### Selection Sort

- 

### Insertion Sort

- 

### Recursive Functions & Induction

**One line.** An inductive definition (base case + a step on a smaller argument) becomes a recursive Python function.

**What every recursive function needs.**

1. A base case that returns without calling itself.
2. Progress: each call gets a strictly smaller problem (smaller `n`, shorter list, smaller `k`).
3. The base case must be reachable in finitely many steps — the same contract as a `while` loop.

You already used this in Euclid: `gcd(m, n)` reduces to `gcd(n, m % n)` until `n` divides `m`.

**Arithmetic.**

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

**Recursive insertion sort.** Sort `seq[0:k-1]`, then insert `seq[k-1]`.

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

**Complexity.** Recursive insertion sort: `T(n) = (n − 1) + T(n − 1)`, `T(1) = 1` → `n(n − 1)/2 = O(n²)`. Selection sort is also `O(n²)`; insertion is usually faster, especially on nearly sorted input. `O(n²)` hurts for `n` over ~5000 — divide-and-conquer (merge sort) is next. Recursion made insertion sort clearer, not faster.

`l[1:]` copies a list each call, so naive list recursion can be extra `O(n)` memory/time per level.

**Hand traces.**

- `factorial(4)` → `4 * 3 * 2 * 1 * factorial(0)` → `24`
- `length([7, 8, 9])` → `1 + 1 + 1 + length([])` → `3`
- `isort(seq, 3)` sorts the prefix of length 2, then inserts `seq[2]`

**Interview questions.**

1. Two parts of a recursive function? → Base case + smaller recursive step.
2. Recursion vs `while`? → Same reduction. Euclid was formulated both ways.
3. Write `factorial`. → `n == 0` return 1, else `n * factorial(n - 1)`.
4. Inductive list functions? → Head + tail; base `[]`; examples `length`, `sumlist`.
5. Too deep? → `RecursionError` at ~1000 frames; raise the limit or rewrite as a loop.
6. Insertion-sort recurrence? → `T(n) = T(n-1) + (n-1) = O(n²)`.
7. When to use recursion in an interview? → Trees, divide-and-conquer, backtracking, gcd-style reductions. State complexity and the depth limit.

**Pitfalls.**

- Missing or unreachable base case → infinite recursion / `RecursionError`.
- `multiply` bases on `n == 1`, not `0`.
- Slice recursion `l[1:]` can silently become `O(n²)`.
- Recursive insertion sort is still quadratic — wait for merge sort for speed.

---

## Divide & Conquer Sorting

### Merge Sort Algorithm

- 

### Merge Sort Analysis — O(n log n)

- 

### Quick Sort Algorithm

- 

### Quick Sort Partitioning & Worst Case

- 

### Tuples & Dictionaries

- 

### Function Arguments & Lambda

- 

### List Comprehensions

- 

---

## Exceptions, File I/O & Formatting

### Exception Handling (try-except-finally)

- 

### Standard Input and Output

- 

### File Operations & Context Managers

- 

### String Methods & Formatting

- 

### Formatted Output & String Interpolation

- 

### Special Names: pass, del(), None

- 

---

## Backtracking & Priority Queues

### Backtracking & N-Queens Problem

- 

### Global, Local & Nonlocal Scopes

- 

### Permutations Generation

- 

### Abstract Stacks & Queues

- 

### Priority Queues & Binary Heaps

- 

---

## User-Defined Types & Search Trees

### Abstract Data Types & Object-Oriented Design

- 

### Classes, Methods & Objects in Python

- 

### User-Defined Linked Lists

- 

### Binary Search Trees (Insert, Delete, Search)

- 

---

## Dynamic Programming & Optimization

### Memoization & Dynamic Programming Principles

- 

### Grid Paths Optimization

- 

### Longest Common Subsequence (LCS)

- 

### Matrix Chain Multiplication

- 

### Language Wrap-Up & Paradigm Comparisons

- 
