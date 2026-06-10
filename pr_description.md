💡 **What:**
Moved the `SKILL_COUNTS_INVALIDATION_AT` condition into the Prisma `findMany` query's `where` clause. Removed the now redundant `if (row.computedAt < SKILL_COUNTS_INVALIDATION_AT) continue` block within the subsequent array iteration.

🎯 **Why:**
The previous implementation pulled stale records from the database into the Node.js memory space, only to immediately filter them out in a for-loop. By pushing this filtering down to the database level, the system operates much more efficiently by reducing database workload, network I/O, and Node.js memory footprint.

📊 **Measured Improvement:**
*Note:* A local test benchmark could not be executed reliably because the project relies on a dummy external database without an active local connection.
However, by pushing the filter down into the Prisma statement (`computedAt: { gte: SKILL_COUNTS_INVALIDATION_AT }`), the database is now strictly returning fresh records before network transmission. This theoretical improvement reduces memory consumption on the API host, speeds up parsing speeds (due to smaller `existing` array response payloads), and eliminates the redundant in-memory filtering iterations over stale data.
