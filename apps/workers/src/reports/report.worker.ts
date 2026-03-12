// Phase 2: Report Generator Worker
// Generates PDF reports:
// - Executive summary (1-2 pages)
// - Full technical report (detailed)
// - Developer pack (JSON + markdown tasks)

import { Worker } from 'bullmq';
import type { PrismaClient } from '@accessaudit/database';
import type { ConnectionOptions } from 'bullmq';

export const REPORT_QUEUE = 'report';

interface ReportJob {
  scanId: string;
  type: 'EXECUTIVE' | 'TECHNICAL';
}

export function startReportWorker(prisma: PrismaClient, connection: ConnectionOptions) {
  const worker = new Worker<ReportJob>(
    REPORT_QUEUE,
    async (job) => {
      // TODO: Implement in Phase 2
      console.log(`[Report] Phase 2 - Not yet implemented. Job: ${job.id}`);
    },
    { connection, concurrency: 2 },
  );

  return worker;
}
