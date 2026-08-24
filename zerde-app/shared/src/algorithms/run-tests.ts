import assert from 'node:assert';
import { calculateEloDelta, getRankByElo, RANKS_CONFIG } from './elo';
import { calculateSM2 } from './sm2';
import { estimateSkillMastery } from './dina';

console.log('🧪 Running @zerde/shared pure algorithm tests...\n');

// 1. ELO Tests
console.log('Testing ELO & Rank thresholds...');
assert.strictEqual(getRankByElo(1050).code, 'OSKIN', '1050 must be OSKIN');
assert.strictEqual(getRankByElo(1199).code, 'OSKIN', '1199 must be OSKIN');
assert.strictEqual(getRankByElo(1200).code, 'TUGYR', '1200 must be TUGYR');
assert.strictEqual(getRankByElo(1399).code, 'TUGYR', '1399 must be TUGYR');
assert.strictEqual(getRankByElo(1400).code, 'QYRAN', '1400 must be QYRAN');
assert.strictEqual(getRankByElo(1420).code, 'QYRAN', '1420 (Azamat) must be QYRAN');
assert.strictEqual(getRankByElo(1599).code, 'QYRAN', '1599 must be QYRAN');
assert.strictEqual(getRankByElo(1600).code, 'SAMGAU', '1600 must be SAMGAU');
assert.strictEqual(getRankByElo(1850).code, 'SAMGAU', '1850 must be SAMGAU');

const eloCorrect = calculateEloDelta({ currentElo: 1400, isCorrect: true, hintsUsed: 0 });
assert.strictEqual(eloCorrect.delta, 10, 'Correct answer should award +10 ELO');
assert.strictEqual(eloCorrect.newElo, 1410, 'New ELO should be 1410');

const eloEureka = calculateEloDelta({ currentElo: 1400, isCorrect: true, isEureka: true });
assert.strictEqual(eloEureka.delta, 15, 'Eureka should award +15 ELO');

const eloJailbreak = calculateEloDelta({ currentElo: 1420, isCorrect: false, isJailbreak: true });
assert.strictEqual(eloJailbreak.delta, -20, 'Anti-Jailbreak should penalize -20 ELO');
assert.strictEqual(eloJailbreak.newElo, 1400, 'New ELO should be 1400');
console.log('✅ ELO & Rank tests passed!');

// 2. SM-2 Tests
console.log('\nTesting SM-2 Spaced Repetition...');
const fixedNow = new Date('2026-08-22T12:00:00Z');
const sm2First = calculateSM2({ interval: 0, repetition: 0, easeFactor: 2.5, grade: 4 }, fixedNow);
assert.strictEqual(sm2First.interval, 1, 'First successful recall interval should be 1');
assert.strictEqual(sm2First.repetition, 1, 'Repetition should be 1');
assert.strictEqual(sm2First.dueDate, '2026-08-23', 'Due date should be next day');

const sm2Second = calculateSM2({ interval: 1, repetition: 1, easeFactor: 2.5, grade: 4 }, fixedNow);
assert.strictEqual(sm2Second.interval, 6, 'Second successful recall interval should be 6');
assert.strictEqual(sm2Second.repetition, 2, 'Repetition should be 2');

const sm2Fail = calculateSM2({ interval: 15, repetition: 4, easeFactor: 2.3, grade: 1 }, fixedNow);
assert.strictEqual(sm2Fail.interval, 1, 'Failed recall interval should reset to 1');
assert.strictEqual(sm2Fail.repetition, 0, 'Repetition count should reset to 0');
console.log('✅ SM-2 tests passed!');

// 3. CDM DINA Tests
console.log('\nTesting CDM DINA Skill Estimation...');
const dinaZero = estimateSkillMastery('ALG_09_ROOTS', []);
assert.strictEqual(dinaZero.probability, 0.5, 'Zero attempts probability should be 0.5');
assert.strictEqual(dinaZero.status, 'in_progress', 'Zero attempts status should be in_progress');

const dinaMastered = estimateSkillMastery('ALG_09_ROOTS', [
  { isCorrect: true },
  { isCorrect: true },
  { isCorrect: true },
  { isCorrect: true },
]);
assert.ok(dinaMastered.probability >= 0.70, 'Consistent correct answers should yield >= 0.70');
assert.strictEqual(dinaMastered.status, 'mastered', 'Status should be mastered');

const dinaDeficit = estimateSkillMastery('ALG_09_ROOTS', [
  { isCorrect: false },
  { isCorrect: false },
  { isCorrect: false },
]);
assert.ok(dinaDeficit.probability < 0.40, 'Repeated failure should yield < 0.40');
assert.strictEqual(dinaDeficit.status, 'deficit', 'Status should be deficit');
console.log('✅ CDM DINA tests passed!');

console.log('\n🎉 ALL @zerde/shared TESTS PASSED SUCCESSFULLY!');
