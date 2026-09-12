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
        { id: "list-mutation", title: "Manipulating Lists in Memory", notes: null },
        { id: "loop-control", title: "Loop Breaking & Early Exit", notes: null },
        { id: "binary-search", title: "Arrays vs Lists & Binary Search", notes: null },
        { id: "efficiency-intro", title: "Algorithmic Efficiency & Orders of Growth", notes: null },
        { id: "selection-sort", title: "Selection Sort", notes: null },
        { id: "insertion-sort", title: "Insertion Sort", notes: null },
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
              "l[1:] builds a new list each call, so naive list recursion is also extra memory and time. The insertion-sort version recurses on a length k, not on slices, and mutates in place.",
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
        { id: "mergesort", title: "Merge Sort Algorithm", notes: null },
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
      source: { domainId: "recursion", topicId: "recursion-core" },
      target: { domainId: "sorting", topicId: "mergesort" },
      label: "Divide-and-conquer",
      concept: "Recursive insertion sort is O(n²); Mergesort applies recursion to halves for O(n log n).",
    },
    {
      source: { domainId: "types", topicId: "lists" },
      target: { domainId: "datastructures", topicId: "linked-lists" },
      label: "Array vs Linked List",
      concept: "Python's contiguous mutable lists contrast with recursive Node/Linked list data structures.",
    },
    {
      source: { domainId: "recursion", topicId: "recursion-core" },
      target: { domainId: "dp", topicId: "memoization" },
      label: "Memoization & DP",
      concept: "Naive recursion recalculates overlapping subproblems; DP memoizes recursive results for efficiency.",
    },
  ],
};
