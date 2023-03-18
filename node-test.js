import fs from 'fs';
import { generateCid } from './multijank.js';

// this file generates a cid for test.move

let rs = fs.createReadStream('./test.mov');
console.log(await generateCid(rs));