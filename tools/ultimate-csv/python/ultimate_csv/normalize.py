def to_iso_date(s: str) -> str:
    s = s.strip()
    if len(s) == 10 and s[2] == '.' and s[5] == '.':
        return f"{s[6:10]}-{s[3:5]}-{s[0:2]}"
    return s

def to_number_de(v) -> float:
    if isinstance(v, (int, float)):
        return float(v)
    s = str(v).strip().replace('\u2212','-').replace('€','')
    s = s.replace(' ', '')
    if ',' in s:
        s = s.replace('.', '').replace(',', '.')
    try:
        return float(s)
    except:
        return 0.0


