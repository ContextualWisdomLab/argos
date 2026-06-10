## 2024-06-10 - Single-Pass Iteration & Avoiding Intermediate Array Allocations
**Learning:** Using chained array methods (like `.map().reduce()`) or `Object.values().reduce()` creates intermediate arrays and causes unnecessary memory allocation overhead in Node.js/V8, especially when processing large datasets from DB responses.
**Action:** When aggregating large datasets across multiple fields, combine iterations into a single `for` or `for...of` loop and use `Object.keys()` to iterate object properties without creating value arrays.
