import yaml, os

def load_profiles(base: str):
    with open(os.path.join(base, 'BANK_PROFILES.yaml'), 'r', encoding='utf-8') as f:
        doc = yaml.safe_load(f)
    return doc.get('profiles', {})


