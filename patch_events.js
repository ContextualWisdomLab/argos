const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, 'packages/web/src/app/api/events/route.ts');
let content = fs.readFileSync(filePath, 'utf-8');

// 2. Add size limit and rate limiting
const limitAndSizePatch = `
export const config = { api: { bodyParser: { sizeLimit: '1mb' } } }

// POST /api/events
export async function POST(req: Request) {
  try {
    // 1. Request size limit
    const contentLength = req.headers.get('content-length')
    if (contentLength && parseInt(contentLength, 10) > 1024 * 1024) {
      return NextResponse.json({ error: 'Payload too large' }, { status: 413 })
    }
`;

content = content.replace(
  /\/\/ POST \/api\/events\nexport async function POST\(req: Request\) \{\n  try \{/,
  limitAndSizePatch
);

// 3. Fix silent error in after()
content = content.replace(
  /\} catch \{\n          \/\/ 에러 발생해도 무시 \(fire-and-forget\)\n        \}/,
  `} catch (err) {\n          console.error('[Events API] Background processing error:', err)\n        }`
);

fs.writeFileSync(filePath, content, 'utf-8');
