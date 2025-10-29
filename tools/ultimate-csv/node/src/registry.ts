import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';

export type Profile = { encoding?: string; delimiter?: string; date_format?: string; columns: Record<string, string> };

export function loadProfiles(baseDir: string): Record<string, Profile> {
  const p = path.join(baseDir, 'BANK_PROFILES.yaml');
  const doc: any = yaml.load(fs.readFileSync(p, 'utf8'));
  return doc?.profiles || {};
}


