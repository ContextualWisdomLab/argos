import fs from 'fs'
import path from 'path'

const journalPath = '.jules/sentinel.md'
const dirPath = path.dirname(journalPath)

if (!fs.existsSync(dirPath)) {
  fs.mkdirSync(dirPath, { recursive: true })
}

const entry = `\n## 2026-06-25 - [Security Improvement] Add HTTP Security Headers in Next.js
**Vulnerability:** Missing strict HTTP security headers (XSS Protection, Frame Options, Transport Security, etc.) in Next.js config.
**Learning:** In Next.js, framework-level security configurations should be added via the \`headers()\` configuration block in \`next.config.ts\`. This provides baseline transport-level protection.
**Prevention:** Ensure \`next.config.ts\` includes the recommended security headers across all routes (\`/(.*)\`) during initial setup.
`

let currentContent = ''
if (fs.existsSync(journalPath)) {
  currentContent = fs.readFileSync(journalPath, 'utf8')
}

fs.writeFileSync(journalPath, currentContent + entry)
console.log('Updated journal')
