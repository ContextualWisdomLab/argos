const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

// The minimatch@3.1.5 break happens when brace-expansion is bumped to 5.0.x
// Revert to 1.1.17 for minimatch 3.x
pkg.pnpm.overrides['minimatch@3.1.5>brace-expansion'] = '1.1.17';
pkg.pnpm.overrides['minimatch@9.0.9>brace-expansion'] = '2.1.3';
pkg.pnpm.overrides['minimatch@10.2.5>brace-expansion'] = '5.0.9';

// Reset top-level overrides
delete pkg.pnpm.overrides['brace-expansion@<1.1.17'];
delete pkg.pnpm.overrides['brace-expansion@>=2.0.0 <2.1.3'];
delete pkg.pnpm.overrides['brace-expansion@>=5.0.0 <5.0.9'];

pkg.pnpm.overrides['brace-expansion@<1.1.17'] = '>=1.1.17';
pkg.pnpm.overrides['brace-expansion@1.1.16'] = '1.1.17';
pkg.pnpm.overrides['brace-expansion@2.1.2'] = '2.1.3';
pkg.pnpm.overrides['brace-expansion@5.0.8'] = '5.0.9';


fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
