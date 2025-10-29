import sys, csv, json, hashlib, os
from .detect import detect
from .normalize import to_iso_date, to_number_de
from .categorize import categorize
from .dedupe import dedupe_key

def ingest(buf: bytes):
    info = detect(buf)
    text = buf.decode('utf-8', errors='ignore')
    reader = csv.DictReader(text.splitlines(), delimiter=info['delimiter'])
    for rec in reader:
        ref = rec.get('Verwendungszweck') or rec.get('Merchant') or ''
        amount = to_number_de(rec.get('Betrag') or rec.get('Betrag (EUR)') or rec.get('Amount (EUR)') or '0')
        booking = to_iso_date(rec.get('Buchungstag') or rec.get('Date') or '')
        value = rec.get('Wertstellung') or ''
        value = to_iso_date(value) if value else None
        direction = 'debit' if amount < 0 else 'credit'
        account_id = hashlib.sha256(b'IBAN|BANK|LAST4').hexdigest()
        raw_hash = hashlib.sha256(json.dumps(rec, ensure_ascii=False).encode('utf-8')).hexdigest()
        cat, sub = categorize(ref)
        out = {
            'booking_date': booking,
            'value_date': value,
            'amount': amount,
            'currency': 'EUR',
            'direction': direction,
            'counterparty_name': None,
            'counterparty_iban': None,
            'reference': ref,
            'merchant_id': sub,
            'merchant_name': sub,
            'category': cat,
            'subcategory': sub,
            'account_id': account_id,
            'source': 'csv',
            'raw_hash': raw_hash,
            'is_recurring': False,
            'ingest_notes': []
        }
        print(json.dumps(out, ensure_ascii=False))

def main():
    buf = sys.stdin.buffer.read()
    ingest(buf)

if __name__ == '__main__':
    main()


