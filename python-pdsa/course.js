window.PDSA_COURSE = {
  title: "PDSA & Python Knowledge Map",
  subtitle: "Programming, Data Structures and Algorithms — an evolving knowledge map for quick reference & interview prep",
  author: "Living Knowledge Graph (curated & evolving)",
  source: "Foundations & Beyond",
  sourceUrl: "https://nptel.ac.in/courses/106106145",
  opening: {
    title: "How to explore this knowledge map",
    blurb:
      "Click any domain node to explore its topics. Filled topics open full interview flashcards with derivations, code, and pitfalls. Dashed cross-links bridge connected concepts across domains.",
  },
  domains: [
    {
      id: "gcd",
      short: "Number Theory",
      title: "Algorithms & Greatest Common Divisor",
      color: "#8a5a3b",
      topics: [
        {
          id: "gcd-naive",
          title: "Simple GCD & Factor Listings",
          notes: null,
        },
        {
          id: "gcd-naive-improve",
          title: "Improving Naive GCD (Reverse Scan)",
          notes: null,
        },
        {
          id: "gcd-euclid",
          title: "Euclid's Remainder Algorithm",
          topic: "Euclid's 2nd version — remainder",
          notes: {
            idea: "If n does not divide m, gcd(m, n) is the same as gcd(n, m % n). That is Euclid's actual algorithm — the remainder version, not the difference version.",
            why: [
              "Write m = qn + r, with remainder r strictly smaller than n.",
              "If d divides both m and n, then d divides qn, so d also divides r = m − qn.",
              "Therefore every common divisor of m and n is a common divisor of n and r, and the greatest one is shared: gcd(m, n) = gcd(n, r).",
              "r is guaranteed < n, so you never need max/min after the first call. Arguments strictly shrink.",
            ],
            versus: [
              "Version 1 (difference): gcd(m, n) = gcd(n, m − n). Correct, but slow when n is small. gcd(101, 2) subtracts about 50 times.",
              "Version 2 (remainder): 101 % 2 = 1, so one step becomes gcd(2, 1) = 1. This is the algorithm Euclid actually proposed.",
            ],
            code: [
              {
                title: "Recursive remainder gcd",
                source:
                  "def gcd(m, n):\n    # Assume m >= n\n    if m < n:\n        (m, n) = (n, m)\n    if (m % n) == 0:\n        return n\n    else:\n        return gcd(n, m % n)",
              },
              {
                title: "Same idea as a while loop",
                source:
                  "def gcd(m, n):\n    if m < n:\n        (m, n) = (n, m)\n    while (m % n) != 0:\n        (m, n) = (n, m % n)\n    return n",
              },
            ],
            pythonBits: [
              "(m, n) = (n, m) is simultaneous assignment — both right-hand values are read first, so you can swap without a temp.",
              "m % n is the remainder. != is Python's ≠. # starts a comment to the end of the line.",
              "A recursive call is allowed: to compute gcd(m, n) you may return gcd(n, m % n). That is the same move as replacing the pair inside a while.",
            ],
            complexity: [
              "Naive factor scan: time proportional to min(m, n).",
              "Mathematical property of remainder Euclid: time proportional to the number of digits of max(m, n).",
              "Interview phrasing: O(log min(m, n)). A billion (about 10 digits) may take ~10 remainder steps instead of ~10⁹ factor checks.",
              "Worst case: consecutive Fibonacci numbers (Lamé's theorem). Still logarithmic in the value.",
            ],
            trace: [
              "gcd(101, 2) → 101 % 2 = 1 → gcd(2, 1) → 2 % 1 = 0 → 1",
              "gcd(14, 63) → swap to gcd(63, 14) → 63 % 14 = 7 → gcd(14, 7) → 14 % 7 = 0 → 7",
              "gcd(48, 18) → 48 % 18 = 12 → gcd(18, 12) → 18 % 12 = 6 → gcd(12, 6) → 0 remainder → 6",
            ],
            terminate:
              "Each remainder is a smaller non-negative integer. It cannot be stuck: if the remainder were 0 you would already have returned. In the worst case it reaches 1, and 1 divides every integer, so the loop or recursion always stops.",
            interview: [
              {
                q: "State Euclid's remainder identity in one line.",
                a: "If n divides m, gcd(m, n) = n. Otherwise gcd(m, n) = gcd(n, m mod n).",
              },
              {
                q: "Why is the remainder version faster than subtracting n from m?",
                a: "Subtraction peels n off one copy at a time. Remainder jumps over all q copies at once. gcd(101, 2) is ~50 subtractions vs one modulo.",
              },
              {
                q: "Prove that gcd(m, n) = gcd(n, m % n).",
                a: "m = qn + r. Any common divisor of m and n divides qn and m, hence divides r. Any common divisor of n and r divides qn + r = m. Same common divisors, so the greatest is the same.",
              },
              {
                q: "What is the time complexity?",
                a: "O(log min(m, n)), or proportional to the number of digits. Contrast with naive gcd, which is proportional to the numbers themselves.",
              },
              {
                q: "How do you write it without recursion?",
                a: "While m % n != 0, replace (m, n) with (n, m % n). Then return n. Recursion and the while loop are the same reduction.",
              },
              {
                q: "What if the caller passes m < n?",
                a: "Swap first: if m < n: (m, n) = (n, m). After that, remainders are already < n so you do not swap again.",
              },
            ],
            pitfalls: [
              "Do not confuse version 1 (m − n) with version 2 (m % n). Interviews want the remainder form.",
              "Python does not optimise tail recursion. Deep Euclid on huge values is safer as a loop.",
              "gcd(0, n): mathematically gcd(0, n) = n, but m % n with n = 0 raises ZeroDivisionError. Guard n == 0 if you need that case.",
              "Built-in math.gcd exists; interviews still want you to write Euclid.",
            ],
          },
        },
        {
          id: "env-setup",
          title: "Environment & Interpreter Setup",
          notes: null,
        },
      ],
    },
    {
      id: "types",
      short: "Foundations",
      title: "Core Types & Language Foundations",
      color: "#b0893e",
      topics: [
        {
          id: "numeric-types",
          title: "Numeric Values — int, float, bool",
          topic: "Numeric values — int, float, operations, bool",
          notes: {
            idea: "Python numbers come in two flavours: int (integers) and float (fractional / floating-point). They are different types because the bits are read differently — a whole binary integer vs a mantissa and exponent, like scientific notation.",
            why: [
              "Every value is a finite sequence of 0s and 1s (bits).",
              "For an int the whole sequence is read as a binary number: 178, -3, 4283829.",
              "For a float the sequence splits into mantissa and exponent, the same idea as 0.602 × 10^24 (floating point representation).",
              "Examples of float: 37.82, -0.01, 28.7998.",
            ],
            versus: [
              "int: exact whole values; bits are one integer.",
              "float: approximate reals; bits store scientific notation (mantissa | exponent). Finite bits mean many decimals cannot be stored exactly.",
            ],
            code: [
              {
                title: "Arithmetic, floor division, remainder, power",
                source:
                  "7 / 3.5      # 2.0   — / always produces a float\n7 / 2        # 3.5\n9 // 5       # 1     — quotient (floor division)\n9 % 5        # 4     — remainder\n3 ** 4       # 81    — exponentiation, 3 to the 4",
              },
              {
                title: "math library — built in, not loaded by default",
                source:
                  "from math import *\nlog(100)     # needs math\nsqrt(9)      # 3.0\nsin(0)       # 0.0",
              },
              {
                title: "Store a comparison as a bool (Euclid's test)",
                source:
                  "divisor = (m % n == 0)   # True iff n divides m\n# = assigns; == compares; the whole (m % n == 0) is a bool",
              },
            ],
            pythonBits: [
              "+, -, *, / are the usual four. In Python 3, / always produces a float, even 7/2 → 3.5.",
              "// is quotient, % is remainder. Euclid's gcd uses %; 9//5 is 1 and 9%5 is 4.",
              "** is exponentiation (3**4 is 81). Do not confuse * (multiply) with ** (power).",
              "log, sqrt, sin live in the math library: from math import *. They are built in but not available until you import.",
              "A boolean expression can be named: divisor = (m % n == 0). That name holds True or False.",
            ],
            trace: [
              "7 / 2 → 3.5 (float, not 3)",
              "9 // 5 → 1, 9 % 5 → 4, because 9 = 1×5 + 4",
              "3 ** 4 → 3×3×3×3 → 81",
              "m, n = 14, 7 → divisor = (14 % 7 == 0) → (0 == 0) → True",
              "m, n = 14, 5 → divisor = (14 % 5 == 0) → (4 == 0) → False",
            ],
            interview: [
              {
                q: "Why are int and float different types?",
                a: "Same bits, different reading. int: the bits are one binary integer. float: the bits split into mantissa and exponent (scientific notation / floating point). That is why 178 is int and 37.82 is float.",
              },
              {
                q: "What does / return in Python 3?",
                a: "Always a float. 7/2 is 3.5, 7/3.5 is 2.0. Use // if you want the integer quotient.",
              },
              {
                q: "What is the difference between / , // and % ?",
                a: "/ is true division (float). // is floor-division quotient. % is remainder. 9 = (9//5)*5 + (9%5) → 1*5 + 4.",
              },
              {
                q: "How do you write 3 to the power 4?",
                a: "3 ** 4, which is 81. Not 3*4.",
              },
              {
                q: "Why does sqrt(9) fail in a fresh interpreter?",
                a: "sqrt is in the math library. It is built into Python but not imported by default. from math import * (or import math; math.sqrt(9)).",
              },
              {
                q: "What type is divisor = (m % n == 0)?",
                a: "bool. = assigns the result of the comparison ==. True when n divides m — the same test Euclid uses as a base case.",
              },
              {
                q: "Why can 0.1 + 0.2 fail to equal 0.3?",
                a: "A float has finitely many bits for mantissa and exponent, so most decimals are stored approximately. Never use == on floats for money or gcd-style exact tests; use int or a tolerance.",
              },
            ],
            pitfalls: [
              "Python 3 / is not integer division. 7/2 is 3.5. Interviews still trip people who remember Python 2.",
              "** not * for powers. * is multiply.",
              "from math import * dumps names into the current namespace; import math is cleaner in real code. Either way, you must import.",
              "= assigns, == compares. divisor = (m%n == 0) needs both.",
              "Do not test floats with ==. Euclid's m % n == 0 is for ints.",
            ],
          },
        },
        {
          id: "strings",
          title: "Strings — Slices & Immutability",
          topic: "String slices and immutability",
          notes: {
            idea: "A slice is a segment of a string. Indexing is half-open — start included, end excluded — the same convention as range(1, m+1). Strings cannot be updated in place; they are immutable.",
            why: [
              "Positions are counted from 0. For s = \"hello\" the letters sit at 0 1 2 3 4.",
              "s[1:4] takes from index 1 up to but not including 4, so \"ell\". Same idea as range(1, 4): 1, 2, 3.",
              "You cannot write s[3] = \"p\". That would change the string in place, and strings do not allow it.",
              "To get a new value, slice and concatenate: s = s[0:3] + \"p!\" turns \"hello\" into \"help!\". The name s now points at a new string; the old one is unchanged.",
            ],
            versus: [
              "s[i] is one character. s[i:j] is a segment from i (included) to j (excluded).",
              "Lists (later) are mutable — you can assign to an index. Strings are not. That TypeError is the interview signal for immutability.",
            ],
            code: [
              {
                title: "Slice — start in, end out",
                source:
                  "s = \"hello\"     # indices  0 1 2 3 4\n                 # letters   h e l l o\ns[1:4]         # \"ell\"  — like range(1, 4)",
              },
              {
                title: "Cannot update in place — build a new string",
                source:
                  "s = \"hello\"\n# s[3] = \"p\"          # TypeError: 'str' object does not support item assignment\ns = s[0:3] + \"p!\"     # \"hel\" + \"p!\" → \"help!\"",
              },
            ],
            pythonBits: [
              "s[a:b] is half-open: includes a, excludes b. The handwritten reminder on the slide is range(1, m+1) — same off-by-one rule.",
              "s[0:3] is \"hel\" (indices 0, 1, 2). Concatenate with + to glue strings.",
              "Assigning s = s[0:3] + \"p!\" rebinds the name. It does not mutate the old \"hello\".",
              "Strings are immutable values. You will meet mutability again with lists.",
            ],
            trace: [
              "s = \"hello\" → index 0:h 1:e 2:l 3:l 4:o",
              "s[1:4] → indices 1,2,3 → \"ell\"",
              "s[0:3] → \"hel\", then \"hel\" + \"p!\" → \"help!\"",
              "s[3] = \"p\" → TypeError (immutable)",
            ],
            interview: [
              {
                q: "What is s[1:4] if s = \"hello\"?",
                a: "\"ell\". Start 1 is included, end 4 is excluded. Positions 1, 2, 3 — same as range(1, 4).",
              },
              {
                q: "Why is a slice written like range(1, m+1)?",
                a: "Both are half-open intervals. range(1, m+1) yields 1..m; s[1:4] yields indices 1..3. Forgetting that the end is excluded is the classic off-by-one.",
              },
              {
                q: "What happens if you do s[3] = \"p\" on a string?",
                a: "TypeError: strings do not support item assignment. They are immutable. You cannot update in place.",
              },
              {
                q: "How do you change \"hello\" into \"help!\"?",
                a: "Build a new string: s = s[0:3] + \"p!\". Slice the prefix you want to keep, concatenate the new tail, rebind s.",
              },
              {
                q: "Does s = s[0:3] + \"p!\" mutate the original string?",
                a: "No. Concatenation creates a new string and the assignment makes s refer to it. The old \"hello\" is unchanged (and may be discarded if nothing else names it).",
              },
            ],
            pitfalls: [
              "s[1:4] is not letters 1 through 4 inclusive. The 4 is a fence, not a letter. Result is three characters, not four.",
              "s[3] = \"p\" looks like list syntax and is a common TypeError in interviews.",
              "s[0:3] + \"p\" would be \"help\" without the !. Concatenate \"p!\" for the full string.",
              "Rebinding s is not in-place edit. Later, lists will let you assign to an index; strings still will not.",
            ],
          },
        },
        {
          id: "lists",
          title: "Lists — Indexing, Aliasing & Identity",
          topic: "Lists — indexing, aliasing, copy, is vs ==",
          notes: {
            idea: "A list index returns an element; a list slice returns a list. Assignment copies a name, not the list. Two names can point at the same mutable object — that is aliasing. Copy with a full slice l[:]. == is value; is is identity.",
            why: [
              "For strings, h[0] and h[0:1] are both the string \"h\". For lists they differ: factors[0] is 1, factors[0:1] is [1]. The slide marks that ≠.",
              "Lists nest. nested = [[2, [37]], 4, [\"hello\"]] has three top-level items. nested[0][1:2] is [[37]] — a slice, so still a list, not 37.",
              "list2 = list1 does not copy. list1[2] = 4 also changes list2[2]. Two names, one list.",
              "A slice always builds a new list. l[:] is the full slice, equal to l[0:len(l)]. list2 = list1[:] is a copy, so later edits to list1 miss list2.",
              "+ concatenates like strings and always produces a new list. After list1 = list1 + [9], list1 and list2 no longer share an object.",
            ],
            versus: [
              "str: index and one-length slice are both strings. list: index is an element; slice is a list. 1 ≠ [1].",
              "list2 = list1 aliases. list2 = list1[:] copies (shallow). list1 = list1 + [9] rebinds list1 to a new list and breaks the alias.",
              "== asks “same value?”. is asks “same object?”. Equal lists can fail is.",
            ],
            code: [
              {
                title: "Index vs slice — 1 is not [1]",
                source:
                  "h = \"hello\"\nh[0] == h[0:1] == \"h\"     # both strings\n\nfactors = [1, 2, 5, 10]\nfactors[0]                 # 1     — a value\nfactors[0:1]               # [1]   — a list\n# 1 != [1]",
              },
              {
                title: "Nested lists — slice still returns a list",
                source:
                  "nested = [[2, [37]], 4, [\"hello\"]]\nnested[0]          # [2, [37]]\nnested[1]          # 4\nnested[2][0][3]    # \"l\"     — \"hello\"[3]\nnested[0][1:2]     # [[37]]  — not 37",
              },
              {
                title: "Aliasing vs copy vs +",
                source:
                  "list1 = [1, 3, 5, 7]\nlist2 = list1              # same object\nlist1[2] = 4               # list2[2] is also 4\n\nlist2 = list1[:]           # full slice = copy\n\nlist1 = [1, 3, 5, 7]\nlist2 = list1\nlist1 = list1 + [9]        # new list; list2 unchanged",
              },
              {
                title: "== value vs is identity",
                source:
                  "list1 = [1, 3, 5, 7]\nlist2 = [1, 3, 5, 7]\nlist3 = list2\nlist1 == list2             # True   same value\nlist2 == list3             # True\nlist2 is list3             # True   same object\nlist1 is list2             # False  two lists that just look alike",
              },
            ],
            pythonBits: [
              "l[:k] is l[0:k]. l[k:] is l[k:len(l)]. l[:] is l[0:len(l)] — the full slice used to copy.",
              "list2 = list1[:] is a shallow copy: a new outer list, same inner objects if they are nested.",
              "+ always builds a new list. That is why list1 = list1 + [9] breaks the alias, unlike list1[2] = 4.",
              "Keep this next to string immutability: strings cannot be updated in place; lists can, so aliasing actually bites.",
            ],
            trace: [
              "factors = [1,2,5,10] → factors[0] is 1, factors[0:1] is [1]",
              "nested[2][0][3] → [\"hello\"] then \"hello\" then \"l\"",
              "nested[0][1:2] → [2,[37]] sliced at [1:2] → [[37]]",
              "list2 = list1; list1[2] = 4 → both names see [1,3,4,7]",
              "list1 == list2 True, list1 is list2 False when they are two equal lists",
              "list1 = list1 + [9] after aliasing → list1 is [1,3,5,7,9], list2 still [1,3,5,7]",
            ],
            interview: [
              {
                q: "What is the difference between factors[0] and factors[0:1]?",
                a: "Index returns the element 1. Slice returns a list [1]. For strings, h[0] and h[0:1] are both \"h\". That mismatch is a favourite trap.",
              },
              {
                q: "What is nested[0][1:2] if nested = [[2, [37]], 4, [\"hello\"]]?",
                a: "[[37]]. nested[0] is [2, [37]]; the slice [1:2] keeps a list, so you get a one-element list containing [37], not the integer 37.",
              },
              {
                q: "list2 = list1; list1[2] = 4. What is list2[2]?",
                a: "4. Assignment does not copy a mutable value. list1 and list2 are two names for the same list.",
              },
              {
                q: "How do you copy a list so later edits do not leak?",
                a: "Full slice: list2 = list1[:]. A slice always creates a new list. l[:] means l[0:len(l)].",
              },
              {
                q: "What is the difference between == and is?",
                a: "== tests same value. is tests same object. Two separately built [1,3,5,7] lists compare equal but is is False. Aliases compare True for both.",
              },
              {
                q: "list2 = list1; list1 = list1 + [9]. Do they still share an object?",
                a: "No. + always produces a new list, then the assignment rebinds list1. list2 still names the old list.",
              },
            ],
            pitfalls: [
              "Writing factors[0:1] when you wanted the number 1 — you got a list.",
              "nested[0][1:2] looks like it should be [37] or 37; it is [[37]] because a slice keeps the list wrapper.",
              "list2 = list1 is not a copy. Mutating through either name surprises you later — classic interview bug.",
              "l[:] is a shallow copy. Nested inner lists are still shared unless you copy deeper.",
              "Confusing == with is. Use is for None (x is None); use == for list contents.",
            ],
          },
        },
        {
          id: "list-methods",
          title: "List Methods — append, extend, remove, sort, index",
          topic: "List methods — grow, shrink, search, reorder",
          notes: {
            idea: "Lists grow, shrink, reorder, and search with methods. append adds one value; extend concatenates a sequence in place; remove deletes the first match; reverse and sort reorder the same object; index finds the leftmost position.",
            why: [
              "list1.append(v) extends list1 by a single value v. The list object stays the same; it just gets one more slot.",
              "list1.extend(list2) extends list1 by a list of values — the in-place equivalent of list1 = list1 + list2, without allocating a new list or rebinding the name.",
              "list1.remove(x) removes the first occurrence of x. It is an error if no copy of x exists in list1 (ValueError).",
              "l.reverse() reverses l in place. l.sort() sorts l in ascending order, also in place. Both return None — do not assign the result back.",
              "l.index(x) is the leftmost position of x in l. Guard with if x in l, or you get ValueError when x is missing.",
            ],
            versus: [
              "append(v) adds v as one element. append([1, 2]) makes a nested list. extend([1, 2]) adds 1 then 2.",
              "extend(list2) mutates list1. list1 = list1 + list2 builds a new list and rebinds the name — aliases keep the old object.",
              "remove(x) deletes by value (first hit). del l[i] / pop(i) delete by index.",
              "l.index(x) is leftmost. Strings have rindex for the rightmost character; lists do not. Walk from the end, or use a reverse scan.",
              "l.sort() mutates. sorted(l) returns a new list and leaves l alone.",
            ],
            code: [
              {
                title: "append one value, extend a sequence",
                source:
                  "list1 = [1, 3, 5]\nlist1.append(7)            # [1, 3, 5, 7]  — one value\nlist1.append([9, 11])      # [1, 3, 5, 7, [9, 11]]  — nested\nlist1 = [1, 3, 5]\nlist1.extend([7, 9])       # [1, 3, 5, 7, 9]  — flattened in\n# in-place equivalent of list1 = list1 + [7, 9]",
              },
              {
                title: "remove first occurrence — error if missing",
                source:
                  "list1 = [3, 1, 3, 2]\nlist1.remove(3)            # [1, 3, 2]  — first 3 only\n# list1.remove(99)         # ValueError: list.remove(x): x not in list\nif 99 in list1:\n    list1.remove(99)",
              },
              {
                title: "reverse and sort in place",
                source:
                  "l = [3, 1, 4, 1]\nl.reverse()                # [1, 4, 1, 3]\nl.sort()                   # [1, 1, 3, 4]\n# wrong: l = l.sort()      # l becomes None",
              },
              {
                title: "index — leftmost; guard the miss",
                source:
                  "l = [\"a\", \"b\", \"a\"]\nl.index(\"a\")               # 0  — leftmost\nif \"c\" in l:\n    l.index(\"c\")\nelse:\n    # missing — do not call index\n    pass\n\n# rightmost on a list (there is no list.rindex)\ndef rindex(l, x):\n    for i in range(len(l) - 1, -1, -1):\n        if l[i] == x:\n            return i\n    raise ValueError(f\"{x!r} is not in list\")",
              },
            ],
            pythonBits: [
              "append, extend, remove, reverse, sort all mutate and return None. Printing l.sort() prints None; the list is sorted anyway.",
              "index and remove raise ValueError if x is not in the list. The slide's dodge is if x in l first — that is a second linear scan.",
              "str has index and rindex. list has index only. The slide writes l.rindex(x) for the idea “rightmost position”; that method is not on list.",
              "list.index(x, start, end) can restrict the search window. Still leftmost inside that window.",
              "extend(iterable) walks any iterable, not just lists: extend(\"ab\") appends \"a\" then \"b\".",
            ],
            complexity: [
              "append is O(1) amortized. extend of k items is O(k).",
              "index, remove, and x in l are O(n) scans.",
              "reverse is O(n). sort is O(n log n) (Timsort).",
              "Repeated list1 = list1 + [v] inside a loop is O(n²) copying; append is the fix (same point as collecting primes).",
            ],
            trace: [
              "[1, 3, 5].append(7) → [1, 3, 5, 7]; same object",
              "[1, 3, 5].append([7, 9]) → [1, 3, 5, [7, 9]]",
              "[1, 3, 5].extend([7, 9]) → [1, 3, 5, 7, 9]",
              "[3, 1, 3].remove(3) → [1, 3]  — only the first 3",
              "[3, 1, 4].reverse() → [4, 1, 3]; then .sort() → [1, 3, 4]",
              "[\"a\", \"b\", \"a\"].index(\"a\") → 0, not 2",
            ],
            interview: [
              {
                q: "What is the difference between append and extend?",
                a: "append(v) adds one element v. extend(seq) adds each item of seq. append([1, 2]) nests; extend([1, 2]) flattens those two values in.",
              },
              {
                q: "How is extend related to + ?",
                a: "list1.extend(list2) is the in-place equivalent of list1 = list1 + list2. extend mutates the same object; + allocates a new list and rebinds the name.",
              },
              {
                q: "What does remove(x) do if x appears twice? If it is missing?",
                a: "Deletes the first occurrence only. If x is not in the list, ValueError. Guard with if x in l, or catch the error.",
              },
              {
                q: "Does l.sort() return the sorted list?",
                a: "No. It sorts in place and returns None. Same for reverse(). Use sorted(l) if you need a new list.",
              },
              {
                q: "How do you find the leftmost vs rightmost position of x?",
                a: "l.index(x) is leftmost. Lists have no rindex (strings do). Scan from the end, or compute len(l) - 1 - l[::-1].index(x) after checking membership.",
              },
              {
                q: "How do you avoid index / remove crashing?",
                a: "Check if x in l first. Both membership and index walk the list, so you pay two scans — still clearer than a bare call in interview code.",
              },
            ],
            pitfalls: [
              "append(list2) when you meant extend(list2) — you nested a list instead of concatenating.",
              "l = l.sort() or l = l.reverse() — l is now None.",
              "remove or index without a membership check — ValueError on a miss.",
              "Assuming list.rindex exists because the slide wrote l.rindex(x). That method is on str.",
              "Using + in a grow-the-list loop instead of append — quadratic copies, and aliases do not see the new list.",
            ],
          },
        },
        {
          id: "range-loops",
          title: "Repeating n Times — range()",
          topic: "Repeating n times — range()",
          notes: {
            idea: "To do something exactly n times, loop over a sequence of n values. Do not build [1,2,…,n] by hand — range(0, n) gives 0, 1, …, n−1 (n numbers, stop excluded).",
            why: [
              "The naive picture is for i in [1, 2, …, n]. Writing that list is the wrong tool; range generates the sequence without storing every integer up front.",
              "range(0, n) is half-open: start 0 included, stop n excluded, so you get n values: 0 through n−1. Same fence as a slice s[0:n].",
              "range(i, j) is i, i+1, …, j−1. If you want 1 through n inclusive, that is range(1, n+1) — same fence as string slicing.",
            ],
            versus: [
              "for i in [1, 2, …, n] names the idea. for i in range(0, n) is how you write it in Python (0-based, stop excluded).",
              "range(0, n) has n iterations. range(1, n) has n−1 iterations — a classic off-by-one.",
            ],
            code: [
              {
                title: "n repetitions — 0 through n-1",
                source:
                  "for i in range(0, n):\n    ...          # runs n times; i = 0, 1, ..., n-1\n\n# range(i, j) → i, i+1, ..., j-1\nfor i in range(1, n + 1):\n    ...          # i = 1, 2, ..., n  (if you really want 1..n)",
              },
            ],
            pythonBits: [
              "range(0, n) can be written range(n). The start defaults to 0.",
              "The stop is never yielded. range(0, 5) is 0,1,2,3,4 — five numbers, not including 5.",
              "range is lazy: it is not a list. list(range(0, 5)) if you need a list.",
              "Detailed stepping is also supported: range(start, stop, step).",
            ],
            trace: [
              "n = 4 → range(0, 4) → 0, 1, 2, 3  (four passes)",
              "range(1, 4) → 1, 2, 3  — not 1..4",
              "range(2, 2) → empty; the loop body never runs",
            ],
            interview: [
              {
                q: "How do you repeat a block exactly n times?",
                a: "for i in range(0, n): or for i in range(n):. That yields n values, 0 through n−1.",
              },
              {
                q: "What sequence does range(i, j) generate?",
                a: "i, i+1, …, j−1. Start in, stop out — same half-open rule as slices and as range(1, m+1).",
              },
              {
                q: "Does range(0, n) include n?",
                a: "No. Last value is n−1. Including n would be n+1 iterations.",
              },
              {
                q: "How do you loop i from 1 to n inclusive?",
                a: "range(1, n+1). range(1, n) stops at n−1.",
              },
            ],
            pitfalls: [
              "Building [1,2,…,n] as a real list just to count — use range.",
              "range(1, n) when you wanted n trips starting at 1 — you got n−1 trips.",
              "Using i as a 1-based counter when range started at 0 (off-by-one in gcd-style 1..m loops).",
            ],
          },
        },
        {
          id: "functions-scope",
          title: "Functions — Scope & Call Order",
          topic: "Scope, define-before-call, first recursion",
          notes: {
            idea: "Names inside a function are local — they do not change a same-spelled name outside. A function must exist before you call it, but its body may mention a function that is defined later, as long as that later def has run before the call. A function may call itself: recursion needs a base case.",
            why: [
              "In stupid(x), n = 17 is a local name. The outer n = 7 is a different name. After v = stupid(28), n is still 7. The function returns x (28), not n.",
              "Python looks up names when the line runs, not when def is read. def f that returns g(x+1) is fine if g is defined before anyone actually calls f. If you call f(77) before def g, g is missing — NameError.",
              "factorial(n) is n × (n−1) × … × 1, and 0! = 1. That product from (n−1) down is (n−1)!. So n! = n × (n−1)!, with base 0! = 1 (the code uses n <= 0).",
            ],
            versus: [
              "OK: def f, def g, then z = f(77). Both defs finish before the call.",
              "Not OK: def f, z = f(77), then def g. The call happens while g does not exist yet.",
              "Local n vs global n: same spelling, two boxes. Assignment inside the function does not write the outer n.",
            ],
            code: [
              {
                title: "Local scope — inner n is not outer n",
                source:
                  "def stupid(x):\n    n = 17          # local; not the n below\n    return x\n\nn = 7\nv = stupid(28)\n# n is still 7; v is 28",
              },
              {
                title: "Define both functions before the call",
                source:
                  "# OK — g exists by the time f(77) runs\ndef f(x):\n    return g(x + 1)\ndef g(y):\n    return y + 3\nz = f(77)          # g(78) → 81\n\n# NOT OK — f(77) runs before g is defined\n# def f(x):\n#     return g(x + 1)\n# z = f(77)        # NameError: g is not defined\n# def g(y):\n#     return y + 3",
              },
              {
                title: "Recursion — factorial, base case first",
                source:
                  "def factorial(n):\n    if n <= 0:                 # base case; 0! = 1\n        return 1\n    else:\n        val = n * factorial(n - 1)\n        return val\n\n# factorial(3) → 3*factorial(2) → 2*factorial(1) → 1*factorial(0) → 1\n# unwind: 1, then 2, then 6",
              },
            ],
            pythonBits: [
              "Assignment inside a function makes that name local for the whole function (unless you later use global). The outer n is untouched.",
              "def only binds the function name. The body waits until a call. That is why f may mention g in its body before g is defined, if the call comes after both defs.",
              "Base case must run. factorial uses n <= 0 so 0 (and negatives) stop. Recursion on sequences and insertion sort are detailed under the recursion domain.",
            ],
            trace: [
              "n = 7; stupid(28) sets a local n = 17, returns 28; outer n is still 7",
              "f(77) with g defined → g(78) → 81",
              "factorial(3) → 3 * factorial(2) → 2 * factorial(1) → 1 * factorial(0) → 1, then 1, 2, 6",
            ],
            interview: [
              {
                q: "After n = 7 and stupid sets n = 17 inside, what is n?",
                a: "Still 7. The n inside the function is a local name, a separate box from n outside.",
              },
              {
                q: "Can f call g if g is defined below f in the file?",
                a: "Yes, if both defs have run before you call f. Lookup happens at call time. Calling f before def g raises NameError.",
              },
              {
                q: "What two parts does factorial need?",
                a: "Base case: n <= 0 returns 1 (0! = 1). Recursive step: n * factorial(n-1), which is n × (n−1)!.",
              },
              {
                q: "What is factorial(3)?",
                a: "6. Unwind 3×(2×(1×1)).",
              },
            ],
            pitfalls: [
              "Expecting an assignment inside a function to change a global with the same name. It does not (without global).",
              "Calling a function in the middle of a pair of mutually used defs. Order of def is free; order of the first call is not.",
              "Missing the base case — factorial without n <= 0 never stops.",
              "Confusing return(x) in stupid with 'it must have used n'. The local n was unused except as a demo of scope.",
            ],
          },
        },
        {
          id: "primes-while",
          title: "First n Primes — While Loops & Invariant Progression",
          topic: "First n primes — while loop, tuple assignment, unconditionally scanning",
          notes: {
            idea: "Finding the first n primes requires a while loop because we don't know ahead of time how many numbers we must scan. Simultaneous tuple assignment initializes and updates counters, while i increments unconditionally on every loop pass.",
            why: [
              "Unlike range(n) which runs a known number of times, we cannot predict the nth prime's value before searching ('How many to scan?'). A while loop driven by (count < n) terminates exactly when n primes are collected.",
              "Simultaneous tuple assignment (count, i, plist) = (0, 1, []) sets up the initial state cleanly in one atomic line without separate assignments.",
              "Inside the loop: if isprime(i): (count, plist) = (count + 1, plist + [i]). Both the found prime count and the accumulator list update together.",
              "Crucial control flow: i = i + 1 happens UNCONDITIONALLY at the end of the while loop body, outside the if block, ensuring progress across every integer.",
            ],
            versus: [
              "for with range(n): used when iteration count is fixed and known beforehand.",
              "while(count < n): required when loop termination depends on accumulating a dynamic target condition whose stopping index is unknown.",
              "plist + [i] vs plist.append(i): concatenation creates a new list each time; in contrast, .append(i) mutates in place without copying the whole list every step.",
            ],
            code: [
              {
                title: "First n primes",
                source:
                  "def nprimes(n):\n    (count, i, plist) = (0, 1, [])\n    while (count < n):\n        if isprime(i):\n            (count, plist) = (count + 1, plist + [i])\n        i = i + 1\n    return plist",
              },
              {
                title: "Helper: naive isprime test",
                source:
                  "def isprime(n):\n    if n <= 1:\n        return False\n    for i in range(2, n):\n        if n % i == 0:\n            return False\n    return True\n\n# nprimes(5) → [2, 3, 5, 7, 11]",
              },
            ],
            pythonBits: [
              "(count, i, plist) = (0, 1, []) uses tuple unpacking to assign all 3 initial names simultaneously.",
              "(count, plist) = (count + 1, plist + [i]) simultaneously updates count and appends i using list concatenation.",
              "Notice i starts at 1, so the candidate sequence tested is 1, 2, 3, 4, ...",
              "i = i + 1 is unindented from the if — it must run unconditionally on every loop iteration to guarantee progress and prevent infinite looping.",
            ],
            trace: [
              "n = 3, (count, i, plist) = (0, 1, [])",
              "i=1: isprime(1) False → i becomes 2",
              "i=2: isprime(2) True  → count=1, plist=[2], i becomes 3",
              "i=3: isprime(3) True  → count=2, plist=[2, 3], i becomes 4",
              "i=4: isprime(4) False → i becomes 5",
              "i=5: isprime(5) True  → count=3, plist=[2, 3, 5], count < 3 is False → loop exits, returns [2, 3, 5]",
            ],
            interview: [
              {
                q: "Why does nprimes use a while loop instead of a for loop?",
                a: "Because we do not know in advance how large the nth prime will be (how many numbers we need to scan). A while(count < n) loop runs dynamically until n primes are found.",
              },
              {
                q: "Why must i = i + 1 be unconditional?",
                a: "If i = i + 1 were inside the if block, whenever a composite number like 4 was encountered, i would never advance, locking the function in an infinite loop.",
              },
              {
                q: "What is the complexity consequence of plist + [i] inside the loop?",
                a: "plist + [i] creates a new list of length k at each step (costing O(k) copies). For n primes, repeated concatenation takes O(n²) list copying overhead, whereas plist.append(i) takes O(1) amortized.",
              },
              {
                q: "How does tuple assignment (count, plist) = (count + 1, plist + [i]) work?",
                a: "Python evaluates all expressions on the right-hand side first into an anonymous tuple (count + 1, plist + [i]), then unpacks and rebinds them to the names on the left.",
              },
            ],
            pitfalls: [
              "Accidentally indenting i = i + 1 under if isprime(i): — freezes loop on the first non-prime (i = 1 or 4).",
              "Initializing i = 0 or i = 2 — start at candidate 1 (isprime handles 1 correctly as False).",
              "Thinking count < n includes n — count runs 0, 1, ..., n-1, collecting exactly n primes.",
            ],
          },
        },
      ],
    },
    {
      id: "recursion",
      short: "Recursion",
      title: "Inductive Definitions & Recursion",
      color: "#3d6b63",
      topics: [
        { id: "range-advanced", title: "Range Slices & Stepping", notes: null },
        {
          id: "list-mutation",
          title: "Manipulating Lists in Memory",
          topic: "In-place list mutation vs new lists",
          notes: {
            idea: "append, extend, remove, reverse, and sort edit the existing list object. Every alias sees the change. Concatenation with + allocates a new list and rebinds one name — other names keep the old object.",
            why: [
              "A list is a mutable object in memory. Methods that work in place overwrite that object; they do not return a replacement.",
              "That is why list2 = list1 followed by list1.append(9) or list1.reverse() also changes list2: two names, one object.",
              "list1 = list1 + list2 looks similar to extend but is not: + builds a new list, then assignment points list1 at it. list2 is untouched.",
              "If you need a mutated copy and a pristine original, copy first (list2 = list1[:]) then mutate one of them.",
            ],
            versus: [
              "In place: append, extend, remove, reverse, sort. Same id(), aliases updated.",
              "New list: +, slicing, sorted(l), list(reversed(l)). New id(), aliases unchanged.",
              "l.sort() vs sorted(l): mutate vs copy. l.reverse() vs l[::-1]: mutate vs copy.",
            ],
            code: [
              {
                title: "In-place methods leak through aliases",
                source:
                  "list1 = [1, 3, 5]\nlist2 = list1              # alias\nlist1.append(7)\nlist1.extend([9])\nlist1.reverse()\n# list2 is [9, 7, 5, 3, 1] — same object",
              },
              {
                title: "+ rebinds; extend does not",
                source:
                  "list1 = [1, 3, 5]\nlist2 = list1\nlist1 = list1 + [7]        # new list; list2 still [1, 3, 5]\n\nlist1 = [1, 3, 5]\nlist2 = list1\nlist1.extend([7])          # same list; list2 is [1, 3, 5, 7]",
              },
              {
                title: "Copy, then mutate one side",
                source:
                  "list1 = [3, 1, 2]\nlist2 = list1[:]\nlist1.sort()\n# list1 is [1, 2, 3]; list2 is still [3, 1, 2]",
              },
            ],
            pythonBits: [
              "id(list1) is unchanged after append/extend/remove/reverse/sort. It changes after list1 = list1 + extra.",
              "None is the return value of in-place methods. The list in memory is the result.",
              "Shallow copy ([:]) duplicates the outer list only. Nested lists inside are still shared.",
            ],
            trace: [
              "list2 = list1; list1.append(9) → both […, 9]",
              "list2 = list1; list1 = list1 + [9] → list1 has 9, list2 does not",
              "list2 = list1[:]; list1.sort() → only list1 is sorted",
              "l = l.reverse() → l is None, original order still reversed in the orphaned object if anything else names it",
            ],
            interview: [
              {
                q: "list2 = list1; list1.extend([9]). What is list2?",
                a: "The extended list. extend mutates the shared object. Contrast with list1 = list1 + [9], which leaves list2 unchanged.",
              },
              {
                q: "Why does the primes example prefer append over + ?",
                a: "plist + [i] copies the whole accumulator each time (O(n²) over n primes) and rebinds the name. append grows the same object in amortized O(1).",
              },
              {
                q: "How do you sort without destroying the original?",
                a: "sorted(l), or copy then sort: copy = l[:]; copy.sort(). Do not write l = l.sort().",
              },
            ],
            pitfalls: [
              "Mutating through an alias and wondering why “the other list” changed — there is only one list.",
              "Believing extend and + are interchangeable when other names still point at the original.",
              "Sorting or reversing a list you still needed in input order.",
            ],
          },
        },
        {
          id: "loop-control",
          title: "Loop Breaking & Early Exit",
          topic: "for-else: break vs normal termination",
          notes: {
            idea: "A for loop can have an else. That else runs only on normal termination — the loop finished without hitting break. Use it to mean “never found”, not as an if-else.",
            why: [
              "Searching a list: on a match, record the index and break. If the loop runs to the end, the value is absent.",
              "Python attaches else to the loop, not to the if inside. No break ⇒ else runs. break ⇒ else is skipped.",
              "Do not initialise pos = -1 before the loop. The else clause is that assignment. The slide crosses out the pre-loop pos = -1.",
            ],
            versus: [
              "for-else else: “loop was not broken”. if-else else: “condition was false”. Easy to misread.",
              "findpos with for-else vs l.index(v): index raises ValueError on a miss; findpos returns -1.",
              "Immediate return on match is equivalent and often clearer; for-else is the language feature the slide is teaching.",
            ],
            code: [
              {
                title: "findpos — else means no break",
                source:
                  "def findpos(l, v):\n    for i in range(len(l)):\n        if l[i] == v:      # exit, report position\n            pos = i\n            break\n    else:\n        pos = -1           # no break, v not in l\n    return pos",
              },
              {
                title: "Same idea with early return (else optional)",
                source:
                  "def findpos(l, v):\n    for i in range(len(l)):\n        if l[i] == v:\n            return i\n    return -1",
              },
              {
                title: "Wrong: pre-seed pos = -1 (slide crosses this out)",
                source:
                  "# pos = -1   ← redundant if the for-else is present\n# the else *is* the not-found path",
              },
            ],
            pythonBits: [
              "else on for/while runs when the loop condition fails naturally — including when the sequence was empty (zero iterations, no break).",
              "return(pos) with parentheses is legal; return pos is the usual spelling.",
              "while loops have the same else. break skips it; a failing condition runs it.",
              "l.index(v) is the library form of “leftmost position”. findpos is how you write the scan, and how you return -1 instead of raising.",
            ],
            complexity: [
              "findpos is O(n): one pass, stop at the first match (best O(1), worst O(n)).",
              "if v in l before l.index(v) is two scans in the hit-at-the-end / miss cases. A single loop (or try/except around index) does the work once.",
            ],
            trace: [
              "findpos([4, 7, 2], 7) → i=0 miss, i=1 hit, pos=1, break, else skipped, return 1",
              "findpos([4, 7, 2], 9) → i=0,1,2 all miss, no break, else sets pos=-1, return -1",
              "findpos([], 1) → range(0) is empty, else runs immediately, return -1",
              "findpos([5, 5], 5) → leftmost 0, not 1",
            ],
            interview: [
              {
                q: "When does a for-loop else run?",
                a: "When the loop terminates normally — it did not break. Empty sequences run the else immediately.",
              },
              {
                q: "Write findpos(l, v) with for-else.",
                a: "Loop i over range(len(l)); on l[i] == v set pos = i and break. else: pos = -1. Return pos. Do not seed pos = -1 before the loop.",
              },
              {
                q: "Why not pos = -1 before the for?",
                a: "The else already means “no break, v not in l”. Pre-initialising duplicates that path and hides what for-else is for. The slide marks it as wrong.",
              },
              {
                q: "How does this differ from l.index(v)?",
                a: "index raises ValueError if v is missing. findpos returns -1. Same leftmost-match scan.",
              },
              {
                q: "Is the else attached to the if?",
                a: "No. Indentation hangs it on for. if l[i] == v has no else in this pattern.",
              },
            ],
            pitfalls: [
              "Reading for-else as if-else: thinking else means “the if was false on this iteration”. It means the loop never broke.",
              "Initialising pos = -1 and also using else — the slide’s crossed-out version.",
              "Forgetting break after a hit — the loop keeps going and else never runs, but pos becomes the last match instead of the first.",
              "Calling l.index without a guard when the interview asked for a -1 miss sentinel.",
            ],
          },
        },
        {
          id: "binary-search",
          title: "Arrays vs Lists & Binary Search",
          topic: "Arrays vs linked lists; binary search is O(log n) only with O(1) index",
          notes: {
            idea: "An array is one contiguous block of uniform cells — seq[i] is an arithmetic offset, O(1). A linked list scatters nodes; seq[i] follows i pointers, O(i). Binary search halves a sorted array. It needs cheap indexing, so it does not transfer to linked lists. Python’s list is an array we pretend is one.",
            why: [
              "Array: one memory block, typically fixed length in the abstract model. Address of seq[i] = start + i × cell size. Any i is constant time.",
              "Inserting between seq[i] and seq[i+1] shifts the tail. Contracting (delete) also shifts. Both are linear in the number of cells moved.",
              "Linked list: each node holds a value and a pointer to the next. Size is flexible. Insert or delete is plumbing — retarget two pointers — if you are already at seq[i]. Getting there costs i links.",
              "Swap seq[i] and seq[j]: O(1) in an array, O(i+j) (linear) in a list because you must walk to both nodes.",
              "Search question: is v in seq? The structure matters (array vs list) and so does organisation (sorted vs unsorted). Unsorted array still needs a linear scan. Sorted array can binary-search.",
              "Binary search: compare v to the midpoint. Equal → found. Smaller → left half. Larger → right half. Empty slice → absent.",
            ],
            versus: [
              "Array: O(1) index, O(n) insert/delete in the middle. Linked list: O(i) index, O(1) insert/delete at a known node.",
              "findpos / l.index: linear scan, works on unsorted data. bsearch: logarithmic comparisons, requires sorted array and O(1) seq[mid].",
              "T(n) = 1 + T(n/2) counts one comparison plus a half-size call. That 1 is honest only if seq[mid] is O(1). On a linked list the same code (or walking to mid) is not O(log n).",
              "Python list vs course “list”: Python list is a dynamic array (contiguous, O(1) index, cheap append). The course “list” is a linked list. Later we implement that type for real; until then we treat Python lists as arrays.",
            ],
            code: [
              {
                title: "bsearch — sorted seq[l:r], half-open",
                source:
                  "def bsearch(seq, v, l, r):\n    # v in sorted seq[l:r]\n    if r - l == 0:\n        return False\n    mid = (l + r) // 2\n    if v == seq[mid]:\n        return True\n    if v < seq[mid]:\n        return bsearch(seq, v, l, mid)\n    else:\n        return bsearch(seq, v, mid + 1, r)\n\ndef contains(seq, v):\n    return bsearch(seq, v, 0, len(seq))",
              },
            ],
            pythonBits: [
              "The interval is half-open, same fence as a slice: seq[l:r]. Empty means r - l == 0, not r < l as a special extra case if you keep r >= l.",
              "Left recurse uses mid, not mid-1: mid is already not v, and [l:mid] excludes mid. Right recurse is mid+1, not mid.",
              "(l + r) // 2 is floor division. 11 // 2 is 5. Do not use / — that would make mid a float.",
              "Python lists document themselves as lists (grow and shrink cheaply at the end) but seq[i] is array indexing. This course pretends they are arrays until the linked-list implementation.",
              "bisect in the standard library is the production binary search. Interviews still want you to write bsearch.",
            ],
            complexity: [
              "Array seq[i]: O(1). Linked-list seq[i]: O(i).",
              "Array insert/delete in the middle, or shrink the block: O(n) moves. Linked-list insert/delete at a known node: O(1) pointer updates.",
              "Swap seq[i], seq[j]: O(1) array, linear in a list.",
              "Binary search on an array: T(0) = 1, T(n) = 1 + T(n/2). Unwinds to 1+1+…+1 (log₂ n times) + T(1) = O(log n).",
              "Seeing only a logarithmic fraction of the array is enough to prove an element is absent — that conclusion is illegal if you cannot jump to mid.",
              "Same recurrence written for a linked list is a lie: each seq[mid] (or walk to mid) is Θ(n) from the head, and T(n) = Θ(n) + T(n/2) = Θ(n).",
            ],
            trace: [
              "Array: seq[i] → offset i cells from the start of the block, any i",
              "Insert at i in an array of 100: shift cells i..99 up by one",
              "Linked list 0→2→1: seq[2] follows two pointers; insert after the node holding 2 is two pointer writes",
              "bsearch([4,5,6,7], 6, 0, 4) → mid = 2, seq[2] == 6 → True",
              "bsearch([4,5,6,7], 8, 0, 4) → mid=2 (6), 8>6 → [3,4] → mid=3 (7), 8>7 → [4,4] empty → False",
              "T(8) = 1+T(4) = 2+T(2) = 3+T(1) = 4+T(0) → about log₂ 8 + 1 comparisons",
              "2¹⁰ = 1024: twenty comparisons already cover a million-scale sorted array (2²⁰)",
            ],
            terminate:
              "Each call shrinks [l, r) to a strictly smaller half (mid − l or r − (mid+1) is < r − l when r − l ≥ 1). Empty slice is the base case. If you recurse on [l, r] unchanged, or use / instead of //, you never hit r - l == 0.",
            interview: [
              {
                q: "Why is seq[i] O(1) in an array and not in a linked list?",
                a: "Array: one block, index is start + i × cell size. Linked list: values are scattered; you walk i next-pointers. Cost proportional to i.",
              },
              {
                q: "Why is insert in the middle expensive in an array and cheap in a list?",
                a: "Array: open a gap by shifting every later cell. List: if you already sit on seq[i], retarget pointers (“plumbing”). Finding that node is the expensive part.",
              },
              {
                q: "Swap seq[i] and seq[j] — costs?",
                a: "Constant in an array (two cells). Linear in a linked list (walk to i and to j, then swap values or relink).",
              },
              {
                q: "Does binary search work on a linked list?",
                a: "The algorithm needs seq[mid] in constant time. Linked lists do not give that, so the O(log n) bound dies. Algorithms on one structure may not transfer. Example the slides flag: binary search.",
              },
              {
                q: "Write recursive binary search on seq[l:r].",
                a: "Empty if r-l==0. mid=(l+r)//2. Equal → True. v < seq[mid] → [l,mid). Else [mid+1,r). seq must already be sorted.",
              },
              {
                q: "Why // and why mid vs mid+1?",
                a: "// keeps mid an int. Left interval excludes mid (already tested). Right starts at mid+1 so you do not retest mid and you make progress when the interval has length 1.",
              },
              {
                q: "Derive T(n) = 1 + T(n/2) = O(log n).",
                a: "T(0)=1. Unwind: T(n)=1+T(n/2)=k+T(n/2^k). Stop when n/2^k is constant, so k=Θ(log n). About log₂ n comparisons. 2¹⁰=1024.",
              },
              {
                q: "Is a Python list a list or an array?",
                a: "Docs call it a list and it grows/shrinks efficiently at the end (dynamic array). Indexing is array-like, O(1). This course pretends Python lists are arrays; a real linked list is a later, explicit type.",
              },
            ],
            pitfalls: [
              "Calling Python list a linked list. seq[i] being fast is the giveaway that it is an array.",
              "Binary search on unsorted data — the left/right decision is a lie.",
              "Using / instead of // for mid, or searching [l, mid] inclusive on both sides and looping forever on a miss.",
              "Writing T(n)=1+T(n/2) for a linked list as if indexing were free.",
              "Thinking “I only look at log n nodes, so any structure is O(log n)” — looking at seq[mid] may itself be linear.",
            ],
          },
        },
        {
          id: "efficiency-intro",
          title: "Algorithmic Efficiency & Orders of Growth",
          topic: "Worst-case T(n), Big-O classes, and why we sort",
          notes: {
            idea: "Efficiency is T(n): time as a function of input size n, usually in the worst case. Big-O names the growth class — log n, n, n log n, n², 2ⁿ — not the exact constant. Python does about 10⁷ elementary steps per second; that budget is why n² dies at a million and 2ⁿ dies immediately.",
            why: [
              "T(n) asks how the running time scales when the input grows, not how many seconds one laptop took yesterday.",
              "We report worst-case behaviour. For search, that is “v is not in seq”: every cell (linear) or every halving (binary) until the empty interval.",
              "Worst case is easier to calculate than average case, which needs a distribution over inputs.",
              "O() ignores constants and lower-order terms. The question is: is T(n) proportional to log n, n, n log n, n², n³, 2ⁿ, …?",
              "Linear scan is O(n) for both arrays and linked lists (you look at each value once). Binary search is O(log n) only for sorted arrays.",
              "Sorting is not only for pretty output. After an O(n log n) sort you get O(log n) search, the median as the midpoint, adjacent-duplicate checks, and a frequency table in one ordered pass.",
            ],
            versus: [
              "Worst case vs average case: missing element vs “typical” hit. Interviews want worst case unless they say otherwise.",
              "O(n) linear scan vs O(log n) binary search: unsorted vs already sorted array. Paying to sort first is worth it if you search many times.",
              "Polynomial (n, n log n, n²) vs exponential/factorial (2ⁿ, n!): the table’s red wall. n=100 is fine for linear; 2¹⁰⁰ is not a number you run.",
              "This course writes T(n)=O(f(n)) to mean “grows like f”. Strictly, O is an upper bound; Θ is “same order”. Interviewers often say O for both.",
            ],
            code: [
              {
                title: "Growth classes we actually name",
                source:
                  "# classes:  log n | n | n log n | n^2 | 2^n | n!\n# miss:     linear O(n)\n#           binary O(log n)  — sorted array\n# Python ≈ 1e7 steps / second\n# 2^10 = 1024    2^20 ≈ 1e6    2^30 ≈ 1e9",
              },
              {
                title: "What one second of Python can finish",
                source:
                  "# n = 1e6   n          ~ 0.1 s\n#           n log2 n   ~ 2 s\n#           n^2 = 1e12   no\n# n = 10    2^n = 1024,  10! ≈ 3.6e6\n# n = 100   2^n ≈ 1e30   fantasy",
              },
            ],
            pythonBits: [
              "The 10⁷ steps/s figure is a teaching budget, not a benchmark. C is faster; I/O is slower; the shape of T(n) is what matters.",
              "log n in the table is log₂ n: 2¹⁰=1024 so log₂(10⁶)≈20. An extra 10 in the exponent of n adds about 3.3 to log₂ n.",
              "n log n at n=10⁶ is about 20×10⁶ = 2×10⁷ — the circled 10⁷ on the slide is the same order as one Python second.",
              "Empty cells past the staircase mean “do not bother”: n² at 10⁵ is already 10¹⁰ steps; 2ⁿ at 100 is 10³⁰.",
            ],
            complexity: [
              "Linear scan (findpos, v in seq, unsorted): O(n) worst case — v absent.",
              "Binary search on a sorted array: O(log n) worst case — v absent, interval shrinks to empty.",
              "Comparison sort (later): O(n log n) typical optimal worst case; then median, unique, frequencies are O(n) on the sorted data.",
              "Feasible in ~1s of Python (order-of-magnitude): log n and n up to 10⁷–10⁸; n log n up to ~10⁶; n² up to ~10³–10⁴; n³ smaller; 2ⁿ only tiny n; n! even tinier.",
            ],
            trace: [
              "Search miss in 10⁶ cells, linear: ~10⁶ steps, under a second",
              "Same miss, sorted + binary: ~20 comparisons (log₂ 10⁶≈20)",
              "Sort 10⁶ items at n log n ≈ 2×10⁷ steps — about one Python second, then every later search is cheap",
              "n=10: 2¹⁰=1024, 10!≈3.6×10⁶ — factorial already near the 1s budget",
              "n=100: 2¹⁰⁰≈10³⁰, 100! is 10¹⁵⁷-scale — not runnable",
            ],
            interview: [
              {
                q: "What is T(n)? Which case do we quote?",
                a: "Running time as a function of input size n. Usually worst case. For search, that is “v not present”. Worst case is easier than a genuine average.",
              },
              {
                q: "What does T(n)=O(n) mean here?",
                a: "Time grows proportionally to n — the linear class. Same language for O(log n), O(n log n), O(n²), O(2ⁿ). Constants are stripped so we can compare shapes.",
              },
              {
                q: "Linear scan vs binary search?",
                a: "Unsorted array (or any list you must walk): O(n). Sorted array with O(1) index: O(log n). Linear scan is O(n) for arrays and linked lists alike.",
              },
              {
                q: "Python budget?",
                a: "About 10⁷ elementary steps per second. n=10⁶ linear is fine; n=10⁶ quadratic is 10¹² steps. 2ⁿ and n! leave the table almost immediately.",
              },
              {
                q: "Why sort if you only wanted to search?",
                a: "One O(n log n) sort, then each search is O(log n). Also: median is the middle of the sorted sequence; duplicates sit next to each other; a frequency table is a single grouped pass.",
              },
              {
                q: "Name the powers of two on the slide.",
                a: "2¹⁰=1024, 2²⁰≈10⁶, 2³⁰≈10⁹. So log₂ of a million is 20.",
              },
            ],
            pitfalls: [
              "Quoting best-case search (“found at index 0”) as the complexity.",
              "Writing O(log n) for binary search on a linked list or on unsorted data.",
              "Treating O(n) and O(n²) as “both polynomial so both fine” at n=10⁶.",
              "Memorising 10⁷ as a law of physics rather than a Python-order budget.",
              "Forgetting that sorting pays rent: median, duplicates, histograms, not only binary search.",
            ],
          },
        },
        {
          id: "selection-sort",
          title: "Selection Sort",
          topic: "Strategy 1 — select the next minimum, lock it in place",
          notes: {
            idea: "Strategy 1: from the remaining unsorted suffix, select the smallest value and swap it into the next prefix slot. Each pass grows a sorted prefix by one. Always looks at the whole suffix, so T(n) is  n+(n−1)+…+1 = O(n²) even on sorted input.",
            why: [
              "Exam papers: pick the lowest remaining marks, start (or extend) the new stack. Repeat on what is left. The stack is always the smallest papers so far, in order.",
              "In an array that is: for start in 0..n−1, find the min of seq[start:], swap it with seq[start]. seq[0:start] is then finished forever.",
              "Finding the min in a suffix of length k costs up to k comparisons. Suffix lengths are n, n−1, …, 1.",
            ],
            versus: [
              "Selection locks the next output cell. Insertion leaves the prefix sorted but keeps bubbling the new value left — it does not scan for a global min.",
              "Selection’s comparison count barely depends on the data (always Θ(n²)). Insertion is adaptive: already sorted is about n comparisons.",
              "Both are O(n²) in the worst case. Neither is the n log n sort the efficiency table was aiming at.",
            ],
            code: [
              {
                title: "Select min of the suffix, swap into start",
                source:
                  "def SelectionSort(seq):\n    for start in range(len(seq)):\n        minpos = start\n        for i in range(start, len(seq)):\n            if seq[i] < seq[minpos]:\n                minpos = i\n        (seq[start], seq[minpos]) = (seq[minpos], seq[start])",
              },
            ],
            pythonBits: [
              "In-place: only swaps, no extra list. Aliases see the growing sorted prefix.",
              "The inner loop may use range(start+1, len(seq)); then initialise minpos = start. Same work, one fewer self-compare.",
              "Stable? Not this swap version: an equal later value can leap over an earlier equal when the min is swapped in.",
            ],
            complexity: [
              "Comparisons: n + (n−1) + … + 1 = n(n+1)/2 = Θ(n²).",
              "Swaps: at most n (one per outer iteration; a no-op swap when min is already at start).",
              "Best = average = worst: still quadratic comparisons. Do not quote best-case O(n) for selection sort.",
            ],
            trace: [
              "[3, 1, 4, 2]: start=0 min=1 → [1, 3, 4, 2]",
              "start=1 min=2 at the end → [1, 2, 4, 3]",
              "start=2 min=3 → [1, 2, 3, 4]",
              "start=3 suffix length 1, done",
            ],
            interview: [
              {
                q: "What is Strategy 1?",
                a: "Repeatedly select the minimum of what is still unsorted and lock it into the next position of the sorted prefix. Exam-paper version: lowest remaining marks onto the new stack.",
              },
              {
                q: "Write the double loop.",
                a: "Outer start from 0 to n−1. Inner scan start..n−1 for minpos. Swap seq[start] with seq[minpos].",
              },
              {
                q: "T(n)?",
                a: "n+(n−1)+…+1 = n(n+1)/2 = O(n²). Same order even if the array is already sorted.",
              },
              {
                q: "How is this different from insertion sort?",
                a: "Selection hunts a min in the suffix. Insertion inserts seq[sliceEnd] left into an already-sorted prefix. Insertion can be linear on sorted data; selection cannot.",
              },
            ],
            pitfalls: [
              "Claiming selection sort is O(n) on sorted input — the inner scan still runs.",
              "Forgetting to swap after finding minpos.",
              "Starting the inner scan at 0 every time and destroying the prefix you already locked.",
            ],
          },
        },
        {
          id: "insertion-sort",
          title: "Insertion Sort",
          topic: "Strategy 2 — insert the next value into a growing sorted prefix",
          notes: {
            idea: "Strategy 2: keep a sorted stack (prefix). Each new value is inserted into the correct place by walking left. In code, seq[0:sliceEnd] is already sorted; seq[sliceEnd] bubbles left while it is smaller than its neighbour. Worst case T(n)=1+2+…+(n−1)=n(n−1)/2=O(n²).",
            why: [
              "First paper starts a new stack. Second goes below or above it. Each later paper inserts into the already-sorted stack. That is insertion sort.",
              "Invariant: at the top of the outer loop, seq[0:sliceEnd] is sorted. The job of the iteration is to make seq[0:sliceEnd+1] sorted by sliding seq[sliceEnd] left.",
              "Inserting into a sorted segment of length k takes up to k adjacent swaps in the worst case (new value smaller than everything). The segment grows by 1 each iteration, so costs 1+2+…+(n−1).",
              "Inductive picture: base — length 0 or 1 is already sorted. Step — sort l[0:len(l)-1], then insert l[len(l)-1] (not l[len(l)], which does not exist).",
              "isort(seq, k) means “sort the slice seq[0:k]”. Base k <= 1. Otherwise isort(seq, k-1) then insert seq[k-1] into that sorted prefix.",
            ],
            versus: [
              "Selection: pick a min from the right. Insertion: park the next unsorted value into the left. Same O(n²) worst case; insertion is faster on nearly sorted data.",
              "Iterative for/while vs recursive isort(k): same invariant. Recursion sorts seq[0:k-1], then insert(seq, k-1) slides seq[k-1] into that prefix. Recursion does not change T(n).",
              "Do not write insert(isort(seq, k), k). isort mutates in place and returns None. Call isort, then insert, as two statements.",
              "Array insert is expensive if you open a gap by shifting — here the while does exactly those shifts, one swap at a time.",
            ],
            code: [
              {
                title: "Grow seq[0:sliceEnd]; slide seq[sliceEnd] left",
                source:
                  "def InsertionSort(seq):\n    for sliceEnd in range(len(seq)):\n        pos = sliceEnd\n        while pos > 0 and seq[pos] < seq[pos - 1]:\n            (seq[pos], seq[pos - 1]) = (seq[pos - 1], seq[pos])\n            pos = pos - 1",
              },
              {
                title: "Recursive: sort prefix, then insert last",
                source:
                  "def InsertionSort(seq):\n    isort(seq, len(seq))\n\ndef isort(seq, k):     # sort seq[0:k]\n    if k > 1:\n        isort(seq, k - 1)\n        insert(seq, k - 1)\n\ndef insert(seq, k):    # seq[k] into seq[0:k]\n    pos = k\n    while pos > 0 and seq[pos] < seq[pos - 1]:\n        (seq[pos], seq[pos - 1]) = (seq[pos - 1], seq[pos])\n        pos = pos - 1",
              },
            ],
            pythonBits: [
              "range(len(seq)) includes 0; that iteration is a no-op. Writing range(1, len(seq)) is the same algorithm.",
              "The while test is short-circuit: pos > 0 first, so seq[pos-1] is never read at the left wall.",
              "Tuple swap is the adjacent transposition. pos = pos-1 walks the hole left.",
              "k > 1 is the recursive base: length 0 and 1 are already sorted (isort does nothing).",
              "The last cell of a prefix of length n is index n-1, never n. l[len(l)] is IndexError.",
            ],
            complexity: [
              "Worst recursive case: T(n) = (n−1) + T(n−1), T(1)=1. Unwind: (n−1)+(n−2)+…+1 = n(n−1)/2 = O(n²). Same sum as the iterative analysis.",
              "Worst case (reverse sorted): inserting into a segment of length k costs k steps. T(n)=1+2+…+(n−1)=n(n−1)/2=O(n²).",
              "Best case (already sorted): inner while fails immediately → Θ(n).",
              "Average: still Θ(n²) random swaps. Use this when n is small or the array is almost sorted; not at n=10⁶ (Python 10⁷ budget).",
            ],
            trace: [
              "[3, 1, 4, 2], sliceEnd=0: no-op, prefix [3]",
              "sliceEnd=1, pos=1: 1<3 swap → [1, 3, 4, 2]",
              "sliceEnd=2, 4≥3: no swap, prefix [1, 3, 4]",
              "isort(seq, 3): isort(seq, 2) then insert seq[2] into seq[0:2]",
              "T(4)=(3)+T(3)=(3)+(2)+T(2)=(3)+(2)+(1)+T(1)=6=4·3/2",
            ],
            interview: [
              {
                q: "What is Strategy 2?",
                a: "Insert each new paper into the correct place in the already-sorted stack. Prefix seq[0:sliceEnd] stays sorted; the next element slides left.",
              },
              {
                q: "State the loop invariant.",
                a: "Before the body, seq[0:sliceEnd] is sorted. After the while, seq[0:sliceEnd+1] is sorted. sliceEnd runs through every index.",
              },
              {
                q: "Write the inner while.",
                a: "pos = sliceEnd; while pos > 0 and seq[pos] < seq[pos-1]: swap neighbours; pos = pos-1.",
              },
              {
                q: "Derive T(n)=O(n²).",
                a: "Worst-case insert into a sorted run of length k costs k. k = 1,2,…,n−1. Sum = n(n−1)/2 = O(n²).",
              },
              {
                q: "Recursive insertion sort in one breath?",
                a: "Base: length 0 or 1, done. Step: sort the prefix of length n−1, then insert the last element into that sorted prefix. In code: isort(seq, k) if k>1: isort(k−1); insert(k−1).",
              },
              {
                q: "Write the recurrence and its closed form.",
                a: "T(n)=(n−1)+T(n−1), T(1)=1. Unwinds to (n−1)+…+1 = n(n−1)/2 = O(n²). Recursion did not improve the order.",
              },
              {
                q: "Insert l[len(l)] after sorting the prefix?",
                a: "No — IndexError. The last value is l[len(l)-1]. The slide’s correction is that −1.",
              },
            ],
            pitfalls: [
              "Using <= in the while and accidentally reversing equal keys (unstable) — or looping forever if you also forget pos = pos-1.",
              "Forgetting pos > 0 and indexing seq[-1].",
              "Quoting only O(n²) and missing that nearly-sorted insertion is linear.",
              "Writing insert l[len(l)] instead of l[len(l)-1] after sorting the prefix.",
              "Passing isort’s return value into insert — isort returns None; it sorts in place.",
            ],
          },
        },
        {
          id: "recursion-core",
          title: "Recursive Functions & Induction",
          topic: "Recursion from inductive definitions",
          notes: {
            idea: "An inductive definition — base case plus a step that uses a smaller argument — translates directly into a recursive Python function.",
            why: [
              "Many arithmetic functions are defined inductively: 0! = 1 and n! = n × (n − 1)!. Multiplication is repeated addition: m × 1 = m, m × n = m + m × (n − 1).",
              "Lists split the same way: first element plus the remaining list l[1:]. Base case is [] (or a list of length 1). The inductive step defines f(l) from a smaller sublist.",
              "You already saw this in Euclid: gcd(m, n) reduces to gcd(n, m % n) until n divides m. Recursion is that pattern, named.",
            ],
            mustHave: [
              "Base case: a branch that returns without calling the function again.",
              "Progress: every recursive call must use a strictly smaller problem (smaller n, shorter list, smaller k).",
              "The base case must actually be reached in a finite number of steps from any legal start. Same rule as a while loop: you must make the exit condition true.",
            ],
            code: [
              {
                title: "Factorial",
                source:
                  "def factorial(n):\n    if n == 0:\n        return 1\n    else:\n        return n * factorial(n - 1)",
              },
              {
                title: "Multiply by repeated addition",
                source:
                  "def multiply(m, n):\n    if n == 1:\n        return m\n    else:\n        return m + multiply(m, n - 1)",
              },
              {
                title: "Length of a list",
                source:
                  "def length(l):\n    if l == []:\n        return 0\n    else:\n        return 1 + length(l[1:])",
              },
              {
                title: "Sum of a list",
                source:
                  "def sumlist(l):\n    if l == []:\n        return 0\n    else:\n        return l[0] + sumlist(l[1:])",
              },
              {
                title: "Recursive insertion sort",
                source:
                  "def InsertionSort(seq):\n    isort(seq, len(seq))\n\ndef isort(seq, k):  # sort slice seq[0:k]\n    if k > 1:\n        isort(seq, k - 1)\n        insert(seq, k - 1)\n\ndef insert(seq, k):  # insert seq[k] into sorted seq[0:k-1]\n    pos = k\n    while pos > 0 and seq[pos] < seq[pos - 1]:\n        (seq[pos], seq[pos - 1]) = (seq[pos - 1], seq[pos])\n        pos = pos - 1",
              },
            ],
            pythonBits: [
              "Python's recursion limit is about 1000. InsertionSort(list(range(1000, 0, -1))) raises RecursionError: maximum recursion depth exceeded.",
              "Raise it if you must: import sys; sys.setrecursionlimit(10000). Prefer an iterative rewrite for production.",
              "The insertion-sort version recurses on a length k, not on slices, and mutates in place. Do not insert l[len(l)] — that index does not exist; the last cell is len(l)-1.",
            ],
            complexity: [
              "Recursive insertion sort: T(n) = (n − 1) + T(n − 1), T(1) = 1. Unrolls to 1 + 2 + … + (n − 1) = n(n − 1)/2 = O(n²).",
              "Selection sort is also O(n²). Among the two, insertion sort is usually faster, especially on nearly sorted input.",
              "O(n²) sorting is already painful for n over about 5000. Divide-and-conquer (Merge Sort) solves this in O(n log n).",
              "factorial(n) and length(l) are O(n) calls. Watch the Python depth limit, not just Big-O.",
            ],
            trace: [
              "factorial(4) → 4 * factorial(3) → 4 * 3 * factorial(2) → 4 * 3 * 2 * factorial(1) → 4 * 3 * 2 * 1 * factorial(0) → 24",
              "length([7, 8, 9]) → 1 + length([8, 9]) → 1 + 1 + length([9]) → 1 + 1 + 1 + length([]) → 3",
              "isort(seq, 3) sorts seq[0:2] first, then inserts seq[2] into that sorted prefix",
            ],
            terminate:
              "n decreases by 1 toward 0; list length decreases by 1 toward []; k decreases by 1 toward 1. If you forget the base case, or call with the same arguments, you never stop — RecursionError, analogous to an infinite while.",
            interview: [
              {
                q: "What two parts must every recursive function have?",
                a: "A base case that returns without a recursive call, and an inductive step that calls the function on a strictly smaller instance.",
              },
              {
                q: "How does recursion relate to a while loop?",
                a: "They are the same reduction. Recursion must hit a base case; a while must make its condition false. Euclid's remainder gcd was formulated both ways.",
              },
              {
                q: "Write factorial recursively.",
                a: "if n == 0: return 1; else return n * factorial(n - 1). Base 0! = 1, step n! = n × (n − 1)!.",
              },
              {
                q: "How do you define list functions inductively?",
                a: "Decompose as first element + rest. Base: f([]) (or length 1). Step: combine l[0] with f(l[1:]). Examples: length, sumlist.",
              },
              {
                q: "What happens if recursion is too deep in Python?",
                a: "RecursionError after about 1000 frames. sys.setrecursionlimit can raise it. CPython does not do tail-call optimisation, so a loop is the real fix.",
              },
              {
                q: "Give the recurrence for recursive insertion sort.",
                a: "T(n) = T(n − 1) + (n − 1), T(1) = 1, which is O(n²). Sorting the prefix of length n − 1, then inserting one value, up to n − 1 swaps.",
              },
              {
                q: "When is recursion the right tool in an interview?",
                a: "When the problem is defined from smaller copies of itself: trees, divide-and-conquer (merge sort next), backtracking, gcd-style number reductions. Say the complexity and the depth limit out loud.",
              },
            ],
            pitfalls: [
              "Missing base case, or a base case that is never reached → RecursionError.",
              "multiply base is n == 1, not n == 0. 0 as a multiplier needs its own case.",
              "l[1:] on every call is O(n) extra work per level; total can become O(n²) even if the recurrence looks linear.",
              "Recursive insertion sort still O(n²) — recursion did not make it faster, only clearer. Efficiency comes from a better algorithm (merge sort).",
            ],
          },
        },
      ],
    },
    {
      id: "sorting",
      short: "Sorting",
      title: "Divide & Conquer Sorting",
      color: "#4a5c7a",
      topics: [
        {
          id: "mergesort",
          title: "Merge Sort Algorithm",
          topic: "Divide in half, sort each half, merge",
          notes: {
            idea: "A different strategy from insert-the-next-value: split the array in two equal parts, sort each half, then merge those two sorted lists into one. Merge walks the heads of A and B and always takes the smaller next value. That combine step is linear; the sort will be the n log n algorithm the quadratic sorts were waiting for.",
            why: [
              "Insertion and selection grow a prefix by one element. Merge sort splits: left half, right half, then combine. The picture is two sorted runs feeding a third.",
              "Merging two already-sorted lists A and B into C: compare the current heads, move the smaller into C, repeat. If one list is empty, copy the rest of the other.",
              "In code, i and j are the unread heads. i+j is how many values have already been written to C. Stop when i+j == m+n.",
              "To sort A[0:n] into B: if n is 0 or 1, done (copy). Otherwise sort A[0:n//2] into L, sort A[n//2:n] into R, merge L and R into B.",
            ],
            versus: [
              "Insertion: T(n)=(n−1)+T(n−1)=O(n²). Merge sort: two half-size sorts plus a linear merge — T(n)=2T(n/2)+O(n). The closed form (next card) is O(n log n).",
              "Insertion mutates in place with adjacent swaps. Merge allocates C (and recursive L, R). Extra memory for a better time class.",
              "Merge needs two sorted inputs. Garbage in, garbage out — merging unsorted halves does not sort.",
            ],
            code: [
              {
                title: "merge — four cases, one append per step",
                source:
                  "def merge(A, B):\n    (C, m, n) = ([], len(A), len(B))\n    (i, j) = (0, 0)\n    while i + j < m + n:\n        if i == m:\n            C.append(B[j]); j = j + 1\n        elif j == n:\n            C.append(A[i]); i = i + 1\n        elif A[i] <= B[j]:\n            C.append(A[i]); i = i + 1\n        else:\n            C.append(B[j]); j = j + 1\n    return C",
              },
              {
                title: "MergeSort — halves, then merge",
                source:
                  "def MergeSort(A):\n    n = len(A)\n    if n <= 1:\n        return A[:]\n    mid = n // 2\n    L = MergeSort(A[0:mid])\n    R = MergeSort(A[mid:n])\n    return merge(L, R)",
              },
            ],
            pythonBits: [
              "i+j < m+n: each loop appends exactly one value, so i+j climbs to m+n and stops. Empty+empty: the while never runs.",
              "Test i==m before A[i], and j==n before B[j], or you read off the end of an exhausted list.",
              "A[i] <= B[j] (not <) keeps merge stable: equals come from A first.",
              "n <= 1, not only n == 1. A[0:0] is empty; if you only stop at 1 you recurse on 0 forever.",
              "(C, m, n) = ([], len(A), len(B)) is one tuple assignment, same idea as the primes card.",
            ],
            complexity: [
              "merge(A,B) is Θ(m+n): every element is appended once. Two halves of n → Θ(n) combine.",
              "MergeSort: T(0)=T(1)=Θ(1), T(n)=2T(n/2)+Θ(n). Unwinds (analysis card) to Θ(n log n). Contrast insertion’s n(n−1)/2.",
              "Extra space: O(n) for C plus the two half-size copies on the way down — not an in-place adjacent-swap sort.",
            ],
            trace: [
              "merge([1,4,7],[2,3,8]): take 1,2,3,4,7,8 — always the smaller head",
              "merge([],[2,3]) copies B; merge([1],[]) copies A",
              "MergeSort([4,1,3,2]): L=MergeSort([4,1])=[1,4], R=MergeSort([3,2])=[2,3], merge → [1,2,3,4]",
              "mid = n//2: n=5 → 2 and 3 (not 2.5). Same // as binary search.",
            ],
            interview: [
              {
                q: "What is the different strategy?",
                a: "Split in two equal parts, sort each half, merge the two sorted runs. Not “insert the next paper into a stack”.",
              },
              {
                q: "How do you merge A and B?",
                a: "If A is empty copy B; if B is empty copy A; else move the smaller head into C. Repeat until both are consumed. i+j counts how many have moved.",
              },
              {
                q: "Write merge’s four cases.",
                a: "i==m → take B[j]; j==n → take A[i]; A[i]<=B[j] → take A[i]; else take B[j]. Guard empties first.",
              },
              {
                q: "Write MergeSort from the halves.",
                a: "If n<=1 return a copy. mid=n//2. Recurse on A[0:mid] and A[mid:n]. return merge(L,R).",
              },
              {
                q: "Why is merge linear?",
                a: "Each iteration writes one element of A or B into C and advances that pointer. Exactly m+n appends.",
              },
              {
                q: "Does this beat insertion sort yet?",
                a: "Yes in the growth class: 2T(n/2)+O(n) is O(n log n), not O(n²). Full unwind is the analysis card. You pay extra lists.",
              },
            ],
            pitfalls: [
              "Reading A[i] when i==m (or B[j] when j==n) — order of the ifs matters.",
              "Stopping only when n==1 and slicing an empty half — infinite recursion on [].",
              "Using < instead of <= and losing stability.",
              "Merging unsorted halves and expecting a sorted C.",
              "Thinking merge sort is in-place like the insertion while-swap.",
            ],
          },
        },
        { id: "mergesort-analysis", title: "Merge Sort Analysis — O(n log n)", notes: null },
        { id: "quicksort", title: "Quick Sort Algorithm", notes: null },
        { id: "quicksort-analysis", title: "Quick Sort Partitioning & Worst Case", notes: null },
        { id: "tuples-dicts", title: "Tuples & Dictionaries", notes: null },
        { id: "higher-order", title: "Function Arguments & Lambda", notes: null },
        { id: "comprehensions", title: "List Comprehensions", notes: null },
      ],
    },
    {
      id: "io",
      short: "I/O & Files",
      title: "Exceptions, File I/O & Formatting",
      color: "#a85a3a",
      topics: [
        { id: "exceptions", title: "Exception Handling (try-except-finally)", notes: null },
        { id: "stdio", title: "Standard Input and Output", notes: null },
        { id: "files", title: "File Operations & Context Managers", notes: null },
        { id: "strings-adv", title: "String Methods & Formatting", notes: null },
        { id: "print-format", title: "Formatted Output & String Interpolation", notes: null },
        { id: "special-names", title: "Special Names: pass, del(), None", notes: null },
      ],
    },
    {
      id: "backtracking",
      short: "Search & Heaps",
      title: "Backtracking & Priority Queues",
      color: "#6a4a78",
      topics: [
        { id: "nqueens", title: "Backtracking & N-Queens Problem", notes: null },
        { id: "scope-nested", title: "Global, Local & Nonlocal Scopes", notes: null },
        { id: "permutations", title: "Permutations Generation", notes: null },
        { id: "stacks-queues", title: "Abstract Stacks & Queues", notes: null },
        { id: "heaps", title: "Priority Queues & Binary Heaps", notes: null },
      ],
    },
    {
      id: "datastructures",
      short: "Classes & Trees",
      title: "User-Defined Types & Search Trees",
      color: "#6b7a4a",
      topics: [
        { id: "adt-classes", title: "Abstract Data Types & Object-Oriented Design", notes: null },
        { id: "classes-python", title: "Classes, Methods & Objects in Python", notes: null },
        { id: "linked-lists", title: "User-Defined Linked Lists", notes: null },
        { id: "bst", title: "Binary Search Trees (Insert, Delete, Search)", notes: null },
      ],
    },
    {
      id: "dp",
      short: "Dynamic Prog",
      title: "Dynamic Programming & Optimization",
      color: "#7a3d4a",
      topics: [
        { id: "memoization", title: "Memoization & Dynamic Programming Principles", notes: null },
        { id: "grid-paths", title: "Grid Paths Optimization", notes: null },
        { id: "lcs", title: "Longest Common Subsequence (LCS)", notes: null },
        { id: "matrix-chain", title: "Matrix Chain Multiplication", notes: null },
        { id: "paradigms-wrapup", title: "Language Wrap-Up & Paradigm Comparisons", notes: null },
      ],
    },
  ],
  crossLinks: [
    {
      source: { domainId: "gcd", topicId: "gcd-euclid" },
      target: { domainId: "recursion", topicId: "recursion-core" },
      label: "Inductive reduction",
      concept: "Euclid's gcd(m,n)=gcd(n,m%n) was the first inductive reduction, formalized under recursive functions.",
    },
    {
      source: { domainId: "gcd", topicId: "gcd-euclid" },
      target: { domainId: "types", topicId: "numeric-types" },
      label: "Modulo divisibility",
      concept: "The base case test in Euclid uses the % remainder and == comparison introduced in numeric types.",
    },
    {
      source: { domainId: "types", topicId: "strings" },
      target: { domainId: "types", topicId: "lists" },
      label: "Immutable vs Mutable",
      concept: "Strings reject in-place assignment (TypeError); lists are mutable and create aliasing.",
    },
    {
      source: { domainId: "types", topicId: "strings" },
      target: { domainId: "types", topicId: "range-loops" },
      label: "Half-open intervals",
      concept: "Slices s[1:4] and range(1, 4) both use half-open intervals: start included, stop excluded.",
    },
    {
      source: { domainId: "types", topicId: "lists" },
      target: { domainId: "recursion", topicId: "recursion-core" },
      label: "Sequence recursion",
      concept: "Recursive functions on lists decompose using slices (l[1:]) or mutate elements in-place (insertion sort).",
    },
    {
      source: { domainId: "types", topicId: "functions-scope" },
      target: { domainId: "recursion", topicId: "recursion-core" },
      label: "Call stack & scope",
      concept: "Function namespaces and call frames form the recursive unwind stack in recursion.",
    },
    {
      source: { domainId: "types", topicId: "primes-while" },
      target: { domainId: "gcd", topicId: "gcd-euclid" },
      label: "While loop termination",
      concept: "Both Euclid's gcd while(m % n != 0) and nprimes while(count < n) require unconditional progression to guarantee termination.",
    },
    {
      source: { domainId: "types", topicId: "primes-while" },
      target: { domainId: "types", topicId: "lists" },
      label: "List concatenation vs append",
      concept: "nprimes accumulates primes via plist + [i] creating a new list each time, contrasting with in-place mutation.",
    },
    {
      source: { domainId: "types", topicId: "list-methods" },
      target: { domainId: "types", topicId: "lists" },
      label: "Methods vs + / slice",
      concept: "append, extend, remove, reverse, and sort mutate the same object that aliasing already made dangerous; + and [:] allocate new lists.",
    },
    {
      source: { domainId: "types", topicId: "list-methods" },
      target: { domainId: "types", topicId: "primes-while" },
      label: "append vs + in a loop",
      concept: "Growing a list with + copies every time; append is the amortized O(1) in-place grow used instead of plist + [i].",
    },
    {
      source: { domainId: "types", topicId: "list-methods" },
      target: { domainId: "recursion", topicId: "list-mutation" },
      label: "In-place vs rebind",
      concept: "The method list (append/extend/remove/sort) is what actually overwrites the object in memory; mutation vs + is the aliasing punchline.",
    },
    {
      source: { domainId: "types", topicId: "list-methods" },
      target: { domainId: "recursion", topicId: "loop-control" },
      label: "index vs findpos",
      concept: "l.index(x) raises on a miss; findpos with for-else returns -1. Both are a leftmost linear scan.",
    },
    {
      source: { domainId: "types", topicId: "lists" },
      target: { domainId: "recursion", topicId: "loop-control" },
      label: "Search a list",
      concept: "Linear search walks list indices; for-else is the control-flow form of “found at i / not in l”.",
    },
    {
      source: { domainId: "recursion", topicId: "list-mutation" },
      target: { domainId: "types", topicId: "lists" },
      label: "Aliases see in-place edits",
      concept: "list2 = list1 plus append/reverse/sort changes list2; list1 = list1 + extra does not.",
    },
    {
      source: { domainId: "recursion", topicId: "insertion-sort" },
      target: { domainId: "sorting", topicId: "mergesort" },
      label: "Prefix vs halves",
      concept: "Insertion grows a sorted prefix by one; merge sort splits in half, sorts both, then merges in linear time.",
    },
    {
      source: { domainId: "recursion", topicId: "recursion-core" },
      target: { domainId: "sorting", topicId: "mergesort" },
      label: "Divide-and-conquer",
      concept: "Recursive insertion sort is O(n²); Mergesort applies recursion to halves for O(n log n).",
    },
    {
      source: { domainId: "types", topicId: "lists" },
      target: { domainId: "datastructures", topicId: "linked-lists" },
      label: "Array vs Linked List",
      concept: "Python lists are dynamic arrays (O(1) index). The course “list” is a linked chain of nodes; that type is built later.",
    },
    {
      source: { domainId: "recursion", topicId: "binary-search" },
      target: { domainId: "types", topicId: "lists" },
      label: "Python list is an array",
      concept: "seq[i] is an offset in a contiguous block. That is why we can treat Python lists as arrays for binary search.",
    },
    {
      source: { domainId: "recursion", topicId: "binary-search" },
      target: { domainId: "recursion", topicId: "loop-control" },
      label: "Linear vs binary search",
      concept: "findpos scans every cell, unsorted OK. bsearch halves a sorted array and needs O(1) mid access.",
    },
    {
      source: { domainId: "recursion", topicId: "binary-search" },
      target: { domainId: "recursion", topicId: "recursion-core" },
      label: "Halving recurrence",
      concept: "bsearch is the same inductive shrink as recursion: empty slice is the base; each call is a strictly smaller [l,r).",
    },
    {
      source: { domainId: "recursion", topicId: "binary-search" },
      target: { domainId: "datastructures", topicId: "linked-lists" },
      label: "Algorithms may not transfer",
      concept: "Binary search is O(log n) only with O(1) seq[i]. On a linked list the same idea is not logarithmic.",
    },
    {
      source: { domainId: "recursion", topicId: "efficiency-intro" },
      target: { domainId: "recursion", topicId: "binary-search" },
      label: "O(n) vs O(log n)",
      concept: "Linear scan is O(n) even on arrays; binary search is O(log n) and only on sorted arrays. Worst case is a miss.",
    },
    {
      source: { domainId: "recursion", topicId: "efficiency-intro" },
      target: { domainId: "recursion", topicId: "loop-control" },
      label: "Worst-case linear scan",
      concept: "findpos returning -1 is the worst case T(n)=Θ(n) that Big-O analysis quotes for search.",
    },
    {
      source: { domainId: "recursion", topicId: "efficiency-intro" },
      target: { domainId: "gcd", topicId: "gcd-euclid" },
      label: "Logarithmic T(n)",
      concept: "Euclid’s remainder gcd is O(log min(m,n)), the same growth class as binary search, not the naive linear scan of candidates.",
    },
    {
      source: { domainId: "recursion", topicId: "efficiency-intro" },
      target: { domainId: "sorting", topicId: "mergesort" },
      label: "Pay n log n to sort",
      concept: "Sorting is the n log n investment that unlocks log n search, the median, duplicate checks, and frequency tables.",
    },
    {
      source: { domainId: "recursion", topicId: "selection-sort" },
      target: { domainId: "recursion", topicId: "insertion-sort" },
      label: "Select vs insert",
      concept: "Strategy 1 locks the next min; Strategy 2 slides the next value into a sorted prefix. Both O(n²) worst case; only insertion is linear when already sorted.",
    },
    {
      source: { domainId: "recursion", topicId: "insertion-sort" },
      target: { domainId: "recursion", topicId: "recursion-core" },
      label: "Same insert, two shapes",
      concept: "Iterative InsertionSort is the for/while form of recursive isort + insert already on the recursion card.",
    },
    {
      source: { domainId: "recursion", topicId: "insertion-sort" },
      target: { domainId: "recursion", topicId: "efficiency-intro" },
      label: "O(n²) vs the 10⁷ budget",
      concept: "n(n−1)/2 swaps in the worst case: fine for small n, hopeless at a million Python steps.",
    },
    {
      source: { domainId: "recursion", topicId: "selection-sort" },
      target: { domainId: "recursion", topicId: "efficiency-intro" },
      label: "Always Θ(n²)",
      concept: "Selection sort’s comparison count does not improve on sorted data — still the triangular sum.",
    },
    {
      source: { domainId: "recursion", topicId: "insertion-sort" },
      target: { domainId: "recursion", topicId: "list-mutation" },
      label: "In-place adjacent swaps",
      concept: "The while-loop tuple swap mutates the same list object; aliases see the prefix grow.",
    },
    {
      source: { domainId: "recursion", topicId: "recursion-core" },
      target: { domainId: "dp", topicId: "memoization" },
      label: "Memoization & DP",
      concept: "Naive recursion recalculates overlapping subproblems; DP memoizes recursive results for efficiency.",
    },
  ],
};
