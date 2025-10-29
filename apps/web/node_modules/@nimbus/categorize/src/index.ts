// packages/categorize/src/index.ts
// Simple, German-aware, deterministic categorizer + merchant normalization

export type CatTx = {
  booking_date: string;
  amount: number;
  reference_raw?: string;
  merchant_id?: string;
};

export type CatOut = CatTx & {
  category?: string;
  subcategory?: string;
  confidence?: number;
  merchant_id?: string;
};

const MERCHANT_ALIASES: Record<string, string> = {
  // Groceries
  "REWE": "REWE", "REWE-MARKT": "REWE", "REWE GROUP": "REWE",
  "LIDL": "LIDL", "LIDL STIFTUNG": "LIDL", "LIDL SAGT DANKE": "LIDL",
  "ALDI": "ALDI", "ALDI SUED": "ALDI", "ALDI SÜD": "ALDI", "ALDI NORD": "ALDI",
  "EDEKA": "EDEKA", "KAUFLAND": "KAUFLAND", "NETTO": "NETTO", "PENNY": "PENNY", "HIT": "HIT",
  // Transit
  "DB": "Deutsche Bahn", "DEUTSCHE BAHN": "Deutsche Bahn", "BAHNCARD": "Deutsche Bahn",
  "KVB": "KVB", "VRS": "VRS",
  // Subscriptions
  "SPOTIFY": "Spotify", "NETFLIX": "Netflix", "AMAZON PRIME": "Prime", "PRIME": "Prime",
  "ICLOUD": "iCloud", "MICROSOFT": "Microsoft", "ADOBE": "Adobe",
  // Insurance / health
  "HAFTPFLICHT": "Haftpflicht", "HAUSRAT": "Hausrat", "KFZ": "KFZ",
  "TECHNIKER": "TK", "TK": "TK", "AOK": "AOK", "DAK": "DAK", "ALLIANZ": "Allianz",
  // Ridehailing / delivery
  "UBER": "Uber", "UBER EATS": "Uber Eats", "UBER*EATS": "Uber Eats", "HELP.UBER.COM": "Uber"
};

// normalize noisy “Buchungstext” into a merchant name
function normalizeMerchant(s?: string): string | undefined {
  if (!s) return undefined;
  let t = s.toUpperCase();

  // strip IBANs and long numbers
  t = t.replace(/[A-Z]{2}\d{2}[A-Z0-9]{10,}/g, " ")
       .replace(/\b[0-9]{8,}\b/g, " ")
       .replace(/\s+/g, " ")
       .trim();

  // common boilerplate to remove
  t = t.replace(/\bKARTENZAHLUNG\b/g, " ")
       .replace(/\bLASTSCHRIFT\b/g, " ")
       .replace(/\bDAUERAUFTRAG\b/g, " ")
       .replace(/\bONLINE-UEBERW\.?\b/g, " ")
       .replace(/\bONLINE-ÜBERW\.?\b/g, " ")
       .replace(/\bSEPA\b/g, " ")
       .replace(/\s+/g, " ")
       .trim();

  // alias hits
  for (const key of Object.keys(MERCHANT_ALIASES)) {
    if (t.includes(key)) return MERCHANT_ALIASES[key];
  }

  // fallback: first all-caps token
  const m = t.match(/[A-ZÄÖÜß][A-ZÄÖÜß]+/);
  return m?.[0];
}

const RX = {
  incomeSalary: /(GEHALT|LOHN|ENTGELT|PAYROLL|SALARY)/i,
  rent: /(MIETE|KALTMIETE|WARM|KVNR\s*MIETE)/i,
  insurance: /(HAFTPFLICHT|HAUSRAT|KFZ|VERSICHERUNG|KRANKENKASSE|AOK|TK|DAK|ALLIANZ)/i,
  transit: /(KVB|VRS|DEUTSCHE\s*BAHN|BAHNCARD|DB\s?NAVIGATOR)/i,
  groceries: /(REWE|EDEKA|LIDL|ALDI|KAUFLAND|NETTO|PENNY|HIT)/i,
  subs: /(SPOTIFY|NETFLIX|PRIME|AMAZON\s*PRIME|ICLOUD|MICROSOFT|ADOBE)/i,
  foodDelivery: /(UBER\s*\*?EATS|LIEFERANDO|WOLT)/i,
};

function catByHeuristics(x: CatTx, merchant?: string): { category?: string; subcategory?: string; confidence?: number } {
  const ref = (x.reference_raw || "").toString();

  if (x.amount > 0 && RX.incomeSalary.test(ref)) {
    return { category: "Einkommen", subcategory: "Gehalt", confidence: 0.95 };
  }

  if (x.amount < 0) {
    if (RX.rent.test(ref)) return { category: "Wohnen", subcategory: "Miete", confidence: 0.9 };
    if (RX.insurance.test(ref)) return { category: "Versicherungen", subcategory: "Versicherung", confidence: 0.8 };
    if (RX.transit.test(ref)) return { category: "ÖPNV/Bahn", subcategory: merchant || "ÖPNV", confidence: 0.8 };
    if (RX.subs.test(ref)) return { category: "Abos", subcategory: merchant || "Abo", confidence: 0.8 };
    if (RX.foodDelivery.test(ref) || (merchant && /UBER EATS|LIEFERANDO|WOLT/i.test(merchant))) {
      return { category: "Essen & Lieferung", subcategory: merchant || "Lieferdienst", confidence: 0.85 };
    }
    if (RX.groceries.test(ref) || (merchant && MERCHANT_ALIASES[merchant.toUpperCase()])) {
      return { category: "Einkaufen", subcategory: merchant || "Supermarkt", confidence: 0.85 };
    }
  }

  return { category: "Sonstiges", subcategory: merchant, confidence: 0.4 };
}

export function categorizeBatch(rows: CatTx[]): CatOut[] {
  return rows.map((r) => {
    const merchant = normalizeMerchant(r.reference_raw) || r.merchant_id;
    const cat = catByHeuristics(r, merchant);
    return {
      ...r,
      merchant_id: merchant,
      category: cat.category,
      subcategory: cat.subcategory,
      confidence: cat.confidence,
    };
  });
}

export function overrideCategory(rows: CatOut[], mapping: Record<string,string>): CatOut[] {
  return rows.map(r => {
    const key = (r.merchant_id || '').toUpperCase();
    if (key && mapping[key]) return { ...r, category: mapping[key], confidence: 0.99 };
    return r;
  });
}
