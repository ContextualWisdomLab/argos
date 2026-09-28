const fs = require('fs');
const path = 'packages/web/src/components/dashboard/reports/context-section.test.tsx';
let content = fs.readFileSync(path, 'utf8');

// Insert new test block after the first test
const newTest = `
  it('includes aria-hidden="true" on decorative icons', () => {
    const { container } = render(
      <ContextSection title="Icon Test" defaultOpen>
        <div>Content</div>
      </ContextSection>
    )

    // Check for ChevronUp icon when open
    const chevronUp = container.querySelector('svg.text-muted-foreground')
    expect(chevronUp).toHaveAttribute('aria-hidden', 'true')
  })
`;

content = content.replace("  it('renders open by default", newTest + "\n  it('renders open by default");
fs.writeFileSync(path, content, 'utf8');
