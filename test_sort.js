const n = 100000;
const dates = Array.from({ length: n }, (_, i) => ({ timestamp: new Date(Date.now() + Math.random() * 1000000000).toISOString() }));

console.time('naive');
[...dates].sort((a, b) => Date.parse(a.timestamp) - Date.parse(b.timestamp));
console.timeEnd('naive');

console.time('schwartzian');
[...dates]
  .map(item => ({ item, parsed: Date.parse(item.timestamp) }))
  .sort((a, b) => a.parsed - b.parsed)
  .map(({ item }) => item);
console.timeEnd('schwartzian');
