// Phase 2: Crawler Worker
// BFS/priority crawling with:
// - robots.txt respect
// - canonical URL dedup
// - query param rules
// - rate limiting & concurrency
// - sitemap.xml parsing

import { Worker } from 'bullmq';
import type { PrismaClient } from '@accessaudit/database';
import type { ConnectionOptions } from 'bullmq';

export const CRAWL_QUEUE = 'crawl';

interface CrawlJob {
  scanId: string;
  domain: string;
  maxPages: number;
  includePaths?: string[];
  excludePaths?: string[];
}

export function startCrawlerWorker(prisma: PrismaClient, connection: ConnectionOptions) {
  const worker = new Worker<CrawlJob>(
    CRAWL_QUEUE,
    async (job) => {
      // TODO: Implement in Phase 2
      console.log(`[Crawler] Phase 2 - Not yet implemented. Job: ${job.id}`);
    },
    { connection, concurrency: 1 },
  );

  return worker;
}
