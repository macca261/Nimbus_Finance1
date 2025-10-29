import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';

type Rule = { id: string; category: string; subcategory?: string; ref: string };

let rulesCache: Rule[] | null = null;
let aliasCache: Record<string, string> | null = null;

export function loadRules(baseDir: string): { rules: Rule[]; aliases: Record<string, string> } {
  if (!rulesCache || !aliasCache) {
    const rulesPath = path.join(baseDir, 'category_rules.yaml');
    const aliasPath = path.join(baseDir, 'merchant_aliases.yaml');
    const rulesDoc: any = yaml.load(fs.readFileSync(rulesPath, 'utf8'));
    const aliasDoc: any = yaml.load(fs.readFileSync(aliasPath, 'utf8'));
    rulesCache = (rulesDoc?.rules || []) as Rule[];
    aliasCache = aliasDoc?.aliases || {};
  }
  return { rules: rulesCache!, aliases: aliasCache! };
}

export function normalizeMerchant(s?: string, aliases?: Record<string, string>): string | undefined {
  if (!s) return undefined;
  const up = s.toUpperCase();
  const keys = Object.keys(aliases || {});
  for (const k of keys) if (up.includes(k)) return (aliases as any)[k];
  const m = up.match(/[A-ZÄÖÜß][A-ZÄÖÜß]+/);
  return m?.[0];
}

export function categorize(ref: string, merchant?: string, rules?: Rule[]): { category: string; subcategory?: string } {
  if (rules) {
    for (const r of rules) {
      const re = new RegExp(r.ref.replace(/^\//, '').replace(/\/$/, ''), 'i');
      if (re.test(ref) || (merchant && re.test(merchant))) return { category: r.category, subcategory: r.subcategory || merchant };
    }
  }
  return { category: 'Sonstiges', subcategory: merchant };
}


