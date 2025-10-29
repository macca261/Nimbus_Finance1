import sys, json, yaml

REQUIRED = ["profiles"]

def main(path: str):
  with open(path, 'r', encoding='utf-8') as f:
    data = yaml.safe_load(f)
  for k in REQUIRED:
    if k not in data:
      print(f"missing key: {k}")
      sys.exit(1)
  print(json.dumps({"ok": True, "profiles": len(data.get('profiles', {}))}))

if __name__ == '__main__':
  if len(sys.argv) < 2:
    print("usage: validate_profiles.py <BANK_PROFILES.yaml>")
    sys.exit(2)
  main(sys.argv[1])


