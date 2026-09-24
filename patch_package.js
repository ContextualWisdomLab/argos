const fs = require('fs')

let file = fs.readFileSync('package.json', 'utf8')
let pkg = JSON.parse(file)

pkg.pnpm.overrides["baseline-browser-mapping"] = ">=1.0.1"
pkg.pnpm.overrides["browserslist"] = ">=4.24.4"
pkg.pnpm.overrides["deepmerge-ts"] = ">=5.1.0"
pkg.pnpm.overrides["next"] = ">=15.1.7"
// sharp is already overridden to ^0.35.3 which might be vulnerable, update it:
pkg.pnpm.overrides["sharp"] = ">=0.33.5" // the vulnerability is in <=0.33.4 usually, we'll just pin high. actually let's pin 0.33.5+

fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2))
