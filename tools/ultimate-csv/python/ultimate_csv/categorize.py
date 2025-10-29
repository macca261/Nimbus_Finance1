import re

R = re.compile(r"(REWE|LIDL|ALDI|EDEKA|KAUFLAND|PENNY|HIT|DB|DEUTSCHE\s*BAHN|KVB|VRS|SPOTIFY|NETFLIX|PRIME|ICLOUD|MICROSOFT|ADOBE|UBER|LIEFERANDO|WOLT)", re.I)

def categorize(ref: str):
    m = R.search(ref or '')
    if not m:
        return ('Sonstiges', None)
    t = m.group(1).upper()
    if t in ['REWE','LIDL','ALDI','EDEKA','KAUFLAND','PENNY','HIT']:
        return ('Einkaufen', t)
    if t in ['DB','DEUTSCHE BAHN','KVB','VRS']:
        return ('ÖPNV/Bahn', t)
    if t in ['SPOTIFY','NETFLIX','PRIME','ICLOUD','MICROSOFT','ADOBE']:
        return ('Abos', t)
    if t in ['UBER','LIEFERANDO','WOLT']:
        return ('Essen & Lieferung', t)
    return ('Sonstiges', t)


