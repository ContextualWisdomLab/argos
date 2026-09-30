const v8 = require('v8');

// Configuration
const ROLLUP_COUNT = 10000;
const KEY_COUNT = 50;

// Setup mock data
const mockRollups = [];
for (let i = 0; i < ROLLUP_COUNT; i++) {
  const skillCounts = {};
  const agentCounts = {};
  const modelTokens = {};
  for (let j = 0; j < KEY_COUNT; j++) {
    skillCounts[`skill_${j}`] = Math.floor(Math.random() * 100);
    agentCounts[`agent_${j}`] = Math.floor(Math.random() * 100);
    modelTokens[`model_${j}`] = Math.floor(Math.random() * 100);
  }
  // Add some prototype pollution to ensure Object.hasOwn is exercised
  Object.prototype.polluted = 'test';

  mockRollups.push({
    skillCounts,
    agentCounts,
    modelTokens
  });
}

function aggregateWithObjectKeys() {
  const prev = {
    skillCounts: {},
    agentCounts: {},
    modelTokens: {}
  };

  for (const r of mockRollups) {
    for (const k of Object.keys(r.skillCounts)) {
      prev.skillCounts[k] = (prev.skillCounts[k] ?? 0) + r.skillCounts[k];
    }
    for (const k of Object.keys(r.agentCounts)) {
      prev.agentCounts[k] = (prev.agentCounts[k] ?? 0) + r.agentCounts[k];
    }
    for (const k of Object.keys(r.modelTokens)) {
      prev.modelTokens[k] = (prev.modelTokens[k] ?? 0) + r.modelTokens[k];
    }
  }
  return prev;
}

function aggregateWithForIn() {
  const prev = {
    skillCounts: {},
    agentCounts: {},
    modelTokens: {}
  };

  for (const r of mockRollups) {
    for (const k in r.skillCounts) {
      if (Object.hasOwn(r.skillCounts, k)) {
        prev.skillCounts[k] = (prev.skillCounts[k] ?? 0) + r.skillCounts[k];
      }
    }
    for (const k in r.agentCounts) {
      if (Object.hasOwn(r.agentCounts, k)) {
        prev.agentCounts[k] = (prev.agentCounts[k] ?? 0) + r.agentCounts[k];
      }
    }
    for (const k in r.modelTokens) {
      if (Object.hasOwn(r.modelTokens, k)) {
        prev.modelTokens[k] = (prev.modelTokens[k] ?? 0) + r.modelTokens[k];
      }
    }
  }
  return prev;
}

function runBenchmark() {
  console.log('--- WARMUP ---');
  for (let i = 0; i < 50; i++) {
    aggregateWithObjectKeys();
    aggregateWithForIn();
  }

  if (global.gc) {
      global.gc();
  }

  const iterations = 100;

  console.log('--- Object.keys() ---');
  const startKeysHeap = v8.getHeapStatistics().used_heap_size;
  const startKeysTime = process.hrtime.bigint();
  for (let i = 0; i < iterations; i++) {
    aggregateWithObjectKeys();
  }
  const endKeysTime = process.hrtime.bigint();
  const endKeysHeap = v8.getHeapStatistics().used_heap_size;

  if (global.gc) {
      global.gc();
  }

  console.log('--- for...in ---');
  const startForInHeap = v8.getHeapStatistics().used_heap_size;
  const startForInTime = process.hrtime.bigint();
  for (let i = 0; i < iterations; i++) {
    aggregateWithForIn();
  }
  const endForInTime = process.hrtime.bigint();
  const endForInHeap = v8.getHeapStatistics().used_heap_size;

  delete Object.prototype.polluted;

  console.log('------------------');
  console.log(`Object.keys() time: ${Number(endKeysTime - startKeysTime) / 1e6}ms`);
  console.log(`Object.keys() heap diff: ${(endKeysHeap - startKeysHeap) / 1024 / 1024} MB`);
  console.log(`for...in time: ${Number(endForInTime - startForInTime) / 1e6}ms`);
  console.log(`for...in heap diff: ${(endForInHeap - startForInHeap) / 1024 / 1024} MB`);
}

runBenchmark();
