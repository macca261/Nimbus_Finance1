import hashlib

def dedupe_key(o: dict) -> str:
    basis = '|'.join([
        o.get('booking_date',''), o.get('value_date',''), str(o.get('amount',0)), o.get('currency',''),
        o.get('counterparty_name',''), o.get('reference',''), o.get('account_id','')
    ])
    return hashlib.sha256(basis.encode('utf-8')).hexdigest()


