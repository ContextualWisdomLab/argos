const fs = require('fs');
const path = 'packages/web/src/components/dashboard/event-list.test.tsx';
let content = fs.readFileSync(path, 'utf8');

// Replace the test implementation to explicitly mock react-window to actually render the Row
const newContent = content.replace(
  /const { container } = render\([\s\S]*?\)\s*\/\/.*/,
  `
    // Mock react-window to always render the items since jsdom layout is tricky
    vi.mock('react-window', async () => {
      const actual = await vi.importActual('react-window');
      return {
        ...actual,
        List: ({ rowCount, rowComponent: Row, rowProps }) => (
          <div>
            {Array.from({ length: rowCount }).map((_, index) => (
              <Row key={index} index={index} style={{}} data={rowProps} {...rowProps} />
            ))}
          </div>
        )
      };
    });

    const { container } = render(
      <div style={{ height: '500px', width: '500px' }}>
        <EventList
          events={[mockEvent, mockEvent]}
          groups={[mockGroup]}
          selectedIdx={-1}
          onSelect={() => {}}
          sessionStartedAt="2023-01-01T12:00:00Z"
          expandedGroups={expandedGroups}
          onToggleGroup={() => {}}
        />
      </div>
    )

    const chevronIcons = container.querySelectorAll('svg.lucide-chevron-right')
    expect(chevronIcons.length).toBeGreaterThan(0)
    chevronIcons.forEach(icon => {
      expect(icon).toHaveAttribute('aria-hidden', 'true')
    })
`
);

fs.writeFileSync(path, newContent, 'utf8');
