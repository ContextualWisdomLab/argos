const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

pkg.pnpm.overrides['sharp'] = '0.35.4';
pkg.pnpm.overrides['next'] = '15.5.25';
pkg.pnpm.overrides['deepmerge-ts'] = '8.0.2';
pkg.pnpm.overrides['browserslist'] = '4.28.9';
pkg.pnpm.overrides['baseline-browser-mapping'] = '2.11.22';

fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
