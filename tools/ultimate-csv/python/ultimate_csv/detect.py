from typing import Dict

def detect(buf: bytes) -> Dict:
    text = buf[:64*1024].decode('utf-8', errors='ignore')
    counts = {';': text.count(';'), ',': text.count(','), '\t': text.count('\t')}
    delimiter = max(counts, key=counts.get)
    header = text.splitlines()[0] if text else ''
    tokens = [x.strip().upper() for x in header.split(delimiter)]
    return {
        'delimiter': delimiter,
        'encoding': 'utf8',
        'col_count': len(tokens),
        'header_tokens': tokens,
        'fingerprint': hex(hash('|'.join(tokens)))
    }


