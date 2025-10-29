import fs from 'node:fs';
import path from 'node:path';
import { parseBufferToTxs } from '../../packages/csv-core/dist/index.js';

const demoPath = path.join(process.cwd(), 'apps/web/public/demo.csv');
const buf = fs.readFileSync(demoPath);
const res = parseBufferToTxs(buf);
console.log(JSON.stringify({ rows: res.diagnostics.rows, warnings: res.warnings.length, diag: res.diagnostics }, null, 2));


