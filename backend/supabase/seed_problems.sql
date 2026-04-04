-- =============================================================================
-- CodeGraph Problem Seeds
-- 20 LeetCode-style problems with Python + JavaScript starter & test code
-- =============================================================================

DELETE FROM problem_submissions;
DELETE FROM problems;

-- -----------------------------------------------------------------------------
-- 1. Two Sum
-- -----------------------------------------------------------------------------
INSERT INTO problems (id, title, slug, description, difficulty, tags, starter_code, test_code, hints, examples, constraints) VALUES
('a0000000-0001-4001-8001-000000000001',
 'Two Sum',
 'two-sum',
 'Given an array of integers `nums` and an integer `target`, return the indices of the two numbers that add up to `target`.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.',
 'easy',
 '{"arrays", "hash-table"}',
 '{"python": "def two_sum(nums, target):\n    # Your code here\n    pass", "javascript": "function twoSum(nums, target) {\n    // Your code here\n}"}',
 '{"python": "# Tests\nimport json\nresults = []\n\nr1 = two_sum([2,7,11,15], 9)\nresults.append((\"example_1\", sorted(r1) == [0,1]))\n\nr2 = two_sum([3,2,4], 6)\nresults.append((\"example_2\", sorted(r2) == [1,2]))\n\nr3 = two_sum([3,3], 6)\nresults.append((\"example_3\", sorted(r3) == [0,1]))\n\nr4 = two_sum([1,5,3,7,2], 9)\nresults.append((\"negative_and_large\", sorted(r4) == [1,3]))\n\nall_passed = True\nfor name, passed in results:\n    if passed:\n        print(f\"PASS: {name}\")\n    else:\n        print(f\"FAIL: {name} - incorrect result\")\n        all_passed = False\nif all_passed:\n    print(\"ALL_TESTS_PASSED\")", "javascript": "// Tests\nconst results = [];\n\nlet r1 = twoSum([2,7,11,15], 9);\nresults.push([\"example_1\", r1.sort((a,b)=>a-b).join() === \"0,1\"]);\n\nlet r2 = twoSum([3,2,4], 6);\nresults.push([\"example_2\", r2.sort((a,b)=>a-b).join() === \"1,2\"]);\n\nlet r3 = twoSum([3,3], 6);\nresults.push([\"example_3\", r3.sort((a,b)=>a-b).join() === \"0,1\"]);\n\nlet r4 = twoSum([1,5,3,7,2], 9);\nresults.push([\"negative_and_large\", r4.sort((a,b)=>a-b).join() === \"1,3\"]);\n\nlet allPassed = true;\nfor (const [name, passed] of results) {\n    if (passed) console.log(`PASS: ${name}`);\n    else { console.log(`FAIL: ${name} - incorrect result`); allPassed = false; }\n}\nif (allPassed) console.log(\"ALL_TESTS_PASSED\");"}',
 '{"Use a hash map to store numbers you''ve seen", "For each number, check if target - number exists in your map"}',
 '[{"input": "nums = [2,7,11,15], target = 9", "output": "[0,1]", "explanation": "nums[0] + nums[1] = 2 + 7 = 9"}, {"input": "nums = [3,2,4], target = 6", "output": "[1,2]"}, {"input": "nums = [3,3], target = 6", "output": "[0,1]"}]',
 '{"2 <= nums.length <= 10^4", "-10^9 <= nums[i] <= 10^9", "-10^9 <= target <= 10^9", "Only one valid answer exists"}');

-- -----------------------------------------------------------------------------
-- 2. Reverse String
-- -----------------------------------------------------------------------------
INSERT INTO problems (id, title, slug, description, difficulty, tags, starter_code, test_code, hints, examples, constraints) VALUES
('a0000000-0002-4002-8002-000000000002',
 'Reverse String',
 'reverse-string',
 'Write a function that reverses a string. The input string is given as an array of characters.

You must do this by modifying the input array in-place with O(1) extra memory.',
 'easy',
 '{"two-pointers", "string"}',
 '{"python": "def reverse_string(s):\n    # Modify s in-place\n    pass", "javascript": "function reverseString(s) {\n    // Modify s in-place\n}"}',
 '{"python": "# Tests\nresults = []\n\ns1 = [\"h\",\"e\",\"l\",\"l\",\"o\"]\nreverse_string(s1)\nresults.append((\"example_1\", s1 == [\"o\",\"l\",\"l\",\"e\",\"h\"]))\n\ns2 = [\"H\",\"a\",\"n\",\"n\",\"a\",\"h\"]\nreverse_string(s2)\nresults.append((\"example_2\", s2 == [\"h\",\"a\",\"n\",\"n\",\"a\",\"H\"]))\n\ns3 = [\"a\"]\nreverse_string(s3)\nresults.append((\"single_char\", s3 == [\"a\"]))\n\ns4 = [\"a\",\"b\"]\nreverse_string(s4)\nresults.append((\"two_chars\", s4 == [\"b\",\"a\"]))\n\nall_passed = True\nfor name, passed in results:\n    if passed:\n        print(f\"PASS: {name}\")\n    else:\n        print(f\"FAIL: {name} - incorrect result\")\n        all_passed = False\nif all_passed:\n    print(\"ALL_TESTS_PASSED\")", "javascript": "// Tests\nconst results = [];\n\nlet s1 = [\"h\",\"e\",\"l\",\"l\",\"o\"];\nreverseString(s1);\nresults.push([\"example_1\", JSON.stringify(s1) === JSON.stringify([\"o\",\"l\",\"l\",\"e\",\"h\"])]);\n\nlet s2 = [\"H\",\"a\",\"n\",\"n\",\"a\",\"h\"];\nreverseString(s2);\nresults.push([\"example_2\", JSON.stringify(s2) === JSON.stringify([\"h\",\"a\",\"n\",\"n\",\"a\",\"H\"])]);\n\nlet s3 = [\"a\"];\nreverseString(s3);\nresults.push([\"single_char\", JSON.stringify(s3) === JSON.stringify([\"a\"])]);\n\nlet s4 = [\"a\",\"b\"];\nreverseString(s4);\nresults.push([\"two_chars\", JSON.stringify(s4) === JSON.stringify([\"b\",\"a\"])]);\n\nlet allPassed = true;\nfor (const [name, passed] of results) {\n    if (passed) console.log(`PASS: ${name}`);\n    else { console.log(`FAIL: ${name} - incorrect result`); allPassed = false; }\n}\nif (allPassed) console.log(\"ALL_TESTS_PASSED\");"}',
 '{"Use two pointers — one at the start, one at the end", "Swap elements and move pointers inward"}',
 '[{"input": "s = [\"h\",\"e\",\"l\",\"l\",\"o\"]", "output": "[\"o\",\"l\",\"l\",\"e\",\"h\"]"}, {"input": "s = [\"H\",\"a\",\"n\",\"n\",\"a\",\"h\"]", "output": "[\"h\",\"a\",\"n\",\"n\",\"a\",\"H\"]"}]',
 '{"1 <= s.length <= 10^5", "s[i] is a printable ASCII character"}');

-- -----------------------------------------------------------------------------
-- 3. FizzBuzz
-- -----------------------------------------------------------------------------
INSERT INTO problems (id, title, slug, description, difficulty, tags, starter_code, test_code, hints, examples, constraints) VALUES
('a0000000-0003-4003-8003-000000000003',
 'FizzBuzz',
 'fizzbuzz',
 'Given an integer `n`, return a string array `answer` (1-indexed) where:

- `answer[i] == "FizzBuzz"` if `i` is divisible by 3 and 5.
- `answer[i] == "Fizz"` if `i` is divisible by 3.
- `answer[i] == "Buzz"` if `i` is divisible by 5.
- `answer[i] == str(i)` if none of the above conditions are true.',
 'easy',
 '{"math", "string", "simulation"}',
 '{"python": "def fizzbuzz(n):\n    # Your code here\n    pass", "javascript": "function fizzBuzz(n) {\n    // Your code here\n}"}',
 '{"python": "# Tests\nresults = []\n\nr1 = fizzbuzz(3)\nresults.append((\"n_equals_3\", r1 == [\"1\",\"2\",\"Fizz\"]))\n\nr2 = fizzbuzz(5)\nresults.append((\"n_equals_5\", r2 == [\"1\",\"2\",\"Fizz\",\"4\",\"Buzz\"]))\n\nr3 = fizzbuzz(15)\nresults.append((\"n_equals_15\", r3[-1] == \"FizzBuzz\" and len(r3) == 15))\n\nr4 = fizzbuzz(1)\nresults.append((\"n_equals_1\", r4 == [\"1\"]))\n\nall_passed = True\nfor name, passed in results:\n    if passed:\n        print(f\"PASS: {name}\")\n    else:\n        print(f\"FAIL: {name} - incorrect result\")\n        all_passed = False\nif all_passed:\n    print(\"ALL_TESTS_PASSED\")", "javascript": "// Tests\nconst results = [];\n\nlet r1 = fizzBuzz(3);\nresults.push([\"n_equals_3\", JSON.stringify(r1) === JSON.stringify([\"1\",\"2\",\"Fizz\"])]);\n\nlet r2 = fizzBuzz(5);\nresults.push([\"n_equals_5\", JSON.stringify(r2) === JSON.stringify([\"1\",\"2\",\"Fizz\",\"4\",\"Buzz\"])]);\n\nlet r3 = fizzBuzz(15);\nresults.push([\"n_equals_15\", r3[r3.length-1] === \"FizzBuzz\" && r3.length === 15]);\n\nlet r4 = fizzBuzz(1);\nresults.push([\"n_equals_1\", JSON.stringify(r4) === JSON.stringify([\"1\"])]);\n\nlet allPassed = true;\nfor (const [name, passed] of results) {\n    if (passed) console.log(`PASS: ${name}`);\n    else { console.log(`FAIL: ${name} - incorrect result`); allPassed = false; }\n}\nif (allPassed) console.log(\"ALL_TESTS_PASSED\");"}',
 '{"Check divisibility by 15 first (both 3 and 5)", "Use modulo operator %"}',
 '[{"input": "n = 3", "output": "[\"1\",\"2\",\"Fizz\"]"}, {"input": "n = 5", "output": "[\"1\",\"2\",\"Fizz\",\"4\",\"Buzz\"]"}, {"input": "n = 15", "output": "[\"1\",\"2\",\"Fizz\",\"4\",\"Buzz\",\"Fizz\",\"7\",\"8\",\"Fizz\",\"Buzz\",\"11\",\"Fizz\",\"13\",\"14\",\"FizzBuzz\"]"}]',
 '{"1 <= n <= 10^4"}');

-- -----------------------------------------------------------------------------
-- 4. Palindrome Number
-- -----------------------------------------------------------------------------
INSERT INTO problems (id, title, slug, description, difficulty, tags, starter_code, test_code, hints, examples, constraints) VALUES
('a0000000-0004-4004-8004-000000000004',
 'Palindrome Number',
 'palindrome-number',
 'Given an integer `x`, return `true` if `x` is a palindrome, and `false` otherwise.

An integer is a palindrome when it reads the same forward and backward.

**Follow up:** Could you solve it without converting the integer to a string?',
 'easy',
 '{"math"}',
 '{"python": "def is_palindrome(x):\n    # Your code here\n    pass", "javascript": "function isPalindrome(x) {\n    // Your code here\n}"}',
 '{"python": "# Tests\nresults = []\nresults.append((\"positive_palindrome\", is_palindrome(121) == True))\nresults.append((\"negative_number\", is_palindrome(-121) == False))\nresults.append((\"ends_with_zero\", is_palindrome(10) == False))\nresults.append((\"single_digit\", is_palindrome(7) == True))\nresults.append((\"zero\", is_palindrome(0) == True))\nresults.append((\"large_palindrome\", is_palindrome(1234321) == True))\n\nall_passed = True\nfor name, passed in results:\n    if passed:\n        print(f\"PASS: {name}\")\n    else:\n        print(f\"FAIL: {name} - incorrect result\")\n        all_passed = False\nif all_passed:\n    print(\"ALL_TESTS_PASSED\")", "javascript": "// Tests\nconst results = [];\nresults.push([\"positive_palindrome\", isPalindrome(121) === true]);\nresults.push([\"negative_number\", isPalindrome(-121) === false]);\nresults.push([\"ends_with_zero\", isPalindrome(10) === false]);\nresults.push([\"single_digit\", isPalindrome(7) === true]);\nresults.push([\"zero\", isPalindrome(0) === true]);\nresults.push([\"large_palindrome\", isPalindrome(1234321) === true]);\n\nlet allPassed = true;\nfor (const [name, passed] of results) {\n    if (passed) console.log(`PASS: ${name}`);\n    else { console.log(`FAIL: ${name} - incorrect result`); allPassed = false; }\n}\nif (allPassed) console.log(\"ALL_TESTS_PASSED\");"}',
 '{"Negative numbers are never palindromes", "Try reversing only half the number"}',
 '[{"input": "x = 121", "output": "true", "explanation": "121 reads as 121 from left to right and from right to left"}, {"input": "x = -121", "output": "false", "explanation": "From left to right it reads -121, from right to left it becomes 121-"}, {"input": "x = 10", "output": "false", "explanation": "Reads 01 from right to left"}]',
 '{"-2^31 <= x <= 2^31 - 1"}');

-- -----------------------------------------------------------------------------
-- 5. Valid Parentheses
-- -----------------------------------------------------------------------------
INSERT INTO problems (id, title, slug, description, difficulty, tags, starter_code, test_code, hints, examples, constraints) VALUES
('a0000000-0005-4005-8005-000000000005',
 'Valid Parentheses',
 'valid-parentheses',
 'Given a string `s` containing just the characters `(`, `)`, `{`, `}`, `[` and `]`, determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.',
 'easy',
 '{"stack", "string"}',
 '{"python": "def is_valid(s):\n    # Your code here\n    pass", "javascript": "function isValid(s) {\n    // Your code here\n}"}',
 '{"python": "# Tests\nresults = []\nresults.append((\"simple_parens\", is_valid(\"()\") == True))\nresults.append((\"mixed_valid\", is_valid(\"()[]{}\") == True))\nresults.append((\"mismatched\", is_valid(\"(]\") == False))\nresults.append((\"nested_valid\", is_valid(\"{[]}\") == True))\nresults.append((\"unbalanced\", is_valid(\"([)]\") == False))\nresults.append((\"single_open\", is_valid(\"(\") == False))\nresults.append((\"empty_string\", is_valid(\"\") == True))\n\nall_passed = True\nfor name, passed in results:\n    if passed:\n        print(f\"PASS: {name}\")\n    else:\n        print(f\"FAIL: {name} - incorrect result\")\n        all_passed = False\nif all_passed:\n    print(\"ALL_TESTS_PASSED\")", "javascript": "// Tests\nconst results = [];\nresults.push([\"simple_parens\", isValid(\"()\") === true]);\nresults.push([\"mixed_valid\", isValid(\"()[]{}\") === true]);\nresults.push([\"mismatched\", isValid(\"(]\") === false]);\nresults.push([\"nested_valid\", isValid(\"{[]}\") === true]);\nresults.push([\"unbalanced\", isValid(\"([)]\") === false]);\nresults.push([\"single_open\", isValid(\"(\") === false]);\nresults.push([\"empty_string\", isValid(\"\") === true]);\n\nlet allPassed = true;\nfor (const [name, passed] of results) {\n    if (passed) console.log(`PASS: ${name}`);\n    else { console.log(`FAIL: ${name} - incorrect result`); allPassed = false; }\n}\nif (allPassed) console.log(\"ALL_TESTS_PASSED\");"}',
 '{"Use a stack to track opening brackets", "When you see a closing bracket, check if it matches the top of the stack"}',
 '[{"input": "s = \"()\"", "output": "true"}, {"input": "s = \"()[]{}\"", "output": "true"}, {"input": "s = \"(]\"", "output": "false"}]',
 '{"1 <= s.length <= 10^4", "s consists of parentheses only: ()[]{}"}');

-- -----------------------------------------------------------------------------
-- 6. Maximum Subarray
-- -----------------------------------------------------------------------------
INSERT INTO problems (id, title, slug, description, difficulty, tags, starter_code, test_code, hints, examples, constraints) VALUES
('a0000000-0006-4006-8006-000000000006',
 'Maximum Subarray',
 'maximum-subarray',
 'Given an integer array `nums`, find the subarray with the largest sum, and return its sum.

A **subarray** is a contiguous non-empty sequence of elements within an array.',
 'medium',
 '{"arrays", "dynamic-programming", "divide-and-conquer"}',
 '{"python": "def max_sub_array(nums):\n    # Your code here\n    pass", "javascript": "function maxSubArray(nums) {\n    // Your code here\n}"}',
 '{"python": "# Tests\nresults = []\nresults.append((\"example_1\", max_sub_array([-2,1,-3,4,-1,2,1,-5,4]) == 6))\nresults.append((\"single_element\", max_sub_array([1]) == 1))\nresults.append((\"all_positive\", max_sub_array([5,4,-1,7,8]) == 23))\nresults.append((\"all_negative\", max_sub_array([-3,-2,-1,-4]) == -1))\nresults.append((\"mixed\", max_sub_array([1,2,-1,3,-2]) == 5))\n\nall_passed = True\nfor name, passed in results:\n    if passed:\n        print(f\"PASS: {name}\")\n    else:\n        print(f\"FAIL: {name} - incorrect result\")\n        all_passed = False\nif all_passed:\n    print(\"ALL_TESTS_PASSED\")", "javascript": "// Tests\nconst results = [];\nresults.push([\"example_1\", maxSubArray([-2,1,-3,4,-1,2,1,-5,4]) === 6]);\nresults.push([\"single_element\", maxSubArray([1]) === 1]);\nresults.push([\"all_positive\", maxSubArray([5,4,-1,7,8]) === 23]);\nresults.push([\"all_negative\", maxSubArray([-3,-2,-1,-4]) === -1]);\nresults.push([\"mixed\", maxSubArray([1,2,-1,3,-2]) === 5]);\n\nlet allPassed = true;\nfor (const [name, passed] of results) {\n    if (passed) console.log(`PASS: ${name}`);\n    else { console.log(`FAIL: ${name} - incorrect result`); allPassed = false; }\n}\nif (allPassed) console.log(\"ALL_TESTS_PASSED\");"}',
 '{"Think about Kadane''s algorithm", "At each position, decide whether to extend the previous subarray or start a new one"}',
 '[{"input": "nums = [-2,1,-3,4,-1,2,1,-5,4]", "output": "6", "explanation": "The subarray [4,-1,2,1] has the largest sum 6"}, {"input": "nums = [1]", "output": "1"}, {"input": "nums = [5,4,-1,7,8]", "output": "23"}]',
 '{"1 <= nums.length <= 10^5", "-10^4 <= nums[i] <= 10^4"}');

-- -----------------------------------------------------------------------------
-- 7. Best Time to Buy and Sell Stock
-- -----------------------------------------------------------------------------
INSERT INTO problems (id, title, slug, description, difficulty, tags, starter_code, test_code, hints, examples, constraints) VALUES
('a0000000-0007-4007-8007-000000000007',
 'Best Time to Buy and Sell Stock',
 'best-time-to-buy-and-sell-stock',
 'You are given an array `prices` where `prices[i]` is the price of a given stock on the `i`th day.

You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.

Return the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return `0`.',
 'easy',
 '{"arrays", "dynamic-programming"}',
 '{"python": "def max_profit(prices):\n    # Your code here\n    pass", "javascript": "function maxProfit(prices) {\n    // Your code here\n}"}',
 '{"python": "# Tests\nresults = []\nresults.append((\"example_1\", max_profit([7,1,5,3,6,4]) == 5))\nresults.append((\"no_profit\", max_profit([7,6,4,3,1]) == 0))\nresults.append((\"single_day\", max_profit([5]) == 0))\nresults.append((\"two_days_profit\", max_profit([1,2]) == 1))\nresults.append((\"increasing\", max_profit([1,2,3,4,5]) == 4))\n\nall_passed = True\nfor name, passed in results:\n    if passed:\n        print(f\"PASS: {name}\")\n    else:\n        print(f\"FAIL: {name} - incorrect result\")\n        all_passed = False\nif all_passed:\n    print(\"ALL_TESTS_PASSED\")", "javascript": "// Tests\nconst results = [];\nresults.push([\"example_1\", maxProfit([7,1,5,3,6,4]) === 5]);\nresults.push([\"no_profit\", maxProfit([7,6,4,3,1]) === 0]);\nresults.push([\"single_day\", maxProfit([5]) === 0]);\nresults.push([\"two_days_profit\", maxProfit([1,2]) === 1]);\nresults.push([\"increasing\", maxProfit([1,2,3,4,5]) === 4]);\n\nlet allPassed = true;\nfor (const [name, passed] of results) {\n    if (passed) console.log(`PASS: ${name}`);\n    else { console.log(`FAIL: ${name} - incorrect result`); allPassed = false; }\n}\nif (allPassed) console.log(\"ALL_TESTS_PASSED\");"}',
 '{"Track the minimum price seen so far", "At each step, calculate profit if you sold today"}',
 '[{"input": "prices = [7,1,5,3,6,4]", "output": "5", "explanation": "Buy on day 2 (price=1) and sell on day 5 (price=6), profit = 6-1 = 5"}, {"input": "prices = [7,6,4,3,1]", "output": "0", "explanation": "No profitable transaction possible"}]',
 '{"1 <= prices.length <= 10^5", "0 <= prices[i] <= 10^4"}');

-- -----------------------------------------------------------------------------
-- 8. Group Anagrams
-- -----------------------------------------------------------------------------
INSERT INTO problems (id, title, slug, description, difficulty, tags, starter_code, test_code, hints, examples, constraints) VALUES
('a0000000-0008-4008-8008-000000000008',
 'Group Anagrams',
 'group-anagrams',
 'Given an array of strings `strs`, group the anagrams together. You can return the answer in any order.

An **anagram** is a word or phrase formed by rearranging the letters of a different word or phrase, using all the original letters exactly once.',
 'medium',
 '{"arrays", "hash-table", "string", "sorting"}',
 '{"python": "def group_anagrams(strs):\n    # Your code here\n    pass", "javascript": "function groupAnagrams(strs) {\n    // Your code here\n}"}',
 '{"python": "# Tests\nresults = []\n\nr1 = group_anagrams([\"eat\",\"tea\",\"tan\",\"ate\",\"nat\",\"bat\"])\nr1_sorted = sorted([sorted(g) for g in r1])\nexpected1 = sorted([sorted(g) for g in [[\"bat\"],[\"nat\",\"tan\"],[\"ate\",\"eat\",\"tea\"]]])\nresults.append((\"example_1\", r1_sorted == expected1))\n\nr2 = group_anagrams([\"\"])\nresults.append((\"empty_string\", r2 == [[\"\"]]))\n\nr3 = group_anagrams([\"a\"])\nresults.append((\"single_char\", r3 == [[\"a\"]]))\n\nall_passed = True\nfor name, passed in results:\n    if passed:\n        print(f\"PASS: {name}\")\n    else:\n        print(f\"FAIL: {name} - incorrect result\")\n        all_passed = False\nif all_passed:\n    print(\"ALL_TESTS_PASSED\")", "javascript": "// Tests\nconst results = [];\n\nlet r1 = groupAnagrams([\"eat\",\"tea\",\"tan\",\"ate\",\"nat\",\"bat\"]);\nlet r1s = r1.map(g => [...g].sort()).sort((a,b) => a[0].localeCompare(b[0]));\nlet e1 = [[\"ate\",\"eat\",\"tea\"],[\"bat\"],[\"nat\",\"tan\"]].map(g => [...g].sort()).sort((a,b) => a[0].localeCompare(b[0]));\nresults.push([\"example_1\", JSON.stringify(r1s) === JSON.stringify(e1)]);\n\nlet r2 = groupAnagrams([\"\"]);\nresults.push([\"empty_string\", JSON.stringify(r2) === JSON.stringify([[\"\"]])]);\n\nlet r3 = groupAnagrams([\"a\"]);\nresults.push([\"single_char\", JSON.stringify(r3) === JSON.stringify([[\"a\"]])]);\n\nlet allPassed = true;\nfor (const [name, passed] of results) {\n    if (passed) console.log(`PASS: ${name}`);\n    else { console.log(`FAIL: ${name} - incorrect result`); allPassed = false; }\n}\nif (allPassed) console.log(\"ALL_TESTS_PASSED\");"}',
 '{"Sort each string to create a key for grouping", "Use a hash map where the key is the sorted string"}',
 '[{"input": "strs = [\"eat\",\"tea\",\"tan\",\"ate\",\"nat\",\"bat\"]", "output": "[[\"bat\"],[\"nat\",\"tan\"],[\"ate\",\"eat\",\"tea\"]]"}, {"input": "strs = [\"\"]", "output": "[[\"\"]]"}, {"input": "strs = [\"a\"]", "output": "[[\"a\"]]"}]',
 '{"1 <= strs.length <= 10^4", "0 <= strs[i].length <= 100", "strs[i] consists of lowercase English letters"}');

-- -----------------------------------------------------------------------------
-- 9. Longest Substring Without Repeating Characters
-- -----------------------------------------------------------------------------
INSERT INTO problems (id, title, slug, description, difficulty, tags, starter_code, test_code, hints, examples, constraints) VALUES
('a0000000-0009-4009-8009-000000000009',
 'Longest Substring Without Repeating Characters',
 'longest-substring-without-repeating-characters',
 'Given a string `s`, find the length of the longest substring without repeating characters.',
 'medium',
 '{"hash-table", "string", "sliding-window"}',
 '{"python": "def length_of_longest_substring(s):\n    # Your code here\n    pass", "javascript": "function lengthOfLongestSubstring(s) {\n    // Your code here\n}"}',
 '{"python": "# Tests\nresults = []\nresults.append((\"example_1\", length_of_longest_substring(\"abcabcbb\") == 3))\nresults.append((\"example_2\", length_of_longest_substring(\"bbbbb\") == 1))\nresults.append((\"example_3\", length_of_longest_substring(\"pwwkew\") == 3))\nresults.append((\"empty\", length_of_longest_substring(\"\") == 0))\nresults.append((\"all_unique\", length_of_longest_substring(\"abcdef\") == 6))\nresults.append((\"spaces\", length_of_longest_substring(\"a b c\") == 3))\n\nall_passed = True\nfor name, passed in results:\n    if passed:\n        print(f\"PASS: {name}\")\n    else:\n        print(f\"FAIL: {name} - incorrect result\")\n        all_passed = False\nif all_passed:\n    print(\"ALL_TESTS_PASSED\")", "javascript": "// Tests\nconst results = [];\nresults.push([\"example_1\", lengthOfLongestSubstring(\"abcabcbb\") === 3]);\nresults.push([\"example_2\", lengthOfLongestSubstring(\"bbbbb\") === 1]);\nresults.push([\"example_3\", lengthOfLongestSubstring(\"pwwkew\") === 3]);\nresults.push([\"empty\", lengthOfLongestSubstring(\"\") === 0]);\nresults.push([\"all_unique\", lengthOfLongestSubstring(\"abcdef\") === 6]);\nresults.push([\"spaces\", lengthOfLongestSubstring(\"a b c\") === 3]);\n\nlet allPassed = true;\nfor (const [name, passed] of results) {\n    if (passed) console.log(`PASS: ${name}`);\n    else { console.log(`FAIL: ${name} - incorrect result`); allPassed = false; }\n}\nif (allPassed) console.log(\"ALL_TESTS_PASSED\");"}',
 '{"Use sliding window technique", "Use a set or map to track characters in the current window"}',
 '[{"input": "s = \"abcabcbb\"", "output": "3", "explanation": "The answer is \"abc\", with length 3"}, {"input": "s = \"bbbbb\"", "output": "1", "explanation": "The answer is \"b\", with length 1"}, {"input": "s = \"pwwkew\"", "output": "3", "explanation": "The answer is \"wke\", with length 3"}]',
 '{"0 <= s.length <= 5 * 10^4", "s consists of English letters, digits, symbols and spaces"}');

-- -----------------------------------------------------------------------------
-- 10. Container With Most Water
-- -----------------------------------------------------------------------------
INSERT INTO problems (id, title, slug, description, difficulty, tags, starter_code, test_code, hints, examples, constraints) VALUES
('a0000000-0010-4010-8010-000000000010',
 'Container With Most Water',
 'container-with-most-water',
 'You are given an integer array `height` of length `n`. There are `n` vertical lines drawn such that the two endpoints of the `i`th line are `(i, 0)` and `(i, height[i])`.

Find two lines that together with the x-axis form a container, such that the container contains the most water.

Return the maximum amount of water a container can store. Notice that you may not slant the container.',
 'medium',
 '{"arrays", "two-pointers", "greedy"}',
 '{"python": "def max_area(height):\n    # Your code here\n    pass", "javascript": "function maxArea(height) {\n    // Your code here\n}"}',
 '{"python": "# Tests\nresults = []\nresults.append((\"example_1\", max_area([1,8,6,2,5,4,8,3,7]) == 49))\nresults.append((\"example_2\", max_area([1,1]) == 1))\nresults.append((\"decreasing\", max_area([5,4,3,2,1]) == 6))\nresults.append((\"same_height\", max_area([3,3,3,3]) == 9))\n\nall_passed = True\nfor name, passed in results:\n    if passed:\n        print(f\"PASS: {name}\")\n    else:\n        print(f\"FAIL: {name} - incorrect result\")\n        all_passed = False\nif all_passed:\n    print(\"ALL_TESTS_PASSED\")", "javascript": "// Tests\nconst results = [];\nresults.push([\"example_1\", maxArea([1,8,6,2,5,4,8,3,7]) === 49]);\nresults.push([\"example_2\", maxArea([1,1]) === 1]);\nresults.push([\"decreasing\", maxArea([5,4,3,2,1]) === 6]);\nresults.push([\"same_height\", maxArea([3,3,3,3]) === 9]);\n\nlet allPassed = true;\nfor (const [name, passed] of results) {\n    if (passed) console.log(`PASS: ${name}`);\n    else { console.log(`FAIL: ${name} - incorrect result`); allPassed = false; }\n}\nif (allPassed) console.log(\"ALL_TESTS_PASSED\");"}',
 '{"Start with the widest container (two pointers at ends)", "Move the pointer pointing to the shorter line inward"}',
 '[{"input": "height = [1,8,6,2,5,4,8,3,7]", "output": "49", "explanation": "Lines at index 1 and 8, area = min(8,7) * (8-1) = 49"}, {"input": "height = [1,1]", "output": "1"}]',
 '{"n == height.length", "2 <= n <= 10^5", "0 <= height[i] <= 10^4"}');

-- -----------------------------------------------------------------------------
-- 11. Three Sum (3Sum)
-- -----------------------------------------------------------------------------
INSERT INTO problems (id, title, slug, description, difficulty, tags, starter_code, test_code, hints, examples, constraints) VALUES
('a0000000-0011-4011-8011-000000000011',
 'Three Sum',
 'three-sum',
 'Given an integer array `nums`, return all the triplets `[nums[i], nums[j], nums[k]]` such that `i != j`, `i != k`, and `j != k`, and `nums[i] + nums[j] + nums[k] == 0`.

Notice that the solution set must not contain duplicate triplets.',
 'medium',
 '{"arrays", "two-pointers", "sorting"}',
 '{"python": "def three_sum(nums):\n    # Your code here\n    pass", "javascript": "function threeSum(nums) {\n    // Your code here\n}"}',
 '{"python": "# Tests\nresults = []\n\nr1 = three_sum([-1,0,1,2,-1,-4])\nr1_sorted = sorted([sorted(t) for t in r1])\nresults.append((\"example_1\", r1_sorted == [[-1,-1,2],[-1,0,1]]))\n\nr2 = three_sum([0,1,1])\nresults.append((\"no_triplet\", r2 == []))\n\nr3 = three_sum([0,0,0])\nresults.append((\"all_zeros\", sorted([sorted(t) for t in r3]) == [[0,0,0]]))\n\nall_passed = True\nfor name, passed in results:\n    if passed:\n        print(f\"PASS: {name}\")\n    else:\n        print(f\"FAIL: {name} - incorrect result\")\n        all_passed = False\nif all_passed:\n    print(\"ALL_TESTS_PASSED\")", "javascript": "// Tests\nconst results = [];\n\nlet r1 = threeSum([-1,0,1,2,-1,-4]);\nlet r1s = r1.map(t => [...t].sort((a,b)=>a-b)).sort((a,b) => a[0]-b[0] || a[1]-b[1]);\nresults.push([\"example_1\", JSON.stringify(r1s) === JSON.stringify([[-1,-1,2],[-1,0,1]])]);\n\nlet r2 = threeSum([0,1,1]);\nresults.push([\"no_triplet\", r2.length === 0]);\n\nlet r3 = threeSum([0,0,0]);\nresults.push([\"all_zeros\", JSON.stringify(r3.map(t=>[...t].sort((a,b)=>a-b))) === JSON.stringify([[0,0,0]])]);\n\nlet allPassed = true;\nfor (const [name, passed] of results) {\n    if (passed) console.log(`PASS: ${name}`);\n    else { console.log(`FAIL: ${name} - incorrect result`); allPassed = false; }\n}\nif (allPassed) console.log(\"ALL_TESTS_PASSED\");"}',
 '{"Sort the array first", "Fix one element and use two pointers for the remaining two", "Skip duplicates to avoid duplicate triplets"}',
 '[{"input": "nums = [-1,0,1,2,-1,-4]", "output": "[[-1,-1,2],[-1,0,1]]"}, {"input": "nums = [0,1,1]", "output": "[]"}, {"input": "nums = [0,0,0]", "output": "[[0,0,0]]"}]',
 '{"3 <= nums.length <= 3000", "-10^5 <= nums[i] <= 10^5"}');

-- -----------------------------------------------------------------------------
-- 12. Binary Search
-- -----------------------------------------------------------------------------
INSERT INTO problems (id, title, slug, description, difficulty, tags, starter_code, test_code, hints, examples, constraints) VALUES
('a0000000-0012-4012-8012-000000000012',
 'Binary Search',
 'binary-search',
 'Given an array of integers `nums` which is sorted in ascending order, and an integer `target`, write a function to search `target` in `nums`. If `target` exists, then return its index. Otherwise, return `-1`.

You must write an algorithm with `O(log n)` runtime complexity.',
 'easy',
 '{"arrays", "binary-search"}',
 '{"python": "def search(nums, target):\n    # Your code here\n    pass", "javascript": "function search(nums, target) {\n    // Your code here\n}"}',
 '{"python": "# Tests\nresults = []\nresults.append((\"found\", search([-1,0,3,5,9,12], 9) == 4))\nresults.append((\"not_found\", search([-1,0,3,5,9,12], 2) == -1))\nresults.append((\"single_found\", search([5], 5) == 0))\nresults.append((\"single_not_found\", search([5], 3) == -1))\nresults.append((\"first_element\", search([1,2,3,4,5], 1) == 0))\nresults.append((\"last_element\", search([1,2,3,4,5], 5) == 4))\n\nall_passed = True\nfor name, passed in results:\n    if passed:\n        print(f\"PASS: {name}\")\n    else:\n        print(f\"FAIL: {name} - incorrect result\")\n        all_passed = False\nif all_passed:\n    print(\"ALL_TESTS_PASSED\")", "javascript": "// Tests\nconst results = [];\nresults.push([\"found\", search([-1,0,3,5,9,12], 9) === 4]);\nresults.push([\"not_found\", search([-1,0,3,5,9,12], 2) === -1]);\nresults.push([\"single_found\", search([5], 5) === 0]);\nresults.push([\"single_not_found\", search([5], 3) === -1]);\nresults.push([\"first_element\", search([1,2,3,4,5], 1) === 0]);\nresults.push([\"last_element\", search([1,2,3,4,5], 5) === 4]);\n\nlet allPassed = true;\nfor (const [name, passed] of results) {\n    if (passed) console.log(`PASS: ${name}`);\n    else { console.log(`FAIL: ${name} - incorrect result`); allPassed = false; }\n}\nif (allPassed) console.log(\"ALL_TESTS_PASSED\");"}',
 '{"Use two pointers: left and right", "Compare the middle element with the target"}',
 '[{"input": "nums = [-1,0,3,5,9,12], target = 9", "output": "4"}, {"input": "nums = [-1,0,3,5,9,12], target = 2", "output": "-1"}]',
 '{"1 <= nums.length <= 10^4", "-10^4 < nums[i], target < 10^4", "All integers in nums are unique", "nums is sorted in ascending order"}');

-- -----------------------------------------------------------------------------
-- 13. Climbing Stairs
-- -----------------------------------------------------------------------------
INSERT INTO problems (id, title, slug, description, difficulty, tags, starter_code, test_code, hints, examples, constraints) VALUES
('a0000000-0013-4013-8013-000000000013',
 'Climbing Stairs',
 'climbing-stairs',
 'You are climbing a staircase. It takes `n` steps to reach the top.

Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?',
 'easy',
 '{"math", "dynamic-programming", "memoization"}',
 '{"python": "def climb_stairs(n):\n    # Your code here\n    pass", "javascript": "function climbStairs(n) {\n    // Your code here\n}"}',
 '{"python": "# Tests\nresults = []\nresults.append((\"n_equals_2\", climb_stairs(2) == 2))\nresults.append((\"n_equals_3\", climb_stairs(3) == 3))\nresults.append((\"n_equals_1\", climb_stairs(1) == 1))\nresults.append((\"n_equals_5\", climb_stairs(5) == 8))\nresults.append((\"n_equals_10\", climb_stairs(10) == 89))\n\nall_passed = True\nfor name, passed in results:\n    if passed:\n        print(f\"PASS: {name}\")\n    else:\n        print(f\"FAIL: {name} - incorrect result\")\n        all_passed = False\nif all_passed:\n    print(\"ALL_TESTS_PASSED\")", "javascript": "// Tests\nconst results = [];\nresults.push([\"n_equals_2\", climbStairs(2) === 2]);\nresults.push([\"n_equals_3\", climbStairs(3) === 3]);\nresults.push([\"n_equals_1\", climbStairs(1) === 1]);\nresults.push([\"n_equals_5\", climbStairs(5) === 8]);\nresults.push([\"n_equals_10\", climbStairs(10) === 89]);\n\nlet allPassed = true;\nfor (const [name, passed] of results) {\n    if (passed) console.log(`PASS: ${name}`);\n    else { console.log(`FAIL: ${name} - incorrect result`); allPassed = false; }\n}\nif (allPassed) console.log(\"ALL_TESTS_PASSED\");"}',
 '{"This is the Fibonacci sequence", "ways(n) = ways(n-1) + ways(n-2)"}',
 '[{"input": "n = 2", "output": "2", "explanation": "1+1 or 2"}, {"input": "n = 3", "output": "3", "explanation": "1+1+1, 1+2, or 2+1"}]',
 '{"1 <= n <= 45"}');

-- -----------------------------------------------------------------------------
-- 14. Rotate Array
-- -----------------------------------------------------------------------------
INSERT INTO problems (id, title, slug, description, difficulty, tags, starter_code, test_code, hints, examples, constraints) VALUES
('a0000000-0014-4014-8014-000000000014',
 'Rotate Array',
 'rotate-array',
 'Given an integer array `nums`, rotate the array to the right by `k` steps, where `k` is non-negative.

Modify the array in-place.',
 'medium',
 '{"arrays", "math", "two-pointers"}',
 '{"python": "def rotate(nums, k):\n    # Modify nums in-place\n    pass", "javascript": "function rotate(nums, k) {\n    // Modify nums in-place\n}"}',
 '{"python": "# Tests\nresults = []\n\nn1 = [1,2,3,4,5,6,7]\nrotate(n1, 3)\nresults.append((\"example_1\", n1 == [5,6,7,1,2,3,4]))\n\nn2 = [-1,-100,3,99]\nrotate(n2, 2)\nresults.append((\"example_2\", n2 == [3,99,-1,-100]))\n\nn3 = [1,2]\nrotate(n3, 3)\nresults.append((\"k_greater_than_len\", n3 == [2,1]))\n\nn4 = [1]\nrotate(n4, 0)\nresults.append((\"no_rotation\", n4 == [1]))\n\nall_passed = True\nfor name, passed in results:\n    if passed:\n        print(f\"PASS: {name}\")\n    else:\n        print(f\"FAIL: {name} - incorrect result\")\n        all_passed = False\nif all_passed:\n    print(\"ALL_TESTS_PASSED\")", "javascript": "// Tests\nconst results = [];\n\nlet n1 = [1,2,3,4,5,6,7];\nrotate(n1, 3);\nresults.push([\"example_1\", JSON.stringify(n1) === JSON.stringify([5,6,7,1,2,3,4])]);\n\nlet n2 = [-1,-100,3,99];\nrotate(n2, 2);\nresults.push([\"example_2\", JSON.stringify(n2) === JSON.stringify([3,99,-1,-100])]);\n\nlet n3 = [1,2];\nrotate(n3, 3);\nresults.push([\"k_greater_than_len\", JSON.stringify(n3) === JSON.stringify([2,1])]);\n\nlet n4 = [1];\nrotate(n4, 0);\nresults.push([\"no_rotation\", JSON.stringify(n4) === JSON.stringify([1])]);\n\nlet allPassed = true;\nfor (const [name, passed] of results) {\n    if (passed) console.log(`PASS: ${name}`);\n    else { console.log(`FAIL: ${name} - incorrect result`); allPassed = false; }\n}\nif (allPassed) console.log(\"ALL_TESTS_PASSED\");"}',
 '{"Use k % length to handle k > array length", "Try the reverse approach: reverse all, reverse first k, reverse rest"}',
 '[{"input": "nums = [1,2,3,4,5,6,7], k = 3", "output": "[5,6,7,1,2,3,4]"}, {"input": "nums = [-1,-100,3,99], k = 2", "output": "[3,99,-1,-100]"}]',
 '{"1 <= nums.length <= 10^5", "-2^31 <= nums[i] <= 2^31 - 1", "0 <= k <= 10^5"}');

-- -----------------------------------------------------------------------------
-- 15. Valid Anagram
-- -----------------------------------------------------------------------------
INSERT INTO problems (id, title, slug, description, difficulty, tags, starter_code, test_code, hints, examples, constraints) VALUES
('a0000000-0015-4015-8015-000000000015',
 'Valid Anagram',
 'valid-anagram',
 'Given two strings `s` and `t`, return `true` if `t` is an anagram of `s`, and `false` otherwise.

An **anagram** is a word formed by rearranging the letters of another word, using all the original letters exactly once.',
 'easy',
 '{"hash-table", "string", "sorting"}',
 '{"python": "def is_anagram(s, t):\n    # Your code here\n    pass", "javascript": "function isAnagram(s, t) {\n    // Your code here\n}"}',
 '{"python": "# Tests\nresults = []\nresults.append((\"valid_anagram\", is_anagram(\"anagram\", \"nagaram\") == True))\nresults.append((\"not_anagram\", is_anagram(\"rat\", \"car\") == False))\nresults.append((\"different_lengths\", is_anagram(\"ab\", \"abc\") == False))\nresults.append((\"empty_strings\", is_anagram(\"\", \"\") == True))\nresults.append((\"same_string\", is_anagram(\"hello\", \"hello\") == True))\n\nall_passed = True\nfor name, passed in results:\n    if passed:\n        print(f\"PASS: {name}\")\n    else:\n        print(f\"FAIL: {name} - incorrect result\")\n        all_passed = False\nif all_passed:\n    print(\"ALL_TESTS_PASSED\")", "javascript": "// Tests\nconst results = [];\nresults.push([\"valid_anagram\", isAnagram(\"anagram\", \"nagaram\") === true]);\nresults.push([\"not_anagram\", isAnagram(\"rat\", \"car\") === false]);\nresults.push([\"different_lengths\", isAnagram(\"ab\", \"abc\") === false]);\nresults.push([\"empty_strings\", isAnagram(\"\", \"\") === true]);\nresults.push([\"same_string\", isAnagram(\"hello\", \"hello\") === true]);\n\nlet allPassed = true;\nfor (const [name, passed] of results) {\n    if (passed) console.log(`PASS: ${name}`);\n    else { console.log(`FAIL: ${name} - incorrect result`); allPassed = false; }\n}\nif (allPassed) console.log(\"ALL_TESTS_PASSED\");"}',
 '{"Count the frequency of each character", "Both strings must have the same character frequencies"}',
 '[{"input": "s = \"anagram\", t = \"nagaram\"", "output": "true"}, {"input": "s = \"rat\", t = \"car\"", "output": "false"}]',
 '{"1 <= s.length, t.length <= 5 * 10^4", "s and t consist of lowercase English letters"}');

-- -----------------------------------------------------------------------------
-- 16. Merge Intervals
-- -----------------------------------------------------------------------------
INSERT INTO problems (id, title, slug, description, difficulty, tags, starter_code, test_code, hints, examples, constraints) VALUES
('a0000000-0016-4016-8016-000000000016',
 'Merge Intervals',
 'merge-intervals',
 'Given an array of `intervals` where `intervals[i] = [start_i, end_i]`, merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.',
 'medium',
 '{"arrays", "sorting"}',
 '{"python": "def merge(intervals):\n    # Your code here\n    pass", "javascript": "function merge(intervals) {\n    // Your code here\n}"}',
 '{"python": "# Tests\nresults = []\n\nresults.append((\"example_1\", merge([[1,3],[2,6],[8,10],[15,18]]) == [[1,6],[8,10],[15,18]]))\nresults.append((\"example_2\", merge([[1,4],[4,5]]) == [[1,5]]))\nresults.append((\"single\", merge([[1,2]]) == [[1,2]]))\nresults.append((\"no_overlap\", merge([[1,2],[3,4],[5,6]]) == [[1,2],[3,4],[5,6]]))\nresults.append((\"all_overlap\", merge([[1,10],[2,5],[3,7]]) == [[1,10]]))\n\nall_passed = True\nfor name, passed in results:\n    if passed:\n        print(f\"PASS: {name}\")\n    else:\n        print(f\"FAIL: {name} - incorrect result\")\n        all_passed = False\nif all_passed:\n    print(\"ALL_TESTS_PASSED\")", "javascript": "// Tests\nconst results = [];\n\nresults.push([\"example_1\", JSON.stringify(merge([[1,3],[2,6],[8,10],[15,18]])) === JSON.stringify([[1,6],[8,10],[15,18]])]);\nresults.push([\"example_2\", JSON.stringify(merge([[1,4],[4,5]])) === JSON.stringify([[1,5]])]);\nresults.push([\"single\", JSON.stringify(merge([[1,2]])) === JSON.stringify([[1,2]])]);\nresults.push([\"no_overlap\", JSON.stringify(merge([[1,2],[3,4],[5,6]])) === JSON.stringify([[1,2],[3,4],[5,6]])]);\nresults.push([\"all_overlap\", JSON.stringify(merge([[1,10],[2,5],[3,7]])) === JSON.stringify([[1,10]])]);\n\nlet allPassed = true;\nfor (const [name, passed] of results) {\n    if (passed) console.log(`PASS: ${name}`);\n    else { console.log(`FAIL: ${name} - incorrect result`); allPassed = false; }\n}\nif (allPassed) console.log(\"ALL_TESTS_PASSED\");"}',
 '{"Sort intervals by start time first", "Compare each interval with the last merged interval"}',
 '[{"input": "intervals = [[1,3],[2,6],[8,10],[15,18]]", "output": "[[1,6],[8,10],[15,18]]", "explanation": "Intervals [1,3] and [2,6] overlap, merge to [1,6]"}, {"input": "intervals = [[1,4],[4,5]]", "output": "[[1,5]]", "explanation": "Intervals [1,4] and [4,5] are considered overlapping"}]',
 '{"1 <= intervals.length <= 10^4", "intervals[i].length == 2", "0 <= start_i <= end_i <= 10^4"}');

-- -----------------------------------------------------------------------------
-- 17. Product of Array Except Self
-- -----------------------------------------------------------------------------
INSERT INTO problems (id, title, slug, description, difficulty, tags, starter_code, test_code, hints, examples, constraints) VALUES
('a0000000-0017-4017-8017-000000000017',
 'Product of Array Except Self',
 'product-of-array-except-self',
 'Given an integer array `nums`, return an array `answer` such that `answer[i]` is equal to the product of all the elements of `nums` except `nums[i]`.

The product of any prefix or suffix of `nums` is guaranteed to fit in a 32-bit integer.

You must write an algorithm that runs in `O(n)` time and without using the division operation.',
 'medium',
 '{"arrays", "prefix-sum"}',
 '{"python": "def product_except_self(nums):\n    # Your code here\n    pass", "javascript": "function productExceptSelf(nums) {\n    // Your code here\n}"}',
 '{"python": "# Tests\nresults = []\nresults.append((\"example_1\", product_except_self([1,2,3,4]) == [24,12,8,6]))\nresults.append((\"example_2\", product_except_self([-1,1,0,-3,3]) == [0,0,9,0,0]))\nresults.append((\"two_elements\", product_except_self([2,3]) == [3,2]))\nresults.append((\"with_ones\", product_except_self([1,1,1,1]) == [1,1,1,1]))\n\nall_passed = True\nfor name, passed in results:\n    if passed:\n        print(f\"PASS: {name}\")\n    else:\n        print(f\"FAIL: {name} - incorrect result\")\n        all_passed = False\nif all_passed:\n    print(\"ALL_TESTS_PASSED\")", "javascript": "// Tests\nconst results = [];\nresults.push([\"example_1\", JSON.stringify(productExceptSelf([1,2,3,4])) === JSON.stringify([24,12,8,6])]);\nresults.push([\"example_2\", JSON.stringify(productExceptSelf([-1,1,0,-3,3])) === JSON.stringify([0,0,9,0,0])]);\nresults.push([\"two_elements\", JSON.stringify(productExceptSelf([2,3])) === JSON.stringify([3,2])]);\nresults.push([\"with_ones\", JSON.stringify(productExceptSelf([1,1,1,1])) === JSON.stringify([1,1,1,1])]);\n\nlet allPassed = true;\nfor (const [name, passed] of results) {\n    if (passed) console.log(`PASS: ${name}`);\n    else { console.log(`FAIL: ${name} - incorrect result`); allPassed = false; }\n}\nif (allPassed) console.log(\"ALL_TESTS_PASSED\");"}',
 '{"Use prefix and suffix products", "First pass: left-to-right prefix products. Second pass: right-to-left suffix products"}',
 '[{"input": "nums = [1,2,3,4]", "output": "[24,12,8,6]"}, {"input": "nums = [-1,1,0,-3,3]", "output": "[0,0,9,0,0]"}]',
 '{"2 <= nums.length <= 10^5", "-30 <= nums[i] <= 30", "Product of any prefix/suffix fits in 32-bit integer"}');

-- -----------------------------------------------------------------------------
-- 18. Merge Two Sorted Lists
-- -----------------------------------------------------------------------------
INSERT INTO problems (id, title, slug, description, difficulty, tags, starter_code, test_code, hints, examples, constraints) VALUES
('a0000000-0018-4018-8018-000000000018',
 'Merge Two Sorted Arrays',
 'merge-two-sorted-arrays',
 'Given two sorted integer arrays `nums1` and `nums2`, return a single sorted array that merges them both.

The merged array should also be sorted in ascending order.',
 'easy',
 '{"arrays", "two-pointers", "sorting"}',
 '{"python": "def merge_sorted(nums1, nums2):\n    # Your code here\n    pass", "javascript": "function mergeSorted(nums1, nums2) {\n    // Your code here\n}"}',
 '{"python": "# Tests\nresults = []\nresults.append((\"example_1\", merge_sorted([1,2,4], [1,3,4]) == [1,1,2,3,4,4]))\nresults.append((\"empty_first\", merge_sorted([], [0]) == [0]))\nresults.append((\"empty_second\", merge_sorted([1], []) == [1]))\nresults.append((\"both_empty\", merge_sorted([], []) == []))\nresults.append((\"no_overlap\", merge_sorted([1,2], [3,4]) == [1,2,3,4]))\n\nall_passed = True\nfor name, passed in results:\n    if passed:\n        print(f\"PASS: {name}\")\n    else:\n        print(f\"FAIL: {name} - incorrect result\")\n        all_passed = False\nif all_passed:\n    print(\"ALL_TESTS_PASSED\")", "javascript": "// Tests\nconst results = [];\nresults.push([\"example_1\", JSON.stringify(mergeSorted([1,2,4], [1,3,4])) === JSON.stringify([1,1,2,3,4,4])]);\nresults.push([\"empty_first\", JSON.stringify(mergeSorted([], [0])) === JSON.stringify([0])]);\nresults.push([\"empty_second\", JSON.stringify(mergeSorted([1], [])) === JSON.stringify([1])]);\nresults.push([\"both_empty\", JSON.stringify(mergeSorted([], [])) === JSON.stringify([])]);\nresults.push([\"no_overlap\", JSON.stringify(mergeSorted([1,2], [3,4])) === JSON.stringify([1,2,3,4])]);\n\nlet allPassed = true;\nfor (const [name, passed] of results) {\n    if (passed) console.log(`PASS: ${name}`);\n    else { console.log(`FAIL: ${name} - incorrect result`); allPassed = false; }\n}\nif (allPassed) console.log(\"ALL_TESTS_PASSED\");"}',
 '{"Use two pointers, one for each array", "Compare elements and add the smaller one to the result"}',
 '[{"input": "nums1 = [1,2,4], nums2 = [1,3,4]", "output": "[1,1,2,3,4,4]"}, {"input": "nums1 = [], nums2 = [0]", "output": "[0]"}]',
 '{"0 <= nums1.length, nums2.length <= 200", "-10^9 <= nums1[i], nums2[i] <= 10^9", "Both arrays are sorted in non-decreasing order"}');

-- -----------------------------------------------------------------------------
-- 19. Trapping Rain Water
-- -----------------------------------------------------------------------------
INSERT INTO problems (id, title, slug, description, difficulty, tags, starter_code, test_code, hints, examples, constraints) VALUES
('a0000000-0019-4019-8019-000000000019',
 'Trapping Rain Water',
 'trapping-rain-water',
 'Given `n` non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.',
 'hard',
 '{"arrays", "two-pointers", "dynamic-programming", "stack"}',
 '{"python": "def trap(height):\n    # Your code here\n    pass", "javascript": "function trap(height) {\n    // Your code here\n}"}',
 '{"python": "# Tests\nresults = []\nresults.append((\"example_1\", trap([0,1,0,2,1,0,1,3,2,1,2,1]) == 6))\nresults.append((\"example_2\", trap([4,2,0,3,2,5]) == 9))\nresults.append((\"no_water\", trap([1,2,3,4,5]) == 0))\nresults.append((\"empty\", trap([]) == 0))\nresults.append((\"flat\", trap([3,3,3]) == 0))\nresults.append((\"valley\", trap([5,0,5]) == 5))\n\nall_passed = True\nfor name, passed in results:\n    if passed:\n        print(f\"PASS: {name}\")\n    else:\n        print(f\"FAIL: {name} - incorrect result\")\n        all_passed = False\nif all_passed:\n    print(\"ALL_TESTS_PASSED\")", "javascript": "// Tests\nconst results = [];\nresults.push([\"example_1\", trap([0,1,0,2,1,0,1,3,2,1,2,1]) === 6]);\nresults.push([\"example_2\", trap([4,2,0,3,2,5]) === 9]);\nresults.push([\"no_water\", trap([1,2,3,4,5]) === 0]);\nresults.push([\"empty\", trap([]) === 0]);\nresults.push([\"flat\", trap([3,3,3]) === 0]);\nresults.push([\"valley\", trap([5,0,5]) === 5]);\n\nlet allPassed = true;\nfor (const [name, passed] of results) {\n    if (passed) console.log(`PASS: ${name}`);\n    else { console.log(`FAIL: ${name} - incorrect result`); allPassed = false; }\n}\nif (allPassed) console.log(\"ALL_TESTS_PASSED\");"}',
 '{"Water at each position = min(maxLeft, maxRight) - height[i]", "Try using two pointers from both ends", "Pre-compute max heights from left and right"}',
 '[{"input": "height = [0,1,0,2,1,0,1,3,2,1,2,1]", "output": "6"}, {"input": "height = [4,2,0,3,2,5]", "output": "9"}]',
 '{"n == height.length", "1 <= n <= 2 * 10^4", "0 <= height[i] <= 10^5"}');

-- -----------------------------------------------------------------------------
-- 20. Median of Two Sorted Arrays
-- -----------------------------------------------------------------------------
INSERT INTO problems (id, title, slug, description, difficulty, tags, starter_code, test_code, hints, examples, constraints) VALUES
('a0000000-0020-4020-8020-000000000020',
 'Median of Two Sorted Arrays',
 'median-of-two-sorted-arrays',
 'Given two sorted arrays `nums1` and `nums2` of size `m` and `n` respectively, return the median of the two sorted arrays.

The overall run time complexity should be `O(log(m+n))`.',
 'hard',
 '{"arrays", "binary-search", "divide-and-conquer"}',
 '{"python": "def find_median_sorted_arrays(nums1, nums2):\n    # Your code here\n    pass", "javascript": "function findMedianSortedArrays(nums1, nums2) {\n    // Your code here\n}"}',
 '{"python": "# Tests\nresults = []\nresults.append((\"example_1\", find_median_sorted_arrays([1,3], [2]) == 2.0))\nresults.append((\"example_2\", find_median_sorted_arrays([1,2], [3,4]) == 2.5))\nresults.append((\"single_elements\", find_median_sorted_arrays([1], [2]) == 1.5))\nresults.append((\"empty_first\", find_median_sorted_arrays([], [1]) == 1.0))\nresults.append((\"empty_second\", find_median_sorted_arrays([2], []) == 2.0))\nresults.append((\"larger_arrays\", find_median_sorted_arrays([1,2,3,4,5], [6,7,8,9,10]) == 5.5))\n\nall_passed = True\nfor name, passed in results:\n    if passed:\n        print(f\"PASS: {name}\")\n    else:\n        print(f\"FAIL: {name} - incorrect result\")\n        all_passed = False\nif all_passed:\n    print(\"ALL_TESTS_PASSED\")", "javascript": "// Tests\nconst results = [];\nresults.push([\"example_1\", findMedianSortedArrays([1,3], [2]) === 2.0]);\nresults.push([\"example_2\", findMedianSortedArrays([1,2], [3,4]) === 2.5]);\nresults.push([\"single_elements\", findMedianSortedArrays([1], [2]) === 1.5]);\nresults.push([\"empty_first\", findMedianSortedArrays([], [1]) === 1.0]);\nresults.push([\"empty_second\", findMedianSortedArrays([2], []) === 2.0]);\nresults.push([\"larger_arrays\", findMedianSortedArrays([1,2,3,4,5], [6,7,8,9,10]) === 5.5]);\n\nlet allPassed = true;\nfor (const [name, passed] of results) {\n    if (passed) console.log(`PASS: ${name}`);\n    else { console.log(`FAIL: ${name} - incorrect result`); allPassed = false; }\n}\nif (allPassed) console.log(\"ALL_TESTS_PASSED\");"}',
 '{"Binary search on the shorter array", "Partition both arrays such that left half has (m+n+1)/2 elements", "Check if the partition is valid: maxLeft1 <= minRight2 and maxLeft2 <= minRight1"}',
 '[{"input": "nums1 = [1,3], nums2 = [2]", "output": "2.0", "explanation": "Merged array = [1,2,3], median is 2.0"}, {"input": "nums1 = [1,2], nums2 = [3,4]", "output": "2.5", "explanation": "Merged array = [1,2,3,4], median is (2+3)/2 = 2.5"}]',
 '{"nums1.length == m", "nums2.length == n", "0 <= m <= 1000", "0 <= n <= 1000", "1 <= m + n <= 2000", "-10^6 <= nums1[i], nums2[i] <= 10^6"}');
