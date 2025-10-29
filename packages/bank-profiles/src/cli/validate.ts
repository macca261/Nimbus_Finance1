#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';
import { profileSchema } from '../schema.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const profilesDir = path.resolve(__dirname, '..', '..', 'profiles');

function red(s: string) {
  return `\x1b[31m${s}\x1b[0m`;
}
function green(s: string) {
  return `\x1b[32m${s}\x1b[0m`;
}

let errors = 0;
for (const file of fs.readdirSync(profilesDir)) {
  if (!file.endsWith('.yml') && !file.endsWith('.yaml')) continue;
  const full = path.join(profilesDir, file);
  const raw = fs.readFileSync(full, 'utf8');
  const data = YAML.parse(raw, { prettyErrors: true });
  const res = profileSchema.safeParse(data);
  if (!res.success) {
    errors++;
    console.log(red(`Invalid: ${file}`));
    console.log(res.error.format());
  } else {
    console.log(green(`OK: ${file}`));
  }
}

if (errors > 0) {
  process.exitCode = 1;
}


