import json

with open('package.json', 'r') as f:
    data = json.load(f)

del data["pnpm"]["overrides"]["deepmerge-ts"]

with open('package.json', 'w') as f:
    json.dump(data, f, indent=2)
