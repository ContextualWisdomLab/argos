const fs = require('fs');
const path = 'packages/web/src/components/ui/select.test.tsx';
let content = fs.readFileSync(path, 'utf8');

const newContent = content.replace(
  /const chevronIcons = container\.querySelectorAll\('svg\.lucide-chevron-down, svg\.lucide-chevron-up'\)/,
  `const chevronIcons = container.querySelectorAll('svg.lucide-chevron-down, svg.lucide-chevron-up')
    expect(chevronIcons.length).toBeGreaterThan(0)`
);

fs.writeFileSync(path, newContent, 'utf8');
