const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

// Delete ALL brace-expansion exact overrides that use string equality
delete pkg.pnpm.overrides['brace-expansion@1.1.16'];
delete pkg.pnpm.overrides['brace-expansion@2.1.2'];
delete pkg.pnpm.overrides['brace-expansion@5.0.8'];
delete pkg.pnpm.overrides['brace-expansion@^1.0.0'];
delete pkg.pnpm.overrides['brace-expansion@^1.1.0'];
delete pkg.pnpm.overrides['brace-expansion@^2.0.0'];
delete pkg.pnpm.overrides['brace-expansion@^5.0.0'];

// Use standard semver vulnerability overrides
pkg.pnpm.overrides['brace-expansion@<1.1.17'] = '>=1.1.17';
pkg.pnpm.overrides['brace-expansion@>=2.0.0 <2.1.3'] = '>=2.1.3';
pkg.pnpm.overrides['brace-expansion@>=5.0.0 <5.0.9'] = '>=5.0.9';


fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
