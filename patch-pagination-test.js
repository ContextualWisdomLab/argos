const fs = require('fs');
const path = 'packages/web/src/components/ui/pagination.test.tsx';
let content = fs.readFileSync(path, 'utf8');

const newContent = content.replace(
  /const chevronIcons = container\.querySelectorAll\('svg\.lucide-chevron-left, svg\.lucide-chevron-right'\)/,
  `const chevronIcons = container.querySelectorAll('svg.lucide-chevron-left, svg.lucide-chevron-right')
    expect(chevronIcons.length).toBeGreaterThan(0)`
);

fs.writeFileSync(path, newContent, 'utf8');
