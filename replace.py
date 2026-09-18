import sys
import json

with open("package.json", "r") as f:
    data = json.load(f)

data["pnpm"]["overrides"]["baseline-browser-mapping"] = "^2.10.33"
data["pnpm"]["overrides"]["browserslist"] = "^4.24.0"
data["pnpm"]["overrides"]["deepmerge-ts"] = "^7.1.5"
data["pnpm"]["overrides"]["next"] = "^15.5.22"

with open("package.json", "w") as f:
    json.dump(data, f, indent=2)
