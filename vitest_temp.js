import fs from 'fs'

const code = fs.readFileSync('packages/web/src/components/dashboard/session-timeline-chart.tsx', 'utf8')
const testCode = fs.readFileSync('packages/web/src/components/dashboard/session-timeline-chart.test.tsx', 'utf8')
console.log(code)
