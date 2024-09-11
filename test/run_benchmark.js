import { getAdemeFileJson } from './test-helpers.js';
import { calcul_3cl } from '../src/index.js';
import { hrtime } from 'node:process';

const input = getAdemeFileJson('2494E2362265C');
const start_time = hrtime.bigint();
calcul_3cl(structuredClone(input));
const end_time = hrtime.bigint();

console.log(`Completed in ${(end_time - start_time) / 1000000n} milliseconds`);
