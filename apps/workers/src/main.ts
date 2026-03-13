import http from 'http';
import { PrismaClient } from '@accessaudit/database';
import IORedis from 'ioredis';
import { startScannerWorker } from './scanner/scanner.worker';
import { startAggregatorWorker } from './aggregator/aggregator.worker';
import { startRemediationWorker } from './remediation/remediation.worker';

const prisma = new PrismaClient();
function getRedisConnection(): IORedis {
  const redisUrl = process.env.REDIS_URL;
  if (redisUrl) {
    return new IORedis(redisUrl, { maxRetriesPerRequest: null });
  }
  return new IORedis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    maxRetriesPerRequest: null,
  });
}
const redisConnection = getRedisConnection();

async function main() {
  console.log('Starting AccessAudit workers...');

  await prisma.$connect();
  console.log('Database connected');

  const scannerWorker = startScannerWorker(prisma, redisConnection);
  const aggregatorWorker = startAggregatorWorker(prisma, redisConnection);
  const remediationWorker = startRemediationWorker(prisma, redisConnection);

  console.log('All workers started');

  // Health check HTTP server (required for Render free tier Web Service)
  const port = parseInt(process.env.PORT || '10000', 10);
  const server = http.createServer((req, res) => {
    if (req.url === '/health' || req.url === '/') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', workers: ['scanner', 'aggregator', 'remediation'] }));
    } else {
      res.writeHead(404);
      res.end('Not found');
    }
  });
  server.listen(port, () => {
    console.log(`Health check server running on port ${port}`);
  });

  const shutdown = async () => {
    console.log('Shutting down workers...');
    server.close();
    await scannerWorker.close();
    await aggregatorWorker.close();
    await remediationWorker.close();
    await prisma.$disconnect();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((err) => {
  console.error('Worker startup failed:', err);
  process.exit(1);
});
