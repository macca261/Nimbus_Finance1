import json, os
from ultimate_csv.cli import ingest
from ultimate_csv.detect import detect

def test_detect():
    p = os.path.join(os.getcwd(), 'tools', 'ultimate-csv', 'testdata', 'german', 'sparkasse_iso8859-1_semicolon.csv')
    with open(p, 'rb') as f:
        info = detect(f.read())
    assert 'delimiter' in info


