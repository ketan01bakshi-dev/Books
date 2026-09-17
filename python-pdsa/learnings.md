# Algorithms & Python — Evolving Knowledge Notebook

> Topic-based reference for Data Structures, Algorithms, and Core Python
> Designed to evolve across books, courses, and interview preparation

Living notebook for core algorithms and language mechanics. The visual knowledge graph in `index.html` connects these conceptual domains; filled topics light up and provide instant interview flashcards.

**Ready topics:** Euclid's remainder algorithm, numeric values (int/float/bool), string slices & immutability, list operations & aliasing, list methods (`append` / `extend` / `remove` / `sort` / `index`), in-place mutation vs new lists, `for`-`else` search (`findpos`), arrays vs linked lists & binary search (`O(log n)` only with `O(1)` index), worst-case `T(n)` and Big-O growth (Python ~`10^7` steps/s), selection sort (Strategy 1) and insertion sort (Strategy 2, `n(n−1)/2`), merge sort (halves + linear merge), loop repetition with `range()`, function namespaces & execution order, dynamic scanning with `while` (first n primes), and inductive recursion.

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

**One line.** An array is one contiguous block — `seq[i]` is an offset, `O(1)`. A linked list scatters nodes — `seq[i]` follows `i` pointers. Binary search halves a **sorted array**. It needs cheap indexing, so it does not transfer to linked lists. A Python `list` is a dynamic array; this course pretends it is an array.

**Array.** Single block, uniform cells, size typically fixed in the abstract model. Indexing computes an offset from the start. Inserting between `seq[i]` and `seq[i+1]` shifts the tail; shrinking the block also moves cells — both expensive.

**Linked list.** Values scattered; each node points to the next; size is flexible. Access `seq[i]` costs `i` links. Insert or delete is “plumbing” (retarget pointers) **if you are already at** `seq[i]`.

**Operations.**

| | Array | Linked list |
|---|---|---|
| `seq[i]` | `O(1)` | `O(i)` |
| Swap `seq[i]`, `seq[j]` | `O(1)` | linear (walk to both) |
| Insert/delete at known `seq[i]` | linear (shift) | `O(1)` pointers |

Algorithms on one structure may not transfer. Flagged example: **binary search**.

**Search problem.** Is `v` in `seq`? Structure (array vs list) matters. Organisation (sorted vs unsorted) matters.

**Binary search** (sorted `seq`). Compare `v` to the midpoint. Equal → found. `v` smaller → left half. `v` larger → right half.

```python
def bsearch(seq, v, l, r):
    # search for v in seq[l:r]; seq is sorted
    if r - l == 0:          # empty slice
        return False
    mid = (l + r) // 2      # integer division
    if v == seq[mid]:
        return True
    if v < seq[mid]:
        return bsearch(seq, v, l, mid)       # [l, mid)
    else:
        return bsearch(seq, v, mid + 1, r)   # [mid+1, r)

def contains(seq, v):
    return bsearch(seq, v, 0, len(seq))
```

**Recurrence.** `T(0) = 1`, `T(n) = 1 + T(n/2)`. Unwind: `T(n) = k + T(n/2^k)` with `k = log₂ n` → `O(log n)`. That leading `1` is one **constant-time** `seq[mid]`. On a linked list, `T(n) = Θ(n) + T(n/2) = Θ(n)`.

**Python lists.** Docs call them lists (efficient expand/contract at the end). Positional indexing lets us treat them as arrays. A real linked list is a later explicit type.

**Interview questions.**

1. Why is `seq[i]` `O(1)` in an array? → offset from the start of one block.
2. Insert in the middle? → array shifts; list plumbing if already at the node.
3. Swap costs? → `O(1)` array, linear list.
4. Binary search on a linked list? → no `O(log n)`; needs `O(1)` `seq[mid]`.
5. Write `bsearch` on `seq[l:r]`. → empty if `r-l==0`; `mid=(l+r)//2`; left `[l,mid)`, right `[mid+1,r)`.
6. Why `//` and `mid+1`? → int index; exclude already-tested `mid`; make progress on length 1.
7. Derive `O(log n)`. → unwind `1+T(n/2)` about `log₂ n` times. `2¹⁰ = 1024`.
8. Python list: list or array? → dynamic array; course pretends array.

**Pitfalls.**

- Calling a Python `list` a linked list.
- Binary search on unsorted data.
- `/` instead of `//`, or inclusive bounds that stall on a miss.
- Copying `T(n)=1+T(n/2)` onto a linked list.

### Algorithmic Efficiency & Orders of Growth

**One line.** `T(n)` is time as a function of input size, usually **worst case**. Big-O names the growth class. Python does about **10⁷ steps per second** — that is why `n²` dies at a million and `2ⁿ` dies immediately.

**Worst case.** For search, that is “`v` is not in `seq`”. Worst case is easier to compute than a genuine average (which needs a distribution).

**O() notation.** We care whether `T(n)` is proportional to `log n`, `n`, `n log n`, `n²`, `n³`, `2ⁿ`, … Linear scan is `O(n)` for arrays **and** lists. Binary search is `O(log n)` for **sorted arrays**.

**Python budget (~10⁷ steps/s).** `2¹⁰=1024`, `2²⁰≈10⁶`, `2³⁰≈10⁹`. So `log₂(10⁶)≈20`. At `n=10⁶`, `n log n ≈ 2×10⁷` (about a second); `n²=10¹²` is not. `2ⁿ` and `n!` leave the table almost at once (`n=10` already: `2¹⁰=1024`, `10!≈3.6×10⁶`; `n=100` is fantasy).

**Why sort.** Unsorted search is `O(n)`; sorted array search is `O(log n)`. Also: **median** = midpoint of the sorted sequence; **duplicates** sit next to each other; a **frequency table** is one grouped pass.

**Interview questions.**

1. What is `T(n)`? Which case? → time vs input size; usually worst case; for search, a miss.
2. `T(n)=O(n)`? → grows like `n`; constants stripped.
3. Linear vs binary? → `O(n)` unsorted / any walk; `O(log n)` sorted array.
4. Python budget? → ~10⁷ steps/s; `n=10⁶` linear yes, quadratic no.
5. Why sort besides searching? → median, duplicates, frequencies.
6. Powers of two? → `2¹⁰=1024`, `2²⁰≈10⁶`, `2³⁰≈10⁹`.

**Pitfalls.**

- Best-case “found at 0” as the quoted complexity.
- `O(log n)` on a linked list or unsorted data.
- “Both polynomial” so `n²` at `n=10⁶` is fine.
- Treating 10⁷ as a law of physics rather than a Python-order budget.

### Selection Sort

**One line.** Strategy 1: select the minimum of the remaining suffix and lock it into the next prefix cell. Always `n+(n−1)+…+1 = O(n²)` comparisons.

**Papers.** Lowest remaining marks onto the new stack; repeat.

```python
def SelectionSort(seq):
    for start in range(len(seq)):
        minpos = start
        for i in range(start, len(seq)):
            if seq[i] < seq[minpos]:
                minpos = i
        (seq[start], seq[minpos]) = (seq[minpos], seq[start])
```

**Interview.** Always Θ(n²) even if already sorted. One swap per outer step. Not the adaptive cousin of insertion.

### Insertion Sort

**One line.** Strategy 2: insert each new value into a growing sorted prefix. Worst case `T(n)=1+2+…+(n−1)=n(n−1)/2=O(n²)`. Already sorted is Θ(n).

**Papers.** First paper starts the stack; each later paper inserts into the correct place.

**Invariant.** At the top of the loop, `seq[0:sliceEnd]` is sorted. Slide `seq[sliceEnd]` left.

```python
def InsertionSort(seq):
    for sliceEnd in range(len(seq)):
        # seq[0:sliceEnd] already sorted
        pos = sliceEnd
        while pos > 0 and seq[pos] < seq[pos - 1]:
            (seq[pos], seq[pos - 1]) = (seq[pos - 1], seq[pos])
            pos = pos - 1
```

`sliceEnd = 0` is a no-op. Recursion is the same algorithm: sort the prefix, then insert the last cell.

**Recursive form.** Base: length 0 or 1, done. Step: sort `l[0:len(l)-1]`, insert `l[len(l)-1]` (not `l[len(l)]`). `isort(seq, k)` sorts `seq[0:k]` in place; then `insert(seq, k-1)`.

```python
def InsertionSort(seq):
    isort(seq, len(seq))

def isort(seq, k):     # sort seq[0:k]
    if k > 1:
        isort(seq, k - 1)
        insert(seq, k - 1)

def insert(seq, k):    # seq[k] into sorted seq[0:k]
    pos = k
    while pos > 0 and seq[pos] < seq[pos - 1]:
        (seq[pos], seq[pos - 1]) = (seq[pos - 1], seq[pos])
        pos = pos - 1
```

**Recurrence.** `T(n) = (n-1) + T(n-1)`, `T(1)=1`. Unwind: `(n-1)+…+1 = n(n-1)/2 = O(n²)`. Recursion does not change the order.

**Interview.**

1. Strategy 2? → insert into the sorted stack / prefix.
2. Invariant? → `seq[0:sliceEnd]` sorted; after the while, prefix one longer.
3. Inner while? → `pos = sliceEnd`; swap left while smaller than the neighbour.
4. `T(n)`? → insert into length `k` costs up to `k`; sum `n(n−1)/2`.
5. Best case? → sorted → Θ(n). Selection cannot do that.
6. Recursive one-liner? → sort prefix of n−1, insert last. `isort(k)` then `insert(k-1)`.
7. Recurrence? → `T(n)=(n-1)+T(n-1)`, `T(1)=1` → `n(n-1)/2`.
8. `l[len(l)]`? → IndexError; last index is `len(l)-1`.

**Pitfalls.** Forgetting `pos > 0`; using `<=` and breaking stability; calling this “find the min”; inserting `l[len(l)]`; `insert(isort(...), k)` because `isort` returns `None`.

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

**One line.** Split in half, sort each half, **merge** the two sorted runs. Merge always takes the smaller head. Combine is linear; the sort is the `n log n` family (analysis next).

**Merge.** If A is empty copy B; if B is empty copy A; else move the smaller head into C. `i+j` is how many have been written.

```python
def merge(A, B):
    (C, m, n) = ([], len(A), len(B))
    (i, j) = (0, 0)
    while i + j < m + n:
        if i == m:
            C.append(B[j]); j = j + 1
        elif j == n:
            C.append(A[i]); i = i + 1
        elif A[i] <= B[j]:
            C.append(A[i]); i = i + 1
        else:
            C.append(B[j]); j = j + 1
    return C

def MergeSort(A):
    n = len(A)
    if n <= 1:
        return A[:]
    mid = n // 2
    L = MergeSort(A[0:mid])
    R = MergeSort(A[mid:n])
    return merge(L, R)
```

Guard empties **before** `A[i]` / `B[j]`. Use `n <= 1` so `[]` does not recurse forever. `<=` keeps the merge stable.

**Interview.**

1. Different strategy? → halves, then merge — not insert-into-prefix.
2. Merge rule? → smaller head; copy the rest if one list is empty.
3. Four cases? → `i==m`, `j==n`, `A[i]<=B[j]`, else B.
4. Why linear? → one append per element, `m+n` times.
5. vs insertion? → `2T(n/2)+O(n)` not `(n-1)+T(n-1)`; extra lists, not in-place.

**Pitfalls.** Reading past an exhausted list; `n==1` only; merging unsorted halves; thinking it is in-place.

### Merge Sort Analysis — O(n log n) 

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
