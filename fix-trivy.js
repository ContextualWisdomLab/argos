const fs = require('fs');
let content = fs.readFileSync('package.json', 'utf8');

content = content.replace(/"baseline-browser-mapping":\s*"\^1.1.2",?\s*/, '"baseline-browser-mapping": "^2.11.25",\n');
content = content.replace(/"sharp":\s*"\^0.33.5",?\s*/, '"sharp": "^0.33.5",\n');

fs.writeFileSync('package.json', content);
