import os
from ultimate_csv.registry import load_profiles

def test_load_profiles():
    base = os.path.join(os.getcwd(), 'tools', 'ultimate-csv', 'common')
    profiles = load_profiles(base)
    assert 'sparkasse' in profiles


