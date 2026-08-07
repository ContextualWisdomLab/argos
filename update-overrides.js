const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

// clean up old overrides
delete pkg.pnpm.overrides['minimatch@3.1.5>brace-expansion'];
delete pkg.pnpm.overrides['minimatch@9.0.9>brace-expansion'];
delete pkg.pnpm.overrides['minimatch@10.2.5>brace-expansion'];
delete pkg.pnpm.overrides['brace-expansion@1.1.16'];
delete pkg.pnpm.overrides['brace-expansion@2.1.2'];
delete pkg.pnpm.overrides['brace-expansion@5.0.8'];

// Set exact versions for brace-expansion ranges
pkg.pnpm.overrides['brace-expansion@^1.0.0'] = '1.1.17';
pkg.pnpm.overrides['brace-expansion@^1.1.0'] = '1.1.17';
pkg.pnpm.overrides['brace-expansion@1.1.16'] = '1.1.17';

pkg.pnpm.overrides['brace-expansion@^2.0.0'] = '2.1.3';
pkg.pnpm.overrides['brace-expansion@2.1.2'] = '2.1.3';

pkg.pnpm.overrides['brace-expansion@^5.0.0'] = '5.0.9';
pkg.pnpm.overrides['brace-expansion@5.0.8'] = '5.0.9';

fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
