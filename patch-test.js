const fs = require('fs');
const filepath = 'packages/web/src/lib/server/csv-helper.test.ts';
let content = fs.readFileSync(filepath, 'utf8');

const replacement = `
  it('prepends a single quote for dangerous characters even with leading whitespace', () => {
    expect(csvField(' =cmd|\\'')).toBe("' =cmd|\\'")
    expect(csvField('   +1+1')).toBe("'   +1+1")
  })
})
`;

// Wait, the previous replacement added an extra }) by mistake? Let's check the content of csv-helper.test.ts
