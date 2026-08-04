const iters = 1_000_000;
const d = "2026-06-01T00:00:00Z";

console.time("new Date().getTime()");
for(let i=0; i<iters; i++) {
  new Date(d).getTime();
}
console.timeEnd("new Date().getTime()");

console.time("Date.parse()");
for(let i=0; i<iters; i++) {
  Date.parse(d);
}
console.timeEnd("Date.parse()");
