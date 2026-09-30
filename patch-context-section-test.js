const fs = require('fs');
const path = 'packages/web/src/components/dashboard/reports/context-section.test.tsx';
let content = fs.readFileSync(path, 'utf8');

const newContent = content.replace(
  /const chevronUp = container\.querySelector\('svg\.text-muted-foreground'\)/,
  `const chevronUp = container.querySelector('svg.text-muted-foreground')
    expect(chevronUp).not.toBeNull()`
);

fs.writeFileSync(path, newContent, 'utf8');
