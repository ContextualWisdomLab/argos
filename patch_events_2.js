const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, 'packages/web/src/app/api/events/route.ts');
let content = fs.readFileSync(filePath, 'utf-8');

// Server-side timestamp validation
content = content.replace(
  /timestamp: new Date\(u\.timestamp\),/g,
  `timestamp: Math.abs(new Date().getTime() - new Date(u.timestamp).getTime()) > 5 * 60 * 1000 ? new Date() : new Date(u.timestamp),`
);

content = content.replace(
  /timestamp: new Date\(m\.timestamp\),/g,
  `timestamp: Math.abs(new Date().getTime() - new Date(m.timestamp).getTime()) > 5 * 60 * 1000 ? new Date() : new Date(m.timestamp),`
);


fs.writeFileSync(filePath, content, 'utf-8');
