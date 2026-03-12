import { getAnimationKey } from '../src/game/config/skillAnimationMapping.js';

const testCases = [
  { skillId: 'vine_swipe', type: '풀', expected: 'Wind1' },
  { skillId: 'ember_bite', type: '불', expected: 'Fire1' },
  { skillId: 'unknown_skill', type: '불', expected: 'Fire2' },
  { skillId: 'unknown_skill', type: '물', expected: 'Ice2' },
  { skillId: 'unknown_skill', type: 'unknown_type', expected: 'Attack1' },
  { skillId: 'cosmic_roar', type: '신비', expected: 'Special10' },
  { skillId: 'scratch', type: '노말', expected: 'Sword1' }
];

let passed = 0;
testCases.forEach(({ skillId, type, expected }) => {
  const result = getAnimationKey(skillId, type);
  if (result === expected) {
    console.log(`PASS: skillId=${skillId}, type=${type} -> ${result}`);
    passed++;
  } else {
    console.error(`FAIL: skillId=${skillId}, type=${type} -> ${result} (expected ${expected})`);
  }
});

console.log(`\nResults: ${passed}/${testCases.length} passed.`);
if (passed === testCases.length) {
  process.exit(0);
} else {
  process.exit(1);
}
